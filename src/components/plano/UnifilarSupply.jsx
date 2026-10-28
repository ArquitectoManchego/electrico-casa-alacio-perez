import React from 'react';
import { buildSupplyScene } from '../../utils/unifilarSupplyLayout.js';

export function BreakerSymbol({ x=0, y=0, radius=12 }) {
  return <g fill="white" stroke="black" strokeWidth="1.5"><path d={`M${x-radius} ${y} A${radius} ${radius} 0 0 1 ${x+radius} ${y}`} fill="none"/><circle cx={x-radius} cy={y} r="2.3"/><circle cx={x+radius} cy={y} r="2.3"/></g>;
}

export default function UnifilarSupply({ model }) {
  return <g data-layout="supply" stroke="black" strokeWidth="1.4" fill="none">
    {buildSupplyScene(model).map((p,i) => {
      if(p.type==='text') return <text key={i} x={p.x} y={p.y} fontSize={p.size} fill="black" stroke="none">{p.value}</text>;
      if(p.type==='line') return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}/>;
      if(p.type==='circle') return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="white"/>;
      if(p.type==='rect') return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h}/>;
      if(p.type==='triangle') return <polygon key={i} points={p.points.map(v=>v.join(',')).join(' ')} fill="black"/>;
      if(p.type==='breaker') return <path key={i} d={`M${p.cx-p.r} ${p.cy} A${p.r} ${p.r} 0 0 1 ${p.cx+p.r} ${p.cy}`}/>;
      if(p.type==='meterArc') return <path key={i} d={`M${p.x} ${p.y} Q${p.x+p.w/2} ${p.y+p.h*2} ${p.x+p.w} ${p.y}`}/>;
      return null;
    })}
  </g>;
}
