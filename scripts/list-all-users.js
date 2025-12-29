const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
      emailOnaylandiMi: true,
      yetki: true
    },
    orderBy: {
      username: 'asc'
    }
  })
  
  console.log('Tüm kullanıcılar:\n')
  console.log('Username'.padEnd(20), 'Email'.padEnd(30), 'Email Onayı'.padEnd(15), 'Yetki')
  console.log('-'.repeat(80))
  
  users.forEach(user => {
    console.log(
      user.username.padEnd(20),
      (user.email || 'N/A').padEnd(30),
      (user.emailOnaylandiMi ? '✅ Onaylı' : '❌ Onaysız').padEnd(15),
      user.yetki || 'N/A'
    )
  })
  
  console.log(`\nToplam ${users.length} kullanıcı bulundu.`)
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




