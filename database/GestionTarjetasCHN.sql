IF DB_ID('GestionTarjetasCHN') IS NULL
BEGIN
    CREATE DATABASE GestionTarjetasCHN;
END;
GO

USE GestionTarjetasCHN;
GO

--1.TIPO TC
CREATE TABLE dbo.TipoTarjeta (
	tipo_tarjeta_id INT IDENTITY(1,1) PRIMARY KEY,
	nombre VARCHAR (20) NOT NULL UNIQUE
	);
GO

INSERT INTO dbo.TipoTarjeta (nombre)
VALUES ('Clasica'), ('Oro'), ('Platino');
GO


--2.Estaddo solicitud
CREATE TABLE dbo.EstadoSolicitud (
	estado_solicitud_id INT IDENTITY (1,1) PRIMARY KEY,
	nombre VARCHAR (15) NOT NULL UNIQUE
	);
GO

INSERT INTO dbo.EstadoSolicitud (nombre)
VALUES ('Pendiente'), ('Aprobada'), ('Rechazada')
GO
	

--3.CLIENET
CREATE TABLE dbo.Cliente (
	cliente_id INT IDENTITY(1,1) PRIMARY KEY,
	nombre VARCHAR (100) NOT NULL,
	apellido VARCHAR (100) NOT NULL,
	no_dpi VARCHAR (13) NOT NULL,
	fecha_nacimiento DATE NOT NULL,
	direccion VARCHAR (250) NOT NULL,
	correo VARCHAR (150) NOT NULL,
	telefono VARCHAR (25) NOT NULL,

	CONSTRAINT UQ_Cliente_Identificacion
		UNIQUE (no_dpi)
	);
GO

--4.Solicitud de tarjeta
CREATE TABLE dbo.SolicitudTarjeta (
	solicitud_id INT IDENTITY(1,1) PRIMARY KEY,
	cliente_id INT NOT NULL,
	tipo_tarjeta_id INT NOT NULL,
	fecha_solicitud DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
	ingreso DECIMAL(12,2) NOT NULL,
	estado_solicitud_id INT NOT NULL DEFAULT 1,
	fecha_decision DATETIME2 NULL,
	motivo_comentario VARCHAR (250) NULL,
	monto_aprobado DECIMAL (12,2) NULL,

	CONSTRAINT FK_Solicitud_Cliente
		FOREIGN KEY (cliente_id)
		REFERENCES dbo.Cliente(cliente_id)
		ON DELETE CASCADE,

	CONSTRAINT FK_Solicitud_TipoTarjeta
		FOREIGN KEY (tipo_tarjeta_id)
		REFERENCES  dbo.TipoTarjeta(tipo_tarjeta_id),

	CONSTRAINT FK_Solisitud_Estado
		FOREIGN KEY (estado_solicitud_id)
		REFERENCES dbo.EstadoSolicitud(estado_solicitud_id),

	CONSTRAINT CK_Solicitud_Ingreso
		CHECK (ingreso >= 0),

	CONSTRAINT CK_Solicitud_MontoAprobado
		CHECK (monto_aprobado IS NULL OR monto_aprobado > 0)
);
GO

--5.TC
CREATE TABLE dbo.TarjetaCredito (
	numero_tarjeta VARCHAR (19) PRIMARY KEY,
	solicitud_id INT NOT NULL UNIQUE,
	tipo_tarjeta_id INT NOT NULL,
	limite_credito DECIMAL (12,2) NOT NULL,
	saldo_actual DECIMAL (12,2) NOT NULL DEFAULT 0,

	CONSTRAINT FK_Tarjeta_Solicitud
        FOREIGN KEY (solicitud_id)
        REFERENCES dbo.SolicitudTarjeta(solicitud_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Tarjeta_TipoTarjeta
        FOREIGN KEY (tipo_tarjeta_id)
        REFERENCES dbo.TipoTarjeta(tipo_tarjeta_id),

    CONSTRAINT CK_Tarjeta_Limite
        CHECK (limite_credito > 0),

    CONSTRAINT CK_Tarjeta_Saldo
        CHECK (
            saldo_actual >= 0
            AND saldo_actual <= limite_credito
        )
);
GO

--6.Consumo
CREATE TABLE dbo.Consumo (
	consumo_id INT IDENTITY(1,1) PRIMARY KEY,
	numero_tarjeta VARCHAR (19) NOT NULL,
	monto_consumo DECIMAL (12,2) NOT NULL,
	fecha_consumo DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
	descripcion VARCHAR (250) NOT NULL,

	CONSTRAINT FK_Consumo_Tarjeta
		FOREIGN KEY (numero_tarjeta)
		REFERENCES dbo.TarjetaCredito (numero_tarjeta)
		ON DELETE CASCADE,

	CONSTRAINT CK_Consumo_Monto
		CHECK (monto_consumo > 0)
 );
 GO

 --7.Pago:
CREATE TABLE dbo.Pago (
	pago_id INT IDENTITY(1,1) PRIMARY KEY,
	numero_tarjeta VARCHAR(19) NOT NULL,
	monto_pago DECIMAL(12,2) NOT NULL,
	fecha_pago DATETIME2 NOT NULL
		DEFAULT SYSDATETIME(),
	descripcion VARCHAR(250) NOT NULL,

	CONSTRAINT FK_Pago_Tarjeta
		FOREIGN KEY (numero_tarjeta)
		REFERENCES dbo.TarjetaCredito(numero_tarjeta)
		ON DELETE CASCADE,

	CONSTRAINT CK_Pago_Monto
		CHECK (monto_pago > 0)
);
GO