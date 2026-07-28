import React from 'react';
import { Fuel, Building2, MapPin, Printer, ShieldCheck, ShieldAlert, LogOut, Lock, Landmark } from 'lucide-react';
import { PEMDA_INFO, AGEN_INFO } from '../data/pangkalanData';

interface HeaderProps {
  totalPangkalan: number;
  totalKecamatan: number;
  isAdminMode: boolean;
  onRequestAdminAuth: () => void;
  onExitAdminMode: () => void;
  onQuickPrintSummary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalPangkalan,
  isAdminMode,
  onRequestAdminAuth,
  onExitAdminMode,
  onQuickPrintSummary,
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Government Agency Info */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-orange-500/20 shrink-0 mt-0.5 sm:mt-0">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PEMDA NAGEKEO
                </span>
                <span className="text-[11px] text-slate-400 hidden xs:inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  {PEMDA_INFO.kabupaten}, {PEMDA_INFO.provinsi}
                </span>

                {/* Role Badge */}
                {isAdminMode ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Mode Admin</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Mode Pemohon / User</span>
                  </span>
                )}
              </div>

              <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-white mt-1 leading-snug break-words">
                {PEMDA_INFO.nama}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="font-semibold text-amber-400/90">{PEMDA_INFO.instansi}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden md:inline">{PEMDA_INFO.sistemTitle}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold text-slate-400">Pangkalan</p>
                <p className="text-xs font-bold text-slate-100">{totalPangkalan} Unit</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Admin Switcher Button */}
              {isAdminMode ? (
                <button
                  onClick={onExitAdminMode}
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs transition cursor-pointer min-h-[38px]"
                  title="Keluar dari Mode Admin"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] sm:text-xs">Keluar</span>
                </button>
              ) : (
                <button
                  onClick={onRequestAdminAuth}
                  className="inline-flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs transition cursor-pointer min-h-[38px]"
                  title="Akses Mode Admin (PIN migas2026)"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] sm:text-xs">Mode Admin</span>
                </button>
              )}

              <button
                onClick={onQuickPrintSummary}
                className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3 sm:px-3.5 py-2 rounded-xl text-xs shadow-md shadow-amber-500/10 transition cursor-pointer min-h-[38px]"
                title="Cetak Laporan Ringkasan"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="text-[11px] sm:text-xs">Cetak Laporan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

