# Sanos y Salvos - Backend

Backend del sistema **Sanos y Salvos**, una plataforma para registrar mascotas perdidas y encontradas, detectar coincidencias y centralizar el acceso a los microservicios mediante un BFF.

## 1. Descripción del sistema backend

El backend está construido con una arquitectura basada en microservicios y una capa intermedia BFF (Backend for Frontend).

El flujo general es:

```txt
Frontend / Cliente
        ↓
BFF (capa de agregación y exposición pública)
        ↓
Microservicios Spring Boot
        ↓
MySQL
```

El BFF expone las rutas públicas para el frontend y reenvía las solicitudes a los microservicios a través de Feign. Los microservicios conservan su lógica de negocio y seguridad de forma independiente.

## 2. Tecnologías utilizadas

- Java 17
- Spring Boot 3.5.x
- Spring Security
- Spring Cloud OpenFeign
- JWT
- Maven
- JPA / Hibernate
- MySQL
- Docker y Docker Compose
- Lombok

## 3. Arquitectura del backend

### Microservicios

- **ms-usuarios**: registro, autenticación y gestión de usuarios.
- **ms-mascotas**: CRUD y consulta de mascotas perdidas o encontradas.
- **ms-coincidencias**: cálculo de coincidencias entre mascotas.
- **ms-geolocalizacion**: registro y consulta de ubicaciones, cálculo de distancias y cercanía.

### BFF

El proyecto incluye **bff-sanosysalvos**, que centraliza el acceso desde el cliente web y expone rutas bajo `/bff/**`.

### Comunicación

- Comunicación **REST** entre servicios.
- El BFF consume los microservicios por medio de **Feign Clients**.
- El token JWT se propaga en la cabecera `Authorization`.

## 4. Estructura del proyecto backend

Cada microservicio sigue una estructura similar:

- `controller`: expone los endpoints REST.
- `service`: contiene la lógica de negocio.
- `service/impl`: implementación de servicios.
- `repository`: acceso a datos con Spring Data JPA.
- `dto`: objetos de transferencia de datos.
- `model`: entidades JPA.
- `config`: configuración de seguridad, JWT, Feign o CORS según corresponda.

En el caso del BFF, además existen:

- `client`: clientes Feign hacia cada microservicio.
- `service`: capa de delegación y agregación.
- `controller`: exposición de rutas públicas `/bff/**`.

## 5. Seguridad

La seguridad del backend está basada en:

- JWT como mecanismo de autenticación.
- Spring Security con sesión stateless.
- Contraseñas encriptadas con BCrypt.
- Filtros JWT para validar el token en cada solicitud protegida.

### Roles

- `USUARIO`
- `ADMIN`

### Rutas públicas reales

- `POST /api/usuarios`
- `POST /api/usuarios/login`
- `POST /api/auth/login`

El resto de endpoints REST del backend están protegidos y requieren token JWT en `Authorization: Bearer <token>`.

## 6. Endpoints del sistema

### 6.1 Usuarios - BFF

Base: `/bff/usuarios`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| POST | `/bff/usuarios/login` | Inicia sesión y retorna JWT | Público |
| GET | `/bff/usuarios` | Lista usuarios | Bearer JWT |
| GET | `/bff/usuarios/{id}` | Busca usuario por id | Bearer JWT |
| POST | `/bff/usuarios` | Crea usuario | Público |

### 6.2 Mascotas - BFF

Base: `/bff/mascotas`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| POST | `/bff/mascotas` | Crea mascota | Bearer JWT |
| GET | `/bff/mascotas` | Lista mascotas | Bearer JWT |
| GET | `/bff/mascotas/{id}` | Busca mascota por id | Bearer JWT |
| GET | `/bff/mascotas/usuario/{usuarioId}` | Lista mascotas por usuario | Bearer JWT |
| GET | `/bff/mascotas/estado/{estado}` | Lista mascotas por estado | Bearer JWT |
| PUT | `/bff/mascotas/{id}` | Actualiza mascota | Bearer JWT |
| DELETE | `/bff/mascotas/{id}` | Elimina mascota | Bearer JWT |

### 6.3 Coincidencias - BFF

Base: `/bff/coincidencias`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| GET | `/bff/coincidencias` | Busca coincidencias globales | Bearer JWT |
| GET | `/bff/coincidencias/usuario/{usuarioId}` | Busca coincidencias por usuario | Bearer JWT |

### 6.4 Geolocalización - BFF

Base: `/bff/geolocalizacion`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| POST | `/bff/geolocalizacion` | Guarda ubicación | Bearer JWT |
| GET | `/bff/geolocalizacion` | Lista ubicaciones | Bearer JWT |
| GET | `/bff/geolocalizacion/mascota/{mascotaId}` | Obtiene ubicación por mascota | Bearer JWT |
| GET | `/bff/geolocalizacion/distancia` | Calcula distancia entre coordenadas | Bearer JWT |
| GET | `/bff/geolocalizacion/cercanas` | Busca ubicaciones cercanas | Bearer JWT |

### 6.5 Usuarios - microservicio

Base: `/api/usuarios`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| POST | `/api/usuarios` | Registra usuario | Público |
| POST | `/api/usuarios/login` | Login con token JWT | Público |
| GET | `/api/usuarios` | Lista usuarios | Bearer JWT |
| GET | `/api/usuarios/{id}` | Busca usuario por id | Bearer JWT |
| DELETE | `/api/usuarios/{id}` | Elimina usuario | Bearer JWT |

Además existe autenticación alternativa en:

| Método | URL | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login alternativo con validación de contraseña |

### 6.6 Mascotas - microservicio

Base: `/api/mascotas`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| POST | `/api/mascotas` | Crea mascota | Bearer JWT |
| GET | `/api/mascotas` | Lista mascotas | Bearer JWT |
| GET | `/api/mascotas/{id}` | Busca mascota por id | Bearer JWT |
| GET | `/api/mascotas/estado/{estado}` | Lista por estado | Bearer JWT |
| GET | `/api/mascotas/usuario/{usuarioId}` | Lista por usuario | Bearer JWT |
| PUT | `/api/mascotas/{id}` | Actualiza mascota | Bearer JWT |
| DELETE | `/api/mascotas/{id}` | Elimina mascota | Bearer JWT |

### 6.7 Coincidencias - microservicio

Base: `/api/coincidencias`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| GET | `/api/coincidencias` | Calcula coincidencias | Bearer JWT |
| GET | `/api/coincidencias/usuario/{usuarioId}` | Coincidencias filtradas por usuario | Bearer JWT |

### 6.8 Geolocalización - microservicio

Base: `/api/geolocalizacion`

| Método | URL | Descripción | Seguridad |
|---|---|---|---|
| POST | `/api/geolocalizacion` | Guarda ubicación | Bearer JWT |
| GET | `/api/geolocalizacion` | Lista ubicaciones | Bearer JWT |
| GET | `/api/geolocalizacion/mascota/{mascotaId}` | Obtiene la última ubicación de una mascota | Bearer JWT |
| GET | `/api/geolocalizacion/distancia` | Calcula distancia entre coordenadas | Bearer JWT |
| GET | `/api/geolocalizacion/cercanas` | Busca ubicaciones dentro de un radio | Bearer JWT |


## 7. Notas importantes

- No se modificó la lógica de negocio para generar esta documentación.
- No se refactorizaron controladores, servicios, DTOs ni entidades.
- Se mantuvo la separación de responsabilidades entre BFF y microservicios.
- La documentación refleja únicamente rutas reales detectadas en el código fuente.

## 18. Estructura general del repositorio

```txt
sanos-y-salvos-backend-vargas-vargas/
├── bff-sanosysalvos/
├── ms-usuarios/
├── ms-mascotas/
├── ms-coincidencias/
├── ms-geolocalizacion/
├── docker-compose.yml
└── swagger.yaml
```

## 9. Ejecución

Cada microservicio puede ejecutarse de forma independiente con Maven.

Orden sugerido de arranque:

1. MySQL
2. ms-usuarios
3. ms-mascotas
4. ms-geolocalizacion
5. ms-coincidencias
6. bff-sanosysalvos

El BFF actúa como punto de entrada para el consumo desde el frontend.

## 12. Integrantes

- Matilda Vargas
- Juan Vargas

## 13. Repositorios

### Backend

https://github.com/juavargasc-del/Sanos-y-salvos-Backend-Vargas-Vargas-.git

### Frontend

https://github.com/juavargasc-del/Sanos-y-salvos-Frontend-Vargas-Vargas.git

## 14. Asignatura

Desarrollo Fullstack III  
Duoc UC
