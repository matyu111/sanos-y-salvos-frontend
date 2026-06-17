# Sanos y Salvos Frontend

Frontend oficial de **Sanos y Salvos**, construido con **React 19** y **Vite**, cuya responsabilidad es actuar como **capa de presentación** del sistema.  
Este frontend consume información del ecosistema del sistema únicamente a través del **BFF (Backend For Frontend)** y se apoya en autenticación JWT para controlar el acceso por roles.

## Descripción del sistema

Sanos y Salvos es una plataforma orientada al registro, búsqueda y gestión de mascotas, coincidencias y ubicación geográfica asociada.  
La aplicación frontend presenta dos grandes experiencias de uso:

- **USER**: navegación pública/protegida para consultar mascotas, registrar mascotas, ver coincidencias y administrar la propia información.
- **ADMIN**: panel de gestión con vistas de dashboard, usuarios, mascotas y coincidencias.

El frontend no implementa lógica de negocio de backend, ni microservicios directos, ni persistencia de datos propia. Toda interacción con datos se realiza mediante servicios HTTP hacia el BFF.

## Tecnologías

- React 19
- Vite
- Axios
- React Router DOM
- Context API
- JWT
- CSS global basado en `src/styles/layout.css`
- CSS modular adicional para autenticación y formularios específicos

## Arquitectura del frontend

La arquitectura está organizada en capas de presentación y consumo:

- `src/pages`: pantallas principales del usuario final.
- `src/admin`: pantallas y layout del área administrativa.
- `src/components`: componentes reutilizables de UI.
- `src/services`: capa de consumo HTTP hacia el BFF.
- `src/context`: estado global de autenticación.
- `src/styles`: estilos globales y por módulo.

### Separación USER / ADMIN

La aplicación distingue dos experiencias:

- **USER**
  - Inicio
  - Registrar Mascota
  - Mis Mascotas
  - Coincidencias
  - Detalle de mascota

- **ADMIN**
  - Dashboard
  - Usuarios
  - Mascotas
  - Coincidencias

El acceso a cada flujo está protegido por `ProtectedRoute` y por el rol almacenado en sesión.

### Layout global

La aplicación principal usa un layout global basado en:

- `Navbar`
- `Sidebar`
- `Footer`
- `Outlet` para renderizar las páginas activas

El layout global controla la navegación base del usuario autenticado.

### AdminLayout

El área administrativa utiliza `AdminLayout` como contenedor interno del módulo admin.  
Este layout agrupa el encabezado administrativo y la navegación horizontal entre secciones admin.

### BFF como única capa de consumo

El frontend no consume directamente microservicios de dominio.  
La integración HTTP se centraliza en el BFF bajo rutas `/bff/...`.

### Servicios en `/services`

La carpeta `src/services` concentra el acceso a datos por módulo:

- autenticación
- mascotas
- coincidencias
- geolocalización
- administración

## Flujo de autenticación

El flujo de autenticación está basado en JWT:

1. El usuario ingresa correo y contraseña.
2. El frontend llama al endpoint de login del BFF.
3. El BFF responde con un token y datos de sesión.
4. El frontend guarda la sesión en `localStorage`.
5. El token se adjunta automáticamente en las solicitudes Axios mediante interceptor.
6. `ProtectedRoute` valida si existe sesión y si el rol permite el acceso.
7. El usuario es redirigido según su rol:
   - `ADMIN` -> `/admin/dashboard`
   - `USER` -> `/inicio`

### Roles

- `USER`
- `ADMIN`

## Estructura del proyecto

- `src/pages`
  - Vistas del flujo de usuario
- `src/admin`
  - Vistas, layout y páginas del flujo administrativo
- `src/components`
  - Componentes reutilizables de interfaz
- `src/services`
  - Servicios HTTP hacia el BFF
- `src/context`
  - Contexto global de autenticación
- `src/styles`
  - Estilos globales y por módulo

## Módulos del sistema

### USUARIOS

Funcionalidades relacionadas con autenticación y gestión base de usuarios.

- Login
- Registro
- Listado de usuarios
- Información de sesión

### MASCOTAS

Funcionalidades para registrar, consultar, editar y eliminar mascotas.

- Registro de mascota
- Mis Mascotas
- Detalle de mascota
- Administración de mascotas

### COINCIDENCIAS

Gestión de coincidencias entre mascotas reportadas y encontradas.

- Vista de coincidencias del usuario
- Vista administrativa de coincidencias

### GEOLOCALIZACIÓN

Módulo de ubicación usado para registrar coordenadas asociadas a mascotas.

- Selección de mapa
- Búsqueda de dirección
- Validación geográfica
- Persistencia de coordenadas mediante BFF

### ADMIN

Panel de administración con vistas de control central:

- Dashboard
- Usuarios
- Mascotas
- Coincidencias

## Consumo de API (BFF)

> Base URL actual detectada en el frontend: `http://localhost:8080`

### Headers globales

Todas las peticiones autenticadas usan:

```http
Authorization: Bearer {token}
Content-Type: application/json
