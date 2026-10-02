import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, Download, Clock, MapPin, ExternalLink, Sparkles, Flame, Eye, X } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import { SERVICIOS_PUBLICACIONES } from '../../data/serviciosData';
import './ActiveServicesBanner.css';

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const AppleIcon = ({ size = 15, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.06.62-2.72 1.4-.58.67-1.09 1.76-.95 2.82 1.04.08 2.1-.51 2.71-1.26z"/>
  </svg>
);

// Formato UTC estándar para Google Calendar y especificación iCalendar (YYYYMMDDTHHmmssZ)
const formatCalendarUTC = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date(date);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
};

// Generador de enlace directo a Google Calendar (1 clic)
const getGoogleCalendarUrl = (servicio) => {
  const start = formatCalendarUTC(servicio.fechaInicio);
  const end = formatCalendarUTC(servicio.fechaFin);
  const title = `Culto Juvenil: ${servicio.ministerio} - "${servicio.tema}"`;
  const details = `Tema: "${servicio.tema}"\n${servicio.descripcion}\n\nMinisterio: ${servicio.ministerio} (${servicio.grupoEdad})\nLugar: ${servicio.lugar}, Iglesia De Convertidos a Cristo (ICC)\nInstagram: ${servicio.instagramUrl}`;
  const location = `${servicio.lugar}, Iglesia De Convertidos a Cristo (ICC), Santo Domingo`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
};

// Descarga directa de archivo .ics compatible con Apple Calendar, Outlook y agendas de teléfonos
const downloadICSFile = (servicio) => {
  const start = formatCalendarUTC(servicio.fechaInicio);
  const end = formatCalendarUTC(servicio.fechaFin);
  const now = formatCalendarUTC(new Date());

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ministerio de Jovenes ICC//Cultos//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:servicio-${servicio.id}@jovenesicc.org`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Culto Juvenil: ${servicio.ministerio} - "${servicio.tema}"`,
    `DESCRIPTION:${servicio.descripcion.replace(/\n/g, " ")} | Iglesia De Convertidos a Cristo (ICC) | ${servicio.instagramUrl}`,
    `LOCATION:${servicio.lugar}, Iglesia De Convertidos a Cristo (ICC), Santo Domingo`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `culto-${servicio.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Componente de menú sutil para agendar en Google Calendar o Apple/Otra agenda
const CalendarDropdown = ({ servicio, isOpen, onToggle, onClose, direction = 'up', isIconOnly = true }) => {
  return (
    <div className="calendar-dropdown-container">
      <button 
        type="button" 
        className={`btn-calendar-trigger ${isOpen ? 'active' : ''} ${isIconOnly ? 'icon-only' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title="Agendar culto en Google o Apple Calendar"
        aria-label="Agendar culto en calendario"
      >
        <Calendar size={isIconOnly ? 18 : 15} />
        {!isIconOnly && <span>Agendar</span>}
        {!isIconOnly && <ChevronDown size={13} className={`chevron-indicator ${isOpen ? 'open' : ''}`} />}
      </button>

      {isOpen && (
        <div 
          className={`calendar-popover direction-${direction} animate-fade-in`} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popover-title">Agendar en calendario:</div>
          
          <a 
            href={getGoogleCalendarUrl(servicio)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="popover-item"
            onClick={onClose}
          >
            <span className="popover-icon-box google">
              <Calendar size={15} />
            </span>
            <div className="popover-text">
              <strong>Google Agenda</strong>
              <small>Google Calendar (web / app)</small>
            </div>
            <ExternalLink size={12} className="popover-link-icon" />
          </a>

          <button 
            type="button" 
            className="popover-item"
            onClick={() => {
              downloadICSFile(servicio);
              onClose();
            }}
          >
            <span className="popover-icon-box apple">
              <AppleIcon size={15} />
            </span>
            <div className="popover-text">
              <strong>Apple / Otra agenda</strong>
              <small>Calendario del celular (.ics)</small>
            </div>
            <Download size={12} className="popover-link-icon" />
          </button>
        </div>
      )}
    </div>
  );
};

const ActiveServicesBanner = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [previewAll, setPreviewAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Cerrar cualquier popover al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Comprobar parámetros de URL o hash para permitir previsualización de pruebas
  useEffect(() => {
    const checkPreview = () => {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      const isPreview = hash.includes('preview-servicios') || search.get('preview') === 'servicios';
      setPreviewAll(isPreview);
    };

    checkPreview();
    window.addEventListener('hashchange', checkPreview);
    return () => window.removeEventListener('hashchange', checkPreview);
  }, []);

  // Actualizar el reloj cada 30 segundos para garantizar expiración y cambios de estado en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Bloquear scroll si el lightbox de la portada está abierto
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setOpenMenuId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  // Filtrar servicios activos (desaparecen automáticamente cuando currentTime > fechaFin)
  const activeServices = SERVICIOS_PUBLICACIONES.filter(servicio => {
    if (previewAll) return true;
    const fin = new Date(servicio.fechaFin);
    return currentTime <= fin;
  });

  // Si no hay publicaciones activas (todas expiradas), no renderizar nada
  if (activeServices.length === 0) {
    return null;
  }

  // Helper para determinar el estado en tiempo real de cada servicio
  const getLiveStatus = (servicio) => {
    const inicio = new Date(servicio.fechaInicio);
    const fin = new Date(servicio.fechaFin);

    if (currentTime >= inicio && currentTime <= fin) {
      return {
        label: "🔴 ¡EN CURSO AHORA MISMO!",
        isLive: true,
        sublabel: `Concluye a las ${servicio.horaTexto.split('-')[1]?.trim() || 'finalizar'}`
      };
    }

    // Comprobar si es hoy
    const isToday = 
      currentTime.getFullYear() === inicio.getFullYear() &&
      currentTime.getMonth() === inicio.getMonth() &&
      currentTime.getDate() === inicio.getDate();

    if (isToday) {
      const diffMs = inicio - currentTime;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHrs > 0) {
        return {
          label: `⏳ Comienza hoy a las ${servicio.horaTexto.split('-')[0]?.trim()} (en ${diffHrs}h ${diffMins}m)`,
          isLive: false,
          sublabel: `Hora: ${servicio.horaTexto}`
        };
      } else if (diffMins > 0) {
        return {
          label: `⚡ Comienza en solo ${diffMins} minutos`,
          isLive: false,
          sublabel: `¡Ve preparándote!`
        };
      }
    }

    return {
      label: `🗓️ ${servicio.diaTexto} a las ${servicio.horaTexto.split('-')[0]?.trim() || servicio.horaTexto}`,
      isLive: false,
      sublabel: servicio.lugar
    };
  };

  return (
    <section className="active-services-section animate-fade-in" aria-label="Servicios Juveniles de Esta Semana">
      <div className="services-banner-inner">
        {/* Header del Banner */}
        <div className="services-banner-header">
          <div className="services-badge-pill">
            <span className="live-pulse-indicator"></span>
            <Sparkles size={14} className="sparkle-icon" />
            <span>SERVICIOS DE ESTA SEMANA</span>
          </div>

          <h2 className="services-banner-title">
            Próximos <span className="text-gradient">Cultos Juveniles</span>
          </h2>

          <p className="services-banner-desc">
            Publicaciones oficiales de Instagram y temas de nuestros servicios presenciales en la <strong>Iglesia De Convertidos a Cristo (ICC)</strong>.
          </p>
        </div>

        {/* Grid de Servicios Activos */}
        <div className={`services-cards-grid ${activeServices.length === 1 ? 'single-card-layout' : ''}`}>
          {activeServices.map((servicio) => {
            const status = getLiveStatus(servicio);
            const isToday = servicio.badge.includes('HOY');
            const isMenuOpen = openMenuId === 'card-' + servicio.id;

            return (
              <div 
                key={servicio.id} 
                className={`service-card glass-panel ${isMenuOpen ? 'menu-active' : ''}`}
                style={{
                  '--card-accent': servicio.accentColor,
                  zIndex: isMenuOpen ? 50 : 1
                }}
              >
                {/* Portada / Cover Image (Clic para ver imagen completa) */}
                <div 
                  className="service-cover-wrapper"
                  onClick={() => setSelectedImage(servicio)}
                  title="Haz clic para ver la portada en tamaño completo"
                >
                  <img 
                    src={getImageUrl(servicio.portadaUrl)} 
                    alt={`Portada del servicio ${servicio.ministerio} - Tema: ${servicio.tema}`} 
                    className="service-cover-img"
                    loading="eager"
                  />
                  
                  {/* Badge sobre la imagen */}
                  <div 
                    className="service-img-badge"
                    style={{
                      backgroundColor: servicio.badgeBg,
                      borderColor: servicio.badgeBorder,
                      color: servicio.badgeText
                    }}
                  >
                    {isToday ? <Flame size={13} className="badge-icon-fire" /> : <Sparkles size={13} />}
                    <span>{servicio.badge}</span>
                  </div>

                  {/* Instagram icon pill */}
                  <div className="service-insta-corner" title="Publicación oficial de Instagram">
                    <InstagramIcon size={14} />
                    <span>Instagram</span>
                  </div>

                  {/* Hover zoom overlay */}
                  <div className="service-cover-overlay">
                    <Eye size={26} />
                    <span>Ver Portada Completa</span>
                  </div>
                </div>

                {/* Contenido / Información del Servicio */}
                <div className="service-info-col">
                  {/* Etiqueta de ministerio y edad */}
                  <div className="service-top-meta">
                    <span className="service-ministry-tag">
                      {servicio.ministerio}
                    </span>
                    <span className="service-age-badge">
                      {servicio.grupoEdad}
                    </span>
                  </div>

                  {/* Tema del Servicio */}
                  <div className="service-theme-box">
                    <span className="service-theme-label">TEMA DEL SERVICIO:</span>
                    <h3 className="service-theme-title">
                      "{servicio.tema}"
                    </h3>
                  </div>

                  {/* Descripción / Caption del post */}
                  <div className="service-quote-box">
                    <p className="service-caption-text">
                      "{servicio.descripcion}"
                    </p>
                    <a 
                      href={servicio.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="service-account-link"
                    >
                      @{servicio.instagramUsername}
                    </a>
                  </div>

                  {/* Indicador de estado en tiempo real */}
                  <div className={`service-status-pill ${status.isLive ? 'status-live' : ''}`}>
                    <span className="status-label">{status.label}</span>
                  </div>

                  {/* Metadatos (Fecha, Hora, Lugar) */}
                  <div className="service-meta-list">
                    <div className="service-meta-row">
                      <Calendar size={15} className="meta-icon" style={{ color: servicio.accentColor }} />
                      <span>{servicio.fechaTexto}</span>
                    </div>
                    <div className="service-meta-row">
                      <Clock size={15} className="meta-icon" style={{ color: servicio.accentColor }} />
                      <span>{servicio.horaTexto}</span>
                    </div>
                    <div className="service-meta-row">
                      <MapPin size={15} className="meta-icon" style={{ color: servicio.accentColor }} />
                      <a 
                        href={servicio.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="service-location-link"
                        title="Ver ubicación en Google Maps"
                      >
                        {servicio.lugar}
                        <ExternalLink size={11} style={{ marginLeft: '4px' }} />
                      </a>
                    </div>
                  </div>

                  {/* Botones de acción sutiles: Ver afiche completo + Botón Instagram (logo) + Botón Agendar (icono) */}
                  <div className="service-card-actions">
                    <button 
                      type="button" 
                      className="btn-card-expand"
                      onClick={() => setSelectedImage(servicio)}
                      title="Haz clic para ver el afiche completo en pantalla completa"
                    >
                      <Eye size={15} />
                      <span>Ver afiche completo</span>
                    </button>

                    <div className="service-subtle-icons-group">
                      {/* Botón Instagram: solo logo */}
                      <a 
                        href={servicio.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-icon-subtle btn-insta-icon"
                        title="Ver publicación oficial en Instagram"
                        aria-label="Ver en Instagram"
                      >
                        <InstagramIcon size={18} />
                      </a>

                      {/* Botón Agendar: solo icono de calendario */}
                      <CalendarDropdown 
                        servicio={servicio}
                        isOpen={openMenuId === 'card-' + servicio.id}
                        onToggle={() => setOpenMenuId(openMenuId === 'card-' + servicio.id ? null : 'card-' + servicio.id)}
                        onClose={() => setOpenMenuId(null)}
                        direction="up"
                        isIconOnly={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox para ver la portada en TAMAÑO COMPLETO sin obstáculos (Portal directo al body) */}
      {selectedImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="services-lightbox-overlay" 
          onClick={() => {
            setSelectedImage(null);
            setOpenMenuId(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Portada ${selectedImage.ministerio}`}
        >
          <button 
            className="services-lightbox-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
              setOpenMenuId(null);
            }}
            aria-label="Cerrar vista de portada"
            title="Cerrar (Esc)"
          >
            <X size={22} />
          </button>

          <div className="services-lightbox-viewer" onClick={(e) => e.stopPropagation()}>
            {/* Imagen del afiche en pantalla completa sin ningún corte */}
            <img 
              src={getImageUrl(selectedImage.portadaUrl)} 
              alt={`Portada completa ${selectedImage.ministerio} - ${selectedImage.tema}`} 
              className="services-lightbox-poster"
            />

            {/* Barra flotante inferior súper sutil con solo logo Instagram y botón Agendar */}
            <div className="services-lightbox-toolbar">
              <div className="toolbar-info-compact">
                <span className="toolbar-ministry-name">{selectedImage.ministerio}</span>
                <span className="toolbar-theme-quote">"{selectedImage.tema}"</span>
              </div>

              <div className="toolbar-icons-group">
                {/* Botón Instagram: solo logo */}
                <a 
                  href={selectedImage.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-icon-subtle btn-insta-icon"
                  title="Ver publicación oficial en Instagram"
                  aria-label="Ver en Instagram"
                >
                  <InstagramIcon size={18} />
                </a>

                {/* Botón Agendar: solo icono de calendario */}
                <CalendarDropdown 
                  servicio={selectedImage}
                  isOpen={openMenuId === 'lightbox-' + selectedImage.id}
                  onToggle={() => setOpenMenuId(openMenuId === 'lightbox-' + selectedImage.id ? null : 'lightbox-' + selectedImage.id)}
                  onClose={() => setOpenMenuId(null)}
                  direction="up"
                  isIconOnly={true}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default ActiveServicesBanner;
