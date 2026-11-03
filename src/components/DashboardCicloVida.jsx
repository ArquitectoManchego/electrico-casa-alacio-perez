import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  Settings2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Link as LinkIcon, 
  Building2,
  HelpCircle,
  Cpu,
  Zap,
  Info
} from 'lucide-react';
import { NEGOCIOS_CONFIG } from '../utils/equiposNegocios';
import { 
  CATALOGO_PARTES_DEFECTO, 
  detectarFamiliaPartes, 
  generarPiezasInicialesAparato,
  calcularMetricasEquipoCicloVida,
  calcularCicloVidaNegocio
} from '../utils/motorCicloVidaMantenimiento';

export default function DashboardCicloVida({
  aparatos = [],
  proyectoId = 'consorcio_general',
  medidores = [],
  onActualizarAparato,
  onAddAparato
}) {
  const esConsorcio = proyectoId === 'consorcio_general';

  // Negocio seleccionado para el análisis (por defecto el primero o el coincidente)
  const [negocioActivoId, setNegocioActivoId] = useState(() => {
    if (!esConsorcio && proyectoId) {
      const match = NEGOCIOS_CONFIG.find(n => n.id === proyectoId);
      return match ? match.id : 'hawaiian_paradise';
    }
    return 'hawaiian_paradise';
  });

  // Vista de negocio ('individual' | 'consolidado')
  const [vistaConsolidada, setVistaConsolidada] = useState(false);

  // Estado para expandir/colapsar el detalle de piezas de cada equipo
  const [equiposExpandidos, setEquiposExpandidos] = useState({});

  // Formulario abierto para añadir pieza a un equipo específico (aparatoId | null)
  const [equipoAgregandoPiezaId, setEquipoAgregandoPiezaId] = useState(null);

  // Piezas personalizadas guardadas por aparato en localStorage
  const storageKey = `sge_ciclo_vida_piezas_v1_${proyectoId}`;
  const [overridesPiezas, setOverridesPiezas] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(overridesPiezas));
    } catch (e) {}
  }, [overridesPiezas, storageKey]);

  // Sincronizar negocio si cambia el proyecto general
  useEffect(() => {
    if (proyectoId && proyectoId !== 'consorcio_general') {
      const match = NEGOCIOS_CONFIG.find(n => n.id === proyectoId);
      if (match) {
        setNegocioActivoId(match.id);
        setVistaConsolidada(false);
      }
    }
  }, [proyectoId]);

  // Estado para vincular el mantenimiento con los costos de operación del negocio
  const [vincularConCostosOperacion, setVincularConCostosOperacion] = useState(() => {
    try {
      return localStorage.getItem('sge_vincular_mantenimiento_finanzas') !== 'false';
    } catch (e) {
      return true;
    }
  });

  const handleToggleVincular = () => {
    const nuevo = !vincularConCostosOperacion;
    setVincularConCostosOperacion(nuevo);
    try {
      localStorage.setItem('sge_vincular_mantenimiento_finanzas', nuevo.toString());
    } catch (e) {}
  };

  // Estado del nuevo componente / pieza que se está agregando
  const [nuevaPiezaForm, setNuevaPiezaForm] = useState({
    nombre: '',
    tipo: 'desgaste', // 'desgaste' | 'preventivo' | 'correctivo'
    frecuenciaMeses: 6,
    costoPieza: 300,
    costoManoObra: 150,
    descripcion: '',
    sintomaFalla: ''
  });

  // Negocio actual
  const negocioActual = NEGOCIOS_CONFIG.find(n => n.id === negocioActivoId) || NEGOCIOS_CONFIG[0];

  // Cálculo de Ciclo de Vida para el negocio activo
  const analisisNegocioActivo = useMemo(() => {
    return calcularCicloVidaNegocio({
      negocioId: negocioActivoId,
      aparatos,
      overridesPiezas
    });
  }, [negocioActivoId, aparatos, overridesPiezas]);

  // Cálculo Consolidado de todos los 7 negocios
  const analisisConsolidado = useMemo(() => {
    let inversionTotal = 0;
    let desgasteTotalAnual = 0;
    let mantTotalAnual = 0;
    let preventivoTotal = 0;
    let refaccionesTotal = 0;
    const desglosePorNegocio = [];

    NEGOCIOS_CONFIG.forEach(neg => {
      const res = calcularCicloVidaNegocio({
        negocioId: neg.id,
        aparatos,
        overridesPiezas
      });
      inversionTotal += res.resumenFinanciero.totalInversionActivos;
      desgasteTotalAnual += res.resumenFinanciero.totalDesgasteAnual;
      mantTotalAnual += res.resumenFinanciero.totalMantenimientoAnual;
      preventivoTotal += res.resumenFinanciero.totalPreventivoAnual;
      refaccionesTotal += res.resumenFinanciero.totalRefaccionesAnual;

      desglosePorNegocio.push({
        negocio: neg,
        resumen: res.resumenFinanciero,
        numEquipos: res.numEquipos
      });
    });

    return {
      inversionTotal,
      desgasteTotalAnual,
      mantTotalAnual,
      preventivoTotal,
      refaccionesTotal,
      presupuestoTotalAnual: desgasteTotalAnual + mantTotalAnual,
      gastoMantenimientoMensual: mantTotalAnual / 12,
      reservaDesgasteMensual: desgasteTotalAnual / 12,
      costoOperativoTotalMensual: (desgasteTotalAnual + mantTotalAnual) / 12,
      desglosePorNegocio
    };
  }, [aparatos, overridesPiezas]);

  // Guardar en localStorage el costo de mantenimiento mensual por negocio para que Finanzas lo integre
  useEffect(() => {
    try {
      const mapaGastosMantenimiento = {};
      NEGOCIOS_CONFIG.forEach(neg => {
        const res = calcularCicloVidaNegocio({
          negocioId: neg.id,
          aparatos,
          overridesPiezas
        });
        mapaGastosMantenimiento[neg.id] = {
          mantenimientoMensual: res.resumenFinanciero.gastoMantenimientoMensual,
          desgasteMensual: res.resumenFinanciero.reservaDesgasteMensual,
          totalOperativoMensual: res.resumenFinanciero.costoOperativoTotalMensual,
          activo: vincularConCostosOperacion
        };
      });
      localStorage.setItem('sge_finanzas_mantenimiento_maquinaria_v1', JSON.stringify(mapaGastosMantenimiento));
    } catch (e) {}
  }, [aparatos, overridesPiezas, vincularConCostosOperacion]);

  // Handlers para manipular piezas
  const toggleExpandirEquipo = (apId) => {
    setEquiposExpandidos(prev => ({
      ...prev,
      [apId]: !prev[apId]
    }));
  };

  const handleEliminarPieza = (apId, piezaId) => {
    const ap = aparatos.find(a => a.id === apId);
    if (!ap) return;

    const piezasActuales = overridesPiezas[apId] || ap.piezasYComponentes || generarPiezasInicialesAparato(ap);
    const filtradas = piezasActuales.filter(p => p.id !== piezaId);

    setOverridesPiezas(prev => ({
      ...prev,
      [apId]: filtradas
    }));
  };

  const handleRestaurarPiezasDefault = (apId) => {
    const ap = aparatos.find(a => a.id === apId);
    if (!ap) return;

    setOverridesPiezas(prev => {
      const copia = { ...prev };
      delete copia[apId];
      return copia;
    });
  };

  const handleGuardarNuevaPieza = (apId) => {
    const ap = aparatos.find(a => a.id === apId);
    if (!ap || !nuevaPiezaForm.nombre.trim()) return;

    const piezasActuales = overridesPiezas[apId] || ap.piezasYComponentes || generarPiezasInicialesAparato(ap);
    const nueva = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nombre: nuevaPiezaForm.nombre.trim(),
      tipo: nuevaPiezaForm.tipo,
      frecuenciaMeses: Math.max(1, parseFloat(nuevaPiezaForm.frecuenciaMeses) || 6),
      costoPieza: parseFloat(nuevaPiezaForm.costoPieza) || 0,
      costoManoObra: parseFloat(nuevaPiezaForm.costoManoObra) || 0,
      descripcion: nuevaPiezaForm.descripcion.trim(),
      sintomaFalla: nuevaPiezaForm.sintomaFalla.trim()
    };

    setOverridesPiezas(prev => ({
      ...prev,
      [apId]: [...piezasActuales, nueva]
    }));

    setEquipoAgregandoPiezaId(null);
    setNuevaPiezaForm({
      nombre: '',
      tipo: 'desgaste',
      frecuenciaMeses: 6,
      costoPieza: 300,
      costoManoObra: 150,
      descripcion: '',
      sintomaFalla: ''
    });
    setEquiposExpandidos(prev => ({ ...prev, [apId]: true }));
  };

  const resumenVigente = vistaConsolidada ? {
    inversion: analisisConsolidado.inversionTotal,
    desgasteAnual: analisisConsolidado.desgasteTotalAnual,
    mantenimientoAnual: analisisConsolidado.mantTotalAnual,
    presupuestoAnual: analisisConsolidado.presupuestoTotalAnual,
    mantenimientoMensual: analisisConsolidado.gastoMantenimientoMensual,
    desgasteMensual: analisisConsolidado.reservaDesgasteMensual,
    totalMensual: analisisConsolidado.costoOperativoTotalMensual
  } : {
    inversion: analisisNegocioActivo.resumenFinanciero.totalInversionActivos,
    desgasteAnual: analisisNegocioActivo.resumenFinanciero.totalDesgasteAnual,
    mantenimientoAnual: analisisNegocioActivo.resumenFinanciero.totalMantenimientoAnual,
    presupuestoAnual: analisisNegocioActivo.resumenFinanciero.totalPresupuestoAnual,
    mantenimientoMensual: analisisNegocioActivo.resumenFinanciero.gastoMantenimientoMensual,
    desgasteMensual: analisisNegocioActivo.resumenFinanciero.reservaDesgasteMensual,
    totalMensual: analisisNegocioActivo.resumenFinanciero.costoOperativoTotalMensual
  };

  return (
    <div className="space-y-6">

      {/* ======================================================== */}
      {/* 1. ENCABEZADO Y PROPÓSITO DEL MÓDULO */}
      {/* ======================================================== */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-teal-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Wrench size={14} />
                Ingeniería de Planta & Mantenimiento
              </span>
              <button
                type="button"
                onClick={handleToggleVincular}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  vincularConCostosOperacion 
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <LinkIcon size={12} className={vincularConCostosOperacion ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{vincularConCostosOperacion ? 'Integrado al Costo de Operaciones' : 'Mantenimiento Desvinculado'}</span>
              </button>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Ciclo de Vida: Desgaste de Maquinaria, Refacciones y Mantenimiento
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1 max-w-3xl leading-relaxed">
              Analiza el costo de adquisición de cada equipo, su vida útil y el detalle de todas las partes que se desgastan, rompen o requieren recambio programado para calcular el <strong>fondo anual de mantenimiento</strong> e integrarlo directamente a los <strong>gastos fijos operativos</strong> de la tienda.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-right min-w-[210px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Fondo Mensual de Operación Técnica
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              ${Math.round(resumenVigente.totalMensual).toLocaleString('es-MX')}{' '}
              <span className="text-xs font-bold text-slate-400 font-sans">MXN/mes</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              (${Math.round(resumenVigente.mantenimientoMensual).toLocaleString()} refacciones + ${Math.round(resumenVigente.desgasteMensual).toLocaleString()} reposición)
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SELECTOR DE NEGOCIOS (SI ES CONSORCIO) */}
      {/* ======================================================== */}
      {esConsorcio && (
        <div className="bg-slate-900/60 p-2 rounded-2xl border border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin no-print">
          <button
            type="button"
            onClick={() => setVistaConsolidada(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              vistaConsolidada
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-extrabold shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 size={16} />
            Consolidado Consorcio (7 Negocios)
          </button>

          <div className="w-[1px] h-6 bg-slate-800 mx-1" />

          {NEGOCIOS_CONFIG.map(neg => {
            const isSelected = !vistaConsolidada && negocioActivoId === neg.id;
            return (
              <button
                key={neg.id}
                type="button"
                onClick={() => {
                  setVistaConsolidada(false);
                  setNegocioActivoId(neg.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium font-sans flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-teal-400 font-bold border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span>{neg.nombre}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-400 border border-slate-800">
                  {neg.medidorIdConsorcio.replace('med_', 'M')}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. RESUMEN FINANCIERO EJECUTIVO DEL NEGOCIO */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inversión en Activos */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Inversión en Maquinaria (CapEx)
          </span>
          <div className="text-xl font-black text-white font-mono mt-1">
            ${Math.round(resumenVigente.inversion).toLocaleString('es-MX')} MXN
          </div>
          <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">
            Valor de compra de los equipos productivos y climatización
          </span>
        </div>

        {/* Desgaste / Amortización Anual */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
            Desgaste Anual (Fondo de Reposición)
          </span>
          <div className="text-xl font-black text-amber-300 font-mono mt-1">
            ${Math.round(resumenVigente.desgasteAnual).toLocaleString('es-MX')}{' '}
            <span className="text-xs font-normal text-slate-400">/ año</span>
          </div>
          <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">
            ${Math.round(resumenVigente.desgasteMensual).toLocaleString()} MXN/mes para reponer máquinas cumplida su vida útil
          </span>
        </div>

        {/* Mantenimiento y Refacciones Anuales */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block">
            Presupuesto Refacciones & Servicios
          </span>
          <div className="text-xl font-black text-teal-300 font-mono mt-1">
            ${Math.round(resumenVigente.mantenimientoAnual).toLocaleString('es-MX')}{' '}
            <span className="text-xs font-normal text-slate-400">/ año</span>
          </div>
          <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">
            ${Math.round(resumenVigente.mantenimientoMensual).toLocaleString()} MXN/mes en recambios, afilados y servicio preventivo
          </span>
        </div>

        {/* Costo Operativo Total Integrado */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
            Gasto Operativo Mensual Total
          </span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            ${Math.round(resumenVigente.totalMensual).toLocaleString('es-MX')}{' '}
            <span className="text-xs font-normal text-slate-400">/ mes</span>
          </div>
          <span className="text-[11px] text-emerald-300/80 font-sans mt-0.5 block">
            {vincularConCostosOperacion 
              ? '✓ Imputado a gastos fijos y punto de equilibrio' 
              : 'Estimado técnico listo para vincular'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. VISTA CONSOLIDADA (TABLA DE TODAS LAS TIENDAS) */}
      {/* ======================================================== */}
      {vistaConsolidada ? (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 size={16} className="text-teal-400" />
            Matriz de Desgaste y Mantenimiento por Tienda / Unidad de Negocio
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Unidad de Negocio</th>
                  <th className="py-2.5 px-3">Medidor</th>
                  <th className="py-2.5 px-3 text-right">Inversión CapEx</th>
                  <th className="py-2.5 px-3 text-right">Desgaste Anual</th>
                  <th className="py-2.5 px-3 text-right">Mantenimiento Anual</th>
                  <th className="py-2.5 px-3 text-right">Presupuesto Anual</th>
                  <th className="py-2.5 px-3 text-right">Costo Operativo Mensual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-sans">
                {analisisConsolidado.desglosePorNegocio.map(item => (
                  <tr key={item.negocio.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200 block">{item.negocio.nombre}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.numEquipos} equipos registrados</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono text-[10px]">
                        {item.negocio.medidorIdConsorcio}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      ${Math.round(item.resumen.totalInversionActivos).toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-300">
                      ${Math.round(item.resumen.totalDesgasteAnual).toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-teal-300">
                      ${Math.round(item.resumen.totalMantenimientoAnual).toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                      ${Math.round(item.resumen.totalPresupuestoAnual).toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400">
                      ${Math.round(item.resumen.costoOperativoTotalMensual).toLocaleString()} MXN/mes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 5. VISTA DE EQUIPOS Y PARTES DE LA TIENDA ACTIVA */
        /* ======================================================== */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white font-display flex items-center gap-2">
                <Settings2 className="text-teal-400" size={18} />
                Inventario de Maquinaria y Despiece de Mantenimiento ({analisisNegocioActivo.equipos.length} Equipos)
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Desglose de refacciones críticas, frecuencias de cambio y costo anualizado para {negocioActual.nombre}.
              </p>
            </div>
          </div>

          {analisisNegocioActivo.equipos.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-dashed border-slate-800">
              <HelpCircle className="text-slate-600 mx-auto mb-2 animate-pulse" size={36} />
              <p className="text-sm font-bold text-slate-400 font-sans">No hay equipos asignados a este negocio.</p>
              <p className="text-xs text-slate-500 font-sans mt-1">Registra nuevos aparatos en el Cuadro de Cargas para ver su análisis de ciclo de vida.</p>
            </div>
          ) : (
            analisisNegocioActivo.equipos.map(eq => {
              const expandido = equiposExpandidos[eq.id] !== false; // por defecto expandido
              const agregandoPieza = equipoAgregandoPiezaId === eq.id;

              return (
                <div key={eq.id} className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-750 transition-all space-y-4">
                  {/* Encabezado del Equipo */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-teal-400 border border-slate-800 text-[10px] font-mono font-bold">
                          {eq.medidorId}
                        </span>
                        <h4 className="text-base font-extrabold text-white font-display">
                          {eq.nombre}
                        </h4>
                        {eq.modelo && (
                          <span className="text-xs text-slate-400 font-sans">({eq.modelo})</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
                        <span>Valor Compra: <strong className="text-slate-200">${eq.precioCompra.toLocaleString()} MXN</strong></span>
                        <span>•</span>
                        <span>Vida Útil: <strong className="text-slate-200">{eq.vidaUtilAnios} años</strong></span>
                        <span>•</span>
                        <span>Desgaste Anual: <strong className="text-amber-400">${Math.round(eq.desgasteAnual).toLocaleString()}/año</strong></span>
                      </div>
                    </div>

                    {/* Resumen de Costos y Botón de Despliegue */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-right">
                        <span className="text-[9px] font-mono text-slate-400 uppercase block">Costo Ciclo de Vida</span>
                        <div className="text-base font-black text-emerald-400 font-mono">
                          ${Math.round(eq.costoTotalCicloVidaAnual).toLocaleString()}{' '}
                          <span className="text-[10px] font-sans font-bold text-slate-400">/ año</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          (${Math.round(eq.costoTotalCicloVidaMensual).toLocaleString()} MXN/mes)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpandirEquipo(eq.id)}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                        title={expandido ? 'Colapsar detalles' : 'Expandir partes'}
                      >
                        {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Detalle de Partes y Componentes que se Descomponen */}
                  {expandido && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Activity size={14} className="text-teal-400" />
                          Partes Sujetas a Desgaste, Recambio y Mantenimiento ({eq.piezas.length}):
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestaurarPiezasDefault(eq.id)}
                            title="Restaurar catálogo sugerido de fábrica"
                            className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                          >
                            Restaurar piezas sugeridas
                          </button>
                          <button
                            type="button"
                            onClick={() => setEquipoAgregandoPiezaId(agregandoPieza ? null : eq.id)}
                            className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <PlusCircle size={13} />
                            Añadir Pieza / Mantenimiento
                          </button>
                        </div>
                      </div>

                      {/* Formulario Inline para Añadir Nueva Pieza */}
                      {agregandoPieza && (
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-500/30 space-y-3 animate-fadeIn">
                          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider font-mono">
                            Registrar Nueva Parte / Mantenimiento Programado
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="lg:col-span-2">
                              <label className="block text-[10px] text-slate-400 uppercase font-sans mb-1">Nombre de la Parte o Servicio</label>
                              <input
                                type="text"
                                placeholder="Ej. Rodamientos de motor, Faja dentada..."
                                value={nuevaPiezaForm.nombre}
                                onChange={(e) => setNuevaPiezaForm(prev => ({ ...prev, nombre: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-sans mb-1">Tipo de Tarea</label>
                              <select
                                value={nuevaPiezaForm.tipo}
                                onChange={(e) => setNuevaPiezaForm(prev => ({ ...prev, tipo: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              >
                                <option value="desgaste">Refacción por Desgaste</option>
                                <option value="preventivo">Mantenimiento Preventivo</option>
                                <option value="correctivo">Reparación Correctiva</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-sans mb-1">Frecuencia (Meses)</label>
                              <input
                                type="number"
                                min="1"
                                max="120"
                                value={nuevaPiezaForm.frecuenciaMeses}
                                onChange={(e) => setNuevaPiezaForm(prev => ({ ...prev, frecuenciaMeses: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-sans mb-1">Costo Refacción ($ MXN)</label>
                              <input
                                type="number"
                                min="0"
                                value={nuevaPiezaForm.costoPieza}
                                onChange={(e) => setNuevaPiezaForm(prev => ({ ...prev, costoPieza: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-sans mb-1">Costo Mano de Obra ($ MXN)</label>
                              <input
                                type="number"
                                min="0"
                                value={nuevaPiezaForm.costoManoObra}
                                onChange={(e) => setNuevaPiezaForm(prev => ({ ...prev, costoManoObra: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                              />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block text-[10px] text-slate-400 uppercase font-sans mb-1">Síntoma de Falla o Razón de Desgaste</label>
                              <input
                                type="text"
                                placeholder="Ej. Ruido, vibración, corte defectuoso..."
                                value={nuevaPiezaForm.sintomaFalla}
                                onChange={(e) => setNuevaPiezaForm(prev => ({ ...prev, sintomaFalla: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                            <button
                              type="button"
                              onClick={() => setEquipoAgregandoPiezaId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGuardarNuevaPieza(eq.id)}
                              className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs cursor-pointer"
                            >
                              Guardar Parte
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tabla / Listado de Partes */}
                      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-950/70 border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase">
                              <th className="py-2 px-3">Pieza / Componente / Servicio</th>
                              <th className="py-2 px-3">Tipo</th>
                              <th className="py-2 px-3 text-center">Frecuencia</th>
                              <th className="py-2 px-3 text-right">Costo Evento</th>
                              <th className="py-2 px-3 text-right">Veces / Año</th>
                              <th className="py-2 px-3 text-right">Costo Anual</th>
                              <th className="py-2 px-3 text-right">Costo Mensual</th>
                              <th className="py-2 px-2 text-center">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 font-sans">
                            {eq.piezas.map((p) => {
                              let badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
                              if (p.tipo === 'preventivo') badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                              if (p.tipo === 'correctivo') badgeColor = 'bg-sky-500/10 text-sky-300 border-sky-500/20';

                              return (
                                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <span className="font-bold text-slate-200 block">{p.nombre}</span>
                                    {p.sintomaFalla && (
                                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                                        ⚠️ {p.sintomaFalla}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${badgeColor}`}>
                                      {p.tipo === 'preventivo' ? 'Preventivo' : (p.tipo === 'correctivo' ? 'Correctivo' : 'Desgaste')}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                                    Cada {p.frecuenciaMeses} {p.frecuenciaMeses === 1 ? 'mes' : 'meses'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                    ${p.costoEvento.toLocaleString()}{' '}
                                    <span className="text-[9px] text-slate-500">
                                      (${p.costoPieza}+${p.costoManoObra}mo)
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                                    {p.vecesAlAnio.toFixed(1)}/año
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                                    ${Math.round(p.costoAnual).toLocaleString()} MXN
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                                    ${Math.round(p.costoMensual).toLocaleString()} MXN
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleEliminarPieza(eq.id, p.id)}
                                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                      title="Eliminar pieza"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>
      )}

    </div>
  );
}
