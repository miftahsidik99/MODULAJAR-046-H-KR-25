import React, { useState, useEffect } from 'react';
import { User, ModuleConfig, UserRole, UserActivity } from './types';
import Auth from './components/Auth';
import ModuleForm from './components/ModuleForm';
import ModulePreview from './components/ModulePreview';
import AdminDashboard from './components/AdminDashboard';
import { generateModuleContent } from './services/geminiService';
import { FileText, LogOut, History, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<ModuleConfig | null>(null);
  const [history, setHistory] = useState<ModuleConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'form' | 'preview' | 'history'>('form');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedHistory = localStorage.getItem('moduleHistory');
    if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Helper to save log
  const logActivity = (u: User, action: string, details: string) => {
    if (u.role === UserRole.ADMIN) return; // Don't log admin actions for now
    
    const newLog: UserActivity = { timestamp: Date.now(), action, details };
    const updatedUser = { 
        ...u, 
        activityLogs: [...(u.activityLogs || []), newLog] 
    };
    
    // Update State
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update Database
    const userKey = `user_${u.username}`;
    if (localStorage.getItem(userKey)) {
        localStorage.setItem(userKey, JSON.stringify(updatedUser));
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    logActivity(loggedInUser, 'LOGIN', 'User berhasil login ke sistem.');
  };

  const handleLogout = () => {
    if (user) {
        logActivity(user, 'LOGOUT', 'User keluar dari sistem.');
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentModule(null);
    setView('form');
  };

  const handleCreateOrUpdateModule = async (config: ModuleConfig) => {
    setIsGenerating(true);
    try {
      let content = config.content;
      
      const newContent = await generateModuleContent(config);
      content = newContent;
      
      const newModule = { ...config, content };
      setCurrentModule(newModule);
      
      let updatedHistory;
      const existingIndex = history.findIndex(h => h.id === config.id);
      
      if (existingIndex >= 0) {
        updatedHistory = [...history];
        updatedHistory[existingIndex] = newModule;
      } else {
        updatedHistory = [newModule, ...history];
      }
      
      setHistory(updatedHistory);
      localStorage.setItem('moduleHistory', JSON.stringify(updatedHistory));
      
      if (user) {
          logActivity(user, 'CREATE_MODULE', `Membuat modul ajar: ${config.subjectName} Kelas ${config.grade}`);
      }

      setView('preview');
    } catch (error) {
      alert("Terjadi kesalahan saat membuat modul. Pastikan API Key valid atau koneksi internet lancar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateModuleFromPreview = (updatedModule: ModuleConfig) => {
      setCurrentModule(updatedModule);
      const updatedHistory = history.map(h => h.id === updatedModule.id ? updatedModule : h);
      setHistory(updatedHistory);
      localStorage.setItem('moduleHistory', JSON.stringify(updatedHistory));
  };
  
  const handleEditFromPreview = () => {
      setView('form');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // --- ADMIN VIEW ---
  if (user.role === UserRole.ADMIN) {
      return <AdminDashboard onLogout={handleLogout} />;
  }

  // --- TEACHER VIEW ---

  // Preview Mode
  if (view === 'preview' && currentModule) {
    return (
        <ModulePreview 
            moduleData={currentModule} 
            onBack={() => setView('form')} 
            onEdit={handleEditFromPreview}
            onUpdate={handleUpdateModuleFromPreview}
        />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-800 hidden sm:block">ModulAjar.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">Halo, <b>{user.name}</b></span>
              <button 
                onClick={() => { setCurrentModule(null); setView('form'); }}
                className={`p-2 rounded-full hover:bg-gray-100 ${view === 'form' && !currentModule ? 'text-indigo-600' : 'text-gray-500'}`}
                title="Buat Baru"
              >
                <PlusCircle />
              </button>
              <button 
                onClick={() => setView('history')}
                className={`p-2 rounded-full hover:bg-gray-100 ${view === 'history' ? 'text-indigo-600' : 'text-gray-500'}`}
                title="Riwayat"
              >
                <History />
              </button>
              <button 
                onClick={handleLogout}
                className="ml-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'history' ? (
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Riwayat Modul Ajar</h2>
                {history.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">Belum ada modul yang dibuat.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {history.map(mod => (
                            <div key={mod.id} className="border rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                                <h3 className="font-bold text-lg text-indigo-900">{mod.subjectName}</h3>
                                <p className="text-sm text-gray-600">Kelas {mod.grade} • {mod.teacherName}</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(mod.createdAt).toLocaleDateString()}</p>
                                <button 
                                    onClick={() => { setCurrentModule(mod); setView('preview'); }}
                                    className="mt-3 w-full bg-white border border-indigo-600 text-indigo-600 text-sm font-medium py-1.5 rounded hover:bg-indigo-50"
                                >
                                    Buka Kembali
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {currentModule ? 'Edit Data Modul Ajar' : 'Buat Modul Ajar Baru'}
                    </h2>
                    <p className="text-gray-600 mt-2">Kurikulum Merdeka Edisi Revisi (CP 2025)</p>
                </div>
                <ModuleForm 
                    userProfile={{
                        name: user.name || '',
                        nip: user.nip || '',
                        jobTitle: 'Guru Kelas',
                        school: user.school || ''
                    }}
                    initialConfig={currentModule}
                    onSubmit={handleCreateOrUpdateModule}
                    isGenerating={isGenerating}
                />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;