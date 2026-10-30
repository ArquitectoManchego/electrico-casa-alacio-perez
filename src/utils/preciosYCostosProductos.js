/**
 * Catálogo Maestro de Precios de Venta, Costos Directos (Materiales + Mano de Obra + Luz) y Márgenes.
 * Base cuantitativa para el cálculo de Punto de Equilibrio y Ganancias Netas.
 */

export const CATALOGO_PRECIOS_COSTOS = {
  // =========================================================================
  // 1. HAWAIIAN PARADISE
  // =========================================================================
  hawaiian_paradise: [
    {
      id: 'hp_crepa',
      nombre: 'Crepa Dulce o Salada',
      categoria: 'Cocina Caliente',
      unidad: 'crepa',
      precioVenta: 75.00,
      costoMateriales: 22.00,
      detalleMateriales: 'Harina especial, huevo, mantequilla, Nutella/queso crema, empaque',
      costoManoObra: 10.00,
      detalleManoObra: 'Preparación y doblado en plancha',
      costoLuzUnitario: 0.22,
      pesoEnMix: 22
    },
    {
      id: 'hp_marquesita',
      nombre: 'Marquesita Tradicional',
      categoria: 'Cocina Caliente',
      unidad: 'marquesita',
      precioVenta: 65.00,
      costoMateriales: 18.00,
      detalleMateriales: 'Masa de barquillo artesanal, queso de bola holandés, cajeta/lechera',
      costoManoObra: 8.00,
      detalleManoObra: 'Prensado doble cara y enrollado',
      costoLuzUnitario: 0.20,
      pesoEnMix: 20
    },
    {
      id: 'hp_raspado',
      nombre: 'Raspado Clásico Hawaiian',
      categoria: 'Bebidas Frías y Nieve',
      unidad: 'raspado',
      precioVenta: 45.00,
      costoMateriales: 9.00,
      detalleMateriales: 'Hielo en bloque purificado, almíbar de fruta natural, vaso y cuchara',
      costoManoObra: 6.00,
      detalleManoObra: 'Raspado y jarabeado',
      costoLuzUnitario: 0.03,
      pesoEnMix: 12
    },
    {
      id: 'hp_smoothie',
      nombre: 'Smoothie Frutal / Frappé',
      categoria: 'Bebidas Frías y Nieve',
      unidad: 'smoothie',
      precioVenta: 60.00,
      costoMateriales: 16.00,
      detalleMateriales: 'Pulpa congelada de fruta, base láctea, hielo, vaso domo y popote',
      costoManoObra: 8.00,
      detalleManoObra: 'Dosificación y licuado Ninja',
      costoLuzUnitario: 0.07,
      pesoEnMix: 12
    },
    {
      id: 'hp_espresso_americano',
      nombre: 'Café Espresso / Americano',
      categoria: 'Barra de Café',
      unidad: 'taza',
      precioVenta: 40.00,
      costoMateriales: 7.00,
      detalleMateriales: 'Café de especialidad en grano (18g), agua filtrada, vaso térmico',
      costoManoObra: 5.00,
      detalleManoObra: 'Molienda, compactado y extracción barista',
      costoLuzUnitario: 0.05,
      pesoEnMix: 8
    },
    {
      id: 'hp_cappuccino_latte',
      nombre: 'Cappuccino / Latte / Flat White',
      categoria: 'Barra de Café',
      unidad: 'taza',
      precioVenta: 55.00,
      costoMateriales: 14.00,
      detalleMateriales: 'Café de grano + 200ml de leche entera/deslactosada espumada',
      costoManoObra: 7.00,
      detalleManoObra: 'Extracción barista y texturizado de leche al vapor',
      costoLuzUnitario: 0.11,
      pesoEnMix: 15
    },
    {
      id: 'hp_ramen_tetera',
      nombre: 'Sopa Instantánea Tipo Ramen',
      categoria: 'Snacks y Caldos',
      unidad: 'sopa',
      precioVenta: 45.00,
      costoMateriales: 15.00,
      detalleMateriales: 'Vaso de sopa Maruchan/Nissin, tenedor, condimentos',
      costoManoObra: 4.00,
      detalleManoObra: 'Hervido de agua en tetera y atención',
      costoLuzUnitario: 0.12,
      pesoEnMix: 5
    },
    {
      id: 'hp_bano_maria_esquites',
      nombre: 'Esquites Calientes (Vaso Baño María)',
      categoria: 'Snacks y Caldos',
      unidad: 'vaso',
      precioVenta: 45.00,
      costoMateriales: 12.00,
      detalleMateriales: 'Elote desgranado cocido, epazote, mayonesa, queso cotija, limón, chile',
      costoManoObra: 6.00,
      detalleManoObra: 'Servido y aderezado',
      costoLuzUnitario: 0.15,
      pesoEnMix: 6
    }
  ],

  // =========================================================================
  // 2. PUBLI-IMPERIA
  // =========================================================================
  taller_publi_imperia: [
    {
      id: 'pi_sub_tazas',
      nombre: 'Taza Sublimada 11oz',
      categoria: 'Sublimación',
      unidad: 'taza',
      precioVenta: 95.00,
      costoMateriales: 32.00,
      detalleMateriales: 'Taza blanca calidad AAA, papel transfer de sublimación, tinta, cinta térmica',
      costoManoObra: 15.00,
      detalleManoObra: 'Diseño/ajuste, encintado y planchado',
      costoLuzUnitario: 0.18,
      pesoEnMix: 25
    },
    {
      id: 'pi_sub_playeras',
      nombre: 'Playera Sublimada Poliéster',
      categoria: 'Sublimación',
      unidad: 'playera',
      precioVenta: 160.00,
      costoMateriales: 65.00,
      detalleMateriales: 'Playera poliéster tacto algodón, hoja transfer sublimación A4/A3',
      costoManoObra: 25.00,
      detalleManoObra: 'Alineación y prensado térmico plano',
      costoLuzUnitario: 0.42,
      pesoEnMix: 18
    },
    {
      id: 'pi_sub_gorras',
      nombre: 'Gorra Sublimada Trucker',
      categoria: 'Sublimación',
      unidad: 'gorra',
      precioVenta: 110.00,
      costoMateriales: 42.00,
      detalleMateriales: 'Gorra frente de esponja poliéster con malla, transfer curvo',
      costoManoObra: 18.00,
      detalleManoObra: 'Colocación en horma curva y prensado',
      costoLuzUnitario: 0.22,
      pesoEnMix: 10
    },
    {
      id: 'pi_dtf_playeras',
      nombre: 'Playera con Planchado DTF (Film Externo)',
      categoria: 'Termofijado y DTF',
      unidad: 'playera',
      precioVenta: 190.00,
      costoMateriales: 85.00,
      detalleMateriales: 'Playera 100% algodón peinado + impresión DTF textil externa',
      costoManoObra: 20.00,
      detalleManoObra: 'Planchado, pelado en frío y resellado con teflón',
      costoLuzUnitario: 0.28,
      pesoEnMix: 20
    },
    {
      id: 'pi_dtf_gorras',
      nombre: 'Gorra con Transfer DTF',
      categoria: 'Termofijado y DTF',
      unidad: 'gorra',
      precioVenta: 130.00,
      costoMateriales: 52.00,
      detalleMateriales: 'Gorra de gabardina estructurada + impresión DTF',
      costoManoObra: 16.00,
      detalleManoObra: 'Planchado curvo y resellado',
      costoLuzUnitario: 0.15,
      pesoEnMix: 10
    },
    {
      id: 'pi_vinil_playeras',
      nombre: 'Playera con Vinil Textil (ScanNCut)',
      categoria: 'Vinil Textil',
      unidad: 'playera',
      precioVenta: 185.00,
      costoMateriales: 60.00,
      detalleMateriales: 'Playera algodón + pliego de vinil textil de detalle',
      costoManoObra: 30.00,
      detalleManoObra: 'Corte digital, depilado manual minucioso y termofijado',
      costoLuzUnitario: 0.35,
      pesoEnMix: 8
    },
    {
      id: 'pi_laser_termos',
      nombre: 'Termo Metálico Grabado Láser (Atomstack A20)',
      categoria: 'Láser CNC',
      unidad: 'termo',
      precioVenta: 240.00,
      costoMateriales: 100.00,
      detalleMateriales: 'Termo de acero inoxidable doble pared con recubrimiento mate',
      costoManoObra: 25.00,
      detalleManoObra: 'Vectorizado, enfoque focal y grabado láser rotativo',
      costoLuzUnitario: 0.10,
      pesoEnMix: 5
    },
    {
      id: 'pi_laser_reconocimientos',
      nombre: 'Reconocimiento Acrílico / MDF Láser',
      categoria: 'Láser CNC',
      unidad: 'pieza',
      precioVenta: 280.00,
      costoMateriales: 80.00,
      detalleMateriales: 'Placa de acrílico cristal 3mm + base de madera MDF grabada',
      costoManoObra: 40.00,
      detalleManoObra: 'Corte, grabado y armado',
      costoLuzUnitario: 0.18,
      pesoEnMix: 4
    }
  ],

  // =========================================================================
  // 3. TALLER DE COSTURA
  // =========================================================================
  taller_costura: [
    {
      id: 'tc_filipina',
      nombre: 'Confección de Filipina Médica / Chef',
      categoria: 'Confección Médica e Industrial',
      unidad: 'filipina',
      precioVenta: 350.00,
      costoMateriales: 130.00,
      detalleMateriales: 'Tela antifluidos/gabardina (1.3m), botones, hilos, entretela de cuello',
      costoManoObra: 90.00,
      detalleManoObra: 'Tendido, corte de disco, armado en Overlock 5h y pespunte en Singer Recta',
      costoLuzUnitario: 0.42,
      pesoEnMix: 45
    },
    {
      id: 'tc_pantalon',
      nombre: 'Confección de Pantalón Clínico / Quirúrgico',
      categoria: 'Confección Médica e Industrial',
      unidad: 'pantalón',
      precioVenta: 320.00,
      costoMateriales: 120.00,
      detalleMateriales: 'Tela gabardina/stretch (1.2m), elástico ancho de cintura, jareta, hilo',
      costoManoObra: 80.00,
      detalleManoObra: 'Corte, Overlock 5h, ensamble de tiro/costados y dobladillos en Recta',
      costoLuzUnitario: 0.38,
      pesoEnMix: 43
    },
    {
      id: 'tc_playera_polo_stretch',
      nombre: 'Playera Polo Stretch Escolar (Collaretera)',
      categoria: 'Prendas de Punto & Stretch',
      unidad: 'playera',
      precioVenta: 220.00,
      costoMateriales: 90.00,
      detalleMateriales: 'Tela piqué stretch (0.9m), cuello y puños tejidos, botones',
      costoManoObra: 55.00,
      detalleManoObra: 'Corte, unión overlock, aletilla en recta y dobladillos en Collaretera Singer',
      costoLuzUnitario: 0.35,
      pesoEnMix: 8
    },
    {
      id: 'tc_bata_laboratorio',
      nombre: 'Confección de Bata de Laboratorio',
      categoria: 'Confección Médica e Industrial',
      unidad: 'bata',
      precioVenta: 390.00,
      costoMateriales: 150.00,
      detalleMateriales: 'Gabardina blanca pesada (1.8m), broches metálicos, hilo',
      costoManoObra: 100.00,
      detalleManoObra: 'Corte largo, costura de solapa, bolsas profundas y cinturón trasero',
      costoLuzUnitario: 0.48,
      pesoEnMix: 4
    }
  ],

  // =========================================================================
  // 4. BORDADOS VERACRUZ
  // =========================================================================
  bordados_veracruz: [
    {
      id: 'bv_escudo_aemco',
      nombre: 'Bordado Escudo Escolar Pecho (~6.5k puntadas)',
      categoria: 'Bordado Industrial 4 Cabezas',
      unidad: 'escudo',
      precioVenta: 45.00,
      costoMateriales: 7.00,
      detalleMateriales: 'Hilo poliéster de bordado industrial, pelón estabilizador, aguja',
      costoManoObra: 12.00,
      detalleManoObra: 'Enbastado en prenda y corte de saltos de hilo',
      costoLuzUnitario: 0.35,
      pesoEnMix: 50
    },
    {
      id: 'bv_espalda_aemco',
      nombre: 'Bordado Grande de Espalda (~20k puntadas)',
      categoria: 'Bordado Industrial 4 Cabezas',
      unidad: 'espalda',
      precioVenta: 140.00,
      costoMateriales: 22.00,
      detalleMateriales: 'Hilos múltiples colores, pelón doble grueso, entretela hidrosoluble',
      costoManoObra: 35.00,
      detalleManoObra: 'Enbastado amplio y supervisión de puntada continua',
      costoLuzUnitario: 0.95,
      pesoEnMix: 20
    },
    {
      id: 'bv_logo_melco',
      nombre: 'Logotipo Corporativo Multicolor (Melco 6/4)',
      categoria: 'Bordado Industrial 4 Cabezas',
      unidad: 'logotipo',
      precioVenta: 55.00,
      costoMateriales: 9.00,
      detalleMateriales: 'Hasta 6 colores de hilo en Melco EMC, pelón tear-away',
      costoManoObra: 14.00,
      detalleManoObra: 'Alineación en bastidor y control de tensión',
      costoLuzUnitario: 0.40,
      pesoEnMix: 20
    },
    {
      id: 'bv_gafetes_melco',
      nombre: 'Gafete / Parche Bordado con Contorno Merrow',
      categoria: 'Bordado Industrial 4 Cabezas',
      unidad: 'parche',
      precioVenta: 35.00,
      costoMateriales: 6.00,
      detalleMateriales: 'Base de tela sarga/gabardina, hilo poliéster, termoadhesivo',
      costoManoObra: 10.00,
      detalleManoObra: 'Recorte de silueta y termofijado de adhesivo',
      costoLuzUnitario: 0.22,
      pesoEnMix: 10
    }
  ],

  // =========================================================================
  // 5. PAPELERÍA IMPERIARTE
  // =========================================================================
  papeleria_imperiarte: [
    {
      id: 'pap_copia_bn',
      nombre: 'Fotocopia / Impresión Láser B/N',
      categoria: 'Copiado y Documentos',
      unidad: 'página',
      precioVenta: 2.00,
      costoMateriales: 0.45,
      detalleMateriales: 'Papel bond 75g blancura 95%, tóner negro Xerox DocuColor',
      costoManoObra: 0.30,
      detalleManoObra: 'Atención de mostrador y engrapado',
      costoLuzUnitario: 0.02,
      pesoEnMix: 60
    },
    {
      id: 'pap_impresion_color',
      nombre: 'Impresión Láser Color Carta / Oficio',
      categoria: 'Impresión Digital',
      unidad: 'página',
      precioVenta: 8.00,
      costoMateriales: 2.20,
      detalleMateriales: 'Tóner CMYK micro-pulverizado + papel bond láser alta blancura',
      costoManoObra: 1.00,
      detalleManoObra: 'Revisión digital PDF y calibración',
      costoLuzUnitario: 0.06,
      pesoEnMix: 25
    },
    {
      id: 'pap_tiraje_tabloide',
      nombre: 'Impresión Tabloide Couché / Opalina (DocuColor)',
      categoria: 'Artes Gráficas',
      unidad: 'hoja',
      precioVenta: 25.00,
      costoMateriales: 7.50,
      detalleMateriales: 'Cartulina couché brillante 300g (12x18"), tóner color grueso',
      costoManoObra: 2.50,
      detalleManoObra: 'RIP de impresión y refilado',
      costoLuzUnitario: 0.12,
      pesoEnMix: 10
    },
    {
      id: 'pap_ticket_utiles',
      nombre: 'Venta de Útiles Escolares y Regalos (Ticket Promedio)',
      categoria: 'Venta de Mostrador',
      unidad: 'ticket',
      precioVenta: 65.00,
      costoMateriales: 38.00,
      detalleMateriales: 'Costo adquisición de cuadernos, plumas, carpetas, envolturas',
      costoManoObra: 5.00,
      detalleManoObra: 'Atención, embolsado y cobro POS',
      costoLuzUnitario: 0.05,
      pesoEnMix: 5
    }
  ],

  // =========================================================================
  // 6. IMPERIA UNIFORMES (Showroom y Venta Menudeo)
  // =========================================================================
  imperia_uniformes: [
    {
      id: 'imp_uniforme_clinico_completo',
      nombre: 'Uniforme Clínico Completo (Filipina + Pantalón)',
      categoria: 'Uniformes Médicos',
      unidad: 'juego',
      precioVenta: 650.00,
      costoMateriales: 420.00, // Costo de transferencia/adquisición de taller
      detalleMateriales: 'Juego completo de filipina médica y pantalón con empaque y etiqueta',
      costoManoObra: 30.00,
      detalleManoObra: 'Atención y asesoría en vestidor, doblado y cobro',
      costoLuzUnitario: 0.15,
      pesoEnMix: 50
    },
    {
      id: 'imp_filipina_individual',
      nombre: 'Filipina Médica / Estampada Individual',
      categoria: 'Uniformes Médicos',
      unidad: 'pieza',
      precioVenta: 420.00,
      costoMateriales: 280.00,
      detalleMateriales: 'Filipina antifluidos con bolsas utilitarias',
      costoManoObra: 20.00,
      detalleManoObra: 'Prueba en probador y ticket',
      costoLuzUnitario: 0.10,
      pesoEnMix: 30
    },
    {
      id: 'imp_calzado_accesorios',
      nombre: 'Calzado Clínico / Accesorios',
      categoria: 'Complementos',
      unidad: 'par',
      precioVenta: 550.00,
      costoMateriales: 350.00,
      detalleMateriales: 'Zuecos médicos antiderrapantes / cofias / calcetines de compresión',
      costoManoObra: 25.00,
      detalleManoObra: 'Prueba de calce y entrega',
      costoLuzUnitario: 0.10,
      pesoEnMix: 20
    }
  ],

  // =========================================================================
  // 7. OFICINAS CORPORATIVO (Consorcio)
  // =========================================================================
  oficinas_consorcio: [
    {
      id: 'oc_gestion_administrativa',
      nombre: 'Honorarios de Gestión Administrativa / Licitación',
      categoria: 'Servicios Directivos',
      unidad: 'servicio',
      precioVenta: 3500.00,
      costoMateriales: 150.00,
      detalleMateriales: 'Carpetas ejecutivas, timbrados fiscales, papelería oficial',
      costoManoObra: 500.00,
      detalleManoObra: 'Horas de consultoría y gestión contable/fiscal',
      costoLuzUnitario: 1.50,
      pesoEnMix: 100
    }
  ]
};

/**
 * Calcula el Margen de Contribución Unitario y Porcentual de un producto
 */
export function calcularMargenProducto(prod) {
  const precio = parseFloat(prod.precioVenta) || 0;
  const mat = parseFloat(prod.costoMateriales) || 0;
  const mo = parseFloat(prod.costoManoObra) || 0;
  const luz = parseFloat(prod.costoLuzUnitario) || 0;

  const costoVariableTotal = mat + mo + luz;
  const margenBruto = precio - costoVariableTotal;
  const margenPct = precio > 0 ? (margenBruto / precio) * 100 : 0;

  return {
    ...prod,
    costoVariableTotal,
    margenBruto,
    margenPct
  };
}

/**
 * Obtiene el catálogo de productos de un negocio con sus márgenes calculados
 */
export function obtenerProductosNegocio(negocioId) {
  const lista = CATALOGO_PRECIOS_COSTOS[negocioId] || [];
  return lista.map(calcularMargenProducto);
}

/**
 * Calcula el Margen de Contribución Promedio Ponderado por Artículo de un negocio
 */
export function calcularMargenPromedioPonderado(negocioId, productosPersonalizados = null) {
  const productos = (productosPersonalizados || CATALOGO_PRECIOS_COSTOS[negocioId] || []).map(calcularMargenProducto);
  if (productos.length === 0) return { mcPonderado: 50, precioPonderado: 100, margenPctPonderado: 50 };

  const pesoTotal = productos.reduce((sum, p) => sum + (p.pesoEnMix || 1), 0);
  let mcSuma = 0;
  let precioSuma = 0;

  productos.forEach(p => {
    const peso = (p.pesoEnMix || 1) / pesoTotal;
    mcSuma += p.margenBruto * peso;
    precioSuma += p.precioVenta * peso;
  });

  const margenPctPonderado = precioSuma > 0 ? (mcSuma / precioSuma) * 100 : 50;

  return {
    mcPonderado: mcSuma,
    precioPonderado: precioSuma,
    margenPctPonderado
  };
}
