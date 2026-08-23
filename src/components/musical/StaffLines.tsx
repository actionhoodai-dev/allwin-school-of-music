// ============================================
// StaffLines Decorative Component
// ============================================

export default function StaffLines({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full h-12 flex flex-col justify-between py-1 opacity-15 pointer-events-none ${className}`}
    >
      <div className="h-[1px] bg-gradient-to-r from-transparent via-violet to-transparent" />
      <div className="h-[1px] bg-gradient-to-r from-transparent via-violet to-transparent" />
      <div className="h-[1px] bg-gradient-to-r from-transparent via-violet to-transparent" />
      <div className="h-[1px] bg-gradient-to-r from-transparent via-violet to-transparent" />
      <div className="h-[1px] bg-gradient-to-r from-transparent via-violet to-transparent" />
    </div>
  );
}
