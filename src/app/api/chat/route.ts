/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// High-intent keywords that signal a potential lead
const HIGH_INTENT_KEYWORDS = [
  'join', 'membership', 'price', 'fees', 'cost', 'trainer',
  'personal training', 'transformation', 'weight loss', 'muscle gain'
];

/**
 * Fire-and-forget Telegram notification for detected buying intent.
 * Intentionally not awaited so it never blocks the response.
 */
function notifyTelegramLead(userMessage: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const text = `🚨 HIGH INTENT VISITOR\n\nMessage:\n${userMessage}\n\nTime:\n${istTime}`;

  console.log('[INTENT DETECTED]');

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
    .then((res) => {
      if (res.ok) {
        console.log('[TELEGRAM SENT]');
      } else {
        console.error('Telegram notification failed with status:', res.status);
      }
    })
    .catch((err) => console.error('Telegram notification failed:', err));
}

/**
 * Throttled Telegram alert when both Groq and Gemini fail
 */
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

    const text = `🚨 AI SYSTEM ALERT\n\nGroq: Offline\nGemini: Offline\n\nCoach Zeus running in fallback mode.\n\nTime: ${istTime}`;

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

export async function POST(request: Request) {
  console.log('[CHAT REQUEST]');

  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // Fetch dynamic context from the DB
    const [settings, plans, trainers, equipment] = await Promise.all([
      db.getSettings(),
      db.getPlans(),
      db.getTrainers(),
      db.getEquipment(),
    ]);

    const plansList = plans
      .map((p) => `- ${p.name}: ₹${p.price} / ${p.duration}. Benefits: ${p.benefits.join(', ')}`)
      .join('\n');

    const trainersList = trainers
      .map((t) => `- ${t.name} (${t.designation}): specializes in ${t.specialization}. Quote: "${t.quote}"`)
      .join('\n');

    const equipmentList = equipment
      .map((e) => `- ${e.name} (${e.category}, ${e.brand}): ${e.description}`)
      .join('\n');

    // Upgraded system prompt – human-like, high-energy, concise, persuasive
    const systemPrompt = `You are Coach Zeus — a real, experienced gym sales consultant at RAN Fitness. You talk like a high-energy trainer who genuinely cares about people's fitness journeys. You are NOT an AI, you are NOT a virtual assistant — you are a human coach chatting with a potential member on the website.

Personality rules:
- Always respond in 2-4 sentences max, unless the user specifically asks for details.
- Sound like a real gym bro — warm, energetic, slightly pushy in a fun way.
- Use natural phrases like "Bro,", "Let's gooo!", "Honestly,", "No cap,", "Here's the deal —"
- Never say "I'm an AI", "As a virtual assistant", or anything that breaks the human illusion.
- Always steer the conversation toward booking a free trial or signing up for a membership.
- If someone asks about pricing, give EXACT numbers from the plans below — don't be vague.
- Keep it casual and conversational. No corporate speak. No bullet-point dumps unless asked.

RAN Fitness Info:
- Address: ${settings.contact_address}
- Phone: ${settings.contact_phone}
- Email: ${settings.contact_email}
- Hours: ${settings.business_hours}
- About: ${settings.about_text}

Membership Plans:
${plansList}

Our Trainers:
${trainersList}

Equipment on the floor:
${equipmentList}

Booking trigger rule:
If the user mentions booking a trial, joining, signing up, speaking with a coach, or buying a membership — guide them enthusiastically and at the very end of your response output "TRIGGER_BOOKING:" followed by one of these goals based on context: "Fat Loss / Shredding", "Muscle Gain / Hypertrophy", "CrossFit / Athletic Power", "Zumba / Dance Fitness", "General Mobility & Cardio".
Example:
...Let's get you set up!
TRIGGER_BOOKING: CrossFit / Athletic Power
`;

    // --- Buying intent detection (fire in background, never block) ---
    const lowerMessage = message.toLowerCase();
    const hasHighIntent = HIGH_INTENT_KEYWORDS.some((kw) => lowerMessage.includes(kw));
    if (hasHighIntent) {
      notifyTelegramLead(message);
    }

    let groqErrorMsg = '';
    const groqStartTime = Date.now();
    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      try {
        const formattedHistory = (history || [])
          .slice(0, -1)
          .map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts?.[0]?.text || h.content || '',
          }));

        const messagesToSend = [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
          { role: 'user', content: message }
        ];

        let response = null;
        let attempts = 0;
        while (attempts < 3) {
          console.log(`[GROQ REQUEST]${attempts > 0 ? ` (Retry #${attempts})` : ''}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

          try {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messagesToSend,
                temperature: 0.7,
                max_tokens: 1024,
              }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (response.status === 429) {
              attempts++;
              if (attempts < 3) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                continue;
              }
            }
            break;
          } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            attempts++;
            if (attempts < 3) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              continue;
            }
            throw fetchErr;
          }
        }

        if (!response || !response.ok) {
          const errText = response ? await response.text() : 'No response';
          throw new Error(`Groq API failed with status ${response?.status}: ${errText}`);
        }

        const data = await response.json();
        console.log('[GROQ RESPONSE]');
        const replyText = data.choices?.[0]?.message?.content || '';

        const groqDuration = Date.now() - groqStartTime;
        await db.saveAiMetric({
          provider: 'groq',
          response_time_ms: groqDuration,
          success: true
        });

        console.log('[AI PROVIDER: GROQ]');

        const triggerPattern = /TRIGGER_BOOKING:\s*(.+)/i;
        const match = replyText.match(triggerPattern);
        let cleanedReply = replyText;
        let triggerBooking = false;
        let suggestedGoal = '';

        if (match) {
          triggerBooking = true;
          suggestedGoal = match[1].trim();
          cleanedReply = replyText.replace(triggerPattern, '').trim();
        }

        return NextResponse.json({
          reply: cleanedReply,
          triggerBooking,
          suggestedGoal,
        });
      } catch (aiError: any) {
        groqErrorMsg = aiError.message || String(aiError);
        console.error('Groq API Error details:', groqErrorMsg);
        const groqDuration = Date.now() - groqStartTime;
        await db.saveAiMetric({
          provider: 'groq',
          response_time_ms: groqDuration,
          success: false,
          error_message: groqErrorMsg
        });
      }
    } else {
      groqErrorMsg = 'Groq API key missing in environment variables';
      console.log('Groq API key missing');
      await db.saveAiMetric({
        provider: 'groq',
        response_time_ms: 0,
        success: false,
        error_message: groqErrorMsg
      });
    }

    // --- GEMINI FAILOVER ---
    let geminiErrorMsg = '';
    const geminiStartTime = Date.now();
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      try {
        console.log('[GEMINI REQUEST]');
        const formattedHistoryGemini = (history || [])
          .slice(0, -1)
          .map((h: any) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts?.[0]?.text || h.content || '' }],
          }));

        const contentsGemini = [
          ...formattedHistoryGemini,
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: contentsGemini,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              }
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API failed with status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        console.log('[GEMINI RESPONSE]');
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const geminiDuration = Date.now() - geminiStartTime;
        await db.saveAiMetric({
          provider: 'gemini',
          response_time_ms: geminiDuration,
          success: true
        });

        console.log('[AI PROVIDER: GEMINI]');

        const triggerPattern = /TRIGGER_BOOKING:\s*(.+)/i;
        const match = replyText.match(triggerPattern);
        let cleanedReply = replyText;
        let triggerBooking = false;
        let suggestedGoal = '';

        if (match) {
          triggerBooking = true;
          suggestedGoal = match[1].trim();
          cleanedReply = replyText.replace(triggerPattern, '').trim();
        }

        return NextResponse.json({
          reply: cleanedReply,
          triggerBooking,
          suggestedGoal,
        });
      } catch (geminiError: any) {
        geminiErrorMsg = geminiError.message || String(geminiError);
        console.error('Gemini API Error details:', geminiErrorMsg);
        const geminiDuration = Date.now() - geminiStartTime;
        await db.saveAiMetric({
          provider: 'gemini',
          response_time_ms: geminiDuration,
          success: false,
          error_message: geminiErrorMsg
        });
      }
    } else {
      geminiErrorMsg = 'Gemini API key missing in environment variables';
      console.log('Gemini API key missing');
      await db.saveAiMetric({
        provider: 'gemini',
        response_time_ms: 0,
        success: false,
        error_message: geminiErrorMsg
      });
    }

    // --- LOCAL FALLBACK ---
    const fallbackStartTime = Date.now();
    console.log('[LOCAL FALLBACK RUNNING]');

    let reply = "Hey, welcome to RAN Fitness! I'm Coach Zeus — tell me what your fitness goals are and I'll point you in the right direction.";
    let triggerBooking = false;
    let suggestedGoal = '';

    if (lowerMessage.includes('price') || lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('plan') || lowerMessage.includes('membership')) {
      reply = `Honestly, we've got something for every budget. Basic Strength & Cardio is ₹1,500/mo, CrossFit Elite is ₹2,500/mo (best value if you want group classes too), and VIP Personalized is ₹5,000/mo with a dedicated trainer and custom nutrition plan. Which one sounds like your vibe?`;
    } else if (lowerMessage.includes('equipment') || lowerMessage.includes('aerofit') || lowerMessage.includes('dumbbell') || lowerMessage.includes('treadmill')) {
      reply = `Bro, our floor is stacked — full Aerofit commercial setup. Smith machines, dual-stack cable crossovers, commercial treadmills, spin bikes, Olympic bars, kettlebells, the works. Come check it out in person, it hits different when you see it.`;
    } else if (lowerMessage.includes('zumba') || lowerMessage.includes('crossfit') || lowerMessage.includes('cardio') || lowerMessage.includes('hour') || lowerMessage.includes('time') || lowerMessage.includes('open')) {
      reply = `We're open Monday to Saturday, 5 AM to 10 PM. Zumba runs Mon-Wed-Fri evenings, CrossFit is daily on the turf, and the cardio zone is always open. What time works best for you?`;
    } else if (lowerMessage.includes('join') || lowerMessage.includes('book') || lowerMessage.includes('trial') || lowerMessage.includes('free') || lowerMessage.includes('sign up') || lowerMessage.includes('register')) {
      reply = `Let's gooo! I'm pulling up the booking form for you right now. Fill in your details and we'll get you a free trial session — you'll meet the coaches and try everything out, zero commitment.`;
      triggerBooking = true;
      suggestedGoal = 'CrossFit / Athletic Power';
    } else if (lowerMessage.includes('trainer') || lowerMessage.includes('coach') || lowerMessage.includes('vikram') || lowerMessage.includes('aisha')) {
      reply = `Our coaching squad is legit. Vikram Ran is the founder — 10+ years, powerlifting and body recomp specialist. Aisha Patel handles CrossFit and Olympic lifting, and Sameer Khan is the transformation king for fat loss and nutrition. Want me to set up a session with one of them?`;
    } else if (lowerMessage.includes('weight') || lowerMessage.includes('fat') || lowerMessage.includes('lose') || lowerMessage.includes('slim')) {
      reply = `Weight loss is literally our bread and butter. We've got structured fat-loss programs with diet guidance and dedicated trainers. Honestly, the best move is to book a free trial — Coach Sameer will do a body comp check and map out a plan for you.`;
    } else if (lowerMessage.includes('muscle') || lowerMessage.includes('bulk') || lowerMessage.includes('gain') || lowerMessage.includes('build')) {
      reply = `Muscle gain? You're in the right place, bro. We've got all the heavy iron you need plus trainers who know progressive overload inside out. Come grab a free trial and let's get your gains started.`;
    }

    const fallbackDuration = Date.now() - fallbackStartTime;
    await db.saveAiMetric({
      provider: 'fallback',
      response_time_ms: fallbackDuration,
      success: true
    });

    console.log('[AI PROVIDER: FALLBACK]');

    // Send Telegram Alert because BOTH failed
    const errorDetails = `Groq: ${groqErrorMsg}\nGemini: ${geminiErrorMsg}`;
    sendSystemAlert(errorDetails).catch((err) => console.error('Failed to trigger alert:', err));

    return NextResponse.json({
      reply,
      triggerBooking,
      suggestedGoal,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
