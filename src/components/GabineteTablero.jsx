import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Zap, Eye, EyeOff, Sliders, Move, ArrowLeftRight, CheckCircle2,
  AlertTriangle, RotateCcw, X, Info, Sparkles, Layers, Minimize2, Maximize2
} from 'lucide-react';
import { WIRE_COLORS } from '../utils/gabineteModel.js';
import './GabineteTablero.css';

// Dimensiones oficiales del chasis en gabinete_base.png (788 x 1024 px)
const PANEL_WIDTH = 788;
const PANEL_HEIGHT = 1024;

// Geometría del banco de pastillas (12 filas de 2 espacios = 24 polos)
const ROW_START_Y = 368;
const ROW_PITCH = 34.6;
const SLOT_HEIGHT = 34;
const SLOT_WIDTH = 140;

const LEFT_BANK_X = 245;  // Terminal exterior x=245, contacto bus x=385
const RIGHT_BANK_X = 403; // Contacto bus x=403, terminal exterior x=543

// Coordenadas de zapatas principales de alimentación (Lugs de fase A, B, C)
const MAIN_LUGS = {
  A: { x: 325, y: 320 },
  B: { x: 394, y: 320 },
  C: { x: 460, y: 320 },
  N: { x: 250, y: 175 },
  PE: { x: 540, y: 175 }
};

// Mapeo inicial de slots recomendados para los 15 circuitos oficiales de Hawaiian Paradise
const DEFAULT_HAWAIIAN_SLOTS = {
  'c-1': 3,   // Fila 1, Izq -> Fase B
  'c-2': 5,   // Fila 2, Izq -> Fase C
  'c-3': 1,   // Fila 0, Izq -> Fase A
  'c-4': 6,   // Fila 2, Der -> Fase C
  'c-5': 16,  // Filas 7 & 8, Der (Slots 16 & 18) -> Fase B-C (2 Polos)
  'c-6': 4,   // Fila 1, Der -> Fase B
  'c-7': 11,  // Fila 5, Izq -> Fase C
  'c-8': 7,   // Fila 3, Izq -> Fase A
  'c-9': 2,   // Fila 0, Der -> Fase A
  'c-10': 9,  // Fila 4, Izq -> Fase B
  'c-11': 8,  // Fila 3, Der -> Fase A
  'c-12': 10, // Fila 4, Der -> Fase B
  'c-13': 15, // Fila 7, Izq -> Fase B
  'c-14': 21, // Fila 10, Izq -> Fase B
  'c-15': 22, // Fila 10, Der -> Fase B
};

/**
 * Obtiene la fase teórica de un slot físico (1 a 24) según la acometida.
 */
function getSlotPhase(slotNumber, polos = 1, phases = ['A', 'B', 'C']) {
  const row = Math.floor((slotNumber - 1) / 2);
  if (phases.length === 1) return phases[0];
  if (phases.length === 2) {
    if (polos === 2) return 'A-B';
    return row % 2 === 0 ? 'A' : 'B';
  }
  // Trifásico 3F: A -> B -> C -> A...
  if (polos === 2) {
    const f1 = phases[row % 3];
    const f2 = phases[(row + 1) % 3];
    return `${f1}-${f2}`;
  }
  return phases[row % 3];
}

export default function GabineteTablero({
  breakers = [],
  circuitos = [],
  alimentador = {},
  desbalancePct = 0,
  selectedId = null,
  onSelect = () => {},
  selectedLoad = null,
  onSelectLoad = () => {},
  onUpdateBreakers,
  acometida = { id: 'trifasico', fasesDisponibles: ['A', 'B', 'C'] }
}) {
  const phases = acometida?.fasesDisponibles || ['A', 'B', 'C'];

  // Estados de visualización
  const [occlusionMode, setOcclusionMode] = useState('solid'); // 'solid' (100%), 'xray' (35%), 'hidden' (0%)
  const [showWiring, setShowWiring] = useState(true);
  const [showApparatusList, setShowApparatusList] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [individualOcclusion, setIndividualOcclusion] = useState({}); // { [breakerId]: boolean }

  // Drag and Drop State
  const [draggedBreakerId, setDraggedBreakerId] = useState(null);
  const [dropHoverSlot, setDropHoverSlot] = useState(null);

  // Mapeo de slots físicos: breakerId -> slotNumber (1 a 24) o null si está en la bandeja
  const [slotMap, setSlotMap] = useState(() => {
    const map = {};
    const occupied = new Set();

    breakers.forEach(brk => {
      const brkKey = brk.id?.toLowerCase();
      const numMatch = brk.circuitoNumero?.toLowerCase() || '';
      let targetSlot = DEFAULT_HAWAIIAN_SLOTS[brkKey] || DEFAULT_HAWAIIAN_SLOTS[numMatch];

      // Verificar disponibilidad
      const is2P = brk.polos === 2;
      const targetSlot2 = is2P ? targetSlot + 2 : null;

      if (targetSlot && !occupied.has(targetSlot) && (!is2P || !occupied.has(targetSlot2))) {
        map[brk.id] = targetSlot;
        occupied.add(targetSlot);
        if (is2P) occupied.add(targetSlot2);
      } else {
        // Encontrar primer slot libre
        for (let s = 1; s <= 24; s++) {
          const s2 = s + 2;
          if (!occupied.has(s) && (!is2P || (s2 <= 24 && !occupied.has(s2)))) {
            map[brk.id] = s;
            occupied.add(s);
            if (is2P) occupied.add(s2);
            break;
          }
        }
      }
    });
    return map;
  });

  // Mantener slotMap sincronizado cuando cambie breakers
  useEffect(() => {
    setSlotMap(prev => {
      const next = { ...prev };
      const occupied = new Set();
      // Registrar ya asignados existentes
      breakers.forEach(b => {
        if (next[b.id]) {
          occupied.add(next[b.id]);
          if (b.polos === 2) occupied.add(next[b.id] + 2);
        }
      });
      // Asignar los que no tengan slot
      breakers.forEach(b => {
        if (!next[b.id]) {
          const brkKey = b.id?.toLowerCase();
          const numMatch = b.circuitoNumero?.toLowerCase() || '';
          let target = DEFAULT_HAWAIIAN_SLOTS[brkKey] || DEFAULT_HAWAIIAN_SLOTS[numMatch];
          const is2P = b.polos === 2;
          if (target && !occupied.has(target) && (!is2P || !occupied.has(target + 2))) {
            next[b.id] = target;
            occupied.add(target);
            if (is2P) occupied.add(target + 2);
          } else {
            for (let s = 1; s <= 24; s++) {
              if (!occupied.has(s) && (!is2P || (s + 2 <= 24 && !occupied.has(s + 2)))) {
                next[b.id] = s;
                occupied.add(s);
                if (is2P) occupied.add(s + 2);
                break;
              }
            }
          }
        }
      });
      return next;
    });
  }, [breakers]);

  // Lista de pastillas montadas y desmontadas
  const mountedBreakers = useMemo(() => {
    return breakers.filter(b => slotMap[b.id] !== null && slotMap[b.id] !== undefined);
  }, [breakers, slotMap]);

  const unmountedBreakers = useMemo(() => {
    return breakers.filter(b => slotMap[b.id] === null || slotMap[b.id] === undefined);
  }, [breakers, slotMap]);

  // Mapa inverso de ocupación de slots: slotNumber -> breaker
  const slotOccupancy = useMemo(() => {
    const occ = {};
    mountedBreakers.forEach(brk => {
      const slot = slotMap[brk.id];
      if (slot) {
        occ[slot] = brk;
        if (brk.polos === 2) {
          occ[slot + 2] = brk;
        }
      }
    });
    return occ;
  }, [mountedBreakers, slotMap]);

  // Funciones de manipulación de pastillas
  const handleUnmountBreaker = useCallback((breakerId, e) => {
    if (e) e.stopPropagation();
    setSlotMap(prev => ({ ...prev, [breakerId]: null }));
    if (onSelect && selectedId === breakerId) onSelect(null);
  }, [onSelect, selectedId]);

  const handleMountBreakerAtSlot = useCallback((breakerId, targetSlot) => {
    const brk = breakers.find(b => b.id === breakerId);
    if (!brk) return;

    const is2P = brk.polos === 2;
    // Si es 2P, verificar que quepa en el banco (no desbordar más allá de fila 11)
    if (is2P && targetSlot > 22) return;

    // Calcular la nueva fase correspondiente al slot físico
    const newPhase = getSlotPhase(targetSlot, brk.polos, phases);

    // Si el slot destino está ocupado por otra pastilla, intercambiar o desplazar
    const occupyingBreaker = slotOccupancy[targetSlot];
    const prevSlot = slotMap[breakerId];

    setSlotMap(prev => {
      const next = { ...prev };
      if (occupyingBreaker && occupyingBreaker.id !== breakerId) {
        // Intercambio
        next[occupyingBreaker.id] = prevSlot || null;
      }
      next[breakerId] = targetSlot;
      return next;
    });

    // Actualizar la fase del breaker en el modelo general para recalcular balance de inmediato
    if (onUpdateBreakers && newPhase !== brk.fase) {
      onUpdateBreakers(prev => {
        const list = prev ?? breakers;
        return list.map(b => {
          if (b.id === breakerId) {
            return { ...b, fase: newPhase };
          }
          if (occupyingBreaker && b.id === occupyingBreaker.id && prevSlot) {
            return { ...b, fase: getSlotPhase(prevSlot, b.polos, phases) };
          }
          return b;
        });
      });
    }
  }, [breakers, phases, slotOccupancy, slotMap, onUpdateBreakers]);

  // Toggle de oclusión individual
  const toggleBreakerOcclusion = useCallback((breakerId, e) => {
    if (e) e.stopPropagation();
    setIndividualOcclusion(prev => ({
      ...prev,
      [breakerId]: !prev[breakerId]
    }));
  }, []);

  // Drag and Drop Handlers
  const onDragStartBreaker = useCallback((e, breakerId) => {
    e.dataTransfer.setData('text/breaker-id', breakerId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBreakerId(breakerId);
  }, []);

  const onDragOverSlot = useCallback((e, slotNumber) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropHoverSlot(slotNumber);
  }, []);

  const onDragLeaveSlot = useCallback((e) => {
    setDropHoverSlot(null);
  }, []);

  const onDropOnSlot = useCallback((e, slotNumber) => {
    e.preventDefault();
    setDropHoverSlot(null);
    const brkId = e.dataTransfer.getData('text/breaker-id') || draggedBreakerId;
    if (brkId) {
      handleMountBreakerAtSlot(brkId, slotNumber);
    }
    setDraggedBreakerId(null);
  }, [draggedBreakerId, handleMountBreakerAtSlot]);

  const onDropOnTray = useCallback((e) => {
    e.preventDefault();
    const brkId = e.dataTransfer.getData('text/breaker-id') || draggedBreakerId;
    if (brkId) {
      handleUnmountBreaker(brkId);
    }
    setDraggedBreakerId(null);
  }, [draggedBreakerId, handleUnmountBreaker]);

  // Resetear a distribución de fábrica recomendada
  const handleResetSlots = useCallback(() => {
    const map = {};
    breakers.forEach(b => {
      const brkKey = b.id?.toLowerCase();
      const numMatch = b.circuitoNumero?.toLowerCase() || '';
      map[b.id] = DEFAULT_HAWAIIAN_SLOTS[brkKey] || DEFAULT_HAWAIIAN_SLOTS[numMatch] || null;
    });
    setSlotMap(map);
  }, [breakers]);

  // Cálculos de potencia por fase actuales
  const phaseTotals = useMemo(() => {
    const totals = { A: 0, B: 0, C: 0 };
    mountedBreakers.forEach(brk => {
      const parts = (brk.fase || '').split('-');
      const vaPart = (brk.vaTotal || 0) / (parts.length || 1);
      parts.forEach(p => {
        if (totals[p] !== undefined) totals[p] += vaPart;
      });
    });
    return totals;
  }, [mountedBreakers]);

  const selectedBreaker = breakers.find(b => b.id === selectedId);

  return (
    <section className="cabinet-view shadow-2xl border border-slate-800" aria-label="Gabinete físico de centro de carga">
      
      {/* 1. Header con Resumen Eléctrico y Controles de Visibilidad */}
      <div className="cabinet-heading flex flex-wrap items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
        <div>
          <span className="cabinet-eyebrow text-teal-400 font-mono text-[10px] tracking-widest uppercase font-bold">
            CENTRO DE CARGA INDUSTRIAL · T-1 (24 ESPACIOS)
          </span>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5 font-display">
            <Zap className="text-amber-400 fill-amber-400/20" size={20} />
            Montaje Realista de Pastillas y Terminales de Cable
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mountedBreakers.length} pastillas montadas · {unmountedBreakers.length} en bandeja · Acometida {acometida?.tipo || 'Trifásica 3F-1N'}
          </p>
        </div>

        {/* Medidores de Fase y Desbalance */}
        <div className="cabinet-phase-meters flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
          {phases.map(f => (
            <div key={f} className="text-center px-2">
              <span className="text-[10px] font-bold block" style={{ color: WIRE_COLORS[f] }}>FASE {f}</span>
              <strong className="text-base font-mono text-slate-100">{Math.round(phaseTotals[f]).toLocaleString('es-MX')}</strong>
              <small className="text-[9px] text-slate-500 ml-0.5">VA</small>
            </div>
          ))}
          <div className="border-l border-slate-800 pl-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Desbalance</span>
            <strong className={`text-base font-mono ${Number(desbalancePct) <= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {Number(desbalancePct || 0).toFixed(2)}%
            </strong>
            <small className="text-[9px] text-slate-500 ml-0.5">UVIE</small>
          </div>
        </div>
      </div>

      {/* 2. Barra de Herramientas: Oclusión, Cableado, Zoom y Bandeja */}
      <div className="cabinet-tools flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-900/60 border-b border-slate-800/80 text-xs">
        
        {/* Selector de Modo de Oclusión / Transparencia */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Layers size={14} className="text-teal-400" /> Modo Pastillas:
          </span>
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setOcclusionMode('solid')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                occlusionMode === 'solid'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pastillas sólidas 100% opacas"
            >
              👁️ Sólido (100%)
            </button>
            <button
              onClick={() => setOcclusionMode('xray')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                occlusionMode === 'xray'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Oclusión / Rayos X (Transparente para ver barras de cobre y stabs)"
            >
              🔮 Ocluir (35%)
            </button>
            <button
              onClick={() => setOcclusionMode('hidden')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                occlusionMode === 'hidden'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Esconder pastillas completamente para inspeccionar el chasis interno"
            >
              👻 Esconder (0%)
            </button>
          </div>
        </div>

        {/* Toggles de Cableado y Etiquetas */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300">
            <input
              type="checkbox"
              checked={showWiring}
              onChange={e => setShowWiring(e.target.checked)}
              className="accent-teal-500 rounded"
            />
            ⚡ Conexiones y Cableado Realista
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300">
            <input
              type="checkbox"
              checked={showApparatusList}
              onChange={e => setShowApparatusList(e.target.checked)}
              className="accent-teal-500 rounded"
            />
            🏷️ Cargas de Proyecto
          </label>
        </div>

        {/* Zoom y Restaurar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
            title="Reducir zoom"
          >
            <Minimize2 size={13} />
          </button>
          <span className="font-mono text-slate-400 text-[11px] w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
            title="Aumentar zoom"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={handleResetSlots}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center gap-1 transition cursor-pointer text-[11px]"
            title="Restablecer posiciones por defecto"
          >
            <RotateCcw size={12} /> Restablecer Posiciones
          </button>
        </div>
      </div>

      {/* 3. Área de Trabajo Principal: Gabinete SVG + Inspector Lateral */}
      <div className="cabinet-workspace grid grid-cols-12 gap-0 bg-[#070d17]">
        
        {/* Canvas del Gabinete con Scroll */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 overflow-auto max-h-[860px] p-4 flex justify-center bg-radial from-slate-900/60 to-[#040811] relative">
          
          <div
            className="relative transition-transform duration-200 origin-top"
            style={{ width: `${PANEL_WIDTH * zoom}px`, height: `${PANEL_HEIGHT * zoom}px` }}
          >
            <svg
              viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.7))' }}
            >
              <defs>
                {/* Degradados realistas para conductores */}
                <linearGradient id="wire-grad-A" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#9f1239" />
                  <stop offset="45%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
                <linearGradient id="wire-grad-B" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0369a1" />
                  <stop offset="45%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#075985" />
                </linearGradient>
                <linearGradient id="wire-grad-C" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6d28d9" />
                  <stop offset="45%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
                <linearGradient id="wire-grad-N" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="45%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="wire-grad-PE" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="45%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#14532d" />
                </linearGradient>

                {/* Filtro de brillo para slots seleccionados y drop target */}
                <filter id="glow-target" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* CAPA 1: Imagen Base del Gabinete (gabinete_base.png) */}
              <image
                href="/assets/tablero/gabinete_base.png"
                x="0"
                y="0"
                width={PANEL_WIDTH}
                height={PANEL_HEIGHT}
                preserveAspectRatio="none"
              />

              {/* CAPA 2: Conexiones de Alimentación Principal con Terminales de Cable (terminal_cable_tight.png) */}
              {showWiring && (
                <g className="main-feeder-wiring">
                  {/* Fase A (Conductor + Zapata en x=325, y=320) */}
                  <path d="M 325 36 L 325 275" stroke="url(#wire-grad-A)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 325 36 L 325 275" stroke="#ffffff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
                  <image
                    href="/assets/tablero/terminal_cable_tight.png"
                    x={MAIN_LUGS.A.x - 13}
                    y={MAIN_LUGS.A.y - 62}
                    width="26"
                    height="66"
                    className="pointer-events-none"
                  />
                  <circle cx={MAIN_LUGS.A.x} cy={MAIN_LUGS.A.y} r="6" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />

                  {/* Fase B (Conductor + Zapata en x=394, y=320) */}
                  <path d="M 394 36 L 394 275" stroke="url(#wire-grad-B)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 394 36 L 394 275" stroke="#ffffff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
                  <image
                    href="/assets/tablero/terminal_cable_tight.png"
                    x={MAIN_LUGS.B.x - 13}
                    y={MAIN_LUGS.B.y - 62}
                    width="26"
                    height="66"
                    className="pointer-events-none"
                  />
                  <circle cx={MAIN_LUGS.B.x} cy={MAIN_LUGS.B.y} r="6" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />

                  {/* Fase C (Conductor + Zapata en x=460, y=320) */}
                  <path d="M 460 36 L 460 275" stroke="url(#wire-grad-C)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 460 36 L 460 275" stroke="#ffffff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
                  <image
                    href="/assets/tablero/terminal_cable_tight.png"
                    x={MAIN_LUGS.C.x - 13}
                    y={MAIN_LUGS.C.y - 62}
                    width="26"
                    height="66"
                    className="pointer-events-none"
                  />
                  <circle cx={MAIN_LUGS.C.x} cy={MAIN_LUGS.C.y} r="6" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />

                  {/* Neutro Principal hacia barra izquierda (x=250, y=175) */}
                  <path d="M 290 36 Q 290 125 250 145 L 250 175" fill="none" stroke="url(#wire-grad-N)" strokeWidth="10" strokeLinecap="round" />
                  <image
                    href="/assets/tablero/terminal_cable_tight.png"
                    x={MAIN_LUGS.N.x - 12}
                    y={MAIN_LUGS.N.y - 58}
                    width="24"
                    height="60"
                    className="pointer-events-none"
                  />
                  <circle cx={MAIN_LUGS.N.x} cy={MAIN_LUGS.N.y} r="5" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />

                  {/* Tierra Principal hacia barra derecha (x=540, y=175) */}
                  <path d="M 495 36 Q 495 125 540 145 L 540 175" fill="none" stroke="url(#wire-grad-PE)" strokeWidth="9" strokeLinecap="round" />
                  <image
                    href="/assets/tablero/terminal_cable_tight.png"
                    x={MAIN_LUGS.PE.x - 12}
                    y={MAIN_LUGS.PE.y - 58}
                    width="24"
                    height="60"
                    className="pointer-events-none"
                  />
                  <circle cx={MAIN_LUGS.PE.x} cy={MAIN_LUGS.PE.y} r="5" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />

                  {/* Rótulo de Entrada del Alimentador */}
                  <rect x="300" y="8" width="188" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x="394" y="23" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    ALIMENTADOR {alimentador?.breaker || 60}A · 3F+N+T
                  </text>
                </g>
              )}

              {/* CAPA 3: Rejilla de 24 Slots Físicos (Zonas de Drop y Detección) */}
              <g className="cabinet-slot-grid">
                {Array.from({ length: 12 }, (_, rowIndex) => {
                  const ySlot = ROW_START_Y + rowIndex * ROW_PITCH;
                  const slotLeft = rowIndex * 2 + 1;
                  const slotRight = rowIndex * 2 + 2;

                  const isLeftHover = dropHoverSlot === slotLeft || dropHoverSlot === slotLeft - 2;
                  const isRightHover = dropHoverSlot === slotRight || dropHoverSlot === slotRight - 2;

                  return (
                    <g key={rowIndex}>
                      {/* Slot Izquierdo */}
                      <rect
                        x={LEFT_BANK_X}
                        y={ySlot}
                        width={SLOT_WIDTH}
                        height={SLOT_HEIGHT}
                        rx="4"
                        fill={isLeftHover ? 'rgba(56,189,248,0.25)' : 'transparent'}
                        stroke={isLeftHover ? '#38bdf8' : 'none'}
                        strokeWidth={isLeftHover ? 2 : 0}
                        strokeDasharray={isLeftHover ? '4 2' : 'none'}
                        className="cursor-pointer transition-all duration-150"
                        onDragOver={(e) => onDragOverSlot(e, slotLeft)}
                        onDragLeave={onDragLeaveSlot}
                        onDrop={(e) => onDropOnSlot(e, slotLeft)}
                        onClick={() => draggedBreakerId && handleMountBreakerAtSlot(draggedBreakerId, slotLeft)}
                      >
                        <title>Espacio {slotLeft} · Fase {getSlotPhase(slotLeft, 1, phases)}</title>
                      </rect>

                      {/* Slot Derecho */}
                      <rect
                        x={RIGHT_BANK_X}
                        y={ySlot}
                        width={SLOT_WIDTH}
                        height={SLOT_HEIGHT}
                        rx="4"
                        fill={isRightHover ? 'rgba(56,189,248,0.25)' : 'transparent'}
                        stroke={isRightHover ? '#38bdf8' : 'none'}
                        strokeWidth={isRightHover ? 2 : 0}
                        strokeDasharray={isRightHover ? '4 2' : 'none'}
                        className="cursor-pointer transition-all duration-150"
                        onDragOver={(e) => onDragOverSlot(e, slotRight)}
                        onDragLeave={onDragLeaveSlot}
                        onDrop={(e) => onDropOnSlot(e, slotRight)}
                        onClick={() => draggedBreakerId && handleMountBreakerAtSlot(draggedBreakerId, slotRight)}
                      >
                        <title>Espacio {slotRight} · Fase {getSlotPhase(slotRight, 1, phases)}</title>
                      </rect>

                      {/* Número de espacio sutil en el riel central si está vacío */}
                      {!slotOccupancy[slotLeft] && (
                        <text x={LEFT_BANK_X + 10} y={ySlot + 21} fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {slotLeft}
                        </text>
                      )}
                      {!slotOccupancy[slotRight] && (
                        <text x={RIGHT_BANK_X + SLOT_WIDTH - 22} y={ySlot + 21} fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {slotRight}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* CAPA 4: Cableado de Salida de Circuitos Derivados */}
              {showWiring && (
                <g className="branch-wiring">
                  {mountedBreakers.map(brk => {
                    const slot = slotMap[brk.id];
                    if (!slot) return null;
                    const rowIndex = Math.floor((slot - 1) / 2);
                    const isLeft = slot % 2 !== 0;
                    const ySlot = ROW_START_Y + rowIndex * ROW_PITCH;
                    const wireColor = WIRE_COLORS[brk.fase] || WIRE_COLORS['A'];
                    
                    // Conductor saliendo de la terminal exterior de la pastilla
                    const startX = isLeft ? LEFT_BANK_X + 2 : RIGHT_BANK_X + SLOT_WIDTH - 2;
                    const startY = ySlot + (brk.polos === 2 ? 35 : 17);
                    const gutterX = isLeft ? 190 - (rowIndex * 3) : 598 + (rowIndex * 3);
                    const exitY = 60 + rowIndex * 16;

                    return (
                      <g key={`wire-${brk.id}`} opacity={selectedId && selectedId !== brk.id ? 0.25 : 1}>
                        {/* Conductor de Fase */}
                        <path
                          d={`M ${startX} ${startY} H ${gutterX} V ${exitY}`}
                          fill="none"
                          stroke={wireColor}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Tornillo de terminal de carga */}
                        <circle cx={startX} cy={startY} r="3" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
                        
                        {/* Neutro si requiere (127V 1F) */}
                        {brk.polos === 1 && (
                          <path
                            d={`M 250 ${startY - 4} H ${gutterX - 5} V ${exitY - 3}`}
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="4 2"
                            opacity="0.6"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* CAPA 5: Pastillas Termomagnéticas Montadas Horizontalmente */}
              {mountedBreakers.map(brk => {
                const slot = slotMap[brk.id];
                if (!slot) return null;

                const rowIndex = Math.floor((slot - 1) / 2);
                const isLeft = slot % 2 !== 0;
                const is2P = brk.polos === 2;

                const ySlot = ROW_START_Y + rowIndex * ROW_PITCH;
                const xSlot = isLeft ? LEFT_BANK_X : RIGHT_BANK_X;
                const slotH = is2P ? SLOT_HEIGHT * 2 + 1 : SLOT_HEIGHT;

                // Opacidad según modo de oclusión o estado individual
                const isIndividuallyOccluded = individualOcclusion[brk.id];
                const opacity = isIndividuallyOccluded
                  ? 0.35
                  : occlusionMode === 'hidden'
                  ? 0.05
                  : occlusionMode === 'xray'
                  ? 0.35
                  : 1.0;

                const isSelected = selectedId === brk.id;
                const phaseColor = WIRE_COLORS[brk.fase] || '#f43f5e';

                return (
                  <g
                    key={brk.id}
                    id={`breaker-group-${brk.id}`}
                    transform={`translate(${xSlot}, ${ySlot})`}
                    className="cabinet-breaker-interactive transition-opacity duration-200 cursor-grab active:cursor-grabbing"
                    draggable="true"
                    onDragStart={(e) => onDragStartBreaker(e, brk.id)}
                    onClick={() => onSelect(isSelected ? null : brk.id)}
                    opacity={opacity}
                  >
                    <title>{`${brk.circuitoNumero} · ${brk.capacidad}A · Fase ${brk.fase} · ${is2P ? '2 Polos' : '1 Polo'}`}</title>

                    {/* Resaltado de selección */}
                    {isSelected && (
                      <rect
                        x="-4"
                        y="-4"
                        width={SLOT_WIDTH + 8}
                        height={slotH + 8}
                        rx="7"
                        fill="none"
                        stroke="#2dd4bf"
                        strokeWidth="3"
                        filter="url(#glow-target)"
                      />
                    )}

                    {/* IMAGEN DE LA PASTILLA: Rotada horizontalmente para calzar con stabs y riel exterior */}
                    {is2P ? (
                      /* Pastilla de 2 Espacios (pastilla_2p_tight.png) */
                      isLeft ? (
                        <image
                          href="/assets/tablero/pastilla_2p_tight.png"
                          transform={`translate(0, ${slotH}) rotate(-90)`}
                          width={slotH}
                          height={SLOT_WIDTH}
                          preserveAspectRatio="none"
                          style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' : 'none' }}
                        />
                      ) : (
                        <image
                          href="/assets/tablero/pastilla_2p_tight.png"
                          transform={`translate(${SLOT_WIDTH}, 0) rotate(90)`}
                          width={slotH}
                          height={SLOT_WIDTH}
                          preserveAspectRatio="none"
                          style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' : 'none' }}
                        />
                      )
                    ) : (
                      /* Pastilla de 1 Espacio (pastilla_1p_tight.png) */
                      isLeft ? (
                        <image
                          href="/assets/tablero/pastilla_1p_tight.png"
                          transform={`translate(0, ${slotH}) rotate(-90)`}
                          width={slotH}
                          height={SLOT_WIDTH}
                          preserveAspectRatio="none"
                          style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' : 'none' }}
                        />
                      ) : (
                        <image
                          href="/assets/tablero/pastilla_1p_tight.png"
                          transform={`translate(${SLOT_WIDTH}, 0) rotate(90)`}
                          width={slotH}
                          height={SLOT_WIDTH}
                          preserveAspectRatio="none"
                          style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' : 'none' }}
                        />
                      )
                    )}

                    {/* AMPERAJE VISIBLE EN LA CARA / PALANCA DE LA PASTILLA */}
                    {/* Posición de la palanca central: x=65 a 85 */}
                    <g className="breaker-amperage-face pointer-events-none">
                      {/* Fondo de placa de la palanca */}
                      <rect
                        x={isLeft ? 64 : 54}
                        y={is2P ? 26 : 8}
                        width="20"
                        height="18"
                        rx="3"
                        fill="#090d16"
                        stroke="#334155"
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      {/* Número de Amperaje en alto contraste */}
                      <text
                        x={isLeft ? 74 : 64}
                        y={is2P ? 39 : 21}
                        fill="#ffffff"
                        fontSize={is2P ? '12' : '11'}
                        fontWeight="900"
                        fontFamily="monospace"
                        textAnchor="middle"
                        style={{ textShadow: '0 1px 2px #000' }}
                      >
                        {brk.capacidad || 15}
                      </text>

                      {/* Placa identificadora de Circuito y Fase */}
                      <rect
                        x={isLeft ? 20 : 86}
                        y={is2P ? 27 : 9}
                        width="28"
                        height="16"
                        rx="3"
                        fill="#020617"
                        stroke={phaseColor}
                        strokeWidth="1.5"
                        opacity="0.92"
                      />
                      <text
                        x={isLeft ? 34 : 100}
                        y={is2P ? 39 : 21}
                        fill={phaseColor}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {brk.circuitoNumero}
                      </text>
                    </g>

                    {/* Botones de acción rápida sobre la pastilla al seleccionar */}
                    {isSelected && (
                      <g className="quick-actions cursor-pointer">
                        {/* Botón de Desmontar / Remover */}
                        <g
                          transform={`translate(${isLeft ? 4 : SLOT_WIDTH - 20}, 4)`}
                          onClick={(e) => handleUnmountBreaker(brk.id, e)}
                        >
                          <circle r="7" fill="#be123c" stroke="#fff" strokeWidth="1" />
                          <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" stroke="#fff" strokeWidth="1.5" />
                        </g>
                        {/* Botón de alternar transparencia individual */}
                        <g
                          transform={`translate(${isLeft ? 4 : SLOT_WIDTH - 20}, ${slotH - 6})`}
                          onClick={(e) => toggleBreakerOcclusion(brk.id, e)}
                        >
                          <circle r="7" fill="#4338ca" stroke="#fff" strokeWidth="1" />
                          <circle r="3" fill="#fff" />
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Indicador de Espacios Libres al final */}
              <text x="394" y="990" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace">
                CENTRO DE CARGA INDUSTRIAL · BARRAS DE COBRE ELECTROLÍTICO NOM-001-SEDE
              </text>
            </svg>
          </div>
        </div>

        {/* Panel Lateral: Bandeja de Pastillas Desmontadas e Inspector */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-slate-900/90 border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[860px]">
          
          {/* Bandeja de Pastillas Desmontadas / Disponibles (Drop zone para remover) */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={onDropOnTray}
            className={`rounded-2xl p-3.5 border transition-all duration-200 ${
              unmountedBreakers.length > 0
                ? 'bg-amber-500/10 border-amber-500/40'
                : 'bg-slate-950/60 border-slate-800 border-dashed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Move size={13} /> Bandeja de Pastillas ({unmountedBreakers.length})
              </span>
              <span className="text-[10px] text-slate-500">Arrastra aquí para desmontar</span>
            </div>

            {unmountedBreakers.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-4 italic">
                Todas las pastillas están montadas en el gabinete.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {unmountedBreakers.map(b => (
                  <div
                    key={b.id}
                    draggable="true"
                    onDragStart={(e) => onDragStartBreaker(e, b.id)}
                    onClick={() => onSelect(b.id)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-teal-500 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-teal-300">
                        {b.circuitoNumero}
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-slate-200">{b.capacidad}A · {b.polos}P</p>
                        <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{b.name || 'Circuito derivado'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{Math.round(b.vaTotal || 0)} VA</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspector de Circuito Seleccionado */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex-1">
            <span className="text-[10px] font-bold text-teal-400 font-mono uppercase tracking-wider block mb-2">
              INSPECTOR DE PASTILLA
            </span>

            {selectedBreaker ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 font-display">
                      <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 font-mono text-xs">
                        {selectedBreaker.circuitoNumero}
                      </span>
                      {selectedBreaker.name || 'Circuito'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Fase {selectedBreaker.fase} · {selectedBreaker.polos} Polo{selectedBreaker.polos > 1 ? 's' : ''} · Espacio #{slotMap[selectedBreaker.id] || 'Bandeja'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnmountBreaker(selectedBreaker.id)}
                    className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                  >
                    Desmontar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Protección ITM</span>
                    <strong className="text-sm font-mono text-teal-400">{selectedBreaker.capacidad} A</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Potencia</span>
                    <strong className="text-sm font-mono text-slate-200">{Math.round(selectedBreaker.vaTotal || 0)} VA</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Corriente Ic</span>
                    <strong className="text-sm font-mono text-amber-400">{(selectedBreaker.icTotal || 0).toFixed(2)} A</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Conductor</span>
                    <strong className="text-sm font-mono text-slate-200">{selectedBreaker.conductor || '14 AWG'}</strong>
                  </div>
                </div>

                {/* Acciones directas sobre la pastilla seleccionada */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <button
                    onClick={() => toggleBreakerOcclusion(selectedBreaker.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {individualOcclusion[selectedBreaker.id] ? <Eye size={13} /> : <EyeOff size={13} />}
                    {individualOcclusion[selectedBreaker.id] ? 'Hacer Sólida (Opaca)' : 'Ocluir Esta Pastilla (Transparente)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs leading-relaxed">
                <Info size={24} className="mx-auto mb-2 text-slate-600" />
                Haz clic sobre cualquier pastilla en el gabinete para inspeccionar sus especificaciones o arrástrala para reacomodarla.
              </div>
            )}
          </div>

          {/* Lista de Cargas / Aparatos de Proyecto */}
          {showApparatusList && (
            <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-2">
                APARATOS CONECTADOS ({circuitos.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {circuitos.map(ap => (
                  <div
                    key={ap.id}
                    onClick={() => onSelectLoad && onSelectLoad(ap.id)}
                    className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      selectedLoad === ap.id
                        ? 'bg-teal-950/40 border-teal-500 text-teal-200'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="font-bold text-[11px] truncate">{ap.tipo}</p>
                      <p className="text-[9px] text-slate-500 truncate">{ap.modelo || '—'}</p>
                    </div>
                    <span className="font-mono text-[10px] text-teal-400 flex-shrink-0">{ap.watts}W</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
