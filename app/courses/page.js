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
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-2 mb-10 text-center lg:text-left">
          <h1 className="font-poppins font-black text-4xl text-slate-900 tracking-tight">
            Interactive Learning Arena
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Select a target track card. Complete modules and submodules sequentially to unlock advanced systems.
          </p>
        </div>

        {/* Deliver data onto the complex presentation matrix layout */}
        <InteractiveCourseWrapper initialTracks={initialTracks} />
      </div>
    </main>
  );
}