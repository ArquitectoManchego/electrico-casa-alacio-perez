import assert from 'node:assert/strict';
import { 
  CATALOGO_PARTES_DEFECTO, 
  detectarFamiliaPartes, 
  generarPiezasInicialesAparato,
  calcularMetricasEquipoCicloVida,
  calcularCicloVidaNegocio
} from '../src/utils/motorCicloVidaMantenimiento.js';

import {
  calcularPuntoEquilibrio,
  calibrarNivelesVentaFinancieros
} from '../src/utils/motorPuntoEquilibrio.js';

console.log('🧪 Iniciando verificación del Módulo de Ciclo de Vida y Mantenimiento de Maquinaria...');

// 1. Verificación de catálogo de partes por defecto
const familiasEsperadas = [
  'clima_inverter', 
  'bordadora_industrial', 
  'costura_industrial', 
  'impresion_digital', 
  'artes_graficas_taller', 
  'cafeteria_restaurante', 
  'computo_redes'
];

familiasEsperadas.forEach(fam => {
  assert.ok(CATALOGO_PARTES_DEFECTO[fam], `Falta familia: ${fam}`);
  assert.ok(CATALOGO_PARTES_DEFECTO[fam].length > 0, `Familia ${fam} no tiene partes`);
});
console.log('✅ 1. Todas las familias críticas de refacciones y mantenimiento existen en el catálogo.');

// 2. Detección automática de familias según tipo de aparato
assert.equal(detectarFamiliaPartes({ tipo: 'Minisplit Inverter 1.5 TR' }), 'clima_inverter');
assert.equal(detectarFamiliaPartes({ tipo: 'Bordadora Industrial AEMCO 4 Cabezas' }), 'bordadora_industrial');
assert.equal(detectarFamiliaPartes({ tipo: 'Máquina Overlock 5 Hilos' }), 'costura_industrial');
assert.equal(detectarFamiliaPartes({ tipo: 'Prensa Digital Xerox Versant 180' }), 'impresion_digital');
assert.equal(detectarFamiliaPartes({ tipo: 'Plotter Roland TrueVIS VG2-540' }), 'artes_graficas_taller');
assert.equal(detectarFamiliaPartes({ tipo: 'Máquina Espresso La Marzocco' }), 'cafeteria_restaurante');
assert.equal(detectarFamiliaPartes({ tipo: 'Servidor Dell PowerEdge y Switch' }), 'computo_redes');
console.log('✅ 2. Detección automática por palabras clave y familias superada.');

// 3. Cálculo de métricas individuales de un equipo (Bordadora Industrial)
const bordadora = {
  id: 'bordadora_test',
  tipo: 'Bordadora Industrial Tajima / AEMCO 4C',
  precio: 95000,
  vidaUtil: 10
};

const metricasBordadora = calcularMetricasEquipoCicloVida(bordadora);
assert.equal(metricasBordadora.desgasteAnual, 9500); // 95,000 / 10
assert.equal(metricasBordadora.desgasteMensual, 9500 / 12);
assert.ok(metricasBordadora.costoMantenimientoAnual > 0, 'Debe tener costo de mantenimiento anual');
assert.ok(metricasBordadora.costoTotalCicloVidaAnual === metricasBordadora.desgasteAnual + metricasBordadora.costoMantenimientoAnual);
console.log(`✅ 3. Bordadora Industrial: Desgaste Anual: $${metricasBordadora.desgasteAnual}/año, Mant: $${metricasBordadora.costoMantenimientoAnual}/año, Total Mensual: $${metricasBordadora.costoTotalCicloVidaMensual.toFixed(2)}/mes`);

// 4. Inclusión de pieza personalizada agregada por el usuario
const piezaPersonalizada = {
  id: 'sensor_rotura_hilo',
  nombre: 'Sensor Óptico de Hilo',
  tipo: 'correctivo',
  costoPieza: 1200,
  costoManoObra: 400,
  frecuenciaMeses: 24, // Cada 2 años -> 0.5 veces/año -> (1600 * 0.5) = $800/año
  sintomaFallo: 'Falso positivo de corte de hilo'
};

const metricasConPersonalizada = calcularMetricasEquipoCicloVida(bordadora, [
  ...metricasBordadora.piezas,
  piezaPersonalizada
]);

const deltaMantenimiento = metricasConPersonalizada.costoMantenimientoAnual - metricasBordadora.costoMantenimientoAnual;
assert.equal(Math.round(deltaMantenimiento), 800, 'El delta anual de mantenimiento debe ser exactamente $800');
console.log('✅ 4. Añadir refacción/pieza correctiva personalizada calculó exactamente $800/año adicional.');

// 5. Cálculo integral por negocio (Imperia Uniformes & Taller Costura)
const resImperia = calcularCicloVidaNegocio({ negocioId: 'imperia_uniformes' });
assert.ok(resImperia.resumenFinanciero.inversionTotalCapEx > 0);
assert.ok(resImperia.resumenFinanciero.gastoMantenimientoAnual > 0);
assert.ok(resImperia.resumenFinanciero.reservaDesgasteAnual > 0);
assert.ok(resImperia.resumenFinanciero.costoOperativoTotalMensual > 0);
console.log(`✅ 5. Imperia Uniformes: Inversión Maquinaria: $${resImperia.resumenFinanciero.inversionTotalCapEx}, Desgaste Anual: $${resImperia.resumenFinanciero.reservaDesgasteAnual}, Mant. Anual: $${resImperia.resumenFinanciero.gastoMantenimientoAnual}, Total Mensual Operativo: $${resImperia.resumenFinanciero.costoOperativoTotalMensual.toFixed(2)}`);

const resTaller = calcularCicloVidaNegocio({ negocioId: 'taller_costura' });
assert.ok(resTaller.resumenFinanciero.inversionTotalCapEx > 0);
console.log(`✅ 5b. Taller Costura: Inversión Maquinaria: $${resTaller.resumenFinanciero.inversionTotalCapEx}, Mant. Anual: $${resTaller.resumenFinanciero.gastoMantenimientoAnual}, Total Mensual Operativo: $${resTaller.resumenFinanciero.costoOperativoTotalMensual.toFixed(2)}`);

// 6. Integración con el Motor de Punto de Equilibrio y Finanzas
const peSinMant = calcularPuntoEquilibrio({
  negocioId: 'imperia_uniformes',
  costoMantenimientoEquipos: 0
});

const costoMantOperativo = resImperia.resumenFinanciero.costoOperativoTotalMensual;
const peConMant = calcularPuntoEquilibrio({
  negocioId: 'imperia_uniformes',
  costoMantenimientoEquipos: costoMantOperativo
});

assert.equal(
  Math.round(peConMant.costosFijos.gastosFijosTotales - peSinMant.costosFijos.gastosFijosTotales),
  Math.round(costoMantOperativo),
  'Los gastos fijos totales deben incrementarse exactamente por el costo mensual de mantenimiento'
);

assert.ok(
  peConMant.puntoEquilibrio.unidadesMes >= peSinMant.puntoEquilibrio.unidadesMes,
  'El punto de equilibrio debe ser mayor o igual al absorber el desgaste de maquinaria'
);
console.log(`✅ 6. Punto de Equilibrio con Maquinaria: Gastos fijos aumentan de $${Math.round(peSinMant.costosFijos.gastosFijosTotales)} a $${Math.round(peConMant.costosFijos.gastosFijosTotales)} (+ $${Math.round(costoMantOperativo)}/mes).`);

// 7. Calibración de Escenarios ($20,000 libres en mes alto)
const calib = calibrarNivelesVentaFinancieros({
  negocioId: 'imperia_uniformes',
  costoMantenimientoEquipos: costoMantOperativo
});

assert.ok(calib.escenarios.alto, 'Escenario alto debe existir');
const utilidadNetaAlto = calib.escenarios.alto.pnl.utilidadNeta;
assert.ok(Math.abs(utilidadNetaAlto - 20000) < 500, `Mes alto debe generar ~$20,000 libres cubriendo maquinaria. Obtenido: $${utilidadNetaAlto}`);
console.log(`✅ 7. Escenario Alto cumple rigurosamente la regla de negocio: $${Math.round(utilidadNetaAlto)} MXN libres tras cubrir maquinaria, renta, luz y nómina.`);

console.log('\n🎉 ¡TODAS LAS PRUEBAS DE CICLO DE VIDA Y MANTENIMIENTO PASARON EXITOSAMENTE!');
