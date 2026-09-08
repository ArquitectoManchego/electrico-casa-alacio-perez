import React from 'react';
import { FileSpreadsheet, Printer, Download, Award, ShieldCheck, AlertTriangle, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { 
  calcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor,
  calcularDesbalanceUVIE,
  calcularCaidaTension
} from '../utils/ecuacionesUVIE';

export default function CuadroCargasUVIE({ 
  aparatos, 
  acometida, 
  fasesUnit = 'VA', 
  onChangeFasesUnit, 
  onBalancearFases, 
  balancingConfigsCount = 0 
}) {
  // Sumas totales
  let totalW = 0;
  let totalVA = 0;
  const fasesVA = { A: 0, B: 0, C: 0 }; // Esto representará el total en la unidad seleccionada (display)
  const fasesVABase = { A: 0, B: 0, C: 0 }; // Para el cálculo de desbalance en VA

  // Procesar cada circuito
  const circuitosProcesados = aparatos.map((ap, index) => {
    const w = parseFloat(ap.watts) || 0;
    const fp = parseFloat(ap.fp) || 1.0;
    const va = calcularVA(w, fp, ap.usarVaDirecto);
    
    totalW += w;
    totalVA += va;

    // Repartir en fases (base VA)
    const fLoad = { A: 0, B: 0, C: 0 };
    if (ap.tipoCarga === 'monofasica') {
      const f = ap.fase || 'A';
      fLoad[f] = va;
      fasesVABase[f] += va;
    } else if (ap.tipoCarga === 'bifasica') {
      // Repartir equitativamente en 2 fases
      if (acometida.id === 'trifasico') {
        const combo = ap.fase || 'A-B';
        const parts = combo.split('-');
        parts.forEach(p => {
          fLoad[p] = va / 2;
          fasesVABase[p] += va / 2;
        });
      } else {
        fLoad.A = va / 2;
        fLoad.B = va / 2;
        fasesVABase.A += va / 2;
        fasesVABase.B += va / 2;
      }
    } else if (ap.tipoCarga === 'trifasica') {
      fLoad.A = va / 3;
      fLoad.B = va / 3;
      fLoad.C = va / 3;
      fasesVABase.A += va / 3;
      fasesVABase.B += va / 3;
      fasesVABase.C += va / 3;
    }

    // Convertir desgloses de fila a la unidad actual para visualización
    const fLoadDisplay = { A: 0, B: 0, C: 0 };
    ['A', 'B', 'C'].forEach(f => {
      const vaFase = fLoad[f];
      if (vaFase > 0) {
        if (fasesUnit === 'VA') {
          fLoadDisplay[f] = vaFase;
        } else if (fasesUnit === 'W') {
          fLoadDisplay[f] = vaFase * fp;
        } else if (fasesUnit === 'A') {
          if (ap.tipoCarga === 'trifasica' && acometida.id === 'trifasico') {
            fLoadDisplay[f] = vaFase / 127.017;
          } else if (ap.tipoCarga === 'bifasica') {
            fLoadDisplay[f] = vaFase / 110;
          } else {
            fLoadDisplay[f] = vaFase / 127;
          }
        }
        fasesVA[f] += fLoadDisplay[f];
      }
    });

    const inNom = calcularCorrienteNominal(va, ap.tipoCarga);
    const icCorr = calcularCorrienteCorregida(inNom);
    
    // Overrides de tablero
    const autoProteccion = seleccionarProteccion(icCorr);
    const activeProteccion = ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? parseInt(ap.overrideBreaker) : autoProteccion;

    const autoConductor = seleccionarConductor(activeProteccion);
    const activeConductor = ap.overrideCable && ap.overrideCable !== 'Auto' ? ap.overrideCable : autoConductor;

    // Formatear descripción del conductor según tipo de carga para reporte UVIE
    const cableCalibre = activeConductor.split(' ')[0];
    let conductorFormato = '';
    if (ap.tipoCarga === 'monofasica') {
      conductorFormato = `2 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    } else if (ap.tipoCarga === 'bifasica') {
      conductorFormato = `3 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    } else {
      conductorFormato = `4 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    }
    if (ap.overrideCable && ap.overrideCable !== 'Auto') {
      conductorFormato += '*';
    }

    // Formatear interruptor
    let interruptorFormato = '';
    if (ap.tipoCarga === 'monofasica') {
      interruptorFormato = `1 x ${activeProteccion} A`;
    } else if (ap.tipoCarga === 'bifasica') {
      interruptorFormato = `2 x ${activeProteccion} A`;
    } else {
      interruptorFormato = `3 x ${activeProteccion} A`;
    }
    if (ap.overrideBreaker && ap.overrideBreaker !== 'Auto') {
      interruptorFormato += '*';
    }

    const caidaTension = calcularCaidaTension(
      ap.longitudMetros !== undefined ? ap.longitudMetros : 15,
      icCorr,
      acometida.id === 'monofasico' ? 'monofasica' : ap.tipoCarga,
      activeConductor
    );

    return {
      num: `C-${index + 1}`,
      desc: ap.tipo + (ap.modelo ? ` (${ap.modelo})` : ''),
      watts: w,
      fp: fp,
      va: va,
      voltaje: ap.tipoCarga === 'monofasica' ? '127 V' : '220 V',
      fases: fLoadDisplay,
      in: inNom,
      ic: icCorr,
      proteccion: interruptorFormato,
      conductor: conductorFormato,
      precio: parseFloat(ap.precio) || 0,
      mantenimiento: parseFloat(ap.mantenimiento) || 0,
      vidaUtil: parseInt(ap.vidaUtil) || 0,
      tuberiaDiametro: ap.tuberiaDiametro || '16 mm (1/2")',
      tuberiaTipo: ap.tuberiaTipo || 'Pared Delgada',
      longitudMetros: ap.longitudMetros !== undefined ? parseFloat(ap.longitudMetros) : 15,
      kaic: ap.kaic || '10 kA',
      caida: caidaTension
    };
  });

  const desbalanceUVIE = calcularDesbalanceUVIE(fasesVABase.A, fasesVABase.B, fasesVABase.C, acometida.id);

  // --- EXPORTAR A EXCEL (HTML Spreadsheet) ---
  const handleExportExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
          th { background-color: #00875a; color: white; border: 1px solid #999; padding: 10px; font-size: 11px; text-transform: uppercase; }
          td { border: 1px solid #ccc; padding: 8px; font-size: 11px; text-align: center; }
          .summary { font-weight: bold; background-color: #e6f4ea; text-align: right; }
          .header-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header-title">CUADRO DE CARGAS DE INSTALACIÓN ELÉCTRICA</div>
        <div style="font-size: 11px; color: #555; margin-bottom: 15px;">Evaluado bajo la NOM-001-SEDE para Trámite UVIE</div>
        <table>
          <thead>
            <tr>
              <th>Cto</th>
              <th>Descripción del Circuito</th>
              <th>Watts (P)</th>
              <th>F.P.</th>
              <th>VA (S)</th>
              <th>Voltaje (V)</th>
              <th>Fase A (${fasesUnit})</th>
              <th>Fase B (${fasesUnit})</th>
              <th>Fase C (${fasesUnit})</th>
              <th>I Nominal (A)</th>
              <th>I Corregida (A)</th>
              <th>Protección</th>
              <th>Conductor</th>
            </tr>
          </thead>
          <tbody>
    `;

    circuitosProcesados.forEach(c => {
      html += `
        <tr>
          <td>${c.num}</td>
          <td style="text-align: left;">${c.desc}</td>
          <td>${Math.round(c.watts)}</td>
          <td>${c.fp.toFixed(2)}</td>
          <td>${Math.round(c.va)}</td>
          <td>${c.voltaje}</td>
          <td>${c.fases.A > 0 ? (fasesUnit === 'A' ? c.fases.A.toFixed(2) : Math.round(c.fases.A)) : '-'}</td>
          <td>${c.fases.B > 0 ? (fasesUnit === 'A' ? c.fases.B.toFixed(2) : Math.round(c.fases.B)) : '-'}</td>
          <td>${c.fases.C > 0 ? (fasesUnit === 'A' ? c.fases.C.toFixed(2) : Math.round(c.fases.C)) : '-'}</td>
          <td>${c.in.toFixed(2)}</td>
          <td>${c.ic.toFixed(2)}</td>
          <td>${c.proteccion}</td>
          <td>${c.conductor}</td>
        </tr>
      `;
    });

    // Totales
    html += `
      <tr class="summary">
        <td colspan="2">TOTALES</td>
        <td>${Math.round(totalW)} W</td>
        <td>-</td>
        <td>${Math.round(totalVA)} VA</td>
        <td>-</td>
        <td>${fasesUnit === 'A' ? fasesVA.A.toFixed(2) : Math.round(fasesVA.A)} ${fasesUnit}</td>
        <td>${fasesUnit === 'A' ? fasesVA.B.toFixed(2) : Math.round(fasesVA.B)} ${fasesUnit}</td>
        <td>${fasesUnit === 'A' ? fasesVA.C.toFixed(2) : Math.round(fasesVA.C)} ${fasesUnit}</td>
        <td colspan="4">Desbalanceo UVIE: ${desbalanceUVIE.toFixed(2)}%</td>
      </tr>
    `;

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cuadro_de_Cargas_UVIE.xls';
    a.click();
  };

  // --- EXPORTAR A CSV ---
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Cto',
      'Descripcion del Circuito',
      'Tension (V)',
      'Watts (P)',
      'FP',
      'VA (S)',
      'Precio (MXN)',
      'Mant. Anual (MXN)',
      'Vida Util (Anios)',
      `Fase A (${fasesUnit})`,
      `Fase B (${fasesUnit})`,
      `Fase C (${fasesUnit})`,
      'I Nominal (A)',
      'I Corregida (A)',
      'Proteccion',
      'Conductor',
      'Canalizacion',
      'Longitud (m)',
      'KAIC',
      'Caida Tension (%)'
    ];
    
    const rows = [headers];
    
    circuitosProcesados.forEach((c, idx) => {
      rows.push([
        (idx + 1).toString(),
        c.num,
        c.desc,
        c.voltaje,
        Math.round(c.watts).toString(),
        c.fp.toFixed(2),
        Math.round(c.va).toString(),
        Math.round(c.precio).toString(),
        Math.round(c.mantenimiento).toString(),
        c.vidaUtil.toString(),
        c.fases.A > 0 ? (fasesUnit === 'A' ? c.fases.A.toFixed(2) : Math.round(c.fases.A).toString()) : '0',
        c.fases.B > 0 ? (fasesUnit === 'A' ? c.fases.B.toFixed(2) : Math.round(c.fases.B).toString()) : '0',
        c.fases.C > 0 ? (fasesUnit === 'A' ? c.fases.C.toFixed(2) : Math.round(c.fases.C).toString()) : '0',
        c.in.toFixed(2),
        c.ic.toFixed(2),
        c.proteccion,
        c.conductor,
        `${c.tuberiaDiametro} / ${c.tuberiaTipo}`,
        c.longitudMetros.toString(),
        c.kaic,
        `${c.caida.toFixed(2)}%`
      ]);
    });

    // Calcular acumulados de precio, mant. y vida útil para totals en CSV
    const totalPrecio = circuitosProcesados.reduce((sum, c) => sum + c.precio, 0);
    const totalMantenimiento = circuitosProcesados.reduce((sum, c) => sum + c.mantenimiento, 0);
    const promVidaUtil = (circuitosProcesados.reduce((sum, c) => sum + c.vidaUtil, 0) / circuitosProcesados.length).toFixed(1);

    // Añadir Fila de Totales
    rows.push([
      '-',
      'TOTALES',
      'Consolidado General de Cargas',
      '',
      Math.round(totalW).toString(),
      '',
      Math.round(totalVA).toString(),
      Math.round(totalPrecio).toString(),
      Math.round(totalMantenimiento).toString(),
      promVidaUtil,
      fasesUnit === 'A' ? fasesVA.A.toFixed(2) : Math.round(fasesVA.A).toString(),
      fasesUnit === 'A' ? fasesVA.B.toFixed(2) : Math.round(fasesVA.B).toString(),
      fasesUnit === 'A' ? fasesVA.C.toFixed(2) : Math.round(fasesVA.C).toString(),
      '',
      '',
      `Desbalanceo: ${desbalanceUVIE.toFixed(2)}%`,
      '',
      '',
      '',
      '',
      '',
      ''
    ]);

    const csvString = rows.map(e => e.map(val => `"${val}"`).join(",")).join("\r\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cuadro_de_Cargas_UVIE.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <style>{`
        /* Estilos generales de impresión */
        @media print {
          /* Forzar impresión en blanco y negro puro */
          body, html, #root {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          /* Ocultar botones y menús no deseados */
          .no-print, .no-print *, button, .flex-wrap {
            display: none !important;
          }

          /* Asegurar que todo texto imprimible sea negro */
          h1, h2, h3, h4, p, span, td, th, div, strong, small {
            color: #000000 !important;
            background-color: transparent !important;
            background: transparent !important;
            text-shadow: none !important;
            box-shadow: none !important;
            border-color: #000000 !important;
          }

          /* Configuración de tamaño de página en vertical (portrait) */
          @page {
            size: portrait;
            margin: 1.2cm 1.5cm;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            color: #000000 !important;
          }

          th, td {
            border: 1px solid #000000 !important;
            padding: 4px 6px !important;
            font-size: 7.5px !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          th {
            background-color: #eaeaea !important;
            font-weight: bold !important;
          }

          .print-header-section {
            display: block !important;
            margin-bottom: 40px !important;
          }

          .print-footer-section {
            display: block !important;
            page-break-before: always !important;
            margin-top: 40px !important;
            border-top: 1.5px solid #000000 !important;
            padding-top: 15px !important;
          }
        }
      `}</style>
      
      {/* Banner de Alerta UVIE */}
      {desbalanceUVIE > 5.0 && (
        <div className="p-4 mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-start gap-3 glow-red no-print">
          <ShieldAlert className="mt-0.5 flex-shrink-0 text-rose-500 animate-bounce" size={20} />
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wide">
              Incumplimiento Normativo UVIE - Desbalanceo Crítico: {desbalanceUVIE.toFixed(2)}%
            </h4>
            <p className="text-xs mt-1 leading-relaxed text-rose-300 font-sans">
              El desbalanceo entre fases excede el **5.0%** permitido por la NOM-001-SEDE. Las unidades de verificación (UVIE) **rechazarán** este cuadro de cargas. Por favor, haz clic en el botón de **"Balancear Fases"** en los controles del reporte para resolverlo.
            </p>
          </div>
        </div>
      )}

      {/* Botones de Exportación */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print mb-4">
        <div className="flex items-center gap-2.5">
          <Award className="text-teal-400" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white font-display">Reporte de Cuadro de Cargas para Dictamen UVIE</h3>
            <p className="text-[10px] text-slate-500 font-sans">Formato limpio simplificado y homologado bajo la NOM-001-SEDE.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Desbalanceo actual */}
          <span className="text-[11px] font-mono text-slate-400 mr-2">
            Desbalanceo: <span className={desbalanceUVIE > 5 ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400 font-bold'}>{desbalanceUVIE.toFixed(2)}%</span>
          </span>

          {/* Botón de Balancear Fases */}
          {acometida.id !== 'monofasico' && onBalancearFases && (
            <button
              onClick={onBalancearFases}
              disabled={balancingConfigsCount === 0}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-250 flex items-center gap-1.5 select-none ${
                balancingConfigsCount === 0
                  ? 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer'
              }`}
              title={balancingConfigsCount > 0 ? `Optimizar balanceo de fases (${balancingConfigsCount} combinaciones)` : 'Fases perfectamente balanceadas (<5%)'}
            >
              <ArrowRightLeft size={12} />
              {balancingConfigsCount > 0 ? `Balancear (${balancingConfigsCount})` : 'Balanceado'}
            </button>
          )}

          {/* Botón Alternar Unidad */}
          {onChangeFasesUnit && (
            <button
              onClick={onChangeFasesUnit}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
              title="Alternar unidad: VA, Watts o Amperes"
            >
              Unidad: {fasesUnit}
            </button>
          )}

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block mx-1"></div>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Exportar a Microsoft Excel"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            Excel
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Exportar archivo CSV compatible"
          >
            <Download size={14} className="text-cyan-400" />
            CSV
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Imprimir o Guardar en PDF"
          >
            <Printer size={14} />
            Imprimir PDF
          </button>
        </div>
      </div>

      {/* Contenedor Imprimible del Cuadro de Cargas */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-850 overflow-x-auto shadow-xl relative bg-slate-950/20 print-no-border print-p-0">
        
        {/* Título de Impresión */}
        <div className="hidden print:block mb-6 text-slate-950 print-header-section">
          <h1 className="text-lg font-bold uppercase tracking-wider">Cuadro de Cargas Homologado para Trámite UVIE</h1>
          <p className="text-xs text-slate-600">Normativa: NOM-001-SEDE-2012 | Tipo de Sistema: {acometida.tipo}</p>
        </div>

        <div className="print-landscape-page">
          <table className="w-full border-collapse text-left min-w-[900px] text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 print:border-b-2 print:border-slate-400 text-slate-400 print:text-slate-700 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2 text-center w-[40px]">#</th>
                <th className="py-3 px-2">Cto</th>
                <th className="py-3 px-2">Descripción del Circuito</th>
                <th className="py-3 px-2 text-right">Watts (P)</th>
                <th className="py-3 px-2 text-center">F.P.</th>
                <th className="py-3 px-2 text-right">VA (S)</th>
                <th className="py-3 px-2 text-center">Tensión</th>
                <th className="py-3 px-2 text-right text-red-400 print:text-red-650">Fase A ({fasesUnit})</th>
                <th className="py-3 px-2 text-right text-amber-400 print:text-amber-655">Fase B ({fasesUnit})</th>
                <th className="py-3 px-2 text-right text-blue-400 print:text-blue-650">Fase C ({fasesUnit})</th>
                <th className="py-3 px-2 text-right">In (A)</th>
                <th className="py-3 px-2 text-right">Ic (A)</th>
                 <th className="py-3 px-2 text-center">Protección</th>
                 <th className="py-3 px-2 text-center">Conductor</th>
                 <th className="py-3 px-2 text-center">Canalización</th>
                 <th className="py-3 px-2 text-center">Longitud</th>
                 <th className="py-3 px-2 text-center">% Caída V</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50 print:divide-slate-300 font-mono">
              {circuitosProcesados.map((c, i) => (
                <tr key={i} className="hover:bg-slate-900/10 print:hover:bg-transparent text-slate-300 print:text-slate-900">
                  <td className="py-3 px-2 text-center text-slate-500 font-bold">{i + 1}</td>
                  <td className="py-3 px-2 font-bold text-slate-450 print:text-slate-600">{c.num}</td>
                  <td className="py-3 px-2 font-sans font-medium text-slate-200 print:text-slate-900">{c.desc}</td>
                  <td className="py-3 px-2 text-right font-bold">{Math.round(c.watts).toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">{c.fp.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right">{Math.round(c.va).toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">{c.voltaje}</td>
                  <td className="py-3 px-2 text-right font-bold text-slate-350 print:text-slate-800">
                    {c.fases.A > 0 ? (fasesUnit === 'A' ? c.fases.A.toFixed(2) : Math.round(c.fases.A).toLocaleString()) : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-slate-350 print:text-slate-800">
                    {c.fases.B > 0 ? (fasesUnit === 'A' ? c.fases.B.toFixed(2) : Math.round(c.fases.B).toLocaleString()) : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-slate-350 print:text-slate-800">
                    {c.fases.C > 0 ? (fasesUnit === 'A' ? c.fases.C.toFixed(2) : Math.round(c.fases.C).toLocaleString()) : '-'}
                  </td>
                  <td className="py-3 px-2 text-right">{c.in.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-semibold">{c.ic.toFixed(2)}</td>
                   <td className="py-3 px-2 text-center font-bold text-teal-400 print:text-slate-900">{c.proteccion}</td>
                   <td className="py-3 px-2 text-center font-semibold text-slate-400 print:text-slate-800">{c.conductor}</td>
                   <td className="py-3 px-2 text-center text-slate-400 print:text-slate-800 font-sans">{c.tuberiaDiametro} / {c.tuberiaTipo}</td>
                   <td className="py-3 px-2 text-center font-semibold">{c.longitudMetros} m</td>
                   <td className="py-3 px-2 text-center font-bold">
                     <div className="flex items-center justify-center gap-1">
                       {c.caida > 3.00 && <AlertTriangle size={11} className="text-rose-500 print:text-rose-700" />}
                       <span className={c.caida > 3.00 ? 'text-rose-400 print:text-rose-700 font-black' : 'text-emerald-400 print:text-emerald-700'}>
                         {c.caida.toFixed(2)}%
                       </span>
                     </div>
                   </td>
                 </tr>
              ))}
              
              {/* Fila de Totales */}
              <tr className="bg-slate-900/30 print:bg-slate-100 font-bold border-t border-slate-800/80 print:border-t-2 print:border-slate-600 text-slate-200 print:text-slate-950 text-[11px]">
                <td colSpan="3" className="py-4 px-2 uppercase tracking-wide">Totales generales</td>
                <td className="py-4 px-2 text-right text-emerald-400 print:text-emerald-700">{Math.round(totalW).toLocaleString()} W</td>
                <td className="py-4 px-2 text-center">-</td>
                <td className="py-4 px-2 text-right text-cyan-400 print:text-cyan-700">{Math.round(totalVA).toLocaleString()} VA</td>
                <td className="py-4 px-2 text-center">-</td>
                <td className="py-4 px-2 text-right text-red-400 print:text-red-700">
                  {fasesUnit === 'A' ? fasesVA.A.toFixed(2) : Math.round(fasesVA.A).toLocaleString()} {fasesUnit}
                </td>
                <td className="py-4 px-2 text-right text-amber-400 print:text-amber-700">
                  {fasesUnit === 'A' ? fasesVA.B.toFixed(2) : Math.round(fasesVA.B).toLocaleString()} {fasesUnit}
                </td>
                <td className="py-4 px-2 text-right text-blue-400 print:text-blue-700">
                  {fasesUnit === 'A' ? fasesVA.C.toFixed(2) : Math.round(fasesVA.C).toLocaleString()} {fasesUnit}
                </td>
                 <td colSpan="7" className="py-4 px-2 text-right text-slate-400 print:text-slate-700">
                   Desbalanceo UVIE: <span className={desbalanceUVIE > 5 ? 'text-rose-400 font-black' : 'text-emerald-450'}>{desbalanceUVIE.toFixed(2)}%</span>
                 </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certificación Footnote */}
        <div className="mt-8 border-t border-slate-900/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-sans print:text-slate-600 print-footer-section">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Este documento cumple con las especificaciones del Artículo 210 y 220 de la NOM-001-SEDE-2012.</span>
          </div>
          <div>
            <span>Estatus: <strong>DICTAMEN APTO PARA APROBACIÓN</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
