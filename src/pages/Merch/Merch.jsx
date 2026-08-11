import { useState, useEffect, useRef, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ShoppingBag, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './Merch.css';

// Registro Histórico de Mercancía por Actividades (Solo Sin Filtros por ahora)
const ACTIVITIES_MERCH = [
  {
    id: "sin-filtros-2026",
    activityName: "Conferencia \"Sin Filtros\"",
    date: "29 de Agosto, 2026",
    products: [
      {
        id: 1,
        name: "Gorra \"Sin Filtros\"",
        description: "Gorra oficial de la conferencia.",
        type: "cap",
        images: {
          "Negro": {
            front: "/merch/Merch SIN FILTROS gorra Frontal.jpeg",
            back: "/merch/Merch SIN FILTROS gorra 2.jpeg"
          }
        },
        colors: ["Negro"],
        colorHex: {
          "Negro": "#000000"
        },
        sizes: ["Única"]
      },
      {
        id: 2,
        name: "Camiseta \"Sin Filtros\"",
        description: "Camiseta oficial de la conferencia.",
        type: "tshirt",
        images: {
          "Negro": {
            front: "/merch/Merch SIN FILTROS Tshirt frontal 6.jpeg",
            back: "/merch/Merch SIN FILTROS Tshirt atrs 6.jpeg"
          },
          "Gris": {
            front: "/merch/Merch SIN FILTROS Tshirt frontal 4.jpeg",
            back: "/merch/Merch SIN FILTROS Tshirt atrs 4.jpeg"
          },
          "Blanco": {
            front: "/merch/Merch SIN FILTROS Tshirt frontal 3.jpeg",
            back: "/merch/Merch SIN FILTROS Tshirt atrs 3.jpeg"
          }
        },
        colors: ["Negro", "Gris", "Blanco"],
        colorHex: {
          "Negro": "#121212",
          "Gris": "#8A8A8A",
          "Blanco": "#FFFFFF"
        },
        sizes: ["S", "M", "L", "XL"]
      }
    ]
  }
];

// Componente para manejar imágenes con fallback local y detección instantánea de caché
const ImageWithFallback = forwardRef(({ src, localPath, alt, className, style, onLoad }, ref) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const internalRef = useRef(null);
  const imgRef = ref || internalRef;

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (onLoad) onLoad();
    }
  }, [currentSrc]);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={() => {
        if (currentSrc !== localPath) {
          setCurrentSrc(localPath);
        }
      }}
    />
  );
});

// Componente para previsualización premium con transición suave al cambiar de imagen/color
const PremiumImageDisplay = ({ src, localPath, alt, className, style, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  return (
    <div 
      onClick={onClick}
      style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
    >
      <ImageWithFallback
        ref={imgRef}
        src={getImageUrl(src)}
        localPath={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{
          ...style,
          transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(0.97)',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

const Merch = () => {
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Logo, 1: Aviso

  useEffect(() => {
    setCurrentSlide(0);
  }, [expandedActivity]);

  // Lógica de Deslizamiento (Swipe) para el Carrusel de Actividades (Instagram-style)
  const [carouselTouchStart, setCarouselTouchStart] = useState(null);
  const [carouselTouchEnd, setCarouselTouchEnd] = useState(null);

  const handleCarouselSwipe = (isNext) => {
    if (isNext && currentSlide < 1) {
      setCurrentSlide(prev => prev + 1);
    } else if (!isNext && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const onCarouselTouchStart = (e) => {
    setCarouselTouchStart(e.targetTouches[0].clientX);
  };

  const onCarouselTouchMove = (e) => {
    setCarouselTouchEnd(e.targetTouches[0].clientX);
  };

  const onCarouselTouchEnd = () => {
    if (!carouselTouchStart || !carouselTouchEnd) return;
    const distance = carouselTouchStart - carouselTouchEnd;
    if (Math.abs(distance) > 50) {
      handleCarouselSwipe(distance > 0);
    }
    setCarouselTouchStart(null);
    setCarouselTouchEnd(null);
  };

  return (
    <div className="merch-page animate-fade-in section-padding">
      <div className="container">
        
        {/* Header de la Página */}
        <div className="merch-header text-center">
          <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.6rem 1.2rem', borderRadius: '50px', textDecoration: 'none', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          <span className="subtitle">Colección e Historial</span>
          <h1 className="title">Registro de <span className="text-gradient">Mercancía</span></h1>
          <p className="description">
            Explora el catálogo histórico de la mercancía oficial que hemos promovido a lo largo del tiempo en nuestras actividades.
          </p>

        </div>

        {/* Acordeón / Pestaña de Actividades */}
        <div style={{ maxWidth: '420px', margin: '0 auto 4rem auto' }}>
          {ACTIVITIES_MERCH.map(activity => {
            const isActivityOpen = expandedActivity === activity.id;
            return (
              <div 
                key={activity.id} 
                className="activity-accordion-item glass-panel animate-fade-in" 
                style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  transition: 'all 0.3s ease',
                  marginBottom: '1.5rem'
                }}
              >
                {/* Cabecera de la pestaña (Clickable) */}
                <button
                  onClick={() => setExpandedActivity(isActivityOpen ? null : activity.id)}
                  style={{
                    width: '100%',
                    background: isActivityOpen ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    border: 'none',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: '#fff',
                    textAlign: 'left',
                    outline: 'none',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--accent-color, #ffffff)',
                        flexShrink: 0
                      }}
                    >
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                        {activity.activityName}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={13} style={{ color: 'var(--accent-color, #ffffff)' }} />
                        <span>Fecha de la Actividad: <strong>{activity.date}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {isActivityOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Contenido (Productos Grid / Poster / Aviso) */}
                {isActivityOpen && (
                  <div className="accordion-content animate-fade-in" style={{ padding: '2rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    
                    {/* Publicación estilo Instagram (Contenedor compacto centrado) */}
                    <div className="instagram-post-container" style={{ maxWidth: '420px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.015)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      {/* Indicador de Historias / Diapositivas (Estilo Instagram) */}
                      <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                        {[0, 1].map(idx => (
                          <div 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            style={{ 
                              flex: 1, 
                              height: '4px', 
                              background: currentSlide === idx ? 'var(--accent-color, #ffffff)' : (currentSlide > idx ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255,255,255,0.1)'), 
                              borderRadius: '2px', 
                              transition: 'all 0.3s',
                              cursor: 'pointer'
                            }}
                          ></div>
                        ))}
                      </div>

                      {/* Contenedor del carrusel */}
                      <div 
                        className="instagram-carousel-container"
                        onTouchStart={onCarouselTouchStart}
                        onTouchMove={onCarouselTouchMove}
                        onTouchEnd={onCarouselTouchEnd}
                        style={{ border: 'none', background: 'transparent', borderRadius: '10px' }}
                      >
                        <div 
                          className="instagram-carousel-wrapper" 
                          style={{ width: '200%', transform: `translateX(-${currentSlide * 50}%)` }}
                        >
                          {/* DIAPOSITIVA 0: PÓSTER DE LA ACTIVIDAD (Solo el póster) */}
                          <div className="instagram-carousel-slide" style={{ width: '50%', padding: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                              <img 
                                src={getImageUrl('/sin-filtro-poster.jpeg')} 
                                alt="Poster Conferencia Sin Filtros 2026" 
                                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px', objectFit: 'contain', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }} 
                              />
                            </div>
                          </div>

                          {/* DIAPOSITIVA 1: AVISO PLAZO VENCIDO */}
                          <div className="instagram-carousel-slide" style={{ width: '50%', padding: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', padding: '0.5rem 0.25rem' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: '800', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.35rem 0.85rem', borderRadius: '50px' }}>
                                <X size={15} />
                                <span>Plazo de Reservación Vencido</span>
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', padding: '0 0.5rem' }}>
                                La fecha límite para reservar mercancía oficial ha concluido. Recuerda que estos artículos solo estuvieron disponibles bajo la modalidad de reservación previa.
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', width: '100%' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #aaa)', fontWeight: '600', textAlign: 'center' }}>Síguenos en Instagram, donde comunicaremos cualquier novedad:</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                  <a 
                                    href="https://www.instagram.com/jovenes_icc/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '30px', boxShadow: '0 4px 15px rgba(220, 39, 67, 0.15)' }}
                                  >
                                    @jovenes_icc
                                  </a>
                                  <a 
                                    href="https://www.instagram.com/onetwentyoneicc/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '30px', boxShadow: '0 4px 15px rgba(220, 39, 67, 0.15)' }}
                                  >
                                    @onetwentyoneicc
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Control de Diapositivas */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                        <button 
                          disabled={currentSlide === 0}
                          onClick={() => setCurrentSlide(prev => prev - 1)}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '30px',
                            fontWeight: '700',
                            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentSlide === 0 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <ChevronLeft size={14} /> Atrás
                        </button>

                        {/* Dots */}
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {[0, 1].map(idx => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: currentSlide === idx ? 'var(--accent-color, #ffffff)' : 'rgba(255,255,255,0.2)',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              aria-label={`Ir a diapositiva ${idx + 1}`}
                            />
                          ))}
                        </div>

                        <button 
                          disabled={currentSlide === 1}
                          onClick={() => setCurrentSlide(prev => prev + 1)}
                          style={{
                            background: '#ffffff',
                            color: '#000000',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '30px',
                            fontWeight: '700',
                            cursor: currentSlide === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentSlide === 1 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          Siguiente <ChevronRight size={14} />
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Merch;
