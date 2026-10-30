import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, Flame, Clock, Zap, ArrowRight, CheckCircle2, Info } from 'lucide-react';

export default function TablaProcesosRecetas({
  procesos = [],
  cantidades = {},
  lotes = {},
  onChangeCantidad,
  onChangeLote,
  resultadosProcesos = [],
  diasLaborales = 26,
  mapaEquipos = {}
}) {
  const [recetaExpandidaId, setRecetaExpandidaId] = useState(null);

  const toggleReceta = (id) => {
    setRecetaExpandidaId(prev => (prev === id ? null : id));
  };

  const getResProceso = (id) => {
    return resultadosProcesos.find(r => r.procesoId === id) || {
      kwhMensual: 0,
      whPorUnidadLote: 0,
      whPorUnidadUnitaria: 0,
      ahorroLotePct: 0
    };
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display flex items-center gap-2">
            <Layers size={16} className="text-teal-400" />
            Catálogo de Procesos Productivos y Recetas de Consumo
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Ajusta el volumen mensual y el tamaño de lote (producción en serie vs. pieza suelta) para ver la reducción inmediata de precalentamientos y energía.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          Base: {diasLaborales} días laborales/mes
        </span>
      </div>

      <div className="space-y-3 pt-2">
        {procesos.map((proceso) => {
          const res = getResProceso(proceso.id);
          const cantActual = cantidades[proceso.id] !== undefined ? cantidades[proceso.id] : 0;
          const loteActual = lotes[proceso.id] !== undefined ? lotes[proceso.id] : 1;
          const cantDiaria = diasLaborales > 0 ? (cantActual / diasLaborales).toFixed(1) : 0;
          const estaExpandido = recetaExpandidaId === proceso.id;

          return (
            <div 
              key={proceso.id}
              className="bg-slate-900/40 border border-slate-850 rounded-xl overflow-hidden transition-all"
            >
              {/* Fila Principal */}
              <div className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Nombre y Categoría */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {proceso.categoria}
                    </span>
                    {proceso.cabezasSimultaneas > 1 && (
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {proceso.cabezasSimultaneas} Cabezas Simultáneas
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white font-sans mt-1">
                    {proceso.nombre}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-snug">
                    {proceso.descripcionReceta}
                  </p>
                </div>

                {/* Controles de Cantidad Mensual y Tamaño de Lote */}
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Selector de Lote */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Tamaño de Lote (L):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={loteActual}
                        onChange={(e) => onChangeLote(proceso.id, parseInt(e.target.value) || 1)}
                        className="w-14 text-center text-xs font-bold font-mono text-white bg-slate-950 border border-slate-800 rounded px-1.5 py-1"
                      />
                      <span className="text-[10px] font-mono text-slate-500">pzas/lote</span>
                    </div>
                  </div>

                  {/* Selector de Cantidad Mensual */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Volumen Mes ({cantDiaria} /día):
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const step = proceso.cabezasSimultaneas || 1;
                          onChangeCantidad(proceso.id, Math.max(0, cantActual - step));
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={cantActual}
                        onChange={(e) => onChangeCantidad(proceso.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center text-xs font-bold font-mono text-white bg-slate-950 border border-slate-800 rounded py-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const step = proceso.cabezasSimultaneas || 1;
                          onChangeCantidad(proceso.id, cantActual + step);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Consumo Resultante y Ahorro por Lote */}
                  <div className="text-right min-w-[110px]">
                    <span className="text-xs font-bold font-mono text-teal-400 block">
                      {res.kwhMensual.toFixed(1)} kWh/mes
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {res.whPorUnidadLote.toFixed(1)} Wh/{proceso.unidad.slice(0, 3)}
                    </span>
                    {res.ahorroLotePct > 0 && (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 block mt-0.5">
                        -{res.ahorroLotePct.toFixed(0)}% vs 1 pza
                      </span>
                    )}
                  </div>

                  {/* Botón Ver Receta */}
                  <button
                    type="button"
                    onClick={() => toggleReceta(proceso.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                    title="Ver receta paso a paso"
                  >
                    {estaExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Detalle Desplegable de la Receta Paso a Paso */}
              {estaExpandido && (
                <div className="p-4 bg-slate-950/70 border-t border-slate-850 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-350 font-mono font-bold">
                    <span>SECUENCIA OPERATIVA POR LOTE DE {loteActual} PIEZAS:</span>
                    <span>Corridas de Ciclo: {Math.ceil(loteActual / (proceso.cabezasSimultaneas || 1))}</span>
                  </div>

                  <div className="space-y-2">
                    {proceso.pasos.map((paso, pIdx) => {
                      const eq = mapaEquipos[paso.equipoKey] || { nombre: paso.equipoKey, wattsEfectivos: 500 };
                      const uCiclo = Math.ceil(loteActual / (proceso.cabezasSimultaneas || 1));
                      const tTrab = uCiclo * (paso.trabajoMinPorUnidad || 0);
                      const tGap = Math.max(0, uCiclo - 1) * (paso.espacioEntreUnidadesMin || 0);

                      return (
                        <div 
                          key={pIdx} 
                          className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                              {paso.orden}
                            </span>
                            <div>
                              <span className="font-bold text-white font-sans">{eq.nombre}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {paso.accion} ({eq.wattsEfectivos} W)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-350">
                            {paso.preheatMinPorLote > 0 && (
                              <span className="text-amber-400">
                                Precalentado: {paso.preheatMinPorLote} min
                              </span>
                            )}
                            <span>Trabajo: {tTrab.toFixed(1)} min</span>
                            {tGap > 0 && (
                              <span className="text-slate-400">
                                Pausas: {tGap.toFixed(1)} min
                              </span>
                            )}
                            {paso.apagarAlFinal && (
                              <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Apagado final
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
