'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Teacher, TeacherSalary } from '@/types';
import { ArrowLeft, Pencil, Banknote, User, Phone, MapPin, Calendar, FileDown, CheckCircle, GraduationCap } from 'lucide-react';

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [loading, setLoading] = useState(true);

  // Payout Form State
  const [payMonth, setPayMonth] = useState<number>(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState<number>(new Date().getFullYear());
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paying, setPaying] = useState(false);

  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  useEffect(() => {
    loadTeacherProfile();
  }, [id]);

  const loadTeacherProfile = async () => {
    try {
      const data = await db.getTeacherById(id);
      if (!data) {
        alert('শিক্ষকের প্রোফাইল পাওয়া যায়নি।');
        router.push('/teachers');
        return;
      }
      setTeacher(data);
      setPayAmount(data.monthly_salary);

      const salaryHistory = await db.getSalaries();
      setSalaries(salaryHistory.filter(s => s.teacher_id === id));
    } catch (err) {
      console.error('Error loading teacher details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payMonth || !payYear || !payAmount) {
      alert('সঠিক তথ্য প্রদান করুন।');
      return;
    }

    // Check if salary already paid
    const alreadyPaid = salaries.some(s => s.month === Number(payMonth) && s.year === Number(payYear));
    if (alreadyPaid) {
      alert('দুঃখিত, এই শিক্ষকের জন্য এই মাসের বেতন ইতিপূর্বে প্রদান করা হয়েছে!');
      return;
    }

    setPaying(true);
    try {
      await db.paySalary(id, Number(payMonth), Number(payYear), Number(payAmount));
      alert('বেতন পরিশোধের তথ্য সফলভাবে রেকর্ড হয়েছে।');
      loadTeacherProfile(); // reload list
    } catch (err) {
      alert('বেতন তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <Link 
            href="/teachers"
            className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 className="text-lg font-bold text-slate-800">শিক্ষক প্রোফাইল বিস্তারিত</h3>
            <p className="text-xs text-slate-500 mt-0.5">{teacher.name} - এর ব্যক্তিগত তথ্য ও বেতন বিবরণী</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <FileDown size={14} />
            <span>প্রিন্ট করুন</span>
          </button>
          <Link 
            href={`/teachers/${teacher.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <Pencil size={14} />
            <span>তথ্য পরিবর্তন</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-card">
        {/* Profile Info Left Panel */}
        <div className="space-y-6 lg:col-span-1">
          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="h-28 w-28 rounded-full border-4 border-emerald-50 bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
              {teacher.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teacher.photo_url} alt={teacher.name} className="h-full w-full object-cover" />
              ) : (
                <User size={48} className="text-slate-300" />
              )}
            </div>
            
            <h4 className="text-lg font-bold text-slate-800 mt-4">{teacher.name}</h4>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full mt-1.5">
              দায়িত্বপ্রাপ্ত জামাত: {teacher.class_name || 'নাই'}
            </span>

            <div className="w-full border-t border-slate-100 my-4"></div>

            {/* details list */}
            <div className="w-full space-y-3.5 text-xs text-left text-slate-700">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">মোবাইল নম্বর</span>
                  <span className="font-semibold">{toBanglaNum(teacher.phone)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">শিক্ষাগত যোগ্যতা</span>
                  <span className="font-semibold">{teacher.qualification || 'তথ্য নাই'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">অভিজ্ঞতা / যোগদানের তারিখ</span>
                  <span className="font-semibold">{teacher.experience || 'তথ্য নাই'} ({toBanglaNum(teacher.joining_date)})</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-slate-400">ঠিকানা</span>
                  <span className="font-semibold">{teacher.address || 'তথ্য নাই'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Config / Payout Entry Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 no-print">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Banknote size={16} className="text-emerald-600" />
              <span>বেতন প্রদান এন্ট্রি</span>
            </h4>

            <form onSubmit={handlePaySalary} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Month */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">মাস</label>
                  <select
                    value={payMonth}
                    onChange={(e) => setPayMonth(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-350 rounded-lg text-xs bg-white text-slate-700"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">বছর</label>
                  <select
                    value={payYear}
                    onChange={(e) => setPayYear(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-350 rounded-lg text-xs bg-white text-slate-700"
                  >
                    <option value={2026}>{toBanglaNum(2026)}</option>
                    <option value={2025}>{toBanglaNum(2025)}</option>
                    <option value={2027}>{toBanglaNum(2027)}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">প্রদত্ত পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-350 rounded-lg text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer"
              >
                <CheckCircle size={14} />
                <span>{paying ? 'সংরক্ষণ হচ্ছে...' : 'বেতন প্রদান সম্পাদন'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Salary Payout History List (Right side) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Banknote size={18} className="text-emerald-600" />
            <span>বেতন পরিশোধের হিসাব বিবরণী</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">পরিশোধ আইডি</th>
                  <th className="py-2.5 px-3">বেতনের মাস</th>
                  <th className="py-2.5 px-3 text-right">টাকার পরিমাণ</th>
                  <th className="py-2.5 px-3">পরিশোধের তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {salaries
                  .sort((a, b) => b.paid_date.localeCompare(a.paid_date))
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">SAL-{toBanglaNum(s.id.slice(0, 8).toUpperCase())}</td>
                      <td className="py-2.5 px-3">{monthNames[s.month - 1]} - {toBanglaNum(s.year)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">৳{toBanglaNum(s.amount)}</td>
                      <td className="py-2.5 px-3 text-slate-500">{toBanglaNum(s.paid_date)}</td>
                    </tr>
                  ))}
                {salaries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">এই শিক্ষকের কোন বেতন পরিশোধের তথ্য পাওয়া যায়নি।</td>
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
