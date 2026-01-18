import React from 'react';
import { Database, Bot, ArrowRight, BookOpenCheck, Sparkles, LayoutGrid } from 'lucide-react';

interface Props {
  onEnterApp: () => void;
}

const LandingPage: React.FC<Props> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60"></div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Platform Kurikulum Merdeka Terintegrasi AI</span>
            </div>
            
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light">
                Pilih layanan yang Anda butuhkan untuk mempermudah administrasi pembelajaran.
            </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 md:px-0">
             
             {/* Card 1: Database CP & TP */}
             <a 
                href="https://cp-tp-miftahsidik.space.z.ai/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] flex flex-col items-center text-center overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative p-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition duration-500 group-hover:rotate-3">
                    <Database className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="relative text-2xl font-bold text-white mb-3">Database CP & TP SD</h2>
                <p className="relative text-slate-300 mb-8 leading-relaxed">
                    Akses referensi lengkap Capaian dan Tujuan Pembelajaran (CP/TP) Fase A, B, dan C sebagai bahan dasar penyusunan modul.
                </p>
                
                <span className="relative mt-auto inline-flex items-center text-blue-300 font-semibold group-hover:text-white transition">
                    Buka Database <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </span>
             </a>

             {/* Card 2: Generator Modul Ajar (Main App) */}
             <button 
                onClick={onEnterApp}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col items-center text-center overflow-hidden text-left w-full"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative p-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition duration-500 group-hover:-rotate-3">
                    <Bot className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="relative text-2xl font-bold text-white mb-3">Generator Modul Ajar AI</h2>
                <p className="relative text-slate-300 mb-8 leading-relaxed">
                    Buat Modul Ajar lengkap secara otomatis dengan bantuan Artificial Intelligence. Sesuai regulasi BSKAP 046/2025.
                </p>
                
                <span className="relative mt-auto inline-flex items-center text-indigo-300 font-semibold group-hover:text-white transition">
                    Mulai Buat Modul <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </span>
             </button>

        </div>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-white/5 pt-8 w-full max-w-4xl">
             <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-2">
                <LayoutGrid className="w-4 h-4" />
                <span>Perangkat Ajar Sekolah Dasar Series</span>
             </div>
             <p className="text-white/20 text-xs">
                &copy; {new Date().getFullYear()} Modul Ajar SD AI - Deep Learning Approach.
             </p>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;