/**
 * Motor Matemático de Simulación de Ventas, Procesos Productivos y Facturación CFE.
 * Implementa la física de lotes vs. unitaria, calibración al 80% de capacidad laboral y consolidación por medidores.
 */

import { NEGOCIOS_CONFIG, vincularEquiposConInventario } from './equiposNegocios.js';
import { PROCESOS_POR_NEGOCIO } from './procesosNegocios.js';
import { calcularCobroCFECompleto } from './simuladorCFE.js';

/**
 * Calcula los minutos y kWh consumidos por un proceso productivo
 */
export function calcularDetalleProceso(proceso, cantidadMensual = 0, tamanoLote = 1, mapaEquipos = {}) {
  const Q = Math.max(0, parseInt(cantidadMensual) || 0);
  const L = Math.max(1, parseInt(tamanoLote) || 1);
  const C = Math.max(1, proceso.cabezasSimultaneas || 1);

  if (Q === 0) {
    return {
      procesoId: proceso.id,
      nombre: proceso.nombre,
      cantidadMensual: 0,
      tamanoLote: L,
      numLotes: 0,
      minutosTotales: 0,
      kwhMensual: 0,
      whPorUnidadLote: 0,
      whPorUnidadUnitaria: 0,
      ahorroLotePct: 0,
      desgloseEquipos: {}
    };
  }

  // Corridas de máquina necesarias por lote
  // Si L=10 y C=4 cabezas, uCiclo = ceil(10/4) = 3 corridas
  const uCiclo = Math.ceil(L / C);
  const numLotes = Q / L;

  let kwhLoteTotal = 0;
  let minutosLoteTotal = 0;
  const desgloseEquipos = {};

  // Calcular energía en lote de tamaño L
  proceso.pasos.forEach(paso => {
    const eq = mapaEquipos[paso.equipoKey] || {
      wattsEfectivos: 500,
      factorPrecalentamiento: 1.0,
      factorTrabajo: 1.0,
      factorGap: 0.5,
      factorStandby: 0.1
    };

    const watts = eq.wattsEfectivos || 500;
    const tPre = paso.preheatMinPorLote || 0;
    const tTrab = uCiclo * (paso.trabajoMinPorUnidad || 0);
    const tGap = Math.max(0, uCiclo - 1) * (paso.espacioEntreUnidadesMin || 0);
    const tTotalPaso = tPre + tTrab + tGap;

    const fPre = paso.factorPotenciaPre !== undefined ? paso.factorPotenciaPre : (eq.factorPrecalentamiento || 1.0);
    const fTrab = paso.factorPotenciaTrabajo !== undefined ? paso.factorPotenciaTrabajo : (eq.factorTrabajo || 1.0);
    const fGap = paso.factorPotenciaEspacio !== undefined ? paso.factorPotenciaEspacio : (eq.factorGap || 0.5);

    // Wh consumidos en este paso por lote
    const whPasoLote = (watts / 60) * (tPre * fPre + tTrab * fTrab + tGap * fGap);
    const kwhPasoLote = whPasoLote / 1000;

    kwhLoteTotal += kwhPasoLote;
    minutosLoteTotal += tTotalPaso;

    if (!desgloseEquipos[paso.equipoKey]) {
      desgloseEquipos[paso.equipoKey] = {
        equipoKey: paso.equipoKey,
        nombre: eq.nombre || paso.equipoKey,
        minutosMes: 0,
        kwhMes: 0
      };
    }
    desgloseEquipos[paso.equipoKey].minutosMes += tTotalPaso * numLotes;
    desgloseEquipos[paso.equipoKey].kwhMes += kwhPasoLote * numLotes;
  });

  const kwhMensual = kwhLoteTotal * numLotes;
  const whPorUnidadLote = (kwhMensual * 1000) / Q;

  // Calcular energía si se hiciera pieza por pieza (L = 1) para mostrar la métrica de ahorro por lote
  let whLoteUnitario = 0;
  proceso.pasos.forEach(paso => {
    const eq = mapaEquipos[paso.equipoKey] || { wattsEfectivos: 500 };
    const watts = eq.wattsEfectivos || 500;
    const tPreUnit = paso.preheatMinPorLote || 0;
    const tTrabUnit = paso.trabajoMinPorUnidad || 0;
    const fPre = paso.factorPotenciaPre !== undefined ? paso.factorPotenciaPre : 1.0;
    const fTrab = paso.factorPotenciaTrabajo !== undefined ? paso.factorPotenciaTrabajo : 1.0;
    whLoteUnitario += (watts / 60) * (tPreUnit * fPre + tTrabUnit * fTrab);
  });
  const whPorUnidadUnitaria = whLoteUnitario;
  const ahorroLotePct = whPorUnidadUnitaria > 0 ? Math.max(0, ((whPorUnidadUnitaria - whPorUnidadLote) / whPorUnidadUnitaria) * 100) : 0;

  return {
    procesoId: proceso.id,
    nombre: proceso.nombre,
    cantidadMensual: Q,
    tamanoLote: L,
    numLotes,
    minutosTotales: minutosLoteTotal * numLotes,
    kwhMensual,
    whPorUnidadLote,
    whPorUnidadUnitaria,
    ahorroLotePct,
    desgloseEquipos
  };
}

/**
 * Calibra automáticamente los escenarios Bajo, Medio y Alto (80% de horario laboral) para un negocio
 */
export function calibrarEscenariosNegocio(negocioConfig, procesosNegocio = [], mapaEquipos = {}, diasLaborales = 26, horasTurno = 8.0) {
  const minutosLaboralesMes = diasLaborales * horasTurno * 60;

  // Si el negocio tiene volúmenes fijos de baja ocupación (como Oficina Consorcio)
  if (negocioConfig.modoCapacidad === 'baja_ocupacion_oficina') {
    const escenarios = { bajo: {}, medio: {}, alto: {} };
    ['bajo', 'medio', 'alto'].forEach(esc => {
      escenarios[esc] = { cantidades: {}, lotes: {} };
      procesosNegocio.forEach(p => {
        const cant = (p.volumenFijoEscenario && p.volumenFijoEscenario[esc] !== undefined)
          ? p.volumenFijoEscenario[esc]
          : 1;
        escenarios[esc].cantidades[p.id] = cant;
        escenarios[esc].lotes[p.id] = (p.lotesPorEscenario && p.lotesPorEscenario[esc]) || 1;
      });
    });
    return escenarios;
  }

  // Para negocios de producción o comercial: calcular la utilización por unidad de mezcla
  const targets = {
    bajo: 0.20,
    medio: 0.50,
    alto: 0.80 // 80% de capacidad en horario laboral para el equipo cuello de botella
  };

  const escenarios = { bajo: {}, medio: {}, alto: {} };

  ['bajo', 'medio', 'alto'].forEach(esc => {
    const targetCap = targets[esc];
    const lotesEsc = {};
    procesosNegocio.forEach(p => {
      lotesEsc[p.id] = (p.lotesPorEscenario && p.lotesPorEscenario[esc]) || 1;
    });

    // Calcular minutos por unidad de vector base de cada proceso en cada máquina
    const minutosPorEquipoPorUnidadVector = {};

    procesosNegocio.forEach(p => {
      const peso = p.pesoMixBase || 10;
      const L = lotesEsc[p.id] || 1;
      const C = Math.max(1, p.cabezasSimultaneas || 1);
      const uCiclo = Math.ceil(L / C);

      p.pasos.forEach(paso => {
        const eqKey = paso.equipoKey;
        const eq = mapaEquipos[eqKey];
        if (!eq) return;

        // Solo consideramos equipos de producción para cuello de botella
        if (eq.rol !== 'produccion') return;

        const tPre = paso.preheatMinPorLote || 0;
        const tTrab = uCiclo * (paso.trabajoMinPorUnidad || 0);
        const tGap = Math.max(0, uCiclo - 1) * (paso.espacioEntreUnidadesMin || 0);
        const tPorLote = tPre + tTrab + tGap;
        const tPorPrenda = tPorLote / L;

        // Multiplicado por el peso base del mix
        minutosPorEquipoPorUnidadVector[eqKey] = (minutosPorEquipoPorUnidadVector[eqKey] || 0) + (tPorPrenda * peso);
      });
    });

    // Encontrar el equipo con mayor saturación relativa frente a su capacidad disponible
    let maxRatio = 0;
    let equipoCuelloBotella = null;

    Object.keys(minutosPorEquipoPorUnidadVector).forEach(eqKey => {
      const eq = mapaEquipos[eqKey];
      const cantidadParalela = (eq && eq.cantidadParalela) || 1;
      const capacidadEquipoMes = minutosLaboralesMes * cantidadParalela;

      const ratio = minutosPorEquipoPorUnidadVector[eqKey] / capacidadEquipoMes;
      if (ratio > maxRatio) {
        maxRatio = ratio;
        equipoCuelloBotella = eqKey;
      }
    });

    // Factor de escala para alcanzar exactamente targetCap en el cuello de botella
    const alfa = maxRatio > 0 ? (targetCap / maxRatio) : 1.0;

    const cantidades = {};
    procesosNegocio.forEach(p => {
      const peso = p.pesoMixBase || 10;
      let qCalc = Math.round(peso * alfa);

      // Si la máquina tiene cabezas simultáneas (ej. Bordadora 4 cabezas), redondear a múltiplos de 4
      if (p.cabezasSimultaneas > 1) {
        qCalc = Math.max(p.cabezasSimultaneas, Math.round(qCalc / p.cabezasSimultaneas) * p.cabezasSimultaneas);
      } else {
        qCalc = Math.max(1, qCalc);
      }
      cantidades[p.id] = qCalc;
    });

    escenarios[esc] = {
      cantidades,
      lotes: lotesEsc,
      equipoCuelloBotella,
      saturacionCuelloBotella: targetCap
    };
  });

  return escenarios;
}

/**
 * Simula completamente un negocio individual en un escenario dado
 */
export function simularNegocioCompleto({
  negocioId,
  escenarioActivo = 'medio', // 'bajo' | 'medio' | 'alto' | 'custom'
  overridesUsuario = null,   // { cantidades: {}, lotes: {} }
  diasLaborales = 26,
  horasTurno = 8.0,
  aparatos = [],
  esConsorcio = false,
  tarifas = {},
  costosMEM = {},
  diasPeriodo = 30
}) {
  const negocio = NEGOCIOS_CONFIG.find(n => n.id === negocioId) || NEGOCIOS_CONFIG[0];
  const procesos = PROCESOS_POR_NEGOCIO[negocioId] || [];
  const mapaEquipos = vincularEquiposConInventario(negocioId, aparatos, esConsorcio);

  const calibraciones = calibrarEscenariosNegocio(negocio, procesos, mapaEquipos, diasLaborales, horasTurno);

  // Determinar cantidades y lotes efectivos
  const cantidadesEfectivas = {};
  const lotesEfectivos = {};

  procesos.forEach(p => {
    if (escenarioActivo === 'custom' && overridesUsuario) {
      cantidadesEfectivas[p.id] = overridesUsuario.cantidades?.[p.id] !== undefined
        ? overridesUsuario.cantidades[p.id]
        : calibraciones.medio.cantidades[p.id] || 10;
      lotesEfectivos[p.id] = overridesUsuario.lotes?.[p.id] !== undefined
        ? overridesUsuario.lotes[p.id]
        : calibraciones.medio.lotes[p.id] || 1;
    } else {
      const baseEsc = calibraciones[escenarioActivo] || calibraciones.medio;
      cantidadesEfectivas[p.id] = baseEsc.cantidades[p.id] || 10;
      lotesEfectivos[p.id] = baseEsc.lotes[p.id] || 1;
    }
  });

  // 1. Simular procesos productivos
  const resultadosProcesos = [];
  let kwhProcesosMes = 0;
  const minutosEquiposMes = {};
  const kwhEquiposMes = {};

  procesos.forEach(p => {
    const cant = cantidadesEfectivas[p.id] || 0;
    const lote = lotesEfectivos[p.id] || 1;
    const res = calcularDetalleProceso(p, cant, lote, mapaEquipos);
    resultadosProcesos.push(res);
    kwhProcesosMes += res.kwhMensual;

    Object.keys(res.desgloseEquipos).forEach(eqKey => {
      const d = res.desgloseEquipos[eqKey];
      minutosEquiposMes[eqKey] = (minutosEquiposMes[eqKey] || 0) + d.minutosMes;
      kwhEquiposMes[eqKey] = (kwhEquiposMes[eqKey] || 0) + d.kwhMes;
    });
  });

  // 2. Simular cargas continuas, clima y turno fijo
  let kwhContinuoMes = 0;
  let kwhClimaMes = 0;
  let kwhLucesTurnoMes = 0;

  const minutosTurnoMes = diasLaborales * horasTurno * 60;
  const horasTurnoMes = diasLaborales * horasTurno;

  Object.keys(mapaEquipos).forEach(eqKey => {
    const eq = mapaEquipos[eqKey];
    const watts = eq.wattsEfectivos || eq.wattsNominal || 100;

    if (eq.rol === 'continuo_24h') {
      // 24 horas x 30 días al mes
      const factorCiclo = eq.factorTrabajo || 0.45;
      const kwhMes = ((watts * factorCiclo * 24 * 30) / 1000);
      kwhContinuoMes += kwhMes;
      kwhEquiposMes[eqKey] = (kwhEquiposMes[eqKey] || 0) + kwhMes;
      minutosEquiposMes[eqKey] = (minutosEquiposMes[eqKey] || 0) + (30 * 24 * 60 * factorCiclo);
    } else if (eq.rol === 'turno_fijo') {
      // Encendidas durante el turno abierto
      const kwhMes = ((watts * horasTurnoMes) / 1000);
      kwhLucesTurnoMes += kwhMes;
      kwhEquiposMes[eqKey] = (kwhEquiposMes[eqKey] || 0) + kwhMes;
      minutosEquiposMes[eqKey] = (minutosEquiposMes[eqKey] || 0) + minutosTurnoMes;
    } else if (eq.rol === 'clima') {
      // Modulación de clima según escenario
      let factorUso = 0.65;
      if (escenarioActivo === 'bajo') factorUso = 0.50;
      if (escenarioActivo === 'alto') factorUso = 0.85;
      const horasEfectivasClima = horasTurnoMes * factorUso;
      const factorInverter = eq.factorTrabajo || 0.62;
      const kwhMes = ((watts * factorInverter * horasEfectivasClima) / 1000);
      kwhClimaMes += kwhMes;
      kwhEquiposMes[eqKey] = (kwhEquiposMes[eqKey] || 0) + kwhMes;
      minutosEquiposMes[eqKey] = (minutosEquiposMes[eqKey] || 0) + (horasEfectivasClima * 60);
    }
  });

  const totalKwhMes = kwhProcesosMes + kwhContinuoMes + kwhClimaMes + kwhLucesTurnoMes;
  const totalKwhDiario = totalKwhMes / 30;
  const kwhPeriodoCFE = totalKwhDiario * diasPeriodo;

  const cobroCFE = calcularCobroCFECompleto(kwhPeriodoCFE, tarifas, costosMEM);

  // 3. Monitoreo de Capacidad y Cuello de Botella
  const capacidadesEquipos = {};
  let equipoCuelloBotella = null;
  let maxSaturacion = 0;

  Object.keys(mapaEquipos).forEach(eqKey => {
    const eq = mapaEquipos[eqKey];
    const minsOcupados = minutosEquiposMes[eqKey] || 0;
    const cantParalela = eq.cantidadParalela || 1;
    const minsDisponibles = minutosTurnoMes * cantParalela;
    const pctSaturacion = minsDisponibles > 0 ? (minsOcupados / minsDisponibles) * 100 : 0;

    capacidadesEquipos[eqKey] = {
      equipoKey: eqKey,
      nombre: eq.nombre,
      rol: eq.rol,
      conectado: eq.conectado,
      aparatoReal: eq.aparatoReal,
      watts: eq.wattsEfectivos,
      horasOcupadasMes: minsOcupados / 60,
      horasDisponiblesMes: minsDisponibles / 60,
      pctSaturacion,
      kwhMes: kwhEquiposMes[eqKey] || 0,
      costoMesAprox: cobroCFE.costoMedioPorKwh ? (kwhEquiposMes[eqKey] || 0) * cobroCFE.costoMedioPorKwh : (kwhEquiposMes[eqKey] || 0) * 3.8
    };

    if (eq.rol === 'produccion' && pctSaturacion > maxSaturacion) {
      maxSaturacion = pctSaturacion;
      equipoCuelloBotella = eqKey;
    }
  });

  return {
    negocioId,
    negocio,
    escenarioActivo,
    cantidadesEfectivas,
    lotesEfectivos,
    calibraciones,
    diasLaborales,
    horasTurno,
    diasPeriodo,
    totalKwhMes,
    totalKwhDiario,
    kwhPeriodoCFE,
    cobroCFE,
    desgloseKwh: {
      procesos: kwhProcesosMes,
      clima: kwhClimaMes,
      iluminacion: kwhLucesTurnoMes,
      continuo24h: kwhContinuoMes
    },
    resultadosProcesos,
    mapaEquipos,
    capacidadesEquipos,
    equipoCuelloBotella,
    maxSaturacion
  };
}

/**
 * Simula de forma agregada los 7 negocios agrupados en los 6 medidores CFE de consorcio_general
 */
export function simularConsorcioPorMedidores({
  todosEstadosNegocios = {},
  aparatos = [],
  medidores = [],
  tarifas = {},
  costosMEM = {},
  diasPeriodo = 30
}) {
  const medidoresList = Array.isArray(medidores) && medidores.length >= 6
    ? medidores
    : [
        { id: 'med_1', numero: 1, nombre: 'Imperia Uniformes' },
        { id: 'med_2', numero: 2, nombre: 'Papelería ImperiArte' },
        { id: 'med_3', numero: 3, nombre: 'Hawaiian Paradise' },
        { id: 'med_4', numero: 4, nombre: 'Bordados Veracruz' },
        { id: 'med_5', numero: 5, nombre: 'Taller de Costura' },
        { id: 'med_6', numero: 6, nombre: 'Publi-Imperia & Consorcio' }
      ];

  // Simular los 7 negocios
  const resultadosNegocios = {};
  NEGOCIOS_CONFIG.forEach(neg => {
    const estado = todosEstadosNegocios[neg.id] || {};
    resultadosNegocios[neg.id] = simularNegocioCompleto({
      negocioId: neg.id,
      escenarioActivo: estado.escenarioActivo || 'medio',
      overridesUsuario: estado.overridesUsuario || null,
      diasLaborales: estado.diasLaborales || neg.diasLaboralesDefault,
      horasTurno: estado.horasTurno || neg.horasTurnoDefault,
      aparatos,
      esConsorcio: true,
      tarifas,
      costosMEM,
      diasPeriodo
    });
  });

  // Mapear consumo de negocios a cada medidor CFE
  const mapaMedidores = {};
  medidoresList.forEach(m => {
    mapaMedidores[m.id] = {
      medidor: m,
      negociosAsignados: [],
      kwhMes: 0,
      kwhDiario: 0,
      kwhPeriodo: 0,
      reciboCFE: null
    };
  });

  // Asignar negocios a medidores
  NEGOCIOS_CONFIG.forEach(neg => {
    const medId = neg.medidorIdConsorcio;
    const simNeg = resultadosNegocios[neg.id];
    if (mapaMedidores[medId]) {
      mapaMedidores[medId].negociosAsignados.push(neg.nombre);
      mapaMedidores[medId].kwhMes += simNeg.totalKwhMes;
      mapaMedidores[medId].kwhDiario += simNeg.totalKwhDiario;
      mapaMedidores[medId].kwhPeriodo += simNeg.kwhPeriodoCFE;
    }
  });

  // Sumar servicios comunes de consorcio_general si existen en med_6
  const serviciosGenerales = aparatos.filter(ap => (ap.medidorId === 'med_6' || !ap.medidorId) && (ap.tipo || '').toLowerCase().includes('[servicios]'));
  let kwhServiciosPeriodo = 0;
  serviciosGenerales.forEach(ap => {
    const w = parseFloat(ap.watts) || 0;
    const h = parseFloat(ap.horasAlta) || 2;
    kwhServiciosPeriodo += ((w * h) / 1000) * diasPeriodo;
  });
  if (mapaMedidores['med_6']) {
    mapaMedidores['med_6'].kwhPeriodo += kwhServiciosPeriodo;
    mapaMedidores['med_6'].kwhDiario += kwhServiciosPeriodo / diasPeriodo;
    mapaMedidores['med_6'].kwhMes += (kwhServiciosPeriodo / diasPeriodo) * 30;
    if (serviciosGenerales.length > 0) {
      mapaMedidores['med_6'].negociosAsignados.push('Servicios Comunes');
    }
  }

  // Calcular cobro CFE escalonado independiente para cada medidor
  let totalKwhPeriodoConsorcio = 0;
  let totalFacturaConsorcio = 0;

  Object.keys(mapaMedidores).forEach(medId => {
    const medData = mapaMedidores[medId];
    const cobro = calcularCobroCFECompleto(medData.kwhPeriodo, tarifas, costosMEM);
    medData.reciboCFE = cobro;
    totalKwhPeriodoConsorcio += medData.kwhPeriodo;
    totalFacturaConsorcio += (cobro.factura?.total || 0);
  });

  return {
    resultadosNegocios,
    mapaMedidores,
    totalKwhPeriodoConsorcio,
    totalKwhDiarioConsorcio: totalKwhPeriodoConsorcio / diasPeriodo,
    totalFacturaConsorcio
  };
}
