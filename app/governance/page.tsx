'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote, Plus, Clock, CheckCircle, XCircle as XCircleIcon,
  ThumbsUp, ThumbsDown, Loader2, ChevronDown, ChevronUp, Trash2,
  ListChecks, Check,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Proposal } from '@/types';
import { formatDate, formatDateTime, getRoleBadgeClass, cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  open: { label: 'Open', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Clock },
  approved: { label: 'Approved', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircleIcon },
  executed: { label: 'Executed', color: 'text-clan-gold bg-clan-gold/10 border-clan-gold/20', icon: CheckCircle },
  expired: { label: 'Expired', color: 'text-muted-foreground bg-muted/10 border-muted/20', icon: Clock },
};

function ProposalCard({ proposal, onVote, currentUserId, userRole, onPublish, onDelete }: {
  proposal: Proposal;
  onVote: (id: string, vote: string) => void;
  currentUserId: string;
  userRole: string;
  onPublish?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [voting, setVoting] = useState(false);

  const cfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.open;
  const StatusIcon = cfg.icon;
  const hasVoted = proposal.votes.some((v) =>
    typeof v.userId === 'object' ? (v.userId as any)._id === currentUserId : v.userId === currentUserId
  );
  const canVote = !hasVoted && proposal.status === 'open' && proposal.createdBy !== currentUserId;
  const canPublish = proposal.status === 'draft' && userRole === 'leader';
  const canDelete = userRole === 'leader' && (proposal.status === 'draft' || proposal.status === 'open');
  const totalVoters = proposal.votes.length;
  const approvals = proposal.approvalCount;
  const rejections = proposal.rejectionCount;
  const progress = proposal.requiredApprovals > 0 ? (approvals / proposal.requiredApprovals) * 100 : 0;
  const createdByName = proposal.createdBy && typeof proposal.createdBy === 'object' ? (proposal.createdBy as any).name : 'Unknown';
  const isMultipleChoice = (proposal as any).votingType === 'multiple_choice';
  const options = (proposal as any).options || [];

  const handleVote = async (vote: string) => {
    setVoting(true);
    await onVote(proposal._id, vote);
    setVoting(false);
  };

  const handlePublish = () => {
    if (onPublish) onPublish(proposal._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl border border-clan-border hover:border-clan-gold/20 transition-colors overflow-hidden"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono text-muted-foreground bg-clan-dark-3 px-2 py-0.5 rounded uppercase">
                {proposal.type.replace('_', ' ')}
              </span>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1', cfg.color)}>
                <StatusIcon size={10} />
                {cfg.label}
              </span>
            </div>
            <h3 className="font-cinzel text-foreground font-semibold text-sm leading-snug">{proposal.title}</h3>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-clan-gold transition-colors flex-shrink-0 mt-0.5">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Proposer & date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span>By <span className="text-clan-gold/80">{createdByName}</span></span>
          <span>·</span>
          <span>{formatDate(proposal.createdAt)}</span>
          <span>·</span>
          <span>Deadline: {formatDate(proposal.deadline)}</span>
        </div>

        {/* Vote progress */}
        {proposal.status === 'open' && (
          <div className="mb-4">
            {isMultipleChoice ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poll</span>
                  <span>{totalVoters} voted</span>
                </div>
                {options.map((opt: any, idx: number) => {
                  const optVotes = proposal.votes.filter((v: any) => v.vote === opt.text).length;
                  const percentage = totalVoters > 0 ? (optVotes / totalVoters) * 100 : 0;
                  const isLeading = options.every((o: any, i: number) => {
                    const oVotes = proposal.votes.filter((v: any) => v.vote === o.text).length;
                    return optVotes >= oVotes;
                  });
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={isLeading ? 'text-clan-gold font-medium' : 'text-foreground/70'}>
                          {String.fromCharCode(65 + idx)}. {opt.text}
                        </span>
                        <span className={isLeading ? 'text-clan-gold' : 'text-muted-foreground'}>
                          {optVotes} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-clan-dark-3 rounded-full overflow-hidden">
                        <motion.div
                          className={cn('h-full rounded-full', isLeading ? 'bg-clan-gold' : 'bg-clan-dark-4')}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{approvals} / {proposal.requiredApprovals} approvals needed</span>
                  <span>{totalVoters} voted</span>
                </div>
                <div className="h-1.5 bg-clan-dark-3 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span className="text-emerald-400">{approvals} approve</span>
                  <span className="text-red-400">{rejections} reject</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vote buttons */}
        {canVote && (
          <>
            {isMultipleChoice ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-clan-gold/60 mb-2">
                  <ListChecks size={13} />
                  <span>Select your choice:</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {options.map((opt: any, idx: number) => {
                    const optVotes = proposal.votes.filter((v: any) => v.vote === opt.text).length;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleVote(opt.text)}
                        disabled={voting}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                                   bg-clan-dark-3 text-foreground border border-clan-border
                                   hover:bg-clan-dark-2 hover:border-clan-gold/30 transition-all disabled:opacity-50 text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-clan-gold/10 text-clan-gold flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{opt.text}</p>
                          {opt.description && <p className="text-xs text-muted-foreground truncate">{opt.description}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground">{optVotes} votes</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote('approve')}
                  disabled={voting}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm
                             bg-emerald-500/15 text-emerald-400 border border-emerald-500/20
                             hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                >
                  {voting ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />}
                  Approve
                </button>
                <button
                  onClick={() => handleVote('reject')}
                  disabled={voting}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm
                             bg-red-500/15 text-red-400 border border-red-500/20
                             hover:bg-red-500/25 transition-all disabled:opacity-50"
                >
                  {voting ? <Loader2 size={13} className="animate-spin" /> : <ThumbsDown size={13} />}
                  Reject
                </button>
              </div>
            )}
          </>
        )}

        {hasVoted && proposal.status === 'open' && (
          <p className="text-xs text-muted-foreground text-center py-1">✓ You have voted on this proposal</p>
        )}

        {canPublish && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400 mb-3">📋 This proposal is awaiting leader approval to go live.</p>
            <div className="flex gap-2">
              <button
                onClick={handlePublish}
                className="flex-1 py-2 rounded-lg text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30
                           hover:bg-emerald-500/30 transition-all font-medium"
              >
                ✓ Publish
              </button>
            </div>
          </div>
        )}

        {proposal.status === 'draft' && userRole === 'admin' && (
          <p className="text-xs text-amber-400 text-center py-1">⏳ Awaiting leader approval</p>
        )}

        {canDelete && !canPublish && onDelete && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onDelete(proposal._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                         bg-red-500/10 text-red-400 border border-red-500/20
                         hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={12} />
              Delete Proposal
            </button>
          </div>
        )}
      </div>

      {/* Expanded description */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-clan-border"
          >
            <div className="px-5 py-4">
              <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">{proposal.description}</p>
              {proposal.votes.length > 0 && (
                <div className="mt-4">
                  <p className="font-cinzel text-xs text-clan-gold/60 mb-2 tracking-wider">VOTES CAST</p>
                  <div className="space-y-1.5">
                    {proposal.votes.map((v, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs">
                        {v.vote === 'approve'
                          ? <ThumbsUp size={11} className="text-emerald-400" />
                          : <ThumbsDown size={11} className="text-red-400" />
                        }
                        <span className="text-foreground/70">
                          {typeof v.userId === 'object' ? (v.userId as any).name : 'Member'}
                        </span>
                        {v.comment && <span className="text-muted-foreground">— {v.comment}</span>}
                        <span className="ml-auto text-muted-foreground">{formatDate(v.votedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GovernancePage() {
  const { user } = useAuthStore();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form, setForm] = useState<{
    title: string;
    description: string;
    type: string;
    votingType: 'approve_reject' | 'multiple_choice';
    options: { text: string; description: string }[];
  }>({
    title: '',
    description: '',
    type: 'general',
    votingType: 'approve_reject',
    options: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/proposals${params}`);
      let filtered = res.data.data;
      if (!['admin', 'leader'].includes(user?.role || '')) {
        filtered = filtered.filter((p: Proposal) => p.status !== 'draft');
      }
      setProposals(filtered);
    } catch {
      toast.error('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProposals(); }, [statusFilter, user]);

  const handleCreateProposal = async () => {
    if (!form.title || !form.description) return toast.error('Title and description required');
    if (form.votingType === 'multiple_choice' && form.options.length < 2) {
      return toast.error('Multiple choice needs at least 2 options');
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        options: form.votingType === 'multiple_choice' ? form.options : undefined,
      };
      await api.post('/proposals', payload);
      toast.success('Proposal created');
      setForm({ title: '', description: '', type: 'general', votingType: 'approve_reject', options: [] });
      setShowForm(false);
      fetchProposals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string, vote: string) => {
    try {
      await api.post(`/proposals/${id}/vote`, { vote });
      toast.success(`Vote recorded: ${vote}`);
      fetchProposals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Vote failed');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/proposals/${id}/publish`);
      toast.success('Proposal published for voting!');
      fetchProposals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to reject this proposal? This action cannot be undone.')) return;
    try {
      await api.delete(`/proposals/${id}`);
      toast.success('Proposal rejected and deleted');
      fetchProposals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete proposal');
    }
  };

  const proposalTypes = ['general', 'withdrawal', 'role_change', 'member_approval', 'policy'];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-wider">Clan GOVERNANCE</h1>
          <p className="text-muted-foreground text-sm mt-1">Clan proposals, voting, and decisions</p>
          <div className="gold-divider mt-3" />
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {['admin', 'leader'].includes(user?.role || '') && (
            <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm flex items-center gap-2">
              <Plus size={14} />
              New Proposal
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {['all', ...(['admin', 'leader'].includes(user?.role || '') ? ['draft'] : []), 'open', 'approved', 'rejected', 'executed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg capitalize transition-all',
                  statusFilter === s
                    ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-clan-border'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel rounded-2xl p-6 border border-clan-gold/20 overflow-hidden"
            >
              <h3 className="font-cinzel text-clan-gold text-sm tracking-wider mb-5">NEW PROPOSAL</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Title</label>
                    <input
                      className="input-dark"
                      placeholder="Proposal title…"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
                    <select
                      className="input-dark"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      {proposalTypes.map((t) => (
                        <option key={t} value={t} className="bg-clan-dark-2">
                          {t.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Voting Type */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Voting Type</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, votingType: 'approve_reject', options: [] })}
                      className={cn(
                        'flex-1 py-2.5 rounded-lg text-sm border transition-all',
                        form.votingType === 'approve_reject'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-clan-dark-3 text-muted-foreground border-clan-border hover:border-clan-gold/30'
                      )}
                    >
                      <ThumbsUp size={14} className="inline mr-2" />
                      Approve / Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, votingType: 'multiple_choice', options: [{ text: '', description: '' }, { text: '', description: '' }] })}
                      className={cn(
                        'flex-1 py-2.5 rounded-lg text-sm border transition-all',
                        form.votingType === 'multiple_choice'
                          ? 'bg-clan-gold/15 text-clan-gold border-clan-gold/30'
                          : 'bg-clan-dark-3 text-muted-foreground border-clan-border hover:border-clan-gold/30'
                      )}
                    >
                      <ListChecks size={14} className="inline mr-2" />
                      Multiple Choice
                    </button>
                  </div>
                </div>

                {/* Multiple Choice Options */}
                {form.votingType === 'multiple_choice' && (
                  <div className="space-y-3 p-4 bg-clan-dark-3/50 rounded-xl border border-clan-gold/20">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-clan-gold font-medium">Options (2-6)</label>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, options: [...form.options, { text: '', description: '' }] })}
                        disabled={form.options.length >= 6}
                        className="text-xs text-clan-gold hover:text-clan-gold/80 disabled:opacity-50"
                      >
                        + Add Option
                      </button>
                    </div>
                    {form.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="w-6 h-6 rounded-full bg-clan-gold/10 text-clan-gold flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1.5">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <input
                            className="input-dark text-sm"
                            placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...form.options];
                              newOpts[idx].text = e.target.value;
                              setForm({ ...form, options: newOpts });
                            }}
                          />
                          <input
                            className="input-dark text-xs"
                            placeholder="Description (optional)"
                            value={opt.description}
                            onChange={(e) => {
                              const newOpts = [...form.options];
                              newOpts[idx].description = e.target.value;
                              setForm({ ...form, options: newOpts });
                            }}
                          />
                        </div>
                        {form.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = form.options.filter((_, i) => i !== idx);
                              setForm({ ...form, options: newOpts });
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <XCircleIcon size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                  <textarea
                    className="input-dark h-28 resize-none"
                    placeholder="Describe the proposal in detail…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleCreateProposal} disabled={isSubmitting} className="btn-gold text-sm">
                    {isSubmitting ? 'Creating…' : 'Create Proposal'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proposals list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-clan-gold animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => (
              <ProposalCard
                key={p._id}
                proposal={p}
                onVote={handleVote}
                onPublish={handlePublish}
                onDelete={handleDelete}
                currentUserId={user?._id || ''}
                userRole={user?.role || 'member'}
              />
            ))}
            {proposals.length === 0 && (
              <div className="text-center py-20">
                <Vote size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No proposals yet. Create the first one!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
