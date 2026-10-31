import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Coins, 
  RotateCcw, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Info
} from 'lucide-react';

import { 
  SALARIO_MINIMO_CONFIG, 
  TASA_IMSS_PATRONAL_DEFAULT,
  calcularSalariosMinimosEquivalentes,
  calcularCargaSocialEmpleado,
  calcularNominaNegocio
} from '../../utils/nominaYTurnosNegocios.js';

export default function PanelNominaYTurnos({
  configNomina,
  negocioNombre = '',
  negocioId = 'hawaiian_paradise',
  salarioMinimoMensual = SALARIO_MINIMO_CONFIG.mensual,
  onUpdateConfigNomina,
  onResetNomina,
  onUpdateSalarioMinimo
}) {
  const [editingSalarioMinimo, setEditingSalarioMinimo] = useState(false);
  const [tempSMG, setTempSMG] = useState(salarioMinimoMensual);

  // Cálculo en vivo de la nómina
  const resumenNomina = calcularNominaNegocio({
    configNegocio: configNomina,
    negocioId,
    salarioMinimoMensual
  });

  const {
    horarioApertura,
    horarioCierre,
    horasJornada,
    turnosPorDia,
    empleadosPorTurno,
    totalEmpleados,
    totalSueldosBrutos,
    totalImssPatronal,
    totalGastoLaboral,
    empleados
  } = resumenNomina;

  // Handlers para modificar horario y turnos
  const handleHorarioChange = (campo, valor) => {
    onUpdateConfigNomina({
      ...configNomina,
      [campo]: valor
    });
  };

  const handleTurnosChange = (turnos) => {
    onUpdateConfigNomina({
      ...configNomina,
      turnosPorDia: Math.max(1, parseInt(turnos) || 1)
    });
  };

  const handleEmpleadosPorTurnoChange = (num) => {
    onUpdateConfigNomina({
      ...configNomina,
      empleadosPorTurno: Math.max(1, parseInt(num) || 1)
    });
  };

  // Handlers para modificar empleados
  const handleEmpleadoFieldChange = (empId, campo, valor) => {
    const nuevosEmpleados = (configNomina?.empleados || []).map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          [campo]: campo === 'sueldoMensual' ? Math.max(0, parseFloat(valor) || 0) : valor
        };
      }
      return emp;
    });

    onUpdateConfigNomina({
      ...configNomina,
      empleados: nuevosEmpleados
    });
  };

  const handleAddEmpleado = () => {
    const nuevoId = `${negocioId}_emp_${Date.now()}`;
    const nuevoEmpleado = {
      id: nuevoId,
      nombre: `Nuevo Empleado ${empleados.length + 1}`,
      puesto: 'Personal Operativo',
      turno: 1,
      sueldoMensual: Math.round(salarioMinimoMensual) // Inicia en 1 salario mínimo
    };

    onUpdateConfigNomina({
      ...configNomina,
      empleados: [...(configNomina?.empleados || []), nuevoEmpleado]
    });
  };

  const handleRemoveEmpleado = (empId) => {
    const filtrados = (configNomina?.empleados || []).filter(emp => emp.id !== empId);
    onUpdateConfigNomina({
      ...configNomina,
      empleados: filtrados
    });
  };

  const handleSaveSalarioMinimo = () => {
    if (onUpdateSalarioMinimo) {
      onUpdateSalarioMinimo(tempSMG);
    }
    setEditingSalarioMinimo(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
      {/* Header del Panel de Recursos Humanos */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-teal-400" size={20} />
            <h3 className="text-base font-bold text-white font-display">
              Recursos Humanos, Turnos, Salarios Mínimos y Carga Patronal IMSS
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
              {negocioNombre}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Configura el horario operativo, cantidad de turnos, personal por turno, sueldos individuales y cuotas patronales de Seguro Social (IMSS + Infonavit). La suma total se añade a los gastos fijos mensuales.
          </p>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddEmpleado}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 transition cursor-pointer"
          >
            <UserPlus size={13} />
            Agregar Empleado
          </button>
          <button
            onClick={onResetNomina}
            className="flex items-center gap-1.5 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="Restablecer plantilla sugerida para este negocio"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* BLOQUE DE REFERENCIA: SALARIO MÍNIMO VIGENTE EN MÉXICO */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 border border-teal-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold shrink-0">
            <Coins size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Salario Mínimo General Vigente ({SALARIO_MINIMO_CONFIG.añoVigente})
              </span>
              <span className="px-2 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[9px] font-mono">
                {SALARIO_MINIMO_CONFIG.fuenteOficial}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold text-teal-300 font-mono">
                ${SALARIO_MINIMO_CONFIG.diario.toFixed(2)} MXN/día
              </span>
              <span className="text-xs text-slate-400">
                &middot; Base mensual oficial (30.4 días): <strong className="text-white font-mono">${salarioMinimoMensual.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN/mes</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Control para simular o ajustar Salario Mínimo */}
        <div className="flex items-center gap-2 shrink-0">
          {editingSalarioMinimo ? (
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-teal-400">
              <input
                type="number"
                step="100"
                value={tempSMG}
                onChange={(e) => setTempSMG(parseFloat(e.target.value) || 0)}
                className="w-24 px-1.5 py-0.5 bg-transparent text-xs font-mono font-bold text-teal-300 text-right focus:outline-none"
              />
              <button
                onClick={handleSaveSalarioMinimo}
                className="px-2 py-0.5 rounded bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 cursor-pointer"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setTempSMG(salarioMinimoMensual); setEditingSalarioMinimo(true); }}
              className="text-[11px] text-teal-400 hover:text-teal-300 underline font-mono cursor-pointer"
            >
              Ajustar SMG Referencia
            </button>
          )}
        </div>
      </div>

      {/* CONTROLES DE HORARIO, JORNADA Y TURNOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
        {/* Horario Apertura / Cierre */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
            <Clock size={11} className="text-teal-400" />
            Horario de Operación
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="time"
              value={horarioApertura}
              onChange={(e) => handleHorarioChange('horarioApertura', e.target.value)}
              className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center"
            />
            <span className="text-slate-500 text-xs">a</span>
            <input
              type="time"
              value={horarioCierre}
              onChange={(e) => handleHorarioChange('horarioCierre', e.target.value)}
              className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center"
            />
          </div>
          <div className="text-[10px] text-teal-400 font-mono mt-0.5">
            {horasJornada} horas de servicio/día
          </div>
        </div>

        {/* Turnos por Día */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase">
            Turnos por Día
          </label>
          <select
            value={turnosPorDia}
            onChange={(e) => handleTurnosChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs cursor-pointer"
          >
            <option value="1">1 Turno (Jornada Continua)</option>
            <option value="2">2 Turnos (Matutino / Vespertino)</option>
            <option value="3">3 Turnos (24 Horas / Rotativo)</option>
          </select>
          <div className="text-[10px] text-slate-500">
            {turnosPorDia === 1 ? '1 turno laboral por jornada' : `${turnosPorDia} turnos escalonados`}
          </div>
        </div>

        {/* Empleados por Turno */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase">
            Personal Simultáneo / Turno
          </label>
          <input
            type="number"
            min="1"
            max="15"
            value={empleadosPorTurno}
            onChange={(e) => handleEmpleadosPorTurnoChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
          />
          <div className="text-[10px] text-slate-500">
            {empleadosPorTurno} trabajador(es) activos a la vez
          </div>
        </div>

        {/* Plantilla Total Registrada */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase">
            Plantilla Total
          </label>
          <div className="text-xl font-bold text-white font-mono mt-0.5">
            {totalEmpleados} <span className="text-xs text-slate-400 font-normal">empleados registrados</span>
          </div>
          <div className="text-[10px] text-teal-400">
            {turnosPorDia} turno(s) &middot; Promedio {(totalEmpleados / turnosPorDia).toFixed(1)} emp/turno
          </div>
        </div>
      </div>

      {/* TARJETAS RESUMEN DE NÓMINA Y CARGA PATRONAL IMSS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Sueldos Brutos */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Suma de Sueldos Brutos</span>
            <span className="text-slate-400 font-bold">{totalEmpleados} pers.</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ${Math.round(totalSueldosBrutos).toLocaleString('es-MX')} <span className="text-xs text-slate-400 font-normal">MXN/mes</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Sueldo base acumulado antes de retenciones e impuestos.
          </p>
        </div>

        {/* Card 2: Seguro Social Patronal IMSS */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span className="flex items-center gap-1 text-cyan-400">
              <ShieldCheck size={12} />
              Seguro Social IMSS Patronal
            </span>
            <span className="text-cyan-400 font-bold">~{(TASA_IMSS_PATRONAL_DEFAULT * 100).toFixed(1)}%</span>
          </div>
          <div className="text-lg font-bold text-cyan-300 font-mono">
            +${Math.round(totalImssPatronal).toLocaleString('es-MX')} <span className="text-xs text-slate-400 font-normal">MXN/mes</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Cuotas patronales IMSS + Aportación Infonavit (5%).
          </p>
        </div>

        {/* Card 3: Gasto Fijo Laboral Total */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-950/50 border border-teal-500/40 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-teal-300 text-[10px] font-mono uppercase">
            <span className="flex items-center gap-1 font-bold">
              <DollarSign size={12} />
              Total Gasto Fijo Laboral
            </span>
            <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[9px] font-bold">A GASTOS FIJOS</span>
          </div>
          <div className="text-xl font-bold text-teal-300 font-mono">
            ${Math.round(totalGastoLaboral).toLocaleString('es-MX')} <span className="text-xs text-slate-400 font-normal">MXN/mes</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Suma integrada a los costos fijos operativos del negocio.
          </p>
        </div>
      </div>

      {/* TABLA DETALLADA DE EMPLEADOS, SUELDOS Y EQUIVALENCIA EN SALARIOS MÍNIMOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Users size={14} className="text-teal-400" />
            Desglose de Empleados, Sueldos y Salarios Mínimos
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Edita sueldos directamente; los salarios mínimos y el IMSS se recalculan al instante
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Empleado / Puesto</th>
                <th className="py-2.5 px-3">Turno</th>
                <th className="py-2.5 px-3 text-right">Sueldo Mensual Ingresado</th>
                <th className="py-2.5 px-3 text-right text-cyan-300">Carga IMSS (26.5%)</th>
                <th className="py-2.5 px-3 text-right text-teal-300 font-bold">Costo Empresa</th>
                <th className="py-2.5 px-3 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {empleados.map((emp) => {
                const smmEquiv = emp.salariosMinimosEquivalentes;
                const esMenorSM = smmEquiv < 1.0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30">
                    {/* Nombre y Puesto Editable */}
                    <td className="py-3 px-3 font-sans">
                      <input
                        type="text"
                        value={emp.nombre}
                        onChange={(e) => handleEmpleadoFieldChange(emp.id, 'nombre', e.target.value)}
                        className="font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-400 focus:outline-none w-full text-xs"
                      />
                      <input
                        type="text"
                        value={emp.puesto}
                        onChange={(e) => handleEmpleadoFieldChange(emp.id, 'puesto', e.target.value)}
                        className="text-[10px] text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-400 focus:outline-none w-full"
                        placeholder="Descripción del puesto..."
                      />
                    </td>

                    {/* Turno */}
                    <td className="py-3 px-3">
                      <select
                        value={emp.turno}
                        onChange={(e) => handleEmpleadoFieldChange(emp.id, 'turno', parseInt(e.target.value) || 1)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                      >
                        {Array.from({ length: turnosPorDia }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Turno {i + 1}</option>
                        ))}
                      </select>
                    </td>

                    {/* SUELDO MENSUAL INGRESADO + MOSTRAR SALARIOS MÍNIMOS INMEDIATAMENTE ABAJO */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          step="100"
                          value={emp.sueldoMensual}
                          onChange={(e) => handleEmpleadoFieldChange(emp.id, 'sueldoMensual', e.target.value)}
                          className="w-24 px-2 py-1 rounded bg-slate-950 border border-teal-500/60 text-white font-bold font-mono text-xs text-right focus:outline-none focus:ring-1 focus:ring-teal-400"
                        />
                      </div>

                      {/* INDICADOR INMEDIATO DE SALARIOS MÍNIMOS */}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1 ${
                          esMenorSM
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}>
                          {smmEquiv.toFixed(2)} SMG
                        </span>
                        <span className="text-slate-400">
                          ({smmEquiv >= 1 ? 'Salarios Mínimos' : 'Menor a SMG legal'})
                        </span>
                      </div>
                    </td>

                    {/* Carga IMSS Patronal */}
                    <td className="py-3 px-3 text-right text-cyan-300">
                      +${Math.round(emp.imssPatronal).toLocaleString('es-MX')}
                      <div className="text-[9px] text-slate-500">
                        IMSS + Infonavit
                      </div>
                    </td>

                    {/* Costo Total Empresa */}
                    <td className="py-3 px-3 text-right font-bold text-teal-300 text-xs">
                      ${Math.round(emp.costoTotalEmpresa).toLocaleString('es-MX')}
                      <div className="text-[9px] text-slate-500 font-normal">
                        Sueldo + Carga Social
                      </div>
                    </td>

                    {/* Botón Eliminar */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleRemoveEmpleado(emp.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Eliminar empleado"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700 bg-slate-950/80 font-mono font-bold text-xs text-white">
                <td className="py-2.5 px-3 font-sans">TOTALES NÓMINA ({empleados.length} EMPLEADOS)</td>
                <td className="py-2.5 px-3">{turnosPorDia} Turno(s)</td>
                <td className="py-2.5 px-3 text-right text-white">
                  ${Math.round(totalSueldosBrutos).toLocaleString('es-MX')}
                  <div className="text-[9px] text-slate-400 font-normal">
                    {(totalSueldosBrutos / (salarioMinimoMensual || 1)).toFixed(2)} SMG globales
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right text-cyan-300">+${Math.round(totalImssPatronal).toLocaleString('es-MX')}</td>
                <td className="py-2.5 px-3 text-right text-teal-300 text-sm">
                  ${Math.round(totalGastoLaboral).toLocaleString('es-MX')}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <CheckCircle2 size={14} className="text-teal-400 inline" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Nota Explicativa del Impacto en el Punto de Equilibrio */}
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-teal-200">
        <Sparkles size={18} className="text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Impacto en Punto de Equilibrio y Ganancias Netas: </span>
          El total de nómina mensual (<strong className="text-white font-mono">${Math.round(totalGastoLaboral).toLocaleString('es-MX')} MXN</strong>, que incluye <strong className="text-white font-mono">${Math.round(totalSueldosBrutos).toLocaleString('es-MX')}</strong> de sueldos y <strong className="text-white font-mono">${Math.round(totalImssPatronal).toLocaleString('es-MX')}</strong> de cuotas IMSS) se suma de forma directa a los gastos fijos del local. En consecuencia, el volumen de ventas para el punto de equilibrio y para alcanzar los <strong className="text-white font-mono">$20,000 MXN libres</strong> se recalcula garantizando que se cubra el pago puntual a los trabajadores y al Seguro Social.
        </div>
      </div>
    </div>
  );
}
