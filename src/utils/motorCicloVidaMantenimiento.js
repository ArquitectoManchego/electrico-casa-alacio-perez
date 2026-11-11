/**
 * Motor de Ciclo de Vida, Desgaste de Maquinaria y Presupuesto de Mantenimiento / Refacciones.
 * Modela con rigor de ingeniería y finanzas operativas:
 * 1. El valor de adquisición (CapEx) y depreciación lineal anual por desgaste (vida útil).
 * 2. El desglose de todas las piezas, consumibles y componentes críticos que se pueden descomponer
 *    o que requieren cambio programado y mantenimiento preventivo/correctivo.
 * 3. El cálculo anualizado y mensual de este fondo de mantenimiento y refacciones para agregarlo
 *    directamente al costo de operaciones y punto de equilibrio de la tienda.
 */

import { NEGOCIOS_CONFIG } from './equiposNegocios.js';

/**
 * Catálogo Maestro Predeterminado de Piezas de Desgaste, Refacciones Críticas y Mantenimientos
 * organizados por palabras clave y familias tecnológicas de maquinaria.
 */
export const CATALOGO_PARTES_DEFECTO = {
  // 1. Climatización Inverter (Minisplits 1 TR, 1.5 TR, 2 TR)
  clima_inverter: [
    {
      id: 'clima_mant_quimico',
      nombre: 'Mantenimiento preventivo semestral (Lavado químico de serpentines, turbina y filtros)',
      tipo: 'preventivo',
      frecuenciaMeses: 6,
      costoPieza: 0,
      costoManoObra: 500,
      descripcion: 'Desarme y lavado con hidro-lavadora y desengrasante dieléctrico de evaporador y condensador exterior.',
      sintomaFalla: 'Bajo flujo de aire frío, malos olores por moho, incremento del 18% en consumo eléctrico.'
    },
    {
      id: 'clima_gas_r410a',
      nombre: 'Detección de microfuga y recarga de gas refrigerante R410A / R32',
      tipo: 'desgaste',
      frecuenciaMeses: 24,
      costoPieza: 750,
      costoManoObra: 450,
      descripcion: 'Prueba de nitrógeno, sellado de abocardados y vacío con bomba profunda de 2 etapas.',
      sintomaFalla: 'El compresor opera continuamente pero no enfría la habitación; escarcha en tubería de alta.'
    },
    {
      id: 'clima_tarjeta_pcb',
      nombre: 'Tarjeta electrónica de potencia PCB Inverter',
      tipo: 'correctivo',
      frecuenciaMeses: 36,
      costoPieza: 2800,
      costoManoObra: 600,
      descripcion: 'Reemplazo de módulo IPM / microcontrolador por fatiga de capacitores o picos de voltaje CFE.',
      sintomaFalla: 'Código de error en display (E1/E6), el compresor no enciende tras tormenta o variación de voltaje.'
    },
    {
      id: 'clima_motor_turbina',
      nombre: 'Motor ventilador interior y bujes de turbina tangencial',
      tipo: 'desgaste',
      frecuenciaMeses: 48,
      costoPieza: 1400,
      costoManoObra: 500,
      descripcion: 'Reemplazo del motor DC sin escobillas y buje de goma lubricada de la turbina.',
      sintomaFalla: 'Chirrido o vibración constante en la carátula plástica de la habitación.'
    }
  ],

  // 2. Bordadoras Industriales (AEMCO 4 Cabezas, Melco, Brother)
  bordadora_industrial: [
    {
      id: 'emb_cuchillas_corte',
      nombre: 'Juego de cuchillas de corte automático de hilo (Cuchilla móvil + fija)',
      tipo: 'desgaste',
      frecuenciaMeses: 6,
      costoPieza: 450,
      costoManoObra: 250,
      descripcion: 'Cuchillas de acero endurecido para corte inferior del hilo de bobina y aguja al cambiar color.',
      sintomaFalla: 'Hilos masticados o hebras largas que provocan atascos en el arranque del siguiente bloque.'
    },
    {
      id: 'emb_cajas_bobina_garfio',
      nombre: 'Cajas de bobina japonesas Towa y garfios rotativos de precisión Koban',
      tipo: 'desgaste',
      frecuenciaMeses: 12,
      costoPieza: 1800,
      costoManoObra: 600,
      descripcion: 'Reemplazo de canastillas porta-bobina y re-calibración de punta del garfio rotativo.',
      sintomaFalla: 'Nidos de hilo bajo la prenda, tensión irregular en bordados con filo y rotura de hilo constante.'
    },
    {
      id: 'emb_agujas_organ',
      nombre: 'Lote mensual de agujas industriales de bordado punta bola DBxK5 (Paquete 100)',
      tipo: 'desgaste',
      frecuenciaMeses: 1,
      costoPieza: 250,
      costoManoObra: 0,
      descripcion: 'Agujas recubiertas de titanio/cromo para alta velocidad (850 a 1000 puntadas/minuto).',
      sintomaFalla: 'Puntas romas que perforan y rompen la tela de piqué o popelina en vez de abrir el tejido.'
    },
    {
      id: 'emb_bandas_pantografo',
      nombre: 'Bandas dentadas sincronizadas del pantógrafo X-Y',
      tipo: 'desgaste',
      frecuenciaMeses: 24,
      costoPieza: 1200,
      costoManoObra: 800,
      descripcion: 'Correas de transmisión dentada de poliuretano con alma de acero para el bastidor móvil.',
      sintomaFalla: 'Desfase de contorno respecto al relleno, bordados circulares que salen ovalados.'
    },
    {
      id: 'emb_servicio_calibracion',
      nombre: 'Alineación de tiempo aguja-garfio y engrase general de barras de aguja',
      tipo: 'preventivo',
      frecuenciaMeses: 6,
      costoPieza: 0,
      costoManoObra: 1500,
      descripcion: 'Sincronización micrométrica con galga de holgura y lubricación de levas y biela reciprocante.',
      sintomaFalla: 'Golpeteo seco metálico en el cabezal o descalibración tras choque de aguja contra aro.'
    }
  ],

  // 3. Máquinas de Costura Industrial (Overlock Siruba, Recta Juki, Collaretera, Cortadora)
  costura_industrial: [
    {
      id: 'sew_cuchillas_overlock',
      nombre: 'Cuchillas de corte superior e inferior para máquina Overlock (Carburo)',
      tipo: 'desgaste',
      frecuenciaMeses: 3,
      costoPieza: 280,
      costoManoObra: 0,
      descripcion: 'Cuchillas encargadas de recortar el orillo sobrante de tela antes del encadenado de 5 hilos.',
      sintomaFalla: 'La tela se mastica y queda mordida en vez de tener un corte limpio y parejo.'
    },
    {
      id: 'sew_agujas_groz',
      nombre: 'Lote de agujas industriales Groz-Beckert para recta y overlock (Paquete mensual)',
      tipo: 'desgaste',
      frecuenciaMeses: 1,
      costoPieza: 120,
      costoManoObra: 0,
      descripcion: 'Agujas sistema 135x5 y B27 de acero templado para costura continua.',
      sintomaFalla: 'Jalones de hilo en mezclilla o gabardina, saltos de puntada.'
    },
    {
      id: 'sew_planchuela_dientes',
      nombre: 'Planchuela de costura y dientes de arrastre de 4 hileras',
      tipo: 'desgaste',
      frecuenciaMeses: 12,
      costoPieza: 350,
      costoManoObra: 150,
      descripcion: 'Ranuras y dentado inferior sometidos a fricción continua de aguja y tela pesada.',
      sintomaFalla: 'Rebabas que trozan el hilo al pasar o tela que no avanza parejo en costuras largas.'
    },
    {
      id: 'sew_garfio_looper',
      nombre: 'Garfio rotativo de máquina recta / Loopers superior e inferior de overlock',
      tipo: 'desgaste',
      frecuenciaMeses: 18,
      costoPieza: 750,
      costoManoObra: 350,
      descripcion: 'Piezas de precisión encargadas de tomar la lazada de aguja a 5000 RPM.',
      sintomaFalla: 'Descalibración tras choque con alfileres o remaches, costura floja por debajo.'
    },
    {
      id: 'sew_aceite_filtro',
      nombre: 'Cambio de aceite blanco mineral de cárter y filtro de bomba lubricante',
      tipo: 'preventivo',
      frecuenciaMeses: 6,
      costoPieza: 220,
      costoManoObra: 100,
      descripcion: 'Drenado y reemplazo de 1 litro de aceite de alta velocidad ISO 22.',
      sintomaFalla: 'Aceite quemado/amarillo con restos de pelusa, peligro de amarre de bujes de biela.'
    },
    {
      id: 'sew_cortadora_cuchilla',
      nombre: 'Cuchillas de recambio y cintas de afilador esmeril para cortadora vertical Eastman',
      tipo: 'desgaste',
      frecuenciaMeses: 2,
      costoPieza: 150,
      costoManoObra: 0,
      descripcion: 'Cuchilla recta de 8 pulgadas y par de bandas abrasivas para afilador automático.',
      sintomaFalla: 'Colchón de tela que se desplaza hacia atrás por resistencia al corte; corte desalineado.'
    },
    {
      id: 'sew_caldera_plancha',
      nombre: 'Resistencia calefactora, termostato y empaques de electroválvula de plancha de vapor',
      tipo: 'correctivo',
      frecuenciaMeses: 18,
      costoPieza: 850,
      costoManoObra: 400,
      descripcion: 'Mantenimiento antitsar y cambio de sellos térmicos de caldera Silver Star.',
      sintomaFalla: 'La plancha escupe gotas de agua hirviendo manchando prendas o no calienta el vapor.'
    }
  ],

  // 4. Copiado, Artes Gráficas e Impresión Láser (Xerox DocuColor, Konica)
  impresion_digital: [
    {
      id: 'copia_opc_drums',
      nombre: 'Tambores fotosensibles de imagen OPC Drum (Juego Cyan, Magenta, Amarillo, Negro)',
      tipo: 'desgaste',
      frecuenciaMeses: 8,
      costoPieza: 2200,
      costoManoObra: 400,
      descripcion: 'Cilindros fotosensibles orgánicos sometidos a carga electrostática y fricción de papel.',
      sintomaFalla: 'Líneas transversales repetitivas en cada giro del tambor, sombras oscuras en pliegos.'
    },
    {
      id: 'copia_cuchillas_limpieza',
      nombre: 'Cuchillas de limpieza de tambor (Drum Cleaning Blades)',
      tipo: 'desgaste',
      frecuenciaMeses: 8,
      costoPieza: 650,
      costoManoObra: 350,
      descripcion: 'Láminas de uretano que remueven el tóner residual no transferido.',
      sintomaFalla: 'Franjas de color difuso y velo sucio en el fondo blanco de las copias.'
    },
    {
      id: 'copia_unidad_fusor',
      nombre: 'Módulo de fijación térmica / Fusor (Rodillo de calor, manga de presión y termistores)',
      tipo: 'desgaste',
      frecuenciaMeses: 18,
      costoPieza: 5800,
      costoManoObra: 900,
      descripcion: 'Ensamble de calor a 180°C que derrite y fija la resina del tóner a las fibras de celulosa.',
      sintomaFalla: 'El tóner se desprende al raspar la hoja con la uña, o el papel sale arrugado en acordeón.'
    },
    {
      id: 'copia_rodillos_alimentacion',
      nombre: 'Juego de rodillos de toma, arrastre y retardo de papel (Pick-up & Feed Rollers)',
      tipo: 'desgaste',
      frecuenciaMeses: 6,
      costoPieza: 450,
      costoManoObra: 200,
      descripcion: 'Rodillos de goma con textura de tracción que jalan las hojas de cartulina y sulfatada.',
      sintomaFalla: 'Atascos constantes en charola, jala dos hojas pegadas o marca error de papel trabado.'
    },
    {
      id: 'copia_banda_transferencia',
      nombre: 'Banda de transferencia intermedia ITB (Intermediate Transfer Belt)',
      tipo: 'desgaste',
      frecuenciaMeses: 24,
      costoPieza: 4200,
      costoManoObra: 800,
      descripcion: 'Cinturón polimérico donde se alinean las 4 capas de color antes de estampar la cartulina.',
      sintomaFalla: 'Desfase en el registro de color milimétrico en textos finos o cortes por rayaduras en la banda.'
    }
  ],

  // 5. Talleres Gráficos, Sublimación y Plotter (Roland, Planchas, Láser)
  artes_graficas_taller: [
    {
      id: 'art_cuchillas_plotter',
      nombre: 'Cuchillas de corte de carburo cementado de tungsteno Roland 45°/60° (Pack 3)',
      tipo: 'desgaste',
      frecuenciaMeses: 4,
      costoPieza: 250,
      costoManoObra: 0,
      descripcion: 'Punta de corte de alta precisión para vinil textil termotransferible y adhesivo reflectivo.',
      sintomaFalla: 'El vinil se levanta o muerde en esquinas pequeñas; requiere subir la fuerza del plotter.'
    },
    {
      id: 'art_teflon_protector',
      nombre: 'Tira de protección de teflón de corte (Protection Strip)',
      tipo: 'desgaste',
      frecuenciaMeses: 12,
      costoPieza: 350,
      costoManoObra: 0,
      descripcion: 'Banda plástica sobre la que corre la cuchilla; evita daño al chasis metálico.',
      sintomaFalla: 'Surcos profundos que provocan que la cuchilla salte en ciertas zonas de corte.'
    },
    {
      id: 'art_resistencia_plancha',
      nombre: 'Resistencia eléctrica plana de calor 40x60 cm con recubrimiento de teflón',
      tipo: 'correctivo',
      frecuenciaMeses: 24,
      costoPieza: 2400,
      costoManoObra: 600,
      descripcion: 'Plato térmico superior de aluminio fundido con resistencia tubular interna.',
      sintomaFalla: 'Zonas frías con más de 15°C de diferencia en esquinas; transferencias deslavadas en los bordes.'
    },
    {
      id: 'art_silicon_plancha',
      nombre: 'Almohadilla de silicón para alta temperatura 40x60 cm y lámina de teflón protector',
      tipo: 'desgaste',
      frecuenciaMeses: 6,
      costoPieza: 480,
      costoManoObra: 0,
      descripcion: 'Base elástica de presión uniforme que compensa costuras y botones.',
      sintomaFalla: 'Silicón endurecido o agrietado por fatiga térmica; presión desigual sobre la prenda.'
    },
    {
      id: 'art_lentes_laser',
      nombre: 'Lente de enfoque focal ZnSe de 20mm y juego de 3 espejos reflectores de molibdeno',
      tipo: 'desgaste',
      frecuenciaMeses: 12,
      costoPieza: 1600,
      costoManoObra: 400,
      descripcion: 'Óptica de precisión que guía y concentra el haz láser CO2/diodo.',
      sintomaFalla: 'Haz desenfocado, corte carbonizado ancho, pérdida del 30% en velocidad de grabado.'
    }
  ],

  // 6. Cafetería, Snacks y Bebidas (Hawaiian Paradise)
  cafeteria_restaurante: [
    {
      id: 'hp_empaques_grupo',
      nombre: 'Juego de empaques de hule de grupo, sellos de portafiltro y duchas de dispersión',
      tipo: 'desgaste',
      frecuenciaMeses: 4,
      costoPieza: 220,
      costoManoObra: 0,
      descripcion: 'Juntas de hule vulcanizado sometidas a 9 bar de presión y agua a 93°C.',
      sintomaFalla: 'Goteo y fuga de café molido por los lados del portafiltro al realizar la extracción.'
    },
    {
      id: 'hp_descalcif_caldera',
      nombre: 'Servicio de descalcificación química antitsar de caldera y circuitos de cobre',
      tipo: 'preventivo',
      frecuenciaMeses: 6,
      costoPieza: 250,
      costoManoObra: 600,
      descripcion: 'Lavado con ácido cítrico grado alimenticio para remover sarro cálcico de termobloque y lanceta.',
      sintomaFalla: 'Lanceta de vapor con poca fuerza para texturizar leche; café tibio con notas agrias.'
    },
    {
      id: 'hp_cuchilla_ninja',
      nombre: 'Cuchilla de 6 aspas de acero inoxidable y acople de engrane para licuadora Ninja',
      tipo: 'desgaste',
      frecuenciaMeses: 6,
      costoPieza: 380,
      costoManoObra: 0,
      descripcion: 'Cuchillas trituradoras sometidas a impacto continuo de cubos de hielo para frappés.',
      sintomaFalla: 'Cuchilla sin filo que deja trozos duros de hielo; olor a hule quemado en el cople plástico.'
    },
    {
      id: 'hp_cuchilla_raspados',
      nombre: 'Cuchilla plana templada y baleros sellados de máquina de raspados industrial',
      tipo: 'desgaste',
      frecuenciaMeses: 6,
      costoPieza: 320,
      costoManoObra: 150,
      descripcion: 'Cuchilla ajustable de raspado de barra de hielo a 1400 RPM.',
      sintomaFalla: 'El hielo sale astillado grueso en vez de textura nieve suave que retenga el jarabe.'
    },
    {
      id: 'hp_termostato_crepera',
      nombre: 'Termostato bimetálico de regulación térmica (50-300°C) para crepera y marquesitera',
      tipo: 'correctivo',
      frecuenciaMeses: 12,
      costoPieza: 550,
      costoManoObra: 350,
      descripcion: 'Controlador de bulbo de contacto directo con la plancha de hierro colado.',
      sintomaFalla: 'La plancha no corta temperatura y quema la crepa, o no calienta lo suficiente.'
    },
    {
      id: 'hp_mant_refrigeracion',
      nombre: 'Mantenimiento preventivo de refrigerador/congelador (Limpieza de condensador y empaques)',
      tipo: 'preventivo',
      frecuenciaMeses: 12,
      costoPieza: 400,
      costoManoObra: 650,
      descripcion: 'Desempolvado de serpentín exterior, verificación de sellado magnético y gas R134a/R600a.',
      sintomaFalla: 'Compresor caliente que no descansa, escarcha en evaporador y pérdida de temperatura fría.'
    }
  ],

  // 7. Cómputo Mostrador, TPV, CCTV y Redes
  computo_redes: [
    {
      id: 'pc_ups_baterias',
      nombre: 'Batería sellada de plomo-ácido 12V 9Ah para regulador de voltaje / No-Break UPS',
      tipo: 'desgaste',
      frecuenciaMeses: 24,
      costoPieza: 650,
      costoManoObra: 100,
      descripcion: 'Batería de respaldo encargada de proteger la base de datos de tickets ante cortes súbitos.',
      sintomaFalla: 'Pitido continuo de alarma en el No-Break, la computadora se apaga de inmediato si se corta la luz.'
    },
    {
      id: 'pc_mantenimiento_preventivo',
      nombre: 'Servicio de soplado interno, lubricación de ventiladores y pasta térmica disipadora',
      tipo: 'preventivo',
      frecuenciaMeses: 12,
      costoPieza: 150,
      costoManoObra: 350,
      descripcion: 'Limpieza de pelusa y polvo del disipador de calor del CPU y fuente de poder.',
      sintomaFalla: 'Computadora lenta en horas pico de calor por sobrecalentamiento térmico (Thermal Throttling).'
    },
    {
      id: 'pc_fuente_poder',
      nombre: 'Fuente de poder certificada 80 Plus / Adaptador de corriente para TPV y DVR CCTV',
      tipo: 'correctivo',
      frecuenciaMeses: 36,
      costoPieza: 750,
      costoManoObra: 250,
      descripcion: 'Fuente conmutada sometida a trabajo continuo durante todo el año.',
      sintomaFalla: 'Reinicio repentino de la terminal en pleno cobro con tarjeta o cámaras parpadeando.'
    }
  ]
};

/**
 * Determina la familia tecnológica de piezas recomendadas según el nombre y palabras clave del aparato
 */
export function detectarFamiliaPartes(aparato) {
  const texto = `${aparato.tipo || ''} ${aparato.modelo || ''} ${aparato.nombre || ''}`.toLowerCase();

  if (texto.includes('minisplit') || texto.includes('clima') || texto.includes('aire') || texto.includes('btu') || texto.includes('inverter')) {
    return 'clima_inverter';
  }
  if (texto.includes('bordador') || texto.includes('aemco') || texto.includes('melco') || texto.includes('brother')) {
    return 'bordadora_industrial';
  }
  if (texto.includes('overlock') || texto.includes('costur') || texto.includes('recta') || texto.includes('collareter') || texto.includes('juki') || texto.includes('siruba') || texto.includes('plancha de vapor') || texto.includes('cortadora')) {
    return 'costura_industrial';
  }
  if (texto.includes('xerox') || texto.includes('docucolor') || texto.includes('copiad') || texto.includes('impresora') || texto.includes('konica')) {
    return 'impresion_digital';
  }
  if (texto.includes('plotter') || texto.includes('sublima') || texto.includes('plancha 40x60') || texto.includes('láser') || texto.includes('laser') || texto.includes('tazas')) {
    return 'artes_graficas_taller';
  }
  if (texto.includes('creper') || texto.includes('marquesit') || texto.includes('ninja') || texto.includes('licuador') || texto.includes('cafeter') || texto.includes('espresso') || texto.includes('marzocco') || texto.includes('café') || texto.includes('cafe') || texto.includes('frapp') || texto.includes('waffle') || texto.includes('breville') || texto.includes('raspado') || texto.includes('refrigerador') || texto.includes('congelador')) {
    return 'cafeteria_restaurante';
  }
  return 'computo_redes';
}

/**
 * Genera la lista de piezas y componentes para un aparato si aún no tiene piezas personalizadas
 */
export function generarPiezasInicialesAparato(aparato) {
  const familia = detectarFamiliaPartes(aparato);
  const piezasBase = CATALOGO_PARTES_DEFECTO[familia] || CATALOGO_PARTES_DEFECTO.computo_redes;

  return piezasBase.map((p, idx) => ({
    id: `${p.id}_${aparato.id || 'eq'}_${idx}`,
    nombre: p.nombre,
    tipo: p.tipo,
    frecuenciaMeses: p.frecuenciaMeses,
    costoPieza: p.costoPieza,
    costoManoObra: p.costoManoObra,
    descripcion: p.descripcion,
    sintomaFalla: p.sintomaFalla
  }));
}

/**
 * Calcula todas las métricas de ciclo de vida, amortización de desgaste y mantenimiento para un equipo individual
 */
export function calcularMetricasEquipoCicloVida(aparato, piezasCustom = null) {
  const precioCompra = parseFloat(aparato.precio) || 10000;
  const vidaUtilAnios = Math.max(1, parseFloat(aparato.vidaUtil) || 8);
  const desgasteAnual = precioCompra / vidaUtilAnios;
  const desgasteMensual = desgasteAnual / 12;

  const piezas = piezasCustom || aparato.piezasYComponentes || generarPiezasInicialesAparato(aparato);

  let costoMantenimientoAnual = 0;
  let costoPreventivoAnual = 0;
  let costoRefaccionesAnual = 0;

  const piezasCalculadas = piezas.map(p => {
    const fMeses = Math.max(1, parseFloat(p.frecuenciaMeses) || 12);
    const vecesAlAnio = 12 / fMeses;
    const cPieza = parseFloat(p.costoPieza) || 0;
    const cManoObra = parseFloat(p.costoManoObra) || 0;
    const costoEvento = cPieza + cManoObra;
    const costoAnual = costoEvento * vecesAlAnio;
    const costoMensual = costoAnual / 12;

    costoMantenimientoAnual += costoAnual;
    if (p.tipo === 'preventivo') {
      costoPreventivoAnual += costoAnual;
    } else {
      costoRefaccionesAnual += costoAnual;
    }

    return {
      ...p,
      frecuenciaMeses: fMeses,
      costoPieza: cPieza,
      costoManoObra: cManoObra,
      costoEvento,
      vecesAlAnio,
      costoAnual,
      costoMensual
    };
  });

  const costoMantenimientoMensual = costoMantenimientoAnual / 12;
  const costoTotalCicloVidaAnual = desgasteAnual + costoMantenimientoAnual;
  const costoTotalCicloVidaMensual = costoTotalCicloVidaAnual / 12;

  return {
    id: aparato.id,
    nombre: aparato.tipo || aparato.nombre || 'Equipo Industrial',
    modelo: aparato.modelo || '',
    medidorId: aparato.medidorId || 'med_1',
    precioCompra,
    vidaUtilAnios,
    desgasteAnual,
    desgasteMensual,
    piezas: piezasCalculadas,
    numPiezas: piezasCalculadas.length,
    costoMantenimientoAnual,
    costoMantenimientoMensual,
    costoPreventivoAnual,
    costoRefaccionesAnual,
    costoTotalCicloVidaAnual,
    costoTotalCicloVidaMensual
  };
}

export const EQUIPOS_DEFAULT_POR_NEGOCIO = {
  imperia_uniformes: [
    { id: 'imp_1', tipo: 'Minisplit Inverter (Área 4x4 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, precio: 9500, vidaUtil: 8, medidorId: 'med_1' },
    { id: 'imp_2', tipo: 'Computadora de Mostrador y Pantalla (POS)', modelo: 'PC Mostrador TPV', watts: 250, precio: 14000, vidaUtil: 6, medidorId: 'med_1' },
    { id: 'imp_3', tipo: 'Terminal Bancaria Mercado Pago', modelo: 'Smart POS WiFi/4G', watts: 15, precio: 2500, vidaUtil: 4, medidorId: 'med_1' },
    { id: 'imp_4', tipo: 'Alumbrado LED Showroom Imperia', modelo: '10x Paneles LED 18W', watts: 180, precio: 4500, vidaUtil: 10, medidorId: 'med_1' },
    { id: 'imp_5', tipo: 'Sistema CCTV 16 Cámaras + DVR/NVR', modelo: 'DVR 16CH + 16 Domos', watts: 150, precio: 19000, vidaUtil: 6, medidorId: 'med_1' }
  ],
  papeleria_imperiarte: [
    { id: 'pap_1', tipo: 'Fotocopiadora / Impresora Xerox DocuColor', modelo: 'DocuColor Láser Color', watts: 1500, precio: 55000, vidaUtil: 8, medidorId: 'med_2' },
    { id: 'pap_2', tipo: 'Minisplit Inverter 1.5 TR (18,000 BTU - 220V)', modelo: '1.5 TR (18,000 BTU)', watts: 1700, precio: 13500, vidaUtil: 8, medidorId: 'med_2' },
    { id: 'pap_3', tipo: 'Computadora AIO TPV (All-in-One)', modelo: 'AIO 21.5" TPV', watts: 180, precio: 15000, vidaUtil: 6, medidorId: 'med_2' },
    { id: 'pap_4', tipo: 'Alumbrado LED Papelería (4 Luminarias)', modelo: '4x Tubos LED 18W', watts: 72, precio: 1900, vidaUtil: 10, medidorId: 'med_2' }
  ],
  hawaiian_paradise: [
    { id: 'hp_andamar_c1', tipo: 'Alumbrado general LED', modelo: 'Luminarias LED 135W', watts: 135, precio: 2800, vidaUtil: 8, medidorId: 'med_3' },
    { id: 'hp_andamar_c2', tipo: 'TPV / Caja y punto de venta', modelo: 'Terminal Punto de Venta', watts: 280, precio: 12000, vidaUtil: 6, medidorId: 'med_3' },
    { id: 'hp_andamar_c3', tipo: 'Refrigerador 11 pies', modelo: 'Refrigerador Vertical Inverter', watts: 310, precio: 11000, vidaUtil: 10, medidorId: 'med_3' },
    { id: 'hp_andamar_c4', tipo: 'Crepera eléctrica industrial', modelo: 'Italina CREPE-40', watts: 3000, precio: 16500, vidaUtil: 8, medidorId: 'med_3' },
    { id: 'hp_andamar_c5', tipo: 'Cafetera Expresso Gaggia Ruby Pro', modelo: 'Ruby Pro 1 Grupo (220V)', watts: 2640, precio: 32000, vidaUtil: 8, medidorId: 'med_3' },
    { id: 'hp_andamar_c6', tipo: 'Iluminación exterior / rótulo LED', modelo: 'Rótulo Exterior LED', watts: 16, precio: 1500, vidaUtil: 10, medidorId: 'med_3' },
    { id: 'hp_andamar_c7', tipo: 'Congelador Horizontal 5ft³', modelo: 'CHM5BPLD / Mabe', watts: 115, precio: 5200, vidaUtil: 10, medidorId: 'med_3' },
    { id: 'hp_andamar_c8', tipo: 'Licuadora profesional de Alta Potencia', modelo: 'U2000 / Ultrachef', watts: 2000, precio: 2800, vidaUtil: 5, medidorId: 'med_3' },
    { id: 'hp_andamar_c9', tipo: 'Maquina de Marquesitas Electrica', modelo: 'Conesa Eléctrica 1.3 kW', watts: 1300, precio: 13370, vidaUtil: 5, medidorId: 'med_3' },
    { id: 'hp_andamar_c10', tipo: 'Calentador de Sopa Comercial (Baño María)', modelo: 'M-315 / VEVOR', watts: 1200, precio: 4274, vidaUtil: 6, medidorId: 'med_3' },
    { id: 'hp_andamar_c11', tipo: 'Hervidor de Agua Eléctrico (Tetera)', modelo: 'RegalBasics 1.8L', watts: 900, precio: 250, vidaUtil: 3, medidorId: 'med_3' },
    { id: 'hp_andamar_c12', tipo: 'Olla de Presión Eléctrica Multifuncional', modelo: '34508 / Hamilton Beach', watts: 1200, precio: 2519, vidaUtil: 6, medidorId: 'med_3' },
    { id: 'hp_andamar_c13', tipo: 'Maquina de Raspados', modelo: 'HSD100G / PAISE', watts: 370, precio: 4500, vidaUtil: 10, medidorId: 'med_3' },
    { id: 'hp_andamar_c14', tipo: 'Dispensador Eléctrico Automático', modelo: 'PR352729 / Comfeè', watts: 30, precio: 564, vidaUtil: 4, medidorId: 'med_3' },
    { id: 'hp_andamar_c15', tipo: 'Smart TV LED 70" 4K UHD', modelo: 'DAW70UR / Daewoo', watts: 220, precio: 9999, vidaUtil: 7, medidorId: 'med_3' },
    { id: 'hp_andamar_c16', tipo: 'Minisplit Inverter 18k BTU #1 (Área Clientes)', modelo: '1.5 TR (18,000 BTU - 220V) #1', watts: 1700, precio: 13500, vidaUtil: 8, medidorId: 'med_3' },
    { id: 'hp_andamar_c17', tipo: 'Minisplit Inverter 18k BTU #2 (Área Cocina / Refuerzo)', modelo: '1.5 TR (18,000 BTU - 220V) #2', watts: 1700, precio: 13500, vidaUtil: 8, medidorId: 'med_3' }
  ],
  bordados_veracruz: [
    { id: 'bv_1', tipo: 'Bordadora Industrial AEMCO 220V Dahao (4 Cabezas)', modelo: 'AEMCO Cama Plana 4 Cabezas 220V', watts: 1800, precio: 95000, vidaUtil: 15, medidorId: 'med_4' },
    { id: 'bv_2', tipo: 'Bordadora Industrial Melco EMC 6/4 (4 Cabezas, 6 Hilos)', modelo: 'Melco EMC 6/4 (4 Cabezas)', watts: 1500, precio: 85000, vidaUtil: 15, medidorId: 'med_4' },
    { id: 'bv_3', tipo: 'Alumbrado LED Bordados (4 Luminarias)', modelo: '4x Lámparas LED 18W', watts: 72, precio: 1900, vidaUtil: 10, medidorId: 'med_4' },
    { id: 'bv_4', tipo: 'Minisplit Inverter 1.5 TR (18,000 BTU - 220V)', modelo: '1.5 TR Inverter (18,000 BTU)', watts: 1700, precio: 13500, vidaUtil: 8, medidorId: 'med_4' }
  ],
  taller_costura: [
    { id: 'tc_1', tipo: '2 Máquinas de Coser Recta Industrial Singer', modelo: '2x Singer Recta Industrial (550W c/u)', watts: 1100, precio: 33000, vidaUtil: 12, medidorId: 'med_5' },
    { id: 'tc_2', tipo: 'Máquina Overlock Industrial (5 Hilos)', modelo: 'Overlock 5 Hilos (550W)', watts: 550, precio: 18500, vidaUtil: 12, medidorId: 'med_5' },
    { id: 'tc_3', tipo: 'Máquina Collaretera Industrial Singer', modelo: 'Collaretera Singer Industrial (550W)', watts: 550, precio: 22500, vidaUtil: 12, medidorId: 'med_5' },
    { id: 'tc_4', tipo: 'Cortadora de Tela Industrial de Disco', modelo: 'Cortadora Octagonal 4"', watts: 300, precio: 4800, vidaUtil: 8, medidorId: 'med_5' },
    { id: 'tc_5', tipo: 'Plancha de Vapor Industrial con Caldera', modelo: 'Caldera de Vapor 1.6kW', watts: 1600, precio: 11000, vidaUtil: 8, medidorId: 'med_5' },
    { id: 'tc_6', tipo: 'Minisplit Inverter Taller de Costura (220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, precio: 9500, vidaUtil: 8, medidorId: 'med_5' },
    { id: 'tc_7', tipo: 'Alumbrado LED Taller de Costura (6 Luminarias)', modelo: '6x Paneles LED 18W', watts: 108, precio: 2800, vidaUtil: 10, medidorId: 'med_5' }
  ],
  taller_publi_imperia: [
    { id: 'pi_1', tipo: 'Impresora de Sublimación Epson L120', modelo: 'Epson L120 Sublimación', watts: 20, precio: 4500, vidaUtil: 5, medidorId: 'med_6' },
    { id: 'pi_2', tipo: 'Plancha de Sublimación de Tazas (Combo 3 en 1)', modelo: 'Cabezal Cilíndrico Intercambiable 11/15oz', watts: 350, precio: 3500, vidaUtil: 5, medidorId: 'med_6' },
    { id: 'pi_3', tipo: 'Plancha de Sublimación y DTF Plana 28x32 cm (Combo 3 en 1)', modelo: 'Prensa Térmica Plana 1000W Intercambiable', watts: 1000, precio: 7500, vidaUtil: 6, medidorId: 'med_6' },
    { id: 'pi_4', tipo: 'Plancha de Sublimación para Gorras (Combo 3 en 1)', modelo: 'Cabezal Curvo Gorras 400W Intercambiable', watts: 400, precio: 4200, vidaUtil: 5, medidorId: 'med_6' },
    { id: 'pi_mini_ront', tipo: 'Miniplancha Térmica HTV RONT (Tallas y Etiquetas DTF)', modelo: 'Mi1 120VAC 6x10cm (250W)', watts: 250, precio: 1200, vidaUtil: 6, medidorId: 'med_6' },
    { id: 'pi_5', tipo: 'Bordadora Computarizada Brother PE770', modelo: 'Brother PE770 1 Cabeza', watts: 75, precio: 16000, vidaUtil: 7, medidorId: 'med_6' },
    { id: 'pi_6', tipo: 'Cortadora de Vinil Brother ScanNCut', modelo: 'ScanNCut SDX125', watts: 50, precio: 12500, vidaUtil: 6, medidorId: 'med_6' },
    { id: 'pi_7', tipo: 'Cortadora y Grabadora Láser Atomstack A20', modelo: 'Atomstack A20 Pro 20W Óptico', watts: 120, precio: 21000, vidaUtil: 5, medidorId: 'med_6' },
    { id: 'pi_8', tipo: 'Reveladora de Serigrafía (8 Tubos Fluorescentes 32W)', modelo: 'Mesa Insoladora 8x32W (256W)', watts: 256, precio: 8500, vidaUtil: 8, medidorId: 'med_6' },
    { id: 'pi_9', tipo: 'Plancha de Calor Serigrafía 80x100 cm (220V)', modelo: 'Prensa Gran Formato 80x100 3.6kW', watts: 3600, precio: 48000, vidaUtil: 10, medidorId: 'med_6' },
    { id: 'pi_10', tipo: 'PC Diseño Gráfico + Monitor de Alta Gama', modelo: 'Workstation i7 + GPU', watts: 450, precio: 26000, vidaUtil: 6, medidorId: 'med_6' },
    { id: 'pi_11', tipo: 'Minisplit Inverter Publi-Imperia (220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, precio: 9500, vidaUtil: 8, medidorId: 'med_6' },
    { id: 'pi_12', tipo: 'Alumbrado LED Taller Publi-Imperia (7 Luminarias)', modelo: '7x Lámparas LED 18W', watts: 126, precio: 3200, vidaUtil: 10, medidorId: 'med_6' }
  ],
  oficinas_consorcio: [
    { id: 'oc_1', tipo: 'Computadora Portátil (Laptop)', modelo: 'Laptop Directiva', watts: 65, precio: 16000, vidaUtil: 5, medidorId: 'med_6' },
    { id: 'oc_2', tipo: 'Minisplit Inverter (Área 4x4 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, precio: 9500, vidaUtil: 8, medidorId: 'med_6' },
    { id: 'oc_3', tipo: 'Televisión Smart LED 32 Pulgadas', modelo: 'Smart TV 32" Juntas', watts: 55, precio: 4200, vidaUtil: 7, medidorId: 'med_6' },
    { id: 'oc_4', tipo: 'Alumbrado LED Oficina Consorcio (4 Luminarias)', modelo: '4x Tubos LED 18W', watts: 72, precio: 1900, vidaUtil: 10, medidorId: 'med_6' },
    { id: 'oc_5', tipo: 'Módem de Internet & Router WiFi', modelo: 'Router WiFi Dual-Band', watts: 25, precio: 2500, vidaUtil: 6, medidorId: 'med_6' }
  ]
};

/**
 * Calcula el presupuesto integral de ciclo de vida y costos operativos de mantenimiento para una tienda/negocio
 */
export function calcularCicloVidaNegocio({
  negocioId,
  aparatos = [],
  overridesPiezas = {} // { [aparatoId]: [piezas] }
}) {
  // Filtrar aparatos de este negocio (o todos si es consorcio o negocio individual)
  const negocio = NEGOCIOS_CONFIG.find(n => n.id === negocioId);
  const medidorIdEsperado = negocio ? negocio.medidorIdConsorcio : null;

  let aparatosNegocio = (aparatos || []).filter(ap => {
    if (!medidorIdEsperado) return true;
    return ap.medidorId === medidorIdEsperado || (ap.tipo || '').toLowerCase().includes(negocio.prefijoConsorcio.toLowerCase());
  });

  // Si no hay aparatos pasados o no se encontraron, utilizar el catálogo de maquinaria industrial realista por defecto
  if (aparatosNegocio.length === 0 && EQUIPOS_DEFAULT_POR_NEGOCIO[negocioId]) {
    aparatosNegocio = EQUIPOS_DEFAULT_POR_NEGOCIO[negocioId];
  }

  const equiposAnalizados = aparatosNegocio.map(ap => {
    const custom = overridesPiezas[ap.id] || null;
    return calcularMetricasEquipoCicloVida(ap, custom);
  });

  let totalInversionActivos = 0;
  let totalDesgasteAnual = 0;
  let totalMantenimientoAnual = 0;
  let totalPreventivoAnual = 0;
  let totalRefaccionesAnual = 0;

  equiposAnalizados.forEach(eq => {
    totalInversionActivos += eq.precioCompra;
    totalDesgasteAnual += eq.desgasteAnual;
    totalMantenimientoAnual += eq.costoMantenimientoAnual;
    totalPreventivoAnual += eq.costoPreventivoAnual;
    totalRefaccionesAnual += eq.costoRefaccionesAnual;
  });

  const totalPresupuestoAnual = totalDesgasteAnual + totalMantenimientoAnual;
  const gastoMantenimientoMensual = totalMantenimientoAnual / 12;
  const reservaDesgasteMensual = totalDesgasteAnual / 12;
  const costoOperativoTotalMensual = totalPresupuestoAnual / 12;

  return {
    negocioId,
    negocio,
    numEquipos: equiposAnalizados.length,
    equipos: equiposAnalizados,
    resumenFinanciero: {
      totalInversionActivos,
      inversionTotalCapEx: totalInversionActivos,
      totalDesgasteAnual,
      reservaDesgasteAnual: totalDesgasteAnual,
      totalMantenimientoAnual,
      gastoMantenimientoAnual: totalMantenimientoAnual,
      totalPreventivoAnual,
      totalRefaccionesAnual,
      totalPresupuestoAnual,
      gastoMantenimientoMensual,
      reservaDesgasteMensual,
      costoOperativoTotalMensual
    }
  };
}
