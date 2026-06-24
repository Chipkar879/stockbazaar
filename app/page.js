'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const RainingAsset = ({ icon, isMobileHidden }) => {
  const [style, setStyle] = useState({});
  useEffect(() => {
    setStyle({
      left: `${Math.random() * 92 + 3}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 7}s`,
      fontSize: `${Math.random() * 12 + 14}px`,
    });
  }, []);
  return (
    <div className={`absolute top-[-5vh] text-slate-300/30 pointer-events-none select-none animate-rainDown ${isMobileHidden ? 'hidden md:block' : ''}`} style={style}>
      {icon}
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('stocks'); 
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [allSchoolTeachers, setAllSchoolTeachers] = useState([]);
  const [pendingClassStudents, setPendingClassStudents] = useState([]);
  const [newClassName, setNewClassName] = useState('');

  const MOCK_STOCKS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', price: 1309.35, change: 12.40, pct: 0.95, positive: true },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 4120.00, change: -45.50, pct: -1.09, positive: false },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', price: 1642.10, change: 8.90, pct: 0.54, positive: true },
    { symbol: 'INFY.NS', name: 'Infosys Limited', price: 1812.40, change: 22.15, pct: 1.24, positive: true },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', price: 1224.70, change: -3.40, pct: -0.28, positive: false },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', price: 1540.25, change: 31.80, pct: 2.11, positive: true }
  ];

  const MOCK_CHALLENGES = [
    { symbol: 'HIGH-BETA.SYS', name: 'High-Beta Equity Alpha Pool', price: 12500.00, change: -2500.00, pct: -20.00, positive: false },
    { symbol: 'GLOBAL-MACRO.SYS', name: 'Global Macro Futures Strategy', price: 24890.00, change: 1420.00, pct: 6.05, positive: true },
    { symbol: 'TECH-MOMENTUM.SYS', name: 'Tech Sector Momentum Basket', price: 8940.10, change: 410.50, pct: 4.81, positive: true }
  ];

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data } = await supabase.from('profiles').select('*, school_classes(class_name)').eq('id', session.user.id).single();
          if (data) {
            setProfile(data);
            fetchInstitutionalEcosystem(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchInstitutionalEcosystem = async (currentProfile) => {
    if (!currentProfile.school_id) return;

    const { data: classes } = await supabase.from('school_classes').select('*, profiles(name, email)').eq('school_code', currentProfile.school_id);
    setSchoolClasses(classes || []);

    const { data: teachers } = await supabase.from('profiles').select('id, name, email').eq('school_id', currentProfile.school_id).eq('role', 'teacher').eq('verification_status', 'approved');
    setAllSchoolTeachers(teachers || []);

    const myAssignedClassIds = (classes || []).filter(c => c.assigned_teacher_id === currentProfile.id).map(c => c.id);
    if (myAssignedClassIds.length > 0) {
      const { data: students } = await supabase.from('profiles').select('*').in('specific_class_id', myAssignedClassIds).eq('student_approved', false);
      setPendingClassStudents(students || []);
    }
  };

  const handleCreateClassContainer = async () => {
    if (!newClassName || !profile?.school_id) return;
    const { error } = await supabase.from('school_classes').insert([{ school_code: profile.school_id, class_name: newClassName }]);
    if (!error) {
      setNewClassName('');
      fetchInstitutionalEcosystem(profile);
    }
  };

  const handleTeacherAssignToClass = async (classId, teacherId) => {
    const { error } = await supabase.from('school_classes').update({ assigned_teacher_id: teacherId || null }).eq('id', classId);
    if (!error) fetchInstitutionalEcosystem(profile);
  };

  const handleApproveStudent = async (studentId) => {
    const { error } = await supabase.from('profiles').update({ student_approved: true, wallet_balance: 50000 }).eq('id', studentId);
    if (!error) fetchInstitutionalEcosystem(profile);
  };

  const handleLeaveClassroomTrack = async () => {
    if (!confirm("Are you sure you want to leave this class track room? Your wallet position will reset.")) return;
    const { error } = await supabase.from('profiles').update({ school_id: null, specific_class_id: null, student_approved: false, wallet_balance: 0 }).eq('id', user.id);
    if (!error) window.location.reload();
  };

  const handleDeletePersonalAccount = async () => {
    if (!confirm("CRITICAL WARNING: Wiping your account configuration is permanent. Wipe all wallet data now?")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    if (!error) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const ASSET_TYPES = ['\u20B9', '$', '\uD83D\uDE80', '\uD83D\uDCC8', '\uD83D\uDCC9', '\u20BF', '\uD83D\uDCCA', '\uD83D\uDCBC', '\uD83D\uDCB3', '\uD83D\uDC8E'];
  const activeDataset = activeTab === 'stocks' ? MOCK_STOCKS : MOCK_CHALLENGES;

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased pb-20 relative overflow-x-hidden">
      <Navbar />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {ASSET_TYPES.map((asset, typeIdx) => [...Array(6)].map((_, itemIdx) => <RainingAsset key={`${typeIdx}-${itemIdx}`} icon={asset} isMobileHidden={itemIdx >= 2} />))}
      </div>

      {/* SECTION 1: HERO CONTAINER */}
      <section className="max-w-7xl mx-auto px-6 pt-16 text-center space-y-8 relative z-10">
        <div className="space-y-4 max-w-3xl mx-auto select-none animate-fadeIn">
          <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-[#4F8EF7] text-[11px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full shadow-inner">
            🏫 Institutional School Hub Workspace Network Enabled
          </span>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-slate-950">
            Own the Market <br /> Before the <span className="bg-gradient-to-r from-[#4F8EF7] to-[#34D399] bg-clip-text text-transparent">Bell Rings</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
            Practice real-time simulated order executions in structured school tournament pools or standalone personal sandbox environments.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          {loading ? (
            <div className="px-10 py-4 bg-slate-200 text-slate-400 rounded-2xl text-sm font-bold animate-pulse">Syncing...</div>
          ) : !user ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="bg-[#4F8EF7] text-white font-black px-10 py-4 rounded-2xl text-sm shadow-xl hover:bg-blue-600 transition-all">Claim Your Sandbox Wallet</Link>
              <Link href="/signup?mode=login" className="bg-white text-slate-800 border border-slate-200 font-bold px-10 py-4 rounded-2xl text-sm shadow-sm hover:bg-slate-50 transition-all">Access Dashboard</Link>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Secure Session</p>
                  <h2 className="text-base font-black text-slate-950">{profile?.name || 'Anonymous User'}</h2>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-600 border border-slate-200">
                  Track: {profile?.role || 'Personal'}
                </span>
              </div>

              {profile?.role === 'student' && (
                <div className="space-y-4">
                  {!profile.student_approved ? (
                    <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl text-xs">
                      <strong>🔒 Desk Awaiting Verification:</strong> Enrolled in school hub <strong>{profile.school_id}</strong>. Your assigned classroom manager will unlock your sandbox balance shortly.
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-xl text-white shadow-inner">
                      <p className="text-[10px] font-black uppercase text-emerald-100">Cleared Cash Allocation</p>
                      <p className="text-2xl font-black">₹{(profile.wallet_balance || 0).toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  <button onClick={handleLeaveClassroomTrack} className="w-full py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all">
                    Leave Classroom Tracker
                  </button>
                </div>
              )}

              {profile?.role === 'personal' && (
                <div className="bg-gradient-to-br from-[#4F8EF7] to-blue-600 p-4 rounded-xl text-white shadow-sm">
                  <p className="text-[10px] font-black uppercase text-blue-100">Independent Portfolio Balance</p>
                  <p className="text-2xl font-black">₹{(profile.wallet_balance || 0).toLocaleString('en-IN')}</p>
                </div>
              )}

              {profile?.role === 'teacher' && profile?.verification_status === 'approved' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">🏢 School Class Management Deck (Hub: {profile.school_id})</h3>
                    <div className="flex gap-2">
                      <input type="text" className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-full focus:outline-none font-bold" placeholder="Add Class Name (e.g. Class 9-A)" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                      <button onClick={handleCreateClassContainer} className="px-4 py-1.5 bg-[#4F8EF7] text-white font-bold text-xs rounded-xl whitespace-nowrap">Create Class</button>
                    </div>

                    <div className="space-y-2 pt-2 divide-y divide-slate-100">
                      {schoolClasses.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-2">No classrooms added under this school code yet.</p>
                      ) : (
                        schoolClasses.map((c) => (
                          <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2 text-xs font-bold">
                            <span className="text-slate-950 font-black">🏫 {c.class_name}</span>
                            <select className="bg-white border border-slate-200 p-1 rounded-lg text-[11px] text-slate-600 font-medium max-w-xs focus:outline-none" value={c.assigned_teacher_id || ''} onChange={(e) => handleTeacherAssignToClass(c.id, e.target.value)}>
                              <option value="">-- Assign Manager Teacher --</option>
                              {allSchoolTeachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                            </select>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">📋 Live Assigned Roster Requests ({pendingClassStudents.length})</h3>
                    {pendingClassStudents.length === 0 ? (
                      <p className="text-[11px] text-slate-400 font-medium">No pending requests waiting in your assigned classrooms.</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingClassStudents.map(student => (
                          <div key={student.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold">
                            <div>
                              <p className="text-slate-950">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono font-medium">{student.email}</p>
                            </div>
                            <button onClick={() => handleApproveStudent(student.id)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition-all">Approve Position</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 border border-rose-100 bg-rose-50/20 rounded-2xl space-y-1">
                <h4 className="text-xs font-black text-rose-600 uppercase tracking-wider">⚠️ Danger Zone</h4>
                <p className="text-[10px] text-slate-400 font-medium">Wiping your profile is immediate, final, and clears all linked sandbox configurations.</p>
                <button onClick={handleDeletePersonalAccount} className="mt-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] rounded-xl transition-all">
                  Delete My Account Completely
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-bold">
                <span className="text-slate-400 font-mono">{user.email}</span>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="text-rose-600 hover:underline">Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: LIVE MARKET SIMULATOR */}
      <section id="simulator" className="max-w-4xl mx-auto px-6 pt-28 relative z-10 space-y-6 scroll-mt-24">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Real-Time Simulator Ticker</h2>
          <p className="text-slate-400 text-xs font-medium">Toggle assets to view operational workspace rates and mock tracking margins.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="space-y-2">
            <button onClick={() => setActiveTab('stocks')} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'stocks' ? 'bg-blue-50 border-[#4F8EF7] text-[#4F8EF7]' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>📈 NSE Stocks <span className={`h-2 w-2 rounded-full ${activeTab === 'stocks' ? 'bg-[#4F8EF7] animate-pulse' : 'bg-slate-300'}`} /></button>
            <button onClick={() => setActiveTab('crypto')} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'crypto' ? 'bg-purple-50 border-purple-500 text-purple-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>🚀 Challenge Equities <span className={`h-2 w-2 rounded-full ${activeTab === 'crypto' ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`} /></button>
          </div>
          
          <div className="col-span-2 bg-[#0f111a] rounded-2xl p-6 min-h-[260px] flex flex-col justify-between text-slate-200 shadow-xl border border-slate-800">
            <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[220px] pr-1 custom-scrollbar space-y-1.5">
              {activeDataset.map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between pt-2 first:pt-0 animate-fadeInFast">
                  <div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded mr-2 ${activeTab === 'stocks' ? 'bg-slate-800 text-slate-300' : 'bg-purple-950 text-purple-300'}`}>{asset.symbol}</span>
                    <p className="text-[11px] font-bold text-slate-200 inline-block">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-black text-white">₹{asset.price.toLocaleString('en-IN')}</p>
                    <p className={`text-[10px] font-bold font-mono ${asset.positive ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {asset.positive ? '+' : ''}{asset.change} ({asset.positive ? '+' : ''}{asset.pct}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LEARNING INTEGRATION CURRICULUM */}
      <section id="courses" className="max-w-6xl mx-auto px-6 pt-28 relative z-10 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Integrated Trading Academy</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto font-medium">Master tactical market theories through dynamic self-paced sandbox training paths.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#4F8EF7] flex items-center justify-center text-lg font-black">01</div>
            <h3 className="font-black text-base text-slate-950">Market Foundations</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Understand technical asset pricing loops, stock charts, order structures, and index operations across primary exchanges.</p>
            <div className="pt-2"><span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">8 Modules • Beginner</span></div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg font-black">02</div>
            <h3 className="font-black text-base text-slate-950">Technical Analysis</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Map patterns using support levels, moving averages, and volume indicators to execute quantitative simulator mock plays.</p>
            <div className="pt-2"><span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">12 Modules • Intermediate</span></div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-black">03</div>
            <h3 className="font-black text-base text-slate-950">Portfolio Risk Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Mitigate drawdown via position sizing models, strict asset tracking ratios, and dynamic algorithmic hedging criteria.</p>
            <div className="pt-2"><span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md">6 Modules • Advanced</span></div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PRICING & CALL TO ACTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 pt-32 relative z-10 scroll-mt-24">
        <div className="bg-gradient-to-br from-slate-950 to-indigo-950 text-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="bg-white/10 text-[#34D399] font-mono font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded">Campus Hub Access</span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">Launch Programmatic Tournaments</h2>
            <p className="text-slate-300 text-xs leading-relaxed">Deploy custom campus sandboxes, spin up tailored milestones, and track individual user performance via structural coordination panels.</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="px-6 py-4 bg-white text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-md hover:bg-slate-100 transition-all">Setup Custom Hub</Link>
            <Link href="/signup?mode=login" className="px-6 py-4 bg-white/10 border border-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl text-center hover:bg-white/20 transition-all">Trader Login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}