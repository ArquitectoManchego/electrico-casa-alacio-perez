import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Zap,
  Lock,
  Layers,
  Info,
  CheckCircle2,
  DollarSign,
  Undo2
} from 'lucide-react';

function FilaProductoEditable({
  producto,
  overrideItem = null,
  onUpdateProducto,
  onResetProductoUnitario
}) {
  const [precioVenta, setPrecioVenta] = useState(producto.precioVenta);
  const [costoMateriales, setCostoMateriales] = useState(producto.costoMateriales);
  const [costoManoObra, setCostoManoObra] = useState(producto.costoManoObra);

  // Mantener sincronizado si cambian los valores externamente (e.g. al restaurar sugeridos)
  useEffect(() => {
    setPrecioVenta(producto.precioVenta);
    setCostoMateriales(producto.costoMateriales);
    setCostoManoObra(producto.costoManoObra);
  }, [producto.precioVenta, producto.costoMateriales, producto.costoManoObra]);

  const handleFieldChange = (campo, rawValue, setter) => {
    setter(rawValue);
    const num = parseFloat(rawValue);
    if (!isNaN(num) && num >= 0) {
      onUpdateProducto(producto.id, { [campo]: num });
    }
  };

  const handleFieldBlur = (campo, rawValue, setter) => {
    const num = Math.max(0, parseFloat(rawValue) || 0);
    setter(num);
    onUpdateProducto(producto.id, { [campo]: num });
  };

  const hasOverride = !!overrideItem && (
    overrideItem.precioVenta !== undefined ||
    overrideItem.costoMateriales !== undefined ||
    overrideItem.costoManoObra !== undefined
  );

  const esMargenNegativo = producto.margenBruto < 0;

  return (
    <tr className={`transition-colors ${hasOverride ? 'bg-teal-950/20 hover:bg-teal-950/30' : 'hover:bg-slate-800/30'}`}>
      {/* 1. Identificación del Producto / Servicio */}
      <td className="py-3 px-3 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-xs">{producto.nombre}</span>
          {hasOverride ? (
            <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[9px] font-mono">
              Modificado
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-mono">
              Sugerido
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
          <span className="text-slate-300">{producto.categoria}</span>
          <span>&middot;</span>
          <span>Unidad: {producto.unidad}</span>
        </div>
      </td>

      {/* 2. PRECIO DE VENTA (P) - EDITABLE */}
      <td className="py-3 px-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-teal-400 font-mono text-xs font-bold">$</span>
          <input
            type="number"
            step="0.5"
            min="0"
            value={precioVenta}
            onChange={(e) => handleFieldChange('precioVenta', e.target.value, setPrecioVenta)}
            onBlur={(e) => handleFieldBlur('precioVenta', e.target.value, setPrecioVenta)}
            className="w-20 px-2 py-1 rounded bg-slate-950 border border-teal-500/60 hover:border-teal-400 focus:border-teal-300 focus:ring-1 focus:ring-teal-400 text-teal-300 text-xs font-bold font-mono text-right focus:outline-none transition"
            title="Ingresa el precio de venta al público"
          />
        </div>
      </td>

      {/* 3. MATERIAS PRIMAS (Mat) - EDITABLE */}
      <td className="py-3 px-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-rose-400 font-mono text-xs">$</span>
          <input
            type="number"
            step="0.5"
            min="0"
            value={costoMateriales}
            onChange={(e) => handleFieldChange('costoMateriales', e.target.value, setCostoMateriales)}
            onBlur={(e) => handleFieldBlur('costoMateriales', e.target.value, setCostoMateriales)}
            className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 hover:border-rose-400/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-rose-300 text-xs font-mono text-right focus:outline-none transition"
            title="Costo de insumos y materiales directos por unidad"
          />
        </div>
        {producto.detalleMateriales && (
          <div className="text-[9px] text-slate-500 font-sans truncate max-w-[130px] ml-auto mt-0.5" title={producto.detalleMateriales}>
            {producto.detalleMateriales}
          </div>
        )}
      </td>

      {/* 4. MANO DE OBRA (MO) - EDITABLE */}
      <td className="py-3 px-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-amber-400 font-mono text-xs">$</span>
          <input
            type="number"
            step="0.5"
            min="0"
            value={costoManoObra}
            onChange={(e) => handleFieldChange('costoManoObra', e.target.value, setCostoManoObra)}
            onBlur={(e) => handleFieldBlur('costoManoObra', e.target.value, setCostoManoObra)}
            className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 hover:border-amber-400/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-amber-300 text-xs font-mono text-right focus:outline-none transition"
            title="Costo de mano de obra directa por unidad"
          />
        </div>
        {producto.detalleManoObra && (
          <div className="text-[9px] text-slate-500 font-sans truncate max-w-[130px] ml-auto mt-0.5" title={producto.detalleManoObra}>
            {producto.detalleManoObra}
          </div>
        )}
      </td>

      {/* 5. LUZ PROCESO - AUTOMÁTICO (SOLO LECTURA) */}
      <td className="py-3 px-3 text-right font-mono">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
          <Zap size={10} className="text-cyan-400" />
          ${producto.costoLuzUnitario.toFixed(2)}
        </div>
        <div className="text-[9px] text-cyan-500/70 font-mono flex items-center justify-end gap-0.5 mt-0.5">
          <Lock size={8} />
          <span>Calculado auto</span>
        </div>
      </td>

      {/* 6. COSTO VARIABLE TOTAL - AUTOMÁTICO (SOLO LECTURA) */}
      <td className="py-3 px-3 text-right font-mono">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs font-semibold">
          ${producto.costoVariableTotal.toFixed(2)}
        </div>
        <div className="text-[9px] text-slate-400 font-mono flex items-center justify-end gap-0.5 mt-0.5">
          <Lock size={8} />
          <span>Mat + MO + Luz</span>
        </div>
      </td>

      {/* 7. MARGEN BRUTO UNITARIO (MC) Y % - AUTOMÁTICO (SOLO LECTURA) */}
      <td className="py-3 px-3 text-right font-mono">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-xs ${
          esMargenNegativo
            ? 'bg-rose-950/60 border border-rose-500 text-rose-300'
            : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
        }`}>
          ${producto.margenBruto.toFixed(2)}
        </div>
        <div className={`text-[10px] font-mono font-bold mt-0.5 ${
          esMargenNegativo ? 'text-rose-400' : 'text-emerald-400'
        }`}>
          ({producto.margenPct.toFixed(1)}%)
        </div>
      </td>

      {/* 8. ACCIONES / RESTABLECER PRODUCTO INDIVIDUAL */}
      <td className="py-3 px-3 text-center">
        {hasOverride ? (
          <button
            onClick={() => onResetProductoUnitario && onResetProductoUnitario(producto.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition cursor-pointer"
            title="Restablecer este producto a sus valores sugeridos originales"
          >
            <Undo2 size={13} />
          </button>
        ) : (
          <span className="text-slate-600 text-xs" title="Valores estándar">
            &mdash;
          </span>
        )}
      </td>
    </tr>
  );
}

export default function TablaCostosYPrecios({
  productos = [],
  negocioNombre = '',
  onUpdateProducto,
  onResetProductos,
  onResetProductoUnitario,
  overridesActivos = {}
}) {
  const numModificados = Object.keys(overridesActivos).length;

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
            {numModificados > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                {numModificados} personalizado(s)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-4xl">
            Modifica directamente los campos de <strong className="text-teal-300">Precio de Venta (P)</strong>, <strong className="text-rose-300">Materias Primas (Mat)</strong> y <strong className="text-amber-300">Mano de Obra (MO)</strong>. Los campos de <strong className="text-cyan-300">Luz de Proceso</strong>, <strong className="text-white">Costo Variable Total</strong> y <strong className="text-emerald-300">Margen Bruto (MC)</strong> se calculan de manera automática y protegen la integridad de las fórmulas financieras.
          </p>
        </div>

        {/* Botón de Restaurar Todos los Precios Sugeridos */}
        <button
          onClick={onResetProductos}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer shrink-0"
          title="Restablecer todos los precios y costos originales de fábrica para este negocio"
        >
          <RotateCcw size={12} />
          Restaurar Precios Sugeridos
        </button>
      </div>

      {/* Tabla Desglosada con Edición Directa */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
              <th className="py-2.5 px-3">Producto / Servicio</th>
              <th className="py-2.5 px-3 text-right text-teal-300">
                <span className="flex items-center justify-end gap-1">
                  <DollarSign size={11} />
                  Precio Venta (P)
                </span>
                <span className="text-[9px] text-slate-400 lowercase font-normal">(editable)</span>
              </th>
              <th className="py-2.5 px-3 text-right text-rose-300">
                <span>Materias Primas (Mat)</span>
                <span className="text-[9px] text-slate-400 lowercase font-normal block">(editable)</span>
              </th>
              <th className="py-2.5 px-3 text-right text-amber-300">
                <span>Mano de Obra (MO)</span>
                <span className="text-[9px] text-slate-400 lowercase font-normal block">(editable)</span>
              </th>
              <th className="py-2.5 px-3 text-right text-cyan-300">
                <span className="flex items-center justify-end gap-1">
                  <Lock size={10} />
                  Luz Proceso
                </span>
                <span className="text-[9px] text-cyan-500/70 lowercase font-normal block">(auto receta)</span>
              </th>
              <th className="py-2.5 px-3 text-right text-slate-200">
                <span className="flex items-center justify-end gap-1">
                  <Lock size={10} />
                  Costo Var. Total
                </span>
                <span className="text-[9px] text-slate-400 lowercase font-normal block">(auto suma)</span>
              </th>
              <th className="py-2.5 px-3 text-right text-emerald-300 font-bold">
                <span className="flex items-center justify-end gap-1">
                  <Lock size={10} />
                  Margen Bruto (MC)
                </span>
                <span className="text-[9px] text-emerald-400/80 lowercase font-normal block">(auto margen)</span>
              </th>
              <th className="py-2.5 px-3 text-center">Reset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {productos.map(p => (
              <FilaProductoEditable
                key={p.id}
                producto={p}
                overrideItem={overridesActivos[p.id]}
                onUpdateProducto={onUpdateProducto}
                onResetProductoUnitario={onResetProductoUnitario}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Nota Explicativa */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300 font-sans">
        <Sparkles size={16} className="text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Cálculo en Tiempo Real: </strong>
          Cualquier modificación en los precios de venta o costos unitarios se guarda automáticamente y actualiza de inmediato el Margen de Contribución ponderado (MC pond), el Punto de Equilibrio mensual y el volumen necesario para alcanzar los <strong className="text-teal-300 font-mono">$20,000 MXN libres</strong> en el simulador y estado de resultados.
        </div>
      </div>
    </div>
  );
}
