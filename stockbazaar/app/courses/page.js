import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import CourseAccordion from '@/components/CourseAccordion';

// Server-side function to read the text document dynamically
function getCourseData() {
  try {
    // This tells Node to look inside the app/data folder directly
    const filePath = path.join(process.cwd(), 'app', 'data', 'courses.txt');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading courses.txt:", error);
    return [];
  }
}

export default function Courses() {
  const initialModules = getCourseData();

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Modules Area */}
        <section className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="font-poppins font-extrabold text-3xl text-slate-900 tracking-tight">
              Interactive Learning Arena
            </h1>
            <p className="text-slate-600 text-base">
              Expand each course module below to study texts, watch lessons, and execute hands-on tasks.
            </p>
          </div>

          {/* Client-side Accordion Component to handle dropdown interactions */}
          <CourseAccordion modules={initialModules} />
        </section>

        {/* Right Sidebar Placeholder for continuous alignment */}
        <aside className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
          <h2 className="font-poppins font-bold text-lg text-slate-800">Learning Status</h2>
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-slate-600">
            💡 <strong>Pro-Tip:</strong> Complete all activities highlighted inside modules to unlock exclusive community profile badges!
          </div>
        </aside>

      </div>
    </main>
  );
}