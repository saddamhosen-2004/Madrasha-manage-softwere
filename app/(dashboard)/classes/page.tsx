'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Class, Teacher, Student } from '@/types';
import { Plus, Pencil, Trash2, BookOpen, User, Users, X, Save, GraduationCap, Star } from 'lucide-react';

// Per-department visual config
const DEPT_CONFIG = {
  nurani: {
    label: 'নূরানী বিভাগ',
    gradient: 'from-emerald-500 to-teal-400',
    cardGradient: 'from-emerald-50 to-teal-50',
    headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    topBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    btnBorder: 'border-emerald-200',
    glow: 'shadow-emerald-100',
  },
  nazera: {
    label: 'নাজেরা বিভাগ',
    gradient: 'from-sky-500 to-cyan-400',
    cardGradient: 'from-sky-50 to-cyan-50',
    headerBg: 'bg-gradient-to-r from-sky-500 to-cyan-400',
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-700',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    topBar: 'bg-gradient-to-r from-sky-500 to-cyan-400',
    btnBorder: 'border-sky-200',
    glow: 'shadow-sky-100',
  },
  hifz: {
    label: 'হিফজ বিভাগ',
    gradient: 'from-violet-500 to-purple-400',
    cardGradient: 'from-violet-50 to-purple-50',
    headerBg: 'bg-gradient-to-r from-violet-500 to-purple-400',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-700',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    badgeBorder: 'border-violet-200',
    topBar: 'bg-gradient-to-r from-violet-500 to-purple-400',
    btnBorder: 'border-violet-200',
    glow: 'shadow-violet-100',
  },
  kitab: {
    label: 'কিতাব বিভাগ',
    gradient: 'from-amber-500 to-orange-400',
    cardGradient: 'from-amber-50 to-orange-50',
    headerBg: 'bg-gradient-to-r from-amber-500 to-orange-400',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    topBar: 'bg-gradient-to-r from-amber-500 to-orange-400',
    btnBorder: 'border-amber-200',
    glow: 'shadow-amber-100',
  },
};

const DEPT_ORDER = ['nurani', 'nazera', 'hifz', 'kitab'] as const;
type DeptKey = typeof DEPT_ORDER[number];

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState<DeptKey | 'all'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<DeptKey>('nurani');
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    loadClassesData();
  }, []);

  const loadClassesData = async () => {
    try {
      const [classList, teacherList, studentList] = await Promise.all([
        db.getClasses(),
        db.getTeachers(),
        db.getStudents(),
      ]);
      setClasses(classList);
      setTeachers(teacherList);
      setStudents(studentList);
    } catch (err) {
      console.error('Error loading classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setDepartment('nurani');
    setTeacherId('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: Class) => {
    setEditingId(c.id);
    setName(c.name);
    setDepartment(c.department as DeptKey);
    setTeacherId(c.teacher_id || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) {
      alert('দয়া করে জামাতের নাম এবং বিভাগ নির্বাচন করুন।');
      return;
    }
    try {
      if (editingId) {
        await db.updateClass(editingId, name, department, teacherId || undefined);
      } else {
        await db.addClass(name, department, teacherId || undefined);
      }
      setModalOpen(false);
      loadClassesData();
    } catch (err) {
      alert('তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleDelete = async (id: string) => {
    const hasStudents = students.some(s => s.class_id === id);
    if (hasStudents) {
      alert('দুঃখিত, এই জামাতে শিক্ষার্থীরা ভর্তি আছে! প্রথমে তাদের অন্য জামাতে স্থানান্তর করুন।');
      return;
    }
    if (confirm('আপনি কি নিশ্চিত যে এই জামাত/শ্রেণী মুছে ফেলতে চান?')) {
      try {
        await db.deleteClass(id);
        setClasses(classes.filter(c => c.id !== id));
      } catch (err) {
        alert('মুছতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const toBanglaNum = (num: number | string) => {
    const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => d[parseInt(digit)]);
  };

  const filteredClasses = filterDept === 'all'
    ? classes
    : classes.filter(c => c.department === filterDept);

  const countByDept = (dept: string) => classes.filter(c => c.department === dept).length;
  const studentsByDept = (dept: string) =>
    students.filter(s => classes.find(c => c.id === s.class_id && c.department === dept)).length;

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-32 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <BookOpen size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">জামাত ও শ্রেণী ব্যবস্থাপনা</h3>
              <p className="text-white/80 text-sm mt-1">মাদরাসার সকল জামাত/শ্রেণী তৈরি ও শিক্ষক এসাইন করুন। ({toBanglaNum(classes.length)} টি জামাত)</p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-teal-700 px-5 py-2.5 text-sm font-bold hover:bg-teal-50 transition shadow-md self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>নতুন জামাত তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* ── Department Summary Cards (Clickable Filter) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DEPT_ORDER.map((dept, i) => {
          const cfg = DEPT_CONFIG[dept];
          const isActive = filterDept === dept;
          return (
            <button
              key={dept}
              onClick={() => setFilterDept(isActive ? 'all' : dept)}
              className={`animate-fade-in-up card-motion relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                isActive
                  ? `border-transparent ${cfg.topBar} text-white shadow-lg`
                  : `border-slate-100 bg-white hover:border-transparent hover:shadow-md`
              }`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-xl p-2.5 ${isActive ? 'bg-white/20' : cfg.iconBg} ${isActive ? 'text-white' : cfg.iconText}`}>
                  <BookOpen size={18} />
                </div>
                {isActive && <Star size={14} className="text-white/70" />}
              </div>
              <p className={`text-xs font-semibold mb-1 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>{cfg.label}</p>
              <p className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                {toBanglaNum(countByDept(dept))} টি
              </p>
              <p className={`text-[10px] mt-1 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                {toBanglaNum(studentsByDept(dept))} জন ছাত্র
              </p>
              {!isActive && (
                <div className={`pointer-events-none absolute -right-3 -bottom-3 h-14 w-14 rounded-full bg-gradient-to-br ${cfg.gradient} opacity-10`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Classes Grid ── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="text-sm text-slate-500 font-medium animate-shimmer">জামাত তালিকা লোড হচ্ছে...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((c) => {
            const cfg = DEPT_CONFIG[c.department as DeptKey] || DEPT_CONFIG.nurani;
            const classStudentCount = students.filter(s => s.class_id === c.id).length;
            return (
              <div
                key={c.id}
                className={`animate-pop-in card-motion relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg ${cfg.glow} transition-all duration-200`}
              >
                {/* Color top bar */}
                <div className={`h-1.5 w-full ${cfg.topBar}`}></div>

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl ${cfg.iconBg} ${cfg.iconText} flex items-center justify-center shadow-sm`}>
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 leading-snug">{c.name}</h4>
                        <span className={`mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-6 w-6 rounded-lg ${cfg.iconBg} ${cfg.iconText} flex items-center justify-center`}>
                        <User size={12} />
                      </div>
                      <span>শিক্ষক: <strong className="text-slate-700">{c.teacher_name || 'নিযুক্ত করা হয়নি'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className={`h-6 w-6 rounded-lg ${cfg.iconBg} ${cfg.iconText} flex items-center justify-center`}>
                        <Users size={12} />
                      </div>
                      <span>মোট শিক্ষার্থী: <strong className="text-slate-800">{toBanglaNum(classStudentCount)} জন</strong></span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>ছাত্র অনুপাত</span>
                      <span>{classStudentCount > 0 ? `${classStudentCount}/30` : 'শূন্য'}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700`}
                        style={{ width: `${Math.min((classStudentCount / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-slate-50 pt-4">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                    >
                      <Pencil size={12} />
                      <span>সম্পাদনা</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                    >
                      <Trash2 size={12} />
                      <span>মুছে ফেলুন</span>
                    </button>
                  </div>
                </div>

                {/* Corner glow */}
                <div className={`pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-gradient-to-br ${cfg.gradient} opacity-10`}></div>
              </div>
            );
          })}

          {filteredClasses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-16 text-center text-slate-400">
              <BookOpen size={36} className="text-slate-300" />
              <span className="font-semibold">
                {filterDept === 'all' ? 'কোন জামাত বা শ্রেণী তৈরি করা হয়নি।' : `${DEPT_CONFIG[filterDept]?.label}-এ কোন জামাত নেই।`}
              </span>
              <button
                onClick={handleOpenAddModal}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
              >
                <Plus size={14} />
                নতুন জামাত তৈরি করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl animate-fade-in-up">

            {/* Modal Header */}
            <div className={`flex items-center justify-between px-6 py-4 ${
              DEPT_CONFIG[department]?.headerBg || 'bg-gradient-to-r from-teal-500 to-emerald-500'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <BookOpen size={16} className="text-white" />
                </div>
                <h4 className="font-bold text-white text-base">
                  {editingId ? 'জামাতের তথ্য সংশোধন' : 'নতুন জামাত তৈরি করুন'}
                </h4>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Class Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600">
                  <BookOpen size={11} className="text-teal-500" />
                  জামাত/শ্রেণীর নাম <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="উদা: নূরানী ১ম জামাত, হিফজ ক শাখা ইত্যাদি"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 transition"
                />
              </div>

              {/* Department — clickable buttons */}
              <div>
                <label className="mb-2 flex items-center gap-1 text-xs font-bold text-slate-600">
                  <GraduationCap size={11} className="text-teal-500" />
                  বিভাগ নির্বাচন করুন <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEPT_ORDER.map(dept => {
                    const cfg = DEPT_CONFIG[dept];
                    const isSelected = department === dept;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setDepartment(dept)}
                        className={`rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                          isSelected
                            ? `border-transparent ${cfg.headerBg} text-white shadow-md`
                            : `border-slate-100 bg-white ${cfg.badgeText} hover:border-slate-200`
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teacher */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600">
                  <User size={11} className="text-teal-500" />
                  দায়িত্বপ্রাপ্ত শিক্ষক
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 transition"
                >
                  <option value="">শিক্ষক সিলেক্ট করুন</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border-2 border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 ${
                    DEPT_CONFIG[department]?.headerBg || 'bg-gradient-to-r from-teal-500 to-emerald-500'
                  }`}
                >
                  <Save size={13} />
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
