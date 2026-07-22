// Configuración de almacenamiento de imágenes en Supabase Storage
const USE_SUPABASE_STORAGE = true;

const PROJECT_ID = "ihdgibcvavzjkrcpfscs";
const BUCKET_NAME = "imagens-OneTwentyOne";
const BUCKET_URL = `https://${PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;
const CONTAINS_PUBLIC_FOLDER = true;

// Mapa en memoria RAM del navegador para almacenar imágenes precargadas
const imageMemoryCache = new Map();

/**
 * Obtiene la URL completa de una imagen alojada en Supabase Storage
 * y la precarga automáticamente en la memoria RAM del navegador.
 * @param {string} path - Ruta relativa de la imagen (ej. "/pastores/Pr-Luis.jpg")
 * @returns {string} - URL pública final de la imagen en Supabase
 */
export const getImageUrl = (path) => {
  if (!path) return "";
  
  let finalUrl = "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    finalUrl = path;
  } else {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (!USE_SUPABASE_STORAGE) {
      finalUrl = cleanPath;
    } else if (CONTAINS_PUBLIC_FOLDER) {
      finalUrl = `${BUCKET_URL}/public${cleanPath}`;
    } else {
      finalUrl = `${BUCKET_URL}${cleanPath}`;
    }
  }

  // Guardar en la memoria RAM del navegador si aún no ha sido cargada
  if (finalUrl && typeof window !== "undefined" && !imageMemoryCache.has(finalUrl)) {
    const img = new Image();
    img.src = finalUrl;
    imageMemoryCache.set(finalUrl, img);
  }

  return finalUrl;
};

/**
 * Precarga de forma masiva una lista de rutas de imágenes en la memoria RAM.
 * @param {string[]} paths - Lista de rutas relativas o URLs de imágenes
 */
export const preloadImages = (paths = []) => {
  if (!Array.isArray(paths)) return;
  paths.forEach((p) => getImageUrl(p));
};

// Lista de imágenes clave para precargar automáticamente en memoria al iniciar la aplicación
export const CRITICAL_IMAGES = [
  "/sin-filtro-poster.jpeg",
  "/sin-filtros-theme.jpeg",
  "/logo-121.png",
  "/merch/Merch SIN FILTROS gorra 1.jpeg",
  "/merch/Merch SIN FILTROS gorra 2.jpeg",
  "/merch/Merch SIN FILTROS Tshirt frontal 6.jpeg",
  "/merch/Merch SIN FILTROS Tshirt atrs 6.jpeg",
  "/merch/Merch SIN FILTROS Tshirt frontal 4.jpeg",
  "/merch/Merch SIN FILTROS Tshirt atrs 4.jpeg",
  "/merch/Merch SIN FILTROS Tshirt frontal 3.jpeg",
  "/merch/Merch SIN FILTROS Tshirt atrs 3.jpeg",
  "/pastores/Pr-Luis-Valdera-Sept-2024.jpg",
  "/pastores/Pr-Narciso-Nadal-Sept-2024.jpg",
  "/pastores/Pr-Santiago-Peralta-Sept-2024.jpg"
];

// Precarga automática al cargar el módulo en el navegador
if (typeof window !== "undefined") {
  preloadImages(CRITICAL_IMAGES);
}
