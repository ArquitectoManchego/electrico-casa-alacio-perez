import assert from 'node:assert/strict';
import {
  MESES_INFO,
  CATALOGO_EVENTOS_MEXICO,
  PERFILES_ESTACIONALES_NEGOCIOS,
  obtenerCampanasParaLanzarEnMes,
  obtenerEventosCelebradosEnMes,
  calcularMultiplicadorEstacional,
  generarCurvaAnualNegocio
} from '../src/utils/motorTemporadasYEventos.js';

console.log('🧪 Iniciando verificación de Temporadas, Calendario de Eventos en México y Publicidad Anticipada...');

// 1. Verificación de meses
assert.equal(MESES_INFO.length, 12, 'Deben existir 12 meses');
assert.equal(MESES_INFO[7].nombre, 'Agosto', 'Mes 8 debe ser Agosto');
console.log('✅ 1. 12 meses del año verificados.');

// 2. Verificación de regla: Publicidad se lanza 1 mes antes (Lead Time 30 días)
CATALOGO_EVENTOS_MEXICO.forEach(ev => {
  assert.ok(ev.diasAnticipacion >= 30, `Evento ${ev.nombre} debe tener al menos 30 días de anticipación`);
  const mesLanzamientoEsperado = ev.mesEvento === 1 ? 12 : ev.mesEvento - 1;
  assert.equal(
    ev.mesLanzamientoPublicidad, 
    mesLanzamientoEsperado, 
    `Evento ${ev.nombre} (Mes ${ev.mesEvento}) debe lanzarse en Mes ${mesLanzamientoEsperado}`
  );
  assert.ok(ev.productosEstrella.length > 0, `Evento ${ev.nombre} debe tener productos estrella`);
});
console.log('✅ 2. Regla estratégica validada: Todos los eventos lanzan publicidad exactamente 1 mes antes.');

// 3. Verificar eventos clave mencionados por el usuario
const eventosNombres = CATALOGO_EVENTOS_MEXICO.map(e => e.id);
const esperados = [
  'super_bowl', 
  'san_valentin', 
  'san_patricio', 
  'dia_madre', 
  'dia_padre', 
  'regreso_clases', 
  'fiestas_patrias', 
  'formula_1', 
  'navidad_ano_nuevo'
];
esperados.forEach(id => {
  assert.ok(eventosNombres.includes(id), `Falta evento clave: ${id}`);
});
console.log('✅ 3. Todos los eventos solicitados por el usuario están presentes en el catálogo maestro.');

// 4. Verificación de Imperia Uniformes en Agosto (Regreso a Clases)
const impAgosto = calcularMultiplicadorEstacional({
  negocioId: 'imperia_uniformes',
  mes: 8,
  esQuincena: false,
  publicidadContraciclica: true
});
assert.ok(impAgosto.factorTotal >= 2.0, 'Imperia en Agosto debe duplicar su demanda base por regreso a clases');
assert.equal(impAgosto.escenarioEquivalente, 'muy_alto');
console.log(`✅ 4. Imperia Uniformes en Agosto: Factor ${impAgosto.factorTotal}x (Escenario: ${impAgosto.escenarioEquivalente}).`);

// 5. Verificación de Zona Universitaria en Vacaciones (Julio) sin vs con Publicidad
const hpJulioSinPubli = calcularMultiplicadorEstacional({
  negocioId: 'hawaiian_paradise',
  mes: 7,
  esQuincena: false,
  publicidadContraciclica: false
});
const hpJulioConPubli = calcularMultiplicadorEstacional({
  negocioId: 'hawaiian_paradise',
  mes: 7,
  esQuincena: false,
  publicidadContraciclica: true
});

assert.ok(hpJulioSinPubli.factorTotal < 0.50, 'Sin publicidad, cafetería cae fuertemente en vacaciones de verano');
assert.ok(hpJulioConPubli.factorTotal > hpJulioSinPubli.factorTotal, 'La publicidad contracíclica debe recuperar la afluencia');
console.log(`✅ 5. Hawaiian Paradise en Vacaciones de Julio: Sin Publicidad: ${hpJulioSinPubli.factorTotal}x vs Con Publicidad: ${hpJulioConPubli.factorTotal}x.`);

// 6. Verificación de Efecto Quincenal
const quincenaOff = calcularMultiplicadorEstacional({ negocioId: 'imperia_uniformes', mes: 3, esQuincena: false });
const quincenaOn = calcularMultiplicadorEstacional({ negocioId: 'imperia_uniformes', mes: 3, esQuincena: true });
assert.ok(quincenaOn.factorTotal > quincenaOff.factorTotal, 'Quincena debe incrementar la demanda');
assert.equal(quincenaOn.incrementoQuincenaPct, 35, 'Incremento de quincena en mostrador debe ser 35%');
console.log(`✅ 6. Efecto Quincenal en Imperia: Sube de ${quincenaOff.factorTotal}x a ${quincenaOn.factorTotal}x (+35%).`);

// 7. Campañas que se lanzan en Julio (para eventos de Agosto como Fiestas Patrias)
const campanasJulio = obtenerCampanasParaLanzarEnMes(7);
assert.ok(campanasJulio.some(c => c.id === 'regreso_clases'), 'En Julio se debe lanzar preventa de Regreso a Clases de Agosto');
console.log('✅ 7. En Julio se lanza la campaña masiva de Regreso a Clases para entrega en Agosto.');

// 8. Campañas de Enero (para San Valentín y Super Bowl de Febrero)
const campanasEnero = obtenerCampanasParaLanzarEnMes(1);
assert.ok(campanasEnero.some(c => c.id === 'san_valentin'), 'En Enero se debe lanzar San Valentín de Febrero');
assert.ok(campanasEnero.some(c => c.id === 'super_bowl'), 'En Enero se debe lanzar Super Bowl de Febrero');
console.log('✅ 8. En Enero se lanzan campañas de San Valentín y Super Bowl.');

console.log('\n🎉 ¡TODAS LAS PRUEBAS DE TEMPORADAS Y PUBLICIDAD PASARON CON ÉXITO!');
