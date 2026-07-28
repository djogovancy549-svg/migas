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
import { Pangkalan, RekomendasiPerizinan } from '../types';
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

  // Default recommendation number calculation
  const defaultNomorRekomendasi = pangkalan
    ? `500/EKON/REK-MIGAS/${pangkalan.id.replace(/[^a-zA-Z0-9]/g, '') || '001'}/2026`
    : '500/EKON/REK-MIGAS/001/2026';

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
          <div className="border-b-4 border-double border-slate-950 pb-4 mb-6 text-center space-y-1 relative">
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-700 border border-amber-600/30 rounded-xl flex items-center justify-center shrink-0 font-sans font-black text-xs">
                NAGEKEO
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide font-sans text-slate-950">
                  PEMERINTAH KABUPATEN NAGEKEO
                </h3>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider font-sans text-slate-950">
                  SEKRETARIAT DAERAH
                </h2>
                <p className="text-xs sm:text-sm font-bold uppercase font-sans text-slate-800">
                  BAGIAN PEREKONOMIAN DAN SUMBER DAYA ALAM
                </p>
                <p className="text-[11px] font-sans text-slate-600 italic">
                  Jl. Mawar No. 01 Mbay, Kabupaten Nagekeo, Nusa Tenggara Timur • Kode Pos 86472
                </p>
              </div>
            </div>
          </div>

          {/* SURAT REKOMENDASI TITLE & NOMOR */}
          <div className="text-center space-y-1 mb-6 font-sans">
            <h4 className="text-base sm:text-xl font-black uppercase underline decoration-2 underline-offset-4 text-slate-950 tracking-wide">
              SURAT REKOMENDASI PERIZINAN PANGKALAN MINYAK TANAH
            </h4>
            <p className="text-xs sm:text-sm font-bold font-mono text-slate-800">
              Nomor: {existingRekomendasi?.nomorRekomendasi || defaultNomorRekomendasi}
            </p>
          </div>

          {/* SURAT REKOMENDASI CONTENT */}
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-900 font-sans">
            <p>
              Berdasarkan hasil verifikasi dan pemeriksaan berkas perizinan yang diselenggarakan oleh Bagian Perekonomian dan Sumber Daya Alam Sekretariat Daerah Kabupaten Nagekeo, dengan ini memberikan <strong>REKOMENDASI PERIZINAN PANGKALAN MINYAK TANAH BERSUBSIDI</strong> kepada:
            </p>

            {/* Identitas Pemohon & Pangkalan Table */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2 font-sans my-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">Nama Pangkalan:</span>
                <span className="sm:col-span-2 font-black text-slate-950">{pangkalan.nama}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">Nama Pemilik / Usaha:</span>
                <span className="sm:col-span-2 font-semibold text-slate-900">{pangkalan.namaUsaha || pangkalan.nama}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">NIK / NIB Pemilik:</span>
                <span className="sm:col-span-2 font-mono text-slate-900">{pangkalan.nik || '-'} / {pangkalan.nib || '-'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">Alamat Pangkalan:</span>
                <span className="sm:col-span-2 text-slate-900">{pangkalan.alamat}, Kel. {pangkalan.kelurahan}, Kec. {pangkalan.kecamatan}, Kab. Nagekeo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">Kuota Alokasi Minyak Tanah:</span>
                <span className="sm:col-span-2 font-bold text-amber-700">
                  {pangkalan.kuotaHarianLiter || 100} Liter / Hari ({pangkalan.kuotaBulananLiter || 3000} Liter / Bulan)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">Agen Penyalur Resmi:</span>
                <span className="sm:col-span-2 font-semibold text-slate-900">{AGEN_INFO.nama}</span>
              </div>
            </div>

            <p>
              Dengan ditertibkannya surat rekomendasi ini, Pangkalan yang bersangkutan dinyatakan <strong>MEMENUHI SYARAT KELENGKAPAN PERIZINAN & KELAYAKAN TEKNIS</strong> untuk mendistribusikan Minyak Tanah Bersubsidi di wilayah Kabupaten Nagekeo sesuai ketentuan Harga Eceran Tertinggi (HET) yang berlaku.
            </p>

            <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 text-xs text-slate-800 space-y-1 my-2">
              <p className="font-bold text-slate-900">Ketentuan & Kewajiban Pangkalan:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                <li>Menjual Minyak Tanah Subsidi strictly sesuai HET Kabupaten Nagekeo.</li>
                <li>Mencatat buku penyaluran harian kepada masyarakat konsumen rumah tangga dan usaha mikro.</li>
                <li>Rekomendasi ini berlaku selama 1 (satu) tahun sejak tanggal diterbitkan.</li>
              </ul>
            </div>

            {/* Signature Block */}
            <div className="pt-6 flex justify-end text-slate-950 font-sans">
              <div className="text-center w-72 space-y-2">
                <p className="text-xs font-medium">Mbay, {existingRekomendasi?.tanggalRekomendasi || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs font-bold uppercase">
                  {pimpinanJabatan || 'Kepala Bagian Perekonomian & SDA Setda Kab. Nagekeo'}
                </p>

                {/* Digital QR Signature Box */}
                <div className="py-2 flex flex-col items-center justify-center min-h-[110px]">
                  {existingRekomendasi?.status === 'Disetujui & Diterbitkan' && qrCodeDataUrl ? (
                    <div className="flex flex-col items-center space-y-1">
                      <img
                        src={qrCodeDataUrl}
                        alt="Tanda Tangan Digital QR Code"
                        className="w-28 h-28 border-2 border-slate-900 p-1 rounded-lg bg-white shadow-sm"
                      />
                      <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        ✓ TTD DIGITAL SAH (SIPERMATA)
                      </span>
                    </div>
                  ) : (
                    <div className="w-48 h-20 border-2 border-dashed border-slate-400 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold italic">
                      [ Tanda Tangan Digital Pimpinan ]
                    </div>
                  )}
                </div>

                <div className="space-y-0.5 border-t border-slate-900 pt-1">
                  <p className="text-xs font-black uppercase text-slate-950 underline decoration-1">
                    {pimpinanNama || 'MARIA SERVINA, S.E., M.Si.'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-800">
                    NIP. {pimpinanNip || '19780512 200501 2 008'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
