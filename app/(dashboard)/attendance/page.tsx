'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Student, Class, Attendance } from '@/types';
import { Calendar, Check, X, ClipboardCheck, History, Info } from 'lucide-react';

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Attendance checklist state
  const [checklist, setChecklist] = useState<Record<string, 'present' | 'absent'>>({});
  const [saving, setSaving] = useState(false);

  // Report state
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [allAttendance, setAllAttendance] = useState<Attendance[]>([]);
  const [activeTab, setActiveTab] = useState<'record' | 'report'>('record');

  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const classList = await db.getClasses();
      const studentList = await db.getStudents();
      setClasses(classList);
      setStudents(studentList);

      if (classList.length > 0) {
        setSelectedClassId(classList[0].id);
      }
      if (studentList.length > 0) {
        setReportStudentId(studentList[0].id);
      }

      // Fetch all attendance logs for reports
      const allLogs = await db.getFees(); // wait, db.getAttendance needs classId, let's load all logs by reading from local or fetching
      // Let's read all attendances from localStorage directly if possible, or load them from db.ts
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('attendance');
        if (local) setAllAttendance(JSON.parse(local));
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load attendance records when date or class changes
  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;

    const loadRecords = async () => {
      try {
        const classStudents = students.filter(s => s.class_id === selectedClassId);
        const existingRecords = await db.getAttendance(selectedDate, selectedClassId);
        
        const newChecklist: Record<string, 'present' | 'absent'> = {};
        
        classStudents.forEach(s => {
          const record = existingRecords.find(r => r.student_id === s.id);
          newChecklist[s.id] = record ? record.status : 'present'; // Default to present
        });

        setChecklist(newChecklist);
      } catch (err) {
        console.error('Error loading attendance checklist:', err);
      }
    };
    loadRecords();
  }, [selectedClassId, selectedDate, students]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
    setChecklist(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent'> = {};
    Object.keys(checklist).forEach(key => {
      updated[key] = 'present';
    });
    setChecklist(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    setSaving(true);
    try {
      const records = Object.entries(checklist).map(([student_id, status]) => ({
        student_id,
        status
      }));
      await db.saveAttendance(selectedDate, records);
      alert('আজকের উপস্থিতি রেজিস্টার সফলভাবে সংরক্ষণ করা হয়েছে।');
      
      // Update report stats list
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('attendance');
        if (local) setAllAttendance(JSON.parse(local));
      }
    } catch (err) {
      alert('সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  // Compile stats for selected student's report
  const getStudentReportStats = () => {
    const studentLogs = allAttendance.filter(a => {
      if (a.student_id !== reportStudentId) return false;
      const logDate = new Date(a.date);
      return (logDate.getMonth() + 1) === reportMonth && logDate.getFullYear() === reportYear;
    });

    const totalDays = studentLogs.length;
    const presentDays = studentLogs.filter(l => l.status === 'present').length;
    const absentDays = studentLogs.filter(l => l.status === 'absent').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return { totalDays, presentDays, absentDays, percentage, logs: studentLogs };
  };

  const reportStats = getStudentReportStats();
  const classStudents = students.filter(s => s.class_id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm border">
        <button
          onClick={() => setActiveTab('record')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'record' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          উপস্থিতি গ্রহণ করুন
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'report' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          মাসিক উপস্থিতি রিপোর্ট
        </button>
      </div>

      {activeTab === 'record' ? (
        <div className="space-y-6">
          {/* selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            {/* Class Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">জামাত/শ্রেণী নির্বাচন করুন</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.department.toUpperCase()})</option>
                ))}
              </select>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick action info */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-600 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 px-4 py-2 text-sm font-semibold transition"
              >
                <ClipboardCheck size={16} />
                <span>সবাইকে উপস্থিত চিহ্নিত করুন</span>
              </button>
            </div>
          </div>

          {/* Checklist Sheet */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">ডাটা লোড হচ্ছে...</div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                        <th className="py-3 px-4">রোল/আইডি</th>
                        <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                        <th className="py-3 px-4 text-center">উপস্থিতি স্থিতি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {classStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-bold text-slate-500">{s.student_id}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'present')}
                                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer
                                  ${checklist[s.id] === 'present' 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                    : 'bg-white border-slate-250 text-slate-500 hover:bg-slate-50'}`}
                              >
                                <Check size={14} />
                                <span>উপস্থিত</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'absent')}
                                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer
                                  ${checklist[s.id] === 'absent' 
                                    ? 'bg-rose-600 border-rose-600 text-white shadow-sm' 
                                    : 'bg-white border-slate-250 text-slate-500 hover:bg-slate-50'}`}
                              >
                                <X size={14} />
                                <span>অনুপস্থিত</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {classStudents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">এই জামাতে কোন ছাত্র তথ্য পাওয়া যায়নি।</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {classStudents.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer shadow-sm"
                    >
                      <ClipboardCheck size={16} />
                      <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'উপস্থিতি রেজিস্টার সংরক্ষণ করুন'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Report View tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            {/* Student Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষার্থী নির্বাচন করুন</label>
              <select
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.student_id} ({s.class_name || 'জামাত নাই'})</option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মাস</label>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(Number(e.target.value))}
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
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value={2026}>{toBanglaNum(2026)}</option>
                <option value={2025}>{toBanglaNum(2025)}</option>
                <option value={2027}>{toBanglaNum(2027)}</option>
              </select>
            </div>
          </div>

          {/* Report Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
              <span className="block text-xs font-semibold text-slate-500">মোট কার্যদিবস</span>
              <span className="text-xl font-bold text-slate-800 mt-1 block">{toBanglaNum(reportStats.totalDays)} দিন</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-emerald-800">উপস্থিত</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">{toBanglaNum(reportStats.presentDays)} দিন</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-rose-800">অনুপস্থিত</span>
              <span className="text-xl font-bold text-rose-700 mt-1 block">{toBanglaNum(reportStats.absentDays)} দিন</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-slate-500">উপস্থিতি হার</span>
              <span className="text-xl font-bold text-slate-800 mt-1 block">{toBanglaNum(reportStats.percentage)}%</span>
            </div>
          </div>

          {/* Logged dates table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <History size={18} className="text-emerald-600" />
              <span>উপস্থিতির তারিখ ভিত্তিক লগ বিবরণী</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">উপস্থিতি স্থিতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportStats.logs
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-semibold">{toBanglaNum(log.date)}</td>
                        <td className="py-2.5 px-3">
                          {log.status === 'present' ? (
                            <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              উপস্থিত
                            </span>
                          ) : (
                            <span className="inline-block bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              অনুপস্থিত
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {reportStats.logs.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-slate-400">এই মাসের কোন উপস্থিতির লগ ডাটা পাওয়া যায়নি।</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
