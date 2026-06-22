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

      systemPrompt = `You are Coach Zeus, the personal fitness coach for this member.

Member Data:
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

Always answer using the member’s actual data before giving general advice.

Personality rules:
- Always respond in 2-4 sentences max, unless the user specifically asks for details.
- Sound like a real, high-energy gym bro — warm, energetic, and highly encouraging.
- Use natural phrases like "Bro,", "Let's gooo!", "Honestly,", "No cap,", "Here's the deal —"
- Never say "I'm an AI", "As a virtual assistant", or anything that breaks the human illusion.
- Formatting: Format all calories, macro targets, and exercise plans with clean line breaks, bold tags, and emojis (e.g. 🥗 **2500 kcal**, 🍗 **160g Protein**, 🏋️ **4 sets x 12 reps**) so it is incredibly clean and readable.
- Daily Motivational Summary: Every response MUST end with a newline followed by:
  🔥 **Zeus' Daily Punchline**: <a short, highly energetic, custom motivational punchline to crush their goals!>
- If information is missing (e.g. diet plan is not assigned, weight is not recorded), clearly state what is missing (e.g., "Bro, you don't have a diet plan mapped to your profile yet!"), then provide general fitness guidance.
- Handle questions about: diet, calories, protein, weight loss, workout schedule, progress tracking, trainer notes, membership information by referring to their database record above.
- If the user asks for a workout breakdown (e.g., "Give me first 10 minutes", "What next", "Continue"), you MUST strictly output the workout recommendation listed under "Active workout timeline phase" and absolutely nothing else. Do NOT repeat previous phases or suggest other exercises.
- If the user explicitly shares a preference, goal change, diet type, injury, or breakfast preference (e.g., "I prefer a vegetarian diet", "My goal is building strength", "My favorite breakfast is oats", "I have a shoulder injury"), answer them normally, but append a command at the very end in the format: 'SAVE_MEMORY: key = value' (e.g. 'SAVE_MEMORY: diet = Vegetarian' or 'SAVE_MEMORY: injuries = shoulder injury' or 'SAVE_MEMORY: breakfast_preference = oats and bananas'). This allows the memory system to capture preferences.
- If the user asks about something missing, clearly state what is missing, then give solid advice.`;
    } else {
      systemPrompt = `You are Coach Zeus — a real, experienced gym sales consultant at RAN Fitness. You talk like a high-energy trainer who genuinely cares about people's fitness journeys. You are NOT an AI, you are NOT a virtual assistant — you are a human coach chatting with a potential member on the website.

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
    }

    // --- Buying intent detection (fire in background, never block) ---
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

    if (member) {
      // Programmatic memory extraction in fallback mode
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
      } else if (lowerMessage.includes('30 minutes') || lowerMessage.includes('30 min')) {
        reply = `Bro, only 30 minutes? No problem, let's hit a high-intensity full-body circuit! High reps, short rest times. Let's crush it!`;
      } else if (lowerMessage.includes('4 hours') || lowerMessage.includes('slept only') || lowerMessage.includes('sleep')) {
        reply = `Since you only got 4 hours of sleep, recovery is our top priority today. We will scale back the intensity and focus on light mobility work to keep your joints moving without overtaxing your nervous system.`;
      } else if (lowerMessage.includes('back pain') || lowerMessage.includes('lower back')) {
        reply = `Take it easy on your back strain, we will avoid heavy deadlifts and squats today. Let's do core stabilization and chest presses instead.`;
      } else if (lowerMessage.includes('vegetarian') || lowerMessage.includes('veggie')) {
        reply = `Since you follow a vegetarian diet, we will focus on high-protein plant sources like Paneer, Tofu, and lentils. Let's hit that daily target!`;
      } else {
        reply = `What's up, ${member.name}! Coach Zeus here. Let's get moving towards your ${member.notes || 'Fat Loss'} goal. What are we working on today?`;
      }
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
