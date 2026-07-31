'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, FeeCollection } from '@/types';
import { CreditCard, Banknote, History, Printer, CheckCircle2 } from 'lucide-react';

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
    } catch (err) {
      alert('ফি আদায়ের তথ্য সংরক্ষণ করা সম্ভব হয়নি।');
    } finally {
      setCollecting(false);
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  return (
    <div className="space-y-6">
      {/* Mini Dashboard Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg"><Banknote size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">চলতি মাসের মোট আদায়</span>
            <span className="text-xl font-bold text-slate-800">৳{toBanglaNum(stats.totalCollected)}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg"><CheckCircle2 size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">পরিশোধিত ছাত্র</span>
            <span className="text-xl font-bold text-slate-800">{toBanglaNum(stats.paidCount)} জন</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg"><CreditCard size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">বকেয়া/অপরিশোধিত ছাত্র</span>
            <span className="text-xl font-bold text-slate-800">{toBanglaNum(stats.unpaidCount)} জন</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment entry card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 h-fit">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-600" />
            <span>মাসিক ফি আদায় ফরম</span>
          </h4>

          <form onSubmit={handleCollectFee} className="space-y-4">
            {/* Student */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষার্থী নির্বাচন করুন</label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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

            <div className="grid grid-cols-2 gap-4">
              {/* Month */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">মাস</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বছর</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={2026}>{toBanglaNum(2026)}</option>
                  <option value={2025}>{toBanglaNum(2025)}</option>
                  <option value={2027}>{toBanglaNum(2027)}</option>
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">আদায়কৃত টাকার পরিমাণ (৳)</label>
              <input
                type="number"
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={collecting || !selectedStudentId}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{collecting ? 'সংরক্ষণ হচ্ছে...' : 'ফি আদায় সম্পন্ন করুন'}</span>
            </button>
          </form>
        </div>

        {/* History log card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <History size={18} className="text-emerald-600" />
            <span>ফি আদায়ের রসিদসমূহ</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">রশিদ নং</th>
                  <th className="py-2.5 px-3">ছাত্রের নাম</th>
                  <th className="py-2.5 px-3">জামাত/শ্রেণী</th>
                  <th className="py-2.5 px-3">মাস</th>
                  <th className="py-2.5 px-3 text-right">আদায়কৃত ফি</th>
                  <th className="py-2.5 px-3 text-center">রসিদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fees
                  .sort((a, b) => b.paid_date.localeCompare(a.paid_date))
                  .map((f) => {
                    const student = students.find(s => s.id === f.student_id);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-semibold text-emerald-800">{f.receipt_number}</td>
                        <td className="py-2.5 px-3 font-medium">{student ? student.name : 'অজানা ছাত্র'}</td>
                        <td className="py-2.5 px-3">{student?.class_name || 'জামাত নাই'}</td>
                        <td className="py-2.5 px-3">{monthNames[f.month - 1]} - {toBanglaNum(f.year)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">৳{toBanglaNum(f.amount)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Link
                            href={`/fees/receipt/${f.id}`}
                            className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-[10px] font-bold border border-emerald-100 transition"
                          >
                            <Printer size={12} />
                            <span>রশিদ দেখুন</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                {fees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">কোন ফি আদায়ের তথ্য রেকর্ড করা হয়নি।</td>
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
