export interface HetKecamatan {
  kecamatan: string;
  hargaHetPerLiter: number;
  skBupatiNomor?: string;
  keterangan?: string;
}

export interface AgenCompany {
  id: string;
  nama: string;
  singkatan?: string;
  alamat?: string;
  kabupaten?: string;
  provinsi?: string;
  telepon?: string;
  penanggungJawab?: string;
  npwp?: string;
}

export type UserRole = 'customer' | 'admin' | 'agen';

export interface Pangkalan {
  id: string; // e.g. "001/PT PNE NGK"
  no?: number;
  nama: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  propinsi: string;
  kuotaHarianLiter?: number;
  kuotaBulananLiter?: number;
  statusPerizinan?: 'Aktif' | 'Perlu Perpanjangan' | 'Proses' | 'Belum Lengkap';
  // Additional profile fields for document auto-fill
  nik?: string;
  nib?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  pekerjaan?: string;
  nomorHp?: string;
  namaUsaha?: string;
  rekomendasiTahunSebelumnya?: string;
  agenId?: string;
  namaAgen?: string;
}

export type JenisPermohonan = 'Perpanjangan' | 'Baru';

export interface PersyaratanStatus {
  pangkalanId: string;
  jenis: JenisPermohonan;
  suratPermohonan: boolean;
  ktp: boolean;
  npwp: boolean;
  nib: boolean;
  sku: boolean; // Surat Keterangan Usaha Desa/Lurah
  suratPernyataanPendropingan?: boolean; // Khusus Baru
  suratPernyataan: boolean; // Meterai 10.000
  rekomendasiSebelumnya?: boolean; // Khusus Perpanjangan
  catatan?: string;
  [key: string]: boolean | string | undefined; // Support dynamic requirement keys added by Admin
}

export interface UploadedDocument {
  id: string;
  pangkalanId: string;
  documentKey: string; // e.g. 'ktp', 'nib', 'suratPermohonan', 'suratPernyataan', etc.
  documentName: string; // Display label e.g. "KTP Pemilik Pangkalan"
  fileName: string;
  fileType: string;
  fileSize: number;
  fileDataUrl?: string; // base64 or object url
  uploadedAt: string;
  status: 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak';
  catatanAdmin?: string;
}

export interface MasterRequirementItem {
  key: string;
  label: string;
  requiredFor: 'Perpanjangan' | 'Baru' | 'Semua';
  mandatory: boolean;
  description?: string;
  addedByAdmin?: boolean;
}

export interface RekomendasiPerizinan {
  id: string;
  pangkalanId: string;
  nomorRekomendasi: string;
  tanggalRekomendasi: string;
  berlakuSampai: string;
  status: 'Draft' | 'Menunggu Tanda Tangan Pimpinan' | 'Disetujui & Diterbitkan' | 'Ditolak';
  pimpinanNama: string;
  pimpinanNip: string;
  pimpinanJabatan: string;
  signedAt?: string;
  qrCodeDataUrl?: string;
  catatanPimpinan?: string;
}

export interface SuratPermohonanData {
  nomorSurat: string;
  lampiran: string;
  perihal: string;
  tanggal: string;
  tujuan: string; // e.g. "Kepala Bagian Perekonomian dan SDA Setda Kabupaten Nagekeo"
  nama: string;
  tempatTanggalLahir: string;
  pekerjaan: string;
  alamatUsaha: string;
  nomorHp: string;
  lokasiPangkalan: string;
  lampiranRekomendasiSebelumnya: boolean;
  lampiranKtp: boolean;
  lampiranSku: boolean;
  lampiranSuratPernyataan: boolean;
  lampiranNpwp: boolean;
}

export interface SuratPernyataanData {
  nama: string;
  nomorIdentitas: string;
  tempatTglLahir: string;
  alamat: string;
  nomorNib: string;
  namaPangkalan: string;
  noKontak: string;
  namaUsaha: string;
  alamatUsaha: string;
  hargaHetPerLiter: number;
  namaAgen: string;
  tanggalSurat: string;
  kotaSurat: string;
  includeMeteraiPlaceholder: boolean;
}
