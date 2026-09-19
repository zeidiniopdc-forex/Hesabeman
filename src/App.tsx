import { useState, useEffect } from 'react';
import { AppData, TabType } from './types';
import { getInitialData, saveData } from './store';
import { ThemeProvider, useTheme } from './ThemeContext';
import Dashboard from './components/Dashboard';
import SmsPatterns from './components/SmsPatterns';
import SmsScanner from './components/SmsScanner';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Debts from './components/Debts';
import Budget from './components/Budget';
import { LayoutDashboard, MessageSquare, CreditCard, ArrowLeftRight, Users, PieChart, Bell, Sun, Moon } from 'lucide-react';

function AppContent() {
  const [data, setData] = useState<AppData>(getInitialData);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showScanner, setShowScanner] = useState(!data.hasScannedSms);
  const [alerts, setAlerts] = useState<string[]>([]);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    // Check budget alerts
    const newAlerts: string[] = [];
    data.budgets.forEach(budget => {
      budget.categories.forEach(cat => {
        const percentage = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
        if (percentage >= 100) {
          newAlerts.push(`⚠️ بودجه "${cat.name}" به سقف رسیده! (${cat.spent.toLocaleString('fa-IR')} از ${cat.limit.toLocaleString('fa-IR')} ریال)`);
        } else if (percentage >= 80) {
          newAlerts.push(`🔶 بودجه "${cat.name}" به ۸۰٪ سقف رسیده!`);
        }
      });
      const totalPercentage = budget.totalBudget > 0 ? (budget.totalSpent / budget.totalBudget) * 100 : 0;
      if (totalPercentage >= 90) {
        newAlerts.push(`🚨 مجموع هزینه‌ها به ۹۰٪ بودجه کل رسیده!`);
      }
    });
    setAlerts(newAlerts);
  }, [data.budgets]);

  const handleScanComplete = () => {
    setData(prev => ({ ...prev, hasScannedSms: true }));
    setShowScanner(false);
  };

  const updateData = (newData: AppData) => {
    setData(newData);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setData(prev => ({ ...prev, theme: theme === 'dark' ? 'light' : 'dark' }));
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard size={20} /> },
    { id: 'sms', label: 'پیامک‌ها', icon: <MessageSquare size={20} /> },
    { id: 'accounts', label: 'حساب‌ها', icon: <CreditCard size={20} /> },
    { id: 'transactions', label: 'تراکنش‌ها', icon: <ArrowLeftRight size={20} /> },
    { id: 'debts', label: 'طلب و بدهی', icon: <Users size={20} /> },
    { id: 'budget', label: 'بودجه', icon: <PieChart size={20} /> },
  ];

  const isDark = theme === 'dark';

  if (showScanner) {
    return <SmsScanner data={data} onComplete={handleScanComplete} onUpdate={updateData} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 text-gray-900'
    }`} dir="rtl">
      {/* Header */}
      <header className={`${isDark ? 'bg-black/30 border-white/10' : 'bg-white/80 border-gray-200'} backdrop-blur-md border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-lg font-bold">
              💰
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-l from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                حسابدار من
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>مدیریت مالی هوشمند</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
                  : 'bg-indigo-500/20 text-indigo-600 hover:bg-indigo-500/30'
              }`}
              title={isDark ? 'تم روشن' : 'تم تاریک'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {alerts.length > 0 && (
              <div className="relative group">
                <button className={`relative p-2 rounded-lg transition-colors ${
                  isDark ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}>
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {alerts.length}
                  </span>
                </button>
                <div className={`absolute left-0 top-full mt-2 w-80 rounded-xl shadow-2xl border p-4 hidden group-hover:block z-50 ${
                  isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-red-300' : 'text-red-600'}`}>هشدارهای بودجه</h3>
                  {alerts.map((alert, i) => (
                    <p key={i} className={`text-sm mb-2 border-b pb-2 last:border-0 ${isDark ? 'text-gray-300 border-white/5' : 'text-gray-700 border-gray-100'}`}>{alert}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'dashboard' && <Dashboard data={data} onUpdate={updateData} />}
        {activeTab === 'sms' && <SmsPatterns data={data} onUpdate={updateData} />}
        {activeTab === 'accounts' && <Accounts data={data} onUpdate={updateData} />}
        {activeTab === 'transactions' && <Transactions data={data} onUpdate={updateData} />}
        {activeTab === 'debts' && <Debts data={data} onUpdate={updateData} />}
        {activeTab === 'budget' && <Budget data={data} onUpdate={updateData} />}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t z-50 ${
        isDark ? 'bg-black/50 border-white/10' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around items-center py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-gradient-to-t from-emerald-500/30 to-cyan-500/20 text-emerald-300 scale-105'
                      : 'bg-gradient-to-t from-emerald-100 to-cyan-50 text-emerald-700 scale-105'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const data = getInitialData();
  return (
    <ThemeProvider initialTheme={data.theme}>
      <AppContent />
    </ThemeProvider>
  );
}
