'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tab handling: 'world', 'school', 'class'
  const [rankingScope, setRankingScope] = useState('world');
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (prof) {
            setProfile(prof);
          }
        }
      } catch (err) {
        console.error("Leaderboard init fault:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionAndData();
  }, []);

  // Fetch rankings in real-time whenever the scope tab changes or profile loads
  useEffect(() => {
    fetchRankings();
  }, [rankingScope, profile]);

  const fetchRankings = async () => {
    // Basic catch if profiles are still loading
    let query = supabase.from('profiles').select('name, role, school_id, specific_class_id, wallet_balance');

    // Filter scopes based on user profile configurations
    if (rankingScope === 'school' && profile?.school_id) {
      query = query.eq('school_id', profile.school_id).eq('role', 'student');
    } else if (rankingScope === 'class' && profile?.specific_class_id) {
      query = query.eq('specific_class_id', profile.specific_class_id).eq('role', 'student');
    } else {
      // World ranking shows everyone (Personal and approved Students)
      query = query.or('role.eq.personal,student_approved.eq.true');
    }

    // Order directly by balance value in descending order
    const { data, error } = await query.order('wallet_balance', { ascending: false }).limit(50);
    
    if (!error && data) {
      setLeaderboardData(data);
    }
  };

  const isPersonalTrack = profile?.role === 'personal';

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased pb-20">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-inner">
            🏆 REAL-TIME ARENA MARGINS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">Global Trading Leaderboard</h1>
          <p className="text-slate-500 text-xs font-medium max-w-md mx-auto">
            Live standings tracking real-time portfolio allocations and system-wide sandbox capital performance.
          </p>
        </div>

        {/* Dynamic Leaderboard Tab Selectors */}
        <div className="flex justify-center">
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl inline-flex gap-1 shadow-sm">
            
            {/* World Ranking (Always Unlocked) */}
            <button
              onClick={() => setRankingScope('world')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                rankingScope === 'world' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🌐 World Ranking
            </button>

            {/* School Ranking (Grayed out if Personal Track) */}
            <button
              disabled={isPersonalTrack}
              onClick={() => setRankingScope('school')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                isPersonalTrack 
                  ? 'opacity-40 cursor-not-allowed text-slate-400' 
                  : rankingScope === 'school' 
                    ? 'bg-[#4F8EF7] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🏫 School Ranking
            </button>

            {/* Class Ranking (Grayed out if Personal Track) */}
            <button
              disabled={isPersonalTrack}
              onClick={() => setRankingScope('class')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                isPersonalTrack 
                  ? 'opacity-40 cursor-not-allowed text-slate-400' 
                  : rankingScope === 'class' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              📋 Class Ranking
            </button>

          </div>
        </div>

        {/* Leaderboard Ranking Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400 animate-pulse">Syncing Standings Data Matrix...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="p-4 w-20 text-center">Rank</th>
                    <th className="p-4">Trader Name</th>
                    <th className="p-4">Track Context</th>
                    <th className="p-4 text-right">Total Portfolio Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {leaderboardData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-slate-400 font-medium italic">
                        No active entries registered inside this tracking scope partition.
                      </td>
                    </tr>
                  ) : (
                    leaderboardData.map((trader, idx) => {
                      const isCurrentUser = user && trader.name === profile?.name;
                      return (
                        <tr key={idx} className={`transition-colors ${isCurrentUser ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50/40'}`}>
                          <td className="p-4 text-center font-black text-slate-950 font-mono text-sm">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </td>
                          <td className="p-4">
                            <p className={`font-black ${isCurrentUser ? 'text-blue-600' : 'text-slate-950'}`}>
                              {trader.name} {isCurrentUser && <span className="text-[9px] uppercase tracking-wide bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded ml-1 font-black">You</span>}
                            </p>
                            {trader.school_id && <p className="text-[9px] text-slate-400 font-mono mt-0.5 font-medium uppercase">Hub: {trader.school_id}</p>}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black ${
                              trader.role === 'personal' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {trader.role}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-black text-slate-950 text-sm">
                            ₹{(trader.wallet_balance || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}