import React from 'react';

/**
 * Hook para manejar anchos de columna redimensionables por tabla con persistencia en localStorage.
 * @param {string} storageKey Clave única en localStorage para esta tabla (ej. 'sge_col_widths_uvie_med_1')
 * @param {number[]} defaultWidths Arreglo con el ancho inicial en px de cada columna
 */
export function useResizableColumns(storageKey, defaultWidths) {
  const [widths, setWidths] = React.useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === defaultWidths.length) {
          return parsed.map((w, i) => {
            const num = Number(w);
            return Number.isFinite(num) && num >= 32 ? num : defaultWidths[i];
          });
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    return [...defaultWidths];
  });

  // Actualizar si cambia storageKey (por ejemplo al cambiar filtro de medidor)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === defaultWidths.length) {
          setWidths(parsed.map((w, i) => {
            const num = Number(w);
            return Number.isFinite(num) && num >= 32 ? num : defaultWidths[i];
          }));
          return;
        }
      }
    } catch {
      // ignore
    }
    setWidths([...defaultWidths]);
  }, [storageKey]);

  const saveWidths = React.useCallback((nextWidths) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextWidths));
    } catch {
      // ignore localStorage write errors
    }
  }, [storageKey]);

  const startResize = React.useCallback((colIndex, e) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const initialWidth = widths[colIndex] || defaultWidths[colIndex] || 80;

    const handleMove = (moveEvent) => {
      const currentX = moveEvent.type === 'touchmove'
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;
      const deltaX = currentX - startX;
      const newWidth = Math.max(36, Math.round(initialWidth + deltaX));

      setWidths(prev => {
        const updated = [...prev];
        updated[colIndex] = newWidth;
        saveWidths(updated);
        return updated;
      });
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [widths, defaultWidths, saveWidths]);

  const resetColumnWidth = React.useCallback((colIndex) => {
    setWidths(prev => {
      const updated = [...prev];
      updated[colIndex] = defaultWidths[colIndex];
      saveWidths(updated);
      return updated;
    });
  }, [defaultWidths, saveWidths]);

  const resetAllWidths = React.useCallback(() => {
    const fresh = [...defaultWidths];
    setWidths(fresh);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [defaultWidths, storageKey]);

  const isCustomized = React.useMemo(() => {
    return widths.some((w, idx) => Math.abs(w - defaultWidths[idx]) > 1);
  }, [widths, defaultWidths]);

  const totalTableWidth = React.useMemo(() => {
    return widths.reduce((sum, w) => sum + (w || 80), 0);
  }, [widths]);

  return {
    widths,
    totalTableWidth,
    isCustomized,
    startResize,
    resetColumnWidth,
    resetAllWidths
  };
}

/**
 * Tirador interactivo para colocar en el borde derecho de cada <th>.
 */
export function ColumnResizerHandle({ onMouseDown, onDoubleClick }) {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick();
      }}
      onClick={(e) => e.stopPropagation()}
      title="Arrastra para ajustar el ancho de columna (doble clic para restaurar)"
      className="no-print absolute top-0 right-0 bottom-0 w-2 cursor-col-resize select-none group/resizer z-20 flex items-center justify-end"
    >
      <div className="h-3/5 w-[2px] rounded-full bg-slate-700/60 group-hover/resizer:bg-teal-400 group-hover/resizer:h-full group-hover/resizer:w-[3px] transition-all" />
    </div>
  );
}
