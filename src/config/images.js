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
  
  let resolvedPath = path;
  let isLocalOverride = false;
  
  if (path === "/media-vigilia-reset.jpeg") {
    resolvedPath = "/media-vigilia-reset.jpeg";
    isLocalOverride = true;
  }
  
  // Dynamic switch starting August 1st, 2026 (yellow) and August 24th, 2026 (orange)
  try {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const now = new Date();
    const targetYellowDate = new Date(2026, 7, 1); // August 1st, 2026
    const targetOrangeDate = new Date(2026, 7, 24); // August 24th, 2026

    const isOrange = hash === "#orange" || (hash !== "#yellow" && now >= targetOrangeDate);
    const isYellow = hash === "#yellow" || (hash !== "#orange" && now >= targetYellowDate && now < targetOrangeDate);

    if (isOrange) {
      if (path === "/sin-filtro-poster.jpeg") {
        resolvedPath = "/expositores-sin-filtros-naranja.jpeg";
        isLocalOverride = true;
      } else if (path === "/sin-filtros-theme.jpeg") {
        resolvedPath = "/conferencia-juvenil-sin-filtros-naranja.jpeg";
        isLocalOverride = true;
      }
    } else if (isYellow) {
      if (path === "/sin-filtro-poster.jpeg") {
        resolvedPath = "/expositores-sin-filtros-amarillo.jpeg";
        isLocalOverride = true;
      } else if (path === "/sin-filtros-theme.jpeg") {
        resolvedPath = "/conferencia-juvenil-sin-filtros-amarillo.jpeg";
        isLocalOverride = true;
      }
    }
  } catch (e) {
    console.error("Error checking date/hash for image override:", e);
  }
  
  let finalUrl = "";
  if (resolvedPath.startsWith("http://") || resolvedPath.startsWith("https://")) {
    finalUrl = resolvedPath;
  } else {
    const cleanPath = resolvedPath.startsWith("/") ? resolvedPath : `/${resolvedPath}`;
    if (!USE_SUPABASE_STORAGE || isLocalOverride) {
      finalUrl = cleanPath; // Return local path directly
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
  "/expositores-sin-filtros-amarillo.jpeg",
  "/conferencia-juvenil-sin-filtros-amarillo.jpeg",
  "/expositores-sin-filtros-naranja.jpeg",
  "/conferencia-juvenil-sin-filtros-naranja.jpeg",
  "/logo-121.png",
  "/merch/Merch SIN FILTROS gorra Frontal.jpeg",
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
