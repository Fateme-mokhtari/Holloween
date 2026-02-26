/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // When you fetch from "/api-proxy/...", Next.js handles it on the server
        source: '/api-proxy/:path*',
        destination: 'https://halloween.shafi.ee/:path*', 
      },
    ]
  },
};

export default nextConfig;
