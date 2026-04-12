import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Facebook, Instagram, Send, Loader2 } from 'lucide-react';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { toast } from 'sonner';

export default function Contact() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "siteSettings", "main"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const contactData = {
    email: settings?.contactEmail || "hamid0524567@gmail.com",
    phone: settings?.contactPhone || "+880 1828-380707",
    whatsapp: settings?.whatsappNumber || "8801828380707",
    facebook: settings?.facebookUrl || "https://www.facebook.com/hamid.hossain.108/",
    instagram: settings?.instagramUrl || "https://www.instagram.com/hamid.hossain.108"
  };

  const socialLinks = [
    { name: "WhatsApp", icon: <Phone size={24} />, link: `https://wa.me/${contactData.whatsapp}`, color: "bg-green-500" },
    { name: "Facebook", icon: <Facebook size={24} />, link: contactData.facebook, color: "bg-blue-600" },
    { name: "Instagram", icon: <Instagram size={24} />, link: contactData.instagram, color: "bg-pink-600" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp()
      });
      toast.success("Message sent successfully!");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "messages");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/10 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-dark-green/20 rounded-full blur-[120px] -ml-48 -mb-48" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Let's Work Together</h2>
            <p className="text-white/60 text-lg mb-12 max-w-md">
              Have a project in mind? I'm always open to discussing new creative opportunities and collaborations.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-accent border border-white/10">
                  <Mail size={28} />
                </div>
                <div>
                  <p className="text-sm text-white/40">Email Me</p>
                  <p className="text-xl font-bold">{contactData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-accent border border-white/10">
                  <Phone size={28} />
                </div>
                <div>
                  <p className="text-sm text-white/40">Call Me</p>
                  <p className="text-xl font-bold">{contactData.phone}</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-sm text-white/40 mb-4 font-medium uppercase tracking-widest">Follow Me</p>
              <div className="flex gap-4">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:rotate-6 ${social.color}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/40 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition text-white" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/40 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition text-white" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition text-white" 
                  placeholder="Project Inquiry" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition text-white" 
                  rows={5} 
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <span>Send Message</span>} <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
