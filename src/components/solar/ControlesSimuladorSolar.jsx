import React from 'react';
import {
  DollarSign,
  Zap,
  BatteryCharging,
  Sun,
  Receipt,
  Sparkles,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { PARAMETROS_MERCADO_SOLAR } from '../../data/cotizacionesSolares';

const formatMXN = (val) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(Math.round(val || 0));

export default function ControlesSimuladorSolar({
  arquitectura,
  simulacion,
  autonomia,
  escenariosConsumo,
  escenarioConsumoId,
  onSelectEscenarioConsumo,
  kwhMesConsumo,
  onChangeKwhMes,
  presupuestoSliderMxn,
  onChangePresupuesto,
  cantidadPaneles,
  onChangeCantidadPaneles,
  bateriaKwh,
  onChangeBateriaKwh,
  aplicarISR,
  onToggleISR,
  azoteaDisponibleM2,
  onChangeAzoteaM2,
  cotizacionActiva,
  onLimpiarCotizacion
}) {
  return (
    <section
      data-testid="solar-controles-section"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            2. Simulador Interactivo de Inversión, Consumo y Baterías
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mueve las barras para ajustar tu presupuesto, simular tus temporadas de venta o sumar baterías de respaldo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cotizacionActiva && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] font-bold">
              <span>Cotización activa: {cotizacionActiva.proveedor}</span>
              <button
                type="button"
                data-testid="solar-limpiar-cotizacion-btn"
                aria-label="Volver a modo simulador libre"
                onClick={onLimpiarCotizacion}
                className="ml-1 text-amber-300 hover:text-white underline cursor-pointer"
              >
                Liberar
              </button>
            </div>
          )}

          <button
            type="button"
            data-testid="solar-toggle-isr-btn"
            aria-label="Activar o desactivar beneficio fiscal deducible ISR"
            onClick={onToggleISR}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              aplicarISR
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            {aplicarISR ? 'Deducción ISR 100% ACTIVA (-30%)' : 'Aplicar Deducción Fiscal ISR (-30%)'}
          </button>
        </div>
      </div>

      {/* Selector rápido de Escenarios de Venta del Consorcio */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            Escenarios de Venta del Edificio (Consumo Real Calculado):
          </span>
          <span className="text-[11px] text-teal-400 font-bold">
            {kwhMesConsumo.toLocaleString('es-MX')} kWh/mes · {(kwhMesConsumo * 2).toLocaleString('es-MX')} kWh/bimestre
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {escenariosConsumo.map((esc) => {
            const active = escenarioConsumoId === esc.id;
            return (
              <button
                key={esc.id}
                type="button"
                data-testid={`solar-escenario-venta-${esc.id}-btn`}
                aria-label={`Aplicar escenario de consumo ${esc.nombre}`}
                onClick={() => onSelectEscenarioConsumo(esc)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  active
                    ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-sm shadow-teal-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div>{esc.nombre}</div>
                <div className="text-[9px] opacity-75 font-mono">{esc.kwhMes.toLocaleString('es-MX')} kWh/m</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LAS 3 BARRAS INTERACTIVAS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SLIDER 1: PRESUPUESTO A INVERTIR */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                Presupuesto a Invertir
              </span>
              <span className="text-sm font-black text-white font-mono">
                {formatMXN(simulacion.inversionNetaMxn)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mueve para definir cuánto quieres gastar: el plan ajustará los paneles y baterías que te alcanzan.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={30000}
              max={480000}
              step={5000}
              value={Math.min(480000, Math.max(30000, presupuestoSliderMxn))}
              data-testid="solar-presupuesto-slider"
              aria-label="Barra de presupuesto a invertir en pesos mexicanos"
              onChange={(e) => onChangePresupuesto(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$30,000</span>
              <span>$150,000</span>
              <span>$300,000</span>
              <span>$480,000</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Plan alcanzable:</span>
              <span className="font-bold text-white">
                {arquitectura.usaPaneles ? `${simulacion.panelesEfectivos} paneles (${simulacion.potenciaKwp} kWp)` : 'Solo respaldo'}
                {simulacion.bateriaEfectiva > 0 ? ` + ${simulacion.bateriaEfectiva} kWh bat.` : ''}
              </span>
            </div>
            {aplicarISR && (
              <div className="flex justify-between text-emerald-400">
                <span>Factura bruta / Ahorro ISR:</span>
                <span className="font-mono font-bold">
                  {formatMXN(simulacion.inversionBrutaMxn)} (-{formatMXN(simulacion.beneficioFiscalISRMxn)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SLIDER 2: CONSUMO ELÉCTRICO (kW / kWh) Y PANELES */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                Consumo Mensual (kWh / kW)
              </span>
              <span className="text-sm font-black text-white font-mono">
                {kwhMesConsumo.toLocaleString('es-MX')} kWh
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sube o baja el consumo del negocio para calcular cuántos paneles solares necesitas para cubrirlo.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={200}
              max={5000}
              step={50}
              value={Math.min(5000, Math.max(200, kwhMesConsumo))}
              data-testid="solar-consumo-slider"
              aria-label="Barra de consumo mensual objetivo en kilowatt hora"
              onChange={(e) => onChangeKwhMes(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>200 kWh</span>
              <span>1,500 kWh</span>
              <span>3,000 kWh</span>
              <span>5,000 kWh</span>
            </div>
          </div>

          {/* Ajuste manual rápido de paneles y área de techo */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Paneles ({simulacion.wattsPorPanel}W):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid="solar-paneles-menos-btn"
                  aria-label="Disminuir paneles"
                  disabled={!arquitectura.usaPaneles || cantidadPaneles <= 2}
                  onClick={() => onChangeCantidadPaneles(Math.max(2, cantidadPaneles - 2))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black cursor-pointer"
                >
                  −
                </button>
                <span className="font-mono font-black text-white min-w-[2.2rem] text-center">
                  {simulacion.panelesEfectivos}
                </span>
                <button
                  type="button"
                  data-testid="solar-paneles-mas-btn"
                  aria-label="Aumentar paneles"
                  disabled={!arquitectura.usaPaneles || cantidadPaneles >= 64}
                  onClick={() => onChangeCantidadPaneles(Math.min(64, cantidadPaneles + 2))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black cursor-pointer"
                >
                  +
                </button>
                {arquitectura.usaPaneles && (
                  <button
                    type="button"
                    data-testid="solar-paneles-auto100-btn"
                    onClick={() => onChangeCantidadPaneles(simulacion.panelesIdeal100)}
                    className="ml-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold cursor-pointer"
                    title="Calcular paneles exactos para cubrir el 100% de este consumo"
                  >
                    100% ({simulacion.panelesIdeal100}p)
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-slate-400" />
                Techo req. / disp.:
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`font-mono font-bold ${simulacion.excedeAzotea ? 'text-rose-400' : 'text-slate-200'}`}>
                  {simulacion.areaRequeridaM2} m²
                </span>
                <span className="text-slate-500">/</span>
                <input
                  type="number"
                  min={20}
                  max={500}
                  value={azoteaDisponibleM2}
                  data-testid="solar-azotea-m2-input"
                  aria-label="Metros cuadrados de azotea disponibles"
                  onChange={(e) => onChangeAzoteaM2(Math.max(20, Number(e.target.value) || 120))}
                  className="w-14 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-right text-[11px]"
                />
                <span className="text-slate-400">m²</span>
              </div>
            </div>

            {simulacion.excedeAzotea && (
              <div className="text-[10px] text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Supera tu azotea disponible ({azoteaDisponibleM2} m²). Considera paneles de 730W o crecer por fases.
              </div>
            )}
          </div>
        </div>

        {/* SLIDER 3: ALMACENAMIENTO DE ENERGÍA (BATERÍAS LiFePO4) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                <BatteryCharging className="w-4 h-4" />
                Baterías de Respaldo
              </span>
              <span className="text-sm font-black text-white font-mono">
                {simulacion.bateriaEfectiva} kWh
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sube los kWh en módulos LiFePO4 (5 kWh c/u) para ver cuántos equipos sostienes en apagón y por cuántas horas.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={bateriaKwh}
              data-testid="solar-baterias-slider"
              aria-label="Barra de almacenamiento de energía en baterías en kilowatt hora"
              onChange={(e) => onChangeBateriaKwh(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 kWh</span>
              <span>10 kWh</span>
              <span>20 kWh</span>
              <span>40 kWh</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
            {arquitectura.usaBaterias && simulacion.bateriaEfectiva > 0 ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Respaldo nocturno ({autonomia.cantidadEquipos} eq.):</span>
                  <span className="font-black text-cyan-300 font-mono">
                    {autonomia.horasNoche.toFixed(1)} hrs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Módulos LiFePO4 (5 kWh):</span>
                  <span className="font-bold text-slate-200">
                    {simulacion.numModulosBat} × {formatMXN(PARAMETROS_MERCADO_SOLAR.costoBateriaPor5KwhMxn)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                Sin baterías (0 kWh). Si mueves esta barra hacia arriba, activaremos automáticamente el modo <strong>Híbrido con Respaldo</strong>.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
