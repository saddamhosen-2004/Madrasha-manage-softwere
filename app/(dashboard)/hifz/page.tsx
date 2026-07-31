'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Student, HifzProgress } from '@/types';
import { BookOpen, User, Calendar, Save, History, AlignLeft } from 'lucide-react';

export default function HifzPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [hifzLogs, setHifzLogs] = useState<HifzProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
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
        if (hifzList.length > 0) {
          setSelectedStudentId(hifzList[0].id);
        }
      } catch (err) {
        console.error('Error loading Hifz students:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHifzStudents();
  }, []);

  // Fetch progress logs when selected student changes
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
      alert('দয়া করে তারিখ এবং কমপক্ষে একটি সবক/মানজিল/দাওর ঘর পূরণ করুন।');
      return;
    }

    setSaving(true);
    try {
      const newLog = await db.saveHifzProgress({
        student_id: selectedStudentId,
        date,
        sabaq: sabaq || undefined,
        manzil: manzil || undefined,
        dawr: dawr || undefined,
        notes: notes || undefined
      });
      alert('হিফজ প্রগ্রেস লগ সফলভাবে সংরক্ষণ করা হয়েছে।');
      
      // Clear fields
      setSabaq('');
      setManzil('');
      setDawr('');
      setNotes('');

      // Reload logs
      const updatedLogs = await db.getHifzProgress(selectedStudentId);
      setHifzLogs(updatedLogs);
    } catch (err) {
      alert('অগ্রগতি লগ সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Header and selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="md:col-span-2 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">হিফজ প্রগ্রেস ট্র্যাকিং</h3>
            <p className="text-xs text-slate-500">হিফজ বিভাগের ছাত্রদের দৈনিক সবক, মানজিল ও দাওর অগ্রগতি রেকর্ড করুন।</p>
          </div>
        </div>

        {/* Student Dropdown Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">হিফজ ছাত্র নির্বাচন করুন</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={loading || students.length === 0}
            className="w-full px-3 py-1.5 border border-slate-350 rounded-lg text-xs text-slate-700 bg-white"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} - {s.student_id} ({s.class_name || 'শাখা নাই'})</option>
            ))}
            {students.length === 0 && <option value="">কোন হিফজ ছাত্র নাই</option>}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress History Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <History size={18} className="text-emerald-600" />
              <span>অগ্রগতির ইতিহাস তালিকা ({selectedStudent?.name || ''})</span>
            </h4>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {hifzLogs.map((log) => (
                <div key={log.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-200/50 pb-2 text-slate-500">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>তারিখ: {toBanglaNum(log.date)}</span>
                    </span>
                    <span>লগ আইডি: {toBanglaNum(log.id.slice(0, 8))}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="block text-[9px] text-slate-400 font-bold">আজকের সবক (নতুন মুখস্থ)</span>
                      <p className="font-semibold text-slate-850 mt-1 leading-snug">{log.sabaq || 'দেয়া হয়নি'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="block text-[9px] text-slate-400 font-bold">আজকের মানজিল (সদ্য পড়া রিভিশন)</span>
                      <p className="font-semibold text-slate-850 mt-1 leading-snug">{log.manzil || 'দেয়া হয়নি'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="block text-[9px] text-slate-400 font-bold">আজকের দাওর (পুরনো রিভিশন)</span>
                      <p className="font-semibold text-slate-850 mt-1 leading-snug">{log.dawr || 'দেয়া হয়নি'}</p>
                    </div>
                  </div>

                  {log.notes && (
                    <div className="pt-2 border-t border-slate-200/50 flex items-start gap-1.5">
                      <AlignLeft size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold">শিক্ষকের মন্তব্য</span>
                        <p className="italic text-slate-700 font-medium mt-0.5">{log.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {hifzLogs.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-semibold bg-slate-50 border border-dashed rounded-xl">
                  এই শিক্ষার্থীর হিফজ অগ্রগতির কোন পূর্ববর্তী রেকর্ড পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: New Progress Record Entry Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 h-fit">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Save size={18} className="text-emerald-600" />
            <span>নতুন অগ্রগতি রেকর্ড করুন</span>
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Sabaq */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                আজকের সবক (নতুন পড়া)
              </label>
              <input
                type="text"
                placeholder="উদা: ৩০তম পারা, সুরা নাবা ১-২০ আয়াত"
                value={sabaq}
                onChange={(e) => setSabaq(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Manzil */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মানজিল (সদ্য পড়া রিভিশন)
              </label>
              <input
                type="text"
                placeholder="উদা: ৩০তম পারা, সুরা নাজিয়াত থেকে নাস"
                value={manzil}
                onChange={(e) => setManzil(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Dawr */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                দাওর (পুরনো পড়া রিভিশন)
              </label>
              <input
                type="text"
                placeholder="উদা: ২৯তম পারা সম্পূর্ণ রিভিশন"
                value={dawr}
                onChange={(e) => setDawr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Remarks / Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষকের মন্তব্য / নোট</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="পড়া কেমন ছিল, কোন সূরাতে ভুল বেশি ইত্যাদি..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving || !selectedStudentId}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer shadow"
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
