import { MapPin, ExternalLink, Users, Shield } from 'lucide-react';
import { getImageUrl } from '../../config/images';
import './About.css';

const About = () => {
  const pastors = [
    {
      name: "Pr. Luis Valdera Cáceres",
      role: "Pastor",
      image: getImageUrl("/pastores/Pr-Luis-Valdera-Sept-2024.jpg"),
      initials: "LV"
    },
    {
      name: "Pr. Narciso Nadal Ortíz",
      role: "Pastor",
      image: getImageUrl("/pastores/Pr-Narciso-Nadal-Sept-2024.jpg"),
      initials: "NN"
    },
    {
      name: "Pr. Santiago Peralta",
      role: "Pastor",
      image: getImageUrl("/pastores/Pr-Santiago-Peralta-Sept-2024.jpg"),
      initials: "SP"
    }
  ];

  return (
    <div className="about-page animate-fade-in section-padding">
      <div className="container">

        {/* Intro Section */}
        <section className="about-intro text-center">
          <span className="subtitle">Nuestra Identidad</span>
          <h1 className="title">Jóvenes <span className="text-gradient">ICC</span></h1>
          <p className="description">
            Somos el ministerio de jóvenes de la <strong>Iglesia De Convertidos a Cristo (ICC)</strong>.
            Integramos dos grupos enfocados en diferentes etapas de la juventud:
            <strong> Jóvenes Para Cristo (JPC)</strong> para adolescentes y
            <strong> Siervos Para Cristo (OneTwentyOne)</strong> para jóvenes adultos.
            Ambos compartimos el anhelo de vivir bajo el lema inspirado en <strong>Filipenses 1:21</strong>: <br />
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
            <h2>Nuestra Casa: Iglesia De Convertidos a Cristo</h2>
            <p>
              La <strong>Iglesia De Convertidos a Cristo (ICC)</strong> fue fundada el domingo <strong>19 de septiembre de 1982</strong> por el pastor **Arq. José R. Mallén Malla**, quien por gracia de Dios dejó su profesión para dedicarse enteramente al pastoreo y la proclamación del Evangelio. Iniciando en la sala de su propio hogar, la obra creció por la gracia divina y en 1988 se estableció en su local actual en el sector La Julia, en Santo Domingo, República Dominicana.
            </p>
            <p>
              Tras la partida del amado pastor Mallén a la presencia del Señor en junio de 2021, la iglesia continúa fielmente administrada por un fiel cuerpo de pastores y diáconos, manteniendo con celo e integridad su compromiso con la **sana doctrina, la predicación expositiva** y la edificación del cuerpo de Cristo. Todas las prédicas de los domingos se suben a nuestro canal oficial de YouTube para la edificación de la iglesia.
            </p>
            <p className="highlight-text">
              Como Ministerio de Jóvenes ICC, que reúne a los grupos "JPC" (Jóvenes Para Cristo) y "OneTwentyOne" (Siervos Para Cristo), nuestro firme anhelo es caminar bajo la misma herencia de fidelidad, sirviendo a nuestro Dios bajo la cobertura e instrucción de nuestra amada iglesia local.
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
                href="https://www.youtube.com/@ICCRD"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.95rem', padding: '0.8rem 1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.05)' }}
              >
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </span>
                Prédicas en YouTube
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
          <h2>Nuestros Pastores</h2>
          <p className="team-desc">Conoce al cuerpo pastoral de nuestra iglesia que nos guía, aconseja e instruye en la sana doctrina.</p>

          <div className="team-grid">
            {pastors.map((pastor, idx) => (
              <div key={idx} className="team-card">
                {pastor.image ? (
                  <img src={pastor.image} alt={pastor.name} className="team-member-img" />
                ) : (
                  <div className="team-image-placeholder">
                    {pastor.initials}
                  </div>
                )}
                <h3>{pastor.name}</h3>
                <p>{pastor.role}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
