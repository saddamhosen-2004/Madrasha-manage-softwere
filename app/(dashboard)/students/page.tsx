'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, Class } from '@/types';
import { Search, UserPlus, Eye, Pencil, Trash2, Filter } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
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
        alert('রেকর্ড মুছতে ব্যর্থ হয়েছে।');
      }
    }
  };

  // Filter students based on search and filters
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
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  const getDeptName = (dept: string) => {
    switch (dept) {
      case 'nurani': return 'নূরানী';
      case 'nazera': return 'নাজেরা';
      case 'hifz': return 'হিফজ';
      case 'kitab': return 'কিতাব';
      default: return dept;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800">মোট ছাত্র তালিকা ({toBanglaNum(filteredStudents.length)} জন)</h3>
          <p className="text-xs text-slate-500 mt-0.5">মাদ্রাসার সকল শিক্ষার্থীদের তালিকা, সার্চ এবং ফিল্টার করুন।</p>
        </div>
        <Link 
          href="/students/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition self-start sm:self-auto shadow-sm"
        >
          <UserPlus size={16} />
          <span>নতুন ছাত্র ভর্তি</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="ছাত্রের নাম, আইডি কোড অথবা মোবাইল নম্বর দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Dept Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedClass('all'); // reset class filter
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">সকল বিভাগ</option>
            <option value="nurani">নূরানী বিভাগ</option>
            <option value="nazera">নাজেরা বিভাগ</option>
            <option value="hifz">হিফজ বিভাগ</option>
            <option value="kitab">কিতাব বিভাগ</option>
          </select>
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">সকল জামাত/শ্রেণী</option>
            {classes
              .filter(c => selectedDept === 'all' || c.department === selectedDept)
              .map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            <span>ছাত্র তালিকা লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                  <th className="py-3 px-4">আইডি কোড</th>
                  <th className="py-3 px-4">নাম (বাংলা)</th>
                  <th className="py-3 px-4">অভিভাবকের ফোন</th>
                  <th className="py-3 px-4">বিভাগ</th>
                  <th className="py-3 px-4">জামাত/শ্রেণী</th>
                  <th className="py-3 px-4 text-right">মাসিক ফি</th>
                  <th className="py-3 px-4">অবস্থা</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-emerald-800">{s.student_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="py-3 px-4 font-mono">{toBanglaNum(s.guardian_phone)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {getDeptName(s.department)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{s.class_name || 'জামাত নির্বাচন করা হয়নি'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {s.is_lillah ? 'লিল্লাহ (ফ্রি)' : `৳${toBanglaNum(s.monthly_fee)}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {s.is_hostel && (
                          <span className="inline-block text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100 font-semibold max-w-max">
                            আবাসিক (হোস্টেল)
                          </span>
                        )}
                        {s.is_lillah && (
                          <span className="inline-block text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 font-semibold max-w-max">
                            লিল্লাহ বোর্ডিং
                          </span>
                        )}
                        {!s.is_hostel && !s.is_lillah && (
                          <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold max-w-max">
                            অনাবাসিক
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/students/${s.id}`} 
                          title="বিস্তারিত প্রোফাইল"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link 
                          href={`/students/${s.id}/edit`} 
                          title="সম্পাদনা"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(s.id)} 
                          title="মুছে ফেলুন"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">কোন শিক্ষার্থীর তথ্য পাওয়া যায়নি।</td>
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
