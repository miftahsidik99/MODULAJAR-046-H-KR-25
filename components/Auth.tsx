import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, School } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (username === 'admin' && password === 'admin') {
        onLogin({ username: 'admin', role: UserRole.ADMIN, name: 'Administrator' });
      } else if (username && password.length >= 6) {
        // Mock Login for Teacher
        const storedUser = localStorage.getItem(`user_${username}`);
        if (storedUser) {
             const userData = JSON.parse(storedUser);
             if (userData.password === password) {
                 onLogin(userData);
             } else {
                 setError("Password salah.");
             }
        } else {
            // Allow demo login if user doesn't exist but strictly valid inputs
            onLogin({ 
                username, 
                role: UserRole.GURU, 
                name: 'Guru Demo', 
                nip: username,
                school: 'SDN 01 Merdeka' 
            });
        }
      } else {
        setError('Username atau password salah.');
      }
    } else {
      // Register
      if (password.length < 6) {
        setError('Password minimal 6 karakter.');
        return;
      }
      const newUser: User & {password: string} = {
        username, // NIP
        role: UserRole.GURU,
        name: fullName,
        nip: username,
        school,
        password // In real app, hash this!
      };
      localStorage.setItem(`user_${username}`, JSON.stringify(newUser));
      onLogin(newUser);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {isLogin ? 'Username / NIP' : 'NIP / NUPTK'}
            </label>
            <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={isLogin ? "admin atau NIP" : "Nomor Induk Pegawai"}
                    required
                />
            </div>
          </div>

          {!isLogin && (
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

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition duration-200"
          >
            {isLogin ? 'Masuk' : 'Daftar Akun Guru'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {isLogin ? "Daftar Guru Baru" : "Login disini"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;