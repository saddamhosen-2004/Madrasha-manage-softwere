'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Student } from '@/types';
import { Home, Users, CheckCircle2, ShieldAlert, Key, Edit, Heart, Save, Phone, MapPin, DollarSign } from 'lucide-react';

export default function HostelPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Allocation form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelFee, setHostelFee] = useState(1000);
  const [savingAllocation, setSavingAllocation] = useState(false);

  // Custom local storage tracking for rooms
  const [hostelRooms, setHostelRooms] = useState<Record<string, { roomNumber: string; hostelFee: number }>>({});

  // Active Tab
  const [activeTab, setActiveTab] = useState<'residents' | 'lillah' | 'allocate'>('residents');

  useEffect(() => {
    loadHostelData();
  }, []);

  const loadHostelData = async () => {
    try {
      const studentList = await db.getStudents();
      setStudents(studentList);

      // Load room numbers from localStorage
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('hostel_allocations');
        if (local) {
          setHostelRooms(JSON.parse(local));
        } else {
          // Initialize mock allocations for seed students who are hostel residents
          const mockAlloc: Record<string, { roomNumber: string; hostelFee: number }> = {
            'student-2': { roomNumber: '১০১', hostelFee: 1000 },
            'student-3': { roomNumber: '১০৩', hostelFee: 1200 },
            'student-4': { roomNumber: '২০২', hostelFee: 1500 },
            'student-5': { roomNumber: '৩০৫', hostelFee: 0 } // Lillah free boarding
          };
          localStorage.setItem('hostel_allocations', JSON.stringify(mockAlloc));
          setHostelRooms(mockAlloc);
        }
      }
    } catch (err) {
      console.error('Error loading hostel information:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !roomNumber) {
      alert('শিক্ষার্থী ও রুম নাম্বার নির্বাচন করুন।');
      return;
    }

    setSavingAllocation(true);
    try {
      // Update student table: set is_hostel = true
      await db.updateStudent(selectedStudentId, { is_hostel: true });

      // Save room number allocation in localStorage
      const updatedRooms = {
        ...hostelRooms,
        [selectedStudentId]: { 
          roomNumber, 
          hostelFee: students.find(s => s.id === selectedStudentId)?.is_lillah ? 0 : Number(hostelFee)
        }
      };
      localStorage.setItem('hostel_allocations', JSON.stringify(updatedRooms));
      setHostelRooms(updatedRooms);

      alert('রুম বরাদ্দ সফলভাবে সম্পন্ন হয়েছে।');
      setSelectedStudentId('');
      setRoomNumber('');
      loadHostelData(); // reload
    } catch (err) {
      alert('রুম বরাদ্দ সংরক্ষণ করা যায়নি।');
    } finally {
      setSavingAllocation(false);
    }
  };

  const handleRemoveResident = async (studentId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই শিক্ষার্থীকে হোস্টেল বাতিল করতে চান?')) {
      try {
        await db.updateStudent(studentId, { is_hostel: false });
        const updatedRooms = { ...hostelRooms };
        delete updatedRooms[studentId];
        localStorage.setItem('hostel_allocations', JSON.stringify(updatedRooms));
        setHostelRooms(updatedRooms);
        loadHostelData();
      } catch (err) {
        alert('আবাসিক বাতিল করতে সমস্যা হয়েছে।');
      }
    }
  };

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  // Compile Stats
  const hostelResidents = students.filter(s => s.is_hostel);
  const lillahBoarders = students.filter(s => s.is_lillah && s.is_hostel);
  const payingBoarders = hostelResidents.filter(s => !s.is_lillah);
  const activeRooms = Array.from(new Set(Object.values(hostelRooms).map(r => r.roomNumber))).length;

  const statCards = [
    {
      label: 'মোট আবাসিক ছাত্র',
      value: `${toBanglaNum(hostelResidents.length)} জন`,
      icon: <Home size={24} />,
      gradient: 'from-emerald-500 to-teal-400',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      delay: 'delay-0',
    },
    {
      label: 'লিল্লাহ ফ্রি বোর্ডিং',
      value: `${toBanglaNum(lillahBoarders.length)} জন`,
      icon: <Heart size={24} />,
      gradient: 'from-rose-500 to-pink-400',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      delay: 'delay-75',
    },
    {
      label: 'পেইড বোর্ডারস',
      value: `${toBanglaNum(payingBoarders.length)} জন`,
      icon: <Users size={24} />,
      gradient: 'from-sky-500 to-cyan-400',
      lightBg: 'bg-sky-50',
      textColor: 'text-sky-700',
      delay: 'delay-150',
    },
    {
      label: 'ব্যবহৃত রুম সংখ্যা',
      value: `${toBanglaNum(activeRooms)} টি`,
      icon: <Key size={24} />,
      gradient: 'from-amber-500 to-orange-400',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      delay: 'delay-225',
    },
  ];

  const inputClass = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition';

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <Home size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">হোস্টেল ও বোর্ডিং ব্যবস্থাপনা</h3>
              <p className="text-white/80 text-sm mt-1">
                মাদরাসার আবাসিক শিক্ষার্থী, লিল্লাহ বোর্ডিং ও রুম বণ্টন পরিচালনা।
                &nbsp;({toBanglaNum(hostelResidents.length)} জন আবাসিক)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`animate-fade-in-up ${card.delay} card-motion relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm cursor-default`}
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient}`}></div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`rounded-xl ${card.lightBg} p-3 ${card.textColor}`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
              <h4 className="text-2xl font-bold text-slate-800">{card.value}</h4>
            </div>
            <div className={`pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`}></div>
          </div>
        ))}
      </div>

      {/* ── Animated Tab Switcher ── */}
      <div className="animate-fade-in-up flex rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100 gap-1">
        <button
          onClick={() => setActiveTab('residents')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'residents'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Home size={16} />
          আবাসিক ছাত্র তালিকা
        </button>
        <button
          onClick={() => setActiveTab('lillah')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'lillah'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Heart size={16} />
          লিল্লাহ ফ্রি বোর্ডিং
        </button>
        <button
          onClick={() => setActiveTab('allocate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'allocate'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Key size={16} />
          রুম বণ্টন বরাদ্দ
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-slate-500 animate-shimmer">হোস্টেল ডাটা লোড হচ্ছে...</p>
          </div>
        </div>
      ) : activeTab === 'residents' ? (
        /* ── Residents List Table ── */
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3.5 flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <Home size={16} />
              <span>আবাসিক শিক্ষার্থীদের তালিকা</span>
            </h4>
            <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/10 font-semibold">
              মোট: {toBanglaNum(hostelResidents.length)} জন
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4">আইডি কোড</th>
                  <th className="py-3 px-4">ছাত্রের নাম</th>
                  <th className="py-3 px-4">জামাত/শ্রেণী</th>
                  <th className="py-3 px-4 text-center">রুম নম্বর</th>
                  <th className="py-3 px-4 text-right">হোস্টেল ফি</th>
                  <th className="py-3 px-4">বোর্ডিং টাইপ</th>
                  <th className="py-3 px-4 text-center">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                {hostelResidents.map((s) => {
                  const alloc = hostelRooms[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-teal-50/30 transition-colors duration-150">
                      <td className="py-3 px-4 font-bold text-teal-700">{s.student_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 font-medium text-slate-600">{s.class_name || 'জামাত নাই'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                          <Key size={11} className="text-teal-600" />
                          {alloc?.roomNumber || 'বরাদ্দ নাই'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${s.is_lillah ? 'text-slate-400' : 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100'}`}>
                          {s.is_lillah ? '৳০ (ফ্রি)' : `৳${toBanglaNum(alloc?.hostelFee || 1000)}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {s.is_lillah ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            <Heart size={10} className="text-rose-500 fill-rose-500" />
                            লিল্লাহ বোর্ডিং (ফ্রি)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            <Users size={10} className="text-sky-500" />
                            পেইড আবাসিক
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveResident(s.id)}
                          className="px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                        >
                          আবাসিক বাতিল
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {hostelResidents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400 font-semibold">
                      <div className="flex flex-col items-center gap-2">
                        <Home size={32} className="text-slate-300" />
                        <span>কোন আবাসিক ছাত্র রেকর্ড পাওয়া যায়নি।</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'lillah' ? (
        /* ── Lillah List Table ── */
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3.5 flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <Heart size={16} />
              <span>লিল্লাহ বোর্ডিং (ফ্রি আবাসন) তালিকা</span>
            </h4>
            <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/10 font-semibold">
              মোট: {toBanglaNum(lillahBoarders.length)} জন
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4">আইডি কোড</th>
                  <th className="py-3 px-4">ছাত্রের নাম</th>
                  <th className="py-3 px-4">অভিভাবকের মোবাইল</th>
                  <th className="py-3 px-4 text-center">রুম নম্বর</th>
                  <th className="py-3 px-4">ঠিকানা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                {lillahBoarders.map((s) => {
                  const alloc = hostelRooms[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-rose-50/30 transition-colors duration-150">
                      <td className="py-3 px-4 font-bold text-rose-700">{s.student_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-slate-600 font-semibold">
                          <Phone size={11} className="text-slate-400" />
                          {toBanglaNum(s.guardian_phone)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                          <Key size={11} className="text-rose-500" />
                          {alloc?.roomNumber || 'বরাদ্দ নাই'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={11} className="text-slate-400" />
                          {s.address || 'ঠিকানা পাওয়া যায়নি'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {lillahBoarders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-slate-400 font-semibold">
                      <div className="flex flex-col items-center gap-2">
                        <Heart size={32} className="text-slate-300" />
                        <span>কোন লিল্লাহ বোর্ডিং শিক্ষার্থী রেকর্ড পাওয়া যায়নি।</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Allocate Form view ── */
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 flex items-center gap-2">
            <Key size={16} className="text-white" />
            <span className="font-bold text-white text-sm">নতুন রুম বরাদ্দ এন্ট্রি</span>
          </div>

          <form onSubmit={handleAllocateRoom} className="p-6 space-y-4">
            {/* Student Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Users size={11} className="text-amber-500" />
                শিক্ষার্থী নির্বাচন করুন
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className={inputClass.replace('focus:border-teal-400', 'focus:border-amber-400').replace('focus:ring-teal-100', 'focus:ring-amber-100')}
              >
                <option value="">ছাত্র সিলেক্ট করুন</option>
                {students
                  .filter(s => !s.is_hostel)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.student_id} ({s.is_lillah ? 'লিল্লাহ ফ্রি' : `৳${s.monthly_fee} ফি`})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room number */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Key size={11} className="text-amber-500" />
                  রুম নম্বর
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১০২"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className={inputClass.replace('focus:border-teal-400', 'focus:border-amber-400').replace('focus:ring-teal-100', 'focus:ring-amber-100')}
                />
              </div>

              {/* Hostel Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <DollarSign size={11} className="text-amber-500" />
                  হোস্টেল ফি (৳/মাসিক)
                </label>
                <input
                  type="number"
                  required
                  value={hostelFee}
                  onChange={(e) => setHostelFee(Number(e.target.value))}
                  disabled={students.find(s => s.id === selectedStudentId)?.is_lillah}
                  placeholder="1000"
                  className={inputClass.replace('focus:border-teal-400', 'focus:border-amber-400').replace('focus:ring-teal-100', 'focus:ring-amber-100') + ' disabled:bg-slate-50 disabled:text-slate-400'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingAllocation || !selectedStudentId}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
            >
              <Save size={16} />
              <span>{savingAllocation ? 'সংরক্ষণ হচ্ছে...' : 'রুম বরাদ্দ করুন'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
