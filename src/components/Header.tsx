import React from 'react';
import {
  Newspaper,
  LayoutDashboard,
  Library,
  Sparkles,
  History,
  Rss,
  Settings,
  Search,
  Cpu,
  Database,
} from 'lucide-react';
import { ViewTab, SystemStatus } from '../types.js';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  systemStatus: SystemStatus | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  onQuickGenerate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  systemStatus,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onQuickGenerate,
}) => {
  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'library', label: 'News Library', icon: <Library className="w-4 h-4" /> },
    { id: 'studio', label: 'AI Digest Studio', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'history', label: 'Digest History', icon: <History className="w-4 h-4" /> },
    { id: 'ingestion', label: 'Feed Ingestion', icon: <Rss className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight text-base sm:text-lg">
                  Industry News Digest
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  Reader
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 tracking-wide font-normal -mt-0.5">
                Editorial Intelligence Workspace
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search news, tags, sources... (/)"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentTab !== 'library') onSelectTab('library');
              }}
              className="w-full bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-3 py-1.5 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status indicators */}
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
                  systemStatus?.geminiConfigured
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                }`}
                title={systemStatus?.geminiConfigured ? 'Gemini 3.8 Flash online' : 'Operating in deterministic offline analytical mode'}
              >
                <Cpu className="w-3 h-3" />
                {systemStatus?.geminiConfigured ? 'Gemini 3.8 Active' : 'Offline Engine'}
              </span>

              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-medium"
                title="Persistent Local Storage Active"
              >
                <Database className="w-3 h-3 text-cyan-400" />
                Local Synced
              </span>
            </div>

            {/* Quick Action: New Digest */}
            <button
              onClick={onQuickGenerate}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg shadow-md shadow-indigo-600/20 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Create Digest</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
              title="System Configuration & Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/60 py-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className={active ? 'text-cyan-400' : 'text-slate-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
