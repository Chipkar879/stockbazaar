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

  useEffect(() => {
    const verifyIdentity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session.user.email === SUPER_ADMIN_EMAIL) {
        setAuthorized(true);
        fetchMasterData();
      } else {
        window.location.href = '/'; // Kick unverified invaders straight back home
      }
    };
    verifyIdentity();
  }, []);

  const fetchMasterData = async () => {
    // 1. Fetch absolutely all profiles across all tracks
    const { data: profiles } = await supabase.from('profiles').select('*');
    setAllProfiles(profiles || []);

    // 2. Fetch teachers awaiting application audits
    const { data: teachers } = await supabase.from('profiles').select('*').eq('role', 'teacher').eq('verification_status', 'pending');
    setPendingTeachers(teachers || []);
    setLoading(false);
  };

  const handleUpdateTeacher = async (teacherId, status) => {
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: status })
      .eq('id', teacherId);
    if (!error) fetchMasterData();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 flex justify-center">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-[#ff3333] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse">Securing Admin Firewall Layer...</p>
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
            <p className="text-xs text-slate-400 font-medium mt-1">Ultimate command overview database layer for the entire Bull Run application network.</p>
          </div>

          <div className="bg-[#0f0505] border border-[#2b0808] px-4 py-2 rounded-xl text-xs font-mono text-slate-400">
            Node ID: <span className="text-[#ff3333] font-bold">{SUPER_ADMIN_EMAIL}</span>
          </div>
        </div>

        {/* SECTION A: THE TEACHER AUDIT QUEUE */}
        <div className="bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border-b-4 border-b-[#2b0808]">
          <div className="flex items-center justify-between border-b border-[#2b0808] pb-4">
            <h2 className="text-sm font-poppins font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              📝 Teacher Verification Audit Queue ({pendingTeachers.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500 font-bold">MANUAL REVIEW</span>
          </div>

          {pendingTeachers.length === 0 ? (
            <p className="text-xs font-medium text-slate-500 py-3">No verification letters currently pending audit inside the storage buckets.</p>
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

        {/* SECTION B: GLOBAL MASTER ROSTER DATA MONITOR */}
        <div className="bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border-b-4 border-b-[#2b0808] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#2b0808] pb-4">
            <h2 className="text-sm font-poppins font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              📊 Global Application User Roster ({allProfiles.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500 font-bold">LIVE DATABASE SYNCHRONIZED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2b0808] text-slate-500 uppercase tracking-wider font-black text-[10px]">
                  <th className="pb-3 pr-2">Full Name</th>
                  <th className="pb-3 pr-2">Email</th>
                  <th className="pb-3 pr-2">Track</th>
                  <th className="pb-3 pr-2">Clearance Status</th>
                  <th className="pb-3 text-right">Cash Balance</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-300 divide-y divide-[#2b0808]/60">
                {allProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1a0808]/80 transition-colors">
                    <td className="py-3.5 pr-2 font-black text-white">{p.name}</td>
                    <td className="py-3.5 pr-2 font-mono text-slate-400">{p.email}</td>
                    <td className="py-3.5 pr-2 uppercase font-black tracking-widest text-[9px] text-[#ff3333]">{p.role}</td>
                    <td className="py-3.5 pr-2">
                      {p.role === 'teacher' ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${p.verification_status === 'approved' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' : 'bg-amber-950/50 border-amber-800 text-amber-400'}`}>
                          {p.verification_status}
                        </span>
                      ) : p.role === 'student' ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${p.student_approved ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' : 'bg-amber-950/50 border-amber-800 text-amber-400'}`}>
                          {p.student_approved ? 'cleared' : 'pending'}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono font-black text-white">₹{(p.wallet_balance || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}