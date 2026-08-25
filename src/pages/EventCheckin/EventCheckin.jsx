import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, UserCheck, AlertCircle, RefreshCw, XCircle, ArrowLeft, QrCode } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './EventCheckin.css';

const EventCheckin = () => {
  const location = useLocation();
  const sheetUrl = import.meta.env.VITE_SHEETS_API_URL || '';

  // QR-code enforcement state
  const [isQrAccess, setIsQrAccess] = useState(false);
  
  // Search and check-in states
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

  // Validate QR source on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sourceParam = params.get('source');
    if (sourceParam === 'qr' || params.get('scan') === 'true') {
      setIsQrAccess(true);
    }
  }, [location]);

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
        // Mock results matching the query
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

  // Confirm arrival/check-in (POST call to write to Column R)
  const handleCheckinSubmit = async (user) => {
    setIsCheckingIn(true);
    setErrorMessage('');
    setCheckedInUser(user);

    if (devMode || !sheetUrl || sheetUrl.trim() === '') {
      // Simulation mode
      setTimeout(() => {
        setIsCheckingIn(false);
        setCheckinSuccess(true);
        // Update local search results state to reflect checkedIn status
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
        // Update state to present confirmed status immediately
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

  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setCheckinSuccess(false);
    setCheckedInUser(null);
    setSearchError('');
    setErrorMessage('');
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

        {/* CASE B: QR validated - Active Search & Registration */}
        {isQrAccess && !checkinSuccess && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem 1.8rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search className="text-gradient" size={20} />
              <span>Busca tu Registro</span>
            </h3>

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
                  <div className="text-center" style={{ padding: '2rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🤷‍♂️</div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      No encontramos coincidencias. Por favor verifica que tu nombre o correo esté bien escrito o regístrate en la mesa de ayuda.
                    </p>
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

        {/* CASE C: Check-in Success confirmation screen */}
        {isQrAccess && checkinSuccess && checkedInUser && (
          <div className="glass-panel text-center animate-fade-in" style={{ padding: '3.5rem 2rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.2rem', borderRadius: '50%', color: '#10b981', marginBottom: '1.5rem' }}>
              <UserCheck size={48} className="animate-pulse" />
            </div>
            
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>
              ¡Entrada Confirmada!
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem auto' }}>
              Bienvenido, <strong>{checkedInUser.firstName} {checkedInUser.lastName}</strong>. Tu llegada a la conferencia ha sido registrada con éxito. Disfruta del evento, y no olvides pre-ordenar tu almuerzo y refrigerios en la sección de comida.
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
