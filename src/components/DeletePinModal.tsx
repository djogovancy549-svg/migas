import React, { useState } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, X, Trash2, Key } from 'lucide-react';

interface DeletePinModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemDetails?: string;
  isBulkClear?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeletePinModal: React.FC<DeletePinModalProps> = ({
  isOpen,
  title,
  description,
  itemDetails,
  isBulkClear = false,
  onClose,
  onConfirm,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();

    if (cleanPin === 'migas2026') {
      setError(false);
      setPin('');
      onConfirm();
      onClose();
    } else {
      setError(true);
    }
  };

  const handleModalClose = () => {
    setPin('');
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-rose-950/60 p-5 border-b border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-100">{title}</h3>
              <p className="text-xs text-rose-300/80">Proteksi Keamanan Admin Dinas Pemda</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3.5 text-xs text-rose-200 space-y-1">
            <p className="font-semibold">{description}</p>
            {itemDetails && (
              <p className="font-mono bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-rose-900/30 text-rose-300 break-all mt-1">
                {itemDetails}
              </p>
            )}
            {isBulkClear && (
              <p className="text-amber-300 font-medium text-[11px] pt-1">
                ⚠️ Catatan: Data pangkalan lokal dan baris data di Google Sheet Admin Pusat akan dibersihkan/dikosongkan sekaligus.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-rose-400" />
              <span>Masukkan PIN Administrator (Sembunyi)</span>
            </label>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Masukkan PIN Admin..."
                className={`w-full bg-slate-950 border ${
                  error ? 'border-rose-500 text-rose-400 ring-2 ring-rose-500/20' : 'border-slate-700 text-white'
                } rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:border-rose-500 transition`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-bold animate-pulse pt-0.5">
                ❌ PIN Keamanan Salah! Akses hapus ditolak.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Konfirmasi & Hapus Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
