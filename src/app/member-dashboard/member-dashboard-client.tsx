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
  Copy,
  X
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

const dashboardCategories = [
  { id: "Strength Training", label: "🏋️ Strength Training" },
  { id: "HIIT & Cardio", label: "🏃 HIIT & Cardio" },
  { id: "Functional Fitness", label: "🤸 Functional Fitness" },
  { id: "Fat Loss Special", label: "🔥 Fat Loss Special" },
  { id: "Muscle Gain", label: "💪 Muscle Gain" },
  { id: "Mobility & Flex", label: "🧘 Mobility & Flex" },
  { id: "Recovery & Yoga", label: "🌱 Recovery & Yoga" }
];

const dashboardWorkouts = [
  // Strength Training
  {
    id: "str_1",
    name: "Full Body Power Hypertrophy",
    category: "Strength Training",
    duration: "45 mins",
    difficulty: "Advanced",
    calories: "450 kcal",
    description: "High load compound movements targeting major muscle groups for maximum hypertrophic response.",
    image: "/images/back_muscle_traps.png",
    exercises: ["Barbell Squats: 4 sets x 8 reps", "Bench Press: 4 sets x 8 reps", "Deadlifts: 3 sets x 5 reps", "Overhead Press: 3 sets x 10 reps"]
  },
  {
    id: "str_2",
    name: "Push Day Strength Focus",
    category: "Strength Training",
    duration: "50 mins",
    difficulty: "Intermediate",
    calories: "400 kcal",
    description: "Heavy bench press, overhead press, and tricep extensions.",
    image: "/images/male_athlete.png",
    exercises: ["Incline DB Press: 3 sets x 10 reps", "Dips: 3 sets x max reps", "Lateral Raises: 4 sets x 12 reps", "Tricep Pushdowns: 3 sets x 15 reps"]
  },
  {
    id: "str_3",
    name: "Pull Day Back Builder",
    category: "Strength Training",
    duration: "45 mins",
    difficulty: "Intermediate",
    calories: "380 kcal",
    description: "Focusing on rows, pull-ups, and deadlifts for a strong back.",
    image: "/images/back_muscle_traps.png",
    exercises: ["Pull-Ups: 4 sets x 8 reps", "Barbell Rows: 3 sets x 10 reps", "Lat Pulldowns: 3 sets x 12 reps", "Face Pulls: 4 sets x 15 reps"]
  },
  {
    id: "str_4",
    name: "Lower Body Compound Builder",
    category: "Strength Training",
    duration: "60 mins",
    difficulty: "Advanced",
    calories: "550 kcal",
    description: "Squats, lunges, and leg presses for lower body foundation.",
    image: "/images/male_athlete.png",
    exercises: ["Leg Press: 4 sets x 10 reps", "Romanian Deadlifts: 3 sets x 10 reps", "Bulgarian Split Squats: 3 sets x 8 reps each", "Calf Raises: 4 sets x 15 reps"]
  },

  // HIIT & Cardio
  {
    id: "cardio_1",
    name: "Metabolic Conditioning (MetCon)",
    category: "HIIT & Cardio",
    duration: "30 mins",
    difficulty: "Intermediate",
    calories: "500 kcal",
    description: "Short high-intensity intervals followed by active rest periods.",
    image: "/images/female_athlete.png",
    exercises: ["Burpees: 45s work, 15s rest", "Kettlebell Swings: 45s work, 15s rest", "Thrusters: 45s work, 15s rest", "Rowing Machine: 45s work, 15s rest"]
  },
  {
    id: "cardio_2",
    name: "Zumba Dance Cardio",
    category: "HIIT & Cardio",
    duration: "45 mins",
    difficulty: "Beginner",
    calories: "350 kcal",
    description: "High-tempo rhythmic dance workout led by our top dance coaches.",
    image: "/images/female_athlete.png",
    exercises: ["Latin Warmup: 5 mins", "High Tempo Zumba Tracks: 35 mins", "Cool Down & Stretch: 5 mins"]
  },
  {
    id: "cardio_3",
    name: "Tabata Shred Protocol",
    category: "HIIT & Cardio",
    duration: "20 mins",
    difficulty: "Advanced",
    calories: "300 kcal",
    description: "20s on, 10s off classic Tabata format to push anaerobic capacity.",
    image: "/images/female_athlete.png",
    exercises: ["Sprint Intervals: 8 rounds", "Jump Squats: 8 rounds", "Mountain Climbers: 8 rounds", "Pushups: 8 rounds"]
  },
  {
    id: "cardio_4",
    name: "Stair Climber Interval Burn",
    category: "HIIT & Cardio",
    duration: "25 mins",
    difficulty: "Intermediate",
    calories: "380 kcal",
    description: "Intense lower body cardiovascular engine builder using high speed stairs.",
    image: "/images/male_athlete.png",
    exercises: ["Warmup: 5 mins Level 5", "High Intensity: 1 min Level 12", "Low Recovery: 1 min Level 6", "Repeat for 10 rounds"]
  },

  // Functional Fitness
  {
    id: "func_1",
    name: "CrossFit Hybrid Circuit",
    category: "Functional Fitness",
    duration: "45 mins",
    difficulty: "Advanced",
    calories: "480 kcal",
    description: "Olympic lifts, box jumps, and kettlebell swings combined.",
    image: "/images/male_athlete.png",
    exercises: ["Clean & Press: 5 sets x 5 reps", "Box Jumps: 3 sets x 15 reps", "Wall Balls: 3 sets x 20 reps", "Toes-to-Bar: 3 sets x max reps"]
  },
  {
    id: "func_2",
    name: "Core & Stability Flow",
    category: "Functional Fitness",
    duration: "30 mins",
    difficulty: "Beginner",
    calories: "220 kcal",
    description: "Focusing on deep core activation, balance, and single-leg stability.",
    image: "/images/female_athlete.png",
    exercises: ["Planks: 3 sets x 60 seconds", "Bird Dog: 3 sets x 12 reps", "Deadbugs: 3 sets x 15 reps", "Single-leg Romanian Deadlifts: 3 sets x 8 reps"]
  },
  {
    id: "func_3",
    name: "Kettlebell Power Flow",
    category: "Functional Fitness",
    duration: "35 mins",
    difficulty: "Intermediate",
    calories: "340 kcal",
    description: "Full body ballistic movements with kettlebells for endurance.",
    image: "/images/male_athlete.png",
    exercises: ["KB Swings: 4 sets x 20 reps", "KB Goblet Squats: 3 sets x 12 reps", "KB Snatch: 3 sets x 8 reps each arm", "Turkish Get-up: 3 sets x 3 reps each arm"]
  },
  {
    id: "func_4",
    name: "Sled Pushes & Battle Ropes",
    category: "Functional Fitness",
    duration: "30 mins",
    difficulty: "Advanced",
    calories: "420 kcal",
    description: "High power, low impact functional strength conditioning circuit.",
    image: "/images/back_muscle_traps.png",
    exercises: ["Sled Push (Heavy): 4 rounds x 25m", "Battle Ropes: 4 rounds x 30s slam", "Farmers Walk: 4 rounds x 50m", "Medicine Ball Slams: 4 sets x 15 reps"]
  },

  // Fat Loss Special
  {
    id: "fat_1",
    name: "LISS Fat Burning Cardio",
    category: "Fat Loss Special",
    duration: "50 mins",
    difficulty: "Beginner",
    calories: "380 kcal",
    description: "Low-intensity steady state exercise optimized for fat oxidation.",
    image: "/images/female_athlete.png",
    exercises: ["Treadmill Incline Walk: 40 mins (Incline 12%, Speed 4.5km/h)", "Cool Down: 10 mins easy walk"]
  },
  {
    id: "fat_2",
    name: "High-Intensity Fat Shred",
    category: "Fat Loss Special",
    duration: "35 mins",
    difficulty: "Advanced",
    calories: "460 kcal",
    description: "Full body plyometrics and metabolic acceleration circuit.",
    image: "/images/male_athlete.png",
    exercises: ["Burpee to Broad Jump: 3 sets x 10 reps", "Jumping Lunges: 3 sets x 20 reps", "Double Unders: 3 sets x 50 reps", "Shadow Boxing: 3 rounds x 3 mins"]
  },
  {
    id: "fat_3",
    name: "Abs & Cardio Burner",
    category: "Fat Loss Special",
    duration: "30 mins",
    difficulty: "Intermediate",
    calories: "280 kcal",
    description: "Core-focused circuits interleaved with dynamic cardio blasts.",
    image: "/images/female_athlete.png",
    exercises: ["Hanging Leg Raises: 3 sets x 12 reps", "Russian Twists (weighted): 3 sets x 30 reps", "Bicycle Crunches: 3 sets x 25 reps", "Jump Rope: 3 rounds x 3 mins"]
  },
  {
    id: "fat_4",
    name: "Rowing Machine Fat Burn",
    category: "Fat Loss Special",
    duration: "40 mins",
    difficulty: "Intermediate",
    calories: "450 kcal",
    description: "Low impact, high calorie expenditure rowing program.",
    image: "/images/male_athlete.png",
    exercises: ["Steady Row: 10 mins", "Sprint Row (90% effort): 1 min", "Active Rest Row: 1 min", "Repeat sprints: 10 rounds", "Cool down: 10 mins"]
  },

  // Muscle Gain
  {
    id: "gain_1",
    name: "Arms & Shoulder Pump",
    category: "Muscle Gain",
    duration: "45 mins",
    difficulty: "Intermediate",
    calories: "320 kcal",
    description: "High volume isolation curls, extensions, and lateral raises.",
    image: "/images/male_athlete.png",
    exercises: ["Bicep DB Curls: 4 sets x 12 reps", "Tricep Skull Crushers: 4 sets x 12 reps", "DB Lateral Raises: 4 sets x 15 reps", "Hammer Curls: 3 sets x 12 reps"]
  },
  {
    id: "gain_2",
    name: "Chest & Back Super-sets",
    category: "Muscle Gain",
    duration: "50 mins",
    difficulty: "Advanced",
    calories: "420 kcal",
    description: "Agonist-antagonist super-sets for maximum blood flow and pump.",
    image: "/images/back_muscle_traps.png",
    exercises: ["Super-set 1: DB Bench Press + Lat Pulldown (4 sets x 10 reps)", "Super-set 2: Cable Flys + Cable Rows (3 sets x 12 reps)", "Pushups to failure: 2 sets"]
  },
  {
    id: "gain_3",
    name: "Leg Hypertrophy Focus",
    category: "Muscle Gain",
    duration: "55 mins",
    difficulty: "Intermediate",
    calories: "480 kcal",
    description: "Targeting quads and hamstrings with controlled isolation lifts.",
    image: "/images/male_athlete.png",
    exercises: ["Leg Extensions: 4 sets x 15 reps", "Lying Leg Curls: 4 sets x 15 reps", "Goblet Squats (Tempo): 3 sets x 12 reps (3s eccentric)", "Walking DB Lunges: 3 sets x 12 steps each leg"]
  },
  {
    id: "gain_4",
    name: "Shoulder Hypertrophy",
    category: "Muscle Gain",
    duration: "45 mins",
    difficulty: "Intermediate",
    calories: "310 kcal",
    description: "High-volume shoulder capping routine to create the perfect V-taper.",
    image: "/images/male_athlete.png",
    exercises: ["Overhead DB Press: 4 sets x 10 reps", "Arnold Press: 3 sets x 12 reps", "Bent-over Rear Delt Raise: 4 sets x 15 reps", "DB Shrugs: 3 sets x 12 reps"]
  },

  // Mobility & Flex
  {
    id: "mob_1",
    name: "Hips & Hamstring Release",
    category: "Mobility & Flex",
    duration: "25 mins",
    difficulty: "Beginner",
    calories: "120 kcal",
    description: "Gentle mobility exercises to release tight hip flexors and lower back.",
    image: "/images/female_athlete.png",
    exercises: ["90/90 Hip Stretch: 3 mins each side", "Couch Stretch: 2 mins each side", "Hamstring Flossing: 10 reps each leg", "World's Greatest Stretch: 8 reps each side"]
  },
  {
    id: "mob_2",
    name: "Thoracic Spine Mobility",
    category: "Mobility & Flex",
    duration: "20 mins",
    difficulty: "Beginner",
    calories: "90 kcal",
    description: "Focus on upper back rotation, chest opening, and posture correction.",
    image: "/images/female_athlete.png",
    exercises: ["Cat-Cow: 15 reps", "T-Spine Rotation on all fours: 10 reps each side", "Thread the Needle: 5 deep breaths each side", "Doorway Chest Stretch: 2 mins"]
  },
  {
    id: "mob_3",
    name: "Full Body Mobility Flow",
    category: "Mobility & Flex",
    duration: "30 mins",
    difficulty: "Intermediate",
    calories: "150 kcal",
    description: "Dynamic stretching routine to improve joint range of motion.",
    image: "/images/female_athlete.png",
    exercises: ["Deep Squat Hold: 2 mins", "Spiderman Lunge with Twist: 10 reps", "Inchworms: 8 reps", "Ankle Mobilitiy Drill: 15 reps each side"]
  },
  {
    id: "mob_4",
    name: "Shoulder Health Protocol",
    category: "Mobility & Flex",
    duration: "15 mins",
    difficulty: "Beginner",
    calories: "80 kcal",
    description: "Rotator cuff strengthening and overhead mobility drill.",
    image: "/images/female_athlete.png",
    exercises: ["Bandy Dislocates: 15 reps", "Scapular Pull-ups: 3 sets x 10 reps", "Wall Slides: 3 sets x 12 reps", "Sleeper Stretch: 1 min each side"]
  },

  // Recovery & Yoga
  {
    id: "rec_1",
    name: "Decompression & Stretch",
    category: "Recovery & Yoga",
    duration: "30 mins",
    difficulty: "Beginner",
    calories: "100 kcal",
    description: "Post-workout recovery routine for optimal muscle recovery.",
    image: "/images/back_muscle_traps.png",
    exercises: ["Child's Pose: 2 mins", "Pigeon Pose: 2 mins each side", "Lying Spinal Twist: 2 mins each side", "Cobra Stretch: 1 min"]
  },
  {
    id: "rec_2",
    name: "Vinyasa Flow Yoga",
    category: "Recovery & Yoga",
    duration: "45 mins",
    difficulty: "Intermediate",
    calories: "180 kcal",
    description: "Mindful breathing and active yoga poses for mind-body balance.",
    image: "/images/female_athlete.png",
    exercises: ["Sun Salutation A: 5 rounds", "Warrior Sequence: 15 mins", "Balance Poses (Tree, Eagle): 10 mins", "Savasana: 5 mins"]
  },
  {
    id: "rec_3",
    name: "Deep Relaxation & Yin",
    category: "Recovery & Yoga",
    duration: "40 mins",
    difficulty: "Beginner",
    calories: "80 kcal",
    description: "Long-held passive poses to stretch deep connective tissues.",
    image: "/images/back_muscle_traps.png",
    exercises: ["Butterfly Pose: 4 mins hold", "Sphinx Pose: 3 mins hold", "Dragonfly Pose: 4 mins hold", "Supported Bridge: 3 mins"]
  },
  {
    id: "rec_4",
    name: "Active Foam Rolling Flow",
    category: "Recovery & Yoga",
    duration: "20 mins",
    difficulty: "Beginner",
    calories: "90 kcal",
    description: "Self-myofascial release flow targeting tight muscles and knots.",
    image: "/images/male_athlete.png",
    exercises: ["Foam Roll Quads: 2 mins", "Foam Roll Lats: 2 mins each side", "Foam Roll Upper Back: 3 mins", "Foam Roll Calves: 2 mins each side"]
  }
];

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'diet' | 'coach' | 'workouts' | 'settings'>('dashboard');

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setSettingsError('All fields are required.');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setSettingsError('Passwords do not match.');
      return;
    }

    const { validatePassword } = require('@/lib/validation');
    if (!validatePassword(newPassword)) {
      setSettingsError('Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.');
      return;
    }

    setSettingsSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.member_id,
          currentPassword,
          newPassword
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSettingsError(data.error || 'Failed to update password.');
        setSettingsSubmitting(false);
        return;
      }
      
      setSettingsSuccess('Password Updated Successfully! Redirecting...');
      setTimeout(() => {
        router.push('/api/auth/logout');
      }, 2000);
    } catch (err: any) {
      setSettingsError(err.message || 'An error occurred.');
      setSettingsSubmitting(false);
    }
  };

  // Database States
    const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
  const [activeWorkoutCategory, setActiveWorkoutCategory] = useState("Strength Training");
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [selectedCategoryMore, setSelectedCategoryMore] = useState<string | null>(null);
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
    // Load last 50 chat messages from DB on load
    const loadChatHistory = async () => {
      try {
        const history = await db.getMemberAiChats(member.member_id);
        if (history && history.length > 0) {
          const sortedHistory = [...history].reverse();
          const loaded: any[] = [];
          sortedHistory.forEach((c, idx) => {
            loaded.push({
              id: `hist_u_${c.id || idx}`,
              sender: 'user',
              text: c.question,
              timestamp: new Date(c.created_at || Date.now())
            });
            if (c.reply) {
              loaded.push({
                id: `hist_c_${c.id || idx}`,
                sender: 'coach',
                text: c.reply,
                timestamp: new Date(c.created_at || Date.now())
              });
            }
          });
          setChatMessages(prev => [...prev, ...loaded]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadChatHistory();
  }, [member.member_id]);

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

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    const validateImageFile = (file: File | null) => {
      if (!file) return true;
      if (!allowedTypes.includes(file.type)) return false;
      if (file.size > MAX_SIZE) return false;
      return true;
    };

    if ((frontFile && !validateImageFile(frontFile)) || 
        (sideFile && !validateImageFile(sideFile)) || 
        (backFile && !validateImageFile(backFile))) {
      setPhotoError('Invalid image file. Only JPG, JPEG, PNG, or WEBP under 10MB are allowed.');
      return;
    }

    setUploadingPhotos(true);
    try {
      const uploadToCloudinary = async (file: File, label: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `member_progress/${member.member_id}`);
        const res = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Failed to upload ${label} photo.`);
        }
        const data = await res.json();
        return data.secure_url;
      };

      let frontUrl = '';
      let sideUrl = '';
      let backUrl = '';

      if (frontFile) frontUrl = await uploadToCloudinary(frontFile, 'front');
      if (sideFile) sideUrl = await uploadToCloudinary(sideFile, 'side');
      if (backFile) backUrl = await uploadToCloudinary(backFile, 'back');

      // Check if snapshot already exists for month to ask confirmation or replace
      const monthExists = photosList.some(p => p.month_label === monthLabel);
      if (monthExists && !confirm(`A progress entry for "${monthLabel}" already exists. Would you like to overwrite it?`)) {
        setUploadingPhotos(false);
        return;
      }

      const saved = await db.saveProgressPhotos({
        member_id: member.member_id,
        front_photo: frontUrl || (photosList.find(p => p.month_label === monthLabel)?.front_photo || ''),
        side_photo: sideUrl || (photosList.find(p => p.month_label === monthLabel)?.side_photo || ''),
        back_photo: backUrl || (photosList.find(p => p.month_label === monthLabel)?.back_photo || ''),
        month_label: monthLabel
      });

      // Update local state list cleanly (overwriting month if existed)
      const updatedList = [...photosList];
      const monthIdx = updatedList.findIndex(p => p.month_label === monthLabel);
      if (monthIdx !== -1) {
        updatedList[monthIdx] = saved;
      } else {
        updatedList.unshift(saved);
      }
      setPhotosList(updatedList);

      setPhotoSuccess('Photos uploaded to Cloudinary and snapshots stored successfully!');
      setFrontFile(null);
      setSideFile(null);
      setBackFile(null);
    } catch (err: any) {
      setPhotoError(err.message || 'Photo upload failed.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const getCloudinaryPublicId = (url: string) => {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    try {
      const parts = url.split('/image/upload/');
      if (parts.length < 2) return null;
      const pathParts = parts[1].split('/');
      const publicIdWithExtension = pathParts.slice(1).join('/');
      const dotIndex = publicIdWithExtension.lastIndexOf('.');
      if (dotIndex !== -1) {
        return publicIdWithExtension.substring(0, dotIndex);
      }
      return publicIdWithExtension;
    } catch (e) {
      return null;
    }
  };

  const handleDeleteSnapshot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this snapshot? This will remove it from Cloudinary and the database.')) return;
    try {
      const target = photosList.find(p => p.id === id);
      if (target) {
        const urls = [target.front_photo, target.side_photo, target.back_photo];
        for (const url of urls) {
          const publicId = getCloudinaryPublicId(url);
          if (publicId) {
            await fetch('/api/cloudinary/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_id: publicId })
            }).catch(e => console.error("Cloudinary delete failed:", e));
          }
        }
      }
      
      const success = await db.deleteProgressPhoto(id, member.member_id);
      if (success) {
        setPhotosList(prev => prev.filter(p => p.id !== id));
        setPhotoSuccess('Snapshot deleted successfully.');
        setTimeout(() => setPhotoSuccess(''), 5000);
      } else {
        setPhotoError('Failed to delete snapshot from database.');
        setTimeout(() => setPhotoError(''), 5000);
      }
    } catch (err: any) {
      console.error(err);
      setPhotoError('Error during deletion: ' + err.message);
      setTimeout(() => setPhotoError(''), 5000);
    }
  };

  const handleReplaceSnapshot = (p: any) => {
    setMonthLabel(p.month_label);
    alert(`Please select new files using the upload inputs above and click "Upload Entry" to replace your ${p.month_label} snapshot.`);
    const formElement = document.getElementById('progress-photos-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateSnapshot = (p: any) => {
    setMonthLabel(p.month_label);
    alert(`You can select new files to update individual views for ${p.month_label}. Unselected views will remain unchanged.`);
    const formElement = document.getElementById('progress-photos-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
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

    const wVal = parseFloat(weight);
    const bfVal = parseFloat(bodyFat);
    const cVal = parseFloat(chest);
    const waVal = parseFloat(waist);
    const aVal = parseFloat(arms);

    if (isNaN(wVal) || wVal <= 0 || isNaN(bfVal) || bfVal <= 0 || isNaN(cVal) || cVal <= 0 || isNaN(waVal) || waVal <= 0 || isNaN(aVal) || aVal <= 0) {
      setFormError('All measurements must be valid positive numbers greater than 0.');
      setLoggingProgress(false);
      return;
    }

    try {
      const newProgress = await db.saveMemberProgress({
        member_id: member.member_id,
        weight: wVal,
        body_fat: bfVal,
        chest: cVal,
        waist: waVal,
        arms: aVal,
        bmi: parseFloat(bmi) || 22.0,
        notes: notes || 'Member Entry'
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
    if (text.length > 2000) {
      alert('Message is too long. Limit is 2000 characters.');
      return;
    }
    // Simple XSS check
    if (/[<>]/g.test(text)) {
      alert('Invalid characters in message.');
      return;
    }
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

    // Swipe and Carousel helpers for Workouts tab
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (category: string) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNextCard(category);
    } else if (distance < -minSwipeDistance) {
      handlePrevCard(category);
    }
  };

  const handlePrevCard = (category: string) => {
    const list = dashboardWorkouts.filter(w => w.category === category);
    setActiveIndices(prev => ({
      ...prev,
      [category]: prev[category] === 0 ? list.length - 1 : (prev[category] || 0) - 1
    }));
  };

  const handleNextCard = (category: string) => {
    const list = dashboardWorkouts.filter(w => w.category === category);
    setActiveIndices(prev => ({
      ...prev,
      [category]: (prev[category] || 0) === list.length - 1 ? 0 : (prev[category] || 0) + 1
    }));
  };

  const getVirtualizedWorkouts = (category: string) => {
    const all = dashboardWorkouts.filter(w => w.category === category);
    const activeIdx = activeIndices[category] ?? 0;
    const prevIdx = activeIdx === 0 ? all.length - 1 : activeIdx - 1;
    const nextIdx = activeIdx === all.length - 1 ? 0 : activeIdx + 1;
    const indices = Array.from(new Set([prevIdx, activeIdx, nextIdx]));
    return indices.map(idx => ({
      ...all[idx],
      originalIndex: idx,
      isActive: idx === activeIdx
    }));
  };

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
            { id: 'workouts', label: '🏋️ Workouts' },
            { id: 'diet', label: '🥗 Diet & Notes' },
            { id: 'coach', label: '🤖 Coach Zeus' },
            { id: 'settings', label: '⚙️ Account Settings' }
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
                            <span className="text-[8px] text-zinc-500 font-mono block uppercase font-bold">Today&apos;s Workout</span>
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

                  <form id="progress-photos-form" onSubmit={handleUploadPhotos} className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-[10px] bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
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
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateSnapshot(p)}
                                  className="text-zinc-400 hover:text-yellow-400 transition-colors font-bold text-[8px] uppercase"
                                >
                                  Update Snapshot
                                </button>
                                <span className="text-zinc-800">|</span>
                                <button
                                  onClick={() => handleReplaceSnapshot(p)}
                                  className="text-zinc-400 hover:text-yellow-400 transition-colors font-bold text-[8px] uppercase"
                                >
                                  Replace Snapshot
                                </button>
                                <span className="text-zinc-800">|</span>
                                <button
                                  onClick={() => handleDeleteSnapshot(p.id)}
                                  className="text-red-500 hover:text-red-400 transition-colors font-bold text-[8px] uppercase"
                                >
                                  Delete Snapshot
                                </button>
                              </div>
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


          {activeTab === 'workouts' && (
            <div className="space-y-6 animate-fade-in pb-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h2 className="font-display text-2xl font-black italic uppercase text-white tracking-wide">
                    Workout Library
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Select a category to view high-performance training structures.
                  </p>
                </div>
              </div>

              {/* Mobile scrollable category selector tabs */}
              <div className="block lg:hidden">
                <div className="flex border-b border-zinc-800 mb-5 overflow-x-auto scrollbar-none font-mono text-[11px] uppercase tracking-wider gap-2 pb-2">
                  {dashboardCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveWorkoutCategory(cat.id)}
                      className={`px-3 py-1.5 border-b-2 font-bold transition-all whitespace-nowrap ${
                        activeWorkoutCategory === cat.id
                          ? 'border-yellow-400 text-yellow-500'
                          : 'border-transparent text-zinc-500 hover:text-zinc-305'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Single Container Slider */}
              <div className="block lg:hidden">
                {(() => {
                  const cat = dashboardCategories.find(c => c.id === activeWorkoutCategory);
                  if (!cat) return null;
                  const allCategoryWorkouts = dashboardWorkouts.filter(w => w.category === cat.id);
                  const activeIdx = activeIndices[cat.id] || 0;
                  const virtualized = getVirtualizedWorkouts(cat.id);

                  return (
                    <div className="space-y-4 max-h-[520px] overflow-hidden py-12 gap-5 mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-display text-sm font-black italic uppercase text-yellow-400">
                          {cat.label} Selected
                        </h3>
                      </div>

                      <div className="relative w-full max-w-sm mx-auto">
                        {/* Arrows & Header details */}
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <span className="text-zinc-550 font-mono font-bold">
                            Workout {activeIdx + 1} of {allCategoryWorkouts.length}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePrevCard(cat.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-305 hover:border-yellow-450 transition-colors"
                            >
                              ←
                            </button>
                            <button
                              onClick={() => handleNextCard(cat.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-305 hover:border-yellow-450 transition-colors"
                            >
                              →
                            </button>
                          </div>
                        </div>

                        {/* Slide container with touch handlers for swipe gestures */}
                        <div
                          onTouchStart={onTouchStart}
                          onTouchMove={onTouchMove}
                          onTouchEnd={() => onTouchEnd(cat.id)}
                          className="relative flex gap-4 overflow-visible min-h-[240px]"
                        >
                          {virtualized.map((w) => (
                            <div
                              key={w.id}
                              className={`w-full shrink-0 transition-all duration-300 ${
                                w.isActive ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none absolute scale-95'
                              }`}
                            >
                              <div
                                onClick={() => setSelectedWorkout(w)}
                                className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-4 shadow-xl flex flex-col justify-between min-h-[230px] cursor-pointer hover:border-yellow-400/40 transition-all"
                              >
                                <div className="space-y-3">
                                  <div className="relative h-24 w-full overflow-hidden rounded-lg border border-zinc-850">
                                    <img
                                      src={w.image}
                                      alt={w.name}
                                      className="w-full h-full object-cover grayscale opacity-85"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                      <span className="rounded bg-yellow-455 text-black px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                        {w.difficulty}
                                      </span>
                                      <span className="text-white font-mono text-[9px] font-bold">
                                        {w.duration}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-display text-sm font-black italic text-white uppercase leading-tight">
                                      {w.name}
                                    </h4>
                                    <p className="text-zinc-400 text-[10px] leading-relaxed line-clamp-2 mt-1">
                                      {w.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-zinc-850/50 flex justify-between items-center text-[9px] font-mono text-zinc-550 font-semibold">
                                  <span>Est: <strong className="text-yellow-400">{w.calories}</strong></span>
                                  <span className="text-yellow-400 font-bold">Tap Details →</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-1.5 mt-3">
                          {allCategoryWorkouts.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveIndices(prev => ({ ...prev, [cat.id]: idx }))}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === activeIdx ? 'w-4 bg-yellow-400' : 'w-1.5 bg-zinc-800'
                              }`}
                              aria-label={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>

                        {/* View More button at the bottom of carousel on mobile */}
                        <div className="text-center mt-3">
                          <button
                            onClick={() => setSelectedCategoryMore(cat.id)}
                            className="text-[10px] font-mono font-bold text-yellow-500 hover:text-yellow-400 uppercase tracking-wider"
                          >
                            [ View All {cat.id} ]
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Desktop layout: remains unchanged showing all categories vertically in a grid */}
              <div className="hidden lg:block space-y-10">
                {dashboardCategories.map((cat) => {
                  const allCategoryWorkouts = dashboardWorkouts.filter(w => w.category === cat.id);
                  return (
                    <div key={cat.id} className="space-y-4 border-b border-zinc-900 pb-8 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-display text-lg font-black italic uppercase text-yellow-400">
                          {cat.label}
                        </h3>
                        <button
                          onClick={() => setSelectedCategoryMore(cat.id)}
                          className="flex items-center gap-1 text-[11px] font-mono font-bold text-yellow-500 hover:text-yellow-450 hover:underline uppercase"
                        >
                          View All ({allCategoryWorkouts.length}) →
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-6">
                        {allCategoryWorkouts.map((w) => (
                          <div
                            key={w.id}
                            onClick={() => setSelectedWorkout(w)}
                            className="rounded-xl border border-zinc-850 bg-zinc-900/20 p-5 shadow-lg flex flex-col justify-between min-h-[300px] cursor-pointer hover:border-yellow-400/40 hover:shadow-[0_0_20px_rgba(250,204,21,0.05)] hover:-translate-y-1 transition-all duration-300 group"
                          >
                            <div className="space-y-4">
                              <div className="relative h-36 w-full overflow-hidden rounded-lg border border-zinc-800/80">
                                <img
                                  src={w.image}
                                  alt={w.name}
                                  className="w-full h-full object-cover grayscale opacity-75 group-hover:scale-105 group-hover:opacity-90 transition-all duration-505"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                  <span className="rounded bg-yellow-400 text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                    {w.difficulty}
                                  </span>
                                  <span className="text-white font-mono text-[10px] font-bold">
                                    {w.duration}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-display text-base font-black italic text-white uppercase group-hover:text-yellow-400 transition-colors leading-tight">
                                  {w.name}
                                </h4>
                                <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2 mt-1">
                                  {w.description}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-850/50 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                              <span>Burn: <strong className="text-yellow-400">{w.calories}</strong></span>
                              <span className="text-yellow-400 font-bold group-hover:underline">Start Routine →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in pb-16">
              <div className="border-b border-zinc-800 pb-5">
                <h2 className="font-display text-2xl font-black italic uppercase text-white tracking-wide">
                  Account Settings
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Manage your credentials and security preferences.
                </p>
              </div>

              <div className="max-w-md bg-zinc-900/30 border border-zinc-850 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400 font-mono mb-1">
                    🛡️ Change Password
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Ensure your account is protected with a high-strength password. Changing your password will invalidate your current session and require logging back in.
                  </p>
                </div>

                {settingsError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-400 animate-in fade-in">
                    {settingsError}
                  </div>
                )}

                {settingsSuccess && (
                  <div className="rounded-lg border border-green-500/20 bg-green-950/30 p-3 text-xs text-green-400 font-bold animate-in fade-in">
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none placeholder-zinc-650"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none placeholder-zinc-650"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none placeholder-zinc-650"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={settingsSubmitting}
                    className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                  >
                    {settingsSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

      </div>
      {/* Workout Detail Modal */}
      <AnimatePresence>
        {selectedWorkout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWorkout(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedWorkout(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="rounded bg-yellow-450/10 border border-yellow-400/20 text-yellow-405 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest">
                      {selectedWorkout.difficulty}
                    </span>
                    <span className="rounded bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest">
                      ⏱️ {selectedWorkout.duration}
                    </span>
                    <span className="rounded bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest">
                      🔥 {selectedWorkout.calories}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-2xl font-black italic uppercase text-white leading-tight">
                    {selectedWorkout.name}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1">{selectedWorkout.category}</p>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed border-l-2 border-yellow-400 pl-3">
                  {selectedWorkout.description}
                </p>

                <div className="space-y-3">
                  <h4 className="font-mono text-[10px] uppercase font-bold tracking-wider text-yellow-400">Exercises & Routine Breakdown:</h4>
                  <ul className="space-y-2">
                    {selectedWorkout.exercises.map((ex: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-900">
                        <span className="h-5 w-5 rounded-full bg-yellow-400/10 border border-yellow-450/20 text-yellow-400 flex items-center justify-center font-mono text-[9px] font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-normal">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedWorkout(null);
                      setActiveTab('coach');
                    }}
                    className="flex-1 rounded-lg bg-yellow-400 text-black py-3 text-xs font-black italic uppercase tracking-wider hover:bg-yellow-300 transition-all text-center font-bold"
                  >
                    Start with Zeus Coach AI
                  </button>
                  <button
                    onClick={() => setSelectedWorkout(null)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-3 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category View All Modal */}
      <AnimatePresence>
        {selectedCategoryMore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCategoryMore(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-white shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <button
                onClick={() => setSelectedCategoryMore(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-black italic uppercase text-yellow-450">
                    {selectedCategoryMore} Library
                  </h3>
                  <p className="text-[10px] text-zinc-550 font-mono mt-0.5">
                    Browse all compiled exercises and training models.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {dashboardWorkouts
                    .filter(w => w.category === selectedCategoryMore)
                    .map((w) => (
                      <div
                        key={w.id}
                        onClick={() => {
                          setSelectedCategoryMore(null);
                          setSelectedWorkout(w);
                        }}
                        className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 flex flex-col justify-between min-h-[240px] cursor-pointer hover:border-yellow-400/40 hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="space-y-3">
                          <div className="relative h-28 w-full overflow-hidden rounded-lg border border-zinc-850">
                            <img
                              src={w.image}
                              alt={w.name}
                              className="w-full h-full object-cover grayscale opacity-80"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                              <span className="rounded bg-yellow-400 text-black px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                {w.difficulty}
                              </span>
                              <span className="text-white font-mono text-[9px] font-bold">
                                {w.duration}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-display text-sm font-black italic text-white uppercase leading-tight">
                              {w.name}
                            </h4>
                            <p className="text-zinc-500 text-[10px] leading-relaxed line-clamp-2 mt-1">
                              {w.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-850/50 flex justify-between items-center text-[9px] font-mono text-zinc-650">
                          <span>Est: <strong className="text-yellow-400">{w.calories}</strong></span>
                          <span className="text-yellow-400 font-bold">Start Routine →</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
