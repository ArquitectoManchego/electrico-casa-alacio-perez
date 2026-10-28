import React from 'react';

/**
 * PlanoCajetinSVG.jsx
 * Cajetín técnico profesional para planos eléctricos CAD (Láminas 1 y 2).
 * Formato vectorial puro inspirado en el plano de referencia MYKA ARTZ.
 */
export default function PlanoCajetinSVG({
  x = 60,
  y = 1530,
  width = 2472,
  height = 140,
  infoPlano = {},
  planoTitle = "DIAGRAMA UNIFILAR",
  planoClave = "IE-01"
}) {
  const col1W = width * 0.22; // Proyecto / Cliente
  const col2W = width * 0.23; // Etapa / Ubicación / Local
  const col3W = width * 0.10; // Escala / Fecha
  const col4W = width * 0.10; // Cotas / Lámina
  const col5W = width * 0.08; // Norte
  const col6W = width * 0.15; // Responsable / Cédula
  const col7W = width - (col1W + col2W + col3W + col4W + col5W + col6W); // Logo

  const c1 = x;
  const c2 = c1 + col1W;
  const c3 = c2 + col2W;
  const c4 = c3 + col3W;
  const c5 = c4 + col4W;
  const c6 = c5 + col5W;
  const c7 = c6 + col6W;

  return (
    <g transform={`translate(${x}, ${y})`} className="cad-cajetin" fontFamily="'Segoe UI', Arial, sans-serif">
      {/* Marco perimetral del cajetín */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* Divisiones verticales principales */}
      <line x1={col1W} y1="0" x2={col1W} y2={height} stroke="#000000" strokeWidth="1" />
      <line x1={col1W + col2W} y1="0" x2={col1W + col2W} y2={height} stroke="#000000" strokeWidth="1" />
      <line x1={col1W + col2W + col3W} y1="0" x2={col1W + col2W + col3W} y2={height} stroke="#000000" strokeWidth="1" />
      <line x1={col1W + col2W + col3W + col4W} y1="0" x2={col1W + col2W + col3W + col4W} y2={height} stroke="#000000" strokeWidth="1" />
      <line x1={col1W + col2W + col3W + col4W + col5W} y1="0" x2={col1W + col2W + col3W + col4W + col5W} y2={height} stroke="#000000" strokeWidth="1" />
      <line x1={col1W + col2W + col3W + col4W + col5W + col6W} y1="0" x2={col1W + col2W + col3W + col4W + col5W + col6W} y2={height} stroke="#000000" strokeWidth="1" />

      {/* COLUMNA 1: PROYECTO Y CLIENTE */}
      <g transform="translate(15, 0)">
        <line x1="-15" y1={height / 2} x2={col1W - 15} y2={height / 2} stroke="#cccccc" strokeWidth="0.75" />
        
        {/* Fila 1: Proyecto */}
        <text x="0" y="22" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">PROYECTO:</text>
        <text x="0" y="42" fontSize="14" fontWeight="bold" fill="#000000">
          {(infoPlano.proyecto || 'HAWAIIAN PARADISE').toUpperCase()}
        </text>
        <text x="0" y="58" fontSize="10" fill="#333333">
          {infoPlano.nombreComercial || ''}
        </text>

        {/* Fila 2: Cliente */}
        <text x="0" y="88" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">CLIENTE / PROPIETARIO:</text>
        <text x="0" y="110" fontSize="12" fontWeight="bold" fill="#000000">
          {(infoPlano.cliente || 'OPERADORA DE ALIMENTOS').toUpperCase()}
        </text>
      </g>

      {/* COLUMNA 2: ETAPA Y UBICACIÓN / PLAZA / LOCAL */}
      <g transform={`translate(${col1W + 15}, 0)`}>
        <line x1="-15" y1={height / 2} x2={col2W - 15} y2={height / 2} stroke="#cccccc" strokeWidth="0.75" />
        
        {/* Fila 1: Etapa */}
        <text x="0" y="22" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">ETAPA:</text>
        <text x="0" y="44" fontSize="13" fontWeight="bold" fill="#000000">
          {(infoPlano.etapa || 'PROYECTO EJECUTIVO').toUpperCase()}
        </text>

        {/* Fila 2: Ubicación / Plaza / Local */}
        <text x="0" y="88" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">PLAZA Y LOCAL:</text>
        <text x="0" y="108" fontSize="12" fontWeight="bold" fill="#000000">
          {(infoPlano.plaza || 'PLAZA ANDAMAR').toUpperCase()} - {(infoPlano.local || 'LOCAL COMERCIAL K-12').toUpperCase()}
        </text>
        <text x="0" y="126" fontSize="9" fill="#555555">
          {(() => {
            const rawUb = infoPlano.ubicacion || '';
            if (!rawUb || rawUb.toLowerCase().includes('américas') || rawUb.toLowerCase().includes('americas')) {
              return 'Blvd. Adolfo Ruiz Cortines 4300, Mocambo, 94298 Boca del Río, Ver.';
            }
            return rawUb;
          })()}
        </text>
      </g>

      {/* COLUMNA 3: ESCALA Y FECHA */}
      <g transform={`translate(${col1W + col2W + 15}, 0)`}>
        <line x1="-15" y1={height / 2} x2={col3W - 15} y2={height / 2} stroke="#cccccc" strokeWidth="0.75" />
        
        <text x="0" y="24" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">ESCALA:</text>
        <text x="0" y="48" fontSize="14" fontWeight="bold" fill="#000000">{infoPlano.escala || 'S/E'}</text>

        <text x="0" y="90" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">FECHA:</text>
        <text x="0" y="112" fontSize="11" fontWeight="bold" fill="#000000">{infoPlano.fecha || ''}</text>
      </g>

      {/* COLUMNA 4: COTAS Y TIPO DE PLANO */}
      <g transform={`translate(${col1W + col2W + col3W + 15}, 0)`}>
        <line x1="-15" y1={height / 2} x2={col4W - 15} y2={height / 2} stroke="#cccccc" strokeWidth="0.75" />
        
        <text x="0" y="24" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">COTAS:</text>
        <text x="0" y="48" fontSize="13" fontWeight="bold" fill="#000000">{infoPlano.cotas || 'METROS'}</text>

        <text x="0" y="90" fontSize="9" fontWeight="bold" fill="#666666" letterSpacing="1">TIPO DE PLANO:</text>
        <text x="0" y="114" fontSize="11" fontWeight="bold" fill="#000000">{infoPlano.tipoPlano || 'INST. ELÉCTRICA'}</text>
      </g>

      {/* COLUMNA 5: NORTE TÉCNICO / ROSA DE LOS VIENTOS ROTADA */}
      <g transform={`translate(${col1W + col2W + col3W + col4W + col5W / 2}, ${height / 2})`}>
        {/* Esfera y dial del Norte */}
        <circle cx="0" cy="0" r="32" fill="#fafafa" stroke="#000000" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="36" fill="none" stroke="#666666" strokeWidth="0.5" strokeDasharray="1,2" />
        
        {/* Rosa de los vientos girada por norteAngulo */}
        <g transform={`rotate(${infoPlano.norteAngulo || 0})`}>
          {/* Ejes finos */}
          <line x1="0" y1="-30" x2="0" y2="30" stroke="#888888" strokeWidth="0.75" />
          <line x1="-30" y1="0" x2="30" y2="0" stroke="#888888" strokeWidth="0.75" />
          
          {/* Aguja Norte (negra con relieve blanco) */}
          <polygon points="0,-30 -7,-4 0,0" fill="#000000" />
          <polygon points="0,-30 7,-4 0,0" fill="#ffffff" stroke="#000000" strokeWidth="0.75" />
          
          {/* Aguja Sur (contraluz) */}
          <polygon points="0,30 7,4 0,0" fill="#444444" />
          <polygon points="0,30 -7,4 0,0" fill="#ffffff" stroke="#000000" strokeWidth="0.75" />
          
          {/* Agujas Este y Oeste */}
          <polygon points="30,0 4,-5 0,0" fill="#777777" />
          <polygon points="30,0 4,5 0,0" fill="#ffffff" stroke="#000000" strokeWidth="0.5" />
          <polygon points="-30,0 -4,5 0,0" fill="#777777" />
          <polygon points="-30,0 -4,-5 0,0" fill="#ffffff" stroke="#000000" strokeWidth="0.5" />
          
          {/* Letra N girando con la aguja */}
          <circle cx="0" cy="-21" r="5" fill="#ffffff" stroke="#000000" strokeWidth="0.5" />
          <text x="0" y="-18" textAnchor="middle" fontSize="7" fontWeight="900" fill="#000000" fontFamily="monospace">N</text>
        </g>
        
        <circle cx="0" cy="0" r="2.5" fill="#000000" />
        <text x="0" y="48" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#666666" letterSpacing="0.5">
          NORTE {infoPlano.norteAngulo ? `${infoPlano.norteAngulo}°` : '0°'}
        </text>
      </g>

      {/* COLUMNA 6: PROYECTÓ, REVISÓ Y RESPONSABLE / CÉDULA */}
      <g transform={`translate(${col1W + col2W + col3W + col4W + col5W + 15}, 0)`}>
        <line x1="-15" y1="42" x2={col6W - 15} y2="42" stroke="#cccccc" strokeWidth="0.5" />
        <line x1="-15" y1="84" x2={col6W - 15} y2="84" stroke="#cccccc" strokeWidth="0.5" />

        <text x="0" y="18" fontSize="8" fontWeight="bold" fill="#666666" letterSpacing="1">PROYECTÓ:</text>
        <text x="0" y="34" fontSize="10" fontWeight="bold" fill="#000000">{infoPlano.dibujo || 'DEPTO. DE INGENIERÍA'}</text>

        <text x="0" y="60" fontSize="8" fontWeight="bold" fill="#666666" letterSpacing="1">REVISÓ:</text>
        <text x="0" y="76" fontSize="10" fontWeight="bold" fill="#000000">{infoPlano.reviso || 'ING. PROYECTISTA'}</text>

        {(() => {
          const r = infoPlano.responsable || '';
          const isDemoResp = !r || r.toLowerCase().includes('juan p') || r.toLowerCase().includes('uvie-1234');
          const respText = isDemoResp ? "____________________" : r;
          
          const c = infoPlano.cedula || '';
          const isDemoCed = !c || c.includes('12345678');
          const cedText = isDemoCed ? "CÉDULA: ____________________" : (c.toUpperCase().includes('CÉD') ? c : `CÉDULA: ${c}`);

          return (
            <>
              <text x="0" y="102" fontSize="8" fontWeight="bold" fill="#666666" letterSpacing="1">RESPONSABLE TÉCNICO:</text>
              <text x="0" y="117" fontSize="10" fontWeight="bold" fill="#000000">{respText}</text>
              <text x="0" y="130" fontSize="8" fill="#555555">{cedText}</text>
            </>
          );
        })()}
      </g>

      {/* COLUMNA 7: TÍTULO DEL PLANO, CLAVE Y REVISIÓN */}
      <g transform={`translate(${col1W + col2W + col3W + col4W + col5W + col6W}, 0)`}>
        <text x={col7W / 2} y="28" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#000000" letterSpacing="0.5">
          {planoTitle}
        </text>

        <text x={col7W / 2} y="88" textAnchor="middle" fontSize="34" fontWeight="900" fill="#000000" letterSpacing="1">
          {planoClave}
        </text>

        <line x1="20" y1="102" x2={col7W - 20} y2="102" stroke="#cccccc" strokeWidth="0.75" />

        <text x={col7W / 2} y="122" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444444" letterSpacing="1">
          {infoPlano.revision || 'REV. 0'}
        </text>
      </g>
    </g>
  );
}
