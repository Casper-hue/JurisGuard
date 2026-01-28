# Dashboard 页面更新说明

## 更新内容

Dashboard页面已更新，现在能够与其他页面打通并显示动态数据：

### 1. 删除了Activity Summary卡片
- 移除了固定的活动摘要部分
- 使页面布局更简洁专注

### 2. 更新统计数据
- **Risk Items**: 统计高重要性的法规和高风险的案件数量
  - 高/严重级别的法规（severity: 'high'/'critical' 或 importanceLevel: 'high'/'critical'）
  - 高/严重影响的案件（impactLevel: 'high'/'critical' 或 severity: 'high'/'critical'）

- **Regulations Tracked**: 统计regulations页面的法规总数量
  - 从 `/data/compliance-data.json` 的 `alerts` 数组获取

- **New Documents**: 统计documents页面的新文件数量
  - 从 `/data/documents-data.json` 的 `documents` 数组获取

- **Cases Tracked**: 统计cases页面的案件总数量
  - 从 `/data/cases-data.json` 的 `cases` 数组获取

### 3. 更新Recent Compliance Alerts
- 显示重要或高风险的法规或案件（共3个）
- 按时间戳排序，最新的在前
- 仅显示高重要性/高风险的项目

## 技术实现

### API端点
- 新增 `/api/dashboard` 端点
- 从多个数据源聚合信息
- 提供统一的仪表板数据接口

### 数据源
- `/data/compliance-data.json` - 法规数据
- `/data/cases-data.json` - 案件数据
- `/data/documents-data.json` - 文档数据

## 数据来源说明

### 当前状态
- 目前系统使用示例数据文件（JSON格式）作为数据源
- 这些数据在 `/data/` 和 `/public/data/` 目录下
- 当您看到其他页面数据变化时，是因为Dashboard现在直接从这些共享数据源获取信息

### 自动更新机制
- 系统已配置GitHub Actions实现数据自动更新
- 每周一早上9点（北京时间）自动运行数据爬取和处理脚本
- 使用免费LLM API进行数据清洗和标准化
- 更新后的数据会自动反映在所有相关页面上

## 使用说明

Dashboard页面现在会自动从其他页面的数据文件中获取最新数据，无需手动维护。当其他页面的数据更新时，Dashboard会自动反映这些变化。数据更新通过GitHub Actions定时执行，确保信息始终保持最新。