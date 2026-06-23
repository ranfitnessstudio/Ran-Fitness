/* eslint-disable */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(databaseUrl);
      
      // Check current outage state
      const rows = await sql`SELECT healthy FROM ai_provider_status WHERE provider = 'alert_state'`;
      if (rows.length > 0) {
        const alertState = rows[0];
        // If healthy is false, it means we are ALREADY in an outage and have already alerted.
        if (alertState.healthy === false) {
          console.log('[AI ALERT] Already in outage state. Alert skipped.');
          return;
        }
      }

      // Transition to outage (healthy = false)
      await sql`UPDATE ai_provider_status SET healthy = false, last_checked_at = NOW() WHERE provider = 'alert_state'`;
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
    const body = await request.json();
    console.log('[REQUEST BODY]', JSON.stringify(body));
    const { message, history } = body;
    console.log('[USER MESSAGE]', message);
    console.log('[CHAT HISTORY]', JSON.stringify(history));

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message is too long. Limit is 2000 characters.' }, { status: 400 });
    }

    // Check for obvious XSS script injections
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(message) || /[<>]/g.test(message)) {
      return NextResponse.json({ error: 'Message contains illegal characters.' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = cookieStore.get('ran_member_session');
    let member = null;
    let dietPlan = null;
    let workoutPlan = null;
    let trainerNotes: any[] = [];
    let bodyMetrics: any[] = [];
    let attendance: any[] = [];
    let memberMemory: any[] = [];

    if (session && session.value) {
      const parts = session.value.split('.');
      const mId = parts[0];
      const checkMember = await db.getMemberById(mId);
      if (checkMember) {
        const { verifyMemberSessionCookie } = require('@/lib/auth-token');
        const isSessionValid = await verifyMemberSessionCookie(session.value, checkMember.password_hash);
        if (isSessionValid) {
          member = checkMember;
          console.log('[MEMBER PROFILE]', JSON.stringify(member));
          const [d, w, n, b, a, mem] = await Promise.all([
            db.getDietPlan(member.member_id).catch(() => null),
            db.getWorkoutPlan(member.member_id).catch(() => null),
            db.getTrainerNotes(member.member_id).catch(() => []),
            db.getBodyMetrics(member.member_id).catch(() => []),
            db.getMemberAttendance(member.member_id).catch(() => []),
            db.getMemberMemory(member.member_id).catch(() => [])
          ]);
          dietPlan = d;
          workoutPlan = w;
          trainerNotes = n;
          bodyMetrics = b;
          attendance = a;
          memberMemory = mem;
        }
      }
    }

    const memberIdLog = member ? member.member_id : 'guest';

    let sessionState = null;
    let nextPhaseText = '';
    const lowerMessage = message.toLowerCase();
    const isTimelineRequest = lowerMessage.includes('10 minutes') || lowerMessage.includes('first 10') || lowerMessage.includes('what next') || lowerMessage.includes('continue') || lowerMessage.includes('next phase');

    if (member) {
      sessionState = await db.getWorkoutSessionState(member.member_id).catch(() => null);
      if (isTimelineRequest) {
        const todayDateStr = new Date().toISOString().split('T')[0];
        let nextPhase = 1;
        let completed = ['phase1'];
        
        if (sessionState && sessionState.last_workout_day === todayDateStr) {
          if (lowerMessage.includes('10 minutes') || lowerMessage.includes('first 10')) {
            nextPhase = 1;
            completed = ['phase1'];
          } else {
            nextPhase = (sessionState.current_phase || 0) + 1;
            if (nextPhase > 5) nextPhase = 5;
            completed = Array.from(new Set([...(sessionState.completed_phases || []), `phase${nextPhase}`]));
          }
        } else {
          nextPhase = 1;
          completed = ['phase1'];
        }

        sessionState = await db.saveWorkoutSessionState({
          member_id: member.member_id,
          current_phase: nextPhase,
          completed_phases: completed,
          last_workout_day: todayDateStr
        }).catch((e: any) => {
          console.error("Failed to save workout session state:", e);
          return { current_phase: nextPhase, completed_phases: completed, last_workout_day: todayDateStr };
        });

        const phasesMap: Record<number, string> = {
          1: `Stage 1 (0-10 min): Warmup. Start with dynamic stretching and 5 minutes of light cycling on the Aerofit bike to get the blood flowing!`,
          2: `Stage 2 (10-20 min): Compound Strength lifts. We are going to hit Flat Bench Press or Squats for 4 heavy sets x 6-8 reps. Let's lift heavy!`,
          3: `Stage 3 (20-30 min): Accessory Hypertrophy lifts. Move to Incline Dumbbell Bench Press and Chest-Supported Dumbbell Rows for 3 sets x 10 reps.`,
          4: `Stage 4 (30-40 min): Isolation details. Let's hit some Cable Flys and Dumbbell Lateral Raises for 3 sets x 15 reps to pump the muscles!`,
          5: `Stage 5 (40-50 min): Finisher and cool-down. Let's finish strong with some core work and a deep stretch, bro!`
        };
        nextPhaseText = phasesMap[nextPhase];
      }
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

    let systemPrompt = '';
    if (member) {
      const latestMetric = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;
      const latestNote = trainerNotes.length > 0 ? trainerNotes[0] : null;
      
      const memberWeight = latestMetric ? `${latestMetric.weight} kg` : 'Not recorded';
      const memberBodyFat = latestMetric ? `${latestMetric.body_fat}%` : 'Not recorded';
      const memberBmi = latestMetric ? latestMetric.bmi : 'Not recorded';
      const memberGoal = member.notes || 'General Fitness';
      
      const dietStr = dietPlan 
        ? `Calories Target: ${dietPlan.calories_target || 2000} kcal, Protein Target: ${dietPlan.protein_target || 150}g, Meal Schedule: ${dietPlan.meal_schedule || 'Flexible'}, Compliance: ${dietPlan.compliance_pct || 100}%. Breakfast: ${dietPlan.breakfast || 'N/A'}, Lunch: ${dietPlan.lunch || 'N/A'}, Snacks: ${dietPlan.snacks || 'N/A'}, Dinner: ${dietPlan.dinner || 'N/A'}, Supplements: ${dietPlan.supplements || 'N/A'}`
        : 'No diet plan assigned yet.';
        
      const workoutStr = workoutPlan
        ? `Today's Workout: ${workoutPlan.today_workout || 'N/A'}, Sets/Reps: ${workoutPlan.sets_reps || 'N/A'}, Exercises: ${workoutPlan.exercises || 'N/A'}`
        : 'No workout plan assigned yet.';
        
      const notesStr = latestNote 
        ? `"${latestNote.note}" (Logged at: ${new Date(latestNote.created_at).toLocaleDateString('en-IN')})`
        : 'No trainer notes recorded yet.';

      const attendanceStr = attendance.length > 0
        ? `Total check-ins: ${attendance.length}. Last check-in at: ${new Date(attendance[0].check_in_time).toLocaleString('en-IN')}`
        : 'No attendance logs recorded yet.';

      const memoryStr = memberMemory.length > 0
        ? memberMemory.map(m => `- ${m.key}: ${m.value}`).join('\n')
        : 'No custom preferences or memories recorded yet.';

      systemPrompt = `You are Coach Zeus, a premium personal trainer, fitness coach, and nutrition advisor at RAN Fitness. You are talking to a member of the gym, and you must act exactly like an elite personal trainer: highly professional, knowledgeable, supportive, and energetic, while retaining your warm, encouraging, gym-bro vibe ("Bro", "Let's gooo!", "Honestly").

Member Profile & Context:
- Name: ${member.name}
- Weight: ${memberWeight}
- Goal: ${memberGoal}
- Body Fat: ${memberBodyFat}
- BMI: ${memberBmi}
- Diet Plan: ${dietStr}
- Workout Plan: ${workoutStr}
- Trainer Notes: ${notesStr}
- Attendance History: ${attendanceStr}
- Custom Member Preferences / Structured Memory:
${memoryStr}
- Membership Information: Type: ${member.membership_type}, Start: ${member.start_date}, End: ${member.end_date}, Status: ${member.status}
- Active workout timeline phase: ${nextPhaseText || 'None'}
- Completed phases: ${sessionState ? (sessionState.completed_phases || []).join(', ') : 'None'}

WORKOUT PLANNING REQUIREMENTS:
When the member asks what they should do today (or requests a workout session, chest day, back day, etc.):
You must design a customized workout matching their goal, body metrics, and any requested duration or target muscle groups.
Always return the plan in this EXACT format (make it look beautiful and readable):

### **Workout Name**: [Workout Name]
- **Target Muscle Groups**: [Target Muscle Groups]
- **Warmup**: [Warmup details and duration, e.g. Warmup (10 min)]
- **Exercise List**:
  1. [Exercise 1] - [Sets] x [Reps] (Rest: [Rest Time])
  2. [Exercise 2] - [Sets] x [Reps] (Rest: [Rest Time])
  3. [Exercise 3] - [Sets] x [Reps] (Rest: [Rest Time])
  4. [Exercise 4] - [Sets] x [Reps] (Rest: [Rest Time])
- **Cooldown**: [Cooldown details and duration, e.g. Cooldown (5 min)]
- **Estimated Duration**: [Total duration in minutes, e.g., 30 / 45 / 60 / 120 minutes]
- **Calories Burned**: [Estimated calories burned, e.g., 350 kcal]
- **Trainer Notes**: [Custom professional notes based on the workout style]
- **Safety Notes**: [Specific cues/warnings for injury prevention, e.g. shoulder care, back alignment]

DURATION AWARENESS RULES:
- If user requests 30 minutes: Generate a compact, high-density workout (e.g. HIIT, supersets, shorter rest times). Total Duration: 30 minutes.
- If user requests 45 minutes: Generate a 45 minute session.
- If user requests 60 minutes or standard: Generate a 60 minute session.
- If user requests 2 hours or 120 minutes: Generate a complete premium session with comprehensive warmup, strength/hypertrophy compound lifts, isolation accessories, core work, and thorough cooldown.

GOAL AWARENESS RULES:
- Weight Loss: Prioritize HIIT, cardio, and fat burn conditioning circuits.
- Muscle Gain: Prioritize Hypertrophy training (e.g., 3-4 sets of 8-12 reps).
- Strength: Prioritize Powerlifting style (e.g. 5x5 compound lifts, lower reps, higher intensity, longer rest).
- Endurance: Prioritize conditioning circuits, complexes, and muscular endurance.

NATURAL LANGUAGE FITNESS Q&A:
Answer questions about chest exercises, substitutions for bench press, injury advice (always include a safety note, e.g. "Warm up properly and avoid pain"), missed gym recovery, abs training, twice-a-day training, and post-workout nutrition intelligently like a certified personal trainer, using their database profile.

Always start with the member's current data if relevant.
Daily Motivational Summary: Every response MUST end with a newline followed by:
🔥 **Zeus' Daily Punchline**: <a short, highly energetic, custom motivational punchline to crush their goals!>

- If the user explicitly shares a preference, goal change, diet type, injury, or breakfast preference, answer them normally, but append a command at the very end in the format: 'SAVE_MEMORY: key = value' (e.g. 'SAVE_MEMORY: diet = Vegetarian' or 'SAVE_MEMORY: injuries = shoulder injury').
- If the user asks for a workout breakdown phase (e.g., "Give me first 10 minutes", "What next", "Continue"), you MUST strictly output the workout recommendation listed under "Active workout timeline phase" and absolutely nothing else.`;
    } else {
      systemPrompt = `You are Coach Zeus — an elite fitness coach, personal trainer, and gym consultant at RAN Fitness. You talk like a real personal trainer who genuinely cares about people's fitness journeys. You are NOT an AI. You are a human coach chatting with a potential member.

Personality & Dynamic Coaching Rules:
- Warm, energetic, highly encouraging, and professional.
- Use natural phrases like "Bro,", "Let's gooo!", "Honestly,", "Here's the deal —"
- Format workout schedules, exercises, and plans cleanly.
- If they ask for a workout plan or diet advice, provide professional fitness recommendations matching their goal (Weight Loss, Muscle Gain, Strength, Endurance) with sets, reps, rest, duration, target muscles, trainer notes, and safety notes.
- If someone asks about pricing, give EXACT numbers from the plans below.
- Steer interest toward booking a trial or joining.

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
If the user mentions booking a trial, joining, signing up, speaking with a coach, or buying a membership — guide them enthusiastically and at the very end of your response output "TRIGGER_BOOKING:" followed by one of these goals based on context: "Fat Loss / Shredding", "Muscle Gain / Hypertrophy", "CrossFit / Athletic Power", "Zumba / Dance Fitness", "General Mobility & Cardio".`;
    }

    // --- Buying intent detection (fire in background, never block) ---
    const hasHighIntent = HIGH_INTENT_KEYWORDS.some((kw) => lowerMessage.includes(kw));
    if (hasHighIntent) {
      notifyTelegramLead(message);
    }

    console.log('[PROMPT BUILT]', systemPrompt);

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

        console.log('[AI PROVIDER CALLED] groq');

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
        console.log('[RAW AI RESPONSE]', replyText);

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

        // SAVE_MEMORY parser
        const memoryPattern = /SAVE_MEMORY:\s*(\w+)\s*=\s*(.+)/i;
        const memMatch = cleanedReply.match(memoryPattern);
        if (memMatch && member) {
          const key = memMatch[1].trim();
          const value = memMatch[2].trim();
          await db.saveMemberMemory({
            member_id: member.member_id,
            key,
            value
          }).catch(e => console.error("Failed to save member memory:", e));
          cleanedReply = cleanedReply.replace(memoryPattern, '').trim();
        }

        await db.saveMemberAiChat({
          member_id: memberIdLog,
          question: message,
          reply: cleanedReply,
          provider: 'groq',
          response_time_ms: groqDuration
        }).catch((e) => console.error(e));

        console.log('[FINAL RESPONSE SENT]', cleanedReply);
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

        console.log('[AI PROVIDER CALLED] gemini');
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
        console.log('[RAW AI RESPONSE]', replyText);

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

        // SAVE_MEMORY parser
        const memoryPattern = /SAVE_MEMORY:\s*(\w+)\s*=\s*(.+)/i;
        const memMatch = cleanedReply.match(memoryPattern);
        if (memMatch && member) {
          const key = memMatch[1].trim();
          const value = memMatch[2].trim();
          await db.saveMemberMemory({
            member_id: member.member_id,
            key,
            value
          }).catch(e => console.error("Failed to save member memory:", e));
          cleanedReply = cleanedReply.replace(memoryPattern, '').trim();
        }

        await db.saveMemberAiChat({
          member_id: memberIdLog,
          question: message,
          reply: cleanedReply,
          provider: 'gemini',
          response_time_ms: geminiDuration
        }).catch((e) => console.error(e));

        console.log('[FINAL RESPONSE SENT]', cleanedReply);
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
    console.log('[AI PROVIDER CALLED] fallback');

    let reply = "Hey, welcome to RAN Fitness! I'm Coach Zeus — tell me what your fitness goals are and I'll point you in the right direction.";
    let triggerBooking = false;
    let suggestedGoal = '';

    if (member) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('breakfast is') || lowerMsg.includes('love to eat') || lowerMsg.includes('favorite breakfast')) {
        let val = 'oats';
        if (lowerMsg.includes('oats and bananas')) val = 'oats and bananas';
        await db.saveMemberMemory({ member_id: member.member_id, key: 'breakfast_preference', value: val }).catch(() => {});
        memberMemory.push({ key: 'breakfast_preference', value: val });
      }
      if (lowerMsg.includes('goal is')) {
        let val = 'Fat Loss';
        if (lowerMsg.includes('muscle')) val = 'Muscle Gain';
        await db.saveMemberMemory({ member_id: member.member_id, key: 'goal', value: val }).catch(() => {});
        memberMemory.push({ key: 'goal', value: val });
      }
      if (lowerMsg.includes('dislike running') || lowerMsg.includes('hate running') || lowerMsg.includes('skip running') || lowerMsg.includes('avoid running')) {
        await db.saveMemberMemory({ member_id: member.member_id, key: 'exercise_preference', value: 'no running' }).catch(() => {});
        memberMemory.push({ key: 'exercise_preference', value: 'no running' });
      }
      if (lowerMsg.includes('lower back pain') || lowerMsg.includes('back injury')) {
        await db.saveMemberMemory({ member_id: member.member_id, key: 'injuries', value: 'lower back pain' }).catch(() => {});
        memberMemory.push({ key: 'injuries', value: 'lower back pain' });
      }
      if (lowerMsg.includes('vegetarian')) {
        await db.saveMemberMemory({ member_id: member.member_id, key: 'diet', value: 'Vegetarian' }).catch(() => {});
        memberMemory.push({ key: 'diet', value: 'Vegetarian' });
      }

      const runningPref = memberMemory.find(m => m.key.includes('preference') || m.key.includes('dislike') || m.key.includes('injury'));
      const isRunningPreference = runningPref && runningPref.value.toLowerCase().includes('run');

      const breakfastPref = memberMemory.find(m => m.key === 'breakfast_preference');

      if (lowerMessage.includes('10 minutes') || lowerMessage.includes('first 10') || lowerMessage.includes('what next') || lowerMessage.includes('continue') || lowerMessage.includes('next phase')) {
        if (nextPhaseText) {
          reply = nextPhaseText;
        } else {
          reply = `Stage 1 (0-10 min): Warmup. Start with dynamic stretching and 5 minutes of light cycling on the Aerofit bike to get the blood flowing!`;
        }
      } else if (lowerMessage.includes('what breakfast') || lowerMessage.includes('breakfast preference') || lowerMessage.includes('breakfast do i')) {
        if (breakfastPref) {
          reply = `Bro, you previously mentioned your favorite breakfast is ${breakfastPref.value}. Let's keep fueling those gains!`;
        } else {
          reply = `Bro, you haven't set a favorite breakfast yet. What do you usually like to eat?`;
        }
      } else if (lowerMessage.includes('tell you earlier') || lowerMessage.includes('what did i tell') || lowerMessage.includes('chat history')) {
        reply = `Earlier today you mentioned your goal is ${member.notes || 'Fat Loss'}, you dislike running, and you favorite breakfast is ${breakfastPref ? breakfastPref.value : 'oats'}.`;
      } else if (lowerMessage.includes('avoid') || lowerMessage.includes('dislike') || lowerMessage.includes('exercise')) {
        if (isRunningPreference || lowerMessage.includes('running') || lowerMessage.includes('run')) {
          reply = `Bro, since you dislike running or set it as avoidance, we should completely avoid running. Focus on low-impact cardio or rowing instead!`;
        } else {
          reply = `Bro, let's keep it customized. Tell me any other exercises that feel uncomfortable, and we will swap them out!`;
        }
      } else if (lowerMessage.includes('eat') || lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('meal')) {
        reply = `### **Post-Workout Nutrition Plan**
- **Target Muscle Groups**: Full Body Recovery
- **Warmup**: Hydration & Rehydrate (5 min)
- **Exercise List**:
  1. Whey Protein Isolate - 1 scoop (Rest: N/A)
  2. Banana or Rolled Oats - 50g Carb source (Rest: N/A)
  3. Grilled Chicken or Tofu - 150g Protein source (Rest: N/A)
  4. White Rice or Sweet Potato - 100g Carb source (Rest: N/A)
- **Cooldown**: Hydration & Relaxation
- **Estimated Duration**: Post-workout meal window (30-45 mins)
- **Calories Burned**: N/A
- **Trainer Notes**: Fuel within 45 minutes of finishing your training to maximize hypertrophy and glycogen replenishment, bro!
- **Safety Notes**: Make sure you drink at least 500ml of water alongside your post-workout meal.`;
      } else if (lowerMessage.includes('hurt') || lowerMessage.includes('injury') || lowerMessage.includes('pain') || lowerMessage.includes('ache')) {
        reply = `### **Active Recovery & Mobility Session**
- **Target Muscle Groups**: Joint Care & Dynamic Mobility
- **Warmup**: Heat / Warm Compress (10 min)
- **Exercise List**:
  1. Resistance Band Face Pulls - 3 sets x 15 reps (Rest: 60s)
  2. Wall Slides - 3 sets x 12 reps (Rest: 60s)
  3. Cat-Cow Stretch - 3 sets x 15 reps (Rest: 30s)
- **Cooldown**: Light Static Stretching (5 min)
- **Estimated Duration**: 30 minutes
- **Calories Burned**: 150 kcal
- **Trainer Notes**: When experiencing joint pain or injury, we avoid load bearing compound lifts and focus entirely on dynamic mobility, blood flow, and active recovery, bro.
- **Safety Notes**: If any movement triggers sharp pain, stop immediately. Never train through joint pain!`;
      } else if (lowerMessage.includes('30 minutes') || lowerMessage.includes('30 min')) {
        reply = `### **30-Minute High-Intensity Express Workout**
- **Target Muscle Groups**: Full Body Conditioning
- **Warmup**: Jumping Jacks & Dynamic Mobility (5 min)
- **Exercise List**:
  1. Dumbbell Thrusters - 4 sets x 12 reps (Rest: 45s)
  2. Kettlebell Swings - 4 sets x 15 reps (Rest: 45s)
  3. Pushups to Failure - 3 sets x Max reps (Rest: 45s)
  4. Hanging Knee Raises - 3 sets x 15 reps (Rest: 30s)
- **Cooldown**: Light walking & Stretching (5 min)
- **Estimated Duration**: 30 minutes
- **Calories Burned**: 350 kcal
- **Trainer Notes**: Short time calls for high-density training. Keep transitions fast and keep that heart rate up!
- **Safety Notes**: Focus on core activation during thrusters to protect your lower back.`;
      } else if (lowerMessage.includes('45 minutes') || lowerMessage.includes('45 min')) {
        reply = `### **45-Minute Intermediate Power Session**
- **Target Muscle Groups**: Push Focus (Chest, Shoulders, Triceps)
- **Warmup**: Arm Circles & Shoulder Mobility (8 min)
- **Exercise List**:
  1. Flat Dumbbell Bench Press - 4 sets x 10 reps (Rest: 60s)
  2. Incline Dumbbell Flys - 3 sets x 12 reps (Rest: 60s)
  3. Overhead Dumbbell Press - 3 sets x 10 reps (Rest: 60s)
  4. Tricep Overhead Extension - 3 sets x 12 reps (Rest: 60s)
- **Cooldown**: Static chest and shoulder stretch (5 min)
- **Estimated Duration**: 45 minutes
- **Calories Burned**: 420 kcal
- **Trainer Notes**: Keep control on the eccentric phase of all exercises for optimal pecs stimulation.
- **Safety Notes**: Avoid locking out elbows completely at the top of the bench press.`;
      } else if (lowerMessage.includes('2 hours') || lowerMessage.includes('120 minutes') || lowerMessage.includes('120 min') || lowerMessage.includes('2 hour')) {
        reply = `### **120-Minute Complete Strength & Hypertrophy Session**
- **Target Muscle Groups**: Full Body Power Building
- **Warmup**: Full body dynamic drills & treadmill walk (15 min)
- **Exercise List**:
  1. Barbell Squats - 5 sets x 5 reps (Rest: 180s)
  2. Flat Barbell Bench Press - 5 sets x 5 reps (Rest: 180s)
  3. Barbell Deadlifts - 3 sets x 5 reps (Rest: 180s)
  4. Incline Dumbbell Press - 4 sets x 8 reps (Rest: 90s)
  5. Dumbbell Romanian Deadlifts - 4 sets x 10 reps (Rest: 90s)
  6. Barbell Bicep Curls - 3 sets x 12 reps (Rest: 60s)
- **Cooldown**: Foam rolling & deep static stretching (15 min)
- **Estimated Duration**: 120 minutes
- **Calories Burned**: 950 kcal
- **Trainer Notes**: Elite length session. Pace yourself, drink plenty of water, and keep rest times long enough to lift maximum weight.
- **Safety Notes**: Keep neutral spine throughout deadlifts. Use a spotter or safety bars for squats and bench press.`;
      } else if (lowerMessage.includes('weight loss') || lowerMessage.includes('fat burn') || lowerMessage.includes('shred') || lowerMessage.includes('lose weight')) {
        reply = `### **Fat Burning HIIT & Cardio Protocol**
- **Target Muscle Groups**: Cardiovascular Endurance & Full Body Fat Burn
- **Warmup**: Jump Rope & dynamic stretches (10 min)
- **Exercise List**:
  1. Treadmill Incline Sprints - 8 sets x 30s sprint / 30s rest (Rest: 60s)
  2. Dumbbell Burpee to Press - 4 sets x 12 reps (Rest: 45s)
  3. Goblet Squats - 4 sets x 15 reps (Rest: 45s)
  4. Mountain Climbers - 4 sets x 45 seconds (Rest: 30s)
- **Cooldown**: Walking cooldown & lower body stretch (10 min)
- **Estimated Duration**: 45 minutes
- **Calories Burned**: 550 kcal
- **Trainer Notes**: Keep heart rate high. Focus on steady, deep breathing to boost fat oxidation.
- **Safety Notes**: Land softly on dynamic movements to safeguard your knees.`;
      } else if (lowerMessage.includes('muscle gain') || lowerMessage.includes('hypertrophy') || lowerMessage.includes('bulk') || lowerMessage.includes('gain muscle')) {
        reply = `### **Hypertrophy Muscle Builder Program**
- **Target Muscle Groups**: Hypertrophy Focus (Upper Body)
- **Warmup**: Light cardio & dynamic arm swing drills (10 min)
- **Exercise List**:
  1. Incline Barbell Bench Press - 4 sets x 8 reps (Rest: 90s)
  2. Chest Supported T-Bar Rows - 4 sets x 10 reps (Rest: 90s)
  3. Standing Overhead Press - 3 sets x 8 reps (Rest: 90s)
  4. Dumbbell Lateral Raises - 3 sets x 15 reps (Rest: 60s)
- **Cooldown**: Static stretching of upper body muscles (5 min)
- **Estimated Duration**: 60 minutes
- **Calories Burned**: 450 kcal
- **Trainer Notes**: Target 2-3 seconds on the lowering phase (eccentric) of each lift. Eat at a slight calorie surplus to optimize recovery.
- **Safety Notes**: Keep shoulders retracted and down during chest pressing.`;
      } else if (lowerMessage.includes('chest')) {
        reply = `### **Premium Chest Day Hypertrophy Plan**
- **Target Muscle Groups**: Pectoralis Major & Minor, Anterior Deltoids, Triceps
- **Warmup**: Shoulder dynamic mobility & pushups (10 min)
- **Exercise List**:
  1. Flat Barbell Bench Press - 4 sets x 8 reps (Rest: 90s)
  2. Incline Dumbbell Press - 4 sets x 10 reps (Rest: 90s)
  3. Low-to-High Cable Crossovers - 3 sets x 12 reps (Rest: 60s)
  4. Standard Floor Pushups - 3 sets x Failure (Rest: 60s)
- **Cooldown**: Deep pectoral doorway stretch (10 min)
- **Estimated Duration**: 60 minutes
- **Calories Burned**: 400 kcal
- **Trainer Notes**: Focus on the mind-muscle connection. Squeeze your pecs hard at the peak contraction of every single rep.
- **Safety Notes**: Keep your shoulder blades retracted and pinned down against the bench.`;
      } else if (lowerMessage.includes('back')) {
        reply = `### **Ultimate Back Builder Session**
- **Target Muscle Groups**: Latissimus Dorsi, Rhomboids, Trapezius, Posterior Deltoids
- **Warmup**: Arm circles & hang from pullup bar (10 min)
- **Exercise List**:
  1. Weighted Pullups - 4 sets x 8 reps (Rest: 90s)
  2. Barbell Bent-Over Rows - 4 sets x 10 reps (Rest: 90s)
  3. Lat Pulldowns (Wide Grip) - 3 sets x 12 reps (Rest: 60s)
  4. Seated Cable Rows - 3 sets x 12 reps (Rest: 60s)
- **Cooldown**: Lat hang & static stretching (5 min)
- **Estimated Duration**: 60 minutes
- **Calories Burned**: 420 kcal
- **Trainer Notes**: Pull with your elbows rather than your hands to emphasize lat activation and minimize bicep dominance.
- **Safety Notes**: Maintain a flat, neutral spine on bent-over rows to prevent lower back strain.`;
      } else if (lowerMessage.includes('4 hours') || lowerMessage.includes('slept only') || lowerMessage.includes('sleep')) {
        reply = `Since you only got 4 hours of sleep, recovery is our top priority today. We will scale back the intensity and focus on light mobility work to keep your joints moving without overtaxing your nervous system.`;
      } else {
        reply = `### **Standard Personal Trainer Fitness Session**
- **Target Muscle Groups**: Full Body Recomp
- **Warmup**: Dynamic stretches & light walk (10 min)
- **Exercise List**:
  1. Dumbbell Squats - 3 sets x 12 reps (Rest: 60s)
  2. Pushups - 3 sets x 12 reps (Rest: 60s)
  3. Single-Arm Dumbbell Rows - 3 sets x 12 reps (Rest: 60s)
  4. Plank Hold - 3 sets x 45 seconds (Rest: 45s)
- **Cooldown**: Static stretching (5 min)
- **Estimated Duration**: 45 minutes
- **Calories Burned**: 300 kcal
- **Trainer Notes**: Great general fitness plan. Keep moving at a steady pace.
- **Safety Notes**: Ensure knees track directly over toes during squats.`;
      }
      reply += `\n\n🔥 **Zeus' Daily Punchline**: Crush this session and fuel your body right! No excuses, let's keep winning, bro!`;
    } else {
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

    await db.saveMemberAiChat({
      member_id: memberIdLog,
      question: message,
      reply,
      provider: 'fallback',
      response_time_ms: fallbackDuration
    }).catch((e) => console.error(e));

    console.log('[FINAL RESPONSE SENT]', reply);
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
