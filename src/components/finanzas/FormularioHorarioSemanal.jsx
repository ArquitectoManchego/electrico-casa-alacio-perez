import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  Info,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const DIAS_SEMANA = [
  { id: 'lunes', nombre: 'Lunes' },
  { id: 'martes', nombre: 'Martes' },
  { id: 'miercoles', nombre: 'Miércoles' },
  { id: 'jueves', nombre: 'Jueves' },
  { id: 'viernes', nombre: 'Viernes' },
  { id: 'sabado', nombre: 'Sábado' },
  { id: 'domingo', nombre: 'Domingo' }
];

const OPCIONES_HORARIOS_ADICIONALES = [
  'Acceso', 'Almuerzo', 'Brunch', 'Cena', 'Cocina', 
  'Desayuno', 'Entrega', 'Hora feliz', 'Horario de atención en línea', 
  'Para llevar', 'Pedidos desde el auto', 'Población en riesgo', 'Retiro'
];

/**
 * Convierte formato HH:MM (24h) a "h:mm a.m./p.m." para coincidir exactamente con el diseño
 */
export function formato12h(hora24) {
  if (!hora24) return '10:00 a.m.';
  const [hStr, mStr] = hora24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.padStart(2, '0') : '00';
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Convierte texto 12h ("10:00 a.m.", "2:00 p.m.") a HH:MM 24h
 */
export function formato24h(hora12) {
  if (!hora12) return '10:00';
  const clean = hora12.toLowerCase().trim();
  const esPm = clean.includes('p.m.') || clean.includes('pm');
  const esAm = clean.includes('a.m.') || clean.includes('am');
  const numeros = clean.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = numeros.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = mStr ? mStr.padStart(2, '0') : '00';
  if (esPm && h < 12) h += 12;
  if (esAm && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m}`;
}

/**
 * Genera el estado de horario inicial para un negocio
 */
export function getHorarioDefaultNegocio(negocioId = '') {
  const esOficina = negocioId.includes('oficina') || negocioId.includes('consorcio');
  const esCafeteria = negocioId.includes('hawaiian') || negocioId.includes('paradise');

  const dias = {};
  DIAS_SEMANA.forEach(d => {
    if (d.id === 'domingo') {
      dias[d.id] = { cerrada: true, intervalos: [{ abre: '10:00', cierra: '14:00' }] };
    } else if (d.id === 'sabado') {
      dias[d.id] = { 
        cerrada: esOficina, // Oficinas no abren sábado
        intervalos: esCafeteria 
          ? [{ abre: '10:00', cierra: '20:00' }] 
          : [{ abre: '10:00', cierra: '14:00' }] 
      };
    } else {
      // Lunes a Viernes
      if (esCafeteria) {
        dias[d.id] = {
          cerrada: false,
          intervalos: [{ abre: '10:00', cierra: '20:00' }]
        };
      } else if (esOficina) {
        dias[d.id] = {
          cerrada: false,
          intervalos: [
            { abre: '10:00', cierra: '14:00' },
            { abre: '16:00', cierra: '18:00' }
          ]
        };
      } else {
        // Comercial estándar partido (como la imagen)
        dias[d.id] = {
          cerrada: false,
          intervalos: [
            { abre: '10:00', cierra: '14:00' },
            { abre: '16:00', cierra: '18:00' }
          ]
        };
      }
    }
  });

  return {
    tipoAtencion: 'abierto_principal',
    dias,
    horariosEspeciales: [],
    etiquetasAdicionales: []
  };
}

export default function FormularioHorarioSemanal({
  negocioId = 'hawaiian_paradise',
  negocioNombre = 'Hawaiian Paradise',
  isOpen = false,
  onClose,
  onSave
}) {
  const storageKey = `sge_horario_semanal_v2_${negocioId}`;

  const [estadoHorario, setEstadoHorario] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getHorarioDefaultNegocio(negocioId);
  });

  // Recargar al cambiar negocioId
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sge_horario_semanal_v2_${negocioId}`);
      if (saved) {
        setEstadoHorario(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setEstadoHorario(getHorarioDefaultNegocio(negocioId));
  }, [negocioId]);

  if (!isOpen) return null;

  const handleTipoAtencionChange = (tipo) => {
    setEstadoHorario(prev => ({
      ...prev,
      tipoAtencion: tipo
    }));
  };

  const handleToggleCerrada = (diaId) => {
    setEstadoHorario(prev => {
      const diaActual = prev.dias[diaId] || { cerrada: false, intervalos: [{ abre: '10:00', cierra: '14:00' }] };
      return {
        ...prev,
        dias: {
          ...prev.dias,
          [diaId]: {
            ...diaActual,
            cerrada: !diaActual.cerrada
          }
        }
      };
    });
  };

  const handleChangeIntervalo = (diaId, index, campo, valor) => {
    setEstadoHorario(prev => {
      const diaActual = prev.dias[diaId];
      const nuevosIntervalos = [...diaActual.intervalos];
      nuevosIntervalos[index] = {
        ...nuevosIntervalos[index],
        [campo]: valor
      };
      return {
        ...prev,
        dias: {
          ...prev.dias,
          [diaId]: {
            ...diaActual,
            intervalos: nuevosIntervalos
          }
        }
      };
    });
  };

  const handleAddIntervalo = (diaId) => {
    setEstadoHorario(prev => {
      const diaActual = prev.dias[diaId];
      const nuevosIntervalos = [
        ...diaActual.intervalos,
        { abre: '16:00', cierra: '18:00' }
      ];
      return {
        ...prev,
        dias: {
          ...prev.dias,
          [diaId]: {
            ...diaActual,
            intervalos: nuevosIntervalos
          }
        }
      };
    });
  };

  const handleRemoveIntervalo = (diaId, index) => {
    setEstadoHorario(prev => {
      const diaActual = prev.dias[diaId];
      const nuevosIntervalos = diaActual.intervalos.filter((_, idx) => idx !== index);
      return {
        ...prev,
        dias: {
          ...prev.dias,
          [diaId]: {
            ...diaActual,
            intervalos: nuevosIntervalos.length > 0 ? nuevosIntervalos : [{ abre: '10:00', cierra: '14:00' }]
          }
        }
      };
    });
  };

  const handleToggleEtiqueta = (tag) => {
    setEstadoHorario(prev => {
      const actuales = prev.etiquetasAdicionales || [];
      const existe = actuales.includes(tag);
      return {
        ...prev,
        etiquetasAdicionales: existe ? actuales.filter(t => t !== tag) : [...actuales, tag]
      };
    });
  };

  // Calcular métricas del horario de la empresa
  let diasAbiertosSemana = 0;
  let totalMinutosSemana = 0;
  let minHoraApertura = '23:59';
  let maxHoraCierre = '00:00';

  if (estadoHorario.tipoAtencion === 'abierto_principal') {
    Object.keys(estadoHorario.dias).forEach(diaId => {
      const dia = estadoHorario.dias[diaId];
      if (!dia.cerrada && dia.intervalos && dia.intervalos.length > 0) {
        diasAbiertosSemana++;
        dia.intervalos.forEach(inter => {
          if (inter.abre < minHoraApertura) minHoraApertura = inter.abre;
          if (inter.cierra > maxHoraCierre) maxHoraCierre = inter.cierra;

          const [hA, mA] = (inter.abre || '10:00').split(':').map(Number);
          const [hC, mC] = (inter.cierra || '14:00').split(':').map(Number);
          let diff = (hC * 60 + mC) - (hA * 60 + mA);
          if (diff <= 0) diff += 24 * 60;
          totalMinutosSemana += Math.max(0, diff);
        });
      }
    });
  }

  const horasPromedioDia = diasAbiertosSemana > 0 ? Math.round((totalMinutosSemana / diasAbiertosSemana / 60) * 10) / 10 : 0;
  const diasLaboralesMes = Math.round(diasAbiertosSemana * 4.33);

  const handleGuardar = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(estadoHorario));
    } catch (e) {}

    if (onSave) {
      onSave({
        horarioCompleto: estadoHorario,
        diasAbiertosSemana,
        diasLaboralesMes,
        horasPromedioDia,
        horarioApertura: minHoraApertura !== '23:59' ? minHoraApertura : '10:00',
        horarioCierre: maxHoraCierre !== '00:00' ? maxHoraCierre : '20:00'
      });
    }

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Tarjeta estilo Google Business Profile / Odoo */}
      <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 font-sans my-auto">
        
        {/* Encabezado del Formulario */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Horario de Atención Comercial
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Configuración individual para: <strong className="text-blue-600">{negocioNombre}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* 1. OPCIONES DE ATENCIÓN (RADIO BUTTONS DE LA IMAGEN) */}
          <div className="space-y-3">
            {[
              {
                id: 'abierto_principal',
                titulo: 'Abierto, con horario de atención principal',
                desc: 'Mostrar cuándo tu negocio está abierto'
              },
              {
                id: 'abierto_sin_horario',
                titulo: 'Abierto, sin horario de atención principal',
                desc: 'No mostrar ningún horario de atención'
              },
              {
                id: 'cerrado_temporal',
                titulo: 'Cerrado temporalmente',
                desc: 'Indicar si tu empresa o negocio abrirán de nuevo en el futuro'
              },
              {
                id: 'cerrado_permanente',
                titulo: 'Cerrado permanentemente',
                desc: 'Mostrar que tu empresa o negocio ya no existen'
              }
            ].map(opt => {
              const isChecked = estadoHorario.tipoAtencion === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => handleTipoAtencionChange(opt.id)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="tipoAtencion"
                      checked={isChecked}
                      onChange={() => handleTipoAtencionChange(opt.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-xs">
                    <div className={`font-semibold ${isChecked ? 'text-blue-700' : 'text-slate-800'}`}>
                      {opt.titulo}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {opt.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* 2. DÍAS DE LA SEMANA E INTERVALOS (IDÉNTICO A LA IMAGEN) */}
          {estadoHorario.tipoAtencion === 'abierto_principal' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {DIAS_SEMANA.map((dia) => {
                const diaData = estadoHorario.dias[dia.id] || { cerrada: false, intervalos: [{ abre: '10:00', cierra: '14:00' }] };
                const estaCerrada = diaData.cerrada;

                return (
                  <div key={dia.id} className="space-y-2 pb-3 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">
                        {dia.nombre}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={estaCerrada}
                          onChange={() => handleToggleCerrada(dia.id)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Cerrada</span>
                      </label>
                    </div>

                    {/* Si está abierto, mostrar los intervalos */}
                    {!estaCerrada && (
                      <div className="space-y-2 pl-2">
                        {diaData.intervalos.map((intervalo, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {/* Input: Abre a la(s) */}
                            <div className="relative flex-1">
                              <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-slate-500 font-sans select-none">
                                Abre a la(s)
                              </label>
                              <input
                                type="time"
                                value={intervalo.abre}
                                onChange={(e) => handleChangeIntervalo(dia.id, idx, 'abre', e.target.value)}
                                className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                              />
                            </div>

                            {/* Input: Cierra a la(s) */}
                            <div className="relative flex-1">
                              <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-slate-500 font-sans select-none">
                                Cierra a la(s)
                              </label>
                              <input
                                type="time"
                                value={intervalo.cierra}
                                onChange={(e) => handleChangeIntervalo(dia.id, idx, 'cierra', e.target.value)}
                                className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                              />
                            </div>

                            {/* Botón Agregar (+) en primer intervalo o Eliminar (Trash) en subsecuentes */}
                            {idx === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleAddIntervalo(dia.id)}
                                title="Agregar otro horario para este día"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Plus size={18} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveIntervalo(dia.id, idx)}
                                title="Eliminar este horario"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. RESUMEN DE CÁLCULO OPERATIVO PARA EL NEGOCIO */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-950 font-sans">
            <div>
              <span className="font-bold block">Resumen Laboral Sincronizado</span>
              <span className="text-[11px] text-blue-700 font-mono">
                {diasAbiertosSemana} días/sem &middot; {diasLaboralesMes} días/mes &middot; {horasPromedioDia} hrs promedio/día
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-blue-600 block">Jornada Legal</span>
              <span className={`font-bold font-mono ${horasPromedioDia > 8 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {horasPromedioDia <= 8 ? 'Jornada Ordinaria' : '> 8h (Horas Extras)'}
              </span>
            </div>
          </div>

          {/* 4. BOTONES GUARDAR Y CANCELAR (TAL CUAL EN LA IMAGEN) */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGuardar}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 border border-slate-300 hover:bg-slate-50 text-blue-600 text-xs font-semibold rounded-full transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {/* 5. SECCIÓN INFERIOR: HORARIO ESPECIAL Y AGREGAR OTRO HORARIO */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Horario especial
              </span>
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer mt-0.5"
                onClick={() => alert('Función de festivos y vacaciones agregada a la agenda de ' + negocioNombre)}
              >
                Agregar
              </button>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Agregar otro horario
              </span>
              <div className="flex flex-wrap gap-1.5">
                {OPCIONES_HORARIOS_ADICIONALES.map((tag) => {
                  const isSelected = (estadoHorario.etiquetasAdicionales || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleEtiqueta(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? <Check size={12} className="text-blue-600" /> : <Plus size={12} className="text-slate-400" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
