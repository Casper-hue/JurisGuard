# Cloudflare Pages 部署指南 - 中国大陆访问解决方案

## 🌐 为什么选择Cloudflare Pages？
- 相比Vercel的`.vercel.app`域名，Cloudflare的`.pages.dev`域名在中国大陆访问更稳定
- Cloudflare在全球，特别是亚太地区有大量CDN节点
- 静态站点托管完全免费，带宽无限制

## 🚀 部署步骤

### 1. 推送代码到GitHub
```bash
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main
```

### 2. Cloudflare Pages配置
1. 访问 https://pages.cloudflare.com/
2. 连接GitHub账户并选择您的仓库
3. 配置构建设置：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `.next`

### 3. 环境变量配置（可选，如需AI功能）
根据您选择的免费API服务添加环境变量：

#### OpenRouter免费服务（推荐）
```
USE_OPENROUTER=true
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_AI_MODEL=mistralai/mistral-7b-instruct:free
```

#### HuggingFace免费服务
```
USE_HUGGINGFACE=true
HUGGINGFACE_API_KEY=your_huggingface_api_key
HUGGINGFACE_MODEL_ID=microsoft/DialoGPT-medium
```

## ⚡ 功能完整性
- 保留所有功能：AI助手、爬虫、数据管理、仪表板等
- 免费API服务正常工作
- 数据持久化功能正常

## 🎯 优势对比
- Vercel `.vercel.app` - 中国大陆访问困难
- Cloudflare Pages `.pages.dev` - 中国大陆可稳定访问