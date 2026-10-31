import React from 'react';
import { 
  Building2, 
  Store, 
  Coffee, 
  Scissors, 
  Shirt, 
  FileText, 
  Briefcase, 
  Droplet, 
  Wind, 
  Receipt,
  Layers
} from 'lucide-react';
import { 
  TABLA_RENTAS_INMUEBLE, 
  TABLA_AGUA_INMUEBLE, 
  TABLA_HVAC_INMUEBLE 
} from '../../utils/costosFijosInmueble.js';

export const NEGOCIOS_METADATA = [
  { id: 'hawaiian_paradise', nombre: 'Hawaiian Paradise', icon: Coffee, medidor: 'Medidor 2', color: 'from-amber-500 to-orange-500', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'imperia_uniformes', nombre: 'Imperia Uniformes', icon: Store, medidor: 'Medidor 1', color: 'from-blue-500 to-cyan-500', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'taller_publi_imperia', nombre: 'Publi-Imperia (Impresos)', icon: FileText, medidor: 'Medidor 4', color: 'from-purple-500 to-pink-500', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'bordados_veracruz', nombre: 'Bordados Veracruz', icon: Shirt, medidor: 'Medidor 3', color: 'from-emerald-500 to-teal-500', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'taller_costura', nombre: 'Taller de Costura', icon: Scissors, medidor: 'Medidor 5', color: 'from-rose-500 to-red-500', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'papeleria_imperiarte', nombre: 'Papelería ImperiArte', icon: FileText, medidor: 'Medidor 6', color: 'from-indigo-500 to-violet-500', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'oficinas_consorcio', nombre: 'Oficinas Corporativo', icon: Briefcase, medidor: 'Medidor 1 (Compartido)', color: 'from-slate-500 to-zinc-400', badgeColor: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
  { id: 'consolidado', nombre: 'Consolidado Consorcio (7 Negocios)', icon: Layers, medidor: '6 Medidores CFE', color: 'from-teal-400 to-emerald-500', badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20' }
];

export default function SelectorNegocioFinanzas({
  negocioSeleccionado,
  onSelectNegocio,
  gastosFijosTotales,
  reciboLuzMonto,
  costoNominaTotal = 0,
  totalEmpleados = 0
}) {
  const meta = NEGOCIOS_METADATA.find(n => n.id === negocioSeleccionado) || NEGOCIOS_METADATA[0];
  const rentaInfo = TABLA_RENTAS_INMUEBLE[negocioSeleccionado];
  const aguaInfo = TABLA_AGUA_INMUEBLE[negocioSeleccionado];
  const hvacInfo = TABLA_HVAC_INMUEBLE[negocioSeleccionado];

  return (
    <div className="space-y-4">
      {/* Botones de Selección Rápida en Scroll Horizontal o Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {NEGOCIOS_METADATA.map((neg) => {
          const Icon = neg.icon;
          const isSelected = negocioSeleccionado === neg.id;
          return (
            <button
              key={neg.id}
              onClick={() => onSelectNegocio(neg.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-teal-400' : 'text-slate-400'} />
              <span>{neg.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* Ficha Resumen de Costos Fijos Inmobiliarios Prorrateados + Nómina */}
      {negocioSeleccionado !== 'consolidado' && rentaInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl">
          {/* Card 1: Renta Prorrateada */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
              <span className="flex items-center gap-1.5">
                <Building2 size={12} className="text-teal-400" />
                Renta Asignada
              </span>
              <span className="text-teal-400 font-bold">{rentaInfo.porcentajeInmueble.toFixed(1)}%</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              ${rentaInfo.rentaConIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 font-normal">con IVA</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Base: ${rentaInfo.rentaSinIva.toFixed(2)} + 16% IVA &middot; {rentaInfo.areaTotalImputadaM2} m²
              {rentaInfo.areaComunAbsorbidaM2 > 0 && ` [+${rentaInfo.areaComunAbsorbidaM2}m² comunes]`}
            </p>
          </div>

          {/* Card 2: Agua Potable Prorrateada */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
              <span className="flex items-center gap-1.5">
                <Droplet size={12} className="text-cyan-400" />
                Agua Mensual
              </span>
              <span className="text-cyan-400 font-bold">{aguaInfo?.porcentaje || 0}%</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              ${(aguaInfo?.montoMensual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 font-normal">/mes</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight line-clamp-2" title={aguaInfo?.justificacion}>
              {aguaInfo?.justificacion}
            </p>
          </div>

          {/* Card 3: Climatización / HVAC */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
              <span className="flex items-center gap-1.5">
                <Wind size={12} className="text-indigo-400" />
                Clima (H: 3.8m)
              </span>
              <span className="text-indigo-400 font-bold">{hvacInfo?.toneladasRefrigeracion || 1} TR</span>
            </div>
            <div className="text-xs font-bold text-white">
              {hvacInfo?.equipoRecomendado || 'Minisplit 1 TR'}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Área: {hvacInfo?.areaClimatizadaM2} m² &middot; Vol: {hvacInfo?.volumenM3} m³
            </p>
          </div>

          {/* Card 4: Nómina y Carga IMSS Patronal */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Receipt size={12} />
                Nómina e IMSS
              </span>
              <span className="text-cyan-400 font-bold">{totalEmpleados} emp.</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              ${Math.round(costoNominaTotal).toLocaleString('es-MX')} <span className="text-[10px] text-slate-400 font-normal">/mes</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Sueldos base + cuotas patronales Seguro Social (IMSS).
            </p>
          </div>

          {/* Card 5: Gasto Fijo Total Mensual */}
          <div className="p-3 bg-gradient-to-br from-slate-900/90 to-teal-950/40 border border-teal-500/30 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-teal-400 text-[10px] font-mono uppercase">
              <span className="flex items-center gap-1.5">
                <Receipt size={12} />
                Total Fijo Operativo
              </span>
              <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[9px] font-bold">{meta.medidor}</span>
            </div>
            <div className="text-base font-bold text-teal-300 font-mono">
              ${(gastosFijosTotales || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Renta con IVA + Agua + CFE + Nómina con IMSS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
