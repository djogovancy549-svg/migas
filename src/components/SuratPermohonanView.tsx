import React, { useState, useEffect } from 'react';
import { Pangkalan, SuratPermohonanData } from '../types';
import { Printer, Plus, RefreshCw, FileText, Save, CheckCircle2, UserPlus, Building } from 'lucide-react';

interface SuratPermohonanViewProps {
  pangkalanList: Pangkalan[];
  selectedPangkalan?: Pangkalan | null;
  onSavePangkalan?: (pangkalan: Pangkalan) => void;
}

export const SuratPermohonanView: React.FC<SuratPermohonanViewProps> = ({
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

  const [formData, setFormData] = useState<SuratPermohonanData>({
    nomorSurat: '',
    lampiran: '1 (satu) berkas',
    perihal: 'Permohonan Perpanjangan Rekomendasi',
    tanggal: `Mbay, ${todayStr}`,
    tujuan: 'Kepala Bagian Perekonomian dan SDA Setda Kabupaten Nagekeo',
    nama: currentPangkalan?.nama || '',
    tempatTanggalLahir: currentPangkalan?.tempatLahir ? `${currentPangkalan.tempatLahir}, ${currentPangkalan.tanggalLahir}` : '',
    pekerjaan: currentPangkalan?.pekerjaan || 'Wiraswasta / Pengelola Pangkalan',
    alamatUsaha: currentPangkalan ? `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}, Kab. Nagekeo` : '',
    nomorHp: currentPangkalan?.nomorHp || '',
    lokasiPangkalan: currentPangkalan ? `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}` : '',
    lampiranRekomendasiSebelumnya: true,
    lampiranKtp: true,
    lampiranSku: true,
    lampiranSuratPernyataan: true,
    lampiranNpwp: true,
  });

  const [kecamatan, setKecamatan] = useState<string>(currentPangkalan?.kecamatan || 'Aesesa');
  const [kelurahan, setKelurahan] = useState<string>(currentPangkalan?.kelurahan || 'Mbay');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Sync if prop selectedPangkalan changes
  useEffect(() => {
    if (selectedPangkalan) {
      setMode('existing');
      setActivePangkalanId(selectedPangkalan.id);
    }
  }, [selectedPangkalan]);

  // Sync form data whenever active pangkalan changes in 'existing' mode
  useEffect(() => {
    if (mode === 'existing' && currentPangkalan) {
      setFormData((prev) => ({
        ...prev,
        nama: currentPangkalan.nama,
        tempatTanggalLahir: currentPangkalan.tempatLahir ? `${currentPangkalan.tempatLahir}, ${currentPangkalan.tanggalLahir}` : prev.tempatTanggalLahir,
        pekerjaan: currentPangkalan.pekerjaan || 'Wiraswasta / Pengelola Pangkalan',
        alamatUsaha: `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}, Kab. Nagekeo`,
        lokasiPangkalan: `${currentPangkalan.alamat}, Kel. ${currentPangkalan.kelurahan}, Kec. ${currentPangkalan.kecamatan}`,
        nomorHp: currentPangkalan.nomorHp || prev.nomorHp || '',
      }));
      setKecamatan(currentPangkalan.kecamatan || 'Aesesa');
      setKelurahan(currentPangkalan.kelurahan || 'Mbay');
    }
  }, [activePangkalanId, currentPangkalan, mode]);

  // Handle Switch to "Buat Surat Baru"
  const handleStartNewLetter = () => {
    setMode('new');
    setActivePangkalanId('');
    setFormData({
      nomorSurat: '',
      lampiran: '1 (satu) berkas',
      perihal: 'Permohonan Perpanjangan Rekomendasi',
      tanggal: `Mbay, ${todayStr}`,
      tujuan: 'Kepala Bagian Perekonomian dan SDA Setda Kabupaten Nagekeo',
      nama: '',
      tempatTanggalLahir: '',
      pekerjaan: 'Wiraswasta / Pengelola Pangkalan',
      alamatUsaha: '',
      nomorHp: '',
      lokasiPangkalan: '',
      lampiranRekomendasiSebelumnya: true,
      lampiranKtp: true,
      lampiranSku: true,
      lampiranSuratPernyataan: true,
      lampiranNpwp: true,
    });
    setKecamatan('Aesesa');
    setKelurahan('Mbay');
    setSavedSuccessMsg(null);
  };

  // Save as new Pangkalan entry in system
  const handleSaveToPangkalanList = () => {
    if (!formData.nama.trim()) {
      alert('Mohon isi nama pemohon terlebih dahulu.');
      return;
    }

    const newId = `PGK-${Date.now().toString().slice(-4)}`;
    const newPangkalan: Pangkalan = {
      id: newId,
      no: pangkalanList.length + 1,
      nama: formData.nama,
      alamat: formData.alamatUsaha || 'Mbay',
      kelurahan: kelurahan || 'Mbay',
      kecamatan: kecamatan || 'Aesesa',
      kabupaten: 'NAGEKEO',
      propinsi: 'NTT',
      nomorHp: formData.nomorHp,
      pekerjaan: formData.pekerjaan,
      kuotaHarianLiter: 200,
      statusPerizinan: 'Aktif',
    };

    if (onSavePangkalan) {
      onSavePangkalan(newPangkalan);
      setActivePangkalanId(newId);
      setMode('existing');
      setSavedSuccessMsg(`Surat & Data Pangkalan Baru berhasil disimpan ke sistem dengan ID ${newId}!`);
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Panel Header */}
      <div className="bg-slate-900 border-2 border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl space-y-5 print:hidden text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Generator Surat Permohonan</h3>
              <p className="text-xs text-amber-300 font-medium">
                Buat surat permohonan rekomendasi pangkalan minyak tanah baru atau pilih dari pangkalan yang ada
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-lg transition cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Surat Permohonan</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('existing')}
            disabled={pangkalanList.length === 0}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition min-h-[44px] ${
              mode === 'existing'
                ? 'bg-amber-500 text-slate-950 shadow-md'
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
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Permohonan Baru (Kosong)</span>
          </button>
        </div>

        {/* Notification Banner */}
        {savedSuccessMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4">
          {mode === 'existing' && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                Pilih Pangkalan Yang Ada:
              </label>
              <select
                value={activePangkalanId}
                onChange={(e) => setActivePangkalanId(e.target.value)}
                className="w-full p-3 bg-slate-950 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
              >
                {pangkalanList.length === 0 ? (
                  <option value="">Belum ada data pangkalan (Gunakan mode Buat Surat Baru)</option>
                ) : (
                  pangkalanList.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.id}] {p.nama} - Kec. {p.kecamatan} ({p.alamat})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* High visibility editable fields */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>{mode === 'new' ? 'Isi Form Surat Permohonan Baru' : 'Edit Detail Surat Permohonan'}</span>
              </h4>

              {mode === 'new' && (
                <button
                  onClick={handleStartNewLetter}
                  className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Bersihkan Form</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap Pemohon *</label>
                <input
                  type="text"
                  placeholder="Contoh: Maria Yuliana"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tempat / Tgl Lahir</label>
                <input
                  type="text"
                  placeholder="Contoh: Mbay, 15 Mei 1988"
                  value={formData.tempatTanggalLahir}
                  onChange={(e) => setFormData({ ...formData, tempatTanggalLahir: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pekerjaan</label>
                <input
                  type="text"
                  placeholder="Wiraswasta / Pengelola Pangkalan"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nomor HP / WhatsApp</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={formData.nomorHp}
                  onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tanggal Surat / Mbay</label>
                <input
                  type="text"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Surat (Opsional)</label>
                <input
                  type="text"
                  placeholder="Kosongkan jika belum ada"
                  value={formData.nomorSurat}
                  onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Alamat Usaha / Domisili Pemohon</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Soekarno Hatta, Kel. Mbay, Kec. Aesesa, Kab. Nagekeo"
                  value={formData.alamatUsaha}
                  onChange={(e) => setFormData({ ...formData, alamatUsaha: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lokasi Pangkalan Minyak Tanah</label>
                <input
                  type="text"
                  placeholder="Contoh: RT 002 / RW 001, Kel. Mbay, Kec. Aesesa"
                  value={formData.lokasiPangkalan}
                  onChange={(e) => setFormData({ ...formData, lokasiPangkalan: e.target.value })}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
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
      <div className="bg-white p-6 sm:p-12 md:p-16 rounded-2xl border border-slate-300 shadow-2xl max-w-4xl mx-auto text-black font-serif leading-relaxed text-xs sm:text-sm print:p-0 print:border-none print:shadow-none print:m-0 print:w-full overflow-x-auto">
        {/* Right Header Date */}
        <div className="text-right mb-6 font-sans text-xs sm:text-sm">
          <p className="font-bold">{formData.tanggal}</p>
        </div>

        {/* Header Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 font-sans text-xs sm:text-sm">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-24 font-bold">Nomor</span>
              <span>: {formData.nomorSurat || '........................'}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-bold">Lampiran</span>
              <span>: {formData.lampiran}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-bold">Perihal</span>
              <span className="font-bold">: {formData.perihal}</span>
            </div>
          </div>

          <div className="space-y-1 sm:pl-8">
            <p>Kepada</p>
            <p className="font-bold">Yth. Kepala Bagian Perekonomian dan SDA</p>
            <p className="font-bold">Setda Kabupaten Nagekeo</p>
            <p>Di -</p>
            <p className="pl-4 italic">Tempat</p>
          </div>
        </div>

        {/* Salutation */}
        <div className="mb-4">
          <p>Dengan hormat,</p>
          <p className="mt-1">Saya yang bertanda tangan di bawah ini :</p>
        </div>

        {/* Form Fields Table */}
        <div className="ml-2 sm:ml-8 mb-6 space-y-2 text-xs sm:text-sm font-sans">
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-bold">Nama</span>
            <span className="col-span-8 sm:col-span-9 font-bold text-black">: {formData.nama || '.........................................................'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-bold">Tempat/Tanggal Lahir</span>
            <span className="col-span-8 sm:col-span-9">: {formData.tempatTanggalLahir || '.........................................................'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-bold">Pekerjaan</span>
            <span className="col-span-8 sm:col-span-9">: {formData.pekerjaan || '.........................................................'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-bold">Alamat Usaha</span>
            <span className="col-span-8 sm:col-span-9">: {formData.alamatUsaha || '.........................................................'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-bold">Nomor HP</span>
            <span className="col-span-8 sm:col-span-9">: {formData.nomorHp || '.........................................................'}</span>
          </div>
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-3 mb-6 text-justify text-xs sm:text-sm">
          <p>
            Dengan ini saya mengajukan Surat Permohonan Perpanjangan Rekomendasi ke hadapan Bapak, kiranya Bapak berkenan memberikan Surat Rekomendasi Sebagai Pangkalan Minyak Tanah, yang berlokasi di{' '}
            <span className="font-bold underline">{formData.lokasiPangkalan || '.........................................................'}</span>.
          </p>
          <p>
            Saya akan mematuhi segala ketentuan / peraturan dan petunjuk yang diberikan kepada saya.
          </p>
          <p>
            Sebagai bahan pertimbangan Bapak, saya lampirkan persyaratan sebagai berikut :
          </p>
        </div>

        {/* Attachments */}
        <ol className="list-decimal list-inside ml-2 sm:ml-8 mb-8 space-y-1.5 text-xs sm:text-sm font-sans">
          <li className="font-medium">Surat Rekomendasi Tahun sebelumnya</li>
          <li className="font-medium">Kartu Tanda Penduduk (KTP)</li>
          <li className="font-medium">Surat Keterangan Usaha dari Desa/Lurah</li>
          <li className="font-medium">Surat Pernyataan Bermeterai</li>
          <li className="font-medium">Foto copy NPWP</li>
        </ol>

        {/* Closing */}
        <div className="mb-12 text-justify text-xs sm:text-sm">
          <p>
            Demikian Surat Permohonan ini saya buat dan atas pertimbangan Bapak saya ucapkan limpah terima kasih.
          </p>
        </div>

        {/* Signature */}
        <div className="flex justify-end text-center text-xs sm:text-sm font-sans">
          <div className="w-56 space-y-16">
            <p className="font-semibold">Pemohon,</p>
            <div>
              <p className="font-bold underline uppercase">{formData.nama || '........................'}</p>
              {currentPangkalan && mode === 'existing' && (
                <p className="text-[11px] text-slate-600">Pemilik Pangkalan ID: {currentPangkalan.id}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
