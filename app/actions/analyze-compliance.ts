'use server'

import { AIService } from '@/lib/ai-service'

// 多角色风险分析结果接口
export interface RiskAnalysisResult {
  role: 'expert' | 'engine'
  
  // 专家模式字段
  riskScore?: number
  summary?: string
  affectedRegions?: string[]
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical'
  recommendations?: string[]
  complianceAreas?: string[]
  actionRequired?: boolean
  effectiveDate?: string  // 生效日期
  deadline?: string       // 合规截止日期
  sourceUrl?: string      // 信息来源链接
  
  // 引擎模式字段
  title?: string
  risk_score?: number
  severity_level?: 'Low' | 'Medium' | 'High' | 'Critical'
  affected_regions?: string[]
  tags?: string[]
  action_required?: boolean
  publish_date?: string      // 发布日期
  compliance_deadline?: string // 合规截止日期
  source_reference?: string   // 信息来源参考
}

// 多角色智能系统提示词 - JurisGuard合规引擎
const RISK_ANALYSIS_SYSTEM_PROMPT = `# 角色切换系统

## 角色1: JurisGuard资深法务合规专家（深度分析模式）
**激活条件**: 用户请求详细风险分析、合规建议、法规解读
**专业背景**: 15年以上跨国企业合规管理经验，全球500强企业服务经验
**专业领域**: 
- 数据合规与隐私保护：GDPR、CCPA、PIPL、PDPA等全球数据保护法规
- 人工智能监管：EU AI Act、NIST AI框架、中国AI法规
- 网络安全与风险管理：CISSP、CIPP/E认证，NIST、ISO 27001标准
- 知识产权保护：专利代理人资格，技术转移和知识产权商业化
- 进出口管制：EAR、ITAR实际操作流程，出口管制合规体系
- 东南亚合规：新加坡、马来西亚、泰国等地实际合规项目经验

**输出格式（深度分析模式） - 必须严格遵循此JSON Schema**:
{
  "role": "expert",
  "title": "法规标题（中文）",
  "region": "地区代码如EU,US,CN",
  "severity": "critical/high/medium/low",
  "summary": "风险分析的详细专业总结（中文）",
  "timestamp": "发布日期（如2024-03-15，如无则用\"N/A\"）",
  "category": "分类如Data Compliance, Cybersecurity等",
  "source_url": "信息来源链接（如无则用\"N/A\"）"
}

## 角色2: JurisGuard合规引擎（快速处理模式）
**激活条件**: 用户提供原始法律新闻/文本，需要快速结构化处理
**功能定位**: 自动化合规数据处理引擎，快速提取关键信息

**输出格式（快速处理模式） - 必须严格遵循此JSON Schema**:
{
  "role": "engine",
  "title": "简短专业标题（中文）",
  "region": "地区代码如EU,US,CN",
  "severity": "critical/high/medium/low",
  "summary": "2句话的影响总结（中文）",
  "timestamp": "发布日期（如2024-03-13，如无则用\"N/A\"）",
  "category": "分类如Data Compliance, Cybersecurity等",
  "source_url": "信息来源链接（如无则用\"N/A\"）"
}

# 统一评分逻辑
- **Critical (81-100)**: 提及罚款、刑事责任、立即截止日期(<30天)
- **High (61-80)**: 重大监管变化、强制合规要求
- **Medium (41-60)**: 报告义务、程序性变更、中等影响
- **Low (0-40)**: 一般指南、草案、非约束性建议

# 地区代码标准
- EU: 欧盟地区
- US: 美国
- CN: 中国
- UK: 英国
- APAC: 亚太地区
- Global: 全球影响

# 严重级别识别标准
## Cases (impactLevel) 识别标准
- **critical (81-100)**: 重大财务损失(>1000万)、刑事责任、公司倒闭风险、重大声誉损害
- **high (61-80)**: 重大诉讼、监管处罚、重大业务中断、中等财务损失(100万-1000万)
- **medium (41-60)**: 一般诉讼、程序性违规、轻微业务影响、小额财务损失(<100万)
- **low (0-40)**: 技术性违规、无实质影响、轻微程序问题、无财务损失

## Regulations (severity) 识别标准
- **critical**: 提及刑事处罚、重大罚款(>1000万)、立即生效(<30天)、强制合规要求
- **high**: 重大监管变化、强制合规要求、中等罚款(100万-1000万)、重要截止日期(30-90天)
- **medium**: 报告义务、程序性变更、指导性要求、一般截止日期(90-180天)
- **low**: 非约束性建议、草案阶段、无实质影响、长期生效(>180天)

# 字段说明
## 必填字段（必须包含）
- role: 角色标识
- title: 标题
- region: 适用地区
- severity: 严重级别(critical/high/medium/low)
- summary: 总结描述
- timestamp: 时间戳
- category: 分类

## 可选字段（如无信息则用"N/A"）
- source_url: 信息来源

# 分析要求
1. **字段完整性**: 必须包含所有指定字段，缺失信息用"N/A"填充
2. **客观性**: 必须基于文本内容进行客观分析
3. **量化依据**: 风险评估必须有具体量化依据
4. **可行性**: 建议必须具体可行
5. **格式严格**: 必须严格遵守JSON格式要求
6. **语言要求**: 中文输出，专业术语准确
7. **时效性**: 考虑法规的生效时间和最新修订

# 智能角色切换
根据用户输入的内容复杂度和请求类型，自动选择合适的角色：
- 简单文本片段 → 合规引擎模式（快速处理）
- 复杂法规分析 → 资深专家模式（深度分析）
- 明确指定角色 → 按用户要求执行`

/**
 * 分析法律文本的合规风险
 * @param rawText 原始法律文本
 * @returns 结构化的风险分析结果
 */
export async function analyzeLegalText(rawText: string): Promise<RiskAnalysisResult> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('请输入有效的法律文本')
  }

  if (rawText.length > 10000) {
    throw new Error('文本长度超过限制（最大10000字符）')
  }

  try {
    // 检查环境变量配置
    const apiKey = process.env.DEEPSEEK_API_KEY
    const baseURL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com'

    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置，请在环境变量中设置DEEPSEEK_API_KEY')
    }

    // 创建AI服务实例
    const aiService = new AIService({
      apiKey,
      baseURL,
      model: 'deepseek-chat',
      temperature: 0.3, // 较低温度确保一致性
      max_tokens: 2000
    })

    // 构建分析提示词
    const analysisPrompt = `请分析以下法律文本的合规风险，并返回JSON格式的分析结果：

法律文本内容：
"""
${rawText}
"""

请按照以下要求进行分析：

## 严重级别识别标准
### Cases (impactLevel) 识别标准
- **critical (81-100)**: 重大财务损失(>1000万)、刑事责任、公司倒闭风险、重大声誉损害
- **high (61-80)**: 重大诉讼、监管处罚、重大业务中断、中等财务损失(100万-1000万)
- **medium (41-60)**: 一般诉讼、程序性违规、轻微业务影响、小额财务损失(<100万)
- **low (0-40)**: 技术性违规、无实质影响、轻微程序问题、无财务损失

### Regulations (severity) 识别标准
- **critical**: 提及刑事处罚、重大罚款(>1000万)、立即生效(<30天)、强制合规要求
- **high**: 重大监管变化、强制合规要求、中等罚款(100万-1000万)、重要截止日期(30-90天)
- **medium**: 报告义务、程序性变更、指导性要求、一般截止日期(90-180天)
- **low**: 非约束性建议、草案阶段、无实质影响、长期生效(>180天)

请严格按照上述标准评估严重级别，并返回JSON格式的结果。`

    // 发送分析请求
    const response = await aiService.sendMessage([
      {
        id: 'system',
        content: RISK_ANALYSIS_SYSTEM_PROMPT,
        role: 'user',
        timestamp: new Date()
      },
      {
        id: 'analysis',
        content: analysisPrompt,
        role: 'user',
        timestamp: new Date()
      }
    ])

    // 解析AI返回的JSON
    let parsedResult: RiskAnalysisResult
    try {
      // 尝试从响应内容中提取JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI返回的响应格式不正确，无法解析JSON')
      }
      
      parsedResult = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.error('原始响应:', response.content)
      throw new Error('分析结果解析失败，请重试')
    }

    // 验证结果格式
    if (!isValidRiskAnalysisResult(parsedResult)) {
      throw new Error('分析结果格式验证失败')
    }

    return parsedResult

  } catch (error) {
    console.error('风险分析失败:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('风险分析服务暂时不可用，请稍后重试')
  }
}

/**
 * 验证风险分析结果格式（支持多角色）
 */
function isValidRiskAnalysisResult(result: any): result is RiskAnalysisResult {
  if (!result.role || !['expert', 'engine'].includes(result.role)) {
    return false
  }

  if (result.role === 'expert') {
    return (
      typeof result.riskScore === 'number' &&
      result.riskScore >= 0 && result.riskScore <= 100 &&
      typeof result.summary === 'string' &&
      Array.isArray(result.affectedRegions) &&
      ['Low', 'Medium', 'High', 'Critical'].includes(result.riskLevel) &&
      Array.isArray(result.recommendations) &&
      Array.isArray(result.complianceAreas) &&
      typeof result.actionRequired === 'boolean' &&
      typeof result.effectiveDate === 'string' &&
      typeof result.deadline === 'string' &&
      typeof result.sourceUrl === 'string'
    )
  }

  if (result.role === 'engine') {
    return (
      typeof result.title === 'string' &&
      typeof result.summary === 'string' &&
      typeof result.risk_score === 'number' &&
      result.risk_score >= 0 && result.risk_score <= 100 &&
      ['Low', 'Medium', 'High', 'Critical'].includes(result.severity_level) &&
      Array.isArray(result.affected_regions) &&
      Array.isArray(result.tags) &&
      typeof result.action_required === 'boolean' &&
      typeof result.publish_date === 'string' &&
      typeof result.compliance_deadline === 'string' &&
      typeof result.source_reference === 'string'
    )
  }

  return false
}

/**
 * 获取默认的风险分析示例（用于演示）
 */
export async function getDemoRiskAnalysis(): Promise<RiskAnalysisResult> {
  // 返回专家模式示例
  return {
    role: 'expert',
    riskScore: 75,
    summary: '欧盟AI法案正式通过，对高风险AI系统实施严格监管要求',
    affectedRegions: ['EU', 'Global'],
    riskLevel: 'High',
    recommendations: [
      '立即开展AI系统风险评估和分类',
      '建立AI监管合规框架和流程',
      '实施数据保护和透明度要求',
      '制定AI系统安全测试计划'
    ],
    complianceAreas: ['AI监管', '数据保护', '网络安全', '产品合规'],
    actionRequired: true,
    effectiveDate: '2024-08-02',
    deadline: '2025-02-02',
    sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0001'
  }
}

/**
 * 获取合规引擎模式示例（用于演示）
 */
export async function getEngineDemoAnalysis(): Promise<RiskAnalysisResult> {
  return {
    role: 'engine',
    title: '欧盟AI法案正式实施',
    summary: '欧洲议会正式通过AI法案，对高风险AI系统实施严格监管，企业需在6个月内完成合规。',
    risk_score: 78,
    severity_level: 'High',
    affected_regions: ['EU', 'Global'],
    tags: ['AI监管', '数据合规', '高风险系统', '欧盟法规'],
    action_required: true,
    publish_date: '2024-03-13',
    compliance_deadline: '2024-09-13',
    source_reference: '欧盟官方公报'
  }
}