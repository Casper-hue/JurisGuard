'use client'

import { useState } from 'react'
import { EditableAnalysisData } from '@/types/ai-types'

interface EditableOutputProps {
  analysisResult: EditableAnalysisData
  onDataChange: (data: EditableAnalysisData) => void
}

export default function EditableOutput({ analysisResult, onDataChange }: EditableOutputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editableData, setEditableData] = useState(analysisResult)

  // 字段验证
  const validateField = (field: string, value: any): boolean => {
    // 必需字段验证 - 检查字段是否为空
    const requiredFields: Record<string, string[]> = {
      case: ['title', 'court', 'jurisdiction', 'caseType', 'filingDate', 'status', 'parties', 'description', 'impactLevel'],
      regulation: ['title', 'region', 'timestamp', 'summary', 'severity', 'category']
    }
    
    const contentTypeRequiredFields = requiredFields[editableData.contentType]
    if (contentTypeRequiredFields && contentTypeRequiredFields.includes(field)) {
      // 检查必需字段是否为空
      if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
        return false
      }
    }
    
    // 格式验证
    const formatValidators: Record<string, Record<string, (v: any) => boolean>> = {
      case: {
        status: (v: string) => ['active', 'settled', 'appealed', 'closed', 'decided'].includes(v),
        impactLevel: (v: string) => ['critical', 'high', 'medium', 'low'].includes(v),
        filingDate: (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)
      },
      regulation: {
        severity: (v: string) => ['critical', 'high', 'medium', 'low'].includes(v),
        timestamp: (v: string) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) // 允许为空或有效日期格式
      }
    }
    
    const contentTypeFormatValidators = formatValidators[editableData.contentType]
    if (contentTypeFormatValidators) {
      const formatValidator = contentTypeFormatValidators[field]
      if (formatValidator && !formatValidator(value)) {
        return false
      }
    }
    
    return true // 所有验证通过
  }

  const handleFieldChange = (field: string, value: any) => {
    const isValid = validateField(field, value)
    const newData = {
      ...editableData,
      extractedData: {
        ...editableData.extractedData,
        [field]: value
      },
      [`${field}Error`]: isValid ? null : true // 如果验证失败，设置错误字段为true
    }
    
    setEditableData(newData)
    onDataChange(newData)
  }

  const renderEditableField = (label: string, field: string, value: any, type: 'text' | 'select' | 'date' = 'text') => {
    const error = editableData[`${field}Error`] === true // 只有当错误字段为true时才显示错误
    const options: Record<string, string[]> = {
      status: ['active', 'settled', 'appealed', 'closed', 'decided'],
      impactLevel: ['critical', 'high', 'medium', 'low'],
      importanceLevel: ['critical', 'high', 'medium', 'low'],
      caseType: ['Civil', 'Criminal', 'Administrative', 'Commercial', 'Intellectual Property'],
      regulationType: ['Law', 'Administrative Regulation', 'Department Rule', 'Local Regulation', 'Judicial Interpretation']
    }
    
    const fieldOptions = options[field]
    
    return (
      <div className={`field-group bg-background border border-border rounded-lg p-4 mb-3 ${error ? 'error' : ''}`}>
        <label className="text-sm font-medium text-white mb-2 block">{label}:</label>
        {type === 'select' && fieldOptions ? (
          <select 
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full p-2 bg-background text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Please select</option>
            {fieldOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === 'date' ? (
          <div className="relative">
            <input 
              type="date"
              value={value || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full p-2 pr-10 bg-background text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 datepicker-custom"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        ) : (
          <input 
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={`Enter ${label}`}
            className="w-full p-2 bg-background text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {error && <span className="error-message text-red-500 text-sm mt-1 block">{error}</span>}
      </div>
    )
  }

  // 风险评估详情展示
  const renderRiskAssessment = () => (
    <div className="risk-assessment-section bg-background border border-border rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-lg mb-3 text-white">Risk Assessment Details</h4>
      <div className="risk-level flex items-center gap-4 mb-3">
        <span className={`level-badge px-3 py-1 rounded-full text-white ${
          editableData.riskAssessment.level === 'critical' ? 'bg-red-600' :
          editableData.riskAssessment.level === 'high' ? 'bg-orange-500' :
          editableData.riskAssessment.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`}>
          {editableData.riskAssessment.level.toUpperCase()}
        </span>
        <span className="text-muted-foreground">Confidence: {(editableData.confidence * 100).toFixed(1)}%</span>
      </div>
      <div className="risk-reasoning mb-3">
        <strong className="text-white">Assessment Basis:</strong>
        <p className="text-muted-foreground mt-1">{editableData.riskAssessment.reasoning}</p>
      </div>
      <div className="risk-factors">
        <strong className="text-white">Assessment Factors:</strong>
        <div className="factor-tags flex flex-wrap gap-2 mt-1">
          {editableData.riskAssessment.factors.map((factor, index) => (
            <span key={index} className="factor-tag bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {factor}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  // 动态字段渲染
  const renderDynamicFields = () => {
    const fieldsConfig: Record<string, Array<{label: string, field: string, type: 'text' | 'select' | 'date'}>> = {
      case: [
        { label: 'Case Name', field: 'title', type: 'text' },
        { label: 'Court', field: 'court', type: 'text' },
        { label: 'Jurisdiction', field: 'jurisdiction', type: 'text' },
        { label: 'Case Type', field: 'caseType', type: 'select' },
        { label: 'Filing Date', field: 'filingDate', type: 'date' },
        { label: 'Status', field: 'status', type: 'select' },
        { label: 'Impact Level', field: 'impactLevel', type: 'select' }
      ],
      regulation: [
        { label: 'Title', field: 'title', type: 'text' },
        { label: 'Region', field: 'region', type: 'text' },
        { label: 'Severity', field: 'severity', type: 'select' },
        { label: 'Summary', field: 'summary', type: 'text' },
        { label: 'Timestamp', field: 'timestamp', type: 'date' },
        { label: 'Category', field: 'category', type: 'text' },
        { label: 'Source URL', field: 'source_url', type: 'text' }
      ]
    }
    
    const config = fieldsConfig[editableData.contentType] || []
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.map(({ label, field, type }) => (
          <div key={field}>
            {renderEditableField(label, field, editableData.extractedData[field], type)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="editable-output bg-card border border-border rounded-xl p-6">
      <div className="output-header bg-card px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          {editableData.contentType === 'case' ? 'Case Analysis Result' : 'Regulation Analysis Result'}
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-md transition-colors ${
            isEditing 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditing ? 'Finish Editing' : 'Edit Result'}
        </button>
      </div>
      
      <div className="p-6">
        {/* 风险评估展示 */}
        {renderRiskAssessment()}
        
        {/* 可编辑字段 */}
        <div className={`editable-fields ${isEditing ? 'editing' : ''}`}>
          <h4 className="font-semibold text-lg mb-4 text-white">Structured Information</h4>
          {renderDynamicFields()}
          
          {/* 文本区域字段 */}
          <div className="textarea-field bg-background border border-border rounded-lg p-4 mt-4">
            <label className="block text-sm font-medium text-white mb-2">
              {editableData.contentType === 'case' ? 'Case Description' : 'Regulation Summary'}:
            </label>
            <textarea
              value={editableData.extractedData[editableData.contentType === 'case' ? 'description' : 'summary'] || ''}
              onChange={(e) => handleFieldChange(
                editableData.contentType === 'case' ? 'description' : 'summary', 
                e.target.value
              )}
              rows={4}
              placeholder={`Enter ${editableData.contentType === 'case' ? 'case description' : 'regulation summary'}...`}
              className="w-full p-3 bg-background text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 当事人/来源字段 */}
          {editableData.contentType === 'case' ? (
            <div className="array-field bg-background border border-border rounded-lg p-4 mt-4">
              <label className="block text-sm font-medium text-white mb-2">Parties:</label>
              {editableData.extractedData.parties?.map((party: string, index: number) => (
                <div key={index} className="array-item flex items-center gap-2 mb-2">
                  <input
                    value={party}
                    onChange={(e) => {
                      const newParties = [...editableData.extractedData.parties]
                      newParties[index] = e.target.value
                      handleFieldChange('parties', newParties)
                    }}
                    className="flex-1 p-2 bg-background text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Party ${index + 1}`}
                  />
                  <button 
                    onClick={() => {
                      const newParties = editableData.extractedData.parties.filter((_: any, i: number) => i !== index)
                      handleFieldChange('parties', newParties)
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newParties = [...(editableData.extractedData.parties || []), '']
                  handleFieldChange('parties', newParties)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ➕ Add Party
              </button>
            </div>
          ) : (
            <div className="boolean-field bg-background border border-border rounded-lg p-4 mt-4 flex items-center gap-4">
              <label className="text-sm font-medium text-white">Has Source:</label>
              <label className="switch relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={editableData.extractedData.hasSource || false}
                  onChange={(e) => handleFieldChange('hasSource', e.target.checked)}
                  className="opacity-0 w-0 h-0"
                />
                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-all"></span>
              </label>
              <span className="text-muted-foreground">{editableData.extractedData.hasSource ? 'Has Source' : 'No Source'}</span>
            </div>
          )}
        </div>
        
        {/* 验证状态显示 */}
        <div className="validation-status mt-4 p-3 rounded-md">
          {Object.keys(editableData).some(key => key.endsWith('Error') && editableData[key]) ? (
            <div className="validation-error bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              ❌ Field errors detected, please correct before saving
            </div>
          ) : (
            <div className="validation-success bg-green-50/95 border border-green-200 text-green-700 p-3 rounded">
              ✅ All fields are valid and ready to save
            </div>
          )}
        </div>
      </div>
    </div>
  )
}