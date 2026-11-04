import { 
  CATALOGO_POLITICAS_NEGOCIOS, 
  calcularAhorroPoliticasNegocio, 
  calcularConsolidadoPoliticasConsorcio 
} from '../src/utils/motorPoliticasEficiencia.js';

console.log('--- TEST 1: Verificar que los 7 negocios están presentes ---');
const negociosIds = Object.keys(CATALOGO_POLITICAS_NEGOCIOS);
console.log('Negocios encontrados:', negociosIds.length, negociosIds);

if (negociosIds.length !== 7) {
  throw new Error(`Se esperaban 7 negocios, pero se encontraron ${negociosIds.length}`);
}

console.log('\n--- TEST 2: Validar cada negocio y sus equipos ---');
let totalEquiposConsorcio = 0;
let totalPoliticasConsorcio = 0;

negociosIds.forEach(negId => {
  const neg = CATALOGO_POLITICAS_NEGOCIOS[negId];
  console.log(`\nNegocio: ${neg.nombre} (${neg.id}) - Medidor: ${neg.medidorId}`);
  console.log(`  Equipos (${neg.equipos.length}):`);
  
  if (neg.equipos.length === 0) {
    throw new Error(`El negocio ${negId} no tiene equipos definidos`);
  }

  neg.equipos.forEach(eq => {
    totalEquiposConsorcio++;
    const activas = eq.politicasActivas || [];
    const pasivas = eq.politicasPasivas || [];
    const usuario = eq.accionesUsuario || [];
    const totalEq = activas.length + pasivas.length + usuario.length;
    totalPoliticasConsorcio += totalEq;

    console.log(`    - [${eq.icono}] ${eq.nombre} (${eq.watts}W)`);
    console.log(`      Activas: ${activas.length} | Pasivas: ${pasivas.length} | Usuario: ${usuario.length} => Total: ${totalEq}`);

    if (totalEq === 0) {
      throw new Error(`El equipo ${eq.id} de ${negId} no tiene políticas configuradas`);
    }

    // Verificar estructura de cada política
    [...activas, ...pasivas, ...usuario].forEach(pol => {
      if (!pol.id || !pol.titulo || !pol.tipo || !pol.descripcion || !pol.beneficioVidaUtil) {
        throw new Error(`Política incompleta en equipo ${eq.id}: ${JSON.stringify(pol)}`);
      }
    });
  });

  // Ejecutar cálculo individual
  const calc = calcularAhorroPoliticasNegocio({ negocioId: negId });
  console.log(`  -> Cálculo Default:`);
  console.log(`     Ahorro kWh/mes: ${calc.totalAhorroKwhMes} kWh`);
  console.log(`     Ahorro $/mes: $${calc.ahorroPesosMes.toLocaleString()} MXN`);
  console.log(`     Ahorro $/año: $${calc.ahorroPesosAnual.toLocaleString()} MXN`);
  console.log(`     Inversión: $${calc.inversionImplementacionTotal.toLocaleString()} MXN`);
  console.log(`     Vida útil ganada: +${calc.anosVidaUtilGanados} años`);
});

console.log('\n--- TEST 3: Validar cálculo consolidado de consorcio ---');
const cons = calcularConsolidadoPoliticasConsorcio({});
console.log('Ahorro Consorcio kWh/mes:', cons.ahorroKwhMesConsorcio);
console.log('Ahorro Consorcio $/mes: $' + cons.ahorroPesosMesConsorcio.toLocaleString() + ' MXN');
console.log('Ahorro Consorcio $/año: $' + cons.ahorroPesosAnualConsorcio.toLocaleString() + ' MXN');
console.log('Inversión Total Consorcio: $' + cons.inversionConsorcioTotal.toLocaleString() + ' MXN');
console.log('Total Políticas en Consorcio:', cons.totalPoliticasTotales);
console.log('Políticas Activas:', cons.totalPoliticasActivas);

console.log('\n=========================================');
console.log(`VERIFICACIÓN EXITOSA:`);
console.log(`- 7 Negocios validados.`);
console.log(`- ${totalEquiposConsorcio} Equipos analizados.`);
console.log(`- ${totalPoliticasConsorcio} Políticas y propuestas implementadas.`);
console.log('=========================================');
