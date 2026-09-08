import React from 'react';
import { Trash2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { calcularVA } from '../utils/electricalCalculations';

export default function AparatoList({ aparatos, systemFasesDisponibles, onUpdateFase, onDeleteAparato }) {
  
  if (aparatos.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center">
        <AlertCircle className="mx-auto text-slate-500 mb-3" size={40} />
        <h3 className="text-lg font-bold text-slate-300">Inventario Vacío</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Agrega aparatos eléctricos desde el formulario lateral para evaluar la carga de tu local y calcular el tipo de acometida CFE.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
      <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
          Aparatos Registrados ({aparatos.length})
        </h3>
        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
          <Info size={12} />
          Haz clic en la fase de un aparato para rebalancear manualmente.
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase bg-slate-950/20">
              <th className="p-4">Aparato / Modelo</th>
              <th className="p-4">Watts (P)</th>
              <th className="p-4">F.P.</th>
              <th className="p-4">Aparente (S)</th>
              <th className="p-4">Uso Diario</th>
              <th className="p-4 text-center">Fase Asignada</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm text-slate-200">
            {aparatos.map((ap) => {
              const va = calcularVA(ap.watts, ap.fp, ap.usarVaDirecto);
              const horasTotal = (ap.horasAlta || 0) + (ap.horasReposo || 0);

              return (
                <tr key={ap.id} className="hover:bg-slate-900/20 transition-all duration-150">
                  {/* Aparato Info */}
                  <td className="p-4">
                    <div className="font-semibold text-white">{ap.tipo}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ap.modelo || 'Genérico'}</div>
                    {ap.consumoVariable && (
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/10 uppercase">
                        Variable
                      </span>
                    )}
                  </td>

                  {/* Watts */}
                  <td className="p-4 font-mono font-semibold">
                    {ap.watts.toLocaleString('es-MX')} W
                  </td>

                  {/* Factor de Potencia */}
                  <td className="p-4 font-mono text-slate-300">
                    {ap.usarVaDirecto ? (
                      <span className="text-[11px] text-slate-500">N/A</span>
                    ) : (
                      ap.fp.toFixed(2)
                    )}
                  </td>

                  {/* VA */}
                  <td className="p-4 font-mono text-cyan-400">
                    {Math.round(va).toLocaleString('es-MX')} VA
                  </td>

                  {/* Horas de Uso */}
                  <td className="p-4">
                    <div className="text-xs">
                      <span className="text-emerald-400 font-semibold">{ap.horasAlta}h</span> alta /{' '}
                      <span className="text-slate-400 font-semibold">{ap.horasReposo}h</span> reposo
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Total: {horasTotal}h/día</div>
                  </td>

                  {/* Fase Selector */}
                  <td className="p-4 text-center">
                    <select
                      value={ap.fase}
                      onChange={(e) => onUpdateFase(ap.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-950/80 border text-center transition-all ${
                        ap.fase === 'A'
                          ? 'border-red-500/40 text-red-400 focus:border-red-500'
                          : ap.fase === 'B'
                            ? 'border-amber-500/40 text-amber-400 focus:border-amber-500'
                            : 'border-blue-500/40 text-blue-400 focus:border-blue-500'
                      }`}
                    >
                      {['A', 'B', 'C'].map((fase) => {
                        const isAvailable = systemFasesDisponibles.includes(fase);
                        return (
                          <option
                            key={fase}
                            value={fase}
                            disabled={!isAvailable}
                            className="bg-slate-900 text-white disabled:text-slate-600 font-bold"
                          >
                            Fase {fase} {!isAvailable ? '(Inactiva)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </td>

                  {/* Acciones */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onDeleteAparato(ap.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 transition-all duration-200 active:scale-[0.92]"
                      title="Eliminar Aparato"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
