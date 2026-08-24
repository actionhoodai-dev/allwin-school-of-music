// ============================================
// PianoKeys Decorative Strip — Authentic White & Black Keys
// Protected against dark mode overrides
// ============================================

export default function PianoKeys({ className = '' }: { className?: string }) {
  // Pattern of keys: [C, D, E, F, G, A, B] with black keys between [C-D, D-E, F-G, G-A, A-B]
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
      className={`relative flex h-14 overflow-hidden rounded-xl border border-white/20 shadow-xl bg-slate-900/40 backdrop-blur-sm select-none p-0.5 ${className}`}
    >
      {Array.from({ length: 3 }).flatMap((_, octave) =>
        pattern.map((key, keyIndex) => (
          <div
            key={`${octave}-${keyIndex}`}
            style={{ backgroundColor: '#ffffff' }}
            className="piano-white-key relative flex-1 h-full bg-white border-r border-slate-300 last:border-r-0 hover:bg-slate-100 transition-colors rounded-b-[2px] shadow-sm"
          >
            {key.hasBlack && (
              <span
                style={{ backgroundColor: '#0f172a' }}
                className="piano-black-key absolute top-0 -right-2 w-4 h-8 bg-slate-900 rounded-b-sm z-10 shadow-md pointer-events-none border-x border-b border-black/40"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
