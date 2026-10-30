/**
 * Prorrateo Matemático de Costos Fijos Inmobiliarios (Consorcio Gallegos González & Casa Alacio Pérez).
 * Renta: $9,000 + IVA ($10,440 MXN/mes) sobre 299.40 m² totales. Áreas comunes a cargo de Oficinas Corporativo.
 * Agua: $1,000 MXN/mes por puntos de servicio y afluencia.
 * Climatización: Altura 3.80 m sobre áreas específicas según relevamiento arquitectónico.
 */

export const SUPERFICIE_INMUEBLE = {
  plantaBajaTotalM2: 176.30,
  plantaAltaTotalM2: 123.10,
  superficieTotalConstruidaM2: 299.40,
  alturaPromedioMetros: 3.80,
  rentaMensualSinIva: 9000.00,
  ivaTasa: 0.16,
  rentaMensualConIva: 10440.00,
  reciboAguaMensualTotal: 1000.00
};

export const TABLA_RENTAS_INMUEBLE = {
  imperia_uniformes: {
    negocioId: 'imperia_uniformes',
    nombre: 'Imperia Uniformes',
    nivel: 'Planta Baja',
    areaPrivadaM2: 56.15,
    areaComunAbsorbidaM2: 0,
    areaTotalImputadaM2: 56.15,
    porcentajeInmueble: 18.7542,
    rentaSinIva: 1687.88,
    rentaConIva: 1957.94
  },
  hawaiian_paradise: {
    negocioId: 'hawaiian_paradise',
    nombre: 'Hawaiian Paradise',
    nivel: 'Planta Baja',
    areaPrivadaM2: 50.89,
    areaComunAbsorbidaM2: 0,
    areaTotalImputadaM2: 50.89,
    porcentajeInmueble: 16.9973,
    rentaSinIva: 1529.76,
    rentaConIva: 1774.52
  },
  taller_publi_imperia: {
    negocioId: 'taller_publi_imperia',
    nombre: 'Publi-Imperia (Impresos Imperia)',
    nivel: 'Planta Alta',
    areaPrivadaM2: 43.64,
    areaComunAbsorbidaM2: 0,
    areaTotalImputadaM2: 43.64,
    porcentajeInmueble: 14.5758,
    rentaSinIva: 1311.82,
    rentaConIva: 1521.72
  },
  bordados_veracruz: {
    negocioId: 'bordados_veracruz',
    nombre: 'Bordados Veracruz',
    nivel: 'Planta Baja',
    areaPrivadaM2: 35.83,
    areaComunAbsorbidaM2: 0,
    areaTotalImputadaM2: 35.83,
    porcentajeInmueble: 11.9673,
    rentaSinIva: 1077.05,
    rentaConIva: 1249.38
  },
  taller_costura: {
    negocioId: 'taller_costura',
    nombre: 'Taller de Costura Imperia',
    nivel: 'Planta Alta',
    areaPrivadaM2: 31.96,
    areaComunAbsorbidaM2: 0,
    areaTotalImputadaM2: 31.96,
    porcentajeInmueble: 10.6747,
    rentaSinIva: 960.72,
    rentaConIva: 1114.44
  },
  papeleria_imperiarte: {
    negocioId: 'papeleria_imperiarte',
    nombre: 'Papelería ImperiArte',
    nivel: 'Planta Baja',
    areaPrivadaM2: 25.48,
    areaComunAbsorbidaM2: 0,
    areaTotalImputadaM2: 25.48,
    porcentajeInmueble: 8.5104,
    rentaSinIva: 765.93,
    rentaConIva: 888.48
  },
  oficinas_consorcio: {
    negocioId: 'oficinas_consorcio',
    nombre: 'Oficinas Corporativo (Consorcio)',
    nivel: 'Planta Alta',
    areaPrivadaM2: 13.21,
    areaComunAbsorbidaM2: 42.24, // 5.29 escaleras PB + 2.66 remanente PB + 28.29 pasillos/vacío PA + 6.00 terraza PA
    areaTotalImputadaM2: 55.45,
    porcentajeInmueble: 18.5203,
    rentaSinIva: 1666.84,
    rentaConIva: 1933.52
  }
};

export const TABLA_AGUA_INMUEBLE = {
  hawaiian_paradise: {
    negocioId: 'hawaiian_paradise',
    nombre: 'Hawaiian Paradise',
    porcentaje: 50.0,
    montoMensual: 500.00,
    justificacion: 'Tarja continua para lavado de trastes/preparación + baño de clientes + baño de personal'
  },
  taller_costura: {
    negocioId: 'taller_costura',
    nombre: 'Taller de Costura',
    porcentaje: 15.0,
    montoMensual: 150.00,
    justificacion: 'Baño propio utilizado activamente por 1 a 3 costureras en jornada completa'
  },
  imperia_uniformes: {
    negocioId: 'imperia_uniformes',
    nombre: 'Imperia Uniformes',
    porcentaje: 10.0,
    montoMensual: 100.00,
    justificacion: '1 solo baño activo (el otro es vestidor); empleado de mostrador y clientes ocasionales'
  },
  taller_publi_imperia: {
    negocioId: 'taller_publi_imperia',
    nombre: 'Publi-Imperia',
    porcentaje: 8.0,
    montoMensual: 80.00,
    justificacion: 'Baño propio para 1 empleado de taller de producción gráfica'
  },
  bordados_veracruz: {
    negocioId: 'bordados_veracruz',
    nombre: 'Bordados Veracruz',
    porcentaje: 6.0,
    montoMensual: 60.00,
    justificacion: 'Baño propio para 1 empleado bordador'
  },
  papeleria_imperiarte: {
    negocioId: 'papeleria_imperiarte',
    nombre: 'Papelería ImperiArte',
    porcentaje: 6.0,
    montoMensual: 60.00,
    justificacion: 'Sin baño propio; empleado de mostrador usa el baño de Bordados Veracruz'
  },
  oficinas_consorcio: {
    negocioId: 'oficinas_consorcio',
    nombre: 'Oficinas Corporativo',
    porcentaje: 5.0,
    montoMensual: 50.00,
    justificacion: 'Baño propio para 1 oficinista con uso esporádico (baja ocupación)'
  }
};

export const TABLA_HVAC_INMUEBLE = {
  hawaiian_paradise: {
    negocioId: 'hawaiian_paradise',
    areaClimatizadaM2: 48.95,
    alturaMetros: 3.80,
    volumenM3: 186.01,
    fuentesCalor: 'Crepera (1.5kW), marquesitera (1.5kW), cafetera Breville (1.65kW), TV 70", afluencia pública',
    cargaTermicaEstimadaBtu: 24000,
    toneladasRefrigeracion: 2.0,
    equipoRecomendado: 'Minisplit 2 TR (24,000 BTU) Inverter 220V',
    kwhMensualEstimado: 450
  },
  imperia_uniformes: {
    negocioId: 'imperia_uniformes',
    areaClimatizadaM2: 34.60,
    alturaMetros: 3.80,
    volumenM3: 131.48,
    fuentesCalor: 'Luminarias LED showroom, PC mostrador TPV, apertura de puerta',
    cargaTermicaEstimadaBtu: 12000,
    toneladasRefrigeracion: 1.0,
    equipoRecomendado: 'Minisplit 1 TR (12,000 BTU) Inverter 220V',
    kwhMensualEstimado: 200
  },
  bordados_veracruz: {
    negocioId: 'bordados_veracruz',
    areaClimatizadaM2: 34.60,
    alturaMetros: 3.80,
    volumenM3: 131.48,
    fuentesCalor: 'Motores y control digital de bordadora industrial AEMCO 4 cabezas + Melco 4 cabezas',
    cargaTermicaEstimadaBtu: 18000,
    toneladasRefrigeracion: 1.5,
    equipoRecomendado: 'Minisplit 1.5 TR (18,000 BTU) Inverter 220V',
    kwhMensualEstimado: 260
  },
  taller_costura: {
    negocioId: 'taller_costura',
    areaClimatizadaM2: 21.57,
    alturaMetros: 3.80,
    volumenM3: 81.97,
    fuentesCalor: 'Caldera de plancha de vapor industrial (1.6kW), 4 motores de costura',
    cargaTermicaEstimadaBtu: 12000,
    toneladasRefrigeracion: 1.0,
    equipoRecomendado: 'Minisplit 1 TR (12,000 BTU) Inverter 220V',
    kwhMensualEstimado: 220
  },
  taller_publi_imperia: {
    negocioId: 'taller_publi_imperia',
    areaClimatizadaM2: 20.18,
    alturaMetros: 3.80,
    volumenM3: 76.68,
    fuentesCalor: 'Workstation de diseño, láser Atomstack A20, bordadora Brother PE770',
    cargaTermicaEstimadaBtu: 12000,
    toneladasRefrigeracion: 1.0,
    equipoRecomendado: 'Minisplit 1 TR (12,000 BTU) Inverter 220V',
    kwhMensualEstimado: 190
  },
  oficinas_consorcio: {
    negocioId: 'oficinas_consorcio',
    areaClimatizadaM2: 12.52,
    alturaMetros: 3.80,
    volumenM3: 47.58,
    fuentesCalor: 'Laptop, TV 32", 1 a 2 ocupantes ocasionales',
    cargaTermicaEstimadaBtu: 12000,
    toneladasRefrigeracion: 1.0,
    equipoRecomendado: 'Minisplit 1 TR (12,000 BTU) Inverter 220V (modulado al 50%)',
    kwhMensualEstimado: 60
  },
  papeleria_imperiarte: {
    negocioId: 'papeleria_imperiarte',
    areaClimatizadaM2: 25.48,
    alturaMetros: 3.80,
    volumenM3: 96.82,
    fuentesCalor: 'Fusor continuo caliente de fotocopiadora Xerox DocuColor (1.5kW), TPV',
    cargaTermicaEstimadaBtu: 18000,
    toneladasRefrigeracion: 1.5,
    equipoRecomendado: 'Minisplit 1.5 TR (18,000 BTU) Inverter 220V',
    kwhMensualEstimado: 250
  }
};

/**
 * Obtiene los costos fijos prorrateados (renta, agua y clima estimado) para un negocio
 */
export function obtenerCostosFijosInmueble(negocioId) {
  const renta = TABLA_RENTAS_INMUEBLE[negocioId] || {
    rentaSinIva: 1000,
    rentaConIva: 1160,
    areaTotalImputadaM2: 30,
    porcentajeInmueble: 10
  };

  const agua = TABLA_AGUA_INMUEBLE[negocioId] || {
    montoMensual: 100,
    porcentaje: 10
  };

  const hvac = TABLA_HVAC_INMUEBLE[negocioId] || {
    areaClimatizadaM2: 25,
    volumenM3: 95,
    equipoRecomendado: 'Minisplit 1 TR Inverter',
    kwhMensualEstimado: 200
  };

  return {
    renta,
    agua,
    hvac,
    subtotalFijoMensualSinLuz: renta.rentaConIva + agua.montoMensual
  };
}
