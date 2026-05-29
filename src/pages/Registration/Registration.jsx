import React, { useState } from 'react';
import { Ticket, User, Mail, Phone, Home, Star, Printer, ArrowRight, RotateCcw, MapPin, CheckCircle } from 'lucide-react';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    church: '',
    ageGroup: '18-25',
    participateTalleres: 'si'
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a unique ticket code: 121-ICC-[Random 4-digit number]
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setTicketCode(`121-ICC-${randomCode}`);
    setIsRegistered(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      church: '',
      ageGroup: '18-25',
      participateTalleres: 'si'
    });
    setIsRegistered(false);
  };

  const handlePrint = () => {
    window.print();
  };

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
                Únete a nosotros el <strong>28 y 29 de Agosto</strong> en la conferencia de jóvenes <strong>"Sin Filtro"</strong>. Vive un fin de semana lleno de adoración, instrucción expositiva de la Palabra y comunión. 
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
                    <h3>Talleres & Alimentación Incluida</h3>
                    <p>Acceso a talleres específicos y almuerzo del sábado 100% de cortesía.</p>
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

                <div className="form-row">
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
                  
                  <div className="form-group">
                    <label>¿Participarás en Talleres?</label>
                    <select 
                      name="participateTalleres" 
                      value={formData.participateTalleres} 
                      onChange={handleChange}
                    >
                      <option value="si">Sí, deseo participar</option>
                      <option value="no">No podré asistir a talleres</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  Completar Registro Gratis
                </button>
              </form>
            </div>

          </div>
        ) : (
          /* Success Screen & Digital Ticket */
          <div className="ticket-success-container">
            <div className="success-header">
              <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
              <h2>¡Registro Exitoso!</h2>
              <p>Tu boleto de entrada gratuito ha sido generado. Por favor, tómale una captura o imprímelo para presentarlo en la entrada.</p>
            </div>

            {/* Virtual Ticket Card */}
            <div className="ticket-card animate-fade-in">
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
                    <span className="ticket-info-value">28 - 29 Agosto, 2026</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Costo</span>
                    <span className="ticket-info-value free-badge">TOTALMENTE GRATIS</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Iglesia</span>
                    <span className="ticket-info-value">{formData.church || 'Iglesia Convertidas a Cristo'}</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Talleres & Almuerzo</span>
                    <span className="ticket-info-value">
                      {formData.participateTalleres === 'si' ? '✓ Incluidos' : 'No seleccionados'}
                    </span>
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

              <button onClick={resetForm} className="ticket-action-btn nav">
                <RotateCcw size={18} />
                Registrar a Otro
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Registration;
