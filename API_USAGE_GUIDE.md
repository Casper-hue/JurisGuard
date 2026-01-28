# 爬虫和AI API使用规划指南

## 1. 爬虫与AI助手功能对比分析

### 爬虫功能（自动数据获取）
- **数据来源**：Regulations.gov API、CourtListener API等官方API
- **执行时机**：定时运行（通过GitHub Actions每日执行）
- **数据处理**：批量处理，AI清洗标准化
- **数据流向**：API → AI清洗 → JSON文件 → UI显示

### AI助手功能（手动数据处理）
- **数据来源**：用户输入的文本内容
- **执行时机**：用户主动触发
- **数据处理**：实时处理，AI分析提取
- **数据流向**：用户输入 → AI分析 → 验证 → JSON文件 → UI显示

## 2. 潜在冲突分析

### 不会发生冲突的原因：
1. **数据写入路径相同但时机不同**
   - 爬虫：批量写入，每日一次
   - AI助手：逐条写入，按需触发
   - 两者都写入相同的JSON文件，但不会同时写入

2. **数据结构一致**
   - 两种功能都遵循相同的法规和案例数据结构
   - 数据验证规则一致，保证数据质量

3. **独立的触发机制**
   - 爬虫通过GitHub Actions自动触发
   - AI助手通过用户交互手动触发

### 潜在风险：
1. **并发写入冲突**：如果AI助手在爬虫运行时同时写入数据
2. **数据重复**：同一数据被多次处理和保存

## 3. 免费LLM API使用频率规划

### OpenRouter 免费额度
- **额度**：每日200次请求，每分钟20次请求
- **分配策略**：
  - 爬虫数据清洗：50次/天（约25%）
  - AI助手功能：100次/天（约50%）
  - 预留缓冲：50次/天（约25%）

### Hugging Face Inference API
- **额度**：根据模型和用量变化
- **分配策略**：
  - 作为OpenRouter的备用选项
  - 主要用于AI助手功能

### Together AI
- **额度**：提供免费试用额度
- **分配策略**：
  - 作为次要备用选项

## 4. 使用模式建议

### 爬虫数据获取
- **频率**：每日一次（通过GitHub Actions）
- **时间**：UTC时间凌晨2点（北京时间上午10点）
- **AI API使用**：在爬虫脚本中使用，每日执行一次

### AI助手功能
- **频率**：按需使用，用户主动触发
- **AI API使用**：每次用户请求时使用
- **限制措施**：建议添加用户请求频率限制

## 5. 优化建议

### 1. 添加请求频率限制
```javascript
// 在AI助手页面添加节流机制
const [lastRequestTime, setLastRequestTime] = useState(0);
const minRequestInterval = 5000; // 5秒间隔

const handleSendMessage = async () => {
  const now = Date.now();
  if (now - lastRequestTime < minRequestInterval) {
    setError('请稍后再试，避免频繁请求');
    return;
  }
  setLastRequestTime(now);
  // ... 其余逻辑
};
```

### 2. 数据去重机制
在保存数据前检查是否已存在相同数据：
```javascript
// 在strict-save-manager.ts中添加去重逻辑
private async checkForDuplicates(data: any, dataType: string): Promise<boolean> {
  // 读取现有数据
  const existingData = await this.readExistingData(dataType);
  // 检查是否存在相似数据
  return existingData.some((item: any) => 
    item.title === data.title && 
    item.timestamp === data.timestamp
  );
}
```

### 3. 错误处理和降级策略
- 当AI API达到限制时，使用本地规则进行基础数据处理
- 提供清晰的错误提示，指导用户更换API密钥

### 4. 监控和日志
- 记录API使用情况，便于监控额度使用
- 记录数据处理成功率，便于优化算法

## 6. 最佳实践

### 针对您的使用场景：
1. **爬虫功能**：继续使用GitHub Actions每日自动运行，使用免费API进行数据清洗
2. **AI助手功能**：作为补充功能，用于处理特殊或用户上传的数据
3. **API轮换**：当一个API达到限制时，自动切换到备用API
4. **缓存机制**：对相同输入的数据进行缓存，避免重复API调用

### 推荐配置示例：
```bash
# .env.local
# 主要API
USE_OPENROUTER=true
OPENROUTER_API_KEY=your_openrouter_api_key

# 备用API
HUGGINGFACE_API_KEY=your_huggingface_api_key
USE_HUGGINGFACE=false  # 仅在主API不可用时启用

# 请求限制
AI_REQUEST_INTERVAL=5000  # 5秒间隔
MAX_DAILY_REQUESTS=150     # 每日最大请求数
```

这样既能充分利用免费API额度，又能避免冲突和过度使用的问题。