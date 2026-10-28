import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, Activity, Gauge, Plus, Minus, Edit2, Check, ArrowRightLeft } from 'lucide-react';
import { calcularCorriente } from '../utils/electricalCalculations';

export default function AcometidaCard({ 
  medidores = [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }],
  medidoresData = {},
  totalWattsProyecto = 0,
  totalVAProyecto = 0,
  fasesUnit = 'VA',
  onCycleFasesUnit,
  onSetCantidadMedidores,
  onAddMedidor,
  onRemoveMedidor,
  onUpdateMedidor,
  onToggleForzarTrifasicoMedidor,
  // Backward compatibility props
  tipoSystem,
  fasesLoad,
  fasesVA,
  desbalance
}) {
  const [editingMedidorId, setEditingMedidorId] = useState(null);
  const [tempNombre, setTempNombre] = useState('');

  const handleStartRename = (med) => {
    setEditingMedidorId(med.id);
    setTempNombre(med.nombre);
  };

  const handleSaveRename = (medId) => {
    if (tempNombre.trim() && onUpdateMedidor) {
      onUpdateMedidor(medId, { nombre: tempNombre.trim() });
    }
    setEditingMedidorId(null);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. MÓDULO SUPERIOR: POTENCIA TOTAL DEL PROYECTO & SELECTOR */}
      {/* ======================================================== */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.08),transparent_50%)] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Parámetros Generales de la Propiedad
            </span>
            <h2 className="text-2xl font-bold font-display text-white mt-1 flex items-center gap-2">
              <Zap className="text-amber-400 fill-amber-400/20 animate-pulse" size={24} />
              Potencia Total del Proyecto
            </h2>
          </div>

          {/* Selector de Cantidad de Medidores */}
          <div className="flex items-center flex-wrap gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 px-2 text-slate-300 font-semibold text-xs">
              <Gauge size={16} className="text-teal-400" />
              <span>Medidores CFE:</span>
            </div>

            <select
              value={medidores.length}
              onChange={(e) => onSetCantidadMedidores && onSetCantidadMedidores(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-white bg-slate-900 border-slate-700"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num} className="bg-slate-900 text-white">
                  {num} {num === 1 ? 'Medidor CFE' : 'Medidores CFE'}
                </option>
              ))}
            </select>

            <button
              onClick={() => onAddMedidor && onAddMedidor()}
              className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold transition-all flex items-center gap-1"
              title="Agregar otro medidor"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Agregar</span>
            </button>

            {medidores.length > 1 && (
              <button
                onClick={() => onRemoveMedidor && onRemoveMedidor(medidores[medidores.length - 1].id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                title="Quitar último medidor"
              >
                <Minus size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Métricas Globales del Proyecto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Potencia Activa Total del Proyecto</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold font-display text-white">
                {totalWattsProyecto.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
              </span>
              <span className="text-sm font-semibold text-emerald-400">W</span>
              <span className="text-xs text-slate-500 ml-1 font-mono">
                ({(totalWattsProyecto / 1000).toFixed(2)} kW)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Suma de todas las cargas registradas en la residencia
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Potencia Aparente Total del Proyecto</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold font-display text-slate-200">
                {totalVAProyecto.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
              </span>
              <span className="text-sm font-semibold text-cyan-400">VA</span>
              <span className="text-xs text-slate-500 ml-1 font-mono">
                ({(totalVAProyecto / 1000).toFixed(2)} kVA)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Capacidad total requerida de suministro eléctrico
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Instalaciones / Medidores</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold font-display text-teal-400">
                  {medidores.length}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {medidores.length === 1 ? 'Instalación Eléctrica' : 'Instalaciones Separadas'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Cada medidor cuenta con su propio cálculo de fases y recibo CFE independiente
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MÓDULOS DE DISTRIBUCIÓN DE CARGA POR FASE POR MEDIDOR */}
      {/*    (Se apilan uno debajo del otro, etiquetados 1, 2, 3...)*/}
      {/* ======================================================== */}
      <div className="space-y-4">
        {medidores.map((med, idx) => {
          const data = medidoresData[med.id] || {
            totalWatts: 0,
            totalVA: 0,
            acometida: { id: 'monofasico', tipo: 'Monofásico 1F-1N', descripcion: '127V', fasesDisponibles: ['A'] },
            fasesLoad: { A: 0, B: 0, C: 0 },
            fasesVA: { A: 0, B: 0, C: 0 },
            desbalanceUVIE: 0,
            forzarTrifasico: med.forzarTrifasico || false
          };

          const acometida = data.acometida;
          const fasesLoadMed = data.fasesLoad;
          const fasesVAMed = data.fasesVA;
          const desbalanceMed = data.desbalanceUVIE;
          const forzar3F = med.forzarTrifasico || false;

          // Clases de color para el desbalance
          let desbalanceColorClass = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
          let desbalanceLabel = 'Balanceado (Óptimo ≤5%)';

          if (desbalanceMed > 5 && desbalanceMed <= 10) {
            desbalanceColorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
            desbalanceLabel = 'Desbalance Moderado (>5%)';
          } else if (desbalanceMed > 10) {
            desbalanceColorClass = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
            desbalanceLabel = 'Crítico - Excede NOM-001-SEDE';
          }

          // Badge de tipo de acometida
          let systemBadgeBg = 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
          if (acometida.id === 'bifasico') {
            systemBadgeBg = 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
          } else if (acometida.id === 'trifasico') {
            systemBadgeBg = 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30';
          }

          return (
            <div 
              key={med.id} 
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 relative overflow-hidden transition-all duration-300"
            >
              {/* Header del Medidor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold font-mono text-sm">
                    {med.numero || (idx + 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {editingMedidorId === med.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tempNombre}
                            onChange={(e) => setTempNombre(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(med.id)}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-teal-500 text-xs font-bold text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(med.id)}
                            className="p-1 rounded bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                          >
                            <Check size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>Medidor {med.numero || (idx + 1)}:</span>
                            <span className="text-teal-400">{med.nombre}</span>
                          </h3>
                          <button
                            onClick={() => handleStartRename(med)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                            title="Renombrar Medidor"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Potencia Activa: <strong className="text-slate-200">{data.totalWatts.toLocaleString()} W</strong></span>
                      <span>·</span>
                      <span>Potencia Aparente: <strong className="text-slate-200">{data.totalVA.toLocaleString()} VA</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Badge de Acometida */}
                  <div className={`px-3 py-1 rounded-lg border bg-gradient-to-r ${systemBadgeBg} font-semibold text-xs flex items-center gap-1.5`}>
                    <Activity size={13} />
                    <span>{acometida.tipo}</span>
                  </div>

                  {/* Switcher de Unidad */}
                  {onCycleFasesUnit && (
                    <button
                      onClick={onCycleFasesUnit}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1"
                      title="Cambiar unidad de visualización (VA / Watts / Amperes)"
                    >
                      <ArrowRightLeft size={12} className="text-teal-400" />
                      <span>{fasesUnit}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Fases del Medidor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                    <Activity size={13} className="text-cyan-400" />
                    Distribución de Carga por Fase · Medidor {med.numero || (idx + 1)}
                  </h4>
                  {acometida.fasesDisponibles.length > 1 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${desbalanceColorClass}`}>
                      Desbalance: {desbalanceMed.toFixed(2)}% ({desbalanceLabel})
                    </span>
                  )}
                </div>

                <div className={`grid grid-cols-1 ${acometida.fasesDisponibles.length === 1 ? 'md:grid-cols-1' : acometida.fasesDisponibles.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3`}>
                  {['A', 'B', 'C'].map((fase) => {
                    const isAvailable = acometida.fasesDisponibles.includes(fase);
                    if (!isAvailable && acometida.id !== 'bifasico' && fase === 'C') {
                      if (acometida.id === 'monofasico') return null;
                    }

                    const loadW = fasesLoadMed[fase] || 0;
                    const loadVA = fasesVAMed[fase] || 0;
                    const corriente = calcularCorriente(loadVA);

                    let displayVal = `${Math.round(loadVA).toLocaleString('es-MX')} VA`;
                    if (fasesUnit === 'W') {
                      displayVal = `${Math.round(loadW).toLocaleString('es-MX')} W`;
                    } else if (fasesUnit === 'A') {
                      displayVal = `${corriente.toFixed(2)} A`;
                    }

                    const maxFaseWatts = 5000;
                    const pct = Math.min((loadW / maxFaseWatts) * 100, 100);

                    const canToggle3F = fase === 'C' && acometida.id === 'bifasico';

                    return (
                      <div
                        key={fase}
                        onClick={() => {
                          if (canToggle3F && onToggleForzarTrifasicoMedidor) {
                            onToggleForzarTrifasicoMedidor(med.id);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all duration-300 ${
                          isAvailable
                            ? 'bg-slate-900/40 border-slate-800'
                            : 'bg-slate-950/20 border-slate-900/50 opacity-40 select-none'
                        } ${canToggle3F ? 'cursor-pointer hover:border-blue-500/80 hover:bg-slate-900/60' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              !isAvailable 
                                ? 'bg-slate-800 text-slate-600' 
                                : fase === 'A' 
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                  : fase === 'B' 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {fase}
                            </span>
                            <span className="text-xs font-bold text-slate-200">Fase {fase}</span>
                          </div>

                          <span className="text-xs font-bold font-mono text-white">
                            {isAvailable ? displayVal : 'Inactiva'}
                          </span>
                        </div>

                        {isAvailable ? (
                          <div className="space-y-1.5">
                            {/* Barra de progreso */}
                            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  fase === 'A' ? 'bg-red-500' : fase === 'B' ? 'bg-amber-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/40">
                              <span>W: <strong className="text-slate-200 font-mono">{loadW.toLocaleString()} W</strong></span>
                              <span>Corriente: <strong className={`font-mono ${corriente > 30 ? 'text-rose-400' : 'text-slate-300'}`}>{corriente.toFixed(2)} A</strong></span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-center text-[10px] text-slate-500 font-medium">
                            {canToggle3F ? 'Clic para forzar modo 3F en este medidor' : 'Sin asignación'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
