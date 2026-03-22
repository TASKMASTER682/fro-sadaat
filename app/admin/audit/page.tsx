'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, RefreshCw, Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ACTION_COLOR: Record<string, any> = {
  USER_REGISTERED: 'green',
  USER_LOGIN: 'blue',
  USER_UPDATED: 'amber',
  USER_DELETED: 'red',
  LINEAGE_UPDATED: 'gold',
  DEPOSIT_CREATED: 'green',
  WITHDRAWAL_REQUESTED: 'amber',
  WITHDRAWAL_APPROVED: 'green',
  PROPOSAL_CREATED: 'blue',
  PROPOSAL_VOTED: 'gold',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actionFilter) params.set('action', actionFilter);
      const res = await api.get(`/audit?${params}`);
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    {
      key: 'action',
      header: 'Action',
      render: (log: AuditLog) => (
        <Badge variant={ACTION_COLOR[log.action] || 'ghost'}>
          {log.action.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      render: (log: AuditLog) => (
        <span className="text-sm text-foreground/80">
          {log.performedBy ? log.performedBy.name : <span className="text-muted-foreground italic">System</span>}
        </span>
      ),
    },
    {
      key: 'targetUser',
      header: 'Target',
      render: (log: AuditLog) => (
        <span className="text-sm text-foreground/70">
          {log.targetUser ? log.targetUser.name : '—'}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (log: AuditLog) => (
        <span className="text-xs text-muted-foreground font-mono max-w-[200px] truncate block">
          {log.details ? JSON.stringify(log.details).slice(0, 60) + '…' : '—'}
        </span>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      render: (log: AuditLog) => (
        <span className="text-xs text-muted-foreground font-mono">{log.ipAddress || '—'}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (log: AuditLog) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
      ),
    },
  ];

  const pages = Math.ceil(total / limit);

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <PageHeader
          title="AUDIT LOGS"
          subtitle="Complete action trail for all clan operations"
          icon={ScrollText}
          action={
            <button onClick={fetchLogs} className="btn-ghost text-sm flex items-center gap-2">
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          }
        />

        {/* Filter bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              placeholder="Filter by action…"
              className="input-dark pl-9 text-sm"
            />
          </div>
        </motion.div>

        {/* Quick action filters */}
        <div className="flex flex-wrap gap-2">
          {['', 'USER', 'LINEAGE', 'DEPOSIT', 'WITHDRAWAL', 'PROPOSAL'].map((prefix) => (
            <button
              key={prefix}
              onClick={() => { setActionFilter(prefix); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
                actionFilter === prefix
                  ? 'bg-clan-gold/15 text-clan-gold border-clan-gold/30'
                  : 'border-clan-border text-muted-foreground hover:border-clan-gold/20 hover:text-foreground'
              }`}
            >
              {prefix || 'All Actions'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 text-sm text-muted-foreground"
        >
          <span>Total: <span className="text-foreground/80 font-mono">{total.toLocaleString()}</span> entries</span>
          <span className="text-clan-border">|</span>
          <span>Page <span className="text-foreground/80">{page}</span> of <span className="text-foreground/80">{pages || 1}</span></span>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Action Log</CardTitle>
            </CardHeader>
            <DataTable
              columns={columns}
              data={logs}
              keyExtractor={(log) => log._id}
              isLoading={isLoading}
              emptyMessage="No audit logs found."
            />
            <Pagination page={page} pages={pages} total={total} limit={limit} onPageChange={setPage} />
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
