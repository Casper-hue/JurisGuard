// lib/vercel-compatible-crawler-service.ts

import { ComplianceAlert, PublicCase, ComplianceData } from '@/types/index'

// 数据接口
interface CasesData {
  cases: PublicCase[];
}

/**
 * Vercel兼容的爬虫服务接口
 * 
 * 由于Vercel运行时无法修改文件，我们从部署时已存在的数据文件读取
 * 数据更新通过GitHub Actions在构建时完成
 */
export async function fetchLatestRegulations(): Promise<ComplianceData> {
  try {
    // 从部署时已存在的数据文件读取
    // 在开发环境和生产环境中都使用相同的路径
    const response = await fetch('/data/compliance-data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch regulations from static data:', error)
    
    // 如果数据文件不可用，返回默认数据
    return getDefaultComplianceData()
  }
}

/**
 * 获取最新案例数据
 */
export async function fetchLatestCases(): Promise<CasesData> {
  try {
    const response = await fetch('/data/cases-data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch cases from static data:', error)
    
    return { cases: [] }
  }
}

/**
 * 搜索法规
 */
export async function searchRegulations(query: string): Promise<ComplianceAlert[]> {
  try {
    const data = await fetchLatestRegulations()
    
    const searchTerm = query.toLowerCase()
    const filteredAlerts = data.alerts.filter(alert => 
      alert.title.toLowerCase().includes(searchTerm) ||
      alert.summary.toLowerCase().includes(searchTerm) ||
      alert.region.toLowerCase().includes(searchTerm) ||
      alert.category?.toLowerCase().includes(searchTerm)
    )
    
    return filteredAlerts
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

/**
 * 获取特定区域的法规更新
 */
export async function fetchRegulationsByRegion(region: string): Promise<ComplianceAlert[]> {
  try {
    const data = await fetchLatestRegulations()
    return data.alerts.filter(alert => alert.region.toLowerCase() === region.toLowerCase())
  } catch (error) {
    console.error(`Failed to fetch regulations for region ${region}:`, error)
    return []
  }
}

/**
 * 获取风险统计数据
 */
export async function fetchRiskStats() {
  try {
    const data = await fetchLatestRegulations()
    return data.radarStats
  } catch (error) {
    console.error('Failed to fetch risk stats:', error)
    return []
  }
}

/**
 * 获取合规统计数据
 */
export async function fetchComplianceStats() {
  try {
    const data = await fetchLatestRegulations()
    return data.stats
  } catch (error) {
    console.error('Failed to fetch compliance stats:', error)
    return []
  }
}

/**
 * 获取活动日志
 */
export async function fetchActivityLogs() {
  try {
    const data = await fetchLatestRegulations()
    return data.activities
  } catch (error) {
    console.error('Failed to fetch activity logs:', error)
    return []
  }
}

/**
 * 搜索案例
 */
export async function searchCases(query: string): Promise<PublicCase[]> {
  try {
    const data = await fetchLatestCases()
    
    const searchTerm = query.toLowerCase()
    const filteredCases = data.cases.filter(cas => 
      cas.title.toLowerCase().includes(searchTerm) ||
      cas.description.toLowerCase().includes(searchTerm) ||
      cas.court.toLowerCase().includes(searchTerm) ||
      cas.jurisdiction.toLowerCase().includes(searchTerm) ||
      cas.caseType.toLowerCase().includes(searchTerm)
    )
    
    return filteredCases
  } catch (error) {
    console.error('Case search failed:', error)
    return []
  }
}

/**
 * 默认合规数据（当数据文件不可用时使用）
 */
function getDefaultComplianceData(): ComplianceData {
  return {
    alerts: [
      {
        id: 'default-001',
        region: 'System',
        severity: 'medium',
        title: 'Data Unavailable',
        summary: 'The latest legal data is currently unavailable.',
        timestamp: new Date().toISOString(),
        category: 'System'
      }
    ],
    radarStats: [
      { 
        id: 'global-1',
        region: 'Global', 
        riskLevel: 50, 
        category: 'System',
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
        value: 50, 
        level: 'medium' 
      }
    ],
    stats: [
      { label: 'Status', value: 'Offline', change: '-100%', icon: 'AlertTriangle' }
    ],
    activities: [
      { id: 1, action: 'Data unavailable', time: 'Just now', user: 'System' }
    ]
  }
}