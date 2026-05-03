import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  padded?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  className, 
  variant = 'default', 
  padded = true, 
  children, 
  ...props 
}) => {
  const variants = {
    default: 'bg-panel-bg border border-border-strong shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.05)]',
    primary: 'bg-primary/5 border border-primary shadow-[2px_2px_0_0_rgba(0,255,0,0.1)]',
    secondary: 'bg-secondary/5 border border-secondary shadow-[2px_2px_0_0_rgba(0,255,255,0.1)]',
    accent: 'bg-accent/5 border border-accent shadow-[2px_2px_0_0_rgba(255,0,255,0.1)]'
  };

  return (
    <div 
      className={cn(
        variants[variant],
        padded && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
