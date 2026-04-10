import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["pengaduansaranasekolah.sakum.my.id", "localhost:3000"],
  
  experimental: {
    serverActions: {
      allowedOrigins: ["pengaduansaranasekolah.sakum.my.id", "localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pengaduansaranasekolah.sakum.my.id',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default nextConfig;