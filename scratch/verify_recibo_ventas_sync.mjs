import { NEGOCIOS_CONFIG } from '../src/utils/equiposNegocios.js';
import { PROCESOS_POR_NEGOCIO } from '../src/utils/procesosNegocios.js';
import { 
  calibrarEscenariosNegocio, 
  simularNegocioCompleto, 
  simularConsorcioPorMedidores 
} from '../src/utils/motorSimulacionVentas.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log('--- TEST 1: Calibración de los 5 Escenarios de Ventas ---');
const negImperia = NEGOCIOS_CONFIG.find(n => n.id === 'imperia_uniformes');
const procImperia = PROCESOS_POR_NEGOCIO.imperia_uniformes;
const calibImperia = calibrarEscenariosNegocio(negImperia, procImperia);

assert(calibImperia.bajo !== undefined, 'Existe escenario bajo');
assert(calibImperia.tablas !== undefined, 'Existe escenario tablas');
assert(calibImperia.medio !== undefined, 'Existe escenario medio');
assert(calibImperia.alto !== undefined, 'Existe escenario alto');
assert(calibImperia.muy_alto !== undefined, 'Existe escenario muy_alto');
assert(calibImperia.equilibrio !== undefined, 'Existe alias equilibrio');
assert(calibImperia.buena !== undefined, 'Existe alias buena');

assert(calibImperia.tablas.saturacionCuelloBotella === 0.35, 'Saturación en tablas es 35%');
assert(calibImperia.alto.saturacionCuelloBotella === 0.80, 'Saturación en alto es 80%');
assert(calibImperia.muy_alto.saturacionCuelloBotella === 0.95, 'Saturación en muy_alto es 95%');

console.log('\n--- TEST 2: Simulación Consolidada Consorcio con escenarioGlobal ---');
const escList = ['bajo', 'tablas', 'medio', 'alto', 'muy_alto'];
const resultadosConsorcio = {};

escList.forEach(esc => {
  const sim = simularConsorcioPorMedidores({ escenarioGlobal: esc });
  resultadosConsorcio[esc] = sim;
  console.log(`Escenario [${esc.toUpperCase()}]: ${Math.round(sim.totalKwhPeriodoConsorcio)} kWh bimestrales | Factura Total: $${Math.round(sim.totalFacturaConsorcio)} MXN`);
});

assert(
  resultadosConsorcio.bajo.totalKwhPeriodoConsorcio < resultadosConsorcio.tablas.totalKwhPeriodoConsorcio,
  'Consumo Consorcio: bajo < tablas'
);
assert(
  resultadosConsorcio.tablas.totalKwhPeriodoConsorcio < resultadosConsorcio.medio.totalKwhPeriodoConsorcio,
  'Consumo Consorcio: tablas < medio'
);
assert(
  resultadosConsorcio.medio.totalKwhPeriodoConsorcio < resultadosConsorcio.alto.totalKwhPeriodoConsorcio,
  'Consumo Consorcio: medio < alto'
);
assert(
  resultadosConsorcio.alto.totalKwhPeriodoConsorcio < resultadosConsorcio.muy_alto.totalKwhPeriodoConsorcio,
  'Consumo Consorcio: alto < muy_alto'
);

assert(
  resultadosConsorcio.bajo.totalFacturaConsorcio < resultadosConsorcio.tablas.totalFacturaConsorcio,
  'Factura Consorcio: bajo < tablas'
);
assert(
  resultadosConsorcio.tablas.totalFacturaConsorcio < resultadosConsorcio.medio.totalFacturaConsorcio,
  'Factura Consorcio: tablas < medio'
);
assert(
  resultadosConsorcio.medio.totalFacturaConsorcio < resultadosConsorcio.alto.totalFacturaConsorcio,
  'Factura Consorcio: medio < alto'
);
assert(
  resultadosConsorcio.alto.totalFacturaConsorcio < resultadosConsorcio.muy_alto.totalFacturaConsorcio,
  'Factura Consorcio: alto < muy_alto'
);

console.log('\n--- TEST 3: Desglose por los 6 Medidores CFE ---');
const simTablas = resultadosConsorcio.tablas;
const medidoresKeys = Object.keys(simTablas.mapaMedidores);
assert(medidoresKeys.length === 6, 'Existen exactamente 6 medidores en consorcio');

medidoresKeys.forEach(medId => {
  const mData = simTablas.mapaMedidores[medId];
  assert(mData.kwhPeriodo > 0, `Medidor ${medId} tiene consumo positivo (${Math.round(mData.kwhPeriodo)} kWh)`);
  assert(mData.reciboCFE?.factura?.total > 0, `Medidor ${medId} tiene factura calculada ($${Math.round(mData.reciboCFE?.factura?.total)})`);
  assert(mData.negociosAsignados.length > 0, `Medidor ${medId} tiene negocios asignados (${mData.negociosAsignados.join(', ')})`);
});

console.log('\n--- TEST 4: Negocio Individual Simulación en 5 Escenarios ---');
const simIndivTablas = simularNegocioCompleto({
  negocioId: 'hawaiian_paradise',
  escenarioActivo: 'tablas'
});
const simIndivMuyAlto = simularNegocioCompleto({
  negocioId: 'hawaiian_paradise',
  escenarioActivo: 'muy_alto'
});

assert(simIndivTablas.totalKwhMes > 0, 'Hawaiian Paradise tablas kwh > 0');
assert(simIndivMuyAlto.totalKwhMes > simIndivTablas.totalKwhMes, 'Hawaiian Paradise muy_alto kwh > tablas kwh');
assert(simIndivMuyAlto.cobroCFE.factura.total > simIndivTablas.cobroCFE.factura.total, 'Hawaiian Paradise factura muy_alto > tablas');

console.log(`\n================================================================`);
console.log(`TOTAL PRUEBAS: ${passed + failed} | APROBADAS: ${passed} | FALLIDAS: ${failed}`);
if (failed === 0) {
  console.log('🏆 ¡SINCRONIZACIÓN DE RECIBO CFE Y CONSUMO POR VENTAS 100% VALIDADA!');
} else {
  process.exit(1);
}
