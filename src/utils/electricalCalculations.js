/**
 * utilidades de cálculo eléctrico bajo la norma NOM-001-SEDE y políticas de CFE.
 */

/**
 * Determina el tipo de acometida CFE según la carga total instalada en Watts.
 * CFE límites para tarifa comercial de baja tensión (sistemas monofásicos, bifásicos y trifásicos).
 * @param {number} watts - Carga activa total instalada en Watts.
 * @returns {object} Configuración de la acometida.
 */
export function determinarAcometida(watts, forzarTrifasico = false) {
  if (forzarTrifasico) {
    return {
      id: 'trifasico',
      tipo: 'Sistema Trifásico (3F-1N) [Forzado]',
      descripcion: 'Bajo Demanda',
      fasesDisponibles: ['A', 'B', 'C'],
      limiteWatts: Infinity
    };
  }
  if (watts <= 5000) {
    return {
      id: 'monofasico',
      tipo: 'Sistema Monofásico (1F-1N)',
      descripcion: 'Hasta 5kW',
      fasesDisponibles: ['A'],
      limiteWatts: 5000
    };
  } else if (watts <= 10000) {
    return {
      id: 'bifasico',
      tipo: 'Sistema Bifásico (2F-1N)',
      descripcion: '5kW a 10kW',
      fasesDisponibles: ['A', 'B'],
      limiteWatts: 10000
    };
  } else {
    return {
      id: 'trifasico',
      tipo: 'Sistema Trifásico (3F-1N)',
      descripcion: 'Más de 10kW',
      fasesDisponibles: ['A', 'B', 'C'],
      limiteWatts: Infinity
    };
  }
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
 * Algoritmo Greedy para pre-seleccionar la fase que tiene menos carga activa (Watts) acumulada.
 * Limita la selección a las fases válidas del sistema resultante.
 * @param {Array} aparatos - Lista de aparatos actualmente instalados.
 * @param {number} nuevoAparatoWatts - Potencia en Watts del nuevo aparato.
 * @param {Array} fasesDisponibles - Fases disponibles en el sistema eléctrico resultante (ej. ['A', 'B']).
 * @returns {string} Fase sugerida ('A', 'B' o 'C').
 */
export function obtenerFaseGreedy(aparatos, nuevoAparatoWatts, fasesDisponibles) {
  // Inicializar cargas por fase para las fases disponibles
  const cargas = {};
  fasesDisponibles.forEach(f => {
    cargas[f] = 0;
  });

  // Sumar watts de los aparatos existentes en sus fases correspondientes
  aparatos.forEach(ap => {
    // Si la fase del aparato está dentro de las fases del sistema, sumarla
    if (cargas[ap.fase] !== undefined) {
      cargas[ap.fase] += parseFloat(ap.watts) || 0;
    } else {
      // Si el aparato estaba en una fase no disponible (por ejemplo, C pero bajó a Monofásico/Bifásico),
      // lo contamos como carga en Fase A para forzar balanceo o lo ignoramos.
      // CFE: Solo acumulamos en fases válidas del nuevo sistema
      cargas[fasesDisponibles[0]] += parseFloat(ap.watts) || 0;
    }
  });

  // Encontrar la fase disponible con menor carga acumulada
  let faseSugerida = fasesDisponibles[0];
  let minCarga = cargas[faseSugerida];

  for (let i = 1; i < fasesDisponibles.length; i++) {
    const f = fasesDisponibles[i];
    if (cargas[f] < minCarga) {
      minCarga = cargas[f];
      faseSugerida = f;
    }
  }

  return faseSugerida;
}

/**
 * Genera combinaciones ordenadas de balanceo de fases para el inventario actual.
 * @param {Array} aparatos - Lista de aparatos.
 * @param {string} acometidaId - 'monofasico', 'bifasico' o 'trifasico'.
 * @param {Array} fasesDisponibles - ['A'], ['A', 'B'] o ['A', 'B', 'C'].
 * @returns {Array} Lista de configuraciones balanceadas. Cada una contiene el desbalanceo y un mapeo de id -> fase.
 */
export function generarCombinacionesBalanceo(aparatos, acometidaId, fasesDisponibles) {
  if (acometidaId === 'monofasico' || aparatos.length === 0) {
    return [];
  }

  // Sanitizar aparatos de entrada para corregir fases inválidas para la acometida actual
  const aparatosSanitizados = aparatos.map(ap => {
    let faseValida = ap.fase || 'A';
    if (acometidaId === 'bifasico') {
      if (ap.tipoCarga === 'bifasica') {
        faseValida = 'A-B';
      } else {
        if (faseValida !== 'A' && faseValida !== 'B') {
          faseValida = 'A';
        }
      }
    } else if (acometidaId === 'trifasico') {
      if (ap.tipoCarga === 'monofasica') {
        if (faseValida !== 'A' && faseValida !== 'B' && faseValida !== 'C') {
          faseValida = 'A';
        }
      } else if (ap.tipoCarga === 'bifasica') {
        if (faseValida !== 'A-B' && faseValida !== 'B-C' && faseValida !== 'A-C') {
          faseValida = 'A-B';
        }
      } else if (ap.tipoCarga === 'trifasica') {
        faseValida = 'A-B-C';
      }
    } else {
      faseValida = 'A';
    }
    return { ...ap, fase: faseValida };
  });

  // Identificar qué aparatos son balanceables (monofásicos y bifásicos en trifásico)
  const balanceables = aparatosSanitizados.map((ap, index) => {
    let opciones = [];
    if (acometidaId === 'bifasico') {
      if (ap.tipoCarga === 'monofasica') {
        opciones = ['A', 'B'];
      }
    } else if (acometidaId === 'trifasico') {
      if (ap.tipoCarga === 'monofasica') {
        opciones = ['A', 'B', 'C'];
      } else if (ap.tipoCarga === 'bifasica') {
        opciones = ['A-B', 'B-C', 'A-C'];
      }
    }
    return {
      index,
      id: ap.id,
      watts: parseFloat(ap.watts) || 0,
      fp: parseFloat(ap.fp) || 1.0,
      usarVaDirecto: ap.usarVaDirecto,
      tipoCarga: ap.tipoCarga,
      opciones
    };
  }).filter(b => b.opciones.length > 0);

  if (balanceables.length === 0) {
    return [];
  }

  // Función para calcular desbalanceo de una asignación candidata
  const evaluarAsignacion = (asignacion) => {
    const fasesVA = { A: 0, B: 0, C: 0 };
    
    aparatosSanitizados.forEach((ap, idx) => {
      const w = parseFloat(ap.watts) || 0;
      const fp = parseFloat(ap.fp) || 1.0;
      // Calcular VA de forma local
      let va = w;
      if (!ap.usarVaDirecto && fp > 0) {
        va = w / fp;
      }

      // Buscar si este aparato tiene fase asignada en la propuesta
      const asignado = asignacion.find(a => a.index === idx);
      const fase = asignado ? asignado.fase : ap.fase;

      // Repartir VA por fase
      if (acometidaId === 'monofasico') {
        fasesVA.A += va;
      } else if (ap.tipoCarga === 'trifasica' && acometidaId === 'trifasico') {
        fasesVA.A += va / 3;
        fasesVA.B += va / 3;
        fasesVA.C += va / 3;
      } else if (ap.tipoCarga === 'bifasica') {
        const partes = (fase || 'A-B').split('-');
        partes.forEach(p => {
          if (fasesVA[p] !== undefined) {
            fasesVA[p] += va / partes.length;
          }
        });
      } else {
        // Monofásica
        let f = fase;
        if (!fasesDisponibles.includes(f)) f = fasesDisponibles[0];
        fasesVA[f] += va;
      }
    });

    // Calcular desbalanceo UVIE
    let valores = [];
    if (acometidaId === 'bifasico') {
      valores = [fasesVA.A, fasesVA.B];
    } else {
      valores = [fasesVA.A, fasesVA.B, fasesVA.C];
    }
    const maxVal = Math.max(...valores);
    const minVal = Math.min(...valores);
    const desbalance = maxVal === 0 ? 0 : ((maxVal - minVal) / maxVal) * 100;

    return desbalance;
  };

  // Buscar asignaciones. Si el número de combinaciones es pequeño (< 3000), hacemos búsqueda exhaustiva.
  let totalCombinaciones = 1;
  balanceables.forEach(b => {
    totalCombinaciones *= b.opciones.length;
  });

  const resultados = [];

  if (totalCombinaciones <= 3000) {
    // Búsqueda exhaustiva recursiva
    const backtrack = (idx, camino) => {
      if (idx === balanceables.length) {
        const desbalance = evaluarAsignacion(camino);
        resultados.push({
          desbalance,
          asignacion: camino.map(c => ({ id: c.id, fase: c.fase }))
        });
        return;
      }
      const b = balanceables[idx];
      b.opciones.forEach(opt => {
        backtrack(idx + 1, [...camino, { index: b.index, id: b.id, fase: opt }]);
      });
    };
    backtrack(0, []);
  } else {
    // Búsqueda estocástica / Hill-Climbing
    const vistas = new Set();
    
    for (let iter = 0; iter < 1000; iter++) {
      // 1. Crear asignación aleatoria inicial
      let camino = balanceables.map(b => ({
        index: b.index,
        id: b.id,
        fase: b.opciones[Math.floor(Math.random() * b.opciones.length)]
      }));

      // 2. Hill climbing local: intentar mejorar cambiando una fase a la vez
      let mejorado = true;
      let desbalanceActual = evaluarAsignacion(camino);

      while (mejorado) {
        mejorado = false;
        const orden = [...Array(balanceables.length).keys()].sort(() => Math.random() - 0.5);
        
        for (let i of orden) {
          const b = balanceables[i];
          const faseOriginal = camino[i].fase;
          
          for (let opt of b.opciones) {
            if (opt === faseOriginal) continue;
            
            camino[i].fase = opt;
            const nuevoDesbalance = evaluarAsignacion(camino);
            
            if (nuevoDesbalance < desbalanceActual) {
              desbalanceActual = nuevoDesbalance;
              mejorado = true;
              break;
            } else {
              camino[i].fase = faseOriginal;
            }
          }
          if (mejorado) break;
        }
      }

      // Formatear clave única
      const key = camino.map(c => `${c.id}:${c.fase}`).sort().join('|');
      if (!vistas.has(key)) {
        vistas.add(key);
        resultados.push({
          desbalance: desbalanceActual,
          asignacion: camino.map(c => ({ id: c.id, fase: c.fase }))
        });
      }
    }
  }

  // Ordenar resultados por desbalance de menor a mayor
  resultados.sort((a, b) => a.desbalance - b.desbalance);

  // Filtrar configuraciones que den un desbalanceo < 5%. Si ninguna, las 10 mejores
  let candidatas = resultados.filter(r => r.desbalance < 5.0);
  if (candidatas.length === 0) {
    candidatas = resultados.slice(0, 10);
  }

  // Quitar duplicados lógicos
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

