'use client';

import { Search, X } from 'lucide-react';
import { useTreeStore } from '@/hooks/useTree';
import { motion, AnimatePresence } from 'framer-motion';

export default function TreeSearch() {
  const { searchQuery, setSearchQuery } = useTreeStore();

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-80">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-clan-gold/50 w-4 h-4" />
        <input
          type="text"
          placeholder="Search clan members…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 glass-panel rounded-xl text-sm text-foreground
                     placeholder-muted-foreground border border-clan-border focus:border-clan-gold/50
                     focus:ring-1 focus:ring-clan-gold/20 outline-none transition-all duration-200
                     font-inter"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-clan-gold transition-colors"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
