'use client';

import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>کنجِ سادات</title>
        <meta name="description" content="نظام خاندان - خاندانی شجرة، حکومت، اور اعتماد" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-clan-black text-foreground antialiased font-inter">
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
