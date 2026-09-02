import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === '1';

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: 'export',
      assetPrefix: '/recipe-scale/',
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
