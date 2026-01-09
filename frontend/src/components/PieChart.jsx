import React from 'react'

const defaultColors = ['#6366F1','#06B6D4','#F59E0B','#10B981','#EF4444','#8B5CF6'];

export function Pie({ data = [], size = 180, innerRadius = 60, colors = [] }){
  const total = data.reduce((s,d)=>s + (d.value||0), 0) || 1;
  const cx = size/2, cy = size/2, r = size/2 - 4;
  let angle = -90;
  const slices = data.map((d, i) => {
    const value = d.value || 0;
    const delta = (value/total) * 360;
    const start = angle;
    const end = angle + delta;
    angle += delta;
    const large = delta > 180 ? 1 : 0;
    const startRad = (Math.PI/180) * (start);
    const endRad = (Math.PI/180) * (end);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { path, color: colors[i] || defaultColors[i % defaultColors.length], label: d.label, value };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} className="stroke-white dark:stroke-slate-800" strokeWidth="2" style={{cursor: 'pointer'}}>
            <title>{`${s.label}: ${s.value}`}</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={innerRadius} className="fill-white dark:fill-slate-800" />
      </svg>
      <div>
        {data.map((d,i)=> (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span style={{width:12,height:12,background: colors[i] || defaultColors[i % defaultColors.length]}} className="inline-block rounded-sm"></span>
            <span className="text-slate-500 dark:text-neutral-400">{d.label}</span>
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Pie;
