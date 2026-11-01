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
    // -----------------------------------------------------------------------
    // 1. GASTRONOMÍA & CHEF (Estilo Permachef propio, alta calidad más económico)
    // -----------------------------------------------------------------------
    {
      id: 'tc_filipina_chef',
      nombre: 'Confección Filipina de Chef Ejecutiva (Línea Gourmet)',
      categoria: 'Ropa de Chef & Gastronomía',
      unidad: 'filipina',
      precioVenta: 480.00,
      costoMateriales: 160.00,
      detalleMateriales: 'Gabardina fresca de alta densidad, vivos en contraste, botones cruzados y entretela',
      costoManoObra: 110.00,
      detalleManoObra: 'Corte sastre, armado cuello mao en recta y pespuntes de refuerzo en overlock',
      costoLuzUnitario: 0.48,
      pesoEnMix: 25
    },
    {
      id: 'tc_mandil_chef',
      nombre: 'Confección Mandil de Pechera Chef / Barista (Peto)',
      categoria: 'Ropa de Chef & Gastronomía',
      unidad: 'mandil',
      precioVenta: 240.00,
      costoMateriales: 85.00,
      detalleMateriales: 'Gabardina pesada o mezclilla, cintas cruzadas ajustables y remaches metálicos',
      costoManoObra: 55.00,
      detalleManoObra: 'Corte de trapecio, dobladillado y colocación de ojillos/herrajes',
      costoLuzUnitario: 0.25,
      pesoEnMix: 30
    },
    {
      id: 'tc_pantalon_cocina',
      nombre: 'Confección Pantalón de Cocina / Chef (Cargo & Jareta)',
      categoria: 'Ropa de Chef & Gastronomía',
      unidad: 'pantalón',
      precioVenta: 350.00,
      costoMateriales: 125.00,
      detalleMateriales: 'Gabardina de algodón transpirable, elástico ancho reforzado, jareta y bolsas cargo',
      costoManoObra: 85.00,
      detalleManoObra: 'Ensamble de tiro en Overlock 5h, presillas en recta y dobladillos',
      costoLuzUnitario: 0.38,
      pesoEnMix: 25
    },
    {
      id: 'tc_gorro_chef',
      nombre: 'Confección Gorro de Chef / Bandana de Cocina',
      categoria: 'Ropa de Chef & Gastronomía',
      unidad: 'pieza',
      precioVenta: 95.00,
      costoMateriales: 35.00,
      detalleMateriales: 'Popelina/gabardina blanca y negra, elástico trasero y bies',
      costoManoObra: 25.00,
      detalleManoObra: 'Plisado circular o ensamble de bandana',
      costoLuzUnitario: 0.15,
      pesoEnMix: 20
    },

    // -----------------------------------------------------------------------
    // 2. SALUD Y MEDICINA ESPECIALIZADA (Doctores, Enfermeras, Cirujanos, etc.)
    // -----------------------------------------------------------------------
    {
      id: 'tc_scrub_doctor',
      nombre: 'Confección Scrub Médico Clínico Doctor (Antifluidos Stretch)',
      categoria: 'Salud & Medicina Especializada',
      unidad: 'juego',
      precioVenta: 520.00,
      costoMateriales: 190.00,
      detalleMateriales: 'Tela antifluidos repelente de líquidos con spandex stretch, elástico y jareta',
      costoManoObra: 130.00,
      detalleManoObra: 'Armado completo filipina cuello V con bolsas utilitarias y pantalón jogger',
      costoLuzUnitario: 0.55,
      pesoEnMix: 35
    },
    {
      id: 'tc_uniforme_enfermera',
      nombre: 'Confección Uniforme de Enfermería (Reglamentario Blanco)',
      categoria: 'Salud & Medicina Especializada',
      unidad: 'juego',
      precioVenta: 490.00,
      costoMateriales: 175.00,
      detalleMateriales: 'Tela tergal / gabardina médica blanca de alta opacidad, vivos institucionales',
      costoManoObra: 120.00,
      detalleManoObra: 'Corte princesa silueta dama o recto caballero en Overlock y pespunte Singer',
      costoLuzUnitario: 0.50,
      pesoEnMix: 30
    },
    {
      id: 'tc_pijama_quirurgica',
      nombre: 'Confección Pijama Quirúrgica Cirujano (Autoclave)',
      categoria: 'Salud & Medicina Especializada',
      unidad: 'juego',
      precioVenta: 460.00,
      costoMateriales: 160.00,
      detalleMateriales: 'Tela algodón/poliéster resistente a esterilización en autoclave (verde, azul plomizo, vino)',
      costoManoObra: 110.00,
      detalleManoObra: 'Costuras reforzadas con doble pespunte para uso rudo hospitalario',
      costoLuzUnitario: 0.48,
      pesoEnMix: 25
    },
    {
      id: 'tc_filipina_veterinaria',
      nombre: 'Confección Filipina Veterinaria (Repelente de Pelo y Fluidos)',
      categoria: 'Salud & Medicina Especializada',
      unidad: 'filipina',
      precioVenta: 360.00,
      costoMateriales: 135.00,
      detalleMateriales: 'Microfibra antifluidos de alta densidad con repelente estático de pelo de mascotas',
      costoManoObra: 90.00,
      detalleManoObra: 'Filipina con múltiples bolsillos reforzados para instrumental veterinario',
      costoLuzUnitario: 0.42,
      pesoEnMix: 15
    },
    {
      id: 'tc_filipina_pediatrica',
      nombre: 'Confección Filipina Pediátrica (Estampados Infantiles)',
      categoria: 'Salud & Medicina Especializada',
      unidad: 'filipina',
      precioVenta: 360.00,
      costoMateriales: 135.00,
      detalleMateriales: 'Tela antifluidos suave con estampados coloridos amigables para niños',
      costoManoObra: 90.00,
      detalleManoObra: 'Corte y confección con acabados suaves que no irritan',
      costoLuzUnitario: 0.42,
      pesoEnMix: 15
    },
    {
      id: 'tc_bata_laboratorio',
      nombre: 'Confección Bata Médica / Laboratorio Gabardina Pesada',
      categoria: 'Salud & Medicina Especializada',
      unidad: 'bata',
      precioVenta: 390.00,
      costoMateriales: 150.00,
      detalleMateriales: 'Gabardina blanca pesada (1.8m), broches metálicos inoxidables, entretela solapa',
      costoManoObra: 100.00,
      detalleManoObra: 'Corte largo, cuello solapa sastre, aberturas laterales y cinturón trasero',
      costoLuzUnitario: 0.48,
      pesoEnMix: 20
    },

    // -----------------------------------------------------------------------
    // 3. HOSPITALIDAD: HOTELES Y RESTAURANTES
    // -----------------------------------------------------------------------
    {
      id: 'tc_filipina_mesero',
      nombre: 'Confección Filipina / Camisa de Mesero (Línea Salón)',
      categoria: 'Hoteles & Restaurantes',
      unidad: 'pieza',
      precioVenta: 340.00,
      costoMateriales: 120.00,
      detalleMateriales: 'Gabardina liviana / popelina de gala (negra, vino, blanca), botones ocultos',
      costoManoObra: 85.00,
      detalleManoObra: 'Cuello mao o clásico, botonadura cubierta y puños reforzados',
      costoLuzUnitario: 0.38,
      pesoEnMix: 20
    },
    {
      id: 'tc_bata_camarista',
      nombre: 'Confección Bata / Uniforme de Camarista y Ama de Llaves',
      categoria: 'Hoteles & Restaurantes',
      unidad: 'juego',
      precioVenta: 320.00,
      costoMateriales: 115.00,
      detalleMateriales: 'Tergal fácil planchado con vivos en solapa y bolsas frontales profundas',
      costoManoObra: 80.00,
      detalleManoObra: 'Bata abotonada al frente con mangas amplias para maniobra de limpieza',
      costoLuzUnitario: 0.35,
      pesoEnMix: 18
    },
    {
      id: 'tc_mandil_mesero',
      nombre: 'Confección Mandil Bistro / Cintura para Mesero',
      categoria: 'Hoteles & Restaurantes',
      unidad: 'mandil',
      precioVenta: 140.00,
      costoMateriales: 50.00,
      detalleMateriales: 'Gabardina negra de uso rudo con 3 divisiones de bolsa para comanda y TPV',
      costoManoObra: 35.00,
      detalleManoObra: 'Corte rectangular, bastillas y pespuntes de refuerzo en esquinas',
      costoLuzUnitario: 0.20,
      pesoEnMix: 25
    },

    // -----------------------------------------------------------------------
    // 4. UNIFORMES ESCOLARES
    // -----------------------------------------------------------------------
    {
      id: 'tc_pantalon_escolar',
      nombre: 'Confección Pantalón / Falda Escolar de Gabardina',
      categoria: 'Uniformes Escolares',
      unidad: 'pieza',
      precioVenta: 290.00,
      costoMateriales: 110.00,
      detalleMateriales: 'Gabardina escolar resistente al desgaste (azul marino, gris, café), cierre y pretina',
      costoManoObra: 75.00,
      detalleManoObra: 'Corte de disco por tallas, cerrado en overlock y pretina formal en recta',
      costoLuzUnitario: 0.35,
      pesoEnMix: 25
    },
    {
      id: 'tc_polo_escolar',
      nombre: 'Confección Playera Polo Escolar Institucional (Collaretera)',
      categoria: 'Uniformes Escolares',
      unidad: 'playera',
      precioVenta: 220.00,
      costoMateriales: 90.00,
      detalleMateriales: 'Piqué stretch escolar, cuello y puños tejidos con franjas a juego, botones',
      costoManoObra: 55.00,
      detalleManoObra: 'Aletilla en recta, ensamble en overlock y dobladillo en Collaretera Singer',
      costoLuzUnitario: 0.35,
      pesoEnMix: 20
    },

    // -----------------------------------------------------------------------
    // 5. ROPA INDUSTRIAL Y TRABAJO RUDO (Camisolas & Overoles)
    // -----------------------------------------------------------------------
    {
      id: 'tc_camisola_industrial',
      nombre: 'Confección Camisola Industrial de Gabardina Pesada',
      categoria: 'Ropa Industrial & Trabajo Rudo',
      unidad: 'camisola',
      precioVenta: 360.00,
      costoMateriales: 135.00,
      detalleMateriales: 'Gabardina 100% algodón o 60/40 de 8.5 oz uso rudo, 2 bolsas con cartera',
      costoManoObra: 90.00,
      detalleManoObra: 'Costuras reforzadas de doble aguja, cuello sastre y ojales industriales',
      costoLuzUnitario: 0.45,
      pesoEnMix: 25
    },
    {
      id: 'tc_camisola_reflejante',
      nombre: 'Confección Camisola Industrial con Cintas Reflejantes (STPS)',
      categoria: 'Ropa Industrial & Trabajo Rudo',
      unidad: 'camisola',
      precioVenta: 440.00,
      costoMateriales: 175.00,
      detalleMateriales: 'Gabardina industrial + cintas reflejantes de alta visibilidad 2" plata/verde norma STPS',
      costoManoObra: 105.00,
      detalleManoObra: 'Colocación precisa de cintas en pecho, espalda y brazos antes de cerrar prenda',
      costoLuzUnitario: 0.50,
      pesoEnMix: 30
    },
    {
      id: 'tc_overol_industrial',
      nombre: 'Confección Overol Industrial de 1 Pieza (Uso Rudo Contratista)',
      categoria: 'Ropa Industrial & Trabajo Rudo',
      unidad: 'overol',
      precioVenta: 580.00,
      costoMateriales: 225.00,
      detalleMateriales: 'Gabardina 100% algodón 9 oz (3.2m), cierre metálico doble acción, elástico trasero y bolsas herramientas',
      costoManoObra: 140.00,
      detalleManoObra: 'Ensamble de tiro largo, pegado de cierre con solapa, colocación de bolsas traseras y presillas',
      costoLuzUnitario: 0.65,
      pesoEnMix: 20
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
  // 5. PAPELERÍA IMPERIARTE (Papelería Especializada, Cartulinas Pinto & Copiado)
  // =========================================================================
  papeleria_imperiarte: [
    {
      id: 'pap_bateria_2mm',
      nombre: 'Cartón Batería 2mm (Pliego 70x100 Pinto Battery Soul)',
      categoria: 'Maquetería & Arquitectura',
      unidad: 'pliego',
      precioVenta: 65.00,
      costoMateriales: 28.00,
      detalleMateriales: 'Pliego pulpa prensada de alta densidad Pinto, corte limpio y bisel a 45°',
      costoManoObra: 3.00,
      detalleManoObra: 'Despacho, corte a medida o enrollado con liga',
      costoLuzUnitario: 0.05,
      pesoEnMix: 15
    },
    {
      id: 'pap_bateria_1_3mm',
      nombre: 'Cartón Batería 1mm / 3mm (Pinto Battery Soul)',
      categoria: 'Maquetería & Arquitectura',
      unidad: 'pliego',
      precioVenta: 75.00,
      costoMateriales: 34.00,
      detalleMateriales: 'Pliego batería calibre fino 1mm o grueso estructural 3mm',
      costoManoObra: 3.00,
      detalleManoObra: 'Atención de mostrador y refilado básico',
      costoLuzUnitario: 0.05,
      pesoEnMix: 10
    },
    {
      id: 'pap_foamboard_5mm',
      nombre: 'Foam Board Blanco / Negro 5mm (Cartón Espuma)',
      categoria: 'Maquetería & Arquitectura',
      unidad: 'pliego',
      precioVenta: 95.00,
      costoMateriales: 45.00,
      detalleMateriales: 'Núcleo de poliestireno extruido con caras de papel satinado 70x100',
      costoManoObra: 4.00,
      detalleManoObra: 'Manipulación delicada y empaque protector',
      costoLuzUnitario: 0.05,
      pesoEnMix: 8
    },
    {
      id: 'pap_carton_gris',
      nombre: 'Cartón Gris / Caple Rígido de Estructura',
      categoria: 'Maquetería & Arquitectura',
      unidad: 'pliego',
      precioVenta: 45.00,
      costoMateriales: 18.00,
      detalleMateriales: 'Cartón prensado rígido para bases de maqueta y encuadernación',
      costoManoObra: 2.00,
      detalleManoObra: 'Corte o entrega',
      costoLuzUnitario: 0.05,
      pesoEnMix: 8
    },
    {
      id: 'pap_block_marquilla',
      nombre: 'Block Marquilla Pinto (Grande 54kg / 50 hojas)',
      categoria: 'Papeles de Arte & Boceto',
      unidad: 'block',
      precioVenta: 120.00,
      costoMateriales: 55.00,
      detalleMateriales: 'Block espiral/pegado papel marquilla 54kg blanco especial lápiz/tinta',
      costoManoObra: 5.00,
      detalleManoObra: 'Atención y exhibición',
      costoLuzUnitario: 0.05,
      pesoEnMix: 12
    },
    {
      id: 'pap_cartulina_marquilla',
      nombre: 'Cartulina Marquilla Pliego (50x65 cm Pinto)',
      categoria: 'Papeles de Arte & Boceto',
      unidad: 'pliego',
      precioVenta: 18.00,
      costoMateriales: 7.50,
      detalleMateriales: 'Pliego marquilla 54kg libre de ácido para dibujo técnico y artístico',
      costoManoObra: 1.50,
      detalleManoObra: 'Despacho enrollado',
      costoLuzUnitario: 0.02,
      pesoEnMix: 20
    },
    {
      id: 'pap_cartulina_ilustracion',
      nombre: 'Cartulina Ilustración Lisa de Alta Densidad',
      categoria: 'Papeles de Arte & Boceto',
      unidad: 'pliego',
      precioVenta: 42.00,
      costoMateriales: 19.00,
      detalleMateriales: 'Superficie satinada ultra suave para rotulador Touch/Copic y tinta china',
      costoManoObra: 2.00,
      detalleManoObra: 'Manejo en carpeta protectora',
      costoLuzUnitario: 0.02,
      pesoEnMix: 8
    },
    {
      id: 'pap_papel_albanene',
      nombre: 'Papel Albanene / Calca Vegetal 90g/110g Pliego',
      categoria: 'Papeles Técnicos',
      unidad: 'pliego',
      precioVenta: 25.00,
      costoMateriales: 10.50,
      detalleMateriales: 'Papel traslúcido 90g-110g para planos de arquitectura y calca de precisión',
      costoManoObra: 1.50,
      detalleManoObra: 'Enrollado con protector',
      costoLuzUnitario: 0.02,
      pesoEnMix: 12
    },
    {
      id: 'pap_papel_fabriano',
      nombre: 'Papel Fabriano / Acuarela 300g Grano Fino',
      categoria: 'Papeles Técnicos',
      unidad: 'pliego',
      precioVenta: 85.00,
      costoMateriales: 40.00,
      detalleMateriales: 'Papel 50-100% algodón 300g para acuarela, témpera y técnicas húmedas',
      costoManoObra: 3.00,
      detalleManoObra: 'Manejo plano cuidadoso',
      costoLuzUnitario: 0.02,
      pesoEnMix: 5
    },
    {
      id: 'pap_tiraje_tabloide',
      nombre: 'Impresión Tabloide Couché 300g / Opalina (DocuColor 12x18")',
      categoria: 'Impresión Digital',
      unidad: 'tabloide',
      precioVenta: 25.00,
      costoMateriales: 7.50,
      detalleMateriales: 'Cartulina couché brillante 300g u Opalina (12x18"), tóner color láser',
      costoManoObra: 2.50,
      detalleManoObra: 'Revisión digital RIP y refilado con guillotina',
      costoLuzUnitario: 0.15,
      pesoEnMix: 25
    },
    {
      id: 'pap_impresion_color',
      nombre: 'Impresión Láser Color Carta / Oficio',
      categoria: 'Impresión Digital',
      unidad: 'página',
      precioVenta: 8.00,
      costoMateriales: 2.20,
      detalleMateriales: 'Tóner CMYK micro-pulverizado + papel bond láser 90g alta blancura',
      costoManoObra: 1.00,
      detalleManoObra: 'Apertura de archivo e impresión',
      costoLuzUnitario: 0.06,
      pesoEnMix: 35
    },
    {
      id: 'pap_copia_bn',
      nombre: 'Fotocopia / Impresión B/N (DocuColor)',
      categoria: 'Copiado y Documentos',
      unidad: 'página',
      precioVenta: 2.00,
      costoMateriales: 0.45,
      detalleMateriales: 'Papel bond 75g blancura 95%, tóner negro Xerox DocuColor',
      costoManoObra: 0.30,
      detalleManoObra: 'Copiado y engrapado',
      costoLuzUnitario: 0.02,
      pesoEnMix: 50
    },
    {
      id: 'pap_escaneo_hd',
      nombre: 'Escaneo y Digitalización HD de Planos / Documentos',
      categoria: 'Servicios Digitales',
      unidad: 'escaneo',
      precioVenta: 10.00,
      costoMateriales: 0.50,
      detalleMateriales: 'Almacenamiento digital, envío por correo / carga USB y funda',
      costoManoObra: 2.50,
      detalleManoObra: 'Colocación en cristal de exposición, ajuste DPI y conversión PDF/TIFF',
      costoLuzUnitario: 0.08,
      pesoEnMix: 15
    },
    {
      id: 'pap_cutter_adhesivos',
      nombre: 'Herramientas de Corte & Adhesivos de Maqueta (Cutter / UHU)',
      categoria: 'Herramientas de Maquetería',
      unidad: 'pieza',
      precioVenta: 55.00,
      costoMateriales: 26.00,
      detalleMateriales: 'Cutter de precisión bisturí/X-Acto, pegamento UHU o silicón frío 100ml',
      costoManoObra: 3.00,
      detalleManoObra: 'Asesoría y entrega',
      costoLuzUnitario: 0.02,
      pesoEnMix: 10
    }
  ],

  // =========================================================================
  // 6. IMPERIA UNIFORMES (Showroom: Confección Propia, Marcas Premium & Mayoreo)
  // =========================================================================
  imperia_uniformes: [
    // -----------------------------------------------------------------------
    // LÍNEA A: CONFECCIÓN PROPIA (Taller de Costura Imperia - Transferencia Interna)
    // -----------------------------------------------------------------------
    {
      id: 'imp_uniforme_clinico_completo',
      nombre: 'Uniforme Clínico Doctor Completo (Filipina + Pantalón)',
      categoria: 'Confección Propia: Salud & Medicina',
      unidad: 'juego',
      precioVenta: 650.00,
      costoMateriales: 420.00, // Costo de transferencia interna de taller
      detalleMateriales: 'Juego de filipina antifluidos y pantalón médico con empaque de tienda',
      costoManoObra: 25.00,
      detalleManoObra: 'Atención y asesoría en vestidor, doblado y cobro',
      costoLuzUnitario: 0.15,
      pesoEnMix: 25
    },
    {
      id: 'imp_filipina_individual',
      nombre: 'Filipina Médica / Antifluidos Individual (Taller Imperia)',
      categoria: 'Confección Propia: Salud & Medicina',
      unidad: 'pieza',
      precioVenta: 420.00,
      costoMateriales: 245.00,
      detalleMateriales: 'Filipina antifluidos con bolsas utilitarias confeccionada en taller',
      costoManoObra: 15.00,
      detalleManoObra: 'Prueba en probador y ticket',
      costoLuzUnitario: 0.10,
      pesoEnMix: 20
    },
    {
      id: 'imp_pantalon_clinico',
      nombre: 'Pantalón Clínico / Quirúrgico Individual (Taller Imperia)',
      categoria: 'Confección Propia: Salud & Medicina',
      unidad: 'pieza',
      precioVenta: 380.00,
      costoMateriales: 220.00,
      detalleMateriales: 'Pantalón antifluidos/stretch con jareta y elástico ancho',
      costoManoObra: 15.00,
      detalleManoObra: 'Asesoría de talla y cobro en mostrador',
      costoLuzUnitario: 0.10,
      pesoEnMix: 15
    },
    {
      id: 'imp_pijama_quirurgica_propia',
      nombre: 'Pijama Quirúrgica Cirujano Autoclave (Taller Imperia)',
      categoria: 'Confección Propia: Salud & Medicina',
      unidad: 'juego',
      precioVenta: 560.00,
      costoMateriales: 340.00,
      detalleMateriales: 'Conjunto quirúrgico verde/azul hospitalario para esterilización',
      costoManoObra: 20.00,
      detalleManoObra: 'Atención y empaque estéril',
      costoLuzUnitario: 0.10,
      pesoEnMix: 15
    },
    {
      id: 'imp_filipina_veterinaria_pediatrica',
      nombre: 'Filipina Temática Veterinaria / Pediátrica (Taller Imperia)',
      categoria: 'Confección Propia: Salud & Medicina',
      unidad: 'pieza',
      precioVenta: 440.00,
      costoMateriales: 255.00,
      detalleMateriales: 'Microfibra estampada temática (mascotas/infantil) repelente',
      costoManoObra: 15.00,
      detalleManoObra: 'Atención mostrador y probador',
      costoLuzUnitario: 0.10,
      pesoEnMix: 12
    },
    {
      id: 'imp_bata_laboratorio',
      nombre: 'Bata de Laboratorio Gabardina Pesada (Taller Imperia)',
      categoria: 'Confección Propia: Salud & Medicina',
      unidad: 'bata',
      precioVenta: 450.00,
      costoMateriales: 265.00,
      detalleMateriales: 'Gabardina blanca pesada, solapa reforzada y broches metálicos',
      costoManoObra: 15.00,
      detalleManoObra: 'Atención y entrega en mostrador',
      costoLuzUnitario: 0.10,
      pesoEnMix: 15
    },
    {
      id: 'imp_chef_filipina_propia',
      nombre: 'Filipina de Chef Gourmet (Estilo Permachef - Taller Imperia)',
      categoria: 'Confección Propia: Gastronomía & Chef',
      unidad: 'filipina',
      precioVenta: 590.00,
      costoMateriales: 330.00,
      detalleMateriales: 'Gabardina fresca de alta gama, cuello mao y botonadura cruzada',
      costoManoObra: 20.00,
      detalleManoObra: 'Atención en probador y entrega',
      costoLuzUnitario: 0.10,
      pesoEnMix: 20
    },
    {
      id: 'imp_chef_mandil_propio',
      nombre: 'Mandil de Pechera Peto Chef / Barista (Taller Imperia)',
      categoria: 'Confección Propia: Gastronomía & Chef',
      unidad: 'mandil',
      precioVenta: 320.00,
      costoMateriales: 175.00,
      detalleMateriales: 'Gabardina pesada o mezclilla con cintas ajustables y remaches',
      costoManoObra: 10.00,
      detalleManoObra: 'Despacho de mostrador',
      costoLuzUnitario: 0.05,
      pesoEnMix: 25
    },
    {
      id: 'imp_chef_pantalon_propio',
      nombre: 'Pantalón de Cocina / Chef Cargo (Taller Imperia)',
      categoria: 'Confección Propia: Gastronomía & Chef',
      unidad: 'pantalón',
      precioVenta: 440.00,
      costoMateriales: 250.00,
      detalleMateriales: 'Gabardina transpirable con elástico reforzado y jareta',
      costoManoObra: 15.00,
      detalleManoObra: 'Prueba de talla y cobro',
      costoLuzUnitario: 0.05,
      pesoEnMix: 15
    },
    {
      id: 'imp_camisa_mesero_camarista',
      nombre: 'Uniforme de Servicio Mesero / Camarista (Taller Imperia)',
      categoria: 'Confección Propia: Hotelería & Restaurantes',
      unidad: 'pieza',
      precioVenta: 420.00,
      costoMateriales: 240.00,
      detalleMateriales: 'Filipina de gala para sala o bata hotelera fácil planchado',
      costoManoObra: 15.00,
      detalleManoObra: 'Atención y empaque para empresas',
      costoLuzUnitario: 0.10,
      pesoEnMix: 15
    },
    {
      id: 'imp_camisola_reflejante_propia',
      nombre: 'Camisola Industrial con Cintas Reflejantes (Taller Imperia)',
      categoria: 'Confección Propia: Ropa Industrial',
      unidad: 'camisola',
      precioVenta: 540.00,
      costoMateriales: 310.00,
      detalleMateriales: 'Gabardina ruda 8.5 oz con cintas reflejantes 2" norma STPS',
      costoManoObra: 20.00,
      detalleManoObra: 'Despacho y facturación corporativa',
      costoLuzUnitario: 0.10,
      pesoEnMix: 20
    },
    {
      id: 'imp_overol_industrial_propio',
      nombre: 'Overol Industrial de Trabajo 1 Pieza (Taller Imperia)',
      categoria: 'Confección Propia: Ropa Industrial',
      unidad: 'overol',
      precioVenta: 720.00,
      costoMateriales: 410.00,
      detalleMateriales: 'Gabardina pesada 100% algodón 9 oz con cierre metálico doble acción',
      costoManoObra: 25.00,
      detalleManoObra: 'Prueba de overol y entrega',
      costoLuzUnitario: 0.10,
      pesoEnMix: 15
    },
    {
      id: 'imp_escolar_pantalon_polo',
      nombre: 'Uniforme Escolar Completo (Pantalón/Falda + Polo Taller)',
      categoria: 'Confección Propia: Uniformes Escolares',
      unidad: 'juego',
      precioVenta: 490.00,
      costoMateriales: 280.00,
      detalleMateriales: 'Pantalón gabardina escolar + playera polo piqué con vivos tejidos',
      costoManoObra: 20.00,
      detalleManoObra: 'Atención temporada escolar',
      costoLuzUnitario: 0.10,
      pesoEnMix: 25
    },
    {
      id: 'imp_calzado_accesorios',
      nombre: 'Calzado Clínico / Accesorios de Protección',
      categoria: 'Complementos Clínicos',
      unidad: 'par',
      precioVenta: 550.00,
      costoMateriales: 350.00,
      detalleMateriales: 'Zuecos médicos antiderrapantes / cofias / calcetines de compresión',
      costoManoObra: 20.00,
      detalleManoObra: 'Prueba de calce y entrega',
      costoLuzUnitario: 0.05,
      pesoEnMix: 10
    },

    // -----------------------------------------------------------------------
    // LÍNEA B: MARCAS ESPECIALIZADAS DE PRESTIGIO (DISTRIBUCIÓN MAYORISTA)
    // -----------------------------------------------------------------------
    // 1. PERMACHEF GASTRONOMÍA
    {
      id: 'imp_permachef_filipina_original',
      nombre: 'Filipina de Chef PermaChef Original (Línea Cool Vent / Boutique)',
      categoria: 'Marca Especializada: PermaChef',
      unidad: 'filipina',
      precioVenta: 890.00,
      costoMateriales: 560.00, // Factura mayorista neta PermaChef
      detalleMateriales: 'Filipina oficial PermaChef con tecnología de ventilación y acabados de lujo',
      costoManoObra: 25.00,
      detalleManoObra: 'Asesoría de marca, prueba en probador y ticket',
      costoLuzUnitario: 0.10,
      pesoEnMix: 15
    },
    {
      id: 'imp_permachef_mandil_peto',
      nombre: 'Mandil de Peto Texano Mezclilla / Piel PermaChef',
      categoria: 'Marca Especializada: PermaChef',
      unidad: 'mandil',
      precioVenta: 480.00,
      costoMateriales: 295.00,
      detalleMateriales: 'Mandil gastronómico PermaChef con diseño texano y costuras reforzadas',
      costoManoObra: 10.00,
      detalleManoObra: 'Despacho de mostrador',
      costoLuzUnitario: 0.05,
      pesoEnMix: 15
    },
    {
      id: 'imp_permachef_pantalon_cargo',
      nombre: 'Pantalón de Chef PermaChef Cargo Pro',
      categoria: 'Marca Especializada: PermaChef',
      unidad: 'pantalón',
      precioVenta: 690.00,
      costoMateriales: 430.00,
      detalleMateriales: 'Pantalón oficial PermaChef para cocinas de alta temperatura',
      costoManoObra: 15.00,
      detalleManoObra: 'Prueba de talla y empaque oficial',
      costoLuzUnitario: 0.05,
      pesoEnMix: 12
    },

    // 2. CLINIK UNIFORMES MÉDICOS (BIO-MEDICAL STYLE)
    {
      id: 'imp_clinik_scrub_stretch',
      nombre: 'Set Quirúrgico Clinik Bio-Medical Stretch (Filipina + Jogger)',
      categoria: 'Marca Especializada: Clinik',
      unidad: 'juego',
      precioVenta: 920.00,
      costoMateriales: 580.00, // Factura mayorista Clinik
      detalleMateriales: 'Set completo oficial Clinik tela 4-way stretch antifluido importada',
      costoManoObra: 25.00,
      detalleManoObra: 'Asesoría de tallas boutique médica y probador',
      costoLuzUnitario: 0.10,
      pesoEnMix: 18
    },
    {
      id: 'imp_clinik_filipina_antifluido',
      nombre: 'Filipina Médica Clinik Antifluido Dama / Caballero',
      categoria: 'Marca Especializada: Clinik',
      unidad: 'pieza',
      precioVenta: 490.00,
      costoMateriales: 310.00,
      detalleMateriales: 'Filipina oficial Clinik corte princesa o sastre con tecnología médica',
      costoManoObra: 15.00,
      detalleManoObra: 'Atención en mostrador',
      costoLuzUnitario: 0.05,
      pesoEnMix: 15
    },
    {
      id: 'imp_clinik_jogger_pant',
      nombre: 'Pantalón Jogger Médico Clinik Multi-Bolsillos',
      categoria: 'Marca Especializada: Clinik',
      unidad: 'pieza',
      precioVenta: 560.00,
      costoMateriales: 350.00,
      detalleMateriales: 'Pantalón tipo jogger con resorte de tobillo y tela antifluido Clinik',
      costoManoObra: 15.00,
      detalleManoObra: 'Prueba y cobro',
      costoLuzUnitario: 0.05,
      pesoEnMix: 15
    },

    // 3. UNITAM UNIFORMES INDUSTRIALES (TRABAJO RUDO)
    {
      id: 'imp_unitam_overol_reflejante',
      nombre: 'Overol Industrial Unitam con Cintas Reflejantes (Contratista)',
      categoria: 'Marca Especializada: Unitam',
      unidad: 'overol',
      precioVenta: 760.00,
      costoMateriales: 480.00, // Factura mayorista Unitam
      detalleMateriales: 'Overol industrial Unitam gabardina 100% algodón pesada con cintas de seguridad',
      costoManoObra: 20.00,
      detalleManoObra: 'Despacho corporativo',
      costoLuzUnitario: 0.10,
      pesoEnMix: 12
    },
    {
      id: 'imp_unitam_camisola_industrial',
      nombre: 'Camisola Industrial Unitam Gabardina Pesada',
      categoria: 'Marca Especializada: Unitam',
      unidad: 'camisola',
      precioVenta: 430.00,
      costoMateriales: 270.00,
      detalleMateriales: 'Camisola de trabajo rudo Unitam 2 bolsas con cartera',
      costoManoObra: 15.00,
      detalleManoObra: 'Atención corporativa',
      costoLuzUnitario: 0.05,
      pesoEnMix: 15
    },
    {
      id: 'imp_unitam_pantalon_cargo',
      nombre: 'Pantalón Industrial Unitam Trabajo Rudo',
      categoria: 'Marca Especializada: Unitam',
      unidad: 'pantalón',
      precioVenta: 460.00,
      costoMateriales: 290.00,
      detalleMateriales: 'Pantalón de trabajo pesado Unitam gabardina reforzada',
      costoManoObra: 15.00,
      detalleManoObra: 'Prueba y despacho',
      costoLuzUnitario: 0.05,
      pesoEnMix: 12
    },

    // -----------------------------------------------------------------------
    // LÍNEA C: DISTRIBUCIÓN MULTIMARCA MAYOREO (COTEXSA / YAZBEK / EUROCOTTON)
    // -----------------------------------------------------------------------
    {
      id: 'imp_polo_50_50_blanca',
      nombre: 'Playera Polo 50/50 Piqué Blanca (Dama / Caballero)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 185.00,
      costoMateriales: 105.00, // Factura mayorista neta con IVA
      detalleMateriales: 'Polo piqué 50% algodón / 50% poliéster peinado (Cotexsa 6900 / Yazbek C0501)',
      costoManoObra: 8.00,
      detalleManoObra: 'Atención de mostrador, doblado y empaque',
      costoLuzUnitario: 0.05,
      pesoEnMix: 30
    },
    {
      id: 'imp_polo_50_50_color',
      nombre: 'Playera Polo 50/50 Piqué Color (Dama / Caballero)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 215.00,
      costoMateriales: 125.00,
      detalleMateriales: 'Polo piqué colores de línea (marino, negro, rojo, royal, etc.)',
      costoManoObra: 8.00,
      detalleManoObra: 'Atención de mostrador, doblado y empaque',
      costoLuzUnitario: 0.05,
      pesoEnMix: 35
    },
    {
      id: 'imp_polo_dryfit_blanca',
      nombre: 'Playera Polo 100% Poliéster Dry Fit Blanca (Dama / Cab.)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 165.00,
      costoMateriales: 82.00,
      detalleMateriales: 'Polo deportiva microfibra transpirable Dry Fit / sublimable Eurocotton / Yazbek',
      costoManoObra: 8.00,
      detalleManoObra: 'Atención y mostrador',
      costoLuzUnitario: 0.05,
      pesoEnMix: 25
    },
    {
      id: 'imp_polo_dryfit_color',
      nombre: 'Playera Polo 100% Poliéster Dry Fit Color (Dama / Cab.)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 175.00,
      costoMateriales: 92.00,
      detalleMateriales: 'Polo Dry Fit deportiva colores institucionales',
      costoManoObra: 8.00,
      detalleManoObra: 'Atención y mostrador',
      costoLuzUnitario: 0.05,
      pesoEnMix: 30
    },
    {
      id: 'imp_cuello_redondo_blanca',
      nombre: 'Playera Cuello Redondo Manga Corta Blanca (Dama / Cab.)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 120.00,
      costoMateriales: 69.00, // Factura mayorista Yazbek C0300 / Eurocotton
      detalleMateriales: '100% algodón peinado peso completo 180-200g blanco',
      costoManoObra: 5.00,
      detalleManoObra: 'Despacho de mostrador y cobro',
      costoLuzUnitario: 0.05,
      pesoEnMix: 40
    },
    {
      id: 'imp_cuello_redondo_color',
      nombre: 'Playera Cuello Redondo Manga Corta Color (Dama / Cab.)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 135.00,
      costoMateriales: 78.00,
      detalleMateriales: '100% algodón colores reactivos firmes (negro, marino, rojo, gris, etc.)',
      costoManoObra: 5.00,
      detalleManoObra: 'Despacho de mostrador y cobro',
      costoLuzUnitario: 0.05,
      pesoEnMix: 45
    },
    {
      id: 'imp_camisa_gabardina_blanca',
      nombre: 'Camisa / Blusa Gabardina Manga Larga Blanca (Dama / Cab.)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 410.00,
      costoMateriales: 235.00, // Cotexsa serie 6000CL/6000DL o Yazbek C0607
      detalleMateriales: 'Gabardina ejecutiva 50/50 ó 60/40 algodón/poliéster blanca manga larga',
      costoManoObra: 15.00,
      detalleManoObra: 'Asesoría de cuello/talla, prueba en probador y planchado ligero',
      costoLuzUnitario: 0.10,
      pesoEnMix: 20
    },
    {
      id: 'imp_camisa_gabardina_color',
      nombre: 'Camisa / Blusa Gabardina Manga Larga Color (Dama / Cab.)',
      categoria: 'Básicos Multimarca (Yazbek / Cotexsa / Eurocotton)',
      unidad: 'pieza',
      precioVenta: 445.00,
      costoMateriales: 255.00,
      detalleMateriales: 'Gabardina colores corporativos (marino, azul cielo, caqui, negro, gris)',
      costoManoObra: 15.00,
      detalleManoObra: 'Asesoría de cuello/talla, prueba en probador y planchado ligero',
      costoLuzUnitario: 0.10,
      pesoEnMix: 25
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
