import React, { useState } from 'react';
import { User, UserRole, ResetRequest } from '../types';
import { Lock, User as UserIcon, School, ArrowLeft } from 'lucide-react';

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
            // REMOVED DEMO LOGIN FALLBACK
            // This ensures if 'admin' login fails, it doesn't become a 'guru'
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
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
            <>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja (Sekolah)</label>
                    <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nama Sekolah"
                        required
                    />
                </div>
            </>
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

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">{successMsg}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition duration-200 flex justify-center items-center gap-2"
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