import React, { useState } from 'react';
import { 
  Coins, 
  RotateCcw, 
  HelpCircle, 
  Edit3, 
  Check, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { calcularMargenProducto } from '../../utils/preciosYCostosProductos.js';

export default function TablaCostosYPrecios({
  productos = [],
  negocioNombre = '',
  onUpdateProducto,
  onResetProductos
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleStartEdit = (p) => {
    setEditingId(p.id);
    setEditValues({
      precioVenta: p.precioVenta,
      costoMateriales: p.costoMateriales,
      costoManoObra: p.costoManoObra
    });
  };

  const handleSaveEdit = (pId) => {
    if (onUpdateProducto) {
      onUpdateProducto(pId, editValues);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="text-teal-400" size={20} />
            <h3 className="text-base font-bold text-white font-display">
              Catálogo de Precios, Costos de Producción y Márgenes de Contribución
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Desglose unitario de Precios de Venta, Insumos / Materias Primas, Mano de Obra y Consumo Eléctrico de Procesos para {negocioNombre}.
          </p>
        </div>

        {/* Botón de Restaurar Valores de Fábrica */}
        <button
          onClick={onResetProductos}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
          title="Restablecer precios y costos originales"
        >
          <RotateCcw size={12} />
          Restaurar Precios Sugeridos
        </button>
      </div>

      {/* Tabla Desglosada */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
              <th className="py-2.5 px-3">Producto / Servicio</th>
              <th className="py-2.5 px-3 text-right">Precio Venta (P)</th>
              <th className="py-2.5 px-3 text-right">Materias Primas (Mat)</th>
              <th className="py-2.5 px-3 text-right">Mano Obra (MO)</th>
              <th className="py-2.5 px-3 text-right">Luz Proceso</th>
              <th className="py-2.5 px-3 text-right">Costo Variable Total</th>
              <th className="py-2.5 px-3 text-right text-teal-300 font-bold">Margen Bruto (MC)</th>
              <th className="py-2.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {productos.map(p => {
              const isEditing = editingId === p.id;
              const mc = p.margenBruto;
              const margenPct = p.margenPct;

              return (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  {/* Nombre y categoría */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="text-white font-bold">{p.nombre}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-[9px]">
                        {p.categoria}
                      </span>
                      <span>Unidad: {p.unidad}</span>
                    </div>
                  </td>

                  {/* Precio de Venta */}
                  <td className="py-2.5 px-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.50"
                        value={editValues.precioVenta}
                        onChange={(e) => setEditValues({ ...editValues, precioVenta: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-1.5 py-0.5 rounded bg-slate-950 border border-teal-500 text-teal-300 text-xs font-bold font-mono text-right"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">${p.precioVenta.toFixed(2)}</span>
                    )}
                  </td>

                  {/* Costo Materiales */}
                  <td className="py-2.5 px-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.50"
                        value={editValues.costoMateriales}
                        onChange={(e) => setEditValues({ ...editValues, costoMateriales: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-1.5 py-0.5 rounded bg-slate-950 border border-teal-500 text-slate-200 text-xs font-mono text-right"
                      />
                    ) : (
                      <div>
                        <span className="text-rose-300 font-medium">${p.costoMateriales.toFixed(2)}</span>
                        {p.detalleMateriales && (
                          <div className="text-[9px] text-slate-500 font-sans truncate max-w-[130px]" title={p.detalleMateriales}>
                            {p.detalleMateriales}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Costo Mano de Obra */}
                  <td className="py-2.5 px-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.50"
                        value={editValues.costoManoObra}
                        onChange={(e) => setEditValues({ ...editValues, costoManoObra: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-1.5 py-0.5 rounded bg-slate-950 border border-teal-500 text-slate-200 text-xs font-mono text-right"
                      />
                    ) : (
                      <div>
                        <span className="text-amber-300 font-medium">${p.costoManoObra.toFixed(2)}</span>
                        {p.detalleManoObra && (
                          <div className="text-[9px] text-slate-500 font-sans truncate max-w-[120px]" title={p.detalleManoObra}>
                            {p.detalleManoObra}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Costo Luz de Procesos */}
                  <td className="py-2.5 px-3 text-right text-cyan-300">
                    ${p.costoLuzUnitario.toFixed(2)}
                  </td>

                  {/* Costo Variable Total */}
                  <td className="py-2.5 px-3 text-right text-slate-300 font-medium">
                    ${p.costoVariableTotal.toFixed(2)}
                  </td>

                  {/* Margen Bruto Unitario y Porcentaje */}
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span className="text-teal-300 text-xs">${mc.toFixed(2)}</span>
                    <div className="text-[10px] text-slate-400 font-normal">
                      ({margenPct.toFixed(1)}%)
                    </div>
                  </td>

                  {/* Botón Editar / Guardar */}
                  <td className="py-2.5 px-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSaveEdit(p.id)}
                          className="p-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 transition cursor-pointer"
                          title="Guardar cambios"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px] transition cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer inline-flex items-center gap-1 text-[11px]"
                        title="Modificar precio o costos"
                      >
                        <Edit3 size={12} />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center gap-2">
        <Sparkles size={14} className="text-teal-400" />
        <span>Puedes ajustar cualquier precio de venta o costo unitario dando click en <strong>Editar</strong>; los cálculos de punto de equilibrio y de la meta de $20,000 MXN se actualizarán automáticamente.</span>
      </div>
    </div>
  );
}
