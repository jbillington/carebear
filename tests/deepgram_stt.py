import os
import requests

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not DEEPGRAM_API_KEY:
    raise ValueError("DEEPGRAM_API_KEY environment variable not set")

response = requests.post(
    "https://api.deepgram.com/v1/listen",
    headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
    json={"url": "https://static.deepgram.com/examples/interview_speech.wav"},
    params={"punctuate": True, "language": "en"}
)

if response.status_code == 200:
    transcript = response.json()["results"]["channels"][0]["alternatives"][0]["transcript"]
    print("✅ Deepgram STT Working | Transcript:", transcript[:50] + "...")
else:
    print("❌ Deepgram STT Failed | Status:", response.status_code, "| Response:", response.text)
