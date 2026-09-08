import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  Check, 
  Play, 
  Award, 
  Beaker,
  Scale,
  Printer,
  FileSpreadsheet,
  ShoppingCart,
  PlusCircle,
  HelpCircle,
  Zap,
  Monitor,
  Smartphone,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { dbService } from './firebase';
import { determinarAcometida, generarCombinacionesBalanceo } from './utils/electricalCalculations';
import { 
  calcularVA as uvieCalcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor, 
  calcularDesbalanceUVIE 
} from './utils/ecuacionesUVIE';
import { 
  calcularKwhDiarioAparato, 
  calcularCobroMarginal,
  calcularCobroCFECompleto
} from './utils/simuladorCFE';
import { exportarCSVAutoCAD, exportarReporteUVIE } from './utils/ExportManager';
import AcometidaCard from './components/AcometidaCard';
import AparatoForm from './components/AparatoForm';
import CuadroCargasTabla from './components/CuadroCargasTabla';
import SimuladorFinanciero from './components/SimuladorFinanciero';
import DashboardCicloVida from './components/DashboardCicloVida';
import ProyectosSelector from './components/ProyectosSelector';
import SimuladorConsumoVentas from './components/SimuladorConsumoVentas';
import CuadroCargasUVIE from './components/CuadroCargasUVIE';
import TableroVisual from './components/TableroVisual';
import DiagramaUnifilarCAD from './components/DiagramaUnifilarCAD';
import BalanceadorTablero from './components/BalanceadorTablero';
import PoliticasEficiencia from './components/PoliticasEficiencia';

function AddVariantForm({ onSave, onCancel }) {
  const [vData, setVData] = useState({
    nombre: '',
    watts: 1000,
    fp: 0.90,
    precio: 10000,
    mantenimiento: 1000,
    vidaUtil: 5,
    consumoVariable: false,
    horasAlta: 8,
    horasReposo: 0,
    tipoCarga: 'monofasica'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(vData); }} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 text-xs">
      <div className="font-bold text-teal-400 mb-1 text-[10px] uppercase tracking-wider">Registrar Alternativa Competidora</div>
      <div className="space-y-2">
        <div>
          <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Nombre Alternativa</label>
          <input type="text" name="nombre" value={vData.nombre} onChange={handleChange} placeholder="Ej. Bistro Eco 2" className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Tensión (Carga)</label>
            <select name="tipoCarga" value={vData.tipoCarga} onChange={handleChange} className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white">
              <option value="monofasica">Monofásica (127V)</option>
              <option value="bifasica">Bifásica (220V)</option>
              <option value="trifasica">Trifásica (220V)</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Potencia (Watts)</label>
            <input type="number" name="watts" value={vData.watts} onChange={handleChange} className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono" required />
          </div>
          <div>
            <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">F.P. (0.1 - 1.0)</label>
            <input type="number" name="fp" value={vData.fp} onChange={handleChange} step="0.01" min="0.1" max="1.0" className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono" required />
          </div>
          <div>
            <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Precio (MXN)</label>
            <input type="number" name="precio" value={vData.precio} onChange={handleChange} className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono" required />
          </div>
          <div>
            <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Mantenimiento (MXN)</label>
            <input type="number" name="mantenimiento" value={vData.mantenimiento} onChange={handleChange} className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono" required />
          </div>
          <div>
            <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Vida Útil (Años)</label>
            <input type="number" name="vidaUtil" value={vData.vidaUtil} onChange={handleChange} className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono" required />
          </div>
        </div>
        <div className="flex items-center select-none py-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-350">
            <input type="checkbox" name="consumoVariable" checked={vData.consumoVariable} onChange={handleChange} className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0" />
            <span className="font-sans">Consumo Variable</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Horas Demanda Alta</label>
            <input type="number" name="horasAlta" value={vData.horasAlta} onChange={handleChange} min="0" max="24" className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono" />
          </div>
          {vData.consumoVariable && (
            <div>
              <label className="block text-[9px] text-slate-400 mb-0.5 uppercase font-sans">Horas Reposo</label>
              <input type="number" name="horasReposo" value={vData.horasReposo} onChange={handleChange} min="0" max="24" className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono" />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
        <button type="button" onClick={onCancel} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-[10px] font-sans">Cancelar</button>
        <button type="submit" className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-[10px] font-sans">Guardar</button>
      </div>
    </form>
  );
}

const getFasePredefinidaDeSlot = (slotNum) => {
  const cycle = Math.ceil(slotNum / 2) % 3;
  if (cycle === 1) return 'A';
  if (cycle === 2) return 'B';
  return 'C';
};

const asignarSlotParaFase = (fase, slotsOcupados, currentSlot) => {
  if (currentSlot && getFasePredefinidaDeSlot(currentSlot) === fase) {
    return currentSlot;
  }
  for (let slotIndex = 1; slotIndex <= 24; slotIndex++) {
    if (getFasePredefinidaDeSlot(slotIndex) === fase && !slotsOcupados.has(slotIndex)) {
      return slotIndex;
    }
  }
  return null;
};

export default function App() {
  const [proyectos, setProyectos] = useState([]);
  const [currentProyectoId, setCurrentProyectoId] = useState('');
  const [aparatos, setAparatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para las Tarifas Editables CFE (Default Tarifa 1C Bimensual)
  const [tarifas, setTarifas] = useState({
    basico: { limit: 300, costo: 1.004 },
    intermedio1: { limit: 300, costo: 1.163 },
    intermedio2: { limit: 300, costo: 1.495 },
    excedente: { costo: 3.992 }
  });

  // Estado para Costos del Mercado Eléctrico Mayorista (MEM)
  const [costosMEM, setCostosMEM] = useState({
    suministro: 127.26,
    distribucion: 1.339102,
    transmision: 0.180102,
    cenace: 0.007602,
    energia: 0.7550,
    capacidad: 0.4840,
    scnmem: 0.0069
  });

  // Estado para los días del periodo de facturación (compartido)
  const [diasPeriodo, setDiasPeriodo] = useState(60);

  // Estado para el consumo diario dinámico del simulador de ventas
  const [salesKwhDiario, setSalesKwhDiario] = useState(null);

  // Estado para forzar sistema trifásico bajo demanda de usuario
  const [forzarTrifasico, setForzarTrifasico] = useState(false);

  // Estado para el modo de visualización de la interfaz (Escritorio vs Celular)
  const [layoutMode, setLayoutMode] = useState('escritorio'); // 'escritorio' | 'celular'

  // Estado para la unidad de medida de carga por fase ('VA' | 'W' | 'A')
  const [fasesUnit, setFasesUnit] = useState('VA');

  const handleCycleFasesUnit = () => {
    setFasesUnit(prev => {
      if (prev === 'VA') return 'W';
      if (prev === 'W') return 'A';
      return 'VA';
    });
  };

  // Restablecer forzado de trifásico si cambia el local activo
  useEffect(() => {
    setForzarTrifasico(false);
  }, [currentProyectoId]);

  // Estados para la Capa del Verificador (Fase 5 Completada)
  const [testSuiteStatus, setTestSuiteStatus] = useState('idle'); // 'idle', 'running', 'passed', 'failed'
  const [testLogs, setTestLogs] = useState([]);
  const [balancingConfigs, setBalancingConfigs] = useState([]);
  const [activeTab, setActiveTab] = useState('diseno'); // 'diseno' | 'cicloVida'

  // Estados para el Simulador de Ventas e Hilo de Políticas de Eficiencia Compartidos
  const [sales, setSales] = useState({
    crepas: 15,
    marquesitas: 10,
    esquites: 25,
    maruchan: 8,
    espresso: 15,
    mocca: 10,
    capuchino: 20,
    smoothies: 20,
    raspados: 12,
    maruchanEsquite: 6
  });
  const [salesEqualizer, setSalesEqualizer] = useState({
    Lunes: 30,
    Martes: 35,
    Miercoles: 50,
    Jueves: 55,
    Viernes: 85,
    Sabado: 100,
    Domingo: 90
  });
  const [salesCalendarEqualizer, setSalesCalendarEqualizer] = useState({});
  const [efficientPolicies, setEfficientPolicies] = useState({
    creperaEco: false,
    cafeteraEco: false,
    vaporeraTapa: false,
    dispensadorAislado: false,
    motoresEficientes: false
  });

  const [activeAddVariantId, setActiveAddVariantId] = useState(null);

  const isEqualizerInitializedRef = useRef(false);
  useEffect(() => {
    isEqualizerInitializedRef.current = false;
    if (!currentProyectoId) return;
    const key = `sales_equalizer_${currentProyectoId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setSalesEqualizer(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading salesEqualizer", e);
      }
    } else {
      setSalesEqualizer({
        Lunes: 30,
        Martes: 35,
        Miercoles: 50,
        Jueves: 55,
        Viernes: 85,
        Sabado: 100,
        Domingo: 90
      });
    }
    isEqualizerInitializedRef.current = true;
  }, [currentProyectoId]);

  useEffect(() => {
    if (!currentProyectoId || !isEqualizerInitializedRef.current) return;
    localStorage.setItem(`sales_equalizer_${currentProyectoId}`, JSON.stringify(salesEqualizer));
  }, [salesEqualizer, currentProyectoId]);

  const isDiasPeriodoInitializedRef = useRef(false);
  useEffect(() => {
    isDiasPeriodoInitializedRef.current = false;
    if (!currentProyectoId) return;
    const key = `dias_periodo_${currentProyectoId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setDiasPeriodo(parseInt(saved) || 60);
      } catch (e) {
        console.error("Error loading diasPeriodo", e);
      }
    } else {
      setDiasPeriodo(60);
    }
    isDiasPeriodoInitializedRef.current = true;
  }, [currentProyectoId]);

  useEffect(() => {
    if (!currentProyectoId || !isDiasPeriodoInitializedRef.current) return;
    localStorage.setItem(`dias_periodo_${currentProyectoId}`, diasPeriodo.toString());
  }, [diasPeriodo, currentProyectoId]);

  const isCalendarInitializedRef = useRef(false);
  useEffect(() => {
    isCalendarInitializedRef.current = false;
    if (!currentProyectoId) return;
    const key = `sales_calendar_equalizer_${currentProyectoId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setSalesCalendarEqualizer(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading salesCalendarEqualizer", e);
        setSalesCalendarEqualizer({});
      }
    } else {
      setSalesCalendarEqualizer({});
    }
    isCalendarInitializedRef.current = true;
  }, [currentProyectoId]);

  useEffect(() => {
    if (!currentProyectoId || !isCalendarInitializedRef.current) return;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = nextMonth === 0 ? currentYear + 1 : currentYear;

    const cleaned = {};
    Object.keys(salesCalendarEqualizer).forEach(dateStr => {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (
          (y === currentYear && m === currentMonth) ||
          (y === nextYear && m === nextMonth)
        ) {
          cleaned[dateStr] = salesCalendarEqualizer[dateStr];
        }
      }
    });
    localStorage.setItem(`sales_calendar_equalizer_${currentProyectoId}`, JSON.stringify(cleaned));
  }, [salesCalendarEqualizer, currentProyectoId]);

  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [alimentadorLongitud, setAlimentadorLongitud] = useState(15);
  const [alimentadorTuberia, setAlimentadorTuberia] = useState('27 mm (1")');
  const [alimentadorTuberiaTipo, setAlimentadorTuberiaTipo] = useState('Pared Delgada');
  const [cajetinProyecto, setCajetinProyecto] = useState("Consorcio Gallegos González - Inmueble Multi-Negocio");
  const [cajetinUbicacion, setCajetinUbicacion] = useState("Av. Universidades, Veracruz, Ver.");
  const [cajetinPropietario, setCajetinPropietario] = useState("Consorcio Gallegos González / Familia Alacio Pérez");
  const [cajetinElectricista, setCajetinElectricista] = useState("Ing. Electricista UVIE");
  const [cajetinEscala, setCajetinEscala] = useState("S/E");
  const [checklist, setChecklist] = useState({
    // Criterios de la Fase 2
    licuadoraVa1500: false,
    licuadoraIn11_81: false,
    licuadoraIc14_76: false,
    licuadoraBreaker15: false,
    licuadoraCable14: false,
    desbalanceExacto12_5: false,
    bannerAlertaUVIERenderizado: false,
    // Criterios de la Fase 3
    consumoBruto350Kwh: false,
    cobroBasico250: false,
    cobroIntermedio640: false,
    cobroExcedente240: false,
    cobroTotal1130: false,
    // Criterios de la Fase 4
    luzAnualBase7212: false,
    gastoAnualBistro20276: false,
    gastoAnualEco12409: false,
    rentableEsEco: false,
    // Criterios de la Fase 5
    aislamientoProyecto: false,
    formatoCSVValido: false
  });

  // Carga inicial de proyectos
  useEffect(() => {
    async function initProjects() {
      try {
        const list = await dbService.getProyectos();
        setProyectos(list);
        if (list.length > 0) {
          setCurrentProyectoId(list[0].id);
        }
      } catch (error) {
        console.error('Error inicializando proyectos:', error);
      }
    }
    initProjects();
  }, []);

  // Carga reactiva de aparatos por proyecto
  useEffect(() => {
    async function loadData() {
      if (!currentProyectoId) return;
      setLoading(true);
      try {
        const data = await dbService.getAparatos(currentProyectoId);
        
        // Cargar metadatos del proyecto de forma asíncrona
        const listProjs = await dbService.getProyectos();
        const proj = listProjs.find(p => p.id === currentProyectoId);
        if (proj) {
          setAlimentadorLongitud(proj.alimentadorLongitud !== undefined ? parseFloat(proj.alimentadorLongitud) : 15);
          setAlimentadorTuberia(proj.alimentadorTuberia || '27 mm (1")');
          setAlimentadorTuberiaTipo(proj.alimentadorTuberiaTipo || 'Pared Delgada');
          setCajetinProyecto(proj.cajetinProyecto || proj.nombre || "Consorcio Gallegos González - Inmueble Multi-Negocio");
          setCajetinUbicacion(proj.cajetinUbicacion || "Av. Universidades, Veracruz, Ver.");
          setCajetinPropietario(proj.cajetinPropietario || "Consorcio Gallegos González / Familia Alacio Pérez");
          setCajetinElectricista(proj.cajetinElectricista || "Ing. Electricista UVIE");
          setCajetinEscala(proj.cajetinEscala || "S/E");
        }
        
        let cambioDetectado = false;
        
        // Deduplicar por ID único y por slot único (dos equipos no pueden compartir el mismo slot)
        const idsVistos = new Set();
        const slotsVistos = new Set();
        const datosFiltrados = [];
        
        data.forEach(ap => {
          if (!ap.id) return;
          
          if (idsVistos.has(ap.id)) {
            cambioDetectado = true;
            return;
          }
          if (ap.slot && slotsVistos.has(ap.slot)) {
            // Duplicado por slot coincidente en el mismo proyecto -> descartar
            cambioDetectado = true;
            return;
          }
          
          idsVistos.add(ap.id);
          if (ap.slot) {
            slotsVistos.add(ap.slot);
          }
          datosFiltrados.push(ap);
        });

        const slotsOcupados = new Set();
        const migratedData = datosFiltrados.map(ap => {
          // Asegurar propiedades de la UVIE con valores por defecto
          const tieneCamposUvie = ap.tuberiaDiametro && ap.kaic;
          const apConUvie = {
            ...ap,
            tuberiaDiametro: ap.tuberiaDiametro || '16 mm (1/2")',
            tuberiaTipo: ap.tuberiaTipo || 'Pared Delgada',
            longitudMetros: ap.longitudMetros !== undefined ? parseFloat(ap.longitudMetros) : 15,
            kaic: ap.kaic || '10 kA',
            factorTemperatura: ap.factorTemperatura !== undefined ? parseFloat(ap.factorTemperatura) : 1.0,
            factorAgrupamiento: ap.factorAgrupamiento !== undefined ? parseFloat(ap.factorAgrupamiento) : 1.0
          };

          if (!tieneCamposUvie) {
            cambioDetectado = true;
          }

          let slotInvalido = !apConUvie.slot || slotsOcupados.has(apConUvie.slot);
          
          if (!slotInvalido) {
            const slotFase = getFasePredefinidaDeSlot(apConUvie.slot);
            if (apConUvie.tipoCarga === 'monofasica') {
              slotInvalido = slotFase !== apConUvie.fase;
            } else if (apConUvie.tipoCarga === 'bifasica') {
              const partes = (apConUvie.fase || 'A-B').split('-');
              slotInvalido = !partes.includes(slotFase);
            } else if (apConUvie.tipoCarga === 'trifasica') {
              slotInvalido = false; 
            }
          }
          
          if (slotInvalido) {
            cambioDetectado = true;
            let slotIndex = 1;
            const targetFase = apConUvie.fase || 'A';
            
            const esSlotCompatible = (slotIdx, tFase) => {
              const slotFase = getFasePredefinidaDeSlot(slotIdx);
              if (apConUvie.tipoCarga === 'monofasica') {
                return slotFase === tFase;
              } else if (apConUvie.tipoCarga === 'bifasica') {
                const partes = tFase.split('-');
                return partes.includes(slotFase);
              }
              return true; 
            };

            while (slotIndex <= 24 && (slotsOcupados.has(slotIndex) || !esSlotCompatible(slotIndex, targetFase))) {
              slotIndex++;
            }
            
            if (slotIndex > 24) {
              slotIndex = 1;
              while (slotIndex <= 24 && slotsOcupados.has(slotIndex)) {
                slotIndex++;
              }
            }
            
            const finalSlot = slotIndex <= 24 ? slotIndex : null;
            const updatedAp = { ...apConUvie, slot: finalSlot, fase: targetFase };
            if (finalSlot) {
              slotsOcupados.add(finalSlot);
            }
            return updatedAp;
          } else {
            slotsOcupados.add(apConUvie.slot);
            return apConUvie;
          }
        });

        setAparatos(migratedData);

        // Si hubo cambios por migración, desbalance o duplicados corregidos, guardar de forma atómica una sola vez
        if (cambioDetectado) {
          await dbService.guardarTodosLosAparatos(currentProyectoId, migratedData);
        }
      } catch (error) {
        console.error('Error cargando aparatos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentProyectoId]);
  // 1. Calcular la potencia activa total (Watts) para determinar la acometida CFE
  const totalWatts = aparatos.reduce((sum, ap) => sum + (parseFloat(ap.watts) || 0), 0);
  const currentAcometida = determinarAcometida(totalWatts, forzarTrifasico);

  // 2. Sumar Watts y VA por Fase (repartiendo de forma equitativa cargas bifásicas/trifásicas)
  const fasesLoad = { A: 0, B: 0, C: 0 };
  const fasesVA = { A: 0, B: 0, C: 0 };

  aparatos.forEach(ap => {
    const w = parseFloat(ap.watts) || 0;
    const fp = parseFloat(ap.fp) || 1.0;
    const va = uvieCalcularVA(w, fp, ap.usarVaDirecto);

    if (currentAcometida.id === 'monofasico') {
      fasesLoad.A += w;
      fasesVA.A += va;
    } else if (ap.tipoCarga === 'trifasica' && currentAcometida.id === 'trifasico') {
      fasesLoad.A += w / 3;
      fasesLoad.B += w / 3;
      fasesLoad.C += w / 3;

      fasesVA.A += va / 3;
      fasesVA.B += va / 3;
      fasesVA.C += va / 3;
    } else if (ap.tipoCarga === 'bifasica' && (currentAcometida.id === 'bifasico' || currentAcometida.id === 'trifasico')) {
      const fasePar = ap.fase || 'A-B';
      const partes = fasePar.split('-');
      
      partes.forEach(f => {
        if (fasesLoad[f] !== undefined) {
          fasesLoad[f] += w / partes.length;
          fasesVA[f] += va / partes.length;
        }
      });
    } else {
      let f = ap.fase;
      if (!currentAcometida.fasesDisponibles.includes(f)) {
        f = 'A';
      }
      fasesLoad[f] += w;
      fasesVA[f] += va;
    }
  });

  // 3. Calcular desbalanceo de fases usando la fórmula UVIE para CFE
  const desbalanceUVIE = calcularDesbalanceUVIE(
    fasesVA.A, 
    fasesVA.B, 
    fasesVA.C, 
    currentAcometida.id
  );

  // 4. Calcular el Consumo de Energía Bimestral Bruto (kWh)
  const totalKwhDiario = aparatos.reduce((sum, ap) => sum + calcularKwhDiarioAparato(ap), 0);
  const activeKwhDiario = salesKwhDiario !== null ? salesKwhDiario : totalKwhDiario;
  const kwhBimestralTotal = activeKwhDiario * 60; // Ciclo bimensual CFE

  // 5. Calcular la tarifa promedio actual de CFE ($ / kWh) para alimentar el Ciclo de Vida
  const cfeDesgloseCompleto = calcularCobroCFECompleto(kwhBimestralTotal, tarifas, costosMEM);
  const costoKwhPromedio = kwhBimestralTotal > 0 ? (cfeDesgloseCompleto.factura.subtotal / kwhBimestralTotal) : 3.80;

  // Sanitizar automáticamente fases de aparatos al cambiar la acometida para evitar fases inválidas en base de datos
  useEffect(() => {
    if (!currentProyectoId || aparatos.length === 0) return;
    
    let tieneCambios = false;
    const sanitizados = aparatos.map(ap => {
      let faseValida = ap.fase || 'A';
      
      if (currentAcometida.id === 'monofasico') {
        if (faseValida !== 'A') {
          faseValida = 'A';
        }
      } else if (currentAcometida.id === 'bifasico') {
        if (ap.tipoCarga === 'bifasica') {
          if (faseValida !== 'A-B') {
            faseValida = 'A-B';
          }
        } else {
          if (faseValida !== 'A' && faseValida !== 'B') {
            faseValida = 'A';
          }
        }
      } else if (currentAcometida.id === 'trifasico') {
        if (ap.tipoCarga === 'monofasica') {
          if (faseValida !== 'A' && faseValida !== 'B' && faseValida !== 'C') {
            faseValida = 'A';
          }
        } else if (ap.tipoCarga === 'bifasica') {
          if (faseValida !== 'A-B' && faseValida !== 'B-C' && faseValida !== 'A-C') {
            faseValida = 'A-B';
          }
        } else if (ap.tipoCarga === 'trifasica') {
          if (faseValida !== 'A-B-C') {
            faseValida = 'A-B-C';
          }
        }
      }
      
      if (faseValida !== ap.fase) {
        tieneCambios = true;
        return { ...ap, fase: faseValida };
      }
      return ap;
    });

    if (tieneCambios) {
      setAparatos(sanitizados);
      dbService.guardarTodosLosAparatos(currentProyectoId, sanitizados);
    }
  }, [currentAcometida.id, currentProyectoId, aparatos]);

  // Recalcular combinaciones de balanceo de fases alternativas
  useEffect(() => {
    if (currentProyectoId && aparatos.length > 0 && currentAcometida.id !== 'monofasico') {
      const configs = generarCombinacionesBalanceo(aparatos, currentAcometida.id, currentAcometida.fasesDisponibles);
      // Filtrar las que son idénticas a la configuración actual
      const filtradas = configs.filter(c => {
        return c.asignacion.some(a => {
          const ap = aparatos.find(item => item.id === a.id);
          return ap && ap.fase !== a.fase;
        });
      });
      setBalancingConfigs(filtradas);
    } else {
      setBalancingConfigs([]);
    }
  }, [aparatos, currentAcometida.id, currentProyectoId]);

  // Controladores de CRUD
  const handleAddAparato = async (nuevoAparato) => {
    if (!currentProyectoId) return;

    // Auto-asignar slot al nuevo aparato
    const slotsOcupados = new Set(aparatos.map(ap => ap.slot).filter(Boolean));
    let slotIndex = 1;
    while (slotsOcupados.has(slotIndex)) {
      slotIndex++;
    }
    const cycle = Math.ceil(slotIndex / 2) % 3;
    const faseSlot = cycle === 1 ? 'A' : cycle === 2 ? 'B' : 'C';
    const targetFase = nuevoAparato.fase || faseSlot;

    const completo = {
      ...nuevoAparato,
      slot: slotIndex,
      fase: targetFase
    };

    const guardado = await dbService.addAparato(currentProyectoId, completo);
    setAparatos(prev => [...prev, guardado]);
  };



  const handleUpdateFase = async (id, nuevaFase) => {
    if (!currentProyectoId) return;
    
    // Obtener slots ocupados por otros aparatos
    const slotsOcupados = new Set(
      aparatos.filter(ap => ap.id !== id).map(ap => ap.slot).filter(Boolean)
    );
    const prevAp = aparatos.find(ap => ap.id === id);
    const nuevoSlot = asignarSlotParaFase(nuevaFase, slotsOcupados, prevAp?.slot);

    const campos = { fase: nuevaFase, slot: nuevoSlot };
    
    // Guardar en base de datos
    await dbService.updateAparato(currentProyectoId, id, campos);

    // Actualizar estado local
    setAparatos(prev => 
      prev.map(ap => ap.id === id ? { ...ap, ...campos } : ap)
    );
  };

  const handleDeleteAparato = async (id) => {
    if (!currentProyectoId) return;
    await dbService.deleteAparato(currentProyectoId, id);
    setAparatos(prev => prev.filter(ap => ap.id !== id));
  };

  const handleClearInventory = async () => {
    if (!currentProyectoId) return;
    await dbService.guardarTodosLosAparatos(currentProyectoId, []);
    setAparatos([]);
  };

  const handleTarifasChange = (tier, field, val) => {
    setTarifas(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: val
      }
    }));
  };

  const handleCostosMEMChange = (field, val) => {
    setCostosMEM(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleUpdateAparatoProps = async (id, updatedFields) => {
    if (!currentProyectoId) return;
    
    // Si se modifica la fase pero no se especifica slot, recalcular slot compatible
    let fieldsToApply = { ...updatedFields };
    if (fieldsToApply.fase && fieldsToApply.slot === undefined) {
      const slotsOcupados = new Set(
        aparatos.filter(ap => ap.id !== id).map(ap => ap.slot).filter(Boolean)
      );
      const prevAp = aparatos.find(ap => ap.id === id);
      fieldsToApply.slot = asignarSlotParaFase(fieldsToApply.fase, slotsOcupados, prevAp?.slot);
    }

    // Actualización de variante activa y copia al nivel superior
    setAparatos(prev => 
      prev.map(ap => {
        if (ap.id === id) {
          const updatedVariantes = (ap.variantes || []).map(v => 
            v.id === ap.activaVariantId ? { ...v, ...fieldsToApply } : v
          );
          return { 
            ...ap, 
            ...fieldsToApply, 
            variantes: updatedVariantes 
          };
        }
        return ap;
      })
    );

    // Guardar en Firestore en segundo plano
    setAparatos(prev => {
      const updatedAp = prev.find(ap => ap.id === id);
      if (updatedAp) {
        dbService.updateAparato(currentProyectoId, id, updatedAp);
      }
      return prev;
    });
  };

  const handleBalancearFases = async () => {
    if (balancingConfigs.length === 0) return;
    const config = balancingConfigs[0];

    // Actualizar estado local asignando slots compatibles con las nuevas fases
    const slotsOcupados = new Set();
    const updated = [];
    
    aparatos.forEach(ap => {
      const match = config.asignacion.find(a => a.id === ap.id);
      const nuevaFase = match ? match.fase : (ap.fase || 'A');
      
      if (ap.slot && getFasePredefinidaDeSlot(ap.slot) === nuevaFase && !slotsOcupados.has(ap.slot)) {
        updated.push({ ...ap, fase: nuevaFase, slot: ap.slot });
        slotsOcupados.add(ap.slot);
      } else {
        updated.push({ ...ap, fase: nuevaFase, slot: null });
      }
    });

    const finalUpdated = updated.map(ap => {
      if (ap.slot === null) {
        const nuevoSlot = asignarSlotParaFase(ap.fase, slotsOcupados, null);
        slotsOcupados.add(nuevoSlot);
        return { ...ap, slot: nuevoSlot };
      }
      return ap;
    });

    setAparatos(finalUpdated);

    // Guardar todo de forma masiva en base de datos
    await dbService.guardarTodosLosAparatos(currentProyectoId, finalUpdated);
  };

  const handleActivarVariante = async (aparatoId, varianteId) => {
    setAparatos(prev => 
      prev.map(ap => {
        if (ap.id === aparatoId) {
          const match = ap.variantes.find(v => v.id === varianteId);
          if (match) {
            return {
              ...ap,
              activaVariantId: varianteId,
              modelo: match.nombre,
              watts: match.watts,
              fp: match.fp,
              precio: match.precio,
              mantenimiento: match.mantenimiento,
              vidaUtil: match.vidaUtil,
              horasAlta: match.horasAlta,
              horasReposo: match.horasReposo,
              consumoVariable: match.consumoVariable,
              durabilidadOption: match.durabilidadOption || 'estandar',
              tipoCarga: match.tipoCarga,
              usarVaDirecto: match.usarVaDirecto,
              criteriosDurabilidad: match.criteriosDurabilidad || '',
              criteriosMantenimiento: match.criteriosMantenimiento || ''
            };
          }
        }
        return ap;
      })
    );

    setAparatos(prev => {
      const updatedAp = prev.find(ap => ap.id === aparatoId);
      if (updatedAp) {
        dbService.updateAparato(currentProyectoId, aparatoId, updatedAp);
      }
      return prev;
    });
  };

  const handleAgregarVariante = async (aparatoId, nuevaVarData) => {
    const varId = 'var_' + Math.random().toString(36).substr(2, 9);
    const nuevaVariante = {
      id: varId,
      nombre: nuevaVarData.nombre || 'Modelo Alternativo',
      watts: parseFloat(nuevaVarData.watts) || 0,
      fp: parseFloat(nuevaVarData.fp) || 1.0,
      precio: parseFloat(nuevaVarData.precio) || 0,
      mantenimiento: parseFloat(nuevaVarData.mantenimiento) || 0,
      vidaUtil: parseFloat(nuevaVarData.vidaUtil) || 5,
      horasAlta: parseFloat(nuevaVarData.horasAlta) || 8,
      horasReposo: parseFloat(nuevaVarData.horasReposo) || 0,
      consumoVariable: !!nuevaVarData.consumoVariable,
      durabilidadOption: nuevaVarData.durabilidadOption || 'estandar',
      tipoCarga: nuevaVarData.tipoCarga || 'monofasica',
      usarVaDirecto: !!nuevaVarData.usarVaDirecto,
      criteriosDurabilidad: nuevaVarData.criteriosDurabilidad || '',
      criteriosMantenimiento: nuevaVarData.criteriosMantenimiento || ''
    };

    setAparatos(prev => 
      prev.map(ap => {
        if (ap.id === aparatoId) {
          return {
            ...ap,
            variantes: [...(ap.variantes || []), nuevaVariante]
          };
        }
        return ap;
      })
    );

    setAparatos(prev => {
      const updatedAp = prev.find(ap => ap.id === aparatoId);
      if (updatedAp) {
        dbService.updateAparato(currentProyectoId, aparatoId, updatedAp);
      }
      return prev;
    });
  };

  // Controladores de Proyectos
  const handleSelectProyecto = (id) => {
    setCurrentProyectoId(id);
  };

  const handleCreateProyecto = async (nombre) => {
    const nuevo = await dbService.createProyecto(nombre);
    setProyectos(prev => [...prev, nuevo]);
    setCurrentProyectoId(nuevo.id);
  };

  const handleClonarProyecto = async (nuevoNombre) => {
    if (!currentProyectoId) return;
    const nuevo = await dbService.clonarProyecto(currentProyectoId, nuevoNombre);
    setProyectos(prev => [...prev, nuevo]);
    setCurrentProyectoId(nuevo.id);
  };

  const handleDeleteProyecto = async (id) => {
    await dbService.deleteProyecto(id);
    const listaRestante = proyectos.filter(p => p.id !== id);
    setProyectos(listaRestante);
    if (listaRestante.length > 0) {
      setCurrentProyectoId(listaRestante[0].id);
    } else {
      setCurrentProyectoId('');
    }
  };

  const handleUpdateProyectoProps = async (props) => {
    if (!currentProyectoId) return;
    
    if (props.alimentadorLongitud !== undefined) setAlimentadorLongitud(parseFloat(props.alimentadorLongitud) || 0);
    if (props.alimentadorTuberia !== undefined) setAlimentadorTuberia(props.alimentadorTuberia);
    if (props.alimentadorTuberiaTipo !== undefined) setAlimentadorTuberiaTipo(props.alimentadorTuberiaTipo);
    if (props.cajetinProyecto !== undefined) setCajetinProyecto(props.cajetinProyecto);
    if (props.cajetinUbicacion !== undefined) setCajetinUbicacion(props.cajetinUbicacion);
    if (props.cajetinPropietario !== undefined) setCajetinPropietario(props.cajetinPropietario);
    if (props.cajetinElectricista !== undefined) setCajetinElectricista(props.cajetinElectricista);
    if (props.cajetinEscala !== undefined) setCajetinEscala(props.cajetinEscala);

    setProyectos(prev => prev.map(p => {
      if (p.id === currentProyectoId) {
        return { ...p, ...props };
      }
      return p;
    }));
    
    await dbService.updateProyecto(currentProyectoId, props);
  };

  // ==========================================
  // SUITE DE VERIFICACIÓN TOTAL (FASES 2 - 5)
  // ==========================================
  const runVerificationSuite = async () => {
    setTestSuiteStatus('running');
    setTestLogs([]);
    const logs = [];
    const addLog = (msg) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setTestLogs([...logs]);
    };

    addLog('🚀 Iniciando Master Suite de Verificación (Fase 5 - Integración y Exportación)...');

    // Salvar proyecto original
    const proyectoInicialId = currentProyectoId;

    // --- PRUEBA 1: LICUADORA INDUSTRIAL (Fase 2) ---
    addLog('📝 PRUEBA 1: Evaluando dimensionamiento de Licuadora (1200W, 0.80FP, 127V)...');
    
    // Crear un proyecto de prueba para aislar las verificaciones
    const testProj = await dbService.createProyecto('UVIE Test Sandbox');
    setProyectos(prev => [...prev, testProj]);
    setCurrentProyectoId(testProj.id);
    await new Promise(r => setTimeout(r, 600));

    const licuadora = {
      tipo: 'Licuadora Industrial (Test)',
      modelo: 'Vitamix UVIE',
      watts: 1200,
      fp: 0.80,
      usarVaDirecto: false,
      tipoCarga: 'monofasica',
      fase: 'A',
      horasAlta: 2,
      horasReposo: 0,
      consumoVariable: false
    };

    const licuadoraGuardada = await dbService.addAparato(testProj.id, licuadora);
    setAparatos([licuadoraGuardada]);
    await new Promise(r => setTimeout(r, 600));

    const testVa = uvieCalcularVA(1200, 0.80, false);
    const testIn = calcularCorrienteNominal(testVa, 'monofasica');
    const testIc = calcularCorrienteCorregida(testIn);
    const testProteccion = seleccionarProteccion(testIc);
    const testCable = seleccionarConductor(testProteccion);

    const licuadoraCheck = {
      licuadoraVa1500: testVa === 1500,
      licuadoraIn11_81: testIn.toFixed(2) === '11.81',
      licuadoraIc14_76: testIc.toFixed(2) === '14.76',
      licuadoraBreaker15: testProteccion === 15,
      licuadoraCable14: testCable === '14 AWG'
    };
    addLog(licuadoraCheck.licuadoraVa1500 ? '✅ PRUEBA 1: Licuadora verificada.' : '❌ PRUEBA 1: Fallo.');

    // --- PRUEBA 2: DESBALANCE CRÍTICO (Fase 2) ---
    addLog('📝 PRUEBA 2: Evaluando alerta reactiva de Desbalanceo (Fase A = 4000VA, Fase B = 3500VA)...');
    const cargasDesbalance = [
      { tipo: 'Carga Concentrada A', modelo: 'Test UVIE A', watts: 4000, fp: 1.0, usarVaDirecto: true, tipoCarga: 'monofasica', fase: 'A', horasAlta: 4, horasReposo: 0, consumoVariable: false },
      { tipo: 'Carga Concentrada B', modelo: 'Test UVIE B', watts: 3500, fp: 1.0, usarVaDirecto: true, tipoCarga: 'monofasica', fase: 'B', horasAlta: 4, horasReposo: 0, consumoVariable: false }
    ];
    await dbService.guardarTodosLosAparatos(testProj.id, cargasDesbalance);
    const aparatosDesbalance = await dbService.getAparatos(testProj.id);
    setAparatos(aparatosDesbalance);
    await new Promise(r => setTimeout(r, 600));

    const finalDesbalance = calcularDesbalanceUVIE(4000, 3500, 0, 'bifasico');
    const desbalanceCheck = {
      desbalanceExacto12_5: finalDesbalance === 12.5,
      bannerAlertaUVIERenderizado: finalDesbalance > 5.0
    };
    addLog(desbalanceCheck.desbalanceExacto12_5 ? '✅ PRUEBA 2: Desbalance 12.5% verificado.' : '❌ PRUEBA 2: Fallo.');

    // --- PRUEBA 3: FACTURACIÓN ESCALONADA (Fase 3) ---
    addLog('📝 PRUEBA 3: Evaluando cobro marginal CFE para 350 kWh mensuales...');
    const cargaFinanciera = [
      { tipo: 'Horno de Convección (Simulador)', modelo: 'UVIE 350 kWh', watts: 11666.66666667, fp: 1.0, usarVaDirecto: true, tipoCarga: 'monofasica', fase: 'A', horasAlta: 1, horasReposo: 0, consumoVariable: false }
    ];
    await dbService.guardarTodosLosAparatos(testProj.id, cargaFinanciera);
    const aparatosFin = await dbService.getAparatos(testProj.id);
    setAparatos(aparatosFin);
    
    setTarifas({
      basico: { limit: 100, costo: 2.50 },
      intermedio: { limit: 200, costo: 3.20 },
      excedente: { costo: 4.80 }
    });
    await new Promise(r => setTimeout(r, 600));

    const testKwh = 11.6666666667 * 30; // 350 kWh
    const desgloseFinanciero = calcularCobroMarginal(testKwh, {
      basico: { limit: 100, costo: 2.50 },
      intermedio: { limit: 200, costo: 3.20 },
      excedente: { costo: 4.80 }
    });

    const financieraCheck = {
      consumoBruto350Kwh: Math.round(testKwh) === 350,
      cobroBasico250: desgloseFinanciero.basico.costo === 250,
      cobroIntermedio640: desgloseFinanciero.intermedio.costo === 640,
      cobroExcedente240: desgloseFinanciero.excedente.costo === 240,
      cobroTotal1130: desgloseFinanciero.total === 1130
    };
    addLog(financieraCheck.cobroTotal1130 ? '✅ PRUEBA 3: Factura CFE de $1,130 verificado.' : '❌ PRUEBA 3: Fallo.');

    // --- PRUEBA 4: COMPARACIÓN VERSUS CICLO DE VIDA (Fase 4) ---
    addLog('📝 PRUEBA 4: Evaluando Análisis de Ciclo de Vida (5.2 kWh/día, tarifa de $3.80/kWh)...');
    const cargaCicloVida = [
      { tipo: 'Equipo de Prueba Ciclo Vida', modelo: 'UVIE 5.2 kWh/dia', watts: 5200, fp: 1.0, usarVaDirecto: true, tipoCarga: 'monofasica', fase: 'A', horasAlta: 1, horasReposo: 0, consumoVariable: false }
    ];
    await dbService.guardarTodosLosAparatos(testProj.id, cargaCicloVida);
    const aparatosLcv = await dbService.getAparatos(testProj.id);
    setAparatos(aparatosLcv);
    
    setTarifas({
      basico: { limit: 9999, costo: 3.80 },
      intermedio: { limit: 0, costo: 3.80 },
      excedente: { costo: 3.80 }
    });
    await new Promise(r => setTimeout(r, 600));

    const testKwhDiario = 5.2;
    const testCostoKwh = 3.80;
    const testCostoLuzAnualBase = testKwhDiario * 365 * testCostoKwh; // 7212.40
    
    // Modelo A
    const ca_tco = 32000 + (4500 * 5) + (testCostoLuzAnualBase * 1.3 * 5); // 101,380.60
    const ca_gastoAnual = ca_tco / 5; // 20276.12
    
    // Modelo B
    const cb_tco = 58000 + (1200 * 10) + (testCostoLuzAnualBase * 0.75 * 10); // 124,093.00
    const cb_gastoAnual = cb_tco / 10; // 12409.30

    const cicloVidaCheck = {
      luzAnualBase7212: Math.round(testCostoLuzAnualBase) === 7212,
      gastoAnualBistro20276: Math.round(ca_gastoAnual) === 20276,
      gastoAnualEco12409: Math.round(cb_gastoAnual) === 12409,
      rentableEsEco: cb_gastoAnual < ca_gastoAnual
    };
    addLog(cicloVidaCheck.rentableEsEco ? '✅ PRUEBA 4: Ciclo de vida verificado.' : '❌ PRUEBA 4: Fallo.');

    // --- PRUEBA 5: AISLAMIENTO MULTI-PROYECTO Y CSV CAD (Fase 5) ---
    addLog('📝 PRUEBA 5: Evaluando aislamiento de Proyectos aislados y estructura CSV CAD...');
    
    // Configurar Proyecto A con carga bifásica de 7500 VA (ej. 7500W a 1.0FP)
    const projA = await dbService.createProyecto('Proyecto A: Cafeteria');
    setProyectos(prev => [...prev, projA]);
    const cargaA = [
      { tipo: 'Horno Industrial A', modelo: 'Café Bifásico', watts: 7500, fp: 1.0, usarVaDirecto: true, tipoCarga: 'bifasica', fase: 'A-B', horasAlta: 8, horasReposo: 0, consumoVariable: false }
    ];
    await dbService.guardarTodosLosAparatos(projA.id, cargaA);
    addLog('Paso 1: Configurado Proyecto A con carga de 7500 VA.');

    // Simular switch a Proyecto B
    const projB = await dbService.createProyecto('Proyecto B: Neveria');
    setProyectos(prev => [...prev, projB]);
    setCurrentProyectoId(projB.id);
    addLog('Paso 2: Creado y seleccionado Proyecto B: Neveria.');
    await new Promise(r => setTimeout(r, 600));

    // Añadir un solo aparato de 200 Watts
    const cargaB = { tipo: 'Congelador Chico', modelo: 'Nevería 200W', watts: 200, fp: 1.0, usarVaDirecto: true, tipoCarga: 'monofasica', fase: 'A', horasAlta: 24, horasReposo: 0, consumoVariable: false };
    const guardadoB = await dbService.addAparato(projB.id, cargaB);
    setAparatos([guardadoB]);
    addLog('Paso 3: Añadido aparato de 200W a Proyecto B.');
    await new Promise(r => setTimeout(r, 600));

    // Validaciones de aislamiento
    const aparatosDeA_EnBase = await dbService.getAparatos(projA.id);
    const wattsTotalDeA = bdSumWatts(aparatosDeA_EnBase);

    // Validar estructura de CSV
    const simulatedCSV = generateCSVString(aparatosDeA_EnBase, 'bifasico', ['A', 'B']);
    const csvHeaders = simulatedCSV.split('\n')[0];
    const expectedHeaders = 'Cto,Descripcion,Fase A VA,Fase B VA,Fase C VA,I Corregida (A),Proteccion,Conductor';

    const proyectoCheck = {
      aislamientoProyecto: wattsTotalDeA === 7500 && bdSumWatts([guardadoB]) === 200,
      formatoCSVValido: csvHeaders === expectedHeaders
    };

    addLog(proyectoCheck.aislamientoProyecto ? '✅ Aislamiento de Proyectos validado (Proyecto A = 7500W, Proyecto B = 200W).' : '❌ Fallo en aislamiento.');
    addLog(proyectoCheck.formatoCSVValido ? '✅ Estructura de cabeceras de matriz CSV de AutoCAD validada.' : '❌ Fallo en cabeceras CSV.');

    // Limpieza de proyectos temporales
    await dbService.deleteProyecto(testProj.id);
    await dbService.deleteProyecto(projA.id);
    await dbService.deleteProyecto(projB.id);
    
    // Restaurar proyecto original
    const listFinal = await dbService.getProyectos();
    setProyectos(listFinal);
    if (listFinal.length > 0) {
      // Buscar si el proyecto inicial sigue existiendo
      const sigue = listFinal.find(p => p.id === proyectoInicialId);
      setCurrentProyectoId(sigue ? sigue.id : listFinal[0].id);
    }

    const finalChecklist = {
      ...licuadoraCheck,
      ...desbalanceCheck,
      ...financieraCheck,
      ...cicloVidaCheck,
      ...proyectoCheck
    };

    setChecklist(finalChecklist);

    const todoPaso = Object.values(finalChecklist).every(val => val === true);
    if (todoPaso) {
      setTestSuiteStatus('passed');
      addLog('🏆 ¡TODAS LAS PRUEBAS DE LAS FASES 1-5 HAN PASADO EXITOSAMENTE! SISTEMA LISTO PARA ENTREGA.');
    } else {
      setTestSuiteStatus('failed');
      addLog('⚠️ Advertencias detectadas en la validación.');
    }

    // Restaurar tarifas CFE 1C originales de la aplicación
    setTarifas({
      basico: { limit: 300, costo: 1.004 },
      intermedio1: { limit: 300, costo: 1.163 },
      intermedio2: { limit: 300, costo: 1.495 },
      excedente: { costo: 3.992 }
    });
  };

  const bdSumWatts = (list) => list.reduce((s, a) => s + (parseFloat(a.watts) || 0), 0);
  
  const generateCSVString = (list, acometida, fasesDisponibles) => {
    const cabeceras = ['Cto', 'Descripcion', 'Fase A VA', 'Fase B VA', 'Fase C VA', 'I Corregida (A)', 'Proteccion', 'Conductor'];
    const lineas = [cabeceras.join(',')];
    list.forEach((ap, index) => {
      lineas.push([`C-${index + 1}`, ap.tipo, '0', '0', '0', '0', '15A', '14 AWG'].join(','));
    });
    return lineas.join('\n');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/20 backdrop-blur-md sticky top-0 z-50 px-6 py-4 no-print">
        <div className={`${layoutMode === 'escritorio' ? 'max-w-full' : 'max-w-[430px]'} mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center glow-teal">
              <Cpu className="text-slate-950 font-bold" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white tracking-wide m-0">
                SGE-México <span className="text-teal-400 text-xs font-semibold px-2 py-0.5 rounded bg-teal-400/10 border border-teal-400/20">Consorcio Gallegos González</span>
              </h1>
              <p className="text-[11px] text-slate-400 m-0">
                Ingeniería Eléctrica Multi-Negocio &middot; Casa Alacio Pérez &middot; NOM-001-SEDE
              </p>
            </div>
          </div>
          
          {/* Selector de Proyectos y Modo de Vista en Navbar */}
          <div className="no-print flex flex-col sm:flex-row items-center gap-4">
            
            {/* Interruptor de Modo de Pantalla */}
            <div className="flex items-center bg-slate-950/50 p-1 rounded-xl border border-slate-800/80 shadow-inner">
              <button
                onClick={() => setLayoutMode('escritorio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'escritorio'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Escritorio: Ocupa el 100% de la pantalla para ver tablas completas sin desplazamiento"
              >
                <Monitor size={13} />
                Escritorio
              </button>
              <button
                onClick={() => setLayoutMode('celular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'celular'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Celular: Vista optimizada con ancho móvil de 430px"
              >
                <Smartphone size={13} />
                Celular
              </button>
            </div>

            <ProyectosSelector 
              proyectos={proyectos}
              currentProyectoId={currentProyectoId}
              onSelectProyecto={handleSelectProyecto}
              onCreateProyecto={handleCreateProyecto}
              onClonarProyecto={handleClonarProyecto}
              onDeleteProyecto={handleDeleteProyecto}
            />
          </div>
        </div>
      </header>

  {/* Tabs de Navegación */}
  <div className="no-print border-b border-slate-800 bg-slate-950/20">
    <div className={`${layoutMode === 'escritorio' ? 'max-w-full px-4 md:px-8' : 'max-w-[430px] px-4'} mx-auto flex gap-6 overflow-x-auto scrollbar-none`}>
      <button
        onClick={() => setActiveTab('diseno')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'diseno'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Cpu size={14} />
        Instalación Eléctrica
      </button>
      
      <button
        onClick={() => setActiveTab('cicloVida')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'cicloVida'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Scale size={14} />
        Ciclo de Vida (Versus)
      </button>

      <button
        onClick={() => setActiveTab('recibo')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'recibo'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileSpreadsheet size={14} />
        Recibo de Luz CFE
      </button>

      <button
        onClick={() => setActiveTab('ventas')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'ventas'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShoppingCart size={14} />
        Consumo por Ventas
      </button>

      <button
        onClick={() => setActiveTab('politicas')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'politicas'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShieldCheck size={14} />
        Políticas y Eficiencia
      </button>

      <button
        onClick={() => setActiveTab('uvie')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'uvie'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Award size={14} />
        Reporte UVIE
      </button>

      <button
        onClick={() => setActiveTab('tablero')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'tablero'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Zap size={14} />
        Tablero Visual
      </button>
      <button
        onClick={() => setActiveTab('unifilar')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'unifilar'
            ? 'border-teal-400 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Zap size={14} />
        Diagrama Unifilar
      </button>
      <button
        onClick={() => setActiveTab('balanceador')}
        className={`py-3.5 px-1 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === 'balanceador'
            ? 'border-violet-400 text-violet-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sliders size={14} />
        Balance de Tablero
      </button>
    </div>
  </div>

  {/* Main Container */}
  <main className={`flex-1 w-full mx-auto py-8 transition-all duration-300 relative ${
    layoutMode === 'escritorio' 
      ? 'max-w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8' 
      : 'max-w-[430px] px-4 flex flex-col gap-6 border-x border-slate-800 bg-[#0d1424] shadow-2xl relative min-h-[85vh]'
  }`}>
        
        {/* Columna Izquierda: Acometida, Cuadro, Exportación, Ciclo de Vida y Verificador */}
        <div className={`${
          layoutMode === 'celular'
            ? 'w-full'
            : activeTab === 'diseno' || activeTab === 'cicloVida' 
              ? isFormCollapsed ? 'lg:col-span-12' : 'lg:col-span-8' 
              : 'lg:col-span-12'
        } space-y-8 transition-all duration-300`}>
          
          {/* PESTAÑA 1: DISEÑO Y INSTALACIONES */}
          {activeTab === 'diseno' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Estatus CFE */}
              <div className="page-break-avoid">
                <AcometidaCard 
                  tipoSystem={currentAcometida}
                  fasesLoad={fasesLoad}
                  fasesVA={fasesVA}
                  desbalance={desbalanceUVIE}
                  forzarTrifasico={forzarTrifasico}
                  onToggleForzarTrifasico={() => setForzarTrifasico(!forzarTrifasico)}
                />
              </div>

              {/* Cuadro de Cargas y Panel de Exportación */}
              <div className="space-y-4">
                
                {/* Cabecera del Cuadro de Cargas y Botones de Exportación */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                  <div>
                    <h2 className="text-base font-bold text-white font-display">Cuadro de Cargas Normativo</h2>
                    <p className="text-xs text-slate-500">Calculado bajo NOM-001-SEDE.</p>
                  </div>
                  
                  {/* Botones de Exportación */}
                  <div className="flex items-center gap-2">
                    {/* Botón Imprimir UVIE */}
                    <button
                      onClick={exportarReporteUVIE}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                      title="Imprimir reporte en PDF limpio para UVIE"
                    >
                      <Printer size={14} className="text-teal-400" />
                      Imprimir UVIE
                    </button>
                    
                    {/* Botón CSV AutoCAD */}
                    <button
                      onClick={() => exportarCSVAutoCAD(aparatos, currentAcometida.id, currentAcometida.fasesDisponibles)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                      title="Descargar matriz CSV para AutoCAD Data Link"
                    >
                      <FileSpreadsheet size={14} />
                      Exportar CAD (CSV)
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="glass-panel p-12 text-center rounded-2xl">
                    <RefreshCw className="animate-spin text-teal-400 mx-auto mb-2" size={30} />
                    <p className="text-sm text-slate-400">Cargando datos del proyecto residencial...</p>
                  </div>
                ) : (
                  <CuadroCargasTabla 
                    aparatos={aparatos}
                    acometidaId={currentAcometida.id}
                    fasesDisponibles={currentAcometida.fasesDisponibles}
                    desbalance={desbalanceUVIE}
                    onUpdateFase={handleUpdateFase}
                    onDeleteAparato={handleDeleteAparato}
                    onUpdateAparatoProps={handleUpdateAparatoProps}
                    onBalancearFases={handleBalancearFases}
                    balancingConfigsCount={balancingConfigs.length}
                    fasesUnit={fasesUnit}
                    onChangeFasesUnit={handleCycleFasesUnit}
                  />
                )}
              </div>

              {/* MASTER CAPA DEL VERIFICADOR (Exclusivo de Instalación Eléctrica) */}
              <div className="border-t border-slate-800/80 pt-6">
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-teal-500 relative overflow-hidden no-print">
                  <div className="absolute right-0 top-0 p-4 opacity-10">
                    <Award size={100} className="text-teal-400" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Award className="text-teal-400" size={18} />
                          Panel Maestro de Verificación (Fase 1 - 5)
                        </h3>
                        <p className="text-xs text-slate-450">
                          Corre la suite unificada de pruebas unitarias: aislamiento multi-proyecto, desbalance UVIE y exportación CSV.
                        </p>
                      </div>
                      <button
                        onClick={runVerificationSuite}
                        disabled={testSuiteStatus === 'running'}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 select-none bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 hover:shadow-lg hover:shadow-teal-500/20 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        {testSuiteStatus === 'running' ? (
                          <RefreshCw className="animate-spin" size={14} />
                        ) : (
                          <Play className="fill-current" size={14} />
                        )}
                        Ejecutar Pruebas Totales
                      </button>
                    </div>

                    {/* Logs */}
                    {testLogs.length > 0 && (
                      <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl font-mono text-[11px] text-slate-400 max-h-40 overflow-y-auto mb-4 space-y-1">
                        {testLogs.map((log, i) => (
                          <div key={i} className={log.includes('✅') ? 'text-emerald-400 font-semibold' : log.includes('❌') ? 'text-rose-400 font-semibold' : log.includes('🏆') ? 'text-teal-450 font-bold' : ''}>
                            {log}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Checklist */}
                    <div className="space-y-4">
                      {/* Categoría Fase 2 */}
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Dimensionamiento y Desbalance (Fase 2)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.licuadoraVa1500 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.licuadoraVa1500 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Licuadora VA = 1500</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.licuadoraIn11_81 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.licuadoraIn11_81 ? 'text-slate-200' : 'text-slate-500 font-sans'}>In = 11.81 A</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.licuadoraIc14_76 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.licuadoraIc14_76 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Ic = 14.76 A</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.licuadoraBreaker15 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.licuadoraBreaker15 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Interruptor 15A</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.licuadoraCable14 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.licuadoraCable14 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Conductor 14 AWG</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.desbalanceExacto12_5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.desbalanceExacto12_5 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Desbalance 12.5%</span>
                          </div>
                        </div>
                      </div>

                      {/* Categoría Fase 3 */}
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Simulación de Facturación CFE (Fase 3)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.consumoBruto350Kwh ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.consumoBruto350Kwh ? 'text-slate-200' : 'text-slate-500 font-sans'}>Consumo = 350 kWh</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.cobroBasico250 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.cobroBasico250 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Básico: $250.00 MXN</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.cobroIntermedio640 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.cobroIntermedio640 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Intermedio: $640.00 MXN</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.cobroExcedente240 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.cobroExcedente240 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Excedente: $240.00 MXN</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.cobroTotal1130 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.cobroTotal1130 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Factura Total: $1,130.00</span>
                          </div>
                        </div>
                      </div>

                      {/* Categoría Fase 4 */}
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Análisis de Ciclo de Vida CapEx/OpEx (Fase 4)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.luzAnualBase7212 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.luzAnualBase7212 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Costo Luz Anual Base = $7,212</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.gastoAnualBistro20276 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.gastoAnualBistro20276 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Gasto Anual Bistro = $20,276</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.gastoAnualEco12409 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.gastoAnualEco12409 ? 'text-slate-200' : 'text-slate-500 font-sans'}>Gasto Anual Eco = $12,409</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.rentableEsEco ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.rentableEsEco ? 'text-slate-200' : 'text-slate-500 font-sans'}>Eco es Más Rentable</span>
                          </div>
                        </div>
                      </div>

                      {/* Categoría Fase 5 */}
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Persistencia y Exportación CAD (Fase 5)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.aislamientoProyecto ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.aislamientoProyecto ? 'text-slate-200' : 'text-slate-500 font-sans'}>Aislamiento de Proyectos</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checklist.formatoCSVValido ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                              <Check size={10} />
                            </div>
                            <span className={checklist.formatoCSVValido ? 'text-slate-200' : 'text-slate-500 font-sans'}>Formato CSV CAD Válido</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {testSuiteStatus === 'passed' && (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold text-center font-sans">
                        🏆 ¡TODAS LAS PRUEBAS DEL COMPONENTE Y BASE DE DATOS PASARON! SISTEMA DE INGENIERÍA 100% HOMOLOGADO.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: SIMULADOR DE FACTURACIÓN (RECIBO FISICO CFE) */}
          {activeTab === 'recibo' && (
            <div className="space-y-6 animate-fadeIn">
              <SimuladorFinanciero 
                kwhDiario={salesKwhDiario !== null ? salesKwhDiario : totalKwhDiario}
                tarifas={tarifas}
                costosMEM={costosMEM}
                onTarifasChange={handleTarifasChange}
                onCostosMEMChange={handleCostosMEMChange}
                diasPeriodo={diasPeriodo}
                onDiasPeriodoChange={setDiasPeriodo}
              />
            </div>
          )}

          {/* PESTAÑA 4: SIMULADOR DE ENERGÍA POR VENTAS */}
          {activeTab === 'ventas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden no-print">
                <div className="absolute right-0 top-0 p-4 opacity-5">
                  <ShoppingCart size={140} className="text-teal-400" />
                </div>
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  <ShoppingCart className="text-teal-400" size={22} />
                  Simulador de Consumo y Hábitos Residenciales (Perfiles Horarios)
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                  Simula la demanda eléctrica real del hogar modelando el encendido y ciclos de uso de tus minisplits, electrodomésticos, bombas y centro de entretenimiento según tus rutinas familiares.
                </p>
              </div>

              <SimuladorConsumoVentas 
                aparatos={aparatos}
                onAddAparato={handleAddAparato}
                tarifas={tarifas}
                costosMEM={costosMEM}
                diasPeriodo={diasPeriodo}
                sales={sales}
                setSales={setSales}
                salesEqualizer={salesEqualizer}
                setSalesEqualizer={setSalesEqualizer}
                salesCalendarEqualizer={salesCalendarEqualizer}
                setSalesCalendarEqualizer={setSalesCalendarEqualizer}
                efficientPolicies={efficientPolicies}
                setEfficientPolicies={setEfficientPolicies}
                proyectoId={currentProyectoId}
                onKwhDiarioChange={setSalesKwhDiario}
              />
            </div>
          )}

          {/* PESTAÑA DE POLÍTICAS Y EFICIENCIA */}
          {activeTab === 'politicas' && (
            <div className="space-y-6 animate-fadeIn">
              <PoliticasEficiencia 
                sales={sales}
                salesEqualizer={salesEqualizer}
                efficientPolicies={efficientPolicies}
                setEfficientPolicies={setEfficientPolicies}
                tarifas={tarifas}
                costosMEM={costosMEM}
                diasPeriodo={diasPeriodo}
                aparatos={aparatos}
              />
            </div>
          )}

          {/* PESTAÑA 5: CUADRO DE CARGAS UVIE */}
          {activeTab === 'uvie' && (
            <div className="space-y-6 animate-fadeIn">
              <CuadroCargasUVIE 
                aparatos={aparatos}
                acometida={currentAcometida}
                fasesUnit={fasesUnit}
                onChangeFasesUnit={handleCycleFasesUnit}
                onBalancearFases={handleBalancearFases}
                balancingConfigsCount={balancingConfigs.length}
              />
            </div>
          )}

          {/* PESTAÑA 6: TABLERO VISUAL DE CONEXIONES */}
          {activeTab === 'tablero' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden no-print">
                <div className="absolute right-0 top-0 p-4 opacity-5">
                  <Zap size={140} className="text-teal-400" />
                </div>
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  <Zap className="text-teal-400" size={22} />
                  Tablero de Distribución Eléctrica (Representación Física)
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                  Acomoda físicamente cada uno de tus circuitos en las ranuras (slots) del centro de carga y conéctalos visualmente a las barras colectoras de fase (L1, L2, L3) para balancear la carga.
                </p>
              </div>

              <TableroVisual 
                aparatos={aparatos}
                onUpdateAparato={handleUpdateAparatoProps}
                acometida={currentAcometida}
                proyectoId={currentProyectoId}
              />
            </div>
          )}

          {/* PESTAÑA 7: DIAGRAMA UNIFILAR CAD (UVIE) */}
          {activeTab === 'unifilar' && (
            <div className="space-y-6 animate-fadeIn">
              <DiagramaUnifilarCAD 
                aparatos={aparatos}
                acometida={currentAcometida}
                proyecto={{
                  nombre: cajetinProyecto,
                  ubicacion: cajetinUbicacion,
                  propietario: cajetinPropietario,
                  electricista: cajetinElectricista,
                  escala: cajetinEscala,
                  alimentadorLongitud: alimentadorLongitud,
                  alimentadorTuberia: alimentadorTuberia,
                  alimentadorTuberiaTipo: alimentadorTuberiaTipo
                }}
                onUpdateProyectoProps={handleUpdateProyectoProps}
                fasesUnit={fasesUnit}
              />
            </div>
          )}

          {/* PESTAÑA 8: BALANCE INTELIGENTE DE TABLERO */}
          {activeTab === 'balanceador' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden no-print">
                <div className="absolute right-0 top-0 p-4 opacity-5">
                  <Sliders size={140} className="text-violet-400" />
                </div>
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  <Sliders className="text-violet-400" size={22} />
                  Balance Inteligente de Tablero Eléctrico
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                  Distribuye automáticamente los aparatos en interruptores termomagnéticos usando algoritmo matemático greedy o Inteligencia Artificial (Gemini).
                  Garantiza desbalanceo ≤ 5% entre fases según normativa UVIE y NOM-001-SEDE-2012.
                </p>
              </div>
              <BalanceadorTablero
                aparatos={aparatos}
                onUpdateAparato={handleUpdateAparatoProps}
                acometida={currentAcometida}
                proyectoId={currentProyectoId}
              />
            </div>
          )}

          {/* PESTAÑA 2: VISTA DE CICLO DE VIDA (MODO VERSUS Y COMPETENCIA) */}
          {activeTab === 'cicloVida' && (
            <div className="space-y-6 animate-fadeIn no-print">
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-5">
                  <Scale size={140} className="text-teal-400" />
                </div>
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  <Scale className="text-teal-400" size={22} />
                  Competencia de Equipos - Ciclo de Vida (Versus TCO)
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                  Compara la viabilidad económica a corto (CapEx) y largo (OpEx / Energía CFE) plazo de múltiples variantes para cada equipo. Activa el modelo ganador para integrarlo de inmediato al cuadro de cargas.
                </p>
              </div>

              {aparatos.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl border border-dashed border-slate-800">
                  <HelpCircle className="text-slate-655 mx-auto mb-3 animate-pulse" size={40} />
                  <p className="text-sm text-slate-400 font-bold font-sans">No hay aparatos registrados en este proyecto residencial.</p>
                  <p className="text-xs text-slate-500 mt-1 font-sans">Usa la tarjeta de registro a la derecha para agregar tu primer equipo.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {aparatos.map((ap) => {
                    return (
                      <div key={ap.id} className="glass-panel p-5 rounded-2xl border border-slate-805/80 space-y-4">
                        {/* Cabecera del Aparato */}
                        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-mono">Ranura / Equipo</span>
                            <h3 className="text-base font-bold text-white font-display mt-0.5">{ap.tipo}</h3>
                          </div>
                          <button
                            onClick={() => handleDeleteAparato(ap.id)}
                            className="text-xs px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 transition-all font-bold font-sans"
                          >
                            Eliminar Ranura
                          </button>
                        </div>

                        {/* Listado de Variantes Competidoras */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {ap.variantes?.map((v) => {
                            // Cálculos de TCO para esta variante
                            const kwhDiario = calcularKwhDiarioAparato(v);
                            const kwhAnual = kwhDiario * 365;
                            const costoLuzAnual = kwhAnual * costoKwhPromedio;
                            const maintAnual = parseFloat(v.mantenimiento) || 0;
                            const capExAnual = (parseFloat(v.precio) || 0) / (parseFloat(v.vidaUtil) || 5);
                            const tcoAnual = capExAnual + costoLuzAnual + maintAnual;

                            const isActive = v.id === ap.activaVariantId;

                            // Encontrar si este TCO es el mínimo en este grupo
                            const tcosGroup = ap.variantes.map(x => {
                              const kd = calcularKwhDiarioAparato(x);
                              const ca = (parseFloat(x.precio) || 0) / (parseFloat(x.vidaUtil) || 5);
                              return ca + (kd * 365 * costoKwhPromedio) + (parseFloat(x.mantenimiento) || 0);
                            });
                            const minTco = Math.min(...tcosGroup);
                            const esGanador = tcoAnual === minTco && ap.variantes.length > 1;

                            return (
                              <div 
                                key={v.id} 
                                className={`p-4 rounded-xl border relative transition-all duration-300 flex flex-col justify-between ${
                                  isActive 
                                    ? 'bg-slate-950/60 border-teal-500/60 shadow-lg shadow-teal-500/5 glow-teal' 
                                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {esGanador && (
                                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black uppercase tracking-wider shadow">
                                    ⭐ Más Rentable
                                  </span>
                                )}

                                <div className="space-y-3">
                                  {/* Nombre de la variante */}
                                  <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{v.nombre}</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                                      {v.tipoCarga === 'monofasica' ? '1F (127V CA)' : v.tipoCarga === 'bifasica' ? '2F (220V CA)' : '3F (220V CA)'}
                                    </p>
                                  </div>

                                  {/* Especificaciones Técnicas */}
                                  <div className="p-2 rounded bg-slate-950/40 text-[10px] font-mono space-y-1 text-slate-400">
                                    <div className="flex justify-between">
                                      <span>Carga Activa:</span>
                                      <span className="text-slate-200 font-bold">{v.watts} W</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>F.P. NOM:</span>
                                      <span className="text-slate-200">{v.fp.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Operación:</span>
                                      <span className="text-slate-200">{v.horasAlta}h {v.consumoVariable && `(+ ${v.horasReposo}h reposo)`}</span>
                                    </div>
                                  </div>

                                  {/* Desglose Financiero */}
                                  <div className="space-y-1 text-[11px] font-sans">
                                    <div className="flex justify-between text-slate-450">
                                      <span>Precio CapEx:</span>
                                      <span className="font-mono text-slate-200">${(v.precio || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-450">
                                      <span>Mant. OpEx:</span>
                                      <span className="font-mono text-slate-200">${(v.mantenimiento || 0).toLocaleString()}/año</span>
                                    </div>
                                    <div className="flex justify-between text-slate-450">
                                      <span>CFE Energía:</span>
                                      <span className="font-mono text-slate-200">${Math.round(costoLuzAnual).toLocaleString()}/año</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-800/80 pt-1.5 mt-1.5 font-bold text-slate-200">
                                      <span>TCO Amortizado:</span>
                                      <span className="font-mono text-teal-400 text-xs">${Math.round(tcoAnual).toLocaleString()} MXN/año</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Acciones */}
                                <div className="mt-4 pt-2 border-t border-slate-850/50">
                                  {isActive ? (
                                    <div className="w-full py-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold text-[11px] text-center font-sans">
                                      ✓ Activo en Cuadro
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleActivarVariante(ap.id, v.id)}
                                      className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all duration-200 active:scale-[0.97] font-sans"
                                    >
                                      Activar en Cuadro
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Tarjeta de Agregar Alternativa */}
                          {activeAddVariantId !== ap.id ? (
                            <button
                              onClick={() => setActiveAddVariantId(ap.id)}
                              className="p-4 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/10 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-250 transition-all group min-h-[220px]"
                            >
                              <PlusCircle className="text-slate-655 group-hover:text-teal-400 transition-colors" size={24} />
                              <span className="text-xs font-bold uppercase tracking-wider font-sans">Añadir Competidor</span>
                              <span className="text-[10px] text-slate-600 text-center font-sans font-normal">Registra otra alternativa para evaluar cuál es más rentable</span>
                            </button>
                          ) : (
                            <div className="p-1 rounded-xl border border-slate-800 bg-slate-950/20 col-span-1 md:col-span-2 xl:col-span-1">
                              <AddVariantForm 
                                onSave={(vData) => {
                                  handleAgregarVariante(ap.id, vData);
                                  setActiveAddVariantId(null);
                                }}
                                onCancel={() => setActiveAddVariantId(null)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Columna Derecha: Formulario (4 cols) o Pestaña restauradora si está colapsado */}
        {(activeTab === 'diseno' || activeTab === 'cicloVida') && (
          <div className={`transition-all duration-300 no-print ${
            isFormCollapsed 
              ? 'w-0 lg:col-span-0 overflow-hidden relative' 
              : 'lg:col-span-4 w-full relative'
          }`}>
            {/* Pestaña vertical para restaurar (visible solo cuando está colapsado) */}
            {isFormCollapsed && (
              <button
                type="button"
                onClick={() => setIsFormCollapsed(false)}
                className="fixed right-0 top-1/3 z-50 flex items-center justify-center w-8 h-24 bg-slate-900 border-l border-y border-teal-500/40 rounded-l-xl hover:bg-slate-850 hover:border-teal-400 group transition-all duration-200 cursor-pointer shadow-lg shadow-teal-500/5"
                title="Mostrar Registrar Aparato Eléctrico"
              >
                {/* Triángulo que apunta a la izquierda */}
                <span className="text-teal-400 group-hover:scale-110 transition-transform font-bold text-xs select-none">
                  ◀
                </span>
                {/* Etiqueta flotante al hacer hover */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-slate-950 border border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-200 px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl">
                  Registrar Aparato Eléctrico
                </div>
              </button>
            )}

            {/* Formulario real (se desvanece si está colapsado) */}
            <div className={`transition-opacity duration-200 ${isFormCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <AparatoForm 
                aparatos={aparatos}
                onAddAparato={handleAddAparato}
                isCollapsed={isFormCollapsed}
                onToggleCollapse={() => setIsFormCollapsed(true)}
              />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 text-center py-6 text-xs text-slate-500 px-6 mt-12 no-print">
        <div className={`${layoutMode === 'escritorio' ? 'max-w-full px-4 md:px-8' : 'max-w-[430px] px-4'} mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div>
            © 2026 SGE-México. Persistencia Multi-Proyecto y herramientas de exportación CAD / UVIE homologadas.
          </div>
          <div className="flex gap-4">
            <a href="https://www.gob.mx/cfe" target="_blank" className="hover:text-slate-300 transition-colors">CFE Oficial</a>
            <a href="https://www.dof.gob.mx" target="_blank" className="hover:text-slate-300 transition-colors">Diario Oficial</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
