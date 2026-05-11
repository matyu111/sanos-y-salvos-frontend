# Sanos y Salvos - Frontend

Frontend del proyecto **Sanos y Salvos**, desarrollado para la asignatura Fullstack III.

La aplicación corresponde al módulo de autenticación del sistema y consume los servicios del backend mediante un BFF (Backend for Frontend).

---

# Integrantes

- Matilda Vargas
- Juan Vargas

---

# Repositorios

## Frontend
https://github.com/juavargasc-del/Sanos-y-salvos-Frontend-Vargas-Vargas.git

## Backend
https://github.com/juavargasc-del/Sanos-y-salvos-Backend-Vargas-Vargas-.git

---

# Descripción del proyecto

Sanos y Salvos es una plataforma orientada a la gestión y reporte de mascotas perdidas y encontradas.

En esta primera versión se implementó:

- Sistema de autenticación
- Registro de usuarios
- Login seguro mediante JWT
- Protección de rutas
- Comunicación con backend mediante Axios
- Dashboard protegido
- Validaciones frontend
- Componentes por rol
- Manejo de errores y mensajes visuales

---

# Tecnologías utilizadas

## Frontend
- React
- Vite
- React Router DOM
- Axios
- CSS3

## Backend
- Spring Boot
- Maven
- MySQL
- JWT
- BCrypt
- RestTemplate

---

# Arquitectura general

Frontend (React)
↓
BFF (Backend for Frontend)
↓
Microservicios:
- ms-usuarios
- ms-mascotas
- ms-coincidencias
↓
MySQL

---

# Estructura del frontend

```txt
src/
├── api
├── assets
├── components
├── pages
├── routes
├── services
├── styles
├── utils
```

---

# Funcionalidades implementadas

## Login
- Inicio de sesión
- Validaciones visuales
- Manejo de errores
- JWT almacenado en localStorage

## Registro
- Creación de usuarios
- Validación en tiempo real
- Restricción de dominios permitidos:
  - @duocuc.cl
  - @profesorduoc.cl
  - @gmail.com
  - @hotmail.com

## Dashboard
- Ruta protegida
- Logout
- Componentes por rol
- Información de autenticación

---

# Rutas disponibles

| Ruta | Descripción |
|---|---|
| /login | Inicio de sesión |
| /register | Registro de usuario |
| /dashboard | Dashboard protegido |

---

# Configuración del proyecto

## Requisitos

- Node.js
- NPM
- Backend ejecutándose en puerto 8080

---

# Instalación

Clonar repositorio:

```bash
git clone https://github.com/juavargasc-del/Sanos-y-salvos-Frontend-Vargas-Vargas.git
```

Ingresar al proyecto:

```bash
cd Sanos-y-salvos-Frontend-Vargas-Vargas
```

Instalar dependencias:

```bash
npm install
```

---

# Ejecución

Ejecutar aplicación:

```bash
npm run dev
```

Abrir navegador:

```txt
http://localhost:5173
```

---

# Comunicación con backend

El frontend consume el BFF mediante Axios:

```txt
http://localhost:8080
```

Endpoints utilizados:
- /bff/usuarios/login
- /bff/usuarios

---

# Seguridad implementada

- JWT Authentication
- Protected Routes
- Validaciones frontend
- Manejo de excepciones
- Restricción de dominios de correo

---

# GitHub Flow

Durante el desarrollo se utilizó GitHub Flow mediante:

- feature/
- chore/
- fix/

Cada funcionalidad fue desarrollada en ramas independientes utilizando Pull Request y merge hacia main.

---

# Estado actual

## Implementado
- Frontend autenticación
- Login
- Registro
- JWT
- Dashboard
- Logout
- Validaciones
- Responsividad básica

## Pendiente
- Integración frontend completa con mascotas
- Visualización avanzada de coincidencias
- Mejoras UX/UI futuras

---

# Bases de datos utilizadas

## Usuarios
```txt
jdbc:mysql://localhost:3306/sanosysalvos_usuarios
```

## Mascotas
```txt
jdbc:mysql://localhost:3306/sanosysalvos_mascotas
```

---

# Asignatura

Desarrollo Fullstack III  
Duoc UC
