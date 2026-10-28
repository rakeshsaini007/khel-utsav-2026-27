import React from 'react';
import { 
  User, 
  CreditCard, 
  Calendar, 
  GraduationCap, 
  Phone, 
  ShieldCheck, 
  Smile, 
  FileCheck, 
  Send, 
  RefreshCw, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { StudentRegistration } from '../types';
import { convertToHindi, filterStrictHindiOnly } from '../utils/hindiHelper';

interface StudentFormCardProps {
  formData: StudentRegistration;
  isExisting: boolean;
  isSaving: boolean;
  onInputChange: (field: keyof StudentRegistration, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export const StudentFormCard: React.FC<StudentFormCardProps> = ({
  formData,
  isExisting,
  isSaving,
  onInputChange,
  onSubmit,
  onClear,
}) => {
  // Helper for Hindi-only fields: auto-transliterates English phonetics on space and strictly filters non-Hindi on blur
  const handleHindiChange = (field: keyof StudentRegistration, val: string) => {
    // If ending with space or punctuation, transliterate completed phonetic word
    if (val.endsWith(' ') || val.endsWith('.') || val.endsWith(',')) {
      const converted = convertToHindi(val);
      onInputChange(field, filterStrictHindiOnly(converted));
    } else {
      onInputChange(field, val);
    }
  };

  const handleHindiBlur = (field: keyof StudentRegistration, val: string) => {
    // On blur, convert any phonetic Latin words and strictly enforce Devanagari Hindi only
    const converted = convertToHindi(val);
    onInputChange(field, filterStrictHindiOnly(converted));
  };
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden transition-all hover:shadow-lg">
        
        {/* Card Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isExisting 
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-amber-200' 
            : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              isExisting ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>विजेता छात्र/छात्रा का विवरण (Student & Winner Details)</span>
                {isExisting ? (
                  <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">
                    अपडेट मोड (Update Mode)
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                    नई प्रविष्टि (New Form)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                पीडीएफ रजिस्टर के निर्धारित 24 स्तंभों के अनुसार विवरण भरें
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>फ़ॉर्म साफ़ करें</span>
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* SECTION A: Primary Personal Info */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
              <User className="w-4 h-4 text-blue-600" />
              <span>क. छात्र / छात्रा का व्यक्तिगत विवरण (Personal Details)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* PEN (Permanent Education Number) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>PEN (Permanent Education Number) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                    केवल अंक (0-9)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={formData.penNumber}
                    onChange={(e) => {
                      const numericVal = e.target.value.replace(/[^0-9]/g, '');
                      onInputChange('penNumber', numericVal);
                    }}
                    placeholder="उदा. 21090503065"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* छात्र/छात्रा का यूनिक आईडी नंबर (Separate Field) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>छात्र/छात्रा का यूनिक आईडी नंबर <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                    केवल अंक (0-9)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={formData.uniqueIdNumber}
                    onChange={(e) => {
                      const numericVal = e.target.value.replace(/[^0-9]/g, '');
                      onInputChange('uniqueIdNumber', numericVal);
                    }}
                    placeholder="उदा. 984512093"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Winner Student Name - Hindi Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>विजेता का नाम <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                    केवल हिन्दी में
                  </span>
                </label>
                <input
                  type="text"
                  required
                  lang="hi"
                  value={formData.studentName}
                  onChange={(e) => handleHindiChange('studentName', e.target.value)}
                  onBlur={(e) => handleHindiBlur('studentName', e.target.value)}
                  placeholder="उदा. राहुल कुमार / सीमा (केवल हिन्दी में)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Father's Name - Hindi Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>पिता का नाम <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                    केवल हिन्दी में
                  </span>
                </label>
                <input
                  type="text"
                  required
                  lang="hi"
                  value={formData.fatherName}
                  onChange={(e) => handleHindiChange('fatherName', e.target.value)}
                  onBlur={(e) => handleHindiBlur('fatherName', e.target.value)}
                  placeholder="उदा. श्री रामेश्वर दयाल (केवल हिन्दी में)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Class - Dynamically restricted and locked for PS (Classes 1 to 5) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>कक्षा (Class) <span className="text-rose-500">*</span></span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    formData.schoolType === 'PS' || (formData.level.includes('प्राथमिक स्तर') && !formData.level.includes('उच्च'))
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                  }`}>
                    {formData.schoolType === 'PS' || (formData.level.includes('प्राथमिक स्तर') && !formData.level.includes('उच्च'))
                      ? '🔒 PS: कक्षा 1 से 5 लॉक' 
                      : '🔒 UPS: कक्षा 6 से 8 लॉक'}
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={formData.studentClass}
                    onChange={(e) => onInputChange('studentClass', e.target.value)}
                    className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    {(formData.schoolType === 'PS' || (formData.level.includes('प्राथमिक स्तर') && !formData.level.includes('उच्च'))
                      ? [1, 2, 3, 4, 5]
                      : [6, 7, 8]
                    ).map((c) => (
                      <option key={c} value={`कक्षा ${c}`}>
                        कक्षा {c} (Class {c})
                      </option>
                    ))}
                  </select>
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Admission Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>प्रवेशांक (SR / Admission No.) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                    केवल अंक (0-9)
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={formData.admissionNumber}
                  onChange={(e) => {
                    const numericVal = e.target.value.replace(/[^0-9]/g, '');
                    onInputChange('admissionNumber', numericVal);
                  }}
                  placeholder="उदा. 452"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  जन्मतिथि (Date of Birth) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => onInputChange('dob', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Aadhaar Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>आधार नंबर (Aadhaar Number)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                    (formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length === 12
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : (formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {(formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length === 12
                      ? '✓ ठीक 12 अंक पूर्ण'
                      : (formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length > 0
                        ? `⚠️ ठीक 12 अंक आवश्यक (${(formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length}/12)`
                        : 'केवल ठीक 12 अंक (Exact 12 Digits)'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9\s]*"
                    maxLength={14}
                    value={formData.aadhaarNumber}
                    onChange={(e) => {
                      // Extract only digits, strictly capped at 12 numerical digits
                      const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                      // Auto-format as 4-4-4 (e.g. 1234 5678 9012)
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                      onInputChange('aadhaarNumber', formatted);
                    }}
                    placeholder="उदा. 1234 5678 9012"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {(formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length > 0 &&
                  (formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length < 12 && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      ⚠️ आधार नंबर में ठीक 12 अंक होने चाहिए (वर्तमान में {(formData.aadhaarNumber || '').replace(/[^0-9]/g, '').length} अंक दर्ज हैं)
                    </p>
                  )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* SECTION B: Physical & Certificate Verification Details (as per official PDF) */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>ख. सत्यापन, दांतों की संख्या व जन्म प्रमाण पत्र (Verification & Teeth Count)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Birth Certificate Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  जन्म प्रमाण पत्र क्रमांक
                </label>
                <input
                  type="text"
                  value={formData.birthCertNumber}
                  onChange={(e) => onInputChange('birthCertNumber', e.target.value)}
                  placeholder="उदा. B-2015/9482"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Birth Certificate Issuing Authority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  प्रमाण पत्र जारीकर्ता का पद नाम
                </label>
                <input
                  type="text"
                  value={formData.birthCertAuthority}
                  onChange={(e) => onInputChange('birthCertAuthority', e.target.value)}
                  placeholder="उदा. ग्राम विकास अधिकारी / रजिस्ट्रार"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Identification Mark - Hindi Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>पहचान चिन्ह <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                    केवल हिन्दी में
                  </span>
                </label>
                <input
                  type="text"
                  required
                  lang="hi"
                  value={formData.identificationMark}
                  onChange={(e) => handleHindiChange('identificationMark', e.target.value)}
                  onBlur={(e) => handleHindiBlur('identificationMark', e.target.value)}
                  placeholder="उदा. दाहिने गाल पर तिल / माथे पर कट (केवल हिन्दी में)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Teeth Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>विजेता बच्चे के दांतों की संख्या</span>
                  <span className="text-[10px] text-slate-400 font-normal">शारीरिक सत्यापन</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={16}
                    max={32}
                    value={formData.teethCount}
                    onChange={(e) => onInputChange('teethCount', e.target.value)}
                    placeholder="उदा. 24 या 28"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Smile className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* SECTION C: Parent & Headmaster Contact */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>ग. अभिभावक एवं प्रधानाध्यापक विवरण (Contact Details)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Guardian Name in Hindi - Hindi Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>अभिभावक का नाम <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                    केवल हिन्दी में
                  </span>
                </label>
                <input
                  type="text"
                  required
                  lang="hi"
                  value={formData.parentNameHindi}
                  onChange={(e) => handleHindiChange('parentNameHindi', e.target.value)}
                  onBlur={(e) => handleHindiBlur('parentNameHindi', e.target.value)}
                  placeholder="उदा. रामेश्वर दयाल (केवल हिन्दी में)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Guardian Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  अभिभावक का मोबाइल नंबर <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.parentMobile}
                    onChange={(e) => onInputChange('parentMobile', e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              {/* Headmaster Name - Hindi Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>प्र० अ० का नाम <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                    केवल हिन्दी में
                  </span>
                </label>
                <input
                  type="text"
                  required
                  lang="hi"
                  value={formData.headmasterName}
                  onChange={(e) => handleHindiChange('headmasterName', e.target.value)}
                  onBlur={(e) => handleHindiBlur('headmasterName', e.target.value)}
                  placeholder="उदा. मो. अतीक / राजेश शर्मा (केवल हिन्दी में)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Headmaster Contact */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  प्र० अ० का विभागीय मोबाइल नंबर <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.headmasterMobile}
                    onChange={(e) => onInputChange('headmasterMobile', e.target.value)}
                    placeholder="उदा. 9412345678"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Card Footer Actions - Dynamic Button Change */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClear}
              className="w-1/2 sm:w-auto px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              रीसेट
            </button>

            {/* DYNAMIC BUTTON: Changes between Submit and Update */}
            <button
              type="submit"
              disabled={isSaving}
              className={`w-1/2 sm:w-auto min-w-[200px] px-6 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all transform active:scale-98 ${
                isSaving
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : isExisting
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>गूगल शीट में प्रेषित...</span>
                </>
              ) : isExisting ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>रिकॉर्ड अपडेट करें (Update)</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>विवरण सुरक्षित करें (Submit)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </form>
  );
};
