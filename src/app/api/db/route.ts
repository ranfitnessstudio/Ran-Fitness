/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';

// Actions that can be accessed by anonymous website visitors or validated members
const PUBLIC_ACTIONS = new Set([
  'getSettings',
  'getSocialLinks',
  'getTrainers',
  'getEquipment',
  'getPlans',
  'getTransformations',
  'getEvents',
  'getVirtualTour',
  'saveLead',
  'saveCareer',
  'logVisit',
  'getVisitsCount',
  'getAnnouncements',
  'getMemberMemory',
  'saveMemberMemory',
  'getProgressPhotos',
  'saveProgressPhotos',
  'checkInMember',
  'getMemberAttendance',
  'getMemberProgress',
  'saveMemberProgress',
  'getBodyMetrics',
  'saveBodyMetrics',
  'getDietPlan',
  'getWorkoutPlan',
  'getTrainerNotes',
  'getMemberGoal',
  'saveMemberGoal',
  'getMemberAiChats',
  'getWorkoutSessionState',
  'saveWorkoutSessionState',
  'deleteProgressPhoto',
  'createPasswordResetToken',
  'getPasswordResetToken',
  'incrementResetTokenAttempts',
  'markResetTokenUsed',
  'deleteExpiredResetTokens',
  'savePasswordResetAudit',
  'getPasswordResetAudits',
  'updateMemberPassword',
  'createOtpEntry',
  'getOtpEntry',
  'incrementOtpAttempts',
  'incrementOtpResends',
  'markOtpUsed',
  'cleanExpiredOtps',
  'getMemberByEmail',
  'createMemberWithOtp'
]);

export async function POST(request: Request) {
  try {
    const { action, args = [] } = await request.json();

    const dbMethod = (db as any)[action];
    if (typeof dbMethod !== 'function') {
      return NextResponse.json({ error: `Invalid database action: ${action}` }, { status: 400 });
    }

    // Auth check for non-public actions
    if (!PUBLIC_ACTIONS.has(action)) {
      const cookieStore = await cookies();
      const adminSession = cookieStore.get('ran_admin_session');
      let isValid = false;

      if (adminSession?.value) {
        const username = await verifyToken(adminSession.value);
        if (username) {
          isValid = true;
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized CMS operation' },
          { status: 401 }
        );
      }
    }

    // Strict Member Data Isolation check
    const MEMBER_SPECIFIC_ACTIONS = new Set([
      'getMemberAiChats',
      'getMemberMemory',
      'saveMemberMemory',
      'getProgressPhotos',
      'saveProgressPhotos',
      'checkInMember',
      'getMemberAttendance',
      'getMemberProgress',
      'saveMemberProgress',
      'getBodyMetrics',
      'saveBodyMetrics',
      'getDietPlan',
      'getWorkoutPlan',
      'getTrainerNotes',
      'getMemberGoal',
      'saveMemberGoal',
      'getWorkoutSessionState',
      'saveWorkoutSessionState',
      'deleteProgressPhoto'
    ]);

    if (MEMBER_SPECIFIC_ACTIONS.has(action)) {
      const cookieStore = await cookies();
      const adminSession = cookieStore.get('ran_admin_session');
      let isAdmin = false;
      if (adminSession?.value) {
        const username = await verifyToken(adminSession.value);
        if (username) {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        const memberSession = cookieStore.get('ran_member_session');
        if (!memberSession || !memberSession.value) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: No active session' },
            { status: 401 }
          );
        }

        const sessionParts = memberSession.value.split('.');
        const loggedInMemberId = sessionParts[0];

        const member = await db.getMemberById(loggedInMemberId);
        if (!member) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Invalid member session' },
            { status: 401 }
          );
        }

        const { verifyMemberSessionCookie } = require('@/lib/auth-token');
        const isSessionValid = await verifyMemberSessionCookie(memberSession.value, member.password_hash);
        if (!isSessionValid) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Session signature mismatch' },
            { status: 401 }
          );
        }

        let requestMemberId: string | null = null;
        if (args && args.length > 0) {
          if (action === 'deleteProgressPhoto') {
            requestMemberId = args[1];
          } else if (typeof args[0] === 'string') {
            requestMemberId = args[0];
          } else if (typeof args[0] === 'object' && args[0] !== null) {
            requestMemberId = args[0].member_id || args[0].memberId;
          }
        }

        if (!requestMemberId || requestMemberId !== loggedInMemberId) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: Member isolation breach attempt blocked' },
            { status: 403 }
          );
        }
      }
    }

    const result = await dbMethod.apply(db, args);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error(`Database API Proxy failure [${request.method}]:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Database Server Error' },
      { status: 500 }
    );
  }
}
