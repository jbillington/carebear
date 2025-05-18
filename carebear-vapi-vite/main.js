import Vapi from '@vapi-ai/web';

// No default keys - user must provide their own
let vapi = null;
let assistantConfig = null;
let callActive = false;
let voiceCallActive = false;
let isMuted = false;

// Logging functions
const log = (message, isError = false) => {
  const logDiv = document.getElementById('log');
  const logEntry = document.createElement('div');
  logEntry.innerHTML = message;
  logEntry.className = isError ? 'error' : 'success';
  logDiv.appendChild(logEntry);
  logDiv.scrollTop = logDiv.scrollHeight;
};

const updateStatus = (message, isError = false) => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = isError ? 'status error' : 'status';
  
  if (!isError && message.includes('Listening')) {
    statusEl.classList.add('listening');
  } else {
    statusEl.classList.remove('listening');
  }
};

const updateTranscript = (text) => {
  const transcriptEl = document.getElementById('transcript');
  transcriptEl.textContent = text || 'Transcript will appear here...';
};

const clearLogs = () => {
  const logDiv = document.getElementById('log');
  // Keep only the header
  logDiv.innerHTML = '<h3>Test Logs:</h3>';
};

const logError = async (err) => {
  console.error('Vapi error:', err);
  
  // Handle Response objects (fetch API errors)
  if (err instanceof Response) {
    let body = '';
    try {
      body = await err.text();
      try {
        // Try to parse as JSON for better formatting
        const jsonBody = JSON.parse(body);
        body = JSON.stringify(jsonBody, null, 2);
      } catch {}
    } catch {}
    log(`Error: Response status ${err.status} ${err.statusText}<br>Body: <pre>${body}</pre>`, true);
    return;
  }
  
  // Handle error objects with response property (axios-like errors)
  if (err && err.response) {
    const status = err.response.status;
    let detail = '';
    
    try {
      if (err.response.data) {
        if (typeof err.response.data === 'object') {
          detail = JSON.stringify(err.response.data, null, 2);
        } else {
          detail = err.response.data;
        }
      }
    } catch {}
    
    log(`Error: Response status ${status}<br>Detail: <pre>${detail || 'No details available'}</pre>`, true);
    return;
  }
  
  // Standard error objects
  if (err && typeof err === 'object') {
    if (err.message) {
      log(`✗ ${err.message}`, true);
    } else {
      log(`✗ ${JSON.stringify(err, null, 2)}`, true);
    }
    return;
  }
  
  // Fallback for string or other primitive errors
  log(`✗ ${err}`, true);
};

// Step 1: Initialize VAPI
document.getElementById('init-btn').addEventListener('click', () => {
  try {
    clearLogs();
    const apiKeyInput = document.getElementById('api-key-input').value;
    
    if (!apiKeyInput || apiKeyInput.trim() === '') {
      throw new Error('Please enter a valid API key');
    }
    
    // Basic validation
    if (apiKeyInput.length < 10) {
      throw new Error('API key is too short. It should be a long string.');
    }
    
    vapi = new Vapi(apiKeyInput);
    log('✓ VAPI initialization successful');
    
    // Register event handlers
    vapi.on('call-start', () => {
      log('✓ Call started');
      callActive = true;
      
      if (voiceCallActive) {
        updateStatus('Listening...');
      }
    });
    
    vapi.on('call-end', () => {
      log('✓ Call ended');
      callActive = false;
      voiceCallActive = false;
      
      // Reset voice UI
      document.getElementById('start-voice-btn').disabled = false;
      document.getElementById('stop-voice-btn').disabled = true;
      document.getElementById('toggle-mute-btn').disabled = true;
      document.getElementById('toggle-mute-btn').textContent = 'Mute';
      
      updateStatus('Call ended');
    });
    
    vapi.on('speech-start', () => {
      log('✓ Assistant speaking');
      updateStatus('Assistant speaking...');
    });
    
    vapi.on('speech-end', () => {
      log('✓ Assistant finished speaking');
      if (voiceCallActive) {
        updateStatus('Listening...');
      }
    });
    
    vapi.on('error', (err) => {
      logError(err);
      console.error('SDK error event:', err);
    });
    
    vapi.on('message', (msg) => {
      log(`✓ Message received: ${JSON.stringify(msg)}`);
      console.log('Message event:', msg);
      
      // If message contains a transcript, update the transcript display
      if (msg.type === 'transcript' && msg.transcript) {
        updateTranscript(msg.transcript);
      }
    });
    
    // Enable voice conversation buttons
    document.getElementById('start-voice-btn').disabled = false;
    updateStatus('Ready to start conversation');
    
    // Success message
    log('✓ VAPI SDK initialized successfully and events registered');
  } catch (error) {
    logError(error);
  }
});

// Step 2: Voice Conversation
document.getElementById('start-voice-btn').addEventListener('click', async () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    const assistantId = document.getElementById('assistant-id-input').value.trim();
    if (!assistantId) {
      throw new Error('Please enter a valid Assistant ID');
    }
    
    // Update UI
    updateStatus('Starting voice call...');
    document.getElementById('start-voice-btn').disabled = true;
    document.getElementById('stop-voice-btn').disabled = false;
    document.getElementById('toggle-mute-btn').disabled = false;
    
    // Clear transcript
    updateTranscript('');
    
    log(`Starting voice call with assistant ID: ${assistantId}`);
    voiceCallActive = true;
    
    try {
      const call = await vapi.start(assistantId);
      log(`✓ Voice call started successfully with ID: ${call.id}`);
    } catch (error) {
      voiceCallActive = false;
      document.getElementById('start-voice-btn').disabled = false;
      document.getElementById('stop-voice-btn').disabled = true;
      document.getElementById('toggle-mute-btn').disabled = true;
      updateStatus('Failed to start voice call', true);
      throw error;
    }
  } catch (error) {
    logError(error);
  }
});

document.getElementById('stop-voice-btn').addEventListener('click', async () => {
  try {
    if (!vapi || !voiceCallActive) {
      throw new Error('No active voice call to stop.');
    }
    
    updateStatus('Ending voice call...');
    
    try {
      await vapi.stop();
      log('✓ Voice call stopped successfully');
      voiceCallActive = false;
      
      // Reset UI
      document.getElementById('start-voice-btn').disabled = false;
      document.getElementById('stop-voice-btn').disabled = true;
      document.getElementById('toggle-mute-btn').disabled = true;
      updateStatus('Voice call ended');
    } catch (error) {
      updateStatus('Failed to stop voice call', true);
      throw error;
    }
  } catch (error) {
    logError(error);
  }
});

document.getElementById('toggle-mute-btn').addEventListener('click', () => {
  try {
    if (!vapi || !voiceCallActive) {
      throw new Error('No active voice call.');
    }
    
    isMuted = !isMuted;
    vapi.setMuted(isMuted);
    
    const muteBtn = document.getElementById('toggle-mute-btn');
    muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    
    log(`✓ Microphone ${isMuted ? 'muted' : 'unmuted'}`);
    updateStatus(`Microphone ${isMuted ? 'muted' : 'unmuted'}`);
  } catch (error) {
    logError(error);
  }
});

// Step 3: Test Assistant Configuration
document.getElementById('config-btn').addEventListener('click', () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    assistantConfig = {
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
    log('✓ Assistant configuration created successfully');
    log(`<pre>${JSON.stringify(assistantConfig, null, 2)}</pre>`);
  } catch (error) {
    logError(error);
  }
});

// Step 4: Start a Call (API Test)
document.getElementById('start-btn').addEventListener('click', async () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    const assistantIdInput = document.getElementById('call-assistant-id-input').value;
    
    // Determine what to use for the call
    let callParam = null;
    
    if (assistantIdInput && assistantIdInput.trim() !== '') {
      callParam = assistantIdInput;
      log(`Using assistant ID: ${callParam}`);
    } else if (assistantConfig) {
      callParam = assistantConfig;
      log('Using assistant configuration for call');
      console.log('Using configuration:', callParam);
    } else {
      throw new Error('Please either enter an Assistant ID or create an Assistant Configuration');
    }
    
    log('Starting call, please wait...');
    
    // Use the try/catch pattern but inside a Promise to better handle async errors
    const result = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${document.getElementById('api-key-input').value}`
      },
      body: JSON.stringify({
        assistantId: typeof callParam === 'string' ? callParam : undefined,
        assistant: typeof callParam === 'string' ? undefined : callParam
      })
    });
    
    // Check for HTTP errors first
    if (!result.ok) {
      const statusCode = result.status;
      let errorBody = '';
      
      try {
        errorBody = await result.text();
      } catch (e) {
        errorBody = 'Could not read error response body';
      }
      
      if (statusCode === 401) {
        log(`✗ Authentication error (401): Your API key is invalid or expired.`, true);
        log(`To fix this:
        1. Get a valid API key from <a href="https://dashboard.vapi.ai/account" target="_blank">Vapi Dashboard</a>
        2. Make sure you're using a valid API key (check for typos)
        3. If you recently created your API key, it might take a few minutes to activate`, true);
        return;
      } else if (statusCode === 404) {
        log(`✗ Not found error (404): The specified assistant ID "${assistantIdInput}" could not be found.`, true);
        return;
      } else {
        log(`✗ API Error (${statusCode}): ${errorBody}`, true);
        return;
      }
    }
    
    // Parse the response only if we got a successful response
    const callData = await result.json();
    
    // Safety check for the response
    if (!callData || !callData.id) {
      log(`✗ Invalid response from API: Missing call ID`, true);
      console.error('Invalid API response:', callData);
      return;
    }
    
    // Success case
    log(`✓ Call started successfully with ID: ${callData.id}`);
    
  } catch (error) {
    // This catches programming errors or network issues
    console.error('Error starting call:', error);
    logError(error);
  }
});

// Step 5: Send a Message
document.getElementById('send-btn').addEventListener('click', async () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    const message = document.getElementById('message-input').value;
    await vapi.send({
      type: "add-message",
      message: {
        role: "system",
        content: message
      }
    });
    log(`✓ Message sent successfully: "${message}"`);
  } catch (error) {
    logError(error);
  }
});

// Step 6: Test Mute Controls
document.getElementById('mute-btn').addEventListener('click', () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    vapi.setMuted(true);
    log('✓ Microphone muted');
  } catch (error) {
    logError(error);
  }
});

document.getElementById('unmute-btn').addEventListener('click', () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    vapi.setMuted(false);
    log('✓ Microphone unmuted');
  } catch (error) {
    logError(error);
  }
});

document.getElementById('check-mute-btn').addEventListener('click', () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    const isMuted = vapi.isMuted();
    log(`Current mute status: ${isMuted ? 'Muted' : 'Unmuted'}`);
  } catch (error) {
    logError(error);
  }
});

// Step 7: Test Say Functionality
document.getElementById('say-btn').addEventListener('click', async () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    const text = document.getElementById('say-input').value;
    await vapi.say(text, false);
    log(`✓ Successfully requested assistant to say: "${text}"`);
  } catch (error) {
    logError(error);
  }
});

document.getElementById('say-end-btn').addEventListener('click', async () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    const text = document.getElementById('say-input').value;
    await vapi.say(text, true);
    log(`✓ Successfully requested assistant to say and end call: "${text}"`);
  } catch (error) {
    logError(error);
  }
});

// Step 8: Register Event Handlers
document.getElementById('events-btn').addEventListener('click', () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    // Reset any existing handlers by recreating the vapi instance
    const currentApiKey = document.getElementById('api-key-input').value;
    if (!currentApiKey || currentApiKey.trim() === '') {
      throw new Error('API key is missing. Please enter it in the "Step 1" section.');
    }
    
    vapi = new Vapi(currentApiKey);
    
    // Speech events
    vapi.on("speech-start", () => {
      log('✓ Speech start event received');
    });
    
    vapi.on("speech-end", () => {
      log('✓ Speech end event received');
    });
    
    // Call lifecycle events
    vapi.on("call-start", () => {
      log('✓ Call start event received');
    });
    
    vapi.on("call-end", () => {
      log('✓ Call end event received');
    });
    
    // Volume and message events
    vapi.on("volume-level", (volume) => {
      // Don't log every volume event to avoid flooding
      console.log(`Volume level: ${volume}`);
    });
    
    vapi.on("message", (message) => {
      log(`✓ Message event received: ${JSON.stringify(message)}`);
    });
    
    // Error handling
    vapi.on("error", (error) => {
      logError(error);
    });
    
    log('✓ Event handlers registered successfully');
  } catch (error) {
    logError(error);
  }
});

// Step 9: Stop the Call
document.getElementById('stop-btn').addEventListener('click', async () => {
  try {
    if (!vapi) {
      throw new Error('VAPI not initialized. Please initialize the SDK first.');
    }
    
    await vapi.stop();
    log('✓ Call stopped successfully');
  } catch (error) {
    logError(error);
  }
});

// Clear logs on page load
window.addEventListener('DOMContentLoaded', () => {
  clearLogs();
  log('Please enter your API key and click "Initialize SDK" to begin');
}); 