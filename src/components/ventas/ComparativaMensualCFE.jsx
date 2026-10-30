import React from 'react';
import { TrendingUp, DollarSign, Zap, Gauge, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ComparativaMensualCFE({
  simulacionActual,
  simulacionBajo,
  simulacionMedio,
  simulacionAlto,
  vistaConsolidada = false,
  simulacionConsorcio = null,
  diasPeriodo = 30
}) {
  if (vistaConsolidada && simulacionConsorcio) {
    const { mapaMedidores, totalKwhPeriodoConsorcio, totalFacturaConsorcio } = simulacionConsorcio;

    return (
      <div className="space-y-4">
        {/* Banner de Consolidación */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-950/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-widest block">
                Facturación Agregada CFE ({diasPeriodo} Días)
              </span>
              <div className="text-3xl font-black text-white font-sans mt-1">
                ${Math.round(totalFacturaConsorcio).toLocaleString('es-MX')}{' '}
                <span className="text-sm font-bold text-slate-400 font-sans">MXN Total</span>
              </div>
              <span className="text-xs text-slate-400 mt-0.5 block font-mono">
                Suma de los 6 Contratos / Medidores independientes: {Math.round(totalKwhPeriodoConsorcio).toLocaleString('es-MX')} kWh
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Consumo Diario Global</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {(totalKwhPeriodoConsorcio / diasPeriodo).toFixed(1)} kWh/día
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Matriz por los 6 Medidores */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 overflow-hidden">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-teal-400" />
            Matriz de Consumo y Recibo CFE por Medidor Físico
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Medidor CFE</th>
                  <th className="py-2.5 px-3">Negocio(s) / Carga</th>
                  <th className="py-2.5 px-3 text-right">kWh / Mes</th>
                  <th className="py-2.5 px-3 text-right">kWh / Día</th>
                  <th className="py-2.5 px-3 text-right">Escalón CFE</th>
                  <th className="py-2.5 px-3 text-right">Factura ({diasPeriodo}d)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-sans">
                {Object.keys(mapaMedidores).map(medId => {
                  const mData = mapaMedidores[medId];
                  const totalPesos = mData.reciboCFE?.factura?.total || 0;
                  const escalon = mData.reciboCFE?.tarifa?.tipo || 'Tarifa 1C';

                  return (
                    <tr key={medId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-400">
                        {mData.medidor.nombre || medId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {mData.negociosAsignados.map((nom, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-medium"
                            >
                              {nom}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                        {Math.round(mData.kwhMes).toLocaleString('es-MX')} kWh
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {mData.kwhDiario.toFixed(1)} kWh
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono">
                          {escalon}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400">
                        ${Math.round(totalPesos).toLocaleString('es-MX')} MXN
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Vista de Negocio Individual: 3 Tarjetas Comparativas (Bajo / Medio / Alto 80%)
  const escActivo = simulacionActual.escenarioActivo;

  const cards = [
    {
      key: 'bajo',
      titulo: 'Mes Bajo',
      sub: 'Operación mínima y apagado',
      sim: simulacionBajo,
      color: 'sky',
      badge: '~20% Capacidad'
    },
    {
      key: 'medio',
      titulo: 'Mes Medio',
      sub: 'Demanda comercial regular',
      sim: simulacionMedio,
      color: 'teal',
      badge: '~50% Capacidad'
    },
    {
      key: 'alto',
      titulo: 'Mes Alto (80% Cap.)',
      sub: 'Capacidad pico en horario laboral',
      sim: simulacionAlto,
      color: 'emerald',
      badge: '80% Límite Máximo'
    }
  ];

  return (
    <div className="space-y-4">
      {/* 3 Tarjetas Comparativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(c => {
          const isSelected = escActivo === c.key;
          const kwhMes = c.sim ? Math.round(c.sim.totalKwhMes) : 0;
          const kwhDia = c.sim ? c.sim.totalKwhDiario.toFixed(1) : 0;
          const pesos = c.sim ? Math.round(c.sim.cobroCFE.factura?.total || 0) : 0;
          const satCuello = c.sim ? Math.round(c.sim.maxSaturacion) : 0;

          let borderClass = 'border-slate-800 bg-slate-900/40';
          if (isSelected) {
            borderClass = c.key === 'alto' 
              ? 'border-emerald-500/80 bg-slate-900/80 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : c.key === 'bajo'
                ? 'border-sky-500/80 bg-slate-900/80 ring-2 ring-sky-500/30'
                : 'border-teal-500/80 bg-slate-900/80 ring-2 ring-teal-500/30';
          }

          return (
            <div 
              key={c.key}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${borderClass}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-black font-display text-white flex items-center gap-2">
                    {c.titulo}
                    {isSelected && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500 text-slate-950 uppercase">
                        Activo
                      </span>
                    )}
                  </h4>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    c.key === 'alto' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {c.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mb-4">{c.sub}</p>

                <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Consumo Mensual:</span>
                    <span className="font-mono font-bold text-white">{kwhMes.toLocaleString('es-MX')} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Consumo Diario Promedio:</span>
                    <span className="font-mono text-slate-300">{kwhDia} kWh/día</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Saturación Máx. Equipo:</span>
                    <span className={`font-mono font-extrabold ${c.key === 'alto' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {satCuello}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Factura Estimada ({diasPeriodo} Días)</span>
                <div className="text-2xl font-black text-white font-sans mt-0.5">
                  ${pesos.toLocaleString('es-MX')}{' '}
                  <span className="text-xs font-bold text-slate-500 font-sans">MXN</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
