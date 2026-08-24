// ============================================
// Button Component — High-Contrast Light & Dark Theme Compatible
// ============================================

import Link from 'next/link';
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: never;
    external?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
    external?: boolean;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'btn-gradient text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
  secondary:
    'bg-white text-navy border border-slate-200 hover:bg-violet/10 hover:text-violet hover:border-violet/40 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20 shadow-sm hover:shadow-md font-semibold',
  outline:
    'bg-transparent text-violet border-2 border-violet hover:bg-violet hover:text-white dark:text-violet-300 dark:border-violet-400 dark:hover:bg-violet-600 dark:hover:text-white font-semibold',
  ghost:
    'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-violet dark:hover:text-white font-medium',
  whatsapp:
    'bg-[#25D366] text-white font-bold hover:bg-[#20BD5A] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
  danger:
    'bg-red-600 text-white font-bold hover:bg-red-700 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-1.5',
  md: 'px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl gap-2',
  lg: 'px-7 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg rounded-2xl gap-2.5',
};

export default function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    iconRight,
    fullWidth = false,
    ...rest
  } = props;

  const classes = [
    'inline-flex items-center justify-center font-medium transition-all duration-300 cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  if ('href' in props && props.href) {
    const { href, external, ...linkAttrs } = rest as {
      href?: string;
      external?: boolean;
      [key: string]: any;
    };

    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...linkAttrs}
        >
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes} {...linkAttrs}>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </Link>
    );
  }

  const buttonAttrs = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonAttrs}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
