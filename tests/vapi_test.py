import os
import requests
import json

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([VAPI_API_KEY, DEEPGRAM_API_KEY, OPENAI_API_KEY]):
    raise ValueError("Missing one or more API keys")

response = requests.post(
    "https://api.vapi.ai/v1/sessions",
    headers={"Authorization": f"Bearer {VAPI_API_KEY}", "Content-Type": "application/json"},
    data=json.dumps({
        "stt": {
            "provider": "deepgram",
            "config": {"api_key": DEEPGRAM_API_KEY, "model": "nova-2"}
        },
        "tts": {
            "provider": "deepgram",
            "config": {"api_key": DEEPGRAM_API_KEY, "model": "aura-asteria-en"}
        },
        "llm": {
            "provider": "openai",
            "config": {"api_key": OPENAI_API_KEY, "model": "gpt-4-turbo"}
        }
    })
)

if response.status_code == 200:
    print("✅ Vapi Session Created | ID:", response.json()["sessionId"])
else:
    print("❌ Vapi Failed | Status:", response.status_code, "| Response:", response.text)
