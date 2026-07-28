import React, { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  FileText,
  Award,
  ClipboardCheck,
  Settings,
  ShieldCheck,
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
  | 'admin-settings';

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
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  pangkalanCount,
  isAdminMode,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Define tabs for Admin Mode vs User Mode
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
      label: 'Pengaturan Admin & Sync',
      icon: Settings,
    },
  ];

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

  const tabs = isAdminMode ? adminTabs : userTabs;

  // Check scroll positions
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs, isAdminMode]);

  // Scroll manually with buttons
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Scroll active tab into view smoothly
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  return (
    <div className="bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md print:hidden sticky top-[62px] sm:top-[69px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Scrollable Container Wrapper with Arrows & Gradient Fades */}
        <div className="relative flex-1 flex items-center min-w-0">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-2 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent pl-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/30 shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Geser Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Bar */}
          <nav
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex space-x-1.5 sm:space-x-2 overflow-x-auto py-2.5 px-1 scrollbar-none touch-pan-x flex-1 scroll-smooth"
            aria-label="Tabs"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer shrink-0 min-h-[40px] select-none ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-slate-800/80 bg-slate-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className="text-[11px] sm:text-xs">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-2 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent pr-1">
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/30 shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Geser Kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Role indicator badge on tab right */}
        <div className="hidden lg:flex items-center pl-3 shrink-0">
          {isAdminMode ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sisi Admin Pemda</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">
              Sisi Pemohon / User
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
