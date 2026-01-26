'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Download, Upload, Settings, AlertCircle } from 'lucide-react'
import { AIMessage, getAIService } from '@/lib/ai-service'

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: '您好！我是您的AI合规助手。今天我可以如何帮助您处理法规合规问题？',
      role: 'assistant',
      timestamp: new Date()
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

  // 只在客户端加载localStorage配置
  useEffect(() => {
    const loadConfigFromStorage = () => {
      if (typeof window !== 'undefined') {
        setApiConfig({
          apiKey: localStorage.getItem('ai_api_key') || '',
          baseURL: localStorage.getItem('ai_base_url') || 'https://api.deepseek.com/v1',
          model: localStorage.getItem('ai_model') || 'deepseek-chat',
          temperature: parseFloat(localStorage.getItem('ai_temperature') || '0.7'),
          maxTokens: parseInt(localStorage.getItem('ai_max_tokens') || '2000')
        })
      }
    }

    loadConfigFromStorage()
  }, [])

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
      // 使用AI服务发送消息
      const aiService = getAIService({
        apiKey: apiConfig.apiKey,
        baseURL: apiConfig.baseURL,
        model: apiConfig.model,
        temperature: apiConfig.temperature,
        max_tokens: apiConfig.maxTokens
      })
      const assistantMessage = await aiService.sendMessage([...messages, userMessage])
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('AI服务调用失败:', err)
      setError(err instanceof Error ? err.message : 'AI服务暂时不可用')
      
      // 显示错误消息
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        content: '抱歉，AI服务暂时不可用。请检查您的API配置或稍后重试。',
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

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Assistant</h1>
        <p className="text-base text-muted-foreground">Get AI-powered compliance insights and assistance</p>
      </div>

      {showSettings && (
        <div className="absolute top-20 right-4 z-50 bg-card/95 border border-border rounded-lg p-4 max-w-md shadow-lg backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground mb-3">API Configuration</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
              <input
                type="password"
                value={apiConfig.apiKey}
                onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
              />
            </div>
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
                setShowSettings(false)
                
                // 显示保存成功提示
                alert('API配置已保存！现在可以开始与AI助手对话了。')
              }}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        </div>
      )}

      {/* 聊天界面 */}
      <div className="relative flex flex-col h-[600px] rounded-xl bg-card border border-border">
        {/* 聊天头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Compliance Assistant</h2>
              <p className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_AI_API_KEY ? 'Connected to AI service' : 'Demo mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className="px-3 py-1.5 rounded-md border border-border bg-transparent text-muted-foreground hover:bg-secondary transition-colors text-sm"
            >
              Clear Chat
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-md border border-border hover:bg-secondary transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-md hover:bg-secondary transition-colors">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary border border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'assistant' && <Bot className="h-4 w-4" />}
                  {message.role === 'user' && <User className="h-4 w-4" />}
                  <span className="text-xs">
                    {message.role === 'assistant' ? 'Assistant' : 'You'}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-secondary border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs">Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your question..."
              className="flex-1 px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}