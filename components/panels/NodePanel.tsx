'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, TrendingUp, UserPlus, ExternalLink, Loader2, Crown, Shield, User, Pin, Heart, Edit2, Save } from 'lucide-react';
import { useTreeStore } from '@/hooks/useTree';
import { useAuthStore } from '@/hooks/useAuth';
import { User as UserType, Transaction } from '@/types';
import {
  formatCurrency, formatDate, getRoleBadgeClass,
  getInitials, getStatusDot, cn,
} from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  const [isPinning, setIsPinning] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handlePin = async () => {
    if (!detail) return;
    setIsPinning(true);
    try {
      await api.post('/interests/pin', { toUserId: detail.user._id });
      toast.success(`Pinned ${detail.user.name} - Interest sent for alliance`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pin member');
    } finally {
      setIsPinning(false);
    }
  };

  const handleOpenEdit = () => {
    if (!detail) return;
    setEditBio(detail.user.bio || '');
    setEditDescription(detail.user.description || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!detail) return;
    setIsUpdating(true);
    try {
      await api.put(`/users/${detail.user._id}`, {
        bio: editBio,
        description: editDescription,
      });
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      // Refresh detail
      const res = await api.get(`/users/${detail.user._id}`);
      setDetail(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  const isAncestorOrDeceased = detail?.user?.isStatic || !detail?.user?.isAlive;
  const canEditAncestor = (currentUser?.role === 'scholar' || currentUser?.role === 'leader') && isAncestorOrDeceased;
  const isViewingMaleMember = detail?.user?.gender === 'male';
  const isNotSelf = currentUser?._id !== detail?.user?._id;
  const canPin = isViewingMaleMember && isNotSelf && currentUser;

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
                         {detail.user.gender === 'female' && (
                           <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
                             Female ♀
                           </span>
                         )}
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

                  {/* Bio & Description for ancestors */}
                  {(detail.user.bio || detail.user.description) && (
                    <div className="space-y-3">
                      <div className="gold-divider" />
                      <p className="font-cinzel text-xs text-clan-gold/60 tracking-wider">ABOUT</p>
                      {detail.user.bio && (
                        <div className="bg-clan-dark-3 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Short Bio</p>
                          <p className="text-sm text-foreground/90">{detail.user.bio}</p>
                        </div>
                      )}
                      {detail.user.description && (
                        <div className="bg-clan-dark-3 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Description</p>
                          <p className="text-sm text-foreground/90 leading-relaxed">{detail.user.description}</p>
                        </div>
                      )}
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
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm text-foreground/90 truncate">{child.name}</p>
                                {child.gender === 'female' && (
                                  <span className="text-pink-400 text-xs">♀</span>
                                )}
                              </div>
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
            {detail && (
              <div className="px-5 py-4 border-t border-clan-border space-y-2">
                {!detail.user.isStatic && (
                  <>
                    <Link href={`/dashboard?userId=${detail.user._id}`}>
                      <button className="w-full btn-ghost text-sm flex items-center justify-center gap-2">
                        <ExternalLink size={14} />
                        View Full Profile
                      </button>
                    </Link>
                    {canPin && (
                      <button
                        onClick={handlePin}
                        disabled={isPinning}
                        className="w-full py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isPinning ? (
                          <div className="w-4 h-4 rounded-full border border-rose-400/30 border-t-rose-400 animate-spin" />
                        ) : (
                          <>
                            <Pin size={14} />
                            Pin for Alliance
                          </>
                        )}
                      </button>
                    )}
                    {(currentUser?.role === 'admin' || currentUser?.role === 'leader') && (
                      <button className="w-full btn-gold text-sm flex items-center justify-center gap-2">
                        <UserPlus size={14} />
                        Add Child Node
                      </button>
                    )}
                  </>
                )}
                {canEditAncestor && !showEditModal && (
                  <button
                    onClick={handleOpenEdit}
                    className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    Edit Bio & Description
                  </button>
                )}

                {showEditModal && (
                  <div className="pt-3 border-t border-clan-border/50">
                    <h4 className="font-cinzel text-emerald-400 text-xs tracking-wider mb-3">EDIT ANCESTOR PROFILE</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Short Bio</label>
                        <textarea
                          className="input-dark w-full min-h-[60px] resize-y text-xs"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          maxLength={500}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Description</label>
                        <textarea
                          className="input-dark w-full min-h-[80px] resize-y text-xs"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          maxLength={1000}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={isUpdating}
                          className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {isUpdating ? <div className="w-3 h-3 rounded-full border border-emerald-400/30 border-t-emerald-400 animate-spin" /> : <Save size={12} />}
                          Save
                        </button>
                        <button
                          onClick={() => setShowEditModal(false)}
                          className="px-3 py-2 rounded-lg bg-clan-dark-3 text-muted-foreground text-xs hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
  );
}
