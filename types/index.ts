// 合规警报接口 - 用于手动数据和未来爬虫数据的标准格式
export interface ComplianceAlert {
  id: string;
  region: string;       // 例如: "EU", "USA", "China"
  severity: "critical" | "high" | "medium" | "low";
  title: string;        // 例如: "AI Act Final Draft"
  summary: string;      // 简短描述
  timestamp: string;    // ISO 日期格式
  source_url?: string;  // 用于未来爬虫
}

// 雷达统计接口 - 用于风险雷达可视化
export interface RadarStat {
  id: string;
  region: string;
  riskLevel: number;    // 0-100 的风险级别
  category: string;     // 风险类别
  trend: "up" | "down" | "stable";
  lastUpdated: string;
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