/**
 * utilidades de cálculo eléctrico bajo la norma NOM-001-SEDE y políticas de CFE.
 */

/**
 * Determina el tipo de acometida CFE según la carga total instalada en Watts.
 * CFE límites para tarifa comercial de baja tensión (sistemas monofásicos, bifásicos y trifásicos).
 * @param {number} watts - Carga activa total instalada en Watts.
 * @returns {object} Configuración de la acometida.
 */
export function determinarAcometida(watts, forzarTrifasico = false, tieneBifasico = false, tieneTrifasico = false) {
  if (forzarTrifasico || tieneTrifasico || watts > 10000) {
    return {
      id: 'trifasico',
      tipo: forzarTrifasico ? 'Sistema Trifásico (3F-1N) [Forzado]' : 'Sistema Trifásico (3F-1N)',
      descripcion: tieneTrifasico ? 'Carga Trifásica 220V' : 'Más de 10kW',
      fasesDisponibles: ['A', 'B', 'C'],
      limiteWatts: Infinity
    };
  }
  if (tieneBifasico || watts > 5000) {
    return {
      id: 'bifasico',
      tipo: 'Sistema Bifásico (2F-1N)',
      descripcion: tieneBifasico ? 'Cargas Bifásicas 220V' : '5kW a 10kW',
      fasesDisponibles: ['A', 'B'],
      limiteWatts: 10000
    };
  }
  return {
    id: 'monofasico',
    tipo: 'Sistema Monofásico (1F-1N)',
    descripcion: 'Hasta 5kW',
    fasesDisponibles: ['A'],
    limiteWatts: 5000
  };
}

/**
 * Determina el tipo de acometida CFE para un medidor individual considerando
 * sus cargas conectadas (220V bifásicas o trifásicas) y configuración manual del usuario.
 */
export function determinarAcometidaMedidor(med, aparatosMed = []) {
  const tieneTrifasico = aparatosMed.some(ap => ap.tipoCarga === 'trifasica');
  const tieneBifasico = aparatosMed.some(ap => ap.tipoCarga === 'bifasica');
  const watts = aparatosMed.reduce((sum, ap) => sum + (parseFloat(ap.watts) || 0), 0);

  // Si el usuario configuró fases específicas manualmente en el medidor
  if (Array.isArray(med?.fasesHabilitadas) && med.fasesHabilitadas.length > 0) {
    const fh = [...med.fasesHabilitadas].sort();
    if (fh.length >= 3) {
      return {
        id: 'trifasico',
        tipo: 'Sistema Trifásico (3F-1N) [Manual]',
        descripcion: '220/127V (Fases A, B, C)',
        fasesDisponibles: ['A', 'B', 'C'],
        limiteWatts: Infinity
      };
    }
    if (fh.length === 2 && !tieneTrifasico) {
      return {
        id: 'bifasico',
        tipo: `Sistema Bifásico (2F-1N) [Fases ${fh.join('-')}]`,
        descripcion: '220/127V 2 Fases',
        fasesDisponibles: fh,
        limiteWatts: 10000
      };
    }
    if (fh.length === 1 && !tieneBifasico && !tieneTrifasico) {
      return {
        id: 'monofasico',
        tipo: `Sistema Monofásico (1F-1N) [Fase ${fh[0]}]`,
        descripcion: '127V 1 Fase',
        fasesDisponibles: fh,
        limiteWatts: 5000
      };
    }
  }

  if (med?.forzarTrifasico || med?.tipoAcometida === 'trifasico' || tieneTrifasico || watts > 10000) {
    return {
      id: 'trifasico',
      tipo: med?.forzarTrifasico ? 'Sistema Trifásico (3F-1N) [Forzado]' : 'Sistema Trifásico (3F-1N)',
      descripcion: tieneTrifasico ? 'Carga Trifásica 220V' : 'Más de 10kW',
      fasesDisponibles: ['A', 'B', 'C'],
      limiteWatts: Infinity
    };
  }

  if (med?.tipoAcometida === 'bifasico' || tieneBifasico || watts > 5000) {
    return {
      id: 'bifasico',
      tipo: 'Sistema Bifásico (2F-1N)',
      descripcion: tieneBifasico ? 'Carga Bifásica 220V (Minisplit/Equipos)' : '5kW a 10kW',
      fasesDisponibles: ['A', 'B'],
      limiteWatts: 10000
    };
  }

  return {
    id: 'monofasico',
    tipo: 'Sistema Monofásico (1F-1N)',
    descripcion: 'Hasta 5kW (127V)',
    fasesDisponibles: ['A'],
    limiteWatts: 5000
  };
}

const ORDEN_FASES = ['A', 'B', 'C'];

/**
 * Normaliza la fase asignada a un aparato garantizando que SOLO utilice fases
 * habilitadas en la acometida de su medidor.
 * @param {object} ap - Objeto aparato ({ tipoCarga, fase }).
 * @param {object|Array} acometidaOrFases - Objeto acometida con fasesDisponibles o arreglo de fases.
 * @returns {string} Fase o combinación de fases válida (ej. 'A', 'B', 'A-B', 'A-C', 'B-C', 'A-B-C').
 */
export function normalizarFaseParaMedidor(ap, acometidaOrFases) {
  const rawFases = Array.isArray(acometidaOrFases)
    ? acometidaOrFases
    : (Array.isArray(acometidaOrFases?.fasesDisponibles) && acometidaOrFases.fasesDisponibles.length > 0
      ? acometidaOrFases.fasesDisponibles
      : (acometidaOrFases?.id === 'trifasico'
        ? ['A', 'B', 'C']
        : acometidaOrFases?.id === 'bifasico'
          ? ['A', 'B']
          : ['A']));

  const fasesDisps = ORDEN_FASES.filter(f => rawFases.includes(f));
  if (fasesDisps.length === 0) fasesDisps.push('A');

  if (fasesDisps.length === 1) {
    return fasesDisps[0];
  }

  const tipoCarga = ap?.tipoCarga || 'monofasica';
  const rawFase = String(ap?.fase || '');

  if (tipoCarga === 'trifasica') {
    if (fasesDisps.length >= 3) return 'A-B-C';
    if (fasesDisps.length === 2) return `${fasesDisps[0]}-${fasesDisps[1]}`;
    return fasesDisps[0];
  }

  if (tipoCarga === 'bifasica') {
    const partesValidas = [...new Set(rawFase.split('-').filter(f => fasesDisps.includes(f)))]
      .sort((a, b) => ORDEN_FASES.indexOf(a) - ORDEN_FASES.indexOf(b));
    if (partesValidas.length === 2) {
      return `${partesValidas[0]}-${partesValidas[1]}`;
    }
    return `${fasesDisps[0]}-${fasesDisps[1]}`;
  }

  // Monofásica
  if (fasesDisps.includes(rawFase)) {
    return rawFase;
  }
  return fasesDisps[0];
}

/**
 * Distribuye la potencia activa (W), aparente (VA) y corriente (A) de un aparato
 * estrictamente entre las fases habilitadas de su medidor.
 */
export function distribuirCargaPorFases(ap, acometidaOrFases) {
  const w = parseFloat(ap?.watts) || 0;
  const fp = parseFloat(ap?.fp) || 1.0;
  const va = calcularVA(w, fp, ap?.usarVaDirecto);
  const faseNorm = normalizarFaseParaMedidor(ap, acometidaOrFases);
  const partes = faseNorm.split('-');
  const numPartes = partes.length || 1;

  const fLoad = { A: 0, B: 0, C: 0 };
  const fVA = { A: 0, B: 0, C: 0 };
  const fAmps = { A: 0, B: 0, C: 0 };

  partes.forEach(f => {
    if (fVA[f] !== undefined) {
      const vaFase = va / numPartes;
      const wFase = w / numPartes;
      fVA[f] += vaFase;
      fLoad[f] += wFase;
      if (numPartes === 3) {
        fAmps[f] += vaFase / 127.017;
      } else if (numPartes === 2) {
        fAmps[f] += vaFase / 110;
      } else {
        fAmps[f] += vaFase / 127;
      }
    }
  });

  return {
    faseNorm,
    watts: w,
    fp,
    va,
    fLoad,
    fVA,
    fAmps
  };
}

/**
 * Calcula el porcentaje de desbalance de carga entre fases.
 * Sigue el estándar industrial (Desviación Máxima respecto al promedio / Promedio) * 100.
 * Para monofásico es 0%. Para bifásico se evalúa entre A y B.
 * @param {number} faseA - Watts en Fase A
 * @param {number} faseB - Watts en Fase B
 * @param {number} faseC - Watts en Fase C
 * @param {string} acometidaId - Identificador de acometida ('monofasico', 'bifasico', 'trifasico')
 * @returns {number} Porcentaje de desbalance (0-100)
 */
export function calcularDesbalance(faseA, faseB, faseC, acometidaId) {
  if (acometidaId === 'monofasico') {
    return 0;
  }

  if (acometidaId === 'bifasico') {
    const total = faseA + faseB;
    if (total === 0) return 0;
    const promedio = total / 2;
    const desviacionMax = Math.max(Math.abs(faseA - promedio), Math.abs(faseB - promedio));
    return (desviacionMax / promedio) * 100;
  }

  // Trifásico
  const total = faseA + faseB + faseC;
  if (total === 0) return 0;
  const promedio = total / 3;
  const desviacionMax = Math.max(
    Math.abs(faseA - promedio),
    Math.abs(faseB - promedio),
    Math.abs(faseC - promedio)
  );
  return (desviacionMax / promedio) * 100;
}

/**
 * Calcula la potencia aparente (S) en Volt-Amperios (VA) para un aparato.
 * @param {number} watts - Potencia activa en Watts.
 * @param {number} fp - Factor de Potencia (0.0 - 1.0).
 * @param {boolean} usarVaDirecto - Si es true, la potencia ingresada en watts es tomada directamente como VA.
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
 * Calcula la potencia reactiva (Q) en Volt-Amperios Reactivos (VAR).
 * Q = sqrt(S^2 - P^2)
 * @param {number} watts - Potencia activa (P) en W.
 * @param {number} va - Potencia aparente (S) en VA.
 * @returns {number} Potencia reactiva en VAR.
 */
export function calcularVAR(watts, va) {
  if (va <= watts) return 0;
  return Math.sqrt(Math.pow(va, 2) - Math.pow(watts, 2));
}

/**
 * Calcula la corriente en Amperes para una tensión nominal de 127 V CA (L-N estándar en México).
 * I = S / V_nominal
 * @param {number} va - Potencia aparente en VA.
 * @param {number} tensionNominal - Tensión de diseño, por defecto 127V.
 * @returns {number} Corriente en Amperes.
 */
export function calcularCorriente(va, tensionNominal = 127) {
  if (!va || tensionNominal <= 0) return 0;
  return va / tensionNominal;
}

/**
 * Algoritmo Greedy para pre-seleccionar la fase que tiene menos carga aparente (VA) acumulada.
 * Limita la selección estrictamente a las fases válidas del medidor.
 * @param {Array} aparatos - Lista de aparatos actualmente instalados en el medidor.
 * @param {number} nuevoAparatoWatts - Potencia en Watts del nuevo aparato.
 * @param {Array} fasesDisponibles - Fases disponibles en el medidor (ej. ['A', 'B']).
 * @returns {string} Fase sugerida ('A', 'B' o 'C').
 */
export function obtenerFaseGreedy(aparatos, nuevoAparatoWatts, fasesDisponibles = ['A']) {
  const fasesDisps = Array.isArray(fasesDisponibles) && fasesDisponibles.length > 0 ? fasesDisponibles : ['A'];
  const cargas = {};
  fasesDisps.forEach(f => {
    cargas[f] = 0;
  });

  // Sumar VA de los aparatos existentes respetando cargas 1F, 2F y 3F dentro de fasesDisps
  aparatos.forEach(ap => {
    const { fVA } = distribuirCargaPorFases(ap, fasesDisps);
    fasesDisps.forEach(f => {
      cargas[f] += fVA[f] || 0;
    });
  });

  // Encontrar la fase disponible con menor carga acumulada
  let faseSugerida = fasesDisps[0];
  let minCarga = cargas[faseSugerida];

  for (let i = 1; i < fasesDisps.length; i++) {
    const f = fasesDisps[i];
    if (cargas[f] < minCarga) {
      minCarga = cargas[f];
      faseSugerida = f;
    }
  }

  return faseSugerida;
}

/**
 * Genera combinaciones ordenadas de balanceo de fases para el inventario de un medidor.
 * @param {Array} aparatos - Lista de aparatos del medidor.
 * @param {string} acometidaId - 'monofasico', 'bifasico' o 'trifasico'.
 * @param {Array} fasesDisponibles - ['A'], ['A', 'B'], ['A', 'C'], ['B', 'C'] o ['A', 'B', 'C'].
 * @returns {Array} Lista de configuraciones balanceadas ordenadas por menor desbalance UVIE.
 */
export function generarCombinacionesBalanceo(aparatos, acometidaId, fasesDisponibles) {
  let idAcom = acometidaId;
  let dispArg = fasesDisponibles;
  if (Array.isArray(acometidaId)) {
    dispArg = acometidaId;
    idAcom = typeof fasesDisponibles === 'string'
      ? fasesDisponibles
      : (dispArg.length >= 3 ? 'trifasico' : dispArg.length === 2 ? 'bifasico' : 'monofasico');
  }
  const rawFases = Array.isArray(dispArg) && dispArg.length > 0
    ? dispArg
    : (idAcom === 'trifasico' ? ['A', 'B', 'C'] : idAcom === 'bifasico' ? ['A', 'B'] : ['A']);
  const fActivas = ORDEN_FASES.filter(f => rawFases.includes(f));

  if (idAcom === 'monofasico' || fActivas.length <= 1 || aparatos.length === 0) {
    return [];
  }

  // Sanitizar aparatos de entrada para que todas sus fases pertenezcan a fActivas
  const aparatosSanitizados = aparatos.map(ap => ({
    ...ap,
    fase: normalizarFaseParaMedidor(ap, fActivas)
  }));

  // Opciones posibles por tipo de carga según las fases activas del medidor
  const paresBifasicos3F = ['A-B', 'B-C', 'A-C'];
  const parBifasico2F = [`${fActivas[0]}-${fActivas[1]}`];

  const balanceables = aparatosSanitizados.map((ap, index) => {
    let opciones = [];
    if (ap.tipoCarga === 'monofasica') {
      opciones = [...fActivas];
    } else if (ap.tipoCarga === 'bifasica') {
      if (fActivas.length >= 3) {
        opciones = paresBifasicos3F;
      } else if (fActivas.length === 2) {
        // En sistema de 2 fases (ej. A-B), la carga 220V usa obligatoriamente ambas fases
        opciones = [];
      }
    }
    return {
      index,
      id: ap.id,
      watts: parseFloat(ap.watts) || 0,
      fp: parseFloat(ap.fp) || 1.0,
      usarVaDirecto: ap.usarVaDirecto,
      va: calcularVA(ap.watts, ap.fp, ap.usarVaDirecto),
      tipoCarga: ap.tipoCarga,
      faseInicial: ap.fase,
      opciones
    };
  }).filter(b => b.opciones.length > 1);

  // Caso especial: si solo hay cargas bifásicas que necesitaban sanitizarse (ej. estaban en B-C cuando solo A-B está activo)
  if (balanceables.length === 0) {
    const huboSanitizacion = aparatosSanitizados.some((ap, i) => ap.fase !== aparatos[i].fase);
    if (!huboSanitizacion) return [];
    const fasesVA = { A: 0, B: 0, C: 0 };
    aparatosSanitizados.forEach(ap => {
      const { fVA } = distribuirCargaPorFases(ap, fActivas);
      fActivas.forEach(f => { fasesVA[f] += fVA[f]; });
    });
    const valores = fActivas.map(f => fasesVA[f] || 0);
    const maxVal = Math.max(...valores);
    const minVal = Math.min(...valores);
    const desbalance = maxVal === 0 ? 0 : ((maxVal - minVal) / maxVal) * 100;
    return [{
      desbalance,
      asignacion: aparatosSanitizados.map(ap => ({ id: ap.id, fase: ap.fase }))
    }];
  }

  // Función para calcular desbalanceo UVIE exacto de una asignación candidata
  const evaluarAsignacion = (mapaPorIndex) => {
    const fasesVA = { A: 0, B: 0, C: 0 };

    aparatosSanitizados.forEach((ap, idx) => {
      const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
      const fase = mapaPorIndex.get(idx) || ap.fase;
      const partes = fase.split('-');
      partes.forEach(p => {
        if (fasesVA[p] !== undefined) {
          fasesVA[p] += va / partes.length;
        }
      });
    });

    const valores = fActivas.map(f => fasesVA[f] || 0);
    const maxVal = Math.max(...valores);
    const minVal = Math.min(...valores);
    return maxVal === 0 ? 0 : ((maxVal - minVal) / maxVal) * 100;
  };

  let totalCombinaciones = 1;
  balanceables.forEach(b => {
    totalCombinaciones *= b.opciones.length;
    if (totalCombinaciones > 10000) totalCombinaciones = 10000;
  });

  const resultados = [];

  if (totalCombinaciones <= 4096) {
    // Búsqueda exhaustiva exacta (cubre hasta 12 cargas monofásicas en 2F o 7 en 3F)
    const mapaActual = new Map();
    const backtrack = (idx) => {
      if (idx === balanceables.length) {
        const desbalance = evaluarAsignacion(mapaActual);
        const asignacion = aparatosSanitizados.map((ap, apIdx) => ({
          id: ap.id,
          fase: mapaActual.get(apIdx) || ap.fase
        }));
        resultados.push({ desbalance, asignacion });
        return;
      }
      const b = balanceables[idx];
      for (const opt of b.opciones) {
        mapaActual.set(b.index, opt);
        backtrack(idx + 1);
      }
    };
    backtrack(0);
  } else {
    // Semilla 1: LPT determinístico ordenado de mayor a menor VA
    const construirSemillaLPT = () => {
      const acum = { A: 0, B: 0, C: 0 };
      // Sumar fijos primero
      const balanceableIdxSet = new Set(balanceables.map(b => b.index));
      aparatosSanitizados.forEach((ap, idx) => {
        if (!balanceableIdxSet.has(idx)) {
          const { fVA } = distribuirCargaPorFases(ap, fActivas);
          fActivas.forEach(f => { acum[f] += fVA[f]; });
        }
      });

      const ordenMayorMenor = [...balanceables].sort((a, b) => b.va - a.va);
      const mapa = new Map();
      ordenMayorMenor.forEach(b => {
        let mejorOpt = b.opciones[0];
        let mejorMax = Infinity;
        b.opciones.forEach(opt => {
          const partes = opt.split('-');
          const sim = { ...acum };
          partes.forEach(p => { sim[p] += b.va / partes.length; });
          const maxSim = Math.max(...fActivas.map(f => sim[f]));
          if (maxSim < mejorMax) {
            mejorMax = maxSim;
            mejorOpt = opt;
          }
        });
        const partes = mejorOpt.split('-');
        partes.forEach(p => { acum[p] += b.va / partes.length; });
        mapa.set(b.index, mejorOpt);
      });
      return balanceables.map(b => ({ index: b.index, id: b.id, fase: mapa.get(b.index) }));
    };

    // Semilla 2: Configuración actual sanitizada (garantiza nunca empeorar)
    const semillaActual = balanceables.map(b => ({ index: b.index, id: b.id, fase: b.faseInicial }));

    const vistas = new Set();
    const NUM_ITERS = 600;

    for (let iter = 0; iter < NUM_ITERS; iter++) {
      let camino;
      if (iter === 0) {
        camino = construirSemillaLPT();
      } else if (iter === 1) {
        camino = semillaActual.map(x => ({ ...x }));
      } else {
        camino = balanceables.map(b => ({
          index: b.index,
          id: b.id,
          fase: b.opciones[Math.floor(Math.random() * b.opciones.length)]
        }));
      }

      const mapa = new Map(camino.map(c => [c.index, c.fase]));
      let desbalanceActual = evaluarAsignacion(mapa);
      let mejorado = true;

      while (mejorado) {
        mejorado = false;
        // 1-move local search
        for (let i = 0; i < camino.length; i++) {
          const b = balanceables[i];
          const faseOrig = camino[i].fase;
          for (const opt of b.opciones) {
            if (opt === faseOrig) continue;
            camino[i].fase = opt;
            mapa.set(b.index, opt);
            const nuevoDesb = evaluarAsignacion(mapa);
            if (nuevoDesb < desbalanceActual - 1e-9) {
              desbalanceActual = nuevoDesb;
              mejorado = true;
              break;
            } else {
              camino[i].fase = faseOrig;
              mapa.set(b.index, faseOrig);
            }
          }
          if (mejorado) break;
        }

        // 2-swap local search si 1-move se estancó y aún supera 1%
        if (!mejorado && desbalanceActual > 1.0) {
          for (let i = 0; i < camino.length && !mejorado; i++) {
            for (let j = i + 1; j < camino.length && !mejorado; j++) {
              if (camino[i].fase === camino[j].fase) continue;
              if (balanceables[i].opciones.includes(camino[j].fase) && balanceables[j].opciones.includes(camino[i].fase)) {
                const fi = camino[i].fase;
                const fj = camino[j].fase;
                camino[i].fase = fj;
                camino[j].fase = fi;
                mapa.set(balanceables[i].index, fj);
                mapa.set(balanceables[j].index, fi);
                const nuevoDesb = evaluarAsignacion(mapa);
                if (nuevoDesb < desbalanceActual - 1e-9) {
                  desbalanceActual = nuevoDesb;
                  mejorado = true;
                } else {
                  camino[i].fase = fi;
                  camino[j].fase = fj;
                  mapa.set(balanceables[i].index, fi);
                  mapa.set(balanceables[j].index, fj);
                }
              }
            }
          }
        }
      }

      const asignacionCompleta = aparatosSanitizados.map((ap, apIdx) => ({
        id: ap.id,
        fase: mapa.get(apIdx) || ap.fase
      }));

      const key = asignacionCompleta.map(c => `${c.id}:${c.fase}`).sort().join('|');
      if (!vistas.has(key)) {
        vistas.add(key);
        resultados.push({
          desbalance: desbalanceActual,
          asignacion: asignacionCompleta
        });
      }
      if (desbalanceActual < 0.05 && resultados.length >= 5) break;
    }
  }

  resultados.sort((a, b) => a.desbalance - b.desbalance);

  let candidatas = resultados.filter(r => r.desbalance <= 5.0);
  if (candidatas.length === 0) {
    candidatas = resultados.slice(0, 10);
  } else {
    candidatas = candidatas.slice(0, 25);
  }

  const unicas = [];
  const hashes = new Set();
  candidatas.forEach(c => {
    const hash = c.asignacion.map(a => `${a.id}:${a.fase}`).sort().join(',');
    if (!hashes.has(hash)) {
      hashes.add(hash);
      unicas.push(c);
    }
  });

  return unicas;
}


