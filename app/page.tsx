import DashboardPage from './dashboard/page'
import MainLayout from '@/components/MainLayout'

export default function Home() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  )
}