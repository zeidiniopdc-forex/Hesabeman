import { useState } from 'react';
import { AppData, Account } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { CreditCard, Plus, Edit3, Save, X, Trash2 } from 'lucide-react';
import { formatAmount } from '../store';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'];

export default function Accounts({ data, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Account>>({
    name: '',
    bankName: '',
    cardNumber: '',
    balance: 0,
    smsSender: '',
    color: COLORS[0],
  });

  const totalBalance = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleAdd = () => {
    if (!form.name || !form.bankName) return;
    const account: Account = {
      id: uuidv4(),
      name: form.name || '',
      bankName: form.bankName || '',
      cardNumber: form.cardNumber || '',
      balance: form.balance || 0,
      color: form.color || COLORS[0],
    };
    const updated = { ...data, accounts: [...data.accounts, account] };
    onUpdate(updated);
    setShowAdd(false);
    setForm({ name: '', bankName: '', cardNumber: '', balance: 0, color: COLORS[0] });
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setForm({ ...account });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const updated = {
      ...data,
      accounts: data.accounts.map(a =>
        a.id === editingId ? { ...a, ...form } as Account : a
      ),
    };
    onUpdate(updated);
    setEditingId(null);
    setForm({ name: '', bankName: '', cardNumber: '', balance: 0, color: COLORS[0] });
  };

  const handleDelete = (id: string) => {
    const updated = { ...data, accounts: data.accounts.filter(a => a.id !== id) };
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">حساب‌های بانکی</h2>
          <p className="text-gray-400 text-sm mt-1">مدیریت حساب‌ها و موجودی</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); setForm({ name: '', bankName: '', cardNumber: '', balance: 0, color: COLORS[0] }); }}
          className="flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-cyan-500 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          حساب جدید
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-l from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-5">
        <p className="text-gray-400 text-sm">مجموع موجودی</p>
        <h3 className="text-3xl font-bold text-white mt-1">{formatAmount(totalBalance)}</h3>
        <p className="text-gray-400 text-sm mt-2">{data.accounts.length} حساب فعال</p>
      </div>

      {/* Add/Edit Form */}
      {(showAdd || editingId) && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-lg">{editingId ? 'ویرایش حساب' : 'افزودن حساب جدید'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">نام حساب</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="مثال: حساب جاری"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">نام بانک</label>
              <input
                type="text"
                value={form.bankName || ''}
                onChange={e => setForm({ ...form, bankName: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="مثال: بانک ملت"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">شماره کارت</label>
              <input
                type="text"
                value={form.cardNumber || ''}
                onChange={e => setForm({ ...form, cardNumber: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">موجودی (ریال)</label>
              <input
                type="number"
                value={form.balance || 0}
                onChange={e => setForm({ ...form, balance: Number(e.target.value) })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                📱 سرشماره پیامک بانک
              </label>
              <input
                type="text"
                value={form.smsSender || ''}
                onChange={e => setForm({ ...form, smsSender: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="مثال: Bank_Mellat"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">برای تشخیص هوشمند پیامک‌های بانکی</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">رنگ</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.color === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleSaveEdit : handleAdd}
              className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors"
            >
              <Save size={16} />
              {editingId ? 'ذخیره تغییرات' : 'افزودن'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setEditingId(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
            >
              <X size={16} />
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-4">
        {data.accounts.map(account => (
          <div
            key={account.id}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
              style={{ backgroundColor: account.color }}
            ></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: account.color }}></div>
                    <h4 className="font-bold">{account.name}</h4>
                  </div>
                  <p className="text-sm text-gray-400">{account.bankName}</p>
                  {account.cardNumber && (
                    <p className="text-sm text-gray-500 font-mono mt-1" dir="ltr">{account.cardNumber}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400">موجودی</p>
                  <p className="text-2xl font-bold" style={{ color: account.color }}>
                    {formatAmount(account.balance)}
                  </p>
                </div>
                {account.smsSender && (
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                    📱 {account.smsSender}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.accounts.length === 0 && (
        <div className="text-center py-12">
          <CreditCard size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">حسابی ثبت نشده است</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm"
          >
            + افزودن اولین حساب
          </button>
        </div>
      )}
    </div>
  );
}
