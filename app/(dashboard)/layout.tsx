'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  ClipboardList, CreditCard, FileText, Home, 
  UserPlus, BarChart3, LogOut, Menu, X, CheckSquare, Heart
} from 'lucide-react';
import { db } from '@/lib/db';
import { UserProfile } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchProfile = async () => {
      const userProfile = await db.getProfile();
      if (!userProfile) {
        router.replace('/login');
      } else {
        setProfile(userProfile);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await db.logout();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-600">লোডিং হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Define navigation items with translation
  const allNavigation = [
    { name: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    { name: 'ছাত্র তালিকা', href: '/students', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'শিক্ষক তালিকা', href: '/teachers', icon: GraduationCap, roles: ['admin'] },
    { name: 'শ্রেণী/জামাত', href: '/classes', icon: BookOpen, roles: ['admin'] },
    { name: 'উপস্থিতি', href: '/attendance', icon: ClipboardList, roles: ['admin', 'teacher'] },
    { name: 'হিফজ অগ্রগতি', href: '/hifz', icon: Heart, roles: ['admin', 'teacher'] },
    { name: 'বেতন ও ফি আদায়', href: '/fees', icon: CreditCard, roles: ['admin'] },
    { name: 'পরীক্ষা ও ফলাফল', href: '/exams', icon: FileText, roles: ['admin', 'teacher'] },
    { name: 'হোস্টেল ও বোর্ডিং', href: '/hostel', icon: Home, roles: ['admin'] },
    { name: 'কমিটি সদস্য', href: '/committee', icon: UserPlus, roles: ['admin'] },
    { name: 'আয়-ব্যয় ও রিপোর্ট', href: '/reports', icon: BarChart3, roles: ['admin'] },
  ];

  // Filter based on user role
  const navigation = allNavigation.filter(item => item.roles.includes(profile.role));

  const roleText = profile.role === 'admin' ? 'সুপার এডমিন' : 'শিক্ষক';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Banner */}
      <header className="md:hidden bg-emerald-700 text-white flex items-center justify-between px-4 py-3 shadow-md no-print">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-wide">মুহাম্মাদীয়া তাহফীযুল কুরআন</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-emerald-800 transition"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden no-print"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-emerald-800 text-white transition-transform duration-300 transform md:translate-x-0 no-print
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:inset-auto md:flex md:w-64 md:min-h-screen
      `}>
        {/* Brand Logo Section */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-emerald-700/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white">মুহাম্মাদীয়া তাহফীযুল কুরআন</h1>
            <p className="text-[10px] text-emerald-200">মাদরাসা ম্যানেজমেন্ট সিস্টেম</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                  ${isActive 
                    ? 'bg-emerald-950/60 text-white shadow-sm font-semibold' 
                    : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'}
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout at Bottom */}
        <div className="p-4 border-t border-emerald-700/50 bg-emerald-900/35">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-emerald-100 text-sm">
              {profile.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{profile.email}</p>
              <p className="text-[10px] text-emerald-300 font-medium">{roleText}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 justify-center rounded-lg border border-emerald-700/50 bg-emerald-700/30 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-700 hover:text-white hover:border-emerald-600 transition"
          >
            <LogOut size={14} />
            <span>লগ আউট</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Header Banner */}
        <header className="hidden md:flex h-16 items-center justify-between bg-white px-8 border-b border-slate-200 shadow-sm no-print">
          <h2 className="text-xl font-bold text-slate-800">
            {pathname.startsWith('/dashboard') && 'মাদরাসা সংক্ষিপ্ত ড্যাশবোর্ড'}
            {pathname.startsWith('/students') && 'ছাত্র ব্যবস্থাপনা মডিউল'}
            {pathname.startsWith('/teachers') && 'শিক্ষক ও কর্মচারী ব্যবস্থাপনা'}
            {pathname.startsWith('/classes') && 'শ্রেণী ও জামাত ব্যবস্থাপনা'}
            {pathname.startsWith('/attendance') && 'উপস্থিতি রেজিস্টার'}
            {pathname.startsWith('/hifz') && 'হিফজ বিভাগ অগ্রগতি ট্র্যাক'}
            {pathname.startsWith('/fees') && 'ছাত্র বেতন ও ফি কালেকশন'}
            {pathname.startsWith('/exams') && 'পরীক্ষা ও ফলাফল বিবরণী'}
            {pathname.startsWith('/hostel') && 'হোস্টেল ও বোর্ডিং ব্যবস্থাপনা'}
            {pathname.startsWith('/committee') && 'মাদরাসা পরিচালনা কমিটি'}
            {pathname.startsWith('/reports') && 'আয়-ব্যয় হিসাব ও রিপোর্ট'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{roleText} প্যানেল</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="text-xs text-slate-500 font-medium font-mono">
              {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Dynamic Children Pages */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
