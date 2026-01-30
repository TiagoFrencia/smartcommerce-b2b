# Architecture Design Records (ADR)

Este documento registra las decisiones técnicas importantes y su contexto.

## ADR-001: Estructura del Proyecto
*   **Fecha:** 2026-01-12
*   **Decisión:** Monorepo con carpetas separadas para `backend`, `frontend-store`, `frontend-admin` y `docs`.
*   **Contexto:** Necesitamos gestionar múltiples interfaces y un backend monolítico modular. Mantener todo junto facilita la sincronización de versiones en esta etapa inicial.

## ADR-002: Base de Datos & AI
*   **Fecha:** 2026-01-12
*   **Decisión:** PostgreSQL único con esquema `ai_vectors` y extensión `pgvector`.
*   **Razón:** Mantener consistencia transaccional (ACID) entre datos de producto y sus vectores. Evita la complejidad de sincronizar una DB vectorial externa (Pinecone/Milvus) con la DB relacional.

## ADR-003: Frontend Stack
*   **Fecha:** 2026-01-12
*   **Decisión:** React + Vite + TypeScript + Material UI (MUI).
*   **Razón:** MUI ofrece componentes robustos para aplicaciones B2B ricas en datos (Grillas, Tablas, Dashboards). Se descarta Tailwind por preferencia explícita del equipo (User constraint).

## ADR-004: Frontend Split
*   **Fecha:** 2026-01-12
*   **Decisión:** Separar `frontend-admin` y `frontend-store`.
*   **Razón:** Ciclos de vida, requisitos de seguridad y perfiles de usuario completamente distintos. Permite optimizar el bundle de cada aplicación por separado.
