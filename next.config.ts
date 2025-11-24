import type { NextConfig } from "next";

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
      'avatars.githubusercontent.com', // <-- add GitHub avatars here
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
    ],
  },
  // Other config options can go here
};

export default nextConfig;
