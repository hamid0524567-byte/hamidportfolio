import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogIn, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { toast } from 'sonner';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled. Please complete the sign-in process.');
      } else if (error.code === 'auth/blocked-at-popup-parent') {
        toast.error('Popup blocked by browser. Please allow popups for this site.');
      } else {
        toast.error('Login failed: ' + error.message);
      }
    }
  };
  const logout = () => signOut(auth);

  const navLinks = [
    { name: 'About', href: '/#about' },
    { name: 'Experience', href: '/#experience' },
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#022c22]/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              Hamid<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="font-medium text-white/60 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#022c22] border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-white/60 font-medium hover:bg-white/5 rounded-xl"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
