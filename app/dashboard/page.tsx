'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Wallet, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Heart, Check, X, Pin } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardAnnouncements from '@/components/DashboardAnnouncements';
import { DashboardStats, Transaction, User } from '@/types';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

function StatCard({ label, value, sub, icon: Icon, color, index }: any) {
  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="glass-panel rounded-2xl p-5 border border-clan-border hover:border-clan-gold/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon size={18} className="text-clan-black" />
        </div>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
      <p className="font-cinzel text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, txnsRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/transactions?limit=10'),
        ]);
        setStats(statsRes.data.data);
        setRecentTxns(txnsRes.data.data);
        if (user && ['admin', 'leader'].includes(user.role)) {
          try {
            const pendRes = await api.get('/users/pending');
            setPendingUsers(pendRes.data.data);
          } catch { /* non-admin */ }
        }
        try {
          const intRes = await api.get('/interests');
          setReceivedInterests(intRes.data.data.received.filter((i: any) => i.status === 'pending'));
        } catch { /* non-interest */ }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleRespondInterest = async (interestId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/interests/${interestId}/respond`, { status });
      toast.success(status === 'accepted' ? 'Interest accepted' : 'Interest rejected');
      setReceivedInterests(prev => prev.filter(i => i._id !== interestId));
    } catch (err) {
      toast.error('Failed to respond');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 rounded-full border-2 border-clan-gold/30 border-t-clan-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Members',
      value: stats?.totalMembers ?? '—',
      sub: 'Registered',
      icon: Users,
      color: 'bg-gold-gradient',
    },
    {
      label: 'Active Contributors',
      value: stats?.activeMembers ?? '—',
      sub: 'This month',
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      label: 'Trust Fund',
      value: stats ? formatCurrency(stats.totalFund) : '—',
      sub: 'Total balance',
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Approvals',
      value: stats?.pendingMembers ?? '—',
      sub: 'Needs review',
      icon: AlertCircle,
      color: 'bg-amber-500',
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-wider">DASHBOARD</h1>
          <p className="text-muted-foreground text-sm mt-1">Clan overview and recent activity</p>
          <div className="gold-divider mt-3" />
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <StatCard key={card.label} {...card} index={i} />
          ))}
        </div>

        {/* Announcements */}
        <DashboardAnnouncements />

        {/* Fund breakdown */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-6 border border-clan-border"
          >
            <h2 className="font-cinzel text-clan-gold/80 text-sm tracking-wider mb-5">FUND BREAKDOWN</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Total Deposits</span>
                </div>
                <p className="font-cinzel text-xl text-emerald-400 font-semibold">
                  {formatCurrency(stats.totalDeposits)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-muted-foreground">Total Withdrawals</span>
                </div>
                <p className="font-cinzel text-xl text-red-400 font-semibold">
                  {formatCurrency(stats.totalWithdrawals)}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Fund Utilization</span>
                <span>
                  {stats.totalDeposits > 0
                    ? Math.round((stats.totalWithdrawals / stats.totalDeposits) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-clan-dark-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-clan-gold"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${stats.totalDeposits > 0 ? Math.min((stats.totalWithdrawals / stats.totalDeposits) * 100, 100) : 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent transactions */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-6 border border-clan-border"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-clan-gold/80 text-sm tracking-wider">RECENT TRANSACTIONS</h2>
              <Clock size={14} className="text-muted-foreground" />
            </div>
            <div className="space-y-2.5">
              {recentTxns.slice(0, 8).map((txn) => {
                const userObj = txn.userId;
                const userName = userObj && typeof userObj === 'object' ? userObj.name : 'Member';
                return (
                <div key={txn._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-clan-dark-3">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                    txn.type === 'deposit' ? 'bg-emerald-500/15' : 'bg-red-500/15'
                  )}>
                    {txn.type === 'deposit'
                      ? <ArrowDownRight size={14} className="text-emerald-400" />
                      : <ArrowUpRight size={14} className="text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{txn.note || txn.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn('text-sm font-cinzel font-semibold', txn.type === 'deposit' ? 'text-emerald-400' : 'text-red-400')}>
                      {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDateTime(txn.createdAt)}</p>
                  </div>
                </div>
                );
              })}
              {recentTxns.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No transactions yet.</p>
              )}
            </div>
          </motion.div>

          {/* Pending members */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-6 border border-clan-border"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-clan-gold/80 text-sm tracking-wider">PENDING MEMBERS</h2>
              <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                {pendingUsers.length} waiting
              </span>
            </div>
            <div className="space-y-2.5">
              {pendingUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-clan-dark-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center
                                  text-xs font-cinzel font-bold text-amber-400 flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email || 'No email'}</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
              {pendingUsers.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No pending approvals.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Marriage Interests Section */}
        {receivedInterests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel rounded-2xl p-6 border border-rose-500/20"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h2 className="font-cinzel text-rose-400 text-sm tracking-wider">MARRIAGE INTERESTS</h2>
              </div>
              <span className="text-xs text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full">
                {receivedInterests.length} pending
              </span>
            </div>
            <div className="space-y-2.5">
              {receivedInterests.map((interest) => (
                <div key={interest._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-clan-dark-3 border border-rose-500/10">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center
                                  text-xs font-cinzel font-bold text-rose-400 flex-shrink-0">
                    {interest.fromUser?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90">{interest.fromUser?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        interest.type === 'pin' && 'bg-amber-500/20 text-amber-400',
                        interest.type === 'interested' && 'bg-rose-500/20 text-rose-400',
                        interest.type === 'suggestion' && 'bg-emerald-500/20 text-emerald-400'
                      )}>
                        {interest.type === 'pin' ? 'PIN' : interest.type === 'suggestion' ? 'SUGGESTION' : 'INTERESTED'}
                      </span>
                      {interest.message && (
                        <p className="text-xs text-muted-foreground truncate">{interest.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleRespondInterest(interest._id, 'accepted')}
                      className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors"
                      title="Accept"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleRespondInterest(interest._id, 'rejected')}
                      className="p-1.5 rounded-lg bg-slate-500/15 hover:bg-slate-500/25 text-slate-400 transition-colors"
                      title="Reject"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
