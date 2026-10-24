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

export const SERVICIOS_PUBLICACIONES = [];

