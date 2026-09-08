import React, { useState } from 'react';
import { ShieldCheck, TrendingDown, Info, BookOpen, AlertCircle } from 'lucide-react';
import { calcularCobroCFECompleto } from '../utils/simuladorCFE';

export default function PoliticasEficiencia({ 
  aparatos = [], 
  sales, 
  salesEqualizer, 
  efficientPolicies = {}, 
  setEfficientPolicies,
  tarifas,
  costosMEM,
  diasPeriodo
}) {

  // Búsqueda de equipos en el inventario real del proyecto residencial
  const findRealAppliance = (keywords) => {
    return aparatos.find(ap => {
      const typeLower = (ap.tipo || '').toLowerCase();
      const modelLower = (ap.modelo || '').toLowerCase();
      return keywords.some(k => typeLower.includes(k) || modelLower.includes(k));
    });
  };

  const climas = aparatos.filter(ap => (ap.tipo || '').toLowerCase().includes('clima') || (ap.tipo || '').toLowerCase().includes('minisplit') || (ap.tipo || '').toLowerCase().includes('aire'));
  const totalWattsClimas = climas.reduce((acc, c) => acc + (parseFloat(c.watts) || 0), 0) || 3000;

  const boiler = findRealAppliance(['boiler', 'calentador']);
  const wattsBoiler = boiler ? parseFloat(boiler.watts) : 3500;

  const refri = findRealAppliance(['refrigerador', 'refri']);
  const wattsRefri = refri ? parseFloat(refri.watts) : 350;

  const luces = aparatos.filter(ap => (ap.tipo || '').toLowerCase().includes('luz') || (ap.tipo || '').toLowerCase().includes('ilum') || (ap.tipo || '').toLowerCase().includes('led'));
  const totalWattsLuces = luces.reduce((acc, l) => acc + (parseFloat(l.watts) || 0), 0) || 600;

  // Cálculo de kWh diarios base vs con políticas
  const calcularKwhConPoliticas = (politicas) => {
    // 1. Climas / Minisplits (8 horas diarias promedio en verano/clima cálido)
    const factorClima = politicas.climaSetPoint24 ? 0.75 : 1.0; // 25% de ahorro a 24°C vs 20°C
    const kwhClima = (totalWattsClimas * 8 * factorClima) / 1000;

    // 2. Cargas Vampiro / Standby (TV, audio, consolas, microondas, home office)
    const wattsStandby = politicas.standbyKill ? 15 : 95; // Cargas fantasma continuas 24h
    const kwhStandby = (wattsStandby * 24) / 1000;

    // 3. Boiler Eléctrico (Calentamiento continuo vs temporizado)
    const factorBoiler = politicas.boilerHorario ? 0.65 : 1.0; // 35% de ahorro por pérdidas térmicas
    const kwhBoiler = (wattsBoiler * 1.5 * factorBoiler) / 1000;

    // 4. Refrigerador (Ciclos continuos 24h)
    const factorRefri = politicas.refrigeradorEco ? 0.85 : 1.0; // 15% de ahorro
    const kwhRefri = (wattsRefri * 24 * 0.40 * factorRefri) / 1000;

    // 5. Iluminación (4 horas diarias promedio)
    const factorLuces = politicas.iluminacionSmart ? 0.75 : 1.0; // 25% de ahorro con sensores
    const kwhLuces = (totalWattsLuces * 4 * factorLuces) / 1000;

    const totalDiario = kwhClima + kwhStandby + kwhBoiler + kwhRefri + kwhLuces;
    return totalDiario * diasPeriodo;
  };

  const kwhBase = calcularKwhConPoliticas({
    climaSetPoint24: false,
    standbyKill: false,
    boilerHorario: false,
    refrigeradorEco: false,
    iluminacionSmart: false
  });

  const kwhActual = calcularKwhConPoliticas(efficientPolicies);

  const desgloseBase = calcularCobroCFECompleto(kwhBase, tarifas, costosMEM);
  const desgloseActual = calcularCobroCFECompleto(kwhActual, tarifas, costosMEM);

  const ahorroKwh = Math.max(0, kwhBase - kwhActual);
  const ahorroPesos = Math.max(0, desgloseBase.factura.total - desgloseActual.factura.total);
  const ahorroKwhMensual = ahorroKwh * (30 / diasPeriodo);
  const ahorroPesosMensual = ahorroPesos * (30 / diasPeriodo);

  const togglePolicy = (key) => {
    setEfficientPolicies(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const politicasLista = [
    {
      key: 'climaSetPoint24',
      label: 'Termostato de Climas en 24°C (NOM / Conuee)',
      desc: 'Mantener minisplits a 24°C en vez de 19°C-21°C reduce el esfuerzo del compresor inverter entre un 20% y 30% sin perder confort térmico.',
      icon: '❄️'
    },
    {
      key: 'standbyKill',
      label: 'Eliminación de Cargas Fantasma / Vampiro',
      desc: 'Desconectar o apagar con regletas inteligentes centros de entretenimiento, televisores, consolas y cargadores por la noche elimina hasta 80W continuos.',
      icon: '🔌'
    },
    {
      key: 'boilerHorario',
      label: 'Temporizador Inteligente en Boiler Eléctrico',
      desc: 'Programar el calentador de agua solo en las ventanas de baño matutino y vespertino evita que el termostato recircule calor residual 24 horas.',
      icon: '🚿'
    },
    {
      key: 'refrigeradorEco',
      label: 'Modo Eficiente en Refrigerador Inverter',
      desc: 'Calibración a 3°C en conservador y -18°C en congelador, con serpentín trasero limpio y sellos magnéticos herméticos.',
      icon: '🧊'
    },
    {
      key: 'iluminacionSmart',
      label: 'Sensores y Apagado Automático de Iluminación',
      desc: 'Instalar fotoceldas o sensores de presencia en exteriores, cochera y pasillos para evitar iluminación diurna accidental.',
      icon: '💡'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal y Widget de Ahorro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Titular */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <ShieldCheck size={140} className="text-teal-400" />
          </div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <ShieldCheck className="text-teal-400" size={22} />
            Políticas de Eficiencia Energética Residencial (Casa Alacio Pérez)
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
            Optimiza los hábitos de consumo eléctrico de tu hogar. Configura buenas prácticas y control de cargas para evitar el escalón Excedente y prevenir caer en la costosa tarifa <strong>DAC (Doméstica de Alto Consumo)</strong> de CFE.
          </p>
        </div>

        {/* Live Saving Widget */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border-l-4 border-l-teal-500 bg-gradient-to-br from-slate-900/60 to-slate-950 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-450 uppercase tracking-widest block font-mono">Calculadora de Ahorro Activo</span>
            <div className="text-3xl font-black text-white mt-1 font-sans">
              ${Math.round(ahorroPesosMensual).toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-500 font-sans">MXN / mes</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              ⚡ Ahorro Estimado: {ahorroKwhMensual.toFixed(1)} kWh / mes
            </span>
          </div>
          <div className="text-[9px] text-slate-500 font-sans mt-3 border-t border-slate-800/60 pt-2 flex items-center gap-1.5 leading-tight">
            <TrendingDown size={12} className="text-teal-450 flex-shrink-0" />
            <span>Al activar políticas de ahorro, disminuyes la energía facturada en los escalones más caros de CFE.</span>
          </div>
        </div>

      </div>

      {/* Grid de Configuración de Políticas y Matriz */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controles de Políticas (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5 mb-3 font-display">
              <ShieldCheck size={16} className="text-teal-400" />
              Medidas de Ahorro en el Hogar
            </h3>
            
            <div className="space-y-3">
              {politicasLista.map(p => (
                <div 
                  key={p.key}
                  onClick={() => togglePolicy(p.key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    efficientPolicies[p.key]
                      ? 'bg-teal-500/5 border-teal-500/30 text-slate-200 hover:bg-teal-500/10'
                      : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/50 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">{p.label}</span>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-250 ${efficientPolicies[p.key] ? 'bg-teal-500' : 'bg-slate-800'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-250 ${efficientPolicies[p.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal font-sans">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Análisis y Matriz de Escenarios Residenciales (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5 mb-2 font-display">
              <Info size={16} className="text-cyan-400" />
              Impacto de Hábitos en el Consumo Bimestral CFE
            </h3>
            <p className="text-[10px] text-slate-450 leading-relaxed font-sans mb-4">
              Comportamiento típico de los aparatos de mayor potencia en la residencia bajo distintos patrones de uso:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-[10px] text-slate-450 border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-300 font-mono font-bold">
                    <th className="py-2 text-left">Equipo Residencial</th>
                    <th className="py-2 text-center bg-slate-900/40">1. Uso Ineficiente</th>
                    <th className="py-2 text-center bg-slate-900/80">2. Uso Estándar</th>
                    <th className="py-2 text-center bg-slate-800/40">3. Eficiente (Recomendado)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-sans leading-normal">
                  <tr>
                    <td className="py-2.5 font-bold text-slate-350 font-mono">❄️ Minisplits</td>
                    <td className="py-2.5 text-center bg-slate-900/10 text-slate-400">18°C-20°C continuos con puertas abiertas (compresor al 100%).</td>
                    <td className="py-2.5 text-center bg-slate-900/30 text-slate-300 font-medium">22°C con termostato regulando intermitente.</td>
                    <td className="py-2.5 text-center bg-slate-800/10 text-slate-200 font-bold">24°C modo Eco/Inverter con habitación sellada.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-350 font-mono">🚿 Boiler Eléctrico</td>
                    <td className="py-2.5 text-center bg-slate-900/10 text-slate-400">Encendido 24h manteniendo agua hirviendo continuamente.</td>
                    <td className="py-2.5 text-center bg-slate-900/30 text-slate-300 font-medium">Encendido manual 1 hora antes de bañarse.</td>
                    <td className="py-2.5 text-center bg-slate-800/10 text-slate-200 font-bold">Timer programable en horas pico de ducha.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-350 font-mono">🧊 Refrigerador</td>
                    <td className="py-2.5 text-center bg-slate-900/10 text-slate-400">Termostato al máximo y serpentín lleno de polvo.</td>
                    <td className="py-2.5 text-center bg-slate-900/30 text-slate-300 font-medium">Temperatura media estándar (3°C / -18°C).</td>
                    <td className="py-2.5 text-center bg-slate-800/10 text-slate-200 font-bold">Inverter con ventilación adecuada y empaques limpios.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-350 font-mono">🔌 Standby / Vampiro</td>
                    <td className="py-2.5 text-center bg-slate-900/10 text-slate-400">10+ dispositivos en modo espera 24 horas al día (100W+).</td>
                    <td className="py-2.5 text-center bg-slate-900/30 text-slate-300 font-medium">Desconexión ocasional en periodos vacacionales.</td>
                    <td className="py-2.5 text-center bg-slate-800/10 text-slate-200 font-bold">Supresores de picos con switch general de apagado.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-350 font-mono">💡 Iluminación</td>
                    <td className="py-2.5 text-center bg-slate-900/10 text-slate-400">Luces exteriores encendidas todo el día por descuido.</td>
                    <td className="py-2.5 text-center bg-slate-900/30 text-slate-300 font-medium">Luminarias LED con encendido manual nocturno.</td>
                    <td className="py-2.5 text-center bg-slate-800/10 text-slate-200 font-bold">Fotocelda automática exterior + sensores de pasillo.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Guía de Buenas Prácticas Residenciales */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5 mb-3 font-display">
              <BookOpen size={16} className="text-teal-400" />
              Buenas Prácticas para Evitar la Tarifa DAC de CFE
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-450 leading-relaxed font-sans">
              <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-200 block">❄️ Climatización Eficiente</span>
                <p><strong>Criterio:</strong> Cada grado que se baja en el control remoto por debajo de 24°C incrementa el consumo eléctrico entre un 7% y un 8%.</p>
                <p className="text-teal-400 font-bold">💡 Recomendación:</p>
                <p>Usa cortinas térmicas para bloquear la radiación solar en recámaras y sala durante las horas de mayor insolación.</p>
              </div>

              <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-200 block">🧺 Lavado y Secado de Ropa</span>
                <p><strong>Criterio:</strong> La secadora eléctrica de 220V consume entre 4,500W y 5,000W durante 45 a 60 minutos por ciclo.</p>
                <p className="text-teal-400 font-bold">💡 Recomendación:</p>
                <p>Aprovecha el secado solar al aire libre en días soleados y realiza cargas completas de ropa para optimizar el centrifugado.</p>
              </div>

              <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-200 block">🚿 Calentador Eléctrico</span>
                <p><strong>Criterio:</strong> Mantener caliente un tanque de agua las 24 horas disipa hasta un 40% de energía por convección.</p>
                <p className="text-teal-400 font-bold">💡 Recomendación:</p>
                <p>Aísla las tuberías de agua caliente de cobre o PPR con coquilla de espuma elastomérica y usa regaderas de bajo flujo (grados ecológicos).</p>
              </div>

              <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-200 block">🚗 Carga de Vehículo Eléctrico (EV)</span>
                <p><strong>Criterio:</strong> Cargar un auto a 32A (7 kW) durante 4 horas consume ~28 kWh por sesión.</p>
                <p className="text-teal-400 font-bold">💡 Recomendación:</p>
                <p>Solicita a CFE la instalación de un segundo medidor exclusivo para vehículo eléctrico o evalúa un sistema solar fotovoltaico interconectado.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
