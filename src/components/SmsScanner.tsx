import { useState, useEffect } from 'react';
import { AppData, SmsPattern } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, Shield, CheckCircle, XCircle, Search, Loader2, Clipboard, Smartphone } from 'lucide-react';

interface Props {
  data: AppData;
  onComplete: () => void;
  onUpdate: (newData: AppData) => void;
}

type ScanStep = 'request' | 'reading' | 'analyzing' | 'results';

export default function SmsScanner({ data, onComplete, onUpdate }: Props) {
  const [step, setStep] = useState<ScanStep>('request');
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [pastedMessages, setPastedMessages] = useState('');
  const [detectedPatterns, setDetectedPatterns] = useState<SmsPattern[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleRequestPermission = async () => {
    setPermissionGranted(true);
    setStep('reading');
    setScanPhase('در حال دسترسی به پیامک‌های گوشی...');
    
    // Simulate reading process
    setTimeout(() => {
      setScanPhase('خواندن پیامک‌های بانکی...');
      setProgress(30);
    }, 1000);
    
    setTimeout(() => {
      setScanPhase('تحلیل محتوای پیامک‌ها...');
      setProgress(60);
    }, 2000);
    
    setTimeout(() => {
      setScanPhase('استخراج الگوهای بانکی...');
      setProgress(90);
    }, 3000);
    
    setTimeout(() => {
      setStep('analyzing');
      setProgress(100);
    }, 4000);
  };

  const handlePasteMessages = () => {
    if (!pastedMessages.trim()) return;
    
    // Parse pasted messages and extract patterns
    const lines = pastedMessages.split('\n').filter(line => line.trim());
    const patterns: SmsPattern[] = [];
    
    lines.forEach(line => {
      // Detect bank name from message
      const bankPatterns = [
        { regex: /ملت/i, name: 'بانک ملت', sender: 'Bank_Mellat' },
        { regex: /ملی/i, name: 'بانک ملی', sender: 'Bank_Melli' },
        { regex: /صادرات/i, name: 'بانک صادرات', sender: 'Bank_Saderat' },
        { regex: /پاسارگاد/i, name: 'بانک پاسارگاد', sender: 'Bank_Pasargad' },
        { regex: /سامان/i, name: 'بانک سامان', sender: 'Bank_Saman' },
        { regex: /تجارت/i, name: 'بانک تجارت', sender: 'Bank_Tejarat' },
        { regex: /رفاه/i, name: 'بانک رفاه', sender: 'Bank_Refah' },
        { regex: /آینده/i, name: 'بانک آینده', sender: 'Bank_Ayandeh' },
      ];
      
      const detectedBank = bankPatterns.find(bp => bp.regex.test(line));
      
      if (detectedBank) {
        // Extract amount
        const amountMatch = line.match(/([\d,]+)\s*ریال/);
        const amount = amountMatch ? amountMatch[1] : '0';
        
        // Determine transaction type
        const isCredit = /واریز|دریافت|حقوق/i.test(line);
        const isDebit = /برداشت|خرید|پرداخت|انتقال/i.test(line);
        
        const pattern: SmsPattern = {
          id: uuidv4(),
          bankName: detectedBank.name,
          sender: detectedBank.sender,
          pattern: line,
          sampleMessage: line,
          amountRegex: '([\\d,]+)\\s*ریال',
          type: isCredit ? 'credit' : isDebit ? 'debit' : 'both',
          approved: false,
          createdAt: new Date().toISOString(),
        };
        
        patterns.push(pattern);
      }
    });
    
    setDetectedPatterns(patterns);
    setStep('results');
  };

  const handleApprove = (patternId: string) => {
    const updated: AppData = {
      ...data,
      smsPatterns: data.smsPatterns.map((p: SmsPattern) =>
        p.id === patternId ? { ...p, approved: true } : p
      ),
    };
    onUpdate(updated);
  };

  const handleReject = (patternId: string) => {
    const updated: AppData = {
      ...data,
      smsPatterns: data.smsPatterns.filter((p: SmsPattern) => p.id !== patternId),
    };
    onUpdate(updated);
  };

  const handleApproveAll = () => {
    const updated: AppData = {
      ...data,
      smsPatterns: [
        ...data.smsPatterns,
        ...detectedPatterns.map((p: SmsPattern) => ({ ...p, approved: true }))
      ],
    };
    onUpdate(updated);
    setDetectedPatterns([]);
  };

  const approvedCount = data.smsPatterns.filter(p => p.approved).length;

  if (step === 'request') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col" dir="rtl">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                <Shield size={48} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-3">دسترسی به پیامک‌ها</h1>
              <p className="text-gray-400 leading-relaxed">
                برای شناسایی خودکار تراکنش‌های بانکی، نیاز به دسترسی به پیامک‌های گوشی شما داریم.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                🔒 اطلاعات شما کاملاً محرمانه و فقط در دستگاه شما ذخیره می‌شود.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">خواندن پیامک‌های بانکی</h3>
                  <p className="text-sm text-gray-400">شناسایی الگوهای پیامکی بانک‌های مختلف</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">ثبت خودکار تراکنش‌ها</h3>
                  <p className="text-sm text-gray-400">تشخیص واریز و برداشت‌ها به صورت هوشمند</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">یادگیری الگوها</h3>
                  <p className="text-sm text-gray-400">یادگیری فرمت پیامک‌های بانک شما برای دفعات بعد</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRequestPermission}
              className="w-full py-4 bg-gradient-to-l from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              اجازه دسترسی به پیامک‌ها
            </button>

            <p className="text-center text-xs text-gray-500">
              با کلیک روی دکمه بالا، شما با شرایط استفاده از برنامه موافقت می‌کنید.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reading' || step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col" dir="rtl">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-purple-500/30 flex items-center justify-center mx-auto">
                <div className="w-24 h-24 rounded-full border-4 border-t-emerald-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <MessageSquare size={32} className="text-emerald-400 animate-pulse" />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">{step === 'reading' ? 'در حال خواندن پیامک‌ها' : 'در حال تحلیل الگوها'}</h2>
              <p className="text-gray-400 text-sm">{scanPhase}</p>
            </div>
            
            <div className="w-full max-w-xs mx-auto">
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

            <div className="grid grid-cols-3 gap-4 text-center">
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
        </div>
      </div>
    );
  }

  // Results step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col" dir="rtl">
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

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">پیامک‌های بانکی خود را وارد کنید</h2>
          <p className="text-gray-400 text-sm">
            پیامک‌های بانکی خود را paste کنید تا الگوها شناسایی شوند
          </p>
        </div>

        {/* Paste Area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <label className="block">
            <span className="text-sm text-gray-400 mb-2 block">پیامک‌های بانکی (هر پیامک در یک خط)</span>
            <textarea
              value={pastedMessages}
              onChange={(e) => setPastedMessages(e.target.value)}
              className="w-full h-48 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none font-mono text-sm"
              placeholder={`مثال:\nواریز 50,000,000 ریال به حساب شما از حقوق ماهانه\nبرداشت 2,500,000 ریال از حساب شما بابت خرید از دیجی‌کالا\nپرداخت قبض برق به مبلغ 850,000 ریال`}
              dir="rtl"
            />
          </label>
          
          <button
            onClick={handlePasteMessages}
            disabled={!pastedMessages.trim()}
            className="w-full py-3 bg-gradient-to-l from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Clipboard size={18} />
            تحلیل پیامک‌ها
          </button>
        </div>

        {/* Detected Patterns */}
        {detectedPatterns.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">الگوهای شناسایی‌شده</h3>
              <span className="text-sm text-gray-400">{detectedPatterns.length} الگو</span>
            </div>

            <div className="space-y-3">
              {detectedPatterns.map(pattern => (
                <div key={pattern.id} className="bg-white/5 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{pattern.bankName}</h4>
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono" dir="ltr">
                        📱 {pattern.sender}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      pattern.type === 'credit' ? 'bg-emerald-500/20 text-emerald-300' :
                      pattern.type === 'debit' ? 'bg-red-500/20 text-red-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {pattern.type === 'credit' ? 'واریز' : pattern.type === 'debit' ? 'برداشت' : 'هر دو'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 bg-black/20 rounded-lg p-2">{pattern.sampleMessage}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleApproveAll}
              className="w-full py-3 bg-emerald-500/20 text-emerald-300 font-bold rounded-xl hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              تأیید همه الگوها
            </button>
          </div>
        )}

        {/* Existing Patterns */}
        {data.smsPatterns.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">الگوهای قبلی</h3>
              <span className="text-sm text-gray-400">
                {approvedCount} از {data.smsPatterns.length} تأیید شده
              </span>
            </div>

            <div className="space-y-3">
              {data.smsPatterns.map((pattern: SmsPattern) => (
                <div
                  key={pattern.id}
                  className={`bg-white/5 border rounded-xl p-4 transition-all ${
                    pattern.approved
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{pattern.bankName}</h4>
                        <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono" dir="ltr">
                          📱 {pattern.sender}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
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
                  
                  <div className="bg-black/20 rounded-lg p-2 mb-2">
                    <p className="text-xs text-gray-400 mb-1">الگو:</p>
                    <p className="text-sm text-cyan-300">{pattern.pattern}</p>
                  </div>

                  {!pattern.approved && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(pattern.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm"
                      >
                        <CheckCircle size={16} /> تأیید
                      </button>
                      <button
                        onClick={() => handleReject(pattern.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-300 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        <XCircle size={16} /> رد
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onComplete}
          className="w-full py-4 bg-gradient-to-l from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
        >
          ادامه و ورود به برنامه
        </button>
      </main>
    </div>
  );
}
