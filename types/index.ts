// 合规警报接口 - 用于手动数据和未来爬虫数据的标准格式
export interface ComplianceAlert {
  id: string;
  region: string;       // 例如: "EU", "USA", "China"
  severity: "critical" | "high" | "medium" | "low";
  title: string;        // 例如: "AI Act Final Draft"
  summary: string;      // 简短描述
  timestamp: string;    // ISO 日期格式
  source_url?: string;  // 用于未来爬虫
  category?: string;    // 警报分类，例如: "Data Compliance"
  
  // 兼容AI提取的额外字段
  jurisdiction?: string;
  publishDate?: string;
  regulationType?: string;
  importanceLevel?: "critical" | "high" | "medium" | "low";
  hasSource?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 雷达统计接口 - 用于风险雷达可视化
export interface RadarStat {
  id: string;
  region: string;
  riskLevel: number;    // 0-100 的风险级别
  category: string;     // 风险类别
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  value?: number;       // 雷达图数值
  level?: string;       // 风险等级
}

// 统计卡片数据接口
export interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: string;
}

// 活动流项目接口
export interface ActivityItem {
  id: number;
  action: string;
  time: string;
  user: string;
}

// 法院案例接口
export interface PublicCase {
  id: string;
  title: string;
  court: string;
  jurisdiction: string;
  caseType: string;
  filingDate: string;
  status: string;
  parties: string[];
  description: string;
  impactLevel: string;
  region?: string;
  summary?: string;
  severity?: string;
  category?: string;
  timestamp?: string;
  source_url?: string;
  outcome?: string;
  key_issues?: string[];
}

// 文档接口
export interface Document {
  id: string;
  title: string;
  type: string;
  jurisdiction: string;
  status: string;
  publishDate: string;
  effectiveDate: string;
  lastModified: string;
  content?: string;
  author?: string;
  version?: string;
  reviewDate?: string;
  relatedRegulations?: string[];
  tags?: string[];
  summary?: string;
  sourceUrl?: string;
  category?: string;
  description?: string;
}

// 合规数据接口
export interface ComplianceData {
  alerts: ComplianceAlert[];
  cases: PublicCase[];
  documents: Document[];
  radarStats: RadarStat[];
  stats: StatCard[];
  activities: ActivityItem[];
}