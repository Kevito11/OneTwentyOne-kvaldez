import { useState, useEffect, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Ticket, User, Mail, Phone, Home, Star, Printer, RotateCcw, MapPin, CheckCircle, X, Check, ShoppingBag, Plus, Minus, Copy, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';
import { getImageUrl } from '../../config/images';
import './Registration.css';

// Componente para manejar imágenes con fallback local y detección instantánea de caché
const ImageWithFallback = forwardRef(({ src, localPath, alt, className, style, onLoad }, ref) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const internalRef = useRef(null);
  const imgRef = ref || internalRef;

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (onLoad) onLoad();
    }
  }, [currentSrc]);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={() => {
        if (currentSrc !== localPath) {
          setCurrentSrc(localPath);
        }
      }}
    />
  );
});

// Componente para previsualización premium con transición suave al cambiar de imagen/color
const PremiumImageDisplay = ({ src, localPath, alt, className, style }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <ImageWithFallback
        ref={imgRef}
        src={getImageUrl(src)}
        localPath={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{
          ...style,
          transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(0.97)',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

const PRODUCTS = [
  {
    id: 1,
    name: "Gorra \"Sin Filtros\"",
    price: 750,
    type: "cap",
    images: {
      "Negro": {
        front: "/merch/Merch SIN FILTROS gorra Frontal.jpeg",
        back: "/merch/Merch SIN FILTROS gorra 2.jpeg"
      }
    },
    colors: ["Negro"],
    colorHex: {
      "Negro": "#000000"
    },
    sizes: ["Única"]
  },
  {
    id: 2,
    name: "Camiseta \"Sin Filtros\"",
    price: 1200,
    type: "tshirt",
    images: {
      "Negro": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 6.jpeg",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 6.jpeg"
      },
      "Gris": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 4.jpeg",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 4.jpeg"
      },
      "Blanco": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 3.jpeg",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 3.jpeg"
      }
    },
    colors: ["Negro", "Gris", "Blanco"],
    colorHex: {
      "Negro": "#121212",
      "Gris": "#8A8A8A",
      "Blanco": "#FFFFFF"
    },
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
        Para asegurar tus artículos, debes abonar el <strong>100% del total</strong> mediante depósito o transferencia, y estaremos contactando una vez esté listo y disponible para retirar en la iglesia.
      </p>

      <div className="payment-tip-box" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', borderLeft: '3px solid var(--accent-light, #ffffff)', color: 'var(--text-secondary)' }}>
        <strong>💡 Concepto de pago:</strong> Al realizar el depósito o transferencia, por favor indica en el concepto o descripción tu <strong>Código de Boleto</strong> (se te dará al finalizar este registro) acompañado de tu nombre para asociarlo más rápido.
        <span style={{ display: 'block', marginTop: '0.25rem', fontFamily: 'monospace', color: 'white' }}>Estructura: [Código de Boleto] - [Tu Nombre]</span>
      </div>

      <div className="merch-accounts-container">
        <div className="merch-account-item">
          <div className="merch-bank-info">
            <span className="merch-bank-name banreservas">Banreservas</span>
            <span className="merch-account-type">Ahorro RD$</span>
          </div>
          <div className="merch-account-number-row">
            <code>9607274318</code>
            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopy('9607274318', 'banreservas')}
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
            <code>836288449</code>
            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopy('836288449', 'popular_rd')}
              title="Copiar cuenta"
            >
              {copiedText === 'popular_rd' ? <Check size={12} className="copied" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      <div className="merch-beneficiary-info">
        <div style={{ marginBottom: '0.4rem' }}><strong>Banreservas:</strong> Joelmary Hernandez &nbsp;·&nbsp; <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>Cédula: 402-3603056-1</span></div>
        <div><strong>Popular:</strong> David J. Chez &nbsp;·&nbsp; <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>Cédula: 402-0037969-7</span></div>
      </div>

      <a 
        href="https://wa.me/18096299236"
        target="_blank"
        rel="noopener noreferrer"
        className="merch-payment-footer-note wa-link"
      >
        <Phone size={14} style={{ color: 'var(--accent-light)' }} />
        <span>Envía el comprobante por WhatsApp al <strong>(809) 629-9236</strong> (Haz clic para chatear).</span>
      </a>
    </div>
  );
};

const Registration = () => {
  // Listen to hash changes for real-time image updates during local testing
  const [, setHashTrigger] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setHashTrigger(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Selected Event State ('conferencia' | 'vigilia')
  const [selectedEvent, setSelectedEvent] = useState('conferencia');

  // Read URL query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    if (eventParam === 'vigilia') {
      setSelectedEvent('vigilia');
    } else {
      setSelectedEvent('conferencia');
    }
  }, []);

  // Carousel images
  const posterImages = [getImageUrl('/sin-filtro-poster.jpeg'), getImageUrl('/sin-filtros-theme.jpeg')];
  const [activePosterIndex, setActivePosterIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePosterIndex((prevIndex) => (prevIndex + 1) % posterImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [posterImages.length]);

  useEffect(() => {
    if (selectedEvent === 'vigilia') {
      document.body.classList.add('vigilia-mode');
    } else {
      document.body.classList.remove('vigilia-mode');
    }
    return () => {
      document.body.classList.remove('vigilia-mode');
    };
  }, [selectedEvent]);

  const [regTshirtView, setRegTshirtView] = useState('front');
  const [regCapView, setRegCapView] = useState('front');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    church: '',
    isGuest: false,
    ageGroup: '18-25',
    interestedInMerch: false,
    merchSelections: {
      1: { selected: false, color: 'Negro', size: 'Única', quantity: 1 },
      2: { selected: false, color: 'Negro', size: 'M', quantity: 1 }
    }
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

  // Change document title for printing/PDF generation
  useEffect(() => {
    if (isRegistered && ticketCode) {
      const originalTitle = document.title;
      const eventTitle = selectedEvent === 'vigilia' ? 'RESET Media Vigilia' : 'Sin Filtros 2026';
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
    if (event === 'vigilia') {
      setFormData(prev => ({ ...prev, interestedInMerch: false }));
    }
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
    const generatedCode = selectedEvent === 'vigilia' ? `121-RESET-${randomCode}` : `121-ICC-${randomCode}`;
    const sheetUrl = import.meta.env.VITE_SHEETS_API_URL;

    // Calcular merch seleccionada (solo si es conferencia)
    const selectedItems = [];
    const selectedImageUrls = [];
    let merchTotal = 0;
    if (selectedEvent === 'conferencia' && formData.interestedInMerch) {
      PRODUCTS.forEach(p => {
        const sel = formData.merchSelections[p.id];
        if (sel.selected) {
          selectedItems.push(`${sel.quantity}x ${p.name} - ${sel.color} (Talla: ${sel.size})`);
          merchTotal += p.price * sel.quantity;
          
          const imgPath = p.type === 'tshirt'
            ? p.images[sel.color]?.front
            : p.images['Negro']?.front;
          selectedImageUrls.push(encodeURI(decodeURI(getImageUrl(imgPath))));
        }
      });
    }
    const merchItems = selectedItems.join(', ') || 'Ninguno';
    const merchImageUrls = selectedImageUrls.join(',') || '';

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
          church: formData.church || 'Iglesia de Convertidos a Cristo',
          ageGroup: formData.ageGroup,
          ticketCode: generatedCode,
          interestedInMerch: (selectedEvent === 'conferencia' && formData.interestedInMerch) ? 'Sí' : 'No',
          merchItems,
          merchTotal,
          merchImageUrls,
          event: selectedEvent === 'vigilia' ? 'Media Vigilia RESET' : 'Conferencia Sin Filtros',
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
      ageGroup: '18-25',
      interestedInMerch: false,
      merchSelections: {
        1: { selected: false, color: 'Negro', size: 'Única', quantity: 1 },
        2: { selected: false, color: 'Negro', size: 'M', quantity: 1 }
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

        {!isRegistered && (
          <div className="registration-selector-container animate-fade-in">
            <h2 className="registration-select-title">Elige el evento para registrarte</h2>
            <div className="registration-event-tabs centered">
              <button
                type="button"
                className={`reg-tab-btn ${selectedEvent === 'vigilia' ? 'active' : ''}`}
                onClick={() => handleEventChange('vigilia')}
              >
                Media Vigilia RESET
              </button>
              <button
                type="button"
                className={`reg-tab-btn ${selectedEvent === 'conferencia' ? 'active' : ''}`}
                onClick={() => handleEventChange('conferencia')}
              >
                Conferencia Sin Filtros
              </button>
            </div>
          </div>
        )}

        {!isRegistered ? (
          <div className="registration-layout">

            {/* Info Column */}
            <div className="registration-info animate-fade-in" key={selectedEvent}>
              {selectedEvent === 'conferencia' ? (
                <>
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
                </>
              ) : (
                <>
                  <span className="subtitle">
                    <Star size={16} style={{ color: 'var(--accent-blue)', marginRight: '5px', verticalAlign: 'middle' }} />
                    Pre-Conferencia 2026
                  </span>
                  <h1 className="title">Prepárate en <span className="text-gradient" style={{ background: 'linear-gradient(90deg, #fddfd6 0%, #FF3800 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RESET</span></h1>
                  <p className="description">
                    Acompáñanos el <strong>22 de Agosto a las 06:00 PM</strong> en nuestra <strong>Media Vigilia "RESET"</strong>. Un tiempo enfocado en la oración unida, intercesión y preparación de nuestros corazones para la conferencia.
                  </p>

                  <div className="ticket-perks">
                    <div className="perk-item">
                      <div className="perk-icon" style={{ background: 'rgba(255, 56, 0, 0.1)', color: 'var(--accent-blue)' }}><Ticket size={24} /></div>
                      <div>
                        <h3>Oración & Clamor</h3>
                        <p>Clamaremos juntos por el impacto de la Palabra de Dios en nuestra generación.</p>
                      </div>
                    </div>

                    <div className="perk-item">
                      <div className="perk-icon" style={{ background: 'rgba(255, 56, 0, 0.1)', color: 'var(--accent-blue)' }}><Star size={24} /></div>
                      <div>
                        <h3>Preparación Espiritual</h3>
                        <p>Un espacio de consagración previo al gran día de la conferencia.</p>
                      </div>
                    </div>

                    <div className="perk-item">
                      <div className="perk-icon" style={{ background: 'rgba(255, 56, 0, 0.1)', color: 'var(--accent-blue)' }}><Star size={24} /></div>
                      <div>
                        <h3>Experiencia Organizada</h3>
                        <p>Es necesario registrarse previamente para poder brindarte una experiencia más cómoda y coordinada.</p>
                      </div>
                    </div>
                  </div>

                  <div className="free-pass-badge" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                    <span className="badge-title">Tipo de Entrada</span>
                    <span className="badge-price">GRATIS</span>
                    <span className="badge-note">* Registro requerido para control de capacidad en el templo.</span>
                  </div>

                  {/* Portada premium para RESET */}
                  <div className="registration-poster-wrapper glass-panel">
                    <img 
                      src={getImageUrl('/media-vigilia-reset.jpeg')} 
                      alt="Afiche Media Vigilia RESET" 
                      className="featured-card-poster"
                    />
                  </div>
                </>
              )}
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
                      ¡Nos alegra muchísimo que nos acompañes! Agradecemos profundamente tu registro y tu asistencia a la conferencia. Creemos que Dios tiene un propósito especial para ti en este día.
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

                {/* Pregunta sobre Mercancía con diseño premium (Solo Conferencia) */}
                {selectedEvent === 'conferencia' && (
                  <div className="merch-notice-closed glass-panel" style={{ margin: '1.5rem 0', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: '700', fontSize: '0.9rem' }}>
                      <AlertTriangle size={16} />
                      <span>Reservación de Mercancía Finalizada</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                      La fecha límite para reservar mercancía oficial ha concluido. Recuerda que estos artículos solo estuvieron disponibles bajo la modalidad de reservación previa.
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #aaa)', fontWeight: '600', marginTop: '0.25rem' }}>Síguenos en Instagram, donde comunicaremos cualquier novedad:</span>
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                      <a href="https://www.instagram.com/jovenes_icc/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>@jovenes_icc</a>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                      <a href="https://www.instagram.com/onetwentyoneicc/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>@onetwentyoneicc</a>
                    </div>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Completar Registro Gratis'}
                </button>
              </form>
            </div>

          </div>
        ) : null}

      </div>

      {/* SUCCESS SCREEN - Portal */}
      {isRegistered && createPortal(
          <div className={`ticket-success-container ${selectedEvent === 'vigilia' ? 'vigilia-theme' : ''}`} onClick={handleOutsideClick}>
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
              <CheckCircle size={64} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem auto' }} />
              <h2>¡Registro Exitoso!</h2>
              <p>Tu boleto de entrada gratuito ha sido generado. Por favor, tómale una captura o imprímelo para presentarlo en la entrada. <strong>Te hemos enviado tu ticket por correo</strong> con toda la información del evento{formData.interestedInMerch ? ' y las instrucciones de pago de tu mercancía reservada' : ''} (si no lo recibes, revisa la carpeta de Spam).</p>
            </div>

            {/* Virtual Ticket Card */}
            <div className={`ticket-card animate-fade-in ${selectedEvent === 'vigilia' ? 'ticket-reset' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="ticket-top">
                <div className="ticket-header">
                  <div className="ticket-event-info">
                    <span className="ticket-event-label">{selectedEvent === 'vigilia' ? 'Boleto Media Vigilia' : 'Boleto de Entrada'}</span>
                    <span className="ticket-event-name text-gradient">
                      {selectedEvent === 'vigilia' ? 'RESET' : 'SIN FILTROS 2026'}
                    </span>
                    <span className="ticket-event-subtitle">
                      {selectedEvent === 'vigilia' ? 'Pre-Conferencia Jóvenes ICC' : 'Conferencia de Jóvenes ICC'}
                    </span>
                  </div>
                  <div className="ticket-logo">
                    <span className="t-logo-text">Jóvenes</span>
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
                    <span className="ticket-info-value" style={{ fontFamily: 'monospace', letterSpacing: '1px', color: selectedEvent === 'vigilia' ? '#FF3800' : 'var(--accent-light)' }}>
                      {ticketCode}
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Fecha del Evento</span>
                    <span className="ticket-info-value">
                      {selectedEvent === 'vigilia' ? 'Sábado 22 Agosto, 2026' : 'Sábado 29 Agosto, 2026'}
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Hora de Apertura</span>
                    <span className="ticket-info-value">
                      {selectedEvent === 'vigilia' ? '06:00 PM' : '03:00 PM'}
                    </span>
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
                {selectedEvent === 'conferencia' && formData.interestedInMerch && (() => {
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
                        <span>Mercancía Reservada (Pago del 100% Requerido)</span>
                      </div>
                      
                      <div className="ticket-merch-items-list" style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem' }}>
                        {PRODUCTS.map(p => {
                          const sel = formData.merchSelections[p.id];
                          if (!sel || !sel.selected) return null;
                          
                          const imgPath = p.type === 'tshirt'
                            ? p.images[sel.color]?.front
                            : p.images['Negro']?.front;
                          
                          return (
                            <div key={p.id} className="ticket-merch-item-card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#090909', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                                <img 
                                  src={getImageUrl(imgPath)} 
                                  alt={p.name} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'left' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  Color: <strong style={{ color: 'var(--text-primary)' }}>{sel.color}</strong> {sel.size !== 'Única' && <>| Talla: <strong style={{ color: 'var(--text-primary)' }}>{sel.size}</strong></>}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-light)' }}>
                                  Cant: <strong>{sel.quantity}</strong> &bull; RD$ {(p.price * sel.quantity).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="ticket-merch-total-row">
                        <span>Pago requerido (100%):</span>
                        <strong>RD$ {merchTotal.toLocaleString()}</strong>
                      </div>
                      <div className="ticket-merch-note" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.6rem', lineHeight: '1.4' }}>
                        <div style={{ marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                          <strong>📌 Confirmación de Reserva (Pago 100%):</strong>
                        </div>
                        <div>1. Realiza el depósito/transferencia del 100% a cualquiera de las cuentas indicadas.</div>
                        <div style={{ margin: '0.2rem 0' }}>
                          2. En el concepto de tu banco, indica la siguiente estructura para asociarlo fácilmente:
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.5rem', borderRadius: '4px', margin: '0.25rem 0', fontFamily: 'monospace', color: 'white', display: 'block', width: 'fit-content' }}>
                            {ticketCode} - {formData.firstName} {formData.lastName}
                          </div>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', padding: '0.5rem 0.7rem', marginBottom: '0.5rem', color: '#f87171', fontWeight: '600', fontSize: '0.78rem', lineHeight: '1.4' }}>
                          ⚠️ Fecha límite de pago: <strong style={{ color: '#fca5a5' }}>09 de agosto de 2026</strong>. Por favor, completa tu pago a tiempo. Pasada esta fecha, las reservas no pagadas se cancelarán automáticamente y no podremos garantizar la disponibilidad de tus artículos.
                        </div>

                        <div style={{ color: '#fbd590', marginBottom: '0.4rem' }}>
                          * Una vez recibido el pago, estaremos contactando cuando esté listo y disponible para retirar en la iglesia.
                        </div>

                        <a 
                          href={`https://wa.me/18096299236?text=${encodeURIComponent(
                            `*COMPROBANTE DE PAGO - REGISTRO CONFERENCIA*\n\n*Asistente:* ${formData.firstName} ${formData.lastName}\n*Código de Boleto:* ${ticketCode}\n\nAdjunto el comprobante del depósito del 100% para confirmar mi mercancía.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="merch-payment-footer-note wa-link"
                          style={{ textDecoration: 'none', display: 'flex', marginTop: '0.6rem', padding: '0.6rem 0.8rem' }}
                        >
                          <Phone size={14} style={{ color: 'var(--accent-light)' }} />
                          <span>Envía el comprobante por WhatsApp al <strong>(809) 629-9236</strong> (Haz clic para chatear).</span>
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
