import { 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor 
} from './ecuacionesUVIE.js';
import { distribuirCargaPorFases } from './electricalCalculations.js';

/**
 * Genera y descarga un archivo CSV estructurado para AutoCAD Data Link.
 * Columnas: Cto, Descripción, Fase A VA, Fase B VA, Fase C VA, I Corregida, Protección, Conductor
 */
export function exportarCSVAutoCAD(aparatos, acometidaId, fasesDisponibles, medidores = [], medidoresData = {}) {
  if (!Array.isArray(aparatos) || aparatos.length === 0) return;

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
  const tieneMedidores = Array.isArray(medidores) && medidores.length > 0;
  const acometidaFallback = {
    id: acometidaId || 'monofasico',
    fasesDisponibles: Array.isArray(fasesDisponibles) && fasesDisponibles.length > 0 ? fasesDisponibles : ['A']
  };

  aparatos.forEach((ap, index) => {
    const ctoId = `C-${index + 1}`;
    const medId = tieneMedidores ? (ap.medidorId || medidores[0]?.id) : null;
    const medObj = tieneMedidores ? medidores.find(m => m.id === medId) : null;
    const prefijoMed = (tieneMedidores && medidores.length > 1 && medObj) ? `[M${medObj.numero}] ` : '';
    const desc = `${prefijoMed}${ap.tipo} ${ap.modelo ? `(${ap.modelo})` : ''}`.replace(/,/g, ' ').trim();

    const acometidaDeAp = (medId && medidoresData && medidoresData[medId]?.acometida)
      ? medidoresData[medId].acometida
      : acometidaFallback;
    const fDisp = acometidaDeAp.fasesDisponibles || ['A'];

    const dist = distribuirCargaPorFases(ap, acometidaDeAp);
    const va = dist.va;
    const vaFila = dist.fVA;

    // Acumular Totales
    totalesVA.A += vaFila.A;
    totalesVA.B += vaFila.B;
    totalesVA.C += vaFila.C;

    // Corrientes y Dimensionamientos según fases reales habilitadas del medidor
    const tipoEfectivo = fDisp.length <= 1
      ? 'monofasica'
      : (ap.tipoCarga === 'trifasica' && fDisp.length < 3 ? 'bifasica' : (ap.tipoCarga || 'monofasica'));
    const inominal = calcularCorrienteNominal(va, tipoEfectivo);
    const icorregida = calcularCorrienteCorregida(inominal);
    const autoProteccion = seleccionarProteccion(icorregida);
    const proteccion = ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? parseInt(ap.overrideBreaker) : autoProteccion;
    const autoConductor = seleccionarConductor(proteccion);
    const conductor = ap.overrideCable && ap.overrideCable !== 'Auto' ? ap.overrideCable : autoConductor;

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
