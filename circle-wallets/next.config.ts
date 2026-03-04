import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'ethglobal.storage' },
      { protocol: 'https', hostname: 'inkonchain.com' },
      { protocol: 'https', hostname: 'cryptologos.cc' },
    ],
  },
};

export default nextConfig;
