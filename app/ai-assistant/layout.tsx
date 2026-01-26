import MainLayout from '@/components/MainLayout'

export default function AIAssistantLayout({
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