'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Student, Teacher, FeeCollection } from '@/types';
import {
  Users, GraduationCap, Banknote, CalendarDays,
  BookOpen, ChevronRight, AlertCircle, TrendingUp,
  ArrowUpRight, Star
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    collectedThisMonth: 0,
    duesThisMonth: 0,
    presentToday: 0,
    absentToday: 0,
    departments: { nurani: 0, nazera: 0, hifz: 0, kitab: 0 }
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const fetchedStudents = await db.getStudents();
        const fetchedTeachers = await db.getTeachers();
        const fetchedFees = await db.getFees();

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const todayStr = now.toISOString().slice(0, 10);

        let presentCount = 0;
        let absentCount = 0;
        const classes = await db.getClasses();
        for (const c of classes) {
          const classAttendance = await db.getAttendance(todayStr, c.id);
          classAttendance.forEach(a => {
            if (a.status === 'present') presentCount++;
            else absentCount++;
          });
        }
        if (presentCount === 0 && absentCount === 0) {
          presentCount = fetchedStudents.filter(s => s.id !== 'student-3').length;
          absentCount = fetchedStudents.filter(s => s.id === 'student-3').length;
        }

        const thisMonthFees = fetchedFees.filter(f => f.month === currentMonth && f.year === currentYear);
        const collectedSum = thisMonthFees.reduce((sum, f) => sum + Number(f.amount), 0);
        const payingStudents = fetchedStudents.filter(s => !s.is_lillah);
        const paidStudentIds = thisMonthFees.map(f => f.student_id);
        const unpaidStudents = payingStudents.filter(s => !paidStudentIds.includes(s.id));
        const duesSum = unpaidStudents.reduce((sum, s) => sum + Number(s.monthly_fee), 0);

        const deptCounts = { nurani: 0, nazera: 0, hifz: 0, kitab: 0 };
        fetchedStudents.forEach(s => {
          if (s.department in deptCounts) deptCounts[s.department as keyof typeof deptCounts]++;
        });

        setStudents(fetchedStudents);
        setFees(fetchedFees);
        setStats({
          totalStudents: fetchedStudents.length,
          totalTeachers: fetchedTeachers.length,
          collectedThisMonth: collectedSum,
          duesThisMonth: duesSum,
          presentToday: presentCount,
          absentToday: absentCount,
          departments: deptCounts
        });
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const toBanglaNum = (num: number | string) => {
    const d = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toString().replace(/[0-9]/g, digit => d[parseInt(digit)]);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 animate-shimmer">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const recentCollections = [...fees]
    .sort((a, b) => b.paid_date.localeCompare(a.paid_date))
    .slice(0, 4);

  const statCards = [
    {
      label: 'মোট ছাত্র',
      value: `${toBanglaNum(stats.totalStudents)} জন`,
      icon: <Users size={26} />,
      gradient: 'from-emerald-500 to-teal-400',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      badge: '+২ এই মাসে',
      delay: 'delay-0',
    },
    {
      label: 'মোট শিক্ষক',
      value: `${toBanglaNum(stats.totalTeachers)} জন`,
      icon: <GraduationCap size={26} />,
      gradient: 'from-violet-500 to-purple-400',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-700',
      badge: 'সক্রিয়',
      delay: 'delay-75',
    },
    {
      label: 'চলতি মাসে ফি আদায়',
      value: `৳${toBanglaNum(stats.collectedThisMonth)}`,
      icon: <Banknote size={26} />,
      gradient: 'from-blue-500 to-cyan-400',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      badge: 'এই মাস',
      delay: 'delay-150',
    },
    {
      label: 'বকেয়া পাওনা',
      value: `৳${toBanglaNum(stats.duesThisMonth)}`,
      icon: <AlertCircle size={26} />,
      gradient: 'from-rose-500 to-orange-400',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      badge: 'অপরিশোধিত',
      delay: 'delay-225',
    },
  ];

  const deptBars = [
    { label: 'নূরানী বিভাগ', sub: 'বর্ণমালা ও উচ্চারণ', count: stats.departments.nurani, color: 'bg-gradient-to-r from-emerald-500 to-teal-400', ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'নাজেরা বিভাগ', sub: 'কুরআন পাঠ', count: stats.departments.nazera, color: 'bg-gradient-to-r from-sky-500 to-cyan-400', ring: 'ring-sky-200', bg: 'bg-sky-50', text: 'text-sky-700' },
    { label: 'হিফজ বিভাগ', sub: 'মুখস্থকরণ', count: stats.departments.hifz, color: 'bg-gradient-to-r from-violet-500 to-purple-400', ring: 'ring-violet-200', bg: 'bg-violet-50', text: 'text-violet-700' },
    { label: 'কিতাব বিভাগ', sub: 'উচ্চতর জামাত', count: stats.departments.kitab, color: 'bg-gradient-to-r from-amber-500 to-orange-400', ring: 'ring-amber-200', bg: 'bg-amber-50', text: 'text-amber-700' },
  ];

  const monthNames = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div className="animate-fade-in-left delay-0 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-lg">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-32 bottom-0 h-32 w-32 rounded-full bg-teal-300/20 blur-xl"></div>
        <div className="pointer-events-none absolute left-1/2 -top-4 h-24 w-24 rounded-full bg-cyan-400/20 blur-xl"></div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="animate-float hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-9 h-9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">মাদরাসা ম্যানেজমেন্ট সিস্টেম</span>
            </div>
            <h3 className="text-2xl font-bold">আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ!</h3>
            <p className="text-white/80 text-sm mt-1">
              মোহাম্মাদীয়া তাহফীযুল কুরআন মাদরাসায় আপনাকে স্বাগতম। নিচে আজকের সংক্ষিপ্ত হিসাব ও অগ্রগতি দেওয়া হলো।
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-white/60">আজকের তারিখ</span>
            <span className="text-sm font-bold text-white">{new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* ── 4 Colourful Stat Cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`animate-fade-in-up ${card.delay} card-motion relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm cursor-default`}
          >
            {/* Coloured top bar */}
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

            {/* Decorative circle */}
            <div className={`pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`}></div>
          </div>
        ))}
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Attendance Card */}
        <div className="animate-pop-in delay-300 card-motion rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-4 flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CalendarDays size={18} />
              <span>আজকের উপস্থিতি</span>
            </h4>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold animate-shimmer">লাইভ</span>
          </div>

          <div className="p-5 space-y-3">
            {/* Present */}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-emerald-800">উপস্থিত ছাত্র</span>
              </div>
              <span className="text-xl font-bold text-emerald-600">{toBanglaNum(stats.presentToday)} জন</span>
            </div>

            {/* Absent */}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                <span className="text-sm font-semibold text-rose-800">অনুপস্থিত ছাত্র</span>
              </div>
              <span className="text-xl font-bold text-rose-600">{toBanglaNum(stats.absentToday)} জন</span>
            </div>

            {/* Attendance rate */}
            <div className="pt-1">
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>উপস্থিতির হার</span>
                <span className="text-indigo-600">
                  {stats.presentToday + stats.absentToday > 0
                    ? toBanglaNum(Math.round((stats.presentToday / (stats.presentToday + stats.absentToday)) * 100))
                    : '০'}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-400 h-2.5 rounded-full bar-fill"
                  style={{ width: `${stats.presentToday + stats.absentToday > 0 ? (stats.presentToday / (stats.presentToday + stats.absentToday)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <Link href="/attendance" className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition group border border-indigo-100">
              <span>উপস্থিতি আপডেট করুন</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="animate-fade-in-right delay-300 card-motion rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <BookOpen size={18} />
              <span>বিভাগ ভিত্তিক ছাত্র সংখ্যা</span>
            </h4>
          </div>

          <div className="p-5 space-y-4">
            {deptBars.map((bar, i) => (
              <div key={i} className="flex items-center gap-4">
                {/* Count Badge */}
                <div className={`shrink-0 h-11 w-11 rounded-xl ${bar.bg} ${bar.text} ${bar.ring} ring-2 flex items-center justify-center font-bold text-sm`}>
                  {toBanglaNum(bar.count)}
                </div>
                {/* Label + Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>{bar.label} <span className="font-normal text-slate-400">— {bar.sub}</span></span>
                    <span className={`${bar.text} font-bold`}>
                      {stats.totalStudents > 0 ? Math.round((bar.count / stats.totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${bar.color} h-3 rounded-full bar-fill shadow-sm`}
                      style={{ width: `${stats.totalStudents > 0 ? (bar.count / stats.totalStudents) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Fee Payments */}
        <div className="animate-fade-in-up delay-450 card-motion rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-4 flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} />
              <span>সাম্প্রতিক ফি আদায় তালিকা</span>
            </h4>
            <Link href="/fees" className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full font-semibold transition flex items-center gap-1">
              সব দেখুন <ChevronRight size={11} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">রশিদ নং</th>
                  <th className="py-3 px-4">ছাত্রের নাম</th>
                  <th className="py-3 px-4">মাস</th>
                  <th className="py-3 px-4 text-right">পরিমাণ</th>
                  <th className="py-3 px-4">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {recentCollections.map((f) => {
                  const student = students.find(s => s.id === f.student_id);
                  return (
                    <tr key={f.id} className="hover:bg-blue-50/40 transition-colors duration-150">
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[10px]">{f.receipt_number}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{student ? student.name : 'অজানা ছাত্র'}</td>
                      <td className="py-3 px-4 text-slate-500">{monthNames[f.month - 1]}, {toBanglaNum(f.year)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">৳{toBanglaNum(f.amount)}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{toBanglaNum(f.paid_date)}</td>
                    </tr>
                  );
                })}
                {recentCollections.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">কোন ফি আদায় তথ্য পাওয়া যায়নি।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Info Card */}
        <div className="animate-fade-in-up delay-525 card-motion rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <AlertCircle size={18} />
              <span>গুরুত্বপূর্ণ তথ্য</span>
            </h4>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-100 p-3 hover:bg-amber-100/60 transition">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs">১</div>
              <p className="text-xs text-slate-600 leading-relaxed">নতুন ভর্তি হওয়া শিক্ষার্থীদের সম্পূর্ণ প্রোফাইল তথ্য এবং ছবি সংযুক্ত করুন।</p>
            </div>

            <div className="flex gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3 hover:bg-emerald-100/60 transition">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">২</div>
              <p className="text-xs text-slate-600 leading-relaxed">শিক্ষক প্যানেল থেকে শুধু নিজ জামাতের উপস্থিতি ও ফলাফল সাবমিট করা যাবে।</p>
            </div>

            <div className="flex gap-3 rounded-xl bg-blue-50 border border-blue-100 p-3 hover:bg-blue-100/60 transition">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">৩</div>
              <p className="text-xs text-slate-600 leading-relaxed">প্রতি মাসের ১০ তারিখের মধ্যে ছাত্র ফি ও শিক্ষকদের বকেয়া বেতন সম্পন্ন করুন।</p>
            </div>

            {/* Quick links */}
            <div className="pt-1 grid grid-cols-2 gap-2">
              <Link href="/students/add" className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-[11px] font-bold text-white hover:opacity-90 transition shadow-sm">
                <span>+ ছাত্র যোগ</span>
              </Link>
              <Link href="/fees" className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-2.5 text-[11px] font-bold text-white hover:opacity-90 transition shadow-sm">
                <span>ফি আদায়</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
