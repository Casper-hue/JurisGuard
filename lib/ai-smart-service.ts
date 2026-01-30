import { AIConfig, AIMessage } from './ai-service'
import { AIRole, RiskAnalysisResult, ChatResponse, AIAnalysisResult } from '@/types/ai-types'

// 角色定义配置
const ROLE_DEFINITIONS = {
  'chat-assistant': {
    role: 'chat-assistant' as AIRole,
    title: '法律合规助手',
    description: '专业的法律咨询和合规指导专家',
    primaryTask: '提供法律咨询、合规建议、问题解答',
    outputFormat: '对话式回答，包含解释和建议',
    tone: '友好、专业、教育性'
  },
  'risk-analyzer': {
    role: 'risk-analyzer' as AIRole,
    title: '风险分析专家',
    description: '专业的法律风险识别和评估专家',
    primaryTask: '结构化信息提取、风险评估、数据整理',
    outputFormat: '结构化JSON数据，包含风险评估',
    tone: '严谨、客观、分析性'
  }
}

// Chat Assistant Prompt
const buildChatAssistantPrompt = (userMessage: string, conversationHistory?: string[]): string => {
  return `
# 角色定位：法律合规助手

## 核心职责
你是一个专业的法律合规助手，主要职责是：
- 提供法律咨询和解释
- 给出合规建议和操作指导  
- 解答法律相关问题
- 分析法律风险和合规要求

## 回答风格要求
- **友好专业**：语气友好但保持专业性
- **教育导向**：不仅要给出答案，还要解释法律原理
- **实用建议**：提供可操作的具体建议
- **风险提示**：明确指出潜在的法律风险

## 回答结构建议
1. **问题理解**：简要重述用户问题
2. **法律分析**：基于相关法律条文进行分析
3. **风险提示**：指出可能的法律风险
4. **合规建议**：给出具体的操作建议
5. **注意事项**：提醒需要注意的事项

## 知识范围
- 中国法律法规体系
- 企业合规要求
- 合同法律风险
- 劳动法相关规定
- 知识产权保护
- 数据隐私合规

## 当前对话
${conversationHistory ? `对话历史：\n${conversationHistory.join('\n')}\n\n` : ''}
用户问题：${userMessage}

请根据以上要求提供专业的法律合规建议。
  `
}

// Risk Analysis Tool Prompt with Risk Scoring Matrix
const buildRiskAnalysisPrompt = (text: string): string => {
  return `
# 角色定位：风险分析专家

## 核心职责
你是一个专业的法律风险分析专家，主要任务是：
- 识别文本中的法律实体和关键信息
- 进行科学的风险评估和量化评分
- 提取结构化数据用于数据库存储
- 提供详细的风险分析依据

## 分析流程
### 第一步：内容类型识别
判断文本属于：
- **案件（case）**：包含具体案件事实、当事人、法院判决等
- **法规（regulation）**：包含法律条文、行政法规、部门规章等

### 第二步：结构化信息提取
根据识别类型提取以下必需字段（必须与UI字段完全匹配）：

#### 案件（case）字段：
1. id: 案件编号（自动生成）
2. title: 案件名称
3. court: 审理法院  
4. jurisdiction: 管辖区域
5. caseType: 案件类型（民事/刑事/行政/商事/知识产权）
6. filingDate: 立案日期（YYYY-MM-DD）
7. status: 案件状态（active/settled/appealed/closed/decided）
8. parties: 当事人数组（原被告等）
9. description: 案件描述（200字内）
10. impactLevel: 影响级别（critical/high/medium/low）
11. source_url: 来源链接（如果有）
12. outcome: 案件结果（如果有）
13. key_issues: 关键问题数组（如果有）

#### 法规（regulation）字段：
1. id: 法规编号（自动生成）
2. region: 适用地区（EU/USA/China/UK/Japan等）
3. severity: 严重程度（critical/high/medium/low）
4. title: 法规名称
5. summary: 法规摘要（200字内）
6. timestamp: 发布时间（YYYY-MM-DDTHH:mm:ssZ）
7. source_url: 来源链接（如果有）
8. category: 法规类别（Data Compliance/Privacy/Security等）

### 第三步：风险量化评分（新增）
使用以下评分矩阵进行量化分析：

#### 评分维度（1-5分）：
1. **业务关联度 (Business Relevance)**：
   - 5分：直接影响公司核心业务
   - 4分：影响主要业务线
   - 3分：影响次要业务
   - 2分：轻微影响
   - 1分：无直接影响

2. **惩罚严苛度 (Penalty Severity)**：
   - 5分：可能导致刑事处罚或重大民事赔偿
   - 4分：高额罚款或禁令
   - 3分：中等罚款或限制
   - 2分：警告或小额罚款
   - 1分：无实质性惩罚

3. **合规紧急度 (Compliance Urgency)**：
   - 5分：立即生效，无过渡期
   - 4分：短期过渡期（<30天）
   - 3分：中期过渡期（30-90天）
   - 2分：长期过渡期（>90天）
   - 1分：无明确时间要求

#### 风险总分计算公式：
Score = (业务关联度 × 0.4) + (惩罚严苛度 × 0.4) + (合规紧急度 × 0.2)

#### 风险等级划分：
- **High (≥4.0)**: 高风险，需要立即关注和行动
- **Medium (2.5-3.9)**: 中等风险，需要制定应对计划
- **Low (<2.5)**: 低风险，可定期监控

### 第四步：法律术语对齐（新增）
为确保法律术语提取的准确性，必须遵循以下术语对齐规则：

#### 中国民法典术语对齐规则：
- **除斥期间 (Preclusive Period)**: 指法律规定的某种权利的存续期间，期间届满后权利消灭。特征：不适用中断、中止、延长。
- **善意取得 (Acquisition in Good Faith)**: 指善意第三人从无权处分人处取得财产所有权。要件：善意、有偿、已交付。
- **无权处分 (Unauthorized Disposition)**: 指无处分权人处分他人财产。法律后果：效力待定，需权利人追认。
- **不当得利 (Unjust Enrichment)**: 指没有合法依据取得利益，致他人受损。要件：一方获利、他方受损、无法律依据。
- **无因管理 (Negotiorum Gestio)**: 指未受委托，也无法律义务而为他人管理事务。要件：管理他人事务、有为他人谋利意思。

#### 术语提取要求：
- 当识别到上述术语时，必须在JSON中增加"legal_basis"字段
- 简述该术语的法律特征和适用条件
- 引用具体法律条文（如民法典第XXX条）
- 防止AI产生幻觉，确保术语解释的准确性

### 第五步：科学风险评估
使用以下标准进行风险评估：

#### 案件风险评估（impactLevel）：
- **critical**: 标的额>1亿、重大法律原则、系统性风险
- **high**: 标的额1000万-1亿、重要法律问题、较大影响
- **medium**: 标的额100万-1000万、常规争议、中等影响  
- **low**: 标的额<100万、简单问题、有限影响

#### 法规严重程度（severity）：
- **critical**: 宪法性法律、基本法律、国家安全相关
- **high**: 重要行政法规、跨行业监管、广泛适用
- **medium**: 地方性法规、一般规章、特定范围
- **low**: 通知公告、内部规定、短期有效

## 输出格式要求
返回严格的JSON格式：

{
  "role": "risk-analyzer",
  "contentType": "case" 或 "regulation",
  "extractedData": {
    // 对应类型的字段
  },
  "riskAssessment": {
    "level": "critical/high/medium/low",
    "quantitativeScore": {
      "businessRelevance": 1-5,
      "penaltySeverity": 1-5,
      "complianceUrgency": 1-5,
      "totalScore": 1-5,
      "riskLevel": "High/Medium/Low"
    },
    "reasoning": "详细的风险评估理由",
    "factors": ["标的额", "法律重要性", "社会影响", "时效性"],
    "confidence": 0.95
  },
  "analysisSummary": "简要的分析总结",
  "confidence": 0.95
}

## 待分析文本
${text}
  `
}

// AI智能服务管理器
export class AISmartServiceManager {
  private config: AIConfig
  private role: AIRole

  constructor(config: AIConfig, role: AIRole) {
    this.config = config
    this.role = role
  }

  async processInput(input: string, context?: any): Promise<AIAnalysisResult> {
    let prompt: string
    
    if (this.role === 'chat-assistant') {
      prompt = buildChatAssistantPrompt(input, context?.conversationHistory)
    } else {
      prompt = buildRiskAnalysisPrompt(input)
    }
    
    const response = await this.callAI(prompt)
    
    // 根据角色处理响应
    if (this.role === 'risk-analyzer') {
      return this.processRiskAnalysisResponse(response)
    } else {
      return this.processChatResponse(response)
    }
  }

  private async callAI(prompt: string): Promise<string> {
    try {
      // 使用现有的AI服务调用
      const response = await fetch(this.config.baseURL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.max_tokens
        })
      })

      if (!response.ok) {
        throw new Error(`AI服务调用失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('AI调用错误:', error)
      throw new Error(`AI服务暂时不可用: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private processRiskAnalysisResponse(response: string): RiskAnalysisResult {
    try {
      // 清理AI响应中的markdown代码块格式
      const cleanedResponse = this.cleanAIResponse(response)
      
      const result = JSON.parse(cleanedResponse)
      
      // 验证角色一致性
      if (result.role !== 'risk-analyzer') {
        throw new Error('响应角色不匹配')
      }
      
      // 验证必需字段
      this.validateRiskAnalysisResult(result)
      
      return result
    } catch (error) {
      throw new Error(`风险分析响应解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 清理AI响应中的markdown格式
  private cleanAIResponse(response: string): string {
    // 移除markdown代码块标记
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    // 移除可能的其他markdown格式
    cleaned = cleaned.replace(/\*\*([^*]*)\*\*/g, '$1') // 移除粗体
    cleaned = cleaned.replace(/\*([^*]*)\*/g, '$1')     // 移除斜体
    cleaned = cleaned.replace(/`([^`]*)`/g, '$1')        // 移除行内代码
    
    // 移除多余的空格和换行
    cleaned = cleaned.trim()
    
    // 如果响应以JSON开头，尝试提取JSON部分
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }
    
    return cleaned
  }

  private processChatResponse(response: string): ChatResponse {
    return {
      role: 'chat-assistant',
      content: response,
      timestamp: new Date().toISOString()
    }
  }

  private validateRiskAnalysisResult(result: any): void {
    if (!result.contentType || !['case', 'regulation'].includes(result.contentType)) {
      throw new Error('内容类型识别失败')
    }
    
    if (!result.extractedData) {
      throw new Error('提取数据为空')
    }
    
    // 验证必需字段
    const requiredFields = this.getRequiredFields(result.contentType)
    const missingFields = requiredFields.filter(field => 
      !result.extractedData[field] || result.extractedData[field] === ''
    )
    
    if (missingFields.length > 0) {
      throw new Error(`缺少必需字段: ${missingFields.join(', ')}`)
    }
  }

  private getRequiredFields(contentType: string): string[] {
    return contentType === 'case' 
      ? ['title', 'court', 'jurisdiction', 'caseType', 'filingDate', 'status', 'parties', 'description', 'impactLevel']
      : ['title', 'region', 'severity', 'summary', 'timestamp']
  }

  // 获取角色定义
  getRoleDefinition() {
    return ROLE_DEFINITIONS[this.role]
  }
}

// 工厂函数
export function getSmartAIService(config: AIConfig, role: AIRole): AISmartServiceManager {
  return new AISmartServiceManager(config, role)
}