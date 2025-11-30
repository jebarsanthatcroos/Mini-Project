import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'th.bing.com',
      'example.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'cdn.pixabay.com',
      'source.unsplash.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bing.com',
      },
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  reactStrictMode: true,

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    serverActions: {},
  },
};

export default nextConfig;
