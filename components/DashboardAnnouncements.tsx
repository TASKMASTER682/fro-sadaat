'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, X, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdBy: { name: string; role: string };
  createdAt: string;
}

const priorityConfig = {
  urgent: { color: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle, bgIcon: 'bg-red-500/20' },
  high: { color: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', icon: AlertTriangle, bgIcon: 'bg-orange-500/20' },
  normal: { color: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info, bgIcon: 'bg-blue-500/20' },
  low: { color: 'bg-gray-500/15', border: 'border-gray-500/30', text: 'text-gray-400', icon: Bell, bgIcon: 'bg-gray-500/20' },
};

export default function DashboardAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const savedDismissed = localStorage.getItem('clan_dashboard_dismissed');
    if (savedDismissed) {
      setDismissed(JSON.parse(savedDismissed));
    }
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('clan_dashboard_dismissed', JSON.stringify(newDismissed));
  };

  const activeAnnouncements = announcements.filter(a => !dismissed.includes(a._id));
  const displayAnnouncements = showAll ? activeAnnouncements : activeAnnouncements.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 rounded-full border-2 border-clan-gold/30 border-t-clan-gold animate-spin" />
      </div>
    );
  }

  if (activeAnnouncements.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel rounded-2xl border border-clan-border overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-clan-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-clan-gold/10 flex items-center justify-center">
            <Bell size={16} className="text-clan-gold" />
          </div>
          <h2 className="font-cinzel text-clan-gold text-sm tracking-wider">ANNOUNCEMENTS</h2>
          <span className="text-xs text-muted-foreground bg-clan-dark-3 px-2 py-0.5 rounded-full">
            {activeAnnouncements.length}
          </span>
        </div>
        {announcements.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-clan-gold/70 hover:text-clan-gold flex items-center gap-1 transition-colors"
          >
            {showAll ? 'Show Less' : 'View All'}
            <ChevronRight size={12} className={showAll ? 'rotate-90' : ''} />
          </button>
        )}
      </div>

      <div className="divide-y divide-clan-border/50">
        {displayAnnouncements.map((ann, i) => {
          const config = priorityConfig[ann.priority] || priorityConfig.normal;
          const Icon = config.icon;
          return (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 hover:bg-clan-dark-3/30 transition-colors ${config.color} ${config.border}`}
              style={{ borderLeftWidth: '3px' }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgIcon}`}>
                  <Icon size={16} className={config.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground leading-tight">{ann.title}</h3>
                    <button
                      onClick={() => handleDismiss(ann._id)}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span className={config.text}>{ann.priority.toUpperCase()}</span>
                    <span>·</span>
                    <span>By {ann.createdBy?.name || 'Admin'}</span>
                    <span>·</span>
                    <span>{formatDate(ann.createdAt)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
