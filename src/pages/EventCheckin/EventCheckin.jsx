import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, UserCheck, AlertCircle, QrCode, UserPlus, Sparkles, CheckCircle2, ArrowLeft, Zap } from 'lucide-react';
import './EventCheckin.css';

const AGE_OPTIONS = [
  "12 a 17 años",
  "18 a 25 años",
  "26 a 35 años",
  "36+ años"
];

const STORAGE_KEY_ATTENDEES = 'ICC_CHECKIN_ATTENDEES_V1';
const STORAGE_KEY_PENDING_CHECKINS = 'ICC_CHECKIN_PENDING_CHECKINS_V1';
const STORAGE_KEY_PENDING_EXPRESS = 'ICC_CHECKIN_PENDING_EXPRESS_V1';
const STORAGE_KEY_SYNC_DATE = 'ICC_CHECKIN_LAST_SYNC_DATE_V1';

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user.substring(0, 2)}***@${domain}`;
};

const EventCheckin = () => {
  const location = useLocation();
  const sheetUrl = import.meta.env.VITE_SHEETS_API_URL || '';

  // QR-code enforcement state
  const [isQrAccess, setIsQrAccess] = useState(false);

  // Local database and pending state
  const [attendees, setAttendees] = useState([]);
  const [pendingCheckins, setPendingCheckins] = useState([]);
  const [pendingExpress, setPendingExpress] = useState([]);

  // View Mode: 'search' | 'register'
  const [viewMode, setViewMode] = useState('search');
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Check-in action states
  const [checkedInUser, setCheckedInUser] = useState(null);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Express Registration Form State: Only firstName, lastName, email, age
  const [expressForm, setExpressForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    ageGroup: '18 a 25 años'
  });
  const [expressError, setExpressError] = useState('');

  // Validate QR source on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sourceParam = params.get('source');
    if (sourceParam === 'qr' || params.get('scan') === 'true') {
      setIsQrAccess(true);
    }
  }, [location]);

  // Load local data and fetch latest database in background
  useEffect(() => {
    // 1. Cargar datos locales existentes de inmediato
    let localAttendees = [];
    let localCheckins = [];
    let localExpress = [];

    try {
      const savedAttendees = localStorage.getItem(STORAGE_KEY_ATTENDEES);
      if (savedAttendees) {
        localAttendees = JSON.parse(savedAttendees);
        setAttendees(localAttendees);
      }

      const savedCheckins = localStorage.getItem(STORAGE_KEY_PENDING_CHECKINS);
      if (savedCheckins) {
        localCheckins = JSON.parse(savedCheckins);
        setPendingCheckins(localCheckins);
      }

      const savedExpress = localStorage.getItem(STORAGE_KEY_PENDING_EXPRESS);
      if (savedExpress) {
        localExpress = JSON.parse(savedExpress);
        setPendingExpress(localExpress);
      }
    } catch (e) {
      console.error('Error reading localStorage check-in data:', e);
    }

    // 2. Descargar base de datos actualizada en segundo plano (sin bloquear)
    if (sheetUrl && sheetUrl.trim() !== '') {
      fetch(`${sheetUrl}?action=getAllAttendees`)
        .then(res => res.json())
        .then(data => {
          if (data && data.status === 'success' && Array.isArray(data.attendees)) {
            // Unir asistentes del servidor con los checkins locales ya realizados
            const pendingMap = new Map();
            localCheckins.forEach(c => pendingMap.set(c.ticketCode, true));

            const updatedList = data.attendees.map(remoteAtt => {
              const isCheckedInLocally = pendingMap.has(remoteAtt.ticketCode);
              return {
                ...remoteAtt,
                checkedIn: (isCheckedInLocally || remoteAtt.checkedIn === 'Si') ? 'Si' : 'No'
              };
            });

            // Combinar con los express registrados en este dispositivo
            localExpress.forEach(exp => {
              if (!updatedList.some(u => u.ticketCode === exp.ticketCode)) {
                updatedList.push({
                  ...exp,
                  checkedIn: 'Si'
                });
              }
            });

            setAttendees(updatedList);
            try {
              localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(updatedList));
            } catch (err) {
              console.warn('Could not save updated attendees to localStorage:', err);
            }
          }
        })
        .catch(err => {
          console.warn('Modo offline / error al actualizar base en segundo plano:', err);
        });
    }
  }, [sheetUrl]);

  // Sincronizador automático a las 9:00 PM
  useEffect(() => {
    const checkAndSyncAt9PM = async () => {
      if (!sheetUrl) return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const lastSyncedDate = localStorage.getItem(STORAGE_KEY_SYNC_DATE);

      // Comprobar si ya son las 9:00 PM (21:00) o más tarde hoy
      const is9PMOrLater = now.getHours() >= 21;

      // Obtener pendientes directamente de localStorage para mayor precisión
      let currentCheckins = [];
      let currentExpress = [];
      try {
        currentCheckins = JSON.parse(localStorage.getItem(STORAGE_KEY_PENDING_CHECKINS) || '[]');
        currentExpress = JSON.parse(localStorage.getItem(STORAGE_KEY_PENDING_EXPRESS) || '[]');
      } catch (e) {
        console.error('Error parsing pending items for 9PM sync:', e);
      }

      const hasPendingData = currentCheckins.length > 0 || currentExpress.length > 0;

      if (is9PMOrLater && hasPendingData && lastSyncedDate !== todayStr) {
        try {
          console.log('⏰ 9:00 PM alcanzado. Enviando lote masivo de check-ins a Google Sheets...');
          const response = await fetch(sheetUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
              action: 'batchCheckin',
              checkins: currentCheckins,
              expressRegistrations: currentExpress
            })
          });

          const result = await response.json();
          if (result && result.status === 'success') {
            console.log('✅ Sincronización masiva de las 9:00 PM completada con éxito.');
            localStorage.setItem(STORAGE_KEY_PENDING_CHECKINS, '[]');
            localStorage.setItem(STORAGE_KEY_PENDING_EXPRESS, '[]');
            localStorage.setItem(STORAGE_KEY_SYNC_DATE, todayStr);
            setPendingCheckins([]);
            setPendingExpress([]);
          }
        } catch (err) {
          console.error('Error durante la sincronización automática de las 9:00 PM:', err);
        }
      }
    };

    // Ejecutar chequeo inicial
    checkAndSyncAt9PM();

    // Comprobar cada 30 segundos
    const interval = setInterval(checkAndSyncAt9PM, 30000);
    return () => clearInterval(interval);
  }, [sheetUrl]);

  // Handle search 100% localmente e instantáneamente (0ms)
  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchError('Por favor introduce un nombre, correo o boleto.');
      return;
    }
    if (query.length < 2) {
      setSearchError('La búsqueda debe tener al menos 2 caracteres.');
      return;
    }

    setSearchError('');
    setErrorMessage('');

    // Búsqueda instantánea en la base de datos local en memoria
    const results = attendees.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const ticket = (user.ticketCode || '').toLowerCase();
      const email = (user.email || '').toLowerCase();

      return fullName.includes(query) || ticket.includes(query) || email.includes(query);
    });

    setSearchResults(results);
    setHasSearched(true);
  };

  // Confirm arrival/check-in for existing user (100% local e instantáneo)
  const handleCheckinSubmit = (user) => {
    setErrorMessage('');
    const nowTimeStr = new Date().toLocaleTimeString();

    // 1. Actualizar lista de asistentes local
    const updatedAttendees = attendees.map(u => 
      u.ticketCode === user.ticketCode ? { ...u, checkedIn: 'Si' } : u
    );
    setAttendees(updatedAttendees);

    // 2. Registrar en la cola de check-ins pendientes para las 9 PM
    const newPendingCheckin = {
      ticketCode: user.ticketCode,
      checkedInAt: nowTimeStr
    };
    const updatedPending = [...pendingCheckins, newPendingCheckin];
    setPendingCheckins(updatedPending);

    // 3. Guardar inmediatamente en localStorage
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(updatedAttendees));
      localStorage.setItem(STORAGE_KEY_PENDING_CHECKINS, JSON.stringify(updatedPending));
    } catch (e) {
      console.warn('Error saving check-in to localStorage:', e);
    }

    // 4. Actualizar resultados en pantalla y mostrar confirmación de inmediato
    setSearchResults(prev => prev.map(u => 
      u.ticketCode === user.ticketCode ? { ...u, checkedIn: 'Si' } : u
    ));
    setCheckedInUser(user);
    setCheckinSuccess(true);
  };

  // Handle Express Registration: Nombre, Apellido, Correo, Edad (100% local e instantáneo)
  const handleExpressSubmit = (e) => {
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

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newTicketCode = `121-ICC-${randomDigits}`;
    const nowTimeStr = new Date().toLocaleTimeString();
    const nowDateStr = new Date().toLocaleDateString('es-DO');

    const newUser = {
      ticketCode: newTicketCode,
      firstName: expressForm.firstName.trim(),
      lastName: expressForm.lastName.trim(),
      email: expressForm.email.trim(),
      phone: '',
      church: 'Invitado / En Puerta',
      ageGroup: expressForm.ageGroup,
      checkedIn: 'Si',
      date: nowDateStr,
      time: nowTimeStr
    };

    // 1. Agregar a la base de datos local
    const updatedAttendees = [newUser, ...attendees];
    setAttendees(updatedAttendees);

    // 2. Agregar a la cola de nuevos registros para las 9 PM
    const updatedExpress = [...pendingExpress, newUser];
    setPendingExpress(updatedExpress);

    // 3. Guardar en localStorage
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(updatedAttendees));
      localStorage.setItem(STORAGE_KEY_PENDING_EXPRESS, JSON.stringify(updatedExpress));
    } catch (err) {
      console.warn('Error saving express registration to localStorage:', err);
    }

    // 4. Mostrar confirmación de inmediato (0ms)
    setCheckedInUser({
      ...newUser,
      isNewRegister: true
    });
    setCheckinSuccess(true);
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
      <div className="container" style={{ maxWidth: '620px' }}>
        
        {/* Title Header */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <span className="section-subtitle">Auto-Registro de Entrada</span>
          <h1 className="section-title text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
            Check-In Conferencia
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '480px', margin: '0 auto', lineHeight: '1.5' }}>
            ¡Bienvenido a "Sin Filtros" 2026! Confirma tu llegada escaneando el código QR oficial de la entrada.
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
          <div className="glass-panel animate-fade-in" style={{ padding: '2.2rem 2rem' }}>
            {/* Header with Title and "No estoy Registrado" button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search className="text-gradient" size={20} />
                <span>Busca tu Registro</span>
              </h3>
              
              <button 
                type="button"
                onClick={() => setViewMode('register')}
                className="btn-not-registered"
              >
                <Zap size={14} className="icon-pulse" />
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
                  className="ticket-search-input"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="btn-primary"
                  style={{
                    padding: '0 1.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                >
                  <Search size={18} />
                  <span>Buscar</span>
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
                  <div className="text-center" style={{ padding: '2.2rem 1.5rem', background: 'rgba(255,255,255,0.015)', borderRadius: '14px', border: '1px dashed rgba(245, 124, 0, 0.25)' }}>
                    <div style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>⚡</div>
                    <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                      ¿No apareces en la lista?
                    </h4>
                    <p style={{ margin: '0 0 1.4rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '380px', marginInline: 'auto' }}>
                      No te preocupes, puedes hacer tu registro rápido en 30 segundos y confirmar tu entrada ahora mismo.
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewMode('register')}
                      className="btn-primary"
                      style={{
                        padding: '0.75rem 1.8rem',
                        fontSize: '0.92rem',
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {searchResults.map(user => (
                      <div key={user.ticketCode} className="checkin-user-card">
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', margin: '0 0 4px 0' }}>
                            {user.firstName} {user.lastName}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: '700', marginRight: '8px', fontFamily: 'monospace' }}>
                            {user.ticketCode}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {maskEmail(user.email)}
                          </span>
                        </div>

                        <div>
                          {user.checkedIn === 'Si' ? (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px', 
                                background: 'rgba(16, 185, 129, 0.12)', 
                                border: '1px solid rgba(16, 185, 129, 0.3)', 
                                color: '#10b981', 
                                padding: '0.4rem 0.9rem', 
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
                              className="btn-primary"
                              style={{
                                padding: '0.5rem 1.1rem',
                                fontSize: '0.82rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <UserCheck size={14} />
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

        {/* CASE B2: QR validated - Mode Express Registration (Only Nombre, Apellido, Correo, Edad) */}
        {isQrAccess && !checkinSuccess && viewMode === 'register' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.2rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', fontWeight: '800' }}>
                  Entrada Inmediata
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus className="text-gradient" size={22} />
                  <span>Registro Rápido en Puerta</span>
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setViewMode('search')}
                className="btn-back-soft"
              >
                <ArrowLeft size={14} />
                <span>Volver a Buscar</span>
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Completa tus datos básicos para registrar tu entrada a la conferencia en segundos.
            </p>

            {expressError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.2rem', fontWeight: '500' }}>
                <AlertCircle size={16} />
                <span>{expressError}</span>
              </div>
            )}

            <form onSubmit={handleExpressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Nombre y Apellido */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="checkin-field-label">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={expressForm.firstName}
                    onChange={(e) => setExpressForm({ ...expressForm, firstName: e.target.value })}
                    className="checkin-input"
                  />
                </div>

                <div>
                  <label className="checkin-field-label">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu apellido"
                    value={expressForm.lastName}
                    onChange={(e) => setExpressForm({ ...expressForm, lastName: e.target.value })}
                    className="checkin-input"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="checkin-field-label">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={expressForm.email}
                  onChange={(e) => setExpressForm({ ...expressForm, email: e.target.value })}
                  className="checkin-input"
                />
              </div>

              {/* Edad / Rango de Edad */}
              <div>
                <label className="checkin-field-label">
                  Edad / Rango de Edad *
                </label>
                <div className="age-pills-grid">
                  {AGE_OPTIONS.map(opt => {
                    const isSelected = expressForm.ageGroup === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setExpressForm({ ...expressForm, ageGroup: opt })}
                        className={`age-pill-btn ${isSelected ? 'active' : ''}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Enviar con efecto llamativo */}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  marginTop: '0.8rem',
                  padding: '0.95rem',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={18} />
                <span>Completar Registro y Entrada</span>
              </button>
            </form>
          </div>
        )}

        {/* CASE C: Check-in Success confirmation screen */}
        {isQrAccess && checkinSuccess && checkedInUser && (
          <div className="glass-panel text-center animate-fade-in" style={{ padding: '3.5rem 2rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1.2rem', borderRadius: '50%', color: '#10b981', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={50} className="animate-pulse" />
            </div>
            
            <h2 className="text-gradient" style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '0.6rem' }}>
              {checkedInUser.isNewRegister ? '¡Registro y Entrada Exitosos!' : '¡Entrada Confirmada!'}
            </h2>

            {checkedInUser.ticketCode && (
              <div style={{ display: 'inline-block', background: 'rgba(245, 124, 0, 0.12)', border: '1px solid rgba(245, 124, 0, 0.35)', padding: '0.45rem 1.4rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '6px' }}>Tu Boleto:</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--accent-color)', fontFamily: 'monospace' }}>{checkedInUser.ticketCode}</strong>
              </div>
            )}
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem auto' }}>
              Bienvenido/a, <strong>{checkedInUser.firstName} {checkedInUser.lastName}</strong>. Tu llegada a la conferencia ha sido registrada en el sistema. ¡Disfruta de la Conferencia Sin Filtros 2026!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn-primary" onClick={handleResetSearch} style={{ padding: '0.85rem 2.5rem' }}>
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
