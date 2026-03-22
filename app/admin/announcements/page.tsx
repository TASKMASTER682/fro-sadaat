'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, Loader2, AlertTriangle, Info, ChevronDown, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdBy: { name: string; role: string };
  createdAt: string;
}

const priorityConfig = {
  urgent: { color: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle },
  high: { color: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', icon: AlertTriangle },
  normal: { color: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info },
  low: { color: 'bg-gray-500/15', border: 'border-gray-500/30', text: 'text-gray-400', icon: Bell },
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement created');
      setForm({ title: '', message: '', priority: 'normal' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/announcements/${deleteTarget._id}`);
      toast.success('Announcement deleted');
      setDeleteTarget(null);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <PageHeader
          title="ANNOUNCEMENTS"
          subtitle="Create and manage clan announcements"
          icon={Bell}
          action={
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-clan-gold/15 text-clan-gold border border-clan-gold/30 hover:bg-clan-gold/25 transition-all"
            >
              {showForm ? <X size={14} /> : <Plus size={14} />}
              {showForm ? 'Cancel' : 'New Announcement'}
            </button>
          }
        />

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-panel rounded-2xl border border-clan-border p-6"
          >
            <h3 className="font-cinzel text-clan-gold text-sm tracking-wider mb-4">CREATE ANNOUNCEMENT</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Title</label>
                <input
                  className="input-dark w-full"
                  placeholder="Announcement title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Message</label>
                <textarea
                  className="input-dark w-full min-h-[100px] resize-y"
                  placeholder="Announcement message..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={2000}
                />
              </div>

              <div className="relative">
                <label className="block text-xs text-muted-foreground mb-1.5">Priority</label>
                <button
                  type="button"
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  className="input-dark w-full flex items-center justify-between"
                >
                  <span className={priorityConfig[form.priority].text}>
                    {form.priority.charAt(0).toUpperCase() + form.priority.slice(1)}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>
                {showPriorityDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-clan-dark-3 border border-clan-border rounded-lg shadow-xl overflow-hidden">
                    {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, priority: p });
                          setShowPriorityDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-clan-dark-2 transition-colors ${priorityConfig[p].text} ${form.priority === p ? 'bg-clan-dark-2' : ''}`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                Publish Announcement
              </button>
            </form>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-clan-gold animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-clan-border p-12 text-center">
            <Bell size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann, i) => {
              const config = priorityConfig[ann.priority] || priorityConfig.normal;
              const Icon = config.icon;
              return (
                <motion.div
                  key={ann._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-5 ${config.color} border ${config.border}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-clan-dark-3 ${config.text}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-cinzel text-foreground font-semibold">{ann.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-clan-dark-3 ${config.text} border ${config.border}`}>
                          {ann.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        By {ann.createdBy?.name || 'Unknown'} • {new Date(ann.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(ann)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
}
