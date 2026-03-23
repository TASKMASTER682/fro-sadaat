'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Phone, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      return toast.error('Please fill all required fields');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return toast.error('Please enter a valid email');
    }

    setIsSubmitting(true);
    try {
      await api.post('/contacts', form);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-10 text-center max-w-md w-full border border-clan-border"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="font-cinzel text-2xl text-clan-gold mb-3">Message Sent!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for contacting us. We will get back to you soon via email.
            </p>
            <Link href="/" className="btn-gold inline-block">
              Return Home
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-clan-gold/20 to-clan-gold/5 border border-clan-gold/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-clan-gold" />
          </div>
          <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-wider">CONTACT US</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Have a question or need help? We&apos;re here for you.
          </p>
          <div className="gold-divider mt-4 max-w-[200px] mx-auto" />
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-8 border border-clan-border"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-dark pl-10"
                    placeholder="Sayed Ahmed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-dark pl-10"
                    placeholder="ahmed@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input-dark pl-10"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="input-dark"
                  placeholder="How can we help you?"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Message <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MessageSquare size={14} className="absolute left-4 top-4 text-muted-foreground" />
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="input-dark pl-10 min-h-[150px] resize-none"
                  placeholder="Write your message here..."
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                We typically respond within 24-48 hours
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glass-panel rounded-xl p-5 border border-clan-border text-center">
            <Mail size={20} className="text-clan-gold mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm text-foreground">clan@example.com</p>
          </div>
          <div className="glass-panel rounded-xl p-5 border border-clan-border text-center">
            <Phone size={20} className="text-clan-gold mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm text-foreground">+92 300 1234567</p>
          </div>
          <div className="glass-panel rounded-xl p-5 border border-clan-border text-center">
            <MessageSquare size={20} className="text-clan-gold mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Response Time</p>
            <p className="text-sm text-foreground">24-48 Hours</p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
