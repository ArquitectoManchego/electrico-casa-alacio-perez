import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { ARQUITECTURAS_SOLARES } from '../../data/cotizacionesSolares';

export default function ModalNuevaCotizacionSolar({ abierto, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    proveedor: '',
    vendedor: '',
    arquitectura: 'on_grid',
    tipoInversor: 'Inversor Híbrido / Central',
    modeloPanel: 'Panel 645W Tier 1',
    modeloInversor: '',
    cantidadPaneles: 8,
    wattsPorPanel: 645,
    bateriaKwh: 0,
    precioContadoMxn: 75000,
    condicionesPago: 'Contado / IVA incluido',
    incluyeTramiteCFE: true,
    nota: ''
  });

  if (!abierto) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.proveedor.trim()) return;
    const paneles = Math.max(0, Number(form.cantidadPaneles) || 0);
    const watts = Math.max(100, Number(form.wattsPorPanel) || 645);
    const precio = Math.max(1000, Number(form.precioContadoMxn) || 0);
    const bat = Math.max(0, Number(form.bateriaKwh) || 0);

    onGuardar({
      id: `custom_${Date.now()}`,
      proveedor: form.proveedor.trim(),
      vendedor: form.vendedor.trim() || 'Cotización agregada manualmente',
      folio: 'CUSTOM',
      arquitectura: form.arquitectura,
      tipoInversor: form.tipoInversor.trim() || 'Estándar',
      modeloPanel: form.modeloPanel.trim() || `Panel ${watts}W`,
      modeloInversor: form.modeloInversor.trim() || form.tipoInversor,
      estructura: 'Aluminio anodizado',
      cantidadPaneles: paneles,
      wattsPorPanel: watts,
      potenciaKwp: Number(((paneles * watts) / 1000).toFixed(2)),
      precioListaMxn: precio,
      precioContadoMxn: precio,
      descuentoContadoPct: 0,
      condicionesPago: form.condicionesPago.trim() || 'Contado',
      incluyeTramiteCFE: !!form.incluyeTramiteCFE,
      incluyeMonitoreo: true,
      incluyeBaterias: bat > 0,
      bateriaKwh: bat,
      destacadoBadge: 'Cotización Propia',
      badgeColor: 'teal',
      notasAuditoria: form.nota.trim() ? [form.nota.trim()] : ['Cotización personalizada agregada por el usuario.'],
      esOficialWhatsApp: false
    });
    onCerrar();
  };

  return (
    <div
      data-testid="solar-modal-nueva-cotizacion"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-teal-400" />
            Agregar Nueva Cotización de Proveedor
          </h4>
          <button
            type="button"
            data-testid="solar-modal-cerrar-btn"
            aria-label="Cerrar modal"
            onClick={onCerrar}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre del Proveedor *</label>
              <input
                type="text"
                required
                placeholder="Ej. Solar Veracruz Pro"
                data-testid="solar-modal-proveedor-input"
                value={form.proveedor}
                onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Arquitectura</label>
              <select
                data-testid="solar-modal-arquitectura-select"
                value={form.arquitectura}
                onChange={(e) => setForm({ ...form, arquitectura: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              >
                {ARQUITECTURAS_SOLARES.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Paneles</label>
              <input
                type="number"
                min={0}
                max={80}
                data-testid="solar-modal-paneles-input"
                value={form.cantidadPaneles}
                onChange={(e) => setForm({ ...form, cantidadPaneles: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Watts / Panel</label>
              <input
                type="number"
                min={100}
                max={1000}
                data-testid="solar-modal-watts-input"
                value={form.wattsPorPanel}
                onChange={(e) => setForm({ ...form, wattsPorPanel: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Batería (kWh)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                data-testid="solar-modal-bateria-input"
                value={form.bateriaKwh}
                onChange={(e) => setForm({ ...form, bateriaKwh: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Precio Final MXN *</label>
              <input
                type="number"
                required
                min={5000}
                data-testid="solar-modal-precio-input"
                value={form.precioContadoMxn}
                onChange={(e) => setForm({ ...form, precioContadoMxn: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Marca / Modelo Inversor</label>
              <input
                type="text"
                placeholder="Ej. Deye Híbrido 8 kW"
                data-testid="solar-modal-inversor-input"
                value={form.modeloInversor}
                onChange={(e) => setForm({ ...form, modeloInversor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Condiciones de Pago</label>
              <input
                type="text"
                placeholder="Ej. 50% anticipo, 50% entrega"
                data-testid="solar-modal-pago-input"
                value={form.condicionesPago}
                onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notas u observaciones</label>
            <textarea
              rows={2}
              placeholder="Ej. Incluye trámite CFE, garantía 10 años inversor..."
              data-testid="solar-modal-nota-input"
              value={form.nota}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              data-testid="solar-modal-cancelar-btn"
              onClick={onCerrar}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="solar-modal-guardar-btn"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black cursor-pointer"
            >
              Guardar y Simular
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
