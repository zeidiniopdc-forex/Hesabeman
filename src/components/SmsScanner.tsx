import { useState, useEffect } from 'react';
import { AppData } from '../types';
import { MessageSquare, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';

interface Props {
  data: AppData;
  onComplete: () => void;
  onUpdate: (data: AppData) => void;
}

export default function SmsScanner({ data, onComplete, onUpdate }: Props) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const phases = [
      'در حال دسترسی به پیامک‌ها...',
      'اسکن پیامک‌های بانکی...',
      'تحلیل الگوهای پیامکی...',
      'شناسایی بانک‌ها...',
      'استخراج الگوهای تراکنش...',
      'نهایی‌سازی نتایج...',
    ];
    
    let phaseIndex = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setScanning(false);
          setShowResults(true);
          return 100;
        }
        return next;
      });
      
      if (phaseIndex < phases.length - 1 && progress < (phaseIndex + 1) * 18) {
        phaseIndex++;
        setScanPhase(phases[phaseIndex]);
      }
    }, 80);

    setScanPhase(phases[0]);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (patternId: string) => {
    const updated = {
      ...data,
      smsPatterns: data.smsPatterns.map(p =>
        p.id === patternId ? { ...p, approved: true } : p
      ),
    };
    onUpdate(updated);
  };

  const handleReject = (patternId: string) => {
    const updated = {
      ...data,
      smsPatterns: data.smsPatterns.filter(p => p.id !== patternId),
    };
    onUpdate(updated);
  };

  const handleApproveAll = () => {
    const updated = {
      ...data,
      smsPatterns: data.smsPatterns.map(p => ({ ...p, approved: true })),
    };
    onUpdate(updated);
  };

  const approvedCount = data.smsPatterns.filter(p => p.approved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            💰
          </div>
          <div>
            <h1 className="text-lg font-bold">حسابدار من</h1>
            <p className="text-xs text-gray-400">راه‌اندازی اولیه</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {scanning ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-t-emerald-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <MessageSquare size={32} className="text-emerald-400 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-2">اسکن پیامک‌های بانکی</h2>
            <p className="text-gray-400 text-sm text-center mb-6">{scanPhase}</p>
            
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">پیشرفت</span>
                <span className="text-emerald-400">{progress}٪</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-emerald-400 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-2xl font-bold text-emerald-400">{Math.floor(progress * 2.4)}</p>
                <p className="text-xs text-gray-400">پیامک بررسی‌شده</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-2xl font-bold text-cyan-400">{Math.floor(progress / 18)}</p>
                <p className="text-xs text-gray-400">بانک شناسایی‌شده</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-2xl font-bold text-purple-400">{Math.floor(progress / 15)}</p>
                <p className="text-xs text-gray-400">الگوی استخراج‌شده</p>
              </div>
            </div>
          </div>
        ) : showResults ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">اسکن کامل شد!</h2>
              <p className="text-gray-400">
                {data.smsPatterns.length} الگوی پیامکی بانکی شناسایی شد.
                <br />
                لطفاً هر الگو را بررسی و تأیید کنید.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {approvedCount} از {data.smsPatterns.length} تأیید شده
              </span>
              <button
                onClick={handleApproveAll}
                className="text-sm bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors"
              >
                تأیید همه
              </button>
            </div>

            <div className="space-y-3">
              {data.smsPatterns.map(pattern => (
                <div
                  key={pattern.id}
                  className={`bg-white/5 border rounded-2xl p-4 transition-all ${
                    pattern.approved
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-sm">{pattern.bankName}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        pattern.type === 'credit' ? 'bg-emerald-500/20 text-emerald-300' :
                        pattern.type === 'debit' ? 'bg-red-500/20 text-red-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {pattern.type === 'credit' ? 'واریز' : pattern.type === 'debit' ? 'برداشت' : 'هر دو'}
                      </span>
                    </div>
                    {pattern.approved && (
                      <CheckCircle size={20} className="text-emerald-400" />
                    )}
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-400 mb-1">نمونه پیام:</p>
                    <p className="text-sm text-gray-200 font-mono" dir="ltr">{pattern.sampleMessage}</p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-400 mb-1">الگوی شناسایی:</p>
                    <p className="text-sm text-cyan-300">{pattern.pattern}</p>
                  </div>

                  {!pattern.approved && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(pattern.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm"
                      >
                        <CheckCircle size={16} />
                        تأیید
                      </button>
                      <button
                        onClick={() => handleReject(pattern.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-300 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        <XCircle size={16} />
                        رد
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={onComplete}
              className="w-full py-4 bg-gradient-to-l from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
            >
              ادامه و ورود به برنامه
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
