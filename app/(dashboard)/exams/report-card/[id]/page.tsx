'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, Exam, Result } from '@/types';
import { ArrowLeft, Printer, Award } from 'lucide-react';

export default function ReportCardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [result, setResult] = useState<Result | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportCard = async () => {
      try {
        // Read results from local storage or get from database API
        let allResults: Result[] = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('results');
          if (local) allResults = JSON.parse(local);
        }

        // Find result by id
        const foundResult = allResults.find(r => r.id === id);
        if (!foundResult) {
          alert('ফলাফল রেকর্ড খুঁজে পাওয়া যায়নি।');
          router.push('/exams');
          return;
        }
        setResult(foundResult);

        const studentData = await db.getStudentById(foundResult.student_id);
        if (studentData) setStudent(studentData);

        const examsList = await db.getExams();
        const foundExam = examsList.find(e => e.id === foundResult.exam_id);
        if (foundExam) setExam(foundExam);

      } catch (err) {
        console.error('Error loading report card data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReportCard();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">রিপোর্ট কার্ড জেনারেট হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!result || !student || !exam) return null;

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

  const percentage = (result.marks_obtained / exam.total_marks) * 100;
  const isPass = result.marks_obtained >= exam.total_marks * 0.4;

  const getGrade = (pct: number) => {
    if (!isPass) return 'ফেইল';
    if (pct >= 80) return 'মুমতাজ (এ+)';
    if (pct >= 70) return 'জায়্যিদ জিদ্দান (এ)';
    if (pct >= 60) return 'জায়্যিদ (এ-)';
    if (pct >= 50) return 'মাকবুল (বি)';
    return 'সি';
  };

  const grade = getGrade(percentage);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-sm font-bold text-slate-800">পরীক্ষার ফলাফল মূল্যায়ন পত্র</h3>
            <p className="text-[10px] text-slate-500">শিক্ষার্থীর পরীক্ষার ফলাফল কার্ড প্রিন্ট করে অভিভাবককে প্রদান করুন।</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow"
        >
          <Printer size={14} />
          <span>রিপোর্ট প্রিন্ট</span>
        </button>
      </div>

      {/* Evaluation Certificate Design */}
      <div className="border-[6px] border-double border-emerald-800 p-8 bg-white rounded-2xl relative overflow-hidden shadow-md print-card">
        {/* Corner Badges */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-800 text-white rounded-full flex items-center justify-center opacity-10"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-emerald-800 text-white rounded-full flex items-center justify-center opacity-10"></div>

        {/* Header Logo & Title */}
        <div className="text-center pb-6 border-b-2 border-dashed border-emerald-800/20">
          <h3 className="text-2xl font-black text-emerald-800 tracking-wide">মোহাম্মাদীয়া তাহফীযুল কুরআন মাদরাসা</h3>
          <p className="text-xs text-slate-500 mt-1 font-semibold">মিরপুর-১১, পল্লবী, ঢাকা-১২১৬ | মোবাইল: ০১৭১২৩৪৫৬৭৮</p>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-1 rounded-full font-bold text-sm">
              <Award size={16} />
              <span>ফলাফল মূল্যায়ন পত্র (শিক্ষার্থী প্রগতি কার্ড)</span>
            </div>
          </div>
        </div>

        {/* Certificate Body fields */}
        <div className="mt-8 space-y-5 text-sm text-slate-700">
          {/* Exam info header */}
          <div className="text-center font-bold text-base text-slate-800 py-1 bg-slate-50 border rounded border-slate-100">
            পরীক্ষা: {exam.name}
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold w-24 shrink-0">ছাত্রের নাম:</span>
              <span className="font-bold text-slate-850">{student.name}</span>
            </div>
            <div className="flex border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold w-24 shrink-0">শিক্ষার্থী আইডি:</span>
              <span className="font-bold text-emerald-900">{student.student_id}</span>
            </div>
            <div className="flex border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold w-24 shrink-0">মাদরাসা বিভাগ:</span>
              <span className="font-semibold">{getDeptName(student.department)}</span>
            </div>
            <div className="flex border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold w-24 shrink-0">জামাত/শ্রেণী:</span>
              <span className="font-semibold">{student.class_name || 'নাই'}</span>
            </div>
          </div>

          {/* Marks Summary Grid Card */}
          <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-6">
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">পূর্ণমান</span>
              <span className="text-xl font-bold text-slate-800 block mt-1">{toBanglaNum(exam.total_marks)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">প্রাপ্ত নম্বর</span>
              <span className="text-xl font-black text-emerald-800 block mt-1">{toBanglaNum(result.marks_obtained)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">সাফল্যের শতকরা হার</span>
              <span className="text-xl font-bold text-slate-800 block mt-1">{toBanglaNum(percentage.toFixed(0))}%</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">অর্জন গ্রেড</span>
              <span className="text-xl font-black text-emerald-800 block mt-1">{grade}</span>
            </div>
          </div>

          {/* Teacher remarks simulator */}
          <div className="pt-4">
            <span className="block text-xs font-semibold text-slate-400 mb-1">শিক্ষক মূল্যায়ন মন্তব্য:</span>
            <p className="border border-slate-200 rounded-lg p-3 text-xs italic bg-slate-50/50 text-slate-600 leading-relaxed min-h-[4rem]">
              {result.marks_obtained >= exam.total_marks * 0.8
                ? 'মাশাআল্লাহ! অত্যন্ত সন্তোষজনক ফলাফল। পড়ালেখার প্রতি মনোযোগ ধরে রাখার উপদেশ দেওয়া হলো।'
                : result.marks_obtained >= exam.total_marks * 0.5
                ? 'পড়ালেখা মোটামুটি ভালো ছিল। তবে কুরআনের প্রতি মনোনিবেশ এবং হাতের লেখা আরও সুন্দর করা প্রয়োজন।'
                : 'ফলাফল সন্তোষজনক নয়। পড়ালেখার প্রতি তীব্র অবহেলা লক্ষণীয়। অভিভাবককে মাদরাসায় এসে শিক্ষকের সাথে সাক্ষাৎ করার আহ্বান জানানো যাচ্ছে।'}
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-16 px-6">
          <div className="text-center w-36 border-t border-slate-400 pt-1.5 text-xs font-bold text-slate-500">
            শ্রেণী শিক্ষকের স্বাক্ষর
          </div>
          <div className="text-center w-36 border-t border-slate-400 pt-1.5 text-xs font-bold text-slate-500">
            মুহতামিম/অধ্যক্ষ
          </div>
        </div>
      </div>
    </div>
  );
}
