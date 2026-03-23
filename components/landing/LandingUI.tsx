'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Mail, TreePine, Vote, BookOpen, Users, Banknote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LandingUIProps {
  onEnter: () => void;
}

const features = [
  {
    icon: TreePine,
    title: 'Family Tree',
    titleUr: 'شجرة خاندان',
    desc: 'Visual Shajra - Explore your lineage with our interactive family tree',
    color: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    icon: Vote,
    title: 'Governance',
    titleUr: 'حکومت',
    desc: 'Democratic voting system for clan decisions and proposals',
    color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    icon: Banknote,
    title: 'Trust Fund',
    titleUr: 'ٹرسٹ فنڈ',
    desc: 'Secure ledger for clan finances and contributions',
    color: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: BookOpen,
    title: 'Chronicles',
    titleUr: 'کہانیاں',
    desc: 'Bilingual blog system - English and Urdu content',
    color: 'from-amber-500/20 to-amber-500/5',
  },
  {
    icon: Users,
    title: 'Member Directory',
    titleUr: 'اراکین کی فہرست',
    desc: 'Complete directory of all clan members with roles',
    color: 'from-rose-500/20 to-rose-500/5',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    titleUr: 'محفوظ رسائی',
    desc: 'Role-based permissions for admin, leaders & members',
    color: 'from-cyan-500/20 to-cyan-500/5',
  },
];

export default function LandingUI({ onEnter }: LandingUIProps) {
  return (
    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clan-gold/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-clan-gold/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-clan-gold/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-clan-gold/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-clan-gold/5 rounded-full" />
        </div>

        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-clan-black/80 to-transparent pointer-events-none z-10" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl pointer-events-auto">
          {/* Logo/Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-clan-gold/20 to-clan-gold/5 
                            border border-clan-gold/30 flex items-center justify-center backdrop-blur-sm
                            shadow-[0_0_40px_rgba(212,175,55,0.2)]">
              <Shield className="w-12 h-12 text-clan-gold" />
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
            کُنْجِ سادات
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-cinzel text-2xl md:text-3xl text-clan-gold/90 mb-6 tracking-wider"
          >
            Kunj-e-Sadaat
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
              className="group relative px-12 py-5 rounded-xl overflow-hidden
                         bg-gradient-to-r from-clan-gold/20 to-clan-gold/10
                         border border-clan-gold/40 backdrop-blur-md
                         transition-all duration-300 hover:border-clan-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-clan-gold/20 to-transparent 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <span className="relative flex items-center gap-3 font-cinzel text-xl text-clan-gold tracking-wider">
                <Sparkles className="w-5 h-5" />
                Enter the Clan
                <Sparkles className="w-5 h-5" />
              </span>
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-20"
          >
            <div className="w-6 h-10 rounded-full border-2 border-clan-gold/30 flex items-start justify-center p-2 mx-auto">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-2 rounded-full bg-clan-gold"
              />
            </div>
            <p className="text-clan-gold/40 text-xs mt-3 font-cinzel tracking-wider">SCROLL TO EXPLORE</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-clan-gold/60 font-cinzel text-sm tracking-widest mb-3">FEATURES</p>
            <h2 className="font-cinzel text-3xl md:text-4xl text-clan-gold mb-4">Powerful Tools for Your Clan</h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Everything you need to manage, govern, and preserve your clan heritage in one place
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-6 border border-clan-border hover:border-clan-gold/30 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} border border-clan-border/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-clan-gold" />
                </div>
                <h3 className="font-cinzel text-xl text-clan-gold mb-1">{feature.title}</h3>
                <p className="font-urdu text-clan-gold/60 text-lg mb-3" dir="rtl">{feature.titleUr}</p>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-clan-gold/[0.02] to-transparent" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-clan-gold/60 font-cinzel text-sm tracking-widest mb-3">ABOUT</p>
            <h2 className="font-cinzel text-3xl md:text-4xl text-clan-gold mb-6">Preserving Our Heritage</h2>
            <div className="space-y-6">
              <p className="text-white/70 text-lg leading-relaxed">
                کُنْجِ سادات is a digital clan management system designed to unite family members 
                across the globe. Our mission is to preserve the rich heritage and lineage of our 
                ancestors while embracing modern technology.
              </p>
              <p className="text-white/50 leading-relaxed">
                From the ancient lineage of Hazrat Imam Ali (AS) to the present day, we have created 
                a platform where every family member can contribute to our collective legacy. 
                Record memories, participate in decisions, and stay connected with your roots.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { value: '700+', label: 'Years of Heritage' },
                { value: '50+', label: 'Family Members' },
                { value: '100%', label: 'Secure & Private' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-cinzel text-3xl text-clan-gold font-bold">{stat.value}</p>
                  <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-clan-gold/[0.03] to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="glass-panel rounded-3xl p-12 border border-clan-gold/20">
            <h2 className="font-cinzel text-3xl md:text-4xl text-clan-gold mb-4">Ready to Join?</h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Be part of our digital clan system. Register today and connect with your family heritage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onEnter}
                className="group relative px-8 py-4 rounded-xl overflow-hidden
                           bg-gold-gradient border-0
                           transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              >
                <span className="relative flex items-center gap-2 font-cinzel text-clan-black font-semibold">
                  Get Started
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl border border-clan-gold/40 text-clan-gold
                           hover:bg-clan-gold/10 transition-all font-cinzel"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-clan-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center">
                <Shield size={18} className="text-clan-black" />
              </div>
              <div>
                <p className="font-cinzel text-clan-gold text-sm font-bold tracking-wider">کُنْجِ سادات</p>
                <p className="text-white/40 text-xs">Kunj-e-Sadaat</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Link href="/contact" className="text-white/40 hover:text-clan-gold text-sm transition-colors flex items-center gap-2">
                <Mail size={14} />
                Contact
              </Link>
              <Link href="/auth/register" className="text-white/40 hover:text-clan-gold text-sm transition-colors">
                Register
              </Link>
              <Link href="/auth/login" className="text-white/40 hover:text-clan-gold text-sm transition-colors">
                Login
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} کُنْجِ سادات. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
