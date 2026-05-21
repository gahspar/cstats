import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["hltv", "got-scraping", "header-generator"],
};

export default nextConfig;
