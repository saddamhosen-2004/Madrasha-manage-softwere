'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Student, HifzProgress } from '@/types';
import { BookOpen, User, Calendar, Save, History, AlignLeft, Star, Sparkles } from 'lucide-react';

export default function HifzPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [hifzLogs, setHifzLogs] = useState<HifzProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sabaq, setSabaq] = useState('');
  const [manzil, setManzil] = useState('');
  const [dawr, setDawr] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadHifzStudents = async () => {
      try {
        const studentList = await db.getStudents();
        const hifzList = studentList.filter(s => s.department === 'hifz');
        setStudents(hifzList);
        if (hifzList.length > 0) setSelectedStudentId(hifzList[0].id);
      } catch (err) {
        console.error('Error loading Hifz students:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHifzStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchLogs = async () => {
      try {
        const logs = await db.getHifzProgress(selectedStudentId);
        setHifzLogs(logs);
      } catch (err) {
        console.error('Error loading Hifz logs:', err);
      }
    };
    fetchLogs();
  }, [selectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !date || (!sabaq && !manzil && !dawr)) {
      alert('দয়া করে তারিখ এবং কমপক্ষে একটি সবক/মানজিল/দাওর ঘর পূরণ করুন।');
      return;
    }
    setSaving(true);
    try {
      await db.saveHifzProgress({
        student_id: selectedStudentId,
        date,
        sabaq: sabaq || undefined,
        manzil: manzil || undefined,
        dawr: dawr || undefined,
        notes: notes || undefined
      });
      alert('হিফজ প্রগ্রেস লগ সফলভাবে সংরক্ষণ করা হয়েছে।');
      setSabaq(''); setManzil(''); setDawr(''); setNotes('');
      const updatedLogs = await db.getHifzProgress(selectedStudentId);
      setHifzLogs(updatedLogs);
    } catch (err) {
      alert('অগ্রগতি লগ সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const toBanglaNum = (num: number | string) => {
    const d = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toString().replace(/[0-9]/g, (digit) => d[parseInt(digit)]);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition';

  // Colour for each log card — cycles through palette
  const logColors = [
    { bg: 'bg-violet-50', border: 'border-violet-100', badge: 'bg-violet-100 text-violet-700', iconBg: 'bg-violet-100 text-violet-600' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600' },
    { bg: 'bg-sky-50', border: 'border-sky-100', badge: 'bg-sky-100 text-sky-700', iconBg: 'bg-sky-100 text-sky-600' },
    { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-20 bottom-0 h-32 w-32 rounded-full bg-violet-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <BookOpen size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">হিফজ অগ্রগতি ট্র্যাকিং</h3>
              <p className="text-white/80 text-sm mt-1">হিফজ বিভাগের ছাত্রদের দৈনিক সবক, মানজিল ও দাওর অগ্রগতি রেকর্ড করুন।</p>
            </div>
          </div>
          {/* Student count badge */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/10 px-4 py-2.5 backdrop-blur-sm self-start sm:self-auto">
            <User size={16} className="text-white/70" />
            <span className="text-sm font-bold">{toBanglaNum(students.length)} জন হিফজ ছাত্র</span>
          </div>
        </div>
      </div>

      {/* ── Student Selector ── */}
      <div className="animate-fade-in-up delay-75 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3.5 flex items-center gap-2">
          <User size={16} className="text-white" />
          <span className="font-bold text-white text-sm">হিফজ ছাত্র নির্বাচন করুন</span>
        </div>
        <div className="p-5">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={loading || students.length === 0}
            className={inputClass}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.student_id} ({s.class_name || 'শাখা নাই'})</option>
            ))}
            {students.length === 0 && <option value="">কোন হিফজ ছাত্র নাই</option>}
          </select>

          {/* Selected student profile chip */}
          {selectedStudent && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-violet-50 border border-violet-100 px-4 py-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedStudent.name}</p>
                <p className="text-[11px] text-slate-500">{selectedStudent.student_id} • {selectedStudent.class_name || 'শাখা নাই'}</p>
              </div>
              <span className="ml-auto rounded-lg bg-violet-100 text-violet-700 px-2.5 py-1 text-[10px] font-bold border border-violet-200">হিফজ বিভাগ</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: History Log ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="animate-fade-in-up delay-150 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3.5 flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <History size={16} />
                অগ্রগতির ইতিহাস — {selectedStudent?.name || ''}
              </h4>
              <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/10 font-semibold">
                মোট {toBanglaNum(hifzLogs.length)} টি লগ
              </span>
            </div>

            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {hifzLogs.map((log, idx) => {
                const color = logColors[idx % logColors.length];
                return (
                  <div key={log.id} className={`rounded-2xl border p-4 space-y-3 text-xs transition hover:shadow-md ${color.bg} ${color.border}`}>
                    {/* Log header */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold ${color.badge}`}>
                        <Calendar size={11} />
                        {toBanglaNum(log.date)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">#{log.id.slice(0, 8)}</span>
                    </div>

                    {/* Sabaq / Manzil / Dawr */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { title: 'আজকের সবক', subtitle: '(নতুন মুখস্থ)', value: log.sabaq },
                        { title: 'মানজিল', subtitle: '(সদ্য পড়া রিভিশন)', value: log.manzil },
                        { title: 'দাওর', subtitle: '(পুরনো পড়া রিভিশন)', value: log.dawr },
                      ].map((item, i) => (
                        <div key={i} className="bg-white rounded-xl border border-white p-3 shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.title} <span className="normal-case">{item.subtitle}</span></p>
                          <p className="font-semibold text-slate-700 mt-1.5 leading-snug">{item.value || <span className="text-slate-300 italic">দেয়া হয়নি</span>}</p>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {log.notes && (
                      <div className="flex items-start gap-2 pt-2 border-t border-white/60">
                        <AlignLeft size={12} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">শিক্ষকের মন্তব্য</p>
                          <p className="italic text-slate-600 font-medium">{log.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {hifzLogs.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                    <BookOpen size={28} className="text-violet-300" />
                  </div>
                  <p className="font-semibold text-slate-400">এই শিক্ষার্থীর হিফজ অগ্রগতির<br />কোন পূর্ববর্তী রেকর্ড পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: New Entry Form ── */}
        <div className="animate-fade-in-up delay-225 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 flex items-center gap-2">
            <Star size={16} className="text-white" />
            <span className="font-bold text-white text-sm">নতুন অগ্রগতি রেকর্ড করুন</span>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* Date */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600">
                <Calendar size={11} className="text-emerald-500" />
                তারিখ
              </label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass.replace('focus:border-violet-400','focus:border-emerald-400').replace('focus:ring-violet-100','focus:ring-emerald-100')} />
            </div>

            {/* Sabaq */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600">
                <Sparkles size={11} className="text-emerald-500" />
                আজকের সবক (নতুন পড়া)
              </label>
              <input
                type="text"
                placeholder="উদা: ৩০তম পারা, সুরা নাবা ১-২০ আয়াত"
                value={sabaq}
                onChange={(e) => setSabaq(e.target.value)}
                className={inputClass.replace('focus:border-violet-400','focus:border-emerald-400').replace('focus:ring-violet-100','focus:ring-emerald-100')}
              />
            </div>

            {/* Manzil */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600">
                <BookOpen size={11} className="text-sky-500" />
                মানজিল (সদ্য পড়া রিভিশন)
              </label>
              <input
                type="text"
                placeholder="উদা: ৩০তম পারা, সুরা নাজিয়াত থেকে নাস"
                value={manzil}
                onChange={(e) => setManzil(e.target.value)}
                className={inputClass.replace('focus:border-violet-400','focus:border-sky-400').replace('focus:ring-violet-100','focus:ring-sky-100')}
              />
            </div>

            {/* Dawr */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600">
                <History size={11} className="text-amber-500" />
                দাওর (পুরনো পড়া রিভিশন)
              </label>
              <input
                type="text"
                placeholder="উদা: ২৯তম পারা সম্পূর্ণ রিভিশন"
                value={dawr}
                onChange={(e) => setDawr(e.target.value)}
                className={inputClass.replace('focus:border-violet-400','focus:border-amber-400').replace('focus:ring-violet-100','focus:ring-amber-100')}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600">
                <AlignLeft size={11} className="text-slate-400" />
                শিক্ষকের মন্তব্য / নোট
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="পড়া কেমন ছিল, কোন সূরাতে ভুল বেশি ইত্যাদি..."
                rows={3}
                className={inputClass + ' resize-none'}
              />
            </div>

            <button
              type="submit"
              disabled={saving || !selectedStudentId}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'অগ্রগতি লগ সংরক্ষণ করুন'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
