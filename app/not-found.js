import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        
        {/* Visual Graphic Element */}
        <div className="space-y-2">
          <span className="text-6xl block animate-bounce">📉</span>
          <h1 className="font-poppins font-black text-6xl text-slate-900 tracking-tight">404</h1>
          <h2 className="font-poppins font-bold text-xl text-slate-800">Market Delta Invalid</h2>
        </div>

        {/* Message */}
        <p className="text-slate-600 text-sm leading-relaxed">
          Whoops! It looks like you tried to navigate to a page that doesn't exist in Stockbazaar's records. Let's get your portfolio back on track.
        </p>

        <hr className="border-slate-100" />

        {/* Dynamic Resource Redirect Links */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Safe Target Portals
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Link 
              href="/" 
              className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-100 transition block"
            >
              🏠 Return to Home Base
            </Link>
            
            <Link 
              href="/simulator" 
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition block"
            >
              📈 Launch Paper Trading Simulator
            </Link>

            <Link 
              href="/courses" 
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition block"
            >
              📚 Open Learning Modules
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}