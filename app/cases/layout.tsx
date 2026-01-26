import MainLayout from '@/components/MainLayout'

export default function CasesLayout({
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