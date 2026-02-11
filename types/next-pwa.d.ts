declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAConfig {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
  }

  // callable with (NextConfig, PWAConfig)
  function withPWA(config: NextConfig, pwaConfig: PWAConfig): NextConfig;

  export default withPWA;
}
