import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';

// Pages
import Home from './pages/Home/Home';
import Registration from './pages/Registration/Registration';
import Activities from './pages/Activities/Activities';
import About from './pages/About/About';
import Merch from './pages/Merch/Merch';
import TicketVerification from './pages/TicketVerification/TicketVerification';
import PreOrderMenu from './pages/PreOrderMenu/PreOrderMenu';
import ConfirmAttendance from './pages/ConfirmAttendance/ConfirmAttendance';

function AppContent() {
  const location = useLocation();
  const isTicketPage = location.pathname.startsWith('/ticket/');
  const isPreorderPage = location.pathname.startsWith('/menu-preorden');
  const isConfirmPage = location.pathname.startsWith('/confirmar-asistencia');
  const hideLayout = isTicketPage || isPreorderPage || isConfirmPage;

  return (
    <div className="app-container">

      {/* Background Lightning Bolt */}
      <svg className="bg-animal-stripes lightning-bolt" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M 100,-20 L 250,180 L 150,250 L 500,550 L 380,620 L 750,880 L 650,920 L 950,1020" />
        <path d="M 120,-20 L 270,180 L 170,250 L 520,550 L 400,620 L 770,880 L 670,920 L 970,1020" opacity="0.4" strokeWidth="1" />
        <path d="M 500,550 L 650,620 L 600,700 L 720,780" opacity="0.3" strokeWidth="1.5" />
      </svg>

      {!hideLayout && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/actividades" element={<Activities />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/ticket/:code" element={<TicketVerification />} />
          <Route path="/menu-preorden" element={<PreOrderMenu />} />
          <Route path="/confirmar-asistencia" element={<ConfirmAttendance />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  useEffect(() => {
    const checkTheme = () => {
      try {
        const hash = window.location.hash;
        const now = new Date();
        const targetYellowDate = new Date(2026, 7, 1); // August 1st, 2026
        const targetOrangeDate = new Date(2026, 7, 24); // August 24th, 2026

        // Reset theme classes
        document.body.classList.remove('yellow-theme', 'orange-theme');

        if (hash === '#orange') {
          document.body.classList.add('orange-theme');
        } else if (hash === '#yellow') {
          document.body.classList.add('yellow-theme');
        } else {
          // Automatic date-based selection
          if (now >= targetOrangeDate) {
            document.body.classList.add('orange-theme');
          } else if (now >= targetYellowDate) {
            document.body.classList.add('yellow-theme');
          }
        }
      } catch (e) {
        console.error("Error setting dynamic colors theme:", e);
      }
    };

    checkTheme();
    window.addEventListener('hashchange', checkTheme);
    return () => window.removeEventListener('hashchange', checkTheme);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
