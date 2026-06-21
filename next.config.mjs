/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This tells Next.js to export pages as /courses/index.html instead of /courses.html
  // It fixes routing glitches on static hosts like GitHub Pages!
  trailingSlash: true, 
};

export default nextConfig;