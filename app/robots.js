export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // Blocks search bots from wasting time crawling backend routes
          '/admin/',        // Keeps private admin dashboards off Google results
          '/dashboard/settings' // Keeps user-specific private panels hidden
        ],
      },
    ],
    sitemap: 'https://stockbazaar.vercel.app/sitemap.xml',
  };
}