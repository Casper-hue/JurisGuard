import { ComplianceAlert } from '@/types/index'

// AI 消息接口
export interface AIMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

// AI 请求参数
export interface AIRequest {
  messages: AIMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
  system_prompt?: string
}

// AI 响应接口
export interface AIResponse {
  id: string
  content: string
  role: 'assistant'
  timestamp: Date
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// AI 配置接口
export interface AIConfig {
  apiKey: string
  baseURL: string
  model: string
  temperature: number
  max_tokens: number
}

// 系统提示词（资深法务合规专家角色 - 法律科技行业标准）
const SYSTEM_PROMPT = `你是JurisGuard的资深法务合规专家，拥有15年以上跨国企业合规管理经验，曾服务于多家全球500强企业。你的回答必须体现专业法务合规师的水准，避免泛泛的LLM回答风格。

## 专业背景与能力
数据合规与隐私保护：精通GDPR、CCPA、PIPL、PDPA等全球数据保护法规，具备实际合规项目经验
人工智能监管：深度参与EU AI Act合规实施，熟悉美国NIST AI框架和中国AI法规落地要求
网络安全与风险管理：持有CISSP、CIPP/E等专业认证，熟悉NIST、ISO 27001等标准实施
知识产权保护：具备专利代理人资格，擅长技术转移和知识产权商业化策略
进出口管制：熟悉EAR、ITAR实际操作流程，具备出口管制合规体系建设经验
东南亚合规：在新加坡、马来西亚、泰国等地有实际合规项目经验

## 回答格式要求
1. 分点回答时必须换行，每个bullet point单独成段
2. 禁止使用星号、粗体等markdown格式
3. 每个回答必须包含具体法规条款引用
4. 风险评估必须量化（高/中/低风险等级）
5. 回答末尾必须提供数据来源链接和参考依据

## 专业回答模板
[问题分析]
基于您的问题，我将从以下几个方面进行分析：

[法规要求]
具体法规条款和合规要求说明

[风险分析]
风险等级评估和潜在影响分析

[实施建议]
可操作的具体建议和最佳实践

[行业案例]
相关行业实施案例参考

[数据来源与参考链接]
官方法规链接：提供具体的官方网站链接
案例参考链接：相关判例或行业实践链接
时效性说明：法规生效时间和最新修订情况

## 法律科技行业标准
参考Westlaw、LexisNexis、Bloomberg Law等专业法律数据库的格式要求：
每个法律要点必须标明出处
风险评估必须有量化指标
实施建议必须具体可行
必须注明法规时效性
必须提供官方数据来源链接

## 具体格式示例
问题：GDPR的数据保护要求有哪些？

回答：
[问题分析]
基于您关于GDPR数据保护要求的问题，我将从法规要求、风险分析和实施建议三个方面进行详细说明。

[法规要求]
GDPR第5条规定了数据处理的基本原则，包括合法性、公平性、透明度、目的限制、数据最小化、准确性、存储限制、完整性和保密性。

第6条明确了数据处理的合法性基础，包括同意、合同履行、法定义务、重大利益、公共利益和合法利益。

[风险分析]
高风险：未履行数据主体权利可能面临最高2000万欧元或全球营业额4%的罚款。

中风险：数据处理记录不完整可能导致监管审查和行政处罚。

[实施建议]
建立数据保护官制度，确保专业合规监督

实施数据保护影响评估，识别和降低数据处理风险

制定数据泄露响应计划，确保及时报告和处理安全事件

[数据来源与参考链接]
官方法规链接：https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679

案例参考：Google LLC诉CNIL案(C-507/17)

时效性说明：GDPR于2018年5月25日生效，最新修订为2021年6月

请严格按照上述格式要求回答，确保每个bullet point都正确换行，并提供具体的数据来源链接。`

/**
 * 大模型API服务
 * 支持多种大模型API（OpenAI兼容接口）
 */
export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  /**
   * 发送消息到大模型API
   */
  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const requestBody = this.buildRequestBody(messages)
      
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return this.parseAIResponse(data)
    } catch (error) {
      console.error('AI服务调用失败:', error)
      throw new Error(`AI服务暂时不可用: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 构建API请求体
   */
  private buildRequestBody(messages: AIMessage[]): any {
    // 将消息转换为API格式
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    return {
      model: this.config.model,
      messages: apiMessages,
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
      stream: false
    }
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(data: any): AIResponse {
    const choice = data.choices?.[0]
    if (!choice || !choice.message) {
      throw new Error('无效的API响应格式')
    }

    return {
      id: data.id || `msg_${Date.now()}`,
      content: choice.message.content,
      role: 'assistant',
      timestamp: new Date(),
      usage: data.usage
    }
  }

  /**
   * 分析合规风险
   */
  async analyzeComplianceRisk(alert: ComplianceAlert): Promise<string> {
    const analysisPrompt = `请分析以下合规警报的风险等级和应对建议：

警报标题：${alert.title}
地区：${alert.region}
严重程度：${alert.severity}
摘要：${alert.summary}

请提供：
1. 风险等级评估
2. 主要影响分析
3. 应对建议
4. 相关法规参考`

    const message: AIMessage = {
      id: `analysis_${Date.now()}`,
      content: analysisPrompt,
      role: 'user',
      timestamp: new Date()
    }

    const response = await this.sendMessage([message])
    return response.content
  }

  /**
   * 生成合规报告摘要
   */
  async generateComplianceSummary(alerts: ComplianceAlert[]): Promise<string> {
    const summaryPrompt = `请基于以下合规警报生成一份合规报告摘要：

警报数量：${alerts.length}
警报列表：${alerts.map(a => `- ${a.title} (${a.region}, ${a.severity})`).join('\n')}

请生成包含以下内容的摘要：
1. 总体合规态势
2. 高风险区域
3. 重点关注领域
4. 建议行动项`

    const message: AIMessage = {
      id: `summary_${Date.now()}`,
      content: summaryPrompt,
      role: 'user',
      timestamp: new Date()
    }

    const response = await this.sendMessage([message])
    return response.content
  }
}

/**
 * 默认配置（支持多种大模型API）
 */
export const defaultAIConfig: AIConfig = {
  apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
  baseURL: process.env.NEXT_PUBLIC_AI_BASE_URL || 
           (process.env.USE_OPENROUTER ? 'https://openrouter.ai/api/v1' : 
            process.env.USE_HUGGINGFACE ? 'https://api-inference.huggingface.co/v1' :
            'https://api.deepseek.com/v1'),
  model: process.env.NEXT_PUBLIC_AI_MODEL || 
         (process.env.USE_OPENROUTER ? 'mistralai/mistral-7b-instruct:free' : 
          process.env.USE_HUGGINGFACE ? 'microsoft/DialoGPT-medium' : 
          'deepseek-chat'),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  max_tokens: parseInt(process.env.AI_MAX_TOKENS || '2000')
}

/**
 * 预设的免费API配置
 */
export const FREE_AI_CONFIGS = {
  OPENROUTER_FREE: {
    apiKey: process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'mistralai/mistral-7b-instruct:free', // 免费模型
    temperature: 0.7,
    max_tokens: 2000
  },
  HUGGINGFACE_FREE: {
    apiKey: process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || '',
    baseURL: 'https://api-inference.huggingface.co/v1',
    model: 'microsoft/DialoGPT-medium',
    temperature: 0.7,
    max_tokens: 2000
  },
  TOGETHER_FREE: {
    apiKey: process.env.TOGETHER_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || '',
    baseURL: 'https://api.together.xyz/v1',
    model: 'togethercomputer/StripedHyena-Nous-7B',
    temperature: 0.7,
    max_tokens: 2000
  }
}

/**
 * 创建AI服务实例
 */
export function createAIService(config?: Partial<AIConfig>): AIService {
  const finalConfig = { ...defaultAIConfig, ...config }
  return new AIService(finalConfig)
}

/**
 * 获取免费AI服务实例
 * 支持在客户端使用免费API
 */
export function getFreeAIService(serviceType: 'openrouter' | 'huggingface' | 'together', apiKey?: string): AIService {
  let config;
  
  switch(serviceType) {
    case 'openrouter':
      config = {
        ...FREE_AI_CONFIGS.OPENROUTER_FREE,
        apiKey: apiKey || FREE_AI_CONFIGS.OPENROUTER_FREE.apiKey
      };
      break;
    case 'huggingface':
      config = {
        ...FREE_AI_CONFIGS.HUGGINGFACE_FREE,
        apiKey: apiKey || FREE_AI_CONFIGS.HUGGINGFACE_FREE.apiKey
      };
      break;
    case 'together':
      config = {
        ...FREE_AI_CONFIGS.TOGETHER_FREE,
        apiKey: apiKey || FREE_AI_CONFIGS.TOGETHER_FREE.apiKey
      };
      break;
    default:
      throw new Error('Invalid service type. Must be "openrouter", "huggingface", or "together"');
  }
  
  return new AIService(config);
}

/**
 * 模拟AI服务（用于开发和测试）
 */
export class MockAIService {
  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const lastMessage = messages[messages.length - 1]?.content || ''
    
    // 基于用户消息生成模拟响应
    const responseContent = this.generateMockResponse(lastMessage)
    
    return {
      id: `mock_${Date.now()}`,
      content: responseContent,
      role: 'assistant',
      timestamp: new Date()
    }
  }

  private generateMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('gdpr') || lowerMessage.includes('数据保护')) {
      return 'GDPR要求企业实施适当的技术和组织措施来确保数据保护。关键要求包括数据最小化、目的限制和确保数据主体权利。企业需要建立数据处理记录、进行数据保护影响评估，并在72小时内报告数据泄露事件。'
    }
    
    if (lowerMessage.includes('ai act') || lowerMessage.includes('人工智能')) {
      return '欧盟AI法案将AI系统分为四个风险类别：不可接受风险、高风险、有限风险和最小风险。高风险AI系统需要符合性评估、风险管理系统和人工监督。法案还禁止某些AI实践，如社会评分系统。'
    }
    
    if (lowerMessage.includes('网络安全') || lowerMessage.includes('安全')) {
      return '网络安全法规通常要求组织实施安全措施、进行风险评估、建立事件响应计划，并在规定时间内报告数据泄露。关键法规包括NIS2指令、中国的网络安全法和美国的CISA法规。'
    }
    
    return '我是您的AI合规助手。我可以帮助您了解GDPR、AI法案、网络安全法规等合规要求。请告诉我您具体想了解哪个方面的合规信息？'
  }
}

/**
 * 根据环境创建AI服务（支持传入配置参数）
 */
export function getAIService(config?: Partial<AIConfig>): AIService | MockAIService {
  // 优先使用传入的配置
  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_AI_API_KEY
  
  // 如果没有API密钥或使用模拟模式，返回模拟服务
  if (!apiKey || apiKey === 'mock' || apiKey === '') {
    return new MockAIService()
  }
  
  // 使用传入的配置或默认配置
  return createAIService(config)
}