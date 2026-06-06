import { useState } from 'react';
import { Ticket, User, Mail, Phone, Home, Star, Printer, RotateCcw, MapPin, CheckCircle, X } from 'lucide-react';
import './Registration.css';

// Mock QR Code SVG for visual WOW factor
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

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    church: '',
    ageGroup: '18-25'
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showExitWarning, setShowExitWarning] = useState(false);

  const handleExitAttempt = () => {
    setShowExitWarning(true);
  };

  const confirmExit = () => {
    setShowExitWarning(false);
    resetForm();
  };

  const cancelExit = () => {
    setShowExitWarning(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('ticket-success-container')) {
      handleExitAttempt();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `121-ICC-${randomCode}`;
    const sheetUrl = import.meta.env.VITE_SHEETS_API_URL;

    // Si la URL de la API no está configurada, simulamos localmente para desarrollo
    if (!sheetUrl || sheetUrl.trim() === '') {
      console.warn("VITE_SHEETS_API_URL no está configurada en .env.local. Se simulará el registro localmente.");
      setTimeout(() => {
        setTicketCode(generatedCode);
        setIsRegistered(true);
        setIsSubmitting(false);
      }, 1000);
      return;
    }

    try {
      // Usamos 'text/plain;charset=utf-8' para evitar problemas con peticiones CORS preflight (OPTIONS)
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
          church: formData.church || 'Iglesia Convertidas a Cristo',
          ageGroup: formData.ageGroup,
          participateTalleres: 'No',
          ticketCode: generatedCode
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
      ageGroup: '18-25'
    });
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
        
        {!isRegistered ? (
          <div className="registration-layout">
            
            {/* Info Column */}
            <div className="registration-info">
              <span className="subtitle">
                <Star size={16} style={{ color: 'var(--accent-color)', marginRight: '5px', verticalAlign: 'middle' }} />
                Registro Abierto 2026
              </span>
              <h1 className="title">Asegura tu <span className="text-gradient">Lugar</span></h1>
              <p className="description">
                Únete a nosotros el <strong>29 de Agosto</strong> en la conferencia de jóvenes <strong>"Sin Filtro"</strong>. Vive un día intensivo lleno de adoración, instrucción expositiva de la Palabra y comunión. 
              </p>
              
              <div className="ticket-perks">
                <div className="perk-item">
                  <div className="perk-icon"><Ticket size={24} /></div>
                  <div>
                    <h3>Acceso Completo Gratis</h3>
                    <p>Entrada libre a todas las conferencias plenarias y dinámicas de grupo.</p>
                  </div>
                </div>
                
                <div className="perk-item">
                  <div className="perk-icon"><Star size={24} /></div>
                  <div>
                    <h3>Experiencia Organizada</h3>
                    <p>Es necesario registrarse previamente para poder brindarte una experiencia más cómoda y coordinada.</p>
                  </div>
                </div>
              </div>
              
              <div className="free-pass-badge">
                <span className="badge-title">Tipo de Entrada</span>
                <span className="badge-price">GRATIS</span>
                <span className="badge-note">* Registro previo obligatorio para la logística del evento.</span>
              </div>

              <div className="registration-poster-wrapper glass-panel">
                <img src="/sin-filtro-poster.jpeg" alt="Afiche Conferencia Sin Filtro 2026" className="registration-poster" />
              </div>
            </div>

            {/* Form Column */}
            <div className="registration-form-container glass-panel">
              <h2 className="form-title">Formulario de Registro</h2>
              
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

                <div className="form-group">
                  <label>Iglesia que visitas (Opcional)</label>
                  <div className="input-with-icon">
                    <Home size={18} className="input-icon" />
                    <input 
                      type="text" 
                      name="church" 
                      value={formData.church} 
                      onChange={handleChange} 
                      placeholder="Iglesia Convertidos a Cristo" 
                    />
                  </div>
                </div>

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
                  {isSubmitting ? 'Registrando...' : 'Completar Registro Gratis'}
                </button>
              </form>
            </div>

          </div>
        ) : (
          /* Success Screen & Digital Ticket */
          <div className="ticket-success-container" onClick={handleOutsideClick}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleExitAttempt();
              }}
              className="ticket-close-btn" 
              aria-label="Cerrar y volver al registro"
            >
              <X size={20} />
            </button>
            <div className="success-header">
              <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
              <h2>¡Registro Exitoso!</h2>
              <p>Tu boleto de entrada gratuito ha sido generado. Por favor, tómale una captura o imprímelo para presentarlo en la entrada.</p>
            </div>

            {/* Virtual Ticket Card */}
            <div className="ticket-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="ticket-top">
                <div className="ticket-header">
                  <div className="ticket-event-info">
                    <span className="ticket-event-label">Boleto de Entrada</span>
                    <span className="ticket-event-name text-gradient">SIN FILTRO 2026</span>
                    <span className="ticket-event-subtitle">Conferencia de Jóvenes ICC</span>
                  </div>
                  <div className="ticket-logo">
                    <span className="t-logo-text">OneTwentyOne</span>
                    <div className="t-logo-sub">I C C</div>
                  </div>
                </div>

                <div className="ticket-body-grid">
                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Asistente</span>
                    <span className="ticket-info-value">{formData.firstName} {formData.lastName}</span>
                  </div>
                  
                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Código de Entrada</span>
                    <span className="ticket-info-value" style={{ fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--accent-light)' }}>
                      {ticketCode}
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Fecha del Evento</span>
                    <span className="ticket-info-value">Sábado 29 Agosto, 2026</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Hora de Apertura</span>
                    <span className="ticket-info-value">8:30 AM</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Costo</span>
                    <span className="ticket-info-value free-badge">TOTALMENTE GRATIS</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Iglesia</span>
                    <span className="ticket-info-value">{formData.church || 'Iglesia Convertidas a Cristo'}</span>
                  </div>
                </div>
              </div>

              <div className="ticket-bottom">
                <div className="ticket-info-item" style={{ maxWidth: '70%' }}>
                  <span className="ticket-info-label">Ubicación / Lugar</span>
                  <span className="ticket-info-value" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    Iglesia Convertidas a Cristo (ICC)<br />
                    C/ Dr. Núñez Domínguez #30, La Julia, Santo Domingo
                  </span>
                </div>
                
                <div className="qr-code-box">
                  <MockQRCode />
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
        )}

      </div>

      {/* Modal de Advertencia al Salir */}
      {showExitWarning && (
        <div className="exit-warning-overlay" onClick={cancelExit}>
          <div className="exit-warning-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="warning-icon-wrap">
              <Star size={32} className="warning-star-icon" />
            </div>
            <h3>¿Guardaste tu boleto?</h3>
            <p>
              Asegúrate de haberle tomado una captura de pantalla al boleto o haber guardado tu código de entrada (<strong>{ticketCode}</strong>) antes de salir, ya que lo necesitarás el día del evento.
            </p>
            <div className="warning-buttons">
              <button onClick={confirmExit} className="warning-btn confirm">
                Sí, ya lo guardé
              </button>
              <button onClick={cancelExit} className="warning-btn cancel">
                No, déjame guardarlo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
