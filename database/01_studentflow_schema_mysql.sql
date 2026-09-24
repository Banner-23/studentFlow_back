-- Active: 1779364984712@@127.0.0.1@3306@studentflow
DROP DATABASE IF EXISTS studentflow;
CREATE DATABASE studentflow
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE studentflow;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    zona_horaria VARCHAR(60) NOT NULL,
    idioma VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE configuracion_usuario (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,

    dias_panico INT NOT NULL,
    minutos_por_hora_estudio INT NOT NULL,
    tema_ia VARCHAR(150) NOT NULL,

    duracion_pomodoro INT NOT NULL,
    descanso_corto INT NOT NULL,
    descanso_largo INT NOT NULL,
    ciclos_para_descanso_largo INT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_config_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);
USE studentflow;
CREATE TABLE materia (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,

    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    color CHAR(7) NOT NULL,
    creditos TINYINT NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_materia_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE equipo_integrante (
    id_integrante INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,

    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150),
    rol VARCHAR(60),

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_integrante_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE evaluacion (

    id_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,

    nombre VARCHAR(150) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    nota DECIMAL(4,2),
    fecha DATE,
    observaciones TEXT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_evaluacion_materia
        FOREIGN KEY (id_materia)
        REFERENCES materia(id_materia)
        ON DELETE CASCADE

);


CREATE TABLE actividad (

    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,

    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo ENUM('Tarea','Quiz','Parcial','Proyecto','Laboratorio','Otro') NOT NULL,

    porcentaje DECIMAL(5,2) NOT NULL,
    fecha_entrega DATE,

    completada BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_actividad_materia
        FOREIGN KEY (id_materia)
        REFERENCES materia(id_materia)
        ON DELETE CASCADE
);


CREATE TABLE tarea (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE NOT NULL,
    hora_entrega TIME,
    prioridad ENUM('BAJA','MEDIA','ALTA') NOT NULL,
    estado ENUM('PENDIENTE','EN_PROGRESO','COMPLETADA') NOT NULL,
    carga_estimada_minutos INT,
    porcentaje_avance TINYINT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tarea_materia
        FOREIGN KEY (id_materia)
        REFERENCES materia(id_materia)
        ON DELETE CASCADE
);

USE studentflow;

CREATE TABLE evento (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo ENUM('CLASE','EXAMEN','REUNION','PERSONAL') NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_materia
        FOREIGN KEY (id_materia)
        REFERENCES materia(id_materia)
        ON DELETE CASCADE
);

USE studentflow;

CREATE TABLE subtarea (
    id_subtarea INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    estado ENUM('PENDIENTE','EN_PROGRESO','COMPLETADA') NOT NULL,
    orden INT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_subtarea_tarea
        FOREIGN KEY (id_tarea)
        REFERENCES tarea(id_tarea)
        ON DELETE CASCADE
);

USE studentflow;

CREATE TABLE recordatorio (
    id_recordatorio INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,

    mensaje VARCHAR(255) NOT NULL,
    fecha_hora DATETIME NOT NULL,
    canal ENUM('APP','EMAIL','WHATSAPP') NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recordatorio_tarea
        FOREIGN KEY (id_tarea)
        REFERENCES tarea(id_tarea)
        ON DELETE CASCADE
);

USE studentflow;

CREATE TABLE bloque_estudio (
    id_bloque INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,
    id_tarea INT,

    titulo VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    descripcion TEXT,
    origen ENUM('MANUAL','TAREA','POMODORO') NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_bloque_materia
        FOREIGN KEY (id_materia)
        REFERENCES materia(id_materia)
        ON DELETE CASCADE,

    CONSTRAINT fk_bloque_tarea
        FOREIGN KEY (id_tarea)
        REFERENCES tarea(id_tarea)
        ON DELETE SET NULL
);

USE studentflow;

CREATE TABLE tarea_responsable (
    id_tarea_responsable INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_integrante INT NOT NULL,

    es_principal BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tarea_responsable_tarea
        FOREIGN KEY (id_tarea)
        REFERENCES tarea(id_tarea)
        ON DELETE CASCADE,

    CONSTRAINT fk_tarea_responsable_integrante
        FOREIGN KEY (id_integrante)
        REFERENCES equipo_integrante(id_integrante)
        ON DELETE CASCADE,

    CONSTRAINT uq_tarea_integrante
        UNIQUE (id_tarea, id_integrante)
);

USE studentflow;

CREATE TABLE pomodoro_sesion (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_materia INT,
    id_tarea INT,

    minutos_enfoque INT NOT NULL,
    minutos_descanso INT NOT NULL DEFAULT 0,
    ciclos_completados INT NOT NULL DEFAULT 1,

    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,

    origen ENUM('MANUAL','TEMPORIZADOR') NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pomodoro_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_pomodoro_materia
        FOREIGN KEY (id_materia)
        REFERENCES materia(id_materia)
        ON DELETE SET NULL,

    CONSTRAINT fk_pomodoro_tarea
        FOREIGN KEY (id_tarea)
        REFERENCES tarea(id_tarea)
        ON DELETE SET NULL
);

CREATE INDEX idx_tarea_fecha_entrega
ON tarea (fecha_entrega);

CREATE INDEX idx_tarea_estado
ON tarea (estado);

CREATE INDEX idx_tarea_prioridad
ON tarea (prioridad);

CREATE INDEX idx_evento_fecha
ON evento (fecha);

CREATE INDEX idx_bloque_estudio_fecha
ON bloque_estudio (fecha);

CREATE INDEX idx_recordatorio_fecha_hora
ON recordatorio (fecha_hora);

CREATE INDEX idx_pomodoro_fecha_inicio
ON pomodoro_sesion (fecha_inicio);

CREATE INDEX idx_evaluacion_fecha
ON evaluacion (fecha);