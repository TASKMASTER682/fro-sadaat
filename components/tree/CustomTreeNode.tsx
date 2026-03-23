'use client';

import { motion } from 'framer-motion';
import { getNodeColor, getInitials } from '@/lib/utils';
import { TreeNode } from '@/types';

interface CustomNodeProps {
  nodeDatum: TreeNode;
  onNodeClick: (node: TreeNode) => void;
  selectedNodeId?: string | null;
}

export default function CustomTreeNode({ nodeDatum, onNodeClick, selectedNodeId }: CustomNodeProps) {
  const { name, attributes, _id } = nodeDatum;
  const role = attributes?.role as any;
  const isAlive = attributes?.isAlive !== false;
  const status = attributes?.status || (isAlive ? 'active' : 'deceased');
  const isStatic = attributes?.isStatic;
  const isPending = attributes?.pendingApproval;
  const isSelected = selectedNodeId === _id;

  const color = getNodeColor(role, isAlive, isPending ? 'pending' : status);
  const initials = getInitials(name);

  // Node radius
  const R = 22;

  return (
    <g onClick={() => onNodeClick(nodeDatum)} style={{ cursor: 'pointer' }}>
      {/* Glow ring for selected */}
      {isSelected && (
        <circle
          r={R + 8}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.5}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      )}

      {/* Outer ring */}
      <circle
        r={R + 3}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={isSelected ? 0.8 : 0.3}
        strokeDasharray={isStatic ? '4 2' : undefined}
      />

      {/* Main circle */}
      <circle
        r={R}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{
          filter: isSelected ? `drop-shadow(0 0 12px ${color})` : undefined,
        }}
      />

      {/* Initials text */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={11}
        fontFamily="'Cinzel', serif"
        fontWeight="700"
        y={0}
      >
        {initials}
      </text>

      {/* Role indicator dot */}
      {role === 'leader' && (
        <circle cx={R - 4} cy={-(R - 4)} r={5} fill="#D4AF37" stroke="#0A0A0A" strokeWidth={1.5} />
      )}
      {role === 'admin' && (
        <circle cx={R - 4} cy={-(R - 4)} r={4} fill="#3B82F6" stroke="#0A0A0A" strokeWidth={1.5} />
      )}
      {isPending && (
        <circle cx={R - 4} cy={-(R - 4)} r={4} fill="#F59E0B" stroke="#0A0A0A" strokeWidth={1.5} />
      )}

      {/* Name label - full name */}
      <foreignObject x={-55} y={R + 4} width={110} height={50} style={{ overflow: 'visible' }}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            textAlign: 'center',
            fontSize: '9px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            color: 'rgba(245,215,110,0.9)',
            whiteSpace: 'nowrap',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
          title={name}
        >
          {name}
        </div>
      </foreignObject>

      {/* Contribution label (if any) */}
      {!!attributes?.contributions && attributes.contributions > 0 && (
        <foreignObject x={-55} y={R + 20} width={110} height={20} style={{ overflow: 'visible' }}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              textAlign: 'center',
              fontSize: '7px',
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(212,175,55,0.5)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            ₹{(attributes.contributions / 1000).toFixed(1)}k
          </div>
        </foreignObject>
      )}
    </g>
  );
}
