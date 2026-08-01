'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Class } from '@/types';
import { ArrowLeft, Save, User, Phone, GraduationCap, MapPin, Calendar, Banknote, BookOpen, Camera } from 'lucide-react';

export default function AddTeacherPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [classId, setClassId] = useState('');
  const [monthlySalary, setMonthlySalary] = useState(15000);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      const classList = await db.getClasses();
      setClasses(classList);
    };
    loadClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !joiningDate || !monthlySalary) {
      alert('অনুগ্রহ করে সকল তারকাচিহ্নিত (*) আবশ্যক ক্ষেত্র পূরণ করুন।');
      return;
    }

    setLoading(true);
    try {
      await db.addTeacher({
        name,
        phone,
        address,
        qualification,
        experience,
        class_id: classId || undefined,
        monthly_salary: Number(monthlySalary),
        joining_date: joiningDate,
        photo_url: photoUrl || undefined
      });
      router.push('/teachers');
    } catch (err: any) {
      alert('নতুন শিক্ষক যোগ করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition';

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <Link
            href="/teachers"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 className="text-xl font-bold">নতুন শিক্ষক যোগ করার ফরম</h3>
            <p className="text-white/80 text-xs mt-0.5">মাদরাসায় দায়িত্বপ্রাপ্ত শিক্ষকদের মৌলিক ও পেশাগত তথ্য যুক্ত করুন।</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Personal & Academic Info ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Section 1: Personal Details */}
          <div className="animate-fade-in-up delay-75 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 flex items-center gap-2">
              <User size={16} className="text-white" />
              <span className="font-bold text-white text-sm">ব্যক্তিগত তথ্য</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <User size={11} className="text-emerald-500" />
                  শিক্ষকের নাম <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: হাফেজ মাওলানা আব্দুর রহমান"
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Phone size={11} className="text-emerald-500" />
                  মোবাইল নম্বর <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: ০১৭১০০০০০০০"
                  className={inputClass}
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <GraduationCap size={11} className="text-emerald-500" />
                  শিক্ষাগত যোগ্যতা
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="যেমন: দাওরায়ে হাদিস, হিফজ সম্পন্ন"
                  className={inputClass}
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Calendar size={11} className="text-emerald-500" />
                  অভিজ্ঞতা
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="যেমন: ৫ বছর"
                  className={inputClass}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-500" />
                  ঠিকানা
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="স্থায়ী ও বর্তমান ঠিকানা লিখুন"
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Job Details & Photo ── */}
        <div className="space-y-5">

          {/* Section 2: Job & Salary */}
          <div className="animate-fade-in-up delay-150 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3.5 flex items-center gap-2">
              <Banknote size={16} className="text-white" />
              <span className="font-bold text-white text-sm">চাকরি ও বেতন তথ্য</span>
            </div>
            <div className="p-5 space-y-4">

              {/* Assigned Class */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <BookOpen size={11} className="text-violet-500" />
                  দায়িত্বপ্রাপ্ত জামাত/শ্রেণী
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">জামাত সিলেক্ট করুন</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.department})</option>
                  ))}
                </select>
              </div>

              {/* Monthly Salary */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Banknote size={11} className="text-violet-500" />
                  মাসিক বেতন (৳) <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Calendar size={11} className="text-violet-500" />
                  যোগদানের তারিখ <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Photo */}
          <div className="animate-fade-in-up delay-225 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-3.5 flex items-center gap-2">
              <Camera size={16} className="text-white" />
              <span className="font-bold text-white text-sm">শিক্ষকের ছবি</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4">
                {/* Photo Preview */}
                <div className="h-20 w-20 rounded-2xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center text-amber-300 overflow-hidden shrink-0 shadow-inner">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User size={32} className="text-amber-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 mb-2">JPG, PNG বা GIF ফরম্যাট সমর্থিত।</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="animate-fade-in-up delay-300 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer shadow-md"
            >
              <Save size={16} />
              <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
            <Link
              href="/teachers"
              className="flex-1 inline-flex items-center justify-center rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition text-center"
            >
              বাতিল
            </Link>
          </div>
        </div>

      </form>
    </div>
  );
}
