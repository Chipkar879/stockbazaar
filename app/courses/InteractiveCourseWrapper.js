'use client';

import React, { useState } from 'react';

export default function InteractiveCourseWrapper({ initialTracks }) {
  const [completedSubmodules, setCompletedSubmodules] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(initialTracks[0]?.id || null);
  const [activeModalSubmod, setActiveModalSubmod] = useState(null);

  // Flatten out all submodules sequentially across the entire application architecture 
  const allSubmodules = initialTracks.flatMap(track => 
    (track.modules || []).flatMap(mod => mod.submodules || [])
  );

  const activeTrack = initialTracks.find(t => t.id === selectedTrackId);

  const toggleSubmoduleComplete = (submodId) => {
    if (!completedSubmodules.includes(submodId)) {
      setCompletedSubmodules([...completedSubmodules, submodId]);
    }
    setActiveModalSubmod(null); // Dismiss screen overlay modal frame
  };

  const isSubmoduleUnlocked = (submodId) => {
    const index = allSubmodules.findIndex(sm => sm.id === submodId);
    if (index === 0) return true; // Ultimate entry point is always active
    
    // Check if the previous submodule is marked as concluded
    return completedSubmodules.includes(allSubmodules[index - 1]?.id);
  };

  const isTrackUnlocked = (trackIdx) => {
    if (trackIdx === 0) return true;
    
    // Previous track's absolute final submodule must be fully cleared
    const prevTrack = initialTracks[trackIdx - 1];
    const prevTrackSubmods = (prevTrack?.modules || []).flatMap(m => m.submodules || []);
    if (prevTrackSubmods.length === 0) return true;
    
    return completedSubmodules.includes(prevTrackSubmods[prevTrackSubmods.length - 1]?.id);
  };

  return (
    <div className="space-y-10 relative">
      
      {/* 1. TOP SECTION: 3 CARDS SIDE BY SIDE */}
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
                    ? 'bg-blue-600 border-transparent text-white shadow-xl scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:shadow-md cursor-pointer'
                  : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`font-poppins font-black text-3xl ${isSelected ? 'text-blue-200' : 'text-blue-600'}`}>
                  {track.trackNumber || idx + 1}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isSelected 
                    ? 'bg-blue-500/40 border border-blue-400 text-white' 
                    : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}>
                  {track.level}
                </span>
              </div>
              <h2 className="font-poppins font-extrabold text-xl tracking-tight">{track.title}</h2>
              <p className={`text-sm mt-2 leading-relaxed ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                {track.description}
              </p>
              {!unlocked && <div className="mt-4 text-xs font-bold tracking-wide text-slate-400">🔒 LOCKED UNTIL PRIOR TRACK CLEARED</div>}
            </div>
          );
        })}
      </section>

      {/* 2. MIDDLE SECTION: DYNAMIC GRID OF MODULES & SUBMODULE CARDS */}
      {activeTrack && (
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-fadeIn">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
              Active Focus Arena
            </span>
            <h2 className="font-poppins font-black text-2xl text-slate-900 mt-2">{activeTrack.title} Layout</h2>
          </div>

          <div className="space-y-8">
            {(activeTrack.modules || []).map((mod, mIdx) => (
              <div key={mod.id} className="space-y-4">
                <h3 className="font-poppins font-bold text-lg text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Module {mIdx + 1}: {mod.title}
                </h3>

                {/* Submodule Cards Frame Grid Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(mod.submodules || []).map((submod) => {
                    const submodUnlocked = isSubmoduleUnlocked(submod.id);
                    const completed = completedSubmodules.includes(submod.id);

                    return (
                      <div
                        key={submod.id}
                        onClick={() => submodUnlocked && setActiveModalSubmod(submod)}
                        className={`p-5 rounded-xl border text-left transition-all ${
                          submodUnlocked
                            ? completed
                              ? 'bg-emerald-50/50 border-emerald-200 cursor-pointer hover:bg-emerald-50'
                              : 'bg-white border-slate-200 shadow-sm hover:border-blue-400 hover:shadow cursor-pointer'
                            : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className={`font-bold text-sm tracking-tight ${submodUnlocked ? 'text-slate-900' : 'text-slate-400'}`}>
                            {submod.title}
                          </h4>
                          {completed ? (
                            <span className="text-emerald-600 text-sm font-bold">✓</span>
                          ) : !submodUnlocked ? (
                            <span className="text-slate-400 text-xs">🔒</span>
                          ) : null}
                        </div>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{submod.intro}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. BOTTOM SECTION: OVERALL PROGRESSION STATS DASHBOARD CARD */}
      <footer className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="text-center md:text-left space-y-1">
          <h3 className="font-poppins font-bold text-lg">Overall Laboratory Standing</h3>
          <p className="text-slate-400 text-xs">Finish all milestones to secure complete profile validation rewards.</p>
        </div>
        <div className="w-full md:w-2/3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Progress Metric</span>
            <span>{completedSubmodules.length} / {allSubmodules.length} Active Nodes Cleared</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${allSubmodules.length ? (completedSubmodules.length / allSubmodules.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </footer>

      {/* 4. FLOATING SCREEN DIALOG LIGHTBOX CONTAINER WITH BACKGROUND BLUR */}
      {activeModalSubmod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-poppins font-black text-xl text-slate-900 tracking-tight">
                {activeModalSubmod.title}
              </h3>
              <button 
                onClick={() => setActiveModalSubmod(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 font-bold flex items-center justify-center hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Canvas */}
            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-blue-900 text-sm font-medium leading-relaxed">
                  {activeModalSubmod.intro}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Concept Overview</h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {activeModalSubmod.content}
                </p>
              </div>

              {/* Conditional Video Engine Rendering Frame */}
              {activeModalSubmod.videoUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multimedia Briefing</h4>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                    <iframe 
                      className="absolute inset-0 w-full h-full"
                      src={activeModalSubmod.videoUrl}
                      title={activeModalSubmod.title}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setActiveModalSubmod(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white transition"
              >
                Close View
              </button>
              <button
                onClick={() => toggleSubmoduleComplete(activeModalSubmod.id)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
              >
                Complete Module & Next
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}