'use client';

export default function Hero() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Text Column */}
      <div className="space-y-6">
        <h1 className="font-poppins font-extrabold text-[44px] md:text-[60px] leading-[1.1] text-slate-900">
          Learn the Stock Market Without Risking <span className="text-[#4F8EF7]">Real Money</span>
        </h1>
        <p className="text-slate-600 text-[18px] md:text-[20px] leading-relaxed max-w-xl">
          Practice investing, build virtual portfolios, compete with friends, and gain real financial skills through interactive stock market simulations.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <button className="font-poppins font-bold bg-[#34D399] hover:bg-[#2bc088] text-white px-8 py-4 rounded-2xl text-[20px] shadow-lg shadow-emerald-100 transition-all transform hover:-translate-y-0.5">
            Start Learning
          </button>
          <button className="font-poppins font-bold border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl text-[20px] transition-all transform hover:-translate-y-0.5">
            Try Demo
          </button>
        </div>
      </div>

      {/* Right Graphic Column */}
      <div className="relative bg-gradient-to-tr from-[#7DD3FC]/20 to-[#4F8EF7]/10 rounded-[32px] p-8 min-h-[400px] flex items-center justify-center border border-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400 font-medium">Virtual Portfolio Value</p>
              <h3 className="font-poppins font-extrabold text-3xl text-slate-800">₹1,24,500.00</h3>
            </div>
            <span className="bg-[#34D399]/10 text-[#34D399] font-bold px-3 py-1 rounded-xl text-sm">+24.5%</span>
          </div>
          {/* Simulated chart bars */}
          <div className="h-32 bg-slate-50 rounded-xl flex items-end p-2 gap-2">
            <div className="w-full bg-[#7DD3FC] rounded-t-md h-[40%]"></div>
            <div className="w-full bg-[#7DD3FC] rounded-t-md h-[55%]"></div>
            <div className="w-full bg-[#4F8EF7] rounded-t-md h-[45%]"></div>
            <div className="w-full bg-[#34D399] rounded-t-md h-[85%]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}