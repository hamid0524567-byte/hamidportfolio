import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import HireMeFAB from './components/HireMeFAB';
import { Toaster } from 'sonner';

function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Portfolio />
      <Contact />
      <HireMeFAB />
      <footer className="text-white/20 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm tracking-widest uppercase">© {new Date().getFullYear()} Hamid Hossen. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
