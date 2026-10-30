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

export default function SimuladorConsumoVentas({
  aparatos = [],
  onAddAparato,
  tarifas = {},
  costosMEM = {},
  diasPeriodo = 30,
  proyectoId = 'consorcio_general',
  onKwhDiarioChange,
  medidores = []
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
    try {
      const guardado = localStorage.getItem(storageKey);
      if (guardado) return JSON.parse(guardado);
    } catch (e) {}

    const init = {};
    NEGOCIOS_CONFIG.forEach(neg => {
      init[neg.id] = {
        escenarioActivo: 'medio',
        overridesUsuario: null,
        diasLaborales: neg.diasLaboralesDefault,
        horasTurno: neg.horasTurnoDefault
      };
    });
    return init;
  });

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(estadosNegocios));
    } catch (e) {}
  }, [estadosNegocios, storageKey]);

  // Estado del negocio activo
  const estadoActual = estadosNegocios[negocioActivoId] || {
    escenarioActivo: 'medio',
    overridesUsuario: null,
    diasLaborales: 26,
    horasTurno: 8.0
  };

  const negocioConfig = NEGOCIOS_CONFIG.find(n => n.id === negocioActivoId) || NEGOCIOS_CONFIG[0];

  // Simular los 3 escenarios fijos + el escenario activo del negocio seleccionado
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

  const simActual = useMemo(() => {
    if (estadoActual.escenarioActivo === 'bajo') return simBajo;
    if (estadoActual.escenarioActivo === 'medio') return simMedio;
    if (estadoActual.escenarioActivo === 'alto') return simAlto;

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
  }, [estadoActual.escenarioActivo, estadoActual.overridesUsuario, estadoActual.diasLaborales, estadoActual.horasTurno, simBajo, simMedio, simAlto, negocioActivoId, aparatos, esConsorcio, tarifas, costosMEM, diasPeriodo]);

  // Simulación agregada de Consorcio por los 6 Medidores CFE
  const simConsorcio = useMemo(() => {
    if (!esConsorcio) return null;
    return simularConsorcioPorMedidores({
      todosEstadosNegocios: estadosNegocios,
      aparatos,
      medidores,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  }, [esConsorcio, estadosNegocios, aparatos, medidores, tarifas, costosMEM, diasPeriodo]);

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
      />

      {/* 2. Comparativa de Escenarios y Facturación CFE */}
      <ComparativaMensualCFE 
        simulacionActual={simActual}
        simulacionBajo={simBajo}
        simulacionMedio={simMedio}
        simulacionAlto={simAlto}
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
