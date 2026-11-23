import React from 'react';
import {
  Sun,
  BatteryCharging,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Zap,
  Layers,
  Info
} from 'lucide-react';
import { ARQUITECTURAS_SOLARES } from '../../data/cotizacionesSolares';

const COLOR_STYLES = {
  emerald: {
    active: 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: 'text-emerald-400'
  },
  amber: {
    active: 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: 'text-amber-400'
  },
  cyan: {
    active: 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/30',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: 'text-cyan-400'
  },
  sky: {
    active: 'border-sky-400 bg-sky-500/15 ring-2 ring-sky-400/30',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: 'text-sky-400'
  },
  violet: {
    active: 'border-violet-400 bg-violet-500/15 ring-2 ring-violet-400/30',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon: 'text-violet-400'
  }
};

export default function SelectorConfiguracionesSolares({
  arquitecturaId,
  onSelectArquitectura
}) {
  const arqActiva = ARQUITECTURAS_SOLARES.find(a => a.id === arquitecturaId) || ARQUITECTURAS_SOLARES[0];

  return (
    <section
      data-testid="solar-arquitecturas-section"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            1. Elige la Configuración del Sistema (5 Arquitecturas Posibles)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Haz clic en cada tarjeta para ver en el esquema animado cómo fluye la luz, qué equipo lleva y qué pasa si CFE falla.
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 self-start">
          Activo: {arqActiva.nombre}
        </span>
      </div>

      {/* Grid de 5 tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ARQUITECTURAS_SOLARES.map((arq) => {
          const isSelected = arq.id === arquitecturaId;
          const style = COLOR_STYLES[arq.color] || COLOR_STYLES.emerald;

          return (
            <button
              key={arq.id}
              type="button"
              data-testid={`solar-arquitectura-${arq.id}-btn`}
              aria-label={`Seleccionar arquitectura ${arq.nombre}`}
              onClick={() => onSelectArquitectura(arq.id)}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                isSelected
                  ? style.active
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <div className={`flex items-center gap-1.5 ${style.icon}`}>
                    {arq.usaPaneles && <Sun className="w-4 h-4" />}
                    {arq.usaBaterias && <BatteryCharging className="w-4 h-4" />}
                    {!arq.usaPaneles && !arq.usaBaterias && <Zap className="w-4 h-4" />}
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${style.badge}`}>
                    {arq.nivelInversion}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-black text-white leading-tight">{arq.nombre}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{arq.subtitulo}</div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Baja CFE:</span>
                  <span className={`font-bold ${arq.usaPaneles ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {arq.usaPaneles ? arq.bajaReciboCFE.split(' ')[0] + ' ' + (arq.bajaReciboCFE.split(' ')[1] || '') : 'No ($0)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">En apagón:</span>
                  <span className={`font-bold flex items-center gap-1 ${arq.funcionaEnApagon ? 'text-amber-300' : 'text-rose-400'}`}>
                    {arq.funcionaEnApagon ? (
                      <><CheckCircle2 className="w-3 h-3" /> Sigue encendido</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> Se apaga</>
                    )}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explicación detallada para socios de la arquitectura elegida */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-teal-300">
              Explicación Sencilla · {arqActiva.nombre}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {arqActiva.resumenSocios}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {arqActiva.componentes.map((comp, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300"
              >
                • {comp}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-1.5 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ventajas Clave
          </div>
          <ul className="space-y-1">
            {arqActiva.pros.map((pro, i) => (
              <li key={i} className="text-[11px] text-slate-300 leading-snug">
                ✓ {pro}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-1.5 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Consideraciones
          </div>
          <ul className="space-y-1">
            {arqActiva.contras.map((con, i) => (
              <li key={i} className="text-[11px] text-slate-400 leading-snug">
                • {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
