'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/auth/login');
    }
  }, [user, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-clan-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-clan-gold/30 border-t-clan-gold animate-spin" />
          <p className="font-cinzel text-clan-gold/60 text-xs tracking-widest">INITIALIZING…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-clan-black">
      <AnnouncementBanner />
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen pb-20 lg:pb-0 pt-12">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
