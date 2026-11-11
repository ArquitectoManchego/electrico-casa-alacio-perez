import React from 'react';
import { Layers, Plus, Copy, Trash2, FolderEdit } from 'lucide-react';

export default function ProyectosSelector({ 
  proyectos, 
  currentProyectoId, 
  onSelectProyecto, 
  onCreateProyecto, 
  onClonarProyecto, 
  onDeleteProyecto 
}) {

  const handleCreate = () => {
    const nombre = prompt('Ingrese el nombre del nuevo Proyecto / Zona Residencial:');
    if (nombre && nombre.trim()) {
      onCreateProyecto(nombre.trim());
    }
  };

  const handleClone = () => {
    const actual = proyectos.find(p => p.id === currentProyectoId);
    const sugerido = actual ? `${actual.nombre} - Copia` : 'Nueva Zona Copia';
    const nombre = prompt('Ingrese el nombre para la zona/proyecto clonado:', sugerido);
    if (nombre && nombre.trim()) {
      onClonarProyecto(nombre.trim());
    }
  };

  const handleDelete = () => {
    if (proyectos.length <= 1) {
      alert('Debe mantener al menos un proyecto o zona residencial registrada en el sistema.');
      return;
    }
    const actual = proyectos.find(p => p.id === currentProyectoId);
    const confirmar = confirm(`¿Está seguro de eliminar por completo el proyecto "${actual?.nombre}"? Se perderán todas sus cargas registradas.`);
    if (confirmar) {
      onDeleteProyecto(currentProyectoId);
    }
  };

  const maestroProjs = proyectos.filter(p => p.id === 'consorcio_general');
  const otrosProjs = proyectos.filter(p => p.id !== 'consorcio_general');

  return (
    <div className="flex items-center flex-wrap gap-2.5 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80">
      
      {/* Icono de Carpeta */}
      <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400">
        <Layers size={16} className="text-teal-400" />
        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Proyecto / Zona:</span>
      </div>

      {/* Select Selector */}
      <select
        value={currentProyectoId}
        onChange={(e) => onSelectProyecto(e.target.value)}
        className="px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-teal-300 min-w-[220px] border-slate-700 bg-slate-900 shadow-inner focus:outline-none focus:border-teal-400"
      >
        {maestroProjs.length > 0 && (
          <optgroup label="⭐ PROYECTO MAESTRO (TODO EL INMUEBLE)">
            {maestroProjs.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-emerald-300 font-bold">
                👑 {p.nombre} (Todos los Negocios)
              </option>
            ))}
          </optgroup>
        )}
        {otrosProjs.length > 0 && (
          <optgroup label="🏢 VISTAS INDIVIDUALES (UN SOLO NEGOCIO)">
            {otrosProjs.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200 font-medium">
                {p.nombre}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {/* Acciones */}
      <div className="flex items-center gap-1.5 border-l border-slate-800/60 pl-2">
        {/* Crear */}
        <button
          onClick={handleCreate}
          className="p-1.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
          title="Registrar Nuevo Proyecto Residencial"
        >
          <Plus size={14} />
        </button>

        {/* Clonar */}
        <button
          onClick={handleClone}
          className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
          title="Clonar Proyecto Actual"
        >
          <Copy size={14} />
        </button>

        {/* Eliminar */}
        <button
          onClick={handleDelete}
          className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          title="Eliminar Proyecto"
        >
          <Trash2 size={14} />
        </button>
      </div>

    </div>
  );
}
