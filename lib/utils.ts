import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserRole, UserStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function getNodeColor(role?: UserRole, isAlive?: boolean, status?: string): string {
  if (!isAlive || status === 'deceased') return '#4B5563';
  if (status === 'inactive') return '#EF4444';
  if (status === 'pending') return '#F59E0B';
  if (role === 'leader') return '#D4AF37';
  if (role === 'admin') return '#3B82F6';
  return '#22C55E';
}

export function getRoleBadgeClass(role: UserRole): string {
  const map: Record<UserRole, string> = {
    leader: 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30',
    admin: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    member: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    scholar: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    blogger: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    ancestor: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  };
  return map[role] || map.member;
}

export function getStatusDot(status: UserStatus | string): string {
  const map: Record<string, string> = {
    active: 'bg-emerald-500',
    inactive: 'bg-red-500',
    pending: 'bg-amber-500',
    deceased: 'bg-gray-500',
  };
  return map[status] || 'bg-gray-500';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}
