/* eslint-disable */
import { NextResponse } from 'next/server';

async function handleTestTelegram() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken) {
    return NextResponse.json(
      {
        success: false,
        telegramDelivered: false,
        error: 'TELEGRAM_BOT_TOKEN is not set in environment variables.',
      },
      { status: 500 }
    );
  }

  if (!chatId) {
    return NextResponse.json(
      {
        success: false,
        telegramDelivered: false,
        error: 'TELEGRAM_CHAT_ID is not set in environment variables.',
      },
      { status: 500 }
    );
  }

  const messageText = '✅ RAN FITNESS TELEGRAM TEST SUCCESSFUL';

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

    if (telegramRes.ok) {
      return NextResponse.json({
        success: true,
        telegramDelivered: true,
        telegramResponse: telegramData,
      });
    } else {
      const errorMsg = telegramData.description || 'Failed response from Telegram API';
      return NextResponse.json(
        {
          success: false,
          telegramDelivered: false,
          error: errorMsg,
          telegramResponse: telegramData,
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        telegramDelivered: false,
        error: err.message || 'Unknown network error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleTestTelegram();
}

export async function POST() {
  return handleTestTelegram();
}
