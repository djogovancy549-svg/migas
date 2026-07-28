import React, { useState, useMemo } from 'react';
import { Pangkalan, RekomendasiPerizinan, AgenCompany } from '../types';
import {
  Building2,
  Search,
  Filter,
  Award,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  MapPin,
  Calendar,
  ShieldCheck,
  Fuel,
  Store,
  Layers,
  Sparkles
} from 'lucide-react';

interface AgenPortalViewProps {
  pangkalanList: Pangkalan[];
  rekomendasiMap: Record<string, RekomendasiPerizinan>;
  agenList: AgenCompany[];
  onOpenRekomendasiModal?: (pangkalan: Pangkalan) => void;
  onOpenDetail?: (pangkalan: Pangkalan) => void;
  onSelectPangkalanForLetter?: (pangkalan: Pangkalan, letterType: 'permohonan' | 'pernyataan') => void;
}

export const AgenPortalView: React.FC<AgenPortalViewProps> = ({
  pangkalanList = [],
  rekomendasiMap = {},
  agenList = [],
  onOpenRekomendasiModal,
  onOpenDetail,
  onSelectPangkalanForLetter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('ALL');
  const [selectedAgenFilter, setSelectedAgenFilter] = useState<string>('ALL');

  // ONLY pangkalan that have approved & issued recommendation ("yang sudah berijin saja")
  const licensedPangkalanList = useMemo(() => {
    return pangkalanList.filter((p) => {
      const rek = rekomendasiMap[p.id];
      return rek && rek.status === 'Disetujui & Diterbitkan';
    });
  }, [pangkalanList, rekomendasiMap]);

  // Unique Kecamatan List among licensed pangkalan
  const kecamatanList = useMemo(() => {
    const list = Array.from(new Set(licensedPangkalanList.map((p) => p.kecamatan || 'Lainnya'))).filter(Boolean);
    return list.sort();
  }, [licensedPangkalanList]);

  // Filtered List based on search, kecamatan, and agen
  const filteredList = useMemo(() => {
    return licensedPangkalanList.filter((p) => {
      const matchKecamatan = selectedKecamatan === 'ALL' || p.kecamatan === selectedKecamatan;
      const matchAgen =
        selectedAgenFilter === 'ALL' ||
        (p.namaAgen && p.namaAgen.toLowerCase().includes(selectedAgenFilter.toLowerCase())) ||
        p.agenId === selectedAgenFilter;

      const q = searchTerm.toLowerCase();
      const matchSearch =
        p.id.toLowerCase().includes(q) ||
        p.nama.toLowerCase().includes(q) ||
        p.alamat.toLowerCase().includes(q) ||
        p.kelurahan.toLowerCase().includes(q) ||
        p.kecamatan.toLowerCase().includes(q) ||
        (rekomendasiMap[p.id]?.nomorRekomendasi || '').toLowerCase().includes(q);

      return matchKecamatan && matchAgen && matchSearch;
    });
  }, [licensedPangkalanList, searchTerm, selectedKecamatan, selectedAgenFilter, rekomendasiMap]);

  // Total stats calculations
  const totalKuotaHarian = useMemo(() => {
    return filteredList.reduce((acc, curr) => acc + (curr.kuotaHarianLiter || 200), 0);
  }, [filteredList]);

  const totalKuotaBulanan = useMemo(() => {
    return filteredList.reduce((acc, curr) => acc + (curr.kuotaBulananLiter || (curr.kuotaHarianLiter || 200) * 25), 0);
  }, [filteredList]);

  // Export CSV for Agen
  const handleExportCSV = () => {
    const headers = [
      'NO',
      'ID PANGKALAN',
      'NAMA PANGKALAN / PEMILIK',
      'ALAMAT',
      'KELURAHAN',
      'KECAMATAN',
      'AGEN PENYALUR',
      'NOMOR REKOMENDASI PEMDA',
      'TANGGAL TERBIT',
      'BERLAKU SAMPAI',
      'KUOTA HARIAN (LITER)',
      'KUOTA BULANAN (LITER)',
    ];

    const rows = filteredList.map((p, idx) => {
      const rek = rekomendasiMap[p.id];
      return [
        idx + 1,
        `"${p.id}"`,
        `"${p.nama}"`,
        `"${p.alamat}"`,
        `"${p.kelurahan}"`,
        `"${p.kecamatan}"`,
        `"${p.namaAgen || 'PT. Putra Ngada Energi'}"`,
        `"${rek?.nomorRekomendasi || '-'}"`,
        `"${rek?.tanggalRekomendasi || '-'}"`,
        `"${rek?.berlakuSampai || '-'}"`,
        p.kuotaHarianLiter || 200,
        p.kuotaBulananLiter || (p.kuotaHarianLiter || 200) * 25,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Pangkalan_Berizin_Agen_SIPERMATA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header Portal Agen */}
      <div className="bg-slate-900 border-2 border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  PORTAL KHUSUS AGEN PENYALUR RESMI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Mode Agen Aktif
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Data Pangkalan Terverifikasi & Berizin Resmi
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring penyaluran kuota minyak tanah bersubsidi untuk pangkalan yang telah diterbitkan Surat Rekomendasi oleh Pemda Nagekeo.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-500/20 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Rekapitulasi Penyaluran Agen (CSV)</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Pangkalan Berizin</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">
              {licensedPangkalanList.length} <span className="text-xs font-normal text-slate-400">Unit</span>
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Total Kuota Harian</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">
              {totalKuotaHarian.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Liter/Hari</span>
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Total Kuota Bulanan</span>
            <span className="text-xl font-black text-blue-400 mt-0.5 block">
              {totalKuotaBulanan.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Liter/Bulan</span>
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Agen Penyalur Resmi</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block truncate">
              {agenList.length} Perusahaan Terdaftar
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID Pangkalan, Nama Pemilik, No Rekomendasi Pemda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-950 text-slate-100 placeholder-slate-500 min-h-[44px]"
            />
          </div>

          {/* Filter Kecamatan */}
          <div className="relative w-full sm:w-48">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-950 text-slate-100 font-semibold appearance-none min-h-[44px]"
            >
              <option value="ALL">Semua Kecamatan ({licensedPangkalanList.length})</option>
              {kecamatanList.map((kec) => {
                const count = licensedPangkalanList.filter((p) => p.kecamatan === kec).length;
                return (
                  <option key={kec} value={kec}>
                    Kec. {kec} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter Agen Perusahaan */}
          {agenList.length > 0 && (
            <div className="relative w-full sm:w-56">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedAgenFilter}
                onChange={(e) => setSelectedAgenFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-950 text-slate-100 font-semibold appearance-none min-h-[44px]"
              >
                <option value="ALL">Semua Agen Penyalur</option>
                {agenList.map((agen) => (
                  <option key={agen.id} value={agen.nama}>
                    {agen.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {licensedPangkalanList.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Belum Ada Pangkalan Berizin Disetujui</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Saat ini belum ada data pangkalan yang diterbitkan Surat Rekomendasi oleh Bagian Perekonomian Setda Kab. Nagekeo. Sisi Agen hanya menampilkan pangkalan yang sudah memiliki perizinan resmi.
              </p>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400 text-xs">
            Tidak ada pangkalan berizin yang sesuai dengan filter atau kata kunci pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-300 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="py-3.5 px-3.5 text-center w-12">No</th>
                  <th className="py-3.5 px-3.5">ID & Nama Pangkalan</th>
                  <th className="py-3.5 px-3.5">Lokasi (Kel/Kec)</th>
                  <th className="py-3.5 px-3.5">Agen Penyalur</th>
                  <th className="py-3.5 px-3.5">Nomor Rekomendasi Pemda</th>
                  <th className="py-3.5 px-3.5 text-center">Kuota Minyak Tanah</th>
                  <th className="py-3.5 px-3.5 text-right">Aksi Surat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {filteredList.map((p, idx) => {
                  const rek = rekomendasiMap[p.id];
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-3.5 text-center font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-black text-amber-400">{p.id}</div>
                        <div className="font-bold text-white mt-0.5">{p.nama}</div>
                        <div className="text-[11px] text-slate-400">{p.alamat}</div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-slate-200">Kel. {p.kelurahan}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          Kec. {p.kecamatan}
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-[11px] block w-max">
                          {p.namaAgen || 'PT. PUTRA NGADA ENERGI'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-bold text-emerald-400">{rek?.nomorRekomendasi || '-'}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          Terbit: {rek?.tanggalRekomendasi || '-'} (s/d {rek?.berlakuSampai || '-'})
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <div className="inline-flex flex-col items-center bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          <span className="font-black text-amber-300 text-xs">
                            {p.kuotaHarianLiter || 200} Liter / Hari
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({p.kuotaBulananLiter || (p.kuotaHarianLiter || 200) * 25} Liter/Bln)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenRekomendasiModal && (
                            <button
                              onClick={() => onOpenRekomendasiModal(p)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-[11px] transition cursor-pointer shadow-sm"
                              title="Lihat Surat Rekomendasi Pemda"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Surat Rekomendasi</span>
                            </button>
                          )}
                          {onOpenDetail && (
                            <button
                              onClick={() => onOpenDetail(p)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Detail Pangkalan"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {onSelectPangkalanForLetter && (
                            <button
                              onClick={() => onSelectPangkalanForLetter(p, 'permohonan')}
                              className="p-1.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition cursor-pointer"
                              title="Cetak Surat Permohonan"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
