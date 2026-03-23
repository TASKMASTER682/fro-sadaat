'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Loader2, Edit, Trash2, Globe, Calendar } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

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

const canPublish = ['leader', 'admin', 'scholar'];
const canWrite = ['leader', 'admin', 'scholar', 'blogger'];

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [params.id]);

  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/blogs/${params.id}`);
      setBlog(res.data.data);
    } catch (err) {
      console.error('Failed to fetch blog:', err);
      toast.error('Failed to load blog');
      router.push('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!canPublish.includes(user?.role || '')) return;
    try {
      await api.post(`/blogs/${params.id}/publish`);
      toast.success('Blog published successfully!');
      fetchBlog();
    } catch (err) {
      toast.error('Failed to publish');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/blogs/${params.id}`);
      toast.success('Blog deleted successfully');
      router.push('/blog');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const canEdit = blog && (canWrite.includes(user?.role || '') && blog.createdBy?._id === user?._id);
  const canPublishBtn = blog && canPublish.includes(user?.role || '');
  const canDelete = blog && (canWrite.includes(user?.role || ''));

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-clan-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!blog) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Blog not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            href="/blog"
            className="flex items-center gap-2 text-muted-foreground hover:text-clan-gold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Chronicles
          </Link>

          <div className="flex items-center gap-3">
            {blog.status === 'draft' && canPublishBtn && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all"
              >
                <Globe size={14} />
                Publish
              </button>
            )}
            {canEdit && (
              <Link
                href={`/blog/edit/${blog._id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-clan-dark-3 text-foreground border border-clan-border hover:border-clan-gold/30 transition-all"
              >
                <Edit size={14} />
                Edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        </motion.div>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl border border-clan-border overflow-hidden"
        >
          {/* Decorative Header */}
          <div className="h-2 bg-gradient-to-r from-clan-gold/30 via-clan-gold/10 to-clan-gold/30" />
          
          {/* Draft Badge */}
          {blog.status === 'draft' && (
            <div className="px-8 pt-4">
              <span className="px-3 py-1 text-xs font-cinzel bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full">
                DRAFT
              </span>
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="font-cinzel text-3xl md:text-4xl text-foreground mb-4 leading-tight">
              {blog.language === 'urdu' ? blog.titleUrdu : blog.title}
            </h1>

            {blog.language === 'both' && blog.titleUrdu && (
              <h2 
                className="font-urdu text-2xl md:text-3xl text-clan-gold/80 mb-6" 
                dir="rtl"
              >
                {blog.titleUrdu}
              </h2>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-clan-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clan-gold/20 flex items-center justify-center">
                  <User size={14} className="text-clan-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium">{blog.createdBy?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{blog.createdBy?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar size={14} />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </div>
              <span className="px-3 py-1 text-xs bg-clan-gold/10 text-clan-gold rounded-full border border-clan-gold/20 capitalize">
                {blog.category}
              </span>
            </div>

            {/* Content */}
            <div className="prose-custom">
              {(blog.language === 'both' || blog.language === 'english') && (
                <div 
                  className="mb-8"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              )}
              
              {(blog.language === 'both' || blog.language === 'urdu') && blog.contentUrdu && (
                <div 
                  className="font-urdu text-right text-lg" 
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: blog.contentUrdu }}
                />
              )}
            </div>

            {/* Decorative Footer */}
            <div className="mt-12 pt-8 border-t border-clan-border">
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-clan-gold/30" />
                <span className="text-clan-gold/40 text-xs">✦</span>
                <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-clan-gold/30" />
              </div>
            </div>
          </div>
        </motion.article>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Chronicle"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
}
