import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import InteractiveCourseWrapper from './InteractiveCourseWrapper';

function getCourseData() {
  try {
    const filePath = path.join(process.cwd(), 'app', 'data', 'courses.txt');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading data from courses.txt:", error);
    return [];
  }
}

export default function Courses() {
  const initialTracks = getCourseData();

  return (
    <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative max-w-full overflow-x-hidden pt-24 pb-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Page Header Header Section */}
        <div className="space-y-2 mb-10 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 bg-[#1a0808] border border-[#2b0808] text-[#ff3333] text-[10px] uppercase tracking-widest font-black px-3.5 py-1 rounded-full shadow-inner mb-2">
            🎓 Bull Run Academy
          </span>
          <h1 className="font-poppins font-black text-3xl sm:text-4xl text-white tracking-tight">
            Interactive Learning Arena
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-medium">
            Select a target track card. Complete modules and submodules sequentially to unlock advanced trading systems.
          </p>
        </div>

        {/* Deliver data onto the presentation matrix layout */}
        <InteractiveCourseWrapper initialTracks={initialTracks} />
      </div>
    </main>
  );
}