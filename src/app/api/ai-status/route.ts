import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const statuses = await db.getAiProviderStatus();
    const groqStatus = statuses.find(s => s.provider === 'groq') || {
      provider: 'groq',
      healthy: false,
      response_time_ms: 0,
      last_checked_at: new Date().toISOString(),
    };
    const geminiStatus = statuses.find(s => s.provider === 'gemini') || {
      provider: 'gemini',
      healthy: false,
      response_time_ms: 0,
      last_checked_at: new Date().toISOString(),
    };

    const fallbackActive = !groqStatus.healthy && !geminiStatus.healthy;

    // Find the latest check timestamp
    const times = [
      new Date(groqStatus.last_checked_at).getTime(),
      new Date(geminiStatus.last_checked_at).getTime(),
    ];
    const latestTime = new Date(Math.max(...times)).toISOString();

    return NextResponse.json({
      groq: {
        healthy: groqStatus.healthy,
        responseTime: groqStatus.response_time_ms,
      },
      gemini: {
        healthy: geminiStatus.healthy,
        responseTime: geminiStatus.response_time_ms,
      },
      fallback: fallbackActive,
      lastChecked: latestTime,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Internal server error' }, { status: 500 });
  }
}
