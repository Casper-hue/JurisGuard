// AI角色定义
export type AIRole = 'chat-assistant' | 'risk-analyzer'

// 角色配置接口
export interface AIRoleDefinition {
  role: AIRole
  title: string
  description: string
  primaryTask: string
  outputFormat: string
  tone: string
}

// 风险分析结果接口
export interface RiskAnalysisResult {
  role: 'risk-analyzer'
  contentType: 'case' | 'regulation'
  extractedData: {
    // Common fields for both case and regulation
    id?: string
    title?: string
    source_url?: string
    
    // Case specific fields (matching UI exactly)
    court?: string
    jurisdiction?: string
    caseType?: string
    filingDate?: string
    status?: 'active' | 'settled' | 'appealed' | 'closed' | 'decided'
    parties?: string[]
    description?: string
    impactLevel?: 'critical' | 'high' | 'medium' | 'low'
    outcome?: string
    key_issues?: string[]
    
    // Regulation specific fields (matching UI exactly)
    region?: string
    severity?: 'critical' | 'high' | 'medium' | 'low'
    summary?: string
    timestamp?: string
    category?: string
  }
  riskAssessment: {
    level: 'critical' | 'high' | 'medium' | 'low'
    reasoning: string
    factors: string[]
    confidence: number
  }
  analysisSummary: string
  confidence: number
}

// 聊天助手响应接口
export interface ChatResponse {
  role: 'chat-assistant'
  content: string
  timestamp: string
}

// AI分析结果联合类型
export type AIAnalysisResult = RiskAnalysisResult | ChatResponse

// 可编辑数据接口
export interface EditableAnalysisData {
  contentType: 'case' | 'regulation'
  extractedData: any
  riskAssessment: {
    level: 'critical' | 'high' | 'medium' | 'low'
    reasoning: string
    factors: string[]
    confidence: number
  }
  confidence: number
  [key: string]: any // 允许错误字段
}

// 保存结果接口
export interface SaveResult {
  success: boolean
  error?: string
  message?: string
  data?: any
  cannotSave?: boolean
}