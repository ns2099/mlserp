import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function temizleDuplicateTeklifler() {
  console.log('Duplicate teklifler temizleniyor...')

  // Tüm teklifleri çek
  const tumTeklifler = await prisma.teklif.findMany({
    include: {
      teklifUrunler: true,
      firma: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  console.log(`Toplam ${tumTeklifler.length} teklif bulundu`)

  // Duplicate kontrolü için map
  const teklifMap = new Map<string, string[]>()
  const silinecekTeklifler: string[] = []

  tumTeklifler.forEach((teklif) => {
    // Duplicate kontrolü için key oluştur
    // Aynı firma, ad, toplamFiyat ve teklifTarihi kombinasyonuna sahip teklifler duplicate sayılır
    const key = JSON.stringify({
      firmaId: teklif.firmaId,
      ad: teklif.ad || '',
      toplamFiyat: teklif.toplamFiyat,
      teklifTarihi: teklif.teklifTarihi?.toISOString() || null,
      userId: teklif.userId,
    })

    if (!teklifMap.has(key)) {
      teklifMap.set(key, [])
    }
    teklifMap.get(key)!.push(teklif.id)
  })

  // Her key için birden fazla teklif varsa, en eskisini tut, diğerlerini sil
  for (const [key, teklifIds] of teklifMap.entries()) {
    if (teklifIds.length > 1) {
      console.log(`\nDuplicate bulundu (${teklifIds.length} adet):`)
      const teklifler = tumTeklifler.filter((t) => teklifIds.includes(t.id))
      teklifler.forEach((t) => {
        console.log(`  - ${t.id}: ${t.ad || 'Ad yok'} - ${t.firma.ad} - ${t.toplamFiyat} TL - ${t.createdAt.toISOString()}`)
      })

      // En yeni olanı tut (createdAt'e göre), diğerlerini sil
      const sortedTeklifler = teklifler.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      // En yeni olan hariç diğerlerini sil
      const tutulacakId = sortedTeklifler[0].id
      const silinecekler = sortedTeklifler.slice(1)
      
      console.log(`  ✓ Tutulacak: ${tutulacakId} (en yeni)`)
      silinecekler.forEach((t) => {
        console.log(`  ✗ Silinecek: ${t.id}`)
        silinecekTeklifler.push(t.id)
      })
    }
  }

  if (silinecekTeklifler.length === 0) {
    console.log('\n✓ Duplicate teklif bulunamadı!')
    return
  }

  console.log(`\n${silinecekTeklifler.length} duplicate teklif silinecek...`)

  // Silme işlemi
  for (const teklifId of silinecekTeklifler) {
    try {
      // Cascade delete ile ilişkili kayıtlar da silinecek
      await prisma.teklif.delete({
        where: { id: teklifId },
      })
      console.log(`✓ Teklif silindi: ${teklifId}`)
    } catch (error) {
      console.error(`✗ Teklif silinemedi: ${teklifId}`, error)
    }
  }

  console.log(`\n✓ Toplam ${silinecekTeklifler.length} duplicate teklif temizlendi!`)
}

temizleDuplicateTeklifler()
  .catch((error) => {
    console.error('Hata:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





















