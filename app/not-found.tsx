'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TreePine, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-clan-black flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-clan-gold/10 border border-clan-gold/20 flex items-center justify-center mx-auto mb-6">
          <TreePine className="w-10 h-10 text-clan-gold/60" />
        </div>

        {/* Heading */}
        <h1 className="font-cinzel text-6xl font-bold text-clan-gold/30 mb-2">404</h1>
        <h2 className="font-cinzel text-xl text-foreground font-semibold mb-3">Node Not Found</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          This branch of the tree does not exist. The node you are looking for may have been moved or removed from the lineage.
        </p>

        <div className="gold-divider mb-8" />

        <Link href="/shajra">
          <button className="btn-gold inline-flex items-center gap-2">
            <ArrowLeft size={15} />
            Return to Shajra
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
