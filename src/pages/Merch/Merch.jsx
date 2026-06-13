import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import './Merch.css';

const Merch = () => {
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
