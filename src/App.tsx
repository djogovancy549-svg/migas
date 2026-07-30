import React, { useState, useEffect, useMemo } from 'react';
import { Pangkalan, PersyaratanStatus, MasterRequirementItem, UploadedDocument, RekomendasiPerizinan, AgenCompany, HetKecamatan } from './types';
import { INITIAL_PANGKALAN_LIST, INITIAL_CHECKLIST_STATUS, INITIAL_AGEN_LIST, INITIAL_HET_LIST, PEMDA_INFO, DEFAULT_ADMIN_SHEET_ID, SUPER_ADMIN_EMAILS, DEFAULT_AUTHORIZED_ADMIN_EMAILS } from './data/pangkalanData';
import { INITIAL_MASTER_REQUIREMENTS } from './data/masterRequirements';
import { safeLocalStorage } from './lib/storage';
import { initAuthListener } from './lib/googleAuth';
import { fetchPangkalanFromGoogleSheets, clearGoogleSheets } from './lib/googleDriveSheetsService';
import { getCachedAccessToken } from './lib/googleAuth';
import { BellRing, X, FileSpreadsheet } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { TabNavigation, TabType } from './components/TabNavigation';
import { GoogleSyncBar } from './components/GoogleSyncBar';
import { LauncherScreen } from './components/LauncherScreen';
import { DashboardView } from './components/DashboardView';
import { PangkalanTableView } from './components/PangkalanTableView';
import { SuratPermohonanView } from './components/SuratPermohonanView';
import { SuratPernyataanView } from './components/SuratPernyataanView';
import { PersyaratanChecklistView } from './components/PersyaratanChecklistView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { AgenPortalView } from './components/AgenPortalView';
import { PangkalanModal } from './components/PangkalanModal';
import { AdminPinModal } from './components/AdminPinModal';
import { UploadPersyaratanModal } from './components/UploadPersyaratanModal';
import { RekomendasiModal } from './components/RekomendasiModal';
import { DeletePinModal } from './components/DeletePinModal';

export default function App() {
  // Launcher screen toggle state
  const [isLauncherActive, setIsLauncherActive] = useState<boolean>(true);

  // Authorized Admin Emails list state
  const [authorizedAdminEmails, setAuthorizedAdminEmails] = useState<string[]>(() => {
    const saved = safeLocalStorage.getItem('pne_nagekeo_admin_emails');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = Array.from(new Set([...SUPER_ADMIN_EMAILS, ...parsed]));
          return merged;
        }
      } catch (e) {
        console.error('Failed to parse saved admin emails', e);
      }
    }
    return DEFAULT_AUTHORIZED_ADMIN_EMAILS;
  });

  // Dynamic Agen Companies List state (Editable by Admin)
  const [agenList, setAgenList] = useState<AgenCompany[]>(() => {
    const saved = safeLocalStorage.getItem('sipermata_agen_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved agen list', e);
      }
    }
    return INITIAL_AGEN_LIST;
  });

  // Dynamic HET per Kecamatan List state (Editable by Admin)
  const [hetList, setHetList] = useState<HetKecamatan[]>(() => {
    const saved = safeLocalStorage.getItem('sipermata_het_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved het list', e);
      }
    }
    return INITIAL_HET_LIST;
  });

  const handleUpdateHetList = (updated: HetKecamatan[]) => {
    setHetList(updated);
    safeLocalStorage.setItem('sipermata_het_list', JSON.stringify(updated));
  };

  // Current Google User and Access Token state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // Load initial dataset or restore from safeLocalStorage
  const [pangkalanList, setPangkalanList] = useState<Pangkalan[]>(() => {
    const saved = safeLocalStorage.getItem('pne_nagekeo_pangkalan_data');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => ({ ...item, no: idx + 1 }));
        }
      } catch (e) {
        console.error('Failed to parse saved pangkalan data', e);
      }
    }
    return INITIAL_PANGKALAN_LIST;
  });

  const [checklistData, setChecklistData] = useState<Record<string, PersyaratanStatus>>(() => {
    const saved = safeLocalStorage.getItem('pne_nagekeo_checklist_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error('Failed to parse saved checklist data', e);
      }
    }
    return INITIAL_CHECKLIST_STATUS;
  });

  // Master requirements state (editable by Admin)
  const [masterRequirements, setMasterRequirements] = useState<MasterRequirementItem[]>(() => {
    const saved = safeLocalStorage.getItem('pne_nagekeo_master_reqs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved master requirements', e);
      }
    }
    return INITIAL_MASTER_REQUIREMENTS;
  });

  // Uploaded documents state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>(() => {
    const saved = safeLocalStorage.getItem('pne_nagekeo_uploaded_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved uploaded docs', e);
      }
    }
    return [];
  });

  // Leader Pimpinan Info & PIN state
  const [pimpinanInfo, setPimpinanInfo] = useState<{
    pin: string;
    nama: string;
    nip: string;
    jabatan: string;
  }>(() => {
    const saved = safeLocalStorage.getItem('sipermata_pimpinan_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pin) return parsed;
      } catch (e) {
        console.error('Failed to parse saved pimpinan info', e);
      }
    }
    return {
      pin: '8888',
      nama: 'MARIA SERVINA, S.E., M.Si.',
      nip: '19780512 200501 2 008',
      jabatan: 'Kepala Bagian Perekonomian & SDA Setda Kab. Nagekeo',
    };
  });

  // Rekomendasi perizinan data state by pangkalan ID
  const [rekomendasiMap, setRekomendasiMap] = useState<Record<string, RekomendasiPerizinan>>(() => {
    const saved = safeLocalStorage.getItem('sipermata_rekomendasi_map');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error('Failed to parse saved rekomendasi map', e);
      }
    }
    return {};
  });

  // Admin Mode state (protected by PIN migas2026 OR Google Auth Email match)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return safeLocalStorage.getItem('pne_nagekeo_is_admin') === 'true';
  });

  // Agen Mode state (protected by PIN agen2026)
  const [isAgenMode, setIsAgenMode] = useState<boolean>(() => {
    return safeLocalStorage.getItem('sipermata_is_agen') === 'true';
  });

  // Combined PIN Auth Modal State
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    targetRole: 'admin' | 'agen';
  }>({
    isOpen: false,
    targetRole: 'admin',
  });

  // File Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTargetPangkalan, setUploadTargetPangkalan] = useState<Pangkalan | null>(null);

  // Rekomendasi Modal State
  const [isRekomendasiModalOpen, setIsRekomendasiModalOpen] = useState<boolean>(false);
  const [rekomendasiTargetPangkalan, setRekomendasiTargetPangkalan] = useState<Pangkalan | null>(null);

  // Clear All Data Modal State
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState<boolean>(false);

  // Unsynced data notice for Admin & Users
  const [pendingUnsyncedNotice, setPendingUnsyncedNotice] = useState<string | null>(() => {
    return safeLocalStorage.getItem('pne_nagekeo_pending_unsynced_notice') || null;
  });

  useEffect(() => {
    if (pendingUnsyncedNotice) {
      safeLocalStorage.setItem('pne_nagekeo_pending_unsynced_notice', pendingUnsyncedNotice);
    } else {
      safeLocalStorage.removeItem('pne_nagekeo_pending_unsynced_notice');
    }
  }, [pendingUnsyncedNotice]);

  // Google Auth Listener to auto-grant Admin mode ONLY if user's email matches authorizedAdminEmails
  useEffect(() => {
    const unsubscribe = initAuthListener(
      (user, token) => {
        const email = user.email ? user.email.toLowerCase() : null;
        setCurrentUserEmail(email);
        setGoogleAccessToken(token);

        if (email && authorizedAdminEmails.map((e) => e.toLowerCase()).includes(email)) {
          setIsAdminMode(true);
        } else {
          // Regular user/customer accounts must explicitly remain as non-admin
          setIsAdminMode(false);
        }
      },
      () => {
        setCurrentUserEmail(null);
        setGoogleAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, [authorizedAdminEmails]);

  // Auto fetch Google Sheets data on mount and when googleAccessToken is active
  useEffect(() => {
    const targetSheetId = safeLocalStorage.getItem('pne_nagekeo_google_sheet_id') || DEFAULT_ADMIN_SHEET_ID;
    fetchPangkalanFromGoogleSheets(googleAccessToken, targetSheetId)
      .then((sheetItems) => {
        if (sheetItems) {
          const updated = sheetItems.map((p, idx) => ({ ...p, no: idx + 1 }));
          setPangkalanList(updated);
        }
      })
      .catch((err) => console.error('Auto fetch Google Sheets error:', err));
  }, [googleAccessToken]);

  // Save changes to safeLocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('pne_nagekeo_pangkalan_data', JSON.stringify(pangkalanList));
  }, [pangkalanList]);

  useEffect(() => {
    safeLocalStorage.setItem('pne_nagekeo_checklist_data', JSON.stringify(checklistData));
  }, [checklistData]);

  useEffect(() => {
    safeLocalStorage.setItem('pne_nagekeo_master_reqs', JSON.stringify(masterRequirements));
  }, [masterRequirements]);

  useEffect(() => {
    safeLocalStorage.setItem('pne_nagekeo_uploaded_docs', JSON.stringify(uploadedDocs));
  }, [uploadedDocs]);

  useEffect(() => {
    safeLocalStorage.setItem('sipermata_pimpinan_info', JSON.stringify(pimpinanInfo));
  }, [pimpinanInfo]);

  useEffect(() => {
    safeLocalStorage.setItem('sipermata_rekomendasi_map', JSON.stringify(rekomendasiMap));
  }, [rekomendasiMap]);

  useEffect(() => {
    safeLocalStorage.setItem('pne_nagekeo_is_admin', isAdminMode ? 'true' : 'false');
  }, [isAdminMode]);

  useEffect(() => {
    safeLocalStorage.setItem('sipermata_is_agen', isAgenMode ? 'true' : 'false');
  }, [isAgenMode]);

  useEffect(() => {
    safeLocalStorage.setItem('sipermata_agen_list', JSON.stringify(agenList));
  }, [agenList]);

  useEffect(() => {
    safeLocalStorage.setItem('pne_nagekeo_admin_emails', JSON.stringify(authorizedAdminEmails));
  }, [authorizedAdminEmails]);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Guard: If non-admin tries to visit admin-only tab, redirect to dashboard or portal-agen
  useEffect(() => {
    if (!isAdminMode && (activeTab === 'pangkalan' || activeTab === 'admin-settings')) {
      setActiveTab(isAgenMode ? 'portal-agen' : 'dashboard');
    }
  }, [isAdminMode, isAgenMode, activeTab]);

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

  // Count of pangkalan with "Disetujui & Diterbitkan" status or statusPerizinan === 'Aktif'
  const licensedPangkalanCount = useMemo(() => {
    return pangkalanList.filter((p) => {
      const rek = rekomendasiMap[p.id];
      const hasRek = rek && rek.status === 'Disetujui & Diterbitkan';
      const isAktif = p.statusPerizinan === 'Aktif';
      return hasRek || isAktif;
    }).length;
  }, [pangkalanList, rekomendasiMap]);

  // Uploaded docs count map for each pangkalan ID
  const uploadedDocsCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    uploadedDocs.forEach((doc) => {
      map[doc.pangkalanId] = (map[doc.pangkalanId] || 0) + 1;
    });
    return map;
  }, [uploadedDocs]);

  // Clear dummy data handler with PIN protection
  const handleClearDummyData = () => {
    setIsClearAllModalOpen(true);
  };

  const handleConfirmClearAllData = async () => {
    setPangkalanList([]);
    setChecklistData({});
    setUploadedDocs([]);
    setRekomendasiMap({});
    safeLocalStorage.removeItem('pne_nagekeo_pangkalan_data');
    safeLocalStorage.removeItem('pne_nagekeo_checklist_data');
    safeLocalStorage.removeItem('pne_nagekeo_uploaded_docs');
    safeLocalStorage.removeItem('sipermata_rekomendasi_map');

    // Wipe Google Sheet if connected
    const activeToken = getCachedAccessToken();
    const activeSheetId = safeLocalStorage.getItem('pne_nagekeo_google_sheet_id') || DEFAULT_ADMIN_SHEET_ID;
    if (activeToken && activeSheetId) {
      await clearGoogleSheets(activeToken, activeSheetId);
    }

    setPendingUnsyncedNotice(null);
    alert('✅ Seluruh data pangkalan dan file berhasil dikosongkan (termasuk di Google Sheet Admin Pusat)!');
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

    setPendingUnsyncedNotice(
      `Pangkalan "${savedPangkalan.nama}" (${savedPangkalan.id}) telah diinput/diperbarui! Mohon tekan tombol 'Simpan ke Google Sheet' di Google Sync Bar agar data ini tersimpan secara permanen di Cloud Google Sheet Admin.`
    );
  };

  const handleDeletePangkalan = (id: string) => {
    setPangkalanList((prev) => prev.filter((p) => p.id !== id));
    setPendingUnsyncedNotice(
      `Pangkalan (${id}) telah dihapus! Mohon tekan tombol 'Simpan ke Google Sheet' di Google Sync Bar agar data Cloud Google Sheet Admin diperbarui.`
    );
  };

  const handleUpdateChecklist = (pangkalanId: string, updated: PersyaratanStatus) => {
    setChecklistData((prev) => ({
      ...prev,
      [pangkalanId]: updated,
    }));
    setPendingUnsyncedNotice(
      `Verifikasi checklist persyaratan pangkalan (${pangkalanId}) telah diperbarui! Mohon tekan 'Simpan ke Google Sheet' di Google Sync Bar.`
    );
  };

  const handleQuickPrintSummary = () => {
    window.print();
  };

  // Upload Modal Handlers
  const handleOpenUploadModal = (pangkalan: Pangkalan) => {
    setUploadTargetPangkalan(pangkalan);
    setIsUploadModalOpen(true);
  };

  // Rekomendasi Modal Handlers
  const handleOpenRekomendasiModal = (pangkalan: Pangkalan) => {
    setRekomendasiTargetPangkalan(pangkalan);
    setIsRekomendasiModalOpen(true);
  };

  const handleApproveAndSignRekomendasi = (pangkalanId: string, customNomorRek?: string) => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const berlakuSampaiStr = nextYear.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const newRekomendasi: RekomendasiPerizinan = {
      id: 'rek_' + Date.now(),
      pangkalanId,
      nomorRekomendasi: customNomorRek || `500/EKON/REK-MIGAS/${pangkalanId}/2026`,
      status: 'Disetujui & Diterbitkan',
      pimpinanNama: pimpinanInfo.nama,
      pimpinanNip: pimpinanInfo.nip,
      pimpinanJabatan: pimpinanInfo.jabatan,
      tanggalRekomendasi: today,
      berlakuSampai: berlakuSampaiStr,
    };

    setRekomendasiMap((prev) => ({
      ...prev,
      [pangkalanId]: newRekomendasi,
    }));
    setPendingUnsyncedNotice(
      `Surat Rekomendasi pangkalan (${pangkalanId}) telah diterbitkan! Mohon tekan 'Simpan ke Google Sheet' di Google Sync Bar.`
    );
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
        const current: PersyaratanStatus = prev[pangkalanId] || {
          pangkalanId,
          jenis: 'Perpanjangan',
          suratPermohonan: true,
          ktp: true,
          npwp: true,
          nib: true,
          sku: true,
          rekomendasiSebelumnya: true,
          suratPernyataan: true,
        };
        return {
          ...prev,
          [pangkalanId]: {
            ...current,
            [docKey]: true,
          },
        };
      });

      setPendingUnsyncedNotice(
        `Dokumen '${docName}' untuk pangkalan (${pangkalanId}) baru diunggah! Mohon tekan 'Simpan ke Google Sheet' & 'Simpan ke Google Drive' di Google Sync Bar.`
      );
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

  // Render Launcher Screen if active
  if (isLauncherActive) {
    return (
      <>
        <LauncherScreen
          totalPangkalan={pangkalanList.length}
          isAdminMode={isAdminMode}
          isAgenMode={isAgenMode}
          currentUserEmail={currentUserEmail}
          authorizedAdminEmails={authorizedAdminEmails}
          onEnterAsCustomer={() => {
            const isAuthAdmin = currentUserEmail && authorizedAdminEmails.map((e) => e.toLowerCase()).includes(currentUserEmail.toLowerCase());
            if (!isAuthAdmin) {
              setIsAdminMode(false);
            }
            setIsLauncherActive(false);
            setActiveTab('dashboard');
          }}
          onEnterAsAgen={() => {
            if (isAgenMode) {
              setIsLauncherActive(false);
              setActiveTab('portal-agen');
            } else {
              setAuthModalState({ isOpen: true, targetRole: 'agen' });
            }
          }}
          onEnterAsAdmin={() => {
            if (isAdminMode) {
              setIsLauncherActive(false);
              setActiveTab('dashboard');
            } else {
              setAuthModalState({ isOpen: true, targetRole: 'admin' });
            }
          }}
          onRequestAdminAuth={() => setAuthModalState({ isOpen: true, targetRole: 'admin' })}
          onRequestAgenAuth={() => setAuthModalState({ isOpen: true, targetRole: 'agen' })}
        />

        {/* Unified Admin/Agen PIN Modal */}
        <AdminPinModal
          isOpen={authModalState.isOpen}
          targetRole={authModalState.targetRole}
          onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
          onSuccess={() => {
            if (authModalState.targetRole === 'admin') {
              setIsAdminMode(true);
              setActiveTab('dashboard');
            } else {
              setIsAgenMode(true);
              setActiveTab('portal-agen');
            }
            setAuthModalState({ ...authModalState, isOpen: false });
            setIsLauncherActive(false);
          }}
        />
      </>
    );
  }

  // Active target for Rekomendasi checking requirements completeness
  const targetChecklist = rekomendasiTargetPangkalan ? checklistData[rekomendasiTargetPangkalan.id] : null;
  const targetActiveReqs = masterRequirements.filter(
    (item) => item.requiredFor === 'Semua' || item.requiredFor === (targetChecklist?.jenis || 'Perpanjangan')
  );
  const targetCompletedCount = targetActiveReqs.filter((item) => !!targetChecklist?.[item.key]).length;
  const isTargetRequirementsComplete = targetActiveReqs.length > 0 && targetCompletedCount === targetActiveReqs.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* App Header */}
      <Header
        totalPangkalan={pangkalanList.length}
        totalKecamatan={totalKecamatan}
        isAdminMode={isAdminMode}
        isAgenMode={isAgenMode}
        currentUserEmail={currentUserEmail}
        authorizedAdminEmails={authorizedAdminEmails}
        pendingUnsyncedNotice={pendingUnsyncedNotice}
        onRequestAdminAuth={() => setAuthModalState({ isOpen: true, targetRole: 'admin' })}
        onRequestAgenAuth={() => setAuthModalState({ isOpen: true, targetRole: 'agen' })}
        onExitAdminMode={() => setIsAdminMode(false)}
        onExitAgenMode={() => setIsAgenMode(false)}
        onQuickPrintSummary={handleQuickPrintSummary}
        onGoToLauncher={() => setIsLauncherActive(true)}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pangkalanCount={pangkalanList.length}
        isAdminMode={isAdminMode}
        isAgenMode={isAgenMode}
        licensedCount={licensedPangkalanCount}
        hasPendingNotice={!!pendingUnsyncedNotice}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4">
        {/* Unsynced Data Alert Banner at Top */}
        {pendingUnsyncedNotice && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 rounded-2xl shadow-xl text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 border-amber-300 print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950/15 rounded-xl">
                <BellRing className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <p className="font-black text-sm sm:text-base leading-tight">
                  🔔 Pemberitahuan Admin: Ada Data Pangkalan Baru/Diperbarui!
                </p>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  {pendingUnsyncedNotice}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => {
                  const syncElem = document.getElementById('google-sync-bar');
                  if (syncElem) syncElem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-slate-950 hover:bg-slate-900 active:bg-slate-800 text-amber-400 font-black px-4 py-2 rounded-xl text-xs shadow transition cursor-pointer flex items-center gap-1.5 touch-manipulation"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Tekan Simpan ke Google Sheet</span>
              </button>
              <button
                onClick={() => setPendingUnsyncedNotice(null)}
                className="p-1.5 hover:bg-slate-950/20 text-slate-950 rounded-lg transition cursor-pointer touch-manipulation"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Google Sync & Drive Bar */}
        <div id="google-sync-bar" className="print:hidden">
          <GoogleSyncBar
            pangkalanList={pangkalanList}
            uploadedDocs={uploadedDocs}
            isAdminMode={isAdminMode}
            onClearDummyData={handleClearDummyData}
            onUpdatePangkalanList={(newList) => setPangkalanList(newList)}
            pendingUnsyncedNotice={pendingUnsyncedNotice}
            onClearPendingNotice={() => setPendingUnsyncedNotice(null)}
          />
        </div>

        <ErrorBoundary fallbackTitle="Kendala Memuat Menu Aplikasi">
          {activeTab === 'dashboard' && (
            <DashboardView
              pangkalanList={pangkalanList}
              onSelectPangkalanForLetter={handleSelectPangkalanForLetter}
              onGoToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'portal-agen' && (
            <AgenPortalView
              pangkalanList={pangkalanList}
              rekomendasiMap={rekomendasiMap}
              agenList={agenList}
              onSelectPangkalanForLetter={handleSelectPangkalanForLetter}
              onOpenRekomendasiModal={handleOpenRekomendasiModal}
              onOpenDetail={(p) => setModalState({ isOpen: true, mode: 'detail', pangkalan: p })}
            />
          )}

          {activeTab === 'pangkalan' && isAdminMode && (
            <PangkalanTableView
              pangkalanList={pangkalanList}
              uploadedDocsCountMap={uploadedDocsCountMap}
              rekomendasiMap={rekomendasiMap}
              isAdminMode={isAdminMode}
              onSelectPangkalanForLetter={handleSelectPangkalanForLetter}
              onEditPangkalan={(p) => setModalState({ isOpen: true, mode: 'edit', pangkalan: p })}
              onDeletePangkalan={handleDeletePangkalan}
              onAddNewPangkalan={() => setModalState({ isOpen: true, mode: 'add', pangkalan: null })}
              onOpenDetail={(p) => setModalState({ isOpen: true, mode: 'detail', pangkalan: p })}
              onOpenUploadModal={handleOpenUploadModal}
              onOpenRekomendasiModal={handleOpenRekomendasiModal}
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
              hetList={hetList}
              onSavePangkalan={handleSavePangkalan}
            />
          )}

          {activeTab === 'persyaratan' && (
            <PersyaratanChecklistView
              pangkalanList={pangkalanList}
              checklistData={checklistData}
              masterRequirements={masterRequirements}
              uploadedDocs={uploadedDocs}
              rekomendasiMap={rekomendasiMap}
              isAdminMode={isAdminMode}
              onRequestAdminAuth={() => setAuthModalState({ isOpen: true, targetRole: 'admin' })}
              onUpdateChecklist={handleUpdateChecklist}
              onOpenUploadModal={handleOpenUploadModal}
              onOpenRekomendasiModal={handleOpenRekomendasiModal}
              onAddMasterRequirement={handleAddMasterRequirement}
              onDeleteMasterRequirement={handleDeleteMasterRequirement}
            />
          )}

          {activeTab === 'admin-settings' && isAdminMode && (
            <AdminSettingsView
              pangkalanList={pangkalanList}
              uploadedDocs={uploadedDocs}
              isAdminMode={isAdminMode}
              authorizedAdminEmails={authorizedAdminEmails}
              currentUserEmail={currentUserEmail}
              googleAccessToken={googleAccessToken}
              pimpinanPin={pimpinanInfo.pin}
              pimpinanNama={pimpinanInfo.nama}
              pimpinanNip={pimpinanInfo.nip}
              pimpinanJabatan={pimpinanInfo.jabatan}
              agenList={agenList}
              hetList={hetList}
              onUpdateAuthorizedEmails={(updated) => setAuthorizedAdminEmails(updated)}
              onUpdatePimpinanInfo={(updated) => setPimpinanInfo(updated)}
              onUpdateAgenList={(updated) => setAgenList(updated)}
              onUpdateHetList={handleUpdateHetList}
              onRequestAdminAuth={() => setAuthModalState({ isOpen: true, targetRole: 'admin' })}
              onExitAdminMode={() => setIsAdminMode(false)}
              onClearData={handleClearDummyData}
              onUpdatePangkalanList={(newList) => setPangkalanList(newList)}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-black text-amber-400 tracking-wide">
            {PEMDA_INFO.sistemName} - {PEMDA_INFO.sistemFullName}
          </p>
          <p className="text-slate-400">
            {PEMDA_INFO.instansi} • {PEMDA_INFO.nama}
          </p>
        </div>
      </footer>

      {/* Pangkalan Edit / Detail Modal */}
      <PangkalanModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        pangkalan={modalState.pangkalan}
        agenList={agenList}
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
        currentUserEmail={currentUserEmail}
        authorizedAdminEmails={authorizedAdminEmails}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadTargetPangkalan(null);
        }}
        onUploadFile={handleUploadFile}
        onDeleteFile={handleDeleteFile}
        onUpdateStatus={handleUpdateDocStatus}
        onRequestAdminAuth={() => setAuthModalState({ isOpen: true, targetRole: 'admin' })}
      />

      {/* Rekomendasi Modal */}
      <RekomendasiModal
        isOpen={isRekomendasiModalOpen}
        pangkalan={rekomendasiTargetPangkalan}
        isRequirementsComplete={isTargetRequirementsComplete}
        existingRekomendasi={rekomendasiTargetPangkalan ? rekomendasiMap[rekomendasiTargetPangkalan.id] || null : null}
        pimpinanPin={pimpinanInfo.pin}
        pimpinanNama={pimpinanInfo.nama}
        pimpinanNip={pimpinanInfo.nip}
        pimpinanJabatan={pimpinanInfo.jabatan}
        isAdminMode={isAdminMode}
        hetList={hetList}
        onClose={() => {
          setIsRekomendasiModalOpen(false);
          setRekomendasiTargetPangkalan(null);
        }}
        onApproveAndSign={handleApproveAndSignRekomendasi}
        onRequestAdminAuth={() => setAuthModalState({ isOpen: true, targetRole: 'admin' })}
      />

      {/* Unified Admin/Agen PIN Modal */}
      <AdminPinModal
        isOpen={authModalState.isOpen}
        targetRole={authModalState.targetRole}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={() => {
          if (authModalState.targetRole === 'admin') {
            setIsAdminMode(true);
            setActiveTab('dashboard');
          } else {
            setIsAgenMode(true);
            setActiveTab('portal-agen');
          }
          setAuthModalState({ ...authModalState, isOpen: false });
          setIsLauncherActive(false);
        }}
      />

      {/* Clear All Data PIN Confirmation Modal */}
      <DeletePinModal
        isOpen={isClearAllModalOpen}
        title="Kosongkan Semua Data & Clear Google Sheet"
        description="Apakah Anda yakin ingin menghapus sekaligus seluruh data pangkalan, berkas dokumen, serta mengosongkan baris Google Sheet Admin Pusat?"
        itemDetails={`Total Data Aktif: ${pangkalanList.length} Pangkalan, ${uploadedDocs.length} Berkas`}
        isBulkClear={true}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleConfirmClearAllData}
      />
    </div>
  );
}
