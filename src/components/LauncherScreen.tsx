import React from 'react';
import {
  Users,
  ShieldCheck,
  FileText,
  Award,
  ClipboardCheck,
  Store,
  Landmark,
  Flame,
  Building2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Fuel,
  CheckCircle2
} from 'lucide-react';
import { PEMDA_INFO } from '../data/pangkalanData';

interface LauncherScreenProps {
  totalPangkalan: number;
  isAdminMode: boolean;
  isAgenMode: boolean;
  currentUserEmail?: string | null;
  authorizedAdminEmails?: string[];
  onEnterAsCustomer: () => void;
  onEnterAsAgen: () => void;
  onEnterAsAdmin: () => void;
  onRequestAdminAuth: () => void;
  onRequestAgenAuth: () => void;
}

export const LauncherScreen: React.FC<LauncherScreenProps> = ({
  totalPangkalan,
  isAdminMode,
  isAgenMode,
  currentUserEmail,
  authorizedAdminEmails = [],
  onEnterAsCustomer,
  onEnterAsAgen,
  onEnterAsAdmin,
  onRequestAdminAuth,
  onRequestAgenAuth,
}) => {
  const isNonAdminEmailLogged = Boolean(
    currentUserEmail &&
    authorizedAdminEmails.length > 0 &&
    !authorizedAdminEmails.map((e) => e.toLowerCase()).includes(currentUserEmail.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambient Glows - Optimized for Mobile GPUs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[200px] sm:h-[300px] bg-amber-500/10 blur-3xl rounded-full pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-0 w-[250px] sm:w-[400px] h-[200px] sm:h-[300px] bg-blue-600/10 blur-3xl rounded-full pointer-events-none opacity-30" />

      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Flame className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              {PEMDA_INFO.sistemName}
            </span>
            <p className="text-xs text-slate-400 font-semibold mt-0.5 hidden sm:block">
              {PEMDA_INFO.nama}
            </p>
          </div>
        </div>

        {/* Current Session Status Badge */}
        <div className="flex items-center gap-2">
          {isAdminMode ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sesi Admin Pemda (Aktif)</span>
            </span>
          ) : isAgenMode ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Sesi Agen Penyalur (Aktif)</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Portal Terbuka</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Hero & Portal Options Container */}
      <main className="max-w-6xl w-full mx-auto my-auto py-6 sm:py-10 z-10 space-y-8">
        {/* Title Branding Block */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-inner">
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Bagian Perekonomian & SDA Setda Kab. Nagekeo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            SIPERMATA
          </h1>
          <p className="text-base sm:text-xl font-bold text-amber-400/90 tracking-wide">
            ({PEMDA_INFO.sistemFullName})
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed pt-1">
            Sistem Informasi Pelayanan Perizinan, Verifikasi Berkas, Rekomendasi, dan Pengawasan Penyaluran Minyak Tanah Bersubsidi Kabupaten Nagekeo, NTT.
          </p>
        </div>

        {/* Portal Selection Cards (3 Roles) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Card 1: Portal Pemohon / Public */}
          <div
            onClick={onEnterAsCustomer}
            className="group relative bg-slate-900/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Akses Umum
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-black text-white group-hover:text-amber-400 transition">
                  1. Portal Pemohon / Pangkalan
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Untuk Pemilik / Calon Pangkalan Minyak Tanah mengajukan izin rekomendasi baru atau perpanjangan.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Ceklis Kelengkapan Berkas</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cetak Surat Permohonan Izin</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cetak Surat Pernyataan Meterai</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:from-amber-400 group-hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                <span>Masuk Portal Pemohon</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Card 2: Portal Agen Penyalur Resmi */}
          <div
            onClick={isAgenMode ? onEnterAsAgen : onRequestAgenAuth}
            className="group relative bg-slate-900/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-400" />
                  {isAgenMode ? 'Terverifikasi' : 'PIN Terproteksi'}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-black text-white group-hover:text-blue-400 transition">
                  2. Portal Agen Penyalur Resmi
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Khusus Perusahaan Agen Penyalur Minyak Tanah Resmi (Menampilkan data pangkalan yang sudah berizin).
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Daftar Pangkalan Berizin Disetujui</span>
                </li>
                <li className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Monitoring Kuota Harian & Bulanan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Verifikasi Surat Rekomendasi Pemda</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:from-blue-400 group-hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                <span>{isAgenMode ? 'Masuk Portal Agen (Aktif)' : 'Masuk Portal Agen'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Card 3: Portal Admin Pemda Nagekeo */}
          {!isNonAdminEmailLogged ? (
            <div
              onClick={isAdminMode ? onEnterAsAdmin : onRequestAdminAuth}
              className="group relative bg-slate-900/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    {isAdminMode ? 'Terverifikasi' : 'PIN Terproteksi'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white group-hover:text-emerald-400 transition">
                    3. Portal Admin Pemda Nagekeo
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Khusus Petugas Bagian Perekonomian & SDA Setda Kab. Nagekeo.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Master Data & Kelola Daftar Agen</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verifikasi Berkas & Penerbitan Rekomendasi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sinkron Google Sheet & Admin Email</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 group-hover:from-emerald-400 group-hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  <span>{isAdminMode ? 'Masuk Portal Admin (Aktif)' : 'Masuk Portal Admin'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative bg-slate-900/50 border border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between space-y-5 opacity-70">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Akses Terbatas
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-300">
                    3. Portal Admin Pemda
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sesi Google saat ini ({currentUserEmail}) terdaftar sebagai Pengguna/Pemohon Publik.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  Akses Portal Admin khusus untuk email pejabat/petugas terdaftar (Super Admin: bagianekonomisdangk@gmail.com / djogovancy549@gmail.com).
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/80 text-slate-500 font-bold rounded-xl text-xs cursor-not-allowed border border-slate-700/60"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tombol Non-Aktif (Email Tidak Terdaftar)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Info Footer note */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-300">
              Pemerintah Kabupaten Nagekeo • Bagian Perekonomian dan SDA Setda Nagekeo
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span>Lokasi: {PEMDA_INFO.alamat}</span>
          </div>
        </div>
      </main>

      {/* Launcher Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-3 text-xs text-slate-500 border-t border-slate-900 z-10">
        <p>SIPERMATA © 2026 Bagian Perekonomian dan SDA Setda Kabupaten Nagekeo, NTT</p>
      </footer>
    </div>
  );
};
