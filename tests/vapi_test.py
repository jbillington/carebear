import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
ASSISTANT_ID = "4df97e94-5cbf-4841-b19e-158a53cb9901"  

if not VAPI_API_KEY:
    raise ValueError("VAPI_API_KEY environment variable not set")

response = requests.post(
    "https://api.vapi.ai/call",
    headers={"Authorization": f"Bearer {VAPI_API_KEY}", "Content-Type": "application/json"},
    json={
        "assistant": ASSISTANT_ID
    }
)

if response.status_code == 201:
    print("✅ Vapi Call Created | Response:", response.json())
else:
    print("❌ Vapi Call Failed | Status:", response.status_code, "| Response:", response.text)
