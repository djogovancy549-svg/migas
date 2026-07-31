import React from 'react';
import { Pangkalan } from '../types';
import { Building2, MapPin, Fuel, FileCheck, FileWarning, ArrowRight, CheckCircle2, Award, FileText, Bell, Check } from 'lucide-react';

interface DashboardViewProps {
  pangkalanList: Pangkalan[];
  onSelectPangkalanForLetter: (pangkalan: Pangkalan, letterType: 'permohonan' | 'pernyataan') => void;
  onGoToTab: (tab: 'pangkalan' | 'surat-permohonan' | 'surat-pernyataan' | 'persyaratan' | 'analytics') => void;
  isAdminMode?: boolean;
  onApprovePangkalan?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pangkalanList,
  onSelectPangkalanForLetter,
  onGoToTab,
  isAdminMode = false,
  onApprovePangkalan,
}) => {
  // Aggregate by Kecamatan
  const kecamatanCounts = pangkalanList.reduce((acc, p) => {
    const kec = p.kecamatan || 'Lainnya';
    acc[kec] = (acc[kec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Aggregate by Kelurahan
  const kelurahanCounts = pangkalanList.reduce((acc, p) => {
    const kel = p.kelurahan || 'Lainnya';
    acc[kel] = (acc[kel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalKecamatan = Object.keys(kecamatanCounts).length;
  const totalKelurahan = Object.keys(kelurahanCounts).length;

  const totalHarian = pangkalanList.reduce((sum, p) => sum + (p.kuotaHarianLiter || 200), 0);
  const totalBulanan = totalHarian * 26; // approx 26 kerja days

  const perizinanAktif = pangkalanList.filter(p => p.statusPerizinan === 'Aktif').length;
  const perizinanPerluPerpanjangan = pangkalanList.filter(p => p.statusPerizinan === 'Perlu Perpanjangan').length;
  const pendingPangkalan = pangkalanList.filter(p => p.statusPerizinan === 'Proses');

  return (
    <div className="space-y-6">
      {/* Pending Approvals Notification Panel */}
      {isAdminMode && pendingPangkalan.length > 0 && (
        <div className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 bg-amber-500/5 w-40 h-40 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-amber-400">
                Pemberitahuan Admin: Ada {pendingPangkalan.length} Pengajuan Pangkalan Baru!
              </h3>
              <p className="text-xs text-slate-300">
                Terdapat pangkalan baru yang baru saja diinput/didaftarkan oleh pemohon/agen dan sedang menunggu persetujuan Anda agar statusnya menjadi Aktif.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {pendingPangkalan.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{p.nama}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      ID: {p.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {p.alamat}, Kel. {p.kelurahan}, Kec. {p.kecamatan}
                  </p>
                  {p.nomorHp && (
                    <p className="text-[11px] text-slate-400">
                      Kontak: <strong className="text-slate-300">{p.nomorHp}</strong>
                    </p>
                  )}
                </div>

                {onApprovePangkalan && (
                  <button
                    onClick={() => onApprovePangkalan(p.id)}
                    className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs transition cursor-pointer shadow-md min-h-[38px] touch-manipulation"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Terima Pengajuan</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Welcome & Agency Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-slate-950/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-200 border border-amber-400/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            Kabupaten Nagekeo - Provinsi Nusa Tenggara Timur
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sistem Informasi & Perizinan Pangkalan Minyak Tanah
          </h2>
          <p className="text-sm text-slate-100/90 leading-relaxed">
            Sistem pengawasan dan pelayanan rekomendasi pangkalan minyak tanah bersubsidi <strong>Pemerintah Kabupaten Nagekeo</strong> (Bagian Perekonomian dan SDA Setda Nagekeo) bekerjasama dengan agen penyalur resmi <strong>PT. Putra Ngada Energi</strong>.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            {isAdminMode && (
              <button
                onClick={() => onGoToTab('analytics')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer border border-sky-400/30"
              >
                <span>Buka Analytics & DSS Eksekutif</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onGoToTab('pangkalan')}
              className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <span>Buka Data Pangkalan ({pangkalanList.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGoToTab('persyaratan')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl text-xs backdrop-blur-sm transition cursor-pointer"
            >
              <span>Cek Persyaratan Izin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pangkalan</p>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{pangkalanList.length}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Terdaftar di PT. Putra Ngada Energi
          </p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimasi Kuota Harian</p>
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalHarian.toLocaleString('id-ID')} <span className="text-sm font-medium text-slate-400">Liter</span></p>
          <p className="text-xs text-slate-400 mt-1">
            Est. Bulanan: <strong className="text-slate-200">{totalBulanan.toLocaleString('id-ID')} Liter</strong>
          </p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perizinan Aktif</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{perizinanAktif}</p>
          <p className="text-xs text-slate-400 mt-1">
            Sesuai rekomendasi Bagian Perekonomian
          </p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perlu Perpanjangan</p>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileWarning className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{perizinanPerluPerpanjangan}</p>
          <p className="text-xs text-slate-400 mt-1">
            Masa rekomendasi akan berakhir
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kecamatan Breakdown */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Sebaran Pangkalan per Kecamatan</h3>
              <p className="text-xs text-slate-400">Distribusi 120 Pangkalan Minyak Tanah di Kabupaten Nagekeo ({totalKecamatan} Kecamatan)</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {totalKelurahan} Kelurahan/Desa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {Object.entries(kecamatanCounts)
              .sort((a, b) => Number(b[1]) - Number(a[1]))
              .map(([kec, countVal]) => {
                const count = Number(countVal);
                const percentage = Math.round((count / pangkalanList.length) * 100);
                return (
                  <div key={kec} className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/50 transition">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        KECAMATAN {kec}
                      </span>
                      <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        {count} Pangkalan
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                      <span>{percentage}% dari total Nagekeo</span>
                      <span>Est. {(count * 200).toLocaleString('id-ID')} Liter/hari</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Quick Letter Generator Panel */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cetak Berkas Otomatis</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pilih pangkalan dari data resmi untuk mencetak dokumen persyaratan rekomendasi pemerintah Kabupaten Nagekeo.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onGoToTab('surat-permohonan')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Surat Permohonan Rekomendasi</p>
                    <p className="text-[11px] text-slate-400">Kepada Kabag Perekonomian & SDA</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
              </button>

              <button
                onClick={() => onGoToTab('surat-pernyataan')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Surat Pernyataan Pangkalan</p>
                    <p className="text-[11px] text-slate-400">Persetujuan HET & Ketentuan Agen</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
              </button>
            </div>
          </div>

          {/* Featured Sample Pangkalan Quick Pick */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">Contoh Sampel Pangkalan (Boawae/Aesesa):</p>
            <div className="space-y-1.5">
              {pangkalanList.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="truncate mr-2">
                    <p className="font-bold text-slate-200 truncate">{p.nama}</p>
                    <p className="text-[10px] text-slate-400">{p.id} • {p.kecamatan}</p>
                  </div>
                  <button
                    onClick={() => onSelectPangkalanForLetter(p, 'permohonan')}
                    className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded transition shrink-0 cursor-pointer"
                  >
                    Cetak Surat
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
