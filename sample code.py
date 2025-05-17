import os
import requests
import json

# Environment variables for API keys
VAPI_API_KEY = os.getenv("VAPI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Vapi API endpoint (replace with actual endpoint from your Vapi dashboard)
VAPI_BASE_URL = "https://api.vapi.ai/v1"  # Example endpoint

def start_voice_session():
    """
    Start a voice session with Vapi using Deepgram for STT/TTS and OpenAI for LLM.
    """
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "stt": {
            "provider": "deepgram",
            "config": {
                "api_key": DEEPGRAM_API_KEY,
                "model": "nova-2",
                "language": "en"
            }
        },
        "tts": {
            "provider": "deepgram",
            "config": {
                "api_key": DEEPGRAM_API_KEY,
                "model": "aura-asteria-en",
                "encoding": "linear16",
                "container": "wav"
            }
        },
        "llm": {
            "provider": "openai",
            "config": {
                "api_key": OPENAI_API_KEY,
                "model": "gpt-4-turbo"
            }
        }
    }

    # Start session
    response = requests.post(f"{VAPI_BASE_URL}/sessions", headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        session_data = response.json()
        print("Session started. Session ID:", session_data["session_id"])
        return session_data["session_id"]
    else:
        print("Failed to start session:", response.text)
        return None

def main():
    session_id = start_voice_session()
    if not session_id:
        return

    print("Speak into your microphone. (Interaction handled by Vapi’s web UI or endpoint)")
    print(f"Monitor your session in the Vapi dashboard: https://dashboard.vapi.ai/sessions/{session_id}")

if __name__ == "__main__":
    main()
