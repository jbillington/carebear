# VAPI Web SDK Test Suite

This project serves as a test suite and demo for the VAPI Web SDK, allowing developers to test voice assistant functionality and explore SDK features.

## Features

### Original Version (index.html)
- Complete test suite for all VAPI Web SDK functionality
- Voice conversation with transcript display
- Step-by-step testing tools for each SDK function
- Detailed error handling and logging

### V2 Version (index-v2.html)
- Modern, cleaner UI with improved layout
- Separated components for better code organization
- Collapsible test controls section
- Enhanced styling with CSS variables
- Modular JavaScript architecture

## Project Structure

```
carebear-vapi-vite/
├── index.html           # Original test page
├── main.js              # Original JavaScript
├── index-v2.html        # New improved interface
├── main-v2.js           # Refactored JavaScript
├── src/
│   ├── components/
│   │   ├── vapiService.js    # VAPI functionality module
│   │   └── uiManager.js      # UI management module
│   └── styles/
│       └── main.css          # Styled CSS with variables
└── vite.config.js      # Vite configuration
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Access the applications:
   - Original version: http://localhost:XXXX/
   - V2 version: http://localhost:XXXX/index-v2.html

## Using the Test Suite

1. Enter your VAPI API key from the [VAPI Dashboard](https://dashboard.vapi.ai/account)
2. Initialize the SDK
3. Enter your Assistant ID
4. Start a voice call
5. Test various SDK features using the provided controls

## Required API Keys

- You'll need a valid VAPI API key from the [VAPI Dashboard](https://dashboard.vapi.ai/account)

## License

MIT 