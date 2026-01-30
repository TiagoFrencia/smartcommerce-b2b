# Setup Guide

## Requisitos Previos
1.  **Docker Desktop** instalado y corriendo.
2.  **Java 21 JDK** (se recomienda usar SDKMAN!).
3.  **Node.js 20** (vía NVM).

## Inicialización del Entorno

### 1. Base de Datos
Levantar la infraestructura local:
```bash
docker-compose up -d
```
Esto iniciará PostgreSQL en el puerto `5432` y ejecutará los scripts de `/scripts/init-db`.

**Verificación:**
Accede a la base de datos (clave: `password`) y verifica que los schemas existan:
```sql
SELECT schema_name FROM information_schema.schemata;
-- Debes ver: public, ai_vectors, analytics, audit (además de los de sistema)
```

### 2. Backend
(Próximamente: Instrucciones para Spring Boot)

### 3. Frontend
(Próximamente: Instrucciones para React/Vite)
