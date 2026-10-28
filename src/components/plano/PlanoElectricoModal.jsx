import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  Sliders, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { buildPlanoDocumentModel } from '../../utils/planoDocumentModel';
import { generarDxfProyecto, descargarArchivoDxf } from '../../utils/dxfGenerator';
import SheetDiagramaUnifilar from './SheetDiagramaUnifilar';
import SheetCuadroCargas from './SheetCuadroCargas';

export default function PlanoElectricoModal({
  isOpen,
  onClose,
  computedElectricalSystem,
  aparatos,
  planoMetadata,
  onUpdatePlanoMetadata
}) {
  const [activeSheet, setActiveSheet] = useState(1); // 1 = Unifilar, 2 = Cuadro
  const [paperSize, setPaperSize] = useState('ArchD'); // 'ArchD' (90x60cm), 'A3', 'Tabloid'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showDxfMenu, setShowDxfMenu] = useState(false);
  const dxfMenuRef = useRef(null);

  // Construir el modelo del documento consumiendo el motor de cálculo
  const model = useMemo(() => {
    return buildPlanoDocumentModel({
      computedElectricalSystem,
      aparatos,
      planoMetadata
    });
  }, [computedElectricalSystem, aparatos, planoMetadata]);

  // Manejo de teclado (Escape para cerrar, flechas para cambiar de lámina)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setActiveSheet(1);
      if (e.key === 'ArrowRight') setActiveSheet(2);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dimensiones del papel según selección
  const getPaperDimensions = (format) => {
    if (format === 'A3') {
      // 420 x 297 mm en puntos pt (1 mm = 2.83465 pt)
      return { w: 1190.55, h: 841.89, label: 'A3 Horizontal (420 × 297 mm)' };
    }
    if (format === 'Tabloid') {
      // 11" x 17" en puntos pt (1 in = 72 pt) -> 1224 x 792 pt
      return { w: 1224, h: 792, label: 'Doble Carta / Tabloide (11" × 17")' };
    }
    // Arch D (36" x 24" / 90 x 60 cm) -> 2592 x 1728 pt (Idéntico a MYKA)
    return { w: 2592, h: 1728, label: 'Arch D (90 × 60 cm · 36" × 24")' };
  };

  // Función principal de exportación a PDF Multipágina Vectorial
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);

      const dims = getPaperDimensions(paperSize);

      // Instanciamos jsPDF con orientación horizontal exacta
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [dims.w, dims.h]
      });

      // Referencias a los SVGs ocultos completos
      const svgUnifilar = document.getElementById('sheet-unifilar-export-svg');
      const svgCuadro = document.getElementById('sheet-cuadro-export-svg');

      if (!svgUnifilar || !svgCuadro) {
        throw new Error('No se encontraron los lienzos vectoriales para exportar.');
      }

      // PÁGINA 1: DIAGRAMA UNIFILAR
      await svg2pdf(svgUnifilar, doc, {
        x: 0,
        y: 0,
        width: dims.w,
        height: dims.h
      });

      // PÁGINA 2: CUADRO DE CARGAS
      doc.addPage([dims.w, dims.h], 'landscape');
      await svg2pdf(svgCuadro, doc, {
        x: 0,
        y: 0,
        width: dims.w,
        height: dims.h
      });

      // Generar nombre de archivo limpio
      const cleanProj = (model.infoPlano.proyecto || 'Proyecto')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_');
      const cleanPlaza = (model.infoPlano.plaza || 'Plaza')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_');

      const fileName = `Proyecto_Electrico_${cleanProj}_${cleanPlaza}.pdf`;

      // Guardar PDF
      doc.save(fileName);
    } catch (err) {
      console.error('Error generando PDF vectorial:', err);
      alert(`Error generando el documento PDF: ${err.message || err}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Cerrar menú DXF al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dxfMenuRef.current && !dxfMenuRef.current.contains(e.target)) {
        setShowDxfMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función principal de exportación a AutoCAD DXF 2016 (2 Láminas, Capas, Grosores y Layouts)
  const handleDownloadDXF = (opcion = 'ambas') => {
    setShowDxfMenu(false);
    try {
      const cleanProj = (model.infoPlano.proyecto || 'Proyecto')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_');
      const cleanPlaza = (model.infoPlano.plaza || 'Plaza')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_');

      const sufijo = opcion === 'unifilar' 
        ? '_IE-01_Unifilar' 
        : opcion === 'cuadro' 
          ? '_IE-02_Cuadro' 
          : '_2Laminas';
      const fileName = `Plano_Electrico_${cleanProj}_${cleanPlaza}${sufijo}.dxf`;

      const dxfContent = generarDxfProyecto(model, opcion);
      descargarArchivoDxf(dxfContent, fileName);
    } catch (err) {
      console.error('Error generando DXF:', err);
      alert(`Error generando el archivo AutoCAD DXF: ${err.message || err}`);
    }
  };

  // Imprimir lámina activa con diálogo del sistema
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 text-slate-200">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* ================================================================= */}
        {/* HEADER / TOOLBAR SUPERIOR                                        */}
        {/* ================================================================= */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md flex-shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
                Plano Eléctrico Profesional (NOM-001-SEDE)
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Formato CAD · 2 Láminas
                </span>
              </h2>
              <p className="text-[10.5px] text-slate-400 font-sans">
                {model.infoPlano.proyecto} · {model.infoPlano.plaza} ({model.infoPlano.local}) · {model.circuitos.length} Circuitos
              </p>
            </div>
          </div>

          {/* Selector de Lámina (Tabs) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveSheet(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSheet === 1
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Lámina 1: Diagrama Unifilar</span>
              <span className="text-[9px] font-mono opacity-80">(IE-01)</span>
            </button>

            <button
              onClick={() => setActiveSheet(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSheet === 2
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Lámina 2: Cuadro de Cargas</span>
              <span className="text-[9px] font-mono opacity-80">(IE-02)</span>
            </button>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2">
            {/* Selector de tamaño de hoja */}
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-teal-400 cursor-pointer"
              title="Tamaño de papel para exportación"
            >
              <option value="ArchD">Arch D (90×60 cm · 36"×24" Plaza)</option>
              <option value="A3">A3 Horizontal (420×297 mm)</option>
              <option value="Tabloid">Tabloide / Doble Carta (11"×17")</option>
            </select>

            {/* Botón editar cajetín */}
            <button
              onClick={() => setShowConfigPanel(v => !v)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                showConfigPanel
                  ? 'bg-slate-800 text-teal-400 border-teal-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Settings size={14} />
              <span>Datos del Plano</span>
            </button>

            {/* Botón Imprimir */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Imprimir lámina actual"
            >
              <Printer size={14} />
              <span>Imprimir</span>
            </button>

            {/* Menú de Exportación AutoCAD DXF (Compatible AutoCAD 2016) */}
            <div className="relative" ref={dxfMenuRef}>
              <button
                onClick={() => setShowDxfMenu(v => !v)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95"
                title="Exportar archivo vectorial compatible con AutoCAD 2016 (2 Láminas, Capas, Grosores y Layouts)"
              >
                <Layers size={14} />
                <span>AutoCAD DXF</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${showDxfMenu ? 'rotate-180' : ''}`} />
              </button>

              {showDxfMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Exportar Formato AutoCAD 2016 (.DXF)
                  </div>
                  <button
                    onClick={() => handleDownloadDXF('ambas')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Download size={14} className="text-teal-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-white">Proyecto Completo (2 Láminas)</div>
                      <div className="text-[10px] text-slate-400">Unifilar + Cuadro en Model Space y Layouts</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDownloadDXF('unifilar')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Download size={14} className="text-blue-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-white">Lámina 1: Diagrama Unifilar</div>
                      <div className="text-[10px] text-slate-400">Plano IE-01 independiente</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDownloadDXF('cuadro')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Download size={14} className="text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-white">Lámina 2: Cuadro de Cargas</div>
                      <div className="text-[10px] text-slate-400">Plano IE-02 con balance y notas NOM</div>
                    </div>
                  </button>
                  <div className="px-3 py-1.5 text-[9.5px] text-slate-400 border-t border-slate-800 bg-slate-950/50">
                    ⚡ Compatible con AutoCAD 2016 y versiones posteriores.<br/>
                    📐 Incluye capas normativas ACI, grosores y espacio papel.
                  </div>
                </div>
              )}
            </div>

            {/* Botón Descargar PDF Directo */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isGeneratingPdf ? 'Compilando PDF...' : 'Descargar PDF (2 Láminas)'}</span>
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Cerrar vista previa"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BARRA DE PRE-FLIGHT / ESTADO TÉCNICO                             */}
        {/* ================================================================= */}
        <div className="px-5 py-2 bg-slate-950 border-b border-slate-850 flex items-center justify-between text-[11px] font-sans">
          <div className="flex items-center gap-2">
            {model.sanidad.valido ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 size={13} />
                Documento verificado: 100% de coherencia técnica · {model.circuitos.length} circuitos validados
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertTriangle size={13} />
                Se detectaron incongruencias: {model.sanidad.errores[0]}
              </span>
            )}
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Alimentador: ΔV = <strong className="text-teal-400">{model.alimentador.caidaPct.toFixed(2)}%</strong> ({model.alimentador.longitudMetros}m)
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Caída combinada máx: <strong className={model.resumenCaidas?.cumpleCriterioCombinado ? "text-emerald-400" : "text-amber-400"}>{model.resumenCaidas?.maxCaidaTotal.toFixed(2)}%</strong> ({model.resumenCaidas?.ctoMaxTotalNum})
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Desbalanceo: <strong className="text-emerald-400">{model.totales.desbalancePct}%</strong> (&lt;= 5%)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Controles de Zoom */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setZoomLevel(z => Math.max(50, z - 15))}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Alejar"
              >
                <ZoomOut size={12} />
              </button>
              <span className="text-[10px] font-mono text-slate-300 w-10 text-center font-bold">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(z => Math.min(200, z + 15))}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Acercar"
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 text-slate-500 hover:text-teal-400 cursor-pointer ml-1"
                title="Restablecer tamaño"
              >
                <RotateCcw size={10} />
              </button>
            </div>

            {/* Paginación */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSheet(1)}
                disabled={activeSheet === 1}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10.5px] font-mono text-slate-400 px-1">
                Lámina {activeSheet} de 2
              </span>
              <button
                onClick={() => setActiveSheet(2)}
                disabled={activeSheet === 2}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ÁREA CENTRAL DE VISUALIZACIÓN Y PANEL DE CONFIGURACIÓN            */}
        {/* ================================================================= */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* LIENZO DE LA LÁMINA (VISTA PREVIA CAD) */}
          <div className="flex-1 bg-[#1e293b]/20 p-4 sm:p-6 overflow-auto flex items-center justify-center">
            <div
              style={{
                width: `${zoomLevel}%`,
                maxWidth: zoomLevel <= 100 ? '100%' : 'none',
                transition: 'width 0.2s ease-out'
              }}
              className="bg-white rounded shadow-2xl overflow-hidden border border-slate-300"
            >
              {activeSheet === 1 ? (
                <SheetDiagramaUnifilar model={model} id="sheet-unifilar-preview-svg" />
              ) : (
                <SheetCuadroCargas model={model} id="sheet-cuadro-preview-svg" />
              )}
            </div>
          </div>

          {/* PANEL LATERAL DE CONFIGURACIÓN DEL CAJETÍN / DATOS DE PLANO */}
          {showConfigPanel && (
            <div className="w-80 sm:w-96 bg-slate-950 border-l border-slate-800 p-5 overflow-y-auto space-y-4 shadow-2xl animate-fadeIn text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Settings size={14} />
                  Datos del Plano (Cajetín)
                </h3>
                <button
                  onClick={() => setShowConfigPanel(false)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    value={model.infoPlano.proyecto}
                    onChange={(e) => onUpdatePlanoMetadata({ proyecto: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Nombre Comercial / Marca
                  </label>
                  <input
                    type="text"
                    value={model.infoPlano.nombreComercial}
                    onChange={(e) => onUpdatePlanoMetadata({ nombreComercial: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                      Plaza Comercial
                    </label>
                    <input
                      type="text"
                      value={model.infoPlano.plaza}
                      onChange={(e) => onUpdatePlanoMetadata({ plaza: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                      No. Local
                    </label>
                    <input
                      type="text"
                      value={model.infoPlano.local}
                      onChange={(e) => onUpdatePlanoMetadata({ local: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Cliente / Propietario
                  </label>
                  <input
                    type="text"
                    value={model.infoPlano.cliente}
                    onChange={(e) => onUpdatePlanoMetadata({ cliente: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Ubicación / Dirección
                  </label>
                  <input
                    type="text"
                    value={model.infoPlano.ubicacion}
                    onChange={(e) => onUpdatePlanoMetadata({ ubicacion: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                      Fecha de Emisión
                    </label>
                    <input
                      type="text"
                      value={model.infoPlano.fecha}
                      onChange={(e) => onUpdatePlanoMetadata({ fecha: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                      Escala Gráfica
                    </label>
                    <input
                      type="text"
                      value={model.infoPlano.escala}
                      onChange={(e) => onUpdatePlanoMetadata({ escala: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Responsable Técnico / DRO
                  </label>
                  <input
                    type="text"
                    value={model.infoPlano.responsable}
                    onChange={(e) => onUpdatePlanoMetadata({ responsable: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Cédula Profesional / Registro UVIE
                  </label>
                  <input
                    type="text"
                    value={model.infoPlano.cedula}
                    onChange={(e) => onUpdatePlanoMetadata({ cedula: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                      Dibujó
                    </label>
                    <input
                      type="text"
                      value={model.infoPlano.dibujo}
                      onChange={(e) => onUpdatePlanoMetadata({ dibujo: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                      Revisó
                    </label>
                    <input
                      type="text"
                      value={model.infoPlano.reviso}
                      onChange={(e) => onUpdatePlanoMetadata({ reviso: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Factor de Demanda (0.5 a 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="1.0"
                    value={planoMetadata?.factorDemanda || 1.0}
                    onChange={(e) => onUpdatePlanoMetadata({ factorDemanda: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-teal-400"
                  />
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    1.0 = 100% Carga Instalada. 0.75 = 75% Carga Demandada para Plaza Comercial.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Conductor Alimentador ({model.alimentador.longitudMetros} m)
                  </label>
                  <select
                    value={planoMetadata?.alimentadorConductor || 'Auto'}
                    onChange={(e) => onUpdatePlanoMetadata({ alimentadorConductor: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Auto">Auto (#4 AWG Definitivo Proyecto Ejecutivo · e% &lt;= 3.0%)</option>
                    <option value="4 AWG">#4 AWG Cu (Definitivo Proyecto · e% = {model.alimentador.caidaPct}% · Tierra #8 AWG)</option>
                    <option value="6 AWG">#6 AWG Cu (Solo Ampacidad 60A · e% = 4.60% · Tierra #10 AWG)</option>
                    <option value="2 AWG">#2 AWG Cu (Sobredimensionado · e% = 1.82% · Tierra #6 AWG)</option>
                  </select>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Conductor #4 AWG garantiza caída &lt;= 3.0% a 80m. La tierra física se ajusta a #8 AWG (Art. 250-122.b).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* CONTENEDOR OCULTO DE AMBAS LÁMINAS PARA GENERACIÓN PDF            */}
        {/* ================================================================= */}
        <div style={{ position: 'fixed', left: '-99999px', top: '-99999px', width: '2592px', height: '1728px', opacity: 0, pointerEvents: 'none' }}>
          <SheetDiagramaUnifilar model={model} id="sheet-unifilar-export-svg" />
          <SheetCuadroCargas model={model} id="sheet-cuadro-export-svg" />
        </div>
      </div>
    </div>
  );
}
