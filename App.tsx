import React, { useState, useEffect } from 'react';
import { User, ModuleConfig, UserRole, UserActivity } from './types';
import Auth from './components/Auth';
import ModuleForm from './components/ModuleForm';
import ModulePreview from './components/ModulePreview';
import AdminDashboard from './components/AdminDashboard';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import { generateModuleContent } from './services/geminiService';
import { FileText, LogOut, History, PlusCircle, Lock, Save } from 'lucide-react';

type AppState = 'SPLASH' | 'LANDING' | 'APP';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('SPLASH');
  
  const [user, setUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<ModuleConfig | null>(null);
  const [history, setHistory] = useState<ModuleConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'form' | 'preview' | 'history'>('form');

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // --- CRITICAL FIX: Validate Session ---
        // If username is 'admin' but role is NOT 'ADMIN', it's a corrupted/old session.
        // Force logout to allow proper admin login.
        if (parsedUser.username === 'admin' && parsedUser.role !== UserRole.ADMIN) {
            console.warn("Corrupted admin session detected. Forcing logout.");
            localStorage.removeItem('currentUser');
            setUser(null);
        } else {
            setUser(parsedUser);
        }
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    const savedHistory = localStorage.getItem('moduleHistory');
    if (savedHistory) {
        try {
            setHistory(JSON.parse(savedHistory));
        } catch(e) { /* ignore */ }
    }
  }, []);

  // Helper to save log
  const logActivity = (u: User, action: string, details: string) => {
    if (u.role === UserRole.ADMIN) return; // Don't log admin actions
    
    const newLog: UserActivity = { timestamp: Date.now(), action, details };
    const updatedUser = { 
        ...u, 
        activityLogs: [...(u.activityLogs || []), newLog] 
    };
    
    // Update State (if it matches current user)
    if (user && user.username === u.username) {
         setUser(updatedUser);
         localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    // Update Database
    const userKey = `user_${u.username}`;
    if (localStorage.getItem(userKey)) {
        const dbUser = JSON.parse(localStorage.getItem(userKey) || '{}');
        const mergedUser = { ...dbUser, activityLogs: updatedUser.activityLogs };
        localStorage.setItem(userKey, JSON.stringify(mergedUser));
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    // Only log activity for non-admins
    if (loggedInUser.role !== UserRole.ADMIN) {
        logActivity(loggedInUser, 'LOGIN', 'User berhasil login ke sistem.');
    }
  };

  const handleLogout = () => {
    if (user && user.role !== UserRole.ADMIN) {
        logActivity(user, 'LOGOUT', 'User keluar dari sistem.');
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentModule(null);
    setView('form');
    setNewPassword('');
    setConfirmPassword('');
    // Note: We stay in 'APP' state, user sees Auth screen again.
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 6) {
          alert("Password minimal 6 karakter.");
          return;
      }
      if (newPassword !== confirmPassword) {
          alert("Konfirmasi password tidak cocok.");
          return;
      }

      if (user) {
          const updatedUser: User = { 
              ...user, 
              password: newPassword, 
              mustChangePassword: false // Clear the flag
          };
          
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          // Update DB
          const userKey = `user_${user.username}`;
          if (localStorage.getItem(userKey)) {
              const dbUser = JSON.parse(localStorage.getItem(userKey) || '{}');
              const mergedUser = { ...dbUser, ...updatedUser };
              localStorage.setItem(userKey, JSON.stringify(mergedUser));
          }
          
          logActivity(updatedUser, 'CHANGE_PASSWORD', 'User berhasil mengubah password.');
          alert("Password berhasil diubah. Silakan lanjutkan.");
      }
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
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || "Terjadi kesalahan tidak diketahui.";
      alert(`Gagal membuat modul: ${msg}\n\nPastikan API Key valid (VITE_GEMINI_API_KEY) dan koneksi internet stabil.`);
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

  // 1. SPLASH SCREEN
  if (appState === 'SPLASH') {
      return <SplashScreen onFinish={() => setAppState('LANDING')} />;
  }

  // 2. LANDING PAGE
  if (appState === 'LANDING') {
      return <LandingPage onEnterApp={() => setAppState('APP')} />;
  }

  // 3. MAIN APPLICATION (AUTH / DASHBOARD)
  if (!user) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="absolute top-4 left-4 z-50">
                <button onClick={() => setAppState('LANDING')} className="flex items-center gap-2 text-indigo-700 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm hover:bg-white text-sm font-medium">
                    <FileText className="w-4 h-4" /> Kembali ke Menu
                </button>
             </div>
             <Auth onLogin={handleLogin} />
        </div>
    );
  }

  // --- ADMIN VIEW (ROBUST CHECK) ---
  if (user.role === UserRole.ADMIN) {
      return <AdminDashboard onLogout={handleLogout} />;
  }

  // --- FORCE CHANGE PASSWORD ---
  if (user.mustChangePassword) {
      return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                  <div className="text-center mb-6">
                      <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Ganti Password</h2>
                      <p className="text-gray-600 mt-2 text-sm">Admin telah mereset password Anda. Demi keamanan, silakan buat password baru.</p>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                          <input 
                              type="password" 
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500"
                              required
                              placeholder="Minimal 6 karakter"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                          <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500"
                              required
                              placeholder="Ulangi password baru"
                          />
                      </div>
                      <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
                          <Save className="w-4 h-4" /> Simpan Password Baru
                      </button>
                  </form>
              </div>
          </div>
      );
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
              <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none text-gray-800 hidden sm:block">ModulAjar.AI</span>
                  <button onClick={() => setAppState('LANDING')} className="text-[10px] text-left text-gray-500 hover:text-indigo-600 hover:underline">
                      &larr; Ke Menu Utama
                  </button>
              </div>
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