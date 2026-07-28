import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuthListener,
  signInWithGoogle,
  logoutGoogle,
  getCachedAccessToken,
} from '../lib/googleAuth';
import {
  exportToGoogleSheets,
  uploadFileToGoogleDrive,
} from '../lib/googleDriveSheetsService';
import { Pangkalan, UploadedDocument } from '../types';
import { FileSpreadsheet, HardDrive, LogIn, LogOut, CheckCircle2, Loader2, ExternalLink, AlertCircle, Trash2 } from 'lucide-react';

interface GoogleSyncBarProps {
  pangkalanList: Pangkalan[];
  uploadedDocs: UploadedDocument[];
  onClearDummyData: () => void;
}

export const GoogleSyncBar: React.FC<GoogleSyncBarProps> = ({
  pangkalanList,
  uploadedDocs,
  onClearDummyData,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);

  const [sheetUrl, setSheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('pne_nagekeo_google_sheet_url');
  });
  const [sheetId, setSheetId] = useState<string | null>(() => {
    return localStorage.getItem('pne_nagekeo_google_sheet_id');
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuthListener(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setNotification(null);
    try {
      setIsLoadingAuth(true);
      const res = await signInWithGoogle();
      setUser(res.user);
      setAccessToken(res.accessToken);
      setNotification({
        type: 'success',
        message: `Berhasil masuk sebagai ${res.user.displayName || res.user.email}`,
      });
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Gagal login Google. Pastikan mengizinkan popup.',
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setAccessToken(null);
    setNotification({
      type: 'info',
      message: 'Sudah keluar dari akun Google.',
    });
  };

  const handleSyncSheets = async () => {
    if (!accessToken) {
      setNotification({
        type: 'error',
        message: 'Silakan login dengan Google terlebih dahulu.',
      });
      return;
    }

    try {
      setIsSyncingSheets(true);
      setNotification(null);

      const result = await exportToGoogleSheets(accessToken, pangkalanList, sheetId || undefined);
      setSheetId(result.spreadsheetId);
      setSheetUrl(result.spreadsheetUrl);
      localStorage.setItem('pne_nagekeo_google_sheet_id', result.spreadsheetId);
      localStorage.setItem('pne_nagekeo_google_sheet_url', result.spreadsheetUrl);

      setNotification({
        type: 'success',
        message: `Data ${pangkalanList.length} pangkalan berhasil disimpan ke Google Sheets!`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal sync data ke Google Sheets.',
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSyncDriveFiles = async () => {
    if (!accessToken) {
      setNotification({
        type: 'error',
        message: 'Silakan login dengan Google terlebih dahulu.',
      });
      return;
    }

    if (uploadedDocs.length === 0) {
      setNotification({
        type: 'info',
        message: 'Belum ada berkas dokumen yang diunggah untuk disimpan ke Drive.',
      });
      return;
    }

    try {
      setIsSyncingDrive(true);
      setNotification(null);

      let successCount = 0;
      for (const doc of uploadedDocs) {
        const pangkalanName = pangkalanList.find((p) => p.id === doc.pangkalanId)?.nama || doc.pangkalanId;
        await uploadFileToGoogleDrive(accessToken, {
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileDataUrl: doc.fileDataUrl,
          pangkalanName,
        });
        successCount++;
      }

      setNotification({
        type: 'success',
        message: `Berhasil mengunggah ${successCount} berkas persyaratan ke folder Google Drive!`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal mengunggah berkas ke Google Drive.',
      });
    } finally {
      setIsSyncingDrive(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 my-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">Integrasi Google Sheets & Drive</h3>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Otomatis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simpan database pangkalan ke Google Sheets & arsipkan berkas persyaratan ke Google Drive
            </p>
          </div>
        </div>

        {/* Right Auth / Account Button */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isLoadingAuth ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Memeriksa Akun Google...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 pr-3 text-xs w-full sm:w-auto justify-between">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="truncate max-w-[140px]">
                  <p className="font-bold text-white truncate">{user.displayName || 'Pengguna Google'}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Terhubung
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar Akun Google"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs shadow transition cursor-pointer min-h-[44px] w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login Google untuk Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons for Sheets, Drive, & Clear Dummy */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
        {/* Sync Google Sheets */}
        <button
          onClick={handleSyncSheets}
          disabled={isSyncingSheets}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow cursor-pointer min-h-[44px]"
        >
          {isSyncingSheets ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          )}
          <span>{isSyncingSheets ? 'Menyimpan...' : 'Simpan ke Google Sheets'}</span>
        </button>

        {/* Sync Google Drive */}
        <button
          onClick={handleSyncDriveFiles}
          disabled={isSyncingDrive}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow cursor-pointer min-h-[44px]"
        >
          {isSyncingDrive ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <HardDrive className="w-4 h-4 text-blue-200" />
          )}
          <span>{isSyncingDrive ? 'Mengunggah...' : `Upload Berkas ke Drive (${uploadedDocs.length})`}</span>
        </button>

        {/* Clear Dummy Data option */}
        <button
          onClick={onClearDummyData}
          className="inline-flex items-center justify-center gap-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow cursor-pointer min-h-[44px]"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Hapus Data Dummy</span>
        </button>
      </div>

      {/* Active Spreadsheet Link if generated */}
      {sheetUrl && (
        <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-800/60 p-2.5 rounded-xl text-xs text-emerald-300">
          <div className="flex items-center gap-2 truncate">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate font-semibold">Google Spreadsheet Tersambung</span>
          </div>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg text-[11px] font-bold border border-emerald-500/40 shrink-0"
          >
            <span>Buka Google Sheets</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Notifications banner */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800'
              : notification.type === 'error'
              ? 'bg-rose-950/80 text-rose-200 border border-rose-800'
              : 'bg-blue-950/80 text-blue-200 border border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
