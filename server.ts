import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Allowed browser origins (GitHub Pages production domain + localhost + Cloud Run dev)
function isOriginAllowed(origin: string): boolean {
  const normalized = origin.replace(/\/+$/, '').toLowerCase();
  const staticAllowed = new Set([
    'https://toolcrest.site',
    'https://www.toolcrest.site',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
  ]);
  if (staticAllowed.has(normalized)) return true;
  if (normalized.endsWith('.run.app') && normalized.startsWith('https://')) return true;

  const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, '').toLowerCase())
    .filter(Boolean);
  return extraOrigins.includes(normalized);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    if (origin && !isOriginAllowed(origin)) {
      return res.sendStatus(403);
    }
    return res.sendStatus(200);
  }
  next();
});

// Lazy accessor for GoogleGenAI SDK
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for ToolCrest Assistant (optimized for brevity and token efficiency)
const DEFAULT_SYSTEM_INSTRUCTION = `You are ToolCrest AI, an expert technical and document workflows assistant embedded in ToolCrest (toolcrest.site).
ToolCrest provides free, client-side browser tools for PDF (Merge, Split, Compress, Rotate, Protect, Unlock, PDF/A, Redact, Edit, Sign), QR codes, productivity planners, and conversion calculators.
Be concise, helpful, and direct. When providing steps, use numbered lists. When Google Search grounding is active, cite facts accurately.`;

// In-memory sliding-window IP rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();
const activeRequests = new Set<string>();

// Cleanup stale IP rate limits every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimits.entries()) {
    if (now > record.resetAt) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

type ClassifiedErrorType =
  | 'BILLING_TIER_RESTRICTION'
  | 'PER_MINUTE_RATE_LIMIT'
  | 'DAILY_QUOTA_EXHAUSTED'
  | 'MODEL_TEMPORARILY_OVERLOADED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'API_KEY_ERROR'
  | 'GENERAL_ERROR';

// Helper: classify and extract structured quota/error details from Gemini API error
function classifyGeminiError(error: any, requestedModel: string): {
  statusCode: number;
  errorType: ClassifiedErrorType;
  userFriendlyMessage: string;
  retryAfterSeconds?: number;
  suggestedModel?: string;
  rawMessage: string;
} {
  const rawMsg = String(error?.message || error || '');
  let parsed: any = null;

  try {
    if (typeof rawMsg === 'string' && rawMsg.includes('{')) {
      const match = rawMsg.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }
  } catch {
    // raw fallback
  }

  const code = error?.status || parsed?.error?.code || 500;
  const errorStatus = parsed?.error?.status || '';
  const messageText = parsed?.error?.message || rawMsg;

  // API Key missing or invalid
  if (
    code === 401 ||
    code === 403 ||
    errorStatus === 'PERMISSION_DENIED' ||
    messageText.includes('API key') ||
    messageText.includes('API_KEY_INVALID') ||
    messageText.includes('PERMISSION_DENIED')
  ) {
    return {
      statusCode: 403,
      errorType: 'API_KEY_ERROR',
      userFriendlyMessage:
        'Gemini API key is missing or unauthorized on the server. Please verify GEMINI_API_KEY configuration.',
      rawMessage: messageText,
    };
  }

  // Paid-tier-only models on Free Tier
  if (
    (requestedModel === 'gemini-4-argon' || requestedModel === 'gemini-4-carbon') &&
    (code === 429 ||
      errorStatus === 'RESOURCE_EXHAUSTED' ||
      messageText.includes('limit: 0') ||
      messageText.includes('free_tier'))
  ) {
    return {
      statusCode: 429,
      errorType: 'BILLING_TIER_RESTRICTION',
      userFriendlyMessage:
        `The ${requestedModel} model requires a Google Cloud paid billing account (free tier limit is 0). Switch to gemini-3.1-flash-lite or gemini-4-hydrogen for free tier usage.`,
      suggestedModel: 'gemini-3.1-flash-lite',
      rawMessage: messageText,
    };
  }

  // Unsupported or unavailable model (404 NOT_FOUND)
  if (code === 404 || errorStatus === 'NOT_FOUND') {
    return {
      statusCode: 404,
      errorType: 'MODEL_TEMPORARILY_OVERLOADED',
      userFriendlyMessage:
        `The requested model (${requestedModel}) is currently unavailable. Switching to gemini-3.1-flash-lite is recommended.`,
      suggestedModel: 'gemini-3.1-flash-lite',
      rawMessage: messageText,
    };
  }

  // HTTP 429 RESOURCE_EXHAUSTED
  if (
    code === 429 ||
    errorStatus === 'RESOURCE_EXHAUSTED' ||
    messageText.includes('quota') ||
    messageText.includes('RESOURCE_EXHAUSTED')
  ) {
    let retryAfterSeconds = 15;
    const retryMatch = messageText.match(/retry in\s+([0-9.]+)s/i);
    if (retryMatch) {
      retryAfterSeconds = Math.ceil(parseFloat(retryMatch[1]));
    } else {
      const minMatch = messageText.match(/retry in\s+([0-9]+)m/i);
      if (minMatch) {
        retryAfterSeconds = Math.ceil(parseInt(minMatch[1], 10) * 60);
      }
    }

    if (messageText.includes('PerDay') || messageText.includes('requests per day')) {
      return {
        statusCode: 429,
        errorType: 'DAILY_QUOTA_EXHAUSTED',
        userFriendlyMessage:
          'Daily Gemini free tier quota has been reached for this project. Please switch to Flash Lite or try again tomorrow.',
        suggestedModel: 'gemini-3.1-flash-lite',
        retryAfterSeconds,
        rawMessage: messageText,
      };
    }

    return {
      statusCode: 429,
      errorType: 'PER_MINUTE_RATE_LIMIT',
      userFriendlyMessage: `Google Gemini free tier requests-per-minute limit reached. Please wait ${
        retryAfterSeconds > 60
          ? Math.ceil(retryAfterSeconds / 60) + ' minutes'
          : retryAfterSeconds + ' seconds'
      } before sending another message.`,
      suggestedModel: requestedModel !== 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : undefined,
      retryAfterSeconds,
      rawMessage: messageText,
    };
  }

  // HTTP 503 UNAVAILABLE / high demand
  if (
    code === 503 ||
    errorStatus === 'UNAVAILABLE' ||
    messageText.includes('high demand') ||
    messageText.includes('temporarily')
  ) {
    return {
      statusCode: 503,
      errorType: 'MODEL_TEMPORARILY_OVERLOADED',
      userFriendlyMessage:
        'This model is currently experiencing high demand. Switching to Gemini Flash Lite will provide an immediate response.',
      suggestedModel: 'gemini-3.1-flash-lite',
      retryAfterSeconds: 5,
      rawMessage: messageText,
    };
  }

  return {
    statusCode: code >= 400 && code < 600 ? code : 500,
    errorType: 'GENERAL_ERROR',
    userFriendlyMessage:
      messageText.length > 220 ? 'Gemini AI service error. Please try again.' : messageText,
    rawMessage: messageText,
  };
}

function checkRateLimit(req: express.Request, res: express.Response, maxPerMin = 12): string | null {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const userRate = ipRateLimits.get(clientIp);

  if (userRate && now < userRate.resetAt) {
    if (userRate.count >= maxPerMin) {
      const waitSeconds = Math.ceil((userRate.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(waitSeconds));
      res.status(429).json({
        error: `Client rate limit: Too many requests. Please wait ${waitSeconds}s before trying again.`,
        errorType: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: waitSeconds,
      });
      return null;
    }
    userRate.count++;
  } else {
    ipRateLimits.set(clientIp, { count: 1, resetAt: now + 60 * 1000 });
  }
  return clientIp;
}

// POST /api/chat - Multi-turn conversational endpoint with rate limiting, retry backoff, and model fallback
app.post('/api/chat', async (req, res) => {
  const clientIp = checkRateLimit(req, res, 12);
  if (!clientIp) return;

  const ai = getAiClient();
  if (!ai) {
    return res.status(403).json({
      error: 'GEMINI_API_KEY is not configured on the backend server.',
      errorType: 'API_KEY_ERROR',
    });
  }

  const requestKey = `${clientIp}_chat_active`;
  if (activeRequests.has(requestKey)) {
    return res.status(429).json({
      error: 'A request from your session is already processing. Please wait for it to complete.',
      errorType: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: 3,
    });
  }

  activeRequests.add(requestKey);

  try {
    const {
      messages,
      model = 'gemini-3.1-flash-lite',
      useSearch = false,
      systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Optimize token consumption: cap history to last 8 turns and truncate old turns
    const recentMessages = messages.slice(-8);
    const contents = recentMessages.map((m: any, index: number) => {
      let rawText = String(m.content || m.text || '');
      if (index < recentMessages.length - 1 && rawText.length > 1500) {
        rawText = rawText.slice(0, 1500) + '... [truncated for context limit]';
      }
      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: rawText }],
      };
    });

    // Strict allowlist of valid active @google/genai models
    let selectedModel = 'gemini-3.1-flash-lite';
    if (model === 'gemini-4-hydrogen') {
      selectedModel = 'gemini-4-hydrogen';
    } else if (model === 'gemini-4-argon') {
      selectedModel = 'gemini-4-argon';
    }

    const config: any = { systemInstruction };
    if (useSearch && selectedModel === 'gemini-4-hydrogen') {
      config.tools = [{ googleSearch: {} }];
    }

    async function executeGeneration(targetModel: string, targetConfig: any, timeoutMs = 18000) {
      const runCall = () =>
        ai!.models.generateContent({
          model: targetModel,
          contents,
          config: targetConfig,
        });

      const withTimeout = (fn: () => Promise<any>) =>
        Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${targetModel} took longer than ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);

      try {
        return await withTimeout(runCall);
      } catch (err: any) {
        const classified = classifyGeminiError(err, targetModel);
        if (classified.statusCode === 429 && classified.errorType === 'PER_MINUTE_RATE_LIMIT') {
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));
          return await withTimeout(runCall);
        }
        throw err;
      }
    }

    let response: any = null;
    let fallbackUsed = false;
    let finalModel = selectedModel;

    try {
      response = await executeGeneration(selectedModel, config, 18000);
    } catch (primaryError: any) {
      const classified = classifyGeminiError(primaryError, selectedModel);
      if (
        selectedModel === 'gemini-4-hydrogen' &&
        (classified.statusCode === 503 ||
          classified.statusCode === 429 ||
          classified.statusCode === 404 ||
          String(primaryError?.message).includes('Timeout'))
      ) {
        try {
          console.warn(
            `[Gemini Fallback] ${selectedModel} returned ${classified.statusCode || 'timeout'}. Falling back to gemini-3.1-flash-lite.`
          );
          response = await executeGeneration('gemini-3.1-flash-lite', { systemInstruction }, 18000);
          fallbackUsed = true;
          finalModel = 'gemini-3.1-flash-lite';
        } catch {
          throw primaryError;
        }
      } else {
        throw primaryError;
      }
    }

    const candidate = response?.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];
    const groundingChunks = (groundingMetadata?.groundingChunks || [])
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Web Reference',
        uri: chunk.web?.uri || '',
      }))
      .filter((c: any) => Boolean(c.uri));

    res.json({
      text: response?.text || candidate?.content?.parts?.[0]?.text || '',
      groundingChunks,
      webSearchQueries,
      model: finalModel,
      fallbackUsed,
      fallbackNotice: fallbackUsed
        ? 'Answered via Gemini Flash Lite (Gemini Hydrogen was temporarily unavailable)'
        : undefined,
    });
  } catch (error: any) {
    const classified = classifyGeminiError(error, req.body?.model || 'gemini-3.1-flash-lite');
    res.status(classified.statusCode).json({
      error: classified.userFriendlyMessage,
      errorType: classified.errorType,
      retryAfterSeconds: classified.retryAfterSeconds,
      suggestedModel: classified.suggestedModel,
      rawMessage: process.env.NODE_ENV !== 'production' ? classified.rawMessage : undefined,
    });
  } finally {
    activeRequests.delete(requestKey);
  }
});

// POST /api/translate - Genuine AI Document Translation endpoint
app.post('/api/translate', async (req, res) => {
  const clientIp = checkRateLimit(req, res, 10);
  if (!clientIp) return;

  const ai = getAiClient();
  if (!ai) {
    return res.status(403).json({
      error: 'GEMINI_API_KEY is not configured on the backend server.',
      errorType: 'API_KEY_ERROR',
    });
  }

  try {
    const { text, targetLanguage } = req.body || {};
    const rawText = String(text || '').trim();
    const lang = String(targetLanguage || '').trim();

    if (!rawText) {
      return res.status(400).json({ error: 'Text to translate is required.' });
    }
    if (!lang) {
      return res.status(400).json({ error: 'Target language is required.' });
    }

    const cappedText = rawText.slice(0, 12000);
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Translate the following document text into ${lang}. Preserve paragraph breaks and formatting. Return only the translated text without commentary or markdown fences:\n\n${cappedText}`,
      config: {
        systemInstruction:
          'You are a professional technical and legal document translator. Output only the accurate translation in the requested target language.',
      },
    });

    const translatedText = (response?.text || '').trim();
    if (!translatedText) {
      return res.status(502).json({ error: 'Translation model returned empty output.' });
    }

    res.json({
      translatedText,
      model: 'gemini-3.1-flash-lite',
      truncated: rawText.length > 12000,
    });
  } catch (error: any) {
    const classified = classifyGeminiError(error, 'gemini-3.1-flash-lite');
    res.status(classified.statusCode).json({
      error: classified.userFriendlyMessage,
      errorType: classified.errorType,
      retryAfterSeconds: classified.retryAfterSeconds,
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
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
  } else if (fs.existsSync(path.resolve('dist', 'index.html'))) {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ToolCrest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
