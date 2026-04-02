import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["pengaduansaranasekolah.sakum.my.id", "localhost:3000"],
  
  experimental: {
    serverActions: {
      allowedOrigins: ["pengaduansaranasekolah.sakum.my.id", "localhost:3000"],
    },
  },
};

export default nextConfig;