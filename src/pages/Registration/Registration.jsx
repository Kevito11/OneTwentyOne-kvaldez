import { useState, useEffect } from 'react';
import { Ticket, User, Mail, Phone, Home, Star, Printer, RotateCcw, MapPin, CheckCircle, X, Check, ShoppingBag, Plus, Minus, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { getImageUrl } from '../../config/images';
import capImg from '../../assets/merch/cap.png';
import capGreyImg from '../../assets/merch/cap_grey.png';
import tshirtImg from '../../assets/merch/tshirt.png';
import tshirtWhiteImg from '../../assets/merch/tshirt_white.png';
import hoodieImg from '../../assets/merch/hoodie.png';
import hoodieCharcoalImg from '../../assets/merch/hoodie_charcoal.png';
import './Registration.css';

const PRODUCTS = [
  {
    id: 1,
    name: "Gorra \"Sin Filtros\"",
    price: 500,
    images: {
      "Negro": capImg,
      "Gris": capGreyImg
    },
    colors: ["Negro", "Gris"],
    sizes: ["Única"]
  },
  {
    id: 2,
    name: "Camiseta \"Sin Filtros\"",
    price: 700,
    images: {
      "Negro": tshirtImg,
      "Blanco Roto": tshirtWhiteImg
    },
    colors: ["Negro", "Blanco Roto"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Hoodie \"Sin Filtros\"",
    price: 1200,
    images: {
      "Negro": hoodieImg,
      "Gris Carbón": hoodieCharcoalImg
    },
    colors: ["Negro", "Gris Carbón"],
    sizes: ["S", "M", "L", "XL"]
  }
];

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

const CHURCH_OPTIONS = [
  "Iglesia de Convertidos a Cristo",
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

const MerchPaymentInstructions = () => {
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="merch-payment-card glass-panel animate-fade-in">
      <div className="merch-payment-header">
        <ShoppingBag size={18} className="text-gradient" />
        <h3>Instrucciones de Reserva</h3>
      </div>
      
      <p className="merch-payment-desc">
        Para asegurar tus artículos, debes abonar el <strong>50% del total</strong> mediante depósito o transferencia, y realizar el pago restante antes del <strong>5 de Agosto</strong>.
      </p>

      <div className="payment-tip-box" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', borderLeft: '3px solid var(--accent-light, #ffffff)', color: 'var(--text-secondary)' }}>
        <strong>💡 Concepto de pago:</strong> Al realizar el depósito o transferencia, por favor indica en el concepto o descripción tu <strong>Código de Boleto</strong> (se te dará al finalizar este registro) acompañado de tu nombre para asociarlo más rápido.
        <span style={{ display: 'block', marginTop: '0.25rem', fontFamily: 'monospace', color: 'white' }}>Estructura: [Código de Boleto] - [Tu Nombre]</span>
      </div>

      <div className="merch-accounts-container">
        <div className="merch-account-item">
          <div className="merch-bank-info">
            <span className="merch-bank-name banreservas">Banreservas</span>
            <span className="merch-account-type">Corriente RD$</span>
          </div>
          <div className="merch-account-number-row">
            <code>0102401330</code>
            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopy('0102401330', 'banreservas')}
              title="Copiar cuenta"
            >
              {copiedText === 'banreservas' ? <Check size={12} className="copied" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        <div className="merch-account-item">
          <div className="merch-bank-info">
            <span className="merch-bank-name popular">Banco Popular</span>
            <span className="merch-account-type">Corriente RD$</span>
          </div>
          <div className="merch-account-number-row">
            <code>805943297</code>
            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopy('805943297', 'popular_rd')}
              title="Copiar cuenta"
            >
              {copiedText === 'popular_rd' ? <Check size={12} className="copied" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        <div className="merch-account-item">
          <div className="merch-bank-info">
            <span className="merch-bank-name popular">Banco Popular</span>
            <span className="merch-account-type">Ahorros US$</span>
          </div>
          <div className="merch-account-number-row">
            <code>818318875</code>
            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopy('818318875', 'popular_us')}
              title="Copiar cuenta"
            >
              {copiedText === 'popular_us' ? <Check size={12} className="copied" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      <div className="merch-beneficiary-info">
        <div><strong>Beneficiario:</strong> Iglesia de Convertidos a Cristo</div>
        <div className="rnc-row">
          <span><strong>RNC:</strong> <code>424-00200-2</code></span>
          <button
            type="button"
            className="copy-btn mini"
            onClick={() => handleCopy('424-00200-2', 'rnc')}
            title="Copiar RNC"
          >
            {copiedText === 'rnc' ? <Check size={10} className="copied" /> : <Copy size={10} />}
          </button>
        </div>
      </div>

      <a 
        href="https://wa.me/18498838466"
        target="_blank"
        rel="noopener noreferrer"
        className="merch-payment-footer-note wa-link"
      >
        <Phone size={14} style={{ color: 'var(--accent-light)' }} />
        <span>Envía el comprobante por WhatsApp al <strong>849-883-8466</strong> (Haz clic para chatear).</span>
      </a>
    </div>
  );
};

const Registration = () => {
  // Carousel images
  const posterImages = [getImageUrl('/sin-filtro-poster.jpeg'), getImageUrl('/sin-filtros-theme.jpeg')];
  const [activePosterIndex, setActivePosterIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePosterIndex((prevIndex) => (prevIndex + 1) % posterImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [posterImages.length]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    church: '',
    ageGroup: '18-25',
    interestedInMerch: false,
    merchSelections: {
      1: { selected: false, color: 'Negro', size: 'Única', quantity: 1 },
      2: { selected: false, color: 'Negro', size: 'M', quantity: 1 },
      3: { selected: false, color: 'Negro', size: 'L', quantity: 1 }
    }
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedChurch, setSelectedChurch] = useState('');
  const [customChurch, setCustomChurch] = useState('');

  // Sincronizar el campo 'church' de formData cuando cambian selectedChurch o customChurch
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      church: selectedChurch === 'Otra' ? customChurch : selectedChurch
    }));
  }, [selectedChurch, customChurch]);

  // Generar QR real cuando se obtiene el ticketCode
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

  // Cambiar el título del documento para la impresión/descarga del PDF
  useEffect(() => {
    if (isRegistered && ticketCode) {
      const originalTitle = document.title;
      document.title = `${ticketCode} - Sin Filtros 2026`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [isRegistered, ticketCode]);

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
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleMerchSelectionToggle = (productId) => {
    setFormData(prev => ({
      ...prev,
      merchSelections: {
        ...prev.merchSelections,
        [productId]: {
          ...prev.merchSelections[productId],
          selected: !prev.merchSelections[productId].selected
        }
      }
    }));
  };

  const handleMerchOptionChange = (productId, optionName, value) => {
    setFormData(prev => ({
      ...prev,
      merchSelections: {
        ...prev.merchSelections,
        [productId]: {
          ...prev.merchSelections[productId],
          [optionName]: value
        }
      }
    }));
  };

  const handleMerchQuantityChange = (productId, delta) => {
    setFormData(prev => {
      const currentQty = prev.merchSelections[productId].quantity;
      const newQty = Math.max(1, currentQty + delta);
      return {
        ...prev,
        merchSelections: {
          ...prev.merchSelections,
          [productId]: {
            ...prev.merchSelections[productId],
            quantity: newQty
          }
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `121-ICC-${randomCode}`;
    const sheetUrl = import.meta.env.VITE_SHEETS_API_URL;

    // Calcular merch seleccionada
    const selectedItems = [];
    let merchTotal = 0;
    if (formData.interestedInMerch) {
      PRODUCTS.forEach(p => {
        const sel = formData.merchSelections[p.id];
        if (sel.selected) {
          selectedItems.push(`${sel.quantity}x ${p.name} - ${sel.color} (Talla: ${sel.size})`);
          merchTotal += p.price * sel.quantity;
        }
      });
    }
    const merchItems = selectedItems.join(', ') || 'Ninguno';

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
          church: formData.church || 'Iglesia de Convertidos a Cristo',
          ageGroup: formData.ageGroup,
          ticketCode: generatedCode,
          interestedInMerch: formData.interestedInMerch ? 'Sí' : 'No',
          merchItems,
          merchTotal
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
      ageGroup: '18-25',
      interestedInMerch: false,
      merchSelections: {
        1: { selected: false, color: 'Negro', size: 'Única', quantity: 1 },
        2: { selected: false, color: 'Negro', size: 'M', quantity: 1 },
        3: { selected: false, color: 'Negro', size: 'L', quantity: 1 }
      }
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
                Únete a nosotros el <strong>29 de Agosto</strong> en la conferencia de jóvenes <strong>"Sin Filtros"</strong>. Vive un día lleno de adoración e instrucción expositiva de la Palabra de Dios y comunión.
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
                <div className="poster-carousel-track">
                  <div className={`poster-carousel-item ${activePosterIndex === 0 ? 'active' : ''}`}>
                    <img src={posterImages[0]} alt="Afiche Conferencia Sin Filtros 2026 - Opción 1" className="featured-card-poster" />
                  </div>
                  <div className={`poster-carousel-item ${activePosterIndex === 1 ? 'active' : ''}`}>
                    <img src={posterImages[1]} alt="Afiche Conferencia Sin Filtros 2026 - Opción 2" className="featured-card-poster" />
                  </div>
                </div>

                <div className="registration-poster-dots">
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

                {/* Pregunta sobre Mercancía con diseño premium */}
                <div className="form-group merch-checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="interestedInMerch"
                      checked={formData.interestedInMerch}
                      onChange={handleChange}
                    />
                    <span className="checkbox-checkmark"></span>
                    <span className="checkbox-label-text">¿Te interesa adquirir mercancía oficial de la conferencia?</span>
                  </label>
                </div>

                {/* Galería Visual de Mercancía -> Reemplazado por Próximamente */}
                {formData.interestedInMerch && (
                  <div className="registration-merch-selection animate-fade-in" style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', margin: '1.5rem 0' }}>
                    <ShoppingBag size={40} style={{ color: 'var(--text-secondary)', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'white' }}>Mercancía Oficial</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, maxWidth: '380px' }}>
                      <strong>¡Próximamente!</strong> Estamos preparando la colección oficial de artículos "Sin Filtros" 2026. Podrás verla y adquirirla muy pronto. Mantente atento.
                    </p>
                  </div>
                )}

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
              <p>Tu boleto de entrada gratuito ha sido generado. Por favor, tómale una captura o imprímelo para presentarlo en la entrada. También te hemos enviado una copia a tu correo (si no lo recibes, revisa la carpeta de Spam).</p>
            </div>

            {/* Virtual Ticket Card */}
            <div className="ticket-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="ticket-top">
                <div className="ticket-header">
                  <div className="ticket-event-info">
                    <span className="ticket-event-label">Boleto de Entrada</span>
                    <span className="ticket-event-name text-gradient">SIN FILTROS 2026</span>
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
                    <span className="ticket-info-value">03:00 PM</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Costo</span>
                    <span className="ticket-info-value free-badge">TOTALMENTE GRATIS</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Iglesia</span>
                    <span className="ticket-info-value">{formData.church || 'Iglesia de Convertidos a Cristo'}</span>
                  </div>
                </div>

                {/* Visualizing reserved merch inside the ticket if present */}
                {formData.interestedInMerch && (() => {
                  const selectedItems = [];
                  let merchTotal = 0;
                  PRODUCTS.forEach(p => {
                    const sel = formData.merchSelections[p.id];
                    if (sel.selected) {
                      selectedItems.push(`${sel.quantity}x ${p.name} (${sel.color}${sel.size !== 'Única' ? `, Talla: ${sel.size}` : ''})`);
                      merchTotal += p.price * sel.quantity;
                    }
                  });
                  return selectedItems.length > 0 ? (
                    <div className="ticket-merch-summary-box">
                      <div className="ticket-merch-title-row">
                        <ShoppingBag size={14} style={{ color: 'var(--text-primary)' }} />
                        <span>Mercancía Reservada (Abono del 50% Requerido)</span>
                      </div>
                      <div className="ticket-merch-items-text">
                        {selectedItems.map((item, idx) => (
                          <span key={idx} className="ticket-merch-item-chip">{item}</span>
                        ))}
                      </div>
                      <div className="ticket-merch-total-row">
                        <span>Abono requerido (50%):</span>
                        <strong>RD$ {(merchTotal / 2).toLocaleString()}</strong>
                      </div>
                      <div className="ticket-merch-total-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                        <span>Total de venta:</span>
                        <strong>RD$ {merchTotal.toLocaleString()}</strong>
                      </div>
                      <div className="ticket-merch-note" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.6rem', lineHeight: '1.4' }}>
                        <div style={{ marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                          <strong>📌 Confirmación de Reserva (Abono 50%):</strong>
                        </div>
                        <div>1. Realiza el depósito/transferencia del 50% a cualquiera de las cuentas indicadas.</div>
                        <div style={{ margin: '0.2rem 0' }}>
                          2. En el concepto de tu banco, indica la siguiente estructura para asociarlo fácilmente:
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.5rem', borderRadius: '4px', margin: '0.25rem 0', fontFamily: 'monospace', color: 'white', display: 'block', width: 'fit-content' }}>
                            {ticketCode} - {formData.firstName} {formData.lastName}
                          </div>
                        </div>
                        <div style={{ color: '#fbd590', marginBottom: '0.4rem' }}>
                          * El pago restante (50%) debe completarse antes del <strong>5 de Agosto</strong>.
                        </div>

                        {/* Botón idéntico al del registro para enviar comprobante */}
                        <a 
                          href={`https://wa.me/18498838466?text=${encodeURIComponent(
                            `*COMPROBANTE DE ABONO - REGISTRO CONFERENCIA*\n\n*Asistente:* ${formData.firstName} ${formData.lastName}\n*Código de Boleto:* ${ticketCode}\n\nAdjunto el comprobante del depósito del 50% para confirmar la reserva de mi mercancía.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="merch-payment-footer-note wa-link"
                          style={{ textDecoration: 'none', display: 'flex', marginTop: '0.6rem', padding: '0.6rem 0.8rem' }}
                        >
                          <Phone size={14} style={{ color: 'var(--accent-light)' }} />
                          <span>Envía el comprobante por WhatsApp al <strong>849-883-8466</strong> (Haz clic para chatear).</span>
                        </a>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="ticket-bottom">
                <div className="ticket-info-item" style={{ maxWidth: '70%' }}>
                  <span className="ticket-info-label">Ubicación / Lugar</span>
                  <span className="ticket-info-value" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    Iglesia de Convertidos a Cristo (ICC)<br />
                    C/ Dr. Núñez Domínguez #30, La Julia, Santo Domingo
                  </span>
                </div>

                <div className="qr-code-box">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt={`Código QR para entrada ${ticketCode}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
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
