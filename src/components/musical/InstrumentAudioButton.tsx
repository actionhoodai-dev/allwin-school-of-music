// ============================================
// InstrumentAudioButton Component — Interactive Audio Preview
// Plays authentic instrument synthesis with live equalizer animation
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';
import { instrumentAudio } from '@/lib/audio/instrumentSynth';

interface InstrumentAudioButtonProps {
  slug: string;
  name: string;
  variant?: 'pill' | 'card' | 'badge';
  className?: string;
}

export default function InstrumentAudioButton({
  slug,
  name,
  variant = 'pill',
  className = '',
}: InstrumentAudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up when unmounting
      if (isPlaying) {
        instrumentAudio.stopAll();
      }
    };
  }, [isPlaying]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  if (variant === 'badge') {
    return (
      <button
        onClick={handleToggle}
        type="button"
        aria-label={isPlaying ? `Stop ${name} sample` : `Listen to ${name} sample`}
        title={isPlaying ? `Stop ${name} sound preview` : `Play ${name} sound preview`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 cursor-pointer ${
          isPlaying
            ? 'bg-gradient-to-r from-orange to-amber-400 text-navy shadow-lg shadow-orange/30 scale-105 ring-2 ring-white/50'
            : 'bg-white/90 text-navy hover:bg-white hover:scale-105 shadow-md hover:shadow-lg'
        } ${className}`}
      >
        {isPlaying ? (
          <>
            {/* Animated mini equalizer */}
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-full bg-navy rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-0.5 h-full bg-navy rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-0.5 h-full bg-navy rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-[11px] font-bold">Playing...</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-orange shrink-0" />
            <span className="text-[11px]">Listen Sound</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      type="button"
      aria-label={isPlaying ? `Stop ${name} sound preview` : `Listen to ${name} sound preview`}
      className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden border ${
        isPlaying
          ? 'bg-gradient-to-r from-purple-deep via-violet to-orange text-white border-white/30 shadow-xl ring-2 ring-orange/50 scale-[1.02]'
          : 'bg-surface-dim hover:bg-white text-navy hover:text-violet border-slate-200 hover:border-violet/30 shadow-sm hover:shadow-md'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          {/* Animated EQ Bars */}
          <div className="flex items-end gap-1 h-3.5">
            <span className="w-1 bg-amber-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite]" style={{ height: '70%' }} />
            <span className="w-1 bg-amber-400 rounded-full animate-[wave_0.8s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
            <span className="w-1 bg-orange rounded-full animate-[wave_0.8s_ease-in-out_0.4s_infinite]" style={{ height: '85%' }} />
            <span className="w-1 bg-yellow-200 rounded-full animate-[wave_0.8s_ease-in-out_0.1s_infinite]" style={{ height: '60%' }} />
          </div>
          <span className="tracking-wide">Playing {name}</span>
          <Square className="w-3 h-3 fill-white text-white shrink-0 ml-1" />
        </>
      ) : (
        <>
          <div className="p-1 rounded-full bg-violet/10 text-violet">
            <Play className="w-3 h-3 fill-violet" />
          </div>
          <span>Listen to {name}</span>
        </>
      )}
    </button>
  );
}
