import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dt5lofhwv/image/upload/v1754478315/answer24_blogs/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '72.62.33.112', // Put your IP here
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
const config = withNextIntl(nextConfig);

export default config;