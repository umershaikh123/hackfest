/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@mastra/core', '@mastra/libsql', '@mastra/memory', '@mastra/pinecone', '@mastra/rag'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure config.externals exists and is an array
      if (!config.externals) {
        config.externals = [];
      }
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      
      config.externals.push({
        '@mastra/core': 'commonjs @mastra/core',
        '@mastra/libsql': 'commonjs @mastra/libsql',
        '@mastra/memory': 'commonjs @mastra/memory',
        '@mastra/pinecone': 'commonjs @mastra/pinecone',
        '@mastra/rag': 'commonjs @mastra/rag',
      });
    }
    return config;
  },
}

export default nextConfig
