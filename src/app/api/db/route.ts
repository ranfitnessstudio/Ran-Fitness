/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';

// Actions that can be accessed by anonymous website visitors
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
  'getMemberByPhone' // Needed for member dashboard login/lookup
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
