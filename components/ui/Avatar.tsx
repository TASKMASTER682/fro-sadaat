'use client';

import { cn, getInitials } from '@/lib/utils';
import { UserRole } from '@/types';

interface AvatarProps {
  name: string;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
};

const roleRingMap: Record<UserRole, string> = {
  leader: 'ring-2 ring-clan-gold/60',
  admin:  'ring-2 ring-blue-400/60',
  member: 'ring-1 ring-clan-border',
  scholar: 'ring-2 ring-purple-400/60',
  blogger: 'ring-2 ring-emerald-400/60',
  ancestor: 'ring-1 ring-gray-400/60',
};

export default function Avatar({ name, role = 'member', size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0',
        'font-cinzel font-bold text-clan-black',
        sizeMap[size],
        role && roleRingMap[role],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
