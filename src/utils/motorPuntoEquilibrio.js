/**
 * Motor Financiero de Punto de Equilibrio, Rentabilidad y Niveles de Venta Diaria/Mensual.
 * Modela con precisión matemática:
 * - Día / Mes Bajo: 0 a 10 artículos en la jornada (Ingresos <= Gastos Totales Mínimos).
 * - Día / Mes Medio: Ventas suficientes para cubrir gastos + superávit moderado.
 * - Día / Mes Alto: Meta explícita de $20,000 MXN libres de ganancia neta.
 * - Día / Mes Muy Alto: Ganancia libre > $20,000 MXN.
 */

import { obtenerCostosFijosInmueble } from './costosFijosInmueble.js';
import { 
  CATALOGO_PRECIOS_COSTOS, 
  calcularMargenProducto, 
  calcularMargenPromedioPonderado 
} from './preciosYCostosProductos.js';
import { calcularNominaNegocio } from './nominaYTurnosNegocios.js';

/**
 * Calcula los gastos fijos mensuales totales y el punto de equilibrio operativo de un negocio
 * integrando Renta con IVA, Agua, CFE, Sueldos y Cargas Patronales de Seguro Social (IMSS).
 */
export function calcularPuntoEquilibrio({
  negocioId,
  diasLaborales = 26,
  reciboLuzReal = null,
  sueldosFijosExtras = 0,
  otrosGastosFijos = 0,
  productosPersonalizados = null,
  configNomina = null,
  salarioMinimoMensual = null
}) {
  const costosInmueble = obtenerCostosFijosInmueble(negocioId);
  const rentaConIva = costosInmueble.renta.rentaConIva;
  const aguaMensual = costosInmueble.agua.montoMensual;
  
  // Si no se pasa el recibo real de CFE, se toma un estimado del clima + alumbrado
  const luzMensual = reciboLuzReal !== null && reciboLuzReal !== undefined
    ? parseFloat(reciboLuzReal) || 0
    : (costosInmueble.hvac.kwhMensualEstimado * 3.8); // Tarifa promedio ~3.8 MXN/kWh

  // Nómina y Cargas Patronales de Seguro Social (IMSS + Infonavit)
  let sueldosBrutos = 0;
  let imssPatronal = 0;
  let totalCostoLaboral = 0;
  let nominaDetalle = null;

  if (configNomina) {
    nominaDetalle = calcularNominaNegocio({
      configNegocio: configNomina,
      negocioId,
      salarioMinimoMensual: salarioMinimoMensual || undefined
    });
    sueldosBrutos = nominaDetalle.totalSueldosBrutos;
    imssPatronal = nominaDetalle.totalImssPatronal;
    totalCostoLaboral = nominaDetalle.totalGastoLaboral;
  } else if (sueldosFijosExtras > 0) {
    totalCostoLaboral = parseFloat(sueldosFijosExtras) || 0;
    sueldosBrutos = totalCostoLaboral;
  }

  const gastosFijosTotales = rentaConIva + aguaMensual + luzMensual + totalCostoLaboral + parseFloat(otrosGastosFijos || 0);
  const cuotaFijaDiaria = diasLaborales > 0 ? (gastosFijosTotales / diasLaborales) : 0;

  const { mcPonderado, precioPonderado, margenPctPonderado } = calcularMargenPromedioPonderado(negocioId, productosPersonalizados);

  // Unidades mínimas necesarias para no perder ni ganar (Punto de Equilibrio)
  const unidadesEquilibrioMes = mcPonderado > 0 ? Math.ceil(gastosFijosTotales / mcPonderado) : 0;
  const unidadesEquilibrioDia = diasLaborales > 0 ? (unidadesEquilibrioMes / diasLaborales) : 0;
  const ventasEquilibrioMes = unidadesEquilibrioMes * precioPonderado;
  const ventasEquilibrioDia = diasLaborales > 0 ? (ventasEquilibrioMes / diasLaborales) : 0;

  return {
    negocioId,
    diasLaborales,
    costosFijos: {
      rentaConIva,
      aguaMensual,
      luzMensual,
      sueldosBrutos,
      imssPatronal,
      totalCostoLaboral,
      sueldosFijosExtras: totalCostoLaboral,
      otrosGastosFijos,
      gastosFijosTotales,
      cuotaFijaDiaria,
      nominaDetalle
    },
    metricasUnitarias: {
      mcPonderado,
      precioPonderado,
      margenPctPonderado
    },
    puntoEquilibrio: {
      unidadesMes: unidadesEquilibrioMes,
      unidadesDia: Math.round(unidadesEquilibrioDia * 10) / 10,
      ventasMes: Math.round(ventasEquilibrioMes),
      ventasDia: Math.round(ventasEquilibrioDia)
    }
  };
}

/**
 * Calibra los 4 escenarios financieros de ventas para un negocio según las reglas del usuario:
 * - Bajo: 0 a 10 artículos/día (Ingresos <= Gastos Mínimos).
 * - Medio: Superávit moderado ($5,000 - $10,000 MXN libres).
 * - Alto: Meta de exactamente $20,000 MXN libres de ganancia neta.
 * - Muy Alto: > $20,000 MXN libres ($35,000 MXN libres).
 */
export function calibrarNivelesVentaFinancieros({
  negocioId,
  diasLaborales = 26,
  reciboLuzReal = null,
  sueldosFijosExtras = 0,
  otrosGastosFijos = 0,
  productosPersonalizados = null,
  configNomina = null,
  salarioMinimoMensual = null
}) {
  const pe = calcularPuntoEquilibrio({
    negocioId,
    diasLaborales,
    reciboLuzReal,
    sueldosFijosExtras,
    otrosGastosFijos,
    productosPersonalizados,
    configNomina,
    salarioMinimoMensual
  });

  const { gastosFijosTotales, cuotaFijaDiaria } = pe.costosFijos;
  const { mcPonderado, precioPonderado } = pe.metricasUnitarias;
  const productos = (productosPersonalizados || CATALOGO_PRECIOS_COSTOS[negocioId] || []).map(calcularMargenProducto);

  const pesoTotal = productos.reduce((sum, p) => sum + (p.pesoEnMix || 1), 0);

  // Helper para generar distribución de artículos por producto según el mix
  const generarMixCantidades = (totalArticulosMes) => {
    const cantidades = {};
    productos.forEach(p => {
      const fraccion = (p.pesoEnMix || 1) / pesoTotal;
      cantidades[p.id] = Math.max(0, Math.round(totalArticulosMes * fraccion));
    });
    return cantidades;
  };

  // 1. ESCENARIO BAJO (Vende menos o lo mismo del mínimo para pagar gastos: Punto de Equilibrio o déficit)
  // Tope de máximo 10 artículos diarios en la jornada
  const peUnidades = pe.puntoEquilibrio.unidadesMes;
  const artsMesBajo = Math.max(1, Math.min(10 * diasLaborales, Math.floor(peUnidades * 0.75)));
  const artsDiaBajo = Math.min(10, Math.round(artsMesBajo / diasLaborales));
  const cantBajo = generarMixCantidades(artsMesBajo);
  const pnlBajo = calcularEstadoResultados({
    cantidadesMensuales: cantBajo,
    negocioId,
    diasLaborales,
    gastosFijosTotales,
    productos
  });

  // 2. ESCENARIO MEDIO (Superávit moderado, cubre gastos con holgura)
  const metaUtilidadMedio = 8000.00; // $8,000 MXN libres
  const artsMesMedio = mcPonderado > 0 ? Math.ceil((gastosFijosTotales + metaUtilidadMedio) / mcPonderado) : (artsMesBajo * 2);
  const cantMedio = generarMixCantidades(artsMesMedio);
  const pnlMedio = calcularEstadoResultados({
    cantidadesMensuales: cantMedio,
    negocioId,
    diasLaborales,
    gastosFijosTotales,
    productos
  });

  // 3. ESCENARIO ALTO (META EXACTA DEL USUARIO: $20,000 MXN LIBRES)
  const metaUtilidadAlto = 20000.00; // $20,000 MXN libres exactos
  const artsMesAlto = mcPonderado > 0 ? Math.ceil((gastosFijosTotales + metaUtilidadAlto) / mcPonderado) : (artsMesBajo * 3);
  const cantAlto = generarMixCantidades(artsMesAlto);
  const pnlAlto = calcularEstadoResultados({
    cantidadesMensuales: cantAlto,
    negocioId,
    diasLaborales,
    gastosFijosTotales,
    productos
  });

  // 4. ESCENARIO MUY ALTO (SUPERIOR A $20,000 MXN LIBRES)
  const metaUtilidadMuyAlto = 35000.00; // $35,000 MXN libres
  const artsMesMuyAlto = mcPonderado > 0 ? Math.ceil((gastosFijosTotales + metaUtilidadMuyAlto) / mcPonderado) : (artsMesAlto * 1.5);
  const cantMuyAlto = generarMixCantidades(artsMesMuyAlto);
  const pnlMuyAlto = calcularEstadoResultados({
    cantidadesMensuales: cantMuyAlto,
    negocioId,
    diasLaborales,
    gastosFijosTotales,
    productos
  });

  return {
    puntoEquilibrio: pe,
    costosFijos: pe.costosFijos,
    metricasUnitarias: pe.metricasUnitarias,
    escenarios: {
      bajo: {
        id: 'bajo',
        nombre: 'Día / Mes Bajo',
        subtitulo: `${artsDiaBajo} artículos/día · Déficit o Punto de Equilibrio`,
        articulosDia: artsDiaBajo,
        articulosMes: artsMesBajo,
        cantidades: cantBajo,
        pnl: pnlBajo
      },
      medio: {
        id: 'medio',
        nombre: 'Día / Mes Medio',
        subtitulo: `${Math.round(artsMesMedio / diasLaborales)} artículos/día · Superávit moderado`,
        articulosDia: Math.round(artsMesMedio / diasLaborales),
        articulosMes: artsMesMedio,
        cantidades: cantMedio,
        pnl: pnlMedio
      },
      alto: {
        id: 'alto',
        nombre: 'Día / Mes Alto ($20k Libres)',
        subtitulo: `${Math.round(artsMesAlto / diasLaborales)} artículos/día · Ganancia libre de $20,000 MXN`,
        articulosDia: Math.round(artsMesAlto / diasLaborales),
        articulosMes: artsMesAlto,
        cantidades: cantAlto,
        pnl: pnlAlto
      },
      muy_alto: {
        id: 'muy_alto',
        nombre: 'Día / Mes Muy Alto (> $20k Libres)',
        subtitulo: `${Math.round(artsMesMuyAlto / diasLaborales)} artículos/día · Ganancia libre de $35,000 MXN`,
        articulosDia: Math.round(artsMesMuyAlto / diasLaborales),
        articulosMes: artsMesMuyAlto,
        cantidades: cantMuyAlto,
        pnl: pnlMuyAlto
      }
    }
  };
}

/**
 * Calcula el Estado de Resultados (P&L) a partir de un vector de cantidades vendidas en el mes
 */
export function calcularEstadoResultados({
  cantidadesMensuales = {},
  negocioId,
  diasLaborales = 26,
  gastosFijosTotales = 0,
  productos = null
}) {
  const prods = (productos || CATALOGO_PRECIOS_COSTOS[negocioId] || []).map(calcularMargenProducto);

  let ingresosBrutos = 0;
  let costoMaterialesTotal = 0;
  let costoManoObraTotal = 0;
  let costoLuzProcesoTotal = 0;
  let unidadesTotales = 0;

  const detallePorProducto = [];

  prods.forEach(p => {
    const q = parseInt(cantidadesMensuales[p.id]) || 0;
    unidadesTotales += q;

    const ingresosP = q * p.precioVenta;
    const matP = q * p.costoMateriales;
    const moP = q * p.costoManoObra;
    const luzP = q * p.costoLuzUnitario;
    const costoVarP = matP + moP + luzP;
    const margenBrutoP = ingresosP - costoVarP;

    ingresosBrutos += ingresosP;
    costoMaterialesTotal += matP;
    costoManoObraTotal += moP;
    costoLuzProcesoTotal += luzP;

    detallePorProducto.push({
      productoId: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      cantidad: q,
      precioVenta: p.precioVenta,
      ingresos: ingresosP,
      costoMateriales: matP,
      costoManoObra: moP,
      costoLuz: luzP,
      costoVariableTotal: costoVarP,
      margenBruto: margenBrutoP
    });
  });

  const costosVariablesTotales = costoMaterialesTotal + costoManoObraTotal + costoLuzProcesoTotal;
  const utilidadBruta = ingresosBrutos - costosVariablesTotales;
  const utilidadNeta = utilidadBruta - gastosFijosTotales;

  const margenBrutoPct = ingresosBrutos > 0 ? (utilidadBruta / ingresosBrutos) * 100 : 0;
  const margenNetoPct = ingresosBrutos > 0 ? (utilidadNeta / ingresosBrutos) * 100 : 0;

  return {
    unidadesTotales,
    unidadesDiariasPromedio: diasLaborales > 0 ? Math.round((unidadesTotales / diasLaborales) * 10) / 10 : 0,
    ingresosBrutos,
    costoMaterialesTotal,
    costoManoObraTotal,
    costoLuzProcesoTotal,
    costosVariablesTotales,
    utilidadBruta,
    gastosFijosTotales,
    utilidadNeta,
    margenBrutoPct,
    margenNetoPct,
    detallePorProducto
  };
}

/**
 * Simulador Interactivo Diario: el usuario ingresa cuántos artículos vendió hoy (ej. 1 crepa, 2 cafés...)
 * y el motor evalúa si el día cubrió su cuota de gastos fijos y cuánta utilidad neta generó hoy.
 */
export function simularDiaVentaInteractivo({
  articulosVendidosMap = {},
  negocioId,
  diasLaborales = 26,
  gastosFijosMensuales = 0,
  productos = null
}) {
  const prods = (productos || CATALOGO_PRECIOS_COSTOS[negocioId] || []).map(calcularMargenProducto);
  const cuotaFijaDia = diasLaborales > 0 ? (gastosFijosMensuales / diasLaborales) : 0;

  let ventaTotalDia = 0;
  let costoMaterialesDia = 0;
  let costoManoObraDia = 0;
  let costoLuzDia = 0;
  let totalArticulosDia = 0;

  prods.forEach(p => {
    const q = parseInt(articulosVendidosMap[p.id]) || 0;
    totalArticulosDia += q;

    ventaTotalDia += q * p.precioVenta;
    costoMaterialesDia += q * p.costoMateriales;
    costoManoObraDia += q * p.costoManoObra;
    costoLuzDia += q * p.costoLuzUnitario;
  });

  const costoVariableDia = costoMaterialesDia + costoManoObraDia + costoLuzDia;
  const utilidadBrutaDia = ventaTotalDia - costoVariableDia;
  const utilidadNetaDia = utilidadBrutaDia - cuotaFijaDia;

  let calificacionDia = 'neutro';
  let mensaje = 'Sin ventas registradas hoy';

  if (totalArticulosDia === 0) {
    calificacionDia = 'cero';
    mensaje = `Día sin ventas. Se absorbe la cuota fija diaria (-$${Math.round(cuotaFijaDia).toLocaleString()} MXN).`;
  } else if (utilidadNetaDia < 0) {
    calificacionDia = 'bajo_deficit';
    mensaje = `Día bajo (${totalArticulosDia} arts). No cubrió la cuota fija completa (déficit de -$${Math.round(Math.abs(utilidadNetaDia)).toLocaleString()} MXN).`;
  } else if (utilidadNetaDia >= 0 && utilidadNetaDia < 300) {
    calificacionDia = 'bajo_equilibrio';
    mensaje = `Día bajo en punto de equilibrio (${totalArticulosDia} arts). Se cubrieron exactamente los gastos del día.`;
  } else if (utilidadNetaDia >= 300 && utilidadNetaDia < 770) {
    calificacionDia = 'medio';
    mensaje = `Día medio (${totalArticulosDia} arts). Superávit positivo de +$${Math.round(utilidadNetaDia).toLocaleString()} MXN libres hoy.`;
  } else if (utilidadNetaDia >= 770) { // $770/día x 26 días ≈ $20,000 libres al mes
    calificacionDia = 'alto';
    mensaje = `¡Día alto de meta! (${totalArticulosDia} arts). Ritmo para alcanzar los $20,000 MXN libres al mes (+$${Math.round(utilidadNetaDia).toLocaleString()} MXN hoy).`;
  }

  return {
    totalArticulosDia,
    ventaTotalDia,
    costoVariableDia,
    utilidadBrutaDia,
    cuotaFijaDia,
    utilidadNetaDia,
    calificacionDia,
    mensaje
  };
}
