'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Download, Upload, Settings, AlertCircle, Building } from 'lucide-react'
import { AIMessage, getAIService, AIConfig } from '@/lib/ai-service'
import { AISmartServiceManager, getSmartAIService } from '@/lib/ai-smart-service'
import { StrictSaveManager } from '@/lib/strict-save-manager'
import EditableOutput from '@/components/editable-output'
import { AIRole, RiskAnalysisResult, ChatResponse, EditableAnalysisData } from '@/types/ai-types'

type TabType = 'chat' | 'analysis' | 'company'

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: 'Hello! I am your AI compliance assistant. How can I help you with regulatory compliance issues today?',
      role: 'assistant',
      timestamp: new Date(0)
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState('')
  
  // API Configuration State
  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000
  })
  
  const [useFreeAPI, setUseFreeAPI] = useState<'none' | 'openrouter' | 'huggingface' | 'together'>('none')

  // Risk Analysis Tool State
  const [inputText, setInputText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<EditableAnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load configuration from localStorage on client side
  useEffect(() => {
    const loadConfigFromStorage = () => {
      if (typeof window !== 'undefined') {
        // Load API configuration
        const storedApiKey = localStorage.getItem('ai_api_key') || ''
        const storedBaseURL = localStorage.getItem('ai_base_url') || 'https://api.deepseek.com/v1'
        const storedModel = localStorage.getItem('ai_model') || 'deepseek-chat'
        
        // Load company profile
        const storedCompanyProfile = localStorage.getItem('company_profile') || ''
        setCompanyProfile(storedCompanyProfile)
        
        // Check if using free API
        const storedUseFreeAPI = localStorage.getItem('use_free_api') as 'none' | 'openrouter' | 'huggingface' | 'together' || 'none'
        setUseFreeAPI(storedUseFreeAPI)
        
        if (storedUseFreeAPI !== 'none') {
          setApiConfig({
            apiKey: storedApiKey,
            baseURL: getFreeAPIBaseURL(storedUseFreeAPI),
            model: getFreeAPIModel(storedUseFreeAPI),
            temperature: parseFloat(localStorage.getItem('ai_temperature') || '0.7'),
            maxTokens: parseInt(localStorage.getItem('ai_max_tokens') || '2000')
          })
        } else {
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

  // Save company profile to localStorage
  const saveCompanyProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_profile', companyProfile)
      alert('Company profile saved successfully!')
    }
  }

  // Free API configuration helpers
  const getFreeAPIBaseURL = (service: 'openrouter' | 'huggingface' | 'together'): string => {
    switch(service) {
      case 'openrouter': return 'https://openrouter.ai/api/v1'
      case 'huggingface': return 'https://api-inference.huggingface.co/v1'
      case 'together': return 'https://api.together.xyz/v1'
      default: return 'https://api.deepseek.com/v1'
    }
  }

  const getFreeAPIModel = (service: 'openrouter' | 'huggingface' | 'together'): string => {
    switch(service) {
      case 'openrouter': return 'mistralai/mistral-7b-instruct:free'
      case 'huggingface': return 'microsoft/DialoGPT-medium'
      case 'together': return 'togethercomputer/StripedHyena-Nous-7B'
      default: return 'deepseek-chat'
    }
  }

  // Chat functionality using new API with company context
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
      // Use new chat API with company context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          companyContext: companyProfile,
          model: apiConfig.model,
          temperature: apiConfig.temperature
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const chatResponse: ChatResponse = await response.json()
      
      const assistantMessage: AIMessage = {
        id: Date.now().toString(),
        content: chatResponse.content,
        role: 'assistant',
        timestamp: new Date(chatResponse.timestamp)
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat API error:', err)
      setError(err instanceof Error ? err.message : 'Chat service temporarily unavailable')
      
      // Fallback to existing AI service
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, chat service is temporarily unavailable. Please check your API configuration or try again later.',
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

  // Risk analysis functionality (existing implementation)
  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setError(null)
    
    try {
      if (!apiConfig.apiKey) {
        throw new Error('Please configure AI API key first')
      }
      
      let aiConfigObj: AIConfig;
      
      if (useFreeAPI !== 'none') {
        aiConfigObj = {
          apiKey: apiConfig.apiKey,
          baseURL: getFreeAPIBaseURL(useFreeAPI),
          model: getFreeAPIModel(useFreeAPI),
          temperature: apiConfig.temperature,
          max_tokens: apiConfig.maxTokens
        };
      } else {
        aiConfigObj = {
          apiKey: apiConfig.apiKey,
          baseURL: apiConfig.baseURL,
          model: apiConfig.model,
          temperature: apiConfig.temperature,
          max_tokens: apiConfig.maxTokens
        };
      }
      
      const riskAnalyzer = getSmartAIService(aiConfigObj, 'risk-analyzer')
      const result = await riskAnalyzer.processInput(inputText)
      
      if (result.role === 'risk-analyzer') {
        const riskResult = result as RiskAnalysisResult
        const filteredExtractedData = filterExtractedData(riskResult.extractedData, riskResult.contentType)
        
        const editableData: EditableAnalysisData = {
          contentType: riskResult.contentType,
          extractedData: filteredExtractedData,
          riskAssessment: riskResult.riskAssessment,
          confidence: riskResult.confidence,
          analysisSummary: riskResult.analysisSummary
        }
        
        setAnalysisResult(editableData)
      } else {
        throw new Error('AI response format error')
      }
      
    } catch (error) {
      console.error('AI risk analysis failed:', error)
      setError(`Risk analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper functions
  const hasFieldErrors = (analysisResult: EditableAnalysisData): boolean => {
    return Object.keys(analysisResult).some(key => 
      key.endsWith('Error') && analysisResult[key] === true
    )
  }

  const filterExtractedData = (extractedData: any, contentType: string) => {
    const allowedFields = {
      case: ['id', 'title', 'court', 'jurisdiction', 'caseType', 'filingDate', 'status', 'parties', 'description', 'impactLevel', 'source_url', 'outcome', 'key_issues'],
      regulation: ['id', 'region', 'severity', 'title', 'summary', 'timestamp', 'source_url', 'category']
    }
    
    const fields = allowedFields[contentType as keyof typeof allowedFields] || []
    const filteredData: any = {}
    
    fields.forEach(field => {
      if (extractedData[field] !== undefined) {
        filteredData[field] = extractedData[field]
      }
    })
    
    return filteredData
  }

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
        const shouldRefresh = confirm(`✅ ${saveResult.message}\n\nData saved successfully! Refresh page to view updates?`)
        
        if (shouldRefresh) {
          window.location.reload()
        } else {
          setInputText('')
          setAnalysisResult(null)
        }
      } else {
        if (saveResult.cannotSave) {
          setError(`❌ Cannot save: ${saveResult.error}`)
        } else {
          setError(`⚠️ Save failed: ${saveResult.error}`)
        }
      }
      
    } catch (error) {
      setError(`Save process error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Render tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'analysis':
        return (
          <div className="relative">
            <div className="space-y-6">
              <div className="mb-6">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter legal text for risk analysis..."
                  className="w-full h-40 px-4 py-3 bg-input text-foreground focus:outline-none resize-none placeholder:text-muted-foreground border border-border rounded-lg"
                  disabled={isAnalyzing}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText.trim()}
                    className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Risk'}
                  </button>
                </div>
              </div>

              {analysisResult && (
                <div className="space-y-4">
                  <EditableOutput
                    analysisResult={analysisResult}
                    onDataChange={setAnalysisResult}
                  />
                  
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

      case 'company':
        return (
          <div className="bg-card border border-border rounded-tr-xl rounded-br-xl rounded-bl-xl p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Company Profile Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your company profile to enable context-aware compliance analysis. 
                  The AI assistant will use this information to provide tailored recommendations.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  Company Business Description
                </label>
                <textarea
                  value={companyProfile}
                  onChange={(e) => setCompanyProfile(e.target.value)}
                  placeholder="Describe your company's business model, industry, target markets, products/services, and any specific compliance concerns..."
                  className="w-full h-48 px-4 py-3 bg-input text-foreground focus:outline-none resize-none placeholder:text-muted-foreground border border-border rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  This information will be used to provide context-aware compliance analysis. 
                  Examples: "We are a fintech startup operating in EU and US markets, offering mobile payment solutions..."
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveCompanyProfile}
                  disabled={!companyProfile.trim()}
                  className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Company Profile
                </button>
              </div>

              {companyProfile && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Company Profile</h4>
                  <p className="text-sm text-blue-800">{companyProfile}</p>
                </div>
              )}
            </div>
          </div>
        )

      default: // chat
        return (
          <>
            {error && (
              <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={clearChat}
                  className="px-3 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary transition-colors text-sm shadow-sm"
                >
                  Clear Chat
                </button>
              </div>

              <div className="flex flex-col h-[600px] bg-card border border-border rounded-tl-none rounded-tr-xl rounded-br-xl rounded-bl-xl mt-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-12">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-xl'
                            : 'bg-slate-200 text-slate-800 rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-xl'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 bg-slate-200 text-slate-800 rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">Get AI-powered compliance insights and assistance</p>
        </div>

        <div className="flex items-center justify-between mb-0 relative">
          <div className="flex gap-0">
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
            
            <button
              onClick={() => setActiveTab('company')}
              className={`px-6 py-3 rounded-tl-xl rounded-tr-xl border border-border ${
                activeTab === 'company' 
                  ? 'bg-card text-foreground border-b-0' 
                  : 'bg-background text-muted-foreground hover:bg-secondary/50'
              } transition-colors`}
            >
              <Building className="h-4 w-4 mr-2 inline" />
              Company Profile
            </button>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-transparent text-muted-foreground hover:text-[#007AFF] transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {showSettings && (
          <div className="absolute top-32 right-4 z-50 bg-card/95 border border-border rounded-lg p-4 max-w-md shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Use Free API</label>
                <select
                  value={useFreeAPI}
                  onChange={(e) => {
                    const value = e.target.value as 'none' | 'openrouter' | 'huggingface' | 'together'
                    setUseFreeAPI(value)
                    
                    if (value !== 'none') {
                      setApiConfig(prev => ({
                        ...prev,
                        baseURL: getFreeAPIBaseURL(value),
                        model: getFreeAPIModel(value)
                      }))
                    }
                    
                    localStorage.setItem('use_free_api', value)
                  }}
                  className="w-full p-2 border border-border rounded bg-input text-foreground"
                >
                  <option value="none">None (Custom API)</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="huggingface">Hugging Face</option>
                  <option value="together">Together AI</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => {
                    setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))
                    localStorage.setItem('ai_api_key', e.target.value)
                  }}
                  placeholder="Enter your API key"
                  className="w-full p-2 border border-border rounded bg-input text-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Base URL</label>
                <input
                  type="text"
                  value={apiConfig.baseURL}
                  onChange={(e) => {
                    setApiConfig(prev => ({ ...prev, baseURL: e.target.value }))
                    localStorage.setItem('ai_base_url', e.target.value)
                  }}
                  className="w-full p-2 border border-border rounded bg-input text-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Model</label>
                {useFreeAPI !== 'none' ? (
                  <input
                    type="text"
                    value={apiConfig.model}
                    readOnly
                    className="w-full p-2 border border-border rounded bg-input text-foreground opacity-70"
                  />
                ) : (
                  <select
                    value={apiConfig.model}
                    onChange={(e) => {
                      setApiConfig(prev => ({ ...prev, model: e.target.value }))
                      localStorage.setItem('ai_model', e.target.value)
                    }}
                    className="w-full p-2 border border-border rounded bg-input text-foreground"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    <option value="deepseek-chat">DeepSeek Chat</option>
                    <option value="llama-3">Llama 3</option>
                    <option value="mixtral">Mixtral</option>
                    <option value="mistral">Mistral</option>
                  </select>
                )}
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Temperature</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={apiConfig.temperature}
                    onChange={(e) => {
                      setApiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))
                      localStorage.setItem('ai_temperature', e.target.value)
                    }}
                    className="w-full p-2 border border-border rounded bg-input text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Max Tokens</label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    step="100"
                    value={apiConfig.maxTokens}
                    onChange={(e) => {
                      setApiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))
                      localStorage.setItem('ai_max_tokens', e.target.value)
                    }}
                    className="w-full p-2 border border-border rounded bg-input text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-md border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('ai_api_key', apiConfig.apiKey);
                  localStorage.setItem('ai_base_url', apiConfig.baseURL);
                  localStorage.setItem('ai_model', apiConfig.model);
                  localStorage.setItem('ai_temperature', apiConfig.temperature.toString());
                  localStorage.setItem('ai_max_tokens', apiConfig.maxTokens.toString());
                  localStorage.setItem('use_free_api', useFreeAPI);
                  setShowSettings(false);
                }}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-tr-xl rounded-br-xl rounded-bl-xl p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}