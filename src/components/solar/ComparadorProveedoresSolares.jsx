import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { simularSistemaSolarCompleto } from '../../utils/motorSolar';

const formatMXN = (val) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(Math.round(val || 0));

export default function ComparadorProveedoresSolares({
  cotizaciones = [],
  cotizacionActivaId,
  onSimularCotizacion,
  onAbrirModalNueva,
  onEliminarCotizacionCustom,
  kwhMesConsumo,
  aplicarISR,
  tarifas,
  costosMEM
}) {
  // Permite elegir paquete de 4..20 paneles en Grupo Arreozola y pago contado en Solarec
  const [arreozolaPaneles, setArreozolaPaneles] = useState(8);
  const [solarecContado, setSolarecContado] = useState(true);

  const resolverCotizacionEfectiva = (cot) => {
    if (cot.id === 'grupo_arreozola' && Array.isArray(cot.paquetesDisponibles)) {
      const paq = cot.paquetesDisponibles.find(p => p.paneles === arreozolaPaneles) || cot.paquetesDisponibles[2];
      return {
        ...cot,
        cantidadPaneles: paq.paneles,
        potenciaKwp: paq.kwp,
        precioListaMxn: paq.precioMxn,
        precioContadoMxn: paq.precioMxn,
        produccionPrometidaBimKwh: Math.round((paq.prodBimMin + paq.prodBimMax) / 2)
      };
    }
    if (cot.id === 'solarec_730w') {
      return {
        ...cot,
        precioEfectivoMxn: solarecContado ? cot.precioContadoMxn : cot.precioListaMxn
      };
    }
    return {
      ...cot,
      precioEfectivoMxn: cot.precioContadoMxn
    };
  };

  const cotizacionesEvaluadas = cotizaciones.map((raw) => {
    const cot = resolverCotizacionEfectiva(raw);
    const precioFinal = cot.precioEfectivoMxn || cot.precioContadoMxn || cot.precioListaMxn;
    const sim = simularSistemaSolarCompleto({
      arquitecturaId: cot.arquitectura || 'on_grid',
      kwhMesConsumo,
      cantidadPaneles: cot.cantidadPaneles,
      wattsPorPanel: cot.wattsPorPanel,
      bateriaKwh: cot.bateriaKwh || 0,
      precioBasePanelesOverride: precioFinal,
      aplicarISR,
      tarifas,
      costosMEM
    });
    const costoWp = cot.potenciaKwp > 0 ? precioFinal / (cot.potenciaKwp * 1000) : 0;
    return { cot, precioFinal, sim, costoWp };
  });

  const mejorCostoWp = Math.min(
    ...cotizacionesEvaluadas.filter(x => x.costoWp > 0).map(x => x.costoWp)
  );

  return (
    <section
      data-testid="solar-comparador-proveedores-section"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            5. Comparador de Cotizaciones Reales de WhatsApp (Simula Cada Proveedor)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Todos los cálculos de ahorro y retorno se recalculan con <strong>tu consumo actual ({kwhMesConsumo.toLocaleString('es-MX')} kWh/mes)</strong> en Veracruz, sin depender de las promesas genéricas de cada vendedor.
          </p>
        </div>

        <button
          type="button"
          data-testid="solar-agregar-cotizacion-btn"
          onClick={onAbrirModalNueva}
          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center gap-1.5 self-start cursor-pointer shadow-lg shadow-teal-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Cotización Propia
        </button>
      </div>

      {/* Tarjetas de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cotizacionesEvaluadas.map(({ cot, precioFinal, sim, costoWp }) => {
          const isSelected = cotizacionActivaId === cot.id;
          const isBestPrice = costoWp > 0 && Math.abs(costoWp - mejorCostoWp) < 0.05;

          return (
            <div
              key={cot.id}
              data-testid={`solar-proveedor-card-${cot.id}`}
              className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/25'
                  : 'border-slate-800 bg-slate-950/75 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header del proveedor */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-sm font-black text-white">{cot.proveedor}</h4>
                      {isBestPrice && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          🏆 Mejor $/Watt
                        </span>
                      )}
                      {cot.destacadoBadge && !isBestPrice && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {cot.destacadoBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cot.vendedor}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-emerald-300 font-mono">
                      {formatMXN(aplicarISR ? sim.inversionNetaMxn : precioFinal)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {costoWp > 0 ? `$${costoWp.toFixed(2)} / Wp` : 'Solo respaldo'}
                      {aplicarISR ? ' (neto ISR)' : ' IVA incl.'}
                    </div>
                  </div>
                </div>

                {/* Controles especiales por proveedor (Arreozola tallas / Solarec contado) */}
                {cot.id === 'grupo_arreozola' && Array.isArray(cot.paquetesDisponibles) && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                      Elige paquete de la tabla de Grupo Arreozola:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cot.paquetesDisponibles.map(p => (
                        <button
                          key={p.paneles}
                          type="button"
                          data-testid={`solar-arreozola-paq-${p.paneles}-btn`}
                          onClick={() => setArreozolaPaneles(p.paneles)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border cursor-pointer transition-all ${
                            arreozolaPaneles === p.paneles
                              ? 'bg-sky-500/25 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p.paneles}p ({formatMXN(p.precioMxn)})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cot.id === 'solarec_730w' && (
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-[11px]">
                    <span className="text-slate-400 font-bold">Modalidad Solarec:</span>
                    <button
                      type="button"
                      data-testid="solar-solarec-contado-btn"
                      onClick={() => setSolarecContado(true)}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        solarecContado ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50' : 'text-slate-400'
                      }`}
                    >
                      Contado -5% ($84,170)
                    </button>
                    <button
                      type="button"
                      data-testid="solar-solarec-lista-btn"
                      onClick={() => setSolarecContado(false)}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        !solarecContado ? 'bg-slate-700 text-white' : 'text-slate-400'
                      }`}
                    >
                      Lista ($88,600)
                    </button>
                  </div>
                )}

                {/* Especificaciones técnicas y financieras reales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/70 rounded-xl p-2.5 border border-slate-800/80">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Capacidad</span>
                    <span className="font-black text-white font-mono">
                      {cot.cantidadPaneles}×{cot.wattsPorPanel}W ({cot.potenciaKwp} kWp)
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Gen. Real Bim.</span>
                    <span className="font-black text-amber-300 font-mono">
                      {sim.generacionBimestralKwh.toLocaleString('es-MX')} kWh
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Ahorro Bim.</span>
                    <span className="font-black text-emerald-400 font-mono">
                      {formatMXN(sim.ahorroBimestralMxn)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">ROI Real</span>
                    <span className="font-black text-teal-300 font-mono">
                      {sim.roiAnos ? `${sim.roiAnos} años` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div><strong className="text-slate-400">Equipos:</strong> {cot.modeloPanel} · {cot.modeloInversor}</div>
                  <div><strong className="text-slate-400">Pago:</strong> {cot.condicionesPago} · <strong className="text-slate-400">Trámite CFE:</strong> {cot.incluyeTramiteCFE ? '✅ Incluido' : '⚠️ Confirmar'}</div>
                </div>

                {/* Notas de auditoría honesta */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  {cot.notasAuditoria.map((nota, idx) => {
                    const esAlerta = nota.toUpperCase().includes('ALERTA') || nota.toUpperCase().includes('ERROR');
                    return (
                      <div
                        key={idx}
                        className={`text-[10.5px] leading-snug flex items-start gap-1.5 ${
                          esAlerta ? 'text-amber-300' : 'text-slate-400'
                        }`}
                      >
                        {esAlerta
                          ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                        <span>{nota}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  data-testid={`solar-simular-proveedor-${cot.id}-btn`}
                  onClick={() => onSimularCotizacion({ ...cot, precioEfectivoMxn: precioFinal })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-teal-600 text-white'
                  }`}
                >
                  {isSelected ? <FileCheck2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {isSelected ? 'Simulando esta Cotización' : 'Cargar y Simular este Escenario'}
                </button>

                {!cot.esOficialWhatsApp && (
                  <button
                    type="button"
                    data-testid={`solar-eliminar-cotizacion-${cot.id}-btn`}
                    aria-label={`Eliminar cotización ${cot.proveedor}`}
                    onClick={() => onEliminarCotizacionCustom(cot.id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla Resumen Semáforo para Junta de Socios */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-2.5 px-3">Proveedor</th>
              <th className="py-2.5 px-3">Paneles / kWp</th>
              <th className="py-2.5 px-3">Inversor</th>
              <th className="py-2.5 px-3 text-right">Precio Final</th>
              <th className="py-2.5 px-3 text-right">$/Watt</th>
              <th className="py-2.5 px-3 text-right">Ahorro Anual</th>
              <th className="py-2.5 px-3 text-right">Retorno (ROI)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
            {cotizacionesEvaluadas.map(({ cot, precioFinal, sim, costoWp }) => (
              <tr
                key={cot.id}
                className={cotizacionActivaId === cot.id ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'}
              >
                <td className="py-2.5 px-3 font-bold text-white">{cot.proveedor}</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">
                  {cot.cantidadPaneles}p · {cot.potenciaKwp} kWp
                </td>
                <td className="py-2.5 px-3 text-slate-300">{cot.tipoInversor}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                  {formatMXN(aplicarISR ? sim.inversionNetaMxn : precioFinal)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                  {costoWp > 0 ? `$${costoWp.toFixed(2)}` : '—'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-300">
                  {formatMXN(sim.ahorroAnualMxn)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                  {sim.roiAnos ? `${sim.roiAnos} años` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
