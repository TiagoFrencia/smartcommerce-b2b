# FASE 1: Definición de Negocio y Validación de IA

**Autor:** Equipo de Arquitectura & Producto (Simulado)
**Fecha:** 2026-01-12
**Estado:** Propuesta Inicial

---

## 1. El Problema B2B (vs B2C)
Para que este proyecto destaque en un portfolio, debemos demostrar que entendemos la diferencia fundamental: **El B2B es relacional y racional, no emocional.**

### Diferenciadores Clave para el Sistema:
1.  **Complejidad de Precios:** No hay "un precio para todos". Hay listas de precios por cliente, descuentos por volumen y acuerdos negociados.
2.  **Recurrencia:** La mayoría de los pedidos son re-abastecimiento (re-stock). La facilidad para "repetir pedido anterior" es crítica.
3.  **Roles Múltiples:** En una PyME cliente puede haber un "Comprador" (crea el pedido) y un "Aprobador" (autoriza el gasto).
4.  **Riesgo de Churn:** Perder un cliente B2B es mucho más costoso que en B2C.

## 2. Validación de Casos de Uso de IA (The "Why")
La IA no debe ser un "wrapper" de ChatGPT. Debe resolver fricciones específicas del B2B.

### A. Asistente Comercial Inteligente (RAG + Lenguaje Natural)
*   **Problema:** Los representantes de ventas pierden horas buscando en el ERP: "¿Cuál fue el último precio que le dimos a Ferretería Gómez por los taladros Bosch?" o "¿Tienen facturas vencidas?".
*   **Solución (IA):** Un chat para el Sales/Admin que consulta la DB del tenant.
*   **Ejemplo Realista:** "Muéstrame los clientes que no han comprado en los últimos 30 días pero compraban mensualmente antes." (Esto requiere SQL generation o RAG sobre reportes).

### B. Recomendaciones Contextuales B2B
*   **Problema:** Los catálogos son inmensos y técnicos.
*   **Solución (IA):**
    1.  **Sustitución Inteligente:** "El producto A está agotado. Basado en especificaciones técnicas (embeddings), el Producto B es 95% similar".
    2.  **Cross-sell Preventivo:** "Estás pidiendo 50 laptops, pero no has añadido los docks stations que sueles comprar".

### C. Insights de Clientes (Churn Prediction simplificado)
*   **Problema:** El dueño de la PyME no analiza datos hasta que es tarde.
*   **Solución (IA):** Análisis de tendencias simples. "Alerta: El Cliente X ha bajado su frecuencia de compra un 20% este trimestre."

## 3. Estrategia de Portfolio
Para defender esto en una entrevista senior:
*   **No mostrar solo el código:** Mostrar *por qué* se tomó la decisión.
*   **Evitar la IA "Alucinada":** Restringir la IA estrictamente a los datos del tenant (RAG estricto).
*   **Seguridad:** Enfatizar que los datos del Tenant A nunca se usan para entrenar o responder al Tenant B.

## 4. Conclusión de Fase 1
El equipo técnico valida que este enfoque es viable con Stack Java/Spring + React + OpenAI.
El "Factor Wow" vendrá de la integración fluida de estos insights en el dashboard operativo, no de tener un chatbot flotante molesto.

---
**¿Aprobado para proceder a FASE 2 (Arquitectura)?**
