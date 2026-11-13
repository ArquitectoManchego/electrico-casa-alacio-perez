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
  onSnapshot
} from 'firebase/firestore';
import { EQUIPOS_HAWAIIAN_CANONICOS } from './data/equiposHawaiianCanonicos.js';
export { EQUIPOS_HAWAIIAN_CANONICOS };

// Configuración de Firebase (con respaldo integrado para despliegues en Vercel / multi-equipo)
const viteEnv = import.meta?.env || {};
const firebaseConfig = {
  apiKey: viteEnv.VITE_FIREBASE_API_KEY || "AIzaSyDesu5QCfn5XQLV1gVHopB2r9yCDITqTXg",
  authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN || "electrico-e2896.firebaseapp.com",
  projectId: viteEnv.VITE_FIREBASE_PROJECT_ID || "electrico-e2896",
  storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET || "electrico-e2896.firebasestorage.app",
  messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "395232750843",
  appId: viteEnv.VITE_FIREBASE_APP_ID || "1:395232750843:web:4c2550b4017b58c430e01e"
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

export const DEFAULT_MEDIDORES_3_CONSORCIO = [
  { id: 'med_1', numero: 1, nombre: 'Imperia & Costura', forzarTrifasico: false },
  { id: 'med_2', numero: 2, nombre: 'Papelería & Bordados', forzarTrifasico: false },
  { id: 'med_3', numero: 3, nombre: 'Hawaiian, Publi & Consorcio', forzarTrifasico: false }
];

export const DEFAULT_MEDIDORES_CONSORCIO = DEFAULT_MEDIDORES_3_CONSORCIO;

export const DEFAULT_MEDIDORES_6_CONSORCIO = [
  { id: 'med_1', numero: 1, nombre: 'Imperia Uniformes', forzarTrifasico: false },
  { id: 'med_2', numero: 2, nombre: 'Papelería ImperiArte', forzarTrifasico: false },
  { id: 'med_3', numero: 3, nombre: 'Hawaiian Paradise Universidades', forzarTrifasico: false },
  { id: 'med_4', numero: 4, nombre: 'Bordados Veracruz', forzarTrifasico: false },
  { id: 'med_5', numero: 5, nombre: 'Taller de Costura Imperia', forzarTrifasico: false },
  { id: 'med_6', numero: 6, nombre: 'Publi-Imperia & Consorcio', forzarTrifasico: false }
];

// Generador de semillas de inventario para cada negocio
export function generarSeedAparatos(proyectoId) {
  const formatearAp = (item) => {
    const valHorasAlta = item.horasAlta !== undefined && item.horasAlta !== null && !isNaN(item.horasAlta)
      ? parseFloat(item.horasAlta)
      : 8;
    const valHorasReposo = item.horasReposo !== undefined && item.horasReposo !== null && !isNaN(item.horasReposo)
      ? parseFloat(item.horasReposo)
      : 0;
    const valDiasUsoMes = item.diasUsoMes !== undefined && item.diasUsoMes !== null && !isNaN(item.diasUsoMes)
      ? parseFloat(item.diasUsoMes)
      : 26;

    const baseVariant = {
      id: 'default',
      nombre: item.modelo || 'Modelo Base',
      watts: parseFloat(item.watts) || 0,
      fp: parseFloat(item.fp) || 1.0,
      precio: parseFloat(item.precio) || 0,
      mantenimiento: parseFloat(item.mantenimiento) || 0,
      vidaUtil: parseFloat(item.vidaUtil) || 8,
      horasAlta: valHorasAlta,
      horasReposo: valHorasReposo,
      diasUsoMes: valDiasUsoMes,
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
      ...item,
      horasAlta: valHorasAlta,
      horasReposo: valHorasReposo,
      diasUsoMes: valDiasUsoMes
    };
  };

  const imperiaList = [
    { id: 'imp_1', tipo: 'Minisplit Inverter (Área 4x4 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'imp_2', tipo: 'Computadora de Mostrador y Pantalla (POS)', modelo: 'PC Mostrador TPV', watts: 250, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 14000, mantenimiento: 400, vidaUtil: 6 },
    { id: 'imp_3', tipo: 'Terminal Bancaria Mercado Pago', modelo: 'Smart POS WiFi/4G', watts: 15, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', horasAlta: 8, precio: 2500, mantenimiento: 100, vidaUtil: 4 },
    { id: 'imp_4', tipo: 'Alumbrado LED Showroom Imperia (10 Luminarias)', modelo: '10x Paneles LED 18W', watts: 180, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', horasAlta: 10, precio: 4500, mantenimiento: 250, vidaUtil: 10 },
    { id: 'imp_5', tipo: 'Sistema CCTV 16 Cámaras + Grabadora DVR/NVR', modelo: 'DVR 16CH + 16 Domos', watts: 150, fp: 0.85, tipoCarga: 'monofasica', fase: 'B', horasAlta: 24, precio: 19000, mantenimiento: 800, vidaUtil: 6 }
  ];

  const papeleriaList = [
    { id: 'pap_1', tipo: 'Fotocopiadora / Impresora Xerox DocuColor', modelo: 'DocuColor Láser Color', watts: 1500, fp: 0.92, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 24, horasAlta: 0.75, precio: 55000, mantenimiento: 4500, vidaUtil: 8 },
    { id: 'pap_2', tipo: 'Minisplit Inverter 1.5 TR (18,000 BTU - 220V)', modelo: '1.5 TR (18,000 BTU)', watts: 1700, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', diasUsoMes: 26, horasAlta: 8.0, precio: 13500, mantenimiento: 950, vidaUtil: 8 },
    { id: 'pap_3', tipo: 'Computadora AIO TPV (All-in-One)', modelo: 'AIO 21.5" TPV', watts: 180, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 26, horasAlta: 8.5, precio: 15000, mantenimiento: 350, vidaUtil: 6 },
    { id: 'pap_4', tipo: 'Alumbrado LED Papelería (4 Luminarias)', modelo: '4x Tubos LED 18W', watts: 72, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', diasUsoMes: 26, horasAlta: 9.0, precio: 1900, mantenimiento: 100, vidaUtil: 10 }
  ];

  const hawaiianList = EQUIPOS_HAWAIIAN_CANONICOS;

  const bordadosList = [
    { id: 'bv_1', tipo: 'Bordadora Industrial AEMCO 220V Dahao (4 Cabezas)', modelo: 'AEMCO Cama Plana 4 Cabezas 220V', watts: 1800, fp: 0.85, tipoCarga: 'bifasica', fase: 'A-B', diasUsoMes: 0, horasAlta: 0, precio: 95000, mantenimiento: 5500, vidaUtil: 15 },
    { id: 'bv_2', tipo: 'Bordadora Industrial Melco EMC 6/4 (4 Cabezas, 6 Hilos)', modelo: 'Melco EMC 6/4 (4 Cabezas)', watts: 1500, fp: 0.82, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 0, horasAlta: 0, precio: 85000, mantenimiento: 4800, vidaUtil: 15 },
    { id: 'bv_3', tipo: 'Alumbrado LED Bordados (4 Luminarias)', modelo: '4x Lámparas LED 18W', watts: 72, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', diasUsoMes: 0, horasAlta: 0, precio: 1900, mantenimiento: 100, vidaUtil: 10 },
    { id: 'bv_4', tipo: 'Minisplit Inverter 1.5 TR (18,000 BTU - 220V)', modelo: '1.5 TR Inverter (18,000 BTU)', watts: 1700, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', diasUsoMes: 0, horasAlta: 0, precio: 13500, mantenimiento: 900, vidaUtil: 8 }
  ];

  const costuraList = [
    { id: 'tc_1', tipo: '2 Máquinas de Coser Recta Industrial Singer', modelo: '2x Singer Recta Industrial (550W c/u)', watts: 1100, fp: 0.80, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 26, horasAlta: 5.5, precio: 33000, mantenimiento: 2400, vidaUtil: 12 },
    { id: 'tc_2', tipo: 'Máquina Overlock Industrial (5 Hilos)', modelo: 'Overlock 5 Hilos (550W)', watts: 550, fp: 0.80, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 26, horasAlta: 4.0, precio: 18500, mantenimiento: 1400, vidaUtil: 12 },
    { id: 'tc_3', tipo: 'Máquina Collaretera Industrial Singer', modelo: 'Collaretera Singer Industrial (550W)', watts: 550, fp: 0.80, tipoCarga: 'monofasica', fase: 'B', diasUsoMes: 4, horasAlta: 0.75, precio: 22500, mantenimiento: 1600, vidaUtil: 12 },
    { id: 'tc_4', tipo: 'Cortadora de Tela Industrial de Disco', modelo: 'Cortadora Octagonal 4"', watts: 300, fp: 0.75, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 8, horasAlta: 1.5, precio: 4800, mantenimiento: 600, vidaUtil: 8 },
    { id: 'tc_5', tipo: 'Plancha de Vapor Industrial con Caldera', modelo: 'Caldera de Vapor 1.6kW', watts: 1600, fp: 1.0, tipoCarga: 'monofasica', fase: 'B', diasUsoMes: 26, horasAlta: 1.0, precio: 11000, mantenimiento: 1000, vidaUtil: 8 },
    { id: 'tc_6', tipo: 'Minisplit Inverter Taller de Costura (220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', diasUsoMes: 26, horasAlta: 8.0, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'tc_7', tipo: 'Alumbrado LED Taller de Costura (6 Luminarias)', modelo: '6x Paneles LED 18W', watts: 108, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', diasUsoMes: 26, horasAlta: 8.5, precio: 2800, mantenimiento: 150, vidaUtil: 10 }
  ];

  const publiList = [
    { 
      id: 'pi_1', 
      tipo: 'Impresora de Sublimación Epson L120', 
      modelo: 'Epson L120 Sublimación', 
      watts: 20, 
      fp: 0.85, 
      tipoCarga: 'monofasica', 
      fase: 'B', 
      diasUsoMes: 10, 
      horasAlta: 0.15, 
      precio: 4500, 
      mantenimiento: 400, 
      vidaUtil: 5 
    },
    { 
      id: 'pi_2', 
      tipo: 'Plancha de Sublimación de Tazas (Combo 3 en 1)', 
      modelo: 'Cabezal Cilíndrico Intercambiable 11/15oz', 
      watts: 350, 
      fp: 1.0, 
      tipoCarga: 'monofasica', 
      fase: 'A', 
      diasUsoMes: 0, 
      horasAlta: 0, 
      precio: 3500, 
      mantenimiento: 250, 
      vidaUtil: 5 
    },
    { 
      id: 'pi_3', 
      tipo: 'Plancha de Sublimación y DTF Plana 28x32 cm (Combo 3 en 1)', 
      modelo: 'Prensa Térmica Plana 1000W Intercambiable', 
      watts: 1000, 
      fp: 1.0, 
      tipoCarga: 'monofasica', 
      fase: 'A', 
      diasUsoMes: 3, 
      horasAlta: 0.8, 
      precio: 7500, 
      mantenimiento: 500, 
      vidaUtil: 6 
    },
    { 
      id: 'pi_4', 
      tipo: 'Plancha de Sublimación para Gorras (Combo 3 en 1)', 
      modelo: 'Cabezal Curvo Gorras 400W Intercambiable', 
      watts: 400, 
      fp: 1.0, 
      tipoCarga: 'monofasica', 
      fase: 'B', 
      diasUsoMes: 0, 
      horasAlta: 0, 
      precio: 4200, 
      mantenimiento: 250, 
      vidaUtil: 5 
    },
    { 
      id: 'pi_mini_ront', 
      tipo: 'Miniplancha Térmica HTV RONT (Tallas y Etiquetas DTF)', 
      modelo: 'Mi1 120VAC 6x10cm (250W)', 
      watts: 250, 
      fp: 1.0, 
      tipoCarga: 'monofasica', 
      fase: 'A', 
      diasUsoMes: 10, 
      horasAlta: 0.05, 
      precio: 1200, 
      mantenimiento: 150, 
      vidaUtil: 6 
    },
    { 
      id: 'pi_5', 
      tipo: 'Bordadora Computarizada Brother PE770', 
      modelo: 'Brother PE770 1 Cabeza', 
      watts: 75, 
      fp: 0.80, 
      tipoCarga: 'monofasica', 
      fase: 'B', 
      diasUsoMes: 3, 
      horasAlta: 1.5, 
      precio: 16000, 
      mantenimiento: 900, 
      vidaUtil: 7 
    },
    { 
      id: 'pi_6', 
      tipo: 'Cortadora de Vinil Brother ScanNCut', 
      modelo: 'ScanNCut SDX125', 
      watts: 50, 
      fp: 0.90, 
      tipoCarga: 'monofasica', 
      fase: 'B', 
      diasUsoMes: 3, 
      horasAlta: 0.5, 
      precio: 12500, 
      mantenimiento: 400, 
      vidaUtil: 6 
    },
    { 
      id: 'pi_7', 
      tipo: 'Cortadora y Grabadora Láser Atomstack A20', 
      modelo: 'Atomstack A20 Pro 20W Óptico', 
      watts: 120, 
      fp: 0.88, 
      tipoCarga: 'monofasica', 
      fase: 'A', 
      diasUsoMes: 4, 
      horasAlta: 1.55, 
      precio: 21000, 
      mantenimiento: 850, 
      vidaUtil: 5 
    },
    { 
      id: 'pi_8', 
      tipo: 'Reveladora de Serigrafía (8 Tubos Fluorescentes 32W)', 
      modelo: 'Mesa Insoladora 8x32W (256W)', 
      watts: 256, 
      fp: 0.90, 
      tipoCarga: 'monofasica', 
      fase: 'A', 
      diasUsoMes: 1, 
      horasAlta: 0.25, 
      precio: 8500, 
      mantenimiento: 400, 
      vidaUtil: 8 
    },
    { 
      id: 'pi_9', 
      tipo: 'Plancha de Calor Serigrafía 80x100 cm (220V)', 
      modelo: 'Prensa Gran Formato 80x100 3.6kW', 
      watts: 3600, 
      fp: 1.0, 
      tipoCarga: 'bifasica', 
      fase: 'A-B', 
      diasUsoMes: 0.5, 
      horasAlta: 0.5, 
      precio: 48000, 
      mantenimiento: 2200, 
      vidaUtil: 10 
    },
    { 
      id: 'pi_10', 
      tipo: 'PC Diseño Gráfico + Monitor de Alta Gama', 
      modelo: 'Workstation i7 + GPU', 
      watts: 450, 
      fp: 0.90, 
      tipoCarga: 'monofasica', 
      fase: 'B', 
      diasUsoMes: 12, 
      horasAlta: 4.0, 
      precio: 26000, 
      mantenimiento: 600, 
      vidaUtil: 6 
    },
    { 
      id: 'pi_11', 
      tipo: 'Minisplit Inverter Publi-Imperia (220V)', 
      modelo: '1 TR (12,000 BTU)', 
      watts: 1150, 
      fp: 0.95, 
      tipoCarga: 'bifasica', 
      fase: 'A-B', 
      diasUsoMes: 10, 
      horasAlta: 4.0, 
      precio: 9500, 
      mantenimiento: 800, 
      vidaUtil: 8 
    },
    { 
      id: 'pi_12', 
      tipo: 'Alumbrado LED Taller Publi-Imperia (7 Luminarias)', 
      modelo: '7x Lámparas LED 18W', 
      watts: 126, 
      fp: 0.95, 
      tipoCarga: 'monofasica', 
      fase: 'A', 
      diasUsoMes: 10, 
      horasAlta: 4.0, 
      precio: 3200, 
      mantenimiento: 180, 
      vidaUtil: 10 
    }
  ];

  const oficinasList = [
    { id: 'oc_1', tipo: 'Computadora Portátil (Laptop)', modelo: 'Laptop Directiva', watts: 65, fp: 0.90, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 15, horasAlta: 2.0, precio: 16000, mantenimiento: 300, vidaUtil: 5 },
    { id: 'oc_2', tipo: 'Minisplit Inverter (Área 4x4 m - 220V)', modelo: '1 TR (12,000 BTU)', watts: 1150, fp: 0.95, tipoCarga: 'bifasica', fase: 'A-B', diasUsoMes: 15, horasAlta: 2.0, precio: 9500, mantenimiento: 800, vidaUtil: 8 },
    { id: 'oc_3', tipo: 'Televisión Smart LED 32 Pulgadas', modelo: 'Smart TV 32" Juntas', watts: 55, fp: 0.95, tipoCarga: 'monofasica', fase: 'B', diasUsoMes: 8, horasAlta: 1.5, precio: 4200, mantenimiento: 150, vidaUtil: 7 },
    { id: 'oc_4', tipo: 'Alumbrado LED Oficina Consorcio (4 Luminarias)', modelo: '4x Tubos LED 18W', watts: 72, fp: 0.95, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 15, horasAlta: 2.0, precio: 1900, mantenimiento: 100, vidaUtil: 10 },
    { id: 'oc_5', tipo: 'Módem de Internet & Router WiFi', modelo: 'Router WiFi Dual-Band', watts: 25, fp: 0.85, tipoCarga: 'monofasica', fase: 'A', diasUsoMes: 30, horasAlta: 24.0, precio: 2500, mantenimiento: 150, vidaUtil: 6 }
  ];

  if (proyectoId === 'imperia_uniformes') return imperiaList.map(x => formatearAp({ ...x, local: 'Imperia Uniformes' }));
  if (proyectoId === 'papeleria_imperiarte') return papeleriaList.map(x => formatearAp({ ...x, local: 'Papelería ImperiArte' }));
  if (proyectoId === 'hawaiian_paradise') return hawaiianList.map(x => formatearAp({ ...x, local: 'Hawaiian Paradise Universidades' }));
  if (proyectoId === 'bordados_veracruz') return bordadosList.map(x => formatearAp({ ...x, local: 'Bordados Veracruz' }));
  if (proyectoId === 'taller_costura') return costuraList.map(x => formatearAp({ ...x, local: 'Taller de Costura Imperia' }));
  if (proyectoId === 'taller_publi_imperia') return publiList.map(x => formatearAp({ ...x, local: 'Publi-Imperia' }));
  if (proyectoId === 'oficinas_consorcio') return oficinasList.map(x => formatearAp({ ...x, local: 'Oficinas Consorcio' }));

  // Proyecto Maestro: Consorcio General (Inmueble Completo - 3 Medidores Oficiales)
  const consolidado = [
    ...imperiaList.map(x => ({ ...x, local: 'Imperia Uniformes', medidorId: 'med_1' })),
    ...costuraList.map(x => ({ ...x, local: 'Taller de Costura Imperia', medidorId: 'med_1' })),
    ...papeleriaList.map(x => ({ ...x, local: 'Papelería ImperiArte', medidorId: 'med_2' })),
    ...bordadosList.map(x => ({ ...x, local: 'Bordados Veracruz', medidorId: 'med_2' })),
    ...hawaiianList.map(x => ({ ...x, local: 'Hawaiian Paradise Universidades', medidorId: 'med_3' })),
    ...publiList.map(x => ({ ...x, local: 'Publi-Imperia', medidorId: 'med_3' })),
    ...oficinasList.map(x => ({ ...x, local: 'Oficinas Consorcio', medidorId: 'med_3' })),
    { id: 'gen_1', tipo: 'Bomba Presurizadora / Hidroneumático (1 HP)', local: 'Servicios Comunes', modelo: 'Bomba 1 HP 127V', watts: 850, fp: 0.82, tipoCarga: 'monofasica', fase: 'B', horasAlta: 4, precio: 7500, mantenimiento: 600, vidaUtil: 7, medidorId: 'med_3' },
    { id: 'gen_2', tipo: 'Contactos GFCI Sanitarios y Pasillos', local: 'Servicios Comunes', modelo: 'Receptáculos GFCI 20A', watts: 1800, fp: 1.0, tipoCarga: 'monofasica', fase: 'A', horasAlta: 2, precio: 3200, mantenimiento: 300, vidaUtil: 15, medidorId: 'med_3' }
  ];

  return consolidado.map(formatearAp);
}

// ==========================================
// NORMALIZADOR CANÓNICO DE APARATOS
// ==========================================
function normalizarAparato(ap, proyectoId = 'consorcio_general', idx = 0) {
  if (!ap) return null;
  const copy = { ...ap };
  if (!copy.id) {
    copy.id = `ap_${idx + 1}_${Math.random().toString(36).slice(2, 7)}`;
  }

  if (!copy.variantes || copy.variantes.length === 0) {
    const baseVariant = {
      id: 'default',
      nombre: copy.modelo || 'Modelo Base',
      watts: parseFloat(copy.watts) || 0,
      fp: parseFloat(copy.fp) || 1.0,
      precio: parseFloat(copy.precio) || 0,
      mantenimiento: parseFloat(copy.mantenimiento) || 0,
      vidaUtil: parseFloat(copy.vidaUtil) || 8,
      horasAlta: copy.horasAlta !== undefined && copy.horasAlta !== null && !isNaN(copy.horasAlta) ? parseFloat(copy.horasAlta) : 8,
      horasReposo: copy.horasReposo !== undefined && copy.horasReposo !== null && !isNaN(copy.horasReposo) ? parseFloat(copy.horasReposo) : 0,
      diasUsoMes: copy.diasUsoMes !== undefined && copy.diasUsoMes !== null && !isNaN(copy.diasUsoMes) ? parseFloat(copy.diasUsoMes) : 26,
      consumoVariable: !!copy.consumoVariable,
      durabilidadOption: copy.durabilidadOption || 'estandar',
      tipoCarga: copy.tipoCarga || 'monofasica',
      usarVaDirecto: !!copy.usarVaDirecto,
      criteriosDurabilidad: copy.criteriosDurabilidad || '',
      criteriosMantenimiento: copy.criteriosMantenimiento || ''
    };
    copy.variantes = [baseVariant];
    copy.activaVariantId = 'default';
  }

  if (copy.diasUsoMes === undefined) {
    copy.diasUsoMes = 26;
  }

  const t = (copy.tipo || '').toLowerCase();
  if (proyectoId === 'consorcio_general') {
    if (t.includes('[imperia]')) { if (!copy.local) copy.local = 'Imperia Uniformes'; if (!copy.medidorId) copy.medidorId = 'med_1'; }
    else if (t.includes('[papelería]') || t.includes('[papeleria]')) { if (!copy.local) copy.local = 'Papelería ImperiArte'; if (!copy.medidorId) copy.medidorId = 'med_2'; }
    else if (t.includes('[hawaiian]')) { if (!copy.local) copy.local = 'Hawaiian Paradise Universidades'; if (!copy.medidorId) copy.medidorId = 'med_3'; }
    else if (t.includes('[bordados]')) { if (!copy.local) copy.local = 'Bordados Veracruz'; if (!copy.medidorId) copy.medidorId = 'med_2'; }
    else if (t.includes('[costura]')) { if (!copy.local) copy.local = 'Taller de Costura Imperia'; if (!copy.medidorId) copy.medidorId = 'med_1'; }
    else if (t.includes('[publi-imperia]')) { if (!copy.local) copy.local = 'Publi-Imperia'; if (!copy.medidorId) copy.medidorId = 'med_3'; }
    else if (t.includes('[consorcio]')) { if (!copy.local) copy.local = 'Oficinas Consorcio'; if (!copy.medidorId) copy.medidorId = 'med_3'; }
    else if (t.includes('[servicios]')) { if (!copy.local) copy.local = 'Servicios Comunes'; if (!copy.medidorId) copy.medidorId = 'med_3'; }
  }

  if (!copy.medidorId) {
    copy.medidorId = 'med_1';
  }

  if (!copy.local) {
    const match = (copy.tipo || '').match(/^(\[|\()([^\)\]]+)(\]|\))\s*/);
    if (match) {
      const raw = match[2].toLowerCase();
      if (raw.includes('imperia') && !raw.includes('publi')) copy.local = 'Imperia Uniformes';
      else if (raw.includes('papeler') || raw.includes('arte')) copy.local = 'Papelería ImperiArte';
      else if (raw.includes('hawaiian') || raw.includes('hp')) copy.local = 'Hawaiian Paradise Universidades';
      else if (raw.includes('bordad')) copy.local = 'Bordados Veracruz';
      else if (raw.includes('costura')) copy.local = 'Taller de Costura Imperia';
      else if (raw.includes('publi')) copy.local = 'Publi-Imperia';
      else if (raw.includes('consorcio') || raw.includes('oficina')) copy.local = 'Oficinas Consorcio';
      else if (raw.includes('servicio')) copy.local = 'Servicios Comunes';
      else copy.local = match[2].trim();
    } else {
      copy.local = DEFAULT_PROJECTS_LIST.find(p => p.id === proyectoId)?.nombre || 'Imperia Uniformes';
    }
  }

  if (copy.tipo) {
    copy.tipo = copy.tipo.replace(/^(\[|\()([^\)\]]+)(\]|\))\s*/, '').trim();
  }

  return copy;
}

// Acceso seguro a localStorage (con respaldo en memoria para entornos restringidos o Node)
const memoryStore = new Map();
function safeGetItem(key) {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  } catch (e) {}
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}
function safeSetItem(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
  } catch (e) {}
  memoryStore.set(key, String(val));
}
function safeRemoveItem(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (e) {}
  memoryStore.delete(key);
}

// Detecta si una lista local de medidores corresponde a los 6 medidores obsoletos por defecto
function esConfiguracion6MedidoresObsoleta(proyectoId, medidores) {
  if (proyectoId !== 'consorcio_general' || !Array.isArray(medidores)) return false;
  if (medidores.length !== 6) return false;
  if (safeGetItem('sge_explicit_6_medidores_' + proyectoId) === 'true') {
    return false;
  }
  return true;
}

// ==========================================
// MOTOR LOCAL STORAGE (CACHÉ SINCRONIZADO)
// ==========================================
const localStore = {
  getProyectos: () => {
    try {
      const data = safeGetItem(STORAGE_PROJECTS_KEY);
      return data ? JSON.parse(data) : DEFAULT_PROJECTS_LIST;
    } catch (e) {
      return DEFAULT_PROJECTS_LIST;
    }
  },
  saveProyectos: (lista) => {
    safeSetItem(STORAGE_PROJECTS_KEY, JSON.stringify(lista));
  },
  hasCustomAparatos: (proyectoId) => {
    try {
      const raw = safeGetItem('electrico_casa_aparatos_' + proyectoId);
      if (!raw) return false;
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return false;
      // Si tiene aparatos asignados a med_4, med_5 o med_6 y no se activó explícitamente 6 medidores, es caché viejo obsoleto
      if (proyectoId === 'consorcio_general' && safeGetItem('sge_explicit_6_medidores_' + proyectoId) !== 'true') {
        const tieneMedsViejos = list.some(ap => ap.medidorId === 'med_4' || ap.medidorId === 'med_5' || ap.medidorId === 'med_6');
        if (tieneMedsViejos) return false;
      }
      const seed = generarSeedAparatos(proyectoId);
      if (list.length !== seed.length) return true;
      const seedMap = new Map(seed.map(s => [s.id, s]));
      return list.some(ap => {
        const s = seedMap.get(ap.id);
        if (!s) return true;
        return ap.medidorId !== s.medidorId || ap.local !== s.local || Number(ap.watts) !== Number(s.watts) || ap.tipo !== s.tipo;
      });
    } catch (e) {
      return false;
    }
  },
  getAparatos: (proyectoId, persistDefault = false) => {
    try {
      const data = safeGetItem('electrico_casa_aparatos_' + proyectoId);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) {
          // Purgar si viene de la configuración obsoleta de 6 medidores no solicitada
          if (proyectoId === 'consorcio_general' && safeGetItem('sge_explicit_6_medidores_' + proyectoId) !== 'true') {
            const medsLocalRaw = safeGetItem('electrico_casa_medidores_' + proyectoId);
            const medsLocal = medsLocalRaw ? JSON.parse(medsLocalRaw) : null;
            if (esConfiguracion6MedidoresObsoleta(proyectoId, medsLocal)) {
              safeRemoveItem('electrico_casa_aparatos_' + proyectoId);
              safeRemoveItem('electrico_casa_medidores_' + proyectoId);
              safeRemoveItem('electrico_casa_medidores_ts_' + proyectoId);
              safeRemoveItem('electrico_casa_aparatos_ts_' + proyectoId);
              const semilla = generarSeedAparatos(proyectoId);
              return semilla;
            }
          }
          return list.map((ap, i) => normalizarAparato(ap, proyectoId, i)).filter(Boolean);
        }
      }
      const semilla = generarSeedAparatos(proyectoId);
      if (persistDefault) {
        localStore.saveAparatos(proyectoId, semilla, 0);
      }
      return semilla;
    } catch (e) {
      return generarSeedAparatos(proyectoId);
    }
  },
  saveAparatos: (proyectoId, data, timestamp = Date.now()) => {
    safeSetItem('electrico_casa_aparatos_' + proyectoId, JSON.stringify(data));
    if (timestamp > 0) {
      safeSetItem('electrico_casa_aparatos_ts_' + proyectoId, String(timestamp));
    }
  },
  hasCustomMedidores: (proyectoId) => {
    try {
      const data = safeGetItem('electrico_casa_medidores_' + proyectoId);
      if (!data) return false;
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) return false;
      if (esConfiguracion6MedidoresObsoleta(proyectoId, parsed)) return false;
      if (proyectoId === 'consorcio_general' && parsed.length === 3) {
        const esDefault3 = parsed.every((m, idx) => {
          const def = DEFAULT_MEDIDORES_3_CONSORCIO[idx];
          return def && m.id === def.id && m.nombre === def.nombre && !m.forzarTrifasico && !m.fasesHabilitadas;
        });
        if (esDefault3 && !localStore.hasCustomAparatos(proyectoId)) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  },
  getMedidores: (proyectoId, persistDefault = false) => {
    try {
      const data = safeGetItem('electrico_casa_medidores_' + proyectoId);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (esConfiguracion6MedidoresObsoleta(proyectoId, parsed)) {
            safeRemoveItem('electrico_casa_medidores_' + proyectoId);
            safeRemoveItem('electrico_casa_medidores_ts_' + proyectoId);
          } else {
            return parsed;
          }
        }
      }
      const fallback = proyectoId === 'consorcio_general'
        ? DEFAULT_MEDIDORES_CONSORCIO
        : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }];
      if (persistDefault) {
        localStore.saveMedidores(proyectoId, fallback, 0);
      }
      return fallback;
    } catch (e) {
      return (proyectoId === 'consorcio_general') ? DEFAULT_MEDIDORES_CONSORCIO : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }];
    }
  },
  saveMedidores: (proyectoId, medidores, timestamp = Date.now()) => {
    safeSetItem('electrico_casa_medidores_' + proyectoId, JSON.stringify(medidores));
    if (timestamp > 0) {
      safeSetItem('electrico_casa_medidores_ts_' + proyectoId, String(timestamp));
    }
  }
};

// Registro de última escritura originada en esta sesión para evitar bucles con onSnapshot
let lastSessionWriteTimestamp = 0;

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
        querySnapshot.forEach((docSnap) => {
          const d = docSnap.data();
          lista.push({ id: docSnap.id, nombre: d.nombre || docSnap.id, ...d });
        });
        if (lista.length === 0) {
          for (const p of DEFAULT_PROJECTS_LIST) {
            await this.createProyecto(p.nombre, p.id);
          }
          return DEFAULT_PROJECTS_LIST;
        }
        // Asegurar que los proyectos base del consorcio existan
        for (const defProj of DEFAULT_PROJECTS_LIST) {
          if (!lista.some(item => item.id === defProj.id)) {
            await this.createProyecto(defProj.nombre, defProj.id);
            lista.push(defProj);
          }
        }
        localStore.saveProyectos(lista.map(({ id, nombre }) => ({ id, nombre })));
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
        await setDoc(doc(db, 'proyectos_residenciales', idTemp), nuevoProj, { merge: true });
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
        await setDoc(doc(db, 'proyectos_residenciales', id), campos, { merge: true });
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
    await this.guardarTodosLosAparatos(nuevoProj.id, aparatosExistentes);

    const medidoresExistentes = await this.getMedidores(proyectoId);
    await this.saveMedidores(nuevoProj.id, medidoresExistentes);

    return nuevoProj;
  },

  async deleteProyecto(proyectoId) {
    if (db) {
      try {
        await deleteDoc(doc(db, 'proyectos_residenciales', proyectoId));
      } catch (error) {
        console.error('Error borrando proyecto en Firestore:', error);
      }
    }
    
    const lista = localStore.getProyectos();
    const filtrados = lista.filter(p => p.id !== proyectoId);
    localStore.saveProyectos(filtrados);
    safeRemoveItem('electrico_casa_aparatos_' + proyectoId);
    safeRemoveItem('electrico_casa_medidores_' + proyectoId);
    safeRemoveItem('electrico_casa_aparatos_ts_' + proyectoId);
    safeRemoveItem('electrico_casa_medidores_ts_' + proyectoId);
    return true;
  },

  // --- GESTIÓN DE MEDIDORES POR PROYECTO (CLOUD-FIRST MULTI-EQUIPO) ---

  getInitialMedidoresSync(proyectoId = 'consorcio_general') {
    return localStore.getMedidores(proyectoId, false);
  },

  async getMedidores(proyectoId) {
    const hasLocalCustom = localStore.hasCustomMedidores(proyectoId);
    const localData = localStore.getMedidores(proyectoId, false);
    const localTimestamp = parseInt(safeGetItem('electrico_casa_medidores_ts_' + proyectoId) || '0', 10);

    if (db) {
      try {
        const docSnap = await getDoc(doc(db, 'proyectos_residenciales', proyectoId));
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const remoteMeds = docData.medidores;
          const remoteTimestamp = docData.medidoresUpdatedAt || 0;
          const remoteExplicit6 = !!docData.explicit6Medidores;
          const remoteUserModified = !!docData.userModified;

          if (Array.isArray(remoteMeds) && remoteMeds.length > 0) {
            const remotoEsObsoleto6 = proyectoId === 'consorcio_general' && remoteMeds.length === 6 && !remoteExplicit6;
            if (!remotoEsObsoleto6) {
              const syncedV3 = safeGetItem('sge_cloud_sync_v3_meds_' + proyectoId) === 'true';
              // Si este equipo aún no había migrado a v3 y tiene cambios personalizados del usuario mientras Firestore solo tiene la semilla automática:
              const rescueLocalBeforeV3 = !syncedV3 && hasLocalCustom && !remoteUserModified;

              if (!rescueLocalBeforeV3 && (remoteTimestamp >= localTimestamp || syncedV3 || !hasLocalCustom)) {
                if (remoteExplicit6) {
                  safeSetItem('sge_explicit_6_medidores_' + proyectoId, 'true');
                } else {
                  safeRemoveItem('sge_explicit_6_medidores_' + proyectoId);
                }
                safeSetItem('sge_cloud_sync_v3_meds_' + proyectoId, 'true');
                localStore.saveMedidores(proyectoId, remoteMeds, remoteTimestamp || Date.now());
                return remoteMeds;
              }
            }
          }
        }

        // Si en Firestore no había medidores (o rescatamos los cambios locales de este equipo):
        safeSetItem('sge_cloud_sync_v3_meds_' + proyectoId, 'true');
        await this.saveMedidores(proyectoId, localData, {
          explicit6Medidores: localData.length === 6 && safeGetItem('sge_explicit_6_medidores_' + proyectoId) === 'true',
          isAutoMigration: !hasLocalCustom
        });
        return localData;
      } catch (error) {
        console.warn('Error leyendo medidores de Firestore, usando localStore:', error);
      }
    }
    return localData;
  },

  async saveMedidores(proyectoId, medidores, options = {}) {
    const timestamp = Date.now();
    lastSessionWriteTimestamp = timestamp;
    const explicit6 = options.explicit6Medidores !== undefined
      ? !!options.explicit6Medidores
      : (medidores.length === 6);

    if (explicit6) {
      safeSetItem('sge_explicit_6_medidores_' + proyectoId, 'true');
    } else {
      safeRemoveItem('sge_explicit_6_medidores_' + proyectoId);
    }
    safeSetItem('sge_cloud_sync_v3_meds_' + proyectoId, 'true');

    localStore.saveMedidores(proyectoId, medidores, timestamp);
    if (db) {
      try {
        await setDoc(doc(db, 'proyectos_residenciales', proyectoId), {
          medidores,
          medidoresUpdatedAt: timestamp,
          explicit6Medidores: explicit6,
          ...(options.isAutoMigration ? {} : { userModified: true })
        }, { merge: true });
      } catch (error) {
        console.warn('Error guardando medidores en Firestore:', error);
      }
    }
    return medidores;
  },

  // --- GESTIÓN DE APARATOS POR PROYECTO (CLOUD-FIRST ATÓMICO) ---

  async getAparatos(proyectoId) {
    const hasLocalCustom = localStore.hasCustomAparatos(proyectoId);
    const localData = localStore.getAparatos(proyectoId, false);
    const localTimestamp = parseInt(safeGetItem('electrico_casa_aparatos_ts_' + proyectoId) || '0', 10);

    if (db) {
      try {
        const docSnap = await getDoc(doc(db, 'proyectos_residenciales', proyectoId));
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const remoteAparatos = docData.aparatosLista;
          const remoteTimestamp = docData.aparatosUpdatedAt || 0;
          const remoteExplicit6 = !!docData.explicit6Medidores;
          const remoteUserModified = !!docData.userModified;

          if (Array.isArray(remoteAparatos) && remoteAparatos.length > 0) {
            const tieneMeds6Obsoletos = proyectoId === 'consorcio_general' && !remoteExplicit6 &&
              remoteAparatos.some(ap => ap.medidorId === 'med_4' || ap.medidorId === 'med_5' || ap.medidorId === 'med_6');

            if (!tieneMeds6Obsoletos) {
              const syncedV3 = safeGetItem('sge_cloud_sync_v3_aps_' + proyectoId) === 'true';
              const rescueLocalBeforeV3 = !syncedV3 && hasLocalCustom && !remoteUserModified;

              if (!rescueLocalBeforeV3 && (remoteTimestamp >= localTimestamp || syncedV3 || !hasLocalCustom)) {
                const normalizados = remoteAparatos
                  .map((ap, i) => normalizarAparato(ap, proyectoId, i))
                  .filter(Boolean);
                safeSetItem('sge_cloud_sync_v3_aps_' + proyectoId, 'true');
                localStore.saveAparatos(proyectoId, normalizados, remoteTimestamp || Date.now());
                return normalizados;
              }
            }
          }
        }

        // Si en Firestore aún no existe aparatosLista (o rescatamos las ediciones locales de este equipo):
        safeSetItem('sge_cloud_sync_v3_aps_' + proyectoId, 'true');
        await this.guardarTodosLosAparatos(proyectoId, localData, {
          isAutoMigration: !hasLocalCustom
        });
        return localData;
      } catch (error) {
        console.error('Error en getAparatos de Firestore, usando local storage:', error);
        return localData;
      }
    } else {
      return localData;
    }
  },

  async addAparato(proyectoId, aparato) {
    const idTemp = aparato.id || ('id_' + Math.random().toString(36).substr(2, 9));
    const nuevoAparato = normalizarAparato({ ...aparato, id: idTemp }, proyectoId);
    const lista = [...localStore.getAparatos(proyectoId, false)];
    const existingIdx = lista.findIndex(item => item.id === nuevoAparato.id);
    if (existingIdx !== -1) {
      lista[existingIdx] = nuevoAparato;
    } else {
      lista.push(nuevoAparato);
    }

    await this.guardarTodosLosAparatos(proyectoId, lista);
    return nuevoAparato;
  },

  async updateAparato(proyectoId, id, campos) {
    const lista = [...localStore.getAparatos(proyectoId, false)];
    const index = lista.findIndex(item => item.id === id);
    if (index !== -1) {
      lista[index] = normalizarAparato({ ...lista[index], ...campos, id }, proyectoId, index);
    } else {
      lista.push(normalizarAparato({ id, ...campos }, proyectoId, lista.length));
    }

    await this.guardarTodosLosAparatos(proyectoId, lista);
    return true;
  },

  async deleteAparato(proyectoId, id) {
    const lista = localStore.getAparatos(proyectoId, false);
    const filtrados = lista.filter(item => item.id !== id);
    await this.guardarTodosLosAparatos(proyectoId, filtrados);
    return true;
  },

  async guardarTodosLosAparatos(proyectoId, aparatos, options = {}) {
    const timestamp = Date.now();
    lastSessionWriteTimestamp = timestamp;
    const limpios = (Array.isArray(aparatos) ? aparatos : [])
      .map((ap, i) => normalizarAparato(ap, proyectoId, i))
      .filter(Boolean);

    safeSetItem('sge_cloud_sync_v3_aps_' + proyectoId, 'true');
    localStore.saveAparatos(proyectoId, limpios, timestamp);

    if (db) {
      try {
        await setDoc(doc(db, 'proyectos_residenciales', proyectoId), {
          aparatosLista: limpios,
          aparatosUpdatedAt: timestamp,
          ...(options.isAutoMigration ? {} : { userModified: true })
        }, { merge: true });
      } catch (error) {
        console.error('Error en guardado atómico de aparatos en Firestore:', error);
      }
    }
    return true;
  },

  // --- GESTIÓN DE ESCENARIOS DE VENTAS POR LOCAL (CLOUD-FIRST MULTI-EQUIPO) ---

  async getEscenariosPorNegocio(proyectoId, defaultEscenarios = {}) {
    let localData = { ...defaultEscenarios };
    try {
      const raw = safeGetItem('sge_escenarios_por_negocio_' + proyectoId);
      if (raw) {
        localData = { ...defaultEscenarios, ...JSON.parse(raw) };
      }
    } catch (e) {}

    const localTs = parseInt(safeGetItem('sge_escenarios_por_negocio_ts_' + proyectoId) || '0', 10);

    if (db) {
      try {
        const docSnap = await getDoc(doc(db, 'proyectos_residenciales', proyectoId));
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const remoteEsc = docData.escenariosPorNegocio;
          const remoteTs = docData.escenariosUpdatedAt || 0;
          if (remoteEsc && typeof remoteEsc === 'object' && Object.keys(remoteEsc).length > 0) {
            if (remoteTs >= localTs || localTs === 0) {
              const merged = { ...defaultEscenarios, ...remoteEsc };
              safeSetItem('sge_escenarios_por_negocio_' + proyectoId, JSON.stringify(merged));
              safeSetItem('sge_escenarios_por_negocio_ts_' + proyectoId, String(remoteTs || Date.now()));
              if (docData.estadosVentasNegocios && typeof docData.estadosVentasNegocios === 'object') {
                safeSetItem('simulador_ventas_v2_' + proyectoId, JSON.stringify(docData.estadosVentasNegocios));
              }
              return merged;
            }
          }
        }
        // Si no estaba en Firestore o local es más reciente, sincronizar a Firestore
        await this.saveEscenariosPorNegocio(proyectoId, localData);
        return localData;
      } catch (error) {
        console.warn('Error leyendo escenariosPorNegocio de Firestore:', error);
      }
    }
    return localData;
  },

  async saveEscenariosPorNegocio(proyectoId, escenariosPorNegocio, estadosVentasNegocios = null) {
    const timestamp = Date.now();
    lastSessionWriteTimestamp = timestamp;
    safeSetItem('sge_escenarios_por_negocio_' + proyectoId, JSON.stringify(escenariosPorNegocio));
    safeSetItem('sge_escenarios_por_negocio_ts_' + proyectoId, String(timestamp));
    if (estadosVentasNegocios && typeof estadosVentasNegocios === 'object') {
      safeSetItem('simulador_ventas_v2_' + proyectoId, JSON.stringify(estadosVentasNegocios));
    }

    if (db) {
      try {
        const payload = {
          escenariosPorNegocio,
          escenariosUpdatedAt: timestamp
        };
        if (estadosVentasNegocios && typeof estadosVentasNegocios === 'object') {
          payload.estadosVentasNegocios = estadosVentasNegocios;
        }
        await setDoc(doc(db, 'proyectos_residenciales', proyectoId), payload, { merge: true });
      } catch (error) {
        console.warn('Error guardando escenariosPorNegocio en Firestore:', error);
      }
    }
    return escenariosPorNegocio;
  },

  // --- SUSCRIPCIÓN EN TIEMPO REAL ENTRE EQUIPOS ---
  subscribeProyecto(proyectoId, onRemoteUpdate) {
    if (!db || !proyectoId || typeof onRemoteUpdate !== 'function') {
      return () => {};
    }
    try {
      const docRef = doc(db, 'proyectos_residenciales', proyectoId);
      return onSnapshot(docRef, (docSnap) => {
        if (!docSnap.exists() || docSnap.metadata.hasPendingWrites) return;
        const data = docSnap.data();
        const remoteMaxTs = Math.max(
          data.medidoresUpdatedAt || 0,
          data.aparatosUpdatedAt || 0,
          data.escenariosUpdatedAt || 0
        );
        // Ignorar si el cambio fue originado por esta misma sesión hace menos de 1.5s
        if (remoteMaxTs > 0 && Math.abs(remoteMaxTs - lastSessionWriteTimestamp) < 1500) {
          return;
        }

        let updatedMedidores = null;
        let updatedAparatos = null;
        let updatedEscenarios = null;

        if (Array.isArray(data.medidores) && data.medidores.length > 0) {
          const localMedTs = parseInt(safeGetItem('electrico_casa_medidores_ts_' + proyectoId) || '0', 10);
          if ((data.medidoresUpdatedAt || 0) > localMedTs) {
            updatedMedidores = data.medidores;
            localStore.saveMedidores(proyectoId, updatedMedidores, data.medidoresUpdatedAt || Date.now());
          }
        }

        if (Array.isArray(data.aparatosLista)) {
          const localApTs = parseInt(safeGetItem('electrico_casa_aparatos_ts_' + proyectoId) || '0', 10);
          if ((data.aparatosUpdatedAt || 0) > localApTs) {
            updatedAparatos = data.aparatosLista
              .map((ap, i) => normalizarAparato(ap, proyectoId, i))
              .filter(Boolean);
            localStore.saveAparatos(proyectoId, updatedAparatos, data.aparatosUpdatedAt || Date.now());
          }
        }

        if (data.escenariosPorNegocio && typeof data.escenariosPorNegocio === 'object') {
          const localEscTs = parseInt(safeGetItem('sge_escenarios_por_negocio_ts_' + proyectoId) || '0', 10);
          if ((data.escenariosUpdatedAt || 0) > localEscTs) {
            updatedEscenarios = data.escenariosPorNegocio;
            safeSetItem('sge_escenarios_por_negocio_' + proyectoId, JSON.stringify(updatedEscenarios));
            safeSetItem('sge_escenarios_por_negocio_ts_' + proyectoId, String(data.escenariosUpdatedAt || Date.now()));
            if (data.estadosVentasNegocios && typeof data.estadosVentasNegocios === 'object') {
              safeSetItem('simulador_ventas_v2_' + proyectoId, JSON.stringify(data.estadosVentasNegocios));
            }
          }
        }

        if (updatedMedidores || updatedAparatos || updatedEscenarios) {
          onRemoteUpdate({
            medidores: updatedMedidores,
            aparatos: updatedAparatos,
            escenariosPorNegocio: updatedEscenarios,
            estadosVentasNegocios: data.estadosVentasNegocios || null
          });
        }
      }, (err) => {
        console.warn('Error en suscripción en tiempo real de Firestore:', err);
      });
    } catch (e) {
      return () => {};
    }
  }
};
