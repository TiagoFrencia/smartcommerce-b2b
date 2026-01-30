# FASE 5: Roadmap de Implementación (MVP + IA Phases)

**Autor:** Product Manager & Tech Lead
**Fecha:** 2026-01-12
**Estado:** Planificación

---

## Estrategia de Entrega: "Crawl, Walk, Run"
Para un portfolio, no sirve tener un sistema a medias. Es mejor tener un MVP sólido sin IA, y luego sumarle capas de inteligencia.

## Hito 1: MVP Transaccional Core (Weeks 1-3)
**Objetivo:** Tener un SaaS B2B funcional, seguro y con datos de prueba.

*   **Backend Core:**
    *   Setup Monolito, Postgres (Schema `public`).
    *   Auth (JWT) + Tenant Filter obligatorio + RBAC.
    *   **Tracking:** Eventos básicos (`VIEW_PRODUCT`, `SEARCH`, `CART_ADD`, `ORDER_PLACED`) en tabla `customer_events`.
    *   **Seed Data:** Script SQL/Java para poblar Tenants, Customers, Products y Orders (evita el "Empty State" en demos).
*   **Dominio:**
    *   ABM de Productos y Clientes.
    *   Creación de Order Básico (Precio base).
*   **Frontend:**
    *   Login, Dashboard con **KPIs Simples** (Ventas 7d/30d, Clientes Top, Productos Top).
    *   Catálogo con buscador simple (SQL `LIKE`).
    *   Checkout.

## Hito 1.5: Pricing Engine Avanzado (Week 3-4)
**Objetivo:** Demostrar dominio de lógica de negocio compleja (B2B real).
*   Implementación de `price_lists` y **Tiered Pricing** (precios por volumen).
*   Refactor de cálculo de carrito para soportar múltiples estrategias de precio.

## Hito 2: "IA Básica" - Embeddings & Recomendaciones (Weeks 4-5)
**Objetivo:** Agregar el primer valor "AI" sin complejidad de chat.

*   **Infra:** Habilitar `pgvector`, crear schema `ai_vectors`.
*   **Feature 1: Buscador Semántico:**
    *   Reemplazar `LIKE %keyword%` por Hybrid Search (Keyword + Vector).
    *   *Demo:* Buscar "algo para cortar madera" -> Muestra sierras (que no tienen la palabra "cortar" en el título).
*   **Feature 2: Productos Similares:**
    *   En Product Detail Page, mostrar "Alternativas".
*   **Data:** Generar productos sintéticos con descripciones ricas para probar.

## Hito 3: "IA Avanzada" - RAG & Asistente de Ventas (Weeks 6-8)
**Objetivo:** El "Wow Factor" del asistente conversacional grounded.

*   **Infra:** Integrar `Spring AI` + OpenAI. Implementar `AiPolicyService`.
*   **Feature 3: Chat RAG (Sales Assistant):**
    *   Implementar Tools (`getCustomerContext`, `searchOrders`).
    *   **UI:** Panel lateral que muestra **Fuentes/Citations** (IDs de pedidos, productos o eventos usados en la respuesta). Crucial para credibilidad.
*   **Feature 4: Auditoría & Métricas:**
    *   Dashboard para SuperAdmin que muestra logs de prompts y costos.
    *   *Defensa de Portfolio:* "Mira cómo controlo lo que gasta la IA".

## Hito 4: Analytics & Insights Batch (Bonus)
**Objetivo:** Mostrar manejo de procesos en background.

*   **Job Nocturno:**
    *   Calcular métricas de cliente (Recency, Frequency, Monetary).
    *   Detectar "Riesgo de Fuga" (Churn).
    *   Pre-calcular "Next Best Offer".

## Resumen para Entrevista
| Hito | Valor Demostrado a Empleador |
| :--- | :--- |
| **MVP** | Arquitectura limpia, Seguridad (JWT/RLS), Modelo de datos complejo. |
| **IA Sim** | Uso de vectores, pgvector, optimización de búsqueda. |
| **IA RAG** | Integración LLM segura (Tools, no SQL gen), Auditoría, Diseño de Producto. |

---
**¿Aprobado FASE 5?**
Siguiente paso: FASE 6 - Estrategia de Portfolio y Defensa Técnica.
