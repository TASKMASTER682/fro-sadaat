'use client';

import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Compass } from 'lucide-react';

interface TreeControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onRefresh: () => void;
  onCenter: () => void;
  isLoading?: boolean;
}

const controlBtn = `w-9 h-9 glass-panel rounded-lg flex items-center justify-center
  text-clan-gold/60 hover:text-clan-gold border border-clan-border hover:border-clan-gold/30
  transition-all duration-200 active:scale-95`;

export default function TreeControls({
  zoom, onZoomIn, onZoomOut, onReset, onRefresh, onCenter, isLoading,
}: TreeControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 items-center">
      <button onClick={onZoomIn}  className={controlBtn} title="Zoom In"><ZoomIn size={15} /></button>
      <button onClick={onZoomOut} className={controlBtn} title="Zoom Out"><ZoomOut size={15} /></button>
      <button onClick={onReset}   className={controlBtn} title="Reset View"><Maximize2 size={14} /></button>
      <button onClick={onCenter}  className={controlBtn} title="Center Root"><Compass size={15} /></button>
      <button
        onClick={onRefresh}
        className={controlBtn}
        title="Refresh Tree"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
      </button>

      {/* Zoom level badge */}
      <div className="glass-panel rounded-lg px-2.5 py-1 border border-clan-border mt-1">
        <span className="text-[10px] font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
