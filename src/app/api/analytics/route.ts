import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const stats = await db.getVisitorAnalyticsStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error('[ANALYTICS GET ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch visitor stats.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitorId, page, sessionId, userAgent, eventType } = body;

    if (!visitorId || !page || !sessionId || !userAgent) {
      return NextResponse.json(
        { success: false, error: 'Missing required tracking parameters.' },
        { status: 400 }
      );
    }

    const saved = await db.saveVisitorAnalytics({
      visitorId,
      page,
      sessionId,
      userAgent,
      eventType
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error('[ANALYTICS POST ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save visitor event.' },
      { status: 500 }
    );
  }
}
