import os
import requests

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not DEEPGRAM_API_KEY:
    raise ValueError("DEEPGRAM_API_KEY environment variable not set")

response = requests.post(
    "https://api.deepgram.com/v1/tts",
    headers={"Authorization": f"Token {DEEPGRAM_API_KEY}", "Content-Type": "application/json"},
    json={
        "text": "This is a test of Deepgram text-to-speech.",
        "voice": "aura-asteria-en",
        "format": "wav"
    }
)

if response.status_code == 200:
    print("✅ Deepgram TTS Working | Received", len(response.content), "bytes of audio")
else:
    print("❌ Deepgram TTS Failed | Status:", response.status_code, "| Response:", response.text)
