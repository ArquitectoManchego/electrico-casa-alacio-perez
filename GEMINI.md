# Reglas y Preferencias del Proyecto (ELECTRICO CASA ALACIO PEREZ)

## 🚨 REGLA OBLIGATORIA: DESPLIEGUE CONTINUO Y LINK DE VERCEL (GIT PUSH AL FINAL)
- **SIEMPRE que se realice cualquier modificación de código, corrección de errores, mejora visual o actualización de componentes, es ESTRICTAMENTE OBLIGATORIO realizar `git push origin main` al término de las tareas.**
- **Motivo:** El usuario valida y prueba los cambios directamente en el despliegue de **Vercel** (`https://electrico-casa-alacio-perez.vercel.app/`), el cual se sincroniza y compila de forma continua desde el repositorio remoto en GitHub (`https://github.com/ArquitectoManchego/electrico-casa-alacio-perez`).
- **Flujo de Cierre Obligatorio:**
  1. Validar que la compilación de producción sea exitosa (`npm run build`).
  2. Ejecutar `git add .` (o añadir los archivos modificados).
  3. Ejecutar `git commit -m "<tipo>(<alcance>): <descripción clara del cambio>"`.
  4. Ejecutar `git push origin main`.
  5. **MANDATORIO:** Mostrar siempre en la respuesta final el enlace directo a la página de Vercel:
     👉 [https://electrico-casa-alacio-perez.vercel.app/](https://electrico-casa-alacio-perez.vercel.app/)
     para que el usuario pueda entrar y probar los cambios de inmediato con un solo clic.

---

## ⚡ Preservación Normativa y Arquitectura Eléctrica
- **NOM-001-SEDE-2012 & Dictamen UVIE:** Mantener la coherencia de cálculo en alimentadores, caída de tensión ($\le 3.0\%$ derivados, $\le 5.0\%$ total), protecciones termomagnéticas y calibres de conductores THHN/THW-2.
- **Balanceo por Medidor Independiente:** El desbalance UVIE entre fases debe mantenerse $\le 5.0\%$ en cada medidor que disponga de 2 o más fases operativas.
- **Consorcio Gallegos González:** Soportar la arquitectura multi-medidor independiente para los negocios del consorcio (`Imperia Uniformes`, `Papelería ImperiArte`, `Hawaiian Paradise Universidades`, `Bordados Veracruz`, `Taller de Costura Imperia`, `Publi-Imperia`, `Oficinas Consorcio`, `Servicios Comunes`).
- **Separación Medidor vs Local:** Los aparatos pueden reasignarse de `medidorId` y de `local` de forma totalmente independiente. En los reportes PDF de cuadros de carga no se muestran las columnas de medidor ni local, pero sí en los cuadros interactivos de la aplicación web.
- **Modos de Interfaz:** Mantener la dualidad entre el **Modo Avanzado** (ingeniería eléctrica completa, tablas de cargas, ciclo de vida, memorias de cálculo, UVIE) y el **Modo Sencillo** (vista intuitiva guiada con gráficos estilo videojuego, medidores visuales CFE y fajos de billetes para la empresaria).
