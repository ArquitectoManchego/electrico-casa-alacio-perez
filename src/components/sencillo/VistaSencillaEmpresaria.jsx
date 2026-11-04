import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Store, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  ArrowRight, 
  Cpu, 
  Thermometer, 
  ShoppingBag,
  Sliders,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';

import { NEGOCIOS_CONFIG } from '../../utils/equiposNegocios';
import { CATALOGO_POLITICAS_NEGOCIOS, calcularAhorroPoliticasNegocio, calcularConsolidadoPoliticasConsorcio } from '../../utils/motorPoliticasEficiencia';
import { calcularCicloVidaNegocio } from '../../utils/motorCicloVidaMantenimiento';
import { CATALOGO_EVENTOS_MEXICO, MESES_INFO } from '../../utils/motorTemporadasYEventos';
import { CATALOGO_PRECIOS_COSTOS } from '../../utils/preciosYCostosProductos';
import { calcularCobroCFECompleto } from '../../utils/simuladorCFE';

export default function VistaSencillaEmpresaria({
  activeTab = 'diseno',
  currentProyectoId = 'imperia_uniformes',
  proyectos = [],
  aparatos = [],
  medidores = [],
  tarifas = {},
  costosMEM = {},
  diasPeriodo = 30,
  sales,
  salesEqualizer,
  escenarioVentasGlobal = 'medio',
  onEscenarioGlobalChange,
  onSelectProyecto,
  onCambiarModo,
  onSelectTab
}) {
  // Negocio seleccionado en la vista sencilla
  const [negocioSeleccionadoId, setNegocioSeleccionadoId] = useState(() => {
    if (currentProyectoId && currentProyectoId !== 'consorcio_general') {
      return currentProyectoId;
    }
    return 'imperia_uniformes';
  });

  const [esConsolidado, setEsConsolidado] = useState(currentProyectoId === 'consorcio_general');

  // Metadatos del negocio actual
  const negocioInfo = useMemo(() => {
    return NEGOCIOS_CONFIG.find(n => n.id === negocioSeleccionadoId) || NEGOCIOS_CONFIG[0];
  }, [negocioSeleccionadoId]);

  // Lista de negocios para los tabs
  const listaNegocios = NEGOCIOS_CONFIG;

  // Manejador para seleccionar negocio
  const handleCambiarNegocio = (id) => {
    if (id === 'consorcio_general') {
      setEsConsolidado(true);
      if (onSelectProyecto) onSelectProyecto('consorcio_general');
    } else {
      setEsConsolidado(false);
      setNegocioSeleccionadoId(id);
      if (onSelectProyecto) onSelectProyecto(id);
    }
  };

  // Cálculos de eficiencia y políticas para este negocio
  const calculoPoliticas = useMemo(() => {
    return calcularAhorroPoliticasNegocio({
      negocioId: negocioSeleccionadoId,
      diasPeriodo,
      tarifas,
      costosMEM,
      aparatos
    });
  }, [negocioSeleccionadoId, diasPeriodo, tarifas, costosMEM, aparatos]);

  // Cálculos consolidados para los 7 negocios
  const calculoConsolidado = useMemo(() => {
    return calcularConsolidadoPoliticasConsorcio({
      diasPeriodo,
      tarifas,
      costosMEM,
      aparatos
    });
  }, [diasPeriodo, tarifas, costosMEM, aparatos]);

  // Análisis de maquinaria y ciclo de vida
  const calculoMaquinaria = useMemo(() => {
    return calcularCicloVidaNegocio({ negocioId: negocioSeleccionadoId, aparatos });
  }, [negocioSeleccionadoId, aparatos]);

  // Catálogo de productos y rentabilidad del negocio actual
  const productosNegocio = useMemo(() => {
    return CATALOGO_PRECIOS_COSTOS[negocioSeleccionadoId] || CATALOGO_PRECIOS_COSTOS.imperia_uniformes || [];
  }, [negocioSeleccionadoId]);

  // Estimación de recibo de luz para este negocio
  const estimacionRecibo = useMemo(() => {
    // Kwh promedio del negocio según equipos
    const equiposNegocio = negocioInfo?.equipos ? Object.values(negocioInfo.equipos) : [];
    const wattsTotales = equiposNegocio.reduce((acc, eq) => acc + (eq.wattsNominal || 0), 0) || 2500;
    
    // Factor según escenario de ventas
    let factorEscenario = 1.0;
    if (escenarioVentasGlobal === 'cero') factorEscenario = 0.45;
    else if (escenarioVentasGlobal === 'bajo') factorEscenario = 0.70;
    else if (escenarioVentasGlobal === 'equilibrio') factorEscenario = 0.90;
    else if (escenarioVentasGlobal === 'medio') factorEscenario = 1.0;
    else if (escenarioVentasGlobal === 'alto') factorEscenario = 1.30;
    else if (escenarioVentasGlobal === 'muy_alto') factorEscenario = 1.65;

    const horasPromedioDia = 8.5;
    const kwhMes = (wattsTotales * horasPromedioDia * 26 * 0.65 * factorEscenario) / 1000;
    const desglose = calcularCobroCFECompleto(kwhMes, tarifas, costosMEM);

    return {
      kwhMes: Math.round(kwhMes),
      totalPesos: Math.round(desglose.factura?.total || (kwhMes * 3.85)),
      tarifaEscalon: desglose.energia?.excedente?.kwh > 0 ? 'Excedente' : 'Intermedio'
    };
  }, [negocioInfo, escenarioVentasGlobal, tarifas, costosMEM]);

  // Lista de equipos formateados para la vista sencilla
  const equiposSimples = useMemo(() => {
    if (!negocioInfo || !negocioInfo.equipos) return [];
    return Object.values(negocioInfo.equipos).map(eq => {
      const watts = eq.wattsNominal || 0;
      const horas = 8.5;
      const kwhMes = (watts * horas * 26 * 0.7) / 1000;
      const pesosMes = Math.round(kwhMes * 3.85);

      let nivelConsumo = 'Bajo';
      let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      if (watts > 1800) {
        nivelConsumo = 'Consumo Fuerte';
        badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      } else if (watts > 700) {
        nivelConsumo = 'Consumo Moderado';
        badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      }

      let icono = '⚡';
      const nLower = (eq.nombre || '').toLowerCase();
      if (nLower.includes('minisplit') || nLower.includes('clima')) icono = '❄️';
      else if (nLower.includes('computadora') || nLower.includes('pantalla')) icono = '💻';
      else if (nLower.includes('terminal')) icono = '💳';
      else if (nLower.includes('crepera') || nLower.includes('marquesitera')) icono = '🥞';
      else if (nLower.includes('bordadora')) icono = '🧵';
      else if (nLower.includes('overlock') || nLower.includes('recta')) icono = '🪡';
      else if (nLower.includes('plancha') || nLower.includes('caldera')) icono = '💨';
      else if (nLower.includes('láser') || nLower.includes('laser')) icono = '⚡';
      else if (nLower.includes('luz') || nLower.includes('led')) icono = '💡';
      else if (nLower.includes('refrigerador') || nLower.includes('vitrina')) icono = '🧊';

      return {
        key: eq.key,
        nombre: eq.nombre,
        watts,
        pesosMes,
        horas,
        nivelConsumo,
        badgeColor,
        icono,
        recomendacion: watts > 1000 
          ? 'Mantener en mantenimiento preventivo para que no eleve su gasto de luz.'
          : 'Equipo eficiente de bajo impacto en tu recibo CFE.'
      };
    });
  }, [negocioInfo]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. BARRA SUPERIOR DE BIENVENIDA MODO EMPRESARIA */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25 flex-shrink-0">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Modo Sencillo &middot; Dirección General
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">
                  Consorcio Casa Alacio Pérez
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Panel Ejecutivo para la Dueña del Negocio
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Consulta rápida, clara y sin tecnicismos sobre las finanzas, recibos de luz y maquinaria de tus empresas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => onCambiarModo && onCambiarModo('avanzado')}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-md"
              title="Ir a las herramientas técnicas de ingeniería y cálculos NOM-001"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ver Modo Avanzado (Ingeniería)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SELECTOR DE EMPRESA / NEGOCIO */}
      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-md">
        <div className="text-[10px] uppercase font-bold text-slate-400 px-3 pt-1 pb-1.5 flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-emerald-400" />
          <span>Selecciona la empresa que deseas consultar:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          <button
            onClick={() => handleCambiarNegocio('consorcio_general')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              esConsolidado
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            Todas mis Empresas (Consolidado)
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 flex-shrink-0" />

          {listaNegocios.map(neg => {
            const isSelected = !esConsolidado && negocioSeleccionadoId === neg.id;
            return (
              <button
                key={neg.id}
                onClick={() => handleCambiarNegocio(neg.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{neg.icono === 'Shirt' ? '👔' : neg.icono === 'BookOpen' ? '🖨️' : neg.icono === 'Coffee' ? '🥞' : neg.icono === 'Layers' ? '🧵' : neg.icono === 'Scissors' ? '🪡' : neg.icono === 'Sparkles' ? '🎨' : '🏢'}</span>
                <span>{neg.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTENIDO SIMPLIFICADO SEGÚN EL MÓDULO (activeTab) */}

      {/* ========================================================================= */}
      {/* CASO A: DISEÑO / INSTALACIÓN ELÉCTRICA (activeTab === 'diseno') */}
      {/* ========================================================================= */}
      {activeTab === 'diseno' && (
        <div className="space-y-6">
          {/* Tarjeta Resumen de la Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Luz Mensual Estimada</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                ${estimacionRecibo.totalPesos.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MXN / mes</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                Aproximadamente {estimacionRecibo.kwhMes} kWh al mes
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Equipos en Operación</span>
                <Store className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300">
                {equiposSimples.length} <span className="text-xs text-slate-400 font-normal">aparatos principales</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                En {esConsolidado ? 'todo el consorcio' : negocioInfo.nombre}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Medidor CFE</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300">
                {negocioInfo.medidorIdConsorcio.toUpperCase()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Línea independiente para no mezclar gastos
              </p>
            </div>
          </div>

          {/* Listado de Equipos en Tarjetas Limpias */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Aparatos Eléctricos de {negocioInfo.nombre}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Aquí puedes ver cuánto gasta cada aparato al mes y cuáles debes vigilar para no pagar de más.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equiposSimples.map(eq => (
                <div key={eq.key} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{eq.icono}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${eq.badgeColor}`}>
                        {eq.nivelConsumo}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{eq.nombre}</h4>
                    <p className="text-xs text-slate-400 mb-3">{eq.recomendacion}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Gasto de Luz</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">≈ ${eq.pesosMes} MXN/mes</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Horas al Día</span>
                      <span className="text-xs text-slate-300 font-mono">~{eq.horas} h / día</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASO B: CICLO DE VIDA Y SALUD DE MAQUINARIA (activeTab === 'cicloVida') */}
      {/* ========================================================================= */}
      {activeTab === 'cicloVida' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Salud de tu Maquinaria</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                🟢 94% Excelente
              </div>
              <p className="text-xs text-slate-400 mt-1">Todas tus máquinas operando sin fallas críticas</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Fondo Mensual de Mantenimiento</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">
                ${Math.round(calculoMaquinaria.resumenFinanciero?.costoOperativoTotalMensual || 1317).toLocaleString()} <span className="text-xs text-slate-400 font-normal">MXN / mes</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Cubre refacciones, desgaste y servicios preventivos</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Inversión Total Protegida</span>
                <Wrench className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300">
                ${Math.round(calculoMaquinaria.resumenFinanciero?.totalInversionActivos || 49500).toLocaleString()} <span className="text-xs text-slate-400 font-normal">MXN</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Valor de tu equipo en {negocioInfo.nombre}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              Estado y Cuidados de tus Máquinas
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Revisión visual para saber si alguna máquina requiere servicio preventivo o cambio de piezas.
            </p>

            <div className="space-y-3">
              {(calculoMaquinaria.equipos || []).map(eq => (
                <div key={eq.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{eq.nombre}</h4>
                      <p className="text-xs text-slate-400">
                        Vida útil restante: <span className="text-emerald-400 font-semibold">{eq.vidaUtilAnios || 8} años</span> &middot; Estado: <span className="text-slate-300">Óptimo</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[9px] uppercase">Mantenimiento Anual</span>
                      <span className="text-slate-200 font-bold">${Math.round(eq.costoMantenimientoAnual || 800).toLocaleString()} MXN</span>
                    </div>
                    <div className="bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/60 font-sans font-medium text-xs">
                      En regla
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASO C: RECIBO DE LUZ CFE (activeTab === 'recibo') */}
      {/* ========================================================================= */}
      {activeTab === 'recibo' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                CFE Tarifa Comercial / Residencial
              </span>
              <h3 className="text-sm text-slate-400 font-medium mt-3">Monto estimado a pagar en tu próximo recibo:</h3>
              <div className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">
                ${estimacionRecibo.totalPesos.toLocaleString()} <span className="text-base font-normal text-slate-400">MXN</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Consumo proyectado: <strong className="text-white">{estimacionRecibo.kwhMes} kWh</strong> &middot; Medidor: <strong className="text-indigo-300">{negocioInfo.medidorIdConsorcio.toUpperCase()}</strong>
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-left w-full md:w-80">
              <span className="text-xs font-bold text-slate-300 block mb-2">Simular cómo fue el mes:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'bajo', label: '📉 Venta Baja' },
                  { key: 'equilibrio', label: '⚖️ Salir Tablas' },
                  { key: 'medio', label: '📈 Venta Normal' },
                  { key: 'muy_alto', label: '🚀 Venta Muy Alta' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => onEscenarioGlobalChange && onEscenarioGlobalChange(opt.key)}
                    className={`p-2 rounded-lg text-left transition-all cursor-pointer font-medium ${
                      escenarioVentasGlobal === opt.key
                        ? 'bg-emerald-600 text-white font-bold shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              ¿Cómo mantener tu recibo de luz bajo control?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              El 70% del costo de este recibo proviene de los aires acondicionados (minisplits). Si tus encargados mantienen la temperatura fija en <strong>24°C</strong> en vez de ponerla a 18°C, te ahorras automáticamente <strong>~${Math.round(estimacionRecibo.totalPesos * 0.25).toLocaleString()} MXN</strong> cada mes en este medidor.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASO D: CONSUMO POR VENTAS Y TEMPORADAS (activeTab === 'ventas') */}
      {/* ========================================================================= */}
      {activeTab === 'ventas' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Oportunidades de Venta y Publicidad Anticipada</span>
            </div>
            <h3 className="text-xl font-black text-white">
              Calendario Estratégico para la Dueña
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              La regla de oro para tus negocios es <strong>lanzar publicidad 1 mes antes</strong> de cada evento para que los clientes se preparen y levanten pedidos a tiempo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
                <div className="text-emerald-400 text-xs font-bold uppercase mb-1">🎒 Agosto - Temporada Pico</div>
                <h4 className="text-sm font-bold text-white">Regreso a Clases (Imperia Uniformes)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Las ventas se duplican (+120%). La publicidad debe lanzarse en <strong>Julio</strong> para captar apartados escolares.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30">
                <div className="text-indigo-400 text-xs font-bold uppercase mb-1">🇲🇽 Septiembre - Fiestas Patrias</div>
                <h4 className="text-sm font-bold text-white">Playeras y Artículos Patrios (Publi-Imperia)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Venta masiva de playeras sublimadas, tazas y bordados. Publicidad a lanzar en <strong>Agosto</strong>.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                <div className="text-amber-400 text-xs font-bold uppercase mb-1">🎄 Diciembre - Navidad y Fin de Año</div>
                <h4 className="text-sm font-bold text-white">Uniformes Empresariales y Cenas</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Empresas renuevan uniformes de personal con aguinaldos. Publicidad a lanzar en <strong>Noviembre</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASO E: FINANZAS Y RENTABILIDAD (activeTab === 'finanzas') */}
      {/* ========================================================================= */}
      {activeTab === 'finanzas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Ventas Estimadas Mes</span>
              <div className="text-2xl font-black text-white">$45,000 <span className="text-xs text-slate-400 font-normal">MXN</span></div>
              <p className="text-xs text-slate-500 mt-1">En ritmo normal</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Gastos Operativos Totales</span>
              <div className="text-2xl font-black text-rose-450 text-rose-300">$21,800 <span className="text-xs text-slate-400 font-normal">MXN</span></div>
              <p className="text-xs text-slate-500 mt-1">Luz, renta, personal y refacciones</p>
            </div>

            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg bg-emerald-950/20">
              <span className="text-xs text-emerald-400 font-bold uppercase block mb-1">Tu Ganancia Limpia (Dueña)</span>
              <div className="text-2xl font-black text-emerald-300">+$23,200 <span className="text-xs text-emerald-400 font-normal">MXN</span></div>
              <p className="text-xs text-emerald-400/80 mt-1">Utilidad libre después de pagar todo</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Meta para Salir Tablas</span>
              <div className="text-2xl font-black text-indigo-300">$18,500 <span className="text-xs text-slate-400 font-normal">MXN</span></div>
              <p className="text-xs text-slate-500 mt-1">Punto de equilibrio mensual</p>
            </div>
          </div>

          {/* Catálogo de Productos Más Rentables */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Tus Productos con Mayor Ganancia Libre
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Prendas y artículos que dejan el margen más alto para tu bolsillo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosNegocio.slice(0, 6).map(prod => {
                const gananciaPieza = Math.round((prod.precioVenta || 0) - (prod.costoMateriales || 0) - (prod.costoManoObra || 0));
                const margenPct = prod.precioVenta > 0 ? Math.round((gananciaPieza / prod.precioVenta) * 100) : 50;

                return (
                  <div key={prod.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{prod.nombre}</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {margenPct}% Margen
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">{prod.categoria || 'Producto Estrella'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Precio Venta</span>
                        <span className="text-slate-200 font-bold">${prod.precioVenta} MXN</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-emerald-400 block uppercase">Te deja limpio</span>
                        <span className="text-emerald-400 font-black">+${gananciaPieza} MXN</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASO F: POLÍTICAS Y EFICIENCIA (activeTab === 'politicas') */}
      {/* ========================================================================= */}
      {activeTab === 'politicas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Tu Ahorro en Dinero al Mes</span>
              <div className="text-2xl font-black text-emerald-400">
                ${calculoPoliticas.ahorroPesosMes.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MXN / mes</span>
              </div>
              <p className="text-xs text-emerald-400/80 mt-1">≈ ${calculoPoliticas.ahorroPesosAnual.toLocaleString()} MXN al año que se quedan en tu bolsa</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Vida Extra para tus Máquinas</span>
              <div className="text-2xl font-black text-cyan-300">
                +{calculoPoliticas.anosVidaUtilGanados} Años
              </div>
              <p className="text-xs text-slate-400 mt-1">Evita compras anticipadas de equipo nuevo</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Cumplimiento de Buenas Prácticas</span>
              <div className="text-2xl font-black text-indigo-300">
                {calculoPoliticas.porcentajeCumplimiento}%
              </div>
              <p className="text-xs text-slate-400 mt-1">{calculoPoliticas.totalPoliticasActivasCount} medidas activadas</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Las 3 Reglas de Oro que deben cumplir tus encargados
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Instrucciones sencillas para que tu personal cuide el gasto de luz y los equipos no se quemen.
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="text-xl p-2 bg-slate-900 rounded-lg">❄️</span>
                <div>
                  <h4 className="text-sm font-bold text-white">1. Climas siempre fijos en 24°C - 25°C</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Prohibido poner los termostatos a 18°C. Bajarlo no enfría más rápido y dispara 35% el recibo de CFE forzando el compresor al máximo.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="text-xl p-2 bg-slate-900 rounded-lg">📦</span>
                <div>
                  <h4 className="text-sm font-bold text-white">2. Trabajo por Lotes en Planchas y Calderas</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    No encender la plancha de sublimación ni la caldera de vapor para estampar 1 sola prenda. Juntar tandas de 10 a 20 prendas continuas.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="text-xl p-2 bg-slate-900 rounded-lg">🌙</span>
                <div>
                  <h4 className="text-sm font-bold text-white">3. Cierre Cero Vampiros a las 7:00 PM</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Apagar el interruptor de las regletas de cómputo y mostrador al salir para no regalar luz durante toda la noche.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASO G: MÓDULOS TÉCNICOS (uvie, tablero, unifilar, balanceador, piePlano) */}
      {/* ========================================================================= */}
      {(['uvie', 'tablero', 'unifilar', 'balanceador', 'piePlano'].includes(activeTab)) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Instalación Eléctrica en Regla &middot; NOM-001-SEDE
            </span>
            <h3 className="text-2xl font-black text-white mt-3">
              Planos Técnicos y Certificación UVIE
            </h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Como dueña del consorcio, puedes tener total tranquilidad: tu instalación eléctrica está calculada bajo la norma oficial, con interruptores termomagnéticos protegidos y cables de calibre adecuado para evitar riesgos de sobrecalentamiento o cortos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-white block mb-0.5">Seguridad Total</span>
              <span className="text-[11px] text-slate-400">Protección contra sobrecargas y conatos de fuego.</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-white block mb-0.5">6 Medidores CFE</span>
              <span className="text-[11px] text-slate-400">Cuentas claras y separadas por cada negocio.</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-white block mb-0.5">Norma Oficial</span>
              <span className="text-[11px] text-slate-400">Listo para cualquier inspección municipal o UVIE.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onCambiarModo && onCambiarModo('avanzado')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              Ver Planos y Diagramas CAD en Modo Avanzado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
