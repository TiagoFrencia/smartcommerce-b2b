# FASE 3: Diseño del Modelo de Datos (Multi-tenant B2B + AI Ready)

**Autor:** Backend Lead & Data Architect (Simulado)
**Fecha:** 2026-01-12
**Estado:** Diseño de Esquema

---

## 1. Principios de Diseño
Para este portfolio, el modelo de datos demuestra **madurez** al equilibrar normalización con performance para IA y seguridad.
1.  **Isolation First:** `tenant_id` (UUID) es obligatorio y parte de la Primary Key compuesta en tablas masivas (Partitioning key futura).
2.  **Auditabilidad:** Campos `created_at`, `updated_at`, `created_by` en todas las tablas transaccionales.
3.  **Vector-Native:** Los embeddings viven junto a los datos, no en un silo.

## 2. Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    %% Core IAM
    TENANTS ||--o{ USERS : "has"
    USERS }o--o{ ROLES : "has"

    %% Catalog & Pricing
    TENANTS ||--o{ PRODUCTS : "catalog"
    PRODUCTS }o--|| CATEGORIES : "belongs_to_one"
    TENANTS ||--o{ PRICE_LISTS : "defines"
    PRICE_LISTS ||--o{ PRICE_LIST_ITEMS : "contains"
    PRODUCTS ||--o{ PRICE_LIST_ITEMS : "priced_in"

    %% B2B Customers
    TENANTS ||--o{ CUSTOMERS : "manages"
    CUSTOMERS ||--o{ USERS : "contacts"
    CUSTOMERS }o--|| PRICE_LISTS : "has_default_list"

    %% Sales
    CUSTOMERS ||--o{ ORDERS : "places"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "refers"

    %% AI & Tracking
    PRODUCTS ||--o|| PRODUCT_EMBEDDINGS : "has_vector"
    TENANTS ||--o{ AI_AUDIT_LOGS : "logs"
    TENANTS ||--o{ CUSTOMER_EVENTS : "tracks"
```

## 3. Definición de Esquemas (Tablas Clave)

### A. Schema: `public` (Transactional Core)

#### 1. `tenants`
La raíz de todo aislamiento.
*   `id` (UUID, PK)
*   `name` (String)
*   `subdomain` (String, Unique) -> Clave para la resolución en runtime.
*   `settings` (JSONB) -> Configuración flexible (logo, colores, features habilitadas).

#### 2. `products` (Catálogo Maestro)
*   `tenant_id` (UUID, PK)
*   `id` (UUID, PK)
*   `sku` (String) -> Código interno B2B.
*   `category_id` (FK) -> 1:N Relación.
*   `name`, `description` (Text)
*   `is_active` (Boolean)
*   **Constraints:**
    *   PK: `(tenant_id, id)`
    *   Unique: `(tenant_id, sku)`

#### 3. `price_lists` & `price_list_items`
*   `price_lists`: `id`, `tenant_id`, `name`, `currency`.
*   `price_list_items`:
    *   `tenant_id` (FK)
    *   `price_list_id` (FK)
    *   `product_id` (FK)
    *   `price` (Decimal/Money)
    *   `min_quantity` (Int)
    *   **Constraint:** Unique `(tenant_id, price_list_id, product_id, min_quantity)` (Tiered Pricing).

#### 4. `customers` (Empresas Clientes)
*   `tenant_id`, `id`
*   `tax_id` (CUIT/RUT/VAT)
*   `company_name`
*   `credit_limit` (Decimal)
*   `price_list_id` (FK) -> Lista activa default.
*   **Constraint:** Unique `(tenant_id, tax_id)`

#### 5. `orders` & `order_items`
*   `orders`: `tenant_id`, `id`, `customer_id`, `total_amount`, `status`.
*   `order_items`:
    *   `order_id`, `product_id`
    *   `quantity`
    *   **Price Snapshot:** `unit_price`, `currency`, `discount_applied`, `tax_rate`.
    *   *Nota:* Crítico para auditoría fiscal. Si cambia la lista de precios mañana, la orden vieja NO cambia.

### B. Schema: `ai_vectors` (Antes ai_native)

#### 6. `product_embeddings`
*   `tenant_id` (FK), `product_id` (FK) -> **Composite PK** y FK hacia `products(tenant_id, id)`.
*   `embedding` (vector(1536))
*   `content_hash`
*   **Constraint:** PK `(tenant_id, product_id)` asegura 1 vector por producto.

### C. Schema: `analytics` (Event Sourcing Light & Audit)

#### 7. `customer_events` (Behavior Tracking)
*   `id` (BigSerial)
*   `tenant_id`, `customer_id`, `session_id`
*   `event_type`: `VIEW_PRODUCT`, `SEARCH`, `CART_ADD`, `CHECKOUT_STARTED`, `ORDER_PLACED`.
*   `payload` (JSONB)
*   `created_at` (Timestamp)
*   **Índices:**
    *   `idx_events_tenant_time` ON `(tenant_id, created_at DESC)` -> Para queries recientes.
    *   `idx_events_customer` ON `(tenant_id, customer_id)` -> Para perfilado de usuario.

#### 8. `ai_audit_logs` (Compliance y Debugging)
Crucial para defender que "controlamos la IA".
*   `id` (UUID)
*   `tenant_id`, `user_id`
*   `prompt_snapshot` (Text) -> Qué le enviamos al LLM.
*   `tools_executed` (JSONB) -> Qué funciones llamó (ej: `get_stock`, `search_products`).
*   `model_response` (Text)
*   `tokens_input`, `tokens_output` (Int)
*   `processing_time_ms` (Int)

## 4. Estrategia de Row Level Security (RLS) - "The Senior Touch"
**Reto:** HikariCP reusa conexiones, por lo que el usuario de DB es siempre el mismo (`app_user`).
**Solución:** Setear el tenant al inicio de cada transacción.

```sql
-- 1. Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Crear Policy
CREATE POLICY tenant_isolation_policy ON orders
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

**Implementación Java (Aspect/Interceptor):**
```java
// Al tomar conexión del pool
try (Connection conn = dataSource.getConnection()) {
    stmt.execute("SET LOCAL app.current_tenant = '" + tenantId + "'");
    // ejecutar negocio...
}
```
Esto garantiza que incluso si falla el `Where` de Hibernate, Postgres bloquea el acceso.

## 5. Trade-offs y Defensibilidad
*   **JSONB para Settings/Eventos:**
    *   *Pro:* Flexibilidad sin migraciones para datos no estructurados.
    *   *Contra:* Consultas complejas son más lentas (pero usaremos índices GIN si es necesario).
*   **Vectores en Postgres (pgvector) vs Pinecone:**
    *   *Defensa:* "Mantenemos la integridad transaccional. Si borro un producto, su vector desaparece en la misma transacción ACID. No hay 'eventual consistency' ni ETLs que fallen."
*   **Precios:** Modelo simplificado (Listas base + Items).
    *   *Defensa:* "Modelamos el 80% de los casos B2B (Listas + Volumen). Motores de reglas complejos (Drools) serían over-engineering para esta fase."

---
**¿Aprobado FASE 3?**
Siguiente paso: FASE 4 - Diseño del Módulo de IA.
