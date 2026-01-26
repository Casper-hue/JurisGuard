import MainLayout from '@/components/MainLayout'

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  )
}