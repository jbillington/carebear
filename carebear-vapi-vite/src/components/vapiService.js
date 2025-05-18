import Vapi from '@vapi-ai/web';

/**
 * VapiService - A service module to handle VAPI SDK functionality
 */
class VapiService {
  constructor() {
    this.vapi = null;
    this.assistantConfig = null;
    this.callActive = false;
    this.voiceCallActive = false;
    this.isMuted = false;
    this.eventHandlers = {};
  }

  /**
   * Initialize VAPI with API key
   * @param {string} apiKey - The VAPI API key
   * @returns {boolean} - Success status
   */
  initialize(apiKey) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Please enter a valid API key');
    }
    
    // Basic validation
    if (apiKey.length < 10) {
      throw new Error('API key is too short. It should be a long string.');
    }
    
    this.vapi = new Vapi(apiKey);
    return true;
  }

  /**
   * Register core event handlers
   * @param {Object} handlers - Event handler callbacks
   */
  registerEventHandlers(handlers = {}) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized');
    }
    
    this.eventHandlers = handlers;
    
    // Call lifecycle events
    this.vapi.on("call-start", () => {
      this.callActive = true;
      
      if (this.voiceCallActive && handlers.onCallStart) {
        handlers.onCallStart();
      }
      
      if (handlers.onLog) {
        handlers.onLog('✓ Call started');
      }
    });
    
    this.vapi.on("call-end", () => {
      this.callActive = false;
      this.voiceCallActive = false;
      
      if (handlers.onCallEnd) {
        handlers.onCallEnd();
      }
      
      if (handlers.onLog) {
        handlers.onLog('✓ Call ended');
      }
    });
    
    // Speech events
    this.vapi.on("speech-start", () => {
      if (handlers.onSpeechStart) {
        handlers.onSpeechStart();
      }
      
      if (handlers.onLog) {
        handlers.onLog('✓ Assistant speaking');
      }
    });
    
    this.vapi.on("speech-end", () => {
      if (handlers.onSpeechEnd) {
        handlers.onSpeechEnd();
      }
      
      if (handlers.onLog) {
        handlers.onLog('✓ Assistant finished speaking');
      }
    });
    
    // Message events
    this.vapi.on("message", (message) => {
      if (handlers.onMessage) {
        handlers.onMessage(message);
      }
      
      if (handlers.onLog) {
        handlers.onLog(`✓ Message received: ${JSON.stringify(message)}`);
      }
      
      // Handle transcript update
      if (message.type === 'transcript' && message.transcript && handlers.onTranscriptUpdate) {
        handlers.onTranscriptUpdate(message.transcript);
      }
    });
    
    // Error handling
    this.vapi.on("error", (error) => {
      if (handlers.onError) {
        handlers.onError(error);
      }
    });
    
    return true;
  }

  /**
   * Start a voice call with an assistant
   * @param {string} assistantId - The ID of the assistant to call
   * @returns {Promise} - Call result
   */
  async startVoiceCall(assistantId) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized');
    }
    
    if (!assistantId || assistantId.trim() === '') {
      throw new Error('Please enter a valid Assistant ID');
    }
    
    this.voiceCallActive = true;
    return this.vapi.start(assistantId);
  }

  /**
   * Stop the current call
   * @returns {Promise}
   */
  async stopCall() {
    if (!this.vapi) {
      throw new Error('VAPI not initialized');
    }
    
    const result = await this.vapi.stop();
    this.voiceCallActive = false;
    return result;
  }

  /**
   * Toggle mute status
   * @returns {boolean} - New mute status
   */
  toggleMute() {
    if (!this.vapi || !this.voiceCallActive) {
      throw new Error('No active voice call');
    }
    
    this.isMuted = !this.isMuted;
    this.vapi.setMuted(this.isMuted);
    return this.isMuted;
  }

  /**
   * Set mute status explicitly
   * @param {boolean} muted - Mute status to set
   */
  setMute(muted) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized');
    }
    
    this.isMuted = muted;
    this.vapi.setMuted(muted);
    return this.isMuted;
  }

  /**
   * Get current mute status
   * @returns {boolean}
   */
  getMuteStatus() {
    if (!this.vapi) {
      throw new Error('VAPI not initialized');
    }
    
    return this.vapi.isMuted();
  }

  /**
   * Create an assistant configuration
   * @returns {Object} - The created config
   */
  createAssistantConfig() {
    this.assistantConfig = {
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US"
      },
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          }
        ]
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer"
      },
      name: "Test Assistant"
    };
    
    return this.assistantConfig;
  }

  /**
   * Start a call with assistant ID or config
   * @param {string|Object} param - Assistant ID or config
   * @returns {Promise} - API call result
   */
  async startCall(param, apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    if (!param) {
      throw new Error('Please provide an Assistant ID or configuration');
    }
    
    // Prepare request body based on input type
    const requestBody = {};
    
    if (typeof param === 'string') {
      requestBody.assistantId = param;
    } else {
      requestBody.assistant = param;
    }
    
    // Make API call
    const result = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Check for HTTP errors
    if (!result.ok) {
      const statusCode = result.status;
      let errorBody = '';
      
      try {
        errorBody = await result.text();
      } catch (e) {
        errorBody = 'Could not read error response body';
      }
      
      // Create structured error
      const error = new Error(`API Error (${statusCode}): ${errorBody}`);
      error.status = statusCode;
      error.body = errorBody;
      throw error;
    }
    
    return await result.json();
  }

  /**
   * Send a message to the current call
   * @param {string} message - Message to send
   * @returns {Promise}
   */
  async sendMessage(message) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized');
    }
    
    return this.vapi.send({
      type: "add-message",
      message: {
        role: "system",
        content: message
      }
    });
  }

  /**
   * Make the assistant say something
   * @param {string} text - Text to speak
   * @param {boolean} endCall - Whether to end call after speaking
   * @returns {Promise}
   */
  async say(text, endCall = false) {
    if (!this.vapi) {
      throw new Error('VAPI not initialized');
    }
    
    return this.vapi.say(text, endCall);
  }
}

// Export a singleton instance
const vapiService = new VapiService();
export default vapiService; 