'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Download, Upload, Settings, AlertCircle } from 'lucide-react'
import { AIMessage, getAIService, AIConfig } from '@/lib/ai-service'
import { AISmartServiceManager, getSmartAIService } from '@/lib/ai-smart-service'
import { StrictSaveManager } from '@/lib/strict-save-manager'
import EditableOutput from '@/components/editable-output'
import { AIRole, RiskAnalysisResult, ChatResponse, EditableAnalysisData } from '@/types/ai-types'

type TabType = 'chat' | 'analysis'

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: 'Hello! I am your AI compliance assistant. How can I help you with regulatory compliance issues today?',
      role: 'assistant',
      timestamp: new Date(0) // 使用固定时间避免hydration错误
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000
  })
  
  // 免费API配置状态
  const [useFreeAPI, setUseFreeAPI] = useState<'none' | 'openrouter' | 'huggingface' | 'together'>('none')

  // Risk Analysis Tool状态 - 使用新的AI系统
  const [inputText, setInputText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<EditableAnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 只在客户端加载localStorage配置
  useEffect(() => {
    const loadConfigFromStorage = () => {
      if (typeof window !== 'undefined') {
        // 加载API配置
        const storedApiKey = localStorage.getItem('ai_api_key') || ''
        const storedBaseURL = localStorage.getItem('ai_base_url') || 'https://api.deepseek.com/v1'
        const storedModel = localStorage.getItem('ai_model') || 'deepseek-chat'
        
        // 检查是否使用免费API
        const storedUseFreeAPI = localStorage.getItem('use_free_api') as 'none' | 'openrouter' | 'huggingface' | 'together' || 'none'
        
        setUseFreeAPI(storedUseFreeAPI)
        
        // 如果使用免费API，则使用预设配置
        if (storedUseFreeAPI !== 'none') {
          setApiConfig({
            apiKey: storedApiKey,
            baseURL: getFreeAPIBaseURL(storedUseFreeAPI),
            model: getFreeAPIModel(storedUseFreeAPI),
            temperature: parseFloat(localStorage.getItem('ai_temperature') || '0.7'),
            maxTokens: parseInt(localStorage.getItem('ai_max_tokens') || '2000')
          })
        } else {
          // 使用传统配置
          setApiConfig({
            apiKey: storedApiKey,
            baseURL: storedBaseURL,
            model: storedModel,
            temperature: parseFloat(localStorage.getItem('ai_temperature') || '0.7'),
            maxTokens: parseInt(localStorage.getItem('ai_max_tokens') || '2000')
          })
        }
      }
    }

    loadConfigFromStorage()
  }, [])
  
  // 获取免费API的基础URL
  const getFreeAPIBaseURL = (service: 'openrouter' | 'huggingface' | 'together'): string => {
    switch(service) {
      case 'openrouter':
        return 'https://openrouter.ai/api/v1'
      case 'huggingface':
        return 'https://api-inference.huggingface.co/v1'
      case 'together':
        return 'https://api.together.xyz/v1'
      default:
        return 'https://api.deepseek.com/v1'
    }
  }
  
  // 获取免费API的模型
  const getFreeAPIModel = (service: 'openrouter' | 'huggingface' | 'together'): string => {
    switch(service) {
      case 'openrouter':
        return 'mistralai/mistral-7b-instruct:free'
      case 'huggingface':
        return 'microsoft/DialoGPT-medium'
      case 'together':
        return 'togethercomputer/StripedHyena-Nous-7B'
      default:
        return 'deepseek-chat'
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      let aiService;
      
      // 根据配置决定使用哪种AI服务
      if (useFreeAPI !== 'none' && apiConfig.apiKey) {
        // 使用免费API服务
        const { getFreeAIService } = await import('@/lib/ai-service');
        aiService = getFreeAIService(useFreeAPI, apiConfig.apiKey);
      } else {
        // 使用传统AI服务
        aiService = getAIService({
          apiKey: apiConfig.apiKey,
          baseURL: apiConfig.baseURL,
          model: apiConfig.model,
          temperature: apiConfig.temperature,
          max_tokens: apiConfig.maxTokens
        });
      }
      
      const assistantMessage = await aiService.sendMessage([...messages, userMessage])
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('AI服务调用失败:', err)
      setError(err instanceof Error ? err.message : 'AI service temporarily unavailable')
      
      // 显示错误消息
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, AI service is temporarily unavailable. Please check your API configuration or try again later.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your AI compliance assistant. How can I help you with regulatory compliance today?',
        role: 'assistant',
        timestamp: new Date()
      }
    ])
    setError(null)
  }

  // 检查是否有字段错误
  const hasFieldErrors = (analysisResult: EditableAnalysisData): boolean => {
    return Object.keys(analysisResult).some(key => 
      key.endsWith('Error') && analysisResult[key] === true
    )
  }

  // 过滤提取的数据，只保留UI需要的字段
  const filterExtractedData = (extractedData: any, contentType: string) => {
    const allowedFields = {
      case: [
        'id', 'title', 'court', 'jurisdiction', 'caseType', 'filingDate',
        'status', 'parties', 'description', 'impactLevel',
        'source_url', 'outcome', 'key_issues'
      ],
      regulation: [
        'id', 'region', 'severity', 'title', 'summary', 
        'timestamp', 'source_url', 'category'
      ]
    }
    
    const fields = allowedFields[contentType as keyof typeof allowedFields] || []
    const filteredData: any = {}
    
    // 只保留允许的字段
    fields.forEach(field => {
      if (extractedData[field] !== undefined) {
        filteredData[field] = extractedData[field]
      }
    })
    
    return filteredData
  }

  // 风险分析处理函数 - 使用新的AI系统
  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setError(null)
    
    try {
      // 检查API配置
      if (!apiConfig.apiKey) {
        throw new Error('Please configure AI API key first')
      }
      
      let aiConfigObj: AIConfig;
      
      // 根据配置决定使用哪种AI服务
      if (useFreeAPI !== 'none') {
        // 使用免费API配置
        aiConfigObj = {
          apiKey: apiConfig.apiKey,
          baseURL: getFreeAPIBaseURL(useFreeAPI),
          model: getFreeAPIModel(useFreeAPI),
          temperature: apiConfig.temperature,
          max_tokens: apiConfig.maxTokens
        };
      } else {
        // 使用传统配置
        aiConfigObj = {
          apiKey: apiConfig.apiKey,
          baseURL: apiConfig.baseURL,
          model: apiConfig.model,
          temperature: apiConfig.temperature,
          max_tokens: apiConfig.maxTokens
        };
      }
      
      // Use new AI smart service
      const riskAnalyzer = getSmartAIService(aiConfigObj, 'risk-analyzer')
      const result = await riskAnalyzer.processInput(inputText)
      
      if (result.role === 'risk-analyzer') {
        const riskResult = result as RiskAnalysisResult
        
        // 过滤和转换数据，只保留UI需要的字段
        const filteredExtractedData = filterExtractedData(riskResult.extractedData, riskResult.contentType)
        
        // 转换为可编辑数据格式
        const editableData: EditableAnalysisData = {
          contentType: riskResult.contentType,
          extractedData: filteredExtractedData,
          riskAssessment: riskResult.riskAssessment,
          confidence: riskResult.confidence,
          analysisSummary: riskResult.analysisSummary
        }
        
        setAnalysisResult(editableData)
      } else {
        throw new Error('AI响应格式错误')
      }
      
    } catch (error) {
      console.error('AI风险分析失败:', error)
      setError(`风险分析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 保存到数据库函数 - 使用新的严格保存管理器
  const saveToDatabase = async () => {
    if (!analysisResult) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      const saveManager = new StrictSaveManager()
      const saveResult = await saveManager.strictSaveToDatabase(
        analysisResult.extractedData,
        analysisResult.contentType
      )
      
      if (saveResult.success) {
        // 显示保存成功提示，并提示用户刷新页面查看更新
        const shouldRefresh = confirm(`✅ ${saveResult.message}\n\nData saved successfully! Refresh page to view updates?`)
        
        if (shouldRefresh) {
          // 刷新页面以更新UI
          window.location.reload()
        } else {
          // 清空界面，准备下一次分析
          setInputText('')
          setAnalysisResult(null)
        }
        
        console.log('保存的数据:', saveResult.data)
      } else {
        if (saveResult.cannotSave) {
          // 无法保存的错误（缺少必需字段）
          setError(`❌ Cannot save: ${saveResult.error}`)
        } else {
          // 可重试的错误
          setError(`⚠️ Save failed: ${saveResult.error}`)
        }
      }
      
    } catch (error) {
      setError(`保存过程出错: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsSaving(false)
    }
  }

  // 渲染选项卡内容
  const renderTabContent = () => {
    if (activeTab === 'analysis') {
      return (
        <div className="relative">
          {/* Risk Analysis Tool界面 - 使用新的可编辑输出组件 */}
          <div className="space-y-6">
            {/* 输入区域 */}
            <div className="bg-card border border-border rounded-tr-xl rounded-br-xl rounded-bl-xl p-6">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter legal text for risk analysis..."
                  className="w-full h-40 px-4 py-3 bg-transparent text-foreground focus:outline-none resize-none placeholder:text-muted-foreground border border-border rounded-lg"
                  disabled={isAnalyzing}
                />
                {/* Analyze Risk按钮 */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="absolute bottom-4 right-4 px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Risk'}
                </button>
              </div>
            </div>

            {/* 输出区域 - 使用可编辑输出组件 */}
            {analysisResult && (
              <div className="space-y-4">
                <EditableOutput
                  analysisResult={analysisResult}
                  onDataChange={setAnalysisResult}
                />
                
                {/* 保存按钮 */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setInputText('')
                      setAnalysisResult(null)
                    }}
                    className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reanalyze
                  </button>
                  <button
                    onClick={saveToDatabase}
                    disabled={!analysisResult || isSaving || hasFieldErrors(analysisResult)}
                    className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save to Database'}
                  </button>
                </div>
              </div>
            )}
            
            {/* 分析中状态 */}
            {isAnalyzing && !analysisResult && (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <p className="text-muted-foreground mt-3">AI is analyzing legal text, please wait...</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <>
        {/* 错误提示 */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          </div>
        )}

        {/* iMessage风格聊天界面 */}
         <div className="relative">
           {/* Clear Chat按钮 - 右上角 */}
           <div className="absolute top-4 right-4 z-10">
             <button 
               onClick={clearChat}
               className="px-3 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary transition-colors text-sm shadow-sm"
             >
               Clear Chat
             </button>
           </div>

           {/* 对话卡片 - 书签效果，严格对齐 */}
           <div className="flex flex-col h-[600px] bg-card border border-border rounded-tl-none rounded-tr-xl rounded-br-xl rounded-bl-xl mt-0">
             {/* 聊天消息区域 - iMessage风格 */}
             <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-12">
               {messages.map((message) => (
                 <div
                   key={message.id}
                   className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                   <div
                     className={`max-w-[80%] p-3 ${
                       message.role === 'user'
                         ? 'bg-[#007AFF] text-white rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-xl'
                         : 'bg-[#E5E5EA] text-black rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-xl'
                     }`}
                   >
                     <p className="text-sm leading-relaxed">{message.content}</p>
                   </div>
                 </div>
               ))}
               {isLoading && (
                 <div className="flex justify-start">
                   <div className="max-w-[80%] p-3 bg-[#E5E5EA] text-black rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-xl">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-black/60 rounded-full animate-pulse"></div>
                       <div className="w-2 h-2 bg-black/60 rounded-full animate-pulse"></div>
                       <div className="w-2 h-2 bg-black/60 rounded-full animate-pulse"></div>
                     </div>
                   </div>
                 </div>
               )}
             </div>

             {/* 输入区域 */}
             <div className="p-4">
               <div className="flex items-end gap-2">
                 <div className="flex-1 flex items-center bg-input border border-border rounded-full px-4 py-2">
                   <input
                     type="text"
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                     placeholder="Type your question..."
                     className="flex-1 bg-transparent text-foreground focus:outline-none text-sm"
                     disabled={isLoading}
                   />
                 </div>
                 <button
                   onClick={handleSendMessage}
                   disabled={isLoading || !inputMessage.trim()}
                   className="p-2 rounded-full bg-[#007AFF] text-white hover:bg-[#0056CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   <Send className="h-4 w-4" />
                 </button>
               </div>
             </div>
           </div>
         </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">Get AI-powered compliance insights and assistance</p>
        </div>

        {/* 选项卡和设置按钮 - 同一行 */}
        <div className="flex items-center justify-between mb-0 relative">
          {/* 选项卡 */}
          <div className="flex gap-0">
            {/* Chat Assistant标签 */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-tl-xl rounded-tr-xl border border-border ${
                activeTab === 'chat' 
                  ? 'bg-card text-foreground border-b-0' 
                  : 'bg-background text-muted-foreground hover:bg-secondary/50'
              } transition-colors`}
            >
              Chat Assistant
            </button>
            
            {/* Risk Analysis Tool标签 */}
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 rounded-tl-xl rounded-tr-xl border border-border ${
                activeTab === 'analysis' 
                  ? 'bg-card text-foreground border-b-0' 
                  : 'bg-background text-muted-foreground hover:bg-secondary/50'
              } transition-colors`}
            >
              Risk Analysis Tool
            </button>
          </div>
          
          {/* 设置按钮 - 与标签框同一行 */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-transparent text-muted-foreground hover:text-[#007AFF] transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* 设置面板 - 独立于标签页内容 */}
        {showSettings && (
          <div className="absolute top-32 right-4 z-50 bg-card/95 border border-border rounded-lg p-4 max-w-md shadow-lg backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-foreground mb-3">API Configuration</h2>
            <div className="space-y-3">
              {/* 免费API选择 */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Use Free API</label>
                <select
                  value={useFreeAPI}
                  onChange={(e) => {
                    const value = e.target.value as 'none' | 'openrouter' | 'huggingface' | 'together';
                    setUseFreeAPI(value);
                    
                    // 如果选择了免费API，则自动设置相应的配置
                    if (value !== 'none') {
                      setApiConfig(prev => ({
                        ...prev,
                        baseURL: getFreeAPIBaseURL(value),
                        model: getFreeAPIModel(value)
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
                >
                  <option value="none" className="text-muted-foreground">None (Custom)</option>
                  <option value="openrouter" className="text-muted-foreground">OpenRouter (Free)</option>
                  <option value="huggingface" className="text-muted-foreground">Hugging Face (Free)</option>
                  <option value="together" className="text-muted-foreground">Together AI (Free)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder={
                    useFreeAPI === 'openrouter' ? "Enter OpenRouter API key" :
                    useFreeAPI === 'huggingface' ? "Enter Hugging Face API key" :
                    useFreeAPI === 'together' ? "Enter Together AI API key" :
                    "Enter your API key"
                  }
                  className="w-full px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
                />
              </div>
              
              {/* 显示当前选择的API信息 */}
              {useFreeAPI !== 'none' && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
                  {useFreeAPI === 'openrouter' && (
                    <div>
                      <strong>OpenRouter Free:</strong> 200 requests/day, 20 requests/min<br/>
                      Model: mistralai/mistral-7b-instruct:free<br/>
                      Register at: https://openrouter.ai/
                    </div>
                  )}
                  {useFreeAPI === 'huggingface' && (
                    <div>
                      <strong>Hugging Face Free:</strong> Limited by model<br/>
                      Model: microsoft/DialoGPT-medium<br/>
                      Register at: https://huggingface.co/inference-api
                    </div>
                  )}
                  {useFreeAPI === 'together' && (
                    <div>
                      <strong>Together AI Free:</strong> Trial credits<br/>
                      Model: togethercomputer/StripedHyena-Nous-7B<br/>
                      Register at: https://www.together.ai/
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">API Base URL</label>
                <input
                  type="text"
                  value={apiConfig.baseURL}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, baseURL: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Model</label>
                  <select
                    value={apiConfig.model}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
                  >
                    <option value="deepseek-chat" className="text-muted-foreground">DeepSeek Chat</option>
                    <option value="deepseek-coder" className="text-muted-foreground">DeepSeek Coder</option>
                    <option value="gpt-3.5-turbo" className="text-muted-foreground">GPT-3.5 Turbo</option>
                    <option value="gpt-4" className="text-muted-foreground">GPT-4</option>
                    <option value="gpt-4-turbo" className="text-muted-foreground">GPT-4 Turbo</option>
                    <option value="claude-3-sonnet" className="text-muted-foreground">Claude 3 Sonnet</option>
                    <option value="claude-3-opus" className="text-muted-foreground">Claude 3 Opus</option>
                    {useFreeAPI === 'openrouter' && (
                      <option value="mistralai/mistral-7b-instruct:free" className="text-muted-foreground">Mistral 7B Instruct (Free)</option>
                    )}
                    {useFreeAPI === 'huggingface' && (
                      <option value="microsoft/DialoGPT-medium" className="text-muted-foreground">DialoGPT Medium (Free)</option>
                    )}
                    {useFreeAPI === 'together' && (
                      <option value="togethercomputer/StripedHyena-Nous-7B" className="text-muted-foreground">StripedHyena-Nous-7B (Free)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    value={apiConfig.temperature}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
                    min="0"
                    max="2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Max Tokens</label>
                  <input
                    type="number"
                    value={apiConfig.maxTokens}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
                    min="100"
                    max="8000"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 rounded-md border border-border bg-transparent text-muted-foreground hover:bg-secondary transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // 保存API配置到localStorage
                  localStorage.setItem('ai_api_key', apiConfig.apiKey)
                  localStorage.setItem('ai_base_url', apiConfig.baseURL)
                  localStorage.setItem('ai_model', apiConfig.model)
                  localStorage.setItem('ai_temperature', apiConfig.temperature.toString())
                  localStorage.setItem('ai_max_tokens', apiConfig.maxTokens.toString())
                  localStorage.setItem('use_free_api', useFreeAPI) // 保存免费API选择
                  setShowSettings(false)
                  
                  // 显示保存成功提示
                  alert('API configuration saved! You can now start chatting with the AI assistant.')
                }}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* 选项卡内容 */}
        {renderTabContent()}
      </div>
    </div>
  )
}