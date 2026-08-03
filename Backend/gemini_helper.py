import os
import json
from google import genai
from dotenv import load_dotenv
import PIL.Image

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_frame_with_gemini(frame_path, athlete_name):
    prompt = f"""Analyze this video frame for signs of AI manipulation or deepfake technology.
The person in this video is claimed to be {athlete_name}.
Respond ONLY in this exact format with nothing else:
MANIPULATED: yes or no
CONFIDENCE: number from 0 to 100
ATHLETE_MATCH: yes or no or unsure
REASON: one sentence explanation"""

    img = PIL.Image.open(frame_path)

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[prompt, img]
            )
            text = response.text.strip().split('\n')
            res = {}
            for line in text:
                if ':' in line:
                    k, v = line.split(':', 1)
                    res[k.strip().lower()] = v.strip().lower()

            if 'manipulated' in res and 'confidence' in res:
                return {
                    "manipulated": res.get("manipulated", "no"),
                    "confidence": int(res.get("confidence", "0").replace('%', '')),
                    "athlete_match": res.get("athlete_match", "unsure"),
                    "reason": res.get("reason", "")
                }
        except Exception as e:
            if attempt == 1:
                return {"manipulated": "no", "confidence": 0, "athlete_match": "unsure", "reason": str(e)}

    return {"manipulated": "no", "confidence": 0, "athlete_match": "unsure", "reason": "Failed to parse."}

def generate_formal_report(frame_results, final_score, verdict, athlete_name):
    prompt = f"""Write a formal multi-paragraph evidence report for DeepTrace, a sports deepfake detection platform.
Subject: {athlete_name}
Final Authenticity Score: {final_score}/100
Verdict: {verdict}
Frame Results: {json.dumps(frame_results)}

Include: summary of findings, frame analysis, verdict explanation, confidence assessment, recommended next steps."""

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error generating report: {str(e)}"