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
    <div className="bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md print:hidden sticky top-[69px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1.5 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800/90 text-amber-400 border border-amber-500/20'
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
