import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, MapPin, User, Phone, Home, ShoppingBag, Loader, ShieldCheck, AlertTriangle } from 'lucide-react';
import './TicketVerification.css';

const TicketVerification = () => {
  const { code } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketData = async () => {
      setLoading(true);
      setError('');
      
      const sheetUrl = import.meta.env.VITE_SHEETS_API_URL;
      
      if (!sheetUrl) {
        setError('La URL de la API de Google Sheets no está configurada.');
        setLoading(false);
        return;
      }

      try {
        // Hacemos la petición GET con el parámetro code
        const response = await fetch(`${sheetUrl}?code=${encodeURIComponent(code)}`);
        
        if (!response.ok) {
          throw new Error('No se pudo conectar con el servidor.');
        }

        const data = await response.json();

        if (data.status === 'success') {
          setTicketData(data);
        } else if (data.status === 'not_found') {
          setError('El código de boleto ingresado no existe en nuestros registros.');
        } else {
          throw new Error(data.message || 'Error al buscar el boleto.');
        }
      } catch (err) {
        console.error('Error fetching ticket data:', err);
        setError('Ocurrió un problema de conexión al buscar el boleto. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchTicketData();
    } else {
      setError('No se ha proporcionado ningún código de boleto.');
      setLoading(false);
    }
  }, [code]);

  return (
    <div className="verification-page animate-fade-in section-padding">
      <div className="container mini-container">
        
        {loading && (
          <div className="verification-loading-card glass-panel">
            <Loader className="spinner" size={48} />
            <h2>Validando Boleto...</h2>
            <p>Buscando en la base de datos de registros oficiales.</p>
            <div className="code-badge">{code}</div>
          </div>
        )}

        {!loading && error && (
          <div className="verification-error-card glass-panel animate-fade-in">
            <XCircle className="error-icon" size={64} />
            <h2>Boleto No Válido</h2>
            <p className="error-message">{error}</p>
            <div className="code-badge error">{code}</div>
            
            <div className="error-actions">
              <Link to="/registro" className="action-btn-primary">
                Ir a Registro Abierto
              </Link>
              <Link to="/" className="action-btn-secondary">
                Volver al Inicio
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && ticketData && (
          <div className="verification-success-card glass-panel animate-fade-in">
            {/* Cabecera de Estatus */}
            <div className="status-header">
              <ShieldCheck className="success-icon" size={32} />
              <div>
                <span className="status-label">Boleto Verificado</span>
                <span className="status-badge">ACCESO VÁLIDO</span>
              </div>
            </div>

            {/* Tarjeta de Entrada de Cristal */}
            <div className="verification-ticket">
              <div className="v-ticket-header">
                <div>
                  <span className="v-event-title">SIN FILTROS 2026</span>
                  <span className="v-event-sub">Conferencia de Jóvenes ICC</span>
                </div>
                <div className="v-ticket-logo">
                  <span>121</span>
                </div>
              </div>

              <div className="v-ticket-body">
                <div className="v-field">
                  <span className="v-label">Asistente</span>
                  <span className="v-value">{ticketData.firstName} {ticketData.lastName}</span>
                </div>

                <div className="v-field">
                  <span className="v-label">Código de Entrada</span>
                  <span className="v-value monospace-code">{ticketData.ticketCode}</span>
                </div>

                <div className="v-grid-fields">
                  <div className="v-field">
                    <span className="v-label">Iglesia</span>
                    <span className="v-value">{ticketData.church || 'Iglesia de Convertidos a Cristo'}</span>
                  </div>
                  <div className="v-field">
                    <span className="v-label">Rango de Edad</span>
                    <span className="v-value">{ticketData.ageGroup} años</span>
                  </div>
                </div>

                <div className="v-grid-fields">
                  <div className="v-field">
                    <span className="v-label">Contacto</span>
                    <span className="v-value">{ticketData.phone}</span>
                  </div>
                  <div className="v-field">
                    <span className="v-label">Entrada</span>
                    <span className="v-value free-badge">TOTALMENTE GRATIS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mercancía Reservada */}
            {ticketData.interestedInMerch === 'Sí' && ticketData.merchItems && ticketData.merchItems !== 'Ninguno' && (
              <div className="v-merch-box">
                <div className="v-merch-header">
                  <ShoppingBag size={18} />
                  <h3>Mercancía Reservada</h3>
                </div>
                <div className="v-merch-details">
                  <p className="v-merch-items">{ticketData.merchItems}</p>
                  <div className="v-merch-divider"></div>
                  <div className="v-merch-pricing">
                    <div className="price-row">
                      <span>Total de la Compra:</span>
                      <strong>RD$ {Number(ticketData.merchTotal).toLocaleString()}</strong>
                    </div>
                    <div className="price-row highlight">
                      <span>Abono Requerido (50%):</span>
                      <strong>RD$ {(Number(ticketData.merchTotal) / 2).toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="v-payment-alert">
                    <AlertTriangle size={14} />
                    <span>Confirmar que se haya enviado el comprobante de pago por WhatsApp.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de regreso */}
            <div className="success-actions">
              <Link to="/" className="action-btn-primary">
                Listo, Volver al Inicio
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TicketVerification;
