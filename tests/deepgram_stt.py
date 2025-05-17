import os
import requests
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not DEEPGRAM_API_KEY:
    raise ValueError("DEEPGRAM_API_KEY environment variable not set")

response = requests.post(
    "https://api.deepgram.com/v1/listen",
    headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
    json={"url": "https://archive.org/download/15EnglishLessonsForConversationalEnglish/English%20lessons%20for%20Daily%20life%20-%20Dialogues%20and%20Conversations%20-%20Intermediate%20Level.mp3"},
    params={"punctuate": "true", "language": "en"}
)

if response.status_code == 200:
    transcript = response.json()["results"]["channels"][0]["alternatives"][0]["transcript"]
    print("✅ Deepgram STT Working | Transcript:", transcript[:50] + "...")
else:
    print("❌ Deepgram STT Failed | Status:", response.status_code, "| Response:", response.text)
