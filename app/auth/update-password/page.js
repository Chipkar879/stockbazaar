'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', success: false });

  useEffect(() => {
    // Check if the user arrived here with an active recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({
          loading: false,
          message: 'Security token invalid or expired. Please request a new link from the login page.',
          success: false
        });
      }
    };
    checkSession();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ loading: false, message: 'Passwords do not match.', success: false });
      return;
    }

    setStatus({ loading: true, message: '', success: false });

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setStatus({
        loading: false,
        message: 'Security credentials updated! Routing you to your sandbox panel...',
        success: true
      });

      // Clear the session tokens out safely and send them to login/simulator
      setTimeout(() => {
        window.location.href = '/simulator';
      }, 1500);

    } catch (err) {
      setStatus({ loading: false, message: err.message, success: false });
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7ff] antialiased">
      <Navbar />
      <section className="max-w-md mx-auto px-6 pt-16 pb-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          
          <div className="text-center space-y-1">
            <h1 className="font-black text-2xl text-slate-950">Update Password</h1>
            <p className="text-xs text-slate-500">Establish your new platform access credentials.</p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">
                New Secure Password
              </label>
              <input 
                type="password" 
                required 
                minLength={6}
                value={password}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">
                Confirm New Password
              </label>
              <input 
                type="password" 
                required 
                minLength={6}
                value={confirmPassword}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                placeholder="••••••••" 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>

            {status.message && (
              <p className={`text-xs font-bold p-3 rounded-xl border ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                {status.message}
              </p>
            )}

            <button 
              type="submit" 
              disabled={status.loading || !password} 
              className="w-full py-4 bg-blue-500 text-white font-black rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {status.loading ? 'Updating Credentials...' : 'Save New Password'}
            </button>
          </form>

        </div>
      </section>
    </main>
  );
}