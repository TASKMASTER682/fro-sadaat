'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, User, Check, X, Clock, Star, MessageCircle, Send } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface SpouseSeeker {
  _id: string;
  name: string;
  role: string;
  fatherId: { _id: string; name: string } | null;
  spouseSearchBio: string;
  contributions: number;
  isAlive: boolean;
  gender?: 'male' | 'female';
  myInterest: 'pending' | 'accepted' | 'rejected' | null;
}

export default function SpousePage() {
  const { user } = useAuthStore();
  const [seekers, setSeekers] = useState<SpouseSeeker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeeker, setSelectedSeeker] = useState<SpouseSeeker | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showMyInterests, setShowMyInterests] = useState(false);
  const [myInterests, setMyInterests] = useState<any[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<{ [key: string]: string }>({});
  const [showSuggestionInput, setShowSuggestionInput] = useState<string | null>(null);

  const fetchSeekers = useCallback(async () => {
    const apiModule = (await import('@/lib/api')).default;
    setIsLoading(true);
    try {
      const res = await apiModule.get('/interests/spouse-seekers');
      setSeekers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch seekers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyInterests = useCallback(async () => {
    const apiModule = (await import('@/lib/api')).default;
    try {
      const res = await apiModule.get('/interests');
      setMyInterests(res.data.data.sent);
      setReceivedInterests(res.data.data.received);
    } catch (err) {
      console.error('Failed to fetch interests:', err);
    }
  }, []);

  useEffect(() => {
    fetchSeekers();
    fetchMyInterests();
  }, [fetchSeekers, fetchMyInterests]);

  const handleInterested = async (seeker: SpouseSeeker) => {
    setActionLoading(seeker._id);
    try {
      const res = await api.post('/interests/interested', { toUserId: seeker._id });
      toast.success(`Interest sent to ${seeker.name}`);
      setSeekers(prev =>
        prev.map(s => s._id === seeker._id ? { ...s, myInterest: 'pending' } : s)
      );
      fetchMyInterests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendSuggestion = async (seeker: SpouseSeeker) => {
    const suggestion = suggestions[seeker._id]?.trim();
    if (!suggestion) {
      toast.error('Please write a suggestion first');
      return;
    }
    setActionLoading(seeker._id);
    try {
      await api.post('/interests/suggestion', { toUserId: seeker._id, message: suggestion });
      toast.success(`Suggestion sent to ${seeker.name}`);
      setSuggestions(prev => ({ ...prev, [seeker._id]: '' }));
      setShowSuggestionInput(null);
      fetchMyInterests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send suggestion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelInterest = async (interestId: string) => {
    setActionLoading(interestId);
    try {
      await api.delete(`/interests/${interestId}`);
      toast.success('Interest cancelled');
      setMyInterests(prev => prev.filter(i => i._id !== interestId));
      setReceivedInterests(prev => prev.filter(i => i._id !== interestId));
    } catch (err) {
      toast.error('Failed to cancel interest');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveInterest = async (interestId: string) => {
    setActionLoading(interestId);
    try {
      await api.delete(`/interests/${interestId}`);
      setMyInterests(prev => prev.filter(i => i._id !== interestId));
      setReceivedInterests(prev => prev.filter(i => i._id !== interestId));
    } catch (err) {
      toast.error('Failed to remove');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespond = async (interestId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(interestId);
    try {
      await api.put(`/interests/${interestId}/respond`, { status });
      toast.success(status === 'accepted' ? 'Interest accepted! Parents have been notified.' : 'Interest rejected');
      setReceivedInterests(prev => prev.filter(i => i._id !== interestId));
    } catch (err) {
      toast.error('Failed to respond');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSeekers = seekers.filter(s =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.fatherId?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-cinzel text-2xl md:text-3xl text-rose-400 font-bold tracking-wider">
                  FINDING SPOUSE
                </h1>
                <p className="text-muted-foreground text-sm">Members open for alliance</p>
              </div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-rose-500/50 via-rose-500/20 to-transparent mt-4" />
          </motion.div>

          {/* Stats & Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowMyInterests(false)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  !showMyInterests
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-clan-dark-3 text-muted-foreground border border-clan-border'
                )}
              >
                Open for Spouse ({seekers.length})
              </button>
              <button
                onClick={() => setShowMyInterests(true)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  showMyInterests
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-clan-dark-3 text-muted-foreground border border-clan-border'
                )}
              >
                My Interests ({myInterests.length})
                {receivedInterests.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-xs">
                    {receivedInterests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Search */}
            {!showMyInterests && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or father's name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-clan-dark-3 border border-clan-border 
                             text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                />
              </div>
            )}
          </motion.div>

          {/* Content */}
          {showMyInterests ? (
            <div className="space-y-6">
              {/* Received Interests */}
              {receivedInterests.length > 0 && (
                <div>
                  <h3 className="font-cinzel text-rose-400 text-sm tracking-wider mb-3 flex items-center justify-between">
                    <span>INTERESTS RECEIVED ({receivedInterests.length})</span>
                    <button
                      onClick={async () => {
                        for (const i of receivedInterests) {
                          await handleRemoveInterest(i._id);
                        }
                      }}
                      className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      Clear All
                    </button>
                  </h3>
                  <div className="grid gap-3">
                    {receivedInterests.map((interest) => (
                      <motion.div
                        key={interest._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel rounded-xl p-4 border border-rose-500/20 relative"
                      >
                        <button
                          onClick={() => handleRemoveInterest(interest._id)}
                          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-clan-dark-3 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Remove from list"
                        >
                          <X size={14} />
                        </button>
                        <div className="flex items-start gap-4">
                          <Avatar name={interest.fromUser?.name || ''} role={interest.fromUser?.role || 'member'} size="md" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{interest.fromUser?.name}</h4>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-medium',
                                interest.status === 'pending' && 'bg-amber-500/20 text-amber-400',
                                interest.status === 'accepted' && 'bg-emerald-500/20 text-emerald-400',
                                interest.status === 'rejected' && 'bg-slate-500/20 text-slate-400'
                              )}>
                                {interest.status.toUpperCase()}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-medium',
                                interest.type === 'pin' && 'bg-amber-500/20 text-amber-400',
                                interest.type === 'interested' && 'bg-rose-500/20 text-rose-400',
                                interest.type === 'suggestion' && 'bg-emerald-500/20 text-emerald-400'
                              )}>
                                {interest.type === 'pin' ? 'PIN' : interest.type === 'suggestion' ? 'SUGGESTION' : 'INTERESTED'}
                              </span>
                            </div>
                            {interest.message && (
                              <p className="text-sm text-muted-foreground mt-1">{interest.message}</p>
                            )}
                            {interest.status === 'pending' && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleRespond(interest._id, 'accepted')}
                                  disabled={actionLoading === interest._id}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Check size={12} /> Accept
                                </button>
                                <button
                                  onClick={() => handleRespond(interest._id, 'rejected')}
                                  disabled={actionLoading === interest._id}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <X size={12} /> Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sent Interests */}
              {myInterests.length > 0 && (
                <div>
                  <h3 className="font-cinzel text-clan-gold text-sm tracking-wider mb-3 flex items-center justify-between">
                    <span>YOUR INTERESTS SENT ({myInterests.length})</span>
                    <button
                      onClick={async () => {
                        for (const i of myInterests) {
                          await handleRemoveInterest(i._id);
                        }
                      }}
                      className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      Clear All
                    </button>
                  </h3>
                  <div className="grid gap-3">
                    {myInterests.map((interest) => (
                      <motion.div
                        key={interest._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel rounded-xl p-4 border border-clan-border relative"
                      >
                        <button
                          onClick={() => handleRemoveInterest(interest._id)}
                          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-clan-dark-3 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Remove from list"
                        >
                          <X size={14} />
                        </button>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar name={interest.toUser?.name || ''} role={interest.toUser?.role || 'member'} size="md" />
                            <div>
                              <h4 className="font-medium text-foreground">{interest.toUser?.name}</h4>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-medium',
                                interest.status === 'pending' && 'bg-amber-500/20 text-amber-400',
                                interest.status === 'accepted' && 'bg-emerald-500/20 text-emerald-400',
                                interest.status === 'rejected' && 'bg-slate-500/20 text-slate-400'
                              )}>
                                {interest.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {interest.status === 'pending' && (
                            <button
                              onClick={() => handleCancelInterest(interest._id)}
                              disabled={actionLoading === interest._id}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {actionLoading === interest._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {receivedInterests.length === 0 && myInterests.length === 0 && (
                <div className="text-center py-20">
                  <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No interests yet.</p>
                </div>
              )}
            </div>
          ) : (
            /* Seekers Grid */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-20">
                  <div className="w-10 h-10 rounded-full border-2 border-rose-400/20 border-t-rose-400 animate-spin" />
                </div>
              ) : filteredSeekers.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No seekers found matching your search.' : 'No members open for spouse search yet.'}
                  </p>
                </div>
              ) : (
                filteredSeekers.map((seeker, index) => (
                  <motion.div
                    key={seeker._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedSeeker(seeker)}
                    className={cn(
                      'glass-panel rounded-2xl p-5 cursor-pointer transition-all duration-300',
                      'border hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10',
                      'hover:scale-[1.02]',
                      selectedSeeker?._id === seeker._id && 'border-rose-500/50 bg-rose-500/5'
                    )}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-cinzel',
                        'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg'
                      )}>
                        {seeker.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{seeker.name}</h3>
                        {seeker.fatherId && (
                          <p className="text-xs text-muted-foreground truncate">
                            {seeker.gender === 'female' ? 'Daughter' : 'Son'} of: {seeker.fatherId.name}
                          </p>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          OPEN FOR SPOUSE
                        </span>
                      </div>
                    </div>

                    {seeker.spouseSearchBio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        "{seeker.spouseSearchBio}"
                      </p>
                    )}

                    {showSuggestionInput === seeker._id ? (
                      <div className="pt-3 border-t border-clan-border/50 space-y-2">
                        <textarea
                          className="input-dark w-full text-xs resize-none"
                          placeholder="Write your suggestion (max 50 words)..."
                          rows={2}
                          value={suggestions[seeker._id] || ''}
                          onChange={(e) => setSuggestions(prev => ({ ...prev, [seeker._id]: e.target.value }))}
                          maxLength={250}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSendSuggestion(seeker); }}
                            disabled={actionLoading === seeker._id || !suggestions[seeker._id]?.trim()}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            <Send size={12} /> Send
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowSuggestionInput(null); }}
                            className="px-3 py-1.5 rounded-lg bg-clan-dark-3 text-muted-foreground text-xs hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-3 border-t border-clan-border/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3" />
                          {seeker.contributions} contributions
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowSuggestionInput(seeker._id); }}
                            className="px-2 py-1 rounded-lg bg-clan-dark-3 text-muted-foreground text-[10px] font-medium hover:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1"
                            title="Send suggestion"
                          >
                            <MessageCircle size={12} />
                            Suggest
                          </button>

                          {seeker.myInterest ? (
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              seeker.myInterest === 'pending' && 'bg-amber-500/20 text-amber-400',
                              seeker.myInterest === 'accepted' && 'bg-emerald-500/20 text-emerald-400',
                              seeker.myInterest === 'rejected' && 'bg-slate-500/20 text-slate-400'
                            )}>
                              {seeker.myInterest === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                              {seeker.myInterest === 'accepted' && <Check className="w-3 h-3 inline mr-1" />}
                              {seeker.myInterest.toUpperCase()}
                            </span>
                          ) : user?.gender !== seeker.gender ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleInterested(seeker); }}
                              disabled={actionLoading === seeker._id}
                              className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {actionLoading === seeker._id ? (
                                <div className="w-3 h-3 rounded-full border border-rose-400/30 border-t-rose-400 animate-spin" />
                              ) : (
                                <Heart className="w-3 h-3" />
                              )}
                              Interested
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Same gender</span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSeeker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedSeeker(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel rounded-2xl p-6 max-w-md w-full border border-rose-500/30"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-2xl font-bold font-cinzel text-white shadow-lg shadow-rose-500/30 mb-4">
                {selectedSeeker.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-foreground">{selectedSeeker.name}</h2>
              {selectedSeeker.fatherId && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSeeker.gender === 'female' ? 'Daughter' : 'Son'} of {selectedSeeker.fatherId.name}
                </p>
              )}
            </div>

            {selectedSeeker.spouseSearchBio && (
              <div className="bg-clan-dark-3/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs text-rose-400 font-medium uppercase tracking-wider">About</span>
                </div>
                <p className="text-sm text-foreground">{selectedSeeker.spouseSearchBio}</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 text-clan-gold" />
                {selectedSeeker.contributions} contributions
              </div>
              {selectedSeeker?.myInterest ? (
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  selectedSeeker.myInterest === 'pending' && 'bg-amber-500/20 text-amber-400',
                  selectedSeeker.myInterest === 'accepted' && 'bg-emerald-500/20 text-emerald-400',
                  selectedSeeker.myInterest === 'rejected' && 'bg-slate-500/20 text-slate-400'
                )}>
                  {selectedSeeker.myInterest.toUpperCase()}
                </span>
              ) : user?.gender !== selectedSeeker?.gender ? (
                <button
                  onClick={() => handleInterested(selectedSeeker)}
                  disabled={actionLoading === selectedSeeker._id}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Heart className="w-4 h-4" />
                  Express Interest
                </button>
              ) : (
                <span className="text-sm text-muted-foreground italic">Same gender - cannot express interest</span>
              )}
            </div>

            <button
              onClick={() => setSelectedSeeker(null)}
              className="w-full py-2.5 rounded-xl bg-clan-dark-3 border border-clan-border text-foreground hover:border-rose-500/30 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AppLayout>
  );
}
