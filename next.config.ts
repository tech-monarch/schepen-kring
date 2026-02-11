import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/dt5lofhwv/image/upload/v1754478315/answer24_blogs/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      { protocol: "http", hostname: "72.62.33.112", pathname: "/storage/**" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

// Pass PWA options as an argument to withPWA
export default withNextIntl(
  withPWA(
    nextConfig,
    {
      dest: "public",
      register: true,
      skipWaiting: true,
      disable: false, // enables PWA in dev mode
    }
  )
);
