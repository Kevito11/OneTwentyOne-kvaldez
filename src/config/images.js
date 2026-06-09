// Configuración de almacenamiento de imágenes en Supabase Storage
const PROJECT_ID = "ihdgibcvavzjkrcpfscs";
const BUCKET_NAME = "imagens-OneTwentyOne";

const BUCKET_URL = `https://${PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

// Si arrastraste la carpeta "public" completa, las rutas en Supabase tendrán el prefijo "/public/".
// Si arrastraste solo el contenido que estaba dentro de "public" al bucket root, cambia esta variable a false.
const CONTAINS_PUBLIC_FOLDER = true;

/**
 * Obtiene la URL completa de una imagen alojada en Supabase Storage.
 * @param {string} path - Ruta relativa de la imagen (ej. "/pastores/Pr-Luis.jpg" o "sin-filtro-poster.jpeg")
 * @returns {string} - URL pública final de la imagen
 */
export const getImageUrl = (path) => {
  if (!path) return "";
  
  // Si la ruta ya es una URL completa (http/https), la retornamos tal cual
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Normalizar la barra inicial en la ruta
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (CONTAINS_PUBLIC_FOLDER) {
    return `${BUCKET_URL}/public${cleanPath}`;
  }
  
  return `${BUCKET_URL}${cleanPath}`;
};
