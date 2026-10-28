import React from 'react';
import { CheckCircle2, RefreshCw, X, FileSpreadsheet, PlusCircle, ExternalLink } from 'lucide-react';
import { StudentRegistration } from '../types';

interface AlertModalProps {
  isOpen: boolean;
  action: 'saved' | 'updated' | null;
  message: string;
  record: StudentRegistration | null;
  isLive: boolean;
  onClose: () => void;
  onViewSheet: () => void;
  onRegisterNext: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  action,
  message,
  record,
  isLive,
  onClose,
  onViewSheet,
  onRegisterNext,
}) => {
  if (!isOpen || !record) return null;

  const isUpdate = action === 'updated';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Top celebratory banner */}
        <div className={`p-6 text-center text-white relative ${
          isUpdate 
            ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700' 
            : 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700'
        }`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
            {isUpdate ? (
              <RefreshCw className="w-9 h-9 text-white animate-spin-once" />
            ) : (
              <CheckCircle2 className="w-9 h-9 text-white" />
            )}
          </div>

          <span className="inline-block text-xs uppercase font-extrabold tracking-widest bg-black/20 px-3 py-1 rounded-full mb-1">
            {isLive ? 'गूगल शीट रियल-टाइम सिंक' : 'सिस्टम अलर्ट'}
          </span>

          <h3 className="text-xl font-black tracking-tight">
            {isUpdate ? 'डेटा सफलतापूर्वक अपडेट हुआ!' : 'डेटा सफलतापूर्वक सुरक्षित हुआ!'}
          </h3>
          <p className="text-sm text-white/90 mt-1">
            {message}
          </p>
        </div>

        {/* Details Card */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">खेल का नाम (Game):</span>
              <span className="font-bold text-slate-800 text-sm">{record.gameName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">वर्ग / लिंग:</span>
              <span className="font-semibold text-slate-700">{record.level} • {record.gender}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">विजेता छात्र/छात्रा:</span>
              <span className="font-bold text-blue-900">{record.studentName} (कक्षा {record.studentClass})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">विद्यालय (School):</span>
              <span className="font-semibold text-slate-700 truncate max-w-[240px]">{record.schoolName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">यू-डायस कोड:</span>
              <span className="font-mono font-bold text-slate-800">{record.udiseCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">PEN / यूनिक आईडी:</span>
              <span className="font-mono font-semibold text-slate-700">
                {record.penNumber || '—'} | {record.uniqueIdNumber || '—'}
              </span>
            </div>
            {record.rowNumber && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">शीट पंक्ति संख्या (Sheet Row):</span>
                <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  Row #{record.rowNumber}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 text-center">
            {isLive ? (
              <span className="text-emerald-700 font-medium">
                ✓ Google Sheet में यह प्रविष्टि विशिष्ट पंक्ति के रूप में अपडेट हो चुकी है।
              </span>
            ) : (
              <span className="text-blue-700 font-medium">
                ✓ प्रविष्टि दर्ज हो गई है। लाइव गूगल शीट में भेजने के लिए config.ts में GAS URL दर्ज करें।
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onRegisterNext}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नया छात्र भरें</span>
            </button>

            <button
              onClick={onViewSheet}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>शीट रजिस्टर देखें</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
