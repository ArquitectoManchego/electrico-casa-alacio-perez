// Shared SVG/DXF composition. Coordinates are sheet coordinates, Y down.
// No conductor sizing: every specification is read from the document model.
export function buildSupplyScene(model) {
  const a = model.alimentador;
  const t = model.totales;
  const items = [];
  const text = (x, y, value, size = 12, width = 430) => {
    const max = Math.floor(width / (size * .75));
    const words = String(value).split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      if (line && `${line} ${word}`.length > max) { lines.push(line); line = ''; }
      if (word.length > max) {
        if (line) { lines.push(line); line = ''; }
        const chunks = word.match(new RegExp(`.{1,${max}}`, 'g')) || [];
        lines.push(...chunks.slice(0, -1));
        line = chunks.at(-1) || '';
      } else line = `${line} ${word}`.trim();
    }
    if (line) lines.push(line);
    lines.forEach((value, i) => items.push({ type: 'text', x, y: y + i * (size + 7), value, size, maxWidth: width }));
    return y + lines.length * (size + 7);
  };
  const line = (x1,y1,x2,y2) => items.push({type:'line',x1,y1,x2,y2});
  const circle = (cx,cy,r) => items.push({type:'circle',cx,cy,r});
  text(120, 250, 'ACOMETIDA DE LA COMPAÑÍA', 13, 270);
  text(120, 272, 'SUMINISTRADORA (CFE)', 13, 270);
  text(120, 296, `Sistema: ${a.sistema}`, 12, 245);
  text(120, 318, `Tensión: ${a.tension}`, 12, 245);
  text(120, 340, `Frecuencia: ${a.frecuencia}`, 12, 245);
  // Supply break / arrow, without inventing a transformer or primary voltage.
  line(375,320,395,320); line(395,320,408,282); line(408,282,408,354); line(408,354,421,320); line(421,320,485,320);
  items.push({type:'triangle',points:[[476,320],[459,313],[459,327]]});
  items.push({type:'rect',x:485,y:299,w:52,h:42});
  items.push({type:'meterArc',x:485,y:299,w:52,h:16});
  text(498,329,'Wh',12,35);
  text(468,367,'EQUIPO DE MEDICIÓN',10,140);
  line(537,320,647,320);
  items.push({type:'breaker',cx:665,cy:320,r:18}); circle(647,320,2.6); circle(683,320,2.6);
  text(611,272,'INTERRUPTOR GENERAL',11,180);
  text(633,293,a.breakerStr,12,130);
  text(604,356,`Cap. interruptiva: ${a.kaic}`,10,220);
  line(683,320,950,320); line(950,320,950,270); line(950,270,1100,270);
  let y = 415;
  y = text(560,y,'ALIMENTADOR GENERAL · CALIBRE DE PROYECTO',13,475) + 9;
  for (const value of [
    `FASES: ${a.conductorFases}`,
    `NEUTRO: ${a.conductorNeutro} · TIERRA: ${a.conductorTierra}`,
    `AISLAMIENTO: ${a.tipoAislamiento || 'Por definir'}`,
    `CANALIZACIÓN: ${a.canalizacion} · ${a.canalizacionTipo}`,
    `L = ${a.longitudMetros} m · In = ${t.corrienteNominalAlimentador} A · Ic = ${t.corrienteDisenoAlimentador} A`,
    `CAÍDA DE TENSIÓN: ${Number(a.caidaPct).toFixed(2)}%`,
    `I L1 = ${t.corrienteL1} A · I L2 = ${t.corrienteL2} A · I N = ${t.corrienteNeutro} A`,
  ]) y = text(560,y,value,12,475) + 4;
  y += 16;
  const fmt = n => Number(n).toLocaleString('es-MX',{maximumFractionDigits:2});
  y = text(560,y,`CARGA TOTAL: ${fmt(t.totalWatts)} W · ${fmt(t.totalVA)} VA`,13,475) + 9;
  y = text(560,y,`CARGA DEMANDADA AL ${t.factorDemandaPct}%: ${fmt(t.cargaDemandadaWatts)} W`,13,475) + 9;
  if (t.factorDemandaPct !== 75) {
    y = text(560,y,`REFERENCIA AL 75%: ${fmt(t.totalWatts * .75)} W`,12,475) + 4;
    y = text(560,y,'Escenario informativo; no aplicado al dimensionamiento.',10,475) + 6;
  }
  text(560,y,'El calibre mostrado conserva el cálculo del proyecto; el factor de demanda no lo reduce automáticamente.',10,475);
  text(120,620,'DISTRIBUCIÓN DE CARGA',13,380);
  text(120,650,`L1: ${fmt(t.faseL1_VA)} VA · L2: ${fmt(t.faseL2_VA)} VA`,12,380);
  if(a.polos>2) text(120,675,`L3: ${fmt(t.faseL3_VA)} VA`,12,380);
  text(120,710,`DESBALANCE ENTRE FASES: ${t.desbalancePct}%`,12,380);
  return items;
}
