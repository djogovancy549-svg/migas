import React, { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  FileText,
  Award,
  ClipboardCheck,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'pangkalan'
  | 'surat-permohonan'
  | 'surat-pernyataan'
  | 'persyaratan'
  | 'admin-settings'
  | 'portal-agen';

interface TabItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pangkalanCount: number;
  isAdminMode: boolean;
  isAgenMode: boolean;
  licensedCount?: number;
  hasPendingNotice?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  pangkalanCount,
  isAdminMode,
  isAgenMode,
  licensedCount = 0,
  hasPendingNotice = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Tabs for Admin Mode
  const adminTabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard & Statistik',
      icon: LayoutDashboard,
    },
    {
      id: 'pangkalan',
      label: 'Data Master Pangkalan',
      icon: Store,
      badge: pangkalanCount,
    },
    {
      id: 'portal-agen',
      label: 'Portal Agen & Pangkalan Berizin',
      icon: Building2,
      badge: licensedCount,
    },
    {
      id: 'persyaratan',
      label: 'Verifikasi & Ceklist Syarat',
      icon: ClipboardCheck,
    },
    {
      id: 'surat-permohonan',
      label: 'Cetak Surat Permohonan',
      icon: FileText,
    },
    {
      id: 'surat-pernyataan',
      label: 'Cetak Surat Pernyataan',
      icon: Award,
    },
    {
      id: 'admin-settings',
      label: 'Pengaturan Admin & Multi-Agen',
      icon: Settings,
    },
  ];

  // Tabs for Agen Mode - Hanya memunculkan nama pangkalan yang telah memiliki ijin dan data informasi itu saja
  const agenTabs: TabItem[] = [
    {
      id: 'portal-agen',
      label: 'Daftar Pangkalan Berizin Resmi',
      icon: Building2,
      badge: licensedCount,
    },
    {
      id: 'dashboard',
      label: 'Informasi & Statistik Kuota',
      icon: LayoutDashboard,
    },
  ];

  // Tabs for Customer / Public Mode
  const userTabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard & Informasi',
      icon: LayoutDashboard,
    },
    {
      id: 'persyaratan',
      label: 'Portal Berkas & Ceklist Syarat',
      icon: ClipboardCheck,
    },
    {
      id: 'surat-permohonan',
      label: 'Cetak Surat Permohonan',
      icon: FileText,
    },
    {
      id: 'surat-pernyataan',
      label: 'Cetak Surat Pernyataan',
      icon: Award,
    },
  ];

  const visibleTabs = isAdminMode ? adminTabs : isAgenMode ? agenTabs : userTabs;

  // Scroll visibility checking
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [visibleTabs]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 shadow-md sticky top-[61px] sm:top-[69px] z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 relative flex items-center">
        {/* Left Scroll Gradient Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 h-full px-1.5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent text-amber-400 hover:text-amber-300 transition flex items-center justify-center cursor-pointer"
            aria-label="Scroll Kiri"
          >
            <ChevronLeft className="w-5 h-5 bg-slate-950/80 rounded-full border border-slate-700 shadow-md p-0.5" />
          </button>
        )}

        {/* Scrollable Tabs Wrapper */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 w-full px-1"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer shrink-0 border min-h-[40px] ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-100 border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400/90'}`} />
                <span>{tab.label}</span>

                {typeof tab.badge === 'number' && (
                  <span
                    className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black font-mono ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {tab.id === 'pangkalan' && hasPendingNotice && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white shrink-0" title="Ada data baru belum disimpan ke Google Sheet" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Gradient Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-slate-900 via-slate-900/90 to-transparent text-amber-400 hover:text-amber-300 transition flex items-center justify-center cursor-pointer"
            aria-label="Scroll Kanan"
          >
            <ChevronRight className="w-5 h-5 bg-slate-950/80 rounded-full border border-slate-700 shadow-md p-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
