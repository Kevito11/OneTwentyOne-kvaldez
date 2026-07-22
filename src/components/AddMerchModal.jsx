import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBag, X, Check, Loader, Plus, Minus, AlertCircle, Sparkles, AlertTriangle, ArrowLeft, HelpCircle } from 'lucide-react';
import { getImageUrl } from '../config/images';
import './AddMerchModal.css';

const PRODUCTS = [
  {
    id: 1,
    name: 'Gorra "Sin Filtros"',
    price: 750,
    type: 'cap',
    images: {
      'Negro': '/merch/Merch SIN FILTROS gorra 1.jpeg'
    },
    colors: ['Negro'],
    colorHex: {
      'Negro': '#000000'
    },
    sizes: ['Única']
  },
  {
    id: 2,
    name: 'Camiseta "Sin Filtros"',
    price: 1200,
    type: 'tshirt',
    images: {
      'Negro': {
        front: '/merch/Merch SIN FILTROS Tshirt frontal 6.jpeg',
        back: '/merch/Merch SIN FILTROS Tshirt atrs 6.jpeg'
      },
      'Gris': {
        front: '/merch/Merch SIN FILTROS Tshirt frontal 4.jpeg',
        back: '/merch/Merch SIN FILTROS Tshirt atrs 4.jpeg'
      },
      'Blanco': {
        front: '/merch/Merch SIN FILTROS Tshirt frontal 3.jpeg',
        back: '/merch/Merch SIN FILTROS Tshirt atrs 3.jpeg'
      }
    },
    colors: ['Negro', 'Gris', 'Blanco'],
    colorHex: {
      'Negro': '#121212',
      'Gris': '#8A8A8A',
      'Blanco': '#FFFFFF'
    },
    sizes: ['S', 'M', 'L', 'XL']
  }
];

const AddMerchModal = ({
  isOpen,
  onClose,
  ticketCode,
  participantName,
  existingMerchItems,
  existingMerchTotal,
  onSuccess
}) => {
  const [merchSelections, setMerchSelections] = useState({
    1: { selected: false, quantity: 1, color: 'Negro', size: 'Única' },
    2: { selected: true, quantity: 1, color: 'Negro', size: 'M' }
  });

  const [inputTicketCode, setInputTicketCode] = useState(ticketCode || '');
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successState, setSuccessState] = useState(null);

  const [existingMerch, setExistingMerch] = useState({
    hasMerch: false,
    items: '',
    total: 0,
    name: ''
  });

  useEffect(() => {
    if (ticketCode) {
      setInputTicketCode(ticketCode);
    }
  }, [ticketCode]);

  useEffect(() => {
    if (existingMerchItems && existingMerchItems !== 'Ninguno' && Number(existingMerchTotal) > 0) {
      setExistingMerch({
        hasMerch: true,
        items: existingMerchItems,
        total: Number(existingMerchTotal) || 0,
        name: participantName || ''
      });
    }
  }, [existingMerchItems, existingMerchTotal, participantName]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMessage('');
      setSuccessState(null);
      setIsConfirmStep(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const checkTicketMerch = async (codeToSearch) => {
    const cleanCode = codeToSearch ? codeToSearch.trim() : '';
    if (!cleanCode || cleanCode.length < 4) return;
    
    const sheetUrl = import.meta.env.VITE_SHEETS_API_URL;
    if (!sheetUrl) return;

    try {
      const response = await fetch(`${sheetUrl}?code=${encodeURIComponent(cleanCode)}`);
      const data = await response.json();
      if (data.status === 'success') {
        const hasMerch = data.interestedInMerch === 'Sí' && data.merchItems && data.merchItems !== 'Ninguno' && Number(data.merchTotal) > 0;
        setExistingMerch({
          hasMerch: hasMerch,
          items: data.merchItems || '',
          total: Number(data.merchTotal) || 0,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim()
        });
      }
    } catch (e) {
      // Ignorar errores silenciosos
    }
  };

  const handleSelectionToggle = (productId) => {
    setMerchSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selected: !prev[productId].selected
      }
    }));
  };

  const handleOptionChange = (productId, optionName, value) => {
    setMerchSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [optionName]: value
      }
    }));
  };

  const handleQuantityChange = (productId, delta) => {
    setMerchSelections(prev => {
      const currentQty = prev[productId].quantity;
      const newQty = Math.max(1, currentQty + delta);
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: newQty
        }
      };
    });
  };

  // Calcular total de los productos NUEVOS seleccionados
  let newTotalAmount = 0;
  const newSelectedItemsDetails = [];
  const selectedImageUrls = [];

  PRODUCTS.forEach(p => {
    const sel = merchSelections[p.id];
    if (sel && sel.selected) {
      newTotalAmount += p.price * sel.quantity;
      newSelectedItemsDetails.push(`${sel.quantity}x ${p.name} - ${sel.color} (Talla: ${sel.size})`);
      
      const imgPath = p.type === 'tshirt'
        ? p.images[sel.color]?.front
        : p.images['Negro'];
      selectedImageUrls.push(encodeURI(decodeURI(getImageUrl(imgPath))));
    }
  });

  const accumulatedTotal = existingMerch.hasMerch 
    ? (existingMerch.total + newTotalAmount) 
    : newTotalAmount;

  const targetCode = (ticketCode || inputTicketCode || '').trim();

  // Paso 1: Validar e Ir a Paso de Confirmación
  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!targetCode) {
      setErrorMessage('Por favor ingresa tu código de boleto.');
      return;
    }

    if (newSelectedItemsDetails.length === 0) {
      setErrorMessage('Por favor selecciona al menos un artículo de mercancía.');
      return;
    }

    // Ir a la pantalla de confirmación antes de enviar
    setIsConfirmStep(true);
  };

  // Paso 2: Ejecutar el guardado definitivo en Google Sheets
  const handleExecuteSave = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    const sheetUrl = import.meta.env.VITE_SHEETS_API_URL;
    const newMerchItemsStr = newSelectedItemsDetails.join(', ');
    const finalMerchItemsStr = existingMerch.hasMerch
      ? `${existingMerch.items}, ${newMerchItemsStr}`
      : newMerchItemsStr;
      
    const merchImageUrlsStr = selectedImageUrls.join(',');

    try {
      if (!sheetUrl) {
        // Simulación local para pruebas sin backend conectado
        setTimeout(() => {
          const mockData = {
            ticketCode: targetCode,
            interestedInMerch: 'Sí',
            merchItems: finalMerchItemsStr,
            merchTotal: accumulatedTotal,
            firstName: participantName ? participantName.split(' ')[0] : 'Asistente',
            lastName: participantName ? participantName.split(' ').slice(1).join(' ') : ''
          };
          setSuccessState(mockData);
          setIsSubmitting(false);
          setIsConfirmStep(false);
          if (onSuccess) onSuccess(mockData);
        }, 1000);
        return;
      }

      const response = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'updateMerch',
          ticketCode: targetCode,
          merchItems: finalMerchItemsStr,
          merchTotal: accumulatedTotal,
          merchImageUrls: merchImageUrlsStr,
          ticketUrl: `${window.location.origin}/ticket/${targetCode}`
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        const updatedInfo = result.updatedData || {
          ticketCode: targetCode,
          interestedInMerch: 'Sí',
          merchItems: finalMerchItemsStr,
          merchTotal: accumulatedTotal
        };
        setSuccessState(updatedInfo);
        setIsConfirmStep(false);
        if (onSuccess) {
          onSuccess(updatedInfo);
        }
      } else if (result.status === 'not_found') {
        setErrorMessage('No se encontró ningún registro con este código de boleto. Por favor verifica que tu código sea correcto.');
        setIsConfirmStep(false);
      } else {
        throw new Error(result.message || 'Error al actualizar la mercancía.');
      }
    } catch (err) {
      console.error('Error enviando reserva de mercancía:', err);
      setErrorMessage('Ocurrió un error de conexión al procesar tu reserva. Inténtalo de nuevo.');
      setIsConfirmStep(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="add-merch-modal-overlay">
      <div className="add-merch-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        
        <button className="add-merch-close-btn" onClick={onClose} aria-label="Cerrar modal">
          <X size={20} />
        </button>

        {/* VISTA 1: ÉXITO DE RESERVA */}
        {successState ? (
          <div className="add-merch-success-content text-center animate-fade-in">
            <div className="success-icon-badge">
              <Check size={36} style={{ color: '#10b981' }} />
            </div>
            <h2>¡Mercancía Reservada con Éxito!</h2>
            <p className="success-subtitle">
              Hemos actualizado la reserva para tu boleto <strong>{successState.ticketCode}</strong> y enviado las instrucciones de pago a tu correo.
            </p>

            <div className="success-summary-box">
              <div className="summary-row-item">
                <span>Reserva acumulada total:</span>
                <strong>{successState.merchItems}</strong>
              </div>
              <div className="summary-row-item total">
                <span>Total a pagar (100%):</span>
                <strong className="text-gradient">RD$ {Number(successState.merchTotal).toLocaleString()}</strong>
              </div>
            </div>

            <div className="success-actions">
              <button 
                onClick={onClose} 
                className="action-btn-primary"
                style={{ width: '100%' }}
              >
                Entendido, Ver mi Boleto Actualizado
              </button>
            </div>
          </div>
        ) : isConfirmStep ? (
          /* VISTA 2: PANTALLA INTERMEDIA DE CONFIRMACIÓN PREVIA */
          <div className="add-merch-review-content animate-fade-in text-left">
            <div className="add-merch-header">
              <div className="header-badge warning">
                <HelpCircle size={18} className="text-warning" />
                <span>Confirmación de Actualización</span>
              </div>
              <h2>¿Confirmas la adición de estos artículos?</h2>
              <p className="participant-tag">
                Boleto: <code>{targetCode}</code> {participantName || existingMerch.name ? `· ${participantName || existingMerch.name}` : ''}
              </p>
            </div>

            {errorMessage && (
              <div className="add-merch-error-box">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="review-breakdown-card">
              {/* Sección de Reserva Anterior si existe */}
              {existingMerch.hasMerch && (
                <div className="review-section-box previous">
                  <span className="review-section-title">📦 Reserva Anterior Registrada:</span>
                  <div className="review-item-row">
                    <span className="review-item-name">{existingMerch.items}</span>
                    <strong className="review-item-price">RD$ {existingMerch.total.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {/* Sección de Nuevos Artículos */}
              <div className="review-section-box new">
                <span className="review-section-title">➕ Nuevos Artículos a Agregar:</span>
                <div className="review-item-row">
                  <span className="review-item-name">{newSelectedItemsDetails.join(', ')}</span>
                  <strong className="review-item-price">RD$ {newTotalAmount.toLocaleString()}</strong>
                </div>
              </div>

              {/* Total Acumulado Resultante */}
              <div className="review-section-box total-result">
                <span className="review-total-label">Nuevo Total Acumulado A Pagar (100%):</span>
                <strong className="review-total-price">RD$ {accumulatedTotal.toLocaleString()}</strong>
              </div>
            </div>

            <div className="review-notice-banner">
              <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span>Al hacer clic en confirmar, se modificará tu registro en el sistema y recibirás un nuevo correo con este desglose.</span>
            </div>

            <div className="review-actions-group">
              <button
                type="button"
                onClick={handleExecuteSave}
                disabled={isSubmitting}
                className="submit-merch-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="spinner" size={18} />
                    <span>Actualizando Registro...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>Sí, Confirmar y Actualizar Reserva</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmStep(false)}
                disabled={isSubmitting}
                className="cancel-step-btn"
              >
                <ArrowLeft size={16} /> Modificar mi Selección
              </button>
            </div>
          </div>
        ) : (
          /* VISTA 3: FORMULARIO PRINCIPAL DE SELECCIÓN DE ARTÍCULOS */
          <form onSubmit={handleProceedToConfirm} className="add-merch-form animate-fade-in">
            <div className="add-merch-header">
              <div className="header-badge">
                <ShoppingBag size={18} className="text-gradient" />
                <span>Mercancía Oficial Sin Filtros 2026</span>
              </div>
              <h2>Reserva Mercancía con tu boleto</h2>
              {(participantName || existingMerch.name) && (
                <p className="participant-tag">
                  Asistente: <strong>{participantName || existingMerch.name}</strong>
                </p>
              )}
            </div>

            {!ticketCode && (
              <div className="ticket-code-input-group">
                <label htmlFor="ticketCodeInput">Ingresa tu Código de Boleto:</label>
                <input
                  id="ticketCodeInput"
                  type="text"
                  placeholder="Ej: 121-ICC-4892"
                  value={inputTicketCode}
                  onChange={(e) => setInputTicketCode(e.target.value.toUpperCase())}
                  onBlur={() => checkTicketMerch(inputTicketCode)}
                  required
                />
              </div>
            )}

            {/* Aviso de Mercancía Previa Registrada */}
            {existingMerch.hasMerch && (
              <div className="existing-merch-warning-box">
                <div className="warning-box-header">
                  <AlertTriangle size={18} className="warning-box-icon" />
                  <span>Aviso: Ya tienes mercancía reservada</span>
                </div>
                <p className="warning-box-desc">
                  Tu boleto actualmente cuenta con la siguiente reserva previa:
                </p>
                <div className="warning-box-items-chip">
                  <ShoppingBag size={14} />
                  <span className="warning-items-text">{existingMerch.items}</span>
                  <span className="warning-items-price">RD$ {existingMerch.total.toLocaleString()}</span>
                </div>
                <p className="warning-box-footer-note">
                  💡 Los nuevos artículos que elijas a continuación se <strong>SUMARÁN</strong> a tu orden previa.
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="add-merch-error-box">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="products-selection-container">
              {PRODUCTS.map(product => {
                const sel = merchSelections[product.id] || { selected: false, quantity: 1, color: 'Negro', size: 'M' };
                const isTshirt = product.type === 'tshirt';
                const previewImg = isTshirt
                  ? product.images[sel.color]?.front
                  : product.images['Negro'];

                return (
                  <div key={product.id} className={`merch-product-row-card ${sel.selected ? 'selected' : ''}`}>
                    <div className="product-row-top">
                      <label className="custom-checkbox-container">
                        <input
                          type="checkbox"
                          checked={sel.selected}
                          onChange={() => handleSelectionToggle(product.id)}
                        />
                        <span className="checkmark"></span>
                        <span className="product-title-name">{product.name}</span>
                      </label>
                      <span className="product-row-price">RD$ {product.price.toLocaleString()}</span>
                    </div>

                    {sel.selected && (
                      <div className="product-row-options animate-fade-in">
                        <div className="product-preview-thumb">
                          <img src={getImageUrl(previewImg)} alt={product.name} />
                        </div>

                        <div className="options-controls">
                          {/* Color */}
                          <div className="opt-group">
                            <span className="opt-label">Color:</span>
                            <div className="color-dots-row">
                              {product.colors.map(col => (
                                <button
                                  key={col}
                                  type="button"
                                  className={`mini-color-dot ${sel.color === col ? 'active' : ''}`}
                                  style={{ backgroundColor: product.colorHex[col] }}
                                  onClick={() => handleOptionChange(product.id, 'color', col)}
                                  title={`Color ${col}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Talla */}
                          <div className="opt-group">
                            <span className="opt-label">Talla:</span>
                            <div className="size-chips-row">
                              {product.sizes.map(sz => (
                                <button
                                  key={sz}
                                  type="button"
                                  className={`mini-size-chip ${sel.size === sz ? 'active' : ''}`}
                                  onClick={() => handleOptionChange(product.id, 'size', sz)}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Cantidad */}
                          <div className="opt-group qty-group">
                            <span className="opt-label">Cant:</span>
                            <div className="qty-picker">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, -1)}
                                className="qty-btn"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="qty-val">{sel.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 1)}
                                className="qty-btn"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="add-merch-footer">
              <div className="total-calculation-row">
                <span>{existingMerch.hasMerch ? 'Nuevo Total Acumulado (100%):' : 'Total de Reserva (100%):'}</span>
                <div style={{ textAlign: 'right' }}>
                  {existingMerch.hasMerch && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #aaa)', marginBottom: '0.15rem' }}>
                      Anterior: RD$ {existingMerch.total.toLocaleString()} + Nuevo: RD$ {newTotalAmount.toLocaleString()}
                    </div>
                  )}
                  <strong className="total-price-text">RD$ {accumulatedTotal.toLocaleString()}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={newTotalAmount === 0}
                className="submit-merch-btn"
              >
                <Sparkles size={18} />
                <span>Continuar a Confirmación</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddMerchModal;
