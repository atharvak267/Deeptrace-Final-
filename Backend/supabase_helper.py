import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def update_scan_status(scan_id, status):
    supabase.table("scans").update({"status": status}).eq("id", scan_id).execute()

def update_scan_results(scan_id, score, verdict, manipulation_type, heatmap_urls, report_text, pdf_url):
    supabase.table("scans").update({
        "score": score,
        "verdict": verdict,
        "manipulation_type": manipulation_type,
        "heatmap_urls": heatmap_urls,
        "report_text": report_text,
        "pdf_url": pdf_url,
        "status": "complete"
    }).eq("id", scan_id).execute()

def set_scan_failed(scan_id, error_message):
    supabase.table("scans").update({
        "status": "failed",
        "error_message": error_message
    }).eq("id", scan_id).execute()

def upload_file(bucket, path, file_bytes, content_type):
    supabase.storage.from_(bucket).upload(
        path=path,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "true"}
    )
    result = supabase.storage.from_(bucket).get_public_url(path)
    return result

def get_athlete_subscribers(athlete_name):
    result = supabase.table("athletes").select("fcm_tokens").ilike("name", f"%{athlete_name}%").execute()
    tokens = []
    for row in result.data:
        if row.get("fcm_tokens"):
            tokens.extend([t.strip() for t in row["fcm_tokens"].split(",") if t.strip()])
    return tokens