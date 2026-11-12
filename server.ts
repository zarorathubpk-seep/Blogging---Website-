import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Enable CORS for external/static hosting (GitHub Pages, toolcrest.site)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize GoogleGenAI SDK with AI Studio user agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instruction for ToolCrest Assistant (optimized for brevity and token efficiency)
const DEFAULT_SYSTEM_INSTRUCTION = `You are ToolCrest AI, an expert technical and document workflows assistant embedded in ToolCrest (toolcrest.site).
ToolCrest provides free, client-side browser tools for PDF (Merge, Split, Compress, Rotate, Protect, Unlock, PDF/A, Redact, Sign), QR codes, productivity planners, and conversion calculators.
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

// Helper: classify and extract structured quota/error details from Gemini API error
function classifyGeminiError(error: any, requestedModel: string): {
  statusCode: number;
  errorType: 'BILLING_TIER_RESTRICTION' | 'PER_MINUTE_RATE_LIMIT' | 'DAILY_QUOTA_EXHAUSTED' | 'MODEL_TEMPORARILY_OVERLOADED' | 'RATE_LIMIT_EXCEEDED' | 'API_KEY_ERROR' | 'GENERAL_ERROR';
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

  // Check for gemini-4-argon or paid-only tier restriction on Free Tier
  if (
    requestedModel === 'gemini-4-argon' &&
    (code === 429 || errorStatus === 'RESOURCE_EXHAUSTED' || messageText.includes('limit: 0') || messageText.includes('free_tier'))
  ) {
    return {
      statusCode: 429,
      errorType: 'BILLING_TIER_RESTRICTION',
      userFriendlyMessage:
        'The gemini-4-argon model requires a Google Cloud paid billing account (free tier limit is 0). Please switch to gemini-3.1-flash-lite or gemini-3.8-flash for free access.',
      suggestedModel: 'gemini-3.1-flash-lite',
      rawMessage: messageText,
    };
  }

  // Check for HTTP 429 RESOURCE_EXHAUSTED
  if (code === 429 || errorStatus === 'RESOURCE_EXHAUSTED' || messageText.includes('quota') || messageText.includes('RESOURCE_EXHAUSTED')) {
    // Try to extract retry delay
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

    // Check for Daily Quota vs Per-Minute Rate Limit
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
      userFriendlyMessage:
        `Google Gemini free tier requests-per-minute limit reached. Please wait ${retryAfterSeconds > 60 ? Math.ceil(retryAfterSeconds / 60) + ' minutes' : retryAfterSeconds + ' seconds'} before sending another message.`,
      suggestedModel: requestedModel === 'gemini-3.8-flash' ? 'gemini-3.1-flash-lite' : undefined,
      retryAfterSeconds,
      rawMessage: messageText,
    };
  }

  // Check for HTTP 503 UNAAVAILABLE / high demand spike
  if (code === 503 || errorStatus === 'UNAVAILABLE' || messageText.includes('high demand') || messageText.includes('temporarily')) {
    return {
      statusCode: 503,
      errorType: 'MODEL_TEMPORARILY_OVERLOADED',
      userFriendlyMessage:
        'This model is currently experiencing high demand across Google infrastructure. Switching to Gemini Flash Lite will provide an immediate answer.',
      suggestedModel: 'gemini-3.1-flash-lite',
      retryAfterSeconds: 5,
      rawMessage: messageText,
    };
  }

  // API Key missing or invalid
  if (code === 401 || code === 403 || messageText.includes('API key') || messageText.includes('PERMISSION_DENIED')) {
    return {
      statusCode: 403,
      errorType: 'API_KEY_ERROR',
      userFriendlyMessage:
        'Gemini API key is missing or unauthorized. Please verify that GEMINI_API_KEY is configured in project secrets.',
      rawMessage: messageText,
    };
  }

  return {
    statusCode: code >= 400 && code < 600 ? code : 500,
    errorType: 'GENERAL_ERROR',
    userFriendlyMessage: messageText.length > 200 ? 'Gemini AI service error. Please try again.' : messageText,
    rawMessage: messageText,
  };
}

// POST /api/chat - Multi-turn conversational endpoint with rate limiting, retry backoff, and model fallback
app.post('/api/chat', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

  // 1. Sliding-window per-IP rate limit check (max 12 requests per minute to prevent quota exhaustion)
  const now = Date.now();
  const userRate = ipRateLimits.get(clientIp);

  if (userRate && now < userRate.resetAt) {
    if (userRate.count >= 12) {
      const waitSeconds = Math.ceil((userRate.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(waitSeconds));
      return res.status(429).json({
        error: `Client rate limit: You have sent too many requests. Please wait ${waitSeconds}s before asking again.`,
        errorType: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: waitSeconds,
      });
    }
    userRate.count++;
  } else {
    ipRateLimits.set(clientIp, { count: 1, resetAt: now + 60 * 1000 });
  }

  // 2. In-flight request deduplication per IP
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

    // 3. Optimize Token Consumption:
    // Limit history to the last 8 turns (4 user + 4 assistant) to prevent token bloat
    const recentMessages = messages.slice(-8);

    const contents = recentMessages.map((m: any, index: number) => {
      let rawText = String(m.content || m.text || '');
      // Cap previous historical message turns to 1500 chars to avoid exhausting TPM quota
      if (index < recentMessages.length - 1 && rawText.length > 1500) {
        rawText = rawText.slice(0, 1500) + '... [truncated for context limit]';
      }
      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: rawText }],
      };
    });

    // 4. Model Selection & Configuration
    let selectedModel = 'gemini-3.1-flash-lite';
    if (model === 'gemini-3.8-flash') {
      selectedModel = 'gemini-3.8-flash';
    } else if (model === 'gemini-4-argon') {
      selectedModel = 'gemini-4-argon';
    }

    const config: any = {
      systemInstruction,
    };

    // Google Search Grounding is available on gemini-3.8-flash
    if (useSearch && selectedModel === 'gemini-3.8-flash') {
      config.tools = [{ googleSearch: {} }];
    }

    // Helper to execute generation with timeout and controlled retry
    async function executeGeneration(targetModel: string, targetConfig: any, timeoutMs = 18000) {
      const callPromise = ai.models.generateContent({
        model: targetModel,
        contents,
        config: targetConfig,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${targetModel} generation took longer than ${timeoutMs}ms`)), timeoutMs)
      );

      try {
        return (await Promise.race([callPromise, timeoutPromise])) as any;
      } catch (err: any) {
        const classified = classifyGeminiError(err, targetModel);
        // Only retry for transient per-minute rate limits on the same model if not 503 high demand
        if (classified.statusCode === 429 && classified.errorType === 'PER_MINUTE_RATE_LIMIT') {
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));
          const retryCall = ai.models.generateContent({
            model: targetModel,
            contents,
            config: targetConfig,
          });
          const retryTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${targetModel} retry took longer than ${timeoutMs}ms`)), timeoutMs)
          );
          return (await Promise.race([retryCall, retryTimeout])) as any;
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

      // If gemini-3.8-flash failed due to 503 high demand, quota rate limit, or timeout,
      // gracefully fall back to gemini-3.1-flash-lite so the user gets their answer immediately!
      if (
        selectedModel === 'gemini-3.8-flash' &&
        (classified.statusCode === 503 || classified.statusCode === 429 || String(primaryError?.message).includes('Timeout'))
      ) {
        try {
          console.warn(`[Gemini Fallback] ${selectedModel} returned ${classified.statusCode || 'timeout'}. Falling back to gemini-3.1-flash-lite.`);
          const fallbackConfig: any = { systemInstruction };
          response = await executeGeneration('gemini-3.1-flash-lite', fallbackConfig, 18000);
          fallbackUsed = true;
          finalModel = 'gemini-3.1-flash-lite';
        } catch (fallbackError) {
          // If fallback also fails, throw primary error
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
      fallbackNotice: fallbackUsed ? 'Answered via Gemini Flash Lite (Flash 3.8 was temporarily at capacity)' : undefined,
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
