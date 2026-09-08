/**
 * Catálogo Maestro de Equipos: Inmueble Multi-Negocio Consorcio Gallegos González & Casa Alacio Pérez (NOM-001-SEDE).
 * Especificaciones de CapEx (Precio), OpEx (Mantenimiento), Vida Útil, Factor de Potencia (FP) y Criterios Normativos.
 */
export const CATALOGO_RESIDENCIAL = [
  // --- ÁREA: BORDADOS VERACRUZ ---
  {
    tipo: 'Bordadora Industrial 4 Cabezas (110V - Años 90)',
    watts: 1500,
    fp: 0.82,
    tipoCarga: 'monofasica',
    precio: 75000,
    mantenimiento: 4500,
    vidaUtil: 15,
    criteriosDurabilidad: 'Maquinaria electromecánica pesada con devanados de inducción de alta inercia. Sensible a variaciones de voltaje; requiere circuito dedicado exclusivo.',
    criteriosMantenimiento: 'Lubricación semanal de garfios y barras de agujas, tensión de bandas de motor principal y soplado de pelusa en contactores.'
  },
  {
    tipo: 'Bordadora Industrial 4 Cabezas (220V - Años 90)',
    watts: 1800,
    fp: 0.85,
    tipoCarga: 'bifasica',
    precio: 85000,
    mantenimiento: 5000,
    vidaUtil: 15,
    criteriosDurabilidad: 'Alimentación a 220V bifásica para mayor estabilidad de torque. Menor corriente de trabajo por fase reduce el calentamiento en jornadas largas.',
    criteriosMantenimiento: 'Revisión semestral de escobillas/rodamientos del motor, reapriete de clemas de 220V y calibración de microswitches de salto de hilo.'
  },
  {
    tipo: 'Bordadora Casera Brother (1 Hilo)',
    watts: 75,
    fp: 0.80,
    tipoCarga: 'monofasica',
    precio: 14000,
    mantenimiento: 800,
    vidaUtil: 7,
    criteriosDurabilidad: 'Motor fraccionario compacto para bordado de nombres y detalles menores. Carga ligera para contactos de servicio general.',
    criteriosMantenimiento: 'Limpieza de placa de aguja, lubricación con aceite blanco de máquina y cambio periódico de agujas.'
  },

  // --- ÁREA: TALLER DE COSTURA (IMPERIA UNIFORMES) ---
  {
    tipo: 'Máquina de Coser Recta Industrial',
    watts: 550,
    fp: 0.80,
    tipoCarga: 'monofasica',
    precio: 16000,
    mantenimiento: 1200,
    vidaUtil: 12,
    criteriosDurabilidad: 'Servomotor ahorrador silencioso de alta aceleración con parada electrónica de aguja. Tolera ciclos de trabajo industrial continuo.',
    criteriosMantenimiento: 'Cambio semestral de aceite en cárter sumergido, limpieza de transportadores de tela y tensión de banda de transmisión.'
  },
  {
    tipo: 'Máquina Overlock Industrial (5 Hilos)',
    watts: 550,
    fp: 0.80,
    tipoCarga: 'monofasica',
    precio: 18500,
    mantenimiento: 1400,
    vidaUtil: 12,
    criteriosDurabilidad: 'Operación a 5,000-6,000 RPM para sobrehilado y cadeneta simultánea. Genera vibración continua y pelusa textil en ductos.',
    criteriosMantenimiento: 'Afilado y ajuste de cuchillas recortadoras de tela, soplado diario de caja de motor y monitoreo de nivel de lubricación forzada.'
  },
  {
    tipo: 'Máquina Collaretera Industrial (5 Hilos)',
    watts: 550,
    fp: 0.80,
    tipoCarga: 'monofasica',
    precio: 21000,
    mantenimiento: 1500,
    vidaUtil: 12,
    criteriosDurabilidad: 'Coser pespuntes y dobladillos en prendas de punto y cuellos. Servomotor directo integrado en cabezal con frenado magnético.',
    criteriosMantenimiento: 'Calibración de áncoras superiores e inferiores, soplado de microinterruptor de pedal y engrase de levas de arrastre.'
  },
  {
    tipo: 'Cortadora de Tela Industrial de Disco',
    watts: 300,
    fp: 0.75,
    tipoCarga: 'monofasica',
    precio: 4800,
    mantenimiento: 600,
    vidaUtil: 8,
    criteriosDurabilidad: 'Herramienta manual rotativa de corte vertical para tendidos de tela. Motor universal de alta velocidad con piedra de afilado incorporada.',
    criteriosMantenimiento: 'Reemplazo de carbones del motor, afilado de cuchilla octagonal y limpieza de lubricante en engranajes cónicos.'
  },
  {
    tipo: 'Plancha de Vapor Industrial con Caldera',
    watts: 1600,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 11000,
    mantenimiento: 1000,
    vidaUtil: 8,
    criteriosDurabilidad: 'Resistencia calefactora de caldera de vapor presurizado y suela de plancha pesada. Carga resistiva continua que requiere circuito exclusivo de 20A.',
    criteriosMantenimiento: 'Purga semanal de sarro mineral de la caldera, revisión de empaque de teflón de tapón de seguridad y comprobación de electroválvula.'
  },

  // --- ÁREA: TALLER DE PROMOCIONALES (PUBLI-IMPERIA) ---
  {
    tipo: 'Plancha de Sublimación Plana (30x30 cm - 1000W)',
    watts: 1000,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 7500,
    mantenimiento: 500,
    vidaUtil: 6,
    criteriosDurabilidad: 'Resistencia plana fundida en aluminio con control digital de temperatura a 200°C. Ciclos de planchado de 30 a 60 segundos.',
    criteriosMantenimiento: 'Calibración de termopar y relay de estado sólido (SSR), limpieza de teflón protector y apriete de manivela de presión mecánica.'
  },
  {
    tipo: 'Plancha Manual de Sublimación (10 cm)',
    watts: 400,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 2200,
    mantenimiento: 250,
    vidaUtil: 5,
    criteriosDurabilidad: 'Prensa térmica pequeña para gorras, mangas o etiquetas. Carga resistiva ligera portátil.',
    criteriosMantenimiento: 'Inspección del cable térmico con funda de silicona y prueba del sensor de calor.'
  },
  {
    tipo: 'Cortadora de Vinil Brother ScanNCut',
    watts: 50,
    fp: 0.90,
    tipoCarga: 'monofasica',
    precio: 12500,
    mantenimiento: 400,
    vidaUtil: 6,
    criteriosDurabilidad: 'Plotter digital con escáner óptico integrado para corte de vinil textil y papel. Carga electrónica protegida.',
    criteriosMantenimiento: 'Cambio de navaja de carburo de tungsteno, limpieza de rodillos de arrastre y calibración óptica.'
  },
  {
    tipo: 'Grabadora Láser de Diodo (20W Óptico)',
    watts: 75,
    fp: 0.85,
    tipoCarga: 'monofasica',
    precio: 18000,
    mantenimiento: 800,
    vidaUtil: 5,
    criteriosDurabilidad: 'Módulo láser de diodo azul para grabado en madera, acrílico y corte textil. Fuente conmutada regulada.',
    criteriosMantenimiento: 'Limpieza de lente óptica con alcohol isopropílico, tensión de bandas dentadas GT2 y revisión de bomba de asistencia de aire.'
  },
  {
    tipo: 'Impresora de Sublimación Epson L310',
    watts: 25,
    fp: 0.85,
    tipoCarga: 'monofasica',
    precio: 6500,
    mantenimiento: 500,
    vidaUtil: 5,
    criteriosDurabilidad: 'Impresora de inyección de tinta continua adaptada a tinta de sublimación para papel transfer.',
    criteriosMantenimiento: 'Test de inyectores y purga de cabezal MicroPiezo para evitar secado de tinta polimérica.'
  },
  {
    tipo: 'Pistola de Calor Manual (Decapador)',
    watts: 1500,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 1400,
    mantenimiento: 200,
    vidaUtil: 4,
    criteriosDurabilidad: 'Flujo de aire caliente a 500°C para moldeado y curado de vinil textil. Carga resistiva con motor soplador.',
    criteriosMantenimiento: 'Enfriamiento del serpentín antes de apagar e inspección de toberas metálicas de salida.'
  },
  {
    tipo: 'Panel de Revelado de Serigrafía (8 Tubos)',
    watts: 240,
    fp: 0.90,
    tipoCarga: 'monofasica',
    precio: 8000,
    mantenimiento: 400,
    vidaUtil: 8,
    criteriosDurabilidad: 'Mesa insoladora con 8 lámparas fluorescentes/UV y vidrio templado para fotograbado de mallas serigráficas.',
    criteriosMantenimiento: 'Reemplazo de balastros electrónicos, limpieza de cristal y verificación de temporizador analógico/digital.'
  },
  {
    tipo: 'PC Diseño Gráfico + Monitor de Alta Gama',
    watts: 450,
    fp: 0.90,
    tipoCarga: 'monofasica',
    precio: 26000,
    mantenimiento: 600,
    vidaUtil: 6,
    criteriosDurabilidad: 'Estación de trabajo equipada con GPU dedicada para Illustrator, CorelDraw y AutoCAD. Carga informática crítica.',
    criteriosMantenimiento: 'Soplado semestral de disipadores de calor y conexión obligatoria a regulador o No-break (UPS).'
  },

  // --- ÁREA: IMPERIA UNIFORMES (SHOWROOM & VENTAS) ---
  {
    tipo: 'Sistema CCTV 16 Cámaras + Grabadora DVR/NVR',
    watts: 150,
    fp: 0.85,
    tipoCarga: 'monofasica',
    precio: 19000,
    mantenimiento: 800,
    vidaUtil: 6,
    criteriosDurabilidad: 'Vigilancia 24/7 de todo el consorcio comercial y accesos. Fuente centralizada de poder para 16 canales.',
    criteriosMantenimiento: 'Comprobación de sectores de disco duro vigilancia (WD Purple), limpieza de domos ópticos y respaldo de UPS.'
  },
  {
    tipo: 'Computadora de Mostrador y Pantalla (POS)',
    watts: 300,
    fp: 0.90,
    tipoCarga: 'monofasica',
    precio: 14000,
    mantenimiento: 400,
    vidaUtil: 6,
    criteriosDurabilidad: 'Control de inventario, facturación electrónica y atención al cliente en mostrador.',
    criteriosMantenimiento: 'Actualización de antivirus, limpieza de polvo en ventiladores y respaldo en la nube.'
  },
  {
    tipo: 'Terminal Bancaria Mercado Pago',
    watts: 15,
    fp: 0.90,
    tipoCarga: 'monofasica',
    precio: 2500,
    mantenimiento: 100,
    vidaUtil: 4,
    criteriosDurabilidad: 'Dispositivo Smart POS portátil con conexión WiFi/4G para cobro con tarjeta.',
    criteriosMantenimiento: 'Cuidado de batería recargable de litio y limpieza de lector de chip magnético.'
  },

  // --- ÁREA: PAPELERÍA IMPERIARTE ---
  {
    tipo: 'Computadora AIO TPV (All-in-One)',
    watts: 180,
    fp: 0.90,
    tipoCarga: 'monofasica',
    precio: 15000,
    mantenimiento: 350,
    vidaUtil: 6,
    criteriosDurabilidad: 'Equipo compacto todo en uno para cobro de papelería, copias e impresiones.',
    criteriosMantenimiento: 'Limpieza de pantalla táctil y puertos USB para lectores de código de barras.'
  },

  // --- ÁREA: HAWAIIAN PARADISE UNIVERSIDADES ---
  {
    tipo: 'Licuadora Ninja Profesional (1200W)',
    watts: 1200,
    fp: 0.85,
    tipoCarga: 'monofasica',
    precio: 4500,
    mantenimiento: 500,
    vidaUtil: 5,
    criteriosDurabilidad: 'Triturado de pulpas congeladas y frappés a alta velocidad. Carga de motor con alto torque.',
    criteriosMantenimiento: 'Afilado e inspección de sellos de torre de cuchillas y limpieza de base motriz.'
  },
  {
    tipo: 'Máquina de Raspados Hawaiian Paradise',
    watts: 600,
    fp: 0.80,
    tipoCarga: 'monofasica',
    precio: 12000,
    mantenimiento: 900,
    vidaUtil: 7,
    criteriosDurabilidad: 'Cabezal de fundición de aluminio para raspado fino de hielo de bloque. Motor de trabajo continuo con protección térmica.',
    criteriosMantenimiento: 'Afilado semestral de navajas de acero inoxidable y engrase de sellos de flecha giratoria.'
  },
  {
    tipo: 'Crepera Eléctrica Profesional (1500W)',
    watts: 1500,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 13500,
    mantenimiento: 800,
    vidaUtil: 8,
    criteriosDurabilidad: 'Plato circular de 40 cm de hierro fundido con resistencia tubular en espiral. Requiere circuito exclusivo.',
    criteriosMantenimiento: 'Curado periódico de la placa con aceite mineral y reapriete de terminales térmicas cerámicas.'
  },
  {
    tipo: 'Olla Calentadora de Esquites (7 Litros)',
    watts: 1200,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 6800,
    mantenimiento: 400,
    vidaUtil: 6,
    criteriosDurabilidad: 'Baño maría eléctrico con cuba de acero inoxidable para mantener elote caliente todo el día.',
    criteriosMantenimiento: 'Descalcificación periódica de depósitos de agua e inspección del bulbo termostático.'
  },
  {
    tipo: 'Congeladora Horizontal (11 Pies Cúbicos)',
    watts: 300,
    fp: 0.85,
    tipoCarga: 'monofasica',
    precio: 9500,
    mantenimiento: 600,
    vidaUtil: 10,
    criteriosDurabilidad: 'Operación ininterrumpida 24/7 para preservación de base de raspados, nieve y pulpas.',
    criteriosMantenimiento: 'Desescarchado manual semestral y limpieza de rejilla exterior de ventilación del compresor.'
  },
  {
    tipo: 'Refrigerador Vertical (11 Pies Cúbicos)',
    watts: 350,
    fp: 0.85,
    tipoCarga: 'monofasica',
    precio: 11000,
    mantenimiento: 600,
    vidaUtil: 10,
    criteriosDurabilidad: 'Conservación de jarabes, leche, frutas y aderezos frescos. Ciclos frecuentes de apertura de puerta.',
    criteriosMantenimiento: 'Limpieza de charola de evaporación de deshielo y verificación de empaque perimetral.'
  },
  {
    tipo: 'Cafetera Espresso de 1 Servicio',
    watts: 1200,
    fp: 0.98,
    tipoCarga: 'monofasica',
    precio: 6500,
    mantenimiento: 600,
    vidaUtil: 5,
    criteriosDurabilidad: 'Bomba electromagnética de 15 bar con termobloque para extracción rápida de café espresso.',
    criteriosMantenimiento: 'Descalcificación trimestral con ácido cítrico alimenticio y limpieza de filtro presurizado.'
  },

  // --- ÁREA: OFICINAS DE CONSORCIO GALLEGOS GONZÁLEZ ---
  {
    tipo: 'Computadora Portátil (Laptop)',
    watts: 65,
    fp: 0.90,
    tipoCarga: 'monofasica',
    precio: 16000,
    mantenimiento: 300,
    vidaUtil: 5,
    criteriosDurabilidad: 'Equipo directivo portátil de bajo consumo con cargador USB-C / fuente conmutada.',
    criteriosMantenimiento: 'Mantenimiento del sistema operativo y estado de la batería.'
  },
  {
    tipo: 'Cafetera Casera (10 Tazas)',
    watts: 900,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 850,
    mantenimiento: 100,
    vidaUtil: 4,
    criteriosDurabilidad: 'Cafetera de goteo con placa calefactora para jarra de vidrio en sala de juntas.',
    criteriosMantenimiento: 'Lavado de canastilla porta-filtro y descalcificación básica.'
  },
  {
    tipo: 'Televisión LCD / LED 42 Pulgadas',
    watts: 110,
    fp: 0.95,
    tipoCarga: 'monofasica',
    precio: 7500,
    mantenimiento: 200,
    vidaUtil: 7,
    criteriosDurabilidad: 'Pantalla de presentación de proyectos y menú digital en cafetería / sala de juntas.',
    criteriosMantenimiento: 'Inspección de puertos HDMI y fijación en soporte de muro.'
  },
  {
    tipo: 'Módem de Internet & Router WiFi',
    watts: 25,
    fp: 0.85,
    tipoCarga: 'monofasica',
    precio: 2500,
    mantenimiento: 150,
    vidaUtil: 6,
    criteriosDurabilidad: 'Conectividad ininterrumpida para terminales de pago, CCTV y diseño gráfico.',
    criteriosMantenimiento: 'Respaldo con No-break para evitar caídas de red en microcortes de CFE.'
  },

  // --- SISTEMAS DE CLIMATIZACIÓN (HVAC) POR ÁREA ---
  {
    tipo: 'Minisplit Inverter 1 TR (Área 4x4 m - 220V)',
    watts: 1150,
    fp: 0.95,
    tipoCarga: 'bifasica',
    precio: 9500,
    mantenimiento: 800,
    vidaUtil: 8,
    criteriosDurabilidad: 'Capacidad 12,000 BTU a 220V. Ideal para áreas cerradas de 16 m² (Showroom, Oficinas, Publi-Imperia).',
    criteriosMantenimiento: 'Limpieza quincenal de filtros de nylon y lavado químico anual de serpentín exterior.'
  },
  {
    tipo: 'Minisplit Inverter 1 TR (Área 2x6 m - 220V)',
    watts: 1150,
    fp: 0.95,
    tipoCarga: 'bifasica',
    precio: 9500,
    mantenimiento: 800,
    vidaUtil: 8,
    criteriosDurabilidad: 'Capacidad 12,000 BTU a 220V optimizado para espacio alargado de 12 m² en Papelería ImperiArte.',
    criteriosMantenimiento: 'Verificación de deflector de aire oscilante y drenaje de condensados.'
  },
  {
    tipo: 'Minisplit Inverter 1 TR (Área 4x3.5 m - 220V)',
    watts: 1150,
    fp: 0.95,
    tipoCarga: 'bifasica',
    precio: 9500,
    mantenimiento: 800,
    vidaUtil: 8,
    criteriosDurabilidad: 'Capacidad 12,000 BTU a 220V para área de 14 m² en Taller de Costura. Filtros reforzados contra pelusa textil.',
    criteriosMantenimiento: 'Aspirado semanal de filtros de evaporador por alta presencia de polvillo de tela.'
  },

  // --- CIRCUITOS DE ILUMINACIÓN COMERCIAL Y AMBIENTACIÓN ---
  {
    tipo: 'Alumbrado LED Showroom Imperia (10 Luminarias)',
    watts: 180,
    fp: 0.95,
    tipoCarga: 'monofasica',
    precio: 4500,
    mantenimiento: 250,
    vidaUtil: 10,
    criteriosDurabilidad: '10 paneles LED empotrados de 18W para exhibición uniforme de prendas y uniformes.',
    criteriosMantenimiento: 'Inspección de drivers de corriente constante y limpieza de difusores.'
  },
  {
    tipo: 'Alumbrado LED Hawaiian Paradise (16 Luminarias)',
    watts: 288,
    fp: 0.95,
    tipoCarga: 'monofasica',
    precio: 6800,
    mantenimiento: 350,
    vidaUtil: 10,
    criteriosDurabilidad: '16 luminarias LED cálidas de 18W para ambientación de cafetería y zona de servicio.',
    criteriosMantenimiento: 'Reapriete de terminales en falso plafón y limpieza de polvo.'
  },
  {
    tipo: 'Alumbrado LED Taller de Costura (6 Luminarias)',
    watts: 108,
    fp: 0.95,
    tipoCarga: 'monofasica',
    precio: 2800,
    mantenimiento: 150,
    vidaUtil: 10,
    criteriosDurabilidad: '6 lámparas LED de luz blanca fría (6500K) de alto índice de reproducción cromática (CRI > 85).',
    criteriosMantenimiento: 'Limpieza de reflectores y cambio preventivo de drivers.'
  },
  {
    tipo: 'Alumbrado LED Taller Publi-Imperia (7 Luminarias)',
    watts: 126,
    fp: 0.95,
    tipoCarga: 'monofasica',
    precio: 3200,
    mantenimiento: 180,
    vidaUtil: 10,
    criteriosDurabilidad: '7 luminarias LED para precisión en mesa de corte, prensas térmicas y control de calidad.',
    criteriosMantenimiento: 'Inspección periódica de cableado expuesto en ductería conduit.'
  },
  {
    tipo: 'Alumbrado LED Papelería y Bordados (4 Luminarias)',
    watts: 72,
    fp: 0.95,
    tipoCarga: 'monofasica',
    precio: 1900,
    mantenimiento: 100,
    vidaUtil: 10,
    criteriosDurabilidad: '4 luminarias LED de 18W para mostrador y área de bordado.',
    criteriosMantenimiento: 'Limpieza superficial de difusores.'
  },

  // --- SERVICIOS GENERALES RESIDENCIALES / INMUEBLE ---
  {
    tipo: 'Bomba Presurizadora / Hidroneumático (1 HP)',
    watts: 850,
    fp: 0.82,
    tipoCarga: 'monofasica',
    precio: 7500,
    mantenimiento: 600,
    vidaUtil: 7,
    criteriosDurabilidad: 'Suministro de agua con presión constante a sanitarios de clientes, personal y cafetería.',
    criteriosMantenimiento: 'Calibración de presostato y verificación de presión en membrana.'
  },
  {
    tipo: 'Contactos GFCI Sanitarios y Cafetería (NOM-001 Art. 210-8)',
    watts: 1800,
    fp: 1.0,
    tipoCarga: 'monofasica',
    precio: 3200,
    mantenimiento: 300,
    vidaUtil: 15,
    criteriosDurabilidad: 'Protección salvavidas diferencial contra fallas a tierra en áreas húmedas.',
    criteriosMantenimiento: 'Prueba bimestral de botón de disparo diferencial TEST/RESET.'
  }
];

export const CATALOGO_RESTAURANTE = CATALOGO_RESIDENCIAL;
