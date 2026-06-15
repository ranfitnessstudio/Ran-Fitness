import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/database';
import { MemberDashboardClient } from './member-dashboard-client';

export default async function MemberDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('ran_member_session');
  
  if (!session || !session.value) {
    redirect('/');
  }

  const memberId = session.value;
  
  // Fetch member from database
  const member = await db.getMemberById(memberId);
  if (!member) {
    // Session exists but member deleted/invalid, logout to clean session
    redirect('/api/auth/logout');
  }

  if (member.status === 'Suspended') {
    // If suspended, clear session and log out
    redirect('/api/auth/logout');
  }

  // Load member progress, attendance, workout schedule, announcements, settings, goals, diet, trainer notes, progress photos, achievements
  const [
    initialProgress,
    initialAttendance,
    workoutSchedule,
    announcements,
    settings,
    goal,
    dietPlan,
    trainerNotes,
    progressPhotos,
    achievements
  ] = await Promise.all([
    db.getMemberProgress(member.member_id),
    db.getMemberAttendance(member.member_id),
    db.getWorkoutSchedule(),
    db.getAnnouncements(),
    db.getSettings(),
    db.getMemberGoal(member.member_id).catch(() => null),
    db.getDietPlan(member.member_id).catch(() => null),
    db.getTrainerNotes(member.member_id).catch(() => []),
    db.getProgressPhotos(member.member_id).catch(() => []),
    db.getAchievements(member.member_id).catch(() => [])
  ]);

  return (
    <MemberDashboardClient
      member={member}
      initialProgress={initialProgress}
      initialAttendance={initialAttendance}
      workoutSchedule={workoutSchedule}
      announcements={announcements}
      settings={settings}
      initialGoal={goal}
      initialDietPlan={dietPlan}
      initialTrainerNotes={trainerNotes}
      initialProgressPhotos={progressPhotos}
      initialAchievements={achievements}
    />
  );
}
