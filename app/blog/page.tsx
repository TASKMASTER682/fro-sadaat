'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Clock, User, Loader2, FileText, Globe, Filter } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Blog {
  _id: string;
  title: string;
  titleUrdu?: string;
  content: string;
  contentUrdu?: string;
  excerpt?: string;
  excerptUrdu?: string;
  status: 'draft' | 'published';
  category: string;
  language: string;
  createdBy: { name: string; role: string };
  createdAt: string;
  publishedAt?: string;
}

const categoryLabels: Record<string, { en: string; ur: string }> = {
  history: { en: 'History', ur: 'تاریخ' },
  scholarship: { en: 'Scholarship', ur: 'علوم' },
  announcements: { en: 'Announcements', ur: 'اعلانات' },
  general: { en: 'General', ur: 'عمومی' },
  events: { en: 'Events', ur: 'مناسبت' },
};

const canWrite = ['leader', 'scholar', 'blogger'];

export default function BlogPage() {
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [drafts, setDrafts] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const [blogsRes, draftsRes] = await Promise.all([
        api.get('/blogs'),
        canWrite.includes(user?.role || '') ? api.get('/blogs/drafts') : Promise.resolve({ data: { data: [] } }),
      ]);
      setBlogs(blogsRes.data.data);
      setDrafts(draftsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (filter !== 'all' && blog.language !== filter && !(filter === 'both' && blog.language === 'both')) {
      return false;
    }
    if (categoryFilter !== 'all' && blog.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const displayedBlogs = showDrafts ? drafts : filteredBlogs;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clan-gold/20 to-clan-gold/5 border border-clan-gold/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-clan-gold" />
              </div>
              <div>
                <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-wider">CLAN CHRONICLES</h1>
                <p className="text-muted-foreground text-sm">Stories, scholarship & heritage</p>
              </div>
            </div>
          </div>

          {canWrite.includes(user?.role || '') && (
            <Link
              href="/blog/write"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clan-gold/15 text-clan-gold border border-clan-gold/30 hover:bg-clan-gold/25 transition-all"
            >
              <Plus size={16} />
              Write Blog
            </Link>
          )}
        </motion.div>

        {/* Decorative Line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-clan-gold/30 to-transparent" />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-clan-gold/60" />
            <span className="text-xs text-muted-foreground">Language:</span>
            {['all', 'english', 'urdu', 'both'].map((lang) => (
              <button
                key={lang}
                onClick={() => setFilter(lang)}
                className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                  filter === lang
                    ? 'bg-clan-gold/20 text-clan-gold border border-clan-gold/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Filter size={14} className="text-clan-gold/60" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-clan-dark-3 border border-clan-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-clan-gold/50"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, val]) => (
                <option key={key} value={key}>{val.en}</option>
              ))}
            </select>
          </div>

          {canWrite.includes(user?.role || '') && drafts.length > 0 && (
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                showDrafts
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              Drafts ({drafts.length})
            </button>
          )}
        </div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-clan-gold animate-spin" />
          </div>
        ) : displayedBlogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FileText className="w-16 h-16 text-clan-gold/20 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {showDrafts ? 'No drafts yet' : 'No blogs published yet'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedBlogs.map((blog, i) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <Link href={`/blog/${blog._id}`}>
                  <div className="relative h-full glass-panel rounded-2xl border border-clan-border overflow-hidden hover:border-clan-gold/30 transition-all duration-300">
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 text-[10px] font-cinzel bg-clan-gold/15 text-clan-gold border border-clan-gold/20 rounded-full">
                        {categoryLabels[blog.category]?.en || blog.category}
                      </span>
                    </div>

                    {/* Draft Badge */}
                    {blog.status === 'draft' && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 text-[10px] font-cinzel bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full">
                          DRAFT
                        </span>
                      </div>
                    )}

                    {/* Decorative Header */}
                    <div className="h-2 bg-gradient-to-r from-clan-gold/20 via-clan-gold/10 to-clan-gold/20" />

                    <div className="p-6">
                      {/* Title */}
                      <h3 className="font-cinzel text-lg text-foreground mb-2 group-hover:text-clan-gold transition-colors line-clamp-2">
                        {blog.language === 'urdu' ? blog.titleUrdu : blog.title}
                      </h3>

                      {blog.language === 'both' && blog.titleUrdu && (
                        <p className="font-cinzel text-sm text-clan-gold/70 mb-2 line-clamp-1" dir="rtl" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>
                          {blog.titleUrdu}
                        </p>
                      )}

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {blog.language === 'urdu' ? blog.excerptUrdu : blog.excerpt || blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-clan-border/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-clan-gold/20 flex items-center justify-center">
                            <User size={12} className="text-clan-gold" />
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {blog.createdBy?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatDate(blog.publishedAt || blog.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-t from-clan-gold/5 to-transparent rounded-tl-full" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
