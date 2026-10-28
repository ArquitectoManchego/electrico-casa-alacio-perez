import React from 'react';
import { Coffee, Refrigerator, Lightbulb, Monitor, Fan, Microwave, CookingPot, Plug, Blender } from 'lucide-react';
import { APPARATUS_LABEL_WIDTH, apparatusIconType, apparatusLabelHeight, wrapApparatusText, WIRE_COLORS } from '../utils/gabineteModel.js';

const ICONS = { coffee: Coffee, fridge: Refrigerator, light: Lightbulb, monitor: Monitor, fan: Fan, oven: Microwave, heat: CookingPot, plug: Plug, blender: Blender };
const number = (value, digits = 0) => value !== null && value !== undefined && Number.isFinite(Number(value))
  ? Number(value).toLocaleString('es-MX', { maximumFractionDigits: digits }) : '—';

export default function AparatosCircuito({ circuit, panelWidth, selected, onSelect, selectedLoad, onSelectLoad, onDragStart, onPointerStart, onPointerEnd }) {
  const moved = React.useRef(false);
  const left = circuit.side === 0;
  const x = left ? -APPARATUS_LABEL_WIDTH - 22 : panelWidth + 22;
  const connectorX = left ? -10 : panelWidth + 10;
  const labelEdge = left ? x + APPARATUS_LABEL_WIDTH : x;
  let offset = 0;
  const loads = circuit.loads.map(load => {
    const item = { load, y: circuit.y - 62 + offset };
    offset += apparatusLabelHeight(load);
    return item;
  });
  return <g className="cabinet-apparatus" opacity={selected && selected.id !== circuit.id ? .3 : 1}>
    <path d={`M${circuit.exit} ${circuit.y - 31}H${connectorX}V${loads.at(-1)?.y + 31 || circuit.y - 31}`} fill="none" stroke="#7195ab" strokeWidth="1.5" strokeDasharray="3 4"/>
    {loads.map(({ load, y }) => {
      const Icon = ICONS[apparatusIconType(load)] || Plug;
      const names = wrapApparatusText(load.tipo || 'Aparato sin nombre');
      const models = wrapApparatusText(load.modelo);
      const modelY = 46 + names.length * 18;
      const valuesY = modelY + Math.max(1, models.length) * 16 + 5;
      return <g key={load.id} data-aparato-id={load.id} data-circuito={circuit.circuitoNumero}>
        <path d={`M${connectorX} ${y + 31}H${labelEdge}`} stroke="#7195ab" strokeWidth="1.5"/>
        <g transform={`translate(${x} ${y})`} role="button" tabIndex="0" aria-label={`Aparato ${load.tipo}, circuito ${circuit.circuitoNumero}`} aria-pressed={onSelectLoad ? selectedLoad === load.id : selected?.id === circuit.id}
          style={{cursor:'grab',touchAction:'none'}}
          onPointerDown={e=>{moved.current=false;onPointerStart?.(e,load.id);}} onPointerUp={e=>{moved.current=!!onPointerEnd?.(e);}}
          draggable="true" onDragStart={e=>onDragStart?.(e,load.id)}
          onClick={() => {if(moved.current){moved.current=false;return;} if(onSelectLoad)onSelectLoad(selectedLoad===load.id?null:load.id);else onSelect(selected?.id === circuit.id ? null : circuit.id);}}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if(onSelectLoad)onSelectLoad(load.id);else onSelect(circuit.id); } }}>
          <title>{load.tipo} · {load.modelo} · {circuit.circuitoNumero}</title>
          <rect width={APPARATUS_LABEL_WIDTH} height={apparatusLabelHeight(load) - 8} fill={selectedLoad===load.id?'#163d45':'transparent'} stroke={selectedLoad===load.id?'#72efce':'none'} rx="6"/>
          <text x="0" y="15" fill={WIRE_COLORS[circuit.phases[0]] || '#b6cad8'} fontSize="13" fontWeight="700">{circuit.circuitoNumero} · FASE {circuit.fase} · {circuit.polos}P</text>
          <Icon x="0" y="29" width="26" height="26" color="#99e0d1" strokeWidth="1.6" aria-hidden="true"/>
          {names.map((line, i) => <text key={i} x="35" y={43 + i * 18} fill="#f0f5f9" fontSize="14" fontWeight="600">{line}</text>)}
          {models.map((line, i) => <text key={i} x="35" y={modelY + i * 16} fill="#a7becd" fontSize="12">{line}</text>)}
          <text x="0" y={valuesY} fill="#d4e3ed" fontSize="12">{number(load.watts)} W · {number(load.va)} VA · FP {number(load.fp, 2)}</text>
          <text x="0" y={valuesY + 18} fill="#d4e3ed" fontSize="12">In {number(load.inNom, 2)} A · Ic {number(load.icCorr, 2)} A</text>
          <text x="0" y={valuesY + 36} fill="#aac1d1" fontSize="12">{load.voltaje || 'Tensión pendiente'} · ITM {number(load.breaker)} A · {load.conductor || 'Calibre pendiente'}</text>
          <path d={`M0 ${apparatusLabelHeight(load) - 10}H${APPARATUS_LABEL_WIDTH}`} stroke="#3d5363"/>
        </g>
      </g>;
    })}
  </g>;
}
