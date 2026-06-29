'use client';

import React, { useState } from 'react';

export default function InteractiveCourseWrapper({ initialTracks }) {
  const [completedModules, setCompletedModules] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);

  // Creates a flat sequential map of all modules to calculate progression locks smoothly
  const allModules = initialTracks.flatMap(t => t.modules || []);

  const toggleModuleCompletion = (moduleId) => {
    if (completedModules.includes(moduleId)) {
      setCompletedModules(completedModules.filter(id => id !== moduleId));
    } else {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  const isModuleUnlocked = (moduleId) => {
    const currentIndex = allModules.findIndex(m => m.id === moduleId);
    if (currentIndex === 0) return true; // First element is always available to start
    
    const previousModule = allModules[currentIndex - 1];
    return completedModules.includes(previousModule.id);
  };

  const isTrackUnlocked = (trackIndex) => {
    if (trackIndex === 0) return true; // Track 1 is always accessible
    
    // Check if the absolute last module of the preceding track is completed
    const previousTrack = initialTracks[trackIndex - 1];
    if (!previousTrack || !previousTrack.modules || previousTrack.modules.length === 0) return true;
    
    const lastModuleOfPreviousTrack = previousTrack.modules[previousTrack.modules.length - 1];
    return completedModules.includes(lastModuleOfPreviousTrack.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Dynamic Accordion Section */}
      <section className="lg:col-span-2 space-y-6">
        {initialTracks.map((track, trackIdx) => {
          const unlocked = isTrackUnlocked(trackIdx);
          const isActive = activeTrack === track.id;

          return (
            <div 
              key={track.id} 
              className={`bg-white rounded-2xl border transition shadow-sm ${
                unlocked ? 'border-slate-200' : 'border-slate-100 opacity-50'
              }`}
            >
              {/* Main Card Header */}
              <div 
                onClick={() => unlocked && setActiveTrack(isActive ? null : track.id)}
                className={`p-6 flex items-start justify-between gap-4 cursor-pointer select-none ${
                  unlocked ? 'hover:bg-slate-50/50' : 'cursor-not-allowed'
                }`}
              >
                <div className="flex gap-4 items-start">
                  <span className="font-poppins font-black text-3xl text-blue-600 tracking-tight">
                    {track.trackNumber || trackIdx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-poppins font-extrabold text-xl text-slate-900">{track.title}</h2>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        track.level === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        track.level === 'Intermediate' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {track.level || 'Standard'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mt-2 font-normal leading-relaxed">{track.description}</p>
                    <span className="text-xs text-slate-400 font-medium block mt-3">
                      {(track.modules || []).length} Modules Available
                    </span>
                  </div>
                </div>
                
                <div>
                  {!unlocked ? (
                    <span className="text-xl">🔒</span>
                  ) : (
                    <span className="text-slate-400 font-bold text-lg">{isActive ? '▲' : '▼'}</span>
                  )}
                </div>
              </div>

              {/* Inner Dropdown Modules */}
              {isActive && unlocked && (
                <div className="border-t border-slate-100 p-6 bg-slate-50/30 space-y-4">
                  {(track.modules || []).map((mod) => {
                    const modUnlocked = isModuleUnlocked(mod.id);
                    const isDone = completedModules.includes(mod.id);

                    return (
                      <div 
                        key={mod.id} 
                        className={`p-4 rounded-xl border transition ${
                          modUnlocked 
                            ? isDone 
                              ? 'bg-emerald-50/40 border-emerald-200' 
                              : 'bg-white border-slate-200 shadow-sm'
                            : 'bg-slate-100/60 border-slate-200 opacity-60 select-none'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {isDone ? '✓' : '•'}
                            </span>
                            <h3 className={`font-bold text-sm ${modUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                              {mod.title}
                            </h3>
                          </div>

                          {modUnlocked ? (
                            <button
                              onClick={() => toggleModuleCompletion(mod.id)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${
                                isDone 
                                  ? 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                  : 'bg-blue-600 border-transparent text-white hover:bg-blue-700'
                              }`}
                            >
                              {isDone ? 'Mark Incomplete' : 'Complete'}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">🔒 Locked</span>
                          )}
                        </div>

                        {/* Renders submodules if they exist inside the array */}
                        {modUnlocked && mod.submodules && mod.submodules.length > 0 && (
                          <div className="mt-3 ml-9 pl-3 border-l-2 border-slate-200 space-y-1.5">
                            {mod.submodules.map((sub, sIdx) => (
                              <div key={sIdx} className="text-xs text-slate-600 flex items-center gap-2">
                                <span className="text-slate-400">▹</span> {sub}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Progress Monitor Sidebar */}
      <aside className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
        <h2 className="font-poppins font-bold text-lg text-slate-800">Learning Status</h2>
        
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-2.5 transition-all duration-300" 
              style={{ width: `${allModules.length ? (completedModules.length / allModules.length) * 100 : 0}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 font-medium text-right">
            {completedModules.length} of {allModules.length} Modules Concluded
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-slate-600">
          💡 <strong>Pro-Tip:</strong> Complete modules in sequence to unlock more advanced tracks.
        </div>
      </aside>

    </div>
  );
}