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
  const [rotationIndex, setRotationIndex] = useState(0);
  const rotationValues = [0, -90, 0, 90] as const;
  const rotation = rotationValues[rotationIndex];
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
    setRotationIndex(0);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal content */}
      <div
        ref={containerRef}
        className="relative w-full h-full md:w-[95vw] md:h-[90vh] md:mx-auto md:my-auto flex flex-col justify-between select-none z-10 p-3 md:p-6"
        onMouseMove={handleMouseMove}
      >
        {/* Header bar: Top Left Title, Top Right Close */}
        <div className={`flex justify-between items-center z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="text-yellow-400 font-display font-black italic tracking-widest text-xs md:text-sm uppercase">
            RAN FITNESS VIRTUAL TOUR
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Area: Centered, fits screen */}
        <div 
          className="flex-1 flex items-center justify-center relative overflow-hidden my-4" 
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
                <p className="text-zinc-500 text-xs max-w-sm">The video tour could not be loaded. Please verify connection and retry.</p>
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

          {/* Blurred Background Video */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-25">
            <video
              src={videoUrl}
              muted
              loop
              playsInline
              className="w-full h-full object-cover blur-[80px] scale-110"
              style={{
                transform: rotation !== 0 ? `rotate(${rotation}deg)` : 'none'
              }}
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

          {/* Main Video Element */}
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
              transform: rotation !== 0 ? `rotate(${rotation}deg)` : 'none',
              objectFit: isPortrait ? 'contain' : 'cover',
              maxWidth: '100%',
              maxHeight: '100%',
              width: '100%',
              height: '100%'
            }}
            className="z-10 transition-transform duration-300 rounded-lg shadow-2xl"
          />
        </div>

        {/* Controls Bar: Bottom Left (Play/Pause, Volume, Timer), Bottom Right (Book Trial, Rotate) */}
        <div className={`space-y-4 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Seek bar */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="w-full h-1 bg-zinc-700/60 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Bottom Left controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <span className="text-[10px] font-mono text-zinc-400">
                {currentTime} / {duration}
              </span>
            </div>

            {/* Bottom Right controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setRotationIndex(prev => (prev + 1) % 4); }}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded transition-all border border-zinc-700 cursor-pointer flex items-center gap-1"
                title="Rotate Video"
              >
                🔄 Rotate {rotation !== 0 ? `(${rotation}°)` : ''}
              </button>
              {onBookTrial && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); onBookTrial(); }}
                  className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded transition-all shadow-lg hover:shadow-yellow-400/20 cursor-pointer"
                >
                  Book Free Trial
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
