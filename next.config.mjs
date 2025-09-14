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
  async redirects() {
    return [
      {
        source: '/(.*)',
        destination: 'https://gamestorm.clusterider.tech',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
