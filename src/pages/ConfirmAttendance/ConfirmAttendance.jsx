import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowLeft, Calendar } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './ConfirmAttendance.css';

const ConfirmAttendance = () => {
  const location = useLocation();
  const sheetUrl = import.meta.env.VITE_SHEETS_API_URL || '';

  const [ticketCode, setTicketCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [devMode, setDevMode] = useState(false);

  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [attendanceChoice, setAttendanceChoice] = useState(null); // 'Si' or 'No'

  // Read ticket code from URL query parameter if present on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      handleVerify(codeParam.trim().toUpperCase());
    } else {
      setSearchError('Para confirmar tu asistencia, debes acceder utilizando el enlace personalizado enviado a tu correo electrónico.');
    }
  }, [location]);

  // Handle ticket verification against sheets API or simulated database
  const handleVerify = async (code) => {
    if (!code) {
      setSearchError('Para confirmar tu asistencia, debes acceder utilizando el enlace personalizado enviado a tu correo electrónico.');
      return;
    }

    // Regex check for standard format (e.g. 121-ICC-1234)
    const isValidFormat = /^121-ICC-\d{4}$/.test(code);
    if (!isValidFormat) {
      setSearchError('El código de boleto proporcionado no tiene un formato válido.');
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
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '(809) 555-0123'
        });
      }, 1200);
      return;
    }

    try {
      const response = await fetch(`${sheetUrl}?code=${encodeURIComponent(code)}`);
      const result = await response.json();

      if (result.status === 'success') {
        setIsVerified(true);
        setTicketCode(code);
        setUserData({
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone
        });
      } else if (result.status === 'not_found') {
        setSearchError('Este código de boleto no existe en nuestros registros.');
      } else {
        setSearchError(result.message || 'Error al validar el boleto.');
      }
    } catch (err) {
      console.error('Error verifying ticket:', err);
      setSearchError('Error de red al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit attendance confirmation to Sheets API (updates column P)
  const handleConfirmAttendance = async (choice) => {
    setAttendanceChoice(choice);
    setIsSubmitting(true);
    setErrorMessage('');

    if (devMode || !sheetUrl || sheetUrl.trim() === '') {
      // Simulation mode
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
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
          action: 'confirmAttendance',
          ticketCode: ticketCode,
          attending: choice // 'Si' or 'No'
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSubmitSuccess(true);
      } else {
        setErrorMessage(data.message || 'Error al procesar la confirmación.');
      }
    } catch (err) {
      console.error('Error confirming attendance:', err);
      setErrorMessage('Error de red al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsVerified(false);
    setTicketCode('');
    setUserData(null);
    setSubmitSuccess(false);
    setAttendanceChoice(null);
    setSearchError('');
    setErrorMessage('');
  };

  return (
    <div className="attendance-page section-padding">
      <div className="container" style={{ maxWidth: '650px' }}>
        
        {/* Title Header */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <span className="section-subtitle">CONFERENCIA "SIN FILTROS" 2026</span>
          <h1 className="section-title text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
            Confirmación de Asistencia
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
            Ayúdanos a asegurar la capacidad del auditorio. Confirma si realmente asistirás al evento para gestionar los cupos disponibles.
          </p>
        </div>

        {/* PHASE 1: Verification Loader or Link Error */}
        {!isVerified && !submitSuccess && (
          <div className="glass-panel search-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            {isVerifying ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
                <RefreshCw className="spinner text-gradient" size={40} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Validando tu boleto...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                  Conectando con la base de datos para verificar tu reserva.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
                  <AlertCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'white' }}>
                  Acceso Restringido
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 auto', maxWidth: '460px' }}>
                  {searchError || 'Para confirmar tu asistencia, debes acceder utilizando el enlace personalizado enviado a tu correo electrónico.'}
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', width: '100%', margin: '1rem 0' }}></div>
                <Link to="/" className="btn-secondary" style={{ padding: '0.8rem 2.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }}>
                  Volver al Inicio
                </Link>
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: Attend Option Buttons */}
        {isVerified && !submitSuccess && userData && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem 1.8rem' }}>
            {/* User Profile Info Card */}
            <div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.06)', 
                borderRadius: '10px', 
                padding: '1.2rem', 
                marginBottom: '2rem' 
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-color)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                Boleto Verificado • {ticketCode}
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'white' }}>
                {userData.firstName} {userData.lastName}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.4rem 0 0 0' }}>
                {userData.email} • {userData.phone}
              </p>
            </div>

            <div className="text-center" style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
                ¿Asistirás a la Conferencia "Sin Filtros"?
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 auto', maxWidth: '450px' }}>
                Si confirmas que asistirás, tu lugar estará asegurado en el auditorio. Si indicas que no asistirás, cederemos tu pase a las personas en lista de espera.
              </p>
            </div>

            {/* Error Message if submit fails */}
            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => handleConfirmAttendance('Si')}
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isSubmitting && attendanceChoice === 'Si' ? (
                  <RefreshCw className="spinner" size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                <span>Sí, confirmada mi asistencia</span>
              </button>

              <button
                onClick={() => handleConfirmAttendance('No')}
                disabled={isSubmitting}
                className="btn-secondary"
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  boxShadow: 'none'
                }}
              >
                {isSubmitting && attendanceChoice === 'No' ? (
                  <RefreshCw className="spinner" size={20} />
                ) : (
                  <XCircle size={20} />
                )}
                <span>No podré asistir (Liberar cupo)</span>
              </button>
            </div>

            {/* Reset option removed to restrict manual ticket verification */}
          </div>
        )}

        {/* PHASE 3: Success Screen */}
        {submitSuccess && (
          <div className="glass-panel text-center animate-fade-in" style={{ padding: '3rem 2rem' }}>
            <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
              {attendanceChoice === 'Si' ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', color: '#10b981' }}>
                  <CheckCircle2 size={48} />
                </div>
              ) : (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
                  <XCircle size={48} />
                </div>
              )}
            </div>

            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>
              {attendanceChoice === 'Si' ? '¡Asistencia Confirmada!' : '¡Cupo Liberado!'}
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem auto' }}>
              {attendanceChoice === 'Si' ? (
                <>Gracias, <strong>{userData?.firstName}</strong>. Hemos registrado que asistirás a la conferencia. Tu asiento está asegurado. ¡Nos vemos pronto!</>
              ) : (
                <>Tu decisión ha sido registrada con éxito. Agradecemos enormemente que nos hayas avisado con anticipación, lo cual permite ceder tu cupo a otro joven que desea asistir.</>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/" className="btn-secondary" style={{ padding: '0.8rem 2rem' }}>
                Volver al Inicio
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConfirmAttendance;
