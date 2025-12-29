import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // exchangerate-api.com kullanarak döviz kurlarını çek
    // Bu API ücretsiz ve güvenilir
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { 
        next: { revalidate: 3600 }, // 1 saat cache
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      throw new Error('USD kuru alınamadı')
    }

    const usdData = await response.json()
    const usdRate = usdData.rates?.TRY || 34.5

    // EUR kuru için ayrı bir istek
    const eurResponse = await fetch(
      'https://api.exchangerate-api.com/v4/latest/EUR',
      { 
        next: { revalidate: 3600 },
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    let eurRate = 37.0 // Varsayılan değer
    if (eurResponse.ok) {
      const eurData = await eurResponse.json()
      eurRate = eurData.rates?.TRY || 37.0
    }

    return NextResponse.json({
      usd: { try: usdRate },
      eur: { try: eurRate },
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Döviz kuru hatası:', error)
    // Hata durumunda varsayılan değerler (güncel değerler yaklaşık olarak)
    return NextResponse.json({
      usd: { try: 34.5 },
      eur: { try: 37.2 },
      success: false,
      error: 'Döviz kurları yüklenemedi',
    })
  }
}

