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

  if (loading) return <div className="text-center py-24 font-bold text-xs animate-pulse text-slate-400">Securing Admin Firewall...</div>;
  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased pb-12">
      <Navbar />
      <section className="max-w-6xl mx-auto px-6 pt-12 space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-black text-slate-950">Master Control Panel</h1>
          <p className="text-xs text-slate-400">Ultimate command overview database layer for the entire StockBazaar application network.</p>
        </div>

        {/* SECTION A: THE TEACHER AUDIT QUEUE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider text-amber-500">📝 Teacher Verification Audit Queue ({pendingTeachers.length})</h2>
          {pendingTeachers.length === 0 ? (
            <p className="text-xs font-medium text-slate-400 py-2">No verification letters currently pending audit inside the storage buckets.</p>
          ) : (
            <div className="space-y-3">
              {pendingTeachers.map((teacher) => (
                <div key={teacher.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-bold">
                  <div className="space-y-0.5">
                    <p className="text-sm text-slate-950">{teacher.name}</p>
                    <p className="text-slate-400 font-medium font-mono">{teacher.email}</p>
                    {teacher.verification_document_url && (
                      <a href={teacher.verification_document_url} target="_blank" rel="noreferrer" className="inline-block text-blue-500 hover:underline pt-1">📂 View Appointment Letter Proof</a>
                    )}
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => handleUpdateTeacher(teacher.id, 'approved')} className="w-full md:w-auto px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-sm hover:bg-emerald-600">Approve Teacher</button>
                    <button onClick={() => handleUpdateTeacher(teacher.id, 'rejected')} className="w-full md:w-auto px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-100">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION B: GLOBAL MASTER ROSTER DATA MONITOR */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 overflow-hidden">
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider text-slate-400">📊 Global Application User Roster ({allProfiles.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 pr-2">Full Name</th>
                  <th className="pb-3 pr-2">Email</th>
                  <th className="pb-3 pr-2">Track</th>
                  <th className="pb-3 pr-2">Clearance Status</th>
                  <th className="pb-3 text-right">Cash Balance</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-700 divide-y divide-slate-50">
                {allProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-2 font-black text-slate-950">{p.name}</td>
                    <td className="py-3 pr-2 font-mono text-slate-400">{p.email}</td>
                    <td className="py-3 pr-2 uppercase font-black tracking-widest text-[9px] text-[#4F8EF7]">{p.role}</td>
                    <td className="py-3 pr-2">
                      {p.role === 'teacher' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.verification_status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{p.verification_status}</span>
                      ) : p.role === 'student' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.student_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{p.student_approved ? 'cleared' : 'pending'}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-950">₹{(p.wallet_balance || 0).toLocaleString('en-IN')}</td>
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