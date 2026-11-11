import React, { useState, useEffect, useMemo } from 'react';
import { NEGOCIOS_CONFIG, vincularEquiposConInventario } from '../utils/equiposNegocios';
import { PROCESOS_POR_NEGOCIO } from '../utils/procesosNegocios';
import { 
  simularNegocioCompleto, 
  simularConsorcioPorMedidores 
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
  onEscenarioNegocioChange
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

  // Sincronizar escenarios independientes por negocio si vienen del estado persistido
  useEffect(() => {
    if (escenariosPorNegocio && Object.keys(escenariosPorNegocio).length > 0) {
      setEstadosNegocios(prev => {
        let changed = false;
        const next = { ...prev };
        Object.keys(escenariosPorNegocio).forEach(negId => {
          if (next[negId] && next[negId].escenarioActivo !== escenariosPorNegocio[negId]) {
            next[negId] = { ...next[negId], escenarioActivo: escenariosPorNegocio[negId] };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [escenariosPorNegocio]);

  // Sincronización entrante si se fuerza un escenario global específico diferente de 'por_empresa'
  useEffect(() => {
    if (escenarioVentas && escenarioVentas !== 'inventario' && escenarioVentas !== 'por_empresa' && escenarioVentas !== 'personalizado') {
      setEstadosNegocios(prev => {
        if (!prev[negocioActivoId] || prev[negocioActivoId].escenarioActivo === escenarioVentas) return prev;
        return {
          ...prev,
          [negocioActivoId]: {
            ...prev[negocioActivoId],
            escenarioActivo: escenarioVentas
          }
        };
      });
    }
  }, [escenarioVentas, negocioActivoId]);


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
      overridesUsuario: null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.diasLaborales, estadoActual.horasTurno, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simTablas = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'tablas',
      overridesUsuario: null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.diasLaborales, estadoActual.horasTurno, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simMedio = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'medio',
      overridesUsuario: null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.diasLaborales, estadoActual.horasTurno, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simAlto = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'alto',
      overridesUsuario: null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.diasLaborales, estadoActual.horasTurno, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  const simMuyAlto = useMemo(() => {
    return simularNegocioCompleto({
      negocioId: negocioActivoId,
      escenarioActivo: 'muy_alto',
      overridesUsuario: null,
      diasLaborales: estadoActual.diasLaborales,
      horasTurno: estadoActual.horasTurno,
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [negocioActivoId, estadoActual.diasLaborales, estadoActual.horasTurno, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

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
      aparatos,
      esConsorcio,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [estadoActual.escenarioActivo, estadoActual.overridesUsuario, estadoActual.diasLaborales, estadoActual.horasTurno, simBajo, simTablas, simMedio, simAlto, simMuyAlto, negocioActivoId, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

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
      diasPeriodo
    });
  }, [esConsorcio, estadosNegocios, escenariosPorNegocio, aparatos, medidores, tarifas, costosMEM, diasPeriodo]);

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

  // Manejadores de cambios de estado
  const handleSelectEscenario = (nuevoEscenario) => {
    setEstadosNegocios(prev => ({
      ...prev,
      [negocioActivoId]: {
        ...prev[negocioActivoId],
        escenarioActivo: nuevoEscenario
      }
    }));
    if (onEscenarioNegocioChange) {
      onEscenarioNegocioChange(negocioActivoId, nuevoEscenario);
    }
    if (onEscenarioVentasChange) {
      onEscenarioVentasChange(nuevoEscenario);
    }
  };


  const handleChangeDiasLaborales = (dias) => {
    setEstadosNegocios(prev => ({
      ...prev,
      [negocioActivoId]: {
        ...prev[negocioActivoId],
        diasLaborales: dias
      }
    }));
  };

  const handleChangeHorasTurno = (hrs) => {
    setEstadosNegocios(prev => ({
      ...prev,
      [negocioActivoId]: {
        ...prev[negocioActivoId],
        horasTurno: hrs
      }
    }));
  };

  const handleRestaurarCalibracion = () => {
    setEstadosNegocios(prev => ({
      ...prev,
      [negocioActivoId]: {
        ...prev[negocioActivoId],
        escenarioActivo: 'medio',
        overridesUsuario: null
      }
    }));
  };

  const handleChangeCantidad = (procesoId, valor) => {
    setEstadosNegocios(prev => {
      const negEstado = prev[negocioActivoId] || {};
      const cantidadesPrev = negEstado.overridesUsuario?.cantidades || simActual.cantidadesEfectivas || {};
      const lotesPrev = negEstado.overridesUsuario?.lotes || simActual.lotesEfectivos || {};

      return {
        ...prev,
        [negocioActivoId]: {
          ...negEstado,
          escenarioActivo: 'custom',
          overridesUsuario: {
            cantidades: { ...cantidadesPrev, [procesoId]: valor },
            lotes: lotesPrev
          }
        }
      };
    });
  };

  const handleChangeLote = (procesoId, valor) => {
    setEstadosNegocios(prev => {
      const negEstado = prev[negocioActivoId] || {};
      const cantidadesPrev = negEstado.overridesUsuario?.cantidades || simActual.cantidadesEfectivas || {};
      const lotesPrev = negEstado.overridesUsuario?.lotes || simActual.lotesEfectivos || {};

      return {
        ...prev,
        [negocioActivoId]: {
          ...negEstado,
          escenarioActivo: 'custom',
          overridesUsuario: {
            cantidades: cantidadesPrev,
            lotes: { ...lotesPrev, [procesoId]: valor }
          }
        }
      };
    });
  };

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
        medidorId: esConsorcio ? negocioConfig.medidorIdConsorcio : (medidores[0]?.id || 'med_1')
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
          />

          {/* Monitoreo de Capacidad y Cuello de Botella */}
          <MonitorCapacidadEquipos 
            capacidadesEquipos={simActual.capacidadesEquipos}
            equipoCuelloBotella={simActual.equipoCuelloBotella}
            onAddAparato={onAddAparato}
            medidorId={esConsorcio ? negocioConfig.medidorIdConsorcio : (medidores[0]?.id || 'med_1')}
          />
        </>
      )}

    </div>
  );
}
