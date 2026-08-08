'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

// ⚠️ SUPER ADMIN IMMUNITY EMAIL
const SUPER_ADMIN_EMAIL = 'verymystery18@gmail.com';

// Helper to check if trial is expired (7 days = 604800000 ms)
const calculateTrialStatus = (profile) => {
  if (profile.email === SUPER_ADMIN_EMAIL) return { isFrozen: false, daysLeft: 999, reason: 'Super Admin Immune' };
  if (profile.is_premium) return { isFrozen: false, daysLeft: 999, reason: 'Premium Active' };
  
  // Manual override takes precedence if set by Admin
  if (profile.is_frozen === true) return { isFrozen: true, daysLeft: 0, reason: 'Manually Frozen' };
  if (profile.is_frozen === false) return { isFrozen: false, daysLeft: 7, reason: 'Manually Unfrozen' };

  // Automated 7-Day Calculation from created_at
  const createdAt = profile.created_at ? new Date(profile.created_at).getTime() : Date.now();
  const now = Date.now();
  const diffMs = now - createdAt;
  const trialMs = 7 * 24 * 60 * 60 * 1000;
  
  if (diffMs >= trialMs) {
    return { isFrozen: true, daysLeft: 0, reason: '7-Day Trial Expired' };
  } else {
    const daysLeft = Math.ceil((trialMs - diffMs) / (1000 * 60 * 60 * 24));
    return { isFrozen: false, daysLeft, reason: 'Trial Active' };
  }
};

export default function SuperAdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('ALL');

  // Modal Inspection State
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const verifyIdentity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session.user.email === SUPER_ADMIN_EMAIL) {
        setAuthorized(true);
        fetchMasterData();
      } else {
        window.location.href = '/';
      }
    };
    verifyIdentity();
  }, []);

  const fetchMasterData = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('*');
    
    // Sort profiles by wallet balance
    const sortedByWallet = [...(profiles || [])].sort(
      (a, b) => (b.wallet_balance || 0) - (a.wallet_balance || 0)
    );

    const profilesWithRank = (profiles || []).map(p => {
      const rank = sortedByWallet.findIndex(x => x.id === p.id) + 1;
      const trial = calculateTrialStatus(p);
      return { ...p, rank, trial };
    });

    setAllProfiles(profilesWithRank);

    const { data: teachers } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .eq('verification_status', 'pending');
    setPendingTeachers(teachers || []);
    setLoading(false);
  };

  const handleToggleFreezeStatus = async (profileId, currentFrozenState, profileEmail) => {
    if (profileEmail === SUPER_ADMIN_EMAIL) {
      alert("⚠️ Super Admin account (verymystery18@gmail.com) is immune and can NEVER be frozen.");
      return;
    }

    const newFrozenState = !currentFrozenState;
    const actionLabel = newFrozenState ? 'FREEZE' : 'UNFREEZE';

    if (!confirm(`Are you sure you want to ${actionLabel} this user dossier?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_frozen: newFrozenState })
        .eq('id', profileId);

      if (error) throw error;

      alert(`Dossier successfully ${newFrozenState ? 'FROZEN' : 'UNFROZEN'}.`);
      
      // Update local state immediately
      setSelectedProfile(prev => prev ? { 
        ...prev, 
        is_frozen: newFrozenState,
        trial: calculateTrialStatus({ ...prev, is_frozen: newFrozenState })
      } : null);

      fetchMasterData();
    } catch (err) {
      console.error("Freeze toggle error:", err);
      alert(`Failed to update freeze state: ${err.message}`);
    }
  };

  const handleDeleteDossier = async (profileId, profileName) => {
    if (!confirm(`⚠️ Are you sure you want to delete the dossier for "${profileName}"?`)) return;
    if (!confirm(`🚨 FINAL WARNING: Deleting this dossier is permanent. Proceed?`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profileId);
      if (error) throw error;

      alert("User dossier purged successfully.");
      setSelectedProfile(null);
      fetchMasterData();
    } catch (err) {
      console.error("Deletion error:", err);
      alert(`Failed to delete dossier: ${err.message}`);
    }
  };

  const schoolList = useMemo(() => {
    const schools = new Set();
    allProfiles.forEach(p => { if (p.school_id) schools.add(p.school_id); });
    return Array.from(schools);
  }, [allProfiles]);

  const filteredProfiles = useMemo(() => {
    return allProfiles.filter(p => {
      const matchesSearch = 
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.school_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.role || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedSchoolFilter === 'ALL') return true;
      if (selectedSchoolFilter === 'PERSONAL') return p.role === 'personal' || !p.school_id;
      return p.school_id === selectedSchoolFilter;
    });
  }, [allProfiles, searchQuery, selectedSchoolFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 flex justify-center">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-[#ff3333] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              Securing Admin Firewall Layer...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative max-w-full overflow-x-hidden pt-24 pb-20">
      <Navbar />
      
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 animate-fadeInFast">
        
        {/* HEADER BLOCK */}
        <div className="border-b border-[#2b0808] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-[#1a0808] text-[#ff3333] border border-[#2b0808] text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-inner mb-2 inline-block">
              🛡️ Super Admin Clearance
            </span>
            <h1 className="text-3xl font-poppins font-black text-white tracking-tight">Master Control Panel</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Inspect user dossiers, control 7-day freeze overrides, or adjust institutional tracks.
            </p>
          </div>

          <div className="bg-[#0f0505] border border-[#2b0808] px-4 py-2 rounded-xl text-xs font-mono text-slate-400">
            Node ID: <span className="text-[#ff3333] font-bold">{SUPER_ADMIN_EMAIL}</span>
          </div>
        </div>

        {/* SECTION A: SEARCH & SCHOOL FILTER CONTROLS */}
        <div className="bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl p-6 space-y-6 shadow-2xl border-b-4 border-b-[#2b0808]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#2b0808] pb-4">
            <div>
              <h2 className="text-sm font-poppins font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                📊 Registered Application Users Matrix ({filteredProfiles.length} / {allProfiles.length})
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Filter by school hubs or query user profiles dynamically.</p>
            </div>

            <div className="w-full md:w-72 relative">
              <input 
                type="text"
                placeholder="🔍 Search name, email, school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a0808] border border-[#2b0808] text-white rounded-xl text-xs font-bold focus:outline-none focus:border-[#7a0000] transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* SCHOOL HUB CATEGORIES */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Categorize By Institutional Hub:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSchoolFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${selectedSchoolFilter === 'ALL' ? 'bg-[#7a0000] border-[#a30000] text-white shadow-md' : 'bg-[#1a0808] border-[#2b0808] text-slate-400 hover:text-white'}`}
              >
                All Users ({allProfiles.length})
              </button>

              <button
                onClick={() => setSelectedSchoolFilter('PERSONAL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${selectedSchoolFilter === 'PERSONAL' ? 'bg-[#7a0000] border-[#a30000] text-white shadow-md' : 'bg-[#1a0808] border-[#2b0808] text-slate-400 hover:text-white'}`}
              >
                Personal Track ({allProfiles.filter(p => p.role === 'personal' || !p.school_id).length})
              </button>

              {schoolList.map(schoolId => {
                const count = allProfiles.filter(p => p.school_id === schoolId).length;
                return (
                  <button
                    key={schoolId}
                    onClick={() => setSelectedSchoolFilter(schoolId)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${selectedSchoolFilter === schoolId ? 'bg-[#7a0000] border-[#a30000] text-white shadow-md' : 'bg-[#1a0808] border-[#2b0808] text-slate-400 hover:text-white'}`}
                  >
                    🏫 {schoolId} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* USER CARD GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredProfiles.map((p) => {
              const trial = calculateTrialStatus(p);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProfile(p)}
                  className="bg-[#1a0808] border-2 border-[#2b0808] hover:border-[#7a0000] p-5 rounded-2xl shadow-xl hover:shadow-[0_10px_25px_rgba(122,0,0,0.3)] transition-all cursor-pointer group space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-[#0f0505] text-[#ff3333] border border-[#2b0808]">
                          #{p.rank}
                        </span>
                        <h3 className="font-poppins font-black text-sm text-white group-hover:text-[#ff3333] transition-colors truncate">
                          {p.name || 'Unnamed Account'}
                        </h3>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-1">{p.email}</p>
                    </div>

                    <span className="px-2.5 py-0.5 bg-[#0f0505] border border-[#2b0808] text-[#ff3333] rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                      {p.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2b0808] text-xs font-bold">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Balance</span>
                      <span className="text-white font-mono">₹{(p.wallet_balance || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Trial / Lock</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        p.email === SUPER_ADMIN_EMAIL 
                          ? 'bg-sky-950/60 text-sky-400 border-sky-800' 
                          : trial.isFrozen 
                            ? 'bg-rose-950/80 text-rose-400 border-rose-800 animate-pulse' 
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                      }`}>
                        {p.email === SUPER_ADMIN_EMAIL ? 'IMMUNE' : trial.isFrozen ? 'FROZEN 🔒' : 'ACTIVE 🔓'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-bold flex items-center justify-between pt-1 group-hover:text-slate-300">
                    <span className="text-slate-600 font-mono text-[9px]">Hub: {p.school_id || 'Personal'}</span>
                    <span>Inspect Details ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DETAILED USER DOSSIER INSPECTION MODAL */}
      {selectedProfile && (() => {
        const trial = calculateTrialStatus(selectedProfile);
        const isSuperAdmin = selectedProfile.email === SUPER_ADMIN_EMAIL;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80 transition-all duration-300 animate-fadeInFast">
            <div className="bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-[#2b0808] flex items-center justify-between bg-[#1a0808]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#ff3333] bg-[#0f0505] px-2.5 py-1 rounded-md border border-[#2b0808]">
                      {selectedProfile.role} Track Dossier
                    </span>
                    <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md">
                      Global Rank #{selectedProfile.rank}
                    </span>
                  </div>
                  <h3 className="font-poppins font-black text-xl text-white tracking-tight mt-2">
                    {selectedProfile.name || 'User Workspace'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="w-8 h-8 rounded-full bg-[#0f0505] border border-[#2b0808] text-slate-400 font-bold flex items-center justify-center hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
                
                {/* Freeze Status Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
                  isSuperAdmin 
                    ? 'bg-sky-950/40 border-sky-900 text-sky-300' 
                    : trial.isFrozen 
                      ? 'bg-rose-950/50 border-rose-900 text-rose-300' 
                      : 'bg-emerald-950/40 border-emerald-900 text-emerald-300'
                }`}>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                      System Trial & Lock Status
                    </span>
                    <p className="text-base font-black font-poppins mt-0.5">
                      {isSuperAdmin ? '🛡️ Super Admin Permanent Access (Immune)' : trial.isFrozen ? '🔒 Dossier Account Frozen' : '🔓 Dossier Account Active'}
                    </p>
                    <p className="text-xs font-mono mt-1 opacity-90">Reason: {trial.reason}</p>
                  </div>

                  {!isSuperAdmin && (
                    <button
                      onClick={() => handleToggleFreezeStatus(selectedProfile.id, trial.isFrozen, selectedProfile.email)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md whitespace-nowrap ${
                        trial.isFrozen 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-rose-700 hover:bg-rose-800 text-white'
                      }`}
                    >
                      {trial.isFrozen ? '🔓 Unfreeze Dossier' : '🔒 Freeze Dossier'}
                    </button>
                  )}
                </div>

                {/* Balance Banner */}
                <div className="bg-gradient-to-br from-[#7a0000] to-[#4a0000] p-5 rounded-2xl text-white shadow-lg space-y-1 border border-[#a30000]/40">
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-200/80">
                    Current Virtual Wallet Balance
                  </p>
                  <p className="text-3xl font-poppins font-black tracking-tight font-mono">
                    ₹{(selectedProfile.wallet_balance || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                  <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">User UUID</span>
                    <p className="text-white font-mono break-all text-[11px]">{selectedProfile.id}</p>
                  </div>

                  <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Email Handle</span>
                    <p className="text-slate-300 font-mono text-[11px]">{selectedProfile.email}</p>
                  </div>

                  <div className={`p-3.5 rounded-xl space-y-1 ${selectedProfile.role === 'personal' ? 'bg-[#0f0505] border border-[#2b0808]/50 opacity-40' : 'bg-[#1a0808] border border-[#2b0808]'}`}>
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">School Hub Code</span>
                    <p className="text-white font-mono">{selectedProfile.role === 'personal' ? 'N/A (Personal Track)' : (selectedProfile.school_id || 'Not Enrolled')}</p>
                  </div>

                  <div className={`p-3.5 rounded-xl space-y-1 ${selectedProfile.role === 'personal' ? 'bg-[#0f0505] border border-[#2b0808]/50 opacity-40' : 'bg-[#1a0808] border border-[#2b0808]'}`}>
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Specific Class ID</span>
                    <p className="text-white font-mono">{selectedProfile.role === 'personal' ? 'N/A (Personal Track)' : (selectedProfile.specific_class_id || 'Unassigned')}</p>
                  </div>

                  <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Registration Date</span>
                    <p className="text-slate-300 font-mono text-[11px]">
                      {selectedProfile.created_at ? new Date(selectedProfile.created_at).toUTCString() : 'N/A'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Quiz Standings</span>
                    <p className="text-amber-400 font-mono">{selectedProfile.role === 'personal' ? 'N/A (Personal Track)' : `${selectedProfile.quiz_points || 0} PTS`}</p>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#2b0808] bg-[#1a0808] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDeleteDossier(selectedProfile.id, selectedProfile.name || 'User Account')}
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-1.5"
                >
                  <span>🗑️</span> Delete Dossier
                </button>

                <button
                  onClick={() => setSelectedProfile(null)}
                  className="px-6 py-2.5 bg-[#0f0505] border border-[#2b0808] hover:bg-[#1a0808] hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
                >
                  Close Dossier
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </main>
  );
}