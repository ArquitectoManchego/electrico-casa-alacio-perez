import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sun, Building2, Gauge } from 'lucide-react';
import {
  ARQUITECTURAS_SOLARES,
  COTIZACIONES_PROVEEDORES,
  PARAMETROS_MERCADO_SOLAR
} from '../../data/cotizacionesSolares';
import {
  obtenerEscenariosConsumoSolar,
  clasificarEquiposPorCriticidad,
  calcularAutonomiaRespaldo,
  calcularPlanDesdePresupuesto,
  simularSistemaSolarCompleto,
  calcularKwhMesPorPanel
} from '../../utils/motorSolar';
import { dbService } from '../../firebase';

import SelectorConfiguracionesSolares from './SelectorConfiguracionesSolares';
import EsquemaSolarAnimadoSVG from './EsquemaSolarAnimadoSVG';
import ControlesSimuladorSolar from './ControlesSimuladorSolar';
import PanelRentabilidadSocios from './PanelRentabilidadSocios';
import MatrizEquiposRespaldo from './MatrizEquiposRespaldo';
import ComparadorProveedoresSolares from './ComparadorProveedoresSolares';
import ModalNuevaCotizacionSolar from './ModalNuevaCotizacionSolar';

export default function ModuloPanelesSolares({
  currentProyectoId = 'consorcio_general',
  aparatos = [],
  medidores = [],
  tarifas = {},
  costosMEM = {},
  modoInterfaz = 'avanzado'
}) {
  // Alcance: edificio completo o un medidor específico
  const [alcanceMedidorId, setAlcanceMedidorId] = useState('todos');

  // Estado principal del simulador
  const [arquitecturaId, setArquitecturaId] = useState('on_grid');
  const [escenarioConsumoId, setEscenarioConsumoId] = useState('arranque_inicial');
  const [kwhMesCustom, setKwhMesCustom] = useState(980);
  const [cantidadPaneles, setCantidadPaneles] = useState(8);
  const [wattsPorPanel, setWattsPorPanel] = useState(PARAMETROS_MERCADO_SOLAR.wattPanelReferencia);
  const [costoWp, setCostoWp] = useState(PARAMETROS_MERCADO_SOLAR.costoWpReferenciaOnGrid);
  const [bateriaKwh, setBateriaKwh] = useState(0);
  const [aplicarISR, setAplicarISR] = useState(false);
  const [azoteaDisponibleM2, setAzoteaDisponibleM2] = useState(PARAMETROS_MERCADO_SOLAR.azoteaDefaultM2);

  // Estado del esquema animado en vivo
  const [horaSimulada, setHoraSimulada] = useState(13);
  const [apagonCFE, setApagonCFE] = useState(false);

  // Cotizaciones (4 de WhatsApp + custom guardadas en Firebase/localStorage)
  const [cotizacionesCustom, setCotizacionesCustom] = useState([]);
  const [cotizacionActiva, setCotizacionActiva] = useState(null);
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);

  // Cargar configuración guardada y cotizaciones custom
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentProyectoId || !dbService.getSolarConfig) return;
      try {
        const saved = await dbService.getSolarConfig(currentProyectoId);
        if (!active || !saved) return;
        if (Array.isArray(saved.cotizacionesCustom)) {
          setCotizacionesCustom(saved.cotizacionesCustom);
        }
        if (saved.azoteaDisponibleM2) {
          setAzoteaDisponibleM2(saved.azoteaDisponibleM2);
        }
      } catch (err) {
        console.warn('No se pudo cargar configuración solar:', err);
      }
    };
    load();
    return () => { active = false; };
  }, [currentProyectoId]);

  const persistirConfigSolar = useCallback((customList, azoteaM2) => {
    if (!currentProyectoId || !dbService.saveSolarConfig) return;
    dbService.saveSolarConfig(currentProyectoId, {
      cotizacionesCustom: customList,
      azoteaDisponibleM2: azoteaM2
    });
  }, [currentProyectoId]);

  // Escenarios reales calculados del edificio/medidor
  const escenariosConsumo = useMemo(() => {
    return obtenerEscenariosConsumoSolar({
      aparatos,
      medidores,
      alcanceMedidorId
    });
  }, [aparatos, medidores, alcanceMedidorId]);

  // Consumo mensual efectivo derivado del escenario activo o valor personalizado del slider
  const kwhMesConsumo = useMemo(() => {
    if (escenarioConsumoId === 'custom') return kwhMesCustom;
    const match = escenariosConsumo.find(e => e.id === escenarioConsumoId) || escenariosConsumo[0];
    return match ? match.kwhMes : kwhMesCustom;
  }, [escenarioConsumoId, escenariosConsumo, kwhMesCustom]);

  // Equipos clasificados para respaldo ante apagón
  const equiposClasificados = useMemo(() => {
    const listaMed = Array.isArray(medidores) && medidores.length > 0 ? medidores : [{ id: 'med_1' }];
    const apsScope = alcanceMedidorId === 'todos'
      ? aparatos
      : aparatos.filter(ap => (ap.medidorId || listaMed[0].id) === alcanceMedidorId);
    return clasificarEquiposPorCriticidad(apsScope);
  }, [aparatos, medidores, alcanceMedidorId]);

  // Selección de equipos respaldados (derivada automáticamente por batería o personalizada manualmente)
  const [idsRespaldoManual, setIdsRespaldoManual] = useState(null);

  const idsRespaldoSeleccionados = useMemo(() => {
    if (idsRespaldoManual !== null) return idsRespaldoManual;
    const nivelAuto = bateriaKwh >= 30 ? 3 : bateriaKwh >= 15 ? 2 : 1;
    return new Set(equiposClasificados.filter(e => e.nivel <= nivelAuto).map(e => e.id));
  }, [idsRespaldoManual, equiposClasificados, bateriaKwh]);

  const arquitectura = useMemo(
    () => ARQUITECTURAS_SOLARES.find(a => a.id === arquitecturaId) || ARQUITECTURAS_SOLARES[0],
    [arquitecturaId]
  );

  // Simulación técnica y financiera integral
  const simulacion = useMemo(() => {
    return simularSistemaSolarCompleto({
      arquitecturaId,
      kwhMesConsumo,
      cantidadPaneles,
      wattsPorPanel,
      bateriaKwh,
      costoWp,
      precioBasePanelesOverride: cotizacionActiva ? cotizacionActiva.precioEfectivoMxn : null,
      aplicarISR,
      azoteaDisponibleM2,
      tarifas,
      costosMEM
    });
  }, [
    arquitecturaId,
    kwhMesConsumo,
    cantidadPaneles,
    wattsPorPanel,
    bateriaKwh,
    costoWp,
    cotizacionActiva,
    aplicarISR,
    azoteaDisponibleM2,
    tarifas,
    costosMEM
  ]);

  // Autonomía y diagnóstico de respaldo
  const autonomia = useMemo(() => {
    return calcularAutonomiaRespaldo({
      equiposClasificados,
      idsSeleccionados: idsRespaldoSeleccionados,
      bateriaKwh: simulacion.bateriaEfectiva,
      arquitecturaId,
      potenciaKwp: simulacion.potenciaKwp,
      panelesActivos: simulacion.panelesEfectivos
    });
  }, [equiposClasificados, idsRespaldoSeleccionados, simulacion, arquitecturaId]);

  // Demanda instantánea de edificio para el esquema animado
  const escenarioActivoObj = escenariosConsumo.find(e => e.id === escenarioConsumoId);
  const wattsEdificioActual = Math.max(
    1200,
    Math.round((escenarioActivoObj?.kwSimultaneo || (kwhMesConsumo / 260)) * 1000)
  );

  // --- MANEJADORES INTERACTIVOS ---

  const handleSelectArquitectura = (nuevoId) => {
    setArquitecturaId(nuevoId);
    const nextArq = ARQUITECTURAS_SOLARES.find(a => a.id === nuevoId);
    if (nextArq) {
      if (nextArq.usaBaterias && bateriaKwh === 0) {
        setBateriaKwh(nuevoId === 'off_grid' ? 20 : 10);
      } else if (!nextArq.usaBaterias) {
        setBateriaKwh(0);
      }
      if (nextArq.usaPaneles && cantidadPaneles === 0) {
        setCantidadPaneles(8);
      }
      // Si la cotización activa era on-grid y cambiamos a UPS o Off-grid, liberamos override
      if (cotizacionActiva && cotizacionActiva.arquitectura !== nuevoId && nuevoId === 'ups_baterias') {
        setCotizacionActiva(null);
      }
    }
  };

  const handleSelectEscenarioConsumo = (esc) => {
    setEscenarioConsumoId(esc.id);
    setKwhMesCustom(esc.kwhMes);
    // Si NO hay una cotización fija seleccionada, ajustar los paneles automáticamente al nuevo consumo
    if (!cotizacionActiva && arquitectura.usaPaneles) {
      const kwhPanel = calcularKwhMesPorPanel(wattsPorPanel) * (arquitectura.factorAprovechamientoSolar || 1);
      const ideales = Math.max(4, Math.min(60, Math.ceil(esc.kwhMes / Math.max(1, kwhPanel))));
      setCantidadPaneles(ideales);
    }
  };

  const handleChangeKwhMes = (nuevoKwh) => {
    setEscenarioConsumoId('custom');
    setKwhMesCustom(nuevoKwh);
    if (arquitectura.usaPaneles) {
      setCotizacionActiva(null);
      const kwhPanel = calcularKwhMesPorPanel(wattsPorPanel) * (arquitectura.factorAprovechamientoSolar || 1);
      const ideales = Math.max(2, Math.min(64, Math.ceil(nuevoKwh / Math.max(1, kwhPanel))));
      setCantidadPaneles(ideales);
    }
  };

  const handleChangePresupuesto = (nuevoPresupuestoMxn) => {
    setCotizacionActiva(null);
    const plan = calcularPlanDesdePresupuesto({
      presupuestoMxn: nuevoPresupuestoMxn,
      arquitecturaId,
      wattsPorPanel,
      costoWp,
      aplicarISR
    });
    setCantidadPaneles(plan.cantidadPaneles);
    if (arquitectura.usaBaterias) {
      setBateriaKwh(plan.bateriaKwh);
    }
  };

  const handleChangeCantidadPaneles = (nuevoCount) => {
    setCotizacionActiva(null);
    setCantidadPaneles(nuevoCount);
  };

  const handleChangeBateriaKwh = (nuevoKwhBat) => {
    setBateriaKwh(nuevoKwhBat);
    if (nuevoKwhBat > 0 && !arquitectura.usaBaterias) {
      // Cambiar inteligentemente a modo Híbrido al agregar baterías
      setArquitecturaId('hibrido');
    }
    // Volver al escalado automático de aparatos energizables según la capacidad de batería
    setIdsRespaldoManual(null);
  };

  const handleToggleEquipoRespaldo = (id) => {
    const base = idsRespaldoManual !== null ? idsRespaldoManual : idsRespaldoSeleccionados;
    const next = new Set(base);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setIdsRespaldoManual(next);
  };

  const handleSeleccionarHastaNivel = (maxNivel) => {
    setIdsRespaldoManual(
      new Set(equiposClasificados.filter(e => e.nivel <= maxNivel).map(e => e.id))
    );
  };

  const handleSimularCotizacion = (cot) => {
    setCotizacionActiva(cot);
    setArquitecturaId(cot.arquitectura || 'on_grid');
    setCantidadPaneles(cot.cantidadPaneles);
    setWattsPorPanel(cot.wattsPorPanel);
    setBateriaKwh(cot.bateriaKwh || 0);
    if (cot.potenciaKwp > 0 && cot.precioEfectivoMxn > 0) {
      setCostoWp(cot.precioEfectivoMxn / (cot.potenciaKwp * 1000));
    }
    // Hacer scroll suave al simulador animado superior para apreciar el cambio
    window.scrollTo({ top: 140, behavior: 'smooth' });
  };

  const handleGuardarCotizacionCustom = (nuevaCot) => {
    const updated = [...cotizacionesCustom, nuevaCot];
    setCotizacionesCustom(updated);
    persistirConfigSolar(updated, azoteaDisponibleM2);
    handleSimularCotizacion({ ...nuevaCot, precioEfectivoMxn: nuevaCot.precioContadoMxn });
  };

  const handleEliminarCotizacionCustom = (id) => {
    const updated = cotizacionesCustom.filter(c => c.id !== id);
    setCotizacionesCustom(updated);
    persistirConfigSolar(updated, azoteaDisponibleM2);
    if (cotizacionActiva?.id === id) setCotizacionActiva(null);
  };

  const handleChangeAzotea = (m2) => {
    setAzoteaDisponibleM2(m2);
    persistirConfigSolar(cotizacionesCustom, m2);
  };

  const todasLasCotizaciones = useMemo(
    () => [...COTIZACIONES_PROVEEDORES, ...cotizacionesCustom],
    [cotizacionesCustom]
  );

  const listaMedidores = Array.isArray(medidores) && medidores.length > 0 ? medidores : [];
  const alcanceLabel = alcanceMedidorId === 'todos'
    ? 'Edificio Completo (Todos los Locales)'
    : (listaMedidores.find(m => m.id === alcanceMedidorId)?.nombre || 'Medidor Seleccionado');

  return (
    <div data-testid="solar-modulo-container" className="space-y-6 pb-12">
      {/* Encabezado Ejecutivo del Módulo */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-teal-500/15 border border-amber-500/30 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
              <Sun className="w-3.5 h-3.5" /> Simulador Fotovoltaico &amp; Respaldo
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Calibrado para Veracruz, Ver. (5.0 HSP · PR 80%) · Modo {modoInterfaz === 'sencillo' ? 'Presentación Socios' : 'Ingeniería'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Paneles Solares y Baterías · Casa Alacio Pérez
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl">
            Simula presupuestos, temporadas de venta, apagones de CFE y compara tus 4 cotizaciones reales de WhatsApp de forma visual y transparente para tomar decisiones en conjunto con tus socios.
          </p>
        </div>

        {/* Selector de Alcance: Edificio Completo o Por Medidor CFE */}
        {listaMedidores.length > 1 && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-teal-400" /> Aplicar Sistema a:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                data-testid="solar-alcance-todos-btn"
                onClick={() => { setAlcanceMedidorId('todos'); setIdsRespaldoManual(null); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                  alcanceMedidorId === 'todos'
                    ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3 h-3" /> Edificio Completo
              </button>
              {listaMedidores.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-testid={`solar-alcance-${m.id}-btn`}
                  onClick={() => { setAlcanceMedidorId(m.id); setIdsRespaldoManual(null); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                    alcanceMedidorId === m.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  M{m.numero}: {m.nombre?.split(' ')[0] || `Med ${m.numero}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1. Selector de las 5 Arquitecturas */}
      <SelectorConfiguracionesSolares
        arquitecturaId={arquitecturaId}
        onSelectArquitectura={handleSelectArquitectura}
      />

      {/* Esquema SVG Animado Interactivo + Simulación de Apagón */}
      <EsquemaSolarAnimadoSVG
        arquitectura={arquitectura}
        simulacion={simulacion}
        wattsEdificioActual={wattsEdificioActual}
        wattsCriticosActual={Math.max(500, autonomia.wattsRealesTotal)}
        apagonCFE={apagonCFE}
        onToggleApagon={() => setApagonCFE(v => !v)}
        horaSimulada={horaSimulada}
        onChangeHora={setHoraSimulada}
      />

      {/* 2. Barras Interactivas (Presupuesto, Consumo kW/kWh, Baterías) */}
      <ControlesSimuladorSolar
        arquitectura={arquitectura}
        simulacion={simulacion}
        autonomia={autonomia}
        escenariosConsumo={escenariosConsumo}
        escenarioConsumoId={escenarioConsumoId}
        onSelectEscenarioConsumo={handleSelectEscenarioConsumo}
        kwhMesConsumo={kwhMesConsumo}
        onChangeKwhMes={handleChangeKwhMes}
        presupuestoSliderMxn={simulacion.inversionNetaMxn}
        onChangePresupuesto={handleChangePresupuesto}
        cantidadPaneles={cantidadPaneles}
        onChangeCantidadPaneles={handleChangeCantidadPaneles}
        bateriaKwh={bateriaKwh}
        onChangeBateriaKwh={handleChangeBateriaKwh}
        aplicarISR={aplicarISR}
        onToggleISR={() => setAplicarISR(v => !v)}
        azoteaDisponibleM2={azoteaDisponibleM2}
        onChangeAzoteaM2={handleChangeAzotea}
        cotizacionActiva={cotizacionActiva}
        onLimpiarCotizacion={() => setCotizacionActiva(null)}
      />

      {/* 3. Resumen Ejecutivo Financiero y ROI para Socios */}
      <PanelRentabilidadSocios
        simulacion={simulacion}
        aplicarISR={aplicarISR}
        alcanceLabel={alcanceLabel}
      />

      {/* 4. Matriz Interactiva de Equipos Críticos y Horas de Respaldo */}
      <MatrizEquiposRespaldo
        equiposClasificados={equiposClasificados}
        idsSeleccionados={idsRespaldoSeleccionados}
        onToggleEquipo={handleToggleEquipoRespaldo}
        onSeleccionarHastaNivel={handleSeleccionarHastaNivel}
        autonomia={autonomia}
        arquitectura={arquitectura}
        bateriaKwh={simulacion.bateriaEfectiva}
        onActivarHibridoRapido={() => {
          setArquitecturaId('hibrido');
          setBateriaKwh(10);
          setApagonCFE(true);
        }}
      />

      {/* 5. Comparador y Simulador de las 4 Cotizaciones de WhatsApp */}
      <ComparadorProveedoresSolares
        cotizaciones={todasLasCotizaciones}
        cotizacionActivaId={cotizacionActiva?.id || null}
        onSimularCotizacion={handleSimularCotizacion}
        onAbrirModalNueva={() => setModalNuevaAbierto(true)}
        onEliminarCotizacionCustom={handleEliminarCotizacionCustom}
        kwhMesConsumo={kwhMesConsumo}
        aplicarISR={aplicarISR}
        tarifas={tarifas}
        costosMEM={costosMEM}
      />

      {/* Modal para agregar cotizaciones adicionales */}
      <ModalNuevaCotizacionSolar
        abierto={modalNuevaAbierto}
        onCerrar={() => setModalNuevaAbierto(false)}
        onGuardar={handleGuardarCotizacionCustom}
      />
    </div>
  );
}
