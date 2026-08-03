import os
import shutil
import cv2
import yt_dlp
from supabase_helper import update_scan_status, update_scan_results, set_scan_failed, upload_file, get_athlete_subscribers
from deepface_helper import get_deepface_score
from gemini_helper import analyze_frame_with_gemini, generate_formal_report
from heatmap_helper import generate_heatmap
from report_generator import create_pdf_report

def run_pipeline(scan_id, video_url, athlete_name):
    temp_dir = f"temp/{scan_id}"
    try:
        update_scan_status(scan_id, "processing")
        os.makedirs(temp_dir, exist_ok=True)
        
        update_scan_status(scan_id, "downloading")
        video_path = os.path.join(temp_dir, "video.mp4")
        import time

        ydl_opts = {
            'outtmpl': video_path,
            'format': 'worst',
            'quiet': True,
            'no_warnings': True,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        }

        # Retry up to 3 times
        for attempt in range(3):
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([video_url])
                break
            except Exception as e:
                if attempt < 2:
                    time.sleep(5)
                else:
                    raise e
            
        update_scan_status(scan_id, "extracting")
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0 or fps != fps:
            fps = 30
            
        frame_count = 0
        extracted_frames = []
        while cap.isOpened() and len(extracted_frames) < 150:
            ret, frame = cap.read()
            if not ret:
                break
            if int(cap.get(cv2.CAP_PROP_POS_FRAMES)) % int(fps) == 0:
                frame_path = os.path.join(temp_dir, f"frame_{frame_count}.jpg")
                cv2.imwrite(frame_path, frame)
                extracted_frames.append(frame_path)
                frame_count += 1
        cap.release()
        
        update_scan_status(scan_id, "detecting")
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        face_frames = []
        for frame_path in extracted_frames:
            img = cv2.imread(frame_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            if len(faces) > 0:
                face_frames.append(frame_path)
                
        frames_to_process = face_frames[:10] if len(face_frames) > 0 else extracted_frames[:10]
        
        update_scan_status(scan_id, "deepface")
        frame_results = []
        for frame_path in frames_to_process:
            df_score = get_deepface_score(frame_path)
            frame_results.append({
                "path": frame_path,
                "deepface_score": df_score
            })
            
        update_scan_status(scan_id, "gemini")
        total_weight = 0
        df_highest_score = 0
        gemini_flagged_mouth = False
        
        for res in frame_results:
            g_res = analyze_frame_with_gemini(res["path"], athlete_name)
            res["gemini_manipulated"] = g_res.get("manipulated", "no") == "yes"
            res["gemini_reason"] = g_res.get("reason", "")
            
            if res["deepface_score"] > df_highest_score:
                df_highest_score = res["deepface_score"]
                
            if "lip" in res["gemini_reason"].lower() or "mouth" in res["gemini_reason"].lower():
                gemini_flagged_mouth = True
                
            df_flag = res["deepface_score"] > 50
            g_flag = res["gemini_manipulated"]
            
            if df_flag and g_flag:
                weight = 1.0
            elif g_flag:
                weight = 0.7
            elif df_flag:
                weight = 0.4
            else:
                weight = 0.0
            res["weight"] = weight
            total_weight += weight
            
        avg_weight = total_weight / len(frame_results) if frame_results else 0
        final_score = int(100 - (avg_weight * 100))
        
        if final_score >= 70:
            verdict = "AUTHENTIC"
        elif final_score >= 40:
            verdict = "SUSPICIOUS"
        else:
            verdict = "DEEPFAKE"
            
        if verdict == "AUTHENTIC":
            manipulation_type = "none"
        else:
            if df_highest_score > 70 and gemini_flagged_mouth:
                manipulation_type = "full_synthesis"
            elif gemini_flagged_mouth:
                manipulation_type = "lip_sync"
            else:
                manipulation_type = "face_swap"
                
        update_scan_status(scan_id, "heatmap")
        sorted_frames = sorted(frame_results, key=lambda x: x["weight"], reverse=True)
        top_3_frames = [x["path"] for x in sorted_frames[:3]]
        
        heatmap_urls = []
        for i, frame_path in enumerate(top_3_frames):
            hm_path = os.path.join(temp_dir, f"heatmap_{i}.jpg")
            if generate_heatmap(frame_path, hm_path):
                with open(hm_path, "rb") as f:
                    url = upload_file("heatmaps", f"{scan_id}/heatmap_frame_{i+1}.jpg", f.read(), "image/jpeg")
                    heatmap_urls.append(url)
                    
        update_scan_status(scan_id, "report")
        clean_frame_results = [{"deepface_score": x["deepface_score"], "gemini_manipulated": x["gemini_manipulated"], "reason": x["gemini_reason"]} for x in frame_results]
        report_text = generate_formal_report(clean_frame_results, final_score, verdict, athlete_name)
        
        pdf_bytes = create_pdf_report(report_text)
        
        pdf_url = upload_file("reports", f"{scan_id}/evidence_report.pdf", pdf_bytes, "application/pdf")
        
        heatmap_urls_str = ",".join(heatmap_urls)
        update_scan_results(scan_id, final_score, verdict, manipulation_type, heatmap_urls_str, report_text, pdf_url)
        
        if verdict == "DEEPFAKE":
            subscribers = get_athlete_subscribers(athlete_name)
            if subscribers:
                # Mock sending FCM
                print(f"Sending FCM to {len(subscribers)} subscribers for {athlete_name}")
                
    except Exception as e:
        set_scan_failed(scan_id, str(e))
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
