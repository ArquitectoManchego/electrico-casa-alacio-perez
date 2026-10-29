import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Trash2, 
  LayoutGrid, 
  Info, 
  Zap, 
  Sliders, 
  Settings,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  calcularVA, 
  calcularCorrienteNominal, 
  calcularCorrienteCorregida, 
  seleccionarProteccion, 
  seleccionarConductor,
  calcularDesbalanceUVIE
} from '../utils/ecuacionesUVIE';

// Obtener la fase por defecto física de un slot (Square D alternada)
const getFasePredefinidaDeSlot = (slotNum) => {
  const cycle = Math.ceil(slotNum / 2) % 3;
  if (cycle === 1) return 'A';
  if (cycle === 2) return 'B';
  return 'C';
};

// Determinar ducto comercial según calibre AWG
const seleccionarTubo = (conductor, cablesCount = 3) => {
  if (!conductor) return '16mm (1/2")';
  const cond = conductor.toUpperCase();
  if (cond.includes('14 AWG') || cond.includes('12 AWG')) return '16mm (1/2")';
  if (cond.includes('10 AWG')) return cablesCount > 3 ? '21mm (3/4")' : '16mm (1/2")';
  if (cond.includes('8 AWG')) return '21mm (3/4")';
  if (cond.includes('6 AWG') || cond.includes('4 AWG')) return '27mm (1")';
  if (cond.includes('2 AWG')) return '35mm (1 1/4")';
  return '41mm (1 1/2")';
};

export default function TableroVisual({ 
  aparatos, 
  onUpdateAparato, 
  acometida, 
  proyectoId,
  medidores = [],
  medidoresData = {},
  activeMedidorId,
  onSelectMedidor,
  onBalancearMedidor
}) {
  const listaMedidores = React.useMemo(() => (
    Array.isArray(medidores) && medidores.length > 0
      ? medidores
      : [{ id: 'med_1', numero: 1, nombre: 'Medidor 1', forzarTrifasico: false }]
  ), [medidores]);

  const [selectedMedId, setSelectedMedId] = useState(activeMedidorId || listaMedidores[0].id);

  useEffect(() => {
    if (activeMedidorId) {
      setSelectedMedId(activeMedidorId);
    }
  }, [activeMedidorId]);

  // Aparatos activos correspondientes al medidor seleccionado
  const aparatosActivos = React.useMemo(() => {
    if (listaMedidores.length <= 1 || selectedMedId === 'todos') return aparatos;
    return aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === selectedMedId);
  }, [aparatos, listaMedidores, selectedMedId]);

  const acometidaActiva = React.useMemo(() => {
    if (selectedMedId !== 'todos' && medidoresData && medidoresData[selectedMedId]?.acometida) {
      return medidoresData[selectedMedId].acometida;
    }
    return acometida;
  }, [selectedMedId, medidoresData, acometida]);

  const [viewMode, setViewMode] = useState('gabinete'); // 'gabinete' | 'unifilar'
  const [selectedAppId, setSelectedAppId] = useState(null);
  
  // Estados para edición interactiva sobre el plano
  const [editingBreakerId, setEditingBreakerId] = useState(null);
  const [editingWireId, setEditingWireId] = useState(null);
  
  // Variables globales del Alimentador y Proyecto
  const [projectSettings, setProjectSettings] = useState({
    cableInsulation: 'THW-2-LS',
    conduitMaterial: 'EMT (Metal)',
    overrideMainBreaker: 'Auto',
    mainConductorOverride: 'Auto',
    mainConduitOverride: 'Auto'
  });

  // Cargar settings del proyecto desde localStorage
  useEffect(() => {
    if (!proyectoId) return;
    const saved = localStorage.getItem(`electrical_proj_settings_${proyectoId}`);
    if (saved) {
      try {
        setProjectSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error cargando settings del proyecto:', e);
      }
    } else {
      setProjectSettings({
        cableInsulation: 'THW-2-LS',
        conduitMaterial: 'EMT (Metal)',
        overrideMainBreaker: 'Auto',
        mainConductorOverride: 'Auto',
        mainConduitOverride: 'Auto'
      });
    }
  }, [proyectoId]);

  // Guardar settings
  const updateProjectSettings = (newSettings) => {
    const updated = { ...projectSettings, ...newSettings };
    setProjectSettings(updated);
    if (proyectoId) {
      localStorage.setItem(`electrical_proj_settings_${proyectoId}`, JSON.stringify(updated));
    }
  };

  const fasesDisponibles = acometidaActiva.fasesDisponibles || ['A'];

  // Obtener aparato asignado a un slot dentro de los aparatos de este medidor
  const getAparatoEnSlot = (slotNum) => {
    return aparatosActivos.find(ap => ap.slot === slotNum);
  };

  // Manejar colocación o movimiento de aparato
  const handleSlotClick = (slotNum) => {
    if (selectedAppId) {
      const previo = aparatos.find(ap => ap.id === selectedAppId);
      
      const ocupante = getAparatoEnSlot(slotNum);
      if (ocupante) {
        onUpdateAparato(ocupante.id, { slot: null });
      }

      const fasePorDefecto = getFasePredefinidaDeSlot(slotNum);
      onUpdateAparato(selectedAppId, { 
        slot: slotNum,
        fase: fasesDisponibles.includes(fasePorDefecto) ? fasePorDefecto : fasesDisponibles[0]
      });

      setSelectedAppId(null);
    }
  };

  // Liberar slot de un aparato
  const handleReleaseSlot = (appId) => {
    onUpdateAparato(appId, { slot: null });
  };

  // Limpiar todo el tablero
  const handleLimpiarTablero = () => {
    aparatos.forEach(ap => {
      if (ap.slot) {
        onUpdateAparato(ap.id, { slot: null });
      }
    });
  };

  // Auto-distribuir equitativamente en slots libres
  const handleAutoDistribuir = () => {
    handleLimpiarTablero();
    setTimeout(() => {
      let slotIndex = 1;
      aparatos.forEach(ap => {
        const targetFase = getFasePredefinidaDeSlot(slotIndex);
        onUpdateAparato(ap.id, { 
          slot: slotIndex,
          fase: fasesDisponibles.includes(targetFase) ? targetFase : fasesDisponibles[0]
        });
        slotIndex++;
      });
    }, 100);
  };

  // Rotar fase en el diagrama
  const handleCycleFase = (appId, currentFase) => {
    if (fasesDisponibles.length <= 1) return;
    let nextFase = 'A';
    if (fasesDisponibles.length === 2) {
      nextFase = currentFase === 'A' ? 'B' : 'A';
    } else {
      if (currentFase === 'A') nextFase = 'B';
      else if (currentFase === 'B') nextFase = 'C';
      else nextFase = 'A';
    }
    onUpdateAparato(appId, { fase: nextFase });
  };

  // 1. Calcular Carga Total y Corrientes del Alimentador para este medidor
  const totalVA = aparatosActivos.reduce((sum, ap) => sum + calcularVA(ap.watts, ap.fp, ap.usarVaDirecto), 0);
  let mainCurrentNominal = 0;
  if (acometidaActiva.id === 'trifasico') {
    mainCurrentNominal = totalVA / (220 * 1.7320508);
  } else if (acometidaActiva.id === 'bifasico') {
    mainCurrentNominal = totalVA / 220;
  } else {
    mainCurrentNominal = totalVA / 127;
  }
  const mainCurrentCorregida = mainCurrentNominal * 1.25;

  // 2. Protecciones y Conductores Generales
  const autoMainBreaker = seleccionarProteccion(mainCurrentCorregida);
  const activeMainBreaker = projectSettings.overrideMainBreaker === 'Auto' 
    ? autoMainBreaker 
    : parseInt(projectSettings.overrideMainBreaker);

  const autoMainConductor = seleccionarConductor(activeMainBreaker);
  const activeMainConductor = projectSettings.mainConductorOverride === 'Auto'
    ? autoMainConductor
    : projectSettings.mainConductorOverride;

  const cablesCount = acometidaActiva.id === 'trifasico' ? 5 : acometidaActiva.id === 'bifasico' ? 4 : 3;
  const autoMainConduit = seleccionarTubo(activeMainConductor, cablesCount);
  const activeMainConduit = projectSettings.mainConduitOverride === 'Auto'
    ? autoMainConduit
    : projectSettings.mainConduitOverride;

  // 3. Cargar fasesVA del tablero (sincronizada)
  const fasesVA = { A: 0, B: 0, C: 0 };
  aparatosActivos.forEach(ap => {
    const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
    if (ap.slot) {
      if (ap.tipoCarga === 'trifasica' && acometidaActiva.id === 'trifasico') {
        fasesVA.A += va / 3;
        fasesVA.B += va / 3;
        fasesVA.C += va / 3;
      } else if (ap.tipoCarga === 'bifasica' && (acometidaActiva.id === 'bifasico' || acometidaActiva.id === 'trifasico')) {
        const fasePar = ap.fase || 'A-B';
        const partes = fasePar.split('-');
        partes.forEach(f => {
          if (fasesVA[f] !== undefined) {
            fasesVA[f] += va / partes.length;
          }
        });
      } else {
        let f = ap.fase || 'A';
        if (!fasesDisponibles.includes(f)) {
          f = fasesDisponibles[0] || 'A';
        }
        if (fasesVA[f] !== undefined) {
          fasesVA[f] += va;
        }
      }
    }
  });

  const desbalance = calcularDesbalanceUVIE(fasesVA.A, fasesVA.B, fasesVA.C, acometidaActiva.id);

  // Lista de aparatos sin ranura en el panel de este medidor
  const aparatosSinSlot = aparatosActivos.filter(ap => !ap.slot);
  const slotsPanel = Array.from({ length: 24 }, (_, i) => i + 1);

  const medidorActualObj = listaMedidores.find(m => m.id === selectedMedId) || listaMedidores[0];

  return (
    <div className="space-y-6">
      <style>{`
        .unifilar-node {
          transition: r 0.15s cubic-bezier(0.4, 0, 0.2, 1), fill 0.15s ease;
        }
        .unifilar-node:hover {
          r: 6.5px;
        }
      `}</style>

      {/* Pestañas de Selección de Medidor (cuando hay múltiples medidores) */}
      {listaMedidores.length > 1 && (
        <div className="glass-panel p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 bg-slate-900/40 no-print">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Tablero por Medidor:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedMedId('todos');
                if (onSelectMedidor) onSelectMedidor(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMedId === 'todos'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>Ver Todos ({aparatos.length} cargas)</span>
            </button>

            {listaMedidores.map(med => {
              const count = aparatos.filter(ap => (ap.medidorId || listaMedidores[0].id) === med.id).length;
              return (
                <button
                  key={med.id}
                  onClick={() => {
                    setSelectedMedId(med.id);
                    if (onSelectMedidor) onSelectMedidor(med.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedMedId === med.id
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{med.nombre || `Medidor ${med.numero}`}</span>
                  <span className="text-[10px] opacity-80 font-mono">({count})</span>
                </button>
              );
            })}

            {onBalancearMedidor && selectedMedId !== 'todos' && (
              <button
                onClick={() => onBalancearMedidor(selectedMedId)}
                className="ml-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                title={`Balancear matemáticamente las cargas de ${medidorActualObj.nombre}`}
              >
                <RefreshCw size={12} />
                <span>⚡ Balancear {medidorActualObj.nombre}</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Barra de Controles superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30 p-4 border border-slate-850 rounded-2xl no-print">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-teal-400" size={20} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-display">Maquetador de Control de Distribución</h3>
                {selectedMedId !== 'todos' && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/30">
                    {medidorActualObj.nombre}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                {aparatosActivos.length} cargas registradas · Desbalance: {desbalance.toFixed(2)}% {desbalance <= 5 ? '✅ (NOM ≤ 5%)' : '⚠️ (> 5%)'}
              </p>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('gabinete')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'gabinete'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gabinete Físico
            </button>
            <button
              onClick={() => setViewMode('unifilar')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'unifilar'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Diagrama Unifilar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBalancearMedidor && selectedMedId !== 'todos' && (
            <button
              onClick={() => onBalancearMedidor(selectedMedId)}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <RefreshCw size={12} />
              Balancear Matemático
            </button>
          )}

          <button
            onClick={handleAutoDistribuir}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Auto-acomodar todos los aparatos en slots secuenciales"
          >
            <RefreshCw size={12} className="text-teal-400" />
            Auto-Acomodar
          </button>
          
          <button
            onClick={handleLimpiarTablero}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Liberar todos los slots del tablero"
          >
            <Trash2 size={12} className="text-rose-400" />
            Limpiar Tablero
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Ajustes Generales (Unifilar) o Equipos por Asignar (Gabinete) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          
          {viewMode === 'unifilar' && (
            /* Ajustes del Alimentador Principal */
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sliders size={16} className="text-teal-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">
                    Alimentador Principal
                  </h4>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans mb-5">
                  Modifica los parámetros generales de la entrada eléctrica CFE. El diagrama unifilar calculará y actualizará el plano CAD en tiempo real.
                </p>

                <div className="space-y-4 font-sans text-xs">
                  {/* Interruptor Principal */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wide">
                      Interruptor General (ITM)
                    </label>
                    <select
                      value={projectSettings.overrideMainBreaker}
                      onChange={(e) => updateProjectSettings({ overrideMainBreaker: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                    >
                      <option value="Auto">Auto-Calcular ({autoMainBreaker}A)</option>
                      <option value="15">15 A</option>
                      <option value="20">20 A</option>
                      <option value="30">30 A</option>
                      <option value="40">40 A</option>
                      <option value="50">50 A</option>
                      <option value="60">60 A</option>
                      <option value="70">70 A</option>
                      <option value="80">80 A</option>
                      <option value="100">100 A</option>
                      <option value="125">125 A</option>
                      <option value="150">150 A</option>
                      <option value="200">200 A</option>
                    </select>
                  </div>

                  {/* Aislamiento y Temperatura */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wide">
                      Aislamiento del Conductor
                    </label>
                    <select
                      value={projectSettings.cableInsulation}
                      onChange={(e) => updateProjectSettings({ cableInsulation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="THW-2-LS">THW-2-LS (75°C/90°C Antiflama)</option>
                      <option value="THHN-THWN-2">THHN-THWN-2 (Nylon Resistente)</option>
                      <option value="XHHW-2">XHHW-2 (XLPE Reticulado)</option>
                    </select>
                  </div>

                  {/* Canalización/Tubo */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wide">
                      Material de Canalización
                    </label>
                    <select
                      value={projectSettings.conduitMaterial}
                      onChange={(e) => updateProjectSettings({ conduitMaterial: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="EMT (Metal)">EMT (Tubo Metálico)</option>
                      <option value="PVC Pesado">PVC Conduit Pesado</option>
                      <option value="IMC (Semipesado)">IMC Tubo Rígido</option>
                      <option value="FMC Flexible">Flexible Metálico (Ducto)</option>
                    </select>
                  </div>

                  {/* Conductor Principal Calibre */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wide">
                      Calibre General del Conductor
                    </label>
                    <select
                      value={projectSettings.mainConductorOverride}
                      onChange={(e) => updateProjectSettings({ mainConductorOverride: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                    >
                      <option value="Auto">Auto-Calcular ({autoMainConductor})</option>
                      <option value="14 AWG">14 AWG</option>
                      <option value="12 AWG">12 AWG</option>
                      <option value="10 AWG">10 AWG</option>
                      <option value="8 AWG">8 AWG</option>
                      <option value="6 AWG">6 AWG</option>
                      <option value="4 AWG">4 AWG</option>
                      <option value="2 AWG">2 AWG</option>
                      <option value="1/0 AWG">1/0 AWG</option>
                      <option value="2/0 AWG">2/0 AWG</option>
                      <option value="3/0 AWG">3/0 AWG</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botón de Ayuda Normativa */}
              <div className="mt-6 pt-4 border-t border-slate-850 flex items-center gap-2 text-[10px] text-slate-500 font-sans">
                <Info size={14} className="text-teal-400 flex-shrink-0" />
                <span>Las dimensiones del alimentador cumplen con el Art. 215 y la Tabla 310-15(b)(16) de la NOM-001-SEDE.</span>
              </div>
            </div>
          )}

          {/* Banco de Equipos por Asignar (Siempre visible en gabinete; visible en unifilar si hay equipos sin asignar) */}
          {(viewMode === 'gabinete' || (viewMode === 'unifilar' && aparatosSinSlot.length > 0)) && (
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={16} className="text-teal-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">
                    Equipos por Asignar ({aparatosSinSlot.length})
                  </h4>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans mb-4">
                  Haz clic en cualquiera de estos aparatos y luego presiona un slot o espacio libre **(DISPONIBLE)** para insertarlo físicamente.
                </p>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {aparatosSinSlot.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs font-medium font-sans">
                      ¡Todos los aparatos están instalados en el tablero!
                    </div>
                  ) : (
                    aparatosSinSlot.map(ap => {
                      const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
                      const prot = seleccionarProteccion(calcularCorrienteCorregida(calcularCorrienteNominal(va, ap.tipoCarga)));
                      const isSelected = selectedAppId === ap.id;

                      return (
                        <div
                          key={ap.id}
                          onClick={() => setSelectedAppId(isSelected ? null : ap.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-teal-500/20 border-teal-400 text-white ring-2 ring-teal-500/30' 
                              : 'bg-slate-900/35 border-slate-850 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs font-sans line-clamp-1">{ap.tipo}</span>
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                              {ap.tipoCarga === 'monofasica' ? '1F-1N' : ap.tipoCarga === 'bifasica' ? '2F-0N' : '3F-0N'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                            <span>{ap.watts} Watts</span>
                            <span>{Math.round(va)} VA</span>
                            <span className="text-teal-400 font-bold">1x{prot}A</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedAppId && (
                <div className="mt-4 p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 animate-pulse text-[10px] text-teal-300 font-sans flex items-center gap-2">
                  <Zap size={14} />
                  <span>Haz clic en un espacio o slot disponible para colocar este aparato.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Visualización principal (Gabinete o Unifilar) */}
        <div className="lg:col-span-8">
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
            
            {/* Header del panel principal */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-mono">Maqueta Gráfica</span>
                <h3 className="text-base font-bold text-white font-display mt-0.5">
                  {viewMode === 'unifilar' ? 'Diagrama Unifilar Eléctrico de Obra' : 'Centro de Carga 120/240V CA (Gabinete)'}
                </h3>
              </div>
              <div className="text-right text-[10px] font-mono text-slate-400 space-y-0.5">
                <div className="uppercase">Acometida: <span className="font-bold text-teal-400">{acometida.tipo}</span></div>
                <div>Desbalanceo: <span className={`font-bold ${desbalance > 5.0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>{desbalance.toFixed(2)}%</span></div>
              </div>
            </div>

            {viewMode === 'unifilar' ? (
              /* RENDERIZADO DEL DIAGRAMA UNIFILAR INTERACTIVO EN SVG */
              <div className="w-full overflow-x-auto">
                <svg 
                  className="mx-auto min-w-[760px] text-slate-300 font-mono text-xs select-none"
                  width="100%" 
                  height={150 + slotsPanel.length * 60} 
                  viewBox={`0 0 780 ${150 + slotsPanel.length * 60}`}
                >
                  {/* 1. Suministro General CFE */}
                  <line x1="100" y1="10" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="2" />
                  <polygon points="96,15 100,5 104,15" fill="#f1f5f9" />
                  <text x="115" y="18" fill="#f8fafc" fontSize="9" fontWeight="bold">LÍNEA DE RED AÉREA CFE</text>

                  {/* 2. Medidor CFE */}
                  <circle cx="100" cy="45" r="14" fill="none" stroke="#2dd4bf" strokeWidth="2" />
                  <text x="100" y="49" fill="#2dd4bf" fontSize="9" fontWeight="bold" textAnchor="middle">Wh</text>
                  <text x="125" y="49" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Medidor (Medidor CFE)</text>

                  {/* Conector */}
                  <line x1="100" y1="59" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="2" />

                  {/* 3. Interruptor Principal ITM */}
                  <rect x="86" y="75" width="28" height="28" fill="none" stroke="#e2e8f0" strokeWidth="2" rx="4" />
                  {/* Símbolo CAD de Switch */}
                  <line x1="90" y1="95" x2="100" y2="95" stroke="#f8fafc" strokeWidth="1.5" />
                  <line x1="100" y1="95" x2="110" y2="82" stroke="#f8fafc" strokeWidth="1.5" />
                  <line x1="100" y1="88" x2="104" y2="92" stroke="#f8fafc" strokeWidth="1.5" />
                  {acometida.id !== 'monofasico' && (
                    <>
                      {/* Segunda pole del interruptor principal si es bifásico/trifásico */}
                      <line x1="96" y1="95" x2="96" y2="95" stroke="#94a3b8" strokeDasharray="1,1" />
                    </>
                  )}

                  {/* Texto Informativo del Interruptor General */}
                  <text x="125" y="83" fill="#f1f5f9" fontSize="9" fontWeight="bold">
                    ITM Principal: {acometida.id === 'trifasico' ? '3' : acometida.id === 'bifasico' ? '2' : '1'}x{activeMainBreaker}A
                  </text>
                  <text x="125" y="94" fill="#38bdf8" fontSize="8" fontFamily="monospace">
                    Alimentador: {cablesCount}x{activeMainConductor} + 1x{activeMainConductor} (N) + 1x{activeMainConductor === '14 AWG' ? '14' : activeMainConductor === '12 AWG' ? '12' : '10'} AWG (T)
                  </text>
                  <text x="125" y="104" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
                    Ducto {activeMainConduit} {projectSettings.conduitMaterial} ({projectSettings.cableInsulation})
                  </text>

                  {/* Conector hacia Barras */}
                  <line x1="100" y1="103" x2="100" y2="125" stroke="#f1f5f9" strokeWidth="2" />

                  {/* 4. Barras Colectoras Paralelas */}
                  {/* Fase A */}
                  <line x1="60" y1="125" x2="60" y2={120 + slotsPanel.length * 60} stroke="#f87171" strokeWidth="1.5" />
                  <text x="60" y="122" fill="#f87171" fontSize="7" fontWeight="bold" textAnchor="middle">L1</text>

                  {/* Fase B */}
                  {fasesDisponibles.includes('B') && (
                    <>
                      <line x1="75" y1="125" x2="75" y2={120 + slotsPanel.length * 60} stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="75" y="122" fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">L2</text>
                    </>
                  )}

                  {/* Fase C */}
                  {fasesDisponibles.includes('C') && (
                    <>
                      <line x1="90" y1="125" x2="90" y2={120 + slotsPanel.length * 60} stroke="#3b82f6" strokeWidth="1.5" />
                      <text x="90" y="122" fill="#3b82f6" fontSize="7" fontWeight="bold" textAnchor="middle">L3</text>
                    </>
                  )}

                  {/* Neutro */}
                  <line x1="105" y1="125" x2="105" y2={120 + slotsPanel.length * 60} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4,2" />
                  <text x="105" y="122" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">N</text>

                  {/* Tierra */}
                  <line x1="120" y1="125" x2="120" y2={120 + slotsPanel.length * 60} stroke="#10b981" strokeWidth="1.2" />
                  <text x="120" y="122" fill="#10b981" fontSize="7" fontWeight="bold" textAnchor="middle">T</text>

                  {/* 5. Renderizado de Circuitos Derivados (slots 1 a 16) */}
                  {slotsPanel.map((slotNum, idx) => {
                    const y = 145 + idx * 60;
                    const ap = getAparatoEnSlot(slotNum);
                    
                    if (ap) {
                      const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
                      const iNom = calcularCorrienteNominal(va, ap.tipoCarga);
                      const iCorr = calcularCorrienteCorregida(iNom);
                      
                      const autoBreaker = seleccionarProteccion(iCorr);
                      const activeBreaker = ap.overrideBreaker && ap.overrideBreaker !== 'Auto'
                        ? parseInt(ap.overrideBreaker)
                        : autoBreaker;
                      
                      const autoConductor = seleccionarConductor(activeBreaker);
                      const activeConductor = ap.overrideCable && ap.overrideCable !== 'Auto'
                        ? ap.overrideCable
                        : autoConductor;

                      const cCount = ap.tipoCarga === 'monofasica' ? 3 : ap.tipoCarga === 'bifasica' ? 3 : 4;
                      const autoConduit = seleccionarTubo(activeConductor, cCount);
                      const activeConduit = ap.overrideTubo && ap.overrideTubo !== 'Auto'
                        ? ap.overrideTubo
                        : autoConduit;

                      const faseActual = ap.fase || 'A';
                      const poles = ap.tipoCarga === 'monofasica' ? 1 : ap.tipoCarga === 'bifasica' ? 2 : 3;

                      // Posición X del nodo de fase en las barras
                      let xNode = 60;
                      if (faseActual === 'B') xNode = 75;
                      if (faseActual === 'C') xNode = 90;

                      return (
                        <g key={slotNum} className="group/circ">
                          {/* Cable de fase que sale del busbar */}
                          <line x1={xNode} y1={y} x2="160" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          
                          {/* Nodo circular de conexión en cobre */}
                          <circle 
                            cx={xNode} 
                            cy={y} 
                            r="3" 
                            fill={faseActual === 'A' ? '#ef4444' : faseActual === 'B' ? '#f59e0b' : '#3b82f6'} 
                            className="cursor-pointer unifilar-node"
                            onClick={() => handleCycleFase(ap.id, faseActual)}
                          />

                          {/* Líneas adicionales para neutral y tierra que entran al ducto */}
                          <line x1="105" y1={y} x2="160" y2={y} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.3" />
                          <line x1="120" y1={y} x2="160" y2={y} stroke="#10b981" strokeWidth="0.8" opacity="0.3" />

                          {/* Símbolo CAD de ITM (Disyuntor) */}
                          <line x1="160" y1={y} x2="175" y2={y} stroke="#f1f5f9" strokeWidth="1.2" />
                          <line x1="175" y1={y} x2="190" y2={y - 6} stroke="#f1f5f9" strokeWidth="1.5" />
                          <line x1="175" y1={y - 4} x2="178" y2={y - 2} stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="190" y1={y} x2="210" y2={y} stroke="#f1f5f9" strokeWidth="1.2" />
                          
                          {/* Polos vinculados si es bipolar/tripolar */}
                          {poles > 1 && (
                            <line x1="182" y1={y - 8} x2="182" y2={y + 4} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1,1" />
                          )}

                          {/* Circuit Code */}
                          <text x="215" y={y + 4} fill="#2dd4bf" fontSize="9" fontWeight="bold">C-{slotNum}</text>

                          {/* Breaker rating (Clickable) */}
                          {editingBreakerId === ap.id ? (
                            <foreignObject x="255" y={y - 12} width="80" height="24">
                              <select
                                value={ap.overrideBreaker || 'Auto'}
                                onChange={(e) => {
                                  onUpdateAparato(ap.id, { overrideBreaker: e.target.value });
                                  setEditingBreakerId(null);
                                }}
                                onBlur={() => setEditingBreakerId(null)}
                                className="bg-slate-900 border border-slate-700 text-teal-400 text-[10px] rounded px-1 py-0.5 focus:ring-0 focus:outline-none w-full h-full font-sans cursor-pointer font-bold"
                                autoFocus
                              >
                                <option value="Auto">Auto ({autoBreaker}A)</option>
                                <option value="15">1x15 A</option>
                                <option value="20">1x20 A</option>
                                <option value="30">1x30 A</option>
                                <option value="40">1x40 A</option>
                                <option value="50">1x50 A</option>
                              </select>
                            </foreignObject>
                          ) : (
                            <text 
                              x="255" 
                              y={y + 4} 
                              fill="#f59e0b" 
                              fontSize="9" 
                              fontWeight="bold"
                              className="cursor-pointer hover:underline"
                              onClick={() => setEditingBreakerId(ap.id)}
                            >
                              ITM {poles}x{activeBreaker}A
                            </text>
                          )}

                          {/* Conductor & Conduit text (Clickable) */}
                          {editingWireId === ap.id ? (
                            <foreignObject x="345" y={y - 12} width="165" height="24">
                              <div className="flex items-center gap-1 w-full h-full">
                                <select
                                  value={ap.overrideCable || 'Auto'}
                                  onChange={(e) => onUpdateAparato(ap.id, { overrideCable: e.target.value })}
                                  className="bg-slate-900 border border-slate-700 text-slate-200 text-[9px] rounded px-0.5 py-0.5 focus:ring-0 focus:outline-none w-1/2 h-full font-mono cursor-pointer"
                                >
                                  <option value="Auto">Cable: Auto</option>
                                  <option value="14 AWG">14 AWG</option>
                                  <option value="12 AWG">12 AWG</option>
                                  <option value="10 AWG">10 AWG</option>
                                  <option value="8 AWG">8 AWG</option>
                                  <option value="6 AWG">6 AWG</option>
                                  <option value="4 AWG">4 AWG</option>
                                </select>
                                <select
                                  value={ap.overrideTubo || 'Auto'}
                                  onChange={(e) => onUpdateAparato(ap.id, { overrideTubo: e.target.value })}
                                  className="bg-slate-900 border border-slate-700 text-slate-200 text-[9px] rounded px-0.5 py-0.5 focus:ring-0 focus:outline-none w-1/2 h-full font-mono cursor-pointer"
                                >
                                  <option value="Auto">Tubo: Auto</option>
                                  <option value='16mm (1/2")'>16mm (1/2")</option>
                                  <option value='21mm (3/4")'>21mm (3/4")</option>
                                  <option value='27mm (1")'>27mm (1")</option>
                                  <option value='35mm (1 1/4")'>35mm (1 1/4")</option>
                                </select>
                                <button
                                  onClick={() => setEditingWireId(null)}
                                  className="px-1.5 py-0.5 rounded bg-teal-500 text-slate-950 font-black text-[9px] h-full flex items-center justify-center hover:bg-teal-400 active:scale-95 cursor-pointer"
                                >
                                  ✓
                                </button>
                              </div>
                            </foreignObject>
                          ) : (
                            <text 
                              x="345" 
                              y={y + 4} 
                              fill="#94a3b8" 
                              fontSize="8"
                              className="cursor-pointer hover:underline"
                              onClick={() => setEditingWireId(ap.id)}
                            >
                              2x{activeConductor} + 1x{activeConductor === '14 AWG' ? '14' : activeConductor === '12 AWG' ? '12' : '10'} AWG T ({activeConduit})
                            </text>
                          )}

                          {/* Appliance type & Load values */}
                          <text x="515" y={y - 1} fill="#ffffff" fontSize="9" fontWeight="bold">{ap.tipo}</text>
                          <text x="515" y={y + 9} fill="#64748b" fontSize="8">
                            {ap.watts}W / {Math.round(va)}VA / {iNom.toFixed(2)}A (Fase {faseActual})
                          </text>

                          {/* Botón de Liberación (Trash) */}
                          <g 
                            onClick={() => handleReleaseSlot(ap.id)}
                            className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                          >
                            <rect x="735" y={y - 10} width="16" height="16" fill="#ef4444" opacity="0.1" rx="3" />
                            <text x="743" y={y + 2} fill="#f87171" fontSize="9" textAnchor="middle" fontWeight="bold">×</text>
                          </g>
                        </g>
                      );
                    }

                    // Ranura vacía (Dotted line for spares)
                    return (
                      <g 
                        key={slotNum}
                        onClick={() => handleSlotClick(slotNum)}
                        className={`group/spare cursor-pointer ${selectedAppId ? 'opacity-80 hover:opacity-100' : 'opacity-35 hover:opacity-50'}`}
                      >
                        <line 
                          x1="130" 
                          y1={y} 
                          x2="500" 
                          y2={y} 
                          stroke="#475569" 
                          strokeWidth="0.8" 
                          strokeDasharray="2,2" 
                          className="group-hover/spare:stroke-teal-500"
                        />
                        <text 
                          x="145" 
                          y={y + 3} 
                          fill="#475569" 
                          fontSize="8" 
                          className="group-hover/spare:fill-teal-400"
                        >
                          C-{slotNum}: {selectedAppId ? '¡HACER CLIC AQUÍ PARA ASIGNAR!' : 'Espacio Disponible (Ducto de Reserva 16mm)'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              /* RENDERIZADO DEL GABINETE FÍSICO ACTUAL */
              <div className="grid grid-cols-12 gap-1 items-stretch relative z-10 font-mono text-xs select-none">
                
                {/* LADO IZQUIERDO: Breakers Impares */}
                <div className="col-span-5 space-y-2">
                  {[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].map(slotNum => {
                    const ap = getAparatoEnSlot(slotNum);
                    
                    if (ap) {
                      const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
                      const prot = seleccionarProteccion(calcularCorrienteCorregida(calcularCorrienteNominal(va, ap.tipoCarga)));
                      const activeBreaker = ap.overrideBreaker && ap.overrideBreaker !== 'Auto'
                        ? parseInt(ap.overrideBreaker)
                        : prot;

                      return (
                        <div 
                          key={slotNum} 
                          className="relative p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/80 transition-all flex flex-col justify-between h-[72px]"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[10px] font-black text-slate-500 font-mono">#{slotNum}</span>
                            <span className="text-[10px] font-bold text-slate-200 font-sans line-clamp-1 flex-1 text-left px-1">{ap.tipo}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleReleaseSlot(ap.id); }}
                              className="text-slate-600 hover:text-rose-400 text-[10px] font-black hover:scale-110 transition-all cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1 border-t border-slate-950/40 pt-1">
                            <span>{ap.watts} W (Fase {ap.fase})</span>
                            <span className="font-bold text-teal-400">{ap.tipoCarga === 'monofasica' ? '1x' : ap.tipoCarga === 'bifasica' ? '2x' : '3x'}{activeBreaker}A</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={slotNum} 
                        onClick={() => handleSlotClick(slotNum)}
                        className={`p-2 rounded-xl border border-dashed flex items-center justify-center h-[72px] transition-all text-center cursor-pointer ${
                          selectedAppId 
                            ? 'border-teal-500/50 bg-teal-500/5 hover:border-teal-400 hover:bg-teal-500/10' 
                            : 'border-slate-850 hover:border-slate-800 bg-slate-950/20 text-slate-600 hover:text-slate-500'
                        }`}
                      >
                        <div className="text-[9px] font-medium font-sans">
                          <span className="text-slate-700 block font-mono text-[8px] font-bold">SLOT #{slotNum}</span>
                          {selectedAppId ? 'COLOCAR AQUÍ' : 'DISPONIBLE'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* COLUMNA CENTRAL: BARRAS DE CONEXIONES Y LÍNEAS DE FASES */}
                <div className="col-span-2 relative flex justify-center py-2 min-h-[580px] bg-slate-950/30 border border-slate-900 rounded-xl overflow-hidden">
                  
                  {/* Barras de cobre */}
                  <div className="absolute inset-y-0 flex justify-center gap-2 pointer-events-none">
                    {fasesDisponibles.includes('A') && (
                      <div className="w-1.5 h-full bg-red-600/60 rounded relative">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-red-400">A</div>
                      </div>
                    )}
                    {fasesDisponibles.includes('B') && (
                      <div className="w-1.5 h-full bg-yellow-500/50 rounded relative">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-yellow-400">B</div>
                      </div>
                    )}
                    {fasesDisponibles.includes('C') && (
                      <div className="w-1.5 h-full bg-blue-600/60 rounded relative">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-blue-400">C</div>
                      </div>
                    )}
                  </div>

                  {/* Nodos de Conexión */}
                  <div className="w-full flex flex-col justify-between relative z-10 py-1.5">
                    {Array.from({ length: 12 }).map((_, rowIndex) => {
                      const slotLeft = rowIndex * 2 + 1;
                      const slotRight = rowIndex * 2 + 2;
                      
                      const apLeft = getAparatoEnSlot(slotLeft);
                      const apRight = getAparatoEnSlot(slotRight);

                      const faseLeft = apLeft ? (apLeft.fase || 'A') : getFasePredefinidaDeSlot(slotLeft);
                      const faseRight = apRight ? (apRight.fase || 'A') : getFasePredefinidaDeSlot(slotRight);

                      return (
                        <div key={rowIndex} className="flex justify-between items-center h-[72px] w-full px-1 relative">
                          {/* Conexión Izquierda */}
                          {apLeft ? (
                            <div 
                              onClick={() => handleCycleFase(apLeft.id, faseLeft)}
                              className="flex items-center group cursor-pointer"
                              title={`Fase actual: ${faseLeft}. Haz clic para rotar.`}
                            >
                              <div className="w-2.5 h-0.5 bg-slate-700 group-hover:bg-teal-400" />
                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 font-mono shadow transition-all active:scale-90 ${
                                faseLeft === 'A' ? 'bg-red-500 text-white' : faseLeft === 'B' ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
                              }`}>
                                {faseLeft}
                              </div>
                            </div>
                          ) : (
                            <div className="w-6 h-1" />
                          )}

                          {/* Conexión Derecha */}
                          {apRight ? (
                            <div 
                              onClick={() => handleCycleFase(apRight.id, faseRight)}
                              className="flex items-center group cursor-pointer"
                              title={`Fase actual: ${faseRight}. Haz clic para rotar.`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 font-mono shadow transition-all active:scale-90 ${
                                faseRight === 'A' ? 'bg-red-500 text-white' : faseRight === 'B' ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
                              }`}>
                                {faseRight}
                              </div>
                              <div className="w-2.5 h-0.5 bg-slate-700 group-hover:bg-teal-400" />
                            </div>
                          ) : (
                            <div className="w-6 h-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* LADO DERECHO: Breakers Pares */}
                <div className="col-span-5 space-y-2">
                  {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map(slotNum => {
                    const ap = getAparatoEnSlot(slotNum);
                    
                    if (ap) {
                      const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
                      const prot = seleccionarProteccion(calcularCorrienteCorregida(calcularCorrienteNominal(va, ap.tipoCarga)));
                      const activeBreaker = ap.overrideBreaker && ap.overrideBreaker !== 'Auto'
                        ? parseInt(ap.overrideBreaker)
                        : prot;

                      return (
                        <div 
                          key={slotNum} 
                          className="relative p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/80 transition-all flex flex-col justify-between h-[72px]"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[10px] font-black text-slate-500 font-mono">#{slotNum}</span>
                            <span className="text-[10px] font-bold text-slate-200 font-sans line-clamp-1 flex-1 text-left px-1">{ap.tipo}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleReleaseSlot(ap.id); }}
                              className="text-slate-600 hover:text-rose-400 text-[10px] font-black hover:scale-110 transition-all cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1 border-t border-slate-950/40 pt-1">
                            <span>{ap.watts} W (Fase {ap.fase})</span>
                            <span className="font-bold text-teal-400">{ap.tipoCarga === 'monofasica' ? '1x' : ap.tipoCarga === 'bifasica' ? '2x' : '3x'}{activeBreaker}A</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={slotNum} 
                        onClick={() => handleSlotClick(slotNum)}
                        className={`p-2 rounded-xl border border-dashed flex items-center justify-center h-[72px] transition-all text-center cursor-pointer ${
                          selectedAppId 
                            ? 'border-teal-500/50 bg-teal-500/5 hover:border-teal-400 hover:bg-teal-500/10' 
                            : 'border-slate-850 hover:border-slate-800 bg-slate-950/20 text-slate-600 hover:text-slate-500'
                        }`}
                      >
                        <div className="text-[9px] font-medium font-sans">
                          <span className="text-slate-700 block font-mono text-[8px] font-bold">SLOT #{slotNum}</span>
                          {selectedAppId ? 'COLOCAR AQUÍ' : 'DISPONIBLE'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Banner inferior de advertencia sobre desbalanceo */}
            {desbalance > 5.0 && acometida.id !== 'monofasico' && (
              <div className="mt-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-[10px] font-sans flex items-start gap-2.5 no-print animate-pulse-subtle">
                <Zap className="flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Centro de Carga Desbalanceado ({desbalance.toFixed(2)}%)</span>
                  <span>El desbalanceo de corriente entre fases supera el 5.0% límite normativo de la NOM-001-SEDE. Utiliza el botón de **"Auto-Acomodar"** o haz clic en los círculos de fase en el diagrama/tablero para balancear las cargas.</span>
                </div>
              </div>
            )}

            {/* Tarjeta de Manual de Operación y Guía de Verificación */}
            <div className="mt-6 p-5 rounded-xl border border-slate-800 bg-slate-900/25 space-y-4 text-xs font-sans text-slate-300">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <HelpCircle size={16} className="text-teal-400" />
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
                  Manual de Operación y Guía de Verificación UVIE
                </h4>
              </div>

              {viewMode === 'unifilar' ? (
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-teal-400 block mb-0.5">¿En qué consiste el Diagrama Unifilar?</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Es la representación gráfica lineal simplificada de toda la instalación eléctrica comercial bajo la norma <strong>NOM-001-SEDE-2012</strong>. Este diagrama describe de manera jerárquica las acometidas de energía, los equipos de medición de la CFE, las protecciones termo-magnéticas principales y el desglose de los circuitos derivados que alimentan al local. Es un documento obligatorio para la obtención del dictamen aprobatorio de una UVIE (Unidad de Verificación de Instalaciones Eléctricas).
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-teal-400 block mb-0.5">Lineamientos de Verificación Normativa:</span>
                    <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                      <li><strong>Capacidad del Interruptor (ITM):</strong> Las protecciones termo-magnéticas de los circuitos derivados deben dimensionarse como mínimo al 125% de la corriente nominal para cargas continuas (Art. 210-20), garantizando que operen de forma segura sin disparos térmicos.</li>
                      <li><strong>Calibre del Conductor (AWG):</strong> El calibre del conductor de cobre debe soportar la corriente nominal ajustada y ser compatible con la temperatura de terminales a 75°C de acuerdo a la Tabla 310-15(b)(16). Calibres insuficientes provocan caídas de tensión y riesgos de sobrecalentamiento.</li>
                      <li><strong>Dimensionamiento de Tubería:</strong> Para evitar el desgaste del aislamiento y facilitar el jalado, la ocupación de conductores no debe exceder el 40% del área transversal interna del tubo (Capítulo 9, Tabla 4).</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-teal-400 block mb-0.5">Guía de Uso del Editor Unifilar:</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      • <strong>Modificar Fase:</strong> Haz clic directamente sobre los círculos de conexión de cobre (L1/L2/L3) para rotar la fase y balancear el sistema.<br />
                      • <strong>Sobrescribir ITM:</strong> Haz clic sobre la etiqueta de protección del interruptor (ej. <code>ITM 1x15A</code>) para forzar un amperaje comercial o restaurarlo a automático.<br />
                      • <strong>Sobrescribir Cables / Ductos:</strong> Haz clic en el texto del cableado para abrir selectores rápidos de calibre AWG y diámetro de tubería en milímetros. Presiona el botón verde de guardar (<code>✓</code>) para conservar la configuración en la base de datos de tu proyecto.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-teal-400 block mb-0.5">¿En qué consiste la Representación del Gabinete Físico?</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Simula la distribución física real en el interior de un centro de carga o tablero de distribución estándar (ej. tableros Square D tipo QO/NQ). Muestra la colocación física de los interruptores termo-magnéticos tipo "enchufables" organizados en dos columnas: las ranuras impares en la columna izquierda y las ranuras pares en la derecha. Esto representa el acomodo que el electricista implementará físicamente en la obra.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-teal-400 block mb-0.5">Lineamientos de Verificación Normativa:</span>
                    <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                      <li><strong>Distribución Alternada del Busbar:</strong> Los peines o barras metálicas centrales alternan su fase verticalmente cada dos ranuras (slots 1-2 conectados a la barra L1/Fase A, slots 3-4 a L2/Fase B, slots 5-6 a L3/Fase C, slots 7-8 a L1/Fase A, etc.). Cuando cambias la fase de un aparato, este saltará automáticamente a la ranura física que corresponda a esa fase.</li>
                      <li><strong>Límite de Desbalanceo del Sistema:</strong> La corriente del local debe distribuirse equitativamente entre las fases activas. El desbalanceo entre fases no debe superar el 5.0% para evitar el calentamiento excesivo del conductor neutro de la acometida, daños en transformadores y cobros por penalización en la facturación comercial de CFE.</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-teal-400 block mb-0.5">Guía de Uso del Editor de Gabinete Físico:</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      • <strong>Asignar Equipos a Ranuras:</strong> Si hay aparatos sin ranura, aparecerán en la columna izquierda "Equipos por Asignar". Haz clic en la tarjeta del aparato (se iluminará en verde) y luego haz clic en cualquier slot vacío que diga <code>DISPONIBLE</code> en el tablero.<br />
                      • <strong>Liberar Ranura:</strong> Presiona el botón rojo <code>×</code> del interruptor para retirar el aparato del tablero y regresarlo a la lista de espera.<br />
                      • <strong>Cambiar Fase en el Gabinete:</strong> Haz clic en el indicador central con la letra de fase (A, B, C) de cualquier slot ocupado para rotarlo entre las fases del servicio.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
