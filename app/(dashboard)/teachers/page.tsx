'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Teacher, Class } from '@/types';
import { Search, Plus, Eye, Pencil, Trash2, GraduationCap, Phone, Calendar } from 'lucide-react';

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
        alert('রেকর্ড মুছতে ব্যর্থ হয়েছে।');
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

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800">শিক্ষক ও স্টাফ তালিকা ({toBanglaNum(filteredTeachers.length)} জন)</h3>
          <p className="text-xs text-slate-500 mt-0.5">মাদরাসার শিক্ষক ও কর্মচারীদের বিবরণ, বেতন কাঠামো এবং প্রোফাইল ব্যবস্থাপনা।</p>
        </div>
        <Link 
          href="/teachers/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition self-start sm:self-auto shadow-sm"
        >
          <Plus size={16} />
          <span>নতুন শিক্ষক যোগ করুন</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="শিক্ষকের নাম, মোবাইল নম্বর অথবা শিক্ষাগত যোগ্যতা লিখে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Teachers List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            <span>শিক্ষক তালিকা লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                  <th className="py-3 px-4">নাম</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4">শিক্ষাগত যোগ্যতা</th>
                  <th className="py-3 px-4">দায়িত্বপ্রাপ্ত জামাত</th>
                  <th className="py-3 px-4 text-right">মাসিক বেতন</th>
                  <th className="py-3 px-4">যোগদানের তারিখ</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{t.name}</td>
                    <td className="py-3 px-4 font-mono">{toBanglaNum(t.phone)}</td>
                    <td className="py-3 px-4 font-medium">{t.qualification}</td>
                    <td className="py-3 px-4 font-medium text-emerald-800">{t.class_name || 'জামাত দায়িত্ব দেয়া হয়নি'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">৳{toBanglaNum(t.monthly_salary)}</td>
                    <td className="py-3 px-4">{toBanglaNum(t.joining_date)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/teachers/${t.id}`} 
                          title="বিস্তারিত ও বেতন"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link 
                          href={`/teachers/${t.id}/edit`} 
                          title="সম্পাদনা"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(t.id)} 
                          title="মুছে ফেলুন"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">কোন শিক্ষকের তথ্য পাওয়া হয়নি।</td>
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
