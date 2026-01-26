'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSearch } from '@/contexts/SearchContext'
import { searchRegulations } from '@/lib/crawler-service'
import { 
  LayoutDashboard, 
  Globe, 
  Shield, 
  MessageSquare, 
  FileText, 
  Scale, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Calendar, 
  ChevronDown,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'

// 侧边栏组件
function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      path: "/dashboard",
      active: pathname === '/dashboard' || pathname === '/'
    },
    { 
      name: "Regulations", 
      icon: Shield, 
      path: "/compliance",
      active: pathname === '/compliance'
    },
    { 
      name: "Cases", 
      icon: Scale, 
      path: "/cases",
      active: pathname === '/cases'
    },
    { 
      name: "Documents", 
      icon: FileText, 
      path: "/documents",
      active: pathname === '/documents'
    },
    { 
      name: "AI Assistant", 
      icon: MessageSquare, 
      path: "/ai-assistant",
      active: pathname === '/ai-assistant'
    },
    { 
      name: "Team", 
      icon: Users, 
      path: "/team",
      active: pathname === '/team'
    },
  ]

  const bottomNav = [
    { 
      name: "Notifications", 
      icon: Bell, 
      path: "/notifications"
    },
    { 
      name: "Settings", 
      icon: Settings, 
      path: "/settings",
      active: pathname === '/settings'
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    setMobileOpen(false)
  }

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border hover:bg-secondary transition-colors"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">JurisGuard</h1>
              <p className="text-xs text-muted-foreground">Legal Intelligence</p>
            </div>
          </div>

          {/* 主导航 */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
                {item.active && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </nav>

          {/* 底部导航 */}
          <div className="px-3 py-4 border-t border-border space-y-1">
            {bottomNav.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
                {item.active && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}

// 头部组件
function Header() {
  const { searchQuery, setSearchQuery, setSearchResults, setIsSearching } = useSearch()
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true)
      
      try {
        // 使用爬虫服务进行搜索
        const results = await searchRegulations(searchQuery)
        setSearchResults(results)
        
        // 如果当前不在合规页面，导航到合规页面显示搜索结果
        if (pathname !== '/compliance') {
          router.push('/compliance')
        }
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 xl:px-8 bg-background">
      <div className="lg:ml-0 ml-12">
        <h1 className="text-base font-semibold text-foreground">Compliance Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Legal intelligence and regulatory monitoring
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* 搜索框 */}
        <div className="relative hidden md:flex">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search regulations..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-8 py-1.5 w-64 rounded-md border border-border bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        {/* 日期选择器 */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-transparent text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Calendar className="h-3.5 w-3.5" />
          <span>Last 30 days</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {/* 通知 */}
        <button className="relative w-8 h-8 rounded-md border border-border bg-transparent flex items-center justify-center hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>

        {/* 用户信息 */}
        <button className="hidden md:flex items-center gap-2.5 px-2 py-1.5 rounded-md border border-border bg-transparent hover:bg-secondary transition-colors">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-primary">JD</span>
          </div>
          <span className="text-xs font-medium text-foreground">Jane Doe</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}

// 主布局组件
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主要内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 头部 */}
        <Header />

        {/* 页面内容 */}
        <main className="flex-1 p-6 xl:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}