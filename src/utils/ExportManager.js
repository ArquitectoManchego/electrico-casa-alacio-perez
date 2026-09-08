import { 
  calcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor 
} from './ecuacionesUVIE';

/**
 * Genera y descarga un archivo CSV estructurado para AutoCAD Data Link.
 * Columnas: Cto, Descripción, Fase A VA, Fase B VA, Fase C VA, I Corregida, Protección, Conductor
 */
export function exportarCSVAutoCAD(aparatos, acometidaId, fasesDisponibles) {
  if (aparatos.length === 0) return;

  const cabeceras = [
    'Cto',
    'Descripcion',
    'Fase A VA',
    'Fase B VA',
    'Fase C VA',
    'I Corregida (A)',
    'Proteccion',
    'Conductor'
  ];

  const filas = [];
  const totalesVA = { A: 0, B: 0, C: 0 };

  aparatos.forEach((ap, index) => {
    const ctoId = `C-${index + 1}`;
    const desc = `${ap.tipo} ${ap.modelo ? `(${ap.modelo})` : ''}`.replace(/,/g, ' '); // Evitar romper el formato CSV
    const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
    
    // Distribución por Fase
    const vaFila = { A: 0, B: 0, C: 0 };
    if (acometidaId === 'monofasico') {
      vaFila.A = va;
    } else if (ap.tipoCarga === 'trifasica' && acometidaId === 'trifasico') {
      vaFila.A = va / 3;
      vaFila.B = va / 3;
      vaFila.C = va / 3;
    } else if (ap.tipoCarga === 'bifasica' && (acometidaId === 'bifasico' || acometidaId === 'trifasico')) {
      const fasePar = ap.fase || 'A-B';
      const partes = fasePar.split('-');
      partes.forEach(f => {
        if (vaFila[f] !== undefined) {
          vaFila[f] = va / partes.length;
        }
      });
    } else {
      let f = ap.fase;
      if (!fasesDisponibles.includes(f)) {
        f = 'A';
      }
      vaFila[f] = va;
    }

    // Acumular Totales
    totalesVA.A += vaFila.A;
    totalesVA.B += vaFila.B;
    totalesVA.C += vaFila.C;

    // Corrientes y Dimensionamientos
    const inominal = calcularCorrienteNominal(va, acometidaId === 'monofasico' ? 'monofasica' : ap.tipoCarga);
    const icorregida = calcularCorrienteCorregida(inominal);
    const proteccion = seleccionarProteccion(icorregida);
    const conductor = seleccionarConductor(proteccion);

    // Agregar fila
    filas.push([
      ctoId,
      desc,
      Math.round(vaFila.A),
      Math.round(vaFila.B),
      Math.round(vaFila.C),
      icorregida.toFixed(2),
      `${proteccion}A`,
      conductor
    ]);
  });

  // Fila de Totales
  filas.push([
    'TOTALES',
    'Carga Residencial Acumulada',
    Math.round(totalesVA.A),
    Math.round(totalesVA.B),
    Math.round(totalesVA.C),
    '',
    '',
    ''
  ]);

  // Convertir a string CSV
  const csvContent = [
    cabeceras.join(','),
    ...filas.map(e => e.join(','))
  ].join('\n');

  // Trigger descarga
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Cuadro_Cargas_${acometidaId}_AutoCAD.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Dispara el diálogo de impresión para el reporte corporativo UVIE.
 */
export function exportarReporteUVIE() {
  window.print();
}
