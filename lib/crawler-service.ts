import { ComplianceAlert, RadarStat, StatCard, ActivityItem } from '@/types/index'

// 数据接口
interface ComplianceData {
  alerts: ComplianceAlert[];
  radarStats: RadarStat[];
  stats: StatCard[];
  activities: ActivityItem[];
}

/**
 * 爬虫服务接口存根
 * TODO: 连接到Python爬虫API
 * 
 * 当前实现：从本地JSON文件读取数据
 * 未来实现：连接到实际的爬虫服务API
 */
export async function fetchLatestRegulations(): Promise<ComplianceData> {
  // TODO: 连接到Python爬虫API这里
  // 当前实现：模拟API调用延迟，从本地JSON文件读取数据
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const response = await fetch('/data/compliance-data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // TODO: 这里应该连接到实际的爬虫API
    // 例如：
    // const crawlerResponse = await fetch('http://localhost:8000/api/regulations/latest')
    // const crawlerData = await crawlerResponse.json()
    // return transformCrawlerData(crawlerData)
    
    return data
  } catch (error) {
    console.error('Failed to fetch regulations from crawler service:', error)
    
    // 如果爬虫服务不可用，返回默认数据
    return getDefaultData()
  }
}

/**
 * 根据关键词搜索法规
 * TODO: 连接到爬虫搜索API
 */
export async function searchRegulations(query: string): Promise<ComplianceAlert[]> {
  // TODO: 连接到Python爬虫搜索API这里
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 当前实现：在本地数据中搜索
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
 * TODO: 连接到区域特定的爬虫API
 */
export async function fetchRegulationsByRegion(region: string): Promise<ComplianceAlert[]> {
  // TODO: 连接到区域特定的爬虫API这里
  
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
 * TODO: 连接到风险分析API
 */
export async function fetchRiskStats(): Promise<RadarStat[]> {
  // TODO: 连接到风险分析API这里
  
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
 * TODO: 连接到合规分析API
 */
export async function fetchComplianceStats(): Promise<StatCard[]> {
  // TODO: 连接到合规分析API这里
  
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
 * TODO: 连接到活动日志API
 */
export async function fetchActivityLogs(): Promise<ActivityItem[]> {
  // TODO: 连接到活动日志API这里
  
  try {
    const data = await fetchLatestRegulations()
    return data.activities
  } catch (error) {
    console.error('Failed to fetch activity logs:', error)
    return []
  }
}

/**
 * 默认数据（当爬虫服务不可用时使用）
 */
function getDefaultData(): ComplianceData {
  return {
    alerts: [
      {
        id: 'default-001',
        region: 'System',
        severity: 'medium',
        title: 'Crawler Service Unavailable',
        summary: 'The crawler service is currently unavailable. Using default data.',
        timestamp: new Date().toISOString(),
        category: 'System'
      }
    ],
    radarStats: [
      { region: 'Global', value: 50, level: 'medium' }
    ],
    stats: [
      { label: 'System Status', value: 'Offline', change: '-100%', icon: 'AlertTriangle' }
    ],
    activities: [
      { id: 1, action: 'Crawler service unavailable', time: 'Just now', user: 'System' }
    ]
  }
}