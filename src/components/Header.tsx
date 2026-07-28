import React from 'react';
import { Building2, MapPin, Printer, ShieldCheck, LogOut, Lock, Flame, Home } from 'lucide-react';
import { PEMDA_INFO } from '../data/pangkalanData';

interface HeaderProps {
  totalPangkalan: number;
  totalKecamatan: number;
  isAdminMode: boolean;
  isAgenMode: boolean;
  onRequestAdminAuth: () => void;
  onRequestAgenAuth: () => void;
  onExitAdminMode: () => void;
  onExitAgenMode: () => void;
  onQuickPrintSummary: () => void;
  onGoToLauncher: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalPangkalan,
  isAdminMode,
  isAgenMode,
  onRequestAdminAuth,
  onRequestAgenAuth,
  onExitAdminMode,
  onExitAgenMode,
  onQuickPrintSummary,
  onGoToLauncher,
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Government Agency Info */}
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={onGoToLauncher}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/20 shrink-0 mt-0.5 sm:mt-0 hover:scale-105 transition cursor-pointer"
              title="Kembali ke Halaman Launcher Utama"
            >
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 fill-slate-950" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  {PEMDA_INFO.sistemName}
                </span>
                <span className="text-[11px] text-slate-400 hidden xs:inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  {PEMDA_INFO.kabupaten}, {PEMDA_INFO.provinsi}
                </span>

                {/* Role Badge */}
                {isAdminMode ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Mode Admin Pemda</span>
                  </span>
                ) : isAgenMode ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-blue-400" />
                    <span>Mode Agen Penyalur</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Mode Pemohon / Public</span>
                  </span>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5 leading-snug break-words">
                {PEMDA_INFO.sistemName} <span className="font-semibold text-slate-300 text-xs sm:text-sm">({PEMDA_INFO.sistemFullName})</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-amber-400/90">{PEMDA_INFO.instansi}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
            <div className="flex items-center gap-1.5">
              {/* Return to Launcher button */}
              <button
                onClick={onGoToLauncher}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs transition cursor-pointer min-h-[38px]"
                title="Kembali ke Launcher Portal"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] sm:text-xs">Launcher</span>
              </button>

              {/* Admin Switcher Button */}
              {isAdminMode ? (
                <button
                  onClick={onExitAdminMode}
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs transition cursor-pointer min-h-[38px]"
                  title="Keluar dari Mode Admin"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] sm:text-xs">Keluar Admin</span>
                </button>
              ) : isAgenMode ? (
                <button
                  onClick={onExitAgenMode}
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs transition cursor-pointer min-h-[38px]"
                  title="Keluar dari Mode Agen"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] sm:text-xs">Keluar Agen</span>
                </button>
              ) : (
                <button
                  onClick={onRequestAdminAuth}
                  className="inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs transition cursor-pointer min-h-[38px]"
                  title="Masuk Mode Admin Pemda"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[11px] sm:text-xs">Masuk Admin</span>
                </button>
              )}

              {/* Quick Print Summary */}
              <button
                onClick={onQuickPrintSummary}
                className="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer min-h-[38px] print:hidden"
                title="Cetak / Download Ringkasan Halaman"
              >
                <Printer className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
