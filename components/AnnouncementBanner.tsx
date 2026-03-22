'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, Info } from 'lucide-react';
import api from '@/lib/api';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdBy: { name: string; role: string };
  createdAt: string;
}

const priorityConfig = {
  urgent: { color: 'bg-red-600', icon: AlertTriangle, border: 'border-red-500' },
  high: { color: 'bg-orange-500', icon: AlertTriangle, border: 'border-orange-500' },
  normal: { color: 'bg-blue-600', icon: Info, border: 'border-blue-500' },
  low: { color: 'bg-gray-600', icon: Bell, border: 'border-gray-500' },
};

const DISMISSED_KEY = 'clan_dismissed_announcements';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedDismissed = localStorage.getItem(DISMISSED_KEY);
    if (savedDismissed) {
      setDismissed(JSON.parse(savedDismissed));
    }
    setIsHydrated(true);
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  const activeAnnouncements = announcements.filter(a => !dismissed.includes(a._id));
  const currentAnnouncement = activeAnnouncements[currentIndex];

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissed));
    if (currentIndex >= activeAnnouncements.length - 1) {
      setCurrentIndex(Math.max(0, activeAnnouncements.length - 2));
    }
  };

  if (!isHydrated) return null;

  const handleNext = () => {
    if (currentIndex < activeAnnouncements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentAnnouncement && !showAll) return null;

  const config = priorityConfig[currentAnnouncement?.priority || 'normal'];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      {showAll ? (
        <motion.div
          key="all"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 max-h-[60vh] overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Announcements</h3>
              <button onClick={() => setShowAll(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {activeAnnouncements.map((ann) => {
                const cfg = priorityConfig[ann.priority] || priorityConfig.normal;
                return (
                  <div key={ann._id} className={`p-4 rounded-lg ${cfg.color} bg-opacity-20 border ${cfg.border}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{ann.title}</h4>
                        <p className="text-gray-300 text-sm mt-1">{ann.message}</p>
                        <p className="text-gray-400 text-xs mt-2">By {ann.createdBy.name} • {new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDismiss(ann._id)} className="text-gray-400 hover:text-white ml-2">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : currentAnnouncement ? (
        <motion.div
          key={currentAnnouncement._id}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 ${config.color} bg-opacity-90 border-b ${config.border} backdrop-blur-sm`}
        >
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Icon size={20} className="text-white flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{currentAnnouncement.title}</p>
                <p className="text-white text-opacity-80 text-xs truncate">{currentAnnouncement.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {activeAnnouncements.length > 1 && (
                  <span className="text-white text-opacity-70 text-xs">
                    {currentIndex + 1}/{activeAnnouncements.length}
                  </span>
                )}
                <button onClick={handlePrev} disabled={currentIndex === 0} className="text-white text-opacity-70 hover:text-white disabled:opacity-30">‹</button>
                <button onClick={handleNext} disabled={currentIndex >= activeAnnouncements.length - 1} className="text-white text-opacity-70 hover:text-white disabled:opacity-30">›</button>
                <button onClick={() => setShowAll(true)} className="text-white text-opacity-70 hover:text-white text-xs ml-2">All</button>
                <button onClick={() => handleDismiss(currentAnnouncement._id)} className="text-white hover:text-white ml-2">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
