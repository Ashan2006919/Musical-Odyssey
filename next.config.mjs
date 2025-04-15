/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "musical-odyssey.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Externalize certain modules on the client-side
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        {
          '@napi-rs/snappy': 'commonjs @napi-rs/snappy',
          'kerberos': 'commonjs kerberos',
          'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
          '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        },
      ];
    } else {
      // Externalize `formidable` on the server-side
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        {
          formidable: 'commonjs formidable',
        },
      ];
    }

    return config;
  },
};

export default nextConfig;
