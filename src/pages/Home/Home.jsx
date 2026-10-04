import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock, Plus, Star, Sparkles } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import ActiveServicesBanner from '../../components/ActiveServicesBanner/ActiveServicesBanner';
import './Home.css';

const Home = () => {
  // Listen to hash changes for real-time image updates during local testing
  const [, setHashTrigger] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setHashTrigger(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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
      subtitle: "Iglesia De Convertidos a Cristo (ICC)",
      desc: "Nació en La Vega en 1955. Graduado en Contabilidad y Administración de empresas. Fue reconocido como pastor a tiempo completo en el año 2000, sirviendo en la edificación de la congregación y el desarrollo de ministerios.",
      image: getImageUrl("/pastores/Pr-Luis-Valdera-Sept-2024.jpg"),
      initials: "LV"
    },
    {
      name: "Pr. Narciso Nadal Ortíz",
      role: "Pastor",
      subtitle: "Iglesia De Convertidos a Cristo (ICC)",
      desc: "Nació in 1976 en Santo Domingo. Doctor en Medicina y Maestría en Teología. Fue reconocido como pastor en 2006, sirviendo fielmente en la predicación de la Palabra, la consejería pastoral y el discipulado bíblico.",
      image: getImageUrl("/pastores/Pr-Narciso-Nadal-Sept-2024.jpg"),
      initials: "NN"
    },
    {
      name: "Pr. Santiago Peralta",
      role: "Pastor",
      subtitle: "Iglesia De Convertidos a Cristo (ICC)",
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
      answer: "Sí, las instalaciones de la Iglesia De Convertidos a Cristo (ICC) cuentan con amplios parqueos controlados y un equipo de logística y seguridad para garantizar la tranquilidad de todos los asistentes."
    }
  ];


  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="container hero-container">
          {/* Publicaciones Oficiales de Servicios Activos (OneTwentyOne y JPC) */}
          <ActiveServicesBanner />

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
                Somos la comunidad de jóvenes de la <strong>Iglesia De Convertidos a Cristo (ICC)</strong>. Nuestro anhelo es ver a una generación apasionada por Jesús, arraigada en Su Palabra, comprometida con la sana doctrina y capacitada para servir al Señor en espíritu y verdad.
              </p>
              
              <div className="hero-cta">
                <Link 
                  to="/registro"
                  className="btn-primary"
                >
                  Pre-Registrarse
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
              <div className="hero-featured-card glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                  <span className="featured-card-badge" style={{ position: 'static', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--accent-light)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    <Sparkles size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    PRÓXIMAS ACTIVIDADES
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2026 - 2027</span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
                  Pre-Registros <span className="text-gradient">Abiertos</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Asegura tu cupo en nuestras próximas actividades especiales. Al pre-registrarte recibirás las notificaciones de apertura oficial y métodos de pago.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.8rem' }}>
                  {/* Cena item */}
                  <div style={{ padding: '0.9rem 1.1rem', background: 'rgba(219, 39, 119, 0.08)', borderRadius: '12px', borderLeft: '3px solid #db2777', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>Cena de Jóvenes 2026</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Sábado 5 de Diciembre, 2026</div>
                    </div>
                    <Link to="/registro?event=cena" style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f472b6', textDecoration: 'none', padding: '0.4rem 0.8rem', background: 'rgba(219, 39, 119, 0.15)', borderRadius: '20px' }}>
                      Pre-Registro
                    </Link>
                  </div>

                  {/* Campamento item */}
                  <div style={{ padding: '0.9rem 1.1rem', background: 'rgba(5, 150, 105, 0.08)', borderRadius: '12px', borderLeft: '3px solid #059669', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>Campamento Jóvenes 2027</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>16 al 18 de Abril, 2027</div>
                    </div>
                    <Link to="/registro?event=campamento" style={{ fontSize: '0.82rem', fontWeight: '700', color: '#34d399', textDecoration: 'none', padding: '0.4rem 0.8rem', background: 'rgba(5, 150, 105, 0.15)', borderRadius: '20px' }}>
                      Pre-Registro
                    </Link>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <Link 
                    to="/registro" 
                    className="btn-primary-sm"
                    style={{ flex: 1, margin: 0, padding: '0.75rem 1rem', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    Ir a Pre-Registro
                    <ArrowRight size={14} />
                  </Link>
                  <Link 
                    to="/actividades" 
                    className="btn-secondary-sm"
                    style={{ 
                      flex: 1, 
                      fontSize: '0.88rem', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '50px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: '700',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Ver Actividades
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Pre-Registrations Section */}
      <section className="pre-registrations-section section-padding" style={{ backgroundColor: 'rgba(10, 10, 10, 0.25)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Pre-Registros <span className="text-gradient">Disponibles</span></h2>
            <p>Asegura tu cupo con anticipación en nuestras próximas actividades especiales. Los montos de cobro y métodos de pago se notificarán más adelante.</p>
          </div>

          <div className="pre-regs-grid">
            {/* Card 1: Cena de Jóvenes */}
            <div className="pre-reg-card cena glass-panel">
              <div className="pre-reg-badge">
                PRE-REGISTRO
              </div>
              <h3 className="pre-reg-title">Cena de Jóvenes ICC 2026</h3>
              <p className="pre-reg-desc">
                Acompáñanos a celebrar juntos este año de fe y bendición. Una noche especial llena de comunión, cena y edificación para cerrar el año de la mejor manera.
              </p>
              
              <div className="pre-reg-meta-list">
                <div className="pre-reg-meta-item">
                  <Calendar size={14} style={{ color: '#db2777' }} />
                  <span>Sábado 5 de Diciembre, 2026</span>
                </div>
                <div className="pre-reg-meta-item">
                  <Clock size={14} style={{ color: '#db2777' }} />
                  <span>Precio: Por anunciar</span>
                </div>
              </div>

              <Link 
                to="/registro?event=cena" 
                className="pre-reg-btn"
              >
                Pre-Registrarse Ahora
              </Link>
            </div>

            {/* Card 2: Campamento */}
            <div className="pre-reg-card campamento glass-panel">
              <div className="pre-reg-badge">
                PRE-REGISTRO
              </div>
              <h3 className="pre-reg-title">Campamento Jóvenes ICC 2027</h3>
              <p className="pre-reg-desc">
                Un tiempo extraordinario en la presencia del Señor, apartados en la naturaleza para la búsqueda y renovación espiritual de nuestro ministerio de jóvenes.
              </p>
              
              <div className="pre-reg-meta-list">
                <div className="pre-reg-meta-item">
                  <Calendar size={14} style={{ color: '#059669' }} />
                  <span>16 al 18 de Abril, 2027</span>
                </div>
                <div className="pre-reg-meta-item">
                  <Clock size={14} style={{ color: '#059669' }} />
                  <span>Precio: Por anunciar</span>
                </div>
              </div>

              <Link 
                to="/registro?event=campamento" 
                className="pre-reg-btn"
              >
                Pre-Registrarse Ahora
              </Link>
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


      {/* Speakers / Pastores Section */}
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
    </div>
  );
};

export default Home;
