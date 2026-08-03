import cv2
import numpy as np

def get_deepface_score(frame_path):
    """
    Lightweight face analysis using OpenCV instead of DeepFace.
    Analyzes facial symmetry and texture inconsistencies as deepfake signals.
    """
    try:
        img = cv2.imread(frame_path)
        if img is None:
            return 0.0

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)

        if len(faces) == 0:
            return 0.0

        suspicion_scores = []

        for (x, y, w, h) in faces:
            face_region = gray[y:y+h, x:x+w]

            # Signal 1 — Noise inconsistency (deepfakes often have unnatural smoothness)
            laplacian_var = cv2.Laplacian(face_region, cv2.CV_64F).var()
            noise_score = max(0, min(100, (1 - (laplacian_var / 500)) * 100))

            # Signal 2 — Symmetry analysis (AI faces are often too symmetric)
            left_half = face_region[:, :w//2]
            right_half = cv2.flip(face_region[:, w//2:], 1)
            min_width = min(left_half.shape[1], right_half.shape[1])
            symmetry_diff = np.mean(np.abs(
                left_half[:, :min_width].astype(float) -
                right_half[:, :min_width].astype(float)
            ))
            symmetry_score = max(0, min(100, (1 - (symmetry_diff / 50)) * 60))

            # Signal 3 — Edge consistency (deepfake boundaries are often blurry)
            edges = cv2.Canny(face_region, 50, 150)
            edge_density = np.sum(edges > 0) / (w * h)
            edge_score = max(0, min(100, (1 - edge_density * 10) * 40))

            frame_suspicion = (noise_score * 0.4 + symmetry_score * 0.4 + edge_score * 0.2)
            suspicion_scores.append(frame_suspicion)

        return float(np.mean(suspicion_scores)) if suspicion_scores else 0.0

    except Exception:
        return 0.0
