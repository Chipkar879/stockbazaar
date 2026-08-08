'use client';

import React, { useState } from 'react';

export default function InteractiveCourseWrapper({ initialTracks = [] }) {
  const [completedSubmodules, setCompletedSubmodules] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(initialTracks[0]?.id || null);
  const [activeModalSubmod, setActiveModalSubmod] = useState(null);

  // Interactive Quiz States inside the Modal
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Flatten out all submodules sequentially
  const allSubmodules = initialTracks.flatMap(track => 
    (track.modules || []).flatMap(mod => mod.submodules || [])
  );

  const activeTrack = initialTracks.find(t => t.id === selectedTrackId);

  const openSubmoduleModal = (submod) => {
    setActiveModalSubmod(submod);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (quizSubmitted) return; // Prevent changing after submission
    setUserAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleVerifyQuiz = () => {
    if (!activeModalSubmod?.quiz) return;
    
    let correctCount = 0;
    activeModalSubmod.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    setQuizSubmitted(true);
    // Mark passed if all questions are correct
    if (correctCount === activeModalSubmod.quiz.length) {
      setQuizPassed(true);
    } else {
      setQuizPassed(false);
    }
  };

  const handleCompleteSubmodule = (submodId) => {
    if (!completedSubmodules.includes(submodId)) {
      setCompletedSubmodules([...completedSubmodules, submodId]);
    }
    setActiveModalSubmod(null);
  };

  const isSubmoduleUnlocked = (submodId) => {
    const index = allSubmodules.findIndex(sm => sm.id === submodId);
    if (index === 0) return true; 
    return completedSubmodules.includes(allSubmodules[index - 1]?.id);
  };

  const isTrackUnlocked = (trackIdx) => {
    if (trackIdx === 0) return true;
    const prevTrack = initialTracks[trackIdx - 1];
    const prevTrackSubmods = (prevTrack?.modules || []).flatMap(m => m.submodules || []);
    if (prevTrackSubmods.length === 0) return true;
    return completedSubmodules.includes(prevTrackSubmods[prevTrackSubmods.length - 1]?.id);
  };

  return (
    <div className="space-y-10 relative">
      
      {/* 1. TRACK SELECTOR CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialTracks.map((track, idx) => {
          const unlocked = isTrackUnlocked(idx);
          const isSelected = selectedTrackId === track.id;

          return (
            <div
              key={track.id}
              onClick={() => unlocked && setSelectedTrackId(track.id)}
              className={`p-6 rounded-2xl border transition-all duration-300 select-none text-left ${
                unlocked 
                  ? isSelected
                    ? 'bg-gradient-to-br from-[#7a0000] to-[#4a0000] border-[#a30000] text-white shadow-xl scale-[1.02]'
                    : 'bg-[#0f0505] border-[#2b0808] text-slate-200 shadow-sm hover:border-[#7a0000] hover:bg-[#1a0808] cursor-pointer'
                  : 'bg-[#0f0505]/40 border-[#2b0808] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`font-poppins font-black text-3xl ${isSelected ? 'text-rose-200' : 'text-[#ff3333]'}`}>
                  {track.trackNumber || idx + 1}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isSelected 
                    ? 'bg-[#1a0808] border border-[#a30000] text-white' 
                    : 'bg-[#1a0808] border border-[#2b0808] text-slate-400'
                }`}>
                  {track.level}
                </span>
              </div>
              <h2 className="font-poppins font-extrabold text-xl tracking-tight text-white">{track.title}</h2>
              <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isSelected ? 'text-rose-100/90' : 'text-slate-400'}`}>
                {track.description}
              </p>
              {!unlocked && (
                <div className="mt-4 text-[10px] font-black tracking-wider text-rose-400 flex items-center gap-1">
                  🔒 LOCKED UNTIL PRIOR TRACK CLEARED
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 2. MODULES & SUBMODULES GRID */}
      {activeTrack && (
        <section className="bg-[#0f0505] p-6 sm:p-8 rounded-3xl border border-[#2b0808] shadow-2xl space-y-8 animate-fadeInFast">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff3333] bg-[#1a0808] border border-[#2b0808] px-3 py-1 rounded-md">
              Active Focus Arena
            </span>
            <h2 className="font-poppins font-black text-2xl text-white mt-3">{activeTrack.title} Layout</h2>
          </div>

          <div className="space-y-8">
            {(activeTrack.modules || []).map((mod, mIdx) => (
              <div key={mod.id} className="space-y-4">
                <h3 className="font-poppins font-bold text-base sm:text-lg text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff3333]"></span>
                  Module {mIdx + 1}: {mod.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(mod.submodules || []).map((submod) => {
                    const submodUnlocked = isSubmoduleUnlocked(submod.id);
                    const completed = completedSubmodules.includes(submod.id);

                    return (
                      <div
                        key={submod.id}
                        onClick={() => submodUnlocked && openSubmoduleModal(submod)}
                        className={`p-5 rounded-xl border text-left transition-all ${
                          submodUnlocked
                            ? completed
                              ? 'bg-emerald-950/30 border-emerald-900/50 cursor-pointer hover:bg-emerald-950/50'
                              : 'bg-[#1a0808] border-[#2b0808] shadow-sm hover:border-[#7a0000] cursor-pointer'
                            : 'bg-[#0f0505] border-[#2b0808]/50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className={`font-bold text-sm tracking-tight ${submodUnlocked ? 'text-white' : 'text-slate-500'}`}>
                            {submod.title}
                          </h4>
                          {completed ? (
                            <span className="text-emerald-400 text-sm font-bold">✓</span>
                          ) : !submodUnlocked ? (
                            <span className="text-slate-500 text-xs">🔒</span>
                          ) : null}
                        </div>
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium">{submod.intro}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. PROGRESS DASHBOARD */}
      <footer className="bg-[#0f0505] border border-[#2b0808] text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-center md:text-left space-y-1">
          <h3 className="font-poppins font-bold text-base text-white">Overall Laboratory Standing</h3>
          <p className="text-slate-400 text-xs font-medium">Finish all milestones to secure complete profile validation rewards.</p>
        </div>
        <div className="w-full md:w-2/3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Progress Metric</span>
            <span className="text-[#ff3333] font-mono">{completedSubmodules.length} / {allSubmodules.length} Active Nodes Cleared</span>
          </div>
          <div className="w-full bg-[#1a0808] h-3 rounded-full overflow-hidden border border-[#2b0808]">
            <div 
              className="bg-gradient-to-r from-[#7a0000] via-[#dc2626] to-emerald-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${allSubmodules.length ? (completedSubmodules.length / allSubmodules.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </footer>

      {/* 4. INTERACTIVE MODAL WITH EMBEDDED MCQ QUIZ */}
      {activeModalSubmod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80 transition-all duration-300 animate-fadeInFast">
          <div className="bg-[#0f0505] border border-[#2b0808] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2b0808] flex items-center justify-between bg-[#1a0808]">
              <h3 className="font-poppins font-black text-xl text-white tracking-tight">
                {activeModalSubmod.title}
              </h3>
              <button 
                onClick={() => setActiveModalSubmod(null)}
                className="w-8 h-8 rounded-full bg-[#0f0505] border border-[#2b0808] text-slate-400 font-bold flex items-center justify-center hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
              
              {/* Concept Intro */}
              <div className="p-4 bg-[#1a0808] border border-[#2b0808] rounded-xl">
                <p className="text-[#ff3333] text-xs font-bold leading-relaxed">
                  💡 {activeModalSubmod.intro}
                </p>
              </div>

              {/* Lesson Reading Content */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Core Briefing</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {activeModalSubmod.content}
                </p>
              </div>

              {/* Video Embed Frame */}
              {activeModalSubmod.videoUrl && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Video Demonstration</h4>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#2b0808] shadow-sm">
                    <iframe 
                      className="absolute inset-0 w-full h-full"
                      src={activeModalSubmod.videoUrl}
                      title={activeModalSubmod.title}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* EMBEDDED MCQ INTERACTIVE QUIZ SECTION */}
              {activeModalSubmod.quiz && activeModalSubmod.quiz.length > 0 && (
                <div className="pt-4 border-t border-[#2b0808] space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#ff3333]">
                      🎯 Knowledge Check ({activeModalSubmod.quiz.length} Question{activeModalSubmod.quiz.length > 1 ? 's' : ''})
                    </h4>
                    {quizSubmitted && (
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${quizPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-rose-950 text-rose-400 border border-rose-900'}`}>
                        {quizPassed ? 'PASSED ✓' : 'TRY AGAIN ❌'}
                      </span>
                    )}
                  </div>

                  {activeModalSubmod.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="bg-[#1a0808] p-4 rounded-xl border border-[#2b0808] space-y-3">
                      <p className="text-xs font-bold text-white">{qIdx + 1}. {q.question}</p>
                      
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === oIdx;
                          const isCorrect = q.correctIndex === oIdx;
                          
                          let btnStyle = "bg-[#0f0505] border-[#2b0808] text-slate-300 hover:border-[#7a0000]";
                          if (quizSubmitted) {
                            if (isCorrect) btnStyle = "bg-emerald-950/60 border-emerald-700 text-emerald-300 font-bold";
                            else if (isSelected && !isCorrect) btnStyle = "bg-rose-950/60 border-rose-700 text-rose-300 font-bold";
                          } else if (isSelected) {
                            btnStyle = "bg-[#7a0000]/40 border-[#ff3333] text-white font-bold";
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(qIdx, oIdx)}
                              className={`w-full p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <span className="text-emerald-400 font-black text-xs">✓</span>}
                              {quizSubmitted && isSelected && !isCorrect && <span className="text-rose-400 font-black text-xs">✕</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Feedback */}
                      {quizSubmitted && (
                        <div className="p-3 bg-[#0f0505] border border-[#2b0808] rounded-lg text-[11px] text-slate-400 leading-relaxed font-medium">
                          <span className="font-black text-slate-200">Explanation: </span>{q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      onClick={handleVerifyQuiz}
                      disabled={Object.keys(userAnswers).length < activeModalSubmod.quiz.length}
                      className="w-full py-3 bg-[#7a0000] hover:bg-[#a30000] disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      Submit Quiz Answers
                    </button>
                  ) : !quizPassed && (
                    <button
                      onClick={() => { setQuizSubmitted(false); setUserAnswers({}); }}
                      className="w-full py-3 bg-[#1a0808] border border-[#2b0808] hover:bg-[#2b0808] text-slate-200 text-xs font-bold rounded-xl transition-all"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#2b0808] bg-[#1a0808] flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveModalSubmod(null)}
                className="px-4 py-2 border border-[#2b0808] bg-[#0f0505] rounded-xl text-xs font-bold text-slate-300 hover:bg-[#1a0808] transition"
              >
                Close
              </button>

              <button
                onClick={() => handleCompleteSubmodule(activeModalSubmod.id)}
                disabled={activeModalSubmod.quiz && activeModalSubmod.quiz.length > 0 && !quizPassed}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
              >
                {completedSubmodules.includes(activeModalSubmod.id) ? 'Marked Complete ✓' : 'Pass Quiz & Mark Complete'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}