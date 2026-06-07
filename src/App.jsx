import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home/Home';
import Registration from './pages/Registration/Registration';
import Activities from './pages/Activities/Activities';
import About from './pages/About/About';

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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
