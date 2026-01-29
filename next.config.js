// next.config.js - Cloudflare Pages 兼容配置
/** @type {import('next').NextConfig} */

// 定义动态路由，这些路由将不会被静态生成
const nextConfig = {
  // 不使用output: 'export'，而是让Cloudflare Pages处理
  // 但在构建时排除API路由
  experimental: {
    // 确保某些路由不会被预构建
    serverComponentsExternalPackages: [],
  },
  images: {
    unoptimized: true, // Cloudflare Pages对图片优化有限制
  },
  // 为Cloudflare Pages添加重写规则
  async rewrites() {
    return [
      // 将API请求映射到正确的处理程序
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  // 确保静态资源正确处理
  trailingSlash: false,
}

module.exports = nextConfig