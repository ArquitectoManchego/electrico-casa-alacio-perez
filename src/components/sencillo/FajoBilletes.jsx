import React from 'react';

/**
 * Componente FajoBilletes:
 * Representa visualmente el dinero en billetes mexicanos y fajos bancarios
 * según la regla solicitada:
 * - Hasta ~$500 pesos: billetes de a $100 (café/rojizo)
 * - De ~$500 a ~$2,000 pesos: billetes de $200 (verdes de Sor Juana)
 * - $5,000 pesos: 1 fajo de 10 billetes de $500 (azules de Benito Juárez)
 * - A partir de ahí: fajos de 10 billetes de $500 ($5,000 c/u).
 *   Ej. $20,000 = 4 fajos de 10 billetes de $500.
 */

export function Billete100SVG({ className = "w-44 h-24", rotate = 0 }) {
  return (
    <svg 
      viewBox="0 0 200 100" 
      className={className} 
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="b100Bg" x1="0" y1="0" x2="200" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EA580C" />
          <stop offset="0.5" stopColor="#C2410C" />
          <stop offset="1" stopColor="#9A3412" />
        </linearGradient>
      </defs>
      {/* Cuerpo del billete */}
      <rect x="2" y="2" width="196" height="96" rx="6" fill="url(#b100Bg)" stroke="#FED7AA" strokeWidth="1.5" />
      <rect x="8" y="8" width="184" height="84" rx="4" stroke="#FFF7ED" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Valor 100 en esquinas */}
      <text x="14" y="28" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="sans-serif">100</text>
      <text x="145" y="85" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="sans-serif">100</text>
      <text x="50" y="24" fill="#FFEDD5" fontSize="8" fontWeight="bold" letterSpacing="2">BANCO DE MÉXICO</text>

      {/* Silueta de Sor Juana / Nezahualcóyotl */}
      <circle cx="155" cy="40" r="20" fill="#7C2D12" opacity="0.6" />
      <circle cx="155" cy="35" r="12" fill="#FED7AA" opacity="0.4" />
      
      {/* Greca decorativa */}
      <path d="M20 70 L 40 70 L 45 80 L 15 80 Z" fill="#FED7AA" opacity="0.3" />
      <path d="M50 70 L 70 70 L 75 80 L 45 80 Z" fill="#FED7AA" opacity="0.3" />
      <text x="16" y="88" fill="#FFEDD5" fontSize="7" fontWeight="bold">PESOS</text>
    </svg>
  );
}

export function Billete200SVG({ className = "w-44 h-24", rotate = 0 }) {
  return (
    <svg 
      viewBox="0 0 200 100" 
      className={className} 
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="b200Bg" x1="0" y1="0" x2="200" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16A34A" />
          <stop offset="0.5" stopColor="#15803D" />
          <stop offset="1" stopColor="#14532D" />
        </linearGradient>
      </defs>
      {/* Cuerpo del billete */}
      <rect x="2" y="2" width="196" height="96" rx="6" fill="url(#b200Bg)" stroke="#BBF7D0" strokeWidth="1.5" />
      <rect x="8" y="8" width="184" height="84" rx="4" stroke="#DCFCE7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Valor 200 */}
      <text x="14" y="28" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="sans-serif">200</text>
      <text x="145" y="85" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="sans-serif">200</text>
      <text x="50" y="24" fill="#DCFCE7" fontSize="8" fontWeight="bold" letterSpacing="2">BANCO DE MÉXICO</text>

      {/* Silueta de Sor Juana Inés de la Cruz */}
      <circle cx="155" cy="40" r="20" fill="#052E16" opacity="0.6" />
      <path d="M142 50 C 145 35, 165 35, 168 50 Z" fill="#BBF7D0" opacity="0.4" />
      <circle cx="155" cy="34" r="9" fill="#BBF7D0" opacity="0.4" />

      {/* Hilo de seguridad verde brillante */}
      <line x1="85" y1="8" x2="85" y2="92" stroke="#4ADE80" strokeWidth="2.5" strokeDasharray="6 3" />
      <text x="16" y="88" fill="#DCFCE7" fontSize="7" fontWeight="bold">PESOS</text>
    </svg>
  );
}

export function Billete500SVG({ className = "w-44 h-24", rotate = 0 }) {
  return (
    <svg 
      viewBox="0 0 200 100" 
      className={className} 
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="b500Bg" x1="0" y1="0" x2="200" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="0.5" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      {/* Cuerpo del billete */}
      <rect x="2" y="2" width="196" height="96" rx="6" fill="url(#b500Bg)" stroke="#BFDBFE" strokeWidth="1.5" />
      <rect x="8" y="8" width="184" height="84" rx="4" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Valor 500 */}
      <text x="14" y="28" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="sans-serif">500</text>
      <text x="145" y="85" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="sans-serif">500</text>
      <text x="50" y="24" fill="#DBEAFE" fontSize="8" fontWeight="bold" letterSpacing="2">BANCO DE MÉXICO</text>

      {/* Silueta de Benito Juárez / Ballena gris */}
      <circle cx="155" cy="40" r="20" fill="#0F172A" opacity="0.6" />
      <path d="M142 50 C 145 35, 165 35, 168 50 Z" fill="#93C5FD" opacity="0.4" />
      <circle cx="155" cy="34" r="9" fill="#93C5FD" opacity="0.4" />

      {/* Hilo de seguridad holográfico azul/cyan */}
      <line x1="85" y1="8" x2="85" y2="92" stroke="#38BDF8" strokeWidth="3" strokeDasharray="6 3" />
      <text x="16" y="88" fill="#DBEAFE" fontSize="7" fontWeight="bold">PESOS</text>
    </svg>
  );
}

/**
 * Fajo Completo de 10 Billetes de $500 con Fajilla Bancaria ($5,000 MXN)
 */
export function FajoBancario5000({ index = 0 }) {
  return (
    <div className="relative group transition-transform hover:-translate-y-1 duration-200">
      {/* Capas apiladas de billetes para dar profundidad 3D */}
      <div className="absolute -top-3 left-1.5 w-48 h-28 opacity-40 blur-[0.5px]">
        <Billete500SVG className="w-48 h-28" rotate={-2} />
      </div>
      <div className="absolute -top-1.5 left-1 w-48 h-28 opacity-70">
        <Billete500SVG className="w-48 h-28" rotate={1} />
      </div>

      {/* Billete frontal */}
      <div className="relative z-10 drop-shadow-xl">
        <Billete500SVG className="w-48 h-28" rotate={0} />

        {/* Fajilla / Banda de Papel Bancario */}
        <div className="absolute top-0 left-16 w-16 h-28 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-200 border-x border-amber-300 shadow-md flex flex-col items-center justify-center p-1 text-center">
          <span className="text-[7px] font-black text-slate-800 uppercase tracking-tighter block">BANXICO</span>
          <span className="text-[9px] font-black text-blue-900 block leading-tight font-mono">10x $500</span>
          <span className="text-[10px] font-black text-emerald-800 block font-mono">$5,000</span>
          <span className="text-[6px] text-amber-900 block uppercase tracking-widest mt-0.5">FAJO #{index + 1}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente Principal FajoBilletes
 */
export default function FajoBilletes({ monto = 500, label = "Costo en Efectivo" }) {
  const montoNum = Math.max(0, parseFloat(monto) || 0);

  // Cálculo de fajos y billetes según la regla
  const calcularComposicion = () => {
    // Caso 1: Hasta ~$750 pesos -> billetes de $100
    if (montoNum <= 750) {
      const cant = Math.max(1, Math.min(10, Math.round(montoNum / 100)));
      return {
        tipo: 'billetes_100',
        denominacion: 100,
        cantidad: cant,
        descripcion: `${cant} billetes de a $100 pesos`
      };
    }

    // Caso 2: De ~$750 a ~$2,500 pesos -> billetes de $200 (Sor Juana)
    if (montoNum <= 2500) {
      const cant = Math.max(1, Math.min(10, Math.round(montoNum / 200)));
      return {
        tipo: 'billetes_200',
        denominacion: 200,
        cantidad: cant,
        descripcion: `${cant} billetes de a $200 pesos (Sor Juana)`
      };
    }

    // Caso 3: Mayor a $2,500 pesos -> Fajos de 10 billetes de $500 ($5,000 por fajo)
    const fajosCompletos = Math.floor(montoNum / 5000);
    const resto = montoNum % 5000;
    const billetesSueltos500 = Math.round(resto / 500);

    return {
      tipo: 'fajos_500',
      fajosCompletos: Math.max(fajosCompletos, (fajosCompletos === 0 && montoNum >= 2500) ? 1 : fajosCompletos),
      billetesSueltos500,
      descripcion: fajosCompletos > 0
        ? `${fajosCompletos} ${fajosCompletos === 1 ? 'fajo' : 'fajos'} de 10 billetes de $500 (${fajosCompletos * 5000} pesos)${billetesSueltos500 > 0 ? ` + ${billetesSueltos500} de $500 sueltos` : ''}`
        : `1 fajo de 10 billetes de $500 pesos`
    };
  };

  const comp = calcularComposicion();

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
      {/* Resplandor de fondo según denominación */}
      <div className={`absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
        comp.tipo === 'billetes_100' ? 'bg-orange-500' : comp.tipo === 'billetes_200' ? 'bg-emerald-500' : 'bg-blue-600'
      }`} />

      {/* Título y Monto Principal en Grande */}
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </span>
      <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mb-3">
        ${Math.round(montoNum).toLocaleString()} <span className="text-xs font-sans text-slate-400">MXN</span>
      </div>

      {/* Representación Gráfica de los Billetes / Fajos */}
      <div className="py-4 px-2 min-h-[140px] flex items-center justify-center">
        {/* Caso Billetes de $100 */}
        {comp.tipo === 'billetes_100' && (
          <div className="relative group">
            {Array.from({ length: Math.min(5, comp.cantidad) }).map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 left-0 transition-transform"
                style={{
                  transform: `translate(${i * 4}px, ${-i * 4}px) rotate(${i * 1.5 - 2}deg)`,
                  zIndex: i
                }}
              >
                <Billete100SVG className="w-48 h-28" />
              </div>
            ))}
            <div style={{ transform: `translate(${Math.min(4, comp.cantidad - 1) * 4}px, ${-Math.min(4, comp.cantidad - 1) * 4}px)` }}>
              <Billete100SVG className="w-48 h-28" />
            </div>
          </div>
        )}

        {/* Caso Billetes de $200 (Sor Juana verdes) */}
        {comp.tipo === 'billetes_200' && (
          <div className="relative group">
            {Array.from({ length: Math.min(5, comp.cantidad) }).map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 left-0 transition-transform"
                style={{
                  transform: `translate(${i * 4}px, ${-i * 4}px) rotate(${i * 2 - 3}deg)`,
                  zIndex: i
                }}
              >
                <Billete200SVG className="w-48 h-28" />
              </div>
            ))}
            <div style={{ transform: `translate(${Math.min(4, comp.cantidad - 1) * 4}px, ${-Math.min(4, comp.cantidad - 1) * 4}px)` }}>
              <Billete200SVG className="w-48 h-28" />
            </div>
          </div>
        )}

        {/* Caso Fajos de 10 Billetes de $500 ($5,000 c/u) */}
        {comp.tipo === 'fajos_500' && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {Array.from({ length: Math.min(4, comp.fajosCompletos) }).map((_, i) => (
              <FajoBancario5000 key={i} index={i} />
            ))}
            {comp.fajosCompletos > 4 && (
              <div className="bg-slate-900 border border-indigo-500/40 px-3 py-2 rounded-xl text-xs font-bold text-indigo-300">
                +{comp.fajosCompletos - 4} fajos más
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explicación Amigable */}
      <div className="mt-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-xl">
        💵 Equivalente a: <strong>{comp.descripcion}</strong>
      </div>
    </div>
  );
}
