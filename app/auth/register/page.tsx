'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, Search, Check, UserPlus, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FatherResult { _id: string; name: string; role: string }

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    fatherName: '', fatherId: '',
  });
  const [fatherResults, setFatherResults] = useState<FatherResult[]>([]);
  const [fatherSearching, setFatherSearching] = useState(false);
  const [selectedFather, setSelectedFather] = useState<FatherResult | null>(null);

  const searchFather = async () => {
    if (!form.fatherName.trim()) return;
    setFatherSearching(true);
    try {
      const res = await api.get(`/auth/search-father?q=${encodeURIComponent(form.fatherName)}`);
      console.log('API Response:', res.data);
      const results = res.data.data || res.data.users || [];
      setFatherResults(results);
    } catch (err: any) {
      console.error('Search error:', err);
      toast.error('Search failed');
    } finally {
      setFatherSearching(false);
    }
  };

  const selectFather = (f: FatherResult) => {
    setSelectedFather(f);
    setForm({ ...form, fatherId: f._id, fatherName: f.name });
    setFatherResults([]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      return toast.error('Please fill all required fields');
    }
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        fatherId: form.fatherId || undefined,
        fatherName: !form.fatherId ? form.fatherName : undefined,
      });

      if (result.pendingApproval) {
        toast.success('Registration submitted! Awaiting admin approval.');
      } else {
        toast.success('Welcome to the clan!');
      }
      router.replace('/shajra');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-clan-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-clan-gold/4 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(212,175,55,0.25)]">
            <Shield size={24} className="text-clan-black" />
          </div>
          <h1 className="font-cinzel text-clan-gold text-xl font-bold tracking-widest">JOIN THE CLAN</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-cinzel transition-all ${step >= s ? 'bg-clan-gold text-clan-black font-bold' : 'bg-clan-dark-3 text-muted-foreground border border-clan-border'}`}>
                {step > s ? <Check size={13} /> : s}
              </div>
              {s < 2 && <div className={`w-8 h-px ${step > s ? 'bg-clan-gold' : 'bg-clan-border'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-clan-border">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <h2 className="font-cinzel text-foreground text-base font-semibold mb-5">Personal Info</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Full Name *</label>
                    <input className="input-dark" placeholder="Your full name" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Email Address *</label>
                    <input type="email" className="input-dark" placeholder="your@email.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Password *</label>
                    <input type="password" className="input-dark" placeholder="Min 6 characters" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Phone (optional)</label>
                    <input className="input-dark" placeholder="+91-XXXXXXXXXX" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <button
                    onClick={() => { if (form.name && form.email && form.password) setStep(2); else toast.error('Fill required fields'); }}
                    className="btn-gold w-full flex items-center justify-center gap-2"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h2 className="font-cinzel text-foreground text-base font-semibold mb-2">Lineage Connection</h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Search for your father in the clan tree. If not found, your registration will be reviewed by an admin.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Father&apos;s Name</label>
                    <div className="flex gap-2">
                      <input
                        className="input-dark flex-1"
                        placeholder="Search father&apos;s name…"
                        value={form.fatherName}
                        onChange={(e) => { setForm({ ...form, fatherName: e.target.value, fatherId: '' }); setSelectedFather(null); }}
                      />
                      <button
                        onClick={searchFather}
                        disabled={fatherSearching}
                        className="btn-ghost px-3 flex-shrink-0"
                      >
                        {fatherSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  {fatherResults.length > 0 && (
                    <div className="space-y-1.5 border border-clan-border rounded-lg p-2 bg-clan-dark-2">
                      {fatherResults.map((f) => (
                        <button
                          key={f._id}
                          onClick={() => selectFather(f)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-clan-dark-3
                                     hover:bg-clan-gold/10 border border-transparent transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-clan-gold/20 flex items-center justify-center text-sm font-cinzel text-clan-gold">
                            {f.name[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{f.role}</p>
                          </div>
                          {selectedFather?._id === f._id && <Check size={16} className="text-clan-gold" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedFather && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                      <Check size={12} />
                      Connected to: <span className="font-semibold">{selectedFather.name}</span>
                    </div>
                  )}

                  {!selectedFather && form.fatherName && (
                    <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
                      ⚠ Father not found — registration will require admin approval
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setStep(1)} className="btn-ghost text-sm flex-1">Back</button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="btn-gold text-sm flex-1 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                      {isLoading ? 'Registering…' : 'Register'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="gold-divider my-5" />
          <p className="text-center text-sm text-muted-foreground">
            Already a member?{' '}
            <Link href="/auth/login" className="text-clan-gold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
