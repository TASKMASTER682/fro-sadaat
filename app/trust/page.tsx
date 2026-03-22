'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownRight, ArrowUpRight, Banknote, RefreshCw,
  Filter, Plus, CheckCircle, Clock,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function TrustPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [form, setForm] = useState({ amount: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'leader';

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const res = await api.get(`/transactions${params}`);
      setTransactions(res.data.data);
      setBalance(res.data.balance || 0);
      setTotalDeposits(res.data.totalDeposits || 0);
      setTotalWithdrawals(res.data.totalWithdrawals || 0);
    } catch (err) {
      toast.error('Failed to load ledger');
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLedger(); }, [filter]);

  const handleDeposit = async () => {
    if (!form.amount || Number(form.amount) < 100) {
      return toast.error('Minimum deposit is ₹100');
    }
    setIsSubmitting(true);
    try {
      await api.post('/transactions/deposit', {
        amount: Number(form.amount),
        note: form.note || 'Monthly contribution',
      });
      toast.success('Deposit recorded successfully');
      setForm({ amount: '', note: '' });
      setShowDepositForm(false);
      fetchLedger();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!form.amount || Number(form.amount) < 1) {
      return toast.error('Enter a valid amount');
    }
    setIsSubmitting(true);
    try {
      await api.post('/transactions/withdraw-request', {
        amount: Number(form.amount),
        note: form.note,
      });
      toast.success('Withdrawal request submitted for approval');
      setForm({ amount: '', note: '' });
      setShowWithdrawForm(false);
      fetchLedger();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-cinzel text-clan-gold text-2xl font-bold tracking-wider">TRUST FUND</h1>
          <p className="text-muted-foreground text-sm mt-1">Transparent public ledger for all transactions</p>
          <div className="gold-divider mt-3" />
        </motion.div>

        {/* Balance hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-8 border border-clan-gold/20 text-center relative overflow-hidden"
        >
          {/* Gold glow bg */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)]" />
          <p className="font-cinzel text-clan-gold/60 text-sm tracking-widest mb-2">TOTAL FUND BALANCE</p>
          <p className="font-cinzel text-5xl font-bold text-clan-gold">{formatCurrency(balance)}</p>
          <div className="grid grid-cols-2 gap-8 mt-6 max-w-sm mx-auto">
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ArrowDownRight size={13} className="text-emerald-400" />
                <span className="text-xs text-muted-foreground">Total In</span>
              </div>
              <p className="font-cinzel text-emerald-400 font-semibold">{formatCurrency(totalDeposits)}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ArrowUpRight size={13} className="text-red-400" />
                <span className="text-xs text-muted-foreground">Total Out</span>
              </div>
              <p className="font-cinzel text-red-400 font-semibold">{formatCurrency(totalWithdrawals)}</p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button onClick={() => { setShowDepositForm(!showDepositForm); setShowWithdrawForm(false); }} className="btn-gold text-sm flex items-center gap-2">
              <Plus size={14} />
              Record Deposit
            </button>
          )}
          <button onClick={() => { setShowWithdrawForm(!showWithdrawForm); setShowDepositForm(false); }} className="btn-ghost text-sm flex items-center gap-2">
            <ArrowUpRight size={14} />
            Request Withdrawal
          </button>
          <button onClick={fetchLedger} className="btn-ghost text-sm flex items-center gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {/* Filter */}
          <div className="ml-auto flex items-center gap-2">
            <Filter size={13} className="text-muted-foreground" />
            {(['all', 'deposit', 'withdrawal'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg capitalize transition-all',
                  filter === f
                    ? 'bg-clan-gold/15 text-clan-gold border border-clan-gold/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-clan-border'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Deposit form */}
        <AnimatePresence>
          {showDepositForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel rounded-2xl p-5 border border-emerald-500/20 overflow-hidden"
            >
              <h3 className="font-cinzel text-emerald-400 text-sm mb-4">RECORD DEPOSIT</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Amount (₹)</label>
                  <input
                    type="number"
                    min="100"
                    className="input-dark"
                    placeholder="Min ₹100"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Note</label>
                  <input
                    className="input-dark"
                    placeholder="Monthly contribution…"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleDeposit} disabled={isSubmitting} className="btn-gold text-sm">
                  {isSubmitting ? 'Recording…' : 'Record Deposit'}
                </button>
                <button onClick={() => setShowDepositForm(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Withdraw request form */}
        <AnimatePresence>
          {showWithdrawForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel rounded-2xl p-5 border border-red-500/20 overflow-hidden"
            >
              <h3 className="font-cinzel text-red-400 text-sm mb-4">REQUEST WITHDRAWAL</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Your request will be submitted for clan approval via the governance system.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="input-dark"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Reason</label>
                  <input
                    className="input-dark"
                    placeholder="Reason for withdrawal…"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleWithdrawRequest} disabled={isSubmitting}
                  className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30
                             font-inter text-sm px-5 py-2 rounded-lg transition-all flex items-center gap-2">
                  <ArrowUpRight size={14} />
                  {isSubmitting ? 'Submitting…' : 'Submit Request'}
                </button>
                <button onClick={() => setShowWithdrawForm(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ledger table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl border border-clan-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-clan-border flex items-center justify-between">
            <h2 className="font-cinzel text-clan-gold/80 text-sm tracking-wider">PUBLIC LEDGER</h2>
            <span className="text-xs text-muted-foreground">{transactions.length} transactions</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-clan-gold/30 border-t-clan-gold animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-clan-border">
                    {['Transaction ID', 'Member', 'Type', 'Amount', 'Note', 'Status', 'Date'].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-[11px] font-cinzel text-clan-gold/50 tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, i) => {
                    const userName = txn.userId && typeof txn.userId === 'object' ? (txn.userId as any).name : 'Unknown';
                    return (
                    <motion.tr
                      key={txn._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-clan-border/40 hover:bg-clan-dark-3/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-muted-foreground">{txn.transactionId}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-foreground/90">{userName}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {txn.type === 'deposit'
                            ? <ArrowDownRight size={13} className="text-emerald-400" />
                            : <ArrowUpRight size={13} className="text-red-400" />
                          }
                          <span className={cn('text-xs capitalize', txn.type === 'deposit' ? 'text-emerald-400' : 'text-red-400')}>
                            {txn.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('font-cinzel text-sm font-semibold', txn.type === 'deposit' ? 'text-emerald-400' : 'text-red-400')}>
                          {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-muted-foreground max-w-[160px] truncate block">
                          {txn.note || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {txn.status === 'completed'
                            ? <CheckCircle size={12} className="text-emerald-400" />
                            : <Clock size={12} className="text-amber-400" />
                          }
                          <span className={cn('text-xs capitalize', txn.status === 'completed' ? 'text-emerald-400' : 'text-amber-400')}>
                            {txn.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-muted-foreground">{formatDateTime(txn.createdAt)}</span>
                      </td>
                    </motion.tr>
                    );
                  })}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground text-sm">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
