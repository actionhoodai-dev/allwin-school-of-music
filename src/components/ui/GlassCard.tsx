// ============================================
// GlassCard Component
// ============================================

import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'light' | 'dark';
  hover?: boolean;
  className?: string;
  padding?: string;
}

export default function GlassCard({
  children,
  variant = 'light',
  hover = false,
  className = '',
  padding = 'p-6',
}: GlassCardProps) {
  const base = variant === 'light' ? 'glass-card' : 'glass-card-dark';
  const hoverClass = hover ? 'glass-card-hover' : '';

  return (
    <div className={`${base} ${hoverClass} rounded-2xl ${padding} ${className}`}>
      {children}
    </div>
  );
}
