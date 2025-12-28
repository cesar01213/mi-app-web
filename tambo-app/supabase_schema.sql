-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Cows
CREATE TABLE public.cows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL, -- For Multi-Tenancy (Supabase Auth)
    caravana TEXT NOT NULL,
    raza TEXT,
    fecha_nacimiento DATE,
    estado_actual TEXT CHECK (estado_actual IN ('Lactancia', 'Seca', 'Enferma')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, caravana)
);

-- Table: Reproductive Events
CREATE TABLE public.reproductive_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cow_id UUID NOT NULL REFERENCES public.cows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    tipo_evento TEXT CHECK (tipo_evento IN ('Celo', 'Inseminacion', 'Tacto', 'Parto', 'Secado')),
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    detalles TEXT,
    fecha_proximo_evento_estimada TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Sanitary Logs
CREATE TABLE public.sanitary_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cow_id UUID NOT NULL REFERENCES public.cows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    enfermedad TEXT NOT NULL,
    cuarto_afectado TEXT CHECK (cuarto_afectado IN ('AI', 'AD', 'PI', 'PD', 'General')),
    medicamento TEXT,
    dias_retiro INTEGER DEFAULT 0,
    fecha_aplicacion TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Simple calculated column logic to be handled by application or trigger if needed. 
    -- For now using a standard column that the App populates.
    fecha_liberacion_leche TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Row Level Security) - Basic Setup
ALTER TABLE public.cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproductive_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanitary_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for Cows
CREATE POLICY "Users can manage their own cows" ON public.cows
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for Events
CREATE POLICY "Users can manage their own events" ON public.reproductive_events
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for Logs
CREATE POLICY "Users can manage their own logs" ON public.sanitary_logs
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
