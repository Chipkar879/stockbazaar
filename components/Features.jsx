export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-white border rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg text-slate-800">📈 Live Tracking</h3>
        <p className="text-slate-600 text-sm mt-2">Simulate real-time exchange feeds instantly.</p>
      </div>
      <div className="p-6 bg-white border rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg text-slate-800">🚀 Risk Free</h3>
        <p className="text-slate-600 text-sm mt-2">Test your strategies using virtual platform funds.</p>
      </div>
      <div className="p-6 bg-white border rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg text-slate-800">🎓 Guided Lessons</h3>
        <p className="text-slate-600 text-sm mt-2">Learn module concepts inside our built-in arena.</p>
      </div>
    </section>
  );
}