import { Link } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';
import './Footer.css';

const InstagramIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const YoutubeIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-grid">
          
          <div className="footer-col">
            <div className="footer-logo">
              <span className="logo-text text-gradient">OneTwentyone</span>
              <span className="logo-subtext">Ministerio de Jóvenes ICC</span>
            </div>
            <p className="footer-description">
              Nuestro anhelo: generaciones con una profunda relación con el Padre, viviendo el propósito de Dios para sus vidas.
            </p>
            <div className="social-links">
              <a href="https://www.instagram.com/onetwentyoneicc/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <InstagramIcon size={20} />
              </a>
              <a href="https://www.facebook.com/convertidosacristo" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FacebookIcon size={20} />
              </a>
              <a href="https://www.youtube.com/@ICCRD" target="_blank" rel="noopener noreferrer" className="social-icon">
                <YoutubeIcon size={20} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Navegación</h3>
            <ul className="footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/actividades">Actividades</Link></li>
              <li><Link to="/registro">Registro Gratis</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/merch">Merch</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Contacto ICC</h3>
            <ul className="footer-contact">
              <li>
                <a 
                  href="https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <MapPin size={18} className="contact-icon" />
                  <span>
                    <strong>Iglesia de Convertidos a Cristo</strong><br/>
                    C/ Dr. Núñez Domínguez #30<br/>
                    Ens. La Julia, Santo Domingo, R.D.
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:info@convertidosacristo.org" className="contact-link">
                  <Mail size={18} className="contact-icon" />
                  <span>info@convertidosacristo.org</span>
                </a>
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <a 
                  href="https://www.convertidosacristo.org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-link-church"
                >
                  Visitar convertidosacristo.org
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} OneTwentyOne | Iglesia de Convertidos a Cristo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
