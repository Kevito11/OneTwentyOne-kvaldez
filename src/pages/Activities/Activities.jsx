import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, X } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './Activities.css';

const Activities = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);

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

  const activities = [
    {
      id: 0,
      title: "Conferencia de Jóvenes 'Sin Filtros' 2026",
      date: "29 de Agosto, 2026",
      time: "Sábado 03:00 PM",
      location: "Salón Principal ICC",
      mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
      description: "Un encuentro diseñado para jóvenes con el propósito de compartir en adoración, profundizar en el estudio de la Palabra de Dios y disfrutar de un tiempo de comunión cristiana.",
      tag: "Próximo Evento",
      featured: true
    },
    {
      id: 1,
      title: "Culto de Jóvenes Para Cristo (JPC)",
      date: "Todos los Sábados",
      time: "7:00 PM - 8:30 PM",
      location: "Salón Principal ICC",
      mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
      description: "Nuestra reunión y espacio de adoración diseñado especialmente para adolescentes de 12 a 17 años. Un tiempo enfocado en la alabanza, la enseñanza expositiva de la Palabra y el compañerismo cristiano.",
      tag: "Edades 12-17"
    },
    {
      id: 2,
      title: "Culto de Siervos Para Cristo (OneTwentyOne)",
      date: "Viernes Quincenales",
      time: "8:00 PM - 10:00 PM",
      location: "Salón Principal ICC",
      mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
      description: "Nuestra reunión y culto de adoración para jóvenes de 18 años en adelante. Un tiempo quincenal enfocado en la predicación expositiva, la consejería pastoral, la comunión y la edificación mutua.",
      tag: "Edades 18+"
    }
  ];

  return (
    <div className="activities-page animate-fade-in section-padding">
      <div className="container">
        
        <div className="page-header text-center">
          <span className="subtitle">Comunidad Activa</span>
          <h1 className="title">Nuestras <span className="text-gradient">Actividades</span></h1>
          <p className="description">
            No somos solo un evento anual, somos una familia de fe que camina unida. Encuentra tu lugar y acompáñanos en nuestras reuniones semanales.
          </p>
        </div>

        <div className="activities-grid">
          {activities.map(activity => (
            <div 
              key={activity.id} 
              className={`activity-card glass-panel ${activity.featured ? 'featured' : ''}`}
              onClick={() => setSelectedActivity(activity)}
              style={{ cursor: 'pointer' }}
              title="Haz clic para ver detalles de esta actividad"
            >
              <div className="activity-tag">{activity.tag}</div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-desc">{activity.description}</p>
              
              {activity.id === 0 && (
                <div className="card-countdown-wrapper" style={{ margin: '1.5rem 0 2rem 0', background: 'rgba(255, 255, 255, 0.02)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.8rem', textAlign: 'center' }}>
                    {timeLeft.isExpired ? "¡El evento ya ha comenzado!" : "Faltan para el Evento:"}
                  </div>
                  <div className="card-countdown-timer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                      <span className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{timeLeft.days}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>Días</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'rgba(255, 255, 255, 0.2)', marginTop: '-0.8rem' }}>:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                      <span className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{timeLeft.hours.toString().padStart(2, '0')}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>Horas</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'rgba(255, 255, 255, 0.2)', marginTop: '-0.8rem' }}>:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                      <span className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>Mins</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'rgba(255, 255, 255, 0.2)', marginTop: '-0.8rem' }}>:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                      <span className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>Segs</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="activity-details">
                <div className="detail-item">
                  <Calendar size={18} className="detail-icon" />
                  <span>{activity.date}</span>
                </div>
                <div className="detail-item">
                  <Clock size={18} className="detail-icon" />
                  <span>{activity.time}</span>
                </div>
                <div className="detail-item">
                  {activity.mapLink ? (
                    <a 
                      href={activity.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'inherit' }}
                      className="nav-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin size={18} className="detail-icon" />
                      <span style={{ textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {activity.location} <ExternalLink size={12} style={{ opacity: 0.7 }} />
                      </span>
                    </a>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <MapPin size={18} className="detail-icon" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal de Detalles de Actividad */}
      {selectedActivity && (
        <div className="modal-overlay" onClick={() => setSelectedActivity(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setSelectedActivity(null)}
              aria-label="Cerrar detalles"
            >
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <span className="modal-subtitle">{selectedActivity.tag}</span>
              <h2 className="modal-title text-gradient">{selectedActivity.title}</h2>
            </div>
            
            <div className="modal-body-scroll">
              <div className="modal-section">
                <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  {selectedActivity.description}
                </p>
                
                {selectedActivity.id === 0 && (
                  <div className="modal-countdown-wrapper" style={{ margin: '-0.5rem 0 2rem 0', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', marginBottom: '1rem' }}>
                      {timeLeft.isExpired ? "¡El evento ya ha comenzado!" : "Tiempo restante para la Conferencia:"}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                        <span className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>{timeLeft.days}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem', fontWeight: '600' }}>Días</span>
                      </div>
                      <span style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(255, 255, 255, 0.25)', marginTop: '-1rem' }}>:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                        <span className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>{timeLeft.hours.toString().padStart(2, '0')}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem', fontWeight: '600' }}>Horas</span>
                      </div>
                      <span style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(255, 255, 255, 0.25)', marginTop: '-1rem' }}>:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                        <span className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem', fontWeight: '600' }}>Minutos</span>
                      </div>
                      <span style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(255, 255, 255, 0.25)', marginTop: '-1rem' }}>:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                        <span className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.4rem', fontWeight: '600' }}>Segundos</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="activity-details" style={{ borderTop: 'none', padding: 0, gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div className="detail-item" style={{ fontSize: '1.05rem' }}>
                    <Calendar size={20} className="detail-icon" />
                    <span><strong>Fecha / Frecuencia:</strong> {selectedActivity.date}</span>
                  </div>
                  <div className="detail-item" style={{ fontSize: '1.05rem' }}>
                    <Clock size={20} className="detail-icon" />
                    <span><strong>Horario:</strong> {selectedActivity.time}</span>
                  </div>
                  <div className="detail-item" style={{ fontSize: '1.05rem' }}>
                    <MapPin size={20} className="detail-icon" />
                    <span><strong>Lugar:</strong> {selectedActivity.location}</span>
                  </div>
                </div>
              </div>

              {/* Conferencia specific section: Show posters and schedule */}
              {selectedActivity.id === 0 && (
                <>
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
                          src={getImageUrl("/sin-filtro-poster.jpeg")} 
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
                          src={getImageUrl("/sin-filtros-theme.jpeg")} 
                          alt="Afiche Conferencia Sin Filtros - Opción 2" 
                          style={{ width: '100%', display: 'block', height: 'auto', objectFit: 'cover' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-section" style={{ marginBottom: '3rem' }}>
                    <h3 className="modal-section-title">Programa de la Conferencia</h3>
                    <div className="timeline-container" style={{ maxWidth: '100%' }}>
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
                </>
              )}

              {/* JPC specific section: Show Instagram info */}
              {selectedActivity.id === 1 && (
                <div className="modal-section" style={{ marginBottom: '3rem' }}>
                  <h3 className="modal-section-title">Comunidad en Instagram</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.6' }}>
                    Para enterarte de los próximos temas, avisos especiales de última hora y novedades del grupo, síguenos en nuestra cuenta de Instagram oficial de JPC:
                  </p>
                  <a 
                    href="https://www.instagram.com/jovenes_icc/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary"
                    style={{ display: 'inline-flex', width: 'fit-content', padding: '0.8rem 1.8rem', gap: '0.5rem' }}
                  >
                    @jovenes_icc en Instagram
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              {/* Siervos specific section: Show Instagram info */}
              {selectedActivity.id === 2 && (
                <div className="modal-section" style={{ marginBottom: '3rem' }}>
                  <h3 className="modal-section-title">Comunidad en Instagram</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.6' }}>
                    Para mantenerte al tanto de la programación de cultos quincenales, actividades de servicio, devocionales y publicaciones especiales, síguenos en nuestra cuenta oficial de Instagram:
                  </p>
                  <a 
                    href="https://www.instagram.com/onetwentyoneicc/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary"
                    style={{ display: 'inline-flex', width: 'fit-content', padding: '0.8rem 1.8rem', gap: '0.5rem' }}
                  >
                    @onetwentyoneicc en Instagram
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              {/* General Map/Location component for all activities since they are all at ICC templo */}
              <div className="modal-section">
                <h3 className="modal-section-title">Ubicación del Templo</h3>
                <div className="location-panel glass-panel" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', padding: '2rem' }}>
                  <div className="location-info-block">
                    <span className="location-badge">Lugar de Reunión</span>
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
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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

export default Activities;
