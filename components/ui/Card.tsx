'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gold?: boolean;
}

export function Card({ children, className, hover, gold }: CardProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl border transition-all duration-200',
        hover && 'hover:border-clan-gold/20 cursor-pointer',
        gold ? 'border-clan-gold/20' : 'border-clan-border',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b border-clan-border', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('font-cinzel text-clan-gold/80 text-sm tracking-wider', className)}>
      {children}
    </h2>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}
