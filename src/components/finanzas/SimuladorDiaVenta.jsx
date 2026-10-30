import React, { useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Target, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { simularDiaVentaInteractivo } from '../../utils/motorPuntoEquilibrio.js';

export default function SimuladorDiaVenta({
  productos,
  negocioId,
  diasLaborales = 26,
  gastosFijosMensuales = 0,
  articulosVendidosMap = {},
  onChangeArticulo,
  onResetDia,
  onApplyPreset
}) {
  const resultadoDia = useMemo(() => {
    return simularDiaVentaInteractivo({
      articulosVendidosMap,
      negocioId,
      diasLaborales,
      gastosFijosMensuales,
      productos
    });
  }, [articulosVendidosMap, negocioId, diasLaborales, gastosFijosMensuales, productos]);

  const {
    totalArticulosDia,
    ventaTotalDia,
    costoVariableDia,
    utilidadBrutaDia,
    cuotaFijaDia,
    utilidadNetaDia,
    calificacionDia,
    mensaje
  } = resultadoDia;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
      {/* Header del Simulador Diario */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="text-teal-400" size={20} />
            <h3 className="text-base font-bold text-white font-display">
              Simulador Interactivo de Día de Venta
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
              Unidad por Unidad
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Ingresa cuántos artículos se vendieron hoy (ej. 1 crepa, 2 cafés, 1 raspado...). Evalúa si el día cubrió su cuota de gastos fijos y si genera ganancia libre.
          </p>
        </div>

        {/* Botones de Presets Rápidos */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onApplyPreset('cero')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Día sin ventas (0 artículos)"
          >
            Día Cero (0)
          </button>
          <button
            onClick={() => onApplyPreset('bajo')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
            title="Día bajo (5 a 10 artículos en total)"
          >
            Día Bajo (≤10 arts)
          </button>
          <button
            onClick={() => onApplyPreset('equilibrio')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            title="Exactamente el punto de equilibrio para cubrir gastos del día"
          >
            Punto Equilibrio
          </button>
          <button
            onClick={() => onApplyPreset('medio')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
            title="Día medio con superávit sobre gastos fijos"
          >
            Día Medio
          </button>
          <button
            onClick={() => onApplyPreset('alto')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/50 shadow-sm transition cursor-pointer flex items-center gap-1"
            title="Ritmo para ganar $20,000 MXN libres al mes"
          >
            <Sparkles size={12} className="text-teal-400" />
            Día Alto ($20k Libres)
          </button>
          <button
            onClick={onResetDia}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="Reiniciar conteo del día"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Tarjeta de Calificación y Diagnóstico del Día */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        calificacionDia === 'cero' || calificacionDia === 'bajo_deficit'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : calificacionDia === 'bajo_equilibrio'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : calificacionDia === 'medio'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-teal-500/15 border-teal-400/40 text-teal-200'
      }`}>
        <div className="flex items-center gap-3">
          {calificacionDia === 'cero' || calificacionDia === 'bajo_deficit' ? (
            <AlertCircle size={28} className="text-rose-400 shrink-0" />
          ) : calificacionDia === 'bajo_equilibrio' ? (
            <HelpCircle size={28} className="text-amber-400 shrink-0" />
          ) : calificacionDia === 'medio' ? (
            <CheckCircle2 size={28} className="text-emerald-400 shrink-0" />
          ) : (
            <Target size={28} className="text-teal-400 shrink-0" />
          )}
          <div>
            <div className="text-xs uppercase font-bold tracking-wider font-mono">
              Diagnóstico del Día: {calificacionDia.toUpperCase().replace('_', ' ')}
            </div>
            <div className="text-sm font-semibold mt-0.5">
              {mensaje}
            </div>
          </div>
        </div>

        {/* Indicador de Ganancia Neta del Día */}
        <div className="bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-800 text-right shrink-0">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Utilidad Neta de Hoy</div>
          <div className={`text-xl font-bold font-mono ${
            utilidadNetaDia >= 770 
              ? 'text-teal-300' 
              : utilidadNetaDia >= 0 
              ? 'text-emerald-400' 
              : 'text-rose-400'
          }`}>
            {utilidadNetaDia >= 0 ? '+' : ''}${Math.round(utilidadNetaDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500">
            Cuota fija diaria: ${Math.round(cuotaFijaDia).toLocaleString('es-MX')} MXN
          </div>
        </div>
      </div>

      {/* Grid de Métricas Clave del Día */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Artículos Vendidos</div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {totalArticulosDia} <span className="text-xs text-slate-400 font-normal">piezas</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {totalArticulosDia <= 10 ? 'Volumen bajo (<= 10 arts)' : 'Volumen normal / activo'}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Venta Total (Ingresos)</div>
          <div className="text-lg font-bold text-teal-400 font-mono mt-1">
            ${Math.round(ventaTotalDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Ticket promedio: ${totalArticulosDia > 0 ? (ventaTotalDia / totalArticulosDia).toFixed(1) : '0'}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Costos Variables</div>
          <div className="text-lg font-bold text-rose-300 font-mono mt-1">
            ${Math.round(costoVariableDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Materiales, MO y Luz
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Margen Bruto Día</div>
          <div className="text-lg font-bold text-emerald-300 font-mono mt-1">
            ${Math.round(utilidadBrutaDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Ventas - Costos Variables
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Cuota Fija Diaria</div>
          <div className="text-lg font-bold text-amber-300 font-mono mt-1">
            ${Math.round(cuotaFijaDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Renta + Agua + CFE / {diasLaborales}d
          </div>
        </div>
      </div>

      {/* Selector de Cantidades Producto por Producto */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Artículos Vendidos en el Día por Categoría
          </h4>
          <span className="text-[11px] text-slate-400">
            Ajusta las cantidades con los botones (+) o (-)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {productos.map(p => {
            const q = parseInt(articulosVendidosMap[p.id]) || 0;
            const subtotalVenta = q * p.precioVenta;
            const subtotalMargen = q * p.margenBruto;

            return (
              <div 
                key={p.id}
                className={`p-3 rounded-xl border transition-all ${
                  q > 0 
                    ? 'bg-slate-900/90 border-teal-500/40 shadow-sm shadow-teal-500/5' 
                    : 'bg-slate-950/40 border-slate-800/70 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate" title={p.nombre}>
                      {p.nombre}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ${p.precioVenta.toFixed(2)} &middot; Margen: ${p.margenBruto.toFixed(2)} ({p.margenPct.toFixed(0)}%)
                    </div>
                  </div>

                  {/* Stepper +/- */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => onChangeArticulo(p.id, Math.max(0, q - 1))}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={q}
                      onChange={(e) => onChangeArticulo(p.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-10 text-center bg-transparent text-xs font-bold font-mono text-teal-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onChangeArticulo(p.id, q + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {q > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Subtotal: ${Math.round(subtotalVenta).toLocaleString()}</span>
                    <span className="text-emerald-400 font-semibold">+${Math.round(subtotalMargen).toLocaleString()} margen</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
