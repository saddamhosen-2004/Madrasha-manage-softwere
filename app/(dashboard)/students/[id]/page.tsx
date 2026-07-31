'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, FeeCollection, HifzProgress } from '@/types';
import { ArrowLeft, Pencil, FileDown, Calendar, Banknote, BookOpen, User, Phone, MapPin } from 'lucide-react';

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<FeeCollection[]>([]);
  const [hifzProgress, setHifzProgress] = useState<HifzProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const studentData = await db.getStudentById(id);
        if (!studentData) {
          alert('শিক্ষার্থীর প্রোফাইল খুঁজে পাওয়া যায়নি।');
          router.push('/students');
          return;
        }
        setStudent(studentData);

        const feeData = await db.getFees();
        setFees(feeData.filter(f => f.student_id === id));

        if (studentData.department === 'hifz') {
          const progress = await db.getHifzProgress(id);
          setHifzProgress(progress);
        }
      } catch (err) {
        console.error('Error loading student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!student) return null;

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

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <Link 
            href="/students"
            className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 className="text-lg font-bold text-slate-800">শিক্ষার্থী প্রোফাইল বিস্তারিত</h3>
            <p className="text-xs text-slate-500 mt-0.5">{student.name} ({student.student_id}) - এর প্রোফাইল কার্ড</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <FileDown size={14} />
            <span>প্রিন্ট করুন</span>
          </button>
          <Link 
            href={`/students/${student.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <Pencil size={14} />
            <span>তথ্য পরিবর্তন</span>
          </Link>
        </div>
      </div>

      {/* Main card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-card">
        {/* Left Card: Profile Image & Statuses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
          <div className="h-28 w-28 rounded-full border-4 border-emerald-50 bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
            {student.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.photo_url} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <User size={48} className="text-slate-300" />
            )}
          </div>
          
          <h4 className="text-xl font-bold text-slate-800 mt-4">{student.name}</h4>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full mt-1.5">
            আইডি: {student.student_id}
          </span>

          <div className="w-full border-t border-slate-100 my-4"></div>

          {/* Details */}
          <div className="w-full space-y-3 text-xs text-left">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">বিভাগ</span>
              <span className="font-bold text-slate-700">{getDeptName(student.department)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">জামাত/শ্রেণী</span>
              <span className="font-semibold text-slate-700">{student.class_name || 'নাই'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">মাসিক ফি</span>
              <span className="font-bold text-slate-700">
                {student.is_lillah ? 'লিল্লাহ (ফ্রি)' : `৳${toBanglaNum(student.monthly_fee)}`}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">হোস্টেল আবাসিক?</span>
              <span className="font-semibold text-slate-700">{student.is_hostel ? 'হ্যাঁ' : 'না'}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Personal info tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Family & Background */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              <span>পারিবারিক ও ব্যক্তিগত তথ্য</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                <User size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">পিতার নাম</span>
                  <span className="font-semibold">{student.father_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                <User size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">মাতার নাম</span>
                  <span className="font-semibold">{student.mother_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">অভিভাবকের মোবাইল নম্বর</span>
                  <span className="font-semibold">{toBanglaNum(student.guardian_phone)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">জন্ম তারিখ</span>
                  <span className="font-semibold">{toBanglaNum(student.date_of_birth)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">ভর্তির তারিখ</span>
                  <span className="font-semibold">{toBanglaNum(student.admission_date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 md:col-span-2">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">বর্তমান ও স্থায়ী ঠিকানা</span>
                  <span className="font-semibold">{student.address || 'ঠিকানা দেয়া হয়নি'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Fee Collections History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <Banknote size={16} className="text-emerald-600" />
              <span>বেতন ও ফি পরিশোধের ইতিহাস</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-2 px-3">রশিদ নং</th>
                    <th className="py-2 px-3">পরিশোধের মাস</th>
                    <th className="py-2 px-3 text-right">আদায়কৃত পরিমাণ</th>
                    <th className="py-2 px-3">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {fees.map((f) => {
                    const monthNames = [
                      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
                      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
                    ];
                    return (
                      <tr key={f.id} className="hover:bg-slate-50 transition">
                        <td className="py-2 px-3 font-semibold text-emerald-800">{f.receipt_number}</td>
                        <td className="py-2 px-3">{monthNames[f.month - 1]} - {toBanglaNum(f.year)}</td>
                        <td className="py-2 px-3 text-right font-bold">৳{toBanglaNum(f.amount)}</td>
                        <td className="py-2 px-3 text-slate-500">{toBanglaNum(f.paid_date)}</td>
                      </tr>
                    );
                  })}
                  {fees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">এই শিক্ষার্থীর কোন ফি আদায়ের রেকর্ড পাওয়া যায়নি।</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Hifz Progress Logs (Conditional) */}
          {student.department === 'hifz' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" />
                <span>হিফজ সবক ও প্রগ্রেস রেকর্ড</span>
              </h4>
              <div className="space-y-4">
                {hifzProgress.map((hp) => (
                  <div key={hp.id} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5 text-slate-500">
                      <span className="font-semibold text-emerald-800">তারিখ: {toBanglaNum(hp.date)}</span>
                      <span>লগ আইডি: {toBanglaNum(hp.id.slice(0, 8))}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold">আজকের সবক (নতুন মুখস্থ)</span>
                        <p className="font-medium text-slate-800 mt-0.5">{hp.sabaq || 'দেয়া হয়নি'}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold">আজকের মানজিল (সদ্য পড়া রিভিশন)</span>
                        <p className="font-medium text-slate-800 mt-0.5">{hp.manzil || 'দেয়া হয়নি'}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold">আজকের দাওর (পুরনো রিভিশন)</span>
                        <p className="font-medium text-slate-800 mt-0.5">{hp.dawr || 'দেয়া হয়নি'}</p>
                      </div>
                    </div>
                    {hp.notes && (
                      <div className="pt-2 border-t border-slate-200/50">
                        <span className="block text-[10px] text-slate-400 font-semibold">শিক্ষকের মন্তব্য</span>
                        <p className="italic text-slate-600 mt-0.5">{hp.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                {hifzProgress.length === 0 && (
                  <p className="text-center text-slate-400 py-4">হিফজ বিভাগের কোন প্রগ্রেস রেকর্ড পাওয়া যায়নি।</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
