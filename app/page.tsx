import DashboardPage from './dashboard/page'
import MainLayout from '@/components/MainLayout'

// 在静态导出模式下，主页只是呈现布局和内容
// API数据将在客户端加载
export default function Home() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  )
}