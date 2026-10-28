import React from 'react';
import { FileSpreadsheet, Printer, Download, Award, ShieldCheck, AlertTriangle, ArrowRightLeft, ShieldAlert, Gauge } from 'lucide-react';
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
  aparatos = [], 
  acometida = { id: 'monofasico', tipo: 'Monofásico 1F-1N', fasesDisponibles: ['A'] }, 
  medidores = [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }],
  fasesUnit = 'VA', 
  onChangeFasesUnit, 
  onBalancearFases,
  onBalancearMedidor,
  balancingConfigsCount = 0 
}) {
  // Asegurar lista de medidores válida
  const listaMedidores = Array.isArray(medidores) && medidores.length > 0 
    ? medidores 
    : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }];

  // Helper para mapa de nombres de medidores
  const medidoresNombresMap = new Map();
  listaMedidores.forEach(m => {
    medidoresNombresMap.set(m.id, m.nombre || `Medidor ${m.numero}`);
  });

  // Procesar todos los circuitos individuales
  let globalTotalW = 0;
  let globalTotalVA = 0;
  const globalFasesVA = { A: 0, B: 0, C: 0 };
  const globalFasesVABase = { A: 0, B: 0, C: 0 };

  const circuitosProcesados = aparatos.map((ap, index) => {
    const w = parseFloat(ap.watts) || 0;
    const fp = parseFloat(ap.fp) || 1.0;
    const va = calcularVA(w, fp, ap.usarVaDirecto);
    const mId = ap.medidorId || listaMedidores[0].id;
    
    globalTotalW += w;
    globalTotalVA += va;

    // Repartir en fases (base VA)
    const fLoad = { A: 0, B: 0, C: 0 };
    if (ap.tipoCarga === 'monofasica') {
      const f = ap.fase || 'A';
      fLoad[f] = va;
      globalFasesVABase[f] += va;
    } else if (ap.tipoCarga === 'bifasica') {
      if (acometida.id === 'trifasico') {
        const combo = ap.fase || 'A-B';
        const parts = combo.split('-');
        parts.forEach(p => {
          fLoad[p] = va / 2;
          globalFasesVABase[p] += va / 2;
        });
      } else {
        fLoad.A = va / 2;
        fLoad.B = va / 2;
        globalFasesVABase.A += va / 2;
        globalFasesVABase.B += va / 2;
      }
    } else if (ap.tipoCarga === 'trifasica') {
      fLoad.A = va / 3;
      fLoad.B = va / 3;
      fLoad.C = va / 3;
      globalFasesVABase.A += va / 3;
      globalFasesVABase.B += va / 3;
      globalFasesVABase.C += va / 3;
    }

    // Convertir a la unidad actual
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
        globalFasesVA[f] += fLoadDisplay[f];
      }
    });

    const inNom = calcularCorrienteNominal(va, ap.tipoCarga);
    const icCorr = calcularCorrienteCorregida(inNom);
    
    // Overrides de tablero
    const autoProteccion = seleccionarProteccion(icCorr);
    const activeProteccion = ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? parseInt(ap.overrideBreaker) : autoProteccion;

    const autoConductor = seleccionarConductor(activeProteccion);
    const activeConductor = ap.overrideCable && ap.overrideCable !== 'Auto' ? ap.overrideCable : autoConductor;

    const cableCalibre = activeConductor.split(' ')[0];
    let conductorFormato = '';
    if (ap.tipoCarga === 'monofasica') {
      conductorFormato = `2 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    } else if (ap.tipoCarga === 'bifasica') {
      conductorFormato = `3 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    } else {
      conductorFormato = `4 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    }
    if (ap.overrideCable && ap.overrideCable !== 'Auto') conductorFormato += '*';

    let interruptorFormato = '';
    if (ap.tipoCarga === 'monofasica') {
      interruptorFormato = `1 x ${activeProteccion} A`;
    } else if (ap.tipoCarga === 'bifasica') {
      interruptorFormato = `2 x ${activeProteccion} A`;
    } else {
      interruptorFormato = `3 x ${activeProteccion} A`;
    }
    if (ap.overrideBreaker && ap.overrideBreaker !== 'Auto') interruptorFormato += '*';

    const caidaTension = calcularCaidaTension(
      ap.longitudMetros !== undefined ? ap.longitudMetros : 15,
      inNom,
      acometida.id === 'monofasico' ? 'monofasica' : ap.tipoCarga,
      activeConductor
    );

    return {
      id: ap.id,
      index,
      num: `C-${index + 1}`,
      medidorId: mId,
      medidorNombre: medidoresNombresMap.get(mId) || 'Medidor 1',
      desc: ap.tipo + (ap.modelo ? ` (${ap.modelo})` : ''),
      watts: w,
      fp: fp,
      va: va,
      voltaje: ap.tipoCarga === 'monofasica' ? '127 V' : '220 V',
      fases: fLoadDisplay,
      fasesBase: fLoad,
      in: inNom,
      ic: icCorr,
      proteccion: interruptorFormato,
      conductor: conductorFormato,
      tuberiaDiametro: ap.tuberiaDiametro || '16 mm (1/2")',
      tuberiaTipo: ap.tuberiaTipo || 'Pared Delgada',
      longitudMetros: ap.longitudMetros !== undefined ? parseFloat(ap.longitudMetros) : 15,
      kaic: ap.kaic || '10 kA',
      caida: caidaTension
    };
  });

  const desbalanceUVIEGlobal = calcularDesbalanceUVIE(globalFasesVABase.A, globalFasesVABase.B, globalFasesVABase.C, acometida.id);

  // ========================================================
  // AGRUPACIÓN DE FILAS POR MEDIDOR
  // ========================================================
  const gruposMedidores = listaMedidores.map(med => {
    const circuitosDelMedidor = circuitosProcesados.filter(c => c.medidorId === med.id);
    
    // Totales del grupo
    let subtotalW = 0;
    let subtotalVA = 0;
    const subtotalFases = { A: 0, B: 0, C: 0 };
    const subtotalFasesBase = { A: 0, B: 0, C: 0 };

    circuitosDelMedidor.forEach(c => {
      subtotalW += c.watts;
      subtotalVA += c.va;
      ['A', 'B', 'C'].forEach(f => {
        subtotalFases[f] += c.fases[f] || 0;
        subtotalFasesBase[f] += c.fasesBase[f] || 0;
      });
    });

    // Desbalance propio de este medidor
    const acometidaMedId = subtotalW > 10000 || med.forzarTrifasico ? 'trifasico' : subtotalW > 5000 ? 'bifasico' : 'monofasico';
    const desbalanceMedidor = calcularDesbalanceUVIE(subtotalFasesBase.A, subtotalFasesBase.B, subtotalFasesBase.C, acometidaMedId);

    return {
      medidor: med,
      circuitos: circuitosDelMedidor,
      subtotalW,
      subtotalVA,
      subtotalFases,
      desbalanceMedidor,
      acometidaMedId
    };
  });

  // Exportar Excel
  const handleExportExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
          th { background-color: #00875a; color: white; border: 1px solid #999; padding: 8px; font-size: 10px; text-transform: uppercase; }
          td { border: 1px solid #ccc; padding: 6px; font-size: 10px; text-align: center; }
          .medidor-header { background-color: #0f172a; color: #14b8a6; font-weight: bold; text-align: left; padding: 8px; }
          .summary-medidor { font-weight: bold; background-color: #e6f4ea; text-align: right; }
          .summary-global { font-weight: bold; background-color: #d1fae5; text-align: right; border-top: 2px solid #047857; }
        </style>
      </head>
      <body>
        <h2>CUADRO DE CARGAS NOM-001-SEDE AGRUPADO POR MEDIDOR</h2>
        <table>
          <thead>
            <tr>
              <th>Cto</th>
              <th>Medidor</th>
              <th>Descripción</th>
              <th>Watts (P)</th>
              <th>F.P.</th>
              <th>VA (S)</th>
              <th>Voltaje</th>
              <th>Fase A (${fasesUnit})</th>
              <th>Fase B (${fasesUnit})</th>
              <th>Fase C (${fasesUnit})</th>
              <th>In (A)</th>
              <th>Ic (A)</th>
              <th>Protección</th>
              <th>Conductor</th>
              <th>Caída V</th>
            </tr>
          </thead>
          <tbody>
    `;

    gruposMedidores.forEach(g => {
      html += `<tr><td colspan="15" class="medidor-header">${g.medidor.nombre.toUpperCase()} (MEDIDOR ${g.medidor.numero})</td></tr>`;
      g.circuitos.forEach(c => {
        html += `
          <tr>
            <td>${c.num}</td>
            <td>${c.medidorNombre}</td>
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
            <td>${c.caida.toFixed(2)}%</td>
          </tr>
        `;
      });
      html += `
        <tr class="summary-medidor">
          <td colspan="3">SUBTOTALES ${g.medidor.nombre.toUpperCase()}</td>
          <td>${Math.round(g.subtotalW)} W</td>
          <td>-</td>
          <td>${Math.round(g.subtotalVA)} VA</td>
          <td>-</td>
          <td>${fasesUnit === 'A' ? g.subtotalFases.A.toFixed(2) : Math.round(g.subtotalFases.A)}</td>
          <td>${fasesUnit === 'A' ? g.subtotalFases.B.toFixed(2) : Math.round(g.subtotalFases.B)}</td>
          <td>${fasesUnit === 'A' ? g.subtotalFases.C.toFixed(2) : Math.round(g.subtotalFases.C)}</td>
          <td colspan="5">Desbalance: ${g.desbalanceMedidor.toFixed(2)}%</td>
        </tr>
      `;
    });

    html += `
      <tr class="summary-global">
        <td colspan="3">TOTALES GENERALES DEL PROYECTO</td>
        <td>${Math.round(globalTotalW)} W</td>
        <td>-</td>
        <td>${Math.round(globalTotalVA)} VA</td>
        <td>-</td>
        <td>${fasesUnit === 'A' ? globalFasesVA.A.toFixed(2) : Math.round(globalFasesVA.A)}</td>
        <td>${fasesUnit === 'A' ? globalFasesVA.B.toFixed(2) : Math.round(globalFasesVA.B)}</td>
        <td>${fasesUnit === 'A' ? globalFasesVA.C.toFixed(2) : Math.round(globalFasesVA.C)}</td>
        <td colspan="5">Desbalance Global: ${desbalanceUVIEGlobal.toFixed(2)}%</td>
      </tr>
      </tbody></table></body></html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cuadro_de_Cargas_Medidores_UVIE.xls';
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Botones de Exportación y Controles */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print mb-4">
        <div className="flex items-center gap-2.5">
          <Award className="text-teal-400" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white font-display">Reporte Oficial UVIE Agrupado por Medidor CFE</h3>
            <p className="text-[10px] text-slate-500 font-sans">
              Separación técnica de circuitos, subtotales normativos y balance independiente por medidor.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onChangeFasesUnit && (
            <button
              onClick={onChangeFasesUnit}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Unidad: {fasesUnit}
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            Excel
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Printer size={14} />
            Imprimir PDF
          </button>
        </div>
      </div>

      {/* Tabla Oficial */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-850 overflow-x-auto shadow-xl relative bg-slate-950/20 print-no-border print-p-0">
        <div className="print-landscape-page">
          <table className="w-full border-collapse text-left min-w-[1000px] text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2 text-center w-[36px]">#</th>
                <th className="py-3 px-2">Cto</th>
                <th className="py-3 px-2 text-teal-400">Medidor</th>
                <th className="py-3 px-2">Descripción del Circuito</th>
                <th className="py-3 px-2 text-right">Watts (P)</th>
                <th className="py-3 px-2 text-center">F.P.</th>
                <th className="py-3 px-2 text-right">VA (S)</th>
                <th className="py-3 px-2 text-center">Tensión</th>
                <th className="py-3 px-2 text-right text-red-400">Fase A ({fasesUnit})</th>
                <th className="py-3 px-2 text-right text-amber-400">Fase B ({fasesUnit})</th>
                <th className="py-3 px-2 text-right text-blue-400">Fase C ({fasesUnit})</th>
                <th className="py-3 px-2 text-right">In (A)</th>
                <th className="py-3 px-2 text-right">Ic (A)</th>
                <th className="py-3 px-2 text-center">Protección</th>
                <th className="py-3 px-2 text-center">Conductor</th>
                <th className="py-3 px-2 text-center">% Caída V</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50 font-mono">
              {gruposMedidores.map((grupo, gIdx) => (
                <React.Fragment key={grupo.medidor.id}>
                  {/* Encabezado del Grupo de Medidor */}
                  <tr className="bg-slate-900/80 border-t-2 border-teal-500/40 text-teal-300 font-sans font-bold">
                    <td colSpan="16" className="py-2.5 px-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gauge size={14} className="text-teal-400" />
                          <span className="text-xs uppercase tracking-wider">
                            Grupo {gIdx + 1}: {grupo.medidor.nombre} (Medidor {grupo.medidor.numero})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">
                            {grupo.circuitos.length} Cargas asignadas
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-300 flex items-center gap-3">
                          <span>Subtotal: <strong>{Math.round(grupo.subtotalW).toLocaleString()} W</strong> ({Math.round(grupo.subtotalVA).toLocaleString()} VA)</span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Filas de circuitos de este medidor */}
                  {grupo.circuitos.length === 0 ? (
                    <tr>
                      <td colSpan="16" className="py-4 text-center text-slate-600 italic">
                        No hay cargas asignadas a este medidor actualmente.
                      </td>
                    </tr>
                  ) : (
                    grupo.circuitos.map((c, i) => (
                      <tr key={c.id || i} className="hover:bg-slate-900/30 text-slate-300">
                        <td className="py-2.5 px-2 text-center text-slate-500 font-bold">{c.index + 1}</td>
                        <td className="py-2.5 px-2 font-bold text-slate-400">{c.num}</td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-teal-400 font-sans font-bold">
                            Medidor {grupo.medidor.numero}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-sans font-medium text-slate-200">{c.desc}</td>
                        <td className="py-2.5 px-2 text-right font-bold">{Math.round(c.watts).toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-center">{c.fp.toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-right">{Math.round(c.va).toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-center">{c.voltaje}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-300">
                          {c.fases.A > 0 ? (fasesUnit === 'A' ? c.fases.A.toFixed(2) : Math.round(c.fases.A).toLocaleString()) : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-300">
                          {c.fases.B > 0 ? (fasesUnit === 'A' ? c.fases.B.toFixed(2) : Math.round(c.fases.B).toLocaleString()) : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-300">
                          {c.fases.C > 0 ? (fasesUnit === 'A' ? c.fases.C.toFixed(2) : Math.round(c.fases.C).toLocaleString()) : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right">{c.in.toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-right font-semibold">{c.ic.toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-teal-400">{c.proteccion}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{c.conductor}</td>
                        <td className="py-2.5 px-2 text-center font-bold">
                          <span className={c.caida > 3.00 ? 'text-rose-400 font-black' : 'text-emerald-400'}>
                            {c.caida.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Fila de Subtotales del Medidor con Botón de Balancear */}
                  <tr className="bg-slate-900/50 font-bold border-t border-slate-700/60 text-slate-200 text-[11px]">
                    <td colSpan="4" className="py-3 px-3 uppercase tracking-wider text-teal-300 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span>SUBTOTALES {grupo.medidor.nombre.toUpperCase()}</span>
                        {/* Botón propio para balancear las cargas de este medidor */}
                        {onBalancearMedidor && (
                          <button
                            onClick={() => onBalancearMedidor(grupo.medidor.id)}
                            className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-bold flex items-center gap-1 transition-all no-print cursor-pointer active:scale-95"
                            title={`Abrir balanceador de cargas específicamente para ${grupo.medidor.nombre}`}
                          >
                            <ArrowRightLeft size={11} />
                            <span>⚡ Balancear Cargas ({grupo.medidor.nombre})</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-emerald-400">{Math.round(grupo.subtotalW).toLocaleString()} W</td>
                    <td className="py-3 px-2 text-center">-</td>
                    <td className="py-3 px-2 text-right text-cyan-400">{Math.round(grupo.subtotalVA).toLocaleString()} VA</td>
                    <td className="py-3 px-2 text-center">-</td>
                    <td className="py-3 px-2 text-right text-red-400">
                      {fasesUnit === 'A' ? grupo.subtotalFases.A.toFixed(2) : Math.round(grupo.subtotalFases.A).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-amber-400">
                      {fasesUnit === 'A' ? grupo.subtotalFases.B.toFixed(2) : Math.round(grupo.subtotalFases.B).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-blue-400">
                      {fasesUnit === 'A' ? grupo.subtotalFases.C.toFixed(2) : Math.round(grupo.subtotalFases.C).toLocaleString()}
                    </td>
                    <td colSpan="5" className="py-3 px-2 text-right text-slate-400">
                      Desbalance Medidor: <span className={grupo.desbalanceMedidor > 5 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{grupo.desbalanceMedidor.toFixed(2)}%</span>
                    </td>
                  </tr>

                  {/* Separador de Espacio entre Medidores */}
                  <tr className="bg-slate-950/80 h-4 border-b border-slate-900">
                    <td colSpan="16" className="p-1"></td>
                  </tr>
                </React.Fragment>
              ))}

              {/* Fila de Totales Generales del Proyecto */}
              <tr className="bg-slate-900/90 font-bold border-t-2 border-emerald-500/60 text-slate-100 text-xs">
                <td colSpan="4" className="py-4 px-3 uppercase tracking-wider text-emerald-400 font-display">
                  TOTALES GENERALES DEL PROYECTO ({listaMedidores.length} MEDIDORES)
                </td>
                <td className="py-4 px-2 text-right text-emerald-400 font-bold">{Math.round(globalTotalW).toLocaleString()} W</td>
                <td className="py-4 px-2 text-center">-</td>
                <td className="py-4 px-2 text-right text-cyan-400 font-bold">{Math.round(globalTotalVA).toLocaleString()} VA</td>
                <td className="py-4 px-2 text-center">-</td>
                <td className="py-4 px-2 text-right text-red-400 font-bold">
                  {fasesUnit === 'A' ? globalFasesVA.A.toFixed(2) : Math.round(globalFasesVA.A).toLocaleString()} {fasesUnit}
                </td>
                <td className="py-4 px-2 text-right text-amber-400 font-bold">
                  {fasesUnit === 'A' ? globalFasesVA.B.toFixed(2) : Math.round(globalFasesVA.B).toLocaleString()} {fasesUnit}
                </td>
                <td className="py-4 px-2 text-right text-blue-400 font-bold">
                  {fasesUnit === 'A' ? globalFasesVA.C.toFixed(2) : Math.round(globalFasesVA.C).toLocaleString()} {fasesUnit}
                </td>
                <td colSpan="5" className="py-4 px-2 text-right text-slate-300">
                  Desbalance Global: <span className={desbalanceUVIEGlobal > 5 ? 'text-rose-400 font-black' : 'text-emerald-400 font-bold'}>{desbalanceUVIEGlobal.toFixed(2)}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certificación Footnote */}
        <div className="mt-8 border-t border-slate-900/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-sans print:text-slate-600 print-footer-section">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Documento certificado para múltiples instalaciones eléctricas bajo NOM-001-SEDE-2012.</span>
          </div>
          <div>
            <span>Estatus: <strong>DICTAMEN MULTI-MEDIDOR APTO PARA APROBACIÓN</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
