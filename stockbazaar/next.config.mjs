/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Compiles the application into static HTML/CSS/JS files
  images: { 
    unoptimized: true      // Required since static hosting cannot resize images on the fly
  },
  trailingSlash: true      // Crucial for GitHub Pages to prevent 404 errors on route refreshes
};

export default nextConfig;