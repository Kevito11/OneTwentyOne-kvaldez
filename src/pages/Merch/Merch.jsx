import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import capImg from '../../assets/merch/cap.png';
import capGreyImg from '../../assets/merch/cap_grey.png';
import tshirtImg from '../../assets/merch/tshirt.png';
import tshirtWhiteImg from '../../assets/merch/tshirt_white.png';
import hoodieImg from '../../assets/merch/hoodie.png';
import hoodieCharcoalImg from '../../assets/merch/hoodie_charcoal.png';
import './Merch.css';

const Merch = () => {
  const [selectedProductOptions, setSelectedProductOptions] = useState({
    1: { color: 'Negro', size: 'Única' },
    2: { color: 'Negro', size: 'M' },
    3: { color: 'Negro', size: 'L' },
  });

  const products = [
    {
      id: 1,
      name: "Gorra \"Sin Filtros\"",
      price: 500,
      images: {
        "Negro": capImg,
        "Gris": capGreyImg
      },
      description: "Gorra de béisbol de alta calidad (dad hat) en algodón lavado. Bordada en hilo blanco de alta densidad con el logo de la conferencia 'SIN FILTROS'. Ajustable y cómoda.",
      colors: ["Negro", "Gris"],
      sizes: ["Única"]
    },
    {
      id: 2,
      name: "Camiseta \"Sin Filtros\"",
      price: 700,
      images: {
        "Negro": tshirtImg,
        "Blanco Roto": tshirtWhiteImg
      },
      description: "Camiseta de corte oversized confeccionada en algodón pesado de 240g. Cuenta con cuello ancho y un estampado frontal minimalista en serigrafía de alta duración.",
      colors: ["Negro", "Blanco Roto"],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: 3,
      name: "Hoodie \"Sin Filtros\"",
      price: 1200,
      images: {
        "Negro": hoodieImg,
        "Gris Carbón": hoodieCharcoalImg
      },
      description: "Abrigo estilo sudadera con capucha premium, tacto ultra-suave y forro térmico. Diseño minimalista estampado en el pecho y puños reforzados. Ideal para el clima templado.",
      colors: ["Negro", "Gris Carbón"],
      sizes: ["S", "M", "L", "XL"]
    }
  ];

  const handleOptionChange = (productId, type, value) => {
    setSelectedProductOptions(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }));
  };

  return (
    <div className="merch-page animate-fade-in section-padding">
      <div className="container">
        
        {/* Header Hero Section */}
        <header className="merch-header text-center">
          <span className="subtitle">Colección Oficial</span>
          <h1 className="title">Sin Filtros <span className="text-gradient">Merch</span></h1>
          <p className="description" style={{ marginBottom: '1.5rem' }}>
            Explora la colección oficial de artículos para la conferencia de jóvenes <strong>"Sin Filtros" 2026</strong>.
          </p>
          
          {/* Banner de Aviso de Reserva */}
          <div className="merch-notice-banner glass-panel animate-fade-in" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '15px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)' }}>
            <span style={{ fontSize: '1rem', textAlign: 'center', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <strong>⚠️ Nota Importante:</strong> Para reservar cualquiera de estos artículos oficiales, debes hacerlo al momento de completar tu <strong>registro de la actividad</strong>.
            </span>
            <Link to="/registro" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', borderRadius: '12px', fontWeight: '800', background: 'var(--accent-gradient)', color: 'black', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(255,255,255,0.1)' }}>
              Ir al Registro de la Actividad <ArrowRight size={18} />
            </Link>
          </div>
        </header>

        {/* Products Grid */}
        <section className="products-grid">
          {products.map(product => {
            const currentOptions = selectedProductOptions[product.id];
            return (
              <div key={product.id} className="product-card glass-panel">
                <div className="product-image-container">
                  <img src={product.images[currentOptions.color] || product.images["Negro"]} alt={product.name} className="product-image" />
                </div>
                
                <div className="product-info">
                  <div className="product-header">
                    <h2 className="product-title">{product.name}</h2>
                    <span className="product-price">RD$ {product.price.toLocaleString()}</span>
                  </div>
                  
                  <p className="product-desc">{product.description}</p>
                  
                  {/* Option Selector: Colors */}
                  <div className="product-option-group">
                    <span className="option-label">Color: <span className="option-selected-val">{currentOptions.color}</span></span>
                    <div className="color-options">
                      {product.colors.map(col => (
                        <button
                          key={col}
                          className={`color-dot-btn ${col === currentOptions.color ? 'active' : ''}`}
                          style={{
                            backgroundColor: col === 'Negro' ? '#121212' : 
                                            col === 'Blanco Roto' ? '#f5f5f5' : 
                                            col === 'Gris Carbón' || col === 'Gris' ? '#555555' : '#888888',
                            border: col === 'Blanco Roto' ? '1px solid #777' : '1px solid rgba(255,255,255,0.2)'
                          }}
                          onClick={() => handleOptionChange(product.id, 'color', col)}
                          title={col}
                        >
                          {col === currentOptions.color && <Check size={12} color={col === 'Blanco Roto' ? '#000000' : '#ffffff'} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option Selector: Sizes */}
                  {product.sizes.length > 1 && (
                    <div className="product-option-group">
                      <span className="option-label">Talla:</span>
                      <div className="size-options">
                        {product.sizes.map(sz => (
                          <button
                            key={sz}
                            className={`size-chip-btn ${sz === currentOptions.size ? 'active' : ''}`}
                            onClick={() => handleOptionChange(product.id, 'size', sz)}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buy Redirection button */}
                  <div className="product-purchase-row" style={{ display: 'flex', justifyContent: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '1.2rem', marginTop: '0.8rem' }}>
                    <Link to="/registro" className="add-to-cart-btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '10px', fontWeight: '700', transition: 'all 0.3s ease' }}>
                      Reservar en el Registro
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
};

export default Merch;
