/**
 * Script de Verificación Automatizada para el Módulo de Finanzas y Rentabilidad
 * Consorcio Gallegos González & Casa Alacio Pérez
 */

import { 
  SUPERFICIE_INMUEBLE, 
  TABLA_RENTAS_INMUEBLE, 
  TABLA_AGUA_INMUEBLE, 
  TABLA_HVAC_INMUEBLE 
} from '../src/utils/costosFijosInmueble.js';

import { 
  CATALOGO_PRECIOS_COSTOS, 
  obtenerProductosNegocio, 
  calcularMargenProducto,
  calcularMargenPromedioPonderado 
} from '../src/utils/preciosYCostosProductos.js';

import { 
  calcularPuntoEquilibrio, 
  calibrarNivelesVentaFinancieros, 
  simularDiaVentaInteractivo, 
  calcularEstadoResultados 
} from '../src/utils/motorPuntoEquilibrio.js';

import { 
  SALARIO_MINIMO_CONFIG, 
  PLANTILLA_DEFAULT_NEGOCIOS, 
  calcularSalariosMinimosEquivalentes, 
  calcularCargaSocialEmpleado, 
  sincronizarPlantillaEmpleados,
  calcularHorasExtrasLFT,
  calcularNominaNegocio 
} from '../src/utils/nominaYTurnosNegocios.js';

console.log('================================================================');
console.log('EJECUTANDO SUITE DE PRUEBAS FINANCIERAS Y PRORRATEO CASA ALACIO');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  }
}

// -----------------------------------------------------------------------------
// PRUEBA 1: Prorrateo de Superficies y Renta con IVA ($10,440.00 MXN)
// -----------------------------------------------------------------------------
console.log('--- TEST 1: Prorrateo de Renta con IVA y Superficies ---');
const rentasKeys = Object.keys(TABLA_RENTAS_INMUEBLE);
assert(rentasKeys.length === 7, `Debe haber 7 registros de negocio (actual: ${rentasKeys.length})`);

const sumaAreaTotal = rentasKeys.reduce((s, k) => s + TABLA_RENTAS_INMUEBLE[k].areaTotalImputadaM2, 0);
assert(Math.abs(sumaAreaTotal - 299.40) < 0.01, `Suma de áreas imputadas = 299.40 m² (actual: ${sumaAreaTotal.toFixed(2)} m²)`);

const sumaRentaSinIva = rentasKeys.reduce((s, k) => s + TABLA_RENTAS_INMUEBLE[k].rentaSinIva, 0);
assert(Math.abs(sumaRentaSinIva - 9000.00) < 0.05, `Suma renta sin IVA = $9,000.00 MXN (actual: ${sumaRentaSinIva.toFixed(2)})`);

const sumaRentaConIva = rentasKeys.reduce((s, k) => s + TABLA_RENTAS_INMUEBLE[k].rentaConIva, 0);
assert(Math.abs(sumaRentaConIva - 10440.00) < 0.05, `Suma renta con IVA = $10,440.00 MXN (actual: ${sumaRentaConIva.toFixed(2)})`);

const corp = TABLA_RENTAS_INMUEBLE.oficinas_consorcio;
assert(corp.areaComunAbsorbidaM2 === 42.24, `Corporativo absorbe 42.24 m² de áreas comunes (actual: ${corp.areaComunAbsorbidaM2})`);
assert(corp.areaTotalImputadaM2 === 55.45, `Área total imputada a Corporativo = 55.45 m² (actual: ${corp.areaTotalImputadaM2})`);

// -----------------------------------------------------------------------------
// PRUEBA 2: Prorrateo de Agua Potable ($1,000.00 MXN)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: Prorrateo de Agua Potable ---');
const aguaKeys = Object.keys(TABLA_AGUA_INMUEBLE);
assert(aguaKeys.length === 7, `Debe haber 7 asignaciones de agua (actual: ${aguaKeys.length})`);

const sumaAguaMonto = aguaKeys.reduce((s, k) => s + TABLA_AGUA_INMUEBLE[k].montoMensual, 0);
assert(Math.abs(sumaAguaMonto - 1000.00) < 0.01, `Suma total de agua mensual = $1,000.00 MXN (actual: ${sumaAguaMonto.toFixed(2)})`);

const sumaAguaPct = aguaKeys.reduce((s, k) => s + TABLA_AGUA_INMUEBLE[k].porcentaje, 0);
assert(Math.abs(sumaAguaPct - 100.0) < 0.01, `Suma porcentajes de agua = 100% (actual: ${sumaAguaPct.toFixed(1)}%)`);

assert(TABLA_AGUA_INMUEBLE.hawaiian_paradise.montoMensual === 500.00, `Hawaiian Paradise paga el 50% ($500.00) por tarja y baños públicos`);
assert(TABLA_AGUA_INMUEBLE.taller_costura.montoMensual === 150.00, `Taller de Costura paga el 15% ($150.00) por 1-3 costureras`);
assert(TABLA_AGUA_INMUEBLE.imperia_uniformes.montoMensual === 100.00, `Imperia Uniformes paga el 10% ($100.00) por 1 baño activo`);

// -----------------------------------------------------------------------------
// PRUEBA 3: Climatización HVAC y Altura de Techo (3.80 m)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: Climatización HVAC ---');
const hvacKeys = Object.keys(TABLA_HVAC_INMUEBLE);
assert(hvacKeys.length === 7, `Debe haber 7 dimensionamientos HVAC (actual: ${hvacKeys.length})`);

hvacKeys.forEach(k => {
  const h = TABLA_HVAC_INMUEBLE[k];
  const volEsperado = Math.round(h.areaClimatizadaM2 * 3.80 * 100) / 100;
  assert(Math.abs(h.volumenM3 - volEsperado) < 0.1, `HVAC ${k}: Altura 3.80m x ${h.areaClimatizadaM2}m² = ${h.volumenM3}m³`);
});

// -----------------------------------------------------------------------------
// PRUEBA 4: Catálogo de Productos y Márgenes Unitarios
// -----------------------------------------------------------------------------
console.log('\n--- TEST 4: Catálogo de Productos y Márgenes Unitarios ---');
const catalogoKeys = Object.keys(CATALOGO_PRECIOS_COSTOS);
assert(catalogoKeys.length === 7, `Debe haber catálogo de productos para los 7 negocios`);

let totalProductos = 0;
catalogoKeys.forEach(negId => {
  const prods = obtenerProductosNegocio(negId);
  totalProductos += prods.length;
  prods.forEach(p => {
    assert(p.precioVenta > 0, `Producto ${p.nombre} precio venta > 0 ($${p.precioVenta})`);
    assert(p.margenBruto > 0, `Producto ${p.nombre} margen bruto positivo ($${p.margenBruto})`);
    assert(p.costoMateriales > 0, `Producto ${p.nombre} tiene costo de materiales ($${p.costoMateriales})`);
  });
});
console.log(`ℹ️ Total de productos validados en catálogo maestro: ${totalProductos}`);

// -----------------------------------------------------------------------------
// PRUEBA 5: Calibración Financiera: Día Bajo (0-10 arts) y Mes Alto ($20k Libres)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 5: Escenarios Financieros y Meta de $20,000 MXN Libres ---');
const negociosComerciales = ['hawaiian_paradise', 'imperia_uniformes', 'taller_publi_imperia', 'bordados_veracruz', 'taller_costura', 'papeleria_imperiarte'];

negociosComerciales.forEach(negId => {
  const calib = calibrarNivelesVentaFinancieros({
    negocioId: negId,
    diasLaborales: 26,
    reciboLuzReal: 800,
    sueldosFijosExtras: 0,
    otrosGastosFijos: 0
  });

  const bajo = calib.escenarios.bajo;
  const alto = calib.escenarios.alto;

  // Verificación de Día Bajo: volumen diario <= 10 artículos
  assert(bajo.articulosDia <= 10, `${negId} Escenario Bajo tiene <= 10 artículos/día (actual: ${bajo.articulosDia} arts/día)`);
  assert(bajo.pnl.utilidadNeta <= 500, `${negId} Escenario Bajo no supera punto de equilibrio sustancialmente ($${bajo.pnl.utilidadNeta.toFixed(0)})`);

  // Verificación de Mes Alto: Utilidad Neta ≈ $20,000 MXN libres
  const difMeta20k = Math.abs(alto.pnl.utilidadNeta - 20000);
  assert(difMeta20k < 150, `${negId} Escenario Alto cumple meta de $20,000 MXN libres (actual: $${Math.round(alto.pnl.utilidadNeta).toLocaleString('es-MX')})`);
});

// -----------------------------------------------------------------------------
// PRUEBA 6: Simulador Interactivo Diario (Día Cero, Día Bajo, Día Alto)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 6: Simulador Interactivo Diario ---');
const peHP = calcularPuntoEquilibrio({ negocioId: 'hawaiian_paradise', diasLaborales: 26, reciboLuzReal: 1000 });
const cuotaDiaHP = peHP.costosFijos.cuotaFijaDiaria;

// Caso A: Día Cero (0 artículos)
const diaCero = simularDiaVentaInteractivo({
  articulosVendidosMap: {},
  negocioId: 'hawaiian_paradise',
  diasLaborales: 26,
  gastosFijosMensuales: peHP.costosFijos.gastosFijosTotales
});
assert(diaCero.totalArticulosDia === 0, `Día Cero: 0 artículos`);
assert(Math.abs(diaCero.utilidadNetaDia - (-cuotaDiaHP)) < 0.01, `Día Cero: Pérdida neta igual a cuota fija del día (-$${Math.round(cuotaDiaHP)})`);
assert(diaCero.calificacionDia === 'cero', `Día Cero califica como "cero"`);

// Caso B1: Día Bajo con Déficit (solo 2 artículos: 1 café + 1 raspado)
const diaBajoDeficit = simularDiaVentaInteractivo({
  articulosVendidosMap: {
    hp_espresso_americano: 1,
    hp_raspado: 1
  },
  negocioId: 'hawaiian_paradise',
  diasLaborales: 26,
  gastosFijosMensuales: peHP.costosFijos.gastosFijosTotales
});
assert(diaBajoDeficit.totalArticulosDia === 2, `Día Bajo Deficit tiene 2 artículos vendidos`);
assert(diaBajoDeficit.utilidadNetaDia < 0, `Día de 2 artículos vende menos de lo necesario para pagar gastos (déficit de -$${Math.round(Math.abs(diaBajoDeficit.utilidadNetaDia))})`);
assert(diaBajoDeficit.calificacionDia === 'bajo_deficit', `Calificación es bajo_deficit`);

// Caso B2: Día Bajo en Equilibrio (6 artículos: 1 crepa, 2 cafés, 1 raspado, 1 smoothie, 1 marquesita)
const diaBajoEquilibrio = simularDiaVentaInteractivo({
  articulosVendidosMap: {
    hp_crepa: 1,
    hp_espresso_americano: 2,
    hp_raspado: 1,
    hp_smoothie: 1,
    hp_marquesita: 1
  },
  negocioId: 'hawaiian_paradise',
  diasLaborales: 26,
  gastosFijosMensuales: peHP.costosFijos.gastosFijosTotales
});
assert(diaBajoEquilibrio.totalArticulosDia === 6, `Día Bajo Equilibrio tiene 6 artículos vendidos`);
assert(diaBajoEquilibrio.utilidadNetaDia >= 0 && diaBajoEquilibrio.utilidadNetaDia < 300, `Día de 6 artículos cubre lo mismo o muy cerca del punto de equilibrio (+$${Math.round(diaBajoEquilibrio.utilidadNetaDia)})`);
assert(diaBajoEquilibrio.calificacionDia === 'bajo_equilibrio', `Calificación es bajo_equilibrio`);

// Caso C: Día Alto (suficientes ventas para ritmo de $20k libres)
const calibHP = calibrarNivelesVentaFinancieros({ negocioId: 'hawaiian_paradise', diasLaborales: 26, reciboLuzReal: 1000 });
const artsDiaAlto = {};
Object.entries(calibHP.escenarios.alto.cantidades).forEach(([pId, qMes]) => {
  artsDiaAlto[pId] = Math.round(qMes / 26);
});

const diaAltoReal = simularDiaVentaInteractivo({
  articulosVendidosMap: artsDiaAlto,
  negocioId: 'hawaiian_paradise',
  diasLaborales: 26,
  gastosFijosMensuales: peHP.costosFijos.gastosFijosTotales
});
assert(diaAltoReal.utilidadNetaDia >= 750, `Día Alto genera >= $750 MXN netos/día para sumar $20,000/mes (actual: $${Math.round(diaAltoReal.utilidadNetaDia)})`);
// -----------------------------------------------------------------------------
// PRUEBA 7: Salario Mínimo General Vigente y Equivalencias
// -----------------------------------------------------------------------------
console.log('\n--- TEST 7: Salario Mínimo General y Equivalencias ---');
assert(SALARIO_MINIMO_CONFIG.diario === 248.93, `Salario mínimo diario oficial = $248.93 MXN`);
assert(Math.abs(SALARIO_MINIMO_CONFIG.mensual - 7567.472) < 0.01, `Salario mínimo mensual oficial (30.4 días) = $7,567.47 MXN`);

const equivExacta = calcularSalariosMinimosEquivalentes(7567.47);
assert(equivExacta === 1.0, `Sueldo de $7,567.47 equivale exactamente a 1.00 Salarios Mínimos (actual: ${equivExacta})`);

const equiv8500 = calcularSalariosMinimosEquivalentes(8500.00);
assert(equiv8500 === 1.12, `Sueldo de $8,500 equivale a 1.12 Salarios Mínimos (actual: ${equiv8500})`);

// -----------------------------------------------------------------------------
// PRUEBA 8: Carga Social Patronal IMSS + Infonavit (~26.5%)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 8: Carga Social Patronal IMSS e Infonavit ---');
const carga8500 = calcularCargaSocialEmpleado(8500.00);
assert(carga8500.imssPatronal === 8500 * 0.265, `Carga patronal IMSS al 26.5% para $8,500 = $2,252.50 (actual: ${carga8500.imssPatronal})`);
assert(carga8500.costoTotalEmpresa === 8500 + 2252.50, `Costo total empresa = $10,752.50 (actual: ${carga8500.costoTotalEmpresa})`);

// -----------------------------------------------------------------------------
// PRUEBA 9: Nómina, Turnos y Horarios por Negocio
// -----------------------------------------------------------------------------
console.log('\n--- TEST 9: Plantillas de Nómina y Turnos de los 7 Negocios ---');
const negociosNominaKeys = Object.keys(PLANTILLA_DEFAULT_NEGOCIOS);
assert(negociosNominaKeys.length === 7, `Debe haber configuración de nómina para los 7 negocios`);

// Hawaiian Paradise: 2 turnos, 2 empleados/turno = 4 empleados
const nomHP = calcularNominaNegocio({ negocioId: 'hawaiian_paradise' });
assert(nomHP.turnosPorDia === 2, `Hawaiian Paradise tiene 2 turnos`);
assert(nomHP.empleadosPorTurno === 2, `Hawaiian Paradise tiene 2 empleados por turno`);
assert(nomHP.totalEmpleados === 4, `Hawaiian Paradise tiene 4 empleados registrados`);
assert(nomHP.totalSueldosBrutos === 33000, `Hawaiian Paradise sueldos brutos = $33,000 MXN (8.5k+8k+8.5k+8k)`);
assert(nomHP.totalImssPatronal === 33000 * 0.265, `Hawaiian Paradise IMSS patronal = $8,745 MXN`);
assert(nomHP.totalGastoLaboral === 33000 + 8745, `Hawaiian Paradise costo laboral total = $41,745 MXN`);

// Taller de Costura: 2 costureras
const nomCostura = calcularNominaNegocio({ negocioId: 'taller_costura' });
assert(nomCostura.totalEmpleados === 2, `Taller de Costura tiene 2 costureras`);
assert(nomCostura.totalSueldosBrutos === 17000, `Taller de Costura sueldos = $17,000 MXN`);

// -----------------------------------------------------------------------------
// PRUEBA 10: Integración de Nómina + IMSS a Gastos Fijos y Meta de $20,000 MXN Libres
// -----------------------------------------------------------------------------
console.log('\n--- TEST 10: Integración a Gastos Fijos y Recálculo del Punto de Equilibrio ---');
const calibHPConNomina = calibrarNivelesVentaFinancieros({
  negocioId: 'hawaiian_paradise',
  diasLaborales: 26,
  reciboLuzReal: 1000,
  configNomina: PLANTILLA_DEFAULT_NEGOCIOS.hawaiian_paradise
});

const cfHP = calibHPConNomina.costosFijos;
assert(cfHP.sueldosBrutos === 33000, `Gastos fijos incluyen sueldos brutos de $33,000`);
assert(cfHP.imssPatronal === 8745, `Gastos fijos incluyen Seguro Social IMSS de $8,745`);
assert(cfHP.totalCostoLaboral === 41745, `Costo laboral total = $41,745`);

const rentaHP = TABLA_RENTAS_INMUEBLE.hawaiian_paradise.rentaConIva;
const aguaHP = TABLA_AGUA_INMUEBLE.hawaiian_paradise.montoMensual;
const luzHP = 1000;
const gfEsperados = rentaHP + aguaHP + luzHP + 41745;
assert(Math.abs(cfHP.gastosFijosTotales - gfEsperados) < 0.01, `Gastos fijos totales suman Renta + Agua + Luz + Nómina con IMSS = $${Math.round(gfEsperados)} (actual: $${Math.round(cfHP.gastosFijosTotales)})`);

// Y la meta de $20,000 libres en Mes Alto se recalcula exitosamente para absorber esta nómina
const altoHPConNomina = calibHPConNomina.escenarios.alto;
const difMetaAltoNomina = Math.abs(altoHPConNomina.pnl.utilidadNeta - 20000);
assert(difMetaAltoNomina < 150, `Hawaiian Paradise Mes Alto genera $20,000 libres tras pagar renta, agua, CFE y nómina con IMSS (actual: $${Math.round(altoHPConNomina.pnl.utilidadNeta)})`);

// -----------------------------------------------------------------------------
// PRUEBA 11: Sincronización Reactiva de Plantilla de Empleados
// -----------------------------------------------------------------------------
console.log('\n--- TEST 11: Sincronización Reactiva de Plantilla de Empleados ---');

// Caso A: Cambiar a 2 turnos con 3 empleados por turno = 6 empleados
const plantilla6 = sincronizarPlantillaEmpleados({
  empleadosActuales: [
    { id: 'emp_1', nombre: 'Juan', puesto: 'Cajero', turno: 1, sueldoMensual: 8000 }
  ],
  turnosPorDia: 2,
  empleadosPorTurno: 3,
  negocioId: 'hawaiian_paradise',
  sueldoBaseSugerido: 8000
});
assert(plantilla6.length === 6, `Plantilla sincronizada a 2 turnos x 3 empleados = 6 plazas (actual: ${plantilla6.length})`);
assert(plantilla6.filter(e => e.turno === 1).length === 3, `Turno 1 tiene exactamente 3 empleados`);
assert(plantilla6.filter(e => e.turno === 2).length === 3, `Turno 2 tiene exactamente 3 empleados`);

// Caso B: Reducir a 1 turno con 1 empleado = 1 empleado
const plantilla1 = sincronizarPlantillaEmpleados({
  empleadosActuales: plantilla6,
  turnosPorDia: 1,
  empleadosPorTurno: 1,
  negocioId: 'hawaiian_paradise'
});
assert(plantilla1.length === 1, `Plantilla reducida a 1 turno x 1 empleado = 1 plaza (actual: ${plantilla1.length})`);
assert(plantilla1[0].turno === 1, `El empleado remanente queda en Turno 1`);

// -----------------------------------------------------------------------------
// PRUEBA 12: Horas Extras Reforma LFT 2027 (Jornada > 8 hrs en 1 Turno)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 12: Horas Extras Reforma LFT 2027 ---');
// Jornada de 10 horas continuas (ej. 09:00 a 19:00) en 1 solo turno con sueldo $8,000 MXN
const he10h = calcularHorasExtrasLFT({
  horasJornada: 10,
  turnosPorDia: 1,
  diasSemana: 6,
  sueldoMensual: 8000
});

assert(he10h.aplicaHorasExtras === true, `Aplica horas extras para jornada de 10 horas en 1 turno`);
assert(he10h.horasExtrasDia === 2, `Exceso de jornada legal: 10h - 8h = 2 horas extras diarias`);
assert(he10h.horasExtrasSemana === 12, `Horas extras semanales (6 días): 2h x 6 = 12 horas/semana`);
assert(he10h.horasDoblesSemana === 9, `Primeras 9 horas semanales al 200% (horas dobles Art. 66 y 67 LFT)`);
assert(he10h.horasTriplesSemana === 3, `Excedente sobre 9h = 3 horas semanales al 300% (horas triples Art. 68 LFT)`);
assert(he10h.montoTotalHorasExtrasMes > 0, `Monto total mensual de horas extras = $${he10h.montoTotalHorasExtrasMes} MXN`);

// Si se divide en 2 turnos (ej. 2 turnos de 5 horas), no debe haber horas extras
const he2Turnos = calcularHorasExtrasLFT({
  horasJornada: 10,
  turnosPorDia: 2,
  diasSemana: 6,
  sueldoMensual: 8000
});
assert(he2Turnos.aplicaHorasExtras === false, `Dividir en 2 turnos elimina el sobrecosto de horas extras`);
assert(he2Turnos.montoTotalHorasExtrasMes === 0, `Monto de horas extras con 2 turnos = $0`);

// Integración en calcularNominaNegocio para jornada de 10 horas en 1 turno
const nomina10h1Turno = calcularNominaNegocio({
  configNegocio: {
    negocioId: 'imperia_uniformes',
    nombreNegocio: 'Imperia Uniformes',
    horarioApertura: '09:00',
    horarioCierre: '19:00', // 10 horas
    turnosPorDia: 1,
    empleadosPorTurno: 1,
    empleados: [
      { id: 'iu_1', nombre: 'Encargada', puesto: 'Ventas', turno: 1, sueldoMensual: 8000 }
    ]
  }
});
assert(nomina10h1Turno.superaJornadaLegal === true, `Jornada supera legal (10h > 8h)`);
assert(nomina10h1Turno.sugiereDosTurnos === true, `Sistema sugiere 2 turnos`);
assert(nomina10h1Turno.totalHorasExtras > 0, `Nómina incluye sobrecosto de horas extras ($${nomina10h1Turno.totalHorasExtras})`);
assert(nomina10h1Turno.totalPercepciones === 8000 + nomina10h1Turno.totalHorasExtras, `Percepciones totales suman sueldo base + horas extras`);
assert(nomina10h1Turno.totalGastoLaboral > 8000 * 1.265, `Gasto laboral total integra horas extras y cuota IMSS sobre percepción`);

// -----------------------------------------------------------------------------
// PRUEBA 13: Modificación del Catálogo de Precios, Costos y Fórmulas Automáticas
// -----------------------------------------------------------------------------
console.log('\n--- TEST 13: Catálogo de Precios y Costos Modificables vs Automáticos ---');

const prodOriginal = CATALOGO_PRECIOS_COSTOS.hawaiian_paradise[0]; // Crepa
const prodModificado = calcularMargenProducto({
  ...prodOriginal,
  precioVenta: 75.00, // Usuario cambia precio a $75.00
  costoMateriales: 22.00, // Usuario cambia materias primas a $22.00
  costoManoObra: 6.00 // Usuario cambia mano de obra a $6.00
  // costoLuzUnitario se conserva automáticamente de la receta
});

assert(prodModificado.precioVenta === 75.00, `Precio de venta modificado = $75.00`);
assert(prodModificado.costoMateriales === 22.00, `Costo materiales modificado = $22.00`);
assert(prodModificado.costoManoObra === 6.00, `Costo mano de obra modificado = $6.00`);
assert(prodModificado.costoLuzUnitario === prodOriginal.costoLuzUnitario, `Costo luz unitario protegido automáticamente de la receta`);

const costoVarEsperado = 22.00 + 6.00 + prodOriginal.costoLuzUnitario;
assert(Math.abs(prodModificado.costoVariableTotal - costoVarEsperado) < 0.01, `Costo variable total calculado auto = Mat + MO + Luz = $${costoVarEsperado.toFixed(2)} (actual: $${prodModificado.costoVariableTotal})`);

const mcEsperado = 75.00 - costoVarEsperado;
assert(Math.abs(prodModificado.margenBruto - mcEsperado) < 0.01, `Margen bruto calculado auto = P - Cvar = $${mcEsperado.toFixed(2)} (actual: $${prodModificado.margenBruto})`);

const pctEsperado = (mcEsperado / 75.00) * 100;
assert(Math.abs(prodModificado.margenPct - pctEsperado) < 0.1, `Margen % calculado auto = ${(pctEsperado).toFixed(1)}% (actual: ${prodModificado.margenPct}%)`);
console.log('================================================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🏆 ¡TODAS LAS PRUEBAS FINANCIERAS Y MATEMÁTICAS PASARON CON ÉXITO!');
  process.exit(0);
}
