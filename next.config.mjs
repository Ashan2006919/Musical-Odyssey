// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = {
        ...config.externals,
        '@napi-rs/snappy': 'commonjs @napi-rs/snappy',
        'kerberos': 'commonjs kerberos',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      };
    }
    return config;
  },
};

export default nextConfig;
