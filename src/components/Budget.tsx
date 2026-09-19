import { useState } from 'react';
import { AppData, BudgetCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateBudget, formatAmount } from '../store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, RefreshCw, AlertTriangle, CheckCircle, Edit3, Save, X, Plus } from 'lucide-react';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Budget({ data, onUpdate }: Props) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState(0);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', limit: 0 });

  const currentBudget = data.budgets[0];

  const handleRegenerate = () => {
    const newBudget = generateBudget(data);
    const updated = { ...data, budgets: [newBudget, ...data.budgets.slice(1)] };
    onUpdate(updated);
  };

  const handleUpdateCategoryLimit = (categoryId: string) => {
    if (!currentBudget) return;
    const updatedCategories = currentBudget.categories.map(c =>
      c.id === categoryId ? { ...c, limit: editLimit } : c
    );
    const totalBudget = updatedCategories.reduce((sum, c) => sum + c.limit, 0);
    const updatedBudgets = data.budgets.map((b, i) =>
      i === 0 ? { ...b, categories: updatedCategories, totalBudget } : b
    );
    onUpdate({ ...data, budgets: updatedBudgets });
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    if (!currentBudget || !newCategory.name || !newCategory.limit) return;
    const category: BudgetCategory = {
      id: uuidv4(),
      name: newCategory.name,
      limit: newCategory.limit,
      spent: 0,
      color: COLORS[currentBudget.categories.length % COLORS.length],
    };
    const updatedCategories = [...currentBudget.categories, category];
    const totalBudget = updatedCategories.reduce((sum, c) => sum + c.limit, 0);
    const updatedBudgets = data.budgets.map((b, i) =>
      i === 0 ? { ...b, categories: updatedCategories, totalBudget } : b
    );
    onUpdate({ ...data, budgets: updatedBudgets });
    setShowAddCategory(false);
    setNewCategory({ name: '', limit: 0 });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!currentBudget) return;
    const updatedCategories = currentBudget.categories.filter(c => c.id !== categoryId);
    const totalBudget = updatedCategories.reduce((sum, c) => sum + c.limit, 0);
    const updatedBudgets = data.budgets.map((b, i) =>
      i === 0 ? { ...b, categories: updatedCategories, totalBudget } : b
    );
    onUpdate({ ...data, budgets: updatedBudgets });
  };

  if (!currentBudget) {
    return (
      <div className="text-center py-12">
        <PieIcon size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">بودجه‌ای تعریف نشده است</p>
        <button
          onClick={handleRegenerate}
          className="bg-gradient-to-l from-emerald-500 to-cyan-500 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
        >
          تولید بودجه خودکار
        </button>
      </div>
    );
  }

  const totalPercentage = currentBudget.totalBudget > 0
    ? Math.round((currentBudget.totalSpent / currentBudget.totalBudget) * 100)
    : 0;

  const remainingBudget = currentBudget.totalBudget - currentBudget.totalSpent;

  const pieData = currentBudget.categories.map(cat => ({
    name: cat.name,
    value: cat.limit,
    color: cat.color,
  }));

  // Alerts
  const alerts = currentBudget.categories.filter(cat => {
    const pct = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
    return pct >= 80;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">بودجه‌بندی</h2>
          <p className="text-gray-400 text-sm mt-1">مدیریت و نظارت بر بودجه ماهانه</p>
        </div>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 bg-gradient-to-l from-purple-500 to-indigo-500 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={16} />
          بازتولید خودکار
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h4 className="font-bold text-red-300">هشدار بودجه</h4>
          </div>
          {alerts.map(cat => {
            const pct = cat.limit > 0 ? Math.round((cat.spent / cat.limit) * 100) : 0;
            return (
              <p key={cat.id} className="text-sm text-red-200/80 mb-1">
                {pct >= 100 ? '🚨' : '🔶'} دسته "{cat.name}": {pct}٪ مصرف شده
                ({formatAmount(cat.spent)} از {formatAmount(cat.limit)})
              </p>
            );
          })}
        </div>
      )}

      {/* Overview Card */}
      <div className="bg-gradient-to-l from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400">درآمد ماهانه</p>
            <p className="text-lg font-bold text-emerald-300 mt-1">{formatAmount(currentBudget.totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">بودجه کل</p>
            <p className="text-lg font-bold text-blue-300 mt-1">{formatAmount(currentBudget.totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">باقیمانده</p>
            <p className={`text-lg font-bold mt-1 ${remainingBudget >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {formatAmount(remainingBudget)}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">مصرف بودجه</span>
            <span className={`font-bold ${
              totalPercentage >= 90 ? 'text-red-400' :
              totalPercentage >= 70 ? 'text-amber-400' :
              'text-emerald-400'
            }`}>{totalPercentage}٪</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                totalPercentage >= 90 ? 'bg-gradient-to-l from-red-500 to-red-400' :
                totalPercentage >= 70 ? 'bg-gradient-to-l from-amber-500 to-yellow-400' :
                'bg-gradient-to-l from-emerald-500 to-green-400'
              }`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>مصرف: {formatAmount(currentBudget.totalSpent)}</span>
            <span>سقف: {formatAmount(currentBudget.totalBudget)}</span>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-lg mb-4">توزیع بودجه</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', direction: 'rtl' }}
                formatter={(value: number) => [formatAmount(value), '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {pieData.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.name}
            </span>
          ))}
        </div>
      </div>

      {/* Auto-generated badge */}
      {currentBudget.isAutoGenerated && (
        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-cyan-400" />
          <span className="text-sm text-cyan-300">
            این بودجه بر اساس درآمد ثبت‌شده، هزینه‌های ثابت و الگوی هزینه‌ای ماه قبل به صورت خودکار تولید شده است.
          </span>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">دسته‌های بودجه</h3>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="flex items-center gap-1 text-sm bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Plus size={14} /> دسته جدید
          </button>
        </div>

        {/* Add Category */}
        {showAddCategory && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newCategory.name}
                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="نام دسته"
              />
              <input
                type="number"
                value={newCategory.limit || ''}
                onChange={e => setNewCategory({ ...newCategory, limit: Number(e.target.value) })}
                className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="سقف بودجه (ریال)"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddCategory} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-500/30">
                <Save size={14} /> افزودن
              </button>
              <button onClick={() => setShowAddCategory(false)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10">
                انصراف
              </button>
            </div>
          </div>
        )}

        {currentBudget.categories.map(category => {
          const percentage = category.limit > 0 ? Math.round((category.spent / category.limit) * 100) : 0;
          const isOverBudget = percentage >= 100;
          const isWarning = percentage >= 80 && percentage < 100;

          return (
            <div
              key={category.id}
              className={`bg-white/5 border rounded-xl p-4 transition-all ${
                isOverBudget ? 'border-red-500/30' :
                isWarning ? 'border-amber-500/30' :
                'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  {isOverBudget && <AlertTriangle size={14} className="text-red-400" />}
                  {isWarning && <span className="text-amber-400 text-xs">⚠️</span>}
                </div>
                <div className="flex items-center gap-2">
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editLimit}
                        onChange={e => setEditLimit(Number(e.target.value))}
                        className="w-28 bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button onClick={() => handleUpdateCategoryLimit(category.id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                        <Save size={14} />
                      </button>
                      <button onClick={() => setEditingCategory(null)} className="p-1 text-gray-400 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`text-sm font-bold ${
                        isOverBudget ? 'text-red-400' :
                        isWarning ? 'text-amber-400' :
                        'text-gray-300'
                      }`}>
                        {percentage}٪
                      </span>
                      <button
                        onClick={() => { setEditingCategory(category.id); setEditLimit(category.limit); }}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-red-500' :
                    isWarning ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>مصرف: {formatAmount(category.spent)}</span>
                <span>سقف: {formatAmount(category.limit)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Standards Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-lg mb-3">📊 استانداردهای بودجه‌بندی</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• بودجه بر اساس <span className="text-emerald-300">درآمد ثبت‌شده</span> تنظیم می‌شود.</p>
          <p>• <span className="text-blue-300">هزینه‌های ثابت</span> (اجاره، قبوض و...) اولویت اول هستند.</p>
          <p>• <span className="text-purple-300">الگوی هزینه‌ای ماه قبل</span> مبنای پیشنهاد برای هر دسته است.</p>
          <p>• ۱۰٪ حاشیه اطمینان برای هر دسته در نظر گرفته می‌شود.</p>
          <p>• قانون ۵۰/۳۰/۲۰: ۵۰٪ نیازها، ۳۰٪ خواسته‌ها، ۲۰٪ پس‌انداز (پیشنهادی).</p>
        </div>
      </div>
    </div>
  );
}
