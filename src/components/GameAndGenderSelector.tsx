import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trophy, 
  Users, 
  Layers, 
  History, 
  GraduationCap, 
  Search, 
  Edit3, 
  CheckCircle2, 
  UserPlus,
  Building2,
  Tag
} from 'lucide-react';
import { PRIMARY_GAMES, UPPER_PRIMARY_GAMES, GENDER_OPTIONS, LEVEL_OPTIONS } from '../data/games';
import { StudentRegistration } from '../types';
import { getCategorySheetName } from '../services/apiService';

interface GameAndGenderSelectorProps {
  level: string;
  gameName: string;
  gender: string;
  schoolType: string;
  existingRecord: StudentRegistration | null;
  isChecking: boolean;
  udiseCode?: string;
  schoolName?: string;
  nyayPanchayat?: string;
  schoolStudents?: StudentRegistration[];
  onLevelChange: (lvl: string) => void;
  onGameChange: (game: string) => void;
  onGenderChange: (gender: string) => void;
  onResetToNew: () => void;
  onSelectStudent?: (student: StudentRegistration) => void;
  onViewAllSheet?: () => void;
}

export const GameAndGenderSelector: React.FC<GameAndGenderSelectorProps> = ({
  level,
  gameName,
  gender,
  schoolType,
  existingRecord,
  isChecking,
  udiseCode = '',
  schoolName = '',
  schoolStudents = [],
  onLevelChange,
  onGameChange,
  onGenderChange,
  onResetToNew,
  onSelectStudent,
  onViewAllSheet,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PS BOYS' | 'PS GIRLS' | 'UPS BOYS' | 'UPS GIRLS'>('ALL');

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

  // Compute category sheet counts for this specific UDISE code
  const categoryCounts = useMemo(() => {
    const counts = {
      'PS BOYS': 0,
      'PS GIRLS': 0,
      'UPS BOYS': 0,
      'UPS GIRLS': 0,
    };
    schoolStudents.forEach((st) => {
      const cat = st.categorySheet || getCategorySheetName(st.level, st.gender);
      if (cat && cat in counts) {
        counts[cat as keyof typeof counts]++;
      }
    });
    return counts;
  }, [schoolStudents]);

  // Filter students by search term and category sheet
  const filteredStudents = useMemo(() => {
    return schoolStudents.filter((st) => {
      const cat = st.categorySheet || getCategorySheetName(st.level, st.gender);
      if (categoryFilter !== 'ALL' && cat !== categoryFilter) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        st.studentName.toLowerCase().includes(term) ||
        st.fatherName.toLowerCase().includes(term) ||
        (st.penNumber && st.penNumber.toLowerCase().includes(term)) ||
        (st.gameName && st.gameName.toLowerCase().includes(term)) ||
        (st.studentClass && st.studentClass.toLowerCase().includes(term)) ||
        (st.aadhaarNumber && st.aadhaarNumber.includes(term))
      );
    });
  }, [schoolStudents, searchTerm, categoryFilter]);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-5 transition-all hover:shadow-lg">
      {/* 1st Child: Section Header */}
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
              स्तर, खेल और वर्ग चुनें - नीचे इस यू-डायस कोड के सभी पंजीकृत छात्र प्रदर्शित हैं
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

      {/* 2nd Child: Selection Dropdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level Dropdown */}
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

        {/* Game Selection Dropdown */}
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

        {/* Gender Dropdown */}
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

      {/* 3rd Child Div: Contains the targeted element (div:nth-of-type(3) > div:nth-of-type(1)) */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        {/* Targeted element: Dedicated Card displaying list of all students of entered UDISE code */}
        <div className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 rounded-2xl border border-indigo-200 shadow-sm overflow-hidden transition-all">
          
          {/* Header of the Students List Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      यू-डायस कोड: <span className="text-amber-300 font-mono">{udiseCode || 'अज्ञात'}</span> के पंजीकृत छात्र
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-amber-950 shadow-xs">
                      कुल छात्र: {schoolStudents.length}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200/90 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-300" />
                    <span>{schoolName || 'विद्यालय का नाम दर्ज नहीं'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onResetToNew}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition"
                  title="नया छात्र पंजीकरण शुरू करें"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + नया छात्र जोड़ें
                </button>
              </div>
            </div>

            {/* 4 Category Sheets Summary Badges */}
            <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-medium text-blue-200">PS BOYS:</span>
                <span className="text-xs font-bold text-white font-mono bg-blue-500/40 px-1.5 py-0.5 rounded">
                  {categoryCounts['PS BOYS']}
                </span>
              </div>
              <div className="bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-medium text-pink-200">PS GIRLS:</span>
                <span className="text-xs font-bold text-white font-mono bg-pink-500/40 px-1.5 py-0.5 rounded">
                  {categoryCounts['PS GIRLS']}
                </span>
              </div>
              <div className="bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-medium text-indigo-200">UPS BOYS:</span>
                <span className="text-xs font-bold text-white font-mono bg-indigo-500/40 px-1.5 py-0.5 rounded">
                  {categoryCounts['UPS BOYS']}
                </span>
              </div>
              <div className="bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-medium text-purple-200">UPS GIRLS:</span>
                <span className="text-xs font-bold text-white font-mono bg-purple-500/40 px-1.5 py-0.5 rounded">
                  {categoryCounts['UPS GIRLS']}
                </span>
              </div>
            </div>
          </div>

          {/* Active Record Notification (if current selected game matches or is being edited) */}
          {existingRecord && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <History className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-900">
                  <span className="font-bold">वर्तमान चयनित रिकॉर्ड:</span>{' '}
                  <b>{existingRecord.studentName || 'छात्र'}</b> (खेल: {existingRecord.gameName}, वर्ग: {existingRecord.gender}, कक्षा: {existingRecord.studentClass})। 
                  नीचे फॉर्म में बदलाव कर <b>'अपडेट करें'</b> दबाएं।
                </p>
              </div>
              <button
                type="button"
                onClick={onResetToNew}
                className="shrink-0 text-xs font-bold px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded shadow-xs transition"
              >
                नई प्रविष्टि करें
              </button>
            </div>
          )}

          {/* Filter and Search Bar inside this School's Students */}
          {schoolStudents.length > 0 && (
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              {/* Search Box */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="छात्र का नाम, PEN, कक्षा या खेल खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
                {(['ALL', 'PS BOYS', 'PS GIRLS', 'UPS BOYS', 'UPS GIRLS'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'सभी वर्ग' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main List Body */}
          {schoolStudents.length === 0 ? (
            /* Empty State */
            <div className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                इस यू-डायस कोड के तहत अभी तक कोई छात्र पंजीकृत नहीं है
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                यू-डायस कोड <b className="font-mono text-slate-700">{udiseCode}</b> ({schoolName}) के लिए पहला छात्र पंजीकृत करने हेतु नीचे दिए गए Step 3 फॉर्म में विवरण भरें और <b>'पंजीकरण सबमिट करें'</b> पर क्लिक करें।
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                पंजीकरण के बाद छात्र की जानकारी सीधे इस तालिका और संबंधित शीट में स्वतः दिखेगी
              </div>
            </div>
          ) : (
            /* Table of Students */
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 sticky top-0 z-10 font-bold">
                    <th className="py-2.5 px-3 w-10 text-center">क्र.</th>
                    <th className="py-2.5 px-3">छात्र का नाम (Student)</th>
                    <th className="py-2.5 px-3">पिता का नाम (Father)</th>
                    <th className="py-2.5 px-3">कक्षा</th>
                    <th className="py-2.5 px-3">खेल का नाम (Game)</th>
                    <th className="py-2.5 px-3">शीट श्रेणी (Category)</th>
                    <th className="py-2.5 px-3">PEN नंबर</th>
                    <th className="py-2.5 px-3 text-center">कार्य (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 text-xs">
                        खोजे गए विवरण से कोई छात्र नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, index) => {
                      const category = st.categorySheet || getCategorySheetName(st.level, st.gender);
                      const isCurrentlyActive = existingRecord && (
                        existingRecord.id === st.id ||
                        (existingRecord.penNumber && existingRecord.penNumber === st.penNumber) ||
                        (existingRecord.gameName === st.gameName && existingRecord.gender === st.gender)
                      );

                      // Category badge colors
                      let catBadgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (category === 'PS BOYS') catBadgeStyle = 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
                      else if (category === 'PS GIRLS') catBadgeStyle = 'bg-pink-50 text-pink-800 border-pink-200 font-bold';
                      else if (category === 'UPS BOYS') catBadgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
                      else if (category === 'UPS GIRLS') catBadgeStyle = 'bg-purple-50 text-purple-800 border-purple-200 font-bold';

                      return (
                        <tr
                          key={st.id || `${st.penNumber}-${index}`}
                          className={`hover:bg-slate-50/90 transition ${
                            isCurrentlyActive ? 'bg-amber-50/70 border-l-4 border-amber-500' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{st.studentName}</span>
                              {isCurrentlyActive && (
                                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">
                                  सक्रिय
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{st.fatherName || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">{st.studentClass || '-'}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            <span className="inline-flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                              {st.gameName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded border ${catBadgeStyle}`}>
                              {category || st.gender}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                            {st.penNumber || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onSelectStudent && onSelectStudent(st)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold shadow-xs transition ${
                                isCurrentlyActive
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-transparent'
                              }`}
                              title="इस छात्र का डेटा फॉर्म में लोड करें और संपादित करें"
                            >
                              <Edit3 className="w-3 h-3" />
                              {isCurrentlyActive ? 'संपादन मोड' : 'चयन / एडिट'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer note */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1 px-4">
            <span>
              💡 <b>टिप:</b> किसी भी छात्र को अपडेट करने के लिए <b>'चयन / एडिट'</b> बटन दबाएं या नया छात्र जोड़ने हेतु ऊपर <b>'+ नया छात्र जोड़ें'</b> पर क्लिक करें।
            </span>
            <span className="font-semibold text-slate-700">
              प्रदर्शित: {filteredStudents.length} / {schoolStudents.length} छात्र
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
