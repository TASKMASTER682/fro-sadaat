'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Globe, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuth';
import RichEditor from '@/components/ui/RichEditor';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const canPublish = ['leader', 'admin', 'scholar'];
const canWrite = ['leader', 'scholar', 'blogger'];

const categories = [
  { value: 'general', label: 'General' },
  { value: 'history', label: 'History' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'events', label: 'Events' },
];

export default function WriteBlogPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'english' | 'urdu' | 'both'>('both');
  const [form, setForm] = useState({
    title: '',
    titleUrdu: '',
    content: '',
    contentUrdu: '',
    excerpt: '',
    excerptUrdu: '',
    category: 'general',
    language: 'both',
  });

  useEffect(() => {
    if (!canWrite.includes(user?.role || '')) {
      toast.error('You do not have permission to write blogs');
      router.push('/blog');
    }
  }, [user, router]);

  const handleSubmit = async (publish: boolean) => {
    if (!form.title && !form.titleUrdu) {
      return toast.error('Please provide a title');
    }
    if (!form.content && !form.contentUrdu) {
      return toast.error('Please provide content');
    }

    setIsSubmitting(true);
    try {
      if (publish && !canPublish.includes(user?.role || '')) {
        return toast.error('Only scholars and leaders can publish directly');
      }

      await api.post('/blogs', {
        ...form,
        status: publish ? 'published' : 'draft',
      });

      toast.success(publish ? 'Blog published successfully!' : 'Draft saved successfully!');
      router.push('/blog');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="p-2 rounded-lg hover:bg-clan-dark-3 transition-colors"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </Link>
            <div>
              <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-wider">WRITE CHRONICLE</h1>
              <p className="text-muted-foreground text-sm">Share your knowledge with the clan</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-clan-dark-3 text-foreground border border-clan-border hover:border-clan-gold/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-clan-gold text-clan-black font-semibold hover:bg-clan-gold/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {canPublish.includes(user?.role || '') ? 'Publish' : 'Submit for Review'}
            </button>
          </div>
        </motion.div>

        {/* Language Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <Globe size={16} className="text-clan-gold/60" />
          <div className="flex gap-2">
            {[
              { key: 'both', label: 'English & اردو' },
              { key: 'english', label: 'English Only' },
              { key: 'urdu', label: 'اردو Only' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* English Section */}
          {(activeTab === 'both' || activeTab === 'english') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl border border-clan-border p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-clan-gold/80 text-sm tracking-wider">ENGLISH</h3>
                {activeTab === 'both' && (
                  <button
                    onClick={() => setActiveTab('urdu')}
                    className="text-xs text-muted-foreground hover:text-clan-gold"
                  >
                    Hide
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter blog title..."
                  className="w-full bg-clan-dark-3 border border-clan-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-clan-gold/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Content</label>
                <RichEditor
                  value={form.content}
                  onChange={(content) => handleChange('content', content)}
                  placeholder="Write your story..."
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Excerpt (optional)</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  placeholder="Brief summary..."
                  rows={2}
                  className="w-full bg-clan-dark-3 border border-clan-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-clan-gold/50 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* Urdu Section */}
          {(activeTab === 'both' || activeTab === 'urdu') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl border border-clan-border p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-clan-gold/80 text-sm tracking-wider">اردو</h3>
                {activeTab === 'both' && (
                  <button
                    onClick={() => setActiveTab('english')}
                    className="text-xs text-muted-foreground hover:text-clan-gold"
                  >
                    Hide
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block" dir="rtl">عنوان</label>
                <input
                  type="text"
                  value={form.titleUrdu}
                  onChange={(e) => handleChange('titleUrdu', e.target.value)}
                  placeholder="بلوق کا عنوان..."
                  dir="rtl"
                  className="w-full bg-clan-dark-3 border border-clan-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-clan-gold/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block" dir="rtl">مواد</label>
                <RichEditor
                  value={form.contentUrdu}
                  onChange={(content) => handleChange('contentUrdu', content)}
                  placeholder="اپنی کہانی لکھیں..."
                  dir="rtl"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block" dir="rtl">خلاصہ (اختیاری)</label>
                <textarea
                  value={form.excerptUrdu}
                  onChange={(e) => handleChange('excerptUrdu', e.target.value)}
                  placeholder="مختصر خلاصہ..."
                  rows={2}
                  dir="rtl"
                  className="w-full bg-clan-dark-3 border border-clan-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-clan-gold/50 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* Category */}
          <div className="glass-panel rounded-2xl border border-clan-border p-6">
            <label className="text-xs text-muted-foreground mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleChange('category', cat.value)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    form.category === cat.value
                      ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                      : 'bg-clan-dark-3 text-muted-foreground border border-clan-border hover:border-clan-gold/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="glass-panel rounded-2xl border border-clan-border p-6">
            <label className="text-xs text-muted-foreground mb-2 block">Published Language</label>
            <div className="flex gap-2">
              {[
                { value: 'both', label: 'Both Languages' },
                { value: 'english', label: 'English Only' },
                { value: 'urdu', label: 'اردو Only' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('language', opt.value)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    form.language === opt.value
                      ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                      : 'bg-clan-dark-3 text-muted-foreground border border-clan-border hover:border-clan-gold/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
