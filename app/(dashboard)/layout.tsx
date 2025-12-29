import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Providers } from '../providers'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-64">
          <Header />
          <main className="pt-20 p-6">
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </Providers>
  )
}
