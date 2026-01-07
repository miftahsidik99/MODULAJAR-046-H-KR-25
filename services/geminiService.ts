import { GoogleGenAI } from "@google/genai";
import { ModuleConfig } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set REACT_APP_GEMINI_API_KEY or process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateModuleContent = async (config: ModuleConfig): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    Bertindaklah sebagai Ahli Kurikulum dan Pengembang Perangkat Ajar Profesional.
    Buatlah **ISI MODUL AJAR (KURIKULUM MERDEKA - EDISI REVISI)** yang sangat rapi, formal, dan siap cetak.

    **Informasi Dasar:**
    - Mapel: ${config.subjectName}
    - Kelas: ${config.grade}
    - Topik/Materi: Berdasarkan CP: "${config.cp}"
    - Alokasi Waktu: ${config.timeAllocation}

    **Instruksi Format (CRITICAL):**
    1.  **JANGAN** sertakan Kop Surat / Identitas Guru / Tanda Tangan di output ini (karena sudah ada di layout aplikasi). Mulai langsung dari **A. INFORMASI UMUM**.
    2.  Gunakan tag HTML standar: <h3> untuk Judul Besar, <h4> untuk Sub-judul, <p> untuk paragraf.
    3.  **TABEL**: Gunakan tabel HTML (<table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">) untuk bagian "Informasi Umum" dan "Komponen Inti".
    4.  **PEMISAH HALAMAN**: Gunakan tag <div class="page-break"></div> sebelum masuk ke BAGIAN LAMPIRAN.
    5.  **LKPD**: Gunakan tag <div class="lkpd-box"> untuk membungkus konten LKPD.

    **Struktur Konten:**

    **A. INFORMASI UMUM**
    (Buat dalam satu TABEL border lengkap)
    - Kompetensi Awal
    - Profil Pelajar Pancasila
    - Sarana dan Prasarana
    - Target Peserta Didik
    - Model Pembelajaran: ${config.model} (Jelaskan singkat)

    **B. KOMPONEN INTI**
    1.  **Tujuan Pembelajaran**
        (Sebutkan TP: "${config.tp}" lalu jabarkan menjadi indikator/KKTP).
    2.  **Pemahaman Bermakna** (Kaitkan dengan Deep Learning)
    3.  **Pertanyaan Pemantik**
    4.  **Kegiatan Pembelajaran**
        (Gunakan TABEL dengan 3 kolom: Tahap, Kegiatan Guru & Peserta Didik, Alokasi Waktu).
        *   *Pendahuluan*: (Apersepsi, Motivasi)
        *   *Inti*: (Wajib menampilkan sintaks model **${config.model}** secara eksplisit. Masukkan unsur **Deep Learning** yakni *Mindful* (fokus), *Meaningful* (bermakna), *Joyful* (menyenangkan)).
        *   *Penutup*: (Refleksi, Tindak lanjut).
    5.  **Asesmen**
        (Sebutkan jenis asesmen: Diagnostik, Formatif, Sumatif).
    6.  **Pengayaan dan Remedial**

    <div class="page-break"></div>

    **C. LAMPIRAN**

    1.  **LEMBAR KERJA PESERTA DIDIK (LKPD)**
        (Buatlah LKPD yang **LENGKAP, DETAIL, dan SIAP CETAK** di dalam <div class="lkpd-box">).
        *   Buat Header LKPD: Judul Aktivitas, Mata Pelajaran, Kelas, Nama Anggota Kelompok.
        *   Tujuan Kegiatan.
        *   Alat dan Bahan.
        *   **Langkah Kerja**: Instruksi langkah demi langkah yang jelas untuk siswa.
        *   **Lembar Jawab/Hasil**: Sediakan tabel kosong, bagan, atau garis-garis isian yang cukup besar untuk siswa menulis jawaban mereka langsung di kertas ini.
        *   **Rubrik Penilaian**: Tabel kriteria penilaian singkat untuk aktivitas ini.

    2.  **Bahan Bacaan Guru & Peserta Didik** (Ringkasan materi esensial 2-3 paragraf).
    3.  **Glosarium** (Daftar istilah penting).
    4.  **Daftar Pustaka**.

    Hasilkan HTML murni yang rapi.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    return response.text || "Gagal menghasilkan konten. Silakan coba lagi.";
  } catch (error) {
    console.error("Error generating module:", error);
    throw error;
  }
};

export const recommendModelAndMethod = async (grade: number, subject: string, tp: string): Promise<{model: string, method: string}> => {
   const ai = getClient();
   const prompt = `
     Berdasarkan Kelas ${grade} SD, Mata Pelajaran ${subject}, dan Tujuan Pembelajaran: "${tp}",
     Rekomendasikan SATU Model Pembelajaran dan SATU Metode Pembelajaran yang paling cocok dengan pendekatan Deep Learning.
     
     Format respon JSON:
     {
       "model": "Nama Model",
       "method": "Nama Metode"
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
     return JSON.parse(response.text || '{}');
   } catch (e) {
     return { model: 'Problem-Based Learning (PBL)', method: 'Diskusi Kelompok' }; // Fallback
   }
};