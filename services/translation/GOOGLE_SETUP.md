# Google Translate integration for CloudAssistant6

This service implements a simple server-side proxy for the Google Translate API so that API keys are never exposed to the browser.

Files added
- apps/api/package.json
- apps/api/server.js
- .env.example

How it works
1. The frontend (ScreenTranslator component) sends POST /api/translate { text, target } to this server.
2. The server reads TRANSLATION_API_KEY from environment and calls Google Translate v2 REST API.
3. The server returns { translated } to the frontend.

Local setup
1. From repository root, install dependencies for the API:
   cd apps/api
   npm install

2. Create a .env file using the example and set your Google Translate API key:
   cp ../../.env.example .env
   # edit .env and set TRANSLATION_API_KEY

3. Run the API server:
   npm start

Notes
- If you serve the frontend from a different origin, configure CORS or proxy requests accordingly.
- This implementation uses the Translate v2 REST endpoint with an API key. For production, consider service account credentials and the Cloud Translation API v3 client libraries.
