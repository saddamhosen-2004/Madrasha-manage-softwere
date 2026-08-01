'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { CommitteeMember } from '@/types';
import { 
  User, Phone, MapPin, Calendar, Plus, Pencil, Trash2, 
  ShieldCheck, X, Users, Award, Briefcase, Camera, Save 
} from 'lucide-react';

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
        alert('কমিটি সদস্যের তথ্য সফলভাবে আপডেট হয়েছে।');
      } else {
        await db.addCommitteeMember({
          name, position, phone, address,
          photo_url: photoUrl || undefined,
          term_start: termStart || undefined,
          term_end: termEnd || undefined
        });
        alert('নতুন কমিটি সদস্য সফলভাবে যুক্ত হয়েছে।');
      }
      setModalOpen(false);
      loadMembers();
    } catch (err) {
      alert('তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই কমিটি সদস্যকে বাদ দিতে চান?')) {
      try {
        await db.deleteCommitteeMember(id);
        setMembers(members.filter(m => m.id !== id));
      } catch (err) {
        alert('মুছতে ব্যর্থ হয়েছে।');
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

  const getPositionBadgeStyle = (pos: string) => {
    switch (pos) {
      case 'সভাপতি':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          topBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          avatarRing: 'ring-emerald-400'
        };
      case 'সহ-সভাপতি':
        return {
          bg: 'bg-sky-100 text-sky-800 border-sky-200',
          topBar: 'bg-gradient-to-r from-sky-500 to-blue-400',
          avatarRing: 'ring-sky-400'
        };
      case 'সাধারণ সম্পাদক':
        return {
          bg: 'bg-violet-100 text-violet-800 border-violet-200',
          topBar: 'bg-gradient-to-r from-violet-500 to-purple-400',
          avatarRing: 'ring-violet-400'
        };
      case 'কোষাধ্যক্ষ':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          topBar: 'bg-gradient-to-r from-amber-500 to-orange-400',
          avatarRing: 'ring-amber-400'
        };
      default:
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          topBar: 'bg-gradient-to-r from-indigo-500 to-cyan-400',
          avatarRing: 'ring-indigo-400'
        };
    }
  };

  const sortedMembers = [...members].sort(
    (a, b) => getPositionPriority(a.position) - getPositionPriority(b.position)
  );

  const keyExecutivesCount = members.filter(m => ['সভাপতি', 'সহ-সভাপতি', 'সাধারণ সম্পাদক', 'কোষাধ্যক্ষ'].includes(m.position)).length;
  const generalMembersCount = members.filter(m => !['সভাপতি', 'সহ-সভাপতি', 'সাধারণ সম্পাদক', 'কোষাধ্যক্ষ'].includes(m.position)).length;

  const statCards = [
    {
      label: 'মোট কমিটি সদস্য',
      value: `${toBanglaNum(members.length)} জন`,
      icon: <Users size={24} />,
      gradient: 'from-violet-500 to-purple-400',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-700',
      delay: 'delay-0',
    },
    {
      label: 'নির্বাহী কর্মকর্তা',
      value: `${toBanglaNum(keyExecutivesCount)} জন`,
      icon: <Award size={24} />,
      gradient: 'from-emerald-500 to-teal-400',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      delay: 'delay-75',
    },
    {
      label: 'সাধারণ সদস্য',
      value: `${toBanglaNum(generalMembersCount)} জন`,
      icon: <Briefcase size={24} />,
      gradient: 'from-sky-500 to-cyan-400',
      lightBg: 'bg-sky-50',
      textColor: 'text-sky-700',
      delay: 'delay-150',
    },
  ];

  const inputClass = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition';

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-violet-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">মাদরাসা পরিচালনা কমিটি</h3>
              <p className="text-white/80 text-sm mt-1">
                মাদরাসার উন্নয়ন ও পরিচালনা কমিটির সদস্যদের বিস্তারিত তালিকা।
                &nbsp;({toBanglaNum(members.length)} জন সদস্য)
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 text-sm font-bold hover:bg-indigo-50 transition shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>নতুন সদস্য যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

      {/* ── Members Grid ── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-slate-500 animate-shimmer">কমিটি তালিকা লোড হচ্ছে...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMembers.map((member, idx) => {
            const badgeStyle = getPositionBadgeStyle(member.position);
            return (
              <div
                key={member.id}
                className="animate-fade-in-up card-motion relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Coloured Top Bar */}
                <div className={`h-1.5 w-full ${badgeStyle.topBar}`}></div>

                <div className="p-5">
                  {/* Image & Position Header */}
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div className={`h-16 w-16 rounded-2xl bg-slate-100 border-2 border-white shadow-md ring-2 ${badgeStyle.avatarRing} flex items-center justify-center text-slate-400 overflow-hidden shrink-0`}>
                      {member.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <User size={28} className="text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-800 leading-snug">{member.name}</h4>
                      <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badgeStyle.bg}`}>
                        <ShieldCheck size={13} />
                        <span>{member.position}</span>
                      </span>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Phone size={12} />
                      </div>
                      <span className="font-bold text-slate-700">{toBanglaNum(member.phone)}</span>
                    </div>

                    {member.address && (
                      <div className="flex items-start gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={12} />
                        </div>
                        <span className="text-slate-600">{member.address}</span>
                      </div>
                    )}

                    {(member.term_start || member.term_end) && (
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                          <Calendar size={12} />
                        </div>
                        <span className="text-slate-600">
                          মেয়াদ: <strong className="text-slate-700">{member.term_start ? toBanglaNum(member.term_start) : 'শুরু'}</strong> হতে{' '}
                          <strong className="text-slate-700">{member.term_end ? toBanglaNum(member.term_end) : 'চলমান'}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5">
                  <div className="flex gap-2.5 border-t border-slate-100 pt-3.5">
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <Pencil size={13} />
                      <span>সম্পাদনা</span>
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>মুছে ফেলুন</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {members.length === 0 && (
            <div className="col-span-full bg-white p-16 text-center border border-slate-100 rounded-2xl text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
              <ShieldCheck size={36} className="text-slate-300" />
              <span>কোন পরিচালনা কমিটি সদস্য পাওয়া যায়নি।</span>
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Modal Drawer ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="font-bold text-white text-base">
                  {editingId ? 'সদস্যের তথ্য সংশোধন করুন' : 'নতুন কমিটি সদস্য যুক্ত করুন'}
                </h4>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <User size={11} className="text-indigo-500" />
                    সদস্যের নাম <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: আলহাজ্ব মোঃ আব্দুর রহিম"
                    className={inputClass}
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-indigo-500" />
                    পদবী <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className={inputClass}
                  >
                    {positions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Phone size={11} className="text-indigo-500" />
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

                {/* Term Start */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Calendar size={11} className="text-indigo-500" />
                    মেয়াদ শুরু
                  </label>
                  <input
                    type="date"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Term End */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Calendar size={11} className="text-indigo-500" />
                    মেয়াদ শেষ
                  </label>
                  <input
                    type="date"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <MapPin size={11} className="text-indigo-500" />
                  ঠিকানা
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বর্তমান ও স্থায়ী ঠিকানা লিখুন"
                  rows={2}
                  className={inputClass + ' resize-none'}
                ></textarea>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Camera size={11} className="text-indigo-500" />
                  সদস্যের ছবি
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-300 overflow-hidden shrink-0 shadow-inner">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <User size={28} className="text-indigo-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border-2 border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition cursor-pointer"
                >
                  <Save size={14} />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
