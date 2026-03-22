'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, TrendingUp, UserPlus, ExternalLink, Loader2, Crown, Shield, User } from 'lucide-react';
import { useTreeStore } from '@/hooks/useTree';
import { useAuthStore } from '@/hooks/useAuth';
import { User as UserType, Transaction } from '@/types';
import {
  formatCurrency, formatDate, getRoleBadgeClass,
  getInitials, getStatusDot, cn,
} from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';

interface NodeDetail {
  user: UserType;
  lineage: { _id: string; name: string; role: string }[];
  children: UserType[];
  transactions: Transaction[];
}

export default function NodePanel() {
  const { selectedNode, isPanelOpen, closePanel } = useTreeStore();
  const { user: currentUser } = useAuthStore();
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedNode?._id || selectedNode._id === 'root') {
      setDetail(null);
      return;
    }
    setIsLoading(true);
    api.get(`/users/${selectedNode._id}`)
      .then((res) => setDetail(res.data.data))
      .catch(() => setDetail(null))
      .finally(() => setIsLoading(false));
  }, [selectedNode?._id]);

  const roleIcon = (role: string) => {
    if (role === 'leader') return <Crown size={12} className="text-clan-gold" />;
    if (role === 'admin') return <Shield size={12} className="text-blue-400" />;
    return <User size={12} className="text-emerald-400" />;
  };

  return (
    <AnimatePresence>
      {isPanelOpen && selectedNode && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={closePanel}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-screen w-96 glass-panel border-l border-clan-border z-50
                       flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-clan-border">
              <h2 className="font-cinzel text-clan-gold text-sm tracking-wider">NODE DETAIL</h2>
              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg hover:bg-clan-dark-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-clan-gold animate-spin" />
                </div>
              ) : detail ? (
                <div className="p-5 space-y-5">
                  {/* Avatar + basic info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center
                                    text-clan-black font-cinzel font-bold text-lg flex-shrink-0">
                      {getInitials(detail.user.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-cinzel text-foreground text-base font-semibold leading-tight">{detail.user.name}</h3>
                      {detail.user.email && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{detail.user.email}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getRoleBadgeClass(detail.user.role))}>
                          {detail.user.role}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={cn('w-1.5 h-1.5 rounded-full', getStatusDot(detail.user.status))} />
                          <span className="text-xs text-muted-foreground capitalize">{detail.user.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-clan-dark-3 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Contributions</p>
                      <p className="font-cinzel text-clan-gold font-semibold mt-0.5">
                        {formatCurrency(detail.user.contributions)}
                      </p>
                    </div>
                    <div className="bg-clan-dark-3 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm text-foreground font-medium mt-0.5">
                        {formatDate(detail.user.joinedAt)}
                      </p>
                    </div>
                  </div>

                  {detail.user.isStatic && (
                    <div className="flex items-center gap-2 text-xs text-clan-gold/60 bg-clan-gold/5 rounded-lg px-3 py-2 border border-clan-gold/15">
                      <GitBranch size={13} />
                      <span>Historical Ancestor — Read Only</span>
                    </div>
                  )}

                  {/* Lineage chain */}
                  {detail.lineage.length > 0 && (
                    <div>
                      <div className="gold-divider mb-3" />
                      <p className="font-cinzel text-xs text-clan-gold/60 tracking-wider mb-3">LINEAGE PATH</p>
                      <div className="space-y-1">
                        {detail.lineage.map((ancestor, i) => (
                          <div key={ancestor._id} className="flex items-center gap-2">
                            <div
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-clan-dark-3
                                         border border-clan-border/50 text-xs flex-1"
                              style={{ marginLeft: `${i * 12}px` }}
                            >
                              {roleIcon(ancestor.role)}
                              <span className={ancestor._id === detail.user._id ? 'text-clan-gold font-medium' : 'text-foreground/70'}>
                                {ancestor.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Children */}
                  {detail.children.length > 0 && (
                    <div>
                      <div className="gold-divider mb-3" />
                      <p className="font-cinzel text-xs text-clan-gold/60 tracking-wider mb-3">
                        DIRECT DESCENDANTS ({detail.children.length})
                      </p>
                      <div className="space-y-1.5">
                        {detail.children.map((child) => (
                          <div key={child._id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-clan-dark-3">
                            <div className="w-7 h-7 rounded-full bg-clan-dark-4 flex items-center justify-center
                                            text-[10px] font-cinzel font-bold text-clan-gold/70 flex-shrink-0">
                              {getInitials(child.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground/90 truncate">{child.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{child.role}</p>
                            </div>
                            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', getStatusDot(child.status))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent contributions */}
                  {detail.transactions.length > 0 && (
                    <div>
                      <div className="gold-divider mb-3" />
                      <p className="font-cinzel text-xs text-clan-gold/60 tracking-wider mb-3">
                        RECENT TRANSACTIONS
                      </p>
                      <div className="space-y-1.5">
                        {detail.transactions.slice(0, 5).map((txn) => (
                          <div key={txn._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-clan-dark-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp
                                size={13}
                                className={txn.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}
                              />
                              <span className="text-xs text-muted-foreground">{formatDate(txn.createdAt)}</span>
                            </div>
                            <span className={cn('text-xs font-medium font-cinzel', txn.type === 'deposit' ? 'text-emerald-400' : 'text-red-400')}>
                              {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 text-center text-muted-foreground text-sm">
                  No details available.
                </div>
              )}
            </div>

            {/* Action buttons */}
            {detail && !detail.user.isStatic && (
              <div className="px-5 py-4 border-t border-clan-border space-y-2">
                <Link href={`/dashboard?userId=${detail.user._id}`}>
                  <button className="w-full btn-ghost text-sm flex items-center justify-center gap-2">
                    <ExternalLink size={14} />
                    View Full Profile
                  </button>
                </Link>
                {(currentUser?.role === 'admin' || currentUser?.role === 'leader') && (
                  <button className="w-full btn-gold text-sm flex items-center justify-center gap-2">
                    <UserPlus size={14} />
                    Add Child Node
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
