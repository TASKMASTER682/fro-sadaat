'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import LandingUI from '@/components/landing/LandingUI';

export default function LandingPage() {
  const router = useRouter();
  const { token, isInitialized } = useAuthStore();
  const [showContent, setShowContent] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      setIsReady(true);
    }
  }, [isInitialized]);

  const handleEnter = async () => {
    if (!isReady) return;
    if (token) {
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/auth/me');
        const { updateUser } = useAuthStore.getState();
        updateUser(res.data.data);
        router.push('/shajra');
      } catch {
        router.push('/auth/login');
      }
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <main className="fixed inset-0 bg-clan-black overflow-hidden">
      {/* CSS-based animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-clan-black via-[#1a0a00] to-clan-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clan-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-clan-gold/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-clan-gold/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-clan-gold/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-clan-gold/5 rounded-full" />
      </div>

      {/* UI Overlay */}
      {showContent && <LandingUI onEnter={handleEnter} />}
    </main>
  );
}
