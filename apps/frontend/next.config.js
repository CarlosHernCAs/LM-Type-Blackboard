/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@eduverse/shared'],
  images: {
    domains: ['localhost', 'eduverse.com'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
};

module.exports = nextConfig;
