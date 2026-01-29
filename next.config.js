// next.config.js - 静态导出配置，Cloudflare Pages兼容
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用静态导出模式，Cloudflare Pages友好
  output: 'export',
  
  // 禁用图片优化，因为静态导出时不支持
  images: {
    unoptimized: true,
  },
  
  // 其他配置
  trailingSlash: true, // 添加尾随斜杠
}

module.exports = nextConfig