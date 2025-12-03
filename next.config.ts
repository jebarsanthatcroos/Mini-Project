import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // Use remotePatterns instead of the deprecated 'domains'
    remotePatterns: [
      { protocol: 'https', hostname: 'th.bing.com' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'development',
  },

  experimental: {
    serverActions: {},
  },
};

export default nextConfig;
