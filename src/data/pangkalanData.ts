import { Pangkalan, PersyaratanStatus, AgenCompany, HetKecamatan } from '../types';

// Super Admin / Developer Permanent Emails
export const SUPER_ADMIN_EMAILS = [
  'djogovancy549@gmail.com',
  'bagianekonomisdangk@gmail.com',
];

export const DEFAULT_AUTHORIZED_ADMIN_EMAILS = [
  'djogovancy549@gmail.com',
  'bagianekonomisdangk@gmail.com',
  'admin.perekonomian@nagekeokab.go.id',
];

// Initial pangkalan list populated with data from Admin Google Sheet
export const INITIAL_PANGKALAN_LIST: Pangkalan[] = [];

export const INITIAL_HET_LIST: HetKecamatan[] = [
  { kecamatan: 'Aesesa', hargaHetPerLiter: 4660, skBupatiNomor: '236/KEP/HK/2018' },
  { kecamatan: 'Boawae', hargaHetPerLiter: 4675, skBupatiNomor: '236/KEP/HK/2018' },
  { kecamatan: 'Mauponggo', hargaHetPerLiter: 5095, skBupatiNomor: '236/KEP/HK/2018' },
  { kecamatan: 'Aesesa Selatan', hargaHetPerLiter: 4800, skBupatiNomor: '236/KEP/HK/2018' },
  { kecamatan: 'Wolowae', hargaHetPerLiter: 4700, skBupatiNomor: '236/KEP/HK/2018' },
  { kecamatan: 'Nangaroro', hargaHetPerLiter: 4850, skBupatiNomor: '236/KEP/HK/2018' },
  { kecamatan: 'Keo Tengah', hargaHetPerLiter: 5100, skBupatiNomor: '236/KEP/HK/2018' },
];

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

export const DEFAULT_ADMIN_SHEET_ID = '12cZeEn70SByneJN8G5jLP9rJvNus2G6TIzbk3W39OSI';
export const DEFAULT_ADMIN_SHEET_URL = 'https://docs.google.com/spreadsheets/d/12cZeEn70SByneJN8G5jLP9rJvNus2G6TIzbk3W39OSI/edit?gid=0#gid=0';

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

export const INITIAL_CHECKLIST_STATUS: Record<string, PersyaratanStatus> = {
  'PGK-7777': {
    pangkalanId: 'PGK-7777',
    jenis: 'Perpanjangan',
    suratPermohonan: true,
    ktp: true,
    npwp: true,
    nib: true,
    sku: true,
    suratPernyataan: true,
    rekomendasiSebelumnya: true,
  },
  'PGK-6228': {
    pangkalanId: 'PGK-6228',
    jenis: 'Perpanjangan',
    suratPermohonan: true,
    ktp: true,
    npwp: true,
    nib: true,
    sku: true,
    suratPernyataan: true,
    rekomendasiSebelumnya: true,
  },
  'PGK-3983': {
    pangkalanId: 'PGK-3983',
    jenis: 'Perpanjangan',
    suratPermohonan: true,
    ktp: true,
    npwp: true,
    nib: true,
    sku: true,
    suratPernyataan: true,
    rekomendasiSebelumnya: true,
  },
  'PGK-6191': {
    pangkalanId: 'PGK-6191',
    jenis: 'Perpanjangan',
    suratPermohonan: true,
    ktp: true,
    npwp: true,
    nib: true,
    sku: true,
    suratPernyataan: true,
    rekomendasiSebelumnya: true,
  },
  'PGK-9876': {
    pangkalanId: 'PGK-9876',
    jenis: 'Perpanjangan',
    suratPermohonan: true,
    ktp: true,
    npwp: true,
    nib: true,
    sku: true,
    suratPernyataan: true,
    rekomendasiSebelumnya: true,
  },
  'PGK-5102': {
    pangkalanId: 'PGK-5102',
    jenis: 'Perpanjangan',
    suratPermohonan: true,
    ktp: true,
    npwp: true,
    nib: true,
    sku: true,
    suratPernyataan: true,
    rekomendasiSebelumnya: true,
  },
};
