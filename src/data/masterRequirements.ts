import { MasterRequirementItem } from '../types';

export const INITIAL_MASTER_REQUIREMENTS: MasterRequirementItem[] = [
  {
    key: 'suratPermohonan',
    label: 'Surat Permohonan Perpanjangan Rekomendasi / Baru',
    requiredFor: 'Semua',
    mandatory: true,
    description: 'Format ditujukan kepada Kepala Bagian Perekonomian dan SDA Setda Kab. Nagekeo'
  },
  {
    key: 'ktp',
    label: 'Fotokopi KTP Pemilik / Pengelola Pangkalan',
    requiredFor: 'Semua',
    mandatory: true,
    description: 'Identitas resmi penduduk Kabupaten Nagekeo (PDF / JPG / PNG)'
  },
  {
    key: 'nib',
    label: 'Nomor Induk Berusaha (NIB) / Izin Usaha Perdagangan',
    requiredFor: 'Semua',
    mandatory: true,
    description: 'NIB yang terdaftar di OSS Kemeninvest/BKPM'
  },
  {
    key: 'sku',
    label: 'Surat Keterangan Usaha (SKU) Desa / Kelurahan',
    requiredFor: 'Semua',
    mandatory: true,
    description: 'Surat Keterangan Usaha Pangkalan Minyak Tanah dari Lurah/Kepala Desa'
  },
  {
    key: 'suratPernyataan',
    label: 'Surat Pernyataan Pangkalan Bermeterai Rp 10.000',
    requiredFor: 'Semua',
    mandatory: true,
    description: 'Kesanggupan mematuhi HET, larangan penimbunan & standar keamanan'
  },
  {
    key: 'rekomendasiSebelumnya',
    label: 'Fotokopi Surat Rekomendasi Tahun Sebelumnya',
    requiredFor: 'Perpanjangan',
    mandatory: true,
    description: 'Khusus untuk perpanjangan izin pangkalan lama'
  },
  {
    key: 'suratPernyataanPendropingan',
    label: 'Surat Keterangan Pendropingan dari Agen PT. PNE',
    requiredFor: 'Baru',
    mandatory: true,
    description: 'Khusus untuk pangkalan pemohon baru'
  },
  {
    key: 'npwp',
    label: 'Fotokopi NPWP Pemilik / Pangkalan',
    requiredFor: 'Semua',
    mandatory: false,
    description: 'Nomor Pokok Wajib Pajak perorangan / badan'
  },
  {
    key: 'fotoTempatUsaha',
    label: 'Foto Tempat Usaha & Tabung / Drum Pangkalan',
    requiredFor: 'Semua',
    mandatory: false,
    description: 'Dokumentasi fisik kelayakan tempat penjualan minyak tanah'
  }
];
