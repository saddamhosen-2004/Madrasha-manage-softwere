'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Teacher, Class } from '@/types';
import { Search, Plus, Eye, Pencil, Trash2, GraduationCap, Phone, Calendar, Users, Banknote, BookOpen } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTeachersData = async () => {
      try {
        const teacherList = await db.getTeachers();
        const classList = await db.getClasses();
        setTeachers(teacherList);
        setClasses(classList);
      } catch (err) {
        console.error('Error loading teachers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTeachersData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই শিক্ষকের রেকর্ড মুছে ফেলতে চান?')) {
      try {
        await db.deleteTeacher(id);
        setTeachers(teachers.filter(t => t.id !== id));
      } catch (err) {
        alert('রেকর্ড মুছতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery) ||
    t.qualification.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  const totalSalary = teachers.reduce((sum, t) => sum + Number(t.monthly_salary), 0);

  const deptColors: Record<string, { bg: string; text: string; border: string }> = {
    nurani:  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    nazera:  { bg: 'bg-sky-100',     text: 'text-sky-800',     border: 'border-sky-200' },
    hifz:    { bg: 'bg-violet-100',  text: 'text-violet-800',  border: 'border-violet-200' },
    kitab:   { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200' },
  };

  const deptLabel: Record<string, string> = {
    nurani: 'নূরানী বিভাগ',
    nazera: 'নাজেরা বিভাগ',
    hifz:   'হিফজ বিভাগ',
    kitab:  'কিতাব বিভাগ',
  };

  const getTeacherDept = (teacher: Teacher): string => {
    const cls = classes.find(c => c.id === teacher.class_id);
    return cls?.department || '';
  };

  const statCards = [
    {
      label: 'মোট শিক্ষক ও স্টাফ',
      value: `${toBanglaNum(teachers.length)} জন`,
      icon: <Users size={24} />,
      gradient: 'from-emerald-500 to-teal-400',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      delay: 'delay-0',
    },
    {
      label: 'মোট মাসিক বেতন বরাদ্দ',
      value: `৳${toBanglaNum(totalSalary)}`,
      icon: <Banknote size={24} />,
      gradient: 'from-violet-500 to-purple-400',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-700',
      delay: 'delay-75',
    },
    {
      label: 'জামাত / শ্রেণী সংখ্যা',
      value: `${toBanglaNum(classes.length)} টি`,
      icon: <BookOpen size={24} />,
      gradient: 'from-blue-500 to-cyan-400',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      delay: 'delay-150',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-violet-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <GraduationCap size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">শিক্ষক ও স্টাফ তালিকা</h3>
              <p className="text-white/80 text-sm mt-1">
                মাদরাসার শিক্ষক ও কর্মচারীদের বিবরণ, বেতন কাঠামো এবং প্রোফাইল ব্যবস্থাপনা।
                &nbsp;({toBanglaNum(filteredTeachers.length)} জন)
              </p>
            </div>
          </div>
          <Link
            href="/teachers/add"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 text-sm font-bold hover:bg-indigo-50 transition shadow-md self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>নতুন শিক্ষক যোগ করুন</span>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
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

      {/* ── Search Bar ── */}
      <div className="animate-fade-in-up delay-150 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="শিক্ষকের নাম, মোবাইল নম্বর অথবা শিক্ষাগত যোগ্যতা লিখে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
      </div>

      {/* ── Teachers List ── */}
      <div className="animate-fade-in-up delay-225 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-4 flex items-center justify-between">
          <h4 className="font-bold text-white flex items-center gap-2">
            <GraduationCap size={18} />
            <span>শিক্ষকদের তালিকা</span>
          </h4>
          <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold border border-white/10">
            মোট: {toBanglaNum(filteredTeachers.length)} জন
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <span className="animate-shimmer text-sm font-medium">শিক্ষক তালিকা লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4">নাম</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4">শিক্ষাগত যোগ্যতা</th>
                  <th className="py-3 px-4">দায়িত্বপ্রাপ্ত জামাত</th>
                  <th className="py-3 px-4 text-right">মাসিক বেতন</th>
                  <th className="py-3 px-4">যোগদানের তারিখ</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                {filteredTeachers.map((t) => {
                  const dept = getTeacherDept(t);
                  const deptStyle = deptColors[dept] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                  return (
                    <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                      <td className="py-3 px-4 font-bold text-slate-800">{t.name}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Phone size={11} className="text-slate-400" />
                          {toBanglaNum(t.phone)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">{t.qualification || '—'}</td>
                      <td className="py-3 px-4">
                        {t.class_name ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${deptStyle.bg} ${deptStyle.text} ${deptStyle.border}`}>
                            <BookOpen size={10} />
                            {t.class_name}
                          </span>
                        ) : (
                          <span className="text-slate-400">দায়িত্ব নেই</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          ৳{toBanglaNum(t.monthly_salary)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar size={11} className="text-slate-400" />
                          {toBanglaNum(t.joining_date)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/teachers/${t.id}`}
                            title="বিস্তারিত ও বেতন"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/teachers/${t.id}/edit`}
                            title="সম্পাদনা"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(t.id)}
                            title="মুছে ফেলুন"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <GraduationCap size={32} className="text-slate-300" />
                        <span className="font-semibold">কোন শিক্ষকের তথ্য পাওয়া হয়নি।</span>
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
