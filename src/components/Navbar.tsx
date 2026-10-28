import React from 'react';
import { Trophy, FileSpreadsheet } from 'lucide-react';
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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shadow-inner shrink-0 text-amber-300">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  स्वार • रामपुर
                </span>
                <span className="text-xs text-blue-200 font-medium">सत्र 2026 - 27</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight line-clamp-1">
                {APP_CONFIG.tournamentTitle}
              </h1>
              <p className="text-xs text-blue-200/90 hidden sm:block">
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
              <button
                onClick={() => setActiveTab('sheet')}
                title={
                  currentUdise
                    ? `शीट रजिस्टर (केवल यू-डायस ${currentUdise} का डेटा)`
                    : 'शीट रजिस्टर (सभी डेटा)'
                }
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'sheet'
                    ? 'bg-amber-400 text-blue-950 shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>शीट रजिस्टर</span>
                {currentUdise ? (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                      activeTab === 'sheet'
                        ? 'bg-blue-950 text-amber-300'
                        : 'bg-amber-400 text-blue-950'
                    }`}
                    title={`यू-डायस ${currentUdise}: ${currentUdiseEntriesCount} प्रविष्टियां`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{currentUdiseEntriesCount}</span>
                  </span>
                ) : totalEntries > 0 ? (
                  <span className="ml-1 bg-blue-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {totalEntries}
                  </span>
                ) : null}
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
