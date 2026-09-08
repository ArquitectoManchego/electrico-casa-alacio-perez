import React, { useState } from 'react';
import { DollarSign, Settings2, BarChart2, Info, Printer, Download, Eye, HelpCircle } from 'lucide-react';
import { calcularCobroCFECompleto } from '../utils/simuladorCFE';

// Función para convertir números a palabras en español para CFE
function numeroALetras(num) {
  const rounded = Math.round(num);
  if (rounded === 0) return 'CERO PESOS M.N.';
  
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = {
    11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
    16: 'DIECISEIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE'
  };
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirGrupo(n) {
    let output = '';
    const c = Math.floor(n / 100);
    const d_u = n % 100;
    const d = Math.floor(d_u / 10);
    const u = d_u % 10;

    if (c > 0) {
      if (c === 1 && d_u === 0) {
        output += 'CIEN ';
      } else {
        output += centenas[c] + ' ';
      }
    }

    if (d_u > 0) {
      if (especiales[d_u]) {
        output += especiales[d_u] + ' ';
      } else {
        if (d > 0) {
          output += decenas[d];
          if (u > 0) output += ' Y ';
          else output += ' ';
        }
        if (u > 0) {
          output += unidades[u] + ' ';
        }
      }
    }
    return output;
  }

  let millares = Math.floor(rounded / 1000);
  let resto = rounded % 1000;
  let result = '';

  if (millares > 0) {
    if (millares === 1) {
      result += 'MIL ';
    } else {
      result += convertirGrupo(millares) + 'MIL ';
    }
  }

  if (resto > 0) {
    result += convertirGrupo(resto);
  }

  return (result.trim() + ' PESOS M.N.').toUpperCase();
}

export default function SimuladorFinanciero({ 
  kwhDiario, 
  tarifas, 
  costosMEM, 
  onTarifasChange, 
  onCostosMEMChange,
  diasPeriodo,
  onDiasPeriodoChange
}) {
  const [showConfig, setShowConfig] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('FAMILIA ALACIO PÉREZ');
  const [clienteDireccion, setClienteDireccion] = useState('RESIDENCIA CASA ALACIO PÉREZ');

  const kwhBimestral = kwhDiario * diasPeriodo;
  
  // Calcular cobro completo (Energía y MEM)
  const desglose = calcularCobroCFECompleto(kwhBimestral, tarifas, costosMEM);

  const handleTarifaChange = (tier, field, val) => {
    onTarifasChange(tier, field, parseFloat(val) || 0);
  };

  const handleMEMChange = (field, val) => {
    onCostosMEMChange(field, parseFloat(val) || 0);
  };

  // Calcular porcentajes de consumo por escalón para la aguja del gráfico
  const totalKwh = Math.max(0.1, kwhBimestral);
  const totalLimites = (tarifas.basico.limit + tarifas.intermedio1.limit + tarifas.intermedio2.limit); // 900 kWh
  
  // Calcular posición de la aguja (en porcentaje de 0 a 100 de la barra de nivel de consumo)
  // Límite superior de escala visual = 2000 kWh
  const pointerPct = Math.min(100, (totalKwh / 2000) * 100);

  return (
    <div className="space-y-6">
      
      {/* Botones de control y configurador CFE */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Settings2 size={14} className={showConfig ? 'text-teal-400 rotate-45' : 'text-slate-400'} />
            {showConfig ? 'Ocultar Parámetros de Tarifas' : 'Ajustar Tarifas y MEM CFE'}
          </button>

          <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-900">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase font-mono">Días del Periodo:</span>
            <button
              onClick={() => onDiasPeriodoChange(30)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                diasPeriodo === 30
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Mensual (30d)
            </button>
            <button
              onClick={() => onDiasPeriodoChange(60)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                diasPeriodo === 60
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Bimestral (60d)
            </button>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow shadow-teal-500/20"
        >
          <Printer size={14} />
          Imprimir Recibo CFE
        </button>
      </div>

      {/* CONFIGURACIÓN EXPANDIBLE DE TARIFAS Y COSTOS MEM */}
      {showConfig && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
          
          {/* Columna 1: Escalones Tarifas CFE */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 size={13} />
              Configuración de Escalones CFE (Tarifa 1C)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 bg-slate-900/40 border border-slate-800/80 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">1. Básico</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <input type="number" value={tarifas.basico.limit} onChange={(e) => handleTarifaChange('basico', 'limit', e.target.value)} className="glass-input p-1 text-center text-xs font-mono" title="Límite kWh" />
                  <input type="number" step="0.001" value={tarifas.basico.costo} onChange={(e) => handleTarifaChange('basico', 'costo', e.target.value)} className="glass-input p-1 text-center text-xs text-emerald-400 font-mono" title="Precio $/kWh" />
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/40 border border-slate-800/80 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">2. Intermedio 1</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <input type="number" value={tarifas.intermedio1.limit} onChange={(e) => handleTarifaChange('intermedio1', 'limit', e.target.value)} className="glass-input p-1 text-center text-xs font-mono" title="Límite kWh" />
                  <input type="number" step="0.001" value={tarifas.intermedio1.costo} onChange={(e) => handleTarifaChange('intermedio1', 'costo', e.target.value)} className="glass-input p-1 text-center text-xs text-emerald-400 font-mono" title="Precio $/kWh" />
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/40 border border-slate-800/80 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">3. Intermedio 2</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <input type="number" value={tarifas.intermedio2.limit} onChange={(e) => handleTarifaChange('intermedio2', 'limit', e.target.value)} className="glass-input p-1 text-center text-xs font-mono" title="Límite kWh" />
                  <input type="number" step="0.001" value={tarifas.intermedio2.costo} onChange={(e) => handleTarifaChange('intermedio2', 'costo', e.target.value)} className="glass-input p-1 text-center text-xs text-emerald-400 font-mono" title="Precio $/kWh" />
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/40 border border-slate-800/80 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">4. Excedente</span>
                <div className="grid grid-cols-1">
                  <input type="number" step="0.001" value={tarifas.excedente.costo} onChange={(e) => handleTarifaChange('excedente', 'costo', e.target.value)} className="glass-input p-1 text-center text-xs text-emerald-400 font-mono" title="Precio $/kWh" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-850 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-sans">Datos de Simulación del Cliente</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Nombre del Cliente" className="glass-input p-1 text-xs" />
                <input type="text" value={clienteDireccion} onChange={(e) => setClienteDireccion(e.target.value)} placeholder="Dirección" className="glass-input p-1 text-xs" />
              </div>
            </div>
          </div>

          {/* Columna 2: Tarifas Unitarias Mercado Mayorista */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={13} />
              Cargos Mercado Eléctrico Mayorista (MEM)
            </h4>
            
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex items-center justify-between p-1 bg-slate-900/30 rounded border border-slate-850">
                <span className="text-slate-400">Suministro ($):</span>
                <input type="number" step="0.01" value={costosMEM.suministro} onChange={(e) => handleMEMChange('suministro', e.target.value)} className="w-18 bg-transparent text-right text-white focus:ring-0 p-0 text-xs border-none" />
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-900/30 rounded border border-slate-850">
                <span className="text-slate-400">Distribución:</span>
                <input type="number" step="0.0001" value={costosMEM.distribucion} onChange={(e) => handleMEMChange('distribucion', e.target.value)} className="w-18 bg-transparent text-right text-white focus:ring-0 p-0 text-xs border-none" />
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-900/30 rounded border border-slate-850">
                <span className="text-slate-400">Transmisión:</span>
                <input type="number" step="0.0001" value={costosMEM.transmision} onChange={(e) => handleMEMChange('transmision', e.target.value)} className="w-18 bg-transparent text-right text-white focus:ring-0 p-0 text-xs border-none" />
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-900/30 rounded border border-slate-850">
                <span className="text-slate-400">CENACE:</span>
                <input type="number" step="0.0001" value={costosMEM.cenace} onChange={(e) => handleMEMChange('cenace', e.target.value)} className="w-18 bg-transparent text-right text-white focus:ring-0 p-0 text-xs border-none" />
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-900/30 rounded border border-slate-850">
                <span className="text-slate-400">Energía:</span>
                <input type="number" step="0.0001" value={costosMEM.energia} onChange={(e) => handleMEMChange('energia', e.target.value)} className="w-18 bg-transparent text-right text-white focus:ring-0 p-0 text-xs border-none" />
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-900/30 rounded border border-slate-850">
                <span className="text-slate-400">Capacidad:</span>
                <input type="number" step="0.0001" value={costosMEM.capacidad} onChange={(e) => handleMEMChange('capacidad', e.target.value)} className="w-18 bg-transparent text-right text-white focus:ring-0 p-0 text-xs border-none" />
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-900/30 rounded border border-slate-850">
                <span className="text-slate-400">SCnMEM:</span>
                <input type="number" step="0.0001" value={costosMEM.scnmem} onChange={(e) => handleMEMChange('scnmem', e.target.value)} className="w-18 bg-transparent text-right text-white focus:ring-0 p-0 text-xs border-none" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">
              * Nota: CFE calcula el cobro al usuario en base a las tarifas escalonadas. El desglose del Mercado Eléctrico Mayorista (MEM) es informativo y muestra el costo real de generación y entrega.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MOCK DEL RECIBO FISICO CFE DE ALTA RESOLUCIÓN */}
      {/* ============================================================= */}
      <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-slate-200 overflow-hidden font-sans relative">
        
        {/* Sello de Marca de Agua de CFE */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] pointer-events-none select-none">
          <span className="text-[180px] font-black tracking-tighter">CFE</span>
        </div>

        {/* Encabezado Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b-2 border-slate-200">
          <div>
            <div className="flex items-center gap-1.5">
              {/* Logo CFE Simulacro */}
              <div className="font-extrabold text-[38px] leading-none tracking-tight text-[#00875a] flex flex-col font-mono">
                <span>CFE</span>
                <span className="text-[9px] font-sans font-bold tracking-widest text-[#00875a] border-t border-[#00875a] pt-0.5 uppercase">Comisión Federal de Electricidad®</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-600 leading-tight md:text-right mt-2 md:mt-0 font-sans">
            <span className="font-bold text-slate-800 block text-xs mb-1">Comisión Federal de Electricidad</span>
            Av. Paseo de la Reforma 164, Col. Juárez,<br />
            Alcaldía: Cuauhtémoc, Código Postal: 06600,<br />
            Ciudad de México. RFC: CFE370814QI0
          </div>
        </div>

        {/* Información del Cliente y Cuadro Resumen Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-1 text-xs">
            <h2 className="text-base font-extrabold text-slate-900 tracking-wide font-sans uppercase">{clienteNombre}</h2>
            <div className="text-slate-600 uppercase font-medium leading-relaxed">
              {clienteDireccion}<br />
              VERACRUZ, VER
            </div>
            
            <div className="pt-3 grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-slate-600 font-mono uppercase">
              <div><strong className="text-slate-800">NO. DE SERVICIO:</strong> 849960904074</div>
              <div><strong className="text-slate-800">TARIFA:</strong> 1C</div>
              <div><strong className="text-slate-800">RMU:</strong> 91780 96-09-13 EIVE-571007 003 CFE</div>
              <div><strong className="text-slate-800">MEDIDOR:</strong> HLA456</div>
              <div><strong className="text-slate-800">MULTIP:</strong> 1</div>
              <div><strong className="text-slate-800">HILOS:</strong> 2</div>
            </div>
            
            <div className="pt-1.5 text-[10px] text-slate-700">
              <strong className="text-slate-800 uppercase font-mono">Periodo Facturado:</strong> 09 ABR - 11 JUN (SIMULADO EN BASE A {diasPeriodo} DÍAS)
            </div>
          </div>

          {/* Gran Caja de Total a Pagar CFE */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between text-right shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total a Pagar:</span>
              <div className="text-[44px] font-black text-slate-900 leading-none font-sans tracking-tight">
                ${Math.round(desglose.factura.total).toLocaleString('es-MX')}
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider mt-1">
                ({numeroALetras(desglose.factura.total)})
              </span>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 text-[9px] text-slate-500 font-mono uppercase text-left">
              <div><strong>Límite de Pago:</strong> 27 JUN</div>
              <div className="text-right"><strong>Corte a partir:</strong> 28 JUN</div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* TABLA DE CONCEPTOS DE ENERGÍA Y LECTURAS */}
        {/* ========================================== */}
        <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Encabezado Verde Oficial */}
          <div className="bg-[#00875a] text-white p-2.5 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-center">
            <span className="col-span-4 text-left pl-2">Concepto</span>
            <span className="col-span-2">Lectura actual</span>
            <span className="col-span-2">Lectura anterior</span>
            <span className="col-span-2">Total periodo</span>
            <span className="col-span-1 text-right">Precio</span>
            <span className="col-span-1 text-right pr-2">Subtotal</span>
          </div>

          {/* Fila Base Consumo */}
          <div className="grid grid-cols-12 text-xs font-mono py-2.5 px-2 border-b border-slate-100 font-bold bg-slate-50/50">
            <span className="col-span-4 text-left font-sans text-slate-800">⚡ Energía Activa (kWh)</span>
            <span className="col-span-2 text-center text-slate-600">{(15755 + Math.round(kwhBimestral)).toLocaleString()}</span>
            <span className="col-span-2 text-center text-slate-600">15,755</span>
            <span className="col-span-2 text-center text-slate-900">{Math.round(kwhBimestral).toLocaleString()}</span>
            <span className="col-span-1"></span>
            <span className="col-span-1 text-right text-slate-900 pr-2"></span>
          </div>

          {/* Subfilas de Tramos Marginales */}
          <div className="divide-y divide-slate-100 text-[11px] font-mono text-slate-600">
            
            {/* Básico */}
            <div className="grid grid-cols-12 py-2 px-2 hover:bg-slate-50/30">
              <span className="col-span-4 pl-4 font-sans text-slate-700">Basico (Límite {tarifas.basico.limit} kWh)</span>
              <span className="col-span-4"></span>
              <span className="col-span-2 text-center">{Math.round(desglose.energia.basico.kwh)}</span>
              <span className="col-span-1 text-right">{tarifas.basico.costo.toFixed(3)}</span>
              <span className="col-span-1 text-right pr-2 text-slate-900">${desglose.energia.basico.costo.toFixed(2)}</span>
            </div>

            {/* Intermedio 1 */}
            <div className="grid grid-cols-12 py-2 px-2 hover:bg-slate-50/30">
              <span className="col-span-4 pl-4 font-sans text-slate-700">Intermedio 1 (Límite {tarifas.intermedio1.limit} kWh)</span>
              <span className="col-span-4"></span>
              <span className="col-span-2 text-center">{Math.round(desglose.energia.intermedio1.kwh)}</span>
              <span className="col-span-1 text-right">{tarifas.intermedio1.costo.toFixed(3)}</span>
              <span className="col-span-1 text-right pr-2 text-slate-900">${desglose.energia.intermedio1.costo.toFixed(2)}</span>
            </div>

            {/* Intermedio 2 */}
            <div className="grid grid-cols-12 py-2 px-2 hover:bg-slate-50/30">
              <span className="col-span-4 pl-4 font-sans text-slate-700">Intermedio 2 (Límite {tarifas.intermedio2.limit} kWh)</span>
              <span className="col-span-4"></span>
              <span className="col-span-2 text-center">{Math.round(desglose.energia.intermedio2.kwh)}</span>
              <span className="col-span-1 text-right">{tarifas.intermedio2.costo.toFixed(3)}</span>
              <span className="col-span-1 text-right pr-2 text-slate-900">${desglose.energia.intermedio2.costo.toFixed(2)}</span>
            </div>

            {/* Excedente */}
            <div className="grid grid-cols-12 py-2 px-2 hover:bg-slate-50/30">
              <span className="col-span-4 pl-4 font-sans text-slate-700">Excedente</span>
              <span className="col-span-4"></span>
              <span className="col-span-2 text-center">{Math.round(desglose.energia.excedente.kwh)}</span>
              <span className="col-span-1 text-right">{tarifas.excedente.costo.toFixed(3)}</span>
              <span className="col-span-1 text-right pr-2 text-slate-900">${desglose.energia.excedente.costo.toFixed(2)}</span>
            </div>

          </div>
        </div>

        {/* GRAFICO VISUAL DE CONSUMO CFE (SEMAFORO) */}
        <div className="mt-4 px-2 py-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 relative">
          <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold font-mono">
            <span>Menor Consumo (Mayor Apoyo)</span>
            <span>Mayor Consumo (Tarifa Alta)</span>
          </div>
          
          {/* Barra de Colores del Semáforo CFE */}
          <div className="w-full h-3 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-450 to-red-650 relative">
            
            {/* Indicador / Aguja de Consumo */}
            <div 
              className="absolute -top-1.5 flex flex-col items-center transition-all duration-500"
              style={{ left: `${pointerPct}%` }}
            >
              <div className="w-0.5 h-6 bg-slate-950 relative">
                {/* Flecha indicadora */}
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-white" />
              </div>
            </div>

          </div>

          <p className="text-center text-[10px] text-slate-600 font-medium italic pt-1.5">
            Este gráfico refleja tu nivel de consumo. A menor uso, mayor apoyo gubernamental.
          </p>
        </div>

        {/* ============================================================= */}
        {/* DESGLOSE MEM VS DESGLOSE TOTAL DE FACTURA (Side-by-Side) */}
        {/* ============================================================= */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Tabla MEM (Mercado Eléctrico Mayorista) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-[#00875a] text-white p-2 text-[9px] font-bold uppercase tracking-wider text-center">
              Costos de la energía en el Mercado Eléctrico Mayorista (MEM)
            </div>
            
            <div className="text-[10px] font-mono divide-y divide-slate-100">
              {/* Cabecera */}
              <div className="grid grid-cols-4 p-1.5 bg-slate-50 font-bold uppercase text-slate-500 text-center text-[8px]">
                <span className="text-left">Concepto</span>
                <span>$</span>
                <span>$/kWh</span>
                <span className="text-right">Importe</span>
              </div>

              {/* Suministro */}
              <div className="grid grid-cols-4 p-1.5 text-slate-600">
                <span className="font-sans font-bold text-slate-700">Suministro</span>
                <span className="text-center">${costosMEM.suministro.toFixed(2)}</span>
                <span className="text-center">-</span>
                <span className="text-right text-slate-900">${desglose.mem.suministro.toFixed(2)}</span>
              </div>

              {/* Distribución */}
              <div className="grid grid-cols-4 p-1.5 text-slate-600">
                <span className="font-sans font-bold text-slate-700">Distribución</span>
                <span className="text-center">-</span>
                <span className="text-center">{costosMEM.distribucion.toFixed(4)}</span>
                <span className="text-right text-slate-900">${desglose.mem.distribucion.toFixed(2)}</span>
              </div>

              {/* Transmisión */}
              <div className="grid grid-cols-4 p-1.5 text-slate-600">
                <span className="font-sans font-bold text-slate-700">Transmisión</span>
                <span className="text-center">-</span>
                <span className="text-center">{costosMEM.transmision.toFixed(4)}</span>
                <span className="text-right text-slate-900">${desglose.mem.transmision.toFixed(2)}</span>
              </div>

              {/* CENACE */}
              <div className="grid grid-cols-4 p-1.5 text-slate-600">
                <span className="font-sans font-bold text-slate-700">CENACE</span>
                <span className="text-center">-</span>
                <span className="text-center">{costosMEM.cenace.toFixed(4)}</span>
                <span className="text-right text-slate-900">${desglose.mem.cenace.toFixed(2)}</span>
              </div>

              {/* Energía */}
              <div className="grid grid-cols-4 p-1.5 text-slate-600">
                <span className="font-sans font-bold text-slate-700">Energía</span>
                <span className="text-center">-</span>
                <span className="text-center">{costosMEM.energia.toFixed(4)}</span>
                <span className="text-right text-slate-900">${desglose.mem.energia.toFixed(2)}</span>
              </div>

              {/* Capacidad */}
              <div className="grid grid-cols-4 p-1.5 text-slate-600">
                <span className="font-sans font-bold text-slate-700">Capacidad</span>
                <span className="text-center">-</span>
                <span className="text-center">{costosMEM.capacidad.toFixed(4)}</span>
                <span className="text-right text-slate-900">${desglose.mem.capacidad.toFixed(2)}</span>
              </div>

              {/* SCnMEM */}
              <div className="grid grid-cols-4 p-1.5 text-slate-600">
                <span className="font-sans font-bold text-slate-700">SCnMEM(1)</span>
                <span className="text-center">-</span>
                <span className="text-center">{costosMEM.scnmem.toFixed(4)}</span>
                <span className="text-right text-slate-900">${desglose.mem.scnmem.toFixed(2)}</span>
              </div>

              {/* Total MEM Info */}
              <div className="grid grid-cols-4 p-1.5 bg-slate-50 font-bold text-slate-800">
                <span className="font-sans">Subtotal MEM</span>
                <span className="col-span-3 text-right text-[#00875a] font-mono">${desglose.mem.total.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>

          {/* Desglose de Importe a Pagar */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-[#00875a] text-white p-2 text-[9px] font-bold uppercase tracking-wider text-center">
              Desglose del importe a pagar (Resumen CFE)
            </div>
            
            <div className="text-xs divide-y divide-slate-100 font-sans">
              
              <div className="flex justify-between p-2.5 text-slate-700">
                <span>Costo de Energía Base:</span>
                <span className="font-mono font-bold text-slate-950">${desglose.factura.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 text-slate-700">
                <span>IVA 16%:</span>
                <span className="font-mono text-slate-950">${desglose.factura.iva.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 text-slate-700 bg-slate-50/50 font-bold">
                <span>Facturación del Periodo:</span>
                <span className="font-mono text-slate-950">${desglose.factura.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 text-slate-500 font-mono text-[10px]">
                <span>Adeudo Anterior:</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between p-2.5 text-slate-500 font-mono text-[10px]">
                <span>Su Pago (Abono):</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-50 border-t border-slate-200 font-extrabold text-slate-900 text-sm">
                <span className="uppercase text-xs tracking-wider">Total a Liquidar</span>
                <span className="font-mono text-base text-[#00875a]">${desglose.factura.total.toFixed(2)} MXN</span>
              </div>

            </div>
          </div>

        </div>

        {/* Pie del Recibo y Código de Barras ficticio */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Logotipo CFE Contigo */}
            <div className="flex flex-col text-[#00875a] leading-none">
              <span className="text-[20px] font-black tracking-tight font-mono">CFE-contigo</span>
              <span className="text-[7px] font-sans font-bold uppercase tracking-widest pt-0.5">Suministro Básico</span>
            </div>
            <div className="text-[8px] text-slate-500 font-mono max-w-xs leading-relaxed uppercase">
              (1) SCnMEM: Costos relacionados con los servicios del Mercado. (2) DAP: Derecho al Alumbrado Público. (3) Cargos o créditos relacionados con el suministro CFE.
            </div>
          </div>

          {/* Simulación del Código de Barras */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-48 bg-slate-900 flex items-center justify-between px-1">
              {/* Código de barras falso simulado por barras verticales de diferente ancho */}
              <div className="w-full h-full bg-repeating-linear-stripe opacity-90" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px, #000 5px, #000 6px, #fff 6px, #fff 8px)'
              }} />
            </div>
            <span className="text-[8px] font-mono text-slate-500 tracking-wider">
              91780 96-09-13 EIVE-571007 003 CFE | 01 849960904074
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
