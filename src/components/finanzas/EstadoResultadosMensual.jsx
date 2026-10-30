import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';

export default function EstadoResultadosMensual({
  escenarios,
  escenarioActivo = 'alto',
  onSelectEscenario,
  pnlActual,
  costosFijosDetalle,
  negocioNombre = ''
}) {
  const [tabVista, setTabVista] = useState('comparativa'); // 'comparativa' | 'detalle'

  const { bajo, medio, alto, muy_alto } = escenarios || {};
  const actual = pnlActual || alto?.pnl;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-teal-400" size={20} />
            <h3 className="text-base font-bold text-white font-display">
              Estado de Resultados Mensual (P&L) & Comparativa de Escenarios
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Desglose completo de Ingresos, Costos Variables, Gastos Fijos (Renta con IVA, Agua, CFE) y Utilidad Neta para {negocioNombre}.
          </p>
        </div>

        {/* Selector de Vista: Comparativa vs Detalle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTabVista('comparativa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tabVista === 'comparativa'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Comparativa de Escenarios
          </button>
          <button
            onClick={() => setTabVista('detalle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tabVista === 'detalle'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Detalle por Producto
          </button>
        </div>
      </div>

      {/* Tabs de Selección de Escenario para Ver Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'bajo', data: bajo, color: 'border-rose-500/40 text-rose-300 bg-rose-500/5', meta: 'Déficit / Break-Even' },
          { key: 'medio', data: medio, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/5', meta: 'Superávit Moderado' },
          { key: 'alto', data: alto, color: 'border-teal-400/60 text-teal-300 bg-teal-500/10 shadow-lg shadow-teal-500/10', meta: '🎯 Meta $20,000 Libres' },
          { key: 'muy_alto', data: muy_alto, color: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/5', meta: '> $20,000 Libres' }
        ].map(({ key, data, color, meta }) => {
          if (!data) return null;
          const isSelected = escenarioActivo === key;
          const pnl = data.pnl;
          return (
            <div
              key={key}
              onClick={() => onSelectEscenario && onSelectEscenario(key)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${color} ${
                isSelected ? 'ring-2 ring-teal-400 shadow-md' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                <span className="font-bold">{data.nombre}</span>
                <span className="text-slate-400">{data.articulosDia} arts/día</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                Utilidad: ${Math.round(pnl.utilidadNeta).toLocaleString('es-MX')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {meta} &middot; {pnl.unidadesTotales} arts/mes
              </div>
            </div>
          );
        })}
      </div>

      {tabVista === 'comparativa' ? (
        /* TABLA COMPARATIVA DE LOS 4 ESCENARIOS */
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Rubro Financiero (Mensual)</th>
                <th className="py-2.5 px-3 text-right text-rose-300">Mes Bajo (≤10 arts/d)</th>
                <th className="py-2.5 px-3 text-right text-emerald-300">Mes Medio</th>
                <th className="py-2.5 px-3 text-right text-teal-300 font-bold bg-teal-500/10 rounded-t-lg">
                  Mes Alto ($20k Libres)
                </th>
                <th className="py-2.5 px-3 text-right text-cyan-300">Mes Muy Alto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Artículos Vendidos (Mes / Día)</td>
                <td className="py-2.5 px-3 text-right text-slate-300">{bajo?.articulosMes} ({bajo?.articulosDia}/día)</td>
                <td className="py-2.5 px-3 text-right text-slate-300">{medio?.articulosMes} ({medio?.articulosDia}/día)</td>
                <td className="py-2.5 px-3 text-right text-teal-300 font-bold bg-teal-500/5">{alto?.articulosMes} ({alto?.articulosDia}/día)</td>
                <td className="py-2.5 px-3 text-right text-slate-300">{muy_alto?.articulosMes} ({muy_alto?.articulosDia}/día)</td>
              </tr>
              <tr className="bg-slate-950/40 font-semibold">
                <td className="py-2.5 px-3 text-white font-sans">(+) Ingresos Brutos Totales</td>
                <td className="py-2.5 px-3 text-right text-slate-200">${Math.round(bajo?.pnl.ingresosBrutos || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-slate-200">${Math.round(medio?.pnl.ingresosBrutos || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-teal-300 font-bold bg-teal-500/5">${Math.round(alto?.pnl.ingresosBrutos || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-slate-200">${Math.round(muy_alto?.pnl.ingresosBrutos || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400 font-sans pl-6">(-) Costo de Materias Primas</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(bajo?.pnl.costoMaterialesTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(medio?.pnl.costoMaterialesTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-300 bg-teal-500/5">-${Math.round(alto?.pnl.costoMaterialesTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(muy_alto?.pnl.costoMaterialesTotal || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400 font-sans pl-6">(-) Mano de Obra Directa</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(bajo?.pnl.costoManoObraTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(medio?.pnl.costoManoObraTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-300 bg-teal-500/5">-${Math.round(alto?.pnl.costoManoObraTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(muy_alto?.pnl.costoManoObraTotal || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400 font-sans pl-6">(-) Luz Directa de Proceso</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(bajo?.pnl.costoLuzProcesoTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(medio?.pnl.costoLuzProcesoTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-300 bg-teal-500/5">-${Math.round(alto?.pnl.costoLuzProcesoTotal || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(muy_alto?.pnl.costoLuzProcesoTotal || 0).toLocaleString()}</td>
              </tr>
              <tr className="bg-slate-950/60 font-semibold text-emerald-300">
                <td className="py-2.5 px-3 font-sans">(=) Utilidad Bruta (% Margen)</td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  ${Math.round(bajo?.pnl.utilidadBruta || 0).toLocaleString()} ({bajo?.pnl.margenBrutoPct.toFixed(0)}%)
                </td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  ${Math.round(medio?.pnl.utilidadBruta || 0).toLocaleString()} ({medio?.pnl.margenBrutoPct.toFixed(0)}%)
                </td>
                <td className="py-2.5 px-3 text-right text-teal-300 font-bold bg-teal-500/5">
                  ${Math.round(alto?.pnl.utilidadBruta || 0).toLocaleString()} ({alto?.pnl.margenBrutoPct.toFixed(0)}%)
                </td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  ${Math.round(muy_alto?.pnl.utilidadBruta || 0).toLocaleString()} ({muy_alto?.pnl.margenBrutoPct.toFixed(0)}%)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400 font-sans pl-6">(-) Renta Prorrateada (con 16% IVA)</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.rentaConIva || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.rentaConIva || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-300 bg-teal-500/5">-${Math.round(costosFijosDetalle?.rentaConIva || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.rentaConIva || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400 font-sans pl-6">(-) Recibo de Agua Mensual</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.aguaMensual || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.aguaMensual || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-300 bg-teal-500/5">-${Math.round(costosFijosDetalle?.aguaMensual || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.aguaMensual || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400 font-sans pl-6">(-) Recibo de Luz CFE (Inmueble/Clima)</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.luzMensual || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.luzMensual || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-300 bg-teal-500/5">-${Math.round(costosFijosDetalle?.luzMensual || 0).toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.luzMensual || 0).toLocaleString()}</td>
              </tr>
              {costosFijosDetalle?.sueldosFijosExtras > 0 && (
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans pl-6">(-) Sueldos Fijos Extras</td>
                  <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.sueldosFijosExtras).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.sueldosFijosExtras).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-slate-300 bg-teal-500/5">-${Math.round(costosFijosDetalle?.sueldosFijosExtras).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-slate-400">-${Math.round(costosFijosDetalle?.sueldosFijosExtras).toLocaleString()}</td>
                </tr>
              )}
              <tr className="bg-slate-950/80 font-bold text-sm">
                <td className="py-3 px-3 text-white font-sans flex items-center gap-1.5">
                  <DollarSign size={16} className="text-teal-400" />
                  (=) UTILIDAD NETA LIBRE
                </td>
                <td className={`py-3 px-3 text-right ${
                  (bajo?.pnl.utilidadNeta || 0) >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  ${Math.round(bajo?.pnl.utilidadNeta || 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-emerald-400">
                  +${Math.round(medio?.pnl.utilidadNeta || 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-teal-300 bg-teal-500/10 rounded-b-lg border-t-2 border-teal-400 text-base">
                  +${Math.round(alto?.pnl.utilidadNeta || 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-cyan-300">
                  +${Math.round(muy_alto?.pnl.utilidadNeta || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* DETALLE DE PRODUCTOS EN EL ESCENARIO ACTIVO */
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Producto / Concepto</th>
                <th className="py-2.5 px-3 text-right">Cant. Mensual</th>
                <th className="py-2.5 px-3 text-right">Precio Venta</th>
                <th className="py-2.5 px-3 text-right">Ingresos</th>
                <th className="py-2.5 px-3 text-right">Costo Variable</th>
                <th className="py-2.5 px-3 text-right text-emerald-300">Margen Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {actual.detallePorProducto.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-sans">
                    <div className="text-white font-medium">{item.nombre}</div>
                    <div className="text-[10px] text-slate-400">{item.categoria}</div>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">{item.cantidad} uds</td>
                  <td className="py-2 px-3 text-right text-slate-300">${item.precioVenta.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-slate-200">${Math.round(item.ingresos).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-rose-300">-${Math.round(item.costoVariableTotal).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-emerald-300 font-semibold">+${Math.round(item.margenBruto).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tarjeta Explicativa de la Meta de $20,000 MXN Libres */}
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-teal-200">
        <Sparkles size={20} className="text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Regla de Negocio Calibrada: </span>
          En el <strong className="text-white">Mes Alto</strong>, el negocio genera ventas para pagar el 100% de la renta prorrateada (${Math.round(costosFijosDetalle?.rentaConIva || 0).toLocaleString()} con IVA), su consumo de agua (${Math.round(costosFijosDetalle?.aguaMensual || 0).toLocaleString()}), su recibo de luz CFE (${Math.round(costosFijosDetalle?.luzMensual || 0).toLocaleString()}) y todos sus costos variables, dejando exactamente <strong className="text-white font-mono">$20,000 MXN libres de ganancia neta</strong> en el bolsillo del negocio.
        </div>
      </div>
    </div>
  );
}
