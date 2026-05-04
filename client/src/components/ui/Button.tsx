import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-black hover:brightness-110 active:translate-y-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]',
      secondary: 'bg-secondary text-black hover:brightness-110 active:translate-y-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]',
      outline: 'bg-transparent border border-current hover:bg-white/10 active:translate-y-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]',
      ghost: 'bg-transparent hover:bg-white/5',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:translate-y-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[10px]',
      md: 'px-6 py-3 text-xs',
      lg: 'px-8 py-4 text-sm'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-black dark:border-white/20 cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading && <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
