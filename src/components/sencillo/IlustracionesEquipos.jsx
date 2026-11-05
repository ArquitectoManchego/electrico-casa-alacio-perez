import React from 'react';

/**
 * Catálogo de Ilustraciones Vectoriales Modernas (256x256 px) con degradados,
 * iluminación y estética visual estilo videojuego para cada equipo del consorcio.
 */

export function IlustracionMinisplit({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="acBody" x1="20" y1="50" x2="236" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="0.6" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="acGlow" x1="128" y1="120" x2="128" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#0284C7" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0369A1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="windStream" x1="128" y1="130" x2="128" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
        </linearGradient>
        <filter id="shadowAc" x="10" y="40" width="236" height="110" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ráfagas de Aire Frío Dinámicas */}
      <path d="M70 135 C 60 160, 45 190, 30 220" stroke="url(#windStream)" strokeWidth="8" strokeLinecap="round" strokeDasharray="12 16" opacity="0.8" />
      <path d="M100 138 C 95 170, 90 205, 80 238" stroke="url(#windStream)" strokeWidth="12" strokeLinecap="round" />
      <path d="M128 140 C 128 175, 128 210, 128 245" stroke="url(#windStream)" strokeWidth="16" strokeLinecap="round" />
      <path d="M156 138 C 161 170, 166 205, 176 238" stroke="url(#windStream)" strokeWidth="12" strokeLinecap="round" />
      <path d="M186 135 C 196 160, 211 190, 226 220" stroke="url(#windStream)" strokeWidth="8" strokeLinecap="round" strokeDasharray="12 16" opacity="0.8" />
      
      {/* Resplandor Frío Trasero */}
      <ellipse cx="128" cy="180" rx="90" ry="40" fill="url(#acGlow)" />

      {/* Cuerpo del Minisplit */}
      <g filter="url(#shadowAc)">
        <rect x="24" y="52" width="208" height="80" rx="14" fill="url(#acBody)" />
        <rect x="26" y="54" width="204" height="76" rx="12" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
      </g>

      {/* Ranura y Aleta Difusora de Aire */}
      <rect x="36" y="112" width="184" height="14" rx="6" fill="#0F172A" />
      <path d="M40 120 L 216 120" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />

      {/* Pantalla Digital LED con Temperatura 24°C */}
      <rect x="172" y="74" width="46" height="24" rx="6" fill="#0284C7" />
      <text x="180" y="91" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="monospace">24°C</text>
      
      {/* Indicador LED Eco Verde */}
      <circle cx="162" cy="86" r="3.5" fill="#10B981" />
      <circle cx="162" cy="86" r="6" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Logotipo Inverter Sutil */}
      <text x="44" y="80" fill="#64748B" fontSize="9" fontWeight="800" letterSpacing="1.5">INVERTER</text>
      <path d="M44 86 L 76 86" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IlustracionTPVPOS({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="screenBg" x1="40" y1="40" x2="180" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="posBody" x1="160" y1="110" x2="230" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="glowPos" x1="128" y1="120" x2="128" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity="0.3" />
          <stop offset="1" stopColor="#065F46" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="128" cy="220" rx="95" ry="20" fill="url(#glowPos)" />

      {/* Monitor POS Todo en Uno */}
      <g>
        {/* Base metálica */}
        <path d="M75 190 L 125 190 L 115 150 L 85 150 Z" fill="#475569" />
        <ellipse cx="100" cy="192" rx="35" ry="8" fill="#334155" />

        {/* Pantalla */}
        <rect x="25" y="45" width="150" height="105" rx="10" fill="#334155" stroke="#64748B" strokeWidth="2" />
        <rect x="33" y="53" width="134" height="89" rx="6" fill="url(#screenBg)" />

        {/* Gráfica de Ventas en Pantalla */}
        <polyline points="42,120 65,105 85,112 110,85 135,92 155,70" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="155" cy="70" r="4" fill="#34D399" />
        <text x="42" y="72" fill="#F8FAFC" fontSize="11" fontWeight="bold">VENTA: $4,850</text>
        <rect x="42" y="78" width="50" height="4" rx="2" fill="#38BDF8" />
      </g>

      {/* Terminal Bancaria Smart POS (en primer plano) */}
      <g>
        <rect x="150" y="115" width="76" height="110" rx="12" fill="url(#posBody)" stroke="#60A5FA" strokeWidth="2" />
        <rect x="160" y="125" width="56" height="44" rx="6" fill="#0F172A" />
        
        {/* Pantalla POS con palomita verde de cobro */}
        <circle cx="188" cy="147" r="12" fill="#10B981" />
        <path d="M183 147 L 187 151 L 194 143" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Teclado numérico / ranura de tarjeta */}
        <circle cx="168" cy="180" r="3" fill="#93C5FD" />
        <circle cx="188" cy="180" r="3" fill="#93C5FD" />
        <circle cx="208" cy="180" r="3" fill="#93C5FD" />
        <circle cx="168" cy="194" r="3" fill="#93C5FD" />
        <circle cx="188" cy="194" r="3" fill="#93C5FD" />
        <circle cx="208" cy="194" r="3" fill="#93C5FD" />

        {/* Tarjeta Bancaria con Chip insertada arriba */}
        <rect x="164" y="98" width="48" height="24" rx="4" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
        <rect x="172" y="104" width="10" height="8" rx="1.5" fill="#D97706" />
      </g>
    </svg>
  );
}

export function IlustracionXerox({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="xeroxBody" x1="40" y1="40" x2="216" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F5F9" />
          <stop offset="0.6" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id="xeroxAccent" x1="80" y1="100" x2="180" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Sombra base */}
      <ellipse cx="128" cy="225" rx="90" ry="16" fill="#0F172A" fillOpacity="0.4" />

      {/* Módulo Alimentador Superior de Documentos (ADF) */}
      <path d="M60 48 L 196 48 L 180 72 L 76 72 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
      <rect x="76" y="38" width="104" height="12" rx="4" fill="#94A3B8" />

      {/* Cuerpo Principal de la Impresora */}
      <rect x="52" y="70" width="152" height="140" rx="12" fill="url(#xeroxBody)" stroke="#94A3B8" strokeWidth="2" />
      
      {/* Franja de Control y Marca */}
      <rect x="52" y="90" width="152" height="8" fill="url(#xeroxAccent)" />

      {/* Pantalla Táctil Articulada */}
      <rect x="180" y="65" width="48" height="36" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
      <rect x="185" y="70" width="38" height="26" rx="3" fill="#0284C7" />
      <circle cx="204" cy="83" r="5" fill="#38BDF8" />

      {/* Bandeja de Salida con Documentos a Color Impresos */}
      <rect x="68" y="114" width="100" height="24" rx="4" fill="#0F172A" />
      <rect x="76" y="110" width="84" height="14" rx="2" fill="#FFFFFF" />
      <circle cx="90" cy="117" r="3" fill="#EF4444" />
      <circle cx="100" cy="117" r="3" fill="#3B82F6" />
      <circle cx="110" cy="117" r="3" fill="#F59E0B" />

      {/* Gavetas de Papel Inferiores */}
      <rect x="68" y="148" width="120" height="24" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      <rect x="116" y="156" width="24" height="6" rx="3" fill="#64748B" />
      <rect x="68" y="178" width="120" height="24" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      <rect x="116" y="186" width="24" height="6" rx="3" fill="#64748B" />
    </svg>
  );
}

export function IlustracionCrepera({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="crepaPlaca" cx="128" cy="120" r="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="0.8" stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </radialGradient>
        <radialGradient id="crepaMasa" cx="128" cy="116" r="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF08A" />
          <stop offset="0.7" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </radialGradient>
        <linearGradient id="crepaBase" x1="45" y1="120" x2="211" y2="195" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBD5E1" />
          <stop offset="0.5" stopColor="#F8FAFC" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id="heatGlow" x1="128" y1="80" x2="128" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" stopOpacity="0.4" />
          <stop offset="1" stopColor="#EF4444" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="128" cy="225" rx="85" ry="15" fill="#0F172A" fillOpacity="0.5" />

      {/* Resplandor de Calor */}
      <circle cx="128" cy="120" r="75" fill="url(#heatGlow)" />

      {/* Base Cilíndrica de Acero Inoxidable Krampouz */}
      <path d="M48 130 C 48 115, 208 115, 208 130 L 208 190 C 208 208, 48 208, 48 190 Z" fill="url(#crepaBase)" stroke="#94A3B8" strokeWidth="2" />

      {/* Perilla de Temperatura Termostática */}
      <circle cx="128" cy="172" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
      <line x1="128" y1="172" x2="128" y2="162" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <circle cx="95" cy="172" r="4" fill="#10B981" /> {/* Luz piloto verde */}

      {/* Placa Redonda de Hierro Fundido */}
      <ellipse cx="128" cy="120" rx="84" ry="32" fill="url(#crepaPlaca)" stroke="#475569" strokeWidth="3" />

      {/* Crepa Dorada en Cocción */}
      <ellipse cx="128" cy="118" rx="68" ry="24" fill="url(#crepaMasa)" />
      {/* Trazos dorados en espiral */}
      <path d="M100 114 C 115 108, 140 108, 155 116 C 145 124, 115 124, 105 118" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Espátula y Rastrillo de Madera Típico */}
      <path d="M190 70 L 155 110" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
      <path d="M138 105 L 172 115" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function IlustracionBordadora({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tajimaBody" x1="30" y1="50" x2="226" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="0.7" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      <ellipse cx="128" cy="225" rx="95" ry="16" fill="#0F172A" fillOpacity="0.4" />

      {/* Estructura / Chasis Industrial Tajima 4 Cabezas */}
      <rect x="36" y="80" width="184" height="120" rx="10" fill="url(#tajimaBody)" stroke="#64748B" strokeWidth="2" />
      <rect x="42" y="170" width="172" height="24" fill="#334155" rx="4" />

      {/* Portaconos Superior con Hilos de Colores */}
      <line x1="50" y1="50" x2="206" y2="50" stroke="#94A3B8" strokeWidth="3" />
      {/* Conos de hilo */}
      <polygon points="60,50 68,50 66,32 62,32" fill="#EF4444" /> {/* Rojo */}
      <polygon points="85,50 93,50 91,32 87,32" fill="#3B82F6" /> {/* Azul */}
      <polygon points="110,50 118,50 116,32 112,32" fill="#10B981" /> {/* Verde */}
      <polygon points="135,50 143,50 141,32 137,32" fill="#F59E0B" /> {/* Dorado */}
      <polygon points="160,50 168,50 166,32 162,32" fill="#EC4899" /> {/* Rosa */}
      <polygon points="185,50 193,50 191,32 187,32" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" /> {/* Blanco */}

      {/* Cabezales de Bordado con Agujas */}
      <rect x="58" y="95" width="28" height="50" rx="4" fill="#0F172A" />
      <line x1="72" y1="145" x2="72" y2="162" stroke="#CBD5E1" strokeWidth="2.5" />
      
      <rect x="98" y="95" width="28" height="50" rx="4" fill="#0F172A" />
      <line x1="112" y1="145" x2="112" y2="162" stroke="#CBD5E1" strokeWidth="2.5" />

      <rect x="138" y="95" width="28" height="50" rx="4" fill="#0F172A" />
      <line x1="152" y1="145" x2="152" y2="162" stroke="#CBD5E1" strokeWidth="2.5" />

      <rect x="178" y="95" width="28" height="50" rx="4" fill="#0F172A" />
      <line x1="192" y1="145" x2="192" y2="162" stroke="#CBD5E1" strokeWidth="2.5" />

      {/* Bastidor de Madera Tensando Prenda para Bordar */}
      <ellipse cx="128" cy="162" rx="46" ry="14" fill="#3B82F6" stroke="#D97706" strokeWidth="3" />
      {/* Bordado en proceso (Escudo de estrella bordada) */}
      <polygon points="128,154 131,161 138,162 133,166 135,172 128,168 122,172 124,166 119,162 126,161" fill="#FBBF24" />
    </svg>
  );
}

export function IlustracionMaquinaCostura({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jukiBody" x1="40" y1="60" x2="216" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="0.6" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      <ellipse cx="128" cy="225" rx="90" ry="16" fill="#0F172A" fillOpacity="0.4" />

      {/* Mesa de Trabajo de Madera */}
      <rect x="30" y="170" width="196" height="24" rx="4" fill="#78350F" stroke="#92400E" strokeWidth="2" />
      <rect x="50" y="194" width="12" height="30" fill="#334155" />
      <rect x="194" y="194" width="12" height="30" fill="#334155" />

      {/* Cabezal de la Máquina Juki */}
      <path d="M170 170 L 170 85 C 170 70, 155 70, 140 70 L 80 70 C 65 70, 60 85, 60 100 L 60 170 Z" fill="url(#jukiBody)" stroke="#64748B" strokeWidth="2" />
      <rect x="68" y="110" width="80" height="40" rx="4" fill="#F1F5F9" />

      {/* Barra de Aguja y Prensatelas */}
      <rect x="74" y="145" width="6" height="25" fill="#334155" />
      <path d="M72 168 L 82 168 L 80 172 L 74 172 Z" fill="#94A3B8" />

      {/* Volante Lateral con Servomotor Direct-Drive */}
      <ellipse cx="186" cy="100" rx="14" ry="24" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
      <text x="180" y="104" fill="#FFFFFF" fontSize="11" fontWeight="bold">DD</text>

      {/* Tela de Prueba pasando por debajo de la aguja */}
      <path d="M45 168 L 125 168 L 115 174 L 35 174 Z" fill="#10B981" />
      {/* Pespunte de Costura */}
      <line x1="45" y1="171" x2="115" y2="171" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

export function IlustracionPlanchaSublimacion({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heatPlate" x1="40" y1="80" x2="216" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="0.5" stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="pressBase" x1="40" y1="160" x2="216" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      <ellipse cx="128" cy="225" rx="90" ry="16" fill="#0F172A" fillOpacity="0.4" />

      {/* Base Inferior con Esponja de Silicón */}
      <rect x="42" y="165" width="172" height="36" rx="8" fill="url(#pressBase)" stroke="#334155" strokeWidth="2" />
      <rect x="50" y="160" width="156" height="10" rx="3" fill="#3B82F6" /> {/* Almohadilla azul */}

      {/* Playera en la Base lista para estampar */}
      <path d="M80 162 L 95 156 L 160 156 L 175 162 L 165 170 L 90 170 Z" fill="#FFFFFF" />

      {/* Placa Calefactora Superior 40x60 cm */}
      <rect x="42" y="90" width="172" height="26" rx="6" fill="url(#heatPlate)" stroke="#F87171" strokeWidth="2" />
      {/* Teflón protector dorado */}
      <rect x="46" y="114" width="164" height="4" fill="#D97706" />

      {/* Brazo de Presión y Palanca Oscilante */}
      <path d="M128 90 L 128 45 L 180 32" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="180" cy="32" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />

      {/* Controlador Digital de Tiempo y Temperatura */}
      <rect x="156" y="70" width="48" height="28" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
      <text x="162" y="83" fill="#F87171" fontSize="10" fontWeight="900" fontFamily="monospace">180°C</text>
      <text x="164" y="94" fill="#34D399" fontSize="9" fontWeight="bold" fontFamily="monospace">35s</text>

      {/* Resplandor de Vapor/Calor */}
      <path d="M60 85 C 55 70, 70 60, 65 45" stroke="#F97316" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M95 85 C 90 70, 105 60, 100 45" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function IlustracionLaserCO2({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="laserBody" x1="30" y1="50" x2="226" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="0.7" stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      <ellipse cx="128" cy="225" rx="95" ry="16" fill="#0F172A" fillOpacity="0.4" />

      {/* Gabinete Principal */}
      <rect x="36" y="60" width="184" height="145" rx="12" fill="url(#laserBody)" stroke="#475569" strokeWidth="2" />

      {/* Ventana de Protección Acrílica Naranja */}
      <rect x="56" y="80" width="144" height="85" rx="8" fill="#F97316" fillOpacity="0.4" stroke="#F97316" strokeWidth="2" />

      {/* Cama de Nido de Abeja (Honeycomb) */}
      <rect x="66" y="130" width="124" height="30" rx="4" fill="#0F172A" stroke="#64748B" strokeWidth="1" />

      {/* Cabezal Láser con Rayo Incandescente */}
      <rect x="116" y="90" width="24" height="24" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
      {/* Rayo Láser Rojo */}
      <line x1="128" y1="114" x2="128" y2="145" stroke="#EF4444" strokeWidth="3" />
      {/* Punto de chispa incandescente */}
      <circle cx="128" cy="145" r="4" fill="#FDE047" />
      <circle cx="128" cy="145" r="8" fill="#EF4444" fillOpacity="0.5" />

      {/* Panel de Control Ruida / Display Digital */}
      <rect x="180" y="68" width="30" height="24" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
      <circle cx="195" cy="80" r="4" fill="#10B981" />
    </svg>
  );
}

export function IlustracionCaldera({ className = "w-64 h-64" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boilerInox" x1="50" y1="80" x2="160" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="0.5" stopColor="#CBD5E1" />
          <stop offset="1" stopColor="#64748B" />
        </linearGradient>
      </defs>

      <ellipse cx="128" cy="225" rx="85" ry="16" fill="#0F172A" fillOpacity="0.4" />

      {/* Tanque de Presión Inox Silver Star */}
      <rect x="50" y="95" width="100" height="110" rx="16" fill="url(#boilerInox)" stroke="#94A3B8" strokeWidth="2" />
      
      {/* Tapón de Seguridad Válvula */}
      <rect x="85" y="75" width="30" height="20" rx="6" fill="#D97706" stroke="#B45309" strokeWidth="2" />

      {/* Manómetro de Presión (Bar) */}
      <circle cx="100" cy="125" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      <path d="M88 125 A 12 12 0 0 1 112 125" stroke="#10B981" strokeWidth="3" fill="none" />
      <line x1="100" y1="125" x2="108" y2="117" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />

      {/* Manguera de Vapor con Funda Térmica */}
      <path d="M140 110 C 180 110, 160 160, 180 170" stroke="#F97316" strokeWidth="8" strokeLinecap="round" fill="none" />

      {/* Plancha de Vapor Industrial */}
      <g>
        <path d="M175 165 L 225 165 C 230 165, 235 170, 230 180 L 210 195 L 175 195 Z" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        <path d="M175 195 L 215 195" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" /> {/* Suela teflonada */}
        <path d="M185 165 C 185 145, 215 145, 215 165" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" fill="none" /> {/* Mango */}
      </g>

      {/* Nubes de Vapor Caliente */}
      <ellipse cx="230" cy="155" rx="14" ry="10" fill="#E0F2FE" fillOpacity="0.7" />
      <ellipse cx="242" cy="142" rx="10" ry="8" fill="#E0F2FE" fillOpacity="0.5" />
    </svg>
  );
}

/**
 * Selector Universal de Ilustración según el ID o nombre del equipo
 */
export default function IlustracionEquipo({ equipoId = '', nombre = '', className = "w-64 h-64" }) {
  const q = (equipoId + ' ' + nombre).toLowerCase();

  if (q.includes('minisplit') || q.includes('clima') || q.includes('aire')) {
    return <IlustracionMinisplit className={className} />;
  }
  if (q.includes('tpv') || q.includes('pos') || q.includes('pantalla') || q.includes('computadora')) {
    return <IlustracionTPVPOS className={className} />;
  }
  if (q.includes('xerox') || q.includes('impresora') || q.includes('fotocopiadora')) {
    return <IlustracionXerox className={className} />;
  }
  if (q.includes('crepera') || q.includes('marquesitera')) {
    return <IlustracionCrepera className={className} />;
  }
  if (q.includes('bordadora') || q.includes('tajima')) {
    return <IlustracionBordadora className={className} />;
  }
  if (q.includes('overlock') || q.includes('recta') || q.includes('juki') || q.includes('coser')) {
    return <IlustracionMaquinaCostura className={className} />;
  }
  if (q.includes('sublimacion') || q.includes('plancha termica') || q.includes('40x60')) {
    return <IlustracionPlanchaSublimacion className={className} />;
  }
  if (q.includes('laser') || q.includes('láser')) {
    return <IlustracionLaserCO2 className={className} />;
  }
  if (q.includes('caldera') || q.includes('silver star') || q.includes('vapor')) {
    return <IlustracionCaldera className={className} />;
  }

  // Ilustración Genérica Moderna con Gráficos Vectoriales
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="genericGlow" cx="128" cy="128" r="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="90" fill="url(#genericGlow)" />
      <rect x="56" y="56" width="144" height="144" rx="28" fill="#1E293B" stroke="#38BDF8" strokeWidth="3" />
      <path d="M128 85 L 145 120 L 125 120 L 138 165 L 105 130 L 125 130 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
