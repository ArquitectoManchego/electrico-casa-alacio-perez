import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Compass, RotateCcw, Magnet, Navigation } from 'lucide-react';

/**
 * RosaDeLosVientosKnob.jsx
 * Control interactivo tipo perilla/dial para orientar el Norte de los planos ejecutivos CAD.
 * Permite giro manual libre (0-359°) con arrastre de mouse/touch, y snap restringido a 45°
 * manteniendo oprimida la tecla Shift (o activando el botón de snap/orto).
 */
export default function RosaDeLosVientosKnob({
  angulo = 0,
  onChange,
  size = 200
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [forceSnap45, setForceSnap45] = useState(false);
  const dialRef = useRef(null);

  // Escuchar tecla Shift globalmente para dar retroalimentación visual inmediata
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Calcula el ángulo a partir de la posición del puntero respecto al centro del dial
  const computeAngleFromEvent = useCallback((e) => {
    if (!dialRef.current) return angulo;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // En coordenadas de pantalla: dy < 0 es arriba (Norte = 0°)
    // dx > 0 es derecha (Este = 90°), dy > 0 es abajo (Sur = 180°), dx < 0 es izquierda (Oeste = 270°)
    let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (deg < 0) deg += 360;
    deg = Math.round(deg);

    // Restricción a snaps de 45° si Shift está presionado o el modo snap está activo
    const shouldSnap = e.shiftKey || isShiftPressed || forceSnap45;
    if (shouldSnap) {
      deg = (Math.round(deg / 45) * 45) % 360;
    }

    return deg;
  }, [angulo, isShiftPressed, forceSnap45]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(true);
    const newAngle = computeAngleFromEvent(e);
    if (onChange && newAngle !== angulo) {
      onChange(newAngle);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const newAngle = computeAngleFromEvent(e);
    if (onChange && newAngle !== angulo) {
      onChange(newAngle);
    }
  };

  const handlePointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(false);
  };

  // Puntos cardinales y ordinales rápidos (múltiplos de 45°)
  const PRESETS = [
    { label: 'N', deg: 0, desc: 'Norte (0°)' },
    { label: 'NE', deg: 45, desc: 'Noreste (45°)' },
    { label: 'E', deg: 90, desc: 'Este (90°)' },
    { label: 'SE', deg: 135, desc: 'Sureste (135°)' },
    { label: 'S', deg: 180, desc: 'Sur (180°)' },
    { label: 'SO', deg: 225, desc: 'Suroeste (225°)' },
    { label: 'O', deg: 270, desc: 'Oeste (270°)' },
    { label: 'NO', deg: 315, desc: 'Noroeste (315°)' },
  ];

  const snapActivo = isShiftPressed || forceSnap45;

  return (
    <div className="flex flex-col items-center select-none bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
      {/* Encabezado con estado del snap */}
      <div className="w-full flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Compass size={16} className="text-teal-400" />
          <span className="text-xs font-bold text-slate-200">Orientación del Norte</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setForceSnap45(v => !v)}
            title="Snap a 45° (Tecla Shift o click aquí para fijar)"
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
              snapActivo
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            <Magnet size={11} className={snapActivo ? 'text-emerald-400 animate-pulse' : ''} />
            <span>Snap 45° {snapActivo ? 'ACTIVO' : '(Shift)'}</span>
          </button>
        </div>
      </div>

      {/* Perilla / Dial de la Rosa de los Vientos */}
      <div className="relative touch-none cursor-grab active:cursor-grabbing p-2" ref={dialRef}>
        <svg
          width={size}
          height={size}
          viewBox="-100 -100 200 200"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="overflow-visible"
        >
          {/* Anillo exterior decorativo */}
          <circle cx="0" cy="0" r="95" fill="#090d16" stroke="#1e293b" strokeWidth="3" />
          <circle cx="0" cy="0" r="88" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2,3" />

          {/* Marcas de grados cada 15° y 45° */}
          {Array.from({ length: 24 }).map((_, i) => {
            const deg = i * 15;
            const isMajor = deg % 45 === 0;
            const isCardinal = deg % 90 === 0;
            const rad = (deg - 90) * (Math.PI / 180);
            const rInner = isCardinal ? 72 : isMajor ? 76 : 80;
            const rOuter = 84;
            const x1 = Math.cos(rad) * rInner;
            const y1 = Math.sin(rad) * rInner;
            const x2 = Math.cos(rad) * rOuter;
            const y2 = Math.sin(rad) * rOuter;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCardinal ? '#38bdf8' : isMajor ? '#94a3b8' : '#475569'}
                strokeWidth={isCardinal ? 2 : isMajor ? 1.5 : 0.75}
              />
            );
          })}

          {/* Letras Cardinales fijas en el dial exterior */}
          <text x="0" y="-62" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#38bdf8">N</text>
          <text x="64" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8">E</text>
          <text x="0" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8">S</text>
          <text x="-64" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8">O</text>

          {/* Rosa y Aguja giratoria según el ángulo actual */}
          <g transform={`rotate(${angulo})`} className="transition-transform duration-75">
            {/* Sombra de la aguja */}
            <circle cx="0" cy="0" r="48" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
            
            {/* Ejes en cruz de la aguja */}
            <line x1="0" y1="-50" x2="0" y2="50" stroke="#38bdf8" strokeWidth="1" strokeDasharray="1,2" opacity="0.6" />
            <line x1="-50" y1="0" x2="50" y2="0" stroke="#38bdf8" strokeWidth="1" strokeDasharray="1,2" opacity="0.6" />

            {/* Aguja Norte (Principal - Cyan brillante con relieve) */}
            <polygon points="0,-72 -10,-12 0,0" fill="#06b6d4" />
            <polygon points="0,-72 10,-12 0,0" fill="#38bdf8" opacity="0.8" />
            <polygon points="0,-72 -10,-12 0,0" stroke="#0891b2" strokeWidth="0.5" fill="none" />

            {/* Aguja Sur (Muted) */}
            <polygon points="0,72 10,12 0,0" fill="#475569" />
            <polygon points="0,72 -10,12 0,0" fill="#64748b" opacity="0.8" />

            {/* Aguja Este y Oeste */}
            <polygon points="56,0 10,-7 0,0" fill="#334155" />
            <polygon points="56,0 10,7 0,0" fill="#475569" />
            <polygon points="-56,0 -10,7 0,0" fill="#334155" />
            <polygon points="-56,0 -10,-7 0,0" fill="#475569" />

            {/* Marcador N de la aguja */}
            <circle cx="0" cy="-48" r="8" fill="#0e7490" stroke="#22d3ee" strokeWidth="1.5" />
            <text x="0" y="-45" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff" fontFamily="monospace">N</text>
          </g>

          {/* Núcleo central del dial */}
          <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <circle cx="0" cy="0" r="5" fill="#ffffff" />
        </svg>

        {/* Indicador de arrastre activo */}
        {isDragging && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/90 text-slate-950 shadow-lg">
              {angulo}°
            </span>
          </div>
        )}
      </div>

      {/* Control numérico y botones de ajuste fino */}
      <div className="w-full mt-3 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            max="359"
            value={angulo}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              const safe = isNaN(val) ? 0 : ((val % 360) + 360) % 360;
              onChange && onChange(safe);
            }}
            className="w-16 px-2 py-1 text-center font-mono font-bold text-sm bg-slate-950 border border-slate-700 rounded-lg text-teal-400 focus:outline-none focus:border-teal-400"
          />
          <span className="text-xs font-bold text-slate-400">grados</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange && onChange(((angulo - 5) + 360) % 360)}
            title="-5°"
            className="px-2 py-1 text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition cursor-pointer"
          >
            -5°
          </button>
          <button
            type="button"
            onClick={() => onChange && onChange((angulo + 5) % 360)}
            title="+5°"
            className="px-2 py-1 text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition cursor-pointer"
          >
            +5°
          </button>
          <button
            type="button"
            onClick={() => onChange && onChange(0)}
            title="Restablecer al Norte (0°)"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Botonera de Snaps Rápidos (45° de AutoCAD) */}
      <div className="w-full mt-3 grid grid-cols-4 gap-1.5">
        {PRESETS.map((p) => {
          const isSelected = angulo === p.deg;
          return (
            <button
              key={p.deg}
              type="button"
              onClick={() => onChange && onChange(p.deg)}
              title={p.desc}
              className={`py-1 px-1 text-center rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 shadow-md font-black ring-1 ring-teal-300'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p.label} <span className="text-[9px] opacity-75">({p.deg}°)</span>
            </button>
          );
        })}
      </div>

      {/* Nota de ayuda técnica sobre el snap */}
      <p className="text-[9px] text-slate-500 text-center mt-2 leading-tight">
        Mantén presionado <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">Shift</kbd> mientras giras con el mouse para restringir el movimiento a intervalos de 45° (Snap ortogonal tipo AutoCAD).
      </p>
    </div>
  );
}
