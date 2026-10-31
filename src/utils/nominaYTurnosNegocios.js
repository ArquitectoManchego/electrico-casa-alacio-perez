/**
 * Módulo de Gestión de Recursos Humanos, Turnos, Salarios Mínimos y Carga Patronal IMSS
 * para cada unidad de negocio en Casa Alacio Pérez (Consorcio Gallegos González).
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
 * Calcula el resumen completo de nómina, turnos, IMSS y sueldos de un negocio.
 */
export function calcularNominaNegocio({
  configNegocio = null,
  negocioId = 'hawaiian_paradise',
  salarioMinimoMensual = SALARIO_MINIMO_CONFIG.mensual,
  tasaImss = TASA_IMSS_PATRONAL_DEFAULT
}) {
  const plantilla = configNegocio || PLANTILLA_DEFAULT_NEGOCIOS[negocioId] || PLANTILLA_DEFAULT_NEGOCIOS.hawaiian_paradise;
  const empleados = plantilla.empleados || [];

  let totalSueldosBrutos = 0;
  let totalImssPatronal = 0;

  const empleadosDetalle = empleados.map(emp => {
    const sueldo = parseFloat(emp.sueldoMensual) || 0;
    const smmEquiv = calcularSalariosMinimosEquivalentes(sueldo, salarioMinimoMensual);
    const carga = calcularCargaSocialEmpleado(sueldo, tasaImss);

    totalSueldosBrutos += sueldo;
    totalImssPatronal += carga.imssPatronal;

    return {
      ...emp,
      sueldoMensual: sueldo,
      salariosMinimosEquivalentes: smmEquiv,
      imssPatronal: carga.imssPatronal,
      costoTotalEmpresa: carga.costoTotalEmpresa
    };
  });

  const totalGastoLaboral = totalSueldosBrutos + totalImssPatronal;

  // Cálculo de horas de jornada
  let horasJornada = 8;
  if (plantilla.horarioApertura && plantilla.horarioCierre) {
    const [hIni, mIni] = plantilla.horarioApertura.split(':').map(Number);
    const [hFin, mFin] = plantilla.horarioCierre.split(':').map(Number);
    const diffMinutos = (hFin * 60 + mFin) - (hIni * 60 + mIni);
    if (diffMinutos > 0) {
      horasJornada = Math.round((diffMinutos / 60) * 10) / 10;
    }
  }

  return {
    negocioId,
    nombreNegocio: plantilla.nombreNegocio,
    horarioApertura: plantilla.horarioApertura,
    horarioCierre: plantilla.horarioCierre,
    horasJornada,
    turnosPorDia: plantilla.turnosPorDia || 1,
    empleadosPorTurno: plantilla.empleadosPorTurno || 1,
    totalEmpleados: empleados.length,
    totalSueldosBrutos,
    totalImssPatronal,
    totalGastoLaboral,
    empleados: empleadosDetalle,
    salarioMinimoMensual
  };
}
