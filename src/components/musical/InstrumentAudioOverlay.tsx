// ============================================
// InstrumentAudioOverlay — Click-on-Image Famous Masterpiece Player
// Click image to play iconic famous piece, click again to pause.
// For Bharatham: Classical Dance performance video modal.
// ============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, Play, Video, Sparkles } from 'lucide-react';
import { instrumentAudio } from '@/lib/audio/instrumentSynth';

const FAMOUS_PIECES: Record<string, string> = {
  keyboard: 'Für Elise — Beethoven',
  piano: 'Für Elise — Beethoven',
  guitar: 'Romance de Amor — Spanish Romance',
  violin: 'Spring (La Primavera) — Vivaldi',
  vocal: 'Vatapi Ganapatim — Hamsadhwani',
  theory: 'Ode to Joy — Beethoven',
  'theory-of-music': 'Ode to Joy — Beethoven',
};

interface InstrumentAudioOverlayProps {
  slug: string;
  name: string;
  children: React.ReactNode;
  className?: string;
}

export default function InstrumentAudioOverlay({
  slug,
  name,
  children,
  className = '',
}: InstrumentAudioOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const isDance = slug.toLowerCase() === 'bharatham';
  const pieceName = FAMOUS_PIECES[slug.toLowerCase()] || name;

  useEffect(() => {
    return () => {
      if (isPlaying) instrumentAudio.stopAll();
    };
  }, [isPlaying]);

  // Auto-pause if another instrument is started
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (instrumentAudio.getActiveSlug() !== slug) {
        setIsPlaying(false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying, slug]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) return;

    e.preventDefault();
    e.stopPropagation();

    if (isDance) {
      setShowVideo(true);
      return;
    }

    if (isPlaying) {
      instrumentAudio.stopAll();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      instrumentAudio.play(slug, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  return (
    <>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={
          isDance
            ? `Watch ${name} classical dance performance`
            : isPlaying
              ? `Pause ${pieceName}`
              : `Play ${pieceName} — click image to listen`
        }
        className={`relative cursor-pointer select-none group ${className}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
      >
        {children}

        {/* Audio Playing Overlay (Active state with live Equalizer) */}
        {isPlaying && !isDance && (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-purple-deep/85 via-navy/50 to-transparent pointer-events-none flex items-center justify-center transition-opacity duration-300">
            <div className="flex flex-col items-center gap-2.5 text-center px-4">
              {/* Animated Equalizer Wave */}
              <div className="flex items-end gap-1.5 h-10">
                <span className="w-1.5 bg-orange rounded-full animate-[eqBar_0.5s_ease-in-out_infinite]" style={{ height: '40%' }} />
                <span className="w-1.5 bg-amber-300 rounded-full animate-[eqBar_0.5s_ease-in-out_0.15s_infinite]" style={{ height: '85%' }} />
                <span className="w-1.5 bg-white rounded-full animate-[eqBar_0.5s_ease-in-out_0.3s_infinite]" style={{ height: '65%' }} />
                <span className="w-1.5 bg-orange rounded-full animate-[eqBar_0.5s_ease-in-out_0.1s_infinite]" style={{ height: '100%' }} />
                <span className="w-1.5 bg-amber-400 rounded-full animate-[eqBar_0.5s_ease-in-out_0.25s_infinite]" style={{ height: '50%' }} />
              </div>

              {/* Masterpiece Title */}
              <div className="space-y-0.5">
                <p className="text-amber-300 text-xs font-extrabold tracking-wide drop-shadow-md">
                  🎵 {pieceName}
                </p>
                <span className="text-white/90 text-[11px] font-semibold tracking-wider uppercase drop-shadow flex items-center justify-center gap-1">
                  <Pause className="w-3 h-3" /> Tap to Pause
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Idle Hover Indicator for Audio Instruments */}
        {!isPlaying && !isDance && (
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-navy/40 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <div className="w-13 h-13 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 text-violet fill-violet ml-0.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-white text-xs font-bold tracking-wide drop-shadow-md">
                  Hear {pieceName.split('—')[0]}
                </p>
                <span className="text-orange-warm text-[10px] font-semibold uppercase tracking-wider">
                  Tap to Listen
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Idle Hover Indicator for Bharatham Dance (Video Only) */}
        {isDance && (
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-navy/40 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <div className="w-13 h-13 rounded-full bg-amber-500 text-white backdrop-blur-md flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6 ml-0.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-white text-xs font-bold tracking-wide drop-shadow-md">
                  Classical Dance Showcase
                </p>
                <span className="text-amber-300 text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> Tap to Watch Video
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bharatham Dance Performance Video Modal */}
      {showVideo && isDance && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleCloseVideo}
        >
          <div
            className="relative max-w-3xl w-full bg-navy border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-navy-light">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    Bharatham / Bharatanatyam
                  </h3>
                  <p className="text-xs text-orange">
                    Associated with Annamalai University Classical Dance Syllabus
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseVideo}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                aria-label="Close dance video modal"
              >
                ✕
              </button>
            </div>

            {/* Video Container */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/JWhA3ldZcyY?autoplay=1&rel=0"
                  title="Bharatanatyam Classical Dance Performance"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70 bg-white/5 p-3.5 rounded-xl border border-white/10">
                <p>
                  Structured Bharatanatyam training in Adavus, Talam, Mudras, and Margam performance in Salem.
                </p>
                <a
                  href="/contact?course=Bharatham"
                  className="shrink-0 px-3.5 py-1.5 rounded-lg bg-orange hover:bg-orange-warm text-navy font-bold text-xs transition-colors"
                >
                  Enquire for Bharatham
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
