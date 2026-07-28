import { Pangkalan, PersyaratanStatus } from '../types';

// Default initial pangkalan list is now clean/empty as requested by user ("data dummynya di hapus")
export const INITIAL_PANGKALAN_LIST: Pangkalan[] = [];

export const PEMDA_INFO = {
  nama: "PEMERINTAH KABUPATEN NAGEKEO",
  instansi: "BAGIAN PEREKONOMIAN DAN SDA SETDA KABUPATEN NAGEKEO",
  alamat: "Mbay, Kab. Nagekeo, Nusa Tenggara Timur",
  kabupaten: "NAGEKEO",
  provinsi: "NUSA TENGGARA TIMUR",
  sistemTitle: "Sistem Rekomendasi & Pengawasan Pangkalan Minyak Tanah Subsidi",
};

export const AGEN_INFO = {
  nama: "PT. PUTRA NGADA ENERGI (NAGEKEO)",
  alamat: "JLN. PATTIMURA - BAJAWA",
  kabupaten: "NAGEKEO",
  provinsi: "NUSA TENGGARA TIMUR"
};

export const INITIAL_CHECKLIST_STATUS: Record<string, PersyaratanStatus> = {};
