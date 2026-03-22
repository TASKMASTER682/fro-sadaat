'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pages, total, limit, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-clan-border">
      <p className="text-xs text-muted-foreground">
        Showing <span className="text-foreground/80">{from}–{to}</span> of{' '}
        <span className="text-foreground/80">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 rounded-lg border border-clan-border flex items-center justify-center
                     text-muted-foreground hover:text-clan-gold hover:border-clan-gold/30
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
          let p = i + 1;
          if (pages > 5) {
            if (page <= 3) p = i + 1;
            else if (page >= pages - 2) p = pages - 4 + i;
            else p = page - 2 + i;
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 rounded-lg border text-xs font-mono transition-all',
                p === page
                  ? 'bg-clan-gold/15 border-clan-gold/30 text-clan-gold font-semibold'
                  : 'border-clan-border text-muted-foreground hover:text-foreground hover:border-clan-gold/20'
              )}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="w-8 h-8 rounded-lg border border-clan-border flex items-center justify-center
                     text-muted-foreground hover:text-clan-gold hover:border-clan-gold/30
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
