import { useState, useCallback } from 'react';
import { Proposal } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProposals = useCallback(async (params: Record<string, string> = {}) => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await api.get(`/proposals?${qs}`);
      setProposals(res.data.data);
    } catch {
      toast.error('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProposal = useCallback(async (data: {
    title: string;
    description: string;
    type: string;
    targetUser?: string;
    newRole?: string;
    relatedTransaction?: string;
  }) => {
    const res = await api.post('/proposals', data);
    return res.data.data as Proposal;
  }, []);

  const vote = useCallback(async (proposalId: string, vote: 'approve' | 'reject', comment?: string) => {
    const res = await api.post(`/proposals/${proposalId}/vote`, { vote, comment });
    return res.data.data as Proposal;
  }, []);

  return { proposals, isLoading, fetchProposals, createProposal, vote };
}
