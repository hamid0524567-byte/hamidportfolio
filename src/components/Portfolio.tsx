import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Image as ImageIcon, ExternalLink, Play, X } from 'lucide-react';
import { getGoogleDriveUrl, getYouTubeId, getThumbnailUrl } from '../lib/utils';

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All' | 'Design' | 'Video'>('All');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">My Creative Portfolio</h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            A curated collection of my best graphic designs and cinematic video productions.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-16">
          {['All', 'Design', 'Video'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold transition-all text-sm sm:text-base ${
                filter === f 
                  ? 'bg-accent text-emerald-900 shadow-xl shadow-accent/10' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {f === 'Design' ? 'Graphic Design' : f === 'Video' ? 'Video Editing' : 'All Work'}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="break-inside-avoid group relative bg-white/5 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-accent/30 transition-all"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={getThumbnailUrl(project.driveFileId)}
                    alt="Portfolio Project"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=No+Preview';
                    }}
                  />
                  <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-emerald-900 scale-75 group-hover:scale-100 transition-transform duration-300">
                      {project.category === 'Video' ? <Play size={32} fill="currentColor" /> : <ImageIcon size={32} />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project Modal (Lightbox) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full h-full flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button - Fixed Top Right */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white p-3 rounded-full transition-all border border-white/10 shadow-2xl"
              >
                <X size={28} />
              </button>

              {/* Content Area */}
              <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
                {selectedProject.category === 'Video' ? (
                  <div className="w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    {getYouTubeId(selectedProject.driveFileId) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(selectedProject.driveFileId)}?autoplay=1`}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <iframe
                        src={`https://drive.google.com/file/d/${selectedProject.driveFileId}/preview`}
                        className="w-full h-full"
                        allow="autoplay"
                      ></iframe>
                    )}
                  </div>
                ) : (
                  <div className="relative max-w-full">
                    <img 
                      src={getGoogleDriveUrl(selectedProject.driveFileId)}
                      alt="Project Detail"
                      className="max-w-full h-auto object-contain rounded-lg shadow-2xl select-none"
                      referrerPolicy="no-referrer"
                      style={{ maxHeight: '90vh' }}
                    />
                    
                    {/* Floating Info Badge */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-4 whitespace-nowrap">
                      <span className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-accent/20 text-accent border border-accent/30 backdrop-blur-md">
                        {selectedProject.category}
                      </span>
                      {!getYouTubeId(selectedProject.driveFileId) && !selectedProject.driveFileId.startsWith('http') && (
                        <a 
                          href={`https://drive.google.com/file/d/${selectedProject.driveFileId}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all text-xs font-bold"
                        >
                          <ExternalLink size={14} /> View Original
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
