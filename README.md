# SmartCommerce B2B - Intelligent Sales Platform

![Java 21](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Spring Boot 3.2](https://img.shields.io/badge/Spring_Boot-3.2-green?style=for-the-badge&logo=spring-boot)
![React 18](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Gemini AI](https://img.shields.io/badge/AI-Gemini_Pro-8E75B2?style=for-the-badge&logo=google-gemini)

> **Plataforma de inteligencia comercial B2B potenciada por IA Generativa.**

![Dashboard Preview](assets/dashboard-DarkMode.png)

## 📖 Descripción

**SmartCommerce B2B** es una solución empresarial diseñada para optimizar procesos comerciales complejos. A diferencia de un CRM tradicional, utiliza **Inteligencia Artificial (Google Gemini)** para analizar historiales de venta y sugerir estrategias activas de *Cross-selling* y *Upselling*.

Incluye un **Asistente Virtual RAG** (Retrieval-Augmented Generation) que permite a los vendedores "chatear" con sus datos para obtener insights instantáneos.

## 🚀 Características Clave

* 🤖 **IA Generativa & RAG:** Asistente inteligente para consultas en lenguaje natural sobre datos del negocio.
* 📧 **Redacción Automática:** Generación de correos de venta contextuales listos para enviar.
* 🏢 **Arquitectura Multi-tenant:** Aislamiento lógico de datos por organización/vendedor.
* 📊 **Dashboard Interactivo:** Visualización de KPIs con gráficos dinámicos y **Modo Oscuro** nativo.
* 🛡️ **Seguridad:** Autenticación robusta vía Spring Security + JWT.

## 📸 Galería del Proyecto

| **Login Seguro** | **Dashboard General** |
|:---:|:---:|
| ![Login](assets/Login.png) | ![Dashboard](assets/dashboard-1.png) |

| **Asistente IA (Chat)** | **Redacción de Correos** |
|:---:|:---:|
| ![Chat Asistente](assets/chatAsistente.png) | ![Redacción](assets/RedaccionDeCorreo.png) |

| **Documentación API** | **Gestión de Datos** |
|:---:|:---:|
| ![Swagger](assets/swagger-1.png) | ![Data Grid](assets/dashboard-3.png) |

## 🛠️ Stack Tecnológico

* **Backend:** Java 21, Spring Boot 3.2, Spring Cloud OpenFeign.
* **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts.
* **Datos:** PostgreSQL 16, Flyway Migration.
* **IA:** Google Gemini Pro API.
* **DevOps:** Docker Ready, Maven.

## 💻 Instalación Local

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/TiagoFrencia/smartcommerce-b2b.git](https://github.com/TiagoFrencia/smartcommerce-b2b.git)
    ```

2.  **Configuración Backend:**
    * Navega a `backend/src/main/resources/`.
    * Renombra `application.properties.example` a `application.properties`.
    * Agrega tu `GEMINI_API_KEY` y credenciales de PostgreSQL.

3.  **Iniciar Backend:**
    ```bash
    ./mvnw spring-boot:run
    ```

4.  **Iniciar Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---
**Autor:** Tiago Frencia
[![GitHub]](https://github.com/TiagoFrencia)
[![LinkedIn](https://www.linkedin.com/in/tiagofrencia/)]