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

  // Si aún no tiene local asignado, deducir por medidor o valor por defecto
  if (!local) {
    if (medidorNombre) {
      const lowerMed = medidorNombre.toLowerCase();
      if (lowerMed.includes('imperia') && !lowerMed.includes('publi')) local = 'Imperia Uniformes';
      else if (lowerMed.includes('papeler') || lowerMed.includes('arte')) local = 'Papelería ImperiArte';
      else if (lowerMed.includes('hawaiian')) local = 'Hawaiian Paradise Universidades';
      else if (lowerMed.includes('bordad')) local = 'Bordados Veracruz';
      else if (lowerMed.includes('costura')) local = 'Taller de Costura Imperia';
      else if (lowerMed.includes('publi')) local = 'Publi-Imperia';
      else if (lowerMed.includes('consorcio') || lowerMed.includes('oficina')) local = 'Oficinas Consorcio';
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
