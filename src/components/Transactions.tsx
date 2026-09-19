import { useState } from 'react';
import { AppData, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeftRight, Plus, Save, X, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { formatAmount } from '../store';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const CATEGORIES = ['حقوق', 'خوراکی', 'اجاره', 'حمل‌ونقل', 'قبوض', 'تفریح', 'پوشاک', 'سلامت', 'آموزش', 'سایر'];

export default function Transactions({ data, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [form, setForm] = useState<Partial<Transaction>>({
    accountId: data.accounts[0]?.id || '',
    amount: 0,
    type: 'expense',
    category: '',
    description: '',
    isFixed: false,
  });

  const filteredTransactions = data.transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = data.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleAdd = () => {
    if (!form.amount || !form.category || !form.accountId) return;
    const transaction: Transaction = {
      id: uuidv4(),
      accountId: form.accountId || '',
      amount: form.amount || 0,
      type: (form.type as 'income' | 'expense') || 'expense',
      category: form.category || '',
      description: form.description || '',
      date: new Date().toISOString(),
      isFixed: form.isFixed || false,
    };
    
    // Update account balance
    const updatedAccounts = data.accounts.map(acc => {
      if (acc.id === transaction.accountId) {
        return {
          ...acc,
          balance: transaction.type === 'income'
            ? acc.balance + transaction.amount
            : acc.balance - transaction.amount,
        };
      }
      return acc;
    });

    const updated = {
      ...data,
      transactions: [transaction, ...data.transactions],
      accounts: updatedAccounts,
    };
    onUpdate(updated);
    setShowAdd(false);
    setForm({ accountId: data.accounts[0]?.id || '', amount: 0, type: 'expense', category: '', description: '', isFixed: false });
  };

  const handleDelete = (id: string) => {
    const transaction = data.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const updatedAccounts = data.accounts.map(acc => {
      if (acc.id === transaction.accountId) {
        return {
          ...acc,
          balance: transaction.type === 'income'
            ? acc.balance - transaction.amount
            : acc.balance + transaction.amount,
        };
      }
      return acc;
    });

    const updated = {
      ...data,
      transactions: data.transactions.filter(t => t.id !== id),
      accounts: updatedAccounts,
    };
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تراکنش‌ها</h2>
          <p className="text-gray-400 text-sm mt-1">ثبت و مدیریت درآمد و هزینه</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-cyan-500 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          تراکنش جدید
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-emerald-300 text-sm">کل درآمد</span>
          </div>
          <p className="text-lg font-bold text-emerald-200">{formatAmount(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={18} className="text-red-400" />
            <span className="text-red-300 text-sm">کل هزینه</span>
          </div>
          <p className="text-lg font-bold text-red-200">{formatAmount(totalExpense)}</p>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-lg">ثبت تراکنش جدید</h3>
          
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, type: 'income' })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                form.type === 'income'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              💰 درآمد
            </button>
            <button
              onClick={() => setForm({ ...form, type: 'expense' })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                form.type === 'expense'
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              💸 هزینه
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">مبلغ (ریال)</label>
              <input
                type="number"
                value={form.amount || ''}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="مبلغ را وارد کنید"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">حساب</label>
              <select
                value={form.accountId || ''}
                onChange={e => setForm({ ...form, accountId: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {data.accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} - {acc.bankName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">دسته‌بندی</label>
              <select
                value={form.category || ''}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">انتخاب کنید</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">توضیحات</label>
              <input
                type="text"
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="توضیح کوتاه"
              />
            </div>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFixed || false}
              onChange={e => setForm({ ...form, isFixed: e.target.checked })}
              className="w-4 h-4 rounded bg-black/30 border-white/20 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-300">هزینه ثابت (ماهانه تکرار می‌شود)</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors"
            >
              <Save size={16} /> ثبت تراکنش
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
            >
              <X size={16} /> انصراف
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-400" />
        <div className="flex gap-2">
          {[
            { id: 'all' as const, label: 'همه' },
            { id: 'income' as const, label: 'درآمد' },
            { id: 'expense' as const, label: 'هزینه' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filterType === f.id
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.map(transaction => {
          const account = data.accounts.find(a => a.id === transaction.accountId);
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            >
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
                  <p className="font-medium text-sm">{transaction.description || transaction.category}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{transaction.category}</span>
                    {transaction.isFixed && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">ثابت</span>
                    )}
                    {account && (
                      <span className="text-xs text-gray-500">• {account.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <span className={`font-bold text-sm ${
                    transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(transaction.date).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <ArrowLeftRight size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">تراکنشی ثبت نشده است</p>
        </div>
      )}
    </div>
  );
}
