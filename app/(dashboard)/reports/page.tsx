'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { FeeCollection, TeacherSalary, Expense } from '@/types';
import { 
  BarChart3, Banknote, Landmark, Save, History, 
  Printer, Plus, Trash2, TrendingUp, TrendingDown, 
  Receipt, Calendar, Tag, DollarSign, FileSpreadsheet 
} from 'lucide-react';

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
      alert('ব্যয় হিসাব সফলভাবে সংরক্ষণ করা হয়েছে।');
      setExpTitle('');
      setExpAmount('');
      loadFinanceData(); // reload lists
    } catch (err) {
      alert('ব্যয় হিসাব সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ব্যয়ের রেকর্ড মুছে ফেলতে চান?')) {
      try {
        await db.deleteExpense(id);
        setExpenses(expenses.filter(e => e.id !== id));
      } catch (err) {
        alert('মুছতে ব্যর্থ হয়েছে।');
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
    const studentFees = fees.filter(f => f.month === reportMonth && f.year === reportYear);
    const tuitionIncome = studentFees.reduce((sum, f) => sum + Number(f.amount), 0);
    const admissionIncome = reportMonth === 1 ? 15000 : 3000;
    const totalIncome = tuitionIncome + admissionIncome;

    // 2. Expenses
    const monthSalaries = salaries.filter(s => s.month === reportMonth && s.year === reportYear);
    const salaryExpense = monthSalaries.reduce((sum, s) => sum + Number(s.amount), 0);
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
    const admissionIncome = 36000;
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

  const currentTotalIncome = activeTab === 'annual' ? annualStats.totalIncome : monthlyStats.totalIncome;
  const currentTotalExpense = activeTab === 'annual' ? annualStats.totalExpense : monthlyStats.totalExpense;
  const currentBalance = activeTab === 'annual' ? annualStats.balance : monthlyStats.balance;

  const statCards = [
    {
      label: activeTab === 'annual' ? 'মোট বার্ষিক আয়' : 'মোট মাসিক আয়',
      value: `৳${toBanglaNum(currentTotalIncome)}`,
      icon: <TrendingUp size={24} />,
      gradient: 'from-emerald-500 to-teal-400',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      delay: 'delay-0',
    },
    {
      label: activeTab === 'annual' ? 'মোট বার্ষিক ব্যয়' : 'মোট মাসিক ব্যয়',
      value: `৳${toBanglaNum(currentTotalExpense)}`,
      icon: <TrendingDown size={24} />,
      gradient: 'from-rose-500 to-orange-400',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      delay: 'delay-75',
    },
    {
      label: 'অবশিষ্ট নিট ব্যালেন্স',
      value: `৳${toBanglaNum(currentBalance)}`,
      icon: <Banknote size={24} />,
      gradient: currentBalance >= 0 ? 'from-blue-500 to-cyan-400' : 'from-rose-600 to-pink-500',
      lightBg: currentBalance >= 0 ? 'bg-blue-50' : 'bg-rose-50',
      textColor: currentBalance >= 0 ? 'text-blue-700' : 'text-rose-700',
      delay: 'delay-150',
    },
  ];

  const inputClass = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition';

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <BarChart3 size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">আয়-ব্যয় হিসাব ও রিপোর্ট</h3>
              <p className="text-white/80 text-sm mt-1">মাদরাসার মাসিক ও বার্ষিক লাভ-ক্ষতি হিসাব বিবরণী এবং খরচ এন্ট্রি।</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 Summary Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`animate-fade-in-up ${card.delay} card-motion relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm cursor-default`}
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient}`}></div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`rounded-xl ${card.lightBg} p-3 ${card.textColor}`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
              <h4 className="text-2xl font-bold text-slate-800">{card.value}</h4>
            </div>
            <div className={`pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`}></div>
          </div>
        ))}
      </div>

      {/* ── Animated Tab Switcher ── */}
      <div className="animate-fade-in-up flex rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100 gap-1 no-print">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'monthly'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet size={16} />
          মাসিক হিসাব বিবরণী
        </button>
        <button
          onClick={() => setActiveTab('annual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'annual'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Landmark size={16} />
          বার্ষিক হিসাব বিবরণী
        </button>
        <button
          onClick={() => setActiveTab('add_expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'add_expense'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Plus size={16} />
          ব্যয় হিসাব এন্ট্রি
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-slate-500 animate-shimmer">আর্থিক বিবরণী লোড হচ্ছে...</p>
          </div>
        </div>
      ) : activeTab === 'monthly' ? (
        /* ── Monthly Financial Report Tab ── */
        <div className="space-y-6">

          {/* Selectors Bar */}
          <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
            <div className="flex items-center gap-3 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">মাস</label>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:border-teal-400 focus:outline-none transition"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">বছর</label>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:border-teal-400 focus:outline-none transition"
                >
                  <option value={2025}>{toBanglaNum(2025)}</option>
                  <option value={2026}>{toBanglaNum(2026)}</option>
                  <option value={2027}>{toBanglaNum(2027)}</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              <Printer size={15} />
              <span>রিপোর্ট প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Detailed Splits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-card">
            
            {/* Income Card */}
            <div className="animate-fade-in-up delay-75 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <TrendingUp size={16} />
                  <span>আয় বিবরণী ({monthNames[reportMonth - 1]})</span>
                </h4>
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold">আদায়</span>
              </div>
              <div className="p-5 space-y-3.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">শিক্ষার্থীদের বেতন ও ফি আদায়</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.tuitionIncome)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">ভর্তি ফি ও অন্যান্য দান আদায়</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.admissionIncome)}</span>
                </div>
                <div className="flex justify-between pt-3 text-sm font-bold text-slate-900 border-t border-dashed border-slate-200">
                  <span>মোট আদায়কৃত আয়</span>
                  <span className="text-emerald-600">৳{toBanglaNum(monthlyStats.totalIncome)}</span>
                </div>
              </div>
            </div>

            {/* Expense Card */}
            <div className="animate-fade-in-up delay-150 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-orange-400 px-5 py-3.5 flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <TrendingDown size={16} />
                  <span>ব্যয় বিবরণী ({monthNames[reportMonth - 1]})</span>
                </h4>
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold">খরচ</span>
              </div>
              <div className="p-5 space-y-3.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">শিক্ষক ও স্টাফ বেতন প্রদান</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.salaryExpense)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">ইউটিলিটি ও অন্যান্য অফিস খরচ</span>
                  <span className="font-bold text-slate-800">৳{toBanglaNum(monthlyStats.utilitiesAndOther)}</span>
                </div>
                <div className="flex justify-between pt-3 text-sm font-bold text-slate-900 border-t border-dashed border-slate-200">
                  <span>মোট ব্যয়কৃত খরচ</span>
                  <span className="text-rose-600">৳{toBanglaNum(monthlyStats.totalExpense)}</span>
                </div>
              </div>
            </div>

            {/* Detailed Expense Log List */}
            <div className="md:col-span-2 animate-fade-in-up delay-225 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-3.5 flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <History size={16} />
                  <span>মাসিক সাধারণ ব্যয় বিবরণী লগের তালিকা</span>
                </h4>
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold">
                  মোট: {toBanglaNum(monthlyStats.loggedExpenses.length)} টি লগ
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-3 px-5">ব্যয়ের খাত / বিবরণ</th>
                      <th className="py-3 px-4">ক্যাটাগরি</th>
                      <th className="py-3 px-4 text-right">টাকার পরিমাণ</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4 text-center no-print">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {monthlyStats.loggedExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-800">{exp.title}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600 bg-rose-50/50">
                          ৳{toBanglaNum(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">{toBanglaNum(exp.expense_date)}</td>
                        <td className="py-3 px-4 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {monthlyStats.loggedExpenses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                          <div className="flex flex-col items-center gap-2">
                            <Receipt size={32} className="text-slate-300" />
                            <span>এই মাসে কোন ব্যয়ের রেকর্ড পাওয়া যায়নি।</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      ) : activeTab === 'annual' ? (
        /* ── Annual Financial Report Tab ── */
        <div className="space-y-6">

          {/* Selector Bar */}
          <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">বছর নির্বাচন</label>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:border-violet-400 focus:outline-none transition"
              >
                <option value={2025}>{toBanglaNum(2025)}</option>
                <option value={2026}>{toBanglaNum(2026)}</option>
                <option value={2027}>{toBanglaNum(2027)}</option>
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              <Printer size={15} />
              <span>বার্ষিক রিপোর্ট প্রিন্ট</span>
            </button>
          </div>

          <div className="animate-fade-in-up bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print-card">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-3.5 flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                <Landmark size={16} />
                <span>বার্ষিক লাভ-ক্ষতি হিসাব বিবরণী ({toBanglaNum(reportYear)})</span>
              </h4>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-semibold text-sm">মোট বার্ষিক আয় (ফি ও দান আদায়)</span>
                <span className="font-bold text-emerald-600 text-sm">৳{toBanglaNum(annualStats.totalIncome)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-semibold text-sm">মোট বার্ষিক ব্যয় (বেতন ও অফিস খরচ)</span>
                <span className="font-bold text-rose-600 text-sm">৳{toBanglaNum(annualStats.totalExpense)}</span>
              </div>
              <div className="flex justify-between pt-4 text-base font-extrabold text-slate-900 border-t-2 border-slate-100">
                <span>বার্ষিক অবশিষ্ট ব্যালেন্স</span>
                <span className={annualStats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  ৳{toBanglaNum(annualStats.balance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Expense Entry Form Tab ── */
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 flex items-center gap-2">
            <Plus size={16} className="text-white" />
            <span className="font-bold text-white text-sm">নতুন খরচ হিসাব সংরক্ষণ</span>
          </div>

          <form onSubmit={handleAddExpense} className="p-6 space-y-4">
            
            {/* Expense title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Receipt size={11} className="text-amber-500" />
                ব্যয়ের বিবরণ (খাত)
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: কারেন্ট বিল মে ২০২৬, চক-ডাস্টার ক্রয় ইত্যাদি"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <DollarSign size={11} className="text-amber-500" />
                  টাকার পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Tag size={11} className="text-amber-500" />
                  খরচ ক্যাটাগরি
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className={inputClass}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar size={11} className="text-amber-500" />
                খরচের তারিখ
              </label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={savingExpense}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
            >
              <Save size={16} />
              <span>{savingExpense ? 'সংরক্ষণ হচ্ছে...' : 'ব্যয় হিসাব সংরক্ষণ করুন'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
