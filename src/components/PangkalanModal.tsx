import React, { useState, useEffect } from 'react';
import { Pangkalan, AgenCompany } from '../types';
import { X, Save, Building2, MapPin, Fuel, User, Phone, FileText } from 'lucide-react';

interface PangkalanModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'detail';
  pangkalan?: Pangkalan | null;
  agenList?: AgenCompany[];
  onClose: () => void;
  onSave: (pangkalan: Pangkalan) => void;
  onSelectForLetter?: (pangkalan: Pangkalan, letterType: 'permohonan' | 'pernyataan') => void;
}

export const PangkalanModal: React.FC<PangkalanModalProps> = ({
  isOpen,
  mode,
  pangkalan,
  agenList = [],
  onClose,
  onSave,
  onSelectForLetter,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Pangkalan>({
    id: pangkalan?.id || `121/PT PNE NGK`,
    no: pangkalan?.no || 121,
    nama: pangkalan?.nama || '',
    alamat: pangkalan?.alamat || '',
    kelurahan: pangkalan?.kelurahan || '',
    kecamatan: pangkalan?.kecamatan || 'AESESA',
    kabupaten: 'NAGEKEO',
    propinsi: 'NTT',
    kuotaHarianLiter: pangkalan?.kuotaHarianLiter || 200,
    statusPerizinan: pangkalan?.statusPerizinan || 'Aktif',
    nik: pangkalan?.nik || '',
    nib: pangkalan?.nib || '',
    tempatLahir: pangkalan?.tempatLahir || '',
    tanggalLahir: pangkalan?.tanggalLahir || '',
    pekerjaan: pangkalan?.pekerjaan || 'Wiraswasta',
    nomorHp: pangkalan?.nomorHp || '',
    namaUsaha: pangkalan?.namaUsaha || '',
    namaAgen: pangkalan?.namaAgen || (agenList.length > 0 ? agenList[0].nama : 'PT. PUTRA NGADA ENERGI (NAGEKEO)'),
  });

  useEffect(() => {
    if (pangkalan) {
      setFormData(pangkalan);
    }
  }, [pangkalan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-8 text-slate-100">
        {/* Modal Header */}
        <div className="bg-slate-950 text-slate-100 p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'add' ? 'Tambah Pangkalan Baru' : mode === 'edit' ? 'Edit Data Pangkalan' : 'Detail Pangkalan Minyak Tanah'}
              </h3>
              <p className="text-xs text-slate-400">
                PT. Putra Ngada Energi • Kab. Nagekeo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {mode === 'detail' ? (
          <div className="p-6 space-y-6 text-xs text-slate-300">
            {/* Main Badge Info */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-amber-300 text-sm bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                  ID: {formData.id}
                </span>
                <h2 className="text-lg font-black text-white mt-1.5">{formData.nama}</h2>
                <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {formData.alamat}, Kel. {formData.kelurahan}, Kec. {formData.kecamatan}, {formData.kabupaten}
                </p>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Kuota Harian:</span>
                <span className="text-xl font-black text-amber-400">{formData.kuotaHarianLiter || 200} Liter</span>
              </div>
            </div>

            {/* Profile Detail Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold text-[11px] uppercase">Nomor Induk Kependudukan (NIK)</p>
                <p className="font-mono font-bold text-white text-sm">{formData.nik || 'Belum diisi'}</p>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold text-[11px] uppercase">Nomor Induk Berusaha (NIB)</p>
                <p className="font-mono font-bold text-white text-sm">{formData.nib || 'Belum diisi'}</p>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold text-[11px] uppercase">Tempat / Tanggal Lahir</p>
                <p className="font-bold text-white">
                  {formData.tempatLahir ? `${formData.tempatLahir}, ${formData.tanggalLahir}` : 'Nagekeo, 1985'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold text-[11px] uppercase">Nomor Kontak / HP</p>
                <p className="font-bold text-white">{formData.nomorHp || '0812-3456-7890'}</p>
              </div>
            </div>

            {/* Quick Document Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-3 justify-end">
              {onSelectForLetter && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectForLetter(formData, 'permohonan');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cetak Surat Permohonan</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectForLetter(formData, 'pernyataan');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cetak Surat Pernyataan</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">ID Pangkalan:</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl font-mono font-bold text-amber-400 bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Pemilik / Pangkalan:</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl font-bold bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Alamat Pangkalan:</label>
                <input
                  type="text"
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kelurahan / Desa:</label>
                <input
                  type="text"
                  required
                  value={formData.kelurahan}
                  onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kecamatan:</label>
                <select
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl font-semibold bg-slate-950 text-white"
                >
                  <option value="AESESA">AESESA</option>
                  <option value="BOAWAE">BOAWAE</option>
                  <option value="NANGARORO">NANGARORO</option>
                  <option value="MAUPONGGO">MAUPONGGO</option>
                  <option value="WOLOWEA">WOLOWEA</option>
                  <option value="ULUPULU">ULUPULU / NAGARORO</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kuota Harian (Liter):</label>
                <input
                  type="number"
                  required
                  value={formData.kuotaHarianLiter || 200}
                  onChange={(e) => setFormData({ ...formData, kuotaHarianLiter: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-800 rounded-xl font-bold bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">NIK Pemilik:</label>
                <input
                  type="text"
                  value={formData.nik || ''}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl bg-slate-950 text-white"
                  placeholder="53160..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nomor Kontak / HP:</label>
                <input
                  type="text"
                  value={formData.nomorHp || ''}
                  onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl bg-slate-950 text-white"
                  placeholder="08..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Agen Penyalur Resmi:</label>
                <select
                  value={formData.namaAgen || (agenList[0]?.nama || '')}
                  onChange={(e) => setFormData({ ...formData, namaAgen: e.target.value })}
                  className="w-full p-2 border border-slate-800 rounded-xl font-semibold bg-slate-950 text-white"
                >
                  {agenList.map((agen) => (
                    <option key={agen.id} value={agen.nama}>
                      {agen.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 rounded-xl font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Data</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
