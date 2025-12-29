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
          <main className="pt-20 p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}




