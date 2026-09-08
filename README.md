# SGE-México: Suite de Ingeniería Eléctrica — Casa Alacio Pérez / Consorcio Gallegos González

Sistema integral de ingeniería y cálculo de instalaciones eléctricas conforme a la **NOM-001-SEDE** y lineamientos de **CFE (Comisión Federal de Electricidad)** para el inmueble multi-negocio de la Familia Alacio Pérez y Consorcio Gallegos González.

---

## 7 Unidades de Negocio Modeladas

1. **Imperia Uniformes**: Showroom comercial, terminal punto de cobro, sistema CCTV de 16 cámaras (24h) y Minisplit Inverter 1 TR (4x4 m).
2. **Papelería ImperiArte**: Computadora All-In-One (AIO TPV 21.5") y Minisplit Inverter 1 TR (2x6 m).
3. **Hawaiian Paradise Universidades**: Cafetería y snacks (licuadora Ninja 1200W, máquina raspados 600W, crepera profesional 1500W, olla calentadora de esquites 1200W, cafetera espresso, refrigerador y congeladora 11 ft³).
4. **Bordados Veracruz**: Bordadora industrial 4 cabezas 110V (1500W), bordadora industrial 4 cabezas 220V (1800W) y 2 bordadoras Brother.
5. **Taller de Costura Imperia**: 2 máquinas rectas industriales (1100W), overlock 5 hilos, collaretera 5 hilos, cortadora de disco y plancha de vapor con caldera (1600W).
6. **Artículos Promocionales Publi-Imperia**: Planchas de sublimación plana (30x30 y manual 10cm), cortadora de vinil ScanNCut, grabadora láser 20W, impresora Epson L310, estación de diseño gráfico i7/GPU, pistola de calor 1500W y mesa de revelado de serigrafía 8 tubos.
7. **Oficinas Consorcio Gallegos González**: Estación directiva, Minisplit 1 TR (4x4 m), TV de juntas 42" y módem WiFi 24h.
- **Servicios Generales**: Bomba presurizadora de 1 HP y circuitos GFCI en áreas de servicio.

---

## Características Principales

1. **Diagrama Unifilar CAD Interactivo**:
   - Visor vectorial SVG con navegación CAD (pan & zoom dinámico).
   - Modal de impresión técnica estilo AutoCAD con configuración de formato de papel, escalas y límites de visualización.
   - Detalle de acometida CFE trifásica 3F-1N 220V/127V, medidor, alimentador general (conductores #2 AWG), interruptor general 3x100A y circuitos derivados.
2. **Cuadro de Cargas Oficial UVIE (16 Columnas)**:
   - Cálculos normativos automatizados: Corriente nominal, factor continuo (125%), capacidad interruptiva mínima (KAIC), ampacidad térmica y calibres AWG para fase, neutro y tierra.
   - Cálculo de caída de tensión porcentual ($\Delta V\% \le 3\%$ en derivados y $\le 5\%$ total).
   - Conmutador de unidades en tiempo real (VA, Watts y Amperes).
   - Exportación directa a CSV compatible con **AutoCAD Data Link** e impresión apaisada.
3. **Tablero Físico Visual**:
   - Representación en rack emulando centros de carga tipo Square D NQ / QO con barras colectoras trifásicas A, B y C.
4. **Balanceador de Fases Inteligente (IA + Greedy)**:
   - Distribución matemática voraz multi-fase para garantizar desbalanceo $\le 5\%$.
   - Asistencia por IA (**Google Gemini 2.5**) con prompt especializado en aislamiento de ruidos inductivos (motores de costura vs equipo de cómputo y CCTV).
5. **Simulador Financiero CFE**:
   - Desglose por escalones tarifarios, simulación de costos y análisis preventivo.
6. **Simulador de Hábitos y Políticas de Eficiencia**:
   - Ecualizador de ocupación 24 horas y políticas de optimización de demanda.

---

## Comandos con PNPM

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo en http://localhost:3025
pnpm run dev

# Compilar para producción
pnpm run build

# Previsualizar compilación de producción
pnpm run preview
```

---

## Variables de Entorno (.env)

El archivo `.env` permite configurar Firebase Firestore y Google Gemini:
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.
- `VITE_GEMINI_API_KEY`: Clave de API para el balanceador de fases asistido por Gemini AI.
