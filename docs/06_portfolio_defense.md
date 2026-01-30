# FASE 6: Estrategia de Portfolio y Defensa Técnica

**Autor:** Tech Lead Mentor
**Fecha:** 2026-01-12
**Estado:** Final

---

## 1. El "Pitch" de 30 Segundos
*"SmartCommerce B2B es una plataforma SaaS diseñada para resolver la complejidad del e-commerce mayorista usando IA de forma pragmática. A diferencia de un chatbot genérico, implementé una arquitectura RAG segura que interactúa con datos reales del ERP del tenant, manteniendo aislamiento estricto y trazabilidad de cada decisión que toma la IA."*

## 2. Artefactos de Presentación (GitHub)

### A. README.md "De Libro"
No basta con `npm install`. Debe vender el proyecto.
1.  **Banner Visual:** Diagrama C4 simplificado.
2.  **Architecture Highlights:**
    *   "Modular Monolith (Spring Modulith ready)".
    *   "Multi-tenancy via Discriminator & RLS".
    *   "AI-Native (pgvector + RAG Audit)".
3.  **Demo Access:** Link a video de YouTube (Loom) de 3 minutos. *Nadie clona repos, todos ven videos.*

### B. El Video Demo (Guion)
*   **0:00 - 0:45:** Problema de negocio (mostrando Dashboard B2B con KPIs).
*   **0:45 - 1:30:** Complejidad Técnica (Precios por volumen, mostrar JSON de respuesta).
*   **1:30 - 2:30:** Factor Wow (Asistente IA sugiriendo restock basado en historial). Enfatizar "Miren las citas, son datos reales".
*   **2:30 - 3:00:** Código (mostrar una Query con RLS o el `@Tool` de Java).

## 3. Defensa Técnica: Preguntas "Killer" y Respuestas

### Q1: "¿Por qué Monolito y no Microservicios?"
**Respuesta Senior:** *"Para un equipo pequeño (yo) y <10k RPM, la complejidad distribuida resta velocidad. Preferí un monolito modular bien estructurado. Si un dominio como 'Sales' escala, puedo extraerlo fácilmente porque los límites de paquetes son estrictos."*

### Q2: "¿Cómo evitas que la IA alucine precios?"
**Respuesta Senior:** *"No dejo que la IA 'sepa' precios. Uso Tool Calling. El LLM decide 'Necesito el precio del producto X', mi código Java ejecuta la query validada y le entrega el dato. El LLM solo formatea. Además, cada respuesta incluye IDs de fuente para auditoría."*

### Q3: "¿Es seguro pgvector en la misma DB?"
**Respuesta Senior:** *"Sí, y es mejor para B2B. Me permite transacciones ACID: si borro un producto, su embedding se borra en el mismo commit. No tengo problemas de consistencia eventual como tendría sincronizando con Pinecone."*

### Q4: "¿Cómo manejas el aislamiento de Tenants?"
**Respuesta Senior:** *"Defensa en profundidad: 1) Subdominios para routing, 2) Hibernate Filters para conveniencia dev, y 3) Postgres Row Level Security (RLS) como red de seguridad final."*

## 4. Próximos Pasos (Bootstrapping)
Para empezar **HOY**:
1.  `spring init --dependencies=web,data-jpa,security,docker-compose,postgresql`
2.  Crear `docker-compose.yml` con Postgres 16 + pgvector image.
3.  Implementar `TenantContext` filter.

---
**PROYECTO LISTO PARA INICIO.**
¡Mucho éxito en la construcción!
