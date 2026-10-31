/**
 * Módulo de Gestión de Recursos Humanos, Turnos, Horas Extras (Reforma LFT 2027),
 * Salarios Mínimos y Carga Patronal IMSS para Casa Alacio Pérez (Consorcio Gallegos González).
 */

// Salario Mínimo General Oficial Vigente en México (Zona Resto del País)
export const SALARIO_MINIMO_CONFIG = {
  diario: 248.93, // $248.93 MXN diarios oficiales
  diasMesLegal: 30.4, // Factor legal mensual conforme a LFT / IMSS
  mensual: 248.93 * 30.4, // $7,567.47 MXN mensuales
  zona: 'Zona Salario Mínimo General (Resto del País)',
  añoVigente: '2024 / 2025',
  fuenteOficial: 'CONASAMI / DOF'
};

// Tasa Patronal Promedio Integrada de Seguridad Social (IMSS + Infonavit)
// Incluye: Riesgos de Trabajo, Enfermedades y Maternidad, Invalidez y Vida,
// Retiro, Cesantía y Vejez, Guarderías e Infonavit 5%. Promedio estándar ~26.5%
export const TASA_IMSS_PATRONAL_DEFAULT = 0.265; // 26.5%

export const PLANTILLA_DEFAULT_NEGOCIOS = {
  // 1. HAWAIIAN PARADISE
  hawaiian_paradise: {
    negocioId: 'hawaiian_paradise',
    nombreNegocio: 'Hawaiian Paradise',
    horarioApertura: '10:00',
    horarioCierre: '20:00',
    turnosPorDia: 2,
    empleadosPorTurno: 2,
    empleados: [
      { id: 'hp_emp_1', nombre: 'Barista / Crepero Turno 1', puesto: 'Barista y Cocina Caliente', turno: 1, sueldoMensual: 8500 },
      { id: 'hp_emp_2', nombre: 'Cajero / Atención Turno 1', puesto: 'Caja TPV y Bebidas Frías', turno: 1, sueldoMensual: 8000 },
      { id: 'hp_emp_3', nombre: 'Barista / Crepero Turno 2', puesto: 'Barista y Cocina Caliente', turno: 2, sueldoMensual: 8500 },
      { id: 'hp_emp_4', nombre: 'Cajero / Atención Turno 2', puesto: 'Caja TPV y Bebidas Frías', turno: 2, sueldoMensual: 8000 }
    ]
  },

  // 2. IMPERIA UNIFORMES
  imperia_uniformes: {
    negocioId: 'imperia_uniformes',
    nombreNegocio: 'Imperia Uniformes',
    horarioApertura: '09:00',
    horarioCierre: '19:00',
    turnosPorDia: 1,
    empleadosPorTurno: 1,
    empleados: [
      { id: 'iu_emp_1', nombre: 'Encargada de Mostrador y Ventas', puesto: 'Atención a Clientes y TPV', turno: 1, sueldoMensual: 8000 }
    ]
  },

  // 3. PUBLI-IMPERIA
  taller_publi_imperia: {
    negocioId: 'taller_publi_imperia',
    nombreNegocio: 'Publi-Imperia (Impresos Imperia)',
    horarioApertura: '09:00',
    horarioCierre: '18:00',
    turnosPorDia: 1,
    empleadosPorTurno: 1,
    empleados: [
      { id: 'pi_emp_1', nombre: 'Diseñador / Operador de Taller Gráfico', puesto: 'Diseño, Prensas DTF, Sublimación y Láser', turno: 1, sueldoMensual: 9500 }
    ]
  },

  // 4. BORDADOS VERACRUZ
  bordados_veracruz: {
    negocioId: 'bordados_veracruz',
    nombreNegocio: 'Bordados Veracruz',
    horarioApertura: '08:30',
    horarioCierre: '18:30',
    turnosPorDia: 1,
    empleadosPorTurno: 1,
    empleados: [
      { id: 'bv_emp_1', nombre: 'Operador de Bordadoras Industriales', puesto: 'Operación Aemco 4 Cabezas y Melco 6/4', turno: 1, sueldoMensual: 9000 }
    ]
  },

  // 5. TALLER DE COSTURA
  taller_costura: {
    negocioId: 'taller_costura',
    nombreNegocio: 'Taller de Costura Imperia',
    horarioApertura: '08:00',
    horarioCierre: '17:00',
    turnosPorDia: 1,
    empleadosPorTurno: 2,
    empleados: [
      { id: 'tc_emp_1', nombre: 'Costurera Industrial Recta/Overlock', puesto: 'Confección Filipinas y Pantalones', turno: 1, sueldoMensual: 8500 },
      { id: 'tc_emp_2', nombre: 'Costurera Industrial Ensamble/Collaretera', puesto: 'Acabados y Playeras Polo Stretch', turno: 1, sueldoMensual: 8500 }
    ]
  },

  // 6. PAPELERÍA IMPERIARTE
  papeleria_imperiarte: {
    negocioId: 'papeleria_imperiarte',
    nombreNegocio: 'Papelería ImperiArte',
    horarioApertura: '08:00',
    horarioCierre: '19:00',
    turnosPorDia: 1,
    empleadosPorTurno: 1,
    empleados: [
      { id: 'ia_emp_1', nombre: 'Encargado de Fotocopiado y Caja', puesto: 'Operación DocuColor, Útiles y TPV', turno: 1, sueldoMensual: 7800 }
    ]
  },

  // 7. OFICINAS CORPORATIVO
  oficinas_consorcio: {
    negocioId: 'oficinas_consorcio',
    nombreNegocio: 'Oficinas Corporativo (Consorcio)',
    horarioApertura: '09:00',
    horarioCierre: '16:00',
    turnosPorDia: 1,
    empleadosPorTurno: 1,
    empleados: [
      { id: 'oc_emp_1', nombre: 'Auxiliar Administrativo / Fiscal', puesto: 'Gestión Contable, Facturación y Licitaciones', turno: 1, sueldoMensual: 10000 }
    ]
  }
};

/**
 * Calcula los salarios mínimos mensuales a los que equivale un sueldo dado.
 */
export function calcularSalariosMinimosEquivalentes(sueldoMensual, salarioMinimoMensual = SALARIO_MINIMO_CONFIG.mensual) {
  const sueldo = parseFloat(sueldoMensual) || 0;
  const smm = parseFloat(salarioMinimoMensual) || SALARIO_MINIMO_CONFIG.mensual;
  if (smm <= 0) return 0;
  return Math.round((sueldo / smm) * 100) / 100;
}

/**
 * Calcula la carga social patronal de Seguro Social (IMSS + Infonavit) para un empleado.
 */
export function calcularCargaSocialEmpleado(sueldoMensual, tasaImss = TASA_IMSS_PATRONAL_DEFAULT) {
  const sueldo = parseFloat(sueldoMensual) || 0;
  const imssPatronal = sueldo * tasaImss;
  const costoTotalEmpresa = sueldo + imssPatronal;

  return {
    sueldoBruto: sueldo,
    imssPatronal,
    tasaImssPct: tasaImss * 100,
    costoTotalEmpresa
  };
}

/**
 * Calcula las horas extras de acuerdo a la Ley Federal del Trabajo (LFT) y la reforma de jornada 2027.
 * - Jornada diurna máxima legal ordinaria: 8 horas diarias.
 * - Si horasJornada > 8 y se selecciona 1 solo turno:
 *   - Horas extras diarias = horasJornada - 8
 *   - Horas extras semanales (semana laboral de 6 días) = horasExtrasDia * 6
 *   - Primeras 9 horas semanales: Horas Dobles (+100%, pago al 200%, Art. 66 y 67 LFT).
 *   - Excedente sobre 9 horas semanales: Horas Triples (+200%, pago al 300%, Art. 68 LFT).
 *   - Mes = 4.33 semanas promedio.
 */
export function calcularHorasExtrasLFT({
  horasJornada = 8,
  turnosPorDia = 1,
  diasSemana = 6,
  sueldoMensual = 8000
}) {
  if (turnosPorDia > 1 || horasJornada <= 8) {
    return {
      aplicaHorasExtras: false,
      horasExtrasDia: 0,
      horasExtrasSemana: 0,
      horasDoblesSemana: 0,
      horasTriplesSemana: 0,
      horasDoblesMes: 0,
      horasTriplesMes: 0,
      cuotaHora: 0,
      montoHorasDoblesMes: 0,
      montoHorasTriplesMes: 0,
      montoTotalHorasExtrasMes: 0
    };
  }

  const horasExtrasDia = Math.round((horasJornada - 8) * 10) / 10;
  const horasExtrasSemana = Math.round(horasExtrasDia * diasSemana * 10) / 10;

  // Primeras 9 horas extras a la semana al doble (+100%)
  const horasDoblesSemana = Math.min(9, horasExtrasSemana);
  // Excedente de 9 horas a la semana al triple (+200%)
  const horasTriplesSemana = Math.max(0, horasExtrasSemana - 9);

  const semanasMes = 4.33; // Factor promedio semanas/mes
  const horasDoblesMes = Math.round(horasDoblesSemana * semanasMes * 10) / 10;
  const horasTriplesMes = Math.round(horasTriplesSemana * semanasMes * 10) / 10;

  // Cuota ordinaria por hora conforme a salario mensual (base LFT 30.4 días / 8 horas)
  const salarioDiario = (parseFloat(sueldoMensual) || 0) / 30.4;
  const cuotaHora = salarioDiario / 8;

  const montoHorasDoblesMes = horasDoblesMes * (cuotaHora * 2);
  const montoHorasTriplesMes = horasTriplesMes * (cuotaHora * 3);
  const montoTotalHorasExtrasMes = Math.round((montoHorasDoblesMes + montoHorasTriplesMes) * 100) / 100;

  return {
    aplicaHorasExtras: true,
    horasExtrasDia,
    horasExtrasSemana,
    horasDoblesSemana,
    horasTriplesSemana,
    horasDoblesMes,
    horasTriplesMes,
    cuotaHora: Math.round(cuotaHora * 100) / 100,
    montoHorasDoblesMes: Math.round(montoHorasDoblesMes * 100) / 100,
    montoHorasTriplesMes: Math.round(montoHorasTriplesMes * 100) / 100,
    montoTotalHorasExtrasMes
  };
}

/**
 * Sincroniza dinámicamente la lista de empleados con los turnos y personal por turno requeridos.
 * Garantiza que plantillaTotal = turnosPorDia * empleadosPorTurno.
 */
export function sincronizarPlantillaEmpleados({
  empleadosActuales = [],
  turnosPorDia = 1,
  empleadosPorTurno = 1,
  negocioId = 'hawaiian_paradise',
  sueldoBaseSugerido = 8000
}) {
  const metaTotal = Math.max(1, (parseInt(turnosPorDia) || 1) * (parseInt(empleadosPorTurno) || 1));
  const plantillaDefecto = PLANTILLA_DEFAULT_NEGOCIOS[negocioId]?.empleados || [];

  const nuevaLista = [];

  for (let i = 0; i < metaTotal; i++) {
    const turnoAsignado = Math.floor(i / (parseInt(empleadosPorTurno) || 1)) + 1;
    const numEnTurno = (i % (parseInt(empleadosPorTurno) || 1)) + 1;

    if (i < empleadosActuales.length) {
      // Conservar el empleado existente pero asegurar que su turno coincida
      nuevaLista.push({
        ...empleadosActuales[i],
        turno: turnoAsignado
      });
    } else if (i < plantillaDefecto.length) {
      // Tomar rol y datos sugeridos de la plantilla por defecto
      nuevaLista.push({
        ...plantillaDefecto[i],
        id: `${negocioId}_emp_${i + 1}_${Date.now()}`,
        turno: turnoAsignado
      });
    } else {
      // Crear nueva plaza de trabajo estándar
      nuevaLista.push({
        id: `${negocioId}_emp_${i + 1}_${Date.now()}`,
        nombre: `Personal Turno ${turnoAsignado} (${numEnTurno})`,
        puesto: `Operador Turno ${turnoAsignado}`,
        turno: turnoAsignado,
        sueldoMensual: sueldoBaseSugerido
      });
    }
  }

  return nuevaLista;
}

/**
 * Calcula el resumen completo de nómina, turnos, horas extras LFT e IMSS de un negocio.
 */
export function calcularNominaNegocio({
  configNegocio = null,
  negocioId = 'hawaiian_paradise',
  salarioMinimoMensual = SALARIO_MINIMO_CONFIG.mensual,
  tasaImss = TASA_IMSS_PATRONAL_DEFAULT
}) {
  const plantilla = configNegocio || PLANTILLA_DEFAULT_NEGOCIOS[negocioId] || PLANTILLA_DEFAULT_NEGOCIOS.hawaiian_paradise;
  const turnosPorDia = Math.max(1, parseInt(plantilla.turnosPorDia) || 1);
  const empleadosPorTurno = Math.max(1, parseInt(plantilla.empleadosPorTurno) || 1);
  const empleados = plantilla.empleados || [];

  // Cálculo de horas de jornada a partir del horario
  let horasJornada = 8;
  if (plantilla.horarioApertura && plantilla.horarioCierre) {
    const [hIni, mIni] = plantilla.horarioApertura.split(':').map(Number);
    const [hFin, mFin] = plantilla.horarioCierre.split(':').map(Number);
    let diffMinutos = (hFin * 60 + mFin) - (hIni * 60 + mIni);
    if (diffMinutos <= 0) diffMinutos += 24 * 60; // Si cruza medianoche
    if (diffMinutos > 0) {
      horasJornada = Math.round((diffMinutos / 60) * 10) / 10;
    }
  }

  // Evaluación de jornada conforme a LFT y Reforma 2027
  const superaJornadaLegal = horasJornada > 8;
  const sugiereDosTurnos = superaJornadaLegal && turnosPorDia === 1;

  let totalSueldosBrutos = 0;
  let totalHorasExtras = 0;
  let totalImssPatronal = 0;

  const empleadosDetalle = empleados.map(emp => {
    const sueldo = parseFloat(emp.sueldoMensual) || 0;
    const smmEquiv = calcularSalariosMinimosEquivalentes(sueldo, salarioMinimoMensual);

    // Cálculo de horas extras si aplica (1 solo turno con jornada > 8h)
    const infoHorasExtras = calcularHorasExtrasLFT({
      horasJornada,
      turnosPorDia,
      diasSemana: 6,
      sueldoMensual: sueldo
    });

    const montoHorasExtras = infoHorasExtras.montoTotalHorasExtrasMes;
    const percepcionTotal = sueldo + montoHorasExtras;
    const carga = calcularCargaSocialEmpleado(percepcionTotal, tasaImss);

    totalSueldosBrutos += sueldo;
    totalHorasExtras += montoHorasExtras;
    totalImssPatronal += carga.imssPatronal;

    return {
      ...emp,
      sueldoMensual: sueldo,
      salariosMinimosEquivalentes: smmEquiv,
      horasExtras: infoHorasExtras,
      montoHorasExtras,
      percepcionTotal,
      imssPatronal: carga.imssPatronal,
      costoTotalEmpresa: carga.costoTotalEmpresa
    };
  });

  const totalPercepciones = totalSueldosBrutos + totalHorasExtras;
  const totalGastoLaboral = totalPercepciones + totalImssPatronal;

  return {
    negocioId,
    nombreNegocio: plantilla.nombreNegocio,
    horarioApertura: plantilla.horarioApertura,
    horarioCierre: plantilla.horarioCierre,
    horasJornada,
    turnosPorDia,
    empleadosPorTurno,
    plantillaRequerida: turnosPorDia * empleadosPorTurno,
    totalEmpleados: empleados.length,
    superaJornadaLegal,
    sugiereDosTurnos,
    totalSueldosBrutos,
    totalHorasExtras,
    totalPercepciones,
    totalImssPatronal,
    totalGastoLaboral,
    empleados: empleadosDetalle,
    salarioMinimoMensual
  };
}
