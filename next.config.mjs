import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Match Vercel's 4.5 MB request limit so local runs fail the same way production does
      bodySizeLimit: "4.5mb",
    },
  },
};

export default withNextIntl(nextConfig);
