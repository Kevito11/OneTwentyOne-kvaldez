import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock, Plus, Star, ExternalLink, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, X } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './Home.css';

// Componente para imágenes del Lightbox con animación fluida onLoad
const LightboxImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <img 
      src={src} 
      alt={alt} 
      onLoad={() => setLoaded(true)}
      className="lightbox-image" 
      onClick={(e) => e.stopPropagation()}
      style={{
        transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'scale(1)' : 'scale(0.97)'
      }}
    />
  );
};

const Home = () => {
  // Countdown Logic (Target: August 29 - Youth Conference)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    let targetDate = new Date(currentYear, 7, 29, 15, 0, 0, 0); // 29 de Agosto, 03:00 PM
    
    // Si ya pasó la fecha de este año, apuntamos al año siguiente
    if (new Date() > targetDate) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return false;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        isExpired: false
      });
      return true;
    };

    const isActive = calculateTimeLeft();

    let interval;
    if (isActive) {
      interval = setInterval(() => {
        const shouldContinue = calculateTimeLeft();
        if (!shouldContinue) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Poster Carousel Logic
  const posterImages = [getImageUrl('/sin-filtro-poster.jpeg'), getImageUrl('/sin-filtros-theme.jpeg')];
  const [activePosterIndex, setActivePosterIndex] = useState(0);
  const [showConfDetails, setShowConfDetails] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePosterIndex((prevIndex) => (prevIndex + 1) % posterImages.length);
    }, 4500); // Transitions every 4.5 seconds
    return () => clearInterval(timer);
  }, [posterImages.length]);

  // FAQ Accordion Active Item
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  // Pastores Data
  const speakers = [
    {
      name: "Pr. Luis Valdera Cáceres",
      role: "Pastor",
      subtitle: "Iglesia Convertidos a Cristo (ICC)",
      desc: "Nació en La Vega en 1955. Graduado en Contabilidad y Administración de empresas. Fue reconocido como pastor a tiempo completo en el año 2000, sirviendo en la edificación de la congregación y el desarrollo de ministerios.",
      image: getImageUrl("/pastores/Pr-Luis-Valdera-Sept-2024.jpg"),
      initials: "LV"
    },
    {
      name: "Pr. Narciso Nadal Ortíz",
      role: "Pastor",
      subtitle: "Iglesia Convertidos a Cristo (ICC)",
      desc: "Nació en 1976 en Santo Domingo. Doctor en Medicina y Maestría en Teología. Fue reconocido como pastor en 2006, sirviendo fielmente en la predicación de la Palabra, la consejería pastoral y el discipulado bíblico.",
      image: getImageUrl("/pastores/Pr-Narciso-Nadal-Sept-2024.jpg"),
      initials: "NN"
    },
    {
      name: "Pr. Santiago Peralta",
      role: "Pastor",
      subtitle: "Iglesia Convertidos a Cristo (ICC)",
      desc: "Ingeniero en Sistemas Informáticos y Maestría en Teología. Con amplia trayectoria en la educación cristiana y docencia teológica, fue ordenado como pastor de la iglesia en agosto de 2024.",
      image: getImageUrl("/pastores/Pr-Santiago-Peralta-Sept-2024.jpg"),
      initials: "SP"
    }
  ];

  // FAQ Data
  const faqs = [
    {
      question: "¿Cuándo y dónde se reúnen los jóvenes?",
      answer: (
        <>
          Contamos con dos cultos de jóvenes que se realizan en las instalaciones de la iglesia:
          <br /><br />
          • <strong>Jóvenes Para Cristo (JPC)</strong>: Diseñado para adolescentes de <strong>12 a 17 años</strong>. Se reúnen los sábados de <strong>7:00 PM a 8:30 PM</strong>.
          <br />
          • <strong>Siervos Para Cristo (OneTwentyOne)</strong>: Diseñado para jóvenes de <strong>18 años en adelante</strong>. Se reúnen cada 15 días los viernes de <strong>8:00 PM a 10:00 PM</strong>.
          <br /><br />
          Para mayor información, avisos especiales y confirmaciones de horarios, te invitamos a estar atento a nuestras cuentas de Instagram:{" "}
          <a 
            href="https://www.instagram.com/jovenes_icc/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}
          >
            @jovenes_icc
          </a>{" "}
          (JPC) y{" "}
          <a 
            href="https://www.instagram.com/onetwentyoneicc/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}
          >
            @onetwentyoneicc
          </a>{" "}
          (Siervos Para Cristo).
        </>
      )
    },
    {
      question: "¿Puedo asistir a las reuniones si no soy miembro de la iglesia?",
      answer: "¡Por supuesto! Nuestras puertas están abiertas para cualquier adolescente, joven o joven adulto que desee visitarnos, sin importar si asiste a otra iglesia o si es su primera vez en una congregación cristiana. ¡Estaremos felices de recibirte!"
    },
    {
      question: "¿La iglesia cuenta con estacionamiento y seguridad?",
      answer: "Sí, las instalaciones de la Iglesia de Convertidos a Cristo (ICC) cuentan con amplios parqueos controlados y un equipo de logística y seguridad para garantizar la tranquilidad de todos los asistentes."
    }
  ];

  // Alfredo Carousel States & Data
  const alfredoImages = [
    '/alfredo/1.jpeg',
    '/alfredo/2.jpeg',
    '/alfredo/3.jpeg',
    '/alfredo/4.jpeg',
    '/alfredo/5.jpeg',
    '/alfredo/6.jpeg',
    '/alfredo/7.jpeg',
    '/alfredo/8.jpeg',
    '/alfredo/9.jpeg'
  ].map(getImageUrl);

  // Comunidad Grid Data
  const comunidadImages = [
    '/comunidad/1.jpg',
    '/comunidad/2.jpg',
    '/comunidad/3.jpg',
    '/comunidad/4.jpg',
    '/comunidad/5.jpg',
    '/comunidad/6.jpg',
    '/comunidad/7.jpg'
  ].map(getImageUrl);
  
  
  const [activeAlfredoSlide, setActiveAlfredoSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [comunidadLightboxIndex, setComunidadLightboxIndex] = useState(null);

  const scrollPositionRef = useRef(null);



  // Lógica de Deslizamiento (Swipe) y Navegación para los Lightboxes de Home
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const isDragging = useRef(false);

  const handleSwipe = (type, isNext) => {
    if (type === 'comunidad') {
      if (isNext && comunidadLightboxIndex < comunidadImages.length - 1) {
        setComunidadLightboxIndex(prev => prev + 1);
      } else if (!isNext && comunidadLightboxIndex > 0) {
        setComunidadLightboxIndex(prev => prev - 1);
      }
    } else if (type === 'speaker') {
      if (isNext && lightboxIndex < alfredoImages.length - 1) {
        setLightboxIndex(prev => prev + 1);
      } else if (!isNext && lightboxIndex > 0) {
        setLightboxIndex(prev => prev - 1);
      }
    }
  };

  const getSwipeHandlers = (type) => {
    return {
      onTouchStart: (e) => {
        setTouchStart(e.targetTouches[0].clientX);
        isDragging.current = false;
      },
      onTouchMove: (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
        if (touchStart && Math.abs(touchStart - e.targetTouches[0].clientX) > 10) {
          isDragging.current = true;
        }
      },
      onTouchEnd: () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (Math.abs(distance) > 50) {
          handleSwipe(type, distance > 0);
        }
        setTouchStart(null);
        setTouchEnd(null);
      },
      onMouseDown: (e) => {
        setDragStart(e.clientX);
        isDragging.current = false;
      },
      onMouseUp: (e) => {
        if (!dragStart) return;
        const distance = dragStart - e.clientX;
        if (Math.abs(distance) > 10) {
          isDragging.current = true;
        }
        if (Math.abs(distance) > 50) {
          handleSwipe(type, distance > 0);
        }
        setDragStart(null);
      }
    };
  };

  const handleOverlayClick = (e, setIndex) => {
    if (isDragging.current) {
      e.stopPropagation();
      return;
    }
    setIndex(null);
  };

  // Bloquear el scroll del fondo cuando el lightbox está abierto (sin visual jumps) y escuchar teclado
  useEffect(() => {
    const isLightboxOpen = lightboxIndex !== null || comunidadLightboxIndex !== null;
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('lightbox-active');
      // Desenfocar cualquier elemento activo para evitar conflictos con el teclado al abrir el lightbox
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-active');
    }

    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxIndex(null);
        setComunidadLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        if (comunidadLightboxIndex !== null && comunidadLightboxIndex < comunidadImages.length - 1) {
          e.preventDefault();
          setComunidadLightboxIndex(prev => prev + 1);
        } else if (lightboxIndex !== null && lightboxIndex < alfredoImages.length - 1) {
          e.preventDefault();
          setLightboxIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (comunidadLightboxIndex !== null && comunidadLightboxIndex > 0) {
          e.preventDefault();
          setComunidadLightboxIndex(prev => prev - 1);
        } else if (lightboxIndex !== null && lightboxIndex > 0) {
          e.preventDefault();
          setLightboxIndex(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, comunidadLightboxIndex]);

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="container hero-container">
          <div className="hero-split-layout">
            <div className="hero-content-col">
              <span className="hero-subtitle">
                <Star size={16} /> Ministerio de Jóvenes ICC
              </span>
              <h1 className="hero-title">
                Jóvenes ICC <br />
                <span className="text-gradient">Vivir es Cristo</span>
              </h1>
              <p className="hero-description">
                Somos la comunidad de jóvenes de la <strong>Iglesia Convertidos a Cristo (ICC)</strong>. Nuestro anhelo es ver a una generación apasionada por Jesús, arraigada en Su Palabra, comprometida con la sana doctrina y capacitada para servir al Señor en espíritu y verdad.
              </p>
              
              <div className="hero-cta">
                <Link to="/registro" className="btn-primary">
                  Registro Gratis
                  <ArrowRight size={20} />
                </Link>
                <a 
                  href="https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-secondary"
                >
                  Ver Ubicación
                  <MapPin size={20} className="meta-icon" />
                </a>
              </div>
            </div>
            
            <div className="hero-featured-col">
              <div className="hero-featured-card glass-panel">
                <div 
                  className="featured-card-image-wrap"
                  onClick={() => setShowConfDetails(true)}
                  style={{ cursor: 'pointer' }}
                  title="Haz clic para ver detalles de la conferencia"
                >
                  <div className="poster-carousel-track">
                    <div className={`poster-carousel-item ${activePosterIndex === 0 ? 'active' : ''}`}>
                      <img src={posterImages[0]} alt="Afiche Conferencia Sin Filtros 2026 - Opción 1" className="featured-card-poster" />
                    </div>
                    <div className={`poster-carousel-item ${activePosterIndex === 1 ? 'active' : ''}`}>
                      <img src={posterImages[1]} alt="Afiche Conferencia Sin Filtros 2026 - Opción 2" className="featured-card-poster" />
                    </div>
                  </div>
                  <div className="featured-card-badge">PRÓXIMO EVENTO</div>
                  <div className="poster-carousel-dots">
                    {posterImages.map((_, idx) => (
                      <button 
                        key={idx} 
                        className={`poster-dot ${activePosterIndex === idx ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setActivePosterIndex(idx);
                        }}
                        aria-label={`Ver afiche ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="featured-card-details">
                  <h3>Conferencia "Sin Filtros" 2026</h3>


                  <div className="featured-card-meta">
                    <Clock size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                    <span>Gratis</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem' }}>
                    <button 
                      onClick={() => setShowConfDetails(true)} 
                      className="btn-secondary-sm"
                      style={{ 
                        flex: 1, 
                        fontSize: '0.85rem', 
                        padding: '0.65rem 1rem', 
                        borderRadius: '50px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: '700',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Ver Info
                    </button>
                    <Link 
                      to="/registro" 
                      className="btn-primary-sm"
                      style={{ flex: 1, margin: 0, padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                    >
                      Registrarse
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="countdown-section">
        <div className="container">
          <div className="countdown-wrapper glass-panel">
            <h2 className="countdown-title">
              {timeLeft.isExpired 
                ? "¡La conferencia 'Sin Filtros' ya ha comenzado!" 
                : "¡La conferencia 'Sin Filtros' está por comenzar!"}
            </h2>
            <div className="countdown-timer">
              <div className="time-block">
                <span className="time-value text-gradient">{timeLeft.days}</span>
                <span className="time-label">Días</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-block">
                <span className="time-value text-gradient">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="time-label">Horas</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-block">
                <span className="time-value text-gradient">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="time-label">Minutos</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-block">
                <span className="time-value text-gradient">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="time-label">Segundos</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="faq-section section-padding" style={{ backgroundColor: 'rgba(10, 10, 10, 0.45)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Preguntas <span className="text-gradient">Frecuentes</span></h2>
            <p>Resuelve tus dudas generales sobre nuestras reuniones, actividades semanales y participación.</p>
          </div>

          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <Plus className="faq-icon" size={20} />
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">
                    <div>{faq.answer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section section-padding" style={{ backgroundColor: 'rgba(10, 10, 10, 0.25)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Nuestra <span className="text-gradient">Comunidad</span></h2>
            <p>Conoce de cerca la vida, comunión y servicio de los jóvenes de la ICC en Santo Domingo.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <a 
                href="https://www.instagram.com/jovenes_icc/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary-sm"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  textDecoration: 'none', 
                  padding: '0.65rem 1.3rem', 
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <span>Instagram JPC (12-17 años): <strong>@jovenes_icc</strong></span>
              </a>
              <a 
                href="https://www.instagram.com/onetwentyoneicc/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary-sm"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  textDecoration: 'none', 
                  padding: '0.65rem 1.3rem', 
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <span>Instagram OneTwentyOne (18+): <strong>@onetwentyoneicc</strong></span>
              </a>
            </div>
          </div>

          <div className="instagram-profile-layout">
            {/* Left Column: Featured Alfredo Post */}
            <div className="instagram-featured-post">
              <span className="profile-section-title">Post Destacado: Alfredo 😎</span>
              
              <div className="instagram-post-card">
                {/* Instagram Header */}
                <div className="instagram-header">
                  <div className="instagram-user-info">
                    <a 
                      href="https://www.instagram.com/onetwentyoneicc/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="instagram-avatar"
                    >
                      <img src={getImageUrl("/logo-121.png")} alt="Logo de Jóvenes ICC" className="instagram-avatar-img" />
                    </a>
                    <div className="instagram-meta">
                      <a 
                        href="https://www.instagram.com/onetwentyoneicc/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="instagram-username"
                      >
                        onetwentyoneicc
                      </a>
                      <span className="instagram-location">Iglesia de Convertidos a Cristo</span>
                    </div>
                  </div>
                  <button className="instagram-more-btn" aria-label="Más opciones">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Instagram Image Slider */}
                <div className="instagram-slider-wrapper">
                  <div className="instagram-slide-counter">
                    {activeAlfredoSlide + 1} / {alfredoImages.length}
                  </div>

                  <div 
                    className="instagram-slider-track"
                    style={{ transform: `translateX(-${activeAlfredoSlide * 100}%)` }}
                  >
                    {alfredoImages.map((imgUrl, idx) => (
                      <div 
                        key={idx} 
                        className="instagram-slide"
                        onClick={() => setLightboxIndex(idx)}
                        title="Haz clic para ver la imagen completa"
                      >
                        <img src={imgUrl} alt={`Alfredo Servidor - Imagen ${idx + 1}`} className="instagram-image" />
                      </div>
                    ))}
                  </div>

                  {/* Slider Navigation */}
                  {activeAlfredoSlide > 0 && (
                    <button 
                      className="instagram-nav-btn prev" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAlfredoSlide(prev => prev - 1);
                      }}
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  {activeAlfredoSlide < alfredoImages.length - 1 && (
                    <button 
                      className="instagram-nav-btn next" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAlfredoSlide(next => next + 1);
                      }}
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>

                {/* Instagram Actions Bar */}
                <div className="instagram-actions">
                  <div className="instagram-actions-left">
                    <div className="instagram-action-btn static" aria-label="Me gusta">
                      <Heart size={22} fill="none" stroke="currentColor" />
                    </div>
                    <div className="instagram-action-btn static" aria-label="Comentar">
                      <MessageCircle size={22} />
                    </div>
                    <div className="instagram-action-btn static" aria-label="Compartir">
                      <Send size={22} />
                    </div>
                  </div>
                  <div className="instagram-action-btn static" aria-label="Guardar">
                    <Bookmark size={22} fill="none" stroke="currentColor" />
                  </div>
                </div>

                {/* Details & Caption */}
                <div className="instagram-details">
                  
                  <div className="instagram-caption">
                    <a 
                      href="https://www.instagram.com/onetwentyoneicc/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="caption-username"
                    >
                      onetwentyoneicc
                    </a>
                    <span className="caption-text">
                      Nuevo año, nuevo semestre, nuevo servidor.😎🔥<br />
                      ¿Quieren conocer a Alfredo en persona? 👀 Te esperamos en la próxima reunión.
                    </span>
                  </div>

                  <div className="instagram-hashtags">
                    <span>#OneTwentyOne #ICC #Alfredo #SinFiltros2026 #NuevoServidor</span>
                  </div>
                  
                  <span className="instagram-date">Hace 2 horas</span>
                </div>
              </div>

              {/* Indicator Dots */}
              <div className="instagram-slider-dots">
                {alfredoImages.map((_, idx) => (
                  <button 
                    key={idx} 
                    className={`instagram-dot ${activeAlfredoSlide === idx ? 'active' : ''}`}
                    onClick={() => setActiveAlfredoSlide(idx)}
                    aria-label={`Ir a la imagen ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Community Grid */}
            <div className="instagram-grid-section">
              <span className="profile-section-title">Momentos de la Comunidad 📸</span>
              <div className="instagram-grid">
                {comunidadImages.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className="instagram-grid-item"
                    onClick={() => setComunidadLightboxIndex(idx)}
                    title="Haz clic para ver a pantalla completa"
                  >
                    <img src={imgUrl} alt={`Momento de la Comunidad ${idx + 1}`} className="instagram-grid-img" />
                    <div className="instagram-grid-overlay">
                      <div className="grid-overlay-stat">
                        <Heart size={18} fill="white" />
                        <span>{Math.floor(40 + idx * 8)}</span>
                      </div>
                      <div className="grid-overlay-stat">
                        <MessageCircle size={18} fill="white" />
                        <span>{Math.floor(2 + idx)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers / Expositores Section */}
      <section className="speakers-section section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Nuestros <span className="text-gradient">Pastores</span></h2>
            <p>Conoce al cuerpo pastoral de nuestra iglesia que nos guía, aconseja e instruye en la sana doctrina de la Palabra de Dios.</p>
          </div>

          <div className="speakers-grid">
            {speakers.map((speaker, idx) => (
              <div key={idx} className="speaker-card glass-panel">
                <div className="speaker-img-wrapper">
                  {speaker.image ? (
                    <img src={speaker.image} alt={speaker.name} className="speaker-img" />
                  ) : (
                    <div className="speaker-avatar-sim">
                      <span>{speaker.initials}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>ICC Santo Domingo</span>
                    </div>
                  )}
                  <span className="speaker-role-badge">{speaker.role}</span>
                </div>
                <h3>{speaker.name}</h3>
                <p className="speaker-subtitle">{speaker.subtitle}</p>
                <p className="speaker-description">{speaker.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <div 
          className="lightbox-overlay" 
          onClick={(e) => handleOverlayClick(e, setLightboxIndex)}
          {...getSwipeHandlers('speaker')}
        >
          <button 
            className="lightbox-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            aria-label="Cerrar vista completa"
          >
            <X size={28} />
          </button>
 
          <div className="lightbox-content">
            <LightboxImage 
              src={alfredoImages[lightboxIndex]} 
              alt="Expositor - Pantalla completa" 
            />
          </div>

          {/* Lightbox navigation buttons */}
          {lightboxIndex > 0 && (
            <button 
              className="lightbox-nav-btn prev" 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(prev => prev - 1);
              }}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={36} />
            </button>
          )}
          {lightboxIndex < alfredoImages.length - 1 && (
            <button 
              className="lightbox-nav-btn next" 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(next => next + 1);
              }}
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Counter pill */}
          <div className="lightbox-counter" onClick={(e) => e.stopPropagation()}>
            {lightboxIndex + 1} / {alfredoImages.length}
          </div>
        </div>
      )}

      {/* Comunidad Lightbox Overlay */}
      {comunidadLightboxIndex !== null && (
        <div 
          className="lightbox-overlay" 
          onClick={(e) => handleOverlayClick(e, setComunidadLightboxIndex)}
          {...getSwipeHandlers('comunidad')}
        >
          <button 
            className="lightbox-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setComunidadLightboxIndex(null);
            }}
            aria-label="Cerrar vista completa"
          >
            <X size={28} />
          </button>
 
          <div className="lightbox-content">
            <LightboxImage 
              src={comunidadImages[comunidadLightboxIndex]} 
              alt="Momento de la Comunidad - Pantalla completa" 
            />
          </div>

          {/* Lightbox navigation buttons */}
          {comunidadLightboxIndex > 0 && (
            <button 
              className="lightbox-nav-btn prev" 
              onClick={(e) => {
                e.stopPropagation();
                setComunidadLightboxIndex(prev => prev - 1);
              }}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={36} />
            </button>
          )}
          {comunidadLightboxIndex < comunidadImages.length - 1 && (
            <button 
              className="lightbox-nav-btn next" 
              onClick={(e) => {
                e.stopPropagation();
                setComunidadLightboxIndex(next => next + 1);
              }}
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Counter pill */}
          <div className="lightbox-counter" onClick={(e) => e.stopPropagation()}>
            {comunidadLightboxIndex + 1} / {comunidadImages.length}
          </div>
        </div>
      )}

      {/* Modal de Detalles de la Conferencia */}
      {showConfDetails && (
        <div className="modal-overlay" onClick={() => setShowConfDetails(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setShowConfDetails(false)}
              aria-label="Cerrar detalles"
            >
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <span className="modal-subtitle">Conferencia "Sin Filtros" 2026</span>
              <h2 className="modal-title text-gradient">Detalles del Evento</h2>
            </div>
            
            <div className="modal-body-scroll">
              {/* Posters Section */}
              <div className="modal-section" style={{ marginBottom: '3rem' }}>
                <h3 className="modal-section-title">Afiches Oficiales</h3>
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                    gap: '2rem', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}
                >
                  <div 
                    className="glass-panel" 
                    style={{ 
                      overflow: 'hidden', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(10, 10, 10, 0.5)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <img 
                      src={posterImages[0]} 
                      alt="Afiche Conferencia Sin Filtros - Opción 1" 
                      style={{ width: '100%', display: 'block', height: 'auto', objectFit: 'cover' }} 
                    />
                  </div>
                  <div 
                    className="glass-panel" 
                    style={{ 
                      overflow: 'hidden', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(10, 10, 10, 0.5)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <img 
                      src={posterImages[1]} 
                      alt="Afiche Conferencia Sin Filtros - Opción 2" 
                      style={{ width: '100%', display: 'block', height: 'auto', objectFit: 'cover' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="modal-section">
                <h3 className="modal-section-title">Programa de la Conferencia</h3>
                <div className="timeline-container">
                  <div className="timeline-item glass-panel">
                    <div className="timeline-time">
                      <span className="time-hour">03:00 PM</span>
                      <span className="time-type">Registro</span>
                    </div>
                    <div className="timeline-details">
                      <h3>Apertura & Registro</h3>
                      <p>El registro de participantes inicia a las 03:00 PM. Los detalles del programa completo se anunciarán próximamente.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="modal-section" style={{ marginTop: '3rem' }}>
                <h3 className="modal-section-title">Ubicación del Evento</h3>
                <div className="location-panel glass-panel" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', padding: '2rem' }}>
                  <div className="location-info-block">
                    <span className="location-badge">Lugar del Evento</span>
                    <h3>Iglesia de Convertidos a Cristo</h3>
                    <p className="location-address" style={{ fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                      Calle Dr. Núñez Domínguez #30,<br />
                      Ensanche La Julia, Santo Domingo 10109,<br />
                      República Dominicana.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <a 
                        href="https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-primary"
                        style={{ width: 'fit-content', padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
                      >
                        <MapPin size={16} />
                        Abrir en Google Maps
                      </a>
                      <a 
                        href="https://www.convertidosacristo.org/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="feature-link"
                        style={{ marginTop: '0.3rem', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}
                      >
                        Web de la Iglesia <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="location-map-mock" style={{ height: '220px' }}>
                    <div className="map-mock-bg"></div>
                    <div className="map-pin-pulse">
                      <div className="pin-icon-wrap" style={{ width: '40px', height: '40px' }}>
                        <MapPin size={20} />
                      </div>
                      <div className="pin-tag" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>ICC Santo Domingo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
