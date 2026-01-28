"use client"

import { useState, useEffect } from 'react'
import { AlertTriangle, Globe, FileText, Scale } from 'lucide-react'

interface ComplianceAlert {
  id: string
  region: string
  severity: string
  title: string
  summary: string
  timestamp: string
  category: string
  jurisdiction?: string
  publishDate?: string
  regulationType?: string
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
  source_url?: string
  outcome?: string
  key_issues?: string[]
  region?: string
  summary?: string
  severity?: string
  category?: string
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

interface DashboardData {
  stats: {
    label: string
    value: string
    change: string
    icon: string
    color: string
    bgColor: string
  }[]
  alerts: {
    id: string
    region: string
    severity: string
    title: string
    summary: string
    timestamp: string
    category: string
  }[]
}

function StatsCards({ stats }: { stats: DashboardData['stats'] }) {
  const iconMap: { [key: string]: any } = {
    AlertTriangle: AlertTriangle,
    Globe: Globe,
    FileText: FileText,
    Scale: Scale
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = iconMap[stat.icon]
        return (
          <div key={index} className="p-6 rounded-xl bg-card border border-border hover:bg-blue-900/99 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {stat.change} from last week
            </p>
          </div>
        )
      })}
    </div>
  )
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-500'
    case 'high': return 'bg-orange-500/20 text-orange-500'
    case 'medium': return 'bg-yellow-500/20 text-yellow-500'
    case 'low': return 'bg-blue-500/20 text-blue-500'
    default: return 'bg-gray-500/20 text-gray-500'
  }
}

function getSeverityText(severity: string) {
  switch (severity) {
    case 'critical': return 'Critical'
    case 'high': return 'High'
    case 'medium': return 'Medium'
    case 'low': return 'Low'
    default: return severity
  }
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground mt-2">Please check if the data file exists</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-base text-muted-foreground">Monitor your legal compliance metrics and risk indicators</p>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={dashboardData.stats} />

      {/* 其他内容区域 */}
      <div className="grid grid-cols-1 gap-6">
        {/* 合规警报 */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Compliance Alerts</h2>
          <div className="space-y-4">
            {dashboardData.alerts.length > 0 ? (
              dashboardData.alerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg bg-card/10 border border-border hover:bg-blue-900/99 hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-foreground group-hover:text-primary transition-colors font-medium">
                      {alert.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-500">
                        {alert.region}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)} group-hover:${getSeverityColor(alert.severity).replace('/20', '/30')} transition-colors`}>
                        {getSeverityText(alert.severity)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(alert.timestamp).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}</span>
                    <span>{alert.category}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No high-priority alerts at the moment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}