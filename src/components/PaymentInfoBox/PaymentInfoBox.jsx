import React, { useState, useEffect } from 'react';
import { Copy, Check, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const PAYMENT_ITEMS = [
  {
    id: 'banreservas',
    label: 'Banreservas (Cuenta Corriente)',
    value: '0102401330',
    copyLabel: 'Copiar cuenta'
  },
  {
    id: 'popular',
    label: 'Banco Popular (Cuenta Corriente RD$)',
    value: '805943297',
    copyLabel: 'Copiar cuenta'
  },
  {
    id: 'rnc',
    label: 'RNC ICC (Iglesia de Convertidos a Cristo)',
    value: '424-00200-2',
    copyLabel: 'Copiar RNC'
  },
  {
    id: 'correo',
    label: 'Correo para enviar comprobante de pago',
    value: 'secretaria@convertidosacristo.org',
    copyLabel: 'Copiar correo'
  }
];

const ALL_PAYMENT_TEXT = `Datos de Pago - Cena de Jóvenes ICC 2026 (RD$ 350 p/p)
Titular: Iglesia de Convertidos a Cristo (ICC)
• Banreservas (Cuenta Corriente): 0102401330
• Banco Popular (Cuenta Corriente RD$): 805943297
• RNC ICC: 424-00200-2
• Correo para enviar el pago: secretaria@convertidosacristo.org`;

export default function PaymentInfoBox({ participantName = '', defaultExpanded = false }) {
  const [copiedId, setCopiedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const copyToClipboard = async (id, text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2400);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Si el usuario entra desde el botón del correo (?copy=datos), expande y copia automáticamente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('copy') === 'datos') {
      setIsExpanded(true);
      copyToClipboard('all', ALL_PAYMENT_TEXT);
    }
  }, []);

  const cleanName = (participantName || '').trim();
  const mailSubject = encodeURIComponent(
    cleanName
      ? `Comprobante de Pago - Cena de Jóvenes 2026 - ${cleanName}`
      : 'Comprobante de Pago - Cena de Jóvenes 2026 (Christmas x Grace)'
  );
  const mailBody = encodeURIComponent(
    `Hola, bendiciones.\n\nAdjunto el comprobante de pago de la Cena de Jóvenes 2026 ("Christmas x Grace" - RD$ 350 p/p).\n\n• Participante: ${cleanName || '[Tu Nombre Completo]'}\n• Actividad: Cena de Jóvenes ICC 2026\n• Monto: RD$ 350\n\n¡Muchas gracias!`
  );

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '14px',
        marginTop: '0.5rem',
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'all 0.25s ease'
      }}
    >
      {/* Cabecera comprimida / Botón desplegable */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded((prev) => !prev);
        }}
        aria-expanded={isExpanded}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.1rem',
          background: isExpanded ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.04)',
          border: 'none',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: '#ffffff',
          transition: 'background 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#fca5a5'
            }}
          >
            🏦 Datos de Pago y Transferencia (Cuentas ICC)
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
            {isExpanded
              ? 'Toca para comprimir las cuentas bancarias y RNC'
              : 'Toca aquí para ver y copiar las cuentas bancarias y RNC'}
          </span>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.32rem 0.7rem',
            borderRadius: '9999px',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid rgba(239, 68, 68, 0.38)',
            color: '#fca5a5',
            fontSize: '0.73rem',
            fontWeight: '700',
            flexShrink: 0
          }}
        >
          <span>{isExpanded ? 'Ocultar' : 'Ver cuentas'}</span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* Contenido desplegable */}
      {isExpanded && (
        <div style={{ padding: '1rem 1.1rem 1.1rem 1.1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {PAYMENT_ITEMS.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.6rem',
                    flexWrap: 'wrap',
                    padding: '0.55rem 0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                      {item.label}
                    </div>
                    <code
                      style={{
                        color: item.id === 'correo' ? '#86efac' : '#fde047',
                        fontWeight: '800',
                        fontSize: '0.92rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {item.value}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.id, item.value);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.38rem 0.75rem',
                      borderRadius: '8px',
                      border: isCopied
                        ? '1px solid rgba(52, 211, 153, 0.55)'
                        : '1px solid rgba(255, 255, 255, 0.18)',
                      background: isCopied
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: isCopied ? '#6ee7b7' : '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    title={`Copiar ${item.value}`}
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{isCopied ? '¡Copiado!' : item.copyLabel}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Acciones rápidas: Copiar todos los datos + Enviar correo con el pago */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed rgba(255, 255, 255, 0.12)'
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard('all', ALL_PAYMENT_TEXT);
              }}
              style={{
                flex: '1 1 200px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.58rem 0.9rem',
                borderRadius: '10px',
                border:
                  copiedId === 'all'
                    ? '1px solid rgba(52, 211, 153, 0.6)'
                    : '1px solid rgba(250, 204, 21, 0.38)',
                background:
                  copiedId === 'all'
                    ? 'rgba(16, 185, 129, 0.22)'
                    : 'rgba(250, 204, 21, 0.1)',
                color: copiedId === 'all' ? '#6ee7b7' : '#fde047',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {copiedId === 'all' ? <Check size={15} /> : <Copy size={15} />}
              <span>
                {copiedId === 'all'
                  ? '¡Todos los datos copiados!'
                  : 'Copiar todos los datos de pago'}
              </span>
            </button>

            <a
              href={`mailto:secretaria@convertidosacristo.org?subject=${mailSubject}&body=${mailBody}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: '1 1 200px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.58rem 0.9rem',
                borderRadius: '10px',
                border: '1px solid rgba(134, 239, 172, 0.4)',
                background: 'rgba(22, 163, 74, 0.18)',
                color: '#86efac',
                fontSize: '0.8rem',
                fontWeight: '800',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              title="Abrir tu aplicación de correo para enviar el comprobante de pago"
            >
              <Mail size={15} />
              <span>Enviar correo con el pago</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
