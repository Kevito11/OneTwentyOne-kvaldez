import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import './Activities.css';

const Activities = () => {
  const activities = [
    {
      id: 1,
      title: "Reunión General de Jóvenes",
      date: "Todos los Viernes",
      time: "7:30 PM",
      location: "Salón Principal ICC",
      mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
      description: "Nuestro punto de encuentro principal. Un tiempo especial de alabanza, predicación expositiva de la Palabra de Dios y un espacio excelente para la comunión y el crecimiento en comunidad.",
      tag: "General"
    },
    {
      id: 2,
      title: "Grupos Pequeños (Células)",
      date: "Miércoles Semanales",
      time: "8:00 PM",
      location: "Diferentes hogares (Santo Domingo)",
      mapLink: null,
      description: "Estudio bíblico aplicado y discipulado en grupos pequeños e íntimos organizados por sectores, para crecer espiritualmente en confianza, apoyo mutuo y rendición de cuentas.",
      tag: "Discipulado"
    },
    {
      id: 3,
      title: "OneTwentyOne Worship Night",
      date: "Último viernes del mes",
      time: "8:00 PM",
      location: "Salón Principal ICC",
      mapLink: "https://maps.app.goo.gl/jRX8PC4S3oVrPMQz6",
      description: "Una noche de adoración comunitaria extendida a cargo de la banda OneTwentyOne Worship, enfocada en la oración, la exaltación al nombre de Jesús y la consagración personal.",
      tag: "Especial"
    }
  ];

  return (
    <div className="activities-page animate-fade-in section-padding">
      <div className="container">
        
        <div className="page-header text-center">
          <span className="subtitle">Comunidad Activa</span>
          <h1 className="title">Nuestras <span className="text-gradient">Actividades</span></h1>
          <p className="description">
            No somos solo un evento anual, somos una familia de fe que camina unida. Encuentra tu lugar y acompáñanos en nuestras reuniones semanales.
          </p>
        </div>

        <div className="activities-grid">
          {activities.map(activity => (
            <div key={activity.id} className="activity-card glass-panel">
              <div className="activity-tag">{activity.tag}</div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-desc">{activity.description}</p>
              
              <div className="activity-details">
                <div className="detail-item">
                  <Calendar size={18} className="detail-icon" />
                  <span>{activity.date}</span>
                </div>
                <div className="detail-item">
                  <Clock size={18} className="detail-icon" />
                  <span>{activity.time}</span>
                </div>
                <div className="detail-item">
                  {activity.mapLink ? (
                    <a 
                      href={activity.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'inherit' }}
                      className="nav-link"
                    >
                      <MapPin size={18} className="detail-icon" />
                      <span style={{ textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {activity.location} <ExternalLink size={12} style={{ opacity: 0.7 }} />
                      </span>
                    </a>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <MapPin size={18} className="detail-icon" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Activities;
