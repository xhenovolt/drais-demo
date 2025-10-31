/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/drais/api/**',
      },
    ],
  },
  trailingSlash: false, // Disable trailing slashes in URLs
};

module.exports = nextConfig;