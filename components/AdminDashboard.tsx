import React, { useState, useEffect } from 'react';
import { User, ResetRequest, UserActivity } from '../types';
import { Shield, Search, Key, Eye, Clock, List, AlertCircle, CheckCircle, XCircle, LogOut } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'USERS' | 'REQUESTS'>('USERS');
  const [selectedUserLogs, setSelectedUserLogs] = useState<UserActivity[] | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  // Manual Reset State
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  useEffect(() => {
    loadData();
    // Poll data every 5 seconds to see updates in real-time
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    // 1. Load Users
    const loadedUsers: User[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        try {
          const u = JSON.parse(localStorage.getItem(key) || '{}');
          if (u.username !== 'admin') { // Hide admin self from list
             loadedUsers.push(u);
          }
        } catch (e) { console.error('Error parsing user', key); }
      }
    }
    setUsers(loadedUsers);

    // 2. Load Requests
    const loadedRequests = JSON.parse(localStorage.getItem('admin_reset_requests') || '[]');
    setRequests(loadedRequests);
  };

  const handleApproveReset = (req: ResetRequest) => {
    setResettingUser(req.username);
    setNewPasswordInput(''); // Admin must input new password
  };

  const handleConfirmReset = (username: string, requestId?: string) => {
      if (!newPasswordInput || newPasswordInput.length < 6) {
          alert("Password baru minimal 6 karakter");
          return;
      }

      // 1. Update User Data
      const userKey = `user_${username}`;
      const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
      if (userData.username) {
          userData.password = newPasswordInput;
          userData.mustChangePassword = true; // Force user to change password next login
          localStorage.setItem(userKey, JSON.stringify(userData));
      } else {
          alert("User tidak ditemukan di database.");
          return;
      }

      // 2. Update Request Status if exists
      if (requestId) {
          const updatedRequests = requests.map(r => 
              r.id === requestId ? { ...r, status: 'APPROVED' as const } : r
          );
          localStorage.setItem('admin_reset_requests', JSON.stringify(updatedRequests));
          setRequests(updatedRequests);
      }

      alert(`Password untuk ${username} berhasil direset menjadi: ${newPasswordInput}. User akan diminta mengganti password saat login berikutnya.`);
      setResettingUser(null);
      setNewPasswordInput('');
      loadData();
  };

  const handleRejectRequest = (id: string) => {
      if(confirm('Tolak permintaan reset password ini?')) {
          const updatedRequests = requests.map(r => 
              r.id === id ? { ...r, status: 'REJECTED' as const } : r
          );
          localStorage.setItem('admin_reset_requests', JSON.stringify(updatedRequests));
          setRequests(updatedRequests);
      }
  };

  const handleDeleteUser = (username: string) => {
      if (confirm(`Hapus user ${username} secara permanen? Data modul mungkin masih tersimpan.`)) {
          localStorage.removeItem(`user_${username}`);
          loadData();
      }
  };

  const filteredUsers = users.filter(u => 
      (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
       u.school?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Navbar Admin */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-yellow-400" />
                <span className="font-bold text-lg">Admin Dashboard - Monitoring User</span>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition shadow">
                <LogOut className="w-4 h-4" /> Logout
            </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><List className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total User Terdaftar</p>
                        <h3 className="text-2xl font-bold text-gray-800">{users.length}</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full"><Clock className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500">User Login (24 Jam)</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {users.filter(u => u.lastLogin && (Date.now() - u.lastLogin < 86400000)).length}
                        </h3>
                    </div>
                </div>
            </div>
            <div 
                className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition" 
                onClick={() => setActiveTab('REQUESTS')}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Key className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Permintaan Reset Password</p>
                        <h3 className="text-2xl font-bold text-gray-800">{pendingRequests.length}</h3>
                    </div>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('USERS')}
                className={`pb-3 px-6 font-semibold text-sm transition-colors relative ${activeTab === 'USERS' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Monitoring User
                {activeTab === 'USERS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('REQUESTS')}
                className={`pb-3 px-6 font-semibold text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'REQUESTS' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Permintaan Reset Password
                {pendingRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
                {activeTab === 'REQUESTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
            </button>
        </div>

        {activeTab === 'USERS' ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Database Pengguna</h3>
                        <p className="text-xs text-gray-500">Pantau identitas, password, dan aktivitas user.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari Nama, NIP, Sekolah..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Identitas User</th>
                                <th className="px-6 py-4">Unit Kerja (Sekolah)</th>
                                <th className="px-6 py-4">Akun (NIP)</th>
                                <th className="px-6 py-4 text-red-600">Kata Sandi</th>
                                <th className="px-6 py-4">Jam Akses Terakhir</th>
                                <th className="px-6 py-4 text-center">Aksi / Monitoring</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Tidak ada user ditemukan sesuai pencarian.</td></tr>
                            ) : filteredUsers.map(u => (
                                <tr key={u.username} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{u.name || '(Tanpa Nama)'}</div>
                                        <div className="text-xs text-gray-500">Role: {u.role}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{u.school || '-'}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600 bg-gray-50 rounded px-2 w-fit">{u.username}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-red-600 font-bold bg-red-50 border border-red-100 px-2 py-1 rounded inline-block">
                                            {u.password}
                                        </div>
                                        {u.mustChangePassword && <div className="text-[10px] text-orange-600 mt-1 font-semibold">*Wajib Ganti</div>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {u.lastLogin ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{new Date(u.lastLogin).toLocaleTimeString('id-ID')}</span>
                                                <span className="text-xs text-gray-400">{new Date(u.lastLogin).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Belum login</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedUserLogs(u.activityLogs || []); setSelectedUserName(u.name || u.username); }}
                                                className="group relative p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                                title="Lihat Log Aktivitas"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setResettingUser(u.username)}
                                                className="group relative p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-500 hover:text-white transition"
                                                title="Reset Password Manual"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u.username)}
                                                className="group relative p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                                                title="Hapus User"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-800 text-sm">Panduan Reset Password</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Setujui permintaan reset dengan memasukkan kata sandi baru. User akan diminta mengganti kata sandi tersebut saat login pertama kali (Fitur Force Change Password).
                        </p>
                    </div>
                 </div>

                 {requests.length === 0 ? (
                     <div className="bg-white p-16 rounded-xl shadow-sm border border-dashed border-gray-300 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium">Tidak ada permintaan baru</h3>
                        <p className="text-gray-500 text-sm mt-1">Semua permintaan reset password telah diproses.</p>
                     </div>
                 ) : (
                     <div className="grid gap-4">
                        {requests.slice().reverse().map(req => (
                            <div key={req.id} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${req.status === 'PENDING' ? 'border-yellow-400' : req.status === 'APPROVED' ? 'border-green-500' : 'border-red-500'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3"/> {new Date(req.timestamp).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-lg">{req.name}</h4>
                                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{req.username}</span>
                                        <span>•</span>
                                        <span>{req.school}</span>
                                    </p>
                                </div>
                                
                                {req.status === 'PENDING' && (
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button 
                                            onClick={() => handleApproveReset(req)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm transition"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Proses Reset
                                        </button>
                                        <button 
                                            onClick={() => handleRejectRequest(req.id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium transition"
                                        >
                                            <XCircle className="w-4 h-4" /> Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                     </div>
                 )}
            </div>
        )}

        {/* Modal Reset Password Manual */}
        {resettingUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                    <div className="text-center mb-6">
                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Key className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Reset Password User</h3>
                        <p className="text-sm text-gray-500">Masukkan password baru untuk <span className="font-mono font-bold text-gray-700">{resettingUser}</span></p>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Password Baru</label>
                        <input 
                            type="text" 
                            value={newPasswordInput}
                            onChange={e => setNewPasswordInput(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-center font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: 123456"
                            autoFocus
                        />
                         <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            *User akan diminta mengganti password ini saat login.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button onClick={() => { setResettingUser(null); setNewPasswordInput(''); }} className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition">Batal</button>
                        <button 
                            onClick={() => handleConfirmReset(resettingUser, requests.find(r => r.username === resettingUser && r.status === 'PENDING')?.id)} 
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal View Logs */}
        {selectedUserLogs && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div>
                            <h3 className="font-bold text-gray-800">Log Aktivitas User</h3>
                            <p className="text-xs text-gray-500 font-mono">{selectedUserName}</p>
                        </div>
                        <button onClick={() => setSelectedUserLogs(null)} className="p-1 hover:bg-gray-200 rounded-full transition"><XCircle className="w-6 h-6 text-gray-400"/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {selectedUserLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <List className="w-12 h-12 mb-2 opacity-20" />
                                <p>Belum ada aktivitas tercatat.</p>
                            </div>
                        ) : (
                            selectedUserLogs.slice().reverse().map((log, idx) => (
                                <div key={idx} className="relative pl-6 border-l-2 border-blue-200 pb-4 last:pb-0 last:border-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{log.action}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm text-gray-700">
                                        {log.details}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

// Helper Icon
const UserActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default AdminDashboard;