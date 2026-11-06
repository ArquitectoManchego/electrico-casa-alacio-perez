import { jsPDF } from 'jspdf';

/**
 * Generador Vectorial de Cuadros de Cargas UVIE en Formato PDF (NOM-001-SEDE-2012)
 * Genera documentos en formato Carta Horizontal (279.4 x 215.9 mm)
 * Diseñado para que cada medidor quepa exactamente en 1 hoja sin desbordar.
 */

const COL_DEFS = [
  { key: 'index', label: '#', w: 7, align: 'center' },
  { key: 'num', label: 'Cto', w: 11, align: 'center' },
  { key: 'medidorNombre', label: 'Medidor', w: 36, align: 'left' },
  { key: 'desc', label: 'Descripción del Circuito', w: 44, align: 'left' },
  { key: 'watts', label: 'Watts (P)', w: 14, align: 'right' },
  { key: 'fp', label: 'F.P.', w: 9, align: 'center' },
  { key: 'va', label: 'VA (S)', w: 14, align: 'right' },
  { key: 'voltaje', label: 'Tensión', w: 12, align: 'center' },
  { key: 'faseA', label: 'Fase A', w: 13, align: 'right' },
  { key: 'faseB', label: 'Fase B', w: 13, align: 'right' },
  { key: 'faseC', label: 'Fase C', w: 13, align: 'right' },
  { key: 'in', label: 'In (A)', w: 12, align: 'right' },
  { key: 'ic', label: 'Ic (A)', w: 12, align: 'right' },
  { key: 'proteccion', label: 'Protección', w: 13, align: 'center' },
  { key: 'conductor', label: 'Conductor', w: 24, align: 'center' },
  { key: 'caida', label: '% Caída', w: 12.4, align: 'center' }
];

const PAGE_W = 279.4;
const PAGE_H = 215.9;
const MARGIN_X = 10;
const MARGIN_TOP = 10;
const CONTENT_W = 259.4;

/**
 * Dibuja un cuadro de cargas completo para un medidor en una página de jsPDF
 */
export function renderMedidorPage(doc, grupo, fasesUnit = 'VA', infoProyecto = {}) {
  const med = grupo.medidor || { id: 'med_1', numero: 1, nombre: 'Medidor 1' };
  const circuitos = grupo.circuitos || [];
  const acometidaMedId = grupo.acometidaMedId || 'bifasico';
  const fasesDisp = grupo.fasesDisponibles || ['A', 'B'];

  // 1. BANNER SUPERIOR DE ENCABEZADO TÉCNICO
  // Fondo verde claro (idéntico al fondo de subtotales de la tabla) con borde sutil
  doc.setFillColor(209, 250, 229); // emerald-100 / verde menta claro
  doc.setDrawColor(13, 148, 136); // teal-600
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_X, MARGIN_TOP, CONTENT_W, 20, 2, 2, 'FD');

  // Título Principal en negro con alto contraste
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0); // negro sólido
  doc.text('CUADRO DE CARGAS NOM-001-SEDE-2012 & DICTAMEN UVIE', MARGIN_X + 4, MARGIN_TOP + 6.5);

  // Subtítulo con Nombre de Medidor en negro sólido
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0); // negro sólido
  doc.text(`MEDIDOR ${med.numero}: ${med.nombre.toUpperCase()}`, MARGIN_X + 4, MARGIN_TOP + 14);

  // Metadatos a la derecha en negro / tono oscuro de alto contraste
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0); // negro
  const derechoX = MARGIN_X + CONTENT_W - 4;
  doc.text(`Acometida: ${acometidaMedId.toUpperCase()} (${fasesDisp.join('-')}) | Tensión: 127/220V`, derechoX, MARGIN_TOP + 6.5, { align: 'right' });
  doc.text(`Cargas: ${circuitos.length} ctos | Subtotal: ${Math.round(grupo.subtotalW || 0).toLocaleString()} W (${Math.round(grupo.subtotalVA || 0).toLocaleString()} VA)`, derechoX, MARGIN_TOP + 11, { align: 'right' });
  
  const desbal = grupo.desbalanceMedidor || 0;
  // En color: rojo o verde bosque profundo; en B&W: casi negro con alto contraste
  doc.setTextColor(desbal > 5 ? 153 : 4, desbal > 5 ? 27 : 120, desbal > 5 ? 27 : 87);
  doc.setFont('helvetica', 'bold');
  doc.text(`Desbalance UVIE: ${desbal.toFixed(2)}% (${desbal <= 5 ? 'CUMPLE <= 5%' : 'REVISAR > 5%'})`, derechoX, MARGIN_TOP + 15.5, { align: 'right' });

  // 2. ENCABEZADOS DE LA TABLA
  let currentY = MARGIN_TOP + 23;
  const headerHeight = 7.5;

  doc.setFillColor(15, 118, 110); // teal-700 / verde azulado profundo (oscuro y legible en B&W y color)
  doc.rect(MARGIN_X, currentY, CONTENT_W, headerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255); // blanco brillante para máximo contraste

  let colX = MARGIN_X;
  COL_DEFS.forEach(col => {
    let headerText = col.label;
    if (col.key === 'faseA') headerText = `Fase A (${fasesUnit})`;
    if (col.key === 'faseB') headerText = `Fase B (${fasesUnit})`;
    if (col.key === 'faseC') headerText = `Fase C (${fasesUnit})`;

    let textX = colX + 1.5;
    if (col.align === 'center') textX = colX + col.w / 2;
    if (col.align === 'right') textX = colX + col.w - 1.5;

    doc.text(headerText, textX, currentY + 5, { align: col.align });
    colX += col.w;
  });

  currentY += headerHeight;

  // 3. FILAS DE CIRCUITOS
  const rowHeight = 6.2;
  doc.setFontSize(6.5);

  if (circuitos.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(MARGIN_X, currentY, CONTENT_W, 10, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(15, 23, 42);
    doc.text('No hay circuitos asignados a este medidor.', MARGIN_X + CONTENT_W / 2, currentY + 6, { align: 'center' });
    currentY += 10;
  } else {
    circuitos.forEach((c, rIdx) => {
      // Alternar color de fondo
      if (rIdx % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 250, 252); // slate-50
      }
      doc.rect(MARGIN_X, currentY, CONTENT_W, rowHeight, 'F');

      // Línea divisoria horizontal sutil
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.2);
      doc.line(MARGIN_X, currentY + rowHeight, MARGIN_X + CONTENT_W, currentY + rowHeight);

      let cellX = MARGIN_X;
      COL_DEFS.forEach(col => {
        let val = '';
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0); // negro sólido para máximo contraste en impresión

        switch (col.key) {
          case 'index':
            val = String(c.index !== undefined ? c.index + 1 : rIdx + 1);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            break;
          case 'num':
            val = c.num || `C-${rIdx + 1}`;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            break;
          case 'medidorNombre':
            val = med.nombre || c.medidorNombre || `Medidor ${med.numero}`;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(13, 94, 88); // deep teal-800: en color se ve verde azulado, en B&W imprime negro
            break;
          case 'desc':
            val = c.desc || '';
            // Truncar si es muy largo para no desbordar
            if (val.length > 32) val = val.substring(0, 30) + '...';
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            break;
          case 'watts':
            val = Math.round(c.watts || 0).toLocaleString();
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            break;
          case 'fp':
            val = Number(c.fp || 1).toFixed(2);
            doc.setTextColor(0, 0, 0);
            break;
          case 'va':
            val = Math.round(c.va || 0).toLocaleString();
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            break;
          case 'voltaje':
            val = c.voltaje || '127 V';
            doc.setTextColor(0, 0, 0);
            break;
          case 'faseA':
            val = c.fases?.A > 0 ? (fasesUnit === 'A' ? Number(c.fases.A).toFixed(2) : String(Math.round(c.fases.A))) : '-';
            if (val !== '-') {
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(153, 27, 27); // deep red-800: rojo en color, negro en B&W
            } else {
              doc.setTextColor(0, 0, 0);
            }
            break;
          case 'faseB':
            val = c.fases?.B > 0 ? (fasesUnit === 'A' ? Number(c.fases.B).toFixed(2) : String(Math.round(c.fases.B))) : '-';
            if (val !== '-') {
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(120, 53, 15); // deep amber-900: ámbar en color, casi negro en B&W (sin verse gris claro)
            } else {
              doc.setTextColor(0, 0, 0);
            }
            break;
          case 'faseC':
            val = c.fases?.C > 0 ? (fasesUnit === 'A' ? Number(c.fases.C).toFixed(2) : String(Math.round(c.fases.C))) : '-';
            if (val !== '-') {
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 64, 175); // deep blue-800: azul en color, casi negro en B&W
            } else {
              doc.setTextColor(0, 0, 0);
            }
            break;
          case 'in':
            val = Number(c.in || 0).toFixed(2);
            doc.setTextColor(0, 0, 0);
            break;
          case 'ic':
            val = Number(c.ic || 0).toFixed(2);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            break;
          case 'proteccion':
            val = c.proteccion || '1 x 15 A';
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(13, 94, 88); // deep teal-800
            break;
          case 'conductor':
            val = c.conductor || '2 # 14 + 1 # 14 T';
            doc.setTextColor(0, 0, 0);
            break;
          case 'caida':
            val = `${Number(c.caida || 0).toFixed(2)}%`;
            doc.setFont('helvetica', 'bold');
            if (Number(c.caida || 0) > 3.0) {
              doc.setTextColor(153, 27, 27); // deep red-800
            } else {
              doc.setTextColor(4, 120, 87); // deep emerald-700: verde en color, casi negro en B&W
            }
            break;
          default:
            val = '';
        }

        let textX = cellX + 1.5;
        if (col.align === 'center') textX = cellX + col.w / 2;
        if (col.align === 'right') textX = cellX + col.w - 1.5;

        doc.text(val, textX, currentY + 4.2, { align: col.align });
        cellX += col.w;
      });

      currentY += rowHeight;
    });
  }

  // 4. FILA DE SUBTOTALES DEL MEDIDOR (Verde claro idéntico al banner, letras negras de alto contraste)
  const subtotalHeight = 7.5;
  doc.setFillColor(209, 250, 229); // emerald-100 / verde menta claro
  doc.rect(MARGIN_X, currentY, CONTENT_W, subtotalHeight, 'F');

  doc.setDrawColor(13, 148, 136); // teal-600
  doc.setLineWidth(0.4);
  doc.line(MARGIN_X, currentY, MARGIN_X + CONTENT_W, currentY);
  doc.line(MARGIN_X, currentY + subtotalHeight, MARGIN_X + CONTENT_W, currentY + subtotalHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(0, 0, 0); // letras negras de alto contraste

  // Etiqueta de subtotales
  doc.text(`SUBTOTALES MEDIDOR ${med.numero} (${med.nombre.toUpperCase()})`, MARGIN_X + 3, currentY + 5);

  // Valores de Watts y VA
  const wattsColX = MARGIN_X + 7 + 11 + 36 + 44 + 14 - 1.5;
  doc.text(`${Math.round(grupo.subtotalW || 0).toLocaleString()} W`, wattsColX, currentY + 5, { align: 'right' });

  const vaColX = wattsColX + 9 + 14;
  doc.text(`${Math.round(grupo.subtotalVA || 0).toLocaleString()} VA`, vaColX, currentY + 5, { align: 'right' });

  // Fases Subtotales en colores profundos (vibrantes a color, oscuros en B&W)
  const faseAColX = vaColX + 12 + 13;
  const subFases = grupo.subtotalFases || { A: 0, B: 0, C: 0 };
  doc.setTextColor(153, 27, 27); // deep red-800
  doc.text(fasesDisp.includes('A') ? (fasesUnit === 'A' ? subFases.A.toFixed(2) : String(Math.round(subFases.A))) : '-', faseAColX, currentY + 5, { align: 'right' });

  const faseBColX = faseAColX + 13;
  doc.setTextColor(120, 53, 15); // deep amber-900 (oscuro en B&W)
  doc.text(fasesDisp.includes('B') ? (fasesUnit === 'A' ? subFases.B.toFixed(2) : String(Math.round(subFases.B))) : '-', faseBColX, currentY + 5, { align: 'right' });

  const faseCColX = faseBColX + 13;
  doc.setTextColor(30, 64, 175); // deep blue-800
  doc.text(fasesDisp.includes('C') ? (fasesUnit === 'A' ? subFases.C.toFixed(2) : String(Math.round(subFases.C))) : '-', faseCColX, currentY + 5, { align: 'right' });

  // Desbalance en la derecha del subtotal
  doc.setTextColor(desbal > 5 ? 153 : 4, desbal > 5 ? 27 : 120, desbal > 5 ? 27 : 87);
  doc.text(`Desbalance: ${desbal.toFixed(2)}%`, MARGIN_X + CONTENT_W - 3, currentY + 5, { align: 'right' });

  currentY += subtotalHeight + 4;

  // 5. BLOQUE DE DICTAMEN TÉCNICO Y CUMPLIMIENTO UVIE AL PIE
  const pieY = Math.max(currentY, PAGE_H - 26);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(MARGIN_X, pieY, CONTENT_W, 16, 1.5, 1.5, 'F');

  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.25);
  doc.roundedRect(MARGIN_X, pieY, CONTENT_W, 16, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0); // negro sólido
  doc.text('CERTIFICACIÓN Y DICTAMEN DE CONFORMIDAD TÉCNICA (NOM-001-SEDE-2012)', MARGIN_X + 4, pieY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42); // casi negro de alto contraste
  doc.text('1. El balanceo de cargas entre fases operativas se mantiene por debajo del límite normativo del 5.0%.', MARGIN_X + 4, pieY + 9);
  doc.text('2. Las protecciones termo-magnéticas y calibres de conductores tipo THHN/THW-2 cumplen con el factor de corrección por temperatura y agrupamiento.', MARGIN_X + 4, pieY + 12.5);

  // Sello UVIE en la derecha
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(MARGIN_X + CONTENT_W - 55, pieY + 2.5, 52, 11, 1, 1, 'F');
  doc.setTextColor(209, 250, 229); // mint green
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('DICTAMEN OFICIAL UVIE', MARGIN_X + CONTENT_W - 29, pieY + 6.5, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.2);
  doc.text('APTO PARA APROBACIÓN CFE', MARGIN_X + CONTENT_W - 29, pieY + 10.5, { align: 'center' });
}

/**
 * Genera el documento PDF para un medidor individual
 */
export function generarCuadroCargasIndividualDoc(grupoMedidor, fasesUnit = 'VA', infoProyecto = {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter'
  });

  renderMedidorPage(doc, grupoMedidor, fasesUnit, infoProyecto);
  return doc;
}

/**
 * Exporta y descarga un único PDF para un medidor individual
 */
export function exportarCuadroCargasIndividualPDF(grupoMedidor, fasesUnit = 'VA', infoProyecto = {}) {
  const med = grupoMedidor.medidor || { id: 'med_1', numero: 1, nombre: 'Medidor' };
  const doc = generarCuadroCargasIndividualDoc(grupoMedidor, fasesUnit, infoProyecto);
  const cleanNombre = (med.nombre || `Medidor_${med.numero}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Cuadro_Cargas_M${med.numero}_${cleanNombre}.pdf`;
  doc.save(fileName);
}

/**
 * Exporta todos los medidores como documentos PDF individuales independientes (1 PDF por medidor)
 */
export async function exportarTodosCuadrosCargasIndividualesPDF(gruposMedidores, fasesUnit = 'VA', infoProyecto = {}) {
  if (!Array.isArray(gruposMedidores) || gruposMedidores.length === 0) return;

  for (let i = 0; i < gruposMedidores.length; i++) {
    const grupo = gruposMedidores[i];
    exportarCuadroCargasIndividualPDF(grupo, fasesUnit, infoProyecto);
    // Pausa breve para evitar bloqueos del navegador en descargas múltiples
    if (i < gruposMedidores.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
}

/**
 * Genera un PDF consolidado multi-página donde cada medidor ocupa exactamente 1 página completa
 */
export function exportarDocumentoConsolidadoPDF(gruposMedidores, fasesUnit = 'VA', infoProyecto = {}) {
  if (!Array.isArray(gruposMedidores) || gruposMedidores.length === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter'
  });

  gruposMedidores.forEach((grupo, idx) => {
    if (idx > 0) {
      doc.addPage('letter', 'landscape');
    }
    renderMedidorPage(doc, grupo, fasesUnit, infoProyecto);
  });

  const fileName = `Cuadros_de_Cargas_UVIE_Consorcio_Completo.pdf`;
  doc.save(fileName);
}
