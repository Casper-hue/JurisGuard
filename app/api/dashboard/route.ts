import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface ComplianceAlert {
  id: string
  region: string
  severity: string
  title: string
  summary: string
  timestamp: string
  category: string
  importanceLevel?: string
}

interface PublicCase {
  id: string
  title: string
  court: string
  jurisdiction: string
  caseType: string
  filingDate: string
  status: string
  parties: string[]
  description: string
  impactLevel: string
  region?: string
  summary?: string
  severity?: string
  category?: string
  timestamp?: string
}

interface Document {
  id: string
  title: string
  type: string
  size: string
  lastModified: string
  status: string
  category: string
}

export async function GET(request: NextRequest) {
  try {
    // 构建绝对路径
    const compliancePath = path.join(process.cwd(), 'data', 'compliance-data.json')
    const casesPath = path.join(process.cwd(), 'data', 'cases-data.json')
    const documentsPath = path.join(process.cwd(), 'data', 'documents-data.json')

    // 并行读取所有数据文件
    const [complianceDataRaw, casesDataRaw, documentsDataRaw] = await Promise.allSettled([
      fs.readFile(compliancePath, 'utf8'),
      fs.readFile(casesPath, 'utf8'),
      fs.readFile(documentsPath, 'utf8')
    ])

    // 解析数据
    let complianceData: { alerts: ComplianceAlert[] } = { alerts: [] }
    let casesData: { cases: PublicCase[] } = { cases: [] }
    let documentsData: { documents: Document[] } = { documents: [] }

    if (complianceDataRaw.status === 'fulfilled') {
      try {
        complianceData = JSON.parse(complianceDataRaw.value)
      } catch (e) {
        console.error('Error parsing compliance data:', e)
      }
    }

    if (casesDataRaw.status === 'fulfilled') {
      try {
        casesData = JSON.parse(casesDataRaw.value)
      } catch (e) {
        console.error('Error parsing cases data:', e)
      }
    }

    if (documentsDataRaw.status === 'fulfilled') {
      try {
        documentsData = JSON.parse(documentsDataRaw.value)
      } catch (e) {
        console.error('Error parsing documents data:', e)
      }
    }

    // 计算统计数据
    const riskItems = [
      // 高重要性的法规
      ...complianceData.alerts.filter(alert => 
        alert.severity === 'high' || alert.severity === 'critical' || 
        alert.importanceLevel === 'high' || alert.importanceLevel === 'critical'
      ),
      // 高风险的案件
      ...casesData.cases.filter(kase => 
        kase.impactLevel === 'high' || kase.impactLevel === 'critical' ||
        kase.severity === 'high' || kase.severity === 'critical'
      )
    ].length

    const regulationsTracked = complianceData.alerts.length
    const newDocuments = documentsData.documents.length
    const casesTracked = casesData.cases.length

    // 创建统计数据数组
    const stats = [
      {
        label: "Risk Items",
        value: riskItems.toString(),
        change: "+0",
        icon: "AlertTriangle",
        color: riskItems > 0 ? "text-red-500" : "text-green-500",
        bgColor: riskItems > 0 ? "bg-red-500/20" : "bg-green-500/20"
      },
      {
        label: "Regulations Tracked",
        value: regulationsTracked.toString(),
        change: "+0",
        icon: "Globe",
        color: "text-blue-500",
        bgColor: "bg-blue-500/20"
      },
      {
        label: "New Documents",
        value: newDocuments.toString(),
        change: "+0",
        icon: "FileText",
        color: "text-green-500",
        bgColor: "bg-green-500/20"
      },
      {
        label: "Cases Tracked",
        value: casesTracked.toString(),
        change: "+0",
        icon: "Scale",
        color: "text-purple-500",
        bgColor: "bg-purple-500/20"
      }
    ]

    // 合并重要或高风险的法规和案件，取最新的3个
    const allHighPriorityItems = [
      ...complianceData.alerts
        .filter(alert => 
          alert.severity === 'high' || alert.severity === 'critical' || 
          alert.importanceLevel === 'high' || alert.importanceLevel === 'critical'
        )
        .map(alert => ({
          id: alert.id,
          region: alert.region,
          severity: alert.severity || alert.importanceLevel || 'medium',
          title: alert.title,
          summary: alert.summary,
          timestamp: alert.timestamp,
          category: alert.category
        })),
      ...casesData.cases
        .filter(kase => 
          kase.impactLevel === 'high' || kase.impactLevel === 'critical' ||
          kase.severity === 'high' || kase.severity === 'critical'
        )
        .map(kase => ({
          id: kase.id,
          region: kase.region || kase.jurisdiction || 'Global',
          severity: kase.severity || kase.impactLevel || 'medium',
          title: kase.title,
          summary: kase.summary || kase.description,
          timestamp: kase.timestamp || new Date().toISOString(),
          category: kase.caseType || kase.category || 'Legal'
        }))
    ]
    // 按时间戳排序，最新的在前
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    // 取前3个
    .slice(0, 3)

    const dashboardData = {
      stats,
      alerts: allHighPriorityItems
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error in dashboard API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load dashboard data',
        stats: [],
        alerts: []
      },
      { status: 500 }
    )
  }
}