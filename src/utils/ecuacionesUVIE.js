/**
 * Motor de Ingeniería UVIE
 * Fórmulas y catálogos comerciales bajo la NOM-001-SEDE
 */

/**
 * Calcula la potencia aparente (S) en Volt-Amperios (VA).
 * @param {number} watts - Carga activa en Watts.
 * @param {number} fp - Factor de Potencia (0.0 - 1.0).
 * @param {boolean} usarVaDirecto - Si es true, omite la conversión.
 * @returns {number} Potencia aparente en VA.
 */
export function calcularVA(watts, fp, usarVaDirecto) {
  const w = parseFloat(watts) || 0;
  const factor = parseFloat(fp) || 1.0;
  if (factor <= 0) return w;
  
  // Si el factor de potencia es menor a 1.0, se calcula obligatoriamente S = P / F.P.
  if (factor < 1.0) {
    return w / factor;
  }
  
  if (usarVaDirecto) {
    return w;
  }
  return w / factor;
}

/**
 * Calcula la corriente nominal (In) en Amperes según el tipo de carga.
 * Art. 210 de la NOM-001-SEDE.
 * @param {number} va - Potencia aparente en VA.
 * @param {string} tipoCarga - 'monofasica' (127V), 'bifasica' (220V) o 'trifasica' (220V).
 * @returns {number} Corriente nominal en Amperes.
 */
export function calcularCorrienteNominal(va, tipoCarga = 'monofasica') {
  const s = parseFloat(va) || 0;
  if (s <= 0) return 0;

  if (tipoCarga === 'bifasica') {
    // Carga bifásica opera a 220V línea-línea
    return s / 220;
  } else if (tipoCarga === 'trifasica') {
    // Carga trifásica opera a 220V con factor raíz de 3 (1.73205)
    return s / (220 * 1.7320508);
  } else {
    // Carga monofásica opera a 127V línea-neutro
    return s / 127;
  }
}

/**
 * Calcula la corriente corregida (Ic) aplicando el factor de carga continua (1.25).
 * NOM-001-SEDE Art. 210.
 * @param {number} iNominal - Corriente nominal en Amperes.
 * @returns {number} Corriente corregida en Amperes.
 */
export function calcularCorrienteCorregida(iNominal) {
  return (parseFloat(iNominal) || 0) * 1.25;
}

/**
 * Selecciona la protección termo-magnética comercial superior o igual más cercana.
 * Catálogo estándar comercial en Amperes.
 * @param {number} iCorregida - Corriente corregida en Amperes.
 * @returns {number} Capacidad del interruptor comercial en Amperes.
 */
export function seleccionarProteccion(iCorregida) {
  const ic = parseFloat(iCorregida) || 0;
  if (ic <= 0) return 15; // Valor mínimo comercial

  // Lista comercial extendida de interruptores estándar (NOM-001-SEDE Art 240-6)
  const breakersComerciales = [15, 20, 30, 40, 50, 60, 70, 80, 100, 110, 125, 150];
  
  // Buscar el primer interruptor que soporte la corriente corregida
  const seleccion = breakersComerciales.find(b => b >= ic);
  
  return seleccion || breakersComerciales[breakersComerciales.length - 1];
}

/**
 * Selecciona el calibre del conductor AWG base por ampacidad térmica (75°C).
 * Basado en la tabla 310-15(b)(16) de la NOM-001-SEDE.
 * @param {number} proteccion - Capacidad de la protección comercial en Amperes.
 * @returns {string} Calibre del conductor (ej: "14 AWG").
 */
export function seleccionarConductor(proteccion) {
  const p = parseInt(proteccion) || 15;

  if (p <= 15) return '14 AWG';
  if (p === 20) return '12 AWG';
  if (p === 30) return '10 AWG';
  if (p <= 50) return '8 AWG';
  if (p <= 65) return '6 AWG'; // Extensión estándar para protección de 60A
  if (p <= 85) return '4 AWG';
  if (p <= 115) return '2 AWG';
  return '1/0 AWG';
}

/**
 * Calcula el porcentaje de desbalanceo de cargas según la fórmula UVIE para CFE.
 * % Desbalanceo = ((Max_VA - Min_VA) / Max_VA) * 100
 * @param {number} vaA - VA en Fase A.
 * @param {number} vaB - VA en Fase B.
 * @param {number} vaC - VA en Fase C.
 * @param {string} acometidaId - Identificador de acometida ('monofasico', 'bifasico', 'trifasico').
 * @returns {number} Porcentaje de desbalanceo (0 - 100).
 */
export function calcularDesbalanceUVIE(vaA, vaB, vaC, acometidaId, fasesDisponibles = null) {
  const sA = parseFloat(vaA) || 0;
  const sB = parseFloat(vaB) || 0;
  const sC = parseFloat(vaC) || 0;

  if (Array.isArray(fasesDisponibles) && fasesDisponibles.length > 0) {
    if (fasesDisponibles.length <= 1) return 0;
    const mapa = { A: sA, B: sB, C: sC };
    const valores = fasesDisponibles.map(f => mapa[f] || 0);
    const maxVal = Math.max(...valores);
    const minVal = Math.min(...valores);
    if (maxVal === 0) return 0;
    return ((maxVal - minVal) / maxVal) * 100;
  }

  if (acometidaId === 'monofasico') {
    return 0;
  }

  let tipo = acometidaId;
  if (!tipo) {
    if (sC === 0 && sB === 0) return 0;
    if (sC === 0) tipo = 'bifasico';
    else tipo = 'trifasico';
  }

  let valores = [];
  if (tipo === 'bifasico') {
    valores = [sA, sB];
  } else {
    valores = [sA, sB, sC];
  }

  const maxVal = Math.max(...valores);
  const minVal = Math.min(...valores);

  if (maxVal === 0) return 0;

  return ((maxVal - minVal) / maxVal) * 100;
}

/**
 * Obtiene la sección transversal en mm² del conductor basado en su calibre AWG.
 * NOM-001-SEDE.
 * @param {string} conductorStr - Calibre del conductor (ej. "14 AWG", "#14 AWG", etc.).
 * @returns {number} Área en mm².
 */
export function obtenerSeccionConductor(conductorStr) {
  const clean = (conductorStr || '').replace(/\s+/g, '').toUpperCase();
  if (clean.includes('14AWG') || clean.includes('#14') || clean.endsWith('14')) return 2.08;
  if (clean.includes('12AWG') || clean.includes('#12') || clean.endsWith('12')) return 3.31;
  if (clean.includes('10AWG') || clean.includes('#10') || clean.endsWith('10')) return 5.26;
  if (clean.includes('8AWG') || clean.includes('#8') || clean.endsWith('8')) return 8.37;
  if (clean.includes('6AWG') || clean.includes('#6') || clean.endsWith('6')) return 13.30;
  if (clean.includes('4AWG') || clean.includes('#4') || clean.endsWith('4')) return 21.15;
  if (clean.includes('2AWG') || clean.includes('#2') || clean.endsWith('2')) return 33.62;
  if (clean.includes('1/0') || clean.includes('1/0AWG')) return 53.49;
  
  // Por defecto si no coincide
  return 2.08;
}

/**
 * Calcula la caída de tensión porcentual bajo la NOM-001-SEDE.
 * 
 * Fórmulas normalizadas (con resistividad de cobre comercial a 60-75°C rho ≈ 0.02 Ω·mm²/m):
 * - Monofásica (127V):  %e = (4 * L * I) / (127 * S)
 * - Bifásica (220V):    %e = (4 * L * I) / (220 * S)  [circuito a 2 fases, trayecto ida y vuelta 2L]
 * - Trifásica (220V):   %e = (3.464 * L * I) / (220 * S) [sqrt(3) * rho * 100 = 3.464]
 * 
 * NOTA CRÍTICA DE ESCALA:
 * La fórmula empírica (4*L*I)/(V*S) ya incluye el factor 100 implícito (0.04 * 100 = 4)
 * para arrojar directamente el porcentaje (ej. 0.66%). NO se debe multiplicar por 100 al final.
 * 
 * @param {number} longitud - Longitud en metros.
 * @param {number} corriente - Corriente de operación en Amperes (por norma se usa In para caída de tensión).
 * @param {string} tipoCarga - 'monofasica', 'bifasica' o 'trifasica'.
 * @param {string} conductorStr - Calibre del conductor (ej: "14 AWG").
 * @returns {number} Porcentaje de caída de tensión (%e).
 */
export function calcularCaidaTension(longitud, corriente, tipoCarga, conductorStr) {
  const L = parseFloat(longitud) || 0;
  const I = parseFloat(corriente) || 0;
  const S = obtenerSeccionConductor(conductorStr);
  
  if (L <= 0 || I <= 0 || S <= 0) return 0;
  
  let caida = 0;
  if (tipoCarga === 'monofasica') {
    caida = (4 * L * I) / (127 * S);
  } else if (tipoCarga === 'bifasica') {
    caida = (4 * L * I) / (220 * S);
  } else if (tipoCarga === 'trifasica') {
    caida = (3.4641 * L * I) / (220 * S);
  } else {
    caida = (4 * L * I) / (127 * S);
  }
  
  // Sanity Check automático de rango físico
  if (isNaN(caida) || !isFinite(caida) || caida < 0) return 0;
  
  return parseFloat(caida.toFixed(2));
}

/**
 * Valida la sanidad física y límites normativos de un cálculo eléctrico.
 * @param {object} calculo - Objeto con { caida, fp, watts, voltaje }
 * @returns {Array<string>} Lista de advertencias o errores detectados.
 */
export function validarSanidadElectrica(calculo) {
  const warnings = [];
  if (!calculo) return warnings;
  
  const caida = parseFloat(calculo.caida);
  if (isNaN(caida) || !isFinite(caida)) {
    warnings.push('Error: Porcentaje de caída de tensión no es un número válido.');
  } else if (caida > 20.0) {
    warnings.push(`Advertencia Crítica: Caída de tensión físicamente excesiva (${caida.toFixed(2)}%). Revise longitud o calibre.`);
  } else if (caida < 0) {
    warnings.push('Error: Caída de tensión negativa detectada.');
  }
  
  if (calculo.fp !== undefined) {
    const fp = parseFloat(calculo.fp);
    if (isNaN(fp) || fp <= 0 || fp > 1.0) {
      warnings.push(`Advertencia: Factor de potencia fuera de norma (0.01 - 1.0): ${calculo.fp}`);
    }
  }
  
  return warnings;
}

/**
 * Selecciona el calibre del conductor de puesta a tierra de equipos.
 * Tabla 250-95 de la NOM-001-SEDE.
 * @param {number} breakerAmps - Capacidad del interruptor termomagnético en Amperios.
 * @returns {string} Calibre del conductor.
 */
export function seleccionarConductorDeTierra(breakerAmps) {
  const b = parseInt(breakerAmps) || 15;
  if (b <= 15) return '14 AWG';
  if (b <= 20) return '12 AWG';
  if (b <= 60) return '10 AWG';
  if (b <= 100) return '8 AWG';
  if (b <= 200) return '6 AWG';
  return '4 AWG';
}

/**
 * Áreas nominales de la sección transversal de conductores de cobre (mm²)
 * Conforme a NOM-001-SEDE-2012 Capítulo 10, Tabla 8.
 */
export const AREAS_CONDUCTOR_NOM = {
  '14 AWG': 2.08,
  '12 AWG': 3.31,
  '10 AWG': 5.26,
  '8 AWG': 8.37,
  '6 AWG': 13.30,
  '4 AWG': 21.15,
  '3 AWG': 26.67,
  '2 AWG': 33.62,
  '1 AWG': 42.41,
  '1/0 AWG': 53.49,
  '2/0 AWG': 67.43,
  '3/0 AWG': 85.01,
  '4/0 AWG': 107.2
};

/**
 * Ajusta el Conductor de Puesta a Tierra del Equipo (C.P.T.) conforme al Artículo 250-122(b)
 * de la NOM-001-SEDE-2012 cuando los conductores de fase se incrementan por caída de tensión.
 */
export function ajustarConductorTierraPorArt250_122(tierraBase, conductorBase, conductorAumentado) {
  const aBase = AREAS_CONDUCTOR_NOM[conductorBase] || 13.30;
  const aAum = AREAS_CONDUCTOR_NOM[conductorAumentado] || aBase;
  const aTierraBase = AREAS_CONDUCTOR_NOM[tierraBase] || 5.26;
  
  if (aAum <= aBase) return tierraBase;
  
  const factor = aAum / aBase;
  const aTierraReq = aTierraBase * factor;
  
  const ordenCalibres = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '3 AWG', '2 AWG', '1/0 AWG', '2/0 AWG', '3/0 AWG', '4/0 AWG'];
  for (const cal of ordenCalibres) {
    if ((AREAS_CONDUCTOR_NOM[cal] || 0) >= aTierraReq - 0.05) {
      return cal;
    }
  }
  return '4 AWG';
}

/**
 * Calcula los parámetros del alimentador general desde el medidor de la plaza al tablero.
 * @param {number} totalVA - Potencia aparente total en Volt-Amperes.
 * @param {string} tipoAcometida - 'monofasico', 'bifasico' o 'trifasico'.
 * @param {number} longitudMetros - Distancia en metros (por defecto 80m).
 * @returns {object} Parámetros del alimentador calculados.
 */
export function calcularAlimentadorGeneral(totalVA, tipoAcometida, longitudMetros = 80) {
  const va = parseFloat(totalVA) || 0;
  const L = parseFloat(longitudMetros) || 0;
  
  let inNominal = 0;
  let polos = 1;
  let voltaje = 127;
  
  if (tipoAcometida === 'monofasico') {
    voltaje = 127;
    inNominal = va / 127;
    polos = 1;
  } else if (tipoAcometida === 'bifasico') {
    voltaje = 220;
    inNominal = va / 220;
    polos = 2;
  } else if (tipoAcometida === 'trifasico') {
    voltaje = 220;
    inNominal = va / (220 * 1.732);
    polos = 3;
  } else {
    voltaje = 127;
    inNominal = va / 127;
    polos = 1;
  }
  
  const icorregida = inNominal * 1.25;
  const breaker = seleccionarProteccion(icorregida);
  const conductor = seleccionarConductor(breaker);
  const tierra = seleccionarConductorDeTierra(breaker);
  const neutro = conductor; // Se sobredimensiona igual que la fase
  
  const caida = calcularCaidaTension(
    L,
    icorregida,
    tipoAcometida === 'monofasico' ? 'monofasica' : (tipoAcometida === 'bifasico' ? 'bifasica' : 'trifasica'),
    conductor
  );
  
  return {
    voltaje,
    polos,
    inNominal: parseFloat(inNominal.toFixed(2)),
    icorregida: parseFloat(icorregida.toFixed(2)),
    breaker,
    conductor,
    neutro,
    tierra,
    caida: parseFloat(caida.toFixed(2))
  };
}
/**
 * Ejecuta el balance automático de cargas por algoritmo greedy multi-fase.
 * Agrupa cargas compatibles en circuitos compartidos si la corriente lo permite.
 * Aplica swaps iterativos para garantizar desbalanceo ≤ 5% (límite UVIE/CFE).
 *
 * @param {Array}  aparatos      - Lista de aparatos [{id, watts, fp, tipoCarga, usarVaDirecto}]
 * @param {string} tipoAcometida - 'monofasico' | 'bifasico' | 'trifasico'
 * @returns {Object} { breakers, desbalancePct, fasesVA }
 */
export function balancearCargasAutomatico(aparatos, tipoAcometida) {
  // ── Fase disponibles según acometida ─────────────────────────────────────
  const fasesSimples =
    tipoAcometida === 'monofasico' ? ['A']
    : tipoAcometida === 'bifasico' ? ['A', 'B']
    : ['A', 'B', 'C'];

  // ── Calcular VA de cada aparato y ordenar mayor → menor ──────────────────
  const items = aparatos
    .map(ap => ({
      id:        ap.id,
      tipo:      ap.tipo,
      modelo:    ap.modelo || '',
      watts:     parseFloat(ap.watts) || 0,
      fp:        parseFloat(ap.fp)    || 1,
      tipoCarga: ap.tipoCarga || 'monofasica',
      usarVaDirecto: !!ap.usarVaDirecto,
      va:        calcularVA(ap.watts, ap.fp, ap.usarVaDirecto),
    }))
    .sort((a, b) => b.va - a.va);

  // ── Estado de cargas por fase ─────────────────────────────────────────────
  const fasesVA = { A: 0, B: 0, C: 0 };
  let breakerSeq   = 0;
  const breakers   = [];   // [ { id, capacidad, polos, fase, aparatos: [id,...], circuitoNumero } ]

  // Helper: fase con menor carga actual (entre las disponibles)
  const faseMenorCarga = (fasesPermitidas) =>
    fasesPermitidas.reduce((min, f) =>
      (fasesVA[f] || 0) < (fasesVA[min] || 0) ? f : min
    , fasesPermitidas[0]);

  // Helper para clasificar equipos según tipo, potencia y tipoCarga
  const clasificarEquipo = (tipo = '', watts = 0, tipoCarga = '') => {
    const t = tipo.toLowerCase();
    const esGrande = watts >= 1200 || 
                     t.includes('clima') || t.includes('minisplit') || t.includes('aire') || 
                     t.includes('bordadora') || t.includes('sublima') || t.includes('pistola') || 
                     t.includes('horno') || t.includes('parrilla') || t.includes('inducci') || 
                     t.includes('boiler') || t.includes('calentador') || t.includes('secadora') || 
                     t.includes('cargador') || t.includes('ev') || t.includes('crep') || 
                     t.includes('esquite') || t.includes('vapor');
    const esMotor = tipoCarga === 'motor' || 
                    t.includes('coser') || t.includes('overlock') || t.includes('collaretera') || 
                    t.includes('cortadora') || t.includes('bordadora') || t.includes('bomba') || 
                    t.includes('hidro') || t.includes('porton') || t.includes('portón') || 
                    t.includes('lavadora') || t.includes('extract') || t.includes('ventilad') || 
                    t.includes('compresor') || t.includes('licuad') || t.includes('ninja') || 
                    t.includes('raspa') || t.includes('alberca');
    const esDelicado = t.includes('comput') || t.includes('pc') || t.includes('laptop') || 
                       t.includes('cctv') || t.includes('dvr') || t.includes('pos') || 
                       t.includes('tpv') || t.includes('laser') || t.includes('scanncut') || 
                       t.includes('epson') || t.includes('modem') || t.includes('router') || 
                       t.includes('tv') || t.includes('audio') || t.includes('home office') || 
                       t.includes('ups') || t.includes('no-break') || t.includes('terminal');
    const esLuz = t.includes('luz') || t.includes('ilum') || t.includes('led') || 
                  t.includes('spot') || t.includes('lampara') || t.includes('revelado');
    return { esGrande, esMotor, esDelicado, esLuz };
  };

  // Helper: crear un nuevo breaker (almacena flag esDedicado)
  const crearBreaker = (fase, polos, aparatoId, vaAp, esDedicado = false) => {
    const in_  = calcularCorrienteNominal(vaAp, polos > 1 ? (polos === 3 ? 'trifasica' : 'bifasica') : 'monofasica');
    const ic   = calcularCorrienteCorregida(in_);
    const cap  = seleccionarProteccion(ic);
    breakerSeq++;
    const brk = {
      id:             `brk-${String(breakerSeq).padStart(3, '0')}`,
      capacidad:      cap,
      polos,
      fase,
      aparatos:       [aparatoId],
      circuitoNumero: `C-${breakerSeq}`,
      vaTotal:        vaAp,
      icTotal:        ic,
      esDedicado:     esDedicado
    };
    breakers.push(brk);

    // Contabilizar VA en fases
    const fasesDelBreaker = fase.split('-');
    fasesDelBreaker.forEach(f => {
      if (fasesVA[f] !== undefined) fasesVA[f] += vaAp / fasesDelBreaker.length;
    });
    return brk;
  };

  // ── Distribuir cada aparato ───────────────────────────────────────────────
  items.forEach(item => {
    const { id, va, tipoCarga, tipo, watts } = item;
    const clase = clasificarEquipo(tipo, watts, tipoCarga);

    // Determinar fases requeridas según tipo de carga y acometida
    let fasesRequeridas = [];  // ej: ['A'], ['A','B'], ['A','B','C']
    let polos = 1;

    if (tipoCarga === 'trifasica' && tipoAcometida === 'trifasico') {
      fasesRequeridas = ['A', 'B', 'C'];
      polos = 3;
    } else if (tipoCarga === 'bifasica' && (tipoAcometida === 'bifasico' || tipoAcometida === 'trifasico')) {
      // Elegir el par de fases con menor carga combinada
      const pares = tipoAcometida === 'trifasico'
        ? [['A','B'],['B','C'],['A','C']]
        : [['A','B']];
      const parOptimo = pares.reduce((best, par) => {
        const cargaPar  = par.reduce((s, f) => s + (fasesVA[f] || 0), 0);
        const cargaBest = best.reduce((s, f) => s + (fasesVA[f] || 0), 0);
        return cargaPar < cargaBest ? par : best;
      }, pares[0]);
      fasesRequeridas = parOptimo;
      polos = 2;
    } else {
      // Monofásica (o degradación: bifásica en mono)
      const faseOpt = faseMenorCarga(fasesSimples);
      fasesRequeridas = [faseOpt];
      polos = 1;
    }

    const faseStr = fasesRequeridas.join('-');

    // ── Intentar agrupar en un breaker existente compatible ───────────────
    let agrupado = false;

    // Regla 1: Las cargas grandes NUNCA se agrupan
    if (polos === 1 && !clase.esGrande) {
      for (const brk of breakers) {
        if (brk.fase !== faseStr || brk.polos !== 1 || brk.esDedicado) continue;

        const vaCombi    = brk.vaTotal + va;
        const inCombi    = calcularCorrienteNominal(vaCombi, 'monofasica');
        const icCombi    = calcularCorrienteCorregida(inCombi);
        const capNecesaria = seleccionarProteccion(icCombi);

        // Regla 2: Límite de corriente del cable (máx 20A en circuitos compartidos)
        if (capNecesaria > 20) continue;

        // Regla 3: Evitar mezclar motores (ruido) con electrónica delicada
        const apsEnBreaker = items.filter(x => brk.aparatos.includes(x.id));
        const clasesEnBreaker = apsEnBreaker.map(x => clasificarEquipo(x.tipo, x.watts, x.tipoCarga));
        
        const tieneMotor = clasesEnBreaker.some(c => c.esMotor);
        const tieneDelicado = clasesEnBreaker.some(c => c.esDelicado);

        if (clase.esDelicado && tieneMotor) continue;
        if (clase.esMotor && tieneDelicado) continue;

        // Agrupar si la corriente combinada no supera el 80% del breaker actual
        if (icCombi <= brk.capacidad * 0.80 && capNecesaria <= brk.capacidad) {
          brk.aparatos.push(id);
          brk.vaTotal  = vaCombi;
          brk.icTotal  = icCombi;
          // Actualizar VA en la fase
          fasesVA[faseStr] = (fasesVA[faseStr] || 0) + va;
          agrupado = true;
          break;
        }
      }
    }

    if (!agrupado) {
      // Las cargas grandes se crean marcadas como dedicadas (true)
      crearBreaker(faseStr, polos, id, va, clase.esGrande);
    }
  });

  // ── Calcular desbalanceo inicial ──────────────────────────────────────────
  let desbalancePct = calcularDesbalanceUVIE(fasesVA.A, fasesVA.B, fasesVA.C, tipoAcometida);

  // ── Swaps iterativos para reducir desbalanceo a ≤ 5% ─────────────────────
  if (fasesSimples.length > 1) {
    let intentos = 0;
    while (desbalancePct > 5.0 && intentos < 80) {
      intentos++;
      const vaFases = fasesSimples.map(f => ({ f, va: fasesVA[f] || 0 }));
      vaFases.sort((a, b) => b.va - a.va);
      const faseMas  = vaFases[0].f;
      const faseMenos = vaFases[vaFases.length - 1].f;

      // Buscar breaker monofásico en la fase más cargada para mover a la menos cargada
      const candidatos = breakers
        .filter(b => b.fase === faseMas && b.polos === 1)
        .sort((a, b) => a.vaTotal - b.vaTotal);  // el más pequeño primero

      if (!candidatos.length) break;
      const brk = candidatos[0];

      // Mover el breaker a la fase con menor carga
      fasesVA[faseMas]  = (fasesVA[faseMas]  || 0) - brk.vaTotal;
      fasesVA[faseMenos] = (fasesVA[faseMenos] || 0) + brk.vaTotal;
      brk.fase = faseMenos;

      desbalancePct = calcularDesbalanceUVIE(fasesVA.A, fasesVA.B, fasesVA.C, tipoAcometida);
    }
  }

  // ── Ordenar breakers por fase y capacidad para posición física ────────────
  const ordenFase = { A: 0, B: 1, C: 2 };
  breakers.sort((a, b) => {
    const fA = a.fase.split('-')[0], fB = b.fase.split('-')[0];
    return (ordenFase[fA] ?? 3) - (ordenFase[fB] ?? 3) || b.capacidad - a.capacidad;
  });

  // Reasignar circuitoNumero tras ordenación
  breakers.forEach((brk, i) => { brk.circuitoNumero = `C-${i + 1}`; });

  return { breakers, desbalancePct: parseFloat(desbalancePct.toFixed(2)), fasesVA };
}
