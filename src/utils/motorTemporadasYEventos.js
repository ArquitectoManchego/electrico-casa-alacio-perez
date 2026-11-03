/**
 * Motor de Temporadas, Calendario de Eventos en México, Efecto Quincenal y Publicidad
 * Diseñado específicamente para el Consorcio Gallegos González & Casa Alacio Pérez en zona universitaria.
 */

// =========================================================================
// 1. MESES DEL AÑO Y METADATOS ESTACIONALES
// =========================================================================
export const MESES_INFO = [
  { 
    id: 1, 
    nombre: 'Enero', 
    abreviatura: 'ENE',
    estacion: 'Invierno',
    vacacionesUniversitarias: true,
    diasVacacionesAprox: 15,
    descripcionClima: 'Fresco / Templado (Nortes en Veracruz)',
    factorClimaUso: 0.50
  },
  { 
    id: 2, 
    nombre: 'Febrero', 
    abreviatura: 'FEB',
    estacion: 'Invierno',
    vacacionesUniversitarias: false,
    diasVacacionesAprox: 0,
    descripcionClima: 'Templado / Caliente moderado',
    factorClimaUso: 0.60
  },
  { 
    id: 3, 
    nombre: 'Marzo', 
    abreviatura: 'MAR',
    estacion: 'Primavera',
    vacacionesUniversitarias: false,
    diasVacacionesAprox: 0,
    descripcionClima: 'Calor en aumento (requiere más clima)',
    factorClimaUso: 0.70
  },
  { 
    id: 4, 
    nombre: 'Abril', 
    abreviatura: 'ABR',
    estacion: 'Primavera',
    vacacionesUniversitarias: true, // Semana Santa / Pascua
    diasVacacionesAprox: 12,
    descripcionClima: 'Calor fuerte húmedo',
    factorClimaUso: 0.80
  },
  { 
    id: 5, 
    nombre: 'Mayo', 
    abreviatura: 'MAY',
    estacion: 'Primavera / Verano',
    vacacionesUniversitarias: false,
    diasVacacionesAprox: 0,
    descripcionClima: 'Pico de calor intenso / Canícula previa',
    factorClimaUso: 0.90
  },
  { 
    id: 6, 
    nombre: 'Junio', 
    abreviatura: 'JUN',
    estacion: 'Verano',
    vacacionesUniversitarias: false, // Fin de curso / Exámenes
    diasVacacionesAprox: 5,
    descripcionClima: 'Calor y lluvias tropicales',
    factorClimaUso: 0.85
  },
  { 
    id: 7, 
    nombre: 'Julio', 
    abreviatura: 'JUL',
    estacion: 'Verano',
    vacacionesUniversitarias: true, // Vacaciones de Verano SEP y Universidades
    diasVacacionesAprox: 25,
    descripcionClima: 'Calor canicular húmedo continuo',
    factorClimaUso: 0.95
  },
  { 
    id: 8, 
    nombre: 'Agosto', 
    abreviatura: 'AGO',
    estacion: 'Verano',
    vacacionesUniversitarias: false, // Regreso a Clases masivo
    diasVacacionesAprox: 5,
    descripcionClima: 'Calor fuerte con tormentas',
    factorClimaUso: 0.90
  },
  { 
    id: 9, 
    nombre: 'Septiembre', 
    abreviatura: 'SEP',
    estacion: 'Otoño',
    vacacionesUniversitarias: false,
    diasVacacionesAprox: 0,
    descripcionClima: 'Lluvias y temporada de huracanes / templado',
    factorClimaUso: 0.75
  },
  { 
    id: 10, 
    nombre: 'Octubre', 
    abreviatura: 'OCT',
    estacion: 'Otoño',
    vacacionesUniversitarias: false,
    diasVacacionesAprox: 0,
    descripcionClima: 'Clima agradable con nortes ocasionales',
    factorClimaUso: 0.65
  },
  { 
    id: 11, 
    nombre: 'Noviembre', 
    abreviatura: 'NOV',
    estacion: 'Otoño',
    vacacionesUniversitarias: false,
    diasVacacionesAprox: 0,
    descripcionClima: 'Fresco / Templado',
    factorClimaUso: 0.55
  },
  { 
    id: 12, 
    nombre: 'Diciembre', 
    abreviatura: 'DIC',
    estacion: 'Invierno',
    vacacionesUniversitarias: true, // Vacaciones navideñas desde mediados
    diasVacacionesAprox: 15,
    descripcionClima: 'Fresco agradable / Nortes',
    factorClimaUso: 0.50
  }
];

// =========================================================================
// 2. CATÁLOGO MAESTRO DE EVENTOS Y EFEMÉRIDES EN MÉXICO & POPULARES
// Lead Time Estratégico: La publicidad DEBE lanzarse 1 mes antes (mesLanzamiento)
// =========================================================================
export const CATALOGO_EVENTOS_MEXICO = [
  {
    id: 'super_bowl',
    nombre: 'Super Bowl LXI / Final de Temporada NFL',
    fechaTexto: 'Segundo domingo de Febrero',
    mesEvento: 2,
    mesLanzamientoPublicidad: 1, // Enero
    diasAnticipacion: 30,
    categoria: 'deportivo',
    colorBadge: 'emerald',
    icono: 'Trophy',
    productosEstrella: [
      'Playeras personalizadas de equipos finalistas (algodón y dry-fit)',
      'Tazas y tarros cerveceros grabados o sublimados',
      'Gorras bordadas temáticas',
      'Promociones de botanas, crepas saladas y frappés para reuniones'
    ],
    negociosBeneficiados: ['taller_publi_imperia', 'bordados_veracruz', 'hawaiian_paradise'],
    aumentoDemandaBasePct: 35,
    descripcionEstrategica: 'Lanzar publicidad a mediados de Enero con los clasificados a playoffs. Los grupos de amigos y negocios deportivos encargan playeras y vasos conmemorativos 3 semanas antes del partido.'
  },
  {
    id: 'san_valentin',
    nombre: 'Día del Amor y la Amistad / San Valentín',
    fechaTexto: '14 de Febrero',
    mesEvento: 2,
    mesLanzamientoPublicidad: 1, // Enero
    diasAnticipacion: 30,
    categoria: 'comercial',
    colorBadge: 'rose',
    icono: 'Heart',
    productosEstrella: [
      'Playeras dúo para parejas (diseños complementarios)',
      'Tazas mágicas y tazas con chocolates',
      'Termos metálicos grabados con nombres de parejas',
      'Crepas dulces decoradas, marquesitas y frappés en Hawaiian Paradise'
    ],
    negociosBeneficiados: ['taller_publi_imperia', 'bordados_veracruz', 'papeleria_imperiarte', 'hawaiian_paradise'],
    aumentoDemandaBasePct: 55,
    descripcionEstrategica: 'La pauta publicitaria se activa a mediados de Enero. Las parejas universitarias y de oficinas cotizan con anticipación sus regalos personalizados para evitar entregas tardías.'
  },
  {
    id: 'san_patricio',
    nombre: 'Día de San Patricio (St. Patrick\'s Day)',
    fechaTexto: '17 de Marzo',
    mesEvento: 3,
    mesLanzamientoPublicidad: 2, // Febrero
    diasAnticipacion: 30,
    categoria: 'popular',
    colorBadge: 'green',
    icono: 'Sparkles',
    productosEstrella: [
      'Playeras con temática verde e irlandesa',
      'Vasos cerveceros y tarros de cristal esmerilado',
      'Artículos para colegios bilingües, academias de idiomas y bares locales'
    ],
    negociosBeneficiados: ['taller_publi_imperia', 'bordados_veracruz'],
    aumentoDemandaBasePct: 25,
    descripcionEstrategica: 'Lanzar en Febrero para captar pedidos de escuelas de inglés de la zona conurbada y bares universitarios que organizan festivales temáticos.'
  },
  {
    id: 'dia_nino',
    nombre: 'Día del Niño y de la Niña',
    fechaTexto: '30 de Abril',
    mesEvento: 4,
    mesLanzamientoPublicidad: 3, // Marzo
    diasAnticipacion: 30,
    categoria: 'escolar',
    colorBadge: 'amber',
    icono: 'Smile',
    productosEstrella: [
      'Playeras infantiles con personajes de moda o nombres',
      'Tazas con dulces y golosinas para escuelas primarias y kinder',
      'Bolsitas de tela sublimadas para recuerdos de festival escolar',
      'Crepas infantiles y raspados de colores en Hawaiian Paradise'
    ],
    negociosBeneficiados: ['taller_publi_imperia', 'bordados_veracruz', 'papeleria_imperiarte', 'hawaiian_paradise'],
    aumentoDemandaBasePct: 40,
    descripcionEstrategica: 'Las mesas directivas de padres de familia y maestras organizan los festivales desde Marzo. Lanzar catálogo escolar infantil 1 mes antes asegura lotes de 30 a 100 piezas.'
  },
  {
    id: 'dia_madre',
    nombre: 'Día de las Madres en México',
    fechaTexto: '10 de Mayo',
    mesEvento: 5,
    mesLanzamientoPublicidad: 4, // Abril
    diasAnticipacion: 30,
    categoria: 'nacional',
    colorBadge: 'pink',
    icono: 'HeartHandshake',
    productosEstrella: [
      'Tazas personalizadas con fotos familiares y frases emotivas',
      'Mandiles bordados de cocina y filipinas para mamás chef',
      'Batas y filipinas médicas bordadas para mamás doctoras/enfermeras',
      'Playeras familiares conmemorativas "Súper Mamá"',
      'Termos y cilindros grabados en láser'
    ],
    negociosBeneficiados: ['imperia_uniformes', 'taller_costura', 'bordados_veracruz', 'taller_publi_imperia', 'hawaiian_paradise'],
    aumentoDemandaBasePct: 70,
    descripcionEstrategica: 'Uno de los picos comerciales más altos de México. La publicidad debe arrancar el 10 de Abril; empresas, clínicas y familias encargan regalos corporativos y personales.'
  },
  {
    id: 'dia_padre',
    nombre: 'Día del Padre',
    fechaTexto: 'Tercer domingo de Junio',
    mesEvento: 6,
    mesLanzamientoPublicidad: 5, // Mayo
    diasAnticipacion: 30,
    categoria: 'nacional',
    colorBadge: 'cyan',
    icono: 'Award',
    productosEstrella: [
      'Tarros de cerveza grabados con láser y tazas para papá',
      'Playeras tipo polo bordadas y playeras cuello redondo estampadas',
      'Gorras bordadas y mandiles parrilleros de mezclilla gruesa',
      'Termos tipo Yeti de 20oz/30oz grabados con su nombre'
    ],
    negociosBeneficiados: ['imperia_uniformes', 'taller_costura', 'bordados_veracruz', 'taller_publi_imperia'],
    aumentoDemandaBasePct: 50,
    descripcionEstrategica: 'Lanzar en Mayo inmediatamente después del Día de las Madres. Los productos de asador, playeras polo y tarros cerveceros tienen alta conversión.'
  },
  {
    id: 'regreso_clases',
    nombre: 'Regreso a Clases Ciclo Mayor (SEP & Universidades)',
    fechaTexto: 'Agosto (Todo el mes)',
    mesEvento: 8,
    mesLanzamientoPublicidad: 7, // Julio
    diasAnticipacion: 30,
    categoria: 'escolar',
    colorBadge: 'indigo',
    icono: 'GraduationCap',
    productosEstrella: [
      'Uniformes escolares completos (camisas gabardina, faldas, pantalones, playeras polo)',
      'Uniformes clínicos y batas de laboratorio para facultades de medicina, química y odontología',
      'Bordado de logotipos de escuelas, facultades y gafetes con nombre',
      'Materiales de papelería especializada: cartones, cartulinas, planos y copias (ImperiArte)'
    ],
    negociosBeneficiados: ['imperia_uniformes', 'taller_costura', 'bordados_veracruz', 'papeleria_imperiarte'],
    aumentoDemandaBasePct: 120, // PICO MÁXIMO DEL AÑO
    descripcionEstrategica: 'EL MAYOR PICO ANUAL DE INGRESOS. En Julio se lanza preventa de uniformes con apartado, toma de tallas en mostrador y pedidos de escuelas. La producción arranca en julio para entregar en agosto.'
  },
  {
    id: 'fiestas_patrias',
    nombre: 'Fiestas Patrias & Día de la Independencia de México',
    fechaTexto: '15 y 16 de Septiembre',
    mesEvento: 9,
    mesLanzamientoPublicidad: 8, // Agosto
    diasAnticipacion: 30,
    categoria: 'nacional',
    colorBadge: 'red',
    icono: 'Flame',
    productosEstrella: [
      'Playeras tricolores "Viva México" y motivos patrios',
      'Paliacates y moños patrios bordados',
      'Uniformes temáticos para personal de restaurantes, fondas y cafeterías',
      'Banderas, tazas y decoración festiva'
    ],
    negociosBeneficiados: ['imperia_uniformes', 'taller_costura', 'bordados_veracruz', 'taller_publi_imperia'],
    aumentoDemandaBasePct: 45,
    descripcionEstrategica: 'La publicidad debe arrancar en Agosto. Restaurantes, escuelas y oficinas gubernamentales preparan su ambientación y uniformes del 15 de Septiembre con semanas de anticipación.'
  },
  {
    id: 'formula_1',
    nombre: 'Fórmula 1 Gran Premio de la Ciudad de México',
    fechaTexto: 'Último fin de semana de Octubre',
    mesEvento: 10,
    mesLanzamientoPublicidad: 9, // Septiembre
    diasAnticipacion: 30,
    categoria: 'deportivo',
    colorBadge: 'red',
    icono: 'Zap',
    productosEstrella: [
      'Playeras polo y cuello redondo réplica de escuderías (Red Bull, Ferrari, Mercedes)',
      'Gorras bordadas tipo Racing con número de piloto',
      'Termos y llaveros acrílicos o metálicos grabados con láser',
      'Stickers de vinil reflectivo para autos y laptops'
    ],
    negociosBeneficiados: ['taller_publi_imperia', 'bordados_veracruz'],
    aumentoDemandaBasePct: 40,
    descripcionEstrategica: 'La afición a la F1 en México genera gran demanda de mercancía de escuderías. La publicidad lanzada en Septiembre permite captar fanáticos universitarios y clubes de autos.'
  },
  {
    id: 'halloween_muertos',
    nombre: 'Halloween & Tradicional Día de Muertos en México',
    fechaTexto: '31 de Octubre a 2 de Noviembre',
    mesEvento: 11,
    mesLanzamientoPublicidad: 10, // Octubre
    diasAnticipacion: 30,
    categoria: 'nacional',
    colorBadge: 'orange',
    icono: 'Ghost',
    productosEstrella: [
      'Playeras estampadas con catrinas, calaveritas literarias y diseños de terror',
      'Tazas conmemorativas de Día de Muertos',
      'Papel picado, cartulinas fluorescentes y fomi en Papelería ImperiArte para altares escolares',
      'Marquesitas con calabaza en tacha y frappés temáticos en Hawaiian Paradise'
    ],
    negociosBeneficiados: ['taller_publi_imperia', 'bordados_veracruz', 'papeleria_imperiarte', 'hawaiian_paradise'],
    aumentoDemandaBasePct: 50,
    descripcionEstrategica: 'Las escuelas y facultades montan altares de muertos obligatorios. La publicidad en Octubre surte de materiales a papelería y artículos promocionales a estudiantes.'
  },
  {
    id: 'buen_fin',
    nombre: 'El Buen Fin en México',
    fechaTexto: 'Tercer fin de semana de Noviembre',
    mesEvento: 11,
    mesLanzamientoPublicidad: 10, // Octubre
    diasAnticipacion: 30,
    categoria: 'comercial',
    colorBadge: 'red',
    icono: 'Tags',
    productosEstrella: [
      'Paquetes mayoreo de uniformes clínicos y de chef con descuento por volumen',
      'Lotes promocionales de tazas y playeras para empresas (anticipo de fin de año)',
      'Descuentos en copias y ploteo de planos en papelería'
    ],
    negociosBeneficiados: ['imperia_uniformes', 'taller_costura', 'bordados_veracruz', 'taller_publi_imperia', 'papeleria_imperiarte'],
    aumentoDemandaBasePct: 60,
    descripcionEstrategica: 'Las empresas y consultorios anticipan su compra de uniformes corporativos aprovechando las promociones. Campaña en redes debe salir a mediados de Octubre.'
  },
  {
    id: 'navidad_ano_nuevo',
    nombre: 'Navidad, Posadas y Año Nuevo (Dotaciones Corporativas)',
    fechaTexto: 'Diciembre (Todo el mes)',
    mesEvento: 12,
    mesLanzamientoPublicidad: 11, // Noviembre
    diasAnticipacion: 30,
    categoria: 'nacional',
    colorBadge: 'emerald',
    icono: 'Gift',
    productosEstrella: [
      'Uniformes corporativos de fin de año financiados con aguinaldos y presupuestos fiscales',
      'Kits de regalo empresarial: tazas navideñas, termos, agendas y bolígrafos grabados',
      'Playeras navideñas familiares a juego (ugly sweaters y serigrafía festiva)',
      'Consumo festivo en Hawaiian Paradise (crepas para posadas escolares)'
    ],
    negociosBeneficiados: ['imperia_uniformes', 'taller_costura', 'bordados_veracruz', 'taller_publi_imperia', 'hawaiian_paradise'],
    aumentoDemandaBasePct: 85,
    descripcionEstrategica: 'Empresas y dependencias de gobierno agotan presupuesto anual en dotación de uniformes y regalos de fin de año. Se lanza en Noviembre para entregar antes del 15 de Diciembre.'
  },
  {
    id: 'mundial_futbol',
    nombre: 'Mundial de Fútbol FIFA / Torneos Internacionales',
    fechaTexto: 'Temporada de Torneo',
    mesEvento: 6, // Ejemplo representativo
    mesLanzamientoPublicidad: 5,
    diasAnticipacion: 30,
    categoria: 'deportivo',
    colorBadge: 'emerald',
    icono: 'Trophy',
    productosEstrella: [
      'Playeras réplica de la Selección Mexicana y países participantes',
      'Gorras, banderines y cilindros térmicos',
      'Transmisiones y promociones de bebidas en Hawaiian Paradise'
    ],
    negociosBeneficiados: ['taller_publi_imperia', 'bordados_veracruz', 'hawaiian_paradise'],
    aumentoDemandaBasePct: 65,
    descripcionEstrategica: 'El Mundial de fútbol paraliza y activa masivamente el consumo de playeras tricolores en oficinas y escuelas. Requiere campaña previa para maquilar miles de playeras en taller.'
  }
];

// =========================================================================
// 3. CURVAS ESTACIONALES Y PESOS MENSUALES POR NEGOCIO (12 MESES)
// Considera el efecto de zona universitaria (caída en vacaciones escolares)
// =========================================================================
export const PERFILES_ESTACIONALES_NEGOCIOS = {
  // Imperia Uniformes: Pico monumental en Agosto (Regreso a clases), segundo pico Enero/Febrero y Diciembre
  imperia_uniformes: {
    nombre: 'Imperia Uniformes',
    sensibilidadUniversitaria: 'alta', // Afecta batas, uniformes clínicos
    sensibilidadEscolar: 'extrema',    // Agosto es el pico del año
    curvaMeses: {
      1: { factorBase: 1.15, etiqueta: 'Semestre Primavera', vacaciones: true, pautaSugerida: false },
      2: { factorBase: 1.25, etiqueta: 'Inscripciones y Batas', vacaciones: false, pautaSugerida: false },
      3: { factorBase: 1.00, etiqueta: 'Venta Regular', vacaciones: false, pautaSugerida: false },
      4: { factorBase: 0.85, etiqueta: 'Semana Santa (Baja)', vacaciones: true, pautaSugerida: true },
      5: { factorBase: 1.10, etiqueta: 'Día de las Madres', vacaciones: false, pautaSugerida: false },
      6: { factorBase: 0.90, etiqueta: 'Fin de Cursos', vacaciones: false, pautaSugerida: false },
      7: { factorBase: 1.30, etiqueta: 'Preventa Escolar', vacaciones: true, pautaSugerida: true },
      8: { factorBase: 2.20, etiqueta: 'PICO REGRESO A CLASES', vacaciones: false, pautaSugerida: false },
      9: { factorBase: 1.35, etiqueta: 'Surtido de Tallas', vacaciones: false, pautaSugerida: false },
      10: { factorBase: 1.05, etiqueta: 'Otoño Regular', vacaciones: false, pautaSugerida: false },
      11: { factorBase: 1.20, etiqueta: 'Buen Fin / Dotaciones', vacaciones: false, pautaSugerida: false },
      12: { factorBase: 1.40, etiqueta: 'Cierre Fiscal / Dotaciones', vacaciones: true, pautaSugerida: false }
    }
  },

  // Papelería ImperiArte: Muy sensible a calendario universitario (planos, cartones de arquitectura, copias)
  papeleria_imperiarte: {
    nombre: 'Papelería ImperiArte',
    sensibilidadUniversitaria: 'extrema',
    sensibilidadEscolar: 'muy_alta',
    curvaMeses: {
      1: { factorBase: 0.70, etiqueta: 'Receso Universitario', vacaciones: true, pautaSugerida: true },
      2: { factorBase: 1.20, etiqueta: 'Inicio Semestre', vacaciones: false, pautaSugerida: false },
      3: { factorBase: 1.15, etiqueta: 'Entregas de Proyectos', vacaciones: false, pautaSugerida: false },
      4: { factorBase: 0.80, etiqueta: 'Semana Santa (Baja)', vacaciones: true, pautaSugerida: true },
      5: { factorBase: 1.25, etiqueta: 'Entregas Finales Arq/Diseño', vacaciones: false, pautaSugerida: false },
      6: { factorBase: 0.95, etiqueta: 'Cierre de Evaluaciones', vacaciones: false, pautaSugerida: false },
      7: { factorBase: 0.60, etiqueta: 'Vacaciones de Verano (-40%)', vacaciones: true, pautaSugerida: true },
      8: { factorBase: 1.80, etiqueta: 'Pico Regreso a Clases', vacaciones: false, pautaSugerida: false },
      9: { factorBase: 1.30, etiqueta: 'Ciclo Escolar Activo', vacaciones: false, pautaSugerida: false },
      10: { factorBase: 1.10, etiqueta: 'Proyectos de Mitad de Curso', vacaciones: false, pautaSugerida: false },
      11: { factorBase: 1.15, etiqueta: 'Entregas Previas a Cierre', vacaciones: false, pautaSugerida: false },
      12: { factorBase: 0.75, etiqueta: 'Cierre y Vacaciones Invierno', vacaciones: true, pautaSugerida: true }
    }
  },

  // Hawaiian Paradise: Cafetería de paso y estudiantes; sufre en vacaciones pero sube en días festivos
  hawaiian_paradise: {
    nombre: 'Hawaiian Paradise',
    sensibilidadUniversitaria: 'muy_alta',
    sensibilidadEscolar: 'media',
    curvaMeses: {
      1: { factorBase: 0.75, etiqueta: 'Receso Estudiantil', vacaciones: true, pautaSugerida: true },
      2: { factorBase: 1.25, etiqueta: 'San Valentín / Clases', vacaciones: false, pautaSugerida: false },
      3: { factorBase: 1.10, etiqueta: 'Temporada Regular', vacaciones: false, pautaSugerida: false },
      4: { factorBase: 0.80, etiqueta: 'Semana Santa (-20%)', vacaciones: true, pautaSugerida: true },
      5: { factorBase: 1.30, etiqueta: 'Día Madres / Calor Fuerte', vacaciones: false, pautaSugerida: false },
      6: { factorBase: 1.05, etiqueta: 'Fin de Cursos', vacaciones: false, pautaSugerida: false },
      7: { factorBase: 0.65, etiqueta: 'Verano Escolar Vacío', vacaciones: true, pautaSugerida: true },
      8: { factorBase: 1.35, etiqueta: 'Regreso Estudiantil', vacaciones: false, pautaSugerida: false },
      9: { factorBase: 1.10, etiqueta: 'Fiestas Patrias', vacaciones: false, pautaSugerida: false },
      10: { factorBase: 1.05, etiqueta: 'Temporada Otoño', vacaciones: false, pautaSugerida: false },
      11: { factorBase: 1.10, etiqueta: 'Día de Muertos / Buen Fin', vacaciones: false, pautaSugerida: false },
      12: { factorBase: 1.20, etiqueta: 'Posadas y Reuniones', vacaciones: true, pautaSugerida: false }
    }
  },

  // Bordados Veracruz: Se mueve 1 mes antes de los eventos (maquila y pedidos corporativos/escolares)
  bordados_veracruz: {
    nombre: 'Bordados Veracruz',
    sensibilidadUniversitaria: 'media',
    sensibilidadEscolar: 'muy_alta',
    curvaMeses: {
      1: { factorBase: 1.10, etiqueta: 'Bordado Campaña San Valentín', vacaciones: true, pautaSugerida: false },
      2: { factorBase: 1.05, etiqueta: 'Escolares de Primavera', vacaciones: false, pautaSugerida: false },
      3: { factorBase: 1.10, etiqueta: 'Bordado Campaña Día Niño', vacaciones: false, pautaSugerida: false },
      4: { factorBase: 1.25, etiqueta: 'Bordado Campaña Día Madre', vacaciones: true, pautaSugerida: false },
      5: { factorBase: 1.20, etiqueta: 'Bordado Campaña Día Padre', vacaciones: false, pautaSugerida: false },
      6: { factorBase: 1.15, etiqueta: 'Graduaciones y Estolas', vacaciones: false, pautaSugerida: false },
      7: { factorBase: 1.70, etiqueta: 'PRODUCCIÓN PICO ESCOLAR', vacaciones: true, pautaSugerida: false },
      8: { factorBase: 1.80, etiqueta: 'Pico Escudo Escolar', vacaciones: false, pautaSugerida: false },
      9: { factorBase: 1.20, etiqueta: 'Fiestas Patrias Maquila', vacaciones: false, pautaSugerida: false },
      10: { factorBase: 1.15, etiqueta: 'Campaña F1 y Halloween', vacaciones: false, pautaSugerida: false },
      11: { factorBase: 1.40, etiqueta: 'Bordado Aguinaldos / Navideño', vacaciones: false, pautaSugerida: false },
      12: { factorBase: 1.25, etiqueta: 'Cierre de Maquilas', vacaciones: true, pautaSugerida: false }
    }
  },

  // Taller de Costura: Proveedor de Imperia y maquila escolar/clínica
  taller_costura: {
    nombre: 'Taller de Costura',
    sensibilidadUniversitaria: 'media',
    sensibilidadEscolar: 'extrema',
    curvaMeses: {
      1: { factorBase: 1.10, etiqueta: 'Maquila Semestre 1', vacaciones: true, pautaSugerida: false },
      2: { factorBase: 1.05, etiqueta: 'Confección Batas', vacaciones: false, pautaSugerida: false },
      3: { factorBase: 1.00, etiqueta: 'Confección Regular', vacaciones: false, pautaSugerida: false },
      4: { factorBase: 0.90, etiqueta: 'Semana Santa', vacaciones: true, pautaSugerida: false },
      5: { factorBase: 1.15, etiqueta: 'Mandiles y Filipinas Día Madre', vacaciones: false, pautaSugerida: false },
      6: { factorBase: 1.20, etiqueta: 'Corte Lotes Escolares', vacaciones: false, pautaSugerida: false },
      7: { factorBase: 1.90, etiqueta: 'PICO MAQUILA ESCOLAR AGOSTO', vacaciones: true, pautaSugerida: false },
      8: { factorBase: 1.70, etiqueta: 'Surtido y Ajustes', vacaciones: false, pautaSugerida: false },
      9: { factorBase: 1.15, etiqueta: 'Costura Fiestas Patrias', vacaciones: false, pautaSugerida: false },
      10: { factorBase: 1.05, etiqueta: 'Producción Regular', vacaciones: false, pautaSugerida: false },
      11: { factorBase: 1.35, etiqueta: 'Lotes Corporativos Navidad', vacaciones: false, pautaSugerida: false },
      12: { factorBase: 1.10, etiqueta: 'Cierre Anual de Taller', vacaciones: true, pautaSugerida: false }
    }
  },

  // Taller Publi-Imperia: Sublimación, tazas, vinil, DTF, grabado láser; muy atado al calendario de efemérides
  taller_publi_imperia: {
    nombre: 'Taller Publi-Imperia',
    sensibilidadUniversitaria: 'alta',
    sensibilidadEscolar: 'muy_alta',
    curvaMeses: {
      1: { factorBase: 1.35, etiqueta: 'PRODUCCIÓN SAN VALENTÍN & NFL', vacaciones: true, pautaSugerida: false },
      2: { factorBase: 1.30, etiqueta: 'Entrega San Valentín & F1 Pre', vacaciones: false, pautaSugerida: false },
      3: { factorBase: 1.15, etiqueta: 'Producción Día del Niño', vacaciones: false, pautaSugerida: false },
      4: { factorBase: 1.50, etiqueta: 'PICO PRODUCCIÓN DÍA DE LA MADRE', vacaciones: true, pautaSugerida: false },
      5: { factorBase: 1.45, etiqueta: 'PICO PRODUCCIÓN DÍA DEL PADRE', vacaciones: false, pautaSugerida: false },
      6: { factorBase: 1.20, etiqueta: 'Tazas y Playeras Graduación', vacaciones: false, pautaSugerida: false },
      7: { factorBase: 1.10, etiqueta: 'Producción Fiestas Patrias', vacaciones: true, pautaSugerida: true },
      8: { factorBase: 1.25, etiqueta: 'Playeras Escolares & F1 GP', vacaciones: false, pautaSugerida: false },
      9: { factorBase: 1.30, etiqueta: 'Producción Halloween / F1', vacaciones: false, pautaSugerida: false },
      10: { factorBase: 1.40, etiqueta: 'PICO F1 GP & DÍA DE MUERTOS', vacaciones: false, pautaSugerida: false },
      11: { factorBase: 1.70, etiqueta: 'PICO REGALOS NAVIDEÑOS & BUEN FIN', vacaciones: false, pautaSugerida: false },
      12: { factorBase: 1.50, etiqueta: 'Entrega Posadas y Termos Fin Año', vacaciones: true, pautaSugerida: false }
    }
  },

  // Oficinas Consorcio: Estable y administrativo todo el año
  oficinas_consorcio: {
    nombre: 'Oficinas Consorcio',
    sensibilidadUniversitaria: 'nula',
    sensibilidadEscolar: 'nula',
    curvaMeses: {
      1: { factorBase: 1.00, etiqueta: 'Inicio Fiscal', vacaciones: false, pautaSugerida: false },
      2: { factorBase: 1.00, etiqueta: 'Cierre Bimestral', vacaciones: false, pautaSugerida: false },
      3: { factorBase: 1.05, etiqueta: 'Auditoría', vacaciones: false, pautaSugerida: false },
      4: { factorBase: 1.00, etiqueta: 'Declaración Anual', vacaciones: false, pautaSugerida: false },
      5: { factorBase: 1.00, etiqueta: 'Operación Regular', vacaciones: false, pautaSugerida: false },
      6: { factorBase: 1.00, etiqueta: 'Operación Regular', vacaciones: false, pautaSugerida: false },
      7: { factorBase: 0.95, etiqueta: 'Verano Administrativo', vacaciones: false, pautaSugerida: false },
      8: { factorBase: 1.05, etiqueta: 'Supervisión Escolar', vacaciones: false, pautaSugerida: false },
      9: { factorBase: 1.00, etiqueta: 'Operación Regular', vacaciones: false, pautaSugerida: false },
      10: { factorBase: 1.00, etiqueta: 'Planeación Buen Fin', vacaciones: false, pautaSugerida: false },
      11: { factorBase: 1.10, etiqueta: 'Cierre de Contratos', vacaciones: false, pautaSugerida: false },
      12: { factorBase: 1.10, etiqueta: 'Cierre de Ejercicio y Nóminas', vacaciones: false, pautaSugerida: false }
    }
  }
};

// =========================================================================
// 4. FUNCIONES DE CÁLCULO ESTACIONAL, EFECTO QUINCENAL Y PUBLICIDAD
// =========================================================================

/**
 * Obtiene los eventos que deben PUBLICITARSE en el mes actual (Lead Time 1 mes antes)
 */
export function obtenerCampanasParaLanzarEnMes(mesActual) {
  const m = parseInt(mesActual) || 1;
  return CATALOGO_EVENTOS_MEXICO.filter(ev => ev.mesLanzamientoPublicidad === m);
}

/**
 * Obtiene los eventos que se CELEBRAN en el mes actual
 */
export function obtenerEventosCelebradosEnMes(mesActual) {
  const m = parseInt(mesActual) || 1;
  return CATALOGO_EVENTOS_MEXICO.filter(ev => ev.mesEvento === m);
}

/**
 * Calcula el multiplicador de demanda estacional compuesto para un negocio en un mes específico
 */
export function calcularMultiplicadorEstacional({
  negocioId,
  mes = 8, // 1-12
  esQuincena = false,
  publicidadContraciclica = true,
  eventosActivos = [] // Array de IDs de eventos cuyas campañas están encendidas
}) {
  const perfil = PERFILES_ESTACIONALES_NEGOCIOS[negocioId] || PERFILES_ESTACIONALES_NEGOCIOS.imperia_uniformes;
  const mesInfo = MESES_INFO.find(m => m.id === mes) || MESES_INFO[7];
  const configMes = perfil.curvaMeses[mes] || { factorBase: 1.0, etiqueta: 'Regular', vacaciones: false };

  let factor = configMes.factorBase;

  // 1. Efecto Vacaciones Universitarias
  // Si el mes tiene receso y el negocio es sensible a universitarios
  if (configMes.vacaciones && (perfil.sensibilidadUniversitaria === 'extrema' || perfil.sensibilidadUniversitaria === 'muy_alta' || perfil.sensibilidadUniversitaria === 'alta')) {
    // Si no se activó la publicidad contracíclica, el negocio sufre la caída natural
    if (!publicidadContraciclica) {
      factor *= 0.65; // Caída de -35% en afluencia por falta de universitarios
    } else {
      // Con publicidad contracíclica (Meta Ads / Volanteo / Empresas externas), se compensa la afluencia
      factor *= 1.05; // Recupera el tráfico natural y suma clientes externos (+5% neto)
    }
  }

  // 2. Efecto Quincenal (días 15 y 30 con subida de ventas de quincena en México)
  let incrementoQuincenaPct = 0;
  if (esQuincena) {
    if (negocioId === 'imperia_uniformes' || negocioId === 'hawaiian_paradise' || negocioId === 'papeleria_imperiarte') {
      incrementoQuincenaPct = 35; // +35% en comercios de mostrador
      factor *= 1.35;
    } else {
      incrementoQuincenaPct = 20; // +20% en talleres
      factor *= 1.20;
    }
  }

  // 3. Impacto de Campañas Publicitarias Activas de Eventos (Lead Time 1 mes antes)
  // Las campañas activadas aumentan los pedidos de artículos promocionales (playeras, tazas, uniformes)
  let impactoEventosPct = 0;
  if (eventosActivos && eventosActivos.length > 0) {
    eventosActivos.forEach(evId => {
      const ev = CATALOGO_EVENTOS_MEXICO.find(e => e.id === evId);
      if (ev && ev.negociosBeneficiados.includes(negocioId)) {
        // En el mes de lanzamiento de publicidad, el taller/tienda recibe la producción anticipada
        const aporte = (ev.aumentoDemandaBasePct || 30) * 0.40; // 40% del empuje total ocurre en el mes de preventa
        impactoEventosPct += aporte;
        factor *= (1 + (aporte / 100));
      }
    });
  }

  // Mapeo del factor total resultante a uno de los escenarios de la app
  let escenarioEquivalente = 'medio';
  if (factor < 0.80) escenarioEquivalente = 'bajo';
  else if (factor >= 0.80 && factor < 1.05) escenarioEquivalente = 'tablas';
  else if (factor >= 1.05 && factor < 1.35) escenarioEquivalente = 'medio';
  else if (factor >= 1.35 && factor < 1.75) escenarioEquivalente = 'alto';
  else escenarioEquivalente = 'muy_alto';

  return {
    negocioId,
    mes,
    mesNombre: mesInfo.nombre,
    factorTotal: Math.round(factor * 100) / 100,
    factorBaseMes: configMes.factorBase,
    etiquetaMes: configMes.etiqueta,
    esVacaciones: configMes.vacaciones,
    factorClimaUso: mesInfo.factorClimaUso,
    esQuincena,
    incrementoQuincenaPct,
    publicidadContraciclica,
    impactoEventosPct: Math.round(impactoEventosPct),
    escenarioEquivalente,
    campanasLanzadasMes: obtenerCampanasParaLanzarEnMes(mes),
    eventosCelebradosMes: obtenerEventosCelebradosEnMes(mes)
  };
}

/**
 * Genera la curva de los 12 meses proyectados para un negocio con kWh y ventas estimadas
 */
export function generarCurvaAnualNegocio(negocioId, escenarioBase = 'medio') {
  const resultadoMeses = [];

  for (let m = 1; m <= 12; m++) {
    const ajuste = calcularMultiplicadorEstacional({
      negocioId,
      mes: m,
      esQuincena: false,
      publicidadContraciclica: true,
      eventosActivos: []
    });

    resultadoMeses.push({
      mes: m,
      nombre: MESES_INFO[m - 1].nombre,
      abreviatura: MESES_INFO[m - 1].abreviatura,
      factor: ajuste.factorTotal,
      etiqueta: ajuste.etiquetaMes,
      esVacaciones: ajuste.esVacaciones,
      escenarioSugerido: ajuste.escenarioEquivalente,
      campanasParaLanzar: ajuste.campanasLanzadasMes.map(c => c.nombre),
      eventosCelebrados: ajuste.eventosCelebradosMes.map(e => e.nombre)
    });
  }

  return resultadoMeses;
}
