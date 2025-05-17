import os
import requests
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not DEEPGRAM_API_KEY:
    raise ValueError("DEEPGRAM_API_KEY environment variable not set")

response = requests.post(
    "https://api.deepgram.com/v1/speak",
    headers={"Authorization": f"Token {DEEPGRAM_API_KEY}", "Content-Type": "application/json"},
    json={
        "text": "This is a test of Deepgram text-to-speech.  I will be your care bear!  How are you?"
    }
)

print("Headers:", response.headers)
print("First 100 bytes:", response.content[:100])

if response.status_code == 200:
    print("✅ Deepgram TTS Working | Received", len(response.content), "bytes of audio")
    with open("output.wav", "wb") as f:
        f.write(response.content)
    print("Audio saved as output.wav")
else:
    print("❌ Deepgram TTS Failed | Status:", response.status_code, "| Response:", response.text)
