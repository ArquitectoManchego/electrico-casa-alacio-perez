import React, { useState } from 'react';
import {
  ShieldCheck,
  BatteryCharging,
  Clock,
  Sun,
  Moon,
  AlertTriangle,
  Zap,
  CheckSquare,
  Square
} from 'lucide-react';
import { NIVELES_CRITICIDAD_INFO } from '../../data/cotizacionesSolares';

function formatHorasMin(horasFloat) {
  if (!horasFloat || horasFloat <= 0) return '0 h';
  if (horasFloat >= 24) return '24+ horas (Continuo)';
  const h = Math.floor(horasFloat);
  const m = Math.round((horasFloat - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hrs`;
  return `${h} h ${m} min`;
}

export default function MatrizEquiposRespaldo({
  equiposClasificados = [],
  idsSeleccionados,
  onToggleEquipo,
  onSeleccionarHastaNivel,
  autonomia,
  arquitectura,
  bateriaKwh,
  onActivarHibridoRapido
}) {
  const [nivelVisible, setNivelVisible] = useState(1);

  const porNivel = {
    1: equiposClasificados.filter(e => e.nivel === 1),
    2: equiposClasificados.filter(e => e.nivel === 2),
    3: equiposClasificados.filter(e => e.nivel === 3)
  };

  const cargaInversorPct = autonomia.inversorCapacidadKw > 0
    ? Math.min(130, Math.round((autonomia.wattsRealesTotal / (autonomia.inversorCapacidadKw * 1000)) * 100))
    : 0;

  return (
    <section
      data-testid="solar-matriz-respaldo-section"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            4. Simulador de Apagón · ¿Qué Aparatos Puedes Mantener Encendidos y Por Cuánto Tiempo?
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Marca los equipos críticos que quieres rescatar si falla CFE. Calculamos sus <strong>Watts reales simultáneos</strong> (no solo placa) y las horas exactas que aguanta tu batería.
          </p>
        </div>

        {/* Presets rápidos de niveles de criticidad */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            data-testid="solar-respaldo-preset-n1-btn"
            onClick={() => onSeleccionarHastaNivel(1)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 cursor-pointer transition-all"
          >
            Solo Nivel 1 (Críticos)
          </button>
          <button
            type="button"
            data-testid="solar-respaldo-preset-n2-btn"
            onClick={() => onSeleccionarHastaNivel(2)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 cursor-pointer transition-all"
          >
            Nivel 1 + 2 (Operación)
          </button>
          <button
            type="button"
            data-testid="solar-respaldo-preset-n3-btn"
            onClick={() => onSeleccionarHastaNivel(3)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 cursor-pointer transition-all"
          >
            Todo el Edificio (N1+N2+N3)
          </button>
        </div>
      </div>

      {/* Banner de diagnóstico de autonomía */}
      {!arquitectura.funcionaEnApagon ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-100">
              <strong className="block text-amber-300">
                Tu configuración actual ({arquitectura.nombre}) NO respalda equipos durante apagones.
              </strong>
              Has seleccionado <strong>{autonomia.cantidadEquipos} equipos</strong> que requieren{' '}
              <strong className="font-mono">{autonomia.wattsRealesTotal.toLocaleString('es-MX')} W reales</strong>{' '}
              ({autonomia.wattsNominalTotal.toLocaleString('es-MX')} W nominales). Para mantenerlos vivos sin luz de CFE, activa baterías en modo Híbrido o UPS.
            </div>
          </div>
          <button
            type="button"
            data-testid="solar-respaldo-activar-hibrido-btn"
            onClick={onActivarHibridoRapido}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition-all"
          >
            Probar en Modo Híbrido (10 kWh)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Demanda real simultánea */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Demanda Real Seleccionada
            </span>
            <div className="text-xl font-black text-white font-mono mt-1">
              {autonomia.wattsRealesTotal.toLocaleString('es-MX')} W
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {autonomia.cantidadEquipos} equipos · Placa: {autonomia.wattsNominalTotal.toLocaleString('es-MX')} W
            </div>
          </div>

          {/* Capacidad del inversor */}
          <div className={`bg-slate-950/80 border rounded-xl p-3.5 ${autonomia.excedeInversor ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'}`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" /> Inversor ({autonomia.inversorCapacidadKw} kW)
            </span>
            <div className={`text-xl font-black font-mono mt-1 ${autonomia.excedeInversor ? 'text-rose-400' : 'text-emerald-300'}`}>
              {cargaInversorPct}% de carga
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {autonomia.excedeInversor
                ? '⚠️ Sobrecarga: sube baterías o apaga climas'
                : autonomia.requiere220V
                  ? 'Requiere inversor Bifásico 220V'
                  : 'Voltaje 120V/220V dentro de rango'}
            </div>
          </div>

          {/* Autonomía Nocturna */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5" /> Autonomía de Noche (Sin Sol)
            </span>
            <div className="text-xl font-black text-white font-mono mt-1">
              {formatHorasMin(autonomia.horasNoche)}
            </div>
            <div className="text-[10px] text-indigo-200/80 mt-0.5">
              Banco {bateriaKwh} kWh ({autonomia.energiaUtilBateriaKwh.toFixed(1)} kWh útiles)
            </div>
          </div>

          {/* Autonomía Diurna */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" /> Autonomía de Día (Con Sol)
            </span>
            <div className="text-xl font-black text-amber-200 font-mono mt-1">
              {autonomia.solarCubreDiaCompleto ? 'Todo el Día + Noche' : formatHorasMin(autonomia.horasDiaConSol)}
            </div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">
              {autonomia.solarCubreDiaCompleto
                ? `Sol recarga batería · Total ${formatHorasMin(autonomia.horasDiaConSol)}`
                : arquitectura.usaPaneles
                  ? 'Sol ayuda a extender la batería'
                  : 'Sin paneles solares (solo batería)'}
            </div>
          </div>
        </div>
      )}

      {/* Pestañas por Nivel de Criticidad */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {[1, 2, 3].map((lvl) => {
            const info = NIVELES_CRITICIDAD_INFO[lvl];
            const lista = porNivel[lvl];
            const countAct = lista.filter(e => idsSeleccionados.has(e.id)).length;
            const sumReales = lista.reduce((s, e) => s + e.wattsReales, 0);
            const active = nivelVisible === lvl;

            return (
              <button
                key={lvl}
                type="button"
                data-testid={`solar-criticidad-tab-${lvl}-btn`}
                onClick={() => setNivelVisible(lvl)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-slate-800 border-teal-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{info.nombre}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-teal-300">
                  {countAct}/{lista.length} · {(sumReales / 1000).toFixed(1)} kW reales
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 inline mr-1 text-teal-400" />
          <strong>{NIVELES_CRITICIDAD_INFO[nivelVisible].nombre}:</strong> {NIVELES_CRITICIDAD_INFO[nivelVisible].descripcion}
        </p>

        {/* Lista de equipos del nivel visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
          {porNivel[nivelVisible].map((eq) => {
            const checked = idsSeleccionados.has(eq.id);
            return (
              <button
                key={eq.id}
                type="button"
                data-testid={`solar-equipo-respaldo-${eq.id}-toggle`}
                onClick={() => onToggleEquipo(eq.id)}
                className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                  checked
                    ? 'bg-teal-500/10 border-teal-500/40 text-white'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {checked
                    ? <CheckSquare className="w-4 h-4 text-teal-400" />
                    : <Square className="w-4 h-4 text-slate-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{eq.nombre}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold">
                      {eq.local}
                    </span>
                    {eq.es220V && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-black">
                        220V
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {eq.wattsReales}W reales
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      (placa {eq.wattsNominal}W)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{eq.motivo}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
