import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Megaphone, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Heart, 
  Gift, 
  Smile, 
  GraduationCap, 
  Flame, 
  Zap, 
  Ghost, 
  Tags, 
  Award,
  ChevronRight,
  Sliders,
  DollarSign,
  Sun,
  Umbrella,
  Volume2
} from 'lucide-react';

import { 
  MESES_INFO, 
  CATALOGO_EVENTOS_MEXICO, 
  PERFILES_ESTACIONALES_NEGOCIOS,
  obtenerCampanasParaLanzarEnMes, 
  obtenerEventosCelebradosEnMes, 
  calcularMultiplicadorEstacional 
} from '../../utils/motorTemporadasYEventos';

const ICON_MAP = {
  Trophy,
  Heart,
  Sparkles,
  Smile,
  HeartHandshake: Heart,
  Award,
  GraduationCap,
  Flame,
  Zap,
  Ghost,
  Tags,
  Gift
};

export default function PanelEstacionalidadYPublicidad({
  negocioId = 'imperia_uniformes',
  mesSeleccionado = 8, // Por defecto Agosto (Pico Escolar de Imperia)
  onSelectMes,
  esQuincena = false,
  onToggleQuincena,
  publicidadContraciclica = true,
  onTogglePublicidadContraciclica,
  eventosActivos = [],
  onToggleEvento,
  onAplicarEscenarioSugerido
}) {
  const [tabEventos, setTabEventos] = useState('lanzamiento_mes'); // 'lanzamiento_mes' | 'celebrados_mes' | 'todos'

  const perfil = PERFILES_ESTACIONALES_NEGOCIOS[negocioId] || PERFILES_ESTACIONALES_NEGOCIOS.imperia_uniformes;
  const mesActualInfo = MESES_INFO.find(m => m.id === mesSeleccionado) || MESES_INFO[7];

  // Cálculo del multiplicador estacional con los parámetros actuales
  const metricasAjuste = useMemo(() => {
    return calcularMultiplicadorEstacional({
      negocioId,
      mes: mesSeleccionado,
      esQuincena,
      publicidadContraciclica,
      eventosActivos
    });
  }, [negocioId, mesSeleccionado, esQuincena, publicidadContraciclica, eventosActivos]);

  // Campañas que deben lanzarse en el mes actual (Lead Time 1 mes antes)
  const campanasLanzar = useMemo(() => {
    return obtenerCampanasParaLanzarEnMes(mesSeleccionado);
  }, [mesSeleccionado]);

  // Eventos celebrados en el mes actual
  const eventosCelebrados = useMemo(() => {
    return obtenerEventosCelebradosEnMes(mesSeleccionado);
  }, [mesSeleccionado]);

  // Lista de eventos a mostrar según el tab
  const eventosFiltrados = useMemo(() => {
    if (tabEventos === 'lanzamiento_mes') return campanasLanzar;
    if (tabEventos === 'celebrados_mes') return eventosCelebrados;
    return CATALOGO_EVENTOS_MEXICO;
  }, [tabEventos, campanasLanzar, eventosCelebrados]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 space-y-6">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="text-teal-400" size={20} />
            <h3 className="text-base font-bold text-white font-display">
              Temporadas, Efecto Quincenal y Publicidad Anticipada (Lead Time 1 Mes)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              Zona Universitaria
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-3xl">
            Simula las variaciones de demanda de acuerdo al mes del año, las fechas de quincena y el calendario de efemérides en México.
            Lanza la publicidad de artículos promocionales (playeras, tazas, uniformes) con 30 días de anticipación.
          </p>
        </div>

        {/* Resumen del Multiplicador Estacional */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Demanda Estimada</span>
            <div className="text-xl font-black text-teal-400 font-mono">
              {metricasAjuste.factorTotal.toFixed(2)}x
            </div>
            <span className="text-[9px] font-sans text-slate-400">
              Escenario sugerido: <strong className="text-white uppercase">{metricasAjuste.escenarioEquivalente}</strong>
            </span>
          </div>
          {onAplicarEscenarioSugerido && (
            <button
              type="button"
              onClick={() => onAplicarEscenarioSugerido(metricasAjuste.escenarioEquivalente)}
              className="px-3 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md cursor-pointer whitespace-nowrap"
              title="Ajustar los niveles del simulador al escenario calculado por esta temporada"
            >
              Aplicar a Simulación CFE
            </button>
          )}
        </div>
      </div>

      {/* 1. Selector de Meses del Año (Enero a Diciembre) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300 flex items-center gap-1.5">
            <Calendar size={13} className="text-teal-400" />
            1. Seleccionar Mes del Año (Ciclo Anual):
          </span>
          <span className="text-[11px] text-slate-400">
            Mes seleccionado: <strong className="text-teal-400">{mesActualInfo.nombre}</strong> &middot; {perfil.curvaMeses[mesSeleccionado]?.etiqueta || ''}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {MESES_INFO.map(m => {
            const isSelected = mesSeleccionado === m.id;
            const configMes = perfil.curvaMeses[m.id] || { factorBase: 1.0, vacaciones: false };
            const esPicoEscolar = negocioId === 'imperia_uniformes' && m.id === 8;
            const esVacaciones = configMes.vacaciones;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMes(m.id)}
                className={`p-2 rounded-xl text-center transition-all flex flex-col items-center justify-between min-h-[64px] border cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-md ring-1 ring-teal-400'
                    : esPicoEscolar
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                      : esVacaciones
                        ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold font-mono uppercase">{m.abreviatura}</span>
                <span className={`text-[11px] font-mono font-black ${
                  configMes.factorBase >= 1.5 ? 'text-emerald-400' : configMes.factorBase < 0.85 ? 'text-rose-400' : 'text-slate-300'
                }`}>
                  {configMes.factorBase.toFixed(2)}x
                </span>
                <span className="text-[8px] font-sans truncate w-full text-center">
                  {esPicoEscolar ? '🎒 PICO' : esVacaciones ? '🏖️ Receso' : 'Normal'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Alerta de Zona Universitaria & Publicidad Contracíclica en Vacaciones */}
      {metricasAjuste.esVacaciones && (
        <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  Zona Universitaria en Receso Escolar ({mesActualInfo.nombre})
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono">
                  -35% Afluencia Estudiantil
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                Todos los locales de Casa Alacio Pérez se encuentran en zona universitaria. En vacaciones escolares, la afluencia de estudiantes baja drásticamente.
                Para evitar déficit o caída de ventas, se implementa una <strong>Campaña de Publicidad Contracíclica</strong> (Meta Ads, Google Maps y volanteo local) para captar clientes externos de la ciudad (médicos, clínicas privadas, empresas y familias).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTogglePublicidadContraciclica}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm ${
              publicidadContraciclica
                ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Megaphone size={14} />
            {publicidadContraciclica ? '✓ Publicidad Contracíclica ACTIVA' : 'Activar Publicidad Contracíclica'}
          </button>
        </div>
      )}

      {/* 3. Controles Rápidos: Efecto Quincenal y Estatus de Temporada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Tarjeta Efecto Quincenal */}
        <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
          esQuincena 
            ? 'bg-teal-500/10 border-teal-500/30 text-teal-200' 
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className={esQuincena ? 'text-teal-400' : 'text-slate-400'} />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                Efecto Quincena (Días 15 y 30 en México)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              Sube la liquidez y las ventas un +35% en mostrador debido al pago de nóminas en el país.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleQuincena}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
              esQuincena 
                ? 'bg-teal-500 text-slate-950' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {esQuincena ? 'QUINCENA: ON (+35%)' : 'REGULAR: OFF'}
          </button>
        </div>

        {/* Tarjeta Explicativa de la Regla de Anticipación */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center gap-3 text-xs text-indigo-200 font-sans">
          <Clock size={22} className="text-indigo-400 shrink-0" />
          <div>
            <strong className="text-white">Regla de Publicidad Anticipada (1 Mes Antes): </strong>
            La publicidad se lanza exactamente 30 días antes del evento. Esto permite cotizar, tomar tallas, hacer muestras y maquilar lotes de playeras, tazas y uniformes antes de la fecha pico.
          </div>
        </div>
      </div>

      {/* 4. Calendario de Eventos en México & Campañas de Artículos Promocionales */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        
        {/* Cabecera y Selector de Vista de Eventos */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Megaphone size={15} className="text-teal-400" />
              Campañas de Publicidad y Artículos Promocionales
            </h4>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Playeras, tazas sublimadas, termos láser, gorras y uniformes temáticos.
            </p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-sans">
            <button
              type="button"
              onClick={() => setTabEventos('lanzamiento_mes')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                tabEventos === 'lanzamiento_mes'
                  ? 'bg-teal-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lanzar este Mes ({campanasLanzar.length})
            </button>
            <button
              type="button"
              onClick={() => setTabEventos('celebrados_mes')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                tabEventos === 'celebrados_mes'
                  ? 'bg-teal-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Celebrados en {mesActualInfo.abreviatura} ({eventosCelebrados.length})
            </button>
            <button
              type="button"
              onClick={() => setTabEventos('todos')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                tabEventos === 'todos'
                  ? 'bg-teal-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ver los 13 Eventos
            </button>
          </div>
        </div>

        {/* Tarjetas de Eventos */}
        {eventosFiltrados.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
            No hay eventos asignados específicamente a este filtro. Cambia a la pestaña &ldquo;Ver los 13 Eventos&rdquo; para explorar el calendario completo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventosFiltrados.map(ev => {
              const IconComp = ICON_MAP[ev.icono] || Sparkles;
              const isActive = eventosActivos.includes(ev.id);
              const mesLanzamientoNombre = MESES_INFO.find(m => m.id === ev.mesLanzamientoPublicidad)?.nombre || '';
              const mesEventoNombre = MESES_INFO.find(m => m.id === ev.mesEvento)?.nombre || '';
              const esBeneficiado = ev.negociosBeneficiados.includes(negocioId);

              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isActive
                      ? 'bg-slate-900 border-teal-500/50 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    
                    {/* Header del Evento */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          <IconComp size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white font-sans leading-tight">
                            {ev.nombre}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Fecha: {ev.fechaTexto}
                          </span>
                        </div>
                      </div>

                      {esBeneficiado && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          Aplica a Tienda
                        </span>
                      )}
                    </div>

                    {/* Timeline de Anticipación de 1 Mes */}
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-indigo-300 font-bold">
                        <span>Lanzar Publicidad:</span>
                        <span>{mesLanzamientoNombre} (30d antes)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Pico del Evento:</span>
                        <span>{mesEventoNombre}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-400 pt-0.5 border-t border-slate-800">
                        <span>Aumento Demanda:</span>
                        <span>+{ev.aumentoDemandaBasePct}%</span>
                      </div>
                    </div>

                    {/* Productos Estrella */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                        Artículos Promocionales Estrella:
                      </span>
                      <ul className="text-[11px] text-slate-300 font-sans space-y-0.5 list-disc list-inside">
                        {ev.productosEstrella.slice(0, 3).map((prod, idx) => (
                          <li key={idx} className="truncate">{prod}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans italic line-clamp-2 leading-relaxed">
                      {ev.descripcionEstrategica}
                    </p>
                  </div>

                  {/* Botón de Activación de Campaña */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => onToggleEvento(ev.id)}
                      className={`w-full py-2 rounded-lg text-xs font-bold font-sans transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-teal-500 text-slate-950 font-black shadow'
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 size={14} />
                          Campaña Publicitaria ACTIVA
                        </>
                      ) : (
                        <>
                          <Megaphone size={14} />
                          Activar Campaña en Simulador
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
