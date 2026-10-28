import React, { useState, useEffect } from 'react';
import { PlusCircle, RefreshCw, Layers, Clock, AlertTriangle, ShieldCheck, HeartPulse, HelpCircle, Gauge } from 'lucide-react';
import { determinarAcometida, obtenerFaseGreedy } from '../utils/electricalCalculations';
import { CATALOGO_RESIDENCIAL } from '../utils/catalogoAparatos';

// Mapear el catálogo maestro para generar los presets del formulario
const PRESETS = CATALOGO_RESIDENCIAL.map((item, idx) => {
  let tipoCarga = item.tipoCarga || 'monofasica';
  if (!item.tipoCarga) {
    if (item.watts >= 10000) {
      tipoCarga = 'trifasica';
    } else if (item.watts >= 3000) {
      tipoCarga = 'bifasica';
    }
  }

  return {
    tipo: item.tipo,
    modelo: 'Residencial',
    watts: item.watts,
    fp: item.fp,
    usarVaDirecto: item.fp === 1.0,
    tipoCarga: tipoCarga,
    horasAlta: item.tipo.toLowerCase().includes('clima') || item.tipo.toLowerCase().includes('minisplit') ? 8 : (item.tipo.toLowerCase().includes('refrigerador') ? 24 : 4),
    horasReposo: 0,
    consumoVariable: false,
    precio: item.precio,
    mantenimiento: item.mantenimiento,
    vidaUtil: item.vidaUtil,
    criteriosDurabilidad: item.criteriosDurabilidad,
    criteriosMantenimiento: item.criteriosMantenimiento,
    durabilidadOption: 'estandar',
    tuberiaDiametro: '16 mm (1/2")',
    tuberiaTipo: 'Pared Delgada',
    longitudMetros: 15,
    kaic: '10 kA',
    factorTemperatura: 1.0,
    factorAgrupamiento: 1.0
  };
});

export default function AparatoForm({ 
  aparatos, 
  onAddAparato,
  isCollapsed = false,
  onToggleCollapse,
  medidores = [],
  currentMedidorId = null
}) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [formData, setFormData] = useState({ 
    ...PRESETS[0],
    medidorId: currentMedidorId || medidores[0]?.id || 'med_1'
  });
  const [selectedFase, setSelectedFase] = useState('A');
  const [faseSugerida, setFaseSugerida] = useState('A');
  const [projectedAcometida, setProjectedAcometida] = useState(determinarAcometida(0));
  const [timeWarning, setTimeWarning] = useState('');

  useEffect(() => {
    if (currentMedidorId) {
      setFormData(prev => ({ ...prev, medidorId: currentMedidorId }));
    }
  }, [currentMedidorId]);

  // Identificar si es refrigerador o congeladora
  const esEquipoCritico = (tipo) => {
    const t = (tipo || '').toLowerCase();
    return t.includes('refrigerador') || t.includes('congeladora') || t.includes('enfriador') || t.includes('chiller');
  };

  // Efecto para calcular de forma reactiva la fase sugerida y acometida proyectada, y validar tiempos
  useEffect(() => {
    const inputWatts = parseFloat(formData.watts) || 0;
    const currentTotalWatts = aparatos.reduce((sum, ap) => sum + (parseFloat(ap.watts) || 0), 0);
    const newTotalWatts = currentTotalWatts + inputWatts;
    
    // Determinar la acometida resultante si agregamos este aparato
    const newAcometida = determinarAcometida(newTotalWatts);
    setProjectedAcometida(newAcometida);

    // Sugerir la fase usando Greedy basado en las fases del nuevo sistema
    if (formData.tipoCarga === 'monofasica') {
      const sugerida = obtenerFaseGreedy(aparatos, inputWatts, newAcometida.fasesDisponibles);
      setFaseSugerida(sugerida);
      
      if (!newAcometida.fasesDisponibles.includes(selectedFase) || selectedFase.includes('-')) {
        setSelectedFase(sugerida);
      }
    } else if (formData.tipoCarga === 'bifasica') {
      if (newAcometida.id === 'bifasico') {
        setSelectedFase('A-B');
      } else if (newAcometida.id === 'trifasico') {
        if (!['A-B', 'B-C', 'A-C'].includes(selectedFase)) {
          setSelectedFase('A-B');
        }
      } else {
        setSelectedFase('A');
      }
    } else if (formData.tipoCarga === 'trifasica') {
      if (newAcometida.id === 'trifasico') {
        setSelectedFase('A-B-C');
      } else {
        setSelectedFase('A');
      }
    }

    // --- VALIDACIÓN DE TIEMPO ---
    let totalHoras = 0;
    if (formData.consumoVariable) {
      totalHoras = (parseFloat(formData.horasAlta) || 0) + (parseFloat(formData.horasReposo) || 0);
    } else {
      totalHoras = esEquipoCritico(formData.tipo) ? 24 : (parseFloat(formData.horasAlta) || 0);
    }

    if (totalHoras > 24) {
      setTimeWarning(`⚠️ El tiempo total de uso (${totalHoras} hrs) excede las 24 horas del día.`);
    } else {
      setTimeWarning('');
    }
  }, [formData.watts, formData.tipoCarga, formData.consumoVariable, formData.horasAlta, formData.horasReposo, formData.tipo, aparatos, selectedFase]);

  // Sincronizar selección monofásica con la sugerencia Greedy
  useEffect(() => {
    if (formData.tipoCarga === 'monofasica') {
      setSelectedFase(faseSugerida);
    }
  }, [faseSugerida, formData.tipoCarga]);

  const handlePresetChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setPresetIndex('custom');
      setFormData({
        tipo: 'Aparato Personalizado',
        modelo: 'Modelo Pro',
        watts: 1000,
        fp: 0.90,
        usarVaDirecto: false,
        tipoCarga: 'monofasica',
        horasAlta: 8,
        horasReposo: 0,
        consumoVariable: false,
        precio: 5000,
        mantenimiento: 500,
        vidaUtil: 5,
        criteriosDurabilidad: 'Aparato registrado de forma manual y personalizada.',
        criteriosMantenimiento: 'Criterio manual de mantenimiento.',
        durabilidadOption: 'estandar'
      });
    } else {
      const idx = parseInt(val);
      setPresetIndex(idx);
      const preset = PRESETS[idx];
      setFormData({ ...preset });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      let updatedVal = type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value);
      
      const updated = {
        ...prev,
        [name]: updatedVal
      };

      // Si cambia el tipo de carga, reconfiguramos la fase
      if (name === 'tipoCarga') {
        if (value === 'monofasica') {
          setSelectedFase(faseSugerida);
        } else if (value === 'bifasica') {
          setSelectedFase('A-B');
        } else if (value === 'trifasica') {
          setSelectedFase('A-B-C');
        }
      }

      // Si cambia a consumo variable, inicializar horas de reposo
      if (name === 'consumoVariable') {
        if (checked) {
          updated.horasAlta = prev.horasAlta > 24 ? 12 : prev.horasAlta;
          updated.horasReposo = 4;
        } else {
          updated.horasReposo = 0;
          if (esEquipoCritico(prev.tipo)) {
            updated.horasAlta = 24;
          }
        }
      }

      return updated;
    });
  };

  // Cambio en el selector de durabilidad de uso
  const handleDurabilidadChange = (e) => {
    const opt = e.target.value;
    if (presetIndex === 'custom') {
      setFormData(prev => ({
        ...prev,
        durabilidadOption: opt
      }));
      return;
    }
    const baseItem = CATALOGO_RESIDENCIAL[presetIndex];

    let factorPrecio = 1.0;
    let factorVida = 1.0;
    if (opt === 'rudo') {
      factorPrecio = 1.20;
      factorVida = 1.40;
    } else if (opt === 'ligero') {
      factorPrecio = 0.90;
      factorVida = 0.80;
    }

    setFormData(prev => ({
      ...prev,
      durabilidadOption: opt,
      precio: Math.round(baseItem.precio * factorPrecio),
      vidaUtil: Math.round(baseItem.vidaUtil * factorVida)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tipo.trim() || timeWarning) return;

    // Si es equipo crítico y no es variable, forzar a 24 horas estándar (se guarda en horasAlta)
    const finalHorasAlta = esEquipoCritico(formData.tipo) && !formData.consumoVariable ? 24 : formData.horasAlta;
    const finalHorasReposo = formData.consumoVariable ? formData.horasReposo : 0;

    const baseVariant = {
      id: 'default',
      nombre: formData.modelo || 'Modelo Original',
      watts: parseFloat(formData.watts) || 0,
      fp: parseFloat(formData.fp) || 1.0,
      precio: parseFloat(formData.precio) || 0,
      mantenimiento: parseFloat(formData.mantenimiento) || 0,
      vidaUtil: parseFloat(formData.vidaUtil) || 5,
      horasAlta: finalHorasAlta,
      horasReposo: finalHorasReposo,
      consumoVariable: formData.consumoVariable,
      durabilidadOption: formData.durabilidadOption,
      tipoCarga: formData.tipoCarga,
      usarVaDirecto: formData.usarVaDirecto,
      criteriosDurabilidad: formData.criteriosDurabilidad || '',
      criteriosMantenimiento: formData.criteriosMantenimiento || ''
    };

    const targetMedidorId = formData.medidorId || currentMedidorId || medidores[0]?.id || 'med_1';

    onAddAparato({
      ...formData,
      medidorId: targetMedidorId,
      horasAlta: finalHorasAlta,
      horasReposo: finalHorasReposo,
      fase: selectedFase,
      variantes: [baseVariant],
      activaVariantId: 'default'
    });

    // Resetear formulario con el preset actual
    setFormData({ 
      ...PRESETS[presetIndex === 'custom' ? 0 : presetIndex],
      medidorId: targetMedidorId
    });
  };

  const renderFaseOptions = () => {
    if (projectedAcometida.id === 'monofasico' || formData.tipoCarga === 'monofasica') {
      return projectedAcometida.fasesDisponibles.map(f => (
        <option key={f} value={f} className="bg-slate-900 text-white">
          Fase {f}
        </option>
      ));
    }

    if (formData.tipoCarga === 'bifasica') {
      if (projectedAcometida.id === 'bifasico') {
        return <option value="A-B" className="bg-slate-900 text-white">Fases A-B (220V)</option>;
      }
      if (projectedAcometida.id === 'trifasico') {
        return (
          <>
            <option value="A-B" className="bg-slate-900 text-white">Fases A-B (220V)</option>
            <option value="B-C" className="bg-slate-900 text-white">Fases B-C (220V)</option>
            <option value="A-C" className="bg-slate-900 text-white">Fases A-C (220V)</option>
          </>
        );
      }
    }

    if (formData.tipoCarga === 'trifasica') {
      if (projectedAcometida.id === 'trifasico') {
        return <option value="A-B-C" className="bg-slate-900 text-white">Fases A-B-C (220V Trifásico)</option>;
      }
    }

    return <option value="A" className="bg-slate-900 text-white">Fase A (Forzado 127V)</option>;
  };

  const isCritical = esEquipoCritico(formData.tipo);

  return (
    <div className="glass-panel p-6 rounded-2xl relative transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <PlusCircle className="text-teal-400" size={20} />
          Registrar Aparato Eléctrico
        </h2>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Ocultar panel"
          >
            ▶
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
            Seleccionar Preset de Cocina
          </label>
          <select
            value={presetIndex}
            onChange={handlePresetChange}
            className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-200 border-slate-800"
          >
            {PRESETS.map((p, idx) => (
              <option key={idx} value={idx} className="bg-slate-900 text-white">
                {p.tipo} ({p.watts}W / {p.tipoCarga === 'monofasica' ? '127V' : '220V'})
              </option>
            ))}
            <option value="custom" className="bg-slate-900 text-teal-400 font-bold">
              🛠️ Aparato Personalizado (Ingresar datos a mano)
            </option>
          </select>
        </div>

        {/* Tipo de Carga */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
            Tipo de Carga (Tensión)
          </label>
          <select
            name="tipoCarga"
            value={formData.tipoCarga}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-200 border-slate-800"
          >
            <option value="monofasica" className="bg-slate-900 text-white">Monofásica (127 V CA)</option>
            <option 
              value="bifasica" 
              className="bg-slate-900 text-white"
              disabled={projectedAcometida.id === 'monofasico'}
            >
              Bifásica (220 V CA) {projectedAcometida.id === 'monofasico' ? '[Requiere >5kW]' : ''}
            </option>
            <option 
              value="trifasica" 
              className="bg-slate-900 text-white"
              disabled={projectedAcometida.id !== 'trifasico'}
            >
              Trifásica (220 V CA) {projectedAcometida.id !== 'trifasico' ? '[Requiere >10kW]' : ''}
            </option>
          </select>
        </div>

        {/* Medidor CFE Asignado */}
        {medidores && medidores.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase flex items-center gap-1.5">
              <Gauge size={13} className="text-teal-400" />
              Medidor CFE Asignado
            </label>
            <select
              name="medidorId"
              value={formData.medidorId || currentMedidorId || medidores[0]?.id || 'med_1'}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-teal-300 border-slate-800 bg-slate-900"
            >
              {medidores.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white font-bold">
                  Medidor {m.numero}: {m.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
              Tipo de Aparato
            </label>
            <input
              type="text"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              placeholder="Ej. Licuadora"
              className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
              Modelo / Marca
            </label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              placeholder="Ej. Vitamix 3"
              className="w-full px-3 py-2 rounded-lg glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
              Potencia Activa (Watts)
            </label>
            <input
              type="number"
              name="watts"
              value={formData.watts}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
              Factor de Potencia (FP)
            </label>
            <input
              type="number"
              name="fp"
              value={formData.fp}
              onChange={handleChange}
              min="0.1"
              max="1.0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
              disabled={formData.usarVaDirecto}
              required
            />
          </div>

          {/* Precio CapEx */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
              Precio del Equipo (MXN)
            </label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono text-emerald-400 font-bold"
              required
            />
          </div>

          {/* Mantenimiento OpEx */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
              Mantenimiento Anual (MXN)
            </label>
            <input
              type="number"
              name="mantenimiento"
              value={formData.mantenimiento}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono text-amber-400"
              required
            />
          </div>
        </div>

        {/* --- DYNAMIC DURABILITY CONFIGURATION --- */}
        <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Opciones de Durabilidad y Uso</span>
            </div>
            
            <div className="text-[9px] text-slate-400 uppercase font-mono">
              Vida Base: {CATALOGO_RESIDENCIAL[presetIndex]?.vidaUtil} años
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                Clasificación de Uso
              </label>
              <select
                value={formData.durabilidadOption}
                onChange={handleDurabilidadChange}
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-bold text-slate-300 border-slate-800"
              >
                <option value="rudo" className="bg-slate-900 text-white">Uso Rudo / Continuo (+40% Vida, +20% Precio)</option>
                <option value="estandar" className="bg-slate-900 text-white">Uso Estándar / Residencial</option>
                <option value="ligero" className="bg-slate-900 text-white">Uso Ligero / Ocasional (-20% Vida, -10% Precio)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                Vida Estimada (Años)
              </label>
              <input
                type="number"
                name="vidaUtil"
                value={formData.vidaUtil}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-bold text-slate-200 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4 py-2 border-y border-slate-800/60">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
            <input
              type="checkbox"
              name="usarVaDirecto"
              checked={formData.usarVaDirecto}
              onChange={handleChange}
              className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Usar VA directo (Watts = VA)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
            <input
              type="checkbox"
              name="consumoVariable"
              checked={formData.consumoVariable}
              disabled={isCritical}
              onChange={handleChange}
              className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className={isCritical ? 'text-slate-500' : ''}>
              Consumo Variable {isCritical ? '(Bloqueado para refrigeración)' : ''}
            </span>
          </label>
        </div>

        {/* --- DATOS DE CANALIZACIÓN Y LONGITUD (UVIE) --- */}
        <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <PlusCircle size={14} className="text-teal-400" />
            <span>Datos de Canalización y Longitud (UVIE)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                Diámetro de Tubería
              </label>
              <select
                name="tuberiaDiametro"
                value={formData.tuberiaDiametro || '16 mm (1/2")'}
                onChange={handleChange}
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-bold text-slate-300 border-slate-800"
              >
                <option value='16 mm (1/2")' className="bg-slate-900 text-white">16 mm (1/2")</option>
                <option value='21 mm (3/4")' className="bg-slate-900 text-white">21 mm (3/4")</option>
                <option value='27 mm (1")' className="bg-slate-900 text-white">27 mm (1")</option>
                <option value='35 mm (1 1/4")' className="bg-slate-900 text-white">35 mm (1 1/4")</option>
                <option value='41 mm (1 1/2")' className="bg-slate-900 text-white">41 mm (1 1/2")</option>
                <option value='53 mm (2")' className="bg-slate-900 text-white">53 mm (2")</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                Tipo de Tubería
              </label>
              <input
                type="text"
                name="tuberiaTipo"
                value={formData.tuberiaTipo || 'Pared Delgada'}
                onChange={handleChange}
                placeholder="Pared Delgada / Licuatite"
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-bold text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                Longitud al Tablero (m)
              </label>
              <input
                type="number"
                name="longitudMetros"
                value={formData.longitudMetros || 15}
                onChange={handleChange}
                min="1"
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-bold text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                Capacidad Interruptiva (KAIC)
              </label>
              <input
                type="text"
                name="kaic"
                value={formData.kaic || '10 kA'}
                onChange={handleChange}
                placeholder="10 kA"
                className="w-full px-2 py-1.5 rounded-lg glass-input text-xs font-bold text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* --- DYNAMIC OPERATION HOURS CONFIGURATION --- */}
        <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Clock size={14} className="text-teal-400" />
            <span>Perfil Horario de Operación (Diario)</span>
          </div>

          {formData.consumoVariable ? (
            // Modo Consumo Variable (Despliega Alta y Reposo)
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                  {"Demanda Alta ($T_{alta}$)"}
                </label>
                <input
                  type="number"
                  name="horasAlta"
                  value={formData.horasAlta}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                  {"Reposo/Bajo ($T_{reposo}$)"}
                </label>
                <input
                  type="number"
                  name="horasReposo"
                  value={formData.horasReposo}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                />
              </div>
            </div>
          ) : (
            // Modo Consumo Constante (Despliega horas estándar)
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase font-medium">
                {"Horas Estándar ($T_{std}$)"}
              </label>
              {isCritical ? (
                <div>
                  <input
                    type="number"
                    value={24}
                    disabled
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-emerald-400 font-bold"
                  />
                  <p className="text-[9px] text-emerald-400 mt-1">
                    * Bloqueado a 24 horas continuas por norma UVIE (Refrigeración).
                  </p>
                </div>
              ) : (
                <input
                  type="number"
                  name="horasAlta"
                  value={formData.horasAlta}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                />
              )}
            </div>
          )}

          {/* Time Validation Warning */}
          {timeWarning && (
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold flex items-center gap-1.5">
              <AlertTriangle size={12} className="flex-shrink-0" />
              <span>{timeWarning}</span>
            </div>
          )}
        </div>

        {/* --- DYNAMIC CRITERIA EXPLAINER BOX --- */}
        {formData.criteriosDurabilidad && (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/50 space-y-2 text-[11px] text-slate-450 leading-relaxed font-sans">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <HeartPulse size={13} className="text-teal-400" />
              <span>Criterios de Ciclo de Vida y Mantenimiento</span>
            </div>
            <div className="space-y-1.5">
              <p>
                <strong className="text-slate-350">Durabilidad: </strong>
                {formData.criteriosDurabilidad}
              </p>
              <p>
                <strong className="text-slate-350">Mantenimiento: </strong>
                {formData.criteriosMantenimiento}
              </p>
            </div>
          </div>
        )}

        {/* Balanceador y Selección de Fase */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-1.5">
              <Layers size={15} className="text-teal-400" />
              <span className="text-xs font-semibold text-slate-200">
                {formData.tipoCarga === 'monofasica' ? 'Línea de Conexión' : 'Líneas del Circuito'}
              </span>
            </div>
            
            {formData.tipoCarga === 'monofasica' && (
              <div className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1 font-medium font-sans">
                <RefreshCw size={10} className="animate-spin-slow" />
                Recomienda: Fase {faseSugerida}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedFase}
              onChange={(e) => setSelectedFase(e.target.value)}
              className="w-full px-3 py-2 rounded-lg glass-input text-sm font-bold text-slate-200"
            >
              {renderFaseOptions()}
            </select>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            * Carga proyectada: {(aparatos.reduce((sum, ap) => sum + ap.watts, 0) + (parseFloat(formData.watts) || 0)).toLocaleString()} W ({projectedAcometida.tipo})
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!!timeWarning}
          className={`w-full py-2.5 rounded-lg text-slate-950 font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            timeWarning 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50' 
              : 'bg-teal-500 hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/25 active:scale-[0.98]'
          }`}
        >
          <PlusCircle size={18} />
          Agregar al Cuadro de Cargas
        </button>
      </form>
    </div>
  );
}
