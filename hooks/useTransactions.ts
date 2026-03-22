import { useState, useCallback } from 'react';
import { Transaction } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface LedgerResult {
  transactions: Transaction[];
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  total: number;
  pages: number;
}

export function useTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<LedgerResult>({
    transactions: [],
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    total: 0,
    pages: 1,
  });

  const fetchLedger = useCallback(async (params: Record<string, string> = {}) => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await api.get(`/transactions?${qs}`);
      setData({
        transactions: res.data.data,
        balance: res.data.balance || 0,
        totalDeposits: res.data.totalDeposits || 0,
        totalWithdrawals: res.data.totalWithdrawals || 0,
        total: res.data.total || 0,
        pages: res.data.pages || 1,
      });
    } catch {
      toast.error('Failed to load ledger');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deposit = useCallback(async (amount: number, note: string, userId?: string) => {
    const res = await api.post('/transactions/deposit', { amount, note, userId });
    return res.data.data as Transaction;
  }, []);

  const withdrawRequest = useCallback(async (amount: number, note: string) => {
    const res = await api.post('/transactions/withdraw-request', { amount, note });
    return res.data.data as Transaction;
  }, []);

  const approveWithdrawal = useCallback(async (txnId: string) => {
    const res = await api.put(`/transactions/${txnId}/approve`);
    return res.data.data as Transaction;
  }, []);

  return { ...data, isLoading, fetchLedger, deposit, withdrawRequest, approveWithdrawal };
}
