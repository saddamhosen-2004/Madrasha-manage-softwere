'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Teacher, TeacherSalary } from '@/types';
import { ArrowLeft, Pencil, Banknote, User, Phone, MapPin, Calendar, FileDown, CheckCircle, GraduationCap, History, ArrowUpRight } from 'lucide-react';

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
    } catch (err: any) {
      alert('বেতন তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 animate-shimmer">প্রোফাইল লোড হচ্ছে...</p>
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
      
      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left delay-0 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-lg no-print">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/teachers"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition text-white"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h3 className="text-xl font-bold">শিক্ষক প্রোফাইল বিস্তারিত</h3>
              <p className="text-white/80 text-xs mt-0.5">{teacher.name} - এর ব্যক্তিগত তথ্য ও বেতন বিবরণী</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition shadow-sm"
            >
              <FileDown size={14} />
              <span>প্রিন্ট করুন</span>
            </button>
            <Link 
              href={`/teachers/${teacher.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-emerald-800 px-4 py-2.5 text-xs font-bold hover:bg-emerald-50 transition shadow-md"
            >
              <Pencil size={14} />
              <span>তথ্য পরিবর্তন</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-card">
        
        {/* ── Profile Info Left Panel ── */}
        <div className="space-y-6 lg:col-span-1">
          {/* Main Profile Info Card */}
          <div className="animate-fade-in-up delay-75 card-motion bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            
            <div className="h-28 w-28 rounded-2xl border-4 border-emerald-50 bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden shadow-inner mt-2">
              {teacher.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teacher.photo_url} alt={teacher.name} className="h-full w-full object-cover" />
              ) : (
                <User size={48} className="text-slate-350" />
              )}
            </div>
            
            <h4 className="text-lg font-bold text-slate-800 mt-4">{teacher.name}</h4>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mt-2">
              দায়িত্বপ্রাপ্ত জামাত: {teacher.class_name || 'জামাত দায়িত্ব দেয়া হয়নি'}
            </span>

            <div className="w-full border-t border-slate-50 my-5"></div>

            {/* details list */}
            <div className="w-full space-y-4 text-xs text-left text-slate-600">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone size={13} />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">মোবাইল নম্বর</span>
                  <span className="font-semibold text-slate-700">{toBanglaNum(teacher.phone)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <GraduationCap size={13} />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">শিক্ষাগত যোগ্যতা</span>
                  <span className="font-semibold text-slate-700">{teacher.qualification || 'তথ্য নাই'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar size={13} />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">অভিজ্ঞতা / যোগদানের তারিখ</span>
                  <span className="font-semibold text-slate-700">{teacher.experience || 'তথ্য নাই'} ({toBanglaNum(teacher.joining_date)})</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">ঠিকানা</span>
                  <span className="font-semibold text-slate-700 leading-relaxed">{teacher.address || 'তথ্য নাই'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Config / Payout Entry Form */}
          <div className="animate-fade-in-up delay-150 card-motion bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 no-print">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Banknote size={16} className="text-indigo-500" />
              <span>বেতন প্রদান এন্ট্রি ফরম</span>
            </h4>

            <form onSubmit={handlePaySalary} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Month */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5">মাস</label>
                  <select
                    value={payMonth}
                    onChange={(e) => setPayMonth(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5">বছর</label>
                  <select
                    value={payYear}
                    onChange={(e) => setPayYear(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  >
                    <option value={2026}>{toBanglaNum(2026)}</option>
                    <option value={2025}>{toBanglaNum(2025)}</option>
                    <option value={2027}>{toBanglaNum(2027)}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1.5">প্রদত্ত বেতন পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2.5 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer shadow-md"
              >
                <CheckCircle size={14} />
                <span>{paying ? 'সংরক্ষণ হচ্ছে...' : 'বেতন প্রদান সম্পন্ন করুন'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ── Salary Payout History List (Right side) ── */}
        <div className="animate-fade-in-right delay-150 card-motion lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <History size={18} className="text-violet-500" />
            <span>বেতন পরিশোধের হিসাব বিবরণী</span>
          </h4>

          <div className="overflow-x-auto p-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">পরিশোধ আইডি</th>
                  <th className="py-2.5 px-3">বেতনের মাস</th>
                  <th className="py-2.5 px-3 text-right">টাকার পরিমাণ</th>
                  <th className="py-2.5 px-3">পরিশোধের তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {salaries
                  .sort((a, b) => b.paid_date.localeCompare(a.paid_date))
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-violet-50/30 transition-colors duration-150">
                      <td className="py-2.5 px-3">
                        <span className="bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          SAL-{toBanglaNum(s.id.slice(0, 8).toUpperCase())}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{monthNames[s.month - 1]} - {toBanglaNum(s.year)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          ৳{toBanglaNum(s.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{toBanglaNum(s.paid_date)}</td>
                    </tr>
                  ))}
                {salaries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <GraduationCap size={28} className="text-slate-300" />
                        <span>এই শিক্ষকের কোন বেতন পরিশোধের তথ্য পাওয়া যায়নি।</span>
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
  );
}
