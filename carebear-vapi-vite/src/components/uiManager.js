/**
 * UI Manager - Handles UI interactions and updates
 */
class UIManager {
  constructor() {
    this.statusElement = null;
    this.transcriptElement = null;
    this.logElement = null;
    this.accordionInitialized = false;
  }

  /**
   * Initialize the UI manager with DOM elements
   * @param {Object} elements - DOM elements references
   */
  initialize(elements = {}) {
    this.statusElement = elements.statusElement || document.getElementById('status');
    this.transcriptElement = elements.transcriptElement || document.getElementById('transcript');
    this.logElement = elements.logElement || document.getElementById('log');
    
    // Initialize accordion functionality if not done already
    if (!this.accordionInitialized) {
      this.initializeAccordion();
    }
  }

  /**
   * Initialize accordion functionality
   */
  initializeAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isOpen = content.classList.contains('open');
        
        // Close all accordions
        document.querySelectorAll('.accordion-content').forEach(item => {
          item.classList.remove('open');
        });
        
        // Toggle the clicked one
        if (!isOpen) {
          content.classList.add('open');
        }
        
        // Update the icon
        const icons = document.querySelectorAll('.accordion-icon');
        icons.forEach(icon => {
          icon.textContent = '+';
        });
        
        if (!isOpen) {
          header.querySelector('.accordion-icon').textContent = '-';
        }
      });
    });
    
    this.accordionInitialized = true;
  }

  /**
   * Update status display
   * @param {string} message - Status message
   * @param {boolean} isError - Whether this is an error status
   */
  updateStatus(message, isError = false) {
    if (!this.statusElement) return;
    
    this.statusElement.textContent = message;
    this.statusElement.className = isError ? 'status error' : 'status';
    
    if (!isError && message.includes('Listening')) {
      this.statusElement.classList.add('listening');
    } else {
      this.statusElement.classList.remove('listening');
    }
  }

  /**
   * Update transcript display
   * @param {string} text - Transcript text
   */
  updateTranscript(text) {
    if (!this.transcriptElement) return;
    
    this.transcriptElement.textContent = text || 'Transcript will appear here...';
  }

  /**
   * Log a message to the log area
   * @param {string} message - Message to log
   * @param {boolean} isError - Whether this is an error message
   */
  log(message, isError = false) {
    if (!this.logElement) return;
    
    const logEntry = document.createElement('div');
    logEntry.innerHTML = message;
    logEntry.className = isError ? 'log-entry error' : 'log-entry success';
    this.logElement.appendChild(logEntry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  /**
   * Clear the log area
   */
  clearLogs() {
    if (!this.logElement) return;
    
    // Keep only the header if exists
    const header = this.logElement.querySelector('h3');
    if (header) {
      this.logElement.innerHTML = '';
      this.logElement.appendChild(header);
    } else {
      this.logElement.innerHTML = '';
    }
  }

  /**
   * Log an error with special formatting
   * @param {Error|Response|Object|string} err - The error to log
   */
  async logError(err) {
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
      this.log(`Error: Response status ${err.status} ${err.statusText}<br>Body: <pre>${body}</pre>`, true);
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
      
      this.log(`Error: Response status ${status}<br>Detail: <pre>${detail || 'No details available'}</pre>`, true);
      return;
    }
    
    // Standard error objects
    if (err && typeof err === 'object') {
      if (err.message) {
        this.log(`✗ ${err.message}`, true);
      } else {
        this.log(`✗ ${JSON.stringify(err, null, 2)}`, true);
      }
      return;
    }
    
    // Fallback for string or other primitive errors
    this.log(`✗ ${err}`, true);
  }

  /**
   * Update button states for voice control
   * @param {Object} buttons - Button references
   * @param {boolean} isCallActive - Whether a call is active
   */
  updateVoiceButtonStates(buttons, isCallActive) {
    if (buttons.startButton) {
      buttons.startButton.disabled = isCallActive;
    }
    
    if (buttons.stopButton) {
      buttons.stopButton.disabled = !isCallActive;
    }
    
    if (buttons.muteButton) {
      buttons.muteButton.disabled = !isCallActive;
    }
  }

  /**
   * Update mute button text
   * @param {HTMLElement} muteButton - The mute button element
   * @param {boolean} isMuted - Current mute state
   */
  updateMuteButtonText(muteButton, isMuted) {
    if (!muteButton) return;
    
    muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
  }
}

// Export a singleton instance
const uiManager = new UIManager();
export default uiManager; 