'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, ChevronDown, X, Check, UserCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Avatar from '@/components/ui/Avatar';
import { UserRole } from '@/types';
import { useAuthStore } from '@/hooks/useAuth';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FatherOption {
  _id: string;
  name: string;
  role: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fatherSearch, setFatherSearch] = useState('');
  const [fatherResults, setFatherResults] = useState<FatherOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [showFatherDropdown, setShowFatherDropdown] = useState(false);
  const [husbandSearch, setHusbandSearch] = useState('');
  const [husbandResults, setHusbandResults] = useState<FatherOption[]>([]);
  const [showHusbandDropdown, setShowHusbandDropdown] = useState(false);
  const [husbandType, setHusbandType] = useState<'same_clan' | 'outside'>('same_clan');
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    description: '',
    fatherId: '',
    fatherName: '',
    husbandId: '',
    husbandName: '',
    isOpenForSpouse: false,
    spouseSearchBio: '',
  });

  const isFemale = (user as any)?.gender === 'female';

  useEffect(() => {
    if (user) {
      const fatherId = typeof user.fatherId === 'object' && user.fatherId 
        ? (user.fatherId as any)._id 
        : user.fatherId || '';
      const fatherName = typeof user.fatherId === 'object' && user.fatherId 
        ? (user.fatherId as any).name 
        : '';
      
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        description: user.description || '',
        fatherId,
        fatherName,
        husbandId: (user as any).husbandId || '',
        husbandName: (user as any).husbandName || '',
        isOpenForSpouse: (user as any).isOpenForSpouse || false,
        spouseSearchBio: (user as any).spouseSearchBio || '',
      });
    }
  }, [user]);

  const searchFather = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setFatherResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/auth/search-father?q=${encodeURIComponent(query)}`);
      setFatherResults(res.data.data);
    } catch {
      // Silently fail
    } finally {
      setSearching(false);
    }
  };

  const searchHusband = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setHusbandResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/auth/search-father?q=${encodeURIComponent(query)}`);
      setHusbandResults(res.data.data);
    } catch {
      // Silently fail
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fatherSearch) searchFather(fatherSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [fatherSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (husbandSearch && husbandType === 'same_clan') searchHusband(husbandSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [husbandSearch, husbandType]);

  const selectFather = (father: FatherOption) => {
    setForm({ ...form, fatherId: father._id, fatherName: father.name });
    setShowFatherDropdown(false);
    setFatherSearch('');
    setFatherResults([]);
  };

  const selectHusband = (husband: FatherOption) => {
    setForm({ ...form, husbandId: husband._id, husbandName: husband.name });
    setShowHusbandDropdown(false);
    setHusbandSearch('');
    setHusbandResults([]);
  };

  const clearFather = () => {
    setForm({ ...form, fatherId: '', fatherName: '' });
  };

  const clearHusband = () => {
    setForm({ ...form, husbandId: '', husbandName: '' });
    setHusbandSearch('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        description: form.description,
        fatherId: form.fatherId || null,
        isOpenForSpouse: form.isOpenForSpouse,
        spouseSearchBio: form.spouseSearchBio,
      };

      if (isFemale) {
        if (husbandType === 'outside') {
          payload.husbandName = form.husbandName;
          payload.husbandId = null;
        } else {
          payload.husbandId = form.husbandId || null;
          payload.husbandName = form.husbandName;
        }
      }

      const res = await api.put(`/users/${user?._id}`, payload);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 md:space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-wider">MY PROFILE</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your personal information</p>
          <div className="gold-divider mt-3" />
        </motion.div>

        {/* Profile Header */}
        <div className="glass-panel rounded-2xl border border-clan-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.name || ''} role={user?.role || 'member'} size="lg" />
            <div>
              <h2 className="font-cinzel text-xl text-foreground font-semibold">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground text-sm capitalize">{user?.role}</p>
                {isFemale && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
                    Female ♀
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-clan-dark-3 rounded-lg p-3">
              <p className="text-muted-foreground text-xs mb-1">Email</p>
              <p className="text-foreground">{user?.email || 'Not provided'}</p>
            </div>
            <div className="bg-clan-dark-3 rounded-lg p-3">
              <p className="text-muted-foreground text-xs mb-1">Joined</p>
              <p className="text-foreground">{formatDate(user?.joinedAt || '')}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="glass-panel rounded-2xl border border-clan-border p-6 space-y-5">
          <h3 className="font-cinzel text-clan-gold text-sm tracking-wider">EDIT PROFILE</h3>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Full Name *</label>
            <input
              className="input-dark w-full"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Phone Number</label>
            <input
              className="input-dark w-full"
              placeholder="Your phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {isFemale && (
            <>
              {/* Father Section - Read Only */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Father (from registration)</label>
                <div className="bg-clan-dark-3 rounded-lg p-3 border border-clan-border">
                  <p className="text-foreground">{form.fatherName || 'Not connected'}</p>
                </div>
              </div>

              {/* Husband Section */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Husband</label>
                
                {/* Husband Type Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setHusbandType('same_clan'); setForm({ ...form, husbandName: '' }); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                      husbandType === 'same_clan'
                        ? 'bg-pink-500/15 text-pink-400 border-pink-500/30'
                        : 'bg-clan-dark-3 text-muted-foreground border-clan-border hover:border-pink-500/30'
                    }`}
                  >
                    Same Clan
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHusbandType('outside'); setForm({ ...form, husbandId: '' }); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                      husbandType === 'outside'
                        ? 'bg-pink-500/15 text-pink-400 border-pink-500/30'
                        : 'bg-clan-dark-3 text-muted-foreground border-clan-border hover:border-pink-500/30'
                    }`}
                  >
                    Outside Clan
                  </button>
                </div>

                {husbandType === 'same_clan' ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowHusbandDropdown(!showHusbandDropdown)}
                      className="input-dark w-full flex items-center justify-between text-left"
                    >
                      <span className={form.husbandName ? 'text-foreground' : 'text-muted-foreground'}>
                        {form.husbandName || 'Select husband from clan...'}
                      </span>
                      <div className="flex items-center gap-1">
                        {form.husbandName && (
                          <X 
                            size={14} 
                            className="text-muted-foreground hover:text-red-400" 
                            onClick={(e) => { e.stopPropagation(); clearHusband(); }}
                          />
                        )}
                        <ChevronDown size={14} className="text-muted-foreground" />
                      </div>
                    </button>

                    {showHusbandDropdown && (
                      <div className="absolute z-20 mt-1 w-full glass-panel border border-clan-border rounded-lg shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-clan-border/50">
                          <input
                            className="input-dark w-full text-sm py-2"
                            placeholder="Search husband by name..."
                            value={husbandSearch}
                            onChange={(e) => setHusbandSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scroll">
                          {husbandResults.length > 0 || searching ? (
                            husbandResults.map((h) => (
                              <button
                                key={h._id}
                                type="button"
                                onClick={() => selectHusband(h)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-clan-dark-3 transition-colors text-left',
                                  form.husbandId === h._id && 'bg-clan-gold/10'
                                )}
                              >
                                <Avatar name={h.name} role={h.role as UserRole} size="sm" />
                                <div className="flex-1">
                                  <p className="text-sm text-foreground">{h.name}</p>
                                  <p className="text-[10px] text-muted-foreground capitalize">{h.role}</p>
                                </div>
                                {form.husbandId === h._id && (
                                  <Check size={14} className="text-clan-gold" />
                                )}
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              {searching ? 'Searching...' : 'Type at least 2 characters to search'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      className="input-dark w-full"
                      placeholder="Enter husband's full name..."
                      value={form.husbandName}
                      onChange={(e) => setForm({ ...form, husbandName: e.target.value, husbandId: '' })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the name of your husband from outside the clan
                    </p>
                  </div>
                )}

                {form.husbandName && (
                  <p className="text-xs text-pink-400 mt-1 flex items-center gap-1">
                    <Check size={12} />
                    Husband: {form.husbandName}
                  </p>
                )}
              </div>
            </>
          )}

          {!isFemale && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Father in Family Tree</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFatherDropdown(!showFatherDropdown)}
                  className="input-dark w-full flex items-center justify-between text-left"
                >
                  <span className={form.fatherName ? 'text-foreground' : 'text-muted-foreground'}>
                    {form.fatherName || 'Select father from tree...'}
                  </span>
                  <div className="flex items-center gap-1">
                    {form.fatherName && (
                      <X 
                        size={14} 
                        className="text-muted-foreground hover:text-red-400" 
                        onClick={(e) => { e.stopPropagation(); clearFather(); }}
                      />
                    )}
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </div>
                </button>

                {showFatherDropdown && (
                  <div className="absolute z-20 mt-1 w-full glass-panel border border-clan-border rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-clan-border/50">
                      <input
                        className="input-dark w-full text-sm py-2"
                        placeholder="Search father by name..."
                        value={fatherSearch}
                        onChange={(e) => setFatherSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scroll">
                      {fatherResults.length > 0 || searching ? (
                        fatherResults.map((f) => (
                          <button
                            key={f._id}
                            type="button"
                            onClick={() => selectFather(f)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-clan-dark-3 transition-colors text-left',
                              form.fatherId === f._id && 'bg-clan-gold/10'
                            )}
                          >
                            <Avatar name={f.name} role={f.role as UserRole} size="sm" />
                            <div className="flex-1">
                              <p className="text-sm text-foreground">{f.name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">{f.role}</p>
                            </div>
                            {form.fatherId === f._id && (
                              <Check size={14} className="text-clan-gold" />
                            )}
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          {searching ? 'Searching...' : 'Type at least 2 characters to search'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {form.fatherName && (
                <p className="text-xs text-emerald-400 mt-1">
                  ✓ Selected: {form.fatherName}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Short Bio</label>
            <input
              className="input-dark w-full"
              placeholder="A brief intro about yourself"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Description</label>
            <textarea
              className="input-dark w-full min-h-[120px] resize-y"
              placeholder="Tell us more about yourself..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">{form.description.length}/1000</p>
          </div>

          {(
            <div className="border-t border-clan-border/50 pt-5 mt-5">
              <h4 className="font-cinzel text-clan-gold text-xs tracking-wider mb-4">SPOUSE SEARCH SETTINGS</h4>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-clan-dark-3 border border-clan-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Open for Spouse Search</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show your profile in the Finding Spouse list so others can express interest
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isOpenForSpouse: !form.isOpenForSpouse })}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors duration-200 ml-4',
                    form.isOpenForSpouse ? 'bg-emerald-500' : 'bg-clan-dark-4'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                      form.isOpenForSpouse ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
              </div>

              {form.isOpenForSpouse && (
                <div className="mt-4">
                  <label className="block text-xs text-muted-foreground mb-1.5">Spouse Search Bio</label>
                  <textarea
                    className="input-dark w-full min-h-[80px] resize-y"
                    placeholder="Tell potential families about yourself, your education, profession, expectations..."
                    value={form.spouseSearchBio}
                    onChange={(e) => setForm({ ...form, spouseSearchBio: e.target.value })}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.spouseSearchBio.length}/500</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </form>

        {/* Account Info */}
        <div className="glass-panel rounded-2xl border border-clan-border p-6">
          <h3 className="font-cinzel text-clan-gold text-sm tracking-wider mb-4">ACCOUNT INFO</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm text-foreground capitalize px-2 py-0.5 bg-clan-gold/10 text-clan-gold rounded-full">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm text-foreground capitalize px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">
                {user?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contributions</span>
              <span className="text-sm text-clan-gold font-cinzel">
                PKR {user?.contributions?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
