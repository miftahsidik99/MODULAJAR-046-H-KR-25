import React, { useState, useEffect } from 'react';
import { User, UserRole, ResetRequest } from '../types';
import { getProvinces, getRegencies, getDistricts, Region } from '../services/locationService';
import { findSchoolsWithAI } from '../services/geminiService';
import { Lock, User as UserIcon, School, ArrowLeft, MapPin, Loader2, CheckCircle, Sparkles, Globe } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [viewState, setViewState] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Location States for Registration
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<string[]>([]);
  
  const [selectedProv, setSelectedProv] = useState('');
  const [selectedReg, setSelectedReg] = useState('');
  const [selectedDist, setSelectedDist] = useState('');
  const [isManualSchool, setIsManualSchool] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    // Load provinces once on mount
    getProvinces().then(data => setProvinces(data));
  }, []);

  // Location Handlers
  const handleProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedProv(id);
      setSelectedReg('');
      setSelectedDist('');
      setRegencies([]);
      setDistricts([]);
      setSchoolOptions([]);
      setSchool('');
      if (id) {
          setIsLoadingLocation(true);
          const data = await getRegencies(id);
          setRegencies(data);
          setIsLoadingLocation(false);
      }
  };

  const handleRegChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedReg(id);
      setSelectedDist('');
      setDistricts([]);
      setSchoolOptions([]);
      setSchool('');
      if (id) {
          setIsLoadingLocation(true);
          const data = await getDistricts(id);
          setDistricts(data);
          setIsLoadingLocation(false);
      }
  };

  const handleDistChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const district = districts.find(d => d.id === id);
      setSelectedDist(id);
      setSchoolOptions([]);
      setSchool('');

      if (id && district) {
          setIsLoadingLocation(true);
          
          // Get Names for AI
          const provinceName = provinces.find(p => p.id === selectedProv)?.name || '';
          const regencyName = regencies.find(r => r.id === selectedReg)?.name || '';
          const districtName = district.name;

          try {
            const schools = await findSchoolsWithAI(provinceName, regencyName, districtName);
            if (schools.length > 0) {
                setSchoolOptions(schools);
            } else {
                setSchoolOptions([]);
                // Optional: Alert user or auto-switch to manual
                alert("AI tidak dapat menemukan data sekolah spesifik di kecamatan ini. Silakan gunakan fitur 'Input Manual' atau coba lagi.");
                setIsManualSchool(true);
            }
          } catch (e) {
            console.error(e);
            setSchoolOptions([]);
            alert("Gagal memuat data sekolah (Periksa API Key). Beralih ke Input Manual.");
            setIsManualSchool(true);
          } finally {
            setIsLoadingLocation(false);
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Normalize username to prevent case sensitivity issues
    const cleanUsername = username.trim();
    const cleanUsernameLower = cleanUsername.toLowerCase();

    if (viewState === 'LOGIN') {
      // 1. Check Hardcoded Admin
      if (cleanUsernameLower === 'admin' && password === 'admin') {
        onLogin({ 
            username: 'admin', 
            role: UserRole.ADMIN, 
            name: 'Administrator', 
            activityLogs: [] 
        });
        return;
      } 
      
      // 2. Check Existing User in LocalStorage
      if (cleanUsername && password.length >= 6) {
        const storedUser = localStorage.getItem(`user_${cleanUsername}`); // Check exact case first
        const storedUserLower = localStorage.getItem(`user_${cleanUsernameLower}`); // Check lowercase key
        
        const userDataRaw = storedUser || storedUserLower;

        if (userDataRaw) {
             const userData = JSON.parse(userDataRaw);
             if (userData.password === password) {
                 // Update last login
                 const updatedUser = { ...userData, lastLogin: Date.now() };
                 // Save back to the correct key
                 localStorage.setItem(storedUser ? `user_${cleanUsername}` : `user_${cleanUsernameLower}`, JSON.stringify(updatedUser));
                 onLogin(updatedUser);
             } else {
                 setError("Password salah.");
             }
        } else {
            setError('User tidak ditemukan. Silakan daftar akun baru jika belum punya.');
        }
      } else {
        setError('Username atau password tidak valid.');
      }

    } else if (viewState === 'REGISTER') {
      if (cleanUsernameLower === 'admin') {
          setError('Username "admin" tidak boleh digunakan untuk pendaftaran umum.');
          return;
      }
      if (password.length < 6) {
        setError('Password minimal 6 karakter.');
        return;
      }
      // Check if user exists
      if (localStorage.getItem(`user_${cleanUsername}`)) {
        setError('Username/NIP sudah terdaftar.');
        return;
      }
      if (!school) {
          setError('Mohon pilih atau isi nama sekolah.');
          return;
      }

      const newUser: User = {
        username: cleanUsername,
        role: UserRole.GURU,
        name: fullName,
        nip: cleanUsername,
        school,
        password,
        activityLogs: [],
        lastLogin: Date.now()
      };
      localStorage.setItem(`user_${cleanUsername}`, JSON.stringify(newUser));
      onLogin(newUser);

    } else if (viewState === 'FORGOT') {
      // Check if user exists
      const userDataRaw = localStorage.getItem(`user_${cleanUsername}`);
      if (!userDataRaw) {
        setError('Username/NIP tidak ditemukan.');
        return;
      }
      
      const userData = JSON.parse(userDataRaw);
      
      const newRequest: ResetRequest = {
        id: Date.now().toString(),
        username: userData.username,
        name: userData.name || 'Unknown',
        school: userData.school || 'Unknown',
        timestamp: Date.now(),
        status: 'PENDING'
      };

      // Save to admin requests list
      const existingRequests = JSON.parse(localStorage.getItem('admin_reset_requests') || '[]');
      // Avoid duplicate pending requests
      const isAlreadyPending = existingRequests.some((r: ResetRequest) => r.username === cleanUsername && r.status === 'PENDING');
      
      if (isAlreadyPending) {
         setError('Permintaan reset password Anda sudah dikirim dan sedang menunggu persetujuan Admin.');
         return;
      }

      localStorage.setItem('admin_reset_requests', JSON.stringify([...existingRequests, newRequest]));
      setSuccessMsg('Permintaan reset dikirim ke Admin. Silakan hubungi Admin untuk mendapatkan password baru.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full p-8 transition-all duration-300 ${viewState === 'REGISTER' ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Modul Ajar AI</h1>
          <p className="text-gray-500">Platform Perangkat Ajar SD Digital</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {viewState === 'FORGOT' && (
             <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm mb-4 border border-yellow-200">
               Masukkan NIP/Username Anda. Permintaan reset akan dikirim ke Admin.
             </div>
          )}

          {/* Registration Form Layout: 2 Columns */}
          <div className={viewState === 'REGISTER' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {viewState === 'LOGIN' ? 'Username / NIP' : 'NIP / NUPTK (Username)'}
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder={viewState === 'LOGIN' ? "Masuk sebagai admin atau NIP Guru" : "Nomor Induk Pegawai"}
                            required
                        />
                    </div>
                </div>

                {viewState === 'REGISTER' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nama lengkap dengan gelar"
                            required
                        />
                    </div>
                )}

                {viewState !== 'FORGOT' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Minimal 6 karakter"
                                required
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: School Selection (Only in Register) */}
            {viewState === 'REGISTER' && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-gray-700">Unit Kerja (Sekolah)</label>
                        <button 
                            type="button" 
                            onClick={() => { setIsManualSchool(!isManualSchool); setSchool(''); }} 
                            className="text-[10px] text-indigo-600 hover:underline"
                        >
                            {isManualSchool ? "Cari Otomatis" : "Input Manual"}
                        </button>
                    </div>

                    {isManualSchool ? (
                        <input
                            type="text"
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ketik Nama Sekolah..."
                            required
                        />
                    ) : (
                        <div className="space-y-2">
                             <div>
                                <select value={selectedProv} onChange={handleProvChange} className="w-full p-2 border rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500">
                                    <option value="">-- Pilih Provinsi --</option>
                                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <select value={selectedReg} onChange={handleRegChange} disabled={!selectedProv} className="w-full p-2 border rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50">
                                    <option value="">-- Pilih Kab/Kota --</option>
                                    {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <select value={selectedDist} onChange={handleDistChange} disabled={!selectedReg} className="w-full p-2 border rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50">
                                    <option value="">-- Pilih Kecamatan --</option>
                                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                {isLoadingLocation ? (
                                    <div className="w-full p-2 border rounded bg-indigo-50 text-xs text-indigo-600 flex items-center justify-center animate-pulse gap-2">
                                        <Globe className="w-3 h-3 animate-spin"/> Mencari sekolah online...
                                    </div>
                                ) : (
                                    <select 
                                        value={school} 
                                        onChange={e => setSchool(e.target.value)} 
                                        disabled={!selectedDist} 
                                        className="w-full p-2 border rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 font-medium text-indigo-700"
                                    >
                                        <option value="">-- Pilih SD/MI (Hasil Pencarian) --</option>
                                        {schoolOptions.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                                    </select>
                                )}
                            </div>
                            {selectedDist && (
                                <p className="text-[10px] text-gray-500">*Data diambil langsung dari Google Search (Real-time).</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">{successMsg}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition duration-200 flex justify-center items-center gap-2 mt-4"
          >
            {viewState === 'LOGIN' && 'Masuk'}
            {viewState === 'REGISTER' && 'Daftar Akun Guru'}
            {viewState === 'FORGOT' && 'Kirim Permintaan Reset'}
          </button>

          {viewState === 'LOGIN' && (
              <button
                type="button"
                onClick={() => { setViewState('FORGOT'); setError(''); setSuccessMsg(''); }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Lupa Kata Sandi?
              </button>
          )}
        </form>

        <div className="mt-6 text-center text-sm border-t pt-4">
          <p className="text-gray-600">
            {viewState === 'LOGIN' ? "Belum punya akun?" : "Sudah punya akun?"}
            <button
              onClick={() => {
                  setViewState(viewState === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                  setError('');
                  setSuccessMsg('');
              }}
              className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {viewState === 'LOGIN' ? "Daftar Guru Baru" : "Login disini"}
            </button>
          </p>
          
          {viewState === 'FORGOT' && (
             <button
                onClick={() => { setViewState('LOGIN'); setError(''); setSuccessMsg(''); }}
                className="mt-4 flex items-center justify-center gap-1 w-full text-gray-500 hover:text-gray-800 font-medium"
             >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Login
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;