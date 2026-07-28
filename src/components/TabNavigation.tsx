import React from 'react';
import { LayoutDashboard, Store, FileText, Award, ClipboardCheck } from 'lucide-react';

export type TabType = 'dashboard' | 'pangkalan' | 'surat-permohonan' | 'surat-pernyataan' | 'persyaratan';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pangkalanCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  pangkalanCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard & Statistik',
      icon: LayoutDashboard,
    },
    {
      id: 'pangkalan' as TabType,
      label: 'Daftar Pangkalan',
      icon: Store,
      badge: pangkalanCount,
    },
    {
      id: 'surat-permohonan' as TabType,
      label: 'Cetak Surat Permohonan',
      icon: FileText,
    },
    {
      id: 'surat-pernyataan' as TabType,
      label: 'Cetak Surat Pernyataan',
      icon: Award,
    },
    {
      id: 'persyaratan' as TabType,
      label: 'Ceklist Persyaratan Perizinan',
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md print:hidden sticky top-[62px] sm:top-[69px] z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 px-1 scrollbar-none touch-pan-x" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer shrink-0 min-h-[40px] ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-slate-800/60 bg-slate-900/40'
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
      </div>
    </div>
  );
};
