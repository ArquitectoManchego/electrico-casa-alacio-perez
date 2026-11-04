/**
 * Motor de Políticas de Eficiencia Energética, Longevidad de Maquinaria y Buenas Prácticas Operativas.
 * Diseñado específicamente para los 7 negocios y equipos de Casa Alacio Pérez.
 * 
 * Estructurado en 3 pilares clave:
 * 1. Sistemas Activos (sensores, temporizadores, variadores, protecciones, control PID)
 * 2. Sistemas Pasivos (envolvente térmica, películas solares, cortinas de aire, zonificación, ventilación natural)
 * 3. Acciones Específicas de los Usuarios / Operadores (buenas prácticas, batching, setpoint 24°C, limpieza, encendido escalonado)
 */

import { calcularCobroCFECompleto } from './simuladorCFE.js';
import { NEGOCIOS_CONFIG } from './equiposNegocios.js';

export const CATALOGO_POLITICAS_NEGOCIOS = {
  // =========================================================================
  // 1. IMPERIA UNIFORMES (Showroom y Mostrador Comercial)
  // =========================================================================
  imperia_uniformes: {
    id: 'imperia_uniformes',
    nombre: 'Imperia Uniformes',
    subtitulo: 'Showroom Comercial & Venta de Uniformes',
    medidorId: 'med_1',
    icono: 'Shirt',
    colorTema: 'emerald',
    equipos: [
      {
        id: 'imp_ac',
        nombre: 'Minisplit Inverter 12k BTU (Showroom)',
        tipo: 'Climatización Inverter',
        watts: 1150,
        horasUsoDefault: 8.5,
        icono: '❄️',
        politicasActivas: [
          {
            id: 'imp_ac_termostato_programable',
            titulo: 'Termostato Programable con Sensor de Ocupación',
            tipo: 'activo',
            descripcion: 'Ajusta automáticamente la temperatura a 26°C o modo eco cuando no detecta clientes en el showroom por más de 20 minutos.',
            ahorroKwhMes: 45.0,
            ahorroPct: 18,
            beneficioVidaUtil: '+3 años de vida en compresor al evitar ciclado continuo a máxima carga.',
            costoImplementacion: 1200
          },
          {
            id: 'imp_ac_protector_voltaje',
            titulo: 'Protector de Voltaje con Retardo de 3 Minutos',
            tipo: 'activo',
            descripcion: 'Protege la tarjeta PCB electrónica inverter contra fluctuaciones y picos transitorios de la red CFE de Veracruz.',
            ahorroKwhMes: 0,
            ahorroPct: 0,
            beneficioVidaUtil: 'Previene daño catastrófico en la tarjeta inverter por apagones o descargas eléctricas.',
            costoImplementacion: 450
          }
        ],
        politicasPasivas: [
          {
            id: 'imp_ac_pelicula_solar',
            titulo: 'Película Nano-Cerámica de Control Solar en Aparador',
            tipo: 'pasivo',
            descripcion: 'Rechaza el 72% del calor infrarrojo solar que entra por los ventanales de exhibición sin oscurecer la vista de los maniquíes.',
            ahorroKwhMes: 55.0,
            ahorroPct: 22,
            beneficioVidaUtil: 'Reduce la carga térmica sobre el evaporador en 1.5 TR durante las horas pico de insolación.',
            costoImplementacion: 2800
          },
          {
            id: 'imp_ac_cortina_aire',
            titulo: 'Cortina de Aire en Acceso Principal de Clientes',
            tipo: 'pasivo',
            descripcion: 'Crea una barrera invisible de aire que impide la fuga de aire frío y la entrada de aire cálido húmedo exterior al abrir la puerta.',
            ahorroKwhMes: 38.0,
            ahorroPct: 15,
            beneficioVidaUtil: 'Mantiene la condensación bajo control y evita sobrecalentamiento del serpentín exterior.',
            costoImplementacion: 3500
          }
        ],
        accionesUsuario: [
          {
            id: 'imp_ac_setpoint_24',
            titulo: 'Regla de Oro: Setpoint Estricto a 24°C - 25°C',
            tipo: 'usuario',
            descripcion: 'Prohibido colocar el termostato a 16°C-18°C. Cada grado por debajo de 24°C aumenta 8% el consumo eléctrico sin enfriar más rápido.',
            ahorroKwhMes: 60.0,
            ahorroPct: 24,
            beneficioVidaUtil: 'Evita que el compresor opere forzado al 100% de frecuencia Hz de forma innecesaria.',
            costoImplementacion: 0
          },
          {
            id: 'imp_ac_limpieza_filtros',
            titulo: 'Soplado Semanal de Filtros de Aire por el Encargado',
            tipo: 'usuario',
            descripcion: 'Retirar y lavar la malla de nylon cada sábado. La pelusa textil de las prendas en mostrador tapa el flujo de aire rápidamente.',
            ahorroKwhMes: 25.0,
            ahorroPct: 10,
            beneficioVidaUtil: 'Previene congelamiento del evaporador y sobrecarga del motor turbina soplador.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'imp_tpv',
        nombre: 'Computadora TPV y Terminal Bancaria Smart POS',
        tipo: 'Cómputo Mostrador y Cobro',
        watts: 265,
        horasUsoDefault: 8.5,
        icono: '💻',
        politicasActivas: [
          {
            id: 'imp_pc_suspension_auto',
            titulo: 'Plan de Energía con Apagado de Pantalla en 5 min',
            tipo: 'activo',
            descripcion: 'Configurar el sistema operativo para apagar la pantalla LCD y poner discos en reposo tras 5 minutos de inactividad de mostrador.',
            ahorroKwhMes: 18.0,
            ahorroPct: 28,
            beneficioVidaUtil: 'Duplica la vida de la retroiluminación LED del monitor y evita recalentamiento de fuentes.',
            costoImplementacion: 0
          },
          {
            id: 'imp_pc_ups_avr',
            titulo: 'No-Break UPS con Regulación Interactiva AVR',
            tipo: 'activo',
            descripcion: 'Garantiza voltaje estable de 127V a la terminal y evita reinicios intempestivos o corrupción de base de datos durante cortes.',
            ahorroKwhMes: 0,
            ahorroPct: 0,
            beneficioVidaUtil: 'Protege el disco de estado sólido y la tarjeta madre de sobrevoltajes.',
            costoImplementacion: 1600
          }
        ],
        politicasPasivas: [
          {
            id: 'imp_pc_ventilacion_mueble',
            tipo: 'pasivo',
            titulo: 'Gabinete de Mostrador con Ventilación Libre (15 cm)',
            descripcion: 'Separar el CPU del fondo del mueble de madera para permitir flujo natural de aire fresco hacia la fuente de poder.',
            ahorroKwhMes: 5.0,
            ahorroPct: 8,
            beneficioVidaUtil: 'Reduce la temperatura interna en 10°C, evitando thermal throttling y fatiga de capacitores.',
            costoImplementacion: 0
          }
        ],
        accionesUsuario: [
          {
            id: 'imp_pc_apagado_cierre',
            tipo: 'usuario',
            titulo: 'Protocolo de Cierre: Apagado Completo en Multicontacto',
            descripcion: 'Apagar el interruptor de la regleta al cierre de caja. Elimina 25W continuos de standby nocturno de pantalla, terminal y cargadores.',
            ahorroKwhMes: 15.0,
            ahorroPct: 22,
            beneficioVidaUtil: 'Evita deterioro prematuro de componentes por calor residual continuo 24/7.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'imp_alumbrado',
        nombre: 'Alumbrado LED Showroom (10 Paneles 18W)',
        tipo: 'Iluminación de Exhibición',
        watts: 180,
        horasUsoDefault: 10.0,
        icono: '💡',
        politicasActivas: [
          {
            id: 'imp_luz_zonificacion_circuitos',
            tipo: 'activo',
            titulo: 'Encendido Dividido en 2 Circuitos (Aparador vs Bodega)',
            descripcion: 'Permite encender únicamente las luminarias de exhibición principal, manteniendo apagada el área trasera de almacenamiento si no se ocupa.',
            ahorroKwhMes: 22.0,
            ahorroPct: 40,
            beneficioVidaUtil: 'Reduce horas de uso de los drivers LED en un 40%.',
            costoImplementacion: 600
          }
        ],
        politicasPasivas: [
          {
            id: 'imp_luz_luz_natural',
            tipo: 'pasivo',
            titulo: 'Aprovechamiento de Luz Diurna Cenital',
            descripcion: 'Muros interiores en blanco mate de alta reflectancia (85%) para multiplicar la luz natural proveniente de la fachada.',
            ahorroKwhMes: 12.0,
            ahorroPct: 22,
            beneficioVidaUtil: 'Mayor luminosidad sin necesidad de agregar más luminarias activas.',
            costoImplementacion: 800
          }
        ],
        accionesUsuario: [
          {
            id: 'imp_luz_apagar_bodega',
            tipo: 'usuario',
            titulo: 'Hábito de Apagado de Probador y Bodega Tras Atención',
            descripcion: 'Capacitar al personal para apagar las luces auxiliares una vez que el cliente termina de medirse los uniformes.',
            ahorroKwhMes: 8.0,
            ahorroPct: 15,
            beneficioVidaUtil: 'Prolonga la vida de las tiras y módulos LED a más de 50,000 horas útiles.',
            costoImplementacion: 0
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. PAPELERÍA IMPERIARTE (Impresión Digital Láser, Copiado y Venta)
  // =========================================================================
  papeleria_imperiarte: {
    id: 'papeleria_imperiarte',
    nombre: 'Papelería ImperiArte',
    subtitulo: 'Centro de Copiado, Impresión Digital y Papelería de Diseño',
    medidorId: 'med_2',
    icono: 'Printer',
    colorTema: 'sky',
    equipos: [
      {
        id: 'pap_xerox',
        nombre: 'Fotocopiadora / Impresora Xerox DocuColor (1500W)',
        tipo: 'Impresión Digital Láser de Alto Volumen',
        watts: 1500,
        horasUsoDefault: 6.0,
        icono: '🖨️',
        politicasActivas: [
          {
            id: 'pap_xerox_deep_sleep',
            tipo: 'activo',
            titulo: 'Programación de Modo Reposo Profundo (Deep Sleep 5 min)',
            descripcion: 'Baja el consumo de 1500W a 8W cuando no está imprimiendo, reduciendo el calentamiento innecesario del rodillo fusor térmico.',
            ahorroKwhMes: 68.0,
            ahorroPct: 30,
            beneficioVidaUtil: 'Evita deformación del rodillo de teflón del fusor por calor estático.',
            costoImplementacion: 0
          },
          {
            id: 'pap_xerox_regulador_senoidal',
            tipo: 'activo',
            titulo: 'Acondicionador de Voltaje Ferroresonante 2 kVA',
            descripcion: 'Suministra energía limpia sin armónicos ni ruido eléctrico a los circuitos lógicos del escáner y placas láser de alta precisión.',
            ahorroKwhMes: 0,
            ahorroPct: 0,
            beneficioVidaUtil: 'Previene atascos por desincronización de sensores ópticos y quemado de tarjetas.',
            costoImplementacion: 4200
          }
        ],
        politicasPasivas: [
          {
            id: 'pap_xerox_extraccion_calor',
            tipo: 'pasivo',
            titulo: 'Tiro de Extracción Localizado sobre el Fusor de la Xerox',
            descripcion: 'Rejilla de ventilación superior que evacúa el aire caliente (70°C) del fusor hacia el exterior para no calentar la tienda.',
            ahorroKwhMes: 32.0,
            ahorroPct: 14,
            beneficioVidaUtil: 'Alivia en 0.5 TR la carga térmica del minisplit del local.',
            costoImplementacion: 1100
          }
        ],
        accionesUsuario: [
          {
            id: 'pap_xerox_batching_impresiones',
            tipo: 'usuario',
            titulo: 'Batching: Agrupar Tirajes de Copias e Impresiones',
            descripcion: 'Imprimir tandas continuas de 20 a 100 hojas en lugar de mandar 1 hoja suelta cada 5 minutos. Evita enfriamientos y recalentamientos del fusor.',
            ahorroKwhMes: 45.0,
            ahorroPct: 20,
            beneficioVidaUtil: 'Reduce el estrés térmico sobre el rodillo de presión de silicón y los tambores OPC.',
            costoImplementacion: 0
          },
          {
            id: 'pap_xerox_papel_seco',
            tipo: 'usuario',
            titulo: 'Almacenar Papel y Cartulinas en Área Seca y Sellada',
            descripcion: 'El papel húmedo por el clima de Veracruz absorbe el calor del fusor, provocando arrugas, atascos y duplicando el consumo de energía térmica.',
            ahorroKwhMes: 18.0,
            ahorroPct: 8,
            beneficioVidaUtil: 'Evita desgaste prematuro de los rodillos pick-up de alimentación de papel.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'pap_ac',
        nombre: 'Minisplit Inverter 1.5 TR (Papelería)',
        tipo: 'Climatización Inverter 220V',
        watts: 1700,
        horasUsoDefault: 8.0,
        icono: '❄️',
        politicasActivas: [
          {
            id: 'pap_ac_termostato_24',
            tipo: 'activo',
            titulo: 'Control Digital con Bloqueo de Temperatura Mínima (24°C)',
            descripcion: 'Impide que empleados o clientes bajen el control remoto a 18°C. Fija el rango operativo entre 24°C y 25°C.',
            ahorroKwhMes: 80.0,
            ahorroPct: 25,
            beneficioVidaUtil: 'Garantiza modulación inverter al 40% de potencia una vez alcanzado el confort.',
            costoImplementacion: 350
          }
        ],
        politicasPasivas: [
          {
            id: 'pap_ac_sellado_puertas',
            tipo: 'pasivo',
            titulo: 'Burletes de Hermeticidad en Puerta y Mostrador',
            descripcion: 'Evita la infiltración de humedad y polvo de la calle que satura los filtros del clima y ensucia los tambores de las impresoras.',
            ahorroKwhMes: 30.0,
            ahorroPct: 9,
            beneficioVidaUtil: 'Menor acumulación de polvo fino en motores y tarjetas electrónicas.',
            costoImplementacion: 400
          }
        ],
        accionesUsuario: [
          {
            id: 'pap_ac_puerta_cerrada',
            tipo: 'usuario',
            titulo: 'Uso de Cierrapuertas Hidráulico Automático',
            descripcion: 'Verificar que la puerta cierre sola tras el paso de cada estudiante para no perder el aire climatizado.',
            ahorroKwhMes: 40.0,
            ahorroPct: 12,
            beneficioVidaUtil: 'Reduce horas de sobrecarga del compresor inverter.',
            costoImplementacion: 650
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. HAWAIIAN PARADISE (Cafetería, Crepas, Marquesitas y Bebidas)
  // =========================================================================
  hawaiian_paradise: {
    id: 'hawaiian_paradise',
    nombre: 'Hawaiian Paradise',
    subtitulo: 'Cafetería, Crepas, Marquesitas, Frappés y Snacks',
    medidorId: 'med_3',
    icono: 'Coffee',
    colorTema: 'amber',
    equipos: [
      {
        id: 'hp_crepera',
        nombre: 'Crepera Krampouz (1500W) & Marquesitera Profesional (1500W)',
        tipo: 'Equipos Térmicos de Cocción Rápida',
        watts: 3000,
        horasUsoDefault: 6.0,
        icono: '🥞',
        politicasActivas: [
          {
            id: 'hp_crepera_termostato_pid',
            tipo: 'activo',
            titulo: 'Control Digital de Temperatura con Relé de Estado Sólido',
            descripcion: 'Reemplaza el interruptor bimetálico tradicional por control PID que dosifica el calor sin picos bruscos de 3000W.',
            ahorroKwhMes: 95.0,
            ahorroPct: 26,
            beneficioVidaUtil: 'Elimina el choque térmico que agrieta el plato de hierro fundido.',
            costoImplementacion: 1800
          }
        ],
        politicasPasivas: [
          {
            id: 'hp_crepera_pantalla_termica',
            tipo: 'pasivo',
            titulo: 'Mampara Deflectora de Acero Inoxidable Aislada',
            descripcion: 'Barrera física entre las creperas y la vitrina refrigerada para que el calor radiante no caliente el refrigerador de insumos.',
            ahorroKwhMes: 45.0,
            ahorroPct: 12,
            beneficioVidaUtil: 'Evita que el refrigerador aumente su consumo en un 35% por calor de proximidad.',
            costoImplementacion: 950
          }
        ],
        accionesUsuario: [
          {
            id: 'hp_crepera_apagar_segunda',
            tipo: 'usuario',
            titulo: 'Operación con 1 Sola Crepera en Horas Valle (10 am a 1 pm)',
            descripcion: 'Encender la segunda crepera únicamente a partir de las 2:00 pm en el pico de salida de estudiantes y tarde.',
            ahorroKwhMes: 110.0,
            ahorroPct: 30,
            beneficioVidaUtil: 'Duplica los años de vida de la resistencia de la máquina secundaria.',
            costoImplementacion: 0
          },
          {
            id: 'hp_crepera_precalentado_nivel_3',
            tipo: 'usuario',
            titulo: 'Precalentar en Nivel 3 (No al Máximo Nivel 5)',
            descripcion: 'Precalentar 10 minutos a temperatura media. Ponerla al máximo quema la mantequilla, carboniza el plato y gasta 40% más.',
            ahorroKwhMes: 35.0,
            ahorroPct: 10,
            beneficioVidaUtil: 'Preserva el curado antiadherente de cera de abeja del plato de hierro.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'hp_vitrina',
        nombre: 'Refrigerador Vitrina Panorámico Torrey (12 pies³)',
        tipo: 'Refrigeración Comercial Continua',
        watts: 450,
        horasUsoDefault: 24.0,
        icono: '🧊',
        politicasActivas: [
          {
            id: 'hp_vitrina_control_deshielo',
            tipo: 'activo',
            titulo: 'Controlador Electrónico de Deshielo por Demanda',
            descripcion: 'Realiza el deshielo solo cuando el sensor detecta escarcha real, evitando ciclos fijos innecesarios de resistencia eléctrica.',
            ahorroKwhMes: 40.0,
            ahorroPct: 18,
            beneficioVidaUtil: 'Menor fluctuación térmica de los lácteos, frutas y mezclas de crepa.',
            costoImplementacion: 1400
          }
        ],
        politicasPasivas: [
          {
            id: 'hp_vitrina_sombra_cristal',
            tipo: 'pasivo',
            titulo: 'Ubicación Lejos de la Luz Solar Directa y Ventilación Trasera',
            descripcion: 'Dejar 15 cm libres entre el serpentín trasero de la vitrina y la pared para permitir convección natural de aire fresco.',
            ahorroKwhMes: 30.0,
            ahorroPct: 14,
            beneficioVidaUtil: 'Reduce la presión de descarga del gas refrigerante y protege el motor compresor.',
            costoImplementacion: 0
          }
        ],
        accionesUsuario: [
          {
            id: 'hp_vitrina_no_calientes',
            tipo: 'usuario',
            titulo: 'Prohibido Introducir Jarabes o Mezclas Calientes',
            descripcion: 'Dejar enfriar las mermeladas y chocolates a temperatura ambiente antes de guardarlos en la vitrina.',
            ahorroKwhMes: 25.0,
            ahorroPct: 11,
            beneficioVidaUtil: 'Evita que el compresor trabaje forzado 4 horas seguidas.',
            costoImplementacion: 0
          },
          {
            id: 'hp_vitrina_limpieza_condensador',
            tipo: 'usuario',
            titulo: 'Limpieza Mensual del Serpentín Condensador con Cepillo',
            descripcion: 'Retirar pelusas y polvo acumulado en la rejilla inferior del motor una vez al mes.',
            ahorroKwhMes: 35.0,
            ahorroPct: 16,
            beneficioVidaUtil: 'Previene sobrecalentamiento del bobinado y quema del protector térmico.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'hp_ninja',
        nombre: 'Licuadora Ninja Profesional Auto-iQ & Máquina de Raspados',
        tipo: 'Triturado y Frappés de Alta Frecuencia',
        watts: 1500,
        horasUsoDefault: 3.0,
        icono: '🥤',
        politicasActivas: [
          {
            id: 'hp_ninja_modo_autoiq',
            tipo: 'activo',
            titulo: 'Uso de Pulsos Programados Auto-iQ con Rampa Suave',
            descripcion: 'El microprocesador arranca el motor con pulsos suaves que rompen el hielo sin el pico inductivo de corriente inicial.',
            ahorroKwhMes: 12.0,
            ahorroPct: 20,
            beneficioVidaUtil: 'Evita que se barra el engranaje de hule/clutch del vaso con las cuchillas.',
            costoImplementacion: 0
          }
        ],
        politicasPasivas: [
          {
            id: 'hp_ninja_tapete_antivibracion',
            tipo: 'pasivo',
            titulo: 'Base de Silicón Antivibración para Motor',
            descripcion: 'Aísla el motor de la mesa de preparación, reduciendo fatiga mecánica y ruido.',
            ahorroKwhMes: 0,
            ahorroPct: 0,
            beneficioVidaUtil: 'Reduce desgaste de baleros del motor de 1200W.',
            costoImplementacion: 180
          }
        ],
        accionesUsuario: [
          {
            id: 'hp_ninja_hielo_pequeno',
            tipo: 'usuario',
            titulo: 'Cargar con Hielo en Cubos Medianos y Líquido Primero',
            descripcion: 'Añadir primero la base líquida (leche o café) y después el hielo. Licuar en seco o con trozos enormes de hielo dobla la corriente eléctrica.',
            ahorroKwhMes: 15.0,
            ahorroPct: 25,
            beneficioVidaUtil: 'Previene que se tuerzan las 6 cuchillas de acero inoxidable templado.',
            costoImplementacion: 0
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 4. BORDADOS VERACRUZ (Bordadora 4 Cabezas, Compresor y Diseño)
  // =========================================================================
  bordados_veracruz: {
    id: 'bordados_veracruz',
    nombre: 'Bordados Veracruz',
    subtitulo: 'Taller de Bordado Industrial, Ponchado y Personalizado',
    medidorId: 'med_4',
    icono: 'Sparkles',
    colorTema: 'indigo',
    equipos: [
      {
        id: 'bv_bordadora',
        nombre: 'Bordadora Industrial Tajima / AEMCO 4 Cabezas 12 Agujas (1200W)',
        tipo: 'Maquinaria de Precisión Textil Electrónica',
        watts: 1200,
        horasUsoDefault: 8.0,
        icono: '🪡',
        politicasActivas: [
          {
            id: 'bv_ups_senoidal_online',
            tipo: 'activo',
            titulo: 'UPS Online de Doble Conversión Senoidal Pura (2 kVA)',
            descripcion: 'Aísla al 100% las 4 cabezas bordadoras del ruido de la red CFE. Si hay microcorte, no pierde las coordenadas del pantógrafo X-Y.',
            ahorroKwhMes: 0,
            ahorroPct: 0,
            beneficioVidaUtil: 'Evita colisiones catastróficas de agujas contra bastidores metálicos y salva prendas de desecho.',
            costoImplementacion: 5800
          },
          {
            id: 'bv_sensor_rotura_optico',
            tipo: 'activo',
            titulo: 'Sensores Ópticos de Tensión y Paro Inmediato de Hilo',
            descripcion: 'Detiene el motor en 0.2 segundos si se corta un hilo, evitando vueltas en falso y acumulación de nudos en la caja de bobina.',
            ahorroKwhMes: 15.0,
            ahorroPct: 8,
            beneficioVidaUtil: 'Protege los engranajes de distribución y el eje principal de atoramientos.',
            costoImplementacion: 950
          }
        ],
        politicasPasivas: [
          {
            id: 'bv_aislamiento_vibracion',
            tipo: 'pasivo',
            titulo: 'Soportes de Neopreno Aisladores de Vibración bajo Chasis',
            descripcion: 'Absorbe los 900 ciclos por minuto de las barras reciprocantes, manteniendo la máquina micrométricamente nivelada.',
            ahorroKwhMes: 8.0,
            ahorroPct: 4,
            beneficioVidaUtil: 'Evita desalineación prematura del tiempo entre aguja y garfio rotativo Koban.',
            costoImplementacion: 1200
          }
        ],
        accionesUsuario: [
          {
            id: 'bv_batching_4_piezas',
            tipo: 'usuario',
            titulo: 'Batching: Bordar Siempre en Múltiplos de 4 Cabezas',
            descripcion: 'Agrupar pedidos para montar siempre las 4 cabezas con el mismo diseño. Bordar 1 sola prenda teniendo 3 cabezas vacías gasta la misma energía motriz.',
            ahorroKwhMes: 55.0,
            ahorroPct: 30,
            beneficioVidaUtil: 'Distribuye equitativamente el desgaste entre los 4 cabezales.',
            costoImplementacion: 0
          },
          {
            id: 'bv_limpieza_aceitado_diario',
            tipo: 'usuario',
            titulo: 'Rutina de Lubricación y Desempolvado al Inicio del Turno',
            descripcion: '1 gota de aceite blanco en la pista de cada garfio y retiro de pelusa textil con brocha fina en el corta-hilo cada 4 horas.',
            ahorroKwhMes: 20.0,
            ahorroPct: 11,
            beneficioVidaUtil: 'Duplica la vida de los garfios de alta velocidad de 12 a 24 meses.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'bv_compresor',
        nombre: 'Compresor Silencioso Libre de Aceite (Corte Neumático)',
        tipo: 'Neumática de Corte y Limpieza',
        watts: 1500,
        horasUsoDefault: 2.0,
        icono: '💨',
        politicasActivas: [
          {
            id: 'bv_compresor_valvula_retencion',
            tipo: 'activo',
            titulo: 'Válvula de Retención Cero Fugas y Presostato Calibrado',
            descripcion: 'Mantiene el tanque presurizado a 90 PSI sin recargas espurias cada 15 minutos por fugas en mangueras de acople rápido.',
            ahorroKwhMes: 28.0,
            ahorroPct: 35,
            beneficioVidaUtil: 'Evita que el cabezal de pistón trabaje en seco de noche.',
            costoImplementacion: 450
          }
        ],
        politicasPasivas: [
          {
            id: 'bv_compresor_purga_humedad',
            tipo: 'pasivo',
            titulo: 'Filtro Trampa de Agua y Purga por Gravedad',
            descripcion: 'Evacúa el agua condensada del tanque de 50 litros por la alta humedad del puerto de Veracruz.',
            ahorroKwhMes: 0,
            ahorroPct: 0,
            beneficioVidaUtil: 'Evita corrosión interna del tanque y expulsión de agua oxidada sobre las prendas bordadas.',
            costoImplementacion: 350
          }
        ],
        accionesUsuario: [
          {
            id: 'bv_compresor_apagar_noche',
            tipo: 'usuario',
            titulo: 'Desconectar Compresor al Finalizar el Turno',
            descripcion: 'Purgar el tanque y apagar el interruptor de encendido. Nunca dejar el compresor presurizado toda la noche.',
            ahorroKwhMes: 18.0,
            ahorroPct: 22,
            beneficioVidaUtil: 'Alivia la tensión sobre empaques y sellos de teflón del pistón.',
            costoImplementacion: 0
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 5. TALLER DE COSTURA (Overlock, Recta, Collaretera, Caldera y Cortadora)
  // =========================================================================
  taller_costura: {
    id: 'taller_costura',
    nombre: 'Taller de Costura',
    subtitulo: 'Taller de Confección, Corte, Overlock y Planchado Industrial',
    medidorId: 'med_5',
    icono: 'Scissors',
    colorTema: 'rose',
    equipos: [
      {
        id: 'tc_costura_maquinas',
        nombre: 'Máquinas Overlock 5 Hilos, Recta Juki y Collaretera (Direct Drive)',
        tipo: 'Confección Mecatrónica Industrial',
        watts: 1650,
        horasUsoDefault: 8.0,
        icono: '🧵',
        politicasActivas: [
          {
            id: 'tc_servomotor_direct_drive',
            tipo: 'activo',
            titulo: 'Servomotores Direct Drive Integrados (0W en Reposo)',
            descripcion: 'Reemplazan los antiguos motores de embrague/clutch continuos. Consumen energía únicamente cuando el pedal está presionado.',
            ahorroKwhMes: 140.0,
            ahorroPct: 55,
            beneficioVidaUtil: 'Elimina bandas de transmisión, calor en las rodillas de la costurera y desgaste de zapatas.',
            costoImplementacion: 2600
          },
          {
            id: 'tc_lampara_led_aguja',
            tipo: 'activo',
            titulo: 'Lámparas LED Focalizadas de 3W sobre la Plancha de Aguja',
            descripcion: 'Proporciona 500 lux directamente sobre el prensatelas sin necesidad de reflectores incandescentes de 100W sobre cada máquina.',
            ahorroKwhMes: 35.0,
            ahorroPct: 14,
            beneficioVidaUtil: 'Reduce la radiación térmica directa sobre la costurera.',
            costoImplementacion: 280
          }
        ],
        politicasPasivas: [
          {
            id: 'tc_distribucion_luz_natural',
            tipo: 'pasivo',
            titulo: 'Orientación Perpendicular a Ventanas de Iluminación Natural',
            descripcion: 'Colocación de mesas de costura a 90° respecto a la entrada de luz natural para no generar sombras con el cuerpo del operador.',
            ahorroKwhMes: 25.0,
            ahorroPct: 10,
            beneficioVidaUtil: 'Mayor confort visual y menor encendido de luminarias auxiliares.',
            costoImplementacion: 0
          }
        ],
        accionesUsuario: [
          {
            id: 'tc_limpieza_dientes_arrastre',
            tipo: 'usuario',
            titulo: 'Retiro de Pelusa Textil de Dientes y Cuchillas al Final del Día',
            descripcion: 'La acumulación de hilos de mezclilla y gabardina traba el cigüeñal y fuerza el servomotor consumiendo hasta 25% más corriente.',
            ahorroKwhMes: 20.0,
            ahorroPct: 8,
            beneficioVidaUtil: 'Previene desgaste en la barra de aguja y evita saltos de puntada.',
            costoImplementacion: 0
          },
          {
            id: 'tc_apagar_paradas_corte',
            tipo: 'usuario',
            titulo: 'Apagar Máquinas Durante la Preparación de Telas y Corte',
            descripcion: 'Si la costurera va a trazar o planchar piezas durante más de 10 minutos, apagar la máquina en el switch.',
            ahorroKwhMes: 15.0,
            ahorroPct: 6,
            beneficioVidaUtil: 'Evita consumo residual de standby de la pantalla digital.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'tc_caldera',
        nombre: 'Plancha de Vapor con Caldera Industrial Silver Star (1300W)',
        tipo: 'Generación de Vapor Continuo',
        watts: 1300,
        horasUsoDefault: 5.0,
        icono: '💨',
        politicasActivas: [
          {
            id: 'tc_caldera_termostato_presostato',
            tipo: 'activo',
            titulo: 'Presostato Calibrado a 3.5 Bar con Corte Automático',
            descripcion: 'Corta la resistencia eléctrica en cuanto la presión de vapor es suficiente para el alisado, evitando ebullición descontrolada.',
            ahorroKwhMes: 45.0,
            ahorroPct: 28,
            beneficioVidaUtil: 'Protege la válvula de seguridad y previene fatiga del tanque de acero.',
            costoImplementacion: 650
          }
        ],
        politicasPasivas: [
          {
            id: 'tc_caldera_manga_termica',
            tipo: 'pasivo',
            titulo: 'Funda Térmica de Silicona y Teflón en Manguera de Vapor',
            descripcion: 'Evita pérdidas de calor por convección a lo largo de los 2 metros de manguera que van del tanque a la plancha de mano.',
            ahorroKwhMes: 20.0,
            ahorroPct: 12,
            beneficioVidaUtil: 'Vapor más seco en la suela y menor condensación de gotas sobre la ropa.',
            costoImplementacion: 220
          }
        ],
        accionesUsuario: [
          {
            id: 'tc_caldera_agua_purificada',
            tipo: 'usuario',
            titulo: 'Uso Estricto de Agua Purificada / Desmineralizada',
            descripcion: 'El agua de la red pública en Veracruz contiene sarro calcáreo que forma una costra sobre la resistencia en 3 meses.',
            ahorroKwhMes: 35.0,
            ahorroPct: 22,
            beneficioVidaUtil: 'Extiende la vida útil de la resistencia eléctrica de 6 meses a más de 3 años.',
            costoImplementacion: 0
          },
          {
            id: 'tc_caldera_batching_planchado',
            tipo: 'usuario',
            titulo: 'Batching: Planchar Lotes de 20 a 50 Prendas Consecutivas',
            descripcion: 'Planchar toda la producción del día en una sola sesión de 2 horas en vez de encender la caldera 5 veces al día.',
            ahorroKwhMes: 50.0,
            ahorroPct: 31,
            beneficioVidaUtil: 'Ahorra 4 ciclos de precalentamiento desde frío al día.',
            costoImplementacion: 0
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 6. TALLER PUBLI-IMPERIA (Plotter, Sublimación 40x60, Grabado Láser CO2)
  // =========================================================================
  taller_publi_imperia: {
    id: 'taller_publi_imperia',
    nombre: 'Taller Publi-Imperia',
    subtitulo: 'Sublimación, Transfer Térmico, Plotter de Vinil y Corte Láser CO2',
    medidorId: 'med_6',
    icono: 'Flame',
    colorTema: 'orange',
    equipos: [
      {
        id: 'pi_plancha_40x60',
        nombre: 'Plancha Térmica Plana Sublimación 40x60 cm (2200W)',
        tipo: 'Termofijado y Sublimación Textil Resistiva',
        watts: 2200,
        horasUsoDefault: 5.0,
        icono: '🔥',
        politicasActivas: [
          {
            id: 'pi_plancha_controlador_digital_pid',
            tipo: 'activo',
            titulo: 'Controlador de Temperatura PID de Precisión con SSR',
            descripcion: 'Modula la energía en pulsos de milisegundos evitando rebasar la temperatura objetivo de sublimación (200°C).',
            ahorroKwhMes: 75.0,
            ahorroPct: 27,
            beneficioVidaUtil: 'Evita carbonización de la almohadilla de silicón y fractura de la resistencia tubular.',
            costoImplementacion: 1650
          },
          {
            id: 'pi_plancha_temporizador_autoapagado',
            tipo: 'activo',
            titulo: 'Temporizador de Auto-Apagado por Inactividad (20 min)',
            descripcion: 'Si no se baja la prensa en 20 minutos, entra en modo espera reduciendo la temperatura a 100°C.',
            ahorroKwhMes: 50.0,
            ahorroPct: 18,
            beneficioVidaUtil: 'Previene accidentes de incendio y quemaduras en el taller.',
            costoImplementacion: 480
          }
        ],
        politicasPasivas: [
          {
            id: 'pi_plancha_campana_extraccion',
            tipo: 'pasivo',
            titulo: 'Campana Aislada con Extractor Superior de Humos de Tinta',
            descripcion: 'Desaloja el calor residual de 200°C directamente hacia la azotea, impidiendo que el calor se disipe en el taller.',
            ahorroKwhMes: 40.0,
            ahorroPct: 14,
            beneficioVidaUtil: 'Alivia en 1 TR el minisplit del área de diseño y sublimación.',
            costoImplementacion: 1800
          }
        ],
        accionesUsuario: [
          {
            id: 'pi_plancha_batching_playeras',
            tipo: 'usuario',
            titulo: 'Batching: Estampar Lotes Mínimos de 10 a 20 Playeras',
            descripcion: 'Precalentar la plancha una sola vez y planchar todas las playeras seguidas. Precalentar para 1 playera gasta el triple de energía.',
            ahorroKwhMes: 65.0,
            ahorroPct: 23,
            beneficioVidaUtil: 'Aprovecha la inercia térmica acumulada en el plato superior de aluminio fundido.',
            costoImplementacion: 0
          },
          {
            id: 'pi_plancha_hoja_teflon_limpia',
            tipo: 'usuario',
            titulo: 'Limpieza Diaria del Teflón Protector de la Placa',
            descripcion: 'Retirar residuos de tinta sublimática y adhesivo para asegurar conductividad térmica uniforme sin subir la temperatura.',
            ahorroKwhMes: 15.0,
            ahorroPct: 5,
            beneficioVidaUtil: 'Evita transferencias defectuosas y manchas en prendas nuevas.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'pi_laser_co2',
        nombre: 'Máquina Grabado y Corte Láser CO2 80W con Chiller Industrial',
        tipo: 'Óptica Láser de Alta Precisión y Enfriamiento',
        watts: 1200,
        horasUsoDefault: 4.0,
        icono: '⚡',
        politicasActivas: [
          {
            id: 'pi_chiller_cw5200',
            tipo: 'activo',
            titulo: 'Chiller Industrial CW-5200 con Termostato Inteligente',
            descripcion: 'Mantiene la temperatura del tubo láser exactamente entre 19°C y 22°C con corte de protección por alarma de flujo.',
            ahorroKwhMes: 35.0,
            ahorroPct: 24,
            beneficioVidaUtil: 'Triplica la vida útil del tubo de vidrio CO2 de 1,500 a más de 5,000 horas de disparo.',
            costoImplementacion: 8500
          }
        ],
        politicasPasivas: [
          {
            id: 'pi_laser_extraccion_directa',
            tipo: 'pasivo',
            titulo: 'Extractor de Humos Centrífugo con Salida Hermética',
            descripcion: 'Evita la recirculación de humo corrosivo de acrílico y madera dentro del chasis y la óptica.',
            ahorroKwhMes: 0,
            ahorroPct: 0,
            beneficioVidaUtil: 'Preserva la capa reflectiva de oro/molibdeno en los 3 espejos de desvío.',
            costoImplementacion: 1400
          }
        ],
        accionesUsuario: [
          {
            id: 'pi_laser_limpieza_optica',
            tipo: 'usuario',
            titulo: 'Limpieza de Espejos y Lente Focal con Alcohol Isopropílico',
            descripcion: 'Lente limpio transmite el 99% de la potencia del haz. Un lente con hollín requiere subir la potencia del tubo del 45% al 75%.',
            ahorroKwhMes: 25.0,
            ahorroPct: 17,
            beneficioVidaUtil: 'Previene fractura térmica del lente de seleniuro de zinc (ZnSe).',
            costoImplementacion: 0
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 7. OFICINAS CONSORCIO (Climas, Servidor, Conmutador y Bomba de Agua)
  // =========================================================================
  oficinas_consorcio: {
    id: 'oficinas_consorcio',
    nombre: 'Oficinas Consorcio',
    subtitulo: 'Dirección Corporativa, Contabilidad, TI y Servicios Generales',
    medidorId: 'med_6',
    icono: 'Briefcase',
    colorTema: 'cyan',
    equipos: [
      {
        id: 'ofi_climas',
        nombre: '3x Minisplit Inverter 1 TR Oficinas Privadas (3450W)',
        tipo: 'Climatización Corporativa Modular',
        watts: 3450,
        horasUsoDefault: 8.0,
        icono: '❄️',
        politicasActivas: [
          {
            id: 'ofi_ac_control_centralizado',
            tipo: 'activo',
            titulo: 'Termostatos Wi-Fi con Encendido y Apagado Centralizado',
            descripcion: 'Apagado maestro de los 3 climas a las 7:00 pm. Evita que queden climas encendidos toda la noche en oficinas desocupadas.',
            ahorroKwhMes: 120.0,
            ahorroPct: 29,
            beneficioVidaUtil: 'Elimina 12 horas diarias de operación fantasma en fines de semana y noches.',
            costoImplementacion: 1800
          }
        ],
        politicasPasivas: [
          {
            id: 'ofi_ac_persianas_termicas',
            tipo: 'pasivo',
            titulo: 'Persianas Blackout Térmicas en Ventanas Oriente y Poniente',
            descripcion: 'Bloquea el calor del sol matutino y de la tarde antes de que entre a las oficinas privadas.',
            ahorroKwhMes: 50.0,
            ahorroPct: 12,
            beneficioVidaUtil: 'Permite que los equipos alcancen temperatura de confort en la mitad del tiempo.',
            costoImplementacion: 2200
          }
        ],
        accionesUsuario: [
          {
            id: 'ofi_ac_setpoint_25',
            tipo: 'usuario',
            titulo: 'Política Corporativa de Confort a 24°C - 25°C',
            descripcion: 'Mantener temperatura moderada con ropa adecuada de oficina. Cada grado ahorra 8% en el recibo de luz.',
            ahorroKwhMes: 65.0,
            ahorroPct: 16,
            beneficioVidaUtil: 'Menor desgaste de los compresores inverter.',
            costoImplementacion: 0
          }
        ]
      },
      {
        id: 'ofi_bomba',
        nombre: 'Bomba Presurizadora Hidroneumática 1 HP (Servicios Generales)',
        tipo: 'Sistema Hidráulico Sanitario del Inmueble',
        watts: 850,
        horasUsoDefault: 3.0,
        icono: '💧',
        politicasActivas: [
          {
            id: 'ofi_bomba_control_presion',
            tipo: 'activo',
            titulo: 'Controlador Electrónico de Presión con Protección en Seco',
            descripcion: 'Regula el arranque suave de la bomba y la detiene de inmediato si no hay agua en la cisterna.',
            ahorroKwhMes: 15.0,
            ahorroPct: 20,
            beneficioVidaUtil: 'Evita que el motor se queme por trabajar en seco sin agua.',
            costoImplementacion: 850
          }
        ],
        politicasPasivas: [
          {
            id: 'ofi_bomba_valvulas_check',
            tipo: 'pasivo',
            titulo: 'Válvulas Check de Doble Sello y Cero Fugas en Sanitarios',
            descripcion: 'Evita que la presión del hidroneumático caiga por fugas mínimas en sapos de sanitarios o llaves de lavabos.',
            ahorroKwhMes: 22.0,
            ahorroPct: 29,
            beneficioVidaUtil: 'Elimina los encendidos fantasmas cada 10 minutos durante la noche.',
            costoImplementacion: 600
          }
        ],
        accionesUsuario: [
          {
            id: 'ofi_bomba_reporte_fugas',
            tipo: 'usuario',
            titulo: 'Reporte Inmediato de Fugas en Baños de los 7 Locales',
            descripcion: 'Una taza de baño que corre agua continua activa la bomba 60 veces al día consumiendo energía y agotando la cisterna.',
            ahorroKwhMes: 20.0,
            ahorroPct: 26,
            beneficioVidaUtil: 'Preserva el diafragma del tanque presurizador.',
            costoImplementacion: 0
          }
        ]
      }
    ]
  }
};

/**
 * Calcula el ahorro en kWh y MXN de las políticas seleccionadas para un negocio
 */
export function calcularAhorroPoliticasNegocio({
  negocioId,
  politicasSeleccionadas = {}, // { [politicaId]: boolean }
  diasPeriodo = 30,
  tarifas = {},
  costosMEM = {},
  aparatos = []
}) {
  const negocio = CATALOGO_POLITICAS_NEGOCIOS[negocioId] || CATALOGO_POLITICAS_NEGOCIOS.imperia_uniformes;

  let totalAhorroKwhMes = 0;
  let totalPoliticasActivasCount = 0;
  let totalPoliticasPosibles = 0;
  let inversionImplementacionTotal = 0;

  const desgloseEquipos = [];

  negocio.equipos.forEach(eq => {
    let ahorroKwhEquipoMes = 0;
    const politicasAplicadas = [];

    const todasPoliticasEquipo = [
      ...eq.politicasActivas,
      ...eq.politicasPasivas,
      ...eq.accionesUsuario
    ];

    todasPoliticasEquipo.forEach(pol => {
      totalPoliticasPosibles++;
      const isActiva = politicasSeleccionadas[pol.id] !== false; // Activas por defecto o seleccionadas

      if (isActiva) {
        totalPoliticasActivasCount++;
        ahorroKwhEquipoMes += pol.ahorroKwhMes || 0;
        inversionImplementacionTotal += pol.costoImplementacion || 0;
        politicasAplicadas.push(pol);
      }
    });

    totalAhorroKwhMes += ahorroKwhEquipoMes;

    desgloseEquipos.push({
      equipoId: eq.id,
      nombre: eq.nombre,
      tipo: eq.tipo,
      watts: eq.watts,
      icono: eq.icono,
      ahorroKwhMes: ahorroKwhEquipoMes,
      politicasAplicadasCount: politicasAplicadas.length,
      politicasTotalCount: todasPoliticasEquipo.length,
      politicas: todasPoliticasEquipo.map(p => ({
        ...p,
        activa: politicasSeleccionadas[p.id] !== false
      }))
    });
  });

  // Cálculo en pesos según tarifa CFE
  const factorPeriodo = diasPeriodo / 30;
  const kwhPeriodoAhorrado = totalAhorroKwhMes * factorPeriodo;

  // Tarifa promedio de CFE (~$3.80 a $4.20 MXN/kWh en escalón excedente comercial o doméstico)
  const costoPromedioKwh = 3.90;
  const ahorroPesosPeriodo = kwhPeriodoAhorrado * costoPromedioKwh;
  const ahorroPesosMes = totalAhorroKwhMes * costoPromedioKwh;
  const ahorroPesosAnual = ahorroPesosMes * 12;

  // Estimación de vida útil extendida promedio
  const porcentajeCumplimiento = totalPoliticasPosibles > 0 
    ? Math.round((totalPoliticasActivasCount / totalPoliticasPosibles) * 100)
    : 0;

  let anosVidaUtilGanados = 0;
  if (porcentajeCumplimiento >= 80) anosVidaUtilGanados = 4.5;
  else if (porcentajeCumplimiento >= 50) anosVidaUtilGanados = 3.0;
  else if (porcentajeCumplimiento >= 20) anosVidaUtilGanados = 1.5;

  return {
    negocioId,
    negocioNombre: negocio.nombre,
    medidorId: negocio.medidorId,
    totalPoliticasPosibles,
    totalPoliticasActivasCount,
    porcentajeCumplimiento,
    totalAhorroKwhMes: Math.round(totalAhorroKwhMes * 10) / 10,
    kwhPeriodoAhorrado: Math.round(kwhPeriodoAhorrado * 10) / 10,
    ahorroPesosMes: Math.round(ahorroPesosMes),
    ahorroPesosPeriodo: Math.round(ahorroPesosPeriodo),
    ahorroPesosAnual: Math.round(ahorroPesosAnual),
    inversionImplementacionTotal,
    anosVidaUtilGanados,
    desgloseEquipos
  };
}

/**
 * Calcula el impacto consolidado de las políticas de eficiencia en los 7 negocios del consorcio
 */
export function calcularConsolidadoPoliticasConsorcio({
  politicasPorNegocio = {}, // { [negocioId]: { [polId]: boolean } }
  diasPeriodo = 30,
  tarifas = {},
  costosMEM = {},
  aparatos = []
}) {
  let ahorroKwhMesConsorcio = 0;
  let ahorroPesosMesConsorcio = 0;
  let inversionConsorcioTotal = 0;
  let totalPoliticasActivas = 0;
  let totalPoliticasTotales = 0;

  const resultadosPorNegocio = {};

  Object.keys(CATALOGO_POLITICAS_NEGOCIOS).forEach(negId => {
    const sel = politicasPorNegocio[negId] || {};
    const res = calcularAhorroPoliticasNegocio({
      negocioId: negId,
      politicasSeleccionadas: sel,
      diasPeriodo,
      tarifas,
      costosMEM,
      aparatos
    });

    resultadosPorNegocio[negId] = res;
    ahorroKwhMesConsorcio += res.totalAhorroKwhMes;
    ahorroPesosMesConsorcio += res.ahorroPesosMes;
    inversionConsorcioTotal += res.inversionImplementacionTotal;
    totalPoliticasActivas += res.totalPoliticasActivasCount;
    totalPoliticasTotales += res.totalPoliticasPosibles;
  });

  const ahorroPesosAnualConsorcio = ahorroPesosMesConsorcio * 12;
  const porcentajeConsorcio = totalPoliticasTotales > 0 
    ? Math.round((totalPoliticasActivas / totalPoliticasTotales) * 100)
    : 0;

  return {
    ahorroKwhMesConsorcio: Math.round(ahorroKwhMesConsorcio * 10) / 10,
    ahorroPesosMesConsorcio: Math.round(ahorroPesosMesConsorcio),
    ahorroPesosAnualConsorcio: Math.round(ahorroPesosAnualConsorcio),
    inversionConsorcioTotal,
    totalPoliticasActivas,
    totalPoliticasTotales,
    porcentajeConsorcio,
    resultadosPorNegocio
  };
}
