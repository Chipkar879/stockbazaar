'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, message: '', success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', success: false });

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStatus({ loading: false, message: 'Account created! Redirecting to simulator...', success: true });
      // Here you can redirect them to /simulator or /dashboard after a brief delay
    } catch (err) {
      setStatus({ loading: false, message: err.message, success: false });
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased">
      <Navbar />
      
      <section className="max-w-md mx-auto px-6 pt-20 pb-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-poppins font-black text-2xl text-slate-950">Create Your Arena Wallet</h1>
            <p className="text-xs text-slate-500">Get ₹10,000,000 in virtual sandbox chips instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Full Name</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8EF7]"
                placeholder="Alex Mercer"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4F8EF7]"
                placeholder="alex@campus.edu"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

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
              {status.loading ? 'Deploying Credentials...' : 'Open Free Sandbox Account'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
            Already trading? <Link href="/login" className="text-[#4F8EF7] font-bold hover:underline">Sign In</Link>
          </div>
        </div>
      </section>
    </main>
  );
}