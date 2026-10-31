import React from 'react';
import { Trophy } from 'lucide-react';
import { APP_CONFIG } from '../config';

interface NavbarProps {
  activeTab: 'form' | 'sheet';
  setActiveTab: (tab: 'form' | 'sheet') => void;
  onOpenSetup?: () => void;
  totalEntries: number;
  currentUdise?: string;
  currentSchoolName?: string;
  currentUdiseEntriesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalEntries,
  currentUdise,
  currentSchoolName,
  currentUdiseEntriesCount = 0,
}) => {

  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white shadow-lg sticky top-0 z-30 border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Title & Emblem */}
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shadow-inner shrink-0 text-amber-300 mt-0.5 sm:mt-0">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-1">
                <span className="bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  स्वार • रामपुर
                </span>
                <span className="text-xs text-blue-200 font-medium">सत्र 2026 - 27</span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight leading-snug break-words">
                {APP_CONFIG.tournamentTitle}
              </h1>
              <p className="text-[11px] sm:text-xs text-red-400 font-semibold block mt-1 leading-relaxed break-words">
                {APP_CONFIG.subTitle} • {APP_CONFIG.officerName}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">

            {/* View switcher tabs */}
            <div className="flex bg-blue-950/60 p-1 rounded-lg border border-blue-800/80">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'form'
                    ? 'bg-amber-400 text-blue-950 shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                पंजीकरण फॉर्म
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
