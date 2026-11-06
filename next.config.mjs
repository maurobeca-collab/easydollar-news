/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from news sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cointelegraph.com' },
      { protocol: 'https', hostname: '**.coindesk.com' },
      { protocol: 'https', hostname: '**.decrypt.co' },
      { protocol: 'https', hostname: '**.reuters.com' },
      { protocol: 'https', hostname: '**.marketwatch.com' },
      { protocol: 'https', hostname: '**.kitco.com' },
    ],
  },
  // Suppress rss-parser Node.js warnings in edge/browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false }
    }
    return config
  },
}

export default nextConfig
