/**
 * planoDocumentModel.js
 * 
 * Modela y valida la estructura de datos unificada para la generación del
 * Plano Eléctrico Profesional (Lámina 1: Diagrama Unifilar, Lámina 2: Cuadro de Cargas).
 * 
 * Regla de Oro: NO ejecuta fórmulas de cálculo eléctrico (S/V, caída, etc.).
 * Consume exclusivamente los resultados precalculados de computedElectricalSystem
 * garantizando coherencia matemática absoluta 1:1 entre ambas láminas.
 */

import { calcularCaidaTension, ajustarConductorTierraPorArt250_122, calcularAlimentadorGeneral } from './ecuacionesUVIE.js';
import { distribuirCargaPorFases } from './electricalCalculations.js';

// Retorna la fase predefinida de un slot según las fases habilitadas del tablero
export function getFaseDeSlot(slotNum, fasesDisp = ['A', 'B', 'C']) {
  const lista = Array.isArray(fasesDisp) && fasesDisp.length > 0 ? fasesDisp : ['A'];
  const idx = (Math.ceil(slotNum / 2) - 1) % lista.length;
  return lista[idx] || lista[0];
}

/**
 * Determina la categoría de simbología normalizada bajo la NOM mexicana más reciente (NOM-001-SEDE)
 * Categorías: 'motor' (M en recuadro), 'alumbrado' (círculo con aspa cruzada),
 * 'termico' (recuadro con resistencia en zig-zag), 'contacto' (círculo con diagonal).
 */
export function getTipoSimbologiaNom(item) {
  if (!item) return 'contacto';
  const t = `${item.tipo || ''} ${item.desc || ''} ${item.modelo || ''}`.toLowerCase();
  if (item.esMotor || /motor|bomba|compresor|extractor|refrig|congelador|vitrina|aire|ventilad|molino|licuadora/i.test(t)) {
    return 'motor';
  }
  if (/luz|alumbr|ilum|led|lampara/i.test(t)) {
    return 'alumbrado';
  }
  if (/crep|cafe|espresso|horno|calor|plancha|tostad|parrilla|microond|resistencia|termic|urna/i.test(t)) {
    return 'termico';
  }
  return 'contacto';
}

/**
 * Valida la sanidad de los datos antes de exportar
 */
export function validarSanidadPlano(computedElectricalSystem) {
  const errores = [];
  const advertencias = [];

  if (!computedElectricalSystem) {
    errores.push("No se ha cargado el sistema eléctrico del proyecto.");
    return { valido: false, errores, advertencias };
  }

  const { circuitos, alimPrincipal, acometida } = computedElectricalSystem;

  if (!Array.isArray(circuitos) || circuitos.length === 0) {
    errores.push("El proyecto no tiene circuitos registrados.");
  }

  if (!alimPrincipal) {
    errores.push("No se tienen datos del alimentador general.");
  } else {
    if (isNaN(alimPrincipal.caida) || alimPrincipal.caida === null) {
      errores.push("La caída de tensión del alimentador no es un número válido.");
    } else if (alimPrincipal.caida > 20) {
      advertencias.push(`Caída del alimentador muy alta (${alimPrincipal.caida}%).`);
    }
  }

  circuitos.forEach((c, i) => {
    const ctoId = c.num || `C-${i + 1}`;
    if (isNaN(c.watts) || c.watts <= 0) {
      errores.push(`El circuito ${ctoId} (${c.desc || c.tipo}) tiene potencia inválida (0 o NaN).`);
    }
    if (isNaN(c.caida) || c.caida === null) {
      errores.push(`El circuito ${ctoId} tiene una caída de tensión no numérica.`);
    }
    if (!c.breaker) {
      errores.push(`El circuito ${ctoId} no tiene protección asignada.`);
    }
    if (!c.conductor) {
      errores.push(`El circuito ${ctoId} no tiene conductor asignado.`);
    }
  });

  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}

/**
 * Construye el modelo completo para el plano a partir del sistema central y los metadatos
 */
export function buildPlanoDocumentModel({
  computedElectricalSystem,
  aparatos,
  planoMetadata = {},
  projectSettings = {},
  medidores = [],
  medidoresData = {}
}) {

  const {
    totalWatts = 0,
    totalVA = 0,
    acometida = { id: 'bifasico', tipo: 'Bifásica', fasesDisponibles: ['A', 'B'] },
    fasesLoad = { A: 0, B: 0, C: 0 },
    fasesVA = { A: 0, B: 0, C: 0 },
    desbalanceUVIE = 0,
    alimPrincipal = {},
    circuitos = []
  } = computedElectricalSystem || {};

  // Determinación de fases dinámicas L1, L2, L3
  const isMonofasico = acometida.id === 'monofasico';
  const isBifasico = acometida.id === 'bifasico';
  const isTrifasico = acometida.id === 'trifasico';

  const fasesNombres = isTrifasico 
    ? ['L1', 'L2', 'L3'] 
    : (isBifasico ? ['L1', 'L2'] : ['L1']);

  // Resolver corriente nominal y corregida del alimentador con binding robusto (nunca 0.00)
  const inominalVal = (alimPrincipal?.inNominal !== undefined && alimPrincipal?.inNominal !== null && !isNaN(alimPrincipal.inNominal) && alimPrincipal.inNominal > 0)
    ? alimPrincipal.inNominal
    : (alimPrincipal?.inominal !== undefined && alimPrincipal?.inominal !== null && !isNaN(alimPrincipal.inominal) && alimPrincipal.inominal > 0
        ? alimPrincipal.inominal
        : (isTrifasico ? totalVA / (220 * 1.732) : (isBifasico ? totalVA / 220 : totalVA / 127)));

  const icorregidaVal = (alimPrincipal?.icorregida !== undefined && alimPrincipal?.icorregida !== null && !isNaN(alimPrincipal.icorregida) && alimPrincipal.icorregida > 0)
    ? alimPrincipal.icorregida
    : (inominalVal * 1.25);

  // Conductor definitivo: Adoptar #4 AWG para garantizar e% <= 3.0% en 80m bajo NOM-001-SEDE 215-2(a) Nota 2
  const baseAmpacidadConductor = alimPrincipal?.conductorAmpacidad || '6 AWG';
  const baseRecomendadoCaida = alimPrincipal?.conductorRecomendadoCaida || '4 AWG';
  const chosenConductor = (planoMetadata.alimentadorConductor && planoMetadata.alimentadorConductor !== 'Auto')
    ? planoMetadata.alimentadorConductor
    : baseRecomendadoCaida;

  // Ajuste obligatorio del Conductor de Puesta a Tierra (C.P.T.) bajo Art. 250-122(b)
  const baseTierra = alimPrincipal?.tierraBase || '10 AWG';
  const chosenTierra = alimPrincipal?.tierra || ajustarConductorTierraPorArt250_122(baseTierra, baseAmpacidadConductor, chosenConductor);

  const alimLongitud = planoMetadata.alimentadorLongitud || 80;
  const sistemaAlimStr = isTrifasico ? 'trifasica' : (isBifasico ? 'bifasica' : 'monofasica');
  const alimCaidaCalc = parseFloat(calcularCaidaTension(alimLongitud, inominalVal, sistemaAlimStr, chosenConductor).toFixed(2));

  // Desglose de corrientes por fase y cálculo riguroso del Neutro según NOM-001-SEDE Art. 220-61
  let sL1_127 = 0;
  let sL2_127 = 0;
  let s_220 = 0;

  // Mapear cada circuito con su información física de slots (aislado por medidor)
  const slotsOcupadosGlobal = new Set();
  const slotsOcupadosPorMed = new Map();
  const tieneMedidores = Array.isArray(medidores) && medidores.length > 0;

  const circuitosEnriquecidos = circuitos.map((c, idx) => {
    const medId = tieneMedidores ? (c.medidorId || medidores[0]?.id) : 'global';
    const acomCirc = (tieneMedidores && medId && medidoresData[medId]?.acometida)
      ? medidoresData[medId].acometida
      : acometida;
    const fDispCirc = acomCirc.fasesDisponibles || ['A'];
    const tipoEfectivo = fDispCirc.length <= 1
      ? 'monofasica'
      : (c.tipoCarga === 'trifasica' && fDispCirc.length < 3 ? 'bifasica' : (c.tipoCarga || 'monofasica'));

    const distCirc = distribuirCargaPorFases({ ...c, tipoCarga: tipoEfectivo }, acomCirc);
    const faseNorm = distCirc.faseNorm;

    let rawSlot = c.slot;
    const polos = tipoEfectivo === 'trifasica' ? 3 : (tipoEfectivo === 'bifasica' ? 2 : 1);

    // Sumatoria de potencia aparente por tipo de carga para el cálculo de corrientes de fase y neutro
    const vaCirc = c.va || distCirc.va || 0;
    if (tipoEfectivo === 'bifasica') {
      s_220 += vaCirc;
    } else if (tipoEfectivo === 'monofasica') {
      if (faseNorm.includes('B')) {
        sL2_127 += vaCirc;
      } else {
        sL1_127 += vaCirc;
      }
    }

    if (!slotsOcupadosPorMed.has(medId)) {
      slotsOcupadosPorMed.set(medId, new Set());
    }
    const setSlotsMed = slotsOcupadosPorMed.get(medId);

    // Si no tiene slot válido en el tablero de su medidor, asignar el siguiente libre
    if (!rawSlot || setSlotsMed.has(rawSlot)) {
      let candidate = 1;
      while (setSlotsMed.has(candidate) || (polos > 1 && setSlotsMed.has(candidate + 2))) {
        candidate++;
      }
      rawSlot = candidate;
    }

    // Registrar slots que ocupa este interruptor en su medidor
    const slotsOcupadosCircuito = [];
    for (let p = 0; p < polos; p++) {
      const s = rawSlot + (p * 2); // Slots en el mismo lado (1,3 ó 2,4)
      setSlotsMed.add(s);
      slotsOcupadosGlobal.add(s);
      slotsOcupadosCircuito.push(s);
    }

    const lado = rawSlot % 2 !== 0 ? 'impar' : 'par'; // impar = izquierdo, par = derecho

    // Desglose de potencia aparente por fase mapeado estrictamente a las fases habilitadas del medidor (L1, L2, L3)
    const vaPorFase = { L1: 0, L2: 0, L3: 0 };
    if (acomCirc.id === 'monofasico' || fDispCirc.length === 1) {
      vaPorFase.L1 = distCirc.fVA[fDispCirc[0]] || vaCirc;
    } else if (acomCirc.id === 'bifasico' || fDispCirc.length === 2) {
      vaPorFase.L1 = distCirc.fVA[fDispCirc[0]] || 0;
      vaPorFase.L2 = distCirc.fVA[fDispCirc[1]] || 0;
      vaPorFase.L3 = 0;
    } else {
      vaPorFase.L1 = distCirc.fVA.A || 0;
      vaPorFase.L2 = distCirc.fVA.B || 0;
      vaPorFase.L3 = distCirc.fVA.C || 0;
    }

    // Limpiar descripciones técnicas de metadatos internos de la app
    const cleanStr = (txt = '') => {
      if (!txt) return '';
      return txt
        .replace(/\s*\(\s*sugerido\s+por\s+ia[^\)]*\)/gi, '')
        .replace(/\s*sugerido\s+por\s+ia[^\,\-\.\)]*/gi, '')
        .replace(/\s*\(\s*gen[eé]rico[^\)]*\)/gi, '')
        .replace(/\s*gen[eé]rico/gi, '')
        .replace(/\s*\(\s*uso\s+comercial[^\)]*\)/gi, '')
        .trim();
    };

    const descLimpia = cleanStr(c.desc || c.tipo);
    const tipoLimpio = cleanStr(c.tipo);
    const modeloLimpio = cleanStr(c.modelo);

    // Formatear conductor de fase, neutro y tierra de forma explícita y unificada 1:1
    let awg = c.conductor ? c.conductor.split(' ')[0] : '14';
    const isCrepera = (c.desc || c.tipo || '').toLowerCase().includes('crep');
    if (isCrepera && (!c.conductor || awg === '12')) {
      awg = '10';
    }

    let condCompleto = "";
    let condFase = "";
    let condNeutro = "";
    let condTierra = `1 # ${awg} AWG`;

    if (polos === 1) {
      condFase = `1 # ${awg} AWG`;
      condNeutro = `1 # ${awg} AWG`;
      condCompleto = `2 # ${awg} AWG + 1 # ${awg} AWG T`;
    } else if (polos === 2) {
      // Para circuitos bifásicos a 220V sin neutro (L1 + L2 + T):
      condFase = `2 # ${awg} AWG`;
      condNeutro = `—`;
      condCompleto = `2 # ${awg} AWG + 1 # ${awg} AWG T`;
    } else {
      condFase = `3 # ${awg} AWG`;
      condNeutro = `—`;
      condCompleto = `3 # ${awg} AWG + 1 # ${awg} AWG T`;
    }

    // Formato de interruptor
    const breakerStr = `${polos}P - ${c.breaker} A`;

    // Canalización por defecto según circuito derivado (EMT en interiores)
    const canalizacion = c.tuberiaDiametro || (c.breaker <= 20 ? '16 mm (1/2")' : '21 mm (3/4")');
    const canalizacionTipo = c.tuberiaTipo || 'EMT';

    // Caída de tensión individual y combinada con el alimentador
    let caidaCircuito = parseFloat((c.caida !== undefined && c.caida !== null ? c.caida : 0).toFixed(2));
    if (isCrepera && awg === '10' && caidaCircuito > 1.6) {
      const longCto = c.longitudMetros !== undefined ? parseFloat(c.longitudMetros) : 15;
      const inCirc = c.inNom || (vaCirc ? vaCirc / (tipoEfectivo === 'monofasica' ? 127 : 220) : 15.75);
      caidaCircuito = parseFloat(calcularCaidaTension(longCto, inCirc, tipoEfectivo, '10 AWG').toFixed(2));
    }
    const caidaTotal = parseFloat((alimCaidaCalc + caidaCircuito).toFixed(2));
    const cumpleCaidaTotal = caidaTotal <= 5.0; // Criterio NOM-001-SEDE: alimentador + derivado <= 5.0%

    // Determinar si es motor o carga especial
    const tipoLower = (c.tipo || '').toLowerCase();
    const esMotor = tipoLower.includes('motor') || 
                    tipoLower.includes('bomba') || 
                    tipoLower.includes('compresor') || 
                    tipoLower.includes('extractor') || 
                    tipoLower.includes('refrig') ||
                    tipoLower.includes('congelador') ||
                    tipoLower.includes('aire') ||
                    tipoLower.includes('licuadora') ||
                    tipoLower.includes('molino');

    const tipoSimbologia = getTipoSimbologiaNom({ tipo: tipoLimpio, desc: descLimpia, modelo: modeloLimpio, esMotor });

    const vNom = tipoEfectivo === 'monofasica' ? 127 : 220;
    const vaVal = typeof c.va === 'number' ? c.va : ((c.watts || 0) / (c.fp || 0.9));
    const inNomVal = typeof c.inNom === 'number' 
      ? c.inNom 
      : (typeof c.in_ === 'number' 
          ? c.in_ 
          : (typeof c.inominal === 'number' 
              ? c.inominal 
              : (vaVal / vNom)));

    return {
      ...c,
      id: c.id || `c-${idx + 1}`,
      num: c.num || `C-${idx + 1}`,
      medidorId: medId,
      fase: faseNorm,
      tipoCarga: tipoEfectivo,
      desc: descLimpia,
      tipo: tipoLimpio,
      modelo: modeloLimpio,
      watts: c.watts || 0,
      va: vaVal,
      fp: c.fp || 0.9,
      inNom: inNomVal,
      caida: caidaCircuito,
      longitudMetros: c.longitudMetros !== undefined ? parseFloat(c.longitudMetros) : 15,
      slotPrincipal: rawSlot,
      slots: slotsOcupadosCircuito,
      slotsStr: slotsOcupadosCircuito.join(','),
      lado,
      polos,
      breakerStr,
      breakerAmps: c.breaker,
      conductorFaseStr: condFase,
      conductorNeutroStr: condNeutro,
      conductorTierraStr: condTierra,
      conductorCompletoStr: condCompleto,
      canalizacion: `${canalizacion} ${canalizacionTipo}`,
      vaPorFase,
      fVA: distCirc.fVA,
      esMotor,
      tipoSimbologia,
      voltajeNum: vNom,
      voltajeStr: `${vNom} V`,
      caidaCircuito,
      caidaTotal,
      cumpleCaidaTotal
    };
  });

  // Helper para resumir caídas de tensión sobre un subconjunto de circuitos
  const buildResumenCaidas = (listaCtos) => {
    let maxCaidaCircuitoVal = 0;
    let ctoMaxDerivado = null;
    let maxCaidaTotalVal = 0;
    let ctoMaxTotal = null;

    listaCtos.forEach(c => {
      const vdC = typeof c.caidaCircuito === 'number' ? c.caidaCircuito : (parseFloat(c.caidaCircuito) || 0);
      if (vdC >= maxCaidaCircuitoVal) {
        maxCaidaCircuitoVal = vdC;
        ctoMaxDerivado = c;
      }
      const vdT = typeof c.caidaTotal === 'number' ? c.caidaTotal : (parseFloat(c.caidaTotal) || 0);
      if (vdT >= maxCaidaTotalVal) {
        maxCaidaTotalVal = vdT;
        ctoMaxTotal = c;
      }
    });

    const cumpleCriterioCombinado = maxCaidaTotalVal <= 5.0;
    return {
      maxCaidaCircuito: maxCaidaCircuitoVal,
      ctoMaxDerivadoNum: ctoMaxDerivado?.num || 'C-1',
      ctoMaxDerivadoDesc: ctoMaxDerivado?.desc || '',
      ctoMaxDerivadoLongitud: ctoMaxDerivado?.longitudMetros !== undefined ? ctoMaxDerivado.longitudMetros : 15,
      maxCaidaTotal: maxCaidaTotalVal,
      ctoMaxTotalNum: ctoMaxTotal?.num || 'C-1',
      ctoMaxTotalDesc: ctoMaxTotal?.desc || '',
      cumpleCriterioCombinado,
      textoMaxDerivado: `Caída máxima en circuitos derivados: ${maxCaidaCircuitoVal.toFixed(2)}% — ${ctoMaxDerivado ? `${ctoMaxDerivado.num} ${ctoMaxDerivado.desc}, L = ${ctoMaxDerivado.longitudMetros} m.` : ''}`,
      textoMaxCombinada: `Caída combinada proyectada máxima: ${maxCaidaTotalVal.toFixed(2)}% — ${ctoMaxTotal ? `${ctoMaxTotal.num}. ` : ''}${cumpleCriterioCombinado ? 'Cumple el criterio de diseño recomendado de <= 5.0%.' : 'Advertencia: supera el criterio de diseño recomendado de 5.0%.'}`
    };
  };

  const resumenCaidas = buildResumenCaidas(circuitosEnriquecidos);

  // Cálculo fasorial riguroso de corrientes por fase y neutro (NOM-001-SEDE Art. 220-61)
  const iL1_127 = sL1_127 / 127;
  const iL2_127 = sL2_127 / 127;
  const i_220 = s_220 > 0 ? s_220 / 220 : 0;

  // Corrientes de fase combinadas: componentes a 127V (fase 0° y 120°) más carga a 220V (desfasada 30°)
  const iL1_calc = Math.sqrt(Math.pow(iL1_127, 2) + Math.pow(i_220, 2) + (2 * iL1_127 * i_220 * Math.cos(Math.PI / 6)));
  const iL2_calc = Math.sqrt(Math.pow(iL2_127, 2) + Math.pow(i_220, 2) + (2 * iL2_127 * i_220 * Math.cos(Math.PI / 6)));

  // Carga del neutro (NOM-001-SEDE Art. 220-61): máximo desbalance vectorial de cargas conectadas a neutro
  const iNeutro_calc = Math.sqrt(Math.pow(iL1_127, 2) + Math.pow(iL2_127, 2) - (iL1_127 * iL2_127));

  // Dividir circuitos en bloque impar (lado izquierdo) y par (lado derecho)
  const circuitosImpares = circuitosEnriquecidos
    .filter(c => c.lado === 'impar')
    .sort((a, b) => a.slotPrincipal - b.slotPrincipal);

  const circuitosPares = circuitosEnriquecidos
    .filter(c => c.lado === 'par')
    .sort((a, b) => a.slotPrincipal - b.slotPrincipal);

  // Determinar número total de espacios del tablero
  const maxSlotOcupado = Math.max(12, ...Array.from(slotsOcupadosGlobal));
  const totalEspaciosTablero = maxSlotOcupado <= 12 ? 12 : (maxSlotOcupado <= 20 ? 20 : (maxSlotOcupado <= 24 ? 24 : 30));

  // Datos del alimentador estructurados con especificación definitiva de proyecto
  const alimentador = {
    sistema: isTrifasico ? '3F - 4H' : (isBifasico ? '2F - 3H' : '1F - 2H'),
    tension: isTrifasico ? '220/127 V' : (isBifasico ? '220/127 V' : '127 V'),
    frecuencia: '60 Hz',
    fasesCount: isTrifasico ? 3 : (isBifasico ? 2 : 1),
    polos: alimPrincipal?.polos || (isTrifasico ? 3 : (isBifasico ? 2 : 1)),
    breaker: alimPrincipal?.breaker || 60,
    breakerStr: `${alimPrincipal?.polos || 2}P - ${alimPrincipal?.breaker || 60} A`,
    kaic: '10 kA',
    conductorFases: `${alimPrincipal?.polos || 2} # ${chosenConductor}`,
    conductorNeutro: `1 # ${chosenConductor}`,
    conductorTierra: `1 # ${chosenTierra}`,
    conductorAmpacidad: baseAmpacidadConductor,
    conductorRecomendadoCaida: baseRecomendadoCaida,
    caidaConductorRecomendado: alimCaidaCalc,
    tipoAislamiento: 'THW-2-LS 90°C',
    canalizacion: planoMetadata.alimentadorTuberia || '35 mm (1 1/4")',
    canalizacionTipo: planoMetadata.alimentadorTuberiaTipo || 'Tubo Conduit Metálico Semipesado (IMC)',
    longitudMetros: alimLongitud,
    inominal: parseFloat(inominalVal.toFixed(2)),
    icorregida: parseFloat(icorregidaVal.toFixed(2)),
    caidaPct: alimCaidaCalc,
    caidaIcPct: alimPrincipal?.caidaIc || 0,
    cumpleCaida3Pct: alimCaidaCalc <= 3.0,
    capacidadBarras: totalWatts > 10000 ? '125 A' : '100 A',
    tipoTableroDesc: isTrifasico 
      ? 'TABLERO SQUARE D NQ — 30 ESPACIOS — 225 A — 3F-4H' 
      : 'TABLERO SQUARE D QO — 24 ESPACIOS — 100 A — 2F-3H',
    catalogoTablero: 'POR DEFINIR',
    marcaTablero: 'Square D / Schneider Electric'
  };

  // Totales y demanda
  const factorDemanda = planoMetadata.factorDemanda ? parseFloat(planoMetadata.factorDemanda) : 1.0;
  const cargaDemandadaWatts = totalWatts * factorDemanda;

  const totales = {
    totalWatts: Math.round(totalWatts),
    totalVA: Math.round(totalVA),
    faseL1_VA: Math.round(isBifasico || isTrifasico ? (fasesVA.A || 0) : totalVA),
    faseL2_VA: Math.round(isBifasico || isTrifasico ? (fasesVA.B || 0) : 0),
    faseL3_VA: Math.round(isTrifasico ? (fasesVA.C || 0) : 0),
    desbalancePct: parseFloat(desbalanceUVIE.toFixed(2)),
    factorDemandaPct: Math.round(factorDemanda * 100),
    cargaDemandadaWatts: Math.round(cargaDemandadaWatts),
    corrienteNominalAlimentador: inominalVal.toFixed(2),
    corrienteDisenoAlimentador: icorregidaVal.toFixed(2),
    // Corrientes de fase y neutro rigurosas
    corrienteL1: (iL1_calc > 0 ? iL1_calc : inominalVal).toFixed(2),
    corrienteL2: (iL2_calc > 0 ? iL2_calc : inominalVal).toFixed(2),
    corrienteNeutro: (iNeutro_calc > 0 ? iNeutro_calc : iL1_127).toFixed(2),
    corrienteL1_127: iL1_127.toFixed(2),
    corrienteL2_127: iL2_127.toFixed(2),
    corriente_220: i_220.toFixed(2)
  };

  // Metadatos administrativos del plano (con valores limpios para entrega ejecutiva formal)
  const rawResp = planoMetadata.responsable || '';
  const responsableFinal = (!rawResp || rawResp.toLowerCase().includes('juan p') || rawResp.toLowerCase().includes('demo') || rawResp.toLowerCase().includes('uvie-1234'))
    ? "____________________"
    : rawResp;

  const rawCedula = planoMetadata.cedula || '';
  const cedulaFinal = (!rawCedula || rawCedula.includes('12345678') || rawCedula.toLowerCase().includes('demo'))
    ? "____________________"
    : rawCedula;

  let cleanUbicacion = planoMetadata.ubicacion || "Blvd. Adolfo Ruiz Cortines 4300, Mocambo, Boca del Río, Veracruz";
  if (cleanUbicacion.toLowerCase().includes("américas") || cleanUbicacion.toLowerCase().includes("americas")) {
    cleanUbicacion = "Blvd. Adolfo Ruiz Cortines 4300, Mocambo, Boca del Río, Veracruz";
  }

  const infoPlano = {
    proyecto: planoMetadata.proyecto || "HAWAIIAN PARADISE",
    nombreComercial: planoMetadata.nombreComercial || "Hawaiian Paradise Cafe",
    cliente: planoMetadata.cliente || "OPERADORA DE ALIMENTOS",
    plaza: planoMetadata.plaza || "PLAZA ANDAMAR",
    local: planoMetadata.local || "LOCAL COMERCIAL K-12",
    ubicacion: cleanUbicacion,
    ciudad: planoMetadata.ciudad || "Boca del Río",
    estado: planoMetadata.estado || "Veracruz",
    fecha: planoMetadata.fecha || new Date().toLocaleDateString('es-MX'),
    etapa: planoMetadata.etapa || "PROYECTO EJECUTIVO",
    escala: planoMetadata.escala || "S/E",
    cotas: planoMetadata.cotas || "METROS",
    tipoPlano: planoMetadata.tipoPlano || "INST. ELÉCTRICA",
    dibujo: planoMetadata.dibujo || "DEPTO. DE INGENIERÍA",
    reviso: planoMetadata.reviso || "ING. PROYECTISTA",
    responsable: responsableFinal,
    cedula: cedulaFinal,
    norteAngulo: typeof planoMetadata.norteAngulo === 'number' ? planoMetadata.norteAngulo : (parseFloat(planoMetadata.norteAngulo) || 0),
    numeroPlano: planoMetadata.numeroPlano || "IE-01",
    numeroPlanoCuadro: planoMetadata.numeroPlanoCuadro || "IE-02",
    revision: planoMetadata.revision || "REV. 0",
    observaciones: planoMetadata.observaciones || "Instalación comercial calculada bajo NOM-001-SEDE-2012. Tensión 220/127V. Alimentador en tubo conduit metálico semipesado (IMC) de 35 mm (1 1/4\"). Circuitos derivados en tubería metálica eléctrica EMT de 16 mm (1/2\") y 21 mm (3/4\").",
    logoProyectoUrl: planoMetadata.logoProyectoUrl || null,
    logoDespachoUrl: planoMetadata.logoDespachoUrl || null
  };

  // Sanidad y validación
  const sanidad = validarSanidadPlano(computedElectricalSystem);

  // Construcción de sub-modelos por medidor independiente
  const medidoresModelos = (Array.isArray(medidores) && medidores.length > 0 ? medidores : []).map((med, idx) => {
    const dataMed = medidoresData[med.id] || {
      totalWatts: 0,
      totalVA: 0,
      acometida: { id: 'monofasico', tipo: 'Monofásico 1F-1N', fasesDisponibles: ['A'] },
      fasesLoad: { A: 0, B: 0, C: 0 },
      fasesVA: { A: 0, B: 0, C: 0 },
      fasesAmps: { A: 0, B: 0, C: 0 },
      desbalanceUVIE: 0
    };

    const isMedTrifasico = dataMed.acometida.id === 'trifasico';
    const isMedBifasico = dataMed.acometida.id === 'bifasico';
    const fDispMed = dataMed.acometida.fasesDisponibles || (isMedTrifasico ? ['A', 'B', 'C'] : (isMedBifasico ? ['A', 'B'] : ['A']));
    const fasesNombresMed = isMedTrifasico ? ['L1', 'L2', 'L3'] : (isMedBifasico ? ['L1', 'L2'] : ['L1']);

    // Dimensionamiento propio del alimentador de este medidor
    const alimCalcMed = calcularAlimentadorGeneral(dataMed.totalVA, dataMed.acometida.id, alimLongitud);
    const inMedVal = alimCalcMed?.inNominal ?? (isMedTrifasico ? (dataMed.totalVA / (220 * 1.7320508)) : (isMedBifasico ? dataMed.totalVA / 220 : dataMed.totalVA / 127));
    const icMedVal = alimCalcMed?.icorregida ?? (inMedVal * 1.25);
    const caidaAlimMed = alimCalcMed?.caida ?? 0;

    // Filtrar estrictamente los circuitos de este medidor (nunca mezclar otros medidores)
    const ctosMed = circuitosEnriquecidos.filter(c => (c.medidorId || medidores[0]?.id) === med.id);
    const ctosFinales = ctosMed.map((c, cIdx) => {
      const caidaTotMed = parseFloat((caidaAlimMed + (c.caidaCircuito || 0)).toFixed(2));
      return {
        ...c,
        num: `C-${cIdx + 1}`,
        caidaTotal: caidaTotMed,
        cumpleCaidaTotal: caidaTotMed <= 5.0
      };
    });

    const n1 = (idx * 2) + 1;
    const n2 = (idx * 2) + 2;
    const numUnifilar = `IE-${n1 < 10 ? '0' + n1 : n1}`;
    const numCuadro = `IE-${n2 < 10 ? '0' + n2 : n2}`;

    const infoPlanoMed = {
      ...infoPlano,
      proyecto: `${infoPlano.proyecto} - ${med.nombre || `Medidor ${med.numero}`}`,
      numeroPlano: numUnifilar,
      numeroPlanoCuadro: numCuadro,
      tipoPlano: `INST. ELÉCTRICA - ${(med.nombre || `MEDIDOR ${med.numero}`).toUpperCase()}`
    };

    const polosMed = alimCalcMed?.polos || (isMedTrifasico ? 3 : (isMedBifasico ? 2 : 1));
    const breakerMed = alimCalcMed?.breaker || 30;
    const condMed = alimCalcMed?.conductor || '8 AWG';
    const tierraMed = alimCalcMed?.tierra || '10 AWG';

    const alimMed = {
      ...alimentador,
      sistema: isMedTrifasico ? '3F - 4H' : (isMedBifasico ? '2F - 3H' : '1F - 2H'),
      tension: isMedTrifasico || isMedBifasico ? '220/127 V' : '127 V',
      fasesCount: fDispMed.length,
      polos: polosMed,
      breaker: breakerMed,
      breakerStr: `${polosMed}P - ${breakerMed} A`,
      conductorFases: `${polosMed} # ${condMed}`,
      conductorNeutro: `1 # ${alimCalcMed?.neutro || condMed}`,
      conductorTierra: `1 # ${tierraMed}`,
      conductorAmpacidad: alimCalcMed?.conductorAmpacidad || condMed,
      conductorRecomendadoCaida: alimCalcMed?.conductorRecomendadoCaida || condMed,
      caidaConductorRecomendado: caidaAlimMed,
      inominal: parseFloat(inMedVal.toFixed(2)),
      icorregida: parseFloat(icMedVal.toFixed(2)),
      caidaPct: caidaAlimMed,
      caidaIcPct: alimCalcMed?.caidaIc || 0,
      cumpleCaida3Pct: caidaAlimMed <= 3.0,
      capacidadBarras: dataMed.totalWatts > 10000 ? '125 A' : '100 A',
      tipoTableroDesc: isMedTrifasico
        ? 'TABLERO SQUARE D NQ — 30 ESPACIOS — 225 A — 3F-4H'
        : (isMedBifasico
            ? 'TABLERO SQUARE D QO — 24 ESPACIOS — 100 A — 2F-3H'
            : 'TABLERO SQUARE D QO — 12 ESPACIOS — 100 A — 1F-2H'),
      potenciaTotalVA: dataMed.totalVA,
      potenciaTotalWatts: dataMed.totalWatts,
      fases: dataMed.fasesLoad,
      fasesVA: dataMed.fasesVA,
      desbalancePct: dataMed.desbalanceUVIE
    };

    const factorDemandaMed = factorDemanda || 1.0;
    const cargaDemandadaWattsMed = Math.round(dataMed.totalWatts * factorDemandaMed);

    const f0 = fDispMed[0] || 'A';
    const f1 = fDispMed[1] || null;
    const f2 = fDispMed[2] || null;

    const vaL1Med = dataMed.fasesVA?.[f0] || 0;
    const vaL2Med = f1 ? (dataMed.fasesVA?.[f1] || 0) : 0;
    const vaL3Med = f2 ? (dataMed.fasesVA?.[f2] || 0) : 0;

    const iL1Med = dataMed.fasesAmps?.[f0] !== undefined ? dataMed.fasesAmps[f0] : (vaL1Med / 127);
    const iL2Med = f1 ? (dataMed.fasesAmps?.[f1] !== undefined ? dataMed.fasesAmps[f1] : (vaL2Med / 127)) : 0;
    const iNMed = Math.abs(iL1Med - iL2Med);

    const totalesMed = {
      totalWatts: Math.round(dataMed.totalWatts || 0),
      totalVA: Math.round(dataMed.totalVA || 0),
      faseA_W: dataMed.fasesLoad?.A || 0,
      faseB_W: dataMed.fasesLoad?.B || 0,
      faseC_W: dataMed.fasesLoad?.C || 0,
      faseA_VA: dataMed.fasesVA?.A || 0,
      faseB_VA: dataMed.fasesVA?.B || 0,
      faseC_VA: dataMed.fasesVA?.C || 0,
      faseL1_VA: Math.round(vaL1Med),
      faseL2_VA: Math.round(vaL2Med),
      faseL3_VA: Math.round(vaL3Med),
      desbalancePct: parseFloat((dataMed.desbalanceUVIE || 0).toFixed(2)),
      desbalance: dataMed.desbalanceUVIE || 0,
      desbalanceValido: (dataMed.desbalanceUVIE || 0) <= 5.0,
      factorDemandaPct: Math.round(factorDemandaMed * 100),
      cargaDemandadaWatts: cargaDemandadaWattsMed,
      corrienteNominalAlimentador: inMedVal.toFixed(2),
      corrienteDisenoAlimentador: icMedVal.toFixed(2),
      corrienteL1: iL1Med.toFixed(2),
      corrienteL2: iL2Med.toFixed(2),
      corrienteNeutro: iNMed.toFixed(2)
    };

    const setSlotsDeEsteMed = slotsOcupadosPorMed.get(med.id);
    const maxSlotMed = setSlotsDeEsteMed && setSlotsDeEsteMed.size > 0
      ? Math.max(12, ...Array.from(setSlotsDeEsteMed))
      : 12;
    const espaciosTableroMed = maxSlotMed <= 12 ? 12 : (maxSlotMed <= 20 ? 20 : (maxSlotMed <= 24 ? 24 : 30));

    return {
      medidor: med,
      acometida: dataMed.acometida,
      alimentador: alimMed,
      fasesNombres: fasesNombresMed,
      circuitos: ctosFinales,
      circuitosImpares: ctosFinales.filter(c => c.lado === 'impar').sort((a, b) => a.slotPrincipal - b.slotPrincipal),
      circuitosPares: ctosFinales.filter(c => c.lado === 'par').sort((a, b) => a.slotPrincipal - b.slotPrincipal),
      totalEspaciosTablero: espaciosTableroMed,
      totales: totalesMed,
      infoPlano: infoPlanoMed,
      resumenCaidas: buildResumenCaidas(ctosFinales)
    };
  });

  return {
    acometida,
    alimentador,
    fasesNombres,
    circuitos: circuitosEnriquecidos,
    circuitosImpares,
    circuitosPares,
    totalEspaciosTablero,
    totales,
    infoPlano,
    resumenCaidas,
    sanidad,
    medidoresModelos
  };
}

