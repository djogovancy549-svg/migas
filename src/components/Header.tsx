import React from 'react';
import { Fuel, FileCheck, Building2, MapPin, Printer, ShieldCheck, ShieldAlert, LogOut, Lock } from 'lucide-react';
import { AGEN_INFO } from '../data/pangkalanData';

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
  totalKecamatan,
  isAdminMode,
  onRequestAdminAuth,
  onExitAdminMode,
  onQuickPrintSummary,
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Agency Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-orange-500/20 shrink-0">
              <Fuel className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AGEN RESMI MINYAK TANAH
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {AGEN_INFO.kabupaten}, {AGEN_INFO.provinsi}
                </span>

                {/* Role Badge */}
                {isAdminMode ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Mode Admin (Aktif)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Sisi Pemohon / User
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                {AGEN_INFO.nama}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{AGEN_INFO.alamat}</span>
                <span>•</span>
                <span>Sistem Permohonan & Rekomendasi Pangkalan</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Pangkalan</p>
                <p className="text-xs font-bold text-slate-100">{totalPangkalan} Unit</p>
              </div>
            </div>

            {/* Admin Switcher Button */}
            {isAdminMode ? (
              <button
                onClick={onExitAdminMode}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                title="Keluar dari Mode Admin"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Keluar Admin</span>
              </button>
            ) : (
              <button
                onClick={onRequestAdminAuth}
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                title="Akses Mode Admin (PIN migas2026)"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Admin</span>
              </button>
            )}

            <button
              onClick={onQuickPrintSummary}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-amber-500/10 transition cursor-pointer"
              title="Cetak Laporan Ringkasan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

