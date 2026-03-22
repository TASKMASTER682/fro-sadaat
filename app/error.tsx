'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-[#0A0A0A] flex items-center justify-center min-h-screen p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Something Broke
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        {error.message && (
          <pre className="text-xs text-red-400/70 bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-6 text-left overflow-auto">
            {error.message}
          </pre>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                     bg-[#D4AF37] text-black font-semibold text-sm"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </div>
    </div>
  );
}
