import React from 'react';
import { ShieldAlert, Info, Trash2, ArrowRightLeft, DollarSign, AlertTriangle } from 'lucide-react';
import { 
  calcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor,
  calcularCaidaTension
} from '../utils/ecuacionesUVIE';

export default function CuadroCargasTabla({ 
  aparatos, 
  acometidaId, 
  fasesDisponibles, 
  desbalance, 
  onUpdateFase, 
  onDeleteAparato,
  onUpdateAparatoProps,
  onBalancearFases,
  balancingConfigsCount = 0,
  fasesUnit = 'VA',
  onChangeFasesUnit
}) {

  // Calcular la suma de cargas por fase en la unidad seleccionada
  const fasesDisplayTotal = { A: 0, B: 0, C: 0 };
  
  aparatos.forEach(ap => {
    const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
    const fp = parseFloat(ap.fp) || 1.0;
    
    // Calcular desglose de VA por fase por fila (base)
    const vaFila = { A: 0, B: 0, C: 0 };
    if (ap.tipoCarga === 'trifasica' && acometidaId === 'trifasico') {
      vaFila.A = va / 3;
      vaFila.B = va / 3;
      vaFila.C = va / 3;
    } else if (ap.tipoCarga === 'bifasica' && (acometidaId === 'bifasico' || acometidaId === 'trifasico')) {
      const combo = ap.fase || 'A-B';
      const partes = combo.split('-');
      // Llenar vaFila para esta fila
      partes.forEach(f => {
        if (vaFila[f] !== undefined) {
          vaFila[f] = va / partes.length;
        }
      });
    } else {
      let f = ap.fase;
      if (!fasesDisponibles.includes(f)) {
        f = 'A';
      }
      vaFila[f] = va;
    }

    // Convertir a la unidad actual
    ['A', 'B', 'C'].forEach(f => {
      const vaFase = vaFila[f];
      if (vaFase > 0) {
        if (fasesUnit === 'VA') {
          fasesDisplayTotal[f] += vaFase;
        } else if (fasesUnit === 'W') {
          fasesDisplayTotal[f] += vaFase * fp;
        } else if (fasesUnit === 'A') {
          if (ap.tipoCarga === 'trifasica' && acometidaId === 'trifasico') {
            fasesDisplayTotal[f] += vaFase / 127.017;
          } else if (ap.tipoCarga === 'bifasica') {
            fasesDisplayTotal[f] += vaFase / 110;
          } else {
            fasesDisplayTotal[f] += vaFase / 127;
          }
        }
      }
    });
  });

  const desbalanceSuperado = desbalance > 5.0 && acometidaId !== 'monofasico';

  if (aparatos.length === 0) {
    return null;
  }

  // Totales financieros
  const totalPrecio = aparatos.reduce((sum, ap) => sum + (parseFloat(ap.precio) || 0), 0);
  const totalMantenimiento = aparatos.reduce((sum, ap) => sum + (parseFloat(ap.mantenimiento) || 0), 0);

  return (
    <div className="space-y-4">
      <style>{`
        .tooltip-container {
          position: relative;
          cursor: help;
        }
        .tooltip-content {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          top: 110%; /* Posicionar abajo del encabezado para evitar recorte de overflow */
          left: 50%;
          transform: translateX(-50%);
          background-color: #0f172a;
          color: #cbd5e1;
          text-align: left;
          border-radius: 8px;
          padding: 8px 12px;
          border: 1px solid #334155;
          width: 245px;
          font-family: sans-serif;
          font-size: 10px;
          font-weight: normal;
          line-height: 1.4;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
          z-index: 50;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          transition-delay: 1s; /* 1 segundo de retardo */
          pointer-events: none;
          text-transform: none;
        }
        .tooltip-content::after {
          content: "";
          position: absolute;
          bottom: 100%; /* Flecha en la parte superior */
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: transparent transparent #0f172a transparent; /* Apuntando hacia arriba */
        }
        .tooltip-container:hover .tooltip-content {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
      {/* Banner de Alerta UVIE */}
      {desbalanceSuperado && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 animate-pulse-subtle flex items-start gap-3 glow-red">
          <ShieldAlert className="mt-0.5 flex-shrink-0 animate-bounce text-rose-500" size={20} />
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wide">
              Incumplimiento Normativo UVIE - Desbalanceo Crítico: {desbalance.toFixed(2)}%
            </h4>
            <p className="text-xs mt-1 leading-relaxed text-rose-300 font-sans">
              El desbalanceo entre fases excede el **5.0%** permitido por la NOM-001-SEDE. Las unidades de verificación (UVIE) **rechazarán** este cuadro de cargas. Por favor, haz clic en el botón de **"Balancear Fases"** abajo a la derecha para resolverlo automáticamente.
            </p>
          </div>
        </div>
      )}

      {/* Tabla Cuadro de Cargas */}
      <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300 print-landscape-page">
        <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
              Cuadro de Cargas Normativo (NOM-001-SEDE)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
              Copia interactiva. Haz clic directamente en los textos/valores para editarlos en tiempo real.
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 flex items-center gap-1 font-sans">
            <Info size={11} />
            Art. 210 y 220
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase bg-slate-950/40">
                <th className="p-3 w-[45px] text-center">#</th>
                <th className="p-3 w-[180px] tooltip-container">
                  Circuito / Equipo
                  <div className="tooltip-content">
                    <strong>Circuito / Equipo:</strong> Nombre descriptivo y modelo del equipo eléctrico o circuito derivado registrado.
                  </div>
                </th>
                <th className="p-3 w-[80px] tooltip-container">
                  Tensión
                  <div className="tooltip-content">
                    <strong>Tensión:</strong> Voltaje de operación del circuito. 127V para cargas monofásicas; 220V para bifásicas y trifásicas en México.
                  </div>
                </th>
                <th className="p-3 w-[100px] text-right tooltip-container">
                  Watts (P)
                  <div className="tooltip-content">
                    <strong>Watts (Potencia Activa):</strong> Representa la energía real útil consumida y transformada en trabajo (calor, movimiento, luz).
                  </div>
                </th>
                <th className="p-3 w-[70px] text-center tooltip-container">
                  F.P.
                  <div className="tooltip-content">
                    <strong>F.P. (Factor de Potencia):</strong> Relación entre potencia activa (W) y aparente (VA). Mide la eficiencia (valores menores a 0.90 pueden generar multas).
                  </div>
                </th>
                <th className="p-3 w-[100px] text-right tooltip-container">
                  VA (S)
                  <div className="tooltip-content">
                    <strong>Volt-Amperios (Potencia Aparente):</strong> Potencia total entregada por la red (VA = Watts / F.P.). Se usa para dimensionar conductores y transformadores.
                  </div>
                </th>
                <th className="p-3 w-[100px] text-right text-emerald-450 tooltip-container">
                  Precio (MXN)
                  <div className="tooltip-content">
                    <strong>Precio de Compra:</strong> Costo inicial (CapEx) estimado del electrodoméstico o equipo para el análisis de ciclo de vida.
                  </div>
                </th>
                <th className="p-3 w-[100px] text-right text-amber-500 tooltip-container">
                  Mant. Anual
                  <div className="tooltip-content">
                    <strong>Mantenimiento Anual:</strong> Costo de operación preventivo/correctivo anualizado estimado del aparato (OpEx).
                  </div>
                </th>
                <th className="p-3 w-[80px] text-center text-slate-300 tooltip-container">
                  Vida Útil
                  <div className="tooltip-content">
                    <strong>Vida Útil:</strong> Duración estimada en años del equipo operando en condiciones residenciales óptimas.
                  </div>
                </th>
                <th className="p-3 text-center border-x border-slate-800/50 bg-slate-950/20 w-[180px] tooltip-container">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Carga por Fase ({fasesUnit})</span>
                    <button
                      onClick={onChangeFasesUnit}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-mono text-[9px] font-bold border border-slate-700 transition-all cursor-pointer no-print"
                      title="Alternar unidad de medida: VA, Watts o Amperes"
                    >
                      {fasesUnit}
                    </button>
                  </div>
                  <div className="tooltip-content">
                    <strong>Carga por Fase:</strong> Potencia distribuida en las fases L1 (A), L2 (B) y L3 (C). Utiliza el botón para alternar entre VA, Watts o Amperes.
                  </div>
                </th>
                <th className="p-3 text-right w-[80px] tooltip-container">
                  In (A)
                  <div className="tooltip-content">
                    <strong>In (Corriente Nominal):</strong> Intensidad de corriente en Amperios calculada a carga plena en condiciones normales de operación.
                  </div>
                </th>
                <th className="p-3 text-right w-[80px] tooltip-container">
                  Ic (1.25)
                  <div className="tooltip-content">
                    <strong>Ic (Corriente Corregida):</strong> Corriente nominal multiplicada por 1.25 para cargas de operación continua (más de 3 horas), requerido por Art. 210 de la NOM.
                  </div>
                </th>
                <th className="p-3 text-center w-[90px] tooltip-container">
                  Protección
                  <div className="tooltip-content">
                    <strong>Protección (ITM):</strong> Capacidad del interruptor termomagnético en Amperios (polos x corriente). Los valores con * son personalizados (overrides).
                  </div>
                </th>
                <th className="p-3 text-center w-[90px] tooltip-container">
                  Conductor
                  <div className="tooltip-content">
                    <strong>Conductor (Calibre):</strong> Calibre comercial de cobre AWG para cables de fase. Los valores con * son personalizados (overrides).
                  </div>
                </th>
                <th className="p-3 text-center w-[120px] tooltip-container">
                  Canalización
                  <div className="tooltip-content">
                    <strong>Canalización:</strong> Diámetro nominal en milímetros/pulgadas y tipo de tubería para proteger los conductores.
                  </div>
                </th>
                <th className="p-3 text-center w-[90px] tooltip-container">
                  Longitud (m)
                  <div className="tooltip-content">
                    <strong>Longitud (m):</strong> Distancia lineal desde el centro de carga hasta el equipo receptor.
                  </div>
                </th>
                <th className="p-3 text-center w-[100px] tooltip-container font-semibold">
                  % Caída V
                  <div className="tooltip-content">
                    <strong>% Caída de Tensión:</strong> Pérdida de voltaje en el trayecto. Debe ser menor al 3.00% bajo la NOM-001-SEDE.
                  </div>
                </th>
                <th className="p-3 text-center w-[90px] no-print">Acciones</th>
              </tr>
              <tr className="border-b border-slate-800/60 text-[9px] font-bold text-slate-500 bg-slate-950/10">
                <th colSpan="9"></th>
                <th className="p-1 border-x border-slate-800/50 bg-slate-950/20">
                  <div className="grid grid-cols-3 text-center">
                    <span>Fase A ({fasesUnit})</span>
                    <span>Fase B ({fasesUnit})</span>
                    <span>Fase C ({fasesUnit})</span>
                  </div>
                </th>
                <th colSpan="8" className="no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300 font-mono">
              {aparatos.map((ap, index) => {
                const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
                const fp = parseFloat(ap.fp) || 1.0;
                const tension = ap.tipoCarga === 'monofasica' || acometidaId === 'monofasico' ? 127 : 220;
                const inominal = calcularCorrienteNominal(va, acometidaId === 'monofasico' ? 'monofasica' : ap.tipoCarga);
                const icorregida = calcularCorrienteCorregida(inominal);
                
                // Overrides de tablero
                const autoProteccion = seleccionarProteccion(icorregida);
                const activeProteccion = ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? parseInt(ap.overrideBreaker) : autoProteccion;
                
                const autoConductor = seleccionarConductor(activeProteccion);
                const activeConductor = ap.overrideCable && ap.overrideCable !== 'Auto' ? ap.overrideCable : autoConductor;

                // Calcular desglose de VA por fase por fila
                const vaFila = { A: 0, B: 0, C: 0 };
                if (ap.tipoCarga === 'trifasica' && acometidaId === 'trifasico') {
                  vaFila.A = va / 3;
                  vaFila.B = va / 3;
                  vaFila.C = va / 3;
                } else if (ap.tipoCarga === 'bifasica' && (acometidaId === 'bifasico' || acometidaId === 'trifasico')) {
                  const fasePar = ap.fase || 'A-B';
                  const partes = fasePar.split('-');
                  partes.forEach(f => {
                    if (vaFila[f] !== undefined) {
                      vaFila[f] = va / partes.length;
                    }
                  });
                } else {
                  let f = ap.fase;
                  if (!fasesDisponibles.includes(f)) {
                    f = 'A';
                  }
                  vaFila[f] = va;
                }

                // Convertir desgloses de fila a la unidad actual
                const displayFila = { A: 0, B: 0, C: 0 };
                ['A', 'B', 'C'].forEach(f => {
                  const vaFase = vaFila[f];
                  if (vaFase > 0) {
                    if (fasesUnit === 'VA') {
                      displayFila[f] = vaFase;
                    } else if (fasesUnit === 'W') {
                      displayFila[f] = vaFase * fp;
                    } else if (fasesUnit === 'A') {
                      if (ap.tipoCarga === 'trifasica' && acometidaId === 'trifasico') {
                        displayFila[f] = vaFase / 127.017;
                      } else if (ap.tipoCarga === 'bifasica') {
                        displayFila[f] = vaFase / 110;
                      } else {
                        displayFila[f] = vaFase / 127;
                      }
                    }
                  }
                });

                return (
                  <tr key={ap.id} className="hover:bg-slate-900/10 transition-colors">
                    {/* Número secuencial */}
                    <td className="p-3 text-center text-slate-500 font-mono font-semibold">
                      {index + 1}
                    </td>
                    {/* Equipo editable */}
                    <td className="p-2 font-sans">
                      <input
                        type="text"
                        value={ap.tipo}
                        onChange={(e) => onUpdateAparatoProps(ap.id, { tipo: e.target.value })}
                        className="bg-transparent border-none text-white font-bold focus:ring-1 focus:ring-teal-500 w-full rounded px-1 py-0.5 text-xs m-0 focus:bg-slate-950/50"
                      />
                      <div className="flex items-center gap-1.5 pl-1 mt-0.5">
                        <input
                          type="text"
                          value={ap.modelo || ''}
                          onChange={(e) => onUpdateAparatoProps(ap.id, { modelo: e.target.value })}
                          placeholder="Modelo"
                          className="bg-transparent border-none text-slate-400 focus:ring-1 focus:ring-teal-500 w-28 rounded p-0 text-[10px] m-0 focus:bg-slate-950/50"
                        />
                        <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                          · 
                          <select
                            value={ap.tipoCarga}
                            onChange={(e) => {
                              const newTipo = e.target.value;
                              const updates = { tipoCarga: newTipo };
                              // Si cambiamos de tipo, setear una fase compatible por defecto
                              if (newTipo === 'bifasica') {
                                updates.fase = 'A-B';
                              } else if (newTipo === 'monofasica') {
                                updates.fase = 'A';
                              } else if (newTipo === 'trifasica') {
                                updates.fase = 'A-B-C';
                              }
                              onUpdateAparatoProps(ap.id, updates);
                            }}
                            className="bg-transparent border-none text-[9px] text-slate-400 font-mono focus:ring-1 focus:ring-teal-500 rounded p-0 m-0 cursor-pointer focus:bg-slate-950/50 no-print"
                            title="Cambiar tipo de conexión de carga (Monofásica, Bifásica o Trifásica)"
                          >
                            <option value="monofasica" className="bg-slate-900 text-slate-300">1F-1N (127V)</option>
                            {acometidaId !== 'monofasico' && (
                              <option value="bifasica" className="bg-slate-900 text-slate-300">2F-0N (220V)</option>
                            )}
                            {acometidaId === 'trifasico' && (
                              <option value="trifasica" className="bg-slate-900 text-slate-300">3F-0N (220V)</option>
                            )}
                          </select>
                          <span className="print:inline hidden">
                            {ap.tipoCarga === 'monofasica' ? '1F-1N' : ap.tipoCarga === 'bifasica' ? '2F-0N' : '3F-0N'}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Tensión */}
                    <td className="p-3 text-slate-400">{tension} V</td>

                    {/* Watts editable */}
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={ap.watts}
                        onChange={(e) => onUpdateAparatoProps(ap.id, { watts: e.target.value })}
                        className="bg-transparent border-none text-slate-200 font-semibold text-right focus:ring-1 focus:ring-teal-500 w-full rounded px-1 py-0.5 text-xs focus:bg-slate-950/50 font-mono"
                      />
                    </td>

                    {/* F.P. editable */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={ap.fp}
                        step="0.01"
                        min="0.1"
                        max="1.0"
                        placeholder="1.00"
                        onChange={(e) => onUpdateAparatoProps(ap.id, { fp: e.target.value, usarVaDirecto: false })}
                        className="bg-transparent border-none text-slate-200 text-center focus:ring-1 focus:ring-teal-500 w-full rounded p-0 text-xs focus:bg-slate-950/50 font-mono"
                      />
                    </td>

                    {/* VA calculado */}
                    <td className="p-3 text-right font-semibold text-cyan-400">
                      {Math.round(va).toLocaleString()} VA
                    </td>

                    {/* Precio CapEx editable */}
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={ap.precio === undefined ? '' : ap.precio}
                        onChange={(e) => onUpdateAparatoProps(ap.id, { precio: e.target.value })}
                        className="bg-transparent border-none text-emerald-450 font-bold text-right focus:ring-1 focus:ring-teal-500 w-full rounded px-1 py-0.5 text-xs focus:bg-slate-950/50 font-mono"
                      />
                    </td>

                    {/* Mantenimiento editable */}
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={ap.mantenimiento === undefined ? '' : ap.mantenimiento}
                        onChange={(e) => onUpdateAparatoProps(ap.id, { mantenimiento: e.target.value })}
                        className="bg-transparent border-none text-amber-500 text-right focus:ring-1 focus:ring-teal-500 w-full rounded px-1 py-0.5 text-xs focus:bg-slate-950/50 font-mono"
                      />
                    </td>

                    {/* Vida Útil editable */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={ap.vidaUtil === undefined ? '' : ap.vidaUtil}
                        onChange={(e) => onUpdateAparatoProps(ap.id, { vidaUtil: e.target.value })}
                        className="bg-transparent border-none text-slate-350 text-center focus:ring-1 focus:ring-teal-500 w-full rounded p-0 text-xs focus:bg-slate-950/50 font-mono"
                      />
                    </td>

                    {/* Desglose por Fases */}
                    <td className="p-3 border-x border-slate-800/40 bg-slate-950/10 text-center">
                      <div className="grid grid-cols-3 gap-1">
                        <span className={displayFila.A > 0 ? 'text-red-400 font-semibold' : 'text-slate-700'}>
                          {displayFila.A > 0 ? (fasesUnit === 'A' ? displayFila.A.toFixed(2) : Math.round(displayFila.A)) : '-'}
                        </span>
                        <span className={displayFila.B > 0 ? 'text-amber-400 font-semibold' : 'text-slate-700'}>
                          {displayFila.B > 0 ? (fasesUnit === 'A' ? displayFila.B.toFixed(2) : Math.round(displayFila.B)) : '-'}
                        </span>
                        <span className={displayFila.C > 0 ? 'text-blue-400 font-semibold' : 'text-slate-700'}>
                          {displayFila.C > 0 ? (fasesUnit === 'A' ? displayFila.C.toFixed(2) : Math.round(displayFila.C)) : '-'}
                        </span>
                      </div>
                    </td>

                    {/* In */}
                    <td className="p-3 text-right font-semibold text-slate-350">
                      {inominal.toFixed(2)} A
                    </td>

                    {/* Ic */}
                    <td className="p-3 text-right font-semibold text-slate-300">
                      {icorregida.toFixed(2)} A
                    </td>

                    {/* Protección y KAIC */}
                    <td className="p-3 text-center">
                      <span 
                        className={`inline-block px-2 py-0.5 rounded bg-slate-950 border font-bold text-[10px] ${
                          ap.overrideBreaker && ap.overrideBreaker !== 'Auto' 
                            ? 'border-orange-500/50 text-orange-400' 
                            : 'border-slate-850 text-amber-400'
                        }`}
                        title={ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? 'Valor personalizado (override)' : 'Valor automático'}
                      >
                        {ap.tipoCarga === 'monofasica' ? '1x' : ap.tipoCarga === 'bifasica' ? '2x' : '3x'}{activeProteccion}A{ap.overrideBreaker && ap.overrideBreaker !== 'Auto' && '*'} / {ap.kaic || '10 kA'}
                      </span>
                    </td>

                    {/* Conductor */}
                    <td className="p-3 text-center">
                      <span 
                        className={`inline-block px-2 py-0.5 rounded border font-bold text-[11px] ${
                          ap.overrideCable && ap.overrideCable !== 'Auto' 
                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                            : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                        }`}
                        title={ap.overrideCable && ap.overrideCable !== 'Auto' ? 'Calibre personalizado (override)' : 'Calibre automático'}
                      >
                        {activeConductor}
                        {ap.overrideCable && ap.overrideCable !== 'Auto' && '*'}
                      </span>
                    </td>

                    {/* Canalización */}
                    <td className="p-3 text-center text-slate-400 font-sans text-[11px]">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-slate-200">{ap.tuberiaDiametro || '16 mm (1/2")'}</span>
                        <span className="text-[10px] text-slate-500">{ap.tuberiaTipo || 'Pared Delgada'}</span>
                      </div>
                    </td>

                    {/* Longitud (m) */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={ap.longitudMetros !== undefined ? ap.longitudMetros : 15}
                        onChange={(e) => onUpdateAparatoProps(ap.id, { longitudMetros: parseFloat(e.target.value) || 0 })}
                        min="1"
                        className="w-16 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-center text-slate-200 text-[11px] font-mono focus:ring-1 focus:ring-teal-500"
                      />
                    </td>

                    {/* % Caída de Tensión */}
                    <td className="p-3 text-center">
                      {(() => {
                        const caida = calcularCaidaTension(
                          ap.longitudMetros !== undefined ? ap.longitudMetros : 15,
                          icorregida,
                          acometidaId === 'monofasico' ? 'monofasica' : ap.tipoCarga,
                          activeConductor
                        );
                        const esCritico = caida > 3.00;
                        return (
                          <div className="flex items-center justify-center gap-1 font-bold">
                            {esCritico && <AlertTriangle size={12} className="text-rose-500 animate-pulse-subtle" />}
                            <span className={esCritico ? 'text-rose-500 font-black animate-pulse-subtle' : 'text-emerald-450'}>
                              {caida.toFixed(2)}%
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Acciones */}
                    <td className="p-3 text-center no-print">
                      <div className="flex items-center justify-center gap-2">
                        {/* Rotar fase */}
                        {((ap.tipoCarga === 'monofasica' && fasesDisponibles.length > 1) || 
                          (ap.tipoCarga === 'bifasica' && acometidaId === 'trifasico')) && (
                          <button
                            onClick={() => {
                              if (ap.tipoCarga === 'monofasica') {
                                const currentIdx = fasesDisponibles.indexOf(ap.fase);
                                const nextIdx = (currentIdx + 1) % fasesDisponibles.length;
                                onUpdateFase(ap.id, fasesDisponibles[nextIdx]);
                              } else {
                                // Bifásica en trifásico: A-B -> B-C -> A-C -> A-B
                                const combos = ['A-B', 'B-C', 'A-C'];
                                const currentIdx = combos.indexOf(ap.fase || 'A-B');
                                const nextIdx = (currentIdx + 1) % combos.length;
                                onUpdateFase(ap.id, combos[nextIdx]);
                              }
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Rotar de Fase manualmente"
                          >
                            <ArrowRightLeft size={11} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteAparato(ap.id)}
                          className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all active:scale-[0.9]"
                          title="Eliminar del Cuadro"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totales del Cuadro */}
            <tfoot>
              <tr className="border-t-2 border-slate-800 text-[11px] font-bold text-slate-200 bg-slate-900/20 font-mono">
                <td className="p-3 text-center text-slate-500 font-semibold">-</td>
                <td className="p-3">TOTALES</td>
                <td className="p-3"></td>
                <td className="p-3 text-right">
                  {Math.round(aparatos.reduce((s, a) => s + (parseFloat(a.watts) || 0), 0)).toLocaleString()} W
                </td>
                <td className="p-3"></td>
                <td className="p-3 text-right text-cyan-400">
                  {Math.round(aparatos.reduce((s, a) => s + calcularVA(a.watts, a.fp, a.usarVaDirecto), 0)).toLocaleString()} VA
                </td>
                
                {/* Total Precio */}
                <td className="p-3 text-right text-emerald-450">
                  ${Math.round(totalPrecio).toLocaleString()} MXN
                </td>

                {/* Total Mantenimiento */}
                <td className="p-3 text-right text-amber-500">
                  ${Math.round(totalMantenimiento).toLocaleString()} MXN
                </td>

                {/* Promedio de Vida útil */}
                <td className="p-3 text-center text-slate-400">
                  {(aparatos.reduce((sum, ap) => sum + (ap.vidaUtil || 0), 0) / aparatos.length).toFixed(1)} años
                </td>

                {/* Fases */}
                <td className="p-3 border-x border-slate-800/40 bg-slate-950/20 text-center">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-red-400">
                      {fasesUnit === 'A' ? fasesDisplayTotal.A.toFixed(2) : Math.round(fasesDisplayTotal.A).toLocaleString()} {fasesUnit}
                    </span>
                    <span className="text-amber-400">
                      {fasesUnit === 'A' ? fasesDisplayTotal.B.toFixed(2) : Math.round(fasesDisplayTotal.B).toLocaleString()} {fasesUnit}
                    </span>
                    <span className="text-blue-400">
                      {fasesUnit === 'A' ? fasesDisplayTotal.C.toFixed(2) : Math.round(fasesDisplayTotal.C).toLocaleString()} {fasesUnit}
                    </span>
                  </div>
                </td>
                
                {/* Balanceador y desbalance */}
                <td colSpan="8" className="p-3 text-right">
                  <div className="flex items-center gap-3 justify-end">
                    <span className="text-slate-400 font-sans text-[10px]">
                      Desbalanceo UVIE: <span className={desbalanceSuperado ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{desbalance.toFixed(2)}%</span>
                    </span>
                    
                    {/* Botón de Balanceador dinámico */}
                    {acometidaId !== 'monofasico' && (
                      <button
                        onClick={onBalancearFases}
                        disabled={balancingConfigsCount === 0}
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 select-none no-print ${
                          balancingConfigsCount === 0
                            ? 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-md hover:shadow-emerald-500/20 active:scale-95'
                        }`}
                        title={balancingConfigsCount > 0 ? `Optimizar balanceo de fases (${balancingConfigsCount} combinaciones)` : 'Fases perfectamente balanceadas (<5%)'}
                      >
                        <ArrowRightLeft size={12} />
                        {balancingConfigsCount > 0 ? `Balancear (${balancingConfigsCount})` : 'Balanceado'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
