'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

function SignupForm() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const [accountType, setAccountType] = useState('personal');
  const [documentFile, setDocumentFile] = useState(null);
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
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        window.location.href = '/';
      } else {
        let uploadedUrl = null;

        // Handle raw binary file upload directly if teacher track is selected
        if (accountType === 'teacher' && documentFile) {
          const fileExt = documentFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('teacher-proofs')
            .upload(fileName, documentFile);

          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('teacher-proofs')
            .getPublicUrl(fileName);
            
          uploadedUrl = publicUrlData.publicUrl;
        }

        // Forward structure validation payloads downstream to registration API
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: accountType,
            schoolCode: accountType === 'student' ? formData.schoolCode : null,
            documentUrl: uploadedUrl
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration fault occurred.');

        setStatus({ 
          loading: false, 
          message: accountType === 'teacher' 
            ? 'Account created! Complete email verification. Awaiting document audit.' 
            : accountType === 'student'
            ? 'Registered successfully! Your profile is pending teacher clearance.'
            : 'Account active! Check email for verification link.', 
          success: true 
        });
      }
    } catch (err) {
      setStatus({ loading: false, message: err.message, success: false });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-black text-2xl text-slate-950">{isLogin ? 'Welcome Back' : 'Create Your Wallet'}</h1>
        <p className="text-xs text-slate-500">
          {isLogin ? 'Access your sandbox workspace.' : 'Initialize your ₹50,000 virtual allocation.'}
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
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Full Name</label>
            <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Alex Mercer" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Email Address</label>
          <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="alex@campus.edu" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>

        {!isLogin && accountType === 'student' && (
          <div className="animate-fadeInFast">
            <label className="block text-[11px] font-black uppercase text-[#4F8EF7] tracking-wider mb-1">Live Classroom Code</label>
            <input type="text" required className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl text-sm font-mono" placeholder="e.g. BAZAAR-X92" onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })} />
          </div>
        )}

        {!isLogin && accountType === 'teacher' && (
          <div className="animate-fadeInFast">
            <label className="block text-[11px] font-black uppercase text-amber-500 tracking-wider mb-1">Upload Appointment Letter (PDF/Image)</label>
            <input type="file" required accept="image/*,application/pdf" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" onChange={(e) => setDocumentFile(e.target.files[0])} />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Security Password</label>
          <input type="password" required minLength={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="••••••••" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        </div>

        {status.message && (
          <p className={`text-xs font-bold p-3 rounded-xl border ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
            {status.message}
          </p>
        )}

        <button type="submit" disabled={status.loading} className="w-full py-4 bg-[#4F8EF7] text-white font-black rounded-xl text-sm transition-all disabled:opacity-50">
          {status.loading ? 'Syncing Credentials...' : isLogin ? 'Sign In To Account' : 'Open Free Sandbox Account'}
        </button>
      </form>

      {/* DYNAMIC USER TRANSITION LINKS */}
      <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
        {isLogin ? (
          <>
            Don't have an account?{' '}
            <button 
              onClick={() => window.history.replaceState(null, '', '/signup')} 
              className="text-[#4F8EF7] font-bold hover:underline"
              type="button"
            >
              Register here
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button 
              onClick={() => window.history.replaceState(null, '', '/signup?mode=login')} 
              className="text-[#4F8EF7] font-bold hover:underline"
              type="button"
            >
              Login here
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased">
      <Navbar />
      <section className="max-w-md mx-auto px-6 pt-16 pb-12">
        <Suspense fallback={<div className="w-full text-center py-12 animate-pulse text-xs font-bold text-slate-400">Loading Configuration...</div>}>
          <SignupForm />
        </Suspense>
      </section>
    </main>
  );
}