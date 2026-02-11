import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "next-pwa";

const withNextIntl = createNextIntlPlugin();

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development",
  disable: false,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dt5lofhwv/image/upload/v1754478315/answer24_blogs/**",
      },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      { protocol: "http", hostname: "72.62.33.112", pathname: "/storage/**" },
    ],
  },
};

export default withNextIntl(withPWA(nextConfig));
