'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../lib/db';
import { CommitteeMember } from '../../../types';
import { User, Phone, MapPin, Calendar, Plus, Pencil, Trash2, ShieldCheck, X } from 'lucide-react';

export default function CommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [position, setPosition] = useState('সদস্য');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');

  const positions = ['সভাপতি', 'সহ-সভাপতি', 'সাধারণ সম্পাদক', 'কোষাধ্যক্ষ', 'সদস্য'];

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const list = await db.getCommitteeMembers();
      setMembers(list);
    } catch (err) {
      console.error('Error loading committee members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setPosition('সদস্য');
    setPhone('');
    setAddress('');
    setPhotoUrl('');
    setTermStart('');
    setTermEnd('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (member: CommitteeMember) => {
    setEditingId(member.id);
    setName(member.name);
    setPosition(member.position);
    setPhone(member.phone);
    setAddress(member.address);
    setPhotoUrl(member.photo_url || '');
    setTermStart(member.term_start || '');
    setTermEnd(member.term_end || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position || !phone) {
      alert('অনুগ্রহ করে নাম, পদবী এবং মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    try {
      if (editingId) {
        await db.updateCommitteeMember(editingId, {
          name, position, phone, address,
          photo_url: photoUrl || undefined,
          term_start: termStart || undefined,
          term_end: termEnd || undefined
        });
        alert('কমিটি সদস্যের তথ্য সফলভাবে আপডেট হয়েছে।');
      } else {
        await db.addCommitteeMember({
          name, position, phone, address,
          photo_url: photoUrl || undefined,
          term_start: termStart || undefined,
          term_end: termEnd || undefined
        });
        alert('নতুন কমিটি সদস্য সফলভাবে যুক্ত হয়েছে।');
      }
      setModalOpen(false);
      loadMembers();
    } catch (err) {
      alert('তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই কমিটি সদস্যকে বাদ দিতে চান?')) {
      try {
        await db.deleteCommitteeMember(id);
        setMembers(members.filter(m => m.id !== id));
      } catch (err) {
        alert('মুছতে ব্যর্থ হয়েছে।');
      }
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

  const toBanglaNum = (num: number | string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  // Sort members by position priority
  const getPositionPriority = (pos: string) => {
    switch (pos) {
      case 'সভাপতি': return 1;
      case 'সহ-সভাপতি': return 2;
      case 'সাধারণ সম্পাদক': return 3;
      case 'কোষাধ্যক্ষ': return 4;
      case 'সদস্য': return 5;
      default: return 6;
    }
  };

  const sortedMembers = [...members].sort(
    (a, b) => getPositionPriority(a.position) - getPositionPriority(b.position)
  );

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800">মাদরাসা পরিচালনা কমিটি</h3>
          <p className="text-xs text-slate-500 mt-0.5">মাদরাসার উন্নয়ন ও পরিচালনা কমিটির সদস্যদের বিস্তারিত তালিকা।</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition self-start sm:self-auto shadow-sm"
        >
          <Plus size={16} />
          <span>নতুন সদস্য যোগ করুন</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500 font-medium">কমিটি তালিকা লোড হচ্ছে...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                {/* Image & Position Banner */}
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={28} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-800 leading-snug">{member.name}</h4>
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <ShieldCheck size={12} />
                      <span>{member.position}</span>
                    </span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">{toBanglaNum(member.phone)}</span>
                  </div>
                  {member.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <span>{member.address}</span>
                    </div>
                  )}
                  {(member.term_start || member.term_end) && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>
                        মেয়াদ: {member.term_start ? toBanglaNum(member.term_start) : 'শুরু'} হতে{' '}
                        {member.term_end ? toBanglaNum(member.term_end) : 'চলমান'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 border-t border-slate-100 pt-3.5 mt-4">
                <button
                  onClick={() => handleOpenEditModal(member)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-350 bg-white py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition"
                >
                  <Pencil size={12} />
                  <span>সম্পাদনা</span>
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-350 bg-white py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition"
                >
                  <Trash2 size={12} />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-400 font-semibold">
              কোন পরিচালনা কমিটি সদস্য পাওয়া যায়নি।
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 text-base">
                {editingId ? 'সদস্যের তথ্য পরিবর্তন করুন' : 'নতুন কমিটি সদস্য যুক্ত করুন'}
              </h4>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সদস্যের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="নাম বাংলায় লিখুন"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    পদবী <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    {positions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
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

                {/* Term Start */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">মেয়াদ শুরু</label>
                  <input
                    type="date"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Term End */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">মেয়াদ শেষ</label>
                  <input
                    type="date"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ঠিকানা</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ঠিকানা লিখুন"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                ></textarea>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">সদস্যের ছবি</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition text-xs font-bold text-white shadow"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
