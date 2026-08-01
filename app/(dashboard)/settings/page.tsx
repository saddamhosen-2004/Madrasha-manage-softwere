'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Madrasha } from '@/types';
import { 
  Settings, Building2, MapPin, Phone, Mail, 
  Calendar, User, Save, Upload, Image as ImageIcon, 
  Sparkles, CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const [madrasha, setMadrasha] = useState<Madrasha | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await db.getMadrasha();
      if (data) {
        setMadrasha(data);
        setName(data.name || '');
        setTagline(data.tagline || 'মাদরাসা ম্যানেজমেন্ট সিস্টেম');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setEstablishedYear(data.established_year || '');
        setPrincipalName(data.principal_name || '');
        setLogoUrl(data.logo_url || '');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('অনুগ্রহ করে মাদরাসার নাম প্রদান করুন।');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    try {
      const updated = await db.updateMadrasha({
        name,
        tagline,
        address,
        phone,
        email,
        established_year: establishedYear,
        principal_name: principalName,
        logo_url: logoUrl
      });
      setMadrasha(updated);
      setSuccessMsg('সাইট সেটিংস সফলভাবে আপডেট হয়েছে!');
      
      // Dispatch a custom event so layout.tsx can react & refresh logo/name instantly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('madrasha-settings-updated'));
      }
    } catch (err: any) {
      alert('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 animate-shimmer">সেটিংস লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Top Banner ── */}
      <div className="animate-fade-in-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute right-28 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="animate-float hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <Settings size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">সাইট ও প্রতিষ্ঠান সেটিংস</h3>
              <p className="text-white/80 text-sm mt-1">মাদরাসার নাম, লোগো, ঠিকানা ও যোগাযোগের সকল তথ্য কাস্টমাইজ করুন।</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Alert ── */}
      {successMsg && (
        <div className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {/* ── Settings Form ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Basic Info & Branding ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Institution Info */}
          <div className="animate-fade-in-up delay-75 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 flex items-center gap-2">
              <Building2 size={16} className="text-white" />
              <span className="font-bold text-white text-sm">প্রতিষ্ঠানের নাম ও পরিচিতি</span>
            </div>
            <div className="p-5 space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Building2 size={11} className="text-emerald-500" />
                  মাদরাসার নাম <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মোহাম্মাদীয়া তাহফীযুল কুরআন মাদ্রাসা"
                  className={inputClass}
                />
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Sparkles size={11} className="text-emerald-500" />
                  ট্যাগলাইন / উপশিরোনাম
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="যেমন: একটি আদর্শ দ্বীনি শিক্ষাপ্রতিষ্ঠান"
                  className={inputClass}
                />
              </div>

              {/* Principal Name & Established Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <User size={11} className="text-emerald-500" />
                    মুহতামিম / প্রিন্সিপালের নাম
                  </label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="যেমন: হাফেজ মাওলানা ইউসুফ"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Calendar size={11} className="text-emerald-500" />
                    প্রতিষ্ঠার সন
                  </label>
                  <input
                    type="text"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    placeholder="যেমন: ২০২০ ইং"
                    className={inputClass}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Contact Details */}
          <div className="animate-fade-in-up delay-150 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-3.5 flex items-center gap-2">
              <MapPin size={16} className="text-white" />
              <span className="font-bold text-white text-sm">যোগাযোগ ও ঠিকানা</span>
            </div>
            <div className="p-5 space-y-4">
              
              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <MapPin size={11} className="text-teal-500" />
                  সম্পূর্ণ ঠিকানা
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: মিরপুর-১১, ঢাকা-১২১৬"
                  rows={2}
                  className={inputClass + ' resize-none'}
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Phone size={11} className="text-teal-500" />
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: ০১৭১০০০-০০০০"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Mail size={11} className="text-teal-500" />
                    ইমেইল ঠিকানা
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@mtq-madrasha.com"
                    className={inputClass}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Right Column: Logo Upload & Live Preview ── */}
        <div className="space-y-6">

          {/* Logo Card */}
          <div className="animate-fade-in-up delay-225 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3.5 flex items-center gap-2">
              <ImageIcon size={16} className="text-white" />
              <span className="font-bold text-white text-sm">মাদরাসার লোগো</span>
            </div>
            <div className="p-5 space-y-4">
              
              {/* Logo Preview */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200">
                <div className="h-24 w-24 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg overflow-hidden shrink-0 border-2 border-white mb-3">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-700">{name || 'লোগো প্রিভিউ'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{tagline || 'মাদরাসা ম্যানেজমেন্ট সিস্টেম'}</p>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Upload size={11} className="text-cyan-500" />
                  নতুন লোগো আপলোড করুন
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 transition cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">PNG, JPG বা SVG ফরম্যাটের ছবি আপলোড করুন।</p>
              </div>

              {/* Logo URL alternative */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  অথবা ছবির অনলাইন URL লিখুন
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className={inputClass}
                />
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="animate-fade-in-up delay-300">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
            >
              <Save size={18} />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস পরিবর্তন সংরক্ষণ করুন'}</span>
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
