import React, { useState } from 'react';
import {
  ShieldCheck,
  FileSpreadsheet,
  HardDrive,
  UserPlus,
  Trash2,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Mail,
  Building2,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  FolderSync
} from 'lucide-react';
import { Pangkalan, UploadedDocument } from '../types';
import { safeLocalStorage } from '../lib/storage';
import { exportToGoogleSheets, uploadFileToGoogleDrive } from '../lib/googleDriveSheetsService';

interface AdminSettingsViewProps {
  pangkalanList: Pangkalan[];
  uploadedDocs: UploadedDocument[];
  isAdminMode: boolean;
  authorizedAdminEmails: string[];
  currentUserEmail?: string | null;
  googleAccessToken?: string | null;
  onUpdateAuthorizedEmails: (emails: string[]) => void;
  onRequestAdminAuth: () => void;
  onExitAdminMode: () => void;
  onClearData: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  pangkalanList,
  uploadedDocs,
  isAdminMode,
  authorizedAdminEmails,
  currentUserEmail,
  googleAccessToken,
  onUpdateAuthorizedEmails,
  onRequestAdminAuth,
  onExitAdminMode,
  onClearData,
}) => {
  const [newEmailInput, setNewEmailInput] = useState('');
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [isEditingSheetId, setIsEditingSheetId] = useState(false);

  const [sheetId, setSheetId] = useState<string | null>(() => {
    return safeLocalStorage.getItem('pne_nagekeo_google_sheet_id');
  });

  const [sheetUrl, setSheetUrl] = useState<string | null>(() => {
    return safeLocalStorage.getItem('pne_nagekeo_google_sheet_url');
  });

  const [connectedAdminEmail, setConnectedAdminEmail] = useState<string | null>(() => {
    return safeLocalStorage.getItem('pne_nagekeo_connected_admin_email') || currentUserEmail || null;
  });

  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Add new Admin Email
  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmailInput.trim().toLowerCase();
    if (!clean) return;

    if (!clean.includes('@')) {
      setNotification({
        type: 'error',
        message: 'Format email tidak valid.',
      });
      return;
    }

    if (authorizedAdminEmails.includes(clean)) {
      setNotification({
        type: 'info',
        message: `Email ${clean} sudah terdaftar sebagai Admin.`,
      });
      return;
    }

    const updated = [...authorizedAdminEmails, clean];
    onUpdateAuthorizedEmails(updated);
    setNewEmailInput('');
    setNotification({
      type: 'success',
      message: `Berhasil menambahkan ${clean} ke daftar Admin!`,
    });
  };

  // Remove Admin Email
  const handleRemoveAdminEmail = (emailToRemove: string) => {
    if (authorizedAdminEmails.length <= 1) {
      setNotification({
        type: 'error',
        message: 'Minimal harus ada 1 email admin terdaftar.',
      });
      return;
    }

    const updated = authorizedAdminEmails.filter((e) => e !== emailToRemove);
    onUpdateAuthorizedEmails(updated);
    setNotification({
      type: 'info',
      message: `Email ${emailToRemove} dihapus dari daftar Admin.`,
    });
  };

  // Sync to Central Google Sheet
  const handleSyncToAdminSheet = async () => {
    if (!googleAccessToken) {
      setNotification({
        type: 'error',
        message: 'Silakan masuk dengan Akun Google Admin terlebih dahulu di tombol login.',
      });
      return;
    }

    try {
      setIsSyncingSheets(true);
      setNotification(null);

      const res = await exportToGoogleSheets(googleAccessToken, pangkalanList, sheetId || undefined);
      setSheetId(res.spreadsheetId);
      setSheetUrl(res.spreadsheetUrl);
      
      const adminMail = currentUserEmail || 'Admin Nagekeo';
      setConnectedAdminEmail(adminMail);

      safeLocalStorage.setItem('pne_nagekeo_google_sheet_id', res.spreadsheetId);
      safeLocalStorage.setItem('pne_nagekeo_google_sheet_url', res.spreadsheetUrl);
      safeLocalStorage.setItem('pne_nagekeo_connected_admin_email', adminMail);

      setNotification({
        type: 'success',
        message: `Berhasil menyinkronkan data ${pangkalanList.length} pangkalan ke Google Sheet Admin Pusat!`,
      });
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Gagal menyimpan ke Google Sheet Admin Pusat.',
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Save manual custom Sheet ID or URL
  const handleSaveCustomSheetId = (e: React.FormEvent) => {
    e.preventDefault();
    let extractedId = customSheetInput.trim();
    if (extractedId.includes('/spreadsheets/d/')) {
      const match = extractedId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        extractedId = match[1];
      }
    }

    if (!extractedId) {
      setNotification({
        type: 'error',
        message: 'Masukkan ID atau URL Google Sheet yang valid.',
      });
      return;
    }

    const targetUrl = `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;
    setSheetId(extractedId);
    setSheetUrl(targetUrl);
    safeLocalStorage.setItem('pne_nagekeo_google_sheet_id', extractedId);
    safeLocalStorage.setItem('pne_nagekeo_google_sheet_url', targetUrl);

    setIsEditingSheetId(false);
    setCustomSheetInput('');
    setNotification({
      type: 'success',
      message: 'ID Google Sheet Admin Pusat berhasil diperbarui.',
    });
  };

  // Sync drive files
  const handleSyncDrive = async () => {
    if (!googleAccessToken) {
      setNotification({
        type: 'error',
        message: 'Silakan login Google dengan akun Admin terlebih dahulu.',
      });
      return;
    }

    if (uploadedDocs.length === 0) {
      setNotification({
        type: 'info',
        message: 'Belum ada berkas terunggah untuk diarsipkan ke Google Drive.',
      });
      return;
    }

    try {
      setIsSyncingDrive(true);
      setNotification(null);

      let successCount = 0;
      for (const doc of uploadedDocs) {
        const pangkalanName = pangkalanList.find((p) => p.id === doc.pangkalanId)?.nama || doc.pangkalanId;
        await uploadFileToGoogleDrive(googleAccessToken, {
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileDataUrl: doc.fileDataUrl || '',
          pangkalanName,
        });
        successCount++;
      }

      setNotification({
        type: 'success',
        message: `Berhasil mengarsipkan ${successCount} berkas ke folder Google Drive Admin Pusat!`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal mengunggah berkas ke Google Drive Admin.',
      });
    } finally {
      setIsSyncingDrive(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Header Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Pengaturan Admin & Integrasi Pusat</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  KHUSUS ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola hak akses multi-admin, tautan Google Sheet Admin Pusat Pemda Nagekeo, dan sinkronisasi arsip.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isAdminMode ? (
              <button
                onClick={onExitAdminMode}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Mode Admin</span>
              </button>
            ) : (
              <button
                onClick={onRequestAdminAuth}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Mode Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
            {notification.type === 'info' && <HelpCircle className="w-4 h-4 shrink-0 text-blue-400" />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Google Sheet Admin Pusat Connection */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Sheet Admin Pusat</h3>
                <p className="text-[11px] text-slate-400">1x Tautan awal untuk menerima seluruh input data user</p>
              </div>
            </div>

            {sheetId ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Terhubung
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Belum Terhubung
              </span>
            )}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Email Admin Terhubung</p>
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                {connectedAdminEmail || currentUserEmail || 'Belum tersambung akun Google Admin'}
              </p>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-900">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">ID Spreadsheet Admin</p>
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <code className="text-xs font-mono text-slate-300 truncate bg-slate-900 px-2 py-1 rounded border border-slate-800 block w-full">
                  {sheetId || 'Belum ada Spreadsheet Admin terhubung'}
                </code>
              </div>
            </div>

            {sheetUrl && (
              <div className="pt-2">
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Google Sheet Admin di Tab Baru</span>
                </a>
              </div>
            )}
          </div>

          {/* Sync & Change Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handleSyncToAdminSheet}
                disabled={isSyncingSheets}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50 min-h-[42px]"
              >
                {isSyncingSheets ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>Sync Data Pangkalan ke Sheet Admin</span>
              </button>

              <button
                onClick={handleSyncDrive}
                disabled={isSyncingDrive}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 min-h-[42px]"
              >
                {isSyncingDrive ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <HardDrive className="w-4 h-4 text-blue-400" />
                )}
                <span>Simpan Berkas ke Drive</span>
              </button>
            </div>

            {/* Change Sheet ID Form toggle */}
            {!isEditingSheetId ? (
              <button
                onClick={() => setIsEditingSheetId(true)}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-amber-300 py-1 transition cursor-pointer hover:underline"
              >
                + Ganti atau Hubungkan Google Sheet ID Lain Manual
              </button>
            ) : (
              <form onSubmit={handleSaveCustomSheetId} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Masukkan ID atau URL Google Sheet Admin Baru:
                </label>
                <input
                  type="text"
                  value={customSheetInput}
                  onChange={(e) => setCustomSheetInput(e.target.value)}
                  placeholder="Contoh: https://docs.google.com/spreadsheets/d/1ABC123.../edit"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingSheetId(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    Simpan Tautan Sheet
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Panel 2: Multi-Admin Email Management */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Kelola Daftar Admin (Multi-Admin)</h3>
                <p className="text-[11px] text-slate-400">Pengguna dengan email ini otomatis menjadi Admin saat Google Login</p>
              </div>
            </div>
          </div>

          {/* List of Authorized Admins */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {authorizedAdminEmails.map((email, idx) => {
              const isCurrentUser = currentUserEmail?.toLowerCase() === email.toLowerCase();
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-900 text-amber-400 border border-slate-800 shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-200 truncate">{email}</p>
                      {isCurrentUser && (
                        <span className="text-[10px] text-emerald-400 font-semibold">● Sesi Anda Sekarang</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveAdminEmail(email)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Hapus dari daftar Admin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Form Add New Admin Email */}
          <form onSubmit={handleAddAdminEmail} className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-300 block">Tambah Email Admin Baru:</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="misal: petugasperekonomian@gmail.com"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </form>

          {/* Master PIN Info */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span>PIN Utama Akses Admin Manual:</span>
            </div>
            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              migas2026
            </span>
          </div>
        </div>
      </div>

      {/* Guide Card: User vs Admin Separation Explanation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Informasi Pembagian Peran (Sisi Pengguna vs Sisi Admin)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Sisi Pengguna / Pemohon Pangkalan:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>Hanya dapat mengakses menu Cetak Surat Permohonan & Surat Pernyataan.</li>
              <li>Dapat memilih pangkalan, memeriksa status syarat perizinan, dan upload berkas.</li>
              <li>TIDAK DAPAT mengubah data master pangkalan atau menghapus syarat.</li>
              <li>Seluruh berkas yang diunggah otomatis tersimpan ke Google Sheet/Drive Admin Pusat.</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Sisi Admin Pemda Nagekeo:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>Dapat mengakses seluruh menu termasuk Data Master Pangkalan & Pengaturan Admin.</li>
              <li>Dapat menyetujui / menolak berkas pangkalan dan menambahkan catatan verifikasi.</li>
              <li>Bisa menambah/menghapus syarat master baru.</li>
              <li>Multi-admin dapat mengelola daftar email pengelola resmi.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
