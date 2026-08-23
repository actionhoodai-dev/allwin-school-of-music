// ============================================
// PianoKeys Decorative Strip
// ============================================

export default function PianoKeys({ className = '' }: { className?: string }) {
  // Pattern of black keys: [C, D, E, F, G, A, B] -> black keys between [C-D, D-E, F-G, G-A, A-B]
  const pattern = [
    { hasBlack: true },  // C
    { hasBlack: true },  // D
    { hasBlack: false }, // E
    { hasBlack: true },  // F
    { hasBlack: true },  // G
    { hasBlack: true },  // A
    { hasBlack: false }, // B
  ];

  return (
    <div
      aria-hidden="true"
      className={`relative flex h-14 overflow-hidden rounded-xl border border-white/20 shadow-inner bg-white/90 select-none ${className}`}
    >
      {Array.from({ length: 3 }).flatMap((_, octave) =>
        pattern.map((key, keyIndex) => (
          <div
            key={`${octave}-${keyIndex}`}
            className="relative flex-1 bg-white border-r border-slate-300 last:border-r-0 hover:bg-slate-50 transition-colors"
          >
            {key.hasBlack && (
              <span
                className="absolute top-0 -right-2 w-4 h-8 bg-slate-900 rounded-b-sm z-10 shadow-md pointer-events-none"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
