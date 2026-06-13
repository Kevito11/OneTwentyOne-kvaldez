import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Actividades', path: '/actividades' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Merch', path: '/merch' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text text-gradient">OneTwentyone</span>
          <span className="logo-subtext">I C C</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/registro" className="nav-btn">
            Registro
          </Link>
        </div>

        {/* Mobile Menu Button */}
        {!mobileMenuOpen && (
          <button 
            className="mobile-menu-btn mobile-only"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={28} />
          </button>
        )}
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button 
          className="mobile-menu-close-btn mobile-only"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          <X size={32} />
        </button>
        <div className="mobile-menu-content">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/registro" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-btn">
            Registro
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
