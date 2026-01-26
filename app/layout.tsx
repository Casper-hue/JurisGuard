import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SearchProvider } from '@/contexts/SearchContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JurisGuard - Legal Compliance Dashboard',
  description: 'AI-powered legal intelligence and regulatory monitoring platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SearchProvider>
          {children}
        </SearchProvider>
      </body>
    </html>
  )
}