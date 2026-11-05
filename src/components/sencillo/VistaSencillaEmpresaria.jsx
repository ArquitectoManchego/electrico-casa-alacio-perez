import React, { useState, useMemo, useEffect } from 'react';
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
  Check,
  Award,
  Flame,
  Shield,
  Trophy
} from 'lucide-react';

import { NEGOCIOS_CONFIG } from '../../utils/equiposNegocios';
import { CATALOGO_POLITICAS_NEGOCIOS, calcularAhorroPoliticasNegocio, calcularConsolidadoPoliticasConsorcio } from '../../utils/motorPoliticasEficiencia';
import { calcularCicloVidaNegocio } from '../../utils/motorCicloVidaMantenimiento';
import { CATALOGO_EVENTOS_MEXICO, MESES_INFO } from '../../utils/motorTemporadasYEventos';
import { CATALOGO_PRECIOS_COSTOS } from '../../utils/preciosYCostosProductos';
import { calcularCobroCFECompleto } from '../../utils/simuladorCFE';

import IlustracionEquipo from './IlustracionesEquipos';
import FajoBilletes from './FajoBilletes';
import MedidorCFEDial from './MedidorCFEDial';

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
  // Negocio seleccionado en la vista sencilla (muestra UNA empresa a la vez)
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

  // Manejador para seleccionar negocio (uno a la vez)
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

  // Sincronizar si cambia desde afuera
  useEffect(() => {
    if (currentProyectoId && currentProyectoId !== 'consorcio_general') {
      setNegocioSeleccionadoId(currentProyectoId);
      setEsConsolidado(false);
    } else if (currentProyectoId === 'consorcio_general') {
      setEsConsolidado(true);
    }
  }, [currentProyectoId]);

  // Lista de equipos formateados para la empresa activa
  const equiposDeLaEmpresa = useMemo(() => {
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

      return {
        key: eq.key,
        nombre: eq.nombre,
        watts,
        pesosMes,
        kwhMes: Math.round(kwhMes),
        horas,
        nivelConsumo,
        badgeColor,
        consejo: watts > 1000 
          ? 'Equipo de potencia alta: Mantener apagado cuando no esté en producción para ahorrar hasta un 25%.'
          : 'Equipo eficiente: Impacto ligero en tu recibo mensual de CFE.'
      };
    });
  }, [negocioInfo]);

  // Equipo activo mostrado en el Hero de 256x256 px
  const [equipoActivoKey, setEquipoActivoKey] = useState(null);

  useEffect(() => {
    if (equiposDeLaEmpresa.length > 0) {
      setEquipoActivoKey(equiposDeLaEmpresa[0].key);
    }
  }, [negocioSeleccionadoId]);

  const equipoSeleccionado = useMemo(() => {
    return equiposDeLaEmpresa.find(e => e.key === equipoActivoKey) || equiposDeLaEmpresa[0] || {
      key: 'default',
      nombre: 'Equipo General',
      watts: 1000,
      pesosMes: 500,
      kwhMes: 130,
      horas: 8.5,
      nivelConsumo: 'Moderado',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      consejo: 'Operación normal de tienda.'
    };
  }, [equiposDeLaEmpresa, equipoActivoKey]);

  // Cálculos de políticas y ahorro
  const calculoPoliticas = useMemo(() => {
    return calcularAhorroPoliticasNegocio({
      negocioId: negocioSeleccionadoId,
      diasPeriodo,
      tarifas,
      costosMEM,
      aparatos
    });
  }, [negocioSeleccionadoId, diasPeriodo, tarifas, costosMEM, aparatos]);

  // Análisis de maquinaria y salud de equipos
  const calculoMaquinaria = useMemo(() => {
    return calcularCicloVidaNegocio({ negocioId: negocioSeleccionadoId, aparatos });
  }, [negocioSeleccionadoId, aparatos]);

  // Productos y rentabilidad de la tienda actual
  const productosNegocio = useMemo(() => {
    return CATALOGO_PRECIOS_COSTOS[negocioSeleccionadoId] || CATALOGO_PRECIOS_COSTOS.imperia_uniformes || [];
  }, [negocioSeleccionadoId]);

  // Estimación de recibo de CFE y consumo
  const estimacionRecibo = useMemo(() => {
    const equiposNegocio = negocioInfo?.equipos ? Object.values(negocioInfo.equipos) : [];
    const wattsTotales = equiposNegocio.reduce((acc, eq) => acc + (eq.wattsNominal || 0), 0) || 2500;
    
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

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. CABECERA EJECUTIVA / BIENVENIDA MODO GAMIFICADO */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/30 flex-shrink-0">
              <Sparkles className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Panel Visual Interactivo &middot; Modo Sencillo
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">
                  Consorcio Casa Alacio Pérez
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Supervisión Ejecutiva para la Dueña
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Cada medida representada visualmente con diales, fajos de billetes y gráficos intuitivos.
              </p>
            </div>
          </div>

          <button
            onClick={() => onCambiarModo && onCambiarModo('avanzado')}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            title="Cambiar al modo técnico con diagramas CAD y fórmulas NOM-001"
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Modo Avanzado (Técnico)</span>
          </button>
        </div>
      </div>

      {/* 2. SELECTOR DE EMPRESA (UNA EMPRESA A LA VEZ) */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-xl">
        <div className="text-[11px] uppercase font-bold text-slate-400 px-3 pt-1 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Selecciona una empresa para consultar:</span>
          </div>
          <span className="text-emerald-400 text-xs font-mono font-bold">
            Mostrando: {esConsolidado ? 'Todas las Empresas' : negocioInfo.nombre}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          <button
            onClick={() => handleCambiarNegocio('consorcio_general')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              esConsolidado
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 font-black scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            🏛️ Consolidado General
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 flex-shrink-0" />

          {listaNegocios.map(neg => {
            const isSelected = !esConsolidado && negocioSeleccionadoId === neg.id;
            return (
              <button
                key={neg.id}
                onClick={() => handleCambiarNegocio(neg.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black scale-105 border border-emerald-400/50'
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

      {/* ========================================================================= */}
      {/* 3. MÓDULO: EQUIPOS ELÉCTRICOS DE MIS TIENDAS (activeTab === 'diseno') */}
      {/* ========================================================================= */}
      {activeTab === 'diseno' && (
        <div className="space-y-6">
          {/* HERO SHOWCASE: ILUSTRACIÓN VECTORIAL 256x256 + GAUGES DE VIDEOJUEGO */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Columna Izquierda: Ilustración Vectorial 256x256 px */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-inner w-full lg:w-80 flex-shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
                  Vista Vectorial 256x256 px
                </span>
                <div className="w-64 h-64 flex items-center justify-center p-2 drop-shadow-2xl">
                  <IlustracionEquipo 
                    equipoId={equipoSeleccionado.key} 
                    nombre={equipoSeleccionado.nombre} 
                    className="w-60 h-60 transition-transform duration-300 hover:scale-105" 
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${equipoSeleccionado.badgeColor}`}>
                    {equipoSeleccionado.nivelConsumo}
                  </span>
                </div>
              </div>

              {/* Columna Central: Métricas Visuales tipo Videojuego */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <span className="text-xs font-mono uppercase text-indigo-400 font-bold block mb-1">
                    {negocioInfo.nombre} &middot; Medidor {negocioInfo.medidorIdConsorcio.toUpperCase()}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {equipoSeleccionado.nombre}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {equipoSeleccionado.consejo}
                  </p>
                </div>

                {/* Barra de Nivel de Potencia / Watts (Power Bar) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Nivel de Potencia del Equipo:
                    </span>
                    <span className="text-white font-mono">{equipoSeleccionado.watts} Watts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(15, (equipoSeleccionado.watts / 3000) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>Ligero (100W)</span>
                    <span>Moderado (1500W)</span>
                    <span>Intenso (3000W+)</span>
                  </div>
                </div>

                {/* Horas de Operación y kWh */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Uso Diario Estimado</span>
                    <span className="text-base font-bold text-white font-mono flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      ~{equipoSeleccionado.horas} horas / día
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Energía al Mes</span>
                    <span className="text-base font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      {equipoSeleccionado.kwhMes} kWh / mes
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: FAJO DE BILLETES PARA ESTE EQUIPO */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <FajoBilletes 
                  monto={equipoSeleccionado.pesosMes} 
                  label="Gasto de Luz al Mes" 
                />
              </div>
            </div>
          </div>

          {/* SELECTOR DE EQUIPOS DE ESTA EMPRESA */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              Equipos de {negocioInfo.nombre} ({equiposDeLaEmpresa.length} aparatos)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Haz clic en cualquier máquina para ver su ilustración en grande y sus billetes de consumo mensual:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {equiposDeLaEmpresa.map(eq => {
                const isSelected = eq.key === equipoSeleccionado.key;
                return (
                  <button
                    key={eq.key}
                    onClick={() => setEquipoActivoKey(eq.key)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="w-16 h-16 mx-auto mb-2 drop-shadow-md">
                        <IlustracionEquipo equipoId={eq.key} nombre={eq.nombre} className="w-16 h-16" />
                      </div>
                      <h4 className="text-xs font-bold text-white text-center mb-1 line-clamp-2">
                        {eq.nombre}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-400">{eq.watts} W</span>
                      <span className="font-mono font-bold text-emerald-400">≈ ${eq.pesosMes} MXN</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MÓDULO: RECIBO DE LUZ CFE (activeTab === 'recibo') */}
      {/* ========================================================================= */}
      {activeTab === 'recibo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* CARÁTULA DEL MEDIDOR DE LUZ CFE */}
            <MedidorCFEDial 
              kwh={estimacionRecibo.kwhMes} 
              medidorId={negocioInfo.medidorIdConsorcio} 
              empresaNombre={negocioInfo.nombre}
              className="h-full justify-between"
            />

            {/* FAJO DE BILLETES CON EL COSTO TOTAL EN EFECTIVO */}
            <div className="flex flex-col justify-between gap-4">
              <FajoBilletes 
                monto={estimacionRecibo.totalPesos} 
                label="Costo en Dinero del Recibo CFE" 
              />

              {/* SELECTOR DE NIVEL / DIFICULTAD DE VENTA */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Simulador de Ritmo del Mes (Mueve el Dial y los Billetes):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'bajo', label: '📉 Venta Baja', desc: 'Pocos clientes' },
                    { key: 'equilibrio', label: '⚖️ Salir Tablas', desc: 'Punto de equilibrio' },
                    { key: 'medio', label: '📈 Venta Normal', desc: 'Flujo estándar' },
                    { key: 'muy_alto', label: '🚀 Venta Muy Alta', desc: 'Temporada pico' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => onEscenarioGlobalChange && onEscenarioGlobalChange(opt.key)}
                      className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                        escenarioVentasGlobal === opt.key
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MÓDULO: SALUD DE MAQUINARIA (activeTab === 'cicloVida') */}
      {/* ========================================================================= */}
      {activeTab === 'cicloVida' && (
        <div className="space-y-6">
          {/* BARRA DE HP / SALUD GENERAL */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">Barra de Salud de Maquinaria</span>
                <h3 className="text-2xl font-black text-white">94% HP &middot; Estado Excelente</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sin averías críticas en {negocioInfo.nombre}.</p>
              </div>
            </div>

            <div className="w-full md:w-64">
              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[94%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0% Dañado</span>
                <span className="text-emerald-400 font-bold">94% Óptimo</span>
                <span>100% Nuevo</span>
              </div>
            </div>
          </div>

          {/* LISTA DE MÁQUINAS CON SU BARRA DE VIDA Y FAJO PREVENTIVO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(calculoMaquinaria.equipos || []).map(eq => (
              <div key={eq.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 p-1 bg-slate-950 rounded-xl border border-slate-800 flex-shrink-0 flex items-center justify-center">
                    <IlustracionEquipo equipoId={eq.id} nombre={eq.nombre} className="w-16 h-16" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                      Vida Útil: {eq.vidaUtilAnios || 8} años restantes
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">{eq.nombre}</h4>
                    
                    {/* Barra de Vida individual */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-500 h-full w-[85%] rounded-full" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">🟢 Operando sin desgaste anormal</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Fondo Preventivo</span>
                    <span className="text-amber-400 font-mono font-bold">
                      ${Math.round((eq.costoMantenimientoAnual || 800) / 12)} MXN / mes
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                    🛡️ En regla
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MÓDULO: VENTAS Y TEMPORADAS (`ventas`) */}
      {/* ========================================================================= */}
      {activeTab === 'ventas' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>Misiones de Venta y Publicidad Estratégica</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Radar de Campañas para la Dueña
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Regla de oro: <strong>Lanzar publicidad 1 mes antes</strong> para asegurar pedidos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 relative overflow-hidden">
                <div className="text-2xl mb-2">🎒</div>
                <div className="text-emerald-400 text-xs font-black uppercase">Agosto &middot; Nivel Épico (2.2x)</div>
                <h4 className="text-base font-bold text-white mt-0.5">Regreso a Clases</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Las ventas en Imperia se duplican. 
                  <span className="text-emerald-300 font-bold block mt-1">📢 Alerta: Lanzar publicidad en Julio.</span>
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/40 relative overflow-hidden">
                <div className="text-2xl mb-2">🇲🇽</div>
                <div className="text-indigo-400 text-xs font-black uppercase">Septiembre &middot; Nivel Alto</div>
                <h4 className="text-base font-bold text-white mt-0.5">Fiestas Patrias</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Playeras patrias, tazas y bordados corporativos.
                  <span className="text-indigo-300 font-bold block mt-1">📢 Alerta: Lanzar publicidad en Agosto.</span>
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 relative overflow-hidden">
                <div className="text-2xl mb-2">🎄</div>
                <div className="text-amber-400 text-xs font-black uppercase">Diciembre &middot; Nivel Muy Alto</div>
                <h4 className="text-base font-bold text-white mt-0.5">Navidad y Fin de Año</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Uniformes ejecutivos y cenas de empresas.
                  <span className="text-amber-300 font-bold block mt-1">📢 Alerta: Lanzar publicidad en Noviembre.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MÓDULO: FINANZAS Y GANANCIAS (`finanzas`) */}
      {/* ========================================================================= */}
      {activeTab === 'finanzas' && (
        <div className="space-y-6">
          {/* COFRE DE GANANCIA LIMPIA Y PUNTO DE EQUILIBRIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">Cofre de la Dueña</span>
                <h3 className="text-xl font-black text-white mt-1">Tu Ganancia Neta Limpia</h3>
                <p className="text-xs text-slate-300 mt-1">Dinero libre para tu bolsa tras cubrir luz, nóminas y costos.</p>
              </div>

              <div className="my-4">
                <FajoBilletes monto={23200} label="Utilidad Mensual Estimada" />
              </div>

              <div className="text-center text-xs text-emerald-300 font-semibold bg-emerald-950/80 p-2 rounded-xl border border-emerald-800/60">
                ✨ Margen Libre: 51.5% de rentabilidad neta
              </div>
            </div>

            {/* BARRA DE DESBLOQUEO: PUNTO DE EQUILIBRIO */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-indigo-400 tracking-wider">Misión de Seguridad</span>
                <h3 className="text-xl font-black text-white mt-1">Meta de Punto de Equilibrio</h3>
                <p className="text-xs text-slate-300 mt-1">¿Cuánto necesitas vender al mes para no perder dinero?</p>
              </div>

              <div className="my-6 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-400">Progreso a la Meta:</span>
                  <span className="text-emerald-400 font-mono">100% Superado</span>
                </div>
                <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden p-1 border border-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full" />
                </div>
                <div className="text-xs text-slate-400 text-center font-mono">
                  Meta para salir tablas: <strong>$18,500 MXN</strong> &middot; Venta estimada: <strong className="text-emerald-400">$45,000 MXN</strong>
                </div>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-xl text-xs text-indigo-300">
                🏁 <strong>¡Meta superada!</strong> Todo lo que se venda a partir de $18,500 MXN entra como ganancia directa para ti.
              </div>
            </div>
          </div>

          {/* PODIO DE PRENDAS / PRODUCTOS MÁS RENTABLES */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Podio de Tus Productos con Mayor Ganancia
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Prendas que más dinero limpio dejan por cada pieza vendida:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {productosNegocio.slice(0, 3).map((prod, idx) => {
                const gananciaPieza = Math.round((prod.precioVenta || 0) - (prod.costoMateriales || 0) - (prod.costoManoObra || 0));
                const medalla = idx === 0 ? '🥇 Oro' : idx === 1 ? '🥈 Plata' : '🥉 Bronce';
                return (
                  <div key={prod.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 block mb-1">{medalla}</span>
                      <h4 className="text-base font-bold text-white">{prod.nombre}</h4>
                      <p className="text-xs text-slate-400 mt-1">{prod.categoria}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Venta</span>
                        <span className="text-slate-200 font-bold">${prod.precioVenta}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 block uppercase">Ganancia Limpia</span>
                        <span className="text-emerald-400 font-black text-base">+${gananciaPieza}</span>
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
      {/* 8. MÓDULO: AHORRO DE LUZ Y POLÍTICAS (`politicas`) */}
      {/* ========================================================================= */}
      {activeTab === 'politicas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* DINERO AHORRADO EN BILLETES */}
            <FajoBilletes 
              monto={calculoPoliticas.ahorroPesosMes} 
              label="Dinero que te Ahorras al Mes con Buenas Prácticas" 
            />

            {/* ESCUDO DE DURABILIDAD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">Escudo de Protección</span>
                <h3 className="text-xl font-black text-white mt-1">Vida Extra para tus Máquinas</h3>
                <p className="text-xs text-slate-300 mt-1">Evita reparaciones costosas y compras anticipadas.</p>
              </div>

              <div className="text-center my-4">
                <span className="text-5xl font-black text-cyan-300 font-mono">+{calculoPoliticas.anosVidaUtilGanados}</span>
                <span className="text-base text-slate-400 block mt-1">Años de Duración Extra</span>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-300 text-center font-semibold">
                🛡️ {calculoPoliticas.porcentajeCumplimiento}% de buenas prácticas activadas en {negocioInfo.nombre}
              </div>
            </div>
          </div>

          {/* 3 MISIONES DIARIAS PARA EL PERSONAL */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Las 3 Misiones Diarias que debe cumplir tu personal
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Instrucciones claras que garantizan el ahorro de luz y el cuidado de los equipos:
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="text-2xl">❄️</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Misión 1: Climas fijos en 24°C - 25°C</h4>
                  <p className="text-slate-400 mt-0.5">
                    Prohibido poner los minisplits a 18°C. Ponerlos a 24°C enfría igual y te ahorra <strong>$380 MXN al mes</strong> en luz.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Misión 2: Planchas y Calderas por Lotes</h4>
                  <p className="text-slate-400 mt-0.5">
                    No calentar la plancha de sublimación ni caldera para 1 sola prenda. Juntar tandas continuas de 10 a 20 prendas.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="text-2xl">🌙</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Misión 3: Cierre Cero Vampiros a las 7:00 PM</h4>
                  <p className="text-slate-400 mt-0.5">
                    Apagar el botón maestro de regletas y computadoras para no regalarle luz a CFE durante la noche.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MÓDULOS TÉCNICOS (`uvie`, `tablero`, `unifilar`, `balanceador`, `piePlano`) */}
      {/* ========================================================================= */}
      {(['uvie', 'tablero', 'unifilar', 'balanceador', 'piePlano'].includes(activeTab)) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center max-w-3xl mx-auto space-y-6">
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
