import { useState } from 'react';
import { AppData, SmsPattern } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, CheckCircle, XCircle, Edit3, Save, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function SmsPatterns({ data, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SmsPattern>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newPattern, setNewPattern] = useState<Partial<SmsPattern>>({
    bankName: '',
    pattern: '',
    sampleMessage: '',
    amountRegex: '',
    type: 'debit',
    approved: false,
  });
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const filteredPatterns = data.smsPatterns.filter(p => {
    if (filter === 'approved') return p.approved;
    if (filter === 'pending') return !p.approved;
    return true;
  });

  const handleApprove = (id: string) => {
    const updated = {
      ...data,
      smsPatterns: data.smsPatterns.map(p =>
        p.id === id ? { ...p, approved: true } : p
      ),
    };
    onUpdate(updated);
  };

  const handleReject = (id: string) => {
    const updated = {
      ...data,
      smsPatterns: data.smsPatterns.filter(p => p.id !== id),
    };
    onUpdate(updated);
  };

  const handleEdit = (pattern: SmsPattern) => {
    setEditingId(pattern.id);
    setEditForm({ ...pattern });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const updated = {
      ...data,
      smsPatterns: data.smsPatterns.map(p =>
        p.id === editingId ? { ...p, ...editForm } as SmsPattern : p
      ),
    };
    onUpdate(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleAdd = () => {
    if (!newPattern.bankName || !newPattern.pattern) return;
    const pattern: SmsPattern = {
      id: uuidv4(),
      bankName: newPattern.bankName || '',
      pattern: newPattern.pattern || '',
      sampleMessage: newPattern.sampleMessage || '',
      amountRegex: newPattern.amountRegex || '',
      type: (newPattern.type as 'credit' | 'debit' | 'both') || 'debit',
      approved: false,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...data,
      smsPatterns: [...data.smsPatterns, pattern],
    };
    onUpdate(updated);
    setShowAdd(false);
    setNewPattern({ bankName: '', pattern: '', sampleMessage: '', amountRegex: '', type: 'debit', approved: false });
  };

  const handleRescan = () => {
    const newPatterns: SmsPattern[] = [
      {
        id: uuidv4(),
        bankName: 'بانک رفاه',
        pattern: 'برداشت {amount} ریال از حساب {account}',
        sampleMessage: 'برداشت 3,500,000 ریال از حساب 015478963210',
        amountRegex: 'برداشت\\s+([\\d,]+)\\s+ریال',
        type: 'debit',
        approved: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        bankName: 'بانک آینده',
        pattern: 'واریز حقوق {amount} ریال',
        sampleMessage: 'واریز حقوق 45,000,000 ریال به حساب شما',
        amountRegex: 'واریز\\s+([\\d,]+)\\s+ریال',
        type: 'credit',
        approved: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const updated = {
      ...data,
      smsPatterns: [...data.smsPatterns, ...newPatterns],
    };
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">الگوهای پیامک بانکی</h2>
          <p className="text-gray-400 text-sm mt-1">مدیریت و ویرایش الگوهای شناسایی‌شده</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-cyan-500 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          الگوی جدید
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all' as const, label: 'همه', count: data.smsPatterns.length },
          { id: 'approved' as const, label: 'تأییدشده', count: data.smsPatterns.filter(p => p.approved).length },
          { id: 'pending' as const, label: 'در انتظار', count: data.smsPatterns.filter(p => !p.approved).length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.id
                ? 'bg-white/15 text-white border border-white/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Add New Pattern */}
      {showAdd && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-lg">افزودن الگوی جدید</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">نام بانک</label>
              <input
                type="text"
                value={newPattern.bankName}
                onChange={e => setNewPattern({ ...newPattern, bankName: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="مثال: بانک ملت"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">نوع تراکنش</label>
              <select
                value={newPattern.type}
                onChange={e => setNewPattern({ ...newPattern, type: e.target.value as any })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="debit">برداشت</option>
                <option value="credit">واریز</option>
                <option value="both">هر دو</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">الگوی پیامک</label>
              <input
                type="text"
                value={newPattern.pattern}
                onChange={e => setNewPattern({ ...newPattern, pattern: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="مثال: خرید از {merchant} به مبلغ {amount} ریال"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">نمونه پیام</label>
              <input
                type="text"
                value={newPattern.sampleMessage}
                onChange={e => setNewPattern({ ...newPattern, sampleMessage: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="یک نمونه واقعی از پیامک بانک"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">عبارت بازشناخت مبلغ (Regex)</label>
              <input
                type="text"
                value={newPattern.amountRegex}
                onChange={e => setNewPattern({ ...newPattern, amountRegex: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-emerald-500"
                placeholder="مبلغ\s+([\d,]+)\s+ریال"
                dir="ltr"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors"
            >
              <Save size={16} />
              ذخیره
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* Rescan Button */}
      <button
        onClick={handleRescan}
        className="w-full py-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-500/20 transition-colors text-sm font-medium"
      >
        🔄 اسکن مجدد پیامک‌ها برای الگوهای جدید
      </button>

      {/* Patterns List */}
      <div className="space-y-3">
        {filteredPatterns.map(pattern => (
          <div
            key={pattern.id}
            className={`bg-white/5 border rounded-2xl p-4 transition-all ${
              pattern.approved
                ? 'border-emerald-500/20'
                : 'border-white/10'
            }`}
          >
            {editingId === pattern.id ? (
              /* Edit Mode */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editForm.bankName || ''}
                    onChange={e => setEditForm({ ...editForm, bankName: e.target.value })}
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={editForm.type || 'debit'}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value as any })}
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="debit">برداشت</option>
                    <option value="credit">واریز</option>
                    <option value="both">هر دو</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={editForm.pattern || ''}
                  onChange={e => setEditForm({ ...editForm, pattern: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="الگوی پیامک"
                />
                <input
                  type="text"
                  value={editForm.sampleMessage || ''}
                  onChange={e => setEditForm({ ...editForm, sampleMessage: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="نمونه پیام"
                />
                <input
                  type="text"
                  value={editForm.amountRegex || ''}
                  onChange={e => setEditForm({ ...editForm, amountRegex: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="Regex مبلغ"
                  dir="ltr"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-500/30">
                    <Save size={14} /> ذخیره
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10">
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{pattern.bankName}</h4>
                      {pattern.approved ? (
                        <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                          <CheckCircle size={12} /> فعال
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                          در انتظار تأیید
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      pattern.type === 'credit' ? 'bg-emerald-500/20 text-emerald-300' :
                      pattern.type === 'debit' ? 'bg-red-500/20 text-red-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {pattern.type === 'credit' ? 'واریز' : pattern.type === 'debit' ? 'برداشت' : 'هر دو'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(pattern)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-3 mb-2">
                  <p className="text-xs text-gray-400 mb-1">الگو:</p>
                  <p className="text-sm text-cyan-300">{pattern.pattern}</p>
                </div>
                
                <div className="bg-black/20 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-400 mb-1">نمونه:</p>
                  <p className="text-sm text-gray-200" dir="ltr">{pattern.sampleMessage}</p>
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
                      <Trash2 size={16} /> حذف
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {filteredPatterns.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">الگویی یافت نشد</p>
        </div>
      )}
    </div>
  );
}
