# 数据更新机制说明

## 概述

JurisGuard_Gemini 项目采用了基于 GitHub Actions 的自动化数据更新机制，以解决 Vercel 免费版不支持后台任务的限制。

## 更新频率

- **每周自动更新**：每周一早上9点（北京时间）
- **手动触发**：可通过 GitHub 界面手动触发更新
- **数据源**：法规、案例和文档数据

## 技术实现

### GitHub Actions 工作流

项目配置了两个 GitHub Actions 工作流：

1. **每日数据更新** (`daily-update.yml`)
   - 每天凌晨2点运行（北京时间上午10点）
   - 执行数据爬取和处理脚本
   - 更新 `/data/` 目录下的 JSON 文件

2. **每周数据更新** (`weekly-update.yml`)
   - 每周一早上9点（北京时间）
   - 执行相同的数据处理流程
   - 确保周初有最新的数据

### 数据处理流程

1. **数据获取**
   - 从各种 API 获取最新法规和案例数据
   - 使用免费 LLM API 清洗和标准化数据

2. **数据验证**
   - 验证数据完整性
   - 确保关键字段存在

3. **数据存储**
   - 保存为 JSON 格式
   - 提交到版本库
   - 自动部署到 Vercel

## 配置要求

### 环境变量

工作流需要以下环境变量：

- `OPENAI_API_KEY` 或其他免费 LLM API 密钥
- `NEXT_PUBLIC_USE_FREE_API`: 指定使用的免费 API 类型

### 数据文件

更新会影响以下文件：

- `data/compliance-data.json`
- `data/cases-data.json`
- `data/documents-data.json`
- `public/data/compliance-data.json`
- `public/data/cases-data.json`
- `public/data/documents-data.json`

## 优势

1. **自动化**：无需手动干预，定期更新数据
2. **可靠性**：基于 GitHub Actions，稳定可靠
3. **成本效益**：利用免费 API 和 GitHub Actions
4. **实时性**：确保数据保持最新

## 注意事项

1. **API 限制**：免费 API 可能有限制，需注意配额
2. **错误处理**：工作流包含错误处理机制
3. **数据一致性**：确保数据格式一致性和完整性

## 手动更新

如需立即更新数据，可以：

1. 在 GitHub 仓库的 Actions 标签页中找到相应的工作流
2. 点击 "Run workflow" 手动触发更新
3. 或在本地运行 `npm run crawl-data` 命令后推送更改