import React, { useState } from 'react';
import { ModuleConfig, PaperSize } from '../types';
import { PAPER_SIZES } from '../constants';
import { ArrowLeft, FileDown, Edit, Settings } from 'lucide-react';

interface Props {
  moduleData: ModuleConfig;
  onBack: () => void;
  onEdit: () => void;
  onUpdate: (updatedModule: ModuleConfig) => void;
}

const ModulePreview: React.FC<Props> = ({ moduleData, onBack, onEdit, onUpdate }) => {
  const [paperSize, setPaperSize] = useState<PaperSize>(moduleData.paperSize || 'A4');

  const handlePaperSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value as PaperSize;
    setPaperSize(size);
    onUpdate({ ...moduleData, paperSize: size });
  };

  const handleDownloadDocx = () => {
    // Definisi CSS yang akan disuntikkan ke dalam file Word agar tampilan rapi
    const cssStyles = `
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000000; }
        h2 { font-size: 14pt; text-transform: uppercase; font-weight: bold; text-align: center; margin-bottom: 0; }
        h3 { font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; }
        h4 { font-size: 12pt; font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; }
        p { margin-bottom: 8pt; text-align: justify; }
        ul, ol { margin-bottom: 8pt; margin-left: 20pt; }
        li { margin-bottom: 4pt; }
        
        /* Tabel Standar */
        table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; }
        th, td { border: 1px solid #000000; padding: 6px; vertical-align: top; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
        
        /* Tabel Header (Kop) - Tanpa Border */
        .header-table, .header-table td { border: none !important; padding: 2px; }
        
        /* Tabel Tanda Tangan - Tanpa Border */
        .signature-table, .signature-table td { border: none !important; text-align: center; }

        /* LKPD Box (Kotak Lembar Kerja) */
        .lkpd-box { 
            border: 2px solid #000000; 
            padding: 12pt; 
            margin-top: 12pt; 
            margin-bottom: 12pt;
        }
        
        /* Page Break */
        .page-break { page-break-before: always; }
    `;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
         <head><meta charset='utf-8'><title>Modul Ajar</title>
         <style>${cssStyles}</style>
         </head><body>`;
    
    const footer = "</body></html>";
    // Ambil konten HTML
    const content = document.getElementById('module-content')?.innerHTML;
    
    if (content) {
        const fullHtml = header + content + footer;
        const blob = new Blob(['\ufeff', fullHtml], {
            type: 'application/msword'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Modul_${moduleData.subjectName.replace(/\s+/g, '_')}_Kelas${moduleData.grade}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Gagal mengunduh: Konten tidak ditemukan.");
    }
  };

  const formattedDate = new Date(moduleData.moduleDate).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="bg-gray-200 min-h-screen pb-10 font-serif print:bg-white print:pb-0 print:h-auto">
      {/* GLOBAL STYLES FOR PREVIEW & PRINT */}
      <style>{`
        /* 1. Document Typography & Spacing */
        .doc-font { font-family: 'Times New Roman', serif; color: black; line-height: 1.6; }
        .doc-content p { margin-bottom: 1rem; text-align: justify; }
        .doc-content h3 { font-size: 13pt; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
        .doc-content h4 { font-size: 12pt; font-weight: bold; margin-top: 1.2rem; margin-bottom: 0.4rem; }
        
        /* 2. List Styling */
        .doc-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .doc-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .doc-content li { margin-bottom: 0.3rem; }

        /* 3. Table Styling (Strict Borders) */
        .doc-content table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        .doc-content th, .doc-content td { border: 1px solid black !important; padding: 8px 10px; vertical-align: top; }
        .doc-content th { background-color: #f3f4f6; font-weight: bold; text-align: center; vertical-align: middle; }
        
        /* 4. LKPD Box Style (Modern & Clean) */
        .lkpd-box {
            border: 2px solid #2d2d2d;
            border-radius: 0px; /* Formal documents usually use square corners */
            padding: 1.5rem;
            margin: 2rem 0;
            background-color: #ffffff;
            position: relative;
            page-break-inside: avoid; /* Prevent splitting LKPD box across pages */
        }

        /* 5. Print Specific Configurations */
        @media print {
            /* Reset Page Margins to 0 so we control layout via padding on the div */
            @page { 
                margin: 0;
                size: ${paperSize === 'F4' ? '215mm 330mm' : paperSize};
            }
            
            body { 
                background: white; 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
            }

            /* Hide Navigation & UI */
            .no-print { display: none !important; }
            
            /* Print Container Sizing */
            #module-content {
                width: 100% !important;
                margin: 0 !important;
                padding: 2cm !important; /* Standard Margin 2cm */
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
            }

            /* Page Breaks */
            .page-break { page-break-before: always; margin-top: 2rem; display: block; height: 1px; }
            h3 { break-after: avoid; }
            tr { break-inside: avoid; }
            
            /* Ensure links are plain text */
            a { text-decoration: none; color: black; }
        }
      `}</style>

      {/* Action Bar (Hidden when printing) */}
      <div className="no-print bg-white border-b sticky top-0 z-50 px-4 py-3 shadow-md flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="flex items-center text-gray-700 hover:text-black font-medium px-3 py-2 rounded hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </button>
             <button onClick={onEdit} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded hover:bg-indigo-50">
                <Edit className="w-4 h-4 mr-2" /> Edit Data
            </button>
        </div>

        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border">
                <Settings className="w-4 h-4 text-gray-500" />
                <select 
                    value={paperSize} 
                    onChange={handlePaperSizeChange} 
                    className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-gray-700"
                >
                    <option value="A4">Kertas A4</option>
                    <option value="F4">Kertas F4</option>
                    <option value="Letter">Kertas Letter</option>
                </select>
            </div>

             <button onClick={handleDownloadDocx} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm">
                <FileDown className="w-4 h-4" /> Unduh .DOC / Word
            </button>
        </div>
      </div>

      {/* Paper Container */}
      <div className="flex justify-center mt-8 mb-8 print:mt-0 print:mb-0">
        <div 
            id="module-content"
            className={`doc-font bg-white shadow-xl p-[20mm] ${PAPER_SIZES[paperSize]} mx-auto text-black`}
        >
            {/* Header / Kop Modul */}
            <div className="text-center mb-6">
                <h2 className="text-16pt font-bold uppercase leading-tight">MODUL AJAR KURIKULUM MERDEKA</h2>
                <h2 className="text-14pt font-bold uppercase leading-tight mb-2">{moduleData.schoolName}</h2>
                <div className="border-b-4 border-double border-black my-4"></div>
                
                <table className="header-table w-full text-11pt mb-4" style={{ border: 'none', marginBottom: '0.5rem' }}>
                    <tbody>
                        <tr style={{ border: 'none' }}>
                            <td style={{ width: '18%', border: 'none', padding: '2px' }}><strong>Penyusun</strong></td>
                            <td style={{ width: '2%', border: 'none', padding: '2px' }}>:</td>
                            <td style={{ width: '40%', border: 'none', padding: '2px' }}>{moduleData.teacherName}</td>
                            <td style={{ width: '15%', border: 'none', padding: '2px' }}><strong>Fase / Kelas</strong></td>
                            <td style={{ width: '2%', border: 'none', padding: '2px' }}>:</td>
                            <td style={{ width: '23%', border: 'none', padding: '2px' }}>{moduleData.grade <= 2 ? 'A' : moduleData.grade <= 4 ? 'B' : 'C'} / {moduleData.grade}</td>
                        </tr>
                        <tr style={{ border: 'none' }}>
                            <td style={{ border: 'none', padding: '2px' }}><strong>Instansi</strong></td>
                            <td style={{ border: 'none', padding: '2px' }}>:</td>
                            <td style={{ border: 'none', padding: '2px' }}>{moduleData.schoolName}</td>
                            <td style={{ border: 'none', padding: '2px' }}><strong>Mata Pelajaran</strong></td>
                            <td style={{ border: 'none', padding: '2px' }}>:</td>
                            <td style={{ border: 'none', padding: '2px' }}>{moduleData.subjectName}</td>
                        </tr>
                        <tr style={{ border: 'none' }}>
                            <td style={{ border: 'none', padding: '2px' }}><strong>Tahun Ajaran</strong></td>
                            <td style={{ border: 'none', padding: '2px' }}>:</td>
                            <td style={{ border: 'none', padding: '2px' }}>{moduleData.academicYear}</td>
                            <td style={{ border: 'none', padding: '2px' }}><strong>Alokasi Waktu</strong></td>
                            <td style={{ border: 'none', padding: '2px' }}>:</td>
                            <td style={{ border: 'none', padding: '2px' }}>{moduleData.timeAllocation}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="border-b-2 border-black mb-6"></div>
            </div>

            {/* AI Generated Content */}
            <div 
                className="doc-content"
                dangerouslySetInnerHTML={{ __html: moduleData.content || '' }} 
            />

            {/* Signatures Section */}
            <div className="mt-12 avoid-break" style={{ pageBreakInside: 'avoid' }}>
                <table className="signature-table w-full" style={{ border: 'none', marginTop: '3rem' }}>
                    <tbody>
                        <tr style={{ border: 'none' }}>
                            <td style={{ width: '50%', border: 'none', textAlign: 'center', verticalAlign: 'top' }}>
                                <p style={{ marginBottom: '0', textAlign: 'center' }}>Mengetahui,</p>
                                <p style={{ marginTop: '0', textAlign: 'center', marginBottom: '10px' }}>Kepala Sekolah</p>
                                <div style={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                                    {moduleData.principalSignature ? (
                                        <img src={moduleData.principalSignature} alt="Tanda Tangan KS" style={{ maxHeight: '80px', maxWidth: '150px' }} />
                                    ) : (
                                        <div style={{ height: '80px' }}></div>
                                    )}
                                </div>
                                <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '0', marginTop: '10px', textAlign: 'center' }}>
                                    {moduleData.principalName || '..........................'}
                                </p>
                                <p style={{ marginTop: '0', textAlign: 'center' }}>NIP. {moduleData.principalNip || '..........................'}</p>
                            </td>
                            <td style={{ width: '50%', border: 'none', textAlign: 'center', verticalAlign: 'top' }}>
                                <p style={{ marginBottom: '0', textAlign: 'center' }}>{moduleData.schoolName.split(' ')[0] === 'SD' ? 'Kota' : ''} .................., {formattedDate}</p>
                                <p style={{ marginTop: '0', textAlign: 'center', marginBottom: '10px' }}>Guru Kelas / Mapel</p>
                                <div style={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                                    {moduleData.teacherSignature ? (
                                        <img src={moduleData.teacherSignature} alt="Tanda Tangan Guru" style={{ maxHeight: '80px', maxWidth: '150px' }} />
                                    ) : (
                                        <div style={{ height: '80px' }}></div>
                                    )}
                                </div>
                                <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '0', marginTop: '10px', textAlign: 'center' }}>
                                    {moduleData.teacherName}
                                </p>
                                <p style={{ marginTop: '0', textAlign: 'center' }}>NIP. {moduleData.teacherNip || '..........................'}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePreview;