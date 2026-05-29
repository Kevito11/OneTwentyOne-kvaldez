import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock, HelpCircle, Plus, Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
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
    targetDate.setDate(28);
    targetDate.setHours(19, 0, 0, 0); // Friday 7:00 PM opening
    
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

  // Schedule Active Tab
  const [activeTab, setActiveTab] = useState('friday');

  // FAQ Accordion Active Item
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  // Speakers Data
  const speakers = [
    {
      name: "Ps. Narciso Nadal",
      role: "Expositor Bíblico",
      subtitle: "Pastor de la Iglesia Convertidos a Cristo (ICC)",
      desc: "Pastor y maestro dedicado a la proclamación fiel de la Palabra de Dios y al discipulado de la juventud en la sana doctrina.",
      initials: "NN"
    },
    {
      name: "Ps. Sigfrido Guillén",
      role: "Expositor Bíblico",
      subtitle: "Pastor de la Iglesia Convertidos a Cristo (ICC)",
      desc: "Pastor enfocado en la enseñanza bíblica y apologética práctica, capacitando a las nuevas generaciones para defender su fe con convicción.",
      initials: "SG"
    },
    {
      name: "Hno. Julián Musa",
      role: "Expositor Bíblico",
      subtitle: "Predicador & Líder ICC",
      desc: "Predicador apasionado por el Evangelio, comprometido en guiar a la juventud a vivir con un corazón sincero y una fe inquebrantable sin filtros.",
      initials: "JM"
    },
    {
      name: "OneTwentyOne Worship",
      role: "Alabanza & Adoración",
      subtitle: "Ministerio de Música",
      desc: "Banda de jóvenes de la ICC, dedicada a exaltar a Jesús y guiar a esta generación a adorar al Padre en espíritu y en verdad.",
      initials: "121"
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
      question: "¿Se incluye alimentación durante la conferencia?",
      answer: "¡Sí! El almuerzo del día sábado y refrigerios selectos están incluidos de manera totalmente gratuita para todas las personas que se registren previamente en nuestra página web."
    },
    {
      question: "¿La iglesia cuenta con estacionamiento y seguridad?",
      answer: "Sí, las instalaciones de la Iglesia Convertidos a Cristo (ICC) cuentan con amplios parqueos controlados y un equipo de logística y seguridad para garantizar la tranquilidad de todos los asistentes."
    }
  ];

  // Carousel Logic for "Nuestra Comunidad"
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 6;
  const [visibleSlides, setVisibleSlides] = useState(3);
  const autoPlayRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setVisibleSlides(1);
      } else if (window.innerWidth <= 900) {
        setVisibleSlides(2);
      } else {
        setVisibleSlides(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = totalSlides - visibleSlides;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-play cycle
  useEffect(() => {
    autoPlayRef.current = nextSlide;
  });

  useEffect(() => {
    const play = () => {
      autoPlayRef.current();
    };
    const interval = setInterval(play, 4000);
    return () => clearInterval(interval);
  }, [visibleSlides]);

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
                    <span>28 y 29 de Agosto</span>
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
            <h2>Expositores e <span className="text-gradient">Invitados</span></h2>
            <p>Conoce a los pastores y líderes que nos estarán acompañando para impartir la Palabra de Dios y guiar la adoración.</p>
          </div>

          <div className="speakers-grid">
            {speakers.map((speaker, idx) => (
              <div key={idx} className="speaker-card glass-panel">
                <div className="speaker-img-wrapper">
                  <div className="speaker-avatar-sim">
                    <span>{speaker.initials}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>ICC Santo Domingo</span>
                  </div>
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
            <p>Dos días intensivos de plenarias, talleres especializados y un poderoso tiempo de adoración.</p>
          </div>

          <div className="schedule-tabs">
            <button 
              className={`tab-btn ${activeTab === 'friday' ? 'active' : ''}`}
              onClick={() => setActiveTab('friday')}
            >
              Viernes 28 de Agosto
            </button>
            <button 
              className={`tab-btn ${activeTab === 'saturday' ? 'active' : ''}`}
              onClick={() => setActiveTab('saturday')}
            >
              Sábado 29 de Agosto
            </button>
          </div>

          <div className="timeline-container">
            {activeTab === 'friday' ? (
              <>
                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">6:30 PM</span>
                    <span className="time-type">Entrada</span>
                  </div>
                  <div className="timeline-details">
                    <h3>Registro & Bienvenida</h3>
                    <p>Entrega de credenciales, pulseras de acceso y asignación de materiales oficiales de la conferencia.</p>
                  </div>
                </div>

                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">7:00 PM</span>
                    <span className="time-type">Apertura</span>
                  </div>
                  <div className="timeline-details">
                    <h3>Plenaria 1: Cimientos Firmes</h3>
                    <p>Tiempo inicial de alabanza a cargo de OneTwentyOne Worship, seguido de la primera plenaria de exposición doctrinal impartida por nuestro cuerpo pastoral.</p>
                  </div>
                </div>

                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">8:30 PM</span>
                    <span className="time-type">Especial</span>
                  </div>
                  <div className="timeline-details">
                    <h3>OneTwentyOne Worship Night</h3>
                    <p>Noche extendida de adoración en espíritu y verdad. Un espacio íntimo para buscar la presencia del Señor y orar en comunidad.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">9:00 AM</span>
                    <span className="time-type">Mañana</span>
                  </div>
                  <div className="timeline-details">
                    <h3>Oración & Alabanza Colectiva</h3>
                    <p>Comienzo del segundo día con un devocional de oración comunitaria y adoración.</p>
                  </div>
                </div>

                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">9:30 AM</span>
                    <span className="time-type">Plenaria</span>
                  </div>
                  <div className="timeline-details">
                    <h3>Plenaria 2: En la Brecha</h3>
                    <p>Exposición bíblica enfocada en la santidad, el carácter cristiano en la juventud actual y el llamado al servicio activo en el Reino.</p>
                  </div>
                </div>

                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">11:00 AM</span>
                    <span className="time-type">Talleres</span>
                  </div>
                  <div className="timeline-details">
                    <h3>Talleres Prácticos & Apologética</h3>
                    <p>Talleres simultáneos donde abordaremos temas de relevancia cultural, defensa de la fe y el evangelio en una cultura hiperconectada.</p>
                  </div>
                </div>

                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">1:00 PM</span>
                    <span className="time-type">Comunión</span>
                  </div>
                  <div className="timeline-details">
                    <h3>Almuerzo & Convivencia (Gratis)</h3>
                    <p>Almuerzo de cortesía incluido para todos los jóvenes registrados. Espacio de esparcimiento, música en vivo y juegos en los patios de la iglesia.</p>
                  </div>
                </div>

                <div className="timeline-item glass-panel">
                  <div className="timeline-time">
                    <span className="time-hour">3:00 PM</span>
                    <span className="time-type">Cierre</span>
                  </div>
                  <div className="timeline-details">
                    <h3>Plenaria 3: Comisionados a Servir & Mesa Redonda</h3>
                    <p>Plenaria final de envío misionero, seguida de una sesión interactiva de preguntas y respuestas (Q&A) con los pastores, resolviendo inquietudes bíblicas y teológicas enviadas por los jóvenes.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section section-padding" style={{ backgroundColor: 'rgba(10, 10, 10, 0.25)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Nuestra <span className="text-gradient">Comunidad</span></h2>
            <p>Así vivimos la fe, el discipulado y el servicio en las actividades de jóvenes de la ICC.</p>
          </div>

          <div className="carousel-wrapper">
            <button className="carousel-nav-btn prev" onClick={prevSlide} aria-label="Anterior">
              <ChevronLeft size={24} />
            </button>
            
            <div className="carousel-track-container">
              <div 
                className="carousel-track" 
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / visibleSlides)}%)`,
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="carousel-slide-item" style={{ width: `${100 / visibleSlides}%` }}>
                  <div className="gallery-item glass-panel">
                    <img src="/camp-photo-1.jpg" alt="Momentos de Comunión 1" />
                    <div className="gallery-overlay">
                      <span>Comunión & Fe</span>
                    </div>
                  </div>
                </div>
                
                <div className="carousel-slide-item" style={{ width: `${100 / visibleSlides}%` }}>
                  <div className="gallery-item glass-panel">
                    <img src="/camp-photo-2.jpg" alt="Estudio de la Palabra" />
                    <div className="gallery-overlay">
                      <span>Estudio de la Palabra</span>
                    </div>
                  </div>
                </div>
                
                <div className="carousel-slide-item" style={{ width: `${100 / visibleSlides}%` }}>
                  <div className="gallery-item glass-panel">
                    <img src="/camp-photo-3.jpg" alt="Oración & Alabanza" />
                    <div className="gallery-overlay">
                      <span>Oración & Alabanza</span>
                    </div>
                  </div>
                </div>
                
                <div className="carousel-slide-item" style={{ width: `${100 / visibleSlides}%` }}>
                  <div className="gallery-item glass-panel">
                    <img src="/camp-photo-4.jpg" alt="Servicio Activo" />
                    <div className="gallery-overlay">
                      <span>Servicio Activo</span>
                    </div>
                  </div>
                </div>
                
                <div className="carousel-slide-item" style={{ width: `${100 / visibleSlides}%` }}>
                  <div className="gallery-item glass-panel">
                    <img src="/camp-photo-5.jpg" alt="Vida en Comunidad" />
                    <div className="gallery-overlay">
                      <span>Vida en Comunidad</span>
                    </div>
                  </div>
                </div>
                
                <div className="carousel-slide-item" style={{ width: `${100 / visibleSlides}%` }}>
                  <div className="gallery-item glass-panel">
                    <img src="/camp-photo-6.jpg" alt="Crecimiento Espiritual" />
                    <div className="gallery-overlay">
                      <span>Crecimiento Espiritual</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="carousel-nav-btn next" onClick={nextSlide} aria-label="Siguiente">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="carousel-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button 
                key={idx} 
                className={`dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
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
    </div>
  );
};

export default Home;
