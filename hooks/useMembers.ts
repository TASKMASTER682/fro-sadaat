import { useState, useCallback } from 'react';
import { User } from '@/types';
import api from '@/lib/api';

interface UseMembers {
  members: User[];
  isLoading: boolean;
  total: number;
  fetchMembers: (params?: Record<string, string>) => Promise<void>;
}

export function useMembers(): UseMembers {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(async (params: Record<string, string> = {}) => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await api.get(`/users?${qs}`);
      setMembers(res.data.data);
      setTotal(res.data.count);
    } catch (err) {
      console.error('useMembers error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { members, isLoading, total, fetchMembers };
}
