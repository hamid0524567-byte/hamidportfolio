import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getGoogleDriveUrl } from '../lib/utils';

export default function About() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "siteSettings", "main"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const aboutText = settings?.aboutText || "I am a passionate Graphic Designer and Video Editor with over 4 years of combined experience. My journey started at the Alhaj Shamsul Hoque Foundation, where I honed my skills for 2 years before transitioning into a successful freelance career.";

  const stats = [
    { label: "Years Experience", value: settings?.yearsExperience || "4+" },
    { label: "Projects Done", value: settings?.projectsDone || "150+" },
    { label: "Happy Clients", value: settings?.happyClients || "80+" },
    { label: "Awards Won", value: "5" },
  ];

  const aboutImages = [
    settings?.aboutImage1 ? getGoogleDriveUrl(settings.aboutImage1) : "https://picsum.photos/seed/design1/400/500",
    settings?.aboutImage2 ? getGoogleDriveUrl(settings.aboutImage2) : "https://picsum.photos/seed/video1/400/300",
    settings?.aboutImage3 ? getGoogleDriveUrl(settings.aboutImage3) : "https://picsum.photos/seed/video2/400/300",
    settings?.aboutImage4 ? getGoogleDriveUrl(settings.aboutImage4) : "https://picsum.photos/seed/design2/400/500",
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 text-center lg:text-left"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">About Me</h2>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {aboutText}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="bg-accent/10 p-3 rounded-xl text-accent">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Education</h4>
                  <p className="text-sm text-white/40">Honors Graduate, National University</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="bg-accent/10 p-3 rounded-xl text-accent">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Location</h4>
                  <p className="text-sm text-white/40">Chandgaon, Chittagong, Bangladesh</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pt-8 border-t border-white/10">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl sm:text-3xl font-bold text-accent">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <img src={aboutImages[0]} alt="Design Work" className="rounded-[2rem] w-full aspect-[4/5] object-cover shadow-2xl border border-white/10" referrerPolicy="no-referrer" />
              <img src={aboutImages[1]} alt="Video Work" className="rounded-[2rem] w-full aspect-[4/3] object-cover shadow-2xl border border-white/10" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-4 pt-12">
              <img src={aboutImages[2]} alt="Video Work" className="rounded-[2rem] w-full aspect-[4/3] object-cover shadow-2xl border border-white/10" referrerPolicy="no-referrer" />
              <img src={aboutImages[3]} alt="Design Work" className="rounded-[2rem] w-full aspect-[4/5] object-cover shadow-2xl border border-white/10" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
