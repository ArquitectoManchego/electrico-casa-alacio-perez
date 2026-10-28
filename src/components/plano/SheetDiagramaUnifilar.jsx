import React from 'react';
import { wrapApparatusText } from '../../utils/gabineteModel.js';
import UnifilarSupply, { BreakerSymbol } from './UnifilarSupply.jsx';
import PlanoCajetinSVG from './PlanoCajetinSVG';

/**
 * SheetDiagramaUnifilar.jsx
 * Renderiza la Lámina 1: DIAGRAMA UNIFILAR en formato vectorial CAD puro.
 * Dimensiones estándar: 2592 x 1728 pt (Arch D 36" x 24" / 90x60 cm).
 */
export default function SheetDiagramaUnifilar({ model, id = "sheet-unifilar-svg" }) {
  const {
    alimentador,
    circuitos,
    totales,
    infoPlano
  } = model;

  const width = 2592;
  const height = 1728;

  // Coordenadas del tablero central
  const busX = 1100;
  const busStartY = 270;
  const busEndY = 1480;

  // Calculamos la distribución vertical de circuitos
  // Si hay circuitos impares y pares, distribuimos de manera uniforme
  const totalCircs = circuitos.length;
  const rowHeight = Math.min(78, Math.max(50, 1100 / Math.max(12, totalCircs)));

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
      <defs>
        {/* Marcador de flecha para llamadas técnicas */}
        <marker
          id="cad-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#000000" />
        </marker>
      </defs>

      {/* MARCO PERIMETRAL EXTERIOR E INTERIOR (DOBLE LÍNEA CAD) */}
      <rect x="40" y="40" width="2512" height="1648" fill="none" stroke="#000000" strokeWidth="3" />
      <rect x="52" y="52" width="2488" height="1624" fill="none" stroke="#000000" strokeWidth="1" />

      {/* TÍTULO DE LA LÁMINA */}
      <g transform="translate(80, 110)">
        <text fontSize="38" fontWeight="900" fontStyle="italic" fill="#000000" letterSpacing="0.5">
          Diagrama Unifilar.
        </text>
        <text x="360" y="-4" fontSize="13" fontWeight="bold" fill="#555555" letterSpacing="2">
          SISTEMA ELÉCTRICO DE DISTRIBUCIÓN COMERCIAL · NOM-001-SEDE-2012
        </text>
        <line x1="0" y1="14" x2="600" y2="14" stroke="#000000" strokeWidth="1.5" />
      </g>

      {/* ========================================================================= */}
      {/* SECCIÓN IZQUIERDA: ACOMETIDA, MEDIDOR, ITM GENERAL Y ALIMENTADOR         */}
      {/* ========================================================================= */}
      <UnifilarSupply model={model}/>
      <g transform="translate(80, 220)">
        {/* Cuadro de simbología del diagrama */}
        <g transform="translate(40, 600)">
          <rect x="0" y="0" width="380" height="310" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <rect x="0" y="0" width="380" height="28" fill="#f1f5f9" stroke="#000000" strokeWidth="1" />
          <text x="190" y="19" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000000" letterSpacing="1">
            SIMBOLOGÍA DEL DIAGRAMA
          </text>

          {/* 1. Conductor */}
          <line x1="20" y1="45" x2="60" y2="45" stroke="#000000" strokeWidth="2" />
          <text x="80" y="49" fontSize="10" fill="#222222">Línea de conducción / Circuito derivado</text>

          {/* 2. Salida de Alumbrado LED */}
          <circle cx="40" cy="74" r="10" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <line x1="33" y1="67" x2="47" y2="81" stroke="#000000" strokeWidth="1.5" />
          <line x1="33" y1="81" x2="47" y2="67" stroke="#000000" strokeWidth="1.5" />
          <text x="80" y="78" fontSize="10" fill="#222222">Salida de alumbrado / Luminaria LED</text>

          {/* 3. Salida de Contactos / Fuerza */}
          <circle cx="40" cy="103" r="10" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <line x1="33" y1="96" x2="47" y2="110" stroke="#000000" strokeWidth="1.5" />
          <text x="80" y="107" fontSize="10" fill="#222222">Salida de contactos / Receptáculo de fuerza</text>

          {/* 4. Carga Térmica / Resistencia */}
          <rect x="28" y="122" width="24" height="20" fill="#ffffff" stroke="#000000" strokeWidth="1.5" rx="2" />
          <path d="M 31,132 L 34,127 L 38,137 L 42,127 L 46,137 L 49,132" fill="none" stroke="#000000" strokeWidth="1.5" />
          <text x="80" y="136" fontSize="10" fill="#222222">Carga térmica / Resistencia de calor</text>

          {/* 5. Motor / Compresor */}
          <rect x="28" y="151" width="24" height="20" fill="#ffffff" stroke="#000000" strokeWidth="1.5" rx="2" />
          <text x="40" y="166" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000000">M</text>
          <text x="80" y="165" fontSize="10" fill="#222222">Motor eléctrico / Compresor de refrigeración</text>

          {/* 6. Interruptor Termomagnético Monopolar */}
          <BreakerSymbol x={40} y={190} radius={12}/>
          <line x1="22" y1="190" x2="28" y2="190" stroke="#000000" strokeWidth="1.5" />
          <line x1="52" y1="190" x2="58" y2="190" stroke="#000000" strokeWidth="1.5" />
          <text x="80" y="194" fontSize="10" fill="#222222">Interruptor Termomagnético (ITM 1P)</text>

          {/* 7. Interruptor Bipolar */}
          <BreakerSymbol x={40} y={219} radius={12}/>
          <text x="80" y="223" fontSize="10" fill="#222222">Interruptor bipolar (2P 220V — disparo común)</text>

          {/* 8. Medidor */}
          <circle cx="40" cy="248" r="12" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <text x="40" y="252" textAnchor="middle" fontSize="10" fontWeight="bold">Wh</text>
          <text x="80" y="252" fontSize="10" fill="#222222">Equipo de medición CFE (Medidor Wh)</text>

          {/* 9. Tierra Física */}
          <g transform="translate(40, 275)">
            <line x1="0" y1="-5" x2="0" y2="2" stroke="#000000" strokeWidth="1.5" />
            <line x1="-10" y1="2" x2="10" y2="2" stroke="#000000" strokeWidth="2" />
            <line x1="-6" y1="6" x2="6" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="-2" y1="10" x2="2" y2="10" stroke="#000000" strokeWidth="1.5" />
          </g>
          <text x="80" y="281" fontSize="10" fill="#222222">Electrodo de puesta a tierra (Tierra física Art. 250)</text>
        </g>
      </g>

      {/* ========================================================================= */}
      {/* SECCIÓN CENTRAL: CENTRO DE CARGA / BARRAS VERTICALES Y SLOTS             */}
      {/* ========================================================================= */}
      <g transform={`translate(${busX}, 0)`}>
        
        {/* Cabecera del Centro de Carga */}
        <text x="0" y="220" textAnchor="middle" fontSize="22" fontWeight="900" fill="#000000" letterSpacing="1">
          TABLERO T-1
        </text>
        <text x="0" y="240" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">
          {alimentador.tipoTableroDesc || 'TABLERO SQUARE D QO — 24 ESPACIOS — 100 A — 2F-3H'} · CATÁLOGO: {alimentador.catalogoTablero || 'POR DEFINIR'}
        </text>

        {/* BARRAS COLECTORAS VERTICALES (L1, L2, L3) */}
        {/* Barra L1 */}
        <line x1="-12" y1={busStartY} x2="-12" y2={busEndY} stroke="#000000" strokeWidth="4" strokeLinecap="round" />
        <text x="-12" y={busStartY - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000000">L1</text>
        
        {/* Barra L2 */}
        <line x1="12" y1={busStartY} x2="12" y2={busEndY} stroke="#000000" strokeWidth="4" strokeLinecap="round" />
        <text x="12" y={busStartY - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000000">L2</text>

        {/* Barra L3 (si es trifásico) */}
        {alimentador.polos > 2 && (
          <>
            <line x1="36" y1={busStartY} x2="36" y2={busEndY} stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            <text x="36" y={busStartY - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000000">L3</text>
          </>
        )}

        {/* Barra de Neutro (N) */}
        <line x1="-36" y1={busStartY} x2="-36" y2={busEndY} stroke="#666666" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" />
        <text x="-36" y={busStartY - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#666666">N</text>

        {/* Barra de Tierra (T) */}
        <line x1="-54" y1={busStartY} x2="-54" y2={busEndY} stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
        <text x="-54" y={busStartY - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#22c55e">T</text>
        {/* Símbolo de tierra al final de la barra */}
        <g transform={`translate(-54, ${busEndY + 12})`}>
          <line x1="0" y1="-8" x2="0" y2="0" stroke="#22c55e" strokeWidth="2" />
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#22c55e" strokeWidth="2" />
          <line x1="-5" y1="4" x2="5" y2="4" stroke="#22c55e" strokeWidth="1.5" />
          <line x1="-2" y1="8" x2="2" y2="8" stroke="#22c55e" strokeWidth="1" />
        </g>

        {/* Conexión del alimentador general entrando al tope de las barras */}

        <circle cx="-12" cy={busStartY} r="4" fill="#000000" />
        <circle cx="12" cy={busStartY} r="4" fill="#000000" />
        {alimentador.polos > 2 && <circle cx="36" cy={busStartY} r="4" fill="#000000" />}
      </g>

      {/* ========================================================================= */}
      {/* SECCIÓN DERECHA: CIRCUITOS DERIVADOS Y RECEPTORES                        */}
      {/* ========================================================================= */}
      <g transform="translate(0, 0)">
        {circuitos.map((circ, idx) => {
          const y = busStartY + 25 + (idx * rowHeight);
          const isBipolar = circ.polos === 2;

          // Determinamos el origen del tap según la fase (L1 o L2)
          const isL1 = circ.fase.includes('A') || circ.vaPorFase.L1 > 0;
          const tapX = isBipolar ? busX : (isL1 ? busX - 12 : busX + 12);

          return (
            <g key={circ.id || idx} transform={`translate(0, ${y})`}>
              
              {/* Tap en la barra colectora */}
              {isBipolar ? (
                // Bipolar: toca L1 y L2 simultáneamente
                <g>
                  <circle cx={busX - 12} cy="0" r="3.5" fill="#000000" />
                  <circle cx={busX + 12} cy="0" r="3.5" fill="#000000" />
                  <line x1={busX - 12} y1="0" x2={busX + 45} y2="0" stroke="#000000" strokeWidth="2" />
                </g>
              ) : (
                // Monopolar: toca una sola barra
                <g>
                  <circle cx={tapX} cy="0" r="3.5" fill="#000000" />
                  <line x1={tapX} y1="0" x2={busX + 45} y2="0" stroke="#000000" strokeWidth="2" />
                </g>
              )}

              {/* Indicador de posición/slot del tablero (ej. "1", "3", "9,11") */}
              <text
                x={busX - 25}
                y="4"
                textAnchor="end"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                fill="#333333"
              >
                {circ.slotsStr || (idx + 1)}
              </text>

              {/* Interruptor Termomagnético (Breaker) */}
              <g transform={`translate(${busX + 45}, 0)`}>
                <line x1="0" y1="0" x2="10" y2="0" stroke="black" strokeWidth="1.5"/>
                <BreakerSymbol x={24} radius={14}/>
                <line x1="38" y1="0" x2="50" y2="0" stroke="black" strokeWidth="1.5"/>

                {/* Etiqueta del Breaker: 1P-15 A, 2P-20 A */}
                <text x="24" y="-22" textAnchor="middle" fontSize="10.5" fontWeight="black" fill="#000000">
                  {circ.breakerStr}
                </text>
              </g>

              {/* Línea horizontal del circuito hacia la carga */}
              <line
                x1={busX + 95}
                y1="0"
                x2="2100"
                y2="0"
                stroke="#000000"
                strokeWidth={isBipolar ? 2.5 : 1.75}
              />

              {/* Especificaciones de Conductor, Canalización, Corriente y Caída */}
              <g transform={`translate(${busX + 110}, 0)`}>
                {/* Renglón 1: Identificación y Calibre */}
                <text x="0" y="-8" fontSize="11" fontWeight="bold" fill="#000000">
                  {circ.num} · {circ.conductorCompletoStr}
                </text>
                {/* Renglón 2: Longitud, Corriente Nominal y Caída de Tensión */}
                <text x="0" y="12" fontSize="9.5" fill="#333333">
                  {circ.canalizacion} · L={circ.longitudMetros} m · In={circ.inNom.toFixed(2)} A · e%={circ.caida.toFixed(2)}%
                </text>
              </g>

              {/* Símbolo de Carga Eléctrica Final (Receptor según NOM-001-SEDE) */}
              <g transform="translate(2100, 0)">
                {circ.tipoSimbologia === 'motor' ? (
                  // Motor / Compresor / Clima ('M' en recuadro)
                  <g>
                    <rect x="0" y="-14" width="28" height="28" fill="#ffffff" stroke="#000000" strokeWidth="2" rx="3" />
                    <text x="14" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000000">M</text>
                  </g>
                ) : circ.tipoSimbologia === 'alumbrado' ? (
                  // Salida de Alumbrado LED (Círculo con aspa en X)
                  <g>
                    <circle cx="14" cy="0" r="14" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    <line x1="4" y1="-10" x2="24" y2="10" stroke="#000000" strokeWidth="1.5" />
                    <line x1="4" y1="10" x2="24" y2="-10" stroke="#000000" strokeWidth="1.5" />
                  </g>
                ) : circ.tipoSimbologia === 'termico' ? (
                  // Carga Térmica / Resistencia de calor (Recuadro con resistencia zig-zag)
                  <g>
                    <rect x="0" y="-14" width="28" height="28" fill="#ffffff" stroke="#000000" strokeWidth="2" rx="3" />
                    <path d="M 4,0 L 8,-6 L 14,6 L 20,-6 L 24,0" fill="none" stroke="#000000" strokeWidth="2" />
                  </g>
                ) : (
                  // Salida de Contactos / Fuerza (Círculo con diagonal)
                  <g>
                    <circle cx="14" cy="0" r="14" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    <line x1="4" y1="-10" x2="24" y2="10" stroke="#000000" strokeWidth="1.5" />
                  </g>
                )}

                {/* Descripción del aparato receptor */}
                <text x="40" y="-4" fontSize="11" fontWeight="bold" fill="#000000">
                  {wrapApparatusText(circ.desc.toUpperCase(), 48).map((line,i,lines)=><tspan key={i} x="40" y={-4-(lines.length-1-i)*13}>{line}</tspan>)}
                </text>
                <text x="40" y="12" fontSize="10" fill="#444444">
                  {circ.voltajeStr} · {circ.watts} W ({Math.round(circ.va)} VA)
                </text>
              </g>
            </g>
          );
        })}

        {/* Resumen al pie del diagrama */}
        <text
          x="2480"
          y={busEndY + 20}
          textAnchor="end"
          fontSize="13"
          fontWeight="bold"
          fill="#000000"
        >
          POTENCIA INSTALADA EN TABLERO T-1: {totales.totalWatts.toLocaleString()} W ({totales.totalVA.toLocaleString()} VA)
        </text>
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
        planoTitle="DIAGRAMA UNIFILAR"
        planoClave="IE-01"
      />
    </svg>
  );
}
