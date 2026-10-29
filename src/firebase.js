import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  writeBatch
} from 'firebase/firestore';

// Configuración de Firebase
const viteEnv = import.meta?.env || {};
const firebaseConfig = {
  apiKey: viteEnv.VITE_FIREBASE_API_KEY,
  authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: viteEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: viteEnv.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let db = null;
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('⚡ Firebase Firestore inicializado correctamente.');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase. Usando fallback offline:', error);
    db = null;
  }
} else {
  console.warn('⚠️ Firebase no configurado. Usando local storage.');
}

// ==========================================
// PROYECTOS POR DEFECTO DEL CONSORCIO
// ==========================================
export const DEFAULT_PROJECTS_LIST = [
  { id: 'consorcio_general', nombre: 'Consorcio Gallegos González (Inmueble Completo)' },
  { id: 'imperia_uniformes', nombre: '1. Imperia Uniformes' },
  { id: 'papeleria_imperiarte', nombre: '2. Papelería ImperiArte' },
  { id: 'hawaiian_paradise', nombre: '3. Hawaiian Paradise Universidades' },
  { id: 'bordados_veracruz', nombre: '4. Bordados Veracruz' },
  { id: 'taller_costura', nombre: '5. Taller de Costura Imperia' },
  { id: 'taller_publi_imperia', nombre: '6. Artículos Promocionales Publi-Imperia' },
  { id: 'oficinas_consorcio', nombre: '7. Oficinas Consorcio Gallegos González' }
];

export const DEFAULT_PROJECT = DEFAULT_PROJECTS_LIST[0];
const STORAGE_PROJECTS_KEY = 'electrico_casa_proyectos_lista';

export const DEFAULT_MEDIDORES = [
  { id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }
];

export const DEFAULT_MEDIDORES_CONSORCIO = [
  { id: 'med_1', numero: 1, nombre: 'Imperia Uniformes', forzarTrifasico: false },
  { id: 'med_2', numero: 2, nombre: 'Papelería ImperiArte', forzarTrifasico: false },
  { id: 'med_3', numero: 3, nombre: 'Hawaiian Paradise Universidades', forzarTrifasico: false },
  { id: 'med_4', numero: 4, nombre: 'Bordados Veracruz', forzarTrifasico: false },
  { id: 'med_5', numero: 5, nombre: 'Taller de Costura Imperia', forzarTrifasico: false },
  { id: 'med_6', numero: 6, nombre: 'Publi-Imperia & Consorcio', forzarTrifasico: false }
];

// Generador de semillas de inventario para cada negocio
function generarSeedAparatos(proyectoId) {
  const formatearAp = (item) => {
    const baseVariant = {
      id: 'default',
      nombre: item.modelo || 'Modelo Base',
      watts: parseFloat(item.watts) || 0,
      fp: parseFloat(item.fp) || 1.0,
      precio: parseFloat(item.precio) || 0,
      mantenimiento: parseFloat(item.mantenimiento) || 0,
      vidaUtil: parseFloat(item.vidaUtil) || 8,
      horasAlta: parseFloat(item.horasAlta) || 8,
      horasReposo: parseFloat(item.horasReposo) || 0,
      consumoVariable: !!item.consumoVariable,
      durabilidadOption: item.durabilidadOption || 'estandar',
      tipoCarga: item.tipoCarga || 'monofasica',
      usarVaDirecto: item.fp === 1.0,
      criteriosDurabilidad: item.criteriosDurabilidad || '',
      criteriosMantenimiento: item.criteriosMantenimiento || ''
    };
    return {
      tuberiaDiametro: item.tuberiaDiametro || '16 mm (1/2")',
      tuberiaTipo: item.tuberiaTipo || 'Pared Delgada',
      longitudMetros: item.longitudMetros || 15,
      kaic: '10 kA',
      factorTemperatura: 1.0,
      factorAgrupamiento: 1.0,
      medidorId: item.medidorId || 'med_1',
      variantes: [baseVariant],
      activaVariantId: 'default',
      ...item
    };
  };

  const imperiaList = [
    { id: 'imp_1', tipo: 'Minisplit Inverter (Área 4x4 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'imp_2', tipo: 'Computadora de Mostrador y Pantalla (POS)', modelo: 'PC Mostrador TPV', watts: 300, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 14000, mantenimiento: 400, vidaUtil: 6 },
    { id: 'imp_3', tipo: 'Sistema CCTV 16 Cámaras + Grabadora DVR/NVR', modelo: 'DVR 16CH + 16 Domos', watts: 150, fp: 0.85, tipoCarga: 'monofasica', fase: 'B', horasAlta: 24, precio: 19000, mantenimiento: 800, vidaUtil: 6 },
    { id: 'imp_4', tipo: 'Alumbrado LED Showroom Imperia (10 Luminarias)', modelo: '10x Paneles LED 18W', watts: 180, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 10, precio: 4500, mantenimiento: 250, vidaUtil: 10 },
    { id: 'imp_5', tipo: 'Terminal Bancaria Mercado Pago', modelo: 'Smart POS WiFi/4G', watts: 15, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 2500, mantenimiento: 100, vidaUtil: 4 }
  ];

  const papeleriaList = [
    { id: 'pap_1', tipo: 'Computadora AIO TPV (All-in-One)', modelo: 'AIO 21.5" TPV', watts: 180, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 15000, mantenimiento: 350, vidaUtil: 6 },
    { id: 'pap_2', tipo: 'Minisplit Inverter (Área 2x6 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'pap_3', tipo: 'Alumbrado LED Papelería (4 Luminarias)', modelo: '4x Tubos LED 18W', watts: 72, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 10, precio: 1900, mantenimiento: 100, vidaUtil: 10 }
  ];

  const hawaiianList = [
    { id: 'hp_1', tipo: 'Computadora TPV', modelo: 'Touch POS Comandas', watts: 150, fp: 0.90, tipoCarga: 'monofasica', fase: 'B', horasAlta: 8, precio: 12000, mantenimiento: 350, vidaUtil: 6 },
    { id: 'hp_2', tipo: 'Licuadora Ninja Profesional (1200W)', modelo: 'Ninja Auto-iQ 1200W', watts: 1200, fp: 0.85, tipoCarga: 'monofasica', fase: 'B', horasAlta: 4, precio: 4500, mantenimiento: 500, vidaUtil: 5 },
    { id: 'hp_3', tipo: 'Máquina de Raspados Hawaiian Paradise', modelo: 'Raspadora Hielo Industrial', watts: 600, fp: 0.80, tipoCarga: 'monofasica', fase: 'A', horasAlta: 4, precio: 12000, mantenimiento: 900, vidaUtil: 7 },
    { id: 'hp_4', tipo: 'Crepera Eléctrica Profesional (1500W)', modelo: 'Plato 40cm Krampouz', watts: 1500, fp: 1.0, tipoCarga: 'monofasica', fase: 'A', horasAlta: 6, precio: 13500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'hp_5', tipo: 'Olla Calentadora de Esquites (7 Litros)', modelo: 'Baño María Eléctrico 7L', watts: 1200, fp: 1.0, tipoCarga: 'monofasica', fase: 'B', horasAlta: 8, precio: 6800, mantenimiento: 400, vidaUtil: 6 },
    { id: 'hp_6', tipo: 'Pantalla LCD / LED 42 Pulgadas', modelo: 'Menú Digital 42"', watts: 110, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 10, precio: 7500, mantenimiento: 200, vidaUtil: 7 },
    { id: 'hp_7', tipo: 'Congeladora Horizontal (11 Pies Cúbicos)', modelo: 'Congelador 11 ft³ Mabe', watts: 300, fp: 0.85, tipoCarga: 'monofasica', fase: 'A', horasAlta: 24, precio: 9500, mantenimiento: 600, vidaUtil: 10 },
    { id: 'hp_8', tipo: 'Refrigerador Vertical (11 Pies Cúbicos)', modelo: 'Refrigerador 11 ft³ Inverter', watts: 350, fp: 0.85, tipoCarga: 'monofasica', fase: 'B', horasAlta: 24, precio: 11000, mantenimiento: 600, vidaUtil: 10 },
    { id: 'hp_9', tipo: 'Alumbrado LED Hawaiian Paradise (16 Luminarias)', modelo: '16x Lámparas LED 18W', watts: 288, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 10, precio: 6800, mantenimiento: 350, vidaUtil: 10 },
    { id: 'hp_10', tipo: 'Cafetera Espresso de 1 Servicio', modelo: 'Bomba 15 Bar Espresso', watts: 1200, fp: 0.98, tipoCarga: 'monofasica', fase: 'A', horasAlta: 5, precio: 6500, mantenimiento: 600, vidaUtil: 5 }
  ];

  const bordadosList = [
    { id: 'bv_1', tipo: 'Bordadora Industrial 4 Cabezas (110V - Años 90)', modelo: '4 Cabezas Tajima/Barudan 110V', watts: 1500, fp: 0.82, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 75000, mantenimiento: 4500, vidaUtil: 15 },
    { id: 'bv_2', tipo: 'Bordadora Industrial 4 Cabezas (220V - Años 90)', modelo: '4 Cabezas Tajima/Barudan 220V', watts: 1800, fp: 0.85, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, precio: 85000, mantenimiento: 5000, vidaUtil: 15 },
    { id: 'bv_3', tipo: '2 Bordadoras Caseras Brother (1 Hilo)', modelo: '2x Brother PE800 (150W)', watts: 150, fp: 0.80, tipoCarga: 'monofasica', fase: 'B', horasAlta: 6, precio: 28000, mantenimiento: 1600, vidaUtil: 7 },
    { id: 'bv_4', tipo: 'Alumbrado LED Bordados (4 Luminarias)', modelo: '4x Lámparas LED 18W', watts: 72, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 8, precio: 1900, mantenimiento: 100, vidaUtil: 10 }
  ];

  const costuraList = [
    { id: 'tc_1', tipo: '2 Máquinas de Coser Recta Industrial', modelo: '2x Juki DDL-8700 (1100W)', watts: 1100, fp: 0.80, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 32000, mantenimiento: 2400, vidaUtil: 12 },
    { id: 'tc_2', tipo: 'Máquina Overlock Industrial (5 Hilos)', modelo: 'Overlock 5 Hilos (550W)', watts: 550, fp: 0.80, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 18500, mantenimiento: 1400, vidaUtil: 12 },
    { id: 'tc_3', tipo: 'Máquina Collaretera Industrial (5 Hilos)', modelo: 'Collaretera 5 Hilos (550W)', watts: 550, fp: 0.80, tipoCarga: 'monofasica', fase: 'B', horasAlta: 8, precio: 21000, mantenimiento: 1500, vidaUtil: 12 },
    { id: 'tc_4', tipo: 'Cortadora de Tela Industrial de Disco', modelo: 'Cortadora Octagonal 4"', watts: 300, fp: 0.75, tipoCarga: 'monofasica', fase: 'A', horasAlta: 3, precio: 4800, mantenimiento: 600, vidaUtil: 8 },
    { id: 'tc_5', tipo: 'Plancha de Vapor Industrial con Caldera', modelo: 'Caldera de Vapor 1.6kW', watts: 1600, fp: 1.0, tipoCarga: 'monofasica', fase: 'B', horasAlta: 6, precio: 11000, mantenimiento: 1000, vidaUtil: 8 },
    { id: 'tc_6', tipo: 'Minisplit Inverter (Área 4x3.5 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'tc_7', tipo: 'Alumbrado LED Taller de Costura (6 Luminarias)', modelo: '6x Paneles LED 18W', watts: 108, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 10, precio: 2800, mantenimiento: 150, vidaUtil: 10 }
  ];

  const publiList = [
    { id: 'pi_1', tipo: 'Plancha de Sublimación Plana (30x30 cm - 1000W)', modelo: 'Prensa Térmica 30x30', watts: 1000, fp: 1.0, tipoCarga: 'monofasica', fase: 'A', horasAlta: 5, precio: 7500, mantenimiento: 500, vidaUtil: 6 },
    { id: 'pi_2', tipo: 'Plancha Manual de Sublimación (10 cm)', modelo: 'Mini Prensa 10cm', watts: 400, fp: 1.0, tipoCarga: 'monofasica', fase: 'B', horasAlta: 4, precio: 2200, mantenimiento: 250, vidaUtil: 5 },
    { id: 'pi_3', tipo: 'Cortadora de Vinil Brother ScanNCut', modelo: 'ScanNCut SDX125', watts: 50, fp: 0.90, tipoCarga: 'monofasica', fase: 'B', horasAlta: 4, precio: 12500, mantenimiento: 400, vidaUtil: 6 },
    { id: 'pi_4', tipo: 'Grabadora Láser de Diodo (20W Óptico)', modelo: 'Láser Diodo CNC 20W', watts: 75, fp: 0.85, tipoCarga: 'monofasica', fase: 'A', horasAlta: 4, precio: 18000, mantenimiento: 800, vidaUtil: 5 },
    { id: 'pi_5', tipo: 'Impresora de Sublimación Epson L310', modelo: 'Epson L310 Sublimación', watts: 25, fp: 0.85, tipoCarga: 'monofasica', fase: 'B', horasAlta: 5, precio: 6500, mantenimiento: 500, vidaUtil: 5 },
    { id: 'pi_6', tipo: 'PC Diseño Gráfico + Monitor de Alta Gama', modelo: 'Workstation i7 + GPU', watts: 450, fp: 0.90, tipoCarga: 'monofasica', fase: 'B', horasAlta: 8, precio: 26000, mantenimiento: 600, vidaUtil: 6 },
    { id: 'pi_7', tipo: 'Alumbrado LED Taller Publi-Imperia (7 Luminarias)', modelo: '7x Lámparas LED 18W', watts: 126, fp: 0.95, tipoCarga: 'monofasica', fase: 'A', horasAlta: 10, precio: 3200, mantenimiento: 180, vidaUtil: 10 },
    { id: 'pi_8', tipo: 'Minisplit Inverter (Área 4x4 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'pi_9', tipo: 'Pistola de Calor Manual (Decapador)', modelo: 'Pistola Térmica 1500W', watts: 1500, fp: 1.0, tipoCarga: 'monofasica', fase: 'B', horasAlta: 2, precio: 1400, mantenimiento: 200, vidaUtil: 4 },
    { id: 'pi_10', tipo: 'Panel de Revelado de Serigrafía (8 Tubos)', modelo: 'Mesa Insoladora 8 Tubos', watts: 240, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', horasAlta: 2, precio: 8000, mantenimiento: 400, vidaUtil: 8 }
  ];

  const oficinasList = [
    { id: 'oc_1', tipo: 'Computadora Portátil (Laptop)', modelo: 'Laptop Directiva', watts: 65, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 16000, mantenimiento: 300, vidaUtil: 5 },
    { id: 'oc_2', tipo: 'Minisplit Inverter (Área 4x4 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'oc_3', tipo: 'Cafetera Casera (10 Tazas)', modelo: 'Cafetera Goteo 10 Tazas', watts: 900, fp: 1.0, tipoCarga: 'monofasica', fase: 'B', horasAlta: 2, precio: 850, mantenimiento: 100, vidaUtil: 4 },
    { id: 'oc_4', tipo: 'Televisión LCD / LED 42 Pulgadas', modelo: 'Smart TV Juntas 42"', watts: 110, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 4, precio: 7500, mantenimiento: 200, vidaUtil: 7 },
    { id: 'oc_5', tipo: 'Módem de Internet & Router WiFi', modelo: 'Router WiFi Dual-Band', watts: 25, fp: 0.85, tipoCarga: 'monofasica', fase: 'A', horasAlta: 24, precio: 2500, mantenimiento: 150, vidaUtil: 6 }
  ];

  if (proyectoId === 'imperia_uniformes') return imperiaList.map(formatearAp);
  if (proyectoId === 'papeleria_imperiarte') return papeleriaList.map(formatearAp);
  if (proyectoId === 'hawaiian_paradise') return hawaiianList.map(formatearAp);
  if (proyectoId === 'bordados_veracruz') return bordadosList.map(formatearAp);
  if (proyectoId === 'taller_costura') return costuraList.map(formatearAp);
  if (proyectoId === 'taller_publi_imperia') return publiList.map(formatearAp);
  if (proyectoId === 'oficinas_consorcio') return oficinasList.map(formatearAp);

  // Proyecto Maestro: Consorcio General (Inmueble Completo)
  const consolidado = [
    ...imperiaList.map(x => ({ ...x, tipo: '[Imperia] ' + x.tipo, medidorId: 'med_1' })),
    ...papeleriaList.map(x => ({ ...x, tipo: '[Papelería] ' + x.tipo, medidorId: 'med_2' })),
    ...hawaiianList.map(x => ({ ...x, tipo: '[Hawaiian] ' + x.tipo, medidorId: 'med_3' })),
    ...bordadosList.map(x => ({ ...x, tipo: '[Bordados] ' + x.tipo, medidorId: 'med_4' })),
    ...costuraList.map(x => ({ ...x, tipo: '[Costura] ' + x.tipo, medidorId: 'med_5' })),
    ...publiList.map(x => ({ ...x, tipo: '[Publi-Imperia] ' + x.tipo, medidorId: 'med_6' })),
    ...oficinasList.map(x => ({ ...x, tipo: '[Consorcio] ' + x.tipo, medidorId: 'med_6' })),
    { id: 'gen_1', tipo: '[Servicios] Bomba Presurizadora / Hidroneumático (1 HP)', modelo: 'Bomba 1 HP 127V', watts: 850, fp: 0.82, tipoCarga: 'monofasica', fase: 'B', horasAlta: 4, precio: 7500, mantenimiento: 600, vidaUtil: 7, medidorId: 'med_6' },
    { id: 'gen_2', tipo: '[Servicios] Contactos GFCI Sanitarios y Pasillos', modelo: 'Receptáculos GFCI 20A', watts: 1800, fp: 1.0, tipoCarga: 'monofasica', fase: 'A', horasAlta: 2, precio: 3200, mantenimiento: 300, vidaUtil: 15, medidorId: 'med_6' }
  ];

  return consolidado.map(formatearAp);
}

// ==========================================
// MOTOR LOCAL STORAGE
// ==========================================
const localStore = {
  getProyectos: () => {
    try {
      const data = localStorage.getItem(STORAGE_PROJECTS_KEY);
      return data ? JSON.parse(data) : DEFAULT_PROJECTS_LIST;
    } catch (e) {
      return DEFAULT_PROJECTS_LIST;
    }
  },
  saveProyectos: (lista) => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(lista));
    } catch (e) {}
  },
  getAparatos: (proyectoId) => {
    try {
      const data = localStorage.getItem('electrico_casa_aparatos_' + proyectoId);
      if (!data) {
        const semilla = generarSeedAparatos(proyectoId);
        localStore.saveAparatos(proyectoId, semilla);
        return semilla;
      }
      const list = JSON.parse(data);
      if (list.length === 0) {
        const semilla = generarSeedAparatos(proyectoId);
        localStore.saveAparatos(proyectoId, semilla);
        return semilla;
      }
      return list.map(ap => {
        if (!ap.variantes || ap.variantes.length === 0) {
          const baseVariant = {
            id: 'default',
            nombre: ap.modelo || 'Modelo Base',
            watts: parseFloat(ap.watts) || 0,
            fp: parseFloat(ap.fp) || 1.0,
            precio: parseFloat(ap.precio) || 0,
            mantenimiento: parseFloat(ap.mantenimiento) || 0,
            vidaUtil: parseFloat(ap.vidaUtil) || 8,
            horasAlta: parseFloat(ap.horasAlta) || 8,
            horasReposo: parseFloat(ap.horasReposo) || 0,
            consumoVariable: !!ap.consumoVariable,
            durabilidadOption: ap.durabilidadOption || 'estandar',
            tipoCarga: ap.tipoCarga || 'monofasica',
            usarVaDirecto: !!ap.usarVaDirecto,
            criteriosDurabilidad: ap.criteriosDurabilidad || '',
            criteriosMantenimiento: ap.criteriosMantenimiento || ''
          };
          ap.variantes = [baseVariant];
          ap.activaVariantId = 'default';
        }
        // Migración inteligente para consorcio_general a los 6 medidores según negocio
        if (proyectoId === 'consorcio_general') {
          const t = (ap.tipo || '').toLowerCase();
          if (t.includes('[imperia]')) ap.medidorId = 'med_1';
          else if (t.includes('[papelería]') || t.includes('[papeleria]')) ap.medidorId = 'med_2';
          else if (t.includes('[hawaiian]')) ap.medidorId = 'med_3';
          else if (t.includes('[bordados]')) ap.medidorId = 'med_4';
          else if (t.includes('[costura]')) ap.medidorId = 'med_5';
          else if (t.includes('[publi-imperia]') || t.includes('[consorcio]') || t.includes('[servicios]')) ap.medidorId = 'med_6';
        }
        if (!ap.medidorId) {
          ap.medidorId = 'med_1';
        }
        return ap;
      });
    } catch (e) {
      return generarSeedAparatos(proyectoId);
    }
  },
  saveAparatos: (proyectoId, data) => {
    try {
      localStorage.setItem('electrico_casa_aparatos_' + proyectoId, JSON.stringify(data));
    } catch (e) {}
  },
  getMedidores: (proyectoId) => {
    try {
      const data = localStorage.getItem('electrico_casa_medidores_' + proyectoId);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (proyectoId === 'consorcio_general' && parsed.length < 6) {
            localStore.saveMedidores(proyectoId, DEFAULT_MEDIDORES_CONSORCIO);
            return DEFAULT_MEDIDORES_CONSORCIO;
          }
          return parsed;
        }
      }
      if (proyectoId === 'consorcio_general') {
        localStore.saveMedidores(proyectoId, DEFAULT_MEDIDORES_CONSORCIO);
        return DEFAULT_MEDIDORES_CONSORCIO;
      }
      return [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }];
    } catch (e) {
      return (proyectoId === 'consorcio_general') ? DEFAULT_MEDIDORES_CONSORCIO : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }];
    }
  },
  saveMedidores: (proyectoId, medidores) => {
    try {
      localStorage.setItem('electrico_casa_medidores_' + proyectoId, JSON.stringify(medidores));
    } catch (e) {}
  }
};

// ==========================================
// INTERFAZ DE SERVICIO UNIFICADA MULTI-PROYECTO
// ==========================================
export const dbService = {
  // --- GESTIÓN DE PROYECTOS ---
  
  async getProyectos() {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'proyectos_residenciales'));
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        if (lista.length === 0) {
          for (const p of DEFAULT_PROJECTS_LIST) {
            await this.createProyecto(p.nombre, p.id);
          }
          return DEFAULT_PROJECTS_LIST;
        }
        return lista;
      } catch (error) {
        console.error('Error obteniendo proyectos de Firestore:', error);
        return localStore.getProyectos();
      }
    } else {
      return localStore.getProyectos();
    }
  },

  async createProyecto(nombre, idForzado = null) {
    const idTemp = idForzado || 'proj_' + Math.random().toString(36).substr(2, 9);
    const nuevoProj = { nombre };

    if (db) {
      try {
        await setDoc(doc(db, 'proyectos_residenciales', idTemp), nuevoProj);
        return { id: idTemp, ...nuevoProj };
      } catch (error) {
        console.error('Error creando proyecto en Firestore:', error);
        const lista = localStore.getProyectos();
        const item = { id: idTemp, ...nuevoProj };
        lista.push(item);
        localStore.saveProyectos(lista);
        return item;
      }
    } else {
      const lista = localStore.getProyectos();
      const item = { id: idTemp, ...nuevoProj };
      lista.push(item);
      localStore.saveProyectos(lista);
      return item;
    }
  },

  async updateProyecto(id, campos) {
    if (db) {
      try {
        await updateDoc(doc(db, 'proyectos_residenciales', id), campos);
        return true;
      } catch (error) {
        console.error('Error actualizando proyecto en Firestore:', error);
      }
    }
    
    const lista = localStore.getProyectos();
    const index = lista.findIndex(item => item.id === id);
    if (index !== -1) {
      lista[index] = { ...lista[index], ...campos };
      localStore.saveProyectos(lista);
    }
    return true;
  },

  async clonarProyecto(proyectoId, nuevoNombre) {
    const nuevoProj = await this.createProyecto(nuevoNombre);
    const aparatosExistentes = await this.getAparatos(proyectoId);
    
    const aparatosClonados = aparatosExistentes.map(ap => {
      const { id, ...data } = ap;
      return data;
    });

    await this.guardarTodosLosAparatos(nuevoProj.id, aparatosClonados);

    const medidoresExistentes = await this.getMedidores(proyectoId);
    await this.saveMedidores(nuevoProj.id, medidoresExistentes);

    return nuevoProj;
  },

  async deleteProyecto(proyectoId) {
    if (db) {
      try {
        await deleteDoc(doc(db, 'proyectos_residenciales', proyectoId));
        const snap = await getDocs(collection(db, 'proyectos_residenciales/' + proyectoId + '/aparatos'));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'proyectos_residenciales/' + proyectoId + '/aparatos', d.id));
        }
      } catch (error) {
        console.error('Error borrando proyecto en Firestore:', error);
      }
    }
    
    const lista = localStore.getProyectos();
    const filtrados = lista.filter(p => p.id !== proyectoId);
    localStore.saveProyectos(filtrados);
    localStorage.removeItem('electrico_casa_aparatos_' + proyectoId);
    localStorage.removeItem('electrico_casa_medidores_' + proyectoId);
    return true;
  },

  // --- GESTIÓN DE MEDIDORES POR PROYECTO ---

  async getMedidores(proyectoId) {
    if (db) {
      try {
        const docSnap = await getDoc(doc(db, 'proyectos_residenciales', proyectoId));
        if (docSnap.exists() && docSnap.data().medidores) {
          const m = docSnap.data().medidores;
          if (Array.isArray(m) && m.length > 0) {
            if (proyectoId === 'consorcio_general' && m.length < 6) {
              await this.saveMedidores(proyectoId, DEFAULT_MEDIDORES_CONSORCIO);
              return DEFAULT_MEDIDORES_CONSORCIO;
            }
            localStore.saveMedidores(proyectoId, m);
            return m;
          }
        }
      } catch (error) {
        console.warn('Error leyendo medidores de Firestore, usando localStore:', error);
      }
    }
    return localStore.getMedidores(proyectoId);
  },

  async saveMedidores(proyectoId, medidores) {
    localStore.saveMedidores(proyectoId, medidores);
    if (db) {
      try {
        await updateDoc(doc(db, 'proyectos_residenciales', proyectoId), { medidores });
      } catch (error) {
        console.warn('Error guardando medidores en Firestore:', error);
      }
    }
    return medidores;
  },

  // --- GESTIÓN DE APARATOS POR PROYECTO ---

  async getAparatos(proyectoId) {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'proyectos_residenciales/' + proyectoId + '/aparatos'));
        const aparatos = [];
        querySnapshot.forEach((doc) => {
          const ap = { id: doc.id, ...doc.data() };
          if (!ap.variantes || ap.variantes.length === 0) {
            const baseVariant = {
              id: 'default',
              nombre: ap.modelo || 'Modelo Base',
              watts: parseFloat(ap.watts) || 0,
              fp: parseFloat(ap.fp) || 1.0,
              precio: parseFloat(ap.precio) || 0,
              mantenimiento: parseFloat(ap.mantenimiento) || 0,
              vidaUtil: parseFloat(ap.vidaUtil) || 8,
              horasAlta: parseFloat(ap.horasAlta) || 8,
              horasReposo: parseFloat(ap.horasReposo) || 0,
              consumoVariable: !!ap.consumoVariable,
              durabilidadOption: ap.durabilidadOption || 'estandar',
              tipoCarga: ap.tipoCarga || 'monofasica',
              usarVaDirecto: !!ap.usarVaDirecto,
              criteriosDurabilidad: ap.criteriosDurabilidad || '',
              criteriosMantenimiento: ap.criteriosMantenimiento || ''
            };
            ap.variantes = [baseVariant];
            ap.activaVariantId = 'default';
          }
          if (!ap.medidorId) {
            ap.medidorId = 'med_1';
          }
          aparatos.push(ap);
        });
        if (aparatos.length === 0) {
          const seed = localStore.getAparatos(proyectoId);
          for (const s of seed) {
            await this.addAparato(proyectoId, s);
          }
          return seed;
        }
        return aparatos;
      } catch (error) {
        console.error('Error en getAparatos de Firestore, usando local storage:', error);
        return localStore.getAparatos(proyectoId);
      }
    } else {
      return localStore.getAparatos(proyectoId);
    }
  },

  async addAparato(proyectoId, aparato) {
    const idTemp = aparato.id || ('id_' + Math.random().toString(36).substr(2, 9));
    const nuevoAparato = { ...aparato, id: idTemp };

    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'proyectos_residenciales/' + proyectoId + '/aparatos'), nuevoAparato);
        return { id: docRef.id, ...nuevoAparato };
      } catch (error) {
        console.error('Error guardando aparato en Firestore:', error);
        const lista = localStore.getAparatos(proyectoId);
        lista.push(nuevoAparato);
        localStore.saveAparatos(proyectoId, lista);
        return nuevoAparato;
      }
    } else {
      const lista = localStore.getAparatos(proyectoId);
      lista.push(nuevoAparato);
      localStore.saveAparatos(proyectoId, lista);
      return nuevoAparato;
    }
  },

  async updateAparato(proyectoId, id, campos) {
    if (db) {
      try {
        const docRef = doc(db, 'proyectos_residenciales/' + proyectoId + '/aparatos', id);
        await updateDoc(docRef, campos);
        return true;
      } catch (error) {
        console.error('Error actualizando en Firestore:', error);
      }
    }
    
    const lista = localStore.getAparatos(proyectoId);
    const index = lista.findIndex(item => item.id === id);
    if (index !== -1) {
      lista[index] = { ...lista[index], ...campos };
      localStore.saveAparatos(proyectoId, lista);
    }
    return true;
  },

  async deleteAparato(proyectoId, id) {
    if (db) {
      try {
        const docRef = doc(db, 'proyectos_residenciales/' + proyectoId + '/aparatos', id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error('Error eliminando en Firestore:', error);
      }
    }
    
    const lista = localStore.getAparatos(proyectoId);
    const filtrados = lista.filter(item => item.id !== id);
    localStore.saveAparatos(proyectoId, filtrados);
    return true;
  },

  async guardarTodosLosAparatos(proyectoId, aparatos) {
    localStore.saveAparatos(proyectoId, aparatos);
    
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'proyectos_residenciales/' + proyectoId + '/aparatos'));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'proyectos_residenciales/' + proyectoId + '/aparatos', d.id));
        }

        for (const ap of aparatos) {
          const { id, ...data } = ap;
          await addDoc(collection(db, 'proyectos_residenciales/' + proyectoId + '/aparatos'), data);
        }
      } catch (error) {
        console.error('Error en guardado masivo en Firestore:', error);
      }
    }
    return true;
  }
};
