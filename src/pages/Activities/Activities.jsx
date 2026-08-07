import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, X } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './Activities.css';

// Helper to calculate dynamic target date (this year or next year)
const getDynamicTargetDate = (month, day, hour = 0, minute = 0) => {
  const currentYear = new Date().getFullYear();
  let target = new Date(currentYear, month - 1, day, hour, minute, 0, 0);
  if (new Date() > target) {
    target.setFullYear(target.getFullYear() + 1);
  }
  return target;
};

const activitiesList = [
  {
    id: 3,
    title: "Media Vigilia: 'RESET'",
    date: "Sábado 22 de Agosto, 2026",
    time: "Registro abre a las 06:00 PM",
    location: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    description: "Una media vigilia especial conectada con la conferencia 'Sin Filtros' 2026, diseñada con el propósito de preparar nuestros corazones, buscar al Señor en oración unida y clamar por Su gracia sobre la conferencia.",
    tag: "Pre-Conferencia",
    featured: true,
    countdownTarget: getDynamicTargetDate(8, 22, 18, 0)
  },
  {
    id: 0,
    title: "Conferencia de Jóvenes 'Sin Filtros' 2026",
    date: "29 de Agosto, 2026",
    time: "Sábado 03:00 PM",
    location: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    description: "Un encuentro diseñado para jóvenes con el propósito de compartir en adoración, profundizar en el estudio de la Palabra de Dios y disfrutar de un tiempo de comunión cristiana.",
    tag: "Próximo Evento",
    featured: true,
    countdownTarget: getDynamicTargetDate(8, 29, 15, 0)
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

const Activities = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalScrolled, setModalScrolled] = useState(false);

  const handleModalScroll = (e) => {
    if (e.target.scrollTop > 40) {
      setModalScrolled(true);
    } else {
      setModalScrolled(false);
    }
  };

  useEffect(() => {
    setModalScrolled(false);
  }, [selectedActivity]);

  // Listen to hash changes for real-time image updates during local testing
  const [, setHashTrigger] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setHashTrigger(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // General Countdowns State (Calculates for any activity with countdownTarget)
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const calculateAllCountdowns = () => {
      const now = new Date().getTime();
      const updatedCountdowns = {};

      activitiesList.forEach((activity) => {
        if (!activity.countdownTarget) return;

        const targetTime = activity.countdownTarget.getTime();
        const distance = targetTime - now;

        if (distance < 0) {
          updatedCountdowns[activity.id] = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
        } else {
          updatedCountdowns[activity.id] = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            isExpired: false
          };
        }
      });

      setCountdowns(updatedCountdowns);
    };

    calculateAllCountdowns();
    const interval = setInterval(calculateAllCountdowns, 1000);
    return () => clearInterval(interval);
  }, []);

  // Prevent background scroll, handle modal class and listen to Escape key when modal is open
  useEffect(() => {
    if (selectedActivity) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('activity-details-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('activity-details-open');
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedActivity(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('activity-details-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedActivity]);

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
          {activitiesList.map(activity => (
            <div 
              key={activity.id} 
              className={`activity-card glass-panel ${activity.featured ? 'featured' : ''} ${activity.id === 3 ? 'vigilia-theme' : ''}`}
              onClick={() => setSelectedActivity(activity)}
              style={{ cursor: 'pointer' }}
              title="Haz clic para ver detalles de esta actividad"
            >
              <div className="activity-tag">{activity.tag}</div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-desc">{activity.description}</p>
              
              {activity.countdownTarget && countdowns[activity.id] && (
                <div className="card-countdown-wrapper">
                  <div className="card-countdown-title">
                    {countdowns[activity.id].isExpired ? "¡El evento ya ha comenzado!" : "Faltan para el Evento:"}
                  </div>
                  <div className="card-countdown-timer">
                    <div className="countdown-item">
                      <span className="countdown-value text-gradient">{countdowns[activity.id].days}</span>
                      <span className="countdown-label">Días</span>
                    </div>
                    <span className="countdown-separator">:</span>
                    <div className="countdown-item">
                      <span className="countdown-value text-gradient">{countdowns[activity.id].hours.toString().padStart(2, '0')}</span>
                      <span className="countdown-label">Horas</span>
                    </div>
                    <span className="countdown-separator">:</span>
                    <div className="countdown-item">
                      <span className="countdown-value text-gradient">{countdowns[activity.id].minutes.toString().padStart(2, '0')}</span>
                      <span className="countdown-label">Mins</span>
                    </div>
                    <span className="countdown-separator">:</span>
                    <div className="countdown-item">
                      <span className="countdown-value text-gradient">{countdowns[activity.id].seconds.toString().padStart(2, '0')}</span>
                      <span className="countdown-label">Segs</span>
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
        <div className={`modal-overlay ${selectedActivity.id === 3 ? 'vigilia-theme' : ''}`} onClick={() => setSelectedActivity(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setSelectedActivity(null)}
              aria-label="Cerrar detalles"
            >
              <X size={24} />
            </button>
            
            <div className={`modal-compact-header ${modalScrolled ? 'visible' : ''}`}>
              <span className="compact-header-title" title={selectedActivity.title}>{selectedActivity.title}</span>
            </div>
            
            <div className="modal-body-scroll" onScroll={handleModalScroll}>
              <div className="modal-header">
                <span className="modal-subtitle">{selectedActivity.tag}</span>
                <h2 className="modal-title text-gradient">{selectedActivity.title}</h2>
              </div>
              <div className="modal-section">
                <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  {selectedActivity.description}
                </p>
                
                {selectedActivity.countdownTarget && countdowns[selectedActivity.id] && (
                  <div className="modal-countdown-wrapper">
                    <div className="modal-countdown-title">
                      {countdowns[selectedActivity.id].isExpired ? "¡El evento ya ha comenzado!" : "Tiempo restante para el Evento:"}
                    </div>
                    <div className="modal-countdown-timer">
                      <div className="countdown-item modal-item">
                        <span className="countdown-value modal-value text-gradient">{countdowns[selectedActivity.id].days}</span>
                        <span className="countdown-label modal-label">Días</span>
                      </div>
                      <span className="countdown-separator modal-separator">:</span>
                      <div className="countdown-item modal-item">
                        <span className="countdown-value modal-value text-gradient">{countdowns[selectedActivity.id].hours.toString().padStart(2, '0')}</span>
                        <span className="countdown-label modal-label">Horas</span>
                      </div>
                      <span className="countdown-separator modal-separator">:</span>
                      <div className="countdown-item modal-item">
                        <span className="countdown-value modal-value text-gradient">{countdowns[selectedActivity.id].minutes.toString().padStart(2, '0')}</span>
                        <span className="countdown-label modal-label">Minutos</span>
                      </div>
                      <span className="countdown-separator modal-separator">:</span>
                      <div className="countdown-item modal-item">
                        <span className="countdown-value modal-value text-gradient">{countdowns[selectedActivity.id].seconds.toString().padStart(2, '0')}</span>
                        <span className="countdown-label modal-label">Segundos</span>
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
