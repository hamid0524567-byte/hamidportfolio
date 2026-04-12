import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function HireMeFAB() {
  const [settings, setSettings] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "siteSettings", "main"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    });

    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const whatsapp = settings?.whatsappNumber || "8801828380707";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 right-6 z-[60]"
        >
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2 sm:gap-3 bg-green-500 text-white px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full shadow-2xl shadow-green-500/40 hover:scale-105 transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
            <span className="font-bold text-sm sm:text-base relative z-10">Hire Me</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
