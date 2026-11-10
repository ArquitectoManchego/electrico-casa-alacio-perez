import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Gauge, 
  Plus, 
  Minus, 
  Edit2, 
  Check, 
  ArrowRightLeft, 
  Trash2, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { calcularCorriente } from '../utils/electricalCalculations';

export default function AcometidaCard({ 
  medidores = [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }],
  medidoresData = {},
  aparatos = [],
  totalWattsProyecto = 0,
  totalVAProyecto = 0,
  fasesUnit = 'VA',
  onCycleFasesUnit,
  onSetCantidadMedidores,
  onAddMedidor,
  onRemoveMedidor,
  onUpdateMedidor,
  onToggleForzarTrifasicoMedidor,
  onToggleFaseMedidor,
  // Backward compatibility props
  tipoSystem,
  fasesLoad,
  fasesVA,
  desbalance
}) {
  const [editingMedidorId, setEditingMedidorId] = useState(null);
  const [tempNombre, setTempNombre] = useState('');

  // Estado del modal para eliminar un medidor seleccionado
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [medidorAEliminarId, setMedidorAEliminarId] = useState(null);
  const [accionAparatos, setAccionAparatos] = useState('mover'); // 'mover' | 'borrar'
  const [medidorDestinoId, setMedidorDestinoId] = useState('');

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

  const handleOpenDeleteModal = (targetMedId = null) => {
    if (medidores.length <= 1) return;
    const idToDelete = targetMedId || medidores[medidores.length - 1]?.id;
    setMedidorAEliminarId(idToDelete);
    const remaining = medidores.filter(m => m.id !== idToDelete);
    setMedidorDestinoId(remaining[0]?.id || '');
    setAccionAparatos('mover');
    setModalEliminarOpen(true);
  };

  const handleSelectMedidorAEliminar = (newMedId) => {
    setMedidorAEliminarId(newMedId);
    const remaining = medidores.filter(m => m.id !== newMedId);
    if (!remaining.some(m => m.id === medidorDestinoId)) {
      setMedidorDestinoId(remaining[0]?.id || '');
    }
  };

  const handleConfirmarEliminar = () => {
    if (!medidorAEliminarId || !onRemoveMedidor) return;
    onRemoveMedidor(medidorAEliminarId, {
      accionAparatos,
      targetMedidorId: medidorDestinoId
    });
    setModalEliminarOpen(false);
    setMedidorAEliminarId(null);
  };

  // Datos calculados para el modal de eliminación
  const medidorAEliminar = medidores.find(m => m.id === medidorAEliminarId);
  const otrosMedidores = medidores.filter(m => m.id !== medidorAEliminarId);
  const aparatosDelMedidor = medidorAEliminarId
    ? (medidoresData[medidorAEliminarId]?.aparatos || aparatos.filter(ap => (ap.medidorId || medidores[0]?.id) === medidorAEliminarId))
    : [];
  const cantidadAparatos = aparatosDelMedidor.length;
  const wattsAparatos = medidoresData[medidorAEliminarId]?.totalWatts ?? 
    aparatosDelMedidor.reduce((sum, ap) => sum + (Number(ap.watts) || 0) * (Number(ap.cantidad) || 1), 0);
  const vaAparatos = medidoresData[medidorAEliminarId]?.totalVA ??
    aparatosDelMedidor.reduce((sum, ap) => sum + (Number(ap.va) || Number(ap.watts) || 0) * (Number(ap.cantidad) || 1), 0);

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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
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
                onClick={() => handleOpenDeleteModal()}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                title="Seleccionar y eliminar un medidor..."
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Eliminar</span>
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
                          {medidores.length > 1 && (
                            <button
                              onClick={() => handleOpenDeleteModal(med.id)}
                              className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors p-1 rounded"
                              title={`Eliminar ${med.nombre}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                    <Activity size={13} className="text-cyan-400" />
                    Distribución de Carga por Fase · Medidor {med.numero || (idx + 1)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-sans italic">
                      (Clic en las fases para activar/desactivar)
                    </span>
                    {acometida.fasesDisponibles.length > 1 && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${desbalanceColorClass}`}>
                        Desbalance: {desbalanceMed.toFixed(2)}% ({desbalanceLabel})
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['A', 'B', 'C'].map((fase) => {
                    const isAvailable = acometida.fasesDisponibles.includes(fase);
                    const loadW = isAvailable ? (fasesLoadMed[fase] || 0) : 0;
                    const loadVA = isAvailable ? (fasesVAMed[fase] || 0) : 0;
                    const corriente = isAvailable
                      ? (data.fasesAmps?.[fase] !== undefined ? data.fasesAmps[fase] : calcularCorriente(loadVA))
                      : 0;

                    let displayVal = `${Math.round(loadVA).toLocaleString('es-MX')} VA`;
                    if (fasesUnit === 'W') {
                      displayVal = `${Math.round(loadW).toLocaleString('es-MX')} W`;
                    } else if (fasesUnit === 'A') {
                      displayVal = `${corriente.toFixed(2)} A`;
                    }

                    const maxFaseWatts = 5000;
                    const pct = Math.min((loadW / maxFaseWatts) * 100, 100);

                    return (
                      <div
                        key={fase}
                        onClick={() => {
                          if (onToggleFaseMedidor) {
                            onToggleFaseMedidor(med.id, fase);
                          } else if (fase === 'C' && onToggleForzarTrifasicoMedidor) {
                            onToggleForzarTrifasicoMedidor(med.id);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none group relative ${
                          isAvailable
                            ? 'bg-slate-900/60 border-slate-750 hover:border-teal-400/80 hover:shadow-lg hover:shadow-teal-500/10'
                            : 'bg-slate-950/30 border-dashed border-slate-800 opacity-55 hover:opacity-100 hover:border-slate-600 hover:bg-slate-900/40'
                        }`}
                        title={isAvailable ? `Clic para desactivar Fase ${fase}` : `Clic para activar Fase ${fase}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-110 ${
                              !isAvailable 
                                ? 'bg-slate-800 text-slate-500 border border-slate-700/60' 
                                : fase === 'A' 
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-xs shadow-red-500/20' 
                                  : fase === 'B' 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs shadow-amber-500/20'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-xs shadow-blue-500/20'
                            }`}>
                              {fase}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-200">Fase {fase}</span>
                              <span className={`block text-[9px] font-mono leading-none ${isAvailable ? 'text-teal-400' : 'text-slate-500'}`}>
                                {isAvailable ? '● Activa' : '○ Inactiva'}
                              </span>
                            </div>
                          </div>

                          <span className={`text-xs font-bold font-mono ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
                            {isAvailable ? displayVal : '0 VA'}
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
                            <div className="text-[9px] text-slate-500 text-center pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              Clic para desactivar
                            </div>
                          </div>
                        ) : (
                          <div className="py-2.5 text-center text-[10px] text-teal-400/80 font-bold flex items-center justify-center gap-1 group-hover:text-teal-300">
                            <span>+ Clic para activar Fase {fase}</span>
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

      {/* ======================================================== */}
      {/* 3. MODAL PARA SELECCIONAR Y ELIMINAR MEDIDOR CFE         */}
      {/* ======================================================== */}
      {modalEliminarOpen && medidorAEliminar && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalEliminarOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Eliminar Medidor CFE
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona el medidor que deseas remover del proyecto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEliminarOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Cerrar ventana"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Selector del Medidor a Eliminar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Medidor a eliminar:
                </label>
                <select
                  value={medidorAEliminarId}
                  onChange={(e) => handleSelectMedidorAEliminar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-sm font-semibold text-white focus:outline-none focus:border-rose-500"
                >
                  {medidores.map((m) => {
                    const dataM = medidoresData[m.id];
                    const numAps = (dataM?.aparatos || aparatos.filter(ap => (ap.medidorId || medidores[0]?.id) === m.id)).length;
                    const wM = dataM?.totalWatts || 0;
                    return (
                      <option key={m.id} value={m.id}>
                        Medidor {m.numero}: {m.nombre} ({numAps} aparatos · {wM.toLocaleString()} W)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Estado de Cargas del Medidor Seleccionado */}
              {cantidadAparatos > 0 ? (
                <div className="space-y-4">
                  {/* Alerta informativa de aparatos asignados */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-xs font-bold text-amber-300">
                          Este medidor tiene {cantidadAparatos} {cantidadAparatos === 1 ? 'aparato asignado' : 'aparatos asignados'}
                        </h4>
                        <p className="text-[11px] text-amber-200/80">
                          Carga total activa: <strong className="text-white font-mono">{wattsAparatos.toLocaleString()} W</strong> ({vaAparatos.toLocaleString()} VA).
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 pt-1 border-t border-amber-500/20 font-medium">
                      ¿Qué deseas hacer con estos aparatos antes de retirar el medidor?
                    </p>
                  </div>

                  {/* Opciones Interactivas */}
                  <div className="space-y-3">
                    {/* Opción 1: Mover a otro medidor (Recomendado) */}
                    <div 
                      onClick={() => setAccionAparatos('mover')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        accionAparatos === 'mover'
                          ? 'bg-teal-500/10 border-teal-500/50 shadow-lg shadow-teal-500/5'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="accionAparatos"
                          checked={accionAparatos === 'mover'}
                          onChange={() => setAccionAparatos('mover')}
                          className="mt-1 text-teal-500 focus:ring-teal-400 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              Mover los aparatos a otro medidor
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold">
                              Recomendado
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Conserva los {cantidadAparatos} equipos y reubícalos en otro circuito de medición sin perder datos.
                          </p>

                          {/* Selector de medidor destino si está seleccionada la opción 'mover' */}
                          {accionAparatos === 'mover' && (
                            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 animate-fadeIn">
                              <label className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                                <ArrowRight size={12} />
                                Selecciona a cuál medidor se van a mover:
                              </label>
                              <select
                                value={medidorDestinoId}
                                onChange={(e) => setMedidorDestinoId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-teal-500/50 text-xs font-bold text-white focus:outline-none focus:border-teal-400"
                              >
                                {otrosMedidores.map((m) => {
                                  const acom = medidoresData[m.id]?.acometida?.tipo || 'CFE';
                                  return (
                                    <option key={m.id} value={m.id}>
                                      Medidor {m.numero}: {m.nombre} ({acom})
                                    </option>
                                  );
                                })}
                              </select>
                              <p className="text-[10px] text-slate-400 italic">
                                * Las fases y ranuras se adaptarán automáticamente a la acometida del medidor de destino.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Opción 2: Borrar todos los aparatos */}
                    <div 
                      onClick={() => setAccionAparatos('borrar')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        accionAparatos === 'borrar'
                          ? 'bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/5'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="accionAparatos"
                          checked={accionAparatos === 'borrar'}
                          onChange={() => setAccionAparatos('borrar')}
                          className="mt-1 text-rose-500 focus:ring-rose-400 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-300">
                              Borrar definitivamente todos los aparatos asignados
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                              Irreversible
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Se eliminarán por completo los {cantidadAparatos} aparatos del proyecto y ya no aparecerán en ningún cuadro de cargas ni cálculo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Medidor sin aparatos */
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">
                      Medidor sin aparatos asignados
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Este medidor actualmente no tiene ninguna carga asignada. Puedes eliminarlo de forma segura e inmediata.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalEliminarOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 ${
                  accionAparatos === 'borrar' && cantidadAparatos > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-rose-600/20'
                }`}
              >
                <Trash2 size={14} />
                <span>
                  {cantidadAparatos === 0
                    ? 'Eliminar Medidor'
                    : accionAparatos === 'mover'
                      ? 'Mover aparatos y eliminar medidor'
                      : 'Borrar aparatos y eliminar medidor'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
