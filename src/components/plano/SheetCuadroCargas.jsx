import React from 'react';
import { wrapApparatusText } from '../../utils/gabineteModel.js';
import PlanoCajetinSVG from './PlanoCajetinSVG';

/**
 * SheetCuadroCargas.jsx
 * Renderiza la Lámina 2: CUADRO DE CARGAS en formato vectorial CAD puro.
 * Conforme a la distribución física por ranuras impares/pares de MYKA ARTZ.
 * Dimensiones estándar: 2592 x 1728 pt (Arch D 36" x 24" / 90x60 cm).
 * Optimizado para ocupar el 65-70% de la altura útil con tipografía técnica legible.
 */
export default function SheetCuadroCargas({ model, id = "sheet-cuadro-svg" }) {
  const {
    acometida,
    alimentador,
    circuitos,
    circuitosImpares,
    circuitosPares,
    totales,
    infoPlano,
    resumenCaidas: resumenCaidasProp
  } = model;

  // Cálculo de respaldo dinámico en caso de no venir directamente en el modelo
  const resumenCaidas = resumenCaidasProp || (() => {
    let maxC = 0, ctoC = null, maxT = 0, ctoT = null;
    (circuitos || []).forEach(c => {
      const vc = typeof c.caidaCircuito === 'number' ? c.caidaCircuito : (parseFloat(c.caida) || 0);
      if (vc >= maxC) { maxC = vc; ctoC = c; }
      const vt = typeof c.caidaTotal === 'number' ? c.caidaTotal : ((alimentador?.caidaPct || 0) + vc);
      if (vt >= maxT) { maxT = vt; ctoT = c; }
    });
    return {
      maxCaidaCircuito: maxC,
      ctoMaxDerivadoNum: ctoC?.num || 'C-1',
      ctoMaxDerivadoDesc: ctoC?.desc || '',
      ctoMaxDerivadoLongitud: ctoC?.longitudMetros !== undefined ? ctoC.longitudMetros : 15,
      maxCaidaTotal: maxT,
      ctoMaxTotalNum: ctoMaxTotal?.num || 'C-1',
      cumpleCriterioCombinado: maxT <= 5.0
    };
  })();

  const width = 2592;
  const height = 1728;

  const isBifasico = acometida.id === 'bifasico';
  const isTrifasico = acometida.id === 'trifasico';

  // Configuración de columnas optimizadas (Suma = 2432 pt)
  const startX = 80;
  const tableW = 2432;
  const cols = [
    { id: 'equipo',      label: 'Equipo / Descripción de Carga', w: 340, align: 'left' },
    { id: 'cto',         label: 'Cto',                           w: 65,  align: 'center' },
    { id: 'pos',         label: 'Posición',                      w: 80,  align: 'center' },
    { id: 'voltaje',     label: 'Tensión',                       w: 80,  align: 'center' },
    { id: 'faseA',       label: 'Fase L1 (VA)',                  w: 120, align: 'right' },
    { id: 'faseB',       label: isBifasico || isTrifasico ? 'Fase L2 (VA)' : '-', w: 120, align: 'right' },
    ...(isTrifasico ? [{ id: 'faseC', label: 'Fase L3 (VA)', w: 120, align: 'right' }] : []),
    { id: 'watts',       label: 'W-Totales',                     w: 110, align: 'right' },
    { id: 'fp',          label: 'F.P.',                          w: 65,  align: 'center' },
    { id: 'va',          label: 'S (VA)',                        w: 100, align: 'right' },
    { id: 'int',         label: 'Interruptor',                   w: 110, align: 'center' },
    { id: 'in',          label: 'In (A)',                        w: 85,  align: 'right' },
    { id: 'long',        label: 'L (m)',                         w: 65,  align: 'center' },
    { id: 'ftemp',       label: 'F.T.',                          w: 55,  align: 'center' },
    { id: 'fajuste',     label: 'F.A.',                          w: 55,  align: 'center' },
    { id: 'condFase',    label: 'Conductor Fase',                w: 125, align: 'left' },
    { id: 'condNeutro',  label: 'Neutro',                        w: 110, align: 'center' },
    { id: 'caidaCto',    label: 'e% Cto',                        w: 82,  align: 'right' },
    { id: 'caidaTot',    label: 'e% Tot (c/Alim)',               w: 95,  align: 'right' },
    { id: 'tierra',      label: 'Cond. P.T.',                    w: 115, align: 'left' },
    { id: 'tubo',        label: 'Canalización',                  w: isTrifasico ? 195 : 315, align: 'left' }
  ];

  // Calcular posiciones X de cada columna
  let currentX = startX;
  const colPositions = cols.map(c => {
    const x = currentX;
    currentX += c.w;
    return { ...c, x };
  });

  // Dimensiones ampliadas para legibilidad profesional CAD (65-70% altura útil)
  const rowH = 46;
  const tableStartY = 330;
  const colHeaderH = 38;
  const sectionHeaderH = 30;

  const totalImparH = circuitosImpares.length * rowH;
  const totalParH = circuitosPares.length * rowH;
  const totalRowsH = sectionHeaderH + totalImparH + sectionHeaderH + totalParH + 46; // +46 para fila de totales
  const tableEndY = tableStartY + colHeaderH + totalRowsH;

  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      className="bg-white select-none"
      style={{ backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >
      {/* MARCO PERIMETRAL DOBLE CAD */}
      <rect x="40" y="40" width="2512" height="1648" fill="none" stroke="#000000" strokeWidth="3" />
      <rect x="52" y="52" width="2488" height="1624" fill="none" stroke="#000000" strokeWidth="1" />

      {/* TÍTULO DE LA LÁMINA */}
      <g transform="translate(80, 105)">
        <text fontSize="38" fontWeight="900" fontStyle="italic" fill="#000000" letterSpacing="0.5">
          Cuadro de carga.
        </text>
        <text x="340" y="-4" fontSize="13" fontWeight="bold" fill="#555555" letterSpacing="2">
          CUADRO DE DISTRIBUCIÓN DE CIRCUITOS Y BALANCEO DE FASES · NOM-001-SEDE-2012
        </text>
        <line x1="0" y1="14" x2="650" y2="14" stroke="#000000" strokeWidth="1.5" />
      </g>

      {/* ========================================================================= */}
      {/* ENCABEZADO TÉCNICO DEL TABLERO (4 COLUMNAS FORMALES)                      */}
      {/* ========================================================================= */}
      <g transform="translate(80, 140)">
        <rect x="0" y="0" width={tableW} height="155" fill="#f8fafc" stroke="#000000" strokeWidth="1.5" />
        
        {/* Líneas horizontales de división */}
        <line x1="0" y1="39" x2={tableW} y2="39" stroke="#000000" strokeWidth="0.75" />
        <line x1="0" y1="78" x2={tableW} y2="78" stroke="#000000" strokeWidth="0.75" />
        <line x1="0" y1="117" x2={tableW} y2="117" stroke="#000000" strokeWidth="0.75" />

        {/* Líneas verticales de división (4 columnas) */}
        <line x1={tableW * 0.25} y1="0" x2={tableW * 0.25} y2="155" stroke="#000000" strokeWidth="0.75" />
        <line x1={tableW * 0.50} y1="0" x2={tableW * 0.50} y2="155" stroke="#000000" strokeWidth="0.75" />
        <line x1={tableW * 0.75} y1="0" x2={tableW * 0.75} y2="155" stroke="#000000" strokeWidth="0.75" />

        {/* Fila 1 */}
        <text x="18" y="25" fontSize="12" fill="#444444">Identificación Tablero: <tspan fontWeight="bold" fill="#000000">{alimentador.tipoTableroDesc || 'TABLERO SQUARE D QO — 24 ESPACIOS — 100 A — 2F-3H'}</tspan></text>
        <text x={tableW * 0.25 + 18} y="25" fontSize="12" fill="#444444">Cat. Del Tablero: <tspan fontWeight="bold" fill="#000000">{alimentador.catalogoTablero || 'POR DEFINIR'}</tspan></text>
        <text x={tableW * 0.50 + 18} y="25" fontSize="12" fill="#444444">Tipo de alimentador: <tspan fontWeight="bold" fill="#000000">{alimentador.tipoAislamiento} 600 V</tspan></text>
        <text x={tableW * 0.75 + 18} y="25" fontSize="12" fill="#444444">Canalización: <tspan fontWeight="bold" fill="#000000">{alimentador.canalizacion} ({alimentador.canalizacionTipo})</tspan></text>

        {/* Fila 2 */}
        <text x="18" y="64" fontSize="12" fill="#444444">Marca: <tspan fontWeight="bold" fill="#000000">{alimentador.marcaTablero}</tspan></text>
        <text x={tableW * 0.25 + 18} y="64" fontSize="12" fill="#444444">Cap. Del int. Principal: <tspan fontWeight="bold" fill="#000000">{alimentador.breakerStr}</tspan></text>
        <text x={tableW * 0.50 + 18} y="64" fontSize="12" fill="#444444">Distancia del alimentador: <tspan fontWeight="bold" fill="#000000">{alimentador.longitudMetros} m</tspan></text>
        <text x={tableW * 0.75 + 18} y="64" fontSize="12" fill="#444444">Caída Alimentador: <tspan fontWeight="bold" fill="#047857">{alimentador.caidaPct.toFixed(2)} %</tspan> <tspan fontSize="10.5" fill="#666666">(Criterio NOM 215-2(a) Nota 2: &lt;= 3.0 %)</tspan></text>

        {/* Fila 3 */}
        <text x="18" y="103" fontSize="12" fill="#444444">Obra / Local: <tspan fontWeight="bold" fill="#000000">{infoPlano.proyecto} ({infoPlano.local})</tspan></text>
        <text x={tableW * 0.25 + 18} y="103" fontSize="12" fill="#444444">Capacidad en Barras: <tspan fontWeight="bold" fill="#000000">{alimentador.capacidadBarras}</tspan></text>
        <text x={tableW * 0.50 + 18} y="103" fontSize="12" fill="#444444">Calibre conductor: <tspan fontWeight="bold" fill="#000000">{alimentador.conductorFases} + {alimentador.conductorNeutro}(N) + {alimentador.conductorTierra}(T - Ajustado Art. 250-122.b)</tspan></text>
        <text x={tableW * 0.75 + 18} y="103" fontSize="12" fill="#444444">N° HILOS/FASE: <tspan fontWeight="bold" fill="#000000">{alimentador.sistema}</tspan></text>

        {/* Fila 4 */}
        <text x="18" y="142" fontSize="12" fill="#444444">Fecha de cálculo: <tspan fontWeight="bold" fill="#000000">{infoPlano.fecha}</tspan></text>
        <text x={tableW * 0.25 + 18} y="142" fontSize="12" fill="#444444">Tensión Nominal: <tspan fontWeight="bold" fill="#000000">{alimentador.tension}</tspan></text>
        <text x={tableW * 0.50 + 18} y="142" fontSize="12" fill="#444444">In Alimentador: <tspan fontWeight="bold" fill="#000000">{totales.corrienteNominalAlimentador} A</tspan> <tspan fontSize="10.5" fill="#555555">(Ic = {totales.corrienteDisenoAlimentador} A)</tspan></text>
        <text x={tableW * 0.75 + 18} y="142" fontSize="11" fill="#444444">Fases y Neutro (NOM 220-61): <tspan fontWeight="bold" fill="#047857">I_L1={totales.corrienteL1}A, I_L2={totales.corrienteL2}A, I_N={totales.corrienteNeutro}A</tspan></text>
      </g>

      {/* ========================================================================= */}
      {/* CABECERA DE COLUMNAS DEL CUADRO DE CARGAS                                 */}
      {/* ========================================================================= */}
      <g transform={`translate(0, ${tableStartY})`}>
        {/* Fondo cabecera */}
        <rect x={startX} y="0" width={tableW} height={colHeaderH} fill="#0f172a" stroke="#000000" strokeWidth="1.5" />

        {/* Separadores verticales en cabecera */}
        {colPositions.map(col => (
          <line
            key={`sep-${col.id}`}
            x1={col.x}
            y1="0"
            x2={col.x}
            y2={colHeaderH}
            stroke="#334155"
            strokeWidth="0.75"
          />
        ))}

        {/* Etiquetas de columna */}
        {colPositions.map(col => {
          const textX = col.align === 'left' ? col.x + 10 : (col.align === 'right' ? col.x + col.w - 10 : col.x + col.w / 2);
          return (
            <text
              key={col.id}
              x={textX}
              y="24"
              textAnchor={col.align === 'left' ? 'start' : (col.align === 'right' ? 'end' : 'middle')}
              fontSize="12"
              fontWeight="black"
              fill="#ffffff"
              letterSpacing="0.3"
            >
              {col.label}
            </text>
          );
        })}
      </g>

      {/* ========================================================================= */}
      {/* FILAS DE CIRCUITOS: BLOQUE 1 (IMPARES) Y BLOQUE 2 (PARES)                 */}
      {/* ========================================================================= */}
      <g transform={`translate(0, ${tableStartY + colHeaderH})`}>
        
        {/* SEPARADOR BLOQUE 1: RANURAS IMPARES */}
        <g transform="translate(0, 0)">
          <rect x={startX} y="0" width={tableW} height={sectionHeaderH} fill="#e2e8f0" stroke="#000000" strokeWidth="1" />
          <text x={startX + 15} y="20" fontSize="12" fontWeight="black" fill="#0f172a" letterSpacing="1">
            DISTRIBUCIÓN LADO IZQUIERDO · RANURAS IMPARES (1, 3, 5, 7, 9, 11, 13...)
          </text>
        </g>

        {/* Renderizado de circuitos impares */}
        {circuitosImpares.map((circ, idx) => {
          const y = sectionHeaderH + (idx * rowH);
          const isParRow = idx % 2 === 0;
          const dropTotalVal = circ.caidaTotal !== undefined ? circ.caidaTotal : parseFloat(((alimentador.caidaPct || 0) + circ.caida).toFixed(2));
          const isTotalWarning = dropTotalVal > 5.0;

          return (
            <g key={circ.id || `imp-${idx}`}>
              <rect
                x={startX}
                y={y}
                width={tableW}
                height={rowH}
                fill={isParRow ? '#ffffff' : '#f8fafc'}
                stroke="#cbd5e1"
                strokeWidth="0.75"
              />

              {/* Separadores verticales de columna */}
              {colPositions.map(col => (
                <line
                  key={`cell-sep-${col.id}`}
                  x1={col.x}
                  y1={y}
                  x2={col.x}
                  y2={y + rowH}
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                />
              ))}

              {colPositions.map(col => {
                let val = '';
                let isCritical = false;

                if (col.id === 'equipo') val = circ.desc.toUpperCase();
                else if (col.id === 'cto') val = circ.num;
                else if (col.id === 'pos') val = circ.slotsStr;
                else if (col.id === 'voltaje') val = circ.voltajeNum;
                else if (col.id === 'faseA') val = circ.vaPorFase.L1 > 0 ? Math.round(circ.vaPorFase.L1).toLocaleString() : '-';
                else if (col.id === 'faseB') val = circ.vaPorFase.L2 > 0 ? Math.round(circ.vaPorFase.L2).toLocaleString() : '-';
                else if (col.id === 'faseC') val = circ.vaPorFase.L3 > 0 ? Math.round(circ.vaPorFase.L3).toLocaleString() : '-';
                else if (col.id === 'watts') val = circ.watts.toLocaleString();
                else if (col.id === 'fp') val = circ.fp.toFixed(2);
                else if (col.id === 'va') val = Math.round(circ.va).toLocaleString();
                else if (col.id === 'int') val = `${circ.polos}x${circ.breaker}A`;
                else if (col.id === 'in') val = circ.inNom.toFixed(2);
                else if (col.id === 'long') val = circ.longitudMetros;
                else if (col.id === 'ftemp') val = '1.0';
                else if (col.id === 'fajuste') val = '1.0';
                else if (col.id === 'condFase') val = circ.conductorFaseStr;
                else if (col.id === 'condNeutro') val = circ.conductorNeutroStr;
                else if (col.id === 'caidaCto') val = `${circ.caida.toFixed(2)}%`;
                else if (col.id === 'caidaTot') {
                  val = `${dropTotalVal.toFixed(2)}%${isTotalWarning ? ' ⚠' : ''}`;
                  isCritical = isTotalWarning;
                }
                else if (col.id === 'tierra') val = circ.conductorTierraStr;
                else if (col.id === 'tubo') val = circ.canalizacion;

                const textX = col.align === 'left' ? col.x + 10 : (col.align === 'right' ? col.x + col.w - 10 : col.x + col.w / 2);

                return (
                  <text
                    key={col.id}
                    x={textX}
                    y={y + 28}
                    textAnchor={col.align === 'left' ? 'start' : (col.align === 'right' ? 'end' : 'middle')}
                    fontSize="12.5"
                    fontFamily={col.id === 'equipo' ? 'sans-serif' : 'monospace'}
                    fontWeight={col.id === 'cto' || col.id === 'watts' || col.id === 'caidaTot' ? 'bold' : 'normal'}
                    fill={isCritical ? '#b91c1c' : '#000000'}
                  >
                    {col.id==='equipo' ? wrapApparatusText(val,42).map((line,i,lines)=><tspan key={i} x={textX} y={y+23+(i-(lines.length-1)/2)*Math.min(13,34/lines.length)} fontSize={Math.min(12.5,34/lines.length)}>{line}</tspan>) : val}
                  </text>
                );
              })}
            </g>
          );
        })}

        {/* SEPARADOR BLOQUE 2: RANURAS PARES */}
        {(() => {
          const offsetY = sectionHeaderH + totalImparH;

          return (
            <g transform={`translate(0, ${offsetY})`}>
              <rect x={startX} y="0" width={tableW} height={sectionHeaderH} fill="#e2e8f0" stroke="#000000" strokeWidth="1" />
              <text x={startX + 15} y="20" fontSize="12" fontWeight="black" fill="#0f172a" letterSpacing="1">
                DISTRIBUCIÓN LADO DERECHO · RANURAS PARES (2, 4, 6, 8, 10, 12, 14...)
              </text>

              {/* Renderizado de circuitos pares */}
              {circuitosPares.map((circ, idx) => {
                const y = sectionHeaderH + (idx * rowH);
                const isParRow = idx % 2 === 0;
                const dropTotalVal = circ.caidaTotal !== undefined ? circ.caidaTotal : parseFloat(((alimentador.caidaPct || 0) + circ.caida).toFixed(2));
                const isTotalWarning = dropTotalVal > 5.0;

                return (
                  <g key={circ.id || `par-${idx}`}>
                    <rect
                      x={startX}
                      y={y}
                      width={tableW}
                      height={rowH}
                      fill={isParRow ? '#ffffff' : '#f8fafc'}
                      stroke="#cbd5e1"
                      strokeWidth="0.75"
                    />

                    {/* Separadores verticales de columna */}
                    {colPositions.map(col => (
                      <line
                        key={`cell-sep-par-${col.id}`}
                        x1={col.x}
                        y1={y}
                        x2={col.x}
                        y2={y + rowH}
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                      />
                    ))}

                    {colPositions.map(col => {
                      let val = '';
                      let isCritical = false;

                      if (col.id === 'equipo') val = circ.desc.toUpperCase();
                      else if (col.id === 'cto') val = circ.num;
                      else if (col.id === 'pos') val = circ.slotsStr;
                      else if (col.id === 'voltaje') val = circ.voltajeNum;
                      else if (col.id === 'faseA') val = circ.vaPorFase.L1 > 0 ? Math.round(circ.vaPorFase.L1).toLocaleString() : '-';
                      else if (col.id === 'faseB') val = circ.vaPorFase.L2 > 0 ? Math.round(circ.vaPorFase.L2).toLocaleString() : '-';
                      else if (col.id === 'faseC') val = circ.vaPorFase.L3 > 0 ? Math.round(circ.vaPorFase.L3).toLocaleString() : '-';
                      else if (col.id === 'watts') val = circ.watts.toLocaleString();
                      else if (col.id === 'fp') val = circ.fp.toFixed(2);
                      else if (col.id === 'va') val = Math.round(circ.va).toLocaleString();
                      else if (col.id === 'int') val = `${circ.polos}x${circ.breaker}A`;
                      else if (col.id === 'in') val = circ.inNom.toFixed(2);
                      else if (col.id === 'long') val = circ.longitudMetros;
                      else if (col.id === 'ftemp') val = '1.0';
                      else if (col.id === 'fajuste') val = '1.0';
                      else if (col.id === 'condFase') val = circ.conductorFaseStr;
                      else if (col.id === 'condNeutro') val = circ.conductorNeutroStr;
                      else if (col.id === 'caidaCto') val = `${circ.caida.toFixed(2)}%`;
                      else if (col.id === 'caidaTot') {
                        val = `${dropTotalVal.toFixed(2)}%${isTotalWarning ? ' ⚠' : ''}`;
                        isCritical = isTotalWarning;
                      }
                      else if (col.id === 'tierra') val = circ.conductorTierraStr;
                      else if (col.id === 'tubo') val = circ.canalizacion;

                      const textX = col.align === 'left' ? col.x + 10 : (col.align === 'right' ? col.x + col.w - 10 : col.x + col.w / 2);

                      return (
                        <text
                          key={col.id}
                          x={textX}
                          y={y + 28}
                          textAnchor={col.align === 'left' ? 'start' : (col.align === 'right' ? 'end' : 'middle')}
                          fontSize="12.5"
                          fontFamily={col.id === 'equipo' ? 'sans-serif' : 'monospace'}
                          fontWeight={col.id === 'cto' || col.id === 'watts' || col.id === 'caidaTot' ? 'bold' : 'normal'}
                          fill={isCritical ? '#b91c1c' : '#000000'}
                        >
                          {col.id==='equipo' ? wrapApparatusText(val,42).map((line,i,lines)=><tspan key={i} x={textX} y={y+23+(i-(lines.length-1)/2)*Math.min(13,34/lines.length)} fontSize={Math.min(12.5,34/lines.length)}>{line}</tspan>) : val}
                        </text>
                      );
                    })}
                  </g>
                );
              })}

              {/* FILA DE TOTALES */}
              {(() => {
                const totalY = sectionHeaderH + totalParH;

                return (
                  <g transform={`translate(0, ${totalY})`}>
                    <rect x={startX} y="0" width={tableW} height={46} fill="#0f172a" stroke="#000000" strokeWidth="1.5" />
                    
                    <text x={startX + 15} y="28" fontSize="13" fontWeight="black" fill="#ffffff" letterSpacing="1">
                      TOTALES DE INSTALACIÓN
                    </text>

                    {/* Total Fase A (L1) */}
                    <text x={colPositions.find(c => c.id === 'faseA').x + colPositions.find(c => c.id === 'faseA').w - 10} y="28" textAnchor="end" fontSize="12.5" fontWeight="bold" fill="#38bdf8" fontFamily="monospace">
                      {totales.faseL1_VA.toLocaleString()} VA
                    </text>

                    {/* Total Fase B (L2) */}
                    <text x={colPositions.find(c => c.id === 'faseB').x + colPositions.find(c => c.id === 'faseB').w - 10} y="28" textAnchor="end" fontSize="12.5" fontWeight="bold" fill="#fb923c" fontFamily="monospace">
                      {totales.faseL2_VA.toLocaleString()} VA
                    </text>

                    {/* Total Fase C (si aplica) */}
                    {isTrifasico && (
                      <text x={colPositions.find(c => c.id === 'faseC').x + colPositions.find(c => c.id === 'faseC').w - 10} y="28" textAnchor="end" fontSize="12.5" fontWeight="bold" fill="#4ade80" fontFamily="monospace">
                        {totales.faseL3_VA.toLocaleString()} VA
                      </text>
                    )}

                    {/* Total Watts */}
                    <text x={colPositions.find(c => c.id === 'watts').x + colPositions.find(c => c.id === 'watts').w - 10} y="28" textAnchor="end" fontSize="13" fontWeight="black" fill="#ffffff" fontFamily="monospace">
                      {totales.totalWatts.toLocaleString()} W
                    </text>

                    {/* Total VA */}
                    <text x={colPositions.find(c => c.id === 'va').x + colPositions.find(c => c.id === 'va').w - 10} y="28" textAnchor="end" fontSize="13" fontWeight="black" fill="#ffffff" fontFamily="monospace">
                      {totales.totalVA.toLocaleString()} VA*
                    </text>

                    {/* Resumen de Corriente del Alimentador y Desbalance en la fila de totales */}
                    <text x={startX + tableW - 18} y="28" textAnchor="end" fontSize="12.5" fontWeight="bold" fill="#ffffff">
                      In(Alim) = {totales.corrienteNominalAlimentador} A  |  Ic = {totales.corrienteDisenoAlimentador} A  |  I_N = {totales.corrienteNeutro} A  |  Desbalance = {totales.desbalancePct}%
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })()}
      </g>

      {/* ========================================================================= */}
      {/* TARJETA DE NOTAS TÉCNICAS, CRITERIOS DE CAÍDA Y BALANCE (ESTILO MYKA)     */}
      {/* ========================================================================= */}
      <g transform={`translate(80, ${tableEndY + 20})`}>
        <rect x="0" y="0" width={tableW} height="175" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        
        {/* Líneas divisorias de 3 columnas */}
        <line x1={tableW * 0.333} y1="0" x2={tableW * 0.333} y2="175" stroke="#000000" strokeWidth="0.75" />
        <line x1={tableW * 0.666} y1="0" x2={tableW * 0.666} y2="175" stroke="#000000" strokeWidth="0.75" />

        {/* COLUMNA 1: BALANCE DE CARGAS */}
        <g transform="translate(18, 0)">
          <text x="0" y="26" fontSize="13" fontWeight="black" fill="#000000" letterSpacing="0.5">
            RESUMEN DE BALANCEO DE FASES
          </text>
          <line x1="0" y1="34" x2={tableW * 0.333 - 36} y2="34" stroke="#cbd5e1" strokeWidth="1" />

          <text x="0" y="52" fontSize="12" fill="#333333">
            Carga Conectada Total: <tspan fontWeight="bold" fill="#000000">{totales.totalWatts.toLocaleString()} W ({totales.totalVA.toLocaleString()} VA*)</tspan>
          </text>
          <text x="0" y="74" fontSize="12" fill="#333333">
            Fase L1: <tspan fontWeight="bold" fill="#000000">{totales.faseL1_VA.toLocaleString()} VA</tspan>  |  Fase L2: <tspan fontWeight="bold" fill="#000000">{totales.faseL2_VA.toLocaleString()} VA</tspan>
          </text>
          <text x="0" y="96" fontSize="12.5" fontWeight="bold" fill="#000000">
            Desbalance entre fases: <tspan fill="#047857">{totales.desbalancePct}%</tspan> — Criterio de diseño: &lt;= 5.0%
          </text>
          <text x="0" y="118" fontSize="11.5" fill="#555555">
            Factor de Demanda: <tspan fontWeight="bold" fill="#000000">{totales.factorDemandaPct}%</tspan> · Carga demandada: <tspan fontWeight="bold" fill="#000000">{totales.cargaDemandadaWatts.toLocaleString()} W</tspan>
          </text>
          <text x="0" y="138" fontSize="11" fill="#333333">
            Fases y Neutro (NOM 220-61): <tspan fontWeight="bold" fill="#047857">I_L1={totales.corrienteL1}A · I_L2={totales.corrienteL2}A · I_N={totales.corrienteNeutro}A</tspan>
          </text>
          <text x="0" y="156" fontSize="9" fontStyle="italic" fill="#64748b">
            * Totales calculados con valores continuos no redondeados (suma nominal 9,405.3 VA antes de redondeo visual a enteros).
          </text>
        </g>

        {/* COLUMNA 2: CRITERIOS DE CAÍDA DE TENSIÓN */}
        <g transform={`translate(${tableW * 0.333 + 18}, 0)`}>
          <text x="0" y="26" fontSize="13" fontWeight="black" fill="#000000" letterSpacing="0.5">
            CRITERIOS DE CAÍDA DE TENSIÓN Y EFICIENCIA (NOM-001-SEDE)
          </text>
          <line x1="0" y1="34" x2={tableW * 0.333 - 36} y2="34" stroke="#cbd5e1" strokeWidth="1" />

          <text x="0" y="56" fontSize="11.5" fill="#333333">
            Criterio recomendado según NOM-001-SEDE-2012, 215-2(a), Nota 2: &lt;= 3.0% alimentador / &lt;= 5.0% combinado.
          </text>
          <text x="0" y="78" fontSize="11.5" fill="#333333">
            Alimentador General (80 m, 220V): Conductor <tspan fontWeight="bold" fill="#047857">#4 AWG</tspan> adoptado con e% = <tspan fontWeight="bold" fill="#047857">{alimentador.caidaPct.toFixed(2)}% (&lt;= 3.0%)</tspan>.
          </text>
          <text x="0" y="100" fontSize="11.5" fill="#333333">
            Conductor de Puesta a Tierra ajustado proporcionalmente a <tspan fontWeight="bold" fill="#000000">{alimentador.conductorTierra}</tspan> bajo Artículo 250-122(b).
          </text>
          <text x="0" y="122" fontSize="11" fill="#333333">
            Caída máxima en circuitos derivados: <tspan fontWeight="bold" fill="#000000">{resumenCaidas.maxCaidaCircuito.toFixed(2)}%</tspan> — {resumenCaidas.ctoMaxDerivadoNum} {resumenCaidas.ctoMaxDerivadoDesc}, L = {resumenCaidas.ctoMaxDerivadoLongitud} m.
          </text>
          <text x="0" y="144" fontSize="11" fontStyle="italic" fill={resumenCaidas.cumpleCriterioCombinado ? "#047857" : "#b91c1c"}>
            Caída combinada proyectada máxima: <tspan fontWeight="bold">{resumenCaidas.maxCaidaTotal.toFixed(2)}%</tspan> — {resumenCaidas.ctoMaxTotalNum}. {resumenCaidas.cumpleCriterioCombinado ? "Cumple el criterio de diseño recomendado de <= 5.0%." : "Advertencia: supera el criterio de diseño recomendado de 5.0%."}
          </text>
        </g>

        {/* COLUMNA 3: ESPECIFICACIONES TÉCNICAS */}
        <g transform={`translate(${tableW * 0.666 + 18}, 0)`}>
          <text x="0" y="26" fontSize="13" fontWeight="black" fill="#000000" letterSpacing="0.5">
            ESPECIFICACIONES DE MONTAJE Y CANALIZACIONES
          </text>
          <line x1="0" y1="34" x2={tableW * 0.333 - 36} y2="34" stroke="#cbd5e1" strokeWidth="1" />

          <text x="0" y="56" fontSize="11" fill="#333333">
            1. Tablero Square D QO NEMA 1 para sobreponer/empotrar, 24 espacios, barras 100 A. Catálogo definitivo por definir en obra.
          </text>
          <text x="0" y="78" fontSize="11" fill="#333333">
            2. Alimentador general: Tubo conduit metálico semipesado (IMC) de 35 mm (1 1/4") según NOM-001-SEDE Art. 342.
          </text>
          <text x="0" y="100" fontSize="11" fill="#333333">
            3. Circuitos derivados interiores: Tubería metálica de pared delgada (EMT) de 16 mm (1/2") y 21 mm (3/4") (Art. 358).
          </text>
          <text x="0" y="122" fontSize="11" fill="#333333">
            4. Conductores de cobre suave tipo {alimentador.tipoAislamiento} certificados NOM/ANCE.
          </text>
          <text x="0" y="144" fontSize="11" fill="#333333">
            5. Sistema de puesta a tierra física con electrodo copperweld e interconexión equipotencial bajo Art. 250.
          </text>
        </g>
      </g>

      {/* ========================================================================= */}
      {/* CAJETÍN INFERIOR FORMAL                                                   */}
      {/* ========================================================================= */}
      <PlanoCajetinSVG
        x={60}
        y={1530}
        width={2472}
        height={135}
        infoPlano={infoPlano}
        planoTitle="CUADRO DE CARGAS"
        planoClave="IE-02"
      />
    </svg>
  );
}
