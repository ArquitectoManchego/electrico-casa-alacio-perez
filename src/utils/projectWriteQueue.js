const pending = new Map();

// Preserve edit order while Firebase is slow; different projects remain independent.
export function enqueueProjectWrite(projectId, write) {
  const previous = pending.get(projectId) || Promise.resolve();
  const next = previous.catch(() => {}).then(write);
  pending.set(projectId, next);
  const cleanup = () => { if (pending.get(projectId) === next) pending.delete(projectId); };
  next.then(cleanup, cleanup);
  return next;
}
