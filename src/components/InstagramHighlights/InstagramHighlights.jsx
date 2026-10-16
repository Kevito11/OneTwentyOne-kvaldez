import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  X, 
  Info 
} from 'lucide-react';
import './InstagramHighlights.css';

/**
 * CONFIGURACIÓN DE PUBLICACIONES CON HORARIOS ESTRICTOS
 * 
 * 1. Servicio de Siervos (121):
 *    - Día: Viernes (5)
 *    - Horario: 20:00 (08:00 PM) a 22:00 (10:00 PM)
 *    - Ubicación: Salón Multiusos
 *    - Archivo local: /assets/121.jpeg
 * 
 * 2. Culto de Jóvenes Para Cristo (JOPECE):
 *    - Día: Sábado (6)
 *    - Horario: 19:00 (07:00 PM) a 21:00 (09:00 PM)
 *    - Edades: 12-17
 *    - Ubicación: Salón Multiusos
 *    - Archivos locales: /assets/JPC - 1.jpeg y /assets/JPC - 2.jpeg
 */
const INSTAGRAM_PUBLICATIONS = [
  {
    id: 'siervos-post',
    badge: 'Servicio de Siervos',
    ministerio: 'Siervos Para Cristo · OneTwentyOne',
    titulo: 'Servicio de Siervos',
    subtitulo: 'Jóvenes adultos (18+) · Salón Multiusos',
    horarioTexto: 'Viernes 08:00 PM - 10:00 PM',
    ubicacion: 'Salón Multiusos',
    instagramUrl: 'https://www.instagram.com/p/DehdiWgzxOV/',
    images: [
      '/assets/121.jpeg'
    ],
    schedule: {
      dayOfWeek: 5,   // Viernes
      startHour: 20,  // 08:00 PM (20:00)
      startMinute: 0,
      endHour: 22,    // 10:00 PM (22:00)
      endMinute: 0
    }
  },
  {
    id: 'jopece-post',
    badge: 'Culto de JOPECE · Carrusel',
    ministerio: 'Jóvenes Para Cristo · JOPECE',
    titulo: 'Culto de Jóvenes Para Cristo (JOPECE)',
    subtitulo: 'Adolescentes (Edades 12-17) · Salón Multiusos',
    horarioTexto: 'Sábados 07:00 PM - 09:00 PM',
    ubicacion: 'Salón Multiusos',
    instagramUrl: 'https://www.instagram.com/p/DehVplDETsA/?img_index=1',
    images: [
      '/assets/JPC - 1.jpeg',
      '/assets/JPC - 2.jpeg'
    ],
    schedule: {
      dayOfWeek: 6,   // Sábado
      startHour: 19,  // 07:00 PM (19:00)
      startMinute: 0,
      endHour: 21,    // 09:00 PM (21:00)
      endMinute: 0
    }
  }
];

/**
 * Evaluación estricta de horarios:
 * - Evalúa getDay(), getHours() y getMinutes().
 * - Si currentTime supera endHour:endMinute (ej. Viernes 22:01 para Siervos), isExpired = true (retorna null).
 * - Si currentTime coincide con la ventana del evento, isLive = true (Badge '🔴 EN VIVO').
 * - Si es el mismo día antes del inicio, isToday = true (Badge '⚡ HOY').
 */
export function evaluateEventStatus(post, currentTime) {
  const currentDay = currentTime.getDay(); // 0: Domingo, 1: Lun, ..., 5: Viernes, 6: Sábado
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const targetDay = post.schedule.dayOfWeek;
  const startMinutes = post.schedule.startHour * 60 + post.schedule.startMinute;
  const endMinutes = post.schedule.endHour * 60 + post.schedule.endMinute;

  // 1. Mismo día del servicio
  if (currentDay === targetDay) {
    if (currentMinutes > endMinutes) {
      // Superó la hora final: desaparece de forma estricta del DOM
      return { isExpired: true, isLive: false, isToday: true, badgeText: null };
    }
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      // Coincide con la ventana de tiempo del evento
      return { isExpired: false, isLive: true, isToday: true, badgeText: '🔴 EN VIVO' };
    }
    // Mismo día pero previo a la hora de inicio
    return { isExpired: false, isLive: false, isToday: true, badgeText: '⚡ HOY' };
  }

  // 2. Días posteriores en la semana (evento ya concluido en el ciclo semanal)
  if (targetDay === 5 && (currentDay === 6 || currentDay === 0)) {
    return { isExpired: true, isLive: false, isToday: false, badgeText: null };
  }
  if (targetDay === 6 && currentDay === 0) {
    return { isExpired: true, isLive: false, isToday: false, badgeText: null };
  }

  // 3. Días previos en la semana (anuncio activo)
  const isTomorrow = (currentDay + 1) % 7 === targetDay;
  return { 
    isExpired: false, 
    isLive: false, 
    isToday: false, 
    badgeText: isTomorrow ? '📅 MAÑANA' : null 
  };
}

function PublicationCard({ 
  post, 
  currentTime, 
  forcePreview, 
  onOpenModal 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const images = post.images;
  const hasMultiple = images.length > 1;

  // Evaluación estricta de horarios
  const status = evaluateEventStatus(post, currentTime);

  // Auto-expiración estricta: si concluyó el culto, retorna null y desaparece del DOM
  if (status.isExpired && !forcePreview) {
    return null;
  }

  const badgeLabel = forcePreview ? '🔴 EN VIVO' : status.badgeText;
  const isLivePulse = status.isLive || forcePreview;
  const isTodayBadge = badgeLabel?.includes('⚡') || badgeLabel?.includes('HOY') || badgeLabel?.includes('MAÑANA');

  // Desplazamiento suave para carrusel en escritorio y controles
  const scrollToSlide = (index) => {
    if (!trackRef.current) return;
    const width = trackRef.current.clientWidth;
    trackRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  };

  const nextSlide = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextIdx = (currentIndex + 1) % images.length;
    scrollToSlide(nextIdx);
  };

  const prevSlide = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    scrollToSlide(prevIdx);
  };

  // Sincronización automática de índice y dots con el Scroll Snap nativo
  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Detección de swipe en JOPECE: no activar el modal accidentalmente al deslizar
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    const diffX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (diffX > 8 || diffY > 8) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (isDragging.current) {
      setTimeout(() => {
        isDragging.current = false;
        touchStartX.current = 0;
        touchStartY.current = 0;
      }, 70);
    }
  };

  // Primer clic / toque sobre la foto: activa el Full Screen Modal
  const handlePhotoClick = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpenModal(post.id);
  };

  return (
    <article className="ig-native-card glass-panel">
      {/* Cabecera de la tarjeta */}
      <div className="ig-native-card-header">
        <span className="ig-native-badge">{post.badge}</span>
        <span className="ig-native-ministerio">{post.ministerio}</span>
      </div>

      {/* Visor de Imagen / Carrusel interactivo (Primer clic abre el modal) */}
      <div
        className="ig-native-image-container is-clickable"
        onClick={handlePhotoClick}
        title={`Toca para ver detalles de ${post.titulo}`}
      >
        {/* Badge flotante animado de estado ('🔴 EN VIVO' o '⚡ HOY') */}
        {badgeLabel && (
          <div 
            className={`ig-native-live-badge ${isTodayBadge ? 'ig-badge-today' : 'ig-badge-live'} ${isLivePulse ? 'is-pulsing' : ''}`}
            title="Estado del servicio"
          >
            <span className="ig-native-live-badge-dot" />
            <span>{badgeLabel}</span>
          </div>
        )}

        {/* Carrusel con CSS Scroll Snap nativo */}
        <div
          ref={trackRef}
          className="ig-carousel-track"
          onScroll={handleScroll}
          onTouchStart={hasMultiple ? handleTouchStart : undefined}
          onTouchMove={hasMultiple ? handleTouchMove : undefined}
          onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
        >
          {images.map((src, idx) => (
            <div key={idx} className="ig-carousel-slide">
              <img
                src={src}
                alt={`${post.titulo} - Foto ${idx + 1}`}
                className="ig-native-image"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Contador de fotos (1 / 2) para carrusel */}
        {hasMultiple && (
          <div className="ig-native-counter-pill" title="Publicación con múltiples fotos">
            <Layers size={13} />
            <span>{currentIndex + 1} / {images.length}</span>
          </div>
        )}

        {/* Hint sutil para primer clic */}
        <div className={`ig-tap-hint ${hasMultiple ? 'with-dots' : ''}`}>
          <Info size={12} />
          <span>Toca para ver info</span>
        </div>

        {/* Flechas de navegación para JOPECE */}
        {hasMultiple && (
          <>
            <button
              type="button"
              className="ig-nav-btn ig-nav-prev"
              onClick={prevSlide}
              aria-label="Foto anterior"
              title="Foto anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="ig-nav-btn ig-nav-next"
              onClick={nextSlide}
              aria-label="Siguiente foto"
              title="Siguiente foto"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Puntos de paginación (Dots) */}
        {hasMultiple && (
          <div
            className="ig-dots-row"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`ig-dot-indicator ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollToSlide(idx);
                }}
                aria-label={`Ir a foto ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pie de la tarjeta */}
      <div className="ig-native-footer">
        <div className="ig-native-title-col">
          <h3 className="ig-native-tema">{post.titulo}</h3>
          <span className="ig-native-subtext">{post.subtitulo}</span>
        </div>

        <button
          type="button"
          className="ig-native-details-btn"
          onClick={() => onOpenModal(post.id)}
          title="Ver detalles del culto"
        >
          <span>Detalles</span>
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}

export default function InstagramHighlights() {
  const [activeOverlayId, setActiveOverlayId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [forcePreview, setForcePreview] = useState(false);

  // 1. Detección de parámetro de previsualización para pruebas (#preview-instagram o ?preview=instagram)
  useEffect(() => {
    const evaluatePreview = () => {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      setForcePreview(
        hash.includes('preview-instagram') || 
        hash.includes('preview-servicios') ||
        search.get('preview') === 'instagram'
      );
    };

    evaluatePreview();
    window.addEventListener('hashchange', evaluatePreview);
    return () => window.removeEventListener('hashchange', evaluatePreview);
  }, []);

  // 2. Temporizador en cliente: evalúa cada 30 segundos si la actividad venció o cambió de estado
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // 3. Bloquear scroll del fondo y cerrar con tecla Escape al abrir el Full Screen Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveOverlayId(null);
      }
    };

    if (activeOverlayId) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeOverlayId]);

  // 4. Filtrar publicaciones vigentes mediante evaluación estricta de días y horas
  const activePosts = INSTAGRAM_PUBLICATIONS.filter(post => {
    if (forcePreview) return true;
    const status = evaluateEventStatus(post, currentTime);
    return !status.isExpired;
  });

  // 5. AUTO-DESTRUCCIÓN: si todas las publicaciones expiran, retorna null (cero espacios vacíos)
  if (activePosts.length === 0) {
    return null;
  }

  // Identificar la publicación activa para el Full Screen Modal
  const activePost = INSTAGRAM_PUBLICATIONS.find(p => p.id === activeOverlayId);

  return (
    <section className="ig-native-section" aria-label="Novedades y Anuncios de Instagram">
      <div className="ig-native-header">
        <span className="ig-native-kicker">
          <Sparkles size={14} />
          <span>Actividades & Cultos</span>
        </span>
        <h2 className="ig-native-section-title">Últimas Publicaciones</h2>
      </div>

      <div className={`ig-native-grid ig-grid-count-${activePosts.length}`}>
        {activePosts.map(post => (
          <PublicationCard
            key={post.id}
            post={post}
            currentTime={currentTime}
            forcePreview={forcePreview}
            onOpenModal={(id) => setActiveOverlayId(id)}
          />
        ))}
      </div>

      {/* =========================================================
          FULL SCREEN MODAL (CUBRE TODA LA PANTALLA CON POSITION: FIXED)
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999;
          Fondo oscuro rgba(0,0,0,0.9) con backdrop-filter: blur(10px) y centrado con Flexbox.
         ========================================================= */}
      {activePost && typeof document !== 'undefined' && createPortal(
        <div 
          className="ig-fullscreen-modal-backdrop"
          onClick={() => setActiveOverlayId(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Botón claro con 'X' en la esquina superior derecha de la pantalla */}
          <button
            type="button"
            className="ig-modal-screen-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setActiveOverlayId(null);
            }}
            aria-label="Cerrar modal"
            title="Cerrar"
          >
            <X size={26} />
          </button>

          {/* Diálogo central del modal (Centrado vertical y horizontalmente con Flexbox) */}
          <div 
            className="ig-fullscreen-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="ig-overlay-badge">{activePost.badge}</span>
            <h3 className="ig-overlay-title">{activePost.titulo}</h3>
            <p className="ig-overlay-subtext">{activePost.subtitulo}</p>

            {/* Dos pastillas visuales oscuras con bordes sutiles */}
            <div className="ig-overlay-pills">
              <div className="ig-overlay-pill">
                <Clock size={17} className="ig-pill-icon" />
                <span>{activePost.horarioTexto}</span>
              </div>
              <div className="ig-overlay-pill">
                <MapPin size={17} className="ig-pill-icon" />
                <span>{activePost.ubicacion}</span>
              </div>
            </div>

            {/* Segundo clic: Botón grande y ancho con degradado hacia Instagram */}
            <a
              href={activePost.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ig-overlay-cta-btn"
              onClick={(e) => e.stopPropagation()}
              title="Ver publicación completa en Instagram"
            >
              <span>Ver publicación completa en Instagram</span>
              <ArrowUpRight size={17} />
            </a>

            <span className="ig-overlay-hint">Toca fuera o la X para cerrar</span>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
