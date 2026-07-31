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
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('দয়া করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          // fetch profile
          const profile = await db.getProfile();
          if (profile) {
            router.push('/dashboard');
          } else {
            setErrorMsg('ব্যবহারকারীর প্রোফাইল পাওয়া যায়নি।');
          }
        }
      } else {
        // Fallback LocalStorage Auth Simulation
        if (email === 'admin@mtq.com' && password === 'admin123') {
          await db.setMockProfile('admin');
          router.push('/dashboard');
        } else if (email === 'teacher@mtq.com' && password === 'teacher123') {
          await db.setMockProfile('teacher', 'teacher-1');
          router.push('/dashboard');
        } else {
          setErrorMsg('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। ডেমো ট্রাই করুন।');
        }
      }
    } catch (err: any) {
      setErrorMsg('লগইন করার সময় একটি সমস্যা হয়েছে।');
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
      setErrorMsg('ডেমো লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-emerald-100">
        <div className="text-center">
          {/* Islamic Lantern Icon or Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-800">
            মোহাম্মাদীয়া তাহফীযুল কুরআন
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            মাদ্রাসা ম্যানেজমেন্ট সিস্টেম
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {errorMsg && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                ইমেইল ঠিকানা
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@email.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                পাসওয়ার্ড
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 transition"
            >
              {loading ? 'লোডিং হচ্ছে...' : 'লগইন করুন'}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 font-medium">ডেমো অ্যাকাউন্টে প্রবেশ করুন</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            disabled={loading}
            className="flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 hover:bg-emerald-50 transition text-emerald-800 text-sm font-medium"
          >
            <span>সুপার এডমিন</span>
            <span className="text-xs text-slate-500 mt-0.5">(সম্পূর্ণ এক্সেস)</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('teacher')}
            disabled={loading}
            className="flex flex-col items-center justify-center rounded-lg border border-teal-200 bg-teal-50/50 p-3 hover:bg-teal-50 transition text-teal-800 text-sm font-medium"
          >
            <span>শিক্ষক</span>
            <span className="text-xs text-slate-500 mt-0.5">(ক্লাস এক্সেস)</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 mt-4">
          সুপার এডমিন ডেমো লগইন: <span className="font-semibold text-slate-500">admin@mtq.com</span> পাসওয়ার্ড: <span className="font-semibold text-slate-500">admin123</span>
        </div>
      </div>
    </div>
  );
}
