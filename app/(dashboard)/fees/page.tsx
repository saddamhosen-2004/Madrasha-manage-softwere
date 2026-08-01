'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, FeeCollection } from '@/types';
import { CreditCard, Banknote, History, Printer, CheckCircle2, AlertCircle, ArrowUpRight, Star } from 'lucide-react';

export default function FeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Collection Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [amount, setAmount] = useState<number>(0);
  const [collecting, setCollecting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalCollected: 0,
    paidCount: 0,
    unpaidCount: 0,
  });

  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  useEffect(() => {
    loadFeesData();
  }, []);

  const loadFeesData = async () => {
    try {
      const studentList = await db.getStudents();
      const feeList = await db.getFees();
      setStudents(studentList);
      setFees(feeList);

      // Calculations
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const thisMonthFees = feeList.filter(f => f.month === currentMonth && f.year === currentYear);
      const sumCollected = thisMonthFees.reduce((sum, f) => sum + Number(f.amount), 0);

      // Active paying students
      const payingStudents = studentList.filter(s => !s.is_lillah);
      const paidIds = thisMonthFees.map(f => f.student_id);
      const paidCount = paidIds.length;
      const unpaidCount = payingStudents.length - paidCount;

      setStats({
        totalCollected: sumCollected,
        paidCount,
        unpaidCount
      });
    } catch (err) {
      console.error('Error loading fees info:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prefill amount when student is selected
  useEffect(() => {
    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
      setAmount(student.monthly_fee);
    } else {
      setAmount(0);
    }
  }, [selectedStudentId, students]);

  const handleCollectFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedMonth || !selectedYear || amount === undefined) {
      alert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }

    // Check if already paid
    const alreadyPaid = fees.some(
      f => f.student_id === selectedStudentId && f.month === Number(selectedMonth) && f.year === Number(selectedYear)
    );
    if (alreadyPaid) {
      alert('দুঃখিত, এই শিক্ষার্থীর জন্য এই মাসের ফি ইতিপূর্বে আদায় করা হয়েছে!');
      return;
    }

    setCollecting(true);
    try {
      const newCollection = await db.collectFee(
        selectedStudentId,
        Number(selectedMonth),
        Number(selectedYear),
        Number(amount)
      );
      alert('ফি আদায় সফল হয়েছে! রসিদ প্রিন্ট করুন।');
      setSelectedStudentId('');
      setAmount(0);
      loadFeesData(); // reload
    } catch (err: any) {
      alert('ফি আদায়ের তথ্য সংরক্ষণ করা সম্ভব হয়নি: ' + err.message);
    } finally {
      setCollecting(false);
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  const statCards = [
    {
      label: 'চলতি মাসের মোট আদায়',
      value: `৳${toBanglaNum(stats.totalCollected)}`,
      icon: <Banknote size={24} />,
      gradient: 'from-emerald-500 to-teal-400',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      badge: 'আদায়কৃত',
      delay: 'delay-0',
    },
    {
      label: 'পরিশোধিত ছাত্র',
      value: `${toBanglaNum(stats.paidCount)} জন`,
      icon: <CheckCircle2 size={24} />,
      gradient: 'from-blue-500 to-cyan-400',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      badge: 'ফি সম্পন্ন',
      delay: 'delay-75',
    },
    {
      label: 'বকেয়া/অপরিশোধিত ছাত্র',
      value: `${toBanglaNum(stats.unpaidCount)} জন`,
      icon: <AlertCircle size={24} />,
      gradient: 'from-rose-500 to-orange-400',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      badge: 'ফি বকেয়া',
      delay: 'delay-150',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 animate-shimmer">ফি আদায়ের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left delay-0 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <CreditCard size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">ছাত্র বেতন ও ফি কালেকশন</h3>
              <p className="text-white/80 text-sm mt-1">শিক্ষার্থীদের মাসিক বেতন ও ভর্তি ফি আদায়ের বিবরণী।</p>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-white/60">চলতি মাস</span>
            <span className="text-sm font-bold text-white">
              {monthNames[new Date().getMonth()]} - {toBanglaNum(new Date().getFullYear())}
            </span>
          </div>
        </div>
      </div>

      {/* ── Three Colorful Stats Cards ── */}
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
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${card.lightBg} ${card.textColor}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
              <h4 className="text-2xl font-bold text-slate-800">{card.value}</h4>
            </div>
            <div className={`pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Fee Collection Form ── */}
        <div className="animate-fade-in-up delay-150 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-4 flex items-center gap-2">
            <CreditCard size={18} className="text-white" />
            <span className="font-bold text-white text-sm">মাসিক ফি আদায় ফরম</span>
          </div>

          <form onSubmit={handleCollectFee} className="p-5 space-y-4">
            {/* Student selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Star size={12} className="text-indigo-500" />
                শিক্ষার্থী নির্বাচন করুন
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              >
                <option value="">ছাত্র সিলেক্ট করুন</option>
                {students
                  .filter(s => !s.is_lillah) // Hide free students
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.student_id} ({s.class_name || 'জামাত নাই'})
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">মাস</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">বছর</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                >
                  <option value={2026}>{toBanglaNum(2026)}</option>
                  <option value={2025}>{toBanglaNum(2025)}</option>
                  <option value={2027}>{toBanglaNum(2027)}</option>
                </select>
              </div>
            </div>

            {/* Fee Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">আদায়কৃত টাকার পরিমাণ (৳)</label>
              <input
                type="number"
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <button
              type="submit"
              disabled={collecting || !selectedStudentId}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer shadow-md"
            >
              <CheckCircle2 size={16} />
              <span>{collecting ? 'সংরক্ষণ হচ্ছে...' : 'ফি আদায় সম্পন্ন করুন'}</span>
            </button>
          </form>
        </div>

        {/* ── Right Column: History Log ── */}
        <div className="animate-fade-in-up delay-225 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-4 flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2">
              <History size={18} />
              <span>ফি আদায়ের রসিদসমূহ</span>
            </h4>
            <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold border border-white/10">
              ইতিহাস
            </span>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">রশিদ নং</th>
                  <th className="py-3 px-4">ছাত্রের নাম</th>
                  <th className="py-3 px-4">জামাত/শ্রেণী</th>
                  <th className="py-3 px-4">মাস</th>
                  <th className="py-3 px-4 text-right">আদায়কৃত ফি</th>
                  <th className="py-3 px-4 text-center">রসিদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {fees
                  .sort((a, b) => b.paid_date.localeCompare(a.paid_date))
                  .map((f) => {
                    const student = students.find(s => s.id === f.student_id);
                    return (
                      <tr key={f.id} className="hover:bg-blue-50/40 transition-colors duration-155">
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[10px]">{f.receipt_number}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{student ? student.name : 'অজানা ছাত্র'}</td>
                        <td className="py-3 px-4 text-slate-500">{student?.class_name || 'জামাত নাই'}</td>
                        <td className="py-3 px-4">{monthNames[f.month - 1]}, {toBanglaNum(f.year)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">৳{toBanglaNum(f.amount)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/fees/receipt/${f.id}`}
                            className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-indigo-100 transition group"
                          >
                            <Printer size={12} />
                            <span>রশিদ দেখুন</span>
                            <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                {fees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">কোন ফি আদায়ের তথ্য রেকর্ড করা হয়নি।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
