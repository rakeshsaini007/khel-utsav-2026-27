import React, { useState, useEffect } from 'react';
import { Search, School, MapPin, Building2, Check } from 'lucide-react';
import { SchoolInfo } from '../data/schools';

interface SchoolSearchCardProps {
  udiseCode: string;
  schoolName: string;
  nyayPanchayat: string;
  schoolType: string;
  schools: SchoolInfo[];
  isLiveMaster?: boolean;
  isLoadingSchools?: boolean;
  onRefreshSchools?: () => void;
  onSchoolSelect: (school: SchoolInfo) => void;
  onManualChange: (field: string, val: string) => void;
  onClearSchool?: () => void;
  isFormOpened?: boolean;
}

export const SchoolSearchCard: React.FC<SchoolSearchCardProps> = ({
  udiseCode,
  schoolName,
  nyayPanchayat,
  schoolType,
  schools,
  isLiveMaster = false,
  isLoadingSchools = false,
  onRefreshSchools,
  onSchoolSelect,
  onManualChange,
  onClearSchool,
  isFormOpened = false,
}) => {
  const [query, setQuery] = useState(udiseCode || '');
  const [suggestions, setSuggestions] = useState<SchoolInfo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    setQuery(udiseCode || '');
  }, [udiseCode]);

  const activeSchools = schools && schools.length > 0 ? schools : [];

  const handleInputChange = (val: string) => {
    const clean = val.trim();
    setQuery(clean);
    onManualChange('udiseCode', clean);

    if (clean.length === 0) {
      if (onClearSchool) {
        onClearSchool();
      } else {
        onManualChange('udiseCode', '');
        onManualChange('schoolName', '');
        onManualChange('nyayPanchayat', '');
        onManualChange('schoolType', '');
      }
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (clean.length >= 2) {
      const matches = activeSchools.filter(s =>
        s.udiseCode.includes(clean) ||
        s.schoolName.toLowerCase().includes(clean.toLowerCase()) ||
        s.nyayPanchayat.toLowerCase().includes(clean.toLowerCase())
      );
      setSuggestions(matches);
      setShowDropdown(matches.length > 0);

      // Exact 11-digit or full match auto-populate from School_Master
      const exactMatch = activeSchools.find(s => s.udiseCode === clean);
      if (exactMatch) {
        onSchoolSelect(exactMatch);
        setShowDropdown(false);
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (school: SchoolInfo) => {
    setQuery(school.udiseCode);
    setShowDropdown(false);
    onSchoolSelect(school);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-5 transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>विद्यालय एवं यू-डायस चयन (School & UDISE Search)</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {schoolName && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> सत्यापित
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
        {/* Search Input for UDISE Code */}
        <div className="md:col-span-4 relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            यू-डायस कोड (UDISE Code) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="उदा. 09050306501"
              maxLength={11}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition tracking-wider"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            {query && (
              <button
                type="button"
                onClick={() => handleInputChange('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
              {suggestions.map((item) => (
                <div
                  key={item.udiseCode}
                  onClick={() => handleSelect(item)}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer text-left transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.schoolName}</p>
                    <p className="text-[11px] text-slate-500">
                      UDISE: <span className="font-mono text-blue-700 font-semibold">{item.udiseCode}</span> • {item.nyayPanchayat}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    item.schoolType === 'PS' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {item.schoolType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-populated School Name */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            विद्यालय का नाम (School Name) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={schoolName}
              readOnly={!isCustomMode}
              onChange={(e) => onManualChange('schoolName', e.target.value)}
              placeholder="UDISE भरते ही स्वतः आएगा"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isCustomMode
                  ? 'bg-white border border-blue-400 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-800 cursor-not-allowed'
              }`}
            />
            <School className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Auto-populated Nyay Panchayat */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            न्याय पंचायत (Nyay Panchayat)
          </label>
          <div className="relative">
            <input
              type="text"
              value={nyayPanchayat}
              readOnly={!isCustomMode}
              onChange={(e) => onManualChange('nyayPanchayat', e.target.value)}
              placeholder="उदा. SHADINAGAR HAJIRA"
              className={`w-full pl-8 pr-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isCustomMode
                  ? 'bg-white border border-blue-400 text-slate-900'
                  : 'bg-slate-100 border border-slate-200 text-slate-700'
              }`}
            />
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
          </div>
        </div>

        {/* FIELD: विद्यालय प्रकार (School Type) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>विद्यालय प्रकार <span className="text-rose-500">*</span></span>
            {schoolType === 'PS' && (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1 py-0.2 rounded">
                1 से 5
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={schoolType ? (schoolType === 'PS' ? 'PS (प्राथमिक)' : schoolType === 'UPS' ? 'UPS (उच्च प्रा०)' : schoolType) : ''}
              readOnly={!isCustomMode}
              onChange={(e) => onManualChange('schoolType', e.target.value.toUpperCase())}
              placeholder="PS / UPS"
              className={`w-full pl-8 pr-2 py-2.5 rounded-xl text-xs font-bold transition ${
                schoolType === 'PS'
                  ? 'bg-amber-50 border border-amber-300 text-amber-900'
                  : schoolType === 'UPS'
                  ? 'bg-indigo-50 border border-indigo-300 text-indigo-900'
                  : 'bg-slate-100 border border-slate-200 text-slate-800'
              } ${!isCustomMode ? 'cursor-not-allowed' : ''}`}
            />
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Dynamic guidance and status bar */}
      {!isFormOpened ? (
        <div className="mt-4 p-3.5 bg-blue-50/90 border border-blue-200/90 rounded-xl flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-blue-900 text-xs sm:text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
            <span>
              👉 कृपया विद्यालय का <b>11-अंकीय यू-डायस कोड</b> दर्ज करें। UDISE दर्ज होते ही पूरा पंजीकरण फॉर्म खुल जाएगा।
            </span>
          </div>
          {query.trim().length >= 10 && (
            <button
              type="button"
              onClick={() => {
                const match = activeSchools.find(s => s.udiseCode === query.trim());
                if (match) {
                  onSchoolSelect(match);
                } else {
                  onManualChange('udiseCode', query.trim());
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              फॉर्म खोलें (Open Form) →
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-emerald-900 text-xs sm:text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
            <span>
              ✓ यू-डायस कोड {udiseCode} सत्यापित ({schoolName || 'विद्यालय'}) — खेल व छात्र विवरण फॉर्म खुला हुआ है
            </span>
          </div>
          {onClearSchool && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onClearSchool();
              }}
              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition shadow-xs"
            >
              ✕ विद्यालय बदलें / नया UDISE भरें
            </button>
          )}
        </div>
      )}
    </div>
  );
};
