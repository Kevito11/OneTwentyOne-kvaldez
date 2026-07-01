import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Ticket, HelpCircle, X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
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
      "Negro": "/merch/Merch SIN FILTROS gorra 1.jpeg"
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
        front: "/merch/Merch SIN FILTROS Tshirt frontal 6.jpeg",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 6.jpeg"
      },
      "Gris": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 4.jpeg",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 4.jpeg"
      },
      "Blanco": {
        front: "/merch/Merch SIN FILTROS Tshirt frontal 3.jpeg",
        back: "/merch/Merch SIN FILTROS Tshirt atrs 3.jpeg"
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
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        
        <div className="merch-coming-soon-card glass-panel" style={{ padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)' }}>
          <ShoppingBag size={64} style={{ color: 'var(--text-primary)', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.15))' }} />
          
          <span className="subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Colección Oficial
          </span>
          
          <h1 className="title" style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0' }}>
            Mercancía <span className="text-gradient">Próximamente</span>
          </h1>
          
          <p className="description" style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
            Estamos diseñando y preparando la mercancía oficial de la conferencia de jóvenes <strong>"Sin Filtros" 2026</strong>. Muy pronto podrás ver y reservar tus gorras, camisetas y hoodies aquí.
            <br />
            Mantente atento a nuestro Instagram <a href="https://instagram.com/onetwentyone.icc" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}>@onetwentyone.icc</a> para saber cuándo estarán disponibles.
          </p>
          
          <Link to="/" className="btn-primary-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'white', color: 'black', border: '1px solid white', padding: '0.9rem 1.75rem', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', transition: 'all 0.3s ease' }}>
            <ArrowLeft size={18} /> Volver al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Merch;
