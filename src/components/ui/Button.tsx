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
    'bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold shadow-md shadow-blue-600/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.96] active:shadow-xs',
  secondary:
    'bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md shadow-slate-950/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.96] active:shadow-xs',
  outline:
    'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.96]',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-blue-600 font-bold active:scale-[0.96]',
  whatsapp:
    'bg-[#25D366] text-white font-bold hover:bg-[#20BD5A] shadow-md shadow-emerald-600/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.96] active:shadow-xs',
  danger:
    'bg-[#e11d48] text-white font-bold hover:bg-[#be123c] shadow-md shadow-rose-600/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.96] active:shadow-xs',
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
