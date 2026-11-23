import React from 'react';
import {
  TrendingUp,
  Clock,
  Wallet,
  Leaf,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const formatMXN = (val) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(Math.round(val || 0));

export default function PanelRentabilidadSocios({
  simulacion,
  aplicarISR,
  alcanceLabel = 'Edificio Completo'
}) {
  const {
    arquitectura,
    reciboAntesBimMxn,
    reciboDespuesBimMxn,
    ahorroBimestralMxn,
    ahorroMensualMxn,
    ahorroAnualMxn,
    porcentajeAhorroDinero,
    coberturaEnergeticaPct,
    inversionBrutaMxn,
    inversionNetaMxn,
    beneficioFiscalISRMxn,
    roiAnos,
    gananciaNeta25Mxn,
    co2EvitadoAnualKg,
    generacionBimestralKwh,
    consumoBimestralKwh,
    serieAnual
  } = simulacion;

  const roiTexto = roiAnos === null
    ? 'Sin retorno (Solo respaldo)'
    : `${Math.floor(roiAnos)} años ${Math.round((roiAnos % 1) * 12)} meses`;

  // Muestreo de 10 hitos clave en 25 años para gráfica de flujo acumulado
  const hitos = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25]
    .map(y => serieAnual.find(s => s.anio === y))
    .filter(Boolean);
  const maxAbsVal = Math.max(1, ...hitos.map(h => Math.abs(h.acumuladoNeto)));

  const arbolesEquivalentes = Math.round(co2EvitadoAnualKg / 21);

  return (
    <section
      data-testid="solar-rentabilidad-section"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            3. Resumen Ejecutivo para Socios · Dinero, Ahorro y Retorno de Inversión
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Impacto financiero real sobre <strong className="text-slate-200">{alcanceLabel}</strong> con tarifa escalonada CFE.
          </p>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start">
          Cobertura Solar: {coberturaEnergeticaPct}% ({generacionBimestralKwh.toLocaleString('es-MX')} / {consumoBimestralKwh.toLocaleString('es-MX')} kWh bim.)
        </span>
      </div>

      {/* Comparativa Visual Recibo CFE Antes vs Después */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        <div className="md:col-span-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 block">
            Recibo Bimestral CFE ACTUAL
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {formatMXN(reciboAntesBimMxn)}
          </div>
          <span className="text-[11px] text-rose-200/80 block mt-1">
            ~{formatMXN(reciboAntesBimMxn / 2)} / mes · {consumoBimestralKwh.toLocaleString('es-MX')} kWh bim.
          </span>
        </div>

        <div className="md:col-span-1 flex flex-col items-center justify-center text-emerald-400">
          <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
          <span className="text-[10px] font-black mt-0.5">-{porcentajeAhorroDinero.toFixed(0)}%</span>
        </div>

        <div className="md:col-span-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
            NUEVO Recibo Bimestral CFE
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-1">
            {formatMXN(reciboDespuesBimMxn)}
          </div>
          <span className="text-[11px] text-emerald-200/80 block mt-1">
            {arquitectura.id === 'ups_baterias'
              ? 'Igual (UPS no genera luz solar)'
              : arquitectura.id === 'off_grid'
                ? 'Sin contrato con CFE'
                : `~${formatMXN(reciboDespuesBimMxn / 2)} / mes promedio`}
          </span>
        </div>

        <div className="md:col-span-3 bg-teal-500/15 border border-teal-400/40 rounded-xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AHORRO EN EFECTIVO
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatMXN(ahorroAnualMxn)}
            <span className="text-xs font-bold text-teal-300"> / año</span>
          </div>
          <span className="text-[11px] text-teal-200/90 block mt-1">
            {formatMXN(ahorroBimestralMxn)}/bim · {formatMXN(ahorroMensualMxn)}/mes
          </span>
        </div>
      </div>

      {/* 4 KPIs Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Inversión {aplicarISR ? 'Neta (con ISR)' : 'Total (IVA incl.)'}</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white font-mono mt-1.5">
            {formatMXN(inversionNetaMxn)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {aplicarISR
              ? `Bruta ${formatMXN(inversionBrutaMxn)} · Ahorras ${formatMXN(beneficioFiscalISRMxn)} ISR`
              : `Deducible 100% ISR año 1 (te costaría ${formatMXN(inversionBrutaMxn - beneficioFiscalISRMxn)})`}
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Retorno de Inversión</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-black text-teal-300 font-mono mt-1.5">
            {roiTexto}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {roiAnos !== null
              ? 'Después de este punto, la luz que producen es utilidad libre.'
              : 'Su valor está en evitar pérdidas de alimentos y ventas en apagones.'}
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Ganancia Libre a 25 Años</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-xl font-black font-mono mt-1.5 ${gananciaNeta25Mxn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatMXN(gananciaNeta25Mxn)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Descontando la inversión inicial + 4.5% inflación eléctrica anual.
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Impacto Ecológico Anual</span>
            <Leaf className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-xl font-black text-green-300 font-mono mt-1.5">
            {co2EvitadoAnualKg.toLocaleString('es-MX')} kg CO₂
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Equivalente a plantar aprox. <strong className="text-green-300">{arbolesEquivalentes} árboles</strong> cada año.
          </div>
        </div>
      </div>

      {/* Gráfica visual de flujo acumulado a 25 años */}
      {arquitectura.usaPaneles && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-200">
              Evolución del Dinero Recuperado (Años 1 al 25 · Punto de Equilibrio)
            </span>
            <span className="text-[10px] text-slate-400">
              Rojo = Recuperando inversión · Verde = Ganancia neta acumulada
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2 items-end h-36">
            {hitos.map((h) => {
              const isPos = h.acumuladoNeto >= 0;
              const heightPct = Math.max(12, Math.round((Math.abs(h.acumuladoNeto) / maxAbsVal) * 100));
              return (
                <div key={h.anio} className="flex flex-col items-center justify-end h-full gap-1">
                  <span className={`text-[9px] font-mono font-bold ${isPos ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {h.acumuladoNeto >= 1000000
                      ? `$${(h.acumuladoNeto / 1000000).toFixed(1)}M`
                      : `$${Math.round(h.acumuladoNeto / 1000)}k`}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isPos
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gradient-to-t from-rose-700 to-rose-500'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">A{h.anio}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
