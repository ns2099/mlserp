import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Üretimde olan tüm kayıtlar siliniyor...')
  
  // Önce ilişkili kayıtları sil
  const uretimler = await prisma.uretim.findMany({
    where: { durum: 'Üretimde' },
    select: { id: true },
  })

  const uretimIds = uretimler.map((u) => u.id)

  if (uretimIds.length === 0) {
    console.log('Silinecek üretim kaydı bulunamadı.')
    return
  }

  console.log(`${uretimIds.length} adet üretim kaydı bulundu. Siliniyor...`)

  // İlişkili kayıtları sil
  await prisma.urunGideri.deleteMany({
    where: { uretimId: { in: uretimIds } },
  })

  await prisma.uretimGelisme.deleteMany({
    where: { uretimId: { in: uretimIds } },
  })

  await prisma.makinaAtama.deleteMany({
    where: { uretimId: { in: uretimIds } },
  })

  // Üretim kayıtlarını sil
  const result = await prisma.uretim.deleteMany({
    where: { durum: 'Üretimde' },
  })

  console.log(`${result.count} adet üretim kaydı başarıyla silindi.`)
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

