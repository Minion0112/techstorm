/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Next.js 16 optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'],
  },
}

export default nextConfig
