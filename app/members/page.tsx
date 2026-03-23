'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Crown, Shield, User as UserIcon, RefreshCw, HeartPulse, Edit2, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, UserRole, UserStatus } from '@/types';
import { formatCurrency, formatDate, getRoleBadgeClass, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useTreeStore } from '@/hooks/useTree';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const ROLE_OPTIONS: { value: string; label: string; icon: any }[] = [
  { value: '', label: 'All Roles', icon: null },
  { value: 'leader', label: 'Leader', icon: Crown },
  { value: 'admin', label: 'Admin', icon: Shield },
  { value: 'member', label: 'Member', icon: UserIcon },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

const statusVariant: Record<string, any> = {
  active: 'green', inactive: 'red', pending: 'amber', deceased: 'grey',
};

export default function MembersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectNode } = useTreeStore();
  const [members, setMembers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editMember, setEditMember] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteMember, setDeleteMember] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 20;

  const canManage = user?.role === 'admin' || user?.role === 'leader' || user?.role === 'scholar';

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await api.get(`/users?${params}`);
      setMembers(res.data.data);
      setTotal(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounce = setTimeout(fetchMembers, search ? 400 : 0);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMembers]);

  const handleViewInTree = (member: User) => {
    selectNode({
      name: member.name,
      _id: member._id,
      attributes: {
        role: member.role,
        status: member.status,
        contributions: member.contributions,
        isStatic: member.isStatic,
        isAlive: member.isAlive,
      },
    });
    router.push('/shajra');
  };

  const handleUpdateIsAlive = async (isAlive: boolean) => {
    if (!editMember) return;
    setIsUpdating(true);
    try {
      await api.put(`/users/${editMember._id}`, { isAlive });
      toast.success(`Marked as ${isAlive ? 'Active Member' : 'Ancestor'}`);
      setEditMember(null);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteMember) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteMember._id}`);
      toast.success(`${deleteMember.name} removed from clan`);
      setDeleteMember(null);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setIsDeleting(false);
    }
  };

  const pages = Math.ceil(total / limit);

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <PageHeader
          title="MEMBERS"
          subtitle={`${total} registered clan members`}
          icon={Users}
          action={
            <button onClick={fetchMembers} className="btn-ghost text-sm flex items-center gap-2">
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          }
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name…"
              className="input-dark pl-9 text-sm"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-1.5">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setRoleFilter(opt.value); setPage(1); }}
                className={cn(
                  'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all',
                  roleFilter === opt.value
                    ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                    : 'text-muted-foreground border border-transparent hover:border-clan-border hover:text-foreground'
                )}
              >
                {opt.icon && <opt.icon size={11} />}
                {opt.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 ml-auto">
            <Filter size={13} className="text-muted-foreground" />
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-lg transition-all',
                  statusFilter === opt.value
                    ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                    : 'text-muted-foreground border border-transparent hover:border-clan-border'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 bg-clan-dark-3 rounded-lg border border-clan-border">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs transition-all',
                  viewMode === v ? 'bg-clan-gold/15 text-clan-gold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v === 'grid' ? '⊞' : '≡'} {v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Members grid / list */}
        {isLoading ? (
          <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4' : 'space-y-2')}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl border border-clan-border p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full shimmer-bg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 shimmer-bg rounded w-3/5" />
                    <div className="h-3 shimmer-bg rounded w-2/5" />
                  </div>
                </div>
                <div className="h-3 shimmer-bg rounded" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members found"
            description="Try adjusting your search or filters."
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {members.map((member, i) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleViewInTree(member)}
                className="glass-panel rounded-2xl border border-clan-border p-5
                           hover:border-clan-gold/25 cursor-pointer transition-all duration-200
                           hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={member.name} role={member.role} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-cinzel text-sm font-semibold text-foreground group-hover:text-clan-gold transition-colors truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email || '—'}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditMember(member); }}
                        className="p-1.5 rounded-lg hover:bg-clan-dark-3 text-muted-foreground hover:text-clan-gold transition-colors"
                        title="Edit member status"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteMember(member); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Remove from clan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {member.role === 'ancestor' || member.isAlive === false ? (
                    <Badge variant="grey">Ancestor</Badge>
                  ) : (
                    <Badge variant={member.role === 'leader' ? 'gold' : member.role === 'admin' ? 'blue' : 'ghost'}>
                      {member.role}
                    </Badge>
                  )}
                  {member.role !== 'ancestor' && member.isAlive !== false && (
                    <Badge variant={statusVariant[member.status] || 'ghost'} dot>
                      {member.status}
                    </Badge>
                  )}
                </div>

                <div className="gold-divider mb-3" />

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Contributions</p>
                    <p className="font-cinzel text-clan-gold text-sm font-semibold mt-0.5">
                      {formatCurrency(member.contributions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-xs text-foreground/80 mt-0.5">{formatDate(member.joinedAt)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List view */
          <Card>
            <CardHeader>
              <CardTitle>All Members</CardTitle>
            </CardHeader>
            <div className="divide-y divide-clan-border/40">
              {members.map((member, i) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleViewInTree(member)}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-clan-dark-3/50 cursor-pointer transition-colors"
                >
                  <Avatar name={member.name} role={member.role} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/90 truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email || '—'}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Badge variant={member.role === 'leader' ? 'gold' : member.role === 'admin' ? 'blue' : 'ghost'}>
                      {member.role}
                    </Badge>
                    <Badge variant={statusVariant[member.status] || 'ghost'} dot>
                      {member.status}
                    </Badge>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="font-cinzel text-sm text-clan-gold/80">{formatCurrency(member.contributions)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(member.joinedAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Pagination
              page={page}
              pages={pages}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </Card>
        )}

        {/* Grid pagination */}
        {viewMode === 'grid' && pages > 1 && (
          <div className="flex justify-center">
            <Pagination page={page} pages={pages} total={total} limit={limit} onPageChange={setPage} />
          </div>
        )}

        {/* Edit Member Modal */}
        {editMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-2xl border border-clan-border p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-clan-gold/20 flex items-center justify-center">
                  <HeartPulse size={18} className="text-clan-gold" />
                </div>
                <div>
                  <h3 className="font-cinzel text-foreground font-semibold">Edit Member Status</h3>
                  <p className="text-xs text-muted-foreground">{editMember.name}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <button
                  onClick={() => handleUpdateIsAlive(true)}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    editMember.isAlive !== false
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-clan-border bg-clan-dark-3 hover:border-clan-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editMember.isAlive !== false ? 'bg-emerald-500/20' : 'bg-clan-dark-4'}`}>
                      <UserIcon size={16} className={editMember.isAlive !== false ? 'text-emerald-400' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${editMember.isAlive !== false ? 'text-emerald-400' : 'text-foreground'}`}>Active Member</p>
                      <p className="text-xs text-muted-foreground">Living member of the clan</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleUpdateIsAlive(false)}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    editMember.isAlive === false
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-clan-border bg-clan-dark-3 hover:border-clan-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editMember.isAlive === false ? 'bg-red-500/20' : 'bg-clan-dark-4'}`}>
                      <HeartPulse size={16} className={editMember.isAlive === false ? 'text-red-400' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${editMember.isAlive === false ? 'text-red-400' : 'text-foreground'}`}>Ancestor</p>
                      <p className="text-xs text-muted-foreground">Passed away - marked as deceased</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setEditMember(null)}
                className="btn-ghost w-full"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteMember}
          title="Remove Member"
          message={`Are you sure you want to remove ${deleteMember?.name} from the clan? This action cannot be undone.`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleDeleteMember}
          onCancel={() => setDeleteMember(null)}
          isLoading={isDeleting}
        />
      </div>
    </AppLayout>
  );
}
