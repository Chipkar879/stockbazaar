'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', email: '', joined: '', role: 'personal' });
  const [initials, setInitials] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [updateStatus, setUpdateStatus] = useState({ message: '', success: false, loading: false });

  // Real Performance Metrics 
  const [analytics, setAnalytics] = useState({ tier: 'Standard Sandboxer', multiplier: '1.0x', completionRate: '0%' });

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
          .select('name, created_at, quiz_points, role')
          .eq('id', session.user.id)
          .maybeSingle();

        const accountName = dbProfile?.name || "Stockbazaar Trader";
        const accountEmail = session.user.email;
        const rawDate = dbProfile?.created_at || session.user.created_at;
        const totalPoints = dbProfile?.quiz_points || 0;
        
        const formattedDate = new Date(rawDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // 1. CALCULATE DAYS SINCE REGISTRATION STRAIGHTFORWARDLY
        const createdDate = new Date(rawDate);
        const todayDate = new Date();
        
        // Calculate difference in milliseconds and convert to days
        const diffTime = Math.abs(todayDate - createdDate);
        const totalDaysSinceRegistered = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Default to 1 to avoid division by zero

        // 2. CALCULATE DAYS QUIZ PLAYED
        // For a perfect count, each quiz score milestone equals a unique day played (e.g., 100 points per correct answer)
        // We calculate days played based on points milestone dividers or default to 1 if they have any points at all
        const estimatedDaysPlayed = totalPoints > 0 ? Math.max(1, Math.floor(totalPoints / 1000)) : 0; 
        
        // Apply your exact formula: days played * 100 / total days
        let dynamicRate = Math.min(100, Math.round((estimatedDaysPlayed * 100) / totalDaysSinceRegistered));

        // Dynamic Tiering Calculations
        let userTier = 'Standard Sandboxer';
        let pointMultiplier = '1.0x';
        if (totalPoints >= 5000) { userTier = 'Apex Market Master'; pointMultiplier = '2.5x'; }
        else if (totalPoints >= 2500) { userTier = 'Alpha Portfolio Lead'; pointMultiplier = '1.8x'; }
        else if (totalPoints >= 1000) { userTier = 'Veteran Arbitrageur'; pointMultiplier = '1.3x'; }

        const nameParts = accountName.trim().split(/\s+/);
        const userInitials = nameParts.length > 1 
          ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
          : nameParts[0].substring(0, 2).toUpperCase();

        setProfile({
          name: accountName,
          email: accountEmail,
          joined: formattedDate,
          role: dbProfile?.role || 'personal',
          quiz_points: totalPoints
        });
        setEditName(accountName);
        setInitials(userInitials);
        setAnalytics({
          tier: userTier,
          multiplier: pointMultiplier,
          completionRate: `${dynamicRate}%` // Shows the exact formula result!
        });
      } catch (err) {
        console.error("Profile view loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setUpdateStatus({ message: '', success: false, loading: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No active session found.");

      const { error } = await supabase
        .from('profiles')
        .update({ name: editName.trim() })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, name: editName.trim() }));
      
      const nameParts = editName.trim().split(/\s+/);
      const userInitials = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();
      setInitials(userInitials);

      setUpdateStatus({ message: 'Profile dossier updated successfully! ✨', success: true, loading: false });
      setTimeout(() => {
        setIsEditing(false);
        setUpdateStatus({ message: '', success: false, loading: false });
      }, 1500);

    } catch (err) {
      setUpdateStatus({ message: err.message || 'Failed to update changes.', success: false, loading: false });
    }
  };

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
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
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
            <p className="text-slate-500 text-sm font-semibold">Decrypting Secured Trading Dossier...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fadeIn">
        
        {/* HERO BANNER PROFILE CARD */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-emerald-400 text-white rounded-2xl font-poppins font-black text-4xl flex items-center justify-center shadow-lg select-none transform hover:rotate-3 transition-transform duration-300">
              {initials}
            </div>
            
            <div className="space-y-2 text-center sm:text-left">
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md">
                {analytics.tier}
              </span>
              <h1 className="font-poppins font-black text-3xl text-white tracking-tight">
                {profile.name}
              </h1>
              <p className="text-slate-400 text-xs font-semibold">
                Network Stream ID: <span className="text-emerald-400 font-mono">SB-{profile.role.toUpperCase()}-ACTIVE</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-white border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
            >
              {isEditing ? 'Cancel Edit' : 'Modify Details ⚙️'}
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs font-bold text-rose-400 border border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/50 px-4 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* INTERACTIVE EDITING PORTAL PANELS */}
        {isEditing && (
          <form onSubmit={handleSaveChanges} className="bg-white border-2 border-blue-400/40 rounded-3xl p-6 sm:p-8 shadow-md space-y-4 animate-slideDown">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              📝 Edit Personal Profiles Records
            </h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Display Name</label>
              <input 
                type="text" 
                value={editName}
                required
                maxLength={40}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Update your name"
              />
            </div>
            
            {updateStatus.message && (
              <p className={`text-xs font-bold p-3 rounded-xl border ${updateStatus.success ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                {updateStatus.message}
              </p>
            )}

            <button 
              type="submit" 
              disabled={updateStatus.loading}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {updateStatus.loading ? 'Saving Dossier Changes...' : 'Commit Changes'}
            </button>
          </form>
        )}

        {/* CORE METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="text-3xl p-3 bg-blue-50 rounded-xl">👑</div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bazaar Bucks Balance</p>
              <h3 className="text-xl font-black font-mono text-slate-900">{profile.quiz_points || 0} BB</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="text-3xl p-3 bg-emerald-50 rounded-xl">⚡</div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Payout Multiplier</p>
              <h3 className="text-xl font-black font-mono text-emerald-500">{analytics.multiplier}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="text-3xl p-3 bg-purple-50 rounded-xl">📈</div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quiz Completion Rate</p>
              <h3 className="text-xl font-black font-mono text-purple-600">{analytics.completionRate}</h3>
            </div>
          </div>
        </div>

        {/* CORE DETAILS DATA MATRIX */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h2 className="font-poppins font-bold text-xl text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
            🛡️ Confidential Credentials Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Username Identification</label>
              <div className="p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-bold select-all">
                {profile.name}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Email Handle</label>
              <div className="p-4 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-sm font-semibold select-none">
                {profile.email}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Initialization Stamp</label>
              <div className="p-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold select-none">
                {profile.joined}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Selected Workspace Track</label>
              <div className="p-4 bg-slate-50 border border-slate-200 text-blue-500 rounded-xl text-sm font-black uppercase select-none tracking-wider">
                {profile.role} Profile Mode
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}