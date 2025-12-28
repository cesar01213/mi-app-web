---
description: Protocolo de Desarrollo Seguro - Tambo Manager
---

# 🛡️ Protocolo de Desarrollo Seguro (Anti-Regresión)

Para garantizar que la aplicación se mantenga estable y funcional, se han establecido las siguientes reglas de oro para cualquier modificación futura:

## 1. Regla de "Informar y Consultar"
- **NUNCA** modificar un archivo sin antes explicar exactamente qué líneas se tocarán y por qué.
- **SIEMPRE** pedir aprobación explícita al usuario antes de ejecutar un cambio (`replace_file_content` o `write_to_file`).
- Si una mejora requiere cambiar la arquitectura del `StoreContext`, se debe presentar un diagrama o explicación de impacto antes de proceder.

## 2. Protección de la "Ficha Digital"
- El modelo de datos definido en `types/index.ts` versión 2.8 es el **Estándar de Oro**.
- Cualquier campo nuevo debe ser aditivo, nunca destructivo de los campos existentes (`rp`, `id`, `ultimoParto`, etc.).

## 3. Verificación Recreativa
- Después de cada cambio, se debe verificar que las funciones de:
    - Carga Masiva IA
    - Monitor Sanitario (Al Tacho)
    - Cálculos de DEL y FPP
    ... sigan funcionando exactamente igual que en la v2.8 estable.

## 4. Documentación de Versión
- Cada mejora debe ser registrada con un número de versión menor (ej: 2.8.1) en el `README.md` y en el header del Dashboard.
