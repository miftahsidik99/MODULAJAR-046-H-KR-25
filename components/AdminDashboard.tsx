import React, { useState, useEffect } from 'react';
import { User, ResetRequest, UserActivity } from '../types';
import { Shield, Search, Key, RefreshCcw, Eye, Clock, List, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

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
          loadedUsers.push(u);
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

      alert(`Password untuk ${username} berhasil diubah menjadi: ${newPasswordInput}`);
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
                <span className="font-bold text-lg">Admin Panel - ModulAjar.AI</span>
            </div>
            <button onClick={onLogout} className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition">
                Logout
            </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><UserActivityIcon /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total User Guru</p>
                        <h3 className="text-2xl font-bold">{users.length}</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Clock /></div>
                    <div>
                        <p className="text-sm text-gray-500">User Aktif (24 Jam)</p>
                        <h3 className="text-2xl font-bold">
                            {users.filter(u => u.lastLogin && (Date.now() - u.lastLogin < 86400000)).length}
                        </h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-yellow-50 transition" onClick={() => setActiveTab('REQUESTS')}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Key /></div>
                    <div>
                        <p className="text-sm text-gray-500">Permintaan Reset Password</p>
                        <h3 className="text-2xl font-bold">{pendingRequests.length}</h3>
                    </div>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b">
            <button 
                onClick={() => setActiveTab('USERS')}
                className={`pb-3 px-4 font-medium ${activeTab === 'USERS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Monitoring User
            </button>
            <button 
                onClick={() => setActiveTab('REQUESTS')}
                className={`pb-3 px-4 font-medium flex items-center gap-2 ${activeTab === 'REQUESTS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Permintaan Reset
                {pendingRequests.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
            </button>
        </div>

        {activeTab === 'USERS' ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <List className="w-5 h-5"/> Daftar Pengguna
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari User / NIP..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase">
                            <tr>
                                <th className="px-6 py-3">Nama Guru</th>
                                <th className="px-6 py-3">Sekolah</th>
                                <th className="px-6 py-3">Username (NIP)</th>
                                <th className="px-6 py-3 text-red-600">Password</th>
                                <th className="px-6 py-3">Terakhir Login</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Tidak ada user ditemukan.</td></tr>
                            ) : filteredUsers.map(u => (
                                <tr key={u.username} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{u.name || '-'}</td>
                                    <td className="px-6 py-4">{u.school || '-'}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{u.username}</td>
                                    <td className="px-6 py-4 font-mono text-red-600 font-bold bg-red-50">{u.password}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Belum pernah login'}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button 
                                            onClick={() => { setSelectedUserLogs(u.activityLogs || []); setSelectedUserName(u.name || u.username); }}
                                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Lihat Aktivitas"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setResettingUser(u.username)}
                                            className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200" title="Reset Password"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(u.username)}
                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Hapus User"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-800">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Setujui permintaan reset password dengan memasukkan kata sandi baru untuk user tersebut.
                 </div>

                 {requests.length === 0 ? (
                     <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">Belum ada permintaan reset password.</div>
                 ) : (
                     <div className="grid gap-4">
                        {requests.slice().reverse().map(req => (
                            <div key={req.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${req.status === 'PENDING' ? 'border-yellow-400' : req.status === 'APPROVED' ? 'border-green-500' : 'border-red-500'} flex justify-between items-center`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-gray-400">{new Date(req.timestamp).toLocaleString()}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 mt-1">{req.name} <span className="text-gray-500 font-normal">({req.school})</span></h4>
                                    <p className="text-sm text-gray-600">Username/NIP: <span className="font-mono">{req.username}</span></p>
                                </div>
                                
                                {req.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleApproveReset(req)}
                                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Setujui & Reset
                                        </button>
                                        <button 
                                            onClick={() => handleRejectRequest(req.id)}
                                            className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200 text-sm"
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                    <h3 className="text-lg font-bold mb-4">Reset Password User</h3>
                    <p className="mb-2 text-sm text-gray-600">User: <b>{resettingUser}</b></p>
                    <label className="block text-sm mb-1">Masukkan Password Baru:</label>
                    <input 
                        type="text" 
                        value={newPasswordInput}
                        onChange={e => setNewPasswordInput(e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                        placeholder="Contoh: guru12345"
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setResettingUser(null); setNewPasswordInput(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                        <button 
                            onClick={() => handleConfirmReset(resettingUser, requests.find(r => r.username === resettingUser && r.status === 'PENDING')?.id)} 
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Simpan Password Baru
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal View Logs */}
        {selectedUserLogs && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Log Aktivitas: {selectedUserName}</h3>
                        <button onClick={() => setSelectedUserLogs(null)} className="text-gray-500 hover:text-black"><XCircle/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto border rounded bg-gray-50 p-4 space-y-3">
                        {selectedUserLogs.length === 0 ? (
                            <p className="text-center text-gray-500">Belum ada aktivitas tercatat.</p>
                        ) : (
                            selectedUserLogs.slice().reverse().map((log, idx) => (
                                <div key={idx} className="border-b pb-2 last:border-0">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                        <span className="font-bold text-gray-600">{log.action}</span>
                                    </div>
                                    <p className="text-sm text-gray-800">{log.details}</p>
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