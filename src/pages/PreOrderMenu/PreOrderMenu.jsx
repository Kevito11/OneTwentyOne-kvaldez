import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Plus, Minus, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Store, X, ExternalLink, Image } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './PreOrderMenu.css';

// Mock/Placeholder configuration of food businesses (to be replaced by the user once confirmed)
const VENDORS = [
  {
    id: 'pechurica',
    name: 'Pechurica La Fe',
    category: 'Pechuritas y Más',
    description: 'Pechuricas crujientes acompañadas de papas fritas y salsas especiales.',
    logo: '/pechurica-logo.png',
    items: [
      { id: 'p1', name: 'Combo 4 Pechuricas', price: 315, description: '4 Pechuricas + Papas + salsa + Refresco 12 Oz.' },
      { id: 'p2', name: 'Combo 7 Pechuricas', price: 485, description: '7 Pechuricas + Papas + salsa + Refresco 12 Oz.' },
      { id: 'p3', name: 'Combo 8 Pechuricas', price: 545, description: '8 Pechuricas + Papas + salsa + Refresco 12 Oz.' },
      { id: 'p4', name: 'Bollito de Yuca', price: 50, description: 'Bollito de yuca frito.' },
      { id: 'p5', name: 'Agua', price: 25, description: 'Agua embotellada.' }
    ],
    instagram: 'https://www.instagram.com/pechuricalaferd/',
    paymentMethods: 'Efectivo y Tarjeta',
    menuFlyer: '/pechurica-la-fe.jpeg'
  },
  {
    id: 'marite',
    name: 'Marité Postres Artesanales',
    category: 'Helados Artesanales',
    description: 'Helados artesanales con calidad que encanta.',
    instagram: 'https://www.instagram.com/maritepostresartesanales/',
    logo: '/marite-logo.png',
    items: [
      { id: 'm1', name: 'Helado de Coco', price: 125, description: 'Helado artesanal de coco cremosa.' },
      { id: 'm2', name: 'Helado de Coco Fresa', price: 125, description: 'Helado artesanal de coco con toques de fresa.' },
      { id: 'm3', name: 'Helado de Chinola Cremosa', price: 125, description: 'Helado artesanal super cremoso de chinola.' },
      { id: 'm4', name: 'Helado de Dulce de Leche', price: 125, description: 'Helado artesanal sabor dulce de leche.' },
      { id: 'm5', name: 'Helado de Bizcocho Marmolado', price: 125, description: 'Helado artesanal sabor bizcocho marmolado.' }
    ],
    paymentMethods: 'Efectivo y Transferencia',
    menuFlyer: '/marite-menu.jpeg'
  }
];

const IS_PREORDER_AVAILABLE = true;

const PreOrderMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sheetUrl = import.meta.env.VITE_SHEETS_API_URL || '';

  if (!IS_PREORDER_AVAILABLE) {
    return (
      <div className="preorder-page animate-fade-in section-padding">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', marginTop: '4rem' }}>
          <div className="glass-panel" style={{ padding: '4rem 2rem', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.15)', background: 'rgba(10, 10, 10, 0.5)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🍔</div>
            <h1 className="title text-gradient" style={{ marginBottom: '1rem', fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800' }}>Menú & Precios</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontWeight: '500', lineHeight: '1.6' }}>
              La consulta de menú no está disponible por el momento. Por favor, vuelve a intentarlo más adelante.
            </p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 2rem', textDecoration: 'none', alignSelf: 'center' }}>
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State Variables
  const [ticketCode, setTicketCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const [userData, setUserData] = useState(null);
  const [cart, setCart] = useState({});
  const [activeVendor, setActiveVendor] = useState('all');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFlyer, setSelectedFlyer] = useState(null);
  const [devMode, setDevMode] = useState(false);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [cartPosition, setCartPosition] = useState({ x: -1, y: -1 });
  const [hasDragged, setHasDragged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(false);
    
    // Get actual current position relative to screen on first touch
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;
    
    setCartPosition({ x: currentX, y: currentY });
    setHasDragged(true);
    
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    elementStart.current = { x: currentX, y: currentY };
  };

  const handleTouchMove = (e) => {
    // Prevent default browser scrolling behavior when dragging the cart balloon
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.x;
    const dy = touch.clientY - dragStart.current.y;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setIsDragging(true);
    }
    
    const newX = Math.max(10, Math.min(window.innerWidth - 75, elementStart.current.x + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 75, elementStart.current.y + dy));
    
    setCartPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) {
      setIsCartOpenMobile(true);
    }
    setIsDragging(false);
    // Prevent simulated mouse clicks after touch actions
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  // Reset balloon position on screen resize (e.g. rotation, responsive simulator toggle)
  useEffect(() => {
    const handleResize = () => {
      setHasDragged(false);
      setCartPosition({ x: -1, y: -1 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Read ticket code from URL query parameter if present on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setSearchCode(codeParam.trim().toUpperCase());
      handleVerify(codeParam.trim().toUpperCase());
    }
  }, [location]);

  // Handle ticket verification against sheets API or simulated database
  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || searchCode).trim().toUpperCase();
    if (!code) {
      setSearchError('Por favor introduce tu código de boleto.');
      return;
    }

    // Regex check for standard format (e.g. 121-ICC-1234)
    const isValidFormat = /^121-ICC-\d{4}$/.test(code);
    if (!isValidFormat) {
      setSearchError('Formato de boleto inválido. Debe ser como: 121-ICC-XXXX');
      return;
    }

    setIsVerifying(true);
    setSearchError('');
    setErrorMessage('');

    if (!sheetUrl || sheetUrl.trim() === '') {
      // Simulation mode
      console.warn("VITE_SHEETS_API_URL no configurada. Simulando verificación en desarrollo.");
      setDevMode(true);
      setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
        setTicketCode(code);
        setUserData({
          firstName: 'Usuario',
          lastName: 'Simulado',
          email: 'usuario.simulado@example.com',
          phone: '(809) 555-0123'
        });
      }, 1200);
      return;
    }

    try {
      const response = await fetch(`${sheetUrl}?code=${encodeURIComponent(code)}`);
      const result = await response.json();

      if (result.status === 'success') {
        // Verify this is a conference ticket
        const eventName = result.event || '';
        const isConf = eventName.toLowerCase().includes('conferencia') || eventName.toLowerCase().includes('filtros');
        
        if (!isConf) {
          setSearchError('Este boleto pertenece a otra actividad (Cena/Campamento). La pre-orden de comida solo está disponible para la Conferencia Sin Filtros 2026.');
          setIsVerifying(false);
          return;
        }

        setIsVerified(true);
        setTicketCode(code);
        setUserData({
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone
        });
      } else {
        setSearchError(result.message || 'Código de boleto no encontrado. Por favor, asegúrate de estar registrado en la conferencia.');
      }
    } catch (err) {
      console.error("Error verifying ticket:", err);
      // Fallback to dev mode simulation if API fails so the user experience is smooth
      setSearchError('Error de conexión con el servidor. Se habilitará el modo de simulación temporal para que puedas probar la pre-orden.');
      setDevMode(true);
      setTimeout(() => {
        setIsVerified(true);
        setTicketCode(code);
        setUserData({
          firstName: 'Asistente',
          lastName: 'Invitado',
          email: 'contacto@example.com',
          phone: '(809) 000-0000'
        });
        setSearchError('');
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  // Cart operations
  const addToCart = (item, vendor) => {
    setCart(prev => {
      const current = prev[item.id] || { quantity: 0, item, vendorId: vendor.id, vendorName: vendor.name };
      return {
        ...prev,
        [item.id]: {
          ...current,
          quantity: current.quantity + 1
        }
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const current = prev[itemId];
      if (!current) return prev;
      
      const newCart = { ...prev };
      if (current.quantity <= 1) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = {
          ...current,
          quantity: current.quantity - 1
        };
      }
      return newCart;
    });
  };

  // Get current item quantity from cart
  const getItemQty = (itemId) => {
    return cart[itemId]?.quantity || 0;
  };

  // Calculate totals
  const getCartTotalItems = () => {
    return Object.values(cart).reduce((total, entry) => total + entry.quantity, 0);
  };

  const getCartTotalAmount = () => {
    return Object.values(cart).reduce((total, entry) => total + (entry.item.price * entry.quantity), 0);
  };

  // Handle preorder submission
  const handleSubmitPreOrder = async () => {
    const items = Object.values(cart);
    if (items.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');

    // Build per-vendor breakdowns
    const byVendor = {};
    items.forEach(entry => {
      const vid = entry.vendorId;
      if (!byVendor[vid]) {
        byVendor[vid] = { vendorName: entry.vendorName, items: [], subtotal: 0 };
      }
      byVendor[vid].items.push(`${entry.quantity}x ${entry.item.name} (RD$${entry.item.price * entry.quantity})`);
      byVendor[vid].subtotal += entry.item.price * entry.quantity;
    });

    const vendorBreakdowns = Object.values(byVendor).map(v => ({
      vendorName: v.vendorName,
      details: v.items.join(', '),
      subtotal: v.subtotal
    }));

    const vendors = vendorBreakdowns.map(v => v.vendorName).join(', ');
    const totalAmount = getCartTotalAmount();
    // Combined summary for legacy field
    const details = vendorBreakdowns.map(v => `[${v.vendorName}]: ${v.details}`).join(' | ');

    if (devMode || !sheetUrl || sheetUrl.trim() === '') {
      // Local Simulation
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        localStorage.setItem(`preorder_${ticketCode}`, JSON.stringify({
          ticketCode,
          details,
          vendors,
          totalAmount,
          vendorBreakdowns,
          date: new Date().toLocaleDateString()
        }));
        setIsCartOpenMobile(false);
      }, 1500);
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
          action: 'preorderFood',
          ticketCode: ticketCode,
          preorderDetails: details,
          selectedVendors: vendors,
          totalEstimated: totalAmount,
          vendorBreakdowns: vendorBreakdowns,
          activeTheme: document.body.classList.contains('orange-theme') 
            ? 'orange' 
            : (document.body.classList.contains('yellow-theme') ? 'yellow' : 'classic')
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        setSubmitSuccess(true);
        setIsCartOpenMobile(false);
      } else {
        setErrorMessage(result.message || 'Error del servidor al registrar la orden.');
      }
    } catch (err) {
      console.error("Error submitting pre-order:", err);
      setErrorMessage('Hubo un problema al conectar con el servidor. Por favor, verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset/Change code
  const handleResetVerification = () => {
    setIsVerified(false);
    setUserData(null);
    setTicketCode('');
    setCart({});
    setSearchCode('');
    setSearchError('');
    setErrorMessage('');
    setSubmitSuccess(false);
  };

  // Filtered menu items based on selected tab/vendor
  const filteredVendors = activeVendor === 'all' 
    ? VENDORS 
    : VENDORS.filter(v => v.id === activeVendor);

  return (
    <div className="preorder-page animate-fade-in section-padding">
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Back Link */}
        <div className="back-link-wrapper">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Volver al Inicio</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="preorder-header text-center" style={{ marginBottom: '3rem' }}>
          <span className="subtitle">Break & Refrigerio</span>
          <h1 className="title">Conoce el <span className="text-gradient">Menú y Precios</span></h1>
          <p className="description">
            Descubre la oferta de los negocios invitados en los recesos de la Conferencia Sin Filtros 2026. Reserva lo que desees con anticipación y evita filas.
          </p>
        </div>

        {/* Development simulation badge */}
        {devMode && isVerified && (
          <div className="dev-mode-badge-box">
            <AlertCircle size={16} />
            <span>Modo de simulación (desarrollo): Las pre-ordenes se guardarán de forma local.</span>
          </div>
        )}

        {/* PHASE 1: Ticket Verification */}
        {!isVerified && (
          <div className="verification-card-wrapper">
            <div className="glass-panel verification-card">
              <h2 className="section-title">Busca tu Boleto</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.8rem', lineHeight: '1.5' }}>
                Para ver el menú y apartar tu orden, debes estar registrado en la conferencia. Introduce tu código de boleto para continuar.
              </p>
              
              <div className="search-input-group">
                <input 
                  type="text" 
                  placeholder="Ej: 121-ICC-4839" 
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  disabled={isVerifying}
                  className="search-field"
                />
                <button 
                  className="btn-primary search-action-btn"
                  onClick={() => handleVerify()}
                  disabled={isVerifying}
                >
                  {isVerifying ? <RefreshCw className="spinner" size={18} /> : <Search size={18} />}
                  <span>{isVerifying ? 'Verificando...' : 'Verificar'}</span>
                </button>
              </div>

              {searchError && (
                <div className="error-alert">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="register-redirect-notice" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>¿Aún no te has registrado en la conferencia?</span>
                <br />
                <Link to="/registro" className="register-text-link" style={{ display: 'inline-block', marginTop: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                  Registrarse Gratis Ahora
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: Selection & Menu & Cart */}
        {isVerified && !submitSuccess && (
          <div className="menu-cart-layout">
            
            {/* Left side: Menu items */}
            <div className="menu-side-container">
              
              {/* User Identity Banner */}
              <div className="user-identity-card glass-panel">
                <div className="user-badge-wrap">
                  <div className="user-icon-circle">👤</div>
                  <div>
                    <h3 className="user-name-text">{userData.firstName} {userData.lastName}</h3>
                    <span className="user-ticket-code">Boleto: <strong>{ticketCode}</strong></span>
                  </div>
                </div>
                <button className="change-user-btn" onClick={handleResetVerification}>
                  Cambiar Boleto
                </button>
              </div>

              {/* Vendor Selector Tabs */}
              <div className="vendor-tabs-bar">
                <button 
                  className={`vendor-tab-btn ${activeVendor === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveVendor('all')}
                >
                  <Store size={14} />
                  <span>Todos</span>
                </button>
                {VENDORS.map(v => (
                  <button 
                    key={v.id}
                    className={`vendor-tab-btn ${activeVendor === v.id ? 'active' : ''}`}
                    onClick={() => setActiveVendor(v.id)}
                  >
                    <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px' }}>
                      {v.logo && (v.logo.startsWith('/') || v.logo.startsWith('http')) ? (
                        <img 
                          src={getImageUrl(v.logo)} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} 
                        />
                      ) : (
                        v.logo
                      )}
                    </span>
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>

              {/* Vendor Menus */}
              <div className="vendors-list-container">
                {filteredVendors.map(vendor => (
                  <div key={vendor.id} className="vendor-section glass-panel">
                    <div className="vendor-header-row">
                      <div className="vendor-logo-box" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                        {vendor.logo && (vendor.logo.startsWith('/') || vendor.logo.startsWith('http')) ? (
                          <img 
                            src={getImageUrl(vendor.logo)} 
                            alt={vendor.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          vendor.logo
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h2 className="vendor-title-text" style={{ margin: 0 }}>{vendor.name}</h2>
                          {vendor.instagram && (
                            <a 
                              href={vendor.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '0.8rem', 
                                color: 'var(--accent-color)', 
                                textDecoration: 'none',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <span>Instagram</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                          <span className="vendor-category-badge" style={{ margin: 0 }}>{vendor.category}</span>
                          {vendor.menuFlyer && (
                            <button
                              onClick={() => setSelectedFlyer(vendor.menuFlyer)}
                              className="vendor-flyer-btn"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                color: 'white',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(245, 124, 0, 0.12)',
                                border: '1px solid rgba(245, 124, 0, 0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                height: '22px'
                              }}
                            >
                              <Image size={11} />
                              <span>Ver Menú (Foto)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="vendor-desc-text">{vendor.description}</p>
                    
                    {vendor.id === 'pechurica' && (
                      <div style={{
                        background: 'rgba(245, 124, 0, 0.08)',
                        border: '1px solid rgba(245, 124, 0, 0.25)',
                        color: 'var(--accent-light, #ffffff)',
                        padding: '0.8rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        marginBottom: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        lineHeight: '1.4'
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>💳</span>
                        <span>
                          <strong>Nota de Pago:</strong> Para Pechurica La Fe, se aceptarán pagos en <strong>Efectivo</strong> y <strong>Tarjeta de crédito/débito</strong> directamente en el stand al retirar.
                        </span>
                      </div>
                    )}

                    {vendor.id === 'marite' && (
                      <div style={{
                        background: 'rgba(245, 124, 0, 0.08)',
                        border: '1px solid rgba(245, 124, 0, 0.25)',
                        color: 'var(--accent-light, #ffffff)',
                        padding: '0.8rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        marginBottom: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        lineHeight: '1.4'
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>💵</span>
                        <span>
                          <strong>Nota de Pago:</strong> Para los helados de Marité, solo se aceptarán pagos en <strong>Efectivo</strong> y <strong>Transferencia bancaria</strong> directamente en el stand al retirar.
                        </span>
                      </div>
                    )}
                    
                    <div className="dishes-grid">
                      {vendor.items.map(item => (
                        <div key={item.id} className="dish-card">
                          <div className="dish-info">
                            <h4 className="dish-name">{item.name}</h4>
                            <p className="dish-desc">{item.description}</p>
                            <span className="dish-price">RD$ {item.price}</span>
                          </div>
                          
                          <div className="dish-action-area">
                            {getItemQty(item.id) > 0 ? (
                              <div className="quantity-controls-wrap window-glow">
                                <button className="qty-action-btn minus" onClick={() => removeFromCart(item.id)}>
                                  <Minus size={14} />
                                </button>
                                <span className="qty-value-display">{getItemQty(item.id)}</span>
                                <button className="qty-action-btn plus" onClick={() => addToCart(item, vendor)}>
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              <button className="add-to-cart-btn" onClick={() => addToCart(item, vendor)}>
                                <Plus size={16} />
                                <span>Agregar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Shopping Cart side panel (hidden on mobile via CSS) */}
            <div className="cart-side-container desktop-only-cart">
              <div className="cart-sticky-box glass-panel">
                <div className="cart-header-row">
                  <ShoppingBag size={20} className="text-gradient" />
                  <h3 className="cart-title-text">Tu Pre-orden</h3>
                  {getCartTotalItems() > 0 && (
                    <span key={getCartTotalItems()} className="cart-counter-bubble animate-pop">{getCartTotalItems()}</span>
                  )}
                </div>

                {getCartTotalItems() === 0 ? (
                  <div className="empty-cart-state">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🍔</div>
                    <h4>Pre-orden vacía</h4>
                    <p>Agrega platos o refrigerios del menú para armar tu pre-orden.</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items-scroll-list">
                      {Object.values(cart).map(entry => (
                        <div key={entry.item.id} className="cart-item-row">
                          <div className="cart-item-details">
                            <span className="cart-item-title">{entry.item.name}</span>
                            <span className="cart-item-vendor">{entry.vendorName}</span>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              color: 'var(--text-secondary)', 
                              opacity: 0.8,
                              marginBottom: '0.2rem'
                            }}>
                              Pago: {VENDORS.find(v => v.name === entry.vendorName)?.paymentMethods || 'Efectivo/Transferencia'}
                            </span>
                            <span className="cart-item-subtotal">RD$ {entry.item.price} c/u</span>
                          </div>
                          <div className="cart-item-actions">
                            <div className="quantity-controls-wrap small">
                              <button className="qty-action-btn minus" onClick={() => removeFromCart(entry.item.id)}>
                                <Minus size={12} />
                              </button>
                              <span className="qty-value-display">{entry.quantity}</span>
                              <button className="qty-action-btn plus" onClick={() => addToCart(entry.item, entry.vendorName)}>
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="cart-item-total-price">RD$ {entry.item.price * entry.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-totals-section">
                      <div className="total-row">
                        <span>Total de artículos:</span>
                        <span>{getCartTotalItems()}</span>
                      </div>
                      <div className="total-row grand-total">
                        <span>Total Estimado:</span>
                        <span className="text-gradient">RD$ {getCartTotalAmount()}</span>
                      </div>
                    </div>

                    <div className="cart-submit-section">
                      <p className="preorder-disclosure">
                        ⚠️ <strong>Importante:</strong> Esta pre-orden se realiza con fines de logística para estimar las cantidades que los negocios deben preparar. El pago se realizará <strong>directamente en efectivo o transferencia</strong> en los stands correspondientes durante los Breaks de la conferencia.
                      </p>
                      
                      {errorMessage && (
                        <div className="error-alert" style={{ marginBottom: '1rem' }}>
                          <AlertCircle size={16} style={{ flexShrink: 0 }} />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <button 
                        className="btn-primary cart-submit-btn"
                        onClick={handleSubmitPreOrder}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <RefreshCw className="spinner" size={18} /> : null}
                        <span>{isSubmitting ? 'Confirmando Pre-orden...' : 'Confirmar Pre-orden'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Mobile Draggable Floating Cart Balloon/Badge */}
        {isVerified && !submitSuccess && getCartTotalItems() > 0 && (
          <div 
            className="mobile-cart-floating-balloon"
            style={hasDragged ? {
              left: `${cartPosition.x}px`,
              top: `${cartPosition.y}px`,
            } : undefined}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsCartOpenMobile(true)}
          >
            {/* Cart Icon */}
            <ShoppingBag size={24} key={`icon-${getCartTotalItems()}`} className="animate-pop" />
            
            {/* Qty Badge */}
            <span 
              key={`badge-${getCartTotalItems()}`}
              className="animate-pop"
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '800',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-primary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {getCartTotalItems()}
            </span>
          </div>
        )}

        {/* Mobile Drawer Bottom Sheet Overlay */}
        {isVerified && !submitSuccess && isCartOpenMobile && (
          <div className="mobile-cart-drawer-overlay animate-fade-in" onClick={() => setIsCartOpenMobile(false)}>
            <div className="mobile-cart-drawer-sheet glass-panel" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={20} className="text-gradient" />
                  <h3 className="drawer-title" style={{ fontSize: '1.25rem', fontWeight: '800' }}>Resumen de Pre-orden</h3>
                </div>
                <button className="drawer-close-btn" onClick={() => setIsCartOpenMobile(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="drawer-scroll-content">
                <div className="cart-items-scroll-list">
                  {Object.values(cart).map(entry => (
                    <div key={entry.item.id} className="cart-item-row">
                      <div className="cart-item-details">
                        <span className="cart-item-title">{entry.item.name}</span>
                        <span className="cart-item-vendor">{entry.vendorName}</span>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          color: 'var(--text-secondary)', 
                          opacity: 0.8,
                          marginBottom: '0.2rem'
                        }}>
                          Pago: {VENDORS.find(v => v.name === entry.vendorName)?.paymentMethods || 'Efectivo/Transferencia'}
                        </span>
                        <span className="cart-item-subtotal">RD$ {entry.item.price} c/u</span>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls-wrap small">
                          <button className="qty-action-btn minus" onClick={() => removeFromCart(entry.item.id)}>
                            <Minus size={12} />
                          </button>
                          <span className="qty-value-display">{entry.quantity}</span>
                          <button className="qty-action-btn plus" onClick={() => addToCart(entry.item, entry.vendorName)}>
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="cart-item-total-price">RD$ {entry.item.price * entry.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-totals-section">
                  <div className="total-row">
                    <span>Total de artículos:</span>
                    <span>{getCartTotalItems()}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total Estimado:</span>
                    <span className="text-gradient">RD$ {getCartTotalAmount()}</span>
                  </div>
                </div>

                <div className="cart-submit-section">
                  <p className="preorder-disclosure">
                    ⚠️ <strong>Importante:</strong> Esta pre-orden se realiza con fines de logística para estimar las cantidades que los negocios deben preparar. El pago se realizará <strong>directamente en efectivo o transferencia</strong> en los stands correspondientes durante los Breaks de la conferencia.
                  </p>
                  
                  {errorMessage && (
                    <div className="error-alert" style={{ marginBottom: '1rem' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button 
                    className="btn-primary cart-submit-btn"
                    onClick={handleSubmitPreOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <RefreshCw className="spinner" size={18} /> : null}
                    <span>{isSubmitting ? 'Confirmando Pre-orden...' : 'Confirmar Pre-orden'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: Success Screen */}
        {submitSuccess && (
          <div className="success-preorder-wrapper">
            <div className="glass-panel success-preorder-card text-center">
              <div className="success-icon-badge-box animate-pulse">
                <CheckCircle2 size={64} style={{ color: 'var(--accent-color)' }} />
              </div>
              
              <h2 className="success-title text-gradient">¡Pre-orden Registrada!</h2>
              <p className="success-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
                Tu pre-orden de comida para la conferencia ha sido procesada con éxito bajo tu boleto <strong>{ticketCode}</strong>.
              </p>

              {/* Order Detail Summary Card */}
              <div className="receipt-box glass-panel" style={{ padding: '1.8rem', textAlign: 'left', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)', margin: '0 auto 2.5rem auto', maxWidth: '580px' }}>
                <h4 style={{ fontWeight: '700', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>Resumen de Pre-orden</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
                  {Object.values(cart).map(entry => (
                    <div key={entry.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>
                          <strong>{entry.quantity}x</strong> {entry.item.name} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({entry.vendorName})</span>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', opacity: 0.8, marginTop: '2px' }}>
                          Pago: {VENDORS.find(v => v.name === entry.vendorName)?.paymentMethods || 'Efectivo/Transferencia'}
                        </span>
                      </div>
                      <span style={{ color: 'white' }}>RD$ {entry.item.price * entry.quantity}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <span>Total Estimado a Pagar:</span>
                    <span className="text-gradient">RD$ {getCartTotalAmount()}</span>
                  </div>
                </div>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '550px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '1rem' }}>
                  Hemos enviado una confirmación a tu correo electrónico registrado. Recuerda que no necesitas pagar ahora en la web; pagarás directamente a los negocios invitados al retirar tu comida en los Breaks de la Conferencia Sin Filtros 2026.
                </p>
                <p style={{ fontStyle: 'italic' }}>
                  ¡Gracias por ayudarnos a tener una mejor logística para los Breaks del evento!
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                <Link to="/" className="btn-secondary" style={{ padding: '0.8rem 2rem' }}>
                  Volver al Inicio
                </Link>
                <button className="btn-primary" onClick={handleResetVerification} style={{ padding: '0.8rem 2rem' }}>
                  Hacer Otra Pre-orden
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal for Menu Flyer Images */}
        {selectedFlyer && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
            onClick={() => setSelectedFlyer(null)}
            className="animate-fade-in"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedFlyer(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 10000
              }}
              className="qty-action-btn"
            >
              <X size={24} />
            </button>

            {/* Flyer Image Container */}
            <div 
              style={{
                position: 'relative',
                maxWidth: '90%',
                maxHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={getImageUrl(selectedFlyer)} 
                alt="Menú con Fotos" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreOrderMenu;
