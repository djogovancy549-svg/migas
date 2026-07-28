import { Pangkalan, PersyaratanStatus, AgenCompany } from '../types';

// Default initial pangkalan list is clean/empty as requested by user
export const INITIAL_PANGKALAN_LIST: Pangkalan[] = [];

export const INITIAL_AGEN_LIST: AgenCompany[] = [
  {
    id: 'agen_1',
    nama: 'PT. PUTRA NGADA ENERGI (NAGEKEO)',
    singkatan: 'PT. PNE',
    alamat: 'Jln. Pattimura - Bajawa / Mbay',
    kabupaten: 'NAGEKEO',
    provinsi: 'NUSA TENGGARA TIMUR',
    telepon: '0812-3456-7890',
    penanggungJawab: 'Direktur Utama PT. PNE',
  },
  {
    id: 'agen_2',
    nama: 'PT. NAGEKEO MIGAS SEJAHTERA',
    singkatan: 'PT. NMS',
    alamat: 'Jln. Soekarno-Hatta Mbay',
    kabupaten: 'NAGEKEO',
    provinsi: 'NUSA TENGGARA TIMUR',
    telepon: '0813-9876-5432',
    penanggungJawab: 'Manajer Operasional PT. NMS',
  },
];

export const PEMDA_INFO = {
  nama: "PEMERINTAH KABUPATEN NAGEKEO",
  instansi: "BAGIAN PEREKONOMIAN DAN SDA SETDA KABUPATEN NAGEKEO",
  alamat: "Mbay, Kab. Nagekeo, Nusa Tenggara Timur",
  kabupaten: "NAGEKEO",
  provinsi: "NUSA TENGGARA TIMUR",
  sistemName: "SIPERMATA",
  sistemFullName: "Sistem Pengurusan Perizinan Minyak Tanah",
  sistemTitle: "SIPERMATA - Sistem Pengurusan Perizinan & Rekomendasi Minyak Tanah Subsidi",
};

export const AGEN_INFO = {
  nama: "PT. PUTRA NGADA ENERGI (NAGEKEO)",
  alamat: "JLN. PATTIMURA - BAJAWA",
  kabupaten: "NAGEKEO",
  provinsi: "NUSA TENGGARA TIMUR"
};

export const INITIAL_CHECKLIST_STATUS: Record<string, PersyaratanStatus> = {};
