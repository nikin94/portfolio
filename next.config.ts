import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats for case-study screenshots by default.
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
