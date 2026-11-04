import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  TrendingDown, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  FileText, 
  Printer, 
  Sliders, 
  DollarSign, 
  Thermometer, 
  Wind, 
  Power, 
  Info, 
  Check, 
  X, 
  Cpu, 
  Search, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import { 
  CATALOGO_POLITICAS_NEGOCIOS, 
  calcularAhorroPoliticasNegocio, 
  calcularConsolidadoPoliticasConsorcio 
} from '../utils/motorPoliticasEficiencia';
import { NEGOCIOS_CONFIG } from '../utils/equiposNegocios';

const STORAGE_KEY = 'sge_politicas_negocios_v2';

export default function PoliticasEficiencia({
  aparatos = [],
  sales,
  salesEqualizer,
  efficientPolicies = {},
  setEfficientPolicies,
  tarifas = {},
  costosMEM = {},
  diasPeriodo = 30,
  proyectoId = 'consorcio_general',
  medidores = []
}) {
  // 1. Negocio Inicial basado en el proyecto activo
  const negocioInicial = useMemo(() => {
    if (proyectoId && CATALOGO_POLITICAS_NEGOCIOS[proyectoId]) {
      return proyectoId;
    }
    return 'imperia_uniformes';
  }, [proyectoId]);

  const [negocioActivoId, setNegocioActivoId] = useState(negocioInicial);
  const [vistaConsolidada, setVistaConsolidada] = useState(proyectoId === 'consorcio_general');
  const [filtroPilar, setFiltroPilar] = useState('todos'); // 'todos' | 'activo' | 'pasivo' | 'usuario'
  const [busqueda, setBusqueda] = useState('');
  const [modalProtocolo, setModalProtocolo] = useState(false);

  // Sincronizar negocio si cambia el proyecto superior
  useEffect(() => {
    if (proyectoId && CATALOGO_POLITICAS_NEGOCIOS[proyectoId]) {
      setNegocioActivoId(proyectoId);
      setVistaConsolidada(false);
    } else if (proyectoId === 'consorcio_general') {
      setVistaConsolidada(true);
    }
  }, [proyectoId]);

  // 2. Estado de políticas seleccionadas { [negocioId]: { [polId]: boolean } }
  const [politicasSeleccionadasPorNegocio, setPoliticasSeleccionadasPorNegocio] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) return JSON.parse(guardado);
    } catch (e) {
      console.warn('Error leyendo politicas desde localStorage:', e);
    }

    // Inicializar todas en true por defecto
    const inicial = {};
    Object.keys(CATALOGO_POLITICAS_NEGOCIOS).forEach(negId => {
      inicial[negId] = {};
      const neg = CATALOGO_POLITICAS_NEGOCIOS[negId];
      neg.equipos.forEach(eq => {
        [...eq.politicasActivas, ...eq.politicasPasivas, ...eq.accionesUsuario].forEach(pol => {
          inicial[negId][pol.id] = true;
        });
      });
    });
    return inicial;
  });

  // Guardar en localStorage cada vez que cambien
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(politicasSeleccionadasPorNegocio));
    } catch (e) {
      console.warn('Error guardando politicas en localStorage:', e);
    }
  }, [politicasSeleccionadasPorNegocio]);

  // Negocio actual y sus políticas
  const negocioData = CATALOGO_POLITICAS_NEGOCIOS[negocioActivoId] || CATALOGO_POLITICAS_NEGOCIOS.imperia_uniformes;
  const seleccionesNegocioActual = politicasSeleccionadasPorNegocio[negocioActivoId] || {};

  // Cálculo para el negocio activo
  const calculoNegocio = useMemo(() => {
    return calcularAhorroPoliticasNegocio({
      negocioId: negocioActivoId,
      politicasSeleccionadas: seleccionesNegocioActual,
      diasPeriodo,
      tarifas,
      costosMEM,
      aparatos
    });
  }, [negocioActivoId, seleccionesNegocioActual, diasPeriodo, tarifas, costosMEM, aparatos]);

  // Cálculo consolidado para todo el consorcio
  const calculoConsolidado = useMemo(() => {
    return calcularConsolidadoPoliticasConsorcio({
      politicasPorNegocio: politicasSeleccionadasPorNegocio,
      diasPeriodo,
      tarifas,
      costosMEM,
      aparatos
    });
  }, [politicasSeleccionadasPorNegocio, diasPeriodo, tarifas, costosMEM, aparatos]);

  // Handlers para activar / desactivar
  const togglePolitica = (polId) => {
    setPoliticasSeleccionadasPorNegocio(prev => {
      const actualNeg = prev[negocioActivoId] || {};
      const estadoActual = actualNeg[polId] !== false;
      return {
        ...prev,
        [negocioActivoId]: {
          ...actualNeg,
          [polId]: !estadoActual
        }
      };
    });
  };

  const activarTodasNegocio = () => {
    setPoliticasSeleccionadasPorNegocio(prev => {
      const nuevoNeg = { ...(prev[negocioActivoId] || {}) };
      negocioData.equipos.forEach(eq => {
        [...eq.politicasActivas, ...eq.politicasPasivas, ...eq.accionesUsuario].forEach(p => {
          nuevoNeg[p.id] = true;
        });
      });
      return {
        ...prev,
        [negocioActivoId]: nuevoNeg
      };
    });
  };

  const desactivarTodasNegocio = () => {
    setPoliticasSeleccionadasPorNegocio(prev => {
      const nuevoNeg = { ...(prev[negocioActivoId] || {}) };
      negocioData.equipos.forEach(eq => {
        [...eq.politicasActivas, ...eq.politicasPasivas, ...eq.accionesUsuario].forEach(p => {
          nuevoNeg[p.id] = false;
        });
      });
      return {
        ...prev,
        [negocioActivoId]: nuevoNeg
      };
    });
  };

  // Filtrado de equipos y políticas según pilar y texto de búsqueda
  const equiposFiltrados = useMemo(() => {
    if (!negocioData || !negocioData.equipos) return [];

    return negocioData.equipos.map(eq => {
      // Filtrar políticas según pilar
      let politicasEquipo = [];
      if (filtroPilar === 'todos') {
        politicasEquipo = [
          ...eq.politicasActivas.map(p => ({ ...p, categoriaPilar: 'activo' })),
          ...eq.politicasPasivas.map(p => ({ ...p, categoriaPilar: 'pasivo' })),
          ...eq.accionesUsuario.map(p => ({ ...p, categoriaPilar: 'usuario' }))
        ];
      } else if (filtroPilar === 'activo') {
        politicasEquipo = eq.politicasActivas.map(p => ({ ...p, categoriaPilar: 'activo' }));
      } else if (filtroPilar === 'pasivo') {
        politicasEquipo = eq.politicasPasivas.map(p => ({ ...p, categoriaPilar: 'pasivo' }));
      } else if (filtroPilar === 'usuario') {
        politicasEquipo = eq.accionesUsuario.map(p => ({ ...p, categoriaPilar: 'usuario' }));
      }

      // Filtrar por término de búsqueda si existe
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase();
        const coincideEquipo = eq.nombre.toLowerCase().includes(query) || eq.tipo.toLowerCase().includes(query);
        if (!coincideEquipo) {
          politicasEquipo = politicasEquipo.filter(p => 
            p.titulo.toLowerCase().includes(query) || 
            p.descripcion.toLowerCase().includes(query) ||
            p.beneficioVidaUtil.toLowerCase().includes(query)
          );
        }
      }

      return {
        ...eq,
        politicasMostradas: politicasEquipo
      };
    }).filter(eq => eq.politicasMostradas.length > 0);
  }, [negocioData, filtroPilar, busqueda]);

  // Lista de negocios para los tabs
  const listaNegocios = Object.values(CATALOGO_POLITICAS_NEGOCIOS);

  return (
    <div className="space-y-6">
      {/* 1. HEADER PRINCIPAL */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30 backdrop-blur-sm shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Políticas de Eficiencia y Longevidad de Maquinaria
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono uppercase">
                    3 Pilares Integrados
                  </span>
                </h1>
                <p className="text-slate-400 text-sm">
                  Optimización de consumo eléctrico en CFE y extensión de vida útil de equipos para los 7 negocios del consorcio.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
            <button
              onClick={() => setModalProtocolo(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Manual y Protocolos de Taller
            </button>
            <button
              onClick={activarTodasNegocio}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-all cursor-pointer"
              title="Activar todas las recomendaciones en este negocio"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Activar Todas
            </button>
            <button
              onClick={desactivarTodasNegocio}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-all cursor-pointer"
              title="Desactivar todas para comparar línea base sin políticas"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              Desactivar Todas
            </button>
          </div>
        </div>
      </div>

      {/* 2. SELECTOR DE NEGOCIOS Y MODO CONSOLIDADO */}
      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          <button
            onClick={() => setVistaConsolidada(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              vistaConsolidada
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            Consolidado Consorcio (7 Negocios)
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 flex-shrink-0" />

          {listaNegocios.map(neg => {
            const isSelected = !vistaConsolidada && negocioActivoId === neg.id;
            return (
              <button
                key={neg.id}
                onClick={() => {
                  setNegocioActivoId(neg.id);
                  setVistaConsolidada(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{neg.icono === 'Shirt' ? '👔' : neg.icono === 'BookOpen' ? '🖨️' : neg.icono === 'Coffee' ? '🥞' : neg.icono === 'Layers' ? '🧵' : neg.icono === 'Scissors' ? '🪡' : neg.icono === 'Sparkles' ? '🎨' : '🏢'}</span>
                <span>{neg.nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-800/60 text-indigo-200' : 'bg-slate-800 text-slate-400 font-mono'}`}>
                  {neg.medidorId.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VISTA CONSOLIDADA O VISTA DE NEGOCIO INDIVIDUAL */}
      {vistaConsolidada ? (
        /* ================= VISTA CONSOLIDADA DEL CONSORCIO ================= */
        <div className="space-y-6">
          {/* Tarjetas KPI Consorcio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Ahorro Mensual Consorcio</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {calculoConsolidado.ahorroKwhMesConsorcio.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh/mes</span>
              </div>
              <div className="text-emerald-400 font-bold text-sm mt-1">
                ≈ ${calculoConsolidado.ahorroPesosMesConsorcio.toLocaleString()} MXN / mes
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Suma de los 6 medidores en tarifa comercial/residencial</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Ahorro Anual Proyectado</span>
                <TrendingDown className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300">
                ${calculoConsolidado.ahorroPesosAnualConsorcio.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN/año</span>
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Impacto directo a rentabilidad operativa
              </div>
              <p className="text-[11px] text-indigo-400/80 mt-2">Evita escalón de cobro punitivo CFE</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Inversión en Sistemas</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">
                ${calculoConsolidado.inversionConsorcioTotal.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN</span>
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Payback Consorcio: <span className="text-amber-400 font-bold">
                  {calculoConsolidado.ahorroPesosMesConsorcio > 0 
                    ? (calculoConsolidado.inversionConsorcioTotal / calculoConsolidado.ahorroPesosMesConsorcio).toFixed(1) 
                    : 0} meses
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Sensores, películas solares, PID y protecciones</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Políticas Implementadas</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {calculoConsolidado.totalPoliticasActivas} <span className="text-xs font-normal text-slate-400">/ {calculoConsolidado.totalPoliticasTotales}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calculoConsolidado.porcentajeConsorcio}%` }}
                />
              </div>
              <p className="text-[11px] text-cyan-400 mt-1 font-mono">{calculoConsolidado.porcentajeConsorcio}% de cumplimiento global</p>
            </div>
          </div>

          {/* Tabla de Desglose por Negocio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Matriz Consolidada de Eficiencia por Negocio
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Negocio / Unidad</th>
                    <th className="py-3 px-3">Medidor</th>
                    <th className="py-3 px-3">Políticas</th>
                    <th className="py-3 px-3 text-right">Ahorro kWh/mes</th>
                    <th className="py-3 px-3 text-right">Ahorro $/mes</th>
                    <th className="py-3 px-3 text-right">Ahorro Anual</th>
                    <th className="py-3 px-3 text-right">Inversión</th>
                    <th className="py-3 px-3 text-center">Longevidad Ganada</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {Object.keys(calculoConsolidado.resultadosPorNegocio).map(negId => {
                    const res = calculoConsolidado.resultadosPorNegocio[negId];
                    const negDef = CATALOGO_POLITICAS_NEGOCIOS[negId];
                    return (
                      <tr key={negId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                          <span>{negDef.icono === 'Shirt' ? '👔' : negDef.icono === 'BookOpen' ? '🖨️' : negDef.icono === 'Coffee' ? '🥞' : negDef.icono === 'Layers' ? '🧵' : negDef.icono === 'Scissors' ? '🪡' : negDef.icono === 'Sparkles' ? '🎨' : '🏢'}</span>
                          <span>{res.negocioNombre}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-indigo-400">
                          {res.medidorId.toUpperCase()}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          <span className="font-semibold text-slate-200">{res.totalPoliticasActivasCount}</span>
                          <span className="text-slate-500"> / {res.totalPoliticasPosibles}</span>
                          <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {res.porcentajeCumplimiento}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 font-medium">
                          {res.totalAhorroKwhMes} kWh
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          ${res.ahorroPesosMes.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-indigo-300">
                          ${res.ahorroPesosAnual.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-amber-400">
                          ${res.inversionImplementacionTotal.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            +{res.anosVidaUtilGanados} años
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setNegocioActivoId(negId);
                              setVistaConsolidada(false);
                            }}
                            className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Ver Equipos →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 5 Medidas de Mayor Impacto en el Consorcio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Estrategias Transversales de Mayor Retorno para el Consorcio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                  <Thermometer className="w-4 h-4" />
                  1. Estandarización de Setpoint a 24°C
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aplicado en los 7 negocios. Bajar de 24°C a 18°C aumenta 35% el consumo de compresores sin enfriar más rápido y satura la red en horas pico de calor.
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-400">Ahorro estimado: ~380 kWh/mes en consorcio</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Wind className="w-4 h-4" />
                  2. Aislamiento Pasivo & Películas Solares
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instalar películas nano-cerámicas en ventanales de exhibición y cortinas de aire en accesos de Imperia y Papelería reduce la carga térmica en hasta 2 TR.
                </p>
                <div className="mt-3 text-[11px] font-mono text-amber-400">Payback promedio: 4.2 meses</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <Power className="w-4 h-4" />
                  3. Batching & Encendido Escalonado
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agrupar tirajes de sublimación (plancha 40x60), creperas y calderas de vapor evita ciclado en frío y picos de demanda coincidente que disparan interruptores.
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-400">Extensión de vida: +3 a 5 años en resistencias</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VISTA INDIVIDUAL DE UN NEGOCIO ================= */
        <div className="space-y-6">
          {/* Ficha de Identidad del Negocio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-400">
                <span>Unidad Operativa</span>
                <span>•</span>
                <span>Medidor CFE: {negocioData.medidorId.toUpperCase()}</span>
                <span>•</span>
                <span>{negocioData.equipos.length} Equipos Mapeados</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>{negocioData.icono === 'Shirt' ? '👔' : negocioData.icono === 'BookOpen' ? '🖨️' : negocioData.icono === 'Coffee' ? '🥞' : negocioData.icono === 'Layers' ? '🧵' : negocioData.icono === 'Scissors' ? '🪡' : negocioData.icono === 'Sparkles' ? '🎨' : '🏢'}</span>
                <span>{negocioData.nombre}</span>
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">{negocioData.subtitulo}</p>
            </div>

            {/* Selector de Pilares */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setFiltroPilar('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filtroPilar === 'todos' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({calculoNegocio.totalPoliticasPosibles})
              </button>
              <button
                onClick={() => setFiltroPilar('activo')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filtroPilar === 'activo' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-blue-300" />
                Sistemas Activos
              </button>
              <button
                onClick={() => setFiltroPilar('pasivo')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filtroPilar === 'pasivo' 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-amber-300" />
                Sistemas Pasivos
              </button>
              <button
                onClick={() => setFiltroPilar('usuario')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filtroPilar === 'usuario' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Acciones del Operador
              </button>
            </div>
          </div>

          {/* Tarjetas KPI de este Negocio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Ahorro Mensual</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {calculoNegocio.totalAhorroKwhMes} <span className="text-xs font-normal text-slate-400">kWh/mes</span>
              </div>
              <div className="text-emerald-400 font-bold text-sm">
                ≈ ${calculoNegocio.ahorroPesosMes.toLocaleString()} MXN / mes
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Ahorro Anual Proyectado</span>
                <TrendingDown className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300">
                ${calculoNegocio.ahorroPesosAnual.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN/año</span>
              </div>
              <div className="text-slate-400 text-xs">
                Ahorro neto acumulado 12 meses
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Inversión Requerida</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">
                ${calculoNegocio.inversionImplementacionTotal.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN</span>
              </div>
              <div className="text-slate-400 text-xs">
                Payback: <span className="text-amber-400 font-bold">
                  {calculoNegocio.ahorroPesosMes > 0 
                    ? (calculoNegocio.inversionImplementacionTotal / calculoNegocio.ahorroPesosMes).toFixed(1) 
                    : 0} meses
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Longevidad de Maquinaria</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300">
                +{calculoNegocio.anosVidaUtilGanados} <span className="text-xs font-normal text-slate-400">Años Extra</span>
              </div>
              <div className="text-slate-400 text-xs">
                {calculoNegocio.totalPoliticasActivasCount} de {calculoNegocio.totalPoliticasPosibles} medidas ({calculoNegocio.porcentajeCumplimiento}%)
              </div>
            </div>
          </div>

          {/* Barra de Búsqueda rápida */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por equipo, política, sensor, compresor, setpoint..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* LISTADO DE EQUIPOS Y POLÍTICAS */}
          <div className="space-y-6">
            {equiposFiltrados.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <Info className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-base font-semibold text-white">No hay políticas que coincidan con el filtro</p>
                <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otro pilar o limpiando el texto de búsqueda.</p>
              </div>
            ) : (
              equiposFiltrados.map(eq => {
                const totalPoliticasEq = eq.politicasMostradas.length;
                const activasEq = eq.politicasMostradas.filter(p => seleccionesNegocioActual[p.id] !== false).length;
                const ahorroEqKwh = eq.politicasMostradas
                  .filter(p => seleccionesNegocioActual[p.id] !== false)
                  .reduce((acc, p) => acc + (p.ahorroKwhMes || 0), 0);

                return (
                  <div key={eq.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    {/* Encabezado del Equipo */}
                    <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                          {eq.icono}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{eq.nombre}</h3>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                              {eq.watts} W
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{eq.tipo} • ~{eq.horasUsoDefault} h/día de operación</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                          Ahorro Equipo: <span className="font-mono font-bold text-emerald-400">{ahorroEqKwh.toFixed(1)} kWh/mes</span>
                        </div>
                        <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                          Políticas: <span className="font-mono font-bold text-indigo-400">{activasEq} / {totalPoliticasEq}</span>
                        </div>
                      </div>
                    </div>

                    {/* Políticas de este Equipo */}
                    <div className="p-6 divide-y divide-slate-800/60 space-y-4">
                      {eq.politicasMostradas.map((pol, idx) => {
                        const isActiva = seleccionesNegocioActual[pol.id] !== false;
                        const esActivo = pol.categoriaPilar === 'activo';
                        const esPasivo = pol.categoriaPilar === 'pasivo';
                        const esUsuario = pol.categoriaPilar === 'usuario';

                        return (
                          <div 
                            key={pol.id} 
                            className={`pt-4 first:pt-0 transition-all rounded-xl p-3 -mx-3 ${
                              isActiva ? 'bg-slate-950/30' : 'bg-slate-950/10 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                {/* Toggle Checkbox */}
                                <button
                                  onClick={() => togglePolitica(pol.id)}
                                  className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 ${
                                    isActiva 
                                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30' 
                                      : 'bg-slate-800 border-slate-700 text-transparent hover:border-slate-500'
                                  }`}
                                  title={isActiva ? 'Desactivar esta política' : 'Activar esta política'}
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>

                                <div className="space-y-1.5 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className={`text-sm font-bold transition-colors ${isActiva ? 'text-white' : 'text-slate-400 line-through'}`}>
                                      {pol.titulo}
                                    </h4>

                                    {/* Badge de Pilar */}
                                    {esActivo && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/70">
                                        <Zap className="w-3 h-3" /> Sistema Activo
                                      </span>
                                    )}
                                    {esPasivo && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/70">
                                        <Wind className="w-3 h-3" /> Sistema Pasivo
                                      </span>
                                    )}
                                    {esUsuario && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/70">
                                        <ShieldCheck className="w-3 h-3" /> Acción del Operador
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    {pol.descripcion}
                                  </p>

                                  {/* Criterio de Longevidad / Protección */}
                                  <div className="flex items-start gap-1.5 text-xs text-cyan-400 bg-cyan-950/30 border border-cyan-900/40 p-2 rounded-lg mt-2">
                                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-cyan-300 mt-0.5" />
                                    <span>
                                      <strong className="text-cyan-200">Impacto en Longevidad:</strong> {pol.beneficioVidaUtil}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Métricas de Ahorro e Inversión */}
                              <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                                {pol.ahorroKwhMes > 0 && (
                                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                                    -{pol.ahorroKwhMes} kWh/mes (-{pol.ahorroPct}%)
                                  </div>
                                )}
                                <div className="text-[11px] font-mono text-slate-400">
                                  {pol.costoImplementacion > 0 ? (
                                    <span className="text-amber-400 font-semibold">
                                      Inv: ${pol.costoImplementacion.toLocaleString()} MXN
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-sans">
                                      $0 (Práctica Operativa)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL / DRAWER DE MANUAL DE PROCEDIMIENTOS Y PROTOCOLOS IMPRIMIBLE */}
      {modalProtocolo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Manual de Buenas Prácticas & Checklist Operativo de Taller
                  </h3>
                  <p className="text-xs text-slate-400">
                    Protocolos estandarizados para encargados de tienda y operadores de maquinaria (Consorcio Casa Alacio Pérez).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar PDF
                </button>
                <button
                  onClick={() => setModalProtocolo(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
              {/* Sección 1: Encendido Escalonado */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-base">
                  <Clock className="w-5 h-5" />
                  1. Protocolo de Apertura: Encendido Escalonado (08:30 - 09:30 AM)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prohibido encender todos los equipos de forma simultánea. Las corrientes de arranque de motores e inductancias (minisplits, compresor, bordadora Tajima) generan un pico transitorio que dispara el interruptor termomagnético y eleva la demanda máxima de facturación CFE.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-indigo-400 block mb-1">Paso 1 (Minuto 0):</span>
                    Iluminación general LED y cómputo de mostrador TPV.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-indigo-400 block mb-1">Paso 2 (Minuto 15):</span>
                    Minisplits a 24°C fijos. Esperar 10 minutos para que el inversor estabilice revoluciones.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-indigo-400 block mb-1">Paso 3 (Minuto 30):</span>
                    Maquinaria industrial de producción (Overlock, Bordadora, Crepera, Caldera Silver Star).
                  </div>
                </div>
              </div>

              {/* Sección 2: Operación y Batching */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-base">
                  <Layers className="w-5 h-5" />
                  2. Protocolo Durante el Turno: Agrupación de Lotes (Batching)
                </div>
                <ul className="space-y-2 text-xs list-disc list-inside text-slate-300">
                  <li>
                    <strong>Plancha 40x60 Sublimación (Publi-Imperia):</strong> Prohibido encender la plancha para estampar 1 sola prenda aislada. Acumular lotes de mínimo 10 a 20 prendas antes de energizar la resistencia térmica a 180°C.
                  </li>
                  <li>
                    <strong>Caldera Silver Star (Taller de Costura):</strong> Utilizar únicamente agua purificada baja en sales o desmineralizada. Mantener encendida en bloques continuos de planchado. Desconectar si la pausa de costura supera 25 minutos.
                  </li>
                  <li>
                    <strong>Crepera Krampouz & Marquesitera (Hawaiian):</strong> En horas de baja afluencia (10:00 - 13:00), operar con solo 1 crepera activa. Encender la segunda plancha únicamente cuando haya cola de pedidos.
                  </li>
                  <li>
                    <strong>Xerox DocuColor (Papelería):</strong> Agrupar tirajes de manuales o copias mayores a 20 hojas. La máquina entra en suspensión automática en 5 minutos.
                  </li>
                </ul>
              </div>

              {/* Sección 3: Cierre Cero Vampiros */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-base">
                  <Power className="w-5 h-5" />
                  3. Protocolo de Cierre: Política "Cero Cargas Vampiro" (07:00 PM)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                    <span>Apagar interruptor maestro de regletas en mostrador TPV y monitores.</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                    <span>Desconectar transformadores de impresoras EPSON y enmicadoras térmicas.</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                    <span>Verificar corte de energía en servomotores de costura y láser CO2.</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                    <span>Purgar compresor neumático y cortar alimentación nocturna.</span>
                  </label>
                </div>
              </div>

              {/* Sección 4: Mantenimiento Preventivo */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-cyan-400 text-base">
                  <Wrench className="w-5 h-5" />
                  4. Mantenimiento Preventivo Semanal para Longevidad
                </div>
                <div className="space-y-2 text-xs">
                  <p>
                    • <strong>Cada Sábado:</strong> Lavar con agua tibia y jabón neutro las mallas de los minisplits de Showroom y Taller. La pelusa de tela tupida en el evaporador aumenta 20% el consumo y recalienta el motor soplador.
                  </p>
                  <p>
                    • <strong>Cada 2 Días:</strong> Retirar pelusa y colocar 2 gotas de aceite blanco industrial en el garfio rotatorio Koban de la bordadora Tajima y lanzaderas Juki.
                  </p>
                  <p>
                    • <strong>Mensual:</strong> Cepillar serpentín condensador exterior de la vitrina Torrey en Hawaiian Paradise y aspirar rejillas de ventilación de la Xerox DocuColor.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setModalProtocolo(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cerrar Manual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
