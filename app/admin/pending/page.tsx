'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Search, Loader2, UserCheck, UserX, GitMerge } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { User } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FatherResult { _id: string; name: string; role: string }

export default function AdminPendingPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attachingUser, setAttachingUser] = useState<User | null>(null);
  const [fatherSearch, setFatherSearch] = useState('');
  const [fatherResults, setFatherResults] = useState<FatherResult[]>([]);
  const [selectedFather, setSelectedFather] = useState<FatherResult | null>(null);
  const [fatherSearching, setFatherSearching] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<User | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/pending');
      setPendingUsers(res.data.data);
    } catch {
      toast.error('Failed to load pending members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const searchFather = async () => {
    if (!fatherSearch.trim()) return;
    setFatherSearching(true);
    try {
      const res = await api.post('/auth/search-father', { query: fatherSearch });
      setFatherResults(res.data.data);
    } finally {
      setFatherSearching(false);
    }
  };

  const handleAttach = async () => {
    if (!attachingUser || !selectedFather) return toast.error('Select a father node');
    setIsAttaching(true);
    try {
      await api.post(`/users/${attachingUser._id}/attach`, { fatherId: selectedFather._id });
      toast.success(`${attachingUser.name} attached to ${selectedFather.name}`);
      setAttachingUser(null);
      setSelectedFather(null);
      setFatherSearch('');
      setFatherResults([]);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Attach failed');
    } finally {
      setIsAttaching(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    try {
      await api.put(`/users/${rejectTarget._id}`, { status: 'inactive', pendingApproval: false });
      toast.success(`${rejectTarget.name} rejected`);
      setRejectTarget(null);
      fetchPending();
    } catch {
      toast.error('Rejection failed');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <PageHeader
          title="PENDING APPROVALS"
          subtitle="Members awaiting lineage verification"
          icon={Clock}
          action={
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
              <Clock size={13} />
              {pendingUsers.length} pending
            </div>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-clan-gold animate-spin" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="All clear!"
            description="No pending member approvals at this time."
          />
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-2xl border border-amber-500/20 p-5"
              >
                <div className="flex items-start gap-4">
                  <Avatar name={u.name} role={u.role} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-cinzel text-foreground font-semibold">{u.name}</h3>
                      <Badge variant="amber">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{u.email || 'No email'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registered: {formatDateTime(u.createdAt)}
                    </p>
                    {u.phone && (
                      <p className="text-xs text-muted-foreground">Phone: {u.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setAttachingUser(u); setFatherSearch(''); setFatherResults([]); setSelectedFather(null); }}
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg
                                 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20
                                 hover:bg-emerald-500/25 transition-all"
                    >
                      <GitMerge size={13} />
                      Attach to Tree
                    </button>
                    <button
                      onClick={() => setRejectTarget(u)}
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg
                                 bg-red-500/10 text-red-400 border border-red-500/20
                                 hover:bg-red-500/20 transition-all"
                    >
                      <UserX size={13} />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Inline attach form */}
                {attachingUser?._id === u._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-clan-border space-y-3"
                  >
                    <p className="font-cinzel text-xs text-clan-gold/60 tracking-wider">ATTACH TO FATHER NODE</p>
                    <div className="flex gap-2">
                      <input
                        className="input-dark flex-1"
                        placeholder="Search father by name…"
                        value={fatherSearch}
                        onChange={(e) => setFatherSearch(e.target.value)}
                      />
                      <button onClick={searchFather} disabled={fatherSearching} className="btn-ghost px-4">
                        {fatherSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      </button>
                    </div>

                    {fatherResults.length > 0 && (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scroll">
                        {fatherResults.map((f) => (
                          <button
                            key={f._id}
                            onClick={() => setSelectedFather(f)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                              ${selectedFather?._id === f._id
                                ? 'border-clan-gold/40 bg-clan-gold/10'
                                : 'border-clan-border bg-clan-dark-3 hover:border-clan-gold/20'
                              }`}
                          >
                            <Avatar name={f.name} role={f.role as any} size="sm" />
                            <div>
                              <p className="text-sm text-foreground">{f.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{f.role}</p>
                            </div>
                            {selectedFather?._id === f._id && (
                              <CheckCircle size={14} className="ml-auto text-clan-gold" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedFather && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                        <UserCheck size={12} />
                        Will attach <strong>{u.name}</strong> as child of <strong>{selectedFather.name}</strong>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleAttach}
                        disabled={!selectedFather || isAttaching}
                        className="btn-gold text-sm flex items-center gap-2"
                      >
                        {isAttaching ? <Loader2 size={13} className="animate-spin" /> : <GitMerge size={13} />}
                        Confirm Attach
                      </button>
                      <button
                        onClick={() => setAttachingUser(null)}
                        className="btn-ghost text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject confirmation */}
      <ConfirmModal
        isOpen={!!rejectTarget}
        title="Reject Member"
        message={`Are you sure you want to reject ${rejectTarget?.name}'s registration? Their account will be marked inactive.`}
        confirmLabel="Reject"
        variant="danger"
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
        isLoading={isRejecting}
      />
    </AppLayout>
  );
}
