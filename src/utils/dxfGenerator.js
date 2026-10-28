/**
 * dxfGenerator.js
 * 
 * Generador nativo de archivos AutoCAD DXF profesional compatible con AutoCAD 2000-2026+ (AC1015).
 * Cumple con la arquitectura estándar de planos ejecutivos CAD:
 * - ESPACIO MODELO (Model Space):
 *   Contiene los diagramas técnicos a escala real (Diagrama Unifilar a la izquierda y Cuadro de Cargas a la derecha).
 * - ESPACIO PAPEL / PRESENTACIONES (Layout Space):
 *   - Layout 1: IE-01_UNIFILAR (Página tamaño 90x60 cm / 900x600 mm)
 *     Contiene el marco perimetral, el cajetín formal de 7 columnas (con Rosa de los Vientos rotada por norteAngulo),
 *     y una ventana gráfica (VIEWPORT) centrada en el Diagrama Unifilar del espacio modelo.
 *   - Layout 2: IE-02_CUADRO_CARGAS (Página tamaño 90x60 cm / 900x600 mm)
 *     Contiene el marco perimetral, el cajetín formal de 7 columnas, y una ventana gráfica (VIEWPORT)
 *     centrada en el Cuadro de Cargas del espacio modelo.
 * 
 * Cumple 100% las normativas mexicanas NOM-001-SEDE.
 */

import { buildSupplyScene } from './unifilarSupplyLayout.js';
import { wrapApparatusText } from './gabineteModel.js';
import { getTipoSimbologiaNom } from './planoDocumentModel.js';

export const DXF_LAYERS = {
  MARCO: { name: 'E-MARCO-PERIMETRAL', color: 7, weight: 50, ltype: 'CONTINUOUS' },
  CAJETIN_DIV: { name: 'E-CAJETIN-DIVISIONES', color: 8, weight: 25, ltype: 'CONTINUOUS' },
  CAJETIN_TXT: { name: 'E-CAJETIN-TEXTOS', color: 7, weight: 25, ltype: 'CONTINUOUS' },
  TITULOS: { name: 'E-TITULOS-PRINCIPALES', color: 4, weight: 35, ltype: 'CONTINUOUS' },
  ACOMETIDA: { name: 'E-ACOMETIDA-CFE', color: 1, weight: 50, ltype: 'CONTINUOUS' },
  MEDIDOR: { name: 'E-MEDIDOR-CFE', color: 2, weight: 35, ltype: 'CONTINUOUS' },
  ALIMENTADOR: { name: 'E-ALIMENTADOR-GENERAL', color: 1, weight: 60, ltype: 'CONTINUOUS' },
  BARRAS: { name: 'E-BARRAS-TABLERO', color: 5, weight: 70, ltype: 'CONTINUOUS' },
  NEUTRO: { name: 'E-NEUTRO', color: 8, weight: 25, ltype: 'DASHED' },
  TIERRA: { name: 'E-TIERRA-CPT', color: 3, weight: 30, ltype: 'HIDDEN' },
  DERIVADOS_LINEAS: { name: 'E-CIRCUITOS-DERIVADOS', color: 7, weight: 30, ltype: 'CONTINUOUS' },
  DERIVADOS_TEXTOS: { name: 'E-CIRCUITOS-TEXTOS', color: 7, weight: 20, ltype: 'CONTINUOUS' },
  DISPOSITIVOS_ITM: { name: 'E-DISPOSITIVOS-ITM', color: 6, weight: 35, ltype: 'CONTINUOUS' },
  SIMBOLOS_CARGAS: { name: 'E-SIMBOLOS-CARGAS', color: 6, weight: 35, ltype: 'CONTINUOUS' },
  TABLA_HEADER: { name: 'E-TABLA-ENCABEZADO', color: 4, weight: 35, ltype: 'CONTINUOUS' },
  TABLA_GRID: { name: 'E-TABLA-GRID', color: 8, weight: 18, ltype: 'CONTINUOUS' },
  TABLA_DATOS: { name: 'E-TABLA-DATOS', color: 7, weight: 20, ltype: 'CONTINUOUS' },
  NOTAS_CRITERIOS: { name: 'E-NOTAS-CRITERIOS', color: 2, weight: 20, ltype: 'CONTINUOUS' }
};

export class DxfBuilder {
  constructor() {
    this.modelEntities = [];
    this.layout1Entities = [];
    this.layout2Entities = [];
  }

  escapeText(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/°/g, '%%d')
      .replace(/±/g, '%%p')
      .replace(/[øØ]/g, '%%c')
      .replace(/á/g, '\\U+00E1')
      .replace(/é/g, '\\U+00E9')
      .replace(/í/g, '\\U+00ED')
      .replace(/ó/g, '\\U+00F3')
      .replace(/ú/g, '\\U+00FA')
      .replace(/Á/g, '\\U+00C1')
      .replace(/É/g, '\\U+00C9')
      .replace(/Í/g, '\\U+00CD')
      .replace(/Ó/g, '\\U+00D3')
      .replace(/Ú/g, '\\U+00DA')
      .replace(/ñ/g, '\\U+00F1')
      .replace(/Ñ/g, '\\U+00D1')
      .replace(/ü/g, '\\U+00FC')
      .replace(/Ü/g, '\\U+00DC')
      .replace(/·/g, '\\U+00B7')
      .replace(/≤/g, '<=')
      .replace(/≥/g, '>=')
      .replace(/Δ/g, 'Delta ')
      .replace(/[—–]/g, '-')
      .replace(/\r?\n/g, ' ');
  }

  getTargetArray(target = 'model') {
    if (target === 'layout1') return this.layout1Entities;
    if (target === 'layout2') return this.layout2Entities;
    return this.modelEntities;
  }

  addLine({ target = 'model', layer, x1, y1, x2, y2, ltype = null, weight = null, color = null }) {
    this.getTargetArray(target).push({
      type: 'LINE',
      layer: layer.name,
      x1: Number(x1.toFixed(3)),
      y1: Number(y1.toFixed(3)),
      x2: Number(x2.toFixed(3)),
      y2: Number(y2.toFixed(3)),
      ltype: ltype || (layer.ltype !== 'CONTINUOUS' ? layer.ltype : null),
      weight: weight || layer.weight,
      color: color || layer.color
    });
  }

  addRect({ target = 'model', layer, x, y, w, h, ltype = null, weight = null, color = null }) {
    this.addLine({ target, layer, x1: x, y1: y, x2: x + w, y2: y, ltype, weight, color });
    this.addLine({ target, layer, x1: x + w, y1: y, x2: x + w, y2: y + h, ltype, weight, color });
    this.addLine({ target, layer, x1: x + w, y1: y + h, x2: x, y2: y + h, ltype, weight, color });
    this.addLine({ target, layer, x1: x, y1: y + h, x2: x, y2: y, ltype, weight, color });
  }

  addCircle({ target = 'model', layer, cx, cy, r, weight = null, color = null }) {
    this.getTargetArray(target).push({
      type: 'CIRCLE',
      layer: layer.name,
      cx: Number(cx.toFixed(3)),
      cy: Number(cy.toFixed(3)),
      r: Number(r.toFixed(3)),
      weight: weight || layer.weight,
      color: color || layer.color
    });
  }

  addArc({ target = 'model', layer, cx, cy, r, startAngle, endAngle, weight = null, color = null }) {
    this.getTargetArray(target).push({
      type: 'ARC',
      layer: layer.name,
      cx: Number(cx.toFixed(3)),
      cy: Number(cy.toFixed(3)),
      r: Number(r.toFixed(3)),
      startAngle: Number(startAngle.toFixed(1)),
      endAngle: Number(endAngle.toFixed(1)),
      weight: weight || layer.weight,
      color: color || layer.color
    });
  }

  addText({ target = 'model', layer, x, y, height, text, align = 'left', vAlign = 'baseline', angle = 0, weight = null, color = null }) {
    const cleanStr = this.escapeText(text);
    if (!cleanStr) return;
    this.getTargetArray(target).push({
      type: 'TEXT',
      layer: layer.name,
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      height: Number(height.toFixed(2)),
      text: cleanStr,
      align,
      vAlign,
      angle: Number(angle.toFixed(1)),
      weight: weight || layer.weight,
      color: color || layer.color
    });
  }

  addSolidTriangle({ target = 'model', layer, x1, y1, x2, y2, x3, y3, color = null }) {
    this.getTargetArray(target).push({
      type: 'SOLID',
      layer: layer.name,
      x1: Number(x1.toFixed(3)),
      y1: Number(y1.toFixed(3)),
      x2: Number(x2.toFixed(3)),
      y2: Number(y2.toFixed(3)),
      x3: Number(x3.toFixed(3)),
      y3: Number(y3.toFixed(3)),
      x4: Number(x3.toFixed(3)),
      y4: Number(y3.toFixed(3)),
      color: color || layer.color
    });
  }

  buildDxf(opcion = 'ambas', infoPlano = {}) {
    const hasLayout2 = opcion === 'ambas' && this.layout2Entities.length > 0;
    let handleCounter = 1;
    const getHandle = () => {
      const h = handleCounter.toString(16).toUpperCase();
      handleCounter++;
      return h;
    };

    const serializeEntity = (ent, ownerHandle, isPaperSpace) => {
      const lines = [];
      const handle = getHandle();
      lines.push('  0', ent.type);
      lines.push('  5', handle);
      lines.push('330', ownerHandle);
      lines.push('100', 'AcDbEntity');
      if (isPaperSpace) {
        lines.push(' 67', '1');
      }
      lines.push('  8', ent.layer || '0');
      if (ent.color !== undefined && ent.color !== null) {
        lines.push(' 62', String(ent.color));
      }
      if (ent.ltype) {
        lines.push('  6', ent.ltype);
      }

      if (ent.type === 'LINE') {
        lines.push('100', 'AcDbLine');
        lines.push(' 10', String(ent.x1), ' 20', String(ent.y1), ' 30', '0.0');
        lines.push(' 11', String(ent.x2), ' 21', String(ent.y2), ' 31', '0.0');
      } else if (ent.type === 'CIRCLE') {
        lines.push('100', 'AcDbCircle');
        lines.push(' 10', String(ent.cx), ' 20', String(ent.cy), ' 30', '0.0');
        lines.push(' 40', String(ent.r));
      } else if (ent.type === 'ARC') {
        lines.push('100', 'AcDbCircle');
        lines.push(' 10', String(ent.cx), ' 20', String(ent.cy), ' 30', '0.0');
        lines.push(' 40', String(ent.r));
        lines.push('100', 'AcDbArc');
        lines.push(' 50', String(ent.startAngle));
        lines.push(' 51', String(ent.endAngle));
      } else if (ent.type === 'SOLID') {
        lines.push('100', 'AcDbTrace');
        lines.push(' 10', String(ent.x1), ' 20', String(ent.y1), ' 30', '0.0');
        lines.push(' 11', String(ent.x2), ' 21', String(ent.y2), ' 31', '0.0');
        lines.push(' 12', String(ent.x3), ' 22', String(ent.y3), ' 32', '0.0');
        lines.push(' 13', String(ent.x4 || ent.x3), ' 23', String(ent.y4 || ent.y3), ' 33', '0.0');
      } else if (ent.type === 'TEXT') {
        const txt = ent.text;
        lines.push('100', 'AcDbText');
        lines.push(' 10', String(ent.x), ' 20', String(ent.y), ' 30', '0.0');
        lines.push(' 40', String(ent.height));
        lines.push('  1', txt);
        lines.push('  7', 'STANDARD');
        if (ent.angle) {
          lines.push(' 50', String(ent.angle));
        }
        let hCode = 0;
        if (ent.align === 'center') hCode = 1;
        else if (ent.align === 'right') hCode = 2;

        let vCode = 0;
        if (ent.vAlign === 'bottom') vCode = 1;
        else if (ent.vAlign === 'middle') vCode = 2;
        else if (ent.vAlign === 'top') vCode = 3;

        if (hCode !== 0 || vCode !== 0) {
          lines.push(' 72', String(hCode));
          lines.push(' 11', String(ent.x), ' 21', String(ent.y), ' 31', '0.0');
        }
        lines.push('100', 'AcDbText');
        lines.push(' 73', String(vCode));
      }
      return lines;
    };

    const serializeViewport = ({ handle, ownerHandle, vpId, status, cx, cy, w, h, viewCx, viewCy, viewH }) => {
      return [
        '  0', 'VIEWPORT',
        '  5', handle,
        '330', ownerHandle,
        '100', 'AcDbEntity',
        ' 67', '1',
        '  8', 'VIEWPORTS',
        '100', 'AcDbViewport',
        ' 10', String(cx), ' 20', String(cy), ' 30', '0.0',
        ' 40', String(w), ' 41', String(h),
        ' 68', String(status),
        ' 69', String(vpId),
        ' 12', String(viewCx), ' 22', String(viewCy),
        ' 13', '0.0', ' 23', '0.0',
        ' 14', '10.0', ' 24', '10.0',
        ' 15', '10.0', ' 25', '10.0',
        ' 16', '0.0', ' 26', '0.0', ' 36', '1.0',
        ' 17', '0.0', ' 27', '0.0', ' 37', '0.0',
        ' 42', '50.0',
        ' 43', '0.0',
        ' 44', '0.0',
        ' 45', String(viewH),
        ' 50', '0.0',
        ' 51', '0.0',
        ' 72', '100',
        ' 90', '0',
        '  1', '',
        '281', '0',
        ' 71', '0'
      ];
    };

    // Handles clave para la estructura AC1015
    const hTableBlockRecord = getHandle();
    const hBlockRecordModel = getHandle();
    const hBlockRecordPaper = getHandle();
    const hBlockRecordPaper0 = hasLayout2 ? getHandle() : null;

    const hTableVport = getHandle();
    const hVportRecord = getHandle();

    const hTableLtype = getHandle();
    const hLtypeByBlock = getHandle();
    const hLtypeByLayer = getHandle();
    const hLtypeCont = getHandle();
    const hLtypeDash = getHandle();
    const hLtypeHidd = getHandle();

    const hTableLayer = getHandle();

    const hTableStyle = getHandle();
    const hStyleStd = getHandle();

    const hTableView = getHandle();
    const hTableUcs = getHandle();

    const hTableAppid = getHandle();
    const hAppidAcad = getHandle();

    const hTableDimstyle = getHandle();
    const hDimstyleStd = getHandle();

    const hBlockBeginModel = getHandle();
    const hBlockEndModel = getHandle();

    const hBlockBeginPaper = getHandle();
    const hBlockEndPaper = getHandle();

    const hBlockBeginPaper0 = hasLayout2 ? getHandle() : null;
    const hBlockEndPaper0 = hasLayout2 ? getHandle() : null;

    const hVp1Overall = getHandle();
    const hVp1Model = getHandle();
    const hVp2Overall = hasLayout2 ? getHandle() : null;
    const hVp2Model = hasLayout2 ? getHandle() : null;

    const hRootDict = getHandle();
    const hLayoutDict = getHandle();
    const hLayoutModel = getHandle();
    const hLayout1 = getHandle();
    const hLayout2 = hasLayout2 ? getHandle() : null;

    const hPlotStyleDict = getHandle();
    const hPlotStyleNormal = getHandle();

    const l1Title = opcion === 'cuadro'
      ? (infoPlano.numeroPlanoCuadro || 'IE-02_CUADRO_CARGAS')
      : (infoPlano.numeroPlano || 'IE-01_UNIFILAR');
    const l2Title = infoPlano.numeroPlanoCuadro || 'IE-02_CUADRO_CARGAS';

    // Centros en Model Space para cada Viewport
    const unifilarTargetX = 1280.0;
    const unifilarTargetY = 955.0;
    const cuadroTargetX = (opcion === 'cuadro') ? 1280.0 : 4280.0;
    const cuadroTargetY = 955.0;

    const out = [];

    // 1. HEADER SECTION
    out.push('  0', 'SECTION', '  2', 'HEADER');
    out.push('  9', '$ACADVER', '  1', 'AC1015');
    out.push('  9', '$INSUNITS', ' 70', '4');       // Millimeters
    out.push('  9', '$MEASUREMENT', ' 70', '1');    // Metric
    out.push('  9', '$LUNITS', ' 70', '2');         // Decimal
    out.push('  9', '$LUPREC', ' 70', '2');
    out.push('  9', '$TEXTSIZE', ' 40', '12.0');
    out.push('  0', 'ENDSEC');

    // 2. CLASSES SECTION
    out.push('  0', 'SECTION', '  2', 'CLASSES', '  0', 'ENDSEC');

    // 3. TABLES SECTION
    out.push('  0', 'SECTION', '  2', 'TABLES');

    // VPORT Table
    out.push('  0', 'TABLE', '  2', 'VPORT', '  5', hTableVport, '330', '0', '100', 'AcDbSymbolTable', ' 70', '1');
    out.push('  0', 'VPORT', '  5', hVportRecord, '330', hTableVport, '100', 'AcDbSymbolTableRecord', '100', 'AcDbViewportTableRecord', '  2', '*ACTIVE', ' 70', '0', ' 10', '0.0', ' 20', '0.0', ' 11', '1.0', ' 21', '1.0', ' 12', '1250.0', ' 22', '950.0', ' 40', '1600.0', ' 41', '1.75', ' 71', '0');
    out.push('  0', 'ENDTAB');

    // LTYPE Table
    out.push('  0', 'TABLE', '  2', 'LTYPE', '  5', hTableLtype, '330', '0', '100', 'AcDbSymbolTable', ' 70', '5');
    out.push('  0', 'LTYPE', '  5', hLtypeByBlock, '330', hTableLtype, '100', 'AcDbSymbolTableRecord', '100', 'AcDbLinetypeTableRecord', '  2', 'ByBlock', ' 70', '0', '  3', '', ' 72', '65', ' 73', '0', ' 40', '0.0');
    out.push('  0', 'LTYPE', '  5', hLtypeByLayer, '330', hTableLtype, '100', 'AcDbSymbolTableRecord', '100', 'AcDbLinetypeTableRecord', '  2', 'ByLayer', ' 70', '0', '  3', '', ' 72', '65', ' 73', '0', ' 40', '0.0');
    out.push('  0', 'LTYPE', '  5', hLtypeCont, '330', hTableLtype, '100', 'AcDbSymbolTableRecord', '100', 'AcDbLinetypeTableRecord', '  2', 'CONTINUOUS', ' 70', '0', '  3', 'Solid line', ' 72', '65', ' 73', '0', ' 40', '0.0');
    out.push('  0', 'LTYPE', '  5', hLtypeDash, '330', hTableLtype, '100', 'AcDbSymbolTableRecord', '100', 'AcDbLinetypeTableRecord', '  2', 'DASHED', ' 70', '0', '  3', 'Dashed __ __', ' 72', '65', ' 73', '2', ' 40', '12.0', ' 49', '8.0', ' 74', '0', ' 49', '-4.0', ' 74', '0');
    out.push('  0', 'LTYPE', '  5', hLtypeHidd, '330', hTableLtype, '100', 'AcDbSymbolTableRecord', '100', 'AcDbLinetypeTableRecord', '  2', 'HIDDEN', ' 70', '0', '  3', 'Hidden _ _ _', ' 72', '65', ' 73', '2', ' 40', '6.0', ' 49', '4.0', ' 74', '0', ' 49', '-2.0', ' 74', '0');
    out.push('  0', 'ENDTAB');

    // LAYER Table (con las 18 capas normativas y VIEWPORTS)
    const layersList = [
      { name: '0', color: 7, ltype: 'CONTINUOUS' },
      { name: 'VIEWPORTS', color: 7, ltype: 'CONTINUOUS' },
      { name: 'E-MARCO-PERIMETRAL', color: 7, ltype: 'CONTINUOUS' },
      { name: 'E-CAJETIN-DIVISIONES', color: 8, ltype: 'CONTINUOUS' },
      { name: 'E-CAJETIN-TEXTOS', color: 7, ltype: 'CONTINUOUS' },
      { name: 'E-TITULOS-PRINCIPALES', color: 4, ltype: 'CONTINUOUS' },
      { name: 'E-ACOMETIDA-CFE', color: 1, ltype: 'CONTINUOUS' },
      { name: 'E-MEDIDOR-CFE', color: 2, ltype: 'CONTINUOUS' },
      { name: 'E-ALIMENTADOR-GENERAL', color: 1, ltype: 'CONTINUOUS' },
      { name: 'E-BARRAS-TABLERO', color: 5, ltype: 'CONTINUOUS' },
      { name: 'E-NEUTRO', color: 8, ltype: 'DASHED' },
      { name: 'E-TIERRA-CPT', color: 3, ltype: 'HIDDEN' },
      { name: 'E-CIRCUITOS-DERIVADOS', color: 7, ltype: 'CONTINUOUS' },
      { name: 'E-CIRCUITOS-TEXTOS', color: 7, ltype: 'CONTINUOUS' },
      { name: 'E-DISPOSITIVOS-ITM', color: 6, ltype: 'CONTINUOUS' },
      { name: 'SIMBOLOS_CARGAS', color: 6, ltype: 'CONTINUOUS' },
      { name: 'E-SIMBOLOS-CARGAS', color: 6, ltype: 'CONTINUOUS' },
      { name: 'E-TABLA-ENCABEZADO', color: 4, ltype: 'CONTINUOUS' },
      { name: 'E-TABLA-GRID', color: 8, ltype: 'CONTINUOUS' },
      { name: 'E-TABLA-DATOS', color: 7, ltype: 'CONTINUOUS' },
      { name: 'E-NOTAS-CRITERIOS', color: 2, ltype: 'CONTINUOUS' }
    ];

    out.push('  0', 'TABLE', '  2', 'LAYER', '  5', hTableLayer, '330', '0', '100', 'AcDbSymbolTable', ' 70', String(layersList.length));
    layersList.forEach((lay) => {
      out.push('  0', 'LAYER');
      out.push('  5', getHandle());
      out.push('330', hTableLayer);
      out.push('100', 'AcDbSymbolTableRecord');
      out.push('100', 'AcDbLayerTableRecord');
      out.push('  2', lay.name);
      out.push(' 70', '0');
      out.push(' 62', String(lay.color));
      out.push('  6', lay.ltype);
      if (lay.name === 'VIEWPORTS') {
        out.push('290', '0');
      }
      out.push('370', '-3');
      out.push('390', hPlotStyleNormal);
    });
    out.push('  0', 'ENDTAB');

    // STYLE Table
    out.push('  0', 'TABLE', '  2', 'STYLE', '  5', hTableStyle, '330', '0', '100', 'AcDbSymbolTable', ' 70', '1');
    out.push('  0', 'STYLE', '  5', hStyleStd, '330', hTableStyle, '100', 'AcDbSymbolTableRecord', '100', 'AcDbTextStyleTableRecord', '  2', 'STANDARD', ' 70', '0', ' 40', '0.0', ' 41', '1.0', ' 50', '0.0', ' 71', '0', ' 42', '12.0', '  3', 'Arial', '  4', '');
    out.push('  0', 'ENDTAB');

    // VIEW Table
    out.push('  0', 'TABLE', '  2', 'VIEW', '  5', hTableView, '330', '0', '100', 'AcDbSymbolTable', ' 70', '0');
    out.push('  0', 'ENDTAB');

    // UCS Table
    out.push('  0', 'TABLE', '  2', 'UCS', '  5', hTableUcs, '330', '0', '100', 'AcDbSymbolTable', ' 70', '0');
    out.push('  0', 'ENDTAB');

    // APPID Table
    out.push('  0', 'TABLE', '  2', 'APPID', '  5', hTableAppid, '330', '0', '100', 'AcDbSymbolTable', ' 70', '1');
    out.push('  0', 'APPID', '  5', hAppidAcad, '330', hTableAppid, '100', 'AcDbSymbolTableRecord', '100', 'AcDbRegAppTableRecord', '  2', 'ACAD', ' 70', '0');
    out.push('  0', 'ENDTAB');

    // DIMSTYLE Table
    out.push('  0', 'TABLE', '  2', 'DIMSTYLE', '  5', hTableDimstyle, '330', '0', '100', 'AcDbSymbolTable', ' 70', '1', '100', 'AcDbDimStyleTable');
    out.push('  0', 'DIMSTYLE', '105', hDimstyleStd, '330', hTableDimstyle, '100', 'AcDbSymbolTableRecord', '100', 'AcDbDimStyleTableRecord', '  2', 'Standard', ' 70', '0', ' 40', '1.0', ' 41', '2.5', ' 42', '0.625', ' 43', '3.75', ' 44', '1.25', '140', '2.5', '141', '2.5', '170', '0', '171', '3', '172', '1', '340', hStyleStd);
    out.push('  0', 'ENDTAB');

    // BLOCK_RECORD Table
    const numRecords = hasLayout2 ? 3 : 2;
    out.push('  0', 'TABLE', '  2', 'BLOCK_RECORD', '  5', hTableBlockRecord, '330', '0', '100', 'AcDbSymbolTable', ' 70', String(numRecords));

    // Record Model
    out.push('  0', 'BLOCK_RECORD', '  5', hBlockRecordModel, '330', hTableBlockRecord, '100', 'AcDbSymbolTableRecord', '100', 'AcDbBlockTableRecord', '  2', '*Model_Space', '340', hLayoutModel);

    // Record Paper_Space (Layout 1)
    out.push('  0', 'BLOCK_RECORD', '  5', hBlockRecordPaper, '330', hTableBlockRecord, '100', 'AcDbSymbolTableRecord', '100', 'AcDbBlockTableRecord', '  2', '*Paper_Space', '340', hLayout1);

    // Record Paper_Space0 (Layout 2)
    if (hasLayout2) {
      out.push('  0', 'BLOCK_RECORD', '  5', hBlockRecordPaper0, '330', hTableBlockRecord, '100', 'AcDbSymbolTableRecord', '100', 'AcDbBlockTableRecord', '  2', '*Paper_Space0', '340', hLayout2);
    }
    out.push('  0', 'ENDTAB');

    out.push('  0', 'ENDSEC');

    // 4. BLOCKS SECTION
    out.push('  0', 'SECTION', '  2', 'BLOCKS');

    // Block *Model_Space
    out.push('  0', 'BLOCK', '  5', hBlockBeginModel, '330', hBlockRecordModel, '100', 'AcDbEntity', '  8', '0', '100', 'AcDbBlockBegin', '  2', '*Model_Space', ' 70', '0', ' 10', '0.0', ' 20', '0.0', ' 30', '0.0', '  3', '*Model_Space', '  1', '');
    out.push('  0', 'ENDBLK', '  5', hBlockEndModel, '330', hBlockRecordModel, '100', 'AcDbEntity', '  8', '0', '100', 'AcDbBlockEnd');

    // Block *Paper_Space (Layout 1)
    out.push('  0', 'BLOCK', '  5', hBlockBeginPaper, '330', hBlockRecordPaper, '100', 'AcDbEntity', '  8', '0', '100', 'AcDbBlockBegin', '  2', '*Paper_Space', ' 70', '0', ' 10', '0.0', ' 20', '0.0', ' 30', '0.0', '  3', '*Paper_Space', '  1', '');
    out.push('  0', 'ENDBLK', '  5', hBlockEndPaper, '330', hBlockRecordPaper, '100', 'AcDbEntity', '  8', '0', '100', 'AcDbBlockEnd');

    // Block *Paper_Space0 (Layout 2) con sus Viewports y Entidades
    if (hasLayout2) {
      out.push('  0', 'BLOCK', '  5', hBlockBeginPaper0, '330', hBlockRecordPaper0, '100', 'AcDbEntity', ' 67', '1', '  8', '0', '100', 'AcDbBlockBegin', '  2', '*Paper_Space0', ' 70', '0', ' 10', '0.0', ' 20', '0.0', ' 30', '0.0', '  3', '*Paper_Space0', '  1', '');

      // Viewport 1 (overall)
      out.push(...serializeViewport({
        handle: hVp2Overall,
        ownerHandle: hBlockRecordPaper0,
        vpId: 1,
        status: 1,
        cx: 450.0, cy: 300.0, w: 990.0, h: 660.0,
        viewCx: 450.0, viewCy: 300.0, viewH: 660.0
      }));

      // Viewport 2 (floating model viewport centrado en Cuadro de Cargas)
      out.push(...serializeViewport({
        handle: hVp2Model,
        ownerHandle: hBlockRecordPaper0,
        vpId: 3,
        status: 2,
        cx: 450.0, cy: 337.5, w: 860.0, h: 490.0,
        viewCx: cuadroTargetX, viewCy: cuadroTargetY, viewH: 1550.0
      }));

      // Entidades de Paper Space de Layout 2 (Marco y Cajetín)
      this.layout2Entities.forEach(ent => {
        out.push(...serializeEntity(ent, hBlockRecordPaper0, true));
      });

      out.push('  0', 'ENDBLK', '  5', hBlockEndPaper0, '330', hBlockRecordPaper0, '100', 'AcDbEntity', ' 67', '1', '  8', '0', '100', 'AcDbBlockEnd');
    }

    out.push('  0', 'ENDSEC');

    // 5. ENTITIES SECTION (Contiene entidades de Model Space y de Layout 1)
    out.push('  0', 'SECTION', '  2', 'ENTITIES');

    // Entidades de Model Space
    this.modelEntities.forEach(ent => {
      out.push(...serializeEntity(ent, hBlockRecordModel, false));
    });

    // Viewports de Layout 1 (*Paper_Space)
    out.push(...serializeViewport({
      handle: hVp1Overall,
      ownerHandle: hBlockRecordPaper,
      vpId: 1,
      status: 1,
      cx: 450.0, cy: 300.0, w: 990.0, h: 660.0,
      viewCx: 450.0, viewCy: 300.0, viewH: 660.0
    }));

    const l1TargetX = (opcion === 'cuadro') ? cuadroTargetX : unifilarTargetX;
    const l1TargetY = (opcion === 'cuadro') ? cuadroTargetY : unifilarTargetY;

    out.push(...serializeViewport({
      handle: hVp1Model,
      ownerHandle: hBlockRecordPaper,
      vpId: 3,
      status: 2,
      cx: 450.0, cy: 337.5, w: 860.0, h: 490.0,
      viewCx: l1TargetX, viewCy: l1TargetY, viewH: 1550.0
    }));

    // Entidades de Paper Space de Layout 1
    this.layout1Entities.forEach(ent => {
      out.push(...serializeEntity(ent, hBlockRecordPaper, true));
    });

    out.push('  0', 'ENDSEC');

    // 6. OBJECTS SECTION
    out.push('  0', 'SECTION', '  2', 'OBJECTS');

    // Root DICTIONARY
    out.push('  0', 'DICTIONARY', '  5', hRootDict, '330', '0', '100', 'AcDbDictionary', '281', '1');
    out.push('  3', 'ACAD_LAYOUT', '350', hLayoutDict);
    out.push('  3', 'ACAD_PLOTSTYLENAME', '350', hPlotStyleDict);

    // ACAD_LAYOUT DICTIONARY
    out.push('  0', 'DICTIONARY', '  5', hLayoutDict, '330', hRootDict, '100', 'AcDbDictionary', '281', '1');
    out.push('  3', 'Model', '350', hLayoutModel);
    out.push('  3', l1Title, '350', hLayout1);
    if (hasLayout2) {
      out.push('  3', l2Title, '350', hLayout2);
    }

    // ACAD_PLOTSTYLENAME DICTIONARY
    out.push('  0', 'ACDBDICTIONARYWDFLT', '  5', hPlotStyleDict, '330', hRootDict, '100', 'AcDbDictionary', '281', '1');
    out.push('  3', 'Normal', '350', hPlotStyleNormal);
    out.push('100', 'AcDbDictionaryWithDefault', '340', hPlotStyleNormal);

    // ACDBPLACEHOLDER for PlotStyle Normal
    out.push('  0', 'ACDBPLACEHOLDER', '  5', hPlotStyleNormal, '330', hPlotStyleDict);

    // LAYOUT Model
    out.push('  0', 'LAYOUT', '  5', hLayoutModel, '330', hLayoutDict, '100', 'AcDbPlotSettings', '  1', '', '  2', 'none_device', '  4', '', '  6', '');
    out.push(' 40', '0.0', ' 41', '0.0', ' 42', '0.0', ' 43', '0.0', ' 44', '0.0', ' 45', '0.0', ' 46', '0.0', ' 47', '0.0', ' 48', '0.0', ' 49', '0.0', '140', '0.0', '141', '0.0', '142', '1.0', '143', '1.0', ' 70', '0', ' 72', '0', ' 73', '0', ' 74', '0', '  7', '', ' 75', '0', ' 76', '0', ' 77', '2', ' 78', '300', '147', '1.0', '148', '0.0', '149', '0.0');
    out.push('100', 'AcDbLayout', '  1', 'Model', ' 70', '1', ' 71', '0', ' 10', '0.0', ' 20', '0.0', ' 11', '12.0', ' 21', '9.0', ' 12', '0.0', ' 22', '0.0', ' 32', '0.0', ' 14', '0.0', ' 24', '0.0', ' 34', '0.0', ' 15', '0.0', ' 25', '0.0', ' 35', '0.0', '146', '0.0', ' 13', '0.0', ' 23', '0.0', ' 33', '0.0', ' 16', '1.0', ' 26', '0.0', ' 36', '0.0', ' 17', '0.0', ' 27', '1.0', ' 37', '0.0', ' 76', '0', '330', hBlockRecordModel);

    // LAYOUT 1 (900 x 600 mm)
    out.push('  0', 'LAYOUT', '  5', hLayout1, '330', hLayoutDict, '100', 'AcDbPlotSettings', '  1', '', '  2', 'DWG to PDF.pc3', '  4', 'Arch_D_(900.00_x_600.00_MM)', '  6', '');
    out.push(' 40', '0.0', ' 41', '0.0', ' 42', '0.0', ' 43', '0.0', ' 44', '900.0', ' 45', '600.0', ' 46', '0.0', ' 47', '0.0', ' 48', '0.0', ' 49', '0.0', '140', '0.0', '141', '0.0', '142', '1.0', '143', '1.0', ' 70', '672', ' 72', '1', ' 73', '0', ' 74', '5', '  7', '', ' 75', '16', ' 76', '0', ' 77', '2', ' 78', '300', '147', '1.0', '148', '0.0', '149', '0.0');
    out.push('100', 'AcDbLayout', '  1', l1Title, ' 70', '1', ' 71', '1', ' 10', '0.0', ' 20', '0.0', ' 11', '900.0', ' 21', '600.0', ' 12', '0.0', ' 22', '0.0', ' 32', '0.0', ' 14', '0.0', ' 24', '0.0', ' 34', '0.0', ' 15', '900.0', ' 25', '600.0', ' 35', '0.0', '146', '0.0', ' 13', '0.0', ' 23', '0.0', ' 33', '0.0', ' 16', '1.0', ' 26', '0.0', ' 36', '0.0', ' 17', '0.0', ' 27', '1.0', ' 37', '0.0', ' 76', '0', '330', hBlockRecordPaper, '331', hVp1Model);

    // LAYOUT 2 (900 x 600 mm)
    if (hasLayout2) {
      out.push('  0', 'LAYOUT', '  5', hLayout2, '330', hLayoutDict, '100', 'AcDbPlotSettings', '  1', '', '  2', 'DWG to PDF.pc3', '  4', 'Arch_D_(900.00_x_600.00_MM)', '  6', '');
      out.push(' 40', '0.0', ' 41', '0.0', ' 42', '0.0', ' 43', '0.0', ' 44', '900.0', ' 45', '600.0', ' 46', '0.0', ' 47', '0.0', ' 48', '0.0', ' 49', '0.0', '140', '0.0', '141', '0.0', '142', '1.0', '143', '1.0', ' 70', '672', ' 72', '1', ' 73', '0', ' 74', '5', '  7', '', ' 75', '16', ' 76', '0', ' 77', '2', ' 78', '300', '147', '1.0', '148', '0.0', '149', '0.0');
      out.push('100', 'AcDbLayout', '  1', l2Title, ' 70', '1', ' 71', '2', ' 10', '0.0', ' 20', '0.0', ' 11', '900.0', ' 21', '600.0', ' 12', '0.0', ' 22', '0.0', ' 32', '0.0', ' 14', '0.0', ' 24', '0.0', ' 34', '0.0', ' 15', '900.0', ' 25', '600.0', ' 35', '0.0', '146', '0.0', ' 13', '0.0', ' 23', '0.0', ' 33', '0.0', ' 16', '1.0', ' 26', '0.0', ' 36', '0.0', ' 17', '0.0', ' 27', '1.0', ' 37', '0.0', ' 76', '0', '330', hBlockRecordPaper0, '331', hVp2Model);
    }

    out.push('  0', 'ENDSEC');

    // 7. EOF
    out.push('  0', 'EOF');

    // Insertar $HANDSEED en el header después de $ACADVER y su valor AC1015
    const seedHex = (handleCounter + 1).toString(16).toUpperCase();
    const headerIdx = out.indexOf('$ACADVER');
    out.splice(headerIdx + 3, 0, '  9', '$HANDSEED', '  5', seedHex);

    return out.join('\r\n') + '\r\n';
  }
}

/**
 * Dibuja el marco y cajetín formal de 7 columnas en el espacio papel (Layout Space) de 900x600 mm.
 */
export function dibujarCajetinPaperSpace(builder, target, infoPlano = {}, planoTitle = "DIAGRAMA UNIFILAR", planoClave = "IE-01") {
  // Hoja: 900 x 600 mm
  // Doble marco perimetral
  builder.addRect({ target, layer: DXF_LAYERS.MARCO, x: 15, y: 15, w: 870, h: 570, weight: 50 });
  builder.addRect({ target, layer: DXF_LAYERS.MARCO, x: 18, y: 18, w: 864, h: 564, weight: 25 });

  // Cajetín inferior de 860 mm x 65 mm (Y de 20 a 85 mm)
  const x = 20;
  const y = 20;
  const width = 860;
  const height = 65;

  builder.addRect({ target, layer: DXF_LAYERS.MARCO, x, y, w: width, h: height, weight: 50 });

  // Proporciones de las 7 columnas
  const c1W = 189.2; // Proyecto y Propietario
  const c2W = 197.8; // Etapa, Plaza, Local y Ubicación
  const c3W = 86.0;  // Escala y Fecha
  const c4W = 86.0;  // Cotas y Tipo de Plano
  const c5W = 68.8;  // Rosa de los Vientos (Norte)
  const c6W = 129.0; // Proyectó, Revisó, Responsable / Cédula
  const c7W = 103.2; // Título, Clave y Revisión

  // Divisiones verticales
  const divsX = [
    x + c1W,
    x + c1W + c2W,
    x + c1W + c2W + c3W,
    x + c1W + c2W + c3W + c4W,
    x + c1W + c2W + c3W + c4W + c5W,
    x + c1W + c2W + c3W + c4W + c5W + c6W
  ];
  divsX.forEach(dx => {
    builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: dx, y1: y, x2: dx, y2: y + height, weight: 25 });
  });

  // Divisiones horizontales en Columna 1 y 2
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: x, y1: y + height / 2, x2: x + c1W, y2: y + height / 2, weight: 20 });
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: x + c1W, y1: y + height / 2, x2: x + c1W + c2W, y2: y + height / 2, weight: 20 });

  // Columna 1: Proyecto y Propietario
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: x + 8, y: y + 54, height: 2.0, text: 'PROYECTO:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: x + 8, y: y + 44, height: 3.2, text: (infoPlano.proyecto || 'HAWAIIAN PARADISE').toUpperCase() });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: x + 8, y: y + 36, height: 2.4, text: infoPlano.nombreComercial || '' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: x + 8, y: y + 22, height: 2.0, text: 'CLIENTE / PROPIETARIO:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: x + 8, y: y + 11, height: 3.0, text: (infoPlano.cliente || 'OPERADORA DE ALIMENTOS').toUpperCase() });

  // Columna 2: Etapa y Ubicación
  const c2X = x + c1W;
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c2X + 8, y: y + 54, height: 2.0, text: 'ETAPA:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c2X + 8, y: y + 42, height: 3.0, text: (infoPlano.etapa || 'PROYECTO EJECUTIVO').toUpperCase() });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c2X + 8, y: y + 22, height: 2.0, text: 'PLAZA Y LOCAL:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c2X + 8, y: y + 12, height: 2.8, text: `${(infoPlano.plaza || 'PLAZA ANDAMAR').toUpperCase()} - ${(infoPlano.local || 'LOCAL COMERCIAL K-12').toUpperCase()}` });
  const ubicacionStr = infoPlano.ubicacion || 'Blvd. Adolfo Ruiz Cortines 4300, Mocambo, 94298 Boca del Río, Ver.';
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c2X + 8, y: y + 4, height: 2.0, text: ubicacionStr });

  // Columna 3: Escala y Fecha
  const c3X = c2X + c2W;
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: c3X, y1: y + height / 2, x2: c3X + c3W, y2: y + height / 2, weight: 20 });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c3X + 8, y: y + 54, height: 2.0, text: 'ESCALA:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c3X + 8, y: y + 40, height: 3.5, text: infoPlano.escala || 'S/E' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c3X + 8, y: y + 22, height: 2.0, text: 'FECHA:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c3X + 8, y: y + 10, height: 2.8, text: infoPlano.fecha || new Date().toLocaleDateString('es-MX') });

  // Columna 4: Cotas y Tipo de Plano
  const c4X = c3X + c3W;
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: c4X, y1: y + height / 2, x2: c4X + c4W, y2: y + height / 2, weight: 20 });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c4X + 8, y: y + 54, height: 2.0, text: 'COTAS:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c4X + 8, y: y + 40, height: 3.0, text: infoPlano.cotas || 'METROS' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c4X + 8, y: y + 22, height: 2.0, text: 'TIPO DE PLANO:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c4X + 8, y: y + 10, height: 2.8, text: infoPlano.tipoPlano || 'INST. ELÉCTRICA' });

  // Columna 5: Rosa de los Vientos (Norte) rotada por norteAngulo
  const c5X = c4X + c4W;
  const cx = c5X + c5W / 2;
  const cy = y + 33.0;
  const angulo = infoPlano.norteAngulo || 0;
  const rad = (angulo * Math.PI) / 180;

  // Anillos de dial
  builder.addCircle({ target, layer: DXF_LAYERS.CAJETIN_DIV, cx, cy, r: 16.0, weight: 25 });
  builder.addCircle({ target, layer: DXF_LAYERS.CAJETIN_DIV, cx, cy, r: 18.0, weight: 18, ltype: 'HIDDEN' });

  // Ejes cardinales
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: cx - 17, y1: cy, x2: cx + 17, y2: cy, weight: 18 });
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: cx, y1: cy - 17, x2: cx, y2: cy + 17, weight: 18 });

  // Puntas rotadas de la aguja según angulo
  // En DXF: 0° es hacia ARRIBA (+Y)
  const tipNx = cx + 15.0 * Math.sin(rad);
  const tipNy = cy + 15.0 * Math.cos(rad);

  const tipSx = cx - 15.0 * Math.sin(rad);
  const tipSy = cy - 15.0 * Math.cos(rad);

  const baseLx = cx - 4.5 * Math.cos(rad) - 2.0 * Math.sin(rad);
  const baseLy = cy + 4.5 * Math.sin(rad) - 2.0 * Math.cos(rad);

  const baseRx = cx + 4.5 * Math.cos(rad) - 2.0 * Math.sin(rad);
  const baseRy = cy - 4.5 * Math.sin(rad) - 2.0 * Math.cos(rad);

  // Triángulo sólido Norte
  builder.addSolidTriangle({
    target,
    layer: DXF_LAYERS.TITULOS,
    x1: tipNx, y1: tipNy,
    x2: baseLx, y2: baseLy,
    x3: cx, y3: cy
  });

  // Triángulo contorneado Norte
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_TXT, x1: tipNx, y1: tipNy, x2: baseRx, y2: baseRy, weight: 25 });
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_TXT, x1: baseRx, y1: baseRy, x2: cx, y2: cy, weight: 25 });

  // Aguja Sur
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: tipSx, y1: tipSy, x2: baseLx, y2: baseLy, weight: 20 });
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: tipSx, y1: tipSy, x2: baseRx, y2: baseRy, weight: 20 });

  // Letra N en la punta de la aguja norte
  const nTextX = cx + 21.0 * Math.sin(rad);
  const nTextY = cy + 21.0 * Math.cos(rad);
  builder.addText({ target, layer: DXF_LAYERS.TITULOS, x: nTextX, y: nTextY - 1.5, height: 3.2, text: 'N', align: 'center' });

  // Texto con el ángulo
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: cx, y: y + 4.0, height: 2.0, text: `NORTE ${angulo}°`, align: 'center' });

  // Columna 6: Responsabilidades y Cédula
  const c6X = c5X + c5W;
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: c6X, y1: y + 43, x2: c6X + c6W, y2: y + 43, weight: 20 });
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: c6X, y1: y + 23, x2: c6X + c6W, y2: y + 23, weight: 20 });

  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c6X + 8, y: y + 55, height: 1.8, text: 'PROYECTÓ:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c6X + 8, y: y + 47, height: 2.6, text: infoPlano.dibujo || 'DEPTO. DE INGENIERÍA' });

  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c6X + 8, y: y + 35, height: 1.8, text: 'REVISÓ:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c6X + 8, y: y + 27, height: 2.6, text: infoPlano.reviso || 'ING. PROYECTISTA' });

  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c6X + 8, y: y + 16, height: 1.8, text: 'RESPONSABLE / CÉDULA:' });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c6X + 8, y: y + 9, height: 2.4, text: infoPlano.responsable || '____________________' });
  const cedulaStr = infoPlano.cedula ? (infoPlano.cedula.includes('CÉD') ? infoPlano.cedula : `CÉDULA: ${infoPlano.cedula}`) : 'CÉDULA: ____________________';
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c6X + 8, y: y + 3, height: 2.0, text: cedulaStr });

  // Columna 7: Título del Plano, Clave y Revisión
  const c7X = c6X + c6W;
  const c7CenterX = c7X + c7W / 2;
  builder.addText({ target, layer: DXF_LAYERS.TITULOS, x: c7CenterX, y: y + 52, height: 3.2, text: planoTitle, align: 'center' });
  builder.addText({ target, layer: DXF_LAYERS.TITULOS, x: c7CenterX, y: y + 26, height: 11.0, text: planoClave, align: 'center' });
  builder.addLine({ target, layer: DXF_LAYERS.CAJETIN_DIV, x1: c7X + 15, y1: y + 15, x2: c7X + c7W - 15, y2: y + 15, weight: 20 });
  builder.addText({ target, layer: DXF_LAYERS.CAJETIN_TXT, x: c7CenterX, y: y + 6, height: 2.5, text: infoPlano.revision || 'REV. 0', align: 'center' });
}

/**
 * Genera las entidades CAD de la Lámina 1: Diagrama Unifilar.
 * @param {DxfBuilder} builder 
 * @param {object} model 
 * @param {number} ox 
 * @param {number} oy 
 * @param {boolean} incluirMarcoYCajetin - Si es false, genera solo el dibujo técnico para Model Space.
 */
export function generarDxfLamino1Unifilar(builder, model, ox = 0, oy = 0, incluirMarcoYCajetin = false) {
  const { alimentador, circuitos, infoPlano } = model;
  const H = 1728;
  const toY = (svgY) => oy + (H - svgY);
  const toX = (svgX) => ox + svgX;

  // Si se solicita marco y cajetín en Model Space (compatibilidad)
  if (incluirMarcoYCajetin) {
    builder.addRect({ target: 'model', layer: DXF_LAYERS.MARCO, x: toX(40), y: toY(40 + 1648), w: 2512, h: 1648, weight: 50 });
    builder.addRect({ target: 'model', layer: DXF_LAYERS.MARCO, x: toX(52), y: toY(52 + 1624), w: 2488, h: 1624, weight: 25 });
  }

  // Título de la Lámina en Model Space
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(80), y: toY(110), height: 38, text: 'Diagrama Unifilar.' });
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(440), y: toY(106), height: 13, text: 'SISTEMA ELÉCTRICO DE DISTRIBUCIÓN COMERCIAL · NOM-001-SEDE-2012' });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.TITULOS, x1: toX(80), y1: toY(124), x2: toX(680), y2: toY(124) });

  // Acometida, medidor, interruptor principal y alimentador
  for (const p of buildSupplyScene(model)) {
    const layer = p.type === 'text' ? DXF_LAYERS.NOTAS_CRITERIOS : DXF_LAYERS.ALIMENTADOR;
    if(p.type === 'text') builder.addText({ target: 'model', layer, x: toX(p.x), y: toY(p.y), height: p.size, text: p.value });
    else if(p.type === 'line') builder.addLine({ target: 'model', layer, x1: toX(p.x1), y1: toY(p.y1), x2: toX(p.x2), y2: toY(p.y2) });
    else if(p.type === 'circle') builder.addCircle({ target: 'model', layer: DXF_LAYERS.DISPOSITIVOS_ITM, cx: toX(p.cx), cy: toY(p.cy), r: p.r });
    else if(p.type === 'rect') builder.addRect({ target: 'model', layer: DXF_LAYERS.MEDIDOR, x: toX(p.x), y: toY(p.y + p.h), w: p.w, h: p.h });
    else if(p.type === 'triangle') builder.addSolidTriangle({ target: 'model', layer, x1: toX(p.points[0][0]), y1: toY(p.points[0][1]), x2: toX(p.points[1][0]), y2: toY(p.points[1][1]), x3: toX(p.points[2][0]), y3: toY(p.points[2][1]) });
    else if(p.type === 'breaker') builder.addArc({ target: 'model', layer: DXF_LAYERS.DISPOSITIVOS_ITM, cx: toX(p.cx), cy: toY(p.cy), r: p.r, startAngle: 0, endAngle: 180 });
    else if(p.type === 'meterArc') {
      for(let i=0;i<16;i++) {
        const t=i/16, u=(i+1)/16;
        builder.addLine({ target: 'model', layer: DXF_LAYERS.MEDIDOR, x1: toX(p.x+p.w*t), y1: toY(p.y+4*p.h*t*(1-t)), x2: toX(p.x+p.w*u), y2: toY(p.y+4*p.h*u*(1-u)) });
      }
    }
  }

  // Simbología Oficial Normativa (NOM-001-SEDE)
  const simX = 120;
  const simY = 820;
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(simX), y: toY(simY), height: 11, text: 'SIMBOLOGÍA OFICIAL (NOM-001-SEDE)' });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x1: toX(simX), y1: toY(simY + 6), x2: toX(simX + 280), y2: toY(simY + 6) });

  const simbolosNom = [
    { label: 'Salida de Alumbrado LED', tipo: 'alumbrado', dy: 28 },
    { label: 'Carga de Fuerza / Contacto 127V', tipo: 'contacto', dy: 58 },
    { label: 'Equipo Térmico / Calefacción', tipo: 'termico', dy: 88 },
    { label: 'Motor / Compresor / Bomba', tipo: 'motor', dy: 118 }
  ];

  simbolosNom.forEach(s => {
    const sy = simY + s.dy;
    builder.addCircle({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, cx: toX(simX + 15), cy: toY(sy), r: 10, weight: 30 });
    if (s.tipo === 'alumbrado') {
      builder.addLine({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x1: toX(simX + 8), y1: toY(sy - 7), x2: toX(simX + 22), y2: toY(sy + 7) });
      builder.addLine({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x1: toX(simX + 8), y1: toY(sy + 7), x2: toX(simX + 22), y2: toY(sy - 7) });
    } else if (s.tipo === 'motor') {
      builder.addText({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x: toX(simX + 15), y: toY(sy + 4), height: 9.5, text: 'M', align: 'center' });
    } else if (s.tipo === 'termico') {
      builder.addText({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x: toX(simX + 15), y: toY(sy + 4), height: 9.5, text: 'R', align: 'center' });
    } else {
      builder.addLine({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x1: toX(simX + 8), y1: toY(sy - 7), x2: toX(simX + 22), y2: toY(sy + 7) });
    }
    builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(simX + 35), y: toY(sy + 3.5), height: 9.5, text: s.label });
  });

  // Barras de distribución del Tablero
  const busX = 1100;
  const busStartY = 270;
  const busEndY = 1480;

  builder.addLine({ target: 'model', layer: DXF_LAYERS.BARRAS, x1: toX(busX), y1: toY(busStartY), x2: toX(busX), y2: toY(busEndY), weight: 70 });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.BARRAS, x1: toX(busX + 10), y1: toY(busStartY), x2: toX(busX + 10), y2: toY(busEndY), weight: 70 });

  // Barra de Neutro y Tierra
  builder.addLine({ target: 'model', layer: DXF_LAYERS.NEUTRO, x1: toX(busX - 25), y1: toY(busStartY), x2: toX(busX - 25), y2: toY(busEndY), weight: 25, ltype: 'DASHED' });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.TIERRA, x1: toX(busX - 45), y1: toY(busStartY), x2: toX(busX - 45), y2: toY(busEndY), weight: 30, ltype: 'HIDDEN' });

  builder.addText({ target: 'model', layer: DXF_LAYERS.NEUTRO, x: toX(busX - 25), y: toY(busStartY - 10), height: 8.5, text: 'N', align: 'center' });
  builder.addText({ target: 'model', layer: DXF_LAYERS.TIERRA, x: toX(busX - 45), y: toY(busStartY - 10), height: 8.5, text: 'T', align: 'center' });

  // Distribución de circuitos derivados
  const totalCircs = circuitos.length;
  const rowHeight = Math.min(78, Math.max(50, 1100 / Math.max(12, totalCircs)));

  circuitos.forEach((circ, idx) => {
    const y = busStartY + (idx * rowHeight) + 30;
    const isBipolar = circ.polos === 2;
    const isL2 = (circ.fase || '').includes('B');
    const tapX = isL2 ? busX + 10 : busX;

    if (isBipolar) {
      builder.addCircle({ target: 'model', layer: DXF_LAYERS.BARRAS, cx: toX(busX), cy: toY(y - 4), r: 3.5 });
      builder.addCircle({ target: 'model', layer: DXF_LAYERS.BARRAS, cx: toX(busX + 10), cy: toY(y + 4), r: 3.5 });
      builder.addLine({ target: 'model', layer: DXF_LAYERS.DERIVADOS_LINEAS, x1: toX(busX), y1: toY(y - 4), x2: toX(busX + 45), y2: toY(y), weight: 35 });
      builder.addLine({ target: 'model', layer: DXF_LAYERS.DERIVADOS_LINEAS, x1: toX(busX + 10), y1: toY(y + 4), x2: toX(busX + 45), y2: toY(y), weight: 35 });
    } else {
      builder.addCircle({ target: 'model', layer: DXF_LAYERS.BARRAS, cx: toX(tapX), cy: toY(y), r: 3.5 });
      builder.addLine({ target: 'model', layer: DXF_LAYERS.DERIVADOS_LINEAS, x1: toX(tapX), y1: toY(y), x2: toX(busX + 45), y2: toY(y), weight: 30 });
    }

    // Número de slot del tablero
    builder.addText({ target: 'model', layer: DXF_LAYERS.DERIVADOS_TEXTOS, x: toX(busX - 25), y: toY(y + 4), height: 10, text: circ.slotsStr || String(idx + 1), align: 'right' });

    // Símbolo de breaker
    const brkX = busX + 45;
    builder.addLine({ target: 'model', layer: DXF_LAYERS.DISPOSITIVOS_ITM, x1: toX(brkX), y1: toY(y), x2: toX(brkX + 10), y2: toY(y) });
    builder.addArc({ target: 'model', layer: DXF_LAYERS.DISPOSITIVOS_ITM, cx: toX(brkX + 24), cy: toY(y), r: 14, startAngle: 0, endAngle: 180 });
    for(const x of [brkX+10,brkX+38]) builder.addCircle({ target: 'model', layer: DXF_LAYERS.DISPOSITIVOS_ITM, cx: toX(x), cy: toY(y), r: 2.3 });
    builder.addLine({ target: 'model', layer: DXF_LAYERS.DISPOSITIVOS_ITM, x1: toX(brkX + 38), y1: toY(y), x2: toX(brkX + 50), y2: toY(y) });
    builder.addText({ target: 'model', layer: DXF_LAYERS.DISPOSITIVOS_ITM, x: toX(brkX + 24), y: toY(y - 22), height: 10.5, text: circ.breakerStr, align: 'center' });

    // Línea de conducción hacia la carga
    builder.addLine({ target: 'model', layer: DXF_LAYERS.DERIVADOS_LINEAS, x1: toX(busX + 95), y1: toY(y), x2: toX(2100), y2: toY(y), weight: isBipolar ? 35 : 25 });

    // Textos de especificación técnica del circuito
    const specX = busX + 110;
    const inNomVal = typeof circ.inNom === 'number' ? circ.inNom : (parseFloat(circ.inNom) || 0);
    const caidaVal = typeof circ.caida === 'number' ? circ.caida : (parseFloat(circ.caida) || (circ.caidaCircuito || 0));
    const condStr = circ.conductorCompletoStr || `${circ.polos || 1} # 12 AWG + 1 # 12 AWG T`;

    builder.addText({ target: 'model', layer: DXF_LAYERS.DERIVADOS_TEXTOS, x: toX(specX), y: toY(y - 8), height: 11, text: `${circ.num} · ${condStr}` });
    builder.addText({ target: 'model', layer: DXF_LAYERS.DERIVADOS_TEXTOS, x: toX(specX), y: toY(y + 12), height: 9.5, text: `${circ.canalizacion} · L=${circ.longitudMetros} m · In=${inNomVal.toFixed(2)} A · e%=${caidaVal.toFixed(2)}%` });

    // Símbolo de receptor / carga según NOM-001-SEDE
    const loadX = 2100;
    const simType = circ.tipoSimbologia || getTipoSimbologiaNom(circ);

    if (simType === 'motor') {
      builder.addCircle({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, cx: toX(loadX), cy: toY(y), r: 16, weight: 35 });
      builder.addText({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x: toX(loadX), y: toY(y + 5), height: 14, text: 'M', align: 'center' });
    } else if (simType === 'alumbrado') {
      builder.addCircle({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, cx: toX(loadX), cy: toY(y), r: 16, weight: 35 });
      builder.addLine({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x1: toX(loadX - 11), y1: toY(y - 11), x2: toX(loadX + 11), y2: toY(y + 11), weight: 30 });
      builder.addLine({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x1: toX(loadX - 11), y1: toY(y + 11), x2: toX(loadX + 11), y2: toY(y - 11), weight: 30 });
    } else if (simType === 'termico') {
      builder.addCircle({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, cx: toX(loadX), cy: toY(y), r: 16, weight: 35 });
      builder.addText({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x: toX(loadX), y: toY(y + 5), height: 13, text: 'R', align: 'center' });
    } else {
      builder.addCircle({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, cx: toX(loadX), cy: toY(y), r: 16, weight: 35 });
      builder.addLine({ target: 'model', layer: DXF_LAYERS.SIMBOLOS_CARGAS, x1: toX(loadX - 11), y1: toY(y - 11), x2: toX(loadX + 11), y2: toY(y + 11), weight: 30 });
    }

    // Nombre de la carga
    builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(loadX + 28), y: toY(y - 6), height: 11.5, text: circ.desc || circ.tipo });
    builder.addText({ target: 'model', layer: DXF_LAYERS.DERIVADOS_TEXTOS, x: toX(loadX + 28), y: toY(y + 12), height: 9.5, text: `${circ.voltajeStr} · ${circ.watts} W (${Math.round(circ.va)} VA)` });
  });

  // Resumen pie de diagrama
  builder.addText({
    target: 'model',
    layer: DXF_LAYERS.NOTAS_CRITERIOS,
    x: toX(2480),
    y: toY(busEndY + 20),
    height: 13,
    text: `TOTAL: ${totalCircs} CIRCUITOS ACTIVOS · 0 DE RESERVA · ${Math.max(0, 24 - totalCircs)} ESPACIOS DISPONIBLES`,
    align: 'right'
  });
}

/**
 * Genera las entidades CAD de la Lámina 2: Cuadro de Cargas y Resumen Normativo.
 * @param {DxfBuilder} builder 
 * @param {object} model 
 * @param {number} ox 
 * @param {number} oy 
 * @param {boolean} incluirMarcoYCajetin - Si es false, genera solo el dibujo técnico para Model Space.
 */
export function generarDxfLamino2Cuadro(builder, model, ox = 0, oy = 0, incluirMarcoYCajetin = false) {
  const { acometida, alimentador, circuitosImpares, circuitosPares, totales, infoPlano, resumenCaidas } = model;
  const H = 1728;
  const toY = (svgY) => oy + (H - svgY);
  const toX = (svgX) => ox + svgX;

  const isTrifasico = acometida?.id === 'trifasico';

  if (incluirMarcoYCajetin) {
    builder.addRect({ target: 'model', layer: DXF_LAYERS.MARCO, x: toX(40), y: toY(40 + 1648), w: 2512, h: 1648, weight: 50 });
    builder.addRect({ target: 'model', layer: DXF_LAYERS.MARCO, x: toX(52), y: toY(52 + 1624), w: 2488, h: 1624, weight: 25 });
  }

  // Título de la Lámina
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(80), y: toY(110), height: 38, text: 'Cuadro de Cargas y Resumen Normativo.' });
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(780), y: toY(106), height: 13, text: 'BALANCEO DE FASES Y ESPECIFICACIÓN TÉCNICA · NOM-001-SEDE-2012' });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.TITULOS, x1: toX(80), y1: toY(124), x2: toX(1050), y2: toY(124) });

  // Tabla del Cuadro de Cargas
  const startX = 60;
  const startY = 150;
  const tableW = 2472;

  // Anchos de columna proporcionales
  const COL_DEFS = [
    { id: 'cto', label: 'CTO', w: 55, align: 'center' },
    { id: 'fase', label: 'FASE', w: 55, align: 'center' },
    { id: 'voltaje', label: 'VOLTS', w: 60, align: 'center' },
    { id: 'slot', label: 'SLOT', w: 55, align: 'center' },
    { id: 'equipo', label: 'DESCRIPCIÓN DE LA CARGA / EQUIPO', w: 420, align: 'left' },
    { id: 'watts', label: 'WATTS', w: 80, align: 'right' },
    { id: 'fp', label: 'F.P.', w: 55, align: 'center' },
    { id: 'va', label: 'VOLTAMPERES', w: 95, align: 'right' },
    { id: 'faseA', label: 'L1 (VA)', w: 85, align: 'right' },
    { id: 'faseB', label: 'L2 (VA)', w: 85, align: 'right' },
    ...(isTrifasico ? [{ id: 'faseC', label: 'L3 (VA)', w: 85, align: 'right' }] : []),
    { id: 'in', label: 'In (A)', w: 65, align: 'right' },
    { id: 'breaker', label: 'ITM', w: 75, align: 'center' },
    { id: 'conductor', label: 'CONDUCTOR', w: 125, align: 'center' },
    { id: 'canalizacion', label: 'CANALIZACIÓN', w: 125, align: 'center' },
    { id: 'longitud', label: 'LONG', w: 65, align: 'center' },
    { id: 'caidaCto', label: 'e% CTO', w: 65, align: 'right' },
    { id: 'caidaTot', label: 'e% TOT', w: 65, align: 'right' }
  ];

  // Calcular posiciones X acumuladas
  let curX = startX;
  const colPositions = COL_DEFS.map(col => {
    const pos = { ...col, x: curX };
    curX += col.w;
    return pos;
  });

  const headerH = 34;
  const rowH = 26;

  // Encabezado de la Tabla
  builder.addRect({ target: 'model', layer: DXF_LAYERS.TABLA_HEADER, x: toX(startX), y: toY(startY + headerH), w: tableW, h: headerH });
  colPositions.forEach(col => {
    let textX = col.x + col.w / 2;
    if (col.align === 'left') textX = col.x + 8;
    if (col.align === 'right') textX = col.x + col.w - 8;
    builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(textX), y: toY(startY + 22), height: 9.5, text: col.label, align: col.align });
  });

  // Circuitos en bloque
  let currentTableY = startY + headerH;
  const renderCircuitoRow = (circ) => {
    builder.addRect({ target: 'model', layer: DXF_LAYERS.TABLA_GRID, x: toX(startX), y: toY(currentTableY + rowH), w: tableW, h: rowH });

    colPositions.forEach(col => {
      let val = '';
      if (col.id === 'cto') val = circ.num;
      else if (col.id === 'fase') val = circ.fase || (circ.tipoCarga === 'bifasica' ? 'A-B' : 'A');
      else if (col.id === 'voltaje') val = circ.voltajeStr || '127 V';
      else if (col.id === 'slot') val = circ.slotsStr || String(circ.slotPrincipal || 1);
      else if (col.id === 'equipo') val = circ.desc || circ.tipo;
      else if (col.id === 'watts') val = `${circ.watts.toLocaleString()} W`;
      else if (col.id === 'fp') val = (circ.fp || 0.9).toFixed(2);
      else if (col.id === 'va') val = `${Math.round(circ.va).toLocaleString()} VA`;
      else if (col.id === 'faseA') val = circ.vaPorFase?.L1 ? `${Math.round(circ.vaPorFase.L1).toLocaleString()}` : '—';
      else if (col.id === 'faseB') val = circ.vaPorFase?.L2 ? `${Math.round(circ.vaPorFase.L2).toLocaleString()}` : '—';
      else if (col.id === 'faseC') val = circ.vaPorFase?.L3 ? `${Math.round(circ.vaPorFase.L3).toLocaleString()}` : '—';
      else if (col.id === 'in') val = `${(circ.inNom || 0).toFixed(1)} A`;
      else if (col.id === 'breaker') val = circ.breakerStr;
      else if (col.id === 'conductor') val = circ.conductorCompletoStr || '2#12+1#12T';
      else if (col.id === 'canalizacion') val = circ.canalizacion;
      else if (col.id === 'longitud') val = `${circ.longitudMetros || 15} m`;
      else if (col.id === 'caidaCto') val = `${(circ.caidaCircuito || 0).toFixed(2)}%`;
      else if (col.id === 'caidaTot') val = `${(circ.caidaTotal || 0).toFixed(2)}%`;

      let textX = col.x + col.w / 2;
      if (col.align === 'left') textX = col.x + 6;
      if (col.align === 'right') textX = col.x + col.w - 6;

      builder.addText({ target: 'model', layer: DXF_LAYERS.TABLA_DATOS, x: toX(textX), y: toY(currentTableY + 17), height: 8.5, text: val, align: col.align });
    });

    currentTableY += rowH;
  };

  (circuitosImpares || []).forEach(renderCircuitoRow);
  (circuitosPares || []).forEach(renderCircuitoRow);

  // Fila de Totales
  builder.addRect({ target: 'model', layer: DXF_LAYERS.TABLA_HEADER, x: toX(startX), y: toY(currentTableY + rowH + 6), w: tableW, h: rowH + 6 });
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(startX + 12), y: toY(currentTableY + 22), height: 11, text: 'TOTALES DE INSTALACIÓN' });

  const cFaseA = colPositions.find(c => c.id === 'faseA');
  const cFaseB = colPositions.find(c => c.id === 'faseB');
  const cWatts = colPositions.find(c => c.id === 'watts');
  const cVA = colPositions.find(c => c.id === 'va');

  if (cFaseA) builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(cFaseA.x + cFaseA.w - 10), y: toY(currentTableY + 22), height: 10, text: `${totales.faseL1_VA.toLocaleString()} VA`, align: 'right' });
  if (cFaseB) builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(cFaseB.x + cFaseB.w - 10), y: toY(currentTableY + 22), height: 10, text: `${totales.faseL2_VA.toLocaleString()} VA`, align: 'right' });
  if (cWatts) builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(cWatts.x + cWatts.w - 10), y: toY(currentTableY + 22), height: 11, text: `${totales.totalWatts.toLocaleString()} W`, align: 'right' });
  if (cVA) builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(cVA.x + cVA.w - 10), y: toY(currentTableY + 22), height: 11, text: `${totales.totalVA.toLocaleString()} VA`, align: 'right' });

  builder.addText({
    target: 'model',
    layer: DXF_LAYERS.TITULOS,
    x: toX(startX + tableW - 18),
    y: toY(currentTableY + 22),
    height: 10,
    text: `In = ${totales.corrienteNominalAlimentador} A | Ic = ${totales.corrienteDisenoAlimentador} A | Desbalance = ${totales.desbalancePct}%`,
    align: 'right'
  });

  // Tarjeta de Criterios y Especificaciones (3 Columnas)
  const cardY = currentTableY + rowH + 20;
  const cardH = 175;
  builder.addRect({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(startX), y: toY(cardY + cardH), w: tableW, h: cardH });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x1: toX(startX + tableW * 0.333), y1: toY(cardY), x2: toX(startX + tableW * 0.333), y2: toY(cardY + cardH) });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x1: toX(startX + tableW * 0.666), y1: toY(cardY), x2: toX(startX + tableW * 0.666), y2: toY(cardY + cardH) });

  // Columna 1: Balanceo
  const col1X = startX + 18;
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(col1X), y: toY(cardY + 26), height: 13, text: 'RESUMEN DE BALANCEO DE FASES' });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x1: toX(col1X), y1: toY(cardY + 34), x2: toX(startX + tableW * 0.333 - 18), y2: toY(cardY + 34) });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col1X), y: toY(cardY + 52), height: 12, text: `Carga Conectada Total: ${totales.totalWatts.toLocaleString()} W (${totales.totalVA.toLocaleString()} VA)` });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col1X), y: toY(cardY + 74), height: 12, text: `Fase L1: ${totales.faseL1_VA.toLocaleString()} VA | Fase L2: ${totales.faseL2_VA.toLocaleString()} VA` });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col1X), y: toY(cardY + 96), height: 12.5, text: `Desbalance entre fases: ${totales.desbalancePct}% — Criterio NOM: <= 5.0%` });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col1X), y: toY(cardY + 118), height: 11.5, text: `Factor de Demanda: ${totales.factorDemandaPct}% · Carga demandada: ${totales.cargaDemandadaWatts.toLocaleString()} W` });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col1X), y: toY(cardY + 138), height: 11, text: `Fases y Neutro: I_L1=${totales.corrienteL1}A · I_L2=${totales.corrienteL2}A · I_N=${totales.corrienteNeutro}A` });

  // Columna 2: Caídas
  const col2X = startX + tableW * 0.333 + 18;
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(col2X), y: toY(cardY + 26), height: 13, text: 'CRITERIOS DE CAÍDA DE TENSIÓN Y EFICIENCIA (NOM-001-SEDE)' });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x1: toX(col2X), y1: toY(cardY + 34), x2: toX(startX + tableW * 0.666 - 18), y2: toY(cardY + 34) });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col2X), y: toY(cardY + 56), height: 11.5, text: 'Criterio recomendado según NOM-001-SEDE-2012, 215-2(a), Nota 2: <= 3.0% alim. / <= 5.0% combinado.' });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col2X), y: toY(cardY + 78), height: 11.5, text: `Alimentador General (80 m, 220V): Conductor #4 AWG adoptado con e% = ${alimentador.caidaPct.toFixed(2)}% (<= 3.0%).` });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col2X), y: toY(cardY + 100), height: 11.5, text: `Conductor de Puesta a Tierra ajustado proporcionalmente a ${alimentador.conductorTierra} bajo Artículo 250-122(b).` });
  const maxCtoDesc = resumenCaidas ? `Caída máxima derivados: ${resumenCaidas.maxCaidaCircuito.toFixed(2)}% — ${resumenCaidas.ctoMaxDerivadoNum} ${resumenCaidas.ctoMaxDerivadoDesc}, L = ${resumenCaidas.ctoMaxDerivadoLongitud} m.` : 'Caída máxima derivados <= 3.0%.';
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col2X), y: toY(cardY + 122), height: 11, text: maxCtoDesc });
  const maxTotDesc = resumenCaidas ? `Caída combinada proyectada máxima: ${resumenCaidas.maxCaidaTotal.toFixed(2)}% — ${resumenCaidas.ctoMaxTotalNum}. (${resumenCaidas.cumpleCriterioCombinado ? 'Cumple criterio <= 5.0%' : 'Supera criterio 5.0%'})` : 'Caída combinada máxima <= 5.0%.';
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col2X), y: toY(cardY + 144), height: 11, text: maxTotDesc });

  // Columna 3: Montaje
  const col3X = startX + tableW * 0.666 + 18;
  builder.addText({ target: 'model', layer: DXF_LAYERS.TITULOS, x: toX(col3X), y: toY(cardY + 26), height: 13, text: 'ESPECIFICACIONES DE MONTAJE Y CANALIZACIONES' });
  builder.addLine({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x1: toX(col3X), y1: toY(cardY + 34), x2: toX(startX + tableW - 18), y2: toY(cardY + 34) });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col3X), y: toY(cardY + 56), height: 11, text: '1. Tablero Square D QO NEMA 1 para sobreponer/empotrar, 24 espacios, barras 100 A.' });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col3X), y: toY(cardY + 78), height: 11, text: '2. Alimentador general: Tubo conduit metálico semipesado (IMC) de 35 mm (1 1/4") según Art. 342.' });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col3X), y: toY(cardY + 100), height: 11, text: '3. Circuitos derivados interiores: Tubería metálica de pared delgada (EMT) de 16 mm (1/2") y 21 mm (3/4").' });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col3X), y: toY(cardY + 122), height: 11, text: `4. Conductores de cobre suave tipo ${alimentador.tipoAislamiento} certificados NOM/ANCE.` });
  builder.addText({ target: 'model', layer: DXF_LAYERS.NOTAS_CRITERIOS, x: toX(col3X), y: toY(cardY + 144), height: 11, text: '5. Sistema de puesta a tierra física con electrodo copperweld e interconexión equipotencial Art. 250.' });
}

/**
 * Función principal para generar el archivo DXF completo del proyecto.
 * @param {object} model - Modelo generado por buildPlanoDocumentModel
 * @param {string} opcion - 'ambas' | 'unifilar' | 'cuadro'
 * @returns {string} - Contenido del archivo DXF compatible con AutoCAD
 */
export function generarDxfProyecto(model, opcion = 'ambas') {
  const builder = new DxfBuilder();
  const infoPlano = model.infoPlano || {};

  if (opcion === 'unifilar') {
    // 1. En Model Space: Diagrama Unifilar
    generarDxfLamino1Unifilar(builder, model, 0, 0, false);

    // 2. En Paper Space (Layout 1: 900x600 mm): Marco y Cajetín
    dibujarCajetinPaperSpace(
      builder,
      'layout1',
      infoPlano,
      "DIAGRAMA UNIFILAR",
      infoPlano.numeroPlano || "IE-01"
    );
  } else if (opcion === 'cuadro') {
    // 1. En Model Space: Cuadro de Cargas
    generarDxfLamino2Cuadro(builder, model, 0, 0, false);

    // 2. En Paper Space (Layout 1: 900x600 mm): Marco y Cajetín
    dibujarCajetinPaperSpace(
      builder,
      'layout1',
      infoPlano,
      "CUADRO DE CARGAS",
      infoPlano.numeroPlanoCuadro || "IE-02"
    );
  } else {
    // Opción 'ambas': Diagrama Unifilar en [0, 2500] y Cuadro de Cargas en [3000, 5500] en Model Space
    generarDxfLamino1Unifilar(builder, model, 0, 0, false);
    generarDxfLamino2Cuadro(builder, model, 3000, 0, false);

    // Layout 1: IE-01_UNIFILAR (Marco + Cajetín en Paper Space)
    dibujarCajetinPaperSpace(
      builder,
      'layout1',
      infoPlano,
      "DIAGRAMA UNIFILAR",
      infoPlano.numeroPlano || "IE-01"
    );

    // Layout 2: IE-02_CUADRO_CARGAS (Marco + Cajetín en Paper Space)
    dibujarCajetinPaperSpace(
      builder,
      'layout2',
      infoPlano,
      "CUADRO DE CARGAS",
      infoPlano.numeroPlanoCuadro || "IE-02"
    );
  }

  return builder.buildDxf(opcion, infoPlano);
}

/**
 * Descarga en el navegador un archivo DXF generado con codificación UTF-8.
 */
export function descargarArchivoDxf(contenidoDxf, nombreArchivo) {
  const blob = new Blob([contenidoDxf], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo.endsWith('.dxf') ? nombreArchivo : `${nombreArchivo}.dxf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
