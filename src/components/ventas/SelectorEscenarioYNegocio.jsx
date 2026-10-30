import React from 'react';
import { 
  Building2, 
  Shirt, 
  Printer, 
  Coffee, 
  Sparkles, 
  Scissors, 
  Flame, 
  Briefcase, 
  Sliders, 
  RefreshCw, 
  PlusCircle, 
  Calendar, 
  Clock, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { NEGOCIOS_CONFIG } from '../../utils/equiposNegocios';

const ICON_MAP = {
  Shirt,
  Printer,
  Coffee,
  Sparkles,
  Scissors,
  Flame,
  Briefcase
};

export default function SelectorEscenarioYNegocio({
  esConsorcio = false,
  vistaConsolidada = false,
  onToggleVistaConsolidada,
  negocioActivoId,
  onSelectNegocio,
  escenarioActivo = 'medio',
  onSelectEscenario,
  diasLaborales = 26,
  onChangeDiasLaborales,
  horasTurno = 8.0,
  onChangeHorasTurno,
  onRestaurarCalibracion,
  hayEquiposFaltantes = false,
  onSyncEquiposFaltantes
}) {
  const negocioActual = NEGOCIOS_CONFIG.find(n => n.id === negocioActivoId) || NEGOCIOS_CONFIG[0];

  return (
    <div className="space-y-4 no-print">
      
      {/* Pestañas de Negocios (Si estamos en consorcio_general) */}
      {esConsorcio && (
        <div className="bg-slate-900/60 p-2 rounded-2xl border border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => onToggleVistaConsolidada(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              vistaConsolidada
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-extrabold shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 size={16} />
            Vista Consolidada (6 Medidores)
          </button>

          <div className="w-[1px] h-6 bg-slate-800 mx-1" />

          {NEGOCIOS_CONFIG.map(neg => {
            const IconComp = ICON_MAP[neg.icono] || Building2;
            const isSelected = !vistaConsolidada && negocioActivoId === neg.id;
            return (
              <button
                key={neg.id}
                type="button"
                onClick={() => {
                  onToggleVistaConsolidada(false);
                  onSelectNegocio(neg.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium font-sans flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-teal-400 font-bold border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <IconComp size={15} />
                <span>{neg.nombre}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-400 border border-slate-800">
                  {neg.medidorIdConsorcio.replace('med_', 'M')}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Banner Principal del Negocio Activo o Vista Consolidada */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={13} />
                {vistaConsolidada ? 'Inmueble Completo' : (negocioActual.medidorIdConsorcio ? `Medidor ${negocioActual.medidorIdConsorcio.replace('med_', '')}` : 'Medidor 1')}
              </span>
              <h3 className="text-lg font-black font-display text-white">
                {vistaConsolidada ? 'Consorcio Gallegos González — Consolidado 6 Medidores' : negocioActual.nombre}
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {vistaConsolidada
                ? 'Modelado simultáneo de los 7 negocios independientes agrupados en sus 6 acometidas CFE individuales.'
                : negocioActual.subtitulo}
            </p>
          </div>

          {/* Botón de Sincronización si faltan aparatos en el tablero real */}
          {hayEquiposFaltantes && !vistaConsolidada && (
            <button
              type="button"
              onClick={onSyncEquiposFaltantes}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-sans flex items-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <PlusCircle size={15} />
              Sincronizar Equipos al Cuadro de Cargas
            </button>
          )}
        </div>

        {/* Selector de Escenarios de Ventas y Parámetros Laborales */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Tarjetas de Escenarios */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider mr-1">
              Escenario:
            </span>

            {/* Mes Bajo */}
            <button
              type="button"
              onClick={() => onSelectEscenario('bajo')}
              className={`px-3 py-2 rounded-xl text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
                escenarioActivo === 'bajo'
                  ? 'bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/40 shadow-sm'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-850'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Mes Bajo</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">(~20% cap)</span>
            </button>

            {/* Mes Medio */}
            <button
              type="button"
              onClick={() => onSelectEscenario('medio')}
              className={`px-3 py-2 rounded-xl text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
                escenarioActivo === 'medio'
                  ? 'bg-teal-500/20 text-teal-300 font-extrabold border border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-850'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Mes Medio</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">(~50% cap)</span>
            </button>

            {/* Mes Alto (80% Capacidad Laboral) */}
            <button
              type="button"
              onClick={() => onSelectEscenario('alto')}
              className={`px-3 py-2 rounded-xl text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
                escenarioActivo === 'alto'
                  ? 'bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/50 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-850'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mes Alto</span>
              <span className="text-[10px] font-mono text-emerald-400/90 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20">
                80% Cap.
              </span>
            </button>

            {/* Modo Personalizado */}
            {escenarioActivo === 'custom' && (
              <div className="flex items-center gap-1.5">
                <span className="px-3 py-2 rounded-xl text-xs font-bold font-sans bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-2">
                  <Sliders size={13} />
                  Personalizado
                </span>
                <button
                  type="button"
                  onClick={onRestaurarCalibracion}
                  title="Restaurar calibración automática"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Controles de Jornada Laboral */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-850">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-[11px] text-slate-400 font-sans">Días:</span>
              <input
                type="number"
                min="1"
                max="31"
                value={diasLaborales}
                onChange={(e) => onChangeDiasLaborales(parseInt(e.target.value) || 26)}
                className="w-10 text-center text-xs font-bold font-mono text-white bg-slate-900 border border-slate-800 rounded px-1 py-0.5"
              />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-850">
              <Clock size={14} className="text-slate-400" />
              <span className="text-[11px] text-slate-400 font-sans">Turno:</span>
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={horasTurno}
                onChange={(e) => onChangeHorasTurno(parseFloat(e.target.value) || 8.0)}
                className="w-12 text-center text-xs font-bold font-mono text-white bg-slate-900 border border-slate-800 rounded px-1 py-0.5"
              />
              <span className="text-[10px] font-mono text-slate-500">h/día</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
