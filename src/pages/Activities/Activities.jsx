import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ExternalLink, X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './Activities.css';

// Publicación oficial de Instagram de la Media Vigilia
const VIGILIA_INSTAGRAM_POST_ID = "DcbcUTTFjv1";
const YOUTUBE_STREAMS_URL = 'https://www.youtube.com/@ICCRD/streams';

// Helper para calcular el estado de transmisión en vivo de la Conferencia Sin Filtros
// Disponible hoy 29 de Agosto de 4:00 PM a 9:00 PM; a las 9:00 PM concluye
const getConferenciaLiveStatus = () => {
  const now = new Date();
  const month = now.getMonth(); // 7 = Agosto (0-indexado)
  const date = now.getDate();
  const hour = now.getHours();

  // El evento es hoy 29 de Agosto
  const isToday = month === 7 && date === 29;

  if (isToday) {
    if (hour >= 16 && hour < 21) {
      return 'live_now'; // 4:00 PM a 9:00 PM (16:00 a 20:59:59)
    } else if (hour < 16) {
      return 'live_today'; // Hoy antes de las 4:00 PM (disponible para ver canal/esperar inicio)
    }
  }

  return 'ended'; // A partir de las 9:00 PM o fechas posteriores
};

// Helper to calculate dynamic target date (this year or next year)
const getDynamicTargetDate = (month, day, hour = 0, minute = 0) => {
  const currentYear = new Date().getFullYear();
  let target = new Date(currentYear, month - 1, day, hour, minute, 0, 0);
  if (new Date() > target) {
    target.setFullYear(target.getFullYear() + 1);
  }
  return target;
};

const CONFERENCIA_SCHEDULE = [
  { time: "03:00 PM", type: "Registro", title: "Registro y Recepción", desc: "Recepción de participantes y entrega de acreditaciones." },
  { time: "04:00 PM", type: "Inicio", title: "Bienvenida e Inicio", desc: "Apertura oficial de la Conferencia Juvenil Sin Filtros." },
  { time: "04:10 PM", type: "Adoración", title: "Tiempo de Alabanzas", desc: "Tiempo dedicado a cantar al Señor en comunidad." },
  { time: "04:25 PM", type: "Sesión 1", title: "La Máscara de la Apariencia", desc: "Primera sesión plenaria de la conferencia." },
  { time: "05:10 PM", type: "Receso", title: "Break", desc: "Un receso para descansar y compartir un refrigerio." },
  { time: "05:45 PM", type: "Sesión 2", title: "Lo que Dios ve en Secreto", desc: "Segunda sesión plenaria de la conferencia." },
  { time: "06:30 PM", type: "Adoración", title: "Tiempo de Alabanzas", desc: "Tiempo dedicado a cantar al Señor en comunidad." },
  { time: "06:40 PM", type: "Receso", title: "Break", desc: "Un receso para descansar y compartir un refrigerio." },
  { time: "07:10 PM", type: "Actividad", title: "El Aplatana'o", desc: "Espacio dinámico y participativo de la conferencia." },
  { time: "07:15 PM", type: "Adoración", title: "Tiempo de Alabanzas", desc: "Tiempo dedicado a cantar al Señor en comunidad." },
  { time: "07:25 PM", type: "Sesión 3", title: "Una Generación Auténtica", desc: "Tercera sesión plenaria de la conferencia." },
  { time: "08:10 PM", type: "Interacción", title: "Preguntas y Respuestas", desc: "Sección interactiva para resolver dudas con los expositores." },
  { time: "08:40 PM", type: "Adoración", title: "Tiempo de Alabanzas", desc: "Tiempo dedicado a cantar al Señor en comunidad." },
  { time: "08:50 PM", type: "Cierre", title: "Cierre", desc: "Palabras finales y despedida del evento." }
];

const activitiesList = [
  {
    id: 3,
    title: "Media Vigilia: 'RESET'",
    date: "Sábado 22 de Agosto, 2026",
    time: "Registro abre a las 06:00 PM",
    location: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    description: "Una media vigilia especial conectada con la conferencia 'Sin Filtros' 2026, diseñada con el propósito de preparar nuestros corazones, buscar al Señor en oración unida y clamar por Su gracia sobre la conferencia.",
    tag: "Evento Concluido",
    featured: true,
    isCompleted: true
  },
  {
    id: 0,
    title: "Conferencia de Jóvenes 'Sin Filtros' 2026",
    date: "Sábado 29 de Agosto, 2026",
    time: "03:00 PM - 09:00 PM",
    location: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    description: "Un encuentro diseñado para jóvenes con el propósito de compartir en adoración, profundizar en el estudio de la Palabra de Dios y disfrutar de un tiempo de comunión cristiana.",
    tag: "Evento Concluido",
    featured: true,
    isCompleted: true
  },
  {
    id: 5,
    title: "Cena de Jóvenes 2026",
    date: "Sábado 5 de Diciembre, 2026",
    time: "07:00 PM",
    location: "Salón Principal ICC",
    mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
    description: "Nuestra tradicional cena de fin de año. Un tiempo especial de comunión, cena compartida, dinámicas de grupo y agradecimiento al Señor por este año transcurrido.",
    tag: "Pre-Registro Abierto",
    countdownTarget: getDynamicTargetDate(12, 5, 19, 0)
  },
  {
    id: 6,
    title: "Campamento de Jóvenes ICC 2027",
    date: "16 al 18 de Abril, 2027",
    description: "Tres días apartados para buscar al Señor, reflexionar en Su Palabra, disfrutar de actividades recreativas al aire libre y comunión fraternal.",
    tag: "Pre-Registro Abierto",
    countdownTarget: getDynamicTargetDate(4, 16, 14, 0)
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

const ActivityCard = ({ activity, countdowns, onSelect, liveStatus }) => {
  const isConferencia = activity.id === 0;
  const isVigilia = activity.id === 3;
  const isLiveActive = isConferencia && (liveStatus === 'live_now' || liveStatus === 'live_today');

  return (
    <div 
      className={`activity-card glass-panel ${activity.featured ? 'featured' : ''} ${isVigilia ? 'vigilia-theme' : ''}`}
      onClick={() => onSelect(activity)}
      style={{ cursor: 'pointer' }}
      title="Haz clic para ver detalles de esta actividad"
    >
      <div className="activity-tag">
        {isLiveActive ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: '800' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
            {liveStatus === 'live_now' ? 'En Vivo por YouTube' : 'Live Hoy 4PM-9PM'}
          </span>
        ) : (
          activity.tag
        )}
      </div>
      <h3 className="activity-title">{activity.title}</h3>
      <p className="activity-desc">{activity.description}</p>
      
      {activity.isCompleted ? (
        <div className="card-completed-wrapper glass-panel">
          {isLiveActive ? (
            <>
              <div className="completed-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}>
                <span>📺 {liveStatus === 'live_now' ? '🔴 ¡En Directo por YouTube!' : 'Transmisión Hoy 4:00 PM - 9:00 PM'}</span>
              </div>
              <p className="completed-text">
                {liveStatus === 'live_now'
                  ? '¡Sigue la conferencia en vivo ahora mismo en nuestro canal de YouTube!'
                  : 'Sigue la conferencia en vivo por YouTube hoy de 4:00 PM a 9:00 PM.'}
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                <a 
                  href={YOUTUBE_STREAMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', fontSize: '0.88rem', textDecoration: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Ver en YouTube
                </a>
                <button 
                  className="btn-secondary-sm"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(activity);
                  }}
                >
                  Ver Detalles
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="completed-badge">
                <span>✨ Actividad Concluida</span>
              </div>
              <p className="completed-text">
                {isVigilia ? '¡Revive los momentos especiales de esta vigilia!' : '¡Revive los momentos y detalles de esta conferencia!'}
              </p>
              <button 
                className="btn-primary completed-btn"
                style={{ margin: '0.8rem auto 0 auto', display: 'flex', width: 'fit-content', padding: '0.6rem 1.4rem', fontSize: '0.88rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(activity);
                }}
              >
                {isVigilia ? 'Ver Fotos' : 'Ver Detalles'}
              </button>
            </>
          )}
        </div>
      ) : (
        activity.countdownTarget && countdowns[activity.id] && (
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
        )
      )}
      
      <div className="activity-details">
        <div className="detail-item">
          <Calendar size={18} className="detail-icon" />
          <span>{activity.date}</span>
        </div>
        {activity.time && (
          <div className="detail-item">
            <Clock size={18} className="detail-icon" />
            <span>{activity.time}</span>
          </div>
        )}
        {activity.location && (
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
        )}
      </div>
    </div>
  );
};

const Activities = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalScrolled, setModalScrolled] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const handleModalScroll = (e) => {
    if (e.target.scrollTop > 40) {
      setModalScrolled(true);
    } else {
      setModalScrolled(false);
    }
  };

  useEffect(() => {
    setModalScrolled(false);
    if (!selectedActivity) {
      setShowFullSchedule(false);
    }
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
  const [liveStatus, setLiveStatus] = useState(getConferenciaLiveStatus());

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
      setLiveStatus(getConferenciaLiveStatus());
    };

    calculateAllCountdowns();
    const interval = setInterval(calculateAllCountdowns, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load official Instagram embed script when Media Vigilia modal is opened
  useEffect(() => {
    if (selectedActivity && selectedActivity.id === 3) {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      } else {
        const script = document.createElement('script');
        script.src = '//www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        };
        document.body.appendChild(script);
      }
    }
  }, [selectedActivity]);

  // Prevent background scroll, handle modal class and listen to Escape key
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

  const upcomingActivities = activitiesList.filter(activity => !activity.isCompleted);
  const pastActivities = activitiesList.filter(activity => activity.isCompleted);

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
          {upcomingActivities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              countdowns={countdowns} 
              onSelect={setSelectedActivity} 
              liveStatus={liveStatus}
            />
          ))}
        </div>

        {pastActivities.length > 0 && (
          <div className="past-activities-section" style={{ marginTop: '5rem' }}>
            <div className="activities-section-header text-center" style={{ marginBottom: '3rem' }}>
              <span className="subtitle">Galería de Recuerdos</span>
              <h2 className="title" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-1px' }}>Actividades <span className="text-gradient">Concluidas</span></h2>
              <p className="description" style={{ fontSize: '1.05rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                Revive y explora los momentos especiales de los eventos que ya hemos celebrado.
              </p>
            </div>
            <div className="activities-grid">
              {pastActivities.map(activity => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                  countdowns={countdowns} 
                  onSelect={setSelectedActivity} 
                  liveStatus={liveStatus}
                />
              ))}
            </div>
          </div>
        )}

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
                
                {!selectedActivity.isCompleted && selectedActivity.countdownTarget && countdowns[selectedActivity.id] && (
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
                  {selectedActivity.time && (
                    <div className="detail-item" style={{ fontSize: '1.05rem' }}>
                      <Clock size={20} className="detail-icon" />
                      <span><strong>Horario:</strong> {selectedActivity.time}</span>
                    </div>
                  )}
                  {selectedActivity.location && (
                    <div className="detail-item" style={{ fontSize: '1.05rem' }}>
                      <MapPin size={20} className="detail-icon" />
                      <span><strong>Lugar:</strong> {selectedActivity.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conferencia specific section: Show YouTube Live, posters, preorder and schedule */}
              {selectedActivity.id === 0 && (
                <>
                  {(liveStatus === 'live_now' || liveStatus === 'live_today') && (
                    <div className="modal-section" style={{ marginBottom: '3rem' }}>
                      <div className="glass-panel" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
                          <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>📺</div>
                          <div>
                            <h3 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                              {liveStatus === 'live_now' ? '🔴 Transmisión en Directo (4:00 PM - 9:00 PM)' : '📺 Transmisión en Vivo Hoy (4:00 PM - 9:00 PM)'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                              {liveStatus === 'live_now'
                                ? 'La conferencia está siendo transmitida en vivo a través de nuestro canal oficial de YouTube. Puedes conectarte ahora mismo desde cualquier dispositivo.'
                                : 'La conferencia será transmitida en directo a través de nuestro canal oficial de YouTube de 4:00 PM a 9:00 PM. Podrás verla gratis desde cualquier lugar.'}
                            </p>
                          </div>
                        </div>
                        <a
                          href={YOUTUBE_STREAMS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '0.8rem 2rem', textDecoration: 'none', width: 'fit-content' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          Ver Transmisión en YouTube
                        </a>
                      </div>
                    </div>
                  )}

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

                  {/* Food Pre-Order Section */}
                  <div className="modal-section" style={{ marginBottom: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <h3 className="modal-section-title">🍔 Pre-Orden de Comida (Breaks)</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      Durante la conferencia contaremos con varios negocios invitados en los recesos. Si ya estás registrado o vas a registrarte ahora, podrás pre-ordenar tus platos con anticipación para asegurar tu comida y agilizar la entrega.
                    </p>

                    {/* Menús de comida */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                      gap: '1.5rem', 
                      marginTop: '1.5rem',
                      marginBottom: '2rem'
                    }}>
                      {/* Menú #1: Pechurica La Fe */}
                      <div 
                        className="glass-panel" 
                        style={{ 
                          padding: '1.8rem', 
                          borderRadius: '16px', 
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          background: 'rgba(10, 10, 10, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '250px',
                          textAlign: 'center',
                          gap: '1rem'
                        }}
                      >
                        <img 
                          src={getImageUrl('/pechurica-logo.png')} 
                          alt="Logo Pechurica La Fe" 
                          style={{ 
                            width: '75px', 
                            height: '75px', 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            marginBottom: '0.3rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }} 
                        />
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                            Pechurica La Fe
                          </h4>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.8rem' }}>
                            Pechuricas crujientes acompañadas de papas fritas y salsas especiales.
                          </p>
                          <a 
                            href="https://www.instagram.com/pechuricalaferd/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '0.85rem', 
                              fontWeight: '700', 
                              color: 'var(--accent-color)', 
                              textDecoration: 'none' 
                            }}
                          >
                            <span>@pechuricalaferd</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      {/* Menú #2: Marité Postres Artesanales */}
                      <div 
                        className="glass-panel" 
                        style={{ 
                          padding: '1.8rem', 
                          borderRadius: '16px', 
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          background: 'rgba(10, 10, 10, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '250px',
                          textAlign: 'center',
                          gap: '1rem'
                        }}
                      >
                        <img 
                          src={getImageUrl('/marite-logo.png')} 
                          alt="Logo Marité Postres Artesanales" 
                          style={{ 
                            width: '75px', 
                            height: '75px', 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            marginBottom: '0.3rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }} 
                        />
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                            Marité Postres Artesanales
                          </h4>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.8rem' }}>
                            Helados artesanales súper cremosos sabor Coco, Coco Fresa, Chinola Cremosa, Dulce de Leche y Bizcocho Marmolado.
                          </p>
                          <a 
                            href="https://www.instagram.com/maritepostresartesanales/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '0.85rem', 
                              fontWeight: '700', 
                              color: 'var(--accent-color)', 
                              textDecoration: 'none' 
                            }}
                          >
                            <span>@maritepostresartesanales</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <Link 
                        to="/menu-preorden" 
                        className="btn-primary"
                        style={{ 
                          display: 'inline-flex', 
                          padding: '0.8rem 2rem', 
                          textDecoration: 'none', 
                          alignItems: 'center', 
                          gap: '8px', 
                          width: 'fit-content'
                        }}
                      >
                        <span>Pre-ordenar Comida Ahora</span>
                      </Link>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-light)', fontStyle: 'italic' }}>
                        * Asegura tu comida/refrigerio con anticipación y retírala sin filas en los recesos de la conferencia.
                      </span>
                    </div>
                  </div>
                  <div className="modal-section" style={{ marginBottom: '3rem' }}>
                    <h3 className="modal-section-title">Programa de la Conferencia</h3>
                    <div className="timeline-container" style={{ maxWidth: '100%' }}>
                      {(showFullSchedule ? CONFERENCIA_SCHEDULE : CONFERENCIA_SCHEDULE.slice(0, 3)).map((item, idx) => (
                        <div key={idx} className="timeline-item glass-panel animate-fade-in">
                          <div className="timeline-time">
                            <span className="time-hour">{item.time}</span>
                            <span className="time-type">{item.type}</span>
                          </div>
                          <div className="timeline-details">
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                      <button 
                        onClick={() => setShowFullSchedule(!showFullSchedule)}
                        className="btn-secondary-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '0.65rem 1.5rem',
                          borderRadius: '50px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: '700',
                          transition: 'all 0.2s ease',
                          fontSize: '0.88rem'
                        }}
                      >
                        <span>{showFullSchedule ? 'Ver Menos' : 'Ver Programa Completo'}</span>
                        <span style={{ fontSize: '0.8rem', transform: showFullSchedule ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>▼</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Media Vigilia RESET specific section: Official Instagram Live Embed */}
              {selectedActivity.id === 3 && (
                <>
                  <div className="modal-section" style={{ marginBottom: '3rem' }}>
                    <h3 className="modal-section-title">Fotos del Evento (Instagram)</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      Explora la publicación oficial de nuestra Media Vigilia <strong>"RESET"</strong> directamente desde Instagram:
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '540px', margin: '0 auto' }}>
                      <iframe
                        src={`https://www.instagram.com/p/${VIGILIA_INSTAGRAM_POST_ID}/embed/captioned/`}
                        width="100%"
                        height="720"
                        frameBorder="0"
                        scrolling="no"
                        allowTransparency="true"
                        style={{
                          border: 'none',
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          width: '100%',
                          maxWidth: '540px',
                          minHeight: '680px',
                          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
                        }}
                        title="Publicación oficial de Instagram Media Vigilia RESET"
                      ></iframe>
                      
                      <a 
                        href={`https://www.instagram.com/p/${VIGILIA_INSTAGRAM_POST_ID}/?img_index=1`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-primary"
                        style={{ marginTop: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.8rem', textDecoration: 'none' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        Abrir publicación en Instagram
                      </a>
                    </div>
                  </div>

                  <div className="modal-section" style={{ marginBottom: '3rem' }}>
                    <h3 className="modal-section-title">Afiche Oficial del Evento</h3>
                    <div 
                      style={{ 
                        display: 'flex', 
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
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                          maxWidth: '320px',
                          width: '100%'
                        }}
                      >
                        <img 
                          src={getImageUrl("/media-vigilia-reset.jpeg")} 
                          alt="Afiche Oficial Media Vigilia RESET" 
                          style={{ width: '100%', display: 'block', height: 'auto', objectFit: 'cover' }} 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Cena de Jóvenes specific section */}
              {selectedActivity.id === 5 && (
                <>
                  <div className="modal-section" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h3 className="modal-section-title">Pre-Registro Abierto</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      Reserva tu cupo para la Cena de Jóvenes 2026. Al pre-registrarte nos ayudas a coordinar la comida, mesas y sorpresas de la cena.
                    </p>
                    <Link 
                      to="/registro?event=cena" 
                      className="btn-primary"
                      style={{ display: 'inline-flex', padding: '0.8rem 2.2rem', textDecoration: 'none' }}
                    >
                      Pre-Registrarse Ahora
                    </Link>
                  </div>

                  <div className="modal-section" style={{ marginBottom: '3rem' }}>
                    <h3 className="modal-section-title">Portada del Evento</h3>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div className="glass-panel" style={{ border: '1px dashed rgba(219, 39, 119, 0.3)', padding: '3.5rem 2rem', textAlign: 'center', background: 'rgba(219, 39, 119, 0.02)', borderRadius: '16px', maxWidth: '320px', width: '100%' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '700' }}>Portada en Proceso</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          La portada oficial del evento estará disponible próximamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Campamento de Jóvenes specific section */}
              {selectedActivity.id === 6 && (
                <>
                  <div className="modal-section" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h3 className="modal-section-title">Pre-Registro Abierto</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      ¡Asegura tu lugar en el Campamento de Jóvenes ICC 2027! Las reservas tempranas nos permiten coordinar el transporte, alojamiento y alimentación de todos los participantes.
                    </p>
                    <Link 
                      to="/registro?event=campamento" 
                      className="btn-primary"
                      style={{ display: 'inline-flex', padding: '0.8rem 2.2rem', textDecoration: 'none' }}
                    >
                      Pre-Registrarse Ahora
                    </Link>
                  </div>

                  <div className="modal-section" style={{ marginBottom: '3rem' }}>
                    <h3 className="modal-section-title">Portada del Evento</h3>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div className="glass-panel" style={{ border: '1px dashed rgba(5, 150, 105, 0.3)', padding: '3.5rem 2rem', textAlign: 'center', background: 'rgba(5, 150, 105, 0.02)', borderRadius: '16px', maxWidth: '320px', width: '100%' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏕️</div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '700' }}>Portada en Proceso</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          La portada oficial del campamento estará disponible próximamente.
                        </p>
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

              {/* General Map/Location component for all activities since they are all at ICC templo (except campamento) */}
              {selectedActivity.id !== 6 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Ubicación del Templo</h3>
                  <div className="location-panel glass-panel" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', padding: '2rem' }}>
                    <div className="location-info-block">
                      <span className="location-badge">Lugar de Reunión</span>
                      <h3>Iglesia De Convertidos a Cristo</h3>
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
