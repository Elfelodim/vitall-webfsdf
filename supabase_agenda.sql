-- =========================================================================
-- SQL PARA CREAR LAS TABLAS DE LA AGENDA CON CONTROL DE SEDES/PISOS
-- Ejecutar en el SQL Editor de Supabase
-- IMPORTANTE: Si ya creaste las anteriores que te di hace un momento, 
-- puedes borrarlas (DROP TABLE citas, horarios_medicos, medicos, especialidades;) 
-- y ejecutar estas de cero para evitar conflictos.
-- =========================================================================

-- 1. Tabla de Especialidades
CREATE TABLE IF NOT EXISTS public.especialidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT UNIQUE NOT NULL
);

-- 2. Tabla de Médicos
CREATE TABLE IF NOT EXISTS public.medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    documento TEXT UNIQUE NOT NULL,
    telefono TEXT,
    -- El correo es crucial porque si coincide con el usuario logueado en auth, asumirá rol Médico
    correo TEXT UNIQUE 
);

-- 3. Tabla de Horarios Médicos (Añadidas: Sede, Piso, Consultorio)
CREATE TABLE IF NOT EXISTS public.horarios_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
    hora_inicio TIME NOT NULL, 
    hora_fin TIME NOT NULL,
    hora_break_inicio TIME,
    hora_break_fin TIME,
    duracion_cita_minutos INT NOT NULL DEFAULT 20,
    -- Datos de Infraestructura
    sede TEXT DEFAULT 'Sede Principal',
    piso TEXT DEFAULT '1',
    consultorio_numero TEXT NOT NULL,
    
    activo BOOLEAN DEFAULT true,
    UNIQUE(medico_id, dia_semana)
);

-- 4. Tabla de Citas
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE,
    
    -- Datos del Paciente
    paciente_tipo_doc TEXT NOT NULL,
    paciente_num_doc TEXT NOT NULL,
    paciente_nombre TEXT NOT NULL,
    paciente_fecha_nac DATE NOT NULL,
    paciente_telefono TEXT NOT NULL,
    paciente_direccion TEXT,
    paciente_correo TEXT,
    eps TEXT,
    
    -- Datos de la Consulta
    especialidad TEXT NOT NULL,
    tipo_cita TEXT NOT NULL CHECK (tipo_cita IN ('primera_vez', 'control', 'examen')),
    observacion TEXT,
    
    -- Asignación de Turno
    fecha_cita DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'atendida', 'cancelada', 'in-asistencia')),
    
    agendado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(medico_id, fecha_cita, hora_inicio)
);

-- INSERCIÓN DE DATOS DE PRUEBA
INSERT INTO public.especialidades (nombre) VALUES 
('Cardiología'), ('Pediatría'), ('Dermatología'), ('Medicina General')
ON CONFLICT DO NOTHING;
