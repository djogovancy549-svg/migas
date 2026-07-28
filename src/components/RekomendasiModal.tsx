import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Printer,
  ShieldCheck,
  Key,
  Flame,
  Award,
  Building2,
  Calendar,
  Lock,
  QrCode,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import QRCode from 'qrcode';
import { Pangkalan, RekomendasiPerizinan, HetKecamatan } from '../types';
import { PEMDA_INFO, AGEN_INFO } from '../data/pangkalanData';

interface RekomendasiModalProps {
  isOpen: boolean;
  pangkalan: Pangkalan | null;
  isRequirementsComplete: boolean;
  existingRekomendasi: RekomendasiPerizinan | null;
  pimpinanPin: string;
  pimpinanNama: string;
  pimpinanNip: string;
  pimpinanJabatan: string;
  hetList?: HetKecamatan[];
  isAdminMode: boolean;
  onClose: () => void;
  onApproveAndSign: (pangkalanId: string, customRekomendasiNo?: string) => void;
  onRequestAdminAuth: () => void;
}

export const RekomendasiModal: React.FC<RekomendasiModalProps> = ({
  isOpen,
  pangkalan,
  isRequirementsComplete,
  existingRekomendasi,
  pimpinanPin,
  pimpinanNama,
  pimpinanNip,
  pimpinanJabatan,
  hetList = [],
  isAdminMode,
  onClose,
  onApproveAndSign,
  onRequestAdminAuth,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [nomorRekInput, setNomorRekInput] = useState('');

  // Find matching HET for pangkalan kecamatan
  const matchingHet = hetList.find(
    (h) => h.kecamatan.toLowerCase().trim() === (pangkalan?.kecamatan || '').toLowerCase().trim()
  );
  const hargaHet = matchingHet ? matchingHet.hargaHetPerLiter : 4660;
  const skBupatiNo = matchingHet?.skBupatiNomor || '236/KEP/HK/2018';

  // Default recommendation number calculation matching official format e.g. 500.10.8.1/EK.NGK/89/05/2026
  const defaultNomorRekomendasi = pangkalan
    ? `500.10.8.1/EK.NGK/${pangkalan.no || '89'}/05/2026`
    : '500.10.8.1/EK.NGK/89/05/2026';

  const currentStatus = existingRekomendasi?.status || (isRequirementsComplete ? 'Menunggu Tanda Tangan Pimpinan' : 'Draft');

  // Generate QR Code when signed
  useEffect(() => {
    if (existingRekomendasi && existingRekomendasi.status === 'Disetujui & Diterbitkan' && pangkalan) {
      const qrPayload = JSON.stringify({
        sistem: 'SIPERMATA Pemda Nagekeo',
        perihal: 'Rekomendasi Izin Pangkalan Minyak Tanah',
        nomor: existingRekomendasi.nomorRekomendasi,
        pangkalan: pangkalan.nama,
        pemilik: pangkalan.namaUsaha || pangkalan.nama,
        kecamatan: pangkalan.kecamatan,
        penandatangan: existingRekomendasi.pimpinanNama,
        nip: existingRekomendasi.pimpinanNip,
        status: 'SAH & TERVERIFIKASI',
        tanggalTerbit: existingRekomendasi.tanggalRekomendasi,
      });

      QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR Code', err));
    }
  }, [existingRekomendasi, pangkalan]);

  if (!isOpen || !pangkalan) return null;

  // Handle Leader PIN Submission for Signature
  const handleVerifyPinAndSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() !== pimpinanPin.trim()) {
      setPinError('PIN Pimpinan tidak sesuai. Silakan periksa kembali atau tanyakan ke Admin.');
      return;
    }

    setPinError(null);
    setShowPinPrompt(false);
    onApproveAndSign(pangkalan.id, nomorRekInput.trim() || defaultNomorRekomendasi);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:static print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none print:w-full print:rounded-none">
        {/* Modal Top Header (Hidden on Print) */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Rekomendasi Perizinan Pangkalan
                </h3>
                {existingRekomendasi?.status === 'Disetujui & Diterbitkan' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    RESMI TERBIT
                  </span>
                ) : isRequirementsComplete ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    SIAP DI-ACC PIMPINAN
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    BERKAS BELUM LENGKAP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {pangkalan.nama} • Kec. {pangkalan.kecamatan}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {existingRekomendasi?.status === 'Disetujui & Diterbitkan' && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak Surat Rekomendasi</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Action & Status Notification Bar (Hidden on Print) */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 space-y-3 print:hidden shrink-0">
          {!isRequirementsComplete ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  <strong>Berkas Persyaratan Belum Lengkap:</strong> Pemohon wajib melengkapi dan menyetujui seluruh dokumen persyaratan perizinan sebelum rekomendasi pimpinan dapat diproses.
                </span>
              </div>
            </div>
          ) : existingRekomendasi?.status === 'Disetujui & Diterbitkan' ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Surat Rekomendasi Resmi Diterbitkan & Ditandatangani Digital</strong> oleh Kepala Bagian Perekonomian & SDA Kabupaten Nagekeo.
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                Terbit: {existingRekomendasi.tanggalRekomendasi}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold">Persyaratan Pemohon Lengkap & Terverifikasi!</p>
                  <p className="text-[11px] text-amber-400/80">
                    Silakan masukkan PIN Pimpinan untuk menyetujui dan membubuhkan Tanda Tangan Digital QR Code.
                  </p>
                </div>
              </div>

              {/* Show Leader PIN visibility for Admin */}
              <div className="flex items-center gap-2 shrink-0">
                {isAdminMode && (
                  <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>PIN Pimpinan: {pimpinanPin}</span>
                  </div>
                )}

                <button
                  onClick={() => setShowPinPrompt(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ACC & Tanda Tangan Digital</span>
                </button>
              </div>
            </div>
          )}

          {/* Leader PIN Entry Popup Prompt */}
          {showPinPrompt && (
            <div className="p-4 bg-slate-950 border-2 border-amber-500/60 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  <span>Verifikasi Persetujuan Pimpinan (PIN Tanda Tangan Digital)</span>
                </div>
                <button
                  onClick={() => setShowPinPrompt(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Batal
                </button>
              </div>

              {isAdminMode && (
                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>PIN Akses Tanda Tangan Pimpinan yang Terdaftar (Khusus Admin):</span>
                  </span>
                  <strong className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-amber-500/30">
                    {pimpinanPin}
                  </strong>
                </div>
              )}

              <form onSubmit={handleVerifyPinAndSign} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Nomor Rekomendasi (Opsional):</label>
                    <input
                      type="text"
                      value={nomorRekInput}
                      onChange={(e) => setNomorRekInput(e.target.value)}
                      placeholder={defaultNomorRekomendasi}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Masukkan PIN Pimpinan:</label>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Masukkan PIN Tanda Tangan..."
                      autoFocus
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                    />
                  </div>
                </div>

                {pinError && (
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPinPrompt(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Sahkan & Bubuhkan Tanda Tangan QR</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Official Printable Recommendation Document Body */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 overflow-y-auto flex-1 font-serif print:p-0 print:overflow-visible">
          {/* KOP SURAT OFFICIAL PEMDA NAGEKEO */}
          <div className="border-b-2 border-slate-900 pb-3 mb-5 text-center relative font-serif">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 p-1 bg-amber-50/50">
                <div className="text-center">
                  <span className="block text-[10px] font-bold tracking-tighter text-slate-900 leading-tight">NAGEKEO</span>
                  <span className="block text-[8px] font-mono font-bold text-amber-900">2007</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-950 leading-snug">
                  PEMERINTAH KABUPATEN NAGEKEO
                </h3>
                <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-slate-950 leading-snug">
                  SEKRETARIAT DAERAH
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-800 italic">
                  Jln. Mohammad Hatta No. Telp. (0411) 402150
                </p>
                <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-slate-950 mt-0.5">
                  M B A Y
                </p>
              </div>
            </div>
          </div>

          {/* SURAT REKOMENDASI TITLE & NOMOR */}
          <div className="text-center space-y-1 mb-5 font-serif">
            <h4 className="text-base sm:text-lg font-extrabold uppercase underline decoration-1 underline-offset-4 text-slate-950 tracking-wide">
              REKOMENDASI
            </h4>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              PENJUALAN BAHAN BAKAR MINYAK TANAH SUBSIDI
            </p>
            <p className="text-xs sm:text-sm font-semibold font-mono text-slate-900">
              NOMOR : {existingRekomendasi?.nomorRekomendasi || defaultNomorRekomendasi}
            </p>
          </div>

          {/* DASAR HUKUM */}
          <div className="space-y-1 text-xs sm:text-sm text-slate-900 leading-relaxed font-serif mb-4">
            <p className="font-semibold">Dasar Hukum :</p>
            <ol className="list-none space-y-1 pl-2 text-justify">
              <li className="flex gap-2">
                <span className="shrink-0">1.</span>
                <span>Undang – Undang Nomor 22 Tahun 2001 tentang Minyak dan Gas Bumi;</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">2.</span>
                <span>
                  Peraturan Presiden Nomor 191 Tahun 2014 tentang Penyediaan, Pendistribusian dan Harga Jual Eceran Bahan Bakar Minyak sebagaimana telah diubah dengan Peraturan Presiden Nomor 117 Tahun 2021 tentang Perubahan Ketiga atas Peraturan Presiden Nomor 191 Tahun 2014 tentang Penyediaan Pendistribusian dan Harga Jual Eceran Bahan Bakar Minyak;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">3.</span>
                <span>
                  Surat Permohonan Rekomendasi dari Pemohon tanggal {pangkalan.tanggalLahir ? `${pangkalan.tanggalLahir}` : '18 Mei 2026'}.
                </span>
              </li>
            </ol>
          </div>

          {/* DENGAN INI MEMBERIKAN REKOMENDASI... */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-900 leading-relaxed font-serif mb-4">
            <p>Dengan ini memberikan Rekomendasi Penjualan Minyak Tanah Subsidi kepada :</p>
            
            <div className="pl-4 space-y-1 font-serif">
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">Nama</span>
                <span className="col-span-8 sm:col-span-9">: {pangkalan.namaUsaha || pangkalan.nama}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">Alamat</span>
                <span className="col-span-8 sm:col-span-9">: {pangkalan.alamat}, Kel. {pangkalan.kelurahan}, Kecamatan {pangkalan.kecamatan}, Kabupaten Nagekeo</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">Nama Pangkalan</span>
                <span className="col-span-8 sm:col-span-9">: {pangkalan.nama}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">No HP</span>
                <span className="col-span-8 sm:col-span-9">: {pangkalan.nomorHp || '085 124 132 056'}</span>
              </div>
            </div>
          </div>

          {/* DIBERIKAN ALOKASI VOLUME MINYAK TANAH */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-900 leading-relaxed font-serif mb-4">
            <p className="font-semibold">Diberikan Alokasi Volume Minyak Tanah</p>
            
            <div className="pl-4 space-y-1 font-serif">
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">Jumlah</span>
                <span className="col-span-8 sm:col-span-9">: {pangkalan.kuotaBulananLiter ? `${pangkalan.kuotaBulananLiter.toLocaleString('id-ID')} Liter/ bulan` : '5.000 Liter/ bulan'}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">Tempat Pengambilan</span>
                <span className="col-span-8 sm:col-span-9">: Terima di Tempat.</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">Nama Lembaga Penyalur</span>
                <span className="col-span-8 sm:col-span-9">: {pangkalan.namaAgen || AGEN_INFO.nama}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 sm:col-span-3 font-semibold">Lokasi Pangkalan</span>
                <span className="col-span-8 sm:col-span-9">: {pangkalan.alamat}, Kel. {pangkalan.kelurahan}, Kecamatan {pangkalan.kecamatan}, Kabupaten Nagekeo</span>
              </div>
            </div>
          </div>

          {/* DENGAN KETENTUAN SEBAGAI BERIKUT */}
          <div className="space-y-1 text-xs sm:text-sm text-slate-900 leading-relaxed font-serif mb-6">
            <p className="font-semibold">Dengan ketentuan sebagai berikut :</p>
            <ol className="list-none space-y-1.5 pl-2 text-justify">
              <li className="flex gap-2">
                <span className="shrink-0">1.</span>
                <span>Rekomendasi diberikan kepada pemohon yang telah melengkapi persyaratan yang ditentukan.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">2.</span>
                <span>
                  Pemegang Rekomendasi wajib menaati semua ketentuan yang berkaitan dengan pendistribusian dan penjualan minyak tanah bersubsidi dengan Harga Eceran Tertinggi (HET) untuk wilayah <strong>Kecamatan {pangkalan.kecamatan}</strong> dengan harga <strong>Rp. {hargaHet.toLocaleString('id-ID')}/Liter</strong> sesuai Keputusan Bupati Nagekeo Nomor {skBupatiNo} tentang Harga Eceran Tertinggi Bahan Bakar Minyak Jenis Minyak Tanah Untuk Keperluan Rumah Tangga, Usaha Kecil, Usaha Perikanan, dan Pelayanan Umum;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">3.</span>
                <span>Berperan serta melakukan pengawasan dan ikut menjamin tertib penjualan Bahan Bakar Minyak Tanah Bersubsidi;</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">4.</span>
                <span>
                  Pemegang Rekomendasi wajib menaati rekomendasi ini, pelanggaran terhadap rekomendasi ini akan diproses sesuai hukum yang berlaku termasuk mencabut Rekomendasi dan menghentikan pendropingan minyak tanah bersubsidi;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">5.</span>
                <span>
                  Apabila penjualan minyak tanah melebihi Harga Eceran Tertinggi (HET) maka rekomendasi ini akan dicabut sepihak oleh pemerintah.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">6.</span>
                <span>
                  Masa berlaku Rekomendasi satu tahun terhitung sejak ditandatangani Rekomendasi.<br />
                  <strong>Berlaku sampai dengan tanggal {existingRekomendasi?.berlakuSampai || '19 Mei 2027'}.</strong>
                </span>
              </li>
            </ol>
          </div>

          {/* SIGNATURE BLOCK */}
          <div className="pt-2 flex justify-end text-slate-950 font-serif">
            <div className="text-center w-80 space-y-1">
              <p className="text-xs sm:text-sm font-medium">
                Mbay, {existingRekomendasi?.tanggalRekomendasi || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs sm:text-sm font-semibold">
                Plt. Kepala Bagian Perekonomian dan Sumber Daya Alam
              </p>
              <p className="text-xs sm:text-sm font-semibold">
                Setda Nagekeo,
              </p>

              {/* QR Code / Digital Signature */}
              <div className="py-2 flex flex-col items-center justify-center min-h-[110px]">
                {existingRekomendasi?.status === 'Disetujui & Diterbitkan' && qrCodeDataUrl ? (
                  <div className="flex flex-col items-center space-y-1">
                    <img
                      src={qrCodeDataUrl}
                      alt="Tanda Tangan Digital QR Code"
                      className="w-24 h-24 border-2 border-slate-900 p-1 bg-white"
                    />
                    <span className="text-[9px] font-mono font-bold text-slate-900">
                      ✓ TERVERIFIKASI TTD DIGITAL
                    </span>
                  </div>
                ) : (
                  <div className="w-48 h-20 border border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-xs font-serif italic">
                    [ Tanda Tangan & Stempel ]
                  </div>
                )}
              </div>

              <div className="pt-1">
                <p className="text-xs sm:text-sm font-bold uppercase underline decoration-1 text-slate-950">
                  {pimpinanNama || 'OKTAVIANUS BELI WAWO, ST'}
                </p>
                <p className="text-xs font-medium text-slate-800">
                  Pembina – IV/a
                </p>
                <p className="text-xs font-mono text-slate-800">
                  NIP. {pimpinanNip || '19770328 200604 1 021'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
