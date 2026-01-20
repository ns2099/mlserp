/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true, // Railway'de sharp sorunlarını önlemek için
  },
  // Browser extension hatalarını azaltmak için
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Server Actions için experimental ayarlar
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Build cache sorunlarını önlemek için
  swcMinify: true,
}

module.exports = nextConfig

