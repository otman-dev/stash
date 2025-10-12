/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for development
  reactStrictMode: true,
  
  // Disable TypeScript checking during build to work around incompatibility with Next.js 15.5.4
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configure images to allow Google profile pictures
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
    ],
  },
  
  // Configure webpack for better MongoDB compatibility
  webpack: (config, { isServer }) => {
    // Fix for MongoDB adapter and NextAuth.js
    if (isServer) {
      config.externals = [...config.externals, 'mongodb-client-encryption'];
    }
    
    return config;
  },
  
  // Add environment variables that should be available in the browser
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

module.exports = nextConfig;