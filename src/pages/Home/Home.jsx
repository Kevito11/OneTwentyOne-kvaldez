import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock, HelpCircle, Plus, Star, ExternalLink, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, X } from 'lucide-react';
import './Home.css';

const Home = () => {
  // Countdown Logic (Target: August 28 - Youth Conference)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setMonth(7); // August (0-indexed is 7)
    targetDate.setDate(29);
    targetDate.setHours(8, 30, 0, 0); // Saturday 8:30 AM opening
    
    // If we are already past August 28 this year, set for next year
    if (new Date() > targetDate) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Schedule state is no longer needed since it's a single-day event

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
      name: "Pr. José Mallén Malla",
      role: "Pastor Fundador",
      subtitle: "Iglesia Convertidos a Cristo (ICC)",
      desc: "Nació en 1949 en San Pedro de Macorís. Arquitecto de profesión. Llamado al ministerio en 1981, sirvió fielmente por 40 años guiando a la congregación en Santo Domingo hasta su partida con el Señor en junio de 2021.",
      image: "/pastores/mallen.jpg",
      initials: "JM"
    },
    {
      name: "Pr. Luis Valdera Cáceres",
      role: "Pastor",
      subtitle: "Iglesia Convertidos a Cristo (ICC)",
      desc: "Nació en La Vega en 1955. Graduado en Contabilidad y Administración de empresas. Fue reconocido como pastor a tiempo completo en el año 2000, sirviendo en la edificación de la congregación y el desarrollo de ministerios.",
      image: "/pastores/luis.png",
      initials: "LV"
    },
    {
      name: "Pr. Narciso Nadal Ortíz",
      role: "Pastor de Jóvenes",
      subtitle: "Joven para Cristo / ICC",
      desc: "Nació en 1976 en Santo Domingo. Doctor en Medicina y Maestría en Teología. Reconocido como pastor en 2006, trabaja de lleno con el ministerio de Joven para Cristo y el discipulado bíblico juvenil.",
      image: "/pastores/narciso.png",
      initials: "NN"
    },
    {
      name: "Pr. Santiago Peralta",
      role: "Pastor",
      subtitle: "Iglesia Convertidos a Cristo (ICC)",
      desc: "Ingeniero en Sistemas Informáticos y Maestría en Teología. Con amplia trayectoria en la educación cristiana y docencia teológica, fue ordenado como pastor de la iglesia en agosto de 2024.",
      image: "/pastores/santiago.jpg",
      initials: "SP"
    }
  ];

  // FAQ Data
  const faqs = [
    {
      question: "¿La conferencia tiene algún costo?",
      answer: "No, la conferencia de jóvenes 'Sin Filtro' es 100% gratis. Nuestro anhelo es que todos los jóvenes puedan participar. Sin embargo, los cupos son limitados por espacio y es obligatorio registrarse para asegurar tu entrada."
    },
    {
      question: "¿Quiénes pueden participar del evento?",
      answer: "El evento está diseñado para adolescentes, jóvenes y jóvenes adultos (entre 12 y 35 años) que deseen profundizar en su fe, conocer nuevos hermanos en Cristo y crecer espiritualmente."
    },
    {
      question: "¿La iglesia cuenta con estacionamiento y seguridad?",
      answer: "Sí, las instalaciones de la Iglesia Convertidas a Cristo (ICC) cuentan con amplios parqueos controlados y un equipo de logística y seguridad para garantizar la tranquilidad de todos los asistentes."
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
  ];

  // Comunidad Grid Data
  const comunidadImages = [
    '/comunidad/1.jpg',
    '/comunidad/2.jpg',
    '/comunidad/3.jpg',
    '/comunidad/4.jpg',
    '/comunidad/5.jpg',
    '/comunidad/6.jpg',
    '/comunidad/7.jpg'
  ];
  
  const [activeAlfredoSlide, setActiveAlfredoSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [comunidadLightboxIndex, setComunidadLightboxIndex] = useState(null);

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
                OneTwentyOne <br />
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
                <div className="featured-card-image-wrap">
                  <img src="/sin-filtro-poster.jpeg" alt="Afiche Conferencia Sin Filtro 2026" className="featured-card-poster" />
                  <div className="featured-card-badge">PRÓXIMO EVENTO</div>
                </div>
                <div className="featured-card-details">
                  <h3>Conferencia "Sin Filtro" 2026</h3>
                  <div className="featured-card-meta">
                    <Calendar size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                    <span>29 de Agosto</span>
                    <span className="separator">•</span>
                    <Clock size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                    <span>Gratis</span>
                  </div>
                  <Link to="/registro" className="btn-primary-sm">
                    Asegurar Entrada Gratis
                  </Link>
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
            <h2 className="countdown-title">¡La conferencia "Sin Filtro" está por comenzar!</h2>
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

      {/* Schedule / Programa Section */}
      <section className="schedule-section section-padding" style={{ backgroundColor: 'rgba(10, 10, 10, 0.45)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Programa de la <span className="text-gradient">Conferencia</span></h2>
            <p>Un día intensivo de plenarias y un poderoso tiempo de adoración y comunión.</p>
          </div>

          <div className="timeline-container">
            <div className="timeline-item glass-panel">
              <div className="timeline-time">
                <span className="time-hour">8:30 AM</span>
                <span className="time-type">Registro</span>
              </div>
              <div className="timeline-details">
                <h3>Registro & Bienvenida</h3>
                <p>Entrega de credenciales y materiales oficiales de la conferencia.</p>
              </div>
            </div>

            <div className="timeline-item glass-panel">
              <div className="timeline-time">
                <span className="time-hour">9:00 AM</span>
                <span className="time-type">Apertura</span>
              </div>
              <div className="timeline-details">
                <h3>Plenaria 1: Cimientos Firmes</h3>
                <p>Tiempo de alabanza y adoración con OneTwentyOne Worship, seguido de la primera plenaria de exposición doctrinal.</p>
              </div>
            </div>

            <div className="timeline-item glass-panel">
              <div className="timeline-time">
                <span className="time-hour">10:30 AM</span>
                <span className="time-type">Receso</span>
              </div>
              <div className="timeline-details">
                <h3>Receso & Comunión</h3>
                <p>Espacio para compartir con otros jóvenes y disfrutar de un tiempo de comunión y refrigerio ligero.</p>
              </div>
            </div>

            <div className="timeline-item glass-panel">
              <div className="timeline-time">
                <span className="time-hour">11:00 AM</span>
                <span className="time-type">Plenaria</span>
              </div>
              <div className="timeline-details">
                <h3>Plenaria 2: En la Brecha</h3>
                <p>Exposición bíblica enfocada en el testimonio y la firmeza del carácter cristiano frente a la cultura actual.</p>
              </div>
            </div>

            <div className="timeline-item glass-panel">
              <div className="timeline-time">
                <span className="time-hour">12:30 PM</span>
                <span className="time-type">Cierre</span>
              </div>
              <div className="timeline-details">
                <h3>Plenaria 3: Envío & Sesión de Q&A</h3>
                <p>Plenaria final de consagración seguida de un bloque interactivo de preguntas y respuestas con nuestros expositores pastorales.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Cómo <span className="text-gradient">Llegar</span></h2>
            <p>El evento se llevará a cabo en el templo principal de la Iglesia Convertidas a Cristo en Santo Domingo.</p>
          </div>

          <div className="location-panel glass-panel">
            <div className="location-info-block">
              <span className="location-badge">Lugar del Evento</span>
              <h3>Iglesia Convertidas a Cristo</h3>
              <p className="location-address">
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
                  style={{ width: 'fit-content' }}
                >
                  <MapPin size={18} />
                  Abrir en Google Maps
                </a>
                <a 
                  href="https://www.convertidosacristo.org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="feature-link"
                  style={{ marginTop: '0.5rem', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  Web de la Iglesia <ExternalLink size={14} />
                </a>
              </div>
            </div>
            
            <div className="location-map-mock">
              <div className="map-mock-bg"></div>
              <div className="map-pin-pulse">
                <div className="pin-icon-wrap">
                  <MapPin size={24} />
                </div>
                <div className="pin-tag">ICC Santo Domingo</div>
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
            <p>Aclara tus dudas sobre el registro, accesos y logística de la Conferencia "Sin Filtro".</p>
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
                    <p>{faq.answer}</p>
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
                      <img src="/logo-121.png" alt="121 Logo" className="instagram-avatar-img" />
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
                      <span className="instagram-location">Iglesia Convertidas a Cristo</span>
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
                    <span>#OneTwentyOne #ICC #Alfredo #SinFiltro2026 #NuevoServidor</span>
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

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <button 
            className="lightbox-close-btn" 
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar vista completa"
          >
            <X size={28} />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={alfredoImages[lightboxIndex]} 
              alt={`Alfredo Servidor - Pantalla completa ${lightboxIndex + 1}`} 
              className="lightbox-image" 
            />

            {/* Lightbox navigation */}
            {lightboxIndex > 0 && (
              <button 
                className="lightbox-nav-btn prev" 
                onClick={() => setLightboxIndex(prev => prev - 1)}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={36} />
              </button>
            )}
            {lightboxIndex < alfredoImages.length - 1 && (
              <button 
                className="lightbox-nav-btn next" 
                onClick={() => setLightboxIndex(next => next + 1)}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={36} />
              </button>
            )}

            {/* Counter pill */}
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {alfredoImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Comunidad Lightbox Overlay */}
      {comunidadLightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setComunidadLightboxIndex(null)}>
          <button 
            className="lightbox-close-btn" 
            onClick={() => setComunidadLightboxIndex(null)}
            aria-label="Cerrar vista completa"
          >
            <X size={28} />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={comunidadImages[comunidadLightboxIndex]} 
              alt={`Momento de la Comunidad - Pantalla completa ${comunidadLightboxIndex + 1}`} 
              className="lightbox-image" 
            />

            {/* Lightbox navigation */}
            {comunidadLightboxIndex > 0 && (
              <button 
                className="lightbox-nav-btn prev" 
                onClick={() => setComunidadLightboxIndex(prev => prev - 1)}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={36} />
              </button>
            )}
            {comunidadLightboxIndex < comunidadImages.length - 1 && (
              <button 
                className="lightbox-nav-btn next" 
                onClick={() => setComunidadLightboxIndex(next => next + 1)}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={36} />
              </button>
            )}

            {/* Counter pill */}
            <div className="lightbox-counter">
              {comunidadLightboxIndex + 1} / {comunidadImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
