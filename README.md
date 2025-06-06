# 🛡️ Backend - Sistema de Monitoreo de Seguridad con Wazuh, OpenSearch y FastAPI

## 📌 Objetivo del backend

Este backend es parte de una solución de ciberseguridad para PYMEs. Tiene como objetivo proporcionar una API RESTful, desarrollada en Python con FastAPI, que permita:

* Consultar las alertas de seguridad generadas por Wazuh, indexadas en OpenSearch
* Administrar usuarios con roles diferenciados (administrador y operador)
* Integrarse con un frontend que visualizará los datos (dashboard)
* Enviar notificaciones por correo cuando ocurran eventos críticos

El backend será desplegado en una red interna y se comunicará con un servidor OpenSearch ya configurado, y una base de datos PostgreSQL.

## ⚙️ Tecnologías requeridas

* Python 3.11+
* FastAPI
* PostgreSQL (con SQLAlchemy)
* OpenSearch Python client
* Uvicorn
* JWT 
* SMTP (para envío de correos)

## 📂 Estructura de endpoints

### 🔐 Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Inicia sesión y devuelve un token JWT |
| POST | `/auth/register` | Crea un nuevo usuario (solo admin) |

### 👥 Gestión de usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/users/` | Lista de usuarios (solo admin) |
| GET | `/users/me` | Datos del usuario actual |
| PUT | `/users/{id}` | Editar usuario |
| DELETE | `/users/{id}` | Eliminar usuario (solo admin) |

### ⚠️ Alertas

Estas rutas interactúan con OpenSearch.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/alerts/` | Listado de alertas paginadas |
| GET | `/alerts/{id}` | Detalle de una alerta específica |
| GET | `/alerts/search` | Búsqueda filtrada por fecha, severidad, agente, etc. |
| GET | `/alerts/statistics` | Datos agregados (conteo por tipo, nivel, etc.) |

### 📊 Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard/overview` | Métricas clave: total de alertas, críticas hoy, etc. |
| GET | `/dashboard/top-agents` | Agentes con más alertas |
| GET | `/dashboard/last-alerts` | Últimas alertas generadas |

### 📧 Notificaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/alerts/notify` | Enviar manualmente una alerta por email |
| POST | `/settings/notifications` | Configurar correo de destino y condiciones de alerta |

## 📊 OpenSearch – Conexión esperada

* URL: `https://localhost:9200`
* Índices a consultar: `wazuh-alerts-*`
* Autenticación básica (admin/admin o personalizada)
* Formato esperado: JSON Wazuh alerts (alerts.json)

## 🗃️ PostgreSQL – Estructura esperada

Mínimo debe tener:
* Tabla `users` (id, username, hashed_password, role)
* Tabla `notification_settings` (correo, niveles críticos, frecuencia)

## 🔐 Roles de usuario

* **Administrador**: acceso total a todos los endpoints (alertas, usuarios, configuración)
* **Operador**: solo acceso de lectura a endpoints de consulta (/alerts, /dashboard), sin gestión de usuarios ni configuración

## 📤 Notificaciones por correo

El backend debe permitir el envío automático o manual de alertas críticas por correo, utilizando SMTP (configurable). Esto incluirá:

* Envío inmediato ante eventos críticos (ej: rule.level >= 10)
* Destinatario configurable por el admin
* Opción para reenviar una alerta puntual desde `/alerts/notify`

## 📈 MVP esperado

Para el MVP, se espera:

* Autenticación básica con JWT
* Consultas funcionales de alertas desde OpenSearch
* Dashboard con 2 o 3 métricas clave
* Envío de correos ante alertas críticas
* PostgreSQL operativo con modelo de usuario

## 🚫 Exclusiones del MVP

* No se requiere UI propia en el backend
* No se requiere configuración dinámica de Wazuh o OpenSearch
* No se requiere multilinguaje 