import React, { useEffect } from 'react';
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

function AppContent() {
  const location = useLocation();
  const isTicketPage = location.pathname.startsWith('/ticket/');

  return (
    <div className="app-container">
      {!isTicketPage && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/actividades" element={<Activities />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/ticket/:code" element={<TicketVerification />} />
        </Routes>
      </main>
      {!isTicketPage && <Footer />}
    </div>
  );
}

function App() {
  useEffect(() => {
    try {
      const now = new Date();
      const targetDate = new Date(2026, 7, 1); // August 1st, 2026
      if (now >= targetDate) {
        document.body.classList.add('yellow-theme');
      }
    } catch (e) {
      console.error("Error setting dynamic yellow theme:", e);
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
