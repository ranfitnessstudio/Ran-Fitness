/* eslint-disable */
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, RefreshCw, CheckCircle, AlertTriangle, Image as ImageIcon, Video } from 'lucide-react';

interface CloudinaryUploadProps {
  /** Current file URL (from DB or freshly uploaded) */
  value: string;
  /** Called when a new file is uploaded or deleted */
  onChange: (url: string) => void;
  /** Cloudinary folder to upload into (e.g. "trainers", "transformations") */
  folder?: string;
  /** Label text shown above the upload zone */
  label: string;
  /** Aspect ratio hint for the preview container */
  aspect?: 'square' | 'portrait' | 'landscape';
  /** Optional className for the outer wrapper */
  className?: string;
  /** Type of file to accept: image (default) or video */
  fileType?: 'image' | 'video';
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function CloudinaryUpload({
  value,
  onChange,
  folder = 'general',
  label,
  aspect = 'portrait',
  className = '',
  fileType = 'image',
}: CloudinaryUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isVideoMode = fileType === 'video';

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video',
  };

  const handleUpload = useCallback(async (file: File) => {
    // Validate client-side
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
    const allowedTypes = isVideoMode ? allowedVideoTypes : allowedImageTypes;

    if (!allowedTypes.includes(file.type)) {
      setErrorMsg(isVideoMode ? 'Invalid video type. Use MP4, WebM, MOV, or OGG.' : 'Invalid file type. Use JPEG, PNG, WebP, GIF, or AVIF.');
      setUploadState('error');
      return;
    }

    const maxSize = isVideoMode ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(isVideoMode ? 'Video too large. Maximum 100MB.' : 'File too large. Maximum 10MB.');
      setUploadState('error');
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploadState('uploading');
    setProgress(0);
    setErrorMsg('');

    // Simulate progress for UX (actual upload is a single request)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setProgress(100);
      setUploadState('success');
      onChange(data.secure_url);
      
      // Clean up local preview
      URL.revokeObjectURL(localPreview);
      setPreviewUrl('');

      // Reset success state after a moment
      setTimeout(() => setUploadState('idle'), 2000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrorMsg(err.message || 'Upload failed');
      setUploadState('error');
      URL.revokeObjectURL(localPreview);
      setPreviewUrl('');
    }
  }, [folder, onChange, isVideoMode]);

  const handleDelete = useCallback(async () => {
    if (!value) return;
    
    // Extract public_id from Cloudinary URL
    const match = value.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    const publicId = match ? match[1] : null;

    if (publicId) {
      try {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId }),
        });
      } catch {
        // Even if delete fails, clear the URL from the form
      }
    }

    onChange('');
    setPreviewUrl('');
    setUploadState('idle');
    setProgress(0);
  }, [value, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  }, [handleUpload]);

  const displayUrl = previewUrl || value;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">
        {label}
      </label>

      {/* If there's a file to show */}
      {displayUrl ? (
        <div className="relative group">
          <div className={`relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 ${aspectClasses[aspect]}`}>
            {isVideoMode ? (
              <video
                src={displayUrl}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img
                src={displayUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
            )}

            {/* Upload progress overlay */}
            {uploadState === 'uploading' && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <RefreshCw size={20} className="text-yellow-400 animate-spin" />
                <div className="w-3/4 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-300 font-mono">{Math.round(progress)}%</span>
              </div>
            )}

            {/* Success flash */}
            {uploadState === 'success' && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[2px] transition-opacity">
                <CheckCircle size={28} className="text-green-400" />
              </div>
            )}
          </div>

          {/* Action buttons overlay (visible on hover or mobile always visible) */}
          <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 max-md:opacity-100 z-10">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 rounded-md bg-zinc-900/80 hover:bg-zinc-900 text-white backdrop-blur-sm transition-colors cursor-pointer"
              title="Replace file"
            >
              <RefreshCw size={12} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-md bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-sm transition-colors cursor-pointer"
              title="Remove file"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* Empty upload zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer
            transition-all duration-200 py-6 px-4
            ${dragActive
              ? 'border-yellow-400 bg-yellow-400/10 scale-[1.01]'
              : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 hover:border-yellow-400/50 hover:bg-yellow-400/5'
            }
          `}
        >
          <div className={`p-2.5 rounded-full transition-colors ${dragActive ? 'bg-yellow-400/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
            {isVideoMode ? (
              <Video size={18} className={dragActive ? 'text-yellow-400' : 'text-zinc-500'} />
            ) : (
              <Upload size={18} className={dragActive ? 'text-yellow-400' : 'text-zinc-500'} />
            )}
          </div>
          <div className="text-center">
            <p className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              {dragActive ? 'Drop to upload' : 'Drag & drop or click'}
            </p>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-600 mt-0.5">
              {isVideoMode ? 'MP4, WebM, MOV • Max 100MB' : 'JPEG, PNG, WebP • Max 10MB'}
            </p>
          </div>

          {/* Upload progress inside empty zone */}
          {uploadState === 'uploading' && (
            <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex flex-col items-center justify-center gap-2 rounded-lg backdrop-blur-sm">
              <RefreshCw size={18} className="text-yellow-400 animate-spin" />
              <div className="w-3/5 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {uploadState === 'error' && errorMsg && (
        <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 rounded px-2 py-1">
          <AlertTriangle size={10} />
          <span className="text-[9px] font-mono">{errorMsg}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={isVideoMode ? "video/mp4,video/webm,video/quicktime,video/ogg" : "image/jpeg,image/png,image/webp,image/gif,image/avif"}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
