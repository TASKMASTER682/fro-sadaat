'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Shield, User, Users, Loader2, ChevronRight, Check, X, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { useAuthStore } from '@/hooks/useAuth';
import { User as UserType } from '@/types';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RoleManagementPage() {
  const router = useRouter();
  const { user, isInitialized, updateUser } = useAuthStore();
  const [members, setMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && user && !['admin', 'leader', 'scholar'].includes(user.role)) {
      router.replace('/dashboard');
      return;
    }
    fetchMembers();
  }, [user, isInitialized, router]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/all');
      setMembers(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const passLeadership = async (targetId: string, targetName: string) => {
    if (!confirm(`Are you sure you want to pass leadership to ${targetName}? You will become an admin.`)) return;
    
    setProcessing(targetId);
    try {
      await api.post(`/users/${targetId}/pass-leadership`);
      toast.success(`Leadership passed to ${targetName}`);
      // Update current user state
      updateUser({ ...user!, role: 'admin' });
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pass leadership');
    } finally {
      setProcessing(null);
    }
  };

  const allotAdmin = async (targetId: string, targetName: string) => {
    setProcessing(targetId);
    try {
      await api.post(`/users/${targetId}/allot-admin`);
      toast.success(`Admin role allotted to ${targetName}`);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to allot admin role');
    } finally {
      setProcessing(null);
    }
  };

  const removeAdmin = async (targetId: string, targetName: string) => {
    if (!confirm(`Remove admin role from ${targetName}? They will become a regular member.`)) return;
    
    setProcessing(targetId);
    try {
      await api.post(`/users/${targetId}/remove-admin`);
      toast.success(`Admin role removed from ${targetName}`);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove admin role');
    } finally {
      setProcessing(null);
    }
  };

  const allotScholar = async (targetId: string, targetName: string) => {
    setProcessing(targetId);
    try {
      await api.post(`/users/${targetId}/allot-scholar`);
      toast.success(`Scholar role allotted to ${targetName}`);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to allot scholar role');
    } finally {
      setProcessing(null);
    }
  };

  const removeScholar = async (targetId: string, targetName: string) => {
    if (!confirm(`Remove scholar role from ${targetName}? They will become a regular member.`)) return;
    
    setProcessing(targetId);
    try {
      await api.post(`/users/${targetId}/remove-scholar`);
      toast.success(`Scholar role removed from ${targetName}`);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove scholar role');
    } finally {
      setProcessing(null);
    }
  };

  const deleteMember = async (targetId: string, targetName: string) => {
    if (!confirm(`Delete ${targetName} from the clan? This action cannot be undone.`)) return;
    
    setProcessing(targetId);
    try {
      await api.delete(`/users/${targetId}`);
      toast.success(`${targetName} has been removed from the clan.`);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    } finally {
      setProcessing(null);
    }
  };

  const activeMembers = members.filter(m => m.status === 'active' && m.role !== 'leader');
  const currentLeader = members.find(m => m.role === 'leader');
  const admins = members.filter(m => m.role === 'admin');
  const scholars = members.filter(m => m.role === 'scholar');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'leader':
        return { icon: Crown, class: 'bg-clan-gold/15 text-clan-gold border-clan-gold/30', label: 'Leader' };
      case 'admin':
        return { icon: Shield, class: 'bg-blue-500/15 text-blue-400 border-blue-500/30', label: 'Admin' };
      case 'scholar':
        return { icon: User, class: 'bg-purple-500/15 text-purple-400 border-purple-500/30', label: 'Scholar' };
      default:
        return { icon: Users, class: 'bg-gray-500/15 text-gray-400 border-gray-500/30', label: 'Member' };
    }
  };

  if (!user || !['admin', 'leader', 'scholar'].includes(user.role)) return null;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <PageHeader
          title="ROLE MANAGEMENT"
          subtitle="Pass leadership and manage admin roles"
          icon={Crown}
        />

        {/* Current Leadership */}
        {currentLeader && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 border border-clan-gold/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg shadow-clan-gold/20">
                <Crown size={28} className="text-clan-black" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-clan-gold/60 uppercase tracking-wider mb-1">Current Leader</p>
                <h2 className="font-cinzel text-xl text-clan-gold font-bold">{currentLeader.name}</h2>
                <p className="text-sm text-muted-foreground">{currentLeader.email}</p>
              </div>
              {user.role === 'leader' && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-2">You are the leader</p>
                  <p className="text-xs text-clan-gold/60">Select a member below to pass leadership</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Admins Section */}
        {(admins.length > 0 || user.role !== 'scholar') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel text-sm text-blue-400 tracking-wider flex items-center gap-2">
                <Shield size={16} />
                ADMINISTRATORS
              </h3>
              {user.role === 'leader' && (
                <span className="text-xs text-muted-foreground">Can allot or remove admin roles</span>
              )}
              {user.role === 'scholar' && (
                <span className="text-xs text-muted-foreground">Scholar role</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map(admin => (
                <div key={admin._id} className="glass-panel rounded-xl p-4 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-cinzel">
                      {admin.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{admin.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                    </div>
                    {user.role === 'leader' && (
                      <button
                        onClick={() => removeAdmin(admin._id, admin.name)}
                        disabled={processing === admin._id}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove Admin"
                      >
                        {processing === admin._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Admin Card - Leader/Scholar can allot */}
              {user.role !== 'scholar' && (
                <div className="glass-panel rounded-xl p-4 border border-dashed border-blue-500/30 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">Select a member below to allot admin role</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Scholars Section */}
        {scholars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-cinzel text-sm text-purple-400 tracking-wider flex items-center gap-2">
              <User size={16} />
              SCHOLARS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scholars.map(scholar => (
                <div key={scholar._id} className="glass-panel rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold font-cinzel">
                      {scholar.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{scholar.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{scholar.email}</p>
                    </div>
                    {user.role === 'leader' && (
                      <button
                        onClick={() => removeScholar(scholar._id, scholar.name)}
                        disabled={processing === scholar._id}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove Scholar"
                      >
                        {processing === scholar._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Members for Role Management */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="font-cinzel text-sm text-clan-gold/60 tracking-wider flex items-center gap-2">
            <Users size={16} />
            ALL MEMBERS - ROLE MANAGEMENT
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-clan-gold animate-spin" />
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-clan-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-clan-border bg-clan-dark-3/50">
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-4 py-3">Member</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-4 py-3">Gender</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-4 py-3">Current Role</th>
                      <th className="text-right text-xs text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members
                      .filter(m => m.status === 'active' && m.role !== 'leader' && m.isAlive !== false && !m.isStatic)
                      .map(member => {
                      const badge = getRoleBadge(member.role);
                      const BadgeIcon = badge.icon;
                      const isFemale = member.gender === 'female';
                      return (
                        <tr key={member._id} className="border-b border-clan-border/50 hover:bg-clan-dark-3/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-cinzel', isFemale ? 'bg-pink-500/20 text-pink-400' : 'bg-clan-dark-3 text-clan-gold/70')}>
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', isFemale ? 'bg-pink-500/15 text-pink-400' : 'bg-blue-500/15 text-blue-400')}>
                              {isFemale ? '♀ Female' : '♂ Male'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', badge.class)}>
                              <BadgeIcon size={12} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Leader can pass leadership */}
                              {user.role === 'leader' && (
                                <button
                                  onClick={() => passLeadership(member._id, member.name)}
                                  disabled={processing === member._id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-clan-gold/15 text-clan-gold border border-clan-gold/30 hover:bg-clan-gold/25 transition-colors disabled:opacity-50 flex items-center gap-1"
                                  title="Pass Leadership"
                                >
                                  <Crown size={12} />
                                  Make Leader
                                </button>
                              )}
                              {/* Scholar/Leader can allot admin */}
                              {user.role !== 'scholar' && member.role !== 'admin' && (
                                <button
                                  onClick={() => allotAdmin(member._id, member.name)}
                                  disabled={processing === member._id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors disabled:opacity-50 flex items-center gap-1"
                                  title="Allot Admin"
                                >
                                  <Shield size={12} />
                                  Make Admin
                                </button>
                              )}
                              {/* Leader can remove admin */}
                              {user.role === 'leader' && member.role === 'admin' && (
                                <button
                                  onClick={() => removeAdmin(member._id, member.name)}
                                  disabled={processing === member._id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50 flex items-center gap-1"
                                  title="Remove Admin"
                                >
                                  <X size={12} />
                                  Remove Admin
                                </button>
                              )}
                              {/* Leader can allot scholar */}
                              {user.role === 'leader' && member.role === 'member' && (
                                <button
                                  onClick={() => allotScholar(member._id, member.name)}
                                  disabled={processing === member._id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-colors disabled:opacity-50 flex items-center gap-1"
                                  title="Allot Scholar"
                                >
                                  <User size={12} />
                                  Make Scholar
                                </button>
                              )}
                              {/* Leader can remove scholar */}
                              {user.role === 'leader' && member.role === 'scholar' && (
                                <button
                                  onClick={() => removeScholar(member._id, member.name)}
                                  disabled={processing === member._id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50 flex items-center gap-1"
                                  title="Remove Scholar"
                                >
                                  <X size={12} />
                                  Remove Scholar
                                </button>
                              )}
                              {/* Leader can delete member */}
                              {user.role === 'leader' && (
                                <button
                                  onClick={() => deleteMember(member._id, member.name)}
                                  disabled={processing === member._id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/15 text-red-300 border border-red-600/30 hover:bg-red-600/25 transition-colors disabled:opacity-50 flex items-center gap-1"
                                  title="Delete Member"
                                >
                                  <Trash2 size={12} />
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {members.filter(m => m.status === 'active' && m.role !== 'leader').length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          No eligible members found for role management.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
