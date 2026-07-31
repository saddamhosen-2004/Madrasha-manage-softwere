'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Student } from '@/types';
import { Home, Users, CheckCircle2, ShieldAlert, Key, Edit, Heart, Save } from 'lucide-react';

export default function HostelPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Allocation form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelFee, setHostelFee] = useState(1000);
  const [savingAllocation, setSavingAllocation] = useState(false);

  // Custom local storage tracking for rooms (since we don't have a room field in student table, we can save a map in local storage, or mock it.
  // Wait! Let's save a map of { studentId: { roomNumber, hostelFee } } in localStorage, and load it!). That is extremely clean and matches Supabase/local hybrid db structure perfectly.
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

      alert('রুম বরাদ্দ সফলভাবে সম্পন্ন হয়েছে।');
      setSelectedStudentId('');
      setRoomNumber('');
      loadHostelData(); // reload
    } catch (err) {
      alert('রুম বরাদ্দ সংরক্ষণ করা যায়নি।');
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
        alert('আবাসিক বাতিল করতে সমস্যা হয়েছে।');
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

  return (
    <div className="space-y-6">
      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg"><Home size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">মোট আবাসিক ছাত্র</span>
            <span className="text-xl font-bold text-slate-800">{toBanglaNum(hostelResidents.length)} জন</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg"><Heart size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">লিল্লাহ বোর্ডিং</span>
            <span className="text-xl font-bold text-slate-800">{toBanglaNum(lillahBoarders.length)} জন</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-sky-50 text-sky-700 rounded-lg"><Users size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">পেইড বোর্ডারস</span>
            <span className="text-xl font-bold text-slate-800">{toBanglaNum(payingBoarders.length)} জন</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg"><Key size={20} /></div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">ব্যবহৃত রুম সংখ্যা</span>
            <span className="text-xl font-bold text-slate-800">{toBanglaNum(activeRooms)} টি</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm border">
        <button
          onClick={() => setActiveTab('residents')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'residents' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          আবাসিক ছাত্র তালিকা
        </button>
        <button
          onClick={() => setActiveTab('lillah')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'lillah' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          লিল্লাহ ফ্রি বোর্ডিং
        </button>
        <button
          onClick={() => setActiveTab('allocate')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'allocate' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          রুম বণ্টন বরাদ্দ
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">ডাটা লোড হচ্ছে...</div>
      ) : activeTab === 'residents' ? (
        /* Residents List Table */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                  <th className="py-3 px-4">আইডি কোড</th>
                  <th className="py-3 px-4">ছাত্রের নাম</th>
                  <th className="py-3 px-4">জামাত/শ্রেণী</th>
                  <th className="py-3 px-4 text-center">রুম নম্বর</th>
                  <th className="py-3 px-4 text-right">হোস্টেল ফি</th>
                  <th className="py-3 px-4">বোর্ডিং টাইপ</th>
                  <th className="py-3 px-4 text-center">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {hostelResidents.map((s) => {
                  const alloc = hostelRooms[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-emerald-800">{s.student_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 font-medium">{s.class_name || 'জামাত নাই'}</td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-900 bg-emerald-50/50 max-w-max border border-emerald-100 rounded">
                        {alloc?.roomNumber || 'বরাদ্দ নাই'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {s.is_lillah ? '৳০' : `৳${toBanglaNum(alloc?.hostelFee || 1000)}`}
                      </td>
                      <td className="py-3 px-4">
                        {s.is_lillah ? (
                          <span className="inline-block bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold">
                            লিল্লাহ বোর্ডিং (ফ্রি)
                          </span>
                        ) : (
                          <span className="inline-block bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded text-[10px] font-bold">
                            পেইড আবাসিক
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveResident(s.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition cursor-pointer"
                        >
                          আবাসিক বাতিল
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {hostelResidents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">কোন আবাসিক ছাত্র রেকর্ড পাওয়া যায়নি।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'lillah' ? (
        /* Lillah List Table */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                  <th className="py-3 px-4">আইডি কোড</th>
                  <th className="py-3 px-4">ছাত্রের নাম</th>
                  <th className="py-3 px-4">অভিভাবকের মোবাইল</th>
                  <th className="py-3 px-4 text-center">রুম নম্বর</th>
                  <th className="py-3 px-4">ঠিকানা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {lillahBoarders.map((s) => {
                  const alloc = hostelRooms[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-emerald-800">{s.student_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 font-mono">{toBanglaNum(s.guardian_phone)}</td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-900">
                        {alloc?.roomNumber || 'বরাদ্দ নাই'}
                      </td>
                      <td className="py-3 px-4">{s.address || 'ঠিকানা পাওয়া যায়নি'}</td>
                    </tr>
                  );
                })}
                {lillahBoarders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">কোন লিল্লাহ বোর্ডিং শিক্ষার্থী রেকর্ড পাওয়া যায়নি।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Allocate Form view */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl mx-auto space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Key size={18} className="text-emerald-600" />
            <span>নতুন রুম বরাদ্দ এন্ট্রি</span>
          </h4>

          <form onSubmit={handleAllocateRoom} className="space-y-4">
            {/* Student Dropdown selector (Only showing students not currently in hostel) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষার্থী নির্বাচন করুন</label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-350 rounded-lg text-sm text-slate-700 bg-white"
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

            <div className="grid grid-cols-2 gap-4">
              {/* Room number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">রুম নম্বর</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১০২"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Hostel Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">হোস্টেল ফি (৳/মাসিক)</label>
                <input
                  type="number"
                  required
                  value={hostelFee}
                  onChange={(e) => setHostelFee(Number(e.target.value))}
                  disabled={students.find(s => s.id === selectedStudentId)?.is_lillah}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingAllocation || !selectedStudentId}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:bg-emerald-400 cursor-pointer shadow"
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
