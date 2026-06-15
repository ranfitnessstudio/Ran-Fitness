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
    console.error('Failed to send Telegram message:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[TELEGRAM WEBHOOK RECEIVE]:', JSON.stringify(body));

    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ success: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const username = message.from?.username || '';
    const ownerChatId = process.env.TELEGRAM_CHAT_ID;

    // Security check: Only allow the gym owner
    if (!ownerChatId || chatId !== String(ownerChatId)) {
      await sendTelegramMessage(chatId, "🚫 Unauthorized: Only the gym owner can execute commands.");
      return NextResponse.json({ success: true });
    }

    // Check if there is an active session
    const session = await db.getTelegramSession(chatId);

    if (session) {
      const state = session.state;
      const data = session.data || {};

      if (state === 'AWAITING_NAME') {
        data.name = text;
        await db.saveTelegramSession(chatId, 'AWAITING_PHONE', data);
        await sendTelegramMessage(chatId, `Got it! Name is: ${text}.\n\nNow, reply with their Phone Number (e.g. 9666345644):`);
        return NextResponse.json({ success: true });
      }

      if (state === 'AWAITING_PHONE') {
        data.phone = text;
        await db.saveTelegramSession(chatId, 'AWAITING_PLAN', data);
        await sendTelegramMessage(chatId, `Phone is: ${text}.\n\nNow, reply with their Membership Plan:\n• Monthly\n• Quarterly\n• Half-Yearly\n• Yearly`);
        return NextResponse.json({ success: true });
      }

      if (state === 'AWAITING_PLAN') {
        const plan = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        const validPlans = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
        
        if (!validPlans.includes(plan)) {
          await sendTelegramMessage(chatId, `Invalid plan "${text}". Please type one of: Monthly, Quarterly, Half-Yearly, Yearly.`);
          return NextResponse.json({ success: true });
        }

        // Calculate start and end dates
        const start = new Date().toISOString().split('T')[0];
        let days = 30;
        if (plan === 'Quarterly') days = 90;
        else if (plan === 'Half-Yearly') days = 180;
        else if (plan === 'Yearly') days = 365;
        
        const end = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

        try {
          // Register member directly
          const newMember = await db.saveMember({
            name: data.name,
            phone: data.phone,
            email: '',
            membership_type: plan as any,
            start_date: start,
            end_date: end,
            status: 'Active',
            notes: 'TELEGRAM REGISTERED'
          });

          const formattedExpiry = new Date(newMember.end_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          await sendTelegramMessage(
            chatId,
            `🎉 MEMBER CREATED SUCCESSFULLY\n\nName: ${newMember.name}\nPhone: ${newMember.phone}\nMember ID: ${newMember.member_id}\nPlan: ${newMember.membership_type}\nExpiry: ${formattedExpiry}`
          );

          // Clear session
          await db.deleteTelegramSession(chatId);
          await db.logTelegramCommand({ command: `/addmember [Completed]`, chat_id: chatId, username, response: `Member created: ${newMember.member_id}` });
        } catch (saveErr: any) {
          await sendTelegramMessage(chatId, `❌ Registration failed: ${saveErr.message || 'database error'}`);
          await db.deleteTelegramSession(chatId);
        }

        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ success: true });
    }

    // Process fresh commands
    const parts = text.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    if (command === '/start' || command === '/help') {
      const helpMsg = `🤖 RAN FITNESS GYM BOT\n\nUse these commands to manage the gym:\n\n• /addmember - Register new member\n• /member <id> - View member details\n• /renew <id> - Renew plan (+30/+90/+180/+365 days)\n• /suspend <id> - Suspend member\n• /delete <id> - Delete member profile\n• /stats - Revenue and members stats\n• /expiring - Expired or expiring memberships\n• /leads - View last 5 leads\n• /checkins - View today's check-ins\n• /announce <msg> - Broadcast announcement\n• /help - Show this guide`;
      await sendTelegramMessage(chatId, helpMsg);
      await db.logTelegramCommand({ command, chat_id: chatId, username, response: 'Help guide sent' });
      return NextResponse.json({ success: true });
    }

    if (command === '/addmember') {
      await db.saveTelegramSession(chatId, 'AWAITING_NAME', {});
      await sendTelegramMessage(chatId, "Let's register a new gym member!\n\nPlease reply with their Full Name:");
      await db.logTelegramCommand({ command, chat_id: chatId, username, response: 'Start awaiting name session' });
      return NextResponse.json({ success: true });
    }

    if (command === '/member') {
      if (!arg) {
        await sendTelegramMessage(chatId, "⚠️ Usage: /member <id>\nExample: /member RF1001");
        return NextResponse.json({ success: true });
      }

      const member = await db.getMemberById(arg);
      if (!member) {
        await sendTelegramMessage(chatId, `❌ No member found with ID: ${arg}`);
        return NextResponse.json({ success: true });
      }

      const expiryFormatted = new Date(member.end_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const joinedFormatted = new Date(member.start_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const details = `👤 MEMBER DETAILS\n\nMember ID: ${member.member_id}\nName: ${member.name}\nPhone: ${member.phone}\nPlan: ${member.membership_type}\nJoined: ${joinedFormatted}\nExpiry: ${expiryFormatted}\nStatus: ${member.status}\nNotes: ${member.notes || 'none'}`;
      await sendTelegramMessage(chatId, details);
      await db.logTelegramCommand({ command: `/member ${arg}`, chat_id: chatId, username, response: `Sent details for ${member.member_id}` });
      return NextResponse.json({ success: true });
    }

    if (command === '/renew') {
      if (!arg) {
        await sendTelegramMessage(chatId, "⚠️ Usage: /renew <id>\nExample: /renew RF1001");
        return NextResponse.json({ success: true });
      }

      const member = await db.getMemberById(arg);
      if (!member) {
        await sendTelegramMessage(chatId, `❌ No member found with ID: ${arg}`);
        return NextResponse.json({ success: true });
      }

      let days = 30;
      if (member.membership_type === 'Quarterly') days = 90;
      else if (member.membership_type === 'Half-Yearly') days = 180;
      else if (member.membership_type === 'Yearly') days = 365;

      const currentEnd = new Date(member.end_date);
      const baseTime = currentEnd.getTime() > Date.now() ? currentEnd.getTime() : Date.now();
      const newEnd = new Date(baseTime + days * 86400000).toISOString().split('T')[0];

      await db.saveMember({
        ...member,
        end_date: newEnd,
        status: 'Active',
        notes: 'TELEGRAM RENEWAL'
      });

      const formattedNewEnd = new Date(newEnd).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      await sendTelegramMessage(chatId, `🟢 Membership for ${member.name} (${member.member_id}) successfully renewed!\n\nNew Expiry Date: ${formattedNewEnd}`);
      await db.logTelegramCommand({ command: `/renew ${arg}`, chat_id: chatId, username, response: `Renewed member ${member.member_id} to ${newEnd}` });
      return NextResponse.json({ success: true });
    }

    if (command === '/suspend') {
      if (!arg) {
        await sendTelegramMessage(chatId, "⚠️ Usage: /suspend <id>\nExample: /suspend RF1001");
        return NextResponse.json({ success: true });
      }

      const member = await db.getMemberById(arg);
      if (!member) {
        await sendTelegramMessage(chatId, `❌ No member found with ID: ${arg}`);
        return NextResponse.json({ success: true });
      }

      await db.saveMember({
        ...member,
        status: 'Suspended',
        notes: 'SUSPENDED VIA TELEGRAM'
      });

      await sendTelegramMessage(chatId, `⏸ Member ${member.name} (${member.member_id}) status set to Suspended.`);
      await db.logTelegramCommand({ command: `/suspend ${arg}`, chat_id: chatId, username, response: `Suspended member ${member.member_id}` });
      return NextResponse.json({ success: true });
    }

    if (command === '/delete') {
      if (!arg) {
        await sendTelegramMessage(chatId, "⚠️ Usage: /delete <id>\nExample: /delete RF1001");
        return NextResponse.json({ success: true });
      }

      const member = await db.getMemberById(arg);
      if (!member) {
        await sendTelegramMessage(chatId, `❌ No member found with ID: ${arg}`);
        return NextResponse.json({ success: true });
      }

      await db.deleteMember(member.id!);
      await sendTelegramMessage(chatId, `🗑️ Profile for ${member.name} (${member.member_id}) has been permanently deleted.`);
      await db.logTelegramCommand({ command: `/delete ${arg}`, chat_id: chatId, username, response: `Deleted member ${member.member_id}` });
      return NextResponse.json({ success: true });
    }

    if (command === '/stats') {
      const members = await db.getMembers();
      const total = members.length;
      const active = members.filter(m => m.status === 'Active' || m.status === 'Expiring Soon').length;
      const expired = members.filter(m => m.status === 'Expired').length;
      
      const monthlyRevenue = members.reduce((sum, m) => {
        if (m.status === 'Expired' || m.status === 'Suspended') return sum;
        if (m.membership_type === 'Monthly') return sum + 2000;
        if (m.membership_type === 'Quarterly') return sum + 5500 / 3;
        if (m.membership_type === 'Half-Yearly') return sum + 10000 / 6;
        if (m.membership_type === 'Yearly') return sum + 18000 / 12;
        return sum;
      }, 0);

      const statsMsg = `📊 RAN FITNESS BUSINESS STATS\n\nTotal Registered: ${total} Members\nActive Plan Holders: ${active}\nExpired Plan Holders: ${expired}\n\nEstimated Monthly Revenue: ${Math.round(monthlyRevenue)} INR\nProjected Yearly Revenue: ${Math.round(monthlyRevenue * 12)} INR`;
      await sendTelegramMessage(chatId, statsMsg);
      await db.logTelegramCommand({ command, chat_id: chatId, username, response: 'Sent business stats' });
      return NextResponse.json({ success: true });
    }

    if (command === '/expiring') {
      const members = await db.getMembers();
      const todayStr = new Date().toISOString().split('T')[0];
      
      const expiring = members.filter(m => {
        if (m.status === 'Suspended') return false;
        const diff = Math.ceil((new Date(m.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
        return diff <= 7;
      }).sort((a, b) => a.end_date.localeCompare(b.end_date));

      if (expiring.length === 0) {
        await sendTelegramMessage(chatId, "🟢 No memberships are expired or expiring in the next 7 days!");
        return NextResponse.json({ success: true });
      }

      let list = `⚠️ EXPIRED & EXPIRING MEMBERSHIPS\n\n`;
      expiring.forEach(m => {
        const diff = Math.ceil((new Date(m.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) {
          list += `• ${m.member_id} - ${m.name}: EXPIRED (${Math.abs(diff)} days ago)\n`;
        } else if (diff === 0) {
          list += `• ${m.member_id} - ${m.name}: EXPIRES TODAY!\n`;
        } else {
          list += `• ${m.member_id} - ${m.name}: Expiring in ${diff} days (${m.end_date})\n`;
        }
      });

      await sendTelegramMessage(chatId, list);
      await db.logTelegramCommand({ command, chat_id: chatId, username, response: `Sent expiring list (${expiring.length} members)` });
      return NextResponse.json({ success: true });
    }

    if (command === '/leads') {
      const leads = await db.getLeads();
      const recent = leads.slice(0, 5);

      if (recent.length === 0) {
        await sendTelegramMessage(chatId, "📭 No leads captured in system yet.");
        return NextResponse.json({ success: true });
      }

      let msg = `🔥 LATEST BOOKING LEADS\n\n`;
      recent.forEach((l, idx) => {
        msg += `${idx + 1}. ${l.name} (${l.phone})\n🎯 Goal: ${l.goal || 'General'}\n⏰ Slot: ${l.preferred_time || 'not set'}\n📅 Status: ${l.status}\n\n`;
      });

      await sendTelegramMessage(chatId, msg);
      await db.logTelegramCommand({ command, chat_id: chatId, username, response: 'Sent leads list' });
      return NextResponse.json({ success: true });
    }

    if (command === '/checkins') {
      const todayStr = new Date().toISOString().split('T')[0];
      const checkins = await db.getDailyAttendance(todayStr);

      if (checkins.length === 0) {
        await sendTelegramMessage(chatId, "🏃 No members checked in yet today.");
        return NextResponse.json({ success: true });
      }

      const members = await db.getMembers();
      
      let list = `✅ TODAY'S CHECK-INS (${checkins.length})\n\n`;
      checkins.forEach((c) => {
        const m = members.find(x => x.member_id === c.member_id);
        const name = m ? m.name : 'Unknown Member';
        const time = new Date(c.check_in_time).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        list += `• ${c.member_id} - ${name} (${time})\n`;
      });

      await sendTelegramMessage(chatId, list);
      await db.logTelegramCommand({ command, chat_id: chatId, username, response: 'Sent checkins list' });
      return NextResponse.json({ success: true });
    }

    if (command === '/announce') {
      if (!arg) {
        await sendTelegramMessage(chatId, "⚠️ Usage: /announce <broadcast message>\nExample: /announce RAN Gym will be closed on Sunday for maintenance.");
        return NextResponse.json({ success: true });
      }

      await db.saveAnnouncement({
        title: 'RAN Fitness Broadcast',
        message: arg
      });

      await db.saveTelegramAnnouncement(arg, chatId);

      const members = await db.getMembers();
      const activeMembers = members.filter(m => m.status === 'Active' || m.status === 'Expiring Soon');
      
      let broadcastCount = 0;
      for (const m of activeMembers) {
        if (m.telegram_chat_id) {
          await sendTelegramMessage(m.telegram_chat_id, `📢 GYM ANNOUNCEMENT\n\n${arg}`);
          broadcastCount++;
        }
      }

      await sendTelegramMessage(chatId, `📢 Broadcast complete! Saved in database and sent directly to ${broadcastCount} members via Telegram.`);
      await db.logTelegramCommand({ command: '/announce', chat_id: chatId, username, response: `Broadcast announcement: "${arg.slice(0, 30)}..." to ${broadcastCount} members` });
      return NextResponse.json({ success: true });
    }

    await sendTelegramMessage(chatId, "❓ Command not recognized. Type /help to see all available commands.");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Error in Telegram Webhook:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
