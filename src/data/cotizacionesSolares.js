/**
 * Catálogo maestro de Arquitecturas Solares, Parámetros Fotovoltaicos para Veracruz
 * y Cotizaciones Reales de Proveedores recibidas por WhatsApp.
 */

export const PARAMETROS_MERCADO_SOLAR = {
  ciudad: 'Veracruz, Ver.',
  hspPromedio: 5.0,          // Horas Solares Pico promedio anual en Veracruz
  performanceRatio: 0.80,    // Eficiencia real por temperatura costera, cableado y suciedad
  areaPorPanelM2: 3.0,       // ~2.69 m² panel 645W + separación/pasillo técnico
  azoteaDefaultM2: 120,      // Referencia editable por el usuario
  degradacionAnual: 0.005,   // 0.5% anual típica paneles Tier 1
  inflacionCfeAnual: 0.045,  // 4.5% anual ajuste histórico tarifas
  tasaISR: 0.30,             // Beneficio fiscal Art. 34 fracc. XIII LISR (deducción 100% año 1)
  bateriaModuloKwh: 5.0,     // Bloques estándar LiFePO4 48V (~5.12 kWh nominal)
  bateriaDoD: 0.90,          // Profundidad de descarga segura LiFePO4 (90%)
  eficienciaInversor: 0.92,  // Eficiencia DC->AC
  costoBateriaPor5KwhMxn: 28500, // Precio de mercado MXN módulo LiFePO4 5 kWh instalado
  costoUpgradeHibridoBaseMxn: 26000, // Diferencial inversor híbrido + subtablero cargas críticas
  costoInversorUpsPorKwMxn: 4800,    // Costo inversor-cargador + transferencia automática UPS
  costoWpReferenciaOnGrid: 14.50,    // Promedio mercado Veracruz ($/Wp IVA incluido)
  wattPanelReferencia: 645
};

export const ARQUITECTURAS_SOLARES = [
  {
    id: 'on_grid',
    nombre: 'Interconectado a CFE',
    subtitulo: 'Medidor Bidireccional (On-Grid)',
    resumenSocios: 'Ahorra al máximo usando a CFE como "batería virtual". De día mandas luz a la red y de noche consumes ese saldo.',
    etiquetaRecomendada: 'Mayor Ahorro / Menor Inversión',
    color: 'emerald',
    usaPaneles: true,
    usaBaterias: false,
    usaCfe: true,
    bajaReciboCFE: 'Hasta 95–98%',
    funcionaEnApagon: false,
    requiereTramiteCFE: 'Sí (15–20 días)',
    nivelInversion: 'Baja / Óptima',
    costoExtraHibrido: 0,
    factorAprovechamientoSolar: 1.0,
    componentes: [
      'Paneles Solares Monocristalinos',
      'Inversor Central o Microinversores',
      'Estructura Aluminio Grado Marino',
      'Protecciones AC/DC y Tierra Física',
      'Medidor Bidireccional CFE'
    ],
    pros: [
      'Es la opción más económica y se paga sola en 2.5 a 4 años.',
      'No requiere comprar ni reemplazar baterías nunca.',
      'Es la configuración que cotizaron tus 4 proveedores de WhatsApp.'
    ],
    contras: [
      'Por norma de seguridad anti-isla, si se va la luz de CFE el sistema se apaga aunque haya sol.',
      'Cada sistema se interconecta a un solo contrato/medidor CFE.'
    ]
  },
  {
    id: 'hibrido',
    nombre: 'Híbrido (Sol + Baterías + CFE)',
    subtitulo: 'Ahorro + Respaldo Automático 24/7',
    resumenSocios: 'Lo mejor de ambos mundos: baja tu recibo CFE todos los días y, si hay apagón, las baterías entran en 10 milisegundos sin apagar cajas ni refrigeradores.',
    etiquetaRecomendada: 'Máxima Seguridad Comercial',
    color: 'amber',
    usaPaneles: true,
    usaBaterias: true,
    usaCfe: true,
    bajaReciboCFE: 'Hasta 95–98%',
    funcionaEnApagon: true,
    requiereTramiteCFE: 'Sí (o modo Cero Exportación)',
    nivelInversion: 'Media-Alta',
    costoExtraHibrido: 26000,
    factorAprovechamientoSolar: 0.98,
    componentes: [
      'Paneles Solares en Azotea',
      'Inversor Híbrido Inteligente (ej. Deye / Growatt SPH)',
      'Banco de Baterías Litio LiFePO4 (5–40 kWh)',
      'Subtablero de Cargas Críticas (Respaldo)',
      'Medidor Bidireccional CFE'
    ],
    pros: [
      'Protege refrigeradores de Hawaiian, TPVs, cámaras y operación en apagones.',
      'De día, si se va CFE, los paneles siguen cargando las baterías y alimentando el local.',
      'Puedes empezar con 1 o 2 baterías (5–10 kWh) y agregar más después.'
    ],
    contras: [
      'Inversión inicial 45% a 90% mayor que un sistema On-Grid.',
      'Requiere separar en el tablero qué circuitos van a respaldo crítico.'
    ]
  },
  {
    id: 'ups_baterias',
    nombre: 'Respaldo Puro (Solo Baterías)',
    subtitulo: 'UPS Industrial Sin Paneles Solares',
    resumenSocios: 'Una batería gigante conectada a la luz de CFE. No baja tu recibo, pero si se va la luz sostiene tus refrigeradores, cajas y cámaras en silencio.',
    etiquetaRecomendada: 'Anti-Apagones Sin Obras en Techo',
    color: 'cyan',
    usaPaneles: false,
    usaBaterias: true,
    usaCfe: true,
    bajaReciboCFE: '0% (No genera luz)',
    funcionaEnApagon: true,
    requiereTramiteCFE: 'No requiere trámite',
    nivelInversion: 'Baja-Media',
    costoExtraHibrido: 0,
    factorAprovechamientoSolar: 0,
    componentes: [
      'Inversor-Cargador con Transferencia < 20 ms',
      'Banco de Baterías Litio LiFePO4 (5–40 kWh)',
      'Subtablero de Cargas Críticas',
      'Conexión directa al tablero CFE existente'
    ],
    pros: [
      'Cero ruido, cero gasolina y arranque automático (a diferencia de planta de gasolina).',
      'No depende del clima ni requiere espacio en azotea ni trámites con CFE.',
      'Listo para agregar paneles solares en el futuro si se compra inversor híbrido.'
    ],
    contras: [
      'No ahorra dinero en el recibo de CFE.',
      'Si el apagón dura más que la batería, no puede recargarse hasta que regrese CFE.'
    ]
  },
  {
    id: 'zero_export',
    nombre: 'Alimentación Directa Diurna',
    subtitulo: 'Cero Exportación (Zero-Export)',
    resumenSocios: 'Los paneles alimentan directo a los locales mientras hay sol (horario comercial 9am–6pm) y un sensor frena la potencia para nunca mandar luz hacia CFE.',
    etiquetaRecomendada: 'Sin Esperar Medidor Bidireccional',
    color: 'sky',
    usaPaneles: true,
    usaBaterias: false,
    usaCfe: true,
    bajaReciboCFE: 'Parcial (40–65% consumo diurno)',
    funcionaEnApagon: false,
    requiereTramiteCFE: 'Aviso simple / sin inyección',
    nivelInversion: 'Baja',
    costoExtraHibrido: 4500, // Sensor Smart Meter / CT Clamp
    factorAprovechamientoSolar: 0.62, // Aprovecha lo que se consume mientras hay sol
    componentes: [
      'Paneles Solares en Azotea',
      'Inversor con Limitador de Exportación',
      'Sensor CT Clamp / Smart Meter en Acometida',
      'Tablero Eléctrico Principal CFE'
    ],
    pros: [
      'Evita que un medidor digital viejo de CFE te cobre la energía inyectada como consumo.',
      'Aprovecha que tus negocios trabajan justo en horario de sol.',
      'Se convierte a On-Grid completo cambiando un parámetro cuando tengas medidor bidireccional.'
    ],
    contras: [
      'Los excedentes de mediodía o domingos cerrados se desperdician al no poder inyectarse.',
      'Tampoco funciona durante un apagón de CFE (a menos que sea híbrido).'
    ]
  },
  {
    id: 'off_grid',
    nombre: 'Aislado Total 100% (Off-Grid)',
    subtitulo: 'Autónomo Sin Conexión a CFE',
    resumenSocios: 'Desconexión total de CFE: paneles grandes más un banco robusto de baterías para sobrevivir noches y días nublados sin pagar jamás recibo.',
    etiquetaRecomendada: 'Independencia Total (Alto Costo)',
    color: 'violet',
    usaPaneles: true,
    usaBaterias: true,
    usaCfe: false,
    bajaReciboCFE: '100% (Sin contrato CFE)',
    funcionaEnApagon: true,
    requiereTramiteCFE: 'Ninguno (Desconectado)',
    nivelInversion: 'Muy Alta',
    costoExtraHibrido: 38000,
    factorAprovechamientoSolar: 0.85,
    componentes: [
      'Campo Solar Sobredimensionado (+30%)',
      'Inversor(es) Off-Grid de Alta Potencia Pico',
      'Banco Masivo de Baterías LiFePO4 (20–40+ kWh)',
      'Controladores MPPT y Protecciones DC'
    ],
    pros: [
      'Cero dependencia de CFE, cero apagones, cero aumentos tarifarios.',
      'Ideal para zonas sin acceso a red eléctrica.'
    ],
    contras: [
      'Muy costoso para un edificio comercial en ciudad con picos de 15–20 kW.',
      'Si hay 3 días seguidos de norte/lluvia en Veracruz, puedes requerir planta de respaldo.'
    ]
  }
];

/**
 * Cotizaciones reales recibidas vía WhatsApp (Noviembre 2026)
 */
export const COTIZACIONES_PROVEEDORES = [
  {
    id: 'green_energy_veracruz',
    proveedor: 'GreenEnergy Veracruz',
    vendedor: 'Isabel Reyes · WhatsApp 229-128-3721',
    folio: 'ABC-1035-GE',
    arquitectura: 'on_grid',
    tipoInversor: 'Microinversores',
    modeloPanel: 'LONGi Hi-Mo X10 645W Monocristalino',
    modeloInversor: '2× Microinversores Hoymiles / Growatt 2000W (4 kW AC)',
    estructura: 'K2 Systems Aluminio Anodizado Grado Marino',
    cantidadPaneles: 8,
    wattsPorPanel: 645,
    potenciaKwp: 5.16,
    precioListaMxn: 66584,
    precioContadoMxn: 66584,
    descuentoContadoPct: 0,
    condicionesPago: 'Pago contra entrega (0% anticipo)',
    incluyeTramiteCFE: true,
    incluyeMonitoreo: true,
    incluyeBaterias: false,
    bateriaKwh: 0,
    tiempoTramiteDias: '15 a 20 días',
    produccionPrometidaBimKwh: 1240,
    destacadoBadge: 'Mejor $/Watt · Sin Anticipo',
    badgeColor: 'emerald',
    notasAuditoria: [
      'Precio más competitivo por Watt ($12.90/Wp) y cero anticipo (pago contra entrega).',
      'Estructura K2 grado marino ideal contra el salitre de Veracruz; microinversores permiten crecer de 4 en 4 paneles.',
      'ALERTA A VERIFICAR: En el pie de su PDF menciona 580W (posible copy-paste de plantilla) y la tabla de retorno venía en $000000. Confirmar por escrito panel 645W exacto, modelo de microinversor Hoymiles y si incluye el DTU WiFi.'
    ],
    esOficialWhatsApp: true
  },
  {
    id: 'solarec_730w',
    proveedor: 'Solarec',
    vendedor: 'Atención Comercial Solarec (WhatsApp)',
    folio: 'PAQ-TW730-8',
    arquitectura: 'on_grid',
    tipoInversor: 'Inversor Central (String)',
    modeloPanel: 'TW Solar 730W Alta Potencia',
    modeloInversor: 'Inversor Central HYXiPOWER (Bifásico 220V)',
    estructura: 'Aluminio Anodizado + Instalación completa',
    cantidadPaneles: 8,
    wattsPorPanel: 730,
    potenciaKwp: 5.84,
    precioListaMxn: 88600,
    precioContadoMxn: 84170, // 5% descuento pagando de contado
    descuentoContadoPct: 5,
    condicionesPago: '5% descuento de contado ($84,170 MXN)',
    incluyeTramiteCFE: true,
    incluyeMonitoreo: true,
    incluyeBaterias: false,
    bateriaKwh: 0,
    tiempoTramiteDias: '15 a 25 días',
    produccionPrometidaBimKwh: 1561,
    destacadoBadge: 'Mayor Potencia (5.84 kWp)',
    badgeColor: 'amber',
    notasAuditoria: [
      'Genera ~13% más energía que los kits de 635–645W ocupando los mismos 8 lugares en azotea.',
      'Excelente costo/Watt pagando de contado ($14.41/Wp con el 5% de descuento).',
      'ALERTA A VERIFICAR: Al ser inversor central (en serie/string), una sombra parcial de tinaco o pretil reduce el rendimiento de la cadena. Confirmar que ya no aplica promo 8+2 en 730W (solo en 650W).'
    ],
    esOficialWhatsApp: true
  },
  {
    id: 'frittsolar_635w',
    proveedor: 'FrittSolar (GIEG)',
    vendedor: 'FrittSolar · Plaza Pabellón Floresta · 229-450-0481',
    folio: '20260484',
    arquitectura: 'on_grid',
    tipoInversor: 'Microinversores',
    modeloPanel: 'LONGi Hi-Mo 7 635W Bifacial (6 + 2 Gratis)',
    modeloInversor: '2× Hoymiles 2000W + DTU-LITE-S Monitoreo',
    estructura: 'K2 Systems Aluminio Anodizado',
    cantidadPaneles: 8,
    wattsPorPanel: 635,
    potenciaKwp: 5.08,
    precioListaMxn: 82366.96,
    precioContadoMxn: 82366.96,
    descuentoContadoPct: 0,
    condicionesPago: '70% firma · 20% llegada · 10% finalización',
    incluyeTramiteCFE: true,
    incluyeMonitoreo: true,
    incluyeBaterias: false,
    bateriaKwh: 0,
    tiempoTramiteDias: 'Atención fallas < 72h',
    produccionPrometidaBimKwh: 1098,
    destacadoBadge: 'Panel Bifacial + DTU Incluido',
    badgeColor: 'orange',
    notasAuditoria: [
      'Cotización muy formal: especifica explícitamente panel Bifacial, DTU-LITE-S y reportes mensuales.',
      'ALERTA PRECIO: Cuesta $15,783 MXN más que GreenEnergy por hardware casi equivalente y solicita 70% de anticipo.',
      'ERROR EN PDF DETECTADO: La portada y ROI simularon solo 6 paneles (3.81 kW / 824 kWh bimestrales) bajo tarifa residencial 1C en lugar de los 8 paneles del kit.'
    ],
    esOficialWhatsApp: true
  },
  {
    id: 'grupo_arreozola',
    proveedor: 'Grupo Arreozola',
    vendedor: 'Coatzacoalcos / Ver. · WhatsApp 283-115-7110',
    folio: 'TABLA-640W',
    arquitectura: 'on_grid',
    tipoInversor: 'Inversor Central (String)',
    modeloPanel: 'Módulos Solares 640W',
    modeloInversor: 'Inversor Central Growatt + Protecciones y Monitoreo',
    estructura: 'Estructura de Aluminio (instalación básica hasta 30 m)',
    cantidadPaneles: 8,
    wattsPorPanel: 640,
    potenciaKwp: 5.12,
    precioListaMxn: 84448,
    precioContadoMxn: 84448,
    descuentoContadoPct: 0,
    condicionesPago: 'Sujeto a evaluación técnica · IVA incluido',
    incluyeTramiteCFE: false, // No especificado en flyer
    incluyeMonitoreo: true,
    incluyeBaterias: false,
    bateriaKwh: 0,
    tiempoTramiteDias: 'Confirmar trámite CFE',
    produccionPrometidaBimKwh: 1200,
    destacadoBadge: 'Escalable 4 a 20 Paneles',
    badgeColor: 'blue',
    paquetesDisponibles: [
      { paneles: 4, kwp: 2.56, prodBimMin: 550, prodBimMax: 650, precioMxn: 42224 },
      { paneles: 6, kwp: 3.84, prodBimMin: 825, prodBimMax: 975, precioMxn: 63336 },
      { paneles: 8, kwp: 5.12, prodBimMin: 1100, prodBimMax: 1300, precioMxn: 84448 },
      { paneles: 10, kwp: 6.40, prodBimMin: 1375, prodBimMax: 1625, precioMxn: 105560 },
      { paneles: 12, kwp: 7.68, prodBimMin: 1650, prodBimMax: 1950, precioMxn: 126672 },
      { paneles: 16, kwp: 10.24, prodBimMin: 2200, prodBimMax: 2600, precioMxn: 168896 },
      { paneles: 20, kwp: 12.80, prodBimMin: 2750, prodBimMax: 3250, precioMxn: 211120 }
    ],
    notasAuditoria: [
      'Único proveedor con tabla transparente hasta 20 paneles (12.8 kWp) ideal para cubrir gran parte del edificio.',
      'Inversor Growatt muy reconocido en México con garantía por escrito.',
      'ALERTA: Precio estrictamente lineal ($10,556/panel, $16.49/Wp) sin descuento por volumen. Confirmar si incluye trámite ante CFE y viáticos desde Coatzacoalcos.'
    ],
    esOficialWhatsApp: true
  }
];

/**
 * Niveles de criticidad de equipos ante un fallo de energía (Apagón CFE)
 */
export const NIVELES_CRITICIDAD_INFO = {
  1: {
    id: 1,
    nombre: 'Nivel 1 · Supervivencia Crítica',
    descripcion: 'Refrigeración de alimentos, cajas TPV, terminales bancarias, internet, CCTV y luces básicas.',
    color: 'emerald',
    badge: 'Imprescindible en Apagón'
  },
  2: {
    id: 2,
    nombre: 'Nivel 2 · Operación Comercial Ligera (120V)',
    descripcion: 'Máquinas de coser servomotor, láser, ScanNCut, bordadora 1 cabeza, impresoras ligeras y snacks chicos.',
    color: 'amber',
    badge: 'Continuidad de Ventas'
  },
  3: {
    id: 3,
    nombre: 'Nivel 3 · Climas 220V y Maquinaria Pesada',
    descripcion: 'Minisplits 220V, Crepera 3kW, Cafetera Gaggia 220V, Xerox DocuColor, Bordadoras 4 cabezas y planchas grandes.',
    color: 'rose',
    badge: 'Demanda Alta (Requiere Gran Inversor)'
  }
};
