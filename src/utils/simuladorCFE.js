/**
 * Simulador de Consumo Eléctrico y Facturación Financiera CFE (Tarifa Residencial 1C Bimensual & MEM)
 */

/**
 * Calcula el consumo de energía diario en kiloWatt-horas (kWh) de un aparato.
 * @param {object} aparato - Objeto con datos del aparato.
 * @returns {number} Consumo diario en kWh.
 */
export function calcularKwhDiarioAparato(aparato) {
  const watts = parseFloat(aparato.watts) || 0;
  
  // Si consumoVariable está ACTIVADO
  if (aparato.consumoVariable) {
    const tAlta = parseFloat(aparato.horasAlta) || 0;
    const tReposo = parseFloat(aparato.horasReposo) || 0;
    
    // En periodo de alta demanda: 100% de Watts
    // En periodo de reposo: 20% de Watts
    const whDiario = (watts * tAlta) + (watts * 0.20 * tReposo);
    return whDiario / 1000;
  }
  
  // Si consumoVariable está DESACTIVADO
  let tStd = parseFloat(aparato.horasAlta) || 0;
  const nombreLower = (aparato.tipo || '').toLowerCase();
  if (nombreLower.includes('refrigerador') || nombreLower.includes('congeladora') || nombreLower.includes('enfriador') || nombreLower.includes('chiller')) {
    tStd = 24;
  }
  
  const whDiario = watts * tStd;
  return whDiario / 1000;
}

/**
 * Calcula el desglose de facturación CFE completo basado en Tarifa 1C y Mercado Eléctrico Mayorista (MEM)
 * @param {number} kwhPeriodo - Consumo total en el periodo facturado (kWh).
 * @param {object} tarifas - Precios y límites de los escalones de energía CFE.
 * @param {object} costosMEM - Cargos unitarios del Mercado Eléctrico Mayorista.
 * @returns {object} Desglose completo de energía, MEM y totales de factura.
 */
export function calcularCobroCFECompleto(kwhPeriodo, tarifas, costosMEM) {
  const kwh = Math.max(0, parseFloat(kwhPeriodo) || 0);

  // 1. Cargar variables de configuración de tarifas con opcional chaining
  const limBasico = parseFloat(tarifas?.basico?.limit) || 300;
  const costBasico = parseFloat(tarifas?.basico?.costo) || 1.004;

  const limInt1 = parseFloat(tarifas?.intermedio1?.limit) || 300;
  const costInt1 = parseFloat(tarifas?.intermedio1?.costo) || 1.163;

  const limInt2 = parseFloat(tarifas?.intermedio2?.limit) || 300;
  const costInt2 = parseFloat(tarifas?.intermedio2?.costo) || 1.495;

  const costExcedente = parseFloat(tarifas?.excedente?.costo) || 3.992;

  let restante = kwh;

  // Escalón Básico
  const kwhBasico = Math.min(restante, limBasico);
  const costoBasico = kwhBasico * costBasico;
  restante -= kwhBasico;

  // Escalón Intermedio 1
  const kwhInt1 = Math.min(restante, limInt1);
  const costoInt1 = kwhInt1 * costInt1;
  restante -= kwhInt1;

  // Escalón Intermedio 2
  const kwhInt2 = Math.min(restante, limInt2);
  const costoInt2 = kwhInt2 * costInt2;
  restante -= kwhInt2;

  // Escalón Excedente
  const kwhExcedente = Math.max(0, restante);
  const costoExcedente = kwhExcedente * costExcedente;

  const subtotalEnergia = costoBasico + costoInt1 + costoInt2 + costoExcedente;
  const iva = subtotalEnergia * 0.16;
  const totalFactura = subtotalEnergia + iva;

  // 2. Mercado Eléctrico Mayorista (MEM) - Desglose de Costos de Suministro
  const memSuministro = parseFloat(costosMEM?.suministro) || 127.26;
  const memDistribucion = kwh * (parseFloat(costosMEM?.distribucion) || 1.339102);
  const memTransmision = kwh * (parseFloat(costosMEM?.transmision) || 0.180102);
  const memCenace = kwh * (parseFloat(costosMEM?.cenace) || 0.007602);
  const memEnergia = kwh * (parseFloat(costosMEM?.energia) || 0.7550);
  const memCapacidad = kwh * (parseFloat(costosMEM?.capacidad) || 0.4840);
  const memScnmem = kwh * (parseFloat(costosMEM?.scnmem) || 0.0069);

  const totalMEM = memSuministro + memDistribucion + memTransmision + memCenace + memEnergia + memCapacidad + memScnmem;

  return {
    energia: {
      basico: { kwh: kwhBasico, costo: costoBasico },
      intermedio1: { kwh: kwhInt1, costo: costoInt1 },
      intermedio2: { kwh: kwhInt2, costo: costoInt2 },
      excedente: { kwh: kwhExcedente, costo: costoExcedente },
      subtotal: subtotalEnergia
    },
    mem: {
      suministro: memSuministro,
      distribucion: memDistribucion,
      transmision: memTransmision,
      cenace: memCenace,
      energia: memEnergia,
      capacidad: memCapacidad,
      scnmem: memScnmem,
      total: totalMEM
    },
    factura: {
      subtotal: subtotalEnergia,
      iva: iva,
      total: totalFactura
    }
  };
}

/**
 * Calcula la facturación mensual aplicando la tarifa comercial escalonada marginal de CFE.
 * @param {number} kwhMensual - Consumo consolidado mensual en kWh.
 * @param {object} tarifas - Configuración de tarifas editables.
 * @returns {object} Desglose detallado por escalón y costo total.
 */
export function calcularCobroMarginal(kwhMensual, tarifas) {
  const kwh = Math.max(0, parseFloat(kwhMensual) || 0);
  
  // Cargar variables de configuración de tarifas de prueba
  const limBasico = parseFloat(tarifas?.basico?.limit) || 100;
  const costBasico = parseFloat(tarifas?.basico?.costo) || 2.50;
  
  const limIntermedio = parseFloat(tarifas?.intermedio?.limit || tarifas?.intermedio1?.limit) || 200;
  const costIntermedio = parseFloat(tarifas?.intermedio?.costo || tarifas?.intermedio1?.costo) || 3.20;
  
  const costExcedente = parseFloat(tarifas?.excedente?.costo) || 4.80;

  let restante = kwh;

  // 1. Escalón Básico
  const kwhBasico = Math.min(restante, limBasico);
  const costoBasico = kwhBasico * costBasico;
  restante -= kwhBasico;

  // 2. Escalón Intermedio
  const kwhIntermedio = Math.min(restante, limIntermedio);
  const costoIntermedio = kwhIntermedio * costIntermedio;
  restante -= kwhIntermedio;

  // 3. Escalón Excedente
  const kwhExcedente = Math.max(0, restante);
  const costoExcedente = kwhExcedente * costExcedente;

  // Total
  const total = costoBasico + costoIntermedio + costoExcedente;

  return {
    basico: { kwh: kwhBasico, costo: costoBasico },
    intermedio: { kwh: kwhIntermedio, costo: costoIntermedio },
    excedente: { kwh: kwhExcedente, costo: costoExcedente },
    total: total
  };
}

