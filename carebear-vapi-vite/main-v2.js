import vapiService from './src/components/vapiService';
import uiManager from './src/components/uiManager';
import './src/styles/main.css';

// DOM Elements
let elements = {};
let testControlButtons = {};
let voiceControlButtons = {};

/**
 * Initialize the application
 */
function initApp() {
  // Initialize UI elements
  cacheElements();
  
  // Set up event listeners
  addEventListeners();
  
  // Initialize UI manager
  uiManager.initialize({
    statusElement: elements.status,
    transcriptElement: elements.transcript,
    logElement: elements.log
  });
  
  // Clear logs and set initial state
  uiManager.clearLogs();
  uiManager.log('Please enter your API key and click "Initialize SDK" to begin');
  uiManager.updateStatus('Ready to initialize');
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  // Main UI elements
  elements.status = document.getElementById('status');
  elements.transcript = document.getElementById('transcript');
  elements.log = document.getElementById('log');
  
  // Voice control elements
  voiceControlButtons.apiKeyInput = document.getElementById('api-key-input');
  voiceControlButtons.assistantIdInput = document.getElementById('assistant-id-input');
  voiceControlButtons.startButton = document.getElementById('start-voice-btn');
  voiceControlButtons.stopButton = document.getElementById('stop-voice-btn');
  voiceControlButtons.muteButton = document.getElementById('toggle-mute-btn');
  voiceControlButtons.initButton = document.getElementById('init-btn');
  
  // Test control buttons
  testControlButtons.configBtn = document.getElementById('config-btn');
  testControlButtons.startBtn = document.getElementById('start-btn');
  testControlButtons.callAssistantIdInput = document.getElementById('call-assistant-id-input');
  testControlButtons.messageInput = document.getElementById('message-input');
  testControlButtons.sendBtn = document.getElementById('send-btn');
  testControlButtons.muteBtn = document.getElementById('mute-btn');
  testControlButtons.unmuteBtn = document.getElementById('unmute-btn');
  testControlButtons.checkMuteBtn = document.getElementById('check-mute-btn');
  testControlButtons.sayInput = document.getElementById('say-input');
  testControlButtons.sayBtn = document.getElementById('say-btn');
  testControlButtons.sayEndBtn = document.getElementById('say-end-btn');
  testControlButtons.eventsBtn = document.getElementById('events-btn');
  testControlButtons.stopBtn = document.getElementById('stop-btn');
}

/**
 * Add event listeners to UI elements
 */
function addEventListeners() {
  // Initialize VAPI SDK
  if (voiceControlButtons.initButton) {
    voiceControlButtons.initButton.addEventListener('click', initializeVapi);
  }
  
  // Voice call controls
  if (voiceControlButtons.startButton) {
    voiceControlButtons.startButton.addEventListener('click', startVoiceCall);
  }
  
  if (voiceControlButtons.stopButton) {
    voiceControlButtons.stopButton.addEventListener('click', stopVoiceCall);
  }
  
  if (voiceControlButtons.muteButton) {
    voiceControlButtons.muteButton.addEventListener('click', toggleMute);
  }
  
  // Test controls
  if (testControlButtons.configBtn) {
    testControlButtons.configBtn.addEventListener('click', createConfig);
  }
  
  if (testControlButtons.startBtn) {
    testControlButtons.startBtn.addEventListener('click', startCall);
  }
  
  if (testControlButtons.sendBtn) {
    testControlButtons.sendBtn.addEventListener('click', sendMessage);
  }
  
  if (testControlButtons.muteBtn) {
    testControlButtons.muteBtn.addEventListener('click', () => setMute(true));
  }
  
  if (testControlButtons.unmuteBtn) {
    testControlButtons.unmuteBtn.addEventListener('click', () => setMute(false));
  }
  
  if (testControlButtons.checkMuteBtn) {
    testControlButtons.checkMuteBtn.addEventListener('click', checkMuteStatus);
  }
  
  if (testControlButtons.sayBtn) {
    testControlButtons.sayBtn.addEventListener('click', () => say(false));
  }
  
  if (testControlButtons.sayEndBtn) {
    testControlButtons.sayEndBtn.addEventListener('click', () => say(true));
  }
  
  if (testControlButtons.eventsBtn) {
    testControlButtons.eventsBtn.addEventListener('click', registerEvents);
  }
  
  if (testControlButtons.stopBtn) {
    testControlButtons.stopBtn.addEventListener('click', stopCall);
  }
}

/**
 * Initialize VAPI SDK
 */
async function initializeVapi() {
  try {
    uiManager.clearLogs();
    
    const apiKeyInput = voiceControlButtons.apiKeyInput.value;
    
    vapiService.initialize(apiKeyInput);
    
    // Register core event handlers
    vapiService.registerEventHandlers({
      onLog: (msg) => uiManager.log(msg),
      onError: (err) => uiManager.logError(err),
      onCallStart: () => {
        if (vapiService.voiceCallActive) {
          uiManager.updateStatus('Listening...');
        }
      },
      onCallEnd: () => {
        // Reset voice UI
        uiManager.updateVoiceButtonStates({
          startButton: voiceControlButtons.startButton,
          stopButton: voiceControlButtons.stopButton,
          muteButton: voiceControlButtons.muteButton
        }, false);
        
        uiManager.updateStatus('Call ended');
      },
      onSpeechStart: () => {
        uiManager.updateStatus('Assistant speaking...');
      },
      onSpeechEnd: () => {
        if (vapiService.voiceCallActive) {
          uiManager.updateStatus('Listening...');
        }
      },
      onMessage: (msg) => {
        console.log('Message event:', msg);
      },
      onTranscriptUpdate: (transcript) => {
        uiManager.updateTranscript(transcript);
      }
    });
    
    // Enable voice conversation buttons
    voiceControlButtons.startButton.disabled = false;
    uiManager.updateStatus('Ready to start conversation');
    
    // Success message
    uiManager.log('✓ VAPI SDK initialized successfully and events registered');
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Start a voice call
 */
async function startVoiceCall() {
  try {
    const assistantId = voiceControlButtons.assistantIdInput.value.trim();
    
    // Update UI
    uiManager.updateStatus('Starting voice call...');
    uiManager.updateVoiceButtonStates({
      startButton: voiceControlButtons.startButton,
      stopButton: voiceControlButtons.stopButton,
      muteButton: voiceControlButtons.muteButton
    }, true);
    
    // Clear transcript
    uiManager.updateTranscript('');
    
    uiManager.log(`Starting voice call with assistant ID: ${assistantId}`);
    
    try {
      const call = await vapiService.startVoiceCall(assistantId);
      uiManager.log(`✓ Voice call started successfully with ID: ${call.id}`);
    } catch (error) {
      // Reset UI on error
      uiManager.updateVoiceButtonStates({
        startButton: voiceControlButtons.startButton,
        stopButton: voiceControlButtons.stopButton,
        muteButton: voiceControlButtons.muteButton
      }, false);
      
      uiManager.updateStatus('Failed to start voice call', true);
      throw error;
    }
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Stop the voice call
 */
async function stopVoiceCall() {
  try {
    uiManager.updateStatus('Ending voice call...');
    
    try {
      await vapiService.stopCall();
      uiManager.log('✓ Voice call stopped successfully');
      
      // UI will be reset by the call-end event handler
    } catch (error) {
      uiManager.updateStatus('Failed to stop voice call', true);
      throw error;
    }
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Toggle mute status
 */
function toggleMute() {
  try {
    const isMuted = vapiService.toggleMute();
    
    uiManager.updateMuteButtonText(voiceControlButtons.muteButton, isMuted);
    uiManager.log(`✓ Microphone ${isMuted ? 'muted' : 'unmuted'}`);
    uiManager.updateStatus(`Microphone ${isMuted ? 'muted' : 'unmuted'}`);
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Set mute status explicitly
 */
function setMute(mute) {
  try {
    vapiService.setMute(mute);
    uiManager.log(`✓ Microphone ${mute ? 'muted' : 'unmuted'}`);
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Check current mute status
 */
function checkMuteStatus() {
  try {
    const isMuted = vapiService.getMuteStatus();
    uiManager.log(`Current mute status: ${isMuted ? 'Muted' : 'Unmuted'}`);
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Create an assistant configuration
 */
function createConfig() {
  try {
    const config = vapiService.createAssistantConfig();
    uiManager.log('✓ Assistant configuration created successfully');
    uiManager.log(`<pre>${JSON.stringify(config, null, 2)}</pre>`);
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Start a call using the API
 */
async function startCall() {
  try {
    const assistantIdInput = testControlButtons.callAssistantIdInput.value;
    
    // Determine what to use for the call
    let callParam = null;
    
    if (assistantIdInput && assistantIdInput.trim() !== '') {
      callParam = assistantIdInput;
      uiManager.log(`Using assistant ID: ${callParam}`);
    } else if (vapiService.assistantConfig) {
      callParam = vapiService.assistantConfig;
      uiManager.log('Using assistant configuration for call');
      console.log('Using configuration:', callParam);
    } else {
      throw new Error('Please either enter an Assistant ID or create an Assistant Configuration');
    }
    
    uiManager.log('Starting call, please wait...');
    
    try {
      const result = await vapiService.startCall(
        callParam, 
        voiceControlButtons.apiKeyInput.value
      );
      
      uiManager.log(`✓ Call started successfully with ID: ${result.id}`);
    } catch (error) {
      if (error.status === 401) {
        uiManager.log(`✗ Authentication error (401): Your API key is invalid or expired.`, true);
        uiManager.log(`To fix this:
        1. Get a valid API key from <a href="https://dashboard.vapi.ai/account" target="_blank">Vapi Dashboard</a>
        2. Make sure you're using a valid API key (check for typos)
        3. If you recently created your API key, it might take a few minutes to activate`, true);
      } else if (error.status === 404) {
        uiManager.log(`✗ Not found error (404): The specified assistant ID "${assistantIdInput}" could not be found.`, true);
      } else {
        throw error;
      }
    }
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Send a message to the active call
 */
async function sendMessage() {
  try {
    const message = testControlButtons.messageInput.value;
    await vapiService.sendMessage(message);
    uiManager.log(`✓ Message sent successfully: "${message}"`);
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Make the assistant say something
 */
async function say(endCall = false) {
  try {
    const text = testControlButtons.sayInput.value;
    await vapiService.say(text, endCall);
    uiManager.log(`✓ Successfully requested assistant to say${endCall ? ' and end call' : ''}: "${text}"`);
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Register event handlers (for testing)
 */
function registerEvents() {
  try {
    const currentApiKey = voiceControlButtons.apiKeyInput.value;
    
    // Re-initialize VAPI to reset handlers
    vapiService.initialize(currentApiKey);
    
    // Register all event handlers
    vapiService.registerEventHandlers({
      onLog: (msg) => uiManager.log(msg),
      onError: (err) => uiManager.logError(err),
      onCallStart: () => uiManager.log('✓ Call start event received'),
      onCallEnd: () => uiManager.log('✓ Call end event received'),
      onSpeechStart: () => uiManager.log('✓ Speech start event received'),
      onSpeechEnd: () => uiManager.log('✓ Speech end event received'),
      onMessage: (msg) => uiManager.log(`✓ Message event received: ${JSON.stringify(msg)}`),
      onTranscriptUpdate: (transcript) => uiManager.updateTranscript(transcript)
    });
    
    uiManager.log('✓ Event handlers registered successfully');
  } catch (error) {
    uiManager.logError(error);
  }
}

/**
 * Stop the current call
 */
async function stopCall() {
  try {
    await vapiService.stopCall();
    uiManager.log('✓ Call stopped successfully');
  } catch (error) {
    uiManager.logError(error);
  }
}

// Initialize everything when DOM is loaded
window.addEventListener('DOMContentLoaded', initApp); 