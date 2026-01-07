import React, { useState, useEffect } from 'react';
import { CLASSES, SUBJECTS, LEARNING_MODELS, LEARNING_METHODS, P5_THEMES } from '../constants';
import { ModuleConfig, SubjectType, TeacherProfile } from '../types';
import { recommendModelAndMethod } from '../services/geminiService';
import SignatureUpload from './SignatureUpload';
import { Sparkles, Loader2, BookOpen, UserCircle, Calendar, School } from 'lucide-react';

interface Props {
  userProfile: TeacherProfile;
  initialConfig?: ModuleConfig | null;
  onSubmit: (config: ModuleConfig) => void;
  isGenerating: boolean;
}

const ModuleForm: React.FC<Props> = ({ userProfile, initialConfig, onSubmit, isGenerating }) => {
  // Identity Fields
  const [teacherName, setTeacherName] = useState(initialConfig?.teacherName || userProfile.name);
  const [teacherNip, setTeacherNip] = useState(initialConfig?.teacherNip || userProfile.nip);
  const [schoolName, setSchoolName] = useState(initialConfig?.schoolName || userProfile.school);
  
  // Principal Fields
  const [principalName, setPrincipalName] = useState(initialConfig?.principalName || '');
  const [principalNip, setPrincipalNip] = useState(initialConfig?.principalNip || '');

  // Time Fields
  const [academicYear, setAcademicYear] = useState(initialConfig?.academicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
  const [moduleDate, setModuleDate] = useState(initialConfig?.moduleDate || new Date().toISOString().split('T')[0]);

  // Curriculum Fields
  const [grade, setGrade] = useState<number>(initialConfig?.grade || 1);
  const [subjectType, setSubjectType] = useState<SubjectType>(initialConfig?.subjectType || SubjectType.UMUM);
  const [subjectName, setSubjectName] = useState<string>(initialConfig?.subjectName || SUBJECTS.UMUM[0]);
  const [cp, setCp] = useState(initialConfig?.cp || '');
  const [tp, setTp] = useState(initialConfig?.tp || '');
  const [model, setModel] = useState(initialConfig?.model || LEARNING_MODELS[0].name);
  const [method, setMethod] = useState(initialConfig?.method || LEARNING_METHODS[0].name);
  const [p5Theme, setP5Theme] = useState(initialConfig?.p5Theme || P5_THEMES[0].name);
  const [timeAllocation, setTimeAllocation] = useState(initialConfig?.timeAllocation || '2 x 35 Menit');
  
  // Signatures (Base64)
  const [teacherSignature, setTeacherSignature] = useState<string>(initialConfig?.teacherSignature || '');
  const [principalSignature, setPrincipalSignature] = useState<string>(initialConfig?.principalSignature || '');

  const [isRecommending, setIsRecommending] = useState(false);

  // Update subject list based on type
  useEffect(() => {
    // Only reset subject name if the current one isn't in the new list (to prevent overwrite on edit)
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
  }, [subjectType, subjectName]);

  const handleRecommend = async () => {
    if (!tp) {
        alert("Mohon isi Tujuan Pembelajaran terlebih dahulu.");
        return;
    }
    setIsRecommending(true);
    try {
        const rec = await recommendModelAndMethod(grade, subjectName, tp);
        if (rec.model) setModel(rec.model);
        if (rec.method) setMethod(rec.method);
    } catch (e) {
        console.error(e);
    } finally {
        setIsRecommending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: ModuleConfig = {
      id: initialConfig?.id || Date.now().toString(),
      teacherName,
      teacherNip,
      schoolName,
      principalName,
      principalNip,
      academicYear,
      moduleDate,
      grade,
      subjectType,
      subjectName,
      cp,
      tp,
      approach: "Deep Learning",
      model,
      method,
      p5Theme,
      timeAllocation,
      createdAt: initialConfig?.createdAt || Date.now(),
      teacherSignature,
      principalSignature,
      content: initialConfig?.content,
      paperSize: initialConfig?.paperSize || 'A4'
    };
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-8">
      
      {/* Section 1: Identitas Sekolah & Guru (Editable) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            Identitas Penyusun & Sekolah
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penyusun (Guru)</label>
                <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP/NUPTK Guru</label>
                <input type="text" value={teacherNip} onChange={e => setTeacherNip(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
                <input type="text" value={principalName} onChange={e => setPrincipalName(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" placeholder="H. Nama Kepala, M.Pd" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP Kepala Sekolah</label>
                <input type="text" value={principalNip} onChange={e => setPrincipalNip(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
                <div className="relative">
                    <School className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                    <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="pl-9 w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" required />
                </div>
            </div>
        </div>
      </div>

       {/* Section 2: Waktu & Kelas */}
       <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Waktu & Mapel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" placeholder="2024/2025" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Modul</label>
                <input type="date" value={moduleDate} onChange={e => setModuleDate(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alokasi Waktu</label>
                <input type="text" value={timeAllocation} onChange={e => setTimeAllocation(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" placeholder="2 x 35 Menit" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
                    {CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                </select>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Mapel</label>
                 <select value={subjectType} onChange={(e) => setSubjectType(e.target.value as SubjectType)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
                    <option value={SubjectType.UMUM}>Mata Pelajaran Umum</option>
                    <option value={SubjectType.AGAMA}>Pendidikan Agama</option>
                    <option value={SubjectType.SENI}>Seni Budaya</option>
                    <option value={SubjectType.MULOK}>Muatan Lokal</option>
                    {grade === 5 && <option value={SubjectType.KHUSUS}>Koding & AI (Kelas V)</option>}
                 </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mapel Spesifik</label>
                <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
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
        </div>
      </div>

      {/* Section 3: CP & TP */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Capaian & Tujuan (Deep Learning)
        </h3>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Capaian Pembelajaran (CP) 
                <span className="text-xs text-gray-500 ml-1">(Sesuai SK BSKAP 046/2025)</span>
            </label>
            <textarea value={cp} onChange={(e) => setCp(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" required placeholder="Salin CP dari dokumen resmi..." />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran (TP)</label>
            <textarea value={tp} onChange={(e) => setTp(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" required placeholder="Rumuskan TP yang spesifik dan bermakna..." />
        </div>
      </div>

      {/* Section 4: Pedagogi */}
      <div className="space-y-4 bg-indigo-50 p-4 rounded-lg">
        <div className="flex justify-between items-center border-b border-indigo-200 pb-2">
            <h3 className="text-lg font-semibold text-indigo-900">Strategi Pembelajaran</h3>
            <button type="button" onClick={handleRecommend} disabled={isRecommending || !tp} className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition">
                {isRecommending ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                Rekomendasi AI
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Model Pembelajaran</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full border-indigo-200 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
                    {LEARNING_MODELS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-indigo-800 mb-1">Metode Pembelajaran</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border-indigo-200 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
                    {LEARNING_METHODS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-indigo-800 mb-1">Tema Projek P5</label>
                <select value={p5Theme} onChange={(e) => setP5Theme(e.target.value)} className="w-full border-indigo-200 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
                     {P5_THEMES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* Section 5: Tanda Tangan (Upload Image) */}
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            Upload Tanda Tangan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="pt-4">
        <button 
            type="submit" 
            disabled={isGenerating}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg transform transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="animate-spin" />
                    Sedang Menyusun Modul (Mohon Tunggu)...
                </>
            ) : (
                <>
                    <Sparkles />
                    {initialConfig ? 'Simpan Perubahan' : 'Buat Modul Ajar Otomatis'}
                </>
            )}
        </button>
      </div>

    </form>
  );
};

export default ModuleForm;