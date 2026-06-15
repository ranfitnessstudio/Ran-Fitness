/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  console.log('[BOOKING RECEIVED]');

  try {
    const body = await request.json();
    const { name, phone, goal, preferredTime, source, role, experience } = body;

    if (!name || !phone) {
      console.log('[BOOKING] Validation failed: missing name or phone');
      return NextResponse.json(
        { success: false, telegramDelivered: false, error: 'Name and phone number are required.' },
        { status: 400 }
      );
    }

    console.log('[BOOKING] Form validation passed');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // -------------------------------------------------------------------------
    // IF IT'S A CAREER APPLICATION (Contains a role and experience)
    // -------------------------------------------------------------------------
    if (role && experience) {
      console.log('[BOOKING] Career application detected');

      const savedApp = await db.saveCareer({
        name,
        phone,
        role: role as any,
        experience,
      });

      console.log(`[BOOKING] Database save status: ${savedApp.id}`);

      let telegramSent = false;
      let telegramError = null;

      if (botToken && chatId) {
        const messageText = `
💼 *NEW JOB APPLICATION RECEIVED* 💼
----------------------------------------
👤 *Candidate Name:* ${name}
📞 *Phone:* \`${phone}\`
🎯 *Role Applied:* ${role}
💪 *Experience Details:* ${experience}
🏷️ *Source:* Career Page Form
📆 *Submitted At:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
----------------------------------------
⚡ _Open the Admin Panel to review candidate details._
        `;

        console.log('[BOOKING] Telegram request started');

        try {
          const telegramRes = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'Markdown',
              }),
            }
          );

          const telegramData = await telegramRes.json();
          console.log('[BOOKING] Telegram response received');

          if (telegramRes.ok) {
            telegramSent = true;
            console.log('[BOOKING] Telegram SUCCESS');
          } else {
            telegramError =
              telegramData.description || 'Failed response from Telegram API';
            console.log(`[BOOKING] Telegram FAILURE: ${telegramError}`);
          }
        } catch (err: any) {
          telegramError = err.message || 'Fetch failed';
          console.log(`[BOOKING] Telegram FAILURE: ${telegramError}`);
        }
      } else {
        console.log('[BOOKING] Telegram skipped: missing bot token or chat ID');
      }

      return NextResponse.json({
        success: true,
        careerId: savedApp.id,
        telegramDelivered: telegramSent,
        telegramError,
      });
    }

    // -------------------------------------------------------------------------
    // ELSE: STANDARD BOOKING LEAD COLLECTION
    // -------------------------------------------------------------------------
    console.log('[BOOKING] Standard booking lead detected');

    const savedLead = await db.saveLead({
      name,
      phone,
      goal: goal || 'General Fitness',
      preferred_time: preferredTime || 'Flexible',
      source: source || 'Web Form',
    });

    console.log('[BOOKING SAVED]');

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });

    if (botToken && chatId) {
      const messageText = `🔥 NEW RAN FITNESS LEAD

👤 Name: ${name}
📞 Phone: ${phone}
🎯 Goal: ${goal || 'General Fitness'}
⏰ Preferred Slot: ${preferredTime || 'Flexible'}
📅 Date: ${timestamp}`;

      console.log('[TELEGRAM REQUEST STARTED]');

      try {
        const telegramRes = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageText,
            }),
          }
        );

        const telegramData = await telegramRes.json();
        console.log('[TELEGRAM RESPONSE RECEIVED]');

        if (telegramRes.ok) {
          console.log('[TELEGRAM SUCCESS]');
          return NextResponse.json({
            success: true,
            telegramDelivered: true,
            telegramResponse: telegramData,
          });
        } else {
          const errorMsg = telegramData.description || 'Failed response from Telegram API';
          console.log('[TELEGRAM FAILED]');
          return NextResponse.json({
            success: false,
            telegramDelivered: false,
            error: errorMsg,
          });
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Fetch failure';
        console.log('[TELEGRAM FAILED]');
        return NextResponse.json({
          success: false,
          telegramDelivered: false,
          error: errorMsg,
        });
      }
    } else {
      console.log('[BOOKING] Telegram skipped: missing bot token or chat ID');
      return NextResponse.json({
        success: true,
        telegramDelivered: false,
        error: 'Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID',
      });
    }
  } catch (error: any) {
    console.error('[BOOKING] Unhandled error:', error);
    return NextResponse.json(
      { success: false, telegramDelivered: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
