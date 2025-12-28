/**
 * Módulo de Lógica de Reproducción Bovina
 * Implementa la regla AM-PM para inseminación artificial.
 */

/**
 * Calcula el momento óptimo de inseminación basado en la regla AM-PM.
 * 
 * Reglas:
 * - AM (< 12:00): Inseminar HOY Tarde (18:00 - 20:00).
 * - PM (>= 12:00): Inseminar MAÑANA Mañana (06:00 - 08:00).
 * 
 * @param {string|Date} fechaHoraCelo - Fecha y hora en que se detectó el celo (ISO String o Date object).
 * @returns {object} Objeto con la recomendación (accion, rangoHorario, fechaSugerida, colorAlerta).
 */
export function calcularMomentoInseminacion(fechaHoraCelo: string | Date) {
    // Asegurar que trabajamos con un objeto Date válido
    const fechaDeteccion = new Date(fechaHoraCelo);

    // Validar fecha
    if (isNaN(fechaDeteccion.getTime())) {
        throw new Error("Fecha de detección inválida");
    }

    const hora = fechaDeteccion.getHours(); // 0-23

    // Objeto de respuesta base
    let resultado = {
        accion: "",
        rangoHorario: "",
        fechaSugerida: null as Date | null,
        colorAlerta: ""
    };

    // Lógica Regla AM-PM
    if (hora < 12) {
        // CASO AM: Detectado a la mañana -> Inseminar ESTA TARDE
        resultado.accion = "Inseminar HOY a la Tarde";
        resultado.rangoHorario = "18:00 - 20:00 hs";
        resultado.colorAlerta = "#ff9800"; // Naranja para urgencia del día

        // Calcular fecha sugerida: Mismo día a las 18:00
        const sugerida = new Date(fechaDeteccion);
        sugerida.setHours(18, 0, 0, 0);
        resultado.fechaSugerida = sugerida;

    } else {
        // CASO PM: Detectado a la tarde -> Inseminar MAÑANA a la MAÑANA
        resultado.accion = "Inseminar MAÑANA a la Mañana";
        resultado.rangoHorario = "06:00 - 08:00 hs";
        resultado.colorAlerta = "#2196f3"; // Azul para planificar mañana

        // Calcular fecha sugerida: Día siguiente a las 06:00
        const sugerida = new Date(fechaDeteccion);
        sugerida.setDate(sugerida.getDate() + 1); // Sumar 1 día
        sugerida.setHours(6, 0, 0, 0);
        resultado.fechaSugerida = sugerida;
    }

    return resultado;
}
