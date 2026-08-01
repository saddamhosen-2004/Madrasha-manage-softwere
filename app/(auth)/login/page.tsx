'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('দয়া করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          const profile = await db.getProfile();
          if (profile) {
            router.push('/dashboard');
          } else {
            setErrorMsg('ব্যবহারকারীর প্রোফাইল পাওয়া যায়নি।');
          }
        }
      } else {
        if (email === 'admin@mtq.com' && password === 'admin123') {
          await db.setMockProfile('admin');
          router.push('/dashboard');
        } else if (email === 'teacher@mtq.com' && password === 'teacher123') {
          await db.setMockProfile('teacher', 'teacher-1');
          router.push('/dashboard');
        } else {
          setErrorMsg('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
        }
      }
    } catch (err: any) {
      setErrorMsg('লগইন করার সময় একটি সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'teacher') => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (role === 'admin') {
        await db.setMockProfile('admin');
      } else {
        await db.setMockProfile('teacher', 'teacher-1');
      }
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg('ডেমো লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 px-4 py-12">

      {/* ── Animated Blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="animate-float absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" style={{ animationDelay: '1.5s' }}></div>
        <div className="animate-float absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" style={{ animationDelay: '3s' }}></div>
        {/* Small sparkle dots */}
        <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-white/30"></div>
        <div className="absolute top-3/4 left-2/3 h-1.5 w-1.5 rounded-full bg-white/20"></div>
        <div className="absolute top-1/3 right-1/4 h-1 w-1 rounded-full bg-white/40"></div>
        <div className="absolute bottom-1/4 left-1/5 h-2.5 w-2.5 rounded-full bg-emerald-300/30"></div>
        <div className="absolute top-2/3 right-1/3 h-1.5 w-1.5 rounded-full bg-cyan-300/30"></div>
      </div>

      {/* ── Main Card ── */}
      <div className="animate-fade-in-up relative w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          {/* Glowing Icon */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/40">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">মোহাম্মাদীয়া তাহফীযুল</h1>
          <h2 className="text-2xl font-bold text-emerald-300">কুরআন মাদ্রাসা</h2>
          <p className="mt-2 text-sm font-medium text-white/60">ম্যানেজমেন্ট সিস্টেম — অ্যাডমিন প্যানেল</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-500/20 px-4 py-3 text-sm text-rose-200 backdrop-blur-sm">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mtq.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/70">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-10 pr-11 text-sm text-white placeholder-white/30 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white/70 transition"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  লোডিং হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  লগইন করুন
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                ডেমো অ্যাকাউন্ট
              </span>
            </div>
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 py-3.5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <svg className="h-5 w-5 transition group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>সুপার এডমিন</span>
              <span className="text-[10px] font-normal text-white/40">সম্পূর্ণ এক্সেস</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('teacher')}
              disabled={loading}
              className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 py-3.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
            >
              <svg className="h-5 w-5 transition group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
              <span>শিক্ষক</span>
              <span className="text-[10px] font-normal text-white/40">ক্লাস এক্সেস</span>
            </button>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-3.5 text-center text-xs text-white/40">
          <span>ডেমো:</span>{' '}
          <span className="font-semibold text-white/60">admin@mtq.com</span>
          {' / '}
          <span className="font-semibold text-white/60">admin123</span>
        </div>
      </div>
    </div>
  );
}
