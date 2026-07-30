import React, { useState } from 'react';
import { DeletePinModal } from './DeletePinModal';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Trash2,
  FileCheck,
  Building,
  ShieldAlert,
  Download,
  Plus,
  Folder,
  FolderCheck,
  FolderOpen,
  FolderX
} from 'lucide-react';
import { Pangkalan, MasterRequirementItem, UploadedDocument } from '../types';

interface UploadPersyaratanModalProps {
  isOpen: boolean;
  pangkalan: Pangkalan | null;
  masterRequirements: MasterRequirementItem[];
  uploadedDocs: UploadedDocument[];
  isAdminMode: boolean;
  currentUserEmail?: string | null;
  authorizedAdminEmails?: string[];
  onClose: () => void;
  onUploadFile: (pangkalanId: string, docKey: string, docName: string, file: File) => void;
  onDeleteFile: (docId: string) => void;
  onUpdateStatus: (docId: string, status: 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak', catatan?: string) => void;
  onRequestAdminAuth?: () => void;
}

export const UploadPersyaratanModal: React.FC<UploadPersyaratanModalProps> = ({
  isOpen,
  pangkalan,
  masterRequirements,
  uploadedDocs,
  isAdminMode,
  currentUserEmail,
  authorizedAdminEmails = [],
  onClose,
  onUploadFile,
  onDeleteFile,
  onUpdateStatus,
  onRequestAdminAuth
}) => {
  const isNonAdminEmailLogged = Boolean(
    currentUserEmail &&
    authorizedAdminEmails.length > 0 &&
    !authorizedAdminEmails.map((e) => e.toLowerCase()).includes(currentUserEmail.toLowerCase())
  );
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<UploadedDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<UploadedDocument | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'semua' | 'perlu_upload' | 'terupload'>('semua');
  const [adminNoteInput, setAdminNoteInput] = useState<{ [docId: string]: string }>({});

  if (!isOpen || !pangkalan) return null;

  // Filter documents for current pangkalan
  const currentPangkalanDocs = uploadedDocs.filter((d) => d.pangkalanId === pangkalan.id);

  // Handle File Input Change
  const handleFileInputChange = (docKey: string, docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUploadFile(pangkalan.id, docKey, docName, file);
      e.target.value = ''; // reset input
    }
  };

  const getDocStatus = (docKey: string) => {
    return currentPangkalanDocs.find((d) => d.documentKey === docKey);
  };

  // Filter master requirements based on pangkalan status or type if needed
  const relevantRequirements = masterRequirements;

  // Statistics
  const uploadedCount = relevantRequirements.filter((req) => getDocStatus(req.key)).length;
  const totalReqCount = relevantRequirements.length;
  const approvedCount = currentPangkalanDocs.filter((d) => d.status === 'Disetujui').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              {isAdminMode ? <FolderOpen className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ID: {pangkalan.id}
                </span>
                <span className="text-xs text-slate-400">
                  Kel. {pangkalan.kelurahan}, Kec. {pangkalan.kecamatan}
                </span>
                {isAdminMode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Mode Admin
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {isAdminMode ? `Folder Berkas & Verifikasi: ${pangkalan.nama}` : `Upload Persyaratan: ${pangkalan.nama}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isAdminMode && !isNonAdminEmailLogged && onRequestAdminAuth && (
              <button
                onClick={onRequestAdminAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Mode Admin (PIN)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Banner */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                {isAdminMode ? <Folder className="w-4 h-4 text-amber-400" /> : <FileCheck className="w-4 h-4 text-amber-400" />}
                <span>{isAdminMode ? 'Status Folder Berkas Pangkalan (Admin):' : 'Status Upload Berkas Persyaratan:'}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  {isAdminMode
                    ? uploadedCount > 0
                      ? `Folder Ada File (${uploadedCount} dari ${totalReqCount} Dokumen)`
                      : 'Folder Kosong (Belum ada file terupload)'
                    : `${uploadedCount} / ${totalReqCount} Dokumen Ter-upload`}
                </span>
                {uploadedCount === totalReqCount && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Berkas Lengkap
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Verifikasi Admin: <strong className="text-emerald-400">{approvedCount} Disetujui</strong>
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveTabFilter('semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTabFilter === 'semua' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({totalReqCount})
              </button>
              <button
                onClick={() => setActiveTabFilter('perlu_upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTabFilter === 'perlu_upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Belum Ada ({totalReqCount - uploadedCount})
              </button>
              <button
                onClick={() => setActiveTabFilter('terupload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTabFilter === 'terupload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sudah Ada ({uploadedCount})
              </button>
            </div>
          </div>

          {/* Master Requirement List with Upload Action */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              Daftar Dokumen Persyaratan Pangkalan Minyak Tanah
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {relevantRequirements
                .filter((req) => {
                  const uploaded = getDocStatus(req.key);
                  if (activeTabFilter === 'perlu_upload') return !uploaded;
                  if (activeTabFilter === 'terupload') return !!uploaded;
                  return true;
                })
                .map((req) => {
                  const doc = getDocStatus(req.key);
                  return (
                    <div
                      key={req.key}
                      className={`p-4 rounded-xl border transition ${
                        doc
                          ? doc.status === 'Disetujui'
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : doc.status === 'Ditolak'
                            ? 'bg-red-950/20 border-red-500/30'
                            : 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Req Info */}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-200 text-sm">{req.label}</span>
                            {req.mandatory ? (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                Wajib
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                Opsional
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({req.requiredFor})
                            </span>
                          </div>
                          {req.description && (
                            <p className="text-[11px] text-slate-400">{req.description}</p>
                          )}

                          {/* Uploaded Doc Details */}
                          {doc && (
                            <div className="mt-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                                <div className="truncate">
                                  <p className="font-semibold text-slate-200 truncate text-xs">{doc.fileName}</p>
                                  <p className="text-[10px] text-slate-500">
                                    {(doc.fileSize / 1024).toFixed(1)} KB • Di-upload: {doc.uploadedAt}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Status Badge */}
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    doc.status === 'Disetujui'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : doc.status === 'Ditolak'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {doc.status}
                                </span>

                                {/* Preview Button */}
                                {doc.fileDataUrl && (
                                  <button
                                    onClick={() => setSelectedPreviewDoc(doc)}
                                    className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
                                    title="Pratinjau Berkas"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete Button */}
                                <button
                                  onClick={() => setDocToDelete(doc)}
                                  className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition cursor-pointer"
                                  title="Hapus File (Dilindungi PIN)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {doc && doc.catatanAdmin && (
                            <p className="text-[11px] text-amber-300 italic mt-1 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                              Catatan Admin: {doc.catatanAdmin}
                            </p>
                          )}
                        </div>

                        {/* Upload Controls / Admin Actions */}
                        <div className="shrink-0 flex items-center gap-2">
                          {!doc ? (
                            isAdminMode ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-xl text-xs">
                                  <FolderX className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                                  <span>Folder Kosong</span>
                                </span>
                                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-[11px] font-semibold transition cursor-pointer" title="Upload atas nama pangkalan">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpeg,.jpg,.png,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => handleFileInputChange(req.key, req.label, e)}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-500/10">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpeg,.jpg,.png,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => handleFileInputChange(req.key, req.label, e)}
                                />
                              </label>
                            )
                          ) : (
                            <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer">
                              <Upload className="w-3 h-3" />
                              <span>Ganti</span>
                              <input
                                type="file"
                                accept=".pdf,.jpeg,.jpg,.png,.doc,.docx"
                                className="hidden"
                                onChange={(e) => handleFileInputChange(req.key, req.label, e)}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Admin Verification Panel */}
                      {isAdminMode && doc && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-950/60 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-amber-400">Verifikasi Admin:</span>
                            <button
                              onClick={() => onUpdateStatus(doc.id, 'Disetujui', adminNoteInput[doc.id])}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                                doc.status === 'Disetujui'
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-emerald-400 hover:bg-emerald-500/20'
                              }`}
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => onUpdateStatus(doc.id, 'Ditolak', adminNoteInput[doc.id] || 'Berkas tidak jelas/buram')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                                doc.status === 'Ditolak'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-800 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              Tolak
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Catatan verifikasi admin..."
                            value={adminNoteInput[doc.id] ?? doc.catatanAdmin ?? ''}
                            onChange={(e) =>
                              setAdminNoteInput({ ...adminNoteInput, [doc.id]: e.target.value })
                            }
                            className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <p className="text-slate-400">
            Format yang didukung: <strong className="text-slate-200">PDF, JPG, JPEG, PNG, DOCX</strong>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* File Preview Sub-Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="font-bold text-white truncate text-sm">
                  {selectedPreviewDoc.documentName} ({selectedPreviewDoc.fileName})
                </span>
              </div>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-950/80">
              {selectedPreviewDoc.fileType.includes('image') ? (
                <img
                  src={selectedPreviewDoc.fileDataUrl}
                  alt={selectedPreviewDoc.fileName}
                  className="max-h-[65vh] object-contain rounded-lg border border-slate-800"
                />
              ) : selectedPreviewDoc.fileType.includes('pdf') ? (
                <iframe
                  src={selectedPreviewDoc.fileDataUrl}
                  className="w-full h-[65vh] rounded-lg border border-slate-800"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-amber-400 mx-auto opacity-80" />
                  <p className="text-slate-300 font-semibold">{selectedPreviewDoc.fileName}</p>
                  <p className="text-slate-500 text-xs">
                    File format ini dapat diunduh untuk dibuka pada perangkat Anda.
                  </p>
                  <a
                    href={selectedPreviewDoc.fileDataUrl}
                    download={selectedPreviewDoc.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete File PIN Modal */}
      <DeletePinModal
        isOpen={!!docToDelete}
        title="Konfirmasi Hapus Berkas Persyaratan"
        description="Apakah Anda yakin ingin menghapus berkas dokumen berikut ini? Masukkan PIN Administrator migas2026 untuk melanjutkan."
        itemDetails={docToDelete ? `Dokumen: ${docToDelete.documentName} (${docToDelete.fileName})` : ''}
        isBulkClear={false}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => {
          if (docToDelete) {
            onDeleteFile(docToDelete.id);
            setDocToDelete(null);
          }
        }}
      />
    </div>
  );
};
