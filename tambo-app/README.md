# 🐄 Tambo Manager v2.8 [ESTABLE]

Sistema avanzado de gestión bovina digital (PWA) diseñado para la optimización de rodeos lecheros.

## Status: 🟢 VERSIÓN GOLD ESTABLE
Esta versión contiene la **Ficha Digital Completa**, Monitor Sanitario Activo, Carga Masiva IA y Cálculos Reproductivos Automáticos. Todo el núcleo de datos está verificado y funcionando según requerimientos técnicos.

## 🛡️ Protocolo de Seguridad (LEER ANTES DE MODIFICAR)
Para cualquier futura actualización o mejora, el desarrollador (IA o humano) **DEBE** seguir estos pasos:
1. **Analizar**: Revisar los archivos actuales sin modificarlos.
2. **Informar**: Listar exactamente qué archivos y qué líneas se piensan tocar.
3. **Preguntar**: Solicitar aprobación explícita al usuario.
4. **Respetar**: No modificar la estructura del `StoreContext` ni de la `Ficha Digital` sin permiso, ya que son el motor principal que hoy funciona bien.

*Ubicación del protocolo completo:* `.agent/workflows/development_protocol.md`

---
## Características v2.8
- **Ficha Digital:** Tapa (ID/RP/Genética), Repro (DEL/Días Abiertos), Clínica (Historial), Producción (Control Lechero).
- **Monitor Sanitario:** Automatización de bloqueos "Al Tacho" con visualización dinámica.
- **Carga Masiva:** Importación por texto/lista para evitar carga manual.
- **Inteligencia:** Cálculo de FPP, tactos y sugerencias de semen por raza.
