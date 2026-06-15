/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Fetch resources
    const visitsCount = await db.getVisitsCount();
    const leads = await db.getLeads();
    const careers = await db.getCareers();

    // Calculate weekly statistics (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyLeads = leads.filter(l => new Date(l.created_at) >= sevenDaysAgo);
    const weeklyCareers = careers.filter(c => new Date(c.created_at) >= sevenDaysAgo);

    const weeklyLeadsCount = weeklyLeads.length;
    const hotLeads = weeklyLeads.filter(l => l.priority === 'Hot Lead 🔥').length;
    const warmLeads = weeklyLeads.filter(l => l.priority === 'Warm Lead 🟡').length;
    const coldLeads = weeklyLeads.filter(l => l.priority === 'Cold Lead ⚪').length;

    const weeklyCareersCount = weeklyCareers.length;

    // Build markdown message
    const messageText = `
📊 *WEEKLY PERFORMANCE REPORT @ RAN FITNESS* 📊
------------------------------------------------------------
🌐 *Total Page Views:* ${visitsCount}

📈 *Leads Captured (Last 7 Days):* ${weeklyLeadsCount}
🔥 *Hot Leads (High Intent):* ${hotLeads}
🟡 *Warm Leads (Standard):* ${warmLeads}
⚪ *Cold Leads (Careers/Misc):* ${coldLeads}

💼 *Career Applications (Last 7 Days):* ${weeklyCareersCount}

------------------------------------------------------------
📆 *Report Date:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
⚡ _Log in to the Admin Panel to check details and export data!_
    `.trim();

    let telegramSent = false;
    let telegramError = null;

    if (botToken && chatId) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'Markdown',
          }),
        });

        if (res.ok) {
          telegramSent = true;
        } else {
          const errData = await res.json();
          telegramError = errData.description || 'Failed response from Telegram';
        }
      } catch (err: any) {
        telegramError = err.message || 'Fetch failed';
      }
    } else {
      telegramError = 'Telegram bot token or chat ID is missing in environment variables.';
      console.log('--- TELEGRAM WEEKLY ANALYTICS DEMO LOG ---');
      console.log(messageText);
      console.log('-------------------------------------------');
    }

    return NextResponse.json({
      success: true,
      stats: {
        total_page_views: visitsCount,
        weekly_leads_captured: weeklyLeadsCount,
        hot_leads: hotLeads,
        warm_leads: warmLeads,
        cold_leads: coldLeads,
        weekly_careers_captured: weeklyCareersCount
      },
      telegramSent,
      telegramError
    });
  } catch (error: any) {
    console.error('Analytics Weekly API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Support POST requests as well (for custom trigger buttons)
export async function POST() {
  return GET();
}
