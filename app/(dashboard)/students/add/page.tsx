'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Class } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().slice(0, 10));
  const [department, setDepartment] = useState<'nurani' | 'nazera' | 'hifz' | 'kitab'>('nurani');
  const [classId, setClassId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(1000);
  const [isLillah, setIsLillah] = useState(false);
  const [isHostel, setIsHostel] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      const classList = await db.getClasses();
      setClasses(classList);
      // Select first class of selected department by default
      const filtered = classList.filter(c => c.department === 'nurani');
      if (filtered.length > 0) setClassId(filtered[0].id);
    };
    loadClasses();
  }, []);

  // Update default class and fee based on department
  useEffect(() => {
    const deptClasses = classes.filter(c => c.department === department);
    if (deptClasses.length > 0) {
      setClassId(deptClasses[0].id);
    } else {
      setClassId('');
    }

    // Set default fee suggestions based on department
    if (!isLillah) {
      if (department === 'nurani') setMonthlyFee(1000);
      else if (department === 'nazera') setMonthlyFee(1200);
      else if (department === 'hifz') setMonthlyFee(1500);
      else if (department === 'kitab') setMonthlyFee(2000);
    }
  }, [department, classes, isLillah]);

  // Handle Lillah Boarding fee override
  useEffect(() => {
    if (isLillah) {
      setMonthlyFee(0);
    } else {
      // restore default suggestion
      if (department === 'nurani') setMonthlyFee(1000);
      else if (department === 'nazera') setMonthlyFee(1200);
      else if (department === 'hifz') setMonthlyFee(1500);
      else if (department === 'kitab') setMonthlyFee(2000);
    }
  }, [isLillah, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fatherName || !motherName || !guardianPhone || !dateOfBirth || !admissionDate || !department) {
      alert('অনুগ্রহ করে সকল তারকাচিহ্নিত (*) আবশ্যক ক্ষেত্র পূরণ করুন।');
      return;
    }

    setLoading(true);
    try {
      await db.addStudent({
        name,
        father_name: fatherName,
        mother_name: motherName,
        guardian_phone: guardianPhone,
        address,
        date_of_birth: dateOfBirth,
        admission_date: admissionDate,
        department,
        class_id: classId || undefined,
        monthly_fee: Number(monthlyFee),
        is_lillah: isLillah,
        is_hostel: isHostel,
        photo_url: photoUrl || undefined
      });
      router.push('/students');
    } catch (err) {
      alert('নতুন শিক্ষার্থী ভর্তি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // Mock Photo Upload Simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file upload setting URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Link 
          href="/students"
          className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h3 className="text-lg font-bold text-slate-800">নতুন শিক্ষার্থী ভর্তি ফরম</h3>
          <p className="text-xs text-slate-500 mt-0.5">নতুন ছাত্রের তথ্য দিয়ে ভর্তি কার্যক্রম সম্পন্ন করুন।</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal info */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">ব্যক্তিগত বিবরণী</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ছাত্রের নাম (বাংলায়) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আহমদ আব্দুল্লাহ"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                অভিভাবকের মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="যেমন: ০১৭০০০০০০০০"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পিতার নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="পিতার নাম লিখুন"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মাতার নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="মাতার নাম লিখুন"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                জন্ম তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ভর্তির তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ঠিকানা</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="বর্তমান ও স্থায়ী ঠিকানা লিখুন"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            ></textarea>
          </div>
        </div>

        {/* Right Column: Admission & Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">ভর্তি ও বিভাগীয় বিবরণী</h4>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বিভাগ নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="nurani">নূরানী বিভাগ</option>
              <option value="nazera">নাজেরা বিভাগ</option>
              <option value="hifz">হিফজ বিভাগ</option>
              <option value="kitab">কিতাব বিভাগ</option>
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">জামাত/শ্রেণী</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">জামাত সিলেক্ট করুন</option>
              {classes
                .filter(c => c.department === department)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              }
            </select>
          </div>

          {/* Monthly Fee */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মাসিক ফি পরিমাণ (৳)
            </label>
            <input
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(Number(e.target.value))}
              disabled={isLillah}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          {/* Status Switches */}
          <div className="space-y-3 pt-2">
            {/* Lillah Boarding */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>
                <span className="block text-xs font-bold text-slate-700">লিল্লাহ বোর্ডিং?</span>
                <span className="text-[10px] text-slate-400">এতিম ও অসহায় শিক্ষার্থীদের ক্ষেত্রে প্রযোজ্য</span>
              </div>
              <input
                type="checkbox"
                checked={isLillah}
                onChange={(e) => setIsLillah(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            {/* Hostel */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>
                <span className="block text-xs font-bold text-slate-700">হোস্টেল আবাসিক?</span>
                <span className="text-[10px] text-slate-400">মাদ্রাসার হোস্টেলে অবস্থান করবে কিনা</span>
              </div>
              <input
                type="checkbox"
                checked={isHostel}
                onChange={(e) => setIsHostel(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষার্থীর ছবি</label>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="h-14 w-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-xs text-slate-500 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400"
            >
              <Save size={16} />
              <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
            <Link
              href="/students"
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
            >
              বাতিল
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
