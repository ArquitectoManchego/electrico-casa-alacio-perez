/**
 * Motor Matemático de Simulación de Ventas, Procesos Productivos y Facturación CFE.
 * Implementa la física de lotes vs. unitaria, calibración al 80% de capacidad laboral y consolidación por medidores.
 */

import { NEGOCIOS_CONFIG, vincularEquiposConInventario } from './equiposNegocios.js';
import { PROCESOS_POR_NEGOCIO } from './procesosNegocios.js';
import { calcularCobroCFECompleto } from './simuladorCFE.js';
import { identificarNegocioDeAparato } from './localHelpers.js';

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
 * Calibra automáticamente los escenarios de venta para un negocio:
 * - bajo: ~20% capacidad
 * - tablas: ~35% capacidad (sales tablas / punto de equilibrio operativo)
 * - medio: ~50% capacidad (venta regular buena)
 * - alto: ~80% capacidad (temporada alta / 80% horario laboral)
 * - muy_alto: ~95% capacidad (demanda pico máxima)
 */
export function calibrarEscenariosNegocio(negocioConfig, procesosNegocio = [], mapaEquipos = {}, diasLaborales = 26, horasTurno = 8.0) {
  const minutosLaboralesMes = diasLaborales * horasTurno * 60;
  const ESCENARIOS_LISTA = ['bajo', 'tablas', 'medio', 'alto', 'muy_alto'];

  // Si el negocio tiene volúmenes fijos de baja ocupación (como Oficina Consorcio)
  if (negocioConfig.modoCapacidad === 'baja_ocupacion_oficina') {
    const escenarios = {};
    ESCENARIOS_LISTA.forEach(esc => {
      escenarios[esc] = { cantidades: {}, lotes: {} };
      procesosNegocio.forEach(p => {
        let cant = 1;
        if (p.volumenFijoEscenario) {
          if (p.volumenFijoEscenario[esc] !== undefined) {
            cant = p.volumenFijoEscenario[esc];
          } else if (esc === 'tablas') {
            const b = p.volumenFijoEscenario.bajo || 1;
            const m = p.volumenFijoEscenario.medio || 2;
            cant = Math.max(1, Math.round(b + (m - b) * 0.5));
          } else if (esc === 'muy_alto') {
            const a = p.volumenFijoEscenario.alto || 3;
            cant = Math.max(1, Math.round(a * 1.25));
          }
        }
        escenarios[esc].cantidades[p.id] = cant;
        escenarios[esc].lotes[p.id] = (p.lotesPorEscenario && (
          p.lotesPorEscenario[esc] ||
          (esc === 'tablas' ? p.lotesPorEscenario.bajo : p.lotesPorEscenario.alto) ||
          p.lotesPorEscenario.medio
        )) || 1;
      });
    });
    escenarios.equilibrio = escenarios.tablas;
    escenarios.buena = escenarios.medio;
    return escenarios;
  }

  // Para negocios de producción o comercial: calcular la utilización por unidad de mezcla
  const targets = {
    bajo: 0.20,
    tablas: 0.35,
    medio: 0.50,
    alto: 0.80, // 80% de capacidad en horario laboral para el equipo cuello de botella
    muy_alto: 0.95 // 95% de capacidad pico
  };

  const escenarios = {};

  ESCENARIOS_LISTA.forEach(esc => {
    const targetCap = targets[esc];
    const lotesEsc = {};
    procesosNegocio.forEach(p => {
      lotesEsc[p.id] = (p.lotesPorEscenario && (
        p.lotesPorEscenario[esc] ||
        (esc === 'tablas' ? p.lotesPorEscenario.bajo : (esc === 'muy_alto' ? p.lotesPorEscenario.alto : p.lotesPorEscenario.medio))
      )) || 1;
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

  escenarios.equilibrio = escenarios.tablas;
  escenarios.buena = escenarios.medio;

  return escenarios;
}

/**
 * Simula completamente un negocio individual en un escenario dado
 */
export function simularNegocioCompleto({
  negocioId,
  escenarioActivo = 'medio', // 'bajo' | 'tablas' | 'medio' | 'alto' | 'muy_alto' | 'custom'
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
    } else if (eq.rol === 'consumo_variable') {
      const hAlta = eq.horasAlta !== undefined ? eq.horasAlta : horasTurno;
      const hRep = eq.horasReposo || 0;
      const kwhDia = ((watts * hAlta) + (watts * 0.20 * hRep)) / 1000;
      const kwhMes = kwhDia * diasLaborales;
      kwhLucesTurnoMes += kwhMes;
      kwhEquiposMes[eqKey] = (kwhEquiposMes[eqKey] || 0) + kwhMes;
      minutosEquiposMes[eqKey] = (minutosEquiposMes[eqKey] || 0) + ((hAlta + hRep) * 60 * diasLaborales);
    } else if (eq.rol === 'turno_fijo') {
      // Encendidas durante el turno abierto o sus horas configuradas
      const hAlta = eq.horasAlta !== undefined ? eq.horasAlta : horasTurno;
      const horasMes = hAlta * diasLaborales;
      const kwhMes = ((watts * horasMes) / 1000);
      kwhLucesTurnoMes += kwhMes;
      kwhEquiposMes[eqKey] = (kwhEquiposMes[eqKey] || 0) + kwhMes;
      minutosEquiposMes[eqKey] = (minutosEquiposMes[eqKey] || 0) + (horasMes * 60);
    } else if (eq.rol === 'clima') {
      // Modulación de clima según escenario de venta y horario del local
      let factorUso = 0.65;
      if (escenarioActivo === 'bajo') factorUso = 0.50;
      else if (escenarioActivo === 'tablas' || escenarioActivo === 'equilibrio') factorUso = 0.58;
      else if (escenarioActivo === 'medio' || escenarioActivo === 'buena') factorUso = 0.65;
      else if (escenarioActivo === 'alto') factorUso = 0.85;
      else if (escenarioActivo === 'muy_alto') factorUso = 0.95;
      const hTurnoClima = eq.horasAlta !== undefined ? eq.horasAlta : horasTurno;
      const horasTurnoClimaMes = diasLaborales * hTurnoClima;
      const horasEfectivasClima = horasTurnoClimaMes * factorUso;
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
 * Simula de forma agregada los negocios distribuidos en los medidores CFE reales del consorcio
 */
export function simularConsorcioPorMedidores({
  todosEstadosNegocios = {},
  escenariosPorNegocio = {},
  aparatos = [],
  medidores = [],
  tarifas = {},
  costosMEM = {},
  diasPeriodo = 30,
  escenarioGlobal = null // 'bajo' | 'tablas' | 'medio' | 'alto' | 'muy_alto' | 'por_empresa'
}) {
  const medidoresList = Array.isArray(medidores) && medidores.length > 0
    ? medidores
    : [
        { id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }
      ];

  // 1. Simular cada uno de los negocios con su propio escenario guardado o el forzado
  const resultadosNegocios = {};
  const kwhPorAparatoIdMes = new Map();

  NEGOCIOS_CONFIG.forEach(neg => {
    const estado = todosEstadosNegocios[neg.id] || {};
    const escActivo = (escenarioGlobal && escenarioGlobal !== 'por_empresa' && escenarioGlobal !== 'personalizado')
      ? escenarioGlobal
      : (escenariosPorNegocio[neg.id] || estado.escenarioActivo || 'medio');

    const resNeg = simularNegocioCompleto({
      negocioId: neg.id,
      escenarioActivo: escActivo,
      overridesUsuario: (escenarioGlobal && escenarioGlobal !== 'por_empresa') ? null : (estado.overridesUsuario || null),
      diasLaborales: estado.diasLaborales || neg.diasLaboralesDefault,
      horasTurno: estado.horasTurno || neg.horasTurnoDefault,
      aparatos,
      esConsorcio: true,
      tarifas,
      costosMEM,
      diasPeriodo
    });

    resultadosNegocios[neg.id] = resNeg;

    // Registrar el consumo mensual simulado de cada aparato real de este negocio
    if (resNeg.capacidadesEquipos) {
      Object.values(resNeg.capacidadesEquipos).forEach(cap => {
        if (cap.aparatoReal && cap.aparatoReal.id) {
          kwhPorAparatoIdMes.set(cap.aparatoReal.id, cap.kwhMes || 0);
        }
      });
    }
  });

  // 2. Mapear medidores reales CFE
  const mapaMedidores = {};
  medidoresList.forEach(m => {
    mapaMedidores[m.id] = {
      medidor: m,
      negociosAsignados: [],
      aparatosAsignados: [],
      kwhMes: 0,
      kwhDiario: 0,
      kwhPeriodo: 0,
      reciboCFE: null
    };
  });

  const medidorPorDefectoId = medidoresList[0]?.id || 'med_1';

  // 3. Asignar el consumo de cada aparato de forma exacta a su medidor físico CFE
  aparatos.forEach(ap => {
    let medId = ap.medidorId;
    if (!medId || !mapaMedidores[medId]) {
      medId = medidorPorDefectoId;
    }
    const targetMed = mapaMedidores[medId];
    if (!targetMed) return;

    targetMed.aparatosAsignados.push(ap);

    // Identificar el negocio operativo de este equipo
    const infoNeg = identificarNegocioDeAparato(ap);
    if (!targetMed.negociosAsignados.includes(infoNeg.negocioNombre)) {
      targetMed.negociosAsignados.push(infoNeg.negocioNombre);
    }

    // Obtener consumo mensual simulado para este aparato
    let kwhMesAp = kwhPorAparatoIdMes.get(ap.id);
    if (kwhMesAp === undefined) {
      const w = parseFloat(ap.watts) || 0;
      const h = parseFloat(ap.horasAlta) || 2;
      kwhMesAp = ((w * h) / 1000) * 30;
    }

    const kwhDiarioAp = kwhMesAp / 30;
    const kwhPeriodoAp = kwhDiarioAp * diasPeriodo;

    targetMed.kwhMes += kwhMesAp;
    targetMed.kwhDiario += kwhDiarioAp;
    targetMed.kwhPeriodo += kwhPeriodoAp;
  });

  // Asegurar que medidores sin aparatos muestren al menos su propio nombre
  medidoresList.forEach(m => {
    if (mapaMedidores[m.id] && mapaMedidores[m.id].negociosAsignados.length === 0) {
      mapaMedidores[m.id].negociosAsignados.push(m.nombre || `Medidor ${m.numero}`);
    }
  });

  // 4. Calcular cobro CFE escalonado independiente para cada medidor físico
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

