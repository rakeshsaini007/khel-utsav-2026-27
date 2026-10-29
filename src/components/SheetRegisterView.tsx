import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Trophy,
  Building2,
  Check
} from 'lucide-react';
import { StudentRegistration } from '../types';
import { APP_CONFIG, GOOGLE_APPS_SCRIPT_URL } from '../config';
import { isPlaceholderUrl, getCategorySheetName } from '../services/apiService';

interface SheetRegisterViewProps {
  records: StudentRegistration[];
  currentUdise?: string;
  currentSchoolName?: string;
  onEditRecord: (record: StudentRegistration) => void;
  onDeleteRecord: (idOrRow: string | number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigateToForm?: () => void;
}

export const SheetRegisterView: React.FC<SheetRegisterViewProps> = ({
  records,
  currentUdise,
  currentSchoolName,
  onEditRecord,
  onDeleteRecord,
  onRefresh,
  isRefreshing,
  onNavigateToForm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Default to current unique UDISE code if available so only that school's data is shown!
  const [filterUdise, setFilterUdise] = useState<string>(currentUdise || 'ALL');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'PS BOYS' | 'PS GIRLS' | 'UPS BOYS' | 'UPS GIRLS'>('ALL');
  const [filterGame, setFilterGame] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');

  // Keep filterUdise in sync if currentUdise changes and was already active
  React.useEffect(() => {
    if (currentUdise && filterUdise === 'ALL') {
      setFilterUdise(currentUdise);
    }
  }, [currentUdise]);

  // Build map of unique UDISE codes and their school names and entry counts
  const udiseStats = React.useMemo(() => {
    const map = new Map<string, { schoolName: string; count: number; nyayPanchayat?: string }>();
    records.forEach(r => {
      if (!r.udiseCode) return;
      const existing = map.get(r.udiseCode);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(r.udiseCode, {
          schoolName: r.schoolName || '',
          count: 1,
          nyayPanchayat: r.nyayPanchayat || '',
        });
      }
    });
    return map;
  }, [records]);

  // Unique UDISE code list
  const uniqueUdiseList = Array.from(udiseStats.keys());

  // Category stats
  const categoryCounts = React.useMemo(() => {
    let psBoys = 0;
    let psGirls = 0;
    let upsBoys = 0;
    let upsGirls = 0;

    records.forEach(r => {
      const cat = r.categorySheet || getCategorySheetName(r.level, r.gender);
      if (cat === 'PS BOYS') psBoys++;
      else if (cat === 'PS GIRLS') psGirls++;
      else if (cat === 'UPS BOYS') upsBoys++;
      else if (cat === 'UPS GIRLS') upsGirls++;
    });

    return {
      all: records.length,
      psBoys,
      psGirls,
      upsBoys,
      upsGirls
    };
  }, [records]);

  // Filter records
  const filtered = records.filter((r) => {
    const matchesUdise = filterUdise === 'ALL' || r.udiseCode === filterUdise;

    const catName = r.categorySheet || getCategorySheetName(r.level, r.gender);
    const matchesCategory = filterCategory === 'ALL' || catName === filterCategory;

    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.udiseCode.includes(searchTerm) ||
      (r.penNumber && r.penNumber.includes(searchTerm)) ||
      (r.uniqueIdNumber && r.uniqueIdNumber.includes(searchTerm)) ||
      r.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.nyayPanchayat && r.nyayPanchayat.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGame = filterGame === 'ALL' || r.gameName === filterGame;
    const matchesGender = filterGender === 'ALL' || r.gender === filterGender;

    return matchesUdise && matchesCategory && matchesSearch && matchesGame && matchesGender;
  });

  // Unique games in records for filter
  const uniqueGames = Array.from(new Set(records.map(r => r.gameName))).filter(Boolean);

  // CSV Export
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('डाउनलोड करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।');
      return;
    }

    const headers = [
      "क्रम संख्या",
      "खेल का नाम",
      "वर्ग / स्तर",
      "बालक / बालिका",
      "श्रेणी शीट (Category Sheet)",
      "PEN",
      "छात्र/छात्रा का यूनिक आईडी नंबर",
      "विजेता का नाम",
      "पिता का नाम",
      "कक्षा",
      "यू-डायस कोड",
      "विद्यालय का नाम",
      "न्याय पंचायत",
      "विद्यालय प्रकार",
      "प्रवेशांक",
      "जन्मतिथि",
      "आधार नंबर",
      "जन्म प्रमाण पत्र क्रमांक",
      "जन्म प्रमाण पत्र जारीकर्ता का पद नाम",
      "पहचान चिन्ह",
      "विजेता बच्चे के दांतों की संख्या",
      "अभिभावक का नाम (हिन्दी में)",
      "अभिभावक का नम्बर",
      "प्र० अ० का नाम",
      "प्र० अ० का विभागीय नम्बर"
    ];

    const rows = filtered.map((r, idx) => [
      idx + 1,
      `"${r.gameName || ''}"`,
      `"${r.level || ''}"`,
      `"${r.gender || ''}"`,
      `"${r.categorySheet || getCategorySheetName(r.level, r.gender)}"`,
      `"${r.penNumber || ''}"`,
      `"${r.uniqueIdNumber || ''}"`,
      `"${r.studentName || ''}"`,
      `"${r.fatherName || ''}"`,
      `"${r.studentClass || ''}"`,
      `"${r.udiseCode || ''}"`,
      `"${r.schoolName || ''}"`,
      `"${r.nyayPanchayat || ''}"`,
      `"${r.schoolType || ''}"`,
      `"${r.admissionNumber || ''}"`,
      `"${r.dob || ''}"`,
      `"${r.aadhaarNumber || ''}"`,
      `"${r.birthCertNumber || ''}"`,
      `"${r.birthCertAuthority || ''}"`,
      `"${r.identificationMark || ''}"`,
      `"${r.teethCount || ''}"`,
      `"${r.parentNameHindi || ''}"`,
      `"${r.parentMobile || ''}"`,
      `"${r.headmasterName || ''}"`,
      `"${r.headmasterMobile || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    let baseName = 'विजेता_प्रतिभागी_सूची';
    if (filterCategory !== 'ALL') {
      baseName = `${filterCategory.replace(/\s+/g, '_')}_${baseName}`;
    }
    const csvFileName =
      filterUdise !== 'ALL'
        ? `${baseName}_UDISE_${filterUdise}_${new Date().toISOString().slice(0, 10)}.csv`
        : `${baseName}_स्वार_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', csvFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeSchoolName =
    (filterUdise !== 'ALL' && (udiseStats.get(filterUdise)?.schoolName || (filterUdise === currentUdise ? currentSchoolName : ''))) || '';

  return (
    <div className="space-y-4">
      
      {/* 4 Dedicated Category Sheets Quick Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 px-3 whitespace-nowrap hidden sm:inline">
          शीट्स (Sheets):
        </span>

        <button
          onClick={() => setFilterCategory('ALL')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterCategory === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>🌐 सभी रिकॉर्ड्स</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {categoryCounts.all}
          </span>
        </button>

        <button
          onClick={() => setFilterCategory('PS BOYS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterCategory === 'PS BOYS'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
          }`}
        >
          <span>👦 PS BOYS</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'PS BOYS' ? 'bg-white/25 text-white' : 'bg-sky-200 text-sky-900'
          }`}>
            {categoryCounts.psBoys}
          </span>
        </button>

        <button
          onClick={() => setFilterCategory('PS GIRLS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterCategory === 'PS GIRLS'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200'
          }`}
        >
          <span>👧 PS GIRLS</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'PS GIRLS' ? 'bg-white/25 text-white' : 'bg-pink-200 text-pink-900'
          }`}>
            {categoryCounts.psGirls}
          </span>
        </button>

        <button
          onClick={() => setFilterCategory('UPS BOYS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterCategory === 'UPS BOYS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
          }`}
        >
          <span>👦 UPS BOYS</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'UPS BOYS' ? 'bg-white/25 text-white' : 'bg-indigo-200 text-indigo-900'
          }`}>
            {categoryCounts.upsBoys}
          </span>
        </button>

        <button
          onClick={() => setFilterCategory('UPS GIRLS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterCategory === 'UPS GIRLS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
          }`}
        >
          <span>👧 UPS GIRLS</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'UPS GIRLS' ? 'bg-white/25 text-white' : 'bg-purple-200 text-purple-900'
          }`}>
            {categoryCounts.upsGirls}
          </span>
        </button>
      </div>

      {/* Action Bar & Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="छात्र का नाम, PEN, खेल खोजें..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition shrink-0"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Filters & Export */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-wrap gap-y-2">
          
          {/* Unique UDISE Code Selector Dropdown */}
          <div className="flex items-center">
            <select
              value={filterUdise}
              onChange={(e) => setFilterUdise(e.target.value)}
              title="यू-डायस कोड के अनुसार डेटा फ़िल्टर करें"
              className={`px-2.5 py-2 border rounded-xl text-xs font-bold transition focus:bg-white focus:outline-none max-w-[210px] sm:max-w-[240px] truncate ${
                filterUdise !== 'ALL'
                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              <option value="ALL">🌐 सभी यू-डायस कोड ({records.length})</option>
              {currentUdise && (
                <option value={currentUdise}>
                  🎯 {currentUdise} - {currentSchoolName || 'वर्तमान विद्यालय'} ({udiseStats.get(currentUdise)?.count || 0})
                </option>
              )}
              {uniqueUdiseList
                .filter((u) => u !== currentUdise)
                .map((u) => {
                  const info = udiseStats.get(u);
                  return (
                    <option key={u} value={u}>
                      🏫 {u} - {info?.schoolName} ({info?.count})
                    </option>
                  );
                })}
            </select>
          </div>

          {/* Filter Gender */}
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="ALL">सभी वर्ग</option>
            <option value="बालक">केवल बालक</option>
            <option value="बालिका">केवल बालिका</option>
          </select>

          {/* Filter Game */}
          {uniqueGames.length > 0 && (
            <select
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white max-w-[140px] truncate"
            >
              <option value="ALL">सभी खेल ({uniqueGames.length})</option>
              {uniqueGames.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          {/* CSV Download */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel/CSV</span>
          </button>

          {/* Print Register */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>प्रिंट</span>
          </button>
        </div>
      </div>

      {/* Unique UDISE Code Focus & Filter Status Banner */}
      {filterUdise !== 'ALL' ? (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-4 shadow-sm border border-blue-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                  UDISE: {filterUdise}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  विशिष्ट यू-डायस कोड दृश्य
                </span>
              </div>
              <p className="text-xs text-blue-100 font-semibold mt-0.5">
                {activeSchoolName || 'विद्यालय का नाम उपलब्ध'}
                {udiseStats.get(filterUdise)?.nyayPanchayat && ` • न्याय पंचायत: ${udiseStats.get(filterUdise)?.nyayPanchayat}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
            <span className="text-xs bg-amber-400 text-blue-950 px-2.5 py-1 rounded-lg font-bold shadow-xs">
              {filtered.length} प्रतिभागी दर्ज
            </span>
            <button
              onClick={() => setFilterUdise('ALL')}
              className="text-xs bg-blue-800/80 hover:bg-blue-700 text-blue-100 border border-blue-600/60 px-3 py-1 rounded-lg font-medium transition"
            >
              सभी विद्यालय दिखाएं
            </button>
          </div>
        </div>
      ) : (
        currentUdise && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-blue-800">
                🌐 वर्तमान में <b>सभी विद्यालयों ({records.length})</b> का डेटा दिख रहा है।
              </span>
            </div>
            <button
              onClick={() => setFilterUdise(currentUdise)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition self-start sm:self-auto shadow-xs"
            >
              <span>केवल वर्तमान यू-डायस ({currentUdise}) का डेटा दिखाएं</span>
            </button>
          </div>
        )
      )}

      {/* Official Register Table Replica */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-300 overflow-hidden print:border-none print:shadow-none">
        
        {/* PDF Top Official Header Replica */}
        <div className="bg-yellow-400 border-b-2 border-yellow-500 text-slate-900 text-center py-3 px-4 font-bold">
          <h2 className="text-sm sm:text-base md:text-lg uppercase tracking-wide">
            {APP_CONFIG.tournamentTitle}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
            {APP_CONFIG.subTitle} (विकास खण्ड-स्वार)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-900 mt-1 pt-1 border-t border-yellow-500/40">
            <span><b>वर्ग / स्तर:</b> प्राथमिक एवं उच्च प्राथमिक</span>
            <span>•</span>
            <span><b>खण्ड शिक्षा अधिकारी:</b> पी एल निरंकारी</span>
            <span>•</span>
            <span><b>ब्लॉक:</b> स्वार (रामपुर)</span>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto max-h-[650px] relative divide-y divide-slate-200">
          <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap">
            <thead className="bg-slate-100 sticky top-0 z-10 text-slate-800 uppercase font-black tracking-wider text-[10px] shadow-xs">
              <tr className="border-b border-slate-300">
                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-10">क्र० सं०</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-bold text-blue-900">खेल का नाम</th>
                <th className="py-2.5 px-2.5 border-r border-slate-300 text-center">वर्ग/लिंग</th>
                <th className="py-2.5 px-2.5 border-r border-slate-300 text-center font-bold text-amber-950 bg-amber-50/50">समर्पित शीट</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-mono">PEN</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-mono">यूनिक आईडी नंबर</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-bold text-slate-900">विजेता का नाम</th>
                <th className="py-2.5 px-3 border-r border-slate-300">पिता का नाम</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300">कक्षा</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-semibold">विद्यालय का नाम</th>
                <th className="py-2.5 px-2.5 border-r border-slate-300 font-mono text-center">यू-डायस कोड</th>
                <th className="py-2.5 px-2.5 border-r border-slate-300">न्याय पंचायत</th>
                <th className="py-2.5 px-2 border-r border-slate-300 text-center">प्रवेशांक</th>
                <th className="py-2.5 px-2.5 border-r border-slate-300 text-center">जन्मतिथि</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-mono">आधार नंबर</th>
                <th className="py-2.5 px-2.5 border-r border-slate-300">जन्म प्रमाण पत्र नं०</th>
                <th className="py-2.5 px-2.5 border-r border-slate-300">जारीकर्ता पद</th>
                <th className="py-2.5 px-3 border-r border-slate-300">पहचान चिन्ह</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300">दांतों की संख्या</th>
                <th className="py-2.5 px-3 border-r border-slate-300">अभिभावक का नाम</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-mono">अभिभावक मो०</th>
                <th className="py-2.5 px-3 border-r border-slate-300">प्र० अ० नाम</th>
                <th className="py-2.5 px-3 border-r border-slate-300 font-mono">प्र० अ० मो०</th>
                <th className="py-2.5 px-3 text-center print:hidden">कार्यवाही (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={24} className="text-center py-12 px-4 text-slate-400">
                    <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">
                      {filterCategory !== 'ALL' ? `शीट "${filterCategory}" में कोई प्रविष्टि नहीं मिली` :
                       filterUdise !== 'ALL'
                        ? `यू-डायस कोड ${filterUdise} (${activeSchoolName || 'विद्यालय'}) के लिए कोई प्रविष्टि नहीं मिली`
                        : 'कोई प्रविष्टि नहीं मिली'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {filterUdise !== 'ALL'
                        ? 'इस विशिष्ट यू-डायस कोड के अंतर्गत छात्रों को विभिन्न खेलों में पंजीकृत करने के लिए फॉर्म पर जाएं।'
                        : 'पंजीकरण फॉर्म भरकर छात्रों को विभिन्न खेलों में दर्ज करें'}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {filterCategory !== 'ALL' && (
                        <button
                          onClick={() => setFilterCategory('ALL')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          सभी शीट्स का डेटा देखें
                        </button>
                      )}
                      {filterUdise !== 'ALL' && (
                        <button
                          onClick={() => setFilterUdise('ALL')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          सभी विद्यालयों का डेटा देखें
                        </button>
                      )}
                      {onNavigateToForm && (
                        <button
                          onClick={onNavigateToForm}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          + पंजीकरण फॉर्म पर जाएं
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const cat = item.categorySheet || getCategorySheetName(item.level, item.gender);
                  return (
                  <tr 
                    key={item.id || index}
                    className="hover:bg-blue-50/60 transition group"
                  >
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-slate-600 bg-slate-50/50">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-blue-900 bg-blue-50/30">
                      {item.gameName}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.gender === 'बालक' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {item.gender}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-center bg-slate-50/30">
                      {cat ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block shadow-2xs ${
                          cat === 'PS BOYS' ? 'bg-sky-100 text-sky-900 border border-sky-300' :
                          cat === 'PS GIRLS' ? 'bg-pink-100 text-pink-900 border border-pink-300' :
                          cat === 'UPS BOYS' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                          'bg-purple-100 text-purple-900 border border-purple-300'
                        }`}>
                          {cat}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-700 font-semibold">
                      {item.penNumber || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-700 font-semibold">
                      {item.uniqueIdNumber || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                      {item.studentName}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                      {item.fatherName}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-semibold text-slate-700">
                      {item.studentClass}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-800">
                      {item.schoolName}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 font-mono text-center text-blue-700 font-semibold">
                      {item.udiseCode}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-slate-600">
                      {item.nyayPanchayat || '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-mono">
                      {item.admissionNumber || '—'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-center text-slate-600">
                      {item.dob || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                      {item.aadhaarNumber || '—'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-slate-600">
                      {item.birthCertNumber || '—'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-slate-600">
                      {item.birthCertAuthority || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                      {item.identificationMark || '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-amber-800">
                      {item.teethCount || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                      {item.parentNameHindi || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-700">
                      {item.parentMobile || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                      {item.headmasterName || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-700">
                      {item.headmasterMobile || '—'}
                    </td>
                    
                    {/* Action buttons (Edit loads into card and changes to Update button) */}
                    <td className="py-2 px-3 text-center print:hidden">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEditRecord(item)}
                          title="इस रिकॉर्ड को कार्ड में लोड करें और अपडेट करें"
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded flex items-center gap-1 transition shadow-xs"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>संशोधन (Edit)</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`क्या आप ${item.studentName} का रिकॉर्ड हटाना चाहते हैं?`)) {
                              onDeleteRecord(item.id || item.rowNumber || '');
                            }
                          }}
                          title="हटाएं"
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            कुल दर्ज विजेता प्रतिभागी: <b>{filtered.length}</b> {filtered.length !== records.length && `(कुल में से ${records.length})`}
          </span>
          <span className="text-[11px] text-slate-400">
            प्रत्येक खेल के लिए अलग पंक्ति (Distinct rows for each game)
          </span>
        </div>

      </div>

    </div>
  );
};
