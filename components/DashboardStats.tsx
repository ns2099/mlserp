'use client'

import { formatCurrency } from '@/lib/utils'
import { FileText, Clock, CheckCircle, XCircle, Factory, CheckSquare, Package, CheckCircle2 } from 'lucide-react'

interface DashboardStatsProps {
  toplamTeklif?: number
  bekleyenTeklifler?: number
  onaylananTeklifler?: number
  tamamlananTeklifler?: number
  bekleyenToplam?: number
  onaylananToplam?: number
  tamamlananToplam?: number
  uretimdeOlanlar?: number
  sonKontrol?: number
  onaylananUretimler?: number
  tamamlananUretimler?: number
}

export default function DashboardStats({
  toplamTeklif = 0,
  bekleyenTeklifler = 0,
  onaylananTeklifler = 0,
  tamamlananTeklifler = 0,
  bekleyenToplam = 0,
  onaylananToplam = 0,
  tamamlananToplam = 0,
  uretimdeOlanlar = 0,
  sonKontrol = 0,
  onaylananUretimler = 0,
  tamamlananUretimler = 0,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Toplam Teklif',
      value: (toplamTeklif ?? 0).toString(),
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Bekleyen Teklifler',
      value: (bekleyenTeklifler ?? 0).toString(),
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Onaylanan Teklifler',
      value: (onaylananTeklifler ?? 0).toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Tamamlanan Teklifler',
      value: (tamamlananTeklifler ?? 0).toString(),
      icon: XCircle,
      color: 'bg-purple-500',
    },
    {
      label: 'Aktif Üretimler',
      value: (uretimdeOlanlar ?? 0).toString(),
      icon: Factory,
      color: 'bg-orange-500',
    },
    {
      label: 'Son Kontrol',
      value: (sonKontrol ?? 0).toString(),
      icon: CheckSquare,
      color: 'bg-indigo-500',
    },
    {
      label: 'Onaylanan Üretimler',
      value: (onaylananUretimler ?? 0).toString(),
      icon: Package,
      color: 'bg-emerald-500',
    },
    {
      label: 'Tamamlanan Üretimler',
      value: (tamamlananUretimler ?? 0).toString(),
      icon: CheckCircle2,
      color: 'bg-teal-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}




