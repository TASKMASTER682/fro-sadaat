'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Check, Trash2, CheckCircle, Loader2, Filter, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  priority: 'normal' | 'high';
  createdAt: string;
}

export default function AdminContactsPage() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/contacts${params}`);
      setContacts(res.data.data);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/contacts/${id}/read`);
      toast.success('Marked as read');
      fetchContacts();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleMarkReplied = async (id: string) => {
    try {
      await api.put(`/contacts/${id}/replied`);
      toast.success('Marked as replied');
      fetchContacts();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/contacts/${deleteId}`);
      toast.success('Contact deleted');
      setDeleteId(null);
      fetchContacts();
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/15 text-red-400 border border-red-500/20">UNREAD</span>;
      case 'read':
        return <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">READ</span>;
      case 'replied':
        return <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">REPLIED</span>;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clan-gold/20 to-clan-gold/5 border border-clan-gold/20 flex items-center justify-center">
              <Mail size={22} className="text-clan-gold" />
            </div>
            <div>
              <h1 className="font-cinzel text-clan-gold text-xl font-bold tracking-wider">CONTACT MESSAGES</h1>
              <p className="text-muted-foreground text-xs">Messages from clan members and visitors</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-clan-dark-3 border border-clan-border rounded-lg px-3 py-2 text-xs text-foreground"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </motion.div>

        <div className="gold-divider" />

        {/* Contacts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-clan-gold" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-clan-border">
            <Mail size={40} className="text-clan-gold/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No contact messages found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, i) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-panel rounded-xl border overflow-hidden ${
                  contact.status === 'unread' ? 'border-red-500/30' : 'border-clan-border'
                }`}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === contact._id ? null : contact._id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {contact.priority === 'high' && (
                          <AlertCircle size={14} className="text-red-400" />
                        )}
                        <h3 className={`text-sm font-medium ${contact.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {contact.subject}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail size={10} />
                          {contact.email}
                        </span>
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={10} />
                            {contact.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDateTime(contact.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {statusBadge(contact.status)}
                      {contact.status !== 'unread' && (
                        <span className="text-muted-foreground text-xs">
                          {contact.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === contact._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-clan-border/50"
                  >
                    <div className="p-5 bg-clan-dark-2">
                      {contact.status === 'unread' && (
                        <div className="flex items-center gap-2 mb-3 text-xs text-red-400">
                          <AlertCircle size={12} />
                          New message from {contact.name}
                        </div>
                      )}
                      
                      <div className="bg-clan-dark-3 rounded-lg p-4 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">From: <span className="text-foreground">{contact.name}</span></p>
                        <p className="text-xs text-muted-foreground mb-3">Contact: <span className="text-foreground">{contact.email}</span>{contact.phone && ` | ${contact.phone}`}</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{contact.message}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {contact.status === 'unread' && (
                          <button
                            onClick={() => handleMarkRead(contact._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 transition-colors"
                          >
                            <Check size={12} />
                            Mark as Read
                          </button>
                        )}
                        {contact.status !== 'replied' && (
                          <button
                            onClick={() => handleMarkReplied(contact._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors"
                          >
                            <CheckCircle size={12} />
                            Mark as Replied
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(contact._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors ml-auto"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Message"
        message="Are you sure you want to delete this contact message? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
}
