// ============================================
// Waveform Background Visual Element — Rhythmic Glowing Equalizer
// ============================================

export default function WaveformBg({ className = '' }: { className?: string }) {
  // Height variation for a natural soundwave rhythm
  const bars = [
    22, 38, 52, 30, 68, 85, 48, 92, 60, 40,
    78, 95, 65, 45, 88, 72, 35, 82, 54, 30,
    22,
  ];

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-1.5 py-2 pointer-events-none ${className}`}
    >
      {bars.map((height, i) => (
        <span
          key={i}
          className="w-1 sm:w-1.5 bg-gradient-to-t from-orange via-amber-400 to-yellow-200 rounded-full animate-wave origin-center shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-300"
          style={{
            height: `${height * 0.55}px`,
            animationDelay: `${(i * 0.12) % 1.6}s`,
            animationDuration: `${1.2 + (i % 4) * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
