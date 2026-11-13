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
    id: "121-2026-11-13",
    ministerio: "Siervos Para Cristo (OneTwentyOne)",
    grupoEdad: "Jóvenes 18+ años",
    lema: "Siervos Para Cristo",
    tema: "¿ESTÁS SEGURO?",
    descripcion: "¡Nos vemos este viernes! 🙌🏼❤️",
    fechaTexto: "Viernes 13 de Noviembre, 2026",
    diaTexto: "Este Viernes",
    horaTexto: "8:00 PM - 10:00 PM",
    lugar: "Salón Multiusos ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    instagramUrl: "https://www.instagram.com/onetwentyoneicc/",
    instagramUsername: "onetwentyoneicc",
    portadaUrl: "/servicios/121-13-11-2026.jpeg",
    // Fecha y hora de inicio: Viernes 13 de Noviembre 2026 a las 20:00 (8:00 PM)
    fechaInicio: new Date(2026, 10, 13, 20, 0, 0),
    // Fecha y hora de expiración: Viernes 13 de Noviembre 2026 a las 22:00 (10:00 PM)
    fechaFin: new Date(2026, 10, 13, 22, 0, 0),
    badge: "ESTE VIERNES",
    accentColor: "#ffffff",
    badgeBg: "rgba(255, 255, 255, 0.15)",
    badgeBorder: "rgba(255, 255, 255, 0.35)",
    badgeText: "#ffffff"
  }
];


