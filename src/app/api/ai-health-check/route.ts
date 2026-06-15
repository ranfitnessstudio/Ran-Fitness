import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

async function sendSystemAlert(errorDetails: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Missing Telegram configuration for alert.');
    return;
  }

  try {
    const alertState = await db.getAlertState();
    const lastAlerted = new Date(alertState.lastAlertedAt).getTime();
    const now = Date.now();
    const thirtyMinutesInMs = 30 * 60 * 1000;

    if (now - lastAlerted < thirtyMinutesInMs) {
      console.log('[AI ALERT THROTTLED]');
      return;
    }

    const istTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const text = `🚨 AI SYSTEM ALERT\n\nGroq: Offline\nGemini: Offline\n\nCoach Zeus running in fallback mode.\n\nTime: ${istTime}\n\nDetails:\n${errorDetails}`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (res.ok) {
      console.log('[AI ALERT SENT]');
      await db.updateAlertState(new Date().toISOString());
    } else {
      console.error('Failed to send Telegram alert:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Error in sendSystemAlert:', err);
  }
}

export async function GET() {
  console.log('[AI HEALTH CHECK] Started');

  let groqHealthy = false;
  let groqResponseTime = 0;
  let groqErrorMsg = '';

  const groqKey = process.env.GROQ_API_KEY;
  const groqStart = Date.now();

  if (groqKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 1,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        groqHealthy = true;
        groqResponseTime = Date.now() - groqStart;
      } else {
        groqErrorMsg = `HTTP ${response.status}`;
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      groqErrorMsg = (err as Error).message || String(err);
    }
  } else {
    groqErrorMsg = 'API Key missing';
  }

  // Update status in db
  await db.updateAiProviderStatus('groq', groqHealthy, groqResponseTime);

  let geminiHealthy = false;
  let geminiResponseTime = 0;
  let geminiErrorMsg = '';

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const geminiStart = Date.now();

  if (geminiKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
            generationConfig: {
              maxOutputTokens: 1,
            }
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        geminiHealthy = true;
        geminiResponseTime = Date.now() - geminiStart;
      } else {
        geminiErrorMsg = `HTTP ${response.status}`;
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      geminiErrorMsg = (err as Error).message || String(err);
    }
  } else {
    geminiErrorMsg = 'API Key missing';
  }

  // Update status in db
  await db.updateAiProviderStatus('gemini', geminiHealthy, geminiResponseTime);

  console.log('[AI HEALTH CHECK] Completed');

  // If both failed, send Telegram alert
  if (!groqHealthy && !geminiHealthy) {
    const errorDetails = `Groq: ${groqErrorMsg}\nGemini: ${geminiErrorMsg}`;
    await sendSystemAlert(errorDetails);
  }

  return NextResponse.json({
    success: true,
    groq: {
      healthy: groqHealthy,
      responseTime: groqResponseTime,
      error: groqErrorMsg || null,
    },
    gemini: {
      healthy: geminiHealthy,
      responseTime: geminiResponseTime,
      error: geminiErrorMsg || null,
    }
  });
}
