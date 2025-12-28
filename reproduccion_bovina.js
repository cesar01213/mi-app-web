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
function calcularMomentoInseminacion(fechaHoraCelo) {
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
    fechaSugerida: null,
    colorAlerta: ""
  };

  // Lógica Regla AM-PM
  if (hora < 12) {
    // CASO AM: Detectado a la mañana -> Inseminar ESTA TARDE
    resultado.accion = "Inseminar HOY a la Tarde";
    resultado.rangoHorario = "18:00 - 20:00 hs";
    resultado.colorAlerta = "#ff9800"; // Naranja/Ambar para "Atención hoy"
    
    // Calcular fecha sugerida: Mismo día a las 18:00
    const sugerida = new Date(fechaDeteccion);
    sugerida.setHours(18, 0, 0, 0);
    resultado.fechaSugerida = sugerida;

  } else {
    // CASO PM: Detectado a la tarde -> Inseminar MAÑANA a la MAÑANA
    resultado.accion = "Inseminar MAÑANA a la Mañana";
    resultado.rangoHorario = "06:00 - 08:00 hs";
    resultado.colorAlerta = "#2196f3"; // Azul para "Mañana" (frío/futuro)
    
    // Calcular fecha sugerida: Día siguiente a las 06:00
    const sugerida = new Date(fechaDeteccion);
    sugerida.setDate(sugerida.getDate() + 1); // Sumar 1 día (manejor automático de fin de mes/año)
    sugerida.setHours(6, 0, 0, 0);
    resultado.fechaSugerida = sugerida;
  }

  return resultado;
}

// Ejemplo de uso si se ejecuta directamente este archivo
if (require.main === module) {
  const ejemplos = [
    "2023-10-25T07:30:00", // AM
    "2023-10-25T14:45:00", // PM
    new Date()             // Ahora
  ];

  ejemplos.forEach(fecha => {
    console.log(`\nEntrada: ${fecha}`);
    console.log(calcularMomentoInseminacion(fecha));
  });
}

module.exports = { calcularMomentoInseminacion };
