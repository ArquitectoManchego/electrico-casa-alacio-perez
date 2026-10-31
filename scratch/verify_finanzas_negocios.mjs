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
// RESUMEN
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL PRUEBAS EJECUTADAS: ${testsPassed + testsFailed}`);
console.log(`PRUEBAS PASADAS: ${testsPassed}`);
console.log(`PRUEBAS FALLADAS: ${testsFailed}`);
console.log('================================================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🏆 ¡TODAS LAS PRUEBAS FINANCIERAS Y MATEMÁTICAS PASARON CON ÉXITO!');
  process.exit(0);
}
