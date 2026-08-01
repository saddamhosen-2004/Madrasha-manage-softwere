'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Student, Class, Attendance } from '@/types';
import { Calendar, Check, X, ClipboardCheck, History, Users, BarChart2, CheckCircle2, XCircle } from 'lucide-react';

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [checklist, setChecklist] = useState<Record<string, 'present' | 'absent'>>({});
  const [saving, setSaving] = useState(false);

  const [reportStudentId, setReportStudentId] = useState('');
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [allAttendance, setAllAttendance] = useState<Attendance[]>([]);
  const [activeTab, setActiveTab] = useState<'record' | 'report'>('record');

  const monthNames = [
    'জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
    'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'
  ];

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      const classList = await db.getClasses();
      const studentList = await db.getStudents();
      setClasses(classList);
      setStudents(studentList);
      if (classList.length > 0) setSelectedClassId(classList[0].id);
      if (studentList.length > 0) setReportStudentId(studentList[0].id);
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

  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;
    const loadRecords = async () => {
      try {
        const classStudents = students.filter(s => s.class_id === selectedClassId);
        const existingRecords = await db.getAttendance(selectedDate, selectedClassId);
        const newChecklist: Record<string, 'present' | 'absent'> = {};
        classStudents.forEach(s => {
          const record = existingRecords.find(r => r.student_id === s.id);
          newChecklist[s.id] = record ? record.status : 'present';
        });
        setChecklist(newChecklist);
      } catch (err) {
        console.error('Error loading attendance checklist:', err);
      }
    };
    loadRecords();
  }, [selectedClassId, selectedDate, students]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
    setChecklist(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent'> = {};
    Object.keys(checklist).forEach(key => { updated[key] = 'present'; });
    setChecklist(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    setSaving(true);
    try {
      const records = Object.entries(checklist).map(([student_id, status]) => ({ student_id, status }));
      await db.saveAttendance(selectedDate, records);
      alert('আজকের উপস্থিতি রেজিস্টার সফলভাবে সংরক্ষণ করা হয়েছে।');
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('attendance');
        if (local) setAllAttendance(JSON.parse(local));
      }
    } catch (err) {
      alert('সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const toBanglaNum = (num: number | string) => {
    const d = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toString().replace(/[0-9]/g, (digit) => d[parseInt(digit)]);
  };

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
  const presentCount = Object.values(checklist).filter(v => v === 'present').length;
  const absentCount  = Object.values(checklist).filter(v => v === 'absent').length;

  const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 bg-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition';

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-sky-300/20 blur-xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">উপস্থিতি ব্যবস্থাপনা</h3>
            <p className="text-white/80 text-sm mt-1">শিক্ষার্থীদের দৈনিক উপস্থিতি গ্রহণ করুন এবং মাসিক রিপোর্ট দেখুন।</p>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="animate-fade-in-up flex rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100 gap-1">
        <button
          onClick={() => setActiveTab('record')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'record'
              ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck size={16} />
          উপস্থিতি গ্রহণ করুন
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'report'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <BarChart2 size={16} />
          মাসিক উপস্থিতি রিপোর্ট
        </button>
      </div>

      {activeTab === 'record' ? (
        <div className="space-y-5">

          {/* Selectors */}
          <div className="animate-fade-in-up delay-75 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3.5 flex items-center gap-2">
              <Calendar size={16} className="text-white" />
              <span className="font-bold text-white text-sm">জামাত ও তারিখ নির্বাচন করুন</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">জামাত/শ্রেণী</label>
                <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className={inputClass}>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.department.toUpperCase()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">তারিখ</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClass} />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleMarkAllPresent}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 text-sm font-bold hover:bg-emerald-100 transition"
                >
                  <CheckCircle2 size={16} />
                  সবাইকে উপস্থিত চিহ্নিত করুন
                </button>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          {classStudents.length > 0 && (
            <div className="animate-fade-in-up delay-150 grid grid-cols-3 gap-4">
              {[
                { label: 'মোট শিক্ষার্থী', value: classStudents.length, gradient: 'from-blue-500 to-sky-400', bg: 'bg-blue-50', text: 'text-blue-700', icon: <Users size={20} /> },
                { label: 'উপস্থিত', value: presentCount, gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={20} /> },
                { label: 'অনুপস্থিত', value: absentCount, gradient: 'from-rose-500 to-pink-400', bg: 'bg-rose-50', text: 'text-rose-700', icon: <XCircle size={20} /> },
              ].map((s, i) => (
                <div key={i} className="card-motion relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${s.gradient}`}></div>
                  <div className="p-4 flex items-center gap-3">
                    <div className={`rounded-xl ${s.bg} ${s.text} p-2.5`}>{s.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-800">{toBanglaNum(s.value)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checklist Table */}
          <div className="animate-fade-in-up delay-225 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3.5 flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Users size={16} />
                উপস্থিতি চেকলিস্ট
              </h4>
              <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/10 font-semibold">
                {toBanglaNum(classStudents.length)} জন শিক্ষার্থী
              </span>
            </div>

            {loading ? (
              <div className="p-12 flex flex-col items-center gap-3 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
                <span className="text-sm font-medium">ডাটা লোড হচ্ছে...</span>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold text-xs">
                        <th className="py-3 px-5">#</th>
                        <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                        <th className="py-3 px-4 text-center">উপস্থিতি স্থিতি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                      {classStudents.map((s, idx) => (
                        <tr key={s.id} className={`transition-colors duration-150 ${checklist[s.id] === 'present' ? 'bg-emerald-50/40' : checklist[s.id] === 'absent' ? 'bg-rose-50/40' : 'hover:bg-slate-50'}`}>
                          <td className="py-3 px-5 font-bold text-slate-400">{toBanglaNum(idx + 1)}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-slate-800">{s.name}</p>
                              <p className="text-[10px] text-slate-400">{s.student_id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'present')}
                                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                  checklist[s.id] === 'present'
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
                                }`}
                              >
                                <Check size={13} />
                                <span>উপস্থিত</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'absent')}
                                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                  checklist[s.id] === 'absent'
                                    ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-100'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
                                }`}
                              >
                                <X size={13} />
                                <span>অনুপস্থিত</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {classStudents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-14 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                              <Users size={32} className="text-slate-300" />
                              <span className="font-semibold">এই জামাতে কোন ছাত্র তথ্য পাওয়া যায়নি।</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {classStudents.length > 0 && (
                  <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                    <button
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-200 hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
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
        /* ── Report Tab ── */
        <div className="space-y-5">

          {/* Filters */}
          <div className="animate-fade-in-up delay-75 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-3.5 flex items-center gap-2">
              <BarChart2 size={16} className="text-white" />
              <span className="font-bold text-white text-sm">মাসিক রিপোর্ট ফিল্টার</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">শিক্ষার্থী নির্বাচন করুন</label>
                <select value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)} className={inputClass.replace('focus:border-sky-400', 'focus:border-violet-400').replace('focus:ring-sky-100', 'focus:ring-violet-100')}>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.student_id} ({s.class_name || 'জামাত নাই'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">মাস</label>
                <select value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))} className={inputClass.replace('focus:border-sky-400', 'focus:border-violet-400').replace('focus:ring-sky-100', 'focus:ring-violet-100')}>
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">বছর</label>
                <select value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))} className={inputClass.replace('focus:border-sky-400', 'focus:border-violet-400').replace('focus:ring-sky-100', 'focus:ring-violet-100')}>
                  <option value={2025}>{toBanglaNum(2025)}</option>
                  <option value={2026}>{toBanglaNum(2026)}</option>
                  <option value={2027}>{toBanglaNum(2027)}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Report Stat Cards */}
          <div className="animate-fade-in-up delay-150 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'মোট কার্যদিবস', value: `${toBanglaNum(reportStats.totalDays)} দিন`, gradient: 'from-blue-500 to-sky-400', bg: 'bg-blue-50', text: 'text-blue-700', icon: <Calendar size={20} /> },
              { label: 'উপস্থিত', value: `${toBanglaNum(reportStats.presentDays)} দিন`, gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={20} /> },
              { label: 'অনুপস্থিত', value: `${toBanglaNum(reportStats.absentDays)} দিন`, gradient: 'from-rose-500 to-pink-400', bg: 'bg-rose-50', text: 'text-rose-700', icon: <XCircle size={20} /> },
              { label: 'উপস্থিতি হার', value: `${toBanglaNum(reportStats.percentage)}%`, gradient: 'from-violet-500 to-purple-400', bg: 'bg-violet-50', text: 'text-violet-700', icon: <BarChart2 size={20} /> },
            ].map((s, i) => (
              <div key={i} className="card-motion relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className={`h-1.5 w-full bg-gradient-to-r ${s.gradient}`}></div>
                <div className="p-4">
                  <div className={`rounded-xl ${s.bg} ${s.text} p-2.5 w-fit mb-3`}>{s.icon}</div>
                  <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{s.value}</p>
                </div>
                <div className={`pointer-events-none absolute -right-3 -bottom-3 h-14 w-14 rounded-full bg-gradient-to-br ${s.gradient} opacity-10`}></div>
              </div>
            ))}
          </div>

          {/* Attendance Progress Bar */}
          <div className="animate-fade-in-up delay-225 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">উপস্থিতি হার</span>
              <span className={`text-xs font-bold ${reportStats.percentage >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>{toBanglaNum(reportStats.percentage)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${reportStats.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-pink-400'}`}
                style={{ width: `${reportStats.percentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">{reportStats.percentage >= 75 ? '✅ উপস্থিতি সন্তোষজনক' : '⚠️ উপস্থিতি কম, মনোযোগ দরকার'}</p>
          </div>

          {/* Logs Table */}
          <div className="animate-fade-in-up delay-300 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3.5 flex items-center gap-2">
              <History size={16} className="text-white" />
              <span className="font-bold text-white text-sm">তারিখ ভিত্তিক উপস্থিতি লগ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3 px-5">তারিখ</th>
                    <th className="py-3 px-4">উপস্থিতি স্থিতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {reportStats.logs
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((log) => (
                      <tr key={log.id} className={`transition-colors ${log.status === 'present' ? 'hover:bg-emerald-50/30' : 'hover:bg-rose-50/30'}`}>
                        <td className="py-3 px-5 font-semibold text-slate-700">{toBanglaNum(log.date)}</td>
                        <td className="py-3 px-4">
                          {log.status === 'present' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                              <Check size={10} /> উপস্থিত
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                              <X size={10} /> অনুপস্থিত
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {reportStats.logs.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <History size={28} className="text-slate-300" />
                          <span className="font-semibold">এই মাসের কোন উপস্থিতির লগ ডাটা পাওয়া যায়নি।</span>
                        </div>
                      </td>
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
