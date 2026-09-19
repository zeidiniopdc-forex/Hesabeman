import { AppData } from '../types';
import { formatAmount } from '../store';
import { useTheme } from '../ThemeContext';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function Dashboard({ data, onUpdate }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const totalBalance = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalReceivable = data.debts
    .filter(d => d.type === 'receivable' && !d.isPaid)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalPayable = data.debts
    .filter(d => d.type === 'payable' && !d.isPaid)
    .reduce((sum, d) => sum + d.amount, 0);

  const currentBudget = data.budgets[0];
  const pieData = currentBudget?.categories.map(cat => ({
    name: cat.name,
    value: cat.spent || Math.round(cat.limit * 0.6),
    color: cat.color,
  })) || [];

  const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
  const barData = months.map((month) => ({
    name: month,
    income: Math.round(40000000 + Math.random() * 20000000),
    expense: Math.round(20000000 + Math.random() * 15000000),
  }));

  const budgetPercentage = currentBudget && currentBudget.totalBudget > 0
    ? Math.round((currentBudget.totalSpent / currentBudget.totalBudget) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-600 p-6 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 left-8 w-20 h-20 rounded-full bg-white"></div>
          <div className="absolute bottom-4 right-12 w-32 h-32 rounded-full bg-white"></div>
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm">موجودی کل حساب‌ها</p>
          <h2 className="text-3xl font-bold text-white mt-1">{formatAmount(totalBalance)}</h2>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
              <ArrowUpCircle size={16} className="text-green-200" />
              <span className="text-sm text-white">درآمد: {formatAmount(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
              <ArrowDownCircle size={16} className="text-red-200" />
              <span className="text-sm text-white">هزینه: {formatAmount(totalExpense)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <span className={isDark ? 'text-blue-300 text-sm' : 'text-blue-700 text-sm'}>طلب‌ها</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>{formatAmount(totalReceivable)}</p>
        </div>
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30' : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={20} className={isDark ? 'text-red-400' : 'text-red-600'} />
            <span className={isDark ? 'text-red-300 text-sm' : 'text-red-700 text-sm'}>بدهی‌ها</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-red-200' : 'text-red-800'}`}>{formatAmount(totalPayable)}</p>
        </div>
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            <span className={isDark ? 'text-purple-300 text-sm' : 'text-purple-700 text-sm'}>درآمد ماهانه</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>{formatAmount(totalIncome)}</p>
        </div>
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank size={20} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span className={isDark ? 'text-amber-300 text-sm' : 'text-amber-700 text-sm'}>پس‌انداز</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>{formatAmount(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Budget Status */}
      {currentBudget && (
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">وضعیت بودجه ماه جاری</h3>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              budgetPercentage >= 90 ? 'bg-red-500/20 text-red-300' :
              budgetPercentage >= 70 ? 'bg-amber-500/20 text-amber-300' :
              'bg-emerald-500/20 text-emerald-300'
            }`}>
              {budgetPercentage}٪ مصرف شده
            </span>
          </div>
          <div className={`w-full rounded-full h-4 mb-3 overflow-hidden ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                budgetPercentage >= 90 ? 'bg-gradient-to-l from-red-500 to-red-400' :
                budgetPercentage >= 70 ? 'bg-gradient-to-l from-amber-500 to-yellow-400' :
                'bg-gradient-to-l from-emerald-500 to-green-400'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            ></div>
          </div>
          <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>مصرف: {formatAmount(currentBudget.totalSpent)}</span>
            <span>سقف: {formatAmount(currentBudget.totalBudget)}</span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-bold text-lg mb-4">توزیع هزینه‌ها</h3>
          {pieData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', direction: 'rtl' }}
                    formatter={(value: number) => [formatAmount(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>داده‌ای موجود نیست</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {pieData.map((item, i) => (
              <span key={i} className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-bold text-lg mb-4">درآمد و هزینه ماهانه</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', direction: 'rtl' }}
                  formatter={(value: number) => [formatAmount(value), '']}
                />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="درآمد" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="هزینه" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold text-lg mb-4">آخرین تراکنش‌ها</h3>
        <div className="space-y-3">
          {data.transactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
              isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp size={18} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={18} className="text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.category}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${
                transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
