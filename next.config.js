const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    // Optimize webpack caching
    if (dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        version: `${process.env.NODE_ENV}-${process.version}-${config.mode}`,
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
        store: 'pack',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig; 