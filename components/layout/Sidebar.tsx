'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreePine, LayoutDashboard, Vote, Banknote, Users,
  LogOut, Shield, ShieldCheck, ChevronRight, Menu, X,
  BookOpen, Mail, Sun, Moon, Images, UserCircle, Heart,
  Bell, Trash2, XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuth';
import { getRoleBadgeClass, getInitials, cn } from '@/lib/utils';

const navItems = [
  { href: '/shajra',     label: 'Shajra',         icon: TreePine,        desc: 'Family Tree',        roles: [] as string[] },
  { href: '/ladies',     label: 'Ladies',        icon: Users,           desc: 'Female Members',    roles: [] as string[] },
  { href: '/spouse',     label: 'Finding Spouse', icon: Heart,           desc: 'Spouse Search',     roles: [] as string[] },
  { href: '/dashboard',  label: 'Dashboard',      icon: LayoutDashboard, desc: 'Overview',           roles: [] as string[] },
  { href: '/profile',    label: 'Profile',        icon: UserCircle,      desc: 'My Profile',         roles: [] as string[] },
  { href: '/gallery',    label: 'Gallery',         icon: Images,          desc: 'Clan Photos',        roles: [] as string[] },
  { href: '/blog',       label: 'Chronicles',      icon: BookOpen,        desc: 'Clan Blogs',         roles: [] as string[] },
  { href: '/members',    label: 'Members',         icon: Users,           desc: 'Member Directory',  roles: [] as string[] },
  { href: '/governance', label: 'Governance',      icon: Vote,            desc: 'Proposals & Voting', roles: [] as string[] },
  { href: '/trust',      label: 'Trust Fund',      icon: Banknote,        desc: 'Ledger & Finances',  roles: [] as string[] },
  { href: '/admin',      label: 'Admin',           icon: ShieldCheck,     desc: 'Management Panel',  roles: ['admin', 'leader'] },
  { href: '/admin/contacts', label: 'Messages',    icon: Mail,            desc: 'Contact Messages',  roles: ['scholar'] },
];

function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
    } else {
      setIsDark(true);
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300',
        'bg-clan-dark-3 hover:bg-clan-dark-4 border border-clan-border hover:border-clan-gold/30',
        className
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Sun size={18} className="text-clan-gold" />
          ) : (
            <Moon size={18} className="text-clan-gold" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const apiModule = (await import('@/lib/api')).default;
      const res = await apiModule.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const apiModule = (await import('@/lib/api')).default;
      await apiModule.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const apiModule = (await import('@/lib/api')).default;
      await apiModule.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const apiModule = (await import('@/lib/api')).default;
      await apiModule.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const canManageNotifications = ['admin', 'leader', 'scholar'].includes(user?.role || '');

  return (
    <>
      <div className="px-6 pt-6 pb-5 border-b border-clan-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center shadow-[0_0_16px_rgba(212,175,55,0.3)]">
            <Shield className="w-5 h-5 text-clan-black" />
          </div>
          <div>
            <h1 className="font-cinzel text-clan-gold text-sm font-bold tracking-wider">کُنْجِ سادات</h1>
            <p className="font-cinzel text-clan-gold/50 text-[20px] tracking-widest">CLAN</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 bg-clan-dark-3 hover:bg-clan-dark-4 border border-clan-border hover:border-clan-gold/30 relative"
            >
              <Bell size={18} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-xl border border-clan-border shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-clan-border/50 flex items-center justify-between">
                  <h3 className="font-cinzel text-clan-gold text-xs tracking-wider">NOTIFICATIONS</h3>
                  <div className="flex items-center gap-2">
                    {canManageNotifications && notifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications} 
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Clear All
                      </button>
                    )}
                    {unreadCount > 0 && (
                      <button onClick={fetchNotifications} className="text-xs text-muted-foreground hover:text-clan-gold">
                        Refresh
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scroll">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={cn(
                          'p-3 border-b border-clan-border/30 transition-colors',
                          !notif.isRead && 'bg-clan-gold/5',
                          'group relative'
                        )}
                      >
                        <div 
                          onClick={() => !notif.isRead && markAsRead(notif._id)} 
                          className="cursor-pointer"
                        >
                          <p className="text-sm font-medium text-foreground pr-6">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-2">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {canManageNotifications && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif._id);
                            }}
                            className="absolute top-3 right-3 p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <ThemeToggle />
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground p-1 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scroll">
        {navItems.map((item) => {
          if (item.roles.length > 0 && user && !item.roles.includes(user.role)) return null;
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer',
                  active
                    ? 'bg-clan-gold/10 border border-clan-gold/20'
                    : 'hover:bg-clan-dark-3 border border-transparent'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  active ? 'bg-clan-gold/15' : 'bg-clan-dark-3 group-hover:bg-clan-dark-4'
                )}>
                  <item.icon
                    size={16}
                    className={cn('transition-colors', active ? 'text-clan-gold' : 'text-muted-foreground group-hover:text-clan-gold/70')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium leading-none mb-0.5', active ? 'text-clan-gold' : 'text-foreground/80 group-hover:text-foreground')}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-none">{item.desc}</p>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-clan-gold/50 flex-shrink-0" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 gold-divider" />

      {user && (
        <div className="px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-clan-dark-3 border border-clan-border/50">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-clan-black text-[11px] font-bold font-cinzel flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-none truncate mb-1">{user.name}</p>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', getRoleBadgeClass(user.role))}>
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 glass-panel rounded-lg
                   border border-clan-border flex items-center justify-center
                   text-muted-foreground hover:text-clan-gold transition-colors"
      >
        <Menu size={18} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-screen w-64 glass-panel border-r border-clan-border z-50 flex flex-col lg:hidden"
          >
            <NavContent onClose={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 glass-panel border-r border-clan-border z-40 flex-col">
        <NavContent />
      </aside>
    </>
  );
}
