// Adapter only: all electrical values come from the existing calculation engine.
export const WIRE_COLORS = { A: '#ec5960', B: '#45a8ef', C: '#b67cf0', N: '#f5f5ed', PE: '#37b66b' };

export const APPARATUS_LABEL_WIDTH = 300;
export const APPARATUS_LABEL_HEIGHT = 150;

export function wrapApparatusText(value, limit = 31) {
  const words = String(value || '').match(new RegExp(`.{1,${limit}}`, 'gu')) || [];
  // Wrap at word boundaries, but also handle long model numbers without overflow.
  const lines = [];
  let line = '';
  for (const word of String(value || '').split(/\s+/)) {
    if (word.length > limit) {
      if (line) lines.push(line);
      const chunks = word.match(new RegExp(`.{1,${limit}}`, 'gu')) || [];
      lines.push(...chunks.slice(0, -1));
      line = chunks.at(-1) || '';
    } else if (`${line} ${word}`.trim().length > limit) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines.length ? lines : words;
}

export function apparatusLabelHeight(load) {
  return APPARATUS_LABEL_HEIGHT + Math.max(0, wrapApparatusText(load.tipo).length - 2) * 18
    + Math.max(0, wrapApparatusText(load.modelo).length - 1) * 16;
}

export function apparatusIconType(load) {
  const name = `${load.tipo || ''} ${load.modelo || ''}`.toLowerCase();
  if (/cafetera|espresso/.test(name)) return 'coffee';
  if (/refrig|congel|fr[ií]o|hielo|vitrina/.test(name)) return 'fridge';
  if (/luz|alumbr|ilum|led|l[aá]mpara/.test(name)) return 'light';
  if (/pantalla|monitor|tpv|caja|comput|display/.test(name)) return 'monitor';
  if (/aire|extractor|ventilador/.test(name)) return 'fan';
  if (/horno|microondas/.test(name)) return 'oven';
  if (/licuadora|molino|batidora/.test(name)) return 'blender';
  if (/urna|calent|crepera|plancha/.test(name)) return 'heat';
  return 'plug';
}

export function circuitosToBreakers(circuitos = []) {
  return circuitos.map(c => ({
    id: c.loads ? c.id : `project-${c.id}`, aparatos: c.aparatos || [c.id], circuitoNumero: c.num,
    polos: c.tipoCarga === 'trifasica' ? 3 : c.tipoCarga === 'bifasica' ? 2 : 1,
    fase: c.fase, capacidad: c.breaker, vaTotal: c.va, icTotal: c.icCorr, conductor: c.conductor,
  }));
}

export function buildGabineteModel(breakers, circuitos, fases) {
  const byId = new Map(circuitos.flatMap(c => c.loads || [c]).map(c => [c.id, c]));
  return breakers.map(b => {
    const loads = (b.aparatos || []).map(id => byId.get(id)).filter(Boolean).map(c=>({...c,breaker:b.capacidad,conductor:b.conductor||c.conductor}));
    const phases = (b.fase || '').split('-').filter(f => fases.includes(f));
    const valid = [1, 2, 3].includes(b.polos) && phases.length === b.polos && new Set(phases).size === phases.length;
    // Same conductor convention as planoDocumentModel: 127 V L-N; multiphase L-L.
    // Explicit metadata takes precedence if a future project defines mixed loads.
    const neutral = typeof b.requiereNeutro === 'boolean' ? b.requiereNeutro
      : loads.some(c => c.requiereNeutro === true || c.tipoCarga === 'monofasica');
    return { ...b, loads, phases, valid, neutral, earth: loads.length > 0 && b.requiereTierra !== false,
      name: b.nombre || loads.map(c => c.tipo).join(' / ') || 'Reserva sin carga',
      // A grouped proposal has no calculated common feeder gauge in the current engine.
      gauge: b.conductor || (loads.length === 1 && loads[0].breaker === b.capacidad ? loads[0].conductor : null),
    };
  });
}

// This is a connection layout, NOT a manufacturer slot/bus sequence.
export function layoutGabinete(circuits, requestedSpaces = 12) {
  let rowY = 300;
  const used = circuits.reduce((sum, c) => sum + (c.polos || 1), 0);
  const lanes = Math.ceil(circuits.length / 2);
  const width = Math.max(1000, 900 + lanes * 20);
  const center = width / 2;
  const blockHeight = c => Math.max(Math.max(92, (c.polos || 1) * 34 + 28) + 60,
    (c.loads || []).reduce((sum, load) => sum + apparatusLabelHeight(load), 0) + 24);
  const placements = circuits.map((c, i) => {
    const side = i % 2;
    const height = Math.max(92, (c.polos || 1) * 34 + 28);
    const y = rowY;
    if (side === 1 || i === circuits.length - 1) {
      rowY += Math.max(blockHeight(c), side === 1 ? blockHeight(circuits[i - 1]) : 0);
    }
    return { ...c, side, y, height, neutralY: y - 43 - side * 12, x: side === 0 ? center - 205 : center + 75,
      lane: side === 0 ? 175 + Math.floor(i / 2) * 9 : width - 175 - Math.floor(i / 2) * 9,
      earthX: side === 0 ? 150 + Math.floor(i / 2) * 8 : width - 150 - Math.floor(i / 2) * 8,
      exit: side === 0 ? 38 : width - 38,
    };
  });
  const spare = Math.max(0, requestedSpaces - used);
  const bottom = rowY + (spare ? 74 : 0);
  const height = bottom + 155;
  return { width, height, center, bottom, placements, spare, used,
    overflow: Math.max(0, used - requestedSpaces),
    earthY: bottom + 66,
    neutralX: 132,
  };
}

export function circuitRoutes(c, layout) {
  const { center, neutralX, earthY } = layout;
  const inner = c.side === 0 ? c.x + 130 : c.x;
  const outer = c.side === 0 ? c.x : c.x + 130;
  const routes = [];
  if (!c.valid) return routes;
  c.phases.forEach((f, p) => {
    const y = c.y + 24 + p * 34;
    const busX = center - 24 + ['A', 'B', 'C'].indexOf(f) * 24;
    const busY = y + (c.side ? 9 : -9);
    routes.push({ role: f, d: `M ${busX} ${busY} L ${inner} ${y}`, hidden: true, terminal: [busX, busY] });
    if (c.loads.length) {
      const lane = c.lane + p * 9;
      const exitY = c.y - 27 + p * 7;
      const dir = c.side === 0 ? 1 : -1;
      routes.push({ role: f, d: `M ${outer} ${y} H ${lane + dir * 20} Q ${lane} ${y} ${lane} ${y - 20} V ${exitY + 16} Q ${lane} ${exitY} ${lane - dir * 16} ${exitY} H ${c.exit}` });
    }
  });
  if (c.neutral) routes.push({ role: 'N', d: `M ${neutralX} ${c.neutralY} H ${c.exit}` });
  // Right-hand neutrals run above the breaker, behind the insulated bus shroud.
  if (c.earth) {
    const x = c.earthX;
    const dir = c.side === 0 ? -1 : 1;
    routes.push({ role: 'PE', d: `M ${x} ${earthY} V ${c.y + 9} Q ${x} ${c.y - 11} ${x + dir * 20} ${c.y - 11} H ${c.exit}` });
  }
  return routes;
}
