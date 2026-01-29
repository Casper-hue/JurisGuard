/** @type {import('next').NextConfig} */
const nextConfig = {
  // 为Cloudflare Pages优化的配置
  // 保留API路由支持
  output: undefined, // 不设置为export，保留SSR能力
  
  // 图片配置
  images: {
    unoptimized: false, // 让Cloudflare处理图片优化
  },
}

module.exports = nextConfig