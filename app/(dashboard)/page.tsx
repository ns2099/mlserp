import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FolderKanban, FileText, Factory, Building2, ShoppingCart, FileCheck, Users, Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const menuItems = [
    {
      href: '/projeler',
      icon: FolderKanban,
      label: 'Projeler',
      description: 'Tüm projeleri görüntüle ve yönet',
      color: 'bg-blue-500',
    },
    {
      href: '/teklif/liste',
      icon: FileText,
      label: 'Teklifler',
      description: 'Teklifleri görüntüle ve yönet',
      color: 'bg-green-500',
    },
    {
      href: '/makina/liste',
      icon: Factory,
      label: 'Makinalar',
      description: 'Makina listesini görüntüle',
      color: 'bg-purple-500',
    },
    {
      href: '/firma/liste',
      icon: Building2,
      label: 'Firmalar',
      description: 'Firma listesini görüntüle',
      color: 'bg-orange-500',
    },
    {
      href: '/satin-alma/liste',
      icon: ShoppingCart,
      label: 'Satın Almalar',
      description: 'Satın alma listesini görüntüle',
      color: 'bg-red-500',
    },
    {
      href: '/sozlesme/liste',
      icon: FileCheck,
      label: 'Sözleşmeler',
      description: 'Sözleşme listesini görüntüle',
      color: 'bg-indigo-500',
    },
    {
      href: '/kullanici/liste',
      icon: Users,
      label: 'Kullanıcılar',
      description: 'Kullanıcı listesini görüntüle',
      color: 'bg-teal-500',
    },
    {
      href: '/ayarlar',
      icon: Settings,
      label: 'Ayarlar',
      description: 'Sistem ayarlarını yönet',
      color: 'bg-gray-500',
    },
  ]

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center max-w-4xl w-full px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hoşgeldiniz, {session?.user?.name || 'Kullanıcı'}
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Üretim Yönetim Sistemine hoş geldiniz. Aşağıdaki menülerden istediğiniz bölüme geçebilirsiniz.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border-2 border-transparent hover:border-blue-500 group"
              >
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
