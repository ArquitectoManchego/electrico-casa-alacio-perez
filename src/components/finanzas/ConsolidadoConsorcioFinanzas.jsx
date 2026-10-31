import React from 'react';
import { 
  Building2, 
  Droplet, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { SUPERFICIE_INMUEBLE } from '../../utils/costosFijosInmueble.js';

export default function ConsolidadoConsorcioFinanzas({
  consolidadoData = [],
  totalesConsorcio = {},
  escenarioConsorcio = 'alto',
  onSelectEscenarioConsorcio,
  onVerDetalleNegocio
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-teal-400" size={22} />
            <h3 className="text-base font-bold text-white font-display">
              Consolidado Financiero Corporativo &middot; Casa Alacio Pérez
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
              7 Unidades de Negocio
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Visión integral del inmueble (299.40 m² totales). Renta $10,440 MXN con IVA ($9,000 + 16% IVA), Agua $1,000 MXN y 6 medidores CFE.
          </p>
        </div>

        {/* Selector de Escenario Consorcio */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'bajo', label: 'Mes Bajo' },
            { id: 'medio', label: 'Mes Medio' },
            { id: 'alto', label: 'Mes Alto ($20k c/u)' },
            { id: 'muy_alto', label: 'Mes Muy Alto' }
          ].map(esc => (
            <button
              key={esc.id}
              onClick={() => onSelectEscenarioConsorcio(esc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                escenarioConsorcio === esc.id
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {esc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de Totales Inmobiliarios y Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Renta Inmueble Total */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Building2 size={13} className="text-teal-400" />
              Renta Inmueble Total
            </span>
            <span className="text-emerald-400 font-bold">100% OK</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ${SUPERFICIE_INMUEBLE.rentaMensualConIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            $9,000.00 base + $1,440.00 IVA (16%) &middot; 299.40 m² totales ($34.87/m² con IVA)
          </p>
        </div>

        {/* Card 2: Agua Total */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Droplet size={13} className="text-cyan-400" />
              Recibo de Agua Total
            </span>
            <span className="text-cyan-400 font-bold">100% OK</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ${SUPERFICIE_INMUEBLE.reciboAguaMensualTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Prorrateado por baños y tarja (Hawaiian 50%, Costura 15%, etc.)
          </p>
        </div>

        {/* Card 3: Ingresos Brutos Consorcio */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-amber-400" />
              Ingresos Brutos Consorcio
            </span>
            <span className="text-amber-400 font-bold uppercase">{escenarioConsorcio}</span>
          </div>
          <div className="text-lg font-bold text-teal-300 font-mono">
            ${Math.round(totalesConsorcio.ingresosBrutosTotales || 0).toLocaleString('es-MX')}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Ventas combinadas de los 7 negocios en este escenario
          </p>
        </div>

        {/* Card 4: Utilidad Neta Consorcio */}
        <div className="bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/40 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-teal-300 text-[10px] font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <DollarSign size={13} />
              Utilidad Neta Consolidada
            </span>
            <span className="text-teal-300 font-bold">LIBRE</span>
          </div>
          <div className="text-xl font-bold text-teal-300 font-mono">
            +${Math.round(totalesConsorcio.utilidadNetaTotal || 0).toLocaleString('es-MX')}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Ganancia libre mensual tras cubrir renta, agua, CFE y todos los costos
          </p>
        </div>
      </div>

      {/* Tabla Desglosada por Unidad de Negocio */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
              <th className="py-2.5 px-3">Unidad de Negocio</th>
              <th className="py-2.5 px-3 text-right">Área Imputada</th>
              <th className="py-2.5 px-3 text-right">Renta con IVA</th>
              <th className="py-2.5 px-3 text-right">Agua</th>
              <th className="py-2.5 px-3 text-right">Luz CFE</th>
              <th className="py-2.5 px-3 text-right text-cyan-300">Nómina + IMSS</th>
              <th className="py-2.5 px-3 text-right">Gastos Fijos</th>
              <th className="py-2.5 px-3 text-right text-slate-200">Ingresos</th>
              <th className="py-2.5 px-3 text-right text-emerald-300">Margen Bruto</th>
              <th className="py-2.5 px-3 text-right text-teal-300 font-bold">Utilidad Neta</th>
              <th className="py-2.5 px-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {consolidadoData.map((row) => (
              <tr key={row.negocioId} className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans">
                  <div className="font-bold text-white">{row.nombre}</div>
                  <div className="text-[10px] text-slate-400">{row.medidor} &middot; {row.nivel}</div>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  {row.areaM2.toFixed(2)} m²
                  <div className="text-[9px] text-slate-500">({row.areaPct.toFixed(1)}%)</div>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  ${row.rentaConIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  ${row.agua.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  ${Math.round(row.luz).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-cyan-300">
                  ${Math.round(row.nominaTotal || 0).toLocaleString()}
                  <div className="text-[9px] text-slate-500">{row.empleadosCount || 0} emp.</div>
                </td>
                <td className="py-2.5 px-3 text-right font-medium text-amber-300">
                  ${Math.round(row.gastosFijos).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  ${Math.round(row.ingresos).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-300">
                  +${Math.round(row.utilidadBruta).toLocaleString()}
                </td>
                <td className={`py-2.5 px-3 text-right font-bold ${
                  row.utilidadNeta >= 0 ? 'text-teal-300' : 'text-rose-400'
                }`}>
                  {row.utilidadNeta >= 0 ? '+' : ''}${Math.round(row.utilidadNeta).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={() => onVerDetalleNegocio(row.negocioId)}
                    className="p-1 rounded text-teal-400 hover:text-teal-200 hover:bg-teal-500/10 transition cursor-pointer"
                    title={`Ver detalle financiero de ${row.nombre}`}
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-700 bg-slate-950/80 font-mono font-bold text-xs text-white">
              <td className="py-3 px-3 font-sans">TOTALES CONSORCIO</td>
              <td className="py-3 px-3 text-right text-slate-300">{SUPERFICIE_INMUEBLE.superficieTotalConstruidaM2} m² (100%)</td>
              <td className="py-3 px-3 text-right text-teal-300">${SUPERFICIE_INMUEBLE.rentaMensualConIva.toFixed(2)}</td>
              <td className="py-3 px-3 text-right text-cyan-300">${SUPERFICIE_INMUEBLE.reciboAguaMensualTotal.toFixed(2)}</td>
              <td className="py-3 px-3 text-right text-slate-300">${Math.round(totalesConsorcio.luzTotal || 0).toLocaleString()}</td>
              <td className="py-3 px-3 text-right text-cyan-300">${Math.round(totalesConsorcio.nominaTotal || 0).toLocaleString()}</td>
              <td className="py-3 px-3 text-right text-amber-300">${Math.round(totalesConsorcio.gastosFijosTotales || 0).toLocaleString()}</td>
              <td className="py-3 px-3 text-right text-slate-200">${Math.round(totalesConsorcio.ingresosBrutosTotales || 0).toLocaleString()}</td>
              <td className="py-3 px-3 text-right text-emerald-300">+${Math.round(totalesConsorcio.utilidadBrutaTotal || 0).toLocaleString()}</td>
              <td className="py-3 px-3 text-right text-teal-300 text-sm">
                +${Math.round(totalesConsorcio.utilidadNetaTotal || 0).toLocaleString()}
              </td>
              <td className="py-3 px-3 text-center">
                <CheckCircle2 size={16} className="text-teal-400 inline" />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Nota Explicativa */}
      <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>* El excedente de áreas comunes (escaleras, pasillos y vacíos que suman 42.24 m²) está absorbido íntegramente por Oficinas Corporativo según las directrices establecidas.</span>
        <span className="text-teal-400 font-mono font-semibold">Consorcio Gallegos González</span>
      </div>
    </div>
  );
}
