/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { public_id } = body;

    if (!public_id) {
      return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({
      success: result.result === 'ok',
      result: result.result,
    });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}
