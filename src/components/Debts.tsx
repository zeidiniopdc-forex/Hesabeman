import { useState } from 'react';
import { AppData, Debt } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Users, Plus, Save, X, CheckCircle, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatAmount } from '../store';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function Debts({ data, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'receivable' | 'payable'>('all');
  const [form, setForm] = useState<Partial<Debt>>({
    personName: '',
    amount: 0,
    type: 'receivable',
    description: '',
    dueDate: '',
  });

  const filteredDebts = data.debts.filter(d => {
    if (filter === 'all') return true;
    return d.type === filter;
  });

  const totalReceivable = data.debts
    .filter(d => d.type === 'receivable' && !d.isPaid)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalPayable = data.debts
    .filter(d => d.type === 'payable' && !d.isPaid)
    .reduce((sum, d) => sum + d.amount, 0);

  const handleAdd = () => {
    if (!form.personName || !form.amount) return;
    const debt: Debt = {
      id: uuidv4(),
      personName: form.personName || '',
      amount: form.amount || 0,
      type: (form.type as 'receivable' | 'payable') || 'receivable',
      description: form.description || '',
      dueDate: form.dueDate || undefined,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...data, debts: [...data.debts, debt] };
    onUpdate(updated);
    setShowAdd(false);
    setForm({ personName: '', amount: 0, type: 'receivable', description: '', dueDate: '' });
  };

  const handleMarkPaid = (id: string) => {
    const updated = {
      ...data,
      debts: data.debts.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d),
    };
    onUpdate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = { ...data, debts: data.debts.filter(d => d.id !== id) };
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">طلب و بدهی</h2>
          <p className="text-gray-400 text-sm mt-1">مدیریت مطالبات و بدهکاری‌ها</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-cyan-500 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          ثبت جدید
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpCircle size={18} className="text-emerald-400" />
            <span className="text-emerald-300 text-sm">مطالبات</span>
          </div>
          <p className="text-lg font-bold text-emerald-200">{formatAmount(totalReceivable)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {data.debts.filter(d => d.type === 'receivable' && !d.isPaid).length} مورد فعال
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownCircle size={18} className="text-red-400" />
            <span className="text-red-300 text-sm">بدهی‌ها</span>
          </div>
          <p className="text-lg font-bold text-red-200">{formatAmount(totalPayable)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {data.debts.filter(d => d.type === 'payable' && !d.isPaid).length} مورد فعال
          </p>
        </div>
      </div>

      {/* Net Balance */}
      <div className="bg-gradient-to-l from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">تراز خالص (طلب - بدهی)</span>
          <span className={`text-xl font-bold ${
            totalReceivable - totalPayable >= 0 ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {formatAmount(totalReceivable - totalPayable)}
          </span>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-lg">ثبت طلب یا بدهی جدید</h3>
          
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, type: 'receivable' })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                form.type === 'receivable'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              📥 طلب (از دیگران)
            </button>
            <button
              onClick={() => setForm({ ...form, type: 'payable' })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                form.type === 'payable'
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              📤 بدهی (به دیگران)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">نام شخص / طرف</label>
              <input
                type="text"
                value={form.personName || ''}
                onChange={e => setForm({ ...form, personName: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="نام شخص یا سازمان"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">مبلغ (ریال)</label>
              <input
                type="number"
                value={form.amount || ''}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="مبلغ"
              />
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
            <div>
              <label className="text-sm text-gray-400 mb-1 block">تاریخ سررسید (اختیاری)</label>
              <input
                type="date"
                value={form.dueDate || ''}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors"
            >
              <Save size={16} /> ثبت
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
      <div className="flex gap-2">
        {[
          { id: 'all' as const, label: 'همه' },
          { id: 'receivable' as const, label: 'طلب‌ها' },
          { id: 'payable' as const, label: 'بدهی‌ها' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              filter === f.id
                ? 'bg-white/15 text-white border border-white/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Debts List */}
      <div className="space-y-3">
        {filteredDebts.map(debt => (
          <div
            key={debt.id}
            className={`p-4 rounded-2xl border transition-all ${
              debt.isPaid
                ? 'bg-white/3 border-gray-700/50 opacity-60'
                : debt.type === 'receivable'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-red-500/5 border-red-500/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  debt.type === 'receivable' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {debt.type === 'receivable' ? (
                    <ArrowUpCircle size={18} className="text-emerald-400" />
                  ) : (
                    <ArrowDownCircle size={18} className="text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{debt.personName}</p>
                  <p className="text-sm text-gray-400">{debt.description}</p>
                  {debt.dueDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-500">
                        سررسید: {new Date(debt.dueDate).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-left">
                <p className={`font-bold ${
                  debt.type === 'receivable' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {formatAmount(debt.amount)}
                </p>
                {debt.isPaid && (
                  <span className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                    <CheckCircle size={12} /> تسویه شده
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
              <button
                onClick={() => handleMarkPaid(debt.id)}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  debt.isPaid
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                <CheckCircle size={12} />
                {debt.isPaid ? 'برگشت به فعال' : 'تسویه شد'}
              </button>
              <button
                onClick={() => handleDelete(debt.id)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              >
                <X size={12} /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDebts.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">موردی ثبت نشده است</p>
        </div>
      )}
    </div>
  );
}
