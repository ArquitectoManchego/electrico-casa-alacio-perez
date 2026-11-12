import React from 'react';
import { FileSpreadsheet, Printer, Download, Award, ShieldCheck, AlertTriangle, ArrowRightLeft, ShieldAlert, Gauge, RotateCcw } from 'lucide-react';
import { 
  calcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor,
  calcularDesbalanceUVIE,
  calcularCaidaTension
} from '../utils/ecuacionesUVIE';
import {
  determinarAcometidaMedidor,
  distribuirCargaPorFases
} from '../utils/electricalCalculations';
import {
  exportarCuadroCargasIndividualPDF,
  exportarTodosCuadrosCargasIndividualesPDF,
  exportarDocumentoConsolidadoPDF
} from '../utils/pdfCuadroCargas';
import { extraerLocalYTipoLimpio } from '../utils/localHelpers';
import { useResizableColumns, ColumnResizerHandle } from '../utils/useResizableColumns';

const UVIE_DEFAULT_WIDTHS = [
  40,  // 0: #
  56,  // 1: Cto
  155, // 2: Medidor
  140, // 3: Local
  220, // 4: Descripción del Circuito
  78,  // 5: Watts (P)
  54,  // 6: F.P.
  78,  // 7: VA (S)
  68,  // 8: Tensión
  78,  // 9: Fase A
  78,  // 10: Fase B
  78,  // 11: Fase C
  68,  // 12: In (A)
  68,  // 13: Ic (A)
  95,  // 14: Protección
  130, // 15: Conductor
  78   // 16: % Caída V
];

function TablaGrupoUVIE({
  grupo,
  gIdx,
  fasesUnit,
  onBalancearMedidor
}) {
  const storageKey = `sge_col_widths_uvie_${grupo.medidor.id}`;
  const {
    widths,
    totalTableWidth,
    isCustomized,
    startResize,
    resetColumnWidth,
    resetAllWidths
  } = useResizableColumns(storageKey, UVIE_DEFAULT_WIDTHS);

  const renderResizer = (idx) => (
    <ColumnResizerHandle
      onMouseDown={(e) => startResize(idx, e)}
      onDoubleClick={() => resetColumnWidth(idx)}
    />
  );

  return (
    <div className="mb-5 last:mb-2 rounded-xl border border-slate-800/70 bg-slate-950/50 overflow-hidden">
      {/* Encabezado del Grupo de Medidor */}
      <div className="cuadro-uvie-banner bg-slate-900/80 border-b border-teal-500/40 text-teal-300 font-sans font-bold py-2.5 px-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Gauge size={14} className="text-teal-400" />
            <span className="text-xs uppercase tracking-wider">
              Grupo {gIdx + 1}: {grupo.medidor.nombre} (Medidor {grupo.medidor.numero})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">
              {grupo.circuitos.length} Cargas asignadas
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-300 flex flex-wrap items-center gap-2.5">
            <span>Subtotal: <strong>{Math.round(grupo.subtotalW).toLocaleString()} W</strong> ({Math.round(grupo.subtotalVA).toLocaleString()} VA)</span>
            {isCustomized && (
              <button
                type="button"
                onClick={resetAllWidths}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-sans font-semibold flex items-center gap-1 transition-all no-print cursor-pointer"
                title="Restaurar ancho de columnas por defecto para esta tabla"
              >
                <RotateCcw size={10} />
                <span>Restaurar columnas</span>
              </button>
            )}
            <button
              onClick={() => exportarCuadroCargasIndividualPDF(grupo, fasesUnit)}
              className="px-2 py-0.5 rounded bg-teal-500/20 hover:bg-teal-500/35 text-teal-300 border border-teal-500/40 text-[10px] font-sans font-bold flex items-center gap-1 transition-all no-print cursor-pointer"
              title={`Descargar PDF oficial de este cuadro de cargas (${grupo.medidor.nombre})`}
            >
              <Download size={11} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          className="border-collapse text-left text-xs"
          style={{ tableLayout: 'fixed', width: `${totalTableWidth}px`, minWidth: '100%' }}
        >
          <colgroup>
            {widths.map((w, i) => (
              <col key={i} style={{ width: `${w}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="cuadro-uvie-header border-b border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px] bg-slate-950/60">
              <th className="relative py-3 px-2 text-center select-none overflow-hidden text-ellipsis"># {renderResizer(0)}</th>
              <th className="relative py-3 px-2 select-none overflow-hidden text-ellipsis">Cto {renderResizer(1)}</th>
              <th className="relative py-3 px-2 text-teal-400 whitespace-nowrap select-none overflow-hidden text-ellipsis">Medidor {renderResizer(2)}</th>
              <th className="relative py-3 px-2 text-indigo-400 whitespace-nowrap select-none overflow-hidden text-ellipsis">Local {renderResizer(3)}</th>
              <th className="relative py-3 px-2 select-none overflow-hidden text-ellipsis">Descripción del Circuito {renderResizer(4)}</th>
              <th className="relative py-3 px-2 text-right select-none overflow-hidden text-ellipsis">Watts (P) {renderResizer(5)}</th>
              <th className="relative py-3 px-2 text-center select-none overflow-hidden text-ellipsis">F.P. {renderResizer(6)}</th>
              <th className="relative py-3 px-2 text-right select-none overflow-hidden text-ellipsis">VA (S) {renderResizer(7)}</th>
              <th className="relative py-3 px-2 text-center select-none overflow-hidden text-ellipsis">Tensión {renderResizer(8)}</th>
              <th className="relative py-2 px-2 text-right text-red-400 select-none overflow-hidden text-ellipsis">
                <div>Fase A</div>
                <div className="text-[9px] font-normal opacity-75 leading-tight">({fasesUnit})</div>
                {renderResizer(9)}
              </th>
              <th className="relative py-2 px-2 text-right text-amber-400 select-none overflow-hidden text-ellipsis">
                <div>Fase B</div>
                <div className="text-[9px] font-normal opacity-75 leading-tight">({fasesUnit})</div>
                {renderResizer(10)}
              </th>
              <th className="relative py-2 px-2 text-right text-blue-400 select-none overflow-hidden text-ellipsis">
                <div>Fase C</div>
                <div className="text-[9px] font-normal opacity-75 leading-tight">({fasesUnit})</div>
                {renderResizer(11)}
              </th>
              <th className="relative py-3 px-2 text-right select-none overflow-hidden text-ellipsis">In (A) {renderResizer(12)}</th>
              <th className="relative py-3 px-2 text-right select-none overflow-hidden text-ellipsis">Ic (A) {renderResizer(13)}</th>
              <th className="relative py-3 px-2 text-center select-none overflow-hidden text-ellipsis">Protección {renderResizer(14)}</th>
              <th className="relative py-3 px-2 text-center select-none overflow-hidden text-ellipsis">Conductor {renderResizer(15)}</th>
              <th className="relative py-3 px-2 text-center select-none overflow-hidden text-ellipsis">% Caída V {renderResizer(16)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/50 font-mono">
            {grupo.circuitos.length === 0 ? (
              <tr>
                <td colSpan="17" className="py-4 text-center text-slate-600 italic">
                  No hay cargas asignadas a este medidor actualmente.
                </td>
              </tr>
            ) : (
              grupo.circuitos.map((c, i) => (
                <tr key={c.id || i} className="cuadro-uvie-row hover:bg-slate-900/30 text-slate-300">
                  <td className="py-2.5 px-2 text-center text-slate-500 font-bold overflow-hidden text-ellipsis">{c.index + 1}</td>
                  <td className="py-2.5 px-2 font-bold text-slate-400 overflow-hidden text-ellipsis">{c.num}</td>
                  <td className="py-2.5 px-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-slate-200 font-sans font-medium text-xs">
                      {grupo.medidor.nombre || c.medidorNombre}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-indigo-300 font-sans text-xs font-medium">
                      {c.local}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-sans font-medium text-slate-200 overflow-hidden text-ellipsis" title={c.desc}>{c.desc}</td>
                  <td className="py-2.5 px-2 text-right font-bold overflow-hidden text-ellipsis">{Math.round(c.watts).toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-center overflow-hidden text-ellipsis">{c.fp.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right overflow-hidden text-ellipsis">{Math.round(c.va).toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-center overflow-hidden text-ellipsis">{c.voltaje}</td>
                  <td className="fase-a py-2.5 px-2 text-right font-bold text-slate-300 overflow-hidden text-ellipsis">
                    {c.fases.A > 0 ? (fasesUnit === 'A' ? c.fases.A.toFixed(2) : Math.round(c.fases.A).toLocaleString()) : '-'}
                  </td>
                  <td className="fase-b py-2.5 px-2 text-right font-bold text-slate-300 overflow-hidden text-ellipsis">
                    {c.fases.B > 0 ? (fasesUnit === 'A' ? c.fases.B.toFixed(2) : Math.round(c.fases.B).toLocaleString()) : '-'}
                  </td>
                  <td className="fase-c py-2.5 px-2 text-right font-bold text-slate-300 overflow-hidden text-ellipsis">
                    {c.fases.C > 0 ? (fasesUnit === 'A' ? c.fases.C.toFixed(2) : Math.round(c.fases.C).toLocaleString()) : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right overflow-hidden text-ellipsis">{c.in.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-semibold overflow-hidden text-ellipsis">{c.ic.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-center font-bold text-teal-400 overflow-hidden text-ellipsis">{c.proteccion}</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 overflow-hidden text-ellipsis">{c.conductor}</td>
                  <td className="py-2.5 px-2 text-center font-bold overflow-hidden text-ellipsis">
                    <span className={c.caida > 3.00 ? 'text-rose-400 font-black' : 'text-emerald-400'}>
                      {c.caida.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))
            )}

            {/* Fila de Subtotales del Medidor con Botón de Exportar PDF y Balancear */}
            <tr className="cuadro-uvie-subtotal bg-slate-900/50 font-bold border-t border-slate-700/60 text-slate-200 text-[11px]">
              <td colSpan="5" className="py-3 px-3 uppercase tracking-wider text-teal-300">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span>SUBTOTALES {grupo.medidor.nombre.toUpperCase()}</span>
                  <div className="flex items-center gap-2 no-print">
                    <button
                      onClick={() => exportarCuadroCargasIndividualPDF(grupo, fasesUnit)}
                      className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/35 text-teal-300 border border-teal-500/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      title={`Descargar documento PDF exclusivo para ${grupo.medidor.nombre}`}
                    >
                      <Download size={11} />
                      <span>📄 Exportar PDF ({grupo.medidor.nombre})</span>
                    </button>
                    {onBalancearMedidor && (
                      <button
                        onClick={() => onBalancearMedidor(grupo.medidor.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        title={`Abrir balanceador de cargas específicamente para ${grupo.medidor.nombre}`}
                      >
                        <ArrowRightLeft size={11} />
                        <span>⚡ Balancear Cargas</span>
                      </button>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 text-right text-emerald-400 overflow-hidden text-ellipsis">{Math.round(grupo.subtotalW).toLocaleString()} W</td>
              <td className="py-3 px-2 text-center">-</td>
              <td className="py-3 px-2 text-right text-cyan-400 overflow-hidden text-ellipsis">{Math.round(grupo.subtotalVA).toLocaleString()} VA</td>
              <td className="py-3 px-2 text-center">-</td>
              <td className={`py-3 px-2 text-right overflow-hidden text-ellipsis ${grupo.fasesDisponibles.includes('A') ? 'text-red-400' : 'text-slate-600'}`}>
                {grupo.fasesDisponibles.includes('A')
                  ? (fasesUnit === 'A' ? grupo.subtotalFases.A.toFixed(2) : Math.round(grupo.subtotalFases.A).toLocaleString())
                  : '-'}
              </td>
              <td className={`py-3 px-2 text-right overflow-hidden text-ellipsis ${grupo.fasesDisponibles.includes('B') ? 'text-amber-400' : 'text-slate-600'}`}>
                {grupo.fasesDisponibles.includes('B')
                  ? (fasesUnit === 'A' ? grupo.subtotalFases.B.toFixed(2) : Math.round(grupo.subtotalFases.B).toLocaleString())
                  : '-'}
              </td>
              <td className={`py-3 px-2 text-right overflow-hidden text-ellipsis ${grupo.fasesDisponibles.includes('C') ? 'text-blue-400' : 'text-slate-600'}`}>
                {grupo.fasesDisponibles.includes('C')
                  ? (fasesUnit === 'A' ? grupo.subtotalFases.C.toFixed(2) : Math.round(grupo.subtotalFases.C).toLocaleString())
                  : '-'}
              </td>
              <td colSpan="5" className="py-3 px-2 text-right text-slate-400">
                Desbalance Medidor: <span className={grupo.desbalanceMedidor > 5 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{grupo.desbalanceMedidor.toFixed(2)}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CuadroCargasUVIE({ 
  aparatos = [], 
  acometida = { id: 'monofasico', tipo: 'Monofásico 1F-1N', fasesDisponibles: ['A'] }, 
  medidores = [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }],
  medidoresData = {},
  activeMedidorId,
  onSelectMedidor,
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

  const [selectedMedFilter, setSelectedMedFilter] = React.useState('todos');

  const defaultMedId = listaMedidores[0].id;
  const knownIds = new Set(listaMedidores.map(m => m.id));

  // Helper para mapa de nombres y acometidas de medidores
  const medidoresNombresMap = new Map();
  const acometidaPorMed = {};
  listaMedidores.forEach(m => {
    medidoresNombresMap.set(m.id, m.nombre || `Medidor ${m.numero}`);
    const apsMed = aparatos.filter(ap => {
      const mId = ap.medidorId && knownIds.has(ap.medidorId) ? ap.medidorId : defaultMedId;
      return mId === m.id;
    });
    acometidaPorMed[m.id] = medidoresData?.[m.id]?.acometida || determinarAcometidaMedidor(m, apsMed);
  });

  // Procesar todos los circuitos individuales respetando las fases habilitadas de su medidor
  let globalTotalW = 0;
  let globalTotalVA = 0;
  const globalFasesVA = { A: 0, B: 0, C: 0 };
  const globalFasesVABase = { A: 0, B: 0, C: 0 };

  const circuitosProcesados = aparatos.map((ap, index) => {
    const mId = ap.medidorId && knownIds.has(ap.medidorId) ? ap.medidorId : defaultMedId;
    const acometidaMed = acometidaPorMed[mId] || acometida;
    const dist = distribuirCargaPorFases(ap, acometidaMed);
    const w = dist.watts;
    const fp = dist.fp;
    const va = dist.va;

    globalTotalW += w;
    globalTotalVA += va;

    const fLoad = dist.fVA;
    const fLoadDisplay = { A: 0, B: 0, C: 0 };
    ['A', 'B', 'C'].forEach(f => {
      globalFasesVABase[f] += fLoad[f];
      if (fasesUnit === 'VA') {
        fLoadDisplay[f] = dist.fVA[f];
      } else if (fasesUnit === 'W') {
        fLoadDisplay[f] = dist.fLoad[f];
      } else if (fasesUnit === 'A') {
        fLoadDisplay[f] = dist.fAmps[f];
      }
      globalFasesVA[f] += fLoadDisplay[f];
    });

    const tipoEfectivo = acometidaMed.id === 'monofasico'
      ? 'monofasica'
      : (ap.tipoCarga === 'trifasica' && acometidaMed.id !== 'trifasico' ? 'bifasica' : ap.tipoCarga);

    const inNom = calcularCorrienteNominal(va, tipoEfectivo);
    const icCorr = calcularCorrienteCorregida(inNom);

    // Overrides de tablero
    const autoProteccion = seleccionarProteccion(icCorr);
    const activeProteccion = ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? parseInt(ap.overrideBreaker) : autoProteccion;

    const autoConductor = seleccionarConductor(activeProteccion);
    const activeConductor = ap.overrideCable && ap.overrideCable !== 'Auto' ? ap.overrideCable : autoConductor;

    const cableCalibre = activeConductor.split(' ')[0];
    let conductorFormato = '';
    if (tipoEfectivo === 'monofasica') {
      conductorFormato = `2 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    } else if (tipoEfectivo === 'bifasica') {
      conductorFormato = `2 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    } else {
      conductorFormato = `3 # ${cableCalibre} + 1 # ${cableCalibre} T`;
    }
    if (ap.overrideCable && ap.overrideCable !== 'Auto') conductorFormato += '*';

    let interruptorFormato = '';
    if (tipoEfectivo === 'monofasica') {
      interruptorFormato = `1 x ${activeProteccion} A`;
    } else if (tipoEfectivo === 'bifasica') {
      interruptorFormato = `2 x ${activeProteccion} A`;
    } else {
      interruptorFormato = `3 x ${activeProteccion} A`;
    }
    if (ap.overrideBreaker && ap.overrideBreaker !== 'Auto') interruptorFormato += '*';

    const caidaTension = calcularCaidaTension(
      ap.longitudMetros !== undefined ? ap.longitudMetros : 15,
      inNom,
      tipoEfectivo,
      activeConductor
    );

    const { local: localNombre, tipoLimpio } = extraerLocalYTipoLimpio(ap, medidoresNombresMap.get(mId));

    return {
      id: ap.id,
      index,
      num: `C-${index + 1}`,
      medidorId: mId,
      medidorNombre: medidoresNombresMap.get(mId) || 'Medidor 1',
      local: localNombre,
      desc: tipoLimpio + (ap.modelo ? ` (${ap.modelo})` : ''),
      tipoCarga: tipoEfectivo,
      watts: w,
      fp: fp,
      va: va,
      voltaje: tipoEfectivo === 'monofasica' ? '127 V' : '220 V',
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

  // ========================================================
  // AGRUPACIÓN DE FILAS POR MEDIDOR
  // ========================================================
  const gruposMedidores = listaMedidores.map(med => {
    const circuitosDelMedidor = circuitosProcesados.filter(c => c.medidorId === med.id);
    const acometidaMed = acometidaPorMed[med.id] || acometida;
    const fasesDisp = acometidaMed.fasesDisponibles || ['A'];

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

    const desbalanceMedidor = calcularDesbalanceUVIE(
      subtotalFasesBase.A,
      subtotalFasesBase.B,
      subtotalFasesBase.C,
      acometidaMed.id,
      fasesDisp
    );

    return {
      medidor: med,
      circuitos: circuitosDelMedidor,
      subtotalW,
      subtotalVA,
      subtotalFases,
      desbalanceMedidor,
      acometidaMedId: acometidaMed.id,
      fasesDisponibles: fasesDisp
    };
  });

  const desbalanceUVIEGlobal = listaMedidores.length > 1
    ? Math.max(0, ...gruposMedidores.map(g => g.desbalanceMedidor || 0))
    : calcularDesbalanceUVIE(
        globalFasesVABase.A,
        globalFasesVABase.B,
        globalFasesVABase.C,
        acometida.id,
        acometida.fasesDisponibles
      );

  const gruposMedidoresFiltrados = React.useMemo(() => {
    if (selectedMedFilter === 'todos') return gruposMedidores;
    return gruposMedidores.filter(g => g.medidor.id === selectedMedFilter);
  }, [gruposMedidores, selectedMedFilter]);

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
              <th>Local</th>
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
      html += `<tr><td colspan="16" class="medidor-header">${g.medidor.nombre.toUpperCase()} (MEDIDOR ${g.medidor.numero})</td></tr>`;
      g.circuitos.forEach(c => {
        html += `
          <tr>
            <td>${c.num}</td>
            <td>${c.medidorNombre}</td>
            <td>${c.local || ''}</td>
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
          <td colspan="4">SUBTOTALES ${g.medidor.nombre.toUpperCase()}</td>
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
        <td colspan="4">TOTALES GENERALES DEL PROYECTO</td>
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
              Separación técnica de circuitos, subtotales normativos y balance independiente por medidor. Arrastra el borde de las columnas en cada tabla para ajustar su ancho.
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

          {/* Botón: Exportar Todos a PDF (1 archivo por Medidor) */}
          <button
            onClick={() => exportarTodosCuadrosCargasIndividualesPDF(gruposMedidoresFiltrados, fasesUnit)}
            className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            title="Genera y descarga 1 documento PDF independiente por cada cuadro de cargas de medidor"
          >
            <Download size={14} />
            <span>Exportar Todos a PDF (1 por Medidor)</span>
          </button>

          {/* Botón: PDF Consolidado (1 hoja por Medidor) */}
          <button
            onClick={() => exportarDocumentoConsolidadoPDF(gruposMedidoresFiltrados, fasesUnit)}
            className="px-3.5 py-1.5 rounded-lg border border-teal-500/50 bg-teal-950/40 hover:bg-teal-900/50 text-teal-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Descarga un solo archivo PDF con cada cuadro de cargas en una hoja propia"
          >
            <Download size={14} />
            <span>PDF Consolidado (1 Hoja/Medidor)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            Excel
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Selector de Medidor para Cuadro de Cargas */}
      {listaMedidores.length > 1 && (
        <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 bg-slate-900/40 no-print">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Filtrar Cuadro de Cargas:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedMedFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMedFilter === 'todos'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>Todos los Medidores ({circuitosProcesados.length} cargas)</span>
            </button>

            {listaMedidores.map(med => {
              const count = circuitosProcesados.filter(c => c.medidorId === med.id).length;
              return (
                <button
                  key={med.id}
                  onClick={() => setSelectedMedFilter(med.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedMedFilter === med.id
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{med.nombre || `Medidor ${med.numero}`}</span>
                  <span className="text-[10px] opacity-80 font-mono">({count})</span>
                </button>
              );
            })}

            {selectedMedFilter !== 'todos' && (
              <button
                onClick={() => {
                  const targetGrupo = gruposMedidores.find(g => g.medidor.id === selectedMedFilter);
                  if (targetGrupo) exportarCuadroCargasIndividualPDF(targetGrupo, fasesUnit);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 ml-auto"
                title="Descargar PDF del medidor seleccionado"
              >
                <Download size={13} />
                <span>Descargar PDF Seleccionado</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tablas Oficiales por Medidor */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-2 sm:p-4 print:border-none print:p-0 print:m-0 print:overflow-visible">
        <style>{`
          @media print {
            .cuadro-uvie-banner {
              background-color: #d1fae5 !important;
              color: #000000 !important;
              border: 1px solid #0d9488 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .cuadro-uvie-banner * {
              color: #000000 !important;
            }
            .cuadro-uvie-header th {
              background-color: #0f766e !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .cuadro-uvie-subtotal {
              background-color: #d1fae5 !important;
              color: #000000 !important;
              border-top: 2px solid #0d9488 !important;
              border-bottom: 2px solid #0d9488 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .cuadro-uvie-subtotal * {
              color: #000000 !important;
            }
            .cuadro-uvie-row td {
              color: #000000 !important;
            }
            .cuadro-uvie-row .fase-a {
              color: #991b1b !important;
              font-weight: bold !important;
            }
            .cuadro-uvie-row .fase-b {
              color: #78350f !important;
              font-weight: bold !important;
            }
            .cuadro-uvie-row .fase-c {
              color: #1e40af !important;
              font-weight: bold !important;
            }
          }
        `}</style>
        <div className="print-landscape-page w-full">
          {gruposMedidoresFiltrados.map((grupo, gIdx) => (
            <TablaGrupoUVIE
              key={grupo.medidor.id}
              grupo={grupo}
              gIdx={gIdx}
              fasesUnit={fasesUnit}
              onBalancearMedidor={onBalancearMedidor}
            />
          ))}

          {/* Resumen de Totales Generales del Proyecto */}
          <div className="mt-4 rounded-xl border-2 border-emerald-500/50 bg-slate-900/90 p-3.5 text-slate-100 text-xs font-mono flex flex-wrap items-center justify-between gap-4">
            <div className="uppercase tracking-wider text-emerald-400 font-display font-bold">
              TOTALES GENERALES DEL PROYECTO ({listaMedidores.length} MEDIDORES)
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>Potencia Activa: <strong className="text-emerald-400">{Math.round(globalTotalW).toLocaleString()} W</strong></span>
              <span>Potencia Aparente: <strong className="text-cyan-400">{Math.round(globalTotalVA).toLocaleString()} VA</strong></span>
              <span>Fase A: <strong className="text-red-400">{fasesUnit === 'A' ? globalFasesVA.A.toFixed(2) : Math.round(globalFasesVA.A).toLocaleString()} {fasesUnit}</strong></span>
              <span>Fase B: <strong className="text-amber-400">{fasesUnit === 'A' ? globalFasesVA.B.toFixed(2) : Math.round(globalFasesVA.B).toLocaleString()} {fasesUnit}</strong></span>
              <span>Fase C: <strong className={globalFasesVA.C > 0 ? 'text-blue-400' : 'text-slate-500'}>
                {globalFasesVA.C > 0
                  ? `${fasesUnit === 'A' ? globalFasesVA.C.toFixed(2) : Math.round(globalFasesVA.C).toLocaleString()} ${fasesUnit}`
                  : '-'}
              </strong></span>
              <span>
                {listaMedidores.length > 1 ? 'Desbalance Máx. Medidor:' : 'Desbalance Global:'}{' '}
                <strong className={desbalanceUVIEGlobal > 5 ? 'text-rose-400 font-black' : 'text-emerald-400 font-bold'}>{desbalanceUVIEGlobal.toFixed(2)}%</strong>
              </span>
            </div>
          </div>
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
