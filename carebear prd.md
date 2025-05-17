# Voice AI Agent PRD (Revised)

## Product Overview
**Vision**: Enable persistent, personalized voice interactions that remember user context across sessions  
**MVP Goal**: Validate core voice interaction loop with Deepgram STT/TTS and OpenAI LLM using Vapi orchestration

---

## Technical Stack
| Component         | Tool/Service          | Documentation Links                  |
|-------------------|-----------------------|--------------------------------------|
| Speech-to-Text    | Deepgram Nova         | [Deepgram STT Docs](https://developers.deepgram.com/docs/stt) |
| Text-to-Speech    | Deepgram Aura         | [Deepgram TTS Docs](https://developers.deepgram.com/docs/tts) |
| LLM               | OpenAI GPT-4 Turbo    | [OpenAI API Docs](https://platform.openai.com/docs) |
| Orchestration     | Vapi                  | [Vapi Deepgram Integration](https://docs.vapi.ai/docs/providers/deepgram) |

---

## MVP User Flow
1. User runs local CLI application
2. Application starts Vapi session with Deepgram STT/TTS and OpenAI LLM
3. User interacts through Vapi's web interface
4. Session can be monitored through Vapi dashboard

---

## Key Features
- **Unified Voice Processing**:  
  Deepgram handles both STT (`nova-2`) and TTS (`aura-asteria-en`)  
- **Real-Time Performance**:  
  Vapi manages sub-500ms latency for natural conversations  
- **Session Management**:  
  Vapi provides web interface for monitoring and interaction

---

## MVP Success Criteria
| Metric                  | Target       | Measurement Method       |
|-------------------------|--------------|--------------------------|
| End-to-End Latency      | <1.2s        | Vapi call logs           |
| API Error Rate          | <0.1%        | Vapi dashboard metrics   |

---

## Help Documentation
**Critical Nuances**:
1. Deepgram Voice Requirements:  
```tts_config={"model":"aura-asteria-en", "encoding":"linear16", "container":"wav"}```

2. Vapi Session Handling:  
```call.disconnect() # Required to release mic/speaker```

**Troubleshooting**:
- Audio Device Issues: `vapi doctor audio` command diagnoses mic/speaker configs  
- Latency Spikes: Enable `"enable_seamless":True` in STT config  

---

## Cost Estimates
| Component      | Monthly Cost (20 users) |
|----------------|-------------------------|
| Deepgram       | $48 (2,000 min STT + TTS) |
| OpenAI         | $60 (5k tokens/day)     |
| Vapi           | $0 (Hobby tier)         |

---

## Next Steps
1. Implement local CLI prototype using Vapi
2. Conduct 5-user validation tests
3. Iterate on conversation flow based on feedback

---

## Phase 2: Memory Integration
### Technical Additions
| Component         | Tool/Service          | Documentation Links                  |
|-------------------|-----------------------|--------------------------------------|
| Memory Storage    | Mem0                  | [Mem0 API Docs](https://sdk.vercel.ai/providers/community-providers/mem0) |

### Enhanced User Flow
1. User speaks request → Deepgram STT converts to text  
2. Vapi sends text + Mem0 context → OpenAI LLM  
3. LLM response → Deepgram TTS converts to speech  
4. Mem0 saves conversation history  

### Memory Features
- **Persistent Context**:  
  Mem0 stores conversation history with vector search
- **Memory Optimization**:  
  Store only last 3 messages in Mem0 during initial phase
- **Memory Recall Accuracy**:  
  Target >90% accuracy in manual test scenarios

### Phase 2 Success Criteria
| Metric                  | Target       | Measurement Method       |
|-------------------------|--------------|--------------------------|
| Memory Recall Accuracy  | >90%         | Manual test scenarios    |
| Context Persistence     | >24h         | Session retention tests  |

## Helpful Links
Vapi Quickstart https://docs.vapi.ai/docs/quickstart

Deepgram STT API https://developers.deepgram.com/docs/
https://deepgram.com/learn/introducing-ai-voice-agent-api

OpenAI API  https://platform.openai.com/docs/ 

## Nuances
API Keys: Set these as environment variables for security.

Audio Devices: Vapi handles audio routing; local browser/mic setup may be required.

Session Handling: Vapi's session object manages the conversation state.

Error Handling: Add try/except blocks for API/network errors in production.