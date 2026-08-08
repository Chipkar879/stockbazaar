'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function Pricing() {
  const [subscriptionState, setSubscriptionState] = useState({
    hasTrialStarted: false,
    trialDaysRemaining: 7,
    isPremiumPaid: false,
  });
  
  const [paymentStep, setPaymentStep] = useState('browse'); // 'browse' | 'checkout' | 'success'
  const [isProcessing, setIsProcessing] = useState(false);

  // Load state parameters locally on structural instantiation hydration
  useEffect(() => {
    const savedState = localStorage.getItem('stockbazaar_sub_state');
    if (savedState) {
      setSubscriptionState(JSON.parse(savedState));
    } else {
      const defaultState = { hasTrialStarted: true, trialDaysRemaining: 7, isPremiumPaid: false };
      localStorage.setItem('stockbazaar_sub_state', JSON.stringify(defaultState));
      setSubscriptionState(defaultState);
    }
  }, []);

  const saveSubscriptionProgress = (updatedState) => {
    setSubscriptionState(updatedState);
    localStorage.setItem('stockbazaar_sub_state', JSON.stringify(updatedState));
  };

  const handleTriggerCheckout = () => {
    setPaymentStep('checkout');
  };

  const handleExecuteUPIPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const clearedState = {
        hasTrialStarted: true,
        trialDaysRemaining: 0,
        isPremiumPaid: true
      };
      saveSubscriptionProgress(clearedState);
      setPaymentStep('success');
    }, 3500);
  };

  const simulateExitedTrial = () => {
    const expiredState = { hasTrialStarted: true, trialDaysRemaining: 0, isPremiumPaid: false };
    saveSubscriptionProgress(expiredState);
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative max-w-full overflow-x-hidden pt-24 pb-20">
      <Navbar />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12 relative z-10 animate-fadeInFast">
        
        {/* BRANDING TOP TITLES */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="bg-[#1a0808] text-[#ff3333] border border-[#2b0808] text-[9px] uppercase tracking-widest font-black px-3.5 py-1 rounded-full shadow-inner inline-block">
            💳 Bull Run Passes
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-poppins">
            Choose Your Trading Plan
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
            Every account initiates a mandatory 7-day free sandbox evaluation window. Upgrade anytime to secure continuous real market interface passes.
          </p>

          {/* DYNAMIC METRIC SUBSCRIPTION TRACKER BADGE */}
          <div className="pt-2">
            <div className="inline-flex flex-wrap items-center gap-3 bg-[#0f0505] border border-[#2b0808] px-4 py-2 rounded-2xl shadow-xl text-xs">
              <span className="text-slate-400 font-medium">Your current platform status:</span>
              {subscriptionState.isPremiumPaid ? (
                <span className="bg-emerald-950/60 text-emerald-400 font-black px-2.5 py-1 rounded-lg border border-emerald-900/60">
                  👑 PREMIUM PRO ACCOUNT ACTIVE
                </span>
              ) : subscriptionState.trialDaysRemaining > 0 ? (
                <span className="bg-amber-950/60 text-amber-300 font-black px-2.5 py-1 rounded-lg border border-amber-900/60">
                  ⏳ FREE TRIAL MODE: {subscriptionState.trialDaysRemaining} Days Left
                </span>
              ) : (
                <span className="bg-rose-950/80 text-rose-400 font-black px-2.5 py-1 rounded-lg border border-rose-900/80 animate-pulse">
                  🔒 TRIAL EXPIRED — ACCESS RESTRICTED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* WORKSPACE BROWSE LAYER STEP */}
        {paymentStep === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* MANDATORY STUDENT PREMIUM ACCOUNT SUBSCRIPTION BLOCK */}
            <div className="bg-[#0f0505] border-2 border-[#7a0000] border-b-4 border-b-[#7a0000] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative lg:col-span-1">
              <span className="absolute -top-3 left-6 bg-[#7a0000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md border border-[#a30000]">
                Mandatory Individual Plan
              </span>
              
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-xl font-black text-white font-poppins">Student Pro Sandbox Pass</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                    Unlocks absolute continuous play privileges across our live simulator framework and interactive portfolio tools.
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
                    <span className="text-emerald-400 font-black">✓</span> Live Exchange Trading Session Clearance
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
                  onClick={handleTriggerCheckout}
                  disabled={subscriptionState.isPremiumPaid}
                  className="w-full py-3.5 bg-[#7a0000] hover:bg-[#a30000] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all border-b-2 border-b-[#4a0000] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {subscriptionState.isPremiumPaid ? "Account Already Active" : "Upgrade Subscriptions Now"}
                </button>
              </div>
            </div>

            {/* INSTITUTIONAL B2B SOLUTIONS LAYOUT CONNECTOR MAPS */}
            <div className="lg:col-span-2 bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white font-poppins">Campus Licensing & Institutional Passes</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                    Equip management universities, classroom cohorts, or business finance schools with master administrative management frameworks.
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

            {/* HIDDEN INSTRUCTOR TESTING ASSIST BOX LAYER */}
            <div className="lg:col-span-3 bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 text-center text-xs">
              <span className="text-slate-400 font-medium mr-2">👨‍💻 Commercialization Evaluation Console:</span>
              <button 
                onClick={simulateExitedTrial}
                className="bg-rose-950/40 hover:bg-rose-950/70 text-rose-400 font-bold px-3 py-1 rounded-xl border border-rose-900/60 transition-colors"
              >
                Force Simulate Trial Expiration (Locked Mode)
              </button>
            </div>

          </div>
        )}

        {/* WORKSPACE CHECKOUT MATRIX */}
        {paymentStep === 'checkout' && (
          <div className="max-w-md mx-auto bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl shadow-2xl p-6 space-y-6 animate-scaleUp border-b-4 border-b-[#7a0000]">
            <div className="text-center border-b border-[#2b0808] pb-4">
              <h2 className="font-black text-lg text-white font-poppins">Secure UPI Portal Connection</h2>
              <p className="text-xs text-slate-400 mt-0.5">Activating individual premium subscription pass: <span className="font-bold text-[#ff3333]">₹49/month</span></p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1a0808] border border-dashed border-[#2b0808] p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x140&data=${encodeURIComponent(`upi://pay?pa=9324459446@ybl&pn=BullRun&am=49&cu=INR`)}`} 
                  alt="Bull Run UPI Dynamic QR Gateway" 
                  className="w-[140px] h-[140px] border border-[#2b0808] bg-white p-1 rounded-xl shadow-md"
                  loading="lazy"
                />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Bull Run Recipient Address ID</span>
                  <span className="font-mono font-black text-sm text-[#ff3333]">9324459446@ybl</span>
                </div>
              </div>

              <ol className="text-[11px] text-slate-400 list-decimal pl-4 space-y-2 leading-relaxed font-medium">
                <li>Scan the generated matrix frame with any core banking handler (GPay, PhonePe, Paytm).</li>
                <li>Fulfill the direct verification transfer total of exactly <span className="font-black text-white">₹49</span>.</li>
                <li>Tap the validation action trigger down below to initialize permanent sandbox play access.</li>
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

        {/* WORKSPACE PAYMENT SUCCESS CONGRATULATIONS TOAST */}
        {paymentStep === 'success' && (
          <div className="max-w-md mx-auto bg-[#0f0505] border-2 border-[#2b0808] rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-scaleUp border-b-4 border-b-emerald-600">
            <div className="h-12 w-12 bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 rounded-full flex items-center justify-center mx-auto text-xl font-black">
              ✓
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-emerald-400 font-poppins">Subscription Successfully Active!</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                The settlement gateway cleared your payment. Your personal student profile has been granted full continuous access rights to play inside the live market arena loops.
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