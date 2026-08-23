// ============================================
// EmptyState Component
// ============================================

import { Music } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-purple/10 flex items-center justify-center mb-6">
        {icon || <Music className="w-10 h-10 text-violet" />}
      </div>
      <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary max-w-md mb-6">
        {description}
      </p>
      {action && action}
    </div>
  );
}
