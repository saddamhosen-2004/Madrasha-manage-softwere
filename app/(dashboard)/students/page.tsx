'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, Class } from '@/types';
import { Search, UserPlus, Eye, Pencil, Trash2, Users, GraduationCap, Home, Heart } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentList = await db.getStudents();
        const classList = await db.getClasses();
        setStudents(studentList);
        setClasses(classList);
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ছাত্রের রেকর্ড মুছে ফেলতে চান?')) {
      try {
        await db.deleteStudent(id);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert('রেকর্ড মুছতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardian_phone.includes(searchQuery);
    const matchesDept = selectedDept === 'all' || s.department === selectedDept;
    const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
    return matchesSearch && matchesDept && matchesClass;
  });

  const toBanglaNum = (num: number | string) => {
    const d = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toString().replace(/[0-9]/g, digit => d[parseInt(digit)]);
  };

  const deptConfig: Record<string, { label: string; gradient: string; bg: string; text: string; ring: string }> = {
    nurani: { label: 'নূরানী',  gradient: 'from-emerald-500 to-teal-400',  bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-200' },
    nazera: { label: 'নাজেরা',  gradient: 'from-sky-500 to-cyan-400',      bg: 'bg-sky-50',      text: 'text-sky-700',     ring: 'ring-sky-200'     },
    hifz:   { label: 'হিফজ',    gradient: 'from-violet-500 to-purple-400', bg: 'bg-violet-50',   text: 'text-violet-700',  ring: 'ring-violet-200'  },
    kitab:  { label: 'কিতাব',   gradient: 'from-amber-500 to-orange-400',  bg: 'bg-amber-50',    text: 'text-amber-700',   ring: 'ring-amber-200'   },
  };

  // Summary counts
  const counts = {
    nurani: students.filter(s => s.department === 'nurani').length,
    nazera: students.filter(s => s.department === 'nazera').length,
    hifz:   students.filter(s => s.department === 'hifz').length,
    kitab:  students.filter(s => s.department === 'kitab').length,
  };

  const summaryCards = [
    { dept: 'nurani', icon: <Users size={20} />,       ...deptConfig.nurani, count: counts.nurani },
    { dept: 'nazera', icon: <GraduationCap size={20}/>, ...deptConfig.nazera, count: counts.nazera },
    { dept: 'hifz',   icon: <Heart size={20} />,       ...deptConfig.hifz,   count: counts.hifz   },
    { dept: 'kitab',  icon: <Home size={20} />,        ...deptConfig.kitab,  count: counts.kitab  },
  ];

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left delay-0 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Users size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">ছাত্র ব্যবস্থাপনা</h3>
              <p className="text-white/80 text-sm mt-1">মোট {toBanglaNum(students.length)} জন শিক্ষার্থী নিবন্ধিত আছে</p>
            </div>
          </div>
          <Link
            href="/students/add"
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-5 py-2.5 text-sm font-bold text-white transition self-start sm:self-auto shadow-sm"
          >
            <UserPlus size={16} />
            <span>নতুন ছাত্র ভর্তি</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Dept Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <button
            key={card.dept}
            onClick={() => setSelectedDept(selectedDept === card.dept ? 'all' : card.dept)}
            className={`animate-fade-in-up delay-${i * 75} card-motion relative overflow-hidden rounded-2xl bg-white border-2 text-left transition-all ${
              selectedDept === card.dept ? `border-transparent ring-2 ${card.ring}` : 'border-slate-100'
            } shadow-sm p-4 cursor-pointer`}
          >
            <div className={`h-1 w-full bg-gradient-to-r ${card.gradient} rounded-full mb-3`}></div>
            <div className={`inline-flex items-center justify-center rounded-xl ${card.bg} ${card.text} p-2.5 mb-3`}>
              {card.icon}
            </div>
            <p className="text-xs font-semibold text-slate-500">{card.label} বিভাগ</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-0.5">{toBanglaNum(card.count)} জন</h4>
            <div className={`pointer-events-none absolute -right-3 -bottom-3 h-16 w-16 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`}></div>
          </button>
        ))}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="animate-fade-in-up delay-300 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-3 flex items-center gap-2">
          <Search size={16} className="text-white" />
          <span className="font-bold text-white text-sm">ছাত্র খুঁজুন ও ফিল্টার করুন</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="নাম, আইডি, মোবাইল..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />
          </div>
          {/* Dept Filter */}
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setSelectedClass('all'); }}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
          >
            <option value="all">সকল বিভাগ</option>
            <option value="nurani">নূরানী বিভাগ</option>
            <option value="nazera">নাজেরা বিভাগ</option>
            <option value="hifz">হিফজ বিভাগ</option>
            <option value="kitab">কিতাব বিভাগ</option>
          </select>
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
          >
            <option value="all">সকল জামাত/শ্রেণী</option>
            {classes.filter(c => selectedDept === 'all' || c.department === selectedDept).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {/* Result count bar */}
        <div className="px-5 pb-3 flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            {toBanglaNum(filteredStudents.length)} জন শিক্ষার্থী পাওয়া গেছে
          </span>
          {(searchQuery || selectedDept !== 'all' || selectedClass !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedDept('all'); setSelectedClass('all'); }}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full transition"
            >
              ফিল্টার মুছুন ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Student Table ── */}
      <div className="animate-fade-in-up delay-375 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 flex items-center justify-between">
          <span className="font-bold text-white text-sm">সকল শিক্ষার্থীর তালিকা</span>
          <span className="text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold">
            {toBanglaNum(filteredStudents.length)} জন
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <span className="text-sm text-slate-500 animate-shimmer">ছাত্র তালিকা লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4">আইডি কোড</th>
                  <th className="py-3 px-4">নাম</th>
                  <th className="py-3 px-4">অভিভাবকের ফোন</th>
                  <th className="py-3 px-4">বিভাগ</th>
                  <th className="py-3 px-4">জামাত</th>
                  <th className="py-3 px-4 text-right">মাসিক ফি</th>
                  <th className="py-3 px-4">অবস্থা</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredStudents.map((s) => {
                  const dept = deptConfig[s.department];
                  return (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                      {/* ID */}
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                          {s.student_id}
                        </span>
                      </td>
                      {/* Name */}
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-slate-500">{toBanglaNum(s.guardian_phone)}</td>
                      {/* Department badge */}
                      <td className="py-3 px-4">
                        {dept ? (
                          <span className={`inline-flex items-center gap-1 ${dept.bg} ${dept.text} px-2 py-0.5 rounded-full text-[11px] font-bold`}>
                            <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${dept.gradient}`}></span>
                            {dept.label}
                          </span>
                        ) : s.department}
                      </td>
                      {/* Class */}
                      <td className="py-3 px-4 text-slate-600 font-medium">{s.class_name || '—'}</td>
                      {/* Fee */}
                      <td className="py-3 px-4 text-right">
                        {s.is_lillah ? (
                          <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md text-[11px]">লিল্লাহ ফ্রি</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[11px]">৳{toBanglaNum(s.monthly_fee)}</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {s.is_hostel && (
                            <span className="inline-block text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-100 font-semibold max-w-max">🏠 আবাসিক</span>
                          )}
                          {s.is_lillah && (
                            <span className="inline-block text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full border border-rose-100 font-semibold max-w-max">💚 লিল্লাহ</span>
                          )}
                          {!s.is_hostel && !s.is_lillah && (
                            <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-100 font-semibold max-w-max">✓ অনাবাসিক</span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link href={`/students/${s.id}`} title="বিস্তারিত"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/students/${s.id}/edit`} title="সম্পাদনা"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                            <Pencil size={14} />
                          </Link>
                          <button onClick={() => handleDelete(s.id)} title="মুছুন"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={32} className="text-slate-300" />
                        <span>কোন শিক্ষার্থীর তথ্য পাওয়া যায়নি।</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
