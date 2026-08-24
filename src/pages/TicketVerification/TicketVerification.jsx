import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, MapPin, User, Phone, Home, ShoppingBag, Loader, ShieldCheck, AlertTriangle, Printer, RotateCcw, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { getImageUrl } from '../../config/images';
import AddMerchModal from '../../components/AddMerchModal';
import './TicketVerification.css';

const getProductImage = (itemStr) => {
  if (itemStr.toLowerCase().includes('gorra')) {
    return "/merch/Merch SIN FILTROS gorra Frontal.jpeg";
  }
  if (itemStr.toLowerCase().includes('camiseta')) {
    if (itemStr.includes('Gris')) {
      return "/merch/Merch SIN FILTROS Tshirt frontal 4.jpeg";
    }
    if (itemStr.includes('Blanco')) {
      return "/merch/Merch SIN FILTROS Tshirt frontal 3.jpeg";
    }
    return "/merch/Merch SIN FILTROS Tshirt frontal 6.jpeg"; // negro fallback
  }
  return "";
};

const TicketVerification = () => {
  const { code } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const [isMerchModalOpen, setIsMerchModalOpen] = useState(false);

  const handleMerchSuccess = (updatedData) => {
    setTicketData(prev => ({
      ...prev,
      interestedInMerch: 'Sí',
      merchItems: updatedData.merchItems,
      merchTotal: updatedData.merchTotal
    }));
  };

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
    if (ticketData) {
      const isVigilia = (ticketData.event && (
        ticketData.event.toLowerCase().includes('vigilia') || 
        ticketData.event.toLowerCase().includes('reset')
      )) || (ticketData.ticketCode && ticketData.ticketCode.indexOf('RESET') !== -1);
      
      if (isVigilia) {
        document.body.classList.add('vigilia-mode');
      } else {
        document.body.classList.remove('vigilia-mode');
      }
    }
    return () => {
      document.body.classList.remove('vigilia-mode');
    };
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

  const isVigilia = ticketData && (
    (ticketData.event && (
      ticketData.event.toLowerCase().includes('vigilia') || 
      ticketData.event.toLowerCase().includes('reset')
    )) || (ticketData.ticketCode && ticketData.ticketCode.indexOf('RESET') !== -1)
  );

  const isCena = ticketData && (
    (ticketData.event && ticketData.event.toLowerCase().includes('cena')) || 
    (ticketData.ticketCode && ticketData.ticketCode.indexOf('CENA') !== -1)
  );

  const isCampamento = ticketData && (
    (ticketData.event && ticketData.event.toLowerCase().includes('campamento')) || 
    (ticketData.ticketCode && ticketData.ticketCode.indexOf('CAMP') !== -1)
  );

  return (
    <div className="verification-page animate-fade-in section-padding" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '550px', margin: '0 auto', width: '100%', padding: '0 1.5rem', boxSizing: 'border-box' }}>
        
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
          <div className="verification-success-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Cabecera de Estatus */}
            <div className="status-header glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '1.2rem 1.5rem', border: `1px solid ${isCena ? 'rgba(219, 39, 119, 0.35)' : (isCampamento ? 'rgba(5, 150, 105, 0.35)' : 'rgba(16, 185, 129, 0.35)')}`, background: `${isCena ? 'rgba(219, 39, 119, 0.05)' : (isCampamento ? 'rgba(5, 150, 105, 0.05)' : 'rgba(16, 185, 129, 0.05)')}`, borderRadius: '16px', boxSizing: 'border-box' }}>
              <ShieldCheck className="success-icon" size={32} style={{ color: isCena ? '#db2777' : (isCampamento ? '#059669' : '#10b981') }} />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span className="status-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  {isCena || isCampamento ? 'Pre-Registro Verificado' : 'Boleto Verificado'}
                </span>
                <span className="status-badge" style={{ fontSize: '1.25rem', fontWeight: '900', color: isCena ? '#db2777' : (isCampamento ? '#059669' : '#10b981'), letterSpacing: '0.5px' }}>
                  {isCena || isCampamento ? 'CUPO RESERVADO' : 'ACCESO VÁLIDO'}
                </span>
              </div>
            </div>

            {/* Tarjeta de Entrada de Cristal (Idéntica a la de registro) */}
            <div className={`ticket-card animate-fade-in ${isVigilia ? 'ticket-reset' : (isCena ? 'ticket-cena' : (isCampamento ? 'ticket-camp' : ''))}`} style={{ textAlign: 'left' }}>
              <div className="ticket-top">
                <div className="ticket-header">
                  <div className="ticket-event-info">
                    <span className="ticket-event-label">{isVigilia ? 'Boleto Media Vigilia' : (isCena ? 'Pre-Registro Cena ICC' : (isCampamento ? 'Pre-Registro Campamento ICC' : 'Boleto de Entrada'))}</span>
                    <span className="ticket-event-name text-gradient" style={isCena ? { backgroundImage: 'linear-gradient(90deg, #fff 0%, #db2777 100%)' } : (isCampamento ? { backgroundImage: 'linear-gradient(90deg, #fff 0%, #059669 100%)' } : {})}>
                      {isVigilia ? 'RESET' : (isCena ? 'CENA DE JÓVENES ICC' : (isCampamento ? 'CAMPAMENTO JÓVENES ICC' : 'SIN FILTROS 2026'))}
                    </span>
                    <span className="ticket-event-subtitle">{isVigilia ? 'Pre-Conferencia Jóvenes ICC' : (isCena ? 'Celebración Fin de Año ICC' : (isCampamento ? 'Campamento de Jóvenes ICC' : 'Conferencia de Jóvenes ICC'))}</span>
                  </div>
                  <div className="ticket-logo">
                    <span className="t-logo-text">Jóvenes</span>
                    <div className="t-logo-sub" style={isCena ? { color: '#db2777' } : (isCampamento ? { color: '#059669' } : {})}>I C C</div>
                  </div>
                </div>

                <div className="ticket-body-grid">
                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Asistente</span>
                    <span className="ticket-info-value">{ticketData.firstName} {ticketData.lastName}</span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">
                      {isCena || isCampamento ? 'Código de Pre-Registro' : 'Código de Entrada'}
                    </span>
                    <span className="ticket-info-value" style={{ fontFamily: 'monospace', letterSpacing: '1px', color: isVigilia ? '#FF3800' : (isCena ? '#db2777' : (isCampamento ? '#059669' : 'var(--accent-light)')) }}>
                      {ticketData.ticketCode}
                    </span>
                  </div>

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Fecha del Evento</span>
                    <span className="ticket-info-value">
                      {isVigilia 
                        ? 'Sábado 22 Agosto, 2026' 
                        : (isCena 
                            ? 'Sábado 5 de Diciembre, 2026' 
                            : (isCampamento 
                                ? '16 al 18 de Abril, 2027' 
                                : 'Sábado 29 Agosto, 2026'))}
                    </span>
                  </div>

                  {!isCena && !isCampamento && (
                    <div className="ticket-info-item">
                      <span className="ticket-info-label">Hora de Apertura</span>
                      <span className="ticket-info-value">
                        {isVigilia ? '06:00 PM' : '03:00 PM'}
                      </span>
                    </div>
                  )}

                  <div className="ticket-info-item">
                    <span className="ticket-info-label">Costo</span>
                    {isCena || isCampamento ? (
                      <span className="ticket-info-value free-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        POR ANUNCIAR
                      </span>
                    ) : (
                      <span className="ticket-info-value free-badge">TOTALMENTE GRATIS</span>
                    )}
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
                        <span>Mercancía Reservada (Pago del 100% Requerido)</span>
                      </div>
                      
                      {/* Visual List of Items with Images */}
                      <div className="ticket-merch-items-list" style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem' }}>
                        {items.map((item, idx) => {
                          const imgPath = getProductImage(item);
                          const parts = item.split(' - ');
                          const mainInfo = parts[0] || item;
                          const details = parts[1] || '';
                          
                          return (
                            <div key={idx} className="ticket-merch-item-card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              {imgPath && (
                                <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#090909', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                                  <img 
                                    src={encodeURI(decodeURI(getImageUrl(imgPath)))} 
                                    alt={mainInfo} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      if (e.target.src !== imgPath) {
                                        e.target.src = imgPath;
                                      }
                                    }}
                                  />
                                </div>
                              )}
                              <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'left' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {mainInfo}
                                </div>
                                {details && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {details}
                                  </div>
                                )}
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
                        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', padding: '0.5rem 0.7rem', marginBottom: '0.8rem', color: '#f87171', fontWeight: '600', fontSize: '0.78rem', lineHeight: '1.4', textAlign: 'left' }}>
                          ⚠️ Fecha límite de pago: <strong style={{ color: '#fca5a5' }}>09 de agosto de 2026</strong>. Por favor, completa tu pago a tiempo. Pasada esta fecha, las reservas no pagadas se cancelarán automáticamente y no podremos garantizar la disponibilidad de tus artículos.
                        </div>
                        <div style={{ marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                          <strong>📌 Confirmación de Reserva (Pago 100%):</strong>
                        </div>
                        <div>1. Realiza el depósito/transferencia del 100% a cualquiera de las cuentas indicadas en la web.</div>
                        <div style={{ margin: '0.2rem 0' }}>
                          2. En el concepto de tu banco, indica la siguiente estructura para asociarlo fácilmente:
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.5rem', borderRadius: '4px', margin: '0.25rem 0', fontFamily: 'monospace', color: 'white', display: 'block', width: 'fit-content' }}>
                            {ticketData.ticketCode} - {ticketData.firstName} {ticketData.lastName}
                          </div>
                        </div>
                        <div style={{ color: '#fbd590', marginBottom: '0.4rem' }}>
                          * Estaremos contactando una vez esté listo y disponible para retirar en la iglesia.
                        </div>

                        {/* Botón para enviar comprobante */}
                        <a 
                          href={`https://wa.me/18096299236?text=${encodeURIComponent(
                            `*COMPROBANTE DE PAGO - REGISTRO CONFERENCIA*\n\n*Asistente:* ${ticketData.firstName} ${ticketData.lastName}\n*Código de Boleto:* ${ticketData.ticketCode}\n\nAdjunto el comprobante del depósito del 100% para confirmar mi mercancía.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="merch-payment-footer-note wa-link"
                          style={{ textDecoration: 'none', display: 'flex', marginTop: '0.6rem', padding: '0.6rem 0.8rem' }}
                        >
                          <Phone size={14} style={{ color: 'var(--accent-light)' }} />
                          <span>Envía el comprobante por WhatsApp al <strong>(809) 629-9236</strong> (Haz clic para chatear).</span>
                        </a>

                        <div style={{ marginTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.8rem', textAlign: 'center' }}>
                          <Link 
                            to="/merch" 
                            style={{ color: 'var(--accent-light)', fontSize: '0.82rem', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <ShoppingBag size={14} /> Ver catálogo completo de mercancía
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Banner de Reservación Cerrada en Boleto */}
                {!isVigilia && !isCena && !isCampamento && (!ticketData.interestedInMerch || ticketData.interestedInMerch !== 'Sí' || !ticketData.merchItems || ticketData.merchItems === 'Ninguno') && (
                  <div className="ticket-no-merch-banner" style={{ marginTop: '1.2rem', padding: '1.2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: '800', fontSize: '0.95rem' }}>
                      <AlertTriangle size={18} />
                      <span>Reservación de Mercancía Finalizada</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                      La fecha límite para reservar mercancía oficial ha concluido. Recuerda que estos artículos solo estuvieron disponibles bajo la modalidad de reservación previa.
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #aaa)', fontWeight: '600', marginTop: '0.25rem' }}>Síguenos en Instagram, donde comunicaremos cualquier novedad:</span>
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.2rem' }}>
                      <Link
                        to="/merch"
                        style={{ color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.65rem 1.2rem', borderRadius: '50px', fontWeight: '800', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', transition: 'background-color 0.2s' }}
                      >
                        <ShoppingBag size={16} /> Ver Catálogo de Merch
                      </Link>
                      <a 
                        href="https://www.instagram.com/onetwentyoneicc/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-color)', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        Síguenos en Instagram
                      </a>
                    </div>
                  </div>
                )}
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
            <div className="ticket-actions-bar" style={{ width: '100%', flexWrap: 'wrap', gap: '0.8rem' }}>
              <button onClick={handlePrint} className="ticket-action-btn print">
                <Printer size={18} />
                {isCena || isCampamento ? 'Imprimir Pre-Registro / PDF' : 'Imprimir Boleto / PDF'}
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

              {!isVigilia && !isCena && !isCampamento && (
                <Link
                  to="/merch"
                  className="ticket-action-btn nav"
                  style={{ textDecoration: 'none' }}
                >
                  <ShoppingBag size={18} style={{ color: 'var(--accent-color)' }} />
                  Ver Todo el Merch
                </Link>
              )}

              <Link to="/" className="ticket-action-btn nav" style={{ textDecoration: 'none' }}>
                <RotateCcw size={18} />
                Volver al Inicio
              </Link>
            </div>

          </div>
        )}

        {/* Modal para Agregar Mercancía */}
        {ticketData && (
          <AddMerchModal
            isOpen={isMerchModalOpen}
            onClose={() => setIsMerchModalOpen(false)}
            ticketCode={ticketData.ticketCode}
            participantName={`${ticketData.firstName} ${ticketData.lastName}`}
            existingMerchItems={ticketData.merchItems}
            existingMerchTotal={ticketData.merchTotal}
            onSuccess={handleMerchSuccess}
          />
        )}

      </div>
    </div>
  );
};

export default TicketVerification;
