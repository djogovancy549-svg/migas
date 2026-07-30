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
  Award,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Phone,
  MapPin
} from 'lucide-react';
import { Pangkalan, UploadedDocument, AgenCompany, HetKecamatan } from '../types';
import { DEFAULT_ADMIN_SHEET_ID, DEFAULT_ADMIN_SHEET_URL, SUPER_ADMIN_EMAILS } from '../data/pangkalanData';
import { safeLocalStorage } from '../lib/storage';
import { exportToGoogleSheets, uploadFileToGoogleDrive } from '../lib/googleDriveSheetsService';

interface AdminSettingsViewProps {
  pangkalanList: Pangkalan[];
  uploadedDocs: UploadedDocument[];
  isAdminMode: boolean;
  authorizedAdminEmails: string[];
  currentUserEmail?: string | null;
  googleAccessToken?: string | null;
  pimpinanPin: string;
  pimpinanNama: string;
  pimpinanNip: string;
  pimpinanJabatan: string;
  agenList: AgenCompany[];
  hetList: HetKecamatan[];
  onUpdateAuthorizedEmails: (emails: string[]) => void;
  onUpdatePimpinanInfo: (info: { pin: string; nama: string; nip: string; jabatan: string }) => void;
  onUpdateAgenList: (agenList: AgenCompany[]) => void;
  onUpdateHetList: (hetList: HetKecamatan[]) => void;
  onRequestAdminAuth: () => void;
  onExitAdminMode: () => void;
  onClearData: () => void;
  onUpdatePangkalanList?: (newList: Pangkalan[]) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  pangkalanList,
  uploadedDocs,
  isAdminMode,
  authorizedAdminEmails,
  currentUserEmail,
  googleAccessToken,
  pimpinanPin,
  pimpinanNama,
  pimpinanNip,
  pimpinanJabatan,
  agenList = [],
  hetList = [],
  onUpdateAuthorizedEmails,
  onUpdatePimpinanInfo,
  onUpdateAgenList,
  onUpdateHetList,
  onRequestAdminAuth,
  onExitAdminMode,
  onClearData,
  onUpdatePangkalanList,
}) => {
  const [newEmailInput, setNewEmailInput] = useState('');
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [isEditingSheetId, setIsEditingSheetId] = useState(false);

  // HET management state
  const [isAddingHet, setIsAddingHet] = useState(false);
  const [newKecamatan, setNewKecamatan] = useState('');
  const [newHargaHet, setNewHargaHet] = useState<number>(4660);
  const [newSkBupati, setNewSkBupati] = useState('236/KEP/HK/2018');
  const [editingKecamatan, setEditingKecamatan] = useState<string | null>(null);
  const [editHargaHet, setEditHargaHet] = useState<number>(0);

  // Leader Pimpinan Pin edit form - HIDDEN BY DEFAULT
  const [showPimpinanPin, setShowPimpinanPin] = useState(false);
  const [editPimpinanPin, setEditPimpinanPin] = useState(pimpinanPin);
  const [editPimpinanNama, setEditPimpinanNama] = useState(pimpinanNama);
  const [editPimpinanNip, setEditPimpinanNip] = useState(pimpinanNip);
  const [editPimpinanJabatan, setEditPimpinanJabatan] = useState(pimpinanJabatan);
  const [isEditingPimpinan, setIsEditingPimpinan] = useState(false);

  // Admin PIN visibility toggle - HIDDEN BY DEFAULT
  const [showAdminPin, setShowAdminPin] = useState(false);

  // Agen company add/edit state
  const [isAddingAgen, setIsAddingAgen] = useState(false);
  const [newAgenNama, setNewAgenNama] = useState('');
  const [newAgenSingkatan, setNewAgenSingkatan] = useState('');
  const [newAgenAlamat, setNewAgenAlamat] = useState('');
  const [newAgenTelepon, setNewAgenTelepon] = useState('');
  const [newAgenPJ, setNewAgenPJ] = useState('');

  const [sheetId, setSheetId] = useState<string | null>(() => {
    return safeLocalStorage.getItem('pne_nagekeo_google_sheet_id') || DEFAULT_ADMIN_SHEET_ID;
  });

  const [sheetUrl, setSheetUrl] = useState<string | null>(() => {
    return safeLocalStorage.getItem('pne_nagekeo_google_sheet_url') || DEFAULT_ADMIN_SHEET_URL;
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

  const [adminRegSuccess, setAdminRegSuccess] = useState<string | null>(null);

  // Save Pimpinan Info
  const handleSavePimpinanInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPimpinanPin.trim()) {
      setNotification({ type: 'error', message: 'PIN Pimpinan tidak boleh kosong.' });
      return;
    }

    onUpdatePimpinanInfo({
      pin: editPimpinanPin.trim(),
      nama: editPimpinanNama.trim(),
      nip: editPimpinanNip.trim(),
      jabatan: editPimpinanJabatan.trim(),
    });

    setIsEditingPimpinan(false);
    setNotification({
      type: 'success',
      message: 'Informasi & PIN Tanda Tangan Pimpinan berhasil diperbarui!',
    });
  };

  // Add New Agen Company
  const handleAddAgenCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgenNama.trim()) {
      setNotification({ type: 'error', message: 'Nama perusahaan Agen wajib diisi.' });
      return;
    }

    const newAgen: AgenCompany = {
      id: 'agen_' + Date.now(),
      nama: newAgenNama.trim(),
      singkatan: newAgenSingkatan.trim() || undefined,
      alamat: newAgenAlamat.trim() || 'Kabupaten Nagekeo',
      telepon: newAgenTelepon.trim() || undefined,
      penanggungJawab: newAgenPJ.trim() || undefined,
      kabupaten: 'NAGEKEO',
      provinsi: 'NUSA TENGGARA TIMUR',
    };

    onUpdateAgenList([...agenList, newAgen]);
    setNewAgenNama('');
    setNewAgenSingkatan('');
    setNewAgenAlamat('');
    setNewAgenTelepon('');
    setNewAgenPJ('');
    setIsAddingAgen(false);

    setNotification({
      type: 'success',
      message: `Perusahaan Agen "${newAgen.nama}" berhasil ditambahkan!`,
    });
  };

  // Delete Agen Company
  const handleDeleteAgenCompany = (agenId: string, agenNama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus perusahaan Agen "${agenNama}"?`)) {
      const updated = agenList.filter((a) => a.id !== agenId);
      onUpdateAgenList(updated);
      setNotification({
        type: 'success',
        message: `Agen "${agenNama}" berhasil dihapus.`,
      });
    }
  };

  // Add new HET Kecamatan
  const handleAddHet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKecamatan.trim()) return;

    if (hetList.some((h) => h.kecamatan.toLowerCase().trim() === newKecamatan.toLowerCase().trim())) {
      setNotification({
        type: 'error',
        message: `Kecamatan ${newKecamatan} sudah memiliki daftar HET. Silakan edit HET yang ada.`,
      });
      return;
    }

    const updated = [
      ...hetList,
      {
        kecamatan: newKecamatan.trim(),
        hargaHetPerLiter: newHargaHet,
        skBupatiNomor: newSkBupati.trim() || '236/KEP/HK/2018',
      },
    ];

    onUpdateHetList(updated);
    setIsAddingHet(false);
    setNewKecamatan('');
    setNewHargaHet(4660);
    setNotification({
      type: 'success',
      message: `HET Kecamatan ${newKecamatan} (Rp ${newHargaHet.toLocaleString('id-ID')}/Liter) berhasil ditambahkan!`,
    });
  };

  // Save Edit HET
  const handleSaveEditHet = (kecamatanName: string) => {
    const updated = hetList.map((h) =>
      h.kecamatan.toLowerCase().trim() === kecamatanName.toLowerCase().trim()
        ? { ...h, hargaHetPerLiter: editHargaHet }
        : h
    );
    onUpdateHetList(updated);
    setEditingKecamatan(null);
    setNotification({
      type: 'success',
      message: `Harga HET Kecamatan ${kecamatanName} berhasil diperbarui menjadi Rp ${editHargaHet.toLocaleString('id-ID')}/Liter!`,
    });
  };

  // Delete HET
  const handleDeleteHet = (kecamatanName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus tarif HET untuk Kecamatan ${kecamatanName}?`)) {
      const updated = hetList.filter((h) => h.kecamatan.toLowerCase().trim() !== kecamatanName.toLowerCase().trim());
      onUpdateHetList(updated);
      setNotification({
        type: 'success',
        message: `Tarif HET Kecamatan ${kecamatanName} dihapus.`,
      });
    }
  };

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
    setAdminRegSuccess(clean); // Store the newly registered email
    setNewEmailInput('');
    setNotification({
      type: 'success',
      message: `Berhasil menambahkan ${clean} ke daftar Admin!`,
    });
  };

  // Remove Admin Email
  const handleRemoveAdminEmail = (emailToRemove: string) => {
    if (SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(emailToRemove.toLowerCase())) {
      setNotification({
        type: 'error',
        message: 'Email Super Admin / Developer (djogovancy549@gmail.com / bagianekonomisdangk@gmail.com) tidak dapat dihapus.',
      });
      return;
    }

    if (authorizedAdminEmails.length <= 1) {
      setNotification({
        type: 'error',
        message: 'Minimal harus ada 1 email admin terdaftar.',
      });
      return;
    }

    const updated = authorizedAdminEmails.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase());
    onUpdateAuthorizedEmails(updated);
    setNotification({
      type: 'success',
      message: `Email ${emailToRemove} telah dihapus dari daftar Admin.`,
    });
  };

  // Sync Google Sheet Admin
  const handleSyncToAdminSheet = async () => {
    if (!googleAccessToken) {
      setNotification({
        type: 'error',
        message: 'Silakan login Google dengan akun Admin terlebih dahulu.',
      });
      return;
    }

    try {
      setIsSyncingSheets(true);
      setNotification(null);

      const res = await exportToGoogleSheets(googleAccessToken, pangkalanList, sheetId || undefined, true);

      if (res.spreadsheetId) {
        setSheetId(res.spreadsheetId);
        setSheetUrl(res.spreadsheetUrl);
        safeLocalStorage.setItem('pne_nagekeo_google_sheet_id', res.spreadsheetId);
        safeLocalStorage.setItem('pne_nagekeo_google_sheet_url', res.spreadsheetUrl);

        if (currentUserEmail) {
          setConnectedAdminEmail(currentUserEmail);
          safeLocalStorage.setItem('pne_nagekeo_connected_admin_email', currentUserEmail);
        }

        if (res.mergedPangkalanList && onUpdatePangkalanList) {
          onUpdatePangkalanList(res.mergedPangkalanList);
        }

        const totalMerged = res.mergedPangkalanList ? res.mergedPangkalanList.length : pangkalanList.length;

        setNotification({
          type: 'success',
          message: `Berhasil menggabungkan & sinkronisasi ${totalMerged} pangkalan ke Google Sheet Admin Pusat!`,
        });
      }
    } catch (err: any) {
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
                <h2 className="text-lg sm:text-xl font-black text-white">Pengaturan Admin & Integrasi System</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  KHUSUS ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola hak akses multi-admin, daftar Perusahaan Agen Penyalur, PIN Tanda Tangan Pimpinan, serta Google Sheet Admin Pusat.
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

      {/* Panel 1: Multi-Agen Company Management (NEW REQUIREMENT) */}
      <div className="bg-slate-900/90 border-2 border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Daftar Perusahaan Agen Penyalur Resmi (Multi-Agen)</h3>
              <p className="text-[11px] text-slate-400">
                Kelola nama-nama agen penyalur resmi minyak tanah yang beroperasi di Kabupaten Nagekeo
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingAgen(!isAddingAgen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0 shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingAgen ? 'Batal Tambah' : 'Tambah Perusahaan Agen'}</span>
          </button>
        </div>

        {/* Form Add Agen Company */}
        {isAddingAgen && (
          <form onSubmit={handleAddAgenCompany} className="p-4 bg-slate-950 rounded-xl border border-blue-500/30 space-y-3">
            <h4 className="text-xs font-bold text-blue-300">Input Perusahaan Agen Baru:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nama Perusahaan Agen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: PT. NAGEKEO MIGAS SEJAHTERA"
                  value={newAgenNama}
                  onChange={(e) => setNewAgenNama(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Singkatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="misal: PT. NMS"
                  value={newAgenSingkatan}
                  onChange={(e) => setNewAgenSingkatan(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Alamat Agen / Kantor
                </label>
                <input
                  type="text"
                  placeholder="misal: Jln. Soekarno-Hatta Mbay"
                  value={newAgenAlamat}
                  onChange={(e) => setNewAgenAlamat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  No. Telepon / Kontak
                </label>
                <input
                  type="text"
                  placeholder="misal: 0812-xxxx-xxxx"
                  value={newAgenTelepon}
                  onChange={(e) => setNewAgenTelepon(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingAgen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition"
              >
                Simpan Perusahaan Agen
              </button>
            </div>
          </form>
        )}

        {/* Agen Company Cards List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {agenList.map((agen) => (
            <div
              key={agen.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm truncate">{agen.nama}</span>
                  {agen.singkatan && (
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                      {agen.singkatan}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{agen.alamat || 'Nagekeo, NTT'}</span>
                </p>
                {agen.telepon && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{agen.telepon}</span>
                  </p>
                )}
              </div>

              {agenList.length > 1 && (
                <button
                  onClick={() => handleDeleteAgenCompany(agen.id, agen.nama)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
                  title="Hapus Perusahaan Agen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panel Daftar Harga Eceran Tertinggi (HET) per Kecamatan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Kelola Daftar Harga Eceran Tertinggi (HET) per Kecamatan</h3>
              <p className="text-[11px] text-slate-400">
                Atur tarif resmi HET per kecamatan untuk Surat Rekomendasi & Surat Pernyataan (Sesuai SK Bupati Nagekeo)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingHet(!isAddingHet)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingHet ? 'Batal Tambah' : 'Tambah HET Kecamatan'}</span>
          </button>
        </div>

        {/* Add HET Form */}
        {isAddingHet && (
          <form onSubmit={handleAddHet} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-300">Tambah Tarif HET Kecamatan Baru:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nama Kecamatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aesesa"
                  value={newKecamatan}
                  onChange={(e) => setNewKecamatan(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Harga HET per Liter (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="4660"
                  value={newHargaHet}
                  onChange={(e) => setNewHargaHet(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nomor SK Bupati Nagekeo</label>
                <input
                  type="text"
                  placeholder="236/KEP/HK/2018"
                  value={newSkBupati}
                  onChange={(e) => setNewSkBupati(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingHet(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Simpan HET Kecamatan
              </button>
            </div>
          </form>
        )}

        {/* HET Table / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hetList.map((h) => (
            <div
              key={h.kecamatan}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Kec. {h.kecamatan}</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                  SK: {h.skBupatiNomor || '236/KEP/HK/2018'}
                </span>
              </div>

              {editingKecamatan === h.kecamatan ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={editHargaHet}
                    onChange={(e) => setEditHargaHet(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-emerald-500 rounded-lg px-2 py-1 text-xs text-emerald-300 font-bold"
                  />
                  <button
                    onClick={() => handleSaveEditHet(h.kecamatan)}
                    className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditingKecamatan(null)}
                    className="px-2 py-1 text-slate-400 text-xs hover:text-white"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-black text-amber-400">
                    Rp {h.hargaHetPerLiter.toLocaleString('id-ID')} / Liter
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingKecamatan(h.kecamatan);
                        setEditHargaHet(h.hargaHetPerLiter);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
                      title="Edit Harga HET"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {hetList.length > 1 && (
                      <button
                        onClick={() => handleDeleteHet(h.kecamatan)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Hapus HET Kecamatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panel Pimpinan PIN & Digital Signature Setting */}
      <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Kelola PIN & Tanda Tangan Digital Pimpinan</h3>
              <p className="text-[11px] text-slate-400">PIN khusus untuk menyetujui dan membubuhkan TTD QR Code pada Surat Rekomendasi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPimpinanPin(!showPimpinanPin)}
              className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg flex items-center gap-1.5 border border-slate-700"
              title="Sembunyikan/Tampilkan PIN Pimpinan"
            >
              {showPimpinanPin ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span>{showPimpinanPin ? 'Sembunyikan' : 'Tampilkan PIN'}</span>
            </button>

            <button
              onClick={() => setIsEditingPimpinan(!isEditingPimpinan)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{isEditingPimpinan ? 'Batal Edit' : 'Edit PIN / Data Pimpinan'}</span>
            </button>
          </div>
        </div>

        {/* Display Current Leader PIN to Admin (Masked by default) */}
        <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">PIN Tanda Tangan Pimpinan:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-black text-amber-400 text-sm bg-slate-900 px-3 py-1 rounded border border-amber-500/40 tracking-wider">
                  {showPimpinanPin ? pimpinanPin : '••••••••'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Nama Pimpinan:</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{pimpinanNama}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">NIP Pimpinan:</span>
              <span className="font-mono text-slate-300 mt-0.5 block">{pimpinanNip}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Jabatan:</span>
              <span className="text-slate-300 mt-0.5 block">{pimpinanJabatan}</span>
            </div>
          </div>
        </div>

        {/* Form Edit Leader PIN & Data */}
        {isEditingPimpinan && (
          <form onSubmit={handleSavePimpinanInfo} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-300">Edit Data & PIN Pimpinan:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  PIN Tanda Tangan Pimpinan *
                </label>
                <input
                  type="text"
                  required
                  value={editPimpinanPin}
                  onChange={(e) => setEditPimpinanPin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={editPimpinanNama}
                  onChange={(e) => setEditPimpinanNama(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  NIP Pimpinan *
                </label>
                <input
                  type="text"
                  required
                  value={editPimpinanNip}
                  onChange={(e) => setEditPimpinanNip(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Jabatan Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={editPimpinanJabatan}
                  onChange={(e) => setEditPimpinanJabatan(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingPimpinan(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Simpan Perubahan Pimpinan
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Google Sheet Admin Pusat Connection */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Sheet Admin Pusat</h3>
                <p className="text-[11px] text-slate-400">Tautan pusat untuk sinkronisasi data seluruh pangkalan</p>
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

        {/* Panel Multi-Admin Email Management */}
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
              const isSuperAdminEmail = SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
              const currentIsSuper = !currentUserEmail || SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(currentUserEmail.toLowerCase());

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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-slate-200 truncate">{email}</p>
                        {isSuperAdminEmail && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            ★ Super Admin / Developer
                          </span>
                        )}
                      </div>
                      {isCurrentUser && (
                        <span className="text-[10px] text-emerald-400 font-semibold block">● Sesi Anda Sekarang</span>
                      )}
                    </div>
                  </div>

                  {!isSuperAdminEmail && currentIsSuper ? (
                    <button
                      onClick={() => handleRemoveAdminEmail(email)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                      title="Hapus dari daftar Admin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Form Add New Admin Email (Super Admin Only) */}
          {(!currentUserEmail || SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(currentUserEmail.toLowerCase())) ? (
            <form onSubmit={handleAddAdminEmail} className="space-y-3 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">Tambah & Daftarkan Email Admin Baru (Oleh Super Admin):</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => {
                    setNewEmailInput(e.target.value);
                    if (adminRegSuccess) setAdminRegSuccess(null); // Clear success state when typing new email
                  }}
                  placeholder="misal: petugasperekonomian@gmail.com"
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition cursor-pointer shrink-0 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Simpan & Daftarkan Admin Baru</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-300">
              🔒 <strong>Pengelolaan Email Admin:</strong> Hanya Super Admin (bagianekonomisdangk@gmail.com / djogovancy549@gmail.com) yang dapat menambah atau menghapus email Admin.
            </div>
          )}

          {/* Success Notification Alert Card (Directly visible in this panel) */}
          {adminRegSuccess && (
            <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-xl text-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>BERHASIL MENDAFTARKAN ADMIN BARU!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminRegSuccess(null)}
                  className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Email <strong className="text-emerald-400 font-mono text-[12px] bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/20">{adminRegSuccess}</strong> kini telah **berhasil didaftarkan** sebagai admin baru secara realtime di database cloud Firestore.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Pemberitahuan Sukses:\n\nEmail "${adminRegSuccess}" telah resmi terdaftar sebagai Admin Baru di database cloud Firestore.\n\nHak akses penuh telah dibuka secara otomatis dan langsung berlaku tanpa perlu restart.`);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tombol Pemberitahuan Sukses</span>
                </button>
              </div>
            </div>
          )}

          {/* Master PIN Info (Masked by default) */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span>PIN Akses Mode Admin System (Super Admin):</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 tracking-wider">
                {showAdminPin ? 'migas2026' : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowAdminPin(!showAdminPin)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                title="Sembunyikan/Tampilkan PIN Admin"
              >
                {showAdminPin ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
