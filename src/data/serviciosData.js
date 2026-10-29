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
    id: "121-2026-10-30",
    ministerio: "Siervos Para Cristo (OneTwentyOne)",
    grupoEdad: "Jóvenes 18+ años",
    lema: "Siervos Para Cristo",
    tema: "LA IRA Y YO",
    descripcion: "¡Nos vemos este viernes! 🙌🏼❤️",
    fechaTexto: "Viernes 30 de Octubre, 2026",
    diaTexto: "Este Viernes",
    horaTexto: "8:00 PM - 10:00 PM",
    lugar: "Salón Multiusos ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    instagramUrl: "https://www.instagram.com/p/DfBGU4BTmKz/",
    instagramUsername: "onetwentyoneicc",
    portadaUrl: "/servicios/121-30-10-2026.jpeg",
    // Fecha y hora de inicio: Viernes 30 de Octubre 2026 a las 20:00 (8:00 PM)
    fechaInicio: new Date(2026, 9, 30, 20, 0, 0),
    // Fecha y hora de expiración: Viernes 30 de Octubre 2026 a las 22:00 (10:00 PM)
    fechaFin: new Date(2026, 9, 30, 22, 0, 0),
    badge: "ESTE VIERNES",
    accentColor: "#ef4444", // Color acento rojo vino acorde al afiche
    badgeBg: "rgba(239, 68, 68, 0.2)",
    badgeBorder: "rgba(239, 68, 68, 0.45)",
    badgeText: "#fca5a5"
  },
  {
    id: "jpc-2026-10-31",
    ministerio: "Jóvenes Para Cristo (JOTAPECE)",
    grupoEdad: "Adolescentes 12 a 17 años",
    lema: "Equipo Ministerial de Jóvenes",
    tema: "CONTENIDO BLOQUEADO",
    subtema: "Solamente para Jotapece",
    descripcion: "¿Quieres desbloquear el contenido? 👀🔍 Nos vemos el sábado a las 7 pm 🙂‍↕️",
    fechaTexto: "Sábado 31 de Octubre, 2026",
    diaTexto: "Este Sábado",
    horaTexto: "7:00 PM - 8:30 PM",
    lugar: "Salón Multiusos ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    instagramUrl: "https://www.instagram.com/p/DfCcEeLxSWY/",
    instagramUsername: "jovenes_icc",
    portadaUrl: "/servicios/JOTAPECE-31-10-2026.jpeg",
    // Fecha y hora de inicio: Sábado 31 de Octubre 2026 a las 19:00 (7:00 PM)
    fechaInicio: new Date(2026, 9, 31, 19, 0, 0),
    // Fecha y hora de expiración: Sábado 31 de Octubre 2026 a las 20:30 (8:30 PM)
    fechaFin: new Date(2026, 9, 31, 20, 30, 0),
    badge: "ESTE SÁBADO",
    accentColor: "#eab308", // Color acento dorado acorde al afiche
    badgeBg: "rgba(234, 179, 8, 0.2)",
    badgeBorder: "rgba(234, 179, 8, 0.45)",
    badgeText: "#fde047"
  }
];


