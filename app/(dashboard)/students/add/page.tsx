'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Class } from '@/types';
import { ArrowLeft, Save, User, Phone, MapPin, Calendar, BookOpen, Banknote, Home, Heart, Camera } from 'lucide-react';

export default function AddStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

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
      const filtered = classList.filter(c => c.department === 'nurani');
      if (filtered.length > 0) setClassId(filtered[0].id);
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const deptClasses = classes.filter(c => c.department === department);
    setClassId(deptClasses.length > 0 ? deptClasses[0].id : '');
    if (!isLillah) {
      if (department === 'nurani') setMonthlyFee(1000);
      else if (department === 'nazera') setMonthlyFee(1200);
      else if (department === 'hifz') setMonthlyFee(1500);
      else if (department === 'kitab') setMonthlyFee(2000);
    }
  }, [department, classes, isLillah]);

  useEffect(() => {
    if (isLillah) {
      setMonthlyFee(0);
    } else {
      if (department === 'nurani') setMonthlyFee(1000);
      else if (department === 'nazera') setMonthlyFee(1200);
      else if (department === 'hifz') setMonthlyFee(1500);
      else if (department === 'kitab') setMonthlyFee(2000);
    }
  }, [isLillah, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fatherName || !motherName || !guardianPhone || !dateOfBirth || !admissionDate) {
      alert('অনুগ্রহ করে সকল তারকাচিহ্নিত (*) আবশ্যক ক্ষেত্র পূরণ করুন।');
      return;
    }
    setLoading(true);
    try {
      await db.addStudent({
        name, father_name: fatherName, mother_name: motherName,
        guardian_phone: guardianPhone, address,
        date_of_birth: dateOfBirth, admission_date: admissionDate,
        department, class_id: classId || undefined,
        monthly_fee: Number(monthlyFee),
        is_lillah: isLillah, is_hostel: isHostel,
        photo_url: photoUrl || undefined
      });
      router.push('/students');
    } catch (err) {
      alert('নতুন শিক্ষার্থী ভর্তি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const deptOptions = [
    { value: 'nurani', label: 'নূরানী বিভাগ', gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700', activeBg: 'bg-emerald-600' },
    { value: 'nazera', label: 'নাজেরা বিভাগ', gradient: 'from-sky-500 to-cyan-400',      bg: 'bg-sky-50',      text: 'text-sky-700',     activeBg: 'bg-sky-600'     },
    { value: 'hifz',   label: 'হিফজ বিভাগ',   gradient: 'from-violet-500 to-purple-400', bg: 'bg-violet-50',   text: 'text-violet-700',  activeBg: 'bg-violet-600'  },
    { value: 'kitab',  label: 'কিতাব বিভাগ',  gradient: 'from-amber-500 to-orange-400',  bg: 'bg-amber-50',    text: 'text-amber-700',   activeBg: 'bg-amber-600'   },
  ];

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition placeholder-slate-400 bg-white";
  const labelClass = "flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5";

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <Link href="/students" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 className="text-xl font-bold">নতুন শিক্ষার্থী ভর্তি ফরম</h3>
            <p className="text-white/80 text-xs mt-0.5">নতুন ছাত্রের তথ্য পূরণ করে সংরক্ষণ করুন</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Personal Info ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal Details Card */}
          <div className="animate-fade-in-up delay-75 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 flex items-center gap-2">
              <User size={16} className="text-white" />
              <span className="font-bold text-white text-sm">ব্যক্তিগত বিবরণী</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <User size={13} className="text-emerald-600" />
                  ছাত্রের নাম (বাংলায়) <span className="text-rose-500">*</span>
                </label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="যেমন: আহমদ আব্দুল্লাহ" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  <Phone size={13} className="text-violet-600" />
                  অভিভাবকের মোবাইল <span className="text-rose-500">*</span>
                </label>
                <input type="text" required value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="যেমন: ০১৭০০০০০০০০" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  <User size={13} className="text-blue-600" />
                  পিতার নাম <span className="text-rose-500">*</span>
                </label>
                <input type="text" required value={fatherName} onChange={e => setFatherName(e.target.value)}
                  placeholder="পিতার নাম লিখুন" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  <User size={13} className="text-pink-600" />
                  মাতার নাম <span className="text-rose-500">*</span>
                </label>
                <input type="text" required value={motherName} onChange={e => setMotherName(e.target.value)}
                  placeholder="মাতার নাম লিখুন" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  <Calendar size={13} className="text-amber-600" />
                  জন্ম তারিখ <span className="text-rose-500">*</span>
                </label>
                <input type="date" required value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                  className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  <Calendar size={13} className="text-cyan-600" />
                  ভর্তির তারিখ <span className="text-rose-500">*</span>
                </label>
                <input type="date" required value={admissionDate} onChange={e => setAdmissionDate(e.target.value)}
                  className={inputClass} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  <MapPin size={13} className="text-rose-500" />
                  ঠিকানা
                </label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="বর্তমান ও স্থায়ী ঠিকানা লিখুন" rows={3}
                  className={inputClass + " resize-none"} />
              </div>
            </div>
          </div>

          {/* Department Picker Card */}
          <div className="animate-fade-in-up delay-150 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-3.5 flex items-center gap-2">
              <BookOpen size={16} className="text-white" />
              <span className="font-bold text-white text-sm">বিভাগ নির্বাচন করুন</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {deptOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDepartment(opt.value as any)}
                    className={`relative overflow-hidden rounded-xl p-3 text-center transition-all border-2 card-motion ${
                      department === opt.value
                        ? `bg-gradient-to-br ${opt.gradient} border-transparent text-white shadow-md`
                        : `${opt.bg} ${opt.text} border-transparent hover:border-slate-200`
                    }`}
                  >
                    <span className="block text-sm font-bold">{opt.label}</span>
                    {department === opt.value && (
                      <span className="block text-[10px] mt-0.5 text-white/80">✓ নির্বাচিত</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Class Selector */}
              <div className="mt-4">
                <label className={labelClass}>
                  <BookOpen size={13} className="text-violet-600" />
                  জামাত/শ্রেণী নির্বাচন করুন
                </label>
                <select value={classId} onChange={e => setClassId(e.target.value)}
                  className={inputClass}>
                  <option value="">জামাত সিলেক্ট করুন</option>
                  {classes.filter(c => c.department === department).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Settings ── */}
        <div className="space-y-5">

          {/* Fee & Status Card */}
          <div className="animate-fade-in-up delay-225 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3.5 flex items-center gap-2">
              <Banknote size={16} className="text-white" />
              <span className="font-bold text-white text-sm">ফি ও বোর্ডিং</span>
            </div>
            <div className="p-5 space-y-4">
              {/* Monthly Fee */}
              <div>
                <label className={labelClass}>
                  <Banknote size={13} className="text-blue-600" />
                  মাসিক ফি পরিমাণ (৳)
                </label>
                <input type="number" value={monthlyFee}
                  onChange={e => setMonthlyFee(Number(e.target.value))}
                  disabled={isLillah} placeholder="0.00"
                  className={inputClass + " disabled:bg-slate-100 disabled:text-slate-400"} />
              </div>

              {/* Lillah Toggle */}
              <div
                onClick={() => setIsLillah(!isLillah)}
                className={`flex items-center justify-between rounded-xl p-3.5 border-2 cursor-pointer transition-all ${
                  isLillah
                    ? 'bg-rose-50 border-rose-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLillah ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Heart size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700">লিল্লাহ বোর্ডিং?</span>
                    <span className="text-[10px] text-slate-400">এতিম ও অসহায় শিক্ষার্থী</span>
                  </div>
                </div>
                <div className={`h-5 w-9 rounded-full transition-all ${isLillah ? 'bg-rose-500' : 'bg-slate-300'} relative`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isLillah ? 'left-4' : 'left-0.5'}`}></span>
                </div>
              </div>

              {/* Hostel Toggle */}
              <div
                onClick={() => setIsHostel(!isHostel)}
                className={`flex items-center justify-between rounded-xl p-3.5 border-2 cursor-pointer transition-all ${
                  isHostel
                    ? 'bg-sky-50 border-sky-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isHostel ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Home size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700">হোস্টেল আবাসিক?</span>
                    <span className="text-[10px] text-slate-400">মাদ্রাসার হোস্টেলে থাকবে</span>
                  </div>
                </div>
                <div className={`h-5 w-9 rounded-full transition-all ${isHostel ? 'bg-sky-500' : 'bg-slate-300'} relative`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isHostel ? 'left-4' : 'left-0.5'}`}></span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Upload Card */}
          <div className="animate-fade-in-up delay-300 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-3.5 flex items-center gap-2">
              <Camera size={16} className="text-white" />
              <span className="font-bold text-white text-sm">শিক্ষার্থীর ছবি</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-300 overflow-hidden">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera size={28} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-2">JPG, PNG ফরম্যাট সমর্থিত</p>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="animate-fade-in-up delay-375 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 space-y-3">
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60 shadow-md">
              <Save size={16} />
              <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
            <Link href="/students"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition text-center">
              <ArrowLeft size={15} />
              বাতিল করুন
            </Link>
          </div>

        </div>
      </form>
    </div>
  );
}
