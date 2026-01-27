'use client'

import { useState } from 'react'
import { analyzeLegalText } from '@/app/actions/analyze-compliance'

interface RiskAnalysisResult {
  role: 'expert' | 'engine'
  riskScore?: number
  risk_score?: number
  summary: string
  affectedRegions?: string[]
  affected_regions?: string[]
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical'
  severity_level?: 'Low' | 'Medium' | 'High' | 'Critical'
  recommendations?: string[]
  complianceAreas?: string[]
  tags?: string[]
  actionRequired?: boolean
  action_required?: boolean
  effectiveDate?: string
  deadline?: string
  sourceUrl?: string
  title?: string
  publish_date?: string
  compliance_deadline?: string
  source_reference?: string
}

export default function RiskAnalyzer() {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RiskAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to analyze')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const analysisResult = await analyzeLegalText(inputText)
      // 确保summary字段存在，如果不存在则提供默认值
      const resultWithSummary: RiskAnalysisResult = {
        ...analysisResult,
        summary: analysisResult.summary || 'No summary available'
      }
      setResult(resultWithSummary)
    } catch (err) {
      setError('Analysis failed, please try again later')
      console.error('Risk analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateData = async () => {
    if (!result) return

    setIsUpdating(true)
    try {
      // Simulate data update to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically send the data to your backend API
      // For now, we'll just show a success message
      alert('Data successfully updated to database!')
    } catch (err) {
      setError('Failed to update data')
      console.error('Data update error:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRiskLevel = (result: RiskAnalysisResult) => {
    return result.riskLevel || result.severity_level || 'Unknown'
  }

  const getRiskScore = (result: RiskAnalysisResult) => {
    return result.riskScore || result.risk_score || 0
  }

  const getAffectedRegions = (result: RiskAnalysisResult) => {
    return result.affectedRegions || result.affected_regions || []
  }

  const getRecommendations = (result: RiskAnalysisResult) => {
    return result.recommendations || []
  }

  const getComplianceAreas = (result: RiskAnalysisResult) => {
    return result.complianceAreas || result.tags || []
  }

  const getActionRequired = (result: RiskAnalysisResult) => {
    return result.actionRequired || result.action_required || false
  }

  return (
    <div className="flex flex-col h-[600px] rounded-xl bg-card border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Risk Analysis Tool</h2>
            <p className="text-sm text-muted-foreground">
              Process legal news/texts into structured compliance data
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Input */}
        <div className="flex-1 p-4 border-r border-border hover:bg-blue-900/99 hover:border-primary/50 transition-all duration-300">
          <div className="h-full flex flex-col">
            {/* Combined Title Area */}
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Input Legal Text</label>
              <span className="text-xs text-muted-foreground">
                Analysis results will appear on the right
              </span>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 relative">
              <div 
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setInputText(e.currentTarget.textContent || '')}
                onFocus={(e) => {
                  if (e.currentTarget.textContent === 'Paste legal text, news summary, or compliance requirements...') {
                    e.currentTarget.textContent = ''
                  }
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.textContent?.trim()) {
                    e.currentTarget.textContent = 'Paste legal text, news summary, or compliance requirements...'
                  }
                }}
                className="w-full h-full p-3 bg-input/50 border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent resize-none overflow-y-auto"
                data-placeholder="Paste legal text, news summary, or compliance requirements..."
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-muted-foreground">
                Character count: {inputText.length}
              </span>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !inputText.trim()}
                className="px-3 py-1.5 rounded-md border border-border bg-transparent text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Risk'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 p-4 hover:bg-blue-900/99 hover:border-primary/50 transition-all duration-300">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">Analysis Results</label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
                <div className="text-destructive text-sm">{error}</div>
              </div>
            )}

            {/* Results Display */}
            <div className="flex-1 overflow-y-auto">
              {result ? (
                <div className="space-y-4">
                  {/* Risk Radar */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Risk Score</span>
                      <span className={`text-lg font-bold ${
                        getRiskScore(result) >= 70 ? 'text-destructive' :
                        getRiskScore(result) >= 40 ? 'text-warning' :
                        'text-success'
                      }`}>
                        {getRiskScore(result)}/100
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          getRiskScore(result) >= 70 ? 'bg-destructive' :
                          getRiskScore(result) >= 40 ? 'bg-warning' :
                          'bg-success'
                        }`}
                        style={{ width: `${getRiskScore(result)}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Risk Level</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getRiskLevel(result) === 'High' ? 'bg-destructive text-destructive-foreground' :
                      getRiskLevel(result) === 'Medium' ? 'bg-warning text-warning-foreground' :
                      'bg-success text-success-foreground'
                    }`}>
                      {getRiskLevel(result)}
                    </span>
                  </div>

                  {/* Affected Regions */}
                  {getAffectedRegions(result).length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Affected Regions</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getAffectedRegions(result).map((region, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compliance Areas */}
                  {getComplianceAreas(result).length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Compliance Areas</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getComplianceAreas(result).map((area, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div>
                    <span className="text-sm font-medium text-foreground">Summary</span>
                    <p className="mt-1 text-sm text-foreground">{result.summary}</p>
                  </div>

                  {/* Action Required */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Action Required</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getActionRequired(result) ? 'bg-destructive text-destructive-foreground' : 'bg-success text-success-foreground'
                    }`}>
                      {getActionRequired(result) ? 'Immediate Action' : 'No Immediate Action'}
                    </span>
                  </div>

                  {/* Recommendations */}
                  {getRecommendations(result).length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Recommendations</span>
                      <ul className="mt-2 space-y-1">
                        {getRecommendations(result).map((recommendation, index) => (
                          <li key={index} className="text-sm text-foreground flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Date Information */}
                  {(result.effectiveDate || result.publish_date || result.deadline || result.compliance_deadline) && (
                    <div className="pt-4 border-t border-border">
                      <span className="text-sm font-medium text-foreground">Timeline Information</span>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {(result.effectiveDate || result.publish_date) && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Effective/Publish Date: </span>
                            <span className="text-foreground">{result.effectiveDate || result.publish_date}</span>
                          </div>
                        )}
                        {(result.deadline || result.compliance_deadline) && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Compliance Deadline: </span>
                            <span className="text-foreground">{result.deadline || result.compliance_deadline}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <svg className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">Analysis results will appear here</p>
                    <p className="text-xs mt-1">Enter legal text and click "Analyze Risk" to begin</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Update Data Button */}
            <div className="flex justify-end mt-3">
              <button
                onClick={handleUpdateData}
                disabled={!result || isUpdating}
                className="px-3 py-1.5 rounded-md border border-border bg-transparent text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isUpdating ? 'Updating...' : 'Update Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}