'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Heart, Crown, Star, Search, Filter, X, ExternalLink, HeartPulse, UserCircle, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Lady {
  _id: string;
  name: string;
  fatherName: string | null;
  husbandName: string | null;
  status: 'active' | 'deceased' | 'ancestor';
  role: string;
  isAlive?: boolean;
  isStatic?: boolean;
  joinedAt?: string;
  gender?: string;
  bio?: string;
  description?: string;
}

export default function LadiesPage() {
  const { user } = useAuthStore();
  const [ladies, setLadies] = useState<Lady[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deceased' | 'ancestor'>('all');
  const [selectedLady, setSelectedLady] = useState<Lady | null>(null);
  const [editLady, setEditLady] = useState<Lady | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLadies = useCallback(async () => {
    const api = (await import('@/lib/api')).default;
    setIsLoading(true);
    try {
      const res = await api.get('/tree/females');
      setLadies(res.data.data);
    } catch (err) {
      console.error('Failed to fetch ladies:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLadies(); }, [fetchLadies]);

  const handleUpdateIsAlive = async (isAlive: boolean) => {
    if (!editLady) return;
    const api = (await import('@/lib/api')).default;
    setIsUpdating(true);
    try {
      await api.put(`/users/${editLady._id}`, { isAlive });
      toast.success(`Marked as ${isAlive ? 'Active Member' : 'Ancestor'}`);
      setEditLady(null);
      fetchLadies();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (ladyId: string, ladyName: string) => {
    const api = (await import('@/lib/api')).default;
    if (!confirm(`Delete ${ladyName} from the clan? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${ladyId}`);
      toast.success(`${ladyName} has been removed from the clan.`);
      fetchLadies();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const canManage = ['admin', 'leader'].includes(user?.role || '');

  const filteredLadies = ladies.filter(lady => {
    const matchesSearch = !searchQuery || 
      lady.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lady.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lady.husbandName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lady.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'deceased':
        return { label: 'Deceased', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
      case 'ancestor':
        return { label: 'Ancestor', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      default:
        return { label: status, className: 'bg-pink-500/20 text-pink-400 border-pink-500/30' };
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-clan-black p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-cinzel text-2xl md:text-3xl text-pink-400 font-bold tracking-wider">
                  SAYED ZADI
                </h1>
                <p className="text-muted-foreground text-sm">Female Members of the Clan</p>
              </div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-pink-500/50 via-pink-500/20 to-transparent mt-4" />
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            <div className="glass-panel px-4 py-3 rounded-xl border border-pink-500/10">
              <p className="text-pink-400/60 text-xs uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-pink-400 font-cinzel">{ladies.length}</p>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border border-emerald-500/10">
              <p className="text-emerald-400/60 text-xs uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-emerald-400 font-cinzel">
                {ladies.filter(l => l.status === 'active').length}
              </p>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border border-amber-500/10">
              <p className="text-amber-400/60 text-xs uppercase tracking-wider">Ancestors</p>
              <p className="text-2xl font-bold text-amber-400 font-cinzel">
                {ladies.filter(l => l.status === 'ancestor').length}
              </p>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border border-slate-500/10">
              <p className="text-slate-400/60 text-xs uppercase tracking-wider">Deceased</p>
              <p className="text-2xl font-bold text-slate-400 font-cinzel">
                {ladies.filter(l => l.status === 'deceased').length}
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, father, or husband..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-clan-dark-3 border border-clan-border 
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20
                           transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'ancestor', 'deceased'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    statusFilter === status
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      : 'bg-clan-dark-3 text-muted-foreground border border-clan-border hover:border-pink-500/30'
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-2 border-pink-400/20 border-t-pink-400 animate-spin" />
            </div>
          ) : filteredLadies.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No ladies found matching your filters.' 
                  : 'No ladies registered yet.'}
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredLadies.map((lady, index) => {
                const statusBadge = getStatusBadge(lady.status);
                return (
                  <motion.div
                    key={lady._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'glass-panel rounded-2xl p-5 transition-all duration-300',
                      'border hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/10',
                      'hover:scale-[1.02]'
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-cinzel',
                        'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg'
                      )}>
                        {lady.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{lady.name}</h3>
                        <span className={cn(
                          'inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                          statusBadge.className
                        )}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Connections */}
                    <div className="space-y-2">
                      {lady.fatherName && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Father:</span>{' '}
                            {lady.fatherName}
                          </span>
                        </div>
                      )}
                      {lady.husbandName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Husband:</span>{' '}
                            {lady.husbandName}
                          </span>
                        </div>
                      )}
                      {!lady.fatherName && !lady.husbandName && (
                        <p className="text-xs text-muted-foreground/50 italic">No connections added</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-clan-border/50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLady(lady);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 transition-colors"
                      >
                        View Details
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditLady(lady);
                            }}
                            className="px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
                            title="Change Status"
                          >
                            <UserCircle size={14} />
                          </button>
                          {['leader', 'scholar'].includes(user?.role || '') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(lady._id, lady.name);
                              }}
                              className="px-3 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedLady(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel rounded-2xl p-6 max-w-md w-full border border-pink-500/30"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl font-bold font-cinzel text-white shadow-lg shadow-pink-500/30 mb-4">
                {selectedLady.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-foreground">{selectedLady.name}</h2>
              <span className={cn(
                'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border',
                getStatusBadge(selectedLady.status).className
              )}>
                {getStatusBadge(selectedLady.status).label}
              </span>
            </div>

            <div className="space-y-4">
              {selectedLady.fatherName && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-clan-dark-3/50">
                  <User className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Father</p>
                    <p className="text-foreground font-medium">{selectedLady.fatherName}</p>
                  </div>
                </div>
              )}
              {selectedLady.husbandName && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-clan-dark-3/50">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Husband</p>
                    <p className="text-foreground font-medium">{selectedLady.husbandName}</p>
                  </div>
                </div>
              )}
              {(selectedLady.bio || selectedLady.description) && (
                <>
                  <div className="h-[1px] bg-gradient-to-r from-pink-500/30 via-pink-500/10 to-transparent" />
                  {selectedLady.bio && (
                    <div className="p-3 rounded-xl bg-clan-dark-3/50">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Short Bio</p>
                      <p className="text-sm text-foreground/90">{selectedLady.bio}</p>
                    </div>
                  )}
                  {selectedLady.description && (
                    <div className="p-3 rounded-xl bg-clan-dark-3/50">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{selectedLady.description}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => setSelectedLady(null)}
              className="w-full mt-6 py-2.5 rounded-xl bg-clan-dark-3 border border-clan-border text-foreground hover:border-pink-500/30 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Status Edit Modal */}
      <AnimatePresence>
        {editLady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditLady(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel rounded-2xl p-6 w-full max-w-md border border-clan-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-cinzel text-lg text-clan-gold mb-1">Change Member Status</h3>
              <p className="text-sm text-muted-foreground mb-5">Update status for {editLady.name}</p>

              <div className="space-y-3 mb-5">
                <button
                  onClick={() => handleUpdateIsAlive(true)}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    editLady.isAlive !== false
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-clan-border bg-clan-dark-3 hover:border-clan-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editLady.isAlive !== false ? 'bg-emerald-500/20' : 'bg-clan-dark-4'}`}>
                      <User size={16} className={editLady.isAlive !== false ? 'text-emerald-400' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${editLady.isAlive !== false ? 'text-emerald-400' : 'text-foreground'}`}>Active Member</p>
                      <p className="text-xs text-muted-foreground">Living member of the clan</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleUpdateIsAlive(false)}
                  disabled={isUpdating}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    editLady.isAlive === false
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-clan-border bg-clan-dark-3 hover:border-clan-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editLady.isAlive === false ? 'bg-red-500/20' : 'bg-clan-dark-4'}`}>
                      <HeartPulse size={16} className={editLady.isAlive === false ? 'text-red-400' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${editLady.isAlive === false ? 'text-red-400' : 'text-foreground'}`}>Ancestor</p>
                      <p className="text-xs text-muted-foreground">Passed away - marked as deceased</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setEditLady(null)}
                className="w-full py-2.5 rounded-xl bg-clan-dark-3 border border-clan-border text-foreground hover:border-pink-500/30 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
