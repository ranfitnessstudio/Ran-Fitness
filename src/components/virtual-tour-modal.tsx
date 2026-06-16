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
  const [isPortrait, setIsPortrait] = useState(false);
  const [rotate90, setRotate90] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setIsPortrait(false);
    setRotate90(false);
    setVideoFailed(false);
    setLoadingVideo(true);
  }, [videoUrl]);

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
    if (!videoRef.current || videoFailed) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing, videoFailed]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(p) ? 0 : p);
    setCurrentTime(formatTime(videoRef.current.currentTime));
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(formatTime(videoRef.current.duration));
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      if (videoWidth > 0 && videoHeight > 0) {
        const portrait = videoHeight > videoWidth;
        setIsPortrait(portrait);
        if (portrait && typeof window !== 'undefined' && window.innerWidth > window.innerHeight) {
          setRotate90(true);
        }
      }
      setLoadingVideo(false);
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current || videoFailed) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = Math.max(0, Math.min(pos, 1)) * videoRef.current.duration;
  }, [videoFailed]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
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
        className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex flex-col select-none"
        onMouseMove={handleMouseMove}
      >
        {/* Vertical Mobile Tour Badge */}
        {isPortrait && (
          <div className="absolute top-6 left-6 z-50 bg-yellow-400 text-black text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            {rotate90 ? 'Rotated Portrait Tour' : 'Vertical Mobile Tour'}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <X size={20} />
        </button>

        {/* Video Frame */}
        <div 
          className={`flex-1 flex items-center justify-center relative overflow-hidden ${isPortrait && !rotate90 ? 'py-16' : ''}`} 
          onClick={togglePlay}
        >
          {/* Loading Skeleton */}
          {loadingVideo && !videoFailed && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/80 gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-yellow-400/20 border-t-yellow-400 animate-spin" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Buffering video tour...</span>
            </div>
          )}

          {/* Error / Failed state */}
          {videoFailed && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-2xl">
                ⚠️
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold uppercase text-zinc-200">Video Failed to Load</h4>
                <p className="text-zinc-500 text-xs max-w-sm">The video tour could not be loaded or the URL is invalid. Please verify connection and retry.</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoFailed(false);
                  setLoadingVideo(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
              >
                Retry Loading
              </button>
            </div>
          )}

          {isPortrait && (
            /* Premium dark blurred background generated from the video frame */
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-35">
              <video
                src={videoUrl}
                muted
                loop
                playsInline
                className="w-full h-full object-cover blur-[80px] scale-110"
                ref={(el) => {
                  if (el && !videoFailed) {
                    if (playing) el.play().catch(() => {});
                    else el.pause();
                    if (Math.abs(el.currentTime - (videoRef.current?.currentTime || 0)) > 0.5) {
                      el.currentTime = videoRef.current?.currentTime || 0;
                    }
                  }
                }}
              />
            </div>
          )}

          {isPortrait && !rotate90 ? (
            /* Premium Phone frame style container for Portrait Video */
            <div className="relative z-10 max-h-full h-full aspect-[9/16] rounded-[40px] border-[10px] border-zinc-800 bg-black shadow-2xl shadow-black/80 overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-32 bg-zinc-800 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-zinc-900 rounded-full" />
              </div>
              <video
                ref={videoRef}
                src={videoUrl}
                muted={muted}
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadStart={() => { setLoadingVideo(true); setVideoFailed(false); }}
                onCanPlay={() => setLoadingVideo(false)}
                onWaiting={() => setLoadingVideo(true)}
                onPlaying={() => setLoadingVideo(false)}
                onError={() => { setVideoFailed(true); setLoadingVideo(false); }}
                onEnded={() => setPlaying(false)}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            /* Standard Cinematic Widescreen player */
            <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                muted={muted}
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadStart={() => { setLoadingVideo(true); setVideoFailed(false); }}
                onCanPlay={() => setLoadingVideo(false)}
                onWaiting={() => setLoadingVideo(true)}
                onPlaying={() => setLoadingVideo(false)}
                onError={() => { setVideoFailed(true); setLoadingVideo(false); }}
                onEnded={() => setPlaying(false)}
                style={{
                  transform: rotate90 ? 'rotate(90deg)' : 'none',
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  height: rotate90 ? '100vw' : '100%',
                  width: rotate90 ? '100vh' : '100%'
                }}
                className="z-10 transition-transform duration-300"
              />
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-6 pt-20 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Seek bar */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="w-full h-1.5 bg-zinc-700/60 rounded-full cursor-pointer group mb-4 relative"
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
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <span className="text-[10px] font-mono text-zinc-400">
                {currentTime} / {duration}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {isPortrait && (
                <button
                  onClick={(e) => { e.stopPropagation(); setRotate90(!rotate90); }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all border border-zinc-700 cursor-pointer"
                  title="Rotate Video 90 Degrees"
                >
                  🔄 Rotate
                </button>
              )}
              {onBookTrial && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); onBookTrial(); }}
                  className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-full transition-all shadow-lg shadow-yellow-400/20 cursor-pointer"
                >
                  Book Free Trial
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
