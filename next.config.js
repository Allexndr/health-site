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

<<<<<<< HEAD
module.exports = nextConfig 


=======
module.exports = nextConfig 
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
