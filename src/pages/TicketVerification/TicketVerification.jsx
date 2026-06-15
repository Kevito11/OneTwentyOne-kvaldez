import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, MapPin, User, Phone, Home, ShoppingBag, Loader, ShieldCheck, AlertTriangle, Printer, RotateCcw } from 'lucide-react';
import QRCode from 'qrcode';
import './TicketVerification.css';

const TicketVerification = () => {
  const { code } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (ticketData && ticketData.ticketCode) {
      const validationUrl = `${window.location.origin}/ticket/${ticketData.ticketCode}`;
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
  }, [ticketData]);

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

            {/* Tarjeta de Entrada de Cristal (Idéntica a la de registro) */}
            <div className="ticket-card animate-fade-in" style={{ textAlign: 'left' }}>
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
                    <span className="ticket-info-value">{ticketData.firstName} {ticketData.lastName}</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Código de Entrada</span>
                    <span className="ticket-info-value" style={{ fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--accent-light)' }}>
                      {ticketData.ticketCode}
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
                    <span className="ticket-info-value">{ticketData.church || 'Iglesia de Convertidos a Cristo'}</span>
                  </div>
                </div>

                {/* Visualizing reserved merch inside the ticket if present */}
                {ticketData.interestedInMerch === 'Sí' && ticketData.merchItems && ticketData.merchItems !== 'Ninguno' && (() => {
                  const items = ticketData.merchItems.split(',').map(i => i.trim()).filter(Boolean);
                  const merchTotal = Number(ticketData.merchTotal) || 0;
                  return items.length > 0 ? (
                    <div className="ticket-merch-summary-box">
                      <div className="ticket-merch-title-row">
                        <ShoppingBag size={14} style={{ color: 'var(--text-primary)' }} />
                        <span>Mercancía Reservada (Abono del 50% Requerido)</span>
                      </div>
                      <div className="ticket-merch-items-text">
                        {items.map((item, idx) => (
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
                        <div>1. Realiza el depósito/transferencia del 50% a cualquiera de las cuentas indicadas en la web.</div>
                        <div style={{ margin: '0.2rem 0' }}>
                          2. En el concepto de tu banco, indica la siguiente estructura para asociarlo fácilmente:
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.5rem', borderRadius: '4px', margin: '0.25rem 0', fontFamily: 'monospace', color: 'white', display: 'block', width: 'fit-content' }}>
                            {ticketData.ticketCode} - {ticketData.firstName} {ticketData.lastName}
                          </div>
                        </div>
                        <div style={{ color: '#fbd590', marginBottom: '0.4rem' }}>
                          * El pago restante (50%) debe completarse antes del <strong>5 de Agosto</strong>.
                        </div>

                        {/* Botón para enviar comprobante */}
                        <a 
                          href={`https://wa.me/18498838466?text=${encodeURIComponent(
                            `*COMPROBANTE DE ABONO - REGISTRO CONFERENCIA*\n\n*Asistente:* ${ticketData.firstName} ${ticketData.lastName}\n*Código de Boleto:* ${ticketData.ticketCode}\n\nAdjunto el comprobante del depósito del 50% para confirmar la reserva de mi mercancía.`
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
                    <a
                      href={`${window.location.origin}/ticket/${ticketData.ticketCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <img
                        src={qrCodeUrl}
                        alt={`Código QR para entrada ${ticketData.ticketCode}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                      />
                    </a>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#fff' }}></div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="ticket-actions-bar" style={{ marginTop: '2rem', width: '100%' }}>
              <button onClick={handlePrint} className="ticket-action-btn print">
                <Printer size={18} />
                Imprimir Boleto / PDF
              </button>

              <a
                href="https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6"
                target="_blank"
                rel="noopener noreferrer"
                className="ticket-action-btn nav"
                style={{ textDecoration: 'none' }}
              >
                <MapPin size={18} style={{ color: 'var(--accent-color)' }} />
                Cómo llegar (Maps)
              </a>

              <Link to="/" className="ticket-action-btn nav" style={{ textDecoration: 'none' }}>
                <RotateCcw size={18} />
                Volver al Inicio
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TicketVerification;
