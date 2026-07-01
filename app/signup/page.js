'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

function SignupForm() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const [accountType, setAccountType] = useState('personal');
  const [documentFile, setDocumentFile] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', schoolCode: '', specificClassId: '' });
  const [status, setStatus] = useState({ loading: false, message: '', success: false });

  // Forgot Password System States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [confirmEmailInput, setConfirmEmailInput] = useState('');

  useEffect(() => {
    setIsLogin(searchParams.get('mode') === 'login');
    // Reset forgot password sub-views if mode changes
    setIsForgotMode(false);
  }, [searchParams]);

  const handleSchoolCodeBlur = async (code) => {
    if (!code) return;
    const { data, error } = await supabase
      .from('school_classes')
      .select('id, class_name')
      .eq('school_code', code.toUpperCase());
    
    if (!error && data) {
      setAvailableClasses(data);
    }
  };

  // Triggers the masking step when "Forgot Password?" is selected
  const initForgotPasswordFlow = () => {
    const rawEmail = formData.email.trim();
    if (!rawEmail || !rawEmail.includes('@')) {
      setStatus({ loading: false, message: 'Please input your email address above first so we can mask it.', success: false });
      return;
    }

    const [username, domain] = rawEmail.split('@');
    if (username.length <= 2) {
      setMaskedEmail(`${username[0]}***@${domain}`);
    } else {
      setMaskedEmail(`${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`);
    }
    
    setTargetEmail(rawEmail.toLowerCase());
    setIsForgotMode(true);
    setStatus({ loading: false, message: '', success: false });
  };

  // Handles sending the secure password reset link via Supabase
  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', success: false });

    if (confirmEmailInput.trim().toLowerCase() !== targetEmail) {
      setStatus({ loading: false, message: 'The confirmation email handle does not match the masked balance credential.', success: false });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setStatus({
        loading: false,
        message: 'Security link dispatched! Please check your mailbox to update your password credentials.',
        success: true
      });
      setConfirmEmailInput('');
    } catch (err) {
      setStatus({ loading: false, message: err.message, success: false });
    }
  };

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
        
        setTimeout(() => {
          window.location.href = '/simulator';
        }, 500);
      } else {
        let uploadedUrl = null;

        if (accountType === 'teacher' && documentFile) {
          const fileExt = documentFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('teacher-proofs')
            .upload(fileName, documentFile);

          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('teacher-proofs')
            .getPublicUrl(fileName);
            
          uploadedUrl = publicUrlData.publicUrl;
        }

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: accountType,
            schoolCode: formData.schoolCode.toUpperCase(),
            specificClassId: formData.specificClassId || null,
            documentUrl: uploadedUrl
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fault in submission.');

        const { error: autoLoginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (autoLoginError) throw autoLoginError;

        setStatus({ 
          loading: false, 
          message: accountType === 'teacher' 
            ? 'Account built! Coordinator approval pending.' 
            : accountType === 'student'
            ? 'Success! Awaiting class manager approval to activate your portfolio.'
            : 'Account active! Logging you into your ₹50,000 sandbox portfolio...', 
          success: true 
        });

        setTimeout(() => {
          window.location.href = '/simulator';
        }, 800);
      }
    } catch (err) {
      setStatus({ loading: false, message: err.message, success: false });
    }
  };

  // RENDER INTERACTIVE PASSWORD RESET FORM OVERLAY
  if (isLogin && isForgotMode) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 animate-fadeInFast">
        <div className="text-center space-y-1">
          <h1 className="font-black text-2xl text-slate-950">Security Reset Matrix</h1>
          <p className="text-xs text-slate-500">Confirm identity for target payload: <span className="text-blue-500 font-mono font-bold">{maskedEmail}</span></p>
        </div>

        <form onSubmit={handlePasswordResetRequest} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Verify Full Email Handle</label>
            <input 
              type="email" 
              required 
              value={confirmEmailInput}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" 
              placeholder="Type your email exactly to unlock" 
              onChange={(e) => setConfirmEmailInput(e.target.value)} 
            />
          </div>

          {status.message && (
            <p className={`text-xs font-bold p-3 rounded-xl border ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
              {status.message}
            </p>
          )}

          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => { setIsForgotMode(false); setStatus({ message: '', success: false, loading: false }); }}
              className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
            >
              Back
            </button>
            <button 
              type="submit" 
              disabled={status.loading || !confirmEmailInput} 
              className="w-2/3 py-3 bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
            >
              {status.loading ? 'Dispatching...' : 'Dispatch Token Link'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-black text-2xl text-slate-950">{isLogin ? 'Welcome Back' : 'Create Your Wallet'}</h1>
        <p className="text-xs text-slate-500">{isLogin ? 'Access your workspace.' : 'Initialize your ₹50,000 sandbox portfolio.'}</p>
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
          <input type="email" required value={formData.email} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="alex@campus.edu" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>

        {!isLogin && (accountType === 'student' || accountType === 'teacher') && (
          <div className="animate-fadeInFast">
            <label className="block text-[11px] font-black uppercase text-[#4F8EF7] tracking-wider mb-1">Master School Hub Code</label>
            <input type="text" required className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl text-sm font-mono uppercase" placeholder="E.G. DPS-MUMBAI" 
              onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
              onBlur={(e) => handleSchoolCodeBlur(e.target.value)} 
            />
          </div>
        )}

        {!isLogin && accountType === 'student' && availableClasses.length > 0 && (
          <div className="animate-fadeInFast">
            <label className="block text-[11px] font-black uppercase text-emerald-500 tracking-wider mb-1">Select Your Classroom</label>
            <select required className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-sm font-medium text-slate-700 focus:outline-none" onChange={(e) => setFormData({ ...formData, specificClassId: e.target.value })}>
              <option value="">-- Choose Class --</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>
        )}

        {!isLogin && accountType === 'teacher' && (
          <div className="animate-fadeInFast">
            <label className="block text-[11px] font-black uppercase text-amber-500 tracking-wider mb-1">Upload Appointment Letter Proof (PDF/Image)</label>
            <input type="file" required accept="image/*,application/pdf" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700" onChange={(e) => setDocumentFile(e.target.files[0])} />
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">Security Password</label>
            {isLogin && (
              <button 
                type="button" 
                onClick={initForgotPasswordFlow}
                className="text-[10px] font-bold text-blue-500 hover:underline focus:outline-none [-webkit-tap-highlight-color:transparent]"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <input type="password" required={!isForgotMode} minLength={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="••••••••" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        </div>

        {status.message && (
          <p className={`text-xs font-bold p-3 rounded-xl border ${status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
            {status.message}
          </p>
        )}

        <button type="submit" disabled={status.loading} className="w-full py-4 bg-[#4F8EF7] text-white font-black rounded-xl text-sm transition-all disabled:opacity-50">
          {status.loading ? 'Syncing Workspace...' : isLogin ? 'Sign In' : 'Register Account'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
        {isLogin ? (
          <>Don't have an account? <button onClick={() => window.history.replaceState(null, '', '/signup')} className="text-[#4F8EF7] font-bold hover:underline">Register here</button></>
        ) : (
          <>Already have an account? <button onClick={() => window.history.replaceState(null, '', '/signup?mode=login')} className="text-[#4F8EF7] font-bold hover:underline">Login here</button></>
        )}
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <main className="min-h-screen bg-[#f5f7ff] antialiased">
      <Navbar />
      <section className="max-w-md mx-auto px-6 pt-16 pb-12">
        <Suspense fallback={<div className="w-full text-center py-12 text-xs font-bold text-slate-400">Loading Configuration...</div>}>
          <SignupForm />
        </Suspense>
      </section>
    </main>
  );
}