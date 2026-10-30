/**
 * Catálogo Maestro de Procesos Productivos y Comerciales por Unidad de Negocio.
 * Contiene recetas detalladas paso a paso (precalentado, trabajo unitario, pausas y apagado).
 */

export const PROCESOS_POR_NEGOCIO = {
  // =========================================================================
  // 1. IMPERIA UNIFORMES (Showroom y Venta de Mostrador)
  // =========================================================================
  imperia_uniformes: [
    {
      id: 'imp_venta_menudeo',
      negocioId: 'imperia_uniformes',
      nombre: 'Venta de Mostrador Menudeo (1 a 4 Uniformes)',
      categoria: 'Atención en Mostrador',
      unidad: 'tickets',
      descripcionReceta: 'Búsqueda de talla/existencia en TPV (3.0 min) y cobro con tarjeta en Terminal Smart POS (1.0 min).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      pesoMixBase: 70,
      pasos: [
        {
          equipoKey: 'imp_tpv',
          orden: 1,
          accion: 'Consulta de sistema y emisión de ticket POS',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 3.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.60,
          factorPotenciaEspacio: 0.20,
          apagarAlFinal: false
        },
        {
          equipoKey: 'imp_terminal',
          orden: 2,
          accion: 'Cobro con tarjeta y voucher en Terminal POS',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 1.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.10,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'imp_pedido_mayoreo',
      negocioId: 'imperia_uniformes',
      nombre: 'Pedido Escolar / Empresarial Mayoreo (Cotización y CFDI)',
      categoria: 'Atención Corporativa',
      unidad: 'pedidos',
      descripcionReceta: 'Captura de lista de tallas, anticipo y timbrado de factura CFDI en TPV (12 min) + cobro en Terminal (1.5 min).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      pesoMixBase: 25,
      pasos: [
        {
          equipoKey: 'imp_tpv',
          orden: 1,
          accion: 'Captura de corrida de tallas y timbrado CFDI',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 12.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.65,
          factorPotenciaEspacio: 0.20,
          apagarAlFinal: false
        },
        {
          equipoKey: 'imp_terminal',
          orden: 2,
          accion: 'Cobro de anticipo 50% con tarjeta',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 1.5,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.10,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'imp_corte_caja',
      negocioId: 'imperia_uniformes',
      nombre: 'Apertura, Cuadre de Inventario y Corte Diario',
      categoria: 'Operación Diaria',
      unidad: 'cortes',
      descripcionReceta: 'Sincronización de caja diaria en TPV (15 min) y cierre de lote de Terminal Bancaria (3 min).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      pesoMixBase: 5,
      pasos: [
        {
          equipoKey: 'imp_tpv',
          orden: 1,
          accion: 'Sincronización y cierre contable diario',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 15.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.55,
          factorPotenciaEspacio: 0.20,
          apagarAlFinal: false
        },
        {
          equipoKey: 'imp_terminal',
          orden: 2,
          accion: 'Cierre de lote y reporte bancario',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 3.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.10,
          apagarAlFinal: false
        }
      ]
    }
  ],

  // =========================================================================
  // 2. PAPELERÍA IMPERIARTE (Copiado, Impresión Digital & Servicios)
  // =========================================================================
  papeleria_imperiarte: [
    {
      id: 'pap_copia_bn',
      negocioId: 'papeleria_imperiarte',
      nombre: 'Fotocopiado / Impresión Rápida Blanco y Negro',
      categoria: 'Copiado y Documentos',
      unidad: 'páginas',
      descripcionReceta: 'Recuperación de fusor Xerox DocuColor (0.5 min/lote) + tiraje láser B/N (0.04 min/pág) + cobro en TPV.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 5, medio: 15, alto: 25 },
      pesoMixBase: 60,
      pasos: [
        {
          equipoKey: 'pap_tpv',
          orden: 1,
          accion: 'Apertura de PDF o contabilización de copias',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.05,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.55,
          factorPotenciaEspacio: 0.35,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pap_docucolor',
          orden: 2,
          accion: 'Precalentado fusor DocuColor y tiraje B/N',
          preheatMinPorLote: 0.5,
          trabajoMinPorUnidad: 0.04,
          espacioEntreUnidadesMin: 0.01,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.90,
          factorPotenciaEspacio: 0.20,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'pap_impresion_color',
      negocioId: 'papeleria_imperiarte',
      nombre: 'Impresión Digital Láser Color (DocuColor)',
      categoria: 'Impresión Digital',
      unidad: 'páginas',
      descripcionReceta: 'Calentamiento de fusor color (1.5 min/lote) + tiraje láser color CMYK (0.06 min/hoja carta/oficio) + ajuste TPV.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 4, medio: 12, alto: 20 },
      pesoMixBase: 25,
      pasos: [
        {
          equipoKey: 'pap_tpv',
          orden: 1,
          accion: 'Revisión y envío de archivo a cola de impresión',
          preheatMinPorLote: 1.0,
          trabajoMinPorUnidad: 0.08,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.60,
          factorPotenciaEspacio: 0.35,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pap_docucolor',
          orden: 2,
          accion: 'Fusor color a 190°C y tiraje láser CMYK',
          preheatMinPorLote: 1.5,
          trabajoMinPorUnidad: 0.06,
          espacioEntreUnidadesMin: 0.02,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.95,
          factorPotenciaEspacio: 0.20,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'pap_tiraje_pesado',
      negocioId: 'papeleria_imperiarte',
      nombre: 'Tiraje Editorial / Publicitario Couché o Grueso (DocuColor)',
      categoria: 'Artes Gráficas',
      unidad: 'hojas',
      descripcionReceta: 'Precalentado para papel grueso (2.5 min/lote) + tiraje continuo couché/opalina (0.08 min/hoja a 1500W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 30, medio: 75, alto: 150 },
      pesoMixBase: 10,
      pasos: [
        {
          equipoKey: 'pap_tpv',
          orden: 1,
          accion: 'RIP e imposición digital',
          preheatMinPorLote: 2.0,
          trabajoMinPorUnidad: 0.02,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.65,
          factorPotenciaEspacio: 0.35,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pap_docucolor',
          orden: 2,
          accion: 'Fijado térmico pesado a 1500W en gramaje grueso',
          preheatMinPorLote: 2.5,
          trabajoMinPorUnidad: 0.08,
          espacioEntreUnidadesMin: 0.015,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.20,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'pap_venta_mostrador',
      negocioId: 'papeleria_imperiarte',
      nombre: 'Venta de Útiles Escolares y Papelería de Mostrador',
      categoria: 'Atención en Mostrador',
      unidad: 'tickets',
      descripcionReceta: 'Escaneo de artículos, cobro y ticket en TPV All-in-One (1.5 min).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      pesoMixBase: 5,
      pasos: [
        {
          equipoKey: 'pap_tpv',
          orden: 1,
          accion: 'Cobro y ticket en sistema TPV',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 1.5,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.50,
          factorPotenciaEspacio: 0.30,
          apagarAlFinal: false
        }
      ]
    }
  ],

  // =========================================================================
  // 3. HAWAIIAN PARADISE (Cafetería, Crepas, Marquesitas & Bebidas)
  // =========================================================================
  hawaiian_paradise: [
    {
      id: 'hp_crepa',
      negocioId: 'hawaiian_paradise',
      nombre: 'Crepa Dulce o Salada (Crepera 1500W)',
      categoria: 'Cocina Caliente',
      unidad: 'crepas',
      descripcionReceta: 'Precalentado de crepera (8 min por tanda) + cocción/dorado (2.5 min/crepa al 80%) + untado/doblado (0.5 min).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 4, alto: 8 },
      pesoMixBase: 22,
      pasos: [
        {
          equipoKey: 'hp_tpv',
          orden: 1,
          accion: 'Comanda en TPV',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.4,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.60,
          factorPotenciaEspacio: 0.30,
          apagarAlFinal: false
        },
        {
          equipoKey: 'hp_crepera',
          orden: 2,
          accion: 'Precalentado a 200°C y cocción en placa de fundición',
          preheatMinPorLote: 8.0,
          trabajoMinPorUnidad: 2.5,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.80,
          factorPotenciaEspacio: 0.40,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'hp_marquesita',
      negocioId: 'hawaiian_paradise',
      nombre: 'Marquesita Tradicional o Especial (Marquesitera 1500W)',
      categoria: 'Cocina Caliente',
      unidad: 'marquesitas',
      descripcionReceta: 'Precalentado de planchas dobles (7 min por tanda) + prensado/dorado y enrollado (2.2 min) + relleno (0.4 min).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 4, alto: 8 },
      pesoMixBase: 20,
      pasos: [
        {
          equipoKey: 'hp_tpv',
          orden: 1,
          accion: 'Comanda en TPV',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.3,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.60,
          factorPotenciaEspacio: 0.30,
          apagarAlFinal: false
        },
        {
          equipoKey: 'hp_marquesitera',
          orden: 2,
          accion: 'Precalentado y prensado en placa acanalada',
          preheatMinPorLote: 7.0,
          trabajoMinPorUnidad: 2.2,
          espacioEntreUnidadesMin: 0.4,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.80,
          factorPotenciaEspacio: 0.40,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'hp_raspado',
      negocioId: 'hawaiian_paradise',
      nombre: 'Raspado Clásico Hawaiian Paradise',
      categoria: 'Bebidas Frías y Nieve',
      unidad: 'raspados',
      descripcionReceta: 'Raspado motorizado de bloque de hielo en máquina Hawaiian Paradise (40 s a 600W) + almíbar y jarabe.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 4 },
      pesoMixBase: 12,
      pasos: [
        {
          equipoKey: 'hp_raspadora',
          orden: 1,
          accion: 'Raspado de hielo en bloque',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.67, // 40 s
          espacioEntreUnidadesMin: 0.1,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_smoothie',
      negocioId: 'hawaiian_paradise',
      nombre: 'Smoothie Frutal / Frappé de Pulpa (Licuadora Ninja)',
      categoria: 'Bebidas Frías y Nieve',
      unidad: 'smoothies',
      descripcionReceta: 'Triturado de fruta congelada y hielo a alta velocidad en Licuadora Ninja Profesional (51 s a 1200W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 3 },
      pesoMixBase: 12,
      pasos: [
        {
          equipoKey: 'hp_licuadora',
          orden: 1,
          accion: 'Triturado y emulsión de frappé',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.85, // 51 s
          espacioEntreUnidadesMin: 0.15,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_espresso_americano',
      negocioId: 'hawaiian_paradise',
      nombre: 'Café Espresso / Americano (Breville Barista)',
      categoria: 'Barra de Café',
      unidad: 'tazas',
      descripcionReceta: 'Purga ThermoJet + molienda integrada cónica (0.22 min a 180W) + extracción bomba 15 bar (0.45 min a 1650W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 3 },
      pesoMixBase: 8,
      pasos: [
        {
          equipoKey: 'hp_breville',
          orden: 1,
          accion: 'Molienda fresca y extracción de espresso',
          preheatMinPorLote: 0.15,
          trabajoMinPorUnidad: 0.67, // 40s extracción + agua caliente
          espacioEntreUnidadesMin: 0.2,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.90,
          factorPotenciaEspacio: 0.15,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_macchiato',
      negocioId: 'hawaiian_paradise',
      nombre: 'Espresso Macchiato / Cortado (Breville Barista)',
      categoria: 'Barra de Café',
      unidad: 'tazas',
      descripcionReceta: 'Molienda + extracción espresso (0.45 min) + vaporizado corto de leche en lanceta (0.30 min a 1650W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 3 },
      pesoMixBase: 4,
      pasos: [
        {
          equipoKey: 'hp_breville',
          orden: 1,
          accion: 'Extracción de espresso y vaporizado corto',
          preheatMinPorLote: 0.15,
          trabajoMinPorUnidad: 0.75,
          espacioEntreUnidadesMin: 0.2,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.95,
          factorPotenciaEspacio: 0.15,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_flat_white',
      negocioId: 'hawaiian_paradise',
      nombre: 'Flat White (Doble Ristretto + Microespuma sedosa)',
      categoria: 'Barra de Café',
      unidad: 'tazas',
      descripcionReceta: 'Molienda doble (0.25 min) + doble ristretto (0.45 min) + texturizado de microespuma sedosa (0.55 min a 1650W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 3 },
      pesoMixBase: 3,
      pasos: [
        {
          equipoKey: 'hp_breville',
          orden: 1,
          accion: 'Extracción doble y microespuma en jarra de acero',
          preheatMinPorLote: 0.15,
          trabajoMinPorUnidad: 1.0,
          espacioEntreUnidadesMin: 0.25,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.95,
          factorPotenciaEspacio: 0.15,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_latte',
      negocioId: 'hawaiian_paradise',
      nombre: 'Caffè Latte / Vainilla / Caramel (Breville Barista)',
      categoria: 'Barra de Café',
      unidad: 'tazas',
      descripcionReceta: 'Molienda y extracción (0.45 min) + vaporizado completo de jarra de leche grande (0.75 min a 1650W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 4 },
      pesoMixBase: 5,
      pasos: [
        {
          equipoKey: 'hp_breville',
          orden: 1,
          accion: 'Extracción y vaporizado completo de leche',
          preheatMinPorLote: 0.15,
          trabajoMinPorUnidad: 1.20,
          espacioEntreUnidadesMin: 0.25,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.95,
          factorPotenciaEspacio: 0.15,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_cappuccino_mocha',
      negocioId: 'hawaiian_paradise',
      nombre: 'Cappuccino Tradicional / Caffè Mocha (Breville Barista)',
      categoria: 'Barra de Café',
      unidad: 'tazas',
      descripcionReceta: 'Molienda y extracción (0.45 min) + espumado aireado de leche en lanceta (0.70 min a 1650W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 4 },
      pesoMixBase: 5,
      pasos: [
        {
          equipoKey: 'hp_breville',
          orden: 1,
          accion: 'Extracción y espumado aireado de leche',
          preheatMinPorLote: 0.15,
          trabajoMinPorUnidad: 1.15,
          espacioEntreUnidadesMin: 0.25,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.95,
          factorPotenciaEspacio: 0.15,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_iced_coffee_frappe',
      negocioId: 'hawaiian_paradise',
      nombre: 'Frappé de Café / Iced Latte (Breville + Licuadora)',
      categoria: 'Barra de Café',
      unidad: 'bebidas',
      descripcionReceta: 'Extracción de shot espresso en Breville (0.68 min) + licuado frappé en Licuadora Ninja (0.75 min a 1200W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 3 },
      pesoMixBase: 4,
      pasos: [
        {
          equipoKey: 'hp_breville',
          orden: 1,
          accion: 'Extracción de shot concentrado para frappé',
          preheatMinPorLote: 0.15,
          trabajoMinPorUnidad: 0.68,
          espacioEntreUnidadesMin: 0.15,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.95,
          factorPotenciaEspacio: 0.15,
          apagarAlFinal: false
        },
        {
          equipoKey: 'hp_licuadora',
          orden: 2,
          accion: 'Frappeado con hielo, leche y jarabe',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.75,
          espacioEntreUnidadesMin: 0.15,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: false
        }
      ]
    },
    {
      id: 'hp_ramen_tetera',
      negocioId: 'hawaiian_paradise',
      nombre: 'Sopa Instantánea Tipo Ramen (Tetera Eléctrica 1500W)',
      categoria: 'Snacks y Caldos',
      unidad: 'sopas',
      descripcionReceta: 'Hervido rápido de agua en tetera eléctrica de 1500W (2.2 min precarga por jarra + 1.2 min por sopa).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 3 },
      pesoMixBase: 3,
      pasos: [
        {
          equipoKey: 'hp_tetera',
          orden: 1,
          accion: 'Hervido de agua y apagado automático',
          preheatMinPorLote: 2.2,
          trabajoMinPorUnidad: 1.2,
          espacioEntreUnidadesMin: 0.1,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'hp_bano_maria_servicio',
      negocioId: 'hawaiian_paradise',
      nombre: 'Porción de Baño María 2 Ollas (Esquites / Elotes / Salsas)',
      categoria: 'Snacks y Caldos',
      unidad: 'porciones',
      descripcionReceta: 'Calentamiento inicial de 2 ollas (18 min por bloque de servicio) + 1.2 min/porción al 35% de ciclo termostático.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 5, medio: 15, alto: 30 },
      pesoMixBase: 2,
      pasos: [
        {
          equipoKey: 'hp_bano_maria',
          orden: 1,
          accion: 'Mantenimiento caliente en baño maría de doble cuba',
          preheatMinPorLote: 18.0,
          trabajoMinPorUnidad: 1.2,
          espacioEntreUnidadesMin: 0.2,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.35,
          factorPotenciaEspacio: 0.35,
          apagarAlFinal: true
        }
      ]
    }
  ],

  // =========================================================================
  // 4. BORDADOS VERACRUZ (Bordado Industrial 4 Cabezas)
  // =========================================================================
  bordados_veracruz: [
    {
      id: 'bv_escudo_aemco',
      negocioId: 'bordados_veracruz',
      nombre: 'Bordado de Escudo Escolar / Logotipo Pecho en AEMCO 220V (4 Cabezas)',
      categoria: 'Bordado Industrial AEMCO 220V',
      unidad: 'prendas',
      descripcionReceta: 'Setup en Dahao (4 min/lote) + Corrida de 4 prendas simultáneas (10 min corrida = 2.5 min/prenda) + cambio de 4 bastidores (3.5 min).',
      cabezasSimultaneas: 4,
      lotesPorEscenario: { bajo: 12, medio: 24, alto: 48 }, // múltiplos de 4
      pesoMixBase: 45,
      pasos: [
        {
          equipoKey: 'bv_aemco_220',
          orden: 1,
          accion: 'Puntada continua de 4 cabezas en AEMCO 220V Cama Plana',
          preheatMinPorLote: 4.0, // Carga USB y colores en Dahao
          trabajoMinPorUnidad: 2.5, // 10 min por corrida de 4 prendas
          espacioEntreUnidadesMin: 0.875, // 3.5 min por corrida de 4
          factorPotenciaPre: 0.061, // Panel Dahao en espera (110W / 1800W)
          factorPotenciaTrabajo: 0.655, // 1180W puntada
          factorPotenciaEspacio: 0.061, // 110W cambio de bastidor
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'bv_logo_melco',
      negocioId: 'bordados_veracruz',
      nombre: 'Bordado Multicolor (hasta 6 Hilos) en Melco EMC 6/4 (4 Cabezas)',
      categoria: 'Bordado Industrial Melco EMC 6/4',
      unidad: 'prendas',
      descripcionReceta: 'Setup en Melco (5 min/lote) + Corrida de 4 prendas simultáneas (11 min corrida = 2.75 min/prenda) + cambio de bastidores (3.5 min).',
      cabezasSimultaneas: 4,
      lotesPorEscenario: { bajo: 12, medio: 24, alto: 40 },
      pesoMixBase: 30,
      pasos: [
        {
          equipoKey: 'bv_melco_emc',
          orden: 1,
          accion: 'Puntada continua de 4 cabezas y cambio de color 6 hilos',
          preheatMinPorLote: 5.0,
          trabajoMinPorUnidad: 2.75, // 11 min corrida de 4
          espacioEntreUnidadesMin: 0.875, // 3.5 min cambio de bastidores
          factorPotenciaPre: 0.063, // 95W espera
          factorPotenciaTrabajo: 0.653, // 980W puntada
          factorPotenciaEspacio: 0.063,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'bv_espalda_aemco',
      negocioId: 'bordados_veracruz',
      nombre: 'Bordado Grande de Espalda (Filipinas / Chamarras / Batas) en AEMCO',
      categoria: 'Bordado Industrial AEMCO 220V',
      unidad: 'prendas',
      descripcionReceta: 'Setup cama plana (5 min/lote) + Corrida de 4 espaldas simultáneas (~20k puntadas, 28 min corrida = 7.0 min/prenda) + enbastado (4.5 min).',
      cabezasSimultaneas: 4,
      lotesPorEscenario: { bajo: 4, medio: 12, alto: 24 },
      pesoMixBase: 15,
      pasos: [
        {
          equipoKey: 'bv_aemco_220',
          orden: 1,
          accion: 'Puntada de alta densidad en cama plana de 4 cabezas',
          preheatMinPorLote: 5.0,
          trabajoMinPorUnidad: 7.0, // 28 min corrida de 4
          espacioEntreUnidadesMin: 1.125, // 4.5 min cambio bastidores
          factorPotenciaPre: 0.061,
          factorPotenciaTrabajo: 0.655,
          factorPotenciaEspacio: 0.061,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'bv_gafetes_melco',
      negocioId: 'bordados_veracruz',
      nombre: 'Bordado en Serie de Gafetes y Parches en Melco EMC 6/4',
      categoria: 'Bordado Industrial Melco EMC 6/4',
      unidad: 'parches',
      descripcionReceta: 'Setup (3 min/lote) + Corrida rápida de 4 parches (5.5 min corrida = 1.38 min/parche) + cambio (2.5 min).',
      cabezasSimultaneas: 4,
      lotesPorEscenario: { bajo: 12, medio: 28, alto: 60 },
      pesoMixBase: 10,
      pasos: [
        {
          equipoKey: 'bv_melco_emc',
          orden: 1,
          accion: 'Bordado rápido de parches/nombres en serie',
          preheatMinPorLote: 3.0,
          trabajoMinPorUnidad: 1.375, // 5.5 min corrida de 4
          espacioEntreUnidadesMin: 0.625, // 2.5 min cambio bastidores
          factorPotenciaPre: 0.063,
          factorPotenciaTrabajo: 0.653,
          factorPotenciaEspacio: 0.063,
          apagarAlFinal: true
        }
      ]
    }
  ],

  // =========================================================================
  // 5. TALLER DE COSTURA (Confección de Filipinas, Pantalones y Polos)
  // =========================================================================
  taller_costura: [
    {
      id: 'tc_filipina',
      negocioId: 'taller_costura',
      nombre: 'Confección de Filipina Médica / Chef (Recta + Overlock)',
      categoria: 'Confección Médica e Industrial',
      unidad: 'filipinas',
      descripcionReceta: 'Corte por lote + Overlock 5 Hilos (6 min/pza) + 2x Rectas Singer (14 min/pza hombre-máquina = 7 min por máquina) + vaporizado. Collaretera = 0 min.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 5, medio: 15, alto: 30 },
      pesoMixBase: 45, // Prenda principal
      pasos: [
        {
          equipoKey: 'tc_cortadora',
          orden: 1,
          accion: 'Tendido y corte de piezas con cortadora de disco',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.40, // 6 min lote de 15
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        },
        {
          equipoKey: 'tc_overlock_5h',
          orden: 2,
          accion: 'Sobrehilado y unión de piezas con cadeneta de seguridad',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 6.0,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.472, // 260W
          factorPotenciaEspacio: 0.027, // 15W
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_rectas_singer',
          orden: 3,
          accion: 'Costura recta en 2 máquinas Singer (cuello, bolsas, aletillas)',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 7.0, // 7 min en cada una de las 2 máquinas en paralelo = 14 min hombre-máquina
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.436, // 240W
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_plancha_vapor',
          orden: 4,
          accion: 'Vaporizado y terminado final',
          preheatMinPorLote: 8.0,
          trabajoMinPorUnidad: 1.2,
          espacioEntreUnidadesMin: 0.2,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.70,
          factorPotenciaEspacio: 0.25,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'tc_pantalon',
      negocioId: 'taller_costura',
      nombre: 'Confección de Pantalón Clínico / Escolar (Recta + Overlock)',
      categoria: 'Confección Médica e Industrial',
      unidad: 'pantalones',
      descripcionReceta: 'Corte por lote + Overlock 5 Hilos (5.5 min/pza) + 2x Rectas Singer (12.5 min/pza hombre-máquina = 6.25 min por máquina) + vaporizado. Collaretera = 0 min.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 5, medio: 15, alto: 30 },
      pesoMixBase: 43, // Prenda principal
      pasos: [
        {
          equipoKey: 'tc_cortadora',
          orden: 1,
          accion: 'Corte de delanteros, traseros, tiros y bolsas',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.40,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        },
        {
          equipoKey: 'tc_overlock_5h',
          orden: 2,
          accion: 'Armado de entrepierna, costados y tiros en Overlock',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 5.5,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.472,
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_rectas_singer',
          orden: 3,
          accion: 'Costura recta en 2 máquinas Singer (bolsas diagonales, pretina, jareta/cierre)',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 6.25,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.436,
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_plancha_vapor',
          orden: 4,
          accion: 'Quiebre de raya y planchado final',
          preheatMinPorLote: 8.0,
          trabajoMinPorUnidad: 1.2,
          espacioEntreUnidadesMin: 0.2,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.70,
          factorPotenciaEspacio: 0.25,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'tc_playera_polo_stretch',
      negocioId: 'taller_costura',
      nombre: 'Playera Polo en Tela Stretch / Escolar (Usa Collaretera - POCAS AL MES)',
      categoria: 'Prendas de Punto & Stretch',
      unidad: 'playeras',
      descripcionReceta: 'Overlock 5h (4.5 min) + Recta Singer (5.5 min aletilla) + Máquina Collaretera Singer (4.0 min dobladillo/ruedo stretch). Se hacen pocas al mes.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 3, medio: 10, alto: 20 },
      pesoMixBase: 8, // Pocas al mes (~8% del volumen)
      pasos: [
        {
          equipoKey: 'tc_cortadora',
          orden: 1,
          accion: 'Corte de tela piqué/stretch',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.35,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        },
        {
          equipoKey: 'tc_overlock_5h',
          orden: 2,
          accion: 'Cerrado de hombros y costados en tejido elástico',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 4.5,
          espacioEntreUnidadesMin: 0.4,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.472,
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_rectas_singer',
          orden: 3,
          accion: 'Pegado de aletilla, cuello tejido y botones en Recta',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 5.5,
          espacioEntreUnidadesMin: 0.4,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.436,
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_collaretera_singer',
          orden: 4,
          accion: 'Pre-ajuste (3 min/lote) + Dobladillo elástico en ruedo y puños con Collaretera',
          preheatMinPorLote: 3.0,
          trabajoMinPorUnidad: 4.0,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.454, // 250W
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: true
        },
        {
          equipoKey: 'tc_plancha_vapor',
          orden: 5,
          accion: 'Vaporizado ligero de cuello y manga',
          preheatMinPorLote: 6.0,
          trabajoMinPorUnidad: 0.8,
          espacioEntreUnidadesMin: 0.2,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.70,
          factorPotenciaEspacio: 0.25,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'tc_bata_laboratorio',
      negocioId: 'taller_costura',
      nombre: 'Confección de Bata Médica / Laboratorio (Recta + Overlock)',
      categoria: 'Confección Médica e Industrial',
      unidad: 'batas',
      descripcionReceta: 'Overlock 5h (5.5 min) + 2x Rectas Singer (15 min/pza hombre-máquina = 7.5 min por máquina para solapas, aletillas y 3 bolsas) + planchado.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 2, medio: 8, alto: 16 },
      pesoMixBase: 4,
      pasos: [
        {
          equipoKey: 'tc_cortadora',
          orden: 1,
          accion: 'Corte de piezas largas de bata',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 0.45,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        },
        {
          equipoKey: 'tc_overlock_5h',
          orden: 2,
          accion: 'Sobrehilado de vistas y mangas',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 5.5,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.472,
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_rectas_singer',
          orden: 3,
          accion: 'Costura de solapas, aletilla oculta, bolsas y cinturón',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 7.5,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.436,
          factorPotenciaEspacio: 0.027,
          apagarAlFinal: false
        },
        {
          equipoKey: 'tc_plancha_vapor',
          orden: 4,
          accion: 'Planchado de solapa y cuerpo',
          preheatMinPorLote: 8.0,
          trabajoMinPorUnidad: 1.5,
          espacioEntreUnidadesMin: 0.2,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.70,
          factorPotenciaEspacio: 0.25,
          apagarAlFinal: true
        }
      ]
    }
  ],

  // =========================================================================
  // 6. PUBLI-IMPERIA (Sublimación, DTF, Láser, Serigrafía & Vinil)
  // =========================================================================
  taller_publi_imperia: [
    {
      id: 'pi_sub_tazas',
      negocioId: 'taller_publi_imperia',
      nombre: 'Sublimación de Tazas 11oz/15oz (Epson L120 + Plancha Tazas 350W)',
      categoria: 'Sublimación',
      unidad: 'tazas',
      descripcionReceta: 'Epson L120 (1.2 min/hoja) + Plancha de Tazas: precalentado 5 min a 200°C + 3 min planchado + 30s espacio entre tazas + apagado final.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 6, alto: 12 },
      pesoMixBase: 24,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Preparación de plantilla e impresión en PC',
          preheatMinPorLote: 1.5,
          trabajoMinPorUnidad: 0.1,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_epson',
          orden: 2,
          accion: 'Impresión en papel transfer con tinta de sublimación',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 1.2,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.075,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_plancha_tazas',
          orden: 3,
          accion: 'Precalentado a 200°C (5 min), planchado térmico (3 min) y pausas de 30s manteniendo calor',
          preheatMinPorLote: 5.0,
          trabajoMinPorUnidad: 3.0,
          espacioEntreUnidadesMin: 0.5, // 30 segundos
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.75,
          factorPotenciaEspacio: 0.45,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_sub_playeras',
      negocioId: 'taller_publi_imperia',
      nombre: 'Sublimación de Playeras Poliéster A4/A3 (Plancha Plana 1400W)',
      categoria: 'Sublimación',
      unidad: 'playeras',
      descripcionReceta: 'Epson L120 (1.5 min) + Plancha Plana: precalentado 6 min a 200°C + planchado 1.15 min (preplanchado 9s + sublimado 60s) + 30s cambio + apagado.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 2, medio: 10, alto: 20 },
      pesoMixBase: 16,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Ajuste de diseño A4/A3',
          preheatMinPorLote: 2.0,
          trabajoMinPorUnidad: 0.1,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_epson',
          orden: 2,
          accion: 'Impresión en papel de sublimación',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 1.5,
          espacioEntreUnidadesMin: 0.1,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.075,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_plancha_plana',
          orden: 3,
          accion: 'Precalentado 6 min a 200°C y sublimación plana',
          preheatMinPorLote: 6.0,
          trabajoMinPorUnidad: 1.15,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.70,
          factorPotenciaEspacio: 0.40,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_sub_gorras',
      negocioId: 'taller_publi_imperia',
      nombre: 'Sublimación de Gorras Trucker / Poliéster (Plancha Gorras 400W)',
      categoria: 'Sublimación',
      unidad: 'gorras',
      descripcionReceta: 'Epson L120 (1.0 min) + Plancha Gorras: precalentado 4 min a 190°C + prensado 1.0 min + 30s cambio de horma + apagado.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 2, medio: 8, alto: 15 },
      pesoMixBase: 10,
      pasos: [
        {
          equipoKey: 'pi_epson',
          orden: 1,
          accion: 'Impresión de frentes para gorras',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 1.0,
          espacioEntreUnidadesMin: 0.1,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.075,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_plancha_gorras',
          orden: 2,
          accion: 'Precalentado a 190°C y sublimado curvo',
          preheatMinPorLote: 4.0,
          trabajoMinPorUnidad: 1.0,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.75,
          factorPotenciaEspacio: 0.45,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_dtf_playeras',
      negocioId: 'taller_publi_imperia',
      nombre: 'Planchado Local de Impresiones DTF en Playeras (DTF Externo)',
      categoria: 'Termofijado y DTF',
      unidad: 'playeras',
      descripcionReceta: 'DTF comprado externo. Plancha Plana: precalentado 5 min a 165°C + 0.65 min (quita humedad 9s + 1ra bajada 20s + resellado 10s) + 30s pelado film.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 3, medio: 12, alto: 25 },
      pesoMixBase: 18,
      pasos: [
        {
          equipoKey: 'pi_plancha_plana',
          orden: 1,
          accion: 'Precalentado a 165°C, prensado DTF y resellado',
          preheatMinPorLote: 5.0,
          trabajoMinPorUnidad: 0.65,
          espacioEntreUnidadesMin: 0.5, // 30s pelado film
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.70,
          factorPotenciaEspacio: 0.40,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_dtf_gorras',
      negocioId: 'taller_publi_imperia',
      nombre: 'Planchado Local de Impresiones DTF en Gorras / Mangas (DTF Externo)',
      categoria: 'Termofijado y DTF',
      unidad: 'gorras',
      descripcionReceta: 'DTF comprado externo. Plancha Gorras: precalentado 4 min a 160°C + 0.42 min (1ra bajada 15s + resellado 10s) + 24s pelado + apagado.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 2, medio: 10, alto: 20 },
      pesoMixBase: 8,
      pasos: [
        {
          equipoKey: 'pi_plancha_gorras',
          orden: 1,
          accion: 'Precalentado a 160°C y termofijado de transfer DTF en gorra',
          preheatMinPorLote: 4.0,
          trabajoMinPorUnidad: 0.42,
          espacioEntreUnidadesMin: 0.4, // 24s
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.75,
          factorPotenciaEspacio: 0.45,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_vinil_playeras',
      negocioId: 'taller_publi_imperia',
      nombre: 'Corte de Vinil Textil (ScanNCut) + Planchado en Playeras',
      categoria: 'Vinil Textil',
      unidad: 'playeras',
      descripcionReceta: 'ScanNCut (2.5 min corte) + Plancha Plana: precalentado 5 min a 160°C + planchado 0.35 min (21s fijado) + 24s pelado/alineación.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 2, medio: 8, alto: 15 },
      pesoMixBase: 8,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Envío de vectores a ScanNCut',
          preheatMinPorLote: 3.0,
          trabajoMinPorUnidad: 0.1,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_scanncut',
          orden: 2,
          accion: 'Corte digital en plotter de vinil textil',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 2.5,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.16,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_plancha_plana',
          orden: 3,
          accion: 'Precalentado y fijado térmico de vinil a 160°C',
          preheatMinPorLote: 5.0,
          trabajoMinPorUnidad: 0.35,
          espacioEntreUnidadesMin: 0.4,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.70,
          factorPotenciaEspacio: 0.40,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_vinil_gorras',
      negocioId: 'taller_publi_imperia',
      nombre: 'Corte de Vinil Textil (ScanNCut) + Planchado en Gorras',
      categoria: 'Vinil Textil',
      unidad: 'gorras',
      descripcionReceta: 'ScanNCut (1.5 min corte) + Plancha Gorras: precalentado 4 min a 160°C + prensado 0.25 min (15s) + 24s cambio horma.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 2, medio: 8, alto: 15 },
      pesoMixBase: 5,
      pasos: [
        {
          equipoKey: 'pi_scanncut',
          orden: 1,
          accion: 'Corte de detalles para gorras',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 1.5,
          espacioEntreUnidadesMin: 0.3,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.16,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_plancha_gorras',
          orden: 2,
          accion: 'Fijado curvo en gorra',
          preheatMinPorLote: 4.0,
          trabajoMinPorUnidad: 0.25,
          espacioEntreUnidadesMin: 0.4,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.75,
          factorPotenciaEspacio: 0.45,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_bordado_pe770',
      negocioId: 'taller_publi_imperia',
      nombre: 'Bordado Personalizado / Nombres / Escudos (Brother PE770)',
      categoria: 'Bordado Computarizado',
      unidad: 'prendas',
      descripcionReceta: 'PC Diseño matriz .PES (5 min/lote) + Brother PE770: bordado activo (10 min/pza a 58W) + cambio de bastidor/hilo (2 min).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 4, alto: 8 },
      pesoMixBase: 5,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Ajuste de matriz de ponchado USB',
          preheatMinPorLote: 5.0,
          trabajoMinPorUnidad: 0.2,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_pe770',
          orden: 2,
          accion: 'Bordado de 1 cabeza en bastidor plano',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 10.0,
          espacioEntreUnidadesMin: 2.0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.77,
          factorPotenciaEspacio: 0.16,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_laser_grabado',
      negocioId: 'taller_publi_imperia',
      nombre: 'Grabado Láser en Termos, Placas, Madera o Acrílico (Atomstack A20)',
      categoria: 'Láser CNC',
      unidad: 'piezas',
      descripcionReceta: 'PC LightBurn (4 min/lote) + Atomstack A20: grabado raster (8 min/pza a 85W) + 1 min cambio de pieza.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 5, alto: 10 },
      pesoMixBase: 5,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Preparación de archivo LightBurn y encuadre',
          preheatMinPorLote: 4.0,
          trabajoMinPorUnidad: 0.1,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_atomstack',
          orden: 2,
          accion: 'Grabado raster óptico 20W con asistencia de aire',
          preheatMinPorLote: 1.0, // Enfoque y test
          trabajoMinPorUnidad: 8.0,
          espacioEntreUnidadesMin: 1.0,
          factorPotenciaPre: 0.125, // 15W encuadre
          factorPotenciaTrabajo: 0.708, // 85W grabado
          factorPotenciaEspacio: 0.125,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_laser_corte',
      negocioId: 'taller_publi_imperia',
      nombre: 'Corte Láser de MDF / Acrílico Promocional (Atomstack A20)',
      categoria: 'Láser CNC',
      unidad: 'placas',
      descripcionReceta: 'PC anidado CAD (5 min/lote) + Atomstack A20: corte 100% potencia + Air Assist (14 min/placa a 120W) + 1.5 min extracción.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 3, alto: 6 },
      pesoMixBase: 3,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Optimización de trayectorias de corte',
          preheatMinPorLote: 5.0,
          trabajoMinPorUnidad: 0.1,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_atomstack',
          orden: 2,
          accion: 'Corte vectorial continuo al 100% con bomba de aire',
          preheatMinPorLote: 1.0,
          trabajoMinPorUnidad: 14.0,
          espacioEntreUnidadesMin: 1.5,
          factorPotenciaPre: 0.125,
          factorPotenciaTrabajo: 1.0, // 120W
          factorPotenciaEspacio: 0.125,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_revelado_marco',
      negocioId: 'taller_publi_imperia',
      nombre: 'Revelado de Marcos de Serigrafía (Set 8 Tubos 32W - 256W)',
      categoria: 'Serigrafía Tradicional',
      unidad: 'marcos',
      descripcionReceta: 'PC separación (6 min) + Epson positivo (2 min) + Mesa de insolado con 8 lámparas de 32W (6.5 min a 256W exactos).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 2, alto: 4 },
      pesoMixBase: 2,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Separación de color de mallas',
          preheatMinPorLote: 6.0,
          trabajoMinPorUnidad: 0.5,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_epson',
          orden: 2,
          accion: 'Impresión de positivo en albanene/filmina',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 2.0,
          espacioEntreUnidadesMin: 0.1,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.075,
          apagarAlFinal: false
        },
        {
          equipoKey: 'pi_reveladora',
          orden: 3,
          accion: 'Insolación UV de la emulsión con 8 lámparas de 32W',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 6.5,
          espacioEntreUnidadesMin: 0.5,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0, // 256W exactos
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_serigrafia_80x100',
      negocioId: 'taller_publi_imperia',
      nombre: 'Curado / Termofijado Serigrafía o Full-Print (Plancha 80x100 cm 220V)',
      categoria: 'Serigrafía Tradicional',
      unidad: 'prendas',
      descripcionReceta: 'Plancha Gran Formato 80x100 220V (3600W): precalentado pesado 12 min a 180°C + 0.75 min prensado (45s) + 24s cambio bandeja.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 10, medio: 25, alto: 50 },
      pesoMixBase: 3,
      pasos: [
        {
          equipoKey: 'pi_plancha_80x100',
          orden: 1,
          accion: 'Precalentado pesado a 220V (12 min) y prensado continuo de 80x100 cm',
          preheatMinPorLote: 12.0,
          trabajoMinPorUnidad: 0.75, // 45 segundos
          espacioEntreUnidadesMin: 0.40, // 24 segundos
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.68,
          factorPotenciaEspacio: 0.40,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'pi_diseno_grafico',
      negocioId: 'taller_publi_imperia',
      nombre: 'Servicio de Diseño Gráfico, Vectorizado y Ponchado (PC Diseño)',
      categoria: 'Servicios de Diseño',
      unidad: 'proyectos',
      descripcionReceta: 'Sesión activa de diseño editorial, vectorizado o ponchado en workstation gráfica (30 min a 240W).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      pesoMixBase: 2,
      pasos: [
        {
          equipoKey: 'pi_pc_diseno',
          orden: 1,
          accion: 'Vectorizado e ilustración en Adobe Illustrator / Corel / Wilcom',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 30.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.53,
          factorPotenciaEspacio: 0.21,
          apagarAlFinal: false
        }
      ]
    }
  ],

  // =========================================================================
  // 7. OFICINA CONSORCIO (Administración, Juntas & Contabilidad - Baja Ocupación)
  // =========================================================================
  oficinas_consorcio: [
    {
      id: 'oc_sesion_contable',
      negocioId: 'oficinas_consorcio',
      nombre: 'Sesión Administrativa / Contable Individual (Bloque 2 Horas)',
      categoria: 'Gestión Administrativa',
      unidad: 'sesiones',
      descripcionReceta: 'Laptop (120 min) + Luces LED (120 min) + AC 12,000 BTU (15 min arranque al 100% + 105 min modulación al 58%).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      volumenFijoEscenario: { bajo: 4, medio: 10, alto: 18 }, // Perfil controlado de baja ocupación
      pesoMixBase: 50,
      pasos: [
        {
          equipoKey: 'oc_laptop',
          orden: 1,
          accion: 'Revisión contable y pagos bancarios',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 120.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.30,
          apagarAlFinal: true
        },
        {
          equipoKey: 'oc_ac_12k',
          orden: 2,
          accion: 'Climatización durante la sesión (15m arranque 100% + 105m inverter 58%)',
          preheatMinPorLote: 15.0,
          trabajoMinPorUnidad: 105.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.58,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'oc_junta_directiva',
      negocioId: 'oficinas_consorcio',
      nombre: 'Junta Directiva con Pantalla Smart TV de 32" (Bloque 1.5 Horas)',
      categoria: 'Reuniones de Negocios',
      unidad: 'juntas',
      descripcionReceta: 'Laptop (90 min) + TV Smart 32" (90 min) + Luces LED (90 min) + AC 12,000 BTU (15 min al 100% + 75 min al 58%).',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      volumenFijoEscenario: { bajo: 2, medio: 5, alto: 10 },
      pesoMixBase: 30,
      pasos: [
        {
          equipoKey: 'oc_laptop',
          orden: 1,
          accion: 'Presentación ejecutiva',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 90.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.30,
          apagarAlFinal: true
        },
        {
          equipoKey: 'oc_tv_32',
          orden: 2,
          accion: 'Proyección en pantalla TV 32"',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 90.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        },
        {
          equipoKey: 'oc_ac_12k',
          orden: 3,
          accion: 'Climatización en junta',
          preheatMinPorLote: 15.0,
          trabajoMinPorUnidad: 75.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 0.58,
          factorPotenciaEspacio: 0.0,
          apagarAlFinal: true
        }
      ]
    },
    {
      id: 'oc_visita_breve',
      negocioId: 'oficinas_consorcio',
      nombre: 'Revisión Rápida de Documentos sin Clima (Bloque 30 Minutos)',
      categoria: 'Gestión Administrativa',
      unidad: 'visitas',
      descripcionReceta: 'Laptop (30 min) + Luces LED (30 min), sin encendido de aire acondicionado.',
      cabezasSimultaneas: 1,
      lotesPorEscenario: { bajo: 1, medio: 1, alto: 1 },
      volumenFijoEscenario: { bajo: 4, medio: 8, alto: 12 },
      pesoMixBase: 20,
      pasos: [
        {
          equipoKey: 'oc_laptop',
          orden: 1,
          accion: 'Firma de documentos y cheques',
          preheatMinPorLote: 0,
          trabajoMinPorUnidad: 30.0,
          espacioEntreUnidadesMin: 0,
          factorPotenciaPre: 1.0,
          factorPotenciaTrabajo: 1.0,
          factorPotenciaEspacio: 0.30,
          apagarAlFinal: true
        }
      ]
    }
  ]
};
