# FASE 2: Diseño de Arquitectura y Stack Tecnológico

**Autor:** CTO / Arquitecto de Software (Simulado)
**Fecha:** 2026-01-12
**Estado:** Definición Técnica (Refinado v2)

---

## 1. Visión General: Modular Monolith
**Decisión:** Optamos por un **Monolito Modular** en lugar de Microservicios.
**Justificación (Defensa en Entrevista):**
1.  **Complejidad Operativa:** Microservicios añaden overhead de despliegue, red y latencia que no aportan valor bajo 100k RPM.
2.  **Consistencia Transaccional (ACID):** El comercio B2B requiere consistencia fuerte en inventarios y cuentas corrientes. Un monolito con una única DB física simplifica drásticamente esto.
3.  **Refactorización:** Definir límites lógicos (Java Packages) es el paso previo obligatorio a la distribución física. Si no podemos modularizar en un repo, menos podremos en red.

## 2. Diagrama C4: Contenedores

```mermaid
graph TD
    User(Cliente B2B / Admin) -->|HTTPS / Subdominio| LB[Load Balancer / Nginx]
    LB -->|API REST| Backend[Spring Boot Core Application]
    
    subgraph "SmartCommerce Core (Monolith)"
        Backend -->|JDBC / JPA| DB[(PostgreSQL Cluster)]
        
        subgraph "Single Database Instance"
            DB -.-> Public[Schema: public (Tenants, Sales)]
            DB -.-> AI[Schema: ai_vectors (pgvector)]
            DB -.-> Audit[Schema: audit (Logs)]
        end

        Backend -->|REST / Client| OpenAI[OpenAI API]
    end

    subgraph "Frontend Apps"
        Store[B2B Storefront (React)] --> LB
        Admin[Admin Dashboard (React)] --> LB
    end
```

## 3. Estrategia Multi-tenant (Seguridad B2B)
La seguridad entre clientes es la prioridad #1. Un leak de precios entre empresas competidoras destruye el negocio.

### A. Resolución del Tenant (Subdominio + JWT)
*   **Estrategia:** El tenant se identifica por el subdominio (ej: `empresa1.smartcommerce.com`).
*   **Defensa:**
    *   **Interceptor:** Antes de cualquier lógica, un filtro valida que el `tenant_id` en el JWT coincida con el subdominio de la URL.
    *   **Prevención:** Esto evita que un usuario con token válido de `Empresa A` llame a la API de `Empresa B` manipulando headers.

### B. Aislamiento de Datos (Discriminator + RLS)
*   **Nivel Aplicación:** Hibernate `@Filter` inyecta automáticamente `WHERE tenant_id = X` en todas las queries.
*   **Nivel Base de Datos (Defense in Depth):** Implementaremos **Row Level Security (RLS)** de PostgreSQL al menos en tablas críticas (`Orders`, `Customers`).
    *   *Por qué:* Si el desarrollador olvida el filtro de Hibernate, la DB rechaza la query. Esto demuestra "Seniority" en seguridad.

## 4. Estructura de Módulos y Contratos
El código se organiza por Dominios de Negocio.

```text
src/main/java/com/smartcommerce/
├── kernel/          (Shared kernel: Money, TenantContext, AuditLog)
├── iam/             
├── catalog/         (Impl: Entities, Repositories, Logic)
│   └── api/         (Public Contract: Interfaces, DTOs, Events)
├── sales/
│   └── api/         
├── ai_engine/       (RAG Service, Prompts)
└── infrastructure/  (Security Config, Swagger, Postgres config)
```

**Regla de Comunicación:**
*   Los módulos **NO** pueden importar clases internas de otros módulos.
*   SOLO pueden depender de los sub-paquetes `api` (Contracts).
*   Esto desacopla implementaciones y facilita testing o futura extracción.

## 5. Módulo de IA: Guardrails y Auditoría
La IA no es una "caja negra" ni un administrador de base de datos.

### A. Principio de Mínimo Privilegio (No SQL Generation)
*   **Restricción:** El LLM **NUNCA** tiene permiso de generar SQL arbitrario (`DELETE FROM users`).
*   **Implementación:** Usamos **Tool Calling** (Function Calling).
    *   La IA decide *qué* herramienta usar (ej: `getPurchases(userId, dateRange)`).
    *   El código Java ejecuta la query segura y optimizada.
    *   La IA recibe el JSON resultante para formular la respuesta en lenguaje natural.

### B. Auditoría Mandatoria (Compliance)
Todo uso de IA debe quedar registrado en `Schema: audit`.
1.  **Input:** El prompt exacto enviado y datos de contexto.
2.  **Tools:** Qué herramientas invocó el modelo.
3.  **Output:** La respuesta generada.
4.  **Meta:** Latencia, Tokens usados y Costo estimado.

## 6. Stack Tecnológico Detallado (Ajustado)

| Capa | Tecnología | Justificación B2B |
| :--- | :--- | :--- |
| **Backend** | Java 21 + Spring Boot 3.2 | Virtual Threads para alta concurrencia I/O (IA calls). |
| **Database** | **Single PostgreSQL 16** | Gestión unificada. Schemas dedicados para `audit` y `vectors`. |
| **Vector Search** | **Extension pgvector** | Evita latencia de red y complejidad de ETL hacia Pinecone/Milvus. Simplifica la transacción (guardar producto + embedding). |
| **Frontend** | React + Vite + Typescript | Tipado estático es crucial para modelos de datos complejos B2B. |
| **AI Orchestration** | Spring AI | Abstracción limpia para manejar Tool Calling y RAG. |

---
**Siguiente Paso:** Aprobar FASE 2 y comenzar **FASE 3: Diseño del Modelo de Datos**.
