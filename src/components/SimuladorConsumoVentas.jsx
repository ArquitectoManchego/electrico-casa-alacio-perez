import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShoppingCart, PlusCircle, CheckCircle, AlertTriangle, TrendingUp, Info, HelpCircle, Sliders, DollarSign } from 'lucide-react';
import { calcularCobroCFECompleto, calcularKwhDiarioAparato } from '../utils/simuladorCFE';

export default function SimuladorConsumoVentas({ 
  aparatos, 
  onAddAparato,
  tarifas,
  costosMEM,
  diasPeriodo,
  sales,
  setSales,
  salesEqualizer,
  setSalesEqualizer,
  salesCalendarEqualizer,
  setSalesCalendarEqualizer,
  efficientPolicies,
  setEfficientPolicies,
  proyectoId,
  onKwhDiarioChange
}) {
  const [ecoDevices, setEcoDevices] = useState({});
  const isEcoInitializedRef = useRef(false);

  // Cargar preferencias eco desde localStorage al cambiar de proyectoId
  useEffect(() => {
    if (!proyectoId) return;
    isEcoInitializedRef.current = false;
    const saved = localStorage.getItem(`eco_devices_${proyectoId}`);
    if (saved) {
      try {
        setEcoDevices(JSON.parse(saved));
      } catch (e) {
        setEcoDevices({});
      }
    } else {
      setEcoDevices({});
    }
    isEcoInitializedRef.current = true;
  }, [proyectoId]);

  // Guardar preferencias eco a localStorage cuando cambien
  useEffect(() => {
    if (!proyectoId || !isEcoInitializedRef.current) return;
    localStorage.setItem(`eco_devices_${proyectoId}`, JSON.stringify(ecoDevices));
  }, [ecoDevices, proyectoId]);

  const toggleEco = (deviceId) => {
    setEcoDevices(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  // --- UTILERÍAS DE CALENDARIO Y FECHAS ---
  const formatDateStr = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const getDayInfo = (dateStr) => {
    if (!dateStr) return { name: 'Lunes', shortName: 'Lun', dayNum: 1, monthNum: 1 };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { name: 'Lunes', shortName: 'Lun', dayNum: 1, monthNum: 1 };
    const [y, m, d] = parts.map(Number);
    const dObj = new Date(y, m - 1, d);
    const dayIdx = dObj.getDay(); // 0-Sunday, 1-Monday, etc.
    const names = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const shortNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return {
      name: names[dayIdx],
      shortName: shortNames[dayIdx],
      dayNum: d,
      monthNum: m,
      dateObj: dObj
    };
  };

  const isDateInActiveWeek = (dKey, selDate) => {
    const parts = selDate.split('-');
    if (parts.length !== 3) return false;
    const [y, m, d] = parts.map(Number);
    const selObj = new Date(y, m - 1, d);
    const dayIdx = selObj.getDay();
    const diffToMonday = dayIdx === 0 ? -6 : 1 - dayIdx;
    
    const monObj = new Date(selObj);
    monObj.setDate(selObj.getDate() + diffToMonday);
    monObj.setHours(0,0,0,0);
    
    const sunObj = new Date(monObj);
    sunObj.setDate(monObj.getDate() + 6);
    sunObj.setHours(23,59,59,999);
    
    const cParts = dKey.split('-');
    if (cParts.length !== 3) return false;
    const [dy, dm, dd] = cParts.map(Number);
    const checkObj = new Date(dy, dm - 1, dd);
    
    return checkObj >= monObj && checkObj <= sunObj;
  };

  const getMonthDaysList = (year, month) => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    let startDayIdx = new Date(year, month, 1).getDay(); // 0-Sunday, 1-Monday
    startDayIdx = startDayIdx === 0 ? 6 : startDayIdx - 1; // 0-Monday
    
    const days = [];
    for (let i = 0; i < startDayIdx; i++) {
      days.push({ isPadding: true });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dKey = formatDateStr(year, month, d);
      days.push({
        isPadding: false,
        dayNum: d,
        dateKey: dKey
      });
    }
    return days;
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  });

  // --- HOVER TOOLTIP ESTADOS Y TIMERS ---
  const [hoveredEcoId, setHoveredEcoId] = useState(null);
  const [hoverMode, setHoverMode] = useState(null); // 'brief' o 'full'
  const hoverTimer2Ref = useRef(null);
  const hoverTimer5Ref = useRef(null);

  const handleEcoMouseEnter = (itemId) => {
    if (hoverTimer2Ref.current) clearTimeout(hoverTimer2Ref.current);
    if (hoverTimer5Ref.current) clearTimeout(hoverTimer5Ref.current);

    setHoveredEcoId(itemId);
    setHoverMode(null);

    // Timer de 2 segundos (explicación breve)
    hoverTimer2Ref.current = setTimeout(() => {
      setHoverMode('brief');
    }, 2000);

    // Timer de 5 segundos (explicación amplia)
    hoverTimer5Ref.current = setTimeout(() => {
      setHoverMode('full');
    }, 5000);
  };

  const handleEcoMouseLeave = () => {
    if (hoverTimer2Ref.current) clearTimeout(hoverTimer2Ref.current);
    if (hoverTimer5Ref.current) clearTimeout(hoverTimer5Ref.current);

    setHoveredEcoId(null);
    setHoverMode(null);
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimer2Ref.current) clearTimeout(hoverTimer2Ref.current);
      if (hoverTimer5Ref.current) clearTimeout(hoverTimer5Ref.current);
    };
  }, []);

  const getEcoExplanation = (item) => {
    const isStatic = item.category === 'estatico';
    const cat = item.category;

    let title = "";
    let brief = "";
    let full = "";

    if (isStatic) {
      title = "Protocolo Eco (Equipos de Soporte)";
      brief = "Aplica mantenimiento, sellado de juntas y control optimizado que reduce el consumo base en un 15%.";
      full = "Disminuye las pérdidas de frío e iluminación mediante el recambio de empaques deteriorados, limpieza de serpentines, reubicación para mejor ventilación y ajuste inteligente de termostatos, resultando en un 15% de ahorro continuo.";
    } else if (cat === 'crepera') {
      title = "Aislamiento Térmico Eco (Crepera)";
      brief = "Activa el protector plato-térmico reduciendo el consumo standby a un 3%.";
      full = "Agrega aislamiento hermético bajo la placa de hierro. Esto previene la fuga de calor radiante al chasis, reduciendo la energía standby del 10% al 3% de su potencia nominal mientras no hay pedidos en preparación.";
    } else if (cat === 'cafetera') {
      title = "Aislamiento de Caldera Eco (Cafetera)";
      brief = "Aísla la caldera para reducir el standby al 6% y apaga la resistencia en modo bajo.";
      full = "Recubre la caldera de cobre con fibra aislante de alta temperatura. Esto disminuye la radiación térmica al chasis y baja el consumo standby de reposo del 15% al 6% de la potencia nominal, desactivándola por completo durante periodos sin ventas.";
    } else if (cat === 'hervidor') {
      title = "Urna/Hervidor Aislado";
      brief = "Aísla la urna de agua disminuyendo pérdidas de calor y bajando el standby al 3%.";
      full = "Implementa una chaqueta de neopreno o aislamiento de doble pared en la urna. Evita que el agua caliente se enfríe rápidamente con el aire exterior, recortando las reconexiones de la resistencia del 10% al 3% nominal en standby.";
    } else if (cat === 'vaporera') {
      title = "Tapa Térmica Aislante (Vaporera)";
      brief = "Conserva el vapor caliente en esquites reduciendo el consumo standby.";
      full = "Agrega un empaque de silicona y aislamiento a la tapa de la vaporera. Evita la fuga masiva de vapor y humedad, manteniendo el agua en punto de ebullición latente con una fracción mínima de potencia standby.";
    } else {
      title = "Motores Eficientes (Eco)";
      brief = "Optimiza los ciclos del motor y arranques para ahorrar un 10%-15% por preparación.";
      full = "Implementa arrancadores de estado sólido y mantenimiento preventivo en rodamientos/cuchillas. Reduce los picos de arranque del motor eléctrico y optimiza el consumo en un 10% a 15% por cada ciclo de molienda o licuado.";
    }

    return { title, brief, full };
  };

  // Fallbacks locales para evitar fallos si no se proveen props compartidas
  const [localSales, setLocalSales] = useState({
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

  const [localEqualizer, setLocalEqualizer] = useState({
    Lunes: 30,
    Martes: 35,
    Miercoles: 50,
    Jueves: 55,
    Viernes: 85,
    Sabado: 100,
    Domingo: 90
  });

  const [localPolicies, setLocalPolicies] = useState({
    creperaEco: false,
    cafeteraEco: false,
    vaporeraTapa: false,
    dispensadorAislado: false,
    motoresEficientes: false
  });

  const activeSales = sales || localSales;
  const activeEqualizer = salesEqualizer || localEqualizer;
  const activePolicies = efficientPolicies || localPolicies;

  const activeSetSales = setSales || setLocalSales;
  const activeSetEqualizer = setSalesEqualizer || setLocalEqualizer;

  const handleSalesChange = (product, val) => {
    const numeric = Math.max(0, parseInt(val) || 0);
    activeSetSales(prev => ({ ...prev, [product]: numeric }));
  };

  const adjustCounter = (product, step) => {
    activeSetSales(prev => ({
      ...prev,
      [product]: Math.max(0, (prev[product] || 0) + step)
    }));
  };

  const handleEqualizerChange = (day, val) => {
    activeSetEqualizer(prev => ({
      ...prev,
      [day]: parseInt(val) || 0
    }));
  };

  // Buscar vinculación con inventario real del local
  const findRealAppliance = (keywords) => {
    return aparatos.find(ap => {
      const typeLower = (ap.tipo || '').toLowerCase();
      const modelLower = (ap.modelo || '').toLowerCase();
      return keywords.some(k => typeLower.includes(k) || modelLower.includes(k));
    });
  };

  const creperaReal = findRealAppliance(['crep', 'marquesi']);
  const cafeteraReal = findRealAppliance(['cafetera', 'espres']);
  const molinoReal = findRealAppliance(['molin', 'grinder']);
  const licuadoraReal = findRealAppliance(['licua', 'blend']);
  const trituradoraReal = findRealAppliance(['tritu', 'shave', 'raspa']);
  const vaporeraReal = findRealAppliance(['vapor', 'esqu', 'calentador', 'estufa', 'parrilla']);
  const hervidorReal = findRealAppliance(['hervi', 'dispensa', 'agua', 'tetera', 'urna']);

  // Potencias de los equipos (Real o Fallback estándar de la CFE/MEM)
  const specs = {
    crepera: {
      nombre: 'Crepera (Crepas & Marquesitas)',
      watts: creperaReal ? parseFloat(creperaReal.watts) : 1500,
      conectado: !!creperaReal,
      preset: { tipo: 'Crepera Eléctrica Industrial', watts: 1500, fp: 0.95, tipoCarga: 'monofasica' }
    },
    cafetera: {
      nombre: 'Cafetera Espresso',
      watts: cafeteraReal ? parseFloat(cafeteraReal.watts) : 1800,
      conectado: !!cafeteraReal,
      preset: { tipo: 'Cafetera Espresso 2 Grupos', watts: 1800, fp: 0.95, tipoCarga: 'bifasica' }
    },
    molino: {
      nombre: 'Molino de Café',
      watts: molinoReal ? parseFloat(molinoReal.watts) : 350,
      conectado: !!molinoReal,
      preset: { tipo: 'Molino de Café Comercial', watts: 350, fp: 0.85, tipoCarga: 'monofasica' }
    },
    licuadora: {
      nombre: 'Licuadora Industrial',
      watts: licuadoraReal ? parseFloat(licuadoraReal.watts) : 1200,
      conectado: !!licuadoraReal,
      preset: { tipo: 'Licuadora de Alta Revolución', watts: 1200, fp: 0.85, tipoCarga: 'monofasica' }
    },
    trituradora: {
      nombre: 'Trituradora de Hielo',
      watts: trituradoraReal ? parseFloat(trituradoraReal.watts) : 600,
      conectado: !!trituradoraReal,
      preset: { tipo: 'Trituradora de Hielo Eléctrica (Raspadora)', watts: 600, fp: 0.80, tipoCarga: 'monofasica' }
    },
    vaporera: {
      nombre: 'Vaporera / Parrilla (Esquites)',
      watts: vaporeraReal ? parseFloat(vaporeraReal.watts) : 1500,
      conectado: !!vaporeraReal,
      preset: { tipo: 'Parrilla Vaporera para Esquites (Mantenimiento)', watts: 1500, fp: 0.98, tipoCarga: 'monofasica' }
    },
    hervidor: {
      nombre: 'Dispensador Agua Caliente',
      watts: hervidorReal ? parseFloat(hervidorReal.watts) : 1200,
      conectado: !!hervidorReal,
      preset: { tipo: 'Dispensador / Hervidor de Agua', watts: 1200, fp: 0.98, tipoCarga: 'monofasica' }
    }
  };

  const handleQuickAdd = (key) => {
    const config = specs[key].preset;
    onAddAparato({
      ...config,
      modelo: 'Sugerido por IA Ventas',
      horasAlta: 8,
      horasReposo: 0,
      consumoVariable: false,
      precio: 8500,
      mantenimiento: 800,
      vidaUtil: 5,
      fase: 'A'
    });
  };

  // --- CÁLCULO DE DÍAS DEL PERIODO Y SEMANA ACTIVA EN CALENDARIO ---
  const getPeriodDaysList = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const parts = selectedDate.split('-');
    if (parts.length !== 3) return [];
    const [selY, selM, selD] = parts.map(Number);
    const activeMonth = selM - 1;
    const activeYear = selY;

    const list = [];
    const names = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const namesNominal = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

    // Si diasPeriodo <= 30 (Mensual), simulamos los días del mes correspondiente a la fecha seleccionada
    if (diasPeriodo <= 30) {
      const totalDays = new Date(activeYear, activeMonth + 1, 0).getDate();
      for (let d = 1; d <= totalDays; d++) {
        const dKey = formatDateStr(activeYear, activeMonth, d);
        const dObj = new Date(activeYear, activeMonth, d);
        const dayIdx = dObj.getDay();
        const dayNameNominal = dayIdx === 0 ? 'Domingo' : ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][dayIdx - 1];

        const val = (salesCalendarEqualizer && salesCalendarEqualizer[dKey] !== undefined)
          ? salesCalendarEqualizer[dKey]
          : (activeEqualizer[dayNameNominal] || 100);

        list.push({
          dateStr: dKey,
          dayOfWeek: dayNameNominal,
          factor: val / 100,
          val: val
        });
      }
    } else {
      // Bimestral (60 días o más): combinamos los días del mes actual y el mes siguiente
      const m1 = currentMonth;
      const y1 = currentYear;
      const m2 = (m1 + 1) % 12;
      const y2 = m2 === 0 ? y1 + 1 : y1;

      // Mes 1
      const totalM1 = new Date(y1, m1 + 1, 0).getDate();
      for (let d = 1; d <= totalM1; d++) {
        const dKey = formatDateStr(y1, m1, d);
        const dObj = new Date(y1, m1, d);
        const dayIdx = dObj.getDay();
        const dayNameNominal = dayIdx === 0 ? 'Domingo' : ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][dayIdx - 1];

        const val = (salesCalendarEqualizer && salesCalendarEqualizer[dKey] !== undefined)
          ? salesCalendarEqualizer[dKey]
          : (activeEqualizer[dayNameNominal] || 100);

        list.push({
          dateStr: dKey,
          dayOfWeek: dayNameNominal,
          factor: val / 100,
          val: val
        });
      }

      // Mes 2
      const totalM2 = new Date(y2, m2 + 1, 0).getDate();
      for (let d = 1; d <= totalM2; d++) {
        const dKey = formatDateStr(y2, m2, d);
        const dObj = new Date(y2, m2, d);
        const dayIdx = dObj.getDay();
        const dayNameNominal = dayIdx === 0 ? 'Domingo' : ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][dayIdx - 1];

        const val = (salesCalendarEqualizer && salesCalendarEqualizer[dKey] !== undefined)
          ? salesCalendarEqualizer[dKey]
          : (activeEqualizer[dayNameNominal] || 100);

        list.push({
          dateStr: dKey,
          dayOfWeek: dayNameNominal,
          factor: val / 100,
          val: val
        });
      }
    }
    return list;
  };

  const periodDays = getPeriodDaysList();

  // Calcular las fechas de la semana de la fecha seleccionada (Lunes a Domingo)
  const getWeekDates = () => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return [];
    const [y, m, d] = parts.map(Number);
    const selObj = new Date(y, m - 1, d);
    const dayIdx = selObj.getDay();
    const diffToMonday = dayIdx === 0 ? -6 : 1 - dayIdx;

    const monObj = new Date(selObj);
    monObj.setDate(selObj.getDate() + diffToMonday);

    const weekDates = [];
    const daysNames = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const daysShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const dObj = new Date(monObj);
      dObj.setDate(monObj.getDate() + i);
      const dKey = formatDateStr(dObj.getFullYear(), dObj.getMonth(), dObj.getDate());
      weekDates.push({
        key: dKey,
        name: daysNames[i],
        shortName: daysShort[i],
        dayNum: dObj.getDate(),
        monthNum: dObj.getMonth() + 1
      });
    }
    return weekDates;
  };

  const weekDates = getWeekDates();

  const CATEGORY_KEYWORDS = {
    crepera: ['crep', 'marquesi'],
    cafetera: ['cafetera', 'espres'],
    molino: ['molin', 'grinder'],
    licuadora: ['licua', 'blend'],
    trituradora: ['tritu', 'shave', 'raspa'],
    vaporera: ['vapor', 'esqu', 'calentador', 'estufa', 'parrilla'],
    hervidor: ['hervi', 'dispensa', 'agua', 'tetera', 'urna']
  };

  const categorizedApplianceIds = new Set();
  const appliancesByCategory = {
    crepera: [],
    cafetera: [],
    molino: [],
    licuadora: [],
    trituradora: [],
    vaporera: [],
    hervidor: []
  };

  aparatos.forEach(ap => {
    const typeLower = (ap.tipo || '').toLowerCase();
    const modelLower = (ap.modelo || '').toLowerCase();
    let matched = false;
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => typeLower.includes(k) || modelLower.includes(k))) {
        appliancesByCategory[category].push(ap);
        categorizedApplianceIds.add(ap.id);
        matched = true;
        break;
      }
    }
  });

  const displayItems = [];

  const presets = {
    crepera: { tipo: 'Crepera Eléctrica Industrial', watts: 1500, fp: 0.95, tipoCarga: 'monofasica', icono: '🥞', label: 'Crepera (Crepas & Marquesitas)' },
    cafetera: { tipo: 'Cafetera Espresso 2 Grupos', watts: 1800, fp: 0.95, tipoCarga: 'bifasica', icono: '☕', label: 'Cafetera Espresso' },
    molino: { tipo: 'Molino de Café Comercial', watts: 350, fp: 0.85, tipoCarga: 'monofasica', icono: '⚙️', label: 'Molino de Café' },
    licuadora: { tipo: 'Licuadora de Alta Revolución', watts: 1200, fp: 0.85, tipoCarga: 'monofasica', icono: '🌀', label: 'Licuadora Industrial' },
    trituradora: { tipo: 'Trituradora de Hielo Eléctrica (Raspadora)', watts: 600, fp: 0.80, tipoCarga: 'monofasica', icono: '❄️', label: 'Trituradora de Hielo' },
    vaporera: { tipo: 'Parrilla Vaporera para Esquites (Mantenimiento)', watts: 1500, fp: 0.98, tipoCarga: 'monofasica', icono: '🌽', label: 'Vaporera de Esquites' },
    hervidor: { tipo: 'Dispensador / Hervidor de Agua', watts: 1200, fp: 0.98, tipoCarga: 'monofasica', icono: '🍜', label: 'Hervidor de Agua' }
  };

  Object.entries(presets).forEach(([category, preset]) => {
    const list = appliancesByCategory[category];
    if (list && list.length > 0) {
      const wf = 1 / list.length;
      list.forEach(ap => {
        displayItems.push({
          id: ap.id,
          name: `${preset.icono} ${ap.tipo}`,
          modelo: ap.modelo || 'Modelo Registrado',
          watts: parseFloat(ap.watts) || preset.watts,
          isReal: true,
          category,
          wf,
          ap
        });
      });
    } else {
      displayItems.push({
        id: `generic-${category}`,
        name: `${preset.icono} ${preset.tipo}`,
        modelo: 'Simulado (Genérico CFE/MEM)',
        watts: preset.watts,
        isReal: false,
        category,
        wf: 1,
        presetConfig: preset
      });
    }
  });

  aparatos.forEach(ap => {
    if (!categorizedApplianceIds.has(ap.id)) {
      displayItems.push({
        id: ap.id,
        name: `🔌 ${ap.tipo}`,
        modelo: ap.modelo || 'Equipo de Soporte',
        watts: parseFloat(ap.watts) || 0,
        isReal: true,
        category: 'estatico',
        wf: 0,
        ap
      });
    }
  });

  const calcularConsumoAparatoVentas = (item, category, wf, f, val, ecoActive) => {
    const watts = item.watts;
    let kwh = 0;
    const breakdown = { preheat: 0, prep: 0, standby: 0, reheat: 0, mode: 'Alto' };

    // Determinar nivel del día
    let level = 'Alto';
    if (val <= 30) level = 'Bajo';
    else if (val <= 70) level = 'Medio';
    breakdown.mode = level;

    if (category === 'crepera') {
      const c = activeSales.crepas * f * wf;
      const m = activeSales.marquesitas * f * wf;
      const prepMin = (c * 2.5) + (m * 3.0);
      
      if (level === 'Bajo') {
        // En nivel Bajo: Apagado y encendido on-demand (sin standby)
        const preheatMin = (c + m) > 0 ? 15 : 0;
        kwh = ((watts * preheatMin) + (watts * prepMin)) / 60 / 1000;
        breakdown.preheat = preheatMin;
        breakdown.prep = prepMin;
        breakdown.standby = 0;
      } else {
        const preheatMin = 15;
        const standbyMin = Math.max(0, 480 - preheatMin - prepMin);
        let reheatMin = 0;
        let finalStandbyPct = 0.25;

        if (ecoActive) {
          const reheatCycles = Math.ceil((c + m) / 5);
          reheatMin = reheatCycles * 4;
          finalStandbyPct = 0.02; // Eco: standby al 2% de potencia
          kwh = ((watts * preheatMin) + 
                 (watts * prepMin) + 
                 (watts * reheatMin) + 
                 (watts * standbyMin * finalStandbyPct)) / 60 / 1000;
        } else {
          kwh = ((watts * preheatMin) + 
                 (watts * prepMin) + 
                 (watts * standbyMin * finalStandbyPct)) / 60 / 1000;
        }
        breakdown.preheat = preheatMin;
        breakdown.prep = prepMin;
        breakdown.standby = standbyMin;
        breakdown.reheat = reheatMin;
      }

    } else if (category === 'cafetera') {
      const totalCafes = (activeSales.espresso + activeSales.mocca + activeSales.capuchino) * f * wf;
      const prepMin = totalCafes * 0.5;

      if (level === 'Bajo') {
        // En nivel Bajo: Apagado y encendido on-demand (sin standby)
        const preheatMin = totalCafes > 0 ? 20 : 0;
        kwh = ((watts * preheatMin) + (watts * prepMin)) / 60 / 1000;
        breakdown.preheat = preheatMin;
        breakdown.prep = prepMin;
        breakdown.standby = 0;
      } else {
        const preheatMin = 20;
        const standbyMin = Math.max(0, 480 - preheatMin - prepMin);
        const standbyPct = ecoActive ? 0.06 : 0.15; // Eco: standby cae a 6%
        kwh = ((watts * preheatMin) + 
               (watts * prepMin) + 
               (watts * standbyMin * standbyPct)) / 60 / 1000;
        breakdown.preheat = preheatMin;
        breakdown.prep = prepMin;
        breakdown.standby = standbyMin;
      }

    } else if (category === 'molino') {
      const totalCafes = (activeSales.espresso + activeSales.mocca + activeSales.capuchino) * f * wf;
      const prepMin = totalCafes * 0.15;
      const molinoWatts = ecoActive ? watts * 0.90 : watts; // Eco: 10% ahorro por ajuste exacto
      kwh = (molinoWatts * prepMin) / 60 / 1000;
      breakdown.prep = prepMin;

    } else if (category === 'licuadora') {
      const smoothies = activeSales.smoothies * f * wf;
      const prepMin = smoothies * 0.75;
      const licWatts = ecoActive ? watts * 0.85 : watts; // Eco: 15% ahorro por motores eficientes
      kwh = (licWatts * prepMin) / 60 / 1000;
      breakdown.prep = prepMin;

    } else if (category === 'trituradora') {
      const raspados = activeSales.raspados * f * wf;
      const prepMin = raspados * 0.33;
      const tritWatts = ecoActive ? watts * 0.85 : watts; // Eco: 15% ahorro por motores eficientes
      kwh = (tritWatts * prepMin) / 60 / 1000;
      breakdown.prep = prepMin;

    } else if (category === 'vaporera') {
      if (level === 'Bajo') {
        // En nivel Bajo: Apagado completo preventivo.
        kwh = 0;
        breakdown.prep = 0;
        breakdown.standby = 0;
      } else {
        const vapPct = ecoActive ? 0.15 : 0.35; // Eco: standby cae a 15% por tapa hermética
        kwh = (watts * 480 * vapPct) / 60 / 1000;
        breakdown.prep = 480;
      }

    } else if (category === 'hervidor') {
      const totalMaruchans = (activeSales.maruchan + activeSales.maruchanEsquite) * f * wf;
      const prepMin = totalMaruchans * 1.5;

      if (level === 'Bajo') {
        // En nivel Bajo: Apagado y encendido on-demand (sin standby)
        const preheatMin = totalMaruchans > 0 ? 5 : 0;
        kwh = ((watts * preheatMin) + (watts * prepMin)) / 60 / 1000;
        breakdown.preheat = preheatMin;
        breakdown.prep = prepMin;
        breakdown.standby = 0;
      } else {
        const standbyMin = Math.max(0, 480 - prepMin);
        const standbyPct = ecoActive ? 0.03 : 0.10; // Eco: standby cae a 3% por aislamiento
        kwh = ((watts * prepMin) + 
               (watts * standbyMin * standbyPct)) / 60 / 1000;
        breakdown.prep = prepMin;
        breakdown.standby = standbyMin;
      }
    }

    return { kwh, breakdown };
  };

  const itemsConConsumo = displayItems.map(item => {
    const ecoActive = !!ecoDevices[item.id];
    const consumos = periodDays.map(d => {
      let dayKwh = 0;
      let breakdown = {};
      const val = d.val;
      if (item.category === 'estatico') {
        const baseKwh = calcularKwhDiarioAparato(item.ap);
        dayKwh = ecoActive ? baseKwh * 0.85 : baseKwh; // Eco: 15% de ahorro en soporte estático
        breakdown = { prep: item.ap.horasAlta || 0, standby: item.ap.horasReposo || 0, mode: 'Soporte' };
      } else {
        const res = calcularConsumoAparatoVentas(item, item.category, item.wf, d.factor, val, ecoActive);
        dayKwh = res.kwh;
        breakdown = res.breakdown;
      }
      return {
        kwh: dayKwh,
        breakdown: breakdown
      };
    });

    const avgKwhDiario = consumos.reduce((sum, c) => sum + c.kwh, 0) / periodDays.length;
    const avgPrep = consumos.reduce((sum, c) => sum + (c.breakdown.prep || 0), 0) / periodDays.length;
    const avgPreheat = consumos.reduce((sum, c) => sum + (c.breakdown.preheat || 0), 0) / periodDays.length;
    const avgStandby = consumos.reduce((sum, c) => sum + (c.breakdown.standby || 0), 0) / periodDays.length;
    const avgReheat = consumos.reduce((sum, c) => sum + (c.breakdown.reheat || 0), 0) / periodDays.length;

    return {
      ...item,
      ecoActive,
      kwh: avgKwhDiario,
      avgPrep,
      avgPreheat,
      avgStandby,
      avgReheat
    };
  });

  const getDurations = (item, val) => {
    const category = item.category;
    const wf = item.wf;
    const f = val / 100;
    const level = val <= 30 ? 'Bajo' : val <= 70 ? 'Medio' : 'Alto';
    const ecoActive = item.ecoActive;

    let preheat = 0;
    let prep = 0;
    let standby = 0;
    let reheat = 0;

    if (category === 'crepera') {
      const c = activeSales.crepas * f * wf;
      const m = activeSales.marquesitas * f * wf;
      prep = (c * 2.5) + (m * 3.0);
      if (level === 'Bajo') {
        preheat = (c + m) > 0 ? 15 : 0;
        standby = 0;
      } else {
        preheat = 15;
        standby = Math.max(0, 480 - preheat - prep);
        reheat = ecoActive ? Math.ceil((c + m) / 5) * 4 : 0;
      }

    } else if (category === 'cafetera') {
      const totalCafes = (activeSales.espresso + activeSales.mocca + activeSales.capuchino) * f * wf;
      prep = totalCafes * 0.5;
      if (level === 'Bajo') {
        preheat = totalCafes > 0 ? 20 : 0;
        standby = 0;
      } else {
        preheat = 20;
        standby = Math.max(0, 480 - preheat - prep);
      }

    } else if (category === 'hervidor') {
      const totalMaruchans = (activeSales.maruchan + activeSales.maruchanEsquite) * f * wf;
      prep = totalMaruchans * 1.5;
      if (level === 'Bajo') {
        preheat = totalMaruchans > 0 ? 5 : 0;
        standby = 0;
      } else {
        preheat = 0;
        standby = Math.max(0, 480 - prep);
      }

    } else if (category === 'vaporera') {
      if (level === 'Bajo') {
        prep = 0;
      } else {
        prep = 480;
      }

    } else if (category === 'licuadora') {
      const smoothies = activeSales.smoothies * f * wf;
      prep = smoothies * 0.75;

    } else if (category === 'trituradora') {
      const raspados = activeSales.raspados * f * wf;
      prep = raspados * 0.33;

    } else if (category === 'molino') {
      const totalCafes = (activeSales.espresso + activeSales.mocca + activeSales.capuchino) * f * wf;
      prep = totalCafes * 0.15;

    } else if (category === 'estatico') {
      prep = item.ap?.horasAlta || 0;
      standby = item.ap?.horasReposo || 0;
    }

    return { preheat, prep, standby, reheat };
  };

  const formatTime = (min, isStatic = false) => {
    if (isStatic) {
      return `${min.toFixed(1)}h`;
    }
    if (min >= 60) {
      const hrs = min / 60;
      return `${hrs.toFixed(1)}h (${Math.round(min)}m)`;
    }
    return `${min.toFixed(1)} min`;
  };

  const getSumByCategory = (cat) => itemsConConsumo.filter(item => item.category === cat).reduce((s, x) => s + x.kwh, 0);
  const kwhProrrateado = {
    crepera: getSumByCategory('crepera'),
    cafetera: getSumByCategory('cafetera'),
    molino: getSumByCategory('molino'),
    licuadora: getSumByCategory('licuadora'),
    trituradora: getSumByCategory('trituradora'),
    vaporera: getSumByCategory('vaporera'),
    hervidor: getSumByCategory('hervidor'),
    estatico: getSumByCategory('estatico')
  };

  const totalKwhVentasDiario = itemsConConsumo.reduce((sum, item) => sum + item.kwh, 0);
  const totalKwhVentasPeriodo = totalKwhVentasDiario * diasPeriodo;

  useEffect(() => {
    if (onKwhDiarioChange) {
      onKwhDiarioChange(totalKwhVentasDiario);
    }
  }, [totalKwhVentasDiario, onKwhDiarioChange]);

  const desgloseVentas = calcularCobroCFECompleto(totalKwhVentasPeriodo, tarifas, costosMEM);
  const costPerKwh = totalKwhVentasPeriodo > 0 ? (desgloseVentas.factura.total / totalKwhVentasPeriodo) : 3.80;

  const totalKwhEstaticoDiario = aparatos.reduce((sum, ap) => {
    const watts = parseFloat(ap.watts) || 0;
    const tStd = parseFloat(ap.horasAlta) || 0;
    return sum + ((watts * tStd) / 1000);
  }, 0);
  const totalKwhEstaticoPeriodo = totalKwhEstaticoDiario * diasPeriodo;
  const desgloseEstatico = calcularCobroCFECompleto(totalKwhEstaticoPeriodo, tarifas, costosMEM);

  const selectedDayInfo = getDayInfo(selectedDate);
  const selectedDateVal = (salesCalendarEqualizer && salesCalendarEqualizer[selectedDate] !== undefined)
    ? salesCalendarEqualizer[selectedDate]
    : (activeEqualizer[selectedDayInfo.name] || 100);

  const calToday = new Date();
  const m1 = calToday.getMonth();
  const y1 = calToday.getFullYear();
  const m2 = (m1 + 1) % 12;
  const y2 = m2 === 0 ? y1 + 1 : y1;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const m1Days = getMonthDaysList(y1, m1);
  const m2Days = getMonthDaysList(y2, m2);

  return (
    <div className="space-y-6">
      
      {/* Ecualizador Semanal de Ventas y Calendario */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden no-print border border-slate-800/60">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2 mb-2 font-display">
            <Sliders size={16} className="text-teal-400" />
            Ecualizador de Ventas por Calendario (Variación Diaria)
          </h3>
          <p className="text-[11px] text-slate-450 leading-relaxed font-sans mb-4">
            Selecciona un día en el calendario de los meses vigentes para ver y ajustar el ecualizador de esa semana. La semana activa se resalta en el calendario.
          </p>
        </div>

        {/* Calendario de 2 Meses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Mes Actual */}
          <div className="bg-slate-950/45 p-4 border border-slate-900/80 rounded-xl">
            <h4 className="text-[11px] font-black text-teal-400 uppercase tracking-widest text-center mb-3 font-mono">
              {monthNames[m1]} {y1}
            </h4>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-slate-500 mb-2 uppercase font-sans">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {m1Days.map((d, idx) => {
                if (d.isPadding) return <div key={`pad1-${idx}`} className="h-6" />;
                
                const isSelected = d.dateKey === selectedDate;
                const isActiveWeek = isDateInActiveWeek(d.dateKey, selectedDate);
                
                let btnClass = 'h-6 text-[10px] font-mono font-bold rounded transition-all cursor-pointer flex items-center justify-center ';
                if (isSelected) {
                  btnClass += 'bg-teal-500 text-slate-950 font-extrabold shadow-md shadow-teal-500/20';
                } else if (isActiveWeek) {
                  btnClass += 'bg-slate-800/80 text-slate-200 border border-slate-700/50 hover:bg-slate-750';
                } else {
                  btnClass += 'text-slate-400 hover:bg-slate-850 hover:text-white';
                }
                
                return (
                  <button
                    key={d.dateKey}
                    type="button"
                    onClick={() => setSelectedDate(d.dateKey)}
                    className={btnClass}
                  >
                    {d.dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mes Siguiente */}
          <div className="bg-slate-950/45 p-4 border border-slate-900/80 rounded-xl">
            <h4 className="text-[11px] font-black text-teal-400 uppercase tracking-widest text-center mb-3 font-mono">
              {monthNames[m2]} {y2}
            </h4>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-slate-500 mb-2 uppercase font-sans">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {m2Days.map((d, idx) => {
                if (d.isPadding) return <div key={`pad2-${idx}`} className="h-6" />;
                
                const isSelected = d.dateKey === selectedDate;
                const isActiveWeek = isDateInActiveWeek(d.dateKey, selectedDate);
                
                let btnClass = 'h-6 text-[10px] font-mono font-bold rounded transition-all cursor-pointer flex items-center justify-center ';
                if (isSelected) {
                  btnClass += 'bg-teal-500 text-slate-950 font-extrabold shadow-md shadow-teal-500/20';
                } else if (isActiveWeek) {
                  btnClass += 'bg-slate-800/80 text-slate-200 border border-slate-700/50 hover:bg-slate-750';
                } else {
                  btnClass += 'text-slate-400 hover:bg-slate-850 hover:text-white';
                }
                
                return (
                  <button
                    key={d.dateKey}
                    type="button"
                    onClick={() => setSelectedDate(d.dateKey)}
                    className={btnClass}
                  >
                    {d.dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sliders de la Semana Activa */}
        <div className="grid grid-cols-7 gap-2 md:gap-4 mt-2">
          {weekDates.map((d) => {
            const val = (salesCalendarEqualizer && salesCalendarEqualizer[d.key] !== undefined)
              ? salesCalendarEqualizer[d.key]
              : (activeEqualizer[d.name] || 100);

            let barColor = 'accent-teal-400';
            if (val > 80) barColor = 'accent-rose-500';
            else if (val > 55) barColor = 'accent-violet-500';

            const isSelected = d.key === selectedDate;

            return (
              <div 
                key={d.key} 
                className={`flex flex-col items-center justify-between h-44 p-2.5 bg-slate-950/45 border rounded-xl transition-all ${
                  isSelected 
                    ? 'border-teal-500/80 bg-slate-900/60 shadow-md shadow-teal-500/5' 
                    : 'border-slate-900/60 hover:border-slate-800'
                }`}
              >
                <span className={`text-[9px] font-bold font-mono ${isSelected ? 'text-teal-400 font-extrabold' : 'text-slate-400'}`}>{val}%</span>
                
                <div className="h-24 flex items-center justify-center relative w-6">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={val} 
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      if (setSalesCalendarEqualizer) {
                        setSalesCalendarEqualizer(prev => ({
                          ...prev,
                          [d.key]: v
                        }));
                      }
                    }}
                    className={`h-20 w-1 bg-slate-800 rounded-lg appearance-none cursor-pointer ${barColor}`}
                    style={{ 
                      writingMode: 'bt-lr', 
                      WebkitAppearance: 'slider-vertical'
                    }}
                  />
                </div>
                
                <div className="text-center">
                  <span className={`text-[9px] font-black tracking-wide uppercase block ${isSelected ? 'text-teal-400 font-bold' : 'text-slate-400'}`}>
                    {d.shortName}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 block leading-none mt-0.5 font-bold">
                    {d.dayNum}/{d.monthNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenedor Principal de Inputs y Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Volumen de Ventas (4 cols) */}
        <div className="lg:col-span-4 space-y-6 no-print">
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.03),transparent_50%)] pointer-events-none" />
            
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2 mb-2 font-display">
              <ShoppingCart size={16} className="text-teal-400" />
              Ventas Diarias Máximas
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-5">
              Establece las unidades vendidas en un día de ventas altas (100%). El ecualizador semanal prorrateará estos valores automáticamente.
            </p>

            <div className="space-y-3">
              {Object.keys(activeSales).map((key) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return (
                  <div key={key} className="flex items-center justify-between gap-4 p-2 bg-slate-900/35 border border-slate-850 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-350 font-sans">{label}</span>
                    <div className="flex items-center gap-2 select-none">
                      <button 
                        onClick={() => adjustCounter(key, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-300 text-xs font-black hover:bg-slate-700 active:scale-90 transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        value={activeSales[key]}
                        onChange={(e) => handleSalesChange(key, e.target.value)}
                        className="w-12 text-center text-xs font-bold text-white bg-slate-950 border border-slate-800 p-0.5 rounded font-mono"
                      />
                      <button 
                        onClick={() => adjustCounter(key, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-300 text-xs font-black hover:bg-slate-700 active:scale-90 transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Central: Vinculación con Inventario de Cocina (4 cols) */}
        <div className="lg:col-span-4 space-y-6 no-print">
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2 mb-2 font-display">
                <Sparkles size={16} className="text-yellow-400" />
                Equipos de Preparación
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
                Si tu local posee el aparato, leerá su potencia real. Si no lo has registrado, simulará una potencia genérica de mercado.
              </p>

              <div className="space-y-3">
                {Object.keys(specs).map((key) => {
                  const item = specs[key];
                  return (
                    <div key={key} className="p-3 bg-slate-900/20 border border-slate-850 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 font-sans">{item.nombre}</span>
                        {item.conectado ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase flex items-center gap-1 font-mono">
                            <CheckCircle size={10} /> Conectado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase flex items-center gap-1 font-mono">
                            <AlertTriangle size={10} /> Genérico
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Consumo Simulación:</span>
                        <span className="font-bold text-slate-300">{item.watts} W</span>
                      </div>

                      {!item.conectado && (
                        <button
                          onClick={() => handleQuickAdd(key)}
                          className="w-full mt-1.5 py-1 px-2 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 font-sans cursor-pointer"
                        >
                          <PlusCircle size={12} />
                          Agregar al local real
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Proyección Energética y Comparativas (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Caja Costo Ventas */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border-t-4 border-t-emerald-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Gasto Facturación Ventas ({diasPeriodo} Días)</span>
            <div className="text-3xl font-black text-white mt-1.5 font-sans tracking-tight">
              ${Math.round(desgloseVentas.factura.total).toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-500 font-sans">MXN</span>
            </div>
            <span className="text-[10px] text-slate-450 block font-sans mt-0.5 leading-tight">
              CFE Tarifa 1C calculada sobre {Math.round(totalKwhVentasPeriodo)} kWh para el periodo de {diasPeriodo} días.
            </span>
          </div>

          {/* Desglose Diario kWh */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <TrendingUp size={14} className="text-[#00875a]" />
              Desglose de Consumo Promedio
            </h4>
            
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Crepera (Crepas & Marquesitas):</span>
                <span className="text-slate-200 font-bold">{kwhProrrateado.crepera.toFixed(2)} kWh/día</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cafetería (Espresso/Grinder):</span>
                <span className="text-slate-200 font-bold">{(kwhProrrateado.cafetera + kwhProrrateado.molino).toFixed(2)} kWh/día</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Licuadora / Trituradora:</span>
                <span className="text-slate-200 font-bold">{(kwhProrrateado.licuadora + kwhProrrateado.trituradora).toFixed(2)} kWh/día</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vaporera / Hervidor:</span>
                <span className="text-slate-200 font-bold">{(kwhProrrateado.vaporera + kwhProrrateado.hervidor).toFixed(2)} kWh/día</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2 font-bold text-slate-250 text-xs">
                <span>Consumo Promedio Diario:</span>
                <span className="text-teal-400 font-bold">{totalKwhVentasDiario.toFixed(2)} kWh</span>
              </div>
            </div>
          </div>

          {/* Comparador Estático vs Real */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Info size={14} className="text-amber-500" />
              Análisis de Carga: Estática vs Ventas
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              El cuadro de cargas normativo simula los aparatos operando constantemente en su ciclo estándar diario. Aquí contrastamos ese costo estático con tu volumen de ventas reales prorrateadas.
            </p>

            <div className="space-y-2.5 text-xs pt-1.5">
              <div className="p-2.5 rounded bg-slate-900/40 border border-slate-850">
                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-mono">Consumo Estático Estándar</div>
                <div className="flex justify-between font-bold text-slate-200 mt-1 font-sans">
                  <span>${Math.round(desgloseEstatico.factura.total).toLocaleString()} MXN</span>
                  <span className="font-mono font-normal text-slate-400">{Math.round(totalKwhEstaticoPeriodo)} kWh</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/40 border border-slate-850">
                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-mono">Consumo Real por Ventas</div>
                <div className="flex justify-between font-bold text-emerald-450 mt-1 font-sans">
                  <span>${Math.round(desgloseVentas.factura.total).toLocaleString()} MXN</span>
                  <span className="font-mono font-normal text-slate-400">{Math.round(totalKwhVentasPeriodo)} kWh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- TABLAS ADICIONALES REQUERIDAS (RESUMEN POR APARATO Y COMPORTAMIENTO) --- */}
      
      {/* 1. Tabla de Resumen por Aparato */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-visible border border-slate-800/60">
        <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2 mb-3 font-display">
          <Info size={16} className="text-teal-450" />
          Resumen de Consumo Mensual y Costo por Aparato
        </h3>
        <p className="text-[10px] text-slate-450 leading-relaxed font-sans mb-4">
          Resumen del gasto eléctrico prorrateado mensual (30 días) para cada uno de los aparatos de preparación, valuado bajo el costo promedio de la tarifa actual. Habilita el Modo Eco o el Protocolo Eco en cada equipo para ver el ahorro inmediato.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-350 font-mono font-bold text-[10px] uppercase">
                <th className="py-2 text-left">Aparato</th>
                <th className="py-2 text-center">Modo / Protocolo Eco</th>
                <th className="py-2 text-center">Potencia Simulación</th>
                <th className="py-2 text-center">Consumo Diario (kWh)</th>
                <th className="py-2 text-center">Consumo Mensual (kWh)</th>
                <th className="py-2 text-right">Costo Estimado Mensual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-sans text-slate-300">
              {itemsConConsumo.map((item) => {
                const kwhMes = item.kwh * 30;
                const costoMes = kwhMes * costPerKwh;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="py-2.5 font-bold text-slate-200 text-left">
                      <div className="flex flex-col align-start items-start text-left justify-start">
                        <span>{item.name}</span>
                        <span className="text-[9px] text-slate-500 font-normal">
                          {item.modelo} {item.isReal ? (item.category === 'estatico' ? '• Soporte' : `• Real (wf: ${(item.wf * 100).toFixed(0)}%)`) : '• Simulado'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center overflow-visible align-middle">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => toggleEco(item.id)}
                          onMouseEnter={() => handleEcoMouseEnter(item.id)}
                          onMouseLeave={handleEcoMouseLeave}
                          className={`px-2 py-0.5 text-[8.5px] font-black rounded border transition-all cursor-pointer ${
                            item.ecoActive
                              ? item.category === 'estatico'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {item.ecoActive 
                            ? item.category === 'estatico' ? '🔵 PROTOCOLO ACTIVO' : '🟢 ECO ACTIVO'
                            : item.category === 'estatico' ? '🔵 ACTIVAR PROTOCOLO' : '🟢 ACTIVAR ECO'}
                        </button>
                        {hoveredEcoId === item.id && hoverMode && (() => {
                          const exp = getEcoExplanation(item);
                          return (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 p-3 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl z-50 text-left pointer-events-none animate-fadeIn leading-relaxed">
                              {/* Arrow pointing up */}
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-950 border-l border-t border-slate-800 rotate-45" />
                              <div className="flex items-center gap-1.5 mb-1.5 text-[9.5px] font-bold text-teal-400 font-mono">
                                <span>{exp.title}</span>
                              </div>
                              <p className="text-[9px] text-slate-300 font-sans">
                                {exp.brief}
                              </p>
                              {hoverMode === 'full' && (
                                <p className="text-[9px] text-slate-400 font-sans mt-2 pt-2 border-t border-slate-900/60 animate-fadeIn">
                                  {exp.full}
                                </p>
                              )}
                              <div className="mt-2 pt-1.5 border-t border-slate-900 text-[8px] font-mono text-slate-500 text-right font-bold">
                                {hoverMode === 'brief' ? 'Mantén 3s más para ver detalle...' : 'Explicación detallada'}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-400">{item.watts.toFixed(0)} W</td>
                    <td className="py-2.5 text-center font-mono text-slate-300">{item.kwh.toFixed(3)} kWh</td>
                    <td className="py-2.5 text-center font-mono text-slate-300">{kwhMes.toFixed(1)} kWh</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-400">${Math.round(costoMes).toLocaleString()} MXN</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-800 font-bold bg-slate-900/40 text-slate-200">
                <td className="py-3 text-left">TOTALES SIMULACIÓN</td>
                <td className="py-3 text-center">—</td>
                <td className="py-3 text-center">—</td>
                <td className="py-3 text-center font-mono text-teal-400">{totalKwhVentasDiario.toFixed(3)} kWh</td>
                <td className="py-3 text-center font-mono text-teal-400">{(totalKwhVentasDiario * 30).toFixed(1)} kWh</td>
                <td className="py-3 text-right font-mono font-black text-emerald-400">${Math.round(totalKwhVentasDiario * 30 * costPerKwh).toLocaleString()} MXN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Tabla de Desglose de Comportamiento */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-slate-800/60">
        <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2 mb-2 font-display">
          <HelpCircle size={16} className="text-violet-400" />
          Desglose de Consumo por Comportamiento y Ciclo Operativo
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <p className="text-[10px] text-slate-450 leading-relaxed font-sans max-w-xl">
            Detalle del comportamiento térmico y motor de los aparatos. Muestra el impacto en el tiempo de uso diario según la segmentación de afluencia semanal. Selecciona un día de la semana para ver su tiempo de uso exacto resaltado.
          </p>
          <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-900 no-print">
            <span className="text-[9.5px] font-bold text-slate-400 px-2 uppercase font-mono">Día:</span>
            {weekDates.map(d => (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDate(d.key)}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedDate === d.key
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 font-bold'
                    : 'border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.shortName} {d.dayNum}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-350 font-mono font-bold text-[10px] uppercase">
                <th className="py-2 text-left">Aparato</th>
                <th className="py-2 text-left">Fase / Modo de Operación</th>
                <th className="py-2 text-center">Tiempo Diario Promedio</th>
                <th className="py-2 text-center">Modo Bajo (&le; 30%)</th>
                <th className="py-2 text-center">Modo Medio (30% - 70%)</th>
                <th className="py-2 text-center">Modo Alto (&gt; 70%)</th>
                <th className="py-2 text-center bg-violet-950/30 text-violet-300">Día Seleccionado ({selectedDayInfo.shortName} {selectedDayInfo.dayNum}/{selectedDayInfo.monthNum})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 font-sans text-slate-300">
              {itemsConConsumo.map((item) => {
                if (item.category === 'crepera') {
                  const d15 = getDurations(item, 15);
                  const d50 = getDurations(item, 50);
                  const d100 = getDurations(item, 100);
                  const dSel = getDurations(item, selectedDateVal);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 font-bold text-slate-200 text-left align-middle" rowSpan="3">
                          <div className="flex flex-col align-start items-start text-left justify-start">
                            <span>{item.name}</span>
                            <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-350 text-left">Precalentamiento Matutino</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgPreheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.preheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.preheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.preheat)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.preheat)}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 text-slate-350 text-left">Cocción Activa (Pedidos)</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.prep)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.prep)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.prep)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.prep)}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 text-slate-350 text-left">Mantenimiento Térmico (Standby)</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgStandby + item.avgReheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.standby + d15.reheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.standby + d50.reheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.standby + d100.reheat)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.standby + dSel.reheat)}</td>
                      </tr>
                    </React.Fragment>
                  );
                }

                if (item.category === 'cafetera') {
                  const d15 = getDurations(item, 15);
                  const d50 = getDurations(item, 50);
                  const d100 = getDurations(item, 100);
                  const dSel = getDurations(item, selectedDateVal);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 font-bold text-slate-200 text-left align-middle" rowSpan="3">
                          <div className="flex flex-col align-start items-start text-left justify-start">
                            <span>{item.name}</span>
                            <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-350 text-left">Estabilización (Precalentamiento)</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgPreheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.preheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.preheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.preheat)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.preheat)}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 text-slate-350 text-left">Extracción de Shots</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.prep)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.prep)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.prep)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.prep)}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 text-slate-350 text-left">Presión de Vapor (Standby)</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgStandby)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.standby)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.standby)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.standby)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.standby)}</td>
                      </tr>
                    </React.Fragment>
                  );
                }

                if (item.category === 'hervidor') {
                  const d15 = getDurations(item, 15);
                  const d50 = getDurations(item, 50);
                  const d100 = getDurations(item, 100);
                  const dSel = getDurations(item, selectedDateVal);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 font-bold text-slate-200 text-left align-middle" rowSpan="2">
                          <div className="flex flex-col align-start items-start text-left justify-start">
                            <span>{item.name}</span>
                            <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-350 text-left">Reposición de Agua (Pedidos)</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.prep + d15.preheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.prep + d50.preheat)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.prep + d100.preheat)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.prep + dSel.preheat)}</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-2.5 text-slate-350 text-left">Resistencia de Urna (Standby)</td>
                        <td className="py-2.5 text-center font-mono">{formatTime(item.avgStandby)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.standby)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.standby)}</td>
                        <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.standby)}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.standby)}</td>
                      </tr>
                    </React.Fragment>
                  );
                }

                if (item.category === 'vaporera') {
                  const d15 = getDurations(item, 15);
                  const d50 = getDurations(item, 50);
                  const d100 = getDurations(item, 100);
                  const dSel = getDurations(item, selectedDateVal);

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-2.5 font-bold text-slate-200 text-left">
                        <div className="flex flex-col align-start items-start text-left justify-start">
                          <span>{item.name}</span>
                          <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-350 text-left">Baño María Sostenido</td>
                      <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.prep)}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.prep)}</td>
                    </tr>
                  );
                }

                if (item.category === 'licuadora') {
                  const d15 = getDurations(item, 15);
                  const d50 = getDurations(item, 50);
                  const d100 = getDurations(item, 100);
                  const dSel = getDurations(item, selectedDateVal);

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-2.5 font-bold text-slate-200 text-left">
                        <div className="flex flex-col align-start items-start text-left justify-start">
                          <span>{item.name}</span>
                          <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-350 text-left">Ciclos de Licuado (Pulsos)</td>
                      <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.prep)}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.prep)}</td>
                    </tr>
                  );
                }

                if (item.category === 'trituradora') {
                  const d15 = getDurations(item, 15);
                  const d50 = getDurations(item, 50);
                  const d100 = getDurations(item, 100);
                  const dSel = getDurations(item, selectedDateVal);

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-2.5 font-bold text-slate-200 text-left">
                        <div className="flex flex-col align-start items-start text-left justify-start">
                          <span>{item.name}</span>
                          <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-350 text-left">Trituración de Hielo (Pulsos)</td>
                      <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.prep)}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.prep)}</td>
                    </tr>
                  );
                }

                if (item.category === 'molino') {
                  const d15 = getDurations(item, 15);
                  const d50 = getDurations(item, 50);
                  const d100 = getDurations(item, 100);
                  const dSel = getDurations(item, selectedDateVal);

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-2.5 font-bold text-slate-200 text-left">
                        <div className="flex flex-col align-start items-start text-left justify-start">
                          <span>{item.name}</span>
                          <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-350 text-left">Molienda de Café (Pulsos)</td>
                      <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d15.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d50.prep)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(d100.prep)}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(dSel.prep)}</td>
                    </tr>
                  );
                }

                if (item.category === 'estatico') {
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-2.5 font-bold text-slate-200 text-left">
                        <div className="flex flex-col align-start items-start text-left justify-start">
                          <span>{item.name}</span>
                          <span className="text-[8px] text-slate-500 font-normal font-mono">{item.modelo}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-350 text-left">Operación de Soporte</td>
                      <td className="py-2.5 text-center font-mono">{formatTime(item.avgPrep, true)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(item.avgPrep, true)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(item.avgPrep, true)}</td>
                      <td className="py-2.5 text-center font-mono text-slate-550">{formatTime(item.avgPrep, true)}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-violet-400 bg-violet-500/10">{formatTime(item.avgPrep, true)}</td>
                    </tr>
                  );
                }

                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Explicativo de Fórmulas y Comportamiento Dinámico */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <h3 className="text-sm font-bold tracking-wider text-slate-250 uppercase flex items-center gap-2 mb-4 font-display">
          <HelpCircle size={18} className="text-teal-400" />
          Explicación de Fórmulas y Comportamiento Dinámico de los Equipos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-400 leading-relaxed font-sans">
          
          <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Crepera Eléctrica (Crepas y Marquesitas)
            </h4>
            <p>
              Consume su potencia nominal ({specs.crepera.watts} W) durante un ciclo inicial de <strong>15 minutos</strong> para alcanzar temperatura de cocción.
            </p>
            <p>
              Por cada crepe vendida se consumen <strong>2.5 minutos</strong> activos. Para las marquesitas se consumen <strong>3.0 minutos</strong>.
            </p>
            <p>
              En reposo, el termostato mantiene la plancha caliente al <strong>25% de potencia</strong>. Si la <em>Política Eco</em> está activa, se apaga tras 15 min sin uso (standby cae al 2% de potencia), requiriendo un recalentamiento corto de 4 min al llegar un nuevo pedido.
            </p>
          </div>

          <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Dispensador / Hervidor de Agua (Maruchan)
            </h4>
            <p>
              El dispensador de agua caliente mantiene el agua a temperatura regulada consumiendo un <strong>10% en standby</strong>.
            </p>
            <p>
              Al extraer agua para un ramen, consume al 100% de potencia ({specs.hervidor.watts} W) durante <strong>1.5 minutos</strong> para calentar el agua de reposición automática.
            </p>
            <p>
              Con la <em>Política de Aislamiento</em> activa, la retención de calor aumenta, reduciendo el ciclo del termostato al <strong>3% de potencia en standby</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Cafetera Espresso y Molino de Café
            </h4>
            <p>
              La cafetera comercial calienta y estabiliza presión durante <strong>20 minutos</strong> a máxima potencia ({specs.cafetera.watts} W).
            </p>
            <p>
              Cada shot consume potencia completa durante <strong>30 segundos</strong>. La caldera se mantiene caliente consumiendo un <strong>15% en standby</strong> (o <strong>6% con Reposo Eco</strong>).
            </p>
            <p>
              El molino de café consume {specs.molino.watts} W en pulsos de <strong>9 segundos (0.15 min)</strong> por taza servida, sin standby.
            </p>
          </div>

          <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl space-y-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Licuadoras e Ice Shavers (Smoothies y Raspados)
              </h4>
              <p>
                Los motores no requieren precalentamiento ni standby. Su consumo es reactivo por pulso: la licuadora opera durante <strong>45 segundos</strong> por smoothie y la raspadora durante <strong>20 segundos</strong> por raspado.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Vaporera / Olla de Esquites
              </h4>
              <p>
                Opera a baño maría continuo durante toda la jornada de 8 horas (480 minutos). El termostato cicla sosteniendo un <strong>35% de potencia nominal</strong> para mantener los elotes a 70°C. Si se activa la <em>Política de Tapa Hermética</em>, la disipación térmica cae drásticamente y el ciclo de encendido del calentador baja a un <strong>15% de potencia</strong>.
              </p>
            </div>
          </div>

      </div>
    </div>
    </div>
  );
}
