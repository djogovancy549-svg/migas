import React, { useState, useMemo } from 'react';
import { Pangkalan, RekomendasiPerizinan } from '../types';
import { Search, Filter, Download, Plus, FileText, Award, Eye, Edit, Trash2, MapPin, Building, ChevronLeft, ChevronRight, Upload, Paperclip, Store, FolderCheck, FolderX, FolderOpen, CheckCircle2, BellRing, FileSpreadsheet } from 'lucide-react';

interface PangkalanTableViewProps {
  pangkalanList: Pangkalan[];
  uploadedDocsCountMap?: Record<string, number>;
  rekomendasiMap?: Record<string, RekomendasiPerizinan>;
  isAdminMode?: boolean;
  pendingUnsyncedNotice?: string | null;
  onSelectPangkalanForLetter: (pangkalan: Pangkalan, letterType: 'permohonan' | 'pernyataan') => void;
  onEditPangkalan: (pangkalan: Pangkalan) => void;
  onDeletePangkalan: (id: string) => void;
  onAddNewPangkalan: () => void;
  onOpenDetail: (pangkalan: Pangkalan) => void;
  onOpenUploadModal: (pangkalan: Pangkalan) => void;
  onOpenRekomendasiModal: (pangkalan: Pangkalan) => void;
}

export const PangkalanTableView: React.FC<PangkalanTableViewProps> = ({
  pangkalanList,
  uploadedDocsCountMap = {},
  rekomendasiMap = {},
  isAdminMode = false,
  pendingUnsyncedNotice,
  onSelectPangkalanForLetter,
  onEditPangkalan,
  onDeletePangkalan,
  onAddNewPangkalan,
  onOpenDetail,
  onOpenUploadModal,
  onOpenRekomendasiModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Unique Kecamatan List
  const kecamatanList = useMemo(() => {
    const list = Array.from(new Set(pangkalanList.map((p) => p.kecamatan || 'Lainnya'))).filter(Boolean);
    return list.sort();
  }, [pangkalanList]);

  // Filtered Data
  const filteredList = useMemo(() => {
    return pangkalanList.filter((p) => {
      const matchKecamatan = selectedKecamatan === 'ALL' || p.kecamatan === selectedKecamatan;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        p.id.toLowerCase().includes(q) ||
        p.nama.toLowerCase().includes(q) ||
        p.alamat.toLowerCase().includes(q) ||
        p.kelurahan.toLowerCase().includes(q) ||
        p.kecamatan.toLowerCase().includes(q);
      return matchKecamatan && matchSearch;
    });
  }, [pangkalanList, searchTerm, selectedKecamatan]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['NO', 'ID PANGKALAN', 'NAMA PEMILIK', 'ALAMAT', 'KELURAHAN', 'KECAMATAN', 'KABUPATEN', 'PROPINSI', 'KUOTA HARIAN (LITER)'];
    const rows = filteredList.map((p, idx) => [
      idx + 1,
      `"${p.id}"`,
      `"${p.nama}"`,
      `"${p.alamat}"`,
      `"${p.kelurahan}"`,
      `"${p.kecamatan}"`,
      `"${p.kabupaten}"`,
      `"${p.propinsi}"`,
      p.kuotaHarianLiter || 200,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Pangkalan_SIPERMATA_Nagekeo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Admin Notice Banner for Unsynced Data */}
      {isAdminMode && pendingUnsyncedNotice && (
        <div className="bg-amber-500/15 border-2 border-amber-500 text-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
              <BellRing className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-black text-amber-300 text-sm">⚠️ PERHATIAN ADMIN PEMDA:</p>
              <p className="text-amber-100 mt-0.5">{pendingUnsyncedNotice}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const syncElem = document.getElementById('google-sync-bar');
              if (syncElem) syncElem.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5 touch-manipulation"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-950" />
            <span>Simpan ke Google Sheet</span>
          </button>
        </div>
      )}

      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID, Nama Pemilik, Alamat, Kelurahan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border-2 border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-950 text-slate-100 placeholder-slate-500 min-h-[44px]"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-56">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedKecamatan}
              onChange={(e) => {
                setSelectedKecamatan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm border-2 border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-950 text-slate-100 font-semibold appearance-none min-h-[44px]"
            >
              <option value="ALL">Semua Kecamatan ({pangkalanList.length})</option>
              {kecamatanList.map((kec) => {
                const count = pangkalanList.filter((p) => p.kecamatan === kec).length;
                return (
                  <option key={kec} value={kec}>
                    Kec. {kec} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={filteredList.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px]"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onAddNewPangkalan}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/10 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pangkalan Baru</span>
          </button>
        </div>
      </div>

      {/* Results Count & Meta */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <p>
          Menampilkan <strong className="text-white">{filteredList.length}</strong> dari{' '}
          <strong className="text-white">{pangkalanList.length}</strong> Pangkalan
          {selectedKecamatan !== 'ALL' && <span> di Kecamatan <strong className="text-amber-400">{selectedKecamatan}</strong></span>}
        </p>
        <p className="hidden sm:block text-slate-500 font-mono">
          SIPERMATA Pemda Kab. Nagekeo
        </p>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {pangkalanList.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Store className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Belum Ada Data Pangkalan</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Data pangkalan telah dikosongkan. Klik tombol di bawah untuk menambahkan data pangkalan baru.
              </p>
            </div>
            <button
              onClick={onAddNewPangkalan}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-lg transition cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pangkalan Pertama</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                    <th className="py-3.5 px-3.5 text-center w-12">No</th>
                    <th className="py-3.5 px-3.5">ID Pangkalan</th>
                    <th className="py-3.5 px-3.5">Nama Pangkalan / Pemilik</th>
                    <th className="py-3.5 px-3.5">Alamat & Kelurahan</th>
                    <th className="py-3.5 px-3.5">Kecamatan</th>
                    <th className="py-3.5 px-3.5 text-center">Aksi Perizinan & Dokumen</th>
                    <th className="py-3.5 px-3.5 text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        Tidak ada data pangkalan yang sesuai dengan kata kunci pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((p, idx) => {
                      const globalNo = (currentPage - 1) * itemsPerPage + idx + 1;
                      const rek = rekomendasiMap[p.id];
                      const isSigned = rek?.status === 'Disetujui & Diterbitkan';

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/50 transition group">
                          <td className="py-3.5 px-3.5 text-center font-semibold text-slate-500">
                            {globalNo}
                          </td>
                          <td className="py-3.5 px-3.5 font-mono font-bold text-amber-400 whitespace-nowrap">
                            {p.id}
                          </td>
                          <td className="py-3.5 px-3.5 font-bold text-white">
                            <button
                              onClick={() => onOpenDetail(p)}
                              className="hover:text-amber-400 text-left cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{p.nama}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-3.5 text-slate-300">
                            <div className="font-semibold text-slate-200">{p.alamat}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              Kel. {p.kelurahan}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="inline-flex items-center gap-1 bg-slate-800/80 text-slate-300 border border-slate-700/60 font-semibold px-2 py-0.5 rounded text-[11px]">
                              <Building className="w-3 h-3 text-amber-400" />
                              {p.kecamatan}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* Rekomendasi Action Button */}
                              <button
                                onClick={() => onOpenRekomendasiModal(p)}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-sm min-h-[36px] ${
                                  isSigned
                                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold'
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                                }`}
                                title="Proses / Lihat Rekomendasi Perizinan Pimpinan"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{isSigned ? 'Rekomendasi (Terbit ✓)' : 'Rekomendasi'}</span>
                              </button>

                              {/* Upload Folder Button */}
                              <button
                                onClick={() => onOpenUploadModal(p)}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer border min-h-[36px] ${
                                  uploadedDocsCountMap[p.id]
                                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/40'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                                }`}
                                title="Kelola Berkas Persyaratan"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Berkas ({uploadedDocsCountMap[p.id] || 0})</span>
                              </button>

                              <button
                                onClick={() => onSelectPangkalanForLetter(p, 'permohonan')}
                                className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold px-2 py-1.5 rounded-lg transition cursor-pointer min-h-[36px]"
                                title="Buat Surat Permohonan"
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-400" />
                                <span>Permohonan</span>
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onOpenDetail(p)}
                                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEditPangkalan(p)}
                                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Edit Data"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus pangkalan ${p.nama} (${p.id})?`)) {
                                    onDeletePangkalan(p.id);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <p className="text-slate-400">
                  Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
                  <strong className="text-white">{totalPages}</strong>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-2 rounded-lg border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-300 transition cursor-pointer min-h-[36px]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="p-2 rounded-lg border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-300 transition cursor-pointer min-h-[36px]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
