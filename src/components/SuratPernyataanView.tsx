import React, { useState, useEffect } from 'react';
import { Pangkalan, SuratPernyataanData } from '../types';
import { Printer, Plus, Award, RefreshCw, UserPlus, CheckCircle2, Building } from 'lucide-react';
import { AGEN_INFO } from '../data/pangkalanData';

interface SuratPernyataanViewProps {
  pangkalanList: Pangkalan[];
  selectedPangkalan?: Pangkalan | null;
  onSavePangkalan?: (pangkalan: Pangkalan) => void;
}

export const SuratPernyataanView: React.FC<SuratPernyataanViewProps> = ({
  pangkalanList,
  selectedPangkalan,
  onSavePangkalan,
}) => {
  const [mode, setMode] = useState<'existing' | 'new'>(
    selectedPangkalan || pangkalanList.length > 0 ? 'existing' : 'new'
  );

  const [activePangkalanId, setActivePangkalanId] = useState<string>(
    selectedPangkalan?.id || pangkalanList[0]?.id || ''
  );

  const currentPangkalan = pangkalanList.find((p) => p.id === activePangkalanId);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const [formData, setFormData] = useState<SuratPernyataanData>({
    nama: currentPangkalan?.nama || '',
    nomorIdentitas: currentPangkalan?.nik || '',
    tempatTglLahir: currentPangkalan?.tempatLahir ? `${currentPangkalan.tempatLahir}, ${currentPangkalan.tanggalLahir}` : '',
    alamat: currentPangkalan ? `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}` : '',
    nomorNib: currentPangkalan?.nib || '',
    noKontak: currentPangkalan?.nomorHp || '',
    namaPangkalan: currentPangkalan ? `Pangkalan ${currentPangkalan.nama} (${currentPangkalan.id})` : '',
    namaUsaha: currentPangkalan?.namaUsaha || '',
    alamatUsaha: currentPangkalan ? `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}, Kab. Nagekeo` : '',
    hargaHetPerLiter: 5000,
    namaAgen: AGEN_INFO.nama,
    tanggalSurat: todayStr,
    kotaSurat: 'Mbay',
    includeMeteraiPlaceholder: true,
  });

  const [kecamatan, setKecamatan] = useState<string>(currentPangkalan?.kecamatan || 'Aesesa');
  const [kelurahan, setKelurahan] = useState<string>(currentPangkalan?.kelurahan || 'Mbay');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPangkalan) {
      setMode('existing');
      setActivePangkalanId(selectedPangkalan.id);
    }
  }, [selectedPangkalan]);

  useEffect(() => {
    if (mode === 'existing' && currentPangkalan) {
      setFormData((prev) => ({
        ...prev,
        nama: currentPangkalan.nama,
        nomorIdentitas: currentPangkalan.nik || prev.nomorIdentitas || '',
        tempatTglLahir: currentPangkalan.tempatLahir ? `${currentPangkalan.tempatLahir}, ${currentPangkalan.tanggalLahir}` : prev.tempatTglLahir,
        alamat: `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}`,
        nomorNib: currentPangkalan.nib || prev.nomorNib || '',
        namaPangkalan: `Pangkalan ${currentPangkalan.nama} (${currentPangkalan.id})`,
        namaUsaha: currentPangkalan.namaUsaha || `UD. ${currentPangkalan.nama}`,
        alamatUsaha: `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}, Kab. Nagekeo`,
        noKontak: currentPangkalan.nomorHp || prev.noKontak || '',
      }));
      setKecamatan(currentPangkalan.kecamatan || 'Aesesa');
      setKelurahan(currentPangkalan.kelurahan || 'Mbay');
    }
  }, [activePangkalanId, currentPangkalan, mode]);

  const handleStartNewLetter = () => {
    setMode('new');
    setActivePangkalanId('');
    setFormData({
      nama: '',
      nomorIdentitas: '',
      tempatTglLahir: '',
      alamat: '',
      nomorNib: '',
      noKontak: '',
      namaPangkalan: '',
      namaUsaha: '',
      alamatUsaha: '',
      hargaHetPerLiter: 5000,
      namaAgen: AGEN_INFO.nama,
      tanggalSurat: todayStr,
      kotaSurat: 'Mbay',
      includeMeteraiPlaceholder: true,
    });
    setKecamatan('Aesesa');
    setKelurahan('Mbay');
    setSavedSuccessMsg(null);
  };

  const handleSaveToPangkalanList = () => {
    if (!formData.nama.trim()) {
      alert('Mohon isi nama pemilik/pangkalan terlebih dahulu.');
      return;
    }

    const newId = `PGK-${Date.now().toString().slice(-4)}`;
    const newPangkalan: Pangkalan = {
      id: newId,
      no: pangkalanList.length + 1,
      nama: formData.nama,
      nik: formData.nomorIdentitas,
      nib: formData.nomorNib,
      namaUsaha: formData.namaUsaha,
      alamat: formData.alamat || 'Mbay',
      kelurahan: kelurahan || 'Mbay',
      kecamatan: kecamatan || 'Aesesa',
      kabupaten: 'NAGEKEO',
      propinsi: 'NTT',
      nomorHp: formData.noKontak,
      kuotaHarianLiter: 200,
      statusPerizinan: 'Aktif',
    };

    if (onSavePangkalan) {
      onSavePangkalan(newPangkalan);
      setActivePangkalanId(newId);
      setMode('existing');
      setSavedSuccessMsg(`Surat Pernyataan & Data Pangkalan Baru berhasil disimpan dengan ID ${newId}!`);
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar Header */}
      <div className="bg-slate-900 border-2 border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl space-y-5 print:hidden text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Generator Surat Pernyataan Pangkalan</h3>
              <p className="text-xs text-emerald-300 font-medium">
                Buat Surat Pernyataan Kesanggupan baru atau pilih dari daftar pangkalan yang ada
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-lg transition cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Surat Pernyataan</span>
          </button>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('existing')}
            disabled={pangkalanList.length === 0}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition min-h-[44px] ${
              mode === 'existing'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 disabled:opacity-40'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Pilih Pangkalan Terdaftar ({pangkalanList.length})</span>
          </button>

          <button
            onClick={handleStartNewLetter}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition min-h-[44px] ${
              mode === 'new'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Pernyataan Baru (Kosong)</span>
          </button>
        </div>

        {/* Saved Banner */}
        {savedSuccessMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Form Inputs High Contrast */}
        <div className="space-y-4">
          {mode === 'existing' && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-emerald-300 mb-1.5">Pilih Pangkalan:</label>
              <select
                value={activePangkalanId}
                onChange={(e) => setActivePangkalanId(e.target.value)}
                className="w-full p-3 bg-slate-950 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
              >
                {pangkalanList.length === 0 ? (
                  <option value="">Belum ada data pangkalan (Gunakan mode Buat Surat Baru)</option>
                ) : (
                  pangkalanList.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.id}] {p.nama} ({p.kecamatan})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>{mode === 'new' ? 'Isi Form Surat Pernyataan Baru' : 'Edit Detail Surat Pernyataan'}</span>
              </h4>

              {mode === 'new' && (
                <button
                  onClick={handleStartNewLetter}
                  className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Bersihkan Form</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Pemilik Pangkalan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Antonius Basa"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">NIK (Nomor KTP)</label>
                <input
                  type="text"
                  placeholder="531601xxxxxxxxxx"
                  value={formData.nomorIdentitas}
                  onChange={(e) => setFormData({ ...formData, nomorIdentitas: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tempat / Tgl Lahir</label>
                <input
                  type="text"
                  placeholder="Nagekeo, 10 Oktober 1982"
                  value={formData.tempatTglLahir}
                  onChange={(e) => setFormData({ ...formData, tempatTglLahir: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Kontak / HP</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={formData.noKontak}
                  onChange={(e) => setFormData({ ...formData, noKontak: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nomor NIB Usaha</label>
                <input
                  type="text"
                  placeholder="Nomor NIB"
                  value={formData.nomorNib}
                  onChange={(e) => setFormData({ ...formData, nomorNib: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Usaha / Pangkalan</label>
                <input
                  type="text"
                  placeholder="Contoh: UD. Minyak Sejahtera"
                  value={formData.namaUsaha}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      namaUsaha: val,
                      namaPangkalan: val ? `Pangkalan ${val}` : '',
                    });
                  }}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Alamat Tempat Usaha Pangkalan</label>
                <input
                  type="text"
                  placeholder="Jln. Raya Mbay, Kel. Mbay, Kec. Aesesa, Kab. Nagekeo"
                  value={formData.alamatUsaha}
                  onChange={(e) => setFormData({ ...formData, alamatUsaha: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Harga HET per Liter (Rp)</label>
                <input
                  type="number"
                  value={formData.hargaHetPerLiter}
                  onChange={(e) => setFormData({ ...formData, hargaHetPerLiter: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-emerald-400 font-bold text-xs sm:text-sm focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Optional Save to Pangkalan List Button */}
            {mode === 'new' && onSavePangkalan && (
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveToPangkalanList}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer min-h-[44px]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Simpan Sebagai Pangkalan Baru di Sistem</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT PRINT PREVIEW AREA */}
      <div className="bg-white p-6 sm:p-12 md:p-16 rounded-2xl border border-slate-300 shadow-2xl max-w-4xl mx-auto text-black font-sans leading-snug text-xs sm:text-sm print:p-0 print:border-none print:shadow-none print:w-full overflow-x-auto">
        {/* Document Header Title */}
        <div className="text-center font-bold tracking-wide uppercase border-b-2 border-black pb-2 mb-6">
          <h2 className="text-base sm:text-lg">SURAT PERNYATAAN</h2>
          <h3 className="text-sm sm:text-base">PANGKALAN MINYAK TANAH</h3>
        </div>

        {/* Identity Intro */}
        <p className="mb-3 font-medium">Yang bertanda tangan di bawah ini :</p>

        {/* Identity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-6 text-xs sm:text-sm pl-2">
          <div className="flex">
            <span className="w-36 font-semibold shrink-0">Nama</span>
            <span className="font-bold">: {formData.nama || '.........................................................'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold shrink-0">Nomor Identitas</span>
            <span>: {formData.nomorIdentitas || '.........................................................'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold shrink-0">Tempat Tgl Lahir</span>
            <span>: {formData.tempatTglLahir || '.........................................................'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold shrink-0">No. Kontak</span>
            <span>: {formData.noKontak || '.........................................................'}</span>
          </div>
          <div className="flex sm:col-span-2">
            <span className="w-36 font-semibold shrink-0">Alamat</span>
            <span>: {formData.alamat || '........................................................................................'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold shrink-0">Nomor NIB</span>
            <span>: {formData.nomorNib || '.........................................................'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold shrink-0">Nama Usaha</span>
            <span>: {formData.namaUsaha || '.........................................................'}</span>
          </div>
          <div className="flex sm:col-span-2">
            <span className="w-36 font-semibold shrink-0">Nama Pangkalan</span>
            <span className="font-bold">: {formData.namaPangkalan || '........................................................................................'}</span>
          </div>
          <div className="flex sm:col-span-2">
            <span className="w-36 font-semibold shrink-0">Alamat Usaha</span>
            <span>: {formData.alamatUsaha || '........................................................................................'}</span>
          </div>
        </div>

        {/* Declaration Lead */}
        <p className="mb-4 text-justify font-medium leading-relaxed">
          Dengan ini menyatakan dengan sesungguhnya bahwa saya sanggup untuk menjual minyak tanah dengan ketentuan sebagai berikut :
        </p>

        {/* The 9 Standard Points */}
        <ol className="list-decimal list-outside ml-5 space-y-2 text-justify mb-8 text-xs sm:text-sm leading-relaxed">
          <li>
            Menjual kembali minyak tanah murni, tidak campuran kepada masyarakat setempat dalam kondisi baik.
          </li>
          <li>
            Sanggup menjual minyak tanah yang saya terima dari agen <strong className="uppercase">{formData.namaAgen}</strong> dengan harga <strong className="underline">Rp. {formData.hargaHetPerLiter.toLocaleString('id-ID')} / liter</strong>.
          </li>
          <li>
            Sanggup menjual habis minyak tanah tersebut kepada masyarakat langsung secara eceran yang digunakan untuk kebutuhan rumah tangga, usaha kecil, dan pelayanan umum. Tidak untuk dijual kembali kepada para pedagang atau untuk penimbunan, yang akan menyebabkan perubahan harga menjadi naik / tidak sesuai dengan (HET) yang di tentukan (poin 2 di atas).
          </li>
          <li>
            Melakukan penjualan Minyak Tanah secara aktif guna menjamin ketersediaan kebutuhan masyarakat setempat serta menjaga ketertiban.
          </li>
          <li>
            Sanggup menyiapkan wadah dan tempat untuk penampungan, penyimpanan Minyak Tanah pada wadah dan tempat yang layak dan aman dari resiko kebakaran dan polusi lingkungan.
          </li>
          <li>
            Jika terjadi kebakaran atau polusi lingkungan, segala resiko menjadi tanggungjawab pemilik pangkalan, dalam hal ini saya yang membuat pernyataan ini.
          </li>
          <li>
            Berperan serta secara aktif melakukan pengawasan terhadap penjualan Bahan Bakar Minyak Tanah Bersubsidi yang berada di lingkungan sekitar saya. Segera melaporkan jika terjadi kecurangan atau ketidaksesuaian yang terjadi pada lingkungan sekitar saya.
          </li>
          <li>
            Bersedia melaporkan ke Bagian Perekonomian dan SDA Setda Kab. Nagekeo, jika saya tidak aktif menjual minyak tanah atau berganti kepemilikan / pangkalan karena alasan tertentu.
          </li>
          <li>
            Saya bersedia langsung dicabut Rekomendasi Penjualan Bahan Bakar Minyak Tanah Bersubsidi secara sepihak jika saya melakukan penjualan di atas harga yang ditetapkan oleh pemerintah (poin 2 di atas) dan atau menjual kembali minyak tanah kepada pihak lain yang bertujuan untuk di jualkan kembali minyak tanah tersebut kepada masyarakat tanpa sepengetahuan Bagian Perekonomian Setda Kab. Nagekeo (poin 3 di atas).
          </li>
        </ol>

        {/* Closing text */}
        <p className="mb-8 text-justify leading-relaxed">
          Demikian surat pernyataan ini saya buat dengan sebenarnya dan penuh tanggung jawab. Surat pernyataan ini berlaku sebagai bukti kesanggupan saya untuk menjual minyak tanah sesuai dengan ketentuan di atas.
        </p>

        {/* Signatures */}
        <div className="flex justify-end text-center">
          <div className="w-64 space-y-2">
            <p className="text-xs sm:text-sm">{formData.kotaSurat}, ......................... {new Date().getFullYear()}</p>
            <p className="font-semibold text-xs sm:text-sm">Hormat saya,</p>

            <div className="h-24 flex items-center justify-center my-2">
              {formData.includeMeteraiPlaceholder && (
                <div className="w-28 h-16 border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-[10px] text-slate-500 font-mono">
                  <span>METERAI</span>
                  <span>TEMPEL 10.000</span>
                </div>
              )}
            </div>

            <p className="font-bold underline uppercase text-xs sm:text-sm">
              ( {formData.nama || '........................'} )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
