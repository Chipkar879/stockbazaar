import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import InteractiveCourseWrapper from './InteractiveCourseWrapper';

// Server-side block to parse your text document safely
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
  // Read our dynamic array setup 
  const initialTracks = getCourseData();

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Core Header Section */}
        <div className="space-y-2 mb-8">
          <h1 className="font-poppins font-extrabold text-3xl text-slate-900 tracking-tight">
            Interactive Learning Arena
          </h1>
          <p className="text-slate-600 text-base">
            Complete each financial block progressively. Fulfill all tasks within a module to unlock the subsequent tier.
          </p>
        </div>

        {/* Hand off data to the auto-calculating progression component */}
        <InteractiveCourseWrapper initialTracks={initialTracks} />
      </div>
    </main>
  );
}