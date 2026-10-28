import React, { useEffect } from 'react';
import { Trophy, Users, Layers, AlertCircle, History } from 'lucide-react';
import { PRIMARY_GAMES, UPPER_PRIMARY_GAMES, GENDER_OPTIONS, LEVEL_OPTIONS } from '../data/games';
import { StudentRegistration } from '../types';

interface GameAndGenderSelectorProps {
  level: string;
  gameName: string;
  gender: string;
  schoolType: string;
  existingRecord: StudentRegistration | null;
  isChecking: boolean;
  onLevelChange: (lvl: string) => void;
  onGameChange: (game: string) => void;
  onGenderChange: (gender: string) => void;
  onResetToNew: () => void;
}

export const GameAndGenderSelector: React.FC<GameAndGenderSelectorProps> = ({
  level,
  gameName,
  gender,
  schoolType,
  existingRecord,
  isChecking,
  onLevelChange,
  onGameChange,
  onGenderChange,
  onResetToNew,
}) => {
  // Determine available games based on selected level
  const isPrimary = level.includes('प्राथमिक स्तर') && !level.includes('उच्च');
  const availableGames = isPrimary ? PRIMARY_GAMES : UPPER_PRIMARY_GAMES;

  // Auto adjust if current game is not in the list
  useEffect(() => {
    if (availableGames.length > 0 && !availableGames.includes(gameName)) {
      onGameChange(availableGames[0]);
    }
  }, [level]);

  // If schoolType is PS or UPS, strictly enforce and lock level
  useEffect(() => {
    if (schoolType === 'PS' && level !== 'प्राथमिक स्तर') {
      onLevelChange('प्राथमिक स्तर');
    } else if (schoolType === 'UPS' && level !== 'उच्च प्राथमिक स्तर') {
      onLevelChange('उच्च प्राथमिक स्तर');
    }
  }, [schoolType, level, onLevelChange]);

  const isLevelLocked = schoolType === 'PS' || schoolType === 'UPS';

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-5 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              प्रतियोगिता एवं खेल चयन (Game & Gender Selection)
            </h2>
            <p className="text-xs text-slate-500">
              स्तर, खेल और वर्ग चुनें - यदि पहले से डेटा मौजूद होगा तो कार्ड में स्वतः दिख जाएगा
            </p>
          </div>
        </div>

        {isChecking && (
          <span className="text-xs text-blue-600 font-medium flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            जाँच की जा रही है...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Level Dropdown (Locked for PS and UPS) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>स्तर / संवर्ग (Level) <span className="text-rose-500">*</span></span>
            {schoolType === 'PS' && (
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                🔒 PS हेतु प्राथमिक स्तर लॉक
              </span>
            )}
            {schoolType === 'UPS' && (
              <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-1.5 py-0.5 rounded border border-indigo-300">
                🔒 UPS हेतु उच्च प्राथमिक स्तर लॉक
              </span>
            )}
          </label>
          <div className="relative">
            <select
              value={level}
              disabled={isLevelLocked}
              onChange={(e) => onLevelChange(e.target.value)}
              className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-sm font-semibold appearance-none ${
                isLevelLocked
                  ? 'bg-slate-100 border border-slate-300 text-slate-600 cursor-not-allowed shadow-inner'
                  : 'bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'
              }`}
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* 2. Game Selection Dropdown (Dynamically populated from image list) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            खेल का नाम (Select Game / Competition) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={gameName}
              onChange={(e) => onGameChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-sm font-bold text-amber-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
            >
              {availableGames.map((game, idx) => (
                <option key={game} value={game}>
                  {idx + 1}. {game}
                </option>
              ))}
            </select>
            <Trophy className="w-4 h-4 text-amber-600 absolute left-3 top-3.5 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* 3. Gender Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            बालक / बालिका (Gender Category) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => onGenderChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Status Notification Banner for Existing vs New Record */}
      {existingRecord && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start space-x-2.5">
              <History className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  मौजूदा रिकॉर्ड मिला (Existing Record Found in Sheet)
                </p>
                <p className="text-xs text-amber-700">
                  इस खेल (<b>{gameName}</b>, {gender}) हेतु <b>{existingRecord.studentName || 'छात्र'}</b> (PEN: {existingRecord.penNumber || 'उपलब्ध नहीं'}) का डेटा पहले से दर्ज है।
                  नीचे कार्ड में भरा हुआ डेटा लोड हो गया है। बदलाव करके <b>'अपडेट करें'</b> बटन दबाएं।
                </p>
                {existingRecord.rowNumber && (
                  <span className="inline-block mt-1 text-[11px] font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                    शीट पंक्ति सं. (Row): {existingRecord.rowNumber}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onResetToNew}
              className="shrink-0 text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-xs transition"
            >
              नई प्रविष्टि करें
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
