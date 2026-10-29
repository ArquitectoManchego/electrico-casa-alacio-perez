import { calcularDistribucion, evaluarDistribucion, moverAparato, criterioAparato } from '../utils/circuitDistribution.js';
import GabineteTablero from './GabineteTablero';
import { circuitosToBreakers } from '../utils/gabineteModel.js';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Zap, RefreshCw, Sparkles, Trash2, Plus, X, AlertTriangle,
  CheckCircle2, Info, BarChart3, ArrowLeftRight, Sliders, Layers, LayoutGrid, Check
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
  if (t.includes('calor') || t.includes('horno') || t.includes('plancha') || t.includes('parrilla')) return '🔥';
  if (t.includes('frio') || t.includes('refrig') || t.includes('congelad') || t.includes('vitrina')) return '❄️';
  if (t.includes('motor') || t.includes('bomba') || t.includes('compresor') || t.includes('coser') || t.includes('bordadora')) return '⚙️';
  if (t.includes('luz') || t.includes('ilum') || t.includes('lampara') || t.includes('led')) return '💡';
  if (t.includes('comput') || t.includes('monitor') || t.includes('pc') || t.includes('laptop') || t.includes('tpv')) return '💻';
  if (t.includes('ventilad') || t.includes('extractor') || t.includes('aire')) return '🌀';
  if (t.includes('cafe') || t.includes('espresso')) return '☕';
  if (t.includes('licuad') || t.includes('batidora') || t.includes('mezcl')) return '🥤';
  if (t.includes('laser') || t.includes('sublimacion') || t.includes('plotter')) return '🖨️';
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

/**
 * MÓDULO INDIVIDUAL DE TABLERO POR MEDIDOR
 * Cada medidor tiene su propio módulo con sus indicadores normativos, gabinete físico real y botón de balance matemático.
 */
function SingleMedidorTableroModule({
  medidor,
  aparatosMedidor,
  allAparatos,
  acometidaMedidor,
  proyectoId,
  computedElectricalSystem,
  onApplyBalancing,
  onBalancearMedidor
}) {
  const [storedBreakers, setBreakers] = useState(null);
  const [hasSolution, setHasSolution] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [highlightBrkId, setHighlightBrkId] = useState(null);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiProposal, setAIProposal] = useState(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState('');
  const [lastBalanceMode, setLastBalanceMode] = useState('');
  const [isLeftOver, setIsLeftOver] = useState(false);
  const [isRightOver, setIsRightOver] = useState(false);
  const [isUnassignedOver, setIsUnassignedOver] = useState(false);

  // Formato de visualización: Gabinete Físico por defecto
  const [viewFormat, setViewFormat] = useState('physical');
  const [selectedPanelSize, setSelectedPanelSize] = useState(24);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [mathInfo, setMathInfo] = useState('');

  // Circuitos derivados asociados a este medidor
  const sourceCircuits = useMemo(() => {
    const allCircuits = computedElectricalSystem?.circuitos || [];
    return allCircuits.filter(c => c.loads?.some(l => (l.medidorId || medidor.id) === medidor.id));
  }, [computedElectricalSystem, medidor.id]);

  const projectBreakers = useMemo(() => circuitosToBreakers(sourceCircuits), [sourceCircuits]);
  const evaluation = useMemo(() => evaluarDistribucion(
    storedBreakers ?? projectBreakers, 
    aparatosMedidor, 
    acometidaMedidor?.fasesDisponibles || ['A']
  ), [storedBreakers, projectBreakers, aparatosMedidor, acometidaMedidor]);

  const breakers = evaluation.breakers;
  const loadCircuits = useMemo(() => {
    const allCargas = computedElectricalSystem?.cargas || sourceCircuits.flatMap(c => c.loads || [c]);
    return allCargas.filter(l => (l.medidorId || medidor.id) === medidor.id);
  }, [computedElectricalSystem, sourceCircuits, medidor.id]);

  // Invalidar edición local al recibir nuevos datos
  useEffect(() => { 
    setBreakers(null); 
    setSelectedLoad(null); 
  }, [aparatosMedidor, proyectoId]);

  const fasesDisponibles = useMemo(() => acometidaMedidor?.fasesDisponibles || ['A'], [acometidaMedidor]);

  const totalWatts = useMemo(() =>
    aparatosMedidor.reduce((s, ap) => s + (parseFloat(ap.watts) || 0), 0), [aparatosMedidor]);

  const totalVA = useMemo(() =>
    aparatosMedidor.reduce((s, ap) => s + calcularVA(ap.watts, ap.fp, ap.usarVaDirecto), 0), [aparatosMedidor]);

  const fasesVAActual = useMemo(() => {
    const fva = { A: 0, B: 0, C: 0 };
    breakers.forEach(brk => {
      const parts = brk.fase.split('-');
      parts.forEach(f => { if (fva[f] !== undefined) fva[f] += brk.vaTotal / parts.length; });
    });
    return fva;
  }, [breakers]);

  const desbalancePct = useMemo(() =>
    calcularDesbalanceUVIE(
      fasesVAActual.A,
      fasesVAActual.B,
      fasesVAActual.C,
      acometidaMedidor?.id,
      acometidaMedidor?.fasesDisponibles
    ),
    [fasesVAActual, acometidaMedidor]
  );

  const aparatosAsignados = useMemo(() => new Set(breakers.flatMap(b => b.aparatos)), [breakers]);
  const aparatosSinAsignar = useMemo(() => aparatosMedidor.filter(ap => !aparatosAsignados.has(ap.id)), [aparatosMedidor, aparatosAsignados]);
  const aparatoBreakerMap = useMemo(() => {
    const map = {};
    breakers.forEach(brk => brk.aparatos.forEach(id => { map[id] = brk; }));
    return map;
  }, [breakers]);

  const itm = useMemo(() => {
    const in_ = acometidaMedidor?.id === 'trifasico' ? totalVA / (220 * 1.732)
      : acometidaMedidor?.id === 'bifasico' ? totalVA / 220 : totalVA / 127;
    return { breaker: seleccionarProteccion(in_ * 1.25) };
  }, [totalVA, acometidaMedidor]);

  const syncVersion = useRef(0);
  const changeDistribution = useCallback(nextOrUpdate => {
    const next = typeof nextOrUpdate === 'function' ? nextOrUpdate(breakers) : nextOrUpdate;
    setBreakers(next);
    setApplySuccess(false);
    const check = evaluarDistribucion(next, aparatosMedidor, acometidaMedidor?.fasesDisponibles || ['A']);
    if (check.errores.length || typeof onApplyBalancing !== 'function') return;

    const signature = items => JSON.stringify(items.filter(b=>b.aparatos.length).map(b=>[b.id,[...b.aparatos].sort(),b.fase,b.capacidad]));
    if (signature(next) === signature(projectBreakers)) return;

    const version = ++syncVersion.current;
    setApplying(true);
    Promise.resolve(onApplyBalancing(check.breakers)).then(saved => {
      if (version !== syncVersion.current) return;
      setApplyError('');
      setApplySuccess(saved?.remote === false
        ? `Cambios en ${medidor.nombre} reflejados en todos los módulos.`
        : `Cambios de ${medidor.nombre} sincronizados con Cuadro de cargas y Diagrama unifilar.`);
    }).catch(error => {
      if (version === syncVersion.current) setApplyError(`No se pudo guardar: ${error.message}`);
    }).finally(() => { if (version === syncVersion.current) setApplying(false); });
  }, [breakers, aparatosMedidor, acometidaMedidor, onApplyBalancing, projectBreakers, medidor.nombre]);

  const handleExecuteBalanceMath = useCallback(() => {
    if (onBalancearMedidor) {
      onBalancearMedidor(medidor.id);
      return;
    }
    const result = calcularDistribucion(
      aparatosMedidor,
      acometidaMedidor?.id || 'monofasico',
      acometidaMedidor?.fasesDisponibles
    );
    if (result.errores.length) {
      setApplyError(`No se aplicó el balance: ${result.errores.join(' ')}`);
      return;
    }
    setMathInfo(result.busquedaCompleta ? 'Asignación óptima lograda para este medidor.' : 'Mejor balance encontrado.');
    changeDistribution(result.breakers);
    setHasSolution(true);
    setLastBalanceMode('math');
  }, [aparatosMedidor, acometidaMedidor, changeDistribution, onBalancearMedidor, medidor.id]);

  const handleMoveToBreaker = useCallback((aparatoId, targetId) => {
    const result = moverAparato(breakers, aparatoId, targetId, aparatosMedidor);
    if(result.error) { setApplyError(result.error); return; }
    changeDistribution(result.breakers); setSelectedLoad(null); setApplyError('');
  }, [aparatosMedidor, breakers, changeDistribution]);

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

  const apsConBreaker = aparatosMedidor.map(ap => ({ ...ap, _brk: aparatoBreakerMap[ap.id] || null }));
  const apsIzq = apsConBreaker.filter((_, i) => i % 2 === 0);
  const apsDer = apsConBreaker.filter((_, i) => i % 2 !== 0);
  const dsColor = desbalancePct <= 3 ? 'text-emerald-400' : desbalancePct <= 5 ? 'text-amber-400' : 'text-rose-400 animate-pulse';

  return (
    <div className="glass-panel rounded-3xl p-5 border border-slate-800/80 shadow-2xl space-y-4 relative overflow-hidden bg-slate-950/40">
      {/* Encabezado Principal del Módulo de Tablero de este Medidor */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
            <Zap size={24} className="text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/40">
                MEDIDOR {medidor.numero}
              </span>
              <h3 className="text-base font-bold text-white font-display">
                Tablero de Distribución · {medidor.nombre}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold">
                {acometidaMedidor?.tipo || '220V Bifásico'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans flex items-center gap-2 flex-wrap">
              <span>{aparatosMedidor.length} cargas</span>
              <span>·</span>
              <span className="font-mono">{Math.round(totalWatts).toLocaleString()} W ({Math.round(totalVA).toLocaleString()} VA)</span>
              <span>·</span>
              <span>ITM Principal: <strong className="text-teal-400 font-mono">{itm.breaker}A</strong></span>
              <span>·</span>
              <span className={`font-mono font-bold ${dsColor}`}>
                Desbalance: {desbalancePct.toFixed(2)}% {desbalancePct <= 5 ? '✅ (NOM ≤ 5%)' : '⚠️ (> 5%)'}
              </span>
            </p>
          </div>
        </div>

        {/* Barra de Acciones Específica para este Medidor */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {/* BOTÓN DE BALANCE MATEMÁTICO ESPECÍFICO */}
          <button 
            onClick={handleExecuteBalanceMath} 
            className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer active:scale-95"
            title={`Equilibrar matemáticamente las fases para ${medidor.nombre} garantizando <= 5% desbalance`}
          >
            <RefreshCw size={13} /> 
            <span>⚡ Balancear Matemático</span>
          </button>

          <button 
            onClick={() => setViewFormat(v => v === 'logical' ? 'physical' : 'logical')}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders size={13} className="text-teal-400" />
            {viewFormat === 'logical' ? 'Ver Gabinete Físico' : 'Ver Vista Lógica'}
          </button>

          {viewFormat === 'physical' && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">Gabinete:</span>
              <select 
                value={selectedPanelSize} 
                onChange={(e) => setSelectedPanelSize(parseInt(e.target.value))}
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-bold font-mono text-teal-400 focus:outline-none cursor-pointer"
              >
                <option value={8}>8 espacios</option>
                <option value={12}>12 espacios</option>
                <option value={24}>24 espacios</option>
              </select>
            </div>
          )}

          <button 
            onClick={() => setShowStatsPanel(v => !v)} 
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${showStatsPanel ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <BarChart3 size={13} /> Estadísticas
          </button>

          <button 
            onClick={handleAddBreaker} 
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} /> Pastilla
          </button>
        </div>
      </div>

      {applyError && <p role="alert" className="cabinet-warning">{applyError}</p>}
      {applySuccess && <p role="status" className="cabinet-note">{applySuccess}</p>}
      {mathInfo && <p role="status" className="cabinet-note">{mathInfo}</p>}

      {/* Panel Desplegable de Estadísticas de Fase del Medidor */}
      {showStatsPanel && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 bg-slate-900/60 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
            {['A','B','C'].filter(f => fasesDisponibles.includes(f)).map(f => {
              const fc  = getFaseColor(f);
              const vaF = fasesVAActual[f] || 0;
              const pct = totalVA > 0 ? (vaF / totalVA * 100) : 0;
              return (
                <div key={f} className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${fc.text}`}>Fase {f}</span>
                    <span className="text-[10px] font-mono text-slate-400">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-850 rounded-full mb-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${fc.bg} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs font-mono text-slate-200">{Math.round(vaF).toLocaleString()} VA</p>
                </div>
              );
            })}
            <div className={`bg-slate-950/80 rounded-xl p-3 border ${desbalancePct <= 3 ? 'border-emerald-800/40' : desbalancePct <= 5 ? 'border-amber-800/40' : 'border-rose-800/40'}`}>
              <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Desbalance UVIE</p>
              <p className={`text-xl font-black font-mono ${dsColor}`}>{desbalancePct.toFixed(2)}%</p>
              <p className="text-[9px] text-slate-400 mt-1 font-sans">{desbalancePct <= 3 ? '✅ Óptimo' : desbalancePct <= 5 ? '⚠️ Aceptable (≤5%)' : '❌ Rechazo UVIE'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Visualización del Tablero: Físico Real interactivo o Vista Lógica */}
      {viewFormat === 'physical' ? (
        <div className="animate-fadeIn">
          <GabineteTablero
            breakers={breakers}
            circuitos={loadCircuits}
            alimentador={computedElectricalSystem?.alimPrincipal}
            desbalancePct={desbalancePct}
            selectedId={highlightBrkId}
            onSelect={id => { if (selectedLoad && id) handleMoveToBreaker(selectedLoad, id); else setHighlightBrkId(id); }}
            selectedLoad={selectedLoad} 
            onSelectLoad={setSelectedLoad} 
            onDragStart={handleDragStart} 
            onDrop={handleDropOnBreaker} 
            onMoveLoad={handleMoveToBreaker}
            selectedPanelSize={selectedPanelSize} 
            acometida={acometidaMedidor} 
            onUpdateBreakers={changeDistribution}
          />
        </div>
      ) : (
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
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cargas · Grupo 1</span>
              <span className="text-[9px] text-slate-600 ml-auto font-mono">{apsIzq.length}</span>
            </div>
            {apsIzq.length === 0
              ? <p className="text-center text-[10px] text-slate-700 py-8 border border-dashed border-slate-800 rounded-xl">Sin cargas</p>
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
                    <p className="text-[8px] text-teal-400 font-mono uppercase font-bold tracking-widest">Centro de Carga · Medidor {medidor.numero}</p>
                    <h4 className="text-sm font-bold text-white font-display">Interruptores Termomagnéticos · {medidor.nombre}</h4>
                  </div>
                  <div className="text-right text-[8px] font-mono text-slate-500">
                    <p>NOM-001-SEDE</p>
                    <p>ITM: <span className="text-teal-400 font-bold">{itm.breaker}A</span></p>
                  </div>
                </div>
              </div>

              {breakers.length > 0 && (
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[580px] overflow-y-auto">
                  {breakers.map(brk => (
                    <div key={brk.id} onMouseEnter={() => setHighlightBrkId(brk.id)} onMouseLeave={() => setHighlightBrkId(null)}>
                      <BreakerCard breaker={brk} aparatos={aparatosMedidor} acometida={acometidaMedidor}
                        onChangePolos={(id,p)=>changeDistribution(breakers.map(b=>b.id===id?{...b,polos:p,fase:fasesDisponibles.slice(0,p).join('-')}:b))} 
                        onDelete={handleDeleteBreaker} onChangeCapacidad={handleChangeCapacidad}
                        onCycleFase={handleCycleFase} highlighted={highlightBrkId === brk.id}
                        onDragStart={handleDragStart} onDrop={handleDropOnBreaker} />
                    </div>
                  ))}
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
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Grupo 2 · Cargas</span>
              <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
            </div>
            {apsDer.length === 0
              ? <p className="text-center text-[10px] text-slate-700 py-8 border border-dashed border-slate-800 rounded-xl">Sin cargas</p>
              : apsDer.map(ap => (
                  <TarjetaAparato key={ap.id} aparato={ap} breaker={ap._brk} breakers={breakers}
                    onMoveToBreaker={handleMoveToBreaker} isHighlighted={ap._brk?.id === highlightBrkId}
                    onDragStart={handleDragStart} />
                ))
            }
          </div>
        </div>
      )}

      {/* Indicaciones normativas y aparatos sin asignar para este medidor */}
      {aparatosSinAsignar.length > 0 && (
        <div className="p-3 rounded-xl border border-amber-900/40 bg-amber-500/10 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-200 font-sans">
            Hay <strong>{aparatosSinAsignar.length} carga(s)</strong> de {medidor.nombre} sin asignar a ranuras físicas. Haz clic en "⚡ Balancear Matemático" para asignarlas y optimizar el equilibrio de fases.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * COMPONENTE PRINCIPAL: BALANCEADOR DE TABLERO MULTI-MEDIDOR
 */
export default function BalanceadorTablero({ 
  aparatos = [], 
  onApplyBalancing, 
  acometida, 
  proyectoId, 
  computedElectricalSystem,
  medidores = [],
  medidoresData = {},
  activeMedidorId,
  onSelectMedidor,
  onBalancearMedidor
}) {
  const listaMedidores = useMemo(() => (
    Array.isArray(medidores) && medidores.length > 0
      ? medidores
      : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }]
  ), [medidores]);

  // Modo de visualización: 'stacked' (ver los 3 tableros apilados simultáneamente) o 'tabs' (un tablero a la vez)
  const [displayMode, setDisplayMode] = useState('stacked'); // 'stacked' | 'tabs'
  const [selectedMedId, setSelectedMedId] = useState(activeMedidorId || listaMedidores[0].id);

  useEffect(() => {
    if (activeMedidorId) {
      setSelectedMedId(activeMedidorId);
    }
  }, [activeMedidorId]);

  return (
    <div className="space-y-6">
      {/* Selector de Modo de Visualización y Selector de Medidor */}
      {listaMedidores.length > 1 && (
        <div className="glass-panel p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Visualización de Tableros ({listaMedidores.length} Medidores Registrados):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle entre Ver Todos Apilados o Pestañas Individuales */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDisplayMode('stacked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayMode === 'stacked'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>Ver Todos los Tableros ({listaMedidores.length} Módulos)</span>
              </button>

              <button
                onClick={() => setDisplayMode('tabs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayMode === 'tabs'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders size={13} />
                <span>Pestaña por Medidor</span>
              </button>
            </div>

            {/* Selector de pestaña cuando displayMode === 'tabs' */}
            {displayMode === 'tabs' && (
              <div className="flex flex-wrap items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
                {listaMedidores.map(med => {
                  const count = aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === med.id).length;
                  return (
                    <button
                      key={med.id}
                      onClick={() => {
                        setSelectedMedId(med.id);
                        if (onSelectMedidor) onSelectMedidor(med.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedMedId === med.id
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{med.nombre || `Medidor ${med.numero}`}</span>
                      <span className="text-[10px] opacity-80 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Renderizado de los Módulos de Tablero */}
      {displayMode === 'stacked' ? (
        // RENDERIZAR TODOS LOS MÓDULOS DE TABLERO SIMULTÁNEAMENTE (3 MÓDULOS, UNO POR CADA MEDIDOR)
        <div className="space-y-8 animate-fadeIn">
          {listaMedidores.map((med, index) => {
            const apsMed = aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === med.id);
            const acomMed = (medidoresData && medidoresData[med.id]?.acometida) || acometida;

            return (
              <SingleMedidorTableroModule
                key={med.id}
                medidor={med}
                aparatosMedidor={apsMed}
                allAparatos={aparatos}
                acometidaMedidor={acomMed}
                proyectoId={proyectoId}
                computedElectricalSystem={computedElectricalSystem}
                onApplyBalancing={(breakersMed) => onApplyBalancing && onApplyBalancing(breakersMed, med.id)}
                onBalancearMedidor={onBalancearMedidor}
              />
            );
          })}
        </div>
      ) : (
        // RENDERIZAR ÚNICAMENTE EL MEDIDOR SELECCIONADO EN PESTAÑA
        <div className="animate-fadeIn">
          {(() => {
            const currentMed = listaMedidores.find(m => m.id === selectedMedId) || listaMedidores[0];
            const apsMed = aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === currentMed.id);
            const acomMed = (medidoresData && medidoresData[currentMed.id]?.acometida) || acometida;

            return (
              <SingleMedidorTableroModule
                key={currentMed.id}
                medidor={currentMed}
                aparatosMedidor={apsMed}
                allAparatos={aparatos}
                acometidaMedidor={acomMed}
                proyectoId={proyectoId}
                computedElectricalSystem={computedElectricalSystem}
                onApplyBalancing={(breakersMed) => onApplyBalancing && onApplyBalancing(breakersMed, currentMed.id)}
                onBalancearMedidor={onBalancearMedidor}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}
