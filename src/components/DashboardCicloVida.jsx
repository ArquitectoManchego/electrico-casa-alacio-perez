import React, { useState, useEffect } from 'react';
import { DollarSign, Check, Scale, Award, Info, AlertCircle, TrendingDown } from 'lucide-react';

// Catálogo de modelos preestablecidos
const MODELOS_CATALOGO = [
  {
    id: 'modelo_a',
    nombre: 'Modelo Bistro Standard',
    tag: 'Bistro',
    capex: 32000,
    mantenimiento: 4500,
    vidaUtil: 5,
    eficiencia: 1.3,
    descripcion: 'Compresor convencional económico. Costo inicial bajo pero alto consumo eléctrico y mantenimiento frecuente.'
  },
  {
    id: 'modelo_b',
    nombre: 'Modelo Eco-Inverter Premium',
    tag: 'Eco',
    capex: 58000,
    mantenimiento: 1200,
    vidaUtil: 10,
    eficiencia: 0.75,
    descripcion: 'Tecnología inverter de alta eficiencia. Ahorro de energía del 25% y bajo desgaste de componentes.'
  },
  {
    id: 'modelo_c',
    nombre: 'Modelo Smart-Grid Ultra',
    tag: 'Smart',
    capex: 75000,
    mantenimiento: 800,
    vidaUtil: 12,
    eficiencia: 0.60,
    descripcion: 'Máxima eficiencia con tecnología IoT. Ahorro de luz del 40% y vida útil extendida.'
  }
];

export default function DashboardCicloVida({ defaultKwhDiario = 5.2, defaultCostoKwh = 3.80 }) {
  // Parámetros dinámicos para el análisis CapEx/OpEx
  const [kwhDiario, setKwhDiario] = useState(defaultKwhDiario);
  const [costoKwh, setCostoKwh] = useState(defaultCostoKwh);

  // Modelos seleccionados en el Modo Versus (por defecto Modelo A y Modelo B)
  const [selectedIds, setSelectedIds] = useState(['modelo_a', 'modelo_b']);

  // Sincronizar con cambios heredados pero permitir edición local
  useEffect(() => {
    if (defaultKwhDiario > 0) setKwhDiario(defaultKwhDiario);
  }, [defaultKwhDiario]);

  useEffect(() => {
    if (defaultCostoKwh > 0) setCostoKwh(defaultCostoKwh);
  }, [defaultCostoKwh]);

  // Costo eléctrico anual base
  const costoLuzAnualBase = kwhDiario * 365 * costoKwh;

  // Calcular TCO y Gasto Anual para cada modelo
  const modelosCalculados = MODELOS_CATALOGO.map(m => {
    const costoLuzAnual = costoLuzAnualBase * m.eficiencia;
    const tco = m.capex + (m.mantenimiento * m.vidaUtil) + (costoLuzAnual * m.vidaUtil);
    const gastoAnual = tco / m.vidaUtil;

    return {
      ...m,
      costoLuzAnual,
      tco,
      gastoAnual
    };
  });

  // Encontrar el ID del modelo más rentable entre los SELECCIONADOS en el Versus
  let masRentableId = null;
  const modelosSeleccionados = modelosCalculados.filter(m => selectedIds.includes(m.id));

  if (modelosSeleccionados.length > 0) {
    let minGasto = Infinity;
    modelosSeleccionados.forEach(m => {
      if (m.gastoAnual < minGasto) {
        minGasto = m.gastoAnual;
        masRentableId = m.id;
      }
    });
  }

  const handleToggleVersus = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Caja de Mandos / Parámetros del Simulador */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.04),transparent_50%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Scale size={16} className="text-teal-400" />
              Parámetros de Simulación CapEx vs OpEx
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Modifica la potencia de consumo del equipo y el costo unitario de CFE para ver el impacto financiero anual.
            </p>
          </div>

          {/* Controles de Entrada */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* kWh/día */}
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl min-w-[150px]">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Consumo Diario
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={kwhDiario}
                  onChange={(e) => setKwhDiario(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent border-none text-white text-lg font-bold p-0 focus:ring-0"
                />
                <span className="text-xs font-semibold text-teal-400 font-sans">kWh / día</span>
              </div>
            </div>

            {/* Costo CFE */}
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl min-w-[150px]">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tarifa CFE Promedio
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold text-lg">$</span>
                <input
                  type="number"
                  step="0.05"
                  value={costoKwh}
                  onChange={(e) => setCostoKwh(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent border-none text-white text-lg font-bold p-0 focus:ring-0"
                />
                <span className="text-xs font-semibold text-emerald-400 font-sans">MXN / kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Costo Luz Anual Base Info */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span className="flex items-center gap-1 font-medium">
            <TrendingDown size={14} className="text-emerald-500" />
            Costo Eléctrico Anual base (100% carga): ${costoLuzAnualBase.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
          </span>
          <span className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Info size={13} className="text-teal-400" />
            Modo Versus: Compara amortizaciones e identifica ahorros a largo plazo
          </span>
        </div>
      </div>

      {/* Grid de Tarjetas de Producto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modelosCalculados.map((m) => {
          const isSelectedInVersus = selectedIds.includes(m.id);
          const isBestOption = masRentableId === m.id && isSelectedInVersus;
          
          return (
            <div
              key={m.id}
              className={`glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between border ${
                isBestOption 
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 bg-emerald-950/15' 
                  : isSelectedInVersus 
                    ? 'border-slate-700/80 bg-slate-900/10'
                    : 'border-slate-800/50 bg-slate-950/20 opacity-70'
              }`}
            >
              {/* Recomendación Badge */}
              {isBestOption && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 hover:scale-105 transition-transform duration-200">
                  <Award size={12} className="fill-current" />
                  Opción Más Rentable
                </div>
              )}

              <div>
                {/* Header */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 uppercase">
                    Modelo: {m.tag}
                  </span>
                  <h4 className="text-lg font-bold text-white font-display mt-2">{m.nombre}</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{m.descripcion}</p>
                </div>

                {/* Parámetros */}
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-800/60 mb-4 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">CapEx (Inicial)</span>
                    <span className="font-bold text-white">${m.capex.toLocaleString()} MXN</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Mant. Anual</span>
                    <span className="font-bold text-slate-300">${m.mantenimiento.toLocaleString()} MXN</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Vida Útil</span>
                    <span className="font-bold text-slate-300">{m.vidaUtil} años</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Eficiencia (F)</span>
                    <span className={`font-bold ${m.eficiencia < 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Math.round((m.eficiencia - 1) * 100) > 0 
                        ? `+${Math.round((m.eficiencia - 1) * 100)}%` 
                        : `${Math.round((m.eficiencia - 1) * 100)}%`}
                    </span>
                  </div>
                </div>

                {/* Cálculos Financieros del Ciclo */}
                <div className="space-y-2 mb-6">
                  {/* Luz Anual */}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Energía Anual:</span>
                    <span className="font-semibold text-slate-200">
                      ${m.costoLuzAnual.toLocaleString('es-MX', { maximumFractionDigits: 1 })} MXN
                    </span>
                  </div>
                  
                  {/* TCO */}
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-800/40">
                    <span className="text-slate-400 font-semibold">TCO (Costo Total):</span>
                    <span className="font-bold text-cyan-400">
                      ${Math.round(m.tco).toLocaleString()} MXN
                    </span>
                  </div>

                  {/* Gasto Anualizado */}
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/40">
                    <span className="text-slate-300 font-bold text-xs">Gasto Anualizado:</span>
                    <div className="flex items-center text-lg font-extrabold text-white">
                      <DollarSign size={16} className="text-slate-400" />
                      {Math.round(m.gastoAnual).toLocaleString()}
                      <span className="text-[10px] text-slate-500 font-normal ml-1 font-sans">/ año</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox de Versus */}
              <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isSelectedInVersus}
                    onChange={() => handleToggleVersus(m.id)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Comparar en Versus</span>
                </label>
                
                <span className="text-[10px] text-slate-500 font-mono">
                  {isSelectedInVersus ? '✓ Incluido' : 'Excluido'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Alerta de Comparativa vacía */}
      {selectedIds.length === 0 && (
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 flex items-center gap-2.5 text-xs">
          <AlertCircle size={16} />
          <span>Activa al menos un "Comparar en Versus" en las tarjetas de arriba para calcular la opción más rentable.</span>
        </div>
      )}

    </div>
  );
}
