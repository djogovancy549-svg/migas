import React, { useState, useMemo } from 'react';
import { Pangkalan, PersyaratanStatus, AgenCompany, HetKecamatan, RekomendasiPerizinan } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building2,
  Droplets,
  Filter,
  Activity,
  FileCheck,
  DollarSign
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  pangkalanList: Pangkalan[];
  checklistData: Record<string, PersyaratanStatus>;
  agenList: AgenCompany[];
  hetList: HetKecamatan[];
  rekomendasiMap: Record<string, RekomendasiPerizinan>;
}

const STATUS_COLORS = {
  LENGKAP: '#10b981', // emerald-500
  KURANG: '#f59e0b',  // amber-500
  BELUM: '#ef4444',   // red-500
};

const getComplianceStatus = (status: PersyaratanStatus | undefined): 'LENGKAP' | 'KURANG' | 'BELUM' => {
  if (!status) return 'BELUM';
  const fields = [
    status.suratPermohonan,
    status.ktp,
    status.npwp,
    status.nib,
    status.sku,
    status.suratPernyataan,
  ];
  const count = fields.filter(Boolean).length;
  if (count === fields.length) return 'LENGKAP';
  if (count > 0) return 'KURANG';
  return 'BELUM';
};

const getPangkalanKuotaKL = (p: Pangkalan): number => {
  if (p.kuotaBulananLiter) {
    return Math.round(p.kuotaBulananLiter / 1000 * 10) / 10;
  }
  if (p.kuotaHarianLiter) {
    return Math.round((p.kuotaHarianLiter * 26) / 1000 * 10) / 10;
  }
  return 5.2; // default 5.2 KL / bulan
};

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  pangkalanList,
  checklistData,
  agenList,
  hetList,
  rekomendasiMap,
}) => {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('SEMUA');
  const [selectedAgen, setSelectedAgen] = useState<string>('SEMUA');

  // Filtered Pangkalan for drill-down
  const filteredPangkalan = useMemo(() => {
    return pangkalanList.filter((item) => {
      const matchKecamatan = selectedKecamatan === 'SEMUA' || item.kecamatan === selectedKecamatan;
      const matchAgen = selectedAgen === 'SEMUA' || (item.namaAgen || '') === selectedAgen;
      return matchKecamatan && matchAgen;
    });
  }, [pangkalanList, selectedKecamatan, selectedAgen]);

  // All distinct kecamatan
  const kecamatanList = useMemo(() => {
    const set = new Set(pangkalanList.map((p) => p.kecamatan));
    return Array.from(set).filter(Boolean).sort();
  }, [pangkalanList]);

  // Executive KPI summary
  const summary = useMemo(() => {
    const totalPangkalan = filteredPangkalan.length;
    let totalKuota = 0;
    let lengkapCount = 0;
    let kurangCount = 0;
    let belumCount = 0;
    let terbitRekomendasi = 0;

    filteredPangkalan.forEach((p) => {
      totalKuota += getPangkalanKuotaKL(p);
      const compliance = getComplianceStatus(checklistData[p.id]);
      if (compliance === 'LENGKAP') lengkapCount++;
      else if (compliance === 'KURANG') kurangCount++;
      else belumCount++;

      if (rekomendasiMap[p.id]?.nomorRekomendasi) {
        terbitRekomendasi++;
      }
    });

    const complianceRate = totalPangkalan > 0 ? Math.round((lengkapCount / totalPangkalan) * 100) : 0;
    const avgKuota = totalPangkalan > 0 ? Math.round((totalKuota / totalPangkalan) * 10) / 10 : 0;

    return {
      totalPangkalan,
      totalKuota: Math.round(totalKuota * 10) / 10,
      avgKuota,
      lengkapCount,
      kurangCount,
      belumCount,
      terbitRekomendasi,
      complianceRate,
    };
  }, [filteredPangkalan, checklistData, rekomendasiMap]);

  // Kuota & Pangkalan by Kecamatan chart data
  const kecamatanChartData = useMemo(() => {
    const map: Record<string, { kecamatan: string; jumlahPangkalan: number; totalKuota: number; lengkap: number }> = {};
    pangkalanList.forEach((p) => {
      const kec = p.kecamatan || 'Lainnya';
      if (!map[kec]) {
        map[kec] = { kecamatan: kec, jumlahPangkalan: 0, totalKuota: 0, lengkap: 0 };
      }
      map[kec].jumlahPangkalan += 1;
      map[kec].totalKuota += getPangkalanKuotaKL(p);
      if (getComplianceStatus(checklistData[p.id]) === 'LENGKAP') {
        map[kec].lengkap += 1;
      }
    });
    return Object.values(map)
      .map((item) => ({
        ...item,
        totalKuota: Math.round(item.totalKuota * 10) / 10,
      }))
      .sort((a, b) => b.totalKuota - a.totalKuota);
  }, [pangkalanList, checklistData]);

  // Agen share data
  const agenChartData = useMemo(() => {
    const map: Record<string, { agen: string; jumlahPangkalan: number; totalKuota: number }> = {};
    filteredPangkalan.forEach((p) => {
      const ag = p.namaAgen || 'Non-Agen';
      if (!map[ag]) {
        map[ag] = { agen: ag, jumlahPangkalan: 0, totalKuota: 0 };
      }
      map[ag].jumlahPangkalan += 1;
      map[ag].totalKuota += getPangkalanKuotaKL(p);
    });
    return Object.values(map)
      .map((item) => ({
        ...item,
        totalKuota: Math.round(item.totalKuota * 10) / 10,
      }))
      .sort((a, b) => b.jumlahPangkalan - a.jumlahPangkalan);
  }, [filteredPangkalan]);

  // Pie chart data for compliance
  const compliancePieData = useMemo(() => {
    return [
      { name: 'Berkas Lengkap', value: summary.lengkapCount, color: STATUS_COLORS.LENGKAP },
      { name: 'Kurang Lengkap', value: summary.kurangCount, color: STATUS_COLORS.KURANG },
      { name: 'Belum Ada Berkas', value: summary.belumCount, color: STATUS_COLORS.BELUM },
    ].filter((d) => d.value > 0);
  }, [summary]);

  // HET Comparison Data
  const hetChartData = useMemo(() => {
    return hetList.map((item) => ({
      kecamatan: item.kecamatan,
      het: item.hargaHetPerLiter,
    }));
  }, [hetList]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Top Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Activity className="w-4 h-4" />
              <span>Executive Decision Support System (DSS)</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Analytics & Profil Pangkalan Minyak Tanah
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Analisis statistik alokasi kuota penyaluran, tingkat kepatuhan administrasi, dan peta sebaran pangkalan se-Kabupaten Nagekeo.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/80 rounded-xl px-3 py-1.5 border border-slate-200">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="SEMUA">Semua Kecamatan ({kecamatanList.length})</option>
                {kecamatanList.map((kec) => (
                  <option key={kec} value={kec}>
                    Kec. {kec}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-100/80 rounded-xl px-3 py-1.5 border border-slate-200">
              <Building2 className="w-4 h-4 text-slate-500" />
              <select
                value={selectedAgen}
                onChange={(e) => setSelectedAgen(e.target.value)}
                className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="SEMUA">Semua Agen Penyalur ({agenList.length})</option>
                {agenList.map((ag) => (
                  <option key={ag.id} value={ag.nama}>
                    {ag.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Pangkalan
              </p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {summary.totalPangkalan} <span className="text-sm font-normal text-slate-500">unit</span>
              </h3>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                Tersebar di {kecamatanList.length} Kecamatan
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Kuota Alokasi
              </p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {summary.totalKuota.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">KL</span>
              </h3>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                Rata-rata {summary.avgKuota} KL / pangkalan
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kepatuhan Berkas
              </p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">
                {summary.complianceRate}%
              </h3>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {summary.lengkapCount} dari {summary.totalPangkalan} berkas lengkap
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Surat Rekomendasi
              </p>
              <h3 className="text-3xl font-bold text-violet-600 mt-1">
                {summary.terbitRekomendasi} <span className="text-sm font-normal text-slate-500">terbit</span>
              </h3>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-violet-600" />
                Diverifikasi Bagian Perekonomian
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
        </div>
      </div>

      {/* Main Charts Row 1: Sebaran Kuota per Kecamatan & Pie Chart Kepatuhan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kuota per Kecamatan (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-600" />
                Sebaran Kuota Minyak Tanah & Pangkalan per Kecamatan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Perbandingan total kuota (KL) dan jumlah titik pangkalan aktif
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kecamatanChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="kecamatan" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} unit=" KL" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} unit=" unit" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string) => [
                    name === 'totalKuota' ? `${value.toLocaleString('id-ID')} KL` : `${value} Unit`,
                    name === 'totalKuota' ? 'Total Kuota (KL)' : 'Jumlah Pangkalan',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="totalKuota" name="Total Kuota (KL)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="jumlahPangkalan" name="Jumlah Pangkalan" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Persyaratan Pie Chart (1 Column) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-600" />
              Komposisi Kepatuhan Berkas
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Status kelengkapan administrasi perizinan pangkalan
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center my-4">
            {compliancePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compliancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {compliancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} Pangkalan`, 'Jumlah']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400">Belum ada data pangkalan</div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Lengkap</span>
              </div>
              <span className="font-bold text-slate-800">{summary.lengkapCount} unit</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600">Kurang Lengkap</span>
              </div>
              <span className="font-bold text-slate-800">{summary.kurangCount} unit</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Belum Ada</span>
              </div>
              <span className="font-bold text-slate-800">{summary.belumCount} unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Distribusi Pangkalan per Agen & HET per Kecamatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Agen */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Distribusi Pangkalan per Agen Penyalur
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Peran dan jangkauan masing-masing agen penyalur di Kabupaten Nagekeo
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={agenChartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="agen" tick={{ fontSize: 11, fill: '#334155' }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number, name: string) => [
                    name === 'jumlahPangkalan' ? `${value} Unit` : `${value.toLocaleString('id-ID')} KL`,
                    name === 'jumlahPangkalan' ? 'Jumlah Pangkalan' : 'Total Kuota (KL)',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="jumlahPangkalan" name="Jumlah Pangkalan" fill="#4f46e5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HET per Kecamatan */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                Harga Eceran Tertinggi (HET) per Kecamatan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sesuai Keputusan Bupati Nagekeo Tahun 2026 (Rp / Liter)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hetChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="kecamatan" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')} / L`, 'HET Minyak Tanah']}
                />
                <Bar dataKey="het" name="HET (Rp/L)" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table by Kecamatan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Rangkuman Performa & Kepatuhan per Kecamatan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabel rekapitulasi untuk pengawasan oleh Bagian Perekonomian & SDA
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-4">Kecamatan</th>
                <th className="py-3 px-4 text-center">Jml Pangkalan</th>
                <th className="py-3 px-4 text-right">Total Kuota (KL)</th>
                <th className="py-3 px-4 text-center">Berkas Lengkap</th>
                <th className="py-3 px-4 text-center">Tingkat Kepatuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {kecamatanChartData.map((row) => {
                const rate = row.jumlahPangkalan > 0
                  ? Math.round((row.lengkap / row.jumlahPangkalan) * 100)
                  : 0;
                return (
                  <tr key={row.kecamatan} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      Kec. {row.kecamatan}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-semibold">
                      {row.jumlahPangkalan} unit
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sky-700">
                      {row.totalKuota.toLocaleString('id-ID')} KL
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {row.lengkap} unit
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

