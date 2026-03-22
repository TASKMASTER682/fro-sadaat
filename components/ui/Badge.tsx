'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'gold' | 'green' | 'red' | 'blue' | 'amber' | 'grey' | 'ghost';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  gold:  'bg-clan-gold/15 text-clan-gold border border-clan-gold/30',
  green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  red:   'bg-red-500/15 text-red-400 border border-red-500/30',
  blue:  'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  grey:  'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  ghost: 'bg-clan-dark-3 text-muted-foreground border border-clan-border',
};

const dotMap: Record<BadgeVariant, string> = {
  gold:  'bg-clan-gold',
  green: 'bg-emerald-400',
  red:   'bg-red-400',
  blue:  'bg-blue-400',
  amber: 'bg-amber-400',
  grey:  'bg-gray-400',
  ghost: 'bg-muted-foreground',
};

export default function Badge({ children, variant = 'ghost', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full',
        variantMap[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotMap[variant])} />
      )}
      {children}
    </span>
  );
}
