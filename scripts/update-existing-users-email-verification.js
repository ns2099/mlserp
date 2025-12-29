const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const usernames = ['meryem', 'admin', 'omer', 'zeynep', 'ural', 'irem']
  
  console.log('Mevcut kullanıcıların email onayını güncelleniyor...\n')
  
  for (const username of usernames) {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      })
      
      if (user) {
        await prisma.user.update({
          where: { username },
          data: {
            emailOnaylandiMi: true
          }
        })
        console.log(`✅ ${username} - Email onayı aktif edildi`)
      } else {
        console.log(`⚠️  ${username} - Kullanıcı bulunamadı`)
      }
    } catch (error) {
      console.error(`❌ ${username} - Hata:`, error.message)
    }
  }
  
  console.log('\n✅ Tüm kullanıcılar güncellendi!')
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

