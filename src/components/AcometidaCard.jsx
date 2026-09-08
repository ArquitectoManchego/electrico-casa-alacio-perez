import React from 'react';
import { Zap, AlertTriangle, CheckCircle, Info, Activity } from 'lucide-react';
import { calcularCorriente } from '../utils/electricalCalculations';

export default function AcometidaCard({ 
  tipoSystem, 
  fasesLoad, 
  fasesVA, 
  desbalance,
  forzarTrifasico = false,
  onToggleForzarTrifasico
}) {
  const totalWatts = Object.values(fasesLoad).reduce((a, b) => a + b, 0);
  const totalVA = Object.values(fasesVA).reduce((a, b) => a + b, 0);

  // Determinar color de alerta para el desbalance
  let desbalanceColorClass = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  let desbalanceLabel = 'Balanceado (Óptimo)';
  let showDesbalanceWarning = false;

  if (desbalance > 5 && desbalance <= 10) {
    desbalanceColorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    desbalanceLabel = 'Desbalance Moderado (>5%)';
    showDesbalanceWarning = true;
  } else if (desbalance > 10) {
    desbalanceColorClass = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    desbalanceLabel = 'Crítico - NOM-001-SEDE Excedido';
    showDesbalanceWarning = true;
  }

  // Determinar gradiente del estado del sistema
  let systemBadgeBg = 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
  let systemGlow = 'glow-teal';

  if (tipoSystem.id === 'bifasico') {
    systemBadgeBg = 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
    systemGlow = 'glow-amber';
  } else if (tipoSystem.id === 'trifasico') {
    systemBadgeBg = 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30';
    systemGlow = 'glow-teal';
  }

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.08),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Clasificación de Acometida CFE
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1 flex items-center gap-2">
            <Zap className="text-amber-400 fill-amber-400/20 animate-pulse" size={24} />
            {tipoSystem.tipo}
          </h2>
        </div>
        <div className={`px-4 py-2 rounded-xl border bg-gradient-to-r ${systemBadgeBg} font-medium text-sm flex items-center gap-2 ${systemGlow}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current"></span>
          </span>
          {tipoSystem.descripcion}
        </div>
      </div>

      {/* Carga Total Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Potencia Activa Total</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-display text-white">
              {totalWatts.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-semibold text-emerald-400">W</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Límite contratado CFE: {tipoSystem.limiteWatts === Infinity ? 'Ilimitado' : `${tipoSystem.limiteWatts}W`}
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Potencia Aparente Total</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-display text-slate-200">
              {totalVA.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-semibold text-cyan-400">VA</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Determina la corriente total y calibre de conductores
          </p>
        </div>
      </div>

      {/* Visualización de Fases */}
      <div className="space-y-4 mb-6 relative z-10">
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Activity size={14} className="text-cyan-400" />
          Distribución de Carga por Fase (127V CA)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['A', 'B', 'C'].map((fase) => {
            const isAvailable = tipoSystem.fasesDisponibles.includes(fase);
            const loadW = fasesLoad[fase] || 0;
            const loadVA = fasesVA[fase] || 0;
            const corriente = calcularCorriente(loadVA);
            // Calcular porcentaje relativo respecto a 5kW por fase max sugerido
            const maxFaseWatts = 5000;
            const pct = Math.min((loadW / maxFaseWatts) * 100, 100);

            const isRequiredTrifasico = totalWatts > 10000;
            const canToggle = fase === 'C' && !isRequiredTrifasico;

            return (
              <div
                key={fase}
                onClick={() => {
                  if (canToggle && onToggleForzarTrifasico) {
                    onToggleForzarTrifasico();
                  }
                }}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isAvailable
                    ? 'bg-slate-900/30 border-slate-800'
                    : 'bg-slate-950/20 border-slate-900/50 opacity-40 select-none'
                } ${canToggle ? 'cursor-pointer hover:border-blue-500/80 hover:bg-slate-900/40' : ''}`}
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
                    <span className="text-sm font-semibold text-slate-200">Fase {fase}</span>
                  </div>
                  {fase === 'C' && forzarTrifasico && !isRequiredTrifasico ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-mono">
                      Forzado
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      {isAvailable ? 'Activa' : 'Inactiva'}
                    </span>
                  )}
                </div>

                {isAvailable ? (
                  <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          fase === 'A' ? 'bg-red-500' : fase === 'B' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-slate-400">Carga:</span>
                      <span className="font-semibold text-white">{loadW.toLocaleString('es-MX')} W</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Aparente:</span>
                      <span className="font-semibold text-slate-300">{Math.round(loadVA).toLocaleString('es-MX')} VA</span>
                    </div>

                    <div className="flex justify-between text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">Corriente:</span>
                      <span className={`font-semibold ${corriente > 30 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {corriente.toFixed(2)} A
                      </span>
                    </div>

                    {fase === 'C' && forzarTrifasico && !isRequiredTrifasico && (
                      <div className="text-[8px] text-blue-400 font-sans text-center mt-1 uppercase font-semibold">
                        (Clic para quitar 3F)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 hover:text-blue-400 font-medium font-sans">
                    {fase === 'C' ? 'Clic para forzar modo 3F' : `Habilitar con carga > ${fase === 'B' ? '5kW' : '10kW'}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desbalance de Fases */}
      {tipoSystem.fasesDisponibles.length > 1 && (
        <div className={`p-4 rounded-xl border transition-all duration-300 relative z-10 ${desbalanceColorClass}`}>
          <div className="flex items-start gap-3">
            {desbalance > 5 ? (
              <AlertTriangle className="mt-0.5 flex-shrink-0" size={18} />
            ) : (
              <CheckCircle className="mt-0.5 flex-shrink-0" size={18} />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Desbalance de Carga: {desbalance.toFixed(2)}%
                </span>
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10">
                  {desbalanceLabel}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-80 leading-relaxed">
                {desbalance > 5
                  ? `El desbalance supera el 5% recomendado por la NOM-001-SEDE. Esto puede causar sobrecalentamiento en el conductor de neutro y pérdidas en transformadores. Reasigna las fases de los aparatos para balancear las cargas.`
                  : `Tu sistema se encuentra balanceado dentro de los límites de la NOM-001-SEDE (menor al 5%). Esto optimiza el consumo y prolonga la vida útil de los equipos.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
