import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // or whatever port your API runs on
        pathname: '/drais/api/uploads/students/**',
      },
    ],
  },
};

export default nextConfig;
