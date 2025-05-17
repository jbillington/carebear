import os
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

client = OpenAI(api_key=OPENAI_API_KEY)

response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "Say 'Hello World'"}]
)

if response.choices[0].message.content:
    print("✅ OpenAI Working | Response:", response.choices[0].message.content)
else:
    print("❌ OpenAI Failed")
