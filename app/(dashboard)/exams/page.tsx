'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Exam, Class, Student, Result } from '@/types';
import { FileText, Plus, Save, Calendar, CheckSquare, Trophy, Printer, ArrowLeft, Eye } from 'lucide-react';

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
      alert('পরীক্ষার সময়সূচী সফলভাবে তৈরি করা হয়েছে।');
      setExamName('');
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert('পরীক্ষা তৈরি করতে ব্যর্থ হয়েছে।');
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
      alert('পরীক্ষার ফলাফল সফলভাবে সংরক্ষণ করা হয়েছে।');
      
      // Reload results
      const updated = await db.getResults(activeExamId);
      setResultsList(updated);
    } catch (err) {
      alert('ফলাফল সংরক্ষণ করতে সমস্যা হয়েছে।');
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

  return (
    <div className="space-y-6">
      {activeExamId ? (
        /* Result Management Console */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveExamId(null)}
                className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-base font-bold text-slate-800">{activeExam?.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">জামাত: {activeExam?.class_name} | তারিখ: {toBanglaNum(activeExam?.exam_date || '')}</p>
              </div>
            </div>
            <button
              onClick={handleSaveResults}
              disabled={savingResults || examStudents.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer shadow"
            >
              <Save size={14} />
              <span>{savingResults ? 'সংরক্ষণ হচ্ছে...' : 'ফলাফল সংরক্ষণ করুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Marks Grid */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-600" />
                <span>প্রাপ্ত নম্বর এন্ট্রি শিট (পূর্ণমান: {toBanglaNum(activeExam?.total_marks || 100)})</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">রোল কোড</th>
                      <th className="py-2.5 px-3">নাম</th>
                      <th className="py-2.5 px-3 text-center">প্রাপ্ত নম্বর</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {examStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-500">{s.student_id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{s.name}</td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            max={activeExam?.total_marks}
                            min={0}
                            value={marksChecklist[s.id] === undefined ? '' : marksChecklist[s.id]}
                            onChange={(e) => handleMarkChange(s.id, Number(e.target.value))}
                            placeholder="0"
                            className="w-20 text-center px-2 py-1 border border-slate-350 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                          />
                        </td>
                      </tr>
                    ))}
                    {examStudents.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400 font-semibold">এই জামাতে কোন ছাত্র তথ্য পাওয়া যায়নি।</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Class Merit List & Report Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 h-fit">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Trophy size={16} className="text-emerald-600" />
                <span>মেধাতালিকা ও রিপোর্ট কার্ড</span>
              </h4>

              <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                {meritList.map((res, index) => {
                  const isPass = res.marks_obtained >= (activeExam?.total_marks || 100) * 0.4;
                  return (
                    <div key={res.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm
                          ${index === 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                            index === 1 ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-500'}`}>
                          {toBanglaNum(index + 1)}
                        </span>
                        <div>
                          <span className="block font-bold text-slate-800">{res.student_name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">আইডি: {res.student_code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block font-extrabold text-slate-800">{toBanglaNum(res.marks_obtained)}</span>
                          <span className={`text-[8px] font-bold uppercase ${isPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isPass ? 'উত্তীর্ণ' : 'ফেইল'}
                          </span>
                        </div>
                        {/* Report Card link */}
                        <Link
                          href={`/exams/report-card/${res.id}`}
                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-500 transition"
                          title="রিপোর্ট কার্ড প্রিন্ট"
                        >
                          <Printer size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {meritList.length === 0 && (
                  <p className="text-center text-slate-400 py-6 text-xs font-medium">কোন পরীক্ষার ফলাফল এখনও সাবমিট করা হয়নি।</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Exams Overview & Scheduling */
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-800">পরীক্ষা ও ফলাফল বিবরণী</h3>
              <p className="text-xs text-slate-500 mt-0.5">অর্ধবার্ষিক, বার্ষিক পরীক্ষা নির্ধারণ এবং ফলাফল ডাটা এন্ট্রি শিট।</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition self-start sm:self-auto shadow shadow-emerald-600/10 cursor-pointer"
            >
              <Plus size={16} />
              <span>নতুন পরীক্ষা ঘোষণা</span>
            </button>
          </div>

          {/* New Exam Scheduling Form */}
          {showAddForm && (
            <form onSubmit={handleCreateExam} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">পরীক্ষার নাম (বাংলায়)</label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৬"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-850 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">জামাত/শ্রেণী নির্বাচন</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.department.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">পরীক্ষার তারিখ</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">মোট নম্বর</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-850 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow shadow-emerald-600/10 shrink-0"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {/* Exams list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-800 leading-snug">{exam.name}</h4>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        শ্রেণী: {exam.class_name || 'জামাত'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>তারিখ: {toBanglaNum(exam.exam_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-slate-400" />
                    <span>মোট নম্বর: {toBanglaNum(exam.total_marks)}</span>
                  </div>
                </div>

                {/* Action button to open entry sheet */}
                <button
                  onClick={() => setActiveExamId(exam.id)}
                  className="w-full mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 py-2 text-xs font-bold text-emerald-800 transition cursor-pointer"
                >
                  <Eye size={13} />
                  <span>ফলাফল ও মেধাতালিকা দেখুন</span>
                </button>
              </div>
            ))}

            {exams.length === 0 && (
              <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-400 font-semibold">
                কোন পরীক্ষার সময়সূচী ঘোষণা করা হয়নি।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
