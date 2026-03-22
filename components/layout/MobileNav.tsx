'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TreePine, LayoutDashboard, Vote, Banknote, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNav = [
  { href: '/shajra',     label: 'Tree',        icon: TreePine },
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/members',    label: 'Members',     icon: Users },
  { href: '/governance', label: 'Govern',      icon: Vote },
  { href: '/trust',      label: 'Trust',       icon: Banknote },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-panel border-t border-clan-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {mobileNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all',
                active ? 'text-clan-gold' : 'text-muted-foreground'
              )}>
                <item.icon size={20} />
                <span className="text-[10px] font-inter font-medium">{item.label}</span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-clan-gold" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
