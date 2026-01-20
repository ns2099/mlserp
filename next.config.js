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
  // Server Actions ayarları (kullanmıyoruz ama Next.js'in internal kullanımı için)
  experimental: {
    serverActions: {
      allowedOrigins: [],
    },
  },
  // Build cache sorunlarını önlemek için
  swcMinify: true,
}

module.exports = nextConfig

