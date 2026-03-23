'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import TreeLegend from '@/components/tree/TreeLegend';
import TreeSearch from '@/components/tree/TreeSearch';
import TreeControls from '@/components/tree/TreeControls';
import NodePanel from '@/components/panels/NodePanel';
import { useTreeStore } from '@/hooks/useTree';
import { TreeNode } from '@/types';

const Tree = dynamic(() => import('react-d3-tree').then((m) => m.Tree), { ssr: false });

const INITIAL_ZOOM = 0.65;

export default function ShajraPage() {
  const { treeData, fetchTree, isLoading, selectNode, selectedNode, totalNodes, searchQuery } = useTreeStore();
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [translate, setTranslate] = useState({ x: 450, y: 120 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        setDimensions({ width: w, height: h });
        setTranslate({ x: w / 2, y: 120 });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  const handleNodeClick = useCallback(
    (nodeDatum: any) => selectNode(nodeDatum as TreeNode),
    [selectNode]
  );

  const renderCustomNode = useCallback(
    ({ nodeDatum }: any) => {
      const role = nodeDatum.attributes?.role;
      const isAlive = nodeDatum.attributes?.isAlive !== false;
      const status = nodeDatum.attributes?.status || (isAlive ? 'active' : 'deceased');
      const isPending = nodeDatum.attributes?.pendingApproval;
      const isSelected = selectedNode?._id === nodeDatum._id;
      const isDeceased = !isAlive;
      const isStatic = nodeDatum.attributes?.isStatic;
      const isFounder = isStatic && role === 'leader';
      const name = nodeDatum.name || '';
      const isMatch = searchQuery && name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let borderColor = '#22C55E';
      let textColor = '#FFFFFF';
      let statusColor = '#FFFFFF';
      let bgColor = '#1E293B';
      
      if (isMatch) {
        bgColor = '#F59E0B';
        borderColor = '#F59E0B';
        textColor = '#1E293B';
        statusColor = '#1E293B';
      } else if (isDeceased) {
        borderColor = '#EF4444';
        textColor = '#EF4444';
        statusColor = '#EF4444';
      } else if (isFounder) {
        borderColor = '#9333EA';
        statusColor = '#9333EA';
      } else if (isPending || status === 'pending') {
        borderColor = '#F59E0B';
        statusColor = '#F59E0B';
      } else if (role === 'leader') {
        borderColor = '#D4AF37';
        statusColor = '#D4AF37';
      } else if (role === 'admin') {
        borderColor = '#3B82F6';
        statusColor = '#3B82F6';
      }

      const BOX_W = 160;
      const BOX_H = 65;
      const BOX_RADIUS = 8;

      return (
        <g onClick={() => handleNodeClick(nodeDatum)} style={{ cursor: 'pointer' }}>
          {isSelected && (
            <rect
              x={-BOX_W/2 - 5}
              y={-BOX_H/2 - 5}
              width={BOX_W + 10}
              height={BOX_H + 10}
              rx={BOX_RADIUS + 3}
              fill="none"
              stroke={borderColor}
              strokeWidth="3"
            />
          )}
          
          <rect
            x={-BOX_W/2}
            y={-BOX_H/2}
            width={BOX_W}
            height={BOX_H}
            rx={BOX_RADIUS}
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={isSelected ? 3 : 2.5}
            strokeDasharray={isStatic && !isSelected ? '6 3' : undefined}
          />
          
          <foreignObject x={-BOX_W/2 + 5} y={-BOX_H/2 + 5} width={BOX_W - 10} height={BOX_H - 10}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <p
                style={{
                  color: textColor,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  margin: 0,
                  wordBreak: 'break-word',
                  lineHeight: '1.2',
                  maxHeight: '32px',
                  overflow: 'hidden',
                }}
                title={name}
              >
                {name}
              </p>
              <p
                style={{
                  color: statusColor,
                  fontSize: '10px',
                  fontWeight: 'bold',
                  margin: '4px 0 0 0',
                  textTransform: 'uppercase',
                }}
              >
                {isMatch ? 'MATCH!' : isDeceased ? 'DECEASED' : isFounder ? 'FOUNDER' : role === 'leader' ? 'LEADER' : role === 'admin' ? 'ADMIN' : 'MEMBER'}
              </p>
            </div>
          </foreignObject>
        </g>
      );
    },
    [handleNodeClick, selectedNode?._id, searchQuery]
  );

  const handleZoomIn  = () => setZoom((z) => Math.min(+(z + 0.1).toFixed(2), 2));
  const handleZoomOut = () => setZoom((z) => Math.max(+(z - 0.1).toFixed(2), 0.2));
  const handleReset   = () => { setZoom(INITIAL_ZOOM); setTranslate({ x: dimensions.width / 2, y: 120 }); };
  const handleCenter  = () => setTranslate({ x: dimensions.width / 2, y: 120 });

  return (
    <AppLayout>
      <div className="relative w-full h-screen bg-clan-black overflow-hidden" ref={containerRef}>
        {/* Visual Background Elements */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
            backgroundSize: '70px 70px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.02)_0%,transparent_70%)] pointer-events-none" />

        {/* UI Overlay: Title */}
        <div className="absolute top-6 left-8 z-20">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-cinzel text-clan-gold font-bold text-xl tracking-[0.2em]">SHAJRA</h1>
            <div className="h-[1px] w-full bg-gradient-to-r from-clan-gold/50 to-transparent mt-1" />
          </motion.div>
        </div>

        {/* UI Overlay: Stats */}
        <div className="absolute top-6 right-8 z-20">
          <div className="glass-panel px-4 py-2 rounded-lg border border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-2">Census:</span>
            <span className="text-clan-gold font-bold font-cinzel">{totalNodes}</span>
          </div>
        </div>

        <TreeSearch />

        {/* Tree Component */}
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-clan-black/20">
            <div className="w-10 h-10 rounded-full border-2 border-clan-gold/20 border-t-clan-gold animate-spin mb-4" />
            <p className="font-cinzel text-clan-gold/60 text-xs tracking-widest">FETCHING LINEAGE...</p>
          </div>
        ) : treeData ? (
          <Tree
            data={treeData as any}
            orientation="vertical"
            translate={translate}
            zoom={zoom}
            nodeSize={{ x: 240, y: 170 }}
            separation={{ siblings: 1.6, nonSiblings: 2 }}
            renderCustomNodeElement={renderCustomNode}
            pathFunc="step"
            pathClassFunc={() => 'rd3t-link'}
            transitionDuration={400}
            enableLegacyTransitions
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">Tree data could not be loaded.</p>
            <button onClick={fetchTree} className="btn-gold">Retry</button>
          </div>
        )}

        <TreeControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onCenter={handleCenter}
          onRefresh={fetchTree}
          isLoading={isLoading}
        />
        <TreeLegend />
        <NodePanel />
      </div>
    </AppLayout>
  );
}