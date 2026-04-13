import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, auth, googleProvider } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2, Edit2, Layout, Video, Image as ImageIcon, LogOut, Loader2, Upload, Settings as SettingsIcon, Briefcase, MessageSquare, CheckCircle, Clock, ExternalLink, LayoutDashboard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { getGoogleDriveUrl, getThumbnailUrl } from '../lib/utils';

const projectSchema = z.object({
  category: z.enum(["Design", "Video"]),
  driveFileId: z.string().min(1, "Drive Link is required"),
});

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().optional(),
});

const settingsSchema = z.object({
  heroImageId: z.string().optional(),
  cvLink: z.string().optional(),
  yearsExperience: z.string().optional(),
  projectsDone: z.string().optional(),
  happyClients: z.string().optional(),
  aboutImage1: z.string().optional(),
  aboutImage2: z.string().optional(),
  aboutImage3: z.string().optional(),
  aboutImage4: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;
type ExperienceForm = z.infer<typeof experienceSchema>;
type SettingsForm = z.infer<typeof settingsSchema>;

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'experience' | 'settings' | 'messages'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const projectForm = useForm<ProjectForm>({ resolver: zodResolver(projectSchema), defaultValues: { category: "Design" } });
  const experienceForm = useForm<ExperienceForm>({ resolver: zodResolver(experienceSchema) });
  const settingsForm = useForm<SettingsForm>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (!isAdmin) return;

    const projectsUnsubscribe = onSnapshot(query(collection(db, "projects"), orderBy("createdAt", "desc")), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const expUnsubscribe = onSnapshot(query(collection(db, "experience"), orderBy("createdAt", "desc")), (snapshot) => {
      setExperiences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const messagesUnsubscribe = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const settingsUnsubscribe = onSnapshot(doc(db, "siteSettings", "main"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings(data);
        settingsForm.reset(data as any);
      }
    });

    return () => {
      projectsUnsubscribe();
      expUnsubscribe();
      messagesUnsubscribe();
      settingsUnsubscribe();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const onProjectSubmit = async (data: ProjectForm) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success("Project updated");
      } else {
        await addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp(), order: projects.length });
        toast.success("Project added");
      }
      projectForm.reset();
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "projects");
    }
  };

  const onExperienceSubmit = async (data: ExperienceForm) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "experience", editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success("Experience updated");
      } else {
        await addDoc(collection(db, "experience"), { ...data, createdAt: serverTimestamp() });
        toast.success("Experience added");
      }
      experienceForm.reset();
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "experience");
    }
  };

  const onSettingsSubmit = async (data: SettingsForm) => {
    try {
      await setDoc(doc(db, "siteSettings", "main"), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      toast.success("Settings updated");
    } catch (error: any) {
      console.error("Settings save error:", error);
      toast.error("Failed to save settings. Check console for details.");
    }
  };

  // Debug form errors
  useEffect(() => {
    if (Object.keys(settingsForm.formState.errors).length > 0) {
      console.log("Form Errors:", settingsForm.formState.errors);
    }
  }, [settingsForm.formState.errors]);

  const deleteItem = async (collectionName: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${collectionName}?`)) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success(`${collectionName} deleted`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, collectionName);
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "messages", id), { status });
      toast.success("Message status updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "messages");
    }
  };

  if (authLoading) return <div className="flex items-center justify-center h-screen text-white"><Loader2 className="animate-spin" /></div>;
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Login</h1>
          <p className="text-white/60 mb-8">Access restricted to authorized personnel only.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-accent text-emerald-900 font-bold py-4 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-red-400 mb-8">You do not have administrator privileges.</p>
          <button onClick={handleLogout} className="text-white/60 hover:text-white underline">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-emerald-900">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-white/40 text-sm">Welcome back, {user.displayName}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {[
              { id: 'projects', icon: Layout, label: 'Projects' },
              { id: 'experience', icon: Briefcase, label: 'Experience' },
              { id: 'messages', icon: MessageSquare, label: 'Messages' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsAdding(false); setEditingId(null); }} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium ${
                  activeTab === tab.id ? 'bg-accent text-emerald-900 shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
            <button onClick={handleLogout} className="ml-2 p-2.5 text-white/40 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Projects</h2>
              <button onClick={() => { setIsAdding(true); setEditingId(null); projectForm.reset(); }} className="flex items-center gap-2 bg-accent text-emerald-900 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                <Plus size={20} /> Add Project
              </button>
            </div>
            <AnimatePresence>
              {isAdding && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                  <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Project" : "New Project"}</h2>
                  <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium text-white/40 mb-2">Category</label>
                        <select {...projectForm.register("category")} className="w-full bg-[#064e3b] border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition">
                          <option value="Design">Graphic Design</option>
                          <option value="Video">Video Editing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/40 mb-2">Drive Link / URL</label>
                        <input {...projectForm.register("driveFileId")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="Paste Google Drive Link or YouTube URL" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6">
                      <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-white/60 hover:text-white transition">Cancel</button>
                      <button type="submit" className="bg-accent text-emerald-900 px-8 py-3 rounded-2xl font-bold shadow-lg shadow-accent/10 hover:scale-105 transition-all">Save Project</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <div key={p.id} className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden group hover:border-accent/30 transition-all">
                  <div className="aspect-video bg-black/40 relative">
                    <img 
                      src={getThumbnailUrl(p.driveFileId)} 
                      alt="Preview" 
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=No+Preview';
                      }}
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <button onClick={() => { setEditingId(p.id); projectForm.reset(p); setIsAdding(true); }} className="p-3 bg-white text-emerald-900 rounded-2xl shadow-xl hover:scale-110 transition"><Edit2 size={18} /></button>
                      <button onClick={() => deleteItem("projects", p.id)} className="p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-white/40 mb-1">{p.category}</p>
                    <p className="text-xs text-white/20 truncate">{p.driveFileId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Experience</h2>
              <button onClick={() => { setIsAdding(true); setEditingId(null); experienceForm.reset(); }} className="flex items-center gap-2 bg-accent text-emerald-900 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                <Plus size={20} /> Add Experience
              </button>
            </div>
            <AnimatePresence>
              {isAdding && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                  <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Experience" : "New Experience"}</h2>
                  <form onSubmit={experienceForm.handleSubmit(onExperienceSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div><label className="block text-sm font-medium text-white/40 mb-2">Company</label><input {...experienceForm.register("company")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" /></div>
                      <div><label className="block text-sm font-medium text-white/40 mb-2">Role</label><input {...experienceForm.register("role")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">Period</label><input {...experienceForm.register("period")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" /></div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">Description</label><textarea {...experienceForm.register("description")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" rows={4} /></div>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-white/60 hover:text-white transition">Cancel</button><button type="submit" className="bg-accent text-emerald-900 px-8 py-3 rounded-2xl font-bold shadow-lg shadow-accent/10 hover:scale-105 transition-all">Save Experience</button></div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white/5 p-8 rounded-3xl border border-white/10 flex justify-between items-center hover:border-white/20 transition-all">
                  <div><h3 className="font-bold text-xl mb-1">{exp.role}</h3><p className="text-accent font-medium">{exp.company} | {exp.period}</p></div>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingId(exp.id); experienceForm.reset(exp); setIsAdding(true); }} className="p-3 text-white/60 hover:text-accent hover:bg-white/5 rounded-2xl transition-all"><Edit2 size={24} /></button>
                    <button onClick={() => deleteItem("experience", exp.id)} className="p-3 text-white/60 hover:text-red-400 hover:bg-white/5 rounded-2xl transition-all"><Trash2 size={24} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Inbound Messages</h2>
            <div className="grid grid-cols-1 gap-6">
              {messages.length === 0 ? (
                <div className="bg-white/5 p-12 rounded-3xl border border-white/10 text-center text-white/40">No messages yet.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`bg-white/5 p-8 rounded-3xl border transition-all ${msg.status === 'new' ? 'border-accent/40 bg-accent/5' : 'border-white/10'}`}>
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          {msg.status === 'new' ? <Clock className="text-accent" size={20} /> : <CheckCircle className="text-green-500" size={20} />}
                          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${msg.status === 'new' ? 'bg-accent/20 text-accent' : 'bg-green-500/20 text-green-500'}`}>{msg.status}</span>
                          <span className="text-white/40 text-sm">{msg.createdAt?.toDate().toLocaleString()}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{msg.subject || "No Subject"}</h3>
                          <p className="text-accent font-medium">{msg.name} ({msg.email})</p>
                        </div>
                        <p className="text-white/80 leading-relaxed bg-black/20 p-6 rounded-2xl border border-white/5">{msg.message}</p>
                      </div>
                      <div className="flex md:flex-col gap-3">
                        {msg.status === 'new' && (
                          <button onClick={() => updateMessageStatus(msg.id, 'read')} className="p-3 bg-green-500 text-white rounded-2xl hover:scale-105 transition-all" title="Mark as Read"><CheckCircle size={20} /></button>
                        )}
                        <button onClick={() => deleteItem("messages", msg.id)} className="p-3 bg-red-500 text-white rounded-2xl hover:scale-105 transition-all" title="Delete Message"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-10">Global Site Settings</h2>
            <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-lg font-bold text-accent flex items-center gap-2"><Layout size={20} /> Hero Section</h3>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-medium text-white/40 mb-2">Profile Image ID / URL</label><input {...settingsForm.register("heroImageId")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="Paste Google Drive File ID" /></div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">CV Download Link (Drive)</label><input {...settingsForm.register("cvLink")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="Paste Google Drive CV Link" /></div>
                  </div>

                  <h3 className="text-lg font-bold text-accent flex items-center gap-2 pt-8"><Briefcase size={20} /> About Stats</h3>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-medium text-white/40 mb-2">Years of Experience</label><input {...settingsForm.register("yearsExperience")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="e.g., 4+" /></div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">Projects Done</label><input {...settingsForm.register("projectsDone")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="e.g., 150+" /></div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">Happy Clients</label><input {...settingsForm.register("happyClients")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="e.g., 80+" /></div>
                  </div>
                </div>
                <div className="space-y-8">
                  <h3 className="text-lg font-bold text-accent flex items-center gap-2"><ImageIcon size={20} /> About Images (Drive IDs)</h3>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-medium text-white/40 mb-2">About Image 1 (Top Left)</label><input {...settingsForm.register("aboutImage1")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="Paste Google Drive File ID" /></div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">About Image 2 (Bottom Left)</label><input {...settingsForm.register("aboutImage2")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="Paste Google Drive File ID" /></div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">About Image 3 (Top Right)</label><input {...settingsForm.register("aboutImage3")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="Paste Google Drive File ID" /></div>
                    <div><label className="block text-sm font-medium text-white/40 mb-2">About Image 4 (Bottom Right)</label><input {...settingsForm.register("aboutImage4")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition" placeholder="Paste Google Drive File ID" /></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-8 border-t border-white/10"><button type="submit" className="bg-accent text-emerald-900 px-12 py-4 rounded-2xl font-bold shadow-xl shadow-accent/10 hover:scale-105 transition-all">Save All Settings</button></div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
