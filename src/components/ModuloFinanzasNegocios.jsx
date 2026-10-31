import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Scale, 
  HelpCircle, 
  Sparkles, 
  Download, 
  Building2,
  PieChart,
  Calculator,
  RotateCcw,
  Users,
  FileSpreadsheet,
  Coins,
  Layers,
  LayoutGrid
} from 'lucide-react';

import SelectorNegocioFinanzas, { NEGOCIOS_METADATA } from './finanzas/SelectorNegocioFinanzas';
import SimuladorDiaVenta from './finanzas/SimuladorDiaVenta';
import EstadoResultadosMensual from './finanzas/EstadoResultadosMensual';
import TablaCostosYPrecios from './finanzas/TablaCostosYPrecios';
import ConsolidadoConsorcioFinanzas from './finanzas/ConsolidadoConsorcioFinanzas';
import PanelNominaYTurnos from './finanzas/PanelNominaYTurnos';

import { 
  SUPERFICIE_INMUEBLE, 
  TABLA_RENTAS_INMUEBLE, 
  TABLA_AGUA_INMUEBLE, 
  TABLA_HVAC_INMUEBLE, 
  obtenerCostosFijosInmueble 
} from '../utils/costosFijosInmueble.js';

import { 
  CATALOGO_PRECIOS_COSTOS, 
  obtenerProductosNegocio, 
  calcularMargenProducto 
} from '../utils/preciosYCostosProductos.js';

import { 
  calibrarNivelesVentaFinancieros, 
  calcularPuntoEquilibrio, 
  calcularEstadoResultados 
} from '../utils/motorPuntoEquilibrio.js';

import { 
  PLANTILLA_DEFAULT_NEGOCIOS, 
  SALARIO_MINIMO_CONFIG,
  calcularNominaNegocio 
} from '../utils/nominaYTurnosNegocios.js';

export default function ModuloFinanzasNegocios({
  aparatos = [],
  tarifas = {},
  costosMEM = {},
  medidores = [],
  proyectoId = 'consorcio_general'
}) {
  // Negocio actualmente seleccionado
  const [negocioSeleccionado, setNegocioSeleccionado] = useState('hawaiian_paradise');
  
  // Escenario mensual activo ('bajo', 'medio', 'alto', 'muy_alto')
  const [escenarioActivo, setEscenarioActivo] = useState('alto');

  // Subpestaña activa en la vista de negocio ('todos' | 'simulador' | 'pnl' | 'nomina' | 'precios')
  const [subtabNegocio, setSubtabNegocio] = useState('todos');

  // Días laborales al mes (default 26 días)
  const [diasLaborales, setDiasLaborales] = useState(26);

  // Configuración de nómina, empleados y turnos por negocio (con persistencia en localStorage)
  const [configNominaPorNegocio, setConfigNominaPorNegocio] = useState(() => {
    try {
      const saved = localStorage.getItem('sge_finanzas_nomina_v1');
      return saved ? JSON.parse(saved) : PLANTILLA_DEFAULT_NEGOCIOS;
    } catch (e) {
      return PLANTILLA_DEFAULT_NEGOCIOS;
    }
  });

  // Salario Mínimo General Vigente de referencia
  const [salarioMinimoMensual, setSalarioMinimoMensual] = useState(() => {
    try {
      const saved = localStorage.getItem('sge_finanzas_salario_minimo');
      return saved ? parseFloat(saved) : SALARIO_MINIMO_CONFIG.mensual;
    } catch (e) {
      return SALARIO_MINIMO_CONFIG.mensual;
    }
  });

  // Gastos adicionales configurables por negocio
  const [gastosExtrasPorNegocio, setGastosExtrasPorNegocio] = useState(() => {
    try {
      const saved = localStorage.getItem('sge_finanzas_gastos_extras');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Overrides de productos (precios y costos modificados por el usuario)
  const [productosOverrides, setProductosOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('sge_finanzas_productos_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Sincronización en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sge_finanzas_nomina_v1', JSON.stringify(configNominaPorNegocio));
    } catch (e) {}
  }, [configNominaPorNegocio]);

  useEffect(() => {
    try {
      localStorage.setItem('sge_finanzas_salario_minimo', salarioMinimoMensual.toString());
    } catch (e) {}
  }, [salarioMinimoMensual]);

  useEffect(() => {
    try {
      localStorage.setItem('sge_finanzas_gastos_extras', JSON.stringify(gastosExtrasPorNegocio));
    } catch (e) {}
  }, [gastosExtrasPorNegocio]);

  useEffect(() => {
    try {
      localStorage.setItem('sge_finanzas_productos_overrides', JSON.stringify(productosOverrides));
    } catch (e) {}
  }, [productosOverrides]);

  // Artículos vendidos en la jornada del día para el simulador interactivo
  const [articulosVendidosMap, setArticulosVendidosMap] = useState({});

  // Obtener productos vigentes del negocio activo (con posibles overrides del usuario)
  const productosNegocioActivo = useMemo(() => {
    if (negocioSeleccionado === 'consolidado') return [];
    const baseProds = CATALOGO_PRECIOS_COSTOS[negocioSeleccionado] || [];
    const overrides = productosOverrides[negocioSeleccionado] || {};

    return baseProds.map(p => {
      const userP = overrides[p.id] || {};
      const merged = {
        ...p,
        precioVenta: userP.precioVenta !== undefined ? userP.precioVenta : p.precioVenta,
        costoMateriales: userP.costoMateriales !== undefined ? userP.costoMateriales : p.costoMateriales,
        costoManoObra: userP.costoManoObra !== undefined ? userP.costoManoObra : p.costoManoObra
      };
      return calcularMargenProducto(merged);
    });
  }, [negocioSeleccionado, productosOverrides]);

  // Recibo de luz estimado o real según medidor
  const reciboLuzNegocio = useMemo(() => {
    if (negocioSeleccionado === 'consolidado') return null;
    const hvac = TABLA_HVAC_INMUEBLE[negocioSeleccionado];
    return hvac ? (hvac.kwhMensualEstimado * 3.8) : 800;
  }, [negocioSeleccionado]);

  // Configuración de nómina activa del negocio seleccionado
  const nominaConfigActiva = useMemo(() => {
    if (negocioSeleccionado === 'consolidado') return null;
    return configNominaPorNegocio[negocioSeleccionado] || PLANTILLA_DEFAULT_NEGOCIOS[negocioSeleccionado] || PLANTILLA_DEFAULT_NEGOCIOS.hawaiian_paradise;
  }, [negocioSeleccionado, configNominaPorNegocio]);

  // Calibración de Punto de Equilibrio y Escenarios para el negocio activo (incluye nómina e IMSS)
  const calibracionActiva = useMemo(() => {
    if (negocioSeleccionado === 'consolidado') return null;
    const extras = gastosExtrasPorNegocio[negocioSeleccionado] || { sueldos: 0, otros: 0 };

    return calibrarNivelesVentaFinancieros({
      negocioId: negocioSeleccionado,
      diasLaborales,
      reciboLuzReal: reciboLuzNegocio,
      sueldosFijosExtras: extras.sueldos || 0,
      otrosGastosFijos: extras.otros || 0,
      productosPersonalizados: productosNegocioActivo,
      configNomina: nominaConfigActiva,
      salarioMinimoMensual
    });
  }, [negocioSeleccionado, diasLaborales, reciboLuzNegocio, gastosExtrasPorNegocio, productosNegocioActivo, nominaConfigActiva, salarioMinimoMensual]);

  // Inicializar o sincronizar el simulador diario cuando se selecciona un preset o cambia de negocio
  const aplicarPresetDia = useCallback((tipo) => {
    if (!calibracionActiva || !productosNegocioActivo.length) return;

    if (tipo === 'cero') {
      const nuevo = {};
      productosNegocioActivo.forEach(p => { nuevo[p.id] = 0; });
      setArticulosVendidosMap(nuevo);
      return;
    }

    if (tipo === 'bajo') {
      const bajo = calibracionActiva.escenarios.bajo;
      const nuevo = {};
      let acumulado = 0;
      productosNegocioActivo.forEach((p, idx) => {
        const sugerido = Math.min(2, Math.round((bajo.cantidades[p.id] || 0) / diasLaborales));
        if (acumulado + sugerido <= 10) {
          nuevo[p.id] = Math.max(idx < 3 ? 1 : 0, sugerido);
          acumulado += nuevo[p.id];
        } else {
          nuevo[p.id] = 0;
        }
      });
      setArticulosVendidosMap(nuevo);
      return;
    }

    if (tipo === 'equilibrio') {
      const peDia = Math.ceil(calibracionActiva?.puntoEquilibrio?.puntoEquilibrio?.unidadesDia || calibracionActiva?.puntoEquilibrio?.unidadesDia || 0);
      const nuevo = {};
      const pesoTotal = productosNegocioActivo.reduce((s, p) => s + (p.pesoEnMix || 1), 0);
      productosNegocioActivo.forEach(p => {
        const fraccion = (p.pesoEnMix || 1) / pesoTotal;
        nuevo[p.id] = Math.max(0, Math.round(peDia * fraccion));
      });
      setArticulosVendidosMap(nuevo);
      return;
    }

    if (tipo === 'medio') {
      const medio = calibracionActiva.escenarios.medio;
      const nuevo = {};
      productosNegocioActivo.forEach(p => {
        nuevo[p.id] = Math.max(0, Math.round((medio.cantidades[p.id] || 0) / diasLaborales));
      });
      setArticulosVendidosMap(nuevo);
      return;
    }

    if (tipo === 'alto') {
      const alto = calibracionActiva.escenarios.alto;
      const nuevo = {};
      productosNegocioActivo.forEach(p => {
        nuevo[p.id] = Math.max(0, Math.round((alto.cantidades[p.id] || 0) / diasLaborales));
      });
      setArticulosVendidosMap(nuevo);
      return;
    }
  }, [calibracionActiva, productosNegocioActivo, diasLaborales]);

  // Inicializar el simulador diario con preset bajo cuando cambia el negocio
  useEffect(() => {
    if (calibracionActiva && productosNegocioActivo.length) {
      aplicarPresetDia('bajo');
    }
  }, [negocioSeleccionado]);

  // Handlers para la nómina y turnos
  const handleUpdateConfigNomina = (nuevoConfig) => {
    setConfigNominaPorNegocio(prev => ({
      ...prev,
      [negocioSeleccionado]: nuevoConfig
    }));
  };

  const handleResetNomina = () => {
    setConfigNominaPorNegocio(prev => ({
      ...prev,
      [negocioSeleccionado]: PLANTILLA_DEFAULT_NEGOCIOS[negocioSeleccionado] || PLANTILLA_DEFAULT_NEGOCIOS.hawaiian_paradise
    }));
  };

  // Manejo de actualización de productos por el usuario
  const handleUpdateProducto = (prodId, fields) => {
    setProductosOverrides(prev => ({
      ...prev,
      [negocioSeleccionado]: {
        ...(prev[negocioSeleccionado] || {}),
        [prodId]: fields
      }
    }));
  };

  const handleResetProductos = () => {
    setProductosOverrides(prev => {
      const nuevo = { ...prev };
      delete nuevo[negocioSeleccionado];
      return nuevo;
    });
  };

  // Manejador del stepper diario
  const handleChangeArticulo = (prodId, cantidad) => {
    setArticulosVendidosMap(prev => ({
      ...prev,
      [prodId]: Math.max(0, cantidad)
    }));
  };

  const handleResetDia = () => {
    aplicarPresetDia('cero');
  };

  // =========================================================================
  // CÁLCULO DEL CONSOLIDADO GENERAL DE LOS 7 NEGOCIOS (INCLUYE NÓMINA E IMSS)
  // =========================================================================
  const { consolidadoRows, consolidadoTotales } = useMemo(() => {
    const rows = [];
    let rentaTotalConIva = 0;
    let aguaTotal = 0;
    let luzTotal = 0;
    let nominaTotalConsorcio = 0;
    let gastosFijosTotales = 0;
    let ingresosBrutosTotales = 0;
    let utilidadBrutaTotal = 0;
    let utilidadNetaTotal = 0;

    const listaNegocios = NEGOCIOS_METADATA.filter(n => n.id !== 'consolidado');

    listaNegocios.forEach(neg => {
      const renta = TABLA_RENTAS_INMUEBLE[neg.id];
      const agua = TABLA_AGUA_INMUEBLE[neg.id];
      const hvac = TABLA_HVAC_INMUEBLE[neg.id];
      const luz = hvac ? (hvac.kwhMensualEstimado * 3.8) : 800;

      const baseProds = CATALOGO_PRECIOS_COSTOS[neg.id] || [];
      const userOverrides = productosOverrides[neg.id] || {};
      const prods = baseProds.map(p => {
        const u = userOverrides[p.id] || {};
        return calcularMargenProducto({
          ...p,
          precioVenta: u.precioVenta !== undefined ? u.precioVenta : p.precioVenta,
          costoMateriales: u.costoMateriales !== undefined ? u.costoMateriales : p.costoMateriales,
          costoManoObra: u.costoManoObra !== undefined ? u.costoManoObra : p.costoManoObra
        });
      });

      const extras = gastosExtrasPorNegocio[neg.id] || { sueldos: 0, otros: 0 };
      const nominaConfig = configNominaPorNegocio[neg.id] || PLANTILLA_DEFAULT_NEGOCIOS[neg.id] || PLANTILLA_DEFAULT_NEGOCIOS.hawaiian_paradise;

      const calib = calibrarNivelesVentaFinancieros({
        negocioId: neg.id,
        diasLaborales,
        reciboLuzReal: luz,
        sueldosFijosExtras: extras.sueldos || 0,
        otrosGastosFijos: extras.otros || 0,
        productosPersonalizados: prods,
        configNomina: nominaConfig,
        salarioMinimoMensual
      });

      const esc = calib.escenarios[escenarioActivo] || calib.escenarios.alto;
      const pnl = esc.pnl;
      const gf = calib.costosFijos.gastosFijosTotales;
      const nominaTotal = calib.costosFijos.totalCostoLaboral;
      const empCount = calib.costosFijos.nominaDetalle?.totalEmpleados || 0;

      rentaTotalConIva += renta.rentaConIva;
      aguaTotal += agua.montoMensual;
      luzTotal += luz;
      nominaTotalConsorcio += nominaTotal;
      gastosFijosTotales += gf;
      ingresosBrutosTotales += pnl.ingresosBrutos;
      utilidadBrutaTotal += pnl.utilidadBruta;
      utilidadNetaTotal += pnl.utilidadNeta;

      rows.push({
        negocioId: neg.id,
        nombre: neg.nombre,
        medidor: neg.medidor,
        nivel: renta.nivel,
        areaM2: renta.areaTotalImputadaM2,
        areaPct: renta.porcentajeInmueble,
        rentaConIva: renta.rentaConIva,
        agua: agua.montoMensual,
        luz,
        nominaTotal,
        empleadosCount: empCount,
        gastosFijos: gf,
        ingresos: pnl.ingresosBrutos,
        utilidadBruta: pnl.utilidadBruta,
        utilidadNeta: pnl.utilidadNeta
      });
    });

    return {
      consolidadoRows: rows,
      consolidadoTotales: {
        rentaTotalConIva,
        aguaTotal,
        luzTotal,
        nominaTotal: nominaTotalConsorcio,
        gastosFijosTotales,
        ingresosBrutosTotales,
        utilidadBrutaTotal,
        utilidadNetaTotal
      }
    };
  }, [escenarioActivo, diasLaborales, productosOverrides, gastosExtrasPorNegocio, configNominaPorNegocio, salarioMinimoMensual]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Banner de Presentación del Módulo Financiero */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden no-print">
        <div className="absolute right-0 top-0 p-4 opacity-5">
          <TrendingUp size={140} className="text-teal-400" />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <DollarSign className="text-teal-400" size={24} />
              Finanzas, Nómina, Costos y Rentabilidad por Unidad de Negocio
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans max-w-4xl">
              Modelo financiero integral para la Casa Alacio Pérez: prorrateo milimétrico de Renta con IVA ($10,440.00 MXN), Agua ($1,000.00 MXN), Climatización (3.80 m de altura), CFE y Nómina con Seguro Social IMSS. Simula ventas diarias reales (de 0 a 10 artículos), evalúa el punto de equilibrio y calibra la meta de $20,000 MXN en ganancia neta libre.
            </p>
          </div>

          {/* Días Laborales Input */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">Días Laborales/Mes:</span>
            <input
              type="number"
              min="1"
              max="31"
              value={diasLaborales}
              onChange={(e) => setDiasLaborales(Math.max(1, Math.min(31, parseInt(e.target.value) || 26)))}
              className="w-12 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-teal-300 font-bold font-mono text-xs text-center"
            />
          </div>
        </div>
      </div>

      {/* Selector de Negocio y Ficha de Costos Fijos */}
      <SelectorNegocioFinanzas
        negocioSeleccionado={negocioSeleccionado}
        onSelectNegocio={setNegocioSeleccionado}
        gastosFijosTotales={calibracionActiva?.costosFijos?.gastosFijosTotales || calibracionActiva?.puntoEquilibrio?.costosFijos?.gastosFijosTotales || 0}
        reciboLuzMonto={reciboLuzNegocio}
        costoNominaTotal={calibracionActiva?.costosFijos?.totalCostoLaboral || 0}
        totalEmpleados={calibracionActiva?.costosFijos?.nominaDetalle?.totalEmpleados || 0}
      />

      {/* VISTA CONSOLIDADA GENERAL O VISTA POR NEGOCIO ESPECÍFICO */}
      {negocioSeleccionado === 'consolidado' ? (
        <ConsolidadoConsorcioFinanzas
          consolidadoData={consolidadoRows}
          totalesConsorcio={consolidadoTotales}
          escenarioConsorcio={escenarioActivo}
          onSelectEscenarioConsorcio={setEscenarioActivo}
          onVerDetalleNegocio={(id) => setNegocioSeleccionado(id)}
        />
      ) : (
        <div className="space-y-6">
          {/* Navegación por Subsecciones del Negocio */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
            {[
              { id: 'todos', label: 'Ver Todo (Completo)', icon: LayoutGrid },
              { id: 'simulador', label: 'Simulador Diario', icon: Calculator },
              { id: 'pnl', label: 'Estado de Resultados (P&L)', icon: FileSpreadsheet },
              { id: 'nomina', label: 'Personal, Turnos e IMSS', icon: Users },
              { id: 'precios', label: 'Precios y Costos Unitarios', icon: Coins }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isTabActive = subtabNegocio === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubtabNegocio(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    isTabActive
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Componente 1: Simulador Interactivo de Día de Venta */}
          {(subtabNegocio === 'todos' || subtabNegocio === 'simulador') && (
            <SimuladorDiaVenta
              productos={productosNegocioActivo}
              negocioId={negocioSeleccionado}
              diasLaborales={diasLaborales}
              gastosFijosMensuales={calibracionActiva?.costosFijos?.gastosFijosTotales || calibracionActiva?.puntoEquilibrio?.costosFijos?.gastosFijosTotales || 0}
              articulosVendidosMap={articulosVendidosMap}
              onChangeArticulo={handleChangeArticulo}
              onResetDia={handleResetDia}
              onApplyPreset={aplicarPresetDia}
            />
          )}

          {/* Componente 2: Estado de Resultados Mensual y Comparativa */}
          {(subtabNegocio === 'todos' || subtabNegocio === 'pnl') && calibracionActiva && (
            <EstadoResultadosMensual
              escenarios={calibracionActiva.escenarios}
              escenarioActivo={escenarioActivo}
              onSelectEscenario={setEscenarioActivo}
              pnlActual={calibracionActiva.escenarios[escenarioActivo]?.pnl}
              costosFijosDetalle={calibracionActiva.costosFijos || calibracionActiva.puntoEquilibrio?.costosFijos || {}}
              negocioNombre={NEGOCIOS_METADATA.find(n => n.id === negocioSeleccionado)?.nombre}
            />
          )}

          {/* Componente 3: Panel de Recursos Humanos, Turnos, Salarios Mínimos e IMSS */}
          {(subtabNegocio === 'todos' || subtabNegocio === 'nomina') && (
            <PanelNominaYTurnos
              configNomina={nominaConfigActiva}
              negocioNombre={NEGOCIOS_METADATA.find(n => n.id === negocioSeleccionado)?.nombre}
              negocioId={negocioSeleccionado}
              salarioMinimoMensual={salarioMinimoMensual}
              onUpdateConfigNomina={handleUpdateConfigNomina}
              onResetNomina={handleResetNomina}
              onUpdateSalarioMinimo={setSalarioMinimoMensual}
            />
          )}

          {/* Componente 4: Catálogo de Costos, Precios y Márgenes */}
          {(subtabNegocio === 'todos' || subtabNegocio === 'precios') && (
            <TablaCostosYPrecios
              productos={productosNegocioActivo}
              negocioNombre={NEGOCIOS_METADATA.find(n => n.id === negocioSeleccionado)?.nombre}
              onUpdateProducto={handleUpdateProducto}
              onResetProductos={handleResetProductos}
            />
          )}
        </div>
      )}
    </div>
  );
}
