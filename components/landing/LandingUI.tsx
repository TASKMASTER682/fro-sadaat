'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield } from 'lucide-react';

interface LandingUIProps {
  onEnter: () => void;
}

export default function LandingUI({ onEnter }: LandingUIProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-clan-black/80 to-transparent pointer-events-none" />
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-clan-black via-clan-black/90 to-transparent pointer-events-none" />
      
      {/* Side Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-clan-black/60 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-clan-black/60 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl pointer-events-auto">
        {/* Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-clan-gold/20 to-clan-gold/5 
                          border border-clan-gold/30 flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-10 h-10 text-clan-gold" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-cinzel text-5xl md:text-7xl font-bold text-transparent bg-clip-text 
                     bg-gradient-to-r from-clan-gold via-yellow-200 to-clan-gold mb-4 tracking-wide"
        >
          کُنجِ سادات      </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-cinzel text-2xl md:text-3xl text-clan-gold/90 mb-6 tracking-wider"
        >
          DIGITAL CLAN SYSTEM
        </motion.h2>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Unite your lineage. Preserve your legacy. Lead with honor.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <button
            onClick={onEnter}
            className="group relative px-10 py-4 rounded-xl overflow-hidden
                       bg-gradient-to-r from-clan-gold/20 to-clan-gold/10
                       border border-clan-gold/40 backdrop-blur-md
                       transition-all duration-300 hover:border-clan-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-clan-gold/20 to-transparent 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <span className="relative flex items-center gap-3 font-cinzel text-xl text-clan-gold tracking-wider">
              <Sparkles className="w-5 h-5" />
              Enter the Clan
              <Sparkles className="w-5 h-5" />
            </span>
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[
            { title: 'Family Tree', desc: 'Visual Shajra' },
            { title: 'Governance', desc: 'Democratic Voting' },
            { title: 'Trust Fund', desc: 'Secure Ledger' },
          ].map((item, i) => (
            <div
              key={i}
              className="text-center px-6 py-3 rounded-lg bg-clan-black/40 backdrop-blur-sm border border-white/5"
            >
              <p className="font-cinzel text-clan-gold/80 text-sm tracking-wider">{item.title}</p>
              <p className="text-white/40 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-clan-gold/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-clan-gold"
          />
        </div>
      </motion.div>
    </div>
  );
}
