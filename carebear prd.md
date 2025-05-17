# Voice AI Agent PRD (Revised)

## Product Overview
**Vision**: Enable persistent, personalized voice interactions that remember user context across sessions, with secure authentication and memory (Mem0).

**Current MVP Goal**: Quickly validate Vapi Web SDK integration in a simple web page—user can speak to a Vapi-powered assistant in the browser and get a spoken response. (No memory, no authentication, no backend yet.)

---

## Technical Stack
| Component         | Tool/Service          | Documentation Links                  |
|-------------------|-----------------------|--------------------------------------|
| Web SDK           | Vapi Web SDK          | [Vapi Web SDK Docs](https://docs.vapi.ai/docs/web-sdk) |
| Voice Agent       | Vapi Assistant        | [Vapi Dashboard](https://dashboard.vapi.ai/) |
| Speech-to-Text    | Deepgram Nova         | [Deepgram STT Docs](https://developers.deepgram.com/docs/stt) |
| (Optional) TTS    | Deepgram Aura         | [Deepgram TTS Docs](https://developers.deepgram.com/docs/tts) |
| (Future) Memory   | Mem0                  | [Mem0 API Docs](https://sdk.vercel.ai/providers/community-providers/mem0) |
| (Future) Auth     | TBD                   |                                      |

---

## MVP User Flow (Current Milestone)
1. User visits a simple HTML/JS web page.
2. User clicks a "Start Call" button to begin a voice conversation with the assistant (in-browser, no phone number required).
3. The assistant responds in real time (voice in, voice out).
4. UI displays call status and live transcript for debugging.
5. User can end the call with a "Stop Call" button.

---

## Key Features (Current MVP)
- Minimal UI: Start/Stop call buttons, call status, and transcript display.
- Real-time, browser-based voice interaction (no phone number required).
- Debug info: Show connection status, errors, and live transcript.
- All assistant logic (LLM, STT, TTS, prompt) configured in Vapi dashboard.
- **Deepgram as Core STT**: Deepgram Nova provides real-time, accurate speech-to-text for the assistant, orchestrated by Vapi. Optionally, Deepgram Aura can be used for TTS.

---

## MVP Success Criteria
| Metric                  | Target       | Measurement Method       |
|-------------------------|--------------|--------------------------|
| Voice round-trip        | <2s          | Manual test (speak & hear response) |
| Transcript appears      | Yes          | UI shows live transcript |
| Error handling          | Yes          | UI shows errors if any   |

---

## Setup Steps (Current MVP)
1. **Create and configure an assistant in the Vapi dashboard**
   - Set LLM (e.g., OpenAI GPT-4), STT (Deepgram Nova), TTS (Deepgram Aura or other), system prompt, and first message.
2. **Get your Vapi Web Token** from the dashboard.
3. **Create a simple HTML/JS page**:
   - Add Vapi Web SDK via npm or CDN.
   - Add Start/Stop call buttons and transcript area.
   - Initialize Vapi SDK with your Web Token.
   - Wire up buttons to start/stop calls and display transcript/status.
4. **Test:**
   - Open the page, click Start Call, and verify you can speak and get a response.
   - Check transcript and debug info in the UI.

---

## Long-Term Roadmap (Future Phases)
### Phase 2: Memory Integration
| Component         | Tool/Service          | Documentation Links                  |
|-------------------|-----------------------|--------------------------------------|
| Memory Storage    | Mem0                  | [Mem0 API Docs](https://sdk.vercel.ai/providers/community-providers/mem0) |

#### Enhanced User Flow
1. User logs in (authentication added)
2. User speaks request → Deepgram STT converts to text  
3. Vapi sends text + Mem0 context → OpenAI LLM  
4. LLM response → Deepgram TTS converts to speech  
5. Mem0 saves conversation history  

#### Memory Features
- **Persistent Context**:  
  Mem0 stores conversation history with vector search
- **Memory Optimization**:  
  Store only last 3 messages in Mem0 during initial phase
- **Memory Recall Accuracy**:  
  Target >90% accuracy in manual test scenarios

#### Phase 2 Success Criteria
| Metric                  | Target       | Measurement Method       |
|-------------------------|--------------|--------------------------|
| Memory Recall Accuracy  | >90%         | Manual test scenarios    |
| Context Persistence     | >24h         | Session retention tests  |

---

## Deepgram Overview (Reference)
Deepgram is a leading AI company specializing in advanced speech recognition and transcription technology. Their Nova model provides fast, accurate, and scalable speech-to-text for real-time and batch applications. Deepgram's audio intelligence features (sentiment, intent, topic detection) can be leveraged in future phases for richer user context and analytics. Deepgram is integrated via the Vapi dashboard—no need to call Deepgram APIs directly from your web app.

---

## Helpful Links
- [Vapi Web SDK Docs](https://docs.vapi.ai/docs/web-sdk)
- [Vapi Dashboard](https://dashboard.vapi.ai/)
- [Deepgram STT Docs](https://developers.deepgram.com/docs/stt)
- [Deepgram TTS Docs](https://developers.deepgram.com/docs/tts)
- [Mem0 API Docs](https://sdk.vercel.ai/providers/community-providers/mem0)

---

## Nuances
- API keys/tokens: Use your Vapi Web Token in the frontend (safe for public use).
- All assistant logic is managed in the Vapi dashboard, not in the web app.
- Debug UI should show connection status, errors, and transcript for troubleshooting.
- Future phases will add authentication, persistent memory, and user context.