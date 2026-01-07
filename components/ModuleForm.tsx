import React, { useState, useEffect } from 'react';
import { CLASSES, SUBJECTS, LEARNING_MODELS, LEARNING_METHODS, P5_THEMES } from '../constants';
import { ModuleConfig, SubjectType, TeacherProfile } from '../types';
import { recommendModelAndMethod } from '../services/geminiService';
import SignatureUpload from './SignatureUpload';
import { Sparkles, Loader2, BookOpen, UserCircle, Calendar, School, ArrowRight, ArrowLeft, CheckCircle, Brain, Target, Info, PenTool } from 'lucide-react';

interface Props {
  userProfile: TeacherProfile;
  initialConfig?: ModuleConfig | null;
  onSubmit: (config: ModuleConfig) => void;
  isGenerating: boolean;
}

const steps = [
  { id: 1, title: 'Identitas', icon: UserCircle },
  { id: 2, title: 'Kurikulum', icon: BookOpen },
  { id: 3, title: 'Strategi & AI', icon: Brain },
  { id: 4, title: 'Finalisasi', icon: PenTool },
];

const ModuleForm: React.FC<Props> = ({ userProfile, initialConfig, onSubmit, isGenerating }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Identity Fields
  const [teacherName, setTeacherName] = useState(initialConfig?.teacherName || userProfile.name);
  const [teacherNip, setTeacherNip] = useState(initialConfig?.teacherNip || userProfile.nip);
  const [schoolName, setSchoolName] = useState(initialConfig?.schoolName || userProfile.school);
  const [principalName, setPrincipalName] = useState(initialConfig?.principalName || '');
  const [principalNip, setPrincipalNip] = useState(initialConfig?.principalNip || '');

  // Time Fields
  const [academicYear, setAcademicYear] = useState(initialConfig?.academicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
  const [moduleDate, setModuleDate] = useState(initialConfig?.moduleDate || new Date().toISOString().split('T')[0]);
  const [timeAllocation, setTimeAllocation] = useState(initialConfig?.timeAllocation || '2 x 35 Menit');

  // Curriculum Fields
  const [grade, setGrade] = useState<number>(initialConfig?.grade || 1);
  const [subjectType, setSubjectType] = useState<SubjectType>(initialConfig?.subjectType || SubjectType.UMUM);
  const [subjectName, setSubjectName] = useState<string>(initialConfig?.subjectName || SUBJECTS.UMUM[0]);
  const [cp, setCp] = useState(initialConfig?.cp || '');
  const [tp, setTp] = useState(initialConfig?.tp || '');
  
  // Pedagogy Fields
  const [model, setModel] = useState(initialConfig?.model || LEARNING_MODELS[0].name);
  const [method, setMethod] = useState(initialConfig?.method || LEARNING_METHODS[0].name);
  const [p5Theme, setP5Theme] = useState(initialConfig?.p5Theme || P5_THEMES[0].name);
  
  // AI Insights
  const [aiReasoning, setAiReasoning] = useState(initialConfig?.aiReasoning || '');
  const [aiTaxonomy, setAiTaxonomy] = useState(initialConfig?.aiTaxonomy || '');
  
  // Signatures
  const [teacherSignature, setTeacherSignature] = useState<string>(initialConfig?.teacherSignature || '');
  const [principalSignature, setPrincipalSignature] = useState<string>(initialConfig?.principalSignature || '');

  const [isRecommending, setIsRecommending] = useState(false);

  // Helper to get description
  const getModelDesc = (name: string) => LEARNING_MODELS.find(m => m.name === name)?.description || '';
  const getMethodDesc = (name: string) => LEARNING_METHODS.find(m => m.name === name)?.description || '';
  const getP5Desc = (name: string) => P5_THEMES.find(t => t.name === name)?.description || '';

  // Update subject list based on type
  useEffect(() => {
    let options: string[] = [];
    switch (subjectType) {
      case SubjectType.UMUM: options = SUBJECTS.UMUM; break;
      case SubjectType.AGAMA: options = SUBJECTS.AGAMA; break;
      case SubjectType.SENI: options = SUBJECTS.SENI; break;
      case SubjectType.MULOK: options = SUBJECTS.MULOK; break;
      case SubjectType.KHUSUS: options = SUBJECTS.KHUSUS; break;
    }
    if (!options.includes(subjectName)) {
        setSubjectName(options[0]);
    }
  }, [subjectType]);

  const handleRecommend = async () => {
    if (!tp) {
        alert("Mohon isi Tujuan Pembelajaran terlebih dahulu di langkah sebelumnya.");
        return;
    }
    setIsRecommending(true);
    try {
        const rec = await recommendModelAndMethod(grade, subjectName, tp);
        if (rec.model) setModel(rec.model);
        if (rec.method) setMethod(rec.method);
        if (rec.p5Theme) setP5Theme(rec.p5Theme);
        if (rec.reasoning) setAiReasoning(rec.reasoning);
        if (rec.taxonomyAnalysis) setAiTaxonomy(rec.taxonomyAnalysis);
    } catch (e) {
        console.error(e);
        alert("Gagal mendapatkan rekomendasi AI.");
    } finally {
        setIsRecommending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: ModuleConfig = {
      id: initialConfig?.id || Date.now().toString(),
      teacherName, teacherNip, schoolName, principalName, principalNip,
      academicYear, moduleDate, grade, subjectType, subjectName,
      cp, tp, approach: "Deep Learning", model, method, p5Theme,
      timeAllocation, createdAt: initialConfig?.createdAt || Date.now(),
      teacherSignature, principalSignature,
      content: initialConfig?.content,
      aiReasoning, aiTaxonomy,
      paperSize: initialConfig?.paperSize || 'A4'
    };
    onSubmit(config);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-white shadow-2xl shadow-indigo-100 rounded-2xl overflow-hidden font-sans">
      
      {/* Progress Stepper */}
      <div className="bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between relative">
            {/* Connector Line */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-700 -z-0 px-8"></div>
            
            {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive ? 'bg-indigo-500 border-slate-900 scale-110 shadow-lg shadow-indigo-500/50' : isCompleted ? 'bg-green-500 border-slate-900' : 'bg-slate-700 border-slate-900'}`}>
                            {isCompleted ? <CheckCircle className="w-5 h-5 text-white" /> : <step.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />}
                        </div>
                        <span className={`mt-2 text-xs font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>{step.title}</span>
                    </div>
                );
            })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 min-h-[500px] flex flex-col">
        
        {/* Step 1: Identitas */}
        {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2"><UserCircle className="w-5 h-5"/> Data Penyusun & Sekolah</h3>
                    <p className="text-sm text-blue-700 mt-1">Lengkapi data administratif untuk kop dan lembar pengesahan modul.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-white p-4 border rounded-xl shadow-sm hover:shadow-md transition">
                            <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Informasi Guru</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                                    <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Guru, S.Pd." required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">NIP / NUPTK</label>
                                    <input type="text" value={teacherNip} onChange={e => setTeacherNip(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="198xxxxxx" />
                                </div>
                            </div>
                        </div>
                         <div className="bg-white p-4 border rounded-xl shadow-sm hover:shadow-md transition">
                             <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Informasi Sekolah</h4>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Sekolah</label>
                                <div className="relative">
                                    <School className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"/>
                                    <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full mt-1 pl-9 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                            </div>
                         </div>
                    </div>

                    <div className="bg-white p-4 border rounded-xl shadow-sm hover:shadow-md transition">
                        <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Informasi Kepala Sekolah</h4>
                        <div className="space-y-3">
                             <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Kepala Sekolah</label>
                                <input type="text" value={principalName} onChange={e => setPrincipalName(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Kepala, M.Pd." />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">NIP Kepala Sekolah</label>
                                <input type="text" value={principalNip} onChange={e => setPrincipalNip(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="197xxxxxx" />
                            </div>
                            <div className="pt-4 mt-2 border-t">
                                <h4 className="font-semibold text-gray-700 mb-2">Waktu Pembelajaran</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Tahun Ajaran</label>
                                        <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" placeholder="2024/2025" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Tanggal Modul</label>
                                        <input type="date" value={moduleDate} onChange={e => setModuleDate(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Step 2: Kurikulum */}
        {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-6">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2"><BookOpen className="w-5 h-5"/> Detail Kurikulum</h3>
                    <p className="text-sm text-indigo-700 mt-1">Sesuaikan dengan CP terbaru (BSKAP 046/2025). Tentukan kelas dan mapel.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Kolom Kiri: Pilihan Dropdown */}
                    <div className="md:col-span-1 space-y-4">
                         <div>
                            <label className="text-sm font-semibold text-gray-700">Kelas Fase A/B/C</label>
                            <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                {CLASSES.map(c => <option key={c} value={c}>Kelas {c} SD</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="text-sm font-semibold text-gray-700">Kategori Mapel</label>
                             <select value={subjectType} onChange={(e) => setSubjectType(e.target.value as SubjectType)} className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value={SubjectType.UMUM}>Mapel Umum</option>
                                <option value={SubjectType.AGAMA}>Pendidikan Agama</option>
                                <option value={SubjectType.SENI}>Seni Budaya</option>
                                <option value={SubjectType.MULOK}>Muatan Lokal</option>
                                {grade === 5 && <option value={SubjectType.KHUSUS}>Koding & AI (Kelas 5)</option>}
                             </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Mata Pelajaran</label>
                            <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-indigo-700">
                                {(() => {
                                     switch (subjectType) {
                                        case SubjectType.UMUM: return SUBJECTS.UMUM.map(s => <option key={s} value={s}>{s}</option>);
                                        case SubjectType.AGAMA: return SUBJECTS.AGAMA.map(s => <option key={s} value={s}>{s}</option>);
                                        case SubjectType.SENI: return SUBJECTS.SENI.map(s => <option key={s} value={s}>{s}</option>);
                                        case SubjectType.MULOK: return SUBJECTS.MULOK.map(s => <option key={s} value={s}>{s}</option>);
                                        case SubjectType.KHUSUS: return SUBJECTS.KHUSUS.map(s => <option key={s} value={s}>{s}</option>);
                                        default: return [];
                                    }
                                })()}
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-semibold text-gray-700">Alokasi Waktu</label>
                            <input type="text" value={timeAllocation} onChange={e => setTimeAllocation(e.target.value)} className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-300 rounded-lg" placeholder="2 x 35 JP" />
                        </div>
                    </div>

                    {/* Kolom Kanan: CP & TP Area */}
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold text-gray-700">Capaian Pembelajaran (CP)</label>
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Salin dari Dokumen BSKAP</span>
                            </div>
                            <textarea value={cp} onChange={(e) => setCp(e.target.value)} rows={4} className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed" placeholder="Peserta didik mampu..." required />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold text-gray-700">Tujuan Pembelajaran (TP)</label>
                                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">Kunci Rekomendasi AI</span>
                            </div>
                            <textarea value={tp} onChange={(e) => setTp(e.target.value)} rows={4} className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed" placeholder="Rumuskan TP yang spesifik, misal: Melalui diskusi, siswa dapat menganalisis..." required />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Step 3: Strategi & AI */}
        {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                {/* AI Header Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                        <Brain className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                            AI Pedagogical Assistant
                        </h3>
                        <p className="text-indigo-100 text-sm mb-4 max-w-2xl">
                            Klik tombol di bawah untuk meminta AI menganalisis Tujuan Pembelajaran Anda (TP), menentukan Level Taksonomi, dan merekomendasikan Model & Metode terbaik sesuai prinsip Deep Learning.
                        </p>
                        <button 
                            type="button" 
                            onClick={handleRecommend} 
                            disabled={isRecommending || !tp} 
                            className="bg-white text-indigo-700 font-bold py-2.5 px-6 rounded-lg shadow-md hover:bg-indigo-50 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isRecommending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Brain className="w-4 h-4"/>}
                            {isRecommending ? 'Sedang Menganalisis...' : 'Analisis & Rekomendasi Strategi'}
                        </button>
                    </div>
                </div>

                {/* AI Results Display */}
                {(aiReasoning || aiTaxonomy) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in duration-300">
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                            <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2 text-sm">
                                <Target className="w-4 h-4" /> Analisis Taksonomi
                            </h4>
                            <p className="text-sm text-orange-900 leading-relaxed italic">"{aiTaxonomy}"</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                            <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2 text-sm">
                                <CheckCircle className="w-4 h-4" /> Alasan Rekomendasi
                            </h4>
                            <p className="text-sm text-green-900 leading-relaxed italic">"{aiReasoning}"</p>
                        </div>
                    </div>
                )}

                {/* Selection Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Model Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Model Pembelajaran</label>
                        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none">
                            {LEARNING_MODELS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </select>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex gap-2 items-start">
                            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            {getModelDesc(model)}
                        </div>
                    </div>

                    {/* Method Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Metode Pendukung</label>
                         <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none">
                            {LEARNING_METHODS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </select>
                         <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex gap-2 items-start">
                            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            {getMethodDesc(method)}
                        </div>
                    </div>

                    {/* P5 Theme Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Tema Projek P5</label>
                        <select value={p5Theme} onChange={(e) => setP5Theme(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none">
                            {P5_THEMES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                         <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex gap-2 items-start">
                            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            {getP5Desc(p5Theme)}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Step 4: Finalisasi */}
        {currentStep === 4 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                 <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Tahap Terakhir</h3>
                    <p className="text-gray-500">Bubuhkan tanda tangan elektronik untuk melengkapi dokumen modul ajar.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <SignatureUpload 
                        label="Tanda Tangan Guru (Penyusun)" 
                        initialData={teacherSignature} 
                        onSave={setTeacherSignature} 
                     />
                     <SignatureUpload 
                        label="Tanda Tangan Kepala Sekolah (Mengetahui)" 
                        initialData={principalSignature} 
                        onSave={setPrincipalSignature} 
                     />
                 </div>

                 <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 mt-4">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-bold">Catatan Penting:</p>
                        <p>Setelah menekan tombol <strong>"Generate Modul"</strong>, AI akan menyusun narasi modul ajar lengkap (Komponen Inti, Lampiran, LKPD) berdasarkan data yang Anda inputkan. Proses ini memakan waktu 10-20 detik.</p>
                    </div>
                 </div>
             </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-auto pt-8 flex justify-between border-t border-gray-100">
             <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
             >
                <ArrowLeft className="w-4 h-4" /> Kembali
             </button>

             {currentStep < 4 ? (
                 <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                 >
                    Lanjut <ArrowRight className="w-4 h-4" />
                 </button>
             ) : (
                <button 
                    type="submit" 
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            Menyusun Modul...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Generate Modul Ajar
                        </>
                    )}
                </button>
             )}
        </div>
      </form>
    </div>
  );
};

export default ModuleForm;