import React, { useEffect, useState } from 'react';
import {
  Sun,
  Moon,
  ZapOff,
  Zap,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { calcularFlujoSolarInstantaneo } from '../../utils/motorSolar';

function formatHora(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  const suffix = hrs >= 12 ? 'PM' : 'AM';
  const h12 = hrs > 12 ? hrs - 12 : (hrs === 0 ? 12 : hrs);
  return `${h12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

export default function EsquemaSolarAnimadoSVG({
  arquitectura,
  simulacion,
  wattsEdificioActual = 4500,
  wattsCriticosActual = 1800,
  apagonCFE = false,
  onToggleApagon,
  horaSimulada = 13,
  onChangeHora
}) {
  const [autoPlay, setAutoPlay] = useState(false);

  // Ciclo automático del día para demostración en vivo a socios
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      onChangeHora((prev) => {
        const next = prev + 0.5;
        return next > 23 ? 6 : next;
      });
    }, 650);
    return () => clearInterval(timer);
  }, [autoPlay, onChangeHora]);

  const flujo = calcularFlujoSolarInstantaneo({
    hora: horaSimulada,
    arquitecturaId: arquitectura.id,
    potenciaKwp: simulacion.potenciaKwp,
    wattsEdificioActual,
    wattsCriticosActual,
    bateriaKwh: simulacion.bateriaEfectiva,
    apagonCFE
  });

  // Posición arco solar X: 70 -> 470, Y: 75 -> 22 -> 75
  const progresoSol = Math.max(0, Math.min(1, (horaSimulada - 6) / 13));
  const sunX = 75 + progresoSol * 390;
  const sunY = 72 - Math.sin(progresoSol * Math.PI) * 48;

  const skyBg = flujo.esDia
    ? (apagonCFE ? 'from-slate-900 via-amber-950/30 to-slate-950' : 'from-sky-950/70 via-slate-900 to-slate-950')
    : 'from-indigo-950/60 via-slate-950 to-slate-950';

  const panelesVisualCount = Math.min(16, Math.max(0, simulacion.panelesEfectivos));
  const bateriaNivelPct = !arquitectura.usaBaterias
    ? 0
    : flujo.inversorABateriaW > 0
      ? 92
      : flujo.bateriaAInversorW > 0
        ? (apagonCFE ? 64 : 74)
        : 88;

  return (
    <section
      data-testid="solar-esquema-animado-section"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 overflow-hidden"
    >
      <style>{`
        @keyframes solarFlowForward {
          to { stroke-dashoffset: -36; }
        }
        @keyframes solarFlowReverse {
          to { stroke-dashoffset: 36; }
        }
        .flow-fwd {
          stroke-dasharray: 8 10;
          animation: solarFlowForward 1.1s linear infinite;
        }
        .flow-rev {
          stroke-dasharray: 8 10;
          animation: solarFlowReverse 1.1s linear infinite;
        }
        .flow-fast {
          stroke-dasharray: 9 9;
          animation: solarFlowForward 0.65s linear infinite;
        }
      `}</style>

      {/* Encabezado y controles interactivos de simulación en vivo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            {flujo.esDia ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-300" />}
            Esquema Interactivo en Vivo · {arquitectura.nombre}
          </h3>
          <p className="text-xs text-slate-400">
            Mueve la hora del día o simula un apagón de CFE para ver qué ocurre en el edificio en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Play/Pause recorrido 24h */}
          <button
            type="button"
            data-testid="solar-esquema-autoplay-btn"
            aria-label={autoPlay ? 'Pausar ciclo solar' : 'Reproducir ciclo solar día y noche'}
            onClick={() => setAutoPlay(v => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              autoPlay
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoPlay ? 'Pausar Día' : 'Animar Día/Noche'}
          </button>

          {/* Botón dramático Simular Apagón CFE */}
          <button
            type="button"
            data-testid="solar-esquema-apagon-btn"
            aria-label={apagonCFE ? 'Restablecer energía CFE' : 'Simular apagón de CFE'}
            onClick={onToggleApagon}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              apagonCFE
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-rose-600/30'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
            }`}
          >
            {apagonCFE ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
            {apagonCFE ? 'Restablecer Luz CFE' : '⚡ Simular Apagón CFE'}
          </button>
        </div>
      </div>

      {/* Slider de Hora del Día */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0 min-w-[145px]">
          {flujo.esDia ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          <span className="text-xs font-black text-white font-mono">{formatHora(horaSimulada)}</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {flujo.esDia ? `Sol ${Math.round(flujo.factorSol * 100)}%` : 'Noche'}
          </span>
        </div>
        <input
          type="range"
          min={6}
          max={23}
          step={0.5}
          value={horaSimulada}
          data-testid="solar-esquema-hora-slider"
          aria-label="Hora del día para simulación solar"
          onChange={(e) => {
            setAutoPlay(false);
            onChangeHora(parseFloat(e.target.value));
          }}
          className="w-full accent-amber-400 cursor-pointer"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { label: '9 AM', h: 9 },
            { label: '1 PM', h: 13 },
            { label: '8 PM', h: 20 }
          ].map(btn => (
            <button
              key={btn.h}
              type="button"
              data-testid={`solar-hora-preset-${btn.h}-btn`}
              onClick={() => {
                setAutoPlay(false);
                onChangeHora(btn.h);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                Math.abs(horaSimulada - btn.h) < 0.6
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Escenario Gráfico SVG Animado */}
      <div className={`relative rounded-2xl border border-slate-800 bg-gradient-to-b ${skyBg} p-2 sm:p-4`}>
        <svg
          viewBox="0 0 920 350"
          className="w-full h-auto select-none"
          role="img"
          aria-label={`Diagrama animado de flujo eléctrico para configuración ${arquitectura.nombre}`}
        >
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Estrellas nocturnas */}
          {!flujo.esDia && (
            <g fill="#e2e8f0" opacity="0.55">
              <circle cx="95" cy="36" r="1.5" />
              <circle cx="190" cy="24" r="1.2" />
              <circle cx="315" cy="40" r="1.8" />
              <circle cx="480" cy="28" r="1.3" />
              <circle cx="620" cy="35" r="1.6" />
              <circle cx="790" cy="25" r="1.4" />
            </g>
          )}

          {/* Sol / Luna animados */}
          {flujo.esDia ? (
            <g>
              <circle cx={sunX} cy={sunY} r={34 + flujo.factorSol * 16} fill="url(#sunGlow)" />
              <circle cx={sunX} cy={sunY} r="17" fill="#fde047" stroke="#f59e0b" strokeWidth="2" />
            </g>
          ) : (
            <g transform="translate(115, 42)">
              <circle cx="0" cy="0" r="16" fill="#cbd5e1" />
              <circle cx="6" cy="-4" r="14" fill="#1e1b4b" />
            </g>
          )}

          {/* Rayos del sol hacia los paneles */}
          {arquitectura.usaPaneles && flujo.esDia && !apagonCFE && (
            <g opacity={0.35 + flujo.factorSol * 0.5}>
              <line x1={sunX} y1={sunY + 20} x2="165" y2="122" stroke="#facc15" strokeWidth="2" className="flow-fwd" />
              <line x1={sunX} y1={sunY + 20} x2="225" y2="122" stroke="#facc15" strokeWidth="2" className="flow-fwd" />
            </g>
          )}
          {arquitectura.usaPaneles && flujo.esDia && apagonCFE && arquitectura.funcionaEnApagon && (
            <g opacity={0.35 + flujo.factorSol * 0.5}>
              <line x1={sunX} y1={sunY + 20} x2="195" y2="122" stroke="#facc15" strokeWidth="2.2" className="flow-fwd" />
            </g>
          )}

          {/* ==================== NODO 1: PANELES SOLARES ==================== */}
          <g transform="translate(70, 118)" opacity={arquitectura.usaPaneles ? 1 : 0.25}>
            <rect
              x="0"
              y="0"
              width="210"
              height="95"
              rx="14"
              fill="#0f172a"
              stroke={arquitectura.usaPaneles && flujo.solAInversorW > 0 ? '#facc15' : '#334155'}
              strokeWidth="2"
            />
            <text x="105" y="21" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800">
              {arquitectura.usaPaneles ? `PANELES EN AZOTEA (${simulacion.panelesEfectivos})` : 'SIN PANELES SOLARES'}
            </text>

            {/* Celdas visuales de paneles */}
            {arquitectura.usaPaneles ? (
              <g transform="translate(18, 30)">
                {Array.from({ length: Math.max(4, panelesVisualCount) }).map((_, i) => {
                  const col = i % 8;
                  const row = Math.floor(i / 8);
                  const active = i < panelesVisualCount;
                  return (
                    <rect
                      key={i}
                      x={col * 22}
                      y={row * 22}
                      width="19"
                      height="18"
                      rx="2.5"
                      fill={active ? 'url(#panelGrad)' : '#0f172a'}
                      stroke={active ? (flujo.esDia ? '#38bdf8' : '#334155') : '#1e293b'}
                      strokeWidth="1.2"
                    />
                  );
                })}
              </g>
            ) : (
              <text x="105" y="58" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">
                (Solo respaldo con baterías)
              </text>
            )}

            <text x="105" y="86" textAnchor="middle" fill={flujo.solAInversorW > 0 ? '#fde047' : '#94a3b8'} fontSize="11" fontWeight="800">
              {arquitectura.usaPaneles
                ? `Generando: ${(flujo.solAInversorW / 1000).toFixed(2)} kW (${simulacion.potenciaKwp} kWp)`
                : '0.00 kW solar'}
            </text>
          </g>

          {/* ==================== NODO 2: INVERSOR / CEREBRO ==================== */}
          <g transform="translate(365, 118)">
            <rect
              x="0"
              y="0"
              width="190"
              height="95"
              rx="14"
              fill="#0f172a"
              stroke={
                apagonCFE && !arquitectura.funcionaEnApagon
                  ? '#f43f5e'
                  : (flujo.inversorAEdificioW > 0 || flujo.inversorACfeW > 0 ? '#14b8a6' : '#475569')
              }
              strokeWidth="2.5"
            />
            <text x="95" y="22" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800">
              {arquitectura.id === 'hibrido'
                ? 'INVERSOR HÍBRIDO'
                : arquitectura.id === 'ups_baterias'
                  ? 'INVERSOR-CARGADOR UPS'
                  : arquitectura.id === 'zero_export'
                    ? 'INVERSOR + SENSOR CT'
                    : arquitectura.id === 'off_grid'
                      ? 'INVERSOR OFF-GRID'
                      : 'INVERSOR / MICROS'}
            </text>
            <rect x="28" y="34" width="134" height="32" rx="6" fill="#020617" stroke="#1e293b" />
            <text
              x="95"
              y="54"
              textAnchor="middle"
              fill={apagonCFE && !arquitectura.funcionaEnApagon ? '#fb7185' : '#2dd4bf'}
              fontSize="12"
              fontWeight="900"
            >
              {apagonCFE && !arquitectura.funcionaEnApagon
                ? 'BLOQUEO ANTI-ISLA'
                : `SALIDA: ${(flujo.inversorAEdificioW / 1000).toFixed(2)} kW`}
            </text>
            <text x="95" y="84" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
              {arquitectura.id === 'zero_export'
                ? 'Cero exportación a calle'
                : arquitectura.funcionaEnApagon
                  ? 'Transferencia < 20 ms'
                  : 'Requiere red CFE activa'}
            </text>
          </g>

          {/* ==================== NODO 3: BANCO DE BATERÍAS LiFePO4 ==================== */}
          <g transform="translate(365, 245)" opacity={arquitectura.usaBaterias ? 1 : 0.2}>
            <rect
              x="0"
              y="0"
              width="190"
              height="82"
              rx="14"
              fill="#0f172a"
              stroke={
                !arquitectura.usaBaterias
                  ? '#334155'
                  : flujo.bateriaAInversorW > 0
                    ? '#fbbf24'
                    : '#22d3ee'
              }
              strokeWidth="2"
            />
            <text x="95" y="20" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800">
              {arquitectura.usaBaterias ? `BATERÍAS LiFePO4 (${simulacion.bateriaEfectiva} kWh)` : 'SIN BATERÍAS'}
            </text>
            {/* Barra nivel de carga */}
            <rect x="24" y="30" width="142" height="22" rx="5" fill="#020617" stroke="#334155" />
            {arquitectura.usaBaterias && (
              <rect
                x="27"
                y="33"
                width={Math.max(8, (136 * bateriaNivelPct) / 100)}
                height="16"
                rx="3"
                fill={flujo.bateriaAInversorW > 0 ? '#f59e0b' : '#06b6d4'}
              />
            )}
            <text x="95" y="45" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
              {arquitectura.usaBaterias
                ? flujo.bateriaAInversorW > 0
                  ? `DESCARGANDO ${(flujo.bateriaAInversorW / 1000).toFixed(2)} kW`
                  : flujo.inversorABateriaW > 0
                    ? `CARGANDO +${(flujo.inversorABateriaW / 1000).toFixed(2)} kW`
                    : 'EN ESPERA (100%)'
                : 'No incluidas en este plan'}
            </text>
            <text x="95" y="71" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
              {arquitectura.usaBaterias
                ? `${simulacion.numModulosBat} módulo(s) × 5 kWh · 6,000 ciclos`
                : 'Agrega baterías en el slider inferior'}
            </text>
          </g>

          {/* ==================== NODO 4: RED CFE Y MEDIDOR ==================== */}
          <g transform="translate(70, 245)" opacity={arquitectura.usaCfe ? 1 : 0.2}>
            <rect
              x="0"
              y="0"
              width="210"
              height="82"
              rx="14"
              fill={apagonCFE && arquitectura.usaCfe ? '#3b0712' : '#0f172a'}
              stroke={
                !arquitectura.usaCfe
                  ? '#334155'
                  : apagonCFE
                    ? '#f43f5e'
                    : flujo.inversorACfeW > 0
                      ? '#10b981'
                      : '#f97316'
              }
              strokeWidth="2"
            />
            <text x="105" y="21" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="800">
              {!arquitectura.usaCfe
                ? 'DESCONECTADO DE CFE'
                : apagonCFE
                  ? '⚡ RED CFE CAÍDA (APAGÓN)'
                  : arquitectura.id === 'zero_export'
                    ? 'ACOMETIDA CFE (SIN INYECCIÓN)'
                    : 'RED CFE · MEDIDOR BIDIRECCIONAL'}
            </text>
            <text
              x="105"
              y="47"
              textAnchor="middle"
              fill={
                !arquitectura.usaCfe
                  ? '#64748b'
                  : apagonCFE
                    ? '#fda4af'
                    : flujo.inversorACfeW > 0
                      ? '#34d399'
                      : '#fb923c'
              }
              fontSize="12"
              fontWeight="900"
            >
              {!arquitectura.usaCfe
                ? '100% Autónomo'
                : apagonCFE
                  ? '0.00 kW · SIN SERVICIO'
                  : flujo.inversorACfeW > 0
                    ? `SALDO A FAVOR +${(flujo.inversorACfeW / 1000).toFixed(2)} kW`
                    : flujo.cfeAEdificioW > 0
                      ? `TOMANDO ${(flujo.cfeAEdificioW / 1000).toFixed(2)} kW`
                      : 'EN EQUILIBRIO 0.00 kW'}
            </text>
            <text x="105" y="70" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
              {!arquitectura.usaCfe
                ? 'No paga recibo CFE'
                : apagonCFE
                  ? 'Falla en transformador o poste'
                  : flujo.inversorACfeW > 0
                    ? 'Se guarda como crédito hasta 12 meses'
                    : 'Suministro eléctrico de red pública'}
            </text>
          </g>

          {/* ==================== NODO 5: EDIFICIO CASA ALACIO PÉREZ ==================== */}
          <g transform="translate(650, 95)">
            <rect
              x="0"
              y="0"
              width="215"
              height="232"
              rx="16"
              fill={flujo.edificioEnergizado ? '#0f172a' : '#090d16'}
              stroke={
                !flujo.edificioEnergizado
                  ? '#f43f5e'
                  : apagonCFE
                    ? '#fbbf24'
                    : '#10b981'
              }
              strokeWidth="2.5"
            />
            <text x="107" y="23" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="900">
              CASA ALACIO PÉREZ
            </text>
            <text
              x="107"
              y="40"
              textAnchor="middle"
              fill={!flujo.edificioEnergizado ? '#fb7185' : apagonCFE ? '#fde047' : '#34d399'}
              fontSize="10"
              fontWeight="800"
            >
              {!flujo.edificioEnergizado
                ? 'EDIFICIO SIN ENERGÍA'
                : apagonCFE
                  ? `CARGAS CRÍTICAS VIVAS (${(wattsCriticosActual / 1000).toFixed(1)} kW)`
                  : `OPERANDO NORMAL (${(wattsEdificioActual / 1000).toFixed(1)} kW)`}
            </text>

            {/* Ventanas iluminadas de los locales del Consorcio */}
            {[
              { name: 'Imperia Uniformes', x: 18, y: 54, critico: true },
              { name: 'Hawaiian (Refris+TPV)', x: 112, y: 54, critico: true },
              { name: 'Papelería ImperiArte', x: 18, y: 106, critico: true },
              { name: 'Taller Costura', x: 112, y: 106, critico: false },
              { name: 'Publi-Imperia', x: 18, y: 158, critico: false },
              { name: 'Bordados / Oficina', x: 112, y: 158, critico: false }
            ].map((loc, idx) => {
              const prendido = flujo.edificioEnergizado && (!apagonCFE || loc.critico || simulacion.bateriaEfectiva >= 15);
              return (
                <g key={idx} transform={`translate(${loc.x}, ${loc.y})`}>
                  <rect
                    x="0"
                    y="0"
                    width="84"
                    height="42"
                    rx="7"
                    fill={prendido ? (apagonCFE ? '#451a03' : '#064e3b') : '#1e293b'}
                    stroke={prendido ? (apagonCFE ? '#f59e0b' : '#34d399') : '#334155'}
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="14" r="3.5" fill={prendido ? '#fde047' : '#475569'} />
                  <text x="20" y="17" fill={prendido ? '#f8fafc' : '#64748b'} fontSize="8.2" fontWeight="800">
                    {prendido ? 'ACTIVO' : 'APAGADO'}
                  </text>
                  <text x="42" y="33" textAnchor="middle" fill={prendido ? '#cbd5e1' : '#64748b'} fontSize="7.4" fontWeight="700">
                    {loc.name}
                  </text>
                </g>
              );
            })}

            <text x="107" y="218" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontWeight="700">
              {!flujo.edificioEnergizado
                ? 'Cajas, refrigeradores y cámaras OFF'
                : apagonCFE
                  ? 'Respaldo silencioso sin cortes'
                  : 'Todos los locales operando'}
            </text>
          </g>

          {/* ==================== CABLES Y FLUJOS ANIMADOS ==================== */}

          {/* 1. Paneles -> Inversor (DC Amarillo) */}
          <path d="M 280 165 L 365 165" stroke="#334155" strokeWidth="5" fill="none" />
          {flujo.solAInversorW > 0 && (
            <path d="M 280 165 L 365 165" stroke="#facc15" strokeWidth="4" fill="none" className="flow-fast" />
          )}

          {/* 2. Inversor <-> Baterías (Cian / Ámbar) */}
          <path d="M 460 213 L 460 245" stroke="#334155" strokeWidth="5" fill="none" />
          {flujo.inversorABateriaW > 0 && (
            <path d="M 460 213 L 460 245" stroke="#22d3ee" strokeWidth="4" fill="none" className="flow-fwd" />
          )}
          {flujo.bateriaAInversorW > 0 && (
            <path d="M 460 213 L 460 245" stroke="#f59e0b" strokeWidth="4" fill="none" className="flow-rev" />
          )}

          {/* 3. Inversor -> Edificio (Verde Esmeralda / Ámbar Respaldo) */}
          <path d="M 555 165 L 650 165" stroke="#334155" strokeWidth="5" fill="none" />
          {flujo.inversorAEdificioW > 0 && (
            <path
              d="M 555 165 L 650 165"
              stroke={apagonCFE ? '#fbbf24' : '#10b981'}
              strokeWidth="4.5"
              fill="none"
              className="flow-fast"
            />
          )}

          {/* 4. CFE <-> Inversor/Edificio */}
          {arquitectura.usaCfe && (
            <>
              {/* Inyección de excedentes Inversor -> CFE */}
              <path d="M 365 190 L 320 190 L 320 278 L 280 278" stroke="#334155" strokeWidth="4" fill="none" />
              {flujo.inversorACfeW > 0 && !apagonCFE && (
                <path d="M 365 190 L 320 190 L 320 278 L 280 278" stroke="#10b981" strokeWidth="3.5" fill="none" className="flow-fwd" />
              )}

              {/* Suministro CFE -> Edificio */}
              <path d="M 280 302 L 608 302 L 608 215 L 650 215" stroke="#334155" strokeWidth="4" fill="none" />
              {flujo.cfeAEdificioW > 0 && !apagonCFE && (
                <path d="M 280 302 L 608 302 L 608 215 L 650 215" stroke="#fb923c" strokeWidth="3.5" fill="none" className="flow-fwd" />
              )}
            </>
          )}
        </svg>
      </div>

      {/* Narrativa en vivo para explicar a socios */}
      <div
        data-testid="solar-esquema-estado-banner"
        className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
          flujo.alertaNivel === 'danger'
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-100'
            : flujo.alertaNivel === 'warning'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-100'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {flujo.alertaNivel === 'danger' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          ) : flujo.alertaNivel === 'warning' ? (
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        <div>
          <div className="text-xs font-black tracking-wide">{flujo.modoOperacionTitulo}</div>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{flujo.modoOperacionDetalle}</p>
        </div>
      </div>
    </section>
  );
}
