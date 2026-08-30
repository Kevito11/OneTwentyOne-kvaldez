import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Ticket, User, Mail, Phone, Home, Star, Printer, RotateCcw, MapPin, CheckCircle, X } from 'lucide-react';
import QRCode from 'qrcode';
import './Registration.css';

// Mock QR Code SVG
const MockQRCode = () => (
  <svg viewBox="0 0 100 100" fill="currentColor">
    {/* Outer borders */}
    <rect x="0" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="5" y="5" width="15" height="15" />

    <rect x="75" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="80" y="5" width="15" height="15" />

    <rect x="0" y="75" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="5" y="80" width="15" height="15" />

    {/* Internal random modules representing QR blocks */}
    <rect x="35" y="5" width="8" height="8" />
    <rect x="48" y="10" width="8" height="18" />
    <rect x="60" y="5" width="8" height="8" />

    <rect x="5" y="35" width="18" height="8" />
    <rect x="30" y="30" width="8" height="8" />
    <rect x="42" y="35" width="15" height="8" />
    <rect x="70" y="35" width="8" height="20" />

    <rect x="5" y="50" width="8" height="15" />
    <rect x="25" y="48" width="12" height="8" />
    <rect x="45" y="50" width="8" height="8" />
    <rect x="85" y="45" width="10" height="15" />

    <rect x="35" y="65" width="8" height="8" />
    <rect x="50" y="60" width="15" height="8" />
    <rect x="80" y="70" width="15" height="8" />

    <rect x="30" y="80" width="18" height="12" />
    <rect x="60" y="85" width="10" height="8" />
    <rect x="55" y="75" width="8" height="8" />
  </svg>
);

const CHURCH_OPTIONS = [
  "Iglesia De Convertidos a Cristo",
  "Iglesia Bautista Cristiana",
  "IBSJ",
  "Iglesia Bautista Internacional",
  "IBO",
  "Iglesia Bautista Fundamental",
  "Iglesia PIEDRA ANGULAR",
  "Iglesia Ciudad de Gracia",
  "Iglesia Cristiana de la Comunidad",
  "Iglesia Bíblica Sola Gracia",
  "Iglesia Cristiana Oasis",
  "Iglesia Comunidad de Vida",
  "Iglesia Bautista Nuevo Pacto"
];

const Registration = () => {
  // Listen to hash changes for real-time image updates during local testing
  const [, setHashTrigger] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setHashTrigger(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Selected Event State ('cena' | 'campamento')
  const [selectedEvent, setSelectedEvent] = useState('cena');

  // Read URL query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    if (eventParam === 'campamento') {
      setSelectedEvent('campamento');
    } else {
      setSelectedEvent('cena');
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    church: '',
    isGuest: false,
    ageGroup: '18-25'
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedChurch, setSelectedChurch] = useState('');
  const [customChurch, setCustomChurch] = useState('');

  // Synchronize church field in formData when selectedChurch, customChurch or isGuest changes
  useEffect(() => {
    if (formData.isGuest) {
      setFormData(prev => ({
        ...prev,
        church: 'Invitado'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        church: selectedChurch === 'Otra' ? customChurch : selectedChurch
      }));
    }
  }, [selectedChurch, customChurch, formData.isGuest]);

  // Generate real QR code when ticketCode changes
  useEffect(() => {
    if (ticketCode) {
      const validationUrl = `${window.location.origin}/ticket/${ticketCode}`;
      QRCode.toDataURL(validationUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
        });
    } else {
      setQrCodeUrl('');
    }
  }, [ticketCode]);

  const getEventTicketDetails = () => {
    switch (selectedEvent) {
      case 'campamento':
        return {
          label: 'Pre-Registro Campamento ICC',
          name: 'CAMPAMENTO JÓVENES ICC 2027',
          subtitle: 'Campamento de Jóvenes ICC',
          date: '16 al 18 de Abril, 2027',
          time: 'Salida 02:00 PM',
          color: '#059669',
          cardClass: 'ticket-camp'
        };
      case 'cena':
      default:
        return {
          label: 'Pre-Registro Cena ICC',
          name: 'CENA DE JÓVENES ICC 2026',
          subtitle: 'Celebración Fin de Año ICC',
          date: 'Sábado 5 de Diciembre, 2026',
          time: '07:00 PM',
          color: '#db2777',
          cardClass: 'ticket-cena'
        };
    }
  };
  const eventDetails = getEventTicketDetails();

  // Change document title for printing/PDF generation
  useEffect(() => {
    if (isRegistered && ticketCode) {
      const originalTitle = document.title;
      const eventTitle = selectedEvent === 'campamento' 
        ? 'Campamento de Jóvenes ICC 2027' 
        : 'Cena de Jóvenes ICC 2026';
      document.title = `${ticketCode} - ${eventTitle}`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [isRegistered, ticketCode, selectedEvent]);

  // Lock body scroll on successful registration overlay
  useEffect(() => {
    if (isRegistered) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.style.overflow = 'hidden';
      document.body.classList.add('success-overlay-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('success-overlay-active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('success-overlay-active');
    };
  }, [isRegistered]);

  const [submitError, setSubmitError] = useState('');

  const handleExitAttempt = () => {
    resetForm();
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('ticket-success-container')) {
      handleExitAttempt();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = selectedEvent === 'campamento' 
      ? `121-CAMP-${randomCode}` 
      : `121-CENA-${randomCode}`;
    const sheetUrl = import.meta.env.VITE_SHEETS_API_URL;

    // Si la URL de la API no está configurada, simulamos localmente para desarrollo
    if (!sheetUrl || sheetUrl.trim() === '') {
      console.warn("VITE_SHEETS_API_URL no está configurada. Se simulará el registro localmente.");
      setTimeout(() => {
        setTicketCode(generatedCode);
        setIsRegistered(true);
        setIsSubmitting(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          church: formData.church || 'Iglesia De Convertidos a Cristo',
          ageGroup: formData.ageGroup,
          ticketCode: generatedCode,
          interestedInMerch: 'No',
          merchItems: 'Ninguno',
          merchTotal: 0,
          merchImageUrls: '',
          event: selectedEvent === 'campamento' 
            ? 'Campamento de Jóvenes 2027' 
            : 'Cena de Jóvenes 2026',
          eventType: selectedEvent,
          ticketUrl: `${window.location.origin}/ticket/${generatedCode}`,
          ticketLink: `${window.location.origin}/ticket/${generatedCode}`,
          validationUrl: `${window.location.origin}/ticket/${generatedCode}`,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/ticket/${generatedCode}`)}`,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/ticket/${generatedCode}`)}`,
          activeTheme: document.body.classList.contains('orange-theme') 
            ? 'orange' 
            : (document.body.classList.contains('yellow-theme') ? 'yellow' : 'classic')
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        setTicketCode(generatedCode);
        setIsRegistered(true);
      } else {
        throw new Error(result.message || 'Error del servidor al guardar los datos.');
      }
    } catch (error) {
      console.error("Error al registrar en Google Sheets:", error);
      setSubmitError("Hubo un problema al enviar tus datos. Por favor, verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      church: '',
      isGuest: false,
      ageGroup: '18-25'
    });
    setSelectedChurch('');
    setCustomChurch('');
    setSubmitError('');
    setIsSubmitting(false);
    setIsRegistered(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="registration-page animate-fade-in section-padding">
      <div className="container">

        {!isRegistered && (
          <div className="registration-selector-container animate-fade-in" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="registration-select-title">Elige el evento para registrarte</h2>
            <div className="registration-event-tabs centered" style={{ marginTop: '1.2rem' }}>
              <button
                type="button"
                className={`reg-tab-btn ${selectedEvent === 'cena' ? 'active' : ''}`}
                onClick={() => handleEventChange('cena')}
              >
                Cena de Jóvenes
              </button>
              <button
                type="button"
                className={`reg-tab-btn ${selectedEvent === 'campamento' ? 'active' : ''}`}
                onClick={() => handleEventChange('campamento')}
              >
                Campamento
              </button>
            </div>
          </div>
        )}

        {!isRegistered ? (
          <div className="registration-layout">

            {/* Info Column */}
            <div className="registration-info animate-fade-in" key={selectedEvent}>
              {selectedEvent === 'cena' && (
                <>
                  <span className="subtitle" style={{ color: '#db2777' }}>
                    <Star size={16} style={{ color: '#db2777', marginRight: '5px', verticalAlign: 'middle' }} />
                    Pre-Registro: Cena de Jóvenes 2026
                  </span>
                  <h1 className="title">Cena de <span className="text-gradient-cena">Jóvenes</span></h1>
                  <p className="description">
                    Acompáñanos el <strong>Sábado 5 de Diciembre</strong> en nuestra tradicional Cena de Jóvenes. Un tiempo especial de comunión, cena compartida, dinámicas de grupo y agradecimiento al Señor por este año transcurrido.
                  </p>

                  <div className="ticket-perks">
                    <div className="perk-item">
                      <div className="perk-icon" style={{ background: 'rgba(219, 39, 119, 0.1)', color: '#db2777' }}><Star size={24} /></div>
                      <div>
                        <h3>Cena & Compañerismo</h3>
                        <p>Disfrutaremos de una deliciosa comida juntos y un ambiente de celebración en comunidad.</p>
                      </div>
                    </div>

                    <div className="perk-item">
                      <div className="perk-icon" style={{ background: 'rgba(219, 39, 119, 0.1)', color: '#db2777' }}><Star size={24} /></div>
                      <div>
                        <h3>Dinámicas & Sorpresas</h3>
                        <p>Actividades interactivas preparadas especialmente para celebrar este año de fe.</p>
                      </div>
                    </div>
                  </div>

                  <div className="free-pass-badge" style={{ borderLeft: '4px solid #db2777' }}>
                    <span className="badge-title">Pre-Registro Abierto</span>
                    <span className="badge-price" style={{ fontSize: '1.8rem', color: '#db2777' }}>POR ANUNCIAR</span>
                    <span className="badge-note">* Esta actividad tendrá un costo. Al pre-registrarte aseguras tu cupo, y te avisaremos por correo y redes una vez se abran las inscripciones formales con los montos y métodos de pago.</span>
                  </div>

                  <div className="registration-poster-wrapper glass-panel" style={{ border: '1px dashed rgba(219, 39, 119, 0.3)', padding: '3.5rem 2rem', textAlign: 'center', background: 'rgba(219, 39, 119, 0.02)', borderRadius: '16px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '700' }}>Portada en Proceso</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      La portada oficial de la Cena de Jóvenes estará disponible próximamente.
                    </p>
                  </div>
                </>
              )}

              {selectedEvent === 'campamento' && (
                <>
                  <span className="subtitle" style={{ color: '#059669' }}>
                    <Star size={16} style={{ color: '#059669', marginRight: '5px', verticalAlign: 'middle' }} />
                    Pre-Registro: Campamento 2027
                  </span>
                  <h1 className="title">Campamento <span className="text-gradient-camp">Jóvenes ICC</span></h1>
                  <p className="description">
                    Reserva tu cupo para el Campamento de Jóvenes 2027, del <strong>16 al 18 de Abril de 2027</strong>. Tres días apartados para buscar al Señor, estudiar Su palabra y disfrutar de actividades en comunidad.
                  </p>

                  <div className="ticket-perks">
                    <div className="perk-item">
                      <div className="perk-icon" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}><Star size={24} /></div>
                      <div>
                        <h3>Devocionales & Plenarias</h3>
                        <p>Tiempo de instrucción profunda enfocado en la vida cristiana y edificación mutua.</p>
                      </div>
                    </div>

                    <div className="perk-item">
                      <div className="perk-icon" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}><Star size={24} /></div>
                      <div>
                        <h3>Deportes & Fogatas</h3>
                        <p>Juegos de equipo, fogatas nocturnas y dinámicas competitivas al aire libre.</p>
                      </div>
                    </div>
                  </div>

                  <div className="free-pass-badge" style={{ borderLeft: '4px solid #059669' }}>
                    <span className="badge-title">Pre-Registro Abierto</span>
                    <span className="badge-price" style={{ fontSize: '1.8rem', color: '#059669' }}>POR ANUNCIAR</span>
                    <span className="badge-note">* Esta actividad tendrá un costo. Al pre-registrarte aseguras tu cupo, y te avisaremos por correo y redes una vez se abran las inscripciones formales con los montos y métodos de pago.</span>
                  </div>

                  <div className="registration-poster-wrapper glass-panel" style={{ border: '1px dashed rgba(5, 150, 105, 0.3)', padding: '3.5rem 2rem', textAlign: 'center', background: 'rgba(5, 150, 105, 0.02)', borderRadius: '16px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏕️</div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '700' }}>Portada en Proceso</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      La portada oficial del Campamento estará disponible próximamente.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Form Column */}
            <div className="registration-form-container glass-panel">
              <h2 className="form-title">Formulario de Pre-Registro</h2>

              {submitError && (
                <div className="submit-error-alert">
                  <span>⚠️ {submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Teléfono / WhatsApp</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(809) 000-0000"
                    />
                  </div>
                </div>

                <div className="form-group guest-checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="isGuest"
                      checked={formData.isGuest}
                      onChange={handleChange}
                    />
                    <span className="checkbox-checkmark"></span>
                    <span className="checkbox-label-text">Soy un invitado (No pertenezco a ninguna iglesia)</span>
                  </label>
                </div>

                {formData.isGuest ? (
                  <div className="guest-welcome-message animate-fade-in">
                    <p className="welcome-text">
                      ¡Nos alegra muchísimo que nos acompañes! Agradecemos profundamente tu pre-registro y tu interés en participar. Creemos que Dios tiene un propósito especial para ti.
                    </p>
                    <blockquote className="welcome-verse">
                      "Por tanto, recibíos los unos a los otros, como también Cristo nos recibió, para gloria de Dios."
                      <cite>— Romanos 15:7</cite>
                    </blockquote>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Iglesia a la que perteneces</label>
                      <div className="input-with-icon">
                        <Home size={18} className="input-icon" style={{ pointerEvents: 'none' }} />
                        <select
                          name="selectedChurch"
                          value={selectedChurch}
                          onChange={(e) => setSelectedChurch(e.target.value)}
                          required
                          style={{ paddingLeft: '3.2rem', cursor: 'pointer' }}
                        >
                          <option value="" disabled>Selecciona tu iglesia</option>
                          {CHURCH_OPTIONS.map((church) => (
                            <option key={church} value={church}>{church}</option>
                          ))}
                          <option value="Otra">Otra...</option>
                        </select>
                      </div>
                    </div>

                    {selectedChurch === 'Otra' && (
                      <div className="form-group animate-fade-in">
                        <label>Nombre de la iglesia</label>
                        <div className="input-with-icon">
                          <Home size={18} className="input-icon" style={{ pointerEvents: 'none' }} />
                          <input
                            type="text"
                            value={customChurch}
                            onChange={(e) => setCustomChurch(e.target.value)}
                            required
                            placeholder="Escribe el nombre de tu iglesia"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="form-group">
                  <label>Rango de Edad</label>
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleChange}
                  >
                    <option value="12-17">12 - 17 años</option>
                    <option value="18-25">18 - 25 años</option>
                    <option value="26-35">26 - 35 años</option>
                    <option value="35+">Más de 35 años</option>
                  </select>
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando Pre-Registro...' : 'Completar Pre-Registro'}
                </button>
              </form>
            </div>

          </div>
        ) : null}

      </div>

      {/* SUCCESS SCREEN - Portal */}
      {isRegistered && createPortal(
          <div className="ticket-success-container" onClick={handleOutsideClick}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExitAttempt();
              }}
              className="ticket-close-btn"
              aria-label="Cerrar y volver al registro"
              style={{
                position: 'fixed',
                top: '1.25rem',
                right: '1.25rem',
                zIndex: 10001,
              }}
            >
              <X size={20} />
            </button>
            <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '2.5rem', alignItems: 'center' }}>
            <div className="success-header">
              <CheckCircle size={64} style={{ color: eventDetails.color, margin: '0 auto 1rem auto' }} />
              <h2>¡Pre-Registro Completado!</h2>
              <p>Tu cupo de pre-registro para la <strong>{eventDetails.name}</strong> ha sido reservado con éxito. <strong>Te hemos enviado una confirmación por correo</strong>. Más adelante, te notificaremos por correo electrónico y redes sociales con los montos del evento y las instrucciones para realizar tu registro y pago formal.</p>
            </div>

            {/* Virtual Ticket Card */}
            <div className={`ticket-card animate-fade-in ${eventDetails.cardClass}`} onClick={(e) => e.stopPropagation()}>
              <div className="ticket-top">
                <div className="ticket-header">
                  <div className="ticket-event-info">
                    <span className="ticket-event-label">{eventDetails.label}</span>
                    <span className="ticket-event-name text-gradient" style={{ backgroundImage: `linear-gradient(90deg, #fff 0%, ${eventDetails.color} 100%)` }}>
                      {eventDetails.name}
                    </span>
                    <span className="ticket-event-subtitle">
                      {eventDetails.subtitle}
                    </span>
                  </div>
                  <div className="ticket-logo">
                    <span className="t-logo-text">Jóvenes</span>
                    <div className="t-logo-sub" style={{ color: eventDetails.color }}>I C C</div>
                  </div>
                </div>

                <div className="ticket-body-grid">
                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Asistente</span>
                    <span className="ticket-info-value">{formData.firstName} {formData.lastName}</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">
                      Código de Pre-Registro
                    </span>
                    <span className="ticket-info-value" style={{ fontFamily: 'monospace', letterSpacing: '1px', color: eventDetails.color }}>
                      {ticketCode}
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Fecha del Evento</span>
                    <span className="ticket-info-value">
                      {eventDetails.date}
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Hora de Apertura</span>
                    <span className="ticket-info-value">
                      {eventDetails.time}
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Costo</span>
                    <span className="ticket-info-value free-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      POR ANUNCIAR
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Iglesia</span>
                    <span className="ticket-info-value">{formData.church || 'Iglesia De Convertidos a Cristo'}</span>
                  </div>
                </div>
              </div>

              <div className="ticket-bottom">
                <div className="ticket-info-item" style={{ maxWidth: '70%' }}>
                  <span className="ticket-info-label">Ubicación / Lugar</span>
                  <span className="ticket-info-value" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    Iglesia De Convertidos a Cristo (ICC)<br />
                    C/ Dr. Núñez Domínguez #30, La Julia, Santo Domingo
                  </span>
                </div>

                <div className="qr-code-box">
                  {qrCodeUrl ? (
                    <a
                      href={`${window.location.origin}/ticket/${ticketCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <img
                        src={qrCodeUrl}
                        alt={`Código QR para entrada ${ticketCode}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                      />
                    </a>
                  ) : (
                    <MockQRCode />
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ticket-actions-bar">
              <button onClick={handlePrint} className="ticket-action-btn print">
                <Printer size={18} />
                Imprimir Boleto / PDF
              </button>

              <a
                href="https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6"
                target="_blank"
                rel="noopener noreferrer"
                className="ticket-action-btn nav"
              >
                <MapPin size={18} style={{ color: 'var(--accent-color)' }} />
                Cómo llegar (Maps)
              </a>

              <button onClick={handleExitAttempt} className="ticket-action-btn nav">
                <RotateCcw size={18} />
                Registrar a Otro
              </button>
            </div>
            </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default Registration;
