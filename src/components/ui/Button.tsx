// ============================================
// Button Component
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
    'btn-gradient text-white font-semibold shadow-lg hover:shadow-xl',
  secondary:
    'bg-white text-navy border border-border hover:bg-surface-dim hover:border-purple-light/30 shadow-sm hover:shadow-md',
  outline:
    'bg-transparent text-violet border-2 border-violet hover:bg-violet hover:text-white',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-dim hover:text-text-primary',
  whatsapp:
    'bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] shadow-lg hover:shadow-xl',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-6 py-3 text-base rounded-xl gap-2',
  lg: 'px-8 py-4 text-lg rounded-xl gap-2.5',
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
