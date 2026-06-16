"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  LogOut, 
  User, 
  Clock, 
  Plus, 
  Scale, 
  Heart, 
  Phone,
  Trophy,
  Flame,
  Award,
  Utensils,
  MessageSquare,
  Camera,
  Send,
  Bot,
  Check,
  Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db, Member, MemberProgress, WorkoutDay, Announcement, Attendance } from '@/lib/database';

interface MemberDashboardClientProps {
  member: Member;
  initialProgress: MemberProgress[];
  initialAttendance: Attendance[];
  workoutSchedule: WorkoutDay[];
  announcements: Announcement[];
  settings: any;
  initialGoal: any;
  initialDietPlan: any;
  initialTrainerNotes: any[];
  initialProgressPhotos: any[];
  initialAchievements: any[];
  initialWorkoutPlan?: any;
  initialBodyMetrics?: any[];
}

const actionChips = [
  "💪 Membership Plans",
  "⏰ Gym Timings",
  "🏋️ Equipment",
  "🔥 Weight Loss",
  "💎 Muscle Gain",
  "🥗 Diet Plan Advice"
];

// Helper to generate unique chat IDs
let chatCounter = 0;
const generateChatId = (sender: string) => {
  chatCounter++;
  return `${sender}_${Date.now()}_${chatCounter}`;
};

export const MemberDashboardClient: React.FC<MemberDashboardClientProps> = ({
  member,
  initialProgress,
  initialAttendance,
  workoutSchedule,
  announcements,
  settings,
  initialGoal,
  initialDietPlan,
  initialTrainerNotes,
  initialProgressPhotos,
  initialAchievements,
  initialWorkoutPlan,
  initialBodyMetrics
}) => {
  const router = useRouter();
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'diet' | 'coach'>('dashboard');

  // Database States
  const [progressList, setProgressList] = useState<MemberProgress[]>(initialProgress);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>(initialAttendance);
  const [goalData, setGoalData] = useState<any>(initialGoal);
  const [dietData, setDietData] = useState<any>(initialDietPlan);
  const [notesList, setNotesList] = useState<any[]>(initialTrainerNotes);
  const [photosList, setPhotosList] = useState<any[]>(initialProgressPhotos);
  const [achList, setAchList] = useState<any[]>(initialAchievements);
  const [workoutPlan, setWorkoutPlan] = useState<any>(initialWorkoutPlan);
  const [bodyMetricsList, setBodyMetricsList] = useState<any[]>(initialBodyMetrics || []);

  // General States
  const [checkingIn, setCheckingIn] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Goal Form Fields
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [gGoalType, setGGoalType] = useState(goalData?.goal || 'Weight Loss');
  const [gStartWeight, setGStartWeight] = useState(goalData?.start_weight || '75');
  const [gTargetWeight, setGTargetWeight] = useState(goalData?.target_weight || '70');
  const [savingGoal, setSavingGoal] = useState(false);

  // Progress Form Fields
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [heightCm, setHeightCm] = useState('175');
  const [notes, setNotes] = useState('');
  const [loggingProgress, setLoggingProgress] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // SVG Trend Chart series
  const [chartTab, setChartTab] = useState<'weight' | 'fat' | 'bmi'>('weight');

  // Selected workout day
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(todayName);

  // Progress Photos upload fields
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [monthLabel, setMonthLabel] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  // Coach Zeus Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: `WHAT'S UP, ${member.name.toUpperCase()}! Coach Zeus here. Ready to dominate your gym sessions? Ask me anything about diet, CrossFit, strength training, or weight loss! Let's crush it!`,
      timestamp: new Date()
    }
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Derived state: BMI
  const w = parseFloat(weight);
  const h = parseFloat(heightCm);
  const bmi = w && h ? (w / ((h / 100) * (h / 100))).toFixed(1) : '';

  // Expiry calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const diffTime = new Date(member.end_date).getTime() - new Date(todayStr).getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpiringSoon = diffDays >= 0 && diffDays <= 7;
  const isExpired = diffDays < 0;

  // Streak calculations
  const computeStreaks = (attendance: Attendance[]) => {
    if (!attendance || attendance.length === 0) {
      return { currentStreak: 0, bestStreak: 0, total: 0 };
    }
    const dates = Array.from(new Set(attendance.map(a => new Date(a.check_in_time).toISOString().split('T')[0]))).sort((a, b) => b.localeCompare(a));
    const total = dates.length;
    if (total === 0) return { currentStreak: 0, bestStreak: 0, total: 0 };

    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const lastCheckIn = dates[0];
    if (lastCheckIn === todayStr || lastCheckIn === yesterdayStr) {
      let checkDateStr = lastCheckIn;
      let idx = 0;
      while (idx < dates.length) {
        if (dates[idx] === checkDateStr) {
          currentStreak++;
          const prevDate = new Date(new Date(checkDateStr).getTime() - 86400000);
          checkDateStr = prevDate.toISOString().split('T')[0];
          idx++;
        } else {
          break;
        }
      }
    }

    let bestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...dates].sort((a, b) => a.localeCompare(b));
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diff = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          if (tempStreak > bestStreak) bestStreak = tempStreak;
          tempStreak = 1;
        }
      }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;

    return { currentStreak, bestStreak, total };
  };

  const { currentStreak, bestStreak, total } = computeStreaks(attendanceList);
  const checkedInToday = attendanceList.some(a => {
    const d = new Date(a.check_in_time).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return d === today;
  });

  // Dynamic Goal Progress calculations
  const currentWeightVal = progressList[0]?.weight || (goalData ? parseFloat(goalData.start_weight) : 75);
  let goalProgressPct = 0;
  if (goalData) {
    const start = parseFloat(goalData.start_weight);
    const target = parseFloat(goalData.target_weight);
    if (goalData.goal === 'Weight Loss' || goalData.goal === 'Fat Loss') {
      const denom = start - target;
      goalProgressPct = denom !== 0 ? Math.round(((start - currentWeightVal) / denom) * 100) : 0;
    } else {
      const denom = target - start;
      goalProgressPct = denom !== 0 ? Math.round(((currentWeightVal - start) / denom) * 100) : 0;
    }
    goalProgressPct = Math.max(0, Math.min(100, goalProgressPct));
  }

  // Dynamic achievements logic
  const initialWeight = progressList.length >= 2 ? progressList[progressList.length - 1].weight : (goalData ? parseFloat(goalData.start_weight) : 0);
  const currentWeight = progressList[0]?.weight || 0;
  const weightChange = initialWeight && currentWeight ? Math.abs(initialWeight - currentWeight) : 0;

  const dynamicAchievements = [
    { name: "10 Check-ins", type: "checkin", icon: "🔥", desc: "Logged 10 total gym entries", unlocked: total >= 10 },
    { name: "30 Day Streak", type: "streak", icon: "🔥", desc: "Maintained a 30-day streak", unlocked: bestStreak >= 30 },
    { name: "5 KG Changed", type: "weight", icon: "🏆", desc: "Logged a 5kg weight difference", unlocked: weightChange >= 5 },
    { name: "Goal Achieved", type: "goal", icon: "🏆", desc: "Reached 100% of target goal", unlocked: goalData && goalProgressPct >= 100 }
  ];

  // Helper: Compress photo before converting to base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_width = 400;
          const scale = max_width / img.width;
          canvas.width = max_width;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.65); // 65% quality
          resolve(compressed);
        };
      };
      reader.onerror = err => reject(err);
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await db.checkInMember(member.member_id);
      if (res) {
        const updated = await db.getMemberAttendance(member.member_id);
        setAttendanceList(updated);
      }
    } catch (err) {
      console.error('Check in failed:', err);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      const saved = await db.saveMemberGoal({
        member_id: member.member_id,
        goal: gGoalType,
        start_weight: parseFloat(gStartWeight),
        target_weight: parseFloat(gTargetWeight)
      });
      setGoalData(saved);
      setEditGoalOpen(false);
    } catch (err) {
      console.error('Failed to save goal:', err);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleUploadPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError('');
    setPhotoSuccess('');
    if (!frontFile && !sideFile && !backFile) {
      setPhotoError('Please select at least one photo to upload.');
      return;
    }
    setUploadingPhotos(true);
    try {
      let frontB64 = '';
      let sideB64 = '';
      let backB64 = '';

      if (frontFile) frontB64 = await compressImage(frontFile);
      if (sideFile) sideB64 = await compressImage(sideFile);
      if (backFile) backB64 = await compressImage(backFile);

      const saved = await db.saveProgressPhotos({
        member_id: member.member_id,
        front_photo: frontB64,
        side_photo: sideB64,
        back_photo: backB64,
        month_label: monthLabel
      });

      setPhotosList([saved, ...photosList]);
      setPhotoSuccess('Photos uploaded and stored successfully!');
      setFrontFile(null);
      setSideFile(null);
      setBackFile(null);
    } catch (err: any) {
      setPhotoError(err.message || 'Photo upload failed.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoggingProgress(true);

    if (!weight || !bodyFat || !chest || !waist || !arms) {
      setFormError('Please fill in all progress measurements.');
      setLoggingProgress(false);
      return;
    }

    try {
      const newProgress = await db.saveMemberProgress({
        member_id: member.member_id,
        weight: parseFloat(weight),
        body_fat: parseFloat(bodyFat),
        chest: parseFloat(chest),
        waist: parseFloat(waist),
        arms: parseFloat(arms),
        bmi: parseFloat(bmi),
        notes
      });

      if (newProgress) {
        setFormSuccess('Progress logged successfully!');
        setWeight('');
        setBodyFat('');
        setChest('');
        setWaist('');
        setArms('');
        setNotes('');
        const updated = await db.getMemberProgress(member.member_id);
        setProgressList(updated);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save progress.');
    } finally {
      setLoggingProgress(false);
    }
  };

  const handleSendChat = async (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text) return;
    if (!textToSend) setChatInputText('');

    const userMsg = {
      id: generateChatId('user'),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const coachMsg = {
          id: generateChatId('coach'),
          sender: 'coach',
          text: data.reply,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, coachMsg]);
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      const coachMsg = {
        id: generateChatId('coach'),
        sender: 'coach',
        text: "PUMP THE IRON! Let's get moving! (Groq Failover: Direct Zeus advice). Increase intensity and consistency, bro!",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, coachMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyCardId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const renderSvgChart = () => {
    const chartSource = bodyMetricsList.length > 0 
      ? bodyMetricsList 
      : progressList.map(p => ({
          weight: p.weight,
          body_fat: p.body_fat,
          bmi: p.bmi,
          created_at: p.created_at
        }));

    if (chartSource.length < 2) {
      return (
        <div className="flex h-48 items-center justify-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500 font-mono">
          Log progress or body metrics at least twice to see your body metrics trend chart.
        </div>
      );
    }

    const width = 500;
    const height = 200;
    const padding = 35;

    const sortedProgress = [...chartSource]
      .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
      .slice(-7);

    const getVal = (p: any) => {
      if (chartTab === 'fat') return parseFloat(p.body_fat);
      if (chartTab === 'bmi') return parseFloat(p.bmi);
      return parseFloat(p.weight);
    };

    const labelText = chartTab === 'fat' ? 'Body Fat %' : chartTab === 'bmi' ? 'BMI Trend' : 'Weight (kg)';
    const suffix = chartTab === 'fat' ? '%' : chartTab === 'bmi' ? '' : ' kg';
    const strokeColor = chartTab === 'fat' ? '#f97316' : chartTab === 'bmi' ? '#22c55e' : '#facc15';

    const vals = sortedProgress.map(getVal);
    const minVal = Math.min(...vals) - 1;
    const maxVal = Math.max(...vals) + 1;
    const range = maxVal - minVal || 1;

    const points = sortedProgress.map((p, idx) => {
      const val = getVal(p);
      const x = padding + (idx / (sortedProgress.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
      return { x, y, val, date: new Date(p.created_at || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-bold flex items-center gap-1.5">
            <TrendingUp size={12} className="text-yellow-400" /> {labelText} Trend (Last 7 logs)
          </h4>
          <div className="flex gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg font-mono text-[9px] uppercase tracking-wider font-bold">
            <button
              onClick={() => setChartTab('weight')}
              className={`px-2.5 py-1 rounded transition-colors ${chartTab === 'weight' ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Weight
            </button>
            <button
              onClick={() => setChartTab('fat')}
              className={`px-2.5 py-1 rounded transition-colors ${chartTab === 'fat' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Fat %
            </button>
            <button
              onClick={() => setChartTab('bmi')}
              className={`px-2.5 py-1 rounded transition-colors ${chartTab === 'bmi' ? 'bg-green-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              BMI Trend
            </button>
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ color: strokeColor }}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#27272a" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3 3" />

          <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          <path 
            d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} 
            fill="url(#grad)" 
            opacity="0.1" 
          />

          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="3.5" fill="#09090b" stroke="currentColor" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="8" fill={strokeColor} opacity="0" className="hover:opacity-20 transition-opacity" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#e4e4e7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                {p.val}{suffix}
              </text>
              <text x={p.x} y={height - padding + 15} textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="monospace">
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Membership Circular Progress metrics
  let totalPlanDays = 30;
  if (member.membership_type === 'Quarterly') totalPlanDays = 90;
  else if (member.membership_type === 'Half-Yearly') totalPlanDays = 180;
  else if (member.membership_type === 'Yearly') totalPlanDays = 365;

  const daysRemaining = Math.max(0, diffDays);
  const daysUsed = Math.max(0, totalPlanDays - daysRemaining);
  const pctRemaining = Math.round((daysRemaining / totalPlanDays) * 100);

  const radius = 38;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pctRemaining / 100) * circumference;

  let ringColor = 'stroke-green-500';
  if (daysRemaining < 15 && daysRemaining >= 8) {
    ringColor = 'stroke-orange-500';
  } else if (daysRemaining < 7) {
    ringColor = 'stroke-red-500';
  }

  // Pre-filled WhatsApp message
  const waPhone = settings?.contact_phone || '9666345644';
  const waText = `Hello RAN Fitness,\nI would like to renew my membership.\nMember ID: ${member.member_id}`;
  const waUrl = `https://wa.me/91${waPhone}?text=${encodeURIComponent(waText)}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }} 
      className="min-h-screen bg-zinc-950 text-white font-sans pb-12 pt-24 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-black text-lg font-black italic">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-black tracking-wide uppercase font-display text-white">
                Member Workspace
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono">
                Welcome back, {member.name} • Gym ID: {member.member_id}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 text-xs font-mono font-bold uppercase transition-all"
          >
            <LogOut size={13} /> Exit Account
          </button>
        </header>

        {/* Expiry Warning Banner */}
        {isExpiringSoon && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
            <div className="flex items-center gap-3 text-yellow-400">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">⚠️ Membership expires in {daysRemaining} days!</h4>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Please renew your plan to avoid interruption of services.</p>
              </div>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4.5 py-2 text-xs font-black uppercase tracking-wider hover:bg-yellow-300 transition-colors w-full md:w-auto justify-center font-mono"
            >
              <Phone size={12} /> Renew Membership
            </a>
          </div>
        )}

        {isExpired && (
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">🚫 Membership Expired</h4>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Your gym entry is blocked. Renew immediately via WhatsApp.</p>
              </div>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-red-500 text-white px-4.5 py-2 text-xs font-black uppercase tracking-wider hover:bg-red-400 transition-colors w-full md:w-auto justify-center font-mono"
            >
              <Phone size={12} /> Renew Plan
            </a>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto scrollbar-none font-mono text-xs uppercase tracking-wider gap-2">
          {[
            { id: 'dashboard', label: '🏠 Dashboard' },
            { id: 'analytics', label: '📊 Body Analytics' },
            { id: 'diet', label: '🥗 Diet & Notes' },
            { id: 'coach', label: '🤖 Coach Zeus' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Membership Cards, Streak & Badges */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Section 1: Membership Card with progress ring */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 shadow-xl flex items-center justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block">RAN FITNESS MEMBER</span>
                      <h2 className="text-xl font-black italic tracking-wide uppercase font-display text-white">{member.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-yellow-400">{member.member_id}</span>
                        <button onClick={() => handleCopyCardId(member.member_id)} className="text-zinc-600 hover:text-yellow-400 transition-colors">
                          {copiedId ? <span className="text-[8px] text-green-500 font-bold">Copied!</span> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="flex gap-2">
                        <span className="text-zinc-500">PLAN:</span>
                        <span className="text-zinc-300 uppercase font-bold">{member.membership_type}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500">JOINED:</span>
                        <span className="text-zinc-300">{member.start_date}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500">EXPIRY:</span>
                        <span className="text-white font-bold">{member.end_date}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500">STATUS:</span>
                        <span className={`px-1 rounded text-[8px] font-bold ${member.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>{member.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG progress ring */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative flex items-center justify-center">
                      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
                        <circle
                          className="stroke-zinc-900"
                          fill="transparent"
                          strokeWidth={stroke}
                          r={normalizedRadius}
                          cx={radius}
                          cy={radius}
                        />
                        <motion.circle
                          className={ringColor}
                          fill="transparent"
                          strokeWidth={stroke}
                          strokeDasharray={circumference + ' ' + circumference}
                          style={{ strokeDashoffset }}
                          strokeLinecap="round"
                          r={normalizedRadius}
                          cx={radius}
                          cy={radius}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </svg>
                      <span className="absolute text-[10px] font-mono font-black italic text-white">{pctRemaining}%</span>
                    </div>
                    <div className="text-center font-mono text-[9px]">
                      <span className="text-zinc-400 block font-bold">{daysRemaining} / {totalPlanDays} Days</span>
                      <span className="text-zinc-650 block">Remaining</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Premium Digital Card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-center space-y-4 shadow-xl text-center relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
                  <div className="absolute top-0 right-0 p-3 text-[8px] font-mono font-black uppercase text-yellow-400 tracking-widest">DIGITAL PASS</div>
                  
                  <div className="w-full text-left border-b border-zinc-850 pb-3">
                    <h3 className="font-display font-black italic tracking-widest text-white text-xs uppercase">RAN FITNESS MEMBER</h3>
                    <p className="text-[8px] font-mono text-zinc-500">SCAN PASS TO LOG CHECK-IN</p>
                  </div>

                  {/* Dynamic QR Server Generation */}
                  <div className="bg-white p-3 rounded-xl shadow-inner inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&color=000000&data=${encodeURIComponent(
                        JSON.stringify({
                          memberId: member.member_id,
                          name: member.name,
                          plan: member.membership_type
                        })
                      )}`}
                      alt="Member QR Code"
                      className="w-28 h-28"
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono font-bold text-white uppercase">{member.name}</h4>
                    <p className="text-[9px] font-mono text-yellow-400 font-black tracking-wider">{member.member_id}</p>
                    <p className="text-[8px] font-mono text-zinc-500">Expiry: {member.end_date}</p>
                  </div>
                </div>

                {/* Section 4: Streak Metrics */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 grid grid-cols-3 gap-2 text-center shadow-lg font-mono">
                  <div className="space-y-1 border-r border-zinc-850">
                    <span className="text-lg">🔥</span>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Current</span>
                    <span className="text-xs font-black text-yellow-400 italic block">{currentStreak} Days</span>
                  </div>
                  <div className="space-y-1 border-r border-zinc-850">
                    <span className="text-lg">🏆</span>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Best</span>
                    <span className="text-xs font-black text-green-400 italic block">{bestStreak} Days</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-lg">✅</span>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Total Logs</span>
                    <span className="text-xs font-black text-white block">{total}</span>
                  </div>
                </div>

                {/* Section 10: Gamified Achievements Badges */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <Award size={14} className="text-yellow-400" /> Gym Achievements
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {dynamicAchievements.map((ach, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-xl border p-3 flex items-start gap-2.5 transition-all ${
                          ach.unlocked 
                            ? 'bg-yellow-400/5 border-yellow-400/20 text-white' 
                            : 'bg-zinc-950/20 border-zinc-900 text-zinc-550 filter grayscale opacity-60'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{ach.icon}</span>
                        <div className="space-y-0.5">
                          <h5 className="text-[10px] font-bold font-mono tracking-wide">{ach.name}</h5>
                          <p className="text-[8px] text-zinc-500 leading-tight">{ach.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Side: Goals, Check-In, Routines */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Section 5: Fitness Goals Progress */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                      <Trophy size={14} className="text-yellow-400" /> Fitness Goal Progress
                    </h3>
                    <button 
                      onClick={() => setEditGoalOpen(!editGoalOpen)}
                      className="text-[9px] font-mono uppercase bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded text-zinc-300 font-bold transition-all"
                    >
                      {editGoalOpen ? 'Cancel' : 'Set Goal'}
                    </button>
                  </div>

                  {editGoalOpen ? (
                    <form onSubmit={handleSaveGoal} className="space-y-3 font-mono text-xs bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500 uppercase font-bold">Goal Focus</label>
                          <select 
                            value={gGoalType} 
                            onChange={(e) => setGGoalType(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white"
                          >
                            <option value="Weight Loss">Weight Loss</option>
                            <option value="Muscle Gain">Muscle Gain</option>
                            <option value="Fat Loss">Fat Loss</option>
                            <option value="General Fitness">General Fitness</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500 uppercase font-bold">Start Weight (kg)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={gStartWeight} 
                            onChange={(e) => setGStartWeight(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500 uppercase font-bold">Target (kg)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={gTargetWeight} 
                            onChange={(e) => setGTargetWeight(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white" 
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={savingGoal}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-2 rounded font-bold text-[10px] uppercase"
                      >
                        {savingGoal ? 'Saving Goal...' : 'Save Fitness Target'}
                      </button>
                    </form>
                  ) : goalData ? (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">GOAL FOCUS:</span>
                        <span className="text-white font-bold uppercase">{goalData.goal}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-lg text-center text-[10px]">
                        <div>
                          <span className="text-zinc-500 block">START</span>
                          <span className="text-white font-bold text-xs">{goalData.start_weight} kg</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">CURRENT</span>
                          <span className="text-yellow-400 font-bold text-xs">{currentWeightVal} kg</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">TARGET</span>
                          <span className="text-green-400 font-bold text-xs">{goalData.target_weight} kg</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] text-zinc-500 font-bold">
                          <span>PROGRESS PERCENTAGE</span>
                          <span className="text-yellow-400">{goalProgressPct}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500" 
                            style={{ width: `${goalProgressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-5 text-center flex flex-col items-center justify-center gap-2.5 group hover:border-yellow-400/20 transition-all duration-300">
                      <p className="text-[10px] text-zinc-400 font-mono">No fitness target configured yet.</p>
                      <button 
                        onClick={() => setEditGoalOpen(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-mono font-bold uppercase text-[9px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-yellow-400/10"
                      >
                        Set Goal 🎯
                      </button>
                    </div>
                  )}
                </div>

                {/* Attendance Check-In Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-yellow-400" /> Attendance Entry
                    </h3>

                    {checkedInToday ? (
                      <div className="rounded-xl border border-green-500/20 bg-green-950/20 p-4 text-center space-y-2">
                        <span className="text-2xl">🏆</span>
                        <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider font-mono">Logged Checked In!</h4>
                        <p className="text-[9px] text-zinc-500 font-mono">
                          Check-in: {new Date(attendanceList[0]?.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Scan your QR pass at the desk or click below to check in.
                        </p>
                        <button
                          onClick={handleCheckIn}
                          disabled={checkingIn || isExpired}
                          className="w-full rounded-xl bg-yellow-400 text-black py-2.5 text-xs font-black uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 font-mono"
                        >
                          {checkingIn ? 'Logging Check-in...' : isExpired ? 'Expired' : 'Check In Now'}
                        </button>
                      </div>
                    )}

                    {/* Attendance Logs */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono font-bold border-b border-zinc-850 pb-1">Recent checkins</h4>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[9px] scrollbar-thin">
                        {attendanceList.slice(0, 5).map((a, idx) => (
                          <div key={idx} className="flex justify-between items-center rounded bg-zinc-950/50 px-2 py-1.5 border border-zinc-900">
                            <span className="text-zinc-400 flex items-center gap-1">
                              <Clock size={10} className="text-yellow-400/60" />
                              {new Date(a.check_in_time).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-zinc-300 font-bold">
                              {new Date(a.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Workout Routine Strip */}
                  <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                      <Dumbbell size={14} className="text-yellow-400" /> Workout Plan
                    </h3>

                    {workoutPlan ? (
                      <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                          <div>
                            <span className="text-[8px] text-zinc-500 font-mono block uppercase font-bold">Today's Workout</span>
                            <h4 className="text-xs font-bold text-yellow-400 font-sans uppercase">{workoutPlan.today_workout || 'No custom name'}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-zinc-500 font-mono block uppercase font-bold">Sets & Reps</span>
                            <span className="text-[10px] font-mono text-zinc-300 font-bold">{workoutPlan.sets_reps || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-zinc-500 font-mono block uppercase font-bold">Exercises List</span>
                          <div className="grid grid-cols-1 gap-2">
                            {workoutPlan.exercises ? (
                              workoutPlan.exercises.split(',').map((ex: string, idx: number) => (
                                <div key={idx} className="bg-zinc-900/60 rounded px-2.5 py-1.5 text-xs text-zinc-300 font-sans flex items-center gap-2 border border-zinc-850">
                                  <span className="h-4 w-4 bg-yellow-400/20 text-yellow-400 text-[10px] font-mono font-bold flex items-center justify-center rounded-full">{idx + 1}</span>
                                  {ex.trim()}
                                </div>
                              ))
                            ) : (
                              <span className="text-zinc-550 text-[10px] italic">No exercises added yet.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
                          {daysOfWeek.map((day) => {
                            const isToday = day === todayName;
                            const isSelected = day === selectedDay;
                            return (
                              <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-2 py-1 rounded text-[8px] font-mono font-bold uppercase border transition-all flex-shrink-0 ${
                                  isSelected 
                                    ? 'bg-yellow-400 border-yellow-400 text-black' 
                                    : isToday 
                                      ? 'bg-zinc-850 border-yellow-400/40 text-yellow-400' 
                                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                                }`}
                              >
                                {day.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>

                        {(() => {
                          const dayRoutine = workoutSchedule.find(s => s.day === selectedDay);
                          return (
                            <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-3 space-y-2">
                              <h4 className="text-xs font-bold text-white font-sans">{dayRoutine?.title || 'Recovery'}</h4>
                              <p className="text-[10px] text-zinc-400 leading-normal font-sans">{dayRoutine?.description || 'Take a light rest day and stretch.'}</p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </section>

                  {/* Trainer Advisory Note Banner */}
                  <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3.5 shadow-lg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                      <MessageSquare size={14} className="text-yellow-400" /> Trainer Advisory
                    </h3>
                    {notesList && notesList.length > 0 ? (
                      <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 space-y-2 relative">
                        <span className="absolute top-3 right-4 text-[8px] text-zinc-650 font-mono">
                          {new Date(notesList[0].created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <span className="text-[9px] text-yellow-400 uppercase font-black tracking-wider flex items-center gap-1">
                          <User size={10} /> Head Coach Vikram
                        </span>
                        <p className="text-zinc-300 font-sans text-xs leading-normal pt-1">{notesList[0].note}</p>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-5 text-center flex flex-col items-center justify-center gap-2 group hover:border-yellow-400/20 transition-all duration-300">
                        <div className="w-8 h-8 rounded-full bg-zinc-900/50 border border-zinc-850 flex items-center justify-center text-zinc-500 group-hover:text-yellow-400 transition-colors duration-300">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">No trainer advisory notes logged yet. Keep pushing hard!</p>
                      </div>
                    )}
                  </section>

                </div>

                {/* Announcements Banner */}
                {announcements.length > 0 && (
                  <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-lg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                      <Bell size={14} className="text-yellow-400" /> Gym Notices
                    </h3>
                    <div className="space-y-2">
                      {announcements.slice(0, 2).map((ann) => (
                        <div key={ann.id} className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 space-y-1 font-mono text-[10px]">
                          <div className="flex justify-between items-center text-zinc-400">
                            <span className="font-bold text-yellow-400">{ann.title}</span>
                            <span className="text-[8px]">{new Date(ann.created_at || '').toLocaleDateString('en-IN')}</span>
                          </div>
                          <p className="text-zinc-300 font-sans text-xs leading-normal">{ann.message}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>

            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SVG Charts Area (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Section 6: Body Analytics Chart */}
                {renderSvgChart()}

                {/* Section 9: Progress Photos Comp Upload */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <Camera size={14} className="text-yellow-400" /> Progress Photo Comparison
                  </h3>

                  {photoError && <div className="text-[10px] bg-red-950/40 border border-red-500/20 text-red-400 rounded p-2 font-mono">❌ {photoError}</div>}
                  {photoSuccess && <div className="text-[10px] bg-green-950/40 border border-green-500/20 text-green-400 rounded p-2 font-mono">✅ {photoSuccess}</div>}

                  <form onSubmit={handleUploadPhotos} className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-[10px] bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase block font-bold">Front Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                        className="w-full text-[9px] text-zinc-400" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase block font-bold">Side Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setSideFile(e.target.files?.[0] || null)}
                        className="w-full text-[9px] text-zinc-400" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase block font-bold">Back Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                        className="w-full text-[9px] text-zinc-400" 
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                      <button 
                        type="submit" 
                        disabled={uploadingPhotos}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold uppercase rounded py-2 transition-all w-full text-center"
                      >
                        {uploadingPhotos ? 'Saving...' : 'Upload Entry'}
                      </button>
                    </div>
                  </form>

                  {/* Photos comparison timeline */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono font-bold">Photo History Comparison</h4>
                    {photosList.length === 0 ? (
                      <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-6 text-center flex flex-col items-center justify-center gap-2 group hover:border-yellow-400/20 transition-all duration-300">
                        <Camera className="w-5 h-5 text-zinc-650 group-hover:text-yellow-400 transition-colors duration-300" />
                        <span className="text-zinc-500 font-mono text-[10px]">No progress photos uploaded yet. Track your journey!</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {photosList.map((p, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 space-y-2.5">
                            <div className="flex justify-between items-center border-b border-zinc-850 pb-1.5 font-mono text-[9px]">
                              <span className="text-yellow-400 font-bold uppercase">{p.month_label}</span>
                              <span className="text-zinc-550">{new Date(p.created_at).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-[8px] font-mono text-zinc-500">
                              <div className="space-y-1">
                                {p.front_photo ? (
                                  <img src={p.front_photo} alt="Front View" className="w-full h-32 object-cover rounded-lg border border-zinc-850 shadow" />
                                ) : (
                                  <div className="w-full h-32 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-850">no front</div>
                                )}
                                <span>FRONT</span>
                              </div>
                              <div className="space-y-1">
                                {p.side_photo ? (
                                  <img src={p.side_photo} alt="Side View" className="w-full h-32 object-cover rounded-lg border border-zinc-850 shadow" />
                                ) : (
                                  <div className="w-full h-32 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-850">no side</div>
                                )}
                                <span>SIDE</span>
                              </div>
                              <div className="space-y-1">
                                {p.back_photo ? (
                                  <img src={p.back_photo} alt="Back View" className="w-full h-32 object-cover rounded-lg border border-zinc-850 shadow" />
                                ) : (
                                  <div className="w-full h-32 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-850">no back</div>
                                )}
                                <span>BACK</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </section>

              </div>

              {/* Log Stats Form (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <form onSubmit={handleLogProgress} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <Plus size={14} className="text-yellow-400" /> Log Today&apos;s Metrics
                  </h3>

                  {formError && <div className="text-[10px] bg-red-950/40 border border-red-500/20 text-red-400 rounded p-2 font-mono">❌ {formError}</div>}
                  {formSuccess && <div className="text-[10px] bg-green-950/40 border border-green-500/20 text-green-400 rounded p-2 font-mono">✅ {formSuccess}</div>}

                  <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">Weight (kg)</label>
                      <input 
                        type="number" step="0.1" required placeholder="e.g. 72.5" 
                        value={weight} onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">Body Fat %</label>
                      <input 
                        type="number" step="0.1" required placeholder="e.g. 18.2" 
                        value={bodyFat} onChange={(e) => setBodyFat(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">Chest (in)</label>
                      <input 
                        type="number" step="0.1" required placeholder="e.g. 38.0" 
                        value={chest} onChange={(e) => setChest(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">Waist (in)</label>
                      <input 
                        type="number" step="0.1" required placeholder="e.g. 32.5" 
                        value={waist} onChange={(e) => setWaist(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">Arms (in)</label>
                      <input 
                        type="number" step="0.1" required placeholder="e.g. 14.5" 
                        value={arms} onChange={(e) => setArms(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">Height (cm)</label>
                      <input 
                        type="number" required 
                        value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[9px] pt-1">
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">BMI (computed)</label>
                      <input type="text" disabled value={bmi} className="w-full bg-zinc-950/80 border border-zinc-850 rounded p-2 text-xs text-yellow-400 font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 uppercase font-bold">Optional Notes</label>
                      <input type="text" placeholder="feeling strong" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={loggingProgress}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-2.5 rounded font-black uppercase text-xs tracking-widest transition-colors font-mono"
                  >
                    {loggingProgress ? 'Logging...' : 'Save Metrics Entry'}
                  </button>
                </form>

                {/* Stats list */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-lg">
                  <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-bold border-b border-zinc-850 pb-1">Historical Log Entries</h4>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
                    {progressList.map((p, idx) => (
                      <div key={idx} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between items-center text-zinc-500 border-b border-zinc-900 pb-1 text-[9px]">
                          <span className="font-bold text-yellow-400/80">ENTRY #{progressList.length - idx}</span>
                          <span>{new Date(p.created_at || '').toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-zinc-300">
                          <div>
                            <span className="text-zinc-650 block text-[8px]">WT</span>
                            <span className="font-bold">{p.weight} kg</span>
                          </div>
                          <div>
                            <span className="text-zinc-650 block text-[8px]">FAT</span>
                            <span className="font-bold text-orange-400">{p.body_fat}%</span>
                          </div>
                          <div>
                            <span className="text-zinc-650 block text-[8px]">BMI</span>
                            <span className="font-bold text-yellow-500">{p.bmi}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'diet' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Section 7: Diet Plan Details (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <Utensils size={14} className="text-yellow-400" /> My Diet & Nutrition Plan
                  </h3>

                  {dietData ? (
                    <div className="space-y-4 font-sans text-xs">
                      
                      {/* Targets Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-950 p-4 border border-zinc-900 rounded-xl font-mono text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-bold">Calories Target</span>
                          <span className="text-yellow-400 font-black text-sm">{dietData.calories_target || 2000} kcal</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-bold">Protein Target</span>
                          <span className="text-orange-400 font-black text-sm">{dietData.protein_target || 150}g</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-bold">Diet Compliance</span>
                          <span className="text-green-400 font-black text-sm">{dietData.compliance_pct || 100}%</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-bold">Meal Schedule</span>
                          <span className="text-white font-bold text-xs truncate block">{dietData.meal_schedule || 'Flexible'}</span>
                        </div>
                      </div>

                      <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 space-y-1.5">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-yellow-400">🍳 Breakfast</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">{dietData.breakfast || 'None assigned yet.'}</p>
                      </div>

                      <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 space-y-1.5">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-yellow-400">🥗 Lunch</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">{dietData.lunch || 'None assigned yet.'}</p>
                      </div>

                      <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 space-y-1.5">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-yellow-400">🍎 Snacks</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">{dietData.snacks || 'None assigned yet.'}</p>
                      </div>

                      <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 space-y-1.5">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-yellow-400">🍗 Dinner</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">{dietData.dinner || 'None assigned yet.'}</p>
                      </div>

                      <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 space-y-1.5">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-yellow-400">💊 Supplements</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">{dietData.supplements || 'None assigned yet.'}</p>
                      </div>

                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-8 text-center flex flex-col items-center justify-center gap-3 group hover:border-yellow-400/20 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/[0.02] to-transparent pointer-events-none" />
                      <div className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-850 flex items-center justify-center text-zinc-500 group-hover:text-yellow-400 group-hover:border-yellow-400/30 transition-all duration-300">
                        <Utensils className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1 max-w-xs">
                        <h4 className="font-mono text-xs uppercase font-bold text-zinc-300">No Diet Assigned</h4>
                        <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">Your personalized macros, calorie targets, and meal breakdown will appear here once Vikram maps your plan.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Section 8: Trainer Notes (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <MessageSquare size={14} className="text-yellow-400" /> Trainer Advisory Notes
                  </h3>

                   {notesList.length === 0 ? (
                    <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-8 text-center flex flex-col items-center justify-center gap-3 group hover:border-yellow-400/20 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/[0.02] to-transparent pointer-events-none" />
                      <div className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-850 flex items-center justify-center text-zinc-500 group-hover:text-yellow-400 group-hover:border-yellow-400/30 transition-all duration-300">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-xs">
                        <h4 className="font-mono text-xs uppercase font-bold text-zinc-300">No Advisory Notes</h4>
                        <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">Trainer feedback, performance reviews, and adjustment notes will show up in this feed.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 font-mono text-[10px]">
                      {notesList.map((n, idx) => (
                        <div key={idx} className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-4 space-y-1.5 relative">
                          <span className="absolute top-3 right-4 text-[8px] text-zinc-600 font-mono">{new Date(n.created_at).toLocaleDateString('en-IN')}</span>
                          <span className="text-[9px] text-yellow-400 uppercase font-black tracking-wider flex items-center gap-1"><User size={10} /> Head Coach</span>
                          <p className="text-zinc-300 font-sans text-xs leading-normal pt-1">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {activeTab === 'coach' && (
            <div className="max-w-3xl mx-auto bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[520px] shadow-2xl relative">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between bg-zinc-900/80 px-5 py-3.5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-black">
                      <Bot size={18} />
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-black italic tracking-wide text-white uppercase flex items-center gap-1.5">
                      COACH ZEUS AI ASSISTANT
                    </h4>
                    <p className="text-[8px] text-yellow-500 uppercase tracking-widest font-mono">
                      Online • Personalized Fitness Consultant
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
                {chatMessages.map((m) => (
                  <div key={m.id} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${m.sender === 'user' ? 'bg-zinc-800 text-zinc-300' : 'bg-yellow-400/20 text-yellow-400'}`}>
                      {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="max-w-[75%] space-y-1">
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${m.sender === 'user' ? 'bg-yellow-400 text-black font-semibold rounded-tr-none' : 'bg-zinc-950 border border-zinc-900 text-zinc-200 rounded-tl-none'}`}>
                        {m.text}
                      </div>
                      <span className="text-[8px] text-zinc-600 block px-1 text-right font-mono">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-400">
                      <Bot size={14} />
                    </div>
                    <div className="rounded-2xl rounded-tl-none border border-zinc-900 bg-zinc-950 px-4 py-3 text-xs text-zinc-500 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="block h-1.5 w-1.5 rounded-full bg-yellow-400"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[9px]">Coach Zeus is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Action Prompt Chips */}
              <div className="border-t border-zinc-850 bg-zinc-950/40 px-4 py-2">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {actionChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSendChat(chip)}
                      disabled={chatLoading}
                      className="flex-shrink-0 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[9px] font-mono font-bold text-zinc-400 hover:border-yellow-400/65 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all disabled:opacity-40 whitespace-nowrap"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask Coach Zeus..."
                  className="flex-1 rounded-lg border border-zinc-850 bg-zinc-900 px-3.5 py-2 text-xs focus:border-yellow-400 focus:outline-none text-zinc-200 placeholder-zinc-650"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={!chatInputText.trim() || chatLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
};
