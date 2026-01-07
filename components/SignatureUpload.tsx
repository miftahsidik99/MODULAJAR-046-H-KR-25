import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface SignatureUploadProps {
  label: string;
  onSave: (dataUrl: string) => void;
  initialData?: string;
}

const SignatureUpload: React.FC<SignatureUploadProps> = ({ label, onSave, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(initialData || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onSave(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview('');
    onSave('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      <div className="flex flex-col items-center gap-3">
        {preview ? (
          <div className="relative w-full h-32 bg-gray-50 border rounded flex items-center justify-center overflow-hidden">
             <img src={preview} alt="Signature Preview" className="h-full object-contain" />
             <button 
                type="button" 
                onClick={handleClear}
                className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
             >
                <X className="w-4 h-4" />
             </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">Upload Gambar Tanda Tangan</span>
            <span className="text-[10px] text-gray-400">(Format: PNG/JPG, Transparan lebih baik)</span>
          </div>
        )}
        
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
        />
        
        {!preview && (
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
                <Upload className="w-4 h-4" /> Pilih File
            </button>
        )}
      </div>
    </div>
  );
};

export default SignatureUpload;