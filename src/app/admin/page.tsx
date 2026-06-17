/* eslint-disable */
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { 
  Users, 
  Dumbbell, 
  Settings, 
  TrendingUp, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  CheckCircle, 
  Clock, 
  X,
  FileText,
  Copy,
  Camera,
  Activity,
  Calendar,
  Briefcase,
  AlertTriangle,
  MessageSquare,
  Video
} from 'lucide-react';
import { db, Trainer, Equipment, MembershipPlan, Transformation, WebsiteSettings, Lead, SocialLinks, GymEvent, CareerApplication, AiMetric, AiProviderStatus, Member, MemberProgress, WorkoutDay, Announcement, Attendance, VirtualTour } from '@/lib/database';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'careers' | 'events' | 'trainers' | 'equipment' | 'plans' | 'transformations' | 'settings' | 'ai' | 'members' | 'dashboard' | 'analytics' | 'virtualtour'>('dashboard');

  // Helper functions for membership plan calculation
  const getPlanPrice = (planId: string | undefined, type: string, plansList: MembershipPlan[]): number => {
    const plan = plansList.find(p => p.id === planId || p.duration === type || p.name === type);
    if (plan) return Number(plan.price);
    
    // Hardcoded defaults fallback
    const t = type.toLowerCase();
    if (t.includes('monthly') || planId === 'p1') return 3000;
    if (t.includes('quarterly') || planId === 'p2') return 5000;
    if (t.includes('half-yearly') || planId === 'p3') return 8000;
    if (t.includes('yearly') || t.includes('annual') || planId === 'p4') return 12000;
    return 3000;
  };

  const getPlanDuration = (planId: string | undefined, type: string, plansList: MembershipPlan[]): number => {
    const plan = plansList.find(p => p.id === planId || p.duration === type || p.name === type);
    if (plan) {
      const dur = plan.duration.toLowerCase();
      if (dur.includes('monthly')) return 1;
      if (dur.includes('quarterly')) return 3;
      if (dur.includes('half-yearly')) return 6;
      if (dur.includes('yearly') || dur.includes('annual')) return 12;
    }
    const t = type.toLowerCase();
    if (t.includes('monthly') || planId === 'p1') return 1;
    if (t.includes('quarterly') || planId === 'p2') return 3;
    if (t.includes('half-yearly') || planId === 'p3') return 6;
    if (t.includes('yearly') || t.includes('annual') || planId === 'p4') return 12;
    return 1;
  };

  // Global theme state for CMS
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const updateThemeOnDom = (newTheme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const handleThemeToggle = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('ran_fitness_color_theme', newTheme);
    updateThemeOnDom(newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('ran_fitness_color_theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      updateThemeOnDom(storedTheme);
    } else {
      localStorage.setItem('ran_fitness_color_theme', 'dark');
      updateThemeOnDom('dark');
    }
  }, []);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Loaded Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [careers, setCareers] = useState<CareerApplication[]>([]);
  const [events, setEvents] = useState<GymEvent[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [socials, setSocials] = useState<SocialLinks | null>(null);

  // Virtual Tour state
  const [virtualTourData, setVirtualTourData] = useState<VirtualTour | null>(null);
  const [vtVideoUrl, setVtVideoUrl] = useState('');
  const [vtThumbnailUrl, setVtThumbnailUrl] = useState('');
  const [vtSaving, setVtSaving] = useState(false);
  const [vtPreviewOpen, setVtPreviewOpen] = useState(false);

  // AI Monitor Data States
  const [aiMetrics, setAiMetrics] = useState<AiMetric[]>([]);
  const [aiStatus, setAiStatus] = useState<AiProviderStatus[]>([]);
  const [runningHealthCheck, setRunningHealthCheck] = useState(false);
  const [coachStatus, setCoachStatus] = useState<{ activeMembers: number; totalChats: number; avgResponseTime: number }>({
    activeMembers: 0,
    totalChats: 0,
    avgResponseTime: 0
  });

  // Edit / Form Modal states
  const [editingTrainer, setEditingTrainer] = useState<Partial<Trainer> | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Partial<Equipment> | null>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<MembershipPlan> | null>(null);
  const [editingTransformation, setEditingTransformation] = useState<Partial<Transformation> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<GymEvent> | null>(null);

  // Members panel states
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutDay[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  
  // Modals for Members
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [progressMemberId, setProgressMemberId] = useState<string | null>(null);
  const [progressLogList, setProgressLogList] = useState<MemberProgress[]>([]);

  // Admin Security States
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'security'>('general');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secCurrentUsername, setSecCurrentUsername] = useState('admin');
  const [secNewUsername, setSecNewUsername] = useState('');
  const [showSecPassword, setShowSecPassword] = useState(false);
  const [updatingSecPassword, setUpdatingSecPassword] = useState(false);
  const [updatingSecUsername, setUpdatingSecUsername] = useState(false);
  const [lastPasswordChangeDate, setLastPasswordChangeDate] = useState<string>('');
  
  // Progress logging form fields
  const [pWeight, setPWeight] = useState('');
  const [pBodyFat, setPBodyFat] = useState('');
  const [pChest, setPChest] = useState('');
  const [pWaist, setPWaist] = useState('');
  const [pArms, setPArms] = useState('');
  const [pHeightCm, setPHeightCm] = useState('175');
  const [pBmi, setPBmi] = useState('');
  const [pNotes, setPNotes] = useState('');
  
  // Workout Schedule editor fields
  const [workoutScheduleEditing, setWorkoutScheduleEditing] = useState<Partial<WorkoutDay> | null>(null);
  
  // Announcement creator fields
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState('');

  // Daily check-in viewer date
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Analytics & Attendance Hub states
  const [allAttendanceLogs, setAllAttendanceLogs] = useState<Attendance[]>([]);
  const [attendanceRange, setAttendanceRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [visitorAnalytics, setVisitorAnalytics] = useState<{ totalVisitors: number; todayVisitors: number; weekVisitors: number; returningVisitors: number; conversionRate: number; trialSubmissions: number; bookTrialClicks: number; virtualTourOpens: number; trainerCardClicks: number; equipmentViews: number }>({ totalVisitors: 0, todayVisitors: 0, weekVisitors: 0, returningVisitors: 0, conversionRate: 0, trialSubmissions: 0, bookTrialClicks: 0, virtualTourOpens: 0, trainerCardClicks: 0, equipmentViews: 0 });

  // Diet Plan editor modal states
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [dietModalMemberId, setDietModalMemberId] = useState<string | null>(null);
  const [dietModalMemberName, setDietModalMemberName] = useState('');
  const [dietBreakfast, setDietBreakfast] = useState('');
  const [dietLunch, setDietLunch] = useState('');
  const [dietDinner, setDietDinner] = useState('');
  const [dietSnacks, setDietSnacks] = useState('');
  const [dietSupplements, setDietSupplements] = useState('');
  const [dietCaloriesTarget, setDietCaloriesTarget] = useState('2000');
  const [dietProteinTarget, setDietProteinTarget] = useState('150');
  const [dietMealSchedule, setDietMealSchedule] = useState('Standard');
  const [dietCompliancePct, setDietCompliancePct] = useState('100');
  const [savingDiet, setSavingDiet] = useState(false);

  // Workout Plan editor modal states
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutModalMemberId, setWorkoutModalMemberId] = useState<string | null>(null);
  const [workoutModalMemberName, setWorkoutModalMemberName] = useState('');
  const [workoutTodayWorkout, setWorkoutTodayWorkout] = useState('');
  const [workoutSetsReps, setWorkoutSetsReps] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState('');
  const [savingWorkout, setSavingWorkout] = useState(false);

  // Gym Member search query state
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Trainer Notes editor modal states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalMemberId, setNoteModalMemberId] = useState<string | null>(null);
  const [noteModalMemberName, setNoteModalMemberName] = useState('');
  const [newTrainerNote, setNewTrainerNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Success modal for newly created member
  const [successModalData, setSuccessModalData] = useState<Member | null>(null);
  const [isNeonActive, setIsNeonActive] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Auto calculate BMI in admin form
  useEffect(() => {
    const w = parseFloat(pWeight);
    const h = parseFloat(pHeightCm);
    if (w && h) {
      setPBmi((w / ((h / 100) * (h / 100))).toFixed(1));
    } else {
      setPBmi('');
    }
  }, [pWeight, pHeightCm]);

  // Diet plan modal handlers
  const handleOpenDietModal = async (member: Member) => {
    if (!member.member_id) return;
    setDietModalMemberId(member.member_id);
    setDietModalMemberName(member.name);
    setSavingDiet(false);
    
    // Set default empty states
    setDietBreakfast('');
    setDietLunch('');
    setDietDinner('');
    setDietSnacks('');
    setDietSupplements('');
    setDietCaloriesTarget('2000');
    setDietProteinTarget('150');
    setDietMealSchedule('Standard');
    setDietCompliancePct('100');
    
    setIsDietModalOpen(true);
    
    try {
      const plan = await db.getDietPlan(member.member_id);
      if (plan) {
        setDietBreakfast(plan.breakfast || '');
        setDietLunch(plan.lunch || '');
        setDietDinner(plan.dinner || '');
        setDietSnacks(plan.snacks || '');
        setDietSupplements(plan.supplements || '');
        setDietCaloriesTarget(plan.calories_target?.toString() || '2000');
        setDietProteinTarget(plan.protein_target?.toString() || '150');
        setDietMealSchedule(plan.meal_schedule || 'Standard');
        setDietCompliancePct(plan.compliance_pct?.toString() || '100');
      }
    } catch (err: any) {
      console.error('Failed to load diet plan:', err);
    }
  };

  const handleSaveDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietModalMemberId) return;
    setSavingDiet(true);
    try {
      await db.saveDietPlan({
        member_id: dietModalMemberId,
        breakfast: dietBreakfast,
        lunch: dietLunch,
        dinner: dietDinner,
        snacks: dietSnacks,
        supplements: dietSupplements,
        calories_target: parseInt(dietCaloriesTarget) || 2000,
        protein_target: parseInt(dietProteinTarget) || 150,
        meal_schedule: dietMealSchedule,
        compliance_pct: parseInt(dietCompliancePct) || 100
      });
      showToastMessage('🥗 Diet plan saved successfully!');
      setIsDietModalOpen(false);
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to save diet plan', 'error');
    } finally {
      setSavingDiet(false);
    }
  };

  // Workout plan modal handlers
  const handleOpenWorkoutModal = async (member: Member) => {
    if (!member.member_id) return;
    setWorkoutModalMemberId(member.member_id);
    setWorkoutModalMemberName(member.name);
    setSavingWorkout(false);
    
    // Set default empty states
    setWorkoutTodayWorkout('');
    setWorkoutSetsReps('');
    setWorkoutExercises('');
    
    setIsWorkoutModalOpen(true);
    
    try {
      const plan = await db.getWorkoutPlan(member.member_id);
      if (plan) {
        setWorkoutTodayWorkout(plan.today_workout || '');
        setWorkoutSetsReps(plan.sets_reps || '');
        setWorkoutExercises(plan.exercises || '');
      }
    } catch (err: any) {
      console.error('Failed to load workout plan:', err);
    }
  };

  const handleSaveWorkoutPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutModalMemberId) return;
    setSavingWorkout(true);
    try {
      await db.saveWorkoutPlan({
        member_id: workoutModalMemberId,
        today_workout: workoutTodayWorkout,
        sets_reps: workoutSetsReps,
        exercises: workoutExercises
      });
      showToastMessage('🏋️ Workout plan saved successfully!');
      setIsWorkoutModalOpen(false);
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to save workout plan', 'error');
    } finally {
      setSavingWorkout(false);
    }
  };

  // Trainer note modal handlers
  const handleOpenNoteModal = (member: Member) => {
    if (!member.member_id) return;
    setNoteModalMemberId(member.member_id);
    setNoteModalMemberName(member.name);
    setNewTrainerNote('');
    setSavingNote(false);
    setIsNoteModalOpen(true);
  };

  const handleSaveTrainerNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalMemberId || !newTrainerNote.trim()) return;
    setSavingNote(true);
    try {
      await db.saveTrainerNote(noteModalMemberId, newTrainerNote.trim());
      showToastMessage('📝 Trainer note saved successfully!');
      setIsNoteModalOpen(false);
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to save trainer note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  // Handler functions for members CMS
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const isNew = !editingMember.id;
      const res = await db.saveMember(editingMember);
      if (res) {
        showToastMessage(editingMember.id ? '✅ Member profile updated!' : '✅ Gym member added successfully!');
        setEditingMember(null);
        setIsAddMemberOpen(false);
        const updated = await db.getMembers();
        setMembers(updated);
        
        if (isNew) {
          setSuccessModalData(res);
        }
      }
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to save member details', 'error');
    }
  };

  const handleDeleteMember = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const res = await db.deleteMember(id);
      if (res) {
        showToastMessage('🗑️ Member profile deleted.');
        const updated = await db.getMembers();
        setMembers(updated);
      }
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to delete member', 'error');
    }
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressMemberId) return;
    try {
      await db.saveMemberProgress({
        member_id: progressMemberId,
        weight: parseFloat(pWeight),
        body_fat: parseFloat(pBodyFat),
        chest: parseFloat(pChest),
        waist: parseFloat(pWaist),
        arms: parseFloat(pArms),
        bmi: parseFloat(pBmi) || 22.0,
        notes: pNotes || 'Admin Entry'
      });
      await db.saveBodyMetrics({
        member_id: progressMemberId,
        weight: parseFloat(pWeight),
        body_fat: parseFloat(pBodyFat),
        bmi: parseFloat(pBmi) || 22.0
      });
      showToastMessage('📈 Progress metrics entry logged successfully!');
      setIsAddProgressOpen(false);
      setProgressMemberId(null);
      setPWeight('');
      setPBodyFat('');
      setPChest('');
      setPWaist('');
      setPArms('');
      setPBmi('');
      setPNotes('');
      const updated = await db.getMembers();
      setMembers(updated);
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to save progress metrics', 'error');
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle || !newAnnouncementMessage) return;
    try {
      const res = await db.saveAnnouncement({
        title: newAnnouncementTitle,
        message: newAnnouncementMessage
      });
      if (res) {
        showToastMessage('📢 Announcement broadcasted successfully!');
        setNewAnnouncementTitle('');
        setNewAnnouncementMessage('');
        const updated = await db.getAnnouncements();
        setAnnouncements(updated);
      }
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to publish announcement', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await db.deleteAnnouncement(id);
      if (res) {
        showToastMessage('Announcement deleted!');
        const updated = await db.getAnnouncements();
        setAnnouncements(updated);
      }
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to delete announcement', 'error');
    }
  };

  const handleSaveWorkoutDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutScheduleEditing || !workoutScheduleEditing.day) return;
    try {
      await db.saveWorkoutScheduleDay(
        workoutScheduleEditing.day,
        workoutScheduleEditing.title || '',
        workoutScheduleEditing.description || ''
      );
      showToastMessage('💪 Workout routine updated successfully!');
      setWorkoutScheduleEditing(null);
      const updated = await db.getWorkoutSchedule();
      setWorkoutSchedule(updated);
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to save workout routine', 'error');
    }
  };

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('ran_fitness_admin_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (session.expiresAt > Date.now()) {
            setAuthorized(true);
            return;
          }
        } catch {}
      }
    }
    router.push('/');
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return '';
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToastMessage('❌ All fields are required', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToastMessage('❌ New password must be at least 8 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToastMessage('❌ Confirm password does not match new password', 'error');
      return;
    }

    setUpdatingSecPassword(true);
    try {
      const creds = await db.getAdminCredentials(secCurrentUsername);
      if (!creds) {
        showToastMessage('❌ Admin user not found', 'error');
        setUpdatingSecPassword(false);
        return;
      }

      const bcrypt = require('bcryptjs');
      const match = await bcrypt.compare(currentPassword, creds.password_hash);
      if (!match) {
        showToastMessage('❌ Incorrect Current Password', 'error');
        setUpdatingSecPassword(false);
        return;
      }

      const newHash = bcrypt.hashSync(newPassword, 10);
      const success = await db.updateAdminPassword(secCurrentUsername, newHash);
      if (success) {
        showToastMessage('✅ Password Updated Successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        const updatedCreds = await db.getAdminCredentials(secCurrentUsername);
        if (updatedCreds) {
          setLastPasswordChangeDate(new Date(updatedCreds.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        }
      } else {
        showToastMessage('❌ Failed to update password', 'error');
      }
    } catch (err: any) {
      showToastMessage(`❌ Error: ${err.message || 'Unknown error occurred'}`, 'error');
    } finally {
      setUpdatingSecPassword(false);
    }
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secNewUsername) {
      showToastMessage('❌ New username is required', 'error');
      return;
    }
    if (secNewUsername.length < 4) {
      showToastMessage('❌ Username must be at least 4 characters long', 'error');
      return;
    }
    if (secNewUsername === secCurrentUsername) {
      showToastMessage('❌ New username is same as current username', 'error');
      return;
    }

    setUpdatingSecUsername(true);
    try {
      const success = await db.updateAdminUsername(secCurrentUsername, secNewUsername);
      if (success) {
        showToastMessage('✅ Username Updated Successfully', 'success');
        const sessionStr = localStorage.getItem('ran_fitness_admin_session');
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          parsed.username = secNewUsername;
          localStorage.setItem('ran_fitness_admin_session', JSON.stringify(parsed));
        }
        setSecCurrentUsername(secNewUsername);
        setSecNewUsername('');
        const updatedCreds = await db.getAdminCredentials(secNewUsername);
        if (updatedCreds) {
          setLastPasswordChangeDate(new Date(updatedCreds.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        }
      } else {
        showToastMessage('❌ Failed to update username', 'error');
      }
    } catch (err: any) {
      showToastMessage(`❌ Error: ${err.message || 'Username already exists or database error'}`, 'error');
    } finally {
      setUpdatingSecUsername(false);
    }
  };

  const handleForceLogoutAll = () => {
    localStorage.removeItem('ran_fitness_admin_session');
    document.cookie = "ran_admin_session=; path=/; max-age=0; SameSite=Strict; Secure";
    showToastMessage('✅ All sessions terminated. Logging out...', 'success');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const handleResetAdminCredentials = async () => {
    if (!confirm('Are you sure you want to reset admin credentials to system defaults?')) {
      return;
    }
    try {
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('RanFitness2026!', 10);
      
      if (secCurrentUsername !== 'admin') {
        try {
          await db.updateAdminUsername(secCurrentUsername, 'admin');
        } catch {}
      }
      
      const success = await db.updateAdminPassword('admin', hash);
      if (success) {
        showToastMessage('✅ Credentials reset successfully! Log out or log in again.', 'success');
        setSecCurrentUsername('admin');
        const sessionStr = localStorage.getItem('ran_fitness_admin_session');
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          parsed.username = 'admin';
          localStorage.setItem('ran_fitness_admin_session', JSON.stringify(parsed));
        }
        const updatedCreds = await db.getAdminCredentials('admin');
        if (updatedCreds) {
          setLastPasswordChangeDate(new Date(updatedCreds.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        }
      }
    } catch (err: any) {
      showToastMessage(`❌ Reset failed: ${err.message}`, 'error');
    }
  };

  const handleGenerateStrongPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmPassword(pass);
    setShowSecPassword(true);
    showToastMessage('✅ Strong Password Generated!', 'success');
  };

  const loadAllData = async () => {
    try {
      const [le, car, ev, tr, eq, pl, tf, se, so, met, stat, mem, ann, sched, att, allAtt, neonActive, aiCoachStat] = await Promise.all([
        db.getLeads(),
        db.getCareers(),
        db.getEvents(),
        db.getTrainers(),
        db.getEquipment(),
        db.getPlans(),
        db.getTransformations(),
        db.getSettings(),
        db.getSocialLinks(),
        db.getAiMetricsLast24Hours(),
        db.getAiProviderStatus(),
        db.getMembers(),
        db.getAnnouncements(),
        db.getWorkoutSchedule(),
        db.getDailyAttendance(attendanceDate),
        db.getAllAttendance().catch(() => []),
        db.isNeonActive().catch(() => false),
        db.getAiCoachStatus().catch(() => ({ activeMembers: 0, totalChats: 0, avgResponseTime: 0 }))
      ]);
      setLeads(le);
      setCareers(car);
      setEvents(ev);
      setTrainers(tr);
      setEquipment(eq);
      setPlans(pl);
      setTransformations(tf);
      setSettings(se);
      setSocials(so);
      setAiMetrics(met || []);
      setAiStatus(stat || []);
      setMembers(mem || []);
      setAnnouncements(ann || []);
      setWorkoutSchedule(sched || []);
      setAttendanceLogs(att || []);
      setAllAttendanceLogs(allAtt || []);
      setIsNeonActive(!!neonActive);
      if (aiCoachStat) {
        setCoachStatus(aiCoachStat);
      }

      // Load virtual tour data
      try {
        const vtData = await db.getVirtualTour();
        setVirtualTourData(vtData);
        setVtVideoUrl(vtData.video_url || '');
        setVtThumbnailUrl(vtData.thumbnail_url || '');
      } catch { }

      // Load visitor analytics
      try {
        const vaStats = await db.getVisitorAnalyticsStats();
        if (vaStats) setVisitorAnalytics(vaStats);
      } catch { }
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadAllData();
    }
  }, [authorized]);

  useEffect(() => {
    if (authorized) {
      db.getDailyAttendance(attendanceDate).then(setAttendanceLogs).catch(console.error);
    }
  }, [attendanceDate, authorized]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ran_fitness_admin_session');
      // Set the edge-friendly cookie as cleared
      document.cookie = "ran_admin_session=; path=/; max-age=0; SameSite=Strict; Secure";
    }
    router.push('/');
  };

  // CSV Lead Exporter
  const handleExportExcel = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Phone', 'Fitness Goal', 'Preferred Slot', 'Source', 'Date', 'Status', 'Priority'];
    const rows = leads.map(l => [
      l.name,
      l.phone,
      l.goal,
      l.preferred_time,
      l.source,
      new Date(l.created_at).toLocaleDateString(),
      l.status,
      l.priority
    ]);

    const escapeXml = (str: string) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let xmlRows = '';
    // Header row
    xmlRows += '<Row>';
    headers.forEach(h => {
      xmlRows += `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
    });
    xmlRows += '</Row>\n';
    // Data rows
    rows.forEach(row => {
      xmlRows += '<Row>';
      row.forEach(val => {
        xmlRows += `<Cell><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`;
      });
      xmlRows += '</Row>\n';
    });

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Size="11"/>
      <Interior ss:Color="#FACC15" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Leads">
    <Table>
${xmlRows}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ran_fitness_leads_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [sendingAnalytics, setSendingAnalytics] = useState(false);

  const handleSendWeeklyAnalytics = async () => {
    setSendingAnalytics(true);
    try {
      const res = await fetch('/api/analytics/weekly', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        if (data.telegramSent) {
          alert('Weekly performance report sent to Telegram successfully! 📈');
        } else {
          alert(`Stats compiled successfully, but Telegram failed: ${data.telegramError || 'No error message'}`);
        }
      } else {
        alert(`Failed to send analytics: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Error sending analytics: ${err.message || err}`);
    } finally {
      setSendingAnalytics(false);
    }
  };

  const [sendingTelegramTest, setSendingTelegramTest] = useState(false);

  const handleTelegramTest = async () => {
    setSendingTelegramTest(true);
    try {
      const res = await fetch('/api/test-telegram', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToastMessage('✅ Telegram test message sent successfully! Check your Telegram.', 'success');
      } else {
        showToastMessage(`❌ Telegram test failed: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      showToastMessage(`❌ Network error: ${err.message}`, 'error');
    } finally {
      setSendingTelegramTest(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD Actions
  // ---------------------------------------------------------------------------
  const deleteTrainer = async (id: string) => {
    if (confirm('Delete this trainer profile?')) {
      await db.deleteTrainer(id);
      loadAllData();
    }
  };

  const saveTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainer?.name || !editingTrainer?.designation) return;
    
    await db.saveTrainer({
      name: editingTrainer.name,
      designation: editingTrainer.designation,
      experience: editingTrainer.experience || '1 Year',
      specialization: editingTrainer.specialization || 'General',
      quote: editingTrainer.quote || 'Train Hard',
      image_url: editingTrainer.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
      instagram_url: editingTrainer.instagram_url || 'https://instagram.com/ranfitness',
      contact_number: editingTrainer.contact_number || '9666345644',
      badges: Array.isArray(editingTrainer.badges) 
        ? editingTrainer.badges 
        : typeof editingTrainer.badges === 'string'
          ? (editingTrainer.badges as string).split(',').map(b => b.trim())
          : [],
      id: editingTrainer.id
    });

    setEditingTrainer(null);
    loadAllData();
  };

  const deleteEquipment = async (id: string) => {
    if (confirm('Delete this equipment card?')) {
      await db.deleteEquipment(id);
      loadAllData();
    }
  };

  const saveEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment?.name || !editingEquipment?.category) return;

    await db.saveEquipment({
      name: editingEquipment.name,
      category: editingEquipment.category as any,
      brand: editingEquipment.brand || 'Aerofit',
      description: editingEquipment.description || '',
      spec_details: editingEquipment.spec_details || '',
      id: editingEquipment.id
    });

    setEditingEquipment(null);
    loadAllData();
  };

  const deletePlan = async (id: string) => {
    if (confirm('Delete this membership plan?')) {
      await db.deletePlan(id);
      loadAllData();
    }
  };

  const savePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.name || !editingPlan?.price) return;

    await db.savePlan({
      name: editingPlan.name,
      price: Number(editingPlan.price),
      duration: editingPlan.duration || 'Monthly',
      benefits: Array.isArray(editingPlan.benefits) 
        ? editingPlan.benefits 
        : typeof editingPlan.benefits === 'string' 
          ? (editingPlan.benefits as string).split(',').map(b => b.trim()) 
          : [],
      popular_badge: !!editingPlan.popular_badge,
      id: editingPlan.id
    });

    setEditingPlan(null);
    loadAllData();
  };

  const deleteTransformation = async (id: string) => {
    if (confirm('Delete this transformation story?')) {
      await db.deleteTransformation(id);
      loadAllData();
    }
  };

  const saveTransformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransformation?.member_name) return;

    await db.saveTransformation({
      member_name: editingTransformation.member_name,
      before_image: editingTransformation.before_image || '',
      after_image: editingTransformation.after_image || '',
      story: editingTransformation.story || '',
      weight_lost: editingTransformation.weight_lost || '',
      muscle_gained: editingTransformation.muscle_gained || '',
      description: editingTransformation.description || '',
      id: editingTransformation.id
    });

    setEditingTransformation(null);
    loadAllData();
  };

  const deleteEvent = async (id: string) => {
    if (confirm('Delete this event?')) {
      await db.deleteEvent(id);
      loadAllData();
    }
  };

  const saveEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.name || !editingEvent?.date) return;

    await db.saveEvent({
      name: editingEvent.name,
      date: editingEvent.date,
      description: editingEvent.description || '',
      tag: editingEvent.tag || 'Gym Event',
      image_url: editingEvent.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
      id: editingEvent.id
    });

    setEditingEvent(null);
    loadAllData();
  };

  const deleteCareerApp = async (id: string) => {
    if (confirm('Delete this applicant details?')) {
      await db.deleteCareer(id);
      loadAllData();
    }
  };

  const updateSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await db.updateSettings(settings);
    alert('Website configuration settings updated successfully!');
    loadAllData();
  };

  const toggleLeadStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Pending' ? 'Contacted' : currentStatus === 'Contacted' ? 'Joined' : 'Pending';
    await db.updateLeadStatus(id, nextStatus);
    loadAllData();
  };

  const deleteLead = async (id: string) => {
    if (confirm('Delete this lead registration?')) {
      await db.deleteLead(id);
      loadAllData();
    }
  };

  const handleRunHealthCheck = async () => {
    setRunningHealthCheck(true);
    try {
      const res = await fetch('/api/ai-health-check');
      const data = await res.json();
      if (data.success) {
        showToastMessage('✅ AI Provider health checked and cache updated!', 'success');
        loadAllData();
      } else {
        showToastMessage(`❌ Health check failed: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      showToastMessage(`❌ Network error: ${err.message}`, 'error');
    } finally {
      setRunningHealthCheck(false);
    }
  };

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono text-xs transition-colors duration-300">
        <div className="flex flex-col items-center gap-2">
          <Activity className="animate-spin text-yellow-500 dark:text-yellow-400" size={24} />
          <span>Verifying secure admin authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-[#08080a] text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 flex flex-col justify-between p-6 overflow-y-auto transition-colors duration-300">
        <div className="space-y-8">
          <div className="flex flex-col gap-1 items-start select-none">
            <Logo size={28} variant="full" />
            <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 tracking-wider uppercase pl-1 block">CMS Panel V1.2</span>
          </div>

          <nav className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-wider">
            {[
              { id: 'dashboard', label: 'Overview', icon: <TrendingUp size={14} /> },
              { id: 'analytics', label: 'Analytics Hub', icon: <Activity size={14} /> },
              { id: 'members', label: 'Gym Members', icon: <Users size={14} /> },
              { id: 'leads', label: 'Captured Leads', icon: <Users size={14} /> },
              { id: 'careers', label: 'Hiring Apps', icon: <Briefcase size={14} /> },
              { id: 'events', label: 'Event Boards', icon: <Calendar size={14} /> },
              { id: 'trainers', label: 'Trainers List', icon: <Plus size={14} /> },
              { id: 'equipment', label: 'Aerofit Gear', icon: <Dumbbell size={14} /> },
              { id: 'plans', label: 'Pricing Plans', icon: <FileText size={14} /> },
              { id: 'transformations', label: 'Transformations', icon: <Camera size={14} /> },
              { id: 'virtualtour', label: 'Virtual Tour', icon: <Video size={14} /> },
              { id: 'settings', label: 'Settings Editor', icon: <Settings size={14} /> },
              { id: 'ai', label: 'Zeus AI Monitor', icon: <MessageSquare size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-bold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-yellow-400 text-black shadow-md' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-left font-mono text-[11px] uppercase tracking-wider text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/20 transition-all font-bold mt-8 cursor-pointer"
        >
          <LogOut size={14} />
          Exit CMS
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50 dark:bg-[#0c0c0e]">
        
        <header className="bg-white dark:bg-zinc-950 px-8 py-5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between transition-colors duration-300">
          <h2 className="font-display text-lg font-black italic tracking-wider text-yellow-500 dark:text-yellow-400 uppercase">
            {activeTab} Management Panel
          </h2>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span>DATABASE MODE: <strong className={isNeonActive ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold animate-pulse'}>{isNeonActive === null ? 'CONNECTING...' : isNeonActive ? 'NEON DB ACTIVE' : 'LOCAL MOCK FALLBACK'}</strong></span>
            <button
              onClick={handleTelegramTest}
              disabled={sendingTelegramTest}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1.5 text-[10px] font-bold font-mono uppercase hover:border-yellow-400 dark:hover:border-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-400 disabled:opacity-50 transition-all"
            >
              {sendingTelegramTest ? 'Testing...' : 'Send Test Telegram'}
            </button>
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
        </header>

        {/* Tab display */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* OVERVIEW DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stats Cards */}
              {(() => {
                const totalMembersCount = members.length;
                const activeMembersCount = members.filter(m => m.status === 'Active' || m.status === 'Expiring Soon').length;
                const expiredMembersCount = members.filter(m => m.status === 'Expired').length;
                
                const monthlyRevenue = members.reduce((sum, m) => {
                  if (m.status === 'Expired' || m.status === 'Suspended') return sum;
                  const price = getPlanPrice(m.plan_id, m.membership_type, plans);
                  const duration = getPlanDuration(m.plan_id, m.membership_type, plans);
                  return sum + (price / duration);
                }, 0);
                
                const yearlyRevenue = monthlyRevenue * 12;

                const expectedRenewals = members.filter(m => {
                  if (m.status === 'Suspended' || m.status === 'Expired') return false;
                  const diff = Math.ceil((new Date(m.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return diff >= 0 && diff <= 30;
                }).reduce((sum, m) => {
                  return sum + getPlanPrice(m.plan_id, m.membership_type, plans);
                }, 0);

                const expiredRevenue = members.filter(m => m.status === 'Expired').reduce((sum, m) => {
                  return sum + getPlanPrice(m.plan_id, m.membership_type, plans);
                }, 0);

                const expiringSoonList = members.filter(m => {
                  if (m.status === 'Suspended' || m.status === 'Expired') return false;
                  const diff = Math.ceil((new Date(m.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return diff >= 0 && diff <= 30;
                });

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Card 1: Total Registered */}
                      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 relative overflow-hidden group hover:border-yellow-400/30 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[110px]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Total Registered</span>
                          <Users size={16} className="text-yellow-500 opacity-60 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="text-2xl font-black italic text-yellow-500 dark:text-yellow-400 font-display mt-2">{totalMembersCount} Members</div>
                      </div>

                      {/* Card 2: Active Plan Holders */}
                      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[110px]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Active Plan Holders</span>
                          <CheckCircle size={16} className="text-green-500 opacity-60 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="text-2xl font-black italic text-green-500 font-display mt-2">{activeMembersCount} Active</div>
                      </div>

                      {/* Card 3: Expired Plans */}
                      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[110px]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Expired Plans</span>
                          <AlertTriangle size={16} className="text-red-500 opacity-60 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="text-2xl font-black italic text-red-500 font-display mt-2">{expiredMembersCount} Expired</div>
                      </div>

                      {/* Card 4: Est. Monthly Revenue */}
                      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 relative overflow-hidden group hover:border-yellow-400/30 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[110px]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Est. Monthly Revenue</span>
                          <TrendingUp size={16} className="text-yellow-400 opacity-60 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="text-2xl font-black italic text-yellow-400 font-display mt-2">₹{Math.round(monthlyRevenue).toLocaleString('en-IN')}</div>
                      </div>

                      {/* Card 5: Est. Annual Billing */}
                      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-400/30 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[110px]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-zinc-400 dark:bg-zinc-500" />
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Est. Annual Billing</span>
                          <Activity size={16} className="text-zinc-400 opacity-60 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="text-2xl font-black italic text-zinc-800 dark:text-white font-display mt-2">₹{Math.round(yearlyRevenue).toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Chart & Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Financial Chart */}
                      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 lg:col-span-2 space-y-4">
                        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          Estimated Monthly Revenue Billing Trend
                        </h4>
                        
                        <div className="w-full h-60 flex items-center justify-center">
                          {(() => {
                            const chartPoints = Array.from({ length: 6 }, (_, i) => {
                              const d = new Date();
                              d.setMonth(d.getMonth() - (5 - i));
                              const monthNum = d.getMonth();
                              const year = d.getFullYear();
                              const label = d.toLocaleDateString('en-US', { month: 'short' });
                              
                              const activeMembersInMonth = members.filter(mem => {
                                const start = new Date(mem.start_date);
                                const end = new Date(mem.end_date);
                                const monthStart = new Date(year, monthNum, 1);
                                const monthEnd = new Date(year, monthNum + 1, 0);
                                return start <= monthEnd && end >= monthStart && mem.status !== 'Suspended';
                              });
                              
                              const val = activeMembersInMonth.reduce((sum, mem) => {
                                const price = getPlanPrice(mem.plan_id, mem.membership_type, plans);
                                const dur = getPlanDuration(mem.plan_id, mem.membership_type, plans);
                                return sum + (price / dur);
                              }, 0);
                              
                              return { month: label, value: Math.round(val) || 3000 };
                            });
                            const maxRevVal = Math.max(...chartPoints.map(p => p.value), 40000);
                            const points = chartPoints.map((p, index) => {
                              const x = 50 + index * 70;
                              const y = 180 - (p.value / maxRevVal) * 130;
                              return { x, y, ...p };
                            });

                            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                            return (
                              <svg viewBox="0 0 470 200" className="w-full h-full text-yellow-400">
                                <defs>
                                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#facc15" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                <line x1="50" y1="50" x2="400" y2="50" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                                <line x1="50" y1="115" x2="400" y2="115" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                                <line x1="50" y1="180" x2="400" y2="180" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1.5" />

                                <path d={areaD} fill="url(#revGrad)" />
                                <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                {points.map((p, idx) => (
                                  <g key={idx}>
                                    <circle cx={p.x} cy={p.y} r="4.5" fill="#09090b" stroke="#facc15" strokeWidth="2.5" />
                                    <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#e4e4e7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                                      ₹{(p.value / 1000).toFixed(1)}k
                                    </text>
                                    <text x={p.x} y={195} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
                                      {p.month}
                                    </text>
                                  </g>
                                ))}
                              </svg>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Expiring members Alerts Widget */}
                      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 lg:col-span-1 space-y-4 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-yellow-400" /> Expiring Soon (Next 30 Days)
                          </h4>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Send direct WhatsApp notifications to prompt renewals.
                          </p>

                          <div className="mt-4 space-y-2.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                            {expiringSoonList.length === 0 ? (
                              <div className="text-zinc-500 italic text-[10px] py-6 text-center font-mono">No memberships expiring within 30 days.</div>
                            ) : (
                              expiringSoonList.map((m) => {
                                const diff = Math.ceil((new Date(m.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                  <div key={m.id} className="flex justify-between items-center rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 text-[10px] font-mono">
                                    <div>
                                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{m.name}</p>
                                      <p className="text-zinc-500 mt-0.5">Expires in {diff} days ({m.end_date})</p>
                                    </div>
                                    <a
                                      href={`https://wa.me/91${m.phone}?text=Hi%20${encodeURIComponent(m.name)},%20this%20is%20RAN%20Fitness.%20Your%20membership%20expires%20on%20${m.end_date}.%20Please%20renew%20soon!`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded bg-yellow-400 text-black px-2 py-1 font-bold text-[9px] uppercase tracking-wider hover:bg-yellow-300 transition-colors"
                                    >
                                      Remind
                                    </a>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-mono text-zinc-500">
                          💡 System runs automatic expiration checks daily.
                        </div>
                      </div>

                    </div>
                  </>
                );
              })()}

            </div>
          )}

          {/* ANALYTICS HUB TAB */}
          {activeTab === 'analytics' && (() => {
            const totalMembersCount = members.length;
            const activeMembersCount = members.filter(m => m.status === 'Active' || m.status === 'Expiring Soon').length;
            const expiredMembersCount = members.filter(m => m.status === 'Expired').length;
            const monthlyRevenue = members.reduce((sum, m) => {
              if (m.status === 'Expired' || m.status === 'Suspended') return sum;
              const price = getPlanPrice(m.plan_id, m.membership_type, plans);
              const duration = getPlanDuration(m.plan_id, m.membership_type, plans);
              return sum + (price / duration);
            }, 0);
            const yearlyRevenue = monthlyRevenue * 12;

            const expectedRenewals = members.filter(m => {
              if (m.status === 'Suspended' || m.status === 'Expired') return false;
              const diff = Math.ceil((new Date(m.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return diff >= 0 && diff <= 30;
            }).reduce((sum, m) => {
              return sum + getPlanPrice(m.plan_id, m.membership_type, plans);
            }, 0);

            const expiredRevenue = members.filter(m => m.status === 'Expired').reduce((sum, m) => {
              return sum + getPlanPrice(m.plan_id, m.membership_type, plans);
            }, 0);

            // Daily attendance chart data
            const dailyAttendanceData = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dateString = d.toISOString().split('T')[0];
              const count = allAttendanceLogs.filter(a => a.check_in_time.startsWith(dateString)).length;
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              return { label: dayName, value: count };
            });

            // Weekly attendance chart data
            const weeklyAttendanceData = [3, 2, 1, 0].map(w => {
              const start = new Date();
              start.setDate(start.getDate() - (w * 7 + 6));
              start.setHours(0,0,0,0);
              const end = new Date();
              end.setDate(end.getDate() - (w * 7));
              end.setHours(23,59,59,999);
              const count = allAttendanceLogs.filter(a => {
                const time = new Date(a.check_in_time).getTime();
                return time >= start.getTime() && time <= end.getTime();
              }).length;
              return { label: w === 0 ? 'This Week' : `${w} Wk${w > 1 ? 's' : ''} Ago`, value: count };
            });

            // Monthly attendance chart data
            const monthlyAttendanceData = Array.from({ length: 6 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - (5 - i));
              const monthNum = d.getMonth();
              const year = d.getFullYear();
              const label = d.toLocaleDateString('en-US', { month: 'short' });
              const count = allAttendanceLogs.filter(a => {
                const checkD = new Date(a.check_in_time);
                return checkD.getMonth() === monthNum && checkD.getFullYear() === year;
              }).length;
              return { label, value: count };
            });

            const attChartData = attendanceRange === 'daily' 
              ? dailyAttendanceData 
              : attendanceRange === 'weekly' 
                ? weeklyAttendanceData 
                : monthlyAttendanceData;

            // Member Growth Chart Data
            const memberGrowthData = Array.from({ length: 6 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - (5 - i));
              const monthNum = d.getMonth();
              const year = d.getFullYear();
              const label = d.toLocaleDateString('en-US', { month: 'short' });
              const count = members.filter(mem => {
                const checkD = new Date(mem.created_at || mem.start_date);
                return checkD.getMonth() === monthNum && checkD.getFullYear() === year;
              }).length;
              return { label, value: count };
            });

            // Revenue Trend Chart Data
            const revenueTrendData = Array.from({ length: 6 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - (5 - i));
              const monthNum = d.getMonth();
              const year = d.getFullYear();
              const label = d.toLocaleDateString('en-US', { month: 'short' });
              
              const activeMembersInMonth = members.filter(mem => {
                const start = new Date(mem.start_date);
                const end = new Date(mem.end_date);
                const monthStart = new Date(year, monthNum, 1);
                const monthEnd = new Date(year, monthNum + 1, 0);
                return start <= monthEnd && end >= monthStart && mem.status !== 'Suspended';
              });
              
              const sum = activeMembersInMonth.reduce((total, mem) => {
                const price = getPlanPrice(mem.plan_id, mem.membership_type, plans);
                const dur = getPlanDuration(mem.plan_id, mem.membership_type, plans);
                return total + (price / dur);
              }, 0);
              
              return { label, value: Math.round(sum) };
            });

            // AI Diagnostics Stats
            const totalQueries = aiMetrics.length;
            const groqQueries = aiMetrics.filter(m => m.provider === 'groq');
            const geminiQueries = aiMetrics.filter(m => m.provider === 'gemini');
            const fallbackQueries = aiMetrics.filter(m => m.provider === 'fallback');

            const groqSuccessCount = groqQueries.filter(m => m.success).length;
            const groqFailCount = groqQueries.filter(m => !m.success).length;
            const geminiSuccessCount = geminiQueries.filter(m => m.success).length;
            const geminiFailCount = geminiQueries.filter(m => !m.success).length;

            const avgGroqLatency = groqSuccessCount > 0 
              ? Math.round(groqQueries.filter(m => m.success).reduce((sum, m) => sum + m.response_time_ms, 0) / groqSuccessCount)
              : 0;

            const avgGeminiLatency = geminiSuccessCount > 0 
              ? Math.round(geminiQueries.filter(m => m.success).reduce((sum, m) => sum + m.response_time_ms, 0) / geminiSuccessCount)
              : 0;

            const groqStatusObj = aiStatus.find(s => s.provider === 'groq');
            const geminiStatusObj = aiStatus.find(s => s.provider === 'gemini');

            const groqOnline = groqStatusObj ? groqStatusObj.healthy : false;
            const geminiOnline = geminiStatusObj ? geminiStatusObj.healthy : false;

            return (
              <div className="space-y-6">
                {/* Member Analytics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Members</span>
                    <div className="text-xl font-black italic text-yellow-500 dark:text-yellow-400 font-display">{totalMembersCount} Members</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Active Members</span>
                    <div className="text-xl font-black italic text-green-500 font-display">{activeMembersCount} Active</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Expired Members</span>
                    <div className="text-xl font-black italic text-red-500 font-display">{expiredMembersCount} Expired</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Monthly Revenue</span>
                    <div className="text-xl font-black italic text-yellow-400 font-display">₹{Math.round(monthlyRevenue).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all" title="Expected renewals from active plans expiring within 30 days">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Expected Renewals</span>
                    <div className="text-xl font-black italic text-purple-450 dark:text-purple-400 font-display">₹{Math.round(expectedRenewals).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all" title="Loss of revenue from expired memberships">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Expired Revenue</span>
                    <div className="text-xl font-black italic text-red-400 font-display">₹{Math.round(expiredRevenue).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Website Visitor Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Visitors</span>
                    <div className="text-2xl font-black italic text-blue-500 dark:text-blue-400 font-display">{visitorAnalytics.totalVisitors}</div>
                    <span className="text-[9px] text-zinc-400 font-mono block">Today: {visitorAnalytics.todayVisitors} · Week: {visitorAnalytics.weekVisitors}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Book Trial Clicks</span>
                    <div className="text-2xl font-black italic text-yellow-500 dark:text-yellow-400 font-display">{visitorAnalytics.bookTrialClicks}</div>
                    <span className="text-[9px] text-zinc-400 font-mono block">CTA engagement</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Virtual Tour Opens</span>
                    <div className="text-2xl font-black italic text-purple-500 dark:text-purple-400 font-display">{visitorAnalytics.virtualTourOpens}</div>
                    <span className="text-[9px] text-zinc-400 font-mono block">Tour interest</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 transition-all">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Conversion Rate</span>
                    <div className="text-2xl font-black italic text-green-500 dark:text-green-400 font-display">{visitorAnalytics.conversionRate}%</div>
                    <span className="text-[9px] text-zinc-400 font-mono block">Returning: {visitorAnalytics.returningVisitors}</span>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Attendance Tracking Chart */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                        Attendance Check-in Analytics
                      </h4>
                      <div className="flex border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden text-[9px] font-mono">
                        {(['daily', 'weekly', 'monthly'] as const).map((range) => (
                          <button
                            key={range}
                            onClick={() => setAttendanceRange(range)}
                            className={`px-2 py-1 uppercase font-bold transition-all ${
                              attendanceRange === range
                                ? 'bg-yellow-400 text-black'
                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full h-60 flex items-center justify-center">
                      {(() => {
                        const maxValue = Math.max(...attChartData.map(d => d.value), 5);
                        const barWidth = Math.min(30, 240 / attChartData.length);
                        return (
                          <svg viewBox="0 0 500 200" className="w-full h-full text-yellow-400">
                            <line x1="30" y1="40" x2="480" y2="40" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="30" y1="100" x2="480" y2="100" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="30" y1="160" x2="480" y2="160" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1.5" />
                            
                            {attChartData.map((d, index) => {
                              const x = 50 + index * (410 / attChartData.length);
                              const barHeight = (d.value / maxValue) * 120;
                              const y = 160 - barHeight;
                              return (
                                <g key={index}>
                                  <rect 
                                    x={x - barWidth / 2} 
                                    y={y} 
                                    width={barWidth} 
                                    height={barHeight} 
                                    rx="3" 
                                    fill="currentColor" 
                                    className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                                  />
                                  <text 
                                    x={x} 
                                    y={y - 6} 
                                    textAnchor="middle" 
                                    fill="#e4e4e7" 
                                    fontSize="9" 
                                    fontFamily="monospace" 
                                    fontWeight="bold"
                                  >
                                    {d.value}
                                  </text>
                                  <text 
                                    x={x} 
                                    y={175} 
                                    textAnchor="middle" 
                                    fill="#71717a" 
                                    fontSize="9" 
                                    fontFamily="monospace"
                                  >
                                    {d.label}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Member Growth Chart */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                      New Member Growth (Last 6 Months)
                    </h4>
                    <div className="w-full h-60 flex items-center justify-center">
                      {(() => {
                        const maxValue = Math.max(...memberGrowthData.map(d => d.value), 5);
                        const points = memberGrowthData.map((d, idx) => {
                          const x = 50 + idx * 75;
                          const y = 160 - (d.value / maxValue) * 120;
                          return { x, y, ...d };
                        });
                        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        const areaD = `${pathD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;
                        return (
                          <svg viewBox="0 0 500 200" className="w-full h-full text-green-400">
                            <defs>
                              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <line x1="50" y1="40" x2="425" y2="40" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="50" y1="100" x2="425" y2="100" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="50" y1="160" x2="425" y2="160" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1.5" />
                            
                            <path d={areaD} fill="url(#growthGrad)" />
                            <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle cx={p.x} cy={p.y} r="4.5" fill="#09090b" stroke="#4ade80" strokeWidth="2.5" />
                                <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#e4e4e7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                                  +{p.value}
                                </text>
                                <text x={p.x} y={175} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
                                  {p.label}
                                </text>
                              </g>
                            ))}
                          </svg>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                      New Plan Value Revenue Trend (Last 6 Months)
                    </h4>
                    <div className="w-full h-60 flex items-center justify-center">
                      {(() => {
                        const maxValue = Math.max(...revenueTrendData.map(d => d.value), 10000);
                        const points = revenueTrendData.map((d, idx) => {
                          const x = 50 + idx * 75;
                          const y = 160 - (d.value / maxValue) * 120;
                          return { x, y, ...d };
                        });
                        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        const areaD = `${pathD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;
                        return (
                          <svg viewBox="0 0 500 200" className="w-full h-full text-yellow-500">
                            <defs>
                              <linearGradient id="revTrendGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <line x1="50" y1="40" x2="425" y2="40" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="50" y1="100" x2="425" y2="100" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="50" y1="160" x2="425" y2="160" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1.5" />
                            
                            <path d={areaD} fill="url(#revTrendGrad)" />
                            <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle cx={p.x} cy={p.y} r="4.5" fill="#09090b" stroke="#eab308" strokeWidth="2.5" />
                                <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#e4e4e7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                                  ₹{(p.value / 1000).toFixed(1)}k
                                </text>
                                <text x={p.x} y={175} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
                                  {p.label}
                                </text>
                              </g>
                            ))}
                          </svg>
                        );
                      })()}
                    </div>
                  </div>

                  {/* AI Diagnostic Dashboard */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                      Zeus AI Engine Latency & Telemetry
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-100 dark:border-zinc-900 rounded-lg space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono block">Primary (Groq) Status</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          groqOnline 
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/20' 
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${groqOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          {groqOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <span className="text-xs font-mono block pt-1 text-zinc-500">Latency: {avgGroqLatency > 0 ? `${avgGroqLatency}ms` : 'N/A'}</span>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-100 dark:border-zinc-900 rounded-lg space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono block">Failover (Gemini) Status</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          geminiOnline 
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/20' 
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${geminiOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          {geminiOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <span className="text-xs font-mono block pt-1 text-zinc-500">Latency: {avgGeminiLatency > 0 ? `${avgGeminiLatency}ms` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-100 dark:border-zinc-900 rounded-lg space-y-2 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                      <div className="flex justify-between">
                        <span>Total Conversations:</span>
                        <span className="font-bold text-zinc-950 dark:text-white">{totalQueries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Groq Traffic:</span>
                        <span className="font-bold text-zinc-950 dark:text-white">{groqQueries.length} requests</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gemini Traffic:</span>
                        <span className="font-bold text-zinc-950 dark:text-white">{geminiQueries.length} requests</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fallback Mode Activations:</span>
                        <span className="font-bold text-red-500">{fallbackQueries.length} triggered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* GYM MEMBERS MANAGEMENT TAB */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              
              {/* Header Action Row */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 rounded-xl transition-colors duration-300">
                <div className="flex-1 w-full">
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    RAN Gym Member Roster
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Register members, track body composition progress logs, and publish notices.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setEditingMember({
                      name: '',
                      phone: '',
                      email: '',
                      membership_type: 'Monthly',
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                      status: 'Active',
                      notes: ''
                    });
                    setIsAddMemberOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-yellow-300 transition-all font-mono"
                >
                  <Plus size={14} /> Add Gym Member
                </button>
              </div>

              {/* Members Table */}
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 overflow-hidden p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                    Active Member Accounts
                  </h4>
                  <input
                    type="text"
                    placeholder="Search member by name, ID, phone..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full sm:w-64 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                
                <div className="overflow-x-auto text-[11px] font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-900 text-zinc-400 pb-2 uppercase tracking-wider">
                        <th className="pb-2">Member ID</th>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Phone</th>
                        <th className="pb-2">Plan</th>
                        <th className="pb-2">Joined Date</th>
                        <th className="pb-2">Expiry Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                      {(() => {
                        const filtered = members.filter(m =>
                          m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                          m.member_id.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                          m.phone.includes(memberSearchQuery)
                        );
                        return filtered.map((m) => (
                          <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                            <td className="py-2.5 font-bold text-yellow-500">{m.member_id}</td>
                            <td className="py-2.5 font-sans font-bold text-zinc-900 dark:text-white">{m.name}</td>
                            <td className="py-2.5">{m.phone}</td>
                            <td className="py-2.5 uppercase text-[10px]">{m.membership_type}</td>
                            <td className="py-2.5">{m.start_date}</td>
                            <td className="py-2.5 font-bold">{m.end_date}</td>
                            <td className="py-2.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                m.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/20' :
                                m.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/20' :
                                m.status === 'Suspended' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/20' :
                                'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/20'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditingMember(m);
                                  setIsAddMemberOpen(true);
                                }}
                                className="text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                                title="Edit Member"
                              >
                                <Edit3 size={13} className="inline" />
                              </button>
                              <button
                                onClick={() => handleOpenDietModal(m)}
                                className="text-zinc-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                title="Assign Diet Plan"
                              >
                                <FileText size={13} className="inline" />
                              </button>
                              <button
                                onClick={() => handleOpenWorkoutModal(m)}
                                className="text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                                title="Assign Workout Plan"
                              >
                                <Dumbbell size={13} className="inline" />
                              </button>
                              <button
                                onClick={() => handleOpenNoteModal(m)}
                                className="text-zinc-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                                title="Add Trainer Note"
                              >
                                <MessageSquare size={13} className="inline" />
                              </button>
                              <button
                                onClick={() => {
                                  setProgressMemberId(m.member_id);
                                  setIsAddProgressOpen(true);
                                }}
                                className="text-zinc-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                title="Log Body Metrics Progress"
                              >
                                <TrendingUp size={13} className="inline" />
                              </button>
                              <button
                                onClick={() => {
                                  const confirmRenew = confirm(`Renew ${m.name}'s membership plan?`);
                                  if (confirmRenew) {
                                    const today = new Date().toISOString().split('T')[0];
                                    const pId = m.plan_id || plans.find(p => p.name === m.membership_type || p.duration === m.membership_type)?.id || 'p1';
                                    const selectedPlan = plans.find(p => p.id === pId);
                                    let days = 30;
                                    if (selectedPlan) {
                                      const dur = selectedPlan.duration.toLowerCase();
                                      if (dur.includes('monthly')) days = 30;
                                      else if (dur.includes('quarterly')) days = 90;
                                      else if (dur.includes('half-yearly')) days = 180;
                                      else if (dur.includes('yearly') || dur.includes('annual')) days = 365;
                                    }
                                    
                                    const end = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
                                    db.saveMember({
                                      ...m,
                                      start_date: today,
                                      end_date: end,
                                      status: 'Active',
                                      notes: 'RENEWAL'
                                    }).then(() => {
                                      showToastMessage(`✅ Membership plan for ${m.name} renewed!`);
                                      db.getMembers().then(setMembers);
                                    }).catch(err => showToastMessage(err.message || 'Renewal failed', 'error'));
                                  }
                                }}
                                className="text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                title="Quick Renew Membership"
                              >
                                <Clock size={13} className="inline" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id!)}
                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                title="Delete Member"
                              >
                                <Trash2 size={13} className="inline" />
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                      {members.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-4 text-center text-zinc-500 italic">No gym members registered. Click "Add Gym Member" above to register a member.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Logs & Workout Schedule Editor split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Check-ins log viewer (5 cols) */}
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 lg:col-span-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                      Attendance Logger
                    </h4>
                    
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] p-1 text-zinc-800 dark:text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {attendanceLogs.length === 0 ? (
                      <div className="text-zinc-500 italic text-[10px] text-center font-mono py-8">No check-ins logged for this date.</div>
                    ) : (
                      attendanceLogs.map((a, idx) => {
                        const checkInTime = new Date(a.check_in_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                        // Find member name
                        const mInfo = members.find(m => m.member_id === a.member_id);
                        return (
                          <div key={idx} className="flex justify-between items-center rounded bg-zinc-50 dark:bg-zinc-900 px-3 py-2 border border-zinc-100 dark:border-zinc-850 text-[10px] font-mono">
                            <div>
                              <span className="font-bold text-zinc-800 dark:text-white">{mInfo?.name || 'Unknown Member'}</span>
                              <span className="text-zinc-500 text-[9px] ml-1.5">({a.member_id})</span>
                            </div>
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold">{checkInTime}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Workout schedule editor (7 cols) */}
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                    Chest/Back Workout Schedule Editor
                  </h4>

                  <div className="overflow-x-auto text-[10px] font-mono">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-900 text-zinc-400 pb-1.5 uppercase">
                          <th className="pb-1.5">Day</th>
                          <th className="pb-1.5">Target Area Title</th>
                          <th className="pb-1.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                        {workoutSchedule.map((w) => (
                          <tr key={w.day} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                            <td className="py-2.5 font-bold">{w.day}</td>
                            <td className="py-2.5 font-sans truncate max-w-xs">{w.title}</td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => setWorkoutScheduleEditing(w)}
                                className="text-yellow-600 dark:text-yellow-400 hover:underline text-[9px] uppercase font-bold"
                              >
                                Edit Routine
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Announcement publisher */}
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-850 dark:text-zinc-200">
                  Gym Announcements Broadcaster
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Publish Form */}
                  <form onSubmit={handlePublishAnnouncement} className="lg:col-span-5 space-y-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 p-4 rounded-xl">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zumba Session updates"
                        value={newAnnouncementTitle}
                        onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                        className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Message Details</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Type notice description here..."
                        value={newAnnouncementMessage}
                        onChange={(e) => setNewAnnouncementMessage(e.target.value)}
                        className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded bg-yellow-400 text-black py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-yellow-300 transition-colors"
                    >
                      Broadcast Notice
                    </button>
                  </form>

                  {/* Broadcast History */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <h5 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">Broadcast History</h5>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                      {announcements.map((a) => (
                        <div key={a.id} className="flex justify-between items-start rounded-lg border border-zinc-100 dark:border-zinc-900 p-3 text-[10px] bg-zinc-50/50 dark:bg-zinc-900/20">
                          <div className="flex-1 pr-4">
                            <h6 className="font-bold text-zinc-800 dark:text-white font-sans">{a.title}</h6>
                            <p className="text-zinc-500 mt-1 leading-relaxed font-sans">{a.message}</p>
                            <span className="text-[8px] text-zinc-400 dark:text-zinc-650 font-mono mt-1 block">
                              Published: {new Date(a.created_at || '').toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteAnnouncement(a.id!)}
                            className="text-red-500 hover:underline uppercase text-[9px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Leads Captured</span>
                  <div className="text-2xl font-black italic text-yellow-400 font-display">{leads.length}</div>
                </div>
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Hot Leads 🔥</span>
                  <div className="text-2xl font-black italic text-red-500 font-display">
                    {leads.filter(l => l.priority === 'Hot Lead 🔥').length}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Warm Leads 🟡</span>
                  <div className="text-2xl font-black italic text-yellow-500 font-display">
                    {leads.filter(l => l.priority === 'Warm Lead 🟡').length}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Joined Members</span>
                  <div className="text-2xl font-black italic text-green-500 font-display">
                    {leads.filter(l => l.status === 'Joined').length}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 rounded-xl transition-colors duration-300">
                <span className="text-xs text-zinc-400 font-mono">Filter, export, or broadcast weekly performance analytics to Telegram.</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSendWeeklyAnalytics}
                    disabled={sendingAnalytics}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-yellow-600 dark:text-yellow-400 px-4 py-2 text-xs font-bold font-mono uppercase hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                  >
                    {sendingAnalytics ? 'Sending...' : 'Trigger Telegram Stats'}
                  </button>
                  <button
                    onClick={handleExportExcel}
                    disabled={leads.length === 0}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-bold font-mono uppercase hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                  >
                    <Download size={14} />
                    Export Leads Excel
                  </button>
                </div>
              </div>


              {/* Leads Table */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-mono border-b border-zinc-200 dark:border-zinc-800 uppercase text-[10px]">
                      <th className="p-4 font-bold">Priority</th>
                      <th className="p-4 font-bold">Member Name</th>
                      <th className="p-4 font-bold">Phone</th>
                      <th className="p-4 font-bold">Goal Target</th>
                      <th className="p-4 font-bold">Preferred Slot</th>
                      <th className="p-4 font-bold">Source</th>
                      <th className="p-4 font-bold">Date Registered</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900/50 transition-colors">
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            lead.priority === 'Hot Lead 🔥' 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' 
                              : lead.priority === 'Warm Lead 🟡'
                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-zinc-900 dark:text-white text-[13px]">{lead.name}</td>
                        <td className="p-4 font-mono text-zinc-650 dark:text-zinc-450 select-all">{lead.phone}</td>
                        <td className="p-4 text-zinc-700 dark:text-zinc-350">{lead.goal}</td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400">{lead.preferred_time}</td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400">
                          <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono text-yellow-600 dark:text-yellow-400">
                            {lead.source}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 font-mono">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleLeadStatus(lead.id, lead.status)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                              lead.status === 'Joined' 
                                ? 'bg-green-950/40 border-green-500/20 text-green-400' 
                                : lead.status === 'Contacted'
                                  ? 'bg-blue-950/40 border-blue-500/20 text-blue-400'
                                  : 'bg-yellow-950/40 border-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            <Clock size={10} />
                            {lead.status}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-zinc-600 font-mono">
                          No gym leads registered in the database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* CAREERS TAB */}
          {activeTab === 'careers' && (
            <div className="space-y-6">
              <span className="text-zinc-400 text-xs font-mono block mb-4">Review applicant profiles for gym staff hiring.</span>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-mono border-b border-zinc-200 dark:border-zinc-800 uppercase text-[10px]">
                      <th className="p-4 font-bold">Applicant Name</th>
                      <th className="p-4 font-bold">Phone</th>
                      <th className="p-4 font-bold">Role Applied</th>
                      <th className="p-4 font-bold">Experience & Qualifications</th>
                      <th className="p-4 font-bold">Submission Date</th>
                      <th className="p-4 text-center font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
                    {careers.map((app) => (
                      <tr key={app.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900/50 transition-colors">
                        <td className="p-4 font-bold text-zinc-900 dark:text-white text-[13px]">{app.name}</td>
                        <td className="p-4 font-mono text-zinc-600 dark:text-zinc-400 select-all">{app.phone}</td>
                        <td className="p-4">
                          <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-0.5 rounded text-[10px] font-mono text-yellow-600 dark:text-yellow-400 font-bold uppercase">
                            {app.role}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-700 dark:text-zinc-300">{app.experience}</td>
                        <td className="p-4 text-zinc-500 font-mono">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => deleteCareerApp(app.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {careers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-600 font-mono">
                          No job applications submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs font-mono">Manage regional challenges, zumba and CrossFit events.</span>
                <button
                  onClick={() => setEditingEvent({})}
                  className="flex items-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-bold font-mono uppercase hover:bg-yellow-300"
                >
                  <Plus size={14} /> Create Event
                </button>
              </div>

              {/* Grid of events */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((ev) => (
                  <div key={ev.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl overflow-hidden shadow-xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded px-2.5 py-0.5 text-[9px] font-mono uppercase font-bold">
                          {ev.tag}
                        </span>
                        <span className="text-zinc-500 font-mono text-[10px]">{ev.date}</span>
                      </div>
                      <h4 className="font-display font-black text-base italic text-white uppercase">{ev.name}</h4>
                      <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{ev.description}</p>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
                      <button
                        onClick={() => setEditingEvent(ev)}
                        className="text-zinc-400 hover:text-yellow-400 p-1 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="text-zinc-400 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRAINERS TAB */}
          {activeTab === 'trainers' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs font-mono">Add or edit professional coaches</span>
                <button
                  onClick={() => setEditingTrainer({})}
                  className="flex items-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-bold font-mono uppercase hover:bg-yellow-300"
                >
                  <Plus size={14} /> Add New Trainer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map((trainer) => (
                  <div key={trainer.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between p-5 space-y-4">
                    <div className="flex gap-4">
                      <img src={trainer.image_url} alt={trainer.name} className="w-16 h-20 object-cover rounded-lg border border-zinc-900" />
                      <div>
                        <h4 className="font-display font-black text-base italic text-white uppercase">{trainer.name}</h4>
                        <span className="text-yellow-400 font-mono text-[9px] uppercase tracking-widest font-extrabold">{trainer.experience}</span>
                        <p className="text-zinc-400 text-[11px] mt-1">{trainer.designation}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {trainer.badges && trainer.badges.map((b, bIdx) => (
                        <span key={bIdx} className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded text-[8px] font-mono uppercase font-semibold">
                          {b}
                        </span>
                      ))}
                    </div>

                    <p className="text-zinc-500 text-xs italic font-serif leading-relaxed">"{trainer.quote}"</p>
                    
                    <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
                      <button
                        onClick={() => setEditingTrainer(trainer)}
                        className="text-zinc-400 hover:text-yellow-400 p-1 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTrainer(trainer.id)}
                        className="text-zinc-400 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* EQUIPMENT TAB */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs font-mono">Manage Aerofit equipment stock cards</span>
                <button
                  onClick={() => setEditingEquipment({ brand: 'Aerofit', category: 'Strength' })}
                  className="flex items-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-bold font-mono uppercase hover:bg-yellow-300"
                >
                  <Plus size={14} /> Add Station Gear
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-mono border-b border-zinc-200 dark:border-zinc-800 uppercase text-[10px]">
                      <th className="p-4 font-bold">Equipment Name</th>
                      <th className="p-4 font-bold">Brand</th>
                      <th className="p-4 font-bold">Category</th>
                      <th className="p-4 font-bold">Description</th>
                      <th className="p-4 font-bold">Specifications</th>
                      <th className="p-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
                    {equipment.map((eq) => (
                      <tr key={eq.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900/50 transition-colors">
                        <td className="p-4 font-bold text-zinc-900 dark:text-white">{eq.name}</td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400 font-mono">{eq.brand}</td>
                        <td className="p-4">
                          <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono text-yellow-600 dark:text-yellow-400 font-bold uppercase">
                            {eq.category}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 dark:text-zinc-450 max-w-[200px] truncate">{eq.description}</td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400 font-mono max-w-[150px] truncate">{eq.spec_details}</td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => setEditingEquipment(eq)}
                            className="text-zinc-400 hover:text-yellow-400 transition-colors"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => deleteEquipment(eq.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* PLANS TAB */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs font-mono">Edit pricing membership tiers</span>
                <button
                  onClick={() => setEditingPlan({ duration: 'Monthly', benefits: [] })}
                  className="flex items-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-bold font-mono uppercase hover:bg-yellow-300"
                >
                  <Plus size={14} /> Add Membership
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-display font-black text-base italic text-white uppercase">{plan.name}</h4>
                      <div className="text-2xl font-black text-yellow-400 font-display mt-2">₹{plan.price} <span className="text-zinc-500 text-[10px]">/ {plan.duration}</span></div>
                      <ul className="text-zinc-500 text-[10px] space-y-1.5 mt-4">
                        {plan.benefits.map((b, bIdx) => (
                          <li key={bIdx}>• {b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="text-zinc-400 hover:text-yellow-400 p-1 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="text-zinc-400 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TRANSFORMATIONS TAB */}
          {activeTab === 'transformations' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs font-mono">Upload weight loss before/after overlays</span>
                <button
                  onClick={() => setEditingTransformation({})}
                  className="flex items-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-bold font-mono uppercase hover:bg-yellow-300"
                >
                  <Plus size={14} /> Upload Story
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transformations.map((trans) => (
                  <div key={trans.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-5 flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="flex h-10 w-16 bg-zinc-900 border border-zinc-800 rounded items-center justify-center text-[10px] text-zinc-500 uppercase font-mono">
                        Before/After
                      </div>
                      <div>
                        <h4 className="font-display font-black text-sm italic text-white uppercase">{trans.member_name}</h4>
                        <span className="text-yellow-400 font-mono text-[9px] uppercase tracking-widest">{trans.weight_lost}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTransformation(trans)}
                        className="text-zinc-400 hover:text-yellow-400 p-1 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTransformation(trans.id)}
                        className="text-zinc-400 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* CONFIGURATION SETTINGS TAB */}
          {/* CONFIGURATION SETTINGS TAB */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-6 max-w-2xl">
              {/* Sub tabs navigation */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-900 pb-px">
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('general')}
                  className={`px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    settingsSubTab === 'general'
                      ? 'border-yellow-400 text-yellow-500 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  ⚙️ General Config
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('security')}
                  className={`px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    settingsSubTab === 'security'
                      ? 'border-yellow-400 text-yellow-500 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  🔐 Security Settings
                </button>
              </div>

              {settingsSubTab === 'general' ? (
                <form onSubmit={updateSettingsSubmit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 space-y-6">
                  <h3 className="font-display font-black italic text-sm text-yellow-500 dark:text-yellow-400 uppercase tracking-widest">Ribbons & Notification Banners</h3>
                  <div className="grid grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-900">
                    {/* Offer ribbon toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="offerToggle"
                          checked={settings.offer_banner_active}
                          onChange={(e) => setSettings({ ...settings, offer_banner_active: e.target.checked })}
                          className="rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-yellow-500 dark:text-yellow-400 focus:ring-0"
                        />
                        <label htmlFor="offerToggle" className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">Offer Banner Active</label>
                      </div>
                      <input
                        type="text"
                        placeholder="Offer Announcement text"
                        value={settings.offer_banner_text}
                        onChange={(e) => setSettings({ ...settings, offer_banner_text: e.target.value })}
                        className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs focus:outline-none text-zinc-900 dark:text-white"
                      />
                    </div>

                    {/* Announcement toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="announceToggle"
                          checked={settings.announcement_active}
                          onChange={(e) => setSettings({ ...settings, announcement_active: e.target.checked })}
                          className="rounded bg-white dark:bg-zinc-950 border border-zinc-850 text-yellow-500 dark:text-yellow-400 focus:ring-0"
                        />
                        <label htmlFor="announceToggle" className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">Holiday Alert Active</label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Announcement details"
                        value={settings.announcement_text}
                        onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                        className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 text-xs focus:outline-none text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <h3 className="font-display font-black italic text-sm text-yellow-500 dark:text-yellow-400 uppercase tracking-widest pt-4">General Homepage Content</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">Hero Title Header</label>
                      <input
                        type="text"
                        value={settings.hero_title}
                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">Hero Subtitle</label>
                      <input
                        type="text"
                        value={settings.hero_subtitle}
                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">About Text</label>
                      <textarea
                        rows={4}
                        value={settings.about_text}
                        onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">Contact Address</label>
                      <input
                        type="text"
                        value={settings.contact_address}
                        onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">Contact Phone</label>
                        <input
                          type="text"
                          value={settings.contact_phone}
                          onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">Business Operating Hours</label>
                        <input
                          type="text"
                          value={settings.business_hours}
                          onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">Google Maps Embed Link</label>
                      <textarea
                        rows={2}
                        value={settings.google_maps_link}
                        onChange={(e) => setSettings({ ...settings, google_maps_link: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-yellow-400 text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-yellow-300 font-mono cursor-pointer"
                  >
                    Save Settings Configuration
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Admin Password Update Card */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4 transition-colors duration-300">
                    <h3 className="font-display font-black italic text-sm text-yellow-500 dark:text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                      🔐 Admin Security Credentials
                    </h3>
                    
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Current Password</label>
                          <input
                            type={showSecPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">New Password</label>
                          <input
                            type={showSecPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Confirm Password</label>
                          <input
                            type={showSecPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {newPassword && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-zinc-400">Password Strength:</span>
                          <span className={`text-[10px] font-mono font-bold uppercase ${
                            getPasswordStrength(newPassword) === 'Weak' 
                              ? 'text-red-500' 
                              : getPasswordStrength(newPassword) === 'Medium' 
                                ? 'text-yellow-500' 
                                : 'text-green-500'
                          }`}>
                            {getPasswordStrength(newPassword)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSecPassword(!showSecPassword)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                          >
                            {showSecPassword ? '🙈 Hide' : '👁️ Show'} Passwords
                          </button>
                          <button
                            type="button"
                            onClick={handleGenerateStrongPassword}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400 hover:border-yellow-400 cursor-pointer"
                          >
                            🔑 Generate Password
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={updatingSecPassword}
                          className="px-4 py-2 rounded-lg bg-yellow-400 text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50 cursor-pointer animate-none"
                        >
                          {updatingSecPassword ? 'Updating...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Username Management Card */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4 transition-colors duration-300">
                    <h3 className="font-display font-black italic text-sm text-yellow-500 dark:text-yellow-400 uppercase tracking-widest">
                      👤 Username Management
                    </h3>

                    <form onSubmit={handleUpdateUsername} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Current Username</label>
                          <input
                            type="text"
                            value={secCurrentUsername}
                            disabled
                            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400 cursor-not-allowed font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">New Username</label>
                          <input
                            type="text"
                            value={secNewUsername}
                            onChange={(e) => setSecNewUsername(e.target.value)}
                            placeholder="Min 4 characters"
                            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={updatingSecUsername}
                          className="px-4 py-2 rounded-lg bg-yellow-400 text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50 cursor-pointer"
                        >
                          {updatingSecUsername ? 'Updating...' : 'Update Username'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security Center Meta & Recovery */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4 transition-colors duration-300">
                    <h3 className="font-display font-black italic text-sm text-red-500 dark:text-red-400 uppercase tracking-widest">
                      🛡️ Security Center & Recovery
                    </h3>

                    <div className="text-[11px] font-mono text-zinc-500 space-y-1.5 bg-zinc-50 dark:bg-zinc-900/20 p-4 border border-zinc-100 dark:border-zinc-900 rounded-lg">
                      <div className="flex justify-between">
                        <span>Current Admin Profile:</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{secCurrentUsername}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Password Update:</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{lastPasswordChangeDate || 'Never / Seeding'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleForceLogoutAll}
                        className="px-4 py-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-950/60 text-[9px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer"
                      >
                        ⚠️ Force Logout All Sessions
                      </button>

                      <button
                        type="button"
                        onClick={handleResetAdminCredentials}
                        className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[9px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer"
                      >
                        🔄 Reset Admin Credentials
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI MONITORING TAB */}
          {activeTab === 'ai' && (() => {
            const totalQueries = aiMetrics.length;
            const groqQueries = aiMetrics.filter(m => m.provider === 'groq');
            const geminiQueries = aiMetrics.filter(m => m.provider === 'gemini');
            const fallbackQueries = aiMetrics.filter(m => m.provider === 'fallback');

            const groqSuccessCount = groqQueries.filter(m => m.success).length;
            const groqFailCount = groqQueries.filter(m => !m.success).length;
            const geminiSuccessCount = geminiQueries.filter(m => m.success).length;
            const geminiFailCount = geminiQueries.filter(m => !m.success).length;

            const totalErrors = groqFailCount + geminiFailCount;

            const avgGroqLatency = groqSuccessCount > 0 
              ? Math.round(groqQueries.filter(m => m.success).reduce((sum, m) => sum + m.response_time_ms, 0) / groqSuccessCount)
              : 0;

            const avgGeminiLatency = geminiSuccessCount > 0 
              ? Math.round(geminiQueries.filter(m => m.success).reduce((sum, m) => sum + m.response_time_ms, 0) / geminiSuccessCount)
              : 0;

            const groqPct = totalQueries > 0 ? Math.round((groqQueries.length / totalQueries) * 100) : 0;
            const geminiPct = totalQueries > 0 ? Math.round((geminiQueries.length / totalQueries) * 100) : 0;
            const fallbackPct = totalQueries > 0 ? Math.round((fallbackQueries.length / totalQueries) * 100) : 0;

            const groqStatusObj = aiStatus.find(s => s.provider === 'groq');
            const geminiStatusObj = aiStatus.find(s => s.provider === 'gemini');

            const groqOnline = groqStatusObj ? groqStatusObj.healthy : false;
            const geminiOnline = geminiStatusObj ? geminiStatusObj.healthy : false;
            const fallbackActive = !groqOnline && !geminiOnline;

            return (
              <div className="space-y-6">
                {/* Header section with live check button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-900 rounded-xl transition-colors duration-300">
                  <div>
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Coach Zeus AI Engine Diagnostics
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Live telemetry, auto-failover metrics, and provider latency analytics.
                    </p>
                  </div>
                  <button
                    onClick={handleRunHealthCheck}
                    disabled={runningHealthCheck}
                    className="flex items-center gap-1.5 rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50 transition-all font-mono cursor-pointer"
                  >
                    {runningHealthCheck ? 'Running Pings...' : '⚡ Run Live Health Check'}
                  </button>
                </div>

                {/* Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Groq Card */}
                  <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-900 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Groq (Primary)</span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        groqOnline 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/30' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${groqOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {groqOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black font-display text-zinc-800 dark:text-zinc-100 italic">
                        {avgGroqLatency > 0 ? `${avgGroqLatency}ms` : 'N/A'}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                        Avg Response Latency (24h)
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Queries: {groqQueries.length}</span>
                      <span>Errors: {groqFailCount}</span>
                    </div>
                  </div>

                  {/* Gemini Card */}
                  <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-900 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Gemini (Failover)</span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        geminiOnline 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/30' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${geminiOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {geminiOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black font-display text-zinc-800 dark:text-zinc-100 italic">
                        {avgGeminiLatency > 0 ? `${avgGeminiLatency}ms` : 'N/A'}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                        Avg Response Latency (24h)
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Queries: {geminiQueries.length}</span>
                      <span>Errors: {geminiFailCount}</span>
                    </div>
                  </div>

                  {/* System Status Card */}
                  <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-900 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Local Fallback</span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        fallbackActive 
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/30 animate-pulse' 
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                      }`}>
                        {fallbackActive ? 'ACTIVE FALLBACK' : 'STANDBY'}
                      </span>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black font-display text-zinc-800 dark:text-zinc-100 italic">
                        {fallbackQueries.length}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                        Total Fallback Activations (24h)
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Total Requests: {totalQueries}</span>
                      <span>Total Errors: {totalErrors}</span>
                    </div>
                  </div>
                </div>

                {/* AI Coach Status Section */}
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                    AI Coach Status Overview
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Active Members Card */}
                    <div className="bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-100 dark:border-zinc-900/50 p-4 rounded-lg flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-500">
                        <Users size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active Members</span>
                        <span className="text-xl font-bold font-display text-zinc-800 dark:text-zinc-100">{coachStatus?.activeMembers ?? 0}</span>
                      </div>
                    </div>

                    {/* Total AI Chats Card */}
                    <div className="bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-100 dark:border-zinc-900/50 p-4 rounded-lg flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total AI Chats</span>
                        <span className="text-xl font-bold font-display text-zinc-800 dark:text-zinc-100">{coachStatus?.totalChats ?? 0}</span>
                      </div>
                    </div>

                    {/* Average Response Time Card */}
                    <div className="bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-100 dark:border-zinc-900/50 p-4 rounded-lg flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Clock size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Avg Response Time</span>
                        <span className="text-xl font-bold font-display text-zinc-800 dark:text-zinc-100">{coachStatus?.avgResponseTime ?? 0} ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Usage Share Donut */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-4">
                      Provider Usage Breakdown
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                      <div className="relative h-44 w-44 flex items-center justify-center">
                        {totalQueries === 0 ? (
                          <div className="text-center text-zinc-500 font-mono text-[10px]">
                            No telemetry data
                          </div>
                        ) : (
                          <svg width="160" height="160" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="8" />
                            {groqPct > 0 && (
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EAB308" strokeWidth="8" 
                                strokeDasharray={`${(groqPct / 100) * 251.3} 251.3`}
                                strokeDashoffset={0}
                                transform="rotate(-90 50 50)"
                              />
                            )}
                            {geminiPct > 0 && (
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="8" 
                                strokeDasharray={`${(geminiPct / 100) * 251.3} 251.3`}
                                strokeDashoffset={-((groqPct / 100) * 251.3)}
                                transform="rotate(-90 50 50)"
                              />
                            )}
                            {fallbackPct > 0 && (
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="8" 
                                strokeDasharray={`${(fallbackPct / 100) * 251.3} 251.3`}
                                strokeDashoffset={-(((groqPct + geminiPct) / 100) * 251.3)}
                                transform="rotate(-90 50 50)"
                              />
                            )}
                            <text x="50" y="54" textAnchor="middle" fill="currentColor" className="text-[9px] font-mono font-bold fill-zinc-800 dark:fill-zinc-200">
                              {totalQueries} Req
                            </text>
                          </svg>
                        )}
                      </div>
                      <div className="space-y-3 font-mono text-xs w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-yellow-500 inline-block" />
                          <span className="text-zinc-600 dark:text-zinc-400">Groq P1:</span>
                          <span className="font-bold">{groqPct}%</span>
                          <span className="text-[10px] text-zinc-500">({groqQueries.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-blue-500 inline-block" />
                          <span className="text-zinc-600 dark:text-zinc-400">Gemini P2:</span>
                          <span className="font-bold">{geminiPct}%</span>
                          <span className="text-[10px] text-zinc-500">({geminiQueries.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-red-500 inline-block" />
                          <span className="text-zinc-600 dark:text-zinc-400">Fallback:</span>
                          <span className="font-bold">{fallbackPct}%</span>
                          <span className="text-[10px] text-zinc-500">({fallbackQueries.length})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Latency Line Chart */}
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 flex flex-col justify-between">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-4">
                      Response Latency Trend (Last 15 Calls)
                    </h4>
                    <div className="w-full flex-1 flex items-center justify-center min-h-[160px]">
                      {(() => {
                        const successfulMetrics = aiMetrics.filter(m => m.success && m.provider !== 'fallback');
                        const recentMetrics = [...successfulMetrics].reverse().slice(-15);
                        
                        if (recentMetrics.length === 0) {
                          return (
                            <div className="text-zinc-500 font-mono text-[10px]">
                              No successful API requests logged.
                            </div>
                          );
                        }

                        const maxLatency = Math.max(...recentMetrics.map(m => m.response_time_ms), 1000);
                        const points = recentMetrics.map((m, index) => {
                          const x = (index / (recentMetrics.length - 1 || 1)) * 340 + 50;
                          const y = 120 - (m.response_time_ms / maxLatency) * 90;
                          return { x, y, m };
                        });

                        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        const areaD = points.length > 0 
                          ? `${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z` 
                          : '';

                        return (
                          <svg viewBox="0 0 440 140" className="w-full h-full">
                            <defs>
                              <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EAB308" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            <line x1="50" y1="30" x2="410" y2="30" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="50" y1="75" x2="410" y2="75" stroke="#f4f4f5" className="dark:stroke-zinc-900" strokeDasharray="3 3" />
                            <line x1="50" y1="120" x2="410" y2="120" stroke="#e4e4e7" className="dark:stroke-zinc-800" />

                            {/* Area Gradient */}
                            {areaD && <path d={areaD} fill="url(#latencyGrad)" />}

                            {/* Line */}
                            {pathD && <path d={pathD} fill="none" stroke="#EAB308" strokeWidth="2" />}

                            {/* Dots */}
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle 
                                  cx={p.x} 
                                  cy={p.y} 
                                  r="3.5" 
                                  className="fill-yellow-400 stroke-white dark:stroke-zinc-950 stroke-2 cursor-pointer hover:r-5 transition-all"
                                />
                              </g>
                            ))}

                            {/* Labels */}
                            <text x="10" y="34" className="fill-zinc-500 text-[8px] font-mono">{maxLatency.toFixed(0)}ms</text>
                            <text x="10" y="79" className="fill-zinc-500 text-[8px] font-mono">{(maxLatency / 2).toFixed(0)}ms</text>
                            <text x="10" y="124" className="fill-zinc-500 text-[8px] font-mono">0ms</text>
                          </svg>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Recent Queries Table */}
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-4">
                    Recent Telemetry Logs (Last 10 Queries)
                  </h4>
                  <div className="overflow-x-auto text-[10px] font-mono">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-900 text-zinc-400 pb-2 uppercase tracking-wider">
                          <th className="pb-2">Timestamp</th>
                          <th className="pb-2">Provider</th>
                          <th className="pb-2 text-right">Response Time</th>
                          <th className="pb-2 text-center">Status</th>
                          <th className="pb-2 pl-4">Details / Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                        {aiMetrics.slice(0, 10).map((m, index) => {
                          const dateStr = new Date(m.created_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          });

                          return (
                            <tr key={m.id || index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                              <td className="py-2.5">{dateStr}</td>
                              <td className="py-2.5 uppercase font-bold">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                                  m.provider === 'groq' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400' 
                                    : m.provider === 'gemini' 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                                }`}>
                                  {m.provider}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-bold">{m.response_time_ms} ms</td>
                              <td className="py-2.5 text-center">
                                {m.success ? (
                                  <span className="text-green-500 font-bold">SUCCESS</span>
                                ) : (
                                  <span className="text-red-500 font-bold">FAILED</span>
                                )}
                              </td>
                              <td className="py-2.5 pl-4 max-w-xs truncate text-zinc-500 dark:text-zinc-500" title={m.error_message}>
                                {m.error_message || 'None'}
                              </td>
                            </tr>
                          );
                        })}
                        {aiMetrics.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-zinc-500">
                              No telemetry logs found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIRTUAL TOUR MANAGEMENT TAB */}
          {activeTab === 'virtualtour' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-black italic uppercase text-zinc-900 dark:text-white">360° Virtual Tour</h2>
                  <p className="text-zinc-500 text-xs font-mono mt-1">Manage the gym walkthrough video displayed on the homepage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Video URL Field */}
                <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <h3 className="text-sm font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Video Source</h3>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Cloudinary Video URL</label>
                    <input
                      type="text"
                      value={vtVideoUrl}
                      onChange={(e) => setVtVideoUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/xxx/video/upload/ran-tour.mp4"
                      className="w-full rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-yellow-400/50 font-mono"
                    />
                    <p className="text-[9px] text-zinc-400 font-mono">Enter a direct Cloudinary video URL (e.g. mp4, webm)</p>
                  </div>

                  <CloudinaryUpload
                    label="Tour Thumbnail Image"
                    value={vtThumbnailUrl}
                    onChange={(url) => setVtThumbnailUrl(url)}
                    folder="virtual-tour"
                    aspect="landscape"
                  />

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={async () => {
                        if (vtVideoUrl && (!vtVideoUrl.startsWith('https://res.cloudinary.com/') || !vtVideoUrl.includes('/video/upload/'))) {
                          showToastMessage('Invalid Cloudinary Video URL! Must start with https://res.cloudinary.com/ and contain /video/upload/', 'error');
                          return;
                        }
                        setVtSaving(true);
                        try {
                          await db.saveVirtualTour({ video_url: vtVideoUrl, thumbnail_url: vtThumbnailUrl });
                          showToastMessage('Virtual Tour saved successfully!');
                          loadAllData();
                        } catch (err) {
                          showToastMessage('Failed to save Virtual Tour', 'error');
                        }
                        setVtSaving(false);
                      }}
                      disabled={vtSaving}
                      className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded text-[10px] font-mono font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
                    >
                      {vtSaving ? 'Saving...' : 'Save & Publish'}
                    </button>
                    {vtVideoUrl && (
                      <button
                        onClick={() => setVtPreviewOpen(true)}
                        className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                      >
                        Preview
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <h3 className="text-sm font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Live Preview</h3>
                  {vtVideoUrl ? (
                    <div className="space-y-3">
                      <div className="aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800">
                        <video
                          src={vtVideoUrl}
                          poster={vtThumbnailUrl || undefined}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[9px] font-mono">
                        <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 uppercase">Status</span>
                          <p className="text-green-400 font-bold mt-0.5">● Published</p>
                        </div>
                        <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 uppercase">Last Updated</span>
                          <p className="text-zinc-300 font-bold mt-0.5">
                            {virtualTourData?.updated_at ? new Date(virtualTourData.updated_at).toLocaleDateString('en-IN') : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center gap-2">
                      <Video size={32} className="text-zinc-400" />
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">No video uploaded yet</p>
                      <p className="text-[9px] text-zinc-500">Paste a Cloudinary video URL to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* -----------------------------------------------------------------------
          EDITING TRAINER MODAL
          ----------------------------------------------------------------------- */}
      {editingTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingTrainer(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={saveTrainerSubmit} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              {editingTrainer.id ? 'Edit Coach Profile' : 'Add New Coach'}
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Trainer Name</label>
                  <input
                    type="text"
                    required
                    value={editingTrainer.name || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, name: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Designation</label>
                  <input
                    type="text"
                    required
                    value={editingTrainer.designation || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, designation: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Experience Span</label>
                  <input
                    type="text"
                    value={editingTrainer.experience || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, experience: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Specialization</label>
                  <input
                    type="text"
                    value={editingTrainer.specialization || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, specialization: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Achievement Badges editing */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Achievement Badges (Comma-Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Trainer, CrossFit Coach, Nutrition Expert"
                  value={Array.isArray(editingTrainer.badges) ? editingTrainer.badges.join(', ') : (editingTrainer.badges || '')}
                  onChange={(e) => setEditingTrainer({ ...editingTrainer, badges: e.target.value as any })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Trainer Quote</label>
                <textarea
                  rows={2}
                  value={editingTrainer.quote || ''}
                  onChange={(e) => setEditingTrainer({ ...editingTrainer, quote: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <CloudinaryUpload
                label="Trainer Photo"
                value={editingTrainer.image_url || ''}
                onChange={(url) => setEditingTrainer({ ...editingTrainer, image_url: url })}
                folder="trainers"
                aspect="portrait"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTrainer(null)}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono"
              >
                Save Coach
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          EDITING EVENT MODAL
          ----------------------------------------------------------------------- */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingEvent(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={saveEventSubmit} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              {editingEvent.id ? 'Edit Event' : 'Create New Event'}
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Event Name</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.name || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Date / Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. July 15, 2026"
                    value={editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Tag / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. CrossFit Competition"
                    value={editingEvent.tag || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, tag: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <CloudinaryUpload
                  label="Event Banner Image"
                  value={editingEvent.image_url || ''}
                  onChange={(url) => setEditingEvent({ ...editingEvent, image_url: url })}
                  folder="events"
                  aspect="landscape"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Event Details</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          EDITING EQUIPMENT MODAL
          ----------------------------------------------------------------------- */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingEquipment(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={saveEquipmentSubmit} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              {editingEquipment.id ? 'Edit Equipment details' : 'Add Equipment Station'}
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Gear Name</label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.name || ''}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Category</label>
                  <select
                    value={editingEquipment.category || 'Strength'}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, category: e.target.value as any })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="Strength" className="text-zinc-900">Strength</option>
                    <option value="Cardio" className="text-zinc-900">Cardio</option>
                    <option value="Functional" className="text-zinc-900">Functional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Brand</label>
                  <input
                    type="text"
                    value={editingEquipment.brand || ''}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, brand: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Specifications</label>
                  <input
                    type="text"
                    value={editingEquipment.spec_details || ''}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, spec_details: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Description</label>
                <textarea
                  rows={2}
                  value={editingEquipment.description || ''}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, description: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingEquipment(null)}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Save Gear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          EDITING PLAN MODAL
          ----------------------------------------------------------------------- */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingPlan(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={savePlanSubmit} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              {editingPlan.id ? 'Modify Membership Tier' : 'Create New Membership'}
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Price Rate (INR)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.price || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Billing Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly, Annually"
                    value={editingPlan.duration || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="pt-6 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popularCheck"
                    checked={!!editingPlan.popular_badge}
                    onChange={(e) => setEditingPlan({ ...editingPlan, popular_badge: e.target.checked })}
                    className="rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-yellow-500 dark:text-yellow-450"
                  />
                  <label htmlFor="popularCheck" className="text-[10px] text-zinc-600 dark:text-zinc-400 uppercase font-mono tracking-wider font-bold">Popular Badge</label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Benefits (Comma-Separated)</label>
                <textarea
                  rows={3}
                  value={Array.isArray(editingPlan.benefits) ? editingPlan.benefits.join(', ') : (editingPlan.benefits || '')}
                  onChange={(e) => setEditingPlan({ ...editingPlan, benefits: e.target.value as any })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          EDITING TRANSFORMATION MODAL
          ----------------------------------------------------------------------- */}
      {editingTransformation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingTransformation(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={saveTransformationSubmit} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              {editingTransformation.id ? 'Modify story card' : 'Add Transformation Story'}
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Member Name</label>
                <input
                  type="text"
                  required
                  value={editingTransformation.member_name || ''}
                  onChange={(e) => setEditingTransformation({ ...editingTransformation, member_name: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CloudinaryUpload
                  label="Before Photo"
                  value={editingTransformation.before_image || ''}
                  onChange={(url) => setEditingTransformation({ ...editingTransformation, before_image: url })}
                  folder="transformations/before"
                  aspect="portrait"
                />
                <CloudinaryUpload
                  label="After Photo"
                  value={editingTransformation.after_image || ''}
                  onChange={(url) => setEditingTransformation({ ...editingTransformation, after_image: url })}
                  folder="transformations/after"
                  aspect="portrait"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Weight Lost</label>
                  <input
                    type="text"
                    value={editingTransformation.weight_lost || ''}
                    onChange={(e) => setEditingTransformation({ ...editingTransformation, weight_lost: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Muscle Gain Status</label>
                  <input
                    type="text"
                    value={editingTransformation.muscle_gained || ''}
                    onChange={(e) => setEditingTransformation({ ...editingTransformation, muscle_gained: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Transformation Story</label>
                <textarea
                  rows={2}
                  value={editingTransformation.story || ''}
                  onChange={(e) => setEditingTransformation({ ...editingTransformation, story: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTransformation(null)}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Save Story
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          EDITING MEMBER MODAL
          ----------------------------------------------------------------------- */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingMember(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={handleSaveMember} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              {editingMember.id ? 'Modify Member Profile' : 'Register Gym Member'}
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Email Address</label>
                <input
                  type="email"
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Membership Tier</label>
                  <select
                    value={editingMember.plan_id || plans.find(p => p.name === editingMember.membership_type || p.duration === editingMember.membership_type)?.id || 'p1'}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const selectedPlan = plans.find(p => p.id === pId);
                      if (selectedPlan) {
                        const start = editingMember.start_date || new Date().toISOString().split('T')[0];
                        let days = 30;
                        const dur = selectedPlan.duration.toLowerCase();
                        if (dur.includes('monthly')) days = 30;
                        else if (dur.includes('quarterly')) days = 90;
                        else if (dur.includes('half-yearly')) days = 180;
                        else if (dur.includes('yearly') || dur.includes('annual')) days = 365;
                        const end = new Date(new Date(start).getTime() + days * 86400000).toISOString().split('T')[0];
                        setEditingMember({
                          ...editingMember,
                          plan_id: pId,
                          membership_type: selectedPlan.duration as any,
                          end_date: end
                        });
                      }
                    }}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono uppercase"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Status</label>
                  <select
                    value={editingMember.status || 'Active'}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editingMember.start_date || ''}
                    onChange={(e) => {
                      const start = e.target.value;
                      const pId = editingMember.plan_id || plans.find(p => p.name === editingMember.membership_type || p.duration === editingMember.membership_type)?.id || 'p1';
                      const selectedPlan = plans.find(p => p.id === pId);
                      let days = 30;
                      if (selectedPlan) {
                        const dur = selectedPlan.duration.toLowerCase();
                        if (dur.includes('monthly')) days = 30;
                        else if (dur.includes('quarterly')) days = 90;
                        else if (dur.includes('half-yearly')) days = 180;
                        else if (dur.includes('yearly') || dur.includes('annual')) days = 365;
                      }
                      const end = new Date(new Date(start).getTime() + days * 86400000).toISOString().split('T')[0];
                      setEditingMember({ ...editingMember, start_date: start, end_date: end });
                    }}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">End Date</label>
                  <input
                    type="date"
                    required
                    value={editingMember.end_date || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, end_date: e.target.value })}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Administrative Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in full"
                  value={editingMember.notes || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Save Member Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          LOG MEMBER PROGRESS MODAL
          ----------------------------------------------------------------------- */}
      {isAddProgressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsAddProgressOpen(false); setProgressMemberId(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={handleSaveProgress} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              Log Progress Metrics ({progressMemberId})
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={pWeight}
                  onChange={(e) => setPWeight(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={pBodyFat}
                  onChange={(e) => setPBodyFat(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Chest (in)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={pChest}
                  onChange={(e) => setPChest(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Waist (in)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={pWaist}
                  onChange={(e) => setPWaist(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Arms (in)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={pArms}
                  onChange={(e) => setPArms(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Height (cm)</label>
                <input
                  type="number"
                  required
                  value={pHeightCm}
                  onChange={(e) => setPHeightCm(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">BMI (computed or custom)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pBmi}
                  onChange={(e) => setPBmi(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400 font-bold font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Morning check"
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsAddProgressOpen(false); setProgressMemberId(null); }}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Save Metrics
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          EDITING WORKOUT DAY ROUTINE
          ----------------------------------------------------------------------- */}
      {workoutScheduleEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setWorkoutScheduleEditing(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={handleSaveWorkoutDay} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              Edit Routine: {workoutScheduleEditing.day}
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Routine Title Target</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chest + Triceps"
                  value={workoutScheduleEditing.title || ''}
                  onChange={(e) => setWorkoutScheduleEditing({ ...workoutScheduleEditing, title: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Routine Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the workouts..."
                  value={workoutScheduleEditing.description || ''}
                  onChange={(e) => setWorkoutScheduleEditing({ ...workoutScheduleEditing, description: e.target.value })}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWorkoutScheduleEditing(null)}
                className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Update Day
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MEMBER CREATED SUCCESSFULLY MODAL
          ----------------------------------------------------------------------- */}
      {successModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setSuccessModalData(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-green-500/30 dark:border-green-500/20 shadow-2xl transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-6">
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/40 border border-green-200 dark:border-green-800/30 flex items-center justify-center text-green-500">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-display font-black italic text-lg uppercase tracking-wider text-green-500">
                Member Created Successfully
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                The gym member credentials have been registered in the database.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 rounded-lg p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Name</span>
                <span className="font-bold text-zinc-900 dark:text-white">{successModalData.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Phone</span>
                <span className="font-bold text-zinc-900 dark:text-white">{successModalData.phone}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Member ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-yellow-500">{successModalData.member_id}</span>
                  <button
                    onClick={() => handleCopyId(successModalData.member_id)}
                    className="text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors p-1"
                    title="Copy Member ID"
                  >
                    {copiedId ? (
                      <span className="text-[9px] font-bold text-green-500">Copied!</span>
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Plan</span>
                <span className="font-bold text-zinc-900 dark:text-white uppercase">{successModalData.membership_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Expiry</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">
                  {new Date(successModalData.end_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopyId(successModalData.member_id)}
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:border-yellow-400 rounded text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-widest font-mono font-bold transition-all"
              >
                {copiedId ? 'Copied!' : 'Copy Member ID'}
              </button>
              <button
                type="button"
                onClick={() => setSuccessModalData(null)}
                className="px-5 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded text-xs font-bold uppercase tracking-widest font-mono font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diet Plan Editor Modal */}
      {isDietModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDietModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={handleSaveDietPlan} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              Diet Plan for {dietModalMemberName}
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 border border-zinc-100 dark:border-zinc-900 rounded-lg">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Calories Target (kcal)</label>
                  <input
                    type="number"
                    value={dietCaloriesTarget}
                    onChange={(e) => setDietCaloriesTarget(e.target.value)}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                    placeholder="2000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Protein Target (g)</label>
                  <input
                    type="number"
                    value={dietProteinTarget}
                    onChange={(e) => setDietProteinTarget(e.target.value)}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                    placeholder="150"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Meal Schedule</label>
                  <input
                    type="text"
                    value={dietMealSchedule}
                    onChange={(e) => setDietMealSchedule(e.target.value)}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    placeholder="e.g. 3 meals + 1 shake"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Compliance Target (%)</label>
                  <input
                    type="number"
                    value={dietCompliancePct}
                    onChange={(e) => setDietCompliancePct(e.target.value)}
                    className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Breakfast</label>
                <textarea
                  value={dietBreakfast}
                  onChange={(e) => setDietBreakfast(e.target.value)}
                  className="w-full h-16 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  placeholder="e.g. Oats, egg whites, almonds"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Lunch</label>
                <textarea
                  value={dietLunch}
                  onChange={(e) => setDietLunch(e.target.value)}
                  className="w-full h-16 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  placeholder="e.g. Chicken breast, brown rice, broccoli"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Dinner</label>
                <textarea
                  value={dietDinner}
                  onChange={(e) => setDietDinner(e.target.value)}
                  className="w-full h-16 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  placeholder="e.g. Fish or Paneer, mixed salad"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Snacks</label>
                <textarea
                  value={dietSnacks}
                  onChange={(e) => setDietSnacks(e.target.value)}
                  className="w-full h-16 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  placeholder="e.g. Fruit, protein bar, green tea"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Supplements</label>
                <textarea
                  value={dietSupplements}
                  onChange={(e) => setDietSupplements(e.target.value)}
                  className="w-full h-16 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  placeholder="e.g. Whey protein, Creatine, Multivitamins"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsDietModalOpen(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded uppercase tracking-widest font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDiet}
                className="px-4 py-2 bg-yellow-400 text-black rounded uppercase tracking-widest font-bold hover:bg-yellow-300 disabled:opacity-50 transition-all"
              >
                {savingDiet ? 'Saving...' : 'Save Diet Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trainer Note Editor Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsNoteModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={handleSaveTrainerNote} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              Add Trainer Note for {noteModalMemberName}
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Note Description</label>
                <textarea
                  value={newTrainerNote}
                  onChange={(e) => setNewTrainerNote(e.target.value)}
                  className="w-full h-32 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  placeholder="e.g. Focus on squat form and posture. Squat depth has improved."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded uppercase tracking-widest font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingNote}
                className="px-4 py-2 bg-yellow-400 text-black rounded uppercase tracking-widest font-bold hover:bg-yellow-300 disabled:opacity-50 transition-all"
              >
                {savingNote ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workout Plan Editor Modal */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsWorkoutModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <form onSubmit={handleSaveWorkoutPlan} className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-colors duration-300 rounded-xl p-6 text-zinc-900 dark:text-white space-y-4">
            <h3 className="font-display font-black italic text-lg uppercase text-yellow-500 dark:text-yellow-400">
              Workout Plan for {workoutModalMemberName}
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Today's Workout (Focus Name)</label>
                <input
                  type="text"
                  value={workoutTodayWorkout}
                  onChange={(e) => setWorkoutTodayWorkout(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  placeholder="e.g. Chest + Triceps Hypertrophy"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Sets & Reps Schema</label>
                <input
                  type="text"
                  value={workoutSetsReps}
                  onChange={(e) => setWorkoutSetsReps(e.target.value)}
                  className="w-full rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  placeholder="e.g. 4 sets of 8-12 reps"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Exercise List (Comma separated)</label>
                <textarea
                  value={workoutExercises}
                  onChange={(e) => setWorkoutExercises(e.target.value)}
                  className="w-full h-24 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  placeholder="e.g. Flat Barbell Bench Press, Incline Dumbbell Press, Cable Chest Flys, Overhead Tricep Extension"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsWorkoutModalOpen(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded uppercase tracking-widest font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingWorkout}
                className="px-4 py-2 bg-yellow-400 text-black rounded uppercase tracking-widest font-bold hover:bg-yellow-300 disabled:opacity-50 transition-all"
              >
                {savingWorkout ? 'Saving...' : 'Save Workout Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-6 right-6 z-[100] max-w-md animate-in slide-in-from-top-2 ${
          toastType === 'success' 
            ? 'bg-green-950/90 border-green-500/30 text-green-400' 
            : 'bg-red-950/90 border-red-500/30 text-red-400'
        } border backdrop-blur-xl rounded-xl px-5 py-4 shadow-2xl`}>
          <div className="flex items-start gap-3">
            <span className="text-lg">{toastType === 'success' ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className="text-xs font-mono font-bold">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setShowToast(false)} 
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
