import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Zap, RefreshCw, Sparkles, Trash2, Plus, X, AlertTriangle,
  CheckCircle2, Info, BarChart3, ArrowLeftRight, Sliders,
} from 'lucide-react';
import {
  calcularVA,
  calcularCorrienteNominal,
  calcularCorrienteCorregida,
  seleccionarProteccion,
  calcularDesbalanceUVIE,
  balancearCargasAutomatico,
} from '../utils/ecuacionesUVIE';

const FASE_COLOR = {
  A:       { bg: 'bg-rose-500',    border: 'border-rose-500',    text: 'text-rose-400',    hex: '#f43f5e' },
  B:       { bg: 'bg-sky-500',     border: 'border-sky-500',     text: 'text-sky-400',     hex: '#38bdf8' },
  C:       { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', hex: '#34d399' },
  'A-B':   { bg: 'bg-violet-500',  border: 'border-violet-500',  text: 'text-violet-400',  hex: '#a78bfa' },
  'B-C':   { bg: 'bg-teal-500',    border: 'border-teal-500',    text: 'text-teal-400',    hex: '#2dd4bf' },
  'A-C':   { bg: 'bg-orange-500',  border: 'border-orange-500',  text: 'text-orange-400',  hex: '#fb923c' },
  'A-B-C': { bg: 'bg-yellow-500',  border: 'border-yellow-500',  text: 'text-yellow-400',  hex: '#facc15' },
};
const getFaseColor = (fase) => FASE_COLOR[fase] || FASE_COLOR['A'];

const getIcon = (tipo = '') => {
  const t = tipo.toLowerCase();
  if (t.includes('calor') || t.includes('horno') || t.includes('plancha') || t.includes('parrilla')) return '\uD83D\uDD25';
  if (t.includes('frio') || t.includes('refrig') || t.includes('congelad') || t.includes('vitrina')) return '\u2744\uFE0F';
  if (t.includes('motor') || t.includes('bomba') || t.includes('compresor')) return '\u2699\uFE0F';
  if (t.includes('luz') || t.includes('ilum') || t.includes('lampara') || t.includes('led')) return '\uD83D\uDCA1';
  if (t.includes('comput') || t.includes('monitor') || t.includes('pc')) return '\uD83D\uDCBB';
  if (t.includes('ventilad') || t.includes('extractor') || t.includes('aire')) return '\uD83C\uDF00';
  if (t.includes('cafe') || t.includes('espresso')) return '\u2615';
  if (t.includes('licuad') || t.includes('batidora') || t.includes('mezcl')) return '\uD83E\uDD64';
  if (t.includes('microond')) return '\uD83D\uDCE1';
  return '\u26A1';
};

function TarjetaAparato({ aparato, breaker, breakers, onMoveToBreaker, isHighlighted, onDragStart }) {
  const [showMenu, setShowMenu] = useState(false);
  const va  = calcularVA(aparato.watts, aparato.fp, aparato.usarVaDirecto);
  const in_ = calcularCorrienteNominal(va, aparato.tipoCarga);
  const ic  = calcularCorrienteCorregida(in_);
  const fase = breaker ? breaker.fase : null;
  const fc   = fase ? getFaseColor(fase) : null;

  return (
    <div
      draggable="true"
      onDragStart={(e) => onDragStart(e, aparato.id)}
      className={`relative rounded-xl border transition-all duration-200 overflow-visible cursor-grab active:cursor-grabbing ${
        isHighlighted && fc
          ? fc.border + ' bg-slate-900/90 shadow-lg'
          : 'border-slate-800/70 bg-slate-900/40 hover:border-slate-700'
      }`}
      style={isHighlighted && fc ? { boxShadow: `0 0 12px ${fc.hex}30` } : {}}
    >
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm flex-shrink-0">{getIcon(aparato.tipo)}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-200 truncate">{aparato.tipo}</p>
              <p className="text-[9px] text-slate-500 truncate">{aparato.modelo || '\u2014'}</p>
            </div>
          </div>
          {breaker && fc && (
            <span className={`flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${fc.bg} text-slate-950 font-mono`}>
              {breaker.circuitoNumero}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-slate-950/60 rounded-lg p-1 text-center">
            <p className="text-[7px] text-slate-600 uppercase leading-none mb-0.5">W</p>
            <p className="text-[9px] font-bold font-mono text-slate-300">{aparato.watts}</p>
          </div>
          <div className="bg-slate-950/60 rounded-lg p-1 text-center">
            <p className="text-[7px] text-slate-600 uppercase leading-none mb-0.5">Ic</p>
            <p className="text-[9px] font-bold font-mono text-slate-300">{ic.toFixed(1)}A</p>
          </div>
          <div className="bg-slate-950/60 rounded-lg p-1 text-center">
            <p className="text-[7px] text-slate-600 uppercase leading-none mb-0.5">F</p>
            <p className={`text-[9px] font-bold font-mono ${fc ? fc.text : 'text-slate-500'}`}>{fase || '\u2014'}</p>
          </div>
        </div>
        {breakers.length > 0 && (
          <div className="relative mt-1.5">
            <button onClick={() => setShowMenu(v => !v)}
              className="w-full text-[8px] text-slate-600 hover:text-teal-400 transition flex items-center justify-center gap-1 py-0.5 rounded hover:bg-slate-800/50 cursor-pointer">
              <ArrowLeftRight size={8} /> Mover
            </button>
            {showMenu && (
              <div className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden min-w-max">
                {breakers.filter(b => b.id !== breaker?.id).map(b => {
                  const bfc = getFaseColor(b.fase);
                  return (
                    <button key={b.id}
                      onClick={() => { onMoveToBreaker(aparato.id, b.id); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
                      <span className={`w-1.5 h-1.5 rounded-full ${bfc.bg} flex-shrink-0`} />
                      <span className="font-mono">{b.circuitoNumero}</span>
                      <span className="text-slate-500">{b.capacidad}A \u00b7 {b.fase}</span>
                    </button>
                  );
                })}
                <button onClick={() => setShowMenu(false)}
                  className="w-full text-center py-1 text-[9px] text-slate-600 hover:bg-slate-800 cursor-pointer">Cancelar</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BreakerCard({ breaker, aparatos, onDelete, onChangeCapacidad, onCycleFase, highlighted, onDragStart, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fc       = getFaseColor(breaker.fase);
  const cargaPct = breaker.capacidad > 0 ? Math.min(100, (breaker.icTotal / breaker.capacidad) * 100) : 0;
  const barColor = cargaPct > 80 ? 'bg-rose-500' : cargaPct > 60 ? 'bg-amber-400' : 'bg-emerald-400';
  const brkAps   = aparatos.filter(ap => breaker.aparatos.includes(ap.id));
  const CAPS     = [15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150];

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e, breaker.id);
      }}
      className={`rounded-xl border transition-all duration-300 overflow-hidden bg-[#080e1a] ${
        isDragOver ? 'ring-2 ring-violet-500 scale-[1.01]' : ''
      }`}
      style={{
        borderColor: isDragOver ? '#8b5cf6' : highlighted ? fc.hex + '88' : '#1e293b',
        boxShadow: isDragOver ? '0 0 16px #8b5cf633' : highlighted ? `0 0 16px ${fc.hex}33` : 'none',
      }}
    >
      <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-800/50"
        style={{ background: `linear-gradient(90deg, ${fc.hex}18 0%, transparent 100%)` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
            style={{ borderColor: fc.hex, background: fc.hex + '22' }}>
            <span className="text-[6px] font-black" style={{ color: fc.hex }}>ITM</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-300 font-mono leading-none">{breaker.circuitoNumero}</p>
            <p className="text-[7px] text-slate-600 leading-none mt-0.5">{breaker.polos === 3 ? '3F' : breaker.polos === 2 ? '2F' : '1F'} \u00b7 {breaker.fase}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <select value={breaker.capacidad} onChange={e => onChangeCapacidad(breaker.id, parseInt(e.target.value))}
            className="text-[8px] bg-slate-950 border border-slate-800 rounded px-1 py-0.5 font-mono font-bold cursor-pointer focus:outline-none"
            style={{ color: fc.hex }}>
            {CAPS.map(c => <option key={c} value={c}>{c}A</option>)}
          </select>
          {breaker.polos === 1 && (
            <button onClick={() => onCycleFase(breaker.id)} title="Cambiar fase"
              className="text-[7px] font-bold px-1 py-0.5 rounded border cursor-pointer hover:bg-slate-800 transition"
              style={{ borderColor: fc.hex + '88', color: fc.hex }}>
              {breaker.fase}
            </button>
          )}
          <button onClick={() => onDelete(breaker.id)} className="p-0.5 text-slate-700 hover:text-rose-400 transition cursor-pointer">
            <X size={10} />
          </button>
        </div>
      </div>
      <div className="px-2.5 py-1.5 border-b border-slate-800/30">
        <div className="flex justify-between text-[7px] font-mono text-slate-600 mb-1">
          <span>Ic: {breaker.icTotal.toFixed(1)}A / {breaker.capacidad}A</span>
          <span className={cargaPct > 80 ? 'text-rose-400 font-bold' : ''}>{cargaPct.toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${cargaPct}%` }} />
        </div>
      </div>
      <div className="p-1.5 space-y-0.5 max-h-28 overflow-y-auto">
        {brkAps.length === 0
          ? <p className="text-[8px] text-slate-700 text-center py-2 italic">Vac\u00edo</p>
          : brkAps.map(ap => (
              <div
                key={ap.id}
                draggable="true"
                onDragStart={(e) => onDragStart(e, ap.id)}
                className="flex items-center gap-1 px-1 py-0.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/40 cursor-grab active:cursor-grabbing"
              >
                <span className="text-[9px]">{getIcon(ap.tipo)}</span>
                <p className="text-[8px] font-medium text-slate-400 truncate flex-1">{ap.tipo}</p>
                <span className="text-[7px] font-mono text-slate-600">{ap.watts}W</span>
              </div>
            ))
        }
      </div>
    </div>
  );
}

function VistaFisicaTablero({ breakers, aparatos, selectedPanelSize, acometida }) {
  const rowCount = Math.max(1, Math.ceil(selectedPanelSize / 2));
  const panelHeight = 160 + rowCount * 55 + 60;
  
  const slotUsage = new Array(selectedPanelSize + 1).fill(null);
  const leftOddSlots = [];
  const rightEvenSlots = [];
  for (let i = 1; i <= selectedPanelSize; i++) {
    if (i % 2 !== 0) leftOddSlots.push(i);
    else rightEvenSlots.push(i);
  }

  const placements = [];
  const unplaced = [];

  breakers.forEach((brk) => {
    let assignedSlots = [];
    let side = '';
    const p = brk.polos || 1;

    const leftCount = slotUsage.filter((v, idx) => idx % 2 !== 0 && v !== null).length;
    const rightCount = slotUsage.filter((v, idx) => idx % 2 === 0 && v !== null).length;
    const sidesToCheck = leftCount <= rightCount ? ['left', 'right'] : ['right', 'left'];

    for (const activeSide of sidesToCheck) {
      const candidates = activeSide === 'left' ? leftOddSlots : rightEvenSlots;
      const found = candidates.find(s => {
        let fits = true;
        for (let step = 0; step < p; step++) {
          const checkSlot = s + step * 2;
          if (checkSlot > selectedPanelSize || slotUsage[checkSlot] !== null) {
            fits = false;
            break;
          }
        }
        return fits;
      });

      if (found) {
        side = activeSide;
        for (let step = 0; step < p; step++) {
          const assignSlot = found + step * 2;
          slotUsage[assignSlot] = brk.id;
          assignedSlots.push(assignSlot);
        }
        break;
      }
    }

    if (assignedSlots.length > 0) {
      const startSlot = assignedSlots[0];
      const startRow = Math.floor((startSlot - 1) / 2);
      placements.push({
        breaker: brk,
        side,
        slots: assignedSlots,
        y: 160 + startRow * 55,
        height: p * 55 - 5,
        startRow
      });
    } else {
      unplaced.push(brk);
    }
  });

  const getSlotPhase = (s) => {
    const r = Math.floor((s - 1) / 2);
    if (acometida?.id === 'trifasico') {
      return ['A', 'B', 'C'][r % 3];
    } else if (acometida?.id === 'bifasico') {
      return ['A', 'B'][r % 2];
    }
    return 'A';
  };

  const getFaseColorHex = (fase) => {
    if (fase === 'A') return '#f43f5e';
    if (fase === 'B') return '#38bdf8';
    if (fase === 'C') return '#34d399';
    return '#fb923c';
  };

  const CARD_WIDTH = 260;
  const CARD_GAP = 14;
  // Pixel breakdown of card content (Tailwind p-2 = 8px, text-[9px] ≈ 14px line-height):
  //   outer padding top+bottom : 16px
  //   header (text + pb-1 + border-b) : 17px
  //   items container py-1 top+bot   :  8px
  //   footer (pt-0.5 + border + text) : 14px
  //   safety buffer                   :  2px
  //   BASE total (0 items)            : 57px
  //   each item: text 14px + space-y-1 4px = 18px
  const BASE_CARD_H = 57;
  const PER_ITEM_H  = 18;

  const cardLayout = {};

  const computeSideLayout = (sidePlacements) => {
    let cursor = 30;
    sidePlacements.forEach(({ idx, p }) => {
      const brkAps = aparatos.filter(ap => p.breaker.aparatos.includes(ap.id));
      const cardH = BASE_CARD_H + brkAps.length * PER_ITEM_H;
      const brkMid = p.y + p.height / 2;
      const idealY = brkMid - cardH / 2;
      const cardY = Math.max(cursor, idealY);
      cardLayout[idx] = { cardY, cardH, brkAps };
      cursor = cardY + cardH + CARD_GAP;
    });
  };

  const leftPlacements  = placements.map((p, i) => ({ idx: i, p })).filter(x => x.p.side === 'left');
  const rightPlacements = placements.map((p, i) => ({ idx: i, p })).filter(x => x.p.side === 'right');
  computeSideLayout(leftPlacements);
  computeSideLayout(rightPlacements);

  const LEFT_TRUNK_X  = 310;
  const RIGHT_TRUNK_X = 890;
  const LEFT_CARD_X   = 30;
  const RIGHT_CARD_X  = 910;

  const leftBottom  = leftPlacements.length  > 0 ? (cardLayout[leftPlacements[leftPlacements.length - 1].idx]?.cardY ?? 0) + (cardLayout[leftPlacements[leftPlacements.length - 1].idx]?.cardH ?? 0) : panelHeight;
  const rightBottom = rightPlacements.length > 0 ? (cardLayout[rightPlacements[rightPlacements.length - 1].idx]?.cardY ?? 0) + (cardLayout[rightPlacements[rightPlacements.length - 1].idx]?.cardH ?? 0) : panelHeight;
  const svgHeight = Math.max(panelHeight, leftBottom + 40, rightBottom + 40);

  return (
    <div className="space-y-4">
      {unplaced.length > 0 && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-800/40 text-rose-450 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-400" />
          <span>¡Sobrecupo! El modelo Square D de {selectedPanelSize} espacios no puede alojar todos los circuitos ({breakers.length} requeridos). Selecciona un modelo con mayor capacidad.</span>
        </div>
      )}

      <div className="bg-[#050b14] border border-slate-900 rounded-2xl p-4 overflow-x-auto flex justify-center">
        <svg width="1200" height={svgHeight} viewBox={`0 0 1200 ${svgHeight}`} className="max-w-full">
          <defs>
            <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="busbarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="breakerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          <rect x="340" y="30" width="520" height={150 + rowCount * 55 - 20} rx="12" fill="url(#metalGradient)" stroke="#1e293b" strokeWidth="4" />
          <rect x="365" y="55" width="470" height={150 + rowCount * 55 - 70} rx="6" fill="#090d16" stroke="#334155" strokeWidth="2" />

          {[410, 600, 790].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy="30" r="18" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx={cx} cy={150 + rowCount * 55 - 20} r="18" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="3,3" />
            </g>
          ))}

          <rect x="375" y="70" width="10" height={150 + rowCount * 55 - 100} fill="#cbd5e1" rx="2" />
          <rect x="815" y="70" width="10" height={150 + rowCount * 55 - 100} fill="#4f5e71" rx="2" />
          
          {Array.from({ length: Math.min(18, rowCount * 3) }).map((_, idx) => (
            <g key={idx}>
              <circle cx="380" cy={90 + idx * 22} r="3" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
              <circle cx="820" cy={90 + idx * 22} r="3" fill="#e2e8f0" stroke="#475569" strokeWidth="0.5" />
            </g>
          ))}

          <rect x="420" y="70" width="30" height="30" rx="3" fill="#cbd5e1" stroke="#475569" />
          <circle cx="435" cy="85" r="8" fill="#334155" />
          <text x="435" y="88" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">N</text>
          
          {acometida?.id === 'monofasico' && (
            <g>
              <rect x="585" y="70" width="30" height="30" rx="3" fill="#f43f5e" stroke="#7f1d1d" />
              <circle cx="600" cy="85" r="8" fill="#334155" />
              <text x="600" y="88" textAnchor="middle" fill="#f43f5e" fontSize="8" fontWeight="bold" fontFamily="monospace">L1</text>
              <path d="M 600,30 L 600,70" stroke="#f43f5e" strokeWidth="6" fill="none" />
            </g>
          )}

          {acometida?.id === 'bifasico' && (
            <g>
              <rect x="550" y="70" width="30" height="30" rx="3" fill="#f43f5e" stroke="#7f1d1d" />
              <circle cx="565" cy="85" r="8" fill="#334155" />
              <text x="565" y="88" textAnchor="middle" fill="#f43f5e" fontSize="8" fontWeight="bold" fontFamily="monospace">L1</text>
              <path d="M 565,30 Q 565,55 565,70" stroke="#f43f5e" strokeWidth="6" fill="none" />
              
              <rect x="620" y="70" width="30" height="30" rx="3" fill="#38bdf8" stroke="#0369a1" />
              <circle cx="635" cy="85" r="8" fill="#334155" />
              <text x="635" y="88" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">L2</text>
              <path d="M 635,30 Q 635,55 635,70" stroke="#38bdf8" strokeWidth="6" fill="none" />
            </g>
          )}

          {acometida?.id === 'trifasico' && (
            <g>
              <rect x="520" y="70" width="30" height="30" rx="3" fill="#f43f5e" stroke="#7f1d1d" />
              <circle cx="535" cy="85" r="8" fill="#334155" />
              <text x="535" y="88" textAnchor="middle" fill="#f43f5e" fontSize="8" fontWeight="bold" fontFamily="monospace">L1</text>
              <path d="M 535,30 Q 535,50 535,70" stroke="#f43f5e" strokeWidth="5" fill="none" />

              <rect x="585" y="70" width="30" height="30" rx="3" fill="#38bdf8" stroke="#0369a1" />
              <circle cx="600" cy="85" r="8" fill="#334155" />
              <text x="600" y="88" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">L2</text>
              <path d="M 600,30 L 600,70" stroke="#38bdf8" strokeWidth="5" fill="none" />

              <rect x="650" y="70" width="30" height="30" rx="3" fill="#34d399" stroke="#065f46" />
              <circle cx="665" cy="85" r="8" fill="#334155" />
              <text x="665" y="88" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold" fontFamily="monospace">L3</text>
              <path d="M 665,30 Q 665,50 665,70" stroke="#34d399" strokeWidth="5" fill="none" />
            </g>
          )}

          <path d="M 435,30 L 435,70" stroke="#ffffff" strokeWidth="5" fill="none" />

          {Array.from({ length: rowCount }).map((_, rIdx) => {
            const yOffset = 160 + rIdx * 55;
            const leftSlot = rIdx * 2 + 1;
            const rightSlot = rIdx * 2 + 2;

            const leftPhase = getSlotPhase(leftSlot);
            const rightPhase = getSlotPhase(rightSlot);

            const leftColor = getFaseColorHex(leftPhase);
            const rightColor = getFaseColorHex(rightPhase);

            const leftOcc = slotUsage[leftSlot] !== null;
            const rightOcc = slotUsage[rightSlot] !== null;

            return (
              <g key={rIdx}>
                <rect x="590" y={yOffset} width="20" height="50" fill="#020617" stroke="#1e293b" strokeWidth="1" />
                
                {!leftOcc && (
                  <g>
                    <rect x="400" y={yOffset} width="190" height="50" fill="#090d16" stroke="#111827" />
                    <rect x="575" y={yOffset + 15} width="15" height="20" fill="url(#copperGradient)" rx="2" />
                    <circle cx="582" cy={yOffset + 25} r="3" fill="#cbd5e1" />
                    <text x="560" y={yOffset + 28} fill={leftColor} fontSize="8" fontWeight="bold" fontFamily="monospace">{leftPhase}</text>
                    <line x1="590" y1={yOffset} x2="590" y2={yOffset + 50} stroke={leftColor} strokeWidth="2" opacity="0.4" />
                  </g>
                )}

                {!rightOcc && (
                  <g>
                    <rect x="610" y={yOffset} width="190" height="50" fill="#090d16" stroke="#111827" />
                    <rect x="610" y={yOffset + 15} width="15" height="20" fill="url(#copperGradient)" rx="2" />
                    <circle cx="618" cy={yOffset + 25} r="3" fill="#cbd5e1" />
                    <text x="635" y={yOffset + 28} fill={rightColor} fontSize="8" fontWeight="bold" fontFamily="monospace">{rightPhase}</text>
                    <line x1="610" y1={yOffset} x2="610" y2={yOffset + 50} stroke={rightColor} strokeWidth="2" opacity="0.4" />
                  </g>
                )}
              </g>
            );
          })}


          {placements.map((p, idx) => {
            const x = p.side === 'left' ? 400 : 610;
            const fc = getFaseColor(p.breaker.fase);
            const layout = cardLayout[idx];
            if (!layout) return null;

            const { cardY, cardH, brkAps } = layout;
            const hasLoad = brkAps.length > 0;

            // Terminal screw position on breaker
            const termX = p.side === 'left' ? x : x + 190;
            const termY = p.y + p.height / 2;

            // Vertical trunk lines flanking the panel
            const trunkX = p.side === 'left' ? LEFT_TRUNK_X : RIGHT_TRUNK_X;

            // Card attachment X (right edge of left cards, left edge of right cards)
            const cardAttachX = p.side === 'left' ? LEFT_CARD_X + CARD_WIDTH : RIGHT_CARD_X;
            const cardMidY = cardY + cardH / 2;

            // Z-path: breaker terminal → trunk (horizontal) → card mid (vertical) → card edge (horizontal)
            const zPath = `M ${termX} ${termY} H ${trunkX} V ${cardMidY} H ${cardAttachX}`;

            return (
              <g key={idx}>
                {/* Breaker body */}
                <rect x={x} y={p.y} width="190" height={p.height} fill="url(#breakerGradient)" stroke="#020617" strokeWidth="2" rx="4" />
                
                <rect x={p.side === 'left' ? x + 10 : x + 155} y={p.y + 5} width="25" height="15" rx="3" fill="#020617" />
                <text x={p.side === 'left' ? x + 22 : x + 167} y={p.y + 16} textAnchor="middle" fill={fc.hex} fontSize="8" fontWeight="bold" fontFamily="monospace">
                  {p.breaker.fase}
                </text>

                <g>
                  <rect x={p.side === 'left' ? x + 120 : x + 50} y={p.y + p.height / 2 - 6} width="20" height="12" fill="#1e293b" stroke="#020617" />
                  <rect x={p.side === 'left' ? x + 122 : x + 58} y={p.y + p.height / 2 - 4} width="8" height="8" fill="#eab308" rx="1" />
                  <rect x={p.side === 'left' ? x + 110 : x + 72} y={p.y + p.height / 2 - 3} width="4" height="6" fill="#f43f5e" />
                </g>

                <text x={p.side === 'left' ? x + 42 : x + 85} y={p.y + p.height / 2 + 4} fill="#e2e8f0" fontSize="9" fontWeight="black" fontFamily="monospace">
                  {p.breaker.circuitoNumero} ({p.breaker.capacidad}A)
                </text>

                {/* Terminal screw dot */}
                <circle cx={termX} cy={termY} r="5" fill="#cbd5e1" stroke="#334155" />
                <circle cx={termX} cy={termY} r="2" fill="#475569" />

                {/* Z-shaped connector wire */}
                {hasLoad && (
                  <>
                    <path d={zPath} stroke={fc.hex} strokeWidth="2" fill="none" opacity="0.75" strokeLinejoin="round" />
                    <circle cx={cardAttachX} cy={cardMidY} r="3" fill={fc.hex} opacity="0.9" />
                  </>
                )}

                {/* Device card */}
                {hasLoad && (
                  <foreignObject
                    x={p.side === 'left' ? LEFT_CARD_X : RIGHT_CARD_X}
                    y={cardY}
                    width={CARD_WIDTH}
                    height={cardH}
                  >
                    <div
                      className="p-2 rounded-lg bg-slate-950/95 border text-left flex flex-col justify-between h-full shadow-2xl"
                      style={{ borderColor: fc.hex + '60', borderWidth: '1.5px' }}
                    >
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1 flex-shrink-0">
                        <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                          Circ. {p.breaker.circuitoNumero}
                        </span>
                        <span style={{ color: fc.hex }} className="text-[8px] font-mono font-bold">
                          {p.breaker.capacidad}A · {p.breaker.fase}
                        </span>
                      </div>
                      
                      <div className="flex-1 space-y-1 py-1 overflow-hidden">
                        {brkAps.map((ap, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-1.5 text-[9px] text-slate-300">
                            <span className="flex-shrink-0 text-[10px]">{getIcon(ap.tipo)}</span>
                            <span className="truncate font-sans font-medium flex-1">{ap.tipo}</span>
                            <span className="text-[7.5px] text-slate-500 font-mono flex-shrink-0">{ap.watts}W</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-[7.5px] font-mono text-slate-500 text-right pt-0.5 border-t border-slate-800/50 flex-shrink-0">
                        Total: {brkAps.reduce((s, a) => s + parseFloat(a.watts), 0)} W
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

        </svg>
      </div>

      <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start gap-2.5">
        <Info size={14} className="text-teal-400 mt-0.5 flex-shrink-0" />
        <div className="text-[10px] text-slate-500 leading-normal font-sans">
          <strong className="text-slate-400 block mb-0.5">Guía de Conexión de Centros de Carga (Square D QO):</strong>
          Las barras de conexión principales están divididas verticalmente. Los interruptores QO monofásicos (1 Polo)
          conectan a una sola fase mediante presión en los stabs centrales, mientras que los bifásicos (2 Polos) son de ancho
          doble y puentean automáticamente dos fases consecutivas de la barra conductora de cobre/aluminio.
          Los cables de alimentación de carga salen desde el tornillo terminal de cada interruptor hacia el ducto perimetral y de ahí
          a las salidas de tubería indicadas en las ranuras knockouts del gabinete.
        </div>
      </div>
    </div>
  );
}

export default function BalanceadorTablero({ aparatos, onUpdateAparato, acometida, proyectoId }) {
  const [breakers,        setBreakers]        = useState([]);
  const [hasSolution,     setHasSolution]     = useState(false);
  const [highlightBrkId,  setHighlightBrkId]  = useState(null);
  const [showStatsPanel,  setShowStatsPanel]  = useState(false);
  const [showAIModal,     setShowAIModal]     = useState(false);
  const [aiProposal,      setAIProposal]      = useState(null);
  const [aiLoading,       setAILoading]       = useState(false);
  const [aiError,         setAIError]         = useState('');
  const [lastBalanceMode, setLastBalanceMode] = useState('');
  const [isLeftOver,      setIsLeftOver]      = useState(false);
  const [isRightOver,     setIsRightOver]     = useState(false);
  const [isUnassignedOver, setIsUnassignedOver] = useState(false);

  // Estados para formato de visualización (Lógica vs Física Real) y tamaño de gabinete
  const [viewFormat, setViewFormat] = useState('logical'); // 'logical' | 'physical'
  const [selectedPanelSize, setSelectedPanelSize] = useState(12); // 2, 4, 8, 12, 24

  const isInitializedRef = useRef(false);
  const loadedProyectoIdRef = useRef(null);

  // Cargar configuración guardada al cambiar el proyectoId
  useEffect(() => {
    if (!proyectoId) return;
    isInitializedRef.current = false;
    loadedProyectoIdRef.current = null;
    
    // Cargar breakers
    const savedBreakers = localStorage.getItem(`balance_breakers_${proyectoId}`);
    if (savedBreakers) {
      try {
        const parsed = JSON.parse(savedBreakers);
        if (Array.isArray(parsed)) {
          setBreakers(parsed);
          setHasSolution(parsed.length > 0);
        } else {
          setBreakers([]);
          setHasSolution(false);
        }
      } catch (e) {
        console.error("Error loading breakers", e);
        setBreakers([]);
        setHasSolution(false);
      }
    } else {
      setBreakers([]);
      setHasSolution(false);
    }

    // Cargar formato de vista
    const savedFormat = localStorage.getItem(`balance_view_format_${proyectoId}`);
    if (savedFormat) {
      setViewFormat(savedFormat);
    } else {
      setViewFormat('logical');
    }

    // Cargar tamaño de panel
    const savedSize = localStorage.getItem(`balance_panel_size_${proyectoId}`);
    if (savedSize) {
      setSelectedPanelSize(parseInt(savedSize, 10));
    } else {
      setSelectedPanelSize(12);
    }

    // Marcar como inicializado al terminar de cargar
    isInitializedRef.current = true;
    loadedProyectoIdRef.current = proyectoId;
  }, [proyectoId]);

  // Guardar configuración al cambiar sus valores (solo después de que se inicialice)
  useEffect(() => {
    if (!proyectoId || !isInitializedRef.current || loadedProyectoIdRef.current !== proyectoId) return;
    localStorage.setItem(`balance_view_format_${proyectoId}`, viewFormat);
  }, [viewFormat, proyectoId]);

  useEffect(() => {
    if (!proyectoId || !isInitializedRef.current || loadedProyectoIdRef.current !== proyectoId) return;
    localStorage.setItem(`balance_panel_size_${proyectoId}`, selectedPanelSize.toString());
  }, [selectedPanelSize, proyectoId]);

  useEffect(() => {
    if (!proyectoId || !isInitializedRef.current || loadedProyectoIdRef.current !== proyectoId) return;
    if (breakers.length > 0) {
      localStorage.setItem(`balance_breakers_${proyectoId}`, JSON.stringify(breakers));
    } else {
      localStorage.removeItem(`balance_breakers_${proyectoId}`);
    }
  }, [breakers, proyectoId]);

  const fasesDisponibles = acometida?.fasesDisponibles || ['A'];

  const totalVA = useMemo(() =>
    aparatos.reduce((s, ap) => s + calcularVA(ap.watts, ap.fp, ap.usarVaDirecto), 0), [aparatos]);

  const fasesVAActual = useMemo(() => {
    const fva = { A: 0, B: 0, C: 0 };
    breakers.forEach(brk => {
      const parts = brk.fase.split('-');
      parts.forEach(f => { if (fva[f] !== undefined) fva[f] += brk.vaTotal / parts.length; });
    });
    return fva;
  }, [breakers]);

  const desbalancePct = useMemo(() =>
    calcularDesbalanceUVIE(fasesVAActual.A, fasesVAActual.B, fasesVAActual.C, acometida?.id), [fasesVAActual, acometida]);

  const aparatosAsignados  = useMemo(() => new Set(breakers.flatMap(b => b.aparatos)), [breakers]);
  const aparatosSinAsignar = useMemo(() => aparatos.filter(ap => !aparatosAsignados.has(ap.id)), [aparatos, aparatosAsignados]);
  const aparatoBreakerMap  = useMemo(() => {
    const map = {};
    breakers.forEach(brk => brk.aparatos.forEach(id => { map[id] = brk; }));
    return map;
  }, [breakers]);

  const itm = useMemo(() => {
    const in_ = acometida?.id === 'trifasico' ? totalVA / (220 * 1.732)
      : acometida?.id === 'bifasico' ? totalVA / 220 : totalVA / 127;
    return { breaker: seleccionarProteccion(in_ * 1.25) };
  }, [totalVA, acometida]);

  const handleBalanceMath = useCallback(() => {
    const result = balancearCargasAutomatico(aparatos, acometida?.id || 'monofasico');
    setBreakers(result.breakers);
    setHasSolution(true);
    setLastBalanceMode('math');
  }, [aparatos, acometida]);

  const handleBalanceAI = useCallback(async () => {
    setShowAIModal(true);
    setAILoading(true);
    setAIError('');
    setAIProposal(null);
    const acometidaDesc = acometida?.id === 'trifasico' ? 'Trifasica 220V Fases A,B,C'
      : acometida?.id === 'bifasico' ? 'Bifasica 220V Fases A,B' : 'Monofasica 127V Fase A';
    const listaAps = aparatos.map((ap, i) => {
      const va  = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
      const in_ = calcularCorrienteNominal(va, ap.tipoCarga);
      const ic  = calcularCorrienteCorregida(in_);
      return `${i+1}. id="${ap.id}" tipo="${ap.tipo}" ${ap.watts}W carga=${ap.tipoCarga} Ic=${ic.toFixed(2)}A`;
    }).join('\n');
    const prompt = `Eres ingeniero electricista experto en la NOM-001-SEDE (México) y diseño de centros de carga para inmuebles comerciales y de manufactura ligera (Consorcio Gallegos González / Casa Alacio Pérez).
Instalación: ${acometidaDesc}
Aparatos y circuitos registrados:
${listaAps}

Tu tarea es proponer la distribución óptima de estos aparatos en interruptores termomagnéticos (breakers) del Centro de Carga Principal o Subtableros.

Aplica estrictamente los siguientes criterios de DISEÑO ELÉCTRICO PROFESIONAL (NOM-001-SEDE):

1. CIRCUITOS DEDICADOS (Individuales):
   - Todo aparato con consumo >= 1200W (ej. Minisplits, Bordadoras industriales, Plancha de vapor con caldera, Plancha de sublimación, Pistola de calor, Crepera, Olla de esquites, Licuadora Ninja) DEBE ir en su propio interruptor termomagnético exclusivo. No compartirá circuito con ningún otro equipo.
   - Toda bordadora industrial de 220V debe conectarse a 2 polos (2F).
   - Circuitos normativos obligatorios: contactos de cocina/cafetería en 20A (#12 AWG).

2. CIRCUITOS COMPARTIDOS (Agrupados):
   - Cargas menores de iluminación LED, cómputo administrativo y contactos generales PUEDEN agruparse en circuitos de 15A (#14 AWG) o 20A (#12 AWG).
   - La corriente corregida (Ic) total de las cargas agrupadas en un circuito continuo no debe exceder el 80% de la capacidad del breaker (12A para 15A, 16A para 20A) según Art. 210-20.

3. COMPATIBILIDAD Y RUIDO ELÉCTRICO:
   - NUNCA agrupes computadoras, sistemas CCTV/DVR, terminales TPV/POS, grabadora láser o equipos de diseño en el mismo circuito que motores industriales (máquinas de coser recta/overlock, bordadoras, cortadoras de tela o bombas) para evitar daño por armónicos, picos inductivos o ruido electromagnético.
   - Mantén la iluminación separada de los circuitos de fuerza.

4. PROTECCIÓN Y SEGURIDAD:
   - NUNCA agrupes cargas pequeñas en un interruptor sobredimensionado (de 30A o más) para evitar riesgo de incendio en calibres menores (#14 o #12 AWG).
   - Respeta el límite térmico y ampacidad de conductores según Tabla 310-15(b)(16).

5. BALANCE DE FASES:
   - Distribuye las cargas equitativamente entre las fases disponibles (${fasesDisponibles.join(', ')}) para que el desbalanceo total sea menor al 5% (criterio UVIE/CFE).
   - Cargas bifásicas a 220V ocupan 2 polos (2F). Monofásicas a 127V ocupan 1 polo (1F). Cargas trifásicas ocupan 3 polos (3F).

Responde únicamente con un objeto JSON válido, sin comentarios ni markdown, con la siguiente estructura exacta:
{
  "breakers": [
    {
      "id": "brk-001",
      "capacidad": 20,
      "polos": 1,
      "fase": "A",
      "aparatos": ["id-aparato-1", "id-aparato-2"],
      "circuitoNumero": "C-1"
    }
  ],
  "analisis": "Breve justificación de cómo se aplicaron las reglas de diseño profesional y el balanceo obtenido.",
  "desbalancePct": 2.3
}`;
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) throw new Error('Falta VITE_GEMINI_API_KEY en el archivo .env del proyecto.');
      
      let resp;
      let modelUsed = 'Gemini 2.5';
      
      try {
        // Intentar primero con Gemini 2.5 (más inteligente y lógico)
        resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 8192, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } } }) }
        );
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
      } catch (err2) {
        console.warn('Falla en Gemini 2.5 (sobrecarga/cuota). Cambiando a Gemini Lite...', err2);
        modelUsed = 'Gemini Lite';
        // Fallback a Gemini Lite (muy rápido y alta disponibilidad)
        resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } } }) }
        );
        if (!resp.ok) throw new Error(`Error en modelo secundario: HTTP ${resp.status}`);
      }
      
      const data   = await resp.json();
      const raw    = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const json   = raw.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed.breakers)) throw new Error('Formato de respuesta inesperado.');
      const enriched = parsed.breakers.map(brk => {
        const brkAps  = aparatos.filter(ap => brk.aparatos.includes(ap.id));
        const vaTotal = brkAps.reduce((s, ap) => s + calcularVA(ap.watts, ap.fp, ap.usarVaDirecto), 0);
        const tipo    = brk.polos === 3 ? 'trifasica' : brk.polos === 2 ? 'bifasica' : 'monofasica';
        const icTotal = calcularCorrienteCorregida(calcularCorrienteNominal(vaTotal, tipo));
        return { ...brk, vaTotal, icTotal };
      });
      setAIProposal({ breakers: enriched, analisis: parsed.analisis, desbalancePct: parsed.desbalancePct, modelUsed });
    } catch (err) {
      setAIError(err.message || 'Error de conexión.');
    } finally {
      setAILoading(false);
    }
  }, [aparatos, acometida]);

  const handleApplyAI = useCallback(() => {
    if (!aiProposal) return;
    setBreakers(aiProposal.breakers);
    setHasSolution(true);
    setLastBalanceMode(aiProposal.modelUsed === 'Gemini 2.5' ? 'ai-premium' : 'ai-lite');
    setShowAIModal(false);
    setAIProposal(null);
  }, [aiProposal]);

  const handleDeleteBreaker   = useCallback((id) => setBreakers(prev => prev.filter(b => b.id !== id)), []);
  const handleChangeCapacidad = useCallback((id, cap) => setBreakers(prev => prev.map(b => b.id === id ? { ...b, capacidad: cap } : b)), []);
  const handleCycleFase       = useCallback((id) => setBreakers(prev => prev.map(b => {
    if (b.id !== id || b.polos !== 1) return b;
    const idx = fasesDisponibles.indexOf(b.fase);
    return { ...b, fase: fasesDisponibles[(idx + 1) % fasesDisponibles.length] };
  })), [fasesDisponibles]);
  const handleAddBreaker = useCallback(() => {
    const n = breakers.length + 1;
    setBreakers(prev => [...prev, { id: `brk-manual-${Date.now()}`, capacidad: 20, polos: 1, fase: fasesDisponibles[0] || 'A', aparatos: [], circuitoNumero: `C-${n}`, vaTotal: 0, icTotal: 0 }]);
  }, [breakers, fasesDisponibles]);
  const handleMoveToBreaker = useCallback((aparatoId, targetId) => {
    setBreakers(prev => {
      let vaAp = 0;
      const step1 = prev.map(b => {
        if (!b.aparatos.includes(aparatoId)) return b;
        const ap = aparatos.find(a => a.id === aparatoId);
        vaAp = ap ? calcularVA(ap.watts, ap.fp, ap.usarVaDirecto) : 0;
        const newAps = b.aparatos.filter(id => id !== aparatoId);
        const newVA  = Math.max(0, b.vaTotal - vaAp);
        const tipo = b.polos === 3 ? 'trifasica' : b.polos === 2 ? 'bifasica' : 'monofasica';
        return { ...b, aparatos: newAps, vaTotal: newVA, icTotal: calcularCorrienteCorregida(calcularCorrienteNominal(newVA, tipo)) };
      });
      if (!targetId) return step1;
      return step1.map(b => {
        if (b.id !== targetId) return b;
        const newVA = b.vaTotal + vaAp;
        const tipo = b.polos === 3 ? 'trifasica' : b.polos === 2 ? 'bifasica' : 'monofasica';
        return { ...b, aparatos: [...b.aparatos, aparatoId], vaTotal: newVA, icTotal: calcularCorrienteCorregida(calcularCorrienteNominal(newVA, tipo)) };
      });
    });
  }, [aparatos]);

  const handleDragStart = useCallback((e, aparatoId) => {
    e.dataTransfer.setData('text/plain', aparatoId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDropOnBreaker = useCallback((e, breakerId) => {
    e.preventDefault();
    const aparatoId = e.dataTransfer.getData('text/plain');
    if (aparatoId) {
      handleMoveToBreaker(aparatoId, breakerId);
    }
  }, [handleMoveToBreaker]);
  const handleLimpiar = useCallback(() => { setBreakers([]); setHasSolution(false); setLastBalanceMode(''); }, []);

  const apsConBreaker = aparatos.map(ap => ({ ...ap, _brk: aparatoBreakerMap[ap.id] || null }));
  const apsIzq = apsConBreaker.filter((_, i) => i % 2 === 0);
  const apsDer = apsConBreaker.filter((_, i) => i % 2 !== 0);
  const dsColor = desbalancePct <= 3 ? 'text-emerald-400' : desbalancePct <= 5 ? 'text-amber-400' : 'text-rose-400 animate-pulse';

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Balance Inteligente de Cargas</h3>
              <p className="text-[10px] text-slate-400 font-sans">
                {aparatos.length} aparatos \u00b7 {(totalVA / 1000).toFixed(2)} kVA \u00b7 ITM {itm.breaker}A
                {hasSolution && <span className={`ml-2 font-bold ${dsColor}`}>\u00b7 Desbalanceo: {desbalancePct.toFixed(1)}%</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleBalanceMath} className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer">
              <RefreshCw size={12} /> Balancear (Matem\u00e1tico)
            </button>
            <button onClick={handleBalanceAI} className="px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer">
              <Sparkles size={12} /> Balancear con IA
            </button>
            <button onClick={handleAddBreaker} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
              <Plus size={12} /> Agregar Breaker
            </button>
            <button onClick={() => setShowStatsPanel(v => !v)} className={`px-3 py-2 text-[11px] font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${showStatsPanel ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
              <BarChart3 size={12} /> Estadísticas
            </button>
            <button 
              onClick={() => setViewFormat(v => v === 'logical' ? 'physical' : 'logical')}
              className="px-3 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sliders size={12} />
              {viewFormat === 'logical' ? 'Ver Vista Física' : 'Ver Vista Lógica'}
            </button>
            {viewFormat === 'physical' && (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 flex-shrink-0">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-sans">Gabinete:</span>
                <select 
                  value={selectedPanelSize} 
                  onChange={(e) => setSelectedPanelSize(parseInt(e.target.value))}
                  className="text-[10px] bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 font-bold font-sans text-teal-400 focus:outline-none cursor-pointer"
                >
                  <option value={2}>2 Espacios (QO2)</option>
                  <option value={4}>4 Espacios (QO4)</option>
                  <option value={8}>8 Espacios (QO8)</option>
                  <option value={12}>12 Espacios (QO12)</option>
                  <option value={24}>24 Espacios (QO24)</option>
                </select>
              </div>
            )}
            {hasSolution && (
              <button onClick={handleLimpiar} className="p-2 bg-slate-900 hover:bg-rose-950/50 border border-slate-800 text-slate-500 hover:text-rose-400 rounded-xl transition cursor-pointer" title="Limpiar">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {showStatsPanel && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {['A','B','C'].filter(f => fasesDisponibles.includes(f)).map(f => {
              const fc  = getFaseColor(f);
              const vaF = fasesVAActual[f] || 0;
              const pct = totalVA > 0 ? (vaF / totalVA * 100) : 0;
              return (
                <div key={f} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/40">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-[10px] font-bold ${fc.text}`}>Fase {f}</span>
                    <span className="text-[9px] font-mono text-slate-500">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full mb-1">
                    <div className={`h-full rounded-full ${fc.bg} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] font-mono text-slate-300">{(vaF/1000).toFixed(2)} kVA</p>
                </div>
              );
            })}
            <div className={`bg-slate-900/60 rounded-xl p-3 border ${desbalancePct <= 3 ? 'border-emerald-900/30' : desbalancePct <= 5 ? 'border-amber-900/30' : 'border-rose-900/30'}`}>
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Desbalanceo</p>
              <p className={`text-xl font-bold font-mono ${dsColor}`}>{desbalancePct.toFixed(2)}%</p>
              <p className="text-[9px] text-slate-500 mt-1">{desbalancePct <= 3 ? '\u2705 \u00d3ptimo' : desbalancePct <= 5 ? '\u26a0\ufe0f Aceptable (\u22645%)' : '\u274c Excede UVIE'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Circuitos',     value: breakers.length,          color: 'text-white' },
              { label: 'ITM Principal', value: `${itm.breaker}A`,        color: 'text-teal-400' },
              { label: 'Sin Asignar',  value: aparatosSinAsignar.length, color: aparatosSinAsignar.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-900/40 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 uppercase mb-1">{label}</p>
                <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          {lastBalanceMode && (
            <div className={`mt-3 p-2.5 rounded-xl flex items-center gap-2 text-[10px] border ${lastBalanceMode.startsWith('ai') ? 'bg-violet-500/5 border-violet-800/40 text-violet-300' : 'bg-teal-500/5 border-teal-800/40 text-teal-300'}`}>
              {lastBalanceMode.startsWith('ai') ? <Sparkles size={12} /> : <RefreshCw size={12} />}
              M\u00e9todo: {lastBalanceMode.startsWith('ai') ? `Inteligencia Artificial (${lastBalanceMode === 'ai-premium' ? 'Gemini 2.5' : 'Gemini Lite'})` : 'Algoritmo Greedy Matem\u00e1tico (NOM-001-SEDE)'}
            </div>
          )}
        </div>
      )}

      {/* Layout Tri-Columna o Vista Física */}
      {viewFormat === 'logical' ? (
        <div className="grid grid-cols-12 gap-3 items-start animate-fadeIn">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsLeftOver(true)}
            onDragLeave={() => setIsLeftOver(false)}
            onDrop={(e) => {
              setIsLeftOver(false);
              const id = e.dataTransfer.getData('text/plain');
              if (id) handleMoveToBreaker(id, null);
            }}
            className={`col-span-12 lg:col-span-3 space-y-2 rounded-2xl p-2.5 transition-all duration-300 border border-transparent ${
              isLeftOver ? 'bg-violet-500/5 border-dashed border-violet-500/40 ring-1 ring-violet-500/20' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Aparatos \u00b7 Grupo 1</span>
              <span className="text-[9px] text-slate-600 ml-auto font-mono">{apsIzq.length}</span>
            </div>
            {apsIzq.length === 0
              ? <p className="text-center text-[10px] text-slate-700 py-8 border border-dashed border-slate-800 rounded-xl">Sin aparatos</p>
              : apsIzq.map(ap => (
                  <TarjetaAparato key={ap.id} aparato={ap} breaker={ap._brk} breakers={breakers}
                    onMoveToBreaker={handleMoveToBreaker} isHighlighted={ap._brk?.id === highlightBrkId}
                    onDragStart={handleDragStart} />
                ))
            }
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="glass-panel rounded-2xl border border-slate-800/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800/60 bg-gradient-to-r from-slate-900/80 to-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[8px] text-teal-400 font-mono uppercase font-bold tracking-widest">Centro de Carga T-1</p>
                    <h4 className="text-sm font-bold text-white font-display">Tablero de Distribución \u00b7 {acometida?.tipo || 'Eléctrico'}</h4>
                  </div>
                  <div className="text-right text-[8px] font-mono text-slate-500">
                    <p>NOM-001-SEDE-2012</p>
                    <p>ITM: <span className="text-teal-400 font-bold">{itm.breaker}A</span></p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-slate-800/40 bg-slate-950/30">
                <svg width="100%" height={Math.max(20, (fasesDisponibles.length + 1) * 10)} className="overflow-visible">
                  {fasesDisponibles.map((f, i) => {
                    const fc = getFaseColor(f);
                    return (
                      <g key={f}>
                        <rect x="0" y={i * 10} width="100%" rx="2" height="7" fill={fc.hex + '33'} />
                        <rect x="0" y={i * 10} width="100%" rx="2" height="7" fill={fc.hex} opacity="0.7" />
                        <text x="6" y={i * 10 + 6} fontSize="6" fill="white" fontWeight="bold" fontFamily="monospace">L{i+1}({f})</text>
                      </g>
                    );
                  })}
                  <rect x="0" y={fasesDisponibles.length * 10} width="100%" rx="2" height="6" fill="#334155" />
                  <text x="6" y={fasesDisponibles.length * 10 + 5} fontSize="5.5" fill="#94a3b8" fontFamily="monospace">N \u00b7 T</text>
                </svg>
              </div>

              {!hasSolution && breakers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                    <Zap size={26} className="text-slate-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-500 mb-2">Tablero sin distribución</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-5 max-w-56">
                    Presiona uno de los botones de balance para distribuir los {aparatos.length} aparatos automáticamente.
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <button onClick={handleBalanceMath} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                      <RefreshCw size={11} /> Matemático
                    </button>
                    <button onClick={handleBalanceAI} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                      <Sparkles size={11} /> IA (Gemini)
                    </button>
                  </div>
                </div>
              )}

              {breakers.length > 0 && (
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[580px] overflow-y-auto">
                  {breakers.map(brk => (
                    <div key={brk.id} onMouseEnter={() => setHighlightBrkId(brk.id)} onMouseLeave={() => setHighlightBrkId(null)}>
                      <BreakerCard breaker={brk} aparatos={aparatos} acometida={acometida}
                        onDelete={handleDeleteBreaker} onChangeCapacidad={handleChangeCapacidad}
                        onCycleFase={handleCycleFase} highlighted={highlightBrkId === brk.id}
                        onDragStart={handleDragStart} onDrop={handleDropOnBreaker} />
                    </div>
                  ))}
                </div>
              )}

              {hasSolution && (
                <div className="px-4 py-2.5 border-t border-slate-800/60 flex justify-between items-center">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${dsColor}`}>
                    {desbalancePct <= 5 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    Desbalanceo: {desbalancePct.toFixed(2)}%{desbalancePct > 5 && ' — Re-balancear recomendado'}
                  </div>
                  <p className="text-[9px] text-slate-600 font-mono">{breakers.length} circuitos \u00b7 {aparatosSinAsignar.length} sin asignar</p>
                </div>
              )}
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsRightOver(true)}
            onDragLeave={() => setIsRightOver(false)}
            onDrop={(e) => {
              setIsRightOver(false);
              const id = e.dataTransfer.getData('text/plain');
              if (id) handleMoveToBreaker(id, null);
            }}
            className={`col-span-12 lg:col-span-3 space-y-2 rounded-2xl p-2.5 transition-all duration-300 border border-transparent ${
              isRightOver ? 'bg-violet-500/5 border-dashed border-violet-500/40 ring-1 ring-violet-500/20' : ''
            }`}
          >
            <div className="flex items-center justify-end gap-1.5 mb-2">
              <span className="text-[9px] font-mono text-slate-600">{apsDer.length}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Grupo 2 \u00b7 Aparatos</span>
              <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
            </div>
            {apsDer.length === 0
              ? <p className="text-center text-[10px] text-slate-700 py-8 border border-dashed border-slate-800 rounded-xl">Sin aparatos</p>
              : apsDer.map(ap => (
                  <TarjetaAparato key={ap.id} aparato={ap} breaker={ap._brk} breakers={breakers}
                    onMoveToBreaker={handleMoveToBreaker} isHighlighted={ap._brk?.id === highlightBrkId}
                    onDragStart={handleDragStart} />
                ))
            }
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <VistaFisicaTablero 
            breakers={breakers} 
            aparatos={aparatos} 
            selectedPanelSize={selectedPanelSize} 
            acometida={acometida} 
          />
        </div>
      )}

      {aparatosSinAsignar.length > 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsUnassignedOver(true)}
          onDragLeave={() => setIsUnassignedOver(false)}
          onDrop={(e) => {
            setIsUnassignedOver(false);
            const id = e.dataTransfer.getData('text/plain');
            if (id) handleMoveToBreaker(id, null);
          }}
          className={`glass-panel rounded-2xl p-4 border transition-all duration-300 ${
            isUnassignedOver ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20' : 'border-amber-900/30 bg-amber-500/5'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-400" />
            <h4 className="text-[11px] font-bold text-amber-300">{aparatosSinAsignar.length} aparato{aparatosSinAsignar.length > 1 ? 's' : ''} sin asignar a ning\u00fan circuito</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {aparatosSinAsignar.map(ap => (
              <div
                key={ap.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, ap.id)}
                className="bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/60 cursor-grab active:cursor-grabbing hover:border-slate-700 transition"
              >
                <p className="text-[10px] font-bold text-slate-300 truncate">{getIcon(ap.tipo)} {ap.tipo}</p>
                <p className="text-[9px] font-mono text-slate-500 mt-0.5">{ap.watts}W \u00b7 {Math.round(calcularVA(ap.watts, ap.fp, ap.usarVaDirecto))}VA</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/20 border border-slate-800/30">
        <Info size={12} className="text-teal-400 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-600 leading-relaxed">
          <strong className="text-slate-500">NOM-001-SEDE-2012:</strong> Art.210-20 carga continua m\u00e1x.80%, Art.220-3 c\u00e1lculo de cargas, Art.240-6 calibres est\u00e1ndar. Desbalanceo UVIE/CFE m\u00e1x.5% entre fases.
        </p>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-white" />
                <div>
                  <h2 className="text-[13px] font-bold text-white">Distribuci\u00f3n por Gemini AI ({aiProposal?.modelUsed})</h2>
                  <p className="text-[9px] text-violet-200">{aparatos.length} aparatos \u00b7 {(totalVA/1000).toFixed(2)} kVA \u00b7 {acometida?.tipo}</p>
                </div>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-white/60 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center">
                      <Sparkles size={22} className="text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-slate-200">Analizando con IA\u2026</p>
                    <p className="text-[10px] text-slate-500 mt-1">Gemini calcula la distribuci\u00f3n \u00f3ptima seg\u00fan NOM-001-SEDE</p>
                  </div>
                </div>
              )}
              {aiError && !aiLoading && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-800/40">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={13} className="text-rose-400" />
                    <h4 className="text-[12px] font-bold text-rose-300">Error de Conexi\u00f3n con IA</h4>
                  </div>
                  <p className="text-[10px] text-rose-400 leading-relaxed mb-3">{aiError}</p>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg text-[9px] text-slate-400 space-y-1 mb-3">
                    <p><strong>Para habilitar la IA:</strong></p>
                    <p>1. Crea el archivo <code className="bg-slate-800 px-1 rounded">.env</code> en la ra\u00edz del proyecto</p>
                    <p>2. Agrega: <code className="bg-slate-800 px-1 rounded">VITE_GEMINI_API_KEY=tu_clave</code></p>
                    <p>3. Clave gratuita en: <span className="text-teal-400">aistudio.google.com</span></p>
                  </div>
                  <button onClick={() => { setShowAIModal(false); handleBalanceMath(); }}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                    <RefreshCw size={11} /> Usar Balance Matem\u00e1tico
                  </button>
                </div>
              )}
              {aiProposal && !aiLoading && (
                <div className="space-y-3">
                  {aiProposal.analisis && (
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-800/40">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles size={11} className="text-violet-400" />
                        <span className="text-[9px] font-bold text-violet-300 uppercase tracking-wider">An\u00e1lisis de Gemini</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed">{aiProposal.analisis}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800/50 rounded-xl p-2.5 text-center">
                      <p className="text-[8px] text-slate-500 uppercase mb-1">Circuitos</p>
                      <p className="text-base font-bold text-white">{aiProposal.breakers.length}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-2.5 text-center">
                      <p className="text-[8px] text-slate-500 uppercase mb-1">Desbalanceo</p>
                      <p className={`text-base font-bold font-mono ${ (aiProposal.desbalancePct || 0) <= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>{(aiProposal.desbalancePct || 0).toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-2.5 text-center">
                      <p className="text-[8px] text-slate-500 uppercase mb-1">NOM-001</p>
                      <p className={`text-[11px] font-bold ${ (aiProposal.desbalancePct || 0) <= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>{(aiProposal.desbalancePct || 0) <= 5 ? '\u2705 OK' : '\u26a0\ufe0f Revisar'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Distribuci\u00f3n Propuesta:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {aiProposal.breakers.map(brk => {
                        const fc     = getFaseColor(brk.fase);
                        const brkAps = aparatos.filter(ap => brk.aparatos.includes(ap.id));
                        return (
                          <div key={brk.id} className="rounded-xl border p-2.5 bg-slate-900/60" style={{ borderColor: fc.hex + '55' }}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${fc.bg} text-slate-950 font-mono`}>{brk.circuitoNumero}</span>
                              <span className={`text-[10px] font-bold ${fc.text}`}>{brk.fase} \u00b7 {brk.capacidad}A \u00b7 {brk.polos}P</span>
                              <span className="text-[8px] text-slate-500 ml-auto font-mono">Ic {brk.icTotal?.toFixed(1) || '?'}A</span>
                            </div>
                            {brkAps.map(ap => (
                              <div key={ap.id} className="flex items-center gap-1.5 text-[9px] text-slate-400 ml-1">
                                <span>{getIcon(ap.tipo)}</span>
                                <span className="truncate">{ap.tipo}</span>
                                <span className="ml-auto font-mono text-slate-600">{ap.watts}W</span>
                              </div>
                            ))}
                            {brkAps.length === 0 && <p className="text-[9px] text-slate-700 italic ml-1">Sin aparatos asignados</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!aiLoading && (
              <div className="p-3 border-t border-slate-800 flex justify-end gap-2">
                <button onClick={() => setShowAIModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-xl transition cursor-pointer">Cancelar</button>
                {aiProposal && (
                  <button onClick={handleApplyAI} className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg">
                    <CheckCircle2 size={12} /> Aplicar Distribuci\u00f3n de la IA
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
