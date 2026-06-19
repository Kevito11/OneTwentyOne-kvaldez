import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Ticket, HelpCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './Merch.css';

// Constantes de Productos Oficiales
const PRODUCTS = [
  {
    id: 1,
    name: "Gorra \"Sin Filtros\"",
    price: 750,
    description: "Gorra oficial de la conferencia.",
    type: "cap",
    images: {
      "Negro": "/merch/Merch SIN FILTROS gorra 1.png"
    },
    colors: ["Negro"],
    colorHex: {
      "Negro": "#000000"
    },
    sizes: ["Única"]
  },
  {
    id: 2,
    name: "Camiseta \"Sin Filtros\"",
    price: 1200,
    description: "Camiseta oficial de la conferencia.",
    type: "tshirt",
    images: {
      "Negro": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 6.png",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 6.png"
      },
      "Gris": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 4.png",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 4.png"
      },
      "Blanco": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 3.png",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 3.png"
      }
    },
    colors: ["Negro", "Gris", "Blanco"],
    colorHex: {
      "Negro": "#121212",
      "Gris": "#8A8A8A",
      "Blanco": "#FFFFFF"
    },
    sizes: ["S", "M", "L", "XL"]
  }
];

// Lista de combinaciones de imágenes de camiseta para navegación secuencial
const tshirtImagesList = [
  { color: "Negro", view: "front" },
  { color: "Negro", view: "back" },
  { color: "Gris", view: "front" },
  { color: "Gris", view: "back" },
  { color: "Blanco", view: "front" },
  { color: "Blanco", view: "back" }
];

// Componente para manejar imágenes con fallback local
const ImageWithFallback = ({ src, localPath, alt, className, style, onLoad }) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={() => {
        if (currentSrc !== localPath) {
          setCurrentSrc(localPath);
        }
      }}
    />
  );
};

// Componente para previsualización premium con transición suave al cambiar de imagen/color
const PremiumImageDisplay = ({ src, localPath, alt, className, style, onClick }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div 
      onClick={onClick}
      style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
    >
      <ImageWithFallback
        src={getImageUrl(src)}
        localPath={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{
          ...style,
          transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(0.97)',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

const Merch = () => {
  // Estados para el selector de camiseta
  const [activeColor, setActiveColor] = useState("Negro"); // Negro, Gris, Blanco
  const [activeView, setActiveView] = useState("front"); // front, back
  const [tshirtSize, setTshirtSize] = useState("M");
  const [lightboxImage, setLightboxImage] = useState(null);

  // Lógica de Deslizamiento (Swipe) para el Lightbox
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const isDragging = useRef(false);

  const handleSwipe = (isNext) => {
    if (lightboxImage && lightboxImage.type === 'tshirt') {
      const currentIndex = tshirtImagesList.findIndex(
        item => item.color === lightboxImage.color && item.view === lightboxImage.view
      );
      if (isNext && currentIndex < tshirtImagesList.length - 1) {
        const nextItem = tshirtImagesList[currentIndex + 1];
        setLightboxImage({ type: 'tshirt', color: nextItem.color, view: nextItem.view });
        setActiveColor(nextItem.color);
        setActiveView(nextItem.view);
      } else if (!isNext && currentIndex > 0) {
        const prevItem = tshirtImagesList[currentIndex - 1];
        setLightboxImage({ type: 'tshirt', color: prevItem.color, view: prevItem.view });
        setActiveColor(prevItem.color);
        setActiveView(prevItem.view);
      }
    }
  };

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart && Math.abs(touchStart - e.targetTouches[0].clientX) > 10) {
      isDragging.current = true;
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      handleSwipe(distance > 0); // distance > 0 means swiped left (Next)
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const onMouseDown = (e) => {
    setDragStart(e.clientX);
    isDragging.current = false;
  };

  const onMouseUp = (e) => {
    if (!dragStart) return;
    const distance = dragStart - e.clientX;
    if (Math.abs(distance) > 10) {
      isDragging.current = true;
    }
    if (Math.abs(distance) > 50) {
      handleSwipe(distance > 0); // distance > 0 means swiped left (Next)
    }
    setDragStart(null);
  };


  // Bloquear scroll cuando el lightbox está abierto y escuchar teclado
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('lightbox-active');
      // Desenfocar cualquier elemento activo para evitar conflictos con el teclado al abrir el lightbox
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-active');
    }

    const handleKeyDown = (e) => {
      if (!lightboxImage) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxImage(null);
      } else if (e.key === 'ArrowRight') {
        if (lightboxImage.type === 'tshirt') {
          const currentIndex = tshirtImagesList.findIndex(
            item => item.color === lightboxImage.color && item.view === lightboxImage.view
          );
          if (currentIndex < tshirtImagesList.length - 1) {
            e.preventDefault();
            const nextItem = tshirtImagesList[currentIndex + 1];
            setLightboxImage({ type: 'tshirt', color: nextItem.color, view: nextItem.view });
            setActiveColor(nextItem.color);
            setActiveView(nextItem.view);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (lightboxImage.type === 'tshirt') {
          const currentIndex = tshirtImagesList.findIndex(
            item => item.color === lightboxImage.color && item.view === lightboxImage.view
          );
          if (currentIndex > 0) {
            e.preventDefault();
            const prevItem = tshirtImagesList[currentIndex - 1];
            setLightboxImage({ type: 'tshirt', color: prevItem.color, view: prevItem.view });
            setActiveColor(prevItem.color);
            setActiveView(prevItem.view);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxImage]);

  return (
    <div className="merch-page animate-fade-in section-padding">
      <div className="container">
        
        {/* Header de la Página */}
        <div className="merch-header text-center">
          <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.6rem 1.2rem', borderRadius: '50px', textDecoration: 'none', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          <span className="subtitle">Colección Oficial</span>
          <h1 className="title">Mercancía <span className="text-gradient">Sin Filtros</span></h1>
          <p className="description">
            Explora los artículos oficiales de la conferencia de jóvenes <strong>"Sin Filtros" 2026</strong>. Para adquirir y reservar tus piezas, haz clic en el botón de reserva para ir al formulario de registro del evento.
          </p>
        </div>

        {/* Productos Grid */}
        <div className="products-grid">
          {PRODUCTS.map(product => {
            if (product.type === "tshirt") {
              const activeColorImg = activeView === "front" 
                ? product.images[activeColor].front 
                : product.images[activeColor].back;

              return (
                <div key={product.id} className="product-card glass-panel animate-fade-in">
                  <div 
                    className="product-image-container" 
                    style={{ position: 'relative', cursor: 'zoom-in' }}
                    onClick={() => setLightboxImage({ type: 'tshirt', color: activeColor, view: activeView })}
                    title="Click para ampliar"
                  >
                    <PremiumImageDisplay 
                      src={activeColorImg} 
                      localPath={activeColorImg} 
                      alt={`${product.name} - ${activeColor}`} 
                      className="product-image"
                    />
                    
                    {/* Switch de Vista Frente/Espalda */}
                    <div className="view-toggle-container" style={{ position: 'absolute', bottom: '1.2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.65)', padding: '0.3rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', zIndex: '2' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveView("front"); }} 
                        className={`view-toggle-btn ${activeView === "front" ? 'active' : ''}`}
                        style={{ background: activeView === "front" ? 'white' : 'transparent', color: activeView === "front" ? 'black' : 'var(--text-secondary)', border: 'none', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Frente
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveView("back"); }} 
                        className={`view-toggle-btn ${activeView === "back" ? 'active' : ''}`}
                        style={{ background: activeView === "back" ? 'white' : 'transparent', color: activeView === "back" ? 'black' : 'var(--text-secondary)', border: 'none', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Espalda
                      </button>
                    </div>
                  </div>

                  <div className="product-info">
                    <div className="product-header">
                      <h2 className="product-title">{product.name}</h2>
                      <span className="product-price">RD$ {product.price.toLocaleString()}</span>
                    </div>
                    <p className="product-desc">{product.description}</p>

                    {/* Selector de Color */}
                    <div className="product-option-group">
                      <span className="option-label">
                        Color: <span className="option-selected-val">{activeColor}</span>
                      </span>
                      <div className="color-options">
                        {product.colors.map(color => (
                          <button
                            key={color}
                            onClick={() => {
                              setActiveColor(color);
                            }}
                            className={`color-dot-btn ${activeColor === color ? 'active' : ''}`}
                            style={{ 
                              backgroundColor: product.colorHex[color], 
                              border: color === 'Blanco' ? '1px solid rgba(255,255,255,0.2)' : 'none' 
                            }}
                            aria-label={`Color ${color}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Selector de Talla */}
                    <div className="product-option-group">
                      <span className="option-label">
                        Talla: <span className="option-selected-val">{tshirtSize}</span>
                      </span>
                      <div className="size-options">
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setTshirtSize(size)}
                            className={`size-chip-btn ${tshirtSize === size ? 'active' : ''}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fila de Redirección */}
                    <div className="product-purchase-row" style={{ marginTop: '1.8rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                      <Link 
                        to="/registro" 
                        className="add-to-cart-btn" 
                        style={{ textDecoration: 'none', width: '100%', maxWidth: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Ticket size={18} /> Reservar en Registro
                      </Link>
                    </div>
                  </div>
                </div>
              );
            } else {
              // GORRA
              const activeCapImg = product.images["Negro"];
              return (
                <div key={product.id} className="product-card glass-panel animate-fade-in">
                  <div 
                    className="product-image-container"
                    style={{ cursor: 'zoom-in' }}
                    onClick={() => setLightboxImage({ type: 'cap', color: 'Negro' })}
                    title="Click para ampliar"
                  >
                    <PremiumImageDisplay 
                      src={activeCapImg} 
                      localPath={activeCapImg} 
                      alt={product.name} 
                      className="product-image"
                    />
                  </div>

                  <div className="product-info">
                    <div className="product-header">
                      <h2 className="product-title">{product.name}</h2>
                      <span className="product-price">RD$ {product.price.toLocaleString()}</span>
                    </div>
                    <p className="product-desc">{product.description}</p>

                    {/* Color */}
                    <div className="product-option-group">
                      <span className="option-label">
                        Color: <span className="option-selected-val">Negro</span>
                      </span>
                      <div className="color-options">
                        <button
                          className="color-dot-btn active"
                          style={{ backgroundColor: '#000000' }}
                          disabled
                          aria-label="Color Negro"
                        />
                      </div>
                    </div>

                    {/* Talla */}
                    <div className="product-option-group">
                      <span className="option-label">
                        Talla: <span className="option-selected-val">Ajustable</span>
                      </span>
                      <div className="size-options">
                        <button className="size-chip-btn active" disabled>
                          Ajustable
                        </button>
                      </div>
                    </div>

                    {/* Fila de Redirección */}
                    <div className="product-purchase-row" style={{ marginTop: '1.8rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                      <Link 
                        to="/registro" 
                        className="add-to-cart-btn" 
                        style={{ textDecoration: 'none', width: '100%', maxWidth: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Ticket size={18} /> Reservar en Registro
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Lightbox Modal con soporte de Swipe */}
      {lightboxImage && (() => {
        let zoomedImgSrc = "";
        if (lightboxImage.type === 'tshirt') {
          zoomedImgSrc = PRODUCTS[1].images[lightboxImage.color][lightboxImage.view];
        } else {
          zoomedImgSrc = PRODUCTS[0].images['Negro'];
        }
        
        const currentIndex = lightboxImage.type === 'tshirt'
          ? tshirtImagesList.findIndex(item => item.color === lightboxImage.color && item.view === lightboxImage.view)
          : 0;
        
        return (
          <div 
            className="lightbox-overlay" 
            onClick={(e) => {
              if (isDragging.current) {
                e.stopPropagation();
                return;
              }
              setLightboxImage(null);
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
          >
            <button 
              className="lightbox-close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
              aria-label="Cerrar imagen completa"
            >
              <X size={28} />
            </button>
            <div className="lightbox-content">
              <PremiumImageDisplay 
                src={zoomedImgSrc} 
                localPath={zoomedImgSrc} 
                alt="Ampliación de producto" 
                className="lightbox-image" 
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {lightboxImage.type === 'tshirt' && (
              <>
                {currentIndex > 0 && (
                  <button 
                    className="lightbox-nav-btn prev" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const prevItem = tshirtImagesList[currentIndex - 1];
                      setLightboxImage({ type: 'tshirt', color: prevItem.color, view: prevItem.view });
                      setActiveColor(prevItem.color);
                      setActiveView(prevItem.view);
                    }}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={36} />
                  </button>
                )}
                {currentIndex < tshirtImagesList.length - 1 && (
                  <button 
                    className="lightbox-nav-btn next" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextItem = tshirtImagesList[currentIndex + 1];
                      setLightboxImage({ type: 'tshirt', color: nextItem.color, view: nextItem.view });
                      setActiveColor(nextItem.color);
                      setActiveView(nextItem.view);
                    }}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={36} />
                  </button>
                )}
                <div 
                  className="lightbox-counter" 
                  onClick={(e) => e.stopPropagation()}
                  style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', userSelect: 'none', backdropFilter: 'blur(10px)', zIndex: '20' }}
                >
                  <span style={{ fontSize: '0.8rem' }}>
                    {lightboxImage.color} - {lightboxImage.view === 'front' ? 'Frente' : 'Espalda'}
                  </span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    ({currentIndex + 1} / {tshirtImagesList.length})
                  </span>
                </div>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default Merch;
