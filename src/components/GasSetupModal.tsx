import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  FileSpreadsheet, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Key,
  HelpCircle,
  Layers,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_URL } from '../config';
import { isPlaceholderUrl, triggerSyncCategories } from '../services/apiService';

interface GasSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasSetupModal: React.FC<GasSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  if (!isOpen) return null;

  const isPlaceholder = isPlaceholderUrl();

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/code.js');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleTestConnection = async () => {
    if (isPlaceholder) {
      setTestStatus('error');
      setTestMessage('कृपया पहले src/config.ts में अपना वास्तविक डिप्लॉयमेंट URL दर्ज करें।');
      return;
    }

    setTestStatus('testing');
    setTestMessage('कनेक्शन की जांच की जा रही है...');

    try {
      const url = new URL(GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.set('action', 'ping');

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setTestStatus('success');
        setTestMessage(data.message || 'गूगल ऐप्स स्क्रिप्ट सफलतापूर्वक कनेक्ट हो गया!');
      } else {
        setTestStatus('error');
        setTestMessage(`सर्वर से त्रुटि प्रतिक्रिया मिली (Status: ${res.status})। सुनिश्चित करें कि Who has access = Anyone चुना गया है।`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage('कनेक्ट नहीं हो सका। सुनिश्चित करें कि आपने "Web App" के रूप में डिप्लॉय किया है और "Who has access" में "Anyone" चुना है।');
    }
  };

  const handleSyncCategorySheets = async () => {
    if (isPlaceholder) {
      setSyncStatus('error');
      setSyncMessage('कृपया पहले src/config.ts में अपना लाइव Google Apps Script URL दर्ज करें।');
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('सभी 4 शीट्स (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS) में पूर्व दर्ज रिकॉर्ड्स सिंक किए जा रहे हैं...');

    try {
      const result = await triggerSyncCategories();
      if (result.success) {
        setSyncStatus('success');
        setSyncMessage(result.message || 'सभी 4 श्रेणी शीट्स में डेटा सफलतापूर्वक सिंक हो गया!');
      } else {
        setSyncStatus('error');
        setSyncMessage(result.message || 'सिंक करने में त्रुटि आई।');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage('सिंक अनुरोध विफल रहा: ' + (err.message || 'अज्ञात त्रुटि'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full my-8 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">गूगल ऐप्स स्क्रिप्ट सेटअप निर्देश</h3>
              <p className="text-xs text-blue-200">
                फ़ाइल <span className="font-mono bg-blue-950 px-1.5 py-0.5 rounded text-amber-300">code.js</span> एवं <span className="font-mono bg-blue-950 px-1.5 py-0.5 rounded text-amber-300">src/config.ts</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-800 text-xs">
          
          {/* Target File Highlight */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-950 text-sm">
                  URL दर्ज करने हेतु निर्दिष्ट फ़ाइल (Specified File):
                </h4>
                <p className="text-blue-900 mt-1">
                  Google Apps Script को Deploy करने के बाद प्राप्त Web App URL को निम्नलिखित फ़ाइल में दर्ज करें:
                </p>
                <div className="mt-2 p-2 bg-slate-900 text-amber-300 rounded-lg font-mono text-xs select-all flex items-center justify-between">
                  <span>/src/config.ts</span>
                  <span className="text-slate-400 text-[10px]">GOOGLE_APPS_SCRIPT_URL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Config Status */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">वर्तमान में कॉन्फ़िगर किया गया URL:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isPlaceholder ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isPlaceholder ? 'डिफ़ॉल्ट / प्लेसहोल्डर' : 'सक्रिय (Live)'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700 break-all border border-slate-200">
              {GOOGLE_APPS_SCRIPT_URL}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>कनेक्शन टेस्ट करें (Test Connection)</span>
              </button>
            </div>

            {testStatus !== 'idle' && (
              <div className={`p-3 rounded-xl flex items-start space-x-2 text-xs ${
                testStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                testStatus === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* 4 Dedicated Category Sheets Auto-Copy Highlight */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl space-y-3">
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <span>4 समर्पित शीट्स में स्वतः प्रतिलिपि (4 Category Sheets Auto-Routing):</span>
                </h4>
                <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                  फॉर्म सबमिट होते ही मुख्य शीट के साथ-साथ रिकॉर्ड स्वतः संबंधित शीट टैब में कॉपी/अपडेट हो जाता है:
                </p>
              </div>
            </div>

            {/* Grid of the 4 sheets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-white/90 rounded-xl border border-sky-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="font-mono font-black text-sky-800 text-xs">PS BOYS</div>
                  <div className="text-[10px] text-slate-600">प्राथमिक स्तर + बालक</div>
                </div>
                <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">Auto-Copy</span>
              </div>

              <div className="p-2.5 bg-white/90 rounded-xl border border-pink-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="font-mono font-black text-pink-800 text-xs">PS GIRLS</div>
                  <div className="text-[10px] text-slate-600">प्राथमिक स्तर + बालिका</div>
                </div>
                <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-bold">Auto-Copy</span>
              </div>

              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="font-mono font-black text-indigo-800 text-xs">UPS BOYS</div>
                  <div className="text-[10px] text-slate-600">उच्च प्राथमिक स्तर + बालक</div>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Auto-Copy</span>
              </div>

              <div className="p-2.5 bg-white/90 rounded-xl border border-purple-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="font-mono font-black text-purple-800 text-xs">UPS GIRLS</div>
                  <div className="text-[10px] text-slate-600">उच्च प्राथमिक स्तर + बालिका</div>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">Auto-Copy</span>
              </div>
            </div>

            {/* Resync button for existing records */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-amber-200/80">
              <span className="text-[11px] text-amber-900/90 font-medium">
                क्या मुख्य शीट में पहले से डेटा मौजूद है?
              </span>
              <button
                onClick={handleSyncCategorySheets}
                disabled={syncStatus === 'syncing'}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition shadow-2xs self-start sm:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>सभी 4 शीट्स में सिंक करें (Resync All)</span>
              </button>
            </div>

            {syncStatus !== 'idle' && (
              <div className={`p-2.5 rounded-xl flex items-start space-x-2 text-xs ${
                syncStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                syncStatus === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {syncStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {syncStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <span>{syncMessage}</span>
              </div>
            )}
          </div>

          {/* School_Master Integration Note */}
          <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start space-x-2 text-indigo-950 text-xs">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Google Sheet "School_Master" ऑटो-सिंक सक्रिय है:</p>
              <p className="text-[11px] text-indigo-900/90 mt-0.5">
                आपकी गूगल शीट में <span className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200 font-bold">School_Master</span> टैब से UDISE कोड, विद्यालय का नाम, न्याय पंचायत और स्कूल प्रकार स्वतः लोड होते हैं। यदि यह टैब नहीं बना है, तो स्क्रिप्ट इसे पहले अनुरोध पर स्वतः बना देती है।
              </p>
            </div>
          </div>

          {/* 4 Steps to Deploy */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>गूगल शीट में सेटअप करने के 4 आसान चरण (4 Easy Steps):</span>
            </h4>

            <ol className="space-y-2 text-slate-700 list-decimal list-inside pl-1 leading-relaxed">
              <li className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <b>गूगल शीट बनाएं:</b> ब्राउज़र में <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> खोलें।
              </li>
              <li className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <b>Apps Script खोलें:</b> मेनू में <b>Extensions (एक्सटेंशन)</b> &gt; <b>Apps Script</b> पर क्लिक करें।
              </li>
              <li className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <b>कोड पेस्ट करें:</b> नीचे दिए गए बटन पर क्लिक करके <span className="font-mono font-bold text-blue-700">code.js</span> की पूरी कोडिंग कॉपी करें और Apps Script संपादक में पेस्ट कर <b>Save (Ctrl+S)</b> करें।
              </li>
              <li className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <b>वेब ऐप डिप्लॉय करें:</b> ऊपर <b>Deploy</b> &gt; <b>New deployment</b> &gt; Select type: <b>Web app</b> चुनें।
                <div className="mt-1 pl-4 text-slate-600 text-[11px]">
                  • Execute as: <b>Me</b><br />
                  • Who has access: <b className="text-amber-800">Anyone</b> (अति महत्वपूर्ण)<br />
                  • <b>Deploy</b> दबाएं और प्राप्त Web App URL को कॉपी कर <span className="font-mono text-blue-700 font-bold">src/config.ts</span> में पेस्ट करें।
                </div>
              </li>
            </ol>
          </div>

          {/* 1-Click Copy code.js button */}
          <div className="pt-2">
            <button
              onClick={handleCopyCode}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-md transition"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-emerald-950" />
                  <span>code.js कोड क्लिपबोर्ड पर कॉपी हो गया! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>code.js का पूरा कोड कॉपी करें (Copy code.js)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
