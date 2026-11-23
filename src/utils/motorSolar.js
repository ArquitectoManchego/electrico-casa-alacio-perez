/**
 * Motor de Ingeniería Fotovoltaica, Simulación Financiera y Respaldo en Baterías
 * Calibrado para Veracruz, Ver. (HSP 5.0 h, PR 0.80) e integrado con los
 * escenarios de venta reales y tarifas CFE del Consorcio Gallegos González.
 */

import {
  ARQUITECTURAS_SOLARES,
  PARAMETROS_MERCADO_SOLAR
} from '../data/cotizacionesSolares.js';
import { NEGOCIOS_CONFIG } from './equiposNegocios.js';
import { simularNegocioCompleto } from './motorSimulacionVentas.js';
import { calcularCobroCFECompleto, calcularKwhMesAparato } from './simuladorCFE.js';
import { identificarNegocioDeAparato } from './localHelpers.js';

/**
 * Calcula kWh/mes promedio de un solo panel en Veracruz.
 */
export function calcularKwhMesPorPanel(wattsPanel = 645, hsp = PARAMETROS_MERCADO_SOLAR.hspPromedio, pr = PARAMETROS_MERCADO_SOLAR.performanceRatio) {
  const kw = (parseFloat(wattsPanel) || 645) / 1000;
  return kw * hsp * pr * 30;
}

/**
 * Obtiene la tabla de escenarios de consumo del edificio (o medidor específico)
 * conectada con los escenarios de venta reales del proyecto.
 */
export function obtenerEscenariosConsumoSolar({
  aparatos = [],
  medidores = [],
  alcanceMedidorId = 'todos',
  mesActivo = 8
}) {
  const listaMed = Array.isArray(medidores) && medidores.length > 0
    ? medidores
    : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1' }];
  const defaultMedId = listaMed[0].id;

  // Filtrar aparatos por alcance de medidor
  const apsAlcance = alcanceMedidorId === 'todos'
    ? aparatos
    : aparatos.filter(ap => (ap.medidorId || defaultMedId) === alcanceMedidorId);

  const apsEncendidos = apsAlcance.filter(ap => ap.encendido !== false);

  // Negocios presentes en el alcance actual
  const negociosEnAlcanceIds = new Set();
  if (alcanceMedidorId === 'todos' || apsAlcance.length === 0) {
    NEGOCIOS_CONFIG.forEach(n => negociosEnAlcanceIds.add(n.id));
  } else {
    apsAlcance.forEach(ap => {
      const info = identificarNegocioDeAparato(ap);
      if (info?.negocioId) negociosEnAlcanceIds.add(info.negocioId);
    });
  }

  // Helper para simular un escenario base del motor de ventas
  const simularEscenarioBase = (escId, filtroNegocios = null) => {
    let kwhMes = 0;
    NEGOCIOS_CONFIG.forEach(neg => {
      if (filtroNegocios && !filtroNegocios.has(neg.id)) return;
      if (!filtroNegocios && !negociosEnAlcanceIds.has(neg.id)) return;
      const res = simularNegocioCompleto({
        negocioId: neg.id,
        escenarioActivo: escId,
        diasLaborales: neg.diasLaboralesDefault,
        horasTurno: neg.horasTurnoDefault,
        mesActivo,
        aparatos: apsAlcance.length > 0 ? apsAlcance : [],
        esConsorcio: true,
        diasPeriodo: 60
      });
      kwhMes += res.totalKwhMes || 0;
    });
    return Math.round(kwhMes);
  };

  const kwhBajo = simularEscenarioBase('bajo');
  const kwhTablas = simularEscenarioBase('tablas');
  const kwhMedio = simularEscenarioBase('medio');
  const kwhAlto = simularEscenarioBase('alto');
  const kwhMuyAlto = simularEscenarioBase('muy_alto');
  const kwhMuyBajo = Math.round(kwhBajo * 0.82);
  const kwhMedioAlto = Math.round((kwhMedio + kwhAlto) / 2);

  // Fase inicial: Imperia Uniformes + Hawaiian Paradise (baja/tablas)
  const setInicial = new Set(['imperia_uniformes', 'hawaiian_paradise']);
  const kwhArranqueInicial = Math.max(
    450,
    Math.round((simularEscenarioBase('bajo', setInicial) + simularEscenarioBase('tablas', setInicial)) / 2)
  );

  // Consumo real de los equipos actualmente encendidos en Cuadro de Cargas
  const kwhEncendidosHoy = Math.round(
    apsEncendidos.reduce((acc, ap) => acc + calcularKwhMesAparato(ap), 0)
  );

  // Demanda simultánea aproximada (kW) según actividad
  const wattsInstaladosAlcance = apsAlcance.reduce((s, a) => s + (parseFloat(a.watts) || 0), 0) || 42357;
  const wattsEncendidos = apsEncendidos.reduce((s, a) => s + (parseFloat(a.watts) || 0), 0);

  return [
    {
      id: 'arranque_inicial',
      nombre: 'Arranque Inicial',
      etiquetaCorta: 'Fase 1 (Imperia + Hawaiian)',
      descripcion: 'Primer medidor energizando Imperia Uniformes, Hawaiian Paradise e iluminación básica.',
      kwhMes: kwhArranqueInicial,
      kwSimultaneo: 4.2,
      factorActividad: 0.22
    },
    {
      id: 'encendidos_hoy',
      nombre: 'Encendidos Hoy',
      etiquetaCorta: `Activos (${apsEncendidos.length} eq.)`,
      descripcion: 'Consumo calculado únicamente con los aparatos que dejaste encendidos en el Cuadro de Cargas.',
      kwhMes: Math.max(150, kwhEncendidosHoy || kwhArranqueInicial),
      kwSimultaneo: Number(Math.max(1.5, (wattsEncendidos / 1000) * 0.35).toFixed(1)),
      factorActividad: 0.35
    },
    {
      id: 'muy_bajo',
      nombre: 'Muy Baja Venta',
      etiquetaCorta: 'Muy Baja (~15%)',
      descripcion: 'Temporada tranquila, pocos servicios productivos y climatización mínima.',
      kwhMes: Math.max(300, kwhMuyBajo),
      kwSimultaneo: Number(((wattsInstaladosAlcance / 1000) * 0.13).toFixed(1)),
      factorActividad: 0.15
    },
    {
      id: 'bajo',
      nombre: 'Baja Venta',
      etiquetaCorta: 'Baja (~20%)',
      descripcion: 'Flujo moderado bajo en los locales con operación esencial.',
      kwhMes: Math.max(350, kwhBajo),
      kwSimultaneo: Number(((wattsInstaladosAlcance / 1000) * 0.17).toFixed(1)),
      factorActividad: 0.20
    },
    {
      id: 'tablas',
      nombre: 'Sales Tablas',
      etiquetaCorta: 'Tablas (~35%)',
      descripcion: 'Punto de equilibrio operativo del consorcio.',
      kwhMes: Math.max(450, kwhTablas),
      kwSimultaneo: Number(((wattsInstaladosAlcance / 1000) * 0.22).toFixed(1)),
      factorActividad: 0.35
    },
    {
      id: 'medio',
      nombre: 'Venta Media',
      etiquetaCorta: 'Media (~50%)',
      descripcion: 'Operación comercial sana y constante durante el mes.',
      kwhMes: Math.max(550, kwhMedio),
      kwSimultaneo: Number(((wattsInstaladosAlcance / 1000) * 0.27).toFixed(1)),
      factorActividad: 0.50
    },
    {
      id: 'medio_alto',
      nombre: 'Media Alta',
      etiquetaCorta: 'Media Alta (~65%)',
      descripcion: 'Mes con buena demanda, pedidos por lote y refuerzo de clima.',
      kwhMes: Math.max(650, kwhMedioAlto),
      kwSimultaneo: Number(((wattsInstaladosAlcance / 1000) * 0.33).toFixed(1)),
      factorActividad: 0.65
    },
    {
      id: 'alto',
      nombre: 'Venta Alta',
      etiquetaCorta: 'Alta (~80%)',
      descripcion: 'Temporada alta (regreso a clases / calor intenso) al 80% de capacidad.',
      kwhMes: Math.max(750, kwhAlto),
      kwSimultaneo: Number(((wattsInstaladosAlcance / 1000) * 0.39).toFixed(1)),
      factorActividad: 0.80
    },
    {
      id: 'muy_alto',
      nombre: 'Muy Alta Venta',
      etiquetaCorta: 'Muy Alta (~95%)',
      descripcion: 'Demanda pico máxima en todos los negocios simultáneamente.',
      kwhMes: Math.max(850, kwhMuyAlto),
      kwSimultaneo: Number(((wattsInstaladosAlcance / 1000) * 0.44).toFixed(1)),
      factorActividad: 0.95
    }
  ];
}

/**
 * Clasifica todos los equipos reales del edificio en Niveles de Criticidad 1, 2 y 3
 * calculando tanto su potencia de placa como su demanda real promedio en respaldo.
 */
export function clasificarEquiposPorCriticidad(aparatos = []) {
  // Si no hay aparatos cargados aún, generar desde NEGOCIOS_CONFIG
  const fuente = Array.isArray(aparatos) && aparatos.length > 0
    ? aparatos
    : NEGOCIOS_CONFIG.flatMap(neg =>
        Object.values(neg.equipos).map(eq => ({
          id: `${neg.id}_${eq.key}`,
          tipo: eq.nombre,
          local: neg.nombre,
          watts: eq.wattsNominal,
          tipoCarga: eq.tipoCarga,
          encendido: true
        }))
      );

  return fuente.map((ap, idx) => {
    const nombre = (ap.tipo || 'Equipo').trim();
    const lower = nombre.toLowerCase();
    const wattsNominal = Math.max(0, parseFloat(ap.watts) || 0);
    const es220V = ap.tipoCarga === 'bifasica' || ap.tipoCarga === 'trifasica' || lower.includes('220v');
    const infoNeg = identificarNegocioDeAparato(ap);
    const local = ap.local || infoNeg?.negocioNombre || 'Edificio';

    let nivel = 2;
    let factorCiclo = 0.65;
    let motivo = 'Producción ligera / apoyo operativo';

    // Nivel 1: Supervivencia Crítica (Refrigeración, TPV/Caja, Terminales, CCTV, Módem, Alumbrado LED)
    if (
      lower.includes('refrigerador') ||
      lower.includes('congelador') ||
      lower.includes('congeladora')
    ) {
      nivel = 1;
      factorCiclo = 0.45; // Compresor inverter / cíclico
      motivo = 'Evita pérdida de alimentos, helados y lácteos';
    } else if (
      lower.includes('cctv') ||
      lower.includes('cámara') ||
      lower.includes('camara') ||
      lower.includes('módem') ||
      lower.includes('modem') ||
      lower.includes('router') ||
      lower.includes('wifi') ||
      lower.includes('terminal') ||
      lower.includes('bancaria') ||
      lower.includes('tpv') ||
      lower.includes('punto de venta') ||
      lower.includes('mostrador') ||
      lower.includes('laptop') ||
      lower.includes('portátil')
    ) {
      nivel = 1;
      factorCiclo = 0.70;
      motivo = 'Seguridad, internet y continuidad de cobro/ventas';
    } else if (
      lower.includes('alumbrado') ||
      lower.includes('led') ||
      lower.includes('luminaria') ||
      lower.includes('rótulo') ||
      lower.includes('rotulo')
    ) {
      nivel = 1;
      factorCiclo = 0.90;
      motivo = 'Iluminación básica de locales y pasillos';
    } else if (
      es220V ||
      lower.includes('minisplit') ||
      lower.includes('clima') ||
      lower.includes('crepera') ||
      lower.includes('gaggia') ||
      lower.includes('expresso') ||
      lower.includes('cafetera') ||
      lower.includes('xerox') ||
      lower.includes('docucolor') ||
      lower.includes('aemco') ||
      lower.includes('melco') ||
      lower.includes('caldera') ||
      lower.includes('plancha de vapor') ||
      lower.includes('plancha plana') ||
      lower.includes('licuadora') ||
      lower.includes('bomba') ||
      lower.includes('gfci') ||
      wattsNominal >= 1400
    ) {
      nivel = 3;
      factorCiclo = lower.includes('minisplit') || lower.includes('clima') ? 0.65 : 0.75;
      motivo = es220V
        ? 'Carga 220V de alta demanda (requiere inversor bifásico/grande)'
        : 'Resistencia térmica o motor pesado de alto consumo';
    } else {
      nivel = 2;
      if (lower.includes('singer') || lower.includes('overlock') || lower.includes('collaretera')) {
        factorCiclo = 0.45; // Servomotores solo consumen al pisar pedal
        motivo = 'Costura industrial (servomotor eficiente)';
      } else if (lower.includes('láser') || lower.includes('laser') || lower.includes('scanncut') || lower.includes('pe770') || lower.includes('epson')) {
        factorCiclo = 0.65;
        motivo = 'Personalizado digital sensible (requiere onda pura)';
      } else if (lower.includes('marquesit') || lower.includes('tetera') || lower.includes('olla') || lower.includes('baño maría')) {
        factorCiclo = 0.60;
        motivo = 'Preparación intermitente de alimentos 120V';
      } else {
        factorCiclo = 0.60;
      }
    }

    const wattsReales = Math.round(wattsNominal * factorCiclo);

    return {
      id: ap.id || `eq_respaldo_${idx}`,
      nombre,
      local,
      wattsNominal,
      wattsReales,
      factorCiclo,
      es220V,
      nivel,
      motivo,
      encendidoEnProyecto: ap.encendido !== false
    };
  });
}

/**
 * Calcula autonomía en horas y diagnóstico de capacidad de respaldo para un conjunto seleccionado de equipos.
 */
export function calcularAutonomiaRespaldo({
  equiposClasificados = [],
  idsSeleccionados = new Set(),
  bateriaKwh = 0,
  arquitecturaId = 'on_grid',
  potenciaKwp = 5.16,
  panelesActivos = 8
}) {
  const arq = ARQUITECTURAS_SOLARES.find(a => a.id === arquitecturaId) || ARQUITECTURAS_SOLARES[0];
  const seleccionados = equiposClasificados.filter(e => idsSeleccionados.has(e.id));

  const wattsNominalTotal = seleccionados.reduce((s, e) => s + e.wattsNominal, 0);
  const wattsRealesTotal = seleccionados.reduce((s, e) => s + e.wattsReales, 0);
  const kwReales = wattsRealesTotal / 1000;
  const requiere220V = seleccionados.some(e => e.es220V);

  // Capacidad estimada del inversor según tamaño de banco de baterías / paneles
  const inversorCapacidadKw = !arq.funcionaEnApagon
    ? 0
    : Math.max(
        3.0,
        Math.min(
          20.0,
          Math.ceil(Math.max(bateriaKwh * 0.65, potenciaKwp * 0.9, 3))
        )
      );

  const energiaUtilBateriaKwh = Math.max(0, bateriaKwh) * PARAMETROS_MERCADO_SOLAR.bateriaDoD * PARAMETROS_MERCADO_SOLAR.eficienciaInversor;

  let horasNoche = 0;
  let horasDiaConSol = 0;
  let solarCubreDiaCompleto = false;

  if (arq.funcionaEnApagon && kwReales > 0) {
    horasNoche = energiaUtilBateriaKwh / kwReales;

    if (arq.usaPaneles && panelesActivos > 0) {
      // Potencia solar promedio durante 5.5 horas centrales del día en Veracruz (~72% del kWp)
      const kwSolarPromedioDia = potenciaKwp * 0.72;
      if (kwSolarPromedioDia >= kwReales) {
        solarCubreDiaCompleto = true;
        // Opera todo el día solar (~8h) + lo que quede de batería en la noche
        horasDiaConSol = 8 + horasNoche;
      } else {
        const deficitKw = kwReales - kwSolarPromedioDia;
        horasDiaConSol = energiaUtilBateriaKwh / Math.max(0.1, deficitKw);
      }
    } else {
      horasDiaConSol = horasNoche;
    }
  }

  const excedeInversor = arq.funcionaEnApagon && (wattsRealesTotal > inversorCapacidadKw * 1000);

  return {
    soportaRespaldo: arq.funcionaEnApagon,
    cantidadEquipos: seleccionados.length,
    wattsNominalTotal,
    wattsRealesTotal,
    kwReales,
    requiere220V,
    energiaUtilBateriaKwh,
    inversorCapacidadKw,
    excedeInversor,
    horasNoche: Math.min(99, horasNoche),
    horasDiaConSol: Math.min(99, horasDiaConSol),
    solarCubreDiaCompleto
  };
}

/**
 * Calcula el plan óptimo alcanzable dado un presupuesto en MXN.
 */
export function calcularPlanDesdePresupuesto({
  presupuestoMxn = 85000,
  arquitecturaId = 'on_grid',
  wattsPorPanel = PARAMETROS_MERCADO_SOLAR.wattPanelReferencia,
  costoWp = PARAMETROS_MERCADO_SOLAR.costoWpReferenciaOnGrid,
  aplicarISR = false
}) {
  const arq = ARQUITECTURAS_SOLARES.find(a => a.id === arquitecturaId) || ARQUITECTURAS_SOLARES[0];
  // Si el presupuesto representa desembolso neto tras ISR, la inversión bruta facturada equivalente es mayor
  const presupuestoBruto = aplicarISR ? presupuestoMxn / (1 - PARAMETROS_MERCADO_SOLAR.tasaISR) : presupuestoMxn;
  const costoPorPanel = wattsPorPanel * costoWp;

  if (arquitecturaId === 'ups_baterias') {
    const costoBaseInversor = 22000;
    const disponibleBaterias = Math.max(0, presupuestoBruto - costoBaseInversor);
    const modulos = Math.max(1, Math.min(8, Math.floor(disponibleBaterias / PARAMETROS_MERCADO_SOLAR.costoBateriaPor5KwhMxn) || 1));
    return {
      cantidadPaneles: 0,
      bateriaKwh: modulos * PARAMETROS_MERCADO_SOLAR.bateriaModuloKwh
    };
  }

  if (arquitecturaId === 'hibrido' || arquitecturaId === 'off_grid') {
    const extraInversor = arq.costoExtraHibrido;
    const disponible = Math.max(0, presupuestoBruto - extraInversor);
    // Asignar ~38% a baterías (mínimo 1 módulo de 5 kWh, en off_grid mínimo 15 kWh) y ~62% a paneles
    const minBatModulos = arquitecturaId === 'off_grid' ? 3 : 1;
    const targetBatMxn = disponible * (arquitecturaId === 'off_grid' ? 0.48 : 0.36);
    const modulosBat = Math.max(
      minBatModulos,
      Math.min(8, Math.round(targetBatMxn / PARAMETROS_MERCADO_SOLAR.costoBateriaPor5KwhMxn))
    );
    const costoBat = modulosBat * PARAMETROS_MERCADO_SOLAR.costoBateriaPor5KwhMxn;
    const restantePaneles = Math.max(costoPorPanel * 4, disponible - costoBat);
    const paneles = Math.max(4, Math.min(60, Math.round(restantePaneles / costoPorPanel)));
    return {
      cantidadPaneles: paneles,
      bateriaKwh: modulosBat * PARAMETROS_MERCADO_SOLAR.bateriaModuloKwh
    };
  }

  // On-Grid o Zero-Export
  const extra = arq.costoExtraHibrido || 0;
  const disponiblePaneles = Math.max(costoPorPanel * 2, presupuestoBruto - extra);
  const paneles = Math.max(2, Math.min(60, Math.round(disponiblePaneles / costoPorPanel)));
  return {
    cantidadPaneles: paneles,
    bateriaKwh: 0
  };
}

/**
 * Simulación integral técnica y financiera del sistema fotovoltaico/respaldo.
 */
export function simularSistemaSolarCompleto({
  arquitecturaId = 'on_grid',
  kwhMesConsumo = 1730,
  cantidadPaneles = 8,
  wattsPorPanel = 645,
  bateriaKwh = 0,
  costoWp = PARAMETROS_MERCADO_SOLAR.costoWpReferenciaOnGrid,
  precioBasePanelesOverride = null, // Cuando se carga una cotización real de WhatsApp
  aplicarISR = false,
  azoteaDisponibleM2 = PARAMETROS_MERCADO_SOLAR.azoteaDefaultM2,
  tarifas = {},
  costosMEM = {}
}) {
  const arq = ARQUITECTURAS_SOLARES.find(a => a.id === arquitecturaId) || ARQUITECTURAS_SOLARES[0];
  const panelesEfectivos = arq.usaPaneles ? Math.max(0, Math.round(cantidadPaneles)) : 0;
  const bateriaEfectiva = arq.usaBaterias ? Math.max(0, Number(bateriaKwh) || 0) : 0;

  const potenciaKwp = (panelesEfectivos * wattsPorPanel) / 1000;
  const kwhMesPorPanel = calcularKwhMesPorPanel(wattsPorPanel);
  const generacionTeoricaMesKwh = panelesEfectivos * kwhMesPorPanel;
  const generacionAprovechableMesKwh = generacionTeoricaMesKwh * arq.factorAprovechamientoSolar;
  const generacionBimestralKwh = generacionAprovechableMesKwh * 2;
  const generacionDiariaKwh = generacionAprovechableMesKwh / 30;

  const consumoBimestralKwh = Math.max(1, kwhMesConsumo * 2);

  // Recibo CFE antes y después (bimestral, estándar CFE)
  const reciboAntesObj = calcularCobroCFECompleto(consumoBimestralKwh, tarifas, costosMEM);
  const reciboAntesBimMxn = reciboAntesObj?.factura?.total || 0;

  // En CFE siempre existe un cargo mínimo fijo (~$64 MXN bimestrales si el neto <= 25 kWh)
  const kwhNetoBim = arquitecturaId === 'off_grid'
    ? 0
    : Math.max(0, consumoBimestralKwh - generacionBimestralKwh);

  const reciboDespuesObj = calcularCobroCFECompleto(kwhNetoBim, tarifas, costosMEM);
  const cargoMinimoCfe = arquitecturaId === 'off_grid' ? 0 : 64;
  const reciboDespuesBimMxn = arquitecturaId === 'ups_baterias'
    ? reciboAntesBimMxn
    : (arquitecturaId === 'off_grid' ? 0 : Math.max(cargoMinimoCfe, reciboDespuesObj?.factura?.total || 0));

  const ahorroBimestralMxn = Math.max(0, reciboAntesBimMxn - reciboDespuesBimMxn);
  const ahorroMensualMxn = ahorroBimestralMxn / 2;
  const ahorroAnualMxn = ahorroBimestralMxn * 6;
  const porcentajeAhorroDinero = reciboAntesBimMxn > 0 ? (ahorroBimestralMxn / reciboAntesBimMxn) * 100 : 0;
  const coberturaEnergeticaPct = consumoBimestralKwh > 0
    ? Math.min(100, (generacionBimestralKwh / consumoBimestralKwh) * 100)
    : 0;

  // Costo de Inversión Total
  let costoPanelesYMontajeMxn = 0;
  if (arq.usaPaneles) {
    if (precioBasePanelesOverride !== null && precioBasePanelesOverride > 0) {
      costoPanelesYMontajeMxn = precioBasePanelesOverride;
    } else {
      costoPanelesYMontajeMxn = Math.round(panelesEfectivos * wattsPorPanel * costoWp);
    }
  }

  const numModulosBat = Math.ceil(bateriaEfectiva / PARAMETROS_MERCADO_SOLAR.bateriaModuloKwh);
  const costoBateriasMxn = arq.usaBaterias
    ? numModulosBat * PARAMETROS_MERCADO_SOLAR.costoBateriaPor5KwhMxn
    : 0;

  let costoElectronicaExtraMxn = arq.costoExtraHibrido || 0;
  if (arquitecturaId === 'ups_baterias') {
    const kwUps = Math.max(3, Math.ceil(bateriaEfectiva * 0.6));
    costoElectronicaExtraMxn = 14000 + kwUps * PARAMETROS_MERCADO_SOLAR.costoInversorUpsPorKwMxn;
  } else if ((arquitecturaId === 'hibrido' || arquitecturaId === 'off_grid') && potenciaKwp > 6) {
    // Escalamiento de inversor híbrido para sistemas medianos/grandes
    costoElectronicaExtraMxn += Math.round((potenciaKwp - 6) * 3200);
  }

  const inversionBrutaMxn = Math.round(costoPanelesYMontajeMxn + costoBateriasMxn + costoElectronicaExtraMxn);
  const beneficioFiscalISRMxn = Math.round(inversionBrutaMxn * PARAMETROS_MERCADO_SOLAR.tasaISR);
  const inversionNetaMxn = aplicarISR ? inversionBrutaMxn - beneficioFiscalISRMxn : inversionBrutaMxn;

  const costoPorWattMxn = potenciaKwp > 0 ? inversionBrutaMxn / (potenciaKwp * 1000) : 0;

  // Retorno de inversión y flujo a 25 años (considerando degradación 0.5% anual e inflación CFE 4.5% anual)
  let ahorroAcumulado25 = 0;
  let roiAnosExacto = null;
  const serieAnual = [];
  for (let yr = 1; yr <= 25; yr++) {
    const factorGen = Math.pow(1 - PARAMETROS_MERCADO_SOLAR.degradacionAnual, yr - 1);
    const factorTarifa = Math.pow(1 + PARAMETROS_MERCADO_SOLAR.inflacionCfeAnual, yr - 1);
    const ahorroYr = ahorroAnualMxn * factorGen * factorTarifa;
    const prevAcum = ahorroAcumulado25;
    ahorroAcumulado25 += ahorroYr;
    if (roiAnosExacto === null && ahorroAcumulado25 >= inversionNetaMxn && ahorroYr > 0) {
      const fraccion = (inversionNetaMxn - prevAcum) / ahorroYr;
      roiAnosExacto = (yr - 1) + Math.max(0, Math.min(1, fraccion));
    }
    serieAnual.push({
      anio: yr,
      ahorroAnual: Math.round(ahorroYr),
      acumuladoNeto: Math.round(ahorroAcumulado25 - inversionNetaMxn)
    });
  }

  const areaRequeridaM2 = Math.round(panelesEfectivos * PARAMETROS_MERCADO_SOLAR.areaPorPanelM2);
  const excedeAzotea = areaRequeridaM2 > azoteaDisponibleM2;
  const panelesIdeal100 = Math.max(1, Math.ceil(kwhMesConsumo / Math.max(1, kwhMesPorPanel * (arq.factorAprovechamientoSolar || 1))));
  const co2EvitadoAnualKg = Math.round(generacionAprovechableMesKwh * 12 * 0.435); // Factor emisión SEN México

  return {
    arquitectura: arq,
    panelesEfectivos,
    wattsPorPanel,
    potenciaKwp: Number(potenciaKwp.toFixed(2)),
    bateriaEfectiva,
    numModulosBat,
    generacionDiariaKwh: Number(generacionDiariaKwh.toFixed(1)),
    generacionMensualKwh: Math.round(generacionAprovechableMesKwh),
    generacionBimestralKwh: Math.round(generacionBimestralKwh),
    consumoMensualKwh: Math.round(kwhMesConsumo),
    consumoBimestralKwh: Math.round(consumoBimestralKwh),
    coberturaEnergeticaPct: Number(coberturaEnergeticaPct.toFixed(1)),
    porcentajeAhorroDinero: Number(porcentajeAhorroDinero.toFixed(1)),
    reciboAntesBimMxn: Math.round(reciboAntesBimMxn),
    reciboDespuesBimMxn: Math.round(reciboDespuesBimMxn),
    ahorroBimestralMxn: Math.round(ahorroBimestralMxn),
    ahorroMensualMxn: Math.round(ahorroMensualMxn),
    ahorroAnualMxn: Math.round(ahorroAnualMxn),
    costoPanelesYMontajeMxn,
    costoBateriasMxn,
    costoElectronicaExtraMxn,
    inversionBrutaMxn,
    beneficioFiscalISRMxn,
    inversionNetaMxn,
    costoPorWattMxn: Number(costoPorWattMxn.toFixed(2)),
    roiAnos: roiAnosExacto !== null ? Number(roiAnosExacto.toFixed(1)) : null,
    ahorroAcumulado25Mxn: Math.round(ahorroAcumulado25),
    gananciaNeta25Mxn: Math.round(ahorroAcumulado25 - inversionNetaMxn),
    areaRequeridaM2,
    excedeAzotea,
    panelesIdeal100,
    co2EvitadoAnualKg,
    serieAnual
  };
}

/**
 * Calcula los flujos instantáneos de energía para el diagrama animado SVG
 * según la hora del día (6–23h), la arquitectura y si se simuló un Apagón CFE.
 */
export function calcularFlujoSolarInstantaneo({
  hora = 13,
  arquitecturaId = 'on_grid',
  potenciaKwp = 5.16,
  wattsEdificioActual = 4500,
  wattsCriticosActual = 1800,
  bateriaKwh = 0,
  apagonCFE = false
}) {
  const arq = ARQUITECTURAS_SOLARES.find(a => a.id === arquitecturaId) || ARQUITECTURAS_SOLARES[0];

  // Curva sinusoidal de radiación solar en Veracruz (6:30 AM a 6:30 PM)
  let factorSol = 0;
  if (hora >= 6.5 && hora <= 18.5) {
    factorSol = Math.sin(((hora - 6.5) / 12) * Math.PI);
  }
  const esDia = factorSol > 0.05;

  const wattsSolDisponible = arq.usaPaneles
    ? Math.round(potenciaKwp * 1000 * PARAMETROS_MERCADO_SOLAR.performanceRatio * factorSol)
    : 0;

  let solAInversorW = 0;
  let inversorAEdificioW = 0;
  let inversorACfeW = 0;
  let cfeAEdificioW = 0;
  let inversorABateriaW = 0;
  let bateriaAInversorW = 0;
  let edificioEnergizado = true;
  let modoOperacionTitulo = '';
  let modoOperacionDetalle = '';
  let alertaNivel = 'ok'; // 'ok' | 'warning' | 'danger'

  // Caso 1: APAGÓN DE CFE
  if (apagonCFE) {
    if (!arq.funcionaEnApagon) {
      // On-Grid y Zero-Export SE APAGAN por norma anti-isla
      edificioEnergizado = false;
      alertaNivel = 'danger';
      modoOperacionTitulo = '⛔ SISTEMA DETENIDO POR SEGURIDAD ANTI-ISLA';
      modoOperacionDetalle = esDia
        ? 'Aunque haya sol, un sistema sin baterías DEBE desconectarse cuando falla CFE para no electrocutar a técnicos en los postes. El edificio queda sin luz.'
        : 'Sin red de CFE ni baterías de respaldo, el edificio queda sin energía hasta que regrese la luz de la calle.';
    } else if (bateriaKwh <= 0 && !esDia) {
      edificioEnergizado = false;
      alertaNivel = 'danger';
      modoOperacionTitulo = '🔋 SIN BATERÍA SUFICIENTE';
      modoOperacionDetalle = 'Aumenta la barra de almacenamiento en baterías para poder sostener los equipos críticos en un apagón.';
    } else {
      // Híbrido, UPS o Off-Grid manteniendo cargas críticas
      const demandaBackup = Math.max(300, wattsCriticosActual);
      solAInversorW = arq.usaPaneles ? wattsSolDisponible : 0;

      if (solAInversorW >= demandaBackup) {
        inversorAEdificioW = demandaBackup;
        inversorABateriaW = Math.min(3500, solAInversorW - demandaBackup);
        modoOperacionTitulo = '🛡️ RESPALDO ACTIVO CON SOL + RECARGA DE BATERÍAS';
        modoOperacionDetalle = `CFE falló, pero el inversor aisló la calle en 10 ms: tus paneles sostienen los ${(demandaBackup / 1000).toFixed(1)} kW críticos y el sobrante recarga las baterías.`;
        alertaNivel = 'ok';
      } else {
        inversorAEdificioW = demandaBackup;
        bateriaAInversorW = demandaBackup - solAInversorW;
        modoOperacionTitulo = solAInversorW > 0
          ? '🔋 RESPALDO ACTIVO (SOL + BATERÍAS)'
          : !esDia
            ? '🔋 RESPALDO NOCTURNO ACTIVO (BATERÍAS LiFePO4)'
            : '🔋 RESPALDO ACTIVO CON BATERÍAS LiFePO4';
        modoOperacionDetalle = `CFE está caído, pero tu banco de ${bateriaKwh} kWh mantiene refrigeradores, TPVs y cámaras encendidos sin cortes.`;
        alertaNivel = 'warning';
      }
    }
  } else {
    // Caso 2: OPERACIÓN NORMAL (CON RED CFE DISPONIBLE, EXCEPTO OFF-GRID)
    if (arquitecturaId === 'off_grid') {
      const demanda = wattsEdificioActual;
      solAInversorW = wattsSolDisponible;
      if (solAInversorW >= demanda) {
        inversorAEdificioW = demanda;
        inversorABateriaW = Math.min(4000, solAInversorW - demanda);
        modoOperacionTitulo = '☀️ AUTONOMÍA TOTAL · CARGANDO BATERÍAS';
        modoOperacionDetalle = 'Los paneles cubren el 100% del edificio y guardan el excedente en tu banco de litio para la noche.';
      } else {
        inversorAEdificioW = demanda;
        bateriaAInversorW = demanda - solAInversorW;
        modoOperacionTitulo = esDia ? '⛅ AUTONOMÍA MIXTA (SOL + BATERÍA)' : '🌙 AUTONOMÍA NOCTURNA (SOLO BATERÍAS)';
        modoOperacionDetalle = 'Operando 100% desconectado de CFE descargando tu energía almacenada.';
      }
    } else if (arquitecturaId === 'ups_baterias') {
      cfeAEdificioW = wattsEdificioActual;
      inversorABateriaW = 250; // Mantenimiento flotación 100%
      modoOperacionTitulo = '⚡ CFE ALIMENTANDO · BATERÍAS EN ESPERA (100%)';
      modoOperacionDetalle = 'CFE suministra la electricidad normal del edificio mientras las baterías permanecen cargadas y listas para entrar ante cualquier apagón.';
    } else if (arquitecturaId === 'zero_export') {
      // Cero exportación: nunca inyecta a CFE
      solAInversorW = Math.min(wattsSolDisponible, wattsEdificioActual);
      inversorAEdificioW = solAInversorW;
      cfeAEdificioW = Math.max(0, wattsEdificioActual - solAInversorW);
      modoOperacionTitulo = solAInversorW > 0
        ? '🎯 AUTOCONSUMO DIURNO (CERO INYECCIÓN A CFE)'
        : '🌙 OPERACIÓN NOCTURNA CON CFE';
      modoOperacionDetalle = solAInversorW > 0
        ? `El sensor CT regula el inversor a ${(solAInversorW / 1000).toFixed(2)} kW para alimentar directo a los locales sin exportar nada al medidor.`
        : 'Sin sol disponible, el edificio toma su consumo normal desde la acometida CFE.';
    } else {
      // On-Grid o Híbrido con CFE normal
      solAInversorW = wattsSolDisponible;
      const excedente = solAInversorW - wattsEdificioActual;

      if (excedente >= 0) {
        inversorAEdificioW = wattsEdificioActual;
        if (arquitecturaId === 'hibrido' && bateriaKwh > 0 && hora < 13) {
          inversorABateriaW = Math.min(excedente, 2000);
          inversorACfeW = Math.max(0, excedente - inversorABateriaW);
        } else {
          inversorACfeW = excedente;
        }
        modoOperacionTitulo = '💰 GENERANDO EXCEDENTES (MEDIDOR A TU FAVOR)';
        modoOperacionDetalle = `Tus paneles cubren el 100% del edificio ahora y mandan ${(inversorACfeW / 1000).toFixed(2)} kW a CFE como saldo a favor para usar en la noche.`;
      } else {
        inversorAEdificioW = solAInversorW;
        const faltante = wattsEdificioActual - solAInversorW;
        if (arquitecturaId === 'hibrido' && bateriaKwh > 0 && hora >= 18 && hora <= 21) {
          // Peak shaving nocturno
          bateriaAInversorW = Math.min(faltante, 2500);
          inversorAEdificioW += bateriaAInversorW;
          cfeAEdificioW = Math.max(0, faltante - bateriaAInversorW);
          modoOperacionTitulo = '🔋 AUTOCONSUMO NOCTURNO CON BATERÍA + CFE';
          modoOperacionDetalle = 'Tu batería entrega energía almacenada del sol para reducir el consumo de CFE en la tarde-noche.';
        } else {
          cfeAEdificioW = faltante;
          modoOperacionTitulo = solAInversorW > 0
            ? '☀️ OPERACIÓN MIXTA (SOL + APOYO CFE)'
            : '🌙 OPERACIÓN NOCTURNA (USANDO SALDO A FAVOR CFE)';
          modoOperacionDetalle = solAInversorW > 0
            ? `El sol aporta ${(solAInversorW / 1000).toFixed(2)} kW gratis y CFE complementa ${(cfeAEdificioW / 1000).toFixed(2)} kW.`
            : 'De noche tomas energía de CFE, descontándose automáticamente del saldo a favor que inyectaste durante el día.';
        }
      }
    }
  }

  return {
    esDia,
    factorSol,
    wattsSolDisponible,
    solAInversorW,
    inversorAEdificioW,
    inversorACfeW,
    cfeAEdificioW,
    inversorABateriaW,
    bateriaAInversorW,
    edificioEnergizado,
    modoOperacionTitulo,
    modoOperacionDetalle,
    alertaNivel
  };
}
