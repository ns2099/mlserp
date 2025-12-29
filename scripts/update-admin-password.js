const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Admin şifresi güncelleniyor...')
  
  const hashedPassword = await bcrypt.hash('mls123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      adSoyad: 'Admin Kullanıcı',
      yetki: 'Yönetici',
    },
  })

  console.log('✅ Admin şifresi güncellendi!')
  console.log('Kullanıcı Adı: admin')
  console.log('Şifre: mls123')
  
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })









