import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home/Home';
import Registration from './pages/Registration/Registration';
import Activities from './pages/Activities/Activities';
import About from './pages/About/About';
import Merch from './pages/Merch/Merch';
import TicketVerification from './pages/TicketVerification/TicketVerification';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
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
        <Footer />
      </div>
    </Router>
  );
}

export default App;
