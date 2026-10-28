import { calcularDistribucion, evaluarDistribucion, moverAparato, criterioAparato } from '../utils/circuitDistribution.js';
import GabineteTablero from './GabineteTablero';
import { circuitosToBreakers } from '../utils/gabineteModel.js';
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
} from '../utils/ecuacionesUVIE';

const FASE_COLOR = {
  A:       { bg: 'bg-rose-500',    border: 'border-rose-500',    text: 'text-rose-400',    hex: '#f43f5e' },
  B:       { bg: 'bg-sky-500',     border: 'border-sky-500',     text: 'text-sky-400',     hex: '#38bdf8' },
  C:       { bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-400', hex: '#b67cf0' },
  'A-B':   { bg: 'bg-violet-500',  border: 'border-violet-500',  text: 'text-violet-400',  hex: '#a78bfa' },
  'B-C':   { bg: 'bg-teal-500',    border: 'border-teal-500',    text: 'text-teal-400',    hex: '#2dd4bf' },
  'A-C':   { bg: 'bg-orange-500',  border: 'border-orange-500',  text: 'text-orange-400',  hex: '#fb923c' },
  'A-B-C': { bg: 'bg-yellow-500',  border: 'border-yellow-500',  text: 'text-yellow-400',  hex: '#facc15' },
};
const getFaseColor = (fase) => FASE_COLOR[fase] || FASE_COLOR['A'];

const getIcon = (tipo = '') => {
  const t = tipo.toLowerCase();
  if (t.includes('calor') || t.includes('horno') || t.includes('plancha') || t.includes('parrilla')) return '\uD83D\uDD25';
  if (t.includes('frio') || t.includes('refrig') || t.includes('congelad') || t.includes('vitrina')) return '❄️';
  if (t.includes('motor') || t.includes('bomba') || t.includes('compresor')) return '⚙️';
  if (t.includes('luz') || t.includes('ilum') || t.includes('lampara') || t.includes('led')) return '\uD83D\uDCA1';
  if (t.includes('comput') || t.includes('monitor') || t.includes('pc')) return '\uD83D\uDCBB';
  if (t.includes('ventilad') || t.includes('extractor') || t.includes('aire')) return '\uD83C\uDF00';
  if (t.includes('cafe') || t.includes('espresso')) return '☕';
  if (t.includes('licuad') || t.includes('batidora') || t.includes('mezcl')) return '\uD83E\uDD64';
  if (t.includes('microond')) return '\uD83D\uDCE1';
  return '⚡';
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
              <p className="text-[9px] text-slate-500 truncate">{aparato.modelo || '—'}</p>
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
            <p className={`text-[9px] font-bold font-mono ${fc ? fc.text : 'text-slate-500'}`}>{fase || '—'}</p>
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
                      <span className="text-slate-500">{b.capacidad}A · {b.fase}</span>
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

function BreakerCard({ breaker, aparatos, onChangePolos, onDelete, onChangeCapacidad, onCycleFase, highlighted, onDragStart, onDrop }) {
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
            <p className="text-[7px] text-slate-600 leading-none mt-0.5">{breaker.polos === 3 ? '3F' : breaker.polos === 2 ? '2F' : '1F'} · {breaker.fase}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {brkAps.length === 0 && <select aria-label={`Polos de ${breaker.circuitoNumero}`} value={breaker.polos} onChange={e=>onChangePolos(breaker.id,Number(e.target.value))}>{[1,2,3].map(n=><option key={n} value={n}>{n}P</option>)}</select>}
          <select aria-label={`Capacidad de ${breaker.circuitoNumero}`} value={breaker.capacidad} onChange={e => onChangeCapacidad(breaker.id, parseInt(e.target.value))}
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
      {breaker.notas?.map(n => <p key={n} className="text-xs text-amber-200 p-2">{n}</p>)}
      <div className="p-1.5 space-y-0.5 max-h-48 overflow-y-auto">
        {brkAps.length === 0
          ? <p className="text-[8px] text-slate-700 text-center py-2 italic">Vacío</p>
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

export default function BalanceadorTablero({ 
  aparatos = [], 
  onApplyBalancing, 
  acometida, 
  proyectoId, 
  computedElectricalSystem,
  medidores = [],
  activeMedidorId,
  onSelectMedidor
}) {
  const listaMedidores = useMemo(() => (
    Array.isArray(medidores) && medidores.length > 0
      ? medidores
      : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }]
  ), [medidores]);

  const [selectedMedId, setSelectedMedId] = useState(activeMedidorId || listaMedidores[0].id);

  useEffect(() => {
    if (activeMedidorId) {
      setSelectedMedId(activeMedidorId);
    }
  }, [activeMedidorId]);

  const [storedBreakers,  setBreakers]        = useState(null);
  const [hasSolution,     setHasSolution]     = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess,    setApplySuccess]    = useState(false);
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

  // Estados para formato de visualización (Gabinete Físico Real interactivo por defecto) y tamaño de gabinete
  const [viewFormat, setViewFormat] = useState('physical'); // 'logical' | 'physical'
  const [selectedPanelSize, setSelectedPanelSize] = useState(24); // 2, 4, 8, 12, 24

  // Filtrar aparatos de este medidor
  const aparatosActivos = useMemo(() => {
    if (listaMedidores.length <= 1) return aparatos;
    return aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === selectedMedId);
  }, [aparatos, listaMedidores, selectedMedId]);

  const sourceCircuits = useMemo(() => {
    const allCircuits = computedElectricalSystem?.circuitos || [];
    if (listaMedidores.length <= 1) return allCircuits;
    return allCircuits.filter(c => c.loads?.some(l => (l.medidorId || listaMedidores[0].id) === selectedMedId));
  }, [computedElectricalSystem, listaMedidores, selectedMedId]);

  const projectBreakers = useMemo(() => circuitosToBreakers(sourceCircuits), [sourceCircuits]);
  const evaluation = useMemo(() => evaluarDistribucion(storedBreakers ?? projectBreakers, aparatosActivos, acometida?.fasesDisponibles || ['A']), [storedBreakers, projectBreakers, aparatosActivos, acometida]);
  const breakers = evaluation.breakers;
  const loadCircuits = useMemo(() => {
    const allCargas = computedElectricalSystem?.cargas || sourceCircuits.flatMap(c => c.loads || [c]);
    if (listaMedidores.length <= 1) return allCargas;
    return allCargas.filter(l => (l.medidorId || listaMedidores[0].id) === selectedMedId);
  }, [computedElectricalSystem, sourceCircuits, listaMedidores, selectedMedId]);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [mathInfo, setMathInfo] = useState('');

  const isInitializedRef = useRef(false);
  const loadedProyectoIdRef = useRef(null);

  // Cargar configuración guardada al cambiar el proyectoId
  useEffect(() => {
    if (!proyectoId) return;
    isInitializedRef.current = false;
    loadedProyectoIdRef.current = null;
    
    // Circuit assignments belong to the project, never to a private cached copy.
    const legacyDraft = localStorage.getItem(`balance_breakers_${proyectoId}`);
    if (legacyDraft) localStorage.setItem(`balance_breakers_backup_${proyectoId}`, legacyDraft);
    localStorage.removeItem(`balance_breakers_${proyectoId}`);
    setBreakers(null);
    setHasSolution(false);

    // Formato de vista: siempre priorizar el gabinete físico interactivo
    setViewFormat('physical');
    try {
      localStorage.removeItem(`balance_view_format_${proyectoId}`);
      localStorage.removeItem('balance_view_format_local_default');
      localStorage.removeItem('balance_view_format_hawaiian_paradise');
    } catch (_) {}

    // Cargar tamaño de panel (por defecto 24 espacios para alojar todos los circuitos de Hawaiian Paradise)
    const savedSize = localStorage.getItem(`balance_panel_size_${proyectoId}`);
    if (savedSize && parseInt(savedSize, 10) >= 16) {
      setSelectedPanelSize(parseInt(savedSize, 10));
    } else {
      setSelectedPanelSize(24);
    }

    // Marcar como inicializado al terminar de cargar
    isInitializedRef.current = true;
    loadedProyectoIdRef.current = proyectoId;
  }, [proyectoId]);

  useEffect(() => {
    if (!proyectoId || !isInitializedRef.current || loadedProyectoIdRef.current !== proyectoId) return;
    localStorage.setItem(`balance_panel_size_${proyectoId}`, selectedPanelSize.toString());
  }, [selectedPanelSize, proyectoId]);

  // Edits from Instalación (or another module) invalidate any incomplete local edit.
  useEffect(() => { setBreakers(null); setSelectedLoad(null); }, [aparatos, proyectoId]);

  const syncVersion = useRef(0);
  const changeDistribution = useCallback(nextOrUpdate => {
    const next = typeof nextOrUpdate === 'function' ? nextOrUpdate(breakers) : nextOrUpdate;
    setBreakers(next);
    setApplySuccess(false);
    const check = evaluarDistribucion(next, aparatos, acometida?.fasesDisponibles || ['A']);
    if (check.errores.length || typeof onApplyBalancing !== 'function') return;
    // Keep empty reserve breakers editable without rewriting an unchanged project.
    const signature = items => JSON.stringify(items.filter(b=>b.aparatos.length).map(b=>[b.id,[...b.aparatos].sort(),b.fase,b.capacidad]));
    if (signature(next) === signature(projectBreakers)) return;
    const version = ++syncVersion.current;
    setApplying(true);
    Promise.resolve(onApplyBalancing(check.breakers)).then(saved => {
      if (version !== syncVersion.current) return;
      setApplyError('');
      setApplySuccess(saved?.remote === false
        ? 'Cambios reflejados en todos los módulos y guardados localmente. Sincronización con la nube pendiente.'
        : 'Cambios sincronizados con Instalación, Tablero visual y Diagrama unifilar.');
    }).catch(error => {
      if (version === syncVersion.current) setApplyError(`No se pudo guardar: ${error.message}`);
    }).finally(() => { if (version === syncVersion.current) setApplying(false); });
  }, [breakers, aparatos, acometida, onApplyBalancing, projectBreakers]);

  const fasesDisponibles = useMemo(() => acometida?.fasesDisponibles || ['A'], [acometida]);

  const totalVA = useMemo(() =>
    aparatosActivos.reduce((s, ap) => s + calcularVA(ap.watts, ap.fp, ap.usarVaDirecto), 0), [aparatosActivos]);

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
  const aparatosSinAsignar = useMemo(() => aparatosActivos.filter(ap => !aparatosAsignados.has(ap.id)), [aparatosActivos, aparatosAsignados]);
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
    const result = calcularDistribucion(aparatosActivos, acometida?.id || 'monofasico');
    // A rejected automatic proposal must not look like the applied project.
    // Keep every module on the same persisted assignment and explain the blocker.
    if (result.errores.length) {
      setBreakers(null);
      setSelectedLoad(null);
      setHasSolution(false);
      setLastBalanceMode('');
      setMathInfo('');
      setApplySuccess(false);
      const motivos = result.errores.map(error => {
        const circuit = result.breakers.find(b => error.startsWith(`${b.circuitoNumero}:`));
        const equipos = circuit && aparatosActivos.filter(a => circuit.aparatos.includes(a.id)).map(a => a.tipo).join(', ');
        return equipos ? `${equipos}: ${error.slice(circuit.circuitoNumero.length + 1).trim()}` : error;
      });
      setApplyError(`No se aplicó el balance matemático. Todos los módulos conservan los circuitos actuales. Corrige estos datos en Instalación eléctrica y vuelve a balancear: ${motivos.join(' ')}`);
      return;
    }
    setMathInfo(result.busquedaCompleta ? 'Asignación de fases con menor desbalance para los grupos propuestos.' : 'Mejor asignación encontrada dentro del límite de búsqueda.');
    setSelectedLoad(null);
    setApplyError('');
    changeDistribution(result.breakers);
    setHasSolution(true);
    setLastBalanceMode('math');
  }, [aparatosActivos, acometida, changeDistribution]);

  const handleBalanceAI = useCallback(async () => {
    setShowAIModal(true);
    setAILoading(true);
    setAIError('');
    setAIProposal(null);
    const acometidaDesc = acometida?.id === 'trifasico' ? 'Trifasica 220V Fases A,B,C'
      : acometida?.id === 'bifasico' ? 'Bifasica 220V Fases A,B' : 'Monofasica 127V Fase A';
    const listaAps = aparatosActivos.map((ap, i) => {
      const va  = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
      const in_ = calcularCorrienteNominal(va, ap.tipoCarga);
      const ic  = calcularCorrienteCorregida(in_);
      return `${i+1}. id="${ap.id}" tipo="${ap.tipo}" ${ap.watts}W carga=${ap.tipoCarga} Ic=${ic.toFixed(2)}A`;
    }).join('\n');
    const prompt = `Eres ingeniero electricista experto en la NOM-001-SEDE-2012 (México) y diseño de centros de carga para locales comerciales.
Instalación: ${acometidaDesc}
Aparatos registrados:
${listaAps}

Tu tarea es proponer la distribución óptima de estos aparatos en interruptores termomagnéticos (breakers) del Centro de Carga.

Aplica estrictamente los siguientes criterios de DISEÑO ELÉCTRICO PROFESIONAL:

1. CIRCUITOS DEDICADOS (Individuales):
   - Recomienda cargas de alta demanda (ej. creperas, cafeteras espresso, hornos, calentadores, aire acondicionado) en su propio interruptor termomagnético exclusivo. No compartirá circuito con ningún otro equipo.
   - Todo motor grande o compresor (ej. aire acondicionado, refrigeración comercial grande) debe ir en un interruptor dedicado para evitar que los picos de arranque disparen las protecciones de otros equipos o generen caídas de voltaje perjudiciales en la línea.

2. CIRCUITOS COMPARTIDOS (Agrupados):
   - Cargas menores de iluminación, contactos generales, computadoras, cajas registradoras, molinillos pequeños y extractores pequeños PUEDEN agruparse en un mismo circuito de 15A o 20A.
   - La corriente corregida (Ic) total de las cargas agrupadas en un circuito continuo no debe exceder el 100% de la capacidad del breaker: Ic ya incluye 125%. No aplicar el margen dos veces. Respeta 210-23 para cargas fijas/portátiles y los límites del conductor registrado.

3. COMPATIBILIDAD Y RUIDO ELÉCTRICO:
   - No agrupes computadoras o equipos electrónicos delicados (cajas registradoras, terminales) en el mismo circuito que motores (licuadoras, extractores) para evitar daño por ruido electromagnético.
   - Mantén la iluminación separada de los circuitos de contactos siempre que sea posible.

4. PROTECCIÓN CONTRA INCENDIOS (Sobredimensionamiento):
   - NUNCA agrupes equipos pequeños en un interruptor sobredimensionado (de 30A o más) para 'ahorrar espacio'. Los conductores de los aparatos pequeños (calibres 14 o 16 AWG) se derretirían ante un cortocircuito antes de lograr disparar un breaker de 30A, violando el Art. 240-3 y creando alto riesgo de incendio. Usa breakers de 15A o 20A para estos grupos.

5. BALANCE DE FASES:
   - Distribuye las cargas entre las fases disponibles (${fasesDisponibles.join(', ')}) para que el desbalanceo total sea menor al 5%.
   - Cargas bifásicas ocupan 2 polos (2F). Monofásicas 1 polo (1F).

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
  }, [aparatos, acometida, fasesDisponibles]);

  const applyProposal = useCallback(async proposal => {
    if (typeof onApplyBalancing !== 'function' || applying) return false;
    const check = evaluarDistribucion(proposal, aparatos, fasesDisponibles);
    if(check.errores.length) {setApplyError(check.errores.join(' ')); return false;}
    setApplying(true);
    setApplyError('');
    try {
      const saved = await onApplyBalancing(proposal);
      setBreakers(null);
      setHasSolution(false);
      setViewFormat('physical');
      setHighlightBrkId(null);
      if (proyectoId) localStorage.removeItem(`balance_breakers_${proyectoId}`);
      setApplySuccess(saved?.remote === false
        ? 'Distribución guardada localmente y reflejada en Instalación y Unifilar. No se confirmó la sincronización con la nube.'
        : 'Distribución guardada: circuitos compartidos sincronizados con Instalación y Unifilar.');
      return true;
    } catch (error) {
      setApplyError(`No se pudo aplicar: ${error.message || 'error de guardado'}`);
      return false;
    } finally { setApplying(false); }
  }, [onApplyBalancing, applying, proyectoId, aparatos, fasesDisponibles]);

  const handleApplyToProject = () => applyProposal(breakers);
  const handleApplyAI = async () => {
    if (!aiProposal) return;
    setBreakers(aiProposal.breakers);
    setHasSolution(true);
    setViewFormat('physical');
    setLastBalanceMode(aiProposal.modelUsed === 'Gemini 2.5' ? 'ai-premium' : 'ai-lite');
    if (await applyProposal(aiProposal.breakers)) {
      setShowAIModal(false);
      setAIProposal(null);
    }
  };

  const handleDeleteBreaker   = useCallback((id) => changeDistribution(prev => (prev ?? breakers).filter(b => b.id !== id)), [breakers, changeDistribution]);
  const handleChangeCapacidad = useCallback((id, cap) => changeDistribution(prev => (prev ?? breakers).map(b => b.id === id ? { ...b, capacidad: cap } : b)), [breakers, changeDistribution]);
  const handleCycleFase       = useCallback((id) => changeDistribution(prev => (prev ?? breakers).map(b => {
    if (b.id !== id || b.polos !== 1) return b;
    const idx = fasesDisponibles.indexOf(b.fase);
    return { ...b, fase: fasesDisponibles[(idx + 1) % fasesDisponibles.length] };
  })), [fasesDisponibles, breakers, changeDistribution]);
  const handleAddBreaker = useCallback(() => {
    setViewFormat('physical');
    const n = breakers.length + 1;
    changeDistribution(prev => [...(prev ?? breakers), { id: `brk-manual-${Date.now()}`, capacidad: 20, polos: 1, fase: fasesDisponibles[0] || 'A', aparatos: [], circuitoNumero: `C-${n}`, vaTotal: 0, icTotal: 0 }]);
  }, [breakers, fasesDisponibles, changeDistribution]);
  const handleMoveToBreaker = useCallback((aparatoId, targetId) => {
    const result = moverAparato(breakers, aparatoId, targetId, aparatosActivos);
    if(result.error) { setApplyError(result.error); return; }
    changeDistribution(result.breakers); setSelectedLoad(null); setApplyError(''); setMathInfo('Distribución manual. Balancear (Matemático) restaura la propuesta calculada.');
  }, [aparatosActivos, breakers, changeDistribution]);

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

  const apsConBreaker = aparatosActivos.map(ap => ({ ...ap, _brk: aparatoBreakerMap[ap.id] || null }));
  const apsIzq = apsConBreaker.filter((_, i) => i % 2 === 0);
  const apsDer = apsConBreaker.filter((_, i) => i % 2 !== 0);
  const dsColor = desbalancePct <= 3 ? 'text-emerald-400' : desbalancePct <= 5 ? 'text-amber-400' : 'text-rose-400 animate-pulse';

  return (
    <div className="space-y-4">

      {/* Pestañas de Selección de Medidor (cuando hay múltiples medidores) */}
      {listaMedidores.length > 1 && (
        <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Medidor a Balancear / Visualizar:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {listaMedidores.map(med => {
              const count = aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === med.id).length;
              return (
                <button
                  key={med.id}
                  onClick={() => {
                    setSelectedMedId(med.id);
                    setBreakers(null);
                    setHasSolution(false);
                    if (onSelectMedidor) onSelectMedidor(med.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedMedId === med.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{med.nombre || `Medidor ${med.numero}`}</span>
                  <span className="text-[10px] opacity-80 font-mono">({count} cargas)</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-display">Balance Inteligente de Cargas</h3>
                {listaMedidores.length > 1 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold font-mono border border-teal-500/30">
                    {listaMedidores.find(m => m.id === selectedMedId)?.nombre || 'Medidor'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                {aparatosActivos.length} aparatos · {(totalVA / 1000).toFixed(2)} kVA · ITM {itm.breaker}A
                {hasSolution && <span className={`ml-2 font-bold ${dsColor}`}>· Desbalanceo: {desbalancePct.toFixed(1)}%</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleBalanceMath} className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer">
              <RefreshCw size={12} /> Balancear (Matemático)
            </button>
            <button onClick={handleBalanceAI} className="px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer">
              <Sparkles size={12} /> Balancear con IA
            </button>
            {storedBreakers !== null && breakers.length > 0 && typeof onApplyBalancing === 'function' && (
              <button 
                disabled={applying || evaluation.errores.length > 0}
                onClick={handleApplyToProject} 
                className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer animate-fadeIn"
                title="Sincronizar las fases y breakers calculados con la base de datos y cuadros del proyecto"
              >
                <CheckCircle2 size={12} /> {applying ? 'Guardando…' : 'Guardar distribución en el proyecto'}
              </button>
            )}
            <button onClick={() => {
              setBreakers(null);
              localStorage.removeItem(`balance_breakers_${proyectoId}`);
              setViewFormat('physical');
              setHasSolution(false);
              setHighlightBrkId(null);
            }} className="px-3 py-2 bg-slate-800 text-slate-200 text-[11px] rounded-xl border border-slate-700 cursor-pointer">
              Ver circuitos del proyecto
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
              {viewFormat === 'logical' ? 'Ver Gabinete Físico' : 'Ver Vista Lógica'}
            </button>
            {viewFormat === 'physical' && (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 flex-shrink-0">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-sans">Gabinete:</span>
                <select 
                  value={selectedPanelSize} 
                  onChange={(e) => setSelectedPanelSize(parseInt(e.target.value))}
                  className="text-[10px] bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 font-bold font-sans text-teal-400 focus:outline-none cursor-pointer"
                >
                  <option value={2}>2 espacios</option>
                  <option value={4}>4 espacios</option>
                  <option value={8}>8 espacios</option>
                  <option value={12}>12 espacios</option>
                  <option value={24}>24 espacios</option>
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

      {applyError && <p role="alert" className="cabinet-warning">{applyError}</p>}
      {applySuccess && <p role="status" className="cabinet-note">{applySuccess}</p>}
      {storedBreakers !== null && <p className="cabinet-note">Los cambios válidos se reflejan automáticamente en todos los módulos. Los acomodos incompletos o incompatibles quedan pendientes hasta corregirlos. Balancear (Matemático) restaura la propuesta calculada.</p>}
      {mathInfo && <p role="status" className="cabinet-note">{mathInfo}</p>}
      {evaluation.errores.map(text => <p role="alert" className="cabinet-warning" key={text}>{text}</p>)}
      {evaluation.avisos.map(text => <p className="cabinet-warning" key={text}>{text}</p>)}
      <p className="cabinet-note">Criterio de cálculo: Ic = 1.25 × In (supuesto conservador de uso continuo). Se compara Ic con el 100% de la pastilla. Confirmar placa, arranque, montaje y recorrido antes de ejecutar la instalación.</p>

      <p className="cabinet-note">Arrastra un aparato hacia una pastilla, o selecciona el aparato y después la pastilla de destino. Para moverlo con teclado también puedes usar «Mover» en la vista lógica.</p>
      {selectedLoad && <p role="status" className="cabinet-note">Seleccionado: {aparatosActivos.find(a=>a.id===selectedLoad)?.tipo}. Selecciona la pastilla de destino.</p>}
      <div className="grid md:grid-cols-2 gap-2" aria-label="Motivos de circuitos independientes">
        {aparatosActivos.filter(a=>criterioAparato(a).dedicado).map(a=><p key={a.id} className="text-xs text-amber-200 bg-slate-900 rounded-lg p-2"><strong>{aparatoBreakerMap[a.id]?.circuitoNumero || 'Sin asignar'} · {a.tipo}: </strong>{criterioAparato(a).nota}</p>)}
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
              <p className="text-[9px] text-slate-500 mt-1">{desbalancePct <= 3 ? '✅ Óptimo' : desbalancePct <= 5 ? '⚠️ Aceptable (≤5%)' : '❌ Excede UVIE'}</p>
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
              Método: {lastBalanceMode.startsWith('ai') ? `Inteligencia Artificial (${lastBalanceMode === 'ai-premium' ? 'Gemini 2.5' : 'Gemini Lite'})` : 'Agrupación por uso y búsqueda de balance de fases'}
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
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Aparatos · Grupo 1</span>
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
                    <h4 className="text-sm font-bold text-white font-display">Tablero de Distribución · {acometida?.tipo || 'Eléctrico'}</h4>
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
                  <text x="6" y={fasesDisponibles.length * 10 + 5} fontSize="5.5" fill="#94a3b8" fontFamily="monospace">N · T</text>
                </svg>
              </div>

              {!hasSolution && breakers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                    <Zap size={26} className="text-slate-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-500 mb-2">Tablero sin distribución</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-5 max-w-56">
                    Presiona uno de los botones de balance para distribuir los {aparatosActivos.length} aparatos automáticamente.
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
                        onChangePolos={(id,p)=>changeDistribution(breakers.map(b=>b.id===id?{...b,polos:p,fase:fasesDisponibles.slice(0,p).join('-')}:b))} onDelete={handleDeleteBreaker} onChangeCapacidad={handleChangeCapacidad}
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
                  <p className="text-[9px] text-slate-600 font-mono">{breakers.length} circuitos · {aparatosSinAsignar.length} sin asignar</p>
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
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Grupo 2 · Aparatos</span>
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
          <GabineteTablero
            breakers={breakers}
            circuitos={loadCircuits}
            alimentador={computedElectricalSystem?.alimPrincipal}
            desbalancePct={desbalancePct}
            selectedId={highlightBrkId}
            onSelect={id => { if (selectedLoad && id) handleMoveToBreaker(selectedLoad,id); else setHighlightBrkId(id); }}
            selectedLoad={selectedLoad} onSelectLoad={setSelectedLoad} onDragStart={handleDragStart} onDrop={handleDropOnBreaker} onMoveLoad={handleMoveToBreaker}
            selectedPanelSize={selectedPanelSize} 
            acometida={acometida} 
            onUpdateBreakers={changeDistribution}
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
            <h4 className="text-[11px] font-bold text-amber-300">{aparatosSinAsignar.length} aparato{aparatosSinAsignar.length > 1 ? 's' : ''} sin asignar a ningún circuito</h4>
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
                <p className="text-[9px] font-mono text-slate-500 mt-0.5">{ap.watts}W · {Math.round(calcularVA(ap.watts, ap.fp, ap.usarVaDirecto))}VA</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/20 border border-slate-800/30">
        <Info size={12} className="text-teal-400 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-600 leading-relaxed">
          <strong className="text-slate-500">NOM-001-SEDE-2012:</strong> Identificación de conductores: 200-6 y 250-119. Colores de fase: convención gráfica. El objetivo de balance del algoritmo no constituye una certificación normativa.
        </p>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-white" />
                <div>
                  <h2 className="text-[13px] font-bold text-white">Distribución por Gemini AI ({aiProposal?.modelUsed})</h2>
                  <p className="text-[9px] text-violet-200">{aparatosActivos.length} aparatos · {(totalVA/1000).toFixed(2)} kVA · {acometida?.tipo}</p>
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
                    <p className="text-[13px] font-bold text-slate-200">Analizando con IA…</p>
                    <p className="text-[10px] text-slate-500 mt-1">Gemini calcula la distribución óptima según NOM-001-SEDE</p>
                  </div>
                </div>
              )}
              {aiError && !aiLoading && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-800/40">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={13} className="text-rose-400" />
                    <h4 className="text-[12px] font-bold text-rose-300">Error de Conexión con IA</h4>
                  </div>
                  <p className="text-[10px] text-rose-400 leading-relaxed mb-3">{aiError}</p>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg text-[9px] text-slate-400 space-y-1 mb-3">
                    <p><strong>Para habilitar la IA:</strong></p>
                    <p>1. Crea el archivo <code className="bg-slate-800 px-1 rounded">.env</code> en la raíz del proyecto</p>
                    <p>2. Agrega: <code className="bg-slate-800 px-1 rounded">VITE_GEMINI_API_KEY=tu_clave</code></p>
                    <p>3. Clave gratuita en: <span className="text-teal-400">aistudio.google.com</span></p>
                  </div>
                  <button onClick={() => { setShowAIModal(false); handleBalanceMath(); }}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                    <RefreshCw size={11} /> Usar Balance Matemático
                  </button>
                </div>
              )}
              {aiProposal && !aiLoading && (
                <div className="space-y-3">
                  {aiProposal.analisis && (
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-800/40">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles size={11} className="text-violet-400" />
                        <span className="text-[9px] font-bold text-violet-300 uppercase tracking-wider">Análisis de Gemini</span>
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
                      <p className={`text-[11px] font-bold ${ (aiProposal.desbalancePct || 0) <= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>{(aiProposal.desbalancePct || 0) <= 5 ? '✅ OK' : '⚠️ Revisar'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Distribución Propuesta:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {aiProposal.breakers.map(brk => {
                        const fc     = getFaseColor(brk.fase);
                        const brkAps = aparatos.filter(ap => brk.aparatos.includes(ap.id));
                        return (
                          <div key={brk.id} className="rounded-xl border p-2.5 bg-slate-900/60" style={{ borderColor: fc.hex + '55' }}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${fc.bg} text-slate-950 font-mono`}>{brk.circuitoNumero}</span>
                              <span className={`text-[10px] font-bold ${fc.text}`}>{brk.fase} · {brk.capacidad}A · {brk.polos}P</span>
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
                    <CheckCircle2 size={12} /> Aplicar Distribución de la IA
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
