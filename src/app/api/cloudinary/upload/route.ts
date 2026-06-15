/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';

// Max file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'ran-fitness';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    // Validate type and size
    if (isVideo) {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid video type: ${file.type}. Allowed: MP4, WebM, MOV, OGG` },
          { status: 400 }
        );
      }
      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: `Video too large. Maximum size: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }
    } else if (isImage) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid image type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, AVIF` },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid file type. Only image or video files are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary via stream
    const result = await new Promise<any>((resolve, reject) => {
      const uploadOptions: any = {
        folder: `ran-fitness/${folder}`,
        resource_type: isVideo ? 'video' : 'image',
      };

      if (!isVideo) {
        uploadOptions.transformation = [
          { quality: 'auto:best', fetch_format: 'auto' },
        ];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
