import { NEGOCIOS_CONFIG, vincularEquiposConInventario } from '../src/utils/equiposNegocios.js';
import { PROCESOS_POR_NEGOCIO } from '../src/utils/procesosNegocios.js';
import { 
  calcularDetalleProceso, 
  calibrarEscenariosNegocio, 
  simularNegocioCompleto, 
  simularConsorcioPorMedidores 
} from '../src/utils/motorSimulacionVentas.js';
import { generarSeedAparatos } from '../src/firebase.js';

console.log('=== SUITE DE VERIFICACIÓN AUTOMATIZADA: SIMULADOR DE VENTAS Y PROCESOS ===\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// =========================================================================
// PRUEBA 1: FÍSICA DE TAZAS EN PUBLI-IMPERIA (1 TAZA VS. 10 TAZAS EN LOTE)
// =========================================================================
console.log('--- PRUEBA 1: Física de Lotes (Tazas Publi-Imperia) ---');
const procesoTazas = PROCESOS_POR_NEGOCIO.taller_publi_imperia.find(p => p.id === 'pi_sub_tazas');
assert(!!procesoTazas, 'Proceso pi_sub_tazas encontrado en catálogo');

const seedPubli = generarSeedAparatos('taller_publi_imperia');
const mapaEquiposPubli = vincularEquiposConInventario('taller_publi_imperia', seedPubli);

// Caso A: 1 Taza suelta (L = 1)
const detTaza1 = calcularDetalleProceso(procesoTazas, 1, 1, mapaEquiposPubli);
const planchaTaza1Mins = detTaza1.desgloseEquipos.pi_plancha_tazas?.minutosMes || 0;
const epsonTaza1Mins = detTaza1.desgloseEquipos.pi_epson?.minutosMes || 0;

assert(Math.abs(planchaTaza1Mins - 8.0) < 0.01, `1 taza sola tarda exactamente 8.0 min de plancha (5m pre + 3m prensado): obtenido ${planchaTaza1Mins} min`);
assert(Math.abs(epsonTaza1Mins - 1.2) < 0.01, `1 taza sola tarda 1.2 min de impresión Epson: obtenido ${epsonTaza1Mins} min`);

// Caso B: 10 Tazas en lote (L = 10, Q = 10)
const detTazas10 = calcularDetalleProceso(procesoTazas, 10, 10, mapaEquiposPubli);
const planchaTazas10Mins = detTazas10.desgloseEquipos.pi_plancha_tazas?.minutosMes || 0;
const epsonTazas10Mins = detTazas10.desgloseEquipos.pi_epson?.minutosMes || 0;

// 5 min pre + 10x3m = 30m + 9x0.5m = 4.5m => 39.5 min
assert(Math.abs(planchaTazas10Mins - 39.5) < 0.01, `Lote de 10 tazas tarda exactamente 39.5 min de plancha (5m pre + 30m prensado + 4.5m pausas 30s): obtenido ${planchaTazas10Mins} min`);
assert(Math.abs(epsonTazas10Mins - 12.0) < 0.01, `Lote de 10 tazas tarda 12.0 min de Epson L120: obtenido ${epsonTazas10Mins} min`);
assert(detTazas10.ahorroLotePct > 45, `Ahorro energético del lote frente a unitario es >45%: obtenido ${detTazas10.ahorroLotePct.toFixed(1)}%`);


// =========================================================================
// PRUEBA 2: REGLA DE CALIBRACIÓN DE MES ALTO (80% CAPACIDAD LABORAL)
// =========================================================================
console.log('\n--- PRUEBA 2: Calibración al 80% de Capacidad en Mes Alto ---');
const talleresProductivos = [
  'taller_publi_imperia',
  'taller_costura',
  'bordados_veracruz',
  'papeleria_imperiarte',
  'hawaiian_paradise'
];

talleresProductivos.forEach(negId => {
  const seed = generarSeedAparatos(negId);
  const simAlto = simularNegocioCompleto({
    negocioId: negId,
    escenarioActivo: 'alto',
    aparatos: seed,
    diasLaborales: 26,
    horasTurno: 8.0,
    diasPeriodo: 30
  });

  const sat = simAlto.maxSaturacion;
  assert(sat >= 78.5 && sat <= 81.5, `${negId}: Equipo cuello de botella (${simAlto.equipoCuelloBotella}) saturado al 80% ± 1.5% (obtenido ${sat.toFixed(1)}%)`);

  // Ningún equipo debe superar el 100% de ocupación en horario laboral
  const sobrecargados = Object.values(simAlto.capacidadesEquipos).filter(eq => eq.rol === 'produccion' && eq.pctSaturacion > 100);
  assert(sobrecargados.length === 0, `${negId}: Ningún equipo de producción excede el 100% en horario regular`);
});


// =========================================================================
// PRUEBA 3: REGLA DE MEZCLA EN TALLER DE COSTURA (FILIPINAS/PANTALONES VS POLO)
// =========================================================================
console.log('\n--- PRUEBA 3: Regla de Mezcla en Taller de Costura ---');
const procesosCostura = PROCESOS_POR_NEGOCIO.taller_costura;
const filipina = procesosCostura.find(p => p.id === 'tc_filipina');
const pantalon = procesosCostura.find(p => p.id === 'tc_pantalon');
const polo = procesosCostura.find(p => p.id === 'tc_playera_polo_stretch');

const usaCollareteraFilipina = filipina.pasos.some(s => s.equipoKey === 'tc_collaretera_singer');
const usaCollareteraPantalon = pantalon.pasos.some(s => s.equipoKey === 'tc_collaretera_singer');
const usaCollareteraPolo = polo.pasos.some(s => s.equipoKey === 'tc_collaretera_singer');

assert(!usaCollareteraFilipina, 'Filipina NO utiliza máquina collaretera (solo recta y overlock)');
assert(!usaCollareteraPantalon, 'Pantalón NO utiliza máquina collaretera (solo recta y overlock)');
assert(usaCollareteraPolo, 'Playera Polo Stretch SÍ utiliza máquina collaretera');

const seedCostura = generarSeedAparatos('taller_costura');
const simCosturaAlto = simularNegocioCompleto({
  negocioId: 'taller_costura',
  escenarioActivo: 'alto',
  aparatos: seedCostura,
  diasLaborales: 26,
  horasTurno: 8.0
});

const satCollaretera = simCosturaAlto.capacidadesEquipos.tc_collaretera_singer?.pctSaturacion || 0;
assert(satCollaretera < 20, `Máquina Collaretera se mantiene en uso bajo (<20%) incluso en Mes Alto: obtenido ${satCollaretera.toFixed(1)}%`);


// =========================================================================
// PRUEBA 4: AISLAMIENTO Y SUMA DE LOS 6 MEDIDORES CFE
// =========================================================================
console.log('\n--- PRUEBA 4: Aislamiento y Agregación de los 6 Medidores CFE ---');
const seedConsorcio = generarSeedAparatos('consorcio_general');
const simConsorcio = simularConsorcioPorMedidores({
  todosEstadosNegocios: {},
  aparatos: seedConsorcio,
  diasPeriodo: 30
});

const medKeys = Object.keys(simConsorcio.mapaMedidores);
assert(medKeys.length === 6, `Consorcio General cuenta con exactamente 6 medidores CFE (obtenido ${medKeys.length})`);

// Medidor 6 debe consolidar Publi-Imperia y Oficina Consorcio
const med6Asignados = simConsorcio.mapaMedidores.med_6?.negociosAsignados || [];
assert(med6Asignados.some(n => n.includes('Publi-Imperia')) && med6Asignados.some(n => n.includes('Oficina Consorcio')), `Medidor 6 consolida Publi-Imperia + Oficina Consorcio: [${med6Asignados.join(', ')}]`);

// Todos los medidores deben tener consumo mayor a cero y recibo CFE calculado
let todosConRecibo = true;
medKeys.forEach(k => {
  const m = simConsorcio.mapaMedidores[k];
  if (!m.reciboCFE || m.kwhPeriodo <= 0) todosConRecibo = false;
});
assert(todosConRecibo, 'Todos los 6 medidores generan recibo CFE independiente con kWh > 0');
assert(simConsorcio.totalFacturaConsorcio > 0, `Factura agregada del consorcio calculada: $${Math.round(simConsorcio.totalFacturaConsorcio).toLocaleString()} MXN`);


// =========================================================================
// PRUEBA 5: REGLAS DE IMPERIA UNIFORMES Y OFICINA CONSORCIO
// =========================================================================
console.log('\n--- PRUEBA 5: Cargas de Imperia Uniformes y Baja Ocupación Oficina ---');
const seedImperia = generarSeedAparatos('imperia_uniformes');
const simImperia = simularNegocioCompleto({
  negocioId: 'imperia_uniformes',
  escenarioActivo: 'alto',
  aparatos: seedImperia
});
const eqsImperia = Object.keys(simImperia.mapaEquipos);
assert(eqsImperia.includes('imp_ac') && eqsImperia.includes('imp_tpv') && eqsImperia.includes('imp_terminal') && eqsImperia.includes('imp_luces'), 'Imperia Uniformes contiene AC, TPV, Terminal y Luces');

const seedOficina = generarSeedAparatos('oficinas_consorcio');
const simOficinaAlto = simularNegocioCompleto({
  negocioId: 'oficinas_consorcio',
  escenarioActivo: 'alto',
  aparatos: seedOficina
});
const kwhOficinaAlto = simOficinaAlto.totalKwhMes;
assert(kwhOficinaAlto < 250, `Oficina Consorcio mantiene bajo consumo mensual (<250 kWh/mes en Mes Alto por baja ocupación): obtenido ${kwhOficinaAlto.toFixed(1)} kWh/mes`);

console.log(`\n======================================================`);
console.log(`RESUMEN: ${passedTests}/${totalTests} PRUEBAS PASADAS CON ÉXITO`);
console.log(`======================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
