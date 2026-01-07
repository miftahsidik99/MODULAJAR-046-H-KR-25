import { P5Theme, LearningModel, LearningMethod, PaperSize } from './types';

export const CLASSES = [1, 2, 3, 4, 5, 6];

export const PAPER_SIZES: Record<PaperSize, string> = {
  'A4': 'max-w-[210mm] min-h-[297mm]',
  'F4': 'max-w-[215mm] min-h-[330mm]', // Indonesian F4 is often 21.5 x 33 cm
  'Letter': 'max-w-[216mm] min-h-[279mm]',
};

export const SUBJECTS = {
  UMUM: ['Bahasa Indonesia', 'Matematika', 'PPKn (Pendidikan Pancasila)', 'PJOK', 'IPAS', 'Bahasa Inggris'],
  AGAMA: ['Pendidikan Agama Islam', 'Pendidikan Agama Kristen', 'Pendidikan Agama Katolik', 'Pendidikan Agama Hindu', 'Pendidikan Agama Buddha', 'Pendidikan Agama Khonghucu'],
  SENI: ['Seni Rupa', 'Seni Musik', 'Seni Tari', 'Seni Teater'],
  MULOK: ['Bahasa Jawa', 'Bahasa Sunda', 'Bahasa Bali', 'Budaya Alam Minangkabau', 'Potensi Lokal Lainnya'],
  KHUSUS: ['Koding & Kecerdasan Artifisial (KKA)'], // Only for class 5
};

export const P5_THEMES: P5Theme[] = [
  { name: 'Gaya Hidup Berkelanjutan', description: 'Memahami dampak aktivitas manusia terhadap lingkungan.' },
  { name: 'Kearifan Lokal', description: 'Membangun rasa ingin tahu dan kemampuan inkuiri melalui eksplorasi budaya.' },
  { name: 'Bhinneka Tunggal Ika', description: 'Mengenal dan menghargai budaya, menghormati perbedaan.' },
  { name: 'Bangunlah Jiwa dan Raganya', description: 'Membangun kesejahteraan fisik dan mental.' },
  { name: 'Suara Demokrasi', description: 'Menggunakan hak suara dan berpartisipasi dalam pengambilan keputusan.' },
  { name: 'Rekayasa dan Teknologi', description: 'Melatih daya pikir kritis, kreatif, inovatif melalui teknologi.' },
  { name: 'Kewirausahaan', description: 'Mengidentifikasi potensi ekonomi dan peluang usaha.' },
];

export const LEARNING_MODELS: LearningModel[] = [
  { name: 'Project-Based Learning (PjBL)', description: 'Pembelajaran berbasis proyek nyata untuk memecahkan masalah.' },
  { name: 'Problem-Based Learning (PBL)', description: 'Pembelajaran yang dimulai dengan masalah nyata sebagai konteks belajar.' },
  { name: 'Inquiry-Based Learning', description: 'Pembelajaran yang menekankan pada proses penemuan dan penyelidikan.' },
  { name: 'Discovery Learning', description: 'Memahami konsep, arti, dan hubungan melalui proses intuitif.' },
  { name: 'Contextual Teaching and Learning (CTL)', description: 'Mengaitkan materi dengan situasi dunia nyata siswa.' },
  { name: 'Cooperative Learning', description: 'Belajar dalam kelompok kecil untuk saling membantu memahami materi.' },
];

export const LEARNING_METHODS: LearningMethod[] = [
  { name: 'Diskusi Kelompok', description: 'Bertukar pikiran untuk memecahkan masalah bersama.' },
  { name: 'Tanya Jawab', description: 'Interaksi dua arah untuk menggali pemahaman siswa.' },
  { name: 'Demonstrasi', description: 'Memperagakan proses atau cara kerja sesuatu.' },
  { name: 'Eksperimen/Percobaan', description: 'Siswa melakukan percobaan untuk membuktikan teori.' },
  { name: 'Ceramah Interaktif', description: 'Penjelasan guru diselingi pertanyaan pancingan.' },
  { name: 'Role Playing', description: 'Bermain peran untuk menirukan situasi nyata.' },
  { name: 'Karyawisata', description: 'Kunjungan ke objek belajar di luar kelas.' },
  { name: 'Resitasi', description: 'Pemberian tugas untuk dikerjakan siswa.' },
];

export const DEEP_LEARNING_APPROACH = "Deep Learning (Mindful, Meaningful, Joyful)";