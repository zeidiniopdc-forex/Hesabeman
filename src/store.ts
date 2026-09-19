import { AppData, SmsPattern, Transaction, Budget, BudgetCategory } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'accounting_app_data';

const sampleSmsPatterns: SmsPattern[] = [
  {
    id: uuidv4(),
    bankName: 'بانک ملت',
    pattern: 'خرید از {merchant} به مبلغ {amount} ریال',
    sampleMessage: 'خرید از فروشگاه دیجی‌کالا به مبلغ 2,500,000 ریال - موجودی: 15,000,000 ریال',
    amountRegex: 'مبلغ\\s+([\\d,]+)\\s+ریال',
    type: 'debit',
    approved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    bankName: 'بانک ملی',
    pattern: 'واریز به حساب {account} به مبلغ {amount} ریال از {source}',
    sampleMessage: 'واریز به حساب 0108547291003 به مبلغ 50,000,000 ریال از انتقال پایا',
    amountRegex: 'مبلغ\\s+([\\d,]+)\\s+ریال',
    type: 'credit',
    approved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    bankName: 'بانک صادرات',
    pattern: 'برداشت {amount} ریال از حساب {account} بابت {reason}',
    sampleMessage: 'برداشت 1,200,000 ریال از حساب 0158749632001 بابت خرید اینترنتی',
    amountRegex: 'برداشت\\s+([\\d,]+)\\s+ریال',
    type: 'debit',
    approved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    bankName: 'بانک پاسارگاد',
    pattern: 'انتقال {amount} ریال به حساب {destination}',
    sampleMessage: 'انتقال 5,000,000 ریال به حساب 0589632147002 از طریق همراه‌بانک',
    amountRegex: 'انتقال\\s+([\\d,]+)\\s+ریال',
    type: 'debit',
    approved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    bankName: 'بانک سامان',
    pattern: 'واریز {amount} ریال به حساب شما از {source}',
    sampleMessage: 'واریز 120,000,000 ریال به حساب شما از حقوق ماهانه',
    amountRegex: 'واریز\\s+([\\d,]+)\\s+ریال',
    type: 'credit',
    approved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    bankName: 'بانک تجارت',
    pattern: 'پرداخت قبض {billType} به مبلغ {amount} ریال',
    sampleMessage: 'پرداخت قبض برق به مبلغ 850,000 ریال - شناسه قبض: 77445522',
    amountRegex: 'مبلغ\\s+([\\d,]+)\\s+ریال',
    type: 'debit',
    approved: false,
    createdAt: new Date().toISOString(),
  },
];

const sampleTransactions: Transaction[] = [
  {
    id: uuidv4(),
    accountId: 'acc-1',
    amount: 50000000,
    type: 'income',
    category: 'حقوق',
    description: 'حقوق ماهانه',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isFixed: true,
  },
  {
    id: uuidv4(),
    accountId: 'acc-1',
    amount: 5000000,
    type: 'expense',
    category: 'اجاره',
    description: 'اجاره خانه',
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    isFixed: true,
  },
  {
    id: uuidv4(),
    accountId: 'acc-1',
    amount: 2500000,
    type: 'expense',
    category: 'خوراکی',
    description: 'خرید هفتگی سوپرمارکت',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isFixed: false,
  },
  {
    id: uuidv4(),
    accountId: 'acc-1',
    amount: 850000,
    type: 'expense',
    category: 'قبوض',
    description: 'قبض برق',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isFixed: true,
  },
  {
    id: uuidv4(),
    accountId: 'acc-1',
    amount: 1200000,
    type: 'expense',
    category: 'حمل‌ونقل',
    description: 'بنزین و تاکسی',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isFixed: false,
  },
  {
    id: uuidv4(),
    accountId: 'acc-1',
    amount: 3500000,
    type: 'expense',
    category: 'خوراکی',
    description: 'خرید ماهانه',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    isFixed: false,
  },
  {
    id: uuidv4(),
    accountId: 'acc-1',
    amount: 50000000,
    type: 'income',
    category: 'حقوق',
    description: 'حقوق ماهانه',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    isFixed: true,
  },
];

function generateAutoBudget(transactions: Transaction[]): Budget {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Get last month's transactions
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const lastMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= lastMonth && d <= lastMonthEnd;
  });
  
  // Calculate income
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && t.isFixed)
    .reduce((sum, t) => sum + t.amount, 0) / 
    Math.max(1, new Set(transactions.filter(t => t.type === 'income').map(t => t.date.substring(0, 7))).size);
  
  // Get fixed expenses
  const fixedExpenses = transactions
    .filter(t => t.type === 'expense' && t.isFixed)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get last month's spending by category
  const categorySpending: Record<string, number> = {};
  lastMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
  
  // Generate budget categories
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  const categories: BudgetCategory[] = Object.entries(categorySpending).map(([name, spent], i) => ({
    id: uuidv4(),
    name,
    limit: Math.round(spent * 1.1), // 10% buffer from last month
    spent: 0,
    color: colors[i % colors.length],
  }));
  
  // Add categories for fixed expenses not in last month
  const fixedCategories = new Set(transactions.filter(t => t.isFixed && t.type === 'expense').map(t => t.category));
  fixedCategories.forEach(cat => {
    if (!categories.find(c => c.name === cat)) {
      const avgFixed = transactions
        .filter(t => t.category === cat && t.type === 'expense' && t.isFixed)
        .reduce((sum, t) => sum + t.amount, 0) / 
        Math.max(1, new Set(transactions.filter(t => t.category === cat && t.type === 'expense').map(t => t.date.substring(0, 7))).size);
      categories.push({
        id: uuidv4(),
        name: cat,
        limit: Math.round(avgFixed),
        spent: 0,
        color: colors[categories.length % colors.length],
      });
    }
  });
  
  const totalBudget = categories.reduce((sum, c) => sum + c.limit, 0);
  
  return {
    id: uuidv4(),
    month: currentMonth,
    totalIncome: monthlyIncome,
    totalBudget,
    totalSpent: 0,
    categories,
    isAutoGenerated: true,
    createdAt: new Date().toISOString(),
  };
}

export function getInitialData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through to default
    }
  }
  
  const data: AppData = {
    accounts: [
      {
        id: 'acc-1',
        name: 'حساب جاری',
        bankName: 'بانک ملت',
        cardNumber: '6104-3378-XXXX-XXXX',
        balance: 15000000,
        color: '#3b82f6',
      },
      {
        id: 'acc-2',
        name: 'حساب پس‌انداز',
        bankName: 'بانک ملی',
        cardNumber: '6037-9975-XXXX-XXXX',
        balance: 85000000,
        color: '#22c55e',
      },
    ],
    smsPatterns: sampleSmsPatterns,
    transactions: sampleTransactions,
    debts: [
      {
        id: uuidv4(),
        personName: 'علی محمدی',
        amount: 5000000,
        type: 'receivable',
        description: 'قرض ماه گذشته',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        isPaid: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        personName: 'فروشگاه لوازم خانگی',
        amount: 12000000,
        type: 'payable',
        description: 'خرید اقساطی یخچال',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        isPaid: false,
        createdAt: new Date().toISOString(),
      },
    ],
    budgets: [generateAutoBudget(sampleTransactions)],
    hasScannedSms: false,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateBudget(data: AppData): Budget {
  return generateAutoBudget(data.transactions);
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('fa-IR') + ' ریال';
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString('fa-IR');
}
