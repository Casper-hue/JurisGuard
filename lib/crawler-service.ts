import { ComplianceAlert, RadarStat, StatCard, ActivityItem, PublicCase } from '@/types/index'

// 数据接口
interface ComplianceData {
  alerts: ComplianceAlert[];
  radarStats: RadarStat[];
  stats: StatCard[];
  activities: ActivityItem[];
}

// 案例数据接口
interface CasesData {
  cases: PublicCase[];
}

/**
 * 爬虫服务接口
 * 
 * 当前实现：从本地JSON文件读取数据（用于开发和测试）
 * 生产实现：连接到实际的爬虫服务API
 */
export async function fetchLatestRegulations(): Promise<ComplianceData> {
  try {
    // 在生产环境中，这里将连接到实际的爬虫API
    const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL || '/api'}/regulations/latest`)
    if (!crawlerResponse.ok) {
      throw new Error(`HTTP error! status: ${crawlerResponse.status}`)
    }
    // const crawlerData = await crawlerResponse.json()
    // return transformCrawlerData(crawlerData)
    
    // 开发实现：从本地JSON文件读取数据
    const response = await fetch('/data/compliance-data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch regulations from crawler service:', error)
    
    // 如果爬虫服务不可用，返回默认数据
    return getDefaultData()
  }
}

/**
 * 获取最新案例数据
 */
export async function fetchLatestCases(): Promise<CasesData> {
  try {
    // 在生产环境中，这里将连接到实际的爬虫API
    // const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL}/api/cases/latest`)
    // const crawlerData = await crawlerResponse.json()
    // return transformCrawlerData(crawlerData)
    
    // 开发实现：从本地JSON文件读取数据
    const response = await fetch('/data/cases-data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch cases from crawler service:', error)
    
    // 如果爬虫服务不可用，返回默认数据
    return { cases: [] }
  }
}

/**
 * 根据关键词搜索法规
 */
export async function searchRegulations(query: string): Promise<ComplianceAlert[]> {
  try {
    // 在生产环境中，这里将连接到实际的爬虫搜索API
    const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL || '/api'}/regulations/search?q=${encodeURIComponent(query)}`)
    if (crawlerResponse.ok) {
      const crawlerData = await crawlerResponse.json()
      return crawlerData.results || []
    }
    
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
 */
export async function fetchRegulationsByRegion(region: string): Promise<ComplianceAlert[]> {
  try {
    // 在生产环境中，这里将连接到实际的爬虫API
    const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL || '/api'}/regulations/region/${region}`)
    if (crawlerResponse.ok) {
      const crawlerData = await crawlerResponse.json()
      return crawlerData.results || []
    }
    
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
export async function fetchRiskStats(): Promise<RadarStat[]> {
  try {
    // 在生产环境中，这里将连接到实际的风险分析API
    const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL || '/api'}/stats/risk`)
    if (crawlerResponse.ok) {
      const crawlerData = await crawlerResponse.json()
      return crawlerData.results || []
    }
    
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
export async function fetchComplianceStats(): Promise<StatCard[]> {
  try {
    // 在生产环境中，这里将连接到实际的合规分析API
    const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL || '/api'}/stats/compliance`)
    if (crawlerResponse.ok) {
      const crawlerData = await crawlerResponse.json()
      return crawlerData.results || []
    }
    
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
export async function fetchActivityLogs(): Promise<ActivityItem[]> {
  try {
    // 在生产环境中，这里将连接到实际的活动日志API
    const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL || '/api'}/logs/activity`)
    if (crawlerResponse.ok) {
      const crawlerData = await crawlerResponse.json()
      return crawlerData.results || []
    }
    
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
    // 在生产环境中，这里将连接到实际的爬虫搜索API
    const crawlerResponse = await fetch(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL || '/api'}/cases/search?q=${encodeURIComponent(query)}`)
    if (crawlerResponse.ok) {
      const crawlerData = await crawlerResponse.json()
      return crawlerData.results || []
    }
    
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
      { label: 'System Status', value: 'Offline', change: '-100%', icon: 'AlertTriangle' }
    ],
    activities: [
      { id: 1, action: 'Crawler service unavailable', time: 'Just now', user: 'System' }
    ]
  }
}