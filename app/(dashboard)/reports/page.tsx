'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { FeeCollection, TeacherSalary, Expense } from '@/types';
import { BarChart3, Banknote, Landmark, Save, History, Printer, Plus, Trash2 } from 'lucide-react';

export default function ReportsPage() {
  const [fees, setFees] = useState<FeeCollection[]>([]);
  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Expense entry form state
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('ইউটিলিটি বিল');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [savingExpense, setSavingExpense] = useState(false);

  // Report selectors
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'monthly' | 'annual' | 'add_expense'>('monthly');

  const categories = ['ইউটিলিটি বিল', 'খাদ্য ও বোর্ডিং', 'সংস্কার ও নির্মাণ', 'শিক্ষক ও স্টাফ বেতন', 'অন্যান্য'];
  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      const feeList = await db.getFees();
      const salaryList = await db.getSalaries();
      const expenseList = await db.getExpenses();

      setFees(feeList);
      setSalaries(salaryList);
      setExpenses(expenseList);
    } catch (err) {
      console.error('Error loading financial reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount || !expCategory || !expDate) {
      alert('সঠিক বিবরণ ও টাকার পরিমাণ প্রদান করুন।');
      return;
    }

    setSavingExpense(true);
    try {
      await db.addExpense(expTitle, Number(expAmount), expCategory, expDate);
      alert('ব্যয় হিসাব সফলভাবে সংরক্ষণ করা হয়েছে।');
      setExpTitle('');
      setExpAmount('');
      loadFinanceData(); // reload lists
    } catch (err) {
      alert('ব্যয় হিসাব সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ব্যয়ের রেকর্ড মুছে ফেলতে চান?')) {
      try {
        await db.deleteExpense(id);
        setExpenses(expenses.filter(e => e.id !== id));
      } catch (err) {
        alert('মুছতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  // Compile calculations based on month and year
  const getMonthlyFinancials = () => {
    // 1. Incomes
    // Student fees paid in that month
    const studentFees = fees.filter(f => f.month === reportMonth && f.year === reportYear);
    const tuitionIncome = studentFees.reduce((sum, f) => sum + Number(f.amount), 0);
    // Simulate admission income (e.g. 3000 tk per month from admission fees)
    const admissionIncome = reportMonth === 1 ? 15000 : 3000; // higher in january
    const totalIncome = tuitionIncome + admissionIncome;

    // 2. Expenses
    // Salaries paid for that month
    const monthSalaries = salaries.filter(s => s.month === reportMonth && s.year === reportYear);
    const salaryExpense = monthSalaries.reduce((sum, s) => sum + Number(s.amount), 0);
    // Other logged expenses in that month
    const loggedExpenses = expenses.filter(e => {
      const d = new Date(e.expense_date);
      return (d.getMonth() + 1) === reportMonth && d.getFullYear() === reportYear;
    });
    const utilitiesAndOther = loggedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpense = salaryExpense + utilitiesAndOther;

    const balance = totalIncome - totalExpense;

    return { tuitionIncome, admissionIncome, totalIncome, salaryExpense, utilitiesAndOther, totalExpense, balance, loggedExpenses };
  };

  // Compile annual report calculations
  const getAnnualFinancials = () => {
    const yearFees = fees.filter(f => f.year === reportYear);
    const tuitionIncome = yearFees.reduce((sum, f) => sum + Number(f.amount), 0);
    const admissionIncome = 36000; // mock annual admission
    const totalIncome = tuitionIncome + admissionIncome;

    const yearSalaries = salaries.filter(s => s.year === reportYear);
    const salaryExpense = yearSalaries.reduce((sum, s) => sum + Number(s.amount), 0);
    
    const yearExpenses = expenses.filter(e => new Date(e.expense_date).getFullYear() === reportYear);
    const utilitiesAndOther = yearExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpense = salaryExpense + utilitiesAndOther;

    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  };

  const monthlyStats = getMonthlyFinancials();
  const annualStats = getAnnualFinancials();

  return (
    <div className="space-y-6">
      {/* Top dashboard summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg"><Landmark size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">মোট মাসিক আয়</span>
            <span className="text-xl font-bold text-slate-800">
              ৳{toBanglaNum(activeTab === 'annual' ? annualStats.totalIncome : monthlyStats.totalIncome)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg"><BarChart3 size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">মোট মাসিক ব্যয়</span>
            <span className="text-xl font-bold text-slate-800">
              ৳{toBanglaNum(activeTab === 'annual' ? annualStats.totalExpense : monthlyStats.totalExpense)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg"><Banknote size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">অবশিষ্ট নিট ব্যালেন্স</span>
            <span className={`text-xl font-bold ${
              (activeTab === 'annual' ? annualStats.balance : monthlyStats.balance) >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              ৳{toBanglaNum(activeTab === 'annual' ? annualStats.balance : monthlyStats.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm border no-print">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'monthly' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          মাসিক হিসাব বিবরণী
        </button>
        <button
          onClick={() => setActiveTab('annual')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'annual' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          বার্ষিক হিসাব বিবরণী
        </button>
        <button
          onClick={() => setActiveTab('add_expense')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'add_expense' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          ব্যয় হিসাব এন্ট্রি
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">ডাটা লোড হচ্ছে...</div>
      ) : activeTab === 'monthly' ? (
        /* Monthly Financial Report Tab */
        <div className="space-y-6">
          {/* selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
            <div className="flex items-center gap-4 flex-1">
              {/* Month */}
              <div>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-350 rounded-lg text-xs bg-white text-slate-700 w-32"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-350 rounded-lg text-xs bg-white text-slate-700 w-28"
                >
                  <option value={2026}>{toBanglaNum(2026)}</option>
                  <option value={2025}>{toBanglaNum(2025)}</option>
                  <option value={2027}>{toBanglaNum(2027)}</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer size={14} />
              <span>রিপোর্ট প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Detailed Splits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-card">
            {/* Income Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-emerald-800 border-b border-slate-100 pb-2">আয় বিবরণী</h4>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">শিক্ষার্থীদের বেতন ও ফি আদায়</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.tuitionIncome)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">ভর্তি ফি ও অন্যান্য দান আদায়</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.admissionIncome)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-slate-900 border-t border-dashed">
                  <span>মোট আদায়কৃত আয়</span>
                  <span className="text-emerald-800">৳{toBanglaNum(monthlyStats.totalIncome)}</span>
                </div>
              </div>
            </div>

            {/* Expense Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-rose-800 border-b border-slate-100 pb-2">ব্যয় বিবরণী</h4>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">শিক্ষক ও স্টাফ বেতন প্রদান</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.salaryExpense)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">ইউটিলিটি ও অন্যান্য অফিস খরচ</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.utilitiesAndOther)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-slate-900 border-t border-dashed">
                  <span>মোট ব্যয়কৃত খরচ</span>
                  <span className="text-rose-800">৳{toBanglaNum(monthlyStats.totalExpense)}</span>
                </div>
              </div>
            </div>

            {/* Detailed Expense log list */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <History size={16} className="text-emerald-600" />
                <span>মাসিক সাধারণ ব্যয় বিবরণী লগের তালিকা</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">ব্যয়ের খাত / বিবরণ</th>
                      <th className="py-2.5 px-3">শ্রেণী ক্যাটাগরি</th>
                      <th className="py-2.5 px-3 text-right">টাকার পরিমাণ</th>
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3 text-center no-print">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {monthlyStats.loggedExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-semibold">{exp.title}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">৳{toBanglaNum(exp.amount)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{toBanglaNum(exp.expense_date)}</td>
                        <td className="py-2.5 px-3 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {monthlyStats.loggedExpenses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">এই মাসে কোন ব্যয়ের রেকর্ড পাওয়া যায়নি।</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'annual' ? (
        /* Annual Financial Report Tab */
        <div className="space-y-6">
          {/* selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
            <div>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-350 rounded-lg text-xs bg-white text-slate-700 w-28"
              >
                <option value={2026}>{toBanglaNum(2026)}</option>
                <option value={2025}>{toBanglaNum(2025)}</option>
                <option value={2027}>{toBanglaNum(2027)}</option>
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer size={14} />
              <span>বার্ষিক রিপোর্ট প্রিন্ট</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 print-card">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">বার্ষিক লাভ-ক্ষতি হিসাব বিবরণী ({toBanglaNum(reportYear)})</h4>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-150">
                <span className="text-slate-500 font-semibold text-sm">মোট বার্ষিক আয় (ফি ও দান আদায়)</span>
                <span className="font-bold text-emerald-800 text-sm">৳{toBanglaNum(annualStats.totalIncome)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-150">
                <span className="text-slate-500 font-semibold text-sm">মোট বার্ষিক ব্যয় (বেতন ও অফিস খরচ)</span>
                <span className="font-bold text-rose-800 text-sm">৳{toBanglaNum(annualStats.totalExpense)}</span>
              </div>
              <div className="flex justify-between pt-3 text-base font-extrabold text-slate-900 border-t-2">
                <span>বার্ষিক অবশিষ্ট ব্যালেন্স</span>
                <span className={annualStats.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  ৳{toBanglaNum(annualStats.balance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Expense Entry Form tab */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl mx-auto space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Plus size={18} className="text-emerald-600" />
            <span>নতুন খরচ হিসাব সংরক্ষণ</span>
          </h4>

          <form onSubmit={handleAddExpense} className="space-y-4">
            {/* Expense title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ব্যয়ের বিবরণ (খাত)</label>
              <input
                type="text"
                required
                placeholder="যেমন: কারেন্ট বিল মে ২০২৬, চক-ডাস্টার ক্রয় ইত্যাদি"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-850 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">খরচ ক্যাটাগরি</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-350 rounded-lg text-sm text-slate-700 bg-white"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">খরচের তারিখ</label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingExpense}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer shadow"
            >
              <Save size={16} />
              <span>{savingExpense ? 'সংরক্ষণ হচ্ছে...' : 'ব্যয় হিসাব সংরক্ষণ করুন'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
