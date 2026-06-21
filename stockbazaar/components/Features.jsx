'use client';

export default function Features() {
  const featuresList = [
    {
      title: "Game-Based Stock Simulator",
      description: "Students receive virtual money and participate in fun investing challenges.",
      badge: "Fun & Fast",
      badgeColor: "bg-[#FBBF24]/10 text-[#FBBF24]",
      items: ["Daily challenges", "Quick trading games", "XP points & Achievements", "Leaderboards & Rewards"]
    },
    {
      title: "Realistic Stock Market Simulator",
      description: "A professional simulation platform that behaves like a real stock market with actual assets.",
      badge: "Real-Time Data",
      badgeColor: "bg-[#4F8EF7]/10 text-[#4F8EF7]",
      items: ["Buy & Sell real stocks", "Live tracking & Watchlists", "Historical interactive charts", "₹100,000 starting cash"]
    },
    {
      title: "Beginner Crash Course",
      description: "An optional, bite-sized investing course designed from scratch for complete beginners.",
      badge: "Learn",
      badgeColor: "bg-[#34D399]/10 text-[#34D399]",
      items: ["What are stocks?", "Risk management rules", "Interactive visual quizzes", "Completion certificates"]
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="font-poppins font-extrabold text-[36px] text-slate-900">
          Packed with Features for Future Investors
        </h2>
        <p className="text-slate-500 text-[18px]">
          Everything a student needs to bridge the gap between financial confusion and market confidence.
        </p>
      </div>

      {/* Responsive Grid layout for cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuresList.map((feat, index) => (
          <div 
            key={index} 
            className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <span className={`inline-block px-3 py-1 rounded-xl text-sm font-bold ${feat.badgeColor}`}>
                {feat.badge}
              </span>
              <h3 className="font-poppins font-bold text-2xl text-slate-800 leading-snug">
                {feat.title}
              </h3>
              <p className="text-slate-600 text-[16px] leading-relaxed">
                {feat.description}
              </p>
              
              <ul className="pt-4 space-y-2.5">
                {feat.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600 text-[15px]">
                    <span className="text-[#34D399] font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}