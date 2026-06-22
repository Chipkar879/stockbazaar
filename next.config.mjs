/** @type {import('next').NextConfig} */
const nextConfig = {
  // We removed "output: 'export'" so your /api/stock route can run flawlessly on Vercel!
  images: {
    unoptimized: true,
  },
};

export default nextConfig;