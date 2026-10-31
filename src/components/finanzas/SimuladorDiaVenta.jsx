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
  HelpCircle,
  Scissors,
  Zap,
  Store,
  DollarSign
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
    costoMaterialesDia = 0,
    costoManoObraDia = 0,
    costoLuzDia = 0,
    costoVariableDia,
    utilidadBrutaDia,
    cuotaFijaDia,
    utilidadNetaDia,
    calificacionDia,
    mensaje,
    esTallerCostura = negocioId === 'taller_costura'
  } = resultadoDia;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
      {/* Header del Simulador Diario */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {esTallerCostura ? (
              <Scissors className="text-rose-400" size={20} />
            ) : (
              <Calculator className="text-teal-400" size={20} />
            )}
            <h3 className="text-base font-bold text-white font-display">
              {esTallerCostura 
                ? 'Simulador de Producción Diaria y Confección (Maquila Interna)'
                : 'Simulador Interactivo de Día de Venta'}
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
              esTallerCostura
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
            }`}>
              {esTallerCostura ? 'Producción para Imperia Uniformes' : 'Unidad por Unidad'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-4xl">
            {esTallerCostura
              ? 'El taller no vende al público general; maquila uniformes para Imperia Uniformes. La rentabilidad se mide por las prendas terminadas al día: su valor de producción debe pagar la mano de obra de las costureras, la luz de las máquinas industriales y los gastos fijos del local.'
              : 'Ingresa cuántos artículos se vendieron hoy (ej. 1 crepa, 2 cafés, 1 raspado...). Evalúa si el día cubrió su cuota de gastos fijos y si genera ganancia libre.'}
          </p>
        </div>

        {/* Botones de Presets Rápidos */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onApplyPreset('cero')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={esTallerCostura ? 'Jornada sin confección (0 prendas)' : 'Día sin ventas (0 artículos)'}
          >
            {esTallerCostura ? 'Día Cero (0 prendas)' : 'Día Cero (0)'}
          </button>
          <button
            onClick={() => onApplyPreset('bajo')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
            title={esTallerCostura ? 'Producción baja (≤10 prendas confeccionadas)' : 'Día bajo (≤10 artículos en total)'}
          >
            {esTallerCostura ? 'Prod. Baja (≤10 prendas)' : 'Día Bajo (≤10 arts)'}
          </button>
          <button
            onClick={() => onApplyPreset('equilibrio')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            title={esTallerCostura ? 'Prendas mínimas para pagar sueldos, luz y renta del taller' : 'Exactamente el punto de equilibrio para cubrir gastos del día'}
          >
            {esTallerCostura ? 'Pto. Equilibrio Costura' : 'Punto Equilibrio'}
          </button>
          <button
            onClick={() => onApplyPreset('medio')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
            title={esTallerCostura ? 'Producción media solvente con superávit' : 'Día medio con superávit sobre gastos fijos'}
          >
            {esTallerCostura ? 'Prod. Media' : 'Día Medio'}
          </button>
          <button
            onClick={() => onApplyPreset('alto')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/50 shadow-sm transition cursor-pointer flex items-center gap-1"
            title={esTallerCostura ? 'Producción alta para meta de $20,000 libres al mes' : 'Ritmo para ganar $20,000 MXN libres al mes'}
          >
            <Sparkles size={12} className="text-teal-400" />
            {esTallerCostura ? 'Prod. Alta ($20k Libres)' : 'Día Alto ($20k Libres)'}
          </button>
          <button
            onClick={onResetDia}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="Reiniciar conteo de la jornada"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Ficha Explicativa Específica del Enfoque de Maquila y Confección */}
      {esTallerCostura && (
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/30 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-rose-200">
          <Store size={18} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Enfoque Operativo de Rentabilidad: </strong>
            Las costureras confeccionan filipinas, pantalones, batas y playeras polo con las máquinas industriales (2 Singer rectas, 1 Overlock 5 hilos y 1 Collaretera). Cada prenda genera su costo de mano de obra para pagar los sueldos y cubre el consumo eléctrico de los motores y clima del taller. El excedente cubre la renta prorrateada de los 31.96 m² ($1,112.40 MXN) y el agua ($150.00 MXN), suministrando el inventario de venta a <strong className="text-white">Imperia Uniformes</strong>.
          </div>
        </div>
      )}

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
              {esTallerCostura ? 'Diagnóstico de Producción: ' : 'Diagnóstico del Día: '} 
              {calificacionDia.toUpperCase().replace('_', ' ')}
            </div>
            <div className="text-sm font-semibold mt-0.5">
              {mensaje}
            </div>
          </div>
        </div>

        {/* Indicador de Ganancia Neta o Excedente del Día */}
        <div className="bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-800 text-right shrink-0">
          <div className="text-[10px] text-slate-400 font-mono uppercase">
            {esTallerCostura ? 'Excedente Neto de Hoy' : 'Utilidad Neta de Hoy'}
          </div>
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
            Cuota fija diaria del local: ${Math.round(cuotaFijaDia).toLocaleString('es-MX')} MXN
          </div>
        </div>
      </div>

      {/* Grid de Métricas Clave del Día */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Volumen */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            {esTallerCostura ? 'Prendas Confeccionadas' : 'Artículos Vendidos'}
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {totalArticulosDia} <span className="text-xs text-slate-400 font-normal">{esTallerCostura ? 'prendas' : 'piezas'}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {totalArticulosDia <= 10 ? 'Volumen bajo (≤ 10 uds)' : 'Volumen activo'}
          </div>
        </div>

        {/* Card 2: Valor Total Generado */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            {esTallerCostura ? 'Valor Comercial Confeccionado' : 'Venta Total (Ingresos)'}
          </div>
          <div className="text-lg font-bold text-teal-400 font-mono mt-1">
            ${Math.round(ventaTotalDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {esTallerCostura ? 'PVP en Imperia Uniformes' : `Ticket prom: $${totalArticulosDia > 0 ? (ventaTotalDia / totalArticulosDia).toFixed(1) : '0'}`}
          </div>
        </div>

        {/* Card 3: Mano de Obra Devengada por Costureras */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
            <span>{esTallerCostura ? 'Mano de Obra Costureras' : 'Costos Variables'}</span>
            {esTallerCostura && <Scissors size={10} className="text-amber-400" />}
          </div>
          <div className="text-lg font-bold text-amber-300 font-mono mt-1">
            ${Math.round(esTallerCostura ? costoManoObraDia : costoVariableDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {esTallerCostura ? 'Pago a costureras por prenda' : 'Materiales, MO y Luz'}
          </div>
        </div>

        {/* Card 4: Luz de Máquinas y Materiales */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
            <span>{esTallerCostura ? 'Luz y Telas Insumidas' : 'Margen Bruto Día'}</span>
            {esTallerCostura && <Zap size={10} className="text-cyan-400" />}
          </div>
          <div className="text-lg font-bold text-cyan-300 font-mono mt-1">
            ${Math.round(esTallerCostura ? (costoMaterialesDia + costoLuzDia) : utilidadBrutaDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {esTallerCostura ? `Luz máquinas: $${costoLuzDia.toFixed(2)} MXN` : 'Ventas - Costos Variables'}
          </div>
        </div>

        {/* Card 5: Cuota Fija Diaria */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            {esTallerCostura ? 'Cuota Fija Taller' : 'Cuota Fija Diaria'}
          </div>
          <div className="text-lg font-bold text-amber-300 font-mono mt-1">
            ${Math.round(cuotaFijaDia).toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Renta + Agua + Luz / {diasLaborales}d
          </div>
        </div>
      </div>

      {/* Selector de Cantidades Producto por Producto */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            {esTallerCostura 
              ? 'Prendas Confeccionadas en la Jornada por las Costureras'
              : 'Artículos Vendidos en el Día por Categoría'}
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
            const subtotalMO = q * (p.costoManoObra || 0);

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
                      PVP: ${p.precioVenta.toFixed(2)} &middot; MO Costura: ${p.costoManoObra.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
                      Luz: ${p.costoLuzUnitario.toFixed(2)} &middot; Margen: ${p.margenBruto.toFixed(2)} ({p.margenPct.toFixed(0)}%)
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
                    <span className="text-slate-400">
                      {esTallerCostura ? `MO: $${Math.round(subtotalMO)}` : `Subtotal: $${Math.round(subtotalVenta).toLocaleString()}`}
                    </span>
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
