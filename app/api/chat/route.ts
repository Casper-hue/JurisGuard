import { NextRequest, NextResponse } from 'next/server'

// 请求接口
export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  companyContext?: string
  model?: string
  temperature?: number
}

// 响应接口
export interface ChatResponse {
  id: string
  content: string
  role: 'assistant'
  timestamp: string
  companyContextUsed?: boolean
}

// 公司首席合规官系统提示词
const CHIEF_COMPLIANCE_OFFICER_PROMPT = (companyContext?: string) => {
  const basePrompt = `你是公司的首席合规官（CCO），拥有20年以上跨国企业合规管理经验。你的职责是确保公司在全球范围内合规经营，同时平衡业务发展与合规风险。

## 核心职责
- 深度理解公司业务模式与合规需求
- 提供精准的业务影响分析与合规建议
- 识别潜在合规风险并制定应对策略
- 确保合规建议与公司战略目标一致

## 专业能力要求
- 必须结合公司具体业务背景分析法规影响
- 提供可操作的具体建议，而非泛泛之谈
- 量化合规风险与业务机会
- 考虑不同法域间的合规差异`

  if (companyContext) {
    return `${basePrompt}

## 公司业务背景
${companyContext}

请基于以上公司业务背景，分析法规对公司具体业务的影响，提供针对性的合规建议。`
  }
  
  return basePrompt
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, companyContext, model = 'deepseek-chat', temperature = 0.7 } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    // 这里使用现有的AI服务
    const { getAIService } = await import('@/lib/ai-service')
    const aiService = getAIService()

    // 构建完整的消息列表，将系统提示词作为第一个用户消息
    const systemPrompt = CHIEF_COMPLIANCE_OFFICER_PROMPT(companyContext)
    
    // 转换消息格式为AIMessage格式
    const aiMessages = messages.map((msg, index) => ({
      id: `msg_${index}`,
      role: msg.role,
      content: msg.content,
      timestamp: new Date()
    }))

    // 如果这是第一条消息，添加系统提示词作为上下文
    if (messages.length === 1 && messages[0].role === 'user') {
      aiMessages.unshift({
        id: 'system_prompt',
        role: 'user',
        content: systemPrompt + '\n\n' + messages[0].content,
        timestamp: new Date()
      })
    } else {
      // 对于后续消息，将系统提示词添加到现有消息中
      aiMessages.forEach(msg => {
        if (msg.role === 'user') {
          msg.content = systemPrompt + '\n\n' + msg.content
        }
      })
    }

    // 调用AI服务
    const response = await aiService.sendMessage(aiMessages)

    const chatResponse: ChatResponse = {
      id: Date.now().toString(),
      content: response.content,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      companyContextUsed: !!companyContext
    }

    return NextResponse.json(chatResponse)

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}