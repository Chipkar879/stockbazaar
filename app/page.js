'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Re-usable animated asset component to rain down unique asset categories cleanly
const RainingAsset = ({ icon, isMobileHidden }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    setStyle({
      left: `${Math.random() * 92 + 3}%`, // Keeps icons slightly away from absolute screen edges
      animationDuration: `${Math.random() * 5 + 5}s`, // Smooth speed (5s to 10s)
      animationDelay: `${Math.random() * 7}s`,        // Spaced out delays
      fontSize: `${Math.random() * 12 + 14}px`,       // Mobile-friendly size variance
    });
  }, []);

  return (
    <div
      className={`absolute top-[-5vh] text-[#7a0000]/20 pointer-events-none select-none animate-rainDown ${
        isMobileHidden ? 'hidden md:block' : ''
      }`}
      style={style}
    >
      {icon}
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('stocks'); 
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Institutional school & delegated class architecture states
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [allSchoolTeachers, setAllSchoolTeachers] = useState([]);
  const [pendingClassStudents, setPendingClassStudents] = useState([]);
  const [newClassName, setNewClassName] = useState('');

  // Sync state with active user sessions and visual cloud profiles
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (!error && data) {
            setProfile(data);
            fetchInstitutionalEcosystem(data);
          }
        }
      } catch (err) {
        console.error("Session sync fault:", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchInstitutionalEcosystem = async (currentProfile) => {
    if (!currentProfile.school_id) return;

    // 1. Fetch classrooms built inside this school hub code configuration
    const { data: classes } = await supabase
      .from('school_classes')
      .select('*, profiles(name, email)')
      .eq('school_code', currentProfile.school_id);
    setSchoolClasses(classes || []);

    // 2. Load list of available verified teachers inside the same school hub
    const { data: teachers } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('school_id', currentProfile.school_id)
      .eq('role', 'teacher')
      .eq('verification_status', 'approved');
    setAllSchoolTeachers(teachers || []);

    // 3. Subscription loop: Pull pending students whose class container is explicitly assigned to this teacher
    const myAssignedClassIds = (classes || [])
      .filter(c => c.assigned_teacher_id === currentProfile.id)
      .map(c => c.id);

    if (myAssignedClassIds.length > 0) {
      const { data: students } = await supabase
        .from('profiles')
        .select('*')
        .in('specific_class_id', myAssignedClassIds)
        .eq('student_approved', false);
      setPendingClassStudents(students || []);
    }
  };

  const handleCreateClassContainer = async () => {
    if (!newClassName || !profile?.school_id) return;
    const { error } = await supabase
      .from('school_classes')
      .insert([{ school_code: profile.school_id, class_name: newClassName }]);
    if (!error) {
      setNewClassName('');
      fetchInstitutionalEcosystem(profile);
    }
  };

  const handleTeacherAssignToClass = async (classId, teacherId) => {
    const { error } = await supabase
      .from('school_classes')
      .update({ assigned_teacher_id: teacherId || null })
      .eq('id', classId);
    if (!error) fetchInstitutionalEcosystem(profile);
  };

  const handleApproveStudent = async (studentId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ student_approved: true, wallet_balance: 50000 })
      .eq('id', studentId);
    if (!error) fetchInstitutionalEcosystem(profile);
  };

  const handleLeaveClassroomTrack = async () => {
    if (!confirm("Are you sure you want to leave this class track room? Your wallet position will reset.")) return;
    const { error } = await supabase
      .from('profiles')
      .update({ school_id: null, specific_class_id: null, student_approved: false, wallet_balance: 0 })
      .eq('id', user.id);
    if (!error) window.location.reload();
  };

  const handlePermanentDeletion = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently wipe your profile and database nodes. Proceed?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error: dbError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);

      if (dbError) throw dbError;

      await supabase.auth.signOut();
      alert("Account completely dropped from database registers.");
      window.location.reload();
    } catch (err) {
      console.error("Deletion error:", err);
      alert("Failed to drop database profile row.");
    }
  };

  // Financial assets to populate our raining background matrix
  const ASSET_TYPES = ['\u20B9', '$', '\uD83D\uDE80', '\uD83D\uDCC8', '\uD83D\uDCC9', '\u20BF', '\uD83D\uDCCA', '\uD83D\uDCBC', '\uD83D\uDCB3', '\uD83D\uDC8E'];

  return (
    <main className="min-h-screen bg-black text-slate-100 antialiased font-sans pt-20 pb-20 overflow-x-hidden relative">
      <Navbar />

      {/* BACKGROUND FLOATING RAIN LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {ASSET_TYPES.map((asset, typeIdx) => 
          [...Array(6)].map((_, itemIdx) => (
            <RainingAsset 
              key={`asset-${typeIdx}-${itemIdx}`} 
              icon={asset} 
              isMobileHidden={itemIdx >= 2} 
            />
          ))
        )}
      </div>

      {/* MAIN HERO LANDING BLOCK */}
      <section className="max-w-7xl mx-auto px-6 pt-16 text-center space-y-8 relative z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7a0000]/15 blur-[120px] rounded-full -z-10 animate-pulse duration-5000" />

        <div className="space-y-4 max-w-3xl mx-auto select-none animate-fadeIn">
          <span className="inline-flex items-center gap-2 bg-[#1a0808] border border-[#2b0808] text-[#ff3333] text-[11px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full shadow-inner animate-bounce">
            🚀 The Ultimate Classroom Sandbox Arena
          </span>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-none text-white">
            Own the Market <br className="hidden sm:inline" />
            Before the{' '}
            <span className="bg-gradient-to-r from-[#dc2626] via-[#ed9292] to-white bg-clip-text text-transparent drop-shadow-sm font-black">
              Bell Rings
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed pt-3">
            Risk-free paper trading powered by high-frequency market simulations. Practice with live data feeds, candlestick tracking layers, and competitive campus leaderboards.
          </p>
        </div>

        {/* INTERACTIVE ACTIONS HUB */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4 animate-scaleUp">
          {loading ? (
            <div className="px-10 py-4 bg-[#1a0808] border border-[#2b0808] text-slate-500 rounded-2xl text-sm font-bold animate-pulse">
              Syncing Terminal...
            </div>
          ) : !user ? (
            <>
              <Link
                href="/signup"
                className="bg-[#7a0000] text-white font-poppins font-black px-10 py-4 rounded-2xl text-sm shadow-xl shadow-[#7a0000]/20 hover:bg-[#a30000] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-[-20deg]" />
                Claim Your Sandbox Wallet
              </Link>
              <Link
                href="/signup?mode=login"
                className="bg-[#0f0505] border-2 border-[#2b0808] text-slate-300 font-poppins font-black px-10 py-4 rounded-2xl text-sm hover:border-[#7a0000] hover:text-white hover:-translate-y-1 transition-all"
              >
                Access Dashboard
              </Link>
            </>
          ) : (
            <div className="w-full max-w-md bg-[#0f0505] border border-[#2b0808] rounded-3xl p-6 text-left shadow-xl space-y-4 animate-fadeInFast">
              
              {profile?.role === 'student' && !profile?.student_approved && (
                <div className="bg-amber-950/30 border border-amber-900/40 text-amber-300 rounded-xl p-4 text-xs space-y-1">
                  <p className="font-black uppercase tracking-wider">🔒 Verification Pending</p>
                  <p className="text-slate-400 font-medium">Your profile is connected to school hub <strong>{profile.school_id}</strong>. Your specific class manager teacher will unlock your wallet shortly.</p>
                </div>
              )}

              {profile?.role === 'teacher' && profile?.verification_status === 'pending' && (
                <div className="bg-amber-950/30 border border-amber-900/40 text-amber-300 rounded-xl p-4 text-xs space-y-1">
                  <p className="font-black uppercase tracking-wider">⏳ Verification Auditing</p>
                  <p className="text-slate-400 font-medium">Your document proof has been submitted to the admin queue. Dashboards will unlock right after approval confirmation.</p>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-[#2b0808] pb-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Active User</p>
                  <h3 className="text-base font-poppins font-black text-white">{profile?.name || 'Workspace Account'}</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-[#1a0808] border border-[#2b0808] rounded-full text-[9px] font-black uppercase tracking-wider text-rose-400">
                  {profile?.role} Track
                </span>
              </div>
              
              {((profile?.role === 'student' && profile?.student_approved) || profile?.role === 'personal') && (
                <div className="bg-gradient-to-br from-[#7a0000] to-[#4a0000] p-4 rounded-xl text-white shadow-md space-y-1 border border-[#a30000]/30">
                  <p className="text-[9px] font-black uppercase tracking-wider text-rose-200/80">Available Sandbox Balance</p>
                  <p className="text-2xl font-poppins font-black tracking-tight">
                    ₹{(profile?.wallet_balance || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {profile?.role === 'student' && (
                <button onClick={handleLeaveClassroomTrack} className="w-full py-2 bg-rose-950/30 border border-rose-900/40 hover:bg-rose-950/60 text-rose-400 font-bold text-xs rounded-xl transition-all">
                  Leave Classroom Tracker
                </button>
              )}

              {profile?.role === 'teacher' && profile?.verification_status === 'approved' && (
                <div className="space-y-4 pt-1 border-t border-[#2b0808]">
                  <div className="bg-[#1a0808] p-3 rounded-xl border border-[#2b0808] space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">🏢 School Class Matrix (Hub: {profile.school_id})</p>
                    <div className="flex gap-2">
                      <input type="text" className="px-2.5 py-1.5 bg-[#0f0505] border border-[#2b0808] text-white rounded-xl text-xs font-bold focus:outline-none focus:border-[#7a0000] w-full" placeholder="Add Class (e.g. Class 9-A)" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                      <button onClick={handleCreateClassContainer} className="px-3 py-1.5 bg-[#7a0000] hover:bg-[#a30000] text-white font-bold text-xs rounded-xl whitespace-nowrap">Create</button>
                    </div>

                    <div className="space-y-1.5 pt-1.5 max-h-36 overflow-y-auto divide-y divide-[#2b0808]">
                      {schoolClasses.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-medium py-1">No classrooms added under this school code yet.</p>
                      ) : (
                        schoolClasses.map((c) => (
                          <div key={c.id} className="flex flex-col gap-1 pt-1.5 text-[11px] font-bold">
                            <span className="text-white">🏫 {c.class_name}</span>
                            <select className="bg-[#0f0505] border border-[#2b0808] p-1 rounded-lg text-[10px] text-slate-400 font-medium focus:outline-none w-full" value={c.assigned_teacher_id || ''} onChange={(e) => handleTeacherAssignToClass(c.id, e.target.value)}>
                              <option value="">-- Assign Managing Teacher --</option>
                              {allSchoolTeachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                            </select>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DANGER ZONE */}
              <div className="p-3.5 border border-rose-900/30 bg-rose-950/20 rounded-2xl space-y-1">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider">⚠️ Danger Zone</h4>
                <p className="text-[10px] text-slate-400 font-medium">Wiping your profile is immediate, final, and deletes all linked transaction data.</p>
                <button onClick={handlePermanentDeletion} className="mt-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-[10px] rounded-xl transition-all">
                  Delete My Account Completely
                </button>
              </div>

              <div className="flex gap-2 items-center justify-between pt-1 border-t border-[#2b0808]">
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[60%] font-mono">
                  {user.email}
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="px-3 py-1.5 bg-[#1a0808] border border-[#2b0808] hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 text-[10px] font-bold rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {profile?.role === 'teacher' && profile?.verification_status === 'approved' && pendingClassStudents.length > 0 && (
        <section className="max-w-md mx-auto px-6 pt-4 relative z-20 animate-fadeInFast">
          <div className="bg-[#0f0505] border border-[#2b0808] rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">📋 Live Assigned Class Requests ({pendingClassStudents.length})</h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {pendingClassStudents.map(student => (
                <div key={student.id} className="p-2.5 bg-[#1a0808] border border-[#2b0808] rounded-xl flex items-center justify-between gap-2 text-xs font-bold">
                  <div className="truncate">
                    <p className="text-white truncate">{student.name}</p>
                    <p className="text-[9px] text-slate-500 font-mono font-medium truncate">{student.email}</p>
                  </div>
                  <button onClick={() => handleApproveStudent(student.id)} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold whitespace-nowrap transition-all">Approve Position</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIVE MARKET SIMULATOR TERMINAL SECTION */}
      <section id="simulator" className="max-w-7xl mx-auto px-6 pt-28 relative z-10 flex flex-col items-center justify-center animate-fadeIn scroll-mt-24">
        <div className="border-b border-[#2b0808] pb-6 mb-12 text-center max-w-xl w-full">
          <h2 className="text-2xl font-black text-white">Terminal Engine Simulator</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time exchange tracking interfaces driven by high-accuracy pipeline proxies.</p>
        </div>

        <div className="bg-[#0f0505] border border-[#2b0808] rounded-3xl shadow-2xl w-full max-w-4xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="col-span-1 space-y-3">
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider px-1">Select Live Stream Desk:</div>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`w-full flex justify-between items-center px-4 py-3.5 rounded-2xl border text-left text-xs uppercase tracking-wider font-black transition-all ${activeTab === 'stocks' ? 'bg-[#7a0000]/20 border-[#7a0000] text-[#ff3333] shadow-sm' : 'bg-[#1a0808] border-[#2b0808] text-slate-400 hover:bg-[#2b0808]'}`}
            >
              📈 Live NSE Indian Stocks
              <span className={`h-2 w-2 rounded-full ${activeTab === 'stocks' ? 'bg-[#ff3333] animate-pulse' : 'bg-slate-700'}`} />
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`w-full flex justify-between items-center px-4 py-3.5 rounded-2xl border text-left text-xs uppercase tracking-wider font-black transition-all ${activeTab === 'crypto' ? 'bg-[#7a0000]/20 border-[#7a0000] text-[#ff3333] shadow-sm' : 'bg-[#1a0808] border-[#2b0808] text-slate-400 hover:bg-[#2b0808]'}`}
            >
              🚀 Beta Challenge Equities
              <span className={`h-2 w-2 rounded-full ${activeTab === 'crypto' ? 'bg-[#ff3333] animate-pulse' : 'bg-slate-700'}`} />
            </button>
          </div>

          <div className="col-span-2 bg-[#000000] border border-[#2b0808] rounded-2xl p-6 font-sans text-slate-200 relative overflow-hidden group min-h-[250px] flex flex-col justify-between shadow-inner">
            {activeTab === 'stocks' && (
              <div className="space-y-4 animate-fadeInFast w-full">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black bg-[#1a0808] text-rose-300 border border-[#2b0808] px-2.5 py-1 rounded-md tracking-wider">RELIANCE.NS • NSE LIVE</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">● Exchange Open</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Market Price</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white">₹1,309.35</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">+₹12.40 (+0.95%)</div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2b0808] text-[11px] font-mono text-slate-400">
                  <div>Prev Close: <span className="text-white font-bold">₹1,296.95</span></div>
                  <div>Day Volume: <span className="text-white font-bold">4.2M Shares</span></div>
                </div>
              </div>
            )}

            {activeTab === 'crypto' && (
              <div className="space-y-4 animate-fadeInFast w-full">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black bg-[#1a0808] text-rose-300 border border-[#2b0808] px-2.5 py-1 rounded-md tracking-wider">TECH.CHALLENGE • HIGH-BETA</span>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">⚡ Arena Ticking</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Simulated Price Scale</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white">₹12,500.00</div>
                  <div className="text-xs font-bold text-rose-500 font-mono">-₹2,500.00 (-20.00%)</div>
                </div>
                <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[11px] text-rose-400 leading-relaxed font-semibold">
                  📢 System Event Broadcast: Tech sector crash initiated! TECH drops 20% over current challenge lifecycle step.
                </div>
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 h-24 opacity-10 pointer-events-none -z-10">
              <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-full fill-none stroke-current text-[#7a0000]">
                <path d="M0,120 L20,90 L50,110 L100,20 L150,80 L200,10 L250,90 L300,40 L350,110 L400,10" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CORE INTERACTIVE ANCHORS FOR INTEGRATED LEARNING ACADEMY */}
      <section id="courses" className="max-w-6xl mx-auto px-6 pt-32 relative z-10 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-white">Integrated Trading Academy</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto font-medium">Master tactical market theories through dynamic self-paced sandbox training paths.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f0505] border border-[#2b0808] p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="h-10 w-10 rounded-xl bg-[#1a0808] border border-[#2b0808] text-[#ff3333] flex items-center justify-center text-lg font-black">01</div>
            <h3 className="font-black text-base text-white">Market Foundations</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Understand technical asset pricing loops, stock charts, order structures, and index operations across primary exchanges.</p>
            <div className="pt-2"><span className="text-[10px] font-black uppercase tracking-wider bg-[#1a0808] border border-[#2b0808] text-rose-300 px-2.5 py-1 rounded-md">8 Modules • Beginner</span></div>
          </div>

          <div className="bg-[#0f0505] border border-[#2b0808] p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="h-10 w-10 rounded-xl bg-[#1a0808] border border-[#2b0808] text-[#ff3333] flex items-center justify-center text-lg font-black">02</div>
            <h3 className="font-black text-base text-white">Technical Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Map patterns using support levels, moving averages, and volume indicators to execute quantitative simulator mock plays.</p>
            <div className="pt-2"><span className="text-[10px] font-black uppercase tracking-wider bg-[#1a0808] border border-[#2b0808] text-rose-300 px-2.5 py-1 rounded-md">12 Modules • Intermediate</span></div>
          </div>

          <div className="bg-[#0f0505] border border-[#2b0808] p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="h-10 w-10 rounded-xl bg-[#1a0808] border border-[#2b0808] text-[#ff3333] flex items-center justify-center text-lg font-black">03</div>
            <h3 className="font-black text-base text-white">Portfolio Risk Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Mitigate drawdown via position sizing models, strict asset tracking ratios, and dynamic algorithmic hedging criteria.</p>
            <div className="pt-2"><span className="text-[10px] font-black uppercase tracking-wider bg-[#1a0808] border border-[#2b0808] text-rose-300 px-2.5 py-1 rounded-md">6 Modules • Advanced</span></div>
          </div>
        </div>
      </section>

      {/* CAMPUS DEPLOYMENT METRICS BANNER */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 pt-32 relative z-10 scroll-mt-24">
        <div className="bg-gradient-to-br from-[#0f0505] to-[#1a0808] border border-[#2b0808] text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="bg-[#7a0000]/20 text-[#ff3333] font-mono font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded border border-[#7a0000]/40">
              Campus Classroom Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">Launch Custom Classroom Tournaments</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg mx-auto md:mx-0">
              Deploy programmatic classroom sandboxes, initiate specific challenge milestones, and monitor student metrics through clean analytical reporting tables.
            </p>
          </div>

          <div className="w-full md:w-auto z-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/signup"
              className="px-6 py-4 bg-[#7a0000] hover:bg-[#a30000] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all text-center w-full sm:w-auto whitespace-nowrap"
            >
              Setup Institutional Trial Token
            </Link>
            <Link
              href="/signup?mode=login"
              className="px-6 py-4 bg-[#1a0808] border border-[#2b0808] text-slate-300 hover:text-white hover:border-[#7a0000] text-xs font-black uppercase tracking-wider rounded-xl transform hover:-translate-y-0.5 transition-all text-center w-full sm:w-auto whitespace-nowrap"
            >
              Existing Trader Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}