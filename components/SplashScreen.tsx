import React, { useEffect, useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Tampil selama 3 detik total
    // Detik ke-2.5 mulai fade out
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white overflow-hidden transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        
        {/* Logo Icon */}
        <div className="relative mb-8 animate-float">
          <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
             <div className="relative">
                <BookOpen className="w-20 h-20 text-white drop-shadow-lg" />
                <Sparkles className="w-10 h-10 text-yellow-400 absolute -top-4 -right-4 animate-bounce" />
             </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Perangkat Ajar Guru
          <span className="block text-2xl md:text-4xl mt-2 font-light">Sekolah Dasar</span>
        </h1>
        
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-indigo-400 to-transparent my-4 animate-pulse"></div>

        <p className="text-lg md:text-xl text-indigo-200 font-light tracking-wide animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          "Siapkan Perangkat Ajar Guru dari Sekarang"
        </p>
      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-10 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-400 animate-[width_3s_ease-in-out_forwards] w-0"></div>
      </div>
    </div>
  );
};

export default SplashScreen;