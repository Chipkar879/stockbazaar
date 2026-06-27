import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 1. DYNAMIC SEO METADATA GENERATION
export async function generateMetadata({ params }) {
  const { slug } = params;

  // Fetch only the title and description for Google bots
  const { data: article } = await supabase
    .from('articles')
    .select('title, meta_description')
    .eq('slug', slug)
    .single();

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.meta_description,
    openGraph: {
      title: `${article.title} | Stockbazaar Learn`,
      description: article.meta_description,
      type: 'article',
    },
  };
}

// 2. THE ACTUAL PAGE COMPONENT
export default async function LearnArticlePage({ params }) {
  const { slug } = params;

  // Fetch the full article details from your Supabase 'articles' table
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  // If the user types a random URL slug that doesn't exist, trigger a 404
  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Back button */}
      <Link href="/learn" className="text-blue-600 hover:underline text-sm font-medium">
        ← Back to Learning Hub
      </Link>

      {/* Main SEO Header */}
      <h1 className="text-4xl font-extrabold text-gray-900 mt-4 mb-2 tracking-tight">
        {article.title}
      </h1>
      
      <p className="text-sm text-gray-500 mb-8">
        Published on {new Date(article.created_at).toLocaleDateString('en-IN')}
      </p>

      {/* Article Body Content */}
      <div 
        className="prose prose-blue max-w-none text-gray-800 leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: article.content_html }}
      />

      {/* THE INTERNAL LINK HOOK (The Hub-and-Spoke SEO Cluster) */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-blue-900 mb-2">
          Ready to put this knowledge to the test?
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Don't risk real money. Practice trading strategies risk-free using our real-time simulator.
        </p>
        <Link 
          href="/simulator" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition"
        >
          Open Live Stock Simulator
        </Link>
      </div>
    </article>
  );
}