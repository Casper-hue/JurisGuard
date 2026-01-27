import { SaveResult } from '@/types/ai-types'

// 字段验证器
class FieldValidator {
  // Cases页面必需字段验证
  static validateCaseFields(data: any): { isValid: boolean; missingFields: string[] } {
    const requiredFields = [
      'title', 'court', 'jurisdiction', 'caseType', 'filingDate',
      'status', 'parties', 'description', 'impactLevel'
    ]
    
    const missingFields = requiredFields.filter(field => 
      !data[field] || data[field] === '' || 
      (Array.isArray(data[field]) && data[field].length === 0)
    )
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    }
  }
  
  // Regulations页面必需字段验证
  static validateRegulationFields(data: any): { isValid: boolean; missingFields: string[] } {
    const requiredFields = [
      'title', 'region', 'timestamp', 'summary', 'severity', 'category'
    ]
    
    const missingFields = requiredFields.filter(field => 
      !data[field] || data[field] === ''
    )
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    }
  }
  
  // 字段格式验证
  static validateFieldFormats(data: any, contentType: string): string[] {
    const errors: string[] = []
    
    if (contentType === 'case') {
      // 验证status字段格式
      const validStatus = ['active', 'settled', 'appealed', 'closed', 'decided']
      if (!validStatus.includes(data.status)) {
        errors.push(`status必须是以下值之一: ${validStatus.join(', ')}`)
      }
      
      // 验证impactLevel字段格式
      const validImpact = ['critical', 'high', 'medium', 'low']
      if (!validImpact.includes(data.impactLevel)) {
        errors.push(`impactLevel必须是以下值之一: ${validImpact.join(', ')}`)
      }
      
      // 验证日期格式
      if (!this.isValidDate(data.filingDate)) {
        errors.push('filingDate必须是有效的YYYY-MM-DD格式')
      }
    }
    
    if (contentType === 'regulation') {
      // 验证severity字段格式
      const validSeverity = ['critical', 'high', 'medium', 'low']
      if (!validSeverity.includes(data.severity)) {
        errors.push(`severity必须是以下值之一: ${validSeverity.join(', ')}`)
      }
      
      // 验证日期格式
      if (data.timestamp && !this.isValidDate(data.timestamp)) {
        errors.push('timestamp必须是有效的YYYY-MM-DD格式')
      }
    }
    
    return errors
  }
  
  private static isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) return false
    
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }
}

// 严格的保存管理器
export class StrictSaveManager {
  private validator: FieldValidator
  
  constructor() {
    this.validator = new FieldValidator()
  }
  
  // Cases页面保存逻辑
  async saveCaseData(extractedData: any): Promise<SaveResult> {
    // 步骤1: 验证必需字段
    const validation = FieldValidator.validateCaseFields(extractedData)
    if (!validation.isValid) {
      return {
        success: false,
        error: `缺少必需字段: ${validation.missingFields.join(', ')}`,
        cannotSave: true
      }
    }
    
    // 步骤2: 验证字段格式
    const formatErrors = FieldValidator.validateFieldFormats(extractedData, 'case')
    if (formatErrors.length > 0) {
      return {
        success: false,
        error: `字段格式错误: ${formatErrors.join('; ')}`,
        cannotSave: true
      }
    }
    
    // 步骤3: 生成ID（如果AI没有提供）
    const finalData = {
      ...extractedData,
      id: extractedData.id || this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 步骤4: 保存到数据库
    try {
      await this.saveToCasesTable(finalData)
      return {
        success: true,
        message: '案件数据已成功保存',
        data: finalData
      }
    } catch (error) {
      return {
        success: false,
        error: `数据库保存失败: ${error instanceof Error ? error.message : '未知错误'}`,
        cannotSave: true
      }
    }
  }
  
  // Regulations页面保存逻辑
  async saveRegulationData(extractedData: any): Promise<SaveResult> {
    const validation = FieldValidator.validateRegulationFields(extractedData)
    if (!validation.isValid) {
      return {
        success: false,
        error: `缺少必需字段: ${validation.missingFields.join(', ')}`,
        cannotSave: true
      }
    }
    
    const formatErrors = FieldValidator.validateFieldFormats(extractedData, 'regulation')
    if (formatErrors.length > 0) {
      return {
        success: false,
        error: `字段格式错误: ${formatErrors.join('; ')}`,
        cannotSave: true
      }
    }
    
    const finalData = {
      ...extractedData,
      id: extractedData.id || this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      await this.saveToRegulationsTable(finalData)
      return {
        success: true,
        message: '法规数据已成功保存',
        data: finalData
      }
    } catch (error) {
      return {
        success: false,
        error: `数据库保存失败: ${error instanceof Error ? error.message : '未知错误'}`,
        cannotSave: true
      }
    }
  }
  
  // 统一保存接口
  async strictSaveToDatabase(extractedData: any, contentType: string): Promise<SaveResult> {
    try {
      if (contentType === 'case') {
        return await this.saveCaseData(extractedData)
      } else if (contentType === 'regulation') {
        return await this.saveRegulationData(extractedData)
      } else {
        return {
          success: false,
          error: `不支持的内容类型: ${contentType}`,
          cannotSave: true
        }
      }
      
    } catch (error) {
      return {
        success: false,
        error: `保存过程出错: ${error instanceof Error ? error.message : '未知错误'}`,
        cannotSave: true
      }
    }
  }
  
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // 数据转换和验证方法
  private prepareCaseData(data: any): any {
    const requiredFields = ['title', 'court', 'jurisdiction', 'caseType', 'filingDate', 'status', 'parties', 'description', 'impactLevel']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      throw new Error(`案件数据缺少必需字段: ${missingFields.join(', ')}`)
    }
    
    return {
      id: data.id || this.generateCaseId(),
      title: data.title,
      court: data.court,
      jurisdiction: data.jurisdiction,
      caseType: data.caseType,
      filingDate: data.filingDate,
      status: data.status,
      parties: data.parties,
      description: data.description,
      impactLevel: data.impactLevel,
      source_url: data.source_url || '',
      outcome: data.outcome || '',
      key_issues: data.key_issues || []
    }
  }
  
  private prepareRegulationData(data: any): any {
    const requiredFields = ['title', 'region', 'severity', 'summary', 'timestamp']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      throw new Error(`法规数据缺少必需字段: ${missingFields.join(', ')}`)
    }
    
    return {
      id: data.id || this.generateAlertId(),
      region: data.region,
      severity: data.severity,
      title: data.title,
      summary: data.summary,
      timestamp: data.timestamp,
      source_url: data.source_url || '',
      category: data.category || 'Data Compliance'
    }
  }

  private generateCaseId(): string {
    return `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 使用API路由保存数据的方法
  private async saveToCasesTable(data: any): Promise<void> {
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          dataType: 'case'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || '保存失败')
      }

      console.log('案件数据保存成功:', data)
    } catch (error) {
      console.error('保存案件数据失败:', error)
      throw new Error(`无法保存案件数据: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
  
  private async saveToRegulationsTable(data: any): Promise<void> {
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          dataType: 'regulation'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || '保存失败')
      }

      console.log('法规数据保存成功:', data)
    } catch (error) {
      console.error('保存法规数据失败:', error)
      throw new Error(`无法保存法规数据: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}