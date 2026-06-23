'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

export default function Signup() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const [accountType, setAccountType] = useState('personal');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', schoolCode: '' });
  const [status, setStatus] = useState({ loading: false, message: '', success: false });

  useEffect(() => {
    setIsLogin(searchParams.get('mode') === 'login');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', success: false });

    try {
      if (isLogin) {
        // --- LOGIN ACTION WORKFLOW ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        setStatus({ loading: false, message: 'Authentication successful! Redirecting...', success: true });
        window.location.href = '/';
      } else {
        // --- SIGNUP REGISTRATION WORKFLOW ---
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: accountType,
            schoolCode: accountType !== 'personal' ? formData.schoolCode : null
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');

        setStatus({ loading: false, message: 'Account active! Verification link sent to email.', success: true });
      }
    } catch (err) {
      setStatus({ loading: false, message: err.message, success: false });
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased">
      <Navbar />
      
      <section className="max-w-md mx-auto px-6 pt-16 pb-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-poppins font-black text-2xl text-slate-950">
              {isLogin ? 'Welcome Back' : 'Create Your Wallet'}
            </h1>
            <p className="text-xs text-slate-500">
              {isLogin ? 'Access your live sandbox workspace terminal.' : 'Get ₹50,000 in virtual sandbox chips instantly.'}
            </p>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {['personal', 'student', 'teacher'].map((type) => (
                <button
                  key={type} type="button" onClick={() => setAccountType(type)}
                  className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${accountType === type ? 'bg-white text-[#4F8EF7] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8EF7]"
                  placeholder="Alex Mercer"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8EF7]"
                placeholder="alex@campus.edu"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {!isLogin && accountType !== 'personal' && (
              <div className="animate-fadeInFast">
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5 text-[#4F8EF7]">School Access Code</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl text-sm focus:outline-none focus:border-[#4F8EF7] font-mono"
                  placeholder="e.g. CAMPUS-2026"
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Security Password</label>
              <input 
                type="password" required minLength={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8EF7]"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {status.message && (
              <p className={`text-xs font-bold p-3 rounded-xl border ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                {status.message}
              </p>
            )}

            <button
              type="submit" disabled={status.loading}
              className="w-full py-4 bg-[#4F8EF7] text-white font-poppins font-black rounded-xl text-sm shadow-md hover:bg-[#3b7add] transition-all disabled:opacity-50"
            >
              {status.loading ? 'Processing Credentials...' : isLogin ? 'Sign In To Account' : 'Open Free Sandbox Account'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
            {isLogin ? (
              <>New trader? <button onClick={() => window.history.replaceState(null, '', '/signup')} className="text-[#4F8EF7] font-bold hover:underline">Register Here</button></>
            ) : (
              <>Already trading? <button onClick={() => window.history.replaceState(null, '', '/signup?mode=login')} className="text-[#4F8EF7] font-bold hover:underline">Sign In</button></>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}