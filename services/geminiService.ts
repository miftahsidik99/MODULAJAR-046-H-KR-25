import { GoogleGenAI } from "@google/genai";
import { ModuleConfig, AIRecommendation } from "../types";

const getClient = () => {
  // Value of process.env.API_KEY is injected by vite.config.ts during build
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("CRITICAL ERROR: API Key is missing in the browser environment.");
    throw new Error("Koneksi ke AI Gagal: API Key belum dikonfigurasi. Mohon cek pengaturan Vercel (VITE_GEMINI_API_KEY).");
  }
  return new GoogleGenAI({ apiKey });
};

export const findSchoolsWithAI = async (province: string, regency: string, district: string): Promise<string[]> => {
  try {
    const ai = getClient();
    
    // UPDATE: Prompt dibuat lebih komprehensif untuk menangkap seluruh data sekolah
    const prompt = `
      Temukan daftar LENGKAP seluruh Sekolah Dasar (SD) dan Madrasah Ibtidaiyah (MI) yang ada di:
      Kecamatan ${district}, ${regency}, ${province}.
      
      Tugas:
      1. Gunakan Google Search untuk menelusuri database sekolah (seperti Data Pokok Pendidikan/Dapodik, referensi Kemdikbud, atau direktori sekolah).
      2. Daftarkan SEMUA sekolah yang valid di kecamatan tersebut, meliputi:
         - SD Negeri (contoh: SDN 1 ..., SDN Inpres ...)
         - SD Swasta (contoh: SDS ..., SD Islam Terpadu ...)
         - Madrasah Ibtidaiyah Negeri & Swasta (MIN ..., MIS ...)
      3. Jangan batasi jumlah hasil. Tuliskan sebanyak mungkin yang ditemukan.
      
      Format Output:
      - HANYA tuliskan nama sekolah.
      - Satu nama sekolah per baris.
      - Jangan gunakan nomor urut atau simbol bullet.
      
      Contoh Output yang Benar:
      SDN 1 ${district}
      SDN 2 ${district}
      SD Islam Terpadu Bina Insani
      MIS Al Falah
      UPT SDN ${district}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || '';
    
    // UPDATE: Parsing Logic yang lebih baik
    const schools = text.split('\n')
      .map(line => {
        // Bersihkan bullet points, nomor, dan spasi di awal
        let clean = line.replace(/^[\d\.\-\*\•\s]+/, '').trim();
        // Hapus sitasi referensi [1], [source]
        clean = clean.replace(/\[.*?\]/g, '');
        // Hapus formatting markdown
        clean = clean.replace(/[*_]/g, '');
        return clean;
      })
      .filter(line => {
        const upper = line.toUpperCase();
        
        // Filter Kata Kunci: Memastikan yang masuk adalah sekolah
        const isSchool = 
            upper.includes('SD') || 
            upper.includes('MI') || 
            upper.includes('SEKOLAH') || 
            upper.includes('MADRASAH') ||
            upper.includes('UPT') || 
            upper.includes('YAYASAN');
            
        // Filter Sampah: Membuang kalimat percakapan AI
        const isJunk = 
            upper.includes('BERIKUT') || 
            upper.includes('DAFTAR') || 
            upper.includes('MAAF') ||
            upper.includes('SAYA TIDAK') || 
            upper.includes('MENCARI') ||
            upper.length < 5; // Nama sekolah biasanya lebih dari 5 huruf

        return isSchool && !isJunk;
      })
      .filter((value, index, self) => self.indexOf(value) === index) // Hapus duplikat
      .sort(); // Urutkan sesuai abjad A-Z untuk memudahkan pencarian

    // UPDATE: Limit .slice(0, 15) DIHAPUS agar semua data tampil
    return schools;

  } catch (error) {
    console.error("Error searching schools:", error);
    return [];
  }
};

export const generateModuleContent = async (config: ModuleConfig): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    Bertindaklah sebagai Ahli Kurikulum dan Pengembang Perangkat Ajar Profesional (Kurikulum Merdeka - Revisi 2025).
    Buatlah **ISI MODUL AJAR** yang sangat rapi, formal, dan siap cetak.

    **Konteks Regulasi:**
    - Mengacu pada Keputusan Kepala BSKAP No. 032/H/KR/2024 (Capaian Pembelajaran) dan referensi terbaru BSKAP 046/H/KR/2025.
    - Pendekatan: Deep Learning (Mindful, Meaningful, Joyful).

    **Data Modul:**
    - Mapel: ${config.subjectName}
    - Kelas: ${config.grade}
    - Topik/Materi (CP): "${config.cp}"
    - Alokasi Waktu: ${config.timeAllocation}
    - Model Pembelajaran: ${config.model}
    - Metode: ${config.method}
    - Profil Pelajar Pancasila: ${config.p5Theme}
    
    **Insight AI (Gunakan sebagai panduan alur):**
    - Analisis Taksonomi TP: ${config.aiTaxonomy || '-'}
    - Alasan Pemilihan Model: ${config.aiReasoning || '-'}

    **Instruksi Format (CRITICAL):**
    1.  **JANGAN** sertakan Kop Surat / Identitas Guru (sudah ada di layout aplikasi). Mulai langsung dari **A. INFORMASI UMUM**.
    2.  Gunakan tag HTML standar: <h3> untuk Judul Besar, <h4> untuk Sub-judul, <p> untuk paragraf, <ul>/<ol> untuk list.
    3.  **TABEL**: Gunakan tabel HTML (<table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">) untuk bagian "Informasi Umum" dan "Komponen Inti".
    4.  **PEMISAH HALAMAN**: Gunakan tag <div class="page-break"></div> sebelum masuk ke BAGIAN LAMPIRAN.
    5.  **LKPD**: Gunakan tag <div class="lkpd-box"> untuk membungkus konten LKPD. Pastikan instruksi LKPD selaras dengan model ${config.model}.

    **Struktur Konten:**

    **A. INFORMASI UMUM**
    (Tabel)
    - Kompetensi Awal
    - Profil Pelajar Pancasila (Fokus pada: ${config.p5Theme})
    - Sarana dan Prasarana
    - Target Peserta Didik
    - Model Pembelajaran: ${config.model}

    **B. KOMPONEN INTI**
    1.  **Tujuan Pembelajaran**
        (Sebutkan TP: "${config.tp}" lalu jabarkan menjadi indikator/KKTP yang terukur).
    2.  **Pemahaman Bermakna** (Deep Learning: Mengapa materi ini penting bagi kehidupan siswa?)
    3.  **Pertanyaan Pemantik**
    4.  **Kegiatan Pembelajaran**
        (Gunakan TABEL 3 kolom: Tahap, Kegiatan (Guru & Siswa), Alokasi Waktu).
        *   *Pendahuluan*: (Apersepsi, Motivasi, Pertanyaan Pemantik).
        *   *Inti*: (WAJIB menampilkan sintaks model **${config.model}** secara eksplisit langkah demi langkah). Pastikan aktivitas mencerminkan *Deep Learning*.
        *   *Penutup*: (Refleksi, Tindak lanjut).
    5.  **Asesmen**
        (Diagnostik, Formatif, Sumatif).
    6.  **Pengayaan dan Remedial**

    <div class="page-break"></div>

    **C. LAMPIRAN**

    1.  **LEMBAR KERJA PESERTA DIDIK (LKPD)**
        (Buatlah LKPD yang siap cetak di dalam <div class="lkpd-box">).
        - Judul Aktivitas.
        - Langkah Kerja (Sesuai metode ${config.method}).
        - Area/Tabel untuk jawaban siswa.
        - Rubrik Penilaian Singkat.

    2.  **Bahan Bacaan Guru & Peserta Didik** (Ringkasan materi 2-3 paragraf).
    3.  **Glosarium**.
    4.  **Daftar Pustaka**.

    Output HTML Only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    return response.text || "Gagal menghasilkan konten. Silakan coba lagi.";
  } catch (error) {
    console.error("Error generating module:", error);
    throw error;
  }
};

export const recommendModelAndMethod = async (grade: number, subject: string, tp: string): Promise<AIRecommendation> => {
   const ai = getClient();
   const prompt = `
     Anda adalah Konsultan Kurikulum Merdeka (Ahli Pedagogi).
     
     **Input:**
     - Kelas: ${grade} SD
     - Mapel: ${subject}
     - Tujuan Pembelajaran (TP): "${tp}"
     - Regulasi: BSKAP 046/H/KR/2025

     **Tugas:**
     1. Analisis TP tersebut menggunakan Taksonomi Bloom/Anderson (Level Kognitif C1-C6).
     2. Rekomendasikan 1 Model Pembelajaran Terbaik yang cocok untuk TP tersebut (PjBL/PBL/Discovery/Inquiry/dll).
     3. Rekomendasikan 1 Metode Pembelajaran pendukung.
     4. Rekomendasikan 1 Tema P5 yang paling relevan.
     5. Berikan ALASAN (Reasoning) yang pedagogis dan logis mengapa kombinasi tersebut dipilih.

     **Format Respon JSON:**
     {
       "model": "Nama Model (Contoh: Problem-Based Learning)",
       "method": "Nama Metode (Contoh: Diskusi Kelompok)",
       "p5Theme": "Nama Tema P5 (Contoh: Gaya Hidup Berkelanjutan)",
       "reasoning": "Penjelasan singkat (maks 2 kalimat) mengapa model ini paling tepat untuk mencapai TP tersebut.",
       "taxonomyAnalysis": "Analisis Level Kognitif (Contoh: TP ini berada di level C4 (Menganalisis) karena siswa diminta untuk...)"
     }
   `;

   try {
     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
     });
     
     const text = response.text || '{}';
     return JSON.parse(text);
   } catch (e) {
     console.error("AI Recommendation Error", e);
     return { 
        model: 'Problem-Based Learning (PBL)', 
        method: 'Diskusi Kelompok',
        p5Theme: 'Bangunlah Jiwa dan Raganya',
        reasoning: 'Gagal menghubungi AI. Menggunakan rekomendasi default.',
        taxonomyAnalysis: 'Tidak dapat dianalisis.'
     }; 
   }
};