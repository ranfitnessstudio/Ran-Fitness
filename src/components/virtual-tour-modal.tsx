/* eslint-disable */
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  onBookTrial?: () => void;
}

export function VirtualTourModal({ isOpen, onClose, videoUrl, onBookTrial }: VirtualTourModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  }, [playing]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(!muted);
  }, [muted]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(p) ? 0 : p);
    setCurrentTime(formatTime(videoRef.current.currentTime));
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) setDuration(formatTime(videoRef.current.duration));
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />

      {/* Modal content */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex flex-col"
        onMouseMove={handleMouseMove}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <X size={20} />
        </button>

        {/* Video */}
        <div className="flex-1 flex items-center justify-center" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={videoUrl}
            muted={muted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setPlaying(false)}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Controls bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-16 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Seek bar */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="w-full h-1.5 bg-zinc-700/60 rounded-full cursor-pointer group mb-3 relative"
          >
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <span className="text-[10px] font-mono text-zinc-400">
                {currentTime} / {duration}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {onBookTrial && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); onBookTrial(); }}
                  className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-full transition-all shadow-lg shadow-yellow-400/20"
                >
                  Book Free Trial
                </button>
              )}
              <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
