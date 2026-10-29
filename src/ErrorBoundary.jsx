import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    if (confirm("¿Desea restablecer los datos locales guardados para reparar el sistema? Se restablecerán los datos iniciales predeterminados.")) {
      try {
        localStorage.clear();
      } catch (e) {
        console.error("Error clearing localStorage", e);
      }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Error de Renderizado en la Aplicación</h2>
                <p className="text-xs text-rose-300">Se ha producido una excepción al cargar los módulos eléctricos.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-rose-200 overflow-x-auto max-h-60">
              <p className="font-bold text-rose-400 mb-2">Mensaje: {this.state.error?.message || String(this.state.error)}</p>
              {this.state.error?.stack && (
                <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <RefreshCw size={14} />
                Recargar Página
              </button>

              <button
                onClick={this.handleResetStorage}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                title="Borrar datos corruptos en el navegador y restaurar valores iniciales"
              >
                <Trash2 size={14} />
                Restablecer Memoria Local
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
