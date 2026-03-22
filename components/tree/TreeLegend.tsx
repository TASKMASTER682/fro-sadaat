'use client';

const legendItems = [
  { color: '#9333EA', label: 'Founder' },
  { color: '#D4AF37', label: 'Leader' },
  { color: '#3B82F6', label: 'Admin' },
  { color: '#22C55E', label: 'Active Member' },
  { color: '#EF4444', label: 'Deceased' },
  { color: '#F59E0B', label: 'Pending' },
];

export default function TreeLegend() {
  return (
    <div className="absolute bottom-6 left-6 glass-panel rounded-xl p-3 z-10">
      <p className="font-cinzel text-[10px] text-clan-gold/60 tracking-widest mb-2">LEGEND</p>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded"
              style={{ 
                backgroundColor: '#1E293B',
                border: `2px solid ${item.color}`
              }}
            />
            <span className="text-[11px] text-white/80 font-inter">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
