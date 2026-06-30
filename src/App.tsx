import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    // Mulai animasi fade-out setelah 1.5 detik
    const timer = setTimeout(() => setFadeSplash(true), 1500);
    // Hapus elemen dari DOM setelah 2 detik
    const timer2 = setTimeout(() => setShowSplash(false), 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      {showSplash && (
        <div className={`splash-screen ${fadeSplash ? 'fade-out' : ''}`}>
          <div className="splash-content">
            <img src="/logo-51x61.png" alt="The Gesit Companies" className="splash-logo" />
            <h1 className="splash-title">Health Talk</h1>
            <div className="splash-loader"></div>
          </div>
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
