import React, { useState, useEffect, useMemo } from 'react';
import { NEGOCIOS_CONFIG, vincularEquiposConInventario, identificarNegocioDeAparato } from '../utils/equiposNegocios';
import { PROCESOS_POR_NEGOCIO } from '../utils/procesosNegocios';
import { 
  simularNegocioCompleto, 
  simularConsorcioPorMedidores,
  ESCENARIOS_ORDEN,
  normalizarEscenario,
  clasificarEscenarioPorValor
} from '../utils/motorSimulacionVentas';
import SelectorEscenarioYNegocio from './ventas/SelectorEscenarioYNegocio';
import ComparativaMensualCFE from './ventas/ComparativaMensualCFE';
import TablaProcesosRecetas from './ventas/TablaProcesosRecetas';
import MonitorCapacidadEquipos from './ventas/MonitorCapacidadEquipos';
import PanelEstacionalidadYPublicidad from './ventas/PanelEstacionalidadYPublicidad';

export default function SimuladorConsumoVentas({
  aparatos = [],
  onAddAparato,
  tarifas = {},
  costosMEM = {},
  diasPeriodo = 30,
  proyectoId = 'consorcio_general',
  onKwhDiarioChange,
  medidores = [],
  escenarioVentas = 'por_empresa',
  onEscenarioVentasChange,
  escenariosPorNegocio = {},
  onEscenarioNegocioChange,
  estadosVentasRemotos = null
}) {
  const esConsorcio = proyectoId === 'consorcio_general';

  // Negocio inicial según el proyecto seleccionado en la app
  const negocioInicial = useMemo(() => {
    const coincidente = NEGOCIOS_CONFIG.find(n => n.id === proyectoId);
    return coincidente ? coincidente.id : 'imperia_uniformes';
  }, [proyectoId]);

  const [negocioActivoId, setNegocioActivoId] = useState(negocioInicial);
  const [vistaConsolidada, setVistaConsolidada] = useState(false);

  // Sincronizar negocio si el usuario cambia el proyecto en el selector de proyectos superior
  useEffect(() => {
    if (proyectoId && proyectoId !== 'consorcio_general') {
      const match = NEGOCIOS_CONFIG.find(n => n.id === proyectoId);
      if (match) {
        setNegocioActivoId(match.id);
        setVistaConsolidada(false);
      }
    }
  }, [proyectoId]);

  // Cargar estados guardados en localStorage
  const storageKey = `simulador_ventas_v2_${proyectoId}`;
  const [estadosNegocios, setEstadosNegocios] = useState(() => {
    let result = {};
    try {
      const guardado = localStorage.getItem(storageKey);
      if (guardado) result = JSON.parse(guardado);
    } catch (e) {}

    NEGOCIOS_CONFIG.forEach(neg => {
      const escGuardado = escenariosPorNegocio?.[neg.id] || result[neg.id]?.escenarioActivo || 'medio';
      if (!result[neg.id]) {
        result[neg.id] = {
          escenarioActivo: escGuardado,
          overridesUsuario: null,
          diasLaborales: neg.diasLaboralesDefault,
          horasTurno: neg.horasTurnoDefault
        };
      } else {
        result[neg.id].escenarioActivo = escGuardado;
      }
    });
    return result;
  });

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(estadosNegocios));
    } catch (e) {}
  }, [estadosNegocios, storageKey]);

  // Sincronizar escenarios independientes por negocio si vienen del estado persistido en Firestore
  useEffect(() => {
    if (escenariosPorNegocio && Object.keys(escenariosPorNegocio).length > 0) {
      setEstadosNegocios(prev => {
        let changed = false;
        const next = { ...prev };
        Object.keys(escenariosPorNegocio).forEach(negId => {
          const remotoExtra = estadosVentasRemotos && estadosVentasRemotos[negId] ? estadosVentasRemotos[negId] : {};
          if (next[negId] && next[negId].escenarioActivo !== escenariosPorNegocio[negId]) {
            next[negId] = { ...next[negId], ...remotoExtra, escenarioActivo: escenariosPorNegocio[negId] };
            changed = true;
          } else if (estadosVentasRemotos && estadosVentasRemotos[negId]) {
            const actualJson = JSON.stringify(next[negId]);
            const merged = { ...next[negId], ...remotoExtra, escenarioActivo: escenariosPorNegocio[negId] || next[negId]?.escenarioActivo };
            if (JSON.stringify(merged) !== actualJson) {
              next[negId] = merged;
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }
  }, [escenariosPorNegocio, estadosVentasRemotos]);


  // Estado del negocio activo
  const estadoActual = estadosNegocios[negocioActivoId] || {
    escenarioActivo: 'medio',
    overridesUsuario: null,
    diasLaborales: 26,
    horasTurno: 8.0
  };

  const negocioConfig = NEGOCIOS_CONFIG.find(n => n.id === negocioActivoId) || NEGOCIOS_CONFIG[0];

  // Parámetros de Estacionalidad Anual, Vacaciones y Publicidad de Eventos en México
  const [mesSeleccionado, setMesSeleccionado] = useState(8); // Por defecto Agosto (Pico Escolar)
  const [esQuincena, setEsQuincena] = useState(false);
  const [publicidadContraciclica, setPublicidadContraciclica] = useState(true);
  const [eventosActivos, setEventosActivos] = useState(['regreso_clases']);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sge_ventas_estacionalidad_config_v1');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.mesSeleccionado) setMesSeleccionado(data.mesSeleccionado);
        if (data.esQuincena !== undefined) setEsQuincena(data.esQuincena);
        if (data.publicidadContraciclica !== undefined) setPublicidadContraciclica(data.publicidadContraciclica);
        if (data.eventosActivos) setEventosActivos(data.eventosActivos);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sge_ventas_estacionalidad_config_v1', JSON.stringify({
        mesSeleccionado,
        esQuincena,
        publicidadContraciclica,
        eventosActivos
      }));
    } catch (e) {}
  }, [mesSeleccionado, esQuincena, publicidadContraciclica, eventosActivos]);

  const handleToggleEvento = (evId) => {
    setEventosActivos(prev =>
      prev.includes(evId) ? prev.filter(x => x !== evId) : [...prev, evId]
    );
  };

  // Simular los escenarios de ventas para el negocio seleccionado
  const simBajo = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'bajo',
      overridesUsuario: estadoActual.overridesPorEscenario?.['bajo'] || null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      mesActivo: mesSeleccionado,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.overridesPorEscenario, estadoActual.diasLaborales, estadoActual.horasTurno, mesSeleccionado, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simTablas = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'tablas',
      overridesUsuario: estadoActual.overridesPorEscenario?.['tablas'] || null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      mesActivo: mesSeleccionado,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.overridesPorEscenario, estadoActual.diasLaborales, estadoActual.horasTurno, mesSeleccionado, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simMedio = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'medio',
      overridesUsuario: estadoActual.overridesPorEscenario?.['medio'] || null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      mesActivo: mesSeleccionado,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.overridesPorEscenario, estadoActual.diasLaborales, estadoActual.horasTurno, mesSeleccionado, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simAlto = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'alto',
      overridesUsuario: estadoActual.overridesPorEscenario?.['alto'] || null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      mesActivo: mesSeleccionado,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.overridesPorEscenario, estadoActual.diasLaborales, estadoActual.horasTurno, mesSeleccionado, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simMuyAlto = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'muy_alto',
      overridesUsuario: estadoActual.overridesPorEscenario?.['muy_alto'] || null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      mesActivo: mesSeleccionado,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.overridesPorEscenario, estadoActual.diasLaborales, estadoActual.horasTurno, mesSeleccionado, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simActual = useMemo(() => {
    if (estadoActual.escenarioActivo === 'bajo') return simBajo;
    if (estadoActual.escenarioActivo === 'tablas' || estadoActual.escenarioActivo === 'equilibrio') return simTablas;
    if (estadoActual.escenarioActivo === 'medio' || estadoActual.escenarioActivo === 'buena') return simMedio;
    if (estadoActual.escenarioActivo === 'alto') return simAlto;
    if (estadoActual.escenarioActivo === 'muy_alto') return simMuyAlto;

    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'custom',
      overridesUsuario: estadoActual.overridesUsuario,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      mesActivo: mesSeleccionado,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [estadoActual.escenarioActivo, estadoActual.overridesUsuario, estadoActual.diasLaborales, estadoActual.horasTurno, mesSeleccionado, simBajo, simTablas, simMedio, simAlto, simMuyAlto, negocioActivoId, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  // Valores calibrados automáticamente (sin ajustes del usuario) de cada escenario: definen los rangos
  const baseEscenarios = useMemo(() => {
    const out = {};
    ESCENARIOS_ORDEN.forEach(esc => {
      out[esc] = simularNegocioCompleto({
        negocioId: negocioActivoId,
        escenarioActivo: esc,
        overridesUsuario: null,
        diasLaborales: estadoActual.diasLaborales,
        horasTurno: estadoActual.horasTurno,
        mesActivo: mesSeleccionado,
        aparatos,
        esConsorcio,
        tarifas,
        costosMEM,
        diasPeriodo
      });
    });
    return out;
  }, [negocioActivoId, estadoActual.diasLaborales, estadoActual.horasTurno, mesSeleccionado, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  // Validación: ¿el resultado de los valores modificados sigue dentro del rango del escenario elegido?
  const escActivoNorm = normalizarEscenario(estadoActual.escenarioActivo);
  const ajustesEscActivo = estadoActual.overridesPorEscenario?.[escActivoNorm] || null;
  const validacionEscenario = useMemo(() => {
    const hayAjustes = !!ajustesEscActivo && (
      Object.keys(ajustesEscActivo.cantidades || {}).length > 0 ||
      Object.keys(ajustesEscActivo.lotes || {}).length > 0
    );
    if (!hayAjustes || !ESCENARIOS_ORDEN.includes(escActivoNorm)) {
      return { hayAjustes: false, dentro: true, escenarioResultante: escActivoNorm };
    }
    const sats = {};
    const kwhs = {};
    ESCENARIOS_ORDEN.forEach(esc => {
      sats[esc] = baseEscenarios[esc]?.maxSaturacion || 0;
      kwhs[esc] = baseEscenarios[esc]?.totalKwhMes || 0;
    });
    // Métrica principal: saturación del equipo cuello de botella. Si los escenarios no se distinguen por ella
    // (p. ej. oficina de baja ocupación) se usa el consumo mensual como métrica.
    const spread = Math.max(...Object.values(sats)) - Math.min(...Object.values(sats));
    const usaSaturacion = spread >= 1;
    const base = usaSaturacion ? sats : kwhs;
    const valor = usaSaturacion ? (simActual.maxSaturacion || 0) : (simActual.totalKwhMes || 0);
    const techo = usaSaturacion ? 100 : kwhs.muy_alto + (kwhs.muy_alto - kwhs.alto) / 2;
    const escenarioResultante = clasificarEscenarioPorValor(valor, base, techo);
    return {
      hayAjustes: true,
      dentro: escenarioResultante === escActivoNorm,
      escenarioResultante
    };
  }, [ajustesEscActivo, escActivoNorm, baseEscenarios, simActual]);

  // Simulación agregada de Consorcio por los Medidores Reales CFE
  const simConsorcio = useMemo(() => {
    if (!esConsorcio) return null;
    return simularConsorcioPorMedidores({
      todosEstadosNegocios: estadosNegocios,
      escenariosPorNegocio,
      aparatos,
      medidores,
      tarifas,
      costosMEM,
      diasPeriodo,
      mesActivo: mesSeleccionado
    });
  }, [esConsorcio, estadosNegocios, escenariosPorNegocio, aparatos, medidores, tarifas, costosMEM, diasPeriodo, mesSeleccionado]);

  // Notificar al componente padre el kWh diario para el recibo físico CFE
  useEffect(() => {
    if (onKwhDiarioChange) {
      if (esConsorcio) {
        // En consorcio, la pestaña financiera CFE recibe la suma total del inmueble
        const totalDiario = simConsorcio ? simConsorcio.totalKwhDiarioConsorcio : simActual.totalKwhDiario;
        onKwhDiarioChange(totalDiario);
      } else {
        // En negocio individual, recibe el consumo diario de ese negocio
        onKwhDiarioChange(simActual.totalKwhDiario);
      }
    }
  }, [onKwhDiarioChange, esConsorcio, simConsorcio, simActual.totalKwhDiario]);

  // Manejadores de cambios de estado (independientes por local y guardados en Firestore)
  const handleSelectEscenario = (nuevoEscenario) => {
    setEstadosNegocios(prev => {
      const next = {
        ...prev,
        [negocioActivoId]: {
          ...prev[negocioActivoId],
          escenarioActivo: nuevoEscenario
        }
      };
      if (onEscenarioNegocioChange) {
        onEscenarioNegocioChange(negocioActivoId, nuevoEscenario, next);
      }
      return next;
    });
    if (onEscenarioVentasChange) {
      onEscenarioVentasChange('por_empresa');
    }
  };


  const handleChangeDiasLaborales = (dias) => {
    setEstadosNegocios(prev => {
      const next = {
        ...prev,
        [negocioActivoId]: {
          ...prev[negocioActivoId],
          diasLaborales: dias
        }
      };
      if (onEscenarioNegocioChange) {
        onEscenarioNegocioChange(negocioActivoId, next[negocioActivoId]?.escenarioActivo || 'medio', next);
      }
      return next;
    });
  };

  const handleChangeHorasTurno = (hrs) => {
    setEstadosNegocios(prev => {
      const next = {
        ...prev,
        [negocioActivoId]: {
          ...prev[negocioActivoId],
          horasTurno: hrs
        }
      };
      if (onEscenarioNegocioChange) {
        onEscenarioNegocioChange(negocioActivoId, next[negocioActivoId]?.escenarioActivo || 'medio', next);
      }
      return next;
    });
  };

  // Restaura la calibración automática del escenario activo (borra solo sus ajustes)
  const handleRestaurarCalibracion = () => {
    setEstadosNegocios(prev => {
      const negEstado = prev[negocioActivoId] || {};
      const esc = normalizarEscenario(negEstado.escenarioActivo);
      let next;
      if (esc === 'custom') {
        next = {
          ...prev,
          [negocioActivoId]: { ...negEstado, escenarioActivo: 'medio', overridesUsuario: null }
        };
      } else {
        const restantes = { ...(negEstado.overridesPorEscenario || {}) };
        delete restantes[esc];
        next = {
          ...prev,
          [negocioActivoId]: { ...negEstado, overridesPorEscenario: restantes }
        };
      }
      if (onEscenarioNegocioChange) {
        onEscenarioNegocioChange(negocioActivoId, next[negocioActivoId]?.escenarioActivo || 'medio', next);
      }
      return next;
    });
  };

  // Guarda un ajuste (volumen o lote) dentro del escenario seleccionado
  const guardarAjusteProceso = (campo, procesoId, valor) => {
    setEstadosNegocios(prev => {
      const negEstado = prev[negocioActivoId] || {};
      const esc = normalizarEscenario(negEstado.escenarioActivo);

      let next;
      // Compatibilidad: estado 'custom' heredado
      if (esc === 'custom') {
        const cantidadesPrev = negEstado.overridesUsuario?.cantidades || simActual.cantidadesEfectivas || {};
        const lotesPrev = negEstado.overridesUsuario?.lotes || simActual.lotesEfectivos || {};
        next = {
          ...prev,
          [negocioActivoId]: {
            ...negEstado,
            overridesUsuario: {
              cantidades: campo === 'cantidades' ? { ...cantidadesPrev, [procesoId]: valor } : cantidadesPrev,
              lotes: campo === 'lotes' ? { ...lotesPrev, [procesoId]: valor } : lotesPrev
            }
          }
        };
      } else {
        const actuales = negEstado.overridesPorEscenario?.[esc] || { cantidades: {}, lotes: {} };
        next = {
          ...prev,
          [negocioActivoId]: {
            ...negEstado,
            overridesPorEscenario: {
              ...(negEstado.overridesPorEscenario || {}),
              [esc]: {
                cantidades: { ...(actuales.cantidades || {}) },
                lotes: { ...(actuales.lotes || {}) },
                [campo]: { ...(actuales[campo] || {}), [procesoId]: valor }
              }
            }
          }
        };
      }

      if (onEscenarioNegocioChange) {
        onEscenarioNegocioChange(negocioActivoId, next[negocioActivoId]?.escenarioActivo || 'medio', next);
      }
      return next;
    });
  };

  const handleChangeCantidad = (procesoId, valor) => guardarAjusteProceso('cantidades', procesoId, valor);
  const handleChangeLote = (procesoId, valor) => guardarAjusteProceso('lotes', procesoId, valor);

  // Determinar el medidor real donde están conectados los aparatos de este local
  const medidorRealNegocio = useMemo(() => {
    const apExistente = aparatos.find(ap => identificarNegocioDeAparato(ap).negocioId === negocioActivoId && ap.medidorId);
    if (apExistente && medidores.some(m => m.id === apExistente.medidorId)) {
      return apExistente.medidorId;
    }
    return medidores[0]?.id || 'med_1';
  }, [aparatos, negocioActivoId, medidores]);

  // Verificar si hay equipos del negocio que no están en el inventario real del proyecto
  const mapaEquiposActual = simActual.mapaEquipos || {};
  const equiposFaltantes = Object.values(mapaEquiposActual).filter(eq => !eq.conectado);
  const hayEquiposFaltantes = equiposFaltantes.length > 0;

  // Sincronización en lote de equipos faltantes al cuadro de cargas real
  const handleSyncEquiposFaltantes = () => {
    if (!onAddAparato || equiposFaltantes.length === 0) return;

    equiposFaltantes.forEach(eq => {
      const horasPromedio = Math.round(eq.horasOcupadasMes / estadoActual.diasLaborales) || 4;
      const prefijo = esConsorcio ? `${negocioConfig.prefijoConsorcio} ` : '';

      onAddAparato({
        tipo: `${prefijo}${eq.nombre}`,
        modelo: eq.tipoCatalogo || eq.nombre,
        watts: eq.wattsNominal || eq.wattsEfectivos || 500,
        fp: eq.fp || 0.90,
        tipoCarga: eq.tipoCarga || 'monofasica',
        fase: eq.faseSugerida || (eq.tipoCarga === 'bifasica' ? 'A-B' : 'A'),
        horasAlta: horasPromedio,
        horasReposo: 0,
        precio: 10000,
        mantenimiento: 500,
        vidaUtil: 8,
        local: negocioConfig.nombre,
        medidorId: medidorRealNegocio
      });
    });
  };

  const procesosNegocioActivo = PROCESOS_POR_NEGOCIO[negocioActivoId] || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Selector Superior de Negocio, Escenario y Turno */}
      <SelectorEscenarioYNegocio 
        esConsorcio={esConsorcio}
        vistaConsolidada={vistaConsolidada}
        onToggleVistaConsolidada={setVistaConsolidada}
        negocioActivoId={negocioActivoId}
        onSelectNegocio={setNegocioActivoId}
        escenarioActivo={estadoActual.escenarioActivo}
        onSelectEscenario={handleSelectEscenario}
        diasLaborales={estadoActual.diasLaborales}
        onChangeDiasLaborales={handleChangeDiasLaborales}
        horasTurno={estadoActual.horasTurno}
        onChangeHorasTurno={handleChangeHorasTurno}
        onRestaurarCalibracion={handleRestaurarCalibracion}
        hayEquiposFaltantes={hayEquiposFaltantes}
        onSyncEquiposFaltantes={handleSyncEquiposFaltantes}
        medidores={medidores}
        aparatos={aparatos}
        escenariosPorNegocio={escenariosPorNegocio}
      />


      {/* 2. Panel de Estacionalidad Anual, Vacaciones Universitarias y Publicidad Anticipada */}
      {!vistaConsolidada && (
        <PanelEstacionalidadYPublicidad 
          negocioId={negocioActivoId}
          mesSeleccionado={mesSeleccionado}
          onSelectMes={setMesSeleccionado}
          esQuincena={esQuincena}
          onToggleQuincena={() => setEsQuincena(prev => !prev)}
          publicidadContraciclica={publicidadContraciclica}
          onTogglePublicidadContraciclica={() => setPublicidadContraciclica(prev => !prev)}
          eventosActivos={eventosActivos}
          onToggleEvento={handleToggleEvento}
          onAplicarEscenarioSugerido={handleSelectEscenario}
        />
      )}

      {/* 2. Comparativa de Escenarios y Facturación CFE */}
      <ComparativaMensualCFE 
        simulacionActual={simActual}
        simulacionBajo={simBajo}
        simulacionTablas={simTablas}
        simulacionMedio={simMedio}
        simulacionAlto={simAlto}
        simulacionMuyAlto={simMuyAlto}
        vistaConsolidada={vistaConsolidada}
        simulacionConsorcio={simConsorcio}
        diasPeriodo={diasPeriodo}
        validacionEscenario={validacionEscenario}
      />

      {/* 3. Vistas Específicas del Negocio (Solo visibles si no estamos en la vista consolidada completa) */}
      {!vistaConsolidada && (
        <>
          {/* Catálogo de Procesos y Recetas */}
          <TablaProcesosRecetas 
            procesos={procesosNegocioActivo}
            cantidades={simActual.cantidadesEfectivas}
            lotes={simActual.lotesEfectivos}
            onChangeCantidad={handleChangeCantidad}
            onChangeLote={handleChangeLote}
            resultadosProcesos={simActual.resultadosProcesos}
            diasLaborales={estadoActual.diasLaborales}
            mapaEquipos={mapaEquiposActual}
            escenarioActivo={escActivoNorm}
            ajustes={ajustesEscActivo}
            validacion={validacionEscenario}
            onRestaurar={handleRestaurarCalibracion}
          />

          {/* Monitoreo de Capacidad y Cuello de Botella */}
          <MonitorCapacidadEquipos 
            capacidadesEquipos={simActual.capacidadesEquipos}
            equipoCuelloBotella={simActual.equipoCuelloBotella}
            onAddAparato={onAddAparato}
            medidorId={medidorRealNegocio}
          />
        </>
      )}

    </div>
  );
}
