// apps/api/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '8mb' }));

// Serve static frontend files from ./public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get('/health', (req, res) => res.json({ ok: true, service: 'CloudAssistant6 - Translation API' }));

app.post('/api/translate', async (req, res) => {
  try {
    const { text, target } = req.body || {};
    if (!text || !target) return res.status(400).json({ error: 'Missing text or target language' });

    const apiKey = process.env.TRANSLATION_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Translation API key not configured on server' });

    // Use Google Translate v2 REST API
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const payload = { q: text, target, format: 'text' };

    const resp = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
    const translations = resp.data && resp.data.data && resp.data.data.translations;
    const translated = Array.isArray(translations) && translations[0] && translations[0].translatedText;

    if (!translated) return res.status(502).json({ error: 'Invalid response from translation provider', raw: resp.data });

    return res.json({ translated });
  } catch (err) {
    console.error('translate error', err && err.response && err.response.data ? err.response.data : err.message || err);
    return res.status(500).json({ error: 'Translation failed', details: (err && err.response && err.response.data) || err.message });
  }
});

// SPA fallback: serve index.html for unknown routes
app.get('*', (req, res) => {
  // If request starts with /api, return 404
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Translation proxy and web UI running on port ${PORT}`);
});
