
# Sistema de Gestión de Tarjetas de Crédito

## 1. Descripción del proyecto

Sistema web para la gestión de tarjetas de crédito del Banco Crédito Hipotecario Nacional (CHN).

La aplicación permite gestionar clientes, solicitudes de tarjetas de crédito y operaciones relacionadas con consumos y pagos.

El proyecto está compuesto por un backend desarrollado con Spring Boot, un frontend desarrollado con React y una base de datos relacional en Microsoft SQL Server.

## 2. Tecnologías utilizadas

### Backend
- Java 21
- Spring Boot
- Spring Data JPA / Hibernate
- Maven
- API REST

### Frontend
- React
- Vite
- JavaScript
- HTML y CSS
- Nginx para la aplicación en Docker

### Base de datos
- Microsoft SQL Server
- Transact-SQL (T-SQL)

### Herramientas
- Docker
- Docker Compose
- Git y GitHub
- Visual Studio Code

## 3. Requisitos previos

Para ejecutar el proyecto se necesita:

- Git instalado.
- Docker Desktop instalado y en ejecución.
- Microsoft SQL Server instalado y en ejecución.
- SQL Server configurado para aceptar conexiones TCP/IP en el puerto 1433.
- Un usuario de SQL Server con permisos de lectura y escritura sobre la base de datos.

## 4. Configuración de la base de datos

1. Iniciar SQL Server.
2. Abrir SQL Server Management Studio.
3. Abrir el archivo `database/GestionTarjetasCHN.sql`.
4. Ejecutar el script para crear la base de datos, las tablas y los catálogos iniciales.
5. Verificar que la base de datos `GestionTarjetasCHN` y sus tablas se hayan creado correctamente.

El sistema utiliza las siguientes tablas:

- `Cliente`
- `TipoTarjeta`
- `EstadoSolicitud`
- `SolicitudTarjeta`
- `TarjetaCredito`
- `Consumo`
- `Pago`

### Usuario de conexión

La aplicación utiliza el usuario `chn_app` para conectarse a SQL Server.

Debe crearse y configurarse con los permisos necesarios para consultar y modificar los datos de la base de datos `GestionTarjetasCHN`.


## 5. Configuración de credenciales

Por seguridad, la contraseña real no se incluye en el repositorio.

En la raíz del proyecto se encuentra el archivo `.env.credenciales`, que sirve como plantilla para configurar la conexión a SQL Server.

Crear el archivo `.env` a partir de la plantilla:

Copy-Item .env.credenciales .env


Abrir el archivo `.env` y configurar la contraseña del usuario de SQL Server:

DB_PASSWORD=PONER_CONTRASEÑA_DE_SQL_SERVER


Reemplazar el valor de ejemplo por la contraseña correspondiente.


## 6. Ejecución con Docker Compose

Desde la carpeta raíz del proyecto, ejecutar:

docker compose up -d --build


Este comando construye las imágenes y ejecuta los contenedores del backend y del frontend.

### Verificar el estado de los servicios

docker compose ps


### Consultar los registros del backend

docker compose logs -f backend


### Consultar los registros del frontend

docker compose logs -f frontend


### Detener los servicios

docker compose down


Este comando detiene y elimina los contenedores del proyecto.

## 7. Acceso a la aplicación

Una vez que los servicios estén ejecutándose, acceder a las siguientes direcciones:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

La API se encuentra bajo la ruta `/api`.

Ejemplos de endpoints:

- http://localhost:8080/api/clientes
- http://localhost:8080/api/solicitudes

Las operaciones disponibles dependen de los métodos HTTP implementados en cada controlador.

El frontend se comunica con el backend mediante Nginx y la configuración definida para la aplicación.

## 8. Configuración de conexión a SQL Server

La conexión a la base de datos se configura mediante variables de entorno en Docker Compose.

Los parámetros utilizados son:

- Servidor desde Docker: `host.docker.internal`
- Puerto: `1433`
- Base de datos: `GestionTarjetasCHN`
- Usuario: `chn_app`
- Contraseña: variable de entorno `DB_PASSWORD`


## 9. Funcionalidades del sistema

El sistema contempla las siguientes operaciones:

- Registro y consulta de clientes.
- Registro de solicitudes de tarjetas de crédito.
- Gestión de los estados de las solicitudes.
- Administración de tarjetas de crédito aprobadas.
- Registro de consumos asociados a una tarjeta.
- Registro de pagos asociados a una tarjeta.
- Control del saldo y del límite de crédito disponible.


## 10. Repositorio

Código fuente del proyecto:

https://github.com/jorgechavezg001/GestionTarjetasCHN