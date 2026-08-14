/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next.js 16 optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'],
  },
}

export default nextConfig
