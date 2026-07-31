'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Class } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

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
    } catch (err) {
      alert('নতুন শিক্ষক যোগ করতে সমস্যা হয়েছে।');
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Link 
          href="/teachers"
          className="p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h3 className="text-lg font-bold text-slate-800">নতুন শিক্ষক যোগ করার ফরম</h3>
          <p className="text-xs text-slate-500 mt-0.5">মাদরাসায় দায়িত্বপ্রাপ্ত শিক্ষকদের মৌলিক ও পেশাগত তথ্য যুক্ত করুন।</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">ব্যক্তিগত ও শিক্ষাগত বিবরণ</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                শিক্ষকের নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: হাফেজ মাওলানা আব্দুর রহমান"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: ০১৭১০০০০০০০"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষাগত যোগ্যতা</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="যেমন: দাওরায়ে হাদিস, হিফজ সম্পন্ন"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">অভিজ্ঞতা</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="যেমন: ৫ বছর"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ঠিকানা</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="স্থায়ী ও বর্তমান ঠিকানা লিখুন"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            ></textarea>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">চাকরি ও মাদরাসা বিবরণী</h4>

          {/* Assiged Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত জামাত/শ্রেণী</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">জামাত সিলেক্ট করুন</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.department})</option>
              ))}
            </select>
          </div>

          {/* Monthly Salary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মাসিক বেতন (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              যোগদানের তারিখ <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষকের ছবি</label>
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
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer"
            >
              <Save size={16} />
              <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
            <Link
              href="/teachers"
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
