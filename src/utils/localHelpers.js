/**
 * Utilidades para la gestión de locales de los negocios del Consorcio Gallegos González.
 * Permite desvincular el local físico del medidor asignado y limpiar nombres preliminares.
 */

export const LOCALES_LISTA = [
  'Imperia Uniformes',
  'Papelería ImperiArte',
  'Hawaiian Paradise Universidades',
  'Bordados Veracruz',
  'Taller de Costura Imperia',
  'Publi-Imperia',
  'Oficinas Consorcio',
  'Servicios Comunes'
];

/**
 * Normaliza y extrae el local asignado y el nombre limpio del aparato
 * eliminando etiquetas preliminares como [Imperia], [Papelería], (Showroom), etc.
 * 
 * @param {object} aparato - Objeto del aparato o circuito
 * @param {string} medidorNombre - Nombre del medidor como fallback
 * @returns {{ local: string, tipoLimpio: string }}
 */
export function extraerLocalYTipoLimpio(aparato, medidorNombre = '') {
  if (!aparato) return { local: 'Imperia Uniformes', tipoLimpio: '' };

  let local = aparato.local ? String(aparato.local).trim() : '';
  let tipo = aparato.tipo ? String(aparato.tipo).trim() : '';

  // Buscar prefijos preliminares entre corchetes o paréntesis al inicio del nombre: [Imperia], (Showroom), etc.
  const match = tipo.match(/^(\[|\()([^\)\]]+)(\]|\))\s*/);
  if (match) {
    const rawTag = match[2].trim();
    // Quitar el prefijo del nombre del aparato
    tipo = tipo.replace(/^(\[|\()([^\)\]]+)(\]|\))\s*/, '').trim();

    if (!local) {
      const lower = rawTag.toLowerCase();
      if (lower.includes('imperia') && !lower.includes('publi')) {
        local = 'Imperia Uniformes';
      } else if (lower.includes('papeler') || lower.includes('arte')) {
        local = 'Papelería ImperiArte';
      } else if (lower.includes('hawaiian') || lower.includes('hp') || lower.includes('paradise')) {
        local = 'Hawaiian Paradise Universidades';
      } else if (lower.includes('bordad')) {
        local = 'Bordados Veracruz';
      } else if (lower.includes('costura')) {
        local = 'Taller de Costura Imperia';
      } else if (lower.includes('publi')) {
        local = 'Publi-Imperia';
      } else if (lower.includes('consorcio') || lower.includes('oficina')) {
        local = 'Oficinas Consorcio';
      } else if (lower.includes('servicio')) {
        local = 'Servicios Comunes';
      } else {
        local = rawTag;
      }
    }
  }

  // Si aún no tiene local asignado, deducir por el tipo, modelo o ID del equipo antes de recurrir al medidor
  if (!local) {
    const tLower = `${aparato.tipo || ''} ${aparato.modelo || ''} ${aparato.id || ''}`.toLowerCase();
    if (tLower.includes('publi') || tLower.includes('sublimac') || tLower.includes('dtf') || tLower.includes('atomstack') || tLower.includes('scanncut') || tLower.includes('serigraf') || tLower.includes('htv ront') || tLower.includes('tazas') || tLower.includes('gorras') || tLower.startsWith('pi_')) {
      local = 'Publi-Imperia';
    } else if (tLower.includes('costura') || tLower.includes('recta') || tLower.includes('overlock') || tLower.includes('collaretera') || tLower.includes('cortadora de tela') || tLower.includes('plancha de vapor') || tLower.startsWith('tc_')) {
      local = 'Taller de Costura Imperia';
    } else if (tLower.includes('bordad') || tLower.includes('aemco') || tLower.includes('melco') || tLower.startsWith('bv_')) {
      local = 'Bordados Veracruz';
    } else if (tLower.includes('papeler') || tLower.includes('arte') || tLower.includes('docucolor') || tLower.includes('xerox') || tLower.startsWith('pap_')) {
      local = 'Papelería ImperiArte';
    } else if (tLower.includes('hawaiian') || tLower.includes('paradise') || tLower.includes('crepera') || tLower.includes('marquesit') || tLower.includes('gaggia') || tLower.includes('wafflera') || tLower.startsWith('hp_')) {
      local = 'Hawaiian Paradise Universidades';
    } else if (tLower.includes('oficina') || tLower.includes('consorcio') || tLower.includes('laptop') || tLower.startsWith('oc_')) {
      local = 'Oficinas Consorcio';
    } else if (tLower.includes('servicio') || tLower.includes('bomba') || tLower.includes('gfci') || tLower.startsWith('gen_')) {
      local = 'Servicios Comunes';
    } else if (tLower.includes('uniforme') || tLower.includes('showroom') || tLower.startsWith('imp_')) {
      local = 'Imperia Uniformes';
    }
  }

  // Si aún no tiene local asignado, deducir por medidor o valor por defecto
  if (!local) {
    if (medidorNombre) {
      const lowerMed = medidorNombre.toLowerCase();
      if (lowerMed.includes('publi')) local = 'Publi-Imperia';
      else if (lowerMed.includes('costura')) local = 'Taller de Costura Imperia';
      else if (lowerMed.includes('bordad')) local = 'Bordados Veracruz';
      else if (lowerMed.includes('papeler') || lowerMed.includes('arte')) local = 'Papelería ImperiArte';
      else if (lowerMed.includes('hawaiian')) local = 'Hawaiian Paradise Universidades';
      else if (lowerMed.includes('consorcio') || lowerMed.includes('oficina')) local = 'Oficinas Consorcio';
      else if (lowerMed.includes('servicio')) local = 'Servicios Comunes';
      else if (lowerMed.includes('imperia') && !lowerMed.includes('publi')) local = 'Imperia Uniformes';
      else local = medidorNombre;
    } else {
      local = 'Imperia Uniformes';
    }
  }

  return {
    local,
    tipoLimpio: tipo
  };
}

/**
 * Compacta y renombra de forma consecutiva la lista de medidores (1, 2, 3...)
 * al eliminar uno o más medidores, y reasigna los aparatos asociados al nuevo ID.
 * 
 * @param {Array} medidoresList - Lista de medidores (pueden tener números discontinuos)
 * @param {Array} aparatosList - Lista de aparatos del proyecto
 * @returns {{ compactedMedidores: Array, compactedAparatos: Array, idMap: Map }}
 */
export function compactarMedidoresConsecutivos(medidoresList, aparatosList = []) {
  if (!Array.isArray(medidoresList) || medidoresList.length === 0) {
    return {
      compactedMedidores: [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }],
      compactedAparatos: aparatosList,
      idMap: new Map([['med_1', 'med_1']])
    };
  }

  const idMap = new Map();
  const compactedMedidores = medidoresList.map((m, idx) => {
    const newNum = idx + 1;
    const newId = `med_${newNum}`;
    idMap.set(m.id, newId);

    // Ajustar número visible si el nombre contiene "Medidor X" o "Medidor [0-9]+"
    let newNombre = m.nombre || `Medidor ${newNum}`;
    if (/^Medidor\s+\d+/i.test(newNombre)) {
      newNombre = newNombre.replace(/^Medidor\s+\d+/i, `Medidor ${newNum}`);
    }

    return {
      ...m,
      id: newId,
      numero: newNum,
      nombre: newNombre
    };
  });

  const validNewIds = new Set(compactedMedidores.map(m => m.id));
  const fallbackNewId = compactedMedidores[0]?.id || 'med_1';

  const compactedAparatos = (aparatosList || []).map(ap => {
    const oldMedId = ap.medidorId || medidoresList[0]?.id;
    const targetNewId = idMap.get(oldMedId) || (validNewIds.has(oldMedId) ? oldMedId : fallbackNewId);
    return {
      ...ap,
      medidorId: targetNewId
    };
  });

  return { compactedMedidores, compactedAparatos, idMap };
}

/**
 * Identifica con precisión la unidad de negocio a la que pertenece un aparato según su local o prefijo,
 * de forma totalmente independiente del medidorId físico donde esté conectado.
 * 
 * @param {object} aparato 
 * @returns {{ negocioId: string, negocioNombre: string }}
 */
export function identificarNegocioDeAparato(aparato) {
  if (!aparato) return { negocioId: 'imperia_uniformes', negocioNombre: 'Imperia Uniformes' };

  // 1. REGLA DE ORO: Columna "LOCAL" explícita del Cuadro de Cargas Normativo
  const localDirecto = aparato.local ? String(aparato.local).trim() : '';
  const locLower = localDirecto.toLowerCase();

  if (locLower) {
    if (locLower.includes('publi')) {
      return { negocioId: 'taller_publi_imperia', negocioNombre: 'Publi-Imperia' };
    }
    if (locLower.includes('costura')) {
      return { negocioId: 'taller_costura', negocioNombre: 'Taller de Costura Imperia' };
    }
    if (locLower.includes('bordad')) {
      return { negocioId: 'bordados_veracruz', negocioNombre: 'Bordados Veracruz' };
    }
    if (locLower.includes('papeler') || locLower.includes('arte')) {
      return { negocioId: 'papeleria_imperiarte', negocioNombre: 'Papelería ImperiArte' };
    }
    if (locLower.includes('hawaiian') || locLower.includes('paradise') || locLower.includes('hp')) {
      return { negocioId: 'hawaiian_paradise', negocioNombre: 'Hawaiian Paradise Universidades' };
    }
    if (locLower.includes('oficina') || locLower.includes('consorcio')) {
      return { negocioId: 'oficinas_consorcio', negocioNombre: 'Oficinas Consorcio' };
    }
    if (locLower.includes('servicio')) {
      return { negocioId: 'servicios_comunes', negocioNombre: 'Servicios Comunes' };
    }
    if (locLower.includes('uniforme') || (locLower.includes('imperia') && !locLower.includes('publi') && !locLower.includes('costura'))) {
      return { negocioId: 'imperia_uniformes', negocioNombre: 'Imperia Uniformes' };
    }
  }

  // 2. Si no viene definido el campo local, extraerlo de prefijos en tipo / modelo o ID de ingeniería
  const { local: localDeducido } = extraerLocalYTipoLimpio(aparato);
  const locDed = (localDeducido || '').toLowerCase();
  const idLower = String(aparato.id || '').toLowerCase();
  const raw = `${aparato.tipo || ''} ${aparato.modelo || ''} ${locDed} ${idLower}`.toLowerCase();

  if (locDed.includes('publi') || raw.includes('[publi') || raw.includes('publi-imperia') || raw.includes('publimperia') || idLower.startsWith('pi_') || raw.includes('sublimaci') || raw.includes('atomstack') || raw.includes('scanncut') || raw.includes('serigrafia') || raw.includes('htv ront')) {
    return { negocioId: 'taller_publi_imperia', negocioNombre: 'Publi-Imperia' };
  }
  if (locDed.includes('costura') || raw.includes('[costura') || idLower.startsWith('tc_') || raw.includes('recta industrial') || raw.includes('overlock') || raw.includes('collaretera')) {
    return { negocioId: 'taller_costura', negocioNombre: 'Taller de Costura Imperia' };
  }
  if (locDed.includes('bordad') || raw.includes('[bordad') || idLower.startsWith('bv_') || raw.includes('melco') || raw.includes('aemco') || raw.includes('tajima')) {
    return { negocioId: 'bordados_veracruz', negocioNombre: 'Bordados Veracruz' };
  }
  if (locDed.includes('papeler') || locDed.includes('arte') || raw.includes('[papeler') || idLower.startsWith('pap_') || raw.includes('docucolor') || raw.includes('xerox')) {
    return { negocioId: 'papeleria_imperiarte', negocioNombre: 'Papelería ImperiArte' };
  }
  if (locDed.includes('hawaiian') || locDed.includes('paradise') || raw.includes('[hawaiian') || idLower.startsWith('hp_') || raw.includes('crepera') || raw.includes('marquesit') || raw.includes('gaggia')) {
    return { negocioId: 'hawaiian_paradise', negocioNombre: 'Hawaiian Paradise Universidades' };
  }
  if (locDed.includes('oficina') || locDed.includes('consorcio') || raw.includes('[oficina') || raw.includes('[consorcio') || idLower.startsWith('oc_')) {
    return { negocioId: 'oficinas_consorcio', negocioNombre: 'Oficinas Consorcio' };
  }
  if (locDed.includes('servicio') || raw.includes('[servicio')) {
    return { negocioId: 'servicios_comunes', negocioNombre: 'Servicios Comunes' };
  }
  if (locDed.includes('uniforme') || raw.includes('[imperia') || idLower.startsWith('imp_') || raw.includes('showroom')) {
    return { negocioId: 'imperia_uniformes', negocioNombre: 'Imperia Uniformes' };
  }

  // 3. Fallback inteligente según medidorId para evitar mezclar negocios
  const medId = String(aparato.medidorId || '').toLowerCase();
  if (medId === 'med_2') return { negocioId: 'papeleria_imperiarte', negocioNombre: 'Papelería ImperiArte' };
  if (medId === 'med_3') return { negocioId: 'hawaiian_paradise', negocioNombre: 'Hawaiian Paradise Universidades' };
  if (medId === 'med_4') return { negocioId: 'bordados_veracruz', negocioNombre: 'Bordados Veracruz' };
  if (medId === 'med_5') return { negocioId: 'taller_costura', negocioNombre: 'Taller de Costura Imperia' };
  if (medId === 'med_6') return { negocioId: 'taller_publi_imperia', negocioNombre: 'Publi-Imperia' };

  return { negocioId: 'imperia_uniformes', negocioNombre: 'Imperia Uniformes' };
}

