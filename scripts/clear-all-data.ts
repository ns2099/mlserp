import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Tüm yapay üretilen veriler temizleniyor...')
  
  try {
    // Tüm verileri sil (cascade ile otomatik silinecek, sıra önemli)
    await prisma.satinAlmaTeklif.deleteMany()
    await prisma.satinAlma.deleteMany()
    await prisma.uretimPlanlamaAdimi.deleteMany()
    await prisma.odeme.deleteMany()
    await prisma.sozlesme.deleteMany()
    await prisma.uretimGelisme.deleteMany()
    await prisma.urunGideri.deleteMany()
    await prisma.makinaAtama.deleteMany()
    await prisma.uretim.deleteMany()
    await prisma.planlama.deleteMany()
    await prisma.teklifUrun.deleteMany()
    await prisma.teklif.deleteMany()
    await prisma.duzenlemeGecmisi.deleteMany()
    await prisma.makinaBilesen.deleteMany()
    await prisma.makina.deleteMany()
    await prisma.yetkiliKisi.deleteMany()
    await prisma.firma.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Tüm yapay üretilen veriler başarıyla temizlendi!')
    console.log('\n📊 Veritabanı şu anda boş.')
    console.log('💡 Yeni veri eklemek için seed scriptini çalıştırabilirsiniz: npx tsx prisma/seed.ts')
  } catch (error) {
    console.error('❌ Hata:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()



