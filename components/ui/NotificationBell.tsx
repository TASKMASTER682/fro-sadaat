'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, TrendingUp, Vote, UserPlus, GitMerge } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'deposit' | 'proposal' | 'member' | 'lineage';
  message: string;
  timestamp: Date;
  read: boolean;
}

// In production this would be driven by WebSocket / SSE
// Here we simulate with mock data pulled from recent API activity
const ICONS: Record<string, any> = {
  deposit: TrendingUp,
  proposal: Vote,
  member: UserPlus,
  lineage: GitMerge,
};

const COLORS: Record<string, string> = {
  deposit: 'text-emerald-400 bg-emerald-400/10',
  proposal: 'text-blue-400 bg-blue-400/10',
  member: 'text-amber-400 bg-amber-400/10',
  lineage: 'text-clan-gold bg-clan-gold/10',
};

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'deposit',  message: 'Zaid Khan recorded a deposit of ₹1,000', timestamp: new Date(Date.now() - 5 * 60000), read: false },
  { id: '2', type: 'proposal', message: 'New proposal: "Emergency Fund Withdrawal" is open for voting', timestamp: new Date(Date.now() - 30 * 60000), read: false },
  { id: '3', type: 'member',   message: 'New member registration pending approval', timestamp: new Date(Date.now() - 2 * 3600000), read: true },
  { id: '4', type: 'lineage',  message: 'Omar Khan approved a lineage update', timestamp: new Date(Date.now() - 5 * 3600000), read: true },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center
                   text-muted-foreground hover:text-clan-gold hover:bg-clan-dark-3
                   border border-transparent hover:border-clan-border transition-all"
      >
        <Bell size={17} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-clan-gold text-clan-black
                       text-[9px] font-bold font-cinzel flex items-center justify-center"
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-2xl border border-clan-border
                       shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-clan-border">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-clan-gold" />
                <span className="font-cinzel text-xs text-clan-gold/80 tracking-wider">NOTIFICATIONS</span>
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-muted-foreground hover:text-clan-gold transition-colors flex items-center gap-1">
                  <Check size={10} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto custom-scroll divide-y divide-clan-border/40">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-xs">
                  All caught up!
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = ICONS[n.type];
                  const colorCls = COLORS[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-clan-dark-3/50 ${
                        !n.read ? 'bg-clan-gold/3' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorCls}`}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${n.read ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDateTime(n.timestamp.toISOString())}
                        </p>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5"
                      >
                        <X size={12} />
                      </button>
                      {!n.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-clan-gold flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
