/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Отключаем ESLint во время сборки для деплоя
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорируем ошибки TypeScript во время сборки
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Исключаем Node.js модули из клиентского бандла
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    return config
  },
  // Оптимизации для production
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig 