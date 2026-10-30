import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, PlusCircle, Clock, Zap, AlertOctagon } from 'lucide-react';

export default function MonitorCapacidadEquipos({
  capacidadesEquipos = {},
  equipoCuelloBotella = null,
  onAddAparato,
  medidorId = 'med_1'
}) {
  const listaEquipos = Object.values(capacidadesEquipos);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display flex items-center gap-2">
            <Gauge size={16} className="text-emerald-400" />
            Monitoreo de Capacidad y Ocupación de Equipos
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Muestra el porcentaje del horario laboral ocupado por cada máquina en el escenario activo. La meta de diseño para Mes Alto es el <strong>80% de utilización</strong>.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
          Zona Óptima: 75% - 80%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {listaEquipos.map(eq => {
          const isCuello = eq.equipoKey === equipoCuelloBotella;
          const pct = Math.min(150, Math.round(eq.pctSaturacion));

          let barColor = 'bg-teal-500';
          let textColor = 'text-teal-400';
          if (pct > 85) {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-400';
          } else if (pct >= 70) {
            barColor = 'bg-emerald-400';
            textColor = 'text-emerald-300';
          } else if (pct < 30) {
            barColor = 'bg-sky-500';
            textColor = 'text-sky-400';
          }

          return (
            <div
              key={eq.equipoKey}
              className={`p-4 rounded-xl border transition-all ${
                isCuello
                  ? 'bg-slate-900/80 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/40 border-slate-850'
              }`}
            >
              {/* Cabecera del Equipo */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white font-sans">
                      {eq.nombre}
                    </h4>
                    {isCuello && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Cuello Botella (80%)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {eq.watts} W · {eq.rol === 'produccion' ? 'Máquina de Producción' : eq.rol === 'clima' ? 'Climatización' : eq.rol === 'continuo_24h' ? 'Carga Base 24h' : 'Turno Fijo'}
                  </span>
                </div>

                {/* Badge de Conexión */}
                {eq.conectado ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 size={11} /> Conectado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold flex items-center gap-1 whitespace-nowrap">
                    <AlertTriangle size={11} /> Genérico
                  </span>
                )}
              </div>

              {/* Barra de Progreso con Marcador del 80% */}
              <div className="space-y-1.5 my-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400">
                    Ocupación: {eq.horasOcupadasMes.toFixed(1)}h / {eq.horasDisponiblesMes.toFixed(1)}h mes
                  </span>
                  <span className={`font-bold ${textColor}`}>
                    {pct}%
                  </span>
                </div>

                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden relative border border-slate-800">
                  {/* Marcador del 80% */}
                  <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-white/70 z-10"
                    style={{ left: '80%' }}
                    title="Meta 80% en Mes Alto"
                  />
                  {/* Barra de llenado */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>

              {/* Métricas de Energía y Costo */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-850/80">
                <span className="text-slate-400">
                  {eq.kwhMes.toFixed(1)} kWh/mes
                </span>
                <span className="text-slate-300 font-bold">
                  ~${Math.round(eq.costoMesAprox).toLocaleString('es-MX')} MXN
                </span>
              </div>

              {/* Botón para agregar si no está conectado al tablero real */}
              {!eq.conectado && onAddAparato && (
                <button
                  type="button"
                  onClick={() => {
                    onAddAparato({
                      tipo: eq.nombre,
                      modelo: eq.nombre,
                      watts: eq.watts,
                      fp: 0.90,
                      tipoCarga: eq.tipoCarga || 'monofasica',
                      fase: eq.faseSugerida || 'A',
                      horasAlta: Math.round(eq.horasOcupadasMes / 26) || 4,
                      precio: 10000,
                      mantenimiento: 500,
                      vidaUtil: 8,
                      medidorId: medidorId || 'med_1'
                    });
                  }}
                  className="w-full mt-2.5 py-1 px-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-[10px] font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle size={12} />
                  Agregar al Cuadro de Cargas Real
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
