# Sealos 部署指南

## 概述
本文档介绍如何在 Sealos 平台上部署 JurisGuard-Gemini 项目。Sealos 是国内平台，对中国大陆访问友好。

## 部署步骤

### 1. 注册 Sealos 账户
- 访问 [Sealos 官网](https://www.sealos.io/)
- 使用 GitHub 或手机号注册账户
- 完成实名认证（如需）

### 2. 创建应用
1. 登录 Sealos 控制台
2. 点击"创建应用"
3. 选择"从代码构建"
4. 连接你的 GitHub 仓库：`Casper-hue/JurisGuard-Gemini`

### 3. 配置应用
- **应用名称**: `jurisguard-gemini`
- **构建方式**: 使用 Dockerfile
- **端口**: `3000`
- **资源限制**: 使用免费套餐配置

### 4. 环境变量配置
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 5. 开始部署
- 点击"部署"按钮
- Sealos 会自动构建 Docker 镜像并部署应用
- 部署完成后会提供访问地址

## 免费套餐资源限制
- **CPU**: 500m (0.5核)
- **内存**: 512Mi
- **存储**: 1GB
- **流量**: 充足，适合个人项目

## 访问地址
部署完成后，你会获得类似以下的访问地址：
- `https://jurisguard-gemini-xxx.sealos.io`

## 自动部署
Sealos 支持 GitHub Webhook 自动部署：
- 每次推送到 `main` 分支时自动重新部署
- 无需手动操作

## 优势
- ✅ **中国大陆访问速度快**
- ✅ **免费额度充足**
- ✅ **部署简单快捷**
- ✅ **自动 CI/CD**
- ✅ **国内技术支持**

## 故障排除
如果部署失败，请检查：
1. Dockerfile 语法是否正确
2. 端口配置是否为 3000
3. 资源限制是否超出免费额度
4. 构建日志中的错误信息

## 联系方式
如有问题，可联系 Sealos 官方技术支持或查看官方文档。