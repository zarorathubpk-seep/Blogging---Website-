import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System instruction for ToolCrest Assistant
const DEFAULT_SYSTEM_INSTRUCTION = `You are ToolCrest AI, an expert full-stack technical assistant, document specialist, and productivity engineer embedded in ToolCrest (toolcrest.site).
ToolCrest provides free, private in-browser tools including:
- PDF Tools (Merge, Split, Compress, Rotate, Redact, Sign, Encrypt/Protect, Unlock, PDF/A conversion, Crop, Watermark)
- QR Code Suite (Wi-Fi, URLs, Contact, Text)
- Productivity Planners (Weekly, 50/30/20 Budget, Work, Study, Project, Sunday Review)
- Calculators & Converters (Unit, Currency, Time Zone, Markdown Editor)
- 3D HexCrest Arcade Game (interactive 3D cyber-runner)

Your persona:
- Concise, sharp, highly knowledgeable, and friendly.
- When assisting with document workflows or conversions, give actionable step-by-step guidance.
- When Google Search grounding is enabled, provide up-to-date, cited facts with source references.
- Format responses cleanly with readable Markdown, concise lists, and clear headers.`;

// POST /api/chat - Multi-turn conversational endpoint with Gemini & Search Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      model = 'gemini-3.8-flash',
      useSearch = false,
      systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Format history for @google/genai SDK
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.content || m.text || '') }],
    }));

    // Build configuration
    const config: any = {
      systemInstruction,
    };

    // Google Search Grounding: Available on gemini-3.8-flash
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Valid model check
    const selectedModel = model === 'gemini-4-argon' ? 'gemini-4-argon' : model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];
    const groundingChunks = (groundingMetadata?.groundingChunks || []).map((chunk: any) => ({
      title: chunk.web?.title || 'Web Reference',
      uri: chunk.web?.uri || '',
    })).filter((c: any) => Boolean(c.uri));

    res.json({
      text: response.text || '',
      groundingChunks,
      webSearchQueries,
      model: selectedModel,
    });
  } catch (error: any) {
    let errorMessage = error.message || 'Failed to generate response from Gemini';
    try {
      if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error?.message) {
          errorMessage = parsed.error.message;
        }
      }
    } catch {
      // keep fallback
    }

    res.status(500).json({
      error: errorMessage,
    });
  }
});

// Serve sitemap directly if requested
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.resolve('public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(sitemapPath);
  }
  res.status(404).send('Sitemap not found');
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ToolCrest full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
