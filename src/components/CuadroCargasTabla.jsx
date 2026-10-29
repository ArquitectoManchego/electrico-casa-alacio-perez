import React from 'react';
import { ShieldAlert, Info, Trash2, ArrowRightLeft, DollarSign, AlertTriangle, Gauge } from 'lucide-react';
import { 
  calcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor,
  calcularCaidaTension,
  calcularDesbalanceUVIE
} from '../utils/ecuacionesUVIE';
import {
  determinarAcometidaMedidor,
  normalizarFaseParaMedidor,
  distribuirCargaPorFases
} from '../utils/electricalCalculations';

export default function CuadroCargasTabla({ 
  aparatos = [], 
  acometidaId = 'monofasico', 
  fasesDisponibles = ['A'], 
  desbalance = 0, 
  onUpdateFase, 
  onToggleFaseCircuito,
  onDeleteAparato,
  onUpdateAparatoProps,
  onBalancearFases,
  onBalancearMedidor,
  onToggleFaseMedidor,
  balancingConfigsCount = 0,
  fasesUnit = 'VA',
  onChangeFasesUnit,
  medidores = [],
  medidoresData = {}
}) {
  const [medidorFiltro, setMedidorFiltro] = React.useState('todos');

  // Asegurar lista válida de medidores
  const listaMedidores = Array.isArray(medidores) && medidores.length > 0
    ? medidores
    : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }];

  const defaultMedId = listaMedidores[0].id;
  const knownIds = new Set(listaMedidores.map(m => m.id));

  const medidoresMap = new Map();
  listaMedidores.forEach(m => {
    medidoresMap.set(m.id, m.nombre || `Medidor ${m.numero}`);
  });

  // Agrupar aparatos por medidor (incluyendo huérfanos en el primer medidor)
  const gruposPorMedidor = listaMedidores.map((med, idx) => {
    const aps = aparatos.filter(ap => {
      const mId = ap.medidorId && knownIds.has(ap.medidorId) ? ap.medidorId : defaultMedId;
      return mId === med.id;
    });
    const dataMed = medidoresData?.[med.id];
    const acometidaMed = dataMed?.acometida || determinarAcometidaMedidor(med, aps);
    return {
      medidor: med,
      idx,
      aparatos: aps,
      acometidaMed
    };
  });

  // Calcular la suma global de cargas por fase respetando estrictamente las fases habilitadas de cada medidor
  const fasesDisplayTotal = { A: 0, B: 0, C: 0 };
  const medidoresConDesbalance = [];

  gruposPorMedidor.forEach(({ medidor, aparatos: apsMed, acometidaMed }) => {
    const fVAMed = { A: 0, B: 0, C: 0 };
    apsMed.forEach(ap => {
      const dist = distribuirCargaPorFases(ap, acometidaMed);
      fVAMed.A += dist.fVA.A;
      fVAMed.B += dist.fVA.B;
      fVAMed.C += dist.fVA.C;

      ['A', 'B', 'C'].forEach(f => {
        if (fasesUnit === 'VA') {
          fasesDisplayTotal[f] += dist.fVA[f];
        } else if (fasesUnit === 'W') {
          fasesDisplayTotal[f] += dist.fLoad[f];
        } else if (fasesUnit === 'A') {
          fasesDisplayTotal[f] += dist.fAmps[f];
        }
      });
    });

    if ((acometidaMed.fasesDisponibles?.length || 1) > 1 && apsMed.length > 0) {
      const desbalMed = calcularDesbalanceUVIE(
        fVAMed.A,
        fVAMed.B,
        fVAMed.C,
        acometidaMed.id,
        acometidaMed.fasesDisponibles
      );
      if (desbalMed > 5.0) {
        medidoresConDesbalance.push({
          id: medidor.id,
          nombre: medidor.nombre || `Medidor ${medidor.numero}`,
          desbalance: desbalMed
        });
      }
    }
  });

  const maxDesbalanceMedidores = medidoresConDesbalance.length > 0
    ? Math.max(...medidoresConDesbalance.map(m => m.desbalance))
    : (listaMedidores.length === 1 ? desbalance : 0);

  const desbalanceSuperado = listaMedidores.length > 1
    ? medidoresConDesbalance.length > 0
    : (desbalance > 5.0 && acometidaId !== 'monofasico');

  if (aparatos.length === 0) {
    return null;
  }

  // Totales financieros globales
  const totalPrecio = aparatos.reduce((sum, ap) => sum + (parseFloat(ap.precio) || 0), 0);
  const totalMantenimiento = aparatos.reduce((sum, ap) => sum + (parseFloat(ap.mantenimiento) || 0), 0);

  const gruposFiltrados = medidorFiltro === 'todos' 
    ? gruposPorMedidor 
    : gruposPorMedidor.filter(g => g.medidor.id === medidorFiltro);

  let runningGlobalIndex = 0;

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
          top: 110%;
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
          transition-delay: 1s;
          pointer-events: none;
          text-transform: none;
        }
        .tooltip-content::after {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: transparent transparent #0f172a transparent;
        }
        .tooltip-container:hover .tooltip-content {
          visibility: visible;
          opacity: 1;
        }
      `}</style>

      {/* Banner de Alerta UVIE */}
      {desbalanceSuperado && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 animate-pulse-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 glow-red">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 flex-shrink-0 animate-bounce text-rose-500" size={20} />
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wide">
                Incumplimiento Normativo UVIE - Desbalanceo Máximo: {maxDesbalanceMedidores.toFixed(2)}%
              </h4>
              <p className="text-xs mt-1 leading-relaxed text-rose-300 font-sans">
                {medidoresConDesbalance.length > 0 ? (
                  <>
                    Medidores fuera del límite del 5.0% NOM-001-SEDE:{' '}
                    <strong>{medidoresConDesbalance.map(m => `${m.nombre} (${m.desbalance.toFixed(1)}%)`).join(', ')}</strong>.
                  </>
                ) : (
                  <>El desbalanceo entre fases excede el 5.0% permitido por la NOM-001-SEDE.</>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBalancearFases}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-center whitespace-nowrap transition-all active:scale-95 no-print"
          >
            <ArrowRightLeft size={13} />
            Balancear Todos los Medidores
          </button>
        </div>
      )}

      {/* Selector de Medidor para Cuadro de Cargas */}
      {listaMedidores.length > 1 && (
        <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 bg-slate-900/40 no-print">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Filtrar Instalación por Medidor:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMedidorFiltro('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                medidorFiltro === 'todos'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>Todos los Medidores ({aparatos.length} cargas)</span>
            </button>

            {listaMedidores.map(med => {
              const count = aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === med.id).length;
              return (
                <button
                  key={med.id}
                  onClick={() => setMedidorFiltro(med.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    medidorFiltro === med.id
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{med.nombre || `Medidor ${med.numero}`}</span>
                  <span className="text-[10px] opacity-80 font-mono">({count})</span>
                </button>
              );
            })}
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
              Copia interactiva dividida por medidor. Haz clic directamente en los textos/valores para editarlos en tiempo real.
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 flex items-center gap-1 font-sans">
            <Info size={11} />
            Art. 210 y 220
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase bg-slate-950/40">
                <th className="p-3 w-[45px] text-center">#</th>
                <th className="p-3 w-[110px] text-center tooltip-container">
                  Medidor
                  <div className="tooltip-content">
                    <strong>Medidor CFE:</strong> Medidor asignado a este circuito o aparato para facturación e instalación independiente.
                  </div>
                </th>
                <th className="p-3 w-[180px] tooltip-container">
                  Circuito / Equipo
                  <div className="tooltip-content">
                    <strong>Circuito / Equipo:</strong> Nombre descriptivo y modelo del equipo eléctrico o circuito derivado registrado.
                  </div>
                </th>
                <th className="p-3 w-[75px] tooltip-container">
                  Tensión
                  <div className="tooltip-content">
                    <strong>Tensión:</strong> Voltaje de operación del circuito. 127V para monofásicas; 220V para bifásicas y trifásicas en México.
                  </div>
                </th>
                <th className="p-3 w-[95px] text-right tooltip-container">
                  Watts (P)
                  <div className="tooltip-content">
                    <strong>Watts (Potencia Activa):</strong> Representa la energía real útil consumida y transformada en trabajo (calor, movimiento, luz).
                  </div>
                </th>
                <th className="p-3 w-[65px] text-center tooltip-container">
                  F.P.
                  <div className="tooltip-content">
                    <strong>F.P. (Factor de Potencia):</strong> Relación entre potencia activa (W) y aparente (VA). Mide la eficiencia (valores menores a 0.90 pueden generar multas).
                  </div>
                </th>
                <th className="p-3 w-[95px] text-right tooltip-container">
                  VA (S)
                  <div className="tooltip-content">
                    <strong>Volt-Amperios (Potencia Aparente):</strong> Potencia total entregada por la red (VA = Watts / F.P.). Se usa para dimensionar conductores y transformadores.
                  </div>
                </th>
                <th className="p-3 w-[95px] text-right text-emerald-450 tooltip-container">
                  Precio (MXN)
                  <div className="tooltip-content">
                    <strong>Precio de Compra:</strong> Costo inicial (CapEx) estimado del electrodoméstico o equipo para el análisis de ciclo de vida.
                  </div>
                </th>
                <th className="p-3 w-[95px] text-right text-amber-500 tooltip-container">
                  Mant. Anual
                  <div className="tooltip-content">
                    <strong>Mantenimiento Anual:</strong> Costo de operación preventivo/correctivo anualizado estimado del aparato (OpEx).
                  </div>
                </th>
                <th className="p-3 w-[75px] text-center text-slate-300 tooltip-container">
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
                <th className="p-3 text-right w-[75px] tooltip-container">
                  In (A)
                  <div className="tooltip-content">
                    <strong>In (Corriente Nominal):</strong> Intensidad de corriente en Amperios calculada a carga plena en condiciones normales de operación.
                  </div>
                </th>
                <th className="p-3 text-right w-[75px] tooltip-container">
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
                <th className="p-3 text-center w-[85px] tooltip-container">
                  Longitud (m)
                  <div className="tooltip-content">
                    <strong>Longitud (m):</strong> Distancia lineal desde el centro de carga hasta el equipo receptor.
                  </div>
                </th>
                <th className="p-3 text-center w-[95px] tooltip-container font-semibold">
                  % Caída V
                  <div className="tooltip-content">
                    <strong>% Caída de Tensión:</strong> Pérdida de voltaje en el trayecto. Debe ser menor al 3.00% bajo la NOM-001-SEDE.
                  </div>
                </th>
                <th className="p-3 text-center w-[90px] no-print">Acciones</th>
              </tr>
              <tr className="border-b border-slate-800/60 text-[9px] font-bold text-slate-500 bg-slate-950/10">
                <th colSpan="10"></th>
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
              {gruposFiltrados.map(({ medidor, aparatos: apsGrupo, acometidaMed }) => {
                const fasesMed = acometidaMed?.fasesDisponibles || ['A'];

                // Calcular subtotales para este medidor usando la distribución canónica por fases habilitadas
                let subTotalW = 0;
                let subTotalVA = 0;
                let subTotalPrecio = 0;
                let subTotalMantenimiento = 0;
                let subSumaVida = 0;
                const subFasesBaseVA = { A: 0, B: 0, C: 0 };
                const subFasesDisplay = { A: 0, B: 0, C: 0 };

                apsGrupo.forEach(ap => {
                  const dist = distribuirCargaPorFases(ap, acometidaMed);
                  subTotalW += dist.watts;
                  subTotalVA += dist.va;
                  subTotalPrecio += (parseFloat(ap.precio) || 0);
                  subTotalMantenimiento += (parseFloat(ap.mantenimiento) || 0);
                  subSumaVida += (parseFloat(ap.vidaUtil) || 0);

                  ['A', 'B', 'C'].forEach(f => {
                    subFasesBaseVA[f] += dist.fVA[f];
                    if (fasesUnit === 'VA') {
                      subFasesDisplay[f] += dist.fVA[f];
                    } else if (fasesUnit === 'W') {
                      subFasesDisplay[f] += dist.fLoad[f];
                    } else if (fasesUnit === 'A') {
                      subFasesDisplay[f] += dist.fAmps[f];
                    }
                  });
                });

                const subDesbalance = calcularDesbalanceUVIE(
                  subFasesBaseVA.A,
                  subFasesBaseVA.B,
                  subFasesBaseVA.C,
                  acometidaMed.id,
                  fasesMed
                );
                const subPromedioVida = apsGrupo.length > 0 ? (subSumaVida / apsGrupo.length).toFixed(1) : '0';

                return (
                  <React.Fragment key={medidor.id}>
                    {/* Encabezado del grupo de Medidor (cuando hay múltiples medidores) */}
                    {listaMedidores.length > 1 && (
                      <tr className="bg-slate-900/80 border-t-2 border-b border-teal-500/40 text-xs font-sans">
                        <td colSpan={19} className="p-2.5 px-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Gauge size={14} className="text-teal-400" />
                              <span className="font-bold text-white uppercase tracking-wider">{medidor.nombre || `Medidor ${medidor.numero}`}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono">
                                {apsGrupo.length} {apsGrupo.length === 1 ? 'circuito' : 'circuitos'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                                Fases activas: {fasesMed.join(', ')} ({acometidaMed.id === 'trifasico' ? '3F' : acometidaMed.id === 'bifasico' ? '2F' : '1F'})
                              </span>
                            </div>
                            <button
                              onClick={() => onBalancearMedidor ? onBalancearMedidor(medidor.id) : onBalancearFases()}
                              type="button"
                              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 shadow-xs no-print"
                              title={`Balancear fases de ${medidor.nombre || `Medidor ${medidor.numero}`}`}
                            >
                              <ArrowRightLeft size={10} />
                              Balancear {medidor.nombre || `Medidor ${medidor.numero}`}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Si no hay aparatos en este medidor */}
                    {apsGrupo.length === 0 && (
                      <tr className="hover:bg-slate-900/10">
                        <td colSpan={19} className="p-4 text-center text-slate-500 italic font-sans text-xs">
                          No hay circuitos asignados a {medidor.nombre || `Medidor ${medidor.numero}`}. Puedes asignar aparatos usando el selector de medidor en el formulario de arriba o en la columna "Medidor".
                        </td>
                      </tr>
                    )}

                    {/* Filas de aparatos de este medidor */}
                    {apsGrupo.map((ap) => {
                      runningGlobalIndex += 1;
                      const currentIndex = runningGlobalIndex;
                      const dist = distribuirCargaPorFases(ap, acometidaMed);
                      const va = dist.va;
                      const faseNorm = dist.faseNorm;

                      const tipoEfectivo = acometidaMed.id === 'monofasico'
                        ? 'monofasica'
                        : (ap.tipoCarga === 'trifasica' && acometidaMed.id !== 'trifasico' ? 'bifasica' : ap.tipoCarga);
                      const tension = tipoEfectivo === 'monofasica' ? 127 : 220;
                      const inominal = calcularCorrienteNominal(va, tipoEfectivo);
                      const icorregida = calcularCorrienteCorregida(inominal);

                      const autoProteccion = seleccionarProteccion(icorregida);
                      const activeProteccion = ap.overrideBreaker && ap.overrideBreaker !== 'Auto' ? parseInt(ap.overrideBreaker) : autoProteccion;

                      const autoConductor = seleccionarConductor(activeProteccion);
                      const activeConductor = ap.overrideCable && ap.overrideCable !== 'Auto' ? ap.overrideCable : autoConductor;

                      const displayFila = { A: 0, B: 0, C: 0 };
                      ['A', 'B', 'C'].forEach(f => {
                        if (fasesUnit === 'VA') {
                          displayFila[f] = dist.fVA[f];
                        } else if (fasesUnit === 'W') {
                          displayFila[f] = dist.fLoad[f];
                        } else if (fasesUnit === 'A') {
                          displayFila[f] = dist.fAmps[f];
                        }
                      });

                      return (
                        <tr key={ap.id} className="hover:bg-slate-900/10 transition-colors">
                          {/* Número secuencial */}
                          <td className="p-3 text-center text-slate-500 font-mono font-semibold">
                            {currentIndex}
                          </td>

                          {/* Medidor selector */}
                          <td className="p-2 text-center no-print">
                            {listaMedidores.length > 1 ? (
                              <select
                                value={ap.medidorId || listaMedidores[0].id}
                                onChange={(e) => onUpdateAparatoProps(ap.id, { medidorId: e.target.value })}
                                className="bg-slate-900 text-teal-400 border border-slate-700/80 rounded px-1.5 py-0.5 text-[10px] font-mono cursor-pointer focus:ring-1 focus:ring-teal-500 max-w-[105px] truncate"
                                title="Cambiar asignación de medidor CFE"
                              >
                                {listaMedidores.map(m => (
                                  <option key={m.id} value={m.id}>{m.nombre || `Medidor ${m.numero}`}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[10px] text-teal-400 font-mono font-semibold">
                                {listaMedidores[0].nombre || 'Medidor 1'}
                              </span>
                            )}
                            <span className="print:inline hidden text-[9px] font-mono text-slate-400">
                              {medidoresMap.get(ap.medidorId || listaMedidores[0].id) || 'M-1'}
                            </span>
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
                                    if (newTipo === 'bifasica') {
                                      updates.fase = fasesMed.length >= 2 ? `${fasesMed[0]}-${fasesMed[1]}` : 'A-B';
                                    } else if (newTipo === 'monofasica') {
                                      updates.fase = fasesMed[0] || 'A';
                                    } else if (newTipo === 'trifasica') {
                                      updates.fase = 'A-B-C';
                                    }
                                    onUpdateAparatoProps(ap.id, updates);
                                  }}
                                  className="bg-transparent border-none text-[9px] text-slate-400 font-mono focus:ring-1 focus:ring-teal-500 rounded p-0 m-0 cursor-pointer focus:bg-slate-950/50 no-print"
                                  title="Cambiar tipo de conexión de carga (Monofásica, Bifásica o Trifásica)"
                                >
                                  <option value="monofasica" className="bg-slate-900 text-slate-300">1F-1N (127V)</option>
                                  <option value="bifasica" className="bg-slate-900 text-slate-300">2F-0N (220V)</option>
                                  <option value="trifasica" className="bg-slate-900 text-slate-300">3F-0N (220V)</option>
                                </select>
                                <span className="print:inline hidden">
                                  {tipoEfectivo === 'monofasica' ? '1F-1N' : tipoEfectivo === 'bifasica' ? '2F-0N' : '3F-0N'}
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

                          {/* Desglose por Fases Interactivo (Solo fases habilitadas en el medidor) */}
                          <td className="p-2 border-x border-slate-800/40 bg-slate-950/10 text-center select-none">
                            <div className="grid grid-cols-3 gap-1">
                              {['A', 'B', 'C'].map((fase) => {
                                const isAvailableInMed = fasesMed.includes(fase);
                                const val = isAvailableInMed ? (displayFila[fase] || 0) : 0;
                                const isActive = isAvailableInMed && (val > 0 || faseNorm.split('-').includes(fase));

                                if (!isAvailableInMed) {
                                  return (
                                    <button
                                      key={fase}
                                      type="button"
                                      disabled
                                      className="py-1 px-0.5 rounded text-[10px] font-mono border border-dashed border-slate-800/60 bg-slate-950/40 text-slate-700 opacity-40 cursor-not-allowed flex flex-col items-center justify-center min-h-[30px]"
                                      title={`Fase ${fase} deshabilitada en ${medidor.nombre || `Medidor ${medidor.numero}`}. Actívala arriba en Distribución de Carga por Fase si requiere 3 fases.`}
                                    >
                                      <span className="text-[9px] font-sans leading-none">{fase}</span>
                                      <span className="font-semibold leading-tight text-[9.5px]">-</span>
                                    </button>
                                  );
                                }

                                const colorStyles = fase === 'A'
                                  ? (isActive ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-xs shadow-red-500/10' : 'text-slate-600 hover:text-red-400 hover:border-red-500/30')
                                  : fase === 'B'
                                    ? (isActive ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-xs shadow-amber-500/10' : 'text-slate-600 hover:text-amber-400 hover:border-amber-500/30')
                                    : (isActive ? 'bg-blue-500/25 text-blue-300 border-blue-500/50 shadow-xs shadow-blue-500/10' : 'text-slate-600 hover:text-blue-400 hover:border-blue-500/30');

                                return (
                                  <button
                                    key={fase}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onToggleFaseCircuito) {
                                        onToggleFaseCircuito(ap.id, fase);
                                      } else if (onUpdateFase) {
                                        onUpdateFase(ap.id, fase);
                                      }
                                    }}
                                    className={`py-1 px-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[30px] ${
                                      isActive 
                                        ? `${colorStyles} font-bold` 
                                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                                    }`}
                                    title={
                                      isActive 
                                        ? `Fase ${fase} activa (${fasesUnit === 'A' ? val.toFixed(1) : Math.round(val)} ${fasesUnit}). Clic para alternar entre fases habilitadas.` 
                                        : `Fase ${fase} habilitada sin carga en este circuito. Clic para mover carga a Fase ${fase}.`
                                    }
                                  >
                                    <span className="text-[9px] opacity-75 font-sans leading-none">{fase}</span>
                                    <span className="font-semibold leading-tight text-[9.5px]">
                                      {val > 0 
                                        ? (fasesUnit === 'A' ? val.toFixed(1) : Math.round(val)) 
                                        : '-'}
                                    </span>
                                  </button>
                                );
                              })}
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
                              {tipoEfectivo === 'monofasica' ? '1x' : tipoEfectivo === 'bifasica' ? '2x' : '3x'}{activeProteccion}A{ap.overrideBreaker && ap.overrideBreaker !== 'Auto' && '*'} / {ap.kaic || '10 kA'}
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
                                inominal,
                                tipoEfectivo,
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
                              {((tipoEfectivo === 'monofasica' && fasesMed.length > 1) || 
                                (tipoEfectivo === 'bifasica' && fasesMed.length >= 3)) && (
                                <button
                                  onClick={() => {
                                    if (tipoEfectivo === 'monofasica') {
                                      const currentIdx = fasesMed.indexOf(faseNorm);
                                      const nextIdx = (currentIdx + 1) % fasesMed.length;
                                      onUpdateFase(ap.id, fasesMed[nextIdx]);
                                    } else {
                                      const combos = ['A-B', 'B-C', 'A-C'].filter(par =>
                                        par.split('-').every(p => fasesMed.includes(p))
                                      );
                                      const currentIdx = combos.indexOf(faseNorm);
                                      const nextIdx = (currentIdx + 1) % combos.length;
                                      onUpdateFase(ap.id, combos[nextIdx] || 'A-B');
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                                  title="Rotar entre las fases habilitadas del medidor"
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

                    {/* Fila de Totales del Medidor */}
                    <tr className="bg-slate-900/40 border-t border-b border-slate-800 text-[11px] font-bold text-slate-300 font-mono">
                      <td className="p-2.5 text-center text-teal-400">∑</td>
                      <td className="p-2.5 text-teal-300 font-sans font-bold text-[10px] uppercase truncate">
                        {medidor.nombre || `Medidor ${medidor.numero}`}
                      </td>
                      <td className="p-2.5 text-slate-400 font-sans text-[10px]">
                        SUBTOTAL ({apsGrupo.length} {apsGrupo.length === 1 ? 'aparato' : 'aparatos'})
                      </td>
                      <td className="p-2.5"></td>
                      <td className="p-2.5 text-right text-slate-100">{Math.round(subTotalW).toLocaleString()} W</td>
                      <td className="p-2.5"></td>
                      <td className="p-2.5 text-right text-cyan-400">{Math.round(subTotalVA).toLocaleString()} VA</td>
                      <td className="p-2.5 text-right text-emerald-450">${Math.round(subTotalPrecio).toLocaleString()}</td>
                      <td className="p-2.5 text-right text-amber-500">${Math.round(subTotalMantenimiento).toLocaleString()}</td>
                      <td className="p-2.5 text-center text-slate-400">{subPromedioVida}a</td>
                      <td className="p-2.5 border-x border-slate-800/40 bg-slate-950/20 text-center">
                        <div className="grid grid-cols-3 gap-1">
                          <span className={fasesMed.includes('A') ? 'text-red-400' : 'text-slate-600 opacity-50'}>
                            {fasesMed.includes('A')
                              ? (fasesUnit === 'A' ? subFasesDisplay.A.toFixed(2) : Math.round(subFasesDisplay.A).toLocaleString())
                              : '-'}
                          </span>
                          <span className={fasesMed.includes('B') ? 'text-amber-400' : 'text-slate-600 opacity-50'}>
                            {fasesMed.includes('B')
                              ? (fasesUnit === 'A' ? subFasesDisplay.B.toFixed(2) : Math.round(subFasesDisplay.B).toLocaleString())
                              : '-'}
                          </span>
                          <span className={fasesMed.includes('C') ? 'text-blue-400' : 'text-slate-600 opacity-50'}>
                            {fasesMed.includes('C')
                              ? (fasesUnit === 'A' ? subFasesDisplay.C.toFixed(2) : Math.round(subFasesDisplay.C).toLocaleString())
                              : '-'}
                          </span>
                        </div>
                      </td>
                      <td colSpan={8} className="p-2.5 text-right">
                        <div className="flex items-center gap-3 justify-end">
                          <span className="text-slate-400 font-sans text-[10px]">
                            Desbalance: <span className={subDesbalance > 5.0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{subDesbalance.toFixed(2)}%</span>
                          </span>
                          <button
                            onClick={() => onBalancearMedidor ? onBalancearMedidor(medidor.id) : onBalancearFases()}
                            type="button"
                            className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 shadow-xs no-print"
                            title={`Balancear cargas de ${medidor.nombre || `Medidor ${medidor.numero}`}`}
                          >
                            <ArrowRightLeft size={10} />
                            ⚡ Balancear Cargas ({medidor.nombre || `Medidor ${medidor.numero}`})
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Fila separadora entre medidores */}
                    <tr className="h-4 bg-slate-950/60 no-print">
                      <td colSpan={19}></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Totales Globales del Cuadro de Cargas */}
            <tfoot>
              <tr className="border-t-2 border-slate-700 text-[11px] font-bold text-slate-200 bg-slate-900/60 font-mono">
                <td className="p-3 text-center text-slate-500 font-semibold">-</td>
                <td className="p-3 text-teal-400 uppercase font-sans font-black text-[10px]">PROYECTO</td>
                <td className="p-3 text-white font-black">TOTAL PROYECTO COMPLETO</td>
                <td className="p-3"></td>
                <td className="p-3 text-right text-emerald-400 font-black">
                  {Math.round(aparatos.reduce((s, a) => s + (parseFloat(a.watts) || 0), 0)).toLocaleString()} W
                </td>
                <td className="p-3"></td>
                <td className="p-3 text-right text-cyan-400 font-black">
                  {Math.round(aparatos.reduce((s, a) => s + calcularVA(a.watts, a.fp, a.usarVaDirecto), 0)).toLocaleString()} VA
                </td>
                
                {/* Total Precio */}
                <td className="p-3 text-right text-emerald-450 font-black">
                  ${Math.round(totalPrecio).toLocaleString()} MXN
                </td>

                {/* Total Mantenimiento */}
                <td className="p-3 text-right text-amber-500 font-black">
                  ${Math.round(totalMantenimiento).toLocaleString()} MXN
                </td>

                {/* Promedio de Vida útil */}
                <td className="p-3 text-center text-slate-300 font-semibold">
                  {(aparatos.reduce((sum, ap) => sum + (parseFloat(ap.vidaUtil) || 0), 0) / (aparatos.length || 1)).toFixed(1)} años
                </td>

                {/* Fases */}
                <td className="p-3 border-x border-slate-800/40 bg-slate-950/20 text-center">
                  <div className="grid grid-cols-3 gap-1 font-black">
                    <span className="text-red-400">
                      {fasesUnit === 'A' ? fasesDisplayTotal.A.toFixed(2) : Math.round(fasesDisplayTotal.A).toLocaleString()} {fasesUnit}
                    </span>
                    <span className="text-amber-400">
                      {fasesUnit === 'A' ? fasesDisplayTotal.B.toFixed(2) : Math.round(fasesDisplayTotal.B).toLocaleString()} {fasesUnit}
                    </span>
                    <span className={fasesDisplayTotal.C > 0 ? 'text-blue-400' : 'text-slate-600 opacity-60'}>
                      {fasesDisplayTotal.C > 0
                        ? `${fasesUnit === 'A' ? fasesDisplayTotal.C.toFixed(2) : Math.round(fasesDisplayTotal.C).toLocaleString()} ${fasesUnit}`
                        : '-'}
                    </span>
                  </div>
                </td>
                
                {/* Balanceador y desbalance */}
                <td colSpan="8" className="p-3 text-right">
                  <div className="flex items-center gap-3 justify-end">
                    <span className="text-slate-400 font-sans text-[10px]">
                      {listaMedidores.length > 1 ? 'Desbalance Máx. por Medidor:' : 'Desbalance Global UVIE:'}{' '}
                      <span className={desbalanceSuperado ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {desbalance.toFixed(2)}%
                      </span>
                    </span>
                    
                    {/* Botón de Balanceador dinámico */}
                    <button
                      onClick={onBalancearFases}
                      disabled={balancingConfigsCount === 0 && !desbalanceSuperado}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 select-none no-print ${
                        balancingConfigsCount === 0 && !desbalanceSuperado
                          ? 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-md hover:shadow-emerald-500/20 active:scale-95'
                      }`}
                      title={balancingConfigsCount > 0 || desbalanceSuperado ? 'Optimizar balanceo de fases en cada medidor independiente' : 'Todos los medidores están balanceados (≤5%)'}
                    >
                      <ArrowRightLeft size={12} />
                      {balancingConfigsCount > 0 || desbalanceSuperado ? 'Balancear Todos' : 'Balanceado'}
                    </button>
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
