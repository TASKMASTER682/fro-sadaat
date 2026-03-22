'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AncestorNode {
  _id: string;
  name: string;
  role: string;
}

interface LineageBreadcrumbProps {
  lineage: AncestorNode[];
  currentId?: string;
}

const roleColor: Record<string, string> = {
  leader: 'text-clan-gold',
  admin: 'text-blue-400',
  member: 'text-foreground/70',
};

export default function LineageBreadcrumb({ lineage, currentId }: LineageBreadcrumbProps) {
  if (!lineage.length) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {lineage.map((ancestor, i) => (
        <div key={ancestor._id} className="flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium transition-colors',
              ancestor._id === currentId
                ? 'text-clan-gold font-semibold'
                : roleColor[ancestor.role] || 'text-foreground/60',
              i === lineage.length - 1 ? '' : 'opacity-80'
            )}
          >
            {ancestor.name}
          </span>
          {i < lineage.length - 1 && (
            <ChevronRight size={11} className="text-muted-foreground/40 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
