import React, { useState } from 'react';
import { Pangkalan, PersyaratanStatus, JenisPermohonan, MasterRequirementItem, UploadedDocument } from '../types';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Building2, User, Search, Printer, ShieldAlert, Upload, Plus, Trash2, FileText, Lock, ShieldCheck, FolderCheck, FolderX, FolderOpen } from 'lucide-react';

interface PersyaratanChecklistViewProps {
  pangkalanList: Pangkalan[];
  checklistData: Record<string, PersyaratanStatus>;
  masterRequirements: MasterRequirementItem[];
  uploadedDocs: UploadedDocument[];
  isAdminMode: boolean;
  onRequestAdminAuth: () => void;
  onUpdateChecklist: (pangkalanId: string, updated: PersyaratanStatus) => void;
  onOpenUploadModal: (pangkalan: Pangkalan) => void;
  onAddMasterRequirement: (item: MasterRequirementItem) => void;
  onDeleteMasterRequirement: (key: string) => void;
}

export const PersyaratanChecklistView: React.FC<PersyaratanChecklistViewProps> = ({
  pangkalanList = [],
  checklistData = {},
  masterRequirements = [],
  uploadedDocs = [],
  isAdminMode = false,
  onRequestAdminAuth,
  onUpdateChecklist,
  onOpenUploadModal,
  onAddMasterRequirement,
  onDeleteMasterRequirement,
}) => {
  const safePangkalanList = pangkalanList || [];
  const safeMasterReqs = masterRequirements || [];
  const safeUploadedDocs = uploadedDocs || [];
  const safeChecklistData = checklistData || {};

  const [selectedPangkalanId, setSelectedPangkalanId] = useState<string>(
    safePangkalanList[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddReqForm, setShowAddReqForm] = useState(false);

  // Form for adding new master requirement
  const [newReqLabel, setNewReqLabel] = useState('');
  const [newReqFor, setNewReqFor] = useState<'Semua' | 'Perpanjangan' | 'Baru'>('Semua');
  const [newReqMandatory, setNewReqMandatory] = useState(true);
  const [newReqDesc, setNewReqDesc] = useState('');

  const currentPangkalan =
    safePangkalanList.find((p) => p && p.id === selectedPangkalanId) || safePangkalanList[0];

  const activePangkalanId = currentPangkalan?.id || '';

  const currentStatus = (activePangkalanId && safeChecklistData[activePangkalanId]) || {
    pangkalanId: activePangkalanId,
    jenis: 'Perpanjangan',
    suratPermohonan: true,
    ktp: true,
    npwp: true,
    nib: true,
    sku: true,
    rekomendasiSebelumnya: true,
    suratPernyataan: true,
  };

  const handleToggle = (key: string) => {
    if (!activePangkalanId || !currentStatus) return;
    const updated = {
      ...currentStatus,
      [key]: !currentStatus[key],
    };
    onUpdateChecklist(activePangkalanId, updated);
  };

  const handleJenisChange = (jenis: JenisPermohonan) => {
    if (!activePangkalanId || !currentStatus) return;
    const updated: PersyaratanStatus = {
      ...currentStatus,
      jenis,
    };
    onUpdateChecklist(activePangkalanId, updated);
  };

  const handleCreateMasterReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqLabel.trim()) return;
    const generatedKey = 'custom_' + Date.now();
    onAddMasterRequirement({
      key: generatedKey,
      label: newReqLabel.trim(),
      requiredFor: newReqFor,
      mandatory: newReqMandatory,
      description: newReqDesc.trim(),
      addedByAdmin: true,
    });
    setNewReqLabel('');
    setNewReqDesc('');
    setShowAddReqForm(false);
  };

  // Filter master requirements for active type
  const activeChecklistItems = safeMasterReqs.filter(
    (item) => item && (item.requiredFor === 'Semua' || item.requiredFor === (currentStatus?.jenis || 'Perpanjangan'))
  );

  const completedCount = activeChecklistItems.filter(
    (item) => !!currentStatus?.[item.key]
  ).length;
  const totalCount = activeChecklistItems.length;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  // Uploaded docs for selected pangkalan
  const currentUploadedDocs = safeUploadedDocs.filter((d) => d && d.pangkalanId === activePangkalanId);

  return (
    <div className="space-y-6">
      {/* Official Government Regulation Card */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                PEMERINTAH KABUPATEN NAGEKEO - SEKRETARIAT DAERAH
              </span>
              {isAdminMode ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Mode Admin Aktif (PIN migas2026)
                </span>
              ) : (
                <button
                  onClick={onRequestAdminAuth}
                  className="text-[10px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 cursor-pointer transition"
                >
                  <Lock className="w-3 h-3 text-amber-400" /> Input Persyaratan Admin (PIN)
                </button>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1.5">
              Persyaratan & Dokumen Perizinan Pangkalan Minyak Tanah
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bagian Perekonomian dan SDA Setda Kabupaten Nagekeo • Jln. Soekarno - Hatta CIVIC CENTRE
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3 shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-300">CATATAN PEMKAB NAGEKEO:</p>
              <p className="text-slate-300">Bagi pemohon diharapkan mengunggah berkas asli (PDF/JPG/PNG) & membawa berkas fisik saat verifikasi.</p>
            </div>
          </div>
        </div>

        {/* Requirements Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-400 text-xs mb-1">A. PERPANJANGAN REKOMENDASI (5 BERKAS UTAMA):</p>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
              <li>Surat Permohonan Perpanjangan kepada Kabag Perekonomian & SDA</li>
              <li>Fotocopy KTP Pemilik & SKU Desa/Kelurahan</li>
              <li>Rekomendasi Tahun Sebelumnya & Surat Pernyataan Meterai 10.000</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-400 text-xs mb-1">B. PERMOHONAN BARU (7 BERKAS UTAMA):</p>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
              <li>Surat Permohonan Baru kepada Kabag Perekonomian & SDA</li>
              <li>Fotocopy KTP, NIB (OSS), NPWP, & SKU Desa/Kelurahan</li>
              <li>Surat Pernyataan Pendropingan Agen & Surat Pernyataan Meterai 10.000</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Admin Panel: Add Custom Master Requirement */}
      {isAdminMode && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Kelola Jenis Persyaratan Master (Khusus Admin)</h3>
            </div>
            <button
              onClick={() => setShowAddReqForm(!showAddReqForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddReqForm ? 'Tutup Form' : 'Tambah Jenis Persyaratan'}</span>
            </button>
          </div>

          {showAddReqForm && (
            <form onSubmit={handleCreateMasterReq} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama / Nama Berkas Persyaratan:</label>
                  <input
                    type="text"
                    required
                    value={newReqLabel}
                    onChange={(e) => setNewReqLabel(e.target.value)}
                    placeholder="Contoh: Surat Bebas Sengketa Lahan / Pas Foto 3x4"
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Permohonan:</label>
                  <select
                    value={newReqFor}
                    onChange={(e) => setNewReqFor(e.target.value as any)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold"
                  >
                    <option value="Semua">Semua (Perpanjangan & Baru)</option>
                    <option value="Perpanjangan">Khusus Perpanjangan</option>
                    <option value="Baru">Khusus Permohonan Baru</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan Tambahan / Petunjuk Upload:</label>
                <input
                  type="text"
                  value={newReqDesc}
                  onChange={(e) => setNewReqDesc(e.target.value)}
                  placeholder="Penjelasan singkat mengenai format berkas..."
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={newReqMandatory}
                    onChange={(e) => setNewReqMandatory(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Wajib Diisi / Upload</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Simpan Persyaratan Baru
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Interactive Tracker Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List: Select Pangkalan */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pilih Pangkalan</h3>
            <span className="text-[11px] font-semibold text-slate-400">{pangkalanList.length} Total</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari pangkalan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 text-xs">
            {safePangkalanList
              .filter(
                (p) =>
                  p &&
                  ((p.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.kecamatan || '').toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((p) => {
                const isSelected = p.id === selectedPangkalanId;
                const status = safeChecklistData[p.id];
                const activeReqs = safeMasterReqs.filter(
                  (m) => m && (m.requiredFor === 'Semua' || m.requiredFor === (status?.jenis || 'Perpanjangan'))
                );
                const doneCount = activeReqs.filter((m) => !!status?.[m.key]).length;
                const itemsCount = activeReqs.length;
                const isComplete = itemsCount > 0 && doneCount === itemsCount;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPangkalanId(p.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="truncate text-xs">{p.nama || 'Pangkalan'}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                        {p.id} • Kec. {p.kecamatan || '-'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isComplete
                          ? isSelected
                            ? 'bg-slate-950 text-emerald-400'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isSelected
                          ? 'bg-slate-950 text-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {doneCount}/{itemsCount}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Active Checklist Form */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6 backdrop-blur-sm">
          {!currentPangkalan ? (
            <div className="text-center py-12 space-y-3">
              <FolderX className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Belum Ada Pangkalan Terpilih</h3>
              <p className="text-xs text-slate-400">Silakan tambahkan pangkalan baru di menu Data Pangkalan.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {currentPangkalan.id}
                    </span>
                    <span className="text-xs text-slate-400">Kel. {currentPangkalan.kelurahan || '-'}, Kec. {currentPangkalan.kecamatan || '-'}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{currentPangkalan.nama || 'Pangkalan'}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Upload / Folder Persyaratan Trigger */}
                  {isAdminMode ? (
                    <button
                      onClick={() => currentPangkalan && onOpenUploadModal(currentPangkalan)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl text-xs transition cursor-pointer border shadow-md ${
                        currentUploadedDocs.length > 0
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                      }`}
                      title="Buka Folder Berkas Pangkalan"
                    >
                      {currentUploadedDocs.length > 0 ? (
                        <>
                          <FolderCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Folder Berkas: Ada File ({currentUploadedDocs.length})</span>
                        </>
                      ) : (
                        <>
                          <FolderX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Folder Berkas: Kosong</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => currentPangkalan && onOpenUploadModal(currentPangkalan)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Berkas (PDF/Foto)</span>
                      {currentUploadedDocs.length > 0 && (
                        <span className="bg-white text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          {currentUploadedDocs.length}
                        </span>
                      )}
                    </button>
                  )}

              {/* Category Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleJenisChange('Perpanjangan')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    currentStatus.jenis === 'Perpanjangan'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Perpanjangan
                </button>
                <button
                  onClick={() => handleJenisChange('Baru')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    currentStatus.jenis === 'Baru'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Baru
                </button>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Status Kelengkapan Dokumen:</p>
              <p className="text-sm font-black text-white mt-0.5">
                {completedCount} dari {totalCount} Persyaratan Terpenuhi
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                isAllComplete ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isAllComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              <span>{isAllComplete ? 'LENGKAP & SIAP DIMAJUKAN' : 'BELUM LENGKAP'}</span>
            </span>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Daftar Ceklist Persyaratan ({currentStatus.jenis}):
            </p>

            <div className="space-y-2">
              {activeChecklistItems.map((item) => {
                const isChecked = !!currentStatus[item.key];
                const uploadedFile = currentUploadedDocs.find((d) => d.documentKey === item.key);

                return (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      onClick={() => handleToggle(item.key)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                          isChecked ? 'bg-emerald-500 text-slate-950 font-bold' : 'border-2 border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div>
                        <span className="text-xs font-bold text-white block">{item.label}</span>
                        {item.description && (
                          <span className="text-[11px] text-slate-400 block">{item.description}</span>
                        )}
                        {uploadedFile && (
                          <span className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5 font-mono">
                            <FileText className="w-3 h-3" />
                            File: {uploadedFile.fileName} ({uploadedFile.status})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAdminMode ? (
                        <button
                          onClick={() => onOpenUploadModal(currentPangkalan)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                            uploadedFile
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700/60'
                          }`}
                          title="Buka Folder Berkas Pangkalan"
                        >
                          {uploadedFile ? (
                            <>
                              <FolderCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>Ada File</span>
                            </>
                          ) : (
                            <>
                              <FolderX className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Folder Kosong</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenUploadModal(currentPangkalan)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1"
                          title="Upload / Lihat File"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{uploadedFile ? 'Lihat File' : 'Upload File'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleToggle(item.key)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md cursor-pointer ${
                          isChecked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isChecked ? 'Ada / Sesuai' : 'Belum Ada'}
                      </button>

                      {isAdminMode && item.addedByAdmin && (
                        <button
                          onClick={() => onDeleteMasterRequirement(item.key)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded cursor-pointer"
                          title="Hapus Persyaratan Custom"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>
  );
};
