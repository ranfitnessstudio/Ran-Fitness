import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, page, sessionId, userAgent, eventType } = body;

    if (!visitorId || !page || !sessionId || !userAgent) {
      return NextResponse.json(
        { error: 'Missing required fields: visitorId, page, sessionId, userAgent' },
        { status: 400 }
      );
    }

    const validEventTypes = ['book_trial_click', 'virtual_tour_open', 'trainer_card_click', 'equipment_view'];
    if (eventType && !validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await db.saveVisitorAnalytics({
      visitorId,
      page,
      sessionId,
      userAgent,
      eventType,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Analytics POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save analytics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await db.getVisitorAnalyticsStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics stats' },
      { status: 500 }
    );
  }
}
