'use client';

import { motion } from 'framer-motion';
import NotificationBell from '@/components/ui/NotificationBell';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/hooks/useAuth';
import { getRoleBadgeClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user } = useAuthStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 w-full glass-panel border-b border-clan-border px-6 py-3
                 flex items-center justify-between"
    >
      {title && (
        <h2 className="font-cinzel text-foreground/80 text-sm hidden sm:block">{title}</h2>
      )}
      <div className="flex items-center gap-3 ml-auto">
        <NotificationBell />
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-clan-border">
            <Avatar name={user.name} role={user.role} size="sm" />
            <div className="hidden md:block">
              <p className="text-xs font-medium text-foreground/90 leading-none">{user.name}</p>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block', getRoleBadgeClass(user.role))}>
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
