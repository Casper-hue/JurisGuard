# JurisGuard - AI驱动的法律合规管理平台

![JurisGuard Banner](https://img.shields.io/badge/JurisGuard-AI%E9%A9%B1%E5%8A%A8%E6%B3%95%E5%BE%8B%E5%90%88%E8%A7%84%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![AI Assistant](https://img.shields.io/badge/AI%20Assistant-DeepSeek-green)

**JurisGuard** 是一个专为法律专业人员设计的智能合规管理平台，集成了AI助手、法规追踪、风险评估和文档管理功能。

## 🎯 项目亮点

### 🤖 智能风险分析系统
- **AI驱动的文本分析**：自动识别法律文本中的合规风险
- **精准字段提取**：严格对应UI字段，确保数据一致性
- **多维度风险评估**：基于财务影响、法律后果、业务影响等标准
- **实时数据同步**：AI分析结果即时同步到UI显示

### 🔄 完整的数据流
- **用户输入** → **AI分析** → **字段提取** → **数据保存** → **UI显示**
- **统一的数据结构**：确保Cases和Regulations数据格式一致性
- **自动ID生成**：为每条记录生成唯一标识
- **错误处理机制**：完善的验证和错误提示系统

## 🚀 核心功能

### 📊 智能合规仪表板
- **实时合规警报**：监控欧美及东南亚地区的法规更新
- **风险评估雷达**：可视化展示合规风险等级
- **数据统计面板**：关键指标实时监控

### 🤖 AI合规助手
- **资深法务专家角色**：15年以上跨国企业合规经验设定
- **多法域法规咨询**：支持GDPR、EU AI Act、CCPA等全球法规
- **专业回答格式**：符合法律科技行业标准的分析框架
- **DeepSeek集成**：支持多种大语言模型API

### 📋 合规管理模块
- **法规追踪**：实时更新欧美、东南亚重要法规
- **案例管理**：法律案例库和判例分析
- **文档管理**：政策文件、合同模板集中管理
- **风险评估**：量化风险等级和应对建议

## 🛠️ 技术栈

- **前端框架**: Next.js 14, React 18, TypeScript
- **样式设计**: Tailwind CSS, 响应式布局
- **AI集成**: DeepSeek API, OpenAI兼容接口
- **状态管理**: React Context, useState/useEffect
- **开发工具**: ESLint, Prettier, TypeScript严格模式

## 🏗️ 项目架构

```
JurisGuard/
├── app/                    # Next.js App Router
│   ├── ai-assistant/       # AI助手页面
│   ├── compliance/         # 合规管理页面
│   ├── dashboard/          # 仪表板页面
│   ├── cases/             # 案例管理页面
│   └── documents/         # 文档管理页面
├── components/            # 可复用组件
├── lib/                   # 工具库和服务
│   ├── ai-service.ts      # AI服务集成
│   └── crawler-service.ts # 数据爬取服务
├── public/data/           # 静态数据文件
├── types/                 # TypeScript类型定义
└── contexts/              # React Context
```

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- DeepSeek API密钥（可选）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/Casper-hue/JurisGuard-Gemini.git
cd JurisGuard-Gemini
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置环境变量**（可选）
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_AI_API_KEY=your_deepseek_api_key
NEXT_PUBLIC_AI_BASE_URL=https://api.deepseek.com/v1
NEXT_PUBLIC_AI_MODEL=deepseek-chat
```

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

5. **访问应用**
打开浏览器访问 http://localhost:3000

## 📱 功能演示

### 合规仪表板
- 实时显示合规警报和风险指标
- 支持按地区、严重程度筛选
- 可视化风险雷达图

### AI合规助手
- 专业法务合规专家咨询
- 多法域法规解读
- 风险评估和应对建议
- 支持PDF文档下载

### 法规管理
- 欧美及东南亚法规数据库
- 实时法规更新追踪
- 法规详情查看和来源链接

## 🔧 配置说明

### AI助手配置
在AI助手页面点击设置按钮，配置：
- **API密钥**: DeepSeek或其他兼容API密钥
- **模型选择**: DeepSeek Chat、GPT系列、Claude等
- **参数调优**: Temperature、Max Tokens等

### 数据源配置
项目使用JSON文件存储静态数据，支持：
- 合规警报数据 (`public/data/compliance-data.json`)
- 案例数据 (`public/data/cases-data.json`)
- 文档数据 (`public/data/documents-data.json`)

## 🎯 项目特色

### 专业法律科技融合
- **法律专业知识**：深度理解多法域合规要求
- **技术实现能力**：现代化前端技术栈应用
- **用户体验优化**：符合法律工作流程的界面设计

### AI助手专业度
- **资深专家角色**：非泛化LLM回答，体现专业法务水准
- **标准化回答格式**：符合Westlaw等专业数据库标准
- **数据来源标注**：每个回答包含法规条款和官方链接

### 实际应用价值
- **企业合规部门**：一站式合规管理解决方案
- **法律事务所**：法规研究和案例参考工具
- **个人法律从业者**：专业AI合规咨询助手

## 📈 开发路线图

### 🚀 近期计划 (v1.1-v1.3)
- [x] **AI风险分析系统** - 已完成
- [ ] **实时法规爬虫集成** - 预留接口，支持自动抓取法规更新
- [ ] **多语言支持** - 完整的中英文国际化支持
- [ ] **移动端优化** - 响应式设计，移动端友好体验

### 🔮 中期规划 (v1.4-v2.0)
- [ ] **团队协作功能** - 多用户权限管理，团队数据共享
- [ ] **合规报告自动生成** - AI驱动的合规报告模板
- [ ] **API接口开放** - RESTful API，支持第三方集成
- [ ] **数据可视化增强** - 更丰富的图表和仪表板

### 🌟 长期愿景 (v2.0+)
- [ ] **智能合规监控** - 实时监控企业合规状态
- [ ] **预测性合规** - AI预测法规变化趋势
- [ ] **区块链存证** - 合规数据的不可篡改存储
- [ ] **行业定制化** - 针对不同行业的合规解决方案

### 🔧 技术架构扩展
- **爬虫接口预留**：支持法规数据自动采集和更新
- **微服务架构**：模块化设计，便于功能扩展
- **数据库集成**：支持PostgreSQL/MongoDB等数据库
- **缓存优化**：Redis缓存提升性能
- **监控系统**：完整的应用监控和日志系统

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发规范
- 使用TypeScript严格模式
- 遵循ESLint和Prettier代码规范
- 提交信息使用约定式提交格式

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 作者

**Casper-hue** 
- GitHub: [@Casper-hue](https://github.com/Casper-hue)
- 项目开发者，专注于法律科技应用开发

## 🙏 致谢

- 感谢DeepSeek提供优秀的AI模型服务
- 感谢Next.js和React社区的优秀工具
- 感谢所有为法律科技发展做出贡献的开源项目

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！

**JurisGuard - 让合规管理更智能、更高效**