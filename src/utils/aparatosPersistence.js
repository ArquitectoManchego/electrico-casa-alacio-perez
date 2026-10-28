// Preserve apparatus identity and circuit order when saving a distribution.
export function planAparatosWrite(existingIds, aparatos) {
  const ids = new Set();
  const writes = aparatos.map((ap, index) => {
    if (typeof ap.id !== 'string' || !ap.id || ap.id.includes('/') || ids.has(ap.id)) {
      throw new Error('Identificador de aparato inválido o duplicado.');
    }
    ids.add(ap.id);
    const { id, ...data } = ap;
    return { id, data: { ...data, ordenCircuito: index } };
  });
  return { writes, deletes: existingIds.filter(id => !ids.has(id)) };
}

export function ordenarAparatosPersistidos(aparatos) {
  return [...aparatos].sort((a,b) => (a.ordenCircuito ?? Number.MAX_SAFE_INTEGER) - (b.ordenCircuito ?? Number.MAX_SAFE_INTEGER));
}
