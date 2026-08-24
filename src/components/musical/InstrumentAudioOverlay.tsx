// ============================================
// InstrumentAudioOverlay — Click-on-Image Audio Preview
// Click image to play, click again to pause
// For Bharatham: shows a video overlay instead
// ============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, Play, Video } from 'lucide-react';
import { instrumentAudio } from '@/lib/audio/instrumentSynth';

interface InstrumentAudioOverlayProps {
  slug: string;
  name: string;
  /** When true, image area acts as the audio toggle */
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps an instrument card's image area to make the entire image
 * a click-to-play / click-to-pause audio toggle.
 * For Bharatham (dance), it shows a video modal instead.
 */
export default function InstrumentAudioOverlay({
  slug,
  name,
  children,
  className = '',
}: InstrumentAudioOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDance = slug.toLowerCase() === 'bharatham';

  useEffect(() => {
    return () => {
      if (isPlaying) instrumentAudio.stopAll();
    };
  }, [isPlaying]);

  // Listen for other instruments starting — auto-pause this one
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
    // Don't intercept clicks on links/buttons inside the overlay
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
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={
          isDance
            ? `Watch ${name} dance performance`
            : isPlaying
              ? `Pause ${name} audio preview`
              : `Play ${name} audio preview — click to listen`
        }
        className={`relative cursor-pointer select-none ${className}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e as any); } }}
      >
        {children}

        {/* Audio Playing Overlay */}
        {isPlaying && !isDance && (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-purple-deep/60 via-violet/20 to-transparent pointer-events-none flex items-center justify-center transition-opacity duration-500">
            {/* Animated Equalizer + Pause hint */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-end gap-1.5 h-10">
                <span className="w-1.5 bg-orange rounded-full animate-[eqBar_0.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
                <span className="w-1.5 bg-amber-300 rounded-full animate-[eqBar_0.6s_ease-in-out_0.15s_infinite]" style={{ height: '80%' }} />
                <span className="w-1.5 bg-white rounded-full animate-[eqBar_0.6s_ease-in-out_0.3s_infinite]" style={{ height: '60%' }} />
                <span className="w-1.5 bg-orange rounded-full animate-[eqBar_0.6s_ease-in-out_0.1s_infinite]" style={{ height: '100%' }} />
                <span className="w-1.5 bg-amber-400 rounded-full animate-[eqBar_0.6s_ease-in-out_0.25s_infinite]" style={{ height: '50%' }} />
              </div>
              <span className="text-white text-xs font-bold tracking-wider uppercase drop-shadow-lg flex items-center gap-1.5">
                <Pause className="w-3 h-3" /> Tap to Pause
              </span>
            </div>
          </div>
        )}

        {/* Idle Play Indicator (non-dance only) */}
        {!isPlaying && !isDance && (
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-navy/30 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl">
                <Play className="w-6 h-6 text-violet fill-violet ml-0.5" />
              </div>
              <span className="text-white text-xs font-bold tracking-wider uppercase drop-shadow-lg flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" /> Tap to Listen
              </span>
            </div>
          </div>
        )}

        {/* Dance Video Indicator (Bharatham only) */}
        {isDance && (
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-navy/30 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl">
                <Video className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-white text-xs font-bold tracking-wider uppercase drop-shadow-lg flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> Watch Performance
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bharatham Video Modal */}
      {showVideo && isDance && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseVideo}
        >
          <div
            className="relative max-w-3xl w-full bg-navy rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseVideo}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close video"
            >
              ✕
            </button>

            <div className="p-6 text-center space-y-4">
              <h3 className="font-heading text-xl font-bold text-white">
                {name} — Bharatanatyam Performance
              </h3>

              {/* Embedded YouTube / placeholder  */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                  title={`${name} Bharatanatyam Performance`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              <p className="text-white/60 text-xs">
                Classical Bharatanatyam dance performance showcasing the art taught at Allwin School of Music.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
