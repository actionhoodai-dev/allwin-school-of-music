// ============================================
// Musical Notes Floating Decoration
// ============================================

'use client';

export default function MusicalNotes({ count = 8, className = '' }: { count?: number; className?: string }) {
  // SVG paths for musical notes: Treble clef, quarter note, eighth note, beam notes, sharp
  const notes = ['♪', '♫', '♩', '♬', '♭', '♮', '𝄞'];

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const note = notes[i % notes.length];
        const left = `${(i * 100) / count + (i % 3) * 4}%`;
        const size = 16 + (i % 4) * 8;
        const duration = 10 + (i % 5) * 3;
        const delay = (i * 1.5) % 6;

        return (
          <span
            key={i}
            className="absolute text-violet/20 select-none animate-float"
            style={{
              left,
              top: `${15 + (i * 11) % 70}%`,
              fontSize: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              transform: `rotate(${(i * 25) % 360}deg)`,
            }}
          >
            {note}
          </span>
        );
      })}
    </div>
  );
}
