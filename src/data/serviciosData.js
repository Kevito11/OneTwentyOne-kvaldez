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
    id: "121-2026-10-02",
    ministerio: "Siervos para Cristo (OneTwentyOne)",
    grupoEdad: "Jóvenes 18+ años",
    lema: "Siervos Para Cristo",
    tema: "MALAS LENGUAS",
    descripcion: "¡Volvimos! nos vemos este viernes, trae a un amigo 🫪🫵🏻",
    fechaTexto: "Viernes 2 de Octubre, 2026",
    diaTexto: "Hoy Viernes",
    horaTexto: "8:00 PM - 10:00 PM",
    lugar: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    instagramUrl: "https://www.instagram.com/p/Dd7o3X4z_3T/",
    instagramUsername: "onetwentyoneicc",
    portadaUrl: "/servicios/portada-121-actual.jpg",
    // Fecha y hora de inicio: 2 de Octubre 2026 a las 20:00 (8:00 PM)
    fechaInicio: new Date(2026, 9, 2, 20, 0, 0),
    // Fecha y hora de expiración: 2 de Octubre 2026 a las 22:00 (10:00 PM)
    // Concluido el servicio, desaparece de la página principal.
    fechaFin: new Date(2026, 9, 2, 22, 0, 0),
    badge: "¡HOY VIERNES!",
    accentColor: "#6366f1", // Color acento índigo moderno
    badgeBg: "rgba(99, 102, 241, 0.2)",
    badgeBorder: "rgba(99, 102, 241, 0.4)",
    badgeText: "#a5b4fc"
  },
  {
    id: "jpc-2026-10-03",
    ministerio: "Jóvenes Para Cristo (JPC)",
    grupoEdad: "Adolescentes 12 a 17 años",
    lema: "Equipo Ministerial de Jóvenes",
    tema: "¿Y ESO E' PECADO?",
    descripcion: "Nos vemos el sábado a la 7 pm 🍎",
    fechaTexto: "Sábado 3 de Octubre, 2026",
    diaTexto: "Mañana Sábado",
    horaTexto: "7:00 PM - 8:30 PM",
    lugar: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    instagramUrl: "https://www.instagram.com/p/Dd7hBmxJxFZ/",
    instagramUsername: "jovenes_icc",
    portadaUrl: "/servicios/portada-jpc-actual.jpg",
    // Fecha y hora de inicio: 3 de Octubre 2026 a las 19:00 (7:00 PM)
    fechaInicio: new Date(2026, 9, 3, 19, 0, 0),
    // Fecha y hora de expiración: 3 de Octubre 2026 a las 20:30 (8:30 PM)
    // Concluido el servicio, desaparece de la página principal.
    fechaFin: new Date(2026, 9, 3, 20, 30, 0),
    badge: "MAÑANA SÁBADO",
    accentColor: "#f43f5e", // Color acento coral/rojo manzana
    badgeBg: "rgba(244, 63, 94, 0.2)",
    badgeBorder: "rgba(244, 63, 94, 0.4)",
    badgeText: "#fda4af"
  }
];
