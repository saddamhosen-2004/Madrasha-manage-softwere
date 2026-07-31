'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, FeeCollection } from '@/types';
import { ArrowLeft, Printer } from 'lucide-react';

export default function FeeReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [fee, setFee] = useState<FeeCollection | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceiptData = async () => {
      try {
        const feesList = await db.getFees();
        const foundFee = feesList.find(f => f.id === id);
        if (!foundFee) {
          alert('রসিদ খুঁজে পাওয়া যায়নি।');
          router.push('/fees');
          return;
        }
        setFee(foundFee);

        const studentData = await db.getStudentById(foundFee.student_id);
        if (studentData) {
          setStudent(studentData);
        }
      } catch (err) {
        console.error('Error loading receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReceiptData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">রসিদ জেনারেট হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!fee || !student) return null;

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const getDeptName = (dept: string) => {
    switch (dept) {
      case 'nurani': return 'নূরানী';
      case 'nazera': return 'নাজেরা';
      case 'hifz': return 'হিফজ';
      case 'kitab': return 'কিতাব';
      default: return dept;
    }
  };

  // Convert amount to Bangla words (simple helper for common tuition fee amounts)
  const getAmountInWords = (amount: number) => {
    const wordsMap: Record<number, string> = {
      500: 'পাঁচশত টাকা মাত্র',
      800: 'আটশত টাকা মাত্র',
      1000: 'এক হাজার টাকা মাত্র',
      1200: 'এক হাজার দুইশত টাকা মাত্র',
      1500: 'এক হাজার পাঁচশত টাকা মাত্র',
      2000: 'দুই হাজার টাকা মাত্র',
      2500: 'দুই হাজার পাঁচশত টাকা মাত্র',
      3000: 'তিন হাজার টাকা মাত্র'
    };
    return wordsMap[amount] || `${toBanglaNum(amount)} টাকা মাত্র`;
  };

  const ReceiptCard = ({ title }: { title: string }) => (
    <div className="border-2 border-emerald-800 p-6 bg-white rounded-lg relative overflow-hidden flex-1 shadow-sm">
      {/* Decorative Border Corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px] rotate-45 translate-x-6 -translate-y-6">
        {title}
      </div>

      {/* Header Info */}
      <div className="text-center pb-4 border-b border-dashed border-slate-300">
        <h3 className="text-lg font-bold text-emerald-800 leading-tight">মোহাম্মাদীয়া তাহফীযুল কুরআন মাদরাসা</h3>
        <p className="text-[10px] text-slate-500 font-medium">মিরপুর-১১, ঢাকা | মোবাইল: ০১৭১২৩৪৫৬৭৮</p>
        <span className="inline-block mt-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 rounded font-bold">
          টাকা প্রাপ্তির রশিদ ({title})
        </span>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs text-slate-700 mt-5">
        <div className="flex border-b border-slate-200 pb-1">
          <span className="text-slate-400 font-medium w-20 shrink-0">রশিদ নম্বর:</span>
          <span className="font-bold text-emerald-900">{fee.receipt_number}</span>
        </div>
        <div className="flex border-b border-slate-200 pb-1">
          <span className="text-slate-400 font-medium w-20 shrink-0">তারিখ:</span>
          <span className="font-semibold">{toBanglaNum(fee.paid_date)}</span>
        </div>
        <div className="flex border-b border-slate-200 pb-1 col-span-2">
          <span className="text-slate-400 font-medium w-20 shrink-0">ছাত্রের নাম:</span>
          <span className="font-bold text-slate-800">{student.name} ({student.student_id})</span>
        </div>
        <div className="flex border-b border-slate-200 pb-1">
          <span className="text-slate-400 font-medium w-20 shrink-0">বিভাগ:</span>
          <span className="font-semibold">{getDeptName(student.department)}</span>
        </div>
        <div className="flex border-b border-slate-200 pb-1">
          <span className="text-slate-400 font-medium w-20 shrink-0">জামাত/শ্রেণী:</span>
          <span className="font-semibold">{student.class_name || 'জামাত নাই'}</span>
        </div>
        <div className="flex border-b border-slate-200 pb-1 col-span-2">
          <span className="text-slate-400 font-medium w-20 shrink-0">ফি আদায় মাস:</span>
          <span className="font-bold text-slate-800">{monthNames[fee.month - 1]} - {toBanglaNum(fee.year)}</span>
        </div>
        <div className="flex border-b border-slate-200 pb-1 col-span-2">
          <span className="text-slate-400 font-medium w-20 shrink-0">কথায়:</span>
          <span className="font-semibold text-slate-800">{getAmountInWords(fee.amount)}</span>
        </div>
      </div>

      {/* Amount Display and Signatures */}
      <div className="flex justify-between items-end mt-8">
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-4 py-2 rounded-lg font-bold text-base">
          টাকার পরিমাণ: ৳{toBanglaNum(fee.amount)}/=
        </div>
        <div className="text-center w-28 border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-500">
          আদায়কারীর স্বাক্ষর
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <Link 
            href="/fees"
            className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 className="text-sm font-bold text-slate-800">রশিদ প্রিন্ট প্রভিউ</h3>
            <p className="text-[10px] text-slate-500">রশিদটি প্রিন্ট করে গ্রাহক এবং মাদরাসায় সংরক্ষণ করুন।</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
        >
          <Printer size={14} />
          <span>রশিদ প্রিন্ট</span>
        </button>
      </div>

      {/* Double Receipt Voucher Layout */}
      <div className="flex flex-col md:flex-row gap-6 print:flex-row print:gap-6 print:border-0">
        <ReceiptCard title="গ্রাহক কপি" />
        <div className="hidden md:block w-[1px] bg-slate-300 border-dashed border-l print:block print:w-[1px] print:border-slate-400"></div>
        <ReceiptCard title="মাদরাসা কপি" />
      </div>
    </div>
  );
}
