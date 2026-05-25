/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Volahi',
  assetPrefix: '/Volahi',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.istockphoto.com' },
      { protocol: 'https', hostname: 'assets.myntassets.com' },
    ],
  },
};

export default nextConfig;
