'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Exam, Class, Student, Result } from '@/types';
import { FileText, Plus, Save, Calendar, CheckSquare, Trophy, Printer, ArrowLeft, Eye, Award, CheckCircle2, XCircle } from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam Scheduler Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [examName, setExamName] = useState('');
  const [classId, setClassId] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [totalMarks, setTotalMarks] = useState(100);

  // Result entry console
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [resultsList, setResultsList] = useState<Result[]>([]);
  const [marksChecklist, setMarksChecklist] = useState<Record<string, number>>({});
  const [savingResults, setSavingResults] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const examList = await db.getExams();
      const classList = await db.getClasses();
      const studentList = await db.getStudents();
      
      setExams(examList);
      setClasses(classList);
      setStudents(studentList);

      if (classList.length > 0) {
        setClassId(classList[0].id);
      }
    } catch (err) {
      console.error('Error loading exams data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load results when active exam changes
  useEffect(() => {
    if (!activeExamId) return;

    const loadExamResults = async () => {
      try {
        const examResults = await db.getResults(activeExamId);
        setResultsList(examResults);

        // Prepopulate input checklist
        const marksMap: Record<string, number> = {};
        examResults.forEach(r => {
          marksMap[r.student_id] = r.marks_obtained;
        });
        setMarksChecklist(marksMap);
      } catch (err) {
        console.error('Error loading results list:', err);
      }
    };
    loadExamResults();
  }, [activeExamId]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !classId || !examDate || !totalMarks) {
      alert('সঠিক তথ্য প্রদান করুন।');
      return;
    }

    try {
      await db.addExam(examName, classId, examDate, Number(totalMarks));
      alert('পরীক্ষার সময়সূচী সফলভাবে তৈরি করা হয়েছে।');
      setExamName('');
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert('পরীক্ষা তৈরি করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleMarkChange = (studentId: string, mark: number) => {
    setMarksChecklist(prev => ({
      ...prev,
      [studentId]: mark
    }));
  };

  const handleSaveResults = async () => {
    if (!activeExamId) return;
    setSavingResults(true);
    try {
      const records = Object.entries(marksChecklist).map(([student_id, marks_obtained]) => ({
        student_id,
        marks_obtained: Number(marks_obtained)
      }));
      await db.saveResults(activeExamId, records);
      alert('পরীক্ষার ফলাফল সফলভাবে সংরক্ষণ করা হয়েছে।');
      
      // Reload results
      const updated = await db.getResults(activeExamId);
      setResultsList(updated);
    } catch (err) {
      alert('ফলাফল সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setSavingResults(false);
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  const activeExam = exams.find(e => e.id === activeExamId);
  const examStudents = students.filter(s => s.class_id === activeExam?.class_id);

  // Sort results to make merit list
  const meritList = [...resultsList].sort((a, b) => b.marks_obtained - a.marks_obtained);
  const passedStudentsCount = meritList.filter(res => res.marks_obtained >= (activeExam?.total_marks || 100) * 0.4).length;

  const statCards = [
    {
      label: 'মোট পরীক্ষা সময়সূচী',
      value: `${toBanglaNum(exams.length)} টি`,
      icon: <FileText size={24} />,
      gradient: 'from-blue-500 to-indigo-400',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      delay: 'delay-0',
    },
    {
      label: 'মোট পরীক্ষা জামাত',
      value: `${toBanglaNum(classes.length)} টি`,
      icon: <Award size={24} />,
      gradient: 'from-violet-500 to-purple-400',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-700',
      delay: 'delay-75',
    },
    {
      label: 'মোট পরীক্ষার্থী',
      value: `${toBanglaNum(students.length)} জন`,
      icon: <Trophy size={24} />,
      gradient: 'from-amber-500 to-orange-400',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      delay: 'delay-150',
    },
  ];

  const inputClass = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition';

  return (
    <div className="space-y-6">
      {activeExamId ? (
        /* ── Result Management Console ── */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveExamId(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition text-white shrink-0"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-xl font-bold">{activeExam?.name}</h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    জামাত: <span className="font-bold text-white">{activeExam?.class_name || 'জামাত'}</span> | তারিখ: {toBanglaNum(activeExam?.exam_date || '')} | পূর্ণমান: {toBanglaNum(activeExam?.total_marks || 100)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSaveResults}
                disabled={savingResults || examStudents.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 text-sm font-bold hover:bg-indigo-50 transition shadow-md disabled:opacity-60 cursor-pointer self-start sm:self-auto"
              >
                <Save size={16} />
                <span>{savingResults ? 'সংরক্ষণ হচ্ছে...' : 'ফলাফল সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Marks Grid */}
            <div className="lg:col-span-2 animate-fade-in-up delay-75 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3.5 flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <CheckSquare size={16} />
                  <span>প্রাপ্ত নম্বর এন্ট্রি শিট (পূর্ণমান: {toBanglaNum(activeExam?.total_marks || 100)})</span>
                </h4>
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/10 font-semibold">
                  পরীক্ষার্থী: {toBanglaNum(examStudents.length)} জন
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-3 px-5">রোল কোড</th>
                      <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                      <th className="py-3 px-4 text-center">প্রাপ্ত নম্বর</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {examStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-400">{s.student_id}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            max={activeExam?.total_marks}
                            min={0}
                            value={marksChecklist[s.id] === undefined ? '' : marksChecklist[s.id]}
                            onChange={(e) => handleMarkChange(s.id, Number(e.target.value))}
                            placeholder="0"
                            className="w-24 text-center px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                          />
                        </td>
                      </tr>
                    ))}
                    {examStudents.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">এই জামাতে কোন ছাত্র তথ্য পাওয়া যায়নি।</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Class Merit List & Report Cards */}
            <div className="animate-fade-in-up delay-150 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-3.5 flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Trophy size={16} />
                  <span>মেধাতালিকা ও রিপোর্ট কার্ড</span>
                </h4>
                <span className="text-[10px] bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                  পাস: {toBanglaNum(passedStudentsCount)} জন
                </span>
              </div>

              <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                {meritList.map((res, index) => {
                  const isPass = res.marks_obtained >= (activeExam?.total_marks || 100) * 0.4;
                  return (
                    <div 
                      key={res.id} 
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        index === 0 ? 'bg-amber-50 border-amber-200' :
                        index === 1 ? 'bg-slate-50 border-slate-200' :
                        index === 2 ? 'bg-orange-50 border-orange-200' :
                        'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                          index === 0 ? 'bg-amber-400 text-amber-950 font-black' :
                          index === 1 ? 'bg-slate-300 text-slate-800' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {toBanglaNum(index + 1)}
                        </span>
                        <div>
                          <span className="block font-bold text-slate-800 text-xs">{res.student_name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">আইডি: {res.student_code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block font-bold text-slate-800 text-sm">{toBanglaNum(res.marks_obtained)}</span>
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold ${isPass ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {isPass ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                            {isPass ? 'উত্তীর্ণ' : 'ফেইল'}
                          </span>
                        </div>
                        {/* Report Card link */}
                        <Link
                          href={`/exams/report-card/${res.id}`}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-indigo-600 transition"
                          title="রিপোর্ট কার্ড প্রিন্ট"
                        >
                          <Printer size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {meritList.length === 0 && (
                  <div className="py-12 text-center text-slate-400 font-semibold flex flex-col items-center gap-2">
                    <Trophy size={32} className="text-slate-300" />
                    <span className="text-xs">কোন পরীক্ষার ফলাফল এখনও সাবমিট করা হয়নি।</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Exams Overview & Scheduling ── */
        <div className="space-y-6">

          {/* Top Banner */}
          <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
            <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-indigo-300/20 blur-xl"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">পরীক্ষা ও ফলাফল বিবরণী</h3>
                  <p className="text-white/80 text-sm mt-1">অর্ধবার্ষিক, বার্ষিক পরীক্ষা নির্ধারণ এবং ফলাফল ডাটা এন্ট্রি শিট। ({toBanglaNum(exams.length)} টি পরীক্ষা)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 text-sm font-bold hover:bg-indigo-50 transition shadow-md self-start sm:self-auto cursor-pointer"
              >
                <Plus size={16} />
                <span>নতুন পরীক্ষা ঘোষণা</span>
              </button>
            </div>
          </div>

          {/* Stat Cards */}
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

          {/* New Exam Scheduling Form */}
          {showAddForm && (
            <form onSubmit={handleCreateExam} className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3.5 flex items-center gap-2">
                <Plus size={16} className="text-white" />
                <span className="font-bold text-white text-sm">নতুন পরীক্ষার সময়সূচী এন্ট্রি</span>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">পরীক্ষার নাম (বাংলায়)</label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৬"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">জামাত/শ্রেণী নির্বাচন</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className={inputClass}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.department.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">পরীক্ষার তারিখ</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">মোট নম্বর</label>
                    <input
                      type="number"
                      required
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white rounded-xl text-sm font-bold transition cursor-pointer shadow-md shrink-0"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Exams list */}
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-slate-500 animate-shimmer">পরীক্ষা তালিকা লোড হচ্ছে...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, idx) => (
                <div 
                  key={exam.id} 
                  className="animate-fade-in-up card-motion relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  style={{ animationDelay: `${idx * 75}ms` }}
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                  <div className="p-5">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-800 leading-snug">{exam.name}</h4>
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100 font-bold">
                            শ্রেণী: {exam.class_name || 'জামাত'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Calendar size={12} />
                        </div>
                        <span>তারিখ: <strong className="text-slate-700">{toBanglaNum(exam.exam_date)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Trophy size={12} />
                        </div>
                        <span>মোট নম্বর: <strong className="text-slate-700">{toBanglaNum(exam.total_marks)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Action button to open entry sheet */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => setActiveExamId(exam.id)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-100 py-2.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>ফলাফল ও মেধাতালিকা দেখুন</span>
                    </button>
                  </div>
                </div>
              ))}

              {exams.length === 0 && (
                <div className="col-span-full bg-white p-16 text-center border border-slate-100 rounded-2xl text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
                  <FileText size={36} className="text-slate-300" />
                  <span>কোন পরীক্ষার সময়সূচী ঘোষণা করা হয়নি।</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
