/**
 * Configuración de publicaciones de servicios juveniles (OneTwentyOne y JPC).
 * 
 * Cada elemento representa un anuncio de culto/servicio con su portada oficial de Instagram,
 * tema, descripción, fecha y hora de finalización para expiración automática.
 * 
 * Para agregar o actualizar publicaciones en el futuro:
 * 1. Agrega o modifica el objeto correspondiente en SERVICIOS_PUBLICACIONES.
 * 2. Guarda la imagen en /public/servicios/ o coloca la URL directa.
 * 3. Establece `fechaFin` con la fecha y hora en que concluye el culto. Pasada esa hora,
 *    desaparecerá automáticamente de la página principal sin necesidad de modificar el código.
 */

export const SERVICIOS_PUBLICACIONES = [
  {
    id: "jpc-2026-10-10",
    ministerio: "Jóvenes Para Cristo (JPC)",
    grupoEdad: "Adolescentes 12 a 17 años",
    lema: "Equipo Ministerial de Jóvenes",
    tema: "SALVACIÓN",
    subtema: "Jesús Pagó Todo · Cero Mérito",
    descripcion: "Nos vemos el sábado 10 a las 7 pm 🧾 Jesús pagó toda la deuda por nosotros.",
    fechaTexto: "Sábado 10 de Octubre, 2026",
    diaTexto: "Este Sábado",
    horaTexto: "7:00 PM - 8:30 PM",
    lugar: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    instagramUrl: "https://www.instagram.com/p/DeM-jg8JgpK/",
    instagramUsername: "jovenes_icc",
    portadaUrl: "/servicios/portada-jpc-actual.jpg",
    // Fecha y hora de inicio: Sábado 10 de Octubre 2026 a las 19:00 (7:00 PM)
    fechaInicio: new Date(2026, 9, 10, 19, 0, 0),
    // Fecha y hora de expiración: Sábado 10 de Octubre 2026 a las 20:30 (8:30 PM)
    // Concluido el servicio, desaparece automáticamente de la página principal.
    fechaFin: new Date(2026, 9, 10, 20, 30, 0),
    badge: "ESTE SÁBADO",
    accentColor: "#0ea5e9", // Color acento cyan/azul cielo armónico con el afiche
    badgeBg: "rgba(14, 165, 233, 0.2)",
    badgeBorder: "rgba(14, 165, 233, 0.45)",
    badgeText: "#7dd3fc"
  }
];

