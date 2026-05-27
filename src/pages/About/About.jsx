import React from 'react';
import { Star, MapPin, ExternalLink, Calendar, Users, Shield } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page animate-fade-in section-padding">
      <div className="container">
        
        {/* Intro Section */}
        <section className="about-intro text-center">
          <span className="subtitle">Nuestra Identidad</span>
          <h1 className="title">OneTwenty<span className="text-gradient">One</span></h1>
          <p className="description">
            Somos el ministerio de jóvenes de la <strong>Iglesia Convertidas a Cristo (ICC)</strong>. 
            Nuestro nombre está inspirado en <strong>Filipenses 1:21</strong>: <br />
            <span style={{ color: 'var(--accent-light)', fontStyle: 'italic', display: 'block', marginTop: '1rem', fontSize: '1.4rem', fontWeight: '600' }}>
              "Porque para mí el vivir es Cristo, y el morir es ganancia."
            </span>
          </p>
        </section>

        {/* Vision & Mission Grid */}
        <section className="vision-mission-grid">
          <div className="vm-card glass-panel">
            <div style={{ display: 'inline-flex', padding: '0.8rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-color)', marginBottom: '1.2rem' }}>
              <Shield size={28} />
            </div>
            <h2 className="vm-title">Nuestra Visión</h2>
            <p>
              Ser una generación inquebrantable, firmemente arraigada en las Sagradas Escrituras y la sana doctrina, que viva con pasión por Jesucristo y refleje Su amor y gracia en nuestra sociedad y en el mundo entero.
            </p>
          </div>
          
          <div className="vm-card glass-panel">
            <div style={{ display: 'inline-flex', padding: '0.8rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-blue)', marginBottom: '1.2rem' }}>
              <Users size={28} />
            </div>
            <h2 className="vm-title">Nuestra Misión</h2>
            <p>
              Equipar a los jóvenes con herramientas bíblicas a través del discipulado y la predicación expositiva, para que puedan defender con mansedumbre su fe en un mundo cambiante, crecer en santidad y ser siervos líderes de influencia espiritual en sus hogares, estudios y trabajos.
            </p>
          </div>
        </section>

        {/* The Church Section */}
        <section className="church-section glass-panel">
          <div className="church-content">
            <h2>Nuestra Casa: Iglesia Convertidas a Cristo</h2>
            <p>
              La <strong>Iglesia de Convertidos a Cristo (ICC)</strong> fue fundada el domingo <strong>19 de septiembre de 1982</strong> por el pastor **Arq. José R. Mallén Malla**, quien por gracia de Dios dejó su profesión para dedicarse enteramente al pastoreo y la proclamación del Evangelio. Iniciando en la sala de su propio hogar, la obra creció por la gracia divina y en 1988 se estableció en su local actual en el sector La Julia, en Santo Domingo, República Dominicana.
            </p>
            <p>
              Tras la partida del amado pastor Mallén a la presencia del Señor en junio de 2021, la iglesia continúa fielmente administrada por un fiel cuerpo de pastores y diáconos, manteniendo con celo e integridad su compromiso con la **sana doctrina, la predicación expositiva** y la edificación del cuerpo de Cristo.
            </p>
            <p className="highlight-text">
              Como ministerio "OneTwentyOne" o "Siervos Para Cristo", nuestro firme anhelo es caminar bajo la misma herencia de fidelidad, sirviendo a nuestro Dios bajo la cobertura e instrucción de nuestra amada iglesia local.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <a 
                href="https://www.convertidosacristo.org/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary"
                style={{ fontSize: '0.95rem', padding: '0.8rem 1.8rem' }}
              >
                Sitio Web Oficial de ICC
                <ExternalLink size={16} />
              </a>
              <a 
                href="https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary"
                style={{ fontSize: '0.95rem', padding: '0.8rem 1.8rem' }}
              >
                <MapPin size={16} />
                Cómo Llegar al Templo
              </a>
            </div>
          </div>
        </section>

        {/* Team/Pastors Section */}
        <section className="team-section text-center">
          <h2>Liderazgo & Servicio</h2>
          <p className="team-desc">Conoce a quienes sirven con amor guiando a nuestra juventud en el ministerio.</p>
          
          <div className="team-grid">
            <div className="team-card">
              <div className="team-image-placeholder">
                <Users size={48} />
              </div>
              <h3>Cuerpo Pastoral ICC</h3>
              <p>Cobertura & Dirección Espiritual</p>
            </div>
            
            <div className="team-card">
              <div className="team-image-placeholder">
                <Star size={48} />
              </div>
              <h3>OneTwentyOne Worship</h3>
              <p>Ministerio de Alabanza</p>
            </div>

            <div className="team-card">
              <div className="team-image-placeholder">
                <Calendar size={48} />
              </div>
              <h3>Coordinación SPC</h3>
              <p>Logística, Eventos & Discipulado</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
