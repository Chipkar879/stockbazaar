'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

// ⚠️ ENTER YOUR EXACT PRIVATE EMAIL ADDR NODE HERE
const SUPER_ADMIN_EMAIL = 'verymystery18@gmail.com';

export default function SuperAdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  
  // Interactive Modal Inspection State
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const verifyIdentity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session.user.email === SUPER_ADMIN_EMAIL) {
        setAuthorized(true);
        fetchMasterData();
      } else {
        window.location.href = '/'; // Redirect unverified users back home
      }
    };
    verifyIdentity();
  }, []);

  const fetchMasterData = async () => {
    // 1. Fetch all profiles across all tracks
    const { data: profiles } = await supabase.from('profiles').select('*');
    setAllProfiles(profiles || []);

    // 2. Fetch pending teacher verification requests
    const { data: teachers } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .eq('verification_status', 'pending');
    setPendingTeachers(teachers || []);
    setLoading(false);
  };

  const handleUpdateTeacher = async (teacherId, status) => {
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: status })
      .eq('id', teacherId);
    if (!error) {
      fetchMasterData();
      if (selectedProfile?.id === teacherId) {
        setSelectedProfile(prev => ({ ...prev, verification_status: status }));
      }
    }
  };

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
              Click any user card below to inspect complete profile dossier, wallet standings, and institutional links.
            </p>
          </div>

          <div className="bg-[#0f0505] border border-[#2b0808] px-4 py-2 rounded-xl text-xs font-mono text-slate-400">
            Node ID: <span className="text-[#ff3333] font-bold">{SUPER_ADMIN_EMAIL}</span>
          </div>
        </div>

        {/* SECTION A: TEACHER VERIFICATION AUDIT QUEUE */}
        <div className="bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border-b-4 border-b-[#2b0808]">
          <div className="flex items-center justify-between border-b border-[#2b0808] pb-4">
            <h2 className="text-sm font-poppins font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              📝 Pending Teacher Verification Letters ({pendingTeachers.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500 font-bold">MANUAL AUDIT</span>
          </div>

          {pendingTeachers.length === 0 ? (
            <p className="text-xs font-medium text-slate-500 py-2">No verification letters currently pending audit inside storage buckets.</p>
          ) : (
            <div className="space-y-3">
              {pendingTeachers.map((teacher) => (
                <div key={teacher.id} className="p-4 bg-[#1a0808] border border-[#2b0808] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-bold shadow-md">
                  <div className="space-y-1">
                    <p className="text-sm text-white font-black">{teacher.name}</p>
                    <p className="text-slate-400 font-mono font-medium">{teacher.email}</p>
                    {teacher.verification_document_url && (
                      <a href={teacher.verification_document_url} target="_blank" rel="noreferrer" className="inline-block text-[#ff3333] hover:underline pt-1 text-[11px] font-bold">
                        📂 View Appointment Letter Proof
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => handleUpdateTeacher(teacher.id, 'approved')} className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all text-xs font-black uppercase tracking-wider">
                      Approve Teacher
                    </button>
                    <button onClick={() => handleUpdateTeacher(teacher.id, 'rejected')} className="w-full md:w-auto px-4 py-2.5 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-950 text-rose-400 rounded-xl transition-all text-xs font-black uppercase tracking-wider">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION B: CLICKABLE USER CARD GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#2b0808] pb-4">
            <h2 className="text-sm font-poppins font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              📊 Registered Application Users Matrix ({allProfiles.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500 font-bold">CLICK CARD FOR FULL DOSSIER</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProfiles.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className="bg-[#0f0505] border-2 border-[#2b0808] hover:border-[#7a0000] p-5 rounded-2xl shadow-xl hover:shadow-[0_10px_25px_rgba(122,0,0,0.3)] transition-all cursor-pointer group space-y-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="truncate">
                    <h3 className="font-poppins font-black text-sm text-white group-hover:text-[#ff3333] transition-colors truncate">
                      {p.name || 'Unnamed Account'}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate">{p.email}</p>
                  </div>

                  <span className="px-2.5 py-0.5 bg-[#1a0808] border border-[#2b0808] text-[#ff3333] rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                    {p.role}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2b0808] text-xs font-bold">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Sandbox Balance</span>
                    <span className="text-white font-mono">₹{(p.wallet_balance || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Status</span>
                    {p.role === 'teacher' ? (
                      <span className={`text-[10px] font-black uppercase ${p.verification_status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.verification_status || 'pending'}
                      </span>
                    ) : p.role === 'student' ? (
                      <span className={`text-[10px] font-black uppercase ${p.student_approved ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.student_approved ? 'Cleared' : 'Pending'}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Active</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-bold flex items-center justify-end gap-1 pt-1 group-hover:text-slate-300">
                  <span>Inspect Details</span> ➔
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED USER DOSSIER INSPECTION MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80 transition-all duration-300 animate-fadeInFast">
          <div className="bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2b0808] flex items-center justify-between bg-[#1a0808]">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ff3333] bg-[#0f0505] px-2.5 py-1 rounded-md border border-[#2b0808]">
                  {selectedProfile.role} Track Dossier
                </span>
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

            {/* Modal Body Canvas */}
            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
              
              {/* Financial Position Banner */}
              <div className="bg-gradient-to-br from-[#7a0000] to-[#4a0000] p-5 rounded-2xl text-white shadow-lg space-y-1 border border-[#a30000]/40">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-200/80">
                  Current Virtual Wallet Balance
                </p>
                <p className="text-3xl font-poppins font-black tracking-tight font-mono">
                  ₹{(selectedProfile.wallet_balance || 0).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Complete Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">User Unique Identifier (UUID)</span>
                  <p className="text-white font-mono break-all text-[11px]">{selectedProfile.id}</p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Email Address</span>
                  <p className="text-slate-300 font-mono text-[11px]">{selectedProfile.email}</p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Account Role / Track</span>
                  <p className="text-[#ff3333] font-black uppercase">{selectedProfile.role}</p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">School Hub Code</span>
                  <p className="text-white font-mono">{selectedProfile.school_id || 'Not Enrolled'}</p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Specific Class Container ID</span>
                  <p className="text-white font-mono">{selectedProfile.specific_class_id || 'Unassigned'}</p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Quiz Standings Points</span>
                  <p className="text-amber-400 font-mono">{selectedProfile.quiz_points || 0} PTS</p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Student Verification Status</span>
                  <p className={selectedProfile.student_approved ? 'text-emerald-400 font-black' : 'text-amber-400 font-black'}>
                    {selectedProfile.student_approved ? 'Cleared / Approved' : 'Pending Approval'}
                  </p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Teacher Audit Status</span>
                  <p className={selectedProfile.verification_status === 'approved' ? 'text-emerald-400 font-black' : 'text-amber-400 font-black'}>
                    {selectedProfile.verification_status || 'N/A'}
                  </p>
                </div>

                <div className="p-3.5 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1 md:col-span-2">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Account Creation Timestamp</span>
                  <p className="text-slate-300 font-mono text-[11px]">
                    {selectedProfile.created_at ? new Date(selectedProfile.created_at).toUTCString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Security Safeguard Notice */}
              <div className="p-4 bg-[#1a0808] border border-[#2b0808] rounded-xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">🔒 Security & Authentication Note</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Passwords are protected by Supabase Auth using one-way cryptographic hashing (bcrypt/argon2). Plaintext passwords are never stored in the database or transmitted to client applications.
                </p>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-[#2b0808] bg-[#1a0808] flex justify-end gap-3">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-6 py-2.5 bg-[#7a0000] hover:bg-[#a30000] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}