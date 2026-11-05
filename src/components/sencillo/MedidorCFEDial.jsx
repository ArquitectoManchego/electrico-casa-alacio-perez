import React from 'react';

/**
 * Componente MedidorCFEDial:
 * Carátula interactiva y visual estilo videojuego/simulador de un Medidor de Luz CFE.
 * Muestra el consumo del mes en kWh con dial semicircular, aguja, odómetro y semáforo.
 */

export default function MedidorCFEDial({
  kwh = 350,
  maxKwh = 1200,
  medidorId = 'MED_1',
  empresaNombre = 'Imperia Uniformes',
  className = "w-full max-w-sm"
}) {
  const kwhNum = Math.max(0, parseFloat(kwh) || 0);
  const maxScale = Math.max(kwhNum * 1.25, maxKwh || 1000);

  // Ángulo de la aguja: de -120° (0 kWh) a +120° (maxScale)
  const pct = Math.min(1, kwhNum / maxScale);
  const anguloAguja = -120 + pct * 240;

  // Semáforo según consumo
  let estadoSemaforo = {
    color: 'emerald',
    texto: 'Consumo Eficiente',
    bgBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    descripcion: 'Dentro del escalón de tarifa de bajo costo'
  };

  if (kwhNum > 600) {
    estadoSemaforo = {
      color: 'rose',
      texto: 'Escalón Excedente',
      bgBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      descripcion: 'Consumo fuerte; CFE cobra cada kWh adicional más caro'
    };
  } else if (kwhNum > 300) {
    estadoSemaforo = {
      color: 'amber',
      texto: 'Consumo Intermedio',
      bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      descripcion: 'Operación moderada normal de negocio'
    };
  }

  // Odómetro con 5 dígitos enteros + 1 decimal rojo
  const kwhFormateado = kwhNum.toFixed(1).padStart(7, '0');
  const enteros = kwhFormateado.slice(0, 5);
  const decimal = kwhFormateado.slice(6, 7);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden ${className}`}>
      {/* Resplandor ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera del Medidor */}
      <div className="flex items-center justify-between w-full mb-3 text-xs">
        <span className="font-mono text-slate-400 font-bold uppercase">{medidorId}</span>
        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${estadoSemaforo.bgBadge}`}>
          {estadoSemaforo.texto}
        </span>
      </div>

      {/* CARÁTULA CIRCULAR DEL MEDIDOR CFE (SVG) */}
      <div className="relative w-64 h-64 my-1">
        <svg viewBox="0 0 260 260" className="w-full h-full drop-shadow-2xl">
          <defs>
            {/* Bisel Cromado Exterior */}
            <linearGradient id="bezelGrad" x1="0" y1="0" x2="260" y2="260" gradientUnits="userSpaceOnUse">
              <stop stopColor="#64748B" />
              <stop offset="0.2" stopColor="#F8FAFC" />
              <stop offset="0.5" stopColor="#334155" />
              <stop offset="0.8" stopColor="#94A3B8" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>

            {/* Fondo de Carátula */}
            <radialGradient id="dialFace" cx="130" cy="130" r="115" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="0.85" stopColor="#0F172A" />
              <stop offset="1" stopColor="#020617" />
            </radialGradient>

            {/* Arco de Color (Verde - Amarillo - Rojo) */}
            <linearGradient id="meterArc" x1="40" y1="200" x2="220" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="0.9" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Anillo Exterior Bisel Metálico */}
          <circle cx="130" cy="130" r="126" fill="url(#bezelGrad)" />
          <circle cx="130" cy="130" r="118" fill="#090D16" />
          <circle cx="130" cy="130" r="114" fill="url(#dialFace)" />

          {/* Arco Guía de Consumo con Semáforo */}
          <path
            d="M 50 195 A 95 95 0 1 1 210 195"
            fill="none"
            stroke="#1E293B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 50 195 A 95 95 0 1 1 210 195"
            fill="none"
            stroke="url(#meterArc)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="440"
            strokeDashoffset={440 - (pct * 440)}
            className="transition-all duration-1000 ease-out"
          />

          {/* Marcas de Escala (Ticks) */}
          {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((deg, idx) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const x1 = 130 + 82 * Math.cos(rad);
            const y1 = 130 + 82 * Math.sin(rad);
            const x2 = 130 + 94 * Math.cos(rad);
            const y2 = 130 + 94 * Math.sin(rad);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={deg > 30 ? '#EF4444' : deg > -30 ? '#F59E0B' : '#10B981'}
                strokeWidth={deg % 60 === 0 ? "3" : "1.5"}
              />
            );
          })}

          {/* Logotipo CFE */}
          <g transform="translate(130, 78)">
            <rect x="-24" y="-12" width="48" height="20" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1" />
            <text x="0" y="2" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              CFE
            </text>
          </g>

          <text x="130" y="104" fill="#64748B" fontSize="8" fontWeight="800" textAnchor="middle" letterSpacing="1.5">
            WATTHORÍMETRO DIGITAL
          </text>

          {/* Odómetro / Contador de Rodillos */}
          <g transform="translate(130, 175)">
            <rect x="-56" y="-14" width="112" height="24" rx="4" fill="#000000" stroke="#475569" strokeWidth="1.5" />
            {/* Dígitos enteros (negro/blanco) */}
            <text x="-48" y="3" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="monospace" letterSpacing="3">
              {enteros}
            </text>
            {/* Dígito decimal (rojo) */}
            <rect x="36" y="-12" width="16" height="20" fill="#DC2626" rx="2" />
            <text x="44" y="3" fill="#FFFFFF" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {decimal}
            </text>
          </g>
          <text x="130" y="196" fill="#94A3B8" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="1">
            kW · h
          </text>

          {/* LED Parpadeante de Impulsos */}
          <circle cx="130" cy="214" r="3.5" fill="#EF4444" className="animate-pulse" />
          <text x="130" y="226" fill="#64748B" fontSize="6.5" textAnchor="middle">
            1000 imp / kWh
          </text>

          {/* AGUJA INDICADORA DEL DIAL */}
          <g 
            transform={`translate(130, 130) rotate(${anguloAguja})`}
            className="transition-transform duration-1000 ease-out"
          >
            {/* Sombra de la aguja */}
            <polygon points="-3,-10 3,-10 1,-78 -1,-78" fill="#0F172A" opacity="0.6" transform="translate(2, 4)" />
            {/* Aguja Roja */}
            <polygon points="-3,-8 3,-8 1,-82 -1,-82" fill="#EF4444" />
            <line x1="0" y1="-8" x2="0" y2="-82" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
            {/* Contrapeso */}
            <polygon points="-4,-8 4,-8 2,16 -2,16" fill="#334155" />
            {/* Centro / Eje */}
            <circle cx="0" cy="0" r="8" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
            <circle cx="0" cy="0" r="3" fill="#EF4444" />
          </g>

          {/* Reflejo de Vidrio en el Domo */}
          <path
            d="M 60 70 A 90 90 0 0 1 200 70 C 160 90, 100 90, 60 70 Z"
            fill="#FFFFFF"
            fillOpacity="0.06"
          />
        </svg>
      </div>

      {/* Lectura Grande de kWh */}
      <div className="mt-2">
        <span className="text-3xl font-black text-white font-mono tracking-tight">
          {kwhNum.toLocaleString()} <span className="text-sm font-sans text-slate-400 font-normal">kWh</span>
        </span>
        <p className="text-xs text-slate-400 mt-0.5">{empresaNombre}</p>
      </div>
    </div>
  );
}
