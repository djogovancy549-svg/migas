import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, Eye, EyeOff, AlertCircle, X, Building2 } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  targetRole?: 'admin' | 'agen';
  onClose: () => void;
  onSuccessAdmin?: () => void;
  onSuccessAgen?: () => void;
  onSuccess?: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  targetRole = 'admin',
  onClose,
  onSuccessAdmin,
  onSuccessAgen,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();

    if (targetRole === 'agen') {
      if (cleanPin === 'agen2026') {
        setError(false);
        setPin('');
        if (onSuccessAgen) onSuccessAgen();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(true);
      }
    } else {
      if (cleanPin === 'migas2026') {
        setError(false);
        setPin('');
        if (onSuccessAdmin) onSuccessAdmin();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(true);
      }
    }
  };

  const isAdmin = targetRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAdmin ? 'Mode Admin Terproteksi' : 'Mode Agen Penyalur Terproteksi'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Perekonomian & SDA Setda Nagekeo' : 'Akses Khusus Agen Penyalur Minyak Tanah'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div
            className={`p-3.5 border rounded-xl text-xs flex items-start gap-2.5 ${
              isAdmin
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
            }`}
          >
            <Lock className={`w-4 h-4 shrink-0 mt-0.5 ${isAdmin ? 'text-amber-400' : 'text-blue-400'}`} />
            <div>
              <p className={`font-semibold ${isAdmin ? 'text-amber-200' : 'text-blue-200'}`}>
                {isAdmin ? 'Autentikasi PIN Administrator' : 'Autentikasi PIN Agen Penyalur'}
              </p>
              <p className="mt-0.5 opacity-90 leading-relaxed">
                {isAdmin
                  ? 'Masukkan PIN khusus Administrator Pemda Nagekeo untuk mengelola data pangkalan, penerbitan rekomendasi, dan pengaturan sistem.'
                  : 'Masukkan PIN khusus Agen Penyalur untuk mengakses portal monitoring data pangkalan yang sudah memiliki izin resmi.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAdmin ? 'Kode PIN Admin Pemda:' : 'Kode PIN Agen Penyalur:'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                placeholder={isAdmin ? 'Masukkan PIN Admin...' : 'Masukkan PIN Agen...'}
                autoFocus
                required
                className={`w-full pl-9 pr-10 py-2.5 bg-slate-950 border rounded-xl text-sm font-mono tracking-wider text-white focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-500 focus:ring-red-500'
                    : isAdmin
                    ? 'border-slate-800 focus:ring-amber-500'
                    : 'border-slate-800 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Kode PIN tidak sesuai! Silakan periksa dan coba kembali.
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/10'
                  : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-blue-500/10'
              }`}
            >
              Verifikasi PIN & Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
