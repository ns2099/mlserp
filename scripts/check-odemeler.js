const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const odemeSayisi = await prisma.odeme.count()
    console.log(`Toplam ödeme kaydı: ${odemeSayisi}`)
    
    if (odemeSayisi === 0) {
      console.log('\n⚠️  Ödeme kaydı bulunmuyor!')
      console.log('Seed script\'ini çalıştırın: npx tsx prisma/seed.ts')
    } else {
      const odemeler = await prisma.odeme.findMany({
        take: 5,
        select: {
          tur: true,
          tutar: true,
          paraBirimi: true,
          odemeTarihi: true,
        },
        orderBy: {
          odemeTarihi: 'desc',
        },
      })
      
      console.log('\nSon 5 ödeme:')
      odemeler.forEach((o, i) => {
        console.log(`${i + 1}. ${o.tur} - ${o.tutar} ${o.paraBirimi} - ${o.odemeTarihi.toLocaleDateString('tr-TR')}`)
      })
      
      const gelenToplam = await prisma.odeme.aggregate({
        where: { tur: 'Gelen', paraBirimi: 'EUR' },
        _sum: { tutar: true },
      })
      
      const gidenToplam = await prisma.odeme.aggregate({
        where: { tur: 'Giden', paraBirimi: 'EUR' },
        _sum: { tutar: true },
      })
      
      console.log(`\nGelen ödemeler (EUR): ${gelenToplam._sum.tutar || 0}`)
      console.log(`Giden ödemeler (EUR): ${gidenToplam._sum.tutar || 0}`)
      console.log(`Net bakiye: ${(gelenToplam._sum.tutar || 0) - (gidenToplam._sum.tutar || 0)}`)
    }
  } catch (error) {
    console.error('Hata:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()





















