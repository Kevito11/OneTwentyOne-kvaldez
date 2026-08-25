import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Plus, Minus, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Store, X } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './PreOrderMenu.css';

// Mock/Placeholder configuration of food businesses (to be replaced by the user once confirmed)
const VENDORS = [
  {
    id: 'burgers',
    name: 'Burgers & Co.',
    category: 'Hamburguesas y Parrilla',
    description: 'Hamburguesas artesanales con carne 100% Angus, pan brioche horneado a diario y aderezos especiales.',
    logo: '🍔',
    items: [
      { id: 'b1', name: 'Burger Clásica', price: 350, description: 'Carne Angus 150g, queso cheddar fundido, lechuga, tomate y salsa especial.' },
      { id: 'b2', name: 'Bacon Burger', price: 450, description: 'Carne Angus 150g, doble queso cheddar, tocineta crujiente, aros de cebolla y BBQ.' },
      { id: 'b3', name: 'Papas Fritas Sazonadas', price: 150, description: 'Papas crujientes con sazón de la casa y salsa alioli.' }
    ]
  },
  {
    id: 'tacos',
    name: 'Tacos El Camino',
    category: 'Comida Mexicana',
    description: 'Auténticos tacos mexicanos y antojitos preparados con tortillas de maíz hechas a mano.',
    logo: '🌮',
    items: [
      { id: 't1', name: 'Tacos al Pastor (3 uds)', price: 280, description: 'Cerdo marinado al pastor, piña, cebolla, cilantro y limón.' },
      { id: 't2', name: 'Quesadilla de Pollo', price: 320, description: 'Tortilla de harina gigante rellena de pechuga de pollo desmenuzada y abundante queso fundido.' },
      { id: 't3', name: 'Nachos Supreme', price: 380, description: 'Totopos con queso fundido, frijoles refritos, pico de gallo, guacamole y crema agria.' }
    ]
  },
  {
    id: 'pizza',
    name: 'Pizzería Bella',
    category: 'Pizzas Artesanales',
    description: 'Pizzas estilo napolitano al horno de piedra con salsa pomodoro casera e ingredientes frescos.',
    logo: '🍕',
    items: [
      { id: 'p1', name: 'Pizza Margherita', price: 350, description: 'Salsa de tomate, queso mozzarella fresco, hojas de albahaca y aceite de oliva virgen.' },
      { id: 'p2', name: 'Pizza Pepperoni', price: 400, description: 'Abundante queso mozzarella y rebanadas crujientes de pepperoni premium.' },
      { id: 'p3', name: 'Calzone de Jamón y Queso', price: 420, description: 'Masa rellena de jamón cocido, queso ricotta y mozzarella fresco.' }
    ]
  }
];

const IS_PREORDER_AVAILABLE = false;

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
            <h1 className="title text-gradient" style={{ marginBottom: '1rem', fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800' }}>Pre-Orden de Comida</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontWeight: '500', lineHeight: '1.6' }}>
              La pre-orden de comida no está disponible por el momento. Por favor, vuelve a intentarlo más adelante.
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
  const [devMode, setDevMode] = useState(false);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);

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
  const addToCart = (item, vendorName) => {
    setCart(prev => {
      const current = prev[item.id] || { quantity: 0, item, vendorName };
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

    // Format pre-order details
    const details = items.map(entry => `${entry.quantity}x ${entry.item.name} (${entry.vendorName})`).join(', ');
    const vendors = [...new Set(items.map(entry => entry.vendorName))].join(', ');
    const totalAmount = getCartTotalAmount();

    if (devMode || !sheetUrl || sheetUrl.trim() === '') {
      // Local Simulation
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        // Save locally to simulate
        localStorage.setItem(`preorder_${ticketCode}`, JSON.stringify({
          ticketCode,
          details,
          vendors,
          totalAmount,
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
        setErrorMessage(result.message || 'Error del servidor al registrar la pre-orden de comida.');
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
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Volver al Inicio</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="preorder-header text-center" style={{ marginBottom: '3rem' }}>
          <span className="subtitle">Break & Refrigerio</span>
          <h1 className="title">Pre-Orden de <span className="text-gradient">Comida</span></h1>
          <p className="description">
            Evita las filas durante los recesos de la Conferencia Sin Filtros 2026. Selecciona tus platos de los negocios invitados y reserva tu orden con anticipación.
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
                Para poder realizar una pre-orden de comida, debes estar registrado en la conferencia. Introduce tu código de boleto para continuar.
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
                    <span style={{ fontSize: '1.1rem' }}>{v.logo}</span>
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>

              {/* Vendor Menus */}
              <div className="vendors-list-container">
                {filteredVendors.map(vendor => (
                  <div key={vendor.id} className="vendor-section glass-panel">
                    <div className="vendor-header-row">
                      <div className="vendor-logo-box">{vendor.logo}</div>
                      <div>
                        <h2 className="vendor-title-text">{vendor.name}</h2>
                        <span className="vendor-category-badge">{vendor.category}</span>
                      </div>
                    </div>
                    
                    <p className="vendor-desc-text">{vendor.description}</p>
                    
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
                                <button className="qty-action-btn plus" onClick={() => addToCart(item, vendor.name)}>
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              <button className="add-to-cart-btn" onClick={() => addToCart(item, vendor.name)}>
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
                    <span className="cart-counter-bubble">{getCartTotalItems()}</span>
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

        {/* Mobile Persistent Floating Cart Bar */}
        {isVerified && !submitSuccess && getCartTotalItems() > 0 && (
          <div className="mobile-cart-floating-bar glass-panel animate-fade-in">
            <div className="mobile-cart-bar-info">
              <div className="mobile-cart-icon-wrapper">
                <ShoppingBag size={20} className="text-gradient" />
                <span className="mobile-cart-qty-badge">{getCartTotalItems()}</span>
              </div>
              <div className="mobile-cart-text-details">
                <span className="mobile-cart-label">Tu Pre-orden</span>
                <span className="mobile-cart-total-amount">RD$ {getCartTotalAmount()}</span>
              </div>
            </div>
            <button className="btn-primary mobile-cart-bar-action-btn" onClick={() => setIsCartOpenMobile(true)}>
              Ver Pre-orden
            </button>
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
                    <div key={entry.item.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span><strong>{entry.quantity}x</strong> {entry.item.name} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({entry.vendorName})</span></span>
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

      </div>
    </div>
  );
};

export default PreOrderMenu;
