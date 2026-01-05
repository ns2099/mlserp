'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AylikTeklifDurumlu {
  ay: number
  durum: number
  sayi: number
}

interface DashboardChartsProps {
  aylikTekliflerDurumlu?: AylikTeklifDurumlu[]
  aylikTeklifler?: Array<{ ay: number; sayi: number }>
}

const ayIsimleri = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]


export default function DashboardCharts({
  aylikTekliflerDurumlu: aylikTekliflerDurumluProp = [], 
}: DashboardChartsProps) {
  const [aylikTekliflerDurumlu, setAylikTekliflerDurumlu] = useState<AylikTeklifDurumlu[]>(aylikTekliflerDurumluProp)

  // Eğer prop'tan veri gelmediyse API'den çek
  useEffect(() => {
    if (!aylikTekliflerDurumluProp || aylikTekliflerDurumluProp.length === 0) {
      fetch('/api/dashboard/aylik-teklifler')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAylikTekliflerDurumlu(data)
            console.log('DashboardCharts - API\'den gelen veri:', data)
          }
        })
        .catch(err => {
          console.error('DashboardCharts - API hatası:', err)
        })
    }
  }, [aylikTekliflerDurumluProp])

  // Debug: Gelen veriyi kontrol et
  if (typeof window !== 'undefined') {
    console.log('DashboardCharts - Gelen veri:', aylikTekliflerDurumlu)
    console.log('DashboardCharts - Gelen veri tipi:', typeof aylikTekliflerDurumlu)
    console.log('DashboardCharts - Gelen veri array mi?', Array.isArray(aylikTekliflerDurumlu))
  }

  // Tüm ayları içeren veri oluştur - KÜMÜLATİF (birikmiş) veri
  // Her ay için o aya kadar olan tüm tekliflerin toplamı
  let bekleyenToplam = 0
  let onaylananToplam = 0
  let reddedilenToplam = 0
  let tamamlananToplam = 0

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const ay = i + 1
    
    // Bu ay için o ayın verisi
    const bekleyenAy = Array.isArray(aylikTekliflerDurumlu) 
      ? aylikTekliflerDurumlu.find((t) => t.ay === ay && t.durum === 1)?.sayi || 0
      : 0
    const onaylananAy = Array.isArray(aylikTekliflerDurumlu)
      ? aylikTekliflerDurumlu.find((t) => t.ay === ay && t.durum === 2)?.sayi || 0
      : 0
    const reddedilenAy = Array.isArray(aylikTekliflerDurumlu)
      ? aylikTekliflerDurumlu.find((t) => t.ay === ay && t.durum === 3)?.sayi || 0
      : 0
    const tamamlananAy = Array.isArray(aylikTekliflerDurumlu)
      ? aylikTekliflerDurumlu.find((t) => t.ay === ay && t.durum === 4)?.sayi || 0
      : 0
    
    // Kümülatif toplam (birikmiş)
    bekleyenToplam += bekleyenAy
    onaylananToplam += onaylananAy
    reddedilenToplam += reddedilenAy
    tamamlananToplam += tamamlananAy
    
    return {
      ay: ayIsimleri[i],
      Bekleyen: bekleyenToplam,
      Onaylanan: onaylananToplam,
      Reddedilen: reddedilenToplam,
      Tamamlanan: tamamlananToplam,
    }
  })

  // Toplam veri kontrolü
  const toplamVeri = chartData.reduce((sum, item) => 
    sum + item.Bekleyen + item.Onaylanan + item.Reddedilen + item.Tamamlanan, 0
  )

  // Debug: Grafik verisini kontrol et
  if (typeof window !== 'undefined') {
    console.log('DashboardCharts - Grafik verisi:', chartData)
    console.log('DashboardCharts - Toplam veri:', toplamVeri)
  }

  return (
    <div className="space-y-6">
      {/* Teklifler Grafiği - Tek grafikte tüm durumlar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Durumları (Birikmiş - Kümülatif)</h3>
        <p className="text-sm text-gray-500 mb-4">Her ay için o aya kadar olan tüm tekliflerin toplamı gösterilmektedir.</p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ay" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Bekleyen" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 6, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 8 }}
              name="Bekleyen" 
            />
            <Line 
              type="monotone" 
              dataKey="Onaylanan" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 8 }}
              name="Onaylanan" 
            />
            <Line 
              type="monotone" 
              dataKey="Reddedilen" 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="10 5"
              dot={{ r: 6, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 8 }}
              name="Reddedilen" 
            />
            <Line 
              type="monotone" 
              dataKey="Tamamlanan" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 8 }}
              name="Tamamlanan" 
            />
          </LineChart>
        </ResponsiveContainer>
        {toplamVeri === 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Henüz teklif verisi bulunmuyor
          </div>
        )}
      </div>
    </div>
  )
}

