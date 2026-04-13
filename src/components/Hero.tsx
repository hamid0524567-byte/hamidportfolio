import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Video, Palette, Image as ImageIcon, PenTool, Zap, Film, Download } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getGoogleDriveUrl, getThumbnailUrl } from '../lib/utils';

export default function Hero() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "siteSettings", "main"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const heroData = {
    name: settings?.heroName || "Hamid Hossen",
    role: settings?.heroRole || "Graphic Designer & Video Editor",
    description: settings?.heroDescription || "I specialize in high-impact graphic design and cinematic video editing that tells a story.",
    imageId: settings?.heroImageId || "",
    whatsapp: settings?.whatsappNumber || "8801828380707",
    cvLink: settings?.cvLink || "#"
  };

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-12 overflow-hidden">
      {/* Background Grid is handled in index.css */}
      
      {/* Atmospheric Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-green/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dark-green/30 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Image Container - First on Mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative flex justify-center w-full lg:w-1/2 order-1 lg:order-2"
            >
              <div className="relative w-full max-w-[280px] sm:max-w-md aspect-square">
                {/* Morphing Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-green to-dark-green animate-morph opacity-40 blur-2xl" />
                
                <div className="relative z-10 w-full h-full p-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/10 animate-morph shadow-2xl">
                    {heroData.imageId ? (
                      <img 
                        src={getGoogleDriveUrl(heroData.imageId)} 
                        alt={heroData.name} 
                        className="w-full h-full object-cover scale-110"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${heroData.imageId}/800/800`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <ImageIcon className="text-white/10 w-12 h-12" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Software Icons */}
                {[
                  { Icon: ImageIcon, color: "bg-blue-500", delay: 0, top: "10%", left: "-5%" },
                  { Icon: PenTool, color: "bg-orange-500", delay: 1, top: "60%", left: "-10%" },
                  { Icon: Zap, color: "bg-purple-500", delay: 2, top: "5%", right: "0%" },
                  { Icon: Film, color: "bg-red-500", delay: 3, bottom: "10%", right: "-5%" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      delay: item.delay 
                    }}
                    style={{ 
                      position: 'absolute',
                      top: item.top,
                      left: item.left,
                      right: item.right,
                      bottom: item.bottom
                    }}
                    className="z-20"
                  >
                    <div className={`p-3 sm:p-4 rounded-2xl ${item.color} text-white shadow-lg backdrop-blur-md border border-white/20`}>
                      <item.Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1"
            >
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-green-500 uppercase tracking-widest">Available for projects</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
                {heroData.name}
              </h1>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                  <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-base sm:text-lg md:text-xl font-medium text-accent">
                  {heroData.role}
                </span>
              </div>

              <p className="text-base sm:text-lg text-white/60 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {heroData.description}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6">
                <a 
                  href="#portfolio" 
                  className="bg-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-emerald-600/20"
                >
                  View My Work <ArrowRight size={20} />
                </a>
                <a 
                  href={`https://wa.me/${heroData.whatsapp}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 backdrop-blur-md text-white border border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
                >
                  Let's Talk
                </a>
                {heroData.cvLink !== "#" && (
                  <a 
                    href={getGoogleDriveUrl(heroData.cvLink)} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 backdrop-blur-md text-white border border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <Download size={20} /> CV
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
