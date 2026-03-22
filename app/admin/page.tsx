'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Clock, ScrollText, Users, Settings, ChevronRight, Bell } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { useAuthStore } from '@/hooks/useAuth';

const adminLinks = [
  {
    href: '/admin/pending',
    icon: Clock,
    title: 'Pending Approvals',
    desc: 'Review and attach new member registrations to the family tree',
    badge: 'Action Required',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    href: '/admin/announcements',
    icon: Bell,
    title: 'Announcements',
    desc: 'Create and manage clan-wide announcements',
    badge: 'Communication',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    href: '/admin/audit',
    icon: ScrollText,
    title: 'Audit Logs',
    desc: 'Full action trail — every operation performed on the system',
    badge: 'Read Only',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    href: '/members',
    icon: Users,
    title: 'Member Directory',
    desc: 'Browse, search, and manage all clan members',
    badge: 'Full Access',
    badgeColor: 'text-clan-gold bg-clan-gold/10 border-clan-gold/20',
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && user && !['admin', 'leader'].includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, isInitialized, router]);

  if (!user || !['admin', 'leader'].includes(user.role)) return null;

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        <PageHeader
          title="ADMIN PANEL"
          subtitle="Clan management and administration tools"
          icon={ShieldCheck}
        />

        {/* Role badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-clan-gold/10 border border-clan-gold/20"
        >
          <ShieldCheck size={14} className="text-clan-gold" />
          <span className="font-cinzel text-clan-gold text-sm">
            Signed in as <strong className="capitalize">{user.role}</strong> — {user.name}
          </span>
        </motion.div>

        {/* Admin tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {adminLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Link href={link.href}>
                <div className="glass-panel rounded-2xl border border-clan-border p-6
                                hover:border-clan-gold/25 cursor-pointer transition-all duration-200
                                hover:shadow-[0_0_24px_rgba(212,175,55,0.08)] group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-clan-gold/10 border border-clan-gold/20
                                    flex items-center justify-center group-hover:bg-clan-gold/15 transition-colors">
                      <link.icon size={20} className="text-clan-gold" />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  </div>
                  <h3 className="font-cinzel text-foreground font-semibold text-sm mb-2 group-hover:text-clan-gold transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{link.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-clan-gold/60 text-xs group-hover:text-clan-gold transition-colors">
                    <span>Open</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl border border-clan-border p-6"
        >
          <p className="font-cinzel text-xs text-clan-gold/60 tracking-wider mb-4">ADMIN CAPABILITIES</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            {[
              '✓ Approve or reject new member registrations',
              '✓ Attach pending members to their lineage node',
              '✓ Record monthly contributions for members',
              '✓ Approve withdrawal requests (with voting)',
              '✓ Update member roles and status',
              '✓ View complete audit trail of all actions',
              '✓ Create governance proposals',
              '✓ Vote on open proposals',
            ].map((item) => (
              <p key={item} className="flex items-start gap-2">
                <span className="text-clan-gold flex-shrink-0">{item.slice(0, 1)}</span>
                <span>{item.slice(2)}</span>
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
