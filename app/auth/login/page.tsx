'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, LogIn, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to the clan!');
      router.replace('/shajra');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-clan-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clan-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-clan-gold/3 rounded-full blur-3xl" />
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
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4
                       shadow-[0_0_40px_rgba(212,175,55,0.3)]"
          >
            <Shield size={28} className="text-clan-black" />
          </motion.div>
          <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-widest">Kunj-e-Sadaat</h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wider">Lineage · Governance · Trust</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 border border-clan-border">
          <h2 className="font-cinzel text-foreground text-lg font-semibold mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email Address</label>
              <input
                type="email"
                className="input-dark"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-dark pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-clan-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          <div className="gold-divider my-6" />

          {/* Demo credentials */}
          <div className="bg-clan-dark-3 rounded-xl p-4 mb-4">
            <p className="font-cinzel text-xs text-clan-gold/60 tracking-wider mb-2">DEMO CREDENTIALS</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span className="text-clan-gold/70">Leader</span>
                <span className="font-mono">zaid@clan.com / password123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400/70">Admin</span>
                <span className="font-mono">omar@clan.com / password123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400/70">Member</span>
                <span className="font-mono">bilal@clan.com / password123</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New member?{' '}
            <Link href="/auth/register" className="text-clan-gold hover:underline">
              Request access
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
