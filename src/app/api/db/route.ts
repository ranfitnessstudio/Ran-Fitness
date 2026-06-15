/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { action, args = [] } = await request.json();

    const dbMethod = (db as any)[action];
    if (typeof dbMethod !== 'function') {
      return NextResponse.json({ error: `Invalid database action: ${action}` }, { status: 400 });
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
