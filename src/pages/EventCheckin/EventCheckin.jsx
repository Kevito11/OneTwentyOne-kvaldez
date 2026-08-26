import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, UserCheck, AlertCircle, RefreshCw, XCircle, ArrowLeft, QrCode, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import './EventCheckin.css';

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

const AGE_GROUPS = [
  "12 a 17 años",
  "18 a 25 años",
  "26 a 35 años",
  "36+ años"
];

const EventCheckin = () => {
  const location = useLocation();
  const sheetUrl = import.meta.env.VITE_SHEETS_API_URL || '';

  // QR-code enforcement state
  const [isQrAccess, setIsQrAccess] = useState(false);

  // View Mode: 'search' | 'register'
  const [viewMode, setViewMode] = useState('search');
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Check-in action states
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedInUser, setCheckedInUser] = useState(null);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [devMode, setDevMode] = useState(false);

  // Express Registration Form State
  const [expressForm, setExpressForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    church: 'Iglesia De Convertidos a Cristo',
    customChurch: '',
    isGuest: false,
    ageGroup: '18 a 25 años'
  });
  const [selectedChurch, setSelectedChurch] = useState('Iglesia De Convertidos a Cristo');
  const [isSubmittingExpress, setIsSubmittingExpress] = useState(false);
  const [expressError, setExpressError] = useState('');

  // Validate QR source on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sourceParam = params.get('source');
    if (sourceParam === 'qr' || params.get('scan') === 'true') {
      setIsQrAccess(true);
    }
  }, [location]);

  // Sync church field
  useEffect(() => {
    if (expressForm.isGuest) {
      setExpressForm(prev => ({ ...prev, church: 'Invitado / No asisto a ninguna' }));
    } else if (selectedChurch === 'Otra') {
      setExpressForm(prev => ({ ...prev, church: expressForm.customChurch || 'Otra' }));
    } else {
      setExpressForm(prev => ({ ...prev, church: selectedChurch }));
    }
  }, [selectedChurch, expressForm.customChurch, expressForm.isGuest]);

  // Handle name/email/code search against Sheets database
  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Por favor introduce un nombre, correo o boleto.');
      return;
    }
    if (query.length < 3) {
      setSearchError('La búsqueda debe tener al menos 3 caracteres.');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setErrorMessage('');
    setSearchResults([]);

    if (!sheetUrl || sheetUrl.trim() === '') {
      // Simulation mode
      console.warn("VITE_SHEETS_API_URL no configurada. Simulando búsqueda en desarrollo.");
      setDevMode(true);
      setTimeout(() => {
        setIsSearching(false);
        setHasSearched(true);
        setSearchResults([
          {
            ticketCode: '121-ICC-0482',
            firstName: 'Carlos',
            lastName: 'Mendoza',
            email: 'ca***@gmail.com',
            checkedIn: 'No'
          },
          {
            ticketCode: '121-ICC-1102',
            firstName: 'Carla',
            lastName: 'Rodríguez',
            email: 'ca***@hotmail.com',
            checkedIn: 'Si'
          }
        ].filter(user => 
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
          user.ticketCode.toLowerCase().includes(query.toLowerCase())
        ));
      }, 1000);
      return;
    }

    try {
      const response = await fetch(`${sheetUrl}?query=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (result.status === 'success') {
        setSearchResults(result.results || []);
        setHasSearched(true);
      } else {
        setSearchError(result.message || 'Error en la búsqueda.');
      }
    } catch (err) {
      console.error('Error searching:', err);
      setSearchError('Error de red al conectar con el servidor.');
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm arrival/check-in for existing user
  const handleCheckinSubmit = async (user) => {
    setIsCheckingIn(true);
    setErrorMessage('');
    setCheckedInUser(user);

    if (devMode || !sheetUrl || sheetUrl.trim() === '') {
      setTimeout(() => {
        setIsCheckingIn(false);
        setCheckinSuccess(true);
        setSearchResults(prev => prev.map(u => 
          u.ticketCode === user.ticketCode ? { ...u, checkedIn: 'Si' } : u
        ));
      }, 1200);
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
          action: 'checkin',
          ticketCode: user.ticketCode
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setCheckinSuccess(true);
        setSearchResults(prev => prev.map(u => 
          u.ticketCode === user.ticketCode ? { ...u, checkedIn: 'Si' } : u
        ));
      } else {
        setErrorMessage(data.message || 'Error al procesar el registro de entrada.');
      }
    } catch (err) {
      console.error('Error during checkin:', err);
      setErrorMessage('Error de red al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handle Express Registration (for un-registered people at the door)
  const handleExpressSubmit = async (e) => {
    e.preventDefault();
    setExpressError('');

    if (!expressForm.firstName.trim() || !expressForm.lastName.trim()) {
      setExpressError('Por favor ingresa tu nombre y apellido.');
      return;
    }
    if (!expressForm.email.trim() || !expressForm.email.includes('@')) {
      setExpressError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!expressForm.phone.trim()) {
      setExpressError('Por favor ingresa tu número de teléfono / WhatsApp.');
      return;
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newTicketCode = `121-ICC-${randomDigits}`;

    setIsSubmittingExpress(true);

    if (devMode || !sheetUrl || sheetUrl.trim() === '') {
      setTimeout(() => {
        setIsSubmittingExpress(false);
        setCheckedInUser({
          firstName: expressForm.firstName,
          lastName: expressForm.lastName,
          email: expressForm.email,
          ticketCode: newTicketCode,
          isNewRegister: true
        });
        setCheckinSuccess(true);
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
          action: 'expressCheckin',
          ticketCode: newTicketCode,
          firstName: expressForm.firstName.trim(),
          lastName: expressForm.lastName.trim(),
          email: expressForm.email.trim(),
          phone: expressForm.phone.trim(),
          church: expressForm.church,
          ageGroup: expressForm.ageGroup
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setCheckedInUser({
          firstName: expressForm.firstName,
          lastName: expressForm.lastName,
          email: expressForm.email,
          ticketCode: data.ticketCode || newTicketCode,
          isNewRegister: true
        });
        setCheckinSuccess(true);
      } else {
        setExpressError(data.message || 'Error al guardar el registro en el servidor.');
      }
    } catch (err) {
      console.error('Error during express registration:', err);
      setExpressError('Error de conexión con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsSubmittingExpress(false);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setCheckinSuccess(false);
    setCheckedInUser(null);
    setSearchError('');
    setErrorMessage('');
    setExpressError('');
    setViewMode('search');
  };

  return (
    <div className="checkin-page section-padding">
      <div className="container" style={{ maxWidth: '650px' }}>
        
        {/* Title Header */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <span className="section-subtitle">Auto-Registro de Entrada</span>
          <h1 className="section-title text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
            Check-In Conferencia
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
            ¡Bienvenido a "Sin Filtros" 2026! Confirma tu llegada en la entrada escaneando el código QR oficial.
          </p>
        </div>

        {/* CASE A: Restricted Access (No QR Code parameter) */}
        {!isQrAccess && (
          <div className="glass-panel text-center animate-fade-in" style={{ padding: '3rem 2rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(245, 124, 0, 0.08)', border: '1px solid rgba(245, 124, 0, 0.25)', padding: '1.2rem', borderRadius: '50%', color: 'var(--accent-color)', marginBottom: '1.5rem' }}>
              <QrCode size={44} className="animate-pulse" />
            </div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>
              Escanea el Código QR de Entrada
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '450px', margin: '0 auto 2rem auto' }}>
              Para agilizar tu registro y validar tu entrada a la conferencia, por favor escanea el código QR ubicado en los carteles físicos de la entrada del evento.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', width: '100%', margin: '1.5rem 0' }}></div>
            <Link to="/" className="btn-secondary" style={{ padding: '0.8rem 2.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }}>
              Ir al Inicio
            </Link>
          </div>
        )}

        {/* CASE B: QR validated - Mode Search */}
        {isQrAccess && !checkinSuccess && viewMode === 'search' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem 1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search className="text-gradient" size={20} />
                <span>Busca tu Registro</span>
              </h3>
              
              <button 
                type="button"
                onClick={() => setViewMode('register')}
                style={{
                  background: 'rgba(245, 124, 0, 0.12)',
                  border: '1px solid rgba(245, 124, 0, 0.35)',
                  color: 'var(--accent-light, #ffffff)',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserPlus size={14} />
                <span>No estoy Registrado</span>
              </button>
            </div>

            {/* Search Input Area */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <input
                  type="text"
                  placeholder="Tu Nombre, Correo o Boleto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '0.8rem 1rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  className="ticket-search-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn-primary"
                  style={{
                    padding: '0 1.8rem',
                    borderRadius: '8px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '130px',
                    justifyContent: 'center'
                  }}
                >
                  {isSearching ? <RefreshCw className="spinner" size={18} /> : 'Buscar'}
                </button>
              </div>
              {searchError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.82rem', marginTop: '0.8rem', fontWeight: '500' }}>
                  <AlertCircle size={14} />
                  <span>{searchError}</span>
                </div>
              )}
            </div>

            {/* Error Message from check-in submit */}
            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Search Results list */}
            {hasSearched && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '600' }}>
                  Resultados encontrados ({searchResults.length})
                </h4>
                
                {searchResults.length === 0 ? (
                  <div className="text-center" style={{ padding: '2rem 1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem', opacity: 0.7 }}>🤷‍♂️</div>
                    <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      No encontramos coincidencias con tu búsqueda. Si no te habías registrado antes, puedes hacerlo rápidamente ahora.
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewMode('register')}
                      className="btn-primary"
                      style={{
                        padding: '0.6rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <UserPlus size={16} />
                      <span>Registrarme Ahora en Puerta</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {searchResults.map(user => (
                      <div 
                        key={user.ticketCode}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '10px',
                          padding: '1.2rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', margin: '0 0 4px 0' }}>
                            {user.firstName} {user.lastName}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: '600', marginRight: '8px' }}>
                            {user.ticketCode}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {user.email}
                          </span>
                        </div>

                        <div>
                          {user.checkedIn === 'Si' ? (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                border: '1px solid rgba(16, 185, 129, 0.2)', 
                                color: '#10b981', 
                                padding: '0.4rem 0.8rem', 
                                borderRadius: '30px', 
                                fontSize: '0.8rem', 
                                fontWeight: '700' 
                              }}
                            >
                              <UserCheck size={14} />
                              <span>Registrado</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCheckinSubmit(user)}
                              disabled={isCheckingIn}
                              className="btn-primary"
                              style={{
                                padding: '0.45rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                cursor: 'pointer',
                                border: 'none'
                              }}
                            >
                              {isCheckingIn && checkedInUser?.ticketCode === user.ticketCode ? (
                                <RefreshCw className="spinner" size={14} />
                              ) : (
                                <UserCheck size={14} />
                              )}
                              <span>Confirmar Entrada</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CASE B2: QR validated - Mode Express Registration */}
        {isQrAccess && !checkinSuccess && viewMode === 'register' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem 1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', fontWeight: '700' }}>
                  Entrada Inmediata
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus className="text-gradient" size={22} />
                  <span>Registro Rápido en Puerta</span>
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setViewMode('search')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={14} />
                <span>Volver a Buscar</span>
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Completa tus datos para asignarte un código de entrada y confirmar tu llegada al evento en segundos.
            </p>

            {expressError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.2rem', fontWeight: '500' }}>
                <AlertCircle size={16} />
                <span>{expressError}</span>
              </div>
            )}

            <form onSubmit={handleExpressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Nombres y Apellidos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={expressForm.firstName}
                    onChange={(e) => setExpressForm({ ...expressForm, firstName: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '0.75rem 0.9rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu apellido"
                    value={expressForm.lastName}
                    onChange={(e) => setExpressForm({ ...expressForm, lastName: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '0.75rem 0.9rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Correo y Teléfono */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={expressForm.email}
                    onChange={(e) => setExpressForm({ ...expressForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '0.75rem 0.9rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(809) 000-0000"
                    value={expressForm.phone}
                    onChange={(e) => setExpressForm({ ...expressForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '0.75rem 0.9rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Rango de Edad */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Rango de Edad *
                </label>
                <select
                  value={expressForm.ageGroup}
                  onChange={(e) => setExpressForm({ ...expressForm, ageGroup: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#181818',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {AGE_GROUPS.map(ag => (
                    <option key={ag} value={ag}>{ag}</option>
                  ))}
                </select>
              </div>

              {/* Iglesia */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Iglesia a la que perteneces *
                  </label>
                  
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-light, #ffffff)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={expressForm.isGuest}
                      onChange={(e) => setExpressForm({ ...expressForm, isGuest: e.target.checked })}
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    <span>Soy invitado / No asisto</span>
                  </label>
                </div>

                {!expressForm.isGuest && (
                  <>
                    <select
                      value={selectedChurch}
                      onChange={(e) => setSelectedChurch(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#181818',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '0.75rem 0.9rem',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: selectedChurch === 'Otra' ? '0.5rem' : '0'
                      }}
                    >
                      {CHURCH_OPTIONS.map(ch => (
                        <option key={ch} value={ch}>{ch}</option>
                      ))}
                      <option value="Otra">Otra iglesia...</option>
                    </select>

                    {selectedChurch === 'Otra' && (
                      <input
                        type="text"
                        placeholder="Escribe el nombre de tu iglesia"
                        value={expressForm.customChurch}
                        onChange={(e) => setExpressForm({ ...expressForm, customChurch: e.target.value })}
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          padding: '0.75rem 0.9rem',
                          fontSize: '0.95rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={isSubmittingExpress}
                className="btn-primary"
                style={{
                  marginTop: '1rem',
                  padding: '0.9rem',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                }}
              >
                {isSubmittingExpress ? (
                  <>
                    <RefreshCw className="spinner" size={18} />
                    <span>Guardando registro...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Completar Registro y Entrada</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* CASE C: Check-in Success confirmation screen */}
        {isQrAccess && checkinSuccess && checkedInUser && (
          <div className="glass-panel text-center animate-fade-in" style={{ padding: '3.5rem 2rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.2rem', borderRadius: '50%', color: '#10b981', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>
            
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              {checkedInUser.isNewRegister ? '¡Registro y Entrada Exitosos!' : '¡Entrada Confirmada!'}
            </h2>

            {checkedInUser.ticketCode && (
              <div style={{ display: 'inline-block', background: 'rgba(245, 124, 0, 0.1)', border: '1px solid rgba(245, 124, 0, 0.3)', padding: '0.4rem 1.2rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '6px' }}>Tu Boleto:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--accent-color)', fontFamily: 'monospace' }}>{checkedInUser.ticketCode}</strong>
              </div>
            )}
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem auto' }}>
              Bienvenido/a, <strong>{checkedInUser.firstName} {checkedInUser.lastName}</strong>. Tu llegada a la conferencia ha sido registrada en el sistema. ¡Disfruta de la Conferencia Sin Filtros 2026!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn-primary" onClick={handleResetSearch} style={{ padding: '0.8rem 2.5rem' }}>
                Hacer Check-In para Alguien Más
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EventCheckin;
