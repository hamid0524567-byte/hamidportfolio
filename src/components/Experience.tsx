import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Calendar } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Experience() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "experience"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExperiences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Work Experience</h2>
          <p className="text-white/60 max-w-2xl mx-auto">My professional journey through agencies and independent creative work.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center text-white/20 py-12">No experience data found.</div>
        ) : (
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-white/10" />

            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-[#022c22] shadow-xl z-10" />

                  <div className={`w-full md:w-1/2 pl-8 md:pl-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:border-accent/30 transition-all shadow-sm hover:shadow-xl group">
                      <div className="flex items-center gap-2 text-accent font-bold mb-3">
                        <Calendar size={16} />
                        <span className="text-sm tracking-widest uppercase">{exp.period}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-accent transition-colors">{exp.role}</h3>
                      <p className="text-lg font-medium text-white/60 mb-4">{exp.company}</p>
                      <p className="text-white/40 leading-relaxed">{exp.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
