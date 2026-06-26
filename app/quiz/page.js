'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function DailyQuiz() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Game states
  const [quizActive, setQuizActive] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  // Power-ups state tracking
  const [powerUps, setPowerUps] = useState({ fiftyFifty: 1, freezeTime: 1, skipQuestion: 1 });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [isTimerFrozen, setIsTimerFrozen] = useState(false);

  // Timer metrics (5 Minutes Total = 300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const timerRef = useRef(null);

  // Leaderboard toggle context
  const [showQuizLeaderboard, setShowQuizLeaderboard] = useState(false);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(prof);
        fetchQuizLeaderboard();
      }
      setLoading(false);
    };
    fetchUserSession();
  }, []);

  // Countdown clock engine
  useEffect(() => {
    if (quizActive && !quizCompleted) {
      timerRef.current = setInterval(() => {
        if (!isTimerFrozen) {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleQuizEnd(true);
              return 0;
            }
            setTotalTimeSpent((t) => t + 1);
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizActive, quizCompleted, isTimerFrozen]);

  const fetchQuizLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name, quiz_points, role')
      .order('quiz_points', { ascending: false })
      .limit(10);
    setQuizLeaderboard(data || []);
  };

  // DYNAMIC STREAM: Fetches from your Next.js AI pipeline route
  const startDailyQuizStream = async () => {
    if (!user) return alert("Please login to attempt the Daily Quiz Arena!");
    
    setLoading(true);
    
    try {
      // Connect straight to your serverless Gemini AI engine endpoint
      const res = await fetch('/api/generate-quiz');
      const aiGeneratedPool = await res.json();

      if (aiGeneratedPool && aiGeneratedPool.length === 15) {
        setQuestions(aiGeneratedPool);
      } else {
        setQuestions(generateSampleQuestionPool());
      }
    } catch (err) {
      console.error("AI quiz pipeline connection issue:", err);
      setQuestions(generateSampleQuestionPool());
    }

    // Reset layout game configurations
    setTimeLeft(300);
    setTotalTimeSpent(0);
    setScore(0);
    setCurrentIdx(0);
    setPointsEarned(0);
    setHiddenOptions([]);
    setIsTimerFrozen(false);
    setPowerUps({ fiftyFifty: 1, freezeTime: 1, skipQuestion: 1 });
    setQuizActive(true);
    setQuizCompleted(false);
    setLoading(false);
  };

  const handleAnswerSelection = (choice) => {
    if (selectedAnswer !== null) return; 
    setSelectedAnswer(choice);
    
    const currentQuestion = questions[currentIdx];
    const isCorrect = choice === currentQuestion.correct_option;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedAnswer(null);
        setHiddenOptions([]);
        setIsTimerFrozen(false);
      } else {
        handleQuizEnd(false);
      }
    }, 1500);
  };

  // POWER-UPS PIPELINE
  const useFiftyFifty = () => {
    if (powerUps.fiftyFifty <= 0 || selectedAnswer !== null) return;
    const currentQuestion = questions[currentIdx];
    const wrongOptions = ['A', 'B', 'C', 'D'].filter(opt => opt !== currentQuestion.correct_option);
    const toHide = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
    setPowerUps(prev => ({ ...prev, fiftyFifty: 0 }));
  };

  const useTimeFreeze = () => {
    if (powerUps.freezeTime <= 0 || selectedAnswer !== null) return;
    setIsTimerFrozen(true);
    setPowerUps(prev => ({ ...prev, freezeTime: 0 }));
  };

  const useSkipQuestion = () => {
    if (powerUps.skipQuestion <= 0 || selectedAnswer !== null) return;
    setPowerUps(prev => ({ ...prev, skipQuestion: 0 }));
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setHiddenOptions([]);
      setIsTimerFrozen(false);
    } else {
      handleQuizEnd(false);
    }
  };

  const handleQuizEnd = async (timeout = false) => {
    clearInterval(timerRef.current);
    setQuizCompleted(true);
    setQuizActive(false);

    const calculatedPoints = score * 100;
    setPointsEarned(calculatedPoints);

    if (user && calculatedPoints > 0) {
      const currentPoints = profile?.quiz_points || 0;
      await supabase.from('profiles').update({ quiz_points: currentPoints + calculatedPoints }).eq('id', user.id);
    }
    fetchQuizLeaderboard();
  };

  const shareAchievement = () => {
    const text = `🎯 I just scored ${score}/15 correct answers and earned ${pointsEarned} Bazaar Bucks ($BB$) on the Stockbazaar Daily Quiz Arena! Can you beat my financial strategy rank? 🚀`;
    navigator.clipboard.writeText(text);
    alert("Achievement clipboard text copied! Share it with your friends or school channels right away. 🙌");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const generateSampleQuestionPool = () => {
    return [...Array(15)].map((_, i) => ({
      id: 9990 + i,
      question_text: `Sample Quiz Question #${i + 1}: Which financial metric maps price movements against structural trends?`,
      option_a: 'Primary Market Yields',
      option_b: 'Moving Average Indicators',
      option_c: 'Liquidity Leverage Ratios',
      option_d: 'Stochastic Order Flow Volumes',
      correct_option: 'B'
    }));
  };

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased pb-20 relative">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-12 space-y-8 relative z-10">
        
        {!quizActive && !quizCompleted && (
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-[#4F8EF7] text-[11px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full shadow-inner animate-pulse">
              🧠 Financial Intelligence Battleground
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-none">Daily AI MCQ Arena</h1>
            <p className="text-slate-500 text-xs font-medium">
              Attempt 15 dynamic randomized stock and macro economy questions generated fresh on the fly by Gemini. Compete for ultimate platform rank honors under 5 minutes.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <button onClick={startDailyQuizStream} className="px-8 py-4 bg-[#4F8EF7] hover:bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all transform hover:-translate-y-0.5">
                Launch Today's Quiz (5m) ⏱️
              </button>
              <button onClick={() => setShowQuizLeaderboard(!showQuizLeaderboard)} className="px-6 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-slate-50 transition-all">
                {showQuizLeaderboard ? 'Hide Standings' : 'Check Quiz Rank 🏆'}
              </button>
            </div>
          </div>
        )}

        {quizCompleted && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto text-center shadow-lg space-y-6">
            <div className="text-6xl">🎯</div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-950">Arena Run Complete!</h2>
              <p className="text-xs text-slate-400 font-medium">Your financial pipeline metrics are secured.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400">Accuracy</p>
                <p className="text-xl font-black text-slate-950 font-mono">{score} / 15</p>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-black uppercase text-emerald-600">Earned Payout</p>
                <p className="text-xl font-black text-emerald-500 font-mono">+{pointsEarned} BB</p>
              </div>
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 col-span-2 text-center">
                <p className="text-[10px] font-black uppercase text-purple-600">Total Run Time Invested</p>
                <p className="text-lg font-black text-purple-700 font-mono">{formatTime(totalTimeSpent)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button onClick={shareAchievement} className="w-full py-3 bg-slate-950 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm">
                Share Achievement Context 🚀
              </button>
              <button onClick={() => { setQuizCompleted(false); setShowQuizLeaderboard(true); }} className="w-full py-3 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100 border border-slate-200 transition-all">
                Check Quiz Standing Map
              </button>
            </div>
          </div>
        )}

        {quizActive && questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
              <div className="font-bold text-xs">
                Question <span className="font-mono font-black text-slate-950 text-sm">{currentIdx + 1}</span> / 15
              </div>
              
              <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-black tracking-wider flex items-center gap-1.5 border transition-all ${
                timeLeft <= 60 ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-slate-900 text-white border-slate-900'
              }`}>
                ⏰ {formatTime(timeLeft)} {isTimerFrozen && <span className="text-[9px] bg-sky-500 text-white px-1 py-0.5 rounded ml-1 animate-bounce">FROZEN</span>}
              </div>
            </div>

            <div className="bg-slate-900/5 border border-slate-200/60 p-3 rounded-2xl flex justify-center items-center gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tactical Add-ons:</span>
              <button disabled={powerUps.fiftyFifty <= 0 || selectedAnswer !== null} onClick={useFiftyFifty} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${powerUps.fiftyFifty > 0 ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-slate-200/50 text-slate-400 border-transparent cursor-not-allowed'}`}>
                🌓 50:50 ({powerUps.fiftyFifty})
              </button>
              <button disabled={powerUps.freezeTime <= 0 || selectedAnswer !== null || isTimerFrozen} onClick={useTimeFreeze} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${powerUps.freezeTime > 0 ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-slate-200/50 text-slate-400 border-transparent cursor-not-allowed'}`}>
                ❄️ Time Freeze ({powerUps.freezeTime})
              </button>
              <button disabled={powerUps.skipQuestion <= 0 || selectedAnswer !== null} onClick={useSkipQuestion} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${powerUps.skipQuestion > 0 ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-slate-200/50 text-slate-400 border-transparent cursor-not-allowed'}`}>
                ⏩ Skip Field ({powerUps.skipQuestion})
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-base sm:text-lg font-black text-slate-950 leading-relaxed">
                {questions[currentIdx]?.question_text}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {['A', 'B', 'C', 'D'].map((optionLetter) => {
                  const choiceString = questions[currentIdx][`option_${optionLetter.toLowerCase()}`];
                  const isHidden = hiddenOptions.includes(optionLetter);
                  const isSelected = selectedAnswer === optionLetter;
                  const isCorrectAnswer = optionLetter === questions[currentIdx].correct_option;
                  
                  if (isHidden) return <div key={optionLetter} className="hidden sm:block opacity-0 pointer-events-none" />;

                  return (
                    <button
                      key={optionLetter}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswerSelection(optionLetter)}
                      className={`p-4 text-left rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                        selectedAnswer === null 
                          ? 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300' 
                          : isSelected 
                            ? isCorrectAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                            : isCorrectAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50/40 border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-6 w-6 rounded-lg text-[10px] font-black flex items-center justify-center border ${
                          isSelected ? 'bg-white text-slate-950' : 'bg-white text-slate-400'
                        }`}>{optionLetter}</span>
                        <span>{choiceString}</span>
                      </div>
                      {selectedAnswer !== null && isCorrectAnswer && <span>✨</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {showQuizLeaderboard && !quizActive && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md space-y-4 p-6 animate-fadeInFast">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-950">Bazaar Bucks ($BB$) Standings</h3>
                <p className="text-[10px] text-slate-400 font-medium">Top quiz masters ranked by cumulative correct payouts.</p>
              </div>
              <button onClick={() => setShowQuizLeaderboard(false)} className="text-xs font-bold text-rose-500 hover:underline">Close Table</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-3 text-center w-14">Rank</th>
                    <th className="p-3">Trader</th>
                    <th className="p-3">Track</th>
                    <th className="p-3 text-right">Quiz Payout Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
                  {quizLeaderboard.map((trader, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-center font-mono font-black text-slate-950">{idx + 1}</td>
                      <td className="p-3 text-slate-950 font-black">{trader.name}</td>
                      <td className="p-3 text-[10px] font-mono text-slate-400 uppercase">{trader.role}</td>
                      <td className="p-3 text-right font-mono font-black text-blue-500">{trader.quiz_points || 0} BB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}