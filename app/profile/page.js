'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', email: '', joined: '' });
  const [initials, setInitials] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/signup?mode=login');
          return;
        }

        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('name, created_at')
          .eq('id', session.user.id)
          .maybeSingle();

        const accountName = dbProfile?.name || "Stockbazaar Trader";
        const accountEmail = session.user.email;
        const rawDate = dbProfile?.created_at || session.user.created_at;
        
        const formattedDate = new Date(rawDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const nameParts = accountName.trim().split(/\s+/);
        const userInitials = nameParts.length > 1 
          ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
          : nameParts[0].substring(0, 2).toUpperCase();

        setProfile({
          name: accountName,
          email: accountEmail,
          joined: formattedDate
        });
        setInitials(userInitials);
      } catch (err) {
        console.error("Profile view loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        
        const cookies = document.cookie.split(";");
        const targetPaths = ['/', '/simulator', '/quiz', '/courses', '/leaderboard'];

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          targetPaths.forEach(path => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax; Secure`;
          });
        }
      }
    } catch (err) {
      console.error("Signout security loop crash:", err);
    } finally {
      window.location.href = '/signup';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24 flex justify-center">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-semibold">Synchronizing Portfolio Profile...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-emerald-400 text-white rounded-2xl font-poppins font-black text-3xl flex items-center justify-center shadow-sm select-none">
              {initials}
            </div>
            
            <div className="space-y-1">
              <h1 className="font-poppins font-black text-3xl text-slate-900 tracking-tight">
                {profile.name}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Account Status: <span className="text-blue-500 font-bold">Simulator Active</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="text-xs font-bold text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
          >
            Sign Out Account
          </button>
        </div>

        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h2 className="font-poppins font-bold text-xl text-slate-800 border-b border-slate-100 pb-4">
            Security Dossier Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Email Address</label>
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-sm font-semibold select-all">
                {profile.email}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment Activation Date</label>
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold select-none">
                {profile.joined}
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}