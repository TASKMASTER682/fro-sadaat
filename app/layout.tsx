'use client';

import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    initialize();
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('SW registered:', registration.scope);
        },
        (error) => {
          console.log('SW registration failed:', error);
        }
      );
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initialize]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>کُنْجِ سادات</title>
        <meta name="description" content="کُنْجِ سادات - Digital Clan Management System. Family Tree, Governance, Trust Fund" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#D4AF37" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="کُنْجِ سادات" />
        <meta name="application-name" content="کُنْجِ سادات" />
        <meta name="msapplication-TileColor" content="#D4AF37" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-clan-black text-foreground antialiased font-inter">
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black text-center text-sm py-2 px-4">
            You are offline. Some features may not work.
          </div>
        )}
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A1A',
              color: '#F5D76E',
              border: '1px solid #2E2E2E',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#D4AF37', secondary: '#0A0A0A' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
              style: {
                background: '#1A1A1A',
                color: '#FCA5A5',
                border: '1px solid rgba(127,29,29,0.3)',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
