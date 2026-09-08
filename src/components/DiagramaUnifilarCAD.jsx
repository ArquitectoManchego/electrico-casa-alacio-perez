import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Printer, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, X, Settings } from 'lucide-react';
import { 
  calcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor,
  calcularCaidaTension,
  calcularAlimentadorGeneral
} from '../utils/ecuacionesUVIE';

export default function DiagramaUnifilarCAD({ 
  aparatos, 
  acometida, 
  proyecto, 
  onUpdateProyectoProps,
  fasesUnit = 'VA' 
}) {
  const [jsonError, setJsonError] = useState("");
  
  // Modal de trazado (AutoCAD style)
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [plotPaperSize, setPlotPaperSize] = useState('Letter'); // 'Letter', 'Ledger', 'Legal', 'ArchD'
  const [plotOrientation, setPlotOrientation] = useState('landscape'); // 'landscape', 'portrait'
  const [plotArea, setPlotArea] = useState('extent'); // 'extent', 'window'
  const [plotWindow, setPlotWindow] = useState({ x: -100, y: -50, w: 2300, h: 1000 });
  const [plotScale, setPlotScale] = useState('fit'); // 'fit', '1:1', '1:10', '1:20', '1:50'
  const [plotMonochrome, setPlotMonochrome] = useState(true);

  // Pan & Zoom State
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: -100, y: -50, w: 2300, h: 1400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoomPercent = useMemo(() => {
    return Math.round((2300 / viewBox.w) * 100);
  }, [viewBox.w]);

  // Calcular la carga total para dimensionar el alimentador
  const totalVA = useMemo(() => {
    return aparatos.reduce((sum, ap) => sum + calcularVA(ap.watts, ap.fp, ap.usarVaDirecto), 0);
  }, [aparatos]);

  // Dimensionamiento del Alimentador Principal
  const alimPrincipal = useMemo(() => {
    return calcularAlimentadorGeneral(totalVA, acometida.id, proyecto.alimentadorLongitud);
  }, [totalVA, acometida.id, proyecto.alimentadorLongitud]);

  // Procesar circuitos con calibres y caídas de tensión individuales
  const computedCircuits = useMemo(() => {
    return aparatos.map((ap, index) => {
      const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
      const inAmps = calcularCorrienteNominal(va, ap.tipoCarga);
      const icAmps = calcularCorrienteCorregida(inAmps);
      
      const autoProteccion = seleccionarProteccion(icAmps);
      const activeProteccion = ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? parseInt(ap.overrideBreaker) : autoProteccion;
      
      const autoConductor = seleccionarConductor(activeProteccion);
      const activeConductor = ap.overrideCable && ap.overrideCable !== 'Auto' ? ap.overrideCable : autoConductor;

      const vd = calcularCaidaTension(
        ap.longitudMetros !== undefined ? ap.longitudMetros : 15,
        icAmps,
        ap.tipoCarga,
        activeConductor
      );

      const awg = activeConductor.split(' ')[0];
      let conductorStr = "";
      if (ap.tipoCarga === 'monofasica') conductorStr = `2 # ${awg} + 1 # ${awg} T`;
      if (ap.tipoCarga === 'bifasica') conductorStr = `3 # ${awg} + 1 # ${awg} T`;
      if (ap.tipoCarga === 'trifasica') conductorStr = `4 # ${awg} + 1 # ${awg} T`;

      // Caída de tensión acumulada (Alimentador principal + circuito derivado)
      const caidaTotal = (alimPrincipal?.caida || 0) + vd;

      return {
        ...ap,
        num: `C-${index + 1}`,
        va,
        inAmps,
        icAmps,
        breaker: activeProteccion,
        conductor: activeConductor,
        conductorStr,
        vd,
        caidaTotal,
        isVdCritical: caidaTotal > 5.0 // NOM-001-SEDE: Caída de tensión total max 5%
      };
    });
  }, [aparatos, alimPrincipal, acometida.id]);

  // Controles de Pan & Zoom
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'input' || e.target.tagName === 'select' || e.target.tagName === 'button') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const scaleX = viewBox.w / (svgRef.current?.clientWidth || 1);
    const scaleY = viewBox.h / (svgRef.current?.clientHeight || 1);
    
    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx * scaleX,
      y: prev.y - dy * scaleY
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    const zoomFactor = 1.05;
    let newW, newH;
    
    if (e.deltaY > 0) {
      newW = viewBox.w * zoomFactor;
      newH = viewBox.h * zoomFactor;
    } else {
      newW = viewBox.w / zoomFactor;
      newH = viewBox.h / zoomFactor;
    }
    
    const dx = (viewBox.w - newW) / 2;
    const dy = (viewBox.h - newH) / 2;
    
    setViewBox({
      x: viewBox.x + dx,
      y: viewBox.y + dy,
      w: newW,
      h: newH
    });
  };

  const resetZoom = () => {
    setViewBox({ x: -100, y: -50, w: 2300, h: 100 + (Math.max(6, computedCircuits.length) * 120) + 300 });
  };

  useEffect(() => {
    resetZoom();
  }, [computedCircuits.length]);

  const plotPaperDimensions = (size, orient) => {
    let w = 279, h = 216;
    if (size === 'Letter') { w = 279; h = 216; }
    else if (size === 'Ledger') { w = 432; h = 279; }
    else if (size === 'Legal') { w = 356; h = 216; }
    else if (size === 'ArchD') { w = 914; h = 610; }

    if (orient === 'portrait') {
      return { pw: h, ph: w, ratio: h / w };
    }
    return { pw: w, ph: h, ratio: w / h };
  };

  const plotCalculatedViewBox = useMemo(() => {
    const { pw, ph } = plotPaperDimensions(plotPaperSize, plotOrientation);
    let cx = 1050; 
    let cy = (100 + (Math.max(6, computedCircuits.length) * 120) + 200) / 2 - 50;

    if (plotArea === 'window') {
      cx = plotWindow.x + plotWindow.w / 2;
      cy = plotWindow.y + plotWindow.h / 2;
    }

    if (plotScale === 'fit') {
      if (plotArea === 'window') {
        return {
          x: plotWindow.x,
          y: plotWindow.y,
          w: plotWindow.w,
          h: plotWindow.h
        };
      }
      return {
        x: -100,
        y: -50,
        w: 2300,
        h: 100 + (Math.max(6, computedCircuits.length) * 120) + 200
      };
    } else {
      const scaleNum = parseFloat(plotScale.split(':')[1]) || 1;
      const w_units = pw * scaleNum;
      const h_units = ph * scaleNum;
      
      return {
        x: cx - w_units / 2,
        y: cy - h_units / 2,
        w: w_units,
        h: h_units
      };
    }
  }, [plotPaperSize, plotOrientation, plotArea, plotWindow, plotScale, computedCircuits.length]);

  const triggerActualPrint = () => {
    const svgElement = document.getElementById('diagrama-unifilar-svg');
    if (!svgElement) return;
    
    const svgClone = svgElement.cloneNode(true);
    svgClone.setAttribute('viewBox', `${plotCalculatedViewBox.x} ${plotCalculatedViewBox.y} ${plotCalculatedViewBox.w} ${plotCalculatedViewBox.h}`);
    svgClone.setAttribute('class', 'print-only-svg');
    svgClone.removeAttribute('style');
    
    // Quitar ventana roja del clon
    const selectionRect = svgClone.querySelector('rect[stroke="#f43f5e"]');
    if (selectionRect) {
      selectionRect.remove();
    }
    
    const styleNode = document.createElementNS("http://www.w3.org/2000/svg", "style");
    if (plotMonochrome) {
      styleNode.innerHTML = `
        rect, circle, path, line { stroke: #000000 !important; fill: none !important; }
        rect.cad-bg { fill: #ffffff !important; }
        text { fill: #000000 !important; stroke: none !important; }
        circle { fill: #ffffff !important; }
        .cad-stroke-danger { stroke: #000000 !important; stroke-dasharray: 4 2 !important; }
        .cad-text-danger { fill: #000000 !important; font-weight: bold !important; }
        .cad-busbar { stroke: #1a1a1a !important; }
        .cad-busbar-bg { stroke: #ffffff !important; }
      `;
    } else {
      styleNode.innerHTML = `
        rect.cad-bg { fill: #0b0f19 !important; }
        .cad-stroke { stroke: #38bdf8 !important; }
        .cad-text { fill: #f1f5f9 !important; }
        .cad-text-danger { fill: #f43f5e !important; }
        .cad-stroke-danger { stroke: #f43f5e !important; }
        .cad-busbar { stroke: #fbbf24 !important; }
        .cad-busbar-bg { stroke: #1e293b !important; }
      `;
    }
    svgClone.appendChild(styleNode);
    
    const printContainer = document.createElement('div');
    printContainer.id = 'print-temp-container';
    printContainer.style.position = 'fixed';
    printContainer.style.left = '0';
    printContainer.style.top = '0';
    printContainer.style.width = '100vw';
    printContainer.style.height = '100vh';
    printContainer.style.zIndex = '99999';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.appendChild(svgClone);
    
    const styleCss = document.createElement('style');
    styleCss.id = 'print-temp-style';
    styleCss.innerHTML = `
      @media print {
        body > :not(#print-temp-container) {
          display: none !important;
        }
        #print-temp-container {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        svg {
          width: 100% !important;
          height: 100% !important;
        }
      }
      @media screen {
        #print-temp-container {
          display: none !important;
        }
      }
    `;
    
    document.body.appendChild(printContainer);
    document.body.appendChild(styleCss);
    
    setTimeout(() => {
      window.print();
      document.body.removeChild(printContainer);
      document.body.removeChild(styleCss);
    }, 150);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('diagrama-unifilar-svg');
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Diagrama_Unifilar_NOM.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Coordenadas de las barras colectoras del tablero
  const getFaseCoordinates = (faseStr) => {
    if (acometida.id === 'monofasico') {
      return { startX: 0, pathD: "M 0,0 L 100,0" };
    }
    const r = 6;
    if (acometida.id === 'bifasico') {
      if (faseStr.includes('A')) {
        return { startX: -15, pathD: `M -15,0 L ${15 - r},0 A ${r} ${r} 0 0 1 ${15 + r},0 L 100,0` };
      }
      return { startX: 15, pathD: "M 15,0 L 100,0" };
    }
    // Trifásico
    if (faseStr.includes('A')) {
      return { startX: -30, pathD: `M -30,0 L -${r},0 A ${r} ${r} 0 0 1 ${r},0 L ${30 - r},0 A ${r} ${r} 0 0 1 ${30 + r},0 L 100,0` };
    }
    if (faseStr.includes('B')) {
      return { startX: 0, pathD: `M 0,0 L ${30 - r},0 A ${r} ${r} 0 0 1 ${30 + r},0 L 100,0` };
    }
    return { startX: 30, pathD: "M 30,0 L 100,0" };
  };

  const totalHeight = 100 + (Math.max(6, computedCircuits.length) * 120) + 200;

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-slate-950/20 rounded-2xl border border-slate-900 overflow-hidden font-sans">
      
      {/* SIDEBAR: Configuración de Alimentador y Cajetín (no-print) */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-slate-950/50 border-r border-slate-900 p-5 flex flex-col gap-5 no-print">
        <div>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3">Parámetros del Alimentador</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Distancia al Medidor (m)
              </label>
              <input
                type="number"
                value={proyecto.alimentadorLongitud}
                onChange={(e) => onUpdateProyectoProps({ alimentadorLongitud: parseFloat(e.target.value) || 0 })}
                min="1"
                className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Diámetro de Tubería Principal
              </label>
              <select
                value={proyecto.alimentadorTuberia}
                onChange={(e) => onUpdateProyectoProps({ alimentadorTuberia: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-200 border-slate-800"
              >
                <option value='16 mm (1/2")' className="bg-slate-900">16 mm (1/2")</option>
                <option value='21 mm (3/4")' className="bg-slate-900">21 mm (3/4")</option>
                <option value='27 mm (1")' className="bg-slate-900">27 mm (1")</option>
                <option value='35 mm (1 1/4")' className="bg-slate-900">35 mm (1 1/4")</option>
                <option value='41 mm (1 1/2")' className="bg-slate-900">41 mm (1 1/2")</option>
                <option value='53 mm (2")' className="bg-slate-900">53 mm (2")</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Tipo de Tubería Principal
              </label>
              <input
                type="text"
                value={proyecto.alimentadorTuberiaTipo}
                onChange={(e) => onUpdateProyectoProps({ alimentadorTuberiaTipo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-200"
              />
            </div>
          </div>
        </div>



        {/* Resumen del alimentador */}
        <div className="mt-auto border-t border-slate-900 pt-4 bg-teal-500/5 p-3 rounded-xl border border-teal-500/10">
          <h4 className="text-xs font-bold text-teal-400 mb-2 uppercase tracking-wide">Cálculo del Alimentador:</h4>
          {alimPrincipal && (
            <ul className="space-y-1 text-[11px] font-mono text-slate-300">
              <li>Demanda Total: <strong>{(totalVA / 1000).toFixed(2)} kVA</strong></li>
              <li>Corr. Corregida: <strong>{alimPrincipal.icorregida} A</strong></li>
              <li>ITM Principal: <strong>{alimPrincipal.polos}x{alimPrincipal.breaker}A</strong></li>
              <li>Caída Alimentador: <strong className={alimPrincipal.caida > 2.00 ? 'text-rose-400 font-bold' : 'text-teal-400'}>{alimPrincipal.caida}%</strong></li>
            </ul>
          )}
        </div>

        {/* Acciones de exportación */}
        <div className="flex gap-2">
          <button
            onClick={handleDownloadSVG}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            Descargar SVG
          </button>
          <button
            onClick={() => setShowPlotModal(true)}
            className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} />
            Trazar Plano
          </button>
        </div>
      </div>

      {/* CANVAS: Área de renderizado del SVG */}
      <div 
        className="flex-1 relative cursor-grab active:cursor-grabbing bg-[#0b0f19] select-none h-[75vh] lg:h-[80vh] border border-slate-900 rounded-xl overflow-hidden print:w-full print:h-full print:absolute print:left-0 print:top-0 print:bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          id="diagrama-unifilar-svg"
          ref={svgRef}
          className="w-full h-full"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
              .cad-bg { fill: #0b0f19; }
              .cad-stroke { stroke: #38bdf8; }
              .cad-text { fill: #f1f5f9; }
              .cad-text-danger { fill: #f43f5e; font-weight: bold; }
              .cad-stroke-danger { stroke: #f43f5e; }
              .cad-busbar { stroke: #fbbf24; stroke-width: 5; stroke-linecap: round; }
              .cad-busbar-bg { stroke: #1e293b; stroke-width: 9; stroke-linecap: round; }
              
              @media print {
                .cad-bg { fill: #ffffff; }
                .cad-stroke { stroke: #000000 !important; }
                .cad-text { fill: #000000 !important; }
                .cad-busbar { stroke: #1a1a1a !important; }
                .cad-busbar-bg { stroke: #ffffff !important; }
                .cad-text-danger { fill: #000000 !important; }
                .cad-stroke-danger { stroke: #000000 !important; stroke-dasharray: 4 2; }
              }
            `}
          </style>

          {/* Fondo */}
          <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.w + 2000} height={viewBox.h + 2000} className="cad-bg" />

          {/* Ventana de Trazado AutoCAD (Solo visible si está en modo ventana) */}
          {plotArea === 'window' && (
            <rect 
              x={plotWindow.x} 
              y={plotWindow.y} 
              width={plotWindow.w} 
              height={plotWindow.h} 
              fill="rgba(244, 63, 94, 0.03)" 
              stroke="#f43f5e" 
              strokeWidth="3" 
              strokeDasharray="10 5" 
              className="print:hidden"
            />
          )}

          {/* --- GRUPO PRINCIPAL --- */}
          <g className="cad-text font-sans">
            
            {/* 1. ACOMETIDA Y MEDICIÓN */}
            <g transform="translate(450, 80)">
              <line x1="0" y1="0" x2="0" y2="350" className="cad-stroke" strokeWidth="3" />
              
              {/* Símbolo Acometida CFE */}
              <polygon points="0,0 -15,-25 15,-25" className="cad-stroke" fill="none" strokeWidth="2.5" />
              <text x="25" y="-12" className="text-[20px] font-bold fill-current">ACOMETIDA CFE</text>
              <text x="25" y="8" className="text-[14px] fill-current opacity-70">
                {acometida.id === 'monofasico' ? '1Ф - 2 Hilos (127V)' : (acometida.id === 'bifasico' ? '2Ф - 3 Hilos (220V)' : '3Ф - 4 Hilos (220V)')}
              </text>
              <text x="25" y="24" className="text-[12px] fill-current opacity-60">Voltaje Nominal: {alimPrincipal?.voltaje}V | 60 Hz</text>

              {/* Medidor Circular */}
              <g transform="translate(0, 140)">
                <circle cx="0" cy="0" r="30" className="cad-stroke" fill="#0b0f19" strokeWidth="3" />
                <text x="0" y="6" textAnchor="middle" className="text-[20px] font-bold fill-current">Wh</text>
                <text x="45" y="5" className="text-[14px] font-bold fill-current">MEDIDOR</text>
              </g>

              {/* Interruptor Principal */}
              <g transform="translate(0, 280)">
                <rect x="-25" y="-15" width="50" height="30" className="cad-stroke" fill="none" strokeWidth="2.5" />
                <line x1="-15" y1="0" x2="15" y2="0" className="cad-stroke" strokeWidth="2.5" />
                {alimPrincipal?.polos > 1 && <line x1="-10" y1="-10" x2="10" y2="10" className="cad-stroke" strokeWidth="2" />}
                {alimPrincipal?.polos > 2 && <line x1="-5" y1="-10" x2="15" y2="10" className="cad-stroke" strokeWidth="2" />}
                
                <text x="45" y="-3" className="text-[15px] font-bold fill-current">INTERRUPTOR GENERAL</text>
                <text x="45" y="14" className="text-[13px] fill-current opacity-75 font-mono">
                  Termomagnético {alimPrincipal?.polos}x{alimPrincipal?.breaker}A | 10 kA
                </text>
                <text x="45" y="30" className="text-[11px] fill-current opacity-65 font-mono">
                  Alim: {alimPrincipal?.polos} # {alimPrincipal?.conductor} + 1 # {alimPrincipal?.neutro} (N) + 1 # {alimPrincipal?.tierra} (T) THW-LS
                </text>
                <text x="45" y="45" className="text-[11px] fill-current opacity-65 font-mono">
                  Canalización: {proyecto.alimentadorTuberia} / {proyecto.alimentadorTuberiaTipo}
                </text>
                <text x="45" y="60" className={`text-[11px] font-bold font-mono ${alimPrincipal?.caida > 2.00 ? 'cad-text-danger' : 'text-teal-400'}`}>
                  L: {proyecto.alimentadorLongitud} m | ΔV Alimentador: {alimPrincipal?.caida}%
                </text>
              </g>
            </g>

            {/* 2. CENTRO DE CARGA Y BARRAS */}
            <g transform="translate(450, 480)">
              {/* Caja del Tablero */}
              <rect x="-90" y="0" width="1650" height={100 + (computedCircuits.length * 120)} className="cad-stroke" fill="none" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.4" />
              <text x="-70" y="35" className="text-[20px] font-bold fill-current">CENTRO DE CARGA 'T-1'</text>
              
              {/* Sistema de Barras dinámico */}
              <g transform="translate(0, 70)">
                {/* Monofásico */}
                {acometida.id === 'monofasico' && (
                  <>
                    <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="cad-busbar-bg" />
                    <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="cad-busbar" />
                    <text x="0" y="-12" textAnchor="middle" className="text-[12px] font-bold fill-current">L1</text>
                  </>
                )}
                
                {/* Bifásico */}
                {acometida.id === 'bifasico' && (
                  <>
                    <line x1="-15" y1="0" x2="-15" y2={computedCircuits.length * 120} className="cad-busbar-bg" />
                    <line x1="-15" y1="0" x2="-15" y2={computedCircuits.length * 120} className="cad-busbar" />
                    <line x1="15" y1="0" x2="15" y2={computedCircuits.length * 120} className="cad-busbar-bg" />
                    <line x1="15" y1="0" x2="15" y2={computedCircuits.length * 120} className="cad-busbar" />
                    <text x="-15" y="-12" textAnchor="middle" className="text-[12px] font-bold fill-current">L1</text>
                    <text x="15" y="-12" textAnchor="middle" className="text-[12px] font-bold fill-current">L2</text>
                  </>
                )}

                {/* Trifásico */}
                {acometida.id === 'trifasico' && (
                  <>
                    <line x1="-30" y1="0" x2="-30" y2={computedCircuits.length * 120} className="cad-busbar-bg" />
                    <line x1="-30" y1="0" x2="-30" y2={computedCircuits.length * 120} className="cad-busbar" />
                    <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="cad-busbar-bg" />
                    <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="cad-busbar" />
                    <line x1="30" y1="0" x2="30" y2={computedCircuits.length * 120} className="cad-busbar-bg" />
                    <line x1="30" y1="0" x2="30" y2={computedCircuits.length * 120} className="cad-busbar" />
                    <text x="-30" y="-12" textAnchor="middle" className="text-[12px] font-bold fill-current">L1</text>
                    <text x="0" y="-12" textAnchor="middle" className="text-[12px] font-bold fill-current">L2</text>
                    <text x="30" y="-12" textAnchor="middle" className="text-[12px] font-bold fill-current">L3</text>
                  </>
                )}

                {/* Barra de Neutro y Tierra (A la izquierda aisladas) */}
                <line x1="-70" y1="0" x2="-70" y2={computedCircuits.length * 120} stroke="#64748b" strokeWidth="3" />
                <text x="-70" y="-12" textAnchor="middle" className="text-[11px] font-bold fill-current">N</text>
                
                <line x1="-50" y1="0" x2="-50" y2={computedCircuits.length * 120} stroke="#22c55e" strokeWidth="3" />
                <text x="-50" y="-12" textAnchor="middle" className="text-[11px] font-bold fill-current">T</text>
                
                {/* Símbolo de Tierra Física al final de la barra de tierra */}
                <g transform={`translate(-50, ${computedCircuits.length * 120 + 10})`}>
                  <line x1="-10" y1="0" x2="10" y2="0" className="cad-stroke" strokeWidth="2" />
                  <line x1="-6" y1="4" x2="6" y2="4" className="cad-stroke" strokeWidth="2" />
                  <line x1="-2" y1="8" x2="2" y2="8" className="cad-stroke" strokeWidth="2" />
                </g>
              </g>

              {/* 3. CIRCUITOS DERIVADOS */}
              {computedCircuits.map((circ, index) => {
                const yPos = 110 + (index * 120);
                const { startX, pathD } = getFaseCoordinates(circ.fase);

                return (
                  <g key={circ.id} transform={`translate(0, ${yPos})`}>
                    {/* Punto de tap en barra */}
                    <circle cx={startX} cy="0" r="3.5" fill="currentColor" className="cad-text" />
                    
                    {/* Línea de alimentación cruzada */}
                    <path d={pathD} className="cad-stroke" fill="none" strokeWidth="2" />
                    
                    {/* Interruptor Termomagnético (Breaker) */}
                    <g transform="translate(100, 0)" className="cad-stroke" strokeWidth="2" fill="none">
                      <path d="M 0,0 L 15,0" />
                      {/* Contacto abierto */}
                      <path d="M 15,-6 C 22,-12 28,12 35,0" fill="none" strokeWidth="2" />
                      <path d="M 35,0 L 50,0" />
                      
                      {/* Puentes mecánicos en disyuntor de polos múltiples */}
                      {circ.polos > 1 && <line x1="12" y1="-10" x2="18" y2="10" strokeWidth="1.5" />}
                      {circ.polos > 2 && <line x1="32" y1="-10" x2="38" y2="10" strokeWidth="1.5" />}

                      <text x="25" y="-12" textAnchor="middle" stroke="none" fill="#38bdf8" className="text-[13px] font-bold font-mono">
                        {circ.polos}x{circ.breaker}A
                      </text>
                      <text x="25" y="16" textAnchor="middle" stroke="none" fill="#38bdf8" className="text-[10px] font-bold font-mono opacity-80">
                        {circ.kaic || '10 kA'}
                      </text>
                    </g>

                    {/* Conexiones secundarias del Neutro y Tierra (Tapas a barra lateral) */}
                    <path d="M -70,0 L -70,20 L 100,20 L 100,0" stroke="#64748b" strokeWidth="1" fill="none" opacity="0.3" />
                    <circle cx="-70" cy="0" r="2.5" fill="#64748b" />
                    <circle cx="-50" cy="0" r="2.5" fill="#22c55e" />

                    {/* Línea hacia el equipo */}
                    <line x1="150" y1="0" x2="1150" y2="0" className={`cad-stroke ${circ.isVdCritical ? 'cad-stroke-danger' : ''}`} strokeWidth="2" />
                    
                    {/* Etiqueta de Conductor y Canalización */}
                    <text x="180" y="-12" className="text-[15px] font-bold fill-current cad-text">{circ.num} - {circ.tipo}</text>
                    
                    {/* Conductor en Fila 1 */}
                    <text x="180" y="14" className="text-[11px] font-mono fill-current opacity-80 cad-text">
                      Conductor: {circ.conductorStr} THW-LS
                    </text>
                    
                    {/* Canalización en Fila 2 */}
                    <text x="180" y="28" className="text-[11px] font-mono fill-current opacity-80 cad-text">
                      Canalización: {circ.tuberiaDiametro} ({circ.tuberiaTipo})
                    </text>

                    {/* Datos Eléctricos Detallados (P: y L: por encima del cable, caídas de tensión por debajo en 3 filas) */}
                    <g transform="translate(760, 0)" className="text-[12px] font-mono fill-current cad-text">
                      {/* Fila 1 (por encima del cable) */}
                      <text x="0" y="-22">P: {circ.watts} W</text>
                      <text x="100" y="-22">I_n: {circ.inAmps.toFixed(2)} A</text>
                      <text x="200" y="-22">F.P: {circ.fp}</text>
                      
                      {/* Fila 2 (justo por encima del cable) */}
                      <text x="0" y="-8">L: {circ.longitudMetros} m</text>
                      
                      {/* Fila 3 (por debajo del cable - renglón 1) */}
                      <text x="0" y="14" className={circ.vd > 3.0 ? 'cad-text-danger' : 'text-teal-400 font-bold'}>
                        ΔV Deriv: {circ.vd.toFixed(2)}%
                      </text>
                      
                      {/* Fila 4 (por debajo del cable - renglón 2) */}
                      <text x="0" y="28" className={circ.isVdCritical ? 'cad-text-danger font-bold' : 'text-emerald-400'}>
                        ΔV Total: {circ.caidaTotal.toFixed(2)}%
                      </text>
                      
                      {/* Fila 5 (por debajo del cable - renglón 3, advertencia) */}
                      {circ.isVdCritical && (
                        <text x="0" y="42" className="cad-text-danger font-bold text-[11px]">
                          ⚠️ Excede 5% Límite NOM
                        </text>
                      )}
                    </g>

                    {/* Icono de Receptor Eléctrico Final */}
                    <g transform="translate(1150, 0)" className="cad-stroke" strokeWidth="2">
                      <circle cx="12" cy="0" r="12" fill="#0b0f19" />
                      <path d="M 4,-4 L 12,8 L 20,-4" fill="none" />
                      <line x1="-15" y1="0" x2="0" y2="0" />
                      <text x="32" y="4" stroke="none" fill="#e2e8f0" className="text-[12px] font-medium font-sans">
                        {circ.modelo || 'Carga'}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Floating Tooltip/Instructions (Oculto en Impresión) */}
        <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md text-[11px] text-slate-350 p-3 rounded-lg border border-slate-900 shadow-xl print:hidden flex flex-col gap-1">
          <div className="flex justify-between items-center gap-4">
            <p className="font-bold text-slate-200 flex items-center gap-1.5">
              <RotateCcw size={12} className="text-teal-400" />
              Navegación del Lienzo
            </p>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-450 border border-teal-500/20">
              Zoom: {zoomPercent}%
            </span>
          </div>
          <ul className="space-y-0.5 opacity-90 font-sans list-disc list-inside">
            <li>Click y arrastrar para mover (Pan)</li>
            <li>Rueda del ratón para Zoom</li>
            <li>Usa la barra lateral para ajustar el alimentador</li>
          </ul>
          <button 
            onClick={resetZoom}
            className="mt-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-400 text-[10px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1 w-full"
          >
            <RotateCcw size={10} />
            Reestablecer Vista
          </button>
        </div>
      </div>

      {/* MODAL DE PREVISUALIZACIÓN DE IMPRESIÓN (TRAZADO TIPO AUTOCAD) */}
      {showPlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 no-print text-slate-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h2 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <Printer size={16} />
                Trazar / Imprimir Plano (Configuración de Página)
              </h2>
              <button onClick={() => setShowPlotModal(false)} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left panel: plot configuration (40% width) */}
              <div className="w-full md:w-[350px] p-5 border-r border-slate-800 overflow-y-auto space-y-4 bg-slate-950/20 text-xs">
                {/* Paper Size */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Tamaño de Papel</label>
                  <select
                    value={plotPaperSize}
                    onChange={(e) => setPlotPaperSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400 font-bold"
                  >
                    <option value="Letter">Carta / Letter (8.5" x 11")</option>
                    <option value="Ledger">Doble Carta / Ledger (11" x 17")</option>
                    <option value="Legal">Oficio / Legal (8.5" x 14")</option>
                    <option value="ArchD">Arch D (24" x 36" - 90x60cm)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Orientación</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPlotOrientation('landscape')}
                      className={`flex-1 py-1.5 rounded-lg border text-center font-semibold transition ${
                        plotOrientation === 'landscape'
                          ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Horizontal (Landscape)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlotOrientation('portrait')}
                      className={`flex-1 py-1.5 rounded-lg border text-center font-semibold transition ${
                        plotOrientation === 'portrait'
                          ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Vertical (Portrait)
                    </button>
                  </div>
                </div>

                {/* Plot Area */}
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-bold mb-1.5">Área de Trazado</label>
                  <select
                    value={plotArea}
                    onChange={(e) => setPlotArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400 font-bold mb-2"
                  >
                    <option value="extent">Extensión (Todo el Diagrama)</option>
                    <option value="window">Ventana (Definir Área de Trazado)</option>
                  </select>

                  {plotArea === 'window' && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase mb-0.5">X Inicial</label>
                        <input
                          type="number"
                          value={plotWindow.x}
                          onChange={(e) => setPlotWindow(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Y Inicial</label>
                        <input
                          type="number"
                          value={plotWindow.y}
                          onChange={(e) => setPlotWindow(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Ancho W</label>
                        <input
                          type="number"
                          value={plotWindow.w}
                          onChange={(e) => setPlotWindow(prev => ({ ...prev, w: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Alto H</label>
                        <input
                          type="number"
                          value={plotWindow.h}
                          onChange={(e) => setPlotWindow(prev => ({ ...prev, h: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Plot Scale */}
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-bold mb-1.5">Escala de Trazado</label>
                  <select
                    value={plotScale}
                    onChange={(e) => setPlotScale(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400 font-bold"
                  >
                    <option value="fit">Ajustar a la Hoja (Fit to Paper)</option>
                    <option value="1:1">1:1 (1 mm = 1 unidad de dibujo)</option>
                    <option value="1:5">1:5 (1 mm = 5 unidades de dibujo)</option>
                    <option value="1:10">1:10 (1 mm = 10 unidades de dibujo)</option>
                    <option value="1:20">1:20 (1 mm = 20 unidades de dibujo)</option>
                    <option value="1:50">1:50 (1 mm = 50 unidades de dibujo)</option>
                  </select>
                </div>

                {/* Plot Style Table (Monochrome) */}
                <div className="flex items-center justify-between pt-2">
                  <label className="text-[10px] text-slate-450 uppercase font-bold">Trazado Monocromático (B&N)</label>
                  <input
                    type="checkbox"
                    checked={plotMonochrome}
                    onChange={(e) => setPlotMonochrome(e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-400 bg-slate-900 border border-slate-800 cursor-pointer"
                  />
                </div>
                
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1 text-slate-400 text-[10px] leading-relaxed">
                  <p className="font-bold text-slate-350">💡 Instrucción:</p>
                  <p>Al seleccionar <strong>Ventana</strong>, se dibujará un recuadro rojo punteado en el fondo del plano principal que puedes ajustar con los valores numéricos para recortar y centrar la impresión.</p>
                </div>
              </div>

              {/* Right panel: Sheet Preview (60% width) */}
              <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <span className="absolute top-3 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Previsualización de Impresión</span>
                
                {/* Paper Preview container */}
                <div 
                  style={{
                    width: plotOrientation === 'landscape' ? '85%' : '60%',
                    aspectRatio: plotPaperDimensions(plotPaperSize, plotOrientation).ratio,
                  }}
                  className="bg-white rounded border border-slate-100 shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col"
                >
                  {/* Printable area bounds representation (dashed border inside paper margins) */}
                  <div className="absolute inset-4 border border-dashed border-slate-200 pointer-events-none" />

                  {/* Rendered SVG crop */}
                  <div className="flex-1 p-5 relative overflow-hidden">
                    <svg
                      className="w-full h-full"
                      viewBox={`${plotCalculatedViewBox.x} ${plotCalculatedViewBox.y} ${plotCalculatedViewBox.w} ${plotCalculatedViewBox.h}`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <style>
                        {`
                          .print-prev-bg { fill: ${plotMonochrome ? '#ffffff' : '#0b0f19'}; }
                          .print-prev-stroke { stroke: ${plotMonochrome ? '#000000' : '#38bdf8'}; }
                          .print-prev-text { fill: ${plotMonochrome ? '#000000' : '#f1f5f9'}; }
                          .print-prev-text-danger { fill: ${plotMonochrome ? '#000000' : '#f43f5e'}; font-weight: bold; }
                          .print-prev-stroke-danger { stroke: ${plotMonochrome ? '#000000' : '#f43f5e'}; ${plotMonochrome ? 'stroke-dasharray: 4 2;' : ''} }
                          .print-prev-busbar { stroke: ${plotMonochrome ? '#1a1a1a' : '#fbbf24'}; stroke-width: 5; stroke-linecap: round; }
                          .print-prev-busbar-bg { stroke: ${plotMonochrome ? '#ffffff' : '#1e293b'}; stroke-width: 9; stroke-linecap: round; }
                        `}
                      </style>
                      
                      {/* Background of drawing */}
                      <rect 
                        x={plotCalculatedViewBox.x - 1000} 
                        y={plotCalculatedViewBox.y - 1000} 
                        width={plotCalculatedViewBox.w + 2000} 
                        height={plotCalculatedViewBox.h + 2000} 
                        className="print-prev-bg" 
                      />
                      
                      <g className="print-prev-text font-sans">
                        {/* Acometida */}
                        <g transform="translate(450, 80)">
                          <line x1="0" y1="0" x2="0" y2="350" className="print-prev-stroke" strokeWidth="3" />
                          <polygon points="0,0 -15,-25 15,-25" className="print-prev-stroke" fill="none" strokeWidth="2.5" />
                          <text x="25" y="-12" className="text-[20px] font-bold fill-current">ACOMETIDA CFE</text>
                          <text x="25" y="8" className="text-[14px] fill-current opacity-70">
                            {acometida.id === 'monofasico' ? '1Ф - 2 Hilos (127V)' : (acometida.id === 'bifasico' ? '2Ф - 3 Hilos (220V)' : '3Ф - 4 Hilos (220V)')}
                          </text>
                          <text x="25" y="24" className="text-[12px] fill-current opacity-60">Voltaje Nominal: {alimPrincipal?.voltaje}V | 60 Hz</text>

                          <g transform="translate(0, 140)">
                            <circle cx="0" cy="0" r="30" className="print-prev-stroke" fill="none" strokeWidth="3" />
                            <text x="0" y="6" textAnchor="middle" className="text-[20px] font-bold fill-current">Wh</text>
                          </g>

                          <g transform="translate(0, 280)">
                            <rect x="-25" y="-15" width="50" height="30" className="print-prev-stroke" fill="none" strokeWidth="2.5" />
                            <line x1="-15" y1="0" x2="15" y2="0" className="print-prev-stroke" strokeWidth="2.5" />
                            {alimPrincipal?.polos > 1 && <line x1="-10" y1="-10" x2="10" y2="10" className="print-prev-stroke" strokeWidth="2" />}
                            {alimPrincipal?.polos > 2 && <line x1="-5" y1="-10" x2="15" y2="10" className="print-prev-stroke" strokeWidth="2" />}
                            
                            <text x="45" y="-3" className="text-[15px] font-bold fill-current">INTERRUPTOR GENERAL</text>
                            <text x="45" y="14" className="text-[13px] fill-current opacity-75 font-mono">
                              Termomagnético {alimPrincipal?.polos}x{alimPrincipal?.breaker}A | 10 kA
                            </text>
                            <text x="45" y="30" className="text-[11px] fill-current opacity-65 font-mono">
                              Alim: {alimPrincipal?.polos} # {alimPrincipal?.conductor} + 1 # {alimPrincipal?.neutro} (N) + 1 # {alimPrincipal?.tierra} (T) THW-LS
                            </text>
                            <text x="45" y="45" className="text-[11px] fill-current opacity-65 font-mono">
                              Canalización: {proyecto.alimentadorTuberia} / {proyecto.alimentadorTuberiaTipo}
                            </text>
                            <text x="45" y="60" className={`text-[11px] font-bold font-mono ${alimPrincipal?.caida > 2.00 ? 'print-prev-text-danger' : 'text-teal-400'}`}>
                              L: {proyecto.alimentadorLongitud} m | ΔV Alim: {alimPrincipal?.caida}%
                            </text>
                          </g>
                        </g>

                        {/* Tablero y derivaciones */}
                        <g transform="translate(450, 480)">
                          <rect x="-90" y="0" width="1650" height={100 + (computedCircuits.length * 120)} className="print-prev-stroke" fill="none" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.4" />
                          <text x="-70" y="35" className="text-[20px] font-bold fill-current">CENTRO DE CARGA 'T-1'</text>
                          
                          <g transform="translate(0, 70)">
                            {acometida.id === 'monofasico' && (
                              <>
                                <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="print-prev-busbar-bg" />
                                <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="print-prev-busbar" />
                              </>
                            )}
                            {acometida.id === 'bifasico' && (
                              <>
                                <line x1="-15" y1="0" x2="-15" y2={computedCircuits.length * 120} className="print-prev-busbar-bg" />
                                <line x1="-15" y1="0" x2="-15" y2={computedCircuits.length * 120} className="print-prev-busbar" />
                                <line x1="15" y1="0" x2="15" y2={computedCircuits.length * 120} className="print-prev-busbar-bg" />
                                <line x1="15" y1="0" x2="15" y2={computedCircuits.length * 120} className="print-prev-busbar" />
                              </>
                            )}
                            {acometida.id === 'trifasico' && (
                              <>
                                <line x1="-30" y1="0" x2="-30" y2={computedCircuits.length * 120} className="print-prev-busbar-bg" />
                                <line x1="-30" y1="0" x2="-30" y2={computedCircuits.length * 120} className="print-prev-busbar" />
                                <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="print-prev-busbar-bg" />
                                <line x1="0" y1="0" x2="0" y2={computedCircuits.length * 120} className="print-prev-busbar" />
                                <line x1="30" y1="0" x2="30" y2={computedCircuits.length * 120} className="print-prev-busbar-bg" />
                                <line x1="30" y1="0" x2="30" y2={computedCircuits.length * 120} className="print-prev-busbar" />
                              </>
                            )}

                            <line x1="-70" y1="0" x2="-70" y2={computedCircuits.length * 120} stroke="#64748b" strokeWidth="3" />
                            <line x1="-50" y1="0" x2="-50" y2={computedCircuits.length * 120} stroke="#22c55e" strokeWidth="3" />
                            
                            <g transform={`translate(-50, ${computedCircuits.length * 120 + 10})`}>
                              <line x1="-10" y1="0" x2="10" y2="0" className="print-prev-stroke" strokeWidth="2" />
                              <line x1="-6" y1="4" x2="6" y2="4" className="print-prev-stroke" strokeWidth="2" />
                              <line x1="-2" y1="8" x2="2" y2="8" className="print-prev-stroke" strokeWidth="2" />
                            </g>
                          </g>

                          {computedCircuits.map((circ, index) => {
                            const yPos = 110 + (index * 120);
                            const { startX, pathD } = getFaseCoordinates(circ.fase);

                            return (
                              <g key={circ.id} transform={`translate(0, ${yPos})`}>
                                <circle cx={startX} cy="0" r="3.5" fill="currentColor" />
                                <path d={pathD} className="print-prev-stroke" fill="none" strokeWidth="2" />
                                
                                <g transform="translate(100, 0)" className="print-prev-stroke" strokeWidth="2" fill="none">
                                  <path d="M 0,0 L 15,0" />
                                  <path d="M 15,-6 C 22,-12 28,12 35,0" fill="none" strokeWidth="2" />
                                  <path d="M 35,0 L 50,0" />
                                  {circ.polos > 1 && <line x1="12" y1="-10" x2="18" y2="10" strokeWidth="1.5" />}
                                  {circ.polos > 2 && <line x1="32" y1="-10" x2="38" y2="10" strokeWidth="1.5" />}

                                  <text x="25" y="-12" textAnchor="middle" stroke="none" fill={plotMonochrome ? '#000000' : '#38bdf8'} className="text-[13px] font-bold font-mono">
                                    {circ.polos}x{circ.breaker}A
                                  </text>
                                  <text x="25" y="16" textAnchor="middle" stroke="none" fill={plotMonochrome ? '#000000' : '#38bdf8'} className="text-[10px] font-bold font-mono opacity-80">
                                    {circ.kaic || '10 kA'}
                                  </text>
                                </g>

                                <path d="M -70,0 L -70,20 L 100,20 L 100,0" stroke="#64748b" strokeWidth="1" fill="none" opacity="0.3" />
                                <circle cx="-70" cy="0" r="2.5" fill="#64748b" />
                                <circle cx="-50" cy="0" r="2.5" fill="#22c55e" />

                                <line x1="150" y1="0" x2="1150" y2="0" className={`print-prev-stroke ${circ.isVdCritical ? 'print-prev-stroke-danger' : ''}`} strokeWidth="2" />
                                
                                <text x="180" y="-12" className="text-[15px] font-bold fill-current">{circ.num} - {circ.tipo}</text>
                                <text x="180" y="14" className="text-[11px] font-mono fill-current opacity-80">
                                  Conductor: {circ.conductorStr} THW-LS
                                </text>
                                <text x="180" y="28" className="text-[11px] font-mono fill-current opacity-80">
                                  Canalización: {circ.tuberiaDiametro} ({circ.tuberiaTipo})
                                </text>

                                <g transform="translate(760, 0)" className="text-[12px] font-mono fill-current">
                                  <text x="0" y="-22">P: {circ.watts} W</text>
                                  <text x="100" y="-22">I_n: {circ.inAmps.toFixed(2)} A</text>
                                  <text x="200" y="-22">F.P: {circ.fp}</text>
                                  <text x="0" y="-8">L: {circ.longitudMetros} m</text>
                                  
                                  <text x="0" y="14" className={circ.vd > 3.0 ? 'print-prev-text-danger' : 'text-teal-400 font-bold'}>
                                    ΔV Deriv: {circ.vd.toFixed(2)}%
                                  </text>
                                  <text x="0" y="28" className={circ.isVdCritical ? 'print-prev-text-danger font-bold' : 'text-emerald-400'}>
                                    ΔV Total: {circ.caidaTotal.toFixed(2)}%
                                  </text>
                                  {circ.isVdCritical && (
                                    <text x="0" y="42" className="print-prev-text-danger font-bold text-[11px]">
                                      ⚠️ Excede 5% Límite NOM
                                    </text>
                                  )}
                                </g>

                                <g transform="translate(1150, 0)" className="print-prev-stroke" strokeWidth="2">
                                  <circle cx="12" cy="0" r="12" fill={plotMonochrome ? '#ffffff' : '#0b0f19'} />
                                  <path d="M 4,-4 L 12,8 L 20,-4" fill="none" />
                                  <line x1="-15" y1="0" x2="0" y2="0" />
                                  <text x="32" y="4" stroke="none" fill={plotMonochrome ? '#000000' : '#e2e8f0'} className="text-[12px] font-medium font-sans">
                                    {circ.modelo || 'Carga'}
                                  </text>
                                </g>
                              </g>
                            );
                          })}
                        </g>
                      </g>
                    </svg>
                  </div>

                  {/* Sheet border info label */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 font-mono flex justify-between items-center select-text">
                    <span>Escala: {plotScale === 'fit' ? 'Ajustado' : plotScale} | Papel: {plotPaperSize} ({plotOrientation === 'landscape' ? 'Horizontal' : 'Vertical'})</span>
                    <span>NOM-001-SEDE-2012</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/40">
              <button
                onClick={() => setShowPlotModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={triggerActualPrint}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                Trazar / Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
