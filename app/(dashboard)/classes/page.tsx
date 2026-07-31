'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Class, Teacher, Student } from '@/types';
import { Plus, Pencil, Trash2, BookOpen, User, Users, X, Save } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<'nurani' | 'nazera' | 'hifz' | 'kitab'>('nurani');
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    loadClassesData();
  }, []);

  const loadClassesData = async () => {
    try {
      const classList = await db.getClasses();
      const teacherList = await db.getTeachers();
      const studentList = await db.getStudents();
      
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
    setDepartment(c.department);
    setTeacherId(c.teacher_id || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) {
      alert('দয়া করে জামাতের নাম এবং বিভাগ নির্বাচন করুন।');
      return;
    }

    try {
      if (editingId) {
        await db.updateClass(editingId, name, department, teacherId || undefined);
        alert('জামাতের তথ্য সফলভাবে আপডেট হয়েছে।');
      } else {
        await db.addClass(name, department, teacherId || undefined);
        alert('নতুন জামাত সফলভাবে তৈরি হয়েছে।');
      }
      setModalOpen(false);
      loadClassesData();
    } catch (err) {
      alert('তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleDelete = async (id: string) => {
    // Check if class has students
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
        alert('মুছতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  const getDeptName = (dept: string) => {
    switch (dept) {
      case 'nurani': return 'নূরানী বিভাগ';
      case 'nazera': return 'নাজেরা বিভাগ';
      case 'hifz': return 'হিফজ বিভাগ';
      case 'kitab': return 'কিতাব বিভাগ';
      default: return dept;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800">জামাত ও শ্রেণী ব্যবস্থাপনা</h3>
          <p className="text-xs text-slate-500 mt-0.5">মাদরাসার সকল জামাত/শ্রেণী তৈরি ও শিক্ষক এসাইন করুন।</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition self-start sm:self-auto shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>নতুন জামাত তৈরি করুন</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500 font-medium">জামাত তালিকা লোড হচ্ছে...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => {
            const classStudentCount = students.filter(s => s.class_id === c.id).length;
            return (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-800 leading-snug">{c.name}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          {getDeptName(c.department)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span>শিক্ষক: <strong className="text-slate-700 font-semibold">{c.teacher_name || 'নিযুক্ত করা হয়নি'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span>মোট শিক্ষার্থী: <strong className="text-slate-700 font-bold">{toBanglaNum(classStudentCount)} জন</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 border-t border-slate-100 pt-3.5 mt-4">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-350 bg-white py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition"
                  >
                    <Pencil size={12} />
                    <span>সম্পাদনা</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-350 bg-white py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition"
                  >
                    <Trash2 size={12} />
                    <span>মুছে ফেলুন</span>
                  </button>
                </div>
              </div>
            );
          })}

          {classes.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-400 font-semibold">
              কোন জামাত বা শ্রেণী তৈরি করা হয়নি।
            </div>
          )}
        </div>
      )}

      {/* Class Create/Edit Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 text-base">
                {editingId ? 'জামাতের তথ্য সংশোধন করুন' : 'নতুন জামাত তৈরি করুন'}
              </h4>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Class Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জামাত/শ্রেণীর নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="উদা: নূরানী ১ম জামাত, হিফজ ক শাখা ইত্যাদি"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিভাগ নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="nurani">নূরানী বিভাগ</option>
                  <option value="nazera">নাজেরা বিভাগ</option>
                  <option value="hifz">হিফজ বিভাগ</option>
                  <option value="kitab">কিতাব বিভাগ</option>
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত শিক্ষক</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">শিক্ষক সিলেক্ট করুন</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition text-xs font-bold text-white shadow cursor-pointer"
                >
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
