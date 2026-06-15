import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

async function sendTelegramMessage(chatId: string | number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      })
    });
  } catch (err) {
    console.error('Failed to send Telegram alert:', err);
  }
}

export async function GET(request: Request) {
  try {
    const ownerChatId = process.env.TELEGRAM_CHAT_ID;
    if (!ownerChatId) {
      return NextResponse.json({ success: false, error: 'TELEGRAM_CHAT_ID is not configured.' }, { status: 500 });
    }

    const members = await db.getMembers();
    const todayStr = new Date().toISOString().split('T')[0];
    
    let expiringAlertsCount = 0;
    let expiredAlertsCount = 0;

    for (const m of members) {
      if (m.status === 'Suspended') continue;

      const diffDays = Math.ceil((new Date(m.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));

      // Alert if expiring in exactly 5, 3, or 1 days
      if (diffDays === 5 || diffDays === 3 || diffDays === 1) {
        const text = `⚠️ MEMBERSHIP EXPIRING SOON\n\nName: ${m.name}\nMember ID: ${m.member_id}\nDays Remaining: ${diffDays}\nExpiry Date: ${m.end_date}`;
        await sendTelegramMessage(ownerChatId, text);
        expiringAlertsCount++;
      } 
      // Alert on the day of expiration
      else if (diffDays === 0) {
        const text = `🚫 MEMBERSHIP EXPIRED TODAY\n\nName: ${m.name}\nMember ID: ${m.member_id}\nExpiry Date: ${m.end_date}`;
        await sendTelegramMessage(ownerChatId, text);
        expiredAlertsCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alertsSent: {
        expiring: expiringAlertsCount,
        expired: expiredAlertsCount
      }
    });

  } catch (err: any) {
    console.error('Error in check-expiry cron:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Support POST requests as well
export async function POST(request: Request) {
  return GET(request);
}
