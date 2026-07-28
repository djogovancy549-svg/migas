import React, { useState, useEffect, useMemo } from 'react';
import { Pangkalan, PersyaratanStatus, MasterRequirementItem, UploadedDocument } from './types';
import { INITIAL_PANGKALAN_LIST, INITIAL_CHECKLIST_STATUS } from './data/pangkalanData';
import { INITIAL_MASTER_REQUIREMENTS } from './data/masterRequirements';
import { Header } from './components/Header';
import { TabNavigation, TabType } from './components/TabNavigation';
import { GoogleSyncBar } from './components/GoogleSyncBar';
import { DashboardView } from './components/DashboardView';
import { PangkalanTableView } from './components/PangkalanTableView';
import { SuratPermohonanView } from './components/SuratPermohonanView';
import { SuratPernyataanView } from './components/SuratPernyataanView';
import { PersyaratanChecklistView } from './components/PersyaratanChecklistView';
import { PangkalanModal } from './components/PangkalanModal';
import { AdminPinModal } from './components/AdminPinModal';
import { UploadPersyaratanModal } from './components/UploadPersyaratanModal';

export default function App() {
  // Load initial dataset or restore from localStorage
  const [pangkalanList, setPangkalanList] = useState<Pangkalan[]>(() => {
    const saved = localStorage.getItem('pne_nagekeo_pangkalan_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved pangkalan data', e);
      }
    }
    return INITIAL_PANGKALAN_LIST;
  });

  const [checklistData, setChecklistData] = useState<Record<string, PersyaratanStatus>>(() => {
    const saved = localStorage.getItem('pne_nagekeo_checklist_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved checklist data', e);
      }
    }
    return INITIAL_CHECKLIST_STATUS;
  });

  // Master requirements state (editable by Admin)
  const [masterRequirements, setMasterRequirements] = useState<MasterRequirementItem[]>(() => {
    const saved = localStorage.getItem('pne_nagekeo_master_reqs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved master requirements', e);
      }
    }
    return INITIAL_MASTER_REQUIREMENTS;
  });

  // Uploaded documents state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>(() => {
    const saved = localStorage.getItem('pne_nagekeo_uploaded_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved uploaded docs', e);
      }
    }
    return [];
  });

  // Admin Mode state (protected by PIN migas2026)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('pne_nagekeo_is_admin') === 'true';
  });
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);

  // File Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTargetPangkalan, setUploadTargetPangkalan] = useState<Pangkalan | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('pne_nagekeo_pangkalan_data', JSON.stringify(pangkalanList));
  }, [pangkalanList]);

  useEffect(() => {
    localStorage.setItem('pne_nagekeo_checklist_data', JSON.stringify(checklistData));
  }, [checklistData]);

  useEffect(() => {
    localStorage.setItem('pne_nagekeo_master_reqs', JSON.stringify(masterRequirements));
  }, [masterRequirements]);

  useEffect(() => {
    localStorage.setItem('pne_nagekeo_uploaded_docs', JSON.stringify(uploadedDocs));
  }, [uploadedDocs]);

  useEffect(() => {
    localStorage.setItem('pne_nagekeo_is_admin', isAdminMode ? 'true' : 'false');
  }, [isAdminMode]);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Selected Pangkalan for Document Generation
  const [selectedPangkalanForLetter, setSelectedPangkalanForLetter] = useState<Pangkalan | null>(null);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'detail';
    pangkalan: Pangkalan | null;
  }>({
    isOpen: false,
    mode: 'detail',
    pangkalan: null,
  });

  // Unique Kecamatan Count
  const totalKecamatan = new Set(pangkalanList.map((p) => p.kecamatan)).size;

  // Uploaded docs count map for each pangkalan ID
  const uploadedDocsCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    uploadedDocs.forEach((doc) => {
      map[doc.pangkalanId] = (map[doc.pangkalanId] || 0) + 1;
    });
    return map;
  }, [uploadedDocs]);

  // Clear dummy data handler
  const handleClearDummyData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data pangkalan dummy? Data akan dikosongkan.')) {
      setPangkalanList([]);
      setChecklistData({});
      setUploadedDocs([]);
      localStorage.removeItem('pne_nagekeo_pangkalan_data');
      localStorage.removeItem('pne_nagekeo_checklist_data');
      localStorage.removeItem('pne_nagekeo_uploaded_docs');
    }
  };

  // Handlers
  const handleSelectPangkalanForLetter = (pangkalan: Pangkalan, letterType: 'permohonan' | 'pernyataan') => {
    setSelectedPangkalanForLetter(pangkalan);
    if (letterType === 'permohonan') {
      setActiveTab('surat-permohonan');
    } else {
      setActiveTab('surat-pernyataan');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePangkalan = (savedPangkalan: Pangkalan) => {
    setPangkalanList((prev) => {
      const exists = prev.some((p) => p.id === savedPangkalan.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPangkalan.id ? savedPangkalan : p));
      } else {
        return [savedPangkalan, ...prev];
      }
    });
  };

  const handleDeletePangkalan = (id: string) => {
    setPangkalanList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateChecklist = (pangkalanId: string, updated: PersyaratanStatus) => {
    setChecklistData((prev) => ({
      ...prev,
      [pangkalanId]: updated,
    }));
  };

  const handleQuickPrintSummary = () => {
    window.print();
  };

  // Upload Modal Handlers
  const handleOpenUploadModal = (pangkalan: Pangkalan) => {
    setUploadTargetPangkalan(pangkalan);
    setIsUploadModalOpen(true);
  };

  const handleUploadFile = (pangkalanId: string, docKey: string, docName: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newDoc: UploadedDocument = {
        id: 'doc_' + Date.now(),
        pangkalanId,
        documentKey: docKey,
        documentName: docName,
        fileName: file.name,
        fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        fileSize: file.size,
        fileDataUrl: dataUrl,
        uploadedAt: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Menunggu Verifikasi',
      };

      setUploadedDocs((prev) => {
        const filtered = prev.filter((d) => !(d.pangkalanId === pangkalanId && d.documentKey === docKey));
        return [newDoc, ...filtered];
      });

      setChecklistData((prev) => {
        const current = prev[pangkalanId] || {
          pangkalanId,
          jenis: 'Perpanjangan',
        };
        return {
          ...prev,
          [pangkalanId]: {
            ...current,
            [docKey]: true,
          },
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (docId: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleUpdateDocStatus = (
    docId: string,
    status: 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak',
    catatan?: string
  ) => {
    setUploadedDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status, catatanAdmin: catatan } : d))
    );
  };

  // Master Requirements Handlers
  const handleAddMasterRequirement = (item: MasterRequirementItem) => {
    setMasterRequirements((prev) => [...prev, item]);
  };

  const handleDeleteMasterRequirement = (key: string) => {
    setMasterRequirements((prev) => prev.filter((item) => item.key !== key));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* App Header */}
      <Header
        totalPangkalan={pangkalanList.length}
        totalKecamatan={totalKecamatan}
        isAdminMode={isAdminMode}
        onRequestAdminAuth={() => setIsAdminPinModalOpen(true)}
        onExitAdminMode={() => setIsAdminMode(false)}
        onQuickPrintSummary={handleQuickPrintSummary}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pangkalanCount={pangkalanList.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* Google Sync & Drive Bar */}
        <div className="print:hidden">
          <GoogleSyncBar
            pangkalanList={pangkalanList}
            uploadedDocs={uploadedDocs}
            onClearDummyData={handleClearDummyData}
          />
        </div>

        {activeTab === 'dashboard' && (
          <DashboardView
            pangkalanList={pangkalanList}
            onSelectPangkalanForLetter={handleSelectPangkalanForLetter}
            onGoToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'pangkalan' && (
          <PangkalanTableView
            pangkalanList={pangkalanList}
            uploadedDocsCountMap={uploadedDocsCountMap}
            isAdminMode={isAdminMode}
            onSelectPangkalanForLetter={handleSelectPangkalanForLetter}
            onEditPangkalan={(p) => setModalState({ isOpen: true, mode: 'edit', pangkalan: p })}
            onDeletePangkalan={handleDeletePangkalan}
            onAddNewPangkalan={() => setModalState({ isOpen: true, mode: 'add', pangkalan: null })}
            onOpenDetail={(p) => setModalState({ isOpen: true, mode: 'detail', pangkalan: p })}
            onOpenUploadModal={handleOpenUploadModal}
          />
        )}

        {activeTab === 'surat-permohonan' && (
          <SuratPermohonanView
            pangkalanList={pangkalanList}
            selectedPangkalan={selectedPangkalanForLetter}
            onSavePangkalan={handleSavePangkalan}
          />
        )}

        {activeTab === 'surat-pernyataan' && (
          <SuratPernyataanView
            pangkalanList={pangkalanList}
            selectedPangkalan={selectedPangkalanForLetter}
            onSavePangkalan={handleSavePangkalan}
          />
        )}

        {activeTab === 'persyaratan' && (
          <PersyaratanChecklistView
            pangkalanList={pangkalanList}
            checklistData={checklistData}
            masterRequirements={masterRequirements}
            uploadedDocs={uploadedDocs}
            isAdminMode={isAdminMode}
            onRequestAdminAuth={() => setIsAdminPinModalOpen(true)}
            onUpdateChecklist={handleUpdateChecklist}
            onOpenUploadModal={handleOpenUploadModal}
            onAddMasterRequirement={handleAddMasterRequirement}
            onDeleteMasterRequirement={handleDeleteMasterRequirement}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-300">
            Aplikasi Sistem Pangkalan Minyak Tanah PT. Putra Ngada Energi (Nagekeo)
          </p>
          <p className="text-slate-500">
            Terintegrasi dengan Persyaratan Bagian Perekonomian dan SDA Sekretariat Daerah Kabupaten Nagekeo, NTT
          </p>
        </div>
      </footer>

      {/* Pangkalan Edit / Detail Modal */}
      <PangkalanModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        pangkalan={modalState.pangkalan}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSavePangkalan}
        onSelectForLetter={handleSelectPangkalanForLetter}
      />

      {/* File Upload Modal */}
      <UploadPersyaratanModal
        isOpen={isUploadModalOpen}
        pangkalan={uploadTargetPangkalan}
        masterRequirements={masterRequirements}
        uploadedDocs={uploadedDocs}
        isAdminMode={isAdminMode}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadTargetPangkalan(null);
        }}
        onUploadFile={handleUploadFile}
        onDeleteFile={handleDeleteFile}
        onUpdateStatus={handleUpdateDocStatus}
        onRequestAdminAuth={() => setIsAdminPinModalOpen(true)}
      />

      {/* Admin PIN Authentication Modal */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={() => {
          setIsAdminMode(true);
          setIsAdminPinModalOpen(false);
        }}
      />
    </div>
  );
}
