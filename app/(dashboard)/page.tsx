import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Hoşgeldiniz, {session.name || 'Kullanıcı'}
        </h1>
      </div>
    </div>
  )
}
