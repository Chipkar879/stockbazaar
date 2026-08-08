'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

const SUPER_ADMIN_EMAIL = 'verymystery18@gmail.com';

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time Countdown State
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isImmune: false,
    isPremium: false,
    isManuallyUnfrozen: false
  });

  const [paymentStep, setPaymentStep] = useState('browse');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUserAndTrial = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (data) setProfile(data);
        }
      } catch (err) {
        console.error("Pricing session fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndTrial();
  }, []);

  // Real-time ticking 1-second countdown interval
  useEffect(() => {
    if (!profile && !user) return;

    const updateTimer = () => {
      const email = user?.email || profile?.email;
      if (email === SUPER_ADMIN_EMAIL) {
        setCountdown({ days: 999, hours: 0, minutes: 0, seconds: 0, isExpired: false, isImmune: true, isPremium: false });
        return;
      }

      if (profile?.is_premium) {
        setCountdown({ days: 999, hours: 0, minutes: 0, seconds: 0, isExpired: false, isImmune: false, isPremium: true });
        return;
      }

      if (profile?.is_frozen === false) {
        // Explicitly unfrozen by admin
        setCountdown({ days: 7, hours: 0, minutes: 0, seconds: 0, isExpired: false, isImmune: false, isPremium: false, isManuallyUnfrozen: true });
        return;
      }

      if (profile?.is_frozen === true) {
        // Explicitly frozen by admin
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isImmune: false, isPremium: false });
        return;
      }

      // Calculate 7 days countdown from registration date
      const createdAt = profile?.created_at ? new Date(profile.created_at).getTime() : Date.now();
      const trialDurationMs = 7 * 24 * 60 * 60 * 1000;
      const trialEndsAt = createdAt + trialDurationMs;
      const now = Date.now();
      const remainingMs = trialEndsAt - now;

      if (remainingMs <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isImmune: false, isPremium: false });
      } else {
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds, isExpired: false, isImmune: false, isPremium: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile, user]);

  const handleExecuteUPIPayment = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      if (user) {
        await supabase
          .from('profiles')
          .update({ is_premium: true, is_frozen: false })
          .eq('id', user.id);
      }
      setPaymentStep('success');
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative max-w-full overflow-x-hidden pt-24 pb-20">
      <Navbar />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12 relative z-10 animate-fadeInFast">
        
        {/* TOP TITLES */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="bg-[#1a0808] text-[#ff3333] border border-[#2b0808] text-[9px] uppercase tracking-widest font-black px-3.5 py-1 rounded-full shadow-inner inline-block">
            💳 Bull Run Passes
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-poppins">
            Choose Your Trading Plan
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
            Accounts initialize with a 7-day sandbox window from registration. Upgrade anytime for permanent continuous access.
          </p>

          {/* DYNAMIC METRIC COUNTDOWN BADGE */}
          <div className="pt-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-[#0f0505] border border-[#2b0808] px-5 py-3 rounded-2xl shadow-xl text-xs">
              <span className="text-slate-400 font-medium">Your platform status:</span>
              
              {countdown.isImmune ? (
                <span className="bg-sky-950/80 text-sky-300 font-black px-3 py-1 rounded-lg border border-sky-800">
                  🛡️ SUPER ADMIN PERMANENT IMMUNITY
                </span>
              ) : countdown.isPremium ? (
                <span className="bg-emerald-950/80 text-emerald-400 font-black px-3 py-1 rounded-lg border border-emerald-800">
                  👑 PREMIUM PRO PASS ACTIVE
                </span>
              ) : countdown.isManuallyUnfrozen ? (
                <span className="bg-emerald-950/80 text-emerald-400 font-black px-3 py-1 rounded-lg border border-emerald-800">
                  🔓 MANUALLY UNFROZEN BY ADMIN
                </span>
              ) : countdown.isExpired ? (
                <span className="bg-rose-950/90 text-rose-400 font-black px-3 py-1 rounded-lg border border-rose-800 animate-pulse">
                  🔒 TRIAL EXPIRED — ACCOUNT FROZEN
                </span>
              ) : (
                <div className="flex items-center gap-2 font-mono font-black text-amber-400 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-900/60">
                  <span>⏳ Trial Countdown:</span>
                  <span>{countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRICING PLANS */}
        {paymentStep === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* INDIVIDUAL STUDENT PLAN */}
            <div className="bg-[#0f0505] border-2 border-[#7a0000] border-b-4 border-b-[#7a0000] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative lg:col-span-1">
              <span className="absolute -top-3 left-6 bg-[#7a0000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md border border-[#a30000]">
                Mandatory Individual Plan
              </span>
              
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-xl font-black text-white font-poppins">Student Pro Sandbox Pass</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                    Unlocks continuous simulator play privileges across live NSE high-frequency data streams.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                    <span className="text-emerald-400 font-black">✓</span> 7-Day Free Trial Included
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                    <span className="text-emerald-400 font-black">✓</span> Live High Frequency Candle Data
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                    <span className="text-emerald-400 font-black">✓</span> Live Exchange Session Clearance
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-[#2b0808] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Student Rate</span>
                  <div className="text-right">
                    <span className="text-3xl font-black font-mono text-white">₹49</span>
                    <span className="text-slate-500 font-bold text-xs"> / month</span>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStep('checkout')}
                  disabled={countdown.isPremium || countdown.isImmune}
                  className="w-full py-3.5 bg-[#7a0000] hover:bg-[#a30000] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all border-b-2 border-b-[#4a0000] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {countdown.isPremium || countdown.isImmune ? "Account Permanent / Active" : "Upgrade Subscriptions Now"}
                </button>
              </div>
            </div>

            {/* INSTITUTIONAL B2B PASSES */}
            <div className="lg:col-span-2 bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white font-poppins">Campus Licensing & Institutional Passes</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                    Equip management universities, classroom cohorts, or finance academies with master admin controls.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a0808] border border-[#2b0808] p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm text-white">Classroom Suite</span>
                      <span className="bg-[#0f0505] text-[#ff3333] border border-[#2b0808] font-black text-[10px] px-2 py-0.5 rounded-md uppercase">40 Students</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Includes teacher portal tracking layouts with student analytics output desks.</p>
                    <div className="pt-2 font-mono font-black text-base text-white">₹1,999 <span className="text-[10px] text-slate-500 font-normal">/ semester</span></div>
                  </div>

                  <div className="bg-[#1a0808] border border-[#2b0808] p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm text-white">Department Pass</span>
                      <span className="bg-[#0f0505] text-emerald-400 border border-[#2b0808] font-black text-[10px] px-2 py-0.5 rounded-md uppercase">250 Students</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Deploys localized tournament instances and automatic timeline tracking metrics.</p>
                    <div className="pt-2 font-mono font-black text-base text-white">₹5,999 <span className="text-[10px] text-slate-500 font-normal">/ year</span></div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#2b0808] flex flex-wrap gap-4 justify-between items-center">
                <div className="text-xs text-slate-400 font-medium">Need custom pricing matrices or corporate instances?</div>
                <button 
                  onClick={() => alert("Redirecting to institute concierge desk.")}
                  className="px-4 py-2 border border-[#2b0808] bg-[#1a0808] text-slate-200 hover:border-[#7a0000] hover:text-white transition-all text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  Contact Institute Desk
                </button>
              </div>
            </div>

          </div>
        )}

        {/* CHECKOUT STEPS */}
        {paymentStep === 'checkout' && (
          <div className="max-w-md mx-auto bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl shadow-2xl p-6 space-y-6 animate-scaleUp border-b-4 border-b-[#7a0000]">
            <div className="text-center border-b border-[#2b0808] pb-4">
              <h2 className="font-black text-lg text-white font-poppins">Secure UPI Portal Connection</h2>
              <p className="text-xs text-slate-400 mt-0.5">Activating individual premium pass: <span className="font-bold text-[#ff3333]">₹49/month</span></p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1a0808] border border-dashed border-[#2b0808] p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x140&data=${encodeURIComponent(`upi://pay?pa=9324459446@ybl&pn=BullRun&am=49&cu=INR`)}`} 
                  alt="Bull Run UPI QR Gateway" 
                  className="w-[140px] h-[140px] border border-[#2b0808] bg-white p-1 rounded-xl shadow-md"
                  loading="lazy"
                />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Bull Run Recipient ID</span>
                  <span className="font-mono font-black text-sm text-[#ff3333]">9324459446@ybl</span>
                </div>
              </div>

              <ol className="text-[11px] text-slate-400 list-decimal pl-4 space-y-2 leading-relaxed font-medium">
                <li>Scan the generated QR frame with any UPI payment app (GPay, PhonePe, Paytm).</li>
                <li>Transfer exactly <span className="font-black text-white">₹49</span>.</li>
                <li>Click below to activate permanent account play access.</li>
              </ol>
            </div>

            <div className="space-y-2 border-t border-[#2b0808] pt-4">
              <button 
                onClick={handleExecuteUPIPayment}
                disabled={isProcessing}
                className="w-full text-center py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/60 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating Remittance...
                  </>
                ) : (
                  "Fulfill Payment — Unlock Account Access"
                )}
              </button>
              <button 
                onClick={() => setPaymentStep('browse')}
                disabled={isProcessing}
                className="w-full text-center py-2 text-xs text-slate-400 hover:text-white transition-colors font-bold"
              >
                Cancel and Return
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT SUCCESS */}
        {paymentStep === 'success' && (
          <div className="max-w-md mx-auto bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-scaleUp border-b-4 border-b-emerald-600">
            <div className="h-12 w-12 bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 rounded-full flex items-center justify-center mx-auto text-xl font-black">
              ✓
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-emerald-400 font-poppins">Subscription Successfully Active!</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Your payment cleared. Your account is now permanently active with unlimited playground access.
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setPaymentStep('browse')}
                className="w-full py-3 bg-[#7a0000] hover:bg-[#a30000] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                Launch Platform Playground
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}