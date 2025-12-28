export type Raza = 'Holando' | 'Jersey' | 'Cruza';
export type Categoria = 'Ternera' | 'Vaquillona' | 'Vaca';
export type EstadoReproductivo = 'Vacía' | 'Inseminada' | 'Preñada' | 'Seca';
export type Cuarto = 'AI' | 'AD' | 'PI' | 'PD';

export interface Cow {
    id: string; // Caravana
    rp?: string; // Registro Particular
    raza: Raza;
    categoria: Categoria;
    fechaNacimiento: string;
    padre?: string;
    madre?: string;
    estado: 'Lactancia' | 'Seca';
    estadoRepro: EstadoReproductivo;
    ultimoParto?: string;
    partosTotales: number;
    fpp?: string; // Fecha Probable de Parto
    diasPreñez?: number;
}

export interface Evento {
    id: number;
    cowId: string;
    tipo: 'celo' | 'sanidad' | 'inseminacion' | 'parto' | 'tacto' | 'controlLechero';
    fecha: string;
    detalle: string;

    // Sanidad
    gradoMastitis?: 1 | 2 | 3 | 'Clínico';
    cuartos?: Cuarto[];
    medicamento?: string;
    diasRetiro?: number;
    fechaLiberacion?: string;

    // Reproducción
    toro?: string;
    inseminador?: string;
    resultadoTacto?: 'Preñada' | 'Vacía';
    mesesGestacion?: number;

    // Producción
    litros?: number;
    grasa?: number;
    proteina?: number;
}

export interface Alerta {
    id: string;
    tipo: 'urgente' | 'atencion' | 'info';
    mensaje: string;
    accion: string;
    link: string;
}
